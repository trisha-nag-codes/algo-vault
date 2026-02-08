import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   Eulerian Path / Circuit — Algorithm + 2 Problem Showcase
   1. Algorithm (Circuit/Path variant toggle)
   2. LC 332 — Reconstruct Itinerary        — Hierholzer on airports
   3. LC 2097 — Valid Arrangement of Pairs   — Euler path on pairs
   ═══════════════════════════════════════════════════════════ */

/* ─── Shared Hierholzer step builder ─── */
function buildHierholzerSteps(n, edges, start, labels, codeHLs) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adj[u].push(v);
  for (let i = 0; i < n; i++) adj[i].sort((a, b) => a - b);

  const L = (x) => labels ? labels[x] : x;
  const steps = [];
  const remaining = adj.map(a => [...a]);
  const stack = [start];
  const circuit = [];
  const usedEdges = [];
  const finalized = new Set();

  const snap = (extra) => ({
    stack: [...stack], circuit: [...circuit], remaining: remaining.map(a => [...a]),
    usedEdges: [...usedEdges], adjList: remaining.map(a => [...a]),
    finalized: new Set(finalized), ...extra,
  });

  steps.push(snap({
    title: `Initialize \u2014 Start at ${L(start)}`,
    detail: `${edges.length} directed edges. Hierholzer's: greedily follow unused edges, when stuck prepend to circuit. Stack: [${L(start)}].`,
    current: null, activeEdge: null, phase: "init", codeHL: codeHLs.init,
  }));

  while (stack.length > 0) {
    const v = stack[stack.length - 1];
    if (remaining[v].length > 0) {
      const u = remaining[v].shift();
      stack.push(u);
      usedEdges.push([v, u]);

      steps.push(snap({
        title: `Follow Edge ${L(v)}\u2192${L(u)}`,
        detail: `${L(v)} has unused edges: pick ${L(v)}\u2192${L(u)}. Push ${L(u)}. Remaining from ${L(v)}: [${remaining[v].map(x => L(x)).join(",")}].`,
        current: v, activeEdge: [v, u], phase: "follow", codeHL: codeHLs.follow,
      }));
    } else {
      stack.pop();
      circuit.unshift(v);
      if (circuit.length >= 2) finalized.add(`${circuit[0]}-${circuit[1]}`);

      steps.push(snap({
        title: `${L(v)} \u2014 No Unused Edges, Add to Circuit`,
        detail: `Pop ${L(v)}, prepend to circuit. Circuit: [${circuit.map(x => L(x)).join(" \u2192 ")}].`,
        current: v, activeEdge: null, phase: "circuit", codeHL: codeHLs.circuit,
      }));
    }
  }

  const isCircuit = circuit.length > 0 && circuit[0] === circuit[circuit.length - 1];
  steps.push(snap({
    title: `\u2713 Complete \u2014 Euler ${isCircuit ? "Circuit" : "Path"} Found`,
    detail: `All ${edges.length} edges used exactly once. Path: ${circuit.map(x => L(x)).join(" \u2192 ")}.`,
    current: null, activeEdge: null, phase: "done", codeHL: codeHLs.done,
  }));

  return steps;
}

/* ─────────────────────────────────────────────
   ALGORITHM TAB: Circuit / Path variant toggle
   ───────────────────────────────────────────── */
const ALG_VARIANTS = {
  circuit: {
    label: "Circuit", n: 5,
    edges: [[0,1],[1,2],[2,0],[0,3],[3,4],[4,0]],
    positions: [{x:200,y:50},{x:340,y:130},{x:280,y:270},{x:120,y:270},{x:60,y:130}],
    desc: "All in-degree = out-degree \u2192 circuit (starts & ends same node)",
    start: 0, expectedPath: [0,1,2,0,3,4,0],
  },
  path: {
    label: "Path", n: 4,
    edges: [[0,1],[1,2],[2,0],[0,3]],
    positions: [{x:80,y:80},{x:280,y:80},{x:180,y:220},{x:380,y:220}],
    desc: "Node 0: out\u2212in=1 (start), Node 3: in\u2212out=1 (end) \u2192 path",
    start: 0, expectedPath: [0,1,2,0,3],
  },
};

