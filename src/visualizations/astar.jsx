import { useState, useMemo } from "react";

/* ─── Grid Setup ─── */
const ROWS = 8, COLS = 10;
const START = [0, 0], GOAL = [7, 9];
const WALLS = new Set([
  "1,3","1,4","1,5","2,5","3,5","3,1","3,2","3,3",
  "5,4","5,5","5,6","5,7","6,2","6,7","4,7","7,7",
]);
const manhattan = (r, c) => Math.abs(r - GOAL[0]) + Math.abs(c - GOAL[1]);
const key = (r, c) => `${r},${c}`;
const DIRS = [[0,1],[1,0],[0,-1],[-1,0]];

/* ─── Precompute Expected Output ─── */
const EXPECTED = (() => {
  const g = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));
  const parent = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
  const closed = new Set();
  const [sr, sc] = START;
  g[sr][sc] = 0;
  const pq = [[manhattan(sr, sc), sr, sc]];
  let expanded = 0;

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    const [, cr, cc] = pq.shift();
    const ck = key(cr, cc);
    if (closed.has(ck)) continue;
    closed.add(ck);
    expanded++;
    if (cr === GOAL[0] && cc === GOAL[1]) {
      const path = [];
      let pr = cr, pc = cc;
      while (pr !== null) {
        path.unshift([pr, pc]);
        const p = parent[pr][pc];
        if (!p) break;
        [pr, pc] = p;
      }
      return { path, cost: g[cr][cc], expanded };
    }
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (WALLS.has(key(nr, nc)) || closed.has(key(nr, nc))) continue;
      const ng = g[cr][cc] + 1;
      if (ng < g[nr][nc]) {
        g[nr][nc] = ng;
        parent[nr][nc] = [cr, cc];
        pq.push([ng + manhattan(nr, nc), nr, nc]);
      }
    }
  }
  return { path: [], cost: -1, expanded };
})();

const EXPECTED_DIJKSTRA = (() => {
  const g = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));
  const closed = new Set();
  const parent = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
  const [sr, sc] = START;
  g[sr][sc] = 0;
  const pq = [[0, sr, sc]];
  let expanded = 0;

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    const [, cr, cc] = pq.shift();
    const ck = key(cr, cc);
    if (closed.has(ck)) continue;
    closed.add(ck);
    expanded++;
    if (cr === GOAL[0] && cc === GOAL[1]) {
      const path = [];
      let pr = cr, pc = cc;
      while (pr !== null) {
        path.unshift([pr, pc]);
        const p = parent[pr][pc];
        if (!p) break;
        [pr, pc] = p;
      }
      return { path, cost: g[cr][cc], expanded };
    }
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (WALLS.has(key(nr, nc)) || closed.has(key(nr, nc))) continue;
      const ng = g[cr][cc] + 1;
      if (ng < g[nr][nc]) {
        g[nr][nc] = ng;
        parent[nr][nc] = [cr, cc];
        pq.push([ng, nr, nc]);
      }
    }
  }
  return { path: [], cost: -1, expanded };
})();

