import { AlertTriangle, RefreshCw, Sparkles, X } from "lucide-react";
import type { ReportDimension, ReportStatus, Severity, Verdict } from "../types";

interface ReportPanelProps {
  status?: ReportStatus;
  analyzing: boolean;
  onAnalyze: () => void;
  onClose: () => void;
  /** jump the playhead to an evidence seq and focus its file in the scene */
  onJumpTo: (seq: number) => void;
}

const DIMENSION_WORDS: Record<string, { title: string; hint: string }> = {
  exploration: { title: "Exploration", hint: "Did the agent build enough understanding before editing?" },
  scope: { title: "Scope", hint: "Does the footprint match what the task needed?" },
  wandering: { title: "Wandering", hint: "Purposeful path, or circles and dead ends?" },
  verification: { title: "Verification", hint: "Were edits verified, and errors followed up?" }
};

// dock panel content: the session evaluation. The Dock owns positioning;
// this owns only its own markup.
export function ReportPanel({ status, analyzing, onAnalyze, onClose, onJumpTo }: ReportPanelProps) {
  return (
    <div className="dock-body" aria-label="Session evaluation">
      <div className="inspector-head">
        <div>
          <div className="inspector-path">Evaluation</div>
          {status?.report ? (
            <div className="report-meta">
              judged by {status.report.judge.cli} · {day(status.report.judge.generatedAt)}
            </div>
          ) : null}
        </div>
        <button className="icon-btn" onClick={onClose} title="Close" aria-label="Close evaluation">
          <X size={15} />
        </button>
      </div>
      <PanelBody status={status} analyzing={analyzing} onAnalyze={onAnalyze} onJumpTo={onJumpTo} />
    </div>
  );
}

function PanelBody({
  status,
  analyzing,
  onAnalyze,
  onJumpTo
}: Pick<ReportPanelProps, "status" | "analyzing" | "onAnalyze" | "onJumpTo">) {
  if (!status) {
    return <p className="report-note">Checking for an existing report…</p>;
  }
  if (status.state === "running" || analyzing) {
    return (
      <div className="report-note">
        <p className="report-running">Judging the trajectory…</p>
        <p>
          The judge reads the whole trace and writes evidence-anchored findings. This usually takes about a
          minute; you can keep exploring meanwhile.
        </p>
      </div>
    );
  }
  if (status.state === "failed") {
    return (
      <div className="report-note">
        <p className="report-error">
          <AlertTriangle size={13} /> Evaluation failed
        </p>
        <p className="report-error-detail">{status.error}</p>
        <button className="report-run" onClick={onAnalyze}>
          <RefreshCw size={13} />
          Retry
        </button>
      </div>
    );
  }
  if (status.state === "none" || !status.report) {
    if (!status.judgeAvailable) {
      return (
        <p className="report-note">
          Evaluation needs a local agent CLI as judge. Install <code>claude</code> or <code>codex</code> and
          make it available on PATH.
        </p>
      );
    }
    return (
      <div className="report-note">
        <p>
          Ask <strong>{status.judgeCli}</strong> to evaluate this session: how the agent explored, whether the
          footprint matched the task, where it wandered, and how it verified its work. Every finding links back
          to the timeline.
        </p>
        <button className="report-run" onClick={onAnalyze}>
          <Sparkles size={13} />
          Evaluate session
        </button>
        <p className="report-cost">Runs your local {status.judgeCli} CLI · about a minute</p>
      </div>
    );
  }

  const report = status.report;
  return (
    <div className="report-body">
      {status.stale ? (
        <div className="report-stale">
          <span>Based on {report.session.eventCount} events — the session has grown since.</span>
          <button className="report-rerun" onClick={onAnalyze} title="Re-evaluate with the current trace">
            <RefreshCw size={12} />
            Re-evaluate
          </button>
        </div>
      ) : null}
      <p className="report-task">{report.taskSummary}</p>
      {report.dimensions.map((dimension) => (
        <Dimension key={dimension.name} dimension={dimension} onJumpTo={onJumpTo} />
      ))}
      {report.notableMoments?.length ? (
        <section>
          <p className="eyebrow">Moments</p>
          {report.notableMoments.map((moment) => (
            <button
              key={moment.seq}
              className="report-moment"
              onClick={() => onJumpTo(moment.seq)}
              title={`Jump to step ${moment.seq + 1}`}
            >
              <strong>#{moment.seq + 1}</strong>
              <span>{moment.note}</span>
            </button>
          ))}
        </section>
      ) : null}
      <section>
        <p className="eyebrow">Narrative</p>
        <p className="report-narrative">{report.narrative}</p>
      </section>
    </div>
  );
}

function Dimension({ dimension, onJumpTo }: { dimension: ReportDimension; onJumpTo: (seq: number) => void }) {
  const words = DIMENSION_WORDS[dimension.name] ?? { title: dimension.name, hint: "" };
  return (
    <section className="report-dimension">
      <div className="report-dimension-head" data-hint={words.hint}>
        <span className="report-dimension-name">{words.title}</span>
        <span className={`verdict verdict-${dimension.verdict}`}>{verdictWord(dimension.verdict)}</span>
      </div>
      {dimension.findings.map((finding, index) => (
        <button
          key={index}
          className="report-finding"
          onClick={() => {
            const seq = finding.evidenceSeqs?.[0];
            if (seq !== undefined) onJumpTo(seq);
          }}
          disabled={!finding.evidenceSeqs?.length}
          title={
            finding.evidenceSeqs?.length
              ? `Jump to step ${finding.evidenceSeqs[0] + 1} — evidence: ${finding.evidenceSeqs.map((seq) => `#${seq + 1}`).join(" ")}`
              : undefined
          }
        >
          <span className={`severity-dot ${severityClass(finding.severity)}`} />
          <span className="report-claim">{finding.claim}</span>
        </button>
      ))}
    </section>
  );
}

function verdictWord(verdict: Verdict): string {
  return verdict === "insufficient-data" ? "no signal" : verdict;
}

function severityClass(severity: Severity): string {
  return `sev-${severity}`;
}

function day(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
