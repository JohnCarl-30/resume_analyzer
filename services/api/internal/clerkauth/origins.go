package clerkauth

import "strings"

// productionOrigins are always trusted, whatever APP_ORIGIN says.
var productionOrigins = []string{
	"https://resumae.tech",
	"https://www.resumae.tech",
	"https://resume-analyzer-chi-gray.vercel.app",
}

const defaultOrigin = "http://localhost:3000"

// ResolveOrigins builds the allowlist for Clerk's azp claim from a
// comma-separated APP_ORIGIN value.
//
// Production origins are always included. When the primary configured origin is
// local, localhost and 127.0.0.1 are allowed on both 3000 and 3001, because
// Next.js falls back to 3001 when 3000 is already taken.
func ResolveOrigins(appOrigin string) []string {
	var configured []string
	for _, value := range strings.Split(appOrigin, ",") {
		if trimmed := strings.TrimSpace(value); trimmed != "" {
			configured = append(configured, trimmed)
		}
	}

	seen := make(map[string]bool)
	resolved := make([]string, 0, len(configured)+len(productionOrigins)+4)
	add := func(origin string) {
		if !seen[origin] {
			seen[origin] = true
			resolved = append(resolved, origin)
		}
	}

	if len(configured) == 0 {
		add(defaultOrigin)
	}
	for _, origin := range configured {
		add(origin)
	}
	for _, origin := range productionOrigins {
		add(origin)
	}

	primary := defaultOrigin
	if len(configured) > 0 {
		primary = configured[0]
	}
	if strings.HasPrefix(primary, "http://localhost") || strings.HasPrefix(primary, "http://127.0.0.1") {
		for _, host := range []string{"localhost", "127.0.0.1"} {
			add("http://" + host + ":3000")
			add("http://" + host + ":3001")
		}
	}

	return resolved
}
