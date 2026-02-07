import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   INTERVAL DP — 2 Core Patterns
   "Process Last" (Burst Balloons) · "Endpoints" (Palindromic Subseq)
   ═══════════════════════════════════════════════════════════════ */

/* ─── Problem Definitions ─── */
const PROBLEMS = {
  balloons: {
    title: "Burst Balloons",
    subtitle: '"Process Last" Pattern',
    coreIdea: 'Choose which balloon to burst LAST in range (i,j). When k is burst last, boundaries nums[i] and nums[j] are still intact — subproblems dp[i][k] and dp[k][j] become independent. Coins = nums[i]×nums[k]×nums[j] + dp[i][k] + dp[k][j]. Fill diagonally by gap size. O(n³).',
    data: [3, 1, 5, 8],
  },
  palindrome: {
    title: "Longest Palindromic Subseq",
    subtitle: '"Endpoints" Pattern',
    coreIdea: 'Compare characters at both ends of range [i,j]. If s[i]==s[j], they extend the palindrome: dp[i][j] = dp[i+1][j-1] + 2. Otherwise, try dropping each end: dp[i][j] = max(dp[i+1][j], dp[i][j-1]). Fill diagonally by gap. O(n²). Base: dp[i][i] = 1.',
    data: "bbbab",
  },
};

/* ─── Python Code per Problem ─── */
const CODES = {
  balloons: [
    { id: 1,  text: `def burst_balloons(balloons):` },
    { id: 2,  text: `    nums = [1] + balloons + [1]` },
    { id: 3,  text: `    n = len(balloons)` },
    { id: 4,  text: `    dp = [[0]*(n+2) for _ in range(n+2)]` },
    { id: 5,  text: `` },
    { id: 6,  text: `    for gap in range(2, n+2):` },
    { id: 7,  text: `        for i in range(0, n+2-gap):` },
    { id: 8,  text: `            j = i + gap` },
    { id: 9,  text: `            for k in range(i+1, j):` },
    { id: 10, text: `                coins = nums[i]*nums[k]*nums[j]` },
    { id: 11, text: `                total = dp[i][k] + dp[k][j]` },
    { id: 12, text: `                       + coins` },
    { id: 13, text: `                dp[i][j] = max(dp[i][j],` },
    { id: 14, text: `                               total)` },
    { id: 15, text: `` },
    { id: 16, text: `    return dp[0][n+1]` },
  ],
  palindrome: [
    { id: 1,  text: `def longest_palindrome_subseq(s):` },
    { id: 2,  text: `    n = len(s)` },
    { id: 3,  text: `    dp = [[0]*n for _ in range(n)]` },
    { id: 4,  text: `    for i in range(n):` },
    { id: 5,  text: `        dp[i][i] = 1  # base case` },
    { id: 6,  text: `` },
    { id: 7,  text: `    for gap in range(1, n):` },
    { id: 8,  text: `        for i in range(n - gap):` },
    { id: 9,  text: `            j = i + gap` },
    { id: 10, text: `            if s[i] == s[j]:` },
    { id: 11, text: `                dp[i][j] = dp[i+1][j-1] + 2` },
    { id: 12, text: `            else:` },
    { id: 13, text: `                dp[i][j] = max(dp[i+1][j],` },
    { id: 14, text: `                              dp[i][j-1])` },
    { id: 15, text: `` },
    { id: 16, text: `    return dp[0][n-1]` },
  ],
};

/* ─── Expected Outputs ─── */
const EXPECTED = {
  balloons: { value: 167, detail: "Optimal burst order: 1→5→3→8" },
  palindrome: { value: 4, detail: 'LPS = "bbbb" (length 4)' },
};

/* ═══════════════════════════════════════════════════════════════
   BUILD STEPS — Burst Balloons
   ═══════════════════════════════════════════════════════════════ */
