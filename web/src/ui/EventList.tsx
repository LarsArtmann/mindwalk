import { AlertTriangle } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { Action, Trace } from "../types";

interface EventListProps {
  trace?: Trace;
  currentSeq: number;
  onChange: (seq: number) => void;
  locked?: boolean;
}

type Filter = "all" | Action | "error";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Search", value: "search" },
  { label: "Read", value: "read" },
  { label: "Edit", value: "edit" },
  { label: "Verify", value: "verify" },
  { label: "Exec", value: "exec" },
  { label: "Errors", value: "error" },
];

const ROW_HEIGHT = 36;
const BUFFER = 8;

export const EventList = memo(function EventList({
  trace,
  currentSeq,
  onChange,
  locked = false,
}: EventListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const events = trace?.events ?? [];
  const filtered = useMemo(() => {
    if (filter === "all") return events;
    if (filter === "error") return events.filter((e) => e.isError);
    return events.filter((e) => e.action === filter);
  }, [events, filter]);

  const viewportH = scrollRef.current?.clientHeight ?? 400;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const endIdx = Math.min(
    filtered.length,
    Math.ceil((scrollTop + viewportH) / ROW_HEIGHT) + BUFFER,
  );
  const visible = filtered.slice(startIdx, endIdx);
  const totalH = filtered.length * ROW_HEIGHT;

  // scroll current event into view when it changes via external navigation
  useEffect(() => {
    const el = scrollRef.current?.querySelector(
      '[data-current="true"]',
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentSeq]);

  return (
    <div className="event-list-container">
      <div className="event-list-filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={
              filter === f.value
                ? "event-filter-chip active"
                : "event-filter-chip"
            }
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div
        className="event-list"
        ref={scrollRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: totalH, position: "relative" }}>
          <div style={{ transform: `translateY(${startIdx * ROW_HEIGHT}px)` }}>
            {visible.map((event) => {
              const isCurrent = event.seq === currentSeq;
              return (
                <button
                  key={event.seq}
                  className={
                    isCurrent ? "event-list-row current" : "event-list-row"
                  }
                  data-current={isCurrent || undefined}
                  style={{ height: ROW_HEIGHT }}
                  onClick={() => onChange(event.seq)}
                  disabled={locked}
                  title={event.summary}
                >
                  <span className="event-list-seq">{event.seq + 1}</span>
                  <span className={`action-dot ${event.action}`} />
                  <span className="event-list-tool">{event.tool}</span>
                  {event.isError ? (
                    <AlertTriangle size={12} className="event-list-err" />
                  ) : null}
                  <span className="event-list-summary">{event.summary}</span>
                </button>
              );
            })}
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="muted" style={{ padding: "12px", textAlign: "center" }}>
            No events match this filter.
          </p>
        ) : null}
      </div>
      <div className="event-list-count">
        {filtered.length === events.length
          ? `${events.length} events`
          : `${filtered.length} of ${events.length} events`}
      </div>
    </div>
  );
});
