import { useState, useMemo } from "react";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PROBLEM DEFINITIONS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const PROBLEMS = {
  firstLast: {
    title: "First & Last Position",
    lc: "LC 34 · Medium",
    coreIdea:
      "Two binary searches — bisect_left finds the first index where nums[mid] ≥ target (keep going left even when equal), bisect_right finds the first index where nums[mid] > target. If the element at bisect_left isn't the target, it doesn't exist. This is the foundational template for all boundary binary searches. O(log n).",
    arr: [1, 2, 3, 4, 5, 5, 5, 5, 6, 7, 8, 9],
    target: 5,
    category: "boundary",
  },
  rotated: {
    title: "Search Rotated Array",
    lc: "LC 33 · Medium",
    coreIdea:
      "In a rotated sorted array, one half is always sorted. Compare mid to lo: if nums[lo] ≤ nums[mid], the left half is sorted — check if target falls in that range; otherwise the right half is sorted. This lets us decide which half to discard at each step. Same O(log n) but with a twist on the condition.",
    arr: [6, 7, 8, 9, 0, 1, 2, 3, 4, 5],
    target: 3,
    category: "modified",
  },
  koko: {
    title: "Koko Eating Bananas",
    lc: "LC 875 · Medium",
    coreIdea:
      "Binary search on the answer space, not the input. The answer k (eating speed) is in [1, max(piles)]. For a given k, we can compute hours = Σ⌈pile/k⌉ in O(n). If hours ≤ h, k might work (search left for smaller k); otherwise search right. This 'feasibility check + binary search' pattern applies to hundreds of problems.",
    piles: [3, 6, 7, 11],
    h: 8,
    category: "answer-space",
  },
  median: {
    title: "Median of Two Sorted",
    lc: "LC 4 · Hard",
    coreIdea:
      "Binary search on the partition of the smaller array. We need i elements from A and j = (m+n+1)/2 − i elements from B such that A[i−1] ≤ B[j] and B[j−1] ≤ A[i]. If A[i−1] > B[j], we took too many from A — search left. If B[j−1] > A[i], too few — search right. O(log min(m,n)).",
    nums1: [1, 3, 5, 7],
    nums2: [2, 4, 6, 8, 9, 10],
    category: "partition",
  },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CODE PER PROBLEM
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const CODES = {
  firstLast: [
    { id: 0,  text: `def search_range(nums, target):` },
    { id: 1,  text: `    def bisect_left(nums, target):` },
    { id: 2,  text: `        lo, hi = 0, len(nums)` },
    { id: 3,  text: `        while lo < hi:` },
    { id: 4,  text: `            mid = (lo + hi) // 2` },
    { id: 5,  text: `            if nums[mid] < target:` },
    { id: 6,  text: `                lo = mid + 1` },
    { id: 7,  text: `            else:` },
    { id: 8,  text: `                hi = mid` },
    { id: 9,  text: `        return lo` },
    { id: 10, text: `` },
    { id: 11, text: `    left = bisect_left(nums, target)` },
    { id: 12, text: `    if left == len(nums) or nums[left] != target:` },
    { id: 13, text: `        return [-1, -1]` },
    { id: 14, text: `    right = bisect_left(nums, target + 1) - 1` },
    { id: 15, text: `    return [left, right]` },
  ],
  rotated: [
    { id: 0,  text: `def search(nums, target):` },
    { id: 1,  text: `    lo, hi = 0, len(nums) - 1` },
    { id: 2,  text: `` },
    { id: 3,  text: `    while lo <= hi:` },
    { id: 4,  text: `        mid = (lo + hi) // 2` },
    { id: 5,  text: `        if nums[mid] == target:` },
    { id: 6,  text: `            return mid` },
    { id: 7,  text: `` },
    { id: 8,  text: `        if nums[lo] <= nums[mid]:` },
    { id: 9,  text: `            if nums[lo] <= target < nums[mid]:` },
    { id: 10, text: `                hi = mid - 1` },
    { id: 11, text: `            else:` },
    { id: 12, text: `                lo = mid + 1` },
    { id: 13, text: `        else:` },
    { id: 14, text: `            if nums[mid] < target <= nums[hi]:` },
    { id: 15, text: `                lo = mid + 1` },
    { id: 16, text: `            else:` },
    { id: 17, text: `                hi = mid - 1` },
    { id: 18, text: `` },
    { id: 19, text: `    return -1` },
  ],
  koko: [
    { id: 0,  text: `import math` },
    { id: 1,  text: `` },
    { id: 2,  text: `def min_eating_speed(piles, h):` },
    { id: 3,  text: `    lo, hi = 1, max(piles)` },
    { id: 4,  text: `` },
    { id: 5,  text: `    while lo < hi:` },
    { id: 6,  text: `        mid = (lo + hi) // 2` },
    { id: 7,  text: `        hours = sum(math.ceil(p / mid)` },
    { id: 8,  text: `                    for p in piles)` },
    { id: 9,  text: `` },
    { id: 10, text: `        if hours <= h:` },
    { id: 11, text: `            hi = mid` },
    { id: 12, text: `        else:` },
    { id: 13, text: `            lo = mid + 1` },
    { id: 14, text: `` },
    { id: 15, text: `    return lo` },
  ],
  median: [
    { id: 0,  text: `def find_median(A, B):` },
    { id: 1,  text: `    if len(A) > len(B):` },
    { id: 2,  text: `        A, B = B, A` },
    { id: 3,  text: `    m, n = len(A), len(B)` },
    { id: 4,  text: `    lo, hi = 0, m` },
    { id: 5,  text: `` },
    { id: 6,  text: `    while lo <= hi:` },
    { id: 7,  text: `        i = (lo + hi) // 2` },
    { id: 8,  text: `        j = (m + n + 1) // 2 - i` },
    { id: 9,  text: `` },
    { id: 10, text: `        aL = A[i-1] if i > 0 else -inf` },
    { id: 11, text: `        aR = A[i]   if i < m else  inf` },
    { id: 12, text: `        bL = B[j-1] if j > 0 else -inf` },
    { id: 13, text: `        bR = B[j]   if j < n else  inf` },
    { id: 14, text: `` },
    { id: 15, text: `        if aL <= bR and bL <= aR:` },
    { id: 16, text: `            if (m+n) % 2:` },
    { id: 17, text: `                return max(aL, bL)` },
    { id: 18, text: `            return (max(aL,bL)+min(aR,bR))/2` },
    { id: 19, text: `        elif aL > bR:` },
    { id: 20, text: `            hi = i - 1` },
    { id: 21, text: `        else:` },
    { id: 22, text: `            lo = i + 1` },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   EXPECTED OUTPUTS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function computeExpected(key) {
  const p = PROBLEMS[key];
  if (key === "firstLast") {
    const { arr, target } = p;
    let left = -1, right = -1;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) { if (left === -1) left = i; right = i; }
    }
    return { left, right };
  }
  if (key === "rotated") {
    const { arr, target } = p;
    const idx = arr.indexOf(target);
    return { index: idx };
  }
  if (key === "koko") {
    const { piles, h } = p;
    let lo = 1, hi = Math.max(...piles);
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      const hours = piles.reduce((s, pile) => s + Math.ceil(pile / mid), 0);
      if (hours <= h) hi = mid; else lo = mid + 1;
    }
    return { speed: lo };
  }
  if (key === "median") {
    const merged = [...p.nums1, ...p.nums2].sort((a, b) => a - b);
    const n = merged.length;
    const med = n % 2 === 1 ? merged[(n - 1) / 2] : (merged[n / 2 - 1] + merged[n / 2]) / 2;
    return { median: med, merged };
  }
}