function buildSteps_balloons(prob) {
  const balloons = prob.data;
  const n = balloons.length;
  const nums = [1, ...balloons, 1];
  const dp = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));
  const steps = [];
  const finalized = new Set();
  const snap = () => dp.map(r => [...r]);

  steps.push({
    title: "Initialize — Pad with 1s",
    detail: `Balloons: [${balloons.join(",")}] → padded: [${nums.join(",")}]. dp[i][j] = max coins from bursting all balloons in range (i,j) exclusive. Base: all zeros. Fill by increasing gap.`,
    dp: snap(), current: null, phase: "init", codeHL: [1, 2, 3, 4],
    splitInfo: null, gap: 0, bestSplit: null, finalized: new Set(finalized),
    rangeHL: null,
  });

  for (let gap = 2; gap <= n + 1; gap++) {
    steps.push({
      title: `Gap = ${gap} — Ranges of ${gap - 1} Balloon${gap - 1 > 1 ? "s" : ""}`,
      detail: `Fill all dp[i][j] where j−i = ${gap}. ${n + 2 - gap} subproblem${n + 2 - gap > 1 ? "s" : ""} at this diagonal. ${gap === 2 ? "Single balloon — only one choice for k." : `Try each k ∈ (i,j) as the last balloon to burst.`}`,
      dp: snap(), current: null, phase: "gap", codeHL: [6, 7, 8],
      splitInfo: null, gap, bestSplit: null, finalized: new Set(finalized),
      rangeHL: null,
    });

    for (let i = 0; i + gap <= n + 1; i++) {
      const j = i + gap;
      let best = 0, bestK = -1;
      const splits = [];

      for (let k = i + 1; k < j; k++) {
        const coins = nums[i] * nums[k] * nums[j];
        const total = dp[i][k] + dp[k][j] + coins;
        splits.push({ k, coins, left: dp[i][k], right: dp[k][j], total, val: nums[k] });
        if (total > best) { best = total; bestK = k; }
      }

      dp[i][j] = best;
      finalized.add(`${i},${j}`);

      steps.push({
        title: `dp[${i}][${j}] = ${best} — burst b${bestK}(=${nums[bestK]}) last`,
        detail: splits.map(s =>
          `k=${s.k}: ${nums[i]}×${s.val}×${nums[j]}=${s.coins} + dp[${i}][${s.k}](${s.left}) + dp[${s.k}][${j}](${s.right}) = ${s.total}`
        ).join(" · ") + `. Best: ${best}.`,
        dp: snap(), current: [i, j], phase: "fill", codeHL: [9, 10, 11, 12, 13, 14],
        splitInfo: splits, gap, bestSplit: bestK, finalized: new Set(finalized),
        rangeHL: { i, j, k: bestK },
      });
    }
  }

  steps.push({
    title: `✓ Max Coins = ${dp[0][n + 1]}`,
    detail: `dp[0][${n+1}] = ${dp[0][n+1]}. The "burst last" framing makes subproblems independent — when k is the last balloon, its neighbors are the fixed boundaries i and j.`,
    dp: snap(), current: [0, n + 1], phase: "done", codeHL: [16],
    splitInfo: null, gap: n + 1, bestSplit: null, finalized: new Set(finalized),
    rangeHL: null,
  });

  return steps;
}

/* ═══════════════════════════════════════════════════════════════
   BUILD STEPS — Longest Palindromic Subsequence
   ═══════════════════════════════════════════════════════════════ */
