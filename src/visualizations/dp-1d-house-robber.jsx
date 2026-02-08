import { useState, useMemo } from "react";

/* ——— Problem Configs ——— */
const PROBLEMS = {
  robber: {
    title: "House Robber",
    subtitle: "dp[i] = max(dp[i-1], dp[i-2] + nums[i])",
    coreIdea: "At each house, you choose: skip it (keep dp[i-1]) or rob it (add its value to the best from two houses back, dp[i-2] + nums[i]). This \"take-or-skip\" recurrence is the foundation of 1D DP — it appears in Climbing Stairs, Decode Ways, and any problem where each decision only depends on a fixed window of previous states.",
    nums: [2, 7, 9, 3, 1, 6, 4],
    expectedDp: [2, 7, 11, 11, 12, 17, 18],
    expectedResult: 18,
    expectedDetail: [0, 2, 5, 6],
    code: [
      { id: 0,  text: `def rob(nums):` },
      { id: 1,  text: `    n = len(nums)` },
      { id: 2,  text: `    if n == 0: return 0` },
      { id: 3,  text: `` },
      { id: 4,  text: `    dp = [0] * n` },
      { id: 5,  text: `    dp[0] = nums[0]` },
      { id: 6,  text: `    dp[1] = max(nums[0], nums[1])` },
      { id: 7,  text: `` },
      { id: 8,  text: `    for i in range(2, n):` },
      { id: 9,  text: `        skip = dp[i - 1]` },
      { id: 10, text: `        take = dp[i - 2] + nums[i]` },
      { id: 11, text: `        dp[i] = max(skip, take)` },
      { id: 12, text: `` },
      { id: 13, text: `    return dp[n - 1]` },
    ],
    whenToUse: [
      "Maximize/minimize over a linear sequence with adjacent constraints",
      "dp[i] depends on a fixed-size window of previous states (i-1, i-2, …)",
      "Take-or-skip decisions at each element (rob, climb, decode)",
      "Can be space-optimized to O(1) when only prev1/prev2 needed",
    ],
    complexity: { time: "O(n) — single pass", space: "O(n) → O(1) optimized", note: "prev2, prev1 = prev1, max(prev1, prev2+x)" },
    classics: [
      { name: "LC 70 — Climbing Stairs", diff: "Easy" },
      { name: "LC 198 — House Robber", diff: "Medium" },
      { name: "LC 213 — House Robber II (circular)", diff: "Medium" },
      { name: "LC 91 — Decode Ways", diff: "Medium" },
      { name: "LC 139 — Word Break", diff: "Medium" },
      { name: "LC 322 — Coin Change", diff: "Medium" },
      { name: "LC 300 — Longest Increasing Subseq", diff: "Medium" },
    ],
  },
  coin: {
    title: "Coin Change",
    subtitle: "dp[i] = min(dp[i - c] + 1) for each coin c",
    coreIdea: "For each amount i, try every coin c: if using coin c, you need dp[i-c] + 1 coins total. Take the minimum across all coins. This bottom-up approach builds from amount 0 upward, guaranteeing each subproblem is solved before it's needed. The classic unbounded knapsack variant — each coin can be reused.",
    coins: [1, 3, 4],
    amount: 6,
    expectedDp: [0, 1, 2, 1, 1, 2, 2],
    expectedResult: 2,
    expectedDetail: [3, 3],
    code: [
      { id: 0,  text: `def coinChange(coins, amount):` },
      { id: 1,  text: `    dp = [float('inf')] * (amount + 1)` },
      { id: 2,  text: `` },
      { id: 3,  text: `    # base case` },
      { id: 4,  text: `    dp[0] = 0` },
      { id: 5,  text: `` },
      { id: 6,  text: `    for i in range(1, amount + 1):` },
      { id: 7,  text: `        for c in coins:` },
      { id: 8,  text: `            if i >= c and dp[i-c] + 1 < dp[i]:` },
      { id: 9,  text: `                dp[i] = dp[i-c] + 1` },
      { id: 10, text: `` },
      { id: 11, text: `    return dp[amount] if dp[amount] != float('inf') else -1` },
    ],
    whenToUse: [
      "Minimum/maximum using unlimited supply of items (unbounded knapsack)",
      "Target sum reachable by combining values from a set",
      "dp[i] depends on dp[i - c] for each option c (multi-choice per state)",
      "\"Fewest steps to reach target\" — BFS on values or DP on amounts",
    ],
    complexity: { time: "O(amount × len(coins))", space: "O(amount)", note: "Count ways → dp[i] += dp[i-c] instead of min" },
    classics: [
      { name: "LC 322 — Coin Change", diff: "Medium" },
      { name: "LC 518 — Coin Change II (count ways)", diff: "Medium" },
      { name: "LC 279 — Perfect Squares", diff: "Medium" },
      { name: "LC 377 — Combination Sum IV", diff: "Medium" },
      { name: "LC 983 — Minimum Cost for Tickets", diff: "Medium" },
      { name: "LC 1449 — Largest Number (cost)", diff: "Hard" },
    ],
  },
};

