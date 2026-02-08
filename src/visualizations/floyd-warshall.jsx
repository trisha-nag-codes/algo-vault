import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   Floyd-Warshall Algorithm — Algorithm + 3 Problem Showcase
   1. Algorithm                            — original all-pairs demo
   2. LC 1462 — Course Schedule IV         — transitive closure (boolean)
   3. LC 399  — Evaluate Division          — multiplicative ratio graph
   4. LC 2976 — Min Cost to Convert String — char-to-char min cost
   ═══════════════════════════════════════════════════════════ */

const INF = 999;
const fmt = v => v >= INF ? "∞" : v;

/* ─────────────────────────────────────────────
   ALGORITHM TAB: Original 4-node all-pairs demo
   ───────────────────────────────────────────── */
const ALG_N = 4;
const ALG_EDGES = [[0,1,3],[0,3,7],[1,0,8],[1,2,2],[2,3,1],[3,0,2]];
const ALG_POS = [{x:80,y:80},{x:320,y:80},{x:320,y:240},{x:80,y:240}];
const ALG_EXPECTED = [[0,3,5,6],[5,0,2,3],[3,6,0,1],[2,5,7,0]];

function buildAlgSteps() {
  const N = ALG_N, EDGES = ALG_EDGES;
  const dist = Array.from({length:N},(_,i) => Array.from({length:N},(_,j) => i===j?0:INF));
  for (const [u,v,w] of EDGES) dist[u][v] = w;
  const steps = [], snap = () => dist.map(r=>[...r]);
  const completedK = new Set();

  steps.push({
    title: "Initialize — Build Distance Matrix",
    detail: `Set dist[i][j] = edge weight if edge exists, 0 on diagonal, ∞ otherwise. ${N}×${N} matrix ready.`,
    dist:snap(), prevDist:null, k:-1, i:-1, j:-1,
    changed:null, phase:"init", codeHL:[1,2,3,4,5],
    completedK: new Set(),
  });

  for (let k = 0; k < N; k++) {
    steps.push({
      title: `k = ${k} — Consider Paths Through Node ${k}`,
      detail: `For every (i,j): is i→${k}→j shorter than current i→j? Check dist[i][${k}] + dist[${k}][j] < dist[i][j].`,
      dist:snap(), prevDist:snap(), k, i:-1, j:-1,
      changed:null, phase:"round", codeHL:[7,8,9],
      completedK: new Set(completedK),
    });

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i===j || i===k || j===k) continue;
        const through = dist[i][k] + dist[k][j];
        if (through >= INF) continue;
        const prev = snap();
        const improved = through < dist[i][j];
        if (improved) dist[i][j] = through;
        if (improved) {
          steps.push({
            title: `dist[${i}][${j}]: ${fmt(prev[i][j])} → ${dist[i][j]}`,
            detail: `dist[${i}][${k}] + dist[${k}][${j}] = ${prev[i][k]} + ${prev[k][j]} = ${through} < ${fmt(prev[i][j])}. Shorter via node ${k}!`,
            dist:snap(), prevDist:prev, k, i, j,
            changed:[i,j], phase:"relax", codeHL:[10,11],
            completedK: new Set(completedK),
          });
        }
      }
    }
    completedK.add(k);
  }

  steps.push({
    title: "✓ Complete — All-Pairs Shortest Paths",
    detail: `Every dist[i][j] holds the shortest path. ${N}×${N} = ${N*N} entries computed.`,
    dist:snap(), prevDist:snap(), k:N, i:-1, j:-1,
    changed:null, phase:"done", codeHL:[13],
    completedK: new Set(completedK),
  });
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 1: LC 1462 — Course Schedule IV
   Transitive Closure (boolean FW)
   ───────────────────────────────────────────── */
