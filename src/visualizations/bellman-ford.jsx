import { useState, useMemo } from "react";

/* ─── Problem Input ─── */
const N = 5, SOURCE = 0;
const EDGES = [[0,1,6],[0,2,2],[2,1,-1],[1,3,3],[2,3,5],[3,4,2]];
const POS = [{x:60,y:150},{x:180,y:50},{x:180,y:250},{x:320,y:150},{x:460,y:150}];

/* ─── Expected Output (precomputed) ─── */
const EXPECTED_DIST = [0, 1, 2, 4, 6];

/* ─── Adjacency list for IO display ─── */
const EDGE_DISPLAY = EDGES.map(([u,v,w]) => `(${u},${v},${w})`).join(", ");

/* ─── Build simulation steps ─── */
function buildSteps() {
  const dist = new Array(N).fill(Infinity);
  dist[SOURCE] = 0;
  const steps = [];
  const relaxedEdges = [];

  steps.push({
    title: "Initialize – Source Distance = 0",
    detail: `dist[${SOURCE}] = 0, all others = ∞. Run V−1 = ${N - 1} rounds of edge relaxation. Each round processes ALL ${EDGES.length} edges.`,
    dist: [...dist], prevDist: null, round: 0, edgeIdx: -1,
    activeEdge: null, changed: null, phase: "init", codeHL: [0, 1, 2],
    totalChanges: 0, relaxedEdges: [...relaxedEdges],
  });

  for (let round = 1; round <= N - 1; round++) {
    let roundChanges = 0;
    steps.push({
      title: `Round ${round} of ${N - 1} – Relax All Edges`,
      detail: `Iterate through all ${EDGES.length} edges and try to improve distances.`,
      dist: [...dist], prevDist: [...dist], round, edgeIdx: -1,
      activeEdge: null, changed: null, phase: "round", codeHL: [4, 5],
      totalChanges: 0, relaxedEdges: [...relaxedEdges],
    });

    for (let e = 0; e < EDGES.length; e++) {
      const [u, v, w] = EDGES[e];
      const prevDist = [...dist];
      const improved = dist[u] !== Infinity && dist[u] + w < dist[v];
      if (improved) {
        dist[v] = dist[u] + w;
        roundChanges++;
        relaxedEdges.push({ round, edge: `${u}→${v}`, from: prevDist[v], to: dist[v] });
      }

      steps.push({
        title: improved
          ? `Edge ${u}→${v} (w=${w}): Relax ${prevDist[v] === Infinity ? "∞" : prevDist[v]} → ${dist[v]}`
          : `Edge ${u}→${v} (w=${w}): No Improvement`,
        detail: improved
          ? `dist[${u}] + w = ${prevDist[u]} + ${w < 0 ? `(${w})` : w} = ${dist[v]} < ${prevDist[v] === Infinity ? "∞" : prevDist[v]}. Update dist[${v}].`
          : dist[u] === Infinity
            ? `dist[${u}] = ∞. Cannot relax — source not yet reachable.`
            : `dist[${u}] + w = ${dist[u]} + ${w < 0 ? `(${w})` : w} = ${dist[u] + w} ≥ ${dist[v]}. No improvement.`,
        dist: [...dist], prevDist, round, edgeIdx: e,
        activeEdge: [u, v], changed: improved ? v : null,
        phase: improved ? "relax" : "skip", codeHL: improved ? [6, 7, 8, 9] : [6, 7],
        totalChanges: roundChanges, relaxedEdges: [...relaxedEdges],
      });
    }

    if (roundChanges === 0) {
      steps.push({
        title: `Round ${round} – No Changes, Early Termination`,
        detail: "No distances improved this round. Algorithm has converged. Remaining rounds would be redundant.",
        dist: [...dist], prevDist: [...dist], round, edgeIdx: -1,
        activeEdge: null, changed: null, phase: "early", codeHL: [10],
        totalChanges: 0, relaxedEdges: [...relaxedEdges],
      });
      break;
    }
  }

  steps.push({
    title: "✓ Complete – Shortest Distances Found",
    detail: `Final distances from node ${SOURCE}: [${dist.join(", ")}]. The negative edge 2→1 (w=−1) gave a shorter path: 0→2→1 (cost 1) vs 0→1 (cost 6).`,
    dist: [...dist], prevDist: [...dist], round: N, edgeIdx: -1,
    activeEdge: null, changed: null, phase: "done", codeHL: [12],
    totalChanges: 0, relaxedEdges: [...relaxedEdges],
  });

  return steps;
}

