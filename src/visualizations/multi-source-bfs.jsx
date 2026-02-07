import { useState, useMemo } from "react";

/* â”€â”€â”€ Problem Input â”€â”€â”€ */
const ROWS = 7, COLS = 8;
const GRIDS = {
  rotting: {
    title: "Rotting Oranges",
    coreIdea: "All rotten oranges are BFS sources seeded at distance 0. Each minute, rot spreads to adjacent fresh oranges. This is equivalent to adding a virtual super-source connected to every rotten cell â€” one BFS pass computes the answer in O(RÃ—C).",
    grid: [
      [2, 1, 1, 0, 0, 1, 1, 2],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1,-1,-1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [2, 1, 1, 0, 0, 1, 1, 1],
    ],
    sourceVal: 2, freshVal: 1, wallVal: -1,
    sourceLabel: "Rotten ðŸŠ", freshLabel: "Fresh ðŸŠ", wallLabel: "Wall",
    resultLabel: "minutes",
  },
  gates: {
    title: "Walls and Gates",
    coreIdea: "Every gate is a BFS source at distance 0. BFS expands level by level â€” each empty room gets the distance to its nearest gate. One pass, O(RÃ—C). No need to BFS from each gate separately.",
    grid: [
      [2, 0, 0, 1, 0, 1, 0, 2],
      [0,-1, 0,-1, 0,-1, 0, 0],
      [0, 0, 0, 0, 0, 0,-1, 0],
      [0,-1,-1,-1, 0,-1,-1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0,-1, 0,-1,-1,-1, 0,-1],
      [2, 0, 0, 0, 0, 0, 0, 2],
    ],
    sourceVal: 2, freshVal: 0, wallVal: -1,
    sourceLabel: "Gate ðŸšª", freshLabel: "Room", wallLabel: "Wall",
    resultLabel: "distance",
  },
};

const DIRS = [[0,1],[1,0],[0,-1],[-1,0]];
const key = (r, c) => `${r},${c}`;

/* â”€â”€â”€ Precompute Expected Output â”€â”€â”€ */
function computeExpected(example) {
  const { grid, sourceVal, freshVal, wallVal } = example;
  const dist = Array.from({ length: ROWS }, () => new Array(COLS).fill(-1));
  const queue = [];
  let totalFresh = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === sourceVal) { dist[r][c] = 0; queue.push([r, c]); }
      else if (grid[r][c] === freshVal) totalFresh++;
    }
  let qi = 0, level = 0, reached = 0;
  while (qi < queue.length) {
    const sz = queue.length - qi;
    let any = false;
    level++;
    for (let idx = qi; idx < qi + sz; idx++) {
      const [r, c] = queue[idx];
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (dist[nr][nc] !== -1 || grid[nr][nc] === wallVal || grid[nr][nc] !== freshVal) continue;
        dist[nr][nc] = level; queue.push([nr, nc]); reached++; any = true;
      }
    }
    qi += sz;
    if (!any) break;
  }
  return { maxDist: reached === totalFresh ? level : -1, reached, totalFresh, sources: queue.length - reached };
}

const EXPECTED = { rotting: computeExpected(GRIDS.rotting), gates: computeExpected(GRIDS.gates) };

