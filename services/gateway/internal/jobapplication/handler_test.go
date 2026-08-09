package jobapplication

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/JohnCarl-30/resume_analyzer/services/gateway/internal/authn"
)

const (
	userOneToken = "user-1-token"
	userTwoToken = "user-2-token"
)

func newTestAPI(t *testing.T) *httptest.Server {
	t.Helper()

	verifier := authn.VerifierFunc(func(_ context.Context, token string) (string, error) {
		switch token {
		case userOneToken:
			return "user-1", nil
		case userTwoToken:
			return "user-2", nil
		default:
			return "", errors.New("invalid token")
		}
	})

	mux := http.NewServeMux()
	NewHandler(newTestStore()).Register(mux, authn.RequireUser(verifier))

	server := httptest.NewServer(mux)
	t.Cleanup(server.Close)
	return server
}

// call performs an authenticated request and returns the status and raw body.
func call(t *testing.T, server *httptest.Server, method, path, token, body string) (int, []byte) {
	t.Helper()

	var payload io.Reader
	if body != "" {
		payload = strings.NewReader(body)
	}

	request, err := http.NewRequest(method, server.URL+path, payload)
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	request.Header.Set("Content-Type", "application/json")
	if token != "" {
		request.Header.Set("Authorization", "Bearer "+token)
	}

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		t.Fatalf("%s %s: %v", method, path, err)
	}
	defer response.Body.Close()

	raw, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}
	return response.StatusCode, raw
}

func decodeApplication(t *testing.T, raw []byte) Application {
	t.Helper()

	var envelope struct {
		Data Application `json:"data"`
	}
	if err := json.Unmarshal(raw, &envelope); err != nil {
		t.Fatalf("decode application from %s: %v", raw, err)
	}
	return envelope.Data
}

func createApplication(t *testing.T, server *httptest.Server, token, body string) Application {
	t.Helper()

	status, raw := call(t, server, http.MethodPost, "/api/applications", token, body)
	if status != http.StatusCreated {
		t.Fatalf("create status = %d, want %d (body %s)", status, http.StatusCreated, raw)
	}
	return decodeApplication(t, raw)
}

func TestCreateThenListRoundTrip(t *testing.T) {
	server := newTestAPI(t)

	created := createApplication(t, server, userOneToken,
		`{"company":"  Acme  ","role":"Backend Engineer"}`)

	if got, want := created.Company, "Acme"; got != want {
		t.Errorf("Company = %q, want it trimmed to %q", got, want)
	}
	if got, want := created.Status, StatusSaved; got != want {
		t.Errorf("Status = %q, want the default %q", got, want)
	}

	status, raw := call(t, server, http.MethodGet, "/api/applications", userOneToken, "")
	if status != http.StatusOK {
		t.Fatalf("list status = %d, want %d", status, http.StatusOK)
	}

	var envelope struct {
		Data []Application `json:"data"`
	}
	if err := json.Unmarshal(raw, &envelope); err != nil {
		t.Fatalf("decode list from %s: %v", raw, err)
	}
	if got, want := len(envelope.Data), 1; got != want {
		t.Fatalf("len(data) = %d, want %d", got, want)
	}
	if got, want := envelope.Data[0].ID, created.ID; got != want {
		t.Errorf("listed ID = %q, want %q", got, want)
	}
}

func TestCreateRejectsInvalidPayload(t *testing.T) {
	server := newTestAPI(t)

	status, raw := call(t, server, http.MethodPost, "/api/applications", userOneToken,
		`{"role":"Engineer","jobUrl":"not-a-url"}`)

	if status != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", status, http.StatusBadRequest)
	}

	var body struct {
		Error   string `json:"error"`
		Details struct {
			FieldErrors map[string][]string `json:"fieldErrors"`
		} `json:"details"`
	}
	if err := json.Unmarshal(raw, &body); err != nil {
		t.Fatalf("decode error from %s: %v", raw, err)
	}

	if got, want := body.Error, "Validation failed"; got != want {
		t.Errorf("error = %q, want %q", got, want)
	}
	for _, field := range []string{"company", "jobUrl"} {
		if _, ok := body.Details.FieldErrors[field]; !ok {
			t.Errorf("fieldErrors = %v, want an entry for %q", body.Details.FieldErrors, field)
		}
	}
}

