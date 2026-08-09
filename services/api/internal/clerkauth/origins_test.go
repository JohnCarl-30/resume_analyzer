package clerkauth

import (
	"slices"
	"testing"
)

func TestResolveOriginsAlwaysTrustsProduction(t *testing.T) {
	resolved := ResolveOrigins("https://staging.example")

	for _, origin := range productionOrigins {
		if !slices.Contains(resolved, origin) {
			t.Errorf("resolved = %v, want it to contain %q", resolved, origin)
		}
	}
	if !slices.Contains(resolved, "https://staging.example") {
		t.Errorf("resolved = %v, want it to contain the configured origin", resolved)
	}
}

func TestResolveOriginsDefaultsToLocalhost(t *testing.T) {
	for _, appOrigin := range []string{"", "   ", ",, ,"} {
		resolved := ResolveOrigins(appOrigin)

		if !slices.Contains(resolved, defaultOrigin) {
			t.Errorf("ResolveOrigins(%q) = %v, want it to contain %q", appOrigin, resolved, defaultOrigin)
		}
	}
}

// Next.js falls back to :3001 when :3000 is taken, so local development has to
// tolerate either port on either hostname.
func TestResolveOriginsCoversLocalPortFallback(t *testing.T) {
	resolved := ResolveOrigins("http://localhost:3000")

	for _, origin := range []string{
		"http://localhost:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3000",
		"http://127.0.0.1:3001",
	} {
		if !slices.Contains(resolved, origin) {
			t.Errorf("resolved = %v, want it to contain %q", resolved, origin)
		}
	}
}

func TestResolveOriginsSkipsLocalFallbackForRemotePrimary(t *testing.T) {
	resolved := ResolveOrigins("https://resumae.tech")

	if slices.Contains(resolved, "http://localhost:3001") {
		t.Errorf("resolved = %v, want no local fallback for a remote primary origin", resolved)
	}
}

func TestResolveOriginsSplitsAndDeduplicates(t *testing.T) {
	resolved := ResolveOrigins(" https://a.example , https://b.example ,https://a.example ")

	var count int
	for _, origin := range resolved {
		if origin == "https://a.example" {
			count++
		}
	}
	if count != 1 {
		t.Errorf("https://a.example appears %d times in %v, want 1", count, resolved)
	}
	if !slices.Contains(resolved, "https://b.example") {
		t.Errorf("resolved = %v, want it to contain https://b.example", resolved)
	}
}
