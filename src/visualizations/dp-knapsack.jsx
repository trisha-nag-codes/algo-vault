import { useState, useMemo } from "react";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   KNAPSACK FAMILY — 5 Problem Types
   0/1 · Fractional · Unbounded · Bounded · Multiple
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* ─── Problem Definitions ─── */
const PROBLEMS = {
  zeroone: {
    title: "0/1 Knapsack",
    subtitle: "Binary Choice",
    coreIdea: "Each item is taken or skipped — no splitting. Build dp[i][w] bottom-up: for each item at each capacity, pick max(exclude, include). The 2D table captures all subproblem solutions. Space-optimize to 1D by iterating capacity backwards so each item is considered only once.",
    items: [
      { name: "💻", label: "Laptop", w: 3, v: 4 },
      { name: "📱", label: "Phone",  w: 2, v: 3 },
      { name: "📷", label: "Camera", w: 4, v: 5 },
      { name: "🎧", label: "Headset", w: 1, v: 2 },
    ],
    capacity: 6,
  },
  fractional: {
    title: "Fractional Knapsack",
    subtitle: "Greedy by Value Density",
    coreIdea: "Items are divisible — take fractions. Greedy works optimally: sort by value/weight ratio descending, take as much of each item as capacity allows. No DP needed — O(n log n) sort dominates. This is the only knapsack variant solvable greedily.",
    items: [
      { name: "🥇", label: "Gold",   w: 10, v: 60 },
      { name: "🥈", label: "Silver", w: 20, v: 100 },
      { name: "🥉", label: "Bronze", w: 30, v: 120 },
    ],
    capacity: 50,
  },
  unbounded: {
    title: "Unbounded Knapsack",
    subtitle: "Unlimited Items",
    coreIdea: "Each item can be taken any number of times. Use 1D dp[w] — iterate capacity forwards (left to right) so updated values feed into later computations, naturally allowing reuse. dp[w] = max over all items of dp[w - wt_i] + val_i.",
    items: [
      { name: "💎", label: "Diamond", w: 2, v: 3 },
      { name: "👑", label: "Crown",   w: 3, v: 4 },
      { name: "🪙", label: "Coin",    w: 1, v: 1 },
    ],
    capacity: 7,
  },
  bounded: {
    title: "Bounded Knapsack",
    subtitle: "Limited Quantities",
    coreIdea: "Each item has a max quantity k_i. Binary representation trick: split each item into copies of size 1, 2, 4, … to reduce to 0/1 knapsack with O(Σ log k_i) items. Alternatively, use a modified 2D DP tracking quantity used per item.",
    items: [
      { name: "📱", label: "Phone",  w: 2, v: 3, qty: 2 },
      { name: "💻", label: "Laptop", w: 3, v: 5, qty: 1 },
      { name: "🪙", label: "Coin",   w: 1, v: 1, qty: 3 },
    ],
    capacity: 7,
  },
  multiple: {
    title: "Multiple Knapsack",
    subtitle: "Multiple Containers",
    coreIdea: "Assign items to K bins, each with its own capacity. With 2 bins, use dp[w1][w2] = max value with remaining capacities w1 and w2. For each item: skip it, put in bin 1, or put in bin 2. Generalizes to K bins but complexity grows exponentially with K.",
    items: [
      { name: "💻", label: "Laptop", w: 3, v: 4 },
      { name: "📱", label: "Phone",  w: 2, v: 3 },
      { name: "📷", label: "Camera", w: 4, v: 5 },
      { name: "🎧", label: "Headset", w: 1, v: 2 },
    ],
    bins: [5, 4],
  },
};

