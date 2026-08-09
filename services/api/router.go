package main

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/JohnCarl-30/resume_analyzer/services/api/internal/authn"
	"github.com/JohnCarl-30/resume_analyzer/services/api/internal/httpx"
	"github.com/JohnCarl-30/resume_analyzer/services/api/internal/jobapplication"
)

// Deps are the collaborators NewRouter needs.
type Deps struct {
	Applications jobapplication.Store
	Verifier     authn.Verifier
	Logger       *slog.Logger
}

// NewRouter builds the service's handler.
//
// Routes appear here as they are ported from the Express API. Until the port
// reaches parity Express still serves production, so anything not yet
// registered simply 404s rather than being forwarded anywhere.
func NewRouter(deps Deps) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", handleHealth)

	jobapplication.NewHandler(deps.Applications).
		Register(mux, authn.RequireUser(deps.Verifier))

	mux.HandleFunc("/", handleNotFound)

	return withRequestLogging(mux, deps.Logger)
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	httpx.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func handleNotFound(w http.ResponseWriter, _ *http.Request) {
	httpx.WriteError(w, http.StatusNotFound, "Not found")
}

// statusRecorder captures the response status for logging.
//
// It deliberately implements Flush and Unwrap: the API streams AI responses,
// and a ResponseWriter wrapper that swallowed those would buffer the stream and
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
