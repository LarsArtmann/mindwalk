import type { CityMap, Trace } from "../types";

/** A compact demo session showing mindwalk's core visualization.
 *  Synthetic but realistic: reads, edits, an error, marks, and stats
 *  that exercise the timeline, scene, and HUD. */

const DEMO_FILES = [
  { id: 0, path: "src/main.ts", dir: "src", lines: 45, bytes: 980, lang: "ts" },
  { id: 1, path: "src/app.ts", dir: "src", lines: 220, bytes: 6200, lang: "ts" },
  { id: 2, path: "src/lib/parser.ts", dir: "src/lib", lines: 180, bytes: 5100, lang: "ts" },
  { id: 3, path: "src/lib/utils.ts", dir: "src/lib", lines: 95, bytes: 2400, lang: "ts" },
  { id: 4, path: "src/lib/config.ts", dir: "src/lib", lines: 60, bytes: 1500, lang: "ts" },
  { id: 5, path: "src/ui/Button.tsx", dir: "src/ui", lines: 40, bytes: 900, lang: "tsx" },
  { id: 6, path: "src/ui/Modal.tsx", dir: "src/ui", lines: 85, bytes: 2100, lang: "tsx" },
  { id: 7, path: "src/ui/Header.tsx", dir: "src/ui", lines: 55, bytes: 1400, lang: "tsx" },
  { id: 8, path: "src/api/client.ts", dir: "src/api", lines: 130, bytes: 3800, lang: "ts" },
  { id: 9, path: "src/api/types.ts", dir: "src/api", lines: 70, bytes: 1800, lang: "ts" },
  { id: 10, path: "tests/parser.test.ts", dir: "tests", lines: 110, bytes: 3200, lang: "ts" },
  { id: 11, path: "tests/utils.test.ts", dir: "tests", lines: 65, bytes: 1700, lang: "ts" },
  { id: 12, path: "package.json", dir: "", lines: 35, bytes: 850, lang: "json" },
  { id: 13, path: "README.md", dir: "", lines: 80, bytes: 2400, lang: "md" },
  { id: 14, path: ".gitignore", dir: "", lines: 12, bytes: 180, lang: "text" },
];

function buildDemoCity(): CityMap {
  const cols = 5;
  const fileW = 4;
  const fileD = 4;
  const gap = 1.5;
  const stride = fileW + gap;
  const files = DEMO_FILES.map((f, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      ...f,
      rect: {
        x: col * stride - (cols * stride) / 2,
        z: row * stride - (Math.ceil(DEMO_FILES.length / cols) * stride) / 2,
        w: fileW,
        d: fileD,
      },
      ghost: false,
    };
  });

  const dirs = [
    { path: "src", depth: 0 },
    { path: "src/lib", depth: 1 },
    { path: "src/ui", depth: 1 },
    { path: "src/api", depth: 1 },
    { path: "tests", depth: 0 },
  ].map((d) => ({
    ...d,
    rect: { x: 0, z: 0, w: 0, d: 0 },
    fileCount: files.filter((f) => f.dir === d.path || f.dir.startsWith(d.path + "/")).length,
    lines: files
      .filter((f) => f.dir === d.path || f.dir.startsWith(d.path + "/"))
      .reduce((sum, f) => sum + f.lines, 0),
  }));

  return {
    version: 1,
    repo: {
      root: "demo-project",
      commit: "a1b2c3d",
      dirty: true,
      generatedAt: new Date().toISOString(),
    },
    files,
    dirs,
    layout: { algorithm: "demo", weight: "lines" },
  };
}

