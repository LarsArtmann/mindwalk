# 100 UI/UX Improvement Ideas for mindwalk

Each idea is specific to mindwalk's architecture and current state.
Priority legend: **P0** = high impact / low effort · **P1** = high impact / medium effort · **P2** = medium impact · **P3** = ambitious / high effort.

---

## A. Onboarding & First-Run Experience

1. **(P0)** Interactive guided tour on first launch — sequential callouts that highlight the scene, timeline scrubber, and dock panels, explaining the core "light is data" concept step by step. Gate on a `localStorage` flag so it only shows once.
2. **(P0)** Built-in demo session — ship a small fixture trace (the project already has `testdata/`) so new users with zero agent logs can see the visualization in action immediately instead of staring at an empty stage.
3. **(P0)** Keyboard cheat-sheet overlay (`?` key) — a single modal listing every shortcut (Space, arrows, S, V, E, X, M, Cmd-B) with descriptions. Currently shortcuts are only documented in the README.
4. **(P1)** First-run setup wizard when zero sessions are found — instead of the static "No sessions found" card, show a guided diagnostic: which directories were checked, which are missing, and copy-paste-ready paths to configure.
5. **(P1)** "What am I looking at?" context button in the HUD (`?` icon) that overlays inline explanations of the touch-state vocabulary (seen/read/edited/unvisited/ghost) directly on the spectrum legend.
6. **(P1)** Progressive disclosure for advanced panels — dim the Evaluation and Agent Lenses dock buttons until the user has played/paused at least once, reducing cognitive load on first encounter.
7. **(P2)** Onboarding micro-animation on the histogram — the first time a session loads, briefly pulse the cool/warm color spectrum with a one-line caption ("observation stays cool, mutation glows warm").
8. **(P2)** Welcome tooltip on the play button — a single dismissible hint pointing at `▶` saying "Press Space to replay the session as light through the map."

---

## B. Session Rail & Discovery

9. **(P0)** Session grouping by date — collapsible sections: Today, Yesterday, This Week, Older. The flat list becomes unmanageable past ~20 sessions.
10. **(P0)** Relative timestamps — show "2h ago" alongside the absolute time. The rail currently shows raw timestamps that require mental math.
11. **(P0)** Color-coded harness indicators — a small colored dot or left-border per source: Claude (purple), Codex (green), Crush (blue), pi (amber). Instant visual scanning by source.
12. **(P1)** Session grouping by repository/project — a toggle between date-grouped and repo-grouped views. Users working across multiple repos lose track of which session touched which codebase.
13. **(P1)** Session sorting dropdown — newest, oldest, most events, most edits, highest cost. Currently only newest-first is available.
14. **(P1)** Cost and token display in session rows — `SessionMeta` already carries `promptTokens`, `completionTokens`, and `cost` fields that are never shown in the rail.
15. **(P1)** Pin/star favorite sessions — a star toggle that pins sessions to the top of the list, persisted in `localStorage`.
16. **(P2)** Session preview card on hover — after a 500ms hover, show a mini-card with event count, edit count, coverage %, and evaluation status without requiring a click.
17. **(P2)** Session search by file path touched — extend the current text search (title/id/branch) to also match against file paths in the trace. The filter currently only searches metadata fields.
18. **(P2)** Session duration display — compute `endedAt - startedAt` and show wall-clock duration (e.g., "12m 34s") in the meta line.
19. **(P2)** Batch evaluate — multi-select checkboxes to queue evaluation across several sessions, useful for comparing agent performance.
20. **(P3)** Live evaluation progress inline — when a session is evaluating, show a thin progress bar or spinner inside its rail row, not just the badge dot.

---

## C. 3D Scene & Visualization

