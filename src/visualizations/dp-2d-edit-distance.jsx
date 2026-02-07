import { useState, useMemo } from "react";

/* â€”â€”â€” Problem Configs â€”â€”â€” */
const PROBLEMS = {
  edit: {
    title: "Edit Distance",
    subtitle: "dp[i][j] = min ops to convert word1[:i] â†’ word2[:j]",
    coreIdea: "At each cell (i,j) compare characters: if they match, take the diagonal for free. Otherwise pick the cheapest of three operations â€” insert (â†), delete (â†‘), or replace (â†–), each costing 1. The matrix fills row by row, and the answer sits at dp[m][n]. This two-string DP pattern is the backbone of spell checkers, diff tools, and DNA sequence alignment.",
    s1: "horse", s2: "ros",
    s1Label: "word1", s2Label: "word2",
    expectedResult: 3,
    code: [
      { id: 0,  text: `def minDistance(word1, word2):` },
      { id: 1,  text: `    m, n = len(word1), len(word2)` },
      { id: 2,  text: `    dp = [[0]*(n+1) for _ in range(m+1)]` },
      { id: 3,  text: `` },
      { id: 4,  text: `    for i in range(m+1): dp[i][0] = i` },
      { id: 5,  text: `    for j in range(n+1): dp[0][j] = j` },
      { id: 6,  text: `` },
      { id: 7,  text: `    for i in range(1, m+1):` },
      { id: 8,  text: `        for j in range(1, n+1):` },
      { id: 9,  text: `            if word1[i-1] == word2[j-1]:` },
      { id: 10, text: `                dp[i][j] = dp[i-1][j-1]` },
      { id: 11, text: `            else:` },
      { id: 12, text: `                dp[i][j] = 1 + min(` },
      { id: 13, text: `                    dp[i][j-1],   # insert` },
      { id: 14, text: `                    dp[i-1][j],   # delete` },
      { id: 15, text: `                    dp[i-1][j-1]) # replace` },
      { id: 16, text: `` },
      { id: 17, text: `    return dp[m][n]` },
    ],
    whenToUse: [
      "Transform one string into another with insert/delete/replace",
      "Two-string alignment with per-character cost model",
      "DNA sequence alignment (bioinformatics)",
      "Spell-check suggestion ranking by edit cost",
    ],
    complexity: { time: "O(m Ã— n)", space: "O(m Ã— n) â†’ O(n) with rolling array", note: "Three choices per cell: insert, delete, replace" },
    classics: [
      { name: "LC 72 â€” Edit Distance", diff: "Medium" },
      { name: "LC 583 â€” Delete Ops for Two Strings", diff: "Medium" },
      { name: "LC 712 â€” Min ASCII Delete Sum", diff: "Medium" },
      { name: "LC 97 â€” Interleaving String", diff: "Medium" },
      { name: "LC 10 â€” Regular Expression Matching", diff: "Hard" },
      { name: "LC 44 â€” Wildcard Matching", diff: "Hard" },
    ],
  },
  lcs: {
    title: "Longest Common Subseq",
    subtitle: "dp[i][j] = LCS length of s1[:i] and s2[:j]",
    coreIdea: "At each cell (i,j): if characters match, extend the LCS from dp[i-1][j-1] + 1. If they don't, carry forward the better of skipping either character â€” max(dp[i-1][j], dp[i][j-1]). The matrix reveals all subsequence relationships, and backtracking from dp[m][n] recovers the actual LCS string.",
    s1: "abcde", s2: "ace",
    s1Label: "text1", s2Label: "text2",
    expectedResult: 3,
    expectedLCS: "ace",
    code: [
      { id: 0,  text: `def longestCommonSubsequence(text1, text2):` },
      { id: 1,  text: `    m, n = len(text1), len(text2)` },
      { id: 2,  text: `    dp = [[0]*(n+1) for _ in range(m+1)]` },
      { id: 3,  text: `` },
      { id: 4,  text: `    for i in range(1, m+1):` },
      { id: 5,  text: `        for j in range(1, n+1):` },
      { id: 6,  text: `            if text1[i-1] == text2[j-1]:` },
      { id: 7,  text: `                dp[i][j] = dp[i-1][j-1] + 1` },
      { id: 8,  text: `            else:` },
      { id: 9,  text: `                dp[i][j] = max(` },
      { id: 10, text: `                    dp[i-1][j],` },
      { id: 11, text: `                    dp[i][j-1])` },
      { id: 12, text: `` },
      { id: 13, text: `    return dp[m][n]` },
    ],
    whenToUse: [
      "Find longest sequence common to both strings (not contiguous)",
      "Diff/patch algorithms â€” LCS of lines gives unchanged regions",
      "Version control merge conflict resolution",
      "Measuring string similarity (LCS ratio)",
    ],
    complexity: { time: "O(m Ã— n)", space: "O(m Ã— n) â†’ O(n) with rolling array", note: "Two choices when mismatch: skip from s1 or s2" },
    classics: [
      { name: "LC 1143 â€” Longest Common Subsequence", diff: "Medium" },
      { name: "LC 1035 â€” Uncrossed Lines", diff: "Medium" },
      { name: "LC 516 â€” Longest Palindromic Subseq", diff: "Medium" },
      { name: "LC 115 â€” Distinct Subsequences", diff: "Hard" },
      { name: "LC 1092 â€” Shortest Common Superseq", diff: "Hard" },
      { name: "LC 718 â€” Max Length Repeated Subarray", diff: "Medium" },
    ],
  },
};