/* ——— Build steps: House Robber ——— */
function buildRobberSteps(prob) {
  const { nums } = prob;
  const n = nums.length;
  const dp = new Array(n).fill(null);
  const steps = [];
  const choices = new Array(n).fill(null);
  const finalized = new Set();

  steps.push({
    title: "Initialize — Define Recurrence",
    detail: `nums = [${nums.join(", ")}]. dp[i] = max money from houses 0..i. Recurrence: dp[i] = max(dp[i-1], dp[i-2] + nums[i]).`,
    dp: [...dp], choices: [...choices], current: -1, phase: "init", codeHL: [0, 1, 2],
    prev1: null, prev2: null, comparing: null, finalized: new Set(finalized),
    changedIdx: null,
  });

  dp[0] = nums[0];
  choices[0] = "rob";
  finalized.add(0);
  steps.push({
    title: `Base Case: dp[0] = nums[0] = ${nums[0]}`,
    detail: `Only one house — rob it. dp[0] = ${nums[0]}.`,
    dp: [...dp], choices: [...choices], current: 0, phase: "base", codeHL: [4, 5],
    prev1: null, prev2: null, comparing: null, finalized: new Set(finalized),
    changedIdx: 0,
  });

  dp[1] = Math.max(nums[0], nums[1]);
  choices[1] = dp[1] === nums[1] ? "rob" : "skip";
  finalized.add(1);
  steps.push({
    title: `Base Case: dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}`,
    detail: `Two houses — rob the more valuable. ${dp[1] === nums[1] ? `Rob house 1 (${nums[1]}).` : `Rob house 0 (${nums[0]}), skip house 1.`}`,
    dp: [...dp], choices: [...choices], current: 1, phase: "base", codeHL: [6],
    prev1: null, prev2: null, comparing: null, finalized: new Set(finalized),
    changedIdx: 1,
  });

  for (let i = 2; i < n; i++) {
    const skipVal = dp[i - 1];
    const robVal = dp[i - 2] + nums[i];

    steps.push({
      title: `House ${i}: Skip (${skipVal}) vs Rob (${robVal})?`,
      detail: `Skip: dp[${i - 1}] = ${skipVal}. Rob: dp[${i - 2}] + nums[${i}] = ${dp[i - 2]} + ${nums[i]} = ${robVal}.`,
      dp: [...dp], choices: [...choices], current: i, phase: "compare", codeHL: [9, 10],
      prev1: i - 1, prev2: i - 2, comparing: { skip: skipVal, rob: robVal },
      finalized: new Set(finalized), changedIdx: null,
    });

    const prevDp = [...dp];
    dp[i] = Math.max(skipVal, robVal);
    choices[i] = robVal > skipVal ? "rob" : "skip";
    finalized.add(i);

    steps.push({
      title: `dp[${i}] = ${dp[i]} → ${choices[i] === "rob" ? "Rob 💰" : "Skip"}`,
      detail: `${robVal > skipVal ? `Rob wins: ${robVal} > ${skipVal}` : robVal === skipVal ? `Equal — skip: ${skipVal}` : `Skip wins: ${skipVal} > ${robVal}`}. dp[${i}] = ${dp[i]}.`,
      dp: [...dp], choices: [...choices], current: i, phase: "fill", codeHL: [11],
      prev1: i - 1, prev2: i - 2, comparing: null,
      finalized: new Set(finalized), changedIdx: i, prevDp,
    });
  }

  const robbed = [];
  let i = n - 1;
  while (i >= 0) {
    if (choices[i] === "rob") { robbed.push(i); i -= 2; }
    else i--;
  }
  robbed.reverse();

  steps.push({
    title: `✓ Complete — Maximum = ${dp[n - 1]}`,
    detail: `Robbed houses: [${robbed.map(i => `${i}(=${nums[i]})`).join(", ")}]. Total = ${robbed.reduce((s, i) => s + nums[i], 0)}.`,
    dp: [...dp], choices: [...choices], current: -1, phase: "done", codeHL: [13],
    prev1: null, prev2: null, comparing: null,
    finalized: new Set(finalized), changedIdx: null, robbed,
  });

  return steps;
}