/* â”€â”€â”€ Build simulation steps â”€â”€â”€ */
function buildSteps(example) {
  const { grid, sourceVal, freshVal, wallVal } = example;
  const dist = Array.from({ length: ROWS }, () => new Array(COLS).fill(-1));
  const state = grid.map(r => [...r]);
  const steps = [];
  const queue = [];

  let totalFresh = 0;
  const sources = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === sourceVal) { dist[r][c] = 0; queue.push([r, c]); sources.push([r, c]); }
      else if (grid[r][c] === freshVal) totalFresh++;
    }

  const snapDist = () => dist.map(r => [...r]);
  const snapState = () => state.map(r => [...r]);

  steps.push({
    title: "Initialize â€“ Seed All Sources at dist=0",
    detail: `${sources.length} sources enqueued at distance 0. ${totalFresh} cells to reach. BFS from all sources simultaneously.`,
    dist: snapDist(), state: snapState(),
    queue: queue.map(x => [...x]), level: 0,
    current: null, newCells: [], phase: "init", codeHL: [2, 3, 4, 5, 6, 7],
    reached: 0, totalFresh, finalized: new Set(sources.map(([r, c]) => key(r, c))),
  });

  let level = 0, reached = 0, qi = 0;

  while (qi < queue.length) {
    const levelSize = queue.length - qi;
    level++;
    const newThisLevel = [];
    const startQi = qi, endQi = qi + levelSize;

    for (let idx = startQi; idx < endQi; idx++) {
      const [r, c] = queue[idx];
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (dist[nr][nc] !== -1 || grid[nr][nc] === wallVal || grid[nr][nc] !== freshVal) continue;
        dist[nr][nc] = level;
        state[nr][nc] = sourceVal;
        queue.push([nr, nc]);
        newThisLevel.push([nr, nc]);
        reached++;
      }
    }
    qi = endQi;

    if (newThisLevel.length > 0) {
      const finSet = new Set();
      for (let i = 0; i < queue.length; i++) { const [r2, c2] = queue[i]; if (dist[r2][c2] >= 0) finSet.add(key(r2, c2)); }

      steps.push({
        title: `Level ${level} â€“ ${newThisLevel.length} New Cells Reached`,
        detail: `All cells at dist ${level - 1} expand. ${newThisLevel.length} fresh cells reached: [${newThisLevel.slice(0, 5).map(([r, c]) => `(${r},${c})`).join(", ")}${newThisLevel.length > 5 ? ", â€¦" : ""}]. Total: ${reached}/${totalFresh}.`,
        dist: snapDist(), state: snapState(),
        queue: queue.slice(qi).map(x => [...x]), level,
        current: null, newCells: newThisLevel.map(([r, c]) => key(r, c)),
        phase: "expand", codeHL: [9, 10, 11, 12, 13, 14],
        reached, totalFresh, finalized: finSet,
      });
    }

    if (newThisLevel.length === 0) break;
  }

  const allReached = reached === totalFresh;
  const finAll = new Set();
  for (const [r2, c2] of queue) finAll.add(key(r2, c2));

  steps.push({
    title: allReached
      ? `âœ“ Complete â€“ All Reached in ${level} ${example.resultLabel}`
      : `âœ— Complete â€“ ${totalFresh - reached} Cells Unreachable`,
    detail: allReached
      ? `Every reachable cell now has a distance. Max distance: ${level}. O(RÃ—C) single pass.`
      : `${reached}/${totalFresh} cells reached. ${totalFresh - reached} blocked by walls. Return -1.`,
    dist: snapDist(), state: snapState(),
    queue: [], level,
    current: null, newCells: [], phase: allReached ? "done" : "fail",
    codeHL: [16], reached, totalFresh, finalized: finAll,
  });

  return steps;
}

