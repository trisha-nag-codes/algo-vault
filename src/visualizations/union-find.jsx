import { useState, useMemo } from "react";

/* ─── Problem Input ─── */
const N = 6;
const OPS = [
  { type: "union", a: 1, b: 2 },
  { type: "union", a: 3, b: 4 },
  { type: "union", a: 0, b: 1 },
  { type: "union", a: 3, b: 5 },
  { type: "union", a: 0, b: 3 },
  { type: "find", node: 5 },
];

/* ─── Expected Output (precomputed) ─── */
const EXPECTED_PARENT = [1, 1, 1, 1, 3, 1];
const EXPECTED_COMPONENTS = 1;
const EXPECTED_FIND_5 = 1;

/* ─── Node positions for graph ─── */
const POS = [
  { x: 60, y: 60 }, { x: 180, y: 60 }, { x: 300, y: 60 },
  { x: 60, y: 200 }, { x: 180, y: 200 }, { x: 300, y: 200 },
];

/* ─── Build simulation steps ─── */
function buildSteps() {
  const parent = Array.from({ length: N }, (_, i) => i);
  const rank = new Array(N).fill(0);
  const steps = [];
  const completedOps = [];

  const find = (x, path = []) => {
    path.push(x);
    while (parent[x] !== x) { x = parent[x]; path.push(x); }
    return { root: x, path };
  };

  const countComponents = () => {
    const roots = new Set();
    for (let i = 0; i < N; i++) roots.add(find(i).root);
    return roots.size;
  };

  steps.push({
    title: "Initialize – Each Node Is Its Own Root",
    detail: `parent[i] = i for all nodes. rank[i] = 0. Every node starts as an isolated component (${N} total).`,
    parent: [...parent], rank: [...rank],
    highlight: [], findPath: [], compressed: [], phase: "init",
    codeHL: [0, 1, 2, 3],
    changedParent: null, changedRank: null, prevParent: null, prevRank: null,
    components: N, completedOps: [...completedOps],
  });

  for (const op of OPS) {
    if (op.type === "union") {
      const { a, b } = op;
      const fa = find(a);
      const fb = find(b);

      steps.push({
        title: `Union(${a}, ${b}) – Find Roots`,
        detail: `find(${a}): path [${fa.path.join("→")}], root = ${fa.root}. find(${b}): path [${fb.path.join("→")}], root = ${fb.root}.`,
        parent: [...parent], rank: [...rank],
        highlight: [a, b], findPath: [...fa.path, ...fb.path], compressed: [],
        phase: "find", codeHL: [5, 6, 7, 8, 11],
        changedParent: null, changedRank: null, prevParent: null, prevRank: null,
        components: countComponents(), completedOps: [...completedOps],
      });

      if (fa.root === fb.root) {
        completedOps.push({ op: `union(${a},${b})`, result: "skip" });
        steps.push({
          title: `Union(${a}, ${b}) – Already Connected`,
          detail: `Both have root ${fa.root}. Skip — they're in the same set.`,
          parent: [...parent], rank: [...rank],
          highlight: [a, b], findPath: [], compressed: [],
          phase: "skip", codeHL: [11, 12],
          changedParent: null, changedRank: null, prevParent: null, prevRank: null,
          components: countComponents(), completedOps: [...completedOps],
        });
      } else {
        const prevParent = [...parent];
        const prevRank = [...rank];
        let attachedTo, attachedFrom;
        if (rank[fa.root] < rank[fb.root]) {
          parent[fa.root] = fb.root; attachedFrom = fa.root; attachedTo = fb.root;
        } else if (rank[fa.root] > rank[fb.root]) {
          parent[fb.root] = fa.root; attachedFrom = fb.root; attachedTo = fa.root;
        } else {
          parent[fb.root] = fa.root; rank[fa.root]++;
          attachedFrom = fb.root; attachedTo = fa.root;
        }
        completedOps.push({ op: `union(${a},${b})`, result: `${attachedFrom}→${attachedTo}` });
        steps.push({
          title: `Union(${a}, ${b}) – Merge by Rank`,
          detail: `rank[${fa.root}]=${prevRank[fa.root]}, rank[${fb.root}]=${prevRank[fb.root]}. Attach ${attachedFrom} under ${attachedTo}.${rank[attachedTo] !== prevRank[attachedTo] ? ` rank[${attachedTo}] incremented to ${rank[attachedTo]}.` : ""}`,
          parent: [...parent], rank: [...rank],
          highlight: [attachedFrom, attachedTo], findPath: [], compressed: [],
          phase: "merge", codeHL: [13, 14, 15, 16, 17, 18],
          changedParent: attachedFrom, changedRank: rank[attachedTo] !== prevRank[attachedTo] ? attachedTo : null,
          prevParent, prevRank,
          components: countComponents(), completedOps: [...completedOps],
        });
      }
    }

    if (op.type === "find") {
      const { node } = op;
      const { root, path } = find(node);

      steps.push({
        title: `Find(${node}) – Traverse to Root`,
        detail: `Follow parent pointers: ${path.join(" → ")}. Root = ${root}.`,
        parent: [...parent], rank: [...rank],
        highlight: [node], findPath: [...path], compressed: [],
        phase: "find", codeHL: [5, 6, 8],
        changedParent: null, changedRank: null, prevParent: null, prevRank: null,
        components: countComponents(), completedOps: [...completedOps],
      });

      const prevParent = [...parent];
      const compressedNodes = path.filter(n => n !== root && parent[n] !== root);
      for (const n of path) { if (n !== root) parent[n] = root; }

      if (compressedNodes.length > 0) {
        completedOps.push({ op: `find(${node})`, result: `root=${root}, compressed [${compressedNodes}]` });
        steps.push({
          title: `Find(${node}) – Path Compression`,
          detail: `Point all nodes on path directly to root ${root}. Compressed: [${compressedNodes.join(", ")}]. Future finds will be O(1).`,
          parent: [...parent], rank: [...rank],
          highlight: [node, root], findPath: [], compressed: compressedNodes,
          phase: "compress", codeHL: [6, 7],
          changedParent: compressedNodes[0], changedRank: null, prevParent, prevRank: null,
          components: countComponents(), completedOps: [...completedOps],
        });
      } else {
        completedOps.push({ op: `find(${node})`, result: `root=${root}` });
      }
    }
  }

  steps.push({
    title: "✓ Complete – Final Union-Find State",
    detail: `${countComponents()} connected component(s). Path compression has flattened the trees for O(α(n)) future operations.`,
    parent: [...parent], rank: [...rank],
    highlight: [], findPath: [], compressed: [], phase: "done",
    codeHL: [21, 22, 23],
    changedParent: null, changedRank: null, prevParent: null, prevRank: null,
    components: countComponents(), completedOps: [...completedOps],
  });

  return steps;
}

