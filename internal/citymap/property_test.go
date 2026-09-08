package citymap

import (
	"errors"
	"os"
	"path/filepath"
	"testing"
	"testing/quick"

	"github.com/cosmtrek/mindwalk/internal/model"
)

// TestCitymapDeterminism verifies that building the same repository twice
// produces identical citymap output — the layout must be deterministic.
func TestCitymapDeterminism(t *testing.T) {
	property := func(seed uint32) bool {
		dir := t.TempDir()

		files := []string{"a.go", "b.go", "c/c.go", "d/e/f.go"}
		for _, f := range files {
			path := filepath.Join(dir, f)
			if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
				t.Fatal(err)
			}

			content := make([]byte, int(seed%1000)+10)
			for i := range content {
				content[i] = byte('a' + (i % 26))
			}

			if err := os.WriteFile(path, content, 0o644); err != nil {
				t.Fatal(err)
			}
		}

		b := Builder{}
		c1, err1 := b.Build(dir, nil)

		c2, err2 := b.Build(dir, nil)
		if err1 != nil || err2 != nil {
			return errors.Is(err1, err2)
		}

		if len(c1.Files) != len(c2.Files) {
			return false
		}

		for i := range c1.Files {
			if c1.Files[i].Path != c2.Files[i].Path {
				return false
			}

			if c1.Files[i].Rect != c2.Files[i].Rect {
				return false
			}

			if c1.Files[i].Lines != c2.Files[i].Lines {
				return false
			}
		}

		return true
	}
	if err := quick.Check(property, &quick.Config{MaxCount: 20}); err != nil {
		t.Fatal(err)
	}
}

// TestCitymapEmptyRepoReturnsError verifies that building a repo with no
// source files returns a clear error rather than an empty citymap.
func TestCitymapEmptyRepoReturnsError(t *testing.T) {
	dir := t.TempDir()

	_, err := Builder{}.Build(dir, nil)
	if err == nil {
		t.Fatal("expected error for empty repo, got nil")
	}
}

// TestCitymapSingleFileProducesSingleBlock verifies that a repo with one file
// produces a citymap with exactly one file block.
func TestCitymapSingleFileProducesSingleBlock(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte("package main\n"), 0o644); err != nil {
		t.Fatal(err)
	}

	city, err := Builder{}.Build(dir, nil)
	if err != nil {
		t.Fatal(err)
	}

	if len(city.Files) != 1 {
		t.Fatalf("expected 1 file, got %d", len(city.Files))
	}

	if city.Files[0].Path != "main.go" {
		t.Fatalf("path = %q, want main.go", city.Files[0].Path)
	}
}

// TestCitymapGhostFileFromTrace verifies that a trace target referencing a
// non-existent file produces a ghost block.
func TestCitymapGhostFileFromTrace(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "real.go"), []byte("package main\n"), 0o644); err != nil {
		t.Fatal(err)
	}

	trace := &model.Trace{
		Events: []model.Event{
			{Tool: "edit", Action: "edit", Targets: []model.Target{{Path: "deleted.go", Touch: "edit"}}},
		},
	}

	city, err := Builder{}.Build(dir, trace)
	if err != nil {
		t.Fatal(err)
	}

	hasGhost := false

	for _, f := range city.Files {
		if f.Ghost {
			hasGhost = true

			if f.Path != "deleted.go" {
				t.Fatalf("ghost path = %q, want deleted.go", f.Path)
			}
		}
	}

	if !hasGhost {
		t.Fatal("expected at least one ghost file from trace target")
	}
}
