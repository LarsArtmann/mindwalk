package crush

import (
	"database/sql"
	"fmt"
	"net/url"

	_ "modernc.org/sqlite"
)

// openSQLite opens the Crush database in read-only mode without
// acquiring the data-dir lock. Crush's full open path runs migrations
// and takes a process-wide advisory lock — neither is appropriate for
// the visualizer, which only reads.
//
// mode=ro tells modernc/sqlite to use SQLite's read-only flag; the
// _txlock=immediate hint matches Crush's own open path so concurrent
// readers don't see torn WAL pages from the writer.
func openSQLite(path string) (*sql.DB, error) {
	params := url.Values{}
	params.Set("mode", "ro")
	params.Set("_txlock", "immediate")
	dsn := fmt.Sprintf("file:%s?%s", path, params.Encode())
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	// SQLite serializes writes at the file level anyway; pinning the
	// visualizer's pool to a single connection mirrors Crush's own
	// choice and keeps the read path predictable.
	db.SetMaxOpenConns(1)
	return db, nil
}