/* ─── Python Code per Problem ─── */
const CODES = {
  zeroone: [
    { id: 1,  text: `def knapsack_01(items, cap):` },
    { id: 2,  text: `    n = len(items)` },
    { id: 3,  text: `    dp = [[0]*(cap+1) for _ in range(n+1)]` },
    { id: 4,  text: `` },
    { id: 5,  text: `    for i in range(1, n+1):` },
    { id: 6,  text: `        wt, val = items[i-1]` },
    { id: 7,  text: `        for w in range(cap+1):` },
    { id: 8,  text: `            dp[i][w] = dp[i-1][w]` },
    { id: 9,  text: `            if wt <= w:` },
    { id: 10, text: `                inc = dp[i-1][w-wt] + val` },
    { id: 11, text: `                dp[i][w] = max(dp[i][w], inc)` },
    { id: 12, text: `` },
    { id: 13, text: `    return dp[n][cap]` },
  ],
  fractional: [
    { id: 1,  text: `def fractional_knapsack(items, cap):` },
    { id: 2,  text: `    # Sort by value/weight ratio desc` },
    { id: 3,  text: `    items.sort(key=lambda x: x[1]/x[0],` },
    { id: 4,  text: `                reverse=True)` },
    { id: 5,  text: `    total = 0` },
    { id: 6,  text: `    remain = cap` },
    { id: 7,  text: `` },
    { id: 8,  text: `    for wt, val in items:` },
    { id: 9,  text: `        if remain >= wt:` },
    { id: 10, text: `            total += val  # take all` },
    { id: 11, text: `            remain -= wt` },
    { id: 12, text: `        else:` },
    { id: 13, text: `            frac = remain / wt` },
    { id: 14, text: `            total += val * frac` },
    { id: 15, text: `            break` },
    { id: 16, text: `` },
    { id: 17, text: `    return total` },
  ],
  unbounded: [
    { id: 1,  text: `def knapsack_unbounded(items, cap):` },
    { id: 2,  text: `    dp = [0] * (cap + 1)` },
    { id: 3,  text: `` },
    { id: 4,  text: `    for w in range(1, cap+1):  # forward` },
    { id: 5,  text: `        for wt, val in items:` },
    { id: 6,  text: `            if wt <= w:` },
    { id: 7,  text: `                dp[w] = max(dp[w],` },
    { id: 8,  text: `                            dp[w-wt] + val)` },
    { id: 9,  text: `` },
    { id: 10, text: `    return dp[cap]` },
  ],
  bounded: [
    { id: 1,  text: `def knapsack_bounded(items, cap):` },
    { id: 2,  text: `    # Binary splitting: qty k -> 1,2,4..` },
    { id: 3,  text: `    expanded = []` },
    { id: 4,  text: `    for wt, val, qty in items:` },
    { id: 5,  text: `        k = qty` },
    { id: 6,  text: `        p = 1` },
    { id: 7,  text: `        while k > 0:` },
    { id: 8,  text: `            t = min(p, k)` },
    { id: 9,  text: `            expanded.append((wt*t, val*t))` },
    { id: 10, text: `            k -= t; p *= 2` },
    { id: 11, text: `` },
    { id: 12, text: `    # Now solve as 0/1 knapsack` },
    { id: 13, text: `    dp = [0] * (cap + 1)` },
    { id: 14, text: `    for wt, val in expanded:` },
    { id: 15, text: `        for w in range(cap, wt-1, -1):` },
    { id: 16, text: `            dp[w] = max(dp[w], dp[w-wt]+val)` },
    { id: 17, text: `` },
    { id: 18, text: `    return dp[cap]` },
  ],
  multiple: [
    { id: 1,  text: `def knapsack_multi(items, caps):` },
    { id: 2,  text: `    W1, W2 = caps  # two bins` },
    { id: 3,  text: `    n = len(items)` },
    { id: 4,  text: `    # dp[w1][w2] = max value` },
    { id: 5,  text: `    dp = [[0]*(W2+1) for _ in range(W1+1)]` },
    { id: 6,  text: `` },
    { id: 7,  text: `    for wt, val in items:` },
    { id: 8,  text: `        ndp = [r[:] for r in dp]` },
    { id: 9,  text: `        for w1 in range(W1+1):` },
    { id: 10, text: `            for w2 in range(W2+1):` },
    { id: 11, text: `                if wt<=w1:  # bin 1` },
    { id: 12, text: `                    ndp[w1][w2] = max(ndp[w1][w2],` },
    { id: 13, text: `                        dp[w1-wt][w2] + val)` },
    { id: 14, text: `                if wt<=w2:  # bin 2` },
    { id: 15, text: `                    ndp[w1][w2] = max(ndp[w1][w2],` },
    { id: 16, text: `                        dp[w1][w2-wt] + val)` },
    { id: 17, text: `        dp = ndp` },
    { id: 18, text: `` },
    { id: 19, text: `    return dp[W1][W2]` },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS — each variant
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildSteps_zeroone(prob) {
  const { items, capacity: C } = prob;
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(C + 1).fill(0));
  const steps = [];
  const finalized = new Set();
  const snap = () => dp.map(r => [...r]);

  steps.push({
    title: "Initialize — dp[0][w] = 0 for all w",
    detail: `${n} items, capacity ${C}. dp[i][w] = max value using items 0..i−1 with capacity w. Base: row 0 is all zeros.`,
    dp: snap(), current: null, phase: "init", codeHL: [1, 2, 3],
    comparing: null, selectedItems: [], finalized: new Set(finalized),
    dpType: "2d", highlight: null,
  });

  for (let i = 1; i <= n; i++) {
    const it = items[i - 1];
    for (let w = 0; w <= C; w++) {
      const excl = dp[i - 1][w];
      const canInc = it.w <= w;
      const incVal = canInc ? dp[i - 1][w - it.w] + it.v : -1;
      const best = canInc ? Math.max(excl, incVal) : excl;
      dp[i][w] = best;
      const chose = canInc && incVal > excl ? "include" : "exclude";

      if (w === it.w || w === C || (canInc && incVal > excl) || w === 0) {
        steps.push({
          title: canInc
            ? `Item ${i} ${it.name} (w=${it.w},v=${it.v}), cap=${w}: ${chose === "include" ? "Include ✓" : "Exclude"}`
            : `Item ${i} ${it.name} (w=${it.w}), cap=${w}: ${w === 0 ? "Cap=0" : "Too Heavy"}`,
          detail: canInc
            ? `Exclude: dp[${i-1}][${w}]=${excl}. Include: dp[${i-1}][${w-it.w}]+${it.v}=${dp[i-1][w-it.w]}+${it.v}=${incVal}. Best=${best}.`
            : `Weight ${it.w} > capacity ${w}. dp[${i}][${w}] = dp[${i-1}][${w}] = ${excl}.`,
          dp: snap(), current: [i, w], phase: "fill", codeHL: [5, 6, 7, 8, 9, 10, 11],
          comparing: canInc ? { exclude: excl, include: incVal } : null,
          selectedItems: [], finalized: new Set(finalized),
          dpType: "2d", highlight: canInc ? { from: [i-1, w-it.w], to: [i, w] } : null,
        });
      }
    }
    for (let w = 0; w <= C; w++) finalized.add(`${i},${w}`);
  }

  // Traceback
  const sel = [];
  let w = C;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) { sel.push(i - 1); w -= items[i - 1].w; }
  }
  sel.reverse();

  steps.push({
    title: `✓ Max Value = ${dp[n][C]}`,
    detail: `Selected: [${sel.map(i => `${items[i].name} w=${items[i].w} v=${items[i].v}`).join(", ")}]. Weight: ${sel.reduce((s, i) => s + items[i].w, 0)}/${C}.`,
    dp: snap(), current: null, phase: "done", codeHL: [13],
    comparing: null, selectedItems: sel, finalized: new Set(finalized),
    dpType: "2d", highlight: null,
  });
  return steps;
}

