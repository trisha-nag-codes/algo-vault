import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   Bipartite Check — Algorithm + 2 Problem Showcase
   1. Algorithm               — 2-coloring BFS (bipartite / not toggle)
   2. LC 785 — Is Graph Bipartite? — adjacency list, odd cycle detection
   3. LC 886 — Possible Bipartition — dislike pairs, group splitting
   ═══════════════════════════════════════════════════════════ */

/* ─── Shared helpers ─── */
function buildAdj(n, edges, start) {
  const s = start || 0;
  const adj = Array.from({ length: n + s }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  return adj;
}

/* ─── Generic BFS 2-coloring step builder ─── */
function buildColoringSteps(n, edges, start, codeHL_init, codeHL_start, codeHL_proc, codeHL_color, codeHL_conflict, codeHL_done, codeHL_fail) {
  const s = start || 0;
  const adj = buildAdj(n, edges, s);
  const color = new Array(n + s).fill(-1);
  const steps = [];
  const colored = [];

  steps.push({
    title: "Initialize \u2014 All Nodes Uncolored",
    detail: `${n} nodes, ${edges.length} edges. Try to assign 2 colors so no adjacent nodes share a color.`,
    color: [...color], queue: [], current: null, neighbor: null,
    conflict: null, phase: "init", codeHL: codeHL_init, coloredSoFar: [],
  });

  const first = s;
  color[first] = 0;
  const queue = [first];
  colored.push({ node: first, c: 0 });

  steps.push({
    title: `Color Node ${first} \u2192 Red (0)`,
    detail: `Start BFS from node ${first}. Assign color 0 (Red). Enqueue.`,
    color: [...color], queue: [...queue], current: null, neighbor: null,
    conflict: null, phase: "color", codeHL: codeHL_start, coloredSoFar: [...colored],
  });

  let conflictFound = false;
  while (queue.length && !conflictFound) {
    const u = queue.shift();
    steps.push({
      title: `Process Node ${u} (${color[u] === 0 ? "Red" : "Blue"})`,
      detail: `Dequeue ${u}. Neighbors: [${adj[u].join(", ")}]. Assign opposite color to uncolored.`,
      color: [...color], queue: [...queue], current: u, neighbor: null,
      conflict: null, phase: "process", codeHL: codeHL_proc, coloredSoFar: [...colored],
    });

    for (const v of adj[u]) {
      if (color[v] === -1) {
        color[v] = 1 - color[u];
        queue.push(v);
        colored.push({ node: v, c: color[v] });
        steps.push({
          title: `Color Node ${v} \u2192 ${color[v] === 0 ? "Red" : "Blue"}`,
          detail: `Node ${v} uncolored. Assign opposite of ${u}: ${color[v] === 0 ? "Red" : "Blue"}. Enqueue.`,
          color: [...color], queue: [...queue], current: u, neighbor: v,
          conflict: null, phase: "color", codeHL: codeHL_color, coloredSoFar: [...colored],
        });
      } else if (color[v] === color[u]) {
        conflictFound = true;
        steps.push({
          title: `\u2717 Conflict! Nodes ${u} and ${v} Same Color`,
          detail: `Node ${v} already ${color[v] === 0 ? "Red" : "Blue"} \u2014 same as ${u}! Adjacent nodes share a color. NOT bipartite.`,
          color: [...color], queue: [...queue], current: u, neighbor: v,
          conflict: [u, v], phase: "conflict", codeHL: codeHL_conflict, coloredSoFar: [...colored],
        });
        break;
      }
    }
  }

  if (!conflictFound) {
    const g0 = [], g1 = [];
    for (let i = s; i < n + s; i++) { if (color[i] === 0) g0.push(i); else g1.push(i); }
    steps.push({
      title: "\u2713 Graph Is Bipartite",
      detail: `All nodes colored with no conflicts. Group A (Red): {${g0.join(",")}}. Group B (Blue): {${g1.join(",")}}. Return true.`,
      color: [...color], queue: [], current: null, neighbor: null,
      conflict: null, phase: "done", codeHL: codeHL_done,
      coloredSoFar: [...colored], groups: { A: g0, B: g1 },
    });
  } else {
    steps.push({
      title: "\u2717 Graph Is NOT Bipartite",
      detail: "An odd-length cycle exists \u2014 impossible to 2-color. Return false.",
      color: [...color], queue: [], current: null, neighbor: null,
      conflict: null, phase: "fail", codeHL: codeHL_fail, coloredSoFar: [...colored],
    });
  }
  return steps;
}

/* ─────────────────────────────────────────────
   ALGORITHM TAB: bipartite / not-bipartite toggle
   ───────────────────────────────────────────── */
const ALG_YES = {
  n: 6,
  edges: [[0,1],[0,3],[1,2],[2,5],[3,4],[4,5]],
  positions: [{x:60,y:60},{x:200,y:60},{x:340,y:60},{x:60,y:220},{x:200,y:220},{x:340,y:220}],
  expected: true, expectedGroups: { A:[0,2,4], B:[1,3,5] },
};
const ALG_NO = {
  n: 5,
  edges: [[0,1],[1,2],[2,0],[2,3],[3,4]],
  positions: [{x:100,y:50},{x:260,y:50},{x:200,y:170},{x:100,y:280},{x:260,y:280}],
  expected: false, expectedConflict: [0,2],
};

function buildAlgSteps(variant) {
  const ex = variant === "yes" ? ALG_YES : ALG_NO;
  return buildColoringSteps(ex.n, ex.edges, 0, [0,1,2], [3,4,5], [7,8], [9,10,11,12], [13,14], [16], [14]);
}

/* ─────────────────────────────────────────────
   LC 785: Is Graph Bipartite?
   graph = [[1,2,3],[0,2],[0,1,3],[0,2]] → NOT bipartite
   ───────────────────────────────────────────── */
const P1_GRAPH = [[1,2,3],[0,2],[0,1,3],[0,2]];
const P1_N = 4;
const P1_EDGES_FLAT = [];
{
  const seen = new Set();
  P1_GRAPH.forEach((nbs, u) => {
    for (const v of nbs) {
      const key = Math.min(u, v) + "-" + Math.max(u, v);
      if (!seen.has(key)) { seen.add(key); P1_EDGES_FLAT.push([u, v]); }
    }
  });
}
const P1_POS = [{x:80,y:60},{x:280,y:60},{x:280,y:220},{x:80,y:220}];

function buildP1Steps() {
  return buildColoringSteps(P1_N, P1_EDGES_FLAT, 0, [0,1,2], [3,4], [5,6], [7,8,9], [10,11], [13], [11]);
}

/* ─────────────────────────────────────────────
   LC 886: Possible Bipartition
   n=4, dislikes=[[1,2],[1,3],[2,4]] → bipartite: {1,4} and {2,3}
   ───────────────────────────────────────────── */
const P2_N = 4;
const P2_DISLIKES = [[1,2],[1,3],[2,4]];
const P2_POS = [null, {x:80,y:60},{x:280,y:60},{x:280,y:220},{x:80,y:220}];

function buildP2Steps() {
  return buildColoringSteps(P2_N, P2_DISLIKES, 1, [0,1,2,3], [4,5], [6,7], [8,9,10], [11,12], [14], [12]);
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title: "Algorithm", lc: null, difficulty: null, tag: "2-Coloring",
    coreIdea: "A graph is bipartite if nodes can be split into two groups where every edge crosses groups. BFS assigns Red/Blue colors level by level \u2014 if a neighbor already has the same color, an odd cycle exists and the graph isn't bipartite.",
    hasVariant: true,
    getSteps: (v) => buildAlgSteps(v),
    getGraph: (v) => v === "yes" ? ALG_YES : ALG_NO,
    code: [
      {id:0,text:"from collections import deque"},{id:1,text:""},
      {id:2,text:"def is_bipartite(adj, n):"},
      {id:3,text:"    color = [-1] * n"},
      {id:4,text:"    color[0] = 0"},
      {id:5,text:"    queue = deque([0])"},{id:6,text:""},
      {id:7,text:"    while queue:"},
      {id:8,text:"        u = queue.popleft()"},
      {id:9,text:"        for v in adj[u]:"},
      {id:10,text:"            if color[v] == -1:"},
      {id:11,text:"                color[v] = 1 - color[u]"},
      {id:12,text:"                queue.append(v)"},
      {id:13,text:"            elif color[v] == color[u]:"},
      {id:14,text:"                return False"},{id:15,text:""},
      {id:16,text:"    return True"},
    ],
  },
  isBipartite: {
    title: "Is Graph Bipartite?", lc: "785", difficulty: "Medium", tag: "Adj List",
    coreIdea: "Given an adjacency list, determine if the graph is bipartite. BFS 2-coloring from any node: assign opposite colors to neighbors. If any neighbor already has the same color, an odd cycle exists \u2014 return false.",
    hasVariant: false,
    getSteps: () => buildP1Steps(),
    getGraph: () => ({ n: P1_N, edges: P1_EDGES_FLAT, positions: P1_POS, expected: false, expectedConflict: [1,2] }),
    code: [
      {id:0,text:"def isBipartite(graph):"},
      {id:1,text:"    n = len(graph)"},
      {id:2,text:"    color = [-1] * n"},
      {id:3,text:"    for start in range(n):"},
      {id:4,text:"        if color[start] != -1: continue"},
      {id:5,text:"        color[start] = 0"},
      {id:6,text:"        q = deque([start])"},
      {id:7,text:"        while q:"},
      {id:8,text:"            u = q.popleft()"},
      {id:9,text:"            for v in graph[u]:"},
      {id:10,text:"                if color[v] == -1:"},
      {id:11,text:"                    color[v] = 1 - color[u]"},
      {id:12,text:"                    q.append(v)"},
      {id:13,text:"                elif color[v] == color[u]:"},
      {id:14,text:"                    return False"},{id:15,text:""},
      {id:16,text:"    return True"},
    ],
  },
  bipartition: {
    title: "Possible Bipartition", lc: "886", difficulty: "Medium", tag: "Dislikes",
    coreIdea: "Split N people into two groups so that no two people who dislike each other are in the same group. Build a graph from dislike pairs and check if it's bipartite \u2014 if yes, the 2-coloring gives a valid partition.",
    hasVariant: false,
    getSteps: () => buildP2Steps(),
    getGraph: () => ({ n: P2_N, edges: P2_DISLIKES, positions: P2_POS, expected: true, expectedGroups: { A:[1,4], B:[2,3] } }),
    code: [
      {id:0,text:"def possibleBipartition(n, dislikes):"},
      {id:1,text:"    adj = [[] for _ in range(n+1)]"},
      {id:2,text:"    for a,b in dislikes:"},
      {id:3,text:"        adj[a].append(b); adj[b].append(a)"},
      {id:4,text:"    color = [-1]*(n+1)"},
      {id:5,text:"    for s in range(1, n+1):"},
      {id:6,text:"        if color[s] != -1: continue"},
      {id:7,text:"        color[s] = 0; q = deque([s])"},
      {id:8,text:"        while q:"},
      {id:9,text:"            u = q.popleft()"},
      {id:10,text:"            for v in adj[u]:"},
      {id:11,text:"                if color[v] == -1:"},
      {id:12,text:"                    color[v] = 1-color[u]"},
      {id:13,text:"                    q.append(v)"},
      {id:14,text:"                elif color[v]==color[u]:"},
      {id:15,text:"                    return False"},{id:16,text:""},
      {id:17,text:"    return True"},
    ],
  },
};

