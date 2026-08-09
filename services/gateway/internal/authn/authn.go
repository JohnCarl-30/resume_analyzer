// Package authn resolves the caller's identity from a bearer token.
package authn

import (
	"context"
	"net/http"
	"strings"

	"github.com/JohnCarl-30/resume_analyzer/services/gateway/internal/httpx"
)

// UnauthorizedMessage matches the wording the Express API used, so the web
// app's existing handling keeps working after cutover.
const UnauthorizedMessage = "Sign in to check your resume."

// Verifier turns a bearer token into a user ID.
type Verifier interface {
	VerifyToken(ctx context.Context, token string) (string, error)
}

// VerifierFunc adapts an ordinary function to Verifier.
type VerifierFunc func(ctx context.Context, token string) (string, error)

// VerifyToken implements Verifier.
func (f VerifierFunc) VerifyToken(ctx context.Context, token string) (string, error) {
	return f(ctx, token)
}

type contextKey struct{}

// WithUserID returns a copy of ctx carrying the authenticated user ID.
func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, contextKey{}, userID)
}

// UserID reports the authenticated user ID carried by ctx.
func UserID(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(contextKey{}).(string)
	return userID, ok && userID != ""
}

// RequireUser rejects requests without a valid bearer token, and stores the
// resolved user ID on the request context for downstream handlers.
//
// A nil verifier fails closed: every request is rejected. That is deliberate —
// a deployment with authentication unconfigured must not serve user data.
func RequireUser(verifier Verifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, ok := bearerToken(r)
			if !ok || verifier == nil {
				httpx.WriteError(w, http.StatusUnauthorized, UnauthorizedMessage)
				return
			}

			userID, err := verifier.VerifyToken(r.Context(), token)
			if err != nil || userID == "" {
				httpx.WriteError(w, http.StatusUnauthorized, UnauthorizedMessage)
				return
			}

			next.ServeHTTP(w, r.WithContext(WithUserID(r.Context(), userID)))
		})
	}
}

func bearerToken(r *http.Request) (string, bool) {
	const prefix = "Bearer "

	header := r.Header.Get("Authorization")
	if !strings.HasPrefix(header, prefix) {
		return "", false
	}

	token := strings.TrimSpace(strings.TrimPrefix(header, prefix))
	return token, token != ""
}
