import { useState, useMemo } from "react";

/* ─── Problem Input ─── */
const ROWS = 6, COLS = 7;
const ARROWS = [
  [ 0, 0, 1, 0, 0, 1, 0],
  [ 1, 2, 1,-1, 1, 1, 1],
  [ 0, 0, 0, 0, 2, 3, 1],
  [ 1,-1, 0, 0, 0,-1, 1],
  [ 0, 0, 1, 3, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0],
];
const DIR_NAMES = ["→", "↓", "←", "↑"];
const DIR_DELTAS = [[0,1],[1,0],[0,-1],[-1,0]];
const key = (r, c) => `${r},${c}`;
const START = [0, 0], GOAL = [5, 6];

/* ─── Precompute Expected Output ─── */
const EXPECTED = (() => {
  const dist = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));
  const parent = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
  dist[START[0]][START[1]] = 0;
  const dq = [[0, START[0], START[1]]];
  const visited = new Set();
  let expanded = 0;

  while (dq.length) {
    const [d, r, c] = dq.shift();
    const k = key(r, c);
    if (visited.has(k)) continue;
    visited.add(k);
    expanded++;
    if (r === GOAL[0] && c === GOAL[1]) {
      const path = [];
      let pr = r, pc = c;
      while (pr !== null && pc !== null) {
        path.unshift([pr, pc]);
        const p = parent[pr][pc];
        if (!p) break;
        [pr, pc] = p;
      }
      return { path, cost: d, expanded };
    }
    const cellDir = ARROWS[r][c];
    for (let dir = 0; dir < 4; dir++) {
      const [dr, dc] = DIR_DELTAS[dir];
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (ARROWS[nr][nc] === -1 || visited.has(key(nr, nc))) continue;
      const w = dir === cellDir ? 0 : 1;
      const nd = d + w;
      if (nd < dist[nr][nc]) {
        dist[nr][nc] = nd;
        parent[nr][nc] = [r, c];
        if (w === 0) dq.unshift([nd, nr, nc]);
        else dq.push([nd, nr, nc]);
      }
    }
  }
  return { path: [], cost: -1, expanded };
})();

