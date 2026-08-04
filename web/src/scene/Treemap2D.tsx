import { useEffect, useMemo, useRef } from "react";
import { touchWord, type CityFile, type CityMap, type Touch } from "../types";
import type { FilePlayback } from "../playback/reducer";

interface Treemap2DProps {
  city?: CityMap;
  playback: FilePlayback;
  selectedPath?: string;
  onSelect: (path?: string) => void;
}

/** Detect whether a WebGL context can be created. Called once at module load. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl") || !!canvas.getContext("experimental-webgl");
  } catch {
    return false;
  }
}

const COLORS: Record<Touch | "unvisited" | "selected", string> = {
  edit: "var(--act-edit)",
  read: "var(--act-read)",
  hit: "var(--act-search)",
  unvisited: "var(--hairline)",
  selected: "var(--ember)",
};

/** 2D fallback scene: renders the city as an SVG treemap when WebGL is
 *  unavailable. Reuses the same touch-state coloring and click-to-select
 *  API so the rest of the app works identically. */
export function Treemap2D({ city, playback, selectedPath, onSelect }: Treemap2DProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

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
    return { minX, maxX, minZ, maxZ, w: maxX - minX, d: maxZ - minZ };
  }, [city]);

  if (!city || !layout) {
    return (
      <div className="treemap2d-empty">
        <p>No map data. Load a session to see the codebase.</p>
      </div>
    );
  }

  const padding = 8;
  const svgW = 1000;
  const svgH = (layout.d / layout.w) * svgW || 600;

  const scaleX = (x: number) => padding + ((x - layout.minX) / layout.w) * (svgW - 2 * padding);
  const scaleZ = (z: number) => padding + ((z - layout.minZ) / layout.d) * (svgH - 2 * padding);
  const scaleW = (w: number) => (w / layout.w) * (svgW - 2 * padding);
  const scaleD = (d: number) => (d / layout.d) * (svgH - 2 * padding);

  return (
    <div className="treemap2d-container">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        className="treemap2d-svg"
        role="img"
        aria-label="Repository map (2D fallback)"
      >
        {city.dirs.map((dir) => (
          <rect
            key={dir.path}
            x={scaleX(dir.rect.x)}
            y={scaleZ(dir.rect.z)}
            width={scaleW(dir.rect.w)}
            height={scaleD(dir.rect.d)}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth={0.5}
            rx={2}
          />
        ))}
        {city.files.map((file) => {
          const touch = playback.touchByPath.get(file.path);
          const isSelected = file.path === selectedPath;
          const colorKey = isSelected ? "selected" : touch ?? "unvisited";
          return (
            <rect
              key={file.id}
              x={scaleX(file.rect.x)}
              y={scaleZ(file.rect.z)}
              width={scaleW(file.rect.w)}
              height={scaleD(file.rect.d)}
              fill={COLORS[colorKey]}
              fillOpacity={touch || isSelected ? 0.75 : 0.25}
              stroke={isSelected ? "var(--ember)" : "var(--hairline)"}
              strokeWidth={isSelected ? 1.5 : 0.3}
              rx={1}
              className="treemap2d-file"
              onClick={() => onSelect(isSelected ? undefined : file.path)}
            >
              <title>
                {file.path} — {touchWord(touch)}, {file.lines} lines
              </title>
            </rect>
          );
        })}
      </svg>
      <div className="treemap2d-notice">2D mode — WebGL unavailable</div>
    </div>
  );
}
