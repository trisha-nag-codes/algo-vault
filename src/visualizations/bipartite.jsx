import { useState, useMemo } from "react";

/* ─── Problem Inputs ─── */
const EXAMPLES = {
  bipartite: {
    label: "Bipartite ✓", n: 6,
    edges: [[0,1],[0,3],[1,2],[2,5],[3,4],[4,5]],
    positions: [{x:60,y:60},{x:200,y:60},{x:340,y:60},{x:60,y:220},{x:200,y:220},{x:340,y:220}],
    expectedResult: true,
    expectedGroups: { A: [0, 2, 4], B: [1, 3, 5] },
  },
  not_bipartite: {
    label: "Not Bipartite ✗", n: 5,
    edges: [[0,1],[1,2],[2,0],[2,3],[3,4]],
    positions: [{x:100,y:50},{x:260,y:50},{x:200,y:170},{x:100,y:280},{x:260,y:280}],
    expectedResult: false,
    expectedConflict: [0, 2],
  },
};

/* ─── Build adjacency list ─── */
function buildAdj(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  return adj;
}

/* ─── Build simulation steps ─── */
function buildSteps(ex) {
  const { n, edges } = ex;
  const adj = buildAdj(n, edges);
  const color = new Array(n).fill(-1);
  const steps = [];
  const queue = [];
  const coloredSoFar = [];

  steps.push({
    title: "Initialize – All Nodes Uncolored",
    detail: `${n} nodes, ${edges.length} edges. Try to assign 2 colors so no adjacent nodes share a color. Use BFS coloring.`,
    color: [...color], queue: [], current: null, neighbor: null,
    conflict: null, phase: "init", codeHL: [0, 1, 2],
    coloredSoFar: [...coloredSoFar],
  });

  color[0] = 0; queue.push(0);
  coloredSoFar.push({ node: 0, c: 0 });
  steps.push({
    title: "Color Node 0 → Red (Color 0)",
    detail: "Start BFS from node 0. Assign color 0 (red). Enqueue node 0.",
    color: [...color], queue: [...queue], current: null, neighbor: null,
    conflict: null, phase: "color", codeHL: [3, 4, 5],
    coloredSoFar: [...coloredSoFar],
  });

  let conflictFound = false;
  while (queue.length && !conflictFound) {
    const u = queue.shift();
    steps.push({
      title: `Process Node ${u} (${color[u] === 0 ? "Red" : "Blue"})`,
      detail: `Dequeue node ${u}. Check neighbors: [${adj[u].join(", ")}]. Assign opposite color (${color[u] === 0 ? "Blue" : "Red"}) to uncolored neighbors.`,
      color: [...color], queue: [...queue], current: u, neighbor: null,
      conflict: null, phase: "process", codeHL: [7, 8],
      coloredSoFar: [...coloredSoFar],
    });

    for (const v of adj[u]) {
      if (color[v] === -1) {
        color[v] = 1 - color[u];
        queue.push(v);
        coloredSoFar.push({ node: v, c: color[v] });
        steps.push({
          title: `Color Node ${v} → ${color[v] === 0 ? "Red" : "Blue"}`,
          detail: `Node ${v} uncolored. Assign opposite of node ${u}: ${color[v] === 0 ? "Red" : "Blue"}. Enqueue.`,
          color: [...color], queue: [...queue], current: u, neighbor: v,
          conflict: null, phase: "color", codeHL: [9, 10, 11, 12],
          coloredSoFar: [...coloredSoFar],
        });
      } else if (color[v] === color[u]) {
        conflictFound = true;
        steps.push({
          title: `Conflict! Nodes ${u} and ${v} Same Color`,
          detail: `Node ${v} already ${color[v] === 0 ? "Red" : "Blue"} — same as node ${u}! Adjacent nodes share a color. NOT bipartite.`,
          color: [...color], queue: [...queue], current: u, neighbor: v,
          conflict: [u, v], phase: "conflict", codeHL: [13, 14],
          coloredSoFar: [...coloredSoFar],
        });
        break;
      }
    }
  }

  if (!conflictFound) {
    const g0 = [], g1 = [];
    color.forEach((c, i) => { if (c === 0) g0.push(i); else g1.push(i); });
    steps.push({
      title: "✓ Graph Is Bipartite",
      detail: `All nodes colored with no conflicts. Group A (Red): {${g0.join(",")}}. Group B (Blue): {${g1.join(",")}}. Return true.`,
      color: [...color], queue: [], current: null, neighbor: null,
      conflict: null, phase: "done", codeHL: [16],
      coloredSoFar: [...coloredSoFar], groups: { A: g0, B: g1 },
    });
  } else {
    steps.push({
      title: "✗ Graph Is NOT Bipartite",
      detail: "An odd-length cycle exists — impossible to 2-color. Return false.",
      color: [...color], queue: [], current: null, neighbor: null,
      conflict: null, phase: "fail", codeHL: [14],
      coloredSoFar: [...coloredSoFar],
    });
  }
  return steps;
}

