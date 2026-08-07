package main

import (
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func discardLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}

// newTestGateway starts a gateway in front of upstreamURL and returns its base URL.
func newTestGateway(t *testing.T, upstreamURL string) string {
	t.Helper()

	cfg, err := LoadConfig(envFrom(map[string]string{"UPSTREAM_URL": upstreamURL}))
	if err != nil {
		t.Fatalf("LoadConfig() error = %v", err)
	}

	gateway := httptest.NewServer(NewRouter(cfg, discardLogger()))
	t.Cleanup(gateway.Close)
	return gateway.URL
}

func TestProxyForwardsRequestToUpstream(t *testing.T) {
	var (
		gotMethod string
		gotPath   string
		gotQuery  string
		gotBody   string
		gotHeader http.Header
	)

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Errorf("upstream read body: %v", err)
		}
		gotMethod, gotPath, gotQuery = r.Method, r.URL.Path, r.URL.RawQuery
		gotBody, gotHeader = string(body), r.Header.Clone()

		w.Header().Set("X-Upstream", "node")
		w.WriteHeader(http.StatusCreated)
		_, _ = io.WriteString(w, `{"ok":true}`)
	}))
	t.Cleanup(upstream.Close)

	gatewayURL := newTestGateway(t, upstream.URL)

	req, err := http.NewRequest(
		http.MethodPost,
		gatewayURL+"/api/applications?status=applied",
		strings.NewReader(`{"company":"Acme"}`),
	)
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	req.Header.Set("Authorization", "Bearer token-123")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("request through gateway: %v", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read response: %v", err)
	}

	if gotMethod != http.MethodPost {
		t.Errorf("upstream method = %q, want POST", gotMethod)
	}
	if want := "/api/applications"; gotPath != want {
		t.Errorf("upstream path = %q, want %q", gotPath, want)
	}
	if want := "status=applied"; gotQuery != want {
		t.Errorf("upstream query = %q, want %q", gotQuery, want)
	}
	if want := `{"company":"Acme"}`; gotBody != want {
		t.Errorf("upstream body = %q, want %q", gotBody, want)
	}
	if want := "Bearer token-123"; gotHeader.Get("Authorization") != want {
		t.Errorf("upstream Authorization = %q, want %q", gotHeader.Get("Authorization"), want)
	}
	if gotHeader.Get("X-Forwarded-For") == "" {
		t.Error("upstream X-Forwarded-For is empty, want the client address")
	}
	if gotHeader.Get("X-Forwarded-Proto") == "" {
		t.Error("upstream X-Forwarded-Proto is empty, want the client scheme")
	}

	if resp.StatusCode != http.StatusCreated {
		t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusCreated)
	}
	if got, want := resp.Header.Get("X-Upstream"), "node"; got != want {
		t.Errorf("X-Upstream = %q, want %q", got, want)
	}
	if got, want := string(respBody), `{"ok":true}`; got != want {
		t.Errorf("body = %q, want %q", got, want)
	}
}

func TestProxyReturnsBadGatewayWhenUpstreamIsDown(t *testing.T) {
	// Bind then immediately release a port so nothing is listening on it.
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("reserve port: %v", err)
	}
	deadAddr := listener.Addr().String()
	if err := listener.Close(); err != nil {
		t.Fatalf("release port: %v", err)
	}

	gatewayURL := newTestGateway(t, "http://"+deadAddr)

	resp, err := http.Get(gatewayURL + "/api/anything")
	if err != nil {
		t.Fatalf("request through gateway: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadGateway {
		t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusBadGateway)
	}
}

// TestProxyDoesNotBufferStreams guards the Flush passthrough in statusRecorder:
// the API streams AI responses, and buffering them would break SSE silently.
func TestProxyDoesNotBufferStreams(t *testing.T) {
	release := make(chan struct{})

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		_, _ = io.WriteString(w, "data: first\n\n")
		w.(http.Flusher).Flush()

		// Held open until the client has proven it received the first chunk.
		<-release
		_, _ = io.WriteString(w, "data: second\n\n")
	}))
	// Cleanups run LIFO, so the upstream handler is released before the server
	// it belongs to is closed.
	t.Cleanup(upstream.Close)
	t.Cleanup(func() { close(release) })

	gatewayURL := newTestGateway(t, upstream.URL)

	resp, err := http.Get(gatewayURL + "/api/analysis/stream")
	if err != nil {
		t.Fatalf("request through gateway: %v", err)
	}
	defer resp.Body.Close()

	want := "data: first\n\n"
	buf := make([]byte, len(want))
	if _, err := io.ReadFull(resp.Body, buf); err != nil {
		t.Fatalf("read first chunk: %v", err)
	}
	if got := string(buf); got != want {
		t.Errorf("first chunk = %q, want %q", got, want)
	}
	// Arriving here while the upstream is still blocked proves the gateway
	// forwarded the chunk instead of buffering the whole response.
}
