import { Crosshair, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { ReportStatus } from "../types";

export type DockTab = "inspect" | "evaluate";

interface DockProps {
  /** which panel is open; null renders the strip alone */
  tab: DockTab | null;
  /** tabs offered by the current mode (map-only drops evaluate) */
  tabs: DockTab[];
  onTabChange: (tab: DockTab | null) => void;
  reportStatus?: ReportStatus;
  children: ReactNode;
}

/**
 * The right-edge dock: a persistent strip of panel toggles plus the open
 * panel. Session-depth features (inspect, evaluate, future compare/metrics)
 * each get one strip entry — new panels extend the strip instead of
 * inventing new floating buttons.
 */
export function Dock({ tab, tabs, onTabChange, reportStatus, children }: DockProps) {
  return (
    <div className="dock">
      {tab ? <aside className="dock-panel">{children}</aside> : null}
      <div className="dock-strip" role="tablist" aria-label="Session panels">
        {tabs.includes("inspect") ? (
          <button
            role="tab"
            aria-selected={tab === "inspect"}
            className={tab === "inspect" ? "active" : ""}
            onClick={() => onTabChange(tab === "inspect" ? null : "inspect")}
            data-hint="Inspect the selected file"
            aria-label="Inspect the selected file"
          >
            <Crosshair size={15} />
          </button>
        ) : null}
        {tabs.includes("evaluate") ? (
          <button
            role="tab"
            aria-selected={tab === "evaluate"}
            className={tab === "evaluate" ? "active" : ""}
            onClick={() => onTabChange(tab === "evaluate" ? null : "evaluate")}
            data-hint={evaluateHint(reportStatus)}
            aria-label="Session evaluation"
          >
            <Sparkles size={15} />
            {badgeState(reportStatus) ? (
              <span className={`dock-dot dock-dot-${badgeState(reportStatus)}`} />
            ) : null}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function badgeState(status?: ReportStatus): "running" | "done" | "stale" | "failed" | "" {
  if (!status) return "";
  if (status.state === "running") return "running";
  if (status.state === "failed") return "failed";
  if (status.state === "done") return status.stale ? "stale" : "done";
  return "";
}

function evaluateHint(status?: ReportStatus): string {
  switch (badgeState(status)) {
    case "running":
      return "The judge is reading the trace — about a minute";
    case "done":
      return "Evaluation ready";
    case "stale":
      return "Evaluation ready, but the session has grown since";
    case "failed":
      return "The last evaluation failed — open to retry";
    default:
      return "Evaluate this session with your local agent CLI";
  }
}
