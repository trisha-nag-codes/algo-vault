import { useState, useMemo } from "react";

/* ——— Problem Inputs (two examples) ——— */
const EXAMPLES = {
  circuit: {
    title: "Euler Circuit", n: 5,
    edges: [[0,1],[1,2],[2,0],[0,3],[3,4],[4,0]],
    positions: [{x:200,y:50},{x:340,y:130},{x:280,y:270},{x:120,y:270},{x:60,y:130}],
    desc: "All in-degree = out-degree → circuit (starts and ends at same node)",
    start: 0,
    expectedPath: [0, 1, 2, 0, 3, 4, 0],
  },
  path: {
    title: "Euler Path", n: 4,
    edges: [[0,1],[1,2],[2,0],[0,3]],
    positions: [{x:80,y:80},{x:280,y:80},{x:180,y:220},{x:380,y:220}],
    desc: "Node 0: out−in=1 (start), Node 3: in−out=1 (end) → path",
    start: 0,
    expectedPath: [0, 1, 2, 0, 3],
  },
};

/* ——— Build simulation steps ——— */
function buildSteps(ex) {
  const { n, edges, start } = ex;
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adj[u].push(v);
  for (let i = 0; i < n; i++) adj[i].sort((a, b) => a - b);

  const steps = [];
  const remaining = adj.map(a => [...a]);
  const stack = [start];
  const circuit = [];
  const usedEdges = [];
  const finalized = new Set(); // edges added to final circuit

  steps.push({
    title: "Initialize — Start at Node " + start,
    detail: `${edges.length} edges total. Hierholzer's: follow edges greedily, when stuck prepend to circuit. Stack: [${start}].`,
    stack: [...stack], circuit: [...circuit], remaining: remaining.map(a => [...a]),
    current: null, usedEdges: [...usedEdges], phase: "init", codeHL: [0, 1],
    activeEdge: null, adjList: remaining.map(a => [...a]),
    finalized: new Set(finalized),
  });

  while (stack.length > 0) {
    const v = stack[stack.length - 1];
    if (remaining[v].length > 0) {
      const u = remaining[v].shift();
      stack.push(u);
      usedEdges.push([v, u]);

      steps.push({
        title: `Follow Edge ${v}→${u}`,
        detail: `Node ${v} has unused edges: pick ${v}→${u}. Push ${u} onto stack. Remaining from ${v}: [${remaining[v].join(",")}].`,
        stack: [...stack], circuit: [...circuit], remaining: remaining.map(a => [...a]),
        current: v, usedEdges: [...usedEdges], phase: "follow", codeHL: [3, 4, 5, 6, 7],
        activeEdge: [v, u], adjList: remaining.map(a => [...a]),
        finalized: new Set(finalized),
      });
    } else {
      stack.pop();
      circuit.unshift(v);
      if (circuit.length >= 2) {
        finalized.add(`${circuit[0]}-${circuit[1]}`);
      }

      steps.push({
        title: `Node ${v} — No Unused Edges, Add to Circuit`,
        detail: `Node ${v} has no remaining edges. Pop from stack, prepend to circuit. Circuit so far: [${circuit.join(" → ")}].`,
        stack: [...stack], circuit: [...circuit], remaining: remaining.map(a => [...a]),
        current: v, usedEdges: [...usedEdges], phase: "circuit", codeHL: [8, 9, 10],
        activeEdge: null, adjList: remaining.map(a => [...a]),
        finalized: new Set(finalized),
      });
    }
  }

  steps.push({
    title: `✓ Complete — Euler ${circuit[0] === circuit[circuit.length - 1] ? "Circuit" : "Path"} Found`,
    detail: `All ${edges.length} edges used exactly once. Path: ${circuit.join(" → ")}.`,
    stack: [], circuit: [...circuit], remaining: remaining.map(a => [...a]),
    current: null, usedEdges: [...usedEdges], phase: "done", codeHL: [12],
    activeEdge: null, adjList: remaining.map(a => [...a]),
    finalized: new Set(finalized),
  });

  return steps;
}

