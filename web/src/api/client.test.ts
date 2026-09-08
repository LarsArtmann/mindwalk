import { describe, it, expect } from "vitest";
import { makeProgressDeduper } from "./client";

describe("makeProgressDeduper", () => {
  it("accepts events with ascending ids", () => {
    const isNew = makeProgressDeduper();
    expect(isNew("0")).toBe(true);
    expect(isNew("1")).toBe(true);
    expect(isNew("2")).toBe(true);
  });

  it("drops a replayed boundary event on reconnect", () => {
    const isNew = makeProgressDeduper();
    expect(isNew("0")).toBe(true);
    expect(isNew("1")).toBe(true);
    // Server re-sends id 1 on reconnect — must be dropped.
    expect(isNew("1")).toBe(false);
    // Later events are still accepted.
    expect(isNew("2")).toBe(true);
  });

  it("drops everything at or below the highest seen id", () => {
    const isNew = makeProgressDeduper();
    isNew("5");
    expect(isNew("5")).toBe(false);
    expect(isNew("3")).toBe(false);
    expect(isNew("0")).toBe(false);
    expect(isNew("6")).toBe(true);
  });

  it("passes events through when no id is present", () => {
    const isNew = makeProgressDeduper();
    expect(isNew("")).toBe(true);
    expect(isNew("")).toBe(true);
    // A missing id never advances the high-water mark, so a real id after
    // id-less events is still accepted.
    expect(isNew("0")).toBe(true);
  });
});
