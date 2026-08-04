package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/cosmtrek/mindwalk/internal/model"
)

// ssePollInterval is how often the SSE handler checks the progress log for
// new events. The judge run takes ~30-60s per phase, so 200ms is instant from
// the user's perspective while costing negligible CPU.
const ssePollInterval = 200 * time.Millisecond

// sseHeartbeat is the maximum gap between writes before the handler sends a
// keep-alive comment. Long judge runs (~2 min) can sit idle between phases;
// without periodic traffic, reverse proxies (nginx, Cloudflare) may drop the
// connection. SSE comment lines (": ...") are ignored by EventSource clients
// but count as traffic to intermediary proxies. A var (not const) so tests
// can shorten it.
var sseHeartbeat = 15 * time.Second

// handleSessionAnalyzeStream streams judge progress events to the browser
// via Server-Sent Events. The frontend opens an EventSource on this endpoint
// when an evaluation is running and receives "progress" events (one per
// judge milestone) followed by a terminal "status" event carrying the same
// reportStatus the polling endpoint returns. If no job is running, the
// handler sends just the "status" event and closes.
func (s *Server) handleSessionAnalyzeStream(w http.ResponseWriter, r *http.Request, selector string) {
	if requireGET(w, r) {
		return
	}
	meta, err := s.findSession(selector)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming not supported", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)
	flusher.Flush()

	ctx := r.Context()

	// If no job is running, send the current status and close — the
	// frontend opens an EventSource when it sees state "running", but the
	// job may have finished between the last poll and this connection.
	job, ok := s.analyze.snapshot(meta.Key)
	if !ok || job.done {
		s.sseSendStatus(w, flusher, meta)
		return
	}

	// Tail the progress log until the job finishes.
	offset := 0
	lastWrite := time.Now()
	for {
		wrote := false
		// Drain any new progress events since the last poll.
		if job.progress != nil {
			events, next := job.progress.since(offset)
			for _, evt := range events {
				writeSSE(w, flusher, "progress", evt)
				wrote = true
			}
			offset = next
		}

		// Check whether the job finished since last poll.
		current, ok := s.analyze.snapshot(meta.Key)
		if !ok || current.done {
			s.sseSendStatus(w, flusher, meta)
			return
		}
		// Refresh the progress handle from the latest snapshot so
		// events queued after the initial connection are not missed.
		job = current

		// Send a keep-alive comment when no data has flowed for the
		// heartbeat interval, keeping intermediary proxies from
		// timing out the connection during long judge phases.
		if !wrote && time.Since(lastWrite) >= sseHeartbeat {
			fmt.Fprintf(w, ": keep-alive\n\n")
			flusher.Flush()
			lastWrite = time.Now()
		} else if wrote {
			lastWrite = time.Now()
		}

		select {
		case <-ctx.Done():
			return
		case <-time.After(ssePollInterval):
		}
	}
}

// sseSendStatus builds the report status for the session and sends it as a
// terminal "status" SSE event, then flushes. Called when the job is not
// running (no job, already done, or just finished while tailing).
func (s *Server) sseSendStatus(w http.ResponseWriter, flusher http.Flusher, meta model.SessionMeta) {
	trace, _, err := s.traceAndMapMeta(meta)
	if err != nil {
		writeSSE(w, flusher, "status", reportStatus{State: "failed", Error: err.Error()})
		return
	}
	writeSSE(w, flusher, "status", s.buildReportStatus(meta, trace))
}

// writeSSE serialises one SSE event: an "event:" line naming the type, a
// "data:" line with the JSON payload, and a blank line to delimit. The
// caller must flush afterwards.
func writeSSE(w http.ResponseWriter, flusher http.Flusher, eventType string, payload any) {
	data, err := json.Marshal(payload)
	if err != nil {
		return
	}
	fmt.Fprintf(w, "event: %s\ndata: %s\n\n", eventType, data)
	flusher.Flush()
}
