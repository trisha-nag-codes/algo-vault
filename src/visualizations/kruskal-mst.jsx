import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   Kruskal's Algorithm — Algorithm + 2 Problem Showcase
   1. Algorithm                       — 6-node weighted graph, build MST
   2. LC 1584 — Min Cost Connect All  — Manhattan dist, full Kruskal
   3. LC 1489 — Critical & Pseudo-Crit— edge classification via MST
   ═══════════════════════════════════════════════════════════ */

/* ─── Shared Kruskal engine ─── */
function runKruskal(n, edges, skip, force) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const union = (a, b) => {
    let ra = find(a), rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    if (rank[ra] === rank[rb]) rank[ra]++;
    return true;
  };
  let cost = 0, cnt = 0;
  const mst = [];
  if (force !== undefined) {
    const [u, v, w] = edges[force];
    union(u, v); cost += w; cnt++; mst.push(force);
  }
  const sorted = edges.map((e, i) => ({ e, i })).sort((a, b) => a.e[2] - b.e[2]);
  for (const { e: [u, v, w], i } of sorted) {
    if (i === skip || i === force) continue;
    if (union(u, v)) { cost += w; cnt++; mst.push(i); if (cnt === n - 1) break; }
  }
  const roots = new Set();
  for (let i = 0; i < n; i++) roots.add(find(i));
  return { cost, connected: roots.size === 1, mst };
}

/* ─── Step builder for standard Kruskal ─── */
function buildKruskalSteps(N, EDGES, codeHLs) {
  const sorted = [...EDGES].map((e, i) => ({ e, orig: i })).sort((a, b) => a.e[2] - b.e[2]);
  const parent = Array.from({ length: N }, (_, i) => i);
  const rank = new Array(N).fill(0);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };

  const steps = [];
  const mstEdges = [];
  let mstCost = 0;

  const snap = (extra) => ({
    parent: [...parent], rank: [...rank], mstEdges: [...mstEdges],
    sortedEdges: sorted.map(s => [...s.e]), mstCost, ...extra,
  });

  steps.push(snap({
    title: "Initialize \u2014 Sort Edges by Weight",
    detail: `${EDGES.length} edges sorted ascending. Initialize Union-Find with ${N} singletons.`,
    edgeIdx: -1, currentEdge: null, phase: "init", codeHL: codeHLs.init, verdict: null,
  }));

  for (let i = 0; i < sorted.length; i++) {
    const [u, v, w] = sorted[i].e;
    const ru = find(u), rv = find(v);
    const same = ru === rv;

    if (!same) {
      if (rank[ru] < rank[rv]) parent[ru] = rv;
      else if (rank[ru] > rank[rv]) parent[rv] = ru;
      else { parent[rv] = ru; rank[ru]++; }
      mstEdges.push([u, v, w]);
      mstCost += w;
    }

    steps.push(snap({
      title: same ? `Edge ${u}\u2013${v} (w=${w}) \u2014 Skip (Cycle)` : `Edge ${u}\u2013${v} (w=${w}) \u2014 Add to MST`,
      detail: same
        ? `find(${u})=${ru}, find(${v})=${rv}. Same component \u2014 cycle. Skip.`
        : `find(${u})=${ru}, find(${v})=${rv}. Different components \u2014 union. Cost: ${mstCost}.`,
      edgeIdx: i, currentEdge: [u, v, w],
      phase: same ? "skip" : "add",
      codeHL: same ? codeHLs.skip : codeHLs.add,
      verdict: same ? "cycle" : "added",
    }));

    if (mstEdges.length === N - 1) {
      steps.push(snap({
        title: `\u2713 MST Complete \u2014 ${N - 1} Edges, Cost ${mstCost}`,
        detail: `MST: [${mstEdges.map(([a, b, c]) => `${a}-${b}:${c}`).join(", ")}]. Total: ${mstCost}.`,
        edgeIdx: i, currentEdge: null, phase: "done", codeHL: codeHLs.done, verdict: null,
      }));
      break;
    }
  }
  return steps;
}

/* ─────────────────────────────────────────────
   ALGORITHM TAB: 6-node weighted graph
   ───────────────────────────────────────────── */
const ALG_N = 6;
const ALG_EDGES = [[1,2,1],[1,3,2],[0,2,3],[0,1,4],[2,3,4],[2,4,5],[3,5,6],[3,4,7],[4,5,8]];
const ALG_POS = [{x:60,y:80},{x:200,y:40},{x:200,y:180},{x:340,y:80},{x:340,y:220},{x:480,y:150}];
const ALG_EXPECTED = { mst: [[1,2,1],[1,3,2],[0,2,3],[2,4,5],[3,5,6]], cost: 17 };

