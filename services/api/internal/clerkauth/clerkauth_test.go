package clerkauth

import "testing"

func TestNewRejectsAnEmptySecretKey(t *testing.T) {
	if _, err := New("", nil); err == nil {
		t.Fatal("New() error = nil, want an error")
	}
}

// The SDK calls the authorized-party handler for every token, including ones
// with no azp claim. Rejecting those would sign users out during top-level
// navigations, which is the whole reason this handler is hand-written.
func TestAllowAuthorizedParty(t *testing.T) {
	tests := []struct {
		name     string
		parties  []string
		azp      string
		wantPass bool
	}{
		{"absent azp is allowed", []string{"https://resumae.tech"}, "", true},
		{"known azp is allowed", []string{"https://resumae.tech"}, "https://resumae.tech", true},
		{"unknown azp is refused", []string{"https://resumae.tech"}, "https://evil.example", false},
		{"no allowlist permits anything", nil, "https://evil.example", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			verifier := &Verifier{authorizedParties: tt.parties}

			if got := verifier.allowAuthorizedParty(tt.azp); got != tt.wantPass {
				t.Errorf("allowAuthorizedParty(%q) = %v, want %v", tt.azp, got, tt.wantPass)
			}
		})
	}
}
