package server

import "net/http"

// requireGET rejects non-GET requests with 405 Method Not Allowed and
// returns true when the handler should stop. The 4-line guard was
// repeated across every read endpoint; this helper centralises the
// status code, the response body, and the early-return contract so a
// future change to the user-visible message edits one place.
func requireGET(w http.ResponseWriter, r *http.Request) bool {
	if r.Method == http.MethodGet {
		return false
	}

	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)

	return true
}
