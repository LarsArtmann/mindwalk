import { memo, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { touchWord, type CityMap, type Touch } from "../types";
import type { FilePlayback } from "../playback/reducer";

function pathMatches(query: string, path: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return path.toLowerCase().includes(q);
}

interface MinimapProps {
  city?: CityMap;
  playback: FilePlayback;
  selectedPath?: string;
  onSelect: (path?: string) => void;
  heatMode?: boolean;
  editCounts?: Map<string, number>;
}

const COLORS: Record<Touch | "unvisited", string> = {
  edit: "var(--act-edit)",
  read: "var(--act-read)",
  hit: "var(--act-search)",
  unvisited: "var(--hairline)",
};

interface CameraState {
  tx: number;
  tz: number;
  dist: number;
}

export const Minimap = memo(function Minimap({
  city,
  playback,
  selectedPath,
  onSelect,
  heatMode = false,
  editCounts,
}: MinimapProps) {
  const [cam, setCam] = useState<CameraState | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let frame = 0;
    const onCamera = (e: Event) => {
      const detail = (e as CustomEvent).detail as CameraState;
      frame++;
      if (frame % 6 === 0) setCam(detail);
    };
    window.addEventListener("mindwalk:camera-state", onCamera as EventListener);
    return () =>
      window.removeEventListener(
        "mindwalk:camera-state",
        onCamera as EventListener,
      );
  }, []);

  const layout = useMemo(() => {
    if (!city || city.files.length === 0) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const f of city.files) {
      minX = Math.min(minX, f.rect.x);
      maxX = Math.max(maxX, f.rect.x + f.rect.w);
      minZ = Math.min(minZ, f.rect.z);
      maxZ = Math.max(maxZ, f.rect.z + f.rect.d);
    }
    return { minX, minZ, w: maxX - minX || 1, d: maxZ - minZ || 1 };
  }, [city]);

  const maxEdits = useMemo(
    () => (editCounts ? Math.max(1, ...editCounts.values()) : 1),
    [editCounts],
  );

  const hasSearch = search.trim().length > 0;

  if (!city || !layout) return null;

  const S = 140;
  const pad = 4;
  const scaleX = (x: number) =>
    pad + ((x - layout.minX) / layout.w) * (S - 2 * pad);
  const scaleZ = (z: number) =>
    pad + ((z - layout.minZ) / layout.d) * (S - 2 * pad);
  const scaleW = (w: number) => (w / layout.w) * (S - 2 * pad);
  const scaleD = (d: number) => (d / layout.d) * (S - 2 * pad);

  const camX = cam ? scaleX(cam.tx) : null;
  const camZ = cam ? scaleZ(cam.tz) : null;
  const camRadius = cam
    ? Math.max(6, Math.min(40, (cam.dist / layout.w) * S * 0.3))
    : 0;

  return (
    <div className="minimap-container" aria-label="Scene minimap">
      <div className="minimap-search">
        <Search size={11} aria-hidden />
        <input
          type="search"
          placeholder="filter files…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          aria-label="Filter files in minimap"
        />
        {hasSearch ? (
          <button
            className="minimap-search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear filter"
          >
            <X size={11} />
          </button>
        ) : null}
      </div>
      <svg
        width={S}
        height={S}
        viewBox={`0 0 ${S} ${S}`}
        preserveAspectRatio="xMidYMid meet"
        className="minimap-svg"
        role="img"
        aria-label="Repository overview"
      >
        {city.dirs.slice(0, 30).map((dir) => (
          <rect
            key={dir.path}
            x={scaleX(dir.rect.x)}
            y={scaleZ(dir.rect.z)}
            width={scaleW(dir.rect.w)}
            height={scaleD(dir.rect.d)}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth={0.3}
            opacity={0.4}
          />
        ))}
        {city.files.map((file) => {
          const touch = playback.touchByPath.get(file.path);
          const isSelected = file.path === selectedPath;
          const edits = editCounts?.get(file.path) ?? 0;
          const matched = !hasSearch || pathMatches(search, file.path);
          let fill: string;
          let opacity: number;
          if (heatMode && edits > 0) {
            const intensity = edits / maxEdits;
            fill =
              intensity > 0.66
                ? "var(--alarm, #e05555)"
                : intensity > 0.33
                  ? "var(--amber, #e0a458)"
                  : "var(--moss)";
            opacity = (0.3 + intensity * 0.7) * (matched ? 1 : 0.15);
          } else {
            const colorKey = touch ?? "unvisited";
            fill = COLORS[colorKey];
            opacity = (touch ? 0.8 : 0.2) * (matched ? 1 : 0.15);
          }
          return (
            <rect
              key={file.id}
              x={scaleX(file.rect.x)}
              y={scaleZ(file.rect.z)}
              width={Math.max(1, scaleW(file.rect.w))}
              height={Math.max(1, scaleD(file.rect.d))}
              fill={fill}
              fillOpacity={opacity}
              stroke={isSelected ? "var(--ember)" : "none"}
              strokeWidth={isSelected ? 1 : 0}
            >
              <title>
                {file.path} —{" "}
                {heatMode && edits > 0 ? `${edits} edits` : touchWord(touch)}
              </title>
            </rect>
          );
        })}
        {camX !== null && camZ !== null ? (
          <circle
            cx={camX}
            cy={camZ}
            r={camRadius}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={0.8}
            strokeDasharray="2 2"
            opacity={0.6}
          />
        ) : null}
      </svg>
    </div>
  );
});