21. **(P0)** Minimap — a small corner overlay showing the full repo layout with a rectangle indicating the current camera viewport. Essential for navigation in large repos.
22. **(P0)** "Fly to file" command palette (`Cmd+P` / `Ctrl+P`) — type a path, the camera animates to that file. Currently the only way to find a file is to visually scan the 3D scene.
23. **(P0)** Zoom-to-fit / recenter button — a single click to reframe the entire map in view. Users get lost after panning and have no easy reset.
24. **(P0)** Edit-density heatmap overlay toggle — a layer that paints a heat gradient based on how many times each file was edited, independent of the touch-state coloring.
25. **(P1)** Directory click targets — clicking a directory region (not just a file) shows aggregate stats for that subtree: total files, files touched, total edits.
26. **(P1)** Scene search highlighting — type a path/glob query and matching files pulse or brighten while non-matches dim, making targeted exploration possible in large repos.
27. **(P1)** LOC-height toggle during sessions — currently LOC-height only works in map-only mode. Let users switch between attention-height and LOC-height even with a loaded trace.
28. **(P1)** Toggleable trail with styling options — the trail (trail.ts) exists but has no UI control. Add trail on/off, length slider, and opacity to the View panel.
29. **(P1)** Error visualization in the scene — files where errors occurred (events with `isError: true`) glow red or pulse, making failure hotspots visible at a glance.
30. **(P2)** Line-level heat within files — `Target.lines` carries specific line ranges. Show a mini heat indicator on the file's top face showing which lines were touched.
31. **(P2)** Temporal arc coloring — an alternative color mode where files touched early in the session are cool and late ones are warm, revealing the agent's temporal trajectory.
32. **(P2)** Co-edit connection lines — draw subtle arcs between files that were edited in the same event or adjacent events, revealing coupling.
33. **(P2)** Camera bookmark/preset — save a camera position (angle + zoom + target) and return to it with a key (1-9).
34. **(P2)** Auto-rotate toggle — slow ambient rotation for presentation/demo mode, useful when showing mindwalk to others.
35. **(P2)** Fog/depth slider — let users adjust the fog density to control visual depth perception in dense repos.
36. **(P2)** Ghost-file timeline — when ghost files appear, show a small indicator of when they disappeared (which event/seq they were last seen at).
37. **(P3)** User annotations on files — let users drop persistent text notes on specific files in the scene, stored in `localStorage`, for personal review.
38. **(P3)** LOD clustering for huge repos — at distance, collapse clusters of small files into single aggregate blocks to maintain framerate and clarity.
39. **(P3)** File-open animation — when a file is selected, animate it rising slightly or glowing brighter to confirm selection before the inspector opens.
40. **(P3)** Outside-touch visualization — `OutsideTouch` data (files outside the repo touched by the agent) is collected but not visualized. Show them as distant satellite markers.

---

## D. Timeline & Playback

41. **(P0)** Current event summary card — a floating card above the timeline showing the active event's tool, action, target, and summary. Currently the only readout is `seq/total` and a clock.
42. **(P0)** Zoomable timeline — scroll/pinch on the timeline strip to zoom into dense regions. Long sessions (500+ events) compress everything into unreadable bars.
43. **(P0)** Error markers on the strip — error events (`isError: true`) get a distinct red tick on the timeline, so failure clusters are visible at a glance.
44. **(P1)** Playback loop — select a range on the timeline and loop it for repeated close review of a specific phase.
45. **(P1)** Event list view — a scrollable, filterable list of all events synced to the scrubber. Click an event to jump. Essential for precise navigation.
46. **(P1)** User-turn jump shortcuts — dedicated keys `[` and `]` to jump between user-message marks. Marks exist but only `M` cycles all mark types indiscriminately.
47. **(P1)** Playback speed presets visible — show 1x/4x/16x as visible chips somewhere on the deck, not buried in the `⋯` menu.
48. **(P2)** Multi-track timeline — stack separate rows for search/read/edit/verify/exec so the action composition is readable, not just the dominant action per bucket.
49. **(P2)** Duration-based timeline — an alternative timeline mode that spaces events by wall-clock time (using `ts`) instead of equal-width sequence positions.
50. **(P2)** Bookmark bar — save named bookmarks at specific events for quick navigation, shown as a thin row above the strip.
51. **(P2)** Minimap of full timeline when zoomed — a thin overview strip above the zoomed timeline showing position in the whole session.
52. **(P2)** "Compare two points" — scrub two playheads to see the diff in the scene between two moments, useful for understanding what changed.
53. **(P2)** Result-bytes waveform — an alternative strip mode where bar height is `resultBytes` per event, revealing heavy I/O moments.
54. **(P3)** Thinking/compaction duration bands — show `mark.duration` as colored bands on the timeline so time spent thinking vs acting is visible.
55. **(P3)** Replay-from-here button — a dedicated control to restart playback from the current playhead position rather than from zero.