const P1_N = 5;
const P1_PREREQS = [[0,1],[0,2],[1,3],[1,4],[2,4]];
const P1_POS = [{x:200,y:40},{x:100,y:160},{x:300,y:160},{x:60,y:280},{x:340,y:280}];
const P1_QUERIES = [[0,3],[3,0],[0,4],[1,2],[2,3]];
const P1_ANSWERS = [true, false, true, false, false];

function buildP1Steps() {
  const N = P1_N, PREREQS = P1_PREREQS;
  const reach = Array.from({length:N},()=>Array(N).fill(false));
  for (const [u,v] of PREREQS) reach[u][v] = true;
  const steps = [], snap = () => reach.map(r=>[...r]);
  const completedK = new Set();

  const toDist = (m) => m.map((r,i)=>r.map((v,j)=>i===j?0:v?1:INF));

  steps.push({
    title: "Initialize — Prerequisite Matrix",
    detail: `Set reach[u][v] = true for each direct prerequisite. ${PREREQS.length} edges. Then use boolean FW: if reach[i][k] AND reach[k][j] → reach[i][j] = true.`,
    dist:toDist(snap()), prevDist:null, k:-1, i:-1, j:-1,
    changed:null, phase:"init", codeHL:[0,1,2,3,4],
    completedK: new Set(), reach:snap(),
  });

  for (let k = 0; k < N; k++) {
    steps.push({
      title: `k = ${k} — Reach via Node ${k}`,
      detail: `For every (i,j): if i can reach ${k} AND ${k} can reach j, then i can reach j.`,
      dist:toDist(snap()), prevDist:toDist(snap()), k, i:-1, j:-1,
      changed:null, phase:"round", codeHL:[6,7,8],
      completedK: new Set(completedK), reach:snap(),
    });

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i===j || i===k || j===k) continue;
        if (reach[i][k] && reach[k][j] && !reach[i][j]) {
          const prev = snap();
          reach[i][j] = true;
          steps.push({
            title: `reach[${i}][${j}]: false → true`,
            detail: `reach[${i}][${k}]=true AND reach[${k}][${j}]=true → ${i} can reach ${j} via ${k}.`,
            dist:toDist(snap()), prevDist:toDist(prev), k, i, j,
            changed:[i,j], phase:"relax", codeHL:[9,10],
            completedK: new Set(completedK), reach:snap(),
          });
        }
      }
    }
    completedK.add(k);
  }

  const queryResults = P1_QUERIES.map(([u,v]) => reach[u][v]);
  steps.push({
    title: "✓ Transitive Closure Complete",
    detail: `Queries: ${P1_QUERIES.map(([u,v],i)=>`${u}→${v}: ${queryResults[i]}`).join(", ")}`,
    dist:toDist(snap()), prevDist:toDist(snap()), k:N, i:-1, j:-1,
    changed:null, phase:"done", codeHL:[11],
    completedK: new Set(completedK), reach:snap(),
  });
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 2: LC 399 — Evaluate Division
   Multiplicative ratio graph FW
   ───────────────────────────────────────────── */
const P2_N = 3;
const P2_LABELS = ["a","b","c"];
const P2_EQS = [["a","b",2],["b","c",3]];
const P2_EDGES = [[0,1,2],[1,0,0.5],[1,2,3],[2,1,1/3]];
const P2_POS = [{x:80,y:160},{x:260,y:60},{x:440,y:160}];
const P2_QUERY_LABELS = [["a","c"],["c","a"],["a","a"],["b","a"]];
const P2_ANSWERS = [6, "1/6", 1, 0.5];