/* â€”â€”â€” Build steps: Edit Distance â€”â€”â€” */
function buildEditSteps(prob) {
  const { s1, s2 } = prob;
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
  const op = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
  const steps = [];
  const finalized = new Set();

  const snap = () => dp.map(r => [...r]);
  const snapOp = () => op.map(r => [...r]);
  const k = (i, j) => `${i},${j}`;

  steps.push({
    title: "Initialize â€” Define Recurrence",
    detail: `Transform "${s1}" â†’ "${s2}". dp[i][j] = min ops to convert first i chars of word1 to first j chars of word2.`,
    dp: snap(), op: snapOp(), current: null, phase: "init", codeHL: [0, 1, 2],
    path: [], candidates: null, changedCell: null, finalized: new Set(finalized),
  });

  for (let j = 0; j <= n; j++) { dp[0][j] = j; op[0][j] = j === 0 ? "start" : "insert"; finalized.add(k(0, j)); }
  steps.push({
    title: "Base Case: First Row â€” Insert All",
    detail: `Converting "" to "${s2}".substring(0,j): need j insertions. dp[0][j] = j.`,
    dp: snap(), op: snapOp(), current: [0, n], phase: "base", codeHL: [4, 5],
    path: [], candidates: null, changedCell: null, finalized: new Set(finalized),
  });

  for (let i = 0; i <= m; i++) { dp[i][0] = i; op[i][0] = i === 0 ? "start" : "delete"; finalized.add(k(i, 0)); }
  steps.push({
    title: "Base Case: First Column â€” Delete All",
    detail: `Converting "${s1}".substring(0,i) to "": need i deletions. dp[i][0] = i.`,
    dp: snap(), op: snapOp(), current: [m, 0], phase: "base", codeHL: [4, 5],
    path: [], candidates: null, changedCell: null, finalized: new Set(finalized),
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        op[i][j] = "match";
        finalized.add(k(i, j));
        steps.push({
          title: `(${i},${j}): '${s1[i-1]}' == '${s2[j-1]}' â€” Match (free)`,
          detail: `Characters match. dp[${i}][${j}] = dp[${i-1}][${j-1}] = ${dp[i][j]}. Diagonal, cost 0.`,
          dp: snap(), op: snapOp(), current: [i, j], phase: "match", codeHL: [9, 10],
          path: [], candidates: null, changedCell: [i, j], finalized: new Set(finalized),
        });
      } else {
        const ins = dp[i][j - 1] + 1;
        const del = dp[i - 1][j] + 1;
        const rep = dp[i - 1][j - 1] + 1;
        dp[i][j] = Math.min(ins, del, rep);
        if (dp[i][j] === rep) op[i][j] = "replace";
        else if (dp[i][j] === ins) op[i][j] = "insert";
        else op[i][j] = "delete";
        finalized.add(k(i, j));

        steps.push({
          title: `(${i},${j}): '${s1[i-1]}' â‰  '${s2[j-1]}' â€” ${op[i][j]} = ${dp[i][j]}`,
          detail: `Insert(â†): ${dp[i][j-1]}+1=${ins}. Delete(â†‘): ${dp[i-1][j]}+1=${del}. Replace(â†–): ${dp[i-1][j-1]}+1=${rep}. Best: ${op[i][j]}.`,
          dp: snap(), op: snapOp(), current: [i, j], phase: "fill", codeHL: [12, 13, 14, 15],
          path: [], candidates: { ins, del, rep }, changedCell: [i, j], finalized: new Set(finalized),
        });
      }
    }
  }

  const path = [];
  let pi = m, pj = n;
  while (pi > 0 || pj > 0) {
    path.push([pi, pj, op[pi][pj]]);
    if (op[pi][pj] === "match" || op[pi][pj] === "replace") { pi--; pj--; }
    else if (op[pi][pj] === "insert") { pj--; }
    else { pi--; }
  }
  path.push([0, 0, "start"]);
  path.reverse();

  steps.push({
    title: `âœ“ Complete â€” Edit Distance = ${dp[m][n]}`,
    detail: `Minimum ${dp[m][n]} operations to transform "${s1}" â†’ "${s2}".`,
    dp: snap(), op: snapOp(), current: null, phase: "done", codeHL: [17],
    path, candidates: null, changedCell: null, finalized: new Set(finalized),
  });

  return steps;
}