function buildAlgSteps(variant) {
  const v = ALG_VARIANTS[variant];
  return buildHierholzerSteps(v.n, v.edges, v.start, null, {
    init: [0, 1], follow: [3, 4, 5, 6, 7], circuit: [8, 9, 10], done: [12],
  });
}

/* ─────────────────────────────────────────────
   LC 332: Reconstruct Itinerary
   tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]
   Cities: ATL(0), JFK(1), SFO(2)
   Expected: JFK->ATL->JFK->SFO->ATL->SFO = [1,0,1,2,0,2]
   ───────────────────────────────────────────── */
const P1_LABELS = ["ATL", "JFK", "SFO"];
const P1_N = 3;
const P1_EDGES = [[0,1],[0,2],[1,0],[1,2],[2,0]]; // ATL->JFK, ATL->SFO, JFK->ATL, JFK->SFO, SFO->ATL
const P1_POS = [{x:220,y:240},{x:100,y:60},{x:340,y:60}]; // ATL bottom, JFK top-left, SFO top-right
const P1_START = 1; // JFK
const P1_EXPECTED = [1,0,1,2,0,2]; // JFK->ATL->JFK->SFO->ATL->SFO

function buildP1Steps() {
  return buildHierholzerSteps(P1_N, P1_EDGES, P1_START, P1_LABELS, {
    init: [0, 1, 2], follow: [4, 5, 6, 7], circuit: [8, 9, 10], done: [13],
  });
}

/* ─────────────────────────────────────────────
   LC 2097: Valid Arrangement of Pairs
   pairs = [[5,1],[4,5],[11,9],[9,4]]
   Nodes: 1(0),4(1),5(2),9(3),11(4)
   Edges: 2->0, 1->2, 4->3, 3->1
   Start: 11(4), End: 1(0)
   Path: 11->9->4->5->1 = [4,3,1,2,0]
   ───────────────────────────────────────────── */
const P2_PAIRS = [[5,1],[4,5],[11,9],[9,4]];
const P2_LABELS = [1,4,5,9,11]; // sorted unique values
const P2_N = 5;
const P2_EDGES = [[2,0],[1,2],[4,3],[3,1]]; // 5->1, 4->5, 11->9, 9->4
const P2_POS = [{x:420,y:220},{x:180,y:220},{x:300,y:140},{x:300,y:60},{x:100,y:60}];
const P2_START = 4; // node 11 (out-in=1)
const P2_EXPECTED = [4,3,1,2,0]; // 11->9->4->5->1
const P2_EXPECTED_PAIRS = [[11,9],[9,4],[4,5],[5,1]];