---

## E. HUD & Information Density

56. **(P0)** Collapsible HUD — a toggle (key `H`) to hide the entire HUD for a clean, unobstructed scene view. Useful for screenshots and presentations.
57. **(P0)** Coverage gauge — a prominent progress ring or bar showing "X% of repo files touched" using the existing `fovea`/`filesInRepo` data. The spectrum shows counts but not the ratio.
58. **(P1)** Session cost/token summary in the HUD — `SessionMeta` already carries token and cost data that's never surfaced in the main view.
59. **(P1)** Copy-to-clipboard for file paths — in the churn panel and inspector, a click-to-copy button on file paths. Currently paths are display-only.
60. **(P1)** Time-elapsed display — show total session duration and current position within it (e.g., "3:24 / 12:45") alongside the event counter.
61. **(P2)** Observability quality badge — `Stats.observability` grades each metric's signal quality (exact/estimated/unavailable). Surface this as a visible indicator so users know how much to trust the numbers.
62. **(P2)** Customizable HUD widget order — let users drag-and-drop or toggle which HUD elements (spectrum, review strip, quiet stats) are visible.
63. **(P2)** Breadcrumb path for selected file — show the selected file's directory hierarchy as clickable segments above the inspector, enabling quick navigation up the tree.
64. **(P2)** Session vs map mode indicator — make the distinction between "session playback" and "static repo map" more prominent than the current implicit `mapOnly` state.
65. **(P3)** Always-visible mini-legend — a persistent, compact legend in a screen corner that doesn't compete with the HUD's top-left placement.

---

## F. Inspector & File Details

66. **(P0)** Copy file path button — a clipboard icon next to the path in the inspector header.
67. **(P0)** Human-readable file size — show "12.3 KB" alongside or instead of raw byte counts. Currently `file.bytes.toLocaleString()` shows "12,698".
68. **(P1)** Visit sparkline — a mini timeline showing when this file was visited across the whole session, with the current playhead marked. Gives temporal context at a glance.
69. **(P1)** Line-range detail in visit history — `Target.lines` carries exact line ranges. Show which lines were touched per visit, not just the tool name.
70. **(P1)** Related files — files in the same directory or visited in adjacent events, shown as clickable chips for quick exploration.
71. **(P2)** File edit frequency mini-chart — "edited 5 times across 3 events" with a small bar chart showing edit distribution over time.
72. **(P2)** "Open in editor" button — launch the file in `$EDITOR` or the system default. Requires a server endpoint but the architecture supports it.
73. **(P2)** Diff preview — for edit visits, show a compact before/after diff of the touched lines (data may need adapter support).
74. **(P3)** File content preview — show the first N lines with syntax highlighting in a collapsible section.
75. **(P3)** "Files like this" suggestions — files with similar touch patterns, same language, or same directory, as discovery aids.

---

## G. Agent Lenses

76. **(P0)** Parallel agent timeline (Gantt view) — show all agents' event spans on a shared timeline so overlap and sequencing are visible. Currently you can only view one agent at a time.
77. **(P1)** Agent color-coding in the scene — when viewing the main trace, optionally tint each subagent's file touches with a distinct hue to see territorial coverage.
78. **(P1)** Full instruction text on click — `AgentNode.instructionPreview` is truncated. Add an expandable full-instruction view in the detail popover.
79. **(P1)** Agent launch context — show the parent event that triggered each subagent (the `launchSeq` / `launchCallId`), linking the agent tree to the timeline.
80. **(P2)** Agent comparison mode — view two agents' traces side by side or diff their file-touch sets to see what each contributed.
81. **(P2)** "Follow agent" mode — during main-trace playback, auto-switch to a subagent's lens when its launch event is reached.
82. **(P3)** Agent tree visualization — render the parent/child agent graph as a visual tree diagram in the panel, not just a flat list.