function buildP2Steps() {
  const N = P2_N, EDGES = P2_EDGES, L = P2_LABELS;
  const dist = Array.from({length:N},(_,i) => Array.from({length:N},(_,j) => i===j?1:0));
  for (const [u,v,w] of EDGES) dist[u][v] = w;
  const steps = [], snap = () => dist.map(r=>[...r]);
  const completedK = new Set();

  const toDist = (m) => m.map(r=>r.map(v=>v===0?INF:v));
  const rFmt = v => {
    if (v===0) return "?";
    if (v===1) return "1";
    if (Number.isInteger(v)) return String(v);
    return v < 1 ? `1/${Math.round(1/v)}` : v.toFixed(2).replace(/\.?0+$/,'');
  };

  steps.push({
    title: "Initialize — Ratio Graph",
    detail: `a/b=2 → edges a→b (×2), b→a (×0.5). b/c=3 → edges b→c (×3), c→b (×1/3). Diagonal = 1 (x/x=1). Use multiplicative FW: ratio[i][j] = ratio[i][k] × ratio[k][j].`,
    dist:toDist(snap()), prevDist:null, k:-1, i:-1, j:-1,
    changed:null, phase:"init", codeHL:[0,1,2,3,4,5,6,7],
    completedK: new Set(), ratio:snap(),
  });

  for (let k = 0; k < N; k++) {
    steps.push({
      title: `k = ${k} (${L[k]}) — Ratios via ${L[k]}`,
      detail: `For (i,j): if i/${L[k]} and ${L[k]}/j known, compute i/j = (i/${L[k]}) × (${L[k]}/j).`,
      dist:toDist(snap()), prevDist:toDist(snap()), k, i:-1, j:-1,
      changed:null, phase:"round", codeHL:[8,9,10],
      completedK: new Set(completedK), ratio:snap(),
    });

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i===j || i===k || j===k) continue;
        if (dist[i][k] > 0 && dist[k][j] > 0 && dist[i][j] === 0) {
          const prev = snap();
          dist[i][j] = dist[i][k] * dist[k][j];
          steps.push({
            title: `${L[i]}/${L[j]}: ? → ${rFmt(dist[i][j])}`,
            detail: `${L[i]}/${L[k]} × ${L[k]}/${L[j]} = ${rFmt(prev[i][k])} × ${rFmt(prev[k][j])} = ${rFmt(dist[i][j])}.`,
            dist:toDist(snap()), prevDist:toDist(prev), k, i, j,
            changed:[i,j], phase:"relax", codeHL:[11,12],
            completedK: new Set(completedK), ratio:snap(),
          });
        }
      }
    }
    completedK.add(k);
  }

  steps.push({
    title: "✓ All Ratios Computed",
    detail: `Queries: ${P2_QUERY_LABELS.map(([a,b],i)=>`${a}/${b}=${P2_ANSWERS[i]}`).join(", ")}. Any query is now O(1) lookup.`,
    dist:toDist(snap()), prevDist:toDist(snap()), k:N, i:-1, j:-1,
    changed:null, phase:"done", codeHL:[13],
    completedK: new Set(completedK), ratio:snap(),
  });
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 3: LC 2976 — Min Cost to Convert String I
   Standard FW on character graph
   ───────────────────────────────────────────── */
const P3_N = 5;
const P3_LABELS = ["a","b","c","d","e"];
const P3_EDGES = [[0,1,1],[1,2,2],[2,3,3],[3,4,4],[0,2,5],[0,3,8]];
const P3_POS = [{x:60,y:160},{x:170,y:60},{x:290,y:60},{x:410,y:60},{x:480,y:160}];
const P3_SRC_STR = "abcd";
const P3_TGT_STR = "bcde";
const P3_EXPECTED_TOTAL = 10;

