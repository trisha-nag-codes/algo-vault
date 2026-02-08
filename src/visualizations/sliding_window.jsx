import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   SLIDING WINDOW — Multi-Problem Visualizer
   Patterns: Variable+Set · Variable+HashMap · Fixed+Deque
   ═══════════════════════════════════════════════════════════ */

/* ——— Problem Definitions ——— */
const PROBLEMS = {
  longestSubstr: {
    title: "Longest Substring Without Repeating Characters",
    lc: "LC 3", difficulty: "Medium",
    patternTag: "Variable Window + HashSet",
    coreIdea: "Maintain a window [left, right] of unique characters using a HashSet. Expand right to include new characters. When a duplicate is found, shrink from left until the duplicate is removed. Track the maximum window size seen — this is the answer. Each character enters and leaves the set at most once, giving O(n) time.",
    input: { s: "abcabcbb" },
    expected: { value: 3, detail: 'window "abc" (indices 0–2)' },
  },
  minWindow: {
    title: "Minimum Window Substring",
    lc: "LC 76", difficulty: "Hard",
    patternTag: "Variable Window + HashMap",
    coreIdea: "Expand right to collect characters until the window contains all characters of t (tracked via a frequency map and a 'missing' counter). Once valid, shrink from left to find the smallest valid window, recording the best. Each shrink may invalidate the window, prompting more expansion. O(n) total — each pointer moves at most n times.",
    input: { s: "ADOBECODEBANC", t: "ABC" },
    expected: { value: "BANC", detail: "indices 9–12, length 4" },
  },
  maxSliding: {
    title: "Sliding Window Maximum",
    lc: "LC 239", difficulty: "Hard",
    patternTag: "Fixed Window + Monotonic Deque",
    coreIdea: "Use a monotonic decreasing deque storing indices. For each new element: (1) remove front if outside window, (2) pop back while ≤ current (they can never be the max), (3) append current index. The front of the deque is always the maximum of the current window. Output starts once window reaches size k. O(n) — each index enters/leaves deque once.",
    input: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
    expected: { value: [3, 3, 5, 5, 6, 7], detail: "6 windows of size 3" },
  },
};

/* ——— Code for each problem ——— */
const CODES = {
  longestSubstr: [
    { id: 0,  text: `def lengthOfLongestSubstring(s):` },
    { id: 1,  text: `    seen = set()` },
    { id: 2,  text: `    left = ans = 0` },
    { id: 3,  text: `` },
    { id: 4,  text: `    for right in range(len(s)):` },
    { id: 5,  text: `        while s[right] in seen:` },
    { id: 6,  text: `            seen.remove(s[left])` },
    { id: 7,  text: `            left += 1` },
    { id: 8,  text: `        seen.add(s[right])` },
    { id: 9,  text: `        ans = max(ans, right-left+1)` },
    { id: 10, text: `` },
    { id: 11, text: `    return ans` },
  ],
  minWindow: [
    { id: 0,  text: `from collections import Counter` },
    { id: 1,  text: `` },
    { id: 2,  text: `def minWindow(s, t):` },
    { id: 3,  text: `    need = Counter(t)` },
    { id: 4,  text: `    missing = len(t)` },
    { id: 5,  text: `    left = start = end = 0` },
    { id: 6,  text: `` },
    { id: 7,  text: `    for right, c in enumerate(s, 1):` },
    { id: 8,  text: `        if need[c] > 0:` },
    { id: 9,  text: `            missing -= 1` },
    { id: 10, text: `        need[c] -= 1` },
    { id: 11, text: `` },
    { id: 12, text: `        if missing == 0:` },
    { id: 13, text: `            while need[s[left]] < 0:` },
    { id: 14, text: `                need[s[left]] += 1` },
    { id: 15, text: `                left += 1` },
    { id: 16, text: `            if not end or right-left < end-start:` },
    { id: 17, text: `                start, end = left, right` },
    { id: 18, text: `            need[s[left]] += 1` },
    { id: 19, text: `            missing += 1` },
    { id: 20, text: `            left += 1` },
    { id: 21, text: `` },
    { id: 22, text: `    return s[start:end]` },
  ],
  maxSliding: [
    { id: 0,  text: `from collections import deque` },
    { id: 1,  text: `` },
    { id: 2,  text: `def maxSlidingWindow(nums, k):` },
    { id: 3,  text: `    dq = deque()  # indices` },
    { id: 4,  text: `    result = []` },
    { id: 5,  text: `` },
    { id: 6,  text: `    for i, num in enumerate(nums):` },
    { id: 7,  text: `        while dq and dq[0] < i-k+1:` },
    { id: 8,  text: `            dq.popleft()` },
    { id: 9,  text: `        while dq and nums[dq[-1]] <= num:` },
    { id: 10, text: `            dq.pop()` },
    { id: 11, text: `        dq.append(i)` },
    { id: 12, text: `` },
    { id: 13, text: `        if i >= k - 1:` },
    { id: 14, text: `            result.append(nums[dq[0]])` },
    { id: 15, text: `` },
    { id: 16, text: `    return result` },
  ],
};

