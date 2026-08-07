package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
)

// countingUpstream reports how many requests actually reached Node.
func countingUpstream(t *testing.T, hits *atomic.Int64) string {
	t.Helper()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		hits.Add(1)
		w.WriteHeader(http.StatusOK)
		_, _ = io.WriteString(w, "from node")
	}))
	t.Cleanup(server.Close)
	return server.URL
}

func TestHealthIsServedByTheGatewayItself(t *testing.T) {
	var hits atomic.Int64
	gatewayURL := newTestGateway(t, countingUpstream(t, &hits))

	resp, err := http.Get(gatewayURL + "/gateway/healthz")
	if err != nil {
		t.Fatalf("request health: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusOK)
	}

	var payload struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		t.Fatalf("decode health payload: %v", err)
	}
	if payload.Status != "ok" {
		t.Errorf("status field = %q, want %q", payload.Status, "ok")
	}

	if got := hits.Load(); got != 0 {
		t.Errorf("upstream received %d requests, want 0", got)
	}
}

func TestUnmigratedRoutesReachNode(t *testing.T) {
	var hits atomic.Int64
	gatewayURL := newTestGateway(t, countingUpstream(t, &hits))

	for _, path := range []string{"/api/resumes", "/api/enhance", "/"} {
		resp, err := http.Get(gatewayURL + path)
		if err != nil {
			t.Fatalf("request %s: %v", path, err)
		}
		resp.Body.Close()
	}

	if got, want := hits.Load(), int64(3); got != want {
		t.Errorf("upstream received %d requests, want %d", got, want)
	}
}

// The health route is registered for GET only, so any other method is still
// Node's problem. This documents the ServeMux pattern semantics we rely on.
func TestNonGetHealthIsProxied(t *testing.T) {
	var hits atomic.Int64
	gatewayURL := newTestGateway(t, countingUpstream(t, &hits))

	resp, err := http.Post(gatewayURL+"/gateway/healthz", "application/json", nil)
	if err != nil {
		t.Fatalf("post health: %v", err)
	}
	defer resp.Body.Close()

	if got, want := hits.Load(), int64(1); got != want {
		t.Errorf("upstream received %d requests, want %d", got, want)
	}
}
