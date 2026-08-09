package jobapplication

import (
	"errors"
	"strings"
	"testing"
)

func fieldErrors(t *testing.T, err error) map[string][]string {
	t.Helper()

	var invalid *ValidationError
	if !errors.As(err, &invalid) {
		t.Fatalf("error %v is not a *ValidationError", err)
	}
	return invalid.FieldErrors
}

func TestCreateInputNormalizeTrimsAndDefaults(t *testing.T) {
	in := CreateInput{Company: "  Acme  ", Role: "\tBackend Engineer\n", Notes: "  hi  "}
	in.Normalize()

	if got, want := in.Company, "Acme"; got != want {
		t.Errorf("Company = %q, want %q", got, want)
	}
	if got, want := in.Role, "Backend Engineer"; got != want {
		t.Errorf("Role = %q, want %q", got, want)
	}
	if got, want := in.Notes, "hi"; got != want {
		t.Errorf("Notes = %q, want %q", got, want)
	}
	if got, want := in.Status, StatusSaved; got != want {
		t.Errorf("Status = %q, want the default %q", got, want)
	}
}

func TestCreateInputValidateAcceptsGoodPayloads(t *testing.T) {
	tests := []struct {
		name string
		in   CreateInput
	}{
		{"minimal", CreateInput{Company: "Acme", Role: "Engineer", Status: StatusSaved}},
		{"every field", CreateInput{
			Company:    "Acme",
			Role:       "Engineer",
			Status:     StatusInterviewing,
			Location:   "Remote",
			JobURL:     "https://acme.example/jobs/1",
			Notes:      "Referred by a friend",
			AppliedAt:  "2026-08-01T09:00:00Z",
			AnalysisID: "analysis-1",
		}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := tt.in.Validate(); err != nil {
				t.Fatalf("Validate() error = %v, want nil", err)
			}
		})
	}
}

func TestCreateInputValidateRejectsBadPayloads(t *testing.T) {
	tests := []struct {
		name      string
		in        CreateInput
		wantField string
	}{
		{"missing company", CreateInput{Role: "Engineer", Status: StatusSaved}, "company"},
		{"missing role", CreateInput{Company: "Acme", Status: StatusSaved}, "role"},
		{"unknown status", CreateInput{Company: "Acme", Role: "Engineer", Status: "ghosted"}, "status"},
		{"relative url", CreateInput{
			Company: "Acme", Role: "Engineer", Status: StatusSaved, JobURL: "acme.example/jobs",
		}, "jobUrl"},
		{"unparseable date", CreateInput{
			Company: "Acme", Role: "Engineer", Status: StatusSaved, AppliedAt: "last tuesday",
		}, "appliedAt"},
		{"company too long", CreateInput{
			Company: strings.Repeat("a", maxNameLength+1), Role: "Engineer", Status: StatusSaved,
		}, "company"},
		{"notes too long", CreateInput{
			Company: "Acme", Role: "Engineer", Status: StatusSaved,
			Notes: strings.Repeat("a", maxTextLength+1),
		}, "notes"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.in.Validate()
			if err == nil {
				t.Fatal("Validate() error = nil, want an error")
			}
			if _, ok := fieldErrors(t, err)[tt.wantField]; !ok {
				t.Errorf("field errors = %v, want an entry for %q", fieldErrors(t, err), tt.wantField)
			}
		})
	}
}

// Every problem should be reported at once rather than one per round trip.
func TestCreateInputValidateReportsEveryProblem(t *testing.T) {
	in := CreateInput{Status: "ghosted", JobURL: "nope"}

	got := fieldErrors(t, in.Validate())
	for _, field := range []string{"company", "role", "status", "jobUrl"} {
		if _, ok := got[field]; !ok {
			t.Errorf("field errors = %v, want an entry for %q", got, field)
		}
	}
}

func TestUpdateInputValidateRequiresAField(t *testing.T) {
	var in UpdateInput

	err := in.Validate()
	if err == nil {
		t.Fatal("Validate() error = nil, want an error")
	}

	var invalid *ValidationError
	if !errors.As(err, &invalid) {
		t.Fatalf("error %v is not a *ValidationError", err)
	}
	if len(invalid.FormErrors) == 0 {
		t.Error("FormErrors is empty, want the at-least-one-field message")
	}
}

func TestUpdateInputValidateChecksSuppliedFieldsOnly(t *testing.T) {
	status := StatusOffer
	valid := UpdateInput{Status: &status}
	if err := valid.Validate(); err != nil {
		t.Fatalf("Validate() error = %v, want nil", err)
	}

	blank := ""
	invalid := UpdateInput{Company: &blank}
	if _, ok := fieldErrors(t, invalid.Validate())["company"]; !ok {
		t.Error("want a company error when company is supplied but empty")
	}
}
