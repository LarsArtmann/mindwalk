import { describe, it, expect } from "vitest";
import { PlaybackEngine } from "./reducer";
import type { Action, CityFile, CityMap, Stats, Target, Touch, Trace, TraceEvent } from "../types";

const zeroStats: Stats = {
  filesInRepo: 0,
  fovea: 0,
  parafovea: 0,
  edited: 0,
  eventsBeforeFirstEdit: 0,
  regressionRate: 0,
  errorRate: 0,
  actions: { search: 0, read: 0, edit: 0, exec: 0, verify: 0, other: 0 },
  errors: { search: 0, read: 0, edit: 0, exec: 0, verify: 0, other: 0 },
  maxEditsPerFile: 0,
  churnFiles: 0,
  userTurns: 0,
  compactions: 0,
  subagents: 0,
  resultBytes: 0,
  editsAfterLastVerify: 0,
  observability: { reads: "unavailable", errors: "unavailable" },
};

function makeEvent(
  seq: number,
  targets: Target[],
  opts: { tool?: string; action?: Action; isError?: boolean } = {},
): TraceEvent {
  return {
    seq,
    tool: opts.tool ?? "test",
    action: opts.action ?? "other",
    targets,
    resultBytes: 0,
    isError: opts.isError ?? false,
    summary: "",
  };
}

function target(path: string, touch: Touch, fileId?: number, weak?: boolean): Target {
  return { path, touch, fileId, weak };
}

function makeCityFile(id: number, path: string): CityFile {
  return {
    id,
    path,
    dir: path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "",
    lines: 10,
    bytes: 100,
    rect: { x: 0, z: 0, w: 1, d: 1 },
    ghost: false,
  };
}

function makeCity(files: CityFile[]): CityMap {
  return {
    version: 1,
    repo: { root: "/test", dirty: false, generatedAt: "2026-01-01T00:00:00Z" },
    files,
    dirs: [],
    layout: { algorithm: "test", weight: "lines" },
  };
}

function makeTrace(events: TraceEvent[]): Trace {
  return {
    version: 1,
    session: { id: "test", harness: "test", eventCount: events.length },
    events,
    marks: [],
    stats: zeroStats,
  };
}

