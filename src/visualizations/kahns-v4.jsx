import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   Kahn's Algorithm — Algorithm + 4 LC Problem Showcase
   1. Algorithm — basic topo sort demo
   2. LC 207  — Course Schedule          (Medium) — bool
   3. LC 210  — Course Schedule II        (Medium) — order
   4. LC 269  — Alien Dictionary          (Hard)
   5. LC 1203 — Sort Items by Groups      (Hard)
   ═══════════════════════════════════════════════════════════ */

/* ─── Standard Kahn's step builder ─── */
function buildKahnSteps(numNodes, edges, labels, codeHLs) {
  const graph = Array.from({ length: numNodes }, () => []);
  const inDegree = new Array(numNodes).fill(0);
  for (const [u, v] of edges) { graph[u].push(v); inDegree[v]++; }

  const L = (x) => labels ? labels[x] : x;
  const steps = [];
  const graphSnap = graph.map(a => [...a]);
  const finalized = new Set();

  steps.push({
    phase: "build", title: "Build Graph & Compute In-Degrees",
    inDegree: [...inDegree], prevInDegree: null,
    queue: [], processed: [], order: [],
    highlight: null, neighbors: [], changedNode: null,
    detail: `${edges.length} edges. Build adjacency list and count in-degrees.`,
    edges, graph: graphSnap, codeHL: codeHLs.build, finalized: new Set(),
  });

  const queue = [];
  for (let c = 0; c < numNodes; c++) if (inDegree[c] === 0) queue.push(c);

  steps.push({
    phase: "seed", title: `Seed Queue \u2014 In-Degree 0: [${queue.map(x => L(x)).join(", ")}]`,
    inDegree: [...inDegree], prevInDegree: [...inDegree],
    queue: [...queue], processed: [], order: [],
    highlight: null, neighbors: [], changedNode: null,
    detail: `Enqueue nodes with in_degree == 0: [${queue.map(x => L(x)).join(", ")}].`,
    edges, graph: graphSnap, codeHL: codeHLs.seed, finalized: new Set(),
  });

  const processed = [], order = [];
  const curIn = [...inDegree];
  let qi = 0;

  while (qi < queue.length) {
    const node = queue[qi]; qi++;
    processed.push(node); order.push(node); finalized.add(node);

    steps.push({
      phase: "dequeue", title: `Dequeue ${L(node)}`,
      inDegree: [...curIn], prevInDegree: [...curIn],
      queue: queue.slice(qi), processed: [...processed], order: [...order],
      highlight: node, neighbors: [], changedNode: null,
      detail: `Pop ${L(node)}, append to order. Iterate graph[${L(node)}] = [${graphSnap[node].map(x => L(x)).join(", ")}].`,
      edges, graph: graphSnap, codeHL: codeHLs.dequeue, iteratingNode: node,
      finalized: new Set(finalized),
    });

    for (const next of graph[node]) {
      const prevIn = [...curIn];
      curIn[next]--;
      const enqueued = curIn[next] === 0;
      if (enqueued) queue.push(next);

      steps.push({
        phase: "update",
        title: `in_degree[${L(next)}]: ${prevIn[next]} \u2192 ${curIn[next]}`,
        inDegree: [...curIn], prevInDegree: prevIn,
        queue: queue.slice(qi), processed: [...processed], order: [...order],
        highlight: node, neighbors: [next], changedNode: next, enqueued,
        detail: enqueued
          ? `${L(node)}\u2192${L(next)}: drops to 0 \u2014 enqueue ${L(next)}!`
          : `${L(node)}\u2192${L(next)}: now ${curIn[next]}, still waiting.`,
        edges, graph: graphSnap, activeEdge: [node, next],
        codeHL: codeHLs.update, iteratingNode: node,
        finalized: new Set(finalized),
      });
    }
  }

  const hasCycle = processed.length < numNodes;
  const stuck = [];
  if (hasCycle) for (let i = 0; i < numNodes; i++) if (!processed.includes(i)) stuck.push(i);

  steps.push({
    phase: "result",
    title: hasCycle ? "\u2717 Cycle Detected!" : `\u2713 Order: [${order.map(x => L(x)).join(", ")}]`,
    inDegree: [...curIn], prevInDegree: [...curIn],
    queue: [], processed: [...processed], order: [...order],
    highlight: null, neighbors: [], changedNode: null, hasCycle, stuck,
    detail: hasCycle
      ? `Only ${processed.length}/${numNodes} processed. {${stuck.map(x => L(x)).join(", ")}} trapped in cycle.`
      : `All ${numNodes} nodes done. [${order.map(x => L(x)).join(" \u2192 ")}].`,
    edges, graph: graphSnap, codeHL: codeHLs.result, finalized: new Set(finalized),
  });

  return steps;
}

/* ─────────────────────────────────────────────
   ALGORITHM TAB
   ───────────────────────────────────────────── */
const ALG_N = 4;
const ALG_EDGES = [[0,1],[0,2],[1,3],[2,3]];
const ALG_POS = [{x:200,y:50},{x:90,y:170},{x:310,y:170},{x:200,y:290}];

