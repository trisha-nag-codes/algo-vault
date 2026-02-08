import { useState, useMemo } from "react";

/* ═══ Problem Definitions ═══ */
const PROBLEMS = {
  rangeSum: {
    title: "Range Sum Query",
    subtitle: "LC 307 · Range Sum Query Mutable",
    coreIdea: "Build a binary tree where each node stores the sum of its range. A leaf holds one element; a parent holds sum of its two children. Point update walks root→leaf updating sums. Range query decomposes [l,r] into O(log n) disjoint tree nodes whose ranges fully cover the query — at most 2 nodes per level.",
    arr: [1, 3, 5, 7, 9, 11],
    merge: (a, b) => a + b,
    identity: 0,
    mergeLabel: "sum",
    ops: [
      { type: "query", l: 1, r: 4 },
      { type: "update", idx: 2, val: 10 },
      { type: "query", l: 0, r: 5 },
      { type: "query", l: 2, r: 4 },
    ],
  },
  rangeMin: {
    title: "Range Min Query",
    subtitle: "LC 2286 · Segment Tree for Min",
    coreIdea: "Same structure, different merge: each node stores the minimum of its range instead of sum. Update replaces a leaf then recomputes min up the path. Query decomposes [l,r] the same way — return min across the covering nodes. Swap the merge function and the segment tree handles any associative operation.",
    arr: [2, 5, 1, 4, 9, 3],
    merge: (a, b) => Math.min(a, b),
    identity: Infinity,
    mergeLabel: "min",
    ops: [
      { type: "query", l: 0, r: 3 },
      { type: "query", l: 2, r: 5 },
      { type: "update", idx: 2, val: 8 },
      { type: "query", l: 0, r: 3 },
      { type: "query", l: 2, r: 5 },
    ],
  },
};

