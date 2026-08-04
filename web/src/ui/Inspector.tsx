import { AlertTriangle, Copy, X } from "lucide-react";
import { touchWord, type CityFile, type Touch, type TraceEvent } from "../types";

interface InspectorProps {
  /** absent when nothing is selected yet — renders the teaching empty state */
  file?: CityFile;
  touch?: Touch;
  history: TraceEvent[];
  onClose: () => void;
  onJumpTo: (seq: number) => void;
  locked?: boolean;
  currentSeq: number;
  total: number;
}

// dock panel content: the selected file's identity, touch state, and visit
// history. The Dock owns positioning; this owns only its own markup.
export function Inspector({
  file,
  touch,
  history,
  onClose,
  onJumpTo,
  locked = false,
  currentSeq,
  total,
}: InspectorProps) {
  if (!file) {
    return (
      <div className="dock-body" aria-label="File inspector">
        <div className="inspector-head">
          <div className="inspector-path">Inspect</div>
          <button className="icon-btn" onClick={onClose} title="Close" aria-label="Close inspector">
            <X size={15} />
          </button>
        </div>
        <p className="dock-note">
          Click a building in the scene to inspect a file — its touch state, size, and every visit
          the agent paid it.
        </p>
      </div>
    );
  }
  const slash = file.path.lastIndexOf("/");
  const dir = slash >= 0 ? file.path.slice(0, slash + 1) : "";
  const name = slash >= 0 ? file.path.slice(slash + 1) : file.path;

  return (
    <div className="dock-body" aria-label={`File ${file.path}`}>
      <div className="inspector-head">
        <div>
          <div className="inspector-path">
            <span className="dir">{dir}</span>
            {name}
            <button
              className="icon-btn copy-path-btn"
              onClick={() => copyToClipboard(file.path)}
              title="Copy file path"
              aria-label="Copy file path"
            >
              <Copy size={13} />
            </button>
          </div>
          {file.ghost ? <span className="ghost-badge">ghost — not in this tree</span> : null}
        </div>
        <button className="icon-btn" onClick={onClose} title="Close" aria-label="Close inspector">
          <X size={15} />
        </button>
      </div>
      <dl className="inspector-facts">
        <div>
          <dt>Touch</dt>
          <dd className={touch ? `touch-${touch}` : undefined}>{touchWord(touch)}</dd>
        </div>
        <div>
          <dt>Lang</dt>
          <dd>{file.lang || "text"}</dd>
        </div>
        <div>
          <dt>Lines</dt>
          <dd>{file.lines.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Bytes</dt>
          <dd>{formatBytes(file.bytes)}</dd>
        </div>
      </dl>
      <section className="inspector-history">
        <p className="eyebrow">Visits · {history.length}</p>
        {history.length > 0 && total > 0 ? (
          <VisitSparkline
            history={history}
            total={total}
            currentSeq={currentSeq}
            onJumpTo={onJumpTo}
            locked={locked}
          />
        ) : null}
        <div className="history-list">
          {history
            .slice(-14)
            .reverse()
            .map((event) => (
              <button
                key={event.seq}
                className="history-row"
                onClick={() => onJumpTo(event.seq)}
                disabled={locked}
                title={`Jump to step ${event.seq + 1} — ${event.summary}`}
              >
                <span className={`action-dot ${event.action}`} />
                <strong>#{event.seq + 1}</strong>
                <span>{event.tool}</span>
                <span className="history-time">{event.ts ? clock(event.ts) : ""}</span>
                {event.isError ? <AlertTriangle className="history-err" size={13} /> : <span />}
              </button>
            ))}
          {history.length === 0 ? (
            <p className="muted">
              Not visited yet at this point of the walk. Scrub the timeline forward.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function VisitSparkline({
  history,
  total,
  currentSeq,
  onJumpTo,
  locked,
}: {
  history: TraceEvent[];
  total: number;
  currentSeq: number;
  onJumpTo: (seq: number) => void;
  locked: boolean;
}) {
  const W = 100;
  const H = 16;
  const playheadX = total > 1 ? (currentSeq / (total - 1)) * W : 0;
  return (
    <svg
      className="visit-sparkline"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Visit timeline: ${history.length} visits across ${total} events`}
    >
      <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="var(--hairline)" strokeWidth="0.5" />
      {history.map((ev) => {
        const x = total > 1 ? (ev.seq / (total - 1)) * W : W / 2;
        return (
          <circle
            key={ev.seq}
            cx={x}
            cy={H / 2}
            r={1.8}
            className={`spark-dot spark-${ev.action}`}
          >
            <title>
              #{ev.seq + 1}: {ev.action} — {ev.summary}
            </title>
          </circle>
        );
      })}
      <line
        x1={playheadX}
        y1={0}
        x2={playheadX}
        y2={H}
        className="spark-playhead"
        stroke="var(--ink)"
        strokeWidth="0.8"
      />
      {/* invisible click targets for jump */}
      {history.map((ev) => {
        const x = total > 1 ? (ev.seq / (total - 1)) * W : W / 2;
        return (
          <circle
            key={`hit-${ev.seq}`}
            cx={x}
            cy={H / 2}
            r={5}
            fill="transparent"
            style={{ cursor: locked ? "default" : "pointer" }}
            onClick={() => !locked && onJumpTo(ev.seq)}
          />
        );
      })}
    </svg>
  );
}

function clock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function copyToClipboard(text: string) {
  void navigator.clipboard?.writeText(text);
}
