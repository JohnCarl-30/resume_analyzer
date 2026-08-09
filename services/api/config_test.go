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
	if got, want := cfg.ShutdownTimeout, 15*time.Second; got != want {
		t.Errorf("ShutdownTimeout = %v, want %v", got, want)
	}
}

func TestLoadConfigReadsEnvironment(t *testing.T) {
	cfg, err := LoadConfig(envFrom(map[string]string{
		"PORT":             "9090",
		"SHUTDOWN_TIMEOUT": "5s",
	}))
	if err != nil {
		t.Fatalf("LoadConfig() error = %v, want nil", err)
	}

	if got, want := cfg.Addr, ":9090"; got != want {
		t.Errorf("Addr = %q, want %q", got, want)
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
		{"shutdown timeout not a duration", map[string]string{"SHUTDOWN_TIMEOUT": "soon"}},
		{"shutdown timeout not positive", map[string]string{"SHUTDOWN_TIMEOUT": "-1s"}},
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
