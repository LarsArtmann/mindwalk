import { Flame, Mountain, TreePine } from "lucide-react";
import type { SceneView } from "../state/store";

interface ViewPanelProps {
  view: SceneView;
  onViewChange: (view: SceneView) => void;
  /** the legend line for the active view ("glow ∝ revisits", …) */
  note: string;
  /** during video export the scene canvas must not be swapped */
  locked?: boolean;
  /** edit heat overlay: when on, the minimap recolors by edit density */
  heatMode?: boolean;
  onHeatModeChange?: (on: boolean) => void;
}

// pop content for the dock's scene section: how the stage renders. Future
// layer toggles (line-level lights, trail length, floor contrast) join this
// panel instead of growing the strip.
export function ViewPanel({
  view,
  onViewChange,
  note,
  locked = false,
  heatMode = false,
  onHeatModeChange,
}: ViewPanelProps) {
  return (
    // toggle buttons rather than a radiogroup: the full radio pattern would
    // demand roving tabindex + arrow-key navigation these buttons don't have
    <div className="view-pop" role="group" aria-label="Scene view">
      <button
        aria-pressed={view === "tree"}
        className={view === "tree" ? "view-row active" : "view-row"}
        onClick={() => onViewChange("tree")}
        disabled={locked}
        data-hint="Tree view: each file is a block, height = line count, touch state = color"
      >
        <TreePine size={14} />
        <span>Tree</span>
      </button>
      <button
        aria-pressed={view === "terrain"}
        className={view === "terrain" ? "view-row active" : "view-row"}
        onClick={() => onViewChange("terrain")}
        disabled={locked}
        data-hint="Terrain view: extruded city blocks, height = size, glow = revisits"
      >
        <Mountain size={14} />
        <span>Terrain</span>
      </button>
      {onHeatModeChange ? (
        <button
          aria-pressed={heatMode}
          className={heatMode ? "view-row active" : "view-row"}
          onClick={() => onHeatModeChange(!heatMode)}
          disabled={locked}
          data-hint="Edit heatmap: recolor the minimap by edit count — red = most edited"
        >
          <Flame size={14} />
          <span>Heat</span>
        </button>
      ) : null}
      <p className="view-note">
        {note}
        <span className="view-key">V</span>
      </p>
    </div>
  );
}
