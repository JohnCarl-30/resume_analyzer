package main

import (
	"testing"
	"time"
)

func envFrom(values map[string]string) func(string) string {
	return func(key string) string { return values[key] }
}

func TestLoadConfigAppliesDefaults(t *testing.T) {
	cfg, err := LoadConfig(envFrom(nil))
	if err != nil {
		t.Fatalf("LoadConfig() error = %v, want nil", err)
	}

	if got, want := cfg.Addr, ":8080"; got != want {
		t.Errorf("Addr = %q, want %q", got, want)
	}
	if got, want := cfg.Upstream.String(), "http://127.0.0.1:4000"; got != want {
		t.Errorf("Upstream = %q, want %q", got, want)
	}
	if got, want := cfg.UpstreamTimeout, 30*time.Second; got != want {
		t.Errorf("UpstreamTimeout = %v, want %v", got, want)
	}
	if got, want := cfg.ShutdownTimeout, 15*time.Second; got != want {
		t.Errorf("ShutdownTimeout = %v, want %v", got, want)
	}
}

func TestLoadConfigReadsEnvironment(t *testing.T) {
	cfg, err := LoadConfig(envFrom(map[string]string{
		"PORT":             "9090",
		"UPSTREAM_URL":     "http://api:4000",
		"UPSTREAM_TIMEOUT": "45s",
		"SHUTDOWN_TIMEOUT": "5s",
	}))
	if err != nil {
		t.Fatalf("LoadConfig() error = %v, want nil", err)
	}

	if got, want := cfg.Addr, ":9090"; got != want {
		t.Errorf("Addr = %q, want %q", got, want)
	}
	if got, want := cfg.Upstream.Host, "api:4000"; got != want {
		t.Errorf("Upstream.Host = %q, want %q", got, want)
	}
	if got, want := cfg.UpstreamTimeout, 45*time.Second; got != want {
		t.Errorf("UpstreamTimeout = %v, want %v", got, want)
	}
	if got, want := cfg.ShutdownTimeout, 5*time.Second; got != want {
		t.Errorf("ShutdownTimeout = %v, want %v", got, want)
	}
}

func TestLoadConfigRejectsBadInput(t *testing.T) {
	tests := []struct {
		name string
		env  map[string]string
	}{
		{"upstream missing scheme", map[string]string{"UPSTREAM_URL": "api:4000"}},
		{"upstream missing host", map[string]string{"UPSTREAM_URL": "http://"}},
		{"upstream unparseable", map[string]string{"UPSTREAM_URL": "://nope"}},
		{"upstream timeout not a duration", map[string]string{"UPSTREAM_TIMEOUT": "soon"}},
		{"upstream timeout not positive", map[string]string{"UPSTREAM_TIMEOUT": "-1s"}},
		{"shutdown timeout zero", map[string]string{"SHUTDOWN_TIMEOUT": "0s"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if _, err := LoadConfig(envFrom(tt.env)); err == nil {
				t.Fatal("LoadConfig() error = nil, want an error")
			}
		})
	}
}
