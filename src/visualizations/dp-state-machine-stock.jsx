import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   STATE MACHINE DP — Stock Trading with Cooldown (LC 309)
   3 States: HOLD · SOLD · COOL   •   5 Transitions
   ═══════════════════════════════════════════════════════════════ */

/* ─── Problem Input ─── */
const PRICES = [1, 2, 3, 0, 2, 4, 1];

/* ─── Expected Output (precomputed) ─── */
const EXPECTED_PROFIT = 5;
const EXPECTED_HOLD = [-1, -1, -1, 1, 1, 1, 2];
const EXPECTED_SOLD = [-Infinity, 1, 2, -1, 3, 5, 2];
const EXPECTED_COOL = [0, 0, 1, 2, 2, 3, 5];
const EXPECTED_ACTIONS = ["buy", "wait", "sell", "buy", "wait", "sell", "wait"];

/* ─── Python Code (clean function with line IDs) ─── */
const CODE = [
  { id: 1,  text: `def max_profit_cooldown(prices):` },
  { id: 2,  text: `    n = len(prices)` },
  { id: 3,  text: `    hold = [0]*n  # holding stock` },
  { id: 4,  text: `    sold = [0]*n  # just sold` },
  { id: 5,  text: `    cool = [0]*n  # cooldown / idle` },
  { id: 6,  text: `` },
  { id: 7,  text: `    hold[0] = -prices[0]` },
  { id: 8,  text: `    sold[0] = float('-inf')` },
  { id: 9,  text: `    cool[0] = 0` },
  { id: 10, text: `` },
  { id: 11, text: `    for i in range(1, n):` },
  { id: 12, text: `        hold[i] = max(hold[i-1],` },
  { id: 13, text: `                      cool[i-1] - prices[i])` },
  { id: 14, text: `        sold[i] = hold[i-1] + prices[i]` },
  { id: 15, text: `        cool[i] = max(cool[i-1], sold[i-1])` },
  { id: 16, text: `` },
  { id: 17, text: `    return max(sold[-1], cool[-1])` },
];

/* ═══════════════════════════════════════════════════════════════
   BUILD SIMULATION STEPS
   ═══════════════════════════════════════════════════════════════ */
