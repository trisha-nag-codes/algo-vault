import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   Tarjan's SCC Algorithm — Algorithm + 2 Problem Showcase
   1. Algorithm                       — 7-node directed graph, find SCCs
   2. LC 1192 — Critical Connections  — bridges via Tarjan (undirected)
   3. LC 802  — Eventual Safe States  — SCC condensation, safe nodes
   ═══════════════════════════════════════════════════════════ */

const SCC_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

/* ─────────────────────────────────────────────
   ALGORITHM TAB: 7-node SCC discovery
   ───────────────────────────────────────────── */
const ALG_N = 7;
const ALG_EDGES = [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3],[5,6]];
const ALG_POS = [{x:80,y:60},{x:200,y:60},{x:140,y:170},{x:300,y:170},{x:420,y:100},{x:420,y:240},{x:540,y:170}];
const ALG_EXPECTED = [[2,1,0],[5,4,3],[6]];

function buildAlgSteps() {
  const N = ALG_N, EDGES = ALG_EDGES;
  const adj = Array.from({ length: N }, () => []);
  for (const [u, v] of EDGES) adj[u].push(v);

  const disc = new Array(N).fill(-1);
  const low = new Array(N).fill(-1);
  const onStack = new Array(N).fill(false);
  const stack = [];
  const sccs = [];
  let timer = 0;
  const steps = [];
  const finalized = new Set();

  const snap = (extra) => ({
    disc: [...disc], low: [...low], stack: [...stack], onStack: [...onStack],
    sccs: sccs.map(s => [...s]), finalized: new Set(finalized), ...extra,
  });

  steps.push(snap({
    title: "Initialize \u2014 All Nodes Undiscovered",
    detail: `${N} nodes, ${EDGES.length} directed edges. DFS from node 0. Track disc[] and low[] (lowest reachable disc via back edges).`,
    current: null, neighbor: null, activeEdge: null,
    phase: "init", codeHL: [0, 1, 2], sccFound: null,
  }));

  function dfs(u) {
    disc[u] = low[u] = timer++;
    stack.push(u); onStack[u] = true;

    steps.push(snap({
      title: `Discover Node ${u} \u2014 disc[${u}]=${disc[u]}, low[${u}]=${low[u]}`,
      detail: `Push ${u} onto stack. Stack: [${stack.join(", ")}].`,
      current: u, neighbor: null, activeEdge: null,
      phase: "discover", codeHL: [4, 5, 6], sccFound: null,
    }));

    for (const v of adj[u]) {
      if (disc[v] === -1) {
        steps.push(snap({
          title: `Edge ${u}\u2192${v} \u2014 Tree Edge`,
          detail: `Node ${v} not yet discovered. Recurse DFS(${v}).`,
          current: u, neighbor: v, activeEdge: [u, v],
          phase: "tree", codeHL: [8, 9, 10], sccFound: null,
        }));
        dfs(v);
        const prev = low[u];
        low[u] = Math.min(low[u], low[v]);
        if (low[u] !== prev) {
          steps.push(snap({
            title: `Back from ${v}: low[${u}] = min(${prev}, low[${v}]=${low[v]}) = ${low[u]}`,
            detail: `Update low[${u}] after returning from DFS(${v}).`,
            current: u, neighbor: v, activeEdge: null,
            phase: "update", codeHL: [11], sccFound: null,
          }));
        }
      } else if (onStack[v]) {
        const prev = low[u];
        low[u] = Math.min(low[u], disc[v]);
        steps.push(snap({
          title: `Edge ${u}\u2192${v} \u2014 Back Edge (On Stack)`,
          detail: `Node ${v} on stack. low[${u}] = min(${prev}, disc[${v}]=${disc[v]}) = ${low[u]}. Cycle!`,
          current: u, neighbor: v, activeEdge: [u, v],
          phase: "back", codeHL: [12, 13], sccFound: null,
        }));
      } else {
        steps.push(snap({
          title: `Edge ${u}\u2192${v} \u2014 Cross Edge`,
          detail: `Node ${v} already processed, not on stack. Different SCC. Ignore.`,
          current: u, neighbor: v, activeEdge: [u, v],
          phase: "cross", codeHL: [14], sccFound: null,
        }));
      }
    }

    if (disc[u] === low[u]) {
      const scc = [];
      while (true) { const w = stack.pop(); onStack[w] = false; scc.push(w); finalized.add(w); if (w === u) break; }
      sccs.push(scc);
      steps.push(snap({
        title: `SCC Found! disc[${u}]==low[${u}]==${disc[u]}`,
        detail: `Node ${u} is SCC root. Pop stack: {${scc.join(",")}}. Component #${sccs.length}.`,
        current: u, neighbor: null, activeEdge: null,
        phase: "scc", codeHL: [16, 17], sccFound: scc,
      }));
    }
  }

  for (let i = 0; i < N; i++) if (disc[i] === -1) dfs(i);

  steps.push(snap({
    title: `\u2713 Complete \u2014 ${sccs.length} SCCs Found`,
    detail: `SCCs: ${sccs.map((s, i) => `{${s.join(",")}}`).join(", ")}.`,
    current: null, neighbor: null, activeEdge: null,
    phase: "done", codeHL: [19], sccFound: null,
  }));

  return steps;
}

