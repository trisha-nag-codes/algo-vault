import { useState, useMemo } from "react";

/* ─── Problem Input ─── */
const N = 10;
const EDGES = [
  [0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,6],[4,6],[4,7],[5,7],[5,8],[6,9],[7,9],[8,9],
];
const POS = [
  {x:40,y:160},{x:130,y:80},{x:130,y:240},{x:240,y:40},{x:240,y:160},
  {x:240,y:280},{x:370,y:80},{x:370,y:200},{x:370,y:300},{x:480,y:160},
];
const SOURCE = 0, TARGET = 9;

/* ─── Adjacency list ─── */
const ADJ = (() => {
  const adj = Array.from({ length: N }, () => []);
  for (const [u, v] of EDGES) { adj[u].push(v); adj[v].push(u); }
  for (let i = 0; i < N; i++) adj[i].sort((a, b) => a - b);
  return adj;
})();

/* ─── Precompute Expected Outputs ─── */
function runBidirectional() {
  const visitedF = new Set([SOURCE]), visitedB = new Set([TARGET]);
  const parentF = { [SOURCE]: null }, parentB = { [TARGET]: null };
  let qF = [SOURCE], qB = [TARGET];
  let expanded = 0;
  while (qF.length && qB.length) {
    const nF = [];
    for (const u of qF) {
      for (const v of ADJ[u]) {
        if (visitedF.has(v)) continue;
        visitedF.add(v); parentF[v] = u; nF.push(v); expanded++;
        if (visitedB.has(v)) {
          const pF = []; let c = v; while (c !== null) { pF.unshift(c); c = parentF[c]; }
          const pB = []; c = parentB[v]; while (c !== null) { pB.push(c); c = parentB[c]; }
          return { path: [...pF, ...pB], expanded, meet: v };
        }
      }
    }
    qF = nF;
    const nB = [];
    for (const u of qB) {
      for (const v of ADJ[u]) {
        if (visitedB.has(v)) continue;
        visitedB.add(v); parentB[v] = u; nB.push(v); expanded++;
        if (visitedF.has(v)) {
          const pF = []; let c = v; while (c !== null) { pF.unshift(c); c = parentF[c]; }
          const pB = []; c = parentB[v]; while (c !== null) { pB.push(c); c = parentB[c]; }
          return { path: [...pF, ...pB], expanded, meet: v };
        }
      }
    }
    qB = nB;
  }
  return { path: [], expanded, meet: null };
}

function runStandardBFS() {
  const visited = new Set([SOURCE]);
  const parent = { [SOURCE]: null };
  let queue = [SOURCE];
  let expanded = 0;
  while (queue.length) {
    const next = [];
    for (const u of queue) {
      for (const v of ADJ[u]) {
        if (visited.has(v)) continue;
        visited.add(v); parent[v] = u; next.push(v); expanded++;
        if (v === TARGET) {
          const p = []; let c = v; while (c !== null) { p.unshift(c); c = parent[c]; }
          return { path: p, expanded };
        }
      }
    }
    queue = next;
  }
  return { path: [], expanded };
}

const EXPECTED_BI = runBidirectional();
const EXPECTED_STD = runStandardBFS();

