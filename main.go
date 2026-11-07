package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/elazarl/goproxy"
)

var (
	assetsBackend   = getenv("ASSETS_BACKEND", "assets1.xboxlive.cn")
	dlassetsBackend = getenv("DLASSETS_BACKEND", "dlassets.xboxlive.cn")
	listenAddress   = getenv("LISTEN_ADDRESS", "0.0.0.0")
	listenPort      = getenv("LISTEN_PORT", "8080")
)

var allowedHosts = map[string]bool{
	"assets1.xboxlive.com":   true,
	"assets2.xboxlive.com":   true,
	"d1.xboxlive.com":        true,
	"d2.xboxlive.com":        true,
	"xvcf1.xboxlive.com":     true,
	"xvcf2.xboxlive.com":     true,
	"dlassets.xboxlive.com":  true,
	"dlassets2.xboxlive.com": true,
}

var dlassetsHosts = map[string]bool{
	"dlassets.xboxlive.com":  true,
	"dlassets2.xboxlive.com": true,
}

type route struct {
	backend string
	host    string
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func routeFor(host string) (route, bool) {
	if !allowedHosts[host] {
		return route{}, false
	}

	if dlassetsHosts[host] {
		return route{backend: dlassetsBackend, host: "dlassets.xboxlive.cn"}, true
	}

	return route{backend: assetsBackend, host: "assets1.xboxlive.cn"}, true
}

func main() {
	proxy := goproxy.NewProxyHttpServer()

	proxy.OnRequest().HandleConnectFunc(func(host string, ctx *goproxy.ProxyCtx) (*goproxy.ConnectAction, string) {
		hostname := strings.TrimSuffix(strings.ToLower(host), ":80")

		matched, ok := routeFor(hostname)
		if !ok {
			return goproxy.OkConnect, host
		}

		ctx.UserData = matched
		return goproxy.HTTPMitmConnect, host
	})

	proxy.OnRequest().DoFunc(func(request *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
		matched, ok := ctx.UserData.(route)
		if !ok {
			return request, nil
		}

		log.Printf("%s%s -> %s", request.Host, request.URL.RequestURI(), matched.backend)

		request.Host = matched.host
		request.Header.Set("Host", matched.host)
		request.URL.Host = matched.backend
		return request, nil
	})

	address := listenAddress + ":" + listenPort
	log.Printf("listening %s", address)
	log.Fatal(http.ListenAndServe(address, proxy))
}
