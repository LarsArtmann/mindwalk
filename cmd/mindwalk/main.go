package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"github.com/cosmtrek/mindwalk/internal/adapter"
	"github.com/cosmtrek/mindwalk/internal/adapter/claudecode"
	"github.com/cosmtrek/mindwalk/internal/adapter/codex"
	"github.com/cosmtrek/mindwalk/internal/adapter/crush"
	"github.com/cosmtrek/mindwalk/internal/adapter/pi"
	"github.com/cosmtrek/mindwalk/internal/citymap"
	"github.com/cosmtrek/mindwalk/internal/judge"
	"github.com/cosmtrek/mindwalk/internal/model"
	"github.com/cosmtrek/mindwalk/internal/server"
)

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, "mindwalk:", err)
		os.Exit(1)
	}
}

func run(args []string) error {
	if len(args) == 0 {
		return serve(args)
	}
	switch args[0] {
	case "serve":
		return serve(args[1:])
	case "open":
		return open(args[1:])
	case "map":
		return openMap(args[1:])
	case "build":
		return build(args[1:])
	case "trace":
		return trace(args[1:])
	case "analyze":
		return analyze(args[1:])
	case "sessions":
		return listSessions(args[1:])
	case "doctor":
		return doctor(args[1:])
	case "-h", "--help", "help":
		usage()
		return nil
	default:
		return fmt.Errorf("unknown command %q", args[0])
	}
}

// serveFlags holds the flags shared by every command that starts a
// server. The same FlagSet-backed struct covers serve, open, map, and
// any future command that needs the discovery plumbing.
type serveFlags struct {
	port    int
	host    string
	dev     bool
	noOpen  bool
	adapter *adapterFlags
}

// bindServeFlags wires the serve-side flags onto fs and returns the
// parsed struct. Pass-through for dev is omitted by map because it
// only matters when the UI assets are under web/dist.
func bindServeFlags(fs *flag.FlagSet, withDev bool) *serveFlags {
	sf := &serveFlags{}
	fs.IntVar(&sf.port, "port", 0, "port to bind")
	fs.StringVar(&sf.host, "host", "127.0.0.1", "host to bind (use 0.0.0.0 for LAN access)")
	sf.adapter = parseAdapterFlags(fs)
	if withDev {
		fs.BoolVar(&sf.dev, "dev", false, "prefer web/dist from the working tree")
	}
	fs.BoolVar(&sf.noOpen, "no-open", false, "serve without opening a browser")
	return sf
}

func serve(args []string) error {
	fs := flag.NewFlagSet("serve", flag.ExitOnError)
	sf := bindServeFlags(fs, true)
	if err := fs.Parse(args); err != nil {
		return err
	}
	return server.New(serverConfigFromServeFlags(sf)).Start(!sf.noOpen)
}

func open(args []string) error {
	return openSingle(
		args,
		"open",
		false,
		"usage: mindwalk open [--no-open] [--no-crush] [--host 0.0.0.0] <session>",
		func(sf *serveFlags, target string) server.Config {
			cfg := serverConfigFromServeFlags(sf)
			cfg.OpenSession = target
			return cfg
		},
	)
}

func openMap(args []string) error {
	return openSingle(
		args,
		"map",
		true,
		"usage: mindwalk map [--no-open] [--host 0.0.0.0] <repo>",
		func(sf *serveFlags, target string) server.Config {
			cfg := serverConfigFromServeFlags(sf)
			cfg.RepoRoot = target
			cfg.MapOnly = true
			return cfg
		},
	)
}

// openSingle runs the shared wiring for every "open one thing against a
// running server" command. A single positional argument must remain after
// flag parsing; its absolute path is handed to build to produce the final
// Config. WithDev turns on the --dev flag, which is meaningless when the
// command never serves the embedded UI.
func openSingle(
	args []string,
	name string,
	withDev bool,
	usage string,
	build func(sf *serveFlags, target string) server.Config,
) error {
	fs := flag.NewFlagSet(name, flag.ExitOnError)
	sf := bindServeFlags(fs, withDev)
	if err := fs.Parse(args); err != nil {
		return err
	}
	if fs.NArg() != 1 {
		fmt.Fprintln(os.Stderr, usage)
		return fmt.Errorf("usage: mindwalk %s <argument>", name)
	}
	target, err := filepath.Abs(fs.Arg(0))
	if err != nil {
		return err
	}
	return server.New(build(sf, target)).Start(!sf.noOpen)
}

func serverConfigFromServeFlags(sf *serveFlags) server.Config {
	af := sf.adapter
	return server.Config{
		Port:         sf.port,
		Host:         sf.host,
		ClaudeDir:    af.claudeDir,
		CodexDir:     af.codexDir,
		PiDir:        af.piDir,
		CrushDir:     af.crushDir,
		DisableCrush: af.noCrush,
		Dev:          sf.dev,
	}
}