function buildAlgSteps() {
  return buildKruskalSteps(ALG_N, ALG_EDGES, {
    init: [0, 1, 2], skip: [4, 5], add: [4, 5, 6, 7, 8], done: [10],
  });
}

/* ─────────────────────────────────────────────
   LC 1584: Min Cost to Connect All Points
   points = [[0,0],[2,2],[3,10],[5,2],[7,0]]
   Manhattan distance, expected cost = 20
   ───────────────────────────────────────────── */
const P1_POINTS = [[0,0],[2,2],[3,10],[5,2],[7,0]];
const P1_N = P1_POINTS.length;
const P1_EDGES = [];
for (let i = 0; i < P1_N; i++)
  for (let j = i + 1; j < P1_N; j++) {
    const d = Math.abs(P1_POINTS[i][0] - P1_POINTS[j][0]) + Math.abs(P1_POINTS[i][1] - P1_POINTS[j][1]);
    P1_EDGES.push([i, j, d]);
  }
const P1_POS = P1_POINTS.map(([x, y]) => ({ x: x * 55 + 60, y: y * 22 + 40 }));
const P1_EXPECTED_COST = 20;

function buildP1Steps() {
  return buildKruskalSteps(P1_N, P1_EDGES, {
    init: [0, 1, 2], skip: [5, 6], add: [5, 6, 7, 8], done: [10],
  });
}

/* ─────────────────────────────────────────────
   LC 1489: Find Critical & Pseudo-Critical Edges
   n=5, edges=[[0,1,1],[1,2,1],[2,3,2],[0,3,2],[0,4,3],[3,4,3],[1,4,6]]
   Base MST cost = 7
   Critical: [0,1], Pseudo: [2,3,4,5]
   ───────────────────────────────────────────── */
const P2_N = 5;
const P2_EDGES = [[0,1,1],[1,2,1],[2,3,2],[0,3,2],[0,4,3],[3,4,3],[1,4,6]];
const P2_POS = [{x:80,y:80},{x:220,y:40},{x:360,y:80},{x:360,y:220},{x:80,y:220}];
const P2_BASE_COST = 7;
const P2_EXPECTED_CRIT = [0, 1];
const P2_EXPECTED_PSEUDO = [2, 3, 4, 5];