function buildP2Steps() {
  return buildHierholzerSteps(P2_N, P2_EDGES, P2_START, P2_LABELS, {
    init: [0, 1, 2], follow: [5, 6, 7], circuit: [8, 9, 10], done: [13],
  });
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title: "Algorithm", lc: null, difficulty: null, tag: "Hierholzer",
    hasVariant: true,
    coreIdea: "Hierholzer's finds an Eulerian path/circuit by greedily following unused edges. When stuck (no remaining edges), prepend node to result and backtrack. Circuit exists when all nodes have equal in/out-degree; path exists when exactly two nodes differ by 1.",
    buildSteps: buildAlgSteps,
    code: [
      {id:0,text:"def hierholzer(adj, start):"},{id:1,text:"    stack = [start]"},
      {id:2,text:"    circuit = []"},
      {id:3,text:"    while stack:"},{id:4,text:"        v = stack[-1]"},
      {id:5,text:"        if adj[v]:"},{id:6,text:"            u = adj[v].pop(0)"},
      {id:7,text:"            stack.append(u)"},
      {id:8,text:"        else:"},{id:9,text:"            stack.pop()"},
      {id:10,text:"            circuit.insert(0, v)"},{id:11,text:""},
      {id:12,text:"    return circuit"},
    ],
  },
  itinerary: {
    title: "Reconstruct Itinerary", lc: "332", difficulty: "Hard", tag: "Airports",
    hasVariant: false,
    coreIdea: "Given airline tickets as [from, to] pairs, find the itinerary starting from \"JFK\" that uses all tickets exactly once. This is an Euler path on a directed multigraph. Sort destinations lexicographically and apply Hierholzer's from JFK.",
    buildSteps: buildP1Steps,
    n: P1_N, edges: P1_EDGES, positions: P1_POS, labels: P1_LABELS,
    expectedPath: P1_EXPECTED, start: P1_START,
    code: [
      {id:0,text:"def findItinerary(tickets):"},{id:1,text:"    adj = defaultdict(list)"},
      {id:2,text:"    for f, t in sorted(tickets):"},
      {id:3,text:"        adj[f].append(t)  # lex order"},
      {id:4,text:"    stack = ['JFK']"},{id:5,text:"    route = []"},
      {id:6,text:"    while stack:"},{id:7,text:"        while adj[stack[-1]]:"},
      {id:8,text:"            stack.append(adj[stack[-1]].pop(0))"},
      {id:9,text:"        route.insert(0, stack.pop())"},
      {id:10,text:"    return route"},{id:11,text:""},
      {id:12,text:"    # Key: sort destinations lex"},
      {id:13,text:"    # Hierholzer from 'JFK'"},
    ],
  },
  pairs: {
    title: "Valid Arrangement", lc: "2097", difficulty: "Hard", tag: "Pairs",
    hasVariant: false,
    coreIdea: "Given pairs [[a,b],[c,d],...], arrange so end[i]==start[i+1]. Build directed graph (a\u2192b for each pair). Find Euler path: start at node with out\u2212in=1 (or any if circuit). The path edges give the valid arrangement.",
    buildSteps: buildP2Steps,
    n: P2_N, edges: P2_EDGES, positions: P2_POS, labels: P2_LABELS,
    expectedPath: P2_EXPECTED, start: P2_START,
    code: [
      {id:0,text:"def validArrangement(pairs):"},{id:1,text:"    adj = defaultdict(deque)"},
      {id:2,text:"    in_d, out_d = Counter(), Counter()"},
      {id:3,text:"    for a, b in pairs:"},
      {id:4,text:"        adj[a].append(b)"},
      {id:5,text:"        out_d[a]+=1; in_d[b]+=1"},
      {id:6,text:"    start = find out-in==1 node"},
      {id:7,text:"    stack = [start]; path = []"},
      {id:8,text:"    while stack:"},{id:9,text:"        if adj[stack[-1]]:"},
      {id:10,text:"            stack.append(adj[..].popleft())"},
      {id:11,text:"        else: path.insert(0,stack.pop())"},
      {id:12,text:"    return [[path[i],path[i+1]]"},
      {id:13,text:"            for i in range(len(path)-1)]"},
    ],
  },
};

/* ═══════════════════════════════════════════
   GRAPH SVG
   ═══════════════════════════════════════════ */