/* ═══ Build Steps — LC 3 ═══ */
function buildLongestSubstr() {
  const s = "abcabcbb";
  const steps = [];
  const seen = new Set();
  let left = 0, ans = 0, bestL = 0, bestR = -1;

  steps.push({
    title: "Initialize — Empty Window",
    detail: `s = "${s}". Set left=0, ans=0. seen = {}.`,
    left: 0, right: -1, ans: 0, seen: new Set(),
    phase: "init", codeHL: [0, 1, 2],
    bestWindow: null, finalized: [],
    shrinkFrom: null, duplicate: null,
  });

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    let shrunk = false;
    let shrinkStart = left;
    const removed = [];

    while (seen.has(ch)) {
      removed.push(s[left]);
      seen.delete(s[left]);
      left++;
      shrunk = true;
    }
    seen.add(ch);
    const windowLen = right - left + 1;
    const improved = windowLen > ans;
    if (improved) { ans = windowLen; bestL = left; bestR = right; }

    steps.push({
      title: shrunk
        ? `right=${right} '${ch}': Duplicate! Shrink left ${shrinkStart}→${left}, then add '${ch}'`
        : `right=${right} '${ch}': Unique — Expand Window`,
      detail: shrunk
        ? `'${ch}' was in seen. Removed [${removed.map(c => `'${c}'`).join(", ")}], left→${left}. Window "${s.slice(left, right + 1)}" len=${windowLen}.${improved ? ` New best ans=${ans}.` : ` ans stays ${ans}.`}`
        : `'${ch}' not in seen. Add it. Window "${s.slice(left, right + 1)}" len=${windowLen}.${improved ? ` New best ans=${ans}.` : ` ans stays ${ans}.`}`,
      left, right, ans,
      seen: new Set(seen),
      phase: shrunk ? "shrink" : "expand",
      codeHL: shrunk ? [4, 5, 6, 7, 8, 9] : [4, 8, 9],
      bestWindow: ans > 0 ? { l: bestL, r: bestR } : null,
      finalized: [],
      shrinkFrom: shrunk ? shrinkStart : null,
      duplicate: shrunk ? ch : null,
    });
  }

  steps.push({
    title: `✓ Complete — Longest Substring Length = ${ans}`,
    detail: `Best window "${s.slice(bestL, bestR + 1)}" at indices ${bestL}–${bestR}. Each char entered/left the set at most once → O(n).`,
    left, right: s.length - 1, ans,
    seen: new Set(seen),
    phase: "done", codeHL: [11],
    bestWindow: { l: bestL, r: bestR },
    finalized: Array.from({ length: s.length }, (_, i) => i),
    shrinkFrom: null, duplicate: null,
  });

  return steps;
}

