import { useState, useMemo } from "react";

/* â€”â€”â€” Problem Inputs (two examples) â€”â€”â€” */
const EXAMPLES = {
  no_cycle: {
    title: "No Cycle (Valid)",
    numCourses: 4,
    prerequisites: [[1,0],[2,0],[3,1],[3,2]],
    description: "4 courses: 0â†’1, 0â†’2, 1â†’3, 2â†’3",
    positions: [{x:200,y:50},{x:90,y:170},{x:310,y:170},{x:200,y:290}],
    expectedOrder: [0, 1, 2, 3],
    expectedBool: true,
  },
  cycle: {
    title: "Has Cycle (Invalid)",
    numCourses: 4,
    prerequisites: [[1,0],[2,1],[3,2],[1,3]],
    description: "4 courses: 0â†’1, 1â†’2, 2â†’3, 3â†’1 (cycle in 1-2-3)",
    positions: [{x:80,y:170},{x:200,y:50},{x:320,y:170},{x:200,y:290}],
    expectedOrder: [],
    expectedBool: false,
  },
};

/* â€”â€”â€” Build simulation steps â€”â€”â€” */
function buildSteps(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course] += 1;
  }

  const steps = [];
  const graphSnapshot = graph.map(arr => [...arr]);
  const finalized = new Set();

  steps.push({
    phase: "build", title: "Build Graph & Compute In-Degrees",
    inDegree: [...inDegree], prevInDegree: null,
    queue: [], processed: [], order: [],
    highlight: null, neighbors: [], changedNode: null,
    detail: `Scan prerequisites. Build adjacency list and count incoming edges for each node.`,
    edges: prerequisites.map(([c, p]) => [p, c]), graph: graphSnapshot,
    codeHL: [0, 1, 2, 3, 4, 5], finalized: new Set(finalized),
  });

  const queue = [];
  for (let c = 0; c < numCourses; c++) {
    if (inDegree[c] === 0) queue.push(c);
  }

  steps.push({
    phase: "seed", title: "Seed Queue â€” In-Degree 0 Nodes",
    inDegree: [...inDegree], prevInDegree: [...inDegree],
    queue: [...queue], processed: [], order: [],
    highlight: null, neighbors: [], changedNode: null,
    detail: `Find all nodes with in_degree[n] == 0. These have no prerequisites â€” enqueue them: [${queue.join(", ")}].`,
    edges: prerequisites.map(([c, p]) => [p, c]), graph: graphSnapshot,
    codeHL: [7, 8, 9], finalized: new Set(finalized),
  });

  const processed = [];
  const order = [];
  const currentInDegree = [...inDegree];
  let qi = 0;

  while (qi < queue.length) {
    const node = queue[qi];
    qi++;
    processed.push(node);
    order.push(node);
    finalized.add(node);

    steps.push({
      phase: "dequeue", title: `Dequeue Node ${node}`,
      inDegree: [...currentInDegree], prevInDegree: [...currentInDegree],
      queue: queue.slice(qi), processed: [...processed], order: [...order],
      highlight: node, neighbors: [], changedNode: null,
      detail: `Pop node ${node} from queue. Append to order. Processed: ${processed.length}/${numCourses}. Now iterate over graph[${node}] = [${graphSnapshot[node].join(", ")}].`,
      edges: prerequisites.map(([c, p]) => [p, c]), graph: graphSnapshot,
      codeHL: [11, 12, 13], iteratingNode: node,
      finalized: new Set(finalized),
    });

    const neighbors = graph[node];
    for (const next of neighbors) {
      const prevInDeg = [...currentInDegree];
      currentInDegree[next] -= 1;
      const enqueued = currentInDegree[next] === 0;
      if (enqueued) queue.push(next);

      steps.push({
        phase: "update",
        title: `Decrement in_degree[${next}]:  ${prevInDeg[next]} â†’ ${currentInDegree[next]}`,
        inDegree: [...currentInDegree], prevInDegree: prevInDeg,
        queue: queue.slice(qi), processed: [...processed], order: [...order],
        highlight: node, neighbors: [next], changedNode: next, enqueued,
        detail: enqueued
          ? `Edge ${node}â†’${next}: in_degree[${next}] drops to 0 â€” all prerequisites done. Enqueue node ${next}!`
          : `Edge ${node}â†’${next}: in_degree[${next}] is now ${currentInDegree[next]}. Still has unprocessed prerequisites.`,
        edges: prerequisites.map(([c, p]) => [p, c]), graph: graphSnapshot,
        activeEdge: [node, next], codeHL: [14, 15, 16, 17],
        iteratingNode: node, finalized: new Set(finalized),
      });
    }
  }

  const hasCycle = processed.length < numCourses;
  const stuck = [];
  if (hasCycle) {
    for (let i = 0; i < numCourses; i++) {
      if (!processed.includes(i)) stuck.push(i);
    }
  }

  steps.push({
    phase: "result",
    title: hasCycle ? "âœ— Cycle Detected!" : "âœ“ Complete â€” Valid Topological Order",
    inDegree: [...currentInDegree], prevInDegree: [...currentInDegree],
    queue: [], processed: [...processed], order: [...order],
    highlight: null, neighbors: [], changedNode: null,
    hasCycle, stuck,
    detail: hasCycle
      ? `Queue is empty but only processed ${processed.length} of ${numCourses} nodes. Nodes {${stuck.join(", ")}} still have in_degree > 0 â€” trapped in a cycle.`
      : `Processed all ${processed.length}/${numCourses} nodes. Order [${order.join(" â†’ ")}] is a valid topological ordering.`,
    edges: prerequisites.map(([c, p]) => [p, c]), graph: graphSnapshot,
    codeHL: [19], finalized: new Set(finalized),
  });

  return steps;
}

