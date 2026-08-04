# SUPERB UI/UX Sprint — Mid-Execution Status

> **Created:** 2026-08-04 10:32
> **Session:** Executing the 27-task Pareto-optimized sprint from `docs/planning/2026-08-04_09-46_SUPERB-ui-ux-sprint.md`

---

## a) FULLY DONE (shipped, builds, Go tests pass)

| Task                              | What was built                                                                                                                                              | Files created/modified                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **T1** Event Summary Card         | Rich playback readout showing tool, action badge, target paths, summary. Closes the core feedback loop.                                                     | `EventSummary.tsx` (new), `Timeline.tsx`, `styles.css`    |
| **T2** Command Palette (Cmd+P)    | Fuzzy file search overlay with keyboard nav, touch-state dots, lang badges.                                                                                 | `CommandPalette.tsx` (new), `App.tsx`, `styles.css`       |
| **T3** Cheat-Sheet (?)            | Modal listing all keyboard shortcuts grouped by Playback/Navigation/View.                                                                                   | `CheatSheet.tsx` (new), `App.tsx`, `styles.css`           |
| **T4** Collapsible HUD (H)        | Toggle HUD visibility, persists in localStorage.                                                                                                            | `store.ts`, `App.tsx`                                     |
| **T5** Coverage Gauge             | SVG ring showing touched/total file %, animates on playhead change.                                                                                         | `Hud.tsx`, `styles.css`                                   |
| **T6** Copy Path + Readable Sizes | Clipboard button on file paths, `formatBytes()` replaces raw byte counts.                                                                                   | `Inspector.tsx`, `styles.css`                             |
| **T7** Harness Color Dots         | Colored dot per session source: claude=purple, codex=green, crush=blue, pi=amber.                                                                           | `SessionRail.tsx`, `styles.css`                           |
| **T8** Relative Timestamps        | "2h ago" format with absolute time in tooltip.                                                                                                              | `SessionRail.tsx`                                         |
| **T9** Error Markers on Strip     | Red ticks on timeline for `isError` events, with hover tooltips.                                                                                            | `Timeline.tsx`, `styles.css`                              |
| **T10** Report Summary Verdict    | One-line overall assessment at top of report panel, color-coded by severity.                                                                                | `ReportPanel.tsx`, `styles.css`                           |
| **T11** SR Live Region            | Visually-hidden `aria-live="polite"` region announcing event changes.                                                                                       | `Timeline.tsx`, `styles.css`                              |
| **T12** Zoom-to-Fit Button        | Scene-dispatched event triggers `fitView()` in both TreeScene and CityScene.                                                                                | `TreeScene.tsx`, `CityScene.tsx`, `App.tsx`, `styles.css` |
| **T13** Demo Session Fixture      | Synthetic 20-event trace with realistic reads/edits/error/verify, loads from empty-state.                                                                   | `demo.ts` (new), `App.tsx`, `styles.css`                  |
| **T14** Date Grouping in Rail     | Collapsible Today/Yesterday/This Week/Older sections with session counts.                                                                                   | `SessionRail.tsx`, `styles.css`                           |
| **T15** Virtualized Session List  | CSS `content-visibility: auto` with `contain-intrinsic-size` — no dependency added.                                                                         | `SessionRail.tsx`, `styles.css`                           |
| **T17** Zoomable Timeline         | Wheel-zoom on strip, zoom in/out buttons, minimap with playhead and click-to-reset, zoomed bucket/mark/error recomputation, zoomed scrubber range.          | `Timeline.tsx`, `styles.css`                              |
| **T18** Event List View           | Virtualized scrollable event list with filter chips (All/Search/Read/Edit/Verify/Exec/Errors), synced to playhead, click-to-jump. Registered as dock panel. | `EventList.tsx` (new), `App.tsx`, `styles.css`            |
| **T19** WebGL Fallback            | `hasWebGL()` detection + SVG-based `Treemap2D` rendering the same touch-state coloring with click-to-select.                                                | `Treemap2D.tsx` (new), `App.tsx`, `styles.css`            |

**Total: 18 of 27 tasks fully shipped.**

---

## b) PARTIALLY DONE

| Task                        | Status                                                                                                                                                     | What remains                                                                                                                                                                                                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T21** Session Sort + Cost | ~40% done — `sortBy` state and localStorage persistence added, `sortSessions` function referenced but NOT yet implemented. Sort dropdown NOT yet rendered. | Need to implement `sortSessions()`, add the dropdown UI to `SessionRail.tsx`, add `SortKey` type and `SessionGroup` interface (interface was accidentally deleted). **The file currently references `sortSessions` and `SortKey` which do not exist — this will cause a build failure.** |

