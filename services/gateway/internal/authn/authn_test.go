package authn

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

func stubVerifier(validToken, userID string) Verifier {
	return VerifierFunc(func(_ context.Context, token string) (string, error) {
		if token == validToken {
			return userID, nil
		}
		return "", errors.New("invalid token")
	})
}

// captureUser records the identity the middleware resolved, if it ran at all.
func captureUser(seen *string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, _ := UserID(r.Context())
		*seen = userID
		w.WriteHeader(http.StatusOK)
	})
}

func TestRequireUserAcceptsValidToken(t *testing.T) {
	var seen string
	handler := RequireUser(stubVerifier("good-token", "user-1"))(captureUser(&seen))

	request := httptest.NewRequest(http.MethodGet, "/api/applications", nil)
	request.Header.Set("Authorization", "Bearer good-token")

	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if got, want := recorder.Code, http.StatusOK; got != want {
		t.Fatalf("status = %d, want %d", got, want)
	}
	if got, want := seen, "user-1"; got != want {
		t.Errorf("user on context = %q, want %q", got, want)
	}
}

func TestRequireUserRejectsBadRequests(t *testing.T) {
	tests := []struct {
		name       string
		authHeader string
	}{
		{"no header", ""},
		{"wrong scheme", "Basic abc123"},
		{"bearer with no token", "Bearer "},
		{"unknown token", "Bearer nope"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var seen string
			handler := RequireUser(stubVerifier("good-token", "user-1"))(captureUser(&seen))

			request := httptest.NewRequest(http.MethodGet, "/api/applications", nil)
			if tt.authHeader != "" {
				request.Header.Set("Authorization", tt.authHeader)
			}

			recorder := httptest.NewRecorder()
			handler.ServeHTTP(recorder, request)

			if got, want := recorder.Code, http.StatusUnauthorized; got != want {
				t.Errorf("status = %d, want %d", got, want)
			}
			if seen != "" {
				t.Errorf("handler ran with user %q, want it not to run", seen)
			}
		})
	}
}

// A nil verifier means authentication is unconfigured. It must reject
// everything rather than letting requests through unauthenticated.
func TestRequireUserFailsClosedWithoutVerifier(t *testing.T) {
	var seen string
	handler := RequireUser(nil)(captureUser(&seen))

	request := httptest.NewRequest(http.MethodGet, "/api/applications", nil)
	request.Header.Set("Authorization", "Bearer anything")

	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if got, want := recorder.Code, http.StatusUnauthorized; got != want {
		t.Errorf("status = %d, want %d", got, want)
	}
	if seen != "" {
		t.Errorf("handler ran with user %q, want it not to run", seen)
	}
}

func TestUserIDRejectsEmptyAndMissingValues(t *testing.T) {
	if _, ok := UserID(context.Background()); ok {
		t.Error("UserID(empty context) ok = true, want false")
	}
	if _, ok := UserID(WithUserID(context.Background(), "")); ok {
		t.Error("UserID(empty user) ok = true, want false")
	}
	if userID, ok := UserID(WithUserID(context.Background(), "user-1")); !ok || userID != "user-1" {
		t.Errorf("UserID() = %q, %v; want %q, true", userID, ok, "user-1")
	}
}