/* ─── Build simulation steps ─── */
function buildSteps(useHeuristic) {
  const g = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));
  const f = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));
  const parent = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
  const closed = new Set();
  const openSet = new Set();
  const steps = [];

  const [sr, sc] = START;
  g[sr][sc] = 0;
  f[sr][sc] = useHeuristic ? manhattan(sr, sc) : 0;
  const pq = [[f[sr][sc], sr, sc]];
  openSet.add(key(sr, sc));

  const snapG = () => g.map(r => [...r]);
  const snapF = () => f.map(r => [...r]);
  const snapParent = () => parent.map(r => [...r]);

  steps.push({
    title: "Initialize – Set Start to g=0",
    detail: useHeuristic
      ? `g(0,0)=0, h(0,0)=${manhattan(sr, sc)}, f=g+h=${f[sr][sc]}. Push (f=${f[sr][sc]}, (0,0)) into the min-heap.`
      : `dist(0,0)=0. Push (0, (0,0)) into the min-heap. No heuristic — expands uniformly.`,
    g: snapG(), f: snapF(), closed: new Set(closed), openSet: new Set(openSet),
    current: null, neighbors: [], pq: pq.map(x => [...x]),
    phase: "init", codeHL: useHeuristic ? [2, 3, 4, 5, 6] : [2, 3, 4, 5, 6],
    path: [], parent: snapParent(), expanded: 0, finalized: new Set(closed),
  });

  let found = false;
  let expanded = 0;

  while (pq.length && !found) {
    pq.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    const [fv, cr, cc] = pq.shift();
    const ck = key(cr, cc);
    openSet.delete(ck);

    if (closed.has(ck)) continue;
    closed.add(ck);
    expanded++;

    if (cr === GOAL[0] && cc === GOAL[1]) {
      const path = [];
      let pr = cr, pc = cc;
      while (pr !== null) {
        path.unshift([pr, pc]);
        const p = parent[pr][pc];
        if (!p) break;
        [pr, pc] = p;
      }

      steps.push({
        title: `✓ Goal Reached at (${cr},${cc}) — Cost ${g[cr][cc]}`,
        detail: `Path found with cost ${g[cr][cc]}. ${expanded} nodes expanded. ${useHeuristic ? "A*'s heuristic guided the search directly toward the goal." : "Dijkstra explored uniformly — many unnecessary nodes visited."}`,
        g: snapG(), f: snapF(), closed: new Set(closed), openSet: new Set(openSet),
        current: [cr, cc], neighbors: [], pq: pq.map(x => [...x]),
        phase: "done", codeHL: [11, 12], path,
        parent: snapParent(), expanded, finalized: new Set(closed),
      });
      found = true;
      break;
    }

    /* Pop step */
    steps.push({
      title: `Pop (${cr},${cc}) — ${useHeuristic ? `f=${fv}, g=${g[cr][cc]}, h=${manhattan(cr, cc)}` : `dist=${g[cr][cc]}`}`,
      detail: `Heap-pop → (${fv}, (${cr},${cc})). Not in closed set, so add to closed and explore neighbors.`,
      g: snapG(), f: snapF(), closed: new Set(closed), openSet: new Set(openSet),
      current: [cr, cc], neighbors: [], pq: pq.map(x => [...x]),
      phase: "visit", codeHL: [8, 9, 10, 11, 13],
      path: [], parent: snapParent(), expanded, finalized: new Set(closed),
    });

    const nbs = [];
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (WALLS.has(key(nr, nc))) continue;
      if (closed.has(key(nr, nc))) continue;
      const ng = g[cr][cc] + 1;
      const improved = ng < g[nr][nc];
      if (improved) {
        g[nr][nc] = ng;
        f[nr][nc] = ng + (useHeuristic ? manhattan(nr, nc) : 0);
        parent[nr][nc] = [cr, cc];
        pq.push([f[nr][nc], nr, nc]);
        openSet.add(key(nr, nc));
        nbs.push([nr, nc, ng, f[nr][nc]]);
      }
    }

    if (nbs.length > 0) {
      steps.push({
        title: `Relax ${nbs.length} neighbor(s) of (${cr},${cc})`,
        detail: nbs.map(([r, c, gv, fval]) =>
          useHeuristic
            ? `(${r},${c}): g=${gv}, h=${manhattan(r, c)}, f=${fval}`
            : `(${r},${c}): dist=${gv}`
        ).join(" · ") + ".",
        g: snapG(), f: snapF(), closed: new Set(closed), openSet: new Set(openSet),
        current: [cr, cc], neighbors: nbs.map(([r, c]) => [r, c]), pq: pq.map(x => [...x]),
        phase: "relax", codeHL: [15, 16, 17, 18, 19, 20],
        path: [], parent: snapParent(), expanded, finalized: new Set(closed),
      });
    } else {
      steps.push({
        title: `No improvements from (${cr},${cc})`,
        detail: `All neighbors walled, closed, or already have better distances.`,
        g: snapG(), f: snapF(), closed: new Set(closed), openSet: new Set(openSet),
        current: [cr, cc], neighbors: [], pq: pq.map(x => [...x]),
        phase: "skip", codeHL: [15, 16],
        path: [], parent: snapParent(), expanded, finalized: new Set(closed),
      });
    }
  }

  return steps;
}