---

## c) NOT STARTED

| Task                              | Description                                                                                                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T20** Context Tooltips          | The `data-hint` CSS tooltip system already exists throughout the HUD. The task calls for adding more tooltips and a first-use micro-hint. Not explicitly started but the infrastructure is already there. |
| **T22** Scene Minimap             | Small corner overlay showing full repo layout with viewport rectangle.                                                                                                                                    |
| **T23** Timeline Presets + Loop   | Visible speed chips, loop toggle, range-select.                                                                                                                                                           |
| **T24** Visit Sparkline           | Mini timeline in inspector showing when selected file was visited.                                                                                                                                        |
| **T25** Edit Heatmap Toggle       | Scene layer painting heat by edit count.                                                                                                                                                                  |
| **T26** Dimension Radar Chart     | Compact radar showing four evaluation dimensions.                                                                                                                                                         |
| **T27** Scene Search Highlighting | Type a path/glob, matching files brighten.                                                                                                                                                                |

---

## d) TOTALLY FUCKED UP

### T16 (Guided Tour) — BUILT THEN DESTROYED ON USER REQUEST

- **What happened:** I built the entire `GuidedTour.tsx` component (step manager, spotlight overlay, callout card, localStorage gating, replay-from-cheat-sheet). Wired it into `App.tsx` with state, keyboard listeners, and CSS.
- **Why it's fucked:** The user explicitly said "I actually do not want this!" — I should have asked before building an onboarding tour. Onboarding was in the plan but the user clearly didn't want a tour overlay.
- **What I did:** Trashed `GuidedTour.tsx`, removed all imports/state/render from `App.tsx`, removed the `onReplayTour` prop wiring from `CheatSheet.tsx`.
- **Lesson:** The plan said "T13 before T16" but I should have checked whether the user wanted onboarding at all before investing 90min in it.

### T21 — LEFT IN BROKEN STATE

- **What happened:** I was mid-implementation of session sort. I added the `sortBy` state with localStorage, added the `sorted` memo calling `sortSessions()`, but then got interrupted by the user's stop command BEFORE implementing the `sortSessions` function or the `SortKey` type.
- **Why it's fucked:** `SessionRail.tsx` now references `sortSessions` and `SortKey` which don't exist. **The frontend build will fail.** I also accidentally deleted the `SessionGroup` interface when editing.
- **What needs to happen:** Either finish T21 immediately or revert the partial changes to unblock the build.

### Auto-git daemon interference

- The auto-git daemon reformatted files (tabs to spaces) and committed intermediate states while I was editing. This caused several `edit` operations to fail with "file modified since last read" errors, requiring re-reads and occasionally causing whitespace mismatches. Not catastrophic but slowed things down significantly.

### `make` vs `pnpm`

- The Makefile uses `npm` but only `pnpm` is available on this system. Every build check required `pnpm --prefix web run build` instead of `make build`. I never updated the Makefile.

---

## e) WHAT WE SHOULD IMPROVE