/* â”€â”€â”€ Grid SVG â”€â”€â”€ */
function GridView({ step, example }) {
  const { dist, state } = step;
  const { sourceVal, freshVal, wallVal } = example;
  const cellSize = 44;
  const newSet = new Set(step.newCells || []);

  return (
    <svg viewBox={`0 0 ${COLS * cellSize + 2} ${ROWS * cellSize + 2}`} className="w-full" style={{ maxHeight: 230 }}>
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const k = key(r, c);
          const isWall = state[r][c] === wallVal || example.grid[r][c] === wallVal;
          const isSource = example.grid[r][c] === sourceVal;
          const isNew = newSet.has(k);
          const d = dist[r][c];
          const wasReached = d > 0;
          const isFresh = example.grid[r][c] === freshVal && d === -1;

          let fill = "#18181b";
          if (isWall) fill = "#27272a";
          else if (isNew) fill = "#b45309";
          else if (isSource) fill = "#7c3aed";
          else if (wasReached) {
            const intensity = Math.max(0.15, 0.7 - d * 0.08);
            fill = `rgba(16, 185, 129, ${intensity})`;
          } else if (isFresh) fill = "#1e3a5f";

          const stroke = isNew ? "#f59e0b" : isSource ? "#8b5cf6" : "#27272a";

          return (
            <g key={k}>
              <rect x={c * cellSize + 1} y={r * cellSize + 1}
                width={cellSize - 1} height={cellSize - 1}
                fill={fill} stroke={stroke}
                strokeWidth={isNew ? 2.5 : 0.5} rx={4} />
              {isWall && (
                <text x={c * cellSize + cellSize / 2 + 1} y={r * cellSize + cellSize / 2 + 1}
                  textAnchor="middle" dominantBaseline="central" fill="#3f3f46" fontSize="14">â–ª</text>
              )}
              {isSource && (
                <text x={c * cellSize + cellSize / 2 + 1} y={r * cellSize + cellSize / 2 + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#c4b5fd" fontSize="10" fontWeight="700" fontFamily="monospace">0</text>
              )}
              {wasReached && !isSource && (
                <text x={c * cellSize + cellSize / 2 + 1} y={r * cellSize + cellSize / 2 + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fill={isNew ? "#fbbf24" : "#a7f3d0"} fontSize="11" fontWeight="700" fontFamily="monospace">{d}</text>
              )}
              {isFresh && (
                <text x={c * cellSize + cellSize / 2 + 1} y={r * cellSize + cellSize / 2 + 1}
                  textAnchor="middle" dominantBaseline="central" fill="#3b82f680" fontSize="9">â—Œ</text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

/* â”€â”€â”€ Python Code (clean function) â”€â”€â”€ */
const CODE = [
  { id: 0,  text: `from collections import deque` },
  { id: 1,  text: `` },
  { id: 2,  text: `def multi_source_bfs(grid):` },
  { id: 3,  text: `    R, C = len(grid), len(grid[0])` },
  { id: 4,  text: `    dist = [[-1]*C for _ in range(R)]` },
  { id: 5,  text: `    q = deque()` },
  { id: 6,  text: `    for r, c in all_sources(grid):` },
  { id: 7,  text: `        dist[r][c] = 0` },
  { id: 8,  text: `        q.append((r, c))` },
  { id: 9,  text: `` },
  { id: 10, text: `    while q:` },
  { id: 11, text: `        r, c = q.popleft()` },
  { id: 12, text: `        for nr, nc in neighbors(r, c):` },
  { id: 13, text: `            if dist[nr][nc] == -1:` },
  { id: 14, text: `                dist[nr][nc] = dist[r][c] + 1` },
  { id: 15, text: `                q.append((nr, nc))` },
  { id: 16, text: `` },
  { id: 17, text: `    return max(max(row) for row in dist)` },
];

/* â”€â”€â”€ IO Panel â”€â”€â”€ */
function IOPanel({ step, exKey, example }) {
  const { phase, reached, totalFresh, level, finalized } = step;
  const done = phase === "done";
  const exp = EXPECTED[exKey];
  const allMatch = done && reached === exp.reached;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">grid </span> = <span className="text-zinc-300">{ROWS}Ã—{COLS}</span></div>
          <div><span className="text-zinc-500">src  </span> = <span className="text-purple-400">{exp.sources} {example.sourceLabel}s</span></div>
          <div><span className="text-zinc-500">fresh</span> = <span className="text-blue-400">{exp.totalFresh} cells</span></div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">max_dist</span> = <span className="text-zinc-300">{exp.maxDist === -1 ? "-1 (unreachable)" : exp.maxDist}</span></div>
          <div><span className="text-zinc-500">reached </span> = <span className="text-zinc-300">{exp.reached}/{exp.totalFresh}</span></div>
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div>
            <span className="text-zinc-500">max_dist</span> = {done
              ? <span className="text-emerald-300 font-bold">{level}</span>
              : <span className="text-zinc-600">?</span>}
          </div>
          <div>
            <span className="text-zinc-500">reached </span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{reached}</span>
            <span className="text-zinc-700"> / {totalFresh}</span>
          </div>
          <div>
            <span className="text-zinc-500">level   </span> = <span className="text-zinc-300">{level}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Code Panel â”€â”€â”€ */
function CodePanel({ highlightLines }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {CODE.map((line) => {
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

/* â”€â”€â”€ Navigation Bar â”€â”€â”€ */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button
        onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >â† Prev</button>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setSi(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === si ? "bg-blue-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`} />
        ))}
      </div>
      <button
        onClick={() => setSi(Math.min(total - 1, si + 1))} disabled={si >= total - 1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >Next â†’</button>
    </div>
  );
}

/* â”€â”€â”€ Main Component â”€â”€â”€ */
export default function MultiSourceBFSViz() {
  const [exKey, setExKey] = useState("rotting");
  const [si, setSi] = useState(0);
  const example = GRIDS[exKey];
  const steps = useMemo(() => buildSteps(example), [exKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const switchEx = (k) => { setExKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* â•â•â• 1. Header â•â•â• */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Multi-Source BFS</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Simultaneous BFS from All Sources â€¢ O(RÃ—C) Single Pass</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(GRIDS).map(([k, v]) => (
              <button key={k} onClick={() => switchEx(k)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${exKey === k ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                {v.title}
              </button>
            ))}
          </div>
        </div>

        {/* â•â•â• 2. Core Idea â•â•â• */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{example.coreIdea}</p>
        </div>

        {/* â•â•â• 3. Navigation â•â•â• */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 4. 3-Column Grid â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* â”€â”€ COL 1: IO + Grid â”€â”€ */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} exKey={exKey} example={example} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{ROWS}Ã—{COLS} â€¢ numbers = dist from nearest source</div>
              <GridView step={step} example={example} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-600 inline-block" />Source</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-700 inline-block" />New</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-700 inline-block" />Reached</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#1e3a5f] inline-block" />Fresh</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-zinc-800 inline-block" />Wall</span>
              </div>
            </div>
          </div>

          {/* â”€â”€ COL 2: Steps + State â”€â”€ */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "fail" ? "bg-red-950/30 border-red-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                {step.level > 0 && <span className="text-xs text-amber-400 font-mono font-bold">Level {step.level}</span>}
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "expand" ? "bg-amber-900 text-amber-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "fail" ? "bg-red-900 text-red-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Queue */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Queue ({step.queue.length} pending)</div>
              <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                {step.queue.length > 0
                  ? step.queue.slice(0, 12).map(([r, c], i) => (
                      <span key={i} className="inline-flex items-center px-1.5 h-7 rounded-md bg-amber-950 border border-amber-800 text-amber-300 font-mono font-bold text-[10px]">
                        ({r},{c})
                      </span>
                    ))
                  : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                {step.queue.length > 12 && <span className="text-[10px] text-zinc-700">+{step.queue.length - 12} more</span>}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div>
              <div className="flex gap-4">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-purple-400">{
                    example.grid.flat().filter(v => v === example.sourceVal).length
                  }</div>
                  <div className="text-[9px] text-zinc-600">sources</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-amber-400">{step.level}</div>
                  <div className="text-[9px] text-zinc-600">level</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-emerald-400">{step.reached}</div>
                  <div className="text-[9px] text-zinc-600">reached</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-blue-400">{step.totalFresh - step.reached}</div>
                  <div className="text-[9px] text-zinc-600">remaining</div>
                </div>
              </div>
            </div>

            {/* Completion card */}
            {step.phase === "done" && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Result</div>
                <div className="font-mono text-[11px] text-emerald-300">
                  All {step.totalFresh} cells reached. Max {example.resultLabel}: {step.level}.
                </div>
              </div>
            )}
            {step.phase === "fail" && (
              <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1.5">Result</div>
                <div className="font-mono text-[11px] text-red-300">
                  {step.totalFresh - step.reached} cells unreachable. Return -1.
                </div>
              </div>
            )}
          </div>

          {/* â”€â”€ COL 3: Code â”€â”€ */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} />
          </div>

        </div>

        {/* â•â•â• 5. Bottom Row: When to Use + Classic Problems â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>"Shortest distance to the nearest source" for every cell</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Spreading / infection / fire-expansion problems</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Equivalent to a virtual super-source at dist 0 to all real sources</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Anytime you'd repeat single-source BFS from multiple starts</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(R Ã— C) â€” same as single-source BFS</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(R Ã— C)</div>
                <div><span className="text-zinc-500 font-semibold">Key trick:</span> Seed queue with ALL sources before BFS loop</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 994 â€” Rotting Oranges</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 286 â€” Walls and Gates</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 542 â€” 01 Matrix</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 1162 â€” As Far from Land as Possible</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 934 â€” Shortest Bridge</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 417 â€” Pacific Atlantic Water Flow</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
