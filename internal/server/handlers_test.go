package server

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequireGETReturnsFalseForGET(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/", nil)

	w := httptest.NewRecorder()
	if requireGET(w, r) {
		t.Fatal("requireGET returned true for GET request")
	}

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200 (no response should be written)", w.Code)
	}
}

func TestRequireGETReturnsTrueForOtherMethods(t *testing.T) {
	for _, method := range []string{http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodPatch} {
		t.Run(method, func(t *testing.T) {
			r := httptest.NewRequest(method, "/", nil)

			w := httptest.NewRecorder()
			if !requireGET(w, r) {
				t.Fatalf("requireGET returned false for %s", method)
			}

			if w.Code != http.StatusMethodNotAllowed {
				t.Fatalf("status = %d, want 405", w.Code)
			}

			if body := w.Body.String(); body != "method not allowed\n" {
				t.Fatalf("body = %q, want %q", body, "method not allowed\n")
			}
		})
	}
}
