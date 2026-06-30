package main

type ProxyConfig struct {
	Domain       string `json:"domain"`
	Port         int    `json:"port"`
	CertPath     string `json:"cert_path"`
	KeyPath      string `json:"key_path"`
	BackendAddr  string `json:"backend_addr"`
	GzipEnabled  bool   `json:"gzip_enabled"`
	HstsEnabled  bool   `json:"hsts_enabled"`
	Timeout      int    `json:"timeout"`
}

type Status struct {
	Running   bool   `json:"running"`
	Domain    string `json:"domain"`
	Port      int    `json:"port"`
	StartedAt string `json:"started_at"`
}