/* ——— Build steps: Coin Change ——— */
function buildCoinSteps(prob) {
  const { coins, amount } = prob;
  const INF = Infinity;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  const usedCoin = new Array(amount + 1).fill(-1);
  const steps = [];
  const finalized = new Set();

  steps.push({
    title: "Initialize — dp[0] = 0, rest = ∞",
    detail: `coins = [${coins.join(", ")}], amount = ${amount}. dp[i] = min coins to make amount i.`,
    dp: [...dp], current: -1, phase: "init", codeHL: [0, 1, 4],
    tryCoin: null, tryResult: null, bestCoin: null,
    finalized: new Set(finalized), changedIdx: null, usedCoin: [...usedCoin],
  });

  finalized.add(0);
  steps.push({
    title: "Base Case: dp[0] = 0",
    detail: `0 coins needed to make amount 0. Starting point for bottom-up fill.`,
    dp: [...dp], current: 0, phase: "base", codeHL: [3, 4],
    tryCoin: null, tryResult: null, bestCoin: null,
    finalized: new Set(finalized), changedIdx: 0, usedCoin: [...usedCoin],
  });

  for (let i = 1; i <= amount; i++) {
    const attempts = [];
    for (const c of coins) {
      if (i - c >= 0) {
        const val = dp[i - c] === INF ? INF : dp[i - c] + 1;
        attempts.push({ coin: c, from: i - c, fromVal: dp[i - c], result: val });
      }
    }

    const bestAttempt = attempts.reduce((best, a) => a.result < best.result ? a : best, { result: INF });
    steps.push({
      title: `Amount ${i}: Try Each Coin`,
      detail: attempts.map(a =>
        `coin ${a.coin}: dp[${a.from}]${a.fromVal === INF ? "=∞" : "=" + a.fromVal}+1=${a.result === INF ? "∞" : a.result}`
      ).join(" │ ") + ".",
      dp: [...dp], current: i, phase: "compare", codeHL: [6, 7, 8],
      tryCoin: attempts, tryResult: bestAttempt.result,
      bestCoin: bestAttempt.result < INF ? bestAttempt.coin : null,
      finalized: new Set(finalized), changedIdx: null, usedCoin: [...usedCoin],
    });

    const prevDp = [...dp];
    if (bestAttempt.result < dp[i]) {
      dp[i] = bestAttempt.result;
      usedCoin[i] = bestAttempt.coin;
    }
    finalized.add(i);

    const improved = dp[i] < INF;
    steps.push({
      title: improved
        ? `dp[${i}] = ${dp[i]} (used coin ${usedCoin[i]})`
        : `dp[${i}] = ∞ — Not Reachable`,
      detail: improved
        ? `Best option: coin ${usedCoin[i]} → dp[${i - usedCoin[i]}] + 1 = ${dp[i]}.`
        : `No coin can reach amount ${i}.`,
      dp: [...dp], current: i, phase: "fill", codeHL: [8, 9],
      tryCoin: null, tryResult: null, bestCoin: usedCoin[i],
      finalized: new Set(finalized), changedIdx: i, prevDp, usedCoin: [...usedCoin],
    });
  }

  const coinsUsed = [];
  let rem = amount;
  while (rem > 0 && usedCoin[rem] !== -1) {
    coinsUsed.push(usedCoin[rem]);
    rem -= usedCoin[rem];
  }

  steps.push({
    title: `✓ Complete — Minimum = ${dp[amount]} Coins`,
    detail: `dp[${amount}] = ${dp[amount]}. Coins used: [${coinsUsed.join(" + ")}] = ${coinsUsed.reduce((a, b) => a + b, 0)}.`,
    dp: [...dp], current: -1, phase: "done", codeHL: [11],
    tryCoin: null, tryResult: null, bestCoin: null,
    finalized: new Set(finalized), changedIdx: null, usedCoin: [...usedCoin],
    coinsUsed,
  });

  return steps;
}

