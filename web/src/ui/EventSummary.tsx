import { memo } from "react";
import type { TraceEvent } from "../types";

interface EventSummaryProps {
  event?: TraceEvent;
  total: number;
}

/** Rich playback readout: surfaces the event under the playhead so scrubbing
 *  is not a guessing game. Shows tool, action, target file paths, and summary. */
export const EventSummary = memo(function EventSummary({
  event,
  total,
}: EventSummaryProps) {
  if (!event || total === 0) {
    return (
      <div className="event-summary empty">
        <span className="readout-summary muted">
          No recorded activity at this position.
        </span>
      </div>
    );
  }

  const targetPaths = event.targets
    .filter((t) => t.path)
    .map((t) => t.path)
    .slice(0, 4);

  return (
    <div
      className={`event-summary action-${event.action}${event.isError ? " errored" : ""}`}
    >
      <span className={`action-dot ${event.action}`} />
      <div className="event-summary-body">
        <div className="event-summary-head">
          <span className="readout-tool">{event.tool}</span>
          {event.isError ? <span className="err-badge">error</span> : null}
          {targetPaths.length > 0 ? (
            <span className="event-targets" title={targetPaths.join(", ")}>
              {targetPaths.map((p, i) => (
                <span key={i} className="event-target">
                  {p}
                </span>
              ))}
              {event.targets.length > 4 ? (
                <span className="event-target-more">
                  +{event.targets.length - 4}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
        <span className="readout-summary" title={event.summary}>
          {event.summary}
        </span>
      </div>
    </div>
  );
});