/* ─── Build simulation steps ─── */
function buildSteps() {
  const dist = Array.from({ length: ROWS }, () => new Array(COLS).fill(Infinity));
  const parent = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
  const steps = [];

  dist[START[0]][START[1]] = 0;
  const deque = [[0, START[0], START[1]]];
  const visited = new Set();
  const finalized = new Set();
  const dequeSnap = () => deque.map(x => [...x]);

  steps.push({
    title: "Initialize – Start at (0,0), Cost = 0",
    detail: `dist[0][0]=0. Push (cost=0, (0,0)) into the deque. Arrow directions define free (cost 0) vs paid (cost 1) moves.`,
    dist: dist.map(r => [...r]), visited: new Set(),
    deque: dequeSnap(), current: null, neighbors: [],
    phase: "init", codeHL: [2, 3, 4, 5], path: [],
    frontPush: null, backPush: null,
    finalized: new Set(finalized), expanded: 0,
  });

  let stepCount = 0;
  const MAX_STEPS = 50;

  while (deque.length > 0 && stepCount < MAX_STEPS) {
    const [d, r, c] = deque.shift();
    const k = key(r, c);

    if (visited.has(k)) continue;
    visited.add(k);
    finalized.add(k);
    stepCount++;

    if (r === GOAL[0] && c === GOAL[1]) {
      const path = [];
      let pr = r, pc = c;
      while (pr !== null && pc !== null) {
        path.unshift([pr, pc]);
        const p = parent[pr][pc];
        if (!p) break;
        [pr, pc] = p;
      }

      steps.push({
        title: `✓ Goal Reached (${r},${c}) – Cost = ${d}`,
        detail: `Minimum cost path found. Total cost: ${d} direction changes. ${stepCount} nodes expanded. Deque maintained sorted order throughout.`,
        dist: dist.map(r => [...r]), visited: new Set(visited),
        deque: dequeSnap(), current: [r, c], neighbors: [],
        phase: "done", codeHL: [9], path,
        frontPush: null, backPush: null,
        finalized: new Set(finalized), expanded: stepCount,
      });
      break;
    }

    const cellDir = ARROWS[r][c];
    const nbs = [];
    let frontPushes = [];
    let backPushes = [];

    for (let dir = 0; dir < 4; dir++) {
      const [dr, dc] = DIR_DELTAS[dir];
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (ARROWS[nr][nc] === -1) continue;
      if (visited.has(key(nr, nc))) continue;

      const cost = (dir === cellDir) ? 0 : 1;
      const nd = d + cost;

      if (nd < dist[nr][nc]) {
        dist[nr][nc] = nd;
        parent[nr][nc] = [r, c];

        if (cost === 0) {
          deque.unshift([nd, nr, nc]);
          frontPushes.push([nr, nc]);
        } else {
          deque.push([nd, nr, nc]);
          backPushes.push([nr, nc]);
        }
        nbs.push({ r: nr, c: nc, cost, nd, dir });
      }
    }

    const freeNbs = nbs.filter(n => n.cost === 0);
    const paidNbs = nbs.filter(n => n.cost === 1);

    /* Pop step */
    steps.push({
      title: `Pop (${r},${c}) – dist=${d}, arrow=${DIR_NAMES[cellDir]}`,
      detail: `Deque-pop → (${d}, (${r},${c})). Not visited, so mark visited.`,
      dist: dist.map(r_ => [...r_]), visited: new Set(visited),
      deque: dequeSnap(), current: [r, c], neighbors: [],
      phase: "visit", codeHL: [7, 8, 9, 10],
      path: [], frontPush: null, backPush: null,
      finalized: new Set(finalized), expanded: stepCount,
    });

    if (nbs.length > 0) {
      steps.push({
        title: freeNbs.length > 0 && paidNbs.length > 0
          ? `Relax: ${freeNbs.length} free→front, ${paidNbs.length} paid→back`
          : freeNbs.length > 0
          ? `Relax: ${freeNbs.length} free neighbor(s) → front`
          : `Relax: ${paidNbs.length} paid neighbor(s) → back`,
        detail:
          (freeNbs.length > 0 ? `Free (w=0, →front): [${freeNbs.map(n => `(${n.r},${n.c}) d=${n.nd}`).join(", ")}]. ` : "")
          + (paidNbs.length > 0 ? `Paid (w=1, →back): [${paidNbs.map(n => `(${n.r},${n.c}) d=${n.nd}`).join(", ")}]. ` : "")
          + "Deque stays sorted: front ≤ back.",
        dist: dist.map(r_ => [...r_]), visited: new Set(visited),
        deque: dequeSnap(), current: [r, c],
        neighbors: nbs.map(n => [n.r, n.c, n.cost]),
        phase: "relax", codeHL: [12, 13, 14, 15, 16, 17, 18],
        path: [],
        frontPush: frontPushes.length > 0 ? frontPushes.map(([r, c]) => key(r, c)) : null,
        backPush: backPushes.length > 0 ? backPushes.map(([r, c]) => key(r, c)) : null,
        finalized: new Set(finalized), expanded: stepCount,
      });
    } else {
      steps.push({
        title: `No improvements from (${r},${c})`,
        detail: `All neighbors walled, visited, or already have better distances.`,
        dist: dist.map(r_ => [...r_]), visited: new Set(visited),
        deque: dequeSnap(), current: [r, c], neighbors: [],
        phase: "skip", codeHL: [12, 13],
        path: [], frontPush: null, backPush: null,
        finalized: new Set(finalized), expanded: stepCount,
      });
    }
  }

  return steps;
}

