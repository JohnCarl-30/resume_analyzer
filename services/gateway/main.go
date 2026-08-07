// Command gateway is the Go front door for the Resume Analyzer API.
//
// It accepts every request and forwards anything it does not yet serve itself
// to the existing Node/Express API. Routes move from Node into Go one at a
// time; see README.md for the migration plan.
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
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	if err := run(context.Background(), os.Getenv, logger); err != nil {
		logger.Error("gateway stopped", "error", err)
		os.Exit(1)
	}
}

func run(ctx context.Context, getenv func(string) string, logger *slog.Logger) error {
	cfg, err := LoadConfig(getenv)
	if err != nil {
		return err
	}

	server := &http.Server{
		Addr:    cfg.Addr,
		Handler: NewRouter(cfg, logger),
		// Guards against slowloris-style clients holding connections open.
		// No WriteTimeout: it would truncate long-running AI responses.
		ReadHeaderTimeout: 10 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()

	serveErr := make(chan error, 1)
	go func() {
		logger.Info("gateway listening",
			"addr", cfg.Addr,
			"upstream", cfg.Upstream.String(),
		)
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

	logger.Info("gateway stopped cleanly")
	return nil
}