function buildSteps_palindrome(prob) {
  const s = prob.data;
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  const steps = [];
  const finalized = new Set();
  const snap = () => dp.map(r => [...r]);

  // Base: dp[i][i] = 1
  for (let i = 0; i < n; i++) { dp[i][i] = 1; finalized.add(`${i},${i}`); }

  steps.push({
    title: "Initialize — Base: dp[i][i] = 1",
    detail: `String: "${s}" (len=${n}). dp[i][j] = LPS length of s[i..j]. Each single character is a palindrome of length 1.`,
    dp: snap(), current: null, phase: "init", codeHL: [1, 2, 3, 4, 5],
    matchInfo: null, gap: 0, finalized: new Set(finalized),
    charHL: null,
  });

  for (let gap = 1; gap < n; gap++) {
    steps.push({
      title: `Gap = ${gap} — Substrings of Length ${gap + 1}`,
      detail: `Fill dp[i][j] where j−i = ${gap}. ${n - gap} subproblem${n - gap > 1 ? "s" : ""}. Compare s[i] vs s[j]: match → extend, mismatch → max(drop left, drop right).`,
      dp: snap(), current: null, phase: "gap", codeHL: [7, 8, 9],
      matchInfo: null, gap, finalized: new Set(finalized),
      charHL: null,
    });

    for (let i = 0; i + gap < n; i++) {
      const j = i + gap;
      const matched = s[i] === s[j];

      if (matched) {
        dp[i][j] = (gap >= 2 ? dp[i + 1][j - 1] : 0) + 2;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
      }
      finalized.add(`${i},${j}`);

      const matchInfo = {
        matched,
        ci: s[i], cj: s[j],
        inner: gap >= 2 ? dp[i + 1][j - 1] : 0,
        dropLeft: dp[i + 1] ? dp[i + 1][j] : 0,
        dropRight: dp[i][j - 1],
        result: dp[i][j],
      };

      steps.push({
        title: matched
          ? `dp[${i}][${j}]: "${s[i]}"=="${s[j]}" → Match! ${gap >= 2 ? `dp[${i+1}][${j-1}]` : "0"}+2 = ${dp[i][j]}`
          : `dp[${i}][${j}]: "${s[i]}"≠"${s[j]}" → max(dp[${i+1}][${j}], dp[${i}][${j-1}]) = ${dp[i][j]}`,
        detail: matched
          ? `s[${i}]='${s[i]}' == s[${j}]='${s[j]}'. Endpoints match, extend inner palindrome: ${gap >= 2 ? `dp[${i+1}][${j-1}]=${dp[i+1][j-1]}` : "base=0"} + 2 = ${dp[i][j]}. Substring: "${s.slice(i, j + 1)}".`
          : `s[${i}]='${s[i]}' ≠ s[${j}]='${s[j]}'. Drop left → dp[${i+1}][${j}]=${dp[i+1][j]}, drop right → dp[${i}][${j-1}]=${dp[i][j-1]}. Best: ${dp[i][j]}. Substring: "${s.slice(i, j + 1)}".`,
        dp: snap(), current: [i, j], phase: matched ? "match" : "mismatch", codeHL: matched ? [10, 11] : [12, 13, 14],
        matchInfo, gap, finalized: new Set(finalized),
        charHL: { i, j, matched },
      });
    }
  }

  // Reconstruct LPS
  let li = 0, ri = n - 1;
  const lpsChars = [];
  const dpCopy = prob.data; // just for reconstruction
  // Simple reconstruction
  function reconstructLPS(s, dp) {
    const res = new Array(dp[0][n - 1]).fill("");
    let lo = 0, hi = dp[0][n - 1] - 1;
    let i = 0, j = n - 1;
    while (i < j) {
      if (s[i] === s[j]) {
        res[lo] = s[i]; res[hi] = s[j];
        lo++; hi--; i++; j--;
      } else if (dp[i + 1][j] >= dp[i][j - 1]) {
        i++;
      } else {
        j--;
      }
    }
    if (i === j) res[lo] = s[i];
    return res.join("");
  }
  const lps = reconstructLPS(s, dp);

  steps.push({
    title: `✓ LPS Length = ${dp[0][n - 1]}`,
    detail: `dp[0][${n-1}] = ${dp[0][n-1]}. One LPS: "${lps}". The "endpoints" framing: at each range, compare the two boundary characters. Match → extend. Mismatch → try both contractions.`,
    dp: snap(), current: [0, n - 1], phase: "done", codeHL: [16],
    matchInfo: null, gap: n - 1, finalized: new Set(finalized),
    charHL: null, lps,
  });

  return steps;
}