/* ─── Graph SVG ─── */
function GraphView({ step }) {
  const { parent, highlight, findPath, compressed } = step;
  return (
    <svg viewBox="0 0 360 260" className="w-full" style={{ maxHeight: 220 }}>
      {parent.map((p, i) => {
        if (p === i) return null;
        const from = POS[i], to = POS[p];
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const r = 22;
        const sx = from.x + (dx / len) * r, sy = from.y + (dy / len) * r;
        const ex = to.x - (dx / len) * r, ey = to.y - (dy / len) * r;
        const isCompressed = compressed.includes(i);
        const isOnPath = findPath.includes(i) && findPath.includes(p);
        const color = isCompressed ? "#10b981" : isOnPath ? "#f59e0b" : "#3f3f46";
        return (
          <g key={`e-${i}`}>
            <defs>
              <marker id={`ua-${i}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={color} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color}
              strokeWidth={isCompressed || isOnPath ? 2.5 : 1.5}
              markerEnd={`url(#ua-${i})`}
              strokeDasharray={isCompressed ? "5,3" : "none"} />
          </g>
        );
      })}
      {POS.map((pos, id) => {
        const isRoot = parent[id] === id;
        const isHL = highlight.includes(id);
        const isPath = findPath.includes(id);
        const isComp = compressed.includes(id);
        const fill = isComp ? "#10b981" : isHL ? "#3b82f6" : isPath ? "#f59e0b" : isRoot ? "#8b5cf6" : "#27272a";
        const stroke = isComp ? "#059669" : isHL ? "#2563eb" : isPath ? "#d97706" : isRoot ? "#7c3aed" : "#52525b";
        return (
          <g key={`n-${id}`}>
            <circle cx={pos.x} cy={pos.y} r={20} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
              fill="#fff" fontSize="15" fontWeight="700" fontFamily="monospace">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Python Code (class wrapper) ─── */
const CODE = [
  { id: 0,  text: `class UnionFind:` },
  { id: 1,  text: `    def __init__(self, n):` },
  { id: 2,  text: `        self.parent = list(range(n))` },
  { id: 3,  text: `        self.rank = [0] * n` },
  { id: 4,  text: `` },
  { id: 5,  text: `    def find(self, x):` },
  { id: 6,  text: `        if self.parent[x] != x:` },
  { id: 7,  text: `            self.parent[x] = self.find(self.parent[x])` },
  { id: 8,  text: `        return self.parent[x]` },
  { id: 9,  text: `` },
  { id: 10, text: `    def union(self, x, y):` },
  { id: 11, text: `        px, py = self.find(x), self.find(y)` },
  { id: 12, text: `        if px == py: return False` },
  { id: 13, text: `        if self.rank[px] < self.rank[py]:` },
  { id: 14, text: `            px, py = py, px` },
  { id: 15, text: `        self.parent[py] = px` },
  { id: 16, text: `        if self.rank[px] == self.rank[py]:` },
  { id: 17, text: `            self.rank[px] += 1` },
  { id: 18, text: `        return True` },
  { id: 19, text: `` },
  { id: 20, text: `# Usage` },
  { id: 21, text: `uf = UnionFind(n)` },
  { id: 22, text: `uf.union(1, 2)` },
  { id: 23, text: `uf.find(2)  # returns root of 2` },
];

/* ─── Input / Output Panel with progressive output ─── */
function IOPanel({ step }) {
  const { phase, parent, components, completedOps } = step;
  const done = phase === "done";
  const allMatch = done && EXPECTED_PARENT.every((v, i) => parent[i] === v);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">n</span> = <span className="text-blue-400">{N}</span></div>
          <div><span className="text-zinc-500">ops</span> = [</div>
          {OPS.map((op, i) => (
            <div key={i} className="pl-4">
              <span className="text-zinc-300">
                {op.type === "union" ? `union(${op.a}, ${op.b})` : `find(${op.node})`}
                {i < OPS.length - 1 ? "," : ""}
              </span>
            </div>
          ))}
          <div>]</div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs space-y-0.5">
          <div><span className="text-zinc-500">parent = </span><span className="text-zinc-300">[{EXPECTED_PARENT.join(", ")}]</span></div>
          <div><span className="text-zinc-500">components = </span><span className="text-zinc-300">{EXPECTED_COMPONENTS}</span></div>
          <div><span className="text-zinc-500">find(5) = </span><span className="text-zinc-300">{EXPECTED_FIND_5}</span></div>
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-xs space-y-1">
          <div className="flex items-center gap-0.5">
            <span className="text-zinc-500">parent = [</span>
            {Array.from({ length: N }).map((_, i) => {
              const val = parent[i];
              const matchesExpected = done && val === EXPECTED_PARENT[i];
              return (
                <span key={i} className="flex items-center">
                  <span className={
                    matchesExpected ? "text-emerald-300 font-bold" :
                    val !== i ? "text-zinc-300" :
                    "text-zinc-600"
                  }>
                    {val}
                  </span>
                  {i < N - 1 && <span className="text-zinc-600">, </span>}
                </span>
              );
            })}
            <span className="text-zinc-500">]</span>
          </div>
          <div>
            <span className="text-zinc-500">components = </span>
            <span className={done && components === EXPECTED_COMPONENTS ? "text-emerald-300 font-bold" : "text-zinc-300"}>
              {components}
            </span>
          </div>
        </div>
        {completedOps.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {completedOps.map((op, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <span className="text-zinc-600 font-mono">{op.op}</span>
                <span className={op.result === "skip" ? "text-red-400/60" : "text-emerald-400/80"}>
                  {op.result === "skip" ? "skipped" : op.result}
                </span>
                <span className="text-emerald-600">✓</span>
              </div>
            ))}
          </div>
        )}
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
export default function UnionFindViz() {
  const steps = useMemo(() => buildSteps(), []);
  const [si, setSi] = useState(0);
  const step = steps[si];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold tracking-tight">Union-Find (Disjoint Set)</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Path Compression & Union by Rank</p>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            Union-Find maintains a forest where each tree is a connected component. <strong className="text-zinc-300">find(x)</strong> walks up to the root (with path compression flattening the tree), and <strong className="text-zinc-300">union(x, y)</strong> merges two components by rank so trees stay shallow. Together these achieve nearly O(1) amortized — O(α(n)) — per operation, powering Kruskal's MST, connected components, and cycle detection.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-3">
          <NavBar si={si} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 3-COLUMN GRID ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Graph ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{N} nodes • {OPS.length} operations</div>
              <GraphView step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Root</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Target</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Find Path</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Compressed</span>
              </div>
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {si + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "merge" ? "bg-blue-900 text-blue-300" :
                  step.phase === "compress" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "find" ? "bg-amber-900 text-amber-300" :
                  step.phase === "skip" ? "bg-red-900 text-red-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* parent[] array */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">parent[]</div>
              <div className="flex gap-1.5">
                {step.parent.map((p, i) => {
                  const changed = step.changedParent === i;
                  const prevVal = step.prevParent ? step.prevParent[i] : null;
                  const isRoot = p === i;
                  const isDone = step.phase === "done";
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        changed ? "bg-amber-950 border-amber-700 text-amber-200 scale-110" :
                        isDone ? "bg-emerald-950/30 border-emerald-800 text-emerald-300" :
                        isRoot ? "bg-purple-950/30 border-purple-800 text-purple-300" :
                        "bg-zinc-900 border-zinc-700 text-zinc-300"
                      }`}>
                        {changed && prevVal !== null
                          ? <span><span className="text-zinc-600 line-through text-[10px]">{prevVal}</span> {p}</span>
                          : p}
                      </div>
                      {isRoot && <span className="text-[8px] font-mono text-purple-700">root</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* rank[] array */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">rank[]</div>
              <div className="flex gap-1.5">
                {step.rank.map((r, i) => {
                  const changed = step.changedRank === i;
                  const prevVal = step.prevRank ? step.prevRank[i] : null;
                  const isDone = step.phase === "done";
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        changed ? "bg-amber-950 border-amber-700 text-amber-200 scale-110" :
                        isDone ? "bg-emerald-950/30 border-emerald-800 text-emerald-300" :
                        "bg-zinc-900 border-zinc-700 text-zinc-300"
                      }`}>
                        {changed && prevVal !== null
                          ? <span><span className="text-zinc-600 line-through text-[10px]">{prevVal}</span> {r}</span>
                          : r}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Components count */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Components</div>
                  <div className="flex gap-1 items-center min-h-[28px]">
                    <span className={`inline-flex items-center px-2.5 h-7 rounded-md font-mono font-bold text-sm ${
                      step.components === 1 ? "bg-emerald-950 border border-emerald-800 text-emerald-300" :
                      "bg-blue-950 border border-blue-800 text-blue-300"
                    }`}>
                      {step.components}
                    </span>
                    <span className="text-[10px] text-zinc-600 ml-1">/ {N} nodes</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Roots</div>
                  <div className="flex gap-1 min-h-[28px] items-center">
                    {step.parent.map((p, i) => p === i ? (
                      <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-purple-950 border border-purple-800 text-purple-300 font-mono font-bold text-xs">{i}</span>
                    ) : null)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} />
          </div>

        </div>

        {/* ═══ BOTTOM ROW: When to Use + Classic Problems ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Dynamic connectivity — "are X and Y in the same group?"</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Kruskal's MST — sort edges, union if not in same component</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Cycle detection in undirected graphs — union returns false → cycle</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Online/streaming connectivity — add edges incrementally</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(α(n)) ≈ O(1) amortized per operation</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(n)</div>
                <div><span className="text-zinc-500 font-semibold">Won't work:</span> Deletion of edges (no un-union without rollback)</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 323 — Number of Connected Components</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 684 — Redundant Connection</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 721 — Accounts Merge</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 990 — Satisfiability of Equality Equations</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 305 — Number of Islands II</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 399 — Evaluate Division (Weighted UF)</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