function buildP3Steps() {
  const N = P3_N, EDGES = P3_EDGES, L = P3_LABELS;
  const dist = Array.from({length:N},(_,i) => Array.from({length:N},(_,j) => i===j?0:INF));
  for (const [u,v,w] of EDGES) dist[u][v] = Math.min(dist[u][v], w);
  const steps = [], snap = () => dist.map(r=>[...r]);
  const completedK = new Set();

  steps.push({
    title: "Initialize — Character Cost Matrix",
    detail: `Build graph: ${EDGES.map(([u,v,w])=>`${L[u]}→${L[v]}($${w})`).join(", ")}. FW finds min cost for any char→char. Then sum costs for "${P3_SRC_STR}" → "${P3_TGT_STR}".`,
    dist:snap(), prevDist:null, k:-1, i:-1, j:-1,
    changed:null, phase:"init", codeHL:[0,1,2,3,4,5],
    completedK: new Set(),
  });

  for (let k = 0; k < N; k++) {
    steps.push({
      title: `k = ${k} (${L[k]}) — Routes via '${L[k]}'`,
      detail: `Check if going through '${L[k]}' gives cheaper conversion for any pair.`,
      dist:snap(), prevDist:snap(), k, i:-1, j:-1,
      changed:null, phase:"round", codeHL:[7,8,9],
      completedK: new Set(completedK),
    });

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i===j || i===k || j===k) continue;
        const through = dist[i][k] + dist[k][j];
        if (through >= INF) continue;
        const prev = snap();
        const improved = through < dist[i][j];
        if (improved) dist[i][j] = through;
        if (improved) {
          steps.push({
            title: `${L[i]}→${L[j]}: ${fmt(prev[i][j])} → ${dist[i][j]}`,
            detail: `${L[i]}→${L[k]} + ${L[k]}→${L[j]} = ${prev[i][k]} + ${prev[k][j]} = ${through} < ${fmt(prev[i][j])}. Cheaper via '${L[k]}'.`,
            dist:snap(), prevDist:prev, k, i, j,
            changed:[i,j], phase:"relax", codeHL:[10,11],
            completedK: new Set(completedK),
          });
        }
      }
    }
    completedK.add(k);
  }

  steps.push({
    title: `✓ Total Conversion Cost = $${P3_EXPECTED_TOTAL}`,
    detail: `"${P3_SRC_STR}" → "${P3_TGT_STR}": a→b=$1 + b→c=$2 + c→d=$3 + d→e=$4 = $${P3_EXPECTED_TOTAL}. FW precomputed all min char-to-char costs in O(26³).`,
    dist:snap(), prevDist:snap(), k:N, i:-1, j:-1,
    changed:null, phase:"done", codeHL:[13,14],
    completedK: new Set(completedK),
  });
  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title: "Algorithm", lc: null, difficulty: null, tag: "Core Pattern",
    coreIdea: "Floyd-Warshall computes shortest paths between every pair of vertices by progressively considering each node as a potential intermediate waypoint. For each k, it checks whether i→k→j is shorter than i→j. After all k, dist[i][j] holds the true shortest path. O(V³) time, O(V²) space.",
    nodes: ALG_N, edges: ALG_EDGES, positions: ALG_POS,
    nodeLabels: null, directed: true,
    expectedLabel: "4×4 all-pairs matrix",
    buildSteps: buildAlgSteps,
    code: [
      {id:0, text:`def floyd_warshall(edges, n):`},
      {id:1, text:`    dist = [[float('inf')]*n for _ in range(n)]`},
      {id:2, text:`    for i in range(n):`},
      {id:3, text:`        dist[i][i] = 0`},
      {id:4, text:`    for u, v, w in edges:`},
      {id:5, text:`        dist[u][v] = w`},
      {id:6, text:``},
      {id:7, text:`    for k in range(n):`},
      {id:8, text:`        for i in range(n):`},
      {id:9, text:`            for j in range(n):`},
      {id:10, text:`                if dist[i][k]+dist[k][j] < dist[i][j]:`},
      {id:11, text:`                    dist[i][j] = dist[i][k]+dist[k][j]`},
      {id:12, text:``},
      {id:13, text:`    return dist`},
    ],
  },
  transitive: {
    title: "Course Schedule IV", lc: "1462", difficulty: "Medium", tag: "Transitive Closure",
    coreIdea: "Boolean Floyd-Warshall: instead of min-distance, compute reachability. If reach[i][k] AND reach[k][j] → reach[i][j] = true. After running, answer any \"is course X a prerequisite of Y?\" query in O(1). This is the transitive closure of the prerequisite DAG.",
    nodes: P1_N, edges: P1_PREREQS.map(([u,v])=>[u,v,1]),
    positions: P1_POS,
    nodeLabels: null, directed: true,
    expectedLabel: "queries answered in O(1)",
    isBoolean: true,
    buildSteps: buildP1Steps,
    code: [
      {id:0, text:`def checkIfPrerequisite(n, prereqs, queries):`},
      {id:1, text:`    reach = [[False]*n for _ in range(n)]`},
      {id:2, text:`    for u, v in prereqs:`},
      {id:3, text:`        reach[u][v] = True`},
      {id:4, text:``},
      {id:5, text:`    # Boolean Floyd-Warshall`},
      {id:6, text:`    for k in range(n):`},
      {id:7, text:`        for i in range(n):`},
      {id:8, text:`            for j in range(n):`},
      {id:9, text:`                if reach[i][k] and reach[k][j]:`},
      {id:10, text:`                    reach[i][j] = True`},
      {id:11, text:``},
      {id:12, text:`    return [reach[u][v] for u, v in queries]`},
    ],
  },
  division: {
    title: "Evaluate Division", lc: "399", difficulty: "Medium", tag: "Ratio Graph FW",
    coreIdea: "Model equations as a weighted ratio graph: a/b=2 becomes edges a→b (×2) and b→a (×0.5). Use multiplicative FW: ratio[i][j] = ratio[i][k] × ratio[k][j]. After completion, any query x/y is just a matrix lookup. Diagonal = 1 (x/x), unknown = -1.",
    nodes: P2_N, edges: P2_EDGES,
    positions: P2_POS,
    nodeLabels: P2_LABELS, directed: true,
    expectedLabel: "a/c=6, c/a=1/6, b/a=0.5",
    isRatio: true,
    buildSteps: buildP2Steps,
    code: [
      {id:0, text:`def calcEquation(equations, values, queries):`},
      {id:1, text:`    ids = {}  # map var name → index`},
      {id:2, text:`    # ... assign ids, build ratio matrix`},
      {id:3, text:`    ratio = [[0]*n for _ in range(n)]`},
      {id:4, text:`    for i in range(n): ratio[i][i] = 1.0`},
      {id:5, text:`    for (a,b), v in zip(equations, values):`},
      {id:6, text:`        ratio[ids[a]][ids[b]] = v`},
      {id:7, text:`        ratio[ids[b]][ids[a]] = 1/v`},
      {id:8, text:`    for k in range(n):  # multiplicative FW`},
      {id:9, text:`        for i in range(n):`},
      {id:10, text:`            for j in range(n):`},
      {id:11, text:`                if ratio[i][k] and ratio[k][j]:`},
      {id:12, text:`                    ratio[i][j] = ratio[i][k]*ratio[k][j]`},
      {id:13, text:`    return [ratio[ids[a]][ids[b]]`},
      {id:14, text:`            if a in ids and b in ids else -1`},
      {id:15, text:`            for a, b in queries]`},
    ],
  },
  convert: {
    title: "Min Cost Convert String", lc: "2976", difficulty: "Medium", tag: "Char Graph FW",
    coreIdea: "Build a directed graph where nodes are characters and edge weights are conversion costs. Run FW to find min cost between all character pairs. Then for each position, look up cost to convert source[i] → target[i] and sum. O(26³ + n) total.",
    nodes: P3_N, edges: P3_EDGES,
    positions: P3_POS,
    nodeLabels: P3_LABELS, directed: true,
    expectedLabel: `total = $${P3_EXPECTED_TOTAL}`,
    buildSteps: buildP3Steps,
    code: [
      {id:0, text:`def minimumCost(source, target, original, changed, cost):`},
      {id:1, text:`    dist = [[inf]*26 for _ in range(26)]`},
      {id:2, text:`    for i in range(26): dist[i][i] = 0`},
      {id:3, text:`    for o, c, w in zip(original, changed, cost):`},
      {id:4, text:`        u, v = ord(o)-97, ord(c)-97`},
      {id:5, text:`        dist[u][v] = min(dist[u][v], w)`},
      {id:6, text:``},
      {id:7, text:`    for k in range(26):`},
      {id:8, text:`        for i in range(26):`},
      {id:9, text:`            for j in range(26):`},
      {id:10, text:`                if dist[i][k]+dist[k][j] < dist[i][j]:`},
      {id:11, text:`                    dist[i][j] = dist[i][k]+dist[k][j]`},
      {id:12, text:``},
      {id:13, text:`    total = sum(dist[ord(s)-97][ord(t)-97]`},
      {id:14, text:`               for s, t in zip(source, target))`},
      {id:15, text:`    return -1 if total >= inf else total`},
    ],
  },
};

