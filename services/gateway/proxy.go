package main

import (
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"
)

// NewProxy returns a handler that forwards a request to upstream unchanged.
//
// The gateway begins life as a pure passthrough in front of the Node API.
// Routes are migrated into Go one at a time by registering them on the mux
// ahead of this handler (see NewRouter); anything not registered still reaches
// Node, so the two can run side by side indefinitely.
func NewProxy(upstream *url.URL, timeout time.Duration, logger *slog.Logger) *httputil.ReverseProxy {
	return &httputil.ReverseProxy{
		Rewrite: func(r *httputil.ProxyRequest) {
			r.SetURL(upstream)
			// Preserve the caller's Host. The Node API derives CORS origins and
			// absolute URLs from it, so rewriting it to the upstream host would
			// silently change those.
			r.Out.Host = r.In.Host
			r.SetXForwarded()
		},
		Transport: &http.Transport{
			Proxy:               http.ProxyFromEnvironment,
			MaxIdleConnsPerHost: 64,
			IdleConnTimeout:     90 * time.Second,
			// Bounds the wait for response headers only, not the body. A
			// read/write deadline would truncate slow AI responses mid-stream.
			ResponseHeaderTimeout: timeout,
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			logger.Error("upstream request failed",
				"method", r.Method,
				"path", r.URL.Path,
				"error", err,
			)
			http.Error(w, "upstream unavailable", http.StatusBadGateway)
		},
	}
}
