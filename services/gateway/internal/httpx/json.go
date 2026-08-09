// Package httpx holds the small HTTP helpers shared by the service's handlers.
//
// The response envelopes here deliberately match the ones the Express API
// produced, so the web app needs no changes when traffic moves to Go.
package httpx

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

// Data is the success envelope: {"data": ...}.
type Data struct {
	Value any `json:"data"`
}

// Error is the failure envelope: {"error": "..."} with optional details.
type Error struct {
	Message string `json:"error"`
	Details any    `json:"details,omitempty"`
}

// WriteJSON writes payload as JSON with the given status. A nil payload writes
// the status line and nothing else.
func WriteJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if payload == nil {
		return
	}

	if err := json.NewEncoder(w).Encode(payload); err != nil {
		// The status and some bytes may already be on the wire, so there is
		// nothing to salvage — record it and move on.
		slog.Error("write json response", "error", err)
	}
}

// WriteData writes payload inside the success envelope.
func WriteData(w http.ResponseWriter, status int, payload any) {
	WriteJSON(w, status, Data{Value: payload})
}

// WriteError writes message inside the failure envelope.
func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, Error{Message: message})
}

// WriteErrorDetails writes a failure with structured details, used for
// validation failures.
func WriteErrorDetails(w http.ResponseWriter, status int, message string, details any) {
	WriteJSON(w, status, Error{Message: message, Details: details})
}
