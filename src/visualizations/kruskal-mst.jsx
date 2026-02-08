import { useState, useMemo } from "react";

/* ——— Problem Input ——— */
const N = 6;
const EDGES = [[1,2,1],[1,3,2],[0,2,3],[0,1,4],[2,3,4],[2,4,5],[3,5,6],[3,4,7],[4,5,8]];
const POS = [{x:60,y:80},{x:200,y:40},{x:200,y:180},{x:340,y:80},{x:340,y:220},{x:480,y:150}];

/* ——— Expected Output (precomputed) ——— */
const EXPECTED_MST = [[1,2,1],[1,3,2],[0,2,3],[2,4,5],[3,5,6]];
const EXPECTED_COST = 17;

/* ——— Build simulation steps ——— */
function buildSteps() {
  const sorted = [...EDGES].sort((a, b) => a[2] - b[2]);
  const parent = Array.from({ length: N }, (_, i) => i);
  const rank = new Array(N).fill(0);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };

  const steps = [];
  const mstEdges = [];
  let mstCost = 0;
  const finalized = new Set();

  steps.push({
    title: "Initialize — Sort Edges by Weight",
    detail: `${EDGES.length} edges sorted ascending: [${sorted.map(([u,v,w]) => `(${u}-${v}:${w})`).join(", ")}]. Initialize Union-Find with ${N} singleton components.`,
    parent: [...parent], rank: [...rank], mstEdges: [], edgeIdx: -1, currentEdge: null,
    phase: "init", codeHL: [0, 1, 2], mstCost: 0, sortedEdges: sorted, verdict: null,
    finalized: new Set(finalized),
  });

  for (let i = 0; i < sorted.length; i++) {
    const [u, v, w] = sorted[i];
    const ru = find(u), rv = find(v);
    const sameSet = ru === rv;

    if (!sameSet) {
      if (rank[ru] < rank[rv]) parent[ru] = rv;
      else if (rank[ru] > rank[rv]) parent[rv] = ru;
      else { parent[rv] = ru; rank[ru]++; }
      mstEdges.push([u, v, w]);
      mstCost += w;
      finalized.add(`${Math.min(u,v)}-${Math.max(u,v)}`);
    }

    steps.push({
      title: sameSet
        ? `Edge ${u}–${v} (w=${w}) — Skip (Cycle)`
        : `Edge ${u}–${v} (w=${w}) — Add to MST`,
      detail: sameSet
        ? `find(${u})=${ru}, find(${v})=${rv}. Same component — adding would create a cycle. Skip.`
        : `find(${u})=${ru}, find(${v})=${rv}. Different components — union them. MST cost so far: ${mstCost}.`,
      parent: [...parent], rank: [...rank], mstEdges: [...mstEdges], edgeIdx: i,
      currentEdge: [u, v, w],
      phase: sameSet ? "skip" : "add",
      codeHL: sameSet ? [4, 5] : [4, 5, 6, 7, 8],
      mstCost, sortedEdges: sorted,
      verdict: sameSet ? "cycle" : "added",
      finalized: new Set(finalized),
    });

    if (mstEdges.length === N - 1) {
      steps.push({
        title: `✓ MST Complete — ${N - 1} Edges, Cost ${mstCost}`,
        detail: `Found ${N - 1} edges connecting all ${N} nodes. MST: [${mstEdges.map(([a,b,c]) => `${a}-${b}:${c}`).join(", ")}]. Total weight: ${mstCost}.`,
        parent: [...parent], rank: [...rank], mstEdges: [...mstEdges], edgeIdx: i,
        currentEdge: null,
        phase: "done", codeHL: [10], mstCost, sortedEdges: sorted, verdict: null,
        finalized: new Set(finalized),
      });
      break;
    }
  }
  return steps;
}

