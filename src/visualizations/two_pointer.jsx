import { useState, useMemo } from "react";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PROBLEM DEFINITIONS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const PROBLEMS = {
  container: {
    title: "Container With Most Water",
    lc: "LC 11 Â· Medium",
    coreIdea:
      "Start two pointers at both ends of the array. The area between them is min(height[L], height[R]) Ã— (Râˆ’L). Always move the shorter side inward â€” the taller side can never do better with a narrower width, but the shorter side might find a taller bar. This greedy shrink guarantees we never skip the optimal pair. O(n) single pass.",
    arr: [1, 8, 6, 2, 5, 4, 8, 3, 7],
    category: "converge",
  },
  trapping: {
    title: "Trapping Rain Water",
    lc: "LC 42 Â· Hard",
    coreIdea:
      "Water at position i = min(left_max, right_max) âˆ’ height[i]. Instead of precomputing both max arrays, use two pointers from the ends. Track left_max and right_max. If left_max â‰¤ right_max, process the left pointer (the bottleneck is the left side); otherwise process right. Each step finalizes one cell's water. O(n) time, O(1) space.",
    arr: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
    category: "converge",
  },
  threeSum: {
    title: "3Sum",
    lc: "LC 15 Â· Medium",
    coreIdea:
      "Sort the array. Fix element nums[i], then use two pointers lo=i+1, hi=nâˆ’1 to find pairs summing to âˆ’nums[i]. If sum < 0, move lo right; if sum > 0, move hi left; if sum = 0, record triplet and skip duplicates on both sides. Outer loop also skips duplicates. O(nÂ²) total.",
    arr: [-1, 0, 1, 2, -1, -4],
    category: "sort+converge",
  },
  sortColors: {
    title: "Sort Colors",
    lc: "LC 75 Â· Medium",
    coreIdea:
      "Dutch National Flag: maintain three pointers â€” lo (boundary for 0s), mid (scanner), hi (boundary for 2s). If nums[mid]=0, swap with lo and advance both. If nums[mid]=2, swap with hi and shrink hi (don't advance mid â€” swapped value is unexamined). If nums[mid]=1, just advance mid. One pass, O(n) time, O(1) space.",
    arr: [2, 0, 2, 1, 1, 0, 1, 2, 0],
    category: "partition",
  },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CODE PER PROBLEM
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const CODES = {
  container: [
    { id: 0,  text: `def max_area(height):` },
    { id: 1,  text: `    l, r = 0, len(height) - 1` },
    { id: 2,  text: `    best = 0` },
    { id: 3,  text: `` },
    { id: 4,  text: `    while l < r:` },
    { id: 5,  text: `        w = r - l` },
    { id: 6,  text: `        h = min(height[l], height[r])` },
    { id: 7,  text: `        best = max(best, w * h)` },
    { id: 8,  text: `` },
    { id: 9,  text: `        if height[l] < height[r]:` },
    { id: 10, text: `            l += 1` },
    { id: 11, text: `        else:` },
    { id: 12, text: `            r -= 1` },
    { id: 13, text: `` },
    { id: 14, text: `    return best` },
  ],
  trapping: [
    { id: 0,  text: `def trap(height):` },
    { id: 1,  text: `    l, r = 0, len(height) - 1` },
    { id: 2,  text: `    l_max = r_max = 0` },
    { id: 3,  text: `    water = 0` },
    { id: 4,  text: `` },
    { id: 5,  text: `    while l <= r:` },
    { id: 6,  text: `        if l_max <= r_max:` },
    { id: 7,  text: `            l_max = max(l_max, height[l])` },
    { id: 8,  text: `            water += l_max - height[l]` },
    { id: 9,  text: `            l += 1` },
    { id: 10, text: `        else:` },
    { id: 11, text: `            r_max = max(r_max, height[r])` },
    { id: 12, text: `            water += r_max - height[r]` },
    { id: 13, text: `            r -= 1` },
    { id: 14, text: `` },
    { id: 15, text: `    return water` },
  ],
  threeSum: [
    { id: 0,  text: `def three_sum(nums):` },
    { id: 1,  text: `    nums.sort()` },
    { id: 2,  text: `    res = []` },
    { id: 3,  text: `` },
    { id: 4,  text: `    for i in range(len(nums) - 2):` },
    { id: 5,  text: `        if i > 0 and nums[i] == nums[i-1]:` },
    { id: 6,  text: `            continue` },
    { id: 7,  text: `        lo, hi = i + 1, len(nums) - 1` },
    { id: 8,  text: `` },
    { id: 9,  text: `        while lo < hi:` },
    { id: 10, text: `            s = nums[i] + nums[lo] + nums[hi]` },
    { id: 11, text: `            if s < 0:` },
    { id: 12, text: `                lo += 1` },
    { id: 13, text: `            elif s > 0:` },
    { id: 14, text: `                hi -= 1` },
    { id: 15, text: `            else:` },
    { id: 16, text: `                res.append([nums[i],nums[lo],nums[hi]])` },
    { id: 17, text: `                lo += 1; hi -= 1` },
    { id: 18, text: `                while lo<hi and nums[lo]==nums[lo-1]:` },
    { id: 19, text: `                    lo += 1` },
    { id: 20, text: `` },
    { id: 21, text: `    return res` },
  ],
  sortColors: [
    { id: 0,  text: `def sort_colors(nums):` },
    { id: 1,  text: `    lo, mid, hi = 0, 0, len(nums) - 1` },
    { id: 2,  text: `` },
    { id: 3,  text: `    while mid <= hi:` },
    { id: 4,  text: `        if nums[mid] == 0:` },
    { id: 5,  text: `            nums[lo], nums[mid] = nums[mid], nums[lo]` },
    { id: 6,  text: `            lo += 1` },
    { id: 7,  text: `            mid += 1` },
    { id: 8,  text: `        elif nums[mid] == 1:` },
    { id: 9,  text: `            mid += 1` },
    { id: 10, text: `        else:` },
    { id: 11, text: `            nums[mid], nums[hi] = nums[hi], nums[mid]` },
    { id: 12, text: `            hi -= 1` },
    { id: 13, text: `` },
    { id: 14, text: `    return nums` },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   EXPECTED OUTPUTS (precomputed)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function computeExpected(key) {
  const p = PROBLEMS[key];
  if (key === "container") {
    const h = p.arr;
    let l = 0, r = h.length - 1, best = 0, bestL = 0, bestR = 0;
    while (l < r) {
      const area = Math.min(h[l], h[r]) * (r - l);
      if (area > best) { best = area; bestL = l; bestR = r; }
      if (h[l] < h[r]) l++; else r--;
    }
    return { best, bestL, bestR };
  }
  if (key === "trapping") {
    const h = p.arr;
    let l = 0, r = h.length - 1, lm = 0, rm = 0, water = 0;
    const waterAt = new Array(h.length).fill(0);
    while (l <= r) {
      if (lm <= rm) { lm = Math.max(lm, h[l]); waterAt[l] = lm - h[l]; water += waterAt[l]; l++; }
      else { rm = Math.max(rm, h[r]); waterAt[r] = rm - h[r]; water += waterAt[r]; r--; }
    }
    return { water, waterAt };
  }
  if (key === "threeSum") {
    const nums = [...p.arr].sort((a, b) => a - b);
    const res = [];
    for (let i = 0; i < nums.length - 2; i++) {
      if (i > 0 && nums[i] === nums[i - 1]) continue;
      let lo = i + 1, hi = nums.length - 1;
      while (lo < hi) {
        const s = nums[i] + nums[lo] + nums[hi];
        if (s < 0) lo++;
        else if (s > 0) hi--;
        else { res.push([nums[i], nums[lo], nums[hi]]); lo++; hi--; while (lo < hi && nums[lo] === nums[lo - 1]) lo++; }
      }
    }
    return { sorted: nums, triplets: res };
  }
  if (key === "sortColors") {
    return { sorted: [...p.arr].sort((a, b) => a - b) };
  }
}

const EXPECTED = Object.fromEntries(Object.keys(PROBLEMS).map(k => [k, computeExpected(k)]));

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS â€” CONTAINER WITH MOST WATER
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildContainerSteps() {
  const h = PROBLEMS.container.arr;
  const n = h.length;
  const steps = [];
  let l = 0, r = n - 1, best = 0, bestL = 0, bestR = 0;
  const finalized = new Set();

  steps.push({
    title: "Initialize â€” Two Pointers at Both Ends",
    detail: `L=0, R=${n - 1}. Width = ${n - 1}. We'll shrink inward, always moving the shorter side.`,
    arr: [...h], l: 0, r: n - 1, best: 0, bestL: -1, bestR: -1,
    area: 0, phase: "init", codeHL: [0, 1, 2],
    finalized: new Set(finalized), waterRegion: null,
  });

  while (l < r) {
    const w = r - l;
    const minH = Math.min(h[l], h[r]);
    const area = w * minH;
    const improved = area > best;
    if (improved) { best = area; bestL = l; bestR = r; }

    steps.push({
      title: improved
        ? `Area(${l},${r}) = min(${h[l]},${h[r]})Ã—${w} = ${area} â€” New Best!`
        : `Area(${l},${r}) = min(${h[l]},${h[r]})Ã—${w} = ${area} â‰¤ ${best}`,
      detail: improved
        ? `min(height[${l}], height[${r}]) Ã— (${r}âˆ’${l}) = ${minH}Ã—${w} = ${area}. Update best = ${area}.`
        : `min(height[${l}], height[${r}]) Ã— (${r}âˆ’${l}) = ${minH}Ã—${w} = ${area}. No improvement over ${best}.`,
      arr: [...h], l, r, best, bestL, bestR,
      area, phase: improved ? "improve" : "compute",
      codeHL: [4, 5, 6, 7],
      finalized: new Set(finalized),
      waterRegion: { l, r, h: minH },
    });

    const movedSide = h[l] < h[r] ? "left" : "right";
    const oldL = l, oldR = r;
    if (h[l] < h[r]) { finalized.add(l); l++; }
    else { finalized.add(r); r--; }

    steps.push({
      title: movedSide === "left"
        ? `Move L: height[${oldL}]=${h[oldL]} < height[${oldR}]=${h[oldR]} â†’ L=${l}`
        : `Move R: height[${oldR}]=${h[oldR]} â‰¤ height[${oldL}]=${h[oldL]} â†’ R=${r}`,
      detail: movedSide === "left"
        ? `Left side is shorter â€” it's the bottleneck. Moving it inward might find a taller bar.`
        : `Right side is shorter (or equal) â€” move it inward to potentially find a taller bar.`,
      arr: [...h], l, r, best, bestL, bestR,
      area: 0, phase: "move",
      codeHL: movedSide === "left" ? [9, 10] : [11, 12],
      finalized: new Set(finalized), waterRegion: null,
    });
  }

  steps.push({
    title: `âœ“ Complete â€” Max Area = ${best}`,
    detail: `Best pair: L=${bestL}, R=${bestR}. Area = min(${h[bestL]},${h[bestR]}) Ã— ${bestR - bestL} = ${best}.`,
    arr: [...h], l, r, best, bestL, bestR,
    area: best, phase: "done", codeHL: [14],
    finalized: new Set(finalized),
    waterRegion: { l: bestL, r: bestR, h: Math.min(h[bestL], h[bestR]) },
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS â€” TRAPPING RAIN WATER
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildTrappingSteps() {
  const h = PROBLEMS.trapping.arr;
  const n = h.length;
  const steps = [];
  let l = 0, r = n - 1, lm = 0, rm = 0, water = 0;
  const waterAt = new Array(n).fill(0);
  const finalized = new Set();

  steps.push({
    title: "Initialize â€” Pointers at Both Ends",
    detail: `L=0, R=${n - 1}. left_max=0, right_max=0, water=0. Process the side with the smaller max.`,
    arr: [...h], l: 0, r: n - 1, lm: 0, rm: 0, water: 0,
    waterAt: [...waterAt], phase: "init", codeHL: [0, 1, 2, 3],
    finalized: new Set(finalized), processed: null,
  });

  while (l <= r) {
    let side, idx, added;
    if (lm <= rm) {
      side = "left";
      idx = l;
      lm = Math.max(lm, h[l]);
      added = lm - h[l];
      waterAt[l] = added;
      water += added;
      finalized.add(l);
      l++;
    } else {
      side = "right";
      idx = r;
      rm = Math.max(rm, h[r]);
      added = rm - h[r];
      waterAt[r] = added;
      water += added;
      finalized.add(r);
      r--;
    }

    steps.push({
      title: added > 0
        ? `Process ${side} [${idx}]: h=${h[idx]}, ${side === "left" ? "l_max" : "r_max"}=${side === "left" ? lm : rm} â†’ water += ${added}`
        : `Process ${side} [${idx}]: h=${h[idx]}, ${side === "left" ? "l_max" : "r_max"}=${side === "left" ? lm : rm} â†’ no water`,
      detail: side === "left"
        ? `l_max â‰¤ r_max (${lm}â‰¤${rm}): update l_max=max(${lm},${h[idx]})=${lm}. Water at [${idx}] = ${lm}âˆ’${h[idx]} = ${added}. Total = ${water}.`
        : `l_max > r_max: update r_max=max(${rm},${h[idx]})=${rm}. Water at [${idx}] = ${rm}âˆ’${h[idx]} = ${added}. Total = ${water}.`,
      arr: [...h], l, r, lm, rm, water,
      waterAt: [...waterAt], phase: added > 0 ? "fill" : "scan",
      codeHL: side === "left" ? [5, 6, 7, 8, 9] : [5, 10, 11, 12, 13],
      finalized: new Set(finalized), processed: idx,
    });
  }

  steps.push({
    title: `âœ“ Complete â€” Total Water = ${water}`,
    detail: `Every cell processed. Water collected: [${waterAt.join(", ")}]. Sum = ${water}.`,
    arr: [...h], l, r, lm, rm, water,
    waterAt: [...waterAt], phase: "done", codeHL: [15],
    finalized: new Set(finalized), processed: null,
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS â€” 3SUM
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildThreeSumSteps() {
  const original = PROBLEMS.threeSum.arr;
  const nums = [...original].sort((a, b) => a - b);
  const n = nums.length;
  const steps = [];
  const triplets = [];
  const finalized = new Set();

  steps.push({
    title: "Sort the Array",
    detail: `Original: [${original.join(", ")}] â†’ Sorted: [${nums.join(", ")}]. Sorting enables the two-pointer squeeze.`,
    arr: [...nums], i: -1, lo: -1, hi: -1, sum: null,
    triplets: [], phase: "init", codeHL: [0, 1, 2],
    finalized: new Set(finalized), found: null,
  });

  for (let i = 0; i < n - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        title: `Skip Duplicate: nums[${i}]=${nums[i]} == nums[${i - 1}]`,
        detail: `Already processed nums[i]=${nums[i]}. Skip to avoid duplicate triplets.`,
        arr: [...nums], i, lo: -1, hi: -1, sum: null,
        triplets: triplets.map(t => [...t]), phase: "skip-i",
        codeHL: [4, 5, 6], finalized: new Set(finalized), found: null,
      });
      continue;
    }

    let lo = i + 1, hi = n - 1;

    steps.push({
      title: `Fix i=${i} (nums[i]=${nums[i]}), Target = ${-nums[i]}`,
      detail: `Need lo+hi pair summing to ${-nums[i]}. Set lo=${lo}, hi=${hi}.`,
      arr: [...nums], i, lo, hi, sum: null,
      triplets: triplets.map(t => [...t]), phase: "fix-i",
      codeHL: [4, 7], finalized: new Set(finalized), found: null,
    });

    while (lo < hi) {
      const s = nums[i] + nums[lo] + nums[hi];

      if (s < 0) {
        steps.push({
          title: `Sum = ${nums[i]}+${nums[lo]}+${nums[hi]} = ${s} < 0 â†’ lo++`,
          detail: `Sum too small. Move lo right to increase sum. lo: ${lo} â†’ ${lo + 1}.`,
          arr: [...nums], i, lo, hi, sum: s,
          triplets: triplets.map(t => [...t]), phase: "too-low",
          codeHL: [9, 10, 11, 12], finalized: new Set(finalized), found: null,
        });
        lo++;
      } else if (s > 0) {
        steps.push({
          title: `Sum = ${nums[i]}+${nums[lo]}+${nums[hi]} = ${s} > 0 â†’ hi--`,
          detail: `Sum too large. Move hi left to decrease sum. hi: ${hi} â†’ ${hi - 1}.`,
          arr: [...nums], i, lo, hi, sum: s,
          triplets: triplets.map(t => [...t]), phase: "too-high",
          codeHL: [9, 10, 13, 14], finalized: new Set(finalized), found: null,
        });
        hi--;
      } else {
        const triplet = [nums[i], nums[lo], nums[hi]];
        triplets.push(triplet);
        finalized.add(`${i},${lo},${hi}`);

        steps.push({
          title: `âœ“ Found: [${triplet.join(", ")}] â€” sum = 0`,
          detail: `nums[${i}]+nums[${lo}]+nums[${hi}] = ${nums[i]}+${nums[lo]}+${nums[hi]} = 0. Record triplet #${triplets.length}. Skip duplicates.`,
          arr: [...nums], i, lo, hi, sum: 0,
          triplets: triplets.map(t => [...t]), phase: "found",
          codeHL: [15, 16, 17, 18, 19], finalized: new Set(finalized),
          found: { i, lo, hi },
        });

        lo++; hi--;
        while (lo < hi && nums[lo] === nums[lo - 1]) lo++;
      }
    }
  }

  steps.push({
    title: `âœ“ Complete â€” ${triplets.length} Triplet${triplets.length !== 1 ? "s" : ""} Found`,
    detail: `All unique triplets: ${triplets.map(t => `[${t.join(",")}]`).join(", ")}.`,
    arr: [...nums], i: -1, lo: -1, hi: -1, sum: null,
    triplets: triplets.map(t => [...t]), phase: "done",
    codeHL: [21], finalized: new Set(finalized), found: null,
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS â€” SORT COLORS (Dutch National Flag)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildSortColorsSteps() {
  const arr = [...PROBLEMS.sortColors.arr];
  const n = arr.length;
  const steps = [];
  let lo = 0, mid = 0, hi = n - 1;
  const finalized = new Set();

  steps.push({
    title: "Initialize â€” Three Pointers",
    detail: `lo=0 (0-boundary), mid=0 (scanner), hi=${hi} (2-boundary). Everything left of lo is 0, right of hi is 2.`,
    arr: [...arr], lo: 0, mid: 0, hi,
    phase: "init", codeHL: [0, 1],
    finalized: new Set(finalized), swapped: null,
  });

  while (mid <= hi) {
    const val = arr[mid];
    if (val === 0) {
      const swapWith = lo;
      [arr[lo], arr[mid]] = [arr[mid], arr[lo]];
      steps.push({
        title: `nums[mid=${mid}]=0 â†’ Swap with lo=${swapWith}, advance both`,
        detail: `Swap arr[${mid}]â†”arr[${swapWith}]: [${arr.join(", ")}]. lo=${lo}â†’${lo + 1}, mid=${mid}â†’${mid + 1}.`,
        arr: [...arr], lo: lo + 1, mid: mid + 1, hi,
        phase: "swap-0", codeHL: [3, 4, 5, 6, 7],
        finalized: new Set(finalized),
        swapped: [lo, mid],
      });
      lo++; mid++;
    } else if (val === 1) {
      steps.push({
        title: `nums[mid=${mid}]=1 â†’ Already in middle, advance mid`,
        detail: `1 is in the correct partition. mid=${mid}â†’${mid + 1}.`,
        arr: [...arr], lo, mid: mid + 1, hi,
        phase: "skip-1", codeHL: [3, 8, 9],
        finalized: new Set(finalized), swapped: null,
      });
      mid++;
    } else {
      const swapWith = hi;
      [arr[mid], arr[hi]] = [arr[hi], arr[mid]];
      steps.push({
        title: `nums[mid=${mid}]=2 â†’ Swap with hi=${swapWith}, shrink hi`,
        detail: `Swap arr[${mid}]â†”arr[${swapWith}]: [${arr.join(", ")}]. hi=${hi}â†’${hi - 1}. Don't advance mid â€” new value unexamined.`,
        arr: [...arr], lo, mid, hi: hi - 1,
        phase: "swap-2", codeHL: [3, 10, 11, 12],
        finalized: new Set(finalized),
        swapped: [mid, hi],
      });
      hi--;
    }
  }

  steps.push({
    title: "âœ“ Complete â€” Array Sorted",
    detail: `mid > hi: all elements partitioned. Result: [${arr.join(", ")}].`,
    arr: [...arr], lo, mid, hi,
    phase: "done", codeHL: [14],
    finalized: new Set(finalized), swapped: null,
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP BUILDER DISPATCH
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildSteps(key) {
  switch (key) {
    case "container": return buildContainerSteps();
    case "trapping": return buildTrappingSteps();
    case "threeSum": return buildThreeSumSteps();
    case "sortColors": return buildSortColorsSteps();
    default: return [];
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION â€” CONTAINER WITH MOST WATER
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function ContainerViz({ step }) {
  const { arr, l, r, bestL, bestR, waterRegion, phase } = step;
  const n = arr.length;
  const maxH = Math.max(...arr);
  const barW = 38, gap = 6, pad = 30;
  const totalW = n * (barW + gap) - gap + pad * 2;
  const chartH = 180, topPad = 25;

  return (
    <svg viewBox={`0 0 ${totalW} ${chartH + topPad + 30}`} className="w-full" style={{ maxHeight: 240 }}>
      {/* Water region */}
      {waterRegion && (
        <rect
          x={pad + waterRegion.l * (barW + gap)}
          y={topPad + chartH - (waterRegion.h / maxH) * chartH}
          width={(waterRegion.r - waterRegion.l) * (barW + gap) + barW}
          height={(waterRegion.h / maxH) * chartH}
          fill="rgba(59, 130, 246, 0.12)" stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="1" strokeDasharray="4 2" rx="2"
        />
      )}
      {/* Bars */}
      {arr.map((h, i) => {
        const x = pad + i * (barW + gap);
        const barH = (h / maxH) * chartH;
        const y = topPad + chartH - barH;
        const isL = i === l, isR = i === r;
        const isBestL = i === bestL && phase === "done";
        const isBestR = i === bestR && phase === "done";
        const fill = (isBestL || isBestR) ? "#10b981"
          : isL ? "#3b82f6" : isR ? "#f59e0b"
          : step.finalized.has(i) ? "#3f3f46" : "#52525b";
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={fill} rx={3} />
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="600" fontFamily="monospace">{h}</text>
            <text x={x + barW / 2} y={topPad + chartH + 14} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">{i}</text>
            {isL && <text x={x + barW / 2} y={topPad + chartH + 26} textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="700">L</text>}
            {isR && <text x={x + barW / 2} y={topPad + chartH + 26} textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">R</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION â€” TRAPPING RAIN WATER
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function TrappingViz({ step }) {
  const { arr, l, r, waterAt, finalized, processed } = step;
  const n = arr.length;
  const maxH = Math.max(...arr, 1);
  const barW = 34, gap = 4, pad = 20;
  const totalW = n * (barW + gap) - gap + pad * 2;
  const chartH = 160, topPad = 20;

  return (
    <svg viewBox={`0 0 ${totalW} ${chartH + topPad + 30}`} className="w-full" style={{ maxHeight: 230 }}>
      {arr.map((h, i) => {
        const x = pad + i * (barW + gap);
        const barH = (h / maxH) * chartH;
        const y = topPad + chartH - barH;
        const w = waterAt[i];
        const waterH = (w / maxH) * chartH;
        const isL = i === l, isR = i === r;
        const isProcessed = i === processed;
        const isFin = finalized.has(i);
        const fill = isProcessed ? "#f59e0b" : isL ? "#3b82f6" : isR ? "#ef4444" : isFin ? "#52525b" : "#71717a";

        return (
          <g key={i}>
            {/* Water on top of bar */}
            {w > 0 && (
              <rect x={x} y={y - waterH} width={barW} height={waterH}
                fill="rgba(59, 130, 246, 0.35)" rx={2} />
            )}
            <rect x={x} y={y} width={barW} height={barH} fill={fill} rx={3} />
            <text x={x + barW / 2} y={y - waterH - 4} textAnchor="middle" fill="#a1a1aa" fontSize="9" fontWeight="600" fontFamily="monospace">
              {w > 0 ? `+${w}` : h}
            </text>
            <text x={x + barW / 2} y={topPad + chartH + 12} textAnchor="middle" fill="#71717a" fontSize="8" fontFamily="monospace">{i}</text>
            {isL && <text x={x + barW / 2} y={topPad + chartH + 24} textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="700">L</text>}
            {isR && <text x={x + barW / 2} y={topPad + chartH + 24} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">R</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION â€” 3SUM (array with pointers)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function ThreeSumViz({ step }) {
  const { arr, i: fixI, lo, hi, found } = step;
  const n = arr.length;
  const cellW = 52, cellH = 36, gap = 4, pad = 20;
  const totalW = n * (cellW + gap) - gap + pad * 2;
  const totalH = cellH + 50 + pad;

  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full" style={{ maxHeight: 140 }}>
      {arr.map((v, idx) => {
        const x = pad + idx * (cellW + gap);
        const y = 20;
        const isI = idx === fixI;
        const isLo = idx === lo;
        const isHi = idx === hi;
        const isFound = found && (idx === found.i || idx === found.lo || idx === found.hi);
        const fill = isFound ? "#065f46"
          : isI ? "#7c3aed" : isLo ? "#3b82f6" : isHi ? "#f59e0b"
          : "#27272a";
        const stroke = isFound ? "#10b981"
          : isI ? "#8b5cf6" : isLo ? "#2563eb" : isHi ? "#d97706"
          : "#3f3f46";
        return (
          <g key={idx}>
            <rect x={x} y={y} width={cellW} height={cellH} fill={fill} stroke={stroke} strokeWidth={isFound ? 2.5 : 1.5} rx={6} />
            <text x={x + cellW / 2} y={y + cellH / 2 + 1} textAnchor="middle" dominantBaseline="central"
              fill={isFound ? "#6ee7b7" : "#e4e4e7"} fontSize="13" fontWeight="700" fontFamily="monospace">{v}</text>
            <text x={x + cellW / 2} y={y - 6} textAnchor="middle" fill="#52525b" fontSize="8" fontFamily="monospace">{idx}</text>
            {/* Pointer labels below */}
            {isI && <text x={x + cellW / 2} y={y + cellH + 14} textAnchor="middle" fill="#8b5cf6" fontSize="10" fontWeight="700">i</text>}
            {isLo && <text x={x + cellW / 2} y={y + cellH + 14} textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="700">lo</text>}
            {isHi && <text x={x + cellW / 2} y={y + cellH + 14} textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">hi</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION â€” SORT COLORS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const COLOR_MAP = { 0: "#ef4444", 1: "#e4e4e7", 2: "#3b82f6" };
const COLOR_LABEL = { 0: "Red", 1: "White", 2: "Blue" };

function SortColorsViz({ step }) {
  const { arr, lo, mid, hi, swapped, phase } = step;
  const n = arr.length;
  const cellW = 44, cellH = 44, gap = 6, pad = 20;
  const totalW = n * (cellW + gap) - gap + pad * 2;
  const totalH = cellH + 60 + pad;

  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full" style={{ maxHeight: 160 }}>
      {/* Zone backgrounds */}
      {lo > 0 && (
        <rect x={pad - 2} y={16} width={lo * (cellW + gap) - gap + 4} height={cellH + 8}
          fill="rgba(239,68,68,0.06)" rx={6} stroke="rgba(239,68,68,0.15)" strokeWidth="1" />
      )}
      {hi < n - 1 && (
        <rect x={pad + (hi + 1) * (cellW + gap) - 2} y={16}
          width={(n - hi - 1) * (cellW + gap) - gap + 4} height={cellH + 8}
          fill="rgba(59,130,246,0.06)" rx={6} stroke="rgba(59,130,246,0.15)" strokeWidth="1" />
      )}
      {arr.map((v, idx) => {
        const x = pad + idx * (cellW + gap);
        const y = 20;
        const isSwapped = swapped && (idx === swapped[0] || idx === swapped[1]);
        const fill = COLOR_MAP[v] || "#52525b";
        const isDone = phase === "done";
        return (
          <g key={idx}>
            <rect x={x} y={y} width={cellW} height={cellH}
              fill={isDone ? fill : isSwapped ? fill : fill}
              opacity={isDone ? 1 : 0.7}
              stroke={isSwapped ? "#fbbf24" : "#27272a"}
              strokeWidth={isSwapped ? 3 : 1} rx={8} />
            <text x={x + cellW / 2} y={y + cellH / 2 + 1} textAnchor="middle" dominantBaseline="central"
              fill={v === 1 ? "#18181b" : "#fff"} fontSize="14" fontWeight="800" fontFamily="monospace">{v}</text>
            {/* Pointer labels */}
            {idx === lo && phase !== "done" && <text x={x + cellW / 2} y={y + cellH + 14} textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">lo</text>}
            {idx === mid && phase !== "done" && <text x={x + cellW / 2} y={y + cellH + 24} textAnchor="middle" fill="#a1a1aa" fontSize="9" fontWeight="700">mid</text>}
            {idx === hi && phase !== "done" && <text x={x + cellW / 2} y={y + cellH + 14} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="700">hi</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   IO PANELS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function ContainerIOPanel({ step }) {
  const { phase, best, bestL, bestR, arr } = step;
  const done = phase === "done";
  const exp = EXPECTED.container;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">height</span> = [{arr.join(", ")}]</div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">max_area</span> = <span className="text-zinc-300">{exp.best}</span>
          <span className="text-zinc-600 text-[10px]"> (L={exp.bestL}, R={exp.bestR})</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && best === exp.best && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">best</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{best}</span>
          {bestL >= 0 && <span className="text-zinc-600 text-[10px]"> (L={bestL}, R={bestR})</span>}
        </div>
      </div>
    </div>
  );
}

function TrappingIOPanel({ step }) {
  const { phase, water, lm, rm, waterAt } = step;
  const done = phase === "done";
  const exp = EXPECTED.trapping;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[10px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">height</span> = [{PROBLEMS.trapping.arr.join(",  ")}]</div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">water</span> = <span className="text-zinc-300">{exp.water}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && water === exp.water && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">water  </span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>{water}</span></div>
          <div><span className="text-zinc-500">l_max  </span> = <span className="text-blue-300">{lm}</span></div>
          <div><span className="text-zinc-500">r_max  </span> = <span className="text-red-300">{rm}</span></div>
        </div>
        {done && (
          <div className="mt-1.5 font-mono text-[10px] text-zinc-600">
            per-cell: [{waterAt.join(", ")}]
          </div>
        )}
      </div>
    </div>
  );
}

function ThreeSumIOPanel({ step }) {
  const { phase, triplets, arr, i: fixI, sum } = step;
  const done = phase === "done";
  const exp = EXPECTED.threeSum;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">nums</span> = [{PROBLEMS.threeSum.arr.join(", ")}]</div>
          <div><span className="text-zinc-500">sorted</span> = [{arr.join(", ")}]</div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[10px] text-zinc-300">
          {exp.triplets.map((t, i) => <span key={i} className="mr-1.5">[{t.join(",")}]</span>)}
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && triplets.length === exp.triplets.length && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="space-y-0.5">
          {triplets.length > 0
            ? triplets.map((t, i) => (
                <div key={i} className="font-mono text-[11px]">
                  <span className="text-emerald-400">[{t.join(", ")}]</span>
                  <span className="text-zinc-700 ml-1">sum=0 âœ“</span>
                </div>
              ))
            : <span className="text-[10px] text-zinc-600 italic">none yet</span>}
        </div>
        {fixI >= 0 && sum !== null && (
          <div className="mt-1.5 font-mono text-[10px] text-zinc-600">
            current sum = {sum}
          </div>
        )}
      </div>
    </div>
  );
}

function SortColorsIOPanel({ step }) {
  const { phase, arr, lo, mid, hi } = step;
  const done = phase === "done";
  const exp = EXPECTED.sortColors;
  const matches = done && arr.every((v, i) => v === exp.sorted[i]);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">nums</span> = [{PROBLEMS.sortColors.arr.join(", ")}]</div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">sorted</span> = <span className="text-zinc-300">[{exp.sorted.join(", ")}]</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {matches && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">nums</span> = [
          {arr.map((v, i) => (
            <span key={i}>
              <span style={{ color: COLOR_MAP[v] }}>{v}</span>
              {i < arr.length - 1 && <span className="text-zinc-700">, </span>}
            </span>
          ))}
          ]
        </div>
        {!done && (
          <div className="mt-1.5 font-mono text-[10px] text-zinc-600 space-y-0.5">
            <div><span className="text-red-400">lo</span>={lo}  <span className="text-zinc-400">mid</span>={mid}  <span className="text-blue-400">hi</span>={hi}</div>
            <div>[0..lo) = 0s, [lo..mid) = 1s, (hi..n) = 2s</div>
          </div>
        )}
      </div>
    </div>
  );
}

function IOPanelDispatch({ pKey, step }) {
  switch (pKey) {
    case "container": return <ContainerIOPanel step={step} />;
    case "trapping": return <TrappingIOPanel step={step} />;
    case "threeSum": return <ThreeSumIOPanel step={step} />;
    case "sortColors": return <SortColorsIOPanel step={step} />;
    default: return null;
  }
}

function VizDispatch({ pKey, step }) {
  switch (pKey) {
    case "container": return <ContainerViz step={step} />;
    case "trapping": return <TrappingViz step={step} />;
    case "threeSum": return <ThreeSumViz step={step} />;
    case "sortColors": return <SortColorsViz step={step} />;
    default: return null;
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CODE PANEL
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function CodePanel({ pKey, highlightLines }) {
  const code = CODES[pKey];
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NAVIGATION BAR
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

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
      >Next â†’</button>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP STATE PANEL (per-problem)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function ContainerState({ step }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Pointers & Area</div>
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-blue-400">{step.l}</div>
          <div className="text-[9px] text-zinc-600">L</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">{step.r}</div>
          <div className="text-[9px] text-zinc-600">R</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-zinc-300">{step.r - step.l}</div>
          <div className="text-[9px] text-zinc-600">width</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-emerald-400">{step.best}</div>
          <div className="text-[9px] text-zinc-600">best</div>
        </div>
      </div>
    </div>
  );
}

function TrappingState({ step }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{step.l}</div>
          <div className="text-[9px] text-zinc-600">L</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-red-400">{step.r}</div>
          <div className="text-[9px] text-zinc-600">R</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-300">{step.lm}</div>
          <div className="text-[9px] text-zinc-600">l_max</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-red-300">{step.rm}</div>
          <div className="text-[9px] text-zinc-600">r_max</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-emerald-400">{step.water}</div>
          <div className="text-[9px] text-zinc-600">water</div>
        </div>
      </div>
    </div>
  );
}

function ThreeSumState({ step }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Pointers</div>
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-purple-400">{step.i >= 0 ? step.i : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">i (fixed)</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-blue-400">{step.lo >= 0 ? step.lo : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">lo</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-amber-400">{step.hi >= 0 ? step.hi : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">hi</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold font-mono text-emerald-400">{step.triplets.length}</div>
          <div className="text-[9px] text-zinc-600">found</div>
        </div>
      </div>
    </div>
  );
}

function SortColorsState({ step }) {
  const { arr } = step;
  const counts = [0, 0, 0];
  arr.forEach(v => counts[v]++);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Partitions</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-red-400">{step.lo}</div>
          <div className="text-[9px] text-zinc-600">lo</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-zinc-300">{step.mid}</div>
          <div className="text-[9px] text-zinc-600">mid</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{step.hi}</div>
          <div className="text-[9px] text-zinc-600">hi</div>
        </div>
        <div className="border-l border-zinc-800 pl-3 flex gap-2">
          {[0, 1, 2].map(v => (
            <div key={v} className="text-center">
              <div className="text-lg font-bold font-mono" style={{ color: COLOR_MAP[v] }}>{counts[v]}</div>
              <div className="text-[9px] text-zinc-600">{v}s</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StateDispatch({ pKey, step }) {
  switch (pKey) {
    case "container": return <ContainerState step={step} />;
    case "trapping": return <TrappingState step={step} />;
    case "threeSum": return <ThreeSumState step={step} />;
    case "sortColors": return <SortColorsState step={step} />;
    default: return null;
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PHASE BADGE COLORS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function phaseBadge(phase) {
  const map = {
    init: "bg-zinc-800 text-zinc-400",
    improve: "bg-emerald-900 text-emerald-300",
    compute: "bg-zinc-800 text-zinc-400",
    move: "bg-blue-900 text-blue-300",
    fill: "bg-blue-900 text-blue-300",
    scan: "bg-zinc-800 text-zinc-400",
    "fix-i": "bg-purple-900 text-purple-300",
    "skip-i": "bg-zinc-800 text-zinc-400",
    "too-low": "bg-blue-900 text-blue-300",
    "too-high": "bg-amber-900 text-amber-300",
    found: "bg-emerald-900 text-emerald-300",
    "swap-0": "bg-red-900 text-red-300",
    "swap-2": "bg-blue-900 text-blue-300",
    "skip-1": "bg-zinc-800 text-zinc-400",
    done: "bg-emerald-900 text-emerald-300",
    fail: "bg-red-900 text-red-300",
  };
  return map[phase] || "bg-zinc-800 text-zinc-400";
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

export default function TwoPointerViz() {
  const [pKey, setPKey] = useState("container");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];
  const steps = useMemo(() => buildSteps(pKey), [pKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        {/* â•â•â• 1. Header â•â•â• */}
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Two Pointers</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Converge, Partition & Squeeze â€” O(n) Patterns</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PROBLEMS).map(([k, v]) => (
              <button key={k} onClick={() => switchProblem(k)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  pKey === k ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {v.title}
              </button>
            ))}
          </div>
        </div>

        {/* â•â•â• 2. Core Idea (violet card) â•â•â• */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
            <span className="text-[10px] text-zinc-600">{problem.lc}</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        {/* â•â•â• 3. Navigation â•â•â• */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 4. 3-Column Grid â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* â”€â”€ COL 1: IO + Viz â”€â”€ */}
          <div className="col-span-3 space-y-3">
            <IOPanelDispatch pKey={pKey} step={step} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <VizDispatch pKey={pKey} step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                {pKey === "container" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />L</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />R</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Best</span>
                </>}
                {pKey === "trapping" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />L</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />R</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500/40 inline-block" />Water</span>
                </>}
                {pKey === "threeSum" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />i</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />lo</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />hi</span>
                </>}
                {pKey === "sortColors" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500 inline-block" />0 (Red)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-zinc-200 inline-block" />1 (White)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500 inline-block" />2 (Blue)</span>
                </>}
              </div>
            </div>
          </div>

          {/* â”€â”€ COL 2: Steps + State â”€â”€ */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "found" ? "bg-emerald-950/20 border-emerald-900/50" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${phaseBadge(step.phase)}`}>
                  {step.phase}
                </span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* State panel */}
            <StateDispatch pKey={pKey} step={step} />

            {/* Completion card */}
            {step.phase === "done" && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Result</div>
                <div className="font-mono text-[11px] text-emerald-300">
                  {pKey === "container" && `Max area = ${step.best} at L=${step.bestL}, R=${step.bestR}`}
                  {pKey === "trapping" && `Total water trapped = ${step.water}`}
                  {pKey === "threeSum" && `${step.triplets.length} unique triplet${step.triplets.length !== 1 ? "s" : ""}: ${step.triplets.map(t => `[${t.join(",")}]`).join(" ")}`}
                  {pKey === "sortColors" && `Sorted: [${step.arr.join(", ")}]`}
                </div>
              </div>
            )}
          </div>

          {/* â”€â”€ COL 3: Code â”€â”€ */}
          <div className="col-span-4">
            <CodePanel pKey={pKey} highlightLines={step.codeHL} />
          </div>

        </div>

        {/* â•â•â• 5. Bottom 2-Column Row â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use Two Pointers</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Sorted array + find pair/triplet with target sum</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Opposite-ends shrink: maximize/minimize over all pairs</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Partition in-place (Dutch National Flag, quicksort partition)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Linked-list cycle detection (fast/slow pointers)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Merging two sorted sequences</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(n) for single-pass; O(nÂ²) for 3Sum (outer loop Ã— inner squeeze)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(1) â€” all problems here are in-place</div>
                <div><span className="text-zinc-500 font-semibold">Key insight:</span> Pointer movement must be monotonic â€” each pointer only moves one direction</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 11 â€” Container With Most Water</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 15 â€” 3Sum</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 42 â€” Trapping Rain Water</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 75 â€” Sort Colors</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 167 â€” Two Sum II (Sorted)</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 16 â€” 3Sum Closest</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 18 â€” 4Sum</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 407 â€” Trapping Rain Water II (3D)</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
