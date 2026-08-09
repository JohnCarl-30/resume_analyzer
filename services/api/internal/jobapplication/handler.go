package jobapplication

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/JohnCarl-30/resume_analyzer/services/api/internal/authn"
	"github.com/JohnCarl-30/resume_analyzer/services/api/internal/httpx"
)

// Handler serves the job application routes.
type Handler struct {
	store Store
}

// NewHandler returns a Handler backed by store.
func NewHandler(store Store) *Handler {
	return &Handler{store: store}
}

// Register mounts the routes on mux, wrapping each one in authenticate.
func (h *Handler) Register(mux *http.ServeMux, authenticate func(http.Handler) http.Handler) {
	for pattern, handler := range map[string]http.HandlerFunc{
		"GET /api/applications":                    h.list,
		"POST /api/applications":                   h.create,
		"GET /api/applications/{applicationID}":    h.get,
		"PATCH /api/applications/{applicationID}":  h.update,
		"DELETE /api/applications/{applicationID}": h.remove,
	} {
		mux.Handle(pattern, authenticate(handler))
	}
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	userID, ok := requireUser(w, r)
	if !ok {
		return
	}

	applications, err := h.store.List(r.Context(), userID)
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteData(w, http.StatusOK, applications)
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	userID, ok := requireUser(w, r)
	if !ok {
		return
	}

	application, err := h.store.Find(r.Context(), r.PathValue("applicationID"), userID)
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteData(w, http.StatusOK, application)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	userID, ok := requireUser(w, r)
	if !ok {
		return
	}

	var in CreateInput
	if !decodeJSON(w, r, &in) {
		return
	}

	in.Normalize()
	if err := in.Validate(); err != nil {
		writeValidationError(w, err)
		return
	}

	application, err := h.store.Create(r.Context(), userID, in)
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteData(w, http.StatusCreated, application)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	userID, ok := requireUser(w, r)
	if !ok {
		return
	}

	var in UpdateInput
	if !decodeJSON(w, r, &in) {
		return
	}

	in.Normalize()
	if err := in.Validate(); err != nil {
		writeValidationError(w, err)
		return
	}

	application, err := h.store.Update(r.Context(), r.PathValue("applicationID"), userID, in)
	if err != nil {
		writeStoreError(w, err)
		return
	}

	httpx.WriteData(w, http.StatusOK, application)
}

func (h *Handler) remove(w http.ResponseWriter, r *http.Request) {
	userID, ok := requireUser(w, r)
	if !ok {
		return
	}

	if err := h.store.Delete(r.Context(), r.PathValue("applicationID"), userID); err != nil {
		writeStoreError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// requireUser reads the identity RequireUser put on the context. Reaching a
// handler without one means the route was mounted unauthenticated.
func requireUser(w http.ResponseWriter, r *http.Request) (string, bool) {
	userID, ok := authn.UserID(r.Context())
	if !ok {
		httpx.WriteError(w, http.StatusUnauthorized, authn.MissingTokenMessage)
		return "", false
	}
	return userID, true
}

// decodeJSON reads the request body into target. Unknown fields are ignored,
// matching the Zod schemas the Express API used.
func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	if err := json.NewDecoder(r.Body).Decode(target); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "Send a valid JSON body.")
		return false
	}
	return true
}

func writeValidationError(w http.ResponseWriter, err error) {
	var invalid *ValidationError
	if errors.As(err, &invalid) {
		httpx.WriteErrorDetails(w, http.StatusBadRequest, "Validation failed", invalid)
		return
	}
	httpx.WriteError(w, http.StatusBadRequest, err.Error())
}

func writeStoreError(w http.ResponseWriter, err error) {
	if errors.Is(err, ErrNotFound) {
		httpx.WriteError(w, http.StatusNotFound, "Job application not found.")
		return
	}
	httpx.WriteError(w, http.StatusInternalServerError, "Internal server error")
}