/* ═══════════════════════════════════════════
   VISUALIZATION COMPONENTS
   ═══════════════════════════════════════════ */

function GraphView({ step, problem }) {
  const { k, i: ci, j: cj, changed, phase } = step;
  const edges = problem.edges;
  const positions = problem.positions;
  const labels = problem.nodeLabels;
  const isRatio = problem.isRatio;
  const isBoolean = problem.isBoolean;

  return (
    <svg viewBox="0 0 520 320" className="w-full" style={{ maxHeight: 230 }}>
      {edges.map(([u, v, w], idx) => {
        const f = positions[u], t = positions[v];
        const dx = t.x-f.x, dy = t.y-f.y, len = Math.sqrt(dx*dx+dy*dy) || 1;
        const r = 20;
        const ox = (dy/len)*8, oy = -(dx/len)*8;
        const sx = f.x+(dx/len)*r+ox, sy = f.y+(dy/len)*r+oy;
        const ex = t.x-(dx/len)*r+ox, ey = t.y-(dy/len)*r+oy;
        const mx = (sx+ex)/2+(dy/len)*12, my = (sy+ey)/2-(dx/len)*12;
        const isPathEdge = phase==="relax" && changed && ((u===ci&&v===k)||(u===k&&v===cj));
        const color = isPathEdge ? "#10b981" : "#3f3f46";
        const wLabel = isRatio ? (w<1?`1/${Math.round(1/w)}`:`×${w}`) : isBoolean ? "" : String(w);
        return (
          <g key={idx}>
            <defs>
              <marker id={`fw-${idx}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={color} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isPathEdge?3:1.5} markerEnd={`url(#fw-${idx})`} />
            {wLabel && <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fill={isPathEdge?"#fbbf24":"#71717a"} fontSize="11" fontWeight="600" fontFamily="monospace">{wLabel}</text>}
          </g>
        );
      })}
      {positions.map((pos, id) => {
        const isK = id === k;
        const isI = id === ci;
        const isJ = id === cj;
        const fill = isK ? "#8b5cf6" : isI ? "#3b82f6" : isJ ? "#f59e0b" : "#27272a";
        const stroke = isK ? "#7c3aed" : isI ? "#2563eb" : isJ ? "#d97706" : "#52525b";
        const label = labels ? labels[id] : String(id);
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={20} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="15" fontWeight="700" fontFamily="monospace">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DistMatrix({ step, problem }) {
  const { dist, changed, k, phase } = step;
  const N = problem.nodes;
  const labels = problem.nodeLabels;
  const isDone = phase === "done";
  const isBoolean = problem.isBoolean;
  const isRatio = problem.isRatio;
  const reach = step.reach;
  const ratio = step.ratio;

  const cellVal = (i, j) => {
    if (isBoolean && reach) return reach[i][j] ? "T" : "·";
    if (isRatio && ratio) {
      const v = ratio[i][j];
      if (i===j) return "1";
      if (v===0) return "·";
      if (Number.isInteger(v)) return String(v);
      return v < 1 ? `1/${Math.round(1/v)}` : v.toFixed(1);
    }
    const d = dist[i][j];
    return d >= INF ? "∞" : d;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        {isBoolean ? "reach[][]" : isRatio ? "ratio[][]" : "dist[][]"} Matrix
      </div>
      <div className="overflow-x-auto">
        <table className="font-mono text-sm w-full">
          <thead>
            <tr>
              <th className="w-8 py-1 text-zinc-700 text-xs"></th>
              {Array.from({length:N}, (_,j) => (
                <th key={j} className={`w-14 py-1 text-center text-xs ${j===step.j?"text-amber-400":"text-zinc-500"}`}>
                  {labels ? labels[j] : j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({length:N}).map((_,i) => (
              <tr key={i}>
                <td className={`py-1 text-center text-xs ${i===step.i?"text-blue-400":"text-zinc-500"}`}>
                  {labels ? labels[i] : i}
                </td>
                {Array.from({length:N}).map((_,j) => {
                  const isCh = changed && changed[0]===i && changed[1]===j;
                  const isKrc = i===k || j===k;
                  const isDiag = i===j;
                  const val = cellVal(i,j);
                  return (
                    <td key={j} className={`w-14 py-1.5 text-center rounded transition-all ${
                      isCh ? "bg-emerald-950 text-emerald-300 font-bold scale-105" :
                      isDone ? "bg-emerald-950/20 text-emerald-300" :
                      isDiag ? "text-zinc-700" :
                      isKrc ? "bg-purple-950/30 text-purple-300" :
                      isBoolean && val==="T" ? "text-blue-400" :
                      "text-zinc-400"
                    }`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IOPanel({ step, problem, problemKey }) {
  const { phase, dist, completedK } = step;
  const done = phase === "done";
  const N = problem.nodes;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          {problemKey === "algorithm" && (
            <>
              <div><span className="text-zinc-500">n</span> = <span className="text-zinc-300">{N}</span>, <span className="text-zinc-500">{ALG_EDGES.length} directed edges</span></div>
              {ALG_EDGES.map(([u,v,w],i)=>(
                <div key={i} className="pl-2 text-zinc-300">({u},{v},{w})</div>
              ))}
            </>
          )}
          {problemKey === "transitive" && (
            <>
              <div><span className="text-zinc-500">{N} courses, {P1_PREREQS.length} prereqs</span></div>
              {P1_PREREQS.map(([u,v],i)=>(
                <div key={i} className="pl-2 text-zinc-300">{u} → {v}</div>
              ))}
              <div className="text-zinc-500 mt-1">queries:</div>
              {P1_QUERIES.map(([u,v],i)=>(
                <div key={i} className="pl-2 text-zinc-400">{u}→{v}? <span className={P1_ANSWERS[i]?"text-emerald-400":"text-red-400"}>{P1_ANSWERS[i]?"T":"F"}</span></div>
              ))}
            </>
          )}
          {problemKey === "division" && (
            <>
              {P2_EQS.map(([a,b,v],i)=>(
                <div key={i} className="text-zinc-300">{a}/{b} = {v}</div>
              ))}
              <div className="text-zinc-500 mt-1">queries: a/c, c/a, a/a, b/a</div>
            </>
          )}
          {problemKey === "convert" && (
            <>
              <div><span className="text-zinc-500">source</span> = <span className="text-blue-400">"{P3_SRC_STR}"</span></div>
              <div><span className="text-zinc-500">target</span> = <span className="text-amber-400">"{P3_TGT_STR}"</span></div>
              <div className="text-zinc-500">{P3_EDGES.length} conversions</div>
              {P3_EDGES.map(([u,v,w],i)=>(
                <div key={i} className="pl-2 text-zinc-300">{P3_LABELS[u]}→{P3_LABELS[v]} (${w})</div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected</div>
        <div className="font-mono text-[11px] text-zinc-300">{problem.expectedLabel}</div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Progress</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ DONE</span>}
        </div>
        {completedK && completedK.size > 0 ? (
          <div className="text-[10px] text-zinc-500 flex flex-wrap gap-2">
            {Array.from(completedK).map(kk => (
              <span key={kk} className="inline-flex items-center gap-0.5">
                <span className="text-purple-400">k={problem.nodeLabels?problem.nodeLabels[kk]:kk}</span>
                <span className="text-emerald-600">✓</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-[10px] text-zinc-600">Not started</div>
        )}
      </div>

      {/* LC 2976 per-char breakdown */}
      {problemKey === "convert" && done && (
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Per-Char Cost</div>
          <div className="space-y-0.5 text-[10px] font-mono">
            {P3_SRC_STR.split("").map((s,i) => {
              const t = P3_TGT_STR[i];
              const si2 = P3_LABELS.indexOf(s), ti2 = P3_LABELS.indexOf(t);
              const c = step.dist[si2][ti2];
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-blue-400">{s}</span>
                  <span className="text-zinc-600">→</span>
                  <span className="text-amber-400">{t}</span>
                  <span className="text-zinc-400">= ${c >= INF ? "?" : c}</span>
                </div>
              );
            })}
            <div className="border-t border-zinc-800 pt-1 text-emerald-300 font-bold">
              Total = ${P3_EXPECTED_TOTAL}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">← Prev</button>
      <div className="flex gap-1.5 flex-wrap justify-center max-w-md">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setSi(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === si ? "bg-blue-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`} />
        ))}
      </div>
      <button onClick={() => setSi(Math.min(total - 1, si + 1))} disabled={si >= total - 1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">Next →</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function FloydWarshallViz() {
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
            <h1 className="text-2xl font-bold tracking-tight">Floyd-Warshall Algorithm</h1>
            <p className="text-zinc-500 text-sm mt-0.5">All-Pairs Shortest Path • O(V³)</p>
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
            {problem.difficulty && <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-900/50 text-amber-400">{problem.difficulty}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">{problem.tag}</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} problem={problem} problemKey={pKey} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{problem.nodes}N, {problem.edges.length}E • <span className="text-purple-400">purple=k</span></div>
              <GraphView step={step} problem={problem} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />k (via)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />i (from)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />j (to)</span>
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length-1)+1}/{steps.length}</span>
                {step.k >= 0 && step.k < problem.nodes && (
                  <span className="text-[10px] text-purple-400 font-mono font-bold">
                    k={problem.nodeLabels ? problem.nodeLabels[step.k] : step.k}
                  </span>
                )}
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "relax" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "round" ? "bg-purple-900 text-purple-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            <DistMatrix step={step} problem={problem} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Intermediate Rounds</div>
              <div className="flex gap-1.5">
                {Array.from({length:problem.nodes}).map((_,kk) => {
                  const completed = step.completedK && step.completedK.has(kk);
                  const active = step.k === kk && !completed;
                  const label = problem.nodeLabels ? problem.nodeLabels[kk] : kk;
                  return (
                    <div key={kk} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">k={label}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        completed ? "bg-emerald-950/30 border-emerald-800 text-emerald-400" :
                        active ? "bg-purple-950/30 border-purple-700 text-purple-300 scale-110" :
                        "bg-zinc-900 border-zinc-700 text-zinc-600"
                      }`}>
                        {completed ? "✓" : active ? "▶" : "—"}
                      </div>
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
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use Floyd-Warshall</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>All-pairs shortest path — need distances between every (i,j)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Dense graphs — adjacency matrix representation is natural</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Transitive closure — boolean reachability between all pairs</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Multiplicative paths — ratio/probability propagation</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V³)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V²)</div>
                <div><span className="text-zinc-500 font-semibold">Negative cycle:</span> Detected if dist[i][i] &lt; 0</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1334 — Find City With Fewest Neighbors at Threshold</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 399 — Evaluate Division</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1462 — Course Schedule IV (Transitive Closure)</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 2976 — Min Cost to Convert String I</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1617 — Count Subtrees With Max Distance</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 2642 — Design Graph With Shortest Path Calculator</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}