function buildSteps() {
  const n = PRICES.length;
  const hold = new Array(n).fill(null);
  const sold = new Array(n).fill(null);
  const cool = new Array(n).fill(null);
  const actions = new Array(n).fill(null);
  const steps = [];
  const finalized = new Set();

  const snap = (arr) => [...arr];

  // Step 0: Define state machine
  steps.push({
    title: "Define the State Machine",
    detail: `Three states per day: HOLD (have stock — can sell or wait), SOLD (just sold — must cooldown next), COOL (no stock — can buy or wait). Each arrow is a transition equation. Draw the machine first, then the code writes itself.`,
    hold: snap(hold), sold: snap(sold), cool: snap(cool),
    current: -1, phase: "init", codeHL: [1, 2, 3, 4, 5],
    actions: snap(actions), transition: null,
    finalized: new Set(finalized), activeState: null, activeTransition: null,
  });

  // Step 1: Base case day 0
  hold[0] = -PRICES[0];
  sold[0] = -Infinity;
  cool[0] = 0;
  actions[0] = "buy";
  finalized.add(0);

  steps.push({
    title: `Day 0 (price=$${PRICES[0]}): Base Case`,
    detail: `HOLD[0] = −${PRICES[0]} (buy on day 0). SOLD[0] = −∞ (can't have sold yet). COOL[0] = 0 (do nothing). Only one meaningful action: buy.`,
    hold: snap(hold), sold: snap(sold), cool: snap(cool),
    current: 0, phase: "base", codeHL: [7, 8, 9],
    actions: snap(actions), transition: null,
    finalized: new Set(finalized), activeState: "all", activeTransition: null,
  });

  // Fill day by day
  for (let i = 1; i < n; i++) {
    const price = PRICES[i];

    const newHold = Math.max(hold[i - 1], cool[i - 1] - price);
    const newSold = hold[i - 1] + price;
    const newCool = Math.max(cool[i - 1], sold[i - 1] === null ? -Infinity : sold[i - 1]);

    const holdAction = newHold === hold[i - 1] ? "keep" : "buy";
    const coolAction = newCool === (sold[i - 1] === null ? -Infinity : sold[i - 1]) ? "cooldown" : "wait";

    // Step: HOLD decision
    steps.push({
      title: `Day ${i} ($${price}): HOLD — Keep or Buy?`,
      detail: `Keep holding: hold[${i-1}] = ${hold[i-1]}. Buy from cool: cool[${i-1}] − ${price} = ${cool[i-1]} − ${price} = ${cool[i-1] - price}. Best: ${newHold} → ${holdAction}.`,
      hold: snap(hold), sold: snap(sold), cool: snap(cool),
      current: i, phase: "decide", codeHL: [12, 13],
      actions: snap(actions),
      transition: {
        state: "hold", label: "HOLD",
        options: [
          { label: "Keep holding (hold→hold)", val: hold[i - 1], best: holdAction === "keep", arrow: "hold→hold" },
          { label: `Buy (cool→hold, −$${price})`, val: cool[i - 1] - price, best: holdAction === "buy", arrow: "cool→hold" },
        ],
      },
      finalized: new Set(finalized),
      activeState: "hold",
      activeTransition: holdAction === "keep" ? "hold-hold" : "cool-hold",
    });

    // Step: SOLD computation
    steps.push({
      title: `Day ${i} ($${price}): SOLD — Sell Today`,
      detail: `Sell stock held yesterday: hold[${i-1}] + ${price} = ${hold[i-1]} + ${price} = ${newSold}. Only one incoming transition: hold→sold.`,
      hold: snap(hold), sold: snap(sold), cool: snap(cool),
      current: i, phase: "decide", codeHL: [14],
      actions: snap(actions),
      transition: {
        state: "sold", label: "SOLD",
        options: [
          { label: `Sell (hold→sold, +$${price})`, val: newSold, best: true, arrow: "hold→sold" },
        ],
      },
      finalized: new Set(finalized),
      activeState: "sold",
      activeTransition: "hold-sold",
    });

    // Step: COOL computation
    const prevSold = sold[i - 1] === null ? -Infinity : sold[i - 1];
    steps.push({
      title: `Day ${i} ($${price}): COOL — Wait or Cooldown?`,
      detail: `Stay cool: cool[${i-1}] = ${cool[i-1]}. From sold (mandatory cooldown): sold[${i-1}] = ${prevSold === -Infinity ? "−∞" : prevSold}. Best: ${newCool} → ${coolAction}.`,
      hold: snap(hold), sold: snap(sold), cool: snap(cool),
      current: i, phase: "decide", codeHL: [15],
      actions: snap(actions),
      transition: {
        state: "cool", label: "COOL",
        options: [
          { label: "Stay idle (cool→cool)", val: cool[i - 1], best: coolAction === "wait", arrow: "cool→cool" },
          { label: "Cooldown (sold→cool)", val: prevSold, best: coolAction === "cooldown", arrow: "sold→cool" },
        ],
      },
      finalized: new Set(finalized),
      activeState: "cool",
      activeTransition: coolAction === "wait" ? "cool-cool" : "sold-cool",
    });

    // Commit values
    hold[i] = newHold;
    sold[i] = newSold;
    cool[i] = newCool;

    // Determine display action
    if (holdAction === "buy") actions[i] = "buy";
    else if (newSold >= newHold && newSold >= newCool && newSold > 0) actions[i] = "sell";
    else actions[i] = "wait";

    finalized.add(i);

    // Step: Day summary
    steps.push({
      title: `Day ${i}: All States Committed`,
      detail: `HOLD[${i}]=${hold[i]}, SOLD[${i}]=${sold[i]}, COOL[${i}]=${cool[i]}. Action: ${actions[i].toUpperCase()}. ${n - 1 - i} day${n - 1 - i !== 1 ? "s" : ""} remaining.`,
      hold: snap(hold), sold: snap(sold), cool: snap(cool),
      current: i, phase: "fill", codeHL: [11, 12, 13, 14, 15],
      actions: snap(actions), transition: null,
      finalized: new Set(finalized),
      activeState: null, activeTransition: null,
    });
  }

  // Final result
  const result = Math.max(sold[n - 1], cool[n - 1]);
  steps.push({
    title: `✓ Max Profit = $${result}`,
    detail: `max(SOLD[${n-1}], COOL[${n-1}]) = max(${sold[n-1]}, ${cool[n-1]}) = ${result}. Can't end in HOLD state (still holding stock = unrealized). The state machine made all transitions explicit — no ad-hoc if/else chains needed.`,
    hold: snap(hold), sold: snap(sold), cool: snap(cool),
    current: -1, phase: "done", codeHL: [17],
    actions: snap(actions), transition: null,
    finalized: new Set(finalized),
    activeState: null, activeTransition: null,
  });

  return steps;
}

