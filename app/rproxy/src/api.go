package main

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type APIServer struct {
	proxy  *ReverseProxy
	logger *LogManager
	server *http.Server
	config ProxyConfig
}

func NewAPIServer(proxy *ReverseProxy, logger *LogManager, apiPort int) *APIServer {
	api := &APIServer{
		proxy:  proxy,
		logger: logger,
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/health", api.handleHealth)
	mux.HandleFunc("/config", api.handleConfig)
	mux.HandleFunc("/start", api.handleStart)
	mux.HandleFunc("/stop", api.handleStop)
	mux.HandleFunc("/status", api.handleStatus)
	mux.HandleFunc("/reload-cert", api.handleReloadCert)
	mux.HandleFunc("/logs", api.handleLogs)
	mux.HandleFunc("/logs/clear", api.handleClearLogs)

	api.server = &http.Server{
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go api.serve(apiPort)

	return api
}

func (api *APIServer) serve(port int) {
	addr := fmt.Sprintf("127.0.0.1:%d", port)
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		api.logger.Add("ERROR", fmt.Sprintf("API server listen failed: %v", err))
		return
	}
	api.logger.Add("INFO", fmt.Sprintf("API server listening on %s", addr))
	if err := api.server.Serve(listener); err != nil && err != http.ErrServerClosed {
		api.logger.Add("ERROR", fmt.Sprintf("API server error: %v", err))
	}
}

func (api *APIServer) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok",
		"time":   time.Now().Format("2006-01-02 15:04:05"),
	})
}

func (api *APIServer) handleConfig(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var cfg ProxyConfig
	if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
		http.Error(w, "invalid config", http.StatusBadRequest)
		return
	}

	api.config = cfg
	if cfg.GzipEnabled != api.proxy.config.GzipEnabled {
		api.proxy.config.GzipEnabled = cfg.GzipEnabled
	}
	if cfg.HstsEnabled != api.proxy.config.HstsEnabled {
		api.proxy.config.HstsEnabled = cfg.HstsEnabled
	}
	if cfg.Timeout > 0 {
		api.proxy.config.Timeout = cfg.Timeout
	}

	api.logger.Add("INFO", "配置已更新")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"config":  cfg,
	})
}

func (api *APIServer) handleStart(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var cfg ProxyConfig
	if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
		http.Error(w, "invalid config", http.StatusBadRequest)
		return
	}

	if api.proxy.running {
		api.proxy.Stop()
	}

	api.proxy.config = cfg
	err := api.proxy.Start()

	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		api.logger.Add("ERROR", fmt.Sprintf("启动失败: %v", err))
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "proxy started",
	})
}

func (api *APIServer) handleStop(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	err := api.proxy.Stop()

	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "proxy stopped",
	})
}

func (api *APIServer) handleStatus(w http.ResponseWriter, r *http.Request) {
	status := api.proxy.GetStatus()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

func (api *APIServer) handleReloadCert(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		CertPath string `json:"cert_path"`
		KeyPath  string `json:"key_path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	err := api.proxy.ReloadCert(req.CertPath, req.KeyPath)

	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "cert reloaded",
	})
}

func (api *APIServer) handleLogs(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	limit := 200
	if limitStr != "" {
		if n, err := strconv.Atoi(limitStr); err == nil && n > 0 {
			limit = n
		}
	}

	logs := api.logger.GetAll(limit)

	if strings.Contains(r.Header.Get("Accept"), "text/event-stream") {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "streaming unsupported", http.StatusInternalServerError)
			return
		}
		for _, entry := range logs {
			data, _ := json.Marshal(entry)
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"logs": logs,
	})
}

func (api *APIServer) handleClearLogs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	api.logger.Clear()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
	})
}