/* â€”â€”â€” Build steps: LCS â€”â€”â€” */
function buildLCSSteps(prob) {
  const { s1, s2 } = prob;
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const op = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
  const steps = [];
  const finalized = new Set();

  const snap = () => dp.map(r => [...r]);
  const snapOp = () => op.map(r => [...r]);
  const k = (i, j) => `${i},${j}`;

  // Mark base cases
  for (let i = 0; i <= m; i++) { op[i][0] = "base"; finalized.add(k(i, 0)); }
  for (let j = 0; j <= n; j++) { op[0][j] = "base"; finalized.add(k(0, j)); }

  steps.push({
    title: "Initialize â€” Base Cases All Zero",
    detail: `"${s1}" vs "${s2}". dp[i][j] = LCS length of first i chars and first j chars. Row 0 and col 0 are 0 (empty string has LCS 0).`,
    dp: snap(), op: snapOp(), current: null, phase: "init", codeHL: [0, 1, 2],
    path: [], candidates: null, changedCell: null, finalized: new Set(finalized),
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        op[i][j] = "match";
        finalized.add(k(i, j));
        steps.push({
          title: `(${i},${j}): '${s1[i-1]}' == '${s2[j-1]}' â€” Match! +1`,
          detail: `Characters match. dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i-1][j-1]} + 1 = ${dp[i][j]}.`,
          dp: snap(), op: snapOp(), current: [i, j], phase: "match", codeHL: [6, 7],
          path: [], candidates: null, changedCell: [i, j], finalized: new Set(finalized),
        });
      } else {
        const up = dp[i - 1][j];
        const left = dp[i][j - 1];
        dp[i][j] = Math.max(up, left);
        op[i][j] = up >= left ? "skip-s1" : "skip-s2";
        finalized.add(k(i, j));
        steps.push({
          title: `(${i},${j}): '${s1[i-1]}' â‰  '${s2[j-1]}' â€” max(â†‘${up}, â†${left}) = ${dp[i][j]}`,
          detail: `Skip s1 char(â†‘): ${up}. Skip s2 char(â†): ${left}. Best: ${dp[i][j]}.`,
          dp: snap(), op: snapOp(), current: [i, j], phase: "fill", codeHL: [9, 10, 11],
          path: [], candidates: { up, left }, changedCell: [i, j], finalized: new Set(finalized),
        });
      }
    }
  }

  // Traceback to recover the LCS string
  const path = [];
  let pi = m, pj = n;
  const lcsChars = [];
  while (pi > 0 && pj > 0) {
    if (op[pi][pj] === "match") {
      lcsChars.push(s1[pi - 1]);
      path.push([pi, pj, "match"]);
      pi--; pj--;
    } else if (op[pi][pj] === "skip-s1") {
      path.push([pi, pj, "skip"]);
      pi--;
    } else {
      path.push([pi, pj, "skip"]);
      pj--;
    }
  }
  path.reverse();
  lcsChars.reverse();

  steps.push({
    title: `âœ“ Complete â€” LCS Length = ${dp[m][n]}`,
    detail: `LCS of "${s1}" and "${s2}" is "${lcsChars.join("")}" (length ${dp[m][n]}).`,
    dp: snap(), op: snapOp(), current: null, phase: "done", codeHL: [13],
    path, candidates: null, changedCell: null, finalized: new Set(finalized),
    lcsStr: lcsChars.join(""),
  });

  return steps;
}

