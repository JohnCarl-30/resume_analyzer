package jobapplication

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"slices"
	"strings"
	"sync"
	"time"
)

// ErrNotFound is returned when an application does not exist, or belongs to
// another user. The two cases are deliberately indistinguishable so the API
// never reveals which IDs exist.
var ErrNotFound = errors.New("job application not found")

// Store persists a user's job applications.
type Store interface {
	List(ctx context.Context, userID string) ([]Application, error)
	Find(ctx context.Context, id, userID string) (Application, error)
	Create(ctx context.Context, userID string, in CreateInput) (Application, error)
	Update(ctx context.Context, id, userID string, in UpdateInput) (Application, error)
	Delete(ctx context.Context, id, userID string) error
}

// MemoryStore keeps applications in process memory, so the service runs with no
// database configured. It mirrors the Express API's in-memory repository;
// Postgres is the production implementation.
type MemoryStore struct {
	mu           sync.RWMutex
	applications map[string]Application

	// Injected so tests can produce deterministic IDs and timestamps.
	newID func() string
	now   func() time.Time
}

var _ Store = (*MemoryStore)(nil)

// NewMemoryStore returns an empty MemoryStore.
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		applications: make(map[string]Application),
		newID:        newUUID,
		now:          func() time.Time { return time.Now().UTC() },
	}
}

// List returns the user's applications, most recently updated first.
func (s *MemoryStore) List(_ context.Context, userID string) ([]Application, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	found := make([]Application, 0, len(s.applications))
	for _, application := range s.applications {
		if application.UserID == userID {
			found = append(found, application)
		}
	}

	// Ties are broken by ID so the order is stable for identical timestamps.
	slices.SortStableFunc(found, func(a, b Application) int {
		if byRecency := b.UpdatedAt.Compare(a.UpdatedAt); byRecency != 0 {
			return byRecency
		}
		return strings.Compare(a.ID, b.ID)
	})

	return found, nil
}

// Find returns one of the user's applications.
func (s *MemoryStore) Find(_ context.Context, id, userID string) (Application, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.find(id, userID)
}

// Create stores a new application for the user.
func (s *MemoryStore) Create(_ context.Context, userID string, in CreateInput) (Application, error) {
	appliedAt, err := parseTimestamp(in.AppliedAt)
	if err != nil {
		return Application{}, fmt.Errorf("parse appliedAt: %w", err)
	}

	now := s.now()
	application := Application{
		ID:         s.newID(),
		UserID:     userID,
		Company:    in.Company,
		Role:       in.Role,
		Status:     in.Status,
		Location:   in.Location,
		JobURL:     in.JobURL,
		Notes:      in.Notes,
		AppliedAt:  appliedAt,
		AnalysisID: in.AnalysisID,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.applications[application.ID] = application

	return application, nil
}

// Update applies the supplied fields to one of the user's applications.
func (s *MemoryStore) Update(_ context.Context, id, userID string, in UpdateInput) (Application, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, err := s.find(id, userID)
	if err != nil {
		return Application{}, err
	}

	in.applyTo(&existing)
	existing.UpdatedAt = s.now()
	s.applications[id] = existing

	return existing, nil
}

// Delete removes one of the user's applications.
func (s *MemoryStore) Delete(_ context.Context, id, userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, err := s.find(id, userID); err != nil {
		return err
	}
	delete(s.applications, id)

	return nil
}

// find reads an application. Callers must hold at least a read lock.
func (s *MemoryStore) find(id, userID string) (Application, error) {
	application, ok := s.applications[id]
	if !ok || application.UserID != userID {
		return Application{}, ErrNotFound
	}
	return application, nil
}

// newUUID returns a random RFC 4122 version 4 UUID.
func newUUID() string {
	var bytes [16]byte
	// crypto/rand.Read never reports an error: it fills the buffer entirely or
	// crashes the program.
	_, _ = rand.Read(bytes[:])

	bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
	bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10

	return fmt.Sprintf("%x-%x-%x-%x-%x",
		bytes[0:4], bytes[4:6], bytes[6:8], bytes[8:10], bytes[10:16])
}
