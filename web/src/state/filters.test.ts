import { describe, it, expect, beforeEach } from "vitest";
import { loadFilters, saveFilters, sessionVisible, type SessionFilters } from "./filters";
import type { SessionMeta } from "../types";

function makeSession(overrides: Partial<SessionMeta> = {}): SessionMeta {
  return {
    key: "test-key",
    id: "test-id",
    harness: "claude",
    path: "/test/path",
    eventCount: 10,
    ...overrides,
  };
}

describe("sessionVisible", () => {
  it("returns true with no filters", () => {
    expect(sessionVisible(makeSession(), { hideEmpty: false })).toBe(true);
  });

  it("hides zero-event sessions when hideEmpty is true", () => {
    expect(sessionVisible(makeSession({ eventCount: 0 }), { hideEmpty: true })).toBe(false);
  });

  it("keeps zero-event session visible when it is the active key", () => {
    expect(
      sessionVisible(makeSession({ eventCount: 0, key: "active" }), { hideEmpty: true }, "active"),
    ).toBe(true);
  });

  it("shows non-empty session when hideEmpty is true", () => {
    expect(sessionVisible(makeSession({ eventCount: 5 }), { hideEmpty: true })).toBe(true);
  });

  it("hides session when harness filter does not match", () => {
    expect(
      sessionVisible(makeSession({ harness: "claude" }), { hideEmpty: false, harness: "codex" }),
    ).toBe(false);
  });

  it("shows session when harness filter matches", () => {
    expect(
      sessionVisible(makeSession({ harness: "claude" }), { hideEmpty: false, harness: "claude" }),
    ).toBe(true);
  });

  it("both filters pass when harness matches and session has events", () => {
    expect(
      sessionVisible(makeSession({ harness: "claude", eventCount: 5 }), {
        hideEmpty: true,
        harness: "claude",
      }),
    ).toBe(true);
  });

  it("hides when harness matches but hideEmpty fails", () => {
    expect(
      sessionVisible(makeSession({ harness: "claude", eventCount: 0 }), {
        hideEmpty: true,
        harness: "claude",
      }),
    ).toBe(false);
  });

  it("hides when hideEmpty passes but harness fails", () => {
    expect(
      sessionVisible(makeSession({ harness: "claude", eventCount: 5 }), {
        hideEmpty: true,
        harness: "codex",
      }),
    ).toBe(false);
  });
});

describe("loadFilters / saveFilters", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when nothing is stored", () => {
    const filters = loadFilters();
    expect(filters.hideEmpty).toBe(true);
    expect(filters.harness).toBeUndefined();
  });

  it("round-trips filters through save then load", () => {
    const filters: SessionFilters = { hideEmpty: false, harness: "codex" };
    saveFilters(filters);
    const loaded = loadFilters();
    expect(loaded.hideEmpty).toBe(false);
    expect(loaded.harness).toBe("codex");
  });

  it("falls back to defaults on corrupted JSON", () => {
    localStorage.setItem("mindwalk.sessionFilters", "{broken json");
    const filters = loadFilters();
    expect(filters.hideEmpty).toBe(true);
    expect(filters.harness).toBeUndefined();
  });

  it("preserves hideEmpty false through round-trip", () => {
    saveFilters({ hideEmpty: false });
    expect(loadFilters().hideEmpty).toBe(false);
  });

  it("defaults hideEmpty to true when stored value is absent", () => {
    localStorage.setItem("mindwalk.sessionFilters", JSON.stringify({ harness: "codex" }));
    const filters = loadFilters();
    expect(filters.hideEmpty).toBe(true);
    expect(filters.harness).toBe("codex");
  });

  it("ignores non-string harness values", () => {
    localStorage.setItem(
      "mindwalk.sessionFilters",
      JSON.stringify({ hideEmpty: true, harness: 123 }),
    );
    const filters = loadFilters();
    expect(filters.harness).toBeUndefined();
  });
});
