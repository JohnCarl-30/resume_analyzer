package main

import (
	"errors"
	"fmt"
	"net/url"
	"time"
)

// Config is the gateway's runtime configuration.
//
// Everything is read from the environment so the same binary runs unchanged
// locally, in the container and in CI.
type Config struct {
	// Addr is the TCP address the gateway listens on.
	Addr string
	// Upstream is the Node API that not-yet-migrated routes are forwarded to.
	Upstream *url.URL
	// UpstreamTimeout bounds how long a single proxied request may wait for
	// response headers from Node.
	UpstreamTimeout time.Duration
	// ShutdownTimeout bounds how long in-flight requests get to drain on SIGTERM.
	ShutdownTimeout time.Duration
}

// LoadConfig builds a Config from getenv, applying defaults for anything unset.
//
// getenv is a parameter rather than a direct os.Getenv call so tests can supply
// an environment without mutating the process's.
func LoadConfig(getenv func(string) string) (Config, error) {
	rawUpstream := valueOr(getenv("UPSTREAM_URL"), "http://127.0.0.1:4000")
	upstream, err := url.Parse(rawUpstream)
	if err != nil {
		return Config{}, fmt.Errorf("parse UPSTREAM_URL %q: %w", rawUpstream, err)
	}
	if upstream.Scheme == "" || upstream.Host == "" {
		return Config{}, fmt.Errorf(
			"UPSTREAM_URL %q must be absolute, e.g. http://127.0.0.1:4000", rawUpstream)
	}

	upstreamTimeout, err := parseDuration(getenv("UPSTREAM_TIMEOUT"), 30*time.Second)
	if err != nil {
		return Config{}, fmt.Errorf("UPSTREAM_TIMEOUT: %w", err)
	}

	shutdownTimeout, err := parseDuration(getenv("SHUTDOWN_TIMEOUT"), 15*time.Second)
	if err != nil {
		return Config{}, fmt.Errorf("SHUTDOWN_TIMEOUT: %w", err)
	}

	return Config{
		Addr:            ":" + valueOr(getenv("PORT"), "8080"),
		Upstream:        upstream,
		UpstreamTimeout: upstreamTimeout,
		ShutdownTimeout: shutdownTimeout,
	}, nil
}

func valueOr(value, fallback string) string {
	if value == "" {
		return fallback
	}
	return value
}

func parseDuration(raw string, fallback time.Duration) (time.Duration, error) {
	if raw == "" {
		return fallback, nil
	}
	parsed, err := time.ParseDuration(raw)
	if err != nil {
		return 0, err
	}
	if parsed <= 0 {
		return 0, errors.New("must be positive")
	}
	return parsed, nil
}