/* ═══ Build Steps — LC 76 ═══ */
function buildMinWindow() {
  const s = "ADOBECODEBANC";
  const t = "ABC";
  const steps = [];

  const need = {};
  for (const c of t) need[c] = (need[c] || 0) + 1;
  let missing = t.length;
  let left = 0, start = 0, end = 0;

  steps.push({
    title: `Initialize — need=${JSON.stringify(need)}, missing=${missing}`,
    detail: `s = "${s}", t = "${t}". Track needed chars. Expand right until all found.`,
    left: 0, right: -1, missing, start: 0, end: 0,
    need: { ...need }, phase: "init", codeHL: [2, 3, 4, 5],
    bestWindow: null, valid: false, finalized: [],
    windowStr: "",
  });

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if ((need[c] || 0) > 0) missing--;
    need[c] = (need[c] || 0) - 1;

    if (missing === 0) {
      // Shrink
      while (need[s[left]] < 0) {
        need[s[left]]++;
        left++;
      }
      if (!end || (right + 1) - left < end - start) {
        start = left;
        end = right + 1;
      }

      steps.push({
        title: `right=${right} '${c}': Window Valid! Shrink → best="${s.slice(start, end)}"`,
        detail: `missing=0 → all chars found. Shrink left to ${left}. Window "${s.slice(left, right + 1)}" len=${right + 1 - left}. Best so far: "${s.slice(start, end)}" (${start}–${end - 1}).`,
        left, right, missing: 0, start, end,
        need: { ...need }, phase: "valid", codeHL: [7, 8, 9, 10, 12, 13, 14, 15, 16, 17],
        bestWindow: { l: start, r: end - 1 },
        valid: true, finalized: [],
        windowStr: s.slice(left, right + 1),
      });

      // Invalidate for next iteration
      need[s[left]]++;
      missing++;
      left++;
    } else {
      steps.push({
        title: `right=${right} '${c}': Expand — missing=${missing}`,
        detail: `Added '${c}'. Still need ${missing} more char(s) from t. Window "${s.slice(left, right + 1)}".`,
        left, right, missing, start, end,
        need: { ...need }, phase: "expand", codeHL: [7, 8, 9, 10],
        bestWindow: end > 0 ? { l: start, r: end - 1 } : null,
        valid: false, finalized: [],
        windowStr: s.slice(left, right + 1),
      });
    }
  }

  steps.push({
    title: `✓ Complete — Minimum Window = "${s.slice(start, end)}"`,
    detail: `Smallest window containing all of "${t}" is "${s.slice(start, end)}" at indices ${start}–${end - 1}, length ${end - start}. O(n) — each pointer traverses s once.`,
    left: start, right: end - 1, missing: 0, start, end,
    need: { ...need }, phase: "done", codeHL: [22],
    bestWindow: { l: start, r: end - 1 },
    valid: true,
    finalized: Array.from({ length: s.length }, (_, i) => i),
    windowStr: s.slice(start, end),
  });

  return steps;
}

/* ═══ Build Steps — LC 239 ═══ */
function buildMaxSliding() {
  const nums = [1, 3, -1, -3, 5, 3, 6, 7];
  const k = 3;
  const steps = [];
  const dq = []; // indices
  const result = [];

  steps.push({
    title: `Initialize — k=${k}, deque=[], result=[]`,
    detail: `nums = [${nums.join(", ")}]. Monotonic decreasing deque stores indices. Output starts at i=${k - 1}.`,
    currentIdx: -1, dq: [], result: [],
    windowLeft: 0, windowRight: -1,
    phase: "init", codeHL: [2, 3, 4],
    poppedFront: false, poppedBack: [], finalized: [],
  });

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    let poppedFront = false;
    const poppedBack = [];

    // Remove front if outside window
    if (dq.length && dq[0] < i - k + 1) {
      dq.shift();
      poppedFront = true;
    }

    // Pop back while <= current
    while (dq.length && nums[dq[dq.length - 1]] <= num) {
      poppedBack.push(dq.pop());
    }
    dq.push(i);

    const wLeft = Math.max(0, i - k + 1);
    const wRight = i;

    if (i >= k - 1) {
      result.push(nums[dq[0]]);

      steps.push({
        title: `i=${i} num=${num}: Window [${wLeft}..${wRight}] → max=${nums[dq[0]]}`,
        detail: `${poppedFront ? `Front ${dq[0] !== undefined ? "" : ""}popped (outside window). ` : ""}${poppedBack.length ? `Popped back [${poppedBack.map(j => `${j}:${nums[j]}`).join(", ")}] (≤${num}). ` : ""}Append idx ${i}. Deque front → max=${nums[dq[0]]}. result=[${result.join(", ")}].`,
        currentIdx: i, dq: [...dq], result: [...result],
        windowLeft: wLeft, windowRight: wRight,
        phase: "output", codeHL: [6, 7, 8, 9, 10, 11, 13, 14],
        poppedFront, poppedBack: [...poppedBack], finalized: [],
      });
    } else {
      steps.push({
        title: `i=${i} num=${num}: Building Window (${i + 1}/${k})`,
        detail: `${poppedBack.length ? `Popped back [${poppedBack.map(j => `${j}:${nums[j]}`).join(", ")}] (≤${num}). ` : ""}Append idx ${i}. Deque=[${dq.map(j => `${j}:${nums[j]}`).join(", ")}]. Window not yet size k.`,
        currentIdx: i, dq: [...dq], result: [...result],
        windowLeft: 0, windowRight: i,
        phase: "build", codeHL: [6, 7, 8, 9, 10, 11],
        poppedFront, poppedBack: [...poppedBack], finalized: [],
      });
    }
  }

  steps.push({
    title: `✓ Complete — result = [${result.join(", ")}]`,
    detail: `Processed all ${nums.length} elements. ${result.length} windows of size ${k}. Each index entered/left deque at most once → O(n).`,
    currentIdx: nums.length - 1, dq: [...dq], result: [...result],
    windowLeft: nums.length - k, windowRight: nums.length - 1,
    phase: "done", codeHL: [16],
    poppedFront: false, poppedBack: [], finalized: Array.from({ length: nums.length }, (_, i) => i),
  });

  return steps;
}