func TestMalformedJSONIsRejected(t *testing.T) {
	server := newTestAPI(t)

	status, _ := call(t, server, http.MethodPost, "/api/applications", userOneToken, `{"company":`)
	if status != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", status, http.StatusBadRequest)
	}
}

// One user must never see or touch another's applications, and a foreign ID
// must be indistinguishable from one that does not exist.
func TestApplicationsAreScopedToTheOwner(t *testing.T) {
	server := newTestAPI(t)
	created := createApplication(t, server, userOneToken, `{"company":"Acme","role":"Engineer"}`)

	path := "/api/applications/" + created.ID

	tests := []struct {
		method string
		body   string
	}{
		{http.MethodGet, ""},
		{http.MethodPatch, `{"status":"offer"}`},
		{http.MethodDelete, ""},
	}

	for _, tt := range tests {
		t.Run(tt.method, func(t *testing.T) {
			status, _ := call(t, server, tt.method, path, userTwoToken, tt.body)
			if status != http.StatusNotFound {
				t.Errorf("status = %d, want %d", status, http.StatusNotFound)
			}
		})
	}

	status, raw := call(t, server, http.MethodGet, "/api/applications", userTwoToken, "")
	if status != http.StatusOK {
		t.Fatalf("list status = %d, want %d", status, http.StatusOK)
	}

	var envelope struct {
		Data []Application `json:"data"`
	}
	if err := json.Unmarshal(raw, &envelope); err != nil {
		t.Fatalf("decode list: %v", err)
	}
	if got := len(envelope.Data); got != 0 {
		t.Errorf("other user sees %d applications, want 0", got)
	}
}

func TestUpdateAppliesPartialChanges(t *testing.T) {
	server := newTestAPI(t)
	created := createApplication(t, server, userOneToken,
		`{"company":"Acme","role":"Engineer","notes":"first pass"}`)

	status, raw := call(t, server, http.MethodPatch, "/api/applications/"+created.ID,
		userOneToken, `{"status":"interviewing"}`)
	if status != http.StatusOK {
		t.Fatalf("status = %d, want %d (body %s)", status, http.StatusOK, raw)
	}

	updated := decodeApplication(t, raw)
	if got, want := updated.Status, StatusInterviewing; got != want {
		t.Errorf("Status = %q, want %q", got, want)
	}
	if got, want := updated.Notes, "first pass"; got != want {
		t.Errorf("Notes = %q, want it unchanged at %q", got, want)
	}
}

func TestUpdateRequiresAtLeastOneField(t *testing.T) {
	server := newTestAPI(t)
	created := createApplication(t, server, userOneToken, `{"company":"Acme","role":"Engineer"}`)

	status, raw := call(t, server, http.MethodPatch,
		"/api/applications/"+created.ID, userOneToken, `{}`)
	if status != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", status, http.StatusBadRequest)
	}

	var body struct {
		Details struct {
			FormErrors []string `json:"formErrors"`
		} `json:"details"`
	}
	if err := json.Unmarshal(raw, &body); err != nil {
		t.Fatalf("decode error from %s: %v", raw, err)
	}
	if len(body.Details.FormErrors) == 0 {
		t.Error("formErrors is empty, want the at-least-one-field message")
	}
}

func TestDeleteRemovesTheApplicationOverHTTP(t *testing.T) {
	server := newTestAPI(t)
	created := createApplication(t, server, userOneToken, `{"company":"Acme","role":"Engineer"}`)

	path := "/api/applications/" + created.ID

	if status, _ := call(t, server, http.MethodDelete, path, userOneToken, ""); status != http.StatusNoContent {
		t.Fatalf("delete status = %d, want %d", status, http.StatusNoContent)
	}
	if status, _ := call(t, server, http.MethodGet, path, userOneToken, ""); status != http.StatusNotFound {
		t.Errorf("get after delete status = %d, want %d", status, http.StatusNotFound)
	}
}

func TestUnknownApplicationReturnsNotFound(t *testing.T) {
	server := newTestAPI(t)

	status, _ := call(t, server, http.MethodGet, "/api/applications/does-not-exist", userOneToken, "")
	if status != http.StatusNotFound {
		t.Errorf("status = %d, want %d", status, http.StatusNotFound)
	}
}