describe("PlaybackEngine", () => {
  describe("initial state", () => {
    it("returns empty snapshot before any events are applied", () => {
      const engine = new PlaybackEngine(
        makeTrace([makeEvent(0, [target("a.ts", "hit", 1)])]),
        makeCity([makeCityFile(1, "a.ts")]),
      );
      const snap = engine.snapshotAt(-1);
      expect(snap.touchByFile.size).toBe(0);
      expect(snap.touchByPath.size).toBe(0);
      expect(snap.visitsByFile.size).toBe(0);
      expect(snap.historyByPath.size).toBe(0);
      expect(snap.recentTargets).toHaveLength(0);
    });

    it("handles undefined trace and city", () => {
      const engine = new PlaybackEngine(undefined, undefined);
      const snap = engine.snapshotAt(0);
      expect(snap.touchByFile.size).toBe(0);
      expect(snap.recentTargets).toHaveLength(0);
    });
  });

  describe("touch state transitions", () => {
    it("advances hit then read then edit", () => {
      const events = [
        makeEvent(0, [target("a.ts", "hit", 1)]),
        makeEvent(1, [target("a.ts", "read", 1)]),
        makeEvent(2, [target("a.ts", "edit", 1)]),
      ];
      const engine = new PlaybackEngine(makeTrace(events), makeCity([makeCityFile(1, "a.ts")]));

      expect(engine.snapshotAt(0).touchByPath.get("a.ts")).toBe("hit");
      expect(engine.snapshotAt(1).touchByPath.get("a.ts")).toBe("read");
      expect(engine.snapshotAt(2).touchByPath.get("a.ts")).toBe("edit");
    });

    it("does not downgrade touch state (edit stays edit after weaker touch)", () => {
      const events = [
        makeEvent(0, [target("a.ts", "edit", 1)]),
        makeEvent(1, [target("a.ts", "hit", 1)]),
      ];
      const engine = new PlaybackEngine(makeTrace(events), makeCity([makeCityFile(1, "a.ts")]));
      const snap = engine.snapshotAt(1);
      expect(snap.touchByPath.get("a.ts")).toBe("edit");
      expect(snap.touchByFile.get(1)).toBe("edit");
    });

    it("updates touchByFile alongside touchByPath", () => {
      const events = [makeEvent(0, [target("a.ts", "read", 1)])];
      const engine = new PlaybackEngine(makeTrace(events), makeCity([makeCityFile(1, "a.ts")]));
      expect(engine.snapshotAt(0).touchByFile.get(1)).toBe("read");
    });

    it("resolves fileId from city when target has no fileId", () => {
      const events = [makeEvent(0, [target("a.ts", "read")])];
      const engine = new PlaybackEngine(makeTrace(events), makeCity([makeCityFile(1, "a.ts")]));
      const snap = engine.snapshotAt(0);
      expect(snap.touchByFile.get(1)).toBe("read");
      expect(snap.visitsByFile.get(1)).toBe(1);
    });
  });

  describe("visits", () => {
    it("counts visits per file across multiple events", () => {
      const events = [
        makeEvent(0, [target("a.ts", "hit", 1)]),
        makeEvent(1, [target("a.ts", "read", 1)]),
        makeEvent(2, [target("a.ts", "edit", 1)]),
        makeEvent(3, [target("b.ts", "hit", 2)]),
      ];
      const engine = new PlaybackEngine(
        makeTrace(events),
        makeCity([makeCityFile(1, "a.ts"), makeCityFile(2, "b.ts")]),
      );
      const snap = engine.snapshotAt(3);
      expect(snap.visitsByFile.get(1)).toBe(3);
      expect(snap.visitsByFile.get(2)).toBe(1);
    });
  });

  describe("history", () => {
    it("accumulates events per path in order", () => {
      const events = [
        makeEvent(0, [target("a.ts", "hit", 1)]),
        makeEvent(1, [target("a.ts", "read", 1)]),
        makeEvent(2, [target("b.ts", "hit", 2)]),
      ];
      const engine = new PlaybackEngine(
        makeTrace(events),
        makeCity([makeCityFile(1, "a.ts"), makeCityFile(2, "b.ts")]),
      );
      const snap = engine.snapshotAt(2);
      expect(snap.historyByPath.get("a.ts")).toHaveLength(2);
      expect(snap.historyByPath.get("b.ts")).toHaveLength(1);
      expect(snap.historyByPath.get("a.ts")![0].seq).toBe(0);
      expect(snap.historyByPath.get("a.ts")![1].seq).toBe(1);
    });
  });

  describe("recent targets", () => {
    it("keeps at most 12 targets (oldest evicted)", () => {
      const events = Array.from({ length: 15 }, (_, i) =>
        makeEvent(i, [target(`file${i}.ts`, "hit", i)]),
      );
      const engine = new PlaybackEngine(makeTrace(events), undefined);
      const snap = engine.snapshotAt(14);
      expect(snap.recentTargets).toHaveLength(12);
      expect(snap.recentTargets[0].path).toBe("file3.ts");
      expect(snap.recentTargets[11].path).toBe("file14.ts");
    });

    it("prefers non-weak target for the trail", () => {
      const events = [
        makeEvent(0, [target("weak.ts", "hit", 1, true), target("strong.ts", "hit", 2, false)]),
      ];
      const engine = new PlaybackEngine(
        makeTrace(events),
        makeCity([makeCityFile(1, "weak.ts"), makeCityFile(2, "strong.ts")]),
      );
      expect(engine.snapshotAt(0).recentTargets[0].path).toBe("strong.ts");
    });

    it("falls back to first target when all are weak", () => {
      const events = [
        makeEvent(0, [target("weak1.ts", "hit", 1, true), target("weak2.ts", "hit", 2, true)]),
      ];
      const engine = new PlaybackEngine(
        makeTrace(events),
        makeCity([makeCityFile(1, "weak1.ts"), makeCityFile(2, "weak2.ts")]),
      );
      expect(engine.snapshotAt(0).recentTargets[0].path).toBe("weak1.ts");
    });

    it("skips recent targets for events with no targets", () => {
      const events = [makeEvent(0, [])];
      const engine = new PlaybackEngine(makeTrace(events), undefined);
      expect(engine.snapshotAt(0).recentTargets).toHaveLength(0);
    });
  });

  describe("backward scrub (reset)", () => {
    it("replays from scratch when scrubbing backward", () => {
      const events = [
        makeEvent(0, [target("a.ts", "hit", 1)]),
        makeEvent(1, [target("b.ts", "edit", 2)]),
      ];
      const engine = new PlaybackEngine(
        makeTrace(events),
        makeCity([makeCityFile(1, "a.ts"), makeCityFile(2, "b.ts")]),
      );
      engine.snapshotAt(1);
      const snap = engine.snapshotAt(0);
      expect(snap.touchByPath.get("a.ts")).toBe("hit");
      expect(snap.touchByPath.has("b.ts")).toBe(false);
    });

    it("reset clears all accumulated state", () => {
      const events = [
        makeEvent(0, [target("a.ts", "edit", 1)]),
        makeEvent(1, [target("b.ts", "read", 2)]),
      ];
      const engine = new PlaybackEngine(
        makeTrace(events),
        makeCity([makeCityFile(1, "a.ts"), makeCityFile(2, "b.ts")]),
      );
      engine.snapshotAt(1);
      const snap = engine.snapshotAt(-1);
      expect(snap.touchByFile.size).toBe(0);
      expect(snap.touchByPath.size).toBe(0);
      expect(snap.visitsByFile.size).toBe(0);
      expect(snap.historyByPath.size).toBe(0);
      expect(snap.recentTargets).toHaveLength(0);
    });
  });

  describe("edge cases", () => {
    it("empty events array produces empty snapshot", () => {
      const engine = new PlaybackEngine(makeTrace([]), makeCity([]));
      const snap = engine.snapshotAt(5);
      expect(snap.touchByFile.size).toBe(0);
    });

    it("snapshotAt beyond last event clamps to last", () => {
      const events = [
        makeEvent(0, [target("a.ts", "hit", 1)]),
        makeEvent(1, [target("a.ts", "read", 1)]),
      ];
      const engine = new PlaybackEngine(makeTrace(events), makeCity([makeCityFile(1, "a.ts")]));
      const snap = engine.snapshotAt(100);
      expect(snap.touchByPath.get("a.ts")).toBe("read");
      expect(snap.visitsByFile.get(1)).toBe(2);
    });

    it("incremental forward stepping matches a single jump", () => {
      const events = [
        makeEvent(0, [target("a.ts", "hit", 1)]),
        makeEvent(1, [target("a.ts", "read", 1)]),
        makeEvent(2, [target("b.ts", "edit", 2)]),
        makeEvent(3, [target("a.ts", "edit", 1)]),
      ];
      const city = makeCity([makeCityFile(1, "a.ts"), makeCityFile(2, "b.ts")]);

      const jumpEngine = new PlaybackEngine(makeTrace(events), city);
      const jumpSnap = jumpEngine.snapshotAt(3);

      const stepEngine = new PlaybackEngine(makeTrace(events), city);
      stepEngine.snapshotAt(0);
      stepEngine.snapshotAt(1);
      stepEngine.snapshotAt(2);
      const stepSnap = stepEngine.snapshotAt(3);

      expect(stepSnap.touchByPath).toEqual(jumpSnap.touchByPath);
      expect(stepSnap.touchByFile).toEqual(jumpSnap.touchByFile);
      expect(stepSnap.visitsByFile).toEqual(jumpSnap.visitsByFile);
    });
  });
});