func build(args []string) error {
	positional, out, err := parseOutputArgs(args)
	if err != nil {
		return err
	}
	if len(positional) != 1 {
		return fmt.Errorf("usage: mindwalk build <repo> [-o out]")
	}
	city, err := citymap.Builder{}.Build(positional[0], nil)
	if err != nil {
		return err
	}
	return writeJSON(out, city)
}

func trace(args []string) error {
	positional, out, err := parseOutputArgs(args)
	if err != nil {
		return err
	}
	crushDir := ""
	for i, arg := range positional {
		if arg == "--crush-dir" && i+1 < len(positional) {
			crushDir = positional[i+1]
			positional = append(positional[:i], positional[i+2:]...)
			break
		}
	}
	if len(positional) != 1 {
		return fmt.Errorf("usage: mindwalk trace [--crush-dir DIR] <session> [-o out]")
	}
	tr, err := parseTrace(positional[0], crushDir)
	if err != nil {
		return err
	}
	return writeJSON(out, tr)
}

// judgeMatches reports whether a cached report satisfies an explicit judge
// choice; unset flags match anything. A model matches on either the
// canonical name the run recorded (claude-sonnet-5) or the alias it was
// requested with (sonnet) — so repeating an aliased request hits the cache
// instead of paying for a fresh run every time.
func judgeMatches(report *model.Report, cli, modelName string) bool {
	if cli != "" && report.Judge.CLI != cli {
		return false
	}
	if modelName != "" && report.Judge.Model != modelName && report.Judge.RequestedModel != modelName {
		return false
	}
	return true
}

func analyze(args []string) error {
	fs := flag.NewFlagSet("analyze", flag.ExitOnError)
	out := fs.String("o", "", "write the report to this file instead of stdout")
	judgeCLI := fs.String("judge", "", "judge CLI to use: claude or codex (default: auto-detect)")
	judgeModel := fs.String(
		"model",
		"",
		"judge model override, e.g. sonnet or gpt-5.6-sol (default: the CLI's default)",
	)
	noCache := fs.Bool("no-cache", false, "re-run the judge even when a fresh cached report exists")
	noRubric := fs.Bool(
		"no-rubric",
		false,
		"skip the task rubric layer: one dimensions-only judge call, bypassing the report cache",
	)
	crushDir := fs.String("crush-dir", "", "Crush data directory override (containing crush.db); empty = auto-discover")
	noCrush := fs.Bool("no-crush", false, "disable the Crush adapter (skip the per-project .crush scan)")
	timeout := fs.Duration("timeout", judge.DefaultTimeout, "judge subprocess timeout")
	// Accept flags after the positional argument, matching trace/build.
	var positional []string
	for {
		if err := fs.Parse(args); err != nil {
			return err
		}
		if fs.NArg() == 0 {
			break
		}
		positional = append(positional, fs.Arg(0))
		args = fs.Args()[1:]
	}
	if len(positional) != 1 {
		return fmt.Errorf(
			"usage: mindwalk analyze <session.jsonl> [-o out] [--judge claude|codex] [--model name] [--no-cache] [--no-rubric]",
		)
	}
	session, err := filepath.Abs(positional[0])
	if err != nil {
		return err
	}
	tr, err := parseTrace(session, crushDirFor(*crushDir, *noCrush))
	if err != nil {
		return err
	}

	cache := judge.Cache{Dir: judge.DefaultCacheDir()}
	key := adapter.SessionKey(tr.Session.Harness, session)
	// --no-cache means a fully fresh run: the cached report is neither
	// returned nor mined for a reusable rubric. --no-rubric bypasses the
	// cache in both directions — returning a cached rubric-ful report would
	// contradict the flag, and storing a rubric-less one would downgrade a
	// richer cache entry — so the flag always costs one fresh call.
	var cached *model.Report
	if !*noCache && !*noRubric {
		cached = cache.Load(key)
		// A rubric-enabled request is only answered from cache when the report
		// already settles the rubric question; a rubric-less fresh report gets
		// re-run rather than silently returned without the layer.
		if judge.Fresh(cached, tr) && judgeMatches(cached, *judgeCLI, *judgeModel) &&
			judge.RubricSatisfied(cached) {
			fmt.Fprintln(os.Stderr, "mindwalk: using cached report (pass --no-cache to re-run)")
			return writeJSON(*out, cached)
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), *timeout)
	defer cancel()
	fmt.Fprintf(os.Stderr, "mindwalk: judging %d events, this can take a minute or two…\n", tr.Session.EventCount)
	report, err := judge.Analyze(
		ctx,
		tr,
		judge.Options{CLI: *judgeCLI, Model: *judgeModel, NoRubric: *noRubric, CachedReport: cached},
	)
	if err != nil {
		return err
	}
	if !*noRubric {
		if err := cache.Store(key, report); err != nil {
			fmt.Fprintln(os.Stderr, "mindwalk: report cache write failed:", err)
		}
	}
	return writeJSON(*out, report)
}

