import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   Dijkstra's Algorithm — 4 Classic Problems Showcase
   1. Network Delay Time (LC 743)       — vanilla graph
   2. Path With Min Effort (LC 1631)    — grid + edge-diff cost
   3. Cheapest Flights K Stops (LC 787) — state-space Dijkstra
   4. Swim in Rising Water (LC 778)     — grid + minimax cost
   ═══════════════════════════════════════════════════════════ */

const DIRS = [[0,1],[1,0],[0,-1],[-1,0]];
const INF = Infinity;
const fmt = v => v === INF ? "∞" : v;

/* ─────────────────────────────────────────────
   ALGORITHM TAB: Original generic Dijkstra demo
   ───────────────────────────────────────────── */
const ALG_NODES = 5;
const ALG_EDGES = [[0,1,6],[0,2,2],[2,1,1],[1,3,3],[2,3,5],[3,4,2],[2,4,7]];
const ALG_POS = [{x:60,y:150},{x:180,y:50},{x:180,y:250},{x:310,y:150},{x:430,y:150}];
const ALG_SOURCE = 0;
const ALG_EXPECTED_DIST = [0, 3, 2, 6, 8];
const ALG_EXPECTED_PATHS = { 0:[0], 1:[0,2,1], 2:[0,2], 3:[0,2,1,3], 4:[0,2,1,3,4] };
const ALG_ADJ = (() => {
  const g = Array.from({length:ALG_NODES}, ()=>[]);
  for (const [u,v,w] of ALG_EDGES) g[u].push([v,w]);
  return g;
})();

