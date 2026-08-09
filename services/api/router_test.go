package main

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/JohnCarl-30/resume_analyzer/services/api/internal/jobapplication"
)

func newTestRouter() http.Handler {
	return NewRouter(Deps{
		Applications: jobapplication.NewMemoryStore(),
		// Matches production wiring today: authentication is not configured, so
		// the middleware must fail closed.
		Verifier: nil,
		Logger:   slog.New(slog.NewTextHandler(io.Discard, nil)),
	})
}

func TestHealthReportsOK(t *testing.T) {
	recorder := httptest.NewRecorder()
	newTestRouter().ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/healthz", nil))

	if got, want := recorder.Code, http.StatusOK; got != want {
		t.Fatalf("status = %d, want %d", got, want)
	}

	var payload struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatalf("decode health payload: %v", err)
	}
	if payload.Status != "ok" {
		t.Errorf("status field = %q, want %q", payload.Status, "ok")
	}
}

func TestUnportedRoutesReturnNotFound(t *testing.T) {
	router := newTestRouter()

	// These still live in the Express API; this service does not forward.
	for _, path := range []string{"/api/resumes", "/api/enhance", "/"} {
		t.Run(path, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, path, nil))

			if got, want := recorder.Code, http.StatusNotFound; got != want {
				t.Errorf("status = %d, want %d", got, want)
			}
		})
	}
}

func TestApplicationRoutesRejectAnonymousCallers(t *testing.T) {
	router := newTestRouter()

	tests := []struct {
		method string
		path   string
	}{
		{http.MethodGet, "/api/applications"},
		{http.MethodPost, "/api/applications"},
		{http.MethodGet, "/api/applications/abc"},
		{http.MethodPatch, "/api/applications/abc"},
		{http.MethodDelete, "/api/applications/abc"},
	}

	for _, tt := range tests {
		t.Run(tt.method+" "+tt.path, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, httptest.NewRequest(tt.method, tt.path, nil))

			if got, want := recorder.Code, http.StatusUnauthorized; got != want {
				t.Errorf("status = %d, want %d", got, want)
			}
		})
	}
}