---

## H. Evaluation / Report Panel

83. **(P0)** Report summary verdict line — a one-line overall assessment at the top (e.g., "Strong exploration, verification gaps") derived from the dimension verdicts, so users get the gist before diving into findings.
84. **(P0)** Report export to Markdown/PDF — let users download the evaluation for sharing or archiving. Currently reports live only in the UI and `~/.mindwalk/reports/`.
85. **(P1)** Dimension radar/spider chart — a compact visual showing the four dimensions (exploration, scope, wandering, verification) as a radar for instant shape comparison.
86. **(P1)** Finding severity filter — toggle to show only critical/high-severity findings, collapsing the rest. Dense reports bury the important signals.
87. **(P1)** Rubric criteria checklist — render rubric criteria as a visual checklist with pass/fail/no-signal icons, making the scorecard scannable.
88. **(P2)** Report comparison view — open two evaluations (different models or different sessions) side by side to compare judgments.
89. **(P2)** Evaluation trend chart — when a session has been evaluated multiple times, show how scores trended across runs.
90. **(P2)** Evidence scene snapshot — next to each finding's "jump to evidence" link, show a tiny thumbnail of the scene state at that event.

---

## I. Accessibility

91. **(P0)** Screen-reader live region for playback — announce event changes via `aria-live="polite"` so screen readers track the playback. Currently the ticking playhead has no audible state.
92. **(P1)** High-contrast mode toggle — a theme variant with stronger color differentiation for users who find the dark OKLCH palette too subtle.
93. **(P1)** Keyboard file navigation — arrow keys to move focus between visible files in the scene (with the hover tip reading the focused file), not just mouse interaction.
94. **(P1)** Focus management audit — ensure opening/closing panels moves focus logically and `Escape` returns focus to the trigger. Several panels handle Escape but focus trapping is inconsistent.
95. **(P2)** Full reduced-motion audit — `prefersReducedMotion()` is checked in the scene, but animations in CSS (inspector-in, rail slide, churn transitions) should all respect it.

---

## J. Performance, Platform & Polish

96. **(P0)** Virtualized session list — for users with hundreds of sessions, the rail list renders all rows. Virtualize (e.g., react-window) to keep scrolling smooth.
97. **(P1)** WebGL detection and 2D fallback — if WebGL is unavailable, show a 2D treemap version of the city instead of a blank canvas. Currently there's no graceful degradation.
98. **(P1)** Map build progress indicator — large repos take seconds to build. Show a progress bar or skeleton. SSE infrastructure exists for the judge; extend it to citymap builds.
99. **(P2)** Tablet/touch responsive layout — the app sets `min-width: 320px` but the layout is desktop-first. A touch-friendly mode (larger hit targets, gesture controls for the scene) would unlock tablet usage.
100. **(P2)** Session prefetching — while idle, prefetch the trace data for the next session in the rail so switching feels instant. Currently each switch fetches on demand.

---

## Summary by Priority

| Priority | Count | Theme |
|----------|-------|-------|
| P0       | 22    | Ship first — highest impact, lowest effort |
| P1       | 38    | Core improvements — meaningful impact, moderate work |
| P2       | 28    | Polish — enhances depth and breadth |
| P3       | 12    | Ambitious — high effort, transformative potential |

## Top 10 to Start With (Highest Impact / Lowest Effort)

1. **#3** Keyboard cheat-sheet (`?` key)
2. **#1** Guided tour on first launch
3. **#2** Built-in demo session
4. **#21** Minimap
5. **#41** Current event summary card
6. **#22** Fly-to-file command palette
7. **#57** Coverage gauge
8. **#83** Report summary verdict line
9. **#11** Color-coded harness indicators
10. **#9** Session grouping by date