/* ═══ Build simulation steps ═══ */
function buildSteps(problem) {
  const { arr: INIT, merge, identity, mergeLabel, ops } = problem;
  const n = INIT.length;
  const sz = 4 * n;
  const steps = [];
  let tree = new Array(sz).fill(0);
  const arr = [...INIT];
  const finalized = new Set();

  const snap = () => ({ tree: [...tree], arr: [...arr] });
  const fmtVal = (v) => v === Infinity ? "∞" : v;

  /* — Collect tree structure for nodes — */
  function nodeRange(node, start, end) {
    const ranges = {};
    function walk(nd, s, e) {
      ranges[nd] = [s, e];
      if (s < e) {
        const m = (s + e) >> 1;
        walk(2 * nd, s, m);
        walk(2 * nd + 1, m + 1, e);
      }
    }
    walk(node, start, end);
    return ranges;
  }

  /* — BUILD PHASE — */
  steps.push({
    title: "Initialize — Empty Tree",
    detail: `arr = [${INIT.join(", ")}], n = ${n}. Allocate tree[4n]. Build bottom-up: leaves hold single elements, parents hold ${mergeLabel} of children. O(n) total.`,
    ...snap(), phase: "init", codeHL: [0, 1, 2, 3],
    highlighted: [], queryRange: null, decomp: null, result: null,
    finalized: new Set(finalized), opResults: [],
  });

  const buildOrder = [];
  function buildRec(nd, s, e) {
    if (s === e) {
      tree[nd] = arr[s];
      buildOrder.push({ nd, s, e, val: tree[nd], leaf: true });
      return;
    }
    const m = (s + e) >> 1;
    buildRec(2 * nd, s, m);
    buildRec(2 * nd + 1, m + 1, e);
    tree[nd] = merge(tree[2 * nd], tree[2 * nd + 1]);
    buildOrder.push({ nd, s, e, val: tree[nd], leaf: false });
  }
  buildRec(1, 0, n - 1);

  /* Show leaf steps grouped, then internal nodes up to root */
  const leaves = buildOrder.filter(b => b.leaf);
  steps.push({
    title: `Build Leaves — ${leaves.length} Elements Placed`,
    detail: `Each leaf node[i] = arr[j] for a single index j. Leaves: ${leaves.map(l => `node[${l.nd}]=${l.val}`).join(", ")}.`,
    ...snap(), phase: "build", codeHL: [2, 3, 4, 5],
    highlighted: leaves.map(l => l.nd), queryRange: null, decomp: null, result: null,
    finalized: new Set(finalized), opResults: [],
  });

  const internals = buildOrder.filter(b => !b.leaf).reverse();
  for (const b of internals) {
    steps.push({
      title: `Build node[${b.nd}] = ${mergeLabel}(${fmtVal(tree[2 * b.nd])}, ${fmtVal(tree[2 * b.nd + 1])}) = ${fmtVal(b.val)}  [${b.s}..${b.e}]`,
      detail: `Internal node covers range [${b.s},${b.e}]. Left child = ${fmtVal(tree[2 * b.nd])}, right child = ${fmtVal(tree[2 * b.nd + 1])}. ${mergeLabel} = ${fmtVal(b.val)}.`,
      ...snap(), phase: "build", codeHL: [6, 7, 8, 9],
      highlighted: [b.nd, 2 * b.nd, 2 * b.nd + 1], queryRange: null, decomp: null, result: null,
      finalized: new Set(finalized), opResults: [],
    });
  }

  steps.push({
    title: `✓ Build Complete — Root = ${fmtVal(tree[1])}`,
    detail: `Segment tree built in O(n). Root node[1] = ${fmtVal(tree[1])} (total ${mergeLabel}). Ready for queries and updates.`,
    ...snap(), phase: "ready", codeHL: [9],
    highlighted: [1], queryRange: null, decomp: null, result: null,
    finalized: new Set(finalized), opResults: [],
  });

  /* — OPERATIONS PHASE — */
  const opResults = [];

  for (let oi = 0; oi < ops.length; oi++) {
    const op = ops[oi];

    if (op.type === "query") {
      const decomp = [];
      function queryRec(nd, s, e, l, r) {
        if (r < s || e < l) return identity;
        if (l <= s && e <= r) {
          decomp.push({ nd, s, e, val: tree[nd] });
          return tree[nd];
        }
        const m = (s + e) >> 1;
        return merge(queryRec(2 * nd, s, m, l, r), queryRec(2 * nd + 1, m + 1, e, l, r));
      }
      const result = queryRec(1, 0, n - 1, op.l, op.r);
      opResults.push({ type: "query", l: op.l, r: op.r, result });
      finalized.add(`q${oi}`);

      steps.push({
        title: `Query ${mergeLabel}(${op.l}, ${op.r}) = ${fmtVal(result)}`,
        detail: `Decompose [${op.l},${op.r}] into ${decomp.length} node(s): ${decomp.map(d => `[${d.s},${d.e}]=${fmtVal(d.val)}`).join(" + ")}. ${mergeLabel} = ${fmtVal(result)}. O(log n).`,
        ...snap(), phase: "query", codeHL: [11, 12, 13, 14, 15, 16, 17, 18],
        highlighted: decomp.map(d => d.nd),
        queryRange: [op.l, op.r], decomp, result,
        finalized: new Set(finalized), opResults: [...opResults],
      });
    } else {
      const oldVal = arr[op.idx];
      arr[op.idx] = op.val;
      const updated = [];

      function updateRec(nd, s, e, idx, val) {
        if (idx < s || idx > e) return;
        if (s === e) { tree[nd] = val; updated.push(nd); return; }
        const m = (s + e) >> 1;
        updateRec(2 * nd, s, m, idx, val);
        updateRec(2 * nd + 1, m + 1, e, idx, val);
        tree[nd] = merge(tree[2 * nd], tree[2 * nd + 1]);
        updated.push(nd);
      }
      updateRec(1, 0, n - 1, op.idx, op.val);
      opResults.push({ type: "update", idx: op.idx, oldVal, newVal: op.val });
      finalized.add(`u${oi}`);

      steps.push({
        title: `Update arr[${op.idx}] = ${op.val} (was ${oldVal})`,
        detail: `Set arr[${op.idx}] from ${oldVal} to ${op.val}. Walk leaf→root updating ${updated.length} nodes: [${updated.join(",")}]. Each parent recomputes ${mergeLabel}. O(log n).`,
        ...snap(), phase: "update", codeHL: [20, 21, 22, 23, 24, 25, 26, 27, 28],
        highlighted: updated,
        queryRange: null, decomp: null, result: null,
        finalized: new Set(finalized), opResults: [...opResults],
      });
    }
  }

  steps.push({
    title: `✓ All Operations Complete`,
    detail: `${ops.length} operations executed. Build: O(n). Each query/update: O(log n). Total: O(n + k·log n) for k operations.`,
    ...snap(), phase: "done", codeHL: [29],
    highlighted: [], queryRange: null, decomp: null, result: null,
    finalized: new Set(finalized), opResults: [...opResults],
  });

  return steps;
}