function buildSteps_fractional(prob) {
  const { items, capacity: C } = prob;
  const sorted = items.map((it, i) => ({ ...it, idx: i, ratio: it.v / it.w }))
    .sort((a, b) => b.ratio - a.ratio);
  const steps = [];
  const taken = [];

  steps.push({
    title: "Sort by Value/Weight Ratio (Descending)",
    detail: `Ratios: ${sorted.map(s => `${s.name} ${s.ratio.toFixed(1)}`).join(", ")}. Greedy: take highest ratio first.`,
    taken: [...taken], remain: C, total: 0, phase: "init", codeHL: [1, 2, 3, 4, 5, 6],
    sortedItems: sorted.map(s => ({ ...s })), currentIdx: null,
    finalized: new Set(),
  });

  let remain = C, total = 0;
  for (let si = 0; si < sorted.length; si++) {
    const it = sorted[si];
    if (remain <= 0) break;
    if (remain >= it.w) {
      total += it.v;
      remain -= it.w;
      taken.push({ ...it, frac: 1, gained: it.v });
      steps.push({
        title: `Take All ${it.name} (ratio=${it.ratio.toFixed(1)})`,
        detail: `Weight ${it.w} ≤ remaining ${remain + it.w}. Take all: +${it.v} value. Remaining capacity: ${remain}.`,
        taken: taken.map(t => ({ ...t })), remain, total, phase: "take", codeHL: [8, 9, 10, 11],
        sortedItems: sorted.map(s => ({ ...s })), currentIdx: si,
        finalized: new Set(taken.map((_, i) => i)),
      });
    } else {
      const frac = remain / it.w;
      const gained = +(it.v * frac).toFixed(2);
      total += gained;
      taken.push({ ...it, frac, gained });
      steps.push({
        title: `Take ${(frac * 100).toFixed(1)}% of ${it.name}`,
        detail: `Only ${remain}/${it.w} fits. Fraction=${frac.toFixed(3)}, value=${gained}. Knapsack full.`,
        taken: taken.map(t => ({ ...t })), remain: 0, total, phase: "fraction", codeHL: [12, 13, 14, 15],
        sortedItems: sorted.map(s => ({ ...s })), currentIdx: si,
        finalized: new Set(taken.map((_, i) => i)),
      });
      remain = 0;
    }
  }

  steps.push({
    title: `✓ Max Value = ${total % 1 === 0 ? total : total.toFixed(2)}`,
    detail: `Taken: ${taken.map(t => `${t.frac < 1 ? (t.frac*100).toFixed(0)+"% " : ""}${t.name} (+${t.gained})`).join(", ")}. Total=${total % 1 === 0 ? total : total.toFixed(2)}.`,
    taken: taken.map(t => ({ ...t })), remain: 0, total, phase: "done", codeHL: [17],
    sortedItems: sorted.map(s => ({ ...s })), currentIdx: null,
    finalized: new Set(taken.map((_, i) => i)),
  });
  return steps;
}

