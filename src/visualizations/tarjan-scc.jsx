import { useState, useMemo } from "react";

/* ——— Problem Input ——— */
const N = 7;
const EDGES = [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3],[5,6]];
const POS = [{x:80,y:60},{x:200,y:60},{x:140,y:170},{x:300,y:170},{x:420,y:100},{x:420,y:240},{x:540,y:170}];

/* ——— Adjacency list for display ——— */
const ADJ = (() => {
  const g = Array.from({ length: N }, () => []);
  for (const [u, v] of EDGES) g[u].push(v);
  return g;
})();

/* ——— Expected Output (precomputed) ——— */
const EXPECTED_SCCS = [[2, 1, 0], [5, 4, 3], [6]];

/* ——— SCC colors ——— */
const SCC_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

/* ——— Build simulation steps ——— */
function buildSteps() {
  const adj = Array.from({ length: N }, () => []);
  for (const [u, v] of EDGES) adj[u].push(v);

  const disc = new Array(N).fill(-1);
  const low = new Array(N).fill(-1);
  const onStack = new Array(N).fill(false);
  const stack = [];
  const sccs = [];
  let timer = 0;
  const steps = [];
  const finalized = new Set(); // nodes assigned to an SCC

  steps.push({
    title: "Initialize — All Nodes Undiscovered",
    detail: `${N} nodes, ${EDGES.length} directed edges. DFS from node 0. Track disc[] (discovery time) and low[] (lowest reachable disc via back edges).`,
    disc: [...disc], low: [...low], stack: [...stack], onStack: [...onStack],
    sccs: sccs.map(s => [...s]),
    current: null, neighbor: null, activeEdge: null,
    phase: "init", codeHL: [0, 1, 2], sccFound: null,
    finalized: new Set(finalized),
  });

  function dfs(u) {
    disc[u] = low[u] = timer++;
    stack.push(u);
    onStack[u] = true;

    steps.push({
      title: `Discover Node ${u} — disc[${u}]=${disc[u]}, low[${u}]=${low[u]}`,
      detail: `Push ${u} onto stack. Set disc[${u}] = low[${u}] = ${disc[u]}. Stack: [${stack.join(", ")}].`,
      disc: [...disc], low: [...low], stack: [...stack], onStack: [...onStack],
      sccs: sccs.map(s => [...s]),
      current: u, neighbor: null, activeEdge: null,
      phase: "discover", codeHL: [4, 5, 6], sccFound: null,
      finalized: new Set(finalized),
    });

    for (const v of adj[u]) {
      if (disc[v] === -1) {
        steps.push({
          title: `Edge ${u}→${v} — Tree Edge (Unvisited)`,
          detail: `Node ${v} not yet discovered. Recurse into DFS(${v}).`,
          disc: [...disc], low: [...low], stack: [...stack], onStack: [...onStack],
          sccs: sccs.map(s => [...s]),
          current: u, neighbor: v, activeEdge: [u, v],
          phase: "tree", codeHL: [8, 9, 10], sccFound: null,
          finalized: new Set(finalized),
        });
        dfs(v);
        const prevLow = low[u];
        low[u] = Math.min(low[u], low[v]);
        if (low[u] !== prevLow) {
          steps.push({
            title: `Back from ${v}: low[${u}] = min(${prevLow}, low[${v}]=${low[v]}) = ${low[u]}`,
            detail: `After DFS(${v}), update low[${u}]. If ${v}'s subtree can reach something earlier, so can ${u}.`,
            disc: [...disc], low: [...low], stack: [...stack], onStack: [...onStack],
            sccs: sccs.map(s => [...s]),
            current: u, neighbor: v, activeEdge: null,
            phase: "update", codeHL: [11], sccFound: null,
            finalized: new Set(finalized),
          });
        }
      } else if (onStack[v]) {
        const prevLow = low[u];
        low[u] = Math.min(low[u], disc[v]);
        steps.push({
          title: `Edge ${u}→${v} — Back Edge (On Stack)`,
          detail: `Node ${v} is on stack — part of current path. low[${u}] = min(${prevLow}, disc[${v}]=${disc[v]}) = ${low[u]}. This back edge reveals a cycle!`,
          disc: [...disc], low: [...low], stack: [...stack], onStack: [...onStack],
          sccs: sccs.map(s => [...s]),
          current: u, neighbor: v, activeEdge: [u, v],
          phase: "back", codeHL: [12, 13], sccFound: null,
          finalized: new Set(finalized),
        });
      } else {
        steps.push({
          title: `Edge ${u}→${v} — Cross Edge (Already Processed)`,
          detail: `Node ${v} already processed and not on stack. Belongs to a different SCC. Ignore.`,
          disc: [...disc], low: [...low], stack: [...stack], onStack: [...onStack],
          sccs: sccs.map(s => [...s]),
          current: u, neighbor: v, activeEdge: [u, v],
          phase: "cross", codeHL: [14], sccFound: null,
          finalized: new Set(finalized),
        });
      }
    }

    if (disc[u] === low[u]) {
      const scc = [];
      while (true) {
        const w = stack.pop();
        onStack[w] = false;
        scc.push(w);
        finalized.add(w);
        if (w === u) break;
      }
      sccs.push(scc);
      steps.push({
        title: `SCC Found! disc[${u}] == low[${u}] == ${disc[u]}`,
        detail: `Node ${u} is an SCC root. Pop stack until ${u}: {${scc.join(", ")}}. This is strongly connected component #${sccs.length}.`,
        disc: [...disc], low: [...low], stack: [...stack], onStack: [...onStack],
        sccs: sccs.map(s => [...s]),
        current: u, neighbor: null, activeEdge: null,
        phase: "scc", codeHL: [16, 17], sccFound: scc,
        finalized: new Set(finalized),
      });
    }
  }

  for (let i = 0; i < N; i++) { if (disc[i] === -1) dfs(i); }

  steps.push({
    title: `✓ Complete — ${sccs.length} SCCs Found`,
    detail: `Strongly connected components: ${sccs.map((s, i) => `SCC${i + 1}{${s.join(",")}}`).join(", ")}.`,
    disc: [...disc], low: [...low], stack: [], onStack: [...onStack],
    sccs: sccs.map(s => [...s]),
    current: null, neighbor: null, activeEdge: null,
    phase: "done", codeHL: [19], sccFound: null,
    finalized: new Set(finalized),
  });

  return steps;
}