const BUILDERS = {
  longestSubstr: buildLongestSubstr,
  minWindow: buildMinWindow,
  maxSliding: buildMaxSliding,
};

/* ═══ Array Visualization SVG ═══ */
function ArrayView({ step, probKey }) {
  if (probKey === "longestSubstr") return <ArrayViewSubstr step={step} />;
  if (probKey === "minWindow") return <ArrayViewMinWin step={step} />;
  return <ArrayViewMaxSlide step={step} />;
}

function ArrayViewSubstr({ step }) {
  const s = "abcabcbb";
  const cellW = 48, cellH = 44, pad = 4;
  const w = s.length * cellW + pad * 2;
  const h = cellH + 36;
  const { left, right, seen, bestWindow, phase } = step;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 130 }}>
      {/* Window highlight */}
      {right >= 0 && left <= right && (
        <rect x={left * cellW + pad} y={12} width={(right - left + 1) * cellW} height={cellH}
          fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={2} rx={6} />
      )}
      {/* Best window underline */}
      {bestWindow && phase === "done" && (
        <rect x={bestWindow.l * cellW + pad + 2} y={cellH + 16}
          width={(bestWindow.r - bestWindow.l + 1) * cellW - 4} height={3}
          fill="#10b981" rx={1.5} />
      )}
      {Array.from(s).map((ch, i) => {
        const x = i * cellW + pad;
        const isCurr = i === right && phase !== "done" && phase !== "init";
        const inWindow = i >= left && i <= right && right >= 0;
        const inSeen = seen && seen.has(ch) && inWindow;
        const isBest = bestWindow && i >= bestWindow.l && i <= bestWindow.r && phase === "done";

        let fill = "#18181b";
        if (isBest) fill = "#064e3b";
        else if (isCurr) fill = "#4338ca";
        else if (inWindow) fill = "#1e1b4b";

        let stroke = "#27272a";
        if (isCurr) stroke = "#818cf8";
        else if (isBest) stroke = "#10b981";
        else if (inWindow) stroke = "#4338ca";

        return (
          <g key={i}>
            <rect x={x + 1} y={13} width={cellW - 2} height={cellH - 2}
              fill={fill} stroke={stroke} strokeWidth={isCurr ? 2.5 : 1} rx={5} />
            <text x={x + cellW / 2} y={13 + cellH / 2}
              textAnchor="middle" dominantBaseline="central"
              fill={isBest ? "#34d399" : isCurr ? "#a5b4fc" : inWindow ? "#c7d2fe" : "#71717a"}
              fontSize="16" fontWeight="700" fontFamily="monospace">{ch}</text>
            <text x={x + cellW / 2} y={cellH + 26}
              textAnchor="middle" fill="#52525b" fontSize="10" fontFamily="monospace">{i}</text>
            {/* Dot below if in seen */}
            {inSeen && !isBest && (
              <circle cx={x + cellW / 2} cy={8} r={2.5} fill="#818cf8" />
            )}
          </g>
        );
      })}
      {/* Pointer labels */}
      {right >= 0 && phase !== "done" && phase !== "init" && (
        <>
          <text x={left * cellW + pad + cellW / 2} y={8}
            textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="700" fontFamily="monospace">L</text>
          <text x={right * cellW + pad + cellW / 2} y={cellH + 26}
            textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="700" fontFamily="monospace">R</text>
        </>
      )}
    </svg>
  );
}

