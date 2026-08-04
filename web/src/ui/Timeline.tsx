import {
  Ellipsis,
  Loader,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  StepBack,
  StepForward,
  Video,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Action, Mark, Trace, TraceEvent } from "../types";
import { EventSummary } from "./EventSummary";

interface TimelineProps {
  trace?: Trace;
  currentSeq: number;
  onChange: (seq: number) => void;
  onSubagentMark?: (seq: number) => void;
  onExport?: () => void;
  exporting?: boolean;
}

const BUCKETS = 160;
const BASE_TICK_MS = 340;
const SPEEDS = [1, 4, 16] as const;
type Speed = (typeof SPEEDS)[number];

interface Bucket {
  count: number;
  dominant: Action;
}

// marks that land on the same strip pixel collapse into one glyph; the title
// carries the count so dense sessions stay legible
interface MarkGroup {
  type: Mark["type"];
  seq: number;
  pos: number;
  count: number;
  note?: string;
  duration?: number;
}

const MARK_SLOTS = 220;

const MARK_LABEL: Record<Mark["type"], string> = {
  compaction: "context compaction",
  "user-message": "user message",
  subagent: "subagent",
  thinking: "agent thinking",
  "finish-reason": "turn ended",
  "model-switch": "model switched",
};

const STRIP_ACTIONS: Action[] = ["search", "read", "edit", "verify", "exec"];