/* ——— Graph SVG ——— */
function GraphView({ example, step }) {
  const { positions, edges } = example;
  const { activeEdge, usedEdges, circuit } = step;
  const usedSet = new Set(usedEdges.map(([u, v]) => `${u}-${v}`));
  const circuitEdges = new Set();
  for (let i = 0; i < circuit.length - 1; i++) circuitEdges.add(`${circuit[i]}-${circuit[i + 1]}`);

  return (
    <svg viewBox="0 0 440 300" className="w-full" style={{ maxHeight: 230 }}>
      {edges.map(([u, v], i) => {
        const f = positions[u], t = positions[v];
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx * dx + dy * dy);
        const r = 20;
        const sx = f.x + (dx / len) * r, sy = f.y + (dy / len) * r;
        const ex = t.x - (dx / len) * r, ey = t.y - (dy / len) * r;
        const key = `${u}-${v}`;
        const isActive = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
        const isUsed = usedSet.has(key);
        const isCircuit = step.phase === "done" && circuitEdges.has(key);
        const color = isActive ? "#f59e0b" : isCircuit ? "#10b981" : isUsed ? "#52525b" : "#3f3f46";
        return (
          <g key={i}>
            <defs>
              <marker id={`ea-${i}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={color} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isActive ? 3 : isCircuit ? 2.5 : 1.5} markerEnd={`url(#ea-${i})`}
              strokeDasharray={isUsed && !isActive && !isCircuit ? "4,3" : "none"} />
          </g>
        );
      })}
      {positions.map((pos, id) => {
        const onStack = step.stack.includes(id);
        const isCurr = step.current === id;
        const fill = isCurr ? "#f59e0b" : onStack ? "#3b82f6" : "#27272a";
        const stroke = isCurr ? "#d97706" : onStack ? "#2563eb" : "#52525b";
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
  { id: 0,  text: `def hierholzer(adj, start):` },
  { id: 1,  text: `    stack = [start]` },
  { id: 2,  text: `    circuit = []` },
  { id: 3,  text: `    while stack:` },
  { id: 4,  text: `        v = stack[-1]` },
  { id: 5,  text: `        if adj[v]:` },
  { id: 6,  text: `            u = adj[v].pop(0)` },
  { id: 7,  text: `            stack.append(u)` },
  { id: 8,  text: `        else:` },
  { id: 9,  text: `            stack.pop()` },
  { id: 10, text: `            circuit.insert(0, v)` },
  { id: 11, text: `` },
  { id: 12, text: `    return circuit` },
];

/* ——— Input / Output Panel with progressive output ——— */
function IOPanel({ example, step }) {
  const { phase, circuit, finalized, usedEdges } = step;
  const { edges, expectedPath, n } = example;
  const done = phase === "done";
  const allMatch = done && circuit.length === expectedPath.length &&
    circuit.every((v, i) => v === expectedPath[i]);

  /* Build adjacency for input display */
  const adjDisplay = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adjDisplay[u].push(v);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">adj</span> = {"{"}</div>
          {adjDisplay.map((neighbors, node) => (
            <div key={node} className="pl-4">
              <span className="text-zinc-500">{node}:</span>{" "}
              <span className="text-zinc-300">
                [{neighbors.join(", ")}]
                {node < n - 1 ? "," : ""}
              </span>
            </div>
          ))}
          <div>{"}"}</div>
          <div><span className="text-zinc-500">start</span> = <span className="text-blue-400">{example.start}</span></div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs">
          <span className="text-zinc-500">path = </span>
          <span className="text-zinc-300">[{expectedPath.join(" → ")}]</span>
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-xs flex items-center gap-0.5 flex-wrap">
          <span className="text-zinc-500">path = [</span>
          {circuit.length === 0
            ? <span className="text-zinc-700">...</span>
            : circuit.map((v, i) => {
                const matchesExpected = done && v === expectedPath[i];
                return (
                  <span key={i} className="flex items-center">
                    <span className={
                      matchesExpected ? "text-emerald-300 font-bold" :
                      "text-zinc-400"
                    }>{v}</span>
                    {i < circuit.length - 1 && <span className="text-zinc-600"> → </span>}
                  </span>
                );
              })
          }
          <span className="text-zinc-500">]</span>
        </div>
        <div className="mt-2 text-[10px] text-zinc-600">
          Edges used: {usedEdges.length}/{edges.length}
          {finalized.size > 0 && (
            <span className="ml-2">
              Circuit edges: {finalized.size}
            </span>
          )}
        </div>
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
export default function EulerianViz() {
  const [exKey, setExKey] = useState("circuit");
  const [si, setSi] = useState(0);
  const example = EXAMPLES[exKey];
  const steps = useMemo(() => buildSteps(example), [exKey]);
  const step = steps[si];
  const switchEx = (k) => { setExKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Eulerian Path / Circuit</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Hierholzer's Algorithm — Visit Every Edge Exactly Once</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(EXAMPLES).map(([k, v]) => (
              <button key={k} onClick={() => switchEx(k)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${exKey === k ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                {v.title}
              </button>
            ))}
          </div>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            Hierholzer's algorithm finds an Eulerian path/circuit by greedily following unused edges. When a node has no remaining edges, it's added to the front of the result and we backtrack. An Euler circuit exists when every node has equal in/out-degree; an Euler path exists when exactly two nodes differ by 1. Used in DNA assembly (de Bruijn graphs), Chinese Postman, and circuit board routing.
            <span className="block mt-1 text-zinc-500 text-xs italic">{example.desc}</span>
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
            <IOPanel example={example} step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{example.n} nodes, {example.edges.length} edges • directed</div>
              <GraphView example={example} step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />On Stack</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 inline-block" style={{ borderRadius: 1 }} />Circuit</span>
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
                  step.phase === "follow" ? "bg-amber-900 text-amber-300" :
                  step.phase === "circuit" ? "bg-blue-900 text-blue-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Remaining adjacency list */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Remaining Adjacency List</div>
              <div className="space-y-0.5">
                {step.adjList.map((nb, node) => {
                  const isCurr = step.current === node;
                  const isEmpty = nb.length === 0;
                  return (
                    <div key={node} className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-xs ${
                      isCurr ? "bg-amber-950/50 border border-amber-900" : "border border-transparent"
                    }`}>
                      <span className={isCurr ? "text-amber-400 font-bold w-4" : "text-zinc-400 w-4"}>{node}</span>
                      <span className="text-zinc-600">→ [</span>
                      {isEmpty
                        ? <span className="text-zinc-700 italic text-[10px]">empty</span>
                        : nb.map((v, i) => (
                            <span key={i}>
                              <span className="text-zinc-400">{v}</span>
                              {i < nb.length - 1 && <span className="text-zinc-700">, </span>}
                            </span>
                          ))
                      }
                      <span className="text-zinc-600">]</span>
                      {isEmpty && <span className="text-[8px] text-zinc-700 ml-auto">✓ exhausted</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stack & Circuit */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Stack</div>
                  <div className="flex gap-1 min-h-[28px] items-center flex-wrap">
                    {step.stack.length > 0
                      ? step.stack.map((n, i) => (
                          <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-xs">{n}</span>
                        ))
                      : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-1.5">Circuit</div>
                  <div className="flex gap-0.5 min-h-[28px] items-center flex-wrap">
                    {step.circuit.length > 0
                      ? step.circuit.map((n, i) => (
                          <span key={i} className="flex items-center gap-0.5">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs">{n}</span>
                            {i < step.circuit.length - 1 && <span className="text-emerald-800 text-[10px]">→</span>}
                          </span>
                        ))
                      : <span className="text-[10px] text-zinc-600 italic">building...</span>}
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
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Visit every edge exactly once — Euler path or circuit</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>De Bruijn sequences / DNA fragment assembly</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Chinese Postman Problem (after edge duplication)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Circuit board routing, network traversal</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V + E)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V + E)</div>
                <div><span className="text-zinc-500 font-semibold">Existence:</span> Circuit if all deg equal; Path if exactly 2 nodes differ by 1</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 332 — Reconstruct Itinerary</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 753 — Cracking the Safe (de Bruijn)</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 2097 — Valid Arrangement of Pairs</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1976 — Number of Ways to Arrive at Destination</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1971 — Find if Path Exists in Graph</span><span className="ml-auto text-[10px] text-green-700">Easy</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 2374 — Node With Highest Edge Score</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