function buildSteps(prob, key) {
  return key === "robber" ? buildRobberSteps(prob) : buildCoinSteps(prob);
}

/* ——— Houses SVG (robber) ——— */
function HousesView({ step, prob }) {
  const { nums } = prob;
  const { current, choices, robbed } = step;
  const w = 56, gap = 6, h = 72;
  const totalW = nums.length * (w + gap);

  return (
    <svg viewBox={`0 0 ${totalW} ${h + 28}`} className="w-full" style={{ maxHeight: 110 }}>
      {nums.map((val, i) => {
        const x = i * (w + gap);
        const isCurr = current === i;
        const isRobbed = step.phase === "done" && robbed && robbed.includes(i);
        const choice = choices[i];
        const fill = isRobbed ? "#10b981" : isCurr ? "#3b82f6" : choice === "rob" ? "#059669" : choice === "skip" ? "#44403c" : "#27272a";
        const stroke = isRobbed ? "#34d399" : isCurr ? "#60a5fa" : choice === "rob" ? "#10b981" : "#3f3f46";
        return (
          <g key={i}>
            <path d={`M${x + 8},${h - 8} L${x + 8},32 L${x + w / 2},14 L${x + w - 8},32 L${x + w - 8},${h - 8} Z`}
              fill={fill} stroke={stroke} strokeWidth={isCurr || isRobbed ? 2.5 : 1.5} />
            <text x={x + w / 2} y={50} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="monospace">{val}</text>
            <text x={x + w / 2} y={h + 6} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">i={i}</text>
            {choice && (
              <text x={x + w / 2} y={h + 18} textAnchor="middle" fill={choice === "rob" ? "#10b981" : "#71717a"} fontSize="8" fontWeight="600">
                {choice === "rob" ? "ROB" : "skip"}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ——— Coins Bar SVG (coin change) ——— */
function CoinsBarView({ step, prob }) {
  const { coins, amount } = prob;
  const { current, dp, finalized, tryCoin, bestCoin } = step;
  const cellW = 50, cellH = 38, gap = 3;
  const totalW = (amount + 1) * (cellW + gap);
  const coinY = 8, barY = 46;

  return (
    <svg viewBox={`0 0 ${totalW} ${barY + cellH + 16}`} className="w-full" style={{ maxHeight: 110 }}>
      {coins.map((c, ci) => {
        const cx = ci * 48 + 24;
        const isActive = tryCoin && tryCoin.some(a => a.coin === c);
        const isBest = bestCoin === c && step.phase === "compare";
        return (
          <g key={ci}>
            <circle cx={cx} cy={coinY + 10} r={13}
              fill={isBest ? "#10b981" : isActive ? "#3b82f6" : "#3f3f46"}
              stroke={isBest ? "#34d399" : isActive ? "#60a5fa" : "#52525b"} strokeWidth={1.5} />
            <text x={cx} y={coinY + 14} textAnchor="middle" dominantBaseline="central"
              fill="#fff" fontSize="10" fontWeight="700" fontFamily="monospace">{c}</text>
          </g>
        );
      })}
      <text x={coins.length * 48 + 8} y={coinY + 14} fill="#52525b" fontSize="9" fontFamily="monospace" dominantBaseline="central">coins</text>

      {Array.from({ length: amount + 1 }).map((_, i) => {
        const x = i * (cellW + gap);
        const isCurr = current === i;
        const isDone = step.phase === "done";
        const isFinal = finalized.has(i);
        const val = dp[i];
        const isTarget = tryCoin && tryCoin.some(a => a.from === i);
        const fill = isCurr ? "#3b82f6" : isTarget ? "#f59e0b" : isDone && val < Infinity ? "#10b981" : isFinal && val < Infinity ? "#059669" : "#27272a";
        const stroke = isCurr ? "#60a5fa" : isTarget ? "#d97706" : isDone && val < Infinity ? "#34d399" : isFinal && val < Infinity ? "#10b981" : "#3f3f46";
        return (
          <g key={i}>
            <rect x={x} y={barY} width={cellW} height={cellH} rx={7}
              fill={fill} stroke={stroke} strokeWidth={isCurr ? 2.5 : 1.5} />
            <text x={x + cellW / 2} y={barY + cellH / 2 + 1} textAnchor="middle" dominantBaseline="central"
              fill="#fff" fontSize="12" fontWeight="700" fontFamily="monospace">
              {val === Infinity ? "∞" : val}
            </text>
            <text x={x + cellW / 2} y={barY + cellH + 10} textAnchor="middle"
              fill="#71717a" fontSize="9" fontFamily="monospace">{i}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ——— IO Panel (robber) ——— */
function RobberIOPanel({ step, prob }) {
  const { nums, expectedDp, expectedResult, expectedDetail } = prob;
  const { phase, dp, finalized } = step;
  const done = phase === "done";
  const allMatch = done && expectedDp.every((v, i) => dp[i] === v);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">nums</span> = [<span className="text-zinc-300">{nums.join(", ")}</span>]</div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs">
          <span className="text-zinc-500">max_money = </span><span className="text-zinc-300">{expectedResult}</span>
        </div>
        <div className="font-mono text-[10px] mt-1">
          <span className="text-zinc-600">robbed = [{expectedDetail.map(i => `${i}(${nums[i]})`).join(", ")}]</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-xs flex items-center gap-0.5">
          <span className="text-zinc-500">dp = [</span>
          {Array.from({ length: nums.length }).map((_, i) => {
            const isFinal = finalized.has(i);
            const val = dp[i];
            const matchesExpected = isFinal && val === expectedDp[i];
            return (
              <span key={i} className="flex items-center">
                <span className={matchesExpected ? "text-emerald-300 font-bold" : isFinal ? "text-blue-300" : val !== null ? "text-zinc-400" : "text-zinc-600"}>
                  {isFinal ? val : val !== null ? val : "?"}
                </span>
                {i < nums.length - 1 && <span className="text-zinc-600">, </span>}
              </span>
            );
          })}
          <span className="text-zinc-500">]</span>
        </div>
        {done && step.robbed && (
          <div className="mt-2 space-y-0.5">
            {step.robbed.map(idx => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                <span className="text-zinc-600 w-12">house {idx}:</span>
                <span className="text-emerald-400/80">+{nums[idx]}</span>
                <span className="text-emerald-600">✓</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[10px] pt-1 border-t border-zinc-800">
              <span className="text-zinc-500 w-12">total:</span>
              <span className="text-emerald-300 font-bold">{step.robbed.reduce((s, i) => s + nums[i], 0)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— IO Panel (coin change) ——— */
function CoinIOPanel({ step, prob }) {
  const { coins, amount, expectedDp, expectedResult, expectedDetail } = prob;
  const { phase, dp, finalized } = step;
  const done = phase === "done";
  const allMatch = done && expectedDp.every((v, i) => dp[i] === v);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">coins</span>  = [<span className="text-zinc-300">{coins.join(", ")}</span>]</div>
          <div><span className="text-zinc-500">amount</span> = <span className="text-blue-400">{amount}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs">
          <span className="text-zinc-500">min_coins = </span><span className="text-zinc-300">{expectedResult}</span>
        </div>
        <div className="font-mono text-[10px] mt-1">
          <span className="text-zinc-600">used = [{expectedDetail.join(" + ")}]</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-xs flex items-center gap-0.5 flex-wrap">
          <span className="text-zinc-500">dp = [</span>
          {Array.from({ length: amount + 1 }).map((_, i) => {
            const isFinal = finalized.has(i);
            const val = dp[i];
            const displayVal = val === Infinity ? "∞" : val;
            const matchesExpected = isFinal && val === expectedDp[i];
            return (
              <span key={i} className="flex items-center">
                <span className={matchesExpected ? "text-emerald-300 font-bold" : isFinal ? "text-blue-300" : "text-zinc-600"}>
                  {isFinal ? displayVal : "?"}
                </span>
                {i < amount && <span className="text-zinc-600">, </span>}
              </span>
            );
          })}
          <span className="text-zinc-500">]</span>
        </div>
        {done && step.coinsUsed && (
          <div className="mt-2 space-y-0.5">
            {step.coinsUsed.map((c, ci) => (
              <div key={ci} className="flex items-center gap-1.5 text-[10px]">
                <span className="text-zinc-600 w-12">coin {ci + 1}:</span>
                <span className="text-emerald-400/80">{c}</span>
                <span className="text-emerald-600">✓</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[10px] pt-1 border-t border-zinc-800">
              <span className="text-zinc-500 w-12">sum:</span>
              <span className="text-emerald-300 font-bold">{step.coinsUsed.reduce((a, b) => a + b, 0)} = {amount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— State panels: Robber ——— */
function RobberState({ step, prob }) {
  const { nums } = prob;
  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">dp[]</div>
        <div className="flex gap-1.5">
          {step.dp.map((d, i) => {
            const changed = step.changedIdx === i;
            const isCurr = step.current === i;
            const isPrev1 = step.prev1 === i;
            const isPrev2 = step.prev2 === i;
            const isDone = step.phase === "done";
            const isFinal = step.finalized.has(i);
            const prevVal = step.prevDp ? step.prevDp[i] : null;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                  changed ? "bg-emerald-950 border-emerald-700 text-emerald-200 scale-110" :
                  isCurr ? "bg-blue-950 border-blue-700 text-blue-200" :
                  isPrev1 ? "bg-blue-950/50 border-blue-800 text-blue-400" :
                  isPrev2 ? "bg-amber-950/50 border-amber-800 text-amber-400" :
                  isDone ? "bg-emerald-950/30 border-emerald-800 text-emerald-300" :
                  isFinal ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" :
                  d !== null ? "bg-zinc-900 border-zinc-700 text-zinc-300" :
                  "bg-zinc-900 border-zinc-700 text-zinc-600"
                }`}>
                  {changed && prevVal !== null && prevVal !== d
                    ? <span><span className="text-zinc-600 line-through text-[10px]">{prevVal === null ? "–" : prevVal}</span> {d}</span>
                    : d !== null ? d : "–"}
                </div>
                {isPrev1 && <span className="text-[8px] font-mono text-blue-600">i-1</span>}
                {isPrev2 && <span className="text-[8px] font-mono text-amber-600">i-2</span>}
                {isFinal && !isPrev1 && !isPrev2 && <span className="text-[8px] font-mono text-emerald-700">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {step.comparing && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Decision</div>
          <div className="flex gap-3 justify-center">
            <div className={`flex-1 text-center p-2.5 rounded-xl border ${step.comparing.skip >= step.comparing.rob ? "bg-blue-950/50 border-blue-800" : "border-zinc-800"}`}>
              <div className="text-[10px] text-blue-400 mb-1">SKIP (dp[i-1])</div>
              <div className="text-xl font-bold font-mono text-blue-300">{step.comparing.skip}</div>
            </div>
            <div className="flex items-center text-zinc-600 font-bold text-sm">vs</div>
            <div className={`flex-1 text-center p-2.5 rounded-xl border ${step.comparing.rob > step.comparing.skip ? "bg-emerald-950/50 border-emerald-800" : "border-zinc-800"}`}>
              <div className="text-[10px] text-emerald-400 mb-1">ROB (dp[i-2]+nums[i])</div>
              <div className="text-xl font-bold font-mono text-emerald-300">{step.comparing.rob}</div>
            </div>
          </div>
        </div>
      )}

      {step.robbed && (
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Optimal Selection</div>
          <div className="space-y-0.5 font-mono text-[10px]">
            {step.robbed.map(idx => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-zinc-500 w-14">house[{idx}]:</span>
                <span className="text-emerald-300">+{nums[idx]}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1 border-t border-emerald-900/50">
              <span className="text-zinc-500 w-14">total:</span>
              <span className="text-emerald-200 font-bold">{step.robbed.reduce((s, i) => s + nums[i], 0)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ——— State panels: Coin Change ——— */
function CoinState({ step }) {
  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">dp[]</div>
        <div className="flex gap-1.5">
          {step.dp.map((d, i) => {
            const changed = step.changedIdx === i;
            const isDone = step.phase === "done";
            const isFinal = step.finalized.has(i);
            const prevVal = step.prevDp ? step.prevDp[i] : null;
            const val = d === Infinity ? "∞" : d;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-600 font-mono">{i}</span>
                <div className={`w-12 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                  changed ? "bg-emerald-950 border-emerald-700 text-emerald-200 scale-110" :
                  isDone ? "bg-emerald-950/30 border-emerald-800 text-emerald-300" :
                  isFinal ? "bg-emerald-950/20 border-emerald-900 text-emerald-400" :
                  d === Infinity ? "bg-zinc-900 border-zinc-700 text-zinc-600" :
                  "bg-zinc-900 border-zinc-700 text-zinc-300"
                }`}>
                  {changed && prevVal !== null && prevVal !== d
                    ? <span><span className="text-zinc-600 line-through text-[10px]">{prevVal === Infinity ? "∞" : prevVal}</span> {val}</span>
                    : val}
                </div>
                {isFinal && <span className="text-[8px] font-mono text-emerald-700">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {step.tryCoin && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Coin Attempts</div>
          <div className="flex gap-2 justify-center flex-wrap">
            {step.tryCoin.map((a, ai) => {
              const isBest = a.result === step.tryResult && a.result < Infinity;
              return (
                <div key={ai} className={`text-center p-2 rounded-xl border ${isBest ? "bg-emerald-950/50 border-emerald-800" : "border-zinc-800"}`} style={{ minWidth: 80 }}>
                  <div className="text-[10px] text-zinc-500 mb-0.5">coin {a.coin}</div>
                  <div className="text-[9px] text-zinc-600 mb-1">dp[{a.from}]+1</div>
                  <div className={`text-lg font-bold font-mono ${isBest ? "text-emerald-300" : a.result === Infinity ? "text-zinc-600" : "text-zinc-400"}`}>
                    {a.result === Infinity ? "∞" : a.result}
                  </div>
                  {isBest && <div className="text-[8px] text-emerald-500 mt-0.5">â† best</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step.coinsUsed && (
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Optimal Decomposition</div>
          <div className="space-y-0.5 font-mono text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">coins:</span>
              <span className="text-emerald-300">{step.coinsUsed.join(" + ")} = {step.coinsUsed.reduce((a, b) => a + b, 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">count:</span>
              <span className="text-emerald-200 font-bold">{step.coinsUsed.length}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ——— Code Panel ——— */
function CodePanel({ highlightLines, code }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {code.map((line) => {
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

/* ——— Navigation Bar ——— */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">â† Prev</button>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setSi(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === si ? "bg-blue-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`} />
        ))}
      </div>
      <button onClick={() => setSi(Math.min(total - 1, si + 1))} disabled={si >= total - 1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">Next →</button>
    </div>
  );
}

/* ——— Main Component ——— */
export default function DP1DViz() {
  const [exKey, setExKey] = useState("robber");
  const [si, setSi] = useState(0);
  const prob = PROBLEMS[exKey];
  const steps = useMemo(() => buildSteps(prob, exKey), [exKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const switchEx = (k) => { setExKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* â•â•â• 1. Header â•â•â• */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">1D Dynamic Programming</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{prob.title} • {prob.subtitle}</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(PROBLEMS).map(([k, v]) => (
              <button key={k} onClick={() => switchEx(k)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${exKey === k ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
                {v.title}
              </button>
            ))}
          </div>
        </div>

        {/* â•â•â• 2. Core Idea (violet card) â•â•â• */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{prob.coreIdea}</p>
        </div>

        {/* â•â•â• 3. Navigation â•â•â• */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 4. 3-COLUMN GRID â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* —— COL 1: IO + Viz —— */}
          <div className="col-span-3 space-y-3">
            {exKey === "robber"
              ? <RobberIOPanel step={step} prob={prob} />
              : <CoinIOPanel step={step} prob={prob} />}

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">
                {exKey === "robber"
                  ? `${prob.nums.length} houses • no two adjacent`
                  : `coins = [${prob.coins.join(",")}] • amount = ${prob.amount}`}
              </div>
              {exKey === "robber"
                ? <HousesView step={step} prob={prob} />
                : <CoinsBarView step={step} prob={prob} />}
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{exKey === "robber" ? "Robbed" : "Filled"}</span>
                {exKey === "robber"
                  ? <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" />Skipped</span>
                  : <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Source</span>}
              </div>
            </div>
          </div>

          {/* —— COL 2: Steps + State —— */}
          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "compare" ? "bg-amber-900 text-amber-300" :
                  step.phase === "fill" ? "bg-blue-900 text-blue-300" :
                  step.phase === "base" ? "bg-teal-900 text-teal-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {exKey === "robber"
              ? <RobberState step={step} prob={prob} />
              : <CoinState step={step} />}
          </div>

          {/* —— COL 3: Code —— */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} code={prob.code} />
          </div>

        </div>

        {/* â•â•â• 5. BOTTOM ROW: When to Use + Classic Problems â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              {prob.whenToUse.map((text, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>{text}</li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> {prob.complexity.time}</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> {prob.complexity.space}</div>
                <div><span className="text-zinc-500 font-semibold">{exKey === "robber" ? "Pattern" : "Variant"}:</span> {prob.complexity.note}</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              {prob.classics.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-amber-500/60">•</span>
                  <span className="text-zinc-400">{c.name}</span>
                  <span className={`ml-auto text-[10px] ${c.diff === "Hard" ? "text-red-700" : c.diff === "Easy" ? "text-emerald-700" : "text-amber-700"}`}>{c.diff}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
