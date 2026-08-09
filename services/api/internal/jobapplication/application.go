// Package jobapplication tracks the roles a user has applied to.
package jobapplication

import (
	"fmt"
	"maps"
	"net/url"
	"slices"
	"strings"
	"time"
)

// Status is where an application sits in the user's pipeline.
type Status string

// The statuses an application can hold.
const (
	StatusSaved        Status = "saved"
	StatusApplied      Status = "applied"
	StatusInterviewing Status = "interviewing"
	StatusOffer        Status = "offer"
	StatusRejected     Status = "rejected"
)

// Statuses lists every valid Status, in pipeline order.
var Statuses = []Status{
	StatusSaved,
	StatusApplied,
	StatusInterviewing,
	StatusOffer,
	StatusRejected,
}

// Valid reports whether s is a known status.
func (s Status) Valid() bool {
	return slices.Contains(Statuses, s)
}

// Application is one tracked job application.
type Application struct {
	ID         string     `json:"id"`
	UserID     string     `json:"userId"`
	Company    string     `json:"company"`
	Role       string     `json:"role"`
	Status     Status     `json:"status"`
	Location   string     `json:"location,omitempty"`
	JobURL     string     `json:"jobUrl,omitempty"`
	Notes      string     `json:"notes,omitempty"`
	AppliedAt  *time.Time `json:"appliedAt,omitempty"`
	AnalysisID string     `json:"analysisId,omitempty"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}

const (
	maxNameLength = 200
	maxTextLength = 2000
)

// ValidationError reports every field rejected by Validate at once.
//
// The JSON shape matches Zod's flatten() output, which is what the Express API
// returned, so existing client error handling keeps working.
type ValidationError struct {
	FormErrors  []string            `json:"formErrors"`
	FieldErrors map[string][]string `json:"fieldErrors"`
}

// Error implements error.
func (e *ValidationError) Error() string {
	if len(e.FieldErrors) == 0 {
		return "validation failed"
	}
	fields := slices.Sorted(maps.Keys(e.FieldErrors))
	return "validation failed: " + strings.Join(fields, ", ")
}

func (e *ValidationError) addField(field, message string) {
	if e.FieldErrors == nil {
		e.FieldErrors = make(map[string][]string)
	}
	e.FieldErrors[field] = append(e.FieldErrors[field], message)
}

func (e *ValidationError) empty() bool {
	return len(e.FieldErrors) == 0 && len(e.FormErrors) == 0
}

// CreateInput is the payload accepted when tracking a new application.
type CreateInput struct {
	Company    string `json:"company"`
	Role       string `json:"role"`
	Status     Status `json:"status"`
	Location   string `json:"location"`
	JobURL     string `json:"jobUrl"`
	Notes      string `json:"notes"`
	AppliedAt  string `json:"appliedAt"`
	AnalysisID string `json:"analysisId"`
}

// Normalize trims surrounding whitespace and applies the default status.
func (in *CreateInput) Normalize() {
	in.Company = strings.TrimSpace(in.Company)
	in.Role = strings.TrimSpace(in.Role)
	in.Location = strings.TrimSpace(in.Location)
	in.JobURL = strings.TrimSpace(in.JobURL)
	in.Notes = strings.TrimSpace(in.Notes)
	in.AppliedAt = strings.TrimSpace(in.AppliedAt)
	in.AnalysisID = strings.TrimSpace(in.AnalysisID)

	if in.Status == "" {
		in.Status = StatusSaved
	}
}

// Validate reports every problem with in, or nil when it is acceptable.
func (in CreateInput) Validate() error {
	invalid := &ValidationError{}

	requiredName(invalid, "company", in.Company, "Company is required.")
	requiredName(invalid, "role", in.Role, "Role is required.")
	knownStatus(invalid, in.Status)
	optionalText(invalid, "location", in.Location)
	optionalText(invalid, "notes", in.Notes)
	optionalText(invalid, "analysisId", in.AnalysisID)
	optionalURL(invalid, "jobUrl", in.JobURL)
	optionalTimestamp(invalid, "appliedAt", in.AppliedAt)

	if invalid.empty() {
		return nil
	}
	return invalid
}

// UpdateInput is the payload accepted when editing an application.
//
// Every field is a pointer so a missing field ("leave unchanged") is
// distinguishable from one explicitly cleared to an empty value.
type UpdateInput struct {
	Company    *string `json:"company"`
	Role       *string `json:"role"`
	Status     *Status `json:"status"`
	Location   *string `json:"location"`
	JobURL     *string `json:"jobUrl"`
	Notes      *string `json:"notes"`
	AppliedAt  *string `json:"appliedAt"`
	AnalysisID *string `json:"analysisId"`
}

// Normalize trims surrounding whitespace from every field that was supplied.
func (in *UpdateInput) Normalize() {
	for _, field := range []*string{
		in.Company, in.Role, in.Location, in.JobURL,
		in.Notes, in.AppliedAt, in.AnalysisID,
	} {
		if field != nil {
			*field = strings.TrimSpace(*field)
		}
	}
}

// Validate reports every problem with in, or nil when it is acceptable.
func (in UpdateInput) Validate() error {
	invalid := &ValidationError{}

	if in.isEmpty() {
		invalid.FormErrors = append(invalid.FormErrors, "Provide at least one field to update.")
		return invalid
	}

	if in.Company != nil {
		requiredName(invalid, "company", *in.Company, "Company is required.")
	}
	if in.Role != nil {
		requiredName(invalid, "role", *in.Role, "Role is required.")
	}
	if in.Status != nil {
		knownStatus(invalid, *in.Status)
	}
	if in.Location != nil {
		optionalText(invalid, "location", *in.Location)
	}
	if in.Notes != nil {
		optionalText(invalid, "notes", *in.Notes)
	}
	if in.AnalysisID != nil {
		optionalText(invalid, "analysisId", *in.AnalysisID)
	}
	if in.JobURL != nil {
		optionalURL(invalid, "jobUrl", *in.JobURL)
	}
	if in.AppliedAt != nil {
		optionalTimestamp(invalid, "appliedAt", *in.AppliedAt)
	}

	if invalid.empty() {
		return nil
	}
	return invalid
}

func (in UpdateInput) isEmpty() bool {
	return in.Company == nil && in.Role == nil && in.Status == nil &&
		in.Location == nil && in.JobURL == nil && in.Notes == nil &&
		in.AppliedAt == nil && in.AnalysisID == nil
}

// applyTo copies the supplied fields of in onto application.
func (in UpdateInput) applyTo(application *Application) {
	if in.Company != nil {
		application.Company = *in.Company
	}
	if in.Role != nil {
		application.Role = *in.Role
	}
	if in.Status != nil {
		application.Status = *in.Status
	}
	if in.Location != nil {
		application.Location = *in.Location
	}
	if in.JobURL != nil {
		application.JobURL = *in.JobURL
	}
	if in.Notes != nil {
		application.Notes = *in.Notes
	}
	if in.AnalysisID != nil {
		application.AnalysisID = *in.AnalysisID
	}
	if in.AppliedAt != nil {
		application.AppliedAt, _ = parseTimestamp(*in.AppliedAt)
	}
}

func requiredName(invalid *ValidationError, field, value, missing string) {
	switch {
	case value == "":
		invalid.addField(field, missing)
	case len([]rune(value)) > maxNameLength:
		invalid.addField(field, fmt.Sprintf("Keep this under %d characters.", maxNameLength))
	}
}

func optionalText(invalid *ValidationError, field, value string) {
	if len([]rune(value)) > maxTextLength {
		invalid.addField(field, fmt.Sprintf("Keep this under %d characters.", maxTextLength))
	}
}

func optionalURL(invalid *ValidationError, field, value string) {
	if value == "" {
		return
	}

	parsed, err := url.Parse(value)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		invalid.addField(field, "Enter a valid URL.")
	}
}

func optionalTimestamp(invalid *ValidationError, field, value string) {
	if _, err := parseTimestamp(value); err != nil {
		invalid.addField(field, "Enter a valid date.")
	}
}

func knownStatus(invalid *ValidationError, status Status) {
	if status.Valid() {
		return
	}

	names := make([]string, len(Statuses))
	for i, candidate := range Statuses {
		names[i] = string(candidate)
	}
	invalid.addField("status", "Status must be one of: "+strings.Join(names, ", ")+".")
}

// parseTimestamp accepts an RFC 3339 timestamp, or nothing at all.
func parseTimestamp(value string) (*time.Time, error) {
	if value == "" {
		return nil, nil
	}

	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return nil, err
	}

	utc := parsed.UTC()
	return &utc, nil
}
