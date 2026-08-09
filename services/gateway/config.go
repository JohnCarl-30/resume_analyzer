package main

import (
	"errors"
	"fmt"
	"time"
)

// Config is the service's runtime configuration.
//
// Everything is read from the environment so the same binary runs unchanged
// locally, in the container and in CI.
type Config struct {
	// Addr is the TCP address the service listens on.
	Addr string
	// ShutdownTimeout bounds how long in-flight requests get to drain on SIGTERM.
	ShutdownTimeout time.Duration
}

// LoadConfig builds a Config from getenv, applying defaults for anything unset.
//
// getenv is a parameter rather than a direct os.Getenv call so tests can supply
// an environment without mutating the process's.
func LoadConfig(getenv func(string) string) (Config, error) {
	shutdownTimeout, err := parseDuration(getenv("SHUTDOWN_TIMEOUT"), 15*time.Second)
	if err != nil {
		return Config{}, fmt.Errorf("SHUTDOWN_TIMEOUT: %w", err)
	}

	return Config{
		Addr:            ":" + valueOr(getenv("PORT"), "8080"),
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