function buildAlgSteps() {
  return buildKahnSteps(ALG_N, ALG_EDGES, null, {
    build:[0,1,2,3,4,5], seed:[7,8,9], dequeue:[11,12,13],
    update:[14,15,16,17], result:[19],
  });
}

/* ─────────────────────────────────────────────
   LC 207: Course Schedule — bool, cycle/no-cycle
   ───────────────────────────────────────────── */
const CS_VARIANTS = {
  no_cycle: {
    label: "\u2713 No Cycle", n: 4,
    prereqs: [[1,0],[2,0],[3,1],[3,2]],
    positions: [{x:200,y:50},{x:90,y:170},{x:310,y:170},{x:200,y:290}],
    expected: true, desc: "0\u21921, 0\u21922, 1\u21923, 2\u21923",
  },
  cycle: {
    label: "\u2717 Has Cycle", n: 4,
    prereqs: [[1,0],[2,1],[3,2],[1,3]],
    positions: [{x:80,y:170},{x:200,y:50},{x:320,y:170},{x:200,y:290}],
    expected: false, desc: "0\u21921\u21922\u21923\u21921 (cycle)",
  },
};

function buildCS1Steps(varKey) {
  const v = CS_VARIANTS[varKey];
  const edges = v.prereqs.map(([c, p]) => [p, c]);
  return buildKahnSteps(v.n, edges, null, {
    build:[0,1,2,3,4,5], seed:[7,8,9], dequeue:[11,12,13],
    update:[14,15,16,17], result:[19],
  });
}

/* ─────────────────────────────────────────────
   LC 210: Course Schedule II — return order, cycle/no-cycle
   ───────────────────────────────────────────── */
function buildCS2Steps(varKey) {
  const v = CS_VARIANTS[varKey];
  const edges = v.prereqs.map(([c, p]) => [p, c]);
  return buildKahnSteps(v.n, edges, null, {
    build:[0,1,2,3,4,5], seed:[7,8,9], dequeue:[11,12,13],
    update:[14,15,16,17], result:[19],
  });
}

/* ─────────────────────────────────────────────
   LC 269: Alien Dictionary
   words = ["wrt","wrf","er","ett","rftt"]
   Chars: e(0),f(1),r(2),t(3),w(4)
   Edges: t→f, w→e, r→t, e→r → order: wertf
   ───────────────────────────────────────────── */
const P1_WORDS = ["wrt","wrf","er","ett","rftt"];
const P1_LABELS = ["e","f","r","t","w"];
const P1_N = 5;
const P1_EDGES = [[3,1],[4,0],[2,3],[0,2]];
const P1_POS = [{x:160,y:170},{x:380,y:270},{x:270,y:60},{x:380,y:60},{x:60,y:60}];
const P1_EXPECTED = [4,0,2,3,1]; // w,e,r,t,f

function buildP1Steps() {
  const pairs = [
    {w1:"wrt",w2:"wrf",pos:2,c1:"t",c2:"f",edge:"t\u2192f"},
    {w1:"wrf",w2:"er",pos:0,c1:"w",c2:"e",edge:"w\u2192e"},
    {w1:"er",w2:"ett",pos:1,c1:"r",c2:"t",edge:"r\u2192t"},
    {w1:"ett",w2:"rftt",pos:0,c1:"e",c2:"r",edge:"e\u2192r"},
  ];
  const extractSteps = [];
  const foundEdges = [];
  for (const p of pairs) {
    foundEdges.push(p.edge);
    extractSteps.push({
      phase: "extract", title: `"${p.w1}" vs "${p.w2}" \u2192 ${p.edge}`,
      inDegree: [1,1,1,1,0], prevInDegree: null,
      queue: [], processed: [], order: [],
      highlight: null, neighbors: [], changedNode: null,
      detail: `Diff at pos ${p.pos}: '${p.c1}' < '${p.c2}'. Edge ${p.edge}. Found: [${foundEdges.join(", ")}].`,
      edges: P1_EDGES.slice(0, foundEdges.length), graph: Array.from({length:P1_N},()=>[]),
      codeHL: [2,3,4,5], finalized: new Set(),
    });
  }
  const kahnSteps = buildKahnSteps(P1_N, P1_EDGES, P1_LABELS, {
    build:[0,1,2,3,4,5], seed:[7,8], dequeue:[9,10,11],
    update:[12,13,14], result:[15],
  });
  return [...extractSteps, ...kahnSteps];
}

/* ─────────────────────────────────────────────
   LC 1203: Sort Items by Groups
   n=6, m=3, group=[0,0,1,1,2,2]
   beforeItems=[[],[0],[],[2,1],[],[4]]
   Result: [0,1,4,5,2,3]
   ───────────────────────────────────────────── */
const P2_N = 6, P2_M = 3;
const P2_GROUP = [0,0,1,1,2,2];
const P2_BEFORE = [[],[0],[],[2,1],[],[4]];
const P2_POS = [
  {x:80,y:80},{x:200,y:80},{x:80,y:240},{x:200,y:240},{x:340,y:80},{x:340,y:200},
];
const P2_EXPECTED = [0,1,4,5,2,3];

