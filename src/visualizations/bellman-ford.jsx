import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   Bellman-Ford Algorithm — Algorithm + 3 Problem Showcase
   1. Algorithm                         — original demo with negative edge
   2. LC 1334 — City With Smallest Neighbors at Threshold
   3. LC 2307 — Check for Contradictions in Equations
   4. Negative Cycle Detection          — V-th round check
   ═══════════════════════════════════════════════════════════ */

const INF = Infinity;
const fmt = v => v === INF ? "∞" : v;

/* ─────────────────────────────────────────────
   ALGORITHM TAB: Original BF demo (negative edge)
   ───────────────────────────────────────────── */
const ALG_N = 5, ALG_SRC = 0;
const ALG_EDGES = [[0,1,6],[0,2,2],[2,1,-1],[1,3,3],[2,3,5],[3,4,2]];
const ALG_POS = [{x:60,y:150},{x:180,y:50},{x:180,y:250},{x:320,y:150},{x:460,y:150}];
const ALG_EXPECTED = [0, 1, 2, 4, 6];

function buildAlgSteps() {
  const N = ALG_N, EDGES = ALG_EDGES, SOURCE = ALG_SRC;
  const dist = new Array(N).fill(INF); dist[SOURCE] = 0;
  const steps = [], relaxedEdges = [];

  steps.push({
    title: "Initialize — Source Distance = 0",
    detail: `dist[${SOURCE}] = 0, all others = ∞. Run V−1 = ${N-1} rounds. Each round processes ALL ${EDGES.length} edges.`,
    dist:[...dist], prevDist:null, round:0, edgeIdx:-1,
    activeEdge:null, changed:null, phase:"init", codeHL:[0,1,2],
    relaxedEdges:[], cycleEdges:null,
  });

  for (let round = 1; round <= N-1; round++) {
    let roundChanges = 0;
    steps.push({
      title: `Round ${round} of ${N-1} — Relax All Edges`,
      detail: `Iterate through all ${EDGES.length} edges and try to improve distances.`,
      dist:[...dist], prevDist:[...dist], round, edgeIdx:-1,
      activeEdge:null, changed:null, phase:"round", codeHL:[4,5],
      relaxedEdges:[...relaxedEdges], cycleEdges:null,
    });

    for (let e = 0; e < EDGES.length; e++) {
      const [u,v,w] = EDGES[e];
      const prevDist = [...dist];
      const improved = dist[u] !== INF && dist[u]+w < dist[v];
      if (improved) {
        dist[v] = dist[u]+w; roundChanges++;
        relaxedEdges.push({round, edge:`${u}→${v}`, from:prevDist[v], to:dist[v]});
      }
      steps.push({
        title: improved
          ? `Edge ${u}→${v} (w=${w}): Relax ${fmt(prevDist[v])} → ${dist[v]}`
          : `Edge ${u}→${v} (w=${w}): No Improvement`,
        detail: improved
          ? `dist[${u}] + w = ${prevDist[u]} + ${w<0?`(${w})`:w} = ${dist[v]} < ${fmt(prevDist[v])}. Update dist[${v}].`
          : dist[u] === INF ? `dist[${u}] = ∞. Cannot relax.`
            : `dist[${u}] + w = ${dist[u]} + ${w<0?`(${w})`:w} = ${dist[u]+w} ≥ ${dist[v]}.`,
        dist:[...dist], prevDist, round, edgeIdx:e,
        activeEdge:[u,v], changed:improved?v:null,
        phase:improved?"relax":"skip", codeHL:improved?[6,7,8,9]:[6,7],
        relaxedEdges:[...relaxedEdges], cycleEdges:null,
      });
    }
    if (roundChanges === 0) {
      steps.push({
        title: `Round ${round} — No Changes, Early Termination`,
        detail: "No distances improved. Algorithm converged.",
        dist:[...dist], prevDist:[...dist], round, edgeIdx:-1,
        activeEdge:null, changed:null, phase:"early", codeHL:[10],
        relaxedEdges:[...relaxedEdges], cycleEdges:null,
      });
      break;
    }
  }

  steps.push({
    title: "✓ Complete — Shortest Distances Found",
    detail: `dist = [${dist.join(", ")}]. Negative edge 2→1 (w=−1) gave shorter path: 0→2→1 (cost 1) vs 0→1 (cost 6).`,
    dist:[...dist], prevDist:[...dist], round:N, edgeIdx:-1,
    activeEdge:null, changed:null, phase:"done", codeHL:[12],
    relaxedEdges:[...relaxedEdges], cycleEdges:null,
  });
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 1: LC 1334 — Find the City With the
   Smallest Number of Neighbors at Threshold Distance
   Run BF from each city, count reachable neighbors
   ───────────────────────────────────────────── */
const P1_N = 4, P1_THRESHOLD = 4;
const P1_UNDIRECTED = [[0,1,3],[1,2,1],[1,3,4],[2,3,1]];
const P1_EDGES = []; // directed both ways
for (const [u,v,w] of P1_UNDIRECTED) { P1_EDGES.push([u,v,w],[v,u,w]); }
const P1_POS = [{x:80,y:150},{x:230,y:150},{x:400,y:60},{x:400,y:240}];
const P1_SRC = 3; // BF demo from winning city
const P1_ALL_RESULTS = [
  {city:0, dist:[0,3,4,5], count:2},
  {city:1, dist:[3,0,1,2], count:3},
  {city:2, dist:[4,1,0,1], count:3},
  {city:3, dist:[5,2,1,0], count:2},
];
const P1_EXPECTED = 3; // city 3 (max index among ties)

function buildP1Steps() {
  const N=P1_N, EDGES=P1_EDGES, SOURCE=P1_SRC, T=P1_THRESHOLD;
  const dist = new Array(N).fill(INF); dist[SOURCE] = 0;
  const steps = [], relaxedEdges = [];

  steps.push({
    title: `Initialize — BF from City ${SOURCE}`,
    detail: `Run BF from each city, count neighbors within threshold=${T}. Showing BF from city ${SOURCE} (the answer). dist[${SOURCE}] = 0.`,
    dist:[...dist], prevDist:null, round:0, edgeIdx:-1,
    activeEdge:null, changed:null, phase:"init", codeHL:[0,1,2,3,4],
    relaxedEdges:[], cycleEdges:null,
  });

  for (let round = 1; round <= N-1; round++) {
    let roundChanges = 0;
    steps.push({
      title: `Round ${round} of ${N-1}`,
      detail: `Undirected graph → ${EDGES.length} directed edges (both ways). Relax all.`,
      dist:[...dist], prevDist:[...dist], round, edgeIdx:-1,
      activeEdge:null, changed:null, phase:"round", codeHL:[5,6],
      relaxedEdges:[...relaxedEdges], cycleEdges:null,
    });

    for (let e = 0; e < EDGES.length; e++) {
      const [u,v,w] = EDGES[e];
      const prevDist = [...dist];
      const improved = dist[u] !== INF && dist[u]+w < dist[v];
      if (improved) {
        dist[v] = dist[u]+w; roundChanges++;
        relaxedEdges.push({round, edge:`${u}→${v}`, from:prevDist[v], to:dist[v]});
      }
      steps.push({
        title: improved
          ? `Edge ${u}→${v} (w=${w}): ${fmt(prevDist[v])} → ${dist[v]}`
          : `Edge ${u}→${v} (w=${w}): No Improvement`,
        detail: improved
          ? `${prevDist[u]} + ${w} = ${dist[v]} < ${fmt(prevDist[v])}.`
          : dist[u] === INF ? `Not reachable yet.` : `${dist[u]+w} ≥ ${dist[v]}.`,
        dist:[...dist], prevDist, round, edgeIdx:e,
        activeEdge:[u,v], changed:improved?v:null,
        phase:improved?"relax":"skip", codeHL:improved?[7,8,9]:[7,8],
        relaxedEdges:[...relaxedEdges], cycleEdges:null,
      });
    }
    if (roundChanges === 0) {
      steps.push({
        title: `Round ${round} — Converged`,
        detail: "No improvements. BF from this source complete.",
        dist:[...dist], prevDist:[...dist], round, edgeIdx:-1,
        activeEdge:null, changed:null, phase:"early", codeHL:[10],
        relaxedEdges:[...relaxedEdges], cycleEdges:null,
      });
      break;
    }
  }

  const neighbors = dist.filter((d,i) => i !== SOURCE && d <= T);
  steps.push({
    title: `✓ City ${SOURCE}: ${neighbors.length} Neighbors Within ${T}`,
    detail: `dist from city ${SOURCE} = [${dist.join(", ")}]. Cities within threshold ${T}: ${dist.map((d,i) => i !== SOURCE && d <= T ? i : null).filter(x=>x!==null).join(", ")} (${neighbors.length} total). City 0 also has 2 neighbors, but we return city 3 (max index among ties).`,
    dist:[...dist], prevDist:[...dist], round:N, edgeIdx:-1,
    activeEdge:null, changed:null, phase:"done", codeHL:[11,12,13],
    relaxedEdges:[...relaxedEdges], cycleEdges:null,
  });
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 2: LC 2307 — Check for Contradictions
   in Equations. Ratio-graph + BF-style propagation.
   a/b=2, b/c=3, a/c=5 → contradiction (should be 6)
   ───────────────────────────────────────────── */
const P2_N = 3;
const P2_LABELS = ["a","b","c"];
const P2_EQUATIONS = [["a","b",2],["b","c",3],["a","c",5]];
const P2_EDGES = [[0,1,2],[1,0,0.5],[1,2,3],[2,1,1/3],[0,2,5],[2,0,0.2]];
const P2_POS = [{x:260,y:50},{x:100,y:230},{x:420,y:230}];
const P2_SRC = 0;

function buildP2Steps() {
  const N=P2_N, EDGES=P2_EDGES, SOURCE=P2_SRC;
  const val = new Array(N).fill(null);
  val[SOURCE] = 1.0;
  const steps = [], relaxedEdges = [];
  const L = P2_LABELS;

  const fmtV = v => v === null ? "?" : Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, '');
  const distForDisplay = () => val.map(v => v === null ? INF : v);

  steps.push({
    title: `Initialize — Assign val[${L[SOURCE]}] = 1.0`,
    detail: `Set variable ${L[SOURCE]}=1.0 as reference. Propagate ratios using BF relaxation. If val[v] already set but val[u]×w ≠ val[v] → contradiction! Equations: a/b=2, b/c=3, a/c=5.`,
    dist: distForDisplay(), prevDist:null, round:0, edgeIdx:-1,
    activeEdge:null, changed:null, phase:"init", codeHL:[0,1,2,3,4,5],
    relaxedEdges:[], cycleEdges:null, valDisplay:val.map(fmtV),
  });

  let contradictionFound = false;

  for (let round = 1; round <= N-1 && !contradictionFound; round++) {
    steps.push({
      title: `Round ${round} of ${N-1} — Propagate Ratios`,
      detail: `For each edge u→v (ratio w): if val[u] known and val[v] unknown → assign. If both known → check consistency.`,
      dist: distForDisplay(), prevDist: distForDisplay(), round, edgeIdx:-1,
      activeEdge:null, changed:null, phase:"round", codeHL:[6,7],
      relaxedEdges:[...relaxedEdges], cycleEdges:null, valDisplay:val.map(fmtV),
    });

    for (let e = 0; e < EDGES.length && !contradictionFound; e++) {
      const [u,v,w] = EDGES[e];
      if (val[u] === null) {
        steps.push({
          title: `Edge ${L[u]}→${L[v]} (×${fmtV(w)}): ${L[u]} unknown, skip`,
          detail: `val[${L[u]}] = ?. Cannot propagate yet.`,
          dist: distForDisplay(), prevDist: distForDisplay(), round, edgeIdx:e,
          activeEdge:[u,v], changed:null, phase:"skip", codeHL:[8],
          relaxedEdges:[...relaxedEdges], cycleEdges:null, valDisplay:val.map(fmtV),
        });
        continue;
      }

      const expected = val[u] * w;

      if (val[v] === null) {
        val[v] = expected;
        relaxedEdges.push({round, edge:`${L[u]}→${L[v]}`, from:null, to:expected});
        steps.push({
          title: `Edge ${L[u]}→${L[v]} (×${fmtV(w)}): Assign val[${L[v]}] = ${fmtV(expected)}`,
          detail: `val[${L[u]}] × ${fmtV(w)} = ${fmtV(val[u])} × ${fmtV(w)} = ${fmtV(expected)}. First time seeing ${L[v]}, assign it.`,
          dist: distForDisplay(), prevDist: distForDisplay(), round, edgeIdx:e,
          activeEdge:[u,v], changed:v, phase:"relax", codeHL:[9,10,11],
          relaxedEdges:[...relaxedEdges], cycleEdges:null, valDisplay:val.map(fmtV),
        });
      } else if (Math.abs(val[v] - expected) > 1e-5) {
        contradictionFound = true;
        steps.push({
          title: `⚠ Edge ${L[u]}→${L[v]} (×${fmtV(w)}): CONTRADICTION!`,
          detail: `val[${L[u]}] × ${fmtV(w)} = ${fmtV(val[u])} × ${fmtV(w)} = ${fmtV(expected)}, but val[${L[v]}] = ${fmtV(val[v])}. These differ! The equation ${L[u]}/${L[v]} = ${fmtV(w)} contradicts the path ${L[SOURCE]}→${L[u]}→…→${L[v]} which gives ${L[u]}/${L[v]} = ${fmtV(val[u]/val[v])}.`,
          dist: distForDisplay(), prevDist: distForDisplay(), round, edgeIdx:e,
          activeEdge:[u,v], changed:null, phase:"negcycle", codeHL:[12,13],
          relaxedEdges:[...relaxedEdges], cycleEdges:[[u,v,w]], valDisplay:val.map(fmtV),
        });
      } else {
        steps.push({
          title: `Edge ${L[u]}→${L[v]} (×${fmtV(w)}): Consistent ✓`,
          detail: `val[${L[u]}] × ${fmtV(w)} = ${fmtV(expected)} ≈ val[${L[v]}] = ${fmtV(val[v])}. No contradiction.`,
          dist: distForDisplay(), prevDist: distForDisplay(), round, edgeIdx:e,
          activeEdge:[u,v], changed:null, phase:"skip", codeHL:[12],
          relaxedEdges:[...relaxedEdges], cycleEdges:null, valDisplay:val.map(fmtV),
        });
      }
    }
  }

  steps.push({
    title: contradictionFound ? "✗ Contradiction Found — Return True" : "✓ No Contradiction",
    detail: contradictionFound
      ? `a/b=2 and b/c=3 imply a/c=6, but the equation says a/c=5. Impossible! BF-style propagation detects this when the ratio-graph has an inconsistent cycle.`
      : "All equations are consistent.",
    dist: distForDisplay(), prevDist: distForDisplay(), round:N, edgeIdx:-1,
    activeEdge:null, changed:null, phase:contradictionFound?"fail":"done", codeHL:contradictionFound?[13]:[14],
    relaxedEdges:[...relaxedEdges], cycleEdges:contradictionFound?[[0,2,5]]:null, valDisplay:val.map(fmtV),
  });
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 3: Negative Cycle Detection
   V-th round check
   ───────────────────────────────────────────── */
const P3_N = 5, P3_SRC = 0;
const P3_EDGES = [[0,1,2],[1,2,3],[2,3,-6],[3,1,1],[1,4,5]];
const P3_POS = [{x:60,y:140},{x:190,y:50},{x:340,y:50},{x:340,y:230},{x:460,y:140}];

function buildP3Steps() {
  const N=P3_N, EDGES=P3_EDGES, SOURCE=P3_SRC;
  const dist = new Array(N).fill(INF); dist[SOURCE] = 0;
  const steps = [], relaxedEdges = [];

  steps.push({
    title: "Initialize — Negative Cycle Detection",
    detail: `${N} nodes, ${EDGES.length} edges. Cycle 1→2→3→1 has weight 3+(−6)+1 = −2 (negative!). Run V−1 = ${N-1} rounds, then check V-th.`,
    dist:[...dist], prevDist:null, round:0, edgeIdx:-1,
    activeEdge:null, changed:null, phase:"init", codeHL:[0,1,2],
    relaxedEdges:[], cycleEdges:null,
  });

  for (let round = 1; round <= N-1; round++) {
    let roundChanges = 0;
    steps.push({
      title: `Round ${round} of ${N-1}`,
      detail: `Relax all edges. Distances keep decreasing due to the negative cycle.`,
      dist:[...dist], prevDist:[...dist], round, edgeIdx:-1,
      activeEdge:null, changed:null, phase:"round", codeHL:[4,5],
      relaxedEdges:[...relaxedEdges], cycleEdges:null,
    });

    for (let e = 0; e < EDGES.length; e++) {
      const [u,v,w] = EDGES[e];
      const prevDist = [...dist];
      const improved = dist[u] !== INF && dist[u]+w < dist[v];
      if (improved) {
        dist[v] = dist[u]+w; roundChanges++;
        relaxedEdges.push({round, edge:`${u}→${v}`, from:prevDist[v], to:dist[v]});
      }
      steps.push({
        title: improved
          ? `Edge ${u}→${v} (w=${w}): ${fmt(prevDist[v])} → ${dist[v]}`
          : `Edge ${u}→${v} (w=${w}): No Improvement`,
        detail: improved
          ? `${prevDist[u]} + ${w<0?`(${w})`:w} = ${dist[v]} < ${fmt(prevDist[v])}.`
          : dist[u] === INF ? `Not reachable.` : `${dist[u]+w} ≥ ${dist[v]}.`,
        dist:[...dist], prevDist, round, edgeIdx:e,
        activeEdge:[u,v], changed:improved?v:null,
        phase:improved?"relax":"skip", codeHL:improved?[6,7,8,9]:[6,7],
        relaxedEdges:[...relaxedEdges], cycleEdges:null,
      });
    }
  }

  steps.push({
    title: `Round ${N} (V-th) — Negative Cycle Check`,
    detail: `If ANY edge can still be relaxed, a negative cycle exists.`,
    dist:[...dist], prevDist:[...dist], round:N, edgeIdx:-1,
    activeEdge:null, changed:null, phase:"check", codeHL:[12,13],
    relaxedEdges:[...relaxedEdges], cycleEdges:null,
  });

  let cycleFound = false;
  const cycleEdges = [];
  for (let e = 0; e < EDGES.length; e++) {
    const [u,v,w] = EDGES[e];
    const canRelax = dist[u] !== INF && dist[u]+w < dist[v];
    if (canRelax) { cycleFound = true; cycleEdges.push([u,v,w]); }
    steps.push({
      title: canRelax
        ? `⚠ Edge ${u}→${v}: Still relaxable! (${dist[u]+w} < ${dist[v]})`
        : `Edge ${u}→${v}: OK (${dist[u]===INF?"∞":dist[u]+w} ≥ ${dist[v]})`,
      detail: canRelax
        ? `dist[${u}] + ${w<0?`(${w})`:w} = ${dist[u]+w} < ${dist[v]}. NEGATIVE CYCLE.`
        : `No further relaxation.`,
      dist:[...dist], prevDist:[...dist], round:N, edgeIdx:e,
      activeEdge:[u,v], changed:null,
      phase:canRelax?"negcycle":"skip", codeHL:canRelax?[13,14,15]:[13,14],
      relaxedEdges:[...relaxedEdges], cycleEdges:cycleFound?[...cycleEdges]:null,
    });
  }

  steps.push({
    title: "✗ Negative Cycle Exists — Return True",
    detail: `Cycle 1→2→3→1 (weight −2). Distances would decrease infinitely. BF detects this in the V-th round.`,
    dist:[...dist], prevDist:[...dist], round:N+1, edgeIdx:-1,
    activeEdge:null, changed:null, phase:"fail", codeHL:[15],
    relaxedEdges:[...relaxedEdges], cycleEdges,
  });
  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title: "Algorithm",
    lc: null, difficulty: null, tag: "Core Pattern",
    coreIdea: "Bellman-Ford relaxes every edge in V−1 rounds. Unlike Dijkstra, it handles negative edge weights because it doesn't greedily finalize distances — each round propagates improvements one hop further. A V-th round detecting further improvement means a negative cycle. Edge 2→1 (w=−1) is dashed to highlight the negative weight.",
    nodes: ALG_N, edges: ALG_EDGES, positions: ALG_POS, source: ALG_SRC,
    displayEdges: ALG_EDGES, directed: true,
    expectedLabel: `dist = [${ALG_EXPECTED.join(", ")}]`,
    buildSteps: buildAlgSteps,
    nodeLabels: null,
    code: [
      { id:0, text:`def bellman_ford(n, edges, src):` },
      { id:1, text:`    dist = [float('inf')] * n` },
      { id:2, text:`    dist[src] = 0` },
      { id:3, text:`` },
      { id:4, text:`    for _ in range(n - 1):` },
      { id:5, text:`        changed = False` },
      { id:6, text:`        for u, v, w in edges:` },
      { id:7, text:`            if dist[u] + w < dist[v]:` },
      { id:8, text:`                dist[v] = dist[u] + w` },
      { id:9, text:`                changed = True` },
      { id:10, text:`        if not changed: break` },
      { id:11, text:`` },
      { id:12, text:`    return dist` },
    ],
  },
  city: {
    title: "Smallest Neighbor City",
    lc: "1334", difficulty: "Medium", tag: "Multi-Source BF",
    coreIdea: "Run BF from EVERY city, count how many other cities are reachable within the distance threshold. Return the city with the fewest reachable neighbors (max index for ties). Here we show BF from city 3 (the answer). City 0 also has 2 neighbors, but we return 3 (higher index).",
    nodes: P1_N, edges: P1_EDGES, positions: P1_POS, source: P1_SRC,
    displayEdges: P1_UNDIRECTED, directed: false,
    expectedLabel: "city = 3 (2 neighbors ≤ 4)",
    buildSteps: buildP1Steps,
    nodeLabels: null,
    code: [
      { id:0, text:`def findTheCity(n, edges, threshold):` },
      { id:1, text:`    best_city, min_count = -1, n` },
      { id:2, text:`    for src in range(n):` },
      { id:3, text:`        dist = [float('inf')] * n` },
      { id:4, text:`        dist[src] = 0` },
      { id:5, text:`        for _ in range(n - 1):` },
      { id:6, text:`            changed = False` },
      { id:7, text:`            for u, v, w in edges:  # both dirs` },
      { id:8, text:`                if dist[u] + w < dist[v]:` },
      { id:9, text:`                    dist[v] = dist[u] + w` },
      { id:10, text:`                    changed = True` },
      { id:11, text:`            if not changed: break` },
      { id:12, text:`        cnt = sum(d <= threshold for i,d` },
      { id:13, text:`                  in enumerate(dist) if i != src)` },
      { id:14, text:`        if cnt <= min_count:` },
      { id:15, text:`            min_count, best_city = cnt, src` },
      { id:16, text:`    return best_city` },
    ],
  },
  equations: {
    title: "Equation Contradictions",
    lc: "2307", difficulty: "Hard", tag: "Ratio Graph BF",
    coreIdea: "Model equations as a weighted ratio graph: a/b=2 becomes edge a→b (×2) and b→a (×0.5). Use BF-style propagation: assign val[a]=1, then val[b]=val[a]×2=2, val[c]=val[b]×3=6. When edge a→c says val[c] should be val[a]×5=5, but we already have val[c]=6 → contradiction!",
    nodes: P2_N, edges: P2_EDGES, positions: P2_POS, source: P2_SRC,
    displayEdges: P2_EDGES, directed: true,
    expectedLabel: "contradiction = True",
    buildSteps: buildP2Steps,
    nodeLabels: P2_LABELS,
    code: [
      { id:0, text:`def checkContradictions(equations, values):` },
      { id:1, text:`    # Build ratio graph` },
      { id:2, text:`    graph = defaultdict(list)` },
      { id:3, text:`    for (a, b), v in zip(equations, values):` },
      { id:4, text:`        graph[a].append((b, v))` },
      { id:5, text:`        graph[b].append((a, 1/v))` },
      { id:6, text:`    # BF-style: propagate ratios` },
      { id:7, text:`    val = {src: 1.0}  # pick any start` },
      { id:8, text:`    for _ in range(n - 1):` },
      { id:9, text:`        for u in graph:` },
      { id:10, text:`            if u not in val: continue` },
      { id:11, text:`            for v, w in graph[u]:` },
      { id:12, text:`                exp = val[u] * w` },
      { id:13, text:`                if v in val and abs(val[v]-exp)>1e-5:` },
      { id:14, text:`                    return True  # contradiction!` },
      { id:15, text:`                val.setdefault(v, exp)` },
      { id:16, text:`    return False` },
    ],
  },
  negcycle: {
    title: "Negative Cycle",
    lc: null, difficulty: null, tag: "V-th Round Check",
    coreIdea: "After V−1 rounds, all shortest paths are finalized IF no negative cycle exists. Run one more round (V-th): if any edge can still be relaxed, a negative-weight cycle is reachable. Cycle 1→2→3→1 has weight 3+(−6)+1 = −2.",
    nodes: P3_N, edges: P3_EDGES, positions: P3_POS, source: P3_SRC,
    displayEdges: P3_EDGES, directed: true,
    expectedLabel: "negative cycle = True",
    buildSteps: buildP3Steps,
    nodeLabels: null,
    code: [
      { id:0, text:`def has_negative_cycle(n, edges, src):` },
      { id:1, text:`    dist = [float('inf')] * n` },
      { id:2, text:`    dist[src] = 0` },
      { id:3, text:`` },
      { id:4, text:`    for _ in range(n - 1):` },
      { id:5, text:`        changed = False` },
      { id:6, text:`        for u, v, w in edges:` },
      { id:7, text:`            if dist[u] + w < dist[v]:` },
      { id:8, text:`                dist[v] = dist[u] + w` },
      { id:9, text:`                changed = True` },
      { id:10, text:`        if not changed: break` },
      { id:11, text:`` },
      { id:12, text:`    # V-th round: check for negative cycle` },
      { id:13, text:`    for u, v, w in edges:` },
      { id:14, text:`        if dist[u] + w < dist[v]:` },
      { id:15, text:`            return True  # negative cycle!` },
      { id:16, text:`    return False` },
    ],
  },
};

/* ═══════════════════════════════════════════
   VISUALIZATION COMPONENTS
   ═══════════════════════════════════════════ */

function GraphView({ step, problem }) {
  const { activeEdge, dist } = step;
  const edges = problem.displayEdges;
  const positions = problem.positions;
  const source = problem.source;
  const isDirected = problem.directed;
  const labels = problem.nodeLabels;
  const isEquations = !!labels;

  return (
    <svg viewBox="0 0 520 300" className="w-full" style={{ maxHeight: 230 }}>
      {edges.map(([u, v, w], i) => {
        const f = positions[u], t = positions[v];
        const dx = t.x-f.x, dy = t.y-f.y, len = Math.sqrt(dx*dx+dy*dy);
        const r = 22;
        const sx = f.x+(dx/len)*r, sy = f.y+(dy/len)*r;
        const ex = t.x-(dx/len)*r, ey = t.y-(dy/len)*r;
        // offset perpendicular for directed (to separate opposing edges)
        const off = isDirected ? 10 : 0;
        const px = (dy/len)*off, py = -(dx/len)*off;
        const mx = (sx+ex)/2 + (dy/len)*14 + px, my = (sy+ey)/2 - (dx/len)*14 + py;
        const isActive = activeEdge && activeEdge[0]===u && activeEdge[1]===v;
        const isNeg = w < 0;
        const isCycleEdge = step.cycleEdges && step.cycleEdges.some(([cu,cv])=>cu===u&&cv===v);
        const color = isActive
          ? (step.phase==="relax" ? "#10b981" : step.phase==="negcycle" ? "#f59e0b" : "#ef4444")
          : isCycleEdge ? "#f59e0b"
          : isNeg ? "#f59e0b" : "#3f3f46";
        const wLabel = isEquations ? (w < 1 ? `1/${Math.round(1/w)}` : String(w)) : String(w);
        return (
          <g key={i}>
            {isDirected && (
              <defs>
                <marker id={`ba-${i}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                  <polygon points="0 0,7 2.5,0 5" fill={color} />
                </marker>
              </defs>
            )}
            <line x1={sx+px} y1={sy+py} x2={ex+px} y2={ey+py} stroke={color}
              strokeWidth={isActive?3:1.5}
              markerEnd={isDirected?`url(#ba-${i})`:undefined}
              strokeDasharray={isNeg&&!isActive?"5,3":"none"} />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central"
              fill={isActive?"#fbbf24":isNeg?"#f59e0b":"#71717a"} fontSize={isEquations?"10":"12"} fontWeight="700" fontFamily="monospace">{wLabel}</text>
          </g>
        );
      })}
      {positions.map((pos, id) => {
        const d = dist[id];
        const isActive = activeEdge && (activeEdge[0]===id || activeEdge[1]===id);
        const fill = id===source ? "#8b5cf6" : isActive ? "#3b82f6" : d!==INF ? "#10b981" : "#27272a";
        const stroke = id===source ? "#7c3aed" : isActive ? "#2563eb" : d!==INF ? "#059669" : "#52525b";
        const label = labels ? labels[id] : String(id);
        const topLabel = isEquations
          ? (step.valDisplay ? step.valDisplay[id] : "?")
          : fmt(d);
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={20} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="15" fontWeight="700" fontFamily="monospace">{label}</text>
            <text x={pos.x} y={pos.y-30} textAnchor="middle" fill={d===INF?"#52525b":"#a1a1aa"} fontSize="11" fontFamily="monospace">{topLabel}</text>
          </g>
        );
      })}
    </svg>
  );
}

function IOPanel({ step, problem, problemKey }) {
  const { phase, dist, relaxedEdges } = step;
  const done = phase === "done";
  const isEquations = problemKey === "equations";
  const isCity = problemKey === "city";
  const isNegCycle = problemKey === "negcycle";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          {isEquations ? (
            <>
              {P2_EQUATIONS.map(([a,b,v], i) => (
                <div key={i}><span className="text-zinc-300">{a}/{b} = {v}</span></div>
              ))}
            </>
          ) : isCity ? (
            <>
              <div><span className="text-zinc-500">n</span> = <span className="text-zinc-300">{P1_N}</span>, <span className="text-zinc-500">threshold</span> = <span className="text-blue-400">{P1_THRESHOLD}</span></div>
              <div className="text-zinc-500">{P1_UNDIRECTED.length} undirected edges</div>
              {P1_UNDIRECTED.map(([u,v,w], i) => (
                <div key={i} className="pl-2"><span className="text-zinc-300">{u}⟷{v} (w={w})</span></div>
              ))}
            </>
          ) : (
            <>
              <div><span className="text-zinc-500">n</span> = <span className="text-zinc-300">{problem.nodes}</span>, <span className="text-zinc-500">src</span> = <span className="text-blue-400">{problem.source}</span></div>
              <div><span className="text-zinc-500">{problem.edges.length} edges</span>{problem.edges.some(([,,w])=>w<0) && <span className="text-amber-400"> (has negative)</span>}</div>
              {problem.edges.map(([u,v,w], i) => (
                <div key={i} className="pl-2"><span className={w<0?"text-amber-300":"text-zinc-300"}>({u},{v},{w}){i<problem.edges.length-1?",":""}</span></div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected</div>
        <div className="font-mono text-[11px]">
          {isNegCycle || isEquations
            ? <span className="text-red-400">{problem.expectedLabel}</span>
            : <span className="text-zinc-300">{problem.expectedLabel}</span>}
        </div>
      </div>

      {/* LC 1334 summary table */}
      {isCity && (
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">All Cities (precomputed)</div>
          <div className="space-y-0.5 text-[10px] font-mono">
            {P1_ALL_RESULTS.map(r => (
              <div key={r.city} className={`flex items-center gap-2 px-1 py-0.5 rounded ${r.city===P1_EXPECTED?"bg-emerald-950/30":""}`}>
                <span className="text-zinc-500">City {r.city}:</span>
                <span className="text-zinc-400">[{r.dist.join(",")}]</span>
                <span className="text-zinc-500">→</span>
                <span className={r.count<=2?"text-emerald-400":"text-zinc-400"}>{r.count} nbrs</span>
                {r.city===P1_EXPECTED && <span className="text-emerald-500 ml-auto">◀ answer</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LC 2307 val display */}
      {isEquations && step.valDisplay && (
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">val[] (ratio assignments)</div>
          <div className="flex gap-2 font-mono text-[11px]">
            {P2_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-zinc-500">{label}=</span>
                <span className={step.valDisplay[i]==="?"?"text-zinc-600":"text-emerald-300 font-bold"}>{step.valDisplay[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General output */}
      {!isEquations && (
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output</div>
            {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
            {isNegCycle && phase === "fail" && <span className="text-[9px] bg-red-900 text-red-300 px-1.5 py-0.5 rounded font-bold">CYCLE FOUND</span>}
          </div>
          <div className="font-mono text-[11px] flex items-center gap-0.5 flex-wrap">
            <span className="text-zinc-500">dist = [</span>
            {dist.map((d,i) => (
              <span key={i} className="flex items-center">
                <span className={done?"text-emerald-300 font-bold":d<INF?"text-zinc-300":"text-zinc-600"}>{d<INF?d:"?"}</span>
                {i < dist.length-1 && <span className="text-zinc-600">, </span>}
              </span>
            ))}
            <span className="text-zinc-500">]</span>
          </div>
          {relaxedEdges && relaxedEdges.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {relaxedEdges.slice(-6).map((r, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-zinc-600 font-mono">R{r.round}</span>
                  <span className="text-emerald-400/80">{r.edge}</span>
                  <span className="text-zinc-700">{fmt(r.from)}→{r.to}</span>
                  <span className="text-emerald-600">✓</span>
                </div>
              ))}
            </div>
          )}
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
export default function BellmanFordViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];
  const steps = useMemo(() => problem.buildSteps(), [pKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const switchProblem = (k) => { setPKey(k); setSi(0); };
  const isEquations = pKey === "equations";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bellman-Ford Algorithm</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Shortest Path with Negative Edges • O(V × E)</p>
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
            <IOPanel step={step} problem={problem} problemKey={pKey} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">
                {problem.nodes}N, {problem.displayEdges.length}E • src: {problem.nodeLabels ? problem.nodeLabels[problem.source] : problem.source}
                {problem.edges.some(([,,w])=>w<0) && " • dashed = negative"}
                {!problem.directed && " • undirected"}
              </div>
              <GraphView step={step} problem={problem} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Source</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Active</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{isEquations?"Assigned":"Reached"}</span>
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "fail" || step.phase === "negcycle" ? "bg-red-950/30 border-red-900" :
              step.phase === "check" ? "bg-amber-950/30 border-amber-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length-1)+1}/{steps.length}</span>
                {step.round > 0 && <span className="text-[10px] text-zinc-600 font-mono">Round {step.round}</span>}
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "relax" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "skip" ? "bg-red-900 text-red-300" :
                  step.phase === "round" ? "bg-blue-900 text-blue-300" :
                  step.phase === "early" ? "bg-amber-900 text-amber-300" :
                  step.phase === "check" ? "bg-amber-900 text-amber-300" :
                  step.phase === "negcycle" ? "bg-red-900 text-red-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "fail" ? "bg-red-900 text-red-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* dist[] / val[] array */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">{isEquations ? "val[]" : "dist[]"}</div>
              <div className="flex gap-1.5">
                {step.dist.map((d, i) => {
                  const changed = step.changed === i;
                  const prevVal = step.prevDist ? step.prevDist[i] : null;
                  const label = problem.nodeLabels ? problem.nodeLabels[i] : String(i);
                  const val = isEquations
                    ? (step.valDisplay ? step.valDisplay[i] : "?")
                    : (d === INF ? "∞" : d);
                  const isDone = step.phase === "done";
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{label}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        changed ? "bg-emerald-950 border-emerald-700 text-emerald-200 scale-110" :
                        isDone ? "bg-emerald-950/30 border-emerald-800 text-emerald-300" :
                        d === INF ? "bg-zinc-900 border-zinc-700 text-zinc-600" :
                        "bg-zinc-900 border-zinc-700 text-zinc-300"
                      }`}>
                        {changed && prevVal !== null && !isEquations
                          ? <span><span className="text-zinc-600 line-through text-[10px]">{prevVal===INF?"∞":prevVal}</span> {val}</span>
                          : val}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Edge List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                {isEquations ? "Ratio Edges" : "Edge List"} (processed in order)
              </div>
              <div className="space-y-0.5">
                {problem.edges.map(([u, v, w], i) => {
                  const isActive = step.edgeIdx === i;
                  const uLabel = problem.nodeLabels ? problem.nodeLabels[u] : u;
                  const vLabel = problem.nodeLabels ? problem.nodeLabels[v] : v;
                  const wLabel = isEquations ? (w < 1 ? `×1/${Math.round(1/w)}` : `×${w}`) : `w=${w}`;
                  return (
                    <div key={i} className={`flex items-center gap-2 px-2 py-0.5 rounded-lg font-mono text-xs ${
                      isActive ? "bg-blue-950/50 border border-blue-800" : "border border-transparent"
                    }`}>
                      <span className={isActive ? "text-blue-400" : "text-zinc-500"}>{uLabel} → {vLabel}</span>
                      <span className={`px-1 rounded ${w < 0 ? "text-amber-400" : "text-zinc-500"}`}>{wLabel}</span>
                      {isActive && <span className="text-blue-500 text-[10px] ml-auto">◀ current</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Negative cycle / contradiction warning */}
            {step.cycleEdges && step.cycleEdges.length > 0 && (
              <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1.5">
                  {isEquations ? "⚠ Contradiction Detected" : "⚠ Negative Cycle Detected"}
                </div>
                <div className="font-mono text-[10px] text-red-300">
                  {isEquations
                    ? "a/b=2, b/c=3 → a/c should be 6, but equation says a/c=5"
                    : "Cycle: 1 → 2 → 3 → 1 (weight = 3 + (−6) + 1 = −2)"}
                </div>
                <div className="text-[10px] text-red-400/70 mt-1">
                  {isEquations
                    ? "The system of equations is inconsistent. No valid assignment exists."
                    : "Distances decrease infinitely. Shortest paths undefined for affected nodes."}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-4">
            <CodePanel code={problem.code} highlightLines={step.codeHL} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use Bellman-Ford</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Shortest path with negative edge weights</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Detecting negative cycles (run V-th round)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>K-limited paths: run K+1 rounds with dist copy</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Checking consistency in constraint/ratio graphs</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V × E) per source</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V)</div>
                <div><span className="text-zinc-500 font-semibold">vs Dijkstra:</span> Slower but handles negative edges</div>
              </div>
            </div>
          </div>

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