/* ═══════════════════════════════════════════
   GRAPH SVG
   ═══════════════════════════════════════════ */
function GraphView({ graphData, step }) {
  const { positions, edges } = graphData;
  const { color, current, neighbor, conflict } = step;
  const conflictSet = new Set(conflict || []);

  return (
    <svg viewBox="0 0 400 300" className="w-full" style={{ maxHeight: 230 }}>
      {edges.map(([u, v], i) => {
        const pu = positions[u], pv = positions[v];
        if (!pu || !pv) return null;
        const dx = pv.x - pu.x, dy = pv.y - pu.y, len = Math.sqrt(dx * dx + dy * dy);
        const r = 20;
        const sx = pu.x + (dx / len) * r, sy = pu.y + (dy / len) * r;
        const ex = pv.x - (dx / len) * r, ey = pv.y - (dy / len) * r;
        const isConflict = conflict && ((conflict[0] === u && conflict[1] === v) || (conflict[0] === v && conflict[1] === u));
        const isActive = (current === u && neighbor === v) || (current === v && neighbor === u);
        const edgeColor = isConflict ? "#ef4444" : isActive ? "#f59e0b" : "#3f3f46";
        return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke={edgeColor} strokeWidth={isConflict ? 3 : isActive ? 2.5 : 1.5} />;
      })}
      {positions.map((pos, id) => {
        if (!pos) return null;
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

/* ═══════════════════════════════════════════
   IO PANEL
   ═══════════════════════════════════════════ */
function IOPanel({ graphData, step, pKey }) {
  const { n, edges, expected, expectedGroups, expectedConflict } = graphData;
  const { phase, color, coloredSoFar, groups } = step;
  const done = phase === "done" || phase === "fail";
  const result = phase === "done" ? true : phase === "fail" ? false : null;
  const matchesExpected = done && result === expected;
  const start = pKey === "bipartition" ? 1 : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">n    </span>= <span className="text-blue-400">{n}</span></div>
          <div><span className="text-zinc-500">{pKey === "bipartition" ? "dislike" : "edges"}</span>= <span className="text-zinc-300">{edges.length}</span></div>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected</div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div>
            <span className="text-zinc-500">{pKey === "bipartition" ? "possible" : "bipartite"} = </span>
            <span className={expected ? "text-emerald-300" : "text-red-300"}>{expected ? "True" : "False"}</span>
          </div>
          {expectedGroups && (
            <>
              <div><span className="text-zinc-500">A = </span><span className="text-red-300">{`{${expectedGroups.A.join(",")}}`}</span></div>
              <div><span className="text-zinc-500">B = </span><span className="text-blue-300">{`{${expectedGroups.B.join(",")}}`}</span></div>
            </>
          )}
          {expectedConflict && (
            <div><span className="text-zinc-500">conflict = </span><span className="text-red-300">({expectedConflict.join(",")})</span></div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output</div>
          {matchesExpected && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{"\u2713"} MATCH</span>}
        </div>
        <div className="font-mono text-[11px] flex items-center gap-0.5 flex-wrap">
          <span className="text-zinc-500">color=[</span>
          {Array.from({ length: n }).map((_, idx) => {
            const i = idx + start;
            const c = color[i];
            return (
              <span key={i} className="flex items-center">
                <span className={c === 0 ? "text-red-300 font-bold" : c === 1 ? "text-blue-300 font-bold" : "text-zinc-600"}>
                  {c === -1 ? "?" : c}
                </span>
                {idx < n - 1 && <span className="text-zinc-600">,</span>}
              </span>
            );
          })}
          <span className="text-zinc-500">]</span>
        </div>
        {done && (
          <div className="mt-1">
            <span className="text-zinc-500 text-[10px]">result = </span>
            <span className={`text-[10px] font-bold ${result ? "text-emerald-300" : "text-red-300"}`}>
              {result ? "True" : "False (odd cycle)"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════ */
function CodePanel({ code, highlightLines }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 h-full">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {code.map(line => {
          const hl = highlightLines.includes(line.id);
          return (
            <div key={line.id} className={`px-2 rounded-sm ${hl ? "bg-blue-500/15 text-blue-300" : line.text === "" ? "" : "text-zinc-500"}`}>
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

function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">{"\u2190"} Prev</button>
      <div className="flex gap-1.5 items-center">
        {total <= 20
          ? Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => setSi(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === si ? "bg-blue-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`} />
            ))
          : <>
              <button onClick={() => setSi(0)} className={`px-2 py-0.5 text-xs rounded ${si === 0 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>Start</button>
              <input type="range" min={0} max={total - 1} value={si} onChange={e => setSi(Number(e.target.value))} className="w-32 accent-blue-500" />
              <span className="text-[10px] text-zinc-600 font-mono w-12 text-center">{si + 1}/{total}</span>
              <button onClick={() => setSi(total - 1)} className={`px-2 py-0.5 text-xs rounded ${si === total - 1 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>End</button>
            </>
        }
      </div>
      <button onClick={() => setSi(Math.min(total - 1, si + 1))} disabled={si >= total - 1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">Next {"\u2192"}</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function BipartiteViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [variant, setVariant] = useState("yes");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];

  const steps = useMemo(() => {
    if (problem.hasVariant) return problem.getSteps(variant);
    return problem.getSteps();
  }, [pKey, variant]);

  const graphData = useMemo(() => {
    if (problem.hasVariant) return problem.getGraph(variant);
    return problem.getGraph();
  }, [pKey, variant]);

  const step = steps[Math.min(si, steps.length - 1)];
  const switchProblem = (k) => { setPKey(k); setSi(0); setVariant("yes"); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header + Tabs */}
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bipartite Check</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Graph 2-Coloring with BFS</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PROBLEMS).map(([k, p]) => (
              <button key={k} onClick={() => switchProblem(k)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  pKey === k ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {p.lc ? <><span className="opacity-60">LC {p.lc}</span> </> : null}{p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
            {problem.difficulty && <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-900/50 text-amber-400">{problem.difficulty}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">{problem.tag}</span>
            {/* Variant toggle for algorithm tab */}
            {problem.hasVariant && (
              <div className="ml-auto flex gap-1.5">
                <button onClick={() => { setVariant("yes"); setSi(0); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    variant === "yes" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}>Bipartite {"\u2713"}</button>
                <button onClick={() => { setVariant("no"); setSi(0); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    variant === "no" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}>Not Bipartite {"\u2717"}</button>
              </div>
            )}
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        {/* Navigation */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* 3-COLUMN GRID */}
        <div className="grid grid-cols-12 gap-3">
          {/* COL 1: IO + Graph */}
          <div className="col-span-3 space-y-3">
            <IOPanel graphData={graphData} step={step} pKey={pKey} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{graphData.n}N, {graphData.edges.length}E</div>
              <GraphView graphData={graphData} step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Red (0)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Blue (1)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" />Uncolored</span>
              </div>
            </div>
          </div>

          {/* COL 2: Steps + State */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "fail" || step.phase === "conflict" ? "bg-red-950/30 border-red-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
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
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: graphData.n }).map((_, idx) => {
                  const nodeStart = pKey === "bipartition" ? 1 : 0;
                  const i = idx + nodeStart;
                  const c = step.color[i];
                  const isDone = step.phase === "done";
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        c === 0 ? (isDone ? "bg-red-950/40 border-red-800 text-red-300" : "bg-red-950 border-red-800 text-red-300") :
                        c === 1 ? (isDone ? "bg-blue-950/40 border-blue-800 text-blue-300" : "bg-blue-950 border-blue-800 text-blue-300") :
                        "bg-zinc-900 border-zinc-700 text-zinc-600"
                      }`}>
                        {c === -1 ? "\u2014" : c}
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
                  ? step.queue.map((nd, i) => (
                      <span key={i} className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-mono font-bold text-xs ${
                        step.color[nd] === 0 ? "bg-red-950 border border-red-800 text-red-300" :
                        "bg-blue-950 border border-blue-800 text-blue-300"
                      }`}>{nd}</span>
                    ))
                  : <span className="text-[10px] text-zinc-600 italic">empty</span>}
              </div>
            </div>

            {/* Coloring log */}
            {step.coloredSoFar && step.coloredSoFar.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Coloring Log</div>
                <div className="flex gap-1.5 flex-wrap">
                  {step.coloredSoFar.map((entry, i) => (
                    <span key={i} className={`inline-flex items-center gap-1 px-2 h-6 rounded-md text-[10px] font-mono font-bold ${
                      entry.c === 0 ? "bg-red-950 border border-red-800 text-red-300" : "bg-blue-950 border border-blue-800 text-blue-300"
                    }`}>{entry.node}{"\u2192"}{entry.c === 0 ? "R" : "B"}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Groups (bipartite result) */}
            {step.groups && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Partition Groups</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-400 font-mono font-bold w-14">Group A:</span>
                    <div className="flex gap-1">
                      {step.groups.A.map(nd => (
                        <span key={nd} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-red-950 border border-red-800 text-red-300 font-mono font-bold text-xs">{nd}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-blue-400 font-mono font-bold w-14">Group B:</span>
                    <div className="flex gap-1">
                      {step.groups.B.map(nd => (
                        <span key={nd} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-xs">{nd}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COL 3: Code */}
          <div className="col-span-4">
            <CodePanel code={problem.code} highlightLines={step.codeHL} />
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Check if a graph can be 2-colored (no odd cycles)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Prerequisite for bipartite matching (Hungarian, Hopcroft-Karp)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Conflict/scheduling {"\u2014"} "can tasks be split into two shifts?"</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Detecting odd cycles in undirected graphs</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V + E) {"\u2014"} standard BFS</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V) for color array + queue</div>
                <div><span className="text-zinc-500 font-semibold">Note:</span> For disconnected graphs, run BFS from every unvisited node</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 785 {"\u2014"} Is Graph Bipartite?</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 886 {"\u2014"} Possible Bipartition</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1042 {"\u2014"} Flower Planting With No Adjacent</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1349 {"\u2014"} Max Students Taking Exam</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 765 {"\u2014"} Couples Holding Hands</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 207 {"\u2014"} Course Schedule (cycle variant)</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}