function buildP2Steps() {
  const steps = [];
  const itemAdj = Array.from({length:P2_N},()=>[]);
  const itemIn = new Array(P2_N).fill(0);
  const groupEdgesMap = new Map();
  const groupIn = new Array(P2_M).fill(0);
  const itemInGroup = Array.from({length:P2_M},()=>[]);
  for (let i = 0; i < P2_N; i++) itemInGroup[P2_GROUP[i]].push(i);

  for (let i = 0; i < P2_N; i++) {
    for (const dep of P2_BEFORE[i]) {
      itemAdj[dep].push(i); itemIn[i]++;
      if (P2_GROUP[dep] !== P2_GROUP[i]) {
        const gk = `${P2_GROUP[dep]}-${P2_GROUP[i]}`;
        if (!groupEdgesMap.has(gk)) { groupEdgesMap.set(gk, [P2_GROUP[dep], P2_GROUP[i]]); groupIn[P2_GROUP[i]]++; }
      }
    }
  }
  const groupAdj = Array.from({length:P2_M},()=>[]);
  for (const [, [u, v]] of groupEdgesMap) groupAdj[u].push(v);

  const mkGI = (extra) => ({ groupIn: [...groupIn], groupAdj: groupAdj.map(a=>[...a]), groupOrder: [], ...extra });

  steps.push({
    phase: "build", title: "Build Item & Group Graphs",
    inDegree: [...itemIn], prevInDegree: null,
    queue: [], processed: [], order: [],
    highlight: null, neighbors: [], changedNode: null,
    detail: `${P2_N} items in ${P2_M} groups. Item deps from beforeItems, inter-group edges from cross-group deps. Groups: ${itemInGroup.map((a,i)=>`G${i}=[${a}]`).join(", ")}.`,
    edges: [], graph: itemAdj.map(a=>[...a]),
    codeHL: [0,1,2,3,4,5], finalized: new Set(),
    groupInfo: mkGI({ phase: "build" }),
  });

  // Phase 1: Topo sort groups
  const gIn = [...groupIn];
  const gq = [];
  for (let i = 0; i < P2_M; i++) if (gIn[i] === 0) gq.push(i);
  const groupOrder = [];
  let gqi = 0;

  steps.push({
    phase: "groupSeed", title: `Phase 1: Seed Group Queue [${gq.join(",")}]`,
    inDegree: [...itemIn], prevInDegree: null,
    queue: [], processed: [], order: [],
    highlight: null, neighbors: [], changedNode: null,
    detail: `Group in-degrees: [${groupIn.join(",")}]. Groups with 0: [${gq.join(",")}].`,
    edges: [], graph: itemAdj.map(a=>[...a]),
    codeHL: [6,7], finalized: new Set(),
    groupInfo: mkGI({ phase: "seed", gQueue: [...gq] }),
  });

  while (gqi < gq.length) {
    const g = gq[gqi]; gqi++;
    groupOrder.push(g);
    for (const ng of groupAdj[g]) { gIn[ng]--; if (gIn[ng] === 0) gq.push(ng); }
    steps.push({
      phase: "groupProcess", title: `Group ${g} \u2192 Order: [${groupOrder.join(",")}]`,
      inDegree: [...itemIn], prevInDegree: null,
      queue: [], processed: [], order: [],
      highlight: null, neighbors: [], changedNode: null,
      detail: `Dequeue group ${g}. Items: [${itemInGroup[g].join(",")}]. Group order: [${groupOrder.join(" \u2192 ")}].`,
      edges: [], graph: itemAdj.map(a=>[...a]),
      codeHL: [8,9,10,11], finalized: new Set(),
      groupInfo: { groupIn: [...gIn], groupAdj: groupAdj.map(a=>[...a]), groupOrder: [...groupOrder], phase: "process", activeGroup: g },
    });
  }

  // Phase 2: Topo sort items within each group
  const finalOrder = [];
  const finalized = new Set();
  const localIn = new Array(P2_N).fill(0);
  for (let i = 0; i < P2_N; i++) for (const dep of P2_BEFORE[i]) if (P2_GROUP[dep] === P2_GROUP[i]) localIn[i]++;

  for (const g of groupOrder) {
    const items = itemInGroup[g];
    const lIn = {};
    for (const it of items) lIn[it] = localIn[it];
    const lq = items.filter(it => lIn[it] === 0);
    let lqi = 0;

    steps.push({
      phase: "groupItems", title: `Phase 2: Group ${g} Items [${items.join(",")}]`,
      inDegree: items.map(it => lIn[it]), prevInDegree: null,
      queue: lq.map(x=>x), processed: [...finalOrder], order: [...finalOrder],
      highlight: null, neighbors: [], changedNode: null,
      detail: `Topo sort items in group ${g}. Local in-degrees: [${items.map(it=>it+":"+lIn[it]).join(", ")}].`,
      edges: [], graph: itemAdj.map(a=>[...a]),
      codeHL: [12,13,14], finalized: new Set(finalized),
      groupInfo: { groupIn: [...gIn], groupAdj: groupAdj.map(a=>[...a]), groupOrder: [...groupOrder], phase: "items", activeGroup: g },
    });

    while (lqi < lq.length) {
      const nd = lq[lqi]; lqi++;
      finalOrder.push(nd); finalized.add(nd);
      for (const v of itemAdj[nd]) if (P2_GROUP[v] === g) { lIn[v]--; if (lIn[v] === 0) lq.push(v); }

      steps.push({
        phase: "itemAdd", title: `Item ${nd} \u2192 [${finalOrder.join(",")}]`,
        inDegree: items.map(it => lIn[it] !== undefined ? lIn[it] : 0), prevInDegree: null,
        queue: lq.slice(lqi), processed: [...finalOrder], order: [...finalOrder],
        highlight: nd, neighbors: [], changedNode: null,
        detail: `Add item ${nd} (G${g}). Total: ${finalOrder.length}/${P2_N}.`,
        edges: [], graph: itemAdj.map(a=>[...a]),
        codeHL: [15,16], finalized: new Set(finalized),
        groupInfo: { groupIn: [...gIn], groupAdj: groupAdj.map(a=>[...a]), groupOrder: [...groupOrder], phase: "items", activeGroup: g },
      });
    }
  }

  steps.push({
    phase: "result", title: `\u2713 Result: [${finalOrder.join(", ")}]`,
    inDegree: new Array(P2_N).fill(0), prevInDegree: null,
    queue: [], processed: [...finalOrder], order: [...finalOrder],
    highlight: null, neighbors: [], changedNode: null, hasCycle: false, stuck: [],
    detail: `All ${P2_N} items sorted respecting item deps and group constraints.`,
    edges: [], graph: itemAdj.map(a=>[...a]),
    codeHL: [17], finalized: new Set(finalized),
    groupInfo: { groupIn: [...gIn], groupAdj: groupAdj.map(a=>[...a]), groupOrder: [...groupOrder], phase: "done" },
  });

  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title: "Algorithm", lc: null, difficulty: null, tag: "Topo Sort",
    coreIdea: "Kahn's performs topological sort via BFS. Enqueue all in-degree 0 nodes. Dequeue, append to result, decrement neighbors' in-degrees. When a neighbor hits 0, enqueue. If all processed \u2192 DAG. Otherwise \u2192 cycle. O(V+E).",
    buildSteps: buildAlgSteps, hasVariant: false,
    n: ALG_N, positions: ALG_POS, labels: null,
    code: [
      {id:0,text:"def kahn_topo_sort(n, edges):"},{id:1,text:"    graph = defaultdict(list)"},
      {id:2,text:"    in_degree = [0] * n"},{id:3,text:"    for u, v in edges:"},
      {id:4,text:"        graph[u].append(v)"},{id:5,text:"        in_degree[v] += 1"},
      {id:6,text:""},{id:7,text:"    queue = deque(i for i in range(n)"},
      {id:8,text:"                  if in_degree[i] == 0)"},{id:9,text:"    order = []"},
      {id:10,text:""},{id:11,text:"    while queue:"},
      {id:12,text:"        node = queue.popleft()"},{id:13,text:"        order.append(node)"},
      {id:14,text:"        for nb in graph[node]:"},{id:15,text:"            in_degree[nb] -= 1"},
      {id:16,text:"            if in_degree[nb] == 0:"},{id:17,text:"                queue.append(nb)"},
      {id:18,text:""},{id:19,text:"    return order if len(order)==n else []"},
    ],
  },
  cs1: {
    title: "Course Schedule", lc: "207", difficulty: "Medium", tag: "Cycle Detect",
    coreIdea: "Given numCourses and prerequisite pairs, determine if all courses can be finished. Build directed graph (prereq\u2192course), run Kahn's. If processed count equals numCourses \u2192 True (no cycle). Otherwise \u2192 False.",
    buildSteps: buildCS1Steps, hasVariant: true,
    code: [
      {id:0,text:"def canFinish(numCourses, prereqs):"},{id:1,text:"    graph = defaultdict(list)"},
      {id:2,text:"    in_degree = [0] * numCourses"},{id:3,text:"    for course, prereq in prereqs:"},
      {id:4,text:"        graph[prereq].append(course)"},{id:5,text:"        in_degree[course] += 1"},
      {id:6,text:""},{id:7,text:"    queue = deque(c for c in range(n)"},
      {id:8,text:"                  if in_degree[c] == 0)"},{id:9,text:"    processed = 0"},
      {id:10,text:""},{id:11,text:"    while queue:"},
      {id:12,text:"        node = queue.popleft()"},{id:13,text:"        processed += 1"},
      {id:14,text:"        for nb in graph[node]:"},{id:15,text:"            in_degree[nb] -= 1"},
      {id:16,text:"            if in_degree[nb] == 0:"},{id:17,text:"                queue.append(nb)"},
      {id:18,text:""},{id:19,text:"    return processed == numCourses"},
    ],
  },
  cs2: {
    title: "Course Schedule II", lc: "210", difficulty: "Medium", tag: "Topo Order",
    coreIdea: "Return a valid ordering of courses given prerequisite pairs, or empty array if impossible (cycle). Same Kahn's BFS but collect the order array. If its length equals numCourses, return it; otherwise return [].",
    buildSteps: buildCS2Steps, hasVariant: true,
    code: [
      {id:0,text:"def findOrder(numCourses, prereqs):"},{id:1,text:"    graph = defaultdict(list)"},
      {id:2,text:"    in_degree = [0] * numCourses"},{id:3,text:"    for course, prereq in prereqs:"},
      {id:4,text:"        graph[prereq].append(course)"},{id:5,text:"        in_degree[course] += 1"},
      {id:6,text:""},{id:7,text:"    queue = deque(c for c in range(n)"},
      {id:8,text:"                  if in_degree[c] == 0)"},{id:9,text:"    order = []"},
      {id:10,text:""},{id:11,text:"    while queue:"},
      {id:12,text:"        node = queue.popleft()"},{id:13,text:"        order.append(node)"},
      {id:14,text:"        for nb in graph[node]:"},{id:15,text:"            in_degree[nb] -= 1"},
      {id:16,text:"            if in_degree[nb] == 0:"},{id:17,text:"                queue.append(nb)"},
      {id:18,text:""},{id:19,text:"    return order if len(order)==n else []"},
    ],
  },
  alien: {
    title: "Alien Dictionary", lc: "269", difficulty: "Hard", tag: "Char Ordering",
    coreIdea: "Given sorted words in an alien language, determine character order. Compare adjacent words to extract ordering constraints (edges), then Kahn's on the character graph. If cycle \u2192 invalid. Otherwise the topo order is the alien alphabet.",
    buildSteps: buildP1Steps, hasVariant: false,
    n: P1_N, positions: P1_POS, labels: P1_LABELS,
    code: [
      {id:0,text:"def alienOrder(words):"},{id:1,text:"    adj = defaultdict(set)"},
      {id:2,text:"    in_d = {c:0 for w in words for c in w}"},
      {id:3,text:"    for w1,w2 in zip(words,words[1:]):"},
      {id:4,text:"        for a,b in zip(w1,w2):"},
      {id:5,text:"            if a!=b: adj[a].add(b); in_d[b]+=1; break"},
      {id:6,text:""},{id:7,text:"    queue = deque(c for c if in_d[c]==0)"},
      {id:8,text:"    order = []"},
      {id:9,text:"    while queue:"},{id:10,text:"        c = queue.popleft()"},
      {id:11,text:"        order.append(c)"},
      {id:12,text:"        for nb in adj[c]:"},{id:13,text:"            in_d[nb] -= 1"},
      {id:14,text:"            if in_d[nb]==0: queue.append(nb)"},
      {id:15,text:"    return ''.join(order) if len==n else ''"},
    ],
  },
  groups: {
    title: "Sort Items by Groups", lc: "1203", difficulty: "Hard", tag: "Two-Level",
    coreIdea: "Sort items respecting item-level deps and group constraints (same-group items must be contiguous). Phase 1: topo-sort groups via inter-group edges. Phase 2: topo-sort items within each group in that order. Concatenate.",
    buildSteps: buildP2Steps, hasVariant: false,
    n: P2_N, positions: P2_POS, labels: null,
    code: [
      {id:0,text:"def sortItems(n, m, group, before):"},{id:1,text:"    item_adj, group_adj = {}, {}"},
      {id:2,text:"    for i in range(n):"},{id:3,text:"        for dep in before[i]:"},
      {id:4,text:"            item_adj[dep].add(i)"},{id:5,text:"            if g[dep]!=g[i]: group_adj edge"},
      {id:6,text:"    # Phase 1: topo sort groups"},{id:7,text:"    gq = [g for g if g_in[g]==0]"},
      {id:8,text:"    while gq:"},{id:9,text:"        g = gq.popleft()"},
      {id:10,text:"        group_order.append(g)"},{id:11,text:"        for ng in group_adj[g]: ..."},
      {id:12,text:"    # Phase 2: topo items per group"},{id:13,text:"    for g in group_order:"},
      {id:14,text:"        local topo sort items_in[g]"},{id:15,text:"        result.extend(sorted)"},
      {id:16,text:"        # kahn within group"},{id:17,text:"    return result"},
    ],
  },
};