/* ═══ Precompute expected outputs ═══ */
function computeExpected(problem) {
  const { arr: INIT, merge, identity, ops } = problem;
  const n = INIT.length;
  const tree = new Array(4 * n).fill(0);
  const arr = [...INIT];

  function buildR(nd, s, e) {
    if (s === e) { tree[nd] = arr[s]; return; }
    const m = (s + e) >> 1;
    buildR(2 * nd, s, m); buildR(2 * nd + 1, m + 1, e);
    tree[nd] = merge(tree[2 * nd], tree[2 * nd + 1]);
  }
  buildR(1, 0, n - 1);

  const results = [];
  for (const op of ops) {
    if (op.type === "query") {
      function qR(nd, s, e, l, r) {
        if (r < s || e < l) return identity;
        if (l <= s && e <= r) return tree[nd];
        const m = (s + e) >> 1;
        return merge(qR(2 * nd, s, m, l, r), qR(2 * nd + 1, m + 1, e, l, r));
      }
      results.push({ type: "query", l: op.l, r: op.r, result: qR(1, 0, n - 1, op.l, op.r) });
    } else {
      arr[op.idx] = op.val;
      function uR(nd, s, e, idx, val) {
        if (idx < s || idx > e) return;
        if (s === e) { tree[nd] = val; return; }
        const m = (s + e) >> 1;
        uR(2 * nd, s, m, idx, val); uR(2 * nd + 1, m + 1, e, idx, val);
        tree[nd] = merge(tree[2 * nd], tree[2 * nd + 1]);
      }
      uR(1, 0, n - 1, op.idx, op.val);
      results.push({ type: "update", idx: op.idx, val: op.val });
    }
  }
  return results;
}