function ArrayViewMinWin({ step }) {
  const s = "ADOBECODEBANC";
  const cellW = 36, cellH = 40, pad = 4;
  const w = s.length * cellW + pad * 2;
  const h = cellH + 36;
  const { left, right, bestWindow, phase, valid } = step;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 130 }}>
      {/* Window highlight */}
      {right >= 0 && left <= right && (
        <rect x={left * cellW + pad} y={12} width={(right - left + 1) * cellW} height={cellH}
          fill={valid ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)"}
          stroke={valid ? "#10b981" : "#6366f1"} strokeWidth={2} rx={6} />
      )}
      {/* Best window highlight */}
      {bestWindow && (
        <rect x={bestWindow.l * cellW + pad + 1} y={cellH + 16}
          width={(bestWindow.r - bestWindow.l + 1) * cellW - 2} height={3}
          fill="#f59e0b" rx={1.5} />
      )}
      {Array.from(s).map((ch, i) => {
        const x = i * cellW + pad;
        const isCurr = i === right && phase !== "done" && phase !== "init";
        const inWindow = i >= left && i <= right && right >= 0;
        const isBest = bestWindow && i >= bestWindow.l && i <= bestWindow.r;
        const isTarget = "ABC".includes(ch);

        let fill = "#18181b";
        if (phase === "done" && isBest) fill = "#064e3b";
        else if (isCurr) fill = valid ? "#064e3b" : "#1e1b4b";
        else if (inWindow) fill = valid ? "#022c22" : "#1e1b4b";

        let stroke = "#27272a";
        if (isCurr) stroke = valid ? "#10b981" : "#818cf8";
        else if (inWindow && valid) stroke = "#047857";
        else if (inWindow) stroke = "#4338ca";

        return (
          <g key={i}>
            <rect x={x + 1} y={13} width={cellW - 2} height={cellH - 2}
              fill={fill} stroke={stroke} strokeWidth={isCurr ? 2.5 : 1} rx={4} />
            <text x={x + cellW / 2} y={13 + cellH / 2}
              textAnchor="middle" dominantBaseline="central"
              fill={phase === "done" && isBest ? "#34d399" : isTarget && inWindow ? "#fbbf24" : inWindow ? "#c7d2fe" : "#52525b"}
              fontSize="13" fontWeight="700" fontFamily="monospace">{ch}</text>
            <text x={x + cellW / 2} y={cellH + 26}
              textAnchor="middle" fill="#3f3f46" fontSize="9" fontFamily="monospace">{i}</text>
          </g>
        );
      })}
      {right >= 0 && phase !== "done" && phase !== "init" && (
        <>
          <text x={left * cellW + pad + cellW / 2} y={8}
            textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="700" fontFamily="monospace">L</text>
          <text x={right * cellW + pad + cellW / 2} y={cellH + 26}
            textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="700" fontFamily="monospace">R</text>
        </>
      )}
    </svg>
  );
}