function buildP2Steps() {
  const edges = P2_EDGES;
  const n = P2_N;
  const steps = [];

  const parent0 = Array.from({ length: n }, (_, i) => i);
  const rank0 = new Array(n).fill(0);

  const base = runKruskal(n, edges);

  steps.push({
    parent: [...parent0], rank: [...rank0], mstEdges: [], sortedEdges: edges,
    mstCost: 0, edgeIdx: -1, currentEdge: null,
    phase: "init", codeHL: [0, 1, 2], verdict: null,
    title: "Phase 1 \u2014 Find Base MST Cost",
    detail: `Run standard Kruskal to find base MST cost = ${base.cost}. Then classify each edge.`,
    classification: null, testEdge: null, testResult: null,
  });

  const sorted = [...edges].map((e, i) => ({ e, i })).sort((a, b) => a.e[2] - b.e[2]);
  const bp = Array.from({ length: n }, (_, i) => i);
  const br = new Array(n).fill(0);
  const bfind = (x) => { while (bp[x] !== x) { bp[x] = bp[bp[x]]; x = bp[x]; } return x; };
  let bc = 0;
  const bm = [];

  for (const { e: [u, v, w], i } of sorted) {
    const ru = bfind(u), rv = bfind(v);
    if (ru === rv) continue;
    if (br[ru] < br[rv]) bp[ru] = rv;
    else if (br[ru] > br[rv]) bp[rv] = ru;
    else { bp[rv] = ru; br[ru]++; }
    bc += w; bm.push([u, v, w]);

    steps.push({
      parent: [...bp], rank: [...br], mstEdges: [...bm], sortedEdges: edges,
      mstCost: bc, edgeIdx: -1, currentEdge: [u, v, w],
      phase: "add", codeHL: [4, 5, 6, 7], verdict: "added",
      title: `Base MST: Add ${u}\u2013${v} (w=${w}), cost=${bc}`,
      detail: `Building base MST. ${bm.length}/${n - 1} edges.`,
      classification: null, testEdge: null, testResult: null,
    });
    if (bm.length === n - 1) break;
  }

  steps.push({
    parent: [...bp], rank: [...br], mstEdges: [...bm], sortedEdges: edges,
    mstCost: bc, edgeIdx: -1, currentEdge: null,
    phase: "done", codeHL: [8], verdict: null,
    title: `Base MST Cost = ${bc}`,
    detail: `MST: [${bm.map(([a, b, c]) => `${a}-${b}:${c}`).join(", ")}]. Now classify each edge.`,
    classification: null, testEdge: null, testResult: null,
  });

  const classification = {};
  for (let i = 0; i < edges.length; i++) {
    const [u, v, w] = edges[i];
    const without = runKruskal(n, edges, i);
    const isCritical = !without.connected || without.cost > base.cost;

    if (isCritical) {
      classification[i] = "critical";
      steps.push({
        parent: [...bp], rank: [...br], mstEdges: [...bm], sortedEdges: edges,
        mstCost: bc, edgeIdx: -1, currentEdge: [u, v, w],
        phase: "classify", codeHL: [10, 11, 12], verdict: "critical",
        title: `Edge ${i}: ${u}\u2013${v}(w=${w}) \u2014 CRITICAL`,
        detail: `Remove: ${!without.connected ? "disconnected" : `cost=${without.cost} > ${base.cost}`}. Must be in every MST.`,
        classification: { ...classification }, testEdge: i, testResult: without,
      });
      continue;
    }

    const withForce = runKruskal(n, edges, undefined, i);
    const isPseudo = withForce.cost === base.cost;

    if (isPseudo) {
      classification[i] = "pseudo";
      steps.push({
        parent: [...bp], rank: [...br], mstEdges: [...bm], sortedEdges: edges,
        mstCost: bc, edgeIdx: -1, currentEdge: [u, v, w],
        phase: "classify", codeHL: [13, 14, 15], verdict: "pseudo",
        title: `Edge ${i}: ${u}\u2013${v}(w=${w}) \u2014 PSEUDO-CRITICAL`,
        detail: `Remove: ok (cost=${without.cost}). Force: cost=${withForce.cost}=${base.cost}. In some MST.`,
        classification: { ...classification }, testEdge: i, testResult: withForce,
      });
    } else {
      classification[i] = "neither";
      steps.push({
        parent: [...bp], rank: [...br], mstEdges: [...bm], sortedEdges: edges,
        mstCost: bc, edgeIdx: -1, currentEdge: [u, v, w],
        phase: "classify", codeHL: [16], verdict: "neither",
        title: `Edge ${i}: ${u}\u2013${v}(w=${w}) \u2014 NEITHER`,
        detail: `Remove: ok. Force: cost=${withForce.cost} > ${base.cost}. Not in any MST.`,
        classification: { ...classification }, testEdge: i, testResult: withForce,
      });
    }
  }

  const crit = Object.entries(classification).filter(([, v]) => v === "critical").map(([k]) => +k);
  const pseudo = Object.entries(classification).filter(([, v]) => v === "pseudo").map(([k]) => +k);

  steps.push({
    parent: [...bp], rank: [...br], mstEdges: [...bm], sortedEdges: edges,
    mstCost: bc, edgeIdx: -1, currentEdge: null,
    phase: "result", codeHL: [17], verdict: null,
    title: `\u2713 Critical: [${crit.join(",")}], Pseudo: [${pseudo.join(",")}]`,
    detail: `Critical (every MST): [${crit.join(",")}]. Pseudo (some MST): [${pseudo.join(",")}].`,
    classification: { ...classification }, testEdge: null, testResult: null,
  });

  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title: "Algorithm", lc: null, difficulty: null, tag: "MST Greedy",
    coreIdea: "Kruskal's builds an MST by greedily processing edges in ascending weight order. For each edge, if its endpoints are in different components (Union-Find check), add it and merge. Skip if it creates a cycle. Stop at N\u22121 edges. O(E log E) time dominated by sorting.",
    buildSteps: buildAlgSteps,
    n: ALG_N, edges: ALG_EDGES, positions: ALG_POS,
    expected: ALG_EXPECTED,
    code: [
      {id:0,text:"def kruskal(edges, n):"},{id:1,text:"    edges.sort(key=lambda e: e[2])"},
      {id:2,text:"    uf = UnionFind(n)"},{id:3,text:"    mst = []"},
      {id:4,text:"    for u, v, w in edges:"},{id:5,text:"        if uf.find(u) != uf.find(v):"},
      {id:6,text:"            uf.union(u, v)"},{id:7,text:"            mst.append((u, v, w))"},
      {id:8,text:"        if len(mst) == n - 1:"},{id:9,text:"            break"},
      {id:10,text:"    return mst"},
    ],
  },
  connect: {
    title: "Min Cost Connect Points", lc: "1584", difficulty: "Medium", tag: "Manhattan",
    coreIdea: "Given points on a 2D plane, connect all with minimum total Manhattan distance (|xi\u2212xj|+|yi\u2212yj|). Build all O(n\u00b2) pairwise edges with Manhattan weights, then run Kruskal. The answer is the MST total weight.",
    buildSteps: buildP1Steps,
    n: P1_N, edges: P1_EDGES, positions: P1_POS,
    expected: { cost: P1_EXPECTED_COST },
    code: [
      {id:0,text:"def minCostConnectPoints(pts):"},{id:1,text:"    n = len(pts)"},
      {id:2,text:"    edges = []"},{id:3,text:"    for i in range(n):"},
      {id:4,text:"        for j in range(i+1, n):"},
      {id:5,text:"            d = abs(pts[i][0]-pts[j][0])"},
      {id:6,text:"              + abs(pts[i][1]-pts[j][1])"},
      {id:7,text:"            edges.append((i, j, d))"},
      {id:8,text:"    edges.sort(key=lambda e: e[2])"},
      {id:9,text:"    # standard Kruskal"},
      {id:10,text:"    return total_mst_cost"},
    ],
  },
  critical: {
    title: "Critical & Pseudo-Critical", lc: "1489", difficulty: "Hard", tag: "Edge Classify",
    coreIdea: "Classify each edge as critical (in every MST), pseudo-critical (in some MST), or neither. Find base MST cost. For each edge: (1) remove it \u2014 if cost rises or disconnects, it's critical. (2) Force-include it \u2014 if cost stays same, it's pseudo-critical. O(E\u00b2 \u00b7 \u03b1(V)).",
    buildSteps: buildP2Steps,
    n: P2_N, edges: P2_EDGES, positions: P2_POS,
    expected: { critical: P2_EXPECTED_CRIT, pseudo: P2_EXPECTED_PSEUDO },
    code: [
      {id:0,text:"def findCritAndPseudo(n, edges):"},{id:1,text:"    base = kruskal(n, edges)"},
      {id:2,text:"    critical, pseudo = [], []"},{id:3,text:""},
      {id:4,text:"    # Phase 1: build base MST"},{id:5,text:"    for u,v,w in sorted(edges):"},
      {id:6,text:"        if find(u) != find(v):"},{id:7,text:"            union(u,v); cost += w"},
      {id:8,text:"    base_cost = cost"},{id:9,text:""},
      {id:10,text:"    # Phase 2: classify"},{id:11,text:"    for i, (u,v,w) in enum(edges):"},
      {id:12,text:"        skip i -> cost up? critical"},
      {id:13,text:"        force i -> cost same?"},
      {id:14,text:"            pseudo-critical"},
      {id:15,text:"        else: neither"},
      {id:16,text:"        # else: neither"},{id:17,text:"    return [critical, pseudo]"},
    ],
  },
};