function buildSteps_unbounded(prob) {
  const { items, capacity: C } = prob;
  const dp = new Array(C + 1).fill(0);
  const from = new Array(C + 1).fill(-1);
  const steps = [];
  const finalized = new Set();
  finalized.add(0);

  steps.push({
    title: "Initialize — dp[0] = 0",
    detail: `1D array dp[0..${C}]. dp[w] = max value with capacity w. Iterate w forward — allows unlimited reuse.`,
    dp: [...dp], current: null, phase: "init", codeHL: [1, 2],
    bestItem: null, finalized: new Set(finalized), from: [...from],
  });

  for (let w = 1; w <= C; w++) {
    let bestItem = null;
    let bestVal = dp[w];
    for (const it of items) {
      if (it.w <= w && dp[w - it.w] + it.v > bestVal) {
        bestVal = dp[w - it.w] + it.v;
        bestItem = it;
      }
    }
    const prevVal = dp[w];
    if (bestItem) {
      dp[w] = bestVal;
      from[w] = bestItem.w;
    }
    finalized.add(w);

    if (bestItem || w === C || w <= 2) {
      steps.push({
        title: bestItem
          ? `dp[${w}] = ${bestVal} (use ${bestItem.name} w=${bestItem.w})`
          : `dp[${w}] = ${dp[w]} (no improvement)`,
        detail: bestItem
          ? `dp[${w}-${bestItem.w}] + ${bestItem.v} = ${dp[w-bestItem.w]} + ${bestItem.v} = ${bestVal} > ${prevVal}. Update.`
          : `No item improves dp[${w}]=${dp[w]}. ${items.map(it => it.w <= w ? `${it.name}: dp[${w-it.w}]+${it.v}=${dp[w-it.w]+it.v}` : `${it.name}: too heavy`).join("; ")}.`,
        dp: [...dp], current: w, phase: "fill", codeHL: [4, 5, 6, 7, 8],
        bestItem, finalized: new Set(finalized), from: [...from],
      });
    }
  }

  // Traceback
  const sel = [];
  let w = C;
  while (w > 0 && from[w] !== -1) {
    const itemW = from[w];
    const it = items.find(x => x.w === itemW);
    sel.push(it);
    w -= itemW;
  }

  steps.push({
    title: `✓ Max Value = ${dp[C]}`,
    detail: `Items used: [${sel.map(it => `${it.name}`).join(", ")}]. Total weight: ${C - w}/${C}.`,
    dp: [...dp], current: null, phase: "done", codeHL: [10],
    bestItem: null, finalized: new Set(finalized), from: [...from], selectedItems: sel,
  });
  return steps;
}

function buildSteps_bounded(prob) {
  const { items, capacity: C } = prob;
  // Binary splitting
  const expanded = [];
  for (const it of items) {
    let k = it.qty, p = 1;
    while (k > 0) {
      const t = Math.min(p, k);
      expanded.push({ name: it.name, label: it.label, w: it.w * t, v: it.v * t, cnt: t, origW: it.w });
      k -= t; p *= 2;
    }
  }

  const steps = [];
  const dp = new Array(C + 1).fill(0);
  const finalized = new Set();

  steps.push({
    title: "Binary Split — Expand Items",
    detail: `Split: ${items.map(it => `${it.name}×${it.qty}`).join(", ")} → ${expanded.length} groups: [${expanded.map(e => `${e.name}×${e.cnt}(w=${e.w},v=${e.v})`).join(", ")}]. Now solve as 0/1.`,
    dp: [...dp], current: null, phase: "init", codeHL: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    expanded: expanded.map(e => ({ ...e })), currentGroup: null,
    finalized: new Set(finalized),
  });

  for (let g = 0; g < expanded.length; g++) {
    const grp = expanded[g];
    const prevDp = [...dp];
    for (let w = C; w >= grp.w; w--) {
      dp[w] = Math.max(dp[w], dp[w - grp.w] + grp.v);
    }

    const changed = dp.some((v, i) => v !== prevDp[i]);
    if (changed || g === expanded.length - 1) {
      for (let w = 0; w <= C; w++) if (dp[w] > 0) finalized.add(w);
      steps.push({
        title: `Group ${g+1}: ${grp.name}×${grp.cnt} (w=${grp.w},v=${grp.v})`,
        detail: `Process backwards w=${C}..${grp.w}. ${changed ? "Updated cells exist." : "No change."} dp[${C}]=${dp[C]}.`,
        dp: [...dp], current: null, phase: "fill", codeHL: [12, 13, 14, 15, 16],
        expanded: expanded.map(e => ({ ...e })), currentGroup: g,
        finalized: new Set(finalized), prevDp,
      });
    }
  }

  steps.push({
    title: `✓ Max Value = ${dp[C]}`,
    detail: `Bounded knapsack solved via binary splitting → 0/1 knapsack. dp[${C}]=${dp[C]}.`,
    dp: [...dp], current: null, phase: "done", codeHL: [18],
    expanded: expanded.map(e => ({ ...e })), currentGroup: null,
    finalized: new Set(finalized),
  });
  return steps;
}

function buildSteps_multiple(prob) {
  const { items, bins } = prob;
  const [W1, W2] = bins;
  const n = items.length;
  let dp = Array.from({ length: W1 + 1 }, () => new Array(W2 + 1).fill(0));
  const steps = [];
  const finalized = new Set();

  const snap = () => dp.map(r => [...r]);

  steps.push({
    title: `Initialize — dp[w1][w2] = 0, bins: [${W1}, ${W2}]`,
    detail: `${n} items, 2 bins with capacities ${W1} and ${W2}. dp[w1][w2] = max value using remaining caps w1, w2.`,
    dp: snap(), current: null, phase: "init", codeHL: [1, 2, 3, 4, 5],
    currentItem: null, finalized: new Set(finalized), bins,
    assignment: [],
  });

  const assignments = [];
  for (let idx = 0; idx < n; idx++) {
    const it = items[idx];
    const ndp = dp.map(r => [...r]);
    let anyChange = false;

    for (let w1 = W1; w1 >= 0; w1--) {
      for (let w2 = W2; w2 >= 0; w2--) {
        if (it.w <= w1 && dp[w1 - it.w][w2] + it.v > ndp[w1][w2]) {
          ndp[w1][w2] = dp[w1 - it.w][w2] + it.v;
          anyChange = true;
        }
        if (it.w <= w2 && dp[w1][w2 - it.w] + it.v > ndp[w1][w2]) {
          ndp[w1][w2] = dp[w1][w2 - it.w] + it.v;
          anyChange = true;
        }
      }
    }
    dp = ndp;

    steps.push({
      title: `Item ${idx+1} ${it.name} (w=${it.w},v=${it.v}): ${anyChange ? "Assigned" : "Skipped"}`,
      detail: `Try placing in Bin 1 (cap ${W1}) or Bin 2 (cap ${W2}). dp[${W1}][${W2}]=${dp[W1][W2]}. ${anyChange ? "Table updated." : "No improvement."}`,
      dp: snap(), current: null, phase: "fill",
      codeHL: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      currentItem: idx, finalized: new Set(finalized), bins,
      assignment: [],
    });
  }

  // Traceback (simplified — show final dp value)
  steps.push({
    title: `✓ Max Value = ${dp[W1][W2]}`,
    detail: `Optimal packing across both bins. dp[${W1}][${W2}]=${dp[W1][W2]}.`,
    dp: snap(), current: null, phase: "done", codeHL: [19],
    currentItem: null, finalized: new Set(finalized), bins,
    assignment: [],
  });
  return steps;
}