const BUILDERS = {
  balloons: buildSteps_balloons,
  palindrome: buildSteps_palindrome,
};

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ─── Code Panel ─── */
function CodePanel({ code, highlightLines }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {code.map((line) => {
          const hl = highlightLines.includes(line.id);
          return (
            <div key={`${line.id}-${line.text.slice(0,20)}`}
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

/* ─── Navigation Bar ─── */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">
        ← Prev
      </button>
      <div className="flex gap-1.5 items-center">
        {total <= 20
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
   IO PANELS
   ═══════════════════════════════════════════════════════════════ */

function IOPanel_balloons({ step, prob }) {
  const balloons = prob.data;
  const n = balloons.length;
  const nums = [1, ...balloons, 1];
  const exp = EXPECTED.balloons;
  const done = step.phase === "done";
  const curVal = step.dp[0][n + 1];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">balloons</span> = <span className="text-zinc-300">[{balloons.join(", ")}]</span></div>
          <div><span className="text-zinc-500">padded  </span> = <span className="text-zinc-300">[{nums.join(", ")}]</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">max_coins</span> = <span className="text-zinc-300">{exp.value}</span>
          <span className="text-zinc-600 text-[10px] ml-2">({exp.detail})</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && curVal === exp.value && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">dp[0][{n+1}]</span> = <span className={done ? "text-emerald-300 font-bold" : curVal > 0 ? "text-zinc-300" : "text-zinc-600"}>{curVal || "?"}</span>
        </div>
        {step.gap > 0 && (
          <div className="mt-1 text-[10px] text-zinc-600 font-mono">
            gap={step.gap} • filling diagonal {step.gap}/{n + 1}
          </div>
        )}
      </div>
    </div>
  );
}

function IOPanel_palindrome({ step, prob }) {
  const s = prob.data;
  const n = s.length;
  const exp = EXPECTED.palindrome;
  const done = step.phase === "done";
  const curVal = step.dp[0][n - 1];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">s</span> = <span className="text-zinc-300">"{s}"</span></div>
          <div><span className="text-zinc-500">n</span> = <span className="text-blue-400">{n}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">lps_len</span> = <span className="text-zinc-300">{exp.value}</span>
          <span className="text-zinc-600 text-[10px] ml-2">({exp.detail})</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && curVal === exp.value && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">dp[0][{n-1}]</span> = <span className={done ? "text-emerald-300 font-bold" : curVal > 0 ? "text-zinc-300" : "text-zinc-600"}>{curVal || "?"}</span>
        </div>
        {done && step.lps && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-600">LPS:</span>
            <span className="font-mono text-[11px] text-emerald-300 font-bold">"{step.lps}"</span>
          </div>
        )}
      </div>
    </div>
  );
}

const IO_PANELS = { balloons: IOPanel_balloons, palindrome: IOPanel_palindrome };

/* ═══════════════════════════════════════════════════════════════
   VISUALIZATION COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ─── Balloon Visual ─── */
function BalloonView({ step, data }) {
  const nums = [1, ...data, 1];
  const { rangeHL } = step;

  return (
    <div className="flex gap-2 justify-center items-end">
      {nums.map((val, i) => {
        const isPad = i === 0 || i === nums.length - 1;
        const isInRange = rangeHL && i > rangeHL.i && i < rangeHL.j;
        const isBestK = rangeHL && rangeHL.k === i;
        const isLeftBound = rangeHL && rangeHL.i === i;
        const isRightBound = rangeHL && rangeHL.j === i;
        const h = isPad ? 40 : 30 + val * 5;

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-11 rounded-t-full rounded-b-lg flex items-center justify-center border-2 transition-all ${
              isBestK ? "bg-amber-600 border-amber-400" :
              isLeftBound || isRightBound ? "bg-violet-900 border-violet-600" :
              isInRange ? "bg-blue-900 border-blue-600" :
              isPad ? "bg-zinc-800 border-zinc-700" :
              "bg-zinc-900 border-zinc-700"}`}
              style={{ height: h }}>
              <span className={`font-mono font-bold text-sm ${isBestK ? "text-white" : isPad ? "text-zinc-500" : "text-zinc-300"}`}>{val}</span>
            </div>
            <span className={`text-[9px] font-mono ${isPad ? "text-zinc-700" : isBestK ? "text-amber-400 font-bold" : "text-zinc-500"}`}>
              {isPad ? "pad" : `b${i}`}
            </span>
            {isBestK && <span className="text-[8px] text-amber-500 font-bold -mt-0.5">LAST</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Character Array Visual ─── */
function CharView({ step, data }) {
  const s = data;
  const { charHL } = step;

  return (
    <div className="flex gap-1.5 justify-center">
      {s.split("").map((ch, i) => {
        const isLeft = charHL && charHL.i === i;
        const isRight = charHL && charHL.j === i;
        const isEndpoint = isLeft || isRight;
        const matched = charHL && charHL.matched;
        const isInRange = charHL && i >= charHL.i && i <= charHL.j;

        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
              isEndpoint && matched ? "bg-emerald-700 border-emerald-400 scale-110" :
              isEndpoint && !matched ? "bg-red-900 border-red-600 scale-110" :
              isInRange ? "bg-zinc-800 border-zinc-600" :
              "bg-zinc-900 border-zinc-800"}`}>
              <span className={`font-mono font-bold text-lg ${
                isEndpoint && matched ? "text-emerald-100" :
                isEndpoint ? "text-red-200" :
                "text-zinc-300"}`}>{ch}</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-600">{i}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── DP Matrix — Upper Triangle ─── */
function DPMatrix({ step, size, labels }) {
  const { dp, current, finalized } = step;
  const done = step.phase === "done";

  return (
    <div className="overflow-x-auto">
      <table className="font-mono text-[11px]">
        <thead>
          <tr>
            <th className="w-8 py-0.5 text-zinc-600 text-[10px]">i\j</th>
            {Array.from({ length: size }, (_, j) => (
              <th key={j} className={`w-9 py-0.5 text-center text-[10px] ${current && current[1] === j ? "text-amber-400" : "text-zinc-600"}`}>
                {labels ? labels[j] : j}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: size }, (_, i) => (
            <tr key={i}>
              <td className={`py-0.5 text-center text-[10px] ${current && current[0] === i ? "text-blue-400 font-bold" : "text-zinc-600"}`}>
                {labels ? labels[i] : i}
              </td>
              {Array.from({ length: size }, (_, j) => {
                const isCurr = current && current[0] === i && current[1] === j;
                const val = dp[i] ? dp[i][j] : 0;
                const isFinal = finalized.has(`${i},${j}`);
                const isDone = done && i === 0 && j === size - 1;
                const isBelow = j < i;
                const isDiag = j === i;
                return (
                  <td key={j} className={`text-center py-0.5 rounded transition-all ${
                    isCurr ? "bg-blue-900/60 text-blue-200 font-bold ring-1 ring-blue-500" :
                    isDone ? "bg-emerald-900/40 text-emerald-300 font-bold ring-1 ring-emerald-600" :
                    isBelow ? "text-zinc-800" :
                    isFinal && val > 0 ? "text-zinc-300" :
                    isDiag ? "text-zinc-500" :
                    "text-zinc-700"
                  }`}>
                    {isBelow ? "·" : val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Split Points Panel (balloons) ─── */
function SplitPanel({ step, nums }) {
  if (!step.splitInfo) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Split Points — Burst k Last</div>
      <div className="space-y-1">
        {step.splitInfo.map((s, idx) => (
          <div key={idx} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-mono text-[11px] border transition-all ${
            s.k === step.bestSplit ? "bg-amber-950/50 border-amber-800" : "border-zinc-800/50"}`}>
            <span className={`w-8 ${s.k === step.bestSplit ? "text-amber-400 font-bold" : "text-zinc-500"}`}>k={s.k}</span>
            <span className="text-zinc-600 text-[10px]">{nums[step.current[0]]}×{s.val}×{nums[step.current[1]]}={s.coins}</span>
            <span className="text-zinc-600 text-[10px]">+{s.left}+{s.right}</span>
            <span className={`ml-auto font-bold ${s.k === step.bestSplit ? "text-amber-300" : "text-zinc-500"}`}>= {s.total}</span>
            {s.k === step.bestSplit && <span className="text-amber-500 text-xs">★</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Match/Mismatch Panel (palindrome) ─── */
function MatchPanel({ step }) {
  const m = step.matchInfo;
  if (!m) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Endpoint Decision</div>
      {m.matched ? (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800">
          <div className="flex items-center gap-1.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-mono font-bold text-emerald-100">{m.ci}</span>
            <span className="text-emerald-500 font-bold">=</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-mono font-bold text-emerald-100">{m.cj}</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-300">
            inner({m.inner}) + 2 = <span className="font-bold">{m.result}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg">
            <span className="w-7 h-7 rounded bg-red-900 flex items-center justify-center font-mono font-bold text-red-200 text-sm">{m.ci}</span>
            <span className="text-red-500 font-bold text-sm">≠</span>
            <span className="w-7 h-7 rounded bg-red-900 flex items-center justify-center font-mono font-bold text-red-200 text-sm">{m.cj}</span>
          </div>
          <div className="flex gap-2">
            <div className={`flex-1 text-center p-2 rounded-lg border ${m.dropLeft >= m.dropRight ? "bg-blue-950/40 border-blue-800" : "border-zinc-800"}`}>
              <div className="text-[9px] text-blue-400">DROP LEFT</div>
              <div className="font-mono font-bold text-sm text-blue-300">{m.dropLeft}</div>
            </div>
            <div className={`flex-1 text-center p-2 rounded-lg border ${m.dropRight > m.dropLeft ? "bg-blue-950/40 border-blue-800" : "border-zinc-800"}`}>
              <div className="text-[9px] text-blue-400">DROP RIGHT</div>
              <div className="font-mono font-bold text-sm text-blue-300">{m.dropRight}</div>
            </div>
          </div>
          <div className="text-center text-[10px] text-zinc-500 font-mono">→ max = {m.result}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function IntervalDPViz() {
  const [exKey, setExKey] = useState("balloons");
  const [si, setSi] = useState(0);
  const prob = PROBLEMS[exKey];
  const steps = useMemo(() => BUILDERS[exKey](prob), [exKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const code = CODES[exKey];
  const IOPanel = IO_PANELS[exKey];

  const switchEx = (k) => { setExKey(k); setSi(0); };

  // Matrix sizing
  const balloons = exKey === "balloons" ? prob.data : null;
  const matrixSize = exKey === "balloons" ? prob.data.length + 2 : prob.data.length;
  const matrixLabels = exKey === "palindrome" ? prob.data.split("") : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        {/* ═══ 1. Header + Problem Switcher ═══ */}
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Interval DP</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Diagonal Fill • Subproblem = Subrange • O(n³) / O(n²)</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(PROBLEMS).map(([k, v]) => (
              <button key={k} onClick={() => switchEx(k)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  exKey === k ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {v.title}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ 2. Core Idea ═══ */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea — {prob.subtitle}</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{prob.coreIdea}</p>
        </div>

        {/* ═══ 3. Navigation ═══ */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 4. 3-Column Grid ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Visual ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} prob={prob} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-2">
                {exKey === "balloons" ? `[1, ${prob.data.join(", ")}, 1] • burst last framing` : `"${prob.data}" • compare endpoints`}
              </div>
              {exKey === "balloons" && <BalloonView step={step} data={prob.data} />}
              {exKey === "palindrome" && <CharView step={step} data={prob.data} />}
              <div className="flex flex-wrap gap-2 justify-center mt-2 text-[9px] text-zinc-600">
                {exKey === "balloons" ? (
                  <>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-600 inline-block" />Burst Last</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-violet-800 inline-block" />Boundary</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-800 inline-block" />In Range</span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-700 inline-block" />Match</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-800 inline-block" />Mismatch</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-zinc-700 inline-block" />In Range</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "match" ? "bg-emerald-950/20 border-emerald-900/50" :
              step.phase === "mismatch" ? "bg-red-950/15 border-red-900/40" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                {step.gap > 0 && <span className="text-xs text-purple-400 font-mono font-bold">gap={step.gap}</span>}
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "fill" ? "bg-blue-900 text-blue-300" :
                  step.phase === "gap" ? "bg-purple-900 text-purple-300" :
                  step.phase === "match" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "mismatch" ? "bg-red-900 text-red-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* DP Matrix */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                {exKey === "balloons" ? "dp[i][j] — Upper Triangle • Diagonal Fill" : "dp[i][j] — Upper Triangle • Diagonal Fill"}
              </div>
              <DPMatrix step={step} size={matrixSize} labels={matrixLabels} />
            </div>

            {/* Context panel — splits or match info */}
            {exKey === "balloons" && <SplitPanel step={step} nums={[1, ...prob.data, 1]} />}
            {exKey === "palindrome" && <MatchPanel step={step} />}

            {/* Completion card */}
            {step.phase === "done" && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Result</div>
                <div className="font-mono text-[11px] text-emerald-300">
                  {exKey === "balloons" && `Max coins: ${step.dp[0][prob.data.length + 1]}. "Burst last" keeps boundaries fixed → independent subproblems.`}
                  {exKey === "palindrome" && `LPS length: ${step.dp[0][prob.data.length - 1]}. Palindrome: "${step.lps}". Endpoints pattern → match or contract.`}
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel code={code} highlightLines={step.codeHL} />
          </div>
        </div>

        {/* ═══ 5. Bottom Row: When to Use + Classic Problems ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span><strong className="text-zinc-300">Process-Last:</strong> Merging/splitting where action changes neighbors — think "what do I do LAST?"</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span><strong className="text-zinc-300">Endpoints:</strong> Palindromes, games, or matching where you compare boundaries and shrink</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>dp[i][j] depends on smaller ranges → fill by increasing gap (diagonal order)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Signature: "subarray/substring optimization" where splitting matters</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(n³) merging, O(n²) endpoints</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(n²) for the dp table</div>
                <div><span className="text-zinc-500 font-semibold">Key trick:</span> "Burst last" / "process last" makes subproblems independent</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 312 — Burst Balloons</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 516 — Longest Palindromic Subseq</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1039 — Min Score Triangulation</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 877 — Stone Game</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1000 — Min Cost Merge Stones</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 5 — Longest Palindromic Substring</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1547 — Min Cost to Cut a Stick</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 486 — Predict the Winner</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