/* ——— Graph SVG ——— */
function GraphView({ step }) {
  const { mstEdges, currentEdge, verdict } = step;
  const mstSet = new Set(mstEdges.map(([u, v]) => `${Math.min(u, v)}-${Math.max(u, v)}`));
  return (
    <svg viewBox="0 0 540 260" className="w-full" style={{ maxHeight: 230 }}>
      {EDGES.map(([u, v, w], i) => {
        const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
        const isMST = mstSet.has(key);
        const isCurrent = currentEdge && ((currentEdge[0] === u && currentEdge[1] === v) || (currentEdge[0] === v && currentEdge[1] === u));
        const f = POS[u], t = POS[v];
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx * dx + dy * dy);
        const r = 20;
        const sx = f.x + (dx / len) * r, sy = f.y + (dy / len) * r;
        const ex = t.x - (dx / len) * r, ey = t.y - (dy / len) * r;
        const mx = (sx + ex) / 2 + (dy / len) * 12, my = (sy + ey) / 2 - (dx / len) * 12;
        const color = isCurrent
          ? (verdict === "added" ? "#10b981" : "#ef4444")
          : isMST ? "#10b981" : "#3f3f46";
        return (
          <g key={i}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isMST || isCurrent ? 3 : 1.5} />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fill={isMST || isCurrent ? "#a7f3d0" : "#71717a"} fontSize="11" fontWeight="600" fontFamily="monospace">{w}</text>
          </g>
        );
      })}
      {POS.map((pos, id) => {
        const inMST = mstEdges.some(([u, v]) => u === id || v === id);
        const isCurrNode = currentEdge && (currentEdge[0] === id || currentEdge[1] === id);
        const fill = isCurrNode ? (verdict === "added" ? "#059669" : "#dc2626") : inMST ? "#27272a" : "#27272a";
        const stroke = isCurrNode ? (verdict === "added" ? "#10b981" : "#ef4444") : inMST ? "#10b981" : "#52525b";
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={18} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="14" fontWeight="700" fontFamily="monospace">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ——— Python Code (clean function only) ——— */
const CODE = [
  { id: 0,  text: `def kruskal(edges, n):` },
  { id: 1,  text: `    edges.sort(key=lambda e: e[2])` },
  { id: 2,  text: `    uf = UnionFind(n)` },
  { id: 3,  text: `    mst = []` },
  { id: 4,  text: `    for u, v, w in edges:` },
  { id: 5,  text: `        if uf.find(u) != uf.find(v):` },
  { id: 6,  text: `            uf.union(u, v)` },
  { id: 7,  text: `            mst.append((u, v, w))` },
  { id: 8,  text: `        if len(mst) == n - 1:` },
  { id: 9,  text: `            break` },
  { id: 10, text: `    return mst` },
];

/* ——— Input / Output Panel with progressive output ——— */
function IOPanel({ step }) {
  const { phase, mstEdges, mstCost, finalized } = step;
  const done = phase === "done";
  const allMatch = done && mstCost === EXPECTED_COST && mstEdges.length === EXPECTED_MST.length;

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
        <div className="font-mono text-xs">
          <div><span className="text-zinc-500">mst</span> = <span className="text-zinc-300">[{EXPECTED_MST.map(([u,v,w]) => `(${u},${v},${w})`).join(", ")}]</span></div>
          <div><span className="text-zinc-500">cost</span> = <span className="text-zinc-300">{EXPECTED_COST}</span></div>
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-xs">
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">mst = [</span>
            {mstEdges.length === 0
              ? <span className="text-zinc-700">...</span>
              : mstEdges.map(([u, v, w], i) => {
                  const key = `${Math.min(u,v)}-${Math.max(u,v)}`;
                  const isFinal = finalized.has(key);
                  const matchesExpected = done && EXPECTED_MST.some(([eu,ev,ew]) => eu === u && ev === v && ew === w);
                  return (
                    <span key={i} className="flex items-center">
                      <span className={
                        matchesExpected ? "text-emerald-300 font-bold" :
                        isFinal ? "text-emerald-400" :
                        "text-zinc-400"
                      }>
                        ({u},{v},{w})
                      </span>
                      {i < mstEdges.length - 1 && <span className="text-zinc-600">, </span>}
                    </span>
                  );
                })
            }
            <span className="text-zinc-500">]</span>
          </div>
          <div className="mt-1">
            <span className="text-zinc-500">cost = </span>
            <span className={done ? "text-emerald-300 font-bold" : mstCost > 0 ? "text-zinc-400" : "text-zinc-700"}>
              {mstCost > 0 ? mstCost : "?"}
            </span>
            {done && mstCost === EXPECTED_COST && <span className="text-emerald-600 ml-1 text-[10px]">✓</span>}
          </div>
        </div>
        {mstEdges.length > 0 && (
          <div className="mt-2 text-[10px] text-zinc-600">
            Edges: {mstEdges.length}/{N - 1}
            <span className="ml-2">
              {mstEdges.map(([u,v], i) => (
                <span key={i} className="text-emerald-600 mr-1">{u}–{v} ✓</span>
              ))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— Code Panel ——— */
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

/* ——— Navigation Bar ——— */
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
      >Next →</button>
    </div>
  );
}

/* ——— Main Component ——— */
export default function KruskalViz() {
  const steps = useMemo(() => buildSteps(), []);
  const [si, setSi] = useState(0);
  const step = steps[si];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Kruskal's Algorithm</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Minimum Spanning Tree • Greedy + Union-Find</p>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            Kruskal's builds a minimum spanning tree by greedily processing edges in ascending weight order. For each edge, if its two endpoints belong to different components (checked via Union-Find), add it to the MST and merge the components. Skip it if it would create a cycle. Stop once N−1 edges are selected. Classic for network design, clustering, and approximation algorithms.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-3">
          <NavBar si={si} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 3-COLUMN GRID â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* —— COL 1: IO + Graph —— */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{N} nodes, {EDGES.length} edges • <span className="text-emerald-400">Green = MST</span></div>
              <GraphView step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />MST edge</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Cycle (skip)</span>
              </div>
            </div>
          </div>

          {/* —— COL 2: Steps + State —— */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {si + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "add" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "skip" ? "bg-red-900 text-red-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
                <span className="text-xs text-zinc-600 font-mono ml-auto">cost: {step.mstCost}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Sorted edges queue */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Sorted Edges (greedy order)</div>
              <div className="space-y-0.5">
                {step.sortedEdges.map(([u, v, w], i) => {
                  const isCurrent = step.edgeIdx === i;
                  const isPast = i < step.edgeIdx || (i === step.edgeIdx && step.phase === "done");
                  const wasMST = step.mstEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
                  const isFuture = i > step.edgeIdx;
                  return (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-xs ${
                      isCurrent ? "bg-blue-950/50 border border-blue-800" : "border border-transparent"}`}>
                      <span className={`w-14 ${
                        isCurrent ? "text-blue-300" :
                        isPast ? (wasMST ? "text-emerald-500" : "text-zinc-700") :
                        "text-zinc-500"
                      }`}>{u}–{v}</span>
                      <span className={isCurrent ? "text-blue-300" : isPast ? "text-zinc-700" : "text-zinc-600"}>w={w}</span>
                      {isPast && <span className={`text-[10px] ml-auto ${wasMST ? "text-emerald-600" : "text-red-900"}`}>{wasMST ? "✓ added" : "✗ cycle"}</span>}
                      {isCurrent && <span className="text-blue-500 text-[10px] ml-auto">◀ current</span>}
                      {isFuture && step.phase === "done" && <span className="text-zinc-800 text-[10px] ml-auto">—</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* parent[] Union-Find */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">parent[] (Union-Find)</div>
              <div className="flex gap-1.5">
                {step.parent.map((p, i) => {
                  const isRoot = p === i;
                  const isDone = step.phase === "done";
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        isDone ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" :
                        isRoot ? "bg-purple-950 border-purple-800 text-purple-300" :
                        "bg-zinc-900 border-zinc-700 text-zinc-300"
                      }`}>{p}</div>
                      {isRoot && !isDone && <span className="text-[8px] font-mono text-purple-700">root</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* —— COL 3: Code —— */}
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
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Minimum spanning tree — connect all nodes with minimum total weight</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Sparse graphs — edge-centric approach, sort E edges then process</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Clustering — stop early at N−k edges for k clusters</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Network design, cable laying, road construction cost minimization</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(E log E) — dominated by sorting</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V) for Union-Find</div>
                <div><span className="text-zinc-500 font-semibold">Alternative:</span> Prim's for dense graphs (adjacency matrix)</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1584 — Min Cost to Connect All Points</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1135 — Connecting Cities With Min Cost</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1489 — Find Critical and Pseudo-Critical Edges</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1631 — Path With Minimum Effort</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1168 — Optimize Water Distribution</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1579 — Remove Max Number of Edges</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