const EXPECTED = Object.fromEntries(Object.keys(PROBLEMS).map(k => [k, computeExpected(k)]));

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS — FIRST & LAST POSITION
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildFirstLastSteps() {
  const { arr, target } = PROBLEMS.firstLast;
  const n = arr.length;
  const steps = [];
  const eliminated = new Set();

  steps.push({
    title: "Phase 1: bisect_left — Find First Occurrence",
    detail: `Searching for first index where nums[mid] ≥ ${target}. lo=0, hi=${n}.`,
    arr: [...arr], lo: 0, hi: n, mid: -1, target,
    phase: "init-left", codeHL: [0, 1, 2],
    eliminated: new Set(), searchPhase: "left", foundLeft: -1, foundRight: -1,
  });

  // bisect_left for target
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const goRight = arr[mid] < target;

    steps.push({
      title: goRight
        ? `mid=${mid}, nums[${mid}]=${arr[mid]} < ${target} → lo = ${mid + 1}`
        : `mid=${mid}, nums[${mid}]=${arr[mid]} ≥ ${target} → hi = ${mid}`,
      detail: goRight
        ? `${arr[mid]} is too small — target must be to the right. Eliminate [${lo}..${mid}].`
        : `${arr[mid]} ≥ target — this could be the first, or answer is further left. Eliminate (${mid}..${hi}).`,
      arr: [...arr], lo: goRight ? mid + 1 : lo, hi: goRight ? hi : mid, mid, target,
      phase: goRight ? "go-right" : "go-left",
      codeHL: goRight ? [3, 4, 5, 6] : [3, 4, 7, 8],
      eliminated: new Set(eliminated), searchPhase: "left", foundLeft: -1, foundRight: -1,
    });

    if (goRight) {
      for (let i = lo; i <= mid; i++) eliminated.add(i);
      lo = mid + 1;
    } else {
      for (let i = mid + 1; i < hi; i++) eliminated.add(i);
      hi = mid;
    }
  }

  const leftResult = lo;
  const leftFound = leftResult < n && arr[leftResult] === target;

  steps.push({
    title: leftFound
      ? `bisect_left = ${leftResult} → nums[${leftResult}]=${arr[leftResult]} == ${target} ✓`
      : `bisect_left = ${leftResult} → Target Not Found`,
    detail: leftFound
      ? `First occurrence at index ${leftResult}. Now find the last with bisect_left(target+1) − 1.`
      : `Element at position ${leftResult} is ${leftResult < n ? arr[leftResult] : "out of bounds"}, not ${target}. Return [-1, -1].`,
    arr: [...arr], lo: leftResult, hi: leftResult, mid: leftResult, target,
    phase: leftFound ? "found-left" : "not-found",
    codeHL: leftFound ? [9, 11] : [12, 13],
    eliminated: new Set(eliminated), searchPhase: "left-done",
    foundLeft: leftFound ? leftResult : -1, foundRight: -1,
  });

  if (!leftFound) {
    steps.push({
      title: "✓ Complete — Target Not Found → [-1, -1]",
      detail: `${target} does not exist in the array.`,
      arr: [...arr], lo: -1, hi: -1, mid: -1, target,
      phase: "done", codeHL: [12, 13],
      eliminated: new Set(eliminated), searchPhase: "done",
      foundLeft: -1, foundRight: -1,
    });
    return steps;
  }

  // bisect_left for target+1
  const eliminated2 = new Set();
  steps.push({
    title: `Phase 2: bisect_left(${target + 1}) — Find Last Occurrence`,
    detail: `Searching for first index where nums[mid] ≥ ${target + 1}. Then subtract 1 for last ${target}.`,
    arr: [...arr], lo: 0, hi: n, mid: -1, target,
    phase: "init-right", codeHL: [14],
    eliminated: new Set(), searchPhase: "right",
    foundLeft: leftResult, foundRight: -1,
  });

  lo = 0; hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const goRight = arr[mid] < target + 1;

    steps.push({
      title: goRight
        ? `mid=${mid}, nums[${mid}]=${arr[mid]} < ${target + 1} → lo = ${mid + 1}`
        : `mid=${mid}, nums[${mid}]=${arr[mid]} ≥ ${target + 1} → hi = ${mid}`,
      detail: goRight
        ? `${arr[mid]} < ${target + 1}. Search right half.`
        : `${arr[mid]} ≥ ${target + 1}. Could be boundary — search left.`,
      arr: [...arr], lo: goRight ? mid + 1 : lo, hi: goRight ? hi : mid, mid, target,
      phase: goRight ? "go-right" : "go-left",
      codeHL: goRight ? [3, 4, 5, 6] : [3, 4, 7, 8],
      eliminated: new Set(eliminated2), searchPhase: "right",
      foundLeft: leftResult, foundRight: -1,
    });

    if (goRight) {
      for (let i = lo; i <= mid; i++) eliminated2.add(i);
      lo = mid + 1;
    } else {
      for (let i = mid + 1; i < hi; i++) eliminated2.add(i);
      hi = mid;
    }
  }

  const rightResult = lo - 1;

  steps.push({
    title: `✓ Complete — Range = [${leftResult}, ${rightResult}]`,
    detail: `bisect_left(${target})=${leftResult}, bisect_left(${target + 1})=${lo} → last = ${lo}−1 = ${rightResult}. Target ${target} appears at indices ${leftResult}..${rightResult}.`,
    arr: [...arr], lo: leftResult, hi: rightResult, mid: -1, target,
    phase: "done", codeHL: [14, 15],
    eliminated: new Set(), searchPhase: "done",
    foundLeft: leftResult, foundRight: rightResult,
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS — SEARCH ROTATED SORTED ARRAY
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildRotatedSteps() {
  const { arr, target } = PROBLEMS.rotated;
  const n = arr.length;
  const steps = [];
  const eliminated = new Set();

  steps.push({
    title: `Search for ${target} in Rotated Array`,
    detail: `Array is sorted then rotated. lo=0, hi=${n - 1}. At each step, identify which half is sorted.`,
    arr: [...arr], lo: 0, hi: n - 1, mid: -1, target,
    phase: "init", codeHL: [0, 1],
    eliminated: new Set(), foundIdx: -1, sortedHalf: null,
  });

  let lo = 0, hi = n - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;

    if (arr[mid] === target) {
      steps.push({
        title: `✓ Found! nums[${mid}] = ${arr[mid]} == ${target}`,
        detail: `Target found at index ${mid}.`,
        arr: [...arr], lo, hi, mid, target,
        phase: "found", codeHL: [3, 4, 5, 6],
        eliminated: new Set(eliminated), foundIdx: mid, sortedHalf: null,
      });

      steps.push({
        title: `✓ Complete — Return ${mid}`,
        detail: `nums[${mid}] = ${target}. Found in O(log n) with rotated binary search.`,
        arr: [...arr], lo: mid, hi: mid, mid, target,
        phase: "done", codeHL: [5, 6],
        eliminated: new Set(eliminated), foundIdx: mid, sortedHalf: null,
      });
      return steps;
    }

    const leftSorted = arr[lo] <= arr[mid];
    const sortedHalf = leftSorted ? "left" : "right";

    if (leftSorted) {
      const inLeft = arr[lo] <= target && target < arr[mid];
      if (inLeft) {
        steps.push({
          title: `mid=${mid}(${arr[mid]}): Left sorted [${lo}..${mid}], ${target} in [${arr[lo]}..${arr[mid]}) → hi=${mid - 1}`,
          detail: `nums[${lo}]=${arr[lo]} ≤ nums[${mid}]=${arr[mid]} → left half sorted. ${arr[lo]} ≤ ${target} < ${arr[mid]} → target is in left half.`,
          arr: [...arr], lo, hi: mid - 1, mid, target,
          phase: "go-left", codeHL: [8, 9, 10],
          eliminated: new Set(eliminated), foundIdx: -1, sortedHalf,
        });
        for (let i = mid; i <= hi; i++) eliminated.add(i);
        hi = mid - 1;
      } else {
        steps.push({
          title: `mid=${mid}(${arr[mid]}): Left sorted [${lo}..${mid}], ${target} not in range → lo=${mid + 1}`,
          detail: `nums[${lo}]=${arr[lo]} ≤ nums[${mid}]=${arr[mid]} → left half sorted. ${target} is outside [${arr[lo]}..${arr[mid]}), must be in right half.`,
          arr: [...arr], lo: mid + 1, hi, mid, target,
          phase: "go-right", codeHL: [8, 11, 12],
          eliminated: new Set(eliminated), foundIdx: -1, sortedHalf,
        });
        for (let i = lo; i <= mid; i++) eliminated.add(i);
        lo = mid + 1;
      }
    } else {
      const inRight = arr[mid] < target && target <= arr[hi];
      if (inRight) {
        steps.push({
          title: `mid=${mid}(${arr[mid]}): Right sorted [${mid}..${hi}], ${target} in (${arr[mid]}..${arr[hi]}] → lo=${mid + 1}`,
          detail: `nums[${lo}]=${arr[lo]} > nums[${mid}]=${arr[mid]} → right half sorted. ${arr[mid]} < ${target} ≤ ${arr[hi]} → target is in right half.`,
          arr: [...arr], lo: mid + 1, hi, mid, target,
          phase: "go-right", codeHL: [13, 14, 15],
          eliminated: new Set(eliminated), foundIdx: -1, sortedHalf,
        });
        for (let i = lo; i <= mid; i++) eliminated.add(i);
        lo = mid + 1;
      } else {
        steps.push({
          title: `mid=${mid}(${arr[mid]}): Right sorted [${mid}..${hi}], ${target} not in range → hi=${mid - 1}`,
          detail: `nums[${lo}]=${arr[lo]} > nums[${mid}]=${arr[mid]} → right half sorted. ${target} outside (${arr[mid]}..${arr[hi]}], must be in left half.`,
          arr: [...arr], lo, hi: mid - 1, mid, target,
          phase: "go-left", codeHL: [13, 16, 17],
          eliminated: new Set(eliminated), foundIdx: -1, sortedHalf,
        });
        for (let i = mid; i <= hi; i++) eliminated.add(i);
        hi = mid - 1;
      }
    }
  }

  steps.push({
    title: "✗ Complete — Target Not Found → -1",
    detail: `Exhausted search space. ${target} not in array.`,
    arr: [...arr], lo, hi, mid: -1, target,
    phase: "done", codeHL: [19],
    eliminated: new Set(eliminated), foundIdx: -1, sortedHalf: null,
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS — KOKO EATING BANANAS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildKokoSteps() {
  const { piles, h } = PROBLEMS.koko;
  const maxP = Math.max(...piles);
  const steps = [];
  let lo = 1, hi = maxP;

  steps.push({
    title: `Search Answer Space: k ∈ [1, ${maxP}]`,
    detail: `Binary search on eating speed k. For each k, compute total hours = Σ⌈pile/k⌉. If ≤ ${h}, k is feasible (try smaller). Else, need faster.`,
    lo: 1, hi: maxP, mid: -1,
    piles: [...piles], h, hours: null,
    phase: "init", codeHL: [2, 3],
    feasible: null, answer: null,
  });

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const hours = piles.reduce((s, p) => s + Math.ceil(p / mid), 0);
    const feasible = hours <= h;

    steps.push({
      title: `k=${mid}: hours = ${piles.map(p => `⌈${p}/${mid}⌉`).join("+")} = ${hours} ${feasible ? `≤ ${h} ✓` : `> ${h} ✗`}`,
      detail: feasible
        ? `${hours} hours ≤ ${h} limit → k=${mid} is feasible. But maybe slower speed also works. hi = ${mid}.`
        : `${hours} hours > ${h} limit → k=${mid} is too slow. Need to eat faster. lo = ${mid + 1}.`,
      lo: feasible ? lo : mid + 1, hi: feasible ? mid : hi, mid,
      piles: [...piles], h, hours,
      phase: feasible ? "feasible" : "too-slow",
      codeHL: feasible ? [5, 6, 7, 8, 10, 11] : [5, 6, 7, 8, 12, 13],
      feasible, answer: null,
    });

    if (feasible) hi = mid; else lo = mid + 1;
  }

  steps.push({
    title: `✓ Complete — Minimum Speed = ${lo}`,
    detail: `lo = hi = ${lo}. At speed ${lo}: ${piles.map(p => `⌈${p}/${lo}⌉`).join("+")} = ${piles.reduce((s, p) => s + Math.ceil(p / lo), 0)} hours ≤ ${h}.`,
    lo, hi, mid: lo,
    piles: [...piles], h, hours: piles.reduce((s, p) => s + Math.ceil(p / lo), 0),
    phase: "done", codeHL: [15],
    feasible: true, answer: lo,
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS — MEDIAN OF TWO SORTED ARRAYS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildMedianSteps() {
  let A = [...PROBLEMS.median.nums1];
  let B = [...PROBLEMS.median.nums2];
  if (A.length > B.length) { [A, B] = [B, A]; }
  const m = A.length, n = B.length;
  const half = (m + n + 1) >> 1;
  const steps = [];

  steps.push({
    title: `Setup: A(${m}), B(${n}), half = ${half}`,
    detail: `Search partition i in A: [0..${m}]. Then j = ${half} − i from B. Need A[i−1]≤B[j] and B[j−1]≤A[i].`,
    A: [...A], B: [...B], i: -1, j: -1,
    lo: 0, hi: m, aL: null, aR: null, bL: null, bR: null,
    phase: "init", codeHL: [0, 1, 2, 3, 4],
    result: null,
  });

  let lo = 0, hi = m;
  while (lo <= hi) {
    const i = (lo + hi) >> 1;
    const j = half - i;

    const aL = i > 0 ? A[i - 1] : -Infinity;
    const aR = i < m ? A[i] : Infinity;
    const bL = j > 0 ? B[j - 1] : -Infinity;
    const bR = j < n ? B[j] : Infinity;

    if (aL <= bR && bL <= aR) {
      const isOdd = (m + n) % 2 === 1;
      const median = isOdd ? Math.max(aL, bL) : (Math.max(aL, bL) + Math.min(aR, bR)) / 2;

      steps.push({
        title: `i=${i}, j=${j}: A[${i-1<0?'':i-1}]=${aL===Infinity?'∞':aL===-Infinity?'-∞':aL} ≤ B[${j}]=${bR===Infinity?'∞':bR} ✓ and B[${j-1<0?'':j-1}]=${bL===-Infinity?'-∞':bL} ≤ A[${i}]=${aR===Infinity?'∞':aR} ✓`,
        detail: `Valid partition found! Left max = max(${aL===-Infinity?'-∞':aL}, ${bL===-Infinity?'-∞':bL}) = ${Math.max(aL, bL)}, Right min = min(${aR===Infinity?'∞':aR}, ${bR===Infinity?'∞':bR}) = ${Math.min(aR, bR)}.`,
        A: [...A], B: [...B], i, j,
        lo, hi, aL, aR, bL, bR,
        phase: "valid", codeHL: [6, 7, 8, 10, 11, 12, 13, 15, 16, 17, 18],
        result: null,
      });

      steps.push({
        title: `✓ Complete — Median = ${median}`,
        detail: isOdd
          ? `Odd total (${m+n}): median = max(left) = ${Math.max(aL, bL)}.`
          : `Even total (${m+n}): median = (${Math.max(aL, bL)} + ${Math.min(aR, bR)}) / 2 = ${median}.`,
        A: [...A], B: [...B], i, j,
        lo: i, hi: i, aL, aR, bL, bR,
        phase: "done", codeHL: [(m+n) % 2 === 1 ? 17 : 18],
        result: median,
      });
      return steps;
    }

    if (aL > bR) {
      steps.push({
        title: `i=${i}, j=${j}: A[${i-1}]=${aL} > B[${j}]=${bR} → too many from A, hi = ${i - 1}`,
        detail: `A's left element (${aL}) exceeds B's right element (${bR}). We took too many from A. Shrink i.`,
        A: [...A], B: [...B], i, j,
        lo, hi: i - 1, aL, aR, bL, bR,
        phase: "go-left", codeHL: [6, 7, 8, 10, 11, 12, 13, 15, 19, 20],
        result: null,
      });
      hi = i - 1;
    } else {
      steps.push({
        title: `i=${i}, j=${j}: B[${j-1}]=${bL} > A[${i}]=${aR} → too few from A, lo = ${i + 1}`,
        detail: `B's left element (${bL}) exceeds A's right element (${aR}). We need more from A. Increase i.`,
        A: [...A], B: [...B], i, j,
        lo: i + 1, hi, aL, aR, bL, bR,
        phase: "go-right", codeHL: [6, 7, 8, 10, 11, 12, 13, 15, 21, 22],
        result: null,
      });
      lo = i + 1;
    }
  }

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP BUILDER DISPATCH
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildSteps(key) {
  switch (key) {
    case "firstLast": return buildFirstLastSteps();
    case "rotated": return buildRotatedSteps();
    case "koko": return buildKokoSteps();
    case "median": return buildMedianSteps();
    default: return [];
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION — FIRST & LAST POSITION (array cells)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function FirstLastViz({ step }) {
  const { arr, lo, hi, mid, target, eliminated, foundLeft, foundRight, phase } = step;
  const n = arr.length;
  const cellW = 38, cellH = 36, gap = 3, pad = 16;
  const totalW = n * (cellW + gap) - gap + pad * 2;
  const totalH = cellH + 55;

  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full" style={{ maxHeight: 160 }}>
      {arr.map((v, idx) => {
        const x = pad + idx * (cellW + gap);
        const y = 22;
        const isMid = idx === mid;
        const isTarget = v === target;
        const isElim = eliminated.has(idx);
        const isFoundRange = foundLeft >= 0 && foundRight >= 0 && idx >= foundLeft && idx <= foundRight && phase === "done";
        const isInRange = lo >= 0 && hi >= 0 && hi < n + 1 && idx >= lo && idx < hi && !isElim;

        let fill = "#27272a";
        if (isFoundRange) fill = "#065f46";
        else if (isMid) fill = "#7c3aed";
        else if (isElim) fill = "#18181b";
        else if (isInRange) fill = "#1e3a5f";

        let stroke = "#3f3f46";
        if (isFoundRange) stroke = "#10b981";
        else if (isMid) stroke = "#8b5cf6";
        else if (isElim) stroke = "#27272a";

        return (
          <g key={idx}>
            <rect x={x} y={y} width={cellW} height={cellH}
              fill={fill} stroke={stroke} strokeWidth={isMid || isFoundRange ? 2.5 : 1}
              rx={5} opacity={isElim ? 0.35 : 1} />
            <text x={x + cellW / 2} y={y + cellH / 2 + 1} textAnchor="middle" dominantBaseline="central"
              fill={isFoundRange ? "#6ee7b7" : isElim ? "#52525b" : isTarget ? "#fbbf24" : "#d4d4d8"}
              fontSize="12" fontWeight="700" fontFamily="monospace">{v}</text>
            <text x={x + cellW / 2} y={y - 6} textAnchor="middle" fill="#52525b" fontSize="8" fontFamily="monospace">{idx}</text>
            {isMid && <text x={x + cellW / 2} y={y + cellH + 13} textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="700">mid</text>}
            {idx === lo && !isMid && phase !== "done" && <text x={x + cellW / 2} y={y + cellH + 13} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="700">lo</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION — ROTATED ARRAY
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function RotatedViz({ step }) {
  const { arr, lo, hi, mid, target, eliminated, foundIdx, sortedHalf } = step;
  const n = arr.length;
  const maxV = Math.max(...arr);
  const barW = 40, gap = 4, pad = 24;
  const totalW = n * (barW + gap) - gap + pad * 2;
  const chartH = 130, topPad = 15;

  return (
    <svg viewBox={`0 0 ${totalW} ${chartH + topPad + 30}`} className="w-full" style={{ maxHeight: 220 }}>
      {/* Sorted half highlight */}
      {sortedHalf && mid >= 0 && (
        <rect
          x={pad + (sortedHalf === "left" ? lo : mid) * (barW + gap) - 2}
          y={topPad - 2}
          width={((sortedHalf === "left" ? mid - lo : hi - mid) + 1) * (barW + gap) - gap + 4}
          height={chartH + 8}
          fill="none" stroke="rgba(168,85,247,0.25)" strokeWidth="2" strokeDasharray="5 3" rx={6}
        />
      )}
      {arr.map((v, i) => {
        const x = pad + i * (barW + gap);
        const barH = Math.max(8, (v / maxV) * chartH);
        const y = topPad + chartH - barH;
        const isMid = i === mid;
        const isFound = i === foundIdx;
        const isElim = eliminated.has(i);
        const isActive = i >= lo && i <= hi && !isElim;

        let fill = "#3f3f46";
        if (isFound) fill = "#10b981";
        else if (isMid) fill = "#7c3aed";
        else if (isElim) fill = "#27272a";
        else if (isActive) fill = "#1e40af";

        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={fill} rx={3}
              opacity={isElim ? 0.3 : 1} />
            <text x={x + barW / 2} y={y - 5} textAnchor="middle"
              fill={isFound ? "#6ee7b7" : v === target ? "#fbbf24" : "#a1a1aa"}
              fontSize="10" fontWeight={v === target ? "800" : "600"} fontFamily="monospace">{v}</text>
            <text x={x + barW / 2} y={topPad + chartH + 12} textAnchor="middle" fill="#52525b" fontSize="8" fontFamily="monospace">{i}</text>
            {isMid && <text x={x + barW / 2} y={topPad + chartH + 24} textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="700">mid</text>}
            {i === lo && !isMid && <text x={x + barW / 2} y={topPad + chartH + 24} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="700">lo</text>}
            {i === hi && !isMid && i !== lo && <text x={x + barW / 2} y={topPad + chartH + 24} textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="700">hi</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION — KOKO EATING BANANAS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function KokoViz({ step }) {
  const { piles, lo, hi, mid, hours, h, phase, feasible } = step;
  const maxP = Math.max(...piles);
  const barW = 70, gap = 14, pad = 30;
  const totalW = piles.length * (barW + gap) - gap + pad * 2;
  const chartH = 120, topPad = 25;

  const answerBarW = totalW - pad * 2;
  const answerY = chartH + topPad + 30;

  return (
    <svg viewBox={`0 0 ${totalW} ${answerY + 40}`} className="w-full" style={{ maxHeight: 240 }}>
      {/* Pile bars */}
      {piles.map((p, i) => {
        const x = pad + i * (barW + gap);
        const barH = (p / maxP) * chartH;
        const y = topPad + chartH - barH;
        const eats = mid > 0 ? Math.ceil(p / mid) : "?";
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill="#7c3aed" rx={4} opacity={0.7} />
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill="#c4b5fd" fontSize="12" fontWeight="700" fontFamily="monospace">{p}</text>
            {mid > 0 && (
              <text x={x + barW / 2} y={y + barH / 2 + 1} textAnchor="middle" dominantBaseline="central"
                fill="#e4e4e7" fontSize="10" fontWeight="600" fontFamily="monospace">⌈{p}/{mid}⌉={eats}</text>
            )}
            <text x={x + barW / 2} y={topPad + chartH + 12} textAnchor="middle" fill="#52525b" fontSize="9" fontFamily="monospace">pile[{i}]</text>
          </g>
        );
      })}
      {/* Answer space bar */}
      <rect x={pad} y={answerY} width={answerBarW} height={14} fill="#27272a" rx={4} />
      {hi > 0 && (
        <rect
          x={pad + ((lo - 1) / maxP) * answerBarW}
          y={answerY}
          width={Math.max(4, ((hi - lo + 1) / maxP) * answerBarW)}
          height={14}
          fill={phase === "done" ? "#059669" : "#1e40af"} rx={4} opacity={0.7}
        />
      )}
      {mid > 0 && phase !== "done" && phase !== "init" && (
        <line x1={pad + ((mid - 1) / maxP) * answerBarW} y1={answerY - 2}
          x2={pad + ((mid - 1) / maxP) * answerBarW} y2={answerY + 16}
          stroke={feasible ? "#10b981" : "#ef4444"} strokeWidth={2} />
      )}
      <text x={pad} y={answerY + 28} fill="#52525b" fontSize="9" fontFamily="monospace">1</text>
      <text x={pad + answerBarW} y={answerY + 28} textAnchor="end" fill="#52525b" fontSize="9" fontFamily="monospace">{maxP}</text>
      <text x={pad + answerBarW / 2} y={answerY + 28} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">
        search space: [{lo}..{hi}]
      </text>
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION — MEDIAN OF TWO SORTED ARRAYS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function MedianViz({ step }) {
  const { A, B, i, j, aL, aR, bL, bR, phase } = step;
  const cellW = 40, cellH = 32, gap = 3, pad = 50;
  const maxLen = Math.max(A.length, B.length);
  const totalW = maxLen * (cellW + gap) - gap + pad * 2 + 40;
  const rowGap = 18;
  const totalH = 2 * cellH + rowGap + 60;

  const renderRow = (arr, label, partIdx, yOff, color) => {
    return (
      <g>
        <text x={pad - 8} y={yOff + cellH / 2 + 1} textAnchor="end" fill={color} fontSize="11" fontWeight="700" fontFamily="monospace">{label}</text>
        {arr.map((v, idx) => {
          const x = pad + idx * (cellW + gap);
          const isLeft = partIdx >= 0 && idx < partIdx;
          const isRight = partIdx >= 0 && idx >= partIdx;
          const isBound = partIdx >= 0 && (idx === partIdx - 1 || idx === partIdx);
          const fill = isBound ? (idx < partIdx ? "#065f46" : "#1e3a5f") : isLeft ? "#052e16" : isRight ? "#0c1929" : "#27272a";
          const stroke = isBound ? (idx < partIdx ? "#10b981" : "#3b82f6") : "#3f3f46";
          return (
            <g key={idx}>
              <rect x={x} y={yOff} width={cellW} height={cellH} fill={fill} stroke={stroke} strokeWidth={isBound ? 2 : 1} rx={5} />
              <text x={x + cellW / 2} y={yOff + cellH / 2 + 1} textAnchor="middle" dominantBaseline="central"
                fill={isBound ? "#e4e4e7" : "#a1a1aa"} fontSize="12" fontWeight="700" fontFamily="monospace">{v}</text>
            </g>
          );
        })}
        {/* Partition line */}
        {partIdx >= 0 && partIdx <= arr.length && (
          <line
            x1={pad + partIdx * (cellW + gap) - gap / 2}
            y1={yOff - 4}
            x2={pad + partIdx * (cellW + gap) - gap / 2}
            y2={yOff + cellH + 4}
            stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="4 2"
          />
        )}
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full" style={{ maxHeight: 180 }}>
      {renderRow(A, "A", i >= 0 ? i : -1, 18, "#10b981")}
      {renderRow(B, "B", j >= 0 ? j : -1, 18 + cellH + rowGap, "#3b82f6")}
      {/* Labels for boundary values */}
      {phase !== "init" && aL !== null && (
        <g>
          <text x={pad + totalW / 2 - 80} y={totalH - 4} fill="#71717a" fontSize="9" fontFamily="monospace">
            aL={aL===-Infinity?"-∞":aL} aR={aR===Infinity?"∞":aR} bL={bL===-Infinity?"-∞":bL} bR={bR===Infinity?"∞":bR}
          </text>
        </g>
      )}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VIZ DISPATCH
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function VizDispatch({ pKey, step }) {
  switch (pKey) {
    case "firstLast": return <FirstLastViz step={step} />;
    case "rotated": return <RotatedViz step={step} />;
    case "koko": return <KokoViz step={step} />;
    case "median": return <MedianViz step={step} />;
    default: return null;
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   IO PANELS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function FirstLastIOPanel({ step }) {
  const { arr, target, phase, foundLeft, foundRight } = step;
  const done = phase === "done";
  const exp = EXPECTED.firstLast;
  const matches = done && foundLeft === exp.left && foundRight === exp.right;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[10px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">nums  </span> = [{arr.join(", ")}]</div>
          <div><span className="text-zinc-500">target</span> = <span className="text-amber-300">{target}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-300">[{exp.left}, {exp.right}]</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {matches && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">first </span> = <span className={foundLeft >= 0 ? "text-emerald-300 font-bold" : "text-zinc-600"}>{foundLeft >= 0 ? foundLeft : "?"}</span>
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">last  </span> = <span className={foundRight >= 0 ? "text-emerald-300 font-bold" : "text-zinc-600"}>{foundRight >= 0 ? foundRight : "?"}</span>
        </div>
        <div className="font-mono text-[10px] text-zinc-600 mt-1">
          phase: {step.searchPhase}
        </div>
      </div>
    </div>
  );
}

function RotatedIOPanel({ step }) {
  const { arr, target, phase, foundIdx } = step;
  const done = phase === "done";
  const exp = EXPECTED.rotated;
  const matches = done && foundIdx === exp.index;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[10px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">nums  </span> = [{arr.join(", ")}]</div>
          <div><span className="text-zinc-500">target</span> = <span className="text-amber-300">{target}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">index</span> = <span className="text-zinc-300">{exp.index}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {matches && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">found</span> = <span className={foundIdx >= 0 ? "text-emerald-300 font-bold" : "text-zinc-600"}>
            {foundIdx >= 0 ? `index ${foundIdx}` : "searching..."}
          </span>
        </div>
        {step.sortedHalf && (
          <div className="font-mono text-[10px] text-zinc-600 mt-1">
            sorted half: {step.sortedHalf}
          </div>
        )}
      </div>
    </div>
  );
}

function KokoIOPanel({ step }) {
  const { piles, h, lo, hi, mid, hours, phase, answer } = step;
  const done = phase === "done";
  const exp = EXPECTED.koko;
  const matches = done && answer === exp.speed;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">piles</span> = [{piles.join(", ")}]</div>
          <div><span className="text-zinc-500">h    </span> = <span className="text-amber-300">{h}</span> hours</div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">min_speed</span> = <span className="text-zinc-300">{exp.speed}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {matches && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">range </span> = <span className="text-zinc-300">[{lo}, {hi}]</span></div>
          {mid > 0 && <div><span className="text-zinc-500">mid   </span> = <span className="text-purple-300">{mid}</span></div>}
          {hours !== null && <div><span className="text-zinc-500">hours </span> = <span className={hours <= h ? "text-emerald-300" : "text-red-300"}>{hours}</span> / {h}</div>}
          {answer && <div><span className="text-zinc-500">answer</span> = <span className="text-emerald-300 font-bold">{answer}</span></div>}
        </div>
      </div>
    </div>
  );
}

function MedianIOPanel({ step }) {
  const { A, B, phase, result, i, j } = step;
  const done = phase === "done";
  const exp = EXPECTED.median;
  const matches = done && result === exp.median;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[10px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">A</span> = [{A.join(", ")}]</div>
          <div><span className="text-zinc-500">B</span> = [{B.join(", ")}]</div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">median</span> = <span className="text-zinc-300">{exp.median}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {matches && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          {i >= 0 && <div><span className="text-zinc-500">i</span> = <span className="text-emerald-300">{i}</span> (A takes {i}), <span className="text-zinc-500">j</span> = <span className="text-blue-300">{j}</span> (B takes {j})</div>}
          <div>
            <span className="text-zinc-500">median</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-600"}>{result !== null ? result : "?"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IOPanelDispatch({ pKey, step }) {
  switch (pKey) {
    case "firstLast": return <FirstLastIOPanel step={step} />;
    case "rotated": return <RotatedIOPanel step={step} />;
    case "koko": return <KokoIOPanel step={step} />;
    case "median": return <MedianIOPanel step={step} />;
    default: return null;
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STATE PANELS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function FirstLastState({ step }) {
  const { lo, hi, mid, searchPhase, foundLeft, foundRight, arr } = step;
  const n = arr.length;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Binary Search State</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{lo >= 0 ? lo : "–"}</div>
          <div className="text-[9px] text-zinc-600">lo</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-purple-400">{mid >= 0 ? mid : "–"}</div>
          <div className="text-[9px] text-zinc-600">mid</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-amber-400">{hi >= 0 && hi <= n ? hi : "–"}</div>
          <div className="text-[9px] text-zinc-600">hi</div>
        </div>
        <div className="border-l border-zinc-800 pl-3 flex gap-3">
          <div className="text-center">
            <div className="text-lg font-bold font-mono text-emerald-400">{foundLeft >= 0 ? foundLeft : "?"}</div>
            <div className="text-[9px] text-zinc-600">first</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold font-mono text-emerald-400">{foundRight >= 0 ? foundRight : "?"}</div>
            <div className="text-[9px] text-zinc-600">last</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RotatedState({ step }) {
  const { lo, hi, mid, arr, foundIdx, sortedHalf } = step;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Search State</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{lo}</div>
          <div className="text-[9px] text-zinc-600">lo ({arr[lo] ?? "–"})</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-purple-400">{mid >= 0 ? mid : "–"}</div>
          <div className="text-[9px] text-zinc-600">mid ({mid >= 0 ? arr[mid] : "–"})</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-amber-400">{hi}</div>
          <div className="text-[9px] text-zinc-600">hi ({arr[hi] ?? "–"})</div>
        </div>
        <div className="border-l border-zinc-800 pl-3 text-center">
          <div className="text-lg font-bold font-mono text-emerald-400">
            {foundIdx >= 0 ? foundIdx : "–"}
          </div>
          <div className="text-[9px] text-zinc-600">found</div>
        </div>
      </div>
      {sortedHalf && (
        <div className="mt-2 text-[10px] text-zinc-600 font-mono text-center">
          {sortedHalf === "left" ? `Left sorted: nums[${lo}..${mid}] = [${arr[lo]}..${arr[mid]}]` : `Right sorted: nums[${mid}..${hi}] = [${arr[mid]}..${arr[hi]}]`}
        </div>
      )}
    </div>
  );
}

function KokoState({ step }) {
  const { lo, hi, mid, hours, h, feasible } = step;
  const range = hi - lo + 1;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Answer Space</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{lo}</div>
          <div className="text-[9px] text-zinc-600">lo</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-purple-400">{mid > 0 ? mid : "–"}</div>
          <div className="text-[9px] text-zinc-600">mid (k)</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-amber-400">{hi}</div>
          <div className="text-[9px] text-zinc-600">hi</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-zinc-400">{range}</div>
          <div className="text-[9px] text-zinc-600">remaining</div>
        </div>
        {hours !== null && (
          <div className="border-l border-zinc-800 pl-3 text-center">
            <div className={`text-lg font-bold font-mono ${feasible ? "text-emerald-400" : "text-red-400"}`}>{hours}</div>
            <div className="text-[9px] text-zinc-600">hours/{h}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MedianState({ step }) {
  const { A, B, i, j, lo, hi, aL, aR, bL, bR } = step;
  const fmt = v => v === Infinity ? "∞" : v === -Infinity ? "-∞" : v;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Partition State</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{lo}</div>
          <div className="text-[9px] text-zinc-600">lo</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-emerald-400">{i >= 0 ? i : "–"}</div>
          <div className="text-[9px] text-zinc-600">i (A cut)</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-300">{j >= 0 ? j : "–"}</div>
          <div className="text-[9px] text-zinc-600">j (B cut)</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-amber-400">{hi}</div>
          <div className="text-[9px] text-zinc-600">hi</div>
        </div>
      </div>
      {aL !== null && (
        <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] font-mono text-center">
          <div className="bg-zinc-800/50 rounded px-1.5 py-0.5">
            <span className="text-emerald-500">A[i−1]</span>=<span className="text-zinc-300">{fmt(aL)}</span>
            {" ≤ "}
            <span className="text-blue-400">B[j]</span>=<span className="text-zinc-300">{fmt(bR)}</span>
            {" "}{aL <= bR ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}
          </div>
          <div className="bg-zinc-800/50 rounded px-1.5 py-0.5">
            <span className="text-blue-400">B[j−1]</span>=<span className="text-zinc-300">{fmt(bL)}</span>
            {" ≤ "}
            <span className="text-emerald-500">A[i]</span>=<span className="text-zinc-300">{fmt(aR)}</span>
            {" "}{bL <= aR ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function StateDispatch({ pKey, step }) {
  switch (pKey) {
    case "firstLast": return <FirstLastState step={step} />;
    case "rotated": return <RotatedState step={step} />;
    case "koko": return <KokoState step={step} />;
    case "median": return <MedianState step={step} />;
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
      >Next →</button>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PHASE BADGE
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function phaseBadge(phase) {
  const map = {
    init: "bg-zinc-800 text-zinc-400",
    "init-left": "bg-zinc-800 text-zinc-400",
    "init-right": "bg-purple-900 text-purple-300",
    "go-left": "bg-blue-900 text-blue-300",
    "go-right": "bg-amber-900 text-amber-300",
    "found-left": "bg-emerald-900 text-emerald-300",
    "not-found": "bg-red-900 text-red-300",
    found: "bg-emerald-900 text-emerald-300",
    feasible: "bg-emerald-900 text-emerald-300",
    "too-slow": "bg-red-900 text-red-300",
    valid: "bg-emerald-900 text-emerald-300",
    done: "bg-emerald-900 text-emerald-300",
    "skip-i": "bg-zinc-800 text-zinc-400",
  };
  return map[phase] || "bg-zinc-800 text-zinc-400";
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

export default function BinarySearchViz() {
  const [pKey, setPKey] = useState("firstLast");
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
            <h1 className="text-2xl font-bold tracking-tight">Binary Search</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Boundary, Rotated, Answer Space & Partition — O(log n) Patterns</p>
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

        {/* â•â•â• 2. Core Idea â•â•â• */}
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

          {/* ── COL 1: IO + Viz ── */}
          <div className="col-span-3 space-y-3">
            <IOPanelDispatch pKey={pKey} step={step} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <VizDispatch pKey={pKey} step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                {pKey === "firstLast" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />mid</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#1e3a5f] inline-block" />Active</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-700 inline-block" />Found</span>
                </>}
                {pKey === "rotated" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />mid</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-800 inline-block" />Active</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Found</span>
                </>}
                {pKey === "koko" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-600 inline-block" />Piles</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-800 inline-block" />Search</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-600 inline-block" />Answer</span>
                </>}
                {pKey === "median" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-700 inline-block" />A left</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-800 inline-block" />B left</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-3 rounded-sm bg-amber-500 inline-block" />Cut</span>
                </>}
              </div>
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "found" || step.phase === "found-left" || step.phase === "valid" ? "bg-emerald-950/20 border-emerald-900/50" :
              step.phase === "not-found" ? "bg-red-950/20 border-red-900/50" :
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

            <StateDispatch pKey={pKey} step={step} />

            {step.phase === "done" && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Result</div>
                <div className="font-mono text-[11px] text-emerald-300">
                  {pKey === "firstLast" && `Range = [${step.foundLeft}, ${step.foundRight}]`}
                  {pKey === "rotated" && (step.foundIdx >= 0 ? `Found at index ${step.foundIdx}` : "Not found → -1")}
                  {pKey === "koko" && `Minimum eating speed = ${step.answer}`}
                  {pKey === "median" && `Median = ${step.result}`}
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel pKey={pKey} highlightLines={step.codeHL} />
          </div>

        </div>

        {/* â•â•â• 5. Bottom 2-Column Row â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use Binary Search</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Sorted array — find element, boundary, or insertion point</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Monotonic predicate — answer space where feasibility flips from ✗ to ✓</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Rotated / bitonic arrays — one half always sorted</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Minimize maximum / maximize minimum problems</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Partition two sorted arrays (median, k-th element)</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(log n) per search · O(n log n) if combined with sort</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(1) iterative</div>
                <div><span className="text-zinc-500 font-semibold">Key insight:</span> lo &lt; hi (exclusive) for boundary; lo ≤ hi (inclusive) for exact match</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 34 — Find First and Last Position</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 33 — Search in Rotated Sorted Array</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 875 — Koko Eating Bananas</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 4 — Median of Two Sorted Arrays</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 153 — Find Minimum in Rotated Array</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1011 — Capacity to Ship Packages</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 410 — Split Array Largest Sum</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 162 — Find Peak Element</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