// adapterFlags holds the common adapter-discovery flags shared by
// serve, open, sessions, and doctor.
type adapterFlags struct {
	claudeDir string
	codexDir  string
	piDir     string
	crushDir  string
	noCrush   bool
}

// parseAdapterFlags registers the adapter-discovery flags onto fs
// and returns a pointer to the struct that fs.Parse will populate.
// The pointer MUST be used after fs.Parse has run — StringVar/BoolVar
// write into the struct fields, so dereferencing before Parse would
// capture only the defaults (the classic flag-package footgun).
func parseAdapterFlags(fs *flag.FlagSet) *adapterFlags {
	af := &adapterFlags{}
	fs.StringVar(&af.claudeDir, "claude-dir", claudecode.DefaultDir(), "Claude Code projects directory")
	fs.StringVar(&af.codexDir, "codex-dir", codex.DefaultDir(), "Codex sessions directory")
	fs.StringVar(&af.piDir, "pi-dir", pi.DefaultDir(), "pi sessions directory")
	fs.StringVar(&af.crushDir, "crush-dir", "", "Crush data directory override (containing crush.db); empty = auto-discover")
	fs.BoolVar(&af.noCrush, "no-crush", false, "disable the Crush adapter (skip the per-project .crush scan)")
	return af
}

func (f adapterFlags) sources() []adapter.Source {
	sources := []adapter.Source{
		claudecode.Adapter{Dir: f.claudeDir},
		codex.Adapter{Dir: f.codexDir},
		pi.Adapter{Dir: f.piDir},
	}
	if f.noCrush {
		return sources
	}
	if f.crushDir == "" {
		return append(sources, crush.NewAdapter(""))
	}
	return append(sources, crush.NewAdapter(f.crushDir))
}

// closeSources closes any source that implements adapter.Closer. Safe
// to call on mixed source lists where only some adapters hold open
// resources (e.g. crush's database connection pool).
func closeSources(srcs []adapter.Source) {
	for _, src := range srcs {
		if c, ok := src.(adapter.Closer); ok {
			_ = c.Close()
		}
	}
}

// sessionEntry is the JSON representation of one discovered session,
// used when `mindwalk sessions --json` is requested.
type sessionEntry struct {
	Harness    string `json:"harness"`
	StartedAt  string `json:"startedAt,omitempty"`
	EventCount int    `json:"eventCount"`
	Title      string `json:"title,omitempty"`
	Cwd        string `json:"cwd,omitempty"`
	Path       string `json:"path"`
}

// listSessions prints every discovered session across all adapters
// without starting the server. Supports --json for machine-readable
// output, --harness to filter by adapter, and --limit to cap results.
func listSessions(args []string) error {
	fs := flag.NewFlagSet("sessions", flag.ExitOnError)
	af := parseAdapterFlags(fs)
	jsonOut := fs.Bool("json", false, "output sessions as JSON")
	harnessFilter := fs.String("harness", "", "filter by harness (claude-code, codex, pi, crush)")
	limit := fs.Int("limit", 0, "maximum sessions to list (0 = all)")
	if err := fs.Parse(args); err != nil {
		return err
	}
	srcs := af.sources()
	defer closeSources(srcs)
	entries := []sessionEntry{}
	for _, src := range srcs {
		h := src.Harness()
		if *harnessFilter != "" && h != *harnessFilter {
			continue
		}
		metas, err := src.ListSessions()
		if err != nil {
			fmt.Fprintf(os.Stderr, "mindwalk: %s: %v\n", h, err)
			continue
		}
		for _, m := range metas {
			if *limit > 0 && len(entries) >= *limit {
				break
			}
			if *jsonOut {
				entries = append(entries, sessionEntry{
					Harness:    h,
					StartedAt:  m.StartedAt,
					EventCount: m.EventCount,
					Title:      m.Title,
					Cwd:        m.Cwd,
					Path:       m.Path,
				})
			} else {
				cwd := ""
				if m.Cwd != "" {
					cwd = "  cwd=" + m.Cwd
				}
				fmt.Printf("%-8s  %s  %4d events  %s%s\n", h, m.StartedAt, m.EventCount, m.Title, cwd)
			}
		}
		if *limit > 0 && len(entries) >= *limit {
			break
		}
	}
	if *jsonOut {
		return writeJSON("", entries)
	}
	return nil
}