/* ─── Graph SVG ─── */
function GraphView({ example, step }) {
  const { positions, edges } = example;
  const { color, current, neighbor, conflict } = step;
  const conflictSet = new Set(conflict || []);

  return (
    <svg viewBox="0 0 400 300" className="w-full" style={{ maxHeight: 230 }}>
      {edges.map(([u, v], i) => {
        const f = positions[u], t = positions[v];
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx * dx + dy * dy);
        const r = 20;
        const sx = f.x + (dx / len) * r, sy = f.y + (dy / len) * r;
        const ex = t.x - (dx / len) * r, ey = t.y - (dy / len) * r;
        const isConflict = conflict && ((conflict[0] === u && conflict[1] === v) || (conflict[0] === v && conflict[1] === u));
        const isActive = (current === u && neighbor === v) || (current === v && neighbor === u);
        const edgeColor = isConflict ? "#ef4444" : isActive ? "#f59e0b" : "#3f3f46";
        return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke={edgeColor} strokeWidth={isConflict ? 3 : isActive ? 2.5 : 1.5} />;
      })}
      {positions.map((pos, id) => {
        const c = color[id];
        const isCurr = current === id;
        const isNb = neighbor === id;
        const isConf = conflictSet.has(id);
        const fill = isConf ? "#ef4444" : c === 0 ? "#ef4444" : c === 1 ? "#3b82f6" : isCurr ? "#f59e0b" : "#27272a";
        const stroke = isConf ? "#fca5a5" : c === 0 ? "#dc2626" : c === 1 ? "#2563eb" : isCurr ? "#d97706" : "#52525b";
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={18} fill={fill} stroke={stroke} strokeWidth={isConf ? 3 : 2.5} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="14" fontWeight="700" fontFamily="monospace">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Python Code ─── */
const CODE = [
  { id: 0,  text: `from collections import deque` },
  { id: 1,  text: `` },
  { id: 2,  text: `def is_bipartite(adj, n):` },
  { id: 3,  text: `    color = [-1] * n` },
  { id: 4,  text: `    color[0] = 0` },
  { id: 5,  text: `    queue = deque([0])` },
  { id: 6,  text: `` },
  { id: 7,  text: `    while queue:` },
  { id: 8,  text: `        u = queue.popleft()` },
  { id: 9,  text: `        for v in adj[u]:` },
  { id: 10, text: `            if color[v] == -1:` },
  { id: 11, text: `                color[v] = 1 - color[u]` },
  { id: 12, text: `                queue.append(v)` },
  { id: 13, text: `            elif color[v] == color[u]:` },
  { id: 14, text: `                return False` },
  { id: 15, text: `` },
  { id: 16, text: `    return True` },
];

/* ─── Input / Output Panel ─── */
function IOPanel({ example, step }) {
  const { n, edges, expectedResult, expectedGroups, expectedConflict } = example;
  const { phase, color, coloredSoFar, groups } = step;
  const adj = buildAdj(n, edges);
  const done = phase === "done" || phase === "fail";
  const result = phase === "done" ? true : phase === "fail" ? false : null;
  const matchesExpected = done && result === expectedResult;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">n</span> = <span className="text-blue-400">{n}</span></div>
          <div><span className="text-zinc-500">adj</span> = {"{"}</div>
          {adj.map((neighbors, node) => (
            <div key={node} className="pl-4">
              <span className="text-zinc-500">{node}:</span>{" "}
              <span className="text-zinc-300">[{neighbors.join(", ")}]{node < n - 1 ? "," : ""}</span>
            </div>
          ))}
          <div>{"}"}</div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs space-y-0.5">
          <div>
            <span className="text-zinc-500">bipartite = </span>
            <span className={expectedResult ? "text-emerald-300" : "text-red-300"}>{expectedResult ? "True" : "False"}</span>
          </div>
          {expectedGroups && (
            <>
              <div><span className="text-zinc-500">group_A = </span><span className="text-red-300">{`{${expectedGroups.A.join(",")}}`}</span></div>
              <div><span className="text-zinc-500">group_B = </span><span className="text-blue-300">{`{${expectedGroups.B.join(",")}}`}</span></div>
            </>
          )}
          {expectedConflict && (
            <div><span className="text-zinc-500">conflict = </span><span className="text-red-300">({expectedConflict.join(", ")})</span></div>
          )}
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {matchesExpected && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-xs flex items-center gap-0.5">
          <span className="text-zinc-500">color = [</span>
          {color.map((c, i) => (
            <span key={i} className="flex items-center">
              <span className={
                c === 0 ? "text-red-300 font-bold" :
                c === 1 ? "text-blue-300 font-bold" :
                "text-zinc-600"
              }>
                {c === -1 ? "?" : c}
              </span>
              {i < color.length - 1 && <span className="text-zinc-600">, </span>}
            </span>
          ))}
          <span className="text-zinc-500">]</span>
        </div>
        {coloredSoFar.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {coloredSoFar.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <span className="text-zinc-600 font-mono">node {entry.node}:</span>
                <span className={entry.c === 0 ? "text-red-400/80" : "text-blue-400/80"}>
                  {entry.c === 0 ? "Red" : "Blue"}
                </span>
                <span className="text-emerald-600">✓</span>
              </div>
            ))}
          </div>
        )}
        {done && (
          <div className="mt-1.5">
            <span className="text-zinc-500 text-[10px]">result = </span>
            <span className={`text-[10px] font-bold ${result ? "text-emerald-300" : "text-red-300"}`}>
              {result ? "True (bipartite)" : "False (odd cycle)"}
            </span>
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

/* ─── Main Component ─── */
export default function BipartiteViz() {
  const [exKey, setExKey] = useState("bipartite");
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
            <h1 className="text-2xl font-bold tracking-tight">Bipartite Check</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Graph 2-Coloring with BFS</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(EXAMPLES).map(([k, v]) => (
              <button key={k} onClick={() => switchEx(k)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  exKey === k
                    ? (k === "bipartite" ? "bg-emerald-600 text-white" : "bg-red-600 text-white")
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            A graph is <strong className="text-zinc-300">bipartite</strong> if its nodes can be split into two groups where every edge connects a node from one group to the other. BFS assigns <strong className="text-red-400">Red</strong>/<strong className="text-blue-400">Blue</strong> colors level by level — if a neighbor already has the <strong className="text-zinc-300">same color</strong>, an odd cycle exists and the graph isn't bipartite. This is the foundation for matching problems, scheduling, and conflict detection.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-3">
          <NavBar si={si} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 3-COLUMN GRID â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Graph ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel example={example} step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{example.n}N, {example.edges.length}E</div>
              <GraphView example={example} step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Red (0)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Blue (1)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" />Uncolored</span>
              </div>
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "fail" || step.phase === "conflict" ? "bg-red-950/30 border-red-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {si + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "conflict" || step.phase === "fail" ? "bg-red-900 text-red-300" :
                  step.phase === "color" ? "bg-blue-900 text-blue-300" :
                  step.phase === "process" ? "bg-blue-900 text-blue-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* color[] array */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">color[]</div>
              <div className="flex gap-1.5">
                {step.color.map((c, i) => {
                  const isDone = step.phase === "done";
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        c === 0 ? (isDone ? "bg-red-950/40 border-red-800 text-red-300" : "bg-red-950 border-red-800 text-red-300") :
                        c === 1 ? (isDone ? "bg-blue-950/40 border-blue-800 text-blue-300" : "bg-blue-950 border-blue-800 text-blue-300") :
                        "bg-zinc-900 border-zinc-700 text-zinc-600"
                      }`}>
                        {c === -1 ? "–" : c}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Queue */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Queue</div>
              <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                {step.queue.length > 0
                  ? step.queue.map((n, i) => (
                      <span key={i} className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-mono font-bold text-xs ${
                        step.color[n] === 0 ? "bg-red-950 border border-red-800 text-red-300" :
                        "bg-blue-950 border border-blue-800 text-blue-300"
                      }`}>{n}</span>
                    ))
                  : <span className="text-[10px] text-zinc-600 italic">empty</span>}
              </div>
            </div>

            {/* Groups (shown at end for bipartite) */}
            {step.groups && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Partition Groups</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-400 font-mono font-bold w-14">Group A:</span>
                    <div className="flex gap-1">
                      {step.groups.A.map(n => (
                        <span key={n} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-red-950 border border-red-800 text-red-300 font-mono font-bold text-xs">{n}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-blue-400 font-mono font-bold w-14">Group B:</span>
                    <div className="flex gap-1">
                      {step.groups.B.map(n => (
                        <span key={n} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-xs">{n}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
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
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Check if a graph can be 2-colored (no odd cycles)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Prerequisite for bipartite matching (Hungarian, Hopcroft-Karp)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Conflict/scheduling problems — "can tasks be split into two shifts?"</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Detecting odd cycles in undirected graphs</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V + E) — standard BFS</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V) for color array + queue</div>
                <div><span className="text-zinc-500 font-semibold">Note:</span> For disconnected graphs, run BFS from every unvisited node</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 785 — Is Graph Bipartite?</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 886 — Possible Bipartition</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 207 — Course Schedule (cycle variant)</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1042 — Flower Planting With No Adjacent</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1349 — Max Students Taking Exam</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 765 — Couples Holding Hands</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