/* ─────────────────────────────────────────────
   LC 1192: Critical Connections (Bridges)
   n=5, connections=[[0,1],[1,2],[2,0],[1,3],[3,4]]
   Bridges: [1,3] and [3,4]
   ───────────────────────────────────────────── */
const BR_N = 5;
const BR_EDGES = [[0,1],[1,2],[2,0],[1,3],[3,4]];
const BR_POS = [{x:80,y:80},{x:200,y:80},{x:140,y:200},{x:340,y:80},{x:460,y:80}];
const BR_EXPECTED = [[1,3],[3,4]];

function buildP1Steps() {
  const N = BR_N;
  const adj = Array.from({ length: N }, () => []);
  for (const [u, v] of BR_EDGES) { adj[u].push(v); adj[v].push(u); }

  const disc = new Array(N).fill(-1);
  const low = new Array(N).fill(-1);
  let timer = 0;
  const steps = [];
  const bridges = [];
  const visited = new Set();

  const snap = (extra) => ({
    disc: [...disc], low: [...low], stack: [], onStack: new Array(N).fill(false),
    sccs: [], finalized: new Set(visited), bridges: bridges.map(b => [...b]), ...extra,
  });

  steps.push(snap({
    title: "Initialize \u2014 Find Bridges (Critical Connections)",
    detail: `${N} nodes, ${BR_EDGES.length} undirected edges. A bridge is an edge whose removal disconnects the graph. Use Tarjan: edge (u,v) is bridge if low[v] > disc[u].`,
    current: null, neighbor: null, activeEdge: null,
    phase: "init", codeHL: [0, 1, 2], sccFound: null,
  }));

  function dfs(u, parent) {
    disc[u] = low[u] = timer++;
    visited.add(u);

    steps.push(snap({
      title: `Discover Node ${u} \u2014 disc=${disc[u]}, low=${low[u]}`,
      detail: `Visit ${u}. Set disc[${u}]=low[${u}]=${disc[u]}. Parent=${parent === -1 ? "none" : parent}.`,
      current: u, neighbor: null, activeEdge: null,
      phase: "discover", codeHL: [4, 5], sccFound: null,
    }));

    for (const v of adj[u]) {
      if (v === parent) continue;
      if (disc[v] === -1) {
        steps.push(snap({
          title: `Edge ${u}\u2014${v} \u2014 Tree Edge`,
          detail: `Node ${v} unvisited. Recurse DFS(${v}).`,
          current: u, neighbor: v, activeEdge: [u, v],
          phase: "tree", codeHL: [7, 8], sccFound: null,
        }));
        dfs(v, u);
        const prev = low[u];
        low[u] = Math.min(low[u], low[v]);

        if (low[v] > disc[u]) {
          bridges.push([u, v]);
          steps.push(snap({
            title: `\u26a0 Bridge Found: ${u}\u2014${v}`,
            detail: `low[${v}]=${low[v]} > disc[${u}]=${disc[u]}. No back edge from ${v}'s subtree reaches ${u} or above. Removing this edge disconnects the graph!`,
            current: u, neighbor: v, activeEdge: [u, v],
            phase: "scc", codeHL: [10, 11], sccFound: null,
          }));
        } else if (low[u] !== prev) {
          steps.push(snap({
            title: `Back from ${v}: low[${u}] = min(${prev}, ${low[v]}) = ${low[u]}`,
            detail: `${v}'s subtree can reach disc ${low[v]}. Not a bridge \u2014 there's a cycle.`,
            current: u, neighbor: v, activeEdge: null,
            phase: "update", codeHL: [9], sccFound: null,
          }));
        }
      } else {
        const prev = low[u];
        low[u] = Math.min(low[u], disc[v]);
        if (low[u] !== prev) {
          steps.push(snap({
            title: `Edge ${u}\u2014${v} \u2014 Back Edge`,
            detail: `Node ${v} already visited. low[${u}] = min(${prev}, disc[${v}]=${disc[v]}) = ${low[u]}. This back edge prevents ${u} from being a bridge endpoint.`,
            current: u, neighbor: v, activeEdge: [u, v],
            phase: "back", codeHL: [12, 13], sccFound: null,
          }));
        }
      }
    }
  }

  dfs(0, -1);

  steps.push(snap({
    title: `\u2713 ${bridges.length} Bridge(s) Found`,
    detail: `Critical connections: ${bridges.map(b => `[${b.join(",")}]`).join(", ")}. Removing any bridge disconnects the network.`,
    current: null, neighbor: null, activeEdge: null,
    phase: "done", codeHL: [15], sccFound: null,
  }));

  return steps;
}