/* ─── Build Bidirectional Steps ─── */
function buildBidirectionalSteps() {
  const steps = [];
  const visitedF = new Set([SOURCE]), visitedB = new Set([TARGET]);
  const parentF = { [SOURCE]: null }, parentB = { [TARGET]: null };
  let queueF = [SOURCE], queueB = [TARGET];
  let levelF = 0, levelB = 0;
  let expanded = 0;

  steps.push({
    title: "Initialize – BFS from Both Ends",
    detail: `Forward queue = [${SOURCE}]. Backward queue = [${TARGET}]. Alternate expansions until frontiers overlap.`,
    visitedF: new Set(visitedF), visitedB: new Set(visitedB),
    queueF: [...queueF], queueB: [...queueB],
    current: null, neighbors: [], activeEdge: null,
    phase: "init", codeHL: [2, 3, 4, 5], path: [], meetNode: null,
    direction: null, levelF, levelB, expanded,
    finalized: new Set([...visitedF, ...visitedB]),
  });

  let found = false;
  let meetNode = null;

  while (queueF.length && queueB.length && !found) {
    const nextF = [];
    levelF++;
    for (const u of queueF) {
      if (found) break;
      const nbs = [];
      for (const v of ADJ[u]) {
        if (visitedF.has(v)) continue;
        visitedF.add(v); parentF[v] = u; nextF.push(v); nbs.push(v); expanded++;

        if (visitedB.has(v)) {
          meetNode = v; found = true;
          const pF = []; let c = v; while (c !== null) { pF.unshift(c); c = parentF[c]; }
          const pB = []; c = parentB[v]; while (c !== null) { pB.push(c); c = parentB[c]; }
          const fullPath = [...pF, ...pB];

          steps.push({
            title: `✓ Frontiers Meet at Node ${v}`,
            detail: `Forward BFS reached ${v}, already in backward set. Path: ${fullPath.join("→")}. Length: ${fullPath.length - 1}. ${expanded} expansions total.`,
            visitedF: new Set(visitedF), visitedB: new Set(visitedB),
            queueF: [...nextF], queueB: [...queueB],
            current: v, neighbors: [], activeEdge: [u, v],
            phase: "done", codeHL: [11, 12, 13], path: fullPath, meetNode: v,
            direction: "forward", levelF, levelB, expanded,
            finalized: new Set([...visitedF, ...visitedB]),
          });
          break;
        }
      }
      if (!found && nbs.length > 0) {
        steps.push({
          title: `Forward: Expand Node ${u} (Level ${levelF})`,
          detail: `Neighbors of ${u}: [${ADJ[u].join(",")}]. New: [${nbs.join(",")}]. Forward frontier grows.`,
          visitedF: new Set(visitedF), visitedB: new Set(visitedB),
          queueF: [...nextF], queueB: [...queueB],
          current: u, neighbors: nbs.map(v => [v]), activeEdge: null,
          phase: "expandF", codeHL: [8, 9, 10, 11, 12, 13], path: [], meetNode: null,
          direction: "forward", levelF, levelB, expanded,
          finalized: new Set([...visitedF, ...visitedB]),
        });
      }
    }
    queueF = nextF;
    if (found) break;

    const nextB = [];
    levelB++;
    for (const u of queueB) {
      if (found) break;
      const nbs = [];
      for (const v of ADJ[u]) {
        if (visitedB.has(v)) continue;
        visitedB.add(v); parentB[v] = u; nextB.push(v); nbs.push(v); expanded++;

        if (visitedF.has(v)) {
          meetNode = v; found = true;
          const pF = []; let c = v; while (c !== null) { pF.unshift(c); c = parentF[c]; }
          const pB = []; c = parentB[v]; while (c !== null) { pB.push(c); c = parentB[c]; }
          const fullPath = [...pF, ...pB];

          steps.push({
            title: `✓ Frontiers Meet at Node ${v}`,
            detail: `Backward BFS reached ${v}, already in forward set. Path: ${fullPath.join("→")}. Length: ${fullPath.length - 1}. ${expanded} expansions total.`,
            visitedF: new Set(visitedF), visitedB: new Set(visitedB),
            queueF: [...queueF], queueB: [...nextB],
            current: v, neighbors: [], activeEdge: [u, v],
            phase: "done", codeHL: [17, 18, 19], path: fullPath, meetNode: v,
            direction: "backward", levelF, levelB, expanded,
            finalized: new Set([...visitedF, ...visitedB]),
          });
          break;
        }
      }
      if (!found && nbs.length > 0) {
        steps.push({
          title: `Backward: Expand Node ${u} (Level ${levelB})`,
          detail: `Neighbors of ${u}: [${ADJ[u].join(",")}]. New: [${nbs.join(",")}]. Backward frontier grows.`,
          visitedF: new Set(visitedF), visitedB: new Set(visitedB),
          queueF: [...queueF], queueB: [...nextB],
          current: u, neighbors: nbs.map(v => [v]), activeEdge: null,
          phase: "expandB", codeHL: [15, 16, 17, 18, 19], path: [], meetNode: null,
          direction: "backward", levelF, levelB, expanded,
          finalized: new Set([...visitedF, ...visitedB]),
        });
      }
    }
    queueB = nextB;
  }
  return steps;
}