export function Timeline({
  trace,
  currentSeq,
  onChange,
  onSubagentMark,
  onExport,
  exporting = false,
}: TimelineProps) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [looping, setLooping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [zoomStart, setZoomStart] = useState(0);
  const [zoomEnd, setZoomEnd] = useState(1);
  const menuRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const total = trace?.events.length ?? 0;
  const max = Math.max(0, total - 1);
  const seq = Math.min(currentSeq, max);
  const event = trace?.events[seq];

  // zoomed range in event indices
  const zLo = Math.round(zoomStart * max);
  const zHi = Math.round(zoomEnd * max);
  const zMax = Math.max(0, zHi - zLo);
  const zSeq = Math.max(0, Math.min(zMax, seq - zLo));
  const isZoomed = zoomStart > 0.001 || zoomEnd < 0.999;

  useEffect(() => {
    setPlaying(false);
    setZoomStart(0);
    setZoomEnd(1);
    setLooping(false);
  }, [trace]);

  // while a video export is recording, the recorder owns the playhead — force
  // playback off so the Timeline timer can't fight it for currentSeq
  useEffect(() => {
    if (exporting) setPlaying(false);
  }, [exporting]);

  // the timer and shortcuts read position via refs so ticking doesn't tear them down
  const seqRef = useRef(seq);
  const maxRef = useRef(max);
  const playingRef = useRef(playing);
  seqRef.current = seq;
  maxRef.current = max;
  playingRef.current = playing;

  useEffect(() => {
    if (!playing || total === 0 || exporting) return;
    // higher speeds keep the render rate bounded by advancing several events per tick
    const interval = Math.max(85, BASE_TICK_MS / speed);
    const step = Math.max(1, Math.round((speed * interval) / BASE_TICK_MS));
    const timer = window.setInterval(() => {
      if (seqRef.current >= maxRef.current) {
        if (looping) {
          const loopFrom = zoomStart > 0.001 ? Math.round(zoomStart * maxRef.current) : 0;
          onChange(loopFrom);
          return;
        }
        setPlaying(false);
        return;
      }
      const loopTo = zoomEnd < 0.999 ? Math.min(maxRef.current, Math.round(zoomEnd * maxRef.current)) : maxRef.current;
      const next = seqRef.current + step;
      if (next > loopTo && looping) {
        const loopFrom = zoomStart > 0.001 ? Math.round(zoomStart * maxRef.current) : 0;
        onChange(loopFrom);
        return;
      }
      onChange(Math.min(next, maxRef.current));
    }, interval);
    return () => window.clearInterval(timer);
  }, [playing, speed, total, onChange, exporting, looping, zoomStart, zoomEnd, max]);

  const togglePlay = useCallback(() => {
    if (!playingRef.current && seqRef.current >= maxRef.current) onChange(0);
    setPlaying((v) => !v);
  }, [onChange]);

  const cycleSpeed = useCallback(() => {
    setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]);
  }, []);

  const step = useCallback(
    (delta: number) => {
      onChange(Math.min(maxRef.current, Math.max(0, seqRef.current + delta)));
    },
    [onChange],
  );

  const jumpEvent = useCallback(
    (dir: 1 | -1, pred: (e: TraceEvent) => boolean) => {
      if (!trace) return;
      for (let i = seqRef.current + dir; i >= 0 && i < trace.events.length; i += dir) {
        if (pred(trace.events[i])) {
          onChange(i);
          return;
        }
      }
    },
    [trace, onChange],
  );

  const markSeqs = useMemo(() => {
    const clamped = (trace?.marks ?? []).map((mark) =>
      Math.min(mark.seq, Math.max(0, (trace?.events.length ?? 1) - 1)),
    );
    return [...new Set(clamped)].sort((a, b) => a - b);
  }, [trace]);

  const jumpMark = useCallback(
    (dir: 1 | -1) => {
      const cur = seqRef.current;
      const next =
        dir === 1 ? markSeqs.find((s) => s > cur) : [...markSeqs].reverse().find((s) => s < cur);
      if (next !== undefined) onChange(next);
    },
    [markSeqs, onChange],
  );

  // playback shortcuts; scene and rail keep their own (⌘B lives in App).
  // suspended while exporting so a keypress can't move the recorded playhead.
  useEffect(() => {
    if (!trace || exporting) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button, [contenteditable]")) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          return;
        case "ArrowLeft":
          e.preventDefault();
          step(e.shiftKey ? -10 : -1);
          return;
        case "ArrowRight":
          e.preventDefault();
          step(e.shiftKey ? 10 : 1);
          return;
        case "Home":
          e.preventDefault();
          onChange(0);
          return;
        case "End":
          e.preventDefault();
          onChange(maxRef.current);
          return;
      }
      switch (e.key.toLowerCase()) {
        case "s":
          cycleSpeed();
          return;
        case "e":
          jumpEvent(e.shiftKey ? -1 : 1, (ev) => ev.action === "edit");
          return;
        case "x":
          jumpEvent(e.shiftKey ? -1 : 1, (ev) => ev.isError);
          return;
        case "m":
          jumpMark(e.shiftKey ? -1 : 1);
          return;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [trace, exporting, togglePlay, step, onChange, cycleSpeed, jumpEvent, jumpMark]);

  // transport + scrubber are inert with no trace, or while an export owns the playhead
  const locked = total === 0 || exporting;

  // zoom: center on the playhead, shrink the window by a factor
  const zoomBy = useCallback(
    (factor: number) => {
      if (max <= 0) return;
      const center = seq / max;
      const span = (zoomEnd - zoomStart) * factor;
      const clamped = Math.max(0.05, Math.min(1, span));
      let start = center - clamped / 2;
      let end = center + clamped / 2;
      if (start < 0) {
        end -= start;
        start = 0;
      }
      if (end > 1) {
        start -= end - 1;
        end = 1;
      }
      setZoomStart(Math.max(0, start));
      setZoomEnd(Math.min(1, end));
    },
    [max, seq, zoomStart, zoomEnd],
  );

  const resetZoom = useCallback(() => {
    setZoomStart(0);
    setZoomEnd(1);
  }, []);

  const onStripWheel = useCallback(
    (e: React.WheelEvent) => {
      if (locked || max <= 0) return;
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 0.7 : 1.4);
    },
    [locked, max, zoomBy],
  );

  useEffect(() => {
    if (locked) setMenuOpen(false);
  }, [locked]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const buckets = useMemo<Bucket[]>(() => {
    if (!trace || total === 0) return [];
    const zTotal = Math.max(1, zHi - zLo + 1);
    const n = Math.min(BUCKETS, zTotal);
    const out: Bucket[] = [];
    for (let b = 0; b < n; b++) {
      const from = zLo + Math.floor((b * zTotal) / n);
      const to = zLo + Math.floor(((b + 1) * zTotal) / n);
      const byAction = new Map<Action, number>();
      for (let i = from; i < to; i++) {
        const action = trace.events[i].action;
        byAction.set(action, (byAction.get(action) ?? 0) + 1);
      }
      let dominant: Action = "other";
      let best = -1;
      // edits are rare but load-bearing: let them win the bucket color on ties
      const priority: Action[] = ["edit", "verify", "read", "search", "exec", "other"];
      for (const action of priority) {
        const count = byAction.get(action) ?? 0;
        if (count > best) {
          best = count;
          dominant = action;
        }
      }
      out.push({ count: to - from, dominant });
    }
    return out;
  }, [trace, total, zLo, zHi]);

  const peak = useMemo(() => buckets.reduce((acc, b) => Math.max(acc, b.count), 1), [buckets]);

  const markGroups = useMemo<MarkGroup[]>(() => {
    if (!trace) return [];
    const groups = new Map<string, MarkGroup>();
    for (const mark of trace.marks) {
      // tail marks can carry seq == events.length; clamp keeps them on the strip
      const seqC = Math.min(mark.seq, max);
      if (seqC < zLo || seqC > zHi) continue;
      const pos = zMax > 0 ? (seqC - zLo) / zMax : 0;
      const key = `${mark.type}:${Math.round(pos * MARK_SLOTS)}`;
      const group = groups.get(key);
      if (group) {
        group.count++;
        group.seq = Math.min(group.seq, seqC);
      } else {
        groups.set(key, {
          type: mark.type,
          seq: seqC,
          pos,
          count: 1,
          note: mark.note,
          duration: mark.duration,
        });
      }
    }
    return [...groups.values()];
  }, [trace, max, zLo, zHi, zMax]);

  const errorPositions = useMemo(() => {
    if (!trace || total === 0) return [];
    return trace.events
      .filter((e) => e.isError && e.seq >= zLo && e.seq <= zHi)
      .map((e) => ({
        seq: e.seq,
        pos: zMax > 0 ? (Math.min(e.seq, max) - zLo) / zMax : 0,
        summary: e.summary,
      }));
  }, [trace, total, max, zLo, zHi, zMax]);

  return (
    <footer className="deck">
      <div className="deck-main">
        {isZoomed ? (
          <div className="strip-minimap" aria-hidden>
            <div
              className="strip-minimap-window"
              style={{
                left: `${zoomStart * 100}%`,
                width: `${(zoomEnd - zoomStart) * 100}%`,
              }}
              onClick={resetZoom}
              title="Click to reset zoom"
            />
            <div
              className="strip-minimap-playhead"
              style={{ left: `${(seq / Math.max(max, 1)) * 100}%` }}
            />
          </div>
        ) : null}
        <div className="strip" ref={stripRef} onWheel={onStripWheel}>
          <div className="strip-marks">
            {markGroups.map((group, i) => (
              <button
                type="button"
                key={`${group.type}-${group.seq}-${i}`}
                className={`strip-mark ${group.type}`}
                style={{ left: `${group.pos * 100}%` }}
                disabled={locked}
                title={`${group.note || MARK_LABEL[group.type]}${group.count > 1 ? ` ×${group.count}` : ""}${group.duration ? ` (${group.duration}s)` : ""}`}
                aria-label={`Jump to ${group.note || MARK_LABEL[group.type]} at event ${group.seq + 1}${group.count > 1 ? `, ${group.count} marks` : ""}`}
                onClick={() =>
                  group.type === "subagent" && onSubagentMark
                    ? onSubagentMark(group.seq)
                    : onChange(group.seq)
                }
              />
            ))}
          </div>
          {errorPositions.length > 0 ? (
            <div className="strip-errors" aria-hidden>
              {errorPositions.map((err, i) => (
                <span
                  key={`err-${err.seq}-${i}`}
                  className="strip-error"
                  style={{ left: `${err.pos * 100}%` }}
                  title={`Error at step ${err.seq + 1} — ${err.summary}`}
                />
              ))}
            </div>
          ) : null}
          <div className="strip-bars" aria-hidden>
            {buckets.map((bucket, i) => (
              <span
                key={i}
                className={`strip-bar ${bucket.dominant}`}
                style={{ height: `${18 + (bucket.count / peak) * 82}%` }}
              />
            ))}
          </div>
          {total > 0 ? (
            <div
              className="strip-playhead"
              style={{ left: `${(zSeq / Math.max(zMax, 1)) * 100}%` }}
              aria-hidden
            />
          ) : null}
          <input
            className="strip-input"
            type="range"
            min={zLo}
            max={Math.max(zLo, zHi)}
            value={Math.max(zLo, Math.min(zHi, seq))}
            disabled={locked}
            onChange={(e) => onChange(Number(e.currentTarget.value))}
            aria-label="Playback position"
            aria-valuetext={event ? `event ${event.seq}: ${event.tool}` : "empty"}
          />
        </div>

        <div className="deck-pos" data-hint="Event position and wall-clock timestamp at the playhead">
          {/* reserve the widest count for this session ("599 / 599") so the
              ticking digits never resize the strip beside them */}
          <span
            className="deck-pos-count"
            style={{
              minWidth: `${String(Math.max(total, 1)).length * 2 + 3}ch`,
            }}
          >
            {total > 0 ? `${seq + 1} / ${total}` : "0 / 0"}
          </span>
          <span className="deck-pos-clock">{event?.ts ? clock(event.ts) : "—"}</span>
        </div>

        <div className="transport">
          <button
            className="icon-btn"
            onClick={() => step(-1)}
            disabled={locked}
            title="Step back (←)"
            aria-label="Step back one event"
          >
            <StepBack size={15} />
          </button>
          <button
            className="play-btn"
            onClick={togglePlay}
            disabled={locked}
            title={playing ? "Pause (Space)" : "Play (Space)"}
            aria-label={playing ? "Pause playback" : "Play playback"}
          >
            {playing ? <Pause size={16} /> : <Play size={16} className="play-glyph" />}
          </button>
          <button
            className="icon-btn"
            onClick={() => step(1)}
            disabled={locked}
            title="Step forward (→)"
            aria-label="Step forward one event"
          >
            <StepForward size={15} />
          </button>
          <button
            className="icon-btn"
            onClick={() => zoomBy(0.7)}
            disabled={locked || total < 2}
            title="Zoom in (scroll on strip)"
            aria-label="Zoom into timeline"
          >
            <ZoomIn size={15} />
          </button>
          <button
            className="icon-btn"
            onClick={() => (isZoomed ? resetZoom() : zoomBy(1.4))}
            disabled={locked || total < 2}
            title={isZoomed ? "Reset zoom" : "Zoom out (scroll on strip)"}
            aria-label={isZoomed ? "Reset zoom" : "Zoom out of timeline"}
          >
            <ZoomOut size={15} />
          </button>
          <div className="transport-speed-chips" role="group" aria-label="Playback speed">
            {SPEEDS.map((s) => (
              <button
                key={s}
                className={s === speed ? "speed-chip active" : "speed-chip"}
                onClick={() => setSpeed(s)}
                aria-pressed={s === speed}
                aria-label={`${s}x speed`}
              >
                {s}×
              </button>
            ))}
          </div>
          <button
            className={looping ? "icon-btn active" : "icon-btn"}
            onClick={() => setLooping((v) => !v)}
            disabled={locked}
            title={looping ? "Loop on (wraps within zoom range)" : "Loop off"}
            aria-label={looping ? "Disable loop playback" : "Enable loop playback"}
            aria-pressed={looping}
          >
            <Repeat size={15} />
          </button>
          <div className="transport-more" ref={menuRef}>
            {/* the trigger doubles as status: recording spinner while an export
                runs, the engaged speed when it isn't 1× */}
            <button
              className={`icon-btn${exporting ? " recording" : ""}${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              disabled={locked}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              title="More controls"
              aria-label="More playback controls"
            >
              {exporting ? (
                <Loader size={15} className="spin" />
              ) : speed !== 1 ? (
                <span className="more-speed">{speed}×</span>
              ) : (
                <Ellipsis size={15} />
              )}
            </button>
            {menuOpen ? (
              <div className="transport-pop">
                <div className="pop-speed">
                  <span className="pop-speed-label">Speed</span>
                  <div className="pop-speed-chips" title="Cycle with S">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        className={s === speed ? "pop-chip engaged" : "pop-chip"}
                        onClick={() => setSpeed(s)}
                        aria-pressed={s === speed}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="pop-item"
                  onClick={() => {
                    onChange(0);
                    setMenuOpen(false);
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Restart</span>
                  <kbd>Home</kbd>
                </button>
                {onExport ? (
                  <button
                    className="pop-item"
                    onClick={() => {
                      setMenuOpen(false);
                      onExport();
                    }}
                  >
                    <Video size={14} />
                    <span>Export video</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="deck-foot">
        {event ? (
          <EventSummary event={event} total={total} />
        ) : (
          <div className="readout-now">
            <span className="readout-summary">
              {trace
                ? "No recorded activity for this agent."
                : "Select a session to start the walk."}
            </span>
          </div>
        )}
        <div className="deck-legend" aria-hidden>
          <span className="legend-group">
            {STRIP_ACTIONS.map((action) => (
              <span key={action} className="legend-item">
                <span className={`action-dot ${action}`} />
                {action}
              </span>
            ))}
          </span>
          <span className="legend-group">
            <span className="legend-item">
              <span className="legend-glyph compaction" />
              compaction
            </span>
            <span className="legend-item">
              <span className="legend-glyph subagent" />
              subagent
            </span>
            <span className="legend-item">
              <span className="legend-glyph user-message" />
              user turn
            </span>
            <span className="legend-item">
              <span className="legend-glyph thinking" />
              thinking
            </span>
            <span className="legend-item">
              <span className="legend-glyph finish-reason" />
              turn ended
            </span>
            <span className="legend-item">
              <span className="legend-glyph model-switch" />
              model switched
            </span>
          </span>
        </div>
      </div>
      <div className="sr-live" aria-live="polite" role="status">
        {event
          ? `Event ${seq + 1} of ${total}: ${event.action} — ${event.tool}${event.summary ? `, ${event.summary}` : ""}`
          : ""}
      </div>
    </footer>
  );
}

function clock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
