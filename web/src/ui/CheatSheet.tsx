import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface CheatSheetProps {
  onClose: () => void;
}

interface ShortcutEntry {
  keys: string;
  description: string;
}

const SHORTCUTS: { group: string; entries: ShortcutEntry[] }[] = [
  {
    group: "Playback",
    entries: [
      { keys: "Space", description: "Play / pause" },
      { keys: "← →", description: "Step one event back / forward" },
      { keys: "Shift + ← →", description: "Jump 10 events back / forward" },
      { keys: "Home / End", description: "Jump to start / end" },
      { keys: "S", description: "Cycle playback speed (1× / 4× / 16×)" },
      { keys: "E", description: "Next edit event" },
      { keys: "Shift + E", description: "Previous edit event" },
      { keys: "X", description: "Next error" },
      { keys: "Shift + X", description: "Previous error" },
      { keys: "M", description: "Next mark" },
      { keys: "Shift + M", description: "Previous mark" },
    ],
  },
  {
    group: "Navigation",
    entries: [
      { keys: "⌘P / Ctrl+P", description: "Open file command palette" },
      { keys: "V", description: "Toggle tree / terrain scene" },
      { keys: "⌘B / Ctrl+B", description: "Toggle session sidebar" },
    ],
  },
  {
    group: "View",
    entries: [
      { keys: "H", description: "Toggle HUD overlay" },
      { keys: "?", description: "Show this cheat sheet" },
    ],
  },
];

export function CheatSheet({ onClose }: CheatSheetProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className="cheat-sheet"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        <div className="cheat-head">
          <h2>Shortcuts</h2>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close cheat sheet"
            title="Close (Escape)"
          >
            <X size={15} />
          </button>
        </div>
        <div className="cheat-body">
          {SHORTCUTS.map((section) => (
            <div key={section.group} className="cheat-group">
              <p className="cheat-group-title">{section.group}</p>
              {section.entries.map((entry) => (
                <div key={entry.keys} className="cheat-row">
                  <kbd>{entry.keys}</kbd>
                  <span>{entry.description}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