const BUILDERS = {
  zeroone: buildSteps_zeroone,
  fractional: buildSteps_fractional,
  unbounded: buildSteps_unbounded,
  bounded: buildSteps_bounded,
  multiple: buildSteps_multiple,
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Expected Outputs (precomputed)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const EXPECTED = {
  zeroone: { value: 9, items: "💻+📱+🎧", weight: 6 },
  fractional: { value: 240, items: "🥇 all + 🥈 all + 🥉 66.7%", weight: 50 },
  unbounded: { value: 10, items: "💎×3+🪙×1 (or variants)", weight: 7 },
  bounded: { value: 11, items: "📱×2+💻×1", weight: 7 },
  multiple: { value: 12, items: "Bin1: 📱+💻, Bin2: 📷", weight: "5+4" },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SHARED COMPONENTS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* ─── Code Panel ─── */
function CodePanel({ code, highlightLines }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {code.map((line) => {
          const hl = highlightLines.includes(line.id);
          return (
            <div key={`${line.id}-${line.text}`}
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
        â† Prev
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   IO PANELS — per variant
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function IOPanel_zeroone({ step, prob }) {
  const { items, capacity } = prob;
  const exp = EXPECTED.zeroone;
  const done = step.phase === "done";

  // Progressive: show current dp[n][C]
  const n = items.length;
  const curVal = step.dp[n] ? step.dp[n][capacity] : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">items</span> = [</div>
          {items.map((it, i) => (
            <div key={i} className="pl-4"><span className="text-zinc-300">({it.w}, {it.v})</span><span className="text-zinc-600">{` # ${it.name} ${it.label}`}</span>{i < items.length - 1 ? "," : ""}</div>
          ))}
          <div>]</div>
          <div><span className="text-zinc-500">cap  </span> = <span className="text-blue-400">{capacity}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">max_value</span> = <span className="text-zinc-300">{exp.value}</span>
          <span className="text-zinc-600 text-[10px] ml-2">({exp.items})</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && curVal === exp.value && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">dp[{n}][{capacity}]</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{curVal}</span>
        </div>
        {done && step.selectedItems && step.selectedItems.length > 0 && (
          <div className="mt-1.5 flex gap-1.5 flex-wrap">
            {step.selectedItems.map((idx, i) => (
              <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono">
                {items[idx].name} w={items[idx].w} v={items[idx].v}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IOPanel_fractional({ step, prob }) {
  const { capacity } = prob;
  const exp = EXPECTED.fractional;
  const done = step.phase === "done";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          {step.sortedItems.map((it, i) => (
            <div key={i}><span className="text-zinc-300">{it.name} w={it.w} v={it.v}</span> <span className="text-zinc-600">ratio={it.ratio.toFixed(1)}</span></div>
          ))}
          <div><span className="text-zinc-500">cap</span> = <span className="text-blue-400">{capacity}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">max_value</span> = <span className="text-zinc-300">{exp.value}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">total </span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{step.total % 1 === 0 ? step.total : step.total.toFixed(2)}</span></div>
          <div><span className="text-zinc-500">remain</span> = <span className="text-zinc-300">{step.remain}</span></div>
        </div>
        {step.taken.length > 0 && (
          <div className="mt-1.5 space-y-0.5">
            {step.taken.map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <span className="text-emerald-400">{t.name}</span>
                <span className="text-zinc-600">{t.frac < 1 ? `${(t.frac*100).toFixed(0)}%` : "100%"}</span>
                <span className="text-zinc-500 ml-auto">+{t.gained}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IOPanel_unbounded({ step, prob }) {
  const { items, capacity } = prob;
  const exp = EXPECTED.unbounded;
  const done = step.phase === "done";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          {items.map((it, i) => (
            <div key={i}><span className="text-zinc-300">{it.name} w={it.w} v={it.v}</span> <span className="text-zinc-600">×∞</span></div>
          ))}
          <div><span className="text-zinc-500">cap</span> = <span className="text-blue-400">{capacity}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">max_value</span> = <span className="text-zinc-300">{exp.value}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && step.dp[capacity] === exp.value && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">dp[{capacity}]</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{step.dp[capacity]}</span>
        </div>
        {done && step.selectedItems && (
          <div className="mt-1.5 flex gap-1 flex-wrap">
            {step.selectedItems.map((it, i) => (
              <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono">
                {it.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IOPanel_bounded({ step, prob }) {
  const { items, capacity } = prob;
  const exp = EXPECTED.bounded;
  const done = step.phase === "done";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          {items.map((it, i) => (
            <div key={i}><span className="text-zinc-300">{it.name} w={it.w} v={it.v}</span> <span className="text-amber-600">qty={it.qty}</span></div>
          ))}
          <div><span className="text-zinc-500">cap</span> = <span className="text-blue-400">{capacity}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">max_value</span> = <span className="text-zinc-300">{exp.value}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && step.dp[capacity] === exp.value && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">dp[{capacity}]</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{step.dp[capacity]}</span>
        </div>
      </div>
    </div>
  );
}

function IOPanel_multiple({ step, prob }) {
  const { items, bins } = prob;
  const exp = EXPECTED.multiple;
  const done = step.phase === "done";
  const [W1, W2] = bins;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          {items.map((it, i) => (
            <div key={i}><span className="text-zinc-300">{it.name} w={it.w} v={it.v}</span></div>
          ))}
          <div><span className="text-zinc-500">bins</span> = <span className="text-blue-400">[{bins.join(", ")}]</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">max_value</span> = <span className="text-zinc-300">{exp.value}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && step.dp[W1][W2] === exp.value && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">dp[{W1}][{W2}]</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{step.dp[W1] ? step.dp[W1][W2] : 0}</span>
        </div>
      </div>
    </div>
  );
}

const IO_PANELS = {
  zeroone: IOPanel_zeroone,
  fractional: IOPanel_fractional,
  unbounded: IOPanel_unbounded,
  bounded: IOPanel_bounded,
  multiple: IOPanel_multiple,
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION COMPONENTS — per variant
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* ─── 0/1 Knapsack: 2D DP Table ─── */
function DPTable2D({ step, items, capacity }) {
  const { dp, current, selectedItems } = step;
  const done = step.phase === "done";
  return (
    <div className="overflow-x-auto">
      <table className="font-mono text-[11px] w-full">
        <thead>
          <tr>
            <th className="py-1 text-left text-zinc-600 text-[10px] px-1.5 w-16">item\w</th>
            {Array.from({ length: capacity + 1 }, (_, w) => (
              <th key={w} className={`py-1 text-center text-[10px] w-9 ${current && current[1] === w ? "text-amber-400" : "text-zinc-600"}`}>{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dp.map((row, i) => (
            <tr key={i}>
              <td className={`py-0.5 text-[10px] px-1.5 ${current && current[0] === i ? "text-blue-400 font-bold" : "text-zinc-500"}`}>
                {i === 0 ? "∅" : `${i} ${items[i-1].name}`}
              </td>
              {row.map((val, w) => {
                const isCurr = current && current[0] === i && current[1] === w;
                const isTrace = done && selectedItems && selectedItems.some(idx => {
                  // Highlight traceback path
                  return false; // simplified
                });
                return (
                  <td key={w} className={`text-center py-0.5 rounded transition-all ${
                    isCurr ? "bg-blue-900/60 text-blue-200 font-bold ring-1 ring-blue-500" :
                    done && i === dp.length - 1 && w === capacity ? "bg-emerald-900/40 text-emerald-300 font-bold" :
                    val > 0 ? "text-zinc-300" : "text-zinc-700"
                  }`}>{val}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Fractional: Sorted Items Bar ─── */
function FractionalViz({ step }) {
  const { sortedItems, taken, currentIdx, remain } = step;
  const totalCap = 50;

  return (
    <div className="space-y-2">
      <div className="text-[10px] text-zinc-500 mb-1">Sorted by ratio (v/w) • bars show fill</div>
      {sortedItems.map((it, i) => {
        const t = taken.find(x => x.idx === it.idx);
        const frac = t ? t.frac : 0;
        const isCurrent = currentIdx === i;
        return (
          <div key={i} className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${isCurrent ? "bg-zinc-800 ring-1 ring-amber-700" : ""}`}>
            <span className="text-lg w-7 text-center">{it.name}</span>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-zinc-400">{it.label} (r={it.ratio.toFixed(1)})</span>
                <span className="text-zinc-600">w={it.w} v={it.v}</span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${frac >= 1 ? "bg-emerald-600" : frac > 0 ? "bg-amber-600" : "bg-zinc-700"}`}
                  style={{ width: `${frac * 100}%` }} />
              </div>
            </div>
            <span className="text-[10px] font-mono w-10 text-right text-zinc-500">
              {frac > 0 ? (frac < 1 ? `${(frac*100).toFixed(0)}%` : "100%") : "—"}
            </span>
          </div>
        );
      })}
      <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${((totalCap - remain) / totalCap) * 100}%` }} />
      </div>
      <div className="text-[9px] text-zinc-600 text-center">Capacity: {totalCap - remain}/{totalCap}</div>
    </div>
  );
}

/* ─── Unbounded: 1D DP Array ─── */
function DPArray1D({ step, capacity }) {
  const { dp, current, finalized } = step;
  return (
    <div>
      <div className="text-[10px] text-zinc-500 mb-2">dp[w] — iterate left to right (allows reuse)</div>
      <div className="flex gap-1 flex-wrap">
        {dp.map((val, w) => {
          const isCurr = current === w;
          const isFinal = finalized.has(w);
          return (
            <div key={w} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-zinc-600 font-mono">{w}</span>
              <div className={`w-10 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                isCurr ? "bg-blue-900/60 border-blue-500 text-blue-200 scale-110" :
                step.phase === "done" && w === capacity ? "bg-emerald-900/40 border-emerald-700 text-emerald-300" :
                isFinal && val > 0 ? "bg-zinc-800 border-zinc-600 text-zinc-200" :
                "bg-zinc-900 border-zinc-800 text-zinc-600"
              }`}>{val}</div>
            </div>
          );
        })}
      </div>
      <div className="text-[9px] text-zinc-700 mt-1.5 text-center">↑ forward iteration = items reusable</div>
    </div>
  );
}

/* ─── Bounded: 1D DP + Expanded Groups ─── */
function BoundedViz({ step, prob }) {
  const { dp, expanded, currentGroup, prevDp } = step;
  const C = prob.capacity;
  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] text-zinc-500 mb-1.5">Binary-split groups • current → blue</div>
        <div className="flex gap-1 flex-wrap">
          {expanded && expanded.map((g, i) => (
            <span key={i} className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono border ${
              currentGroup === i ? "bg-blue-950 border-blue-700 text-blue-300" :
              currentGroup !== null && i < currentGroup ? "bg-emerald-950/30 border-emerald-900 text-emerald-400" :
              "bg-zinc-900 border-zinc-800 text-zinc-500"
            }`}>{g.name}×{g.cnt}</span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] text-zinc-500 mb-1.5">dp[w] — backwards iteration (0/1 style)</div>
        <div className="flex gap-1 flex-wrap">
          {dp.map((val, w) => {
            const changed = prevDp && val !== prevDp[w];
            return (
              <div key={w} className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-zinc-600 font-mono">{w}</span>
                <div className={`w-9 text-center py-1 rounded-lg font-mono text-[11px] font-bold border transition-all ${
                  changed ? "bg-emerald-900/50 border-emerald-600 text-emerald-200 scale-105" :
                  step.phase === "done" && w === C ? "bg-emerald-900/40 border-emerald-700 text-emerald-300" :
                  val > 0 ? "bg-zinc-800 border-zinc-700 text-zinc-300" :
                  "bg-zinc-900 border-zinc-800 text-zinc-700"
                }`}>{val}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Multiple: 2D dp[w1][w2] heatmap ─── */
function MultipleViz({ step }) {
  const { dp, bins } = step;
  const [W1, W2] = bins;
  const maxVal = Math.max(...dp.flat(), 1);

  return (
    <div>
      <div className="text-[10px] text-zinc-500 mb-1.5">dp[w1][w2] • Bin 1 cap ↓, Bin 2 cap →</div>
      <div className="overflow-x-auto">
        <table className="font-mono text-[10px]">
          <thead>
            <tr>
              <th className="w-8 py-0.5 text-zinc-600">w1\w2</th>
              {Array.from({ length: W2 + 1 }, (_, w2) => (
                <th key={w2} className="w-8 py-0.5 text-center text-zinc-600">{w2}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dp.map((row, w1) => (
              <tr key={w1}>
                <td className="py-0.5 text-zinc-600 text-center">{w1}</td>
                {row.map((val, w2) => {
                  const intensity = val > 0 ? Math.max(0.15, val / maxVal * 0.7) : 0;
                  const isFinal = w1 === W1 && w2 === W2;
                  return (
                    <td key={w2} className={`text-center py-0.5 rounded transition-all ${
                      isFinal && step.phase === "done" ? "ring-1 ring-emerald-500 text-emerald-200 font-bold" :
                      val > 0 ? "text-zinc-200" : "text-zinc-700"
                    }`} style={val > 0 ? { backgroundColor: `rgba(59, 130, 246, ${intensity})` } : {}}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ITEMS DISPLAY — shared across variants
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function ItemsRow({ items, step, variant }) {
  const done = step.phase === "done";
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {items.map((it, i) => {
        const isSelected = done && step.selectedItems && step.selectedItems.includes(i);
        const isCurrent = variant === "zeroone" && step.current && step.current[0] === i + 1;
        const isCurrentMulti = variant === "multiple" && step.currentItem === i;
        return (
          <div key={i} className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border transition-all ${
            isSelected ? "bg-emerald-950 border-emerald-700 scale-105" :
            isCurrent || isCurrentMulti ? "bg-blue-950 border-blue-800" :
            "bg-zinc-900 border-zinc-800"
          }`}>
            <span className="text-xl">{it.name}</span>
            <span className={`text-[10px] font-mono ${isSelected ? "text-emerald-300" : "text-zinc-500"}`}>
              w={it.w} v={it.v}{it.qty !== undefined ? ` ×${it.qty}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function KnapsackViz() {
  const [exKey, setExKey] = useState("zeroone");
  const [si, setSi] = useState(0);
  const prob = PROBLEMS[exKey];
  const steps = useMemo(() => BUILDERS[exKey](prob), [exKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const code = CODES[exKey];
  const IOPanel = IO_PANELS[exKey];

  const switchEx = (k) => { setExKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        {/* â•â•â• 1. Header + Problem Switcher â•â•â• */}
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Knapsack Problems</h1>
            <p className="text-zinc-500 text-sm mt-0.5">5 Variants • DP & Greedy Strategies</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(PROBLEMS).map(([k, v]) => (
              <button key={k} onClick={() => switchEx(k)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  exKey === k ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {v.title}
              </button>
            ))}
          </div>
        </div>

        {/* â•â•â• 2. Core Idea â•â•â• */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea — {prob.subtitle}</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{prob.coreIdea}</p>
        </div>

        {/* â•â•â• 3. Navigation â•â•â• */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 4. 3-Column Grid â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Items ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} prob={prob} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-2">
                {prob.items ? `${prob.items.length} items` : ""} • {prob.capacity ? `cap=${prob.capacity}` : `bins=[${prob.bins.join(",")}]`}
              </div>
              <ItemsRow items={prob.items} step={step} variant={exKey} />
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "fill" ? "bg-blue-900 text-blue-300" :
                  step.phase === "take" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "fraction" ? "bg-amber-900 text-amber-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Visualization area — varies by variant */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                {exKey === "zeroone" ? "DP Table — dp[i][w]" :
                 exKey === "fractional" ? "Greedy Selection" :
                 exKey === "unbounded" ? "DP Array — dp[w]" :
                 exKey === "bounded" ? "Binary Split → 0/1 DP" :
                 "DP Table — dp[w1][w2]"}
              </div>
              {exKey === "zeroone" && <DPTable2D step={step} items={prob.items} capacity={prob.capacity} />}
              {exKey === "fractional" && <FractionalViz step={step} />}
              {exKey === "unbounded" && <DPArray1D step={step} capacity={prob.capacity} />}
              {exKey === "bounded" && <BoundedViz step={step} prob={prob} />}
              {exKey === "multiple" && <MultipleViz step={step} />}
            </div>

            {/* Decision panel for 0/1 */}
            {exKey === "zeroone" && step.comparing && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Decision</div>
                <div className="flex gap-3 justify-center">
                  <div className={`flex-1 text-center p-2.5 rounded-xl border ${step.comparing.exclude >= step.comparing.include ? "bg-amber-950/50 border-amber-800" : "border-zinc-800"}`}>
                    <div className="text-[10px] text-amber-400 mb-0.5">EXCLUDE</div>
                    <div className="text-xl font-bold font-mono text-amber-300">{step.comparing.exclude}</div>
                  </div>
                  <div className="flex items-center text-zinc-700 font-bold text-sm">vs</div>
                  <div className={`flex-1 text-center p-2.5 rounded-xl border ${step.comparing.include > step.comparing.exclude ? "bg-emerald-950/50 border-emerald-800" : "border-zinc-800"}`}>
                    <div className="text-[10px] text-emerald-400 mb-0.5">INCLUDE</div>
                    <div className="text-xl font-bold font-mono text-emerald-300">{step.comparing.include}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Completion card */}
            {step.phase === "done" && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Result</div>
                <div className="font-mono text-[11px] text-emerald-300">
                  {exKey === "zeroone" && `Max value: ${step.dp[prob.items.length][prob.capacity]}. Selected: ${step.selectedItems.map(i => prob.items[i].name).join(" + ")}`}
                  {exKey === "fractional" && `Max value: ${step.total % 1 === 0 ? step.total : step.total.toFixed(2)}. Greedy optimal — O(n log n).`}
                  {exKey === "unbounded" && `Max value: ${step.dp[prob.capacity]}. Items reusable — forward iteration.`}
                  {exKey === "bounded" && `Max value: ${step.dp[prob.capacity]}. Binary-split → 0/1 reduction.`}
                  {exKey === "multiple" && `Max value: ${step.dp[prob.bins[0]][prob.bins[1]]}. Optimal across both bins.`}
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel code={code} highlightLines={step.codeHL} />
          </div>
        </div>

        {/* â•â•â• 5. Bottom Row: When to Use + Classic Problems â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>0/1: Each item used once — subset selection, partition</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Fractional: Items divisible — greedy by ratio is optimal</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Unbounded: Unlimited reuse — coin change, rod cutting</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Bounded: Fixed quantities — binary split to 0/1</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Multiple: Multi-bin packing — scheduling, allocation</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">0/1 Time:</span> O(n × W) pseudo-polynomial</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(W) with 1D optimization</div>
                <div><span className="text-zinc-500 font-semibold">Key trick:</span> Backwards iteration = 0/1, Forwards = unbounded</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 416 — Partition Equal Subset Sum</span><span className="ml-auto text-[10px] text-amber-700">0/1</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 494 — Target Sum</span><span className="ml-auto text-[10px] text-amber-700">0/1</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 322 — Coin Change</span><span className="ml-auto text-[10px] text-blue-700">Unbound</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 518 — Coin Change II</span><span className="ml-auto text-[10px] text-blue-700">Unbound</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 474 — Ones and Zeroes</span><span className="ml-auto text-[10px] text-violet-700">Multi-dim</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1049 — Last Stone Weight II</span><span className="ml-auto text-[10px] text-amber-700">0/1</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 279 — Perfect Squares</span><span className="ml-auto text-[10px] text-blue-700">Unbound</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1235 — Job Scheduling</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
