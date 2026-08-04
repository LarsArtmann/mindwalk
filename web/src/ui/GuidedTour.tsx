import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface GuidedTourProps {
  onClose: () => void;
}

interface TourStep {
  title: string;
  body: string;
  selector: string;
  placement: "left" | "right" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to mindwalk",
    body: "This tool replays coding-agent sessions as light moving through a 3D map of your codebase. Each building is a file; light shows what the agent touched.",
    selector: ".viewport",
    placement: "center",
  },
  {
    title: "The session rail",
    body: "Your agent sessions live here — Claude Code, Codex, Crush, and pi. Click one to load its trace. Colored dots show the source harness.",
    selector: ".session-rail",
    placement: "left",
  },
  {
    title: "The city scene",
    body: "Files are buildings in a tree or terrain layout. Touched files glow: green = seen, blue = read, amber = edited. Click a building to inspect it.",
    selector: ".viewport",
    placement: "center",
  },
  {
    title: "The timeline",
    body: "Scrub through the session event by event. The colored bars show activity density. Press Space to play, arrows to step, S for speed.",
    selector: ".deck",
    placement: "right",
  },
  {
    title: "The event summary",
    body: "This card shows what's happening right now under the playhead — which tool ran, what files it touched, and the result summary.",
    selector: ".deck-foot",
    placement: "right",
  },
  {
    title: "The dock",
    body: "Dock buttons open panels: scene view, file inspector, agent lenses, and evaluation. Press ? to see all keyboard shortcuts anytime.",
    selector: ".dock",
    placement: "right",
  },
];

const TOUR_KEY = "mindwalk.tourCompleted";

export function GuidedTour({ onClose }: GuidedTourProps) {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const finish = () => {
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch {
      // storage unavailable
    }
    onClose();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, TOUR_STEPS.length - 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const placementClass =
    current.placement === "left"
      ? "tour-left"
      : current.placement === "right"
        ? "tour-right"
        : "tour-center";

  return (
    <div className="tour-backdrop" onClick={finish}>
      <div
        className={`tour-callout ${placementClass}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Tour step ${step + 1}: ${current.title}`}
      >
        <div className="tour-head">
          <span className="tour-step-count">
            {step + 1} / {TOUR_STEPS.length}
          </span>
          <button className="icon-btn" onClick={finish} aria-label="Skip tour">
            <X size={14} />
          </button>
        </div>
        <h3>{current.title}</h3>
        <p>{current.body}</p>
        <div className="tour-actions">
          {step > 0 ? (
            <button className="tour-btn tour-back" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : null}
          <button className="tour-btn tour-skip" onClick={finish}>
            Skip
          </button>
          {isLast ? (
            <button className="tour-btn tour-next tour-finish" onClick={finish}>
              Got it
            </button>
          ) : (
            <button className="tour-btn tour-next" onClick={() => setStep((s) => s + 1)}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Returns true if the tour has never been completed. */
export function tourNeeded(): boolean {
  try {
    return localStorage.getItem(TOUR_KEY) !== "1";
  } catch {
    return false;
  }
}

/** Reset the tour completion flag so it shows again on next load. */
export function resetTour() {
  try {
    localStorage.removeItem(TOUR_KEY);
  } catch {
    // storage unavailable
  }
}