/* ═══ Segment Tree SVG ═══ */
function SegTreeView({ step, n }) {
  const { tree, highlighted } = step;
  const hlSet = new Set(highlighted || []);

  const nodes = [];
  function collect(nd, s, e, depth) {
    if (nd >= tree.length) return;
    if (tree[nd] === 0 && s !== e && !hlSet.has(nd)) return;
    nodes.push({ id: nd, s, e, depth, val: tree[nd] });
    if (s < e) {
      const m = (s + e) >> 1;
      collect(2 * nd, s, m, depth + 1);
      collect(2 * nd + 1, m + 1, e, depth + 1);
    }
  }
  collect(1, 0, n - 1, 0);

  const maxDepth = Math.max(...nodes.map(nd => nd.depth), 0);
  const nodeR = 17, rowH = 50;
  const totalW = 440, totalH = (maxDepth + 1) * rowH + 24;

  const byDepth = {};
  nodes.forEach(nd => {
    if (!byDepth[nd.depth]) byDepth[nd.depth] = [];
    byDepth[nd.depth].push(nd);
  });

  const pos = {};
  Object.entries(byDepth).forEach(([d, nds]) => {
    const spacing = totalW / (nds.length + 1);
    nds.forEach((nd, i) => { pos[nd.id] = { x: spacing * (i + 1), y: Number(d) * rowH + 22 }; });
  });

  const fmtVal = (v) => v === Infinity ? "∞" : v;

  return (
    <svg viewBox={`0 0 ${totalW} ${Math.min(totalH, 250)}`} className="w-full" style={{ maxHeight: 220 }}>
      {nodes.filter(nd => nd.id > 1 && pos[nd.id] && pos[Math.floor(nd.id / 2)]).map(nd => {
        const parent = pos[Math.floor(nd.id / 2)];
        const child = pos[nd.id];
        const isHL = hlSet.has(nd.id) && hlSet.has(Math.floor(nd.id / 2));
        return (
          <line key={`e-${nd.id}`} x1={parent.x} y1={parent.y + nodeR} x2={child.x} y2={child.y - nodeR}
            stroke={isHL ? "#3b82f6" : "#3f3f46"} strokeWidth={isHL ? 2.5 : 1.2} />
        );
      })}
      {nodes.map(nd => {
        const p = pos[nd.id];
        if (!p) return null;
        const isHL = hlSet.has(nd.id);
        let fill = "#27272a", stroke = "#3f3f46";
        if (isHL && step.phase === "query") { fill = "#7c3aed"; stroke = "#8b5cf6"; }
        else if (isHL && step.phase === "update") { fill = "#b45309"; stroke = "#f59e0b"; }
        else if (isHL && step.phase === "build") { fill = "#1e3a5f"; stroke = "#3b82f6"; }
        else if (isHL) { fill = "#1e3a5f"; stroke = "#3b82f6"; }
        return (
          <g key={`n-${nd.id}`}>
            <circle cx={p.x} cy={p.y} r={nodeR} fill={fill} stroke={stroke} strokeWidth={isHL ? 2.5 : 1.5} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="central"
              fill={isHL ? "#fff" : "#a1a1aa"} fontSize="11" fontWeight="700" fontFamily="monospace">{fmtVal(nd.val)}</text>
            <text x={p.x} y={p.y + nodeR + 10} textAnchor="middle" fill="#52525b" fontSize="7" fontFamily="monospace">
              [{nd.s},{nd.e}]
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ═══ Python Code — line-ID mapped ═══ */
const CODE_SUM = [
  { id: 0,  text: `def build(node, start, end):` },
  { id: 1,  text: `    if start == end:` },
  { id: 2,  text: `        tree[node] = arr[start]` },
  { id: 3,  text: `        return` },
  { id: 4,  text: `    mid = (start + end) // 2` },
  { id: 5,  text: `    build(2*node, start, mid)` },
  { id: 6,  text: `    build(2*node+1, mid+1, end)` },
  { id: 7,  text: `    tree[node] = tree[2*node] + tree[2*node+1]` },
  { id: 8,  text: `` },
  { id: 9,  text: `    return tree` },
  { id: 10, text: `` },
  { id: 11, text: `def query(node, start, end, l, r):` },
  { id: 12, text: `    if r < start or end < l:` },
  { id: 13, text: `        return 0` },
  { id: 14, text: `    if l <= start and end <= r:` },
  { id: 15, text: `        return tree[node]` },
  { id: 16, text: `    mid = (start + end) // 2` },
  { id: 17, text: `    left = query(2*node, start, mid, l, r)` },
  { id: 18, text: `    return left + query(2*node+1, mid+1, end, l, r)` },
  { id: 19, text: `` },
  { id: 20, text: `def update(node, start, end, idx, val):` },
  { id: 21, text: `    if start == end:` },
  { id: 22, text: `        tree[node] = val` },
  { id: 23, text: `        return` },
  { id: 24, text: `    mid = (start + end) // 2` },
  { id: 25, text: `    if idx <= mid:` },
  { id: 26, text: `        update(2*node, start, mid, idx, val)` },
  { id: 27, text: `    else:` },
  { id: 28, text: `        update(2*node+1, mid+1, end, idx, val)` },
  { id: 29, text: `    tree[node] = tree[2*node] + tree[2*node+1]` },
];

const CODE_MIN = [
  { id: 0,  text: `def build(node, start, end):` },
  { id: 1,  text: `    if start == end:` },
  { id: 2,  text: `        tree[node] = arr[start]` },
  { id: 3,  text: `        return` },
  { id: 4,  text: `    mid = (start + end) // 2` },
  { id: 5,  text: `    build(2*node, start, mid)` },
  { id: 6,  text: `    build(2*node+1, mid+1, end)` },
  { id: 7,  text: `    tree[node] = min(tree[2*node], tree[2*node+1])` },
  { id: 8,  text: `` },
  { id: 9,  text: `    return tree` },
  { id: 10, text: `` },
  { id: 11, text: `def query(node, start, end, l, r):` },
  { id: 12, text: `    if r < start or end < l:` },
  { id: 13, text: `        return float('inf')` },
  { id: 14, text: `    if l <= start and end <= r:` },
  { id: 15, text: `        return tree[node]` },
  { id: 16, text: `    mid = (start + end) // 2` },
  { id: 17, text: `    left = query(2*node, start, mid, l, r)` },
  { id: 18, text: `    return min(left, query(2*node+1, mid+1, end, l, r))` },
  { id: 19, text: `` },
  { id: 20, text: `def update(node, start, end, idx, val):` },
  { id: 21, text: `    if start == end:` },
  { id: 22, text: `        tree[node] = val` },
  { id: 23, text: `        return` },
  { id: 24, text: `    mid = (start + end) // 2` },
  { id: 25, text: `    if idx <= mid:` },
  { id: 26, text: `        update(2*node, start, mid, idx, val)` },
  { id: 27, text: `    else:` },
  { id: 28, text: `        update(2*node+1, mid+1, end, idx, val)` },
  { id: 29, text: `    tree[node] = min(tree[2*node], tree[2*node+1])` },
];

const CODE_MAP = { rangeSum: CODE_SUM, rangeMin: CODE_MIN };

/* ═══ IO Panel ═══ */
function IOPanel({ step, problem, expected, pKey }) {
  const { phase, opResults, arr } = step;
  const done = phase === "done";
  const fmtVal = (v) => v === Infinity ? "∞" : v;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">arr</span> = <span className="text-zinc-300">[{problem.arr.join(", ")}]</span></div>
          <div><span className="text-zinc-500">ops</span> = [</div>
          {problem.ops.map((op, i) => (
            <div key={i} className="pl-4">
              <span className="text-zinc-300">
                {op.type === "query"
                  ? `${problem.mergeLabel}(${op.l}, ${op.r})`
                  : `update(${op.idx}, ${op.val})`}
                {i < problem.ops.length - 1 ? "," : ""}
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
          {expected.map((exp, i) => (
            <div key={i} className="text-zinc-300">
              {exp.type === "query"
                ? <span>{problem.mergeLabel}({exp.l},{exp.r}) = {fmtVal(exp.result)}</span>
                : <span className="text-zinc-500">update({exp.idx},{exp.val}) ✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-xs space-y-0.5">
          {expected.map((exp, i) => {
            const got = opResults[i];
            if (!got) return (
              <div key={i} className="text-zinc-600">
                {exp.type === "query" ? `${problem.mergeLabel}(${exp.l},${exp.r}) = ?` : `update(${exp.idx},${exp.val}) …`}
              </div>
            );
            if (got.type === "query") {
              const match = got.result === exp.result;
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <span className={match ? "text-emerald-300 font-bold" : "text-zinc-300"}>
                    {problem.mergeLabel}({got.l},{got.r}) = {fmtVal(got.result)}
                  </span>
                  {match && <span className="text-emerald-600 text-[9px]">✓</span>}
                </div>
              );
            }
            return (
              <div key={i} className="text-zinc-400">
                update({got.idx},{got.newVal}) <span className="text-emerald-600 text-[9px]">✓</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══ Code Panel ═══ */
function CodePanel({ highlightLines, pKey }) {
  const CODE = CODE_MAP[pKey];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {CODE.map((line) => {
          const hl = highlightLines.includes(line.id);
          return (
            <div
              key={`${line.id}-${line.text}`}
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

/* ═══ Navigation Bar ═══ */
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

/* ═══ Main Component ═══ */
export default function SegTreeViz() {
  const [pKey, setPKey] = useState("rangeSum");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];
  const steps = useMemo(() => buildSteps(problem), [pKey]);
  const expected = useMemo(() => computeExpected(problem), [pKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const switchP = (k) => { setPKey(k); setSi(0); };
  const n = problem.arr.length;
  const fmtVal = (v) => v === Infinity ? "∞" : v;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        {/* ═══ 1. Header ═══ */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Segment Tree</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Range Queries + Point Updates in O(log n)</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(PROBLEMS).map(([k, v]) => (
              <button key={k} onClick={() => switchP(k)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${pKey === k ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                {v.title}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ 2. Core Idea ═══ */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        {/* ═══ 3. Navigation ═══ */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 4. 3-Column Grid ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* — COL 1: IO + Tree Viz — */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} problem={problem} expected={expected} pKey={pKey} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">n={n} • {problem.mergeLabel} tree • node values = {problem.mergeLabel} of range</div>
              <SegTreeView step={step} n={n} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Build</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Query</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />Update</span>
              </div>
            </div>
          </div>

          {/* — COL 2: Steps + State — */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "query" ? "bg-purple-950/20 border-purple-900/50" :
              step.phase === "update" ? "bg-amber-950/20 border-amber-900/50" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "query" ? "bg-purple-900 text-purple-300" :
                  step.phase === "update" ? "bg-amber-900 text-amber-300" :
                  step.phase === "build" ? "bg-blue-900 text-blue-300" :
                  step.phase === "ready" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
                {step.result !== null && (
                  <span className="text-sm font-mono font-bold text-purple-300">= {fmtVal(step.result)}</span>
                )}
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Source Array */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                arr[] {step.queryRange ? `• query range [${step.queryRange[0]},${step.queryRange[1]}]` : ""}
              </div>
              <div className="flex gap-1.5 justify-center">
                {step.arr.map((v, i) => {
                  const inRange = step.queryRange && i >= step.queryRange[0] && i <= step.queryRange[1];
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                      <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                        inRange ? "bg-purple-950 border-purple-700 text-purple-200 scale-110" :
                        "bg-zinc-900 border-zinc-700 text-zinc-300"
                      }`}>{fmtVal(v)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Range Decomposition (query steps) */}
            {step.decomp && step.decomp.length > 0 && (
              <div className="bg-purple-950/20 border border-purple-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1.5">Range Decomposition</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {step.decomp.map((d, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-zinc-600">
                        {problem.mergeLabel === "sum" ? "+" : problem.mergeLabel}
                      </span>}
                      <span className="px-2 py-1 bg-purple-950 border border-purple-800 rounded-lg text-purple-300 font-mono text-[10px]">
                        [{d.s},{d.e}]={fmtVal(d.val)}
                      </span>
                    </span>
                  ))}
                  <span className="text-zinc-500">=</span>
                  <span className="text-lg font-bold font-mono text-purple-300">{fmtVal(step.result)}</span>
                </div>
              </div>
            )}

            {/* State summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div>
              <div className="flex gap-4">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-blue-400">{n}</div>
                  <div className="text-[9px] text-zinc-600">elements</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-purple-400">{fmtVal(step.tree[1])}</div>
                  <div className="text-[9px] text-zinc-600">root ({problem.mergeLabel})</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-amber-400">
                    {step.opResults.length}
                  </div>
                  <div className="text-[9px] text-zinc-600">ops done</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {problem.ops.length - step.opResults.length}
                  </div>
                  <div className="text-[9px] text-zinc-600">remaining</div>
                </div>
              </div>
            </div>

            {/* Completion card */}
            {step.phase === "done" && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Result</div>
                <div className="font-mono text-[11px] text-emerald-300">
                  All {problem.ops.length} operations complete. Final arr = [{step.arr.join(", ")}]. Root = {fmtVal(step.tree[1])}.
                </div>
              </div>
            )}
          </div>

          {/* — COL 3: Code — */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} pKey={pKey} />
          </div>

        </div>

        {/* ═══ 5. Bottom Row: When to Use + Classic Problems ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Mutable array + repeated range queries (sum, min, max, gcd)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Point update + range query — or range update + point query with lazy propagation</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Coordinate compression + counting (inversions, smaller-after-self)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Any associative operation where prefix sums aren't enough due to updates</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Build:</span> O(n)</div>
                <div><span className="text-zinc-500 font-semibold">Query / Update:</span> O(log n)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(4n)</div>
                <div><span className="text-zinc-500 font-semibold">Alternative:</span> BIT (Fenwick tree) for prefix sums — simpler but less general</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 307 — Range Sum Query Mutable</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 315 — Count of Smaller Numbers After Self</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 327 — Count of Range Sum</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 699 — Falling Squares</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 218 — The Skyline Problem</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 2286 — Booking Concert Tickets</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