/* ═══════════════════════════════════════════════════════════════
   STATE DIAGRAM SVG
   ═══════════════════════════════════════════════════════════════ */
function StateDiagram({ step }) {
  const { activeState, activeTransition } = step;

  const states = [
    { id: "cool", x: 90,  y: 55,  label: "COOL",  color: "#3b82f6", desc: "idle" },
    { id: "hold", x: 310, y: 55,  label: "HOLD",  color: "#f59e0b", desc: "has stock" },
    { id: "sold", x: 200, y: 185, label: "SOLD",  color: "#10b981", desc: "just sold" },
  ];

  const transitions = [
    { id: "cool-hold", from: "cool", to: "hold", label: "buy (−p)", dx: 0, dy: -18 },
    { id: "hold-sold", from: "hold", to: "sold", label: "sell (+p)", dx: 16, dy: 0 },
    { id: "sold-cool", from: "sold", to: "cool", label: "cooldown", dx: -16, dy: 0 },
    { id: "cool-cool", from: "cool", to: "cool", label: "wait", self: true },
    { id: "hold-hold", from: "hold", to: "hold", label: "wait", self: true },
  ];

  return (
    <svg viewBox="0 0 400 230" className="w-full" style={{ maxHeight: 190 }}>
      {/* Edges */}
      {transitions.map((t) => {
        const from = states.find(s => s.id === t.from);
        const to = states.find(s => s.id === t.to);
        const isActive = activeTransition === t.id;
        const edgeColor = isActive ? "#f59e0b" : "#52525b";
        const textColor = isActive ? "#fbbf24" : "#71717a";
        const sw = isActive ? 2.5 : 1.5;

        if (t.self) {
          const cx = from.x, cy = from.y - 44;
          return (
            <g key={t.id}>
              <path d={`M${from.x-16},${from.y-24} C${cx-32},${cy-12} ${cx+32},${cy-12} ${from.x+16},${from.y-24}`}
                fill="none" stroke={edgeColor} strokeWidth={sw} />
              <text x={cx} y={cy - 16} textAnchor="middle" fill={textColor} fontSize="8" fontWeight={isActive ? "700" : "400"}>{t.label}</text>
            </g>
          );
        }

        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        const r = 26;
        const sx = from.x + (dx/len)*r, sy = from.y + (dy/len)*r;
        const ex = to.x - (dx/len)*r, ey = to.y - (dy/len)*r;
        const mx = (sx+ex)/2 + (t.dx || 0), my = (sy+ey)/2 + (t.dy || 0);

        return (
          <g key={t.id}>
            <defs>
              <marker id={`sm-${t.id}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={edgeColor} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={edgeColor} strokeWidth={sw} markerEnd={`url(#sm-${t.id})`} />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central"
              fill={textColor} fontSize="8" fontWeight={isActive ? "700" : "400"}>{t.label}</text>
          </g>
        );
      })}
      {/* Nodes */}
      {states.map(s => {
        const isActive = activeState === s.id || activeState === "all";
        return (
          <g key={s.id}>
            <circle cx={s.x} cy={s.y} r={25}
              fill={isActive ? s.color + "30" : s.color + "15"}
              stroke={s.color}
              strokeWidth={isActive ? 3 : 2}
              className="transition-all" />
            <text x={s.x} y={s.y - 3} textAnchor="middle" dominantBaseline="central"
              fill={s.color} fontSize="11" fontWeight="700">{s.label}</text>
            <text x={s.x} y={s.y + 11} textAnchor="middle"
              fill={s.color + "80"} fontSize="7">{s.desc}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRICE CHART SVG
   ═══════════════════════════════════════════════════════════════ */
function PriceChart({ step }) {
  const { current, actions } = step;
  const maxP = Math.max(...PRICES);
  const n = PRICES.length;
  const cw = 48, h = 80, pad = 24;

  return (
    <svg viewBox={`0 0 ${n * cw + pad + 10} ${h + 42}`} className="w-full" style={{ maxHeight: 110 }}>
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map(p => {
        const y = h - (p / maxP) * (h - 10);
        return <line key={p} x1={pad - 5} y1={y} x2={n * cw + pad} y2={y} stroke="#27272a" strokeWidth={0.5} />;
      })}
      {/* Price line */}
      {PRICES.map((p, i) => {
        if (i === 0) return null;
        const x1 = pad + (i-1) * cw + cw/2, y1 = h - (PRICES[i-1] / maxP) * (h - 10);
        const x2 = pad + i * cw + cw/2, y2 = h - (p / maxP) * (h - 10);
        return <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#52525b" strokeWidth={1.5} />;
      })}
      {/* Points + labels */}
      {PRICES.map((p, i) => {
        const x = pad + i * cw + cw/2, y = h - (p / maxP) * (h - 10);
        const isCurr = current === i;
        const action = actions[i];
        const fill = isCurr ? "#60a5fa" : action === "buy" ? "#f59e0b" : action === "sell" ? "#10b981" : "#52525b";
        const r = isCurr ? 7 : action === "buy" || action === "sell" ? 6 : 4;
        return (
          <g key={`p${i}`}>
            {isCurr && <circle cx={x} cy={y} r={12} fill="none" stroke="#3b82f680" strokeWidth={2} />}
            <circle cx={x} cy={y} r={r} fill={fill} />
            <text x={x} y={y - 13} textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="700" fontFamily="monospace">${p}</text>
            <text x={x} y={h + 14} textAnchor="middle" fill="#52525b" fontSize="8" fontFamily="monospace">d{i}</text>
            {action && action !== "wait" && (
              <text x={x} y={h + 28} textAnchor="middle"
                fill={action === "buy" ? "#f59e0b" : "#10b981"}
                fontSize="7" fontWeight="700">
                {action.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   IO PANEL
   ═══════════════════════════════════════════════════════════════ */
function IOPanel({ step }) {
  const done = step.phase === "done";
  const n = PRICES.length;
  const curProfit = (() => {
    const s = step.sold[n - 1];
    const c = step.cool[n - 1];
    if (s === null && c === null) return "?";
    return Math.max(s === null ? -Infinity : s, c === null ? -Infinity : c);
  })();
  const allMatch = done && curProfit === EXPECTED_PROFIT;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">prices</span> = <span className="text-zinc-300">[{PRICES.join(", ")}]</span></div>
          <div><span className="text-zinc-500">rule  </span> = <span className="text-zinc-600">1-day cooldown after sell</span></div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">max_profit</span> = <span className="text-zinc-300">{EXPECTED_PROFIT}</span>
          <span className="text-zinc-600 text-[10px] ml-2">(buy@0, sell@2, buy@3, sell@5)</span>
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">profit</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>
            {curProfit === "?" ? "?" : curProfit <= -Infinity ? "?" : curProfit}
          </span>
        </div>

        {/* Compact state preview */}
        <div className="mt-2 space-y-1">
          {[
            { name: "hold", data: step.hold, color: "text-amber-400", expected: EXPECTED_HOLD },
            { name: "sold", data: step.sold, color: "text-emerald-400", expected: EXPECTED_SOLD },
            { name: "cool", data: step.cool, color: "text-blue-400", expected: EXPECTED_COOL },
          ].map(({ name, data, color, expected }) => (
            <div key={name} className="flex items-center gap-1 text-[10px] font-mono">
              <span className={`w-8 ${color}`}>{name}</span>
              <span className="text-zinc-600">[</span>
              {data.map((v, i) => {
                const isFin = step.finalized.has(i);
                const val = v === null ? "?" : v === -Infinity ? "−∞" : v;
                const matches = isFin && v === expected[i];
                return (
                  <span key={i} className="flex items-center">
                    <span className={matches ? "text-emerald-400" : isFin ? "text-zinc-300" : "text-zinc-700"}>{val}</span>
                    {i < data.length - 1 && <span className="text-zinc-700">,</span>}
                  </span>
                );
              })}
              <span className="text-zinc-600">]</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATE ARRAYS PANEL
   ═══════════════════════════════════════════════════════════════ */
function StateArrays({ step }) {
  const configs = [
    { name: "hold[]", data: step.hold, bg: "bg-amber-950", border: "border-amber-700", text: "text-amber-200", label: "text-amber-500" },
    { name: "sold[]", data: step.sold, bg: "bg-emerald-950", border: "border-emerald-700", text: "text-emerald-200", label: "text-emerald-500" },
    { name: "cool[]", data: step.cool, bg: "bg-blue-950", border: "border-blue-700", text: "text-blue-200", label: "text-blue-500" },
  ];

  return (
    <div className="space-y-2">
      {configs.map(({ name, data, bg, border, text, label }) => (
        <div key={name}>
          <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${label}`}>{name}</div>
          <div className="flex gap-1.5">
            {data.map((d, i) => {
              const isCurr = step.current === i;
              const isFin = step.finalized.has(i);
              const val = d === null ? "—" : d === -Infinity ? "−∞" : d;
              return (
                <div key={i} className={`w-11 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                  d === null ? "bg-zinc-900 border-zinc-800 text-zinc-700" :
                  d === -Infinity ? "bg-zinc-900 border-zinc-800 text-zinc-700" :
                  isCurr ? `${bg} ${border} ${text} scale-105` :
                  isFin ? `bg-zinc-900 border-zinc-700 text-zinc-300` :
                  "bg-zinc-900 border-zinc-800 text-zinc-600"
                }`}>{val}</div>
              );
            })}
          </div>
        </div>
      ))}
      {/* Day labels */}
      <div className="flex gap-1.5 mt-0.5">
        {PRICES.map((_, i) => (
          <div key={i} className={`w-11 text-center text-[9px] font-mono ${step.current === i ? "text-blue-400" : "text-zinc-700"}`}>d{i}</div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DECISION PANEL
   ═══════════════════════════════════════════════════════════════ */
function DecisionPanel({ transition }) {
  if (!transition) return null;
  const stateColors = { hold: "amber", sold: "emerald", cool: "blue" };
  const c = stateColors[transition.state] || "zinc";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 text-${c}-400`}>
        {transition.label} Decision
      </div>
      <div className="space-y-1.5">
        {transition.options.map((opt, i) => (
          <div key={i} className={`flex items-center justify-between px-2.5 py-2 rounded-xl border transition-all ${
            opt.best ? `bg-${c}-950/50 border-${c}-800` : "border-zinc-800/50"
          }`}>
            <span className={`text-xs ${opt.best ? `text-${c}-300` : "text-zinc-500"}`}>{opt.label}</span>
            <span className={`font-mono font-bold text-sm ${opt.best ? `text-${c}-300` : "text-zinc-600"}`}>
              {opt.val === -Infinity ? "−∞" : opt.val}
            </span>
            {opt.best && <span className={`text-${c}-500 text-xs ml-1`}>★</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CODE PANEL
   ═══════════════════════════════════════════════════════════════ */
function CodePanel({ highlightLines }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {CODE.map((line) => {
          const hl = highlightLines.includes(line.id);
          return (
            <div key={line.id}
              className={`px-2 rounded-sm ${hl ? "bg-blue-500/15 text-blue-300" : line.text === "" ? "" : "text-zinc-500"}`}>
              <span className="inline-block w-5 text-right mr-3 text-zinc-700 select-none" style={{ userSelect: "none" }}>
                {line.text !== "" ? line.id : ""}
              </span>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION BAR
   ═══════════════════════════════════════════════════════════════ */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">
        ← Prev
      </button>
      <div className="flex gap-1.5 items-center">
        {total <= 25
          ? Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => setSi(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === si ? "bg-blue-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`} />
            ))
          : <>
              <button onClick={() => setSi(0)} className={`px-2 py-0.5 text-xs rounded ${si === 0 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>1</button>
              <input type="range" min={0} max={total - 1} value={si} onChange={e => setSi(Number(e.target.value))} className="w-32 accent-blue-500" />
              <button onClick={() => setSi(total - 1)} className={`px-2 py-0.5 text-xs rounded ${si >= total - 1 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>{total}</button>
            </>
        }
      </div>
      <button onClick={() => setSi(Math.min(total - 1, si + 1))} disabled={si >= total - 1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">
        Next →
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function StateMachineDPViz() {
  const steps = useMemo(() => buildSteps(), []);
  const [si, setSi] = useState(0);
  const step = steps[si];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        {/* ═══ 1. Header ═══ */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold tracking-tight">State Machine DP</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Stock Trading with Cooldown • HOLD / SOLD / COOL • LC 309</p>
        </div>

        {/* ═══ 2. Core Idea ═══ */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            Model each day as a state in a finite state machine. Three states: <strong className="text-amber-400">HOLD</strong> (have stock),
            <strong className="text-emerald-400"> SOLD</strong> (just sold, must cool), <strong className="text-blue-400"> COOL</strong> (idle, can buy).
            Each arrow is a transition equation. Draw the machine → write one line per arrow → done.
            No need to track complex buy/sell sequences — the states encode everything.
          </p>
        </div>

        {/* ═══ 3. Navigation ═══ */}
        <div className="mb-3">
          <NavBar si={si} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 4. 3-Column Grid ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + State Diagram + Price Chart ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">State Machine • active transition highlighted</div>
              <StateDiagram step={step} />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">Prices [{PRICES.join(",")}] • BUY/SELL marked</div>
              <PriceChart step={step} />
            </div>
          </div>

          {/* ── COL 2: Steps + State Arrays + Decision ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {si + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "decide" ? "bg-amber-900 text-amber-300" :
                  step.phase === "fill" ? "bg-blue-900 text-blue-300" :
                  step.phase === "base" ? "bg-zinc-700 text-zinc-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
                {step.activeState && step.activeState !== "all" && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    step.activeState === "hold" ? "bg-amber-900/50 text-amber-300" :
                    step.activeState === "sold" ? "bg-emerald-900/50 text-emerald-300" :
                    "bg-blue-900/50 text-blue-300"
                  }`}>{step.activeState.toUpperCase()}</span>
                )}
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* State arrays */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State Arrays</div>
              <StateArrays step={step} />
            </div>

            {/* Decision panel */}
            <DecisionPanel transition={step.transition} />

            {/* Completion */}
            {step.phase === "done" && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Result</div>
                <div className="font-mono text-[11px] text-emerald-300">
                  Max profit: ${EXPECTED_PROFIT}. Transactions: buy@d0($1) → sell@d2($3) → cool@d2 → buy@d3($0) → sell@d5($4). Net: (3−1) + (4−0) = $5.
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} />
          </div>
        </div>

        {/* ═══ 5. Bottom Row: When to Use + Classic Problems ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>DP with discrete modes/states: buy/sell/cool, paint colors, hold/release</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Constraints that force state transitions (cooldown, fees, transaction limits)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>When the brute-force involves complex if/else chains — draw the machine instead</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Any sequential decision where "what you can do next" depends on "what you just did"</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(n × S) where S = number of states</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(S) with rolling variables</div>
                <div><span className="text-zinc-500 font-semibold">Key trick:</span> Draw states + transitions first → code = one line per arrow</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 309 — Stock with Cooldown</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 714 — Stock with Transaction Fee</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 123 — Best Time Stock III (2 txns)</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 188 — Best Time Stock IV (k txns)</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 256 — Paint House</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 276 — Paint Fence</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 801 — Min Swaps Increasing</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1186 — Max Subarray w/ One Delete</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