/* ——— Graph SVG ——— */
function GraphView({ step }) {
  const { current, neighbor, activeEdge, sccs, disc } = step;
  const nodeToSCC = {};
  sccs.forEach((scc, i) => scc.forEach(n => { nodeToSCC[n] = i; }));

  return (
    <svg viewBox="0 0 600 280" className="w-full" style={{ maxHeight: 230 }}>
      {EDGES.map(([u, v], i) => {
        const f = POS[u], t = POS[v];
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx * dx + dy * dy);
        const r = 20;
        const sx = f.x + (dx / len) * r, sy = f.y + (dy / len) * r;
        const ex = t.x - (dx / len) * r, ey = t.y - (dy / len) * r;
        const isActive = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
        const color = isActive
          ? (step.phase === "back" ? "#f59e0b" : step.phase === "cross" ? "#ef4444" : "#3b82f6")
          : "#3f3f46";
        return (
          <g key={i}>
            <defs>
              <marker id={`ta-${i}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={color} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isActive ? 3 : 1.5} markerEnd={`url(#ta-${i})`} />
          </g>
        );
      })}
      {POS.map((pos, id) => {
        const isCurr = current === id;
        const isNb = neighbor === id;
        const sccIdx = nodeToSCC[id];
        const hasSCC = sccIdx !== undefined;
        const fill = isCurr ? "#3b82f6" : isNb ? "#f59e0b" : hasSCC ? SCC_COLORS[sccIdx % SCC_COLORS.length] : disc[id] >= 0 ? "#27272a" : "#18181b";
        const stroke = isCurr ? "#2563eb" : isNb ? "#d97706" : hasSCC ? SCC_COLORS[sccIdx % SCC_COLORS.length] : "#52525b";
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={18} fill={fill} stroke={stroke} strokeWidth={2.5} opacity={disc[id] === -1 ? 0.4 : 1} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="14" fontWeight="700" fontFamily="monospace">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ——— Python Code (clean function only) ——— */
const CODE = [
  { id: 0,  text: `def tarjan_scc(adj, n):` },
  { id: 1,  text: `    disc = [-1]*n; low = [-1]*n` },
  { id: 2,  text: `    stack = []; on_stack = [False]*n` },
  { id: 3,  text: `    timer = [0]; sccs = []` },
  { id: 4,  text: `    def dfs(u):` },
  { id: 5,  text: `        disc[u] = low[u] = timer[0]` },
  { id: 6,  text: `        timer[0] += 1` },
  { id: 7,  text: `        stack.append(u); on_stack[u] = True` },
  { id: 8,  text: `        for v in adj[u]:` },
  { id: 9,  text: `            if disc[v] == -1:` },
  { id: 10, text: `                dfs(v)` },
  { id: 11, text: `                low[u] = min(low[u], low[v])` },
  { id: 12, text: `            elif on_stack[v]:` },
  { id: 13, text: `                low[u] = min(low[u], disc[v])` },
  { id: 14, text: `            # else: cross edge, ignore` },
  { id: 15, text: `` },
  { id: 16, text: `        if disc[u] == low[u]:` },
  { id: 17, text: `            scc = pop stack until u` },
  { id: 18, text: `` },
  { id: 19, text: `    return sccs` },
];

/* ——— Input / Output Panel with progressive output ——— */
function IOPanel({ step }) {
  const { phase, sccs, finalized } = step;
  const done = phase === "done";
  const allMatch = done && sccs.length === EXPECTED_SCCS.length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">adj</span> = {"{"}</div>
          {ADJ.map((neighbors, node) => (
            <div key={node} className="pl-4">
              <span className="text-zinc-500">{node}:</span>{" "}
              <span className="text-zinc-300">
                [{neighbors.join(", ")}]
                {node < N - 1 ? "," : ""}
              </span>
            </div>
          ))}
          <div>{"}"}</div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs">
          <span className="text-zinc-500">sccs = </span>
          <span className="text-zinc-300">[{EXPECTED_SCCS.map(s => `{${s.join(",")}}`).join(", ")}]</span>
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-xs">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-zinc-500">sccs = [</span>
            {sccs.length === 0
              ? <span className="text-zinc-700">...</span>
              : sccs.map((scc, i) => (
                  <span key={i} className="flex items-center">
                    <span style={{ color: SCC_COLORS[i % SCC_COLORS.length] }} className="font-bold">
                      {"{" + scc.join(",") + "}"}
                    </span>
                    {i < sccs.length - 1 && <span className="text-zinc-600">, </span>}
                  </span>
                ))
            }
            <span className="text-zinc-500">]</span>
          </div>
        </div>
        {finalized.size > 0 && (
          <div className="mt-2 text-[10px] text-zinc-600">
            Nodes assigned: {[...finalized].sort((a, b) => a - b).map(n => (
              <span key={n} className="text-emerald-600 mr-1">{n} ✓</span>
            ))}
            <span className="ml-1 text-zinc-700">({finalized.size}/{N})</span>
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

/* ——— Main Component ——— */
export default function TarjanViz() {
  const steps = useMemo(() => buildSteps(), []);
  const [si, setSi] = useState(0);
  const step = steps[si];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Tarjan's SCC Algorithm</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Strongly Connected Components • Single DFS Pass</p>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            Tarjan's finds all strongly connected components in a single DFS pass. Each node tracks its discovery time (disc) and the lowest disc reachable through back edges (low). When a node's disc equals its low, it's the root of an SCC — pop the stack to extract the component. Back edges reveal cycles; cross edges to already-processed nodes are ignored. Used in compiler optimization, 2-SAT, and dependency analysis.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-3">
          <NavBar si={si} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 3-COLUMN GRID ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* —— COL 1: IO + Graph —— */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{N} nodes, {EDGES.length} edges • directed</div>
              <GraphView step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Neighbor</span>
              </div>
            </div>
          </div>

          {/* —— COL 2: Steps + State —— */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "scc" ? "bg-purple-950/30 border-purple-900" :
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {si + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "scc" ? "bg-purple-900 text-purple-300" :
                  step.phase === "back" ? "bg-amber-900 text-amber-300" :
                  step.phase === "discover" ? "bg-blue-900 text-blue-300" :
                  step.phase === "tree" ? "bg-blue-900 text-blue-300" :
                  step.phase === "update" ? "bg-cyan-900 text-cyan-300" :
                  step.phase === "cross" ? "bg-red-900 text-red-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* disc[] and low[] */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">disc[]</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {step.disc.map((d, i) => {
                      const isDone = step.phase === "done";
                      const isFinal = step.finalized.has(i);
                      return (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                          <div className={`w-9 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                            isDone ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" :
                            isFinal ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" :
                            d === -1 ? "bg-zinc-900 border-zinc-800 text-zinc-700" :
                            step.current === i ? "bg-blue-950 border-blue-700 text-blue-300" :
                            "bg-zinc-900 border-zinc-700 text-zinc-300"
                          }`}>{d === -1 ? "—" : d}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">low[]</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {step.low.map((l, i) => {
                      const isDone = step.phase === "done";
                      const isFinal = step.finalized.has(i);
                      const isLowered = l !== -1 && l < step.disc[i];
                      return (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                          <div className={`w-9 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                            isDone ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" :
                            isFinal ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" :
                            l === -1 ? "bg-zinc-900 border-zinc-800 text-zinc-700" :
                            isLowered ? "bg-amber-950 border-amber-800 text-amber-300" :
                            step.current === i ? "bg-blue-950 border-blue-700 text-blue-300" :
                            "bg-zinc-900 border-zinc-700 text-zinc-300"
                          }`}>{l === -1 ? "—" : l}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Stack & SCCs Found */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Stack</div>
                  <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                    {step.stack.length > 0
                      ? step.stack.map((n, i) => (
                          <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-purple-950 border border-purple-800 text-purple-300 font-mono font-bold text-xs">{n}</span>
                        ))
                      : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">SCCs Found</div>
                  <div className="flex gap-2 min-h-[28px] items-center flex-wrap">
                    {step.sccs.length > 0
                      ? step.sccs.map((scc, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 h-7 rounded-md font-mono font-bold text-xs"
                            style={{
                              backgroundColor: SCC_COLORS[i % SCC_COLORS.length] + "20",
                              border: `1px solid ${SCC_COLORS[i % SCC_COLORS.length]}`,
                              color: SCC_COLORS[i % SCC_COLORS.length],
                            }}>
                            {"{" + scc.join(",") + "}"}
                          </span>
                        ))
                      : <span className="text-[10px] text-zinc-600 italic">none yet</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* —— COL 3: Code —— */}
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
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Find all strongly connected components in a directed graph</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Single DFS pass — more efficient than Kosaraju (no transpose)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>2-SAT solving — implication graph SCC condensation</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Dependency cycles, compiler dead-code detection, circuit analysis</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V + E)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V) for disc, low, stack</div>
                <div><span className="text-zinc-500 font-semibold">Alternative:</span> Kosaraju's (two DFS passes + transpose)</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1192 — Critical Connections in a Network</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 332 — Reconstruct Itinerary</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 207 — Course Schedule (cycle detection)</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 802 — Find Eventual Safe States</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1568 — Min Days to Disconnect Island</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 2360 — Longest Cycle in a Graph</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
