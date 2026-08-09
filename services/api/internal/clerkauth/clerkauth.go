// Package clerkauth verifies Clerk session tokens.
package clerkauth

import (
	"context"
	"errors"
	"fmt"
	"slices"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
)

// Verifier turns a Clerk session token into the user ID it belongs to.
type Verifier struct {
	authorizedParties []string
}

// New configures Clerk with secretKey and returns a Verifier that accepts
// tokens issued to any of authorizedParties.
//
// The Clerk SDK keeps its credentials in a package-level global, so calling New
// twice with different keys reconfigures the whole process.
func New(secretKey string, authorizedParties []string) (*Verifier, error) {
	if secretKey == "" {
		return nil, errors.New("clerkauth: secret key is empty")
	}

	clerk.SetKey(secretKey)
	return &Verifier{authorizedParties: authorizedParties}, nil
}

// VerifyToken verifies token and returns its subject.
func (v *Verifier) VerifyToken(ctx context.Context, token string) (string, error) {
	claims, err := jwt.Verify(ctx, &jwt.VerifyParams{
		Token:                  token,
		AuthorizedPartyHandler: v.allowAuthorizedParty,
	})
	if err != nil {
		return "", fmt.Errorf("verify clerk token: %w", err)
	}

	if claims.Subject == "" {
		return "", errors.New("clerkauth: token has no subject")
	}

	return claims.Subject, nil
}

// allowAuthorizedParty enforces the origin allowlist, but only for tokens that
// actually carry an azp claim.
//
// Clerk omits azp on session tokens minted during top-level navigations, and
// the SDK invokes this handler even then — with an empty string. Rejecting
// those would sign users out mid-navigation, so an absent azp is allowed
// through and only a present-but-unknown one is refused.
func (v *Verifier) allowAuthorizedParty(azp string) bool {
	if azp == "" || len(v.authorizedParties) == 0 {
		return true
	}
	return slices.Contains(v.authorizedParties, azp)
}
