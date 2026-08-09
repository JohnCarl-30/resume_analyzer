// Command gateway serves the Resume Analyzer API in Go.
//
// It is being built to parity with the existing Node/Express API, which
// continues to serve production until the port is complete. Routes appear in
// NewRouter as they are ported; anything not yet here answers 404.
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/JohnCarl-30/resume_analyzer/services/gateway/internal/jobapplication"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	if err := run(context.Background(), os.Getenv, logger); err != nil {
		logger.Error("service stopped", "error", err)
		os.Exit(1)
	}
}

func run(ctx context.Context, getenv func(string) string, logger *slog.Logger) error {
	cfg, err := LoadConfig(getenv)
	if err != nil {
		return err
	}

	deps := Deps{
		Applications: jobapplication.NewMemoryStore(),
		// Clerk verification is not wired up yet. A nil Verifier fails closed,
		// so every authenticated route answers 401 until it is.
		Verifier: nil,
		Logger:   logger,
	}

	server := &http.Server{
		Addr:    cfg.Addr,
		Handler: NewRouter(deps),
		// Guards against slowloris-style clients holding connections open.
		// No WriteTimeout: it would truncate long-running AI responses.
		ReadHeaderTimeout: 10 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()

	serveErr := make(chan error, 1)
	go func() {
		logger.Info("service listening", "addr", cfg.Addr)
		serveErr <- server.ListenAndServe()
	}()

	select {
	case err := <-serveErr:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return fmt.Errorf("listen on %s: %w", cfg.Addr, err)
	case <-ctx.Done():
		logger.Info("shutdown signal received", "drain_timeout", cfg.ShutdownTimeout.String())
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("graceful shutdown: %w", err)
	}

	logger.Info("service stopped cleanly")
	return nil
}