function buildSteps(prob, key) {
  return key === "edit" ? buildEditSteps(prob) : buildLCSSteps(prob);
}

/* â€”â€”â€” Matrix SVG (shared, adapts to problem) â€”â€”â€” */
function MatrixView({ step, prob, exKey }) {
  const { s1, s2 } = prob;
  const m = s1.length, n = s2.length;
  const { dp, current, op, path } = step;
  const cellW = 46, cellH = 38, headerW = 34, headerH = 28;
  const pathSet = new Set((path || []).map(([r, c]) => `${r},${c}`));

  const arrow = (o) => {
    if (o === "match" || o === "replace") return "â†–";
    if (o === "insert" || o === "skip-s2") return "â†";
    if (o === "delete" || o === "skip-s1") return "â†‘";
    return "";
  };

  return (
    <svg viewBox={`0 0 ${headerW + (n + 1) * cellW + 6} ${headerH + (m + 1) * cellH + 6}`} className="w-full" style={{ maxHeight: 230 }}>
      {/* Column headers */}
      <text x={headerW + cellW / 2} y={headerH / 2 + 2} textAnchor="middle" dominantBaseline="central"
        fill="#71717a" fontSize="9" fontFamily="monospace">Îµ</text>
      {s2.split("").map((c, j) => (
        <text key={`ch-${j}`} x={headerW + (j + 1) * cellW + cellW / 2} y={headerH / 2 + 2} textAnchor="middle" dominantBaseline="central"
          fill={current && current[1] === j + 1 ? "#f59e0b" : "#a1a1aa"} fontSize="11" fontWeight="700" fontFamily="monospace">{c}</text>
      ))}
      {/* Row headers */}
      <text x={headerW / 2} y={headerH + cellH / 2 + 2} textAnchor="middle" dominantBaseline="central"
        fill="#71717a" fontSize="9" fontFamily="monospace">Îµ</text>
      {s1.split("").map((c, i) => (
        <text key={`rh-${i}`} x={headerW / 2} y={headerH + (i + 1) * cellH + cellH / 2 + 2} textAnchor="middle" dominantBaseline="central"
          fill={current && current[0] === i + 1 ? "#3b82f6" : "#a1a1aa"} fontSize="11" fontWeight="700" fontFamily="monospace">{c}</text>
      ))}

      {/* Cells */}
      {dp.map((row, i) =>
        row.map((val, j) => {
          const x = headerW + j * cellW;
          const y = headerH + i * cellH;
          const isCurr = current && current[0] === i && current[1] === j;
          const isPath = pathSet.has(`${i},${j}`) && step.phase === "done";
          const cellOp = op[i][j];

          let fill = "#18181b";
          if (isPath) fill = "#064e3b";
          else if (isCurr) fill = "#1e3a8a";
          else if (cellOp === "match") fill = "#14532d40";
          else if (val !== null && val !== undefined && cellOp) fill = "#1c1917";

          const stroke = isPath ? "#10b981" : isCurr ? "#3b82f6" : "#27272a";

          return (
            <g key={`c-${i}-${j}`}>
              <rect x={x + 1} y={y + 1} width={cellW - 2} height={cellH - 2}
                fill={fill} stroke={stroke} strokeWidth={isCurr || isPath ? 2 : 0.5} rx={4} />
              {val !== null && val !== undefined && cellOp && (
                <text x={x + cellW / 2} y={y + cellH / 2 + 1} textAnchor="middle" dominantBaseline="central"
                  fill={isPath ? "#a7f3d0" : isCurr ? "#93c5fd" : cellOp === "match" ? "#86efac" : "#a1a1aa"}
                  fontSize="12" fontWeight="700" fontFamily="monospace">{val}</text>
              )}
              {cellOp && cellOp !== "start" && cellOp !== "base" && val !== null && !isCurr && (
                <text x={x + 5} y={y + 10} fill={cellOp === "match" ? "#22c55e60" : "#71717a40"} fontSize="7">
                  {arrow(cellOp)}
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

/* â€”â€”â€” IO Panel: Edit Distance â€”â€”â€” */
function EditIOPanel({ step, prob }) {
  const { s1, s2, expectedResult } = prob;
  const m = s1.length, n = s2.length;
  const { phase, dp, finalized } = step;
  const done = phase === "done";
  const curVal = dp[m] ? dp[m][n] : null;
  const allMatch = done && curVal === expectedResult;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">word1</span> = "<span className="text-zinc-300">{s1}</span>"</div>
          <div><span className="text-zinc-500">word2</span> = "<span className="text-zinc-300">{s2}</span>"</div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs">
          <span className="text-zinc-500">min_ops = </span><span className="text-zinc-300">{expectedResult}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-xs">
          <span className="text-zinc-500">dp[{m}][{n}] = </span>
          <span className={done ? "text-emerald-300 font-bold" : curVal !== null ? "text-blue-300" : "text-zinc-600"}>
            {curVal !== null && curVal !== undefined ? curVal : "?"}
          </span>
        </div>
        <div className="mt-1.5 text-[10px] text-zinc-600">
          {finalized.size}/{(m + 1) * (n + 1)} cells filled
        </div>
        {done && step.path && (
          <div className="mt-2 space-y-0.5">
            {step.path.filter(([,, o]) => o !== "start").map(([r, c, o], i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className={`w-14 ${o === "match" ? "text-emerald-400" : "text-amber-400"}`}>{o}</span>
                <span className="text-zinc-600">
                  {o === "match" ? `'${s1[r - 1]}'='${s2[c - 1]}'` :
                   o === "replace" ? `'${s1[r - 1]}'â†’'${s2[c - 1]}'` :
                   o === "insert" ? `+' ${s2[c - 1]}'` :
                   `-'${s1[r - 1]}'`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* â€”â€”â€” IO Panel: LCS â€”â€”â€” */
function LCSIOPanel({ step, prob }) {
  const { s1, s2, expectedResult, expectedLCS } = prob;
  const m = s1.length, n = s2.length;
  const { phase, dp, finalized } = step;
  const done = phase === "done";
  const curVal = dp[m] ? dp[m][n] : null;
  const allMatch = done && curVal === expectedResult;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">text1</span> = "<span className="text-zinc-300">{s1}</span>"</div>
          <div><span className="text-zinc-500">text2</span> = "<span className="text-zinc-300">{s2}</span>"</div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs">
          <span className="text-zinc-500">lcs_len = </span><span className="text-zinc-300">{expectedResult}</span>
        </div>
        <div className="font-mono text-[10px] mt-1">
          <span className="text-zinc-600">lcs = "{expectedLCS}"</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {allMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-xs">
          <span className="text-zinc-500">dp[{m}][{n}] = </span>
          <span className={done ? "text-emerald-300 font-bold" : curVal !== null ? "text-blue-300" : "text-zinc-600"}>
            {curVal !== null && curVal !== undefined ? curVal : "?"}
          </span>
        </div>
        <div className="mt-1.5 text-[10px] text-zinc-600">
          {finalized.size}/{(m + 1) * (n + 1)} cells filled
        </div>
        {done && step.lcsStr && (
          <div className="mt-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="text-zinc-500">lcs =</span>
              <span className="text-emerald-300 font-bold">"{step.lcsStr}"</span>
              <span className="text-emerald-600">âœ“</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* â€”â€”â€” State panels: Edit Distance â€”â€”â€” */
function EditState({ step, prob }) {
  const { s1, s2 } = prob;
  return (
    <>
      {step.candidates && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Three Choices</div>
          <div className="flex gap-2 justify-center">
            {[
              { label: "Insert â†", val: step.candidates.ins, key: "ins" },
              { label: "Delete â†‘", val: step.candidates.del, key: "del" },
              { label: "Replace â†–", val: step.candidates.rep, key: "rep" },
            ].map((c) => {
              const best = c.val === Math.min(step.candidates.ins, step.candidates.del, step.candidates.rep);
              const chosen = best && step.dp[step.current[0]][step.current[1]] === c.val;
              return (
                <div key={c.key} className={`flex-1 text-center p-2 rounded-xl border ${chosen ? "bg-blue-950/50 border-blue-800" : "border-zinc-800"}`}>
                  <div className="text-[10px] text-zinc-500 mb-0.5">{c.label}</div>
                  <div className={`text-lg font-bold font-mono ${chosen ? "text-blue-300" : "text-zinc-600"}`}>{c.val}</div>
                  {chosen && <div className="text-[8px] text-blue-500 mt-0.5">â† best</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step.phase === "done" && step.path && (
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Operation Sequence</div>
          <div className="space-y-0.5 font-mono text-[10px]">
            {step.path.filter(([,, o]) => o !== "start").map(([r, c, o], i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-14 ${o === "match" ? "text-emerald-400" : "text-amber-400"}`}>{o}</span>
                <span className="text-zinc-500">
                  {o === "match" ? `'${s1[r - 1]}' = '${s2[c - 1]}'` :
                   o === "replace" ? `'${s1[r - 1]}' â†’ '${s2[c - 1]}'` :
                   o === "insert" ? `insert '${s2[c - 1]}'` :
                   `delete '${s1[r - 1]}'`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* â€”â€”â€” State panels: LCS â€”â€”â€” */
function LCSState({ step }) {
  return (
    <>
      {step.candidates && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Two Choices</div>
          <div className="flex gap-3 justify-center">
            <div className={`flex-1 text-center p-2.5 rounded-xl border ${step.candidates.up >= step.candidates.left ? "bg-blue-950/50 border-blue-800" : "border-zinc-800"}`}>
              <div className="text-[10px] text-blue-400 mb-1">Skip s1 (â†‘)</div>
              <div className={`text-xl font-bold font-mono ${step.candidates.up >= step.candidates.left ? "text-blue-300" : "text-zinc-600"}`}>{step.candidates.up}</div>
            </div>
            <div className="flex items-center text-zinc-600 font-bold text-sm">vs</div>
            <div className={`flex-1 text-center p-2.5 rounded-xl border ${step.candidates.left > step.candidates.up ? "bg-amber-950/50 border-amber-800" : "border-zinc-800"}`}>
              <div className="text-[10px] text-amber-400 mb-1">Skip s2 (â†)</div>
              <div className={`text-xl font-bold font-mono ${step.candidates.left > step.candidates.up ? "text-amber-300" : "text-zinc-600"}`}>{step.candidates.left}</div>
            </div>
          </div>
        </div>
      )}

      {step.phase === "done" && step.lcsStr && (
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Recovered LCS</div>
          <div className="flex gap-1 font-mono text-sm">
            {step.lcsStr.split("").map((c, i) => (
              <span key={i} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">{c}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* â€”â€”â€” Code Panel â€”â€”â€” */
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

/* â€”â€”â€” Navigation Bar (with slider for many steps) â€”â€”â€” */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">â† Prev</button>
      <div className="flex gap-1.5 items-center">
        {total <= 25
          ? Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => setSi(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === si ? "bg-blue-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`} />
            ))
          : <>
              <button onClick={() => setSi(0)} className={`px-2 py-0.5 text-xs rounded ${si === 0 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>1</button>
              <input type="range" min={0} max={total - 1} value={si} onChange={(e) => setSi(Number(e.target.value))} className="w-36 accent-blue-500" />
              <span className="text-xs text-zinc-500 font-mono w-12 text-center">{si + 1}/{total}</span>
              <button onClick={() => setSi(total - 1)} className={`px-2 py-0.5 text-xs rounded ${si >= total - 1 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>{total}</button>
            </>
        }
      </div>
      <button onClick={() => setSi(Math.min(total - 1, si + 1))} disabled={si >= total - 1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">Next â†’</button>
    </div>
  );
}

/* â€”â€”â€” Main Component â€”â€”â€” */
export default function DP2DViz() {
  const [exKey, setExKey] = useState("edit");
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
            <h1 className="text-2xl font-bold tracking-tight">2D Dynamic Programming</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{prob.title} â€¢ {prob.subtitle}</p>
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

          {/* â€”â€” COL 1: IO + Matrix â€”â€” */}
          <div className="col-span-3 space-y-3">
            {exKey === "edit"
              ? <EditIOPanel step={step} prob={prob} />
              : <LCSIOPanel step={step} prob={prob} />}

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">Îµ = empty â€¢ â†– diag â€¢ â† left â€¢ â†‘ up</div>
              <MatrixView step={step} prob={prob} exKey={exKey} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-800 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-900 inline-block" />Match</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-700 inline-block" />Path</span>
              </div>
            </div>
          </div>

          {/* â€”â€” COL 2: Steps + State â€”â€” */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "match" ? "bg-green-950/20 border-green-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "match" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "fill" ? "bg-blue-900 text-blue-300" :
                  step.phase === "base" ? "bg-teal-900 text-teal-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Current cell highlight */}
            {step.current && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Current Cell</div>
                <div className="flex gap-4 items-center">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[10px] text-zinc-600">i={step.current[0]}</span>
                    <span className="font-mono text-blue-300 font-bold text-sm">
                      {step.current[0] > 0 ? `'${prob.s1[step.current[0] - 1]}'` : "Îµ"}
                    </span>
                  </div>
                  <span className="text-zinc-700">Ã—</span>
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[10px] text-zinc-600">j={step.current[1]}</span>
                    <span className="font-mono text-amber-300 font-bold text-sm">
                      {step.current[1] > 0 ? `'${prob.s2[step.current[1] - 1]}'` : "Îµ"}
                    </span>
                  </div>
                  <span className="ml-auto font-mono text-lg font-bold text-zinc-300">
                    = {step.dp[step.current[0]][step.current[1]]}
                  </span>
                </div>
              </div>
            )}

            {exKey === "edit"
              ? <EditState step={step} prob={prob} />
              : <LCSState step={step} />}
          </div>

          {/* â€”â€” COL 3: Code â€”â€” */}
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
                <li key={i} className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>{text}</li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> {prob.complexity.time}</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> {prob.complexity.space}</div>
                <div><span className="text-zinc-500 font-semibold">Key:</span> {prob.complexity.note}</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              {prob.classics.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-amber-500/60">â€¢</span>
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
