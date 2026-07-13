import { Mountain, TreePine } from "lucide-react";
import type { SceneView } from "../state/store";

interface ViewPanelProps {
  view: SceneView;
  onViewChange: (view: SceneView) => void;
  /** the legend line for the active view ("glow ∝ revisits", …) */
  note: string;
  /** during video export the scene canvas must not be swapped */
  locked?: boolean;
}

// pop content for the dock's scene section: how the stage renders. Future
// layer toggles (line-level lights, trail length, floor contrast) join this
// panel instead of growing the strip.
export function ViewPanel({ view, onViewChange, note, locked = false }: ViewPanelProps) {
  return (
    <div className="view-pop" role="radiogroup" aria-label="Scene view">
      <button
        role="radio"
        aria-checked={view === "tree"}
        className={view === "tree" ? "view-row active" : "view-row"}
        onClick={() => onViewChange("tree")}
        disabled={locked}
      >
        <TreePine size={14} />
        <span>Tree</span>
      </button>
      <button
        role="radio"
        aria-checked={view === "terrain"}
        className={view === "terrain" ? "view-row active" : "view-row"}
        onClick={() => onViewChange("terrain")}
        disabled={locked}
      >
        <Mountain size={14} />
        <span>Terrain</span>
      </button>
      <p className="view-note">
        {note}
        <span className="view-key">V</span>
      </p>
    </div>
  );
}
