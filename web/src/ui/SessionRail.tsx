import { Eye, EyeOff, FolderOpen, PanelLeftClose, RefreshCw, Search } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sessionVisible } from "../state/filters";
import { LogoMark } from "./LogoMark";
import { toggleRailShortcut } from "./shortcuts";
import type { SessionMeta } from "../types";

interface SessionRailProps {
  sessions: SessionMeta[];
  activeKey?: string;
  loading: boolean;
  hideEmpty: boolean;
  harnessFilter?: string;
  collapsed: boolean;
  onSelect: (key: string) => void;
  onRefresh: () => void;
  onHideEmptyChange: (hide: boolean) => void;
  onHarnessFilterChange: (harness?: string) => void;
  onCollapse: () => void;
  // opens the static full-repo map for a repo path in a new tab
  onOpenMap: (repo: string) => void;
  // the active session's repo, offered as the popover's one-click choice
  activeRepo?: string;
  // while a video export records, session switching is locked so it can't swap
  // the canvas or playhead out from under the recorder
  locked?: boolean;
  // the panel's authoritative (digest-based) status for the active session;
  // undefined = unknown (keep the list's approximate badge), null = no report
  activeReportState?: "running" | "done" | "stale" | "failed" | null;
}

// memo: the app re-renders every playback tick; the rail's props only change
// on scans, session switches, and filter changes
export const SessionRail = memo(function SessionRail({
  sessions,
  activeKey,
  loading,
  hideEmpty,
  harnessFilter,
  collapsed,
  onSelect,
  onRefresh,
  onHideEmptyChange,
  onHarnessFilterChange,
  onCollapse,
  onOpenMap,
  activeRepo,
  locked = false,
  activeReportState,
}: SessionRailProps) {
  const [query, setQuery] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState(() => {
    try {
      return (localStorage.getItem("mindwalk.sortBy") as SortKey) || "newest";
    } catch {
      return "newest" as SortKey;
    }
  });
  const mapPopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (mapPopRef.current?.contains(event.target as Node)) return;
      setMapOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMapOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mapOpen]);
  const harnesses = useMemo(() => [...new Set(sessions.map((s) => s.harness))].sort(), [sessions]);
  const emptyCount = useMemo(() => sessions.filter((s) => s.eventCount === 0).length, [sessions]);
  // a persisted filter can name a harness with no sessions this scan; treating
  // it as "all" avoids an empty list with no visible chip to clear it
  const effectiveHarness =
    harnessFilter && harnesses.includes(harnessFilter) ? harnessFilter : undefined;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((session) => {
      if (!sessionVisible(session, { hideEmpty, harness: effectiveHarness }, activeKey))
        return false;
      if (!q) return true;
      return `${session.title ?? ""} ${session.id} ${session.gitBranch ?? ""} ${session.harness}`
        .toLowerCase()
        .includes(q);
    });
  }, [sessions, query, hideEmpty, effectiveHarness, activeKey]);

  const sorted = useMemo(() => sortSessions(shown, sortBy), [shown, sortBy]);

  const grouped = useMemo(() => groupSessionsByDate(sorted), [sorted]);
  const toggleGroup = useCallback((label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  return (
    <aside className={collapsed ? "session-rail collapsed" : "session-rail"}>
      <div className="rail-head">
        <h1 className="wordmark">
          <LogoMark />
          <span>
            mindwalk<span className="spark">.</span>
          </span>
        </h1>
        <div className="rail-head-actions">
          <div className="rail-map" ref={mapPopRef}>
            <button
              className="icon-btn"
              onClick={() => setMapOpen((open) => !open)}
              aria-expanded={mapOpen}
              title="Open a repository map"
              aria-label="Open a repository map"
            >
              <FolderOpen size={15} />
            </button>
            {mapOpen ? (
              <div className="rail-map-pop">
                {activeRepo ? (
                  <button
                    className="rail-map-primary"
                    onClick={() => {
                      onOpenMap(activeRepo);
                      setMapOpen(false);
                    }}
                    title={`Open the map of ${activeRepo}`}
                  >
                    <FolderOpen size={14} aria-hidden />
                    <span className="rail-map-primary-text">
                      <span className="rail-map-primary-name">{repoBasename(activeRepo)}</span>
                      {/* the leading LRM pins the path's neutral "/" runs to
                          LTR order inside the RTL ellipsis-at-start trick */}
                      <span className="rail-map-primary-path">{"\u200E" + activeRepo}</span>
                    </span>
                  </button>
                ) : null}
                {activeRepo ? (
                  <div className="rail-map-divider" aria-hidden>
                    <span>or open any repository</span>
                  </div>
                ) : (
                  <p className="rail-map-label">Open a repository map</p>
                )}
                <form
                  className="rail-map-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const path = repoPath.trim();
                    if (path) {
                      onOpenMap(path);
                      setMapOpen(false);
                    }
                  }}
                >
                  <input
                    type="text"
                    className="rail-map-input"
                    placeholder="/path/to/repo"
                    value={repoPath}
                    onChange={(e) => setRepoPath(e.currentTarget.value)}
                    spellCheck={false}
                  />
                  <button type="submit" className="rail-map-go" disabled={repoPath.trim() === ""}>
                    Open
                  </button>
                </form>
              </div>
            ) : null}
          </div>
          <button
            className="icon-btn"
            onClick={onRefresh}
            disabled={locked}
            title="Rescan sessions"
            aria-label="Rescan sessions"
          >
            <RefreshCw size={15} />
          </button>
          <button
            className="icon-btn"
            onClick={onCollapse}
            title={`Hide sidebar (${toggleRailShortcut})`}
            aria-label="Hide session sidebar"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>
      </div>
      <div className="rail-controls">
        <label className="rail-filter">
          <Search size={14} aria-hidden />
          <input
            type="search"
            placeholder="Filter sessions"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            aria-label="Filter sessions"
          />
        </label>
        {harnesses.length > 1 || emptyCount > 0 ? (
          <div className="rail-chips" role="group" aria-label="Session filters">
            {harnesses.length > 1 ? (
              <>
                <button
                  className={effectiveHarness === undefined ? "chip active" : "chip"}
                  onClick={() => onHarnessFilterChange(undefined)}
                >
                  all
                </button>
                {harnesses.map((harness) => (
                  <button
                    key={harness}
                    className={effectiveHarness === harness ? "chip active" : "chip"}
                    onClick={() => onHarnessFilterChange(harness)}
                  >
                    {harnessLabel(harness)}
                  </button>
                ))}
              </>
            ) : null}
            {emptyCount > 0 ? (
              <button
                className={hideEmpty ? "eye-toggle" : "eye-toggle showing"}
                onClick={() => onHideEmptyChange(!hideEmpty)}
                aria-pressed={!hideEmpty}
                title={
                  hideEmpty
                    ? `Show ${emptyCount} empty sessions`
                    : `Hide ${emptyCount} empty sessions`
                }
                aria-label={
                  hideEmpty
                    ? `Show ${emptyCount} empty sessions`
                    : `Hide ${emptyCount} empty sessions`
                }
              >
                {hideEmpty ? <EyeOff size={13} aria-hidden /> : <Eye size={13} aria-hidden />}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="session-list" aria-busy={loading}>
        {grouped.length === 0 ? (
          <p className="muted" style={{ padding: "10px 8px" }}>
            {loading && sessions.length === 0 ? "Scanning sessions…" : "No matching sessions."}
          </p>
        ) : null}
        {grouped.map((group) => {
          const collapsed = collapsedGroups.has(group.label);
          return (
            <div key={group.label} className="session-group">
              <button
                className="session-group-head"
                onClick={() => toggleGroup(group.label)}
                aria-expanded={!collapsed}
              >
                <span className="session-group-label">{group.label}</span>
                <span className="session-group-count">{group.sessions.length}</span>
              </button>
              {!collapsed
                ? group.sessions.map((session) => (
                    <button
                      key={session.key}
                      className={session.key === activeKey ? "session-row active" : "session-row"}
                      onClick={() => onSelect(session.key)}
                      disabled={locked}
                    >
                      <span className="session-title">
                        <span className={`harness-dot harness-${session.harness}`} aria-hidden />
                        {session.title || session.id}
                      </span>
                      <span className="session-meta">
                        <span className="session-meta-text">
                          {harnessLabel(session.harness)} · {session.eventCount}{" "}
                          {session.eventCount === 1 ? "call" : "calls"}
                          {session.provider ? ` · ${session.provider}` : ""}
                          {session.promptTokens || session.completionTokens
                            ? ` · ${formatTokens(session.promptTokens || 0)}/${formatTokens(session.completionTokens || 0)} tok`
                            : ""}
                          {session.cost && session.cost > 0 ? ` · $${session.cost.toFixed(2)}` : ""}
                          {session.gitBranch ? ` · ${session.gitBranch}` : ""}
                          {session.endedAt ? ` · ${relativeTime(session.endedAt)}` : ""}
                        </span>
                        {(() => {
                          const evalState =
                            session.key === activeKey && activeReportState !== undefined
                              ? activeReportState
                              : session.reportState;
                          return evalState ? (
                            <span
                              className={`rail-eval rail-eval-${evalState}`}
                              title={evalHint(evalState)}
                              aria-label={evalHint(evalState)}
                            >
                              {evalState === "running" ? "evaluating" : ""}
                            </span>
                          ) : null;
                        })()}
                      </span>
                    </button>
                  ))
                : null}
            </div>
          );
        })}
      </div>
      <div className="rail-foot">
        {shown.length === sessions.length
          ? `${sessions.length} session${sessions.length === 1 ? "" : "s"}`
          : `${shown.length} of ${sessions.length} sessions`}
      </div>
    </aside>
  );
});

function repoBasename(path: string): string {
  const clean = path.replace(/\/+$/, "");
  return clean.slice(clean.lastIndexOf("/") + 1) || clean;
}

function evalHint(state: "running" | "done" | "stale" | "failed"): string {
  switch (state) {
    case "running":
      return "Evaluation in progress";
    case "done":
      return "Evaluation ready";
    case "stale":
      return "Evaluation ready, but the session has grown since";
    case "failed":
      return "Last evaluation failed";
  }
}

function harnessLabel(harness: string): string {
  switch (harness) {
    case "claude-code":
      return "claude";
    default:
      return harness;
  }
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  const md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return sameYear ? `${md} ${hm}` : `${d.getFullYear()}-${md}`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 0) return "just now";
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 7) return `${day}d ago`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week}w ago`;
  return shortDate(iso);
}

function groupSessionsByDate(sessions: SessionMeta[]): SessionGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000);
  const monthStart = new Date(todayStart.getTime() - 29 * 86400000);

  const groups: Record<string, SessionMeta[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Older: [],
  };

  for (const session of sessions) {
    const d = session.endedAt ? new Date(session.endedAt) : null;
    if (!d || Number.isNaN(d.getTime())) {
      groups.Older.push(session);
    } else if (d >= todayStart) {
      groups.Today.push(session);
    } else if (d >= yesterdayStart) {
      groups.Yesterday.push(session);
    } else if (d >= weekStart) {
      groups["This Week"].push(session);
    } else if (d >= monthStart) {
      groups.Older.push(session);
    } else {
      groups.Older.push(session);
    }
  }

  return (Object.entries(groups) as [string, SessionMeta[]][])
    .filter(([, sessions]) => sessions.length > 0)
    .map(([label, sessions]) => ({ label, sessions }));
}