/* ═══════════════════════════════════════════
   GRAPH SVG
   ═══════════════════════════════════════════ */
function GraphView({ step, problem, pKey }) {
  const { positions, edges } = problem;
  const { mstEdges, currentEdge, verdict, classification } = step;
  const mstSet = new Set(mstEdges.map(([u, v]) => `${Math.min(u, v)}-${Math.max(u, v)}`));

  return (
    <svg viewBox="0 0 540 280" className="w-full" style={{ maxHeight: 230 }}>
      {edges.map(([u, v, w], i) => {
        const pu = positions[u], pv = positions[v];
        if (!pu || !pv) return null;
        const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
        const isMST = mstSet.has(key);
        const isCurrent = currentEdge && ((currentEdge[0] === u && currentEdge[1] === v) || (currentEdge[0] === v && currentEdge[1] === u));
        const cls = classification ? classification[i] : null;
        const dx = pv.x - pu.x, dy = pv.y - pu.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        const r = 20;
        const sx = pu.x + (dx / len) * r, sy = pu.y + (dy / len) * r;
        const ex = pv.x - (dx / len) * r, ey = pv.y - (dy / len) * r;
        const mx = (sx + ex) / 2 + (dy / len) * 12, my = (sy + ey) / 2 - (dx / len) * 12;
        const color = cls === "critical" ? "#ef4444" : cls === "pseudo" ? "#f59e0b"
          : isCurrent ? (verdict === "added" || verdict === "critical" ? "#10b981" : verdict === "pseudo" ? "#f59e0b" : "#ef4444")
          : isMST ? "#10b981" : "#3f3f46";
        const sw = isMST || isCurrent || cls ? 3 : 1.5;
        return (
          <g key={i}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={sw}
              strokeDasharray={cls === "pseudo" ? "5,3" : cls === "neither" ? "3,3" : "none"} />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central"
              fill={isMST || isCurrent || cls ? "#e4e4e7" : "#71717a"}
              fontSize="10" fontWeight="600" fontFamily="monospace">{w}</text>
          </g>
        );
      })}
      {positions.map((pos, id) => {
        if (!pos) return null;
        const inMST = mstEdges.some(([u, v]) => u === id || v === id);
        const isCurrNode = currentEdge && (currentEdge[0] === id || currentEdge[1] === id);
        const fill = isCurrNode ? (verdict === "added" ? "#059669" : verdict === "critical" ? "#dc2626" : verdict === "pseudo" ? "#d97706" : "#dc2626") : "#27272a";
        const stroke = isCurrNode ? (verdict === "added" ? "#10b981" : verdict === "critical" ? "#ef4444" : verdict === "pseudo" ? "#f59e0b" : "#ef4444") : inMST ? "#10b981" : "#52525b";
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

/* ═══════════════════════════════════════════
   IO PANEL
   ═══════════════════════════════════════════ */
function IOPanel({ step, problem, pKey }) {
  const { phase, mstEdges, mstCost } = step;
  const done = phase === "done" || phase === "result";
  const exp = problem.expected;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5">
          <div><span className="text-zinc-500">n    </span>= <span className="text-blue-400">{problem.n}</span></div>
          <div><span className="text-zinc-500">edges</span>= <span className="text-zinc-300">{problem.edges.length}</span></div>
          {pKey === "connect" && <div><span className="text-zinc-500">type </span>= <span className="text-zinc-300">Manhattan</span></div>}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected</div>
        <div className="font-mono text-[11px] space-y-0.5">
          {exp.cost !== undefined && <div><span className="text-zinc-500">cost = </span><span className="text-zinc-300">{exp.cost}</span></div>}
          {exp.mst && <div><span className="text-zinc-500">edges= </span><span className="text-zinc-300">{exp.mst.length}</span></div>}
          {exp.critical && <div><span className="text-zinc-500">crit = </span><span className="text-red-300">[{exp.critical.join(",")}]</span></div>}
          {exp.pseudo && <div><span className="text-zinc-500">pseudo= </span><span className="text-amber-300">[{exp.pseudo.join(",")}]</span></div>}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{"\u2713"} DONE</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">cost = </span>
            <span className={done ? "text-emerald-300 font-bold" : mstCost > 0 ? "text-zinc-300" : "text-zinc-700"}>
              {mstCost > 0 ? mstCost : "?"}
            </span>
          </div>
          {mstEdges.length > 0 && (
            <div><span className="text-zinc-500">edges= </span><span className="text-zinc-300">{mstEdges.length}/{problem.n - 1}</span></div>
          )}
          {step.classification && (
            <div className="mt-1 space-y-0.5">
              <div><span className="text-zinc-500">crit  = </span>
                <span className="text-red-300 font-bold">[{Object.entries(step.classification).filter(([, v]) => v === "critical").map(([k]) => k).join(",")}]</span>
              </div>
              <div><span className="text-zinc-500">pseudo= </span>
                <span className="text-amber-300 font-bold">[{Object.entries(step.classification).filter(([, v]) => v === "pseudo").map(([k]) => k).join(",")}]</span>
              </div>
            </div>
          )}
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
export default function KruskalViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];
  const steps = useMemo(() => problem.buildSteps(), [pKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kruskal's Algorithm</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Minimum Spanning Tree {"\u2022"} Greedy + Union-Find</p>
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

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
            {problem.difficulty && <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              problem.difficulty === "Hard" ? "bg-red-900/50 text-red-400" : "bg-amber-900/50 text-amber-400"
            }`}>{problem.difficulty}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">{problem.tag}</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} problem={problem} pKey={pKey} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{problem.n}N, {problem.edges.length}E</div>
              <GraphView step={step} problem={problem} pKey={pKey} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />MST</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{pKey === "critical" ? "Critical" : "Cycle"}</span>
                {pKey === "critical" && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Pseudo</span>}
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" || step.phase === "result" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "classify" && step.verdict === "critical" ? "bg-red-950/30 border-red-900" :
              step.phase === "classify" && step.verdict === "pseudo" ? "bg-amber-950/30 border-amber-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "add" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "skip" ? "bg-red-900 text-red-300" :
                  step.phase === "done" || step.phase === "result" ? "bg-emerald-900 text-emerald-300" :
                  step.verdict === "critical" ? "bg-red-900 text-red-300" :
                  step.verdict === "pseudo" ? "bg-amber-900 text-amber-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase === "classify" ? step.verdict : step.phase}</span>
                <span className="text-xs text-zinc-600 font-mono ml-auto">cost: {step.mstCost}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                {pKey === "critical" ? "Edge Classification" : "Sorted Edges"}
              </div>
              <div className="space-y-0.5">
                {pKey === "critical" ? (
                  P2_EDGES.map(([u, v, w], i) => {
                    const cls = step.classification ? step.classification[i] : null;
                    const isCurrent = step.testEdge === i;
                    return (
                      <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-xs ${
                        isCurrent ? "bg-blue-950/50 border border-blue-800" : "border border-transparent"
                      }`}>
                        <span className="text-zinc-600 w-4">{i}</span>
                        <span className={isCurrent ? "text-blue-300" : cls ? (cls === "critical" ? "text-red-400" : cls === "pseudo" ? "text-amber-400" : "text-zinc-600") : "text-zinc-500"}>{u}{"\u2013"}{v}</span>
                        <span className={isCurrent ? "text-blue-300" : "text-zinc-600"}>w={w}</span>
                        {cls && <span className={`text-[10px] ml-auto font-bold ${
                          cls === "critical" ? "text-red-500" : cls === "pseudo" ? "text-amber-500" : "text-zinc-700"
                        }`}>{cls === "critical" ? "\u2717 critical" : cls === "pseudo" ? "\u223c pseudo" : "\u2014 neither"}</span>}
                        {isCurrent && !cls && <span className="text-blue-500 text-[10px] ml-auto">{"\u25c0"} testing</span>}
                      </div>
                    );
                  })
                ) : (
                  step.sortedEdges && [...step.sortedEdges].sort((a, b) => a[2] - b[2]).map(([u, v, w], i) => {
                    const isCurrent = step.edgeIdx === i;
                    const wasMST = step.mstEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
                    const isPast = i < step.edgeIdx || (i === step.edgeIdx && step.phase === "done");
                    return (
                      <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-xs ${
                        isCurrent ? "bg-blue-950/50 border border-blue-800" : "border border-transparent"
                      }`}>
                        <span className={isCurrent ? "text-blue-300" : isPast ? (wasMST ? "text-emerald-500" : "text-zinc-700") : "text-zinc-500"}>{u}{"\u2013"}{v}</span>
                        <span className={isCurrent ? "text-blue-300" : isPast ? "text-zinc-700" : "text-zinc-600"}>w={w}</span>
                        {isPast && <span className={`text-[10px] ml-auto ${wasMST ? "text-emerald-600" : "text-red-900"}`}>{wasMST ? "\u2713 added" : "\u2717 cycle"}</span>}
                        {isCurrent && <span className="text-blue-500 text-[10px] ml-auto">{"\u25c0"} current</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">parent[] (Union-Find)</div>
              <div className="flex gap-1.5">
                {step.parent.map((p, i) => {
                  const isRoot = p === i;
                  const isDone = step.phase === "done" || step.phase === "result";
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

          <div className="col-span-4">
            <CodePanel code={problem.code} highlightLines={step.codeHL} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Minimum spanning tree {"\u2014"} connect all nodes, minimize weight</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Sparse graphs {"\u2014"} edge-centric, sort then process greedily</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Clustering {"\u2014"} stop at N{"\u2212"}k edges for k clusters</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Network design, cable laying, road construction</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(E log E) {"\u2014"} dominated by sorting</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V) for Union-Find</div>
                <div><span className="text-zinc-500 font-semibold">Alt:</span> Prim's for dense graphs</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1584 {"\u2014"} Min Cost to Connect All Points</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1489 {"\u2014"} Critical & Pseudo-Critical Edges</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1135 {"\u2014"} Connecting Cities With Min Cost</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1631 {"\u2014"} Path With Minimum Effort</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1168 {"\u2014"} Optimize Water Distribution</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1579 {"\u2014"} Remove Max Edges</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}