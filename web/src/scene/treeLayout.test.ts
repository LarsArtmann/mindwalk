import { describe, it, expect } from "vitest";
import { computeTreeLayout } from "./treeLayout";
import type { CityFile } from "../types";

function makeFile(id: number, path: string): CityFile {
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

describe("computeTreeLayout", () => {
  describe("determinism", () => {
    it("produces identical output for identical input", () => {
      const files = [makeFile(1, "src/a.ts"), makeFile(2, "src/b.ts"), makeFile(3, "README.md")];
      const a = computeTreeLayout(files);
      const b = computeTreeLayout(files);
      expect(a.radius).toBe(b.radius);
      expect(a.leaf).toEqual(b.leaf);
      expect(a.dirs).toEqual(b.dirs);
      expect(a.edges.length).toBe(b.edges.length);
    });

    it("produces identical output regardless of input order", () => {
      const ordered = [makeFile(1, "src/a.ts"), makeFile(2, "src/b.ts")];
      const reversed = [makeFile(2, "src/b.ts"), makeFile(1, "src/a.ts")];
      const a = computeTreeLayout(ordered);
      const b = computeTreeLayout(reversed);
      expect(a.leaf).toEqual(b.leaf);
      expect(a.dirs).toEqual(b.dirs);
    });
  });

  describe("empty input", () => {
    it("handles empty file array with no leaves, dirs, or edges", () => {
      const layout = computeTreeLayout([]);
      expect(layout.leaf.size).toBe(0);
      expect(layout.dirs).toHaveLength(0);
      expect(layout.edges).toHaveLength(0);
      expect(layout.radius).toBeGreaterThanOrEqual(55);
    });
  });

  describe("single file", () => {
    it("places one leaf with at least one connecting edge", () => {
      const layout = computeTreeLayout([makeFile(1, "a.ts")]);
      expect(layout.leaf.size).toBe(1);
      expect(layout.leaf.has(1)).toBe(true);
      expect(layout.dirs).toHaveLength(0);
      expect(layout.edges.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("directory structure", () => {
    it("creates a dir node for a shared parent", () => {
      const layout = computeTreeLayout([makeFile(1, "src/a.ts"), makeFile(2, "src/b.ts")]);
      expect(layout.dirs).toHaveLength(1);
      expect(layout.dirs[0].path).toBe("src");
      expect(layout.dirs[0].depth).toBe(1);
      expect(layout.dirs[0].fileCount).toBe(2);
    });

    it("creates nested dir nodes for deep paths", () => {
      const layout = computeTreeLayout([
        makeFile(1, "src/components/Button.tsx"),
        makeFile(2, "src/index.ts"),
      ]);
      const paths = layout.dirs.map((d) => d.path);
      expect(paths).toContain("src");
      expect(paths).toContain("src/components");
    });

    it("assigns increasing depth for deeper directories", () => {
      const layout = computeTreeLayout([makeFile(1, "a/b/c/d.ts")]);
      const depths = layout.dirs.map((d) => d.depth);
      expect(depths).toContain(1);
      expect(depths).toContain(2);
      expect(depths).toContain(3);
    });
  });

  describe("radius scaling", () => {
    it("radius grows with more files", () => {
      const few = computeTreeLayout([makeFile(1, "a.ts"), makeFile(2, "b.ts")]);
      const many = computeTreeLayout(
        Array.from({ length: 200 }, (_, i) => makeFile(i + 1, `file${i}.ts`)),
      );
      expect(many.radius).toBeGreaterThan(few.radius);
    });

    it("minimum radius is 55", () => {
      const layout = computeTreeLayout([makeFile(1, "a.ts")]);
      expect(layout.radius).toBeGreaterThanOrEqual(55);
    });
  });

  describe("leaf positions", () => {
    it("every leaf gets a unique position", () => {
      const files = Array.from({ length: 10 }, (_, i) => makeFile(i + 1, `file${i}.ts`));
      const layout = computeTreeLayout(files);
      const keys = [...layout.leaf.values()].map((p) => `${p.x.toFixed(4)},${p.z.toFixed(4)}`);
      expect(new Set(keys).size).toBe(10);
    });

    it("leaf positions are symmetric around origin", () => {
      const files = Array.from({ length: 4 }, (_, i) => makeFile(i + 1, `f${i}.ts`));
      const layout = computeTreeLayout(files);
      const positions = [...layout.leaf.values()];
      const cx = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
      const cz = positions.reduce((sum, p) => sum + p.z, 0) / positions.length;
      expect(Math.abs(cx)).toBeLessThan(1e-6);
      expect(Math.abs(cz)).toBeLessThan(1e-6);
    });
  });

  describe("edges", () => {
    it("creates edges for leaf files and parent dirs", () => {
      const layout = computeTreeLayout([makeFile(1, "src/a.ts"), makeFile(2, "README.md")]);
      expect(layout.edges.length).toBeGreaterThanOrEqual(3);
    });
  });
});