/* ═══════════════════════════════════════════
   GRAPH SVG
   ═══════════════════════════════════════════ */
function GraphView({ step, positions, labels, pKey }) {
  const { processed, highlight, neighbors, activeEdge, graph } = step;
  const L = (x) => labels ? labels[x] : x;
  const n = positions.length;

  const getColor = (id) => {
    if (step.phase === "result" && step.hasCycle && step.stuck && step.stuck.includes(id))
      return { fill: "#ef4444", stroke: "#dc2626" };
    if (id === highlight) return { fill: "#3b82f6", stroke: "#2563eb" };
    if (neighbors && neighbors.includes(id)) return { fill: "#f59e0b", stroke: "#d97706" };
    if (processed && processed.includes(id)) return { fill: "#10b981", stroke: "#059669" };
    return { fill: "#27272a", stroke: "#52525b" };
  };

  const renderedEdges = [];
  for (let u = 0; u < n; u++) { if (graph && graph[u]) for (const v of graph[u]) renderedEdges.push([u, v]); }
  const edgeList = renderedEdges.length > 0 ? renderedEdges : (step.edges || []);

  const groupBoxes = pKey === "groups" ? [
    { label: "G0", x: 40, y: 45, w: 200, h: 80 },
    { label: "G1", x: 40, y: 200, w: 200, h: 80 },
    { label: "G2", x: 300, y: 45, w: 80, h: 200 },
  ] : [];

  return (
    <svg viewBox="0 0 440 310" className="w-full" style={{ maxHeight: 230 }}>
      {groupBoxes.map((gb, i) => (
        <g key={`gb-${i}`}>
          <rect x={gb.x} y={gb.y} width={gb.w} height={gb.h} rx="12" fill="none"
            stroke={step.groupInfo && step.groupInfo.activeGroup === i ? "#3b82f6" : "#3f3f46"}
            strokeWidth={step.groupInfo && step.groupInfo.activeGroup === i ? 2 : 1}
            strokeDasharray="6,3" />
          <text x={gb.x+8} y={gb.y+14} fill="#71717a" fontSize="10" fontWeight="600" fontFamily="monospace">{gb.label}</text>
        </g>
      ))}
      {edgeList.map(([from, to], i) => {
        const f = positions[from], t = positions[to];
        if (!f || !t) return null;
        const dx = t.x-f.x, dy = t.y-f.y, len = Math.sqrt(dx*dx+dy*dy)||1;
        const r = 22, sx = f.x+(dx/len)*r, sy = f.y+(dy/len)*r, ex = t.x-(dx/len)*r, ey = t.y-(dy/len)*r;
        const isActive = activeEdge && activeEdge[0]===from && activeEdge[1]===to;
        const isProc = processed && processed.includes(from) && processed.includes(to);
        const color = isActive ? "#f59e0b" : isProc ? "#059669" : "#3f3f46";
        const mId = `ar-${pKey}-${i}`;
        return (
          <g key={`e-${i}`}>
            <defs><marker id={mId} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill={color} /></marker></defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isActive?3:1.5} markerEnd={`url(#${mId})`} />
          </g>
        );
      })}
      {positions.map((pos, id) => {
        if (!pos) return null;
        const c = getColor(id);
        const label = String(L(id));
        return (
          <g key={`n-${id}`}>
            <circle cx={pos.x} cy={pos.y} r={20} fill={c.fill} stroke={c.stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={label.length>1?11:15} fontWeight="700" fontFamily="monospace">{label}</text>
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
  const { phase, order, processed } = step;
  const done = phase === "result";
  const labels = (pKey === "alien") ? P1_LABELS : null;
  const L = (x) => labels ? labels[x] : x;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5">
          {(pKey === "cs1" || pKey === "cs2") && variantData && <>
            <div><span className="text-zinc-500">n   </span>= <span className="text-blue-400">{variantData.n}</span></div>
            <div><span className="text-zinc-500">deps</span>= <span className="text-zinc-300">{variantData.prereqs.length} pairs</span></div>
            <div className="text-zinc-600 text-[10px] italic">{variantData.desc}</div>
          </>}
          {pKey === "algorithm" && <><div><span className="text-zinc-500">n</span>= <span className="text-blue-400">{ALG_N}</span>, <span className="text-zinc-500">edges</span>= <span className="text-zinc-300">{ALG_EDGES.length}</span></div></>}
          {pKey === "alien" && <><div><span className="text-zinc-500">words</span>= <span className="text-zinc-300">{P1_WORDS.map(w=>`"${w}"`).join(",")}</span></div></>}
          {pKey === "groups" && <><div><span className="text-zinc-500">n,m</span>= <span className="text-blue-400">{P2_N},{P2_M}</span></div><div><span className="text-zinc-500">group</span>= <span className="text-zinc-300">[{P2_GROUP.join(",")}]</span></div></>}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected</div>
        <div className="font-mono text-[11px]">
          {pKey === "cs1" && variantData && <span className={variantData.expected ? "text-emerald-400" : "text-red-400"}>{String(variantData.expected)}</span>}
          {pKey === "cs2" && variantData && <span className="text-zinc-300">{variantData.expected ? `[${[0,1,2,3].join(",")}]` : "[]"}</span>}
          {pKey === "algorithm" && <span className="text-zinc-300">[{[0,1,2,3].join(",")}]</span>}
          {pKey === "alien" && <span className="text-zinc-300">"{P1_EXPECTED.map(i=>P1_LABELS[i]).join("")}"</span>}
          {pKey === "groups" && <span className="text-zinc-300">[{P2_EXPECTED.join(",")}]</span>}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output</div>
          {done && <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${step.hasCycle ? "bg-red-900 text-red-300" : "bg-emerald-900 text-emerald-300"}`}>{step.hasCycle ? "\u2717 CYCLE" : "\u2713 DONE"}</span>}
        </div>
        <div className="font-mono text-[11px]">
          {pKey === "cs1" ? (
            <div><span className="text-zinc-500">processed= </span>
              <span className={done ? (step.hasCycle ? "text-red-400 font-bold" : "text-emerald-300 font-bold") : "text-zinc-400"}>{processed ? processed.length : 0}</span>
              <span className="text-zinc-600">/{variantData ? variantData.n : 4}</span>
              {done && <span className={`ml-1 ${step.hasCycle ? "text-red-500" : "text-emerald-500"}`}>{step.hasCycle ? "\u2192 False" : "\u2192 True"}</span>}
            </div>
          ) : (
            <div className="flex items-center gap-0.5 flex-wrap">
              <span className="text-zinc-500">[</span>
              {order && order.length > 0 ? order.map((v, i) => (
                <span key={i} className="flex items-center">
                  <span className={done && !step.hasCycle ? "text-emerald-300 font-bold" : "text-zinc-400"}>{L(v)}</span>
                  {i < order.length - 1 && <span className="text-zinc-600">,</span>}
                </span>
              )) : <span className="text-zinc-700">...</span>}
              <span className="text-zinc-500">]</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHARED
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
              <span className="inline-block w-5 text-right mr-3 text-zinc-700 select-none" style={{ userSelect: "none" }}>{line.text !== "" ? line.id + 1 : ""}</span>
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
   MAIN
   ═══════════════════════════════════════════ */
export default function KahnsViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [csVariant, setCsVariant] = useState("no_cycle");
  const [si, setSi] = useState(0);

  const problem = PROBLEMS[pKey];
  const variantData = (pKey === "cs1" || pKey === "cs2") ? CS_VARIANTS[csVariant] : null;

  const steps = useMemo(() => {
    if (pKey === "cs1" || pKey === "cs2") return problem.buildSteps(csVariant);
    return problem.buildSteps();
  }, [pKey, csVariant]);

  const step = steps[Math.min(si, steps.length - 1)];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  const positions = (pKey === "cs1" || pKey === "cs2") && variantData ? variantData.positions
    : pKey === "algorithm" ? ALG_POS
    : problem.positions;
  const labels = pKey === "alien" ? P1_LABELS : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kahn's Algorithm</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Topological Sort & Cycle Detection</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
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
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
            {problem.difficulty && <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              problem.difficulty === "Hard" ? "bg-red-900/50 text-red-400" : "bg-amber-900/50 text-amber-400"
            }`}>{problem.difficulty}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">{problem.tag}</span>
            {(pKey === "cs1" || pKey === "cs2") && (
              <div className="flex gap-1 ml-auto">
                {Object.entries(CS_VARIANTS).map(([k, v]) => (
                  <button key={k} onClick={() => { setCsVariant(k); setSi(0); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      csVariant === k ? (k === "cycle" ? "bg-red-700 text-white" : "bg-emerald-700 text-white") : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                    }`}>{v.label}</button>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        <div className="mb-3"><NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} /></div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} pKey={pKey} problem={problem} variantData={variantData} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{positions.length}N {"\u2022"} directed</div>
              <GraphView step={step} positions={positions} labels={labels} pKey={pKey} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Active</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Neighbor</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Done</span>
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${
              step.phase === "result" ? (step.hasCycle ? "bg-red-950/30 border-red-900" : "bg-emerald-950/30 border-emerald-900") : "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "result" ? (step.hasCycle ? "bg-red-900 text-red-300" : "bg-emerald-900 text-emerald-300") :
                  step.phase === "update" ? "bg-amber-900 text-amber-300" :
                  step.phase === "dequeue" ? "bg-blue-900 text-blue-300" :
                  step.phase === "seed" || step.phase === "groupSeed" ? "bg-cyan-900 text-cyan-300" :
                  step.phase === "extract" ? "bg-purple-900 text-purple-300" :
                  step.phase === "groupProcess" ? "bg-indigo-900 text-indigo-300" :
                  step.phase === "itemAdd" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
              {step.phase === "result" && (
                <div className={`mt-3 p-2.5 rounded-xl ${step.hasCycle ? "bg-red-950/50 border border-red-900" : "bg-emerald-950/50 border border-emerald-900"}`}>
                  <div className="font-mono text-xs">
                    {step.hasCycle
                      ? <span className="text-red-400 font-bold">Cycle \u2014 return {pKey === "cs1" ? "False" : "[]"}</span>
                      : <span className="text-emerald-400 font-bold">return {pKey === "cs1" ? "True" : `[${(step.order||[]).map(v => labels ? labels[v] : v).join(", ")}]`}</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                {pKey === "groups" && step.groupInfo ? "Group Order" : "in_degree[]"}
              </div>
              {pKey === "groups" && step.groupInfo ? (
                <div className="space-y-1">
                  <div className="flex gap-1 items-center font-mono text-xs">
                    <span className="text-zinc-500">order:</span>
                    {step.groupInfo.groupOrder.length > 0
                      ? step.groupInfo.groupOrder.map((g, i) => (
                          <span key={i} className="flex items-center gap-0.5">
                            <span className={`px-2 py-0.5 rounded ${step.groupInfo.activeGroup === g ? "bg-blue-900 text-blue-300" : "bg-zinc-800 text-zinc-400"}`}>G{g}</span>
                            {i < step.groupInfo.groupOrder.length - 1 && <span className="text-zinc-600">{"\u2192"}</span>}
                          </span>
                        ))
                      : <span className="text-zinc-700">...</span>}
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-1">
                    {[0,1,2].map(g => (
                      <div key={g} className={`px-2 py-0.5 rounded ${step.groupInfo.activeGroup === g ? "bg-blue-950/30" : ""}`}>
                        G{g}: [{P2_GROUP.map((gi, idx) => gi === g ? idx : null).filter(x => x !== null).join(",")}]
                        {step.groupInfo.activeGroup === g && <span className="text-blue-400 ml-1">{"\u25c0"}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-1.5 flex-wrap">
                  {step.inDegree && step.inDegree.map((curr, i) => {
                    const Lbl = labels ? labels[i] : i;
                    const changed = step.changedNode === i;
                    const prev = step.prevInDegree ? step.prevInDegree[i] : null;
                    const isStuck = step.phase === "result" && step.hasCycle && step.stuck && step.stuck.includes(i);
                    const isDone = step.finalized && step.finalized.has(i);
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-zinc-600 font-mono">{Lbl}</span>
                        <div className={`w-10 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                          isStuck ? "bg-red-950 border-red-800 text-red-300" :
                          changed ? "bg-amber-950 border-amber-700 text-amber-200 scale-110" :
                          isDone ? "bg-emerald-950/20 border-emerald-800 text-emerald-300" :
                          curr === 0 ? "bg-emerald-950 border-emerald-800 text-emerald-300" :
                          "bg-zinc-900 border-zinc-700 text-zinc-300"
                        }`}>{changed && prev !== null ? <span><span className="text-zinc-500 line-through text-[10px]">{prev}</span> {curr}</span> : curr}</div>
                        {isDone && <span className="text-[8px] font-mono text-emerald-700">{"\u2713"}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">graph[]</div>
              <div className="space-y-0.5">
                {step.graph && step.graph.map((nb, node) => {
                  const Lbl = labels ? labels[node] : node;
                  const isIter = step.iteratingNode === node;
                  const isProc = step.processed && step.processed.includes(node);
                  return (
                    <div key={node} className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-xs ${isIter ? "bg-blue-950/50 border border-blue-800" : "border border-transparent"}`}>
                      <span className={`font-bold w-6 ${isIter ? "text-blue-400" : isProc ? "text-emerald-500" : "text-zinc-400"}`}>{Lbl}</span>
                      <span className="text-zinc-600">{"\u2192"} [</span>
                      {(!nb || nb.length === 0)
                        ? <span className="text-zinc-700 italic text-[10px]">empty</span>
                        : nb.map((v, j) => {
                            const LV = labels ? labels[v] : v;
                            const isTarget = step.activeEdge && step.activeEdge[0] === node && step.activeEdge[1] === v;
                            return (
                              <span key={j}><span className={isTarget ? "bg-amber-800 text-amber-200 font-bold px-1 rounded" : isIter ? "text-blue-300" : "text-zinc-400"}>{LV}</span>
                                {j < nb.length - 1 && <span className="text-zinc-700">, </span>}</span>
                            );
                          })
                      }
                      <span className="text-zinc-600">]</span>
                      {isIter && <span className="text-blue-500 text-[10px] ml-auto">{"\u25c0"}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Queue</div>
                  <div className="flex gap-1 min-h-[28px] items-center flex-wrap">
                    {step.queue && step.queue.length > 0 ? step.queue.map((nd, i) => {
                      const Lbl = labels ? labels[nd] : nd;
                      return <span key={i} className="inline-flex items-center justify-center min-w-[28px] h-7 px-1 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-xs">{Lbl}</span>;
                    }) : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-1.5">{pKey === "cs1" ? "Processed" : "Order"}</div>
                  <div className="flex gap-0.5 min-h-[28px] items-center flex-wrap">
                    {pKey === "cs1" ? (
                      <span className="inline-flex items-center justify-center px-3 h-7 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs">
                        {step.processed ? step.processed.length : 0} / {(pKey==="cs1"&&variantData)?variantData.n:step.inDegree?step.inDegree.length:0}
                      </span>
                    ) : (
                      step.order && step.order.length > 0 ? step.order.map((nd, i) => {
                        const Lbl = labels ? labels[nd] : nd;
                        return (
                          <span key={i} className="flex items-center gap-0.5">
                            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-1 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs">{Lbl}</span>
                            {i < step.order.length - 1 && <span className="text-emerald-800 text-[10px]">{"\u2192"}</span>}
                          </span>
                        );
                      }) : <span className="text-[10px] text-zinc-600 italic">empty</span>
                    )}
                  </div>
                </div>
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
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Topological sort {"\u2014"} order so all edges point forward</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Cycle detection in directed graphs</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Task scheduling, build systems, dependency resolution</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Course prerequisites, alien dictionaries, compilation order</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V + E)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V + E)</div>
                <div><span className="text-zinc-500 font-semibold">Alt:</span> DFS post-order reverse</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 207 {"\u2014"} Course Schedule</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 210 {"\u2014"} Course Schedule II</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 269 {"\u2014"} Alien Dictionary</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1203 {"\u2014"} Sort Items by Groups</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 2115 {"\u2014"} Find All Possible Recipes</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 310 {"\u2014"} Minimum Height Trees</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}