function buildDemoTrace(): Trace {
  const now = new Date();
  const iso = (offset: number) => new Date(now.getTime() + offset * 1000).toISOString();

  const events = [
    { seq: 0, ts: iso(0), tool: "Grep", action: "search" as const, targets: [{ path: "src/lib/parser.ts", touch: "hit" as const }], resultBytes: 1200, isError: false, summary: "searched for 'parseConfig' across src/" },
    { seq: 1, ts: iso(3), tool: "Read", action: "read" as const, targets: [{ path: "src/lib/parser.ts", touch: "read" as const }], resultBytes: 5100, isError: false, summary: "read src/lib/parser.ts" },
    { seq: 2, ts: iso(6), tool: "Read", action: "read" as const, targets: [{ path: "src/lib/config.ts", touch: "read" as const }], resultBytes: 1500, isError: false, summary: "read src/lib/config.ts" },
    { seq: 3, ts: iso(10), tool: "Read", action: "read" as const, targets: [{ path: "src/app.ts", touch: "read" as const }], resultBytes: 6200, isError: false, summary: "read src/app.ts" },
    { seq: 4, ts: iso(14), tool: "Read", action: "read" as const, targets: [{ path: "src/ui/Modal.tsx", touch: "read" as const }], resultBytes: 2100, isError: false, summary: "read src/ui/Modal.tsx" },
    { seq: 5, ts: iso(18), tool: "Edit", action: "edit" as const, targets: [{ path: "src/lib/parser.ts", touch: "edit" as const, lines: [[20, 35] as [number, number]] }], resultBytes: 800, isError: false, summary: "refactored parseConfig to accept options" },
    { seq: 6, ts: iso(22), tool: "Edit", action: "edit" as const, targets: [{ path: "src/lib/parser.ts", touch: "edit" as const, lines: [[40, 55] as [number, number]] }], resultBytes: 600, isError: false, summary: "added error handling to parse loop" },
    { seq: 7, ts: iso(26), tool: "Edit", action: "edit" as const, targets: [{ path: "src/app.ts", touch: "edit" as const, lines: [[100, 120] as [number, number]] }], resultBytes: 900, isError: false, summary: "wired new parser options into app init" },
    { seq: 8, ts: iso(30), tool: "Bash", action: "exec" as const, targets: [], resultBytes: 400, isError: false, summary: "npm run build" },
    { seq: 9, ts: iso(33), tool: "Bash", action: "verify" as const, targets: [], resultBytes: 2400, isError: true, summary: "npm test — 1 test failed" },
    { seq: 10, ts: iso(37), tool: "Read", action: "read" as const, targets: [{ path: "tests/parser.test.ts", touch: "read" as const }], resultBytes: 3200, isError: false, summary: "read tests/parser.test.ts to debug failure" },
    { seq: 11, ts: iso(41), tool: "Read", action: "read" as const, targets: [{ path: "src/lib/parser.ts", touch: "read" as const }], resultBytes: 5100, isError: false, summary: "re-read parser after test failure" },
    { seq: 12, ts: iso(45), tool: "Edit", action: "edit" as const, targets: [{ path: "src/lib/parser.ts", touch: "edit" as const, lines: [[30, 38] as [number, number]] }], resultBytes: 500, isError: false, summary: "fixed off-by-one in parse loop" },
    { seq: 13, ts: iso(49), tool: "Bash", action: "verify" as const, targets: [], resultBytes: 2200, isError: false, summary: "npm test — all tests passed" },
    { seq: 14, ts: iso(53), tool: "Read", action: "read" as const, targets: [{ path: "src/ui/Button.tsx", touch: "read" as const }], resultBytes: 900, isError: false, summary: "read Button component for styling reference" },
    { seq: 15, ts: iso(57), tool: "Edit", action: "edit" as const, targets: [{ path: "src/ui/Modal.tsx", touch: "edit" as const, lines: [[15, 30] as [number, number]] }], resultBytes: 700, isError: false, summary: "updated Modal to match Button styling" },
    { seq: 16, ts: iso(61), tool: "Grep", action: "search" as const, targets: [{ path: "src/api/client.ts", touch: "hit" as const }], resultBytes: 300, isError: false, summary: "searched for 'fetch' in src/" },
    { seq: 17, ts: iso(65), tool: "Read", action: "read" as const, targets: [{ path: "src/api/client.ts", touch: "read" as const }], resultBytes: 3800, isError: false, summary: "read API client" },
    { seq: 18, ts: iso(69), tool: "Edit", action: "edit" as const, targets: [{ path: "src/api/client.ts", touch: "edit" as const, lines: [[45, 60] as [number, number]] }], resultBytes: 800, isError: false, summary: "added retry logic to fetch calls" },
    { seq: 19, ts: iso(73), tool: "Bash", action: "verify" as const, targets: [], resultBytes: 2300, isError: false, summary: "npm test — all 12 tests passed" },
  ];

  const marks = [
    { seq: 0, type: "user-message" as const, note: "Fix the parser bug and improve Modal styling" },
    { seq: 8, type: "thinking" as const },
    { seq: 9, type: "finish-reason" as const },
    { seq: 13, type: "thinking" as const },
  ];

  return {
    version: 1,
    session: {
      id: "demo-session",
      harness: "demo",
      model: "demo-model",
      title: "Demo: Fix parser bug + improve UI",
      cwd: "demo-project",
      startedAt: iso(0),
      endedAt: iso(73),
      eventCount: events.length,
    },
    events,
    marks,
    stats: {
      filesInRepo: 15,
      fovea: 7,
      parafovea: 9,
      edited: 4,
      eventsBeforeFirstEdit: 5,
      regressionRate: 0.12,
      errorRate: 0.05,
      actions: { search: 2, read: 7, edit: 6, exec: 1, verify: 3, other: 0 },
      errors: { search: 0, read: 0, edit: 0, exec: 0, verify: 1, other: 0 },
      maxEditsPerFile: 3,
      churnFiles: 1,
      userTurns: 1,
      compactions: 0,
      subagents: 0,
      resultBytes: 39400,
      editsAfterLastVerify: 0,
      observability: { reads: "exact", errors: "exact" },
    },
  };
}

export function getDemoData(): { trace: Trace; city: CityMap } {
  return { trace: buildDemoTrace(), city: buildDemoCity() };
}