/* â€”â€”â€” Graph SVG â€”â€”â€” */
function GraphView({ positions, step }) {
  const { processed, highlight, neighbors, edges, activeEdge } = step;

  const getNodeColor = (id) => {
    if (step.phase === "result" && step.hasCycle && step.stuck.includes(id))
      return { fill: "#ef4444", stroke: "#dc2626" };
    if (id === highlight) return { fill: "#3b82f6", stroke: "#2563eb" };
    if (neighbors?.includes(id)) return { fill: "#f59e0b", stroke: "#d97706" };
    if (processed.includes(id)) return { fill: "#10b981", stroke: "#059669" };
    return { fill: "#27272a", stroke: "#52525b" };
  };

  return (
    <svg viewBox="0 0 400 340" className="w-full" style={{ maxHeight: 230 }}>
      {edges.map(([from, to], i) => {
        const f = positions[from], t = positions[to];
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx * dx + dy * dy);
        const r = 24;
        const sx = f.x + (dx / len) * r, sy = f.y + (dy / len) * r;
        const ex = t.x - (dx / len) * r, ey = t.y - (dy / len) * r;
        const isActive = activeEdge && activeEdge[0] === from && activeEdge[1] === to;
        const isProcessedEdge = processed.includes(from) && processed.includes(to);
        const color = isActive ? "#f59e0b" : isProcessedEdge ? "#059669" : "#3f3f46";
        return (
          <g key={`e-${i}`}>
            <defs>
              <marker id={`arr-${i}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={color} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isActive ? 3 : 1.5} markerEnd={`url(#arr-${i})`} />
          </g>
        );
      })}
      {positions.map((pos, id) => {
        const c = getNodeColor(id);
        return (
          <g key={`n-${id}`}>
            <circle cx={pos.x} cy={pos.y} r={22} fill={c.fill} stroke={c.stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="15" fontWeight="700" fontFamily="monospace">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* â€”â€”â€” Python Code (numeric IDs, two variants) â€”â€”â€” */
const CODE_CS1 = [
  { id: 0,  text: `def canFinish(numCourses, prerequisites):` },
  { id: 1,  text: `    graph = defaultdict(list)` },
  { id: 2,  text: `    in_degree = [0] * numCourses` },
  { id: 3,  text: `    for course, prereq in prerequisites:` },
  { id: 4,  text: `        graph[prereq].append(course)` },
  { id: 5,  text: `        in_degree[course] += 1` },
  { id: 6,  text: `` },
  { id: 7,  text: `    queue = deque(c for c in range(n)` },
  { id: 8,  text: `                  if in_degree[c] == 0)` },
  { id: 9,  text: `    processed = 0` },
  { id: 10, text: `` },
  { id: 11, text: `    while queue:` },
  { id: 12, text: `        node = queue.popleft()` },
  { id: 13, text: `        processed += 1` },
  { id: 14, text: `        for nb in graph[node]:` },
  { id: 15, text: `            in_degree[nb] -= 1` },
  { id: 16, text: `            if in_degree[nb] == 0:` },
  { id: 17, text: `                queue.append(nb)` },
  { id: 18, text: `` },
  { id: 19, text: `    return processed == numCourses` },
];

const CODE_CS2 = [
  { id: 0,  text: `def findOrder(numCourses, prerequisites):` },
  { id: 1,  text: `    graph = defaultdict(list)` },
  { id: 2,  text: `    in_degree = [0] * numCourses` },
  { id: 3,  text: `    for course, prereq in prerequisites:` },
  { id: 4,  text: `        graph[prereq].append(course)` },
  { id: 5,  text: `        in_degree[course] += 1` },
  { id: 6,  text: `` },
  { id: 7,  text: `    queue = deque(c for c in range(n)` },
  { id: 8,  text: `                  if in_degree[c] == 0)` },
  { id: 9,  text: `    order = []` },
  { id: 10, text: `` },
  { id: 11, text: `    while queue:` },
  { id: 12, text: `        node = queue.popleft()` },
  { id: 13, text: `        order.append(node)` },
  { id: 14, text: `        for nb in graph[node]:` },
  { id: 15, text: `            in_degree[nb] -= 1` },
  { id: 16, text: `            if in_degree[nb] == 0:` },
  { id: 17, text: `                queue.append(nb)` },
  { id: 18, text: `` },
  { id: 19, text: `    return order if len(order)==n else []` },
];

/* â€”â€”â€” Input / Output Panel with progressive output â€”â€”â€” */
function IOPanel({ example, step, variant }) {
  const { phase, order, processed, finalized } = step;
  const { numCourses, prerequisites, expectedOrder, expectedBool } = example;
  const done = phase === "result";
  const isCS2 = variant === "cs2";

  const allMatch = done && !step.hasCycle && (
    isCS2
      ? order.length === expectedOrder.length && order.every((v, i) => v === expectedOrder[i])
      : expectedBool === true
  );
  const cycleMatch = done && step.hasCycle && (
    isCS2 ? expectedOrder.length === 0 : expectedBool === false
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">numCourses</span> = <span className="text-blue-400">{numCourses}</span></div>
          <div><span className="text-zinc-500">prerequisites</span> = [</div>
          {prerequisites.map(([c, p], i) => (
            <div key={i} className="pl-4">
              <span className="text-zinc-300">[{c}, {p}]{i < prerequisites.length - 1 ? "," : ""}</span>
            </div>
          ))}
          <div>]</div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs">
          {isCS2
            ? <><span className="text-zinc-500">order = </span><span className="text-zinc-300">{expectedOrder.length > 0 ? `[${expectedOrder.join(", ")}]` : "[]"}</span></>
            : <><span className="text-zinc-500">canFinish = </span><span className={expectedBool ? "text-emerald-400" : "text-red-400"}>{expectedBool ? "True" : "False"}</span></>
          }
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {(allMatch || cycleMatch) && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
              cycleMatch ? "bg-red-900 text-red-300" : "bg-emerald-900 text-emerald-300"
            }`}>{cycleMatch ? "âœ“ CYCLE" : "âœ“ MATCH"}</span>
          )}
        </div>
        <div className="font-mono text-xs">
          {isCS2 ? (
            <div className="flex items-center gap-0.5 flex-wrap">
              <span className="text-zinc-500">order = [</span>
              {order.length === 0
                ? <span className="text-zinc-700">{done && step.hasCycle ? "" : "..."}</span>
                : order.map((v, i) => (
                    <span key={i} className="flex items-center">
                      <span className={
                        done && !step.hasCycle ? "text-emerald-300 font-bold" :
                        finalized.has(v) ? "text-emerald-400" : "text-zinc-400"
                      }>{v}</span>
                      {i < order.length - 1 && <span className="text-zinc-600">, </span>}
                    </span>
                  ))
              }
              <span className="text-zinc-500">]</span>
              {done && step.hasCycle && <span className="text-red-500 ml-1 text-[10px]">â†’ []</span>}
            </div>
          ) : (
            <div>
              <span className="text-zinc-500">processed = </span>
              <span className={done ? (step.hasCycle ? "text-red-400 font-bold" : "text-emerald-300 font-bold") : "text-zinc-400"}>
                {processed.length}
              </span>
              <span className="text-zinc-600"> / {numCourses}</span>
              {done && (
                <span className={`ml-2 ${step.hasCycle ? "text-red-500" : "text-emerald-500"}`}>
                  â†’ {step.hasCycle ? "False" : "True"}
                </span>
              )}
            </div>
          )}
        </div>
        {finalized.size > 0 && (
          <div className="mt-2 text-[10px] text-zinc-600">
            Done: {[...finalized].map(n => (
              <span key={n} className="text-emerald-600 mr-1">{n} âœ“</span>
            ))}
            {step.hasCycle && step.stuck && step.stuck.length > 0 && (
              <span className="ml-2">Stuck: {step.stuck.map(n => (
                <span key={n} className="text-red-600 mr-1">{n} âœ—</span>
              ))}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* â€”â€”â€” Code Panel â€”â€”â€” */
function CodePanel({ highlightLines, variant }) {
  const lines = variant === "cs2" ? CODE_CS2 : CODE_CS1;
  const diffLines = variant === "cs2" ? [9, 13, 19] : [];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Python</div>
        <span className="text-[9px] text-zinc-600">{variant === "cs2" ? "Course Schedule II" : "Course Schedule I"}</span>
      </div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {lines.map((line, idx) => {
          const hl = highlightLines.includes(line.id);
          const isDiff = diffLines.includes(idx);
          return (
            <div
              key={idx}
              className={`px-2 rounded-sm ${
                hl ? "bg-blue-500/15 text-blue-300" :
                isDiff ? "text-emerald-400" :
                line.text === "" ? "" : "text-zinc-500"
              }`}
            >
              <span className="inline-block w-5 text-right mr-3 text-zinc-700 select-none" style={{ userSelect: "none" }}>
                {line.text !== "" ? line.id + 1 : ""}
              </span>
              {line.text}
              {isDiff && <span className="text-emerald-700 ml-2">â—€</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* â€”â€”â€” Navigation Bar â€”â€”â€” */
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
      >Next â†’</button>
    </div>
  );
}

/* â€”â€”â€” Main Component â€”â€”â€” */
export default function KahnsVisualization() {
  const [exampleKey, setExampleKey] = useState("no_cycle");
  const [si, setSi] = useState(0);
  const [variant, setVariant] = useState("cs2");

  const example = EXAMPLES[exampleKey];
  const steps = useMemo(() => buildSteps(example.numCourses, example.prerequisites), [exampleKey]);
  const step = steps[si];

  const switchExample = (key) => { setExampleKey(key); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kahn's Algorithm</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Topological Sort & Cycle Detection</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {/* Problem toggle */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <button onClick={() => setVariant("cs1")} className={`px-4 py-2 text-xs font-semibold transition-all ${
                variant === "cs1" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}>Course Schedule I</button>
              <button onClick={() => setVariant("cs2")} className={`px-4 py-2 text-xs font-semibold transition-all ${
                variant === "cs2" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}>Course Schedule II</button>
            </div>
            {/* Example toggle */}
            <div className="flex gap-2">
              {Object.entries(EXAMPLES).map(([key]) => (
                <button key={key} onClick={() => switchExample(key)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  exampleKey === key
                    ? key === "cycle" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                  {key === "no_cycle" ? "âœ“ No Cycle" : "âœ— Has Cycle"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            Kahn's performs topological sort using BFS. Start by enqueuing all nodes with in-degree 0 (no prerequisites). Dequeue a node, add it to the result, and decrement in-degree for all its neighbors. When a neighbor's in-degree hits 0, enqueue it. If all nodes are processed, the graph is a DAG and the result is a valid topological order. If not â€” a cycle exists. Used in build systems, task scheduling, and course prerequisite resolution.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-3">
          <NavBar si={si} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 3-COLUMN GRID â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* â€”â€” COL 1: IO + Graph â€”â€” */}
          <div className="col-span-3 space-y-3">
            <IOPanel example={example} step={step} variant={variant} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{example.description}</div>
              <GraphView positions={example.positions} step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Active</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Neighbor</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Done</span>
                {exampleKey === "cycle" && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Stuck</span>}
              </div>
            </div>
          </div>

          {/* â€”â€” COL 2: Steps + State â€”â€” */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "result"
                ? step.hasCycle ? "bg-red-950/30 border-red-900" : "bg-emerald-950/30 border-emerald-900"
                : "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {si + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "result"
                    ? step.hasCycle ? "bg-red-900 text-red-300" : "bg-emerald-900 text-emerald-300"
                    : step.phase === "update" ? "bg-amber-900 text-amber-300"
                    : step.phase === "dequeue" ? "bg-blue-900 text-blue-300"
                    : step.phase === "seed" ? "bg-cyan-900 text-cyan-300"
                    : "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
              {/* Result banner inline */}
              {step.phase === "result" && (
                <div className={`mt-3 p-2.5 rounded-xl ${step.hasCycle ? "bg-red-950/50 border border-red-900" : "bg-emerald-950/50 border border-emerald-900"}`}>
                  <div className="font-mono text-xs">
                    {variant === "cs2" ? (
                      step.hasCycle
                        ? <span><span className="text-zinc-500">len(order)={step.order.length} â‰  n={step.inDegree.length} â†’</span> <span className="text-red-400 font-bold">return []</span></span>
                        : <span><span className="text-zinc-500">len(order)={step.order.length} == n â†’</span> <span className="text-emerald-400 font-bold">return [{step.order.join(", ")}]</span></span>
                    ) : (
                      step.hasCycle
                        ? <span><span className="text-zinc-500">processed={step.processed.length} â‰  {step.inDegree.length} â†’</span> <span className="text-red-400 font-bold">return False</span></span>
                        : <span><span className="text-zinc-500">processed={step.processed.length} == {step.inDegree.length} â†’</span> <span className="text-emerald-400 font-bold">return True</span></span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* in_degree[] */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">in_degree[]</div>
              <div className="flex gap-1.5">
                {step.inDegree.map((curr, i) => {
                  const changed = step.changedNode === i;
                  const prev = step.prevInDegree ? step.prevInDegree[i] : null;
                  const isStuck = step.phase === "result" && step.hasCycle && step.stuck?.includes(i);
                  const isZero = curr === 0;
                  const isDone = step.finalized.has(i);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        isStuck ? "bg-red-950 border-red-800 text-red-300" :
                        changed ? "bg-amber-950 border-amber-700 text-amber-200 scale-110" :
                        isDone ? "bg-emerald-950/20 border-emerald-800 text-emerald-300" :
                        isZero ? "bg-emerald-950 border-emerald-800 text-emerald-300" :
                        "bg-zinc-900 border-zinc-700 text-zinc-300"
                      }`}>
                        {changed && prev !== null
                          ? <span><span className="text-zinc-500 line-through text-[10px]">{prev}</span> {curr}</span>
                          : curr}
                      </div>
                      {isDone && <span className="text-[8px] font-mono text-emerald-700">âœ“</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Adjacency list */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">graph[]</div>
              <div className="space-y-0.5">
                {step.graph.map((neighbors, node) => {
                  const isIterating = step.iteratingNode === node;
                  const isProcessedNode = step.processed.includes(node);
                  return (
                    <div key={node} className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-xs ${
                      isIterating ? "bg-blue-950/50 border border-blue-800" : "border border-transparent"
                    }`}>
                      <span className={`font-bold w-4 ${isIterating ? "text-blue-400" : isProcessedNode ? "text-emerald-500" : "text-zinc-400"}`}>{node}</span>
                      <span className="text-zinc-600">â†’ [</span>
                      {neighbors.length === 0
                        ? <span className="text-zinc-700 italic text-[10px]">empty</span>
                        : neighbors.map((n, i) => {
                            const isActiveTarget = step.activeEdge && step.activeEdge[0] === node && step.activeEdge[1] === n;
                            return (
                              <span key={i}>
                                <span className={`px-1 py-0.5 rounded ${
                                  isActiveTarget ? "bg-amber-800 text-amber-200 font-bold" : isIterating ? "text-blue-300" : "text-zinc-400"
                                }`}>{n}</span>
                                {i < neighbors.length - 1 && <span className="text-zinc-700">, </span>}
                              </span>
                            );
                          })
                      }
                      <span className="text-zinc-600">]</span>
                      {isIterating && <span className="text-blue-500 text-[10px] ml-auto">â—€ iterating</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Queue + Order/Count */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Queue</div>
                  <div className="flex gap-1 min-h-[28px] items-center flex-wrap">
                    {step.queue.length > 0 ? step.queue.map((n, i) => (
                      <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-xs">{n}</span>
                    )) : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                  </div>
                </div>
                {variant === "cs2" ? (
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-1.5">order[]</div>
                    <div className="flex gap-0.5 min-h-[28px] items-center flex-wrap">
                      {step.order.length > 0 ? step.order.map((n, i) => (
                        <span key={i} className="flex items-center gap-0.5">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs">{n}</span>
                          {i < step.order.length - 1 && <span className="text-emerald-800 text-[10px]">â†’</span>}
                        </span>
                      )) : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Processed</div>
                    <div className="flex items-center min-h-[28px]">
                      <span className="inline-flex items-center justify-center px-3 h-7 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs">
                        {step.processed.length} / {step.inDegree.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* â€”â€” COL 3: Code â€”â€” */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} variant={variant} />
          </div>

        </div>

        {/* â•â•â• BOTTOM ROW: When to Use + Classic Problems â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Topological sort â€” order nodes so all edges point forward</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Cycle detection in directed graphs â€” if not all nodes processed</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Task scheduling, build systems, dependency resolution</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Course prerequisites â€” can all courses be completed?</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V + E)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V + E)</div>
                <div><span className="text-zinc-500 font-semibold">Alternative:</span> DFS-based topo sort (post-order reverse)</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 207 â€” Course Schedule</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 210 â€” Course Schedule II</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 269 â€” Alien Dictionary</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 1203 â€” Sort Items by Groups Respecting Deps</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 2115 â€” Find All Possible Recipes</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 310 â€” Minimum Height Trees</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