/* ─── Grid SVG ─── */
function GridView({ step }) {
  const { dist, visited, current, neighbors, path } = step;
  const cellSize = 50;
  const pathSet = new Set((path || []).map(([r, c]) => key(r, c)));
  const nbMap = {};
  (neighbors || []).forEach(([r, c, cost]) => { nbMap[key(r, c)] = cost; });
  const frontSet = new Set(step.frontPush || []);
  const backSet = new Set(step.backPush || []);

  return (
    <svg viewBox={`0 0 ${COLS * cellSize + 2} ${ROWS * cellSize + 2}`} className="w-full" style={{ maxHeight: 230 }}>
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const k = key(r, c);
          const isWall = ARROWS[r][c] === -1;
          const isCurrent = current && current[0] === r && current[1] === c;
          const isStart = r === START[0] && c === START[1];
          const isGoal = r === GOAL[0] && c === GOAL[1];
          const isPath = pathSet.has(k);
          const isVis = visited.has(k);
          const nbCost = nbMap[k];
          const isFront = frontSet.has(k);
          const isBack = backSet.has(k);
          const d = dist[r][c];

          let fill = "#18181b";
          if (isWall) fill = "#27272a";
          else if (isPath) fill = "#059669";
          else if (isCurrent) fill = "#2563eb";
          else if (isFront) fill = "#166534";
          else if (isBack) fill = "#7c2d12";
          else if (nbCost === 0) fill = "#14532d";
          else if (nbCost === 1) fill = "#7c2d12";
          else if (isVis) fill = "#1e293b";

          const stroke = isCurrent ? "#3b82f6" : isPath ? "#10b981" : isFront ? "#22c55e" : isBack ? "#f97316" : "#27272a";

          return (
            <g key={k}>
              <rect x={c * cellSize + 1} y={r * cellSize + 1}
                width={cellSize - 1} height={cellSize - 1}
                fill={fill} stroke={stroke}
                strokeWidth={isCurrent || isFront || isBack ? 2.5 : 0.5} rx={4} />
              {!isWall && (
                <text x={c * cellSize + cellSize - 6} y={r * cellSize + 12}
                  textAnchor="end" fill={isCurrent ? "#93c5fd" : "#52525b80"} fontSize="10">
                  {DIR_NAMES[ARROWS[r][c]]}
                </text>
              )}
              {!isWall && d !== Infinity && (
                <text x={c * cellSize + cellSize / 2 + 1} y={r * cellSize + cellSize / 2 + 3}
                  textAnchor="middle" dominantBaseline="central"
                  fill={isPath ? "#a7f3d0" : isCurrent ? "#93c5fd" : isFront ? "#86efac" : isBack ? "#fdba74" : "#71717a"}
                  fontSize="13" fontWeight="700" fontFamily="monospace">{d}</text>
              )}
              {isWall && (
                <text x={c * cellSize + cellSize / 2 + 1} y={r * cellSize + cellSize / 2 + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#3f3f46" fontSize="14">▪</text>
              )}
              {isStart && !isCurrent && (
                <text x={c * cellSize + 6} y={r * cellSize + cellSize - 6}
                  fill="#818cf8" fontSize="7" fontWeight="700">S</text>
              )}
              {isGoal && (
                <text x={c * cellSize + 6} y={r * cellSize + cellSize - 6}
                  fill="#fca5a5" fontSize="7" fontWeight="700">G</text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

/* ─── Python Code (clean function) ─── */
const CODE = [
  { id: 0,  text: `from collections import deque` },
  { id: 1,  text: `` },
  { id: 2,  text: `def zero_one_bfs(grid, start, goal):` },
  { id: 3,  text: `    dist = [[inf]*C for _ in range(R)]` },
  { id: 4,  text: `    dist[sr][sc] = 0` },
  { id: 5,  text: `    dq = deque([(0, sr, sc)])` },
  { id: 6,  text: `` },
  { id: 7,  text: `    while dq:` },
  { id: 8,  text: `        d, r, c = dq.popleft()` },
  { id: 9,  text: `        if d > dist[r][c]: continue` },
  { id: 10, text: `        if (r,c) == goal: return d` },
  { id: 11, text: `` },
  { id: 12, text: `        for nr, nc, w in neighbors(r, c):` },
  { id: 13, text: `            nd = d + w` },
  { id: 14, text: `            if nd < dist[nr][nc]:` },
  { id: 15, text: `                dist[nr][nc] = nd` },
  { id: 16, text: `                if w == 0:` },
  { id: 17, text: `                    dq.appendleft((nd,nr,nc))` },
  { id: 18, text: `                else:` },
  { id: 19, text: `                    dq.append((nd,nr,nc))` },
  { id: 20, text: `` },
  { id: 21, text: `    return -1` },
];

/* ─── IO Panel ─── */
function IOPanel({ step }) {
  const { phase, expanded, path, finalized } = step;
  const done = phase === "done";
  const allMatch = done && path.length > 0 && path.length - 1 === EXPECTED.cost;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">grid </span> = <span className="text-zinc-300">{ROWS}×{COLS}</span> <span className="text-zinc-600">(arrows + 3 walls)</span></div>
          <div><span className="text-zinc-500">start</span> = <span className="text-violet-400">({START[0]},{START[1]})</span>  <span className="text-zinc-500">goal</span> = <span className="text-red-400">({GOAL[0]},{GOAL[1]})</span></div>
          <div><span className="text-zinc-500">w(e) </span> = <span className="text-emerald-400">0</span> <span className="text-zinc-600">(with arrow)</span> or <span className="text-orange-400">1</span> <span className="text-zinc-600">(against)</span></div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">cost    </span> = <span className="text-zinc-300">{EXPECTED.cost}</span></div>
          <div><span className="text-zinc-500">expanded</span> = <span className="text-zinc-300">{EXPECTED.expanded}</span></div>
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
            <span className="text-zinc-700"> / {EXPECTED.expanded}</span>
          </div>
          <div>
            <span className="text-zinc-500">visited </span> = <span className="text-zinc-300">{finalized.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Code Panel ─── */
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

/* ─── Navigation Bar ─── */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button
        onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >← Prev</button>
      <div className="flex gap-1.5 items-center">
        {total <= 25
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
export default function ZeroOneBFSViz() {
  const steps = useMemo(() => buildSteps(), []);
  const [si, setSi] = useState(0);
  const step = steps[Math.min(si, steps.length - 1)];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* ═══ 1. Header ═══ */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold tracking-tight">0-1 BFS</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Deque-Based Shortest Path for Binary Edge Weights • O(V+E)</p>
        </div>

        {/* ═══ 2. Core Idea ═══ */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            When edge weights are only 0 or 1, replace Dijkstra's heap with a deque: push cost-0 neighbors to the <span className="text-emerald-400 font-semibold">front</span>, cost-1 to the <span className="text-orange-400 font-semibold">back</span>. The deque stays naturally sorted (front ≤ back), giving Dijkstra-level optimality in O(V+E) — no log factor.
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
            <IOPanel step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{ROWS}×{COLS} • arrows = free dir • numbers = min cost</div>
              <GridView step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-600 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-800 inline-block" />→front</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-900 inline-block" />→back</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-800 inline-block" />Visited</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-600 inline-block" />Path</span>
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

            {/* Deque */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Deque ({step.deque.length}) — <span className="text-emerald-400">front</span> … <span className="text-orange-400">back</span>
              </div>
              <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                {step.deque.length > 0
                  ? step.deque.slice(0, 12).map(([d, r, c], i) => {
                      const isFirst = i === 0;
                      const isLast = i === step.deque.length - 1;
                      return (
                        <span key={i} className={`inline-flex items-center gap-0.5 px-1.5 h-7 rounded-md font-mono font-bold text-[10px] border ${
                          isFirst ? "bg-emerald-950 border-emerald-800 text-emerald-300" :
                          isLast ? "bg-orange-950 border-orange-800 text-orange-300" :
                          "bg-zinc-900 border-zinc-700 text-zinc-400"
                        }`}>
                          ({r},{c})<span className="text-[9px] opacity-60">:{d}</span>
                        </span>
                      );
                    })
                  : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                {step.deque.length > 12 && <span className="text-[10px] text-zinc-700">+{step.deque.length - 12} more</span>}
              </div>
            </div>

            {/* State stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div>
              <div className="flex gap-4">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-blue-400">{step.expanded}</div>
                  <div className="text-[9px] text-zinc-600">expanded</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-amber-400">{step.deque.length}</div>
                  <div className="text-[9px] text-zinc-600">in deque</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-zinc-400">{step.finalized.size}</div>
                  <div className="text-[9px] text-zinc-600">visited</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-emerald-400">{step.path.length > 0 ? step.path.length - 1 : "—"}</div>
                  <div className="text-[9px] text-zinc-600">path cost</div>
                </div>
              </div>
            </div>

            {/* Final path */}
            {step.phase === "done" && step.path.length > 0 && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Shortest Path ({START[0]},{START[1]}) → ({GOAL[0]},{GOAL[1]})</div>
                <div className="font-mono text-[10px] text-emerald-300">
                  {step.path.map(([r, c]) => `(${r},${c})`).join(" → ")}
                </div>
                <div className="mt-2 flex gap-4 text-[10px]">
                  <span className="text-zinc-500">Cost: <span className="text-emerald-300 font-bold">{step.path.length - 1}</span></span>
                  <span className="text-zinc-500">Expanded: <span className="text-blue-300 font-bold">{step.expanded}</span></span>
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} />
          </div>

        </div>

        {/* ═══ 5. Bottom Row: When to Use + Classic Problems ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Edge weights are exactly 0 and 1 — "some moves are free, others cost 1"</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Grid problems with conditional movement costs</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>When you need Dijkstra optimality but O(V+E) without the log factor</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Can generalize to 0-K BFS with a K+1 bucket queue</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V + E) — no heap needed</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V)</div>
                <div><span className="text-zinc-500 font-semibold">Won't work:</span> Arbitrary weights → Dijkstra; all equal → plain BFS</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1368 — Min Cost to Make Valid Path</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 2290 — Min Obstacle Removal to Reach Corner</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1293 — Shortest Path with Obstacle Elimination</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1129 — Shortest Path with Alternating Colors</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">CF — Labyrinth (classic 0-1 BFS)</span><span className="ml-auto text-[10px] text-amber-700">CF</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">CF — Magic Stones (0-1 BFS on diff array)</span><span className="ml-auto text-[10px] text-amber-700">CF</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