/* ─── Build Standard BFS Steps ─── */
function buildStandardBFSSteps() {
  const steps = [];
  const visited = new Set([SOURCE]);
  const parent = { [SOURCE]: null };
  let queue = [SOURCE];
  let level = 0, expanded = 0;

  steps.push({
    title: "Initialize – Standard BFS from Source",
    detail: `Queue = [${SOURCE}]. Single-direction BFS expands level by level until target found.`,
    visitedF: new Set(visited), visitedB: new Set(),
    queueF: [...queue], queueB: [],
    current: null, neighbors: [], activeEdge: null,
    phase: "init", codeHL: [2, 3, 4, 5], path: [], meetNode: null,
    direction: "forward", levelF: 0, levelB: 0, expanded: 0,
    finalized: new Set(visited),
  });

  let found = false;
  while (queue.length && !found) {
    const nextQ = [];
    level++;
    for (const u of queue) {
      if (found) break;
      const nbs = [];
      for (const v of ADJ[u]) {
        if (visited.has(v)) continue;
        visited.add(v); parent[v] = u; nextQ.push(v); nbs.push(v); expanded++;
        if (v === TARGET) {
          found = true;
          const path = []; let c = v; while (c !== null) { path.unshift(c); c = parent[c]; }
          steps.push({
            title: `✓ Target Found at Node ${v} (Level ${level})`,
            detail: `Standard BFS reached target. Path: ${path.join("→")}. ${expanded} expansions — compare with bidirectional.`,
            visitedF: new Set(visited), visitedB: new Set(),
            queueF: [...nextQ], queueB: [],
            current: v, neighbors: [], activeEdge: [u, v],
            phase: "done", codeHL: [11, 12, 13], path, meetNode: null,
            direction: "forward", levelF: level, levelB: 0, expanded,
            finalized: new Set(visited),
          });
          break;
        }
      }
      if (!found && nbs.length > 0) {
        steps.push({
          title: `Expand Node ${u} (Level ${level})`,
          detail: `Neighbors of ${u}: [${ADJ[u].join(",")}]. New: [${nbs.join(",")}]. ${expanded} expansions so far.`,
          visitedF: new Set(visited), visitedB: new Set(),
          queueF: [...nextQ], queueB: [],
          current: u, neighbors: nbs.map(v => [v]), activeEdge: null,
          phase: "expandF", codeHL: [8, 9, 10, 11], path: [], meetNode: null,
          direction: "forward", levelF: level, levelB: 0, expanded,
          finalized: new Set(visited),
        });
      }
    }
    queue = nextQ;
  }
  return steps;
}