function buildAlgSteps() {
  const graph = Array.from({length:ALG_NODES}, ()=>[]);
  for (const [u,v,w] of ALG_EDGES) graph[u].push([v,w]);
  const dist = new Array(ALG_NODES).fill(INF);
  dist[ALG_SOURCE] = 0;
  const visited = new Set(), finalized = new Set(), prev = new Array(ALG_NODES).fill(-1);
  const steps = [];

  steps.push({
    title: "Initialize — Set Source Distance to 0",
    detail: `dist = [0, ∞, ∞, ∞, ∞]. Push (cost=0, node=0) into the min-heap.`,
    dist:[...dist], prevDist:null, visited:new Set(), pq:[[0,ALG_SOURCE]],
    current:null, neighbor:null, activeEdge:null, phase:"init", codeHL:[3,4,5,6,7],
    prev:[...prev], changedNode:null, finalized:new Set(), paths:null,
  });

  const pq = [[0, ALG_SOURCE]];
  while (pq.length) {
    pq.sort((a,b) => a[0]-b[0]);
    const [d,u] = pq.shift();
    if (visited.has(u)) continue;
    finalized.add(u);

    steps.push({
      title: `Pop Node ${u} (dist=${d})`,
      detail: `Heap-pop → (${d}, ${u}). Node ${u} is unvisited, so mark visited and explore its ${graph[u].length} neighbor(s).`,
      dist:[...dist], prevDist:[...dist], visited:new Set(visited), pq:pq.map(x=>[...x]),
      current:u, neighbor:null, activeEdge:null, phase:"visit", codeHL:[9,10,11,12,13],
      prev:[...prev], changedNode:null, finalized:new Set(finalized), paths:null,
    });
    visited.add(u);

    for (const [v,w] of graph[u]) {
      const nd = d + w;
      const prevDistSnap = [...dist];
      const improved = nd < dist[v];
      if (improved) { dist[v] = nd; prev[v] = u; pq.push([nd, v]); }

      steps.push({
        title: improved
          ? `Relax ${u}→${v}: dist[${v}] = ${fmt(prevDistSnap[v])} → ${nd}`
          : `Edge ${u}→${v}: No Improvement (${nd} ≥ ${dist[v]})`,
        detail: improved
          ? `dist[${u}] + w(${u},${v}) = ${d} + ${w} = ${nd} < ${fmt(prevDistSnap[v])}. Update dist[${v}] = ${nd}, push (${nd}, ${v}) to heap.`
          : `dist[${u}] + w(${u},${v}) = ${d} + ${w} = ${nd} ≥ ${dist[v]}. No update needed.`,
        dist:[...dist], prevDist:prevDistSnap, visited:new Set(visited), pq:pq.map(x=>[...x]),
        current:u, neighbor:v, activeEdge:[u,v], phase:improved?"relax":"skip",
        codeHL:improved?[15,16,17,18]:[15,16],
        prev:[...prev], changedNode:improved?v:null, finalized:new Set(finalized), paths:null,
      });
    }
  }

  const paths = {};
  for (let i = 0; i < ALG_NODES; i++) {
    const p = []; let c = i;
    while (c !== -1) { p.unshift(c); c = prev[c]; }
    paths[i] = p;
  }

  steps.push({
    title: "✓ Complete — All Shortest Paths Found",
    detail: `dist = [${dist.join(", ")}]. Matches expected output.`,
    dist:[...dist], prevDist:[...dist], visited:new Set(visited), pq:[],
    current:null, neighbor:null, activeEdge:null, phase:"done", codeHL:[20],
    prev:[...prev], changedNode:null, finalized:new Set(finalized), paths,
  });
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 1: Network Delay Time (LC 743)
   ───────────────────────────────────────────── */
const P1_NODES = 6;
const P1_EDGES = [[0,1,2],[0,2,4],[1,2,1],[1,3,7],[2,4,3],[4,3,2],[3,5,1],[4,5,5]];
const P1_SRC = 0;
const P1_POS = [{x:50,y:140},{x:170,y:50},{x:170,y:230},{x:340,y:50},{x:340,y:230},{x:460,y:140}];

function buildP1Steps() {
  const graph = Array.from({length:P1_NODES}, ()=>[]);
  for (const [u,v,w] of P1_EDGES) graph[u].push([v,w]);
  const dist = new Array(P1_NODES).fill(INF);
  dist[P1_SRC] = 0;
  const visited = new Set(), finalized = new Set(), prev = new Array(P1_NODES).fill(-1);
  const steps = [];
  const pq = [[0, P1_SRC]];

  steps.push({
    title: "Initialize — dist[0] = 0, push (0, 0)",
    detail: `Set source node ${P1_SRC} distance to 0, all others ∞. Push (cost=0, node=0) into min-heap.`,
    dist:[...dist], visited:new Set(), pq:pq.map(x=>[...x]), current:null, neighbor:null,
    activeEdge:null, phase:"init", codeHL:[2,3,4,5], finalized:new Set(), changedNode:null, prev:[...prev],
  });

  while (pq.length) {
    pq.sort((a,b) => a[0]-b[0]);
    const [d,u] = pq.shift();
    if (visited.has(u)) continue;
    finalized.add(u);

    steps.push({
      title: `Pop Node ${u} (dist=${d}) — Mark Visited`,
      detail: `Heap-pop → (${d}, ${u}). Node ${u} unvisited → mark visited, explore ${graph[u].length} neighbor(s).`,
      dist:[...dist], visited:new Set(visited), pq:pq.map(x=>[...x]), current:u, neighbor:null,
      activeEdge:null, phase:"visit", codeHL:[7,8,9,10,11], finalized:new Set(finalized), changedNode:null, prev:[...prev],
    });
    visited.add(u);

    for (const [v,w] of graph[u]) {
      const nd = d + w;
      const prevDist = dist[v];
      const improved = nd < dist[v];
      if (improved) { dist[v] = nd; prev[v] = u; pq.push([nd, v]); }

      steps.push({
        title: improved
          ? `Relax ${u}→${v}: dist[${v}] = ${fmt(prevDist)} → ${nd}`
          : `Edge ${u}→${v}: No Improvement (${nd} ≥ ${dist[v]})`,
        detail: improved
          ? `dist[${u}] + w(${u},${v}) = ${d} + ${w} = ${nd} < ${fmt(prevDist)}. Update & push.`
          : `dist[${u}] + w(${u},${v}) = ${d} + ${w} = ${nd} ≥ ${dist[v]}. Skip.`,
        dist:[...dist], visited:new Set(visited), pq:pq.map(x=>[...x]), current:u, neighbor:v,
        activeEdge:[u,v], phase:improved?"relax":"skip", codeHL:improved?[13,14,15]:[13],
        finalized:new Set(finalized), changedNode:improved?v:null, prev:[...prev],
      });
    }
  }

  const maxDist = Math.max(...dist);
  steps.push({
    title: `✓ All Nodes Reached — Answer: ${maxDist}`,
    detail: `dist = [${dist.join(", ")}]. Network delay = max(dist) = ${maxDist}.`,
    dist:[...dist], visited:new Set(visited), pq:[], current:null, neighbor:null,
    activeEdge:null, phase:"done", codeHL:[17], finalized:new Set(finalized), changedNode:null, prev:[...prev],
  });
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 2: Path With Minimum Effort (LC 1631)
   ───────────────────────────────────────────── */
const P2_ROWS = 5, P2_COLS = 5;
const P2_GRID = [
  [1, 3, 5, 2, 8],
  [4, 2, 1, 7, 3],
  [1, 5, 8, 4, 2],
  [6, 3, 1, 3, 7],
  [2, 4, 6, 1, 1],
];

function buildP2Steps() {
  const R = P2_ROWS, C = P2_COLS;
  const dist = Array.from({length:R}, ()=> new Array(C).fill(INF));
  dist[0][0] = 0;
  const steps = [];
  const visited = new Set();
  const pq = [[0, 0, 0]]; // [effort, r, c]

  steps.push({
    title: "Initialize — effort[0][0] = 0",
    detail: `Start at top-left. Effort to reach (0,0) = 0. Push (0, 0, 0) into min-heap. Goal: reach (${R-1},${C-1}) with minimum max-absolute-difference.`,
    dist:dist.map(r=>[...r]), visited:new Set(), pq:pq.map(x=>[...x]),
    current:null, neighbor:null, phase:"init", codeHL:[2,3,4,5],
  });

  let found = false;
  while (pq.length && !found) {
    pq.sort((a,b) => a[0]-b[0]);
    const [d, r, c] = pq.shift();
    const key = `${r},${c}`;
    if (visited.has(key)) continue;

    const unvisitedNeighbors = DIRS.filter(([dr,dc])=>{const nr=r+dr,nc=c+dc;return nr>=0&&nr<R&&nc>=0&&nc<C&&!visited.has(`${nr},${nc}`)}).length;

    steps.push({
      title: `Pop (${r},${c}) effort=${d}`,
      detail: `Heap-pop → (effort=${d}, row=${r}, col=${c}).${r===R-1&&c===C-1 ? " This is the destination! Return " + d + "." : ` Explore ${unvisitedNeighbors} unvisited neighbor(s).`}`,
      dist:dist.map(r=>[...r]), visited:new Set(visited), pq:pq.map(x=>[...x]),
      current:[r,c], neighbor:null, phase:r===R-1&&c===C-1?"done":"visit", codeHL:[8,9,10,11],
    });

    if (r === R-1 && c === C-1) { found = true; break; }
    visited.add(key);

    for (const [dr, dc] of DIRS) {
      const nr = r+dr, nc = c+dc;
      if (nr<0||nr>=R||nc<0||nc>=C) continue;
      const nk = `${nr},${nc}`;
      if (visited.has(nk)) continue;
      const effort = Math.max(d, Math.abs(P2_GRID[nr][nc] - P2_GRID[r][c]));
      const prevD = dist[nr][nc];
      const improved = effort < prevD;
      if (improved) { dist[nr][nc] = effort; pq.push([effort, nr, nc]); }

      steps.push({
        title: improved
          ? `Relax → (${nr},${nc}): effort ${fmt(prevD)} → ${effort}`
          : `Edge → (${nr},${nc}): No Improvement`,
        detail: improved
          ? `max(${d}, |${P2_GRID[nr][nc]}-${P2_GRID[r][c]}|) = max(${d}, ${Math.abs(P2_GRID[nr][nc]-P2_GRID[r][c])}) = ${effort}. Update & push.`
          : `max(${d}, |${P2_GRID[nr][nc]}-${P2_GRID[r][c]}|) = ${effort} ≥ ${dist[nr][nc]}. Skip.`,
        dist:dist.map(r=>[...r]), visited:new Set(visited), pq:pq.map(x=>[...x]),
        current:[r,c], neighbor:[nr,nc], phase:improved?"relax":"skip", codeHL:improved?[13,14,15,16]:[13,14],
      });
    }
  }

  if (!found) {
    steps.push({
      title: `✓ Complete — Min Effort = ${dist[R-1][C-1]}`,
      detail: `Minimum effort path from (0,0) to (${R-1},${C-1}) = ${dist[R-1][C-1]}.`,
      dist:dist.map(r=>[...r]), visited:new Set(visited), pq:[],
      current:[R-1,C-1], neighbor:null, phase:"done", codeHL:[10,11],
    });
  }
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 3: Cheapest Flights K Stops (LC 787)
   ───────────────────────────────────────────── */
const P3_NODES = 5;
const P3_FLIGHTS = [[0,1,100],[0,2,500],[1,2,100],[1,3,600],[2,3,200],[3,4,100]];
const P3_SRC = 0, P3_DST = 4, P3_K = 3;
const P3_POS = [{x:60,y:140},{x:180,y:50},{x:180,y:230},{x:340,y:140},{x:470,y:140}];

function buildP3Steps() {
  const graph = Array.from({length:P3_NODES}, ()=>[]);
  for (const [u,v,w] of P3_FLIGHTS) graph[u].push([v,w]);
  const dist = new Array(P3_NODES).fill(INF);
  dist[P3_SRC] = 0;
  const steps = [];
  const pq = [[0, P3_SRC, 0]]; // [cost, node, stops_used]
  const visited = new Set();

  steps.push({
    title: `Initialize — src=${P3_SRC}, dst=${P3_DST}, K=${P3_K} stops`,
    detail: `State = (cost, city, stops_used). Push (0, ${P3_SRC}, 0). At most ${P3_K} intermediate stops allowed (${P3_K+1} edges total).`,
    dist:[...dist], pq:pq.map(x=>[...x]), current:null, neighbor:null, visited:new Set(),
    activeEdge:null, phase:"init", codeHL:[2,3,4,5,6,7,8], stops:null, found:false, finalized:new Set(),
  });

  let answer = INF;
  while (pq.length) {
    pq.sort((a,b) => a[0]-b[0]);
    const [cost, u, stops] = pq.shift();

    if (u === P3_DST) {
      answer = cost;
      steps.push({
        title: `✓ Reached City ${P3_DST} — Cost = ${cost}`,
        detail: `Popped (cost=${cost}, city=${P3_DST}, stops=${stops}). Cheapest route within ${P3_K} stops found. Answer = ${cost}.`,
        dist:[...dist], pq:pq.map(x=>[...x]), current:u, neighbor:null, visited:new Set(visited),
        activeEdge:null, phase:"done", codeHL:[11,12], stops, found:true, finalized:new Set(visited),
      });
      break;
    }

    if (cost > dist[u]) continue;

    steps.push({
      title: `Pop City ${u} (cost=${cost}, stops=${stops})`,
      detail: `Heap-pop → (cost=${cost}, city=${u}, stops=${stops}).${stops > P3_K ? " Max stops exceeded — skip." : ` Can use ${P3_K - stops} more stop(s). Explore ${graph[u].length} flight(s).`}`,
      dist:[...dist], pq:pq.map(x=>[...x]), current:u, neighbor:null, visited:new Set(visited),
      activeEdge:null, phase:stops > P3_K ? "skip" : "visit", codeHL:[10,11,12,13], stops, found:false, finalized:new Set(visited),
    });

    if (stops > P3_K) continue;
    visited.add(u);

    for (const [v, w] of graph[u]) {
      const nc = cost + w;
      const prevD = dist[v];
      const improved = nc < dist[v];
      if (improved) { dist[v] = nc; pq.push([nc, v, stops + 1]); }

      steps.push({
        title: improved
          ? `Relax ${u}→${v}: cost ${fmt(prevD)} → ${nc} (stops=${stops+1})`
          : `Flight ${u}→${v}: No Improvement (${nc} ≥ ${dist[v]})`,
        detail: improved
          ? `${cost} + ${w} = ${nc} < ${fmt(prevD)}. Push (${nc}, ${v}, ${stops+1}).`
          : `${cost} + ${w} = ${nc} ≥ ${dist[v]}. Skip.`,
        dist:[...dist], pq:pq.map(x=>[...x]), current:u, neighbor:v, visited:new Set(visited),
        activeEdge:[u,v], phase:improved?"relax":"skip", codeHL:improved?[15,16,17,18,19]:[15,16,17], stops, found:false, finalized:new Set(visited),
      });
    }
  }

  if (answer === INF) {
    steps.push({
      title: "✗ No Path Within K Stops",
      detail: `Cannot reach city ${P3_DST} from ${P3_SRC} within ${P3_K} stops. Return -1.`,
      dist:[...dist], pq:[], current:null, neighbor:null, visited:new Set(visited),
      activeEdge:null, phase:"fail", codeHL:[21], stops:null, found:false, finalized:new Set(visited),
    });
  }
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 4: Swim in Rising Water (LC 778)
   ───────────────────────────────────────────── */
const P4_ROWS = 5, P4_COLS = 5;
const P4_GRID = [
  [ 0, 2, 3, 1, 5],
  [ 3, 1, 4, 6, 2],
  [ 5, 7, 2, 3, 1],
  [ 4, 1, 6, 2, 8],
  [ 6, 3, 1, 4, 0],
];

function buildP4Steps() {
  const R = P4_ROWS, C = P4_COLS;
  const dist = Array.from({length:R}, ()=> new Array(C).fill(INF));
  dist[0][0] = P4_GRID[0][0];
  const steps = [];
  const visited = new Set();
  const pq = [[P4_GRID[0][0], 0, 0]];

  steps.push({
    title: `Initialize — time[0][0] = ${P4_GRID[0][0]}`,
    detail: `Start at top-left with elevation ${P4_GRID[0][0]}. Must wait until time ≥ max(elevation along path). Push (${P4_GRID[0][0]}, 0, 0). Goal: reach (${R-1},${C-1}).`,
    dist:dist.map(r=>[...r]), visited:new Set(), pq:pq.map(x=>[...x]),
    current:null, neighbor:null, phase:"init", codeHL:[2,3,4,5,6],
  });

  let found = false;
  while (pq.length && !found) {
    pq.sort((a,b) => a[0]-b[0]);
    const [d, r, c] = pq.shift();
    const key = `${r},${c}`;
    if (visited.has(key)) continue;

    steps.push({
      title: `Pop (${r},${c}) time=${d}`,
      detail: `Heap-pop → (time=${d}, row=${r}, col=${c}).${r===R-1&&c===C-1 ? " Destination reached! Return " + d + "." : " Explore neighbors."}`,
      dist:dist.map(r=>[...r]), visited:new Set(visited), pq:pq.map(x=>[...x]),
      current:[r,c], neighbor:null, phase:r===R-1&&c===C-1?"done":"visit", codeHL:[8,9,10,11],
    });

    if (r === R-1 && c === C-1) { found = true; break; }
    visited.add(key);

    for (const [dr, dc] of DIRS) {
      const nr = r+dr, nc = c+dc;
      if (nr<0||nr>=R||nc<0||nc>=C) continue;
      const nk = `${nr},${nc}`;
      if (visited.has(nk)) continue;
      const time = Math.max(d, P4_GRID[nr][nc]);
      const prevD = dist[nr][nc];
      const improved = time < prevD;
      if (improved) { dist[nr][nc] = time; pq.push([time, nr, nc]); }

      steps.push({
        title: improved
          ? `Relax → (${nr},${nc}): time → ${time}`
          : `Edge → (${nr},${nc}): No Improvement`,
        detail: improved
          ? `max(${d}, elevation[${nr}][${nc}]=${P4_GRID[nr][nc]}) = ${time} < ${fmt(prevD)}. Update & push.`
          : `max(${d}, ${P4_GRID[nr][nc]}) = ${time} ≥ ${dist[nr][nc]}. Skip.`,
        dist:dist.map(r=>[...r]), visited:new Set(visited), pq:pq.map(x=>[...x]),
        current:[r,c], neighbor:[nr,nc], phase:improved?"relax":"skip", codeHL:improved?[13,14,15,16]:[13,14],
      });
    }
  }

  if (!found) {
    steps.push({
      title: `✓ Complete — Min Time = ${dist[P4_ROWS-1][P4_COLS-1]}`,
      detail: `Minimum time to swim from (0,0) to (${P4_ROWS-1},${P4_COLS-1}) = ${dist[P4_ROWS-1][P4_COLS-1]}.`,
      dist:dist.map(r=>[...r]), visited:new Set(visited), pq:[],
      current:[P4_ROWS-1,P4_COLS-1], neighbor:null, phase:"done", codeHL:[10,11],
    });
  }
  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title: "Algorithm",
    lc: null,
    difficulty: null,
    tag: "Core Pattern",
    coreIdea: "Dijkstra's greedily selects the closest unvisited node via a priority queue, then relaxes all its edges. Because edge weights are non-negative, once a node is popped from the queue, its shortest distance is final. This is the foundation for GPS routing, network protocols (OSPF), and game AI pathfinding.",
    type: "graph",
    expected: null,
    buildSteps: buildAlgSteps,
    code: [
      { id:0,  text:`import heapq` },
      { id:1,  text:`` },
      { id:2,  text:`def dijkstra(graph, src):` },
      { id:3,  text:`    n = len(graph)` },
      { id:4,  text:`    dist = [float('inf')] * n` },
      { id:5,  text:`    dist[src] = 0` },
      { id:6,  text:`    pq = [(0, src)]` },
      { id:7,  text:`    visited = set()` },
      { id:8,  text:`` },
      { id:9,  text:`    while pq:` },
      { id:10, text:`        d, u = heapq.heappop(pq)` },
      { id:11, text:`        if u in visited:` },
      { id:12, text:`            continue` },
      { id:13, text:`        visited.add(u)` },
      { id:14, text:`` },
      { id:15, text:`        for v, w in graph[u]:` },
      { id:16, text:`            if d + w < dist[v]:` },
      { id:17, text:`                dist[v] = d + w` },
      { id:18, text:`                heapq.heappush(pq, (dist[v], v))` },
      { id:19, text:`` },
      { id:20, text:`    return dist` },
    ],
  },
  network: {
    title: "Network Delay Time",
    lc: "743",
    difficulty: "Medium",
    tag: "Vanilla Dijkstra",
    coreIdea: "Run Dijkstra from the source node. The answer is the maximum shortest distance across all nodes — that's the time for the signal to reach every node. If any node is unreachable, return -1. Pure textbook single-source shortest path.",
    type: "graph",
    expected: 9,
    buildSteps: buildP1Steps,
    code: [
      { id:0,  text:`import heapq` },
      { id:1,  text:`` },
      { id:2,  text:`def networkDelayTime(times, n, k):` },
      { id:3,  text:`    graph = defaultdict(list)` },
      { id:4,  text:`    for u, v, w in times:` },
      { id:5,  text:`        graph[u].append((v, w))` },
      { id:6,  text:`` },
      { id:7,  text:`    dist = [inf] * (n + 1)` },
      { id:8,  text:`    dist[k] = 0` },
      { id:9,  text:`    pq = [(0, k)]` },
      { id:10, text:`    visited = set()` },
      { id:11, text:`` },
      { id:12, text:`    while pq:` },
      { id:13, text:`        d, u = heappop(pq)` },
      { id:14, text:`        if u in visited: continue` },
      { id:15, text:`        visited.add(u)` },
      { id:16, text:`        for v, w in graph[u]:` },
      { id:17, text:`            if d + w < dist[v]:` },
      { id:18, text:`                dist[v] = d + w` },
      { id:19, text:`                heappush(pq, (dist[v], v))` },
      { id:20, text:`` },
      { id:21, text:`    ans = max(dist[1:])` },
      { id:22, text:`    return ans if ans < inf else -1` },
    ],
  },
  effort: {
    title: "Path With Min Effort",
    lc: "1631",
    difficulty: "Medium",
    tag: "Grid + Edge-Diff",
    coreIdea: "Treat the grid as a graph where edge weight = absolute height difference between adjacent cells. Use Dijkstra where dist[r][c] = minimum possible maximum-difference along any path from (0,0) to (r,c). The cost function is max() instead of sum().",
    type: "grid",
    rows: P2_ROWS, cols: P2_COLS, grid: P2_GRID,
    expected: 3,
    buildSteps: buildP2Steps,
    code: [
      { id:0,  text:`import heapq` },
      { id:1,  text:`` },
      { id:2,  text:`def minimumEffortPath(heights):` },
      { id:3,  text:`    R, C = len(heights), len(heights[0])` },
      { id:4,  text:`    dist = [[inf]*C for _ in range(R)]` },
      { id:5,  text:`    dist[0][0] = 0` },
      { id:6,  text:`    pq = [(0, 0, 0)]  # (effort, r, c)` },
      { id:7,  text:`` },
      { id:8,  text:`    while pq:` },
      { id:9,  text:`        d, r, c = heappop(pq)` },
      { id:10, text:`        if r == R-1 and c == C-1:` },
      { id:11, text:`            return d` },
      { id:12, text:`        if d > dist[r][c]: continue` },
      { id:13, text:`        for nr, nc in neighbors(r, c):` },
      { id:14, text:`            e = max(d, abs(heights[nr][nc] - heights[r][c]))` },
      { id:15, text:`            if e < dist[nr][nc]:` },
      { id:16, text:`                dist[nr][nc] = e` },
      { id:17, text:`                heappush(pq, (e, nr, nc))` },
    ],
  },
  flights: {
    title: "Cheapest Flights K Stops",
    lc: "787",
    difficulty: "Medium",
    tag: "Constrained State",
    coreIdea: "Standard Dijkstra won't work because a cheaper path might use more stops. Expand state to (cost, city, stops_used). Prune if stops exceed K. The first time we pop the destination, that's the answer. This is state-space Dijkstra — the graph is implicit.",
    type: "graph",
    expected: 500,
    buildSteps: buildP3Steps,
    code: [
      { id:0,  text:`import heapq` },
      { id:1,  text:`` },
      { id:2,  text:`def findCheapestPrice(n, flights, src, dst, k):` },
      { id:3,  text:`    graph = defaultdict(list)` },
      { id:4,  text:`    for u, v, w in flights:` },
      { id:5,  text:`        graph[u].append((v, w))` },
      { id:6,  text:`    dist = [inf] * n` },
      { id:7,  text:`    dist[src] = 0` },
      { id:8,  text:`    pq = [(0, src, 0)]  # (cost, city, stops)` },
      { id:9,  text:`` },
      { id:10, text:`    while pq:` },
      { id:11, text:`        cost, u, stops = heappop(pq)` },
      { id:12, text:`        if u == dst: return cost` },
      { id:13, text:`        if stops > k: continue` },
      { id:14, text:`        if cost > dist[u]: continue` },
      { id:15, text:`        for v, w in graph[u]:` },
      { id:16, text:`            nc = cost + w` },
      { id:17, text:`            if nc < dist[v]:` },
      { id:18, text:`                dist[v] = nc` },
      { id:19, text:`                heappush(pq, (nc, v, stops+1))` },
      { id:20, text:`` },
      { id:21, text:`    return -1` },
    ],
  },
  swim: {
    title: "Swim in Rising Water",
    lc: "778",
    difficulty: "Hard",
    tag: "Minimax Path",
    coreIdea: "At time t you can swim through any cell with elevation ≤ t. Minimize the time to reach the bottom-right. This is a minimax path: dist[r][c] = min over all paths of (max elevation along that path). Dijkstra with cost = max(current_time, neighbor_elevation).",
    type: "grid",
    rows: P4_ROWS, cols: P4_COLS, grid: P4_GRID,
    expected: 4,
    buildSteps: buildP4Steps,
    code: [
      { id:0,  text:`import heapq` },
      { id:1,  text:`` },
      { id:2,  text:`def swimInWater(grid):` },
      { id:3,  text:`    n = len(grid)` },
      { id:4,  text:`    dist = [[inf]*n for _ in range(n)]` },
      { id:5,  text:`    dist[0][0] = grid[0][0]` },
      { id:6,  text:`    pq = [(grid[0][0], 0, 0)]` },
      { id:7,  text:`` },
      { id:8,  text:`    while pq:` },
      { id:9,  text:`        d, r, c = heappop(pq)` },
      { id:10, text:`        if r == n-1 and c == n-1:` },
      { id:11, text:`            return d` },
      { id:12, text:`        if d > dist[r][c]: continue` },
      { id:13, text:`        for nr, nc in neighbors(r, c):` },
      { id:14, text:`            t = max(d, grid[nr][nc])` },
      { id:15, text:`            if t < dist[nr][nc]:` },
      { id:16, text:`                dist[nr][nc] = t` },
      { id:17, text:`                heappush(pq, (t, nr, nc))` },
    ],
  },
};

/* ═══════════════════════════════════════════
   VISUALIZATION COMPONENTS
   ═══════════════════════════════════════════ */

/* ── Graph SVG (for network & flights problems) ── */
function GraphView({ step, edges, positions, nodeCount }) {
  const { visited, current, neighbor, activeEdge } = step;
  const vis = visited || new Set();
  return (
    <svg viewBox="0 0 530 280" className="w-full" style={{ maxHeight: 220 }}>
      {edges.map(([u, v, w], i) => {
        const f = positions[u], t = positions[v];
        const dx = t.x-f.x, dy = t.y-f.y, len = Math.sqrt(dx*dx+dy*dy);
        const r = 20;
        const sx = f.x+(dx/len)*r, sy = f.y+(dy/len)*r;
        const ex = t.x-(dx/len)*r, ey = t.y-(dy/len)*r;
        const mx = (sx+ex)/2 + (dy/len)*12, my = (sy+ey)/2 - (dx/len)*12;
        const isActive = activeEdge && activeEdge[0]===u && activeEdge[1]===v;
        const col = isActive
          ? (step.phase==="relax" ? "#10b981" : "#ef4444")
          : vis.has(u) && vis.has(v) ? "#059669" : "#3f3f46";
        return (
          <g key={`e${i}`}>
            <defs>
              <marker id={`ga${i}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={col} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={col} strokeWidth={isActive?3:1.5} markerEnd={`url(#ga${i})`} />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fill={isActive?"#fbbf24":"#71717a"} fontSize="11" fontWeight="600" fontFamily="monospace">{w}</text>
          </g>
        );
      })}
      {positions.map((pos, id) => {
        const isCurr = current===id;
        const isNb = neighbor===id;
        const isVis = vis.has(id);
        const fill = isCurr ? "#3b82f6" : isNb ? "#f59e0b" : isVis ? "#10b981" : "#27272a";
        const stroke = isCurr ? "#2563eb" : isNb ? "#d97706" : isVis ? "#059669" : "#52525b";
        return (
          <g key={`n${id}`}>
            <circle cx={pos.x} cy={pos.y} r={18} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="14" fontWeight="700" fontFamily="monospace">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Grid SVG (for effort & swim problems) ── */
function GridView({ step, grid, rows, cols, problemKey }) {
  const { dist, visited, current, neighbor } = step;
  const vis = visited || new Set();
  const cellSize = 46;
  const cur = current ? `${current[0]},${current[1]}` : null;
  const nb = neighbor ? `${neighbor[0]},${neighbor[1]}` : null;

  return (
    <svg viewBox={`0 0 ${cols*cellSize+2} ${rows*cellSize+2}`} className="w-full" style={{ maxHeight: 240 }}>
      {Array.from({length:rows}, (_,r) =>
        Array.from({length:cols}, (_,c) => {
          const k = `${r},${c}`;
          const d = dist[r][c];
          const isVis = vis.has(k);
          const isCurr = k === cur;
          const isNb = k === nb;
          const isStart = r===0 && c===0;
          const isEnd = r===rows-1 && c===cols-1;

          let fill = "#18181b";
          if (isCurr) fill = "#1e40af";
          else if (isNb) fill = step.phase==="relax" ? "#065f46" : "#7f1d1d";
          else if (isVis) fill = "#052e16";
          else if (d < INF && d > 0) fill = "#0c2d1e";

          let stroke = "#27272a";
          if (isCurr) stroke = "#3b82f6";
          else if (isNb) stroke = step.phase==="relax" ? "#10b981" : "#ef4444";
          else if (isStart || isEnd) stroke = "#6366f1";

          return (
            <g key={k}>
              <rect x={c*cellSize+1} y={r*cellSize+1} width={cellSize-1} height={cellSize-1}
                fill={fill} stroke={stroke} strokeWidth={isCurr||isNb||isStart||isEnd?2:0.5} rx={4} />
              {/* Grid value (height/elevation) */}
              <text x={c*cellSize+cellSize/2+1} y={r*cellSize+14}
                textAnchor="middle" dominantBaseline="central"
                fill={isCurr?"#93c5fd":isNb?"#fbbf24":"#52525b"} fontSize="10" fontWeight="600" fontFamily="monospace">
                {grid[r][c]}
              </text>
              {/* dist value */}
              {d < INF && (
                <text x={c*cellSize+cellSize/2+1} y={r*cellSize+cellSize-10}
                  textAnchor="middle" dominantBaseline="central"
                  fill={isCurr?"#60a5fa":isVis?"#34d399":"#a3e635"} fontSize="11" fontWeight="700" fontFamily="monospace">
                  {d}
                </text>
              )}
              {d === INF && !isCurr && (
                <text x={c*cellSize+cellSize/2+1} y={r*cellSize+cellSize-10}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#3f3f46" fontSize="9" fontFamily="monospace">∞</text>
              )}
              {/* Start/End markers */}
              {isStart && <text x={c*cellSize+6} y={r*cellSize+cellSize-4} fill="#818cf8" fontSize="7" fontWeight="700">S</text>}
              {isEnd && <text x={c*cellSize+cellSize-8} y={r*cellSize+cellSize-4} fill="#818cf8" fontSize="7" fontWeight="700">E</text>}
            </g>
          );
        })
      )}
    </svg>
  );
}

/* ── Code Panel ── */
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

/* ── IO Panel for Algorithm tab (original) ── */
function AlgIOPanel({ step }) {
  const { phase, dist, finalized, paths } = step;
  const done = phase === "done";
  const allMatch = done && ALG_EXPECTED_DIST.every((v, i) => dist[i] === v);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">graph</span> = {"{"}</div>
          {ALG_ADJ.map((neighbors, node) => (
            <div key={node} className="pl-4">
              <span className="text-zinc-500">{node}:</span>{" "}
              <span className="text-zinc-300">
                [{neighbors.map(([v, w]) => `(${v},${w})`).join(", ")}]
                {node < ALG_NODES - 1 ? "," : ""}
              </span>
            </div>
          ))}
          <div>{"}"}</div>
          <div><span className="text-zinc-500">source</span> = <span className="text-blue-400">{ALG_SOURCE}</span></div>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">dist = </span>
          <span className="text-zinc-300">[{ALG_EXPECTED_DIST.join(", ")}]</span>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] flex items-center gap-0.5">
          <span className="text-zinc-500">dist = [</span>
          {Array.from({length:ALG_NODES}).map((_, i) => {
            const isFinal = finalized.has(i);
            const val = dist[i];
            const displayVal = val === INF ? "∞" : val;
            const matchesExpected = isFinal && val === ALG_EXPECTED_DIST[i];
            return (
              <span key={i} className="flex items-center">
                <span className={
                  matchesExpected ? "text-emerald-300 font-bold" :
                  isFinal ? "text-blue-300" :
                  val !== INF ? "text-zinc-400" : "text-zinc-600"
                }>{isFinal ? displayVal : val !== INF ? displayVal : "?"}</span>
                {i < ALG_NODES - 1 && <span className="text-zinc-600">, </span>}
              </span>
            );
          })}
          <span className="text-zinc-500">]</span>
        </div>
        {finalized.size > 0 && (
          <div className="mt-2 space-y-0.5">
            {Object.entries(ALG_EXPECTED_PATHS).map(([node, path]) => {
              const n = parseInt(node);
              if (!finalized.has(n)) return null;
              return (
                <div key={node} className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-zinc-600 w-8">{ALG_SOURCE}→{node}:</span>
                  <span className="text-emerald-400/80">{path.join("→")}</span>
                  <span className="text-zinc-700">= {dist[n]}</span>
                  {dist[n] === ALG_EXPECTED_DIST[n] && <span className="text-emerald-600">✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── IO Panel for graph problems ── */
function GraphIOPanel({ step, problem, problemKey }) {
  const { dist, phase } = step;
  const done = phase === "done";

  if (problemKey === "flights") {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
        <div>
          <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
          <div className="font-mono text-[11px] text-zinc-400 space-y-0.5">
            <div><span className="text-zinc-500">src</span> = <span className="text-blue-400">{P3_SRC}</span></div>
            <div><span className="text-zinc-500">dst</span> = <span className="text-amber-400">{P3_DST}</span></div>
            <div><span className="text-zinc-500">K  </span> = <span className="text-zinc-300">{P3_K} stops</span></div>
            <div><span className="text-zinc-500">{P3_FLIGHTS.length} flights</span></div>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected</div>
          <div className="font-mono text-[11px] text-zinc-300">cost = {problem.expected}</div>
        </div>
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output</div>
            {step.found && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
          </div>
          <div className="font-mono text-[11px]">
            <span className="text-zinc-500">cost = </span>
            {done ? <span className="text-emerald-300 font-bold">{dist[P3_DST] === INF ? "-1" : dist[P3_DST]}</span> : <span className="text-zinc-600">?</span>}
          </div>
          {step.stops !== null && step.stops !== undefined && (
            <div className="font-mono text-[11px] mt-0.5">
              <span className="text-zinc-500">stops = </span><span className="text-zinc-300">{step.stops}</span>
            </div>
          )}
          <div className="mt-2 space-y-0.5">
            {dist.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="text-zinc-600 w-12">dist[{i}]</span>
                <span className={d < INF ? "text-zinc-300" : "text-zinc-700"}>{fmt(d)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Network delay
  const maxDist = done ? Math.max(...dist) : null;
  const finalized = step.finalized || new Set();
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5">
          <div><span className="text-zinc-500">source</span> = <span className="text-blue-400">{P1_SRC}</span></div>
          <div><span className="text-zinc-500">nodes </span> = <span className="text-zinc-300">{P1_NODES}</span></div>
          <div><span className="text-zinc-500">edges </span> = <span className="text-zinc-300">{P1_EDGES.length}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected</div>
        <div className="font-mono text-[11px] text-zinc-300">delay = {problem.expected}</div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output</div>
          {done && maxDist === problem.expected && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">delay = </span>
          {done ? <span className="text-emerald-300 font-bold">{maxDist}</span> : <span className="text-zinc-600">?</span>}
        </div>
        <div className="mt-2 space-y-0.5">
          {dist.map((d, i) => {
            const isFin = finalized.has(i);
            return (
              <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="text-zinc-600 w-12">dist[{i}]</span>
                <span className={isFin ? "text-emerald-300 font-bold" : d < INF ? "text-zinc-300" : "text-zinc-700"}>{fmt(d)}</span>
                {isFin && <span className="text-emerald-700 text-[8px]">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── IO Panel for grid problems ── */
function GridIOPanel({ step, problem }) {
  const { dist, phase, current } = step;
  const R = problem.rows, C = problem.cols;
  const done = phase === "done";
  const answer = dist[R-1][C-1];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5">
          <div><span className="text-zinc-500">grid</span> = <span className="text-zinc-300">{R}×{C}</span></div>
          <div><span className="text-zinc-500">start</span> = <span className="text-blue-400">(0,0)</span></div>
          <div><span className="text-zinc-500">end  </span> = <span className="text-indigo-400">({R-1},{C-1})</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected</div>
        <div className="font-mono text-[11px] text-zinc-300">
          {problem.lc === "1631" ? "effort" : "time"} = {problem.expected}
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output</div>
          {done && answer === problem.expected && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">{problem.lc === "1631" ? "effort" : "time"} = </span>
          {done
            ? <span className="text-emerald-300 font-bold">{answer === INF ? "∞" : answer}</span>
            : <span className="text-zinc-600">?</span>}
        </div>
        {current && (
          <div className="font-mono text-[11px] mt-0.5">
            <span className="text-zinc-500">current = </span><span className="text-blue-400">({current[0]},{current[1]})</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Priority Queue display ── */
function PQPanel({ step, problemKey }) {
  const { pq } = step;
  const sorted = [...(pq || [])].sort((a, b) => a[0] - b[0]);
  const isFlights = problemKey === "flights";
  const isGrid = problemKey === "effort" || problemKey === "swim";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Priority Queue ({sorted.length})</div>
      <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
        {sorted.length > 0
          ? sorted.slice(0, 10).map((entry, i) => (
              <span key={i} className="inline-flex items-center px-1.5 h-7 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-[10px]">
                {isFlights
                  ? `(${entry[0]},n${entry[1]},s${entry[2]})`
                  : isGrid
                    ? `(${entry[0]},${entry[1]},${entry[2]})`
                    : `(${entry[0]},${entry[1]})`}
              </span>
            ))
          : <span className="text-[10px] text-zinc-600 italic">empty</span>}
        {sorted.length > 10 && <span className="text-[10px] text-zinc-700">+{sorted.length - 10} more</span>}
      </div>
    </div>
  );
}

/* ── Navigation Bar ── */
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
export default function DijkstraViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];
  const steps = useMemo(() => problem.buildSteps(), [pKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  const isGraph = problem.type === "graph";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* ═══ 1. Header + Problem Switcher ═══ */}
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dijkstra's Algorithm</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Shortest Path in Weighted Graphs • O((V+E) log V)</p>
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

        {/* ═══ 2. Core Idea ═══ */}
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

        {/* ═══ 3. Navigation ═══ */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 4. 3-Column Grid ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Visualization ── */}
          <div className="col-span-3 space-y-3">
            {pKey === "algorithm"
              ? <AlgIOPanel step={step} />
              : isGraph
                ? <GraphIOPanel step={step} problem={problem} problemKey={pKey} />
                : <GridIOPanel step={step} problem={problem} />}

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              {pKey === "algorithm" ? (
                <>
                  <div className="text-[10px] text-zinc-500 mb-1">Source: node {ALG_SOURCE} • {ALG_NODES}N, {ALG_EDGES.length}E</div>
                  <GraphView step={step} edges={ALG_EDGES} positions={ALG_POS} nodeCount={ALG_NODES} />
                  <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Current</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Neighbor</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Visited</span>
                  </div>
                </>
              ) : isGraph ? (
                <>
                  <div className="text-[10px] text-zinc-500 mb-1">
                    {pKey === "network" ? `${P1_NODES}N, ${P1_EDGES.length}E • source: node ${P1_SRC}` : `${P3_NODES} cities, ${P3_FLIGHTS.length} flights • K=${P3_K}`}
                  </div>
                  <GraphView
                    step={step}
                    edges={pKey === "network" ? P1_EDGES : P3_FLIGHTS}
                    positions={pKey === "network" ? P1_POS : P3_POS}
                    nodeCount={pKey === "network" ? P1_NODES : P3_NODES}
                  />
                  <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Current</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Neighbor</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Visited</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[10px] text-zinc-500 mb-1">
                    {problem.rows}×{problem.cols} • <span className="text-zinc-600">top: {pKey === "effort" ? "height" : "elevation"}</span> • <span className="text-lime-600">bottom: dist</span>
                  </div>
                  <GridView step={step} grid={problem.grid} rows={problem.rows} cols={problem.cols} problemKey={pKey} />
                  <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-700 inline-block" />Current</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-800 inline-block" />Visited</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-500 inline-block" />Start/End</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── COL 2: Step Narration + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "fail" ? "bg-red-950/30 border-red-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "relax" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "visit" ? "bg-blue-900 text-blue-300" :
                  step.phase === "skip" ? "bg-red-900 text-red-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "fail" ? "bg-red-900 text-red-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Priority Queue */}
            <PQPanel step={step} problemKey={pKey} />

            {/* dist[] array for graph problems */}
            {isGraph && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">dist[]</div>
                <div className="flex gap-1.5">
                  {step.dist.map((d, i) => {
                    const finalized = step.finalized || new Set();
                    const isFin = finalized.has(i);
                    const changed = step.changedNode === i;
                    const prevVal = step.prevDist ? step.prevDist[i] : null;
                    const val = d === INF ? "∞" : d;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                        <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                          changed ? "bg-emerald-950 border-emerald-700 text-emerald-200 scale-110" :
                          step.phase === "done" ? "bg-emerald-950/30 border-emerald-800 text-emerald-300" :
                          isFin ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" :
                          d === INF ? "bg-zinc-900 border-zinc-700 text-zinc-600" :
                          "bg-zinc-900 border-zinc-700 text-zinc-300"
                        }`}>
                          {changed && prevVal !== null && pKey === "algorithm"
                            ? <span><span className="text-zinc-600 line-through text-[10px]">{prevVal === INF ? "∞" : prevVal}</span> {val}</span>
                            : val}
                        </div>
                        {isFin && <span className="text-[8px] font-mono text-emerald-700">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visited set for graph problems */}
            {isGraph && step.visited && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Visited</div>
                <div className="flex gap-1 min-h-[28px] items-center">
                  {step.visited.size > 0
                    ? [...step.visited].map(n => (
                        <span key={n} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs">{n}</span>
                      ))
                    : <span className="text-[10px] text-zinc-600 italic">none</span>}
                </div>
              </div>
            )}

            {/* Shortest paths (algorithm tab, shown at end) */}
            {pKey === "algorithm" && step.paths && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Shortest Paths from Node {ALG_SOURCE}</div>
                <div className="space-y-0.5 font-mono text-[10px]">
                  {Object.entries(step.paths).map(([node, path]) => (
                    <div key={node} className="flex items-center gap-2">
                      <span className="text-zinc-500 w-8">{ALG_SOURCE}→{node}:</span>
                      <span className="text-emerald-300">{path.join(" → ")}</span>
                      <span className="text-zinc-600 ml-auto">= {step.dist[node]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel code={problem.code} highlightLines={step.codeHL} />
          </div>
        </div>

        {/* ═══ 5. Bottom Row: When to Use + Classic Problems ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use Dijkstra</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Shortest path in graphs with non-negative edge weights</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Single-source to all destinations, or early-stop for one target</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Weighted grids — cells are nodes, moves are edges with cost</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Minimax paths — replace sum with max in relaxation step</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>State-space expansion — add constraints to (cost, node) tuple</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O((V + E) log V) with binary heap</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V) for dist + O(E) for heap</div>
                <div><span className="text-zinc-500 font-semibold">Won't work:</span> Negative edge weights → use Bellman-Ford</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 743 — Network Delay Time</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1631 — Path With Min Effort</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 787 — Cheapest Flights Within K Stops</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 778 — Swim in Rising Water</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1514 — Path with Max Probability</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 882 — Reachable Nodes in Subdivided Graph</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}