/* ─── Grid SVG ─── */
function GridView({ step, showH }) {
  const { g, closed, openSet, current, neighbors, path } = step;
  const cellSize = 38;
  const pathSet = new Set(path.map(([r, c]) => key(r, c)));
  const nbSet = new Set(neighbors.map(([r, c]) => key(r, c)));

  return (
    <svg viewBox={`0 0 ${COLS * cellSize + 2} ${ROWS * cellSize + 2}`} className="w-full" style={{ maxHeight: 230 }}>
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const k = key(r, c);
          const isWall = WALLS.has(k);
          const isStart = r === START[0] && c === START[1];
          const isGoal = r === GOAL[0] && c === GOAL[1];
          const isCurrent = current && current[0] === r && current[1] === c;
          const isPath = pathSet.has(k);
          const isClosed = closed.has(k);
          const isOpen = openSet.has(k);
          const isNb = nbSet.has(k);
          const gv = g[r][c];

          let fill = "#18181b";
          if (isWall) fill = "#3f3f46";
          else if (isPath) fill = "#059669";
          else if (isCurrent) fill = "#2563eb";
          else if (isNb) fill = "#d97706";
          else if (isGoal) fill = "#dc2626";
          else if (isStart) fill = "#7c3aed";
          else if (isClosed) fill = "#1e3a5f";
          else if (isOpen) fill = "#422006";

          const stroke = isPath ? "#10b981" : isCurrent ? "#3b82f6" : "#27272a";

          return (
            <g key={k}>
              <rect x={c * cellSize + 1} y={r * cellSize + 1} width={cellSize - 1} height={cellSize - 1}
                fill={fill} stroke={stroke} strokeWidth={isPath || isCurrent ? 2 : 0.5} rx={3} />
              {isStart && <text x={c * cellSize + cellSize / 2 + 1} y={r * cellSize + cellSize / 2 + 1} textAnchor="middle" dominantBaseline="central" fill="#c4b5fd" fontSize="10" fontWeight="700">S</text>}
              {isGoal && <text x={c * cellSize + cellSize / 2 + 1} y={r * cellSize + cellSize / 2 + 1} textAnchor="middle" dominantBaseline="central" fill="#fca5a5" fontSize="10" fontWeight="700">G</text>}
              {!isWall && !isStart && !isGoal && gv !== Infinity && (
                <text x={c * cellSize + cellSize / 2 + 1} y={r * cellSize + cellSize / 2 + 1} textAnchor="middle" dominantBaseline="central"
                  fill={isPath ? "#a7f3d0" : isCurrent ? "#93c5fd" : "#52525b"} fontSize="9" fontFamily="monospace">
                  {gv}
                </text>
              )}
              {showH && !isWall && !isStart && (
                <text x={c * cellSize + cellSize - 4} y={r * cellSize + 10} textAnchor="end" fill="#7c3aed40" fontSize="7" fontFamily="monospace">
                  {manhattan(r, c)}
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

/* ─── Python Code (clean functions) ─── */
const CODE_ASTAR = [
  { id: 0,  text: `import heapq` },
  { id: 1,  text: `` },
  { id: 2,  text: `def astar(grid, start, goal):` },
  { id: 3,  text: `    g = {start: 0}` },
  { id: 4,  text: `    pq = [(h(start), start)]` },
  { id: 5,  text: `    parent = {}` },
  { id: 6,  text: `    closed = set()` },
  { id: 7,  text: `` },
  { id: 8,  text: `    while pq:` },
  { id: 9,  text: `        _, cur = heapq.heappop(pq)` },
  { id: 10, text: `        if cur in closed: continue` },
  { id: 11, text: `        closed.add(cur)` },
  { id: 12, text: `        if cur == goal:` },
  { id: 13, text: `            return build_path(parent, cur)` },
  { id: 14, text: `` },
  { id: 15, text: `        for nb in neighbors(cur):` },
  { id: 16, text: `            ng = g[cur] + 1` },
  { id: 17, text: `            if ng < g.get(nb, inf):` },
  { id: 18, text: `                g[nb] = ng` },
  { id: 19, text: `                parent[nb] = cur` },
  { id: 20, text: `                heapq.heappush(pq, (ng + h(nb), nb))` },
  { id: 21, text: `` },
  { id: 22, text: `    return None` },
];

const CODE_DIJKSTRA_COMPARE = [
  { id: 0,  text: `import heapq` },
  { id: 1,  text: `` },
  { id: 2,  text: `def dijkstra(grid, start, goal):` },
  { id: 3,  text: `    dist = {start: 0}` },
  { id: 4,  text: `    pq = [(0, start)]` },
  { id: 5,  text: `    parent = {}` },
  { id: 6,  text: `    closed = set()` },
  { id: 7,  text: `` },
  { id: 8,  text: `    while pq:` },
  { id: 9,  text: `        d, cur = heapq.heappop(pq)` },
  { id: 10, text: `        if cur in closed: continue` },
  { id: 11, text: `        closed.add(cur)` },
  { id: 12, text: `        if cur == goal:` },
  { id: 13, text: `            return build_path(parent, cur)` },
  { id: 14, text: `` },
  { id: 15, text: `        for nb in neighbors(cur):` },
  { id: 16, text: `            nd = dist[cur] + 1` },
  { id: 17, text: `            if nd < dist.get(nb, inf):` },
  { id: 18, text: `                dist[nb] = nd` },
  { id: 19, text: `                parent[nb] = cur` },
  { id: 20, text: `                heapq.heappush(pq, (nd, nb))` },
  { id: 21, text: `` },
  { id: 22, text: `    return None  # no heuristic` },
];

/* ─── IO Panel ─── */
function IOPanel({ step, mode }) {
  const { phase, expanded, path, finalized } = step;
  const done = phase === "done";
  const expected = mode === "astar" ? EXPECTED : EXPECTED_DIJKSTRA;
  const allMatch = done && path.length > 0 && path.length - 1 === expected.cost;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">grid </span> = <span className="text-zinc-300">{ROWS}×{COLS}</span> <span className="text-zinc-600">({WALLS.size} walls)</span></div>
          <div><span className="text-zinc-500">start</span> = <span className="text-violet-400">({START[0]},{START[1]})</span>  <span className="text-zinc-500">goal</span> = <span className="text-red-400">({GOAL[0]},{GOAL[1]})</span></div>
          {mode === "astar" && (
            <div><span className="text-zinc-500">h(n) </span> = <span className="text-purple-400">|r−gr|+|c−gc|</span></div>
          )}
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">cost    </span> = <span className="text-zinc-300">{expected.cost}</span></div>
          <div><span className="text-zinc-500">expanded</span> = <span className="text-zinc-300">{expected.expanded}</span></div>
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div>
            <span className="text-zinc-500">cost    </span> = {done && path.length > 0
              ? <span className="text-emerald-300 font-bold">{path.length - 1}</span>
              : <span className="text-zinc-600">?</span>}
          </div>
          <div>
            <span className="text-zinc-500">expanded</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{expanded}</span>
            <span className="text-zinc-700"> / {expected.expanded}</span>
          </div>
          <div>
            <span className="text-zinc-500">closed  </span> = <span className="text-zinc-300">{finalized.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Code Panel ─── */
function CodePanel({ highlightLines, code }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {code.map((line) => {
          const hl = highlightLines.includes(line.id);
          return (
            <div
              key={line.id}
              className={`px-2 rounded-sm ${
                hl ? "bg-blue-500/15 text-blue-300" : line.text === "" ? "" : "text-zinc-500"
              }`}
            >
              <span className="inline-block w-5 text-right mr-3 text-zinc-700 select-none" style={{ userSelect: "none" }}>
                {line.text !== "" ? line.id + 1 : ""}
              </span>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Navigation Bar ─── */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button
        onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >← Prev</button>
      <div className="flex gap-1.5 items-center">
        {total <= 30
          ? Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => setSi(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === si ? "bg-blue-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`} />
            ))
          : <>
              <button onClick={() => setSi(0)} className={`px-2 py-0.5 text-xs rounded ${si === 0 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>Start</button>
              <input type="range" min={0} max={total - 1} value={si} onChange={(e) => setSi(Number(e.target.value))}
                className="w-32 accent-blue-500" />
              <span className="text-[10px] text-zinc-600 font-mono w-12 text-center">{si + 1}/{total}</span>
              <button onClick={() => setSi(total - 1)} className={`px-2 py-0.5 text-xs rounded ${si === total - 1 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>End</button>
            </>
        }
      </div>
      <button
        onClick={() => setSi(Math.min(total - 1, si + 1))} disabled={si >= total - 1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >Next →</button>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AStarViz() {
  const [mode, setMode] = useState("astar");
  const [si, setSi] = useState(0);
  const stepsA = useMemo(() => buildSteps(true), []);
  const stepsD = useMemo(() => buildSteps(false), []);
  const steps = mode === "astar" ? stepsA : stepsD;
  const step = steps[Math.min(si, steps.length - 1)];
  const CODE = mode === "astar" ? CODE_ASTAR : CODE_DIJKSTRA_COMPARE;

  const switchMode = (m) => { setMode(m); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* ═══ 1. Header ═══ */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">A* Search</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Heuristic-Guided Pathfinding • f(n) = g(n) + h(n)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => switchMode("astar")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "astar" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              A* (with h)
            </button>
            <button onClick={() => switchMode("dijkstra")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "dijkstra" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              Dijkstra (no h)
            </button>
          </div>
        </div>

        {/* ═══ 2. Core Idea ═══ */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            {mode === "astar"
              ? "A* combines Dijkstra's guaranteed shortest path with a heuristic h(n) that estimates remaining cost to the goal. By expanding the node with lowest f(n) = g(n) + h(n), A* steers exploration toward the goal — visiting far fewer nodes than Dijkstra while still finding the optimal path (given an admissible heuristic)."
              : "Dijkstra's algorithm on a grid expands uniformly from the start node — every cell at distance d is explored before any cell at distance d+1. Without a heuristic, it has no sense of direction and explores many irrelevant nodes before reaching the goal. Compare node counts with A* to see the difference."
            }
          </p>
        </div>

        {/* ═══ 3. Navigation ═══ */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 4. 3-Column Grid ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Grid ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} mode={mode} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{ROWS}×{COLS} grid • {WALLS.size} walls • S=(0,0) G=(7,9)</div>
              <GridView step={step} showH={mode === "astar"} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#7c3aed] inline-block" />Start</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#dc2626] inline-block" />Goal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#2563eb] inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#d97706] inline-block" />Neighbor</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#1e3a5f] inline-block" />Closed</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#422006] inline-block" />Open</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#059669] inline-block" />Path</span>
              </div>
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "relax" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "visit" ? "bg-blue-900 text-blue-300" :
                  step.phase === "skip" ? "bg-red-900 text-red-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Open Set (top entries by f) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Priority Queue (top 8 by f)</div>
              <div className="flex gap-1.5 flex-wrap min-h-[28px] items-center">
                {step.pq.length > 0
                  ? [...step.pq].sort((a, b) => a[0] - b[0]).slice(0, 8).map(([fv, r, c], i) => (
                      <span key={i} className={`inline-flex items-center px-1.5 h-7 rounded-md border font-mono font-bold text-[10px] ${
                        mode === "astar" ? "bg-purple-950 border-purple-800 text-purple-300" : "bg-blue-950 border-blue-800 text-blue-300"
                      }`}>
                        ({r},{c}) f={fv}
                      </span>
                    ))
                  : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                {step.pq.length > 8 && <span className="text-[10px] text-zinc-700">+{step.pq.length - 8} more</span>}
              </div>
            </div>

            {/* Stats row */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div>
              <div className="flex gap-4">
                <div className="flex-1 text-center">
                  <div className={`text-xl font-bold font-mono ${mode === "astar" ? "text-purple-400" : "text-blue-400"}`}>{step.expanded}</div>
                  <div className="text-[9px] text-zinc-600">expanded</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-amber-400">{step.pq.length}</div>
                  <div className="text-[9px] text-zinc-600">in open</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-zinc-400">{step.finalized.size}</div>
                  <div className="text-[9px] text-zinc-600">closed</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-emerald-400">{step.path.length > 0 ? step.path.length - 1 : "—"}</div>
                  <div className="text-[9px] text-zinc-600">path cost</div>
                </div>
              </div>
            </div>

            {/* Final path (shown at end) */}
            {step.phase === "done" && step.path.length > 0 && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Shortest Path ({START[0]},{START[1]}) → ({GOAL[0]},{GOAL[1]})</div>
                <div className="font-mono text-[10px] text-emerald-300">
                  {step.path.map(([r, c]) => `(${r},${c})`).join(" → ")}
                </div>
                <div className="mt-2 flex gap-4 text-[10px]">
                  <span className="text-zinc-500">Cost: <span className="text-emerald-300 font-bold">{step.path.length - 1}</span></span>
                  <span className="text-zinc-500">Expanded: <span className={`font-bold ${mode === "astar" ? "text-purple-300" : "text-blue-300"}`}>{step.expanded}</span></span>
                </div>
              </div>
            )}

            {/* A* insight card */}
            {mode === "astar" && step.phase !== "done" && (
              <div className="bg-purple-950/20 border border-purple-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1">Heuristic Guidance</div>
                <p className="text-[10px] text-purple-300/70 leading-relaxed">
                  h(n) = Manhattan distance biases the priority queue toward nodes closer to the goal. Nodes far from the goal get high f values and are explored last (or never).
                </p>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} code={CODE} />
          </div>

        </div>

        {/* ═══ 5. Bottom Row: When to Use + Classic Problems ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Single-source single-target shortest path with a good heuristic</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Grid/map pathfinding — games, robotics, navigation</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>When you need Dijkstra's optimality but want to explore fewer nodes</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Admissible h(n) guarantees optimal path; consistent h(n) avoids re-expansion</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O((V + E) log V) — same as Dijkstra worst case</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V)</div>
                <div><span className="text-zinc-500 font-semibold">Key insight:</span> h=0 reduces to Dijkstra; h=exact gives straight-line search</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1091 — Shortest Path in Binary Matrix</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 773 — Sliding Puzzle</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 675 — Cut Off Trees for Golf Event</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 752 — Open the Lock</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1263 — Min Moves to Move Box to Target</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 864 — Shortest Path to Get All Keys</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