/* ─── Graph SVG ─── */
function GraphView({ step }) {
  const { visitedF, visitedB, current, path, meetNode, neighbors, direction } = step;
  const pathSet = new Set(path.map(String));
  const pathEdges = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    pathEdges.add(`${path[i]}-${path[i+1]}`);
    pathEdges.add(`${path[i+1]}-${path[i]}`);
  }
  const nbSet = new Set((neighbors || []).map(([v]) => v));

  return (
    <svg viewBox="0 0 520 340" className="w-full" style={{ maxHeight: 230 }}>
      {EDGES.map(([u, v], i) => {
        const f = POS[u], t = POS[v];
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx*dx+dy*dy);
        const r = 20;
        const sx = f.x+(dx/len)*r, sy = f.y+(dy/len)*r;
        const ex = t.x-(dx/len)*r, ey = t.y-(dy/len)*r;
        const isPath = pathEdges.has(`${u}-${v}`);
        const color = isPath ? "#10b981" : "#27272a";
        return (
          <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke={color}
            strokeWidth={isPath ? 3.5 : 1.5} />
        );
      })}
      {POS.map((pos, id) => {
        const isMeet = id === meetNode;
        const isCurr = id === current;
        const isNb = nbSet.has(id);
        const isPath = pathSet.has(String(id));
        const inF = visitedF.has(id);
        const inB = visitedB.has(id);
        const both = inF && inB;

        let fill, stroke;
        if (isMeet) { fill = "#10b981"; stroke = "#059669"; }
        else if (isPath && step.phase === "done") { fill = "#10b981"; stroke = "#059669"; }
        else if (isCurr) { fill = direction === "forward" ? "#3b82f6" : "#f59e0b"; stroke = direction === "forward" ? "#2563eb" : "#d97706"; }
        else if (isNb) { fill = direction === "forward" ? "#1d4ed8" : "#b45309"; stroke = direction === "forward" ? "#3b82f6" : "#f59e0b"; }
        else if (both) { fill = "#7c3aed"; stroke = "#6d28d9"; }
        else if (inF) { fill = "#1e3a5f"; stroke = "#3b82f6"; }
        else if (inB) { fill = "#422006"; stroke = "#f59e0b"; }
        else { fill = "#18181b"; stroke = "#3f3f46"; }

        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={18} fill={fill} stroke={stroke} strokeWidth={isMeet ? 4 : 2.5} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
              fill="#fff" fontSize="14" fontWeight="700" fontFamily="monospace">{id}</text>
            {id === SOURCE && !isMeet && <text x={pos.x} y={pos.y - 26} textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="600">SRC</text>}
            {id === TARGET && !isMeet && <text x={pos.x} y={pos.y - 26} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">TGT</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Python Code (clean function) ─── */
const CODE = [
  { id: 0,  text: `from collections import deque` },
  { id: 1,  text: `` },
  { id: 2,  text: `def bidir_bfs(adj, src, tgt):` },
  { id: 3,  text: `    qF, qB = deque([src]), deque([tgt])` },
  { id: 4,  text: `    visF, visB = {src}, {tgt}` },
  { id: 5,  text: `    parF, parB = {src: None}, {tgt: None}` },
  { id: 6,  text: `` },
  { id: 7,  text: `    while qF and qB:` },
  { id: 8,  text: `        nxF = []` },
  { id: 9,  text: `        for u in qF:` },
  { id: 10, text: `            for v in adj[u]:` },
  { id: 11, text: `                if v not in visF:` },
  { id: 12, text: `                    visF.add(v)` },
  { id: 13, text: `                    parF[v] = u` },
  { id: 14, text: `                    if v in visB:` },
  { id: 15, text: `                        return build_path(parF, parB, v)` },
  { id: 16, text: `                    nxF.append(v)` },
  { id: 17, text: `        qF = nxF` },
  { id: 18, text: `` },
  { id: 19, text: `        nxB = []` },
  { id: 20, text: `        for u in qB:` },
  { id: 21, text: `            for v in adj[u]:` },
  { id: 22, text: `                if v not in visB:` },
  { id: 23, text: `                    visB.add(v)` },
  { id: 24, text: `                    parB[v] = u` },
  { id: 25, text: `                    if v in visF:` },
  { id: 26, text: `                        return build_path(parF, parB, v)` },
  { id: 27, text: `                    nxB.append(v)` },
  { id: 28, text: `        qB = nxB` },
  { id: 29, text: `` },
  { id: 30, text: `    return None` },
];

/* ─── IO Panel ─── */
function IOPanel({ step, mode }) {
  const { phase, expanded, path, finalized } = step;
  const done = phase === "done";
  const expected = mode === "bidirectional" ? EXPECTED_BI : EXPECTED_STD;
  const allMatch = done && path.length > 0 && path.length - 1 === expected.path.length - 1;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">adj</span> = {"{"}</div>
          {ADJ.map((nbs, node) => (
            <div key={node} className="pl-3">
              <span className="text-zinc-500">{node}:</span>{" "}
              <span className="text-zinc-300">[{nbs.join(",")}]</span>
            </div>
          ))}
          <div>{"}"}</div>
          <div><span className="text-zinc-500">src</span> = <span className="text-blue-400">{SOURCE}</span>  <span className="text-zinc-500">tgt</span> = <span className="text-amber-400">{TARGET}</span></div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">length  </span> = <span className="text-zinc-300">{expected.path.length - 1}</span></div>
          <div><span className="text-zinc-500">expanded</span> = <span className="text-zinc-300">{expected.expanded}</span></div>
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
            <span className="text-zinc-500">length  </span> = {done && path.length > 0
              ? <span className="text-emerald-300 font-bold">{path.length - 1}</span>
              : <span className="text-zinc-600">?</span>}
          </div>
          <div>
            <span className="text-zinc-500">expanded</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{expanded}</span>
            <span className="text-zinc-700"> / {expected.expanded}</span>
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
export default function BidirectionalBFSViz() {
  const [mode, setMode] = useState("bidirectional");
  const [si, setSi] = useState(0);
  const stepsBi = useMemo(() => buildBidirectionalSteps(), []);
  const stepsStd = useMemo(() => buildStandardBFSSteps(), []);
  const steps = mode === "bidirectional" ? stepsBi : stepsStd;
  const step = steps[Math.min(si, steps.length - 1)];

  const switchMode = (m) => { setMode(m); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* ═══ 1. Header ═══ */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bidirectional BFS</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Search from Both Ends – Meet in the Middle</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => switchMode("bidirectional")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "bidirectional" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              Bidirectional
            </button>
            <button onClick={() => switchMode("standard")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "standard" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              Standard BFS
            </button>
          </div>
        </div>

        {/* ═══ 2. Core Idea ═══ */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            {mode === "bidirectional"
              ? "Run BFS simultaneously from source and target. When the two frontiers touch, the shortest path is found. With branching factor b and depth d, standard BFS explores O(bᵈ) nodes — bidirectional explores only O(bᵈ⸍²) from each side, an exponential reduction."
              : "Standard BFS expands one level at a time from the source. It guarantees the shortest path in unweighted graphs, but explores all directions equally — often visiting many irrelevant nodes before reaching the target."
            }
          </p>
        </div>

        {/* ═══ 3. Navigation ═══ */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 4. 3-Column Grid ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Graph ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} mode={mode} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{N}N, {EDGES.length}E • src={SOURCE} tgt={TARGET}</div>
              <GraphView step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1e3a5f] border border-blue-500 inline-block" />Forward</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#422006] border border-amber-500 inline-block" />Backward</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />Both</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Path</span>
              </div>
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                {step.direction && (
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                    step.direction === "forward" ? "bg-blue-900 text-blue-300" : "bg-amber-900 text-amber-300"
                  }`}>{step.direction}</span>
                )}
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "expandF" ? "bg-blue-900 text-blue-300" :
                  step.phase === "expandB" ? "bg-amber-900 text-amber-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase === "expandF" ? "expand" : step.phase === "expandB" ? "expand" : step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Queues */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1.5">Forward Queue</div>
                  <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                    {step.queueF.length > 0 ? step.queueF.map((n, i) => (
                      <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-xs">{n}</span>
                    )) : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Backward Queue</div>
                  <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                    {step.queueB.length > 0 ? step.queueB.map((n, i) => (
                      <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-amber-950 border border-amber-800 text-amber-300 font-mono font-bold text-xs">{n}</span>
                    )) : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div>
              <div className="flex gap-4">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-blue-400">{step.visitedF.size}</div>
                  <div className="text-[9px] text-zinc-600">fwd visited</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-amber-400">{step.visitedB.size}</div>
                  <div className="text-[9px] text-zinc-600">bwd visited</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-purple-400">{step.expanded}</div>
                  <div className="text-[9px] text-zinc-600">expanded</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-emerald-400">{step.path.length > 0 ? step.path.length - 1 : "—"}</div>
                  <div className="text-[9px] text-zinc-600">path len</div>
                </div>
              </div>
            </div>

            {/* Final path */}
            {step.phase === "done" && step.path.length > 0 && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
                  Shortest Path {SOURCE} → {TARGET}
                  {step.meetNode !== null && <span className="text-zinc-500 ml-2">(meet at {step.meetNode})</span>}
                </div>
                <div className="font-mono text-[10px] text-emerald-300">
                  {step.path.join(" → ")}
                </div>
                <div className="mt-2 flex gap-4 text-[10px]">
                  <span className="text-zinc-500">Length: <span className="text-emerald-300 font-bold">{step.path.length - 1}</span></span>
                  <span className="text-zinc-500">Expanded: <span className="text-purple-300 font-bold">{step.expanded}</span></span>
                  <span className="text-zinc-500">vs Standard: <span className="text-blue-300 font-bold">{EXPECTED_STD.expanded}</span></span>
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
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Shortest path between two specific nodes in an unweighted graph</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Large graphs where standard BFS is too slow (social networks, word ladders)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>State-space search with known start and goal states</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>When the graph is implicitly defined (generated on the fly)</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(b^(d/2)) vs O(b^d) for standard BFS</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(b^(d/2)) for each frontier</div>
                <div><span className="text-zinc-500 font-semibold">Requires:</span> Known target + reversible edges</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 127 — Word Ladder</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 126 — Word Ladder II</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 752 — Open the Lock</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 433 — Minimum Genetic Mutation</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1345 — Jump Game IV</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 815 — Bus Routes</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