/* ─── Graph SVG ─── */
function GraphView({ step }) {
  const { activeEdge, dist } = step;
  return (
    <svg viewBox="0 0 520 300" className="w-full" style={{ maxHeight: 230 }}>
      {EDGES.map(([u, v, w], i) => {
        const f = POS[u], t = POS[v];
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx * dx + dy * dy);
        const r = 22;
        const sx = f.x + (dx / len) * r, sy = f.y + (dy / len) * r;
        const ex = t.x - (dx / len) * r, ey = t.y - (dy / len) * r;
        const mx = (sx + ex) / 2 + (dy / len) * 14, my = (sy + ey) / 2 - (dx / len) * 14;
        const isActive = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
        const isNeg = w < 0;
        const color = isActive ? (step.phase === "relax" ? "#10b981" : "#ef4444") : isNeg ? "#f59e0b" : "#3f3f46";
        return (
          <g key={i}>
            <defs>
              <marker id={`ba-${i}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={color} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isActive ? 3 : 1.5}
              markerEnd={`url(#ba-${i})`} strokeDasharray={isNeg && !isActive ? "5,3" : "none"} />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central"
              fill={isActive ? "#fbbf24" : isNeg ? "#f59e0b" : "#71717a"} fontSize="12" fontWeight="700" fontFamily="monospace">{w}</text>
          </g>
        );
      })}
      {POS.map((pos, id) => {
        const d = dist[id];
        const isActive = activeEdge && (activeEdge[0] === id || activeEdge[1] === id);
        const fill = id === SOURCE ? "#8b5cf6" : isActive ? "#3b82f6" : d !== Infinity ? "#10b981" : "#27272a";
        const stroke = id === SOURCE ? "#7c3aed" : isActive ? "#2563eb" : d !== Infinity ? "#059669" : "#52525b";
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={20} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="15" fontWeight="700" fontFamily="monospace">{id}</text>
            <text x={pos.x} y={pos.y - 30} textAnchor="middle" fill={d === Infinity ? "#52525b" : "#a1a1aa"} fontSize="11" fontFamily="monospace">{d === Infinity ? "∞" : d}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Python Code ─── */
const CODE = [
  { id: 0,  text: `def bellman_ford(n, edges, src):` },
  { id: 1,  text: `    dist = [float('inf')] * n` },
  { id: 2,  text: `    dist[src] = 0` },
  { id: 3,  text: `` },
  { id: 4,  text: `    for _ in range(n - 1):` },
  { id: 5,  text: `        changed = False` },
  { id: 6,  text: `        for u, v, w in edges:` },
  { id: 7,  text: `            if dist[u] + w < dist[v]:` },
  { id: 8,  text: `                dist[v] = dist[u] + w` },
  { id: 9,  text: `                changed = True` },
  { id: 10, text: `        if not changed: break` },
  { id: 11, text: `` },
  { id: 12, text: `    return dist` },
];

/* ─── Input / Output Panel ─── */
function IOPanel({ step }) {
  const { phase, dist, relaxedEdges } = step;
  const done = phase === "done";
  const allMatch = done && EXPECTED_DIST.every((v, i) => dist[i] === v);

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
              <span className={w < 0 ? "text-amber-300" : "text-zinc-300"}>
                ({u}, {v}, {w}){i < EDGES.length - 1 ? "," : ""}
              </span>
            </div>
          ))}
          <div>]</div>
          <div><span className="text-zinc-500">src</span> = <span className="text-blue-400">{SOURCE}</span></div>
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
          {Array.from({ length: N }).map((_, i) => {
            const val = dist[i];
            const displayVal = val === Infinity ? "∞" : val;
            const matchesExpected = done && val === EXPECTED_DIST[i];
            return (
              <span key={i} className="flex items-center">
                <span className={
                  matchesExpected ? "text-emerald-300 font-bold" :
                  val !== Infinity ? "text-zinc-300" :
                  "text-zinc-600"
                }>
                  {val !== Infinity ? displayVal : "?"}
                </span>
                {i < N - 1 && <span className="text-zinc-600">, </span>}
              </span>
            );
          })}
          <span className="text-zinc-500">]</span>
        </div>
        {relaxedEdges.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {relaxedEdges.slice(-6).map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <span className="text-zinc-600 font-mono">R{r.round}</span>
                <span className="text-emerald-400/80">{r.edge}</span>
                <span className="text-zinc-700">{r.from === Infinity ? "∞" : r.from}→{r.to}</span>
                <span className="text-emerald-600">✓</span>
              </div>
            ))}
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
export default function BellmanFordViz() {
  const steps = useMemo(() => buildSteps(), []);
  const [si, setSi] = useState(0);
  const step = steps[si];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Bellman-Ford Algorithm</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Shortest Path with Negative Edges • V−1 Relaxation Rounds</p>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            Bellman-Ford relaxes <strong className="text-zinc-300">every edge</strong> in <strong className="text-zinc-300">V−1 rounds</strong>. Unlike Dijkstra, it handles <strong className="text-amber-400">negative edge weights</strong> because it doesn't greedily finalize distances — each round propagates improvements one hop further. A V-th round detecting further improvement means a <strong className="text-zinc-300">negative cycle</strong>. Edge 2→1 (w=<span className="text-amber-400 font-mono">−1</span>) is dashed to highlight the negative weight.
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
              <div className="text-[10px] text-zinc-500 mb-1">Source: node {SOURCE} • {N}N, {EDGES.length}E • dashed = negative</div>
              <GraphView step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Source</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Active</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Reached</span>
              </div>
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {si + 1}/{steps.length}</span>
                {step.round > 0 && step.round <= N - 1 && <span className="text-[10px] text-zinc-600 font-mono">Round {step.round}/{N - 1}</span>}
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "relax" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "skip" ? "bg-red-900 text-red-300" :
                  step.phase === "round" ? "bg-blue-900 text-blue-300" :
                  step.phase === "early" ? "bg-amber-900 text-amber-300" :
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
                  const changed = step.changed === i;
                  const prevVal = step.prevDist ? step.prevDist[i] : null;
                  const val = d === Infinity ? "∞" : d;
                  const isDone = step.phase === "done";
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        changed ? "bg-emerald-950 border-emerald-700 text-emerald-200 scale-110" :
                        isDone ? "bg-emerald-950/30 border-emerald-800 text-emerald-300" :
                        d === Infinity ? "bg-zinc-900 border-zinc-700 text-zinc-600" :
                        "bg-zinc-900 border-zinc-700 text-zinc-300"
                      }`}>
                        {changed && prevVal !== null
                          ? <span><span className="text-zinc-600 line-through text-[10px]">{prevVal === Infinity ? "∞" : prevVal}</span> {val}</span>
                          : val}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Edge List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Edge List (processed in order)</div>
              <div className="space-y-0.5">
                {EDGES.map(([u, v, w], i) => {
                  const isActive = step.edgeIdx === i;
                  return (
                    <div key={i} className={`flex items-center gap-2 px-2 py-0.5 rounded-lg font-mono text-xs ${
                      isActive ? "bg-blue-950/50 border border-blue-800" : "border border-transparent"
                    }`}>
                      <span className={isActive ? "text-blue-400" : "text-zinc-500"}>{u} → {v}</span>
                      <span className={`px-1 rounded ${w < 0 ? "text-amber-400" : "text-zinc-500"}`}>w={w}</span>
                      {isActive && <span className="text-blue-500 text-[10px] ml-auto">◀ current</span>}
                    </div>
                  );
                })}
              </div>
            </div>
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
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Shortest path with negative edge weights</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Detecting negative cycles (run V-th round)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>When Dijkstra isn't applicable (negative weights present)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Arbitrage detection in currency exchange graphs</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V × E)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V)</div>
                <div><span className="text-zinc-500 font-semibold">vs Dijkstra:</span> Slower but handles negative edges</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 787 — Cheapest Flights Within K Stops</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 743 — Network Delay Time</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1334 — Find the City With Smallest Neighbors</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1514 — Path with Maximum Probability</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1368 — Min Cost to Make Valid Path</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 2307 — Check for Contradictions in Equations</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
