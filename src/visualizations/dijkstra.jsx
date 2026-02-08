import { useState, useMemo } from "react";

/* ─── Problem Input ─── */
const NODES = 5;
const EDGES = [[0,1,6],[0,2,2],[2,1,1],[1,3,3],[2,3,5],[3,4,2],[2,4,7]];
const POS = [{x:60,y:150},{x:180,y:50},{x:180,y:250},{x:310,y:150},{x:430,y:150}];
const SOURCE = 0;

/* ─── Expected Output (precomputed) ─── */
const EXPECTED_DIST = [0, 3, 2, 6, 8];
const EXPECTED_PATHS = {
  0: [0],
  1: [0, 2, 1],
  2: [0, 2],
  3: [0, 2, 1, 3],
  4: [0, 2, 1, 3, 4],
};

/* ─── Adjacency list for display ─── */
const ADJ = (() => {
  const g = Array.from({ length: NODES }, () => []);
  for (const [u, v, w] of EDGES) g[u].push([v, w]);
  return g;
})();

/* ─── Build simulation steps ─── */
function buildSteps() {
  const graph = Array.from({ length: NODES }, () => []);
  for (const [u, v, w] of EDGES) graph[u].push([v, w]);

  const dist = new Array(NODES).fill(Infinity);
  dist[SOURCE] = 0;
  const visited = new Set();
  const prev = new Array(NODES).fill(-1);
  const steps = [];
  const finalized = new Set();

  steps.push({
    title: "Initialize — Set Source Distance to 0",
    detail: `dist = [0, ∞, ∞, ∞, ∞]. Push (cost=0, node=0) into the min-heap.`,
    dist: [...dist], prevDist: null, visited: new Set(visited), pq: [[0, SOURCE]],
    current: null, neighbor: null, activeEdge: null, phase: "init", codeHL: [3, 4, 5, 6, 7],
    prev: [...prev], changedNode: null, finalized: new Set(finalized),
  });

  const pq = [[0, SOURCE]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (visited.has(u)) continue;

    finalized.add(u);

    steps.push({
      title: `Pop Node ${u} (dist=${d})`,
      detail: `Heap-pop → (${d}, ${u}). Node ${u} is unvisited, so mark visited and explore its ${graph[u].length} neighbor(s).`,
      dist: [...dist], prevDist: [...dist], visited: new Set(visited), pq: pq.map(x => [...x]),
      current: u, neighbor: null, activeEdge: null, phase: "visit", codeHL: [9, 10, 11, 12, 13],
      prev: [...prev], changedNode: null, finalized: new Set(finalized),
    });

    visited.add(u);

    for (const [v, w] of graph[u]) {
      const newDist = d + w;
      const prevDistSnap = [...dist];
      const improved = newDist < dist[v];

      if (improved) {
        dist[v] = newDist;
        prev[v] = u;
        pq.push([newDist, v]);
      }

      steps.push({
        title: improved
          ? `Relax ${u}→${v}: dist[${v}] = ${prevDistSnap[v] === Infinity ? "∞" : prevDistSnap[v]} → ${newDist}`
          : `Edge ${u}→${v}: No Improvement (${newDist} ≥ ${dist[v]})`,
        detail: improved
          ? `dist[${u}] + w(${u},${v}) = ${d} + ${w} = ${newDist} < ${prevDistSnap[v] === Infinity ? "∞" : prevDistSnap[v]}. Update dist[${v}] = ${newDist}, push (${newDist}, ${v}) to heap.`
          : `dist[${u}] + w(${u},${v}) = ${d} + ${w} = ${newDist} ≥ ${dist[v]}. No update needed.`,
        dist: [...dist], prevDist: prevDistSnap, visited: new Set(visited), pq: pq.map(x => [...x]),
        current: u, neighbor: v, activeEdge: [u, v], phase: improved ? "relax" : "skip",
        codeHL: improved ? [15, 16, 17, 18] : [15, 16],
        prev: [...prev], changedNode: improved ? v : null, finalized: new Set(finalized),
      });
    }
  }

  const paths = {};
  for (let i = 0; i < NODES; i++) {
    const p = [];
    let c = i;
    while (c !== -1) { p.unshift(c); c = prev[c]; }
    paths[i] = p;
  }

  steps.push({
    title: "✓ Complete — All Shortest Paths Found",
    detail: `dist = [${dist.join(", ")}]. Matches expected output.`,
    dist: [...dist], prevDist: [...dist], visited: new Set(visited), pq: [],
    current: null, neighbor: null, activeEdge: null, phase: "done", codeHL: [20],
    prev: [...prev], changedNode: null, paths, finalized: new Set(finalized),
  });

  return steps;
}

