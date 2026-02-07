import { useState, useMemo } from "react";

/* â€”â€”â€” Problem Input â€”â€”â€” */
const N = 4;
const EDGES = [[0,1,3],[0,3,7],[1,0,8],[1,2,2],[2,3,1],[3,0,2]];
const POS = [{x:80,y:80},{x:320,y:80},{x:320,y:240},{x:80,y:240}];
const INF = 999;

/* â€”â€”â€” Expected Output (precomputed) â€”â€”â€” */
const EXPECTED_DIST = [
  [0, 3, 5, 6],
  [5, 0, 2, 3],
  [3, 6, 0, 1],
  [2, 5, 7, 0],
];

/* â€”â€”â€” Build simulation steps â€”â€”â€” */
function buildSteps() {
  const dist = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => (i === j ? 0 : INF))
  );
  for (const [u, v, w] of EDGES) dist[u][v] = w;

  const steps = [];
  const snap = () => dist.map(r => [...r]);
  const completedK = new Set();       // which k-rounds are fully done

  steps.push({
    title: "Initialize â€” Build Distance Matrix",
    detail: `Set dist[i][j] = edge weight if edge exists, 0 on diagonal, âˆž otherwise. ${N}Ã—${N} matrix ready.`,
    dist: snap(), prevDist: null, k: -1, i: -1, j: -1,
    changed: null, phase: "init", codeHL: [1, 2, 3, 4, 5],
    completedK: new Set(completedK),
  });

  for (let k = 0; k < N; k++) {
    steps.push({
      title: `k = ${k} â€” Consider Paths Through Node ${k}`,
      detail: `For every pair (i,j): is going iÃ¢â€ '${k}Ã¢â€ 'j shorter than the current iÃ¢â€ 'j? Check dist[i][${k}] + dist[${k}][j] < dist[i][j].`,
      dist: snap(), prevDist: snap(), k, i: -1, j: -1,
      changed: null, phase: "round", codeHL: [7, 8, 9],
      completedK: new Set(completedK),
    });

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i === j || i === k || j === k) continue;
        const through = dist[i][k] + dist[k][j];
        if (through >= INF) continue;
        const prev = snap();
        const improved = through < dist[i][j];
        if (improved) dist[i][j] = through;

        if (improved) {
          steps.push({
            title: `dist[${i}][${j}]: ${prev[i][j] >= INF ? "âˆž" : prev[i][j]} â†’ ${dist[i][j]}`,
            detail: `dist[${i}][${k}] + dist[${k}][${j}] = ${prev[i][k]} + ${prev[k][j]} = ${through} < ${prev[i][j] >= INF ? "âˆž" : prev[i][j]}. Shorter path found via node ${k}!`,
            dist: snap(), prevDist: prev, k, i, j,
            changed: [i, j], phase: "relax", codeHL: [10, 11],
            completedK: new Set(completedK),
          });
        }
      }
    }
    completedK.add(k);
  }

  steps.push({
    title: "âœ“ Complete â€” All-Pairs Shortest Paths Found",
    detail: `Every dist[i][j] now holds the shortest path from i to j. ${N}Ã—${N} = ${N * N} entries computed.`,
    dist: snap(), prevDist: snap(), k: N, i: -1, j: -1,
    changed: null, phase: "done", codeHL: [13],
    completedK: new Set(completedK),
  });

  return steps;
}

