package jobapplication

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"
)

// newTestStore returns a MemoryStore with predictable IDs and a clock that
// advances one second per call, so ordering assertions are deterministic.
func newTestStore() *MemoryStore {
	store := NewMemoryStore()

	issued := 0
	clock := time.Date(2026, time.August, 8, 12, 0, 0, 0, time.UTC)

	store.newID = func() string {
		issued++
		return fmt.Sprintf("app-%d", issued)
	}
	store.now = func() time.Time {
		clock = clock.Add(time.Second)
		return clock
	}

	return store
}

func mustCreate(t *testing.T, store *MemoryStore, userID, company string) Application {
	t.Helper()

	in := CreateInput{Company: company, Role: "Engineer"}
	in.Normalize()

	application, err := store.Create(context.Background(), userID, in)
	if err != nil {
		t.Fatalf("Create(%q) error = %v", company, err)
	}
	return application
}

func TestCreatePopulatesTheRecord(t *testing.T) {
	store := newTestStore()

	in := CreateInput{Company: "Acme", Role: "Engineer", AppliedAt: "2026-08-01T09:00:00Z"}
	in.Normalize()

	application, err := store.Create(context.Background(), "user-1", in)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if application.ID == "" {
		t.Error("ID is empty, want a generated identifier")
	}
	if got, want := application.UserID, "user-1"; got != want {
		t.Errorf("UserID = %q, want %q", got, want)
	}
	if got, want := application.Status, StatusSaved; got != want {
		t.Errorf("Status = %q, want %q", got, want)
	}
	if application.AppliedAt == nil || !application.AppliedAt.Equal(
		time.Date(2026, time.August, 1, 9, 0, 0, 0, time.UTC)) {
		t.Errorf("AppliedAt = %v, want 2026-08-01T09:00:00Z", application.AppliedAt)
	}
	if !application.CreatedAt.Equal(application.UpdatedAt) {
		t.Errorf("CreatedAt %v and UpdatedAt %v differ on creation",
			application.CreatedAt, application.UpdatedAt)
	}
}

func TestListReturnsOwnApplicationsMostRecentlyUpdatedFirst(t *testing.T) {
	store := newTestStore()

	first := mustCreate(t, store, "user-1", "First")
	second := mustCreate(t, store, "user-1", "Second")
	mustCreate(t, store, "user-2", "Someone else's")

	applications, err := store.List(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}

	if got, want := len(applications), 2; got != want {
		t.Fatalf("len(List()) = %d, want %d", got, want)
	}
	if got, want := applications[0].ID, second.ID; got != want {
		t.Errorf("first result = %q, want the most recent %q", got, want)
	}
	if got, want := applications[1].ID, first.ID; got != want {
		t.Errorf("second result = %q, want %q", got, want)
	}
}

func TestFindHidesOtherUsersApplications(t *testing.T) {
	store := newTestStore()
	application := mustCreate(t, store, "user-1", "Acme")

	if _, err := store.Find(context.Background(), application.ID, "user-2"); !errors.Is(err, ErrNotFound) {
		t.Errorf("Find() error = %v, want ErrNotFound", err)
	}
	if _, err := store.Find(context.Background(), application.ID, "user-1"); err != nil {
		t.Errorf("Find() error = %v, want nil for the owner", err)
	}
}

func TestUpdateAppliesSuppliedFieldsOnly(t *testing.T) {
	store := newTestStore()
	original := mustCreate(t, store, "user-1", "Acme")

	status := StatusInterviewing
	updated, err := store.Update(context.Background(), original.ID, "user-1",
		UpdateInput{Status: &status})
	if err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	if got, want := updated.Status, StatusInterviewing; got != want {
		t.Errorf("Status = %q, want %q", got, want)
	}
	if got, want := updated.Company, original.Company; got != want {
		t.Errorf("Company = %q, want it unchanged at %q", got, want)
	}
	if !updated.UpdatedAt.After(original.UpdatedAt) {
		t.Errorf("UpdatedAt = %v, want it after %v", updated.UpdatedAt, original.UpdatedAt)
	}
	if !updated.CreatedAt.Equal(original.CreatedAt) {
		t.Errorf("CreatedAt = %v, want it unchanged at %v", updated.CreatedAt, original.CreatedAt)
	}
}

func TestDeleteRemovesTheApplication(t *testing.T) {
	store := newTestStore()
	application := mustCreate(t, store, "user-1", "Acme")

	if err := store.Delete(context.Background(), application.ID, "user-1"); err != nil {
		t.Fatalf("Delete() error = %v", err)
	}
	if _, err := store.Find(context.Background(), application.ID, "user-1"); !errors.Is(err, ErrNotFound) {
		t.Errorf("Find() after delete error = %v, want ErrNotFound", err)
	}
}

func TestMissingApplicationsReportNotFound(t *testing.T) {
	store := newTestStore()
	ctx := context.Background()

	if _, err := store.Find(ctx, "nope", "user-1"); !errors.Is(err, ErrNotFound) {
		t.Errorf("Find() error = %v, want ErrNotFound", err)
	}
	if _, err := store.Update(ctx, "nope", "user-1", UpdateInput{}); !errors.Is(err, ErrNotFound) {
		t.Errorf("Update() error = %v, want ErrNotFound", err)
	}
	if err := store.Delete(ctx, "nope", "user-1"); !errors.Is(err, ErrNotFound) {
		t.Errorf("Delete() error = %v, want ErrNotFound", err)
	}
}

// The store is shared across requests, so concurrent access must be safe.
// Run with -race for this to mean anything.
func TestMemoryStoreIsSafeForConcurrentUse(t *testing.T) {
	store := NewMemoryStore()
	ctx := context.Background()

	done := make(chan struct{})
	for worker := range 8 {
		go func() {
			defer func() { done <- struct{}{} }()

			in := CreateInput{Company: fmt.Sprintf("Company %d", worker), Role: "Engineer"}
			in.Normalize()

			if _, err := store.Create(ctx, "user-1", in); err != nil {
				t.Errorf("Create() error = %v", err)
			}
			if _, err := store.List(ctx, "user-1"); err != nil {
				t.Errorf("List() error = %v", err)
			}
		}()
	}
	for range 8 {
		<-done
	}

	applications, err := store.List(ctx, "user-1")
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}
	if got, want := len(applications), 8; got != want {
		t.Errorf("len(List()) = %d, want %d", got, want)
	}
}