// doctor prints adapter status, data-directory paths, session
// counts, and diagnostic checks so users can verify their
// configuration and troubleshoot issues.
func doctor(args []string) error {
	fs := flag.NewFlagSet("doctor", flag.ExitOnError)
	af := parseAdapterFlags(fs)
	if err := fs.Parse(args); err != nil {
		return err
	}
	srcs := af.sources()
	defer closeSources(srcs)
	for _, src := range srcs {
		h := src.Harness()
		metas, err := src.ListSessions()
		status := "ok"
		count := 0
		if err != nil {
			status = "error: " + err.Error()
		} else {
			count = len(metas)
		}
		dirStatus := ""
		if d := src.SessionDir(); d != "" {
			if adapter.ReadableDir(d) {
				dirStatus = " [dir ok]"
			} else {
				dirStatus = " [dir missing]"
			}
		}
		fmt.Printf("%-8s  sessions=%-4d  %s%s\n", h, count, status, dirStatus)

		if diag, ok := src.(adapter.DiagnosticsSource); ok {
			for _, check := range diag.Diagnostics() {
				fmt.Printf("         %-16s  %-5s  %s\n", check.Name, check.Status, check.Detail)
			}
		}
	}
	fmt.Println()
	fmt.Println("Data directories:")
	fmt.Printf("  claude-dir  %s\n", af.claudeDir)
	fmt.Printf("  codex-dir   %s\n", af.codexDir)
	fmt.Printf("  pi-dir      %s\n", af.piDir)
	if af.noCrush {
		fmt.Printf("  crush       disabled\n")
	} else if af.crushDir != "" {
		fmt.Printf("  crush-dir   %s\n", af.crushDir)
	} else {
		fmt.Printf("  crush       auto-discover\n")
	}
	return nil
}

func parseTrace(path string, crushDir string) (*model.Trace, error) {
	var lastErr error
	for _, source := range traceSources(crushDir) {
		trace, err := source.Parse(path)
		if err == nil {
			return trace, nil
		}
		lastErr = err
	}
	if lastErr != nil {
		return nil, lastErr
	}
	return nil, fmt.Errorf("no session adapters configured")
}

// traceSources returns the adapter sources parseTrace will try, in
// order. An empty crushDir means "auto-discover"; a non-empty
// value pins a specific installation. The noCrush flag is signalled
// by passing a path that cannot possibly exist.
func traceSources(crushDir string) []adapter.Source {
	sources := []adapter.Source{claudecode.Adapter{}, codex.Adapter{}, pi.Adapter{}}
	if crushDir == "" {
		return append(sources, crush.Adapter{})
	}
	return append(sources, crush.Adapter{Dir: crushDir})
}

// crushDirFor resolves the crush directory based on the --crush-dir
// and --no-crush flag values. Empty string means auto-discover.
func crushDirFor(override string, noCrush bool) string {
	if noCrush {
		return "/dev/null/mindwalk-no-crush"
	}
	return override
}

func parseOutputArgs(args []string) ([]string, string, error) {
	var out string
	var positional []string
	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "-o", "--output":
			i++
			if i >= len(args) {
				return nil, "", fmt.Errorf("%s requires a value", args[i-1])
			}
			out = args[i]
		default:
			positional = append(positional, args[i])
		}
	}
	return positional, out, nil
}

func writeJSON(out string, v any) error {
	var f *os.File
	var err error
	if out == "" {
		f = os.Stdout
	} else {
		f, err = os.Create(out)
		if err != nil {
			return err
		}
		defer func() { _ = f.Close() }()
	}
	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	return enc.Encode(v)
}

func usage() {
	fmt.Println(`mindwalk

Usage:
  mindwalk                        serve on a random local port and open the UI
  mindwalk serve [--port N] [--no-open] [--no-crush] [--claude-dir DIR] [--codex-dir DIR] [--pi-dir DIR] [--crush-dir DIR]
  mindwalk open [--no-open] [--no-crush] [--crush-dir DIR] <session> open a specific Claude Code, Codex, pi, or Crush session
  mindwalk map [--no-open] <repo>  open the repository citymap with no session
  mindwalk build <repo> [-o out]  write citymap.json
  mindwalk trace <session> [-o out] write trace.json
  mindwalk analyze <session> [-o out] [--judge claude|codex] [--no-cache] [--no-rubric] evaluate a session with a local agent CLI
  mindwalk sessions [--no-crush] [--crush-dir DIR]  list all discovered sessions without starting the server
  mindwalk doctor [--no-crush] [--crush-dir DIR]    print adapter status, session counts, and data-dir paths

Examples:
  mindwalk serve --crush-dir ~/.local/share/crush   # point at a specific Crush install
  mindwalk serve --no-crush                         # skip the Crush scan entirely
  mindwalk trace crush://session/<id>              # export a Crush session as trace.json`)
}