function GraphView({ step, positions, edges, labels }) {
  const { activeEdge, usedEdges, circuit } = step;
  const usedSet = new Set(usedEdges.map(([u, v]) => `${u}-${v}`));
  const circuitEdges = new Set();
  for (let i = 0; i < circuit.length - 1; i++) circuitEdges.add(`${circuit[i]}-${circuit[i + 1]}`);
  const L = (x) => labels ? labels[x] : x;

  return (
    <svg viewBox="0 0 440 300" className="w-full" style={{ maxHeight: 230 }}>
      {edges.map(([u, v], i) => {
        const f = positions[u], t = positions[v];
        if (!f || !t) return null;
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        const r = 20;
        const sx = f.x + (dx / len) * r, sy = f.y + (dy / len) * r;
        const ex = t.x - (dx / len) * r, ey = t.y - (dy / len) * r;
        const key = `${u}-${v}`;
        const isActive = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
        const isUsed = usedSet.has(key);
        const isCircuit = step.phase === "done" && circuitEdges.has(key);
        const color = isActive ? "#f59e0b" : isCircuit ? "#10b981" : isUsed ? "#52525b" : "#3f3f46";
        const markerId = `ea-${labels ? labels[0] : "a"}-${i}`;
        return (
          <g key={i}>
            <defs><marker id={markerId} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0,7 2.5,0 5" fill={color} /></marker></defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color}
              strokeWidth={isActive ? 3 : isCircuit ? 2.5 : 1.5}
              markerEnd={`url(#${markerId})`}
              strokeDasharray={isUsed && !isActive && !isCircuit ? "4,3" : "none"} />
          </g>
        );
      })}
      {positions.map((pos, id) => {
        if (!pos) return null;
        const onStack = step.stack.includes(id);
        const isCurr = step.current === id;
        const fill = isCurr ? "#f59e0b" : onStack ? "#3b82f6" : "#27272a";
        const stroke = isCurr ? "#d97706" : onStack ? "#2563eb" : "#52525b";
        const label = String(L(id));
        const fs = label.length > 2 ? 10 : 14;
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={18} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={fs} fontWeight="700" fontFamily="monospace">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════
   IO PANEL
   ═══════════════════════════════════════════ */
function IOPanel({ step, pKey, problem, variantData }) {
  const { phase, circuit, usedEdges } = step;
  const done = phase === "done";

  // Determine edges/expected/labels based on problem type
  let edgeCount, expectedPath, labels, n;
  if (pKey === "algorithm") {
    const vd = variantData;
    edgeCount = vd.edges.length;
    expectedPath = vd.expectedPath;
    labels = null;
    n = vd.n;
  } else {
    edgeCount = problem.edges.length;
    expectedPath = problem.expectedPath;
    labels = problem.labels;
    n = problem.n;
  }
  const L = (x) => labels ? labels[x] : x;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5">
          <div><span className="text-zinc-500">nodes</span>= <span className="text-blue-400">{n}</span></div>
          <div><span className="text-zinc-500">edges</span>= <span className="text-zinc-300">{edgeCount} directed</span></div>
          {pKey === "itinerary" && <div><span className="text-zinc-500">start</span>= <span className="text-blue-400">JFK</span></div>}
          {pKey === "pairs" && <div><span className="text-zinc-500">pairs</span>= <span className="text-zinc-300">{P2_PAIRS.map(p => `[${p}]`).join(",")}</span></div>}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">path = </span>
          <span className="text-zinc-300">[{expectedPath.map(x => L(x)).join("\u2192")}]</span>
        </div>
        {pKey === "pairs" && (
          <div className="font-mono text-[11px] mt-0.5">
            <span className="text-zinc-500">pairs= </span>
            <span className="text-zinc-300">{P2_EXPECTED_PAIRS.map(p => `[${p}]`).join(",")}</span>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{"\u2713"} DONE</span>}
        </div>
        <div className="font-mono text-[11px] flex items-center gap-0.5 flex-wrap">
          <span className="text-zinc-500">[</span>
          {circuit.length === 0
            ? <span className="text-zinc-700">...</span>
            : circuit.map((v, i) => (
                <span key={i} className="flex items-center">
                  <span className={done ? "text-emerald-300 font-bold" : "text-zinc-400"}>{L(v)}</span>
                  {i < circuit.length - 1 && <span className="text-zinc-600">{"\u2192"}</span>}
                </span>
              ))
          }
          <span className="text-zinc-500">]</span>
        </div>
        <div className="mt-1.5 text-[10px] text-zinc-600">
          Edges used: {usedEdges.length}/{edgeCount}
        </div>
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
export default function EulerianViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [variant, setVariant] = useState("circuit");
  const [si, setSi] = useState(0);

  const problem = PROBLEMS[pKey];
  const variantData = pKey === "algorithm" ? ALG_VARIANTS[variant] : null;

  const steps = useMemo(() => {
    if (pKey === "algorithm") return problem.buildSteps(variant);
    return problem.buildSteps();
  }, [pKey, variant]);

  const step = steps[Math.min(si, steps.length - 1)];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  // Resolve positions/edges/labels for current view
  const positions = pKey === "algorithm" ? variantData.positions : problem.positions;
  const edges = pKey === "algorithm" ? variantData.edges : problem.edges;
  const labels = pKey === "algorithm" ? null : problem.labels;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Eulerian Path / Circuit</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Hierholzer's Algorithm {"\u2022"} Visit Every Edge Exactly Once</p>
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

        {/* Core Idea + Variant Toggle */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
            {problem.difficulty && <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              problem.difficulty === "Hard" ? "bg-red-900/50 text-red-400" : "bg-amber-900/50 text-amber-400"
            }`}>{problem.difficulty}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">{problem.tag}</span>
            {pKey === "algorithm" && (
              <div className="flex gap-1 ml-auto">
                {Object.entries(ALG_VARIANTS).map(([k, v]) => (
                  <button key={k} onClick={() => { setVariant(k); setSi(0); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      variant === k ? "bg-emerald-700 text-white" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                    }`}>
                    {k === "circuit" ? "\u2713 Circuit" : "\u2197 Path"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            {problem.coreIdea}
            {pKey === "algorithm" && <span className="block mt-1 text-zinc-500 text-xs italic">{variantData.desc}</span>}
          </p>
        </div>

        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        <div className="grid grid-cols-12 gap-3">
          {/* COL 1: IO + Graph */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} pKey={pKey} problem={problem} variantData={variantData} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{positions.length}N, {edges.length}E {"\u2022"} directed</div>
              <GraphView step={step} positions={positions} edges={edges} labels={labels} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />On Stack</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 inline-block" style={{ borderRadius: 1 }} />Circuit</span>
              </div>
            </div>
          </div>

          {/* COL 2: Steps + State */}
          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
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
                  const L = (x) => labels ? labels[x] : x;
                  const isCurr = step.current === node;
                  const isEmpty = nb.length === 0;
                  return (
                    <div key={node} className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-xs ${
                      isCurr ? "bg-amber-950/50 border border-amber-900" : "border border-transparent"
                    }`}>
                      <span className={isCurr ? "text-amber-400 font-bold w-8" : "text-zinc-400 w-8"}>{L(node)}</span>
                      <span className="text-zinc-600">{"\u2192"} [</span>
                      {isEmpty
                        ? <span className="text-zinc-700 italic text-[10px]">empty</span>
                        : nb.map((v, i) => (
                            <span key={i}>
                              <span className="text-zinc-400">{L(v)}</span>
                              {i < nb.length - 1 && <span className="text-zinc-700">, </span>}
                            </span>
                          ))
                      }
                      <span className="text-zinc-600">]</span>
                      {isEmpty && <span className="text-[8px] text-zinc-700 ml-auto">{"\u2713"} done</span>}
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
                      ? step.stack.map((nd, i) => {
                          const L = (x) => labels ? labels[x] : x;
                          return (
                            <span key={i} className="inline-flex items-center justify-center min-w-[28px] h-7 px-1 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-xs">{L(nd)}</span>
                          );
                        })
                      : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-1.5">Circuit</div>
                  <div className="flex gap-0.5 min-h-[28px] items-center flex-wrap">
                    {step.circuit.length > 0
                      ? step.circuit.map((nd, i) => {
                          const L = (x) => labels ? labels[x] : x;
                          return (
                            <span key={i} className="flex items-center gap-0.5">
                              <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-1 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs">{L(nd)}</span>
                              {i < step.circuit.length - 1 && <span className="text-emerald-800 text-[10px]">{"\u2192"}</span>}
                            </span>
                          );
                        })
                      : <span className="text-[10px] text-zinc-600 italic">building...</span>}
                  </div>
                </div>
              </div>
            </div>
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
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Visit every edge exactly once {"\u2014"} Euler path or circuit</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>De Bruijn sequences / DNA fragment assembly</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Chinese Postman Problem (after edge duplication)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Circuit board routing, network traversal</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V + E)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V + E)</div>
                <div><span className="text-zinc-500 font-semibold">Existence:</span> Circuit if all deg equal; Path if exactly 2 differ</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 332 {"\u2014"} Reconstruct Itinerary</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 2097 {"\u2014"} Valid Arrangement of Pairs</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 753 {"\u2014"} Cracking the Safe (de Bruijn)</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1971 {"\u2014"} Find if Path Exists</span><span className="ml-auto text-[10px] text-green-700">Easy</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 2374 {"\u2014"} Node With Highest Edge Score</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1976 {"\u2014"} Ways to Arrive at Destination</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}