/* ─────────────────────────────────────────────
   LC 802: Find Eventual Safe States
   graph = [[1,2],[2,3],[5],[0],[5],[],[]]
   SCCs: {0,1,3} (cycle), rest singletons
   Safe: [2,4,5,6] (not in/reaching any cycle)
   ───────────────────────────────────────────── */
const SS_N = 7;
const SS_GRAPH = [[1,2],[2,3],[5],[0],[5],[],[]];
const SS_EDGES = [];
{ SS_GRAPH.forEach((nbs, u) => { for (const v of nbs) SS_EDGES.push([u, v]); }); }
const SS_POS = [{x:80,y:60},{x:200,y:60},{x:200,y:180},{x:80,y:180},{x:350,y:60},{x:350,y:180},{x:480,y:120}];
const SS_EXPECTED_SAFE = [2, 4, 5, 6];

function buildP2Steps() {
  const N = SS_N, graph = SS_GRAPH;
  const adj = Array.from({ length: N }, () => []);
  graph.forEach((nbs, u) => { for (const v of nbs) adj[u].push(v); });

  const disc = new Array(N).fill(-1);
  const low = new Array(N).fill(-1);
  const onStack = new Array(N).fill(false);
  const stack = [];
  const sccs = [];
  let timer = 0;
  const steps = [];
  const finalized = new Set();

  const snap = (extra) => ({
    disc: [...disc], low: [...low], stack: [...stack], onStack: [...onStack],
    sccs: sccs.map(s => [...s]), finalized: new Set(finalized), ...extra,
  });

  steps.push(snap({
    title: "Phase 1 \u2014 Find All SCCs via Tarjan",
    detail: `${N} nodes. First find SCCs. Nodes in SCC of size>1 are in cycles. Then determine which nodes can reach a cycle \u2014 those are unsafe.`,
    current: null, neighbor: null, activeEdge: null,
    phase: "init", codeHL: [0, 1, 2], sccFound: null, safeNodes: null,
  }));

  function dfs(u) {
    disc[u] = low[u] = timer++;
    stack.push(u); onStack[u] = true;

    steps.push(snap({
      title: `Discover Node ${u} \u2014 disc=${disc[u]}`,
      detail: `Push ${u} onto stack. Stack: [${stack.join(", ")}].`,
      current: u, neighbor: null, activeEdge: null,
      phase: "discover", codeHL: [4, 5, 6], sccFound: null, safeNodes: null,
    }));

    for (const v of adj[u]) {
      if (disc[v] === -1) {
        steps.push(snap({
          title: `Edge ${u}\u2192${v} \u2014 Tree Edge`,
          detail: `Recurse into DFS(${v}).`,
          current: u, neighbor: v, activeEdge: [u, v],
          phase: "tree", codeHL: [8, 9, 10], sccFound: null, safeNodes: null,
        }));
        dfs(v);
        const prev = low[u];
        low[u] = Math.min(low[u], low[v]);
        if (low[u] !== prev) {
          steps.push(snap({
            title: `Back from ${v}: low[${u}] updated to ${low[u]}`,
            detail: `low[${u}] = min(${prev}, low[${v}]=${low[v]}) = ${low[u]}.`,
            current: u, neighbor: v, activeEdge: null,
            phase: "update", codeHL: [11], sccFound: null, safeNodes: null,
          }));
        }
      } else if (onStack[v]) {
        const prev = low[u];
        low[u] = Math.min(low[u], disc[v]);
        steps.push(snap({
          title: `Edge ${u}\u2192${v} \u2014 Back Edge (Cycle!)`,
          detail: `Node ${v} on stack. low[${u}]=min(${prev},${disc[v]})=${low[u]}. This creates a cycle \u2014 nodes involved will be unsafe.`,
          current: u, neighbor: v, activeEdge: [u, v],
          phase: "back", codeHL: [12, 13], sccFound: null, safeNodes: null,
        }));
      } else {
        steps.push(snap({
          title: `Edge ${u}\u2192${v} \u2014 Cross Edge`,
          detail: `Node ${v} already processed. Ignore.`,
          current: u, neighbor: v, activeEdge: [u, v],
          phase: "cross", codeHL: [14], sccFound: null, safeNodes: null,
        }));
      }
    }

    if (disc[u] === low[u]) {
      const scc = [];
      while (true) { const w = stack.pop(); onStack[w] = false; scc.push(w); finalized.add(w); if (w === u) break; }
      sccs.push(scc);
      steps.push(snap({
        title: `SCC: {${scc.join(",")}}${scc.length > 1 ? " \u2014 CYCLE (unsafe)" : " \u2014 singleton"}`,
        detail: `Pop stack until ${u}. ${scc.length > 1 ? "Size > 1 \u2192 these nodes are in a cycle and NOT safe." : "Single node, might be safe if it doesn't reach a cycle."}`,
        current: u, neighbor: null, activeEdge: null,
        phase: "scc", codeHL: [16, 17], sccFound: scc, safeNodes: null,
      }));
    }
  }

  for (let i = 0; i < N; i++) if (disc[i] === -1) dfs(i);

  // Phase 2: determine safe nodes
  // Build SCC condensation
  const sccId = new Array(N).fill(-1);
  sccs.forEach((scc, i) => scc.forEach(nd => { sccId[nd] = i; }));
  const nSCC = sccs.length;
  const condAdj = Array.from({ length: nSCC }, () => new Set());
  for (let u = 0; u < N; u++) for (const v of adj[u]) if (sccId[u] !== sccId[v]) condAdj[sccId[u]].add(sccId[v]);

  const cycleSccs = new Set();
  sccs.forEach((scc, i) => { if (scc.length > 1) cycleSccs.add(i); });
  const canReachCycle = new Set(cycleSccs);
  // Tarjan outputs SCCs in reverse topological order, iterate forward
  for (let i = nSCC - 1; i >= 0; i--) {
    for (const j of condAdj[i]) { if (canReachCycle.has(j)) canReachCycle.add(i); }
  }

  const safe = [];
  for (let i = 0; i < N; i++) if (!canReachCycle.has(sccId[i])) safe.push(i);

  steps.push(snap({
    title: "Phase 2 \u2014 Identify Safe Nodes",
    detail: `Cycle SCCs: ${[...cycleSccs].map(i => `{${sccs[i].join(",")}}`).join(", ")}. Nodes in or reaching a cycle are unsafe. Safe nodes: [${safe.join(",")}].`,
    current: null, neighbor: null, activeEdge: null,
    phase: "done", codeHL: [19, 20], sccFound: null, safeNodes: safe,
  }));

  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title: "Algorithm", lc: null, difficulty: null, tag: "SCC Discovery",
    coreIdea: "Tarjan finds all SCCs in one DFS pass. Each node tracks disc (discovery time) and low (lowest disc reachable via back edges). When disc[u]==low[u], u is the root of an SCC \u2014 pop the stack to extract it. Back edges reveal cycles; cross edges to processed nodes are ignored.",
    buildSteps: buildAlgSteps,
    n: ALG_N, edges: ALG_EDGES, positions: ALG_POS, directed: true,
    code: [
      {id:0,text:"def tarjan_scc(adj, n):"},{id:1,text:"    disc=[-1]*n; low=[-1]*n"},
      {id:2,text:"    stack=[]; on_stk=[False]*n"},
      {id:3,text:"    timer=[0]; sccs=[]"},
      {id:4,text:"    def dfs(u):"},
      {id:5,text:"        disc[u]=low[u]=timer[0]"},
      {id:6,text:"        timer[0]+=1; stack.append(u)"},
      {id:7,text:"        on_stk[u]=True"},
      {id:8,text:"        for v in adj[u]:"},
      {id:9,text:"            if disc[v]==-1:"},
      {id:10,text:"                dfs(v)"},
      {id:11,text:"                low[u]=min(low[u],low[v])"},
      {id:12,text:"            elif on_stk[v]:"},
      {id:13,text:"                low[u]=min(low[u],disc[v])"},
      {id:14,text:"            # else: cross edge, skip"},{id:15,text:""},
      {id:16,text:"        if disc[u]==low[u]:"},
      {id:17,text:"            scc = pop until u"},{id:18,text:""},
      {id:19,text:"    return sccs"},
    ],
  },
  bridges: {
    title: "Critical Connections", lc: "1192", difficulty: "Hard", tag: "Bridges",
    coreIdea: "A bridge is an edge whose removal disconnects an undirected graph. Tarjan variant: after DFS tree edge (u,v), if low[v] > disc[u] then no back edge from v's subtree reaches u or above \u2014 (u,v) is a bridge. Same O(V+E) single-pass approach.",
    buildSteps: buildP1Steps,
    n: BR_N, edges: BR_EDGES, positions: BR_POS, directed: false,
    code: [
      {id:0,text:"def criticalConnections(n, conns):"},{id:1,text:"    adj = [[] for _ in range(n)]"},
      {id:2,text:"    # build undirected adj list"},
      {id:3,text:"    disc=[-1]*n; low=[-1]*n; timer=[0]"},
      {id:4,text:"    def dfs(u, parent):"},
      {id:5,text:"        disc[u]=low[u]=timer[0]; timer[0]+=1"},
      {id:6,text:"        for v in adj[u]:"},
      {id:7,text:"            if v==parent: continue"},
      {id:8,text:"            if disc[v]==-1:"},
      {id:9,text:"                dfs(v, u)"},
      {id:10,text:"                low[u]=min(low[u], low[v])"},
      {id:11,text:"                if low[v] > disc[u]:"},
      {id:12,text:"                    bridges.append([u,v])"},
      {id:13,text:"            else:"},
      {id:14,text:"                low[u]=min(low[u], disc[v])"},
      {id:15,text:"    return bridges"},
    ],
  },
  safeStates: {
    title: "Eventual Safe States", lc: "802", difficulty: "Medium", tag: "Safe Nodes",
    coreIdea: "A node is safe if every path from it leads to a terminal node. Find SCCs: any SCC of size>1 is a cycle. Then in the condensation DAG, any SCC that can reach a cycle SCC is also unsafe. The rest are safe. Tarjan gives SCCs in reverse topological order, making reachability straightforward.",
    buildSteps: buildP2Steps,
    n: SS_N, edges: SS_EDGES, positions: SS_POS, directed: true,
    code: [
      {id:0,text:"def eventualSafeNodes(graph):"},{id:1,text:"    # Step 1: Tarjan SCC"},
      {id:2,text:"    disc=[-1]*n; low=[-1]*n"},
      {id:3,text:"    stack=[]; on_stk=[False]*n"},
      {id:4,text:"    def dfs(u):"},
      {id:5,text:"        disc[u]=low[u]=timer[0]"},
      {id:6,text:"        timer[0]+=1; stack.append(u)"},
      {id:7,text:"        on_stk[u]=True"},
      {id:8,text:"        for v in graph[u]:"},
      {id:9,text:"            if disc[v]==-1:"},
      {id:10,text:"                dfs(v)"},
      {id:11,text:"                low[u]=min(low[u],low[v])"},
      {id:12,text:"            elif on_stk[v]:"},
      {id:13,text:"                low[u]=min(low[u],disc[v])"},
      {id:14,text:"            # cross edge: skip"},{id:15,text:""},
      {id:16,text:"        if disc[u]==low[u]:"},
      {id:17,text:"            scc = pop until u"},{id:18,text:""},
      {id:19,text:"    # Step 2: condensation reachability"},
      {id:20,text:"    # safe = not in/reaching cycle SCC"},
    ],
  },
};

