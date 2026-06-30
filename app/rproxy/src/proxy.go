package main

import (
	"bytes"
	"compress/gzip"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"sync"
	"time"
)

type ReverseProxy struct {
	config    ProxyConfig
	server    *http.Server
	tlsConfig *tls.Config
	transport *http.Transport
	logger    *LogManager
	listener  net.Listener
	startedAt time.Time
	running   bool
}

func NewReverseProxy(cfg ProxyConfig, logger *LogManager) *ReverseProxy {
	return &ReverseProxy{
		config: cfg,
		logger: logger,
		transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 20,
			IdleConnTimeout:     90 * time.Second,
			DisableCompression:  false,
			ForceAttemptHTTP2:   true,
		},
	}
}

func (rp *ReverseProxy) Start() error {
	if rp.running {
		return fmt.Errorf("proxy already running")
	}

	backendURL, err := url.Parse(rp.config.BackendAddr)
	if err != nil {
		return fmt.Errorf("invalid backend addr: %v", err)
	}

	proxy := httputil.NewSingleHostReverseProxy(backendURL)
	proxy.Transport = rp.transport
	proxy.FlushInterval = 100 * time.Millisecond

	director := proxy.Director
	proxy.Director = func(req *http.Request) {
		director(req)
		req.Header.Set("X-Forwarded-For", getClientIP(req))
		req.Header.Set("X-Forwarded-Proto", "https")
		req.Header.Set("X-Real-IP", getClientIP(req))
		if host := req.Header.Get("Host"); host != "" {
			req.Header.Set("X-Forwarded-Host", host)
		}
	}

	modifyResponse := proxy.ModifyResponse
	proxy.ModifyResponse = func(resp *http.Response) error {
		if modifyResponse != nil {
			if err := modifyResponse(resp); err != nil {
				return err
			}
		}

		if rp.config.HstsEnabled {
			resp.Header.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}

		resp.Header.Del("Transfer-Encoding")
		resp.Header.Del("Connection")

		if rp.config.GzipEnabled && shouldGzip(resp) {
			return gzipResponse(resp)
		}

		return nil
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		proxy.ServeHTTP(w, r)
	})

	rp.server = &http.Server{
		Handler:      mux,
		ReadTimeout:  time.Duration(rp.config.Timeout) * time.Second,
		WriteTimeout: time.Duration(rp.config.Timeout) * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	cert, err := tls.LoadX509KeyPair(rp.config.CertPath, rp.config.KeyPath)
	if err != nil {
		return fmt.Errorf("load cert failed: %v", err)
	}

	rp.tlsConfig = &tls.Config{
		Certificates: []tls.Certificate{cert},
		MinVersion:   tls.VersionTLS12,
	}

	addr := fmt.Sprintf("0.0.0.0:%d", rp.config.Port)
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("listen failed: %v", err)
	}

	rp.listener = listener
	rp.running = true
	rp.startedAt = time.Now()

	rp.logger.Add("INFO", fmt.Sprintf("反向代理已启动: https://%s:%d", rp.config.Domain, rp.config.Port))
	rp.logger.Add("INFO", fmt.Sprintf("后端地址: %s", rp.config.BackendAddr))

	go rp.serve()

	return nil
}

func (rp *ReverseProxy) serve() {
	defer func() {
		rp.running = false
	}()

	for {
		conn, err := rp.listener.Accept()
		if err != nil {
			if !rp.running {
				return
			}
			rp.logger.Add("ERROR", fmt.Sprintf("accept error: %v", err))
			continue
		}
		go rp.handleConn(conn)
	}
}

func (rp *ReverseProxy) handleConn(conn net.Conn) {
	defer conn.Close()

	conn.SetReadDeadline(time.Now().Add(5 * time.Second))
	peek := make([]byte, 1)
	_, err := conn.Read(peek)
	if err != nil {
		return
	}
	conn.SetReadDeadline(time.Time{})

	if peek[0] == 0x16 {
		tlsConn := tls.Server(&peekConn{Conn: conn, peek: peek}, rp.tlsConfig)
		if err := tlsConn.Handshake(); err != nil {
			rp.logger.Add("ERROR", fmt.Sprintf("TLS handshake failed: %v", err))
			return
		}

		var wg sync.WaitGroup
		wg.Add(1)

		wrappedConn := &waitCloseConn{
			Conn:   tlsConn,
			closer: &wg,
		}

		listener := &singleConnListener{conn: wrappedConn}
		rp.server.Serve(listener)

		wg.Wait()
	} else {
		rp.handleHTTPRedirect(&peekConn{Conn: conn, peek: peek}, nil)
	}
}