/* ─── Graph SVG ─── */
function GraphView({ step }) {
  const { visited, current, neighbor, activeEdge } = step;
  return (
    <svg viewBox="0 0 490 300" className="w-full" style={{ maxHeight: 230 }}>
      {EDGES.map(([u, v, w], i) => {
        const f = POS[u], t = POS[v];
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx * dx + dy * dy);
        const r = 22;
        const sx = f.x + (dx / len) * r, sy = f.y + (dy / len) * r;
        const ex = t.x - (dx / len) * r, ey = t.y - (dy / len) * r;
        const mx = (sx + ex) / 2 + (dy / len) * 12, my = (sy + ey) / 2 - (dx / len) * 12;
        const isActive = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
        const color = isActive
          ? (step.phase === "relax" ? "#10b981" : "#ef4444")
          : visited.has(u) && visited.has(v) ? "#059669" : "#3f3f46";
        return (
          <g key={`e-${i}`}>
            <defs>
              <marker id={`da-${i}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={color} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isActive ? 3 : 1.5} markerEnd={`url(#da-${i})`} />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fill={isActive ? "#fbbf24" : "#71717a"} fontSize="11" fontWeight="600" fontFamily="monospace">{w}</text>
          </g>
        );
      })}
      {POS.map((pos, id) => {
        const isCurr = current === id;
        const isNb = neighbor === id;
        const isVis = visited.has(id);
        const fill = isCurr ? "#3b82f6" : isNb ? "#f59e0b" : isVis ? "#10b981" : "#27272a";
        const stroke = isCurr ? "#2563eb" : isNb ? "#d97706" : isVis ? "#059669" : "#52525b";
        return (
          <g key={`n-${id}`}>
            <circle cx={pos.x} cy={pos.y} r={20} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="15" fontWeight="700" fontFamily="monospace">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Python Code (clean function only) ─── */
const CODE = [
  { id: 0,  text: `import heapq` },
  { id: 1,  text: `` },
  { id: 2,  text: `def dijkstra(graph, src):` },
  { id: 3,  text: `    n = len(graph)` },
  { id: 4,  text: `    dist = [float('inf')] * n` },
  { id: 5,  text: `    dist[src] = 0` },
  { id: 6,  text: `    pq = [(0, src)]` },
  { id: 7,  text: `    visited = set()` },
  { id: 8,  text: `` },
  { id: 9,  text: `    while pq:` },
  { id: 10, text: `        d, u = heapq.heappop(pq)` },
  { id: 11, text: `        if u in visited:` },
  { id: 12, text: `            continue` },
  { id: 13, text: `        visited.add(u)` },
  { id: 14, text: `` },
  { id: 15, text: `        for v, w in graph[u]:` },
  { id: 16, text: `            if d + w < dist[v]:` },
  { id: 17, text: `                dist[v] = d + w` },
  { id: 18, text: `                heapq.heappush(pq, (dist[v], v))` },
  { id: 19, text: `` },
  { id: 20, text: `    return dist` },
];

/* ─── Input / Output Panel with progressive output ─── */
function IOPanel({ step }) {
  const { phase, dist, finalized } = step;
  const done = phase === "done";
  const allMatch = done && EXPECTED_DIST.every((v, i) => dist[i] === v);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">graph</span> = {"{"}</div>
          {ADJ.map((neighbors, node) => (
            <div key={node} className="pl-4">
              <span className="text-zinc-500">{node}:</span>{" "}
              <span className="text-zinc-300">
                [{neighbors.map(([v, w]) => `(${v},${w})`).join(", ")}]
                {node < NODES - 1 ? "," : ""}
              </span>
            </div>
          ))}
          <div>{"}"}</div>
          <div><span className="text-zinc-500">source</span> = <span className="text-blue-400">{SOURCE}</span></div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs">
          <span className="text-zinc-500">dist = </span>
          <span className="text-zinc-300">[{EXPECTED_DIST.join(", ")}]</span>
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-xs flex items-center gap-0.5">
          <span className="text-zinc-500">dist = [</span>
          {Array.from({ length: NODES }).map((_, i) => {
            const isFinal = finalized.has(i);
            const val = dist[i];
            const displayVal = val === Infinity ? "∞" : val;
            const matchesExpected = isFinal && val === EXPECTED_DIST[i];
            return (
              <span key={i} className="flex items-center">
                <span className={
                  matchesExpected ? "text-emerald-300 font-bold" :
                  isFinal ? "text-blue-300" :
                  val !== Infinity ? "text-zinc-400" :
                  "text-zinc-600"
                }>
                  {isFinal ? displayVal : val !== Infinity ? displayVal : "?"}
                </span>
                {i < NODES - 1 && <span className="text-zinc-600">, </span>}
              </span>
            );
          })}
          <span className="text-zinc-500">]</span>
        </div>
        {finalized.size > 0 && (
          <div className="mt-2 space-y-0.5">
            {Object.entries(EXPECTED_PATHS).map(([node, path]) => {
              const n = parseInt(node);
              if (!finalized.has(n)) return null;
              return (
                <div key={node} className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-zinc-600 w-8">{SOURCE}→{node}:</span>
                  <span className="text-emerald-400/80">{path.join("→")}</span>
                  <span className="text-zinc-700">= {dist[n]}</span>
                  {dist[n] === EXPECTED_DIST[n] && <span className="text-emerald-600">✓</span>}
                </div>
              );
            })}
          </div>
        )}
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
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setSi(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === si ? "bg-blue-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`} />
        ))}
      </div>
      <button
        onClick={() => setSi(Math.min(total - 1, si + 1))} disabled={si >= total - 1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >Next →</button>
    </div>
  );
}

/* ─── Main Component ─── */
export default function DijkstraViz() {
  const steps = useMemo(() => buildSteps(), []);
  const [si, setSi] = useState(0);
  const step = steps[si];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Dijkstra's Algorithm</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Shortest Path in Weighted Graphs (Non-Negative Edges)</p>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            Dijkstra's greedily selects the closest unvisited node via a priority queue, then relaxes all its edges. Because edge weights are non-negative, once a node is popped from the queue, its shortest distance is final. This is the foundation for GPS routing, network protocols (OSPF), and game AI pathfinding.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-3">
          <NavBar si={si} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 3-COLUMN GRID ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Graph ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">Source: node {SOURCE} • {NODES}N, {EDGES.length}E</div>
              <GraphView step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Neighbor</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Visited</span>
              </div>
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {si + 1}/{steps.length}</span>
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

            {/* dist[] array */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">dist[]</div>
              <div className="flex gap-1.5">
                {step.dist.map((d, i) => {
                  const changed = step.changedNode === i;
                  const prevVal = step.prevDist ? step.prevDist[i] : null;
                  const val = d === Infinity ? "∞" : d;
                  const isDone = step.phase === "done";
                  const isFinal = step.finalized.has(i);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        changed ? "bg-emerald-950 border-emerald-700 text-emerald-200 scale-110" :
                        isDone ? "bg-emerald-950/30 border-emerald-800 text-emerald-300" :
                        isFinal ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" :
                        d === Infinity ? "bg-zinc-900 border-zinc-700 text-zinc-600" :
                        "bg-zinc-900 border-zinc-700 text-zinc-300"
                      }`}>
                        {changed && prevVal !== null
                          ? <span><span className="text-zinc-600 line-through text-[10px]">{prevVal === Infinity ? "∞" : prevVal}</span> {val}</span>
                          : val}
                      </div>
                      {isFinal && <span className="text-[8px] font-mono text-emerald-700">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PQ & Visited */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Priority Queue</div>
                  <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                    {step.pq.length > 0
                      ? step.pq.sort((a, b) => a[0] - b[0]).map(([d, n], i) => (
                          <span key={i} className="inline-flex items-center px-1.5 h-7 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-[10px]">
                            ({d},{n})
                          </span>
                        ))
                      : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Visited</div>
                  <div className="flex gap-1 min-h-[28px] items-center">
                    {step.visited.size > 0
                      ? [...step.visited].map(n => (
                          <span key={n} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs">{n}</span>
                        ))
                      : <span className="text-[10px] text-zinc-600 italic">none</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Shortest paths (shown at end) */}
            {step.paths && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Shortest Paths from Node {SOURCE}</div>
                <div className="space-y-0.5 font-mono text-[10px]">
                  {Object.entries(step.paths).map(([node, path]) => (
                    <div key={node} className="flex items-center gap-2">
                      <span className="text-zinc-500 w-8">{SOURCE}→{node}:</span>
                      <span className="text-emerald-300">{path.join(" → ")}</span>
                      <span className="text-zinc-600 ml-auto">= {step.dist[node]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} />
          </div>

        </div>

        {/* ═══ BOTTOM ROW: When to Use + Classic Problems ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Shortest path in graphs with non-negative edge weights</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Single-source to all destinations (or early-stop for single target)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Weighted grids — treat cells as nodes, moves as edges</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Network routing, GPS navigation, cost-minimization</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O((V + E) log V) with binary heap</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V)</div>
                <div><span className="text-zinc-500 font-semibold">Won't work:</span> Negative edge weights → use Bellman-Ford</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 743 — Network Delay Time</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 787 — Cheapest Flights Within K Stops</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1631 — Path With Min Effort</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 778 — Swim in Rising Water</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1514 — Path with Max Probability</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 882 — Reachable Nodes in Subdivided Graph</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
