import { useState, useMemo } from "react";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MONOTONIC STACK — 3 Classic Problems
   LC 84 Largest Rectangle · LC 42 Trapping Rain Water · LC 85 Maximal Rectangle
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* ─── Problem Definitions ─── */
const PROBLEMS = {
  histogram: {
    title: "Largest Rectangle",
    subtitle: "LC 84 · heights = [2, 1, 5, 6, 2, 3]",
    coreIdea: "Maintain a monotonically increasing stack of bar indices. When a shorter bar arrives, pop taller bars — each popped bar has found its right boundary (current index) and left boundary (new stack top). Width = right − left − 1. Append a sentinel 0 to flush all remaining bars. Each bar is pushed once, popped once → O(n).",
  },
  trapping: {
    title: "Trapping Rain Water",
    subtitle: "LC 42 · height = [0,1,0,2,1,0,1,3,2,1,2,1]",
    coreIdea: "Use a monotonically decreasing stack. When a taller bar appears, it forms a right wall. Pop the top (the pool bottom). The new stack top is the left wall. Trapped water = (min(left, right) − bottom) × width. Process layer by layer from bottom up — the stack naturally handles nested pools.",
  },
  maxrect: {
    title: "Maximal Rectangle",
    subtitle: "LC 85 · Binary matrix → largest rectangle of 1s",
    coreIdea: "Reduce 2D to 1D: for each row, build a histogram where height[c] = number of consecutive 1s ending at the current row. Then apply the Largest Rectangle in Histogram algorithm (LC 84) on each row's histogram. Track the global maximum. This converts an O(R²C²) brute-force into O(R×C).",
  },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CODE PANELS — per-problem Python functions
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const CODES = {
  histogram: [
    { id: 0,  text: `def largestRectangleArea(heights):` },
    { id: 1,  text: `    heights.append(0)  # sentinel` },
    { id: 2,  text: `    stack = []` },
    { id: 3,  text: `    max_area = 0` },
    { id: 4,  text: `` },
    { id: 5,  text: `    for i, h in enumerate(heights):` },
    { id: 6,  text: `        while stack and heights[stack[-1]] > h:` },
    { id: 7,  text: `            idx = stack.pop()` },
    { id: 8,  text: `            height = heights[idx]` },
    { id: 9,  text: `            w = i if not stack else i-stack[-1]-1` },
    { id: 10, text: `            max_area = max(max_area, height * w)` },
    { id: 11, text: `        stack.append(i)` },
    { id: 12, text: `` },
    { id: 13, text: `    return max_area` },
  ],
  trapping: [
    { id: 0,  text: `def trap(height):` },
    { id: 1,  text: `    stack = []` },
    { id: 2,  text: `    water = 0` },
    { id: 3,  text: `` },
    { id: 4,  text: `    for i, h in enumerate(height):` },
    { id: 5,  text: `        while stack and height[stack[-1]] < h:` },
    { id: 6,  text: `            bot = height[stack.pop()]` },
    { id: 7,  text: `            if not stack:` },
    { id: 8,  text: `                break` },
    { id: 9,  text: `            left = stack[-1]` },
    { id: 10, text: `            w = i - left - 1` },
    { id: 11, text: `            bounded = min(height[left], h) - bot` },
    { id: 12, text: `            water += bounded * w` },
    { id: 13, text: `        stack.append(i)` },
    { id: 14, text: `` },
    { id: 15, text: `    return water` },
  ],
  maxrect: [
    { id: 0,  text: `def maximalRectangle(matrix):` },
    { id: 1,  text: `    if not matrix: return 0` },
    { id: 2,  text: `    C = len(matrix[0])` },
    { id: 3,  text: `    heights = [0] * C` },
    { id: 4,  text: `    max_area = 0` },
    { id: 5,  text: `` },
    { id: 6,  text: `    for row in matrix:` },
    { id: 7,  text: `        for c in range(C):` },
    { id: 8,  text: `            if row[c] == "1":` },
    { id: 9,  text: `                heights[c] += 1` },
    { id: 10, text: `            else:` },
    { id: 11, text: `                heights[c] = 0` },
    { id: 12, text: `` },
    { id: 13, text: `        max_area = max(max_area,` },
    { id: 14, text: `            largestRectangleArea(heights[:]))` },
    { id: 15, text: `` },
    { id: 16, text: `    return max_area` },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PROBLEM INPUTS & EXPECTED OUTPUTS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const INPUTS = {
  histogram: { heights: [2, 1, 5, 6, 2, 3] },
  trapping: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] },
  maxrect: {
    matrix: [
      [1, 0, 1, 0, 0],
      [1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0],
    ],
  },
};

const EXPECTED = {
  histogram: { maxArea: 10, bestRect: { left: 2, right: 3, height: 5 } },
  trapping: { water: 6 },
  maxrect: { maxArea: 6 },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS — Largest Rectangle in Histogram
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildHistogramSteps() {
  const HEIGHTS = [2, 1, 5, 6, 2, 3];
  const n = HEIGHTS.length;
  const heights = [...HEIGHTS, 0];
  const stack = [];
  const steps = [];
  let maxArea = 0;
  let bestRect = null;
  const finalized = { maxArea: 0, bestRect: null };

  function snap(title, detail, phase, codeHL, current, poppedIdx, calcArea) {
    steps.push({
      title, detail, phase, codeHL,
      stack: [...stack], current, poppedIdx,
      calcArea: calcArea ? { ...calcArea } : null,
      maxArea, bestRect: bestRect ? { ...bestRect } : null,
      finalized: { ...finalized },
      heights: HEIGHTS,
    });
  }

  snap(
    "Initialize — Append sentinel 0",
    `heights = [${HEIGHTS.join(",")}] + sentinel [0]. Stack starts empty. Process left to right; maintain increasing stack.`,
    "init", [0, 1, 2, 3], -1, -1, null
  );

  for (let i = 0; i < heights.length; i++) {
    const h = heights[i];

    if (stack.length === 0 || h >= heights[stack[stack.length - 1]]) {
      stack.push(i);
      if (i < n) {
        snap(
          `Bar ${i} (h=${h}): Push — stack increasing`,
          `${h} ≥ ${stack.length > 1 ? `stack top h=${heights[stack[stack.length - 2]]}` : "empty stack"}. Push index ${i}. Stack: [${stack.join(",")}].`,
          "push", [5, 11], i, -1, null
        );
      }
      continue;
    }

    while (stack.length > 0 && heights[stack[stack.length - 1]] > h) {
      const pIdx = stack.pop();
      const pH = heights[pIdx];
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      const area = pH * width;
      const prevMax = maxArea;
      if (area > maxArea) {
        maxArea = area;
        bestRect = { left: stack.length === 0 ? 0 : stack[stack.length - 1] + 1, right: i - 1, height: pH };
        finalized.maxArea = maxArea;
        finalized.bestRect = { ...bestRect };
      }
      const calcArea = {
        height: pH, width, area,
        left: stack.length === 0 ? 0 : stack[stack.length - 1] + 1,
        right: i - 1,
      };

      snap(
        i < n
          ? `Bar ${i} (h=${h}): Pop idx ${pIdx} (h=${pH})`
          : `Sentinel: Pop idx ${pIdx} (h=${pH})`,
        `${h} < ${pH} → pop. Height=${pH}, width=${stack.length === 0 ? `${i} (to left edge)` : `${i}−${stack[stack.length - 1]}−1=${width}`}. Area=${pH}×${width}=${area}. ${area > prevMax ? `New max ${prevMax}→${maxArea}.` : `Max stays ${maxArea}.`}`,
        "pop", [6, 7, 8, 9, 10], i < n ? i : -1, pIdx, calcArea
      );
    }

    stack.push(i);
    if (i < n) {
      snap(
        `Bar ${i} (h=${h}): Push after pops`,
        `Done popping. Push index ${i}. Stack: [${stack.join(",")}]. Increasing invariant restored.`,
        "push", [11], i, -1, null
      );
    }
  }

  snap(
    `✓ Complete — Max Area = ${maxArea}`,
    `Largest rectangle: h=${bestRect.height} × w=${bestRect.right - bestRect.left + 1} = ${maxArea} spanning bars ${bestRect.left}..${bestRect.right}. O(n) — each bar pushed and popped exactly once.`,
    "done", [13], -1, -1, null
  );

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS — Trapping Rain Water
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildTrappingSteps() {
  const HEIGHT = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
  const n = HEIGHT.length;
  const stack = [];
  const steps = [];
  let water = 0;
  const waterMap = new Array(n).fill(0);

  function snap(title, detail, phase, codeHL, current, poppedIdx, calcWater) {
    steps.push({
      title, detail, phase, codeHL,
      stack: [...stack], current, poppedIdx,
      calcWater: calcWater ? { ...calcWater } : null,
      water, waterMap: [...waterMap],
      finalized: { water },
      heights: HEIGHT,
    });
  }

  snap(
    "Initialize — Empty decreasing stack",
    `height = [${HEIGHT.join(",")}]. Maintain a monotonically decreasing stack. When a taller bar appears, compute trapped water layer by layer.`,
    "init", [0, 1, 2], -1, -1, null
  );

  for (let i = 0; i < n; i++) {
    const h = HEIGHT[i];

    while (stack.length > 0 && HEIGHT[stack[stack.length - 1]] < h) {
      const botIdx = stack.pop();
      const bot = HEIGHT[botIdx];
      if (stack.length === 0) {
        snap(
          `Bar ${i} (h=${h}): Pop idx ${botIdx} — no left wall`,
          `${h} > bottom h=${bot}. Pop index ${botIdx}. Stack empty → no left boundary. Skip.`,
          "pop-skip", [5, 6, 7, 8], i, botIdx, null
        );
        break;
      }
      const leftIdx = stack[stack.length - 1];
      const leftH = HEIGHT[leftIdx];
      const w = i - leftIdx - 1;
      const bounded = Math.min(leftH, h) - bot;
      const trapped = bounded * w;
      water += trapped;

      // Distribute water into waterMap for visualization
      if (trapped > 0) {
        for (let j = leftIdx + 1; j < i; j++) {
          waterMap[j] += bounded;
        }
      }

      snap(
        `Bar ${i} (h=${h}): Pool — left=${leftH}, bottom=${bot}`,
        `Pop idx ${botIdx}(h=${bot}). Left wall idx ${leftIdx}(h=${leftH}), right wall h=${h}. min(${leftH},${h})−${bot}=${bounded}, width=${w}. Water +${trapped} → total=${water}.`,
        trapped > 0 ? "pool" : "pop-zero", [5, 6, 9, 10, 11, 12], i, botIdx,
        { leftIdx, leftH, rightH: h, bot, width: w, bounded, trapped }
      );
    }

    stack.push(i);
    if (i < n - 1 || steps.length < 3) {
      // Don't spam push steps for every bar — show selectively
      const prevPhase = steps[steps.length - 1]?.phase;
      if (stack.length <= 2 || prevPhase === "pool" || prevPhase === "pop-skip" || prevPhase === "init" || i === 0) {
        snap(
          `Bar ${i} (h=${h}): Push`,
          `Push index ${i} (h=${h}). Stack: [${stack.map(s => `${s}`).join(",")}]. Decreasing order maintained.`,
          "push", [4, 13], i, -1, null
        );
      }
    }
  }

  snap(
    `✓ Complete — Total Water = ${water}`,
    `Trapped water = ${water} units. Every pool computed layer by layer using the stack. O(n) time, O(n) space.`,
    "done", [15], -1, -1, null
  );

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS — Maximal Rectangle
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildMaxRectSteps() {
  const MATRIX = INPUTS.maxrect.matrix;
  const R = MATRIX.length, C = MATRIX[0].length;
  const heights = new Array(C).fill(0);
  const steps = [];
  let globalMax = 0;
  let globalBest = null;

  function snap(title, detail, phase, codeHL, row, hist, rowMax, rowBest) {
    steps.push({
      title, detail, phase, codeHL,
      row, heights: [...hist], rowMax, rowBest: rowBest ? { ...rowBest } : null,
      globalMax, globalBest: globalBest ? { ...globalBest } : null,
      finalized: { maxArea: globalMax },
      matrix: MATRIX,
    });
  }

  snap(
    "Initialize — Build histogram row by row",
    `Matrix: ${R}×${C}. For each row, heights[c] += 1 if cell=1, else reset to 0. Then apply LC 84 on the histogram.`,
    "init", [0, 1, 2, 3, 4], -1, new Array(C).fill(0), 0, null
  );

  for (let r = 0; r < R; r++) {
    // Build histogram for this row
    for (let c = 0; c < C; c++) {
      heights[c] = MATRIX[r][c] === 1 ? heights[c] + 1 : 0;
    }

    snap(
      `Row ${r}: Build histogram`,
      `For each col: if matrix[${r}][c]=1, height++; else height=0. Histogram: [${heights.join(",")}].`,
      "build", [6, 7, 8, 9, 10, 11], r, heights, 0, null
    );

    // Apply LC84 on this row's histogram
    const h = [...heights, 0];
    const stk = [];
    let rowMax = 0;
    let rowBest = null;

    for (let i = 0; i < h.length; i++) {
      while (stk.length > 0 && h[stk[stk.length - 1]] > h[i]) {
        const pIdx = stk.pop();
        const pH = h[pIdx];
        const w = stk.length === 0 ? i : i - stk[stk.length - 1] - 1;
        const area = pH * w;
        if (area > rowMax) {
          rowMax = area;
          rowBest = { left: stk.length === 0 ? 0 : stk[stk.length - 1] + 1, right: i - 1, height: pH };
        }
      }
      stk.push(i);
    }

    const prevGlobal = globalMax;
    if (rowMax > globalMax) {
      globalMax = rowMax;
      globalBest = { ...rowBest, row: r };
    }

    snap(
      rowMax > prevGlobal
        ? `Row ${r}: Stack → area=${rowMax} — New global max!`
        : `Row ${r}: Stack → area=${rowMax}`,
      rowBest
        ? `LC 84 on [${heights.join(",")}]: h=${rowBest.height} × w=${rowBest.right - rowBest.left + 1} = ${rowMax} at cols ${rowBest.left}..${rowBest.right}. Global max: ${globalMax}.`
        : `LC 84 on [${heights.join(",")}]: max area ${rowMax}. Global max: ${globalMax}.`,
      rowMax > prevGlobal ? "new-max" : "stack-done", [13, 14], r, heights, rowMax, rowBest
    );
  }

  snap(
    `✓ Complete — Maximal Rectangle = ${globalMax}`,
    `Best rectangle: row ${globalBest.row}, cols ${globalBest.left}..${globalBest.right}, h=${globalBest.height} → ${globalMax}. O(R×C) total.`,
    "done", [16], -1, heights, globalMax, globalBest
  );

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP BUILDER DISPATCH
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildSteps(key) {
  switch (key) {
    case "histogram": return buildHistogramSteps();
    case "trapping": return buildTrappingSteps();
    case "maxrect": return buildMaxRectSteps();
    default: return [];
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VIZ — Histogram (LC 84)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function HistogramViz({ step }) {
  const { heights, stack, current, poppedIdx, calcArea, bestRect, phase } = step;
  const maxH = Math.max(...heights);
  const barW = 46, barGap = 5, padB = 26, padT = 16;
  const chartH = 200;
  const scale = (chartH - padB - padT) / maxH;
  const totalW = heights.length * (barW + barGap) + barGap + 10;
  const stackSet = new Set(stack);

  return (
    <svg viewBox={`0 0 ${totalW} ${chartH}`} className="w-full" style={{ maxHeight: 220 }}>
      {calcArea && (
        <rect
          x={calcArea.left * (barW + barGap) + barGap}
          y={chartH - padB - calcArea.height * scale}
          width={(calcArea.right - calcArea.left + 1) * (barW + barGap) - barGap}
          height={calcArea.height * scale}
          fill="#3b82f620" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4,3" rx={3}
        />
      )}
      {phase === "done" && bestRect && (
        <rect
          x={bestRect.left * (barW + barGap) + barGap}
          y={chartH - padB - bestRect.height * scale}
          width={(bestRect.right - bestRect.left + 1) * (barW + barGap) - barGap}
          height={bestRect.height * scale}
          fill="#10b98130" stroke="#10b981" strokeWidth={2.5} rx={3}
        />
      )}
      {heights.map((h, i) => {
        const x = i * (barW + barGap) + barGap;
        const barH = h * scale;
        const y = chartH - padB - barH;
        const isCurr = current === i;
        const isPopped = poppedIdx === i;
        const isOnStack = stackSet.has(i);
        let fill = "#52525b";
        if (isPopped) fill = "#dc2626";
        else if (isCurr) fill = "#2563eb";
        else if (phase === "done" && bestRect && i >= bestRect.left && i <= bestRect.right) fill = "#059669";
        else if (isOnStack) fill = "#7c3aed";
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={fill} rx={3}
              stroke={isCurr ? "#60a5fa" : isPopped ? "#f87171" : "none"} strokeWidth={isCurr || isPopped ? 2 : 0} />
            <text x={x + barW / 2} y={y - 5} textAnchor="middle"
              fill={isCurr ? "#93c5fd" : isPopped ? "#fca5a5" : "#a1a1aa"}
              fontSize="11" fontWeight="700" fontFamily="monospace">{h}</text>
            <text x={x + barW / 2} y={chartH - padB + 13} textAnchor="middle"
              fill="#52525b" fontSize="9" fontFamily="monospace">{i}</text>
          </g>
        );
      })}
      <line x1={0} y1={chartH - padB + 1} x2={totalW} y2={chartH - padB + 1} stroke="#3f3f46" strokeWidth={1} />
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VIZ — Trapping Rain Water (LC 42)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function TrappingViz({ step }) {
  const { heights, stack, current, poppedIdx, waterMap, phase, calcWater } = step;
  const maxH = Math.max(...heights, 1);
  const barW = 24, barGap = 2, padB = 22, padT = 12;
  const chartH = 200;
  const scale = (chartH - padB - padT) / maxH;
  const totalW = heights.length * (barW + barGap) + barGap + 6;
  const stackSet = new Set(stack);

  return (
    <svg viewBox={`0 0 ${totalW} ${chartH}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Water fills */}
      {waterMap.map((w, i) => {
        if (w <= 0) return null;
        const x = i * (barW + barGap) + barGap;
        const barH = heights[i] * scale;
        const waterH = w * scale;
        const y = chartH - padB - barH - waterH;
        return (
          <rect key={`w-${i}`} x={x} y={y} width={barW} height={waterH}
            fill="#3b82f640" stroke="#3b82f6" strokeWidth={0.5} rx={1} />
        );
      })}
      {/* Current pool highlight */}
      {calcWater && calcWater.trapped > 0 && (
        <rect
          x={calcWater.leftIdx * (barW + barGap) + barGap + barW + barGap}
          y={chartH - padB - (calcWater.bot + calcWater.bounded) * scale}
          width={(current - calcWater.leftIdx - 1) * (barW + barGap)}
          height={calcWater.bounded * scale}
          fill="#3b82f615" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="3,2" rx={2}
        />
      )}
      {/* Bars */}
      {heights.map((h, i) => {
        const x = i * (barW + barGap) + barGap;
        const barH = h * scale;
        const y = chartH - padB - barH;
        const isCurr = current === i;
        const isPopped = poppedIdx === i;
        const isOnStack = stackSet.has(i);
        const isLeft = calcWater && calcWater.leftIdx === i;
        let fill = "#52525b";
        if (isPopped) fill = "#dc2626";
        else if (isCurr) fill = "#2563eb";
        else if (isLeft) fill = "#d97706";
        else if (isOnStack) fill = "#7c3aed";
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={Math.max(barH, 1)} fill={fill} rx={2}
              stroke={isCurr ? "#60a5fa" : isPopped ? "#f87171" : isLeft ? "#fbbf24" : "none"}
              strokeWidth={isCurr || isPopped || isLeft ? 1.5 : 0} />
            {h > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                fill={isCurr ? "#93c5fd" : isPopped ? "#fca5a5" : "#a1a1aa"}
                fontSize="9" fontWeight="700" fontFamily="monospace">{h}</text>
            )}
            <text x={x + barW / 2} y={chartH - padB + 11} textAnchor="middle"
              fill="#52525b" fontSize="7" fontFamily="monospace">{i}</text>
          </g>
        );
      })}
      <line x1={0} y1={chartH - padB + 1} x2={totalW} y2={chartH - padB + 1} stroke="#3f3f46" strokeWidth={1} />
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VIZ — Maximal Rectangle (LC 85)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function MaxRectViz({ step }) {
  const { matrix, heights, row, globalBest, phase, rowBest } = step;
  const R = matrix.length, C = matrix[0].length;
  const cellSize = 38;
  const histH = 80;
  const gap = 10;
  const gridW = C * cellSize;
  const totalH = R * cellSize + gap + histH + 20;
  const maxHist = Math.max(...heights, 1);
  const histScale = (histH - 10) / maxHist;

  return (
    <svg viewBox={`0 0 ${gridW + 10} ${totalH}`} className="w-full" style={{ maxHeight: 260 }}>
      {/* Matrix grid */}
      {Array.from({ length: R }, (_, r) =>
        Array.from({ length: C }, (_, c) => {
          const val = matrix[r][c];
          const isCurrentRow = r === row;
          const isBest = phase === "done" && globalBest && r >= globalBest.row - globalBest.height + 1 && r <= globalBest.row && c >= globalBest.left && c <= globalBest.right;
          let fill = val === 1 ? "#27272a" : "#18181b";
          if (isBest) fill = "#065f46";
          else if (isCurrentRow && val === 1) fill = "#1e3a5f";
          else if (r <= row && val === 1) fill = "#1a1a2e";
          return (
            <g key={`${r}-${c}`}>
              <rect x={5 + c * cellSize} y={r * cellSize} width={cellSize - 1} height={cellSize - 1}
                fill={fill} stroke={isCurrentRow ? "#3b82f6" : "#3f3f46"} strokeWidth={isCurrentRow ? 1.5 : 0.5} rx={3} />
              <text x={5 + c * cellSize + cellSize / 2} y={r * cellSize + cellSize / 2 + 1}
                textAnchor="middle" dominantBaseline="central"
                fill={val === 1 ? (isBest ? "#6ee7b7" : isCurrentRow ? "#93c5fd" : "#71717a") : "#27272a"}
                fontSize="12" fontWeight="600" fontFamily="monospace">{val}</text>
            </g>
          );
        })
      )}
      {/* Histogram below */}
      {row >= 0 && (
        <>
          <text x={5} y={R * cellSize + gap + 2} fill="#71717a" fontSize="8" fontFamily="monospace">histogram:</text>
          {heights.map((h, c) => {
            const x = 5 + c * cellSize;
            const barH = h * histScale;
            const y = totalH - barH - 2;
            const isRowBest = rowBest && c >= rowBest.left && c <= rowBest.right;
            return (
              <g key={`h-${c}`}>
                <rect x={x + 4} y={y} width={cellSize - 9} height={barH}
                  fill={isRowBest ? "#059669" : h > 0 ? "#7c3aed" : "#27272a"} rx={2} opacity={0.8} />
                {h > 0 && (
                  <text x={x + cellSize / 2} y={y - 3} textAnchor="middle"
                    fill={isRowBest ? "#6ee7b7" : "#c4b5fd"} fontSize="9" fontWeight="700" fontFamily="monospace">{h}</text>
                )}
              </g>
            );
          })}
        </>
      )}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VIZ DISPATCH
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function Visualization({ pKey, step }) {
  switch (pKey) {
    case "histogram": return <HistogramViz step={step} />;
    case "trapping": return <TrappingViz step={step} />;
    case "maxrect": return <MaxRectViz step={step} />;
    default: return null;
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   IO PANEL — Input / Expected / Progressive Output
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function IOPanel({ pKey, step }) {
  const done = step.phase === "done";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          {pKey === "histogram" && (
            <div><span className="text-zinc-500">heights</span> = <span className="text-zinc-300">[{INPUTS.histogram.heights.join(", ")}]</span></div>
          )}
          {pKey === "trapping" && (
            <>
              <div><span className="text-zinc-500">height</span> = <span className="text-zinc-300">[{INPUTS.trapping.height.slice(0, 6).join(",")}...</span></div>
              <div className="pl-9"><span className="text-zinc-300">{INPUTS.trapping.height.slice(6).join(",")}]</span></div>
            </>
          )}
          {pKey === "maxrect" && (
            <>
              <div><span className="text-zinc-500">matrix</span> = </div>
              {INPUTS.maxrect.matrix.map((row, i) => (
                <div key={i} className="pl-2 text-zinc-300">[{row.join(",")}]</div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px] text-zinc-300">
          {pKey === "histogram" && <div>max_area = 10</div>}
          {pKey === "trapping" && <div>water = 6</div>}
          {pKey === "maxrect" && <div>max_area = 6</div>}
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && (
            <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>
          )}
        </div>
        <div className="font-mono text-[11px]">
          {pKey === "histogram" && (
            <div>
              <span className="text-zinc-500">max_area = </span>
              <span className={done ? "text-emerald-300 font-bold" : step.maxArea > 0 ? "text-zinc-300" : "text-zinc-600"}>
                {step.maxArea > 0 ? step.maxArea : "?"}
              </span>
              {step.bestRect && (
                <div className="text-[10px] text-zinc-600 mt-0.5">
                  h={step.bestRect.height} × w={step.bestRect.right - step.bestRect.left + 1} at [{step.bestRect.left}..{step.bestRect.right}]
                  {done && step.maxArea === EXPECTED.histogram.maxArea && <span className="text-emerald-600 ml-1">✓</span>}
                </div>
              )}
            </div>
          )}
          {pKey === "trapping" && (
            <div>
              <span className="text-zinc-500">water = </span>
              <span className={done ? "text-emerald-300 font-bold" : step.water > 0 ? "text-zinc-300" : "text-zinc-600"}>
                {step.water > 0 ? step.water : "?"}
              </span>
              {done && step.water === EXPECTED.trapping.water && <span className="text-emerald-600 ml-1">✓</span>}
            </div>
          )}
          {pKey === "maxrect" && (
            <div>
              <span className="text-zinc-500">max_area = </span>
              <span className={done ? "text-emerald-300 font-bold" : step.globalMax > 0 ? "text-zinc-300" : "text-zinc-600"}>
                {step.globalMax > 0 ? step.globalMax : "?"}
              </span>
              {done && step.globalMax === EXPECTED.maxrect.maxArea && <span className="text-emerald-600 ml-1">✓</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CODE PANEL
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function CodePanel({ pKey, highlightLines }) {
  const code = CODES[pKey] || [];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {code.map((line) => {
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NAV BAR
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button
        onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >â† Prev</button>
      <div className="flex gap-1.5 flex-wrap justify-center max-w-[60%]">
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PHASE BADGE COLORS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function phaseStyle(phase) {
  switch (phase) {
    case "push": return "bg-violet-900 text-violet-300";
    case "pop": case "pop-skip": return "bg-red-900 text-red-300";
    case "pool": return "bg-blue-900 text-blue-300";
    case "pop-zero": return "bg-zinc-800 text-zinc-400";
    case "build": return "bg-amber-900 text-amber-300";
    case "stack-done": return "bg-violet-900 text-violet-300";
    case "new-max": return "bg-emerald-900 text-emerald-300";
    case "done": return "bg-emerald-900 text-emerald-300";
    default: return "bg-zinc-800 text-zinc-400";
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STATE PANEL — per-problem
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function StatePanel({ pKey, step }) {
  if (pKey === "histogram") {
    return (
      <>
        {/* Stack */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Stack (bottom → top)</div>
          <div className="flex gap-1.5 flex-wrap min-h-[32px] items-center">
            {step.stack.length > 0 ? step.stack.map((idx, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-violet-950 border border-violet-800 text-violet-300 font-mono font-bold text-xs">{idx}</span>
                <span className="text-[8px] text-violet-700 mt-0.5">h={step.heights[idx]}</span>
              </div>
            )) : <span className="text-[10px] text-zinc-600 italic">empty</span>}
          </div>
        </div>
        {/* Area calculation */}
        {step.calcArea && (
          <div className="bg-blue-950/30 border border-blue-900 rounded-2xl p-3">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">Area Calculation</div>
            <div className="flex items-center gap-4 justify-center">
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-blue-300">{step.calcArea.height}</div>
                <div className="text-[9px] text-zinc-600">height</div>
              </div>
              <span className="text-zinc-500 text-lg">×</span>
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-blue-300">{step.calcArea.width}</div>
                <div className="text-[9px] text-zinc-600">width</div>
              </div>
              <span className="text-zinc-500 text-lg">=</span>
              <div className="text-center">
                <div className={`text-lg font-bold font-mono ${step.calcArea.area === step.maxArea ? "text-emerald-300" : "text-zinc-300"}`}>
                  {step.calcArea.area}
                </div>
                <div className="text-[9px] text-zinc-600">area</div>
              </div>
            </div>
          </div>
        )}
        {/* Max area */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Max Area</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{step.maxArea}</div>
          </div>
        </div>
      </>
    );
  }

  if (pKey === "trapping") {
    return (
      <>
        {/* Stack */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Stack — decreasing (bottom → top)</div>
          <div className="flex gap-1.5 flex-wrap min-h-[32px] items-center">
            {step.stack.length > 0 ? step.stack.map((idx, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-violet-950 border border-violet-800 text-violet-300 font-mono font-bold text-xs">{idx}</span>
                <span className="text-[8px] text-violet-700 mt-0.5">h={step.heights[idx]}</span>
              </div>
            )) : <span className="text-[10px] text-zinc-600 italic">empty</span>}
          </div>
        </div>
        {/* Pool calculation */}
        {step.calcWater && step.calcWater.trapped > 0 && (
          <div className="bg-blue-950/30 border border-blue-900 rounded-2xl p-3">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">Pool Calculation</div>
            <div className="font-mono text-[11px] text-zinc-400 space-y-1">
              <div>
                <span className="text-zinc-500">bounded</span> = min(<span className="text-amber-300">{step.calcWater.leftH}</span>, <span className="text-blue-300">{step.calcWater.rightH}</span>) − <span className="text-red-300">{step.calcWater.bot}</span> = <span className="text-zinc-200">{step.calcWater.bounded}</span>
              </div>
              <div>
                <span className="text-zinc-500">width</span> = {step.calcWater.width}
              </div>
              <div>
                <span className="text-zinc-500">water</span> = {step.calcWater.bounded} × {step.calcWater.width} = <span className="text-blue-300 font-bold">+{step.calcWater.trapped}</span>
              </div>
            </div>
          </div>
        )}
        {/* Total water */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Total Water</div>
            <div className="text-2xl font-bold font-mono text-blue-400">{step.water}</div>
          </div>
        </div>
      </>
    );
  }

  if (pKey === "maxrect") {
    return (
      <>
        {/* Row histogram */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            {step.row >= 0 ? `Row ${step.row} Histogram` : "Histogram"}
          </div>
          <div className="flex gap-1.5 min-h-[32px] items-end justify-center">
            {step.heights.map((h, c) => (
              <div key={c} className="flex flex-col items-center">
                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg font-mono font-bold text-xs border ${
                  h > 0 ? "bg-violet-950 border-violet-800 text-violet-300" : "bg-zinc-900 border-zinc-800 text-zinc-600"
                }`}>{h}</span>
                <span className="text-[8px] text-zinc-600 mt-0.5">c{c}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Row result + global max */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div>
          <div className="flex gap-4">
            <div className="flex-1 text-center">
              <div className="text-lg font-bold font-mono text-violet-400">{step.row >= 0 ? step.row : "—"}</div>
              <div className="text-[9px] text-zinc-600">row</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-lg font-bold font-mono text-amber-400">{step.rowMax ?? "—"}</div>
              <div className="text-[9px] text-zinc-600">row max</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-lg font-bold font-mono text-emerald-400">{step.globalMax}</div>
              <div className="text-[9px] text-zinc-600">global max</div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return null;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function MonoStackViz() {
  const [pKey, setPKey] = useState("histogram");
  const [si, setSi] = useState(0);
  const steps = useMemo(() => buildSteps(pKey), [pKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const problem = PROBLEMS[pKey];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        {/* â•â•â• 1. HEADER â•â•â• */}
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Monotonic Stack</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Next Greater / Smaller Element Pattern • O(n) Single Pass</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PROBLEMS).map(([k, v]) => (
              <button key={k} onClick={() => switchProblem(k)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  pKey === k ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {v.title}
              </button>
            ))}
          </div>
        </div>

        {/* â•â•â• 2. CORE IDEA â•â•â• */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        {/* â•â•â• 3. NAVIGATION â•â•â• */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 4. 3-COLUMN GRID â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Visualization ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel pKey={pKey} step={step} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{problem.subtitle}</div>
              <Visualization pKey={pKey} step={step} />
              {pKey === "histogram" && (
                <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-600 inline-block" />On Stack</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />Current</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 inline-block" />Popping</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />Best</span>
                </div>
              )}
              {pKey === "trapping" && (
                <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-600 inline-block" />Stack</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />Right Wall</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />Left Wall</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500/40 inline-block" />Water</span>
                </div>
              )}
              {pKey === "maxrect" && (
                <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-800 inline-block" />Current Row</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-800 inline-block" />Best Rect</span>
                </div>
              )}
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "pool" ? "bg-blue-950/20 border-blue-800" :
              step.phase === "new-max" ? "bg-emerald-950/20 border-emerald-800" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${phaseStyle(step.phase)}`}>
                  {step.phase}
                </span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* State panel */}
            <StatePanel pKey={pKey} step={step} />

            {/* Completion card */}
            {step.phase === "done" && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Result</div>
                <div className="font-mono text-[11px] text-emerald-300">
                  {pKey === "histogram" && `Largest rectangle area = ${step.maxArea} (h=${step.bestRect?.height} × w=${step.bestRect ? step.bestRect.right - step.bestRect.left + 1 : 0} at bars ${step.bestRect?.left}..${step.bestRect?.right}).`}
                  {pKey === "trapping" && `Total trapped water = ${step.water} units.`}
                  {pKey === "maxrect" && `Maximal rectangle = ${step.globalMax}. Row ${step.globalBest?.row}, cols ${step.globalBest?.left}..${step.globalBest?.right}, h=${step.globalBest?.height}.`}
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel pKey={pKey} highlightLines={step.codeHL} />
          </div>

        </div>

        {/* â•â•â• 5. BOTTOM ROW: When to Use + Classic Problems â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>"Next greater / smaller element" for each item in an array</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Histogram-based area problems — rectangles, trapped water</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Left/right boundary discovery — each element pushed once, popped once</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>2D matrix problems reduced to per-row histograms</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(n) — each element pushed and popped at most once</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(n) — stack size</div>
                <div><span className="text-zinc-500 font-semibold">Variants:</span> Increasing (left/right smaller), Decreasing (left/right greater)</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 84 — Largest Rectangle in Histogram</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 42 — Trapping Rain Water</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 85 — Maximal Rectangle</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 739 — Daily Temperatures</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 496 — Next Greater Element I</span><span className="ml-auto text-[10px] text-amber-700">Easy</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 901 — Online Stock Span</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 503 — Next Greater Element II</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 907 — Sum of Subarray Minimums</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