/* ═══════════════════════════════════════════
   GRAPH SVG
   ═══════════════════════════════════════════ */
function GraphView({ step, problem }) {
  const { current, neighbor, activeEdge, sccs, disc } = step;
  const { positions, edges, directed } = problem;
  const safeNodes = step.safeNodes;
  const safeSet = safeNodes ? new Set(safeNodes) : null;
  const bridgeSet = new Set();
  if (step.bridges) step.bridges.forEach(([u, v]) => { bridgeSet.add(u + "-" + v); bridgeSet.add(v + "-" + u); });

  const nodeToSCC = {};
  sccs.forEach((scc, i) => scc.forEach(nd => { nodeToSCC[nd] = i; }));

  const vw = problem === PROBLEMS.algorithm ? "0 0 600 280" : "0 0 540 260";

  return (
    <svg viewBox={vw} className="w-full" style={{ maxHeight: 230 }}>
      {edges.map(([u, v], i) => {
        const pu = positions[u], pv = positions[v];
        if (!pu || !pv) return null;
        const dx = pv.x - pu.x, dy = pv.y - pu.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
        const r = 20;
        const sx = pu.x + (dx / len) * r, sy = pu.y + (dy / len) * r;
        const ex = pv.x - (dx / len) * r, ey = pv.y - (dy / len) * r;
        const isActive = activeEdge && activeEdge[0] === u && activeEdge[1] === v;
        const isBridge = bridgeSet.has(u + "-" + v);
        const color = isBridge ? "#f59e0b" : isActive
          ? (step.phase === "back" ? "#f59e0b" : step.phase === "cross" ? "#ef4444" : "#3b82f6")
          : "#3f3f46";
        const markerId = `ta-${problem.lc || "alg"}-${i}`;
        return (
          <g key={i}>
            {directed && <defs><marker id={markerId} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0,7 2.5,0 5" fill={color} /></marker></defs>}
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color}
              strokeWidth={isActive || isBridge ? 3 : 1.5}
              strokeDasharray={isBridge ? "6,3" : "none"}
              markerEnd={directed ? `url(#${markerId})` : undefined} />
          </g>
        );
      })}
      {positions.map((pos, id) => {
        if (!pos) return null;
        const isCurr = current === id;
        const isNb = neighbor === id;
        const sccIdx = nodeToSCC[id];
        const hasSCC = sccIdx !== undefined;
        const isSafe = safeSet && safeSet.has(id);
        const isUnsafe = safeSet && !safeSet.has(id);
        const fill = isSafe ? "#10b981" : isUnsafe ? "#ef4444"
          : isCurr ? "#3b82f6" : isNb ? "#f59e0b"
          : hasSCC ? SCC_COLORS[sccIdx % SCC_COLORS.length]
          : disc[id] >= 0 ? "#27272a" : "#18181b";
        const stroke = isSafe ? "#059669" : isUnsafe ? "#dc2626"
          : isCurr ? "#2563eb" : isNb ? "#d97706"
          : hasSCC ? SCC_COLORS[sccIdx % SCC_COLORS.length] : "#52525b";
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={18} fill={fill} stroke={stroke} strokeWidth={2.5} opacity={disc[id] === -1 && !safeSet ? 0.4 : 1} />
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
  const { phase, sccs, finalized } = step;
  const done = phase === "done";
  const N = problem.n;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5">
          <div><span className="text-zinc-500">n    </span>= <span className="text-blue-400">{N}</span></div>
          <div><span className="text-zinc-500">edges</span>= <span className="text-zinc-300">{problem.edges.length} {problem.directed ? "directed" : "undirected"}</span></div>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected</div>
        <div className="font-mono text-[11px] space-y-0.5">
          {pKey === "algorithm" && <div><span className="text-zinc-500">sccs = </span><span className="text-zinc-300">[{ALG_EXPECTED.map(s => `{${s.join(",")}}`).join(", ")}]</span></div>}
          {pKey === "bridges" && <div><span className="text-zinc-500">bridges = </span><span className="text-zinc-300">[{BR_EXPECTED.map(b => `[${b.join(",")}]`).join(", ")}]</span></div>}
          {pKey === "safeStates" && <div><span className="text-zinc-500">safe = </span><span className="text-emerald-300">[{SS_EXPECTED_SAFE.join(",")}]</span></div>}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{"\u2713"} DONE</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          {(pKey === "algorithm" || pKey === "safeStates") && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-zinc-500">sccs=[</span>
              {sccs.length === 0 ? <span className="text-zinc-700">...</span> : sccs.map((scc, i) => (
                <span key={i} className="flex items-center">
                  <span style={{ color: SCC_COLORS[i % SCC_COLORS.length] }} className="font-bold">{`{${scc.join(",")}}`}</span>
                  {i < sccs.length - 1 && <span className="text-zinc-600">, </span>}
                </span>
              ))}
              <span className="text-zinc-500">]</span>
            </div>
          )}
          {pKey === "bridges" && step.bridges && (
            <div><span className="text-zinc-500">bridges = </span><span className="text-amber-300 font-bold">[{step.bridges.map(b => `[${b.join(",")}]`).join(", ")}]</span></div>
          )}
          {step.safeNodes && (
            <div><span className="text-zinc-500">safe = </span><span className="text-emerald-300 font-bold">[{step.safeNodes.join(",")}]</span></div>
          )}
        </div>
        {finalized.size > 0 && (
          <div className="mt-1.5 text-[10px] text-zinc-600">
            Processed: {[...finalized].sort((a, b) => a - b).map(nd => (
              <span key={nd} className="text-emerald-600 mr-1">{nd}</span>
            ))}
            <span className="text-zinc-700">({finalized.size}/{N})</span>
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
export default function TarjanViz() {
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
            <h1 className="text-2xl font-bold tracking-tight">Tarjan's SCC Algorithm</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Strongly Connected Components {"\u2022"} Single DFS Pass</p>
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
              <div className="text-[10px] text-zinc-500 mb-1">{problem.n}N, {problem.edges.length}E {"\u2022"} {problem.directed ? "directed" : "undirected"}</div>
              <GraphView step={step} problem={problem} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Neighbor</span>
                {pKey === "safeStates" && step.safeNodes && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Safe</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Unsafe</span>
                </>}
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${
              step.phase === "scc" ? "bg-purple-950/30 border-purple-900" :
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "scc" ? "bg-purple-900 text-purple-300" :
                  step.phase === "back" ? "bg-amber-900 text-amber-300" :
                  step.phase === "discover" || step.phase === "tree" ? "bg-blue-900 text-blue-300" :
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
                    {step.disc.slice(0, problem.n).map((d, i) => {
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
                          }`}>{d === -1 ? "\u2014" : d}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">low[]</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {step.low.slice(0, problem.n).map((l, i) => {
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
                          }`}>{l === -1 ? "\u2014" : l}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Stack & SCCs/Bridges */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                {pKey !== "bridges" && (
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Stack</div>
                    <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                      {step.stack.length > 0
                        ? step.stack.map((nd, i) => (
                            <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-purple-950 border border-purple-800 text-purple-300 font-mono font-bold text-xs">{nd}</span>
                          ))
                        : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    {pKey === "bridges" ? "Bridges Found" : "SCCs Found"}
                  </div>
                  <div className="flex gap-2 min-h-[28px] items-center flex-wrap">
                    {pKey === "bridges" ? (
                      step.bridges && step.bridges.length > 0
                        ? step.bridges.map((b, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 h-7 rounded-md font-mono font-bold text-xs bg-amber-950/50 border border-amber-700 text-amber-300">
                              [{b.join(",")}]
                            </span>
                          ))
                        : <span className="text-[10px] text-zinc-600 italic">none yet</span>
                    ) : (
                      step.sccs.length > 0
                        ? step.sccs.map((scc, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 h-7 rounded-md font-mono font-bold text-xs"
                              style={{
                                backgroundColor: SCC_COLORS[i % SCC_COLORS.length] + "20",
                                border: `1px solid ${SCC_COLORS[i % SCC_COLORS.length]}`,
                                color: SCC_COLORS[i % SCC_COLORS.length],
                              }}>
                              {`{${scc.join(",")}}`}
                            </span>
                          ))
                        : <span className="text-[10px] text-zinc-600 italic">none yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Safe nodes panel for LC 802 */}
            {step.safeNodes && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Safe Nodes</div>
                <div className="flex gap-1.5 items-center flex-wrap">
                  {Array.from({ length: problem.n }).map((_, i) => {
                    const safe = step.safeNodes.includes(i);
                    return (
                      <span key={i} className={`inline-flex items-center justify-center w-8 h-8 rounded-md font-mono font-bold text-xs border ${
                        safe ? "bg-emerald-950 border-emerald-700 text-emerald-300" : "bg-red-950/30 border-red-900/50 text-red-400/60 line-through"
                      }`}>{i}</span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-4">
            <CodePanel code={problem.code} highlightLines={step.codeHL} />
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Find all strongly connected components in directed graph</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Find bridges/articulation points in undirected graph</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>2-SAT solving {"\u2014"} implication graph SCC condensation</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Dependency cycles, compiler optimization, circuit analysis</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V + E) single DFS pass</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V) for disc, low, stack</div>
                <div><span className="text-zinc-500 font-semibold">Alt:</span> Kosaraju's (two DFS + transpose)</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1192 {"\u2014"} Critical Connections</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 802 {"\u2014"} Eventual Safe States</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 2360 {"\u2014"} Longest Cycle in a Graph</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 332 {"\u2014"} Reconstruct Itinerary</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 207 {"\u2014"} Course Schedule</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1568 {"\u2014"} Min Days Disconnect Island</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}