function ArrayViewMaxSlide({ step }) {
  const nums = [1, 3, -1, -3, 5, 3, 6, 7];
  const cellW = 52, cellH = 44, pad = 4;
  const w = nums.length * cellW + pad * 2;
  const h = cellH + 36;
  const { currentIdx, dq, windowLeft, windowRight, phase } = step;
  const dqSet = new Set(dq);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 130 }}>
      {/* Window highlight */}
      {windowRight >= 0 && (
        <rect x={windowLeft * cellW + pad} y={12}
          width={(windowRight - windowLeft + 1) * cellW} height={cellH}
          fill={phase === "output" || phase === "done" ? "rgba(16,185,129,0.08)" : "rgba(99,102,241,0.08)"}
          stroke={phase === "output" || phase === "done" ? "#059669" : "#6366f1"}
          strokeWidth={2} rx={6} />
      )}
      {nums.map((num, i) => {
        const x = i * cellW + pad;
        const isCurr = i === currentIdx && phase !== "done" && phase !== "init";
        const inWindow = i >= windowLeft && i <= windowRight;
        const inDq = dqSet.has(i);
        const isMax = dq.length > 0 && dq[0] === i && (phase === "output" || phase === "done");

        let fill = "#18181b";
        if (isMax) fill = "#7c2d12";
        else if (isCurr) fill = "#4338ca";
        else if (inDq && inWindow) fill = "#1e1b4b";
        else if (inWindow) fill = "#18181b";

        let stroke = "#27272a";
        if (isMax) stroke = "#f97316";
        else if (isCurr) stroke = "#818cf8";
        else if (inDq) stroke = "#4338ca";

        return (
          <g key={i}>
            <rect x={x + 1} y={13} width={cellW - 2} height={cellH - 2}
              fill={fill} stroke={stroke} strokeWidth={isMax || isCurr ? 2.5 : 1} rx={5} />
            <text x={x + cellW / 2} y={13 + cellH / 2}
              textAnchor="middle" dominantBaseline="central"
              fill={isMax ? "#fb923c" : isCurr ? "#a5b4fc" : inDq ? "#c7d2fe" : "#52525b"}
              fontSize="15" fontWeight="700" fontFamily="monospace">{num}</text>
            <text x={x + cellW / 2} y={cellH + 26}
              textAnchor="middle" fill="#3f3f46" fontSize="10" fontFamily="monospace">{i}</text>
            {inDq && !isMax && (
              <circle cx={x + cellW / 2} cy={8} r={2.5} fill="#818cf8" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══ IO Panel ═══ */
function IOPanel({ step, probKey }) {
  const prob = PROBLEMS[probKey];
  if (probKey === "longestSubstr") return <IOLongest step={step} prob={prob} />;
  if (probKey === "minWindow") return <IOMinWin step={step} prob={prob} />;
  return <IOMaxSlide step={step} prob={prob} />;
}

function IOLongest({ step, prob }) {
  const done = step.phase === "done";
  const match = done && step.ans === prob.expected.value;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">s</span> = <span className="text-zinc-300">"{prob.input.s}"</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">ans</span> = <span className="text-zinc-300">{prob.expected.value}</span>
          <span className="text-zinc-600 text-[10px] ml-2">{prob.expected.detail}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {match && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div>
            <span className="text-zinc-500">ans  </span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{step.ans}</span>
          </div>
          <div>
            <span className="text-zinc-500">seen </span> = <span className="text-zinc-400">{`{${[...step.seen].map(c => `'${c}'`).join(", ")}}`}</span>
          </div>
          <div>
            <span className="text-zinc-500">window</span> = <span className="text-indigo-400">
              [{step.left}, {step.right >= 0 ? step.right : "—"}]</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IOMinWin({ step, prob }) {
  const done = step.phase === "done";
  const bestStr = step.bestWindow ? prob.input.s.slice(step.bestWindow.l, step.bestWindow.r + 1) : "—";
  const match = done && bestStr === prob.expected.value;
  const tChars = "ABC";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">s</span> = <span className="text-zinc-300">"{prob.input.s}"</span></div>
          <div><span className="text-zinc-500">t</span> = <span className="text-amber-400">"{prob.input.t}"</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-300">"{prob.expected.value}"</span>
          <span className="text-zinc-600 text-[10px] ml-2">{prob.expected.detail}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {match && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div>
            <span className="text-zinc-500">best  </span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>"{bestStr}"</span>
          </div>
          <div>
            <span className="text-zinc-500">missing</span> = <span className="text-zinc-300">{step.missing}</span>
          </div>
          <div>
            <span className="text-zinc-500">need  </span> = <span className="text-zinc-400">
              {`{${tChars.split("").map(c => `${c}:${step.need[c] || 0}`).join(", ")}}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IOMaxSlide({ step, prob }) {
  const done = step.phase === "done";
  const exp = prob.expected.value;
  const match = done && step.result.length === exp.length && step.result.every((v, i) => v === exp[i]);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">nums</span> = <span className="text-zinc-300">[{prob.input.nums.join(", ")}]</span></div>
          <div><span className="text-zinc-500">k   </span> = <span className="text-blue-400">{prob.input.k}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-300">[{exp.join(", ")}]</span>
          <span className="text-zinc-600 text-[10px] ml-2">{prob.expected.detail}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {match && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div>
            <span className="text-zinc-500">result</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>
              [{step.result.map((v, i) => {
                const matches = v === exp[i];
                return <span key={i}><span className={matches && done ? "text-emerald-300" : "text-zinc-300"}>{v}</span>{i < step.result.length - 1 ? ", " : ""}</span>;
              })}
              {step.result.length < exp.length && <span className="text-zinc-700">{step.result.length > 0 ? ", " : ""}{"?, ".repeat(exp.length - step.result.length - 1)}?</span>}]
            </span>
          </div>
          <div>
            <span className="text-zinc-500">deque </span> = <span className="text-zinc-400">
              [{step.dq.map(j => `${j}`).join(", ")}]
            </span>
            <span className="text-zinc-600 text-[10px] ml-1">
              (vals: [{step.dq.map(j => prob.input.nums[j]).join(", ")}])
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Code Panel ═══ */
function CodePanel({ highlightLines, probKey }) {
  const code = CODES[probKey];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {code.map((line) => {
          const hl = highlightLines.includes(line.id);
          return (
            <div key={line.id}
              className={`px-2 rounded-sm ${hl ? "bg-blue-500/15 text-blue-300" : line.text === "" ? "" : "text-zinc-500"}`}>
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
      <button onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">← Prev</button>
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

/* ═══ State Panel (problem-specific middle column state) ═══ */
function StatePanel({ step, probKey }) {
  if (probKey === "longestSubstr") return <StateLongest step={step} />;
  if (probKey === "minWindow") return <StateMinWin step={step} />;
  return <StateMaxSlide step={step} />;
}

function StateLongest({ step }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Window State</div>
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-indigo-400">{step.left}</div>
          <div className="text-[9px] text-zinc-600">left</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-indigo-400">{step.right >= 0 ? step.right : "—"}</div>
          <div className="text-[9px] text-zinc-600">right</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-emerald-400">{step.ans}</div>
          <div className="text-[9px] text-zinc-600">ans</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">{step.seen.size}</div>
          <div className="text-[9px] text-zinc-600">|seen|</div>
        </div>
      </div>
      {/* Seen set visualization */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Seen Set</div>
        <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
          {step.seen.size > 0
            ? [...step.seen].map(ch => (
                <span key={ch} className="inline-flex items-center justify-center w-8 h-7 rounded-md bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono font-bold text-xs">'{ch}'</span>
              ))
            : <span className="text-[10px] text-zinc-600 italic">empty</span>}
        </div>
      </div>
    </div>
  );
}

function StateMinWin({ step }) {
  const tChars = ["A", "B", "C"];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Window State</div>
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-indigo-400">{step.left}</div>
          <div className="text-[9px] text-zinc-600">left</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-indigo-400">{step.right >= 0 ? step.right : "—"}</div>
          <div className="text-[9px] text-zinc-600">right</div>
        </div>
        <div className="flex-1 text-center">
          <div className={`text-xl font-bold font-mono ${step.missing === 0 ? "text-emerald-400" : "text-red-400"}`}>{step.missing}</div>
          <div className="text-[9px] text-zinc-600">missing</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">{step.bestWindow ? step.bestWindow.r - step.bestWindow.l + 1 : "—"}</div>
          <div className="text-[9px] text-zinc-600">best len</div>
        </div>
      </div>
      {/* Need map */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Need Map (t chars)</div>
        <div className="flex gap-1.5">
          {tChars.map(ch => {
            const val = step.need[ch] || 0;
            const satisfied = val <= 0;
            return (
              <div key={ch} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-600 font-mono">{ch}</span>
                <div className={`w-10 text-center py-1 rounded-lg font-mono text-xs font-bold border ${
                  satisfied ? "bg-emerald-950 border-emerald-800 text-emerald-300" : "bg-red-950 border-red-800 text-red-300"
                }`}>{val}</div>
              </div>
            );
          })}
        </div>
        <div className="text-[9px] text-zinc-700 mt-1">≤0 = satisfied, &gt;0 = still needed</div>
      </div>
    </div>
  );
}

function StateMaxSlide({ step }) {
  const nums = [1, 3, -1, -3, 5, 3, 6, 7];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Window State</div>
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-indigo-400">{step.windowLeft}</div>
          <div className="text-[9px] text-zinc-600">win L</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-indigo-400">{step.windowRight >= 0 ? step.windowRight : "—"}</div>
          <div className="text-[9px] text-zinc-600">win R</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-orange-400">{step.dq.length > 0 ? nums[step.dq[0]] : "—"}</div>
          <div className="text-[9px] text-zinc-600">max</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-emerald-400">{step.result.length}</div>
          <div className="text-[9px] text-zinc-600">outputs</div>
        </div>
      </div>
      {/* Deque visualization */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Monotonic Deque (decreasing)</div>
        <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
          {step.dq.length > 0
            ? step.dq.map((idx, i) => (
                <span key={i} className={`inline-flex items-center px-2 h-7 rounded-md font-mono font-bold text-[10px] ${
                  i === 0 ? "bg-orange-950 border border-orange-700 text-orange-300" : "bg-indigo-950 border border-indigo-800 text-indigo-300"
                }`}>
                  {idx}:{nums[idx]}
                </span>
              ))
            : <span className="text-[10px] text-zinc-600 italic">empty</span>}
        </div>
        <div className="flex items-center gap-3 text-[9px] text-zinc-700 mt-1">
          <span>← front (max)</span><span>back →</span>
        </div>
      </div>
    </div>
  );
}

/* ═══ Main Component ═══ */
export default function SlidingWindowViz() {
  const [probKey, setProbKey] = useState("longestSubstr");
  const [si, setSi] = useState(0);
  const prob = PROBLEMS[probKey];
  const steps = useMemo(() => BUILDERS[probKey](), [probKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const switchProb = (k) => { setProbKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        {/* ═══ 1. Header ═══ */}
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sliding Window</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Variable & Fixed Window Patterns • O(n) Single Pass</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PROBLEMS).map(([k, v]) => (
              <button key={k} onClick={() => switchProb(k)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  probKey === k ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                <span className="opacity-60 mr-1">{v.lc}</span>{v.title.length > 24 ? v.title.slice(0, 22) + "…" : v.title}
                <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded ${
                  v.difficulty === "Hard" ? "bg-red-900/50 text-red-400" : "bg-amber-900/50 text-amber-400"
                }`}>{v.difficulty}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ 2. Core Idea ═══ */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
            <span className="text-[10px] bg-violet-950 text-violet-300 px-2 py-0.5 rounded-md font-bold">{prob.patternTag}</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">{prob.coreIdea}</p>
        </div>

        {/* ═══ 3. Navigation ═══ */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 4. 3-Column Grid ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* —— COL 1: IO + Array Viz —— */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} probKey={probKey} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">
                {probKey === "maxSliding" ? `${prob.input.nums.length} elements • k=${prob.input.k}` :
                 probKey === "minWindow" ? `|s|=${prob.input.s.length} • t="${prob.input.t}"` :
                 `|s|=${prob.input.s.length}`}
              </div>
              <ArrayView step={step} probKey={probKey} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-600 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-950 border border-indigo-700 inline-block" />In Window</span>
                {probKey === "maxSliding" && (
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-800 inline-block" />Max</span>
                )}
                {probKey === "minWindow" && (
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-800 inline-block" />Valid</span>
                )}
              </div>
            </div>
          </div>

          {/* —— COL 2: Steps + State —— */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "shrink" || step.phase === "valid" ? "bg-amber-950/20 border-amber-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "expand" || step.phase === "build" ? "bg-blue-900 text-blue-300" :
                  step.phase === "shrink" ? "bg-amber-900 text-amber-300" :
                  step.phase === "valid" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "output" ? "bg-orange-900 text-orange-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* State panel */}
            <StatePanel step={step} probKey={probKey} />

            {/* Result card (for maxSliding) */}
            {probKey === "maxSliding" && step.result.length > 0 && (
              <div className={`${step.phase === "done" ? "bg-emerald-950/20 border-emerald-900/50" : "bg-zinc-900 border-zinc-800"} border rounded-2xl p-3`}>
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Result Array</div>
                <div className="flex gap-1.5 flex-wrap">
                  {step.result.map((v, i) => (
                    <span key={i} className={`inline-flex items-center justify-center w-9 h-7 rounded-md font-mono font-bold text-xs ${
                      step.phase === "done" ? "bg-emerald-950 border border-emerald-800 text-emerald-300" :
                      i === step.result.length - 1 ? "bg-orange-950 border border-orange-700 text-orange-300" :
                      "bg-zinc-800 border border-zinc-700 text-zinc-300"
                    }`}>{v}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Completion card */}
            {step.phase === "done" && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Complexity</div>
                <div className="text-[10px] text-zinc-500 space-y-1">
                  <div><span className="text-zinc-400 font-semibold">Time:</span> O(n) — each element processed at most twice (enter + leave window)</div>
                  <div><span className="text-zinc-400 font-semibold">Space:</span> {probKey === "maxSliding" ? "O(k) for deque" : probKey === "minWindow" ? "O(|Σ|) for need map" : "O(min(n, |Σ|)) for set"}</div>
                </div>
              </div>
            )}
          </div>

          {/* —— COL 3: Code —— */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} probKey={probKey} />
          </div>
        </div>

        {/* ═══ 5. Bottom Row: When to Use + Classic Problems ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use Sliding Window</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>"Find longest/shortest subarray/substring satisfying X" — variable window</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>"Find max/min over all windows of size k" — fixed window</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Constraint involves contiguous elements and can be maintained incrementally</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Brute force is O(n²) or O(n²k) and you need O(n) — think two pointers</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Auxiliary: HashSet (uniqueness), HashMap (frequency), Deque (monotonic max/min)</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Template:</span> left=0, for right: expand → check/shrink → update ans</div>
                <div><span className="text-zinc-500 font-semibold">Key insight:</span> Both pointers only move forward → O(n) total work</div>
                <div><span className="text-zinc-500 font-semibold">Gotcha:</span> Know whether to maximize window (expand first) or minimize (shrink first)</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 3 — Longest Substring Without Repeating</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 424 — Longest Repeating Char Replacement</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 567 — Permutation in String</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 209 — Minimum Size Subarray Sum</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1004 — Max Consecutive Ones III</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 76 — Minimum Window Substring</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 239 — Sliding Window Maximum</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 30 — Substring with Concat of All Words</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 992 — Subarrays with K Different Integers</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
