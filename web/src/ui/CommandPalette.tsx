import { CornerDownRight, FileCode, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CityFile, Touch } from "../types";

interface CommandPaletteProps {
	files: CityFile[];
	touchByPath: Map<string, Touch>;
	onSelect: (path: string) => void;
	onClose: () => void;
}

interface SearchResult {
	file: CityFile;
	score: number;
}

const MAX_RESULTS = 12;

/** Fuzzy filter: scores by how well the query matches each file path.
 *  Subsequence match with bonus for prefix and consecutive matches. */
function scorePath(query: string, path: string): number {
	const q = query.toLowerCase();
	const p = path.toLowerCase();
	if (p === q) return 1000;
	if (p.endsWith("/" + q)) return 900;

	// subsequence match
	let pi = 0;
	let qi = 0;
	let score = 0;
	let streak = 0;
	while (pi < p.length && qi < q.length) {
		if (p[pi] === q[qi]) {
			streak++;
			score += 1 + streak;
			// bonus for matching after a separator
			if (pi === 0 || p[pi - 1] === "/" || p[pi - 1] === ".") score += 3;
			// bonus for matching the filename (after last /)
			const slashIdx = p.lastIndexOf("/");
			if (pi > slashIdx) score += 2;
			qi++;
		} else {
			streak = 0;
		}
		pi++;
	}
	if (qi < q.length) return -1; // not all query chars matched
	return score;
}

export function CommandPalette({
	files,
	touchByPath,
	onSelect,
	onClose,
}: CommandPaletteProps) {
	const [query, setQuery] = useState("");
	const [activeIdx, setActiveIdx] = useState(0);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const listRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const results = useMemo<SearchResult[]>(() => {
		const q = query.trim();
		if (!q) {
			return files.slice(0, MAX_RESULTS).map((file) => ({ file, score: 0 }));
		}
		const scored: SearchResult[] = [];
		for (const file of files) {
			const score = scorePath(q, file.path);
			if (score >= 0) scored.push({ file, score });
		}
		scored.sort(
			(a, b) => b.score - a.score || (a.file.path < b.file.path ? -1 : 1),
		);
		return scored.slice(0, MAX_RESULTS);
	}, [query, files]);

	useEffect(() => setActiveIdx(0), [query]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setActiveIdx((i) => Math.min(i + 1, results.length - 1));
				break;
			case "ArrowUp":
				e.preventDefault();
				setActiveIdx((i) => Math.max(i - 1, 0));
				break;
			case "Enter":
				e.preventDefault();
				if (results[activeIdx]) {
					onSelect(results[activeIdx].file.path);
					onClose();
				}
				break;
			case "Escape":
				e.preventDefault();
				onClose();
				break;
			case "Tab":
				onClose();
				break;
		}
	};

	// scroll active item into view
	useEffect(() => {
		const list = listRef.current;
		if (!list) return;
		const el = list.children[activeIdx] as HTMLElement | undefined;
		el?.scrollIntoView({ block: "nearest" });
	}, [activeIdx]);

	return (
		<div className="overlay-backdrop" onClick={onClose}>
			<div
				className="command-palette"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-label="Find a file"
			>
				<div className="palette-input-row">
					<Search size={15} aria-hidden />
					<input
						ref={inputRef}
						type="text"
						placeholder="Search files by path…"
						value={query}
						onChange={(e) => setQuery(e.currentTarget.value)}
						onKeyDown={handleKeyDown}
						spellCheck={false}
						aria-label="File search"
						aria-controls="palette-results"
					/>
					<kbd>↵</kbd>
					<button className="icon-btn" onClick={onClose} aria-label="Close">
						<X size={15} />
					</button>
				</div>
				<div className="palette-results" id="palette-results" ref={listRef}>
					{results.length === 0 ? (
						<p className="palette-empty">No files match "{query}".</p>
					) : (
						results.map(({ file }, i) => {
							const slash = file.path.lastIndexOf("/");
							const dir = slash >= 0 ? file.path.slice(0, slash + 1) : "";
							const name = slash >= 0 ? file.path.slice(slash + 1) : file.path;
							const touch = touchByPath.get(file.path);
							return (
								<button
									key={file.id}
									className={
										i === activeIdx ? "palette-result active" : "palette-result"
									}
									onClick={() => {
										onSelect(file.path);
										onClose();
									}}
									onMouseEnter={() => setActiveIdx(i)}
								>
									<span className={`palette-dot ${touch ?? "none"}`} />
									<FileCode size={13} aria-hidden />
									<span className="palette-name">{name}</span>
									<span className="palette-dir">{dir}</span>
									{file.lang ? (
										<span className="palette-lang">{file.lang}</span>
									) : null}
								</button>
							);
						})
					)}
				</div>
				<div className="palette-foot">
					<span>
						<CornerDownRight size={11} aria-hidden /> Enter to fly
					</span>
					<span>Esc to close</span>
				</div>
			</div>
		</div>
	);
}