/* â€”â€”â€” Graph SVG â€”â€”â€” */
function GraphView({ step }) {
  const { k, i: ci, j: cj, changed, phase } = step;
  return (
    <svg viewBox="0 0 400 320" className="w-full" style={{ maxHeight: 230 }}>
      {EDGES.map(([u, v, w], idx) => {
        const f = POS[u], t = POS[v];
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx * dx + dy * dy);
        const r = 22;
        const sx = f.x + (dx / len) * r, sy = f.y + (dy / len) * r;
        const ex = t.x - (dx / len) * r, ey = t.y - (dy / len) * r;
        const mx = (sx + ex) / 2 + (dy / len) * 12, my = (sy + ey) / 2 - (dx / len) * 12;
        const isPathEdge = phase === "relax" && changed && (
          (u === ci && v === k) || (u === k && v === cj)
        );
        const color = isPathEdge ? "#10b981" : "#3f3f46";
        return (
          <g key={idx}>
            <defs>
              <marker id={`fw-${idx}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={color} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isPathEdge ? 3 : 1.5} markerEnd={`url(#fw-${idx})`} />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fill={isPathEdge ? "#fbbf24" : "#71717a"} fontSize="11" fontWeight="600" fontFamily="monospace">{w}</text>
          </g>
        );
      })}
      {POS.map((pos, id) => {
        const isK = id === k;
        const isI = id === ci;
        const isJ = id === cj;
        const fill = isK ? "#8b5cf6" : isI ? "#3b82f6" : isJ ? "#f59e0b" : "#27272a";
        const stroke = isK ? "#7c3aed" : isI ? "#2563eb" : isJ ? "#d97706" : "#52525b";
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={20} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="15" fontWeight="700" fontFamily="monospace">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* â€”â€”â€” Python Code (clean function only) â€”â€”â€” */
const CODE = [
  { id: 0,  text: `def floyd_warshall(edges, n):` },
  { id: 1,  text: `    dist = [[float('inf')]*n for _ in range(n)]` },
  { id: 2,  text: `    for i in range(n):` },
  { id: 3,  text: `        dist[i][i] = 0` },
  { id: 4,  text: `    for u, v, w in edges:` },
  { id: 5,  text: `        dist[u][v] = w` },
  { id: 6,  text: `` },
  { id: 7,  text: `    for k in range(n):` },
  { id: 8,  text: `        for i in range(n):` },
  { id: 9,  text: `            for j in range(n):` },
  { id: 10, text: `                if dist[i][k]+dist[k][j] < dist[i][j]:` },
  { id: 11, text: `                    dist[i][j] = dist[i][k]+dist[k][j]` },
  { id: 12, text: `` },
  { id: 13, text: `    return dist` },
];

/* â€”â€”â€” Input / Output Panel with progressive output â€”â€”â€” */
function IOPanel({ step }) {
  const { phase, dist, completedK } = step;
  const done = phase === "done";
  const allMatch = done && EXPECTED_DIST.every((row, i) => row.every((v, j) => dist[i][j] === v));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">n</span> = <span className="text-blue-400">{N}</span></div>
          <div><span className="text-zinc-500">edges</span> = [</div>
          {EDGES.map(([u, v, w], i) => (
            <div key={i} className="pl-4">
              <span className="text-zinc-300">({u}, {v}, {w}){i < EDGES.length - 1 ? "," : ""}</span>
            </div>
          ))}
          <div>]</div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs text-zinc-300" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">dist</span> = [</div>
          {EXPECTED_DIST.map((row, i) => (
            <div key={i} className="pl-4">[{row.join(", ")}]{i < N - 1 ? "," : ""}</div>
          ))}
          <div>]</div>
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          {Array.from({ length: N }).map((_, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <span className="text-zinc-600 w-3 text-right mr-1">{i}</span>
              <span className="text-zinc-600">[</span>
              {Array.from({ length: N }).map((_, j) => {
                const val = dist[i][j];
                const displayVal = val >= INF ? "âˆž" : val;
                const matchesExpected = done && val === EXPECTED_DIST[i][j];
                const isSettled = completedK.size === N;
                return (
                  <span key={j} className="flex items-center">
                    <span className={`w-4 text-center ${
                      matchesExpected ? "text-emerald-300 font-bold" :
                      isSettled ? "text-blue-300" :
                      val !== INF && val !== 0 && i !== j ? "text-zinc-400" :
                      i === j ? "text-zinc-600" :
                      "text-zinc-700"
                    }`}>
                      {i === j ? "0" : val >= INF ? "?" : displayVal}
                    </span>
                    {j < N - 1 && <span className="text-zinc-700">, </span>}
                  </span>
                );
              })}
              <span className="text-zinc-600">]</span>
            </div>
          ))}
        </div>
        {completedK.size > 0 && (
          <div className="mt-2 text-[10px] text-zinc-600">
            Rounds complete: {[...completedK].map(k => (
              <span key={k} className="inline-flex items-center gap-0.5 mr-2">
                <span className="text-purple-400">k={k}</span>
                <span className="text-emerald-600">âœ“</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* â€”â€”â€” Distance Matrix (state panel) â€”â€”â€” */
function DistMatrix({ step }) {
  const { dist, changed, k, phase } = step;
  const isDone = phase === "done";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">dist[][] Matrix</div>
      <div className="overflow-x-auto">
        <table className="font-mono text-sm w-full">
          <thead>
            <tr>
              <th className="w-8 py-1 text-zinc-700 text-xs"></th>
              {Array.from({ length: N }, (_, j) => (
                <th key={j} className={`w-14 py-1 text-center text-xs ${j === step.j ? "text-amber-400" : "text-zinc-500"}`}>{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dist.map((row, i) => (
              <tr key={i}>
                <td className={`py-1 text-center text-xs ${i === step.i ? "text-blue-400" : "text-zinc-500"}`}>{i}</td>
                {row.map((d, j) => {
                  const isCh = changed && changed[0] === i && changed[1] === j;
                  const isK = i === k || j === k;
                  const isDiag = i === j;
                  return (
                    <td key={j} className={`w-14 py-1.5 text-center rounded transition-all ${
                      isCh ? "bg-emerald-950 text-emerald-300 font-bold scale-105" :
                      isDone ? "bg-emerald-950/20 text-emerald-300" :
                      isDiag ? "text-zinc-700" :
                      isK ? "bg-purple-950/30 text-purple-300" :
                      "text-zinc-400"
                    }`}>
                      {d >= INF ? "âˆž" : d}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* â€”â€”â€” Code Panel â€”â€”â€” */
function CodePanel({ highlightLines }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {CODE.map((line, idx) => {
          const hl = highlightLines.includes(line.id);
          return (
            <div
              key={idx}
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

/* â€”â€”â€” Navigation Bar â€”â€”â€” */
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

/* â€”â€”â€” Main Component â€”â€”â€” */
export default function FloydWarshallViz() {
  const steps = useMemo(() => buildSteps(), []);
  const [si, setSi] = useState(0);
  const step = steps[si];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Floyd-Warshall Algorithm</h1>
          <p className="text-zinc-500 text-sm mt-0.5">All-Pairs Shortest Path â€¢ O(VÂ³)</p>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            Floyd-Warshall computes shortest paths between <em>every</em> pair of vertices by progressively considering each node as a potential intermediate waypoint. For each intermediate node k, it checks whether the path iâ†’kâ†’j is shorter than the current best iâ†’j. After considering all k, every cell dist[i][j] holds the true shortest path. Classic use cases include transitive closure, detecting negative cycles, and pre-computing route tables.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-3">
          <NavBar si={si} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 3-COLUMN GRID â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* â€”â€” COL 1: IO + Graph â€”â€” */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{N} nodes, {EDGES.length} edges â€¢ <span className="text-purple-400">Purple = k (via)</span></div>
              <GraphView step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />k (via)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />i (from)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />j (to)</span>
              </div>
            </div>
          </div>

          {/* â€”â€” COL 2: Steps + State â€”â€” */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {si + 1}/{steps.length}</span>
                {step.k >= 0 && step.k < N && <span className="text-[10px] text-purple-400 font-mono font-bold">k={step.k}</span>}
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "relax" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "round" ? "bg-purple-900 text-purple-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Distance Matrix */}
            <DistMatrix step={step} />

            {/* k-round progress */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Intermediate Rounds</div>
              <div className="flex gap-1.5">
                {Array.from({ length: N }).map((_, k) => {
                  const completed = step.completedK.has(k);
                  const active = step.k === k && !completed;
                  return (
                    <div key={k} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">k={k}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        completed ? "bg-emerald-950/30 border-emerald-800 text-emerald-400" :
                        active ? "bg-purple-950/30 border-purple-700 text-purple-300 scale-110" :
                        "bg-zinc-900 border-zinc-700 text-zinc-600"
                      }`}>
                        {completed ? "âœ“" : active ? "â–¶" : "â€”"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* â€”â€” COL 3: Code â€”â€” */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} />
          </div>

        </div>

        {/* â•â•â• BOTTOM ROW: When to Use + Classic Problems â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>All-pairs shortest path â€” need distances between every (i,j)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Dense graphs â€” adjacency matrix representation is natural</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Negative edge weights allowed (unlike Dijkstra)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Transitive closure â€” reachability between all pairs</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(VÂ³)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(VÂ²)</div>
                <div><span className="text-zinc-500 font-semibold">Negative cycle:</span> Detected if dist[i][i] &lt; 0 after run</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 1334 â€” Find the City With Fewest Neighbors at Threshold</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 399 â€” Evaluate Division</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 1462 â€” Course Schedule IV (Transitive Closure)</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 1617 â€” Count Subtrees With Max Distance</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 2976 â€” Min Cost to Convert String I</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 2642 â€” Design Graph With Shortest Path Calculator</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