1. **Ask before building unwanted features.** The guided tour was 90min of wasted effort. Should have confirmed onboarding scope before diving in.
2. **Don't leave files in a broken state between tasks.** T21 is currently a landmine. Should finish or revert before stopping.
3. **The `EventList.tsx` virtualization uses a manual scroll-position approach** that re-renders on every scroll event. Should use `IntersectionObserver` or `requestAnimationFrame` throttling for smoother performance with 500+ events.
4. **T17 Zoomable Timeline lacks drag-to-pan on the minimap** — the plan called for `T17.7: Make minimap draggable to pan the zoom window`. Currently the minimap only supports click-to-reset.
5. **No tests written for any new components.** The plan's anti-verschlimmbesserung checklist says `make test` after each task, but I only ran Go tests (which don't touch the frontend) and `pnpm build` (which only checks compilation). No Playwright E2E tests, no component tests.
6. **The CheatSheet still has the `onReplayTour` optional prop** in its interface, but App.tsx no longer passes it. Not broken (it's optional) but it's dead code.
7. **The zoom buttons (ZoomIn/ZoomOut) are in the transport row** but they have no visual separator from the step buttons. Could use a divider.
8. **T13 demo data** is entirely synthetic and hardcoded. It works but the `CityMap` layout is a simple grid, not using the real `citymap.Builder`. This means the demo's scene won't look as good as a real session.
9. **T15 virtualization** via `content-visibility: auto` is a CSS-only approach. It works for rendering but doesn't help with DOM node count for accessibility tree or event listener memory. A proper virtualizer (react-window) would be better for 500+ sessions.
10. **CSS file is now ~3300 lines** with task-numbered comments. It's getting hard to navigate. Should consider splitting into multiple CSS files or at least adding a table of contents.

---

## f) Up to 50 things to get done next

### Immediate (blocking)

1. **Fix T21:** Implement `sortSessions()`, `SortKey` type, `SessionGroup` interface, and render the sort dropdown — OR revert T21 changes to unblock the build.
2. **Run `pnpm --prefix web run build`** to verify the build passes after fixing T21.
3. **Run `go test ./...`** to confirm no Go regressions (last run was clean).

### Wave 6 remaining (planned)

4. **T20:** Add first-use micro-hint on play button (dismissible, localStorage gated).
5. **T20:** Add spectrum hover explanations (click labels for context).
6. **T22:** Create `Minimap.tsx` — small canvas/SVG in viewport corner.
7. **T22:** Render simplified repo layout (rect per file/dir, no 3D).
8. **T22:** Color rects by current touch state from `FilePlayback`.
9. **T22:** Compute camera viewport rectangle and project to minimap.
10. **T22:** Update viewport rect on camera move (pan/zoom/orbit).
11. **T22:** Click on minimap to navigate.
12. **T23:** Move speed chips (1x/4x/16x) to visible position on deck.
13. **T23:** Add loop toggle button with wrap-around playback.
14. **T23:** Add shift-drag range-select on strip for loop region.
15. **T24:** Compute visit positions for selected file.
16. **T24:** Render SVG sparkline in Inspector with colored dots.
17. **T24:** Add playhead indicator on sparkline.
18. **T24:** Click on sparkline to jump playhead.
19. **T25:** Add "Heat" toggle to ViewPanel.
20. **T25:** Compute edit counts per file from trace.
21. **T25:** Apply heat gradient to scene file colors.
22. **T25:** Add directory click targets with aggregate stats.
23. **T26:** Create `RadarChart` sub-component in ReportPanel.
24. **T26:** Map dimension verdicts to 0-1 scores and draw polygon.
25. **T26:** Add finding severity filter chips.
26. **T27:** Add search input to ViewPanel.
27. **T27:** Implement glob/path matching against `city.files`.
28. **T27:** Dim non-matching files in scene.

### Polish and hardening

29. **Clean up CheatSheet:** Remove dead `onReplayTour` prop.
30. **Add visual separator** between transport controls and zoom buttons.
31. **Add CSS table of contents** or split `styles.css` into per-component files.
32. **Write Playwright E2E tests** for: event summary updates on scrub, command palette navigation, cheat sheet toggle, HUD toggle persistence.
33. **Write component test** for `formatBytes()` edge cases (0, 1, 1023, 1024, 1048576).
34. **Write component test** for `relativeTime()` edge cases (future dates, missing dates, exactly 60s boundary).
35. **Write component test** for `scorePath()` fuzzy matching (exact match, suffix match, subsequence miss).
36. **Throttle EventList scroll handler** with `requestAnimationFrame`.
37. **Add drag-to-pan** on the zoomable timeline minimap (T17.7).
38. **Update `Makefile`** to use `pnpm` instead of `npm`, or detect which is available.
39. **Update `README.md`** keyboard shortcuts section to include H, ?, Cmd+P.
40. **Update `FEATURES.md`** with all new shipped features.
41. **Update `AGENTS.md`** with new component patterns (overlay system, zoom state, event dispatch for scene).
42. **Commit all changes** — nothing has been committed this session; the auto-git daemon committed some intermediate states but the latest work is uncommitted.

### Future depth features (beyond the 27-task plan)

43. **Multi-track timeline** — separate tracks for different agents or action types.
44. **Bookmark bar** — save and name specific events.
45. **Compare-two-points** — diff the playback state at two different seq positions.
46. **Diff preview** in inspector — show what changed in a file at a specific edit event.
47. **Agent Gantt view** — timeline showing agent task durations.
48. **Report trend chart** — compare evaluation scores across multiple sessions.
49. **Session prefetch** — preload adjacent session traces.
50. **Tablet/touch support** — pinch-to-zoom, swipe gestures for the scene and timeline.

---

## g) Questions I cannot answer myself

1. **Should I finish T21 (Session Sort) or revert it?** The build is currently broken because `sortSessions` and `SortKey` are referenced but not defined. I can finish it in ~5min or revert to the last working state — your call.

2. **Do you want the remaining Wave 6 tasks (T20, T22-T27) built at all?** After the T16 guided tour rejection, I'm not sure which planned features you actually want vs. which were part of the planning exercise.

3. **Should I update the Makefile to use `pnpm`?** The Makefile hardcodes `npm` which doesn't exist on this system. I don't know if this is intentional (other contributors use npm) or a bug.