type peekConn struct {
	net.Conn
	peek    []byte
	peekIdx int
}

func (c *peekConn) Read(b []byte) (int, error) {
	if c.peekIdx < len(c.peek) {
		n := copy(b, c.peek[c.peekIdx:])
		c.peekIdx += n
		return n, nil
	}
	return c.Conn.Read(b)
}

type singleConnListener struct {
	conn net.Conn
	done bool
}

func (l *singleConnListener) Accept() (net.Conn, error) {
	if l.done {
		return nil, fmt.Errorf("closed")
	}
	l.done = true
	return l.conn, nil
}

func (l *singleConnListener) Close() error   { return nil }
func (l *singleConnListener) Addr() net.Addr { return l.conn.LocalAddr() }

type waitCloseConn struct {
	net.Conn
	closer    *sync.WaitGroup
	closeOnce sync.Once
}

func (c *waitCloseConn) Close() error {
	err := c.Conn.Close()
	c.closeOnce.Do(func() {
		c.closer.Done()
	})
	return err
}

func (rp *ReverseProxy) handleHTTPRedirect(conn net.Conn, _ []byte) {
	buf := make([]byte, 4096)
	n, _ := conn.Read(buf)

	path := "/"
	lines := strings.Split(string(buf[:n]), "\r\n")
	for _, line := range lines {
		parts := strings.Fields(line)
		if len(parts) >= 2 && (parts[0] == "GET" || parts[0] == "POST" || parts[0] == "HEAD") {
			path = parts[1]
			break
		}
	}

	redirectURL := fmt.Sprintf("https://%s:%d%s", rp.config.Domain, rp.config.Port, path)
	response := fmt.Sprintf(
		"HTTP/1.1 301 Moved Permanently\r\n"+
			"Location: %s\r\n"+
			"Content-Length: 0\r\n"+
			"Connection: close\r\n"+
			"Server: fc-rproxy\r\n"+
			"\r\n",
		redirectURL,
	)
	conn.Write([]byte(response))
}

func (rp *ReverseProxy) Stop() error {
	if !rp.running {
		return nil
	}
	rp.running = false
	if rp.listener != nil {
		rp.listener.Close()
	}
	if rp.server != nil {
		rp.server.Close()
	}
	rp.logger.Add("INFO", "反向代理已停止")
	return nil
}

func (rp *ReverseProxy) ReloadCert(certPath, keyPath string) error {
	cert, err := tls.LoadX509KeyPair(certPath, keyPath)
	if err != nil {
		return fmt.Errorf("load cert failed: %v", err)
	}
	rp.tlsConfig.Certificates = []tls.Certificate{cert}
	rp.config.CertPath = certPath
	rp.config.KeyPath = keyPath
	rp.logger.Add("INFO", "SSL 证书已热重载")
	return nil
}

func (rp *ReverseProxy) GetStatus() Status {
	return Status{
		Running:   rp.running,
		Domain:    rp.config.Domain,
		Port:      rp.config.Port,
		StartedAt: rp.startedAt.Format("2006-01-02 15:04:05"),
	}
}

func getClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			return strings.TrimSpace(parts[0])
		}
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

var gzipContentTypes = map[string]bool{
	"text/html":              true,
	"text/plain":             true,
	"text/css":               true,
	"text/javascript":        true,
	"application/javascript": true,
	"application/json":       true,
	"application/xml":        true,
	"text/xml":               true,
	"image/svg+xml":          true,
}

func shouldGzip(resp *http.Response) bool {
	if resp.Header.Get("Content-Encoding") != "" {
		return false
	}
	ct := resp.Header.Get("Content-Type")
	ct = strings.Split(ct, ";")[0]
	ct = strings.TrimSpace(strings.ToLower(ct))
	return gzipContentTypes[ct]
}

func gzipResponse(resp *http.Response) error {
	body, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		return err
	}

	if len(body) < 500 {
		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		return nil
	}

	var buf bytes.Buffer
	gz := gzip.NewWriter(&buf)
	if _, err := gz.Write(body); err != nil {
		gz.Close()
		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		return nil
	}
	gz.Close()

	resp.Body = io.NopCloser(&buf)
	resp.ContentLength = int64(buf.Len())
	resp.Header.Set("Content-Encoding", "gzip")
	resp.Header.Del("Content-Length")
	return nil
}
