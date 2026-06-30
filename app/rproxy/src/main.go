package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	apiPort := flag.Int("api-port", 0, "API 管理端口（默认自动分配）")
	flag.Parse()

	logger := NewLogManager(500)
	proxy := NewReverseProxy(ProxyConfig{
		BackendAddr: "http://127.0.0.1:5557",
		GzipEnabled: true,
		HstsEnabled: true,
		Timeout:     600,
	}, logger)

	var apiPortValue int
	if *apiPort > 0 {
		apiPortValue = *apiPort
	} else {
		apiPortValue = 0
	}

	NewAPIServer(proxy, logger, apiPortValue)

	fmt.Printf("fc-rproxy started (API port: %d)\n", apiPortValue)

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh

	fmt.Println("shutting down...")
	proxy.Stop()
}
