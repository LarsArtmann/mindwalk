package crush

import (
	"database/sql"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// createCrushDBAt creates a minimal Crush database at an exact path
// (not constrained to the <root>/.crush/crush.db layout newFixtureDB
// uses), applies the schema, optionally seeds it, and returns the open
// handle. The caller is responsible for closing the handle; tests use
// t.Cleanup for that.
func createCrushDBAt(t *testing.T, dbPath string, seed func(*sql.DB)) *sql.DB {
	t.Helper()
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	handle, err := sql.Open("sqlite", "file:"+dbPath+"?_pragma=journal_mode(WAL)")
	if err != nil {
		t.Fatal(err)
	}
	handle.SetMaxOpenConns(1)
	schema := `
		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			parent_session_id TEXT,
			title TEXT NOT NULL,
			message_count INTEGER NOT NULL DEFAULT 0,
			prompt_tokens INTEGER NOT NULL DEFAULT 0,
			completion_tokens INTEGER NOT NULL DEFAULT 0,
			cost REAL NOT NULL DEFAULT 0.0,
			updated_at INTEGER NOT NULL,
			created_at INTEGER NOT NULL,
			todos TEXT
		);
		CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL,
			role TEXT NOT NULL,
			parts TEXT NOT NULL DEFAULT '[]',
			model TEXT,
			provider TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL,
			finished_at INTEGER
		);
	`
	if _, err := handle.Exec(schema); err != nil {
		_ = handle.Close()
		t.Fatal(err)
	}
	if seed != nil {
		seed(handle)
	}
	t.Cleanup(func() { _ = handle.Close() })
	return handle
}

// writeProjectsRegistry writes a projects.json registry at the given
// global data dir that points to the provided project entries.
func writeProjectsRegistry(t *testing.T, globalDir string, projects []crushProjectEntry) {
	t.Helper()
	regPath := filepath.Join(globalDir, "projects.json")
	data, err := json.Marshal(crushProjectsFile{Projects: projects})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(regPath, data, 0o644); err != nil {
		t.Fatal(err)
	}
}

// TestEnumerateDBPathsExplicitDir verifies that an adapter configured
// with an explicit Dir returns exactly one database path.
func TestEnumerateDBPathsExplicitDir(t *testing.T) {
	dataDir, _ := newFixtureDB(t, nil)
	a := NewAdapter(dataDir)
	paths := a.enumerateDBPaths()
	if len(paths) != 1 {
		t.Fatalf("expected 1 path, got %d: %v", len(paths), paths)
	}
	expected := filepath.Join(dataDir, dbName)
	if paths[0] != expected {
		t.Fatalf("expected %s, got %s", expected, paths[0])
	}
}

// TestEnumerateDBPathsExplicitDirMissingDB verifies that an adapter
// with an explicit Dir still returns the expected path even when the
// database file does not exist — callers handle missing files.
func TestEnumerateDBPathsExplicitDirMissingDB(t *testing.T) {
	a := NewAdapter(t.TempDir())
	paths := a.enumerateDBPaths()
	if len(paths) != 1 {
		t.Fatalf("expected 1 path (existence is caller's concern), got %d: %v", len(paths), paths)
	}
}

// TestEnumerateDBPathsAutoDiscover verifies that an adapter in
// auto-discover mode (empty Dir) finds every database listed in the
// Crush projects registry.
func TestEnumerateDBPathsAutoDiscover(t *testing.T) {
	globalDir := t.TempDir()
	t.Setenv("CRUSH_GLOBAL_DATA", globalDir)

	proj1DataDir := filepath.Join(globalDir, "proj1", dataDirName)
	proj2DataDir := filepath.Join(globalDir, "proj2", dataDirName)
	createCrushDBAt(t, filepath.Join(proj1DataDir, dbName), nil)
	createCrushDBAt(t, filepath.Join(proj2DataDir, dbName), nil)

	writeProjectsRegistry(t, globalDir, []crushProjectEntry{
		{Path: "/repo/proj1", DataDir: proj1DataDir},
		{Path: "/repo/proj2", DataDir: proj2DataDir},
	})

	a := NewAdapter("")
	paths := a.enumerateDBPaths()
	if len(paths) != 2 {
		t.Fatalf("expected 2 paths, got %d: %v", len(paths), paths)
	}
}

// TestEnumerateDBPathsAutoDiscoverIncludesGlobalDB verifies that the
// global database (next to projects.json) is included even when not
// listed in the registry.
func TestEnumerateDBPathsAutoDiscoverIncludesGlobalDB(t *testing.T) {
	globalDir := t.TempDir()
	t.Setenv("CRUSH_GLOBAL_DATA", globalDir)

	projDir := filepath.Join(globalDir, "proj1", dataDirName)
	createCrushDBAt(t, filepath.Join(projDir, dbName), nil)
	writeProjectsRegistry(t, globalDir, []crushProjectEntry{
		{Path: "/repo/proj1", DataDir: projDir},
	})

	// Also create the global database
	createCrushDBAt(t, filepath.Join(globalDir, dataDirName, dbName), nil)

	a := NewAdapter("")
	paths := a.enumerateDBPaths()
	if len(paths) != 2 {
		t.Fatalf("expected 2 paths (project + global), got %d: %v", len(paths), paths)
	}
}

// TestListAllProjectSessionsMultiDB verifies that sessions are
// collected from every project database and that dbIndex is populated
// so subsequent openDBForPath calls route to the correct database.
func TestListAllProjectSessionsMultiDB(t *testing.T) {
	globalDir := t.TempDir()
	t.Setenv("CRUSH_GLOBAL_DATA", globalDir)

	proj1DataDir := filepath.Join(globalDir, "proj1", dataDirName)
	proj2DataDir := filepath.Join(globalDir, "proj2", dataDirName)

	createCrushDBAt(t, filepath.Join(proj1DataDir, dbName), func(db *sql.DB) {
		insertSession(t, db, "sess-alpha", "", "Project 1 Session", time.Now(), 5)
	})
	createCrushDBAt(t, filepath.Join(proj2DataDir, dbName), func(db *sql.DB) {
		insertSession(t, db, "sess-beta", "", "Project 2 Session", time.Now(), 3)
	})

	writeProjectsRegistry(t, globalDir, []crushProjectEntry{
		{Path: "/repo/proj1", DataDir: proj1DataDir},
		{Path: "/repo/proj2", DataDir: proj2DataDir},
	})

	a := NewAdapter("")
	sessions, err := a.listAllProjectSessions()
	if err != nil {
		t.Fatal(err)
	}
	if len(sessions) != 2 {
		t.Fatalf("expected 2 sessions, got %d", len(sessions))
	}

	// Verify dbIndex was populated with both session IDs
	alphaDB, ok := a.dbIndex.Load("sess-alpha")
	if !ok {
		t.Fatal("dbIndex missing sess-alpha")
	}
	if alphaDB.(string) != filepath.Join(proj1DataDir, dbName) {
		t.Fatalf("sess-alpha routed to wrong DB: got %v", alphaDB)
	}
	betaDB, ok := a.dbIndex.Load("sess-beta")
	if !ok {
		t.Fatal("dbIndex missing sess-beta")
	}
	if betaDB.(string) != filepath.Join(proj2DataDir, dbName) {
		t.Fatalf("sess-beta routed to wrong DB: got %v", betaDB)
	}
}

// TestOpenDBForPathRoutesToCorrectDB verifies that after
// listAllProjectSessions populates dbIndex, openDBForPath opens the
// right database for each session.
func TestOpenDBForPathRoutesToCorrectDB(t *testing.T) {
	globalDir := t.TempDir()
	t.Setenv("CRUSH_GLOBAL_DATA", globalDir)

	proj1DataDir := filepath.Join(globalDir, "proj1", dataDirName)
	proj2DataDir := filepath.Join(globalDir, "proj2", dataDirName)

	createCrushDBAt(t, filepath.Join(proj1DataDir, dbName), func(db *sql.DB) {
		insertSession(t, db, "sess-alpha", "", "Alpha", time.Now(), 1)
	})
	createCrushDBAt(t, filepath.Join(proj2DataDir, dbName), func(db *sql.DB) {
		insertSession(t, db, "sess-beta", "", "Beta", time.Now(), 1)
	})

	writeProjectsRegistry(t, globalDir, []crushProjectEntry{
		{Path: "/repo/proj1", DataDir: proj1DataDir},
		{Path: "/repo/proj2", DataDir: proj2DataDir},
	})

	a := NewAdapter("")
	if _, err := a.listAllProjectSessions(); err != nil {
		t.Fatal(err)
	}

	// Now openDBForPath should route each session to its correct DB
	handle, err := a.openDBForPath(SessionPath("sess-alpha"))
	if err != nil || handle == nil {
		t.Fatalf("openDBForPath(sess-alpha): handle=%v err=%v", handle, err)
	}
	if handle.path != filepath.Join(proj1DataDir, dbName) {
		t.Fatalf("sess-alpha opened wrong DB: got %s, want %s", handle.path, filepath.Join(proj1DataDir, dbName))
	}
	_ = handle.close()

	handle2, err := a.openDBForPath(SessionPath("sess-beta"))
	if err != nil || handle2 == nil {
		t.Fatalf("openDBForPath(sess-beta): handle=%v err=%v", handle2, err)
	}
	if handle2.path != filepath.Join(proj2DataDir, dbName) {
		t.Fatalf("sess-beta opened wrong DB: got %s, want %s", handle2.path, filepath.Join(proj2DataDir, dbName))
	}
	_ = handle2.close()
}

// TestOpenDBForPathExplicitDirIgnoresIndex verifies that an adapter
// with an explicit Dir always opens the configured database,
// regardless of what is in dbIndex.
func TestOpenDBForPathExplicitDirIgnoresIndex(t *testing.T) {
	dataDir, db := newFixtureDB(t, func(db *sql.DB) {
		insertSession(t, db, "sess-x", "", "Test", time.Now(), 1)
	})
	_ = db
	a := NewAdapter(dataDir)
	handle, err := a.openDBForPath(SessionPath("sess-x"))
	if err != nil || handle == nil {
		t.Fatalf("openDBForPath failed: handle=%v err=%v", handle, err)
	}
	expected := filepath.Join(dataDir, dbName)
	if handle.path != expected {
		t.Fatalf("expected %s, got %s", expected, handle.path)
	}
	_ = handle.close()
}

// TestProjectPathForDBInfersFromConventionalPath verifies the path
// inference fallback: a DB at <project>/.crush/crush.db resolves to
// <project>.
func TestProjectPathForDBInfersFromConventionalPath(t *testing.T) {
	tmp := t.TempDir()
	dbPath := filepath.Join(tmp, "myproject", dataDirName, dbName)
	got := Adapter{}.projectPathForDB(dbPath)
	expected := filepath.Join(tmp, "myproject")
	if got != expected {
		t.Fatalf("projectPathForDB(%q) = %q, want %q", dbPath, got, expected)
	}
}

// TestProjectPathForDBRejectsGlobalDir verifies that the global data
// directory itself returns "" (sessions there belong to Crush, not a
// user repo).
func TestProjectPathForDBRejectsGlobalDir(t *testing.T) {
	globalDir := t.TempDir()
	t.Setenv("CRUSH_GLOBAL_DATA", globalDir)
	dbPath := filepath.Join(globalDir, dataDirName, dbName)
	got := Adapter{}.projectPathForDB(dbPath)
	if got != "" {
		t.Fatalf("projectPathForDB(global DB) = %q, want empty", got)
	}
}

// TestProjectPathForDBEmptyInput verifies that empty input returns "".
func TestProjectPathForDBEmptyInput(t *testing.T) {
	if got := (Adapter{}).projectPathForDB(""); got != "" {
		t.Fatalf("projectPathForDB(\"\") = %q, want empty", got)
	}
}

// TestWarnIfOldSchemaDetectsMissingColumns verifies that a database
// without the expected columns is detected as old-schema.
func TestWarnIfOldSchemaDetectsMissingColumns(t *testing.T) {
	tmp := t.TempDir()
	dbPath := filepath.Join(tmp, "old.db")
	// Create a database with a deliberately minimal messages table
	// missing model, provider, and parent_session_id.
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	handle, err := sql.Open("sqlite", "file:"+dbPath+"?_pragma=journal_mode(WAL)")
	if err != nil {
		t.Fatal(err)
	}
	handle.SetMaxOpenConns(1)
	t.Cleanup(func() { _ = handle.Close() })
	if _, err := handle.Exec(`
		CREATE TABLE messages (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL,
			role TEXT NOT NULL,
			parts TEXT NOT NULL DEFAULT '[]',
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		);
	`); err != nil {
		t.Fatal(err)
	}

	h := &sqlHandle{path: dbPath, db: handle}
	a := NewAdapter("")
	missing := schemaMissingColumns(h)
	if len(missing) != 3 {
		t.Fatalf("expected 3 missing columns, got %d: %v", len(missing), missing)
	}
	if a.warnIfOldSchema(h) != true {
		t.Fatal("warnIfOldSchema should return true for old schema")
	}
	// Second call should be deduplicated — still returns true but
	// LoadOrStore confirms the path was stored.
	if _, ok := a.warnedOldSchema.Load(dbPath); !ok {
		t.Fatal("warnedOldSchema should have recorded the path")
	}
}

// TestWarnIfOldSchemaSkipsGoodSchema verifies that a database with all
// expected columns does not trigger a warning.
func TestWarnIfOldSchemaSkipsGoodSchema(t *testing.T) {
	tmp := t.TempDir()
	dbPath := filepath.Join(tmp, "good.db")
	handle, err := sql.Open("sqlite", "file:"+dbPath+"?_pragma=journal_mode(WAL)")
	if err != nil {
		t.Fatal(err)
	}
	handle.SetMaxOpenConns(1)
	t.Cleanup(func() { _ = handle.Close() })
	if _, err := handle.Exec(`
		CREATE TABLE messages (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL,
			role TEXT NOT NULL,
			parts TEXT NOT NULL DEFAULT '[]',
			model TEXT,
			provider TEXT,
			parent_session_id TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		);
	`); err != nil {
		t.Fatal(err)
	}

	h := &sqlHandle{path: dbPath, db: handle}
	a := NewAdapter("")
	missing := schemaMissingColumns(h)
	if len(missing) != 0 {
		t.Fatalf("expected 0 missing columns, got %d: %v", len(missing), missing)
	}
	if a.warnIfOldSchema(h) != false {
		t.Fatal("warnIfOldSchema should return false for good schema")
	}
}
