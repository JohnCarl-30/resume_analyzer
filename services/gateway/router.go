package main

import (
	"log/slog"
	"net/http"
	"time"
)

// NewRouter builds the gateway's handler.
//
// Routes already migrated to Go are registered explicitly; the catch-all "/"
// pattern forwards everything else to the Node API. Migrating a route means
// registering it here — nothing else has to change.
func NewRouter(cfg Config, logger *slog.Logger) http.Handler {
	proxy := NewProxy(cfg.Upstream, cfg.UpstreamTimeout, logger)

	mux := http.NewServeMux()

	// Served by Go itself, never forwarded. Namespaced under /gateway so it
	// cannot collide with a route belonging to the API.
	mux.HandleFunc("GET /gateway/healthz", handleHealth)

	// Everything else is still Node's.
	mux.Handle("/", proxy)

	return withRequestLogging(mux, logger)
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}

// statusRecorder captures the response status for logging.
//
// It deliberately implements Flush and Unwrap: the API streams AI responses,
// and a ResponseWriter wrapper that swallows those would buffer the stream and
// break server-sent events without any error surfacing.
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func (r *statusRecorder) Flush() {
	if flusher, ok := r.ResponseWriter.(http.Flusher); ok {
		flusher.Flush()
	}
}

// Unwrap lets http.ResponseController reach the underlying writer.
func (r *statusRecorder) Unwrap() http.ResponseWriter {
	return r.ResponseWriter
}

func withRequestLogging(next http.Handler, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}

		next.ServeHTTP(recorder, r)

		logger.Info("request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", recorder.status,
			"duration_ms", time.Since(start).Milliseconds(),
		)
	})
}
