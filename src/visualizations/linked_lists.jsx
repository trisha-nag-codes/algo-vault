import { useState, useMemo } from "react";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LINKED LISTS â€” Multi-Problem Visualizer
   Patterns: Pointer Reversal Â· Floyd's Cycle Â· Heap Merge
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* â€”â€”â€” Problem Definitions â€”â€”â€” */
const PROBLEMS = {
  reverse: {
    title: "Reverse Linked List",
    lc: "LC 206", difficulty: "Medium",
    patternTag: "Iterative Pointer Reversal",
    coreIdea: "Use three pointers â€” prev, curr, next. At each step: save curr.next, reverse the link (curr.next = prev), then advance prev and curr forward. After the loop, prev points to the new head. Each node is visited exactly once â†’ O(n) time, O(1) space. This is the foundation for LC 25 (reverse in k-groups), LC 92 (reverse between), and many partition problems.",
    input: { list: [1, 2, 3, 4, 5] },
    expected: { value: [5, 4, 3, 2, 1], detail: "fully reversed" },
  },
  cycle: {
    title: "Linked List Cycle II",
    lc: "LC 142", difficulty: "Medium",
    patternTag: "Floyd's Tortoise & Hare",
    coreIdea: "Phase 1: slow moves 1 step, fast moves 2 steps. If they meet, a cycle exists. Phase 2: reset one pointer to head. Move both at speed 1 â€” where they meet again is the cycle start. The math: if the distance from head to cycle start is 'a' and meeting point is 'b' steps into the cycle, then slow traveled a+b and fast traveled a+b+c+b (one full cycle c+b extra). Since fast=2Ã—slow â†’ a = c. So moving from head and from meeting point converge at the cycle start.",
    input: { list: [3, 2, 0, -4], cyclePos: 1 },
    expected: { value: 1, detail: "cycle starts at index 1 (node val=2)" },
  },
  mergeK: {
    title: "Merge K Sorted Lists",
    lc: "LC 23", difficulty: "Hard",
    patternTag: "Min-Heap Merge",
    coreIdea: "Push the head of each list into a min-heap. Repeatedly pop the smallest node, append it to the result, and push that node's next (if any) back into the heap. The heap always holds at most k nodes (one per list), so each push/pop is O(log k). With n total nodes across all lists â†’ O(n log k) time, O(k) space. This generalizes the 2-list merge and is the optimal approach.",
    input: { lists: [[1,4,5],[1,3,4],[2,6]] },
    expected: { value: [1,1,2,3,4,4,5,6], detail: "3 lists merged into sorted order" },
  },
};

/* â€”â€”â€” Code for each problem â€”â€”â€” */
const CODES = {
  reverse: [
    { id: 0,  text: `def reverseList(head):` },
    { id: 1,  text: `    prev = None` },
    { id: 2,  text: `    curr = head` },
    { id: 3,  text: `` },
    { id: 4,  text: `    while curr:` },
    { id: 5,  text: `        nxt = curr.next` },
    { id: 6,  text: `        curr.next = prev` },
    { id: 7,  text: `        prev = curr` },
    { id: 8,  text: `        curr = nxt` },
    { id: 9,  text: `` },
    { id: 10, text: `    return prev` },
  ],
  cycle: [
    { id: 0,  text: `def detectCycle(head):` },
    { id: 1,  text: `    slow = fast = head` },
    { id: 2,  text: `` },
    { id: 3,  text: `    # Phase 1: find meeting point` },
    { id: 4,  text: `    while fast and fast.next:` },
    { id: 5,  text: `        slow = slow.next` },
    { id: 6,  text: `        fast = fast.next.next` },
    { id: 7,  text: `        if slow == fast:` },
    { id: 8,  text: `            break` },
    { id: 9,  text: `    else:` },
    { id: 10, text: `        return None  # no cycle` },
    { id: 11, text: `` },
    { id: 12, text: `    # Phase 2: find cycle start` },
    { id: 13, text: `    slow = head` },
    { id: 14, text: `    while slow != fast:` },
    { id: 15, text: `        slow = slow.next` },
    { id: 16, text: `        fast = fast.next` },
    { id: 17, text: `` },
    { id: 18, text: `    return slow` },
  ],
  mergeK: [
    { id: 0,  text: `import heapq` },
    { id: 1,  text: `` },
    { id: 2,  text: `def mergeKLists(lists):` },
    { id: 3,  text: `    heap = []` },
    { id: 4,  text: `    for i, head in enumerate(lists):` },
    { id: 5,  text: `        if head:` },
    { id: 6,  text: `            heapq.heappush(heap, (head.val, i, head))` },
    { id: 7,  text: `` },
    { id: 8,  text: `    dummy = curr = ListNode(0)` },
    { id: 9,  text: `` },
    { id: 10, text: `    while heap:` },
    { id: 11, text: `        val, i, node = heapq.heappop(heap)` },
    { id: 12, text: `        curr.next = node` },
    { id: 13, text: `        curr = curr.next` },
    { id: 14, text: `        if node.next:` },
    { id: 15, text: `            heapq.heappush(heap, (node.next.val, i, node.next))` },
    { id: 16, text: `` },
    { id: 17, text: `    return dummy.next` },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Build Steps â€” LC 206 Reverse
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildReverse() {
  const vals = [1, 2, 3, 4, 5];
  const steps = [];
  // links[i] = index of next node, -1 for null
  let links = [1, 2, 3, 4, -1];
  let prev = -1, curr = 0;

  steps.push({
    title: "Initialize â€” prev=None, curr=head",
    detail: `List: ${vals.join(" â†’ ")} â†’ None. Set prev=None, curr=node(1). We will reverse each link one by one.`,
    vals, links: [...links],
    prev: -1, curr: 0, nxt: -1,
    phase: "init", codeHL: [0, 1, 2],
    reversed: [], finalized: [],
    headIdx: 0,
  });

  while (curr !== -1) {
    const nxt = links[curr];
    const oldLinks = [...links];
    links[curr] = prev;

    steps.push({
      title: `Reverse: node(${vals[curr]}).next = ${prev === -1 ? "None" : `node(${vals[prev]})`}`,
      detail: `Save nxt=${nxt === -1 ? "None" : `node(${vals[nxt]})`}. Reverse link: ${vals[curr]}.next â†’ ${prev === -1 ? "None" : vals[prev]}. Advance prevâ†’${vals[curr]}, currâ†’${nxt === -1 ? "None" : vals[nxt]}.`,
      vals, links: [...links],
      prev: curr, curr: nxt, nxt,
      phase: "reverse", codeHL: [4, 5, 6, 7, 8],
      reversed: [...(steps[steps.length - 1]?.reversed || []), curr],
      finalized: [],
      headIdx: 0,
    });

    prev = curr;
    curr = nxt;
  }

  steps.push({
    title: `âœ“ Complete â€” New Head = node(${vals[prev]})`,
    detail: `All links reversed. List: ${vals.slice().reverse().join(" â†’ ")} â†’ None. prev points to new head (${vals[prev]}). O(n) time, O(1) space.`,
    vals, links: [...links],
    prev, curr: -1, nxt: -1,
    phase: "done", codeHL: [10],
    reversed: vals.map((_, i) => i),
    finalized: vals.map((_, i) => i),
    headIdx: prev,
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Build Steps â€” LC 142 Cycle II
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildCycle() {
  const vals = [3, 2, 0, -4];
  const cyclePos = 1; // index where cycle starts
  // links: 0â†’1, 1â†’2, 2â†’3, 3â†’1 (cycle back)
  const links = [1, 2, 3, cyclePos];
  const steps = [];

  let slow = 0, fast = 0;
  steps.push({
    title: "Initialize â€” slow=head, fast=head",
    detail: `List: 3 â†’ 2 â†’ 0 â†’ -4 â†’ (back to 2). Cycle starts at index ${cyclePos} (val=${vals[cyclePos]}). Phase 1: move slow +1, fast +2 until they meet.`,
    vals, links,
    slow: 0, fast: 0,
    phase: "init", codeHL: [0, 1],
    met: false, phase2: false,
    cyclePos, meetIdx: -1,
    finalized: [],
  });

  // Phase 1: find meeting point
  let stepCount = 0;
  while (true) {
    slow = links[slow];
    fast = links[links[fast]];
    stepCount++;

    const met = slow === fast;
    steps.push({
      title: met
        ? `Phase 1, Step ${stepCount}: slow=fast=node(${vals[slow]}) â€” Met!`
        : `Phase 1, Step ${stepCount}: slowâ†’node(${vals[slow]}), fastâ†’node(${vals[fast]})`,
      detail: met
        ? `slow and fast meet at index ${slow} (val=${vals[slow]}). Cycle confirmed. Now Phase 2: reset slow to head, move both +1 until they meet again.`
        : `slow moved 1 step to node(${vals[slow]}). fast moved 2 steps to node(${vals[fast]}). Not equal yet â€” continue.`,
      vals, links,
      slow, fast,
      phase: met ? "met" : "chase", codeHL: met ? [4, 5, 6, 7, 8] : [4, 5, 6, 7],
      met, phase2: false,
      cyclePos, meetIdx: met ? slow : -1,
      finalized: [],
    });

    if (met) break;
  }

  // Phase 2: find cycle start
  slow = 0;
  steps.push({
    title: `Phase 2: Reset slowâ†’head, both move +1`,
    detail: `slow reset to head (index 0, val=${vals[0]}). fast stays at meeting point (index ${fast}, val=${vals[fast]}). Move both +1 step until they meet â€” that's the cycle start.`,
    vals, links,
    slow: 0, fast,
    phase: "phase2", codeHL: [12, 13, 14],
    met: true, phase2: true,
    cyclePos, meetIdx: fast,
    finalized: [],
  });

  let p2Steps = 0;
  while (slow !== fast) {
    slow = links[slow];
    fast = links[fast];
    p2Steps++;

    const found = slow === fast;
    steps.push({
      title: found
        ? `Phase 2, Step ${p2Steps}: slow=fast=node(${vals[slow]}) â€” Cycle Start Found!`
        : `Phase 2, Step ${p2Steps}: slowâ†’node(${vals[slow]}), fastâ†’node(${vals[fast]})`,
      detail: found
        ? `Both pointers meet at index ${slow} (val=${vals[slow]}). This is the cycle entry. Math: dist(headâ†’entry) = dist(meetingâ†’entry) moving forward in cycle.`
        : `slow at node(${vals[slow]}), fast at node(${vals[fast]}). Not equal â€” continue.`,
      vals, links,
      slow, fast,
      phase: found ? "found" : "phase2", codeHL: found ? [14, 15, 16, 18] : [14, 15, 16],
      met: true, phase2: true,
      cyclePos, meetIdx: steps[steps.length - 1].meetIdx,
      finalized: found ? [slow] : [],
    });
  }

  steps.push({
    title: `âœ“ Complete â€” Cycle Starts at Index ${slow} (val=${vals[slow]})`,
    detail: `Floyd's algorithm: Phase 1 O(n) to detect, Phase 2 O(n) to find start. Total O(n) time, O(1) space. The key math: a = c (distance from head to cycle start = distance from meeting point to cycle start).`,
    vals, links,
    slow, fast,
    phase: "done", codeHL: [18],
    met: true, phase2: true,
    cyclePos, meetIdx: slow,
    finalized: [slow],
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Build Steps â€” LC 23 Merge K Sorted
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildMergeK() {
  const lists = [[1,4,5],[1,3,4],[2,6]];
  const steps = [];

  // Track position in each list
  const ptrs = lists.map(() => 0);
  const result = [];

  // Initial heap: push head of each list
  let heap = lists.map((lst, i) => ({ val: lst[0], listIdx: i }))
    .sort((a, b) => a.val - b.val);

  steps.push({
    title: "Initialize â€” Push Heads into Min-Heap",
    detail: `${lists.length} lists. Push head of each: [${heap.map(h => `(${h.val},L${h.listIdx})`).join(", ")}]. Dummy node created for result chain.`,
    lists, ptrs: [...ptrs], result: [],
    heap: heap.map(h => ({ ...h })),
    popped: null, pushed: null,
    phase: "init", codeHL: [2, 3, 4, 5, 6, 8],
    finalized: [],
  });

  while (heap.length > 0) {
    // Pop min
    const min = heap.shift();
    const { val, listIdx } = min;
    result.push(val);
    ptrs[listIdx]++;

    // Push next from same list if exists
    const nextIdx = ptrs[listIdx];
    let pushed = null;
    if (nextIdx < lists[listIdx].length) {
      pushed = { val: lists[listIdx][nextIdx], listIdx };
      heap.push(pushed);
      heap.sort((a, b) => a.val - b.val);
    }

    steps.push({
      title: `Pop min=${val} from L${listIdx}${pushed ? `, push ${pushed.val} from L${listIdx}` : " (list exhausted)"}`,
      detail: `Heap-pop (${val}, L${listIdx}) â†’ append ${val} to result. ${pushed ? `Next in L${listIdx} is ${pushed.val} â†’ push to heap.` : `L${listIdx} is empty, nothing to push.`} Result so far: [${result.join(", ")}]. Heap: [${heap.map(h => `(${h.val},L${h.listIdx})`).join(", ")}].`,
      lists, ptrs: [...ptrs], result: [...result],
      heap: heap.map(h => ({ ...h })),
      popped: { val, listIdx }, pushed,
      phase: "merge", codeHL: pushed ? [10, 11, 12, 13, 14, 15] : [10, 11, 12, 13, 14],
      finalized: [],
    });
  }

  steps.push({
    title: `âœ“ Complete â€” Merged: [${result.join(", ")}]`,
    detail: `All ${result.length} nodes merged in sorted order. Heap empty. O(n log k) where n=${result.length} total nodes, k=${lists.length} lists. Each of n pops/pushes costs O(log k).`,
    lists, ptrs: [...ptrs], result: [...result],
    heap: [],
    popped: null, pushed: null,
    phase: "done", codeHL: [17],
    finalized: Array.from({ length: result.length }, (_, i) => i),
  });

  return steps;
}

const BUILDERS = {
  reverse: buildReverse,
  cycle: buildCycle,
  mergeK: buildMergeK,
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Linked List SVG Visualizations
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function ListViz({ step, probKey }) {
  if (probKey === "reverse") return <ListVizReverse step={step} />;
  if (probKey === "cycle") return <ListVizCycle step={step} />;
  return <ListVizMergeK step={step} />;
}

function ListVizReverse({ step }) {
  const { vals, links, prev, curr, nxt, phase, reversed } = step;
  const n = vals.length;
  const nodeW = 56, gap = 24, nodeH = 34;
  const padX = 40, padY = 50;
  const w = n * nodeW + (n - 1) * gap + padX * 2;
  const h = nodeH + padY * 2 + 20;
  const revSet = new Set(reversed || []);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 160 }}>
      {/* Arrows */}
      {vals.map((_, i) => {
        const tgt = links[i];
        if (tgt === -1) return null;
        const x1 = padX + i * (nodeW + gap) + nodeW;
        const y1 = padY + nodeH / 2;
        // Forward arrow
        if (tgt === i + 1) {
          const x2 = padX + tgt * (nodeW + gap);
          return (
            <g key={`a-${i}`}>
              <line x1={x1} y1={y1} x2={x2 - 3} y2={y1} stroke="#3f3f46" strokeWidth={1.5} />
              <polygon points={`${x2 - 3},${y1 - 4} ${x2 + 3},${y1} ${x2 - 3},${y1 + 4}`} fill="#3f3f46" />
            </g>
          );
        }
        // Reversed arrow (tgt < i)
        if (tgt < i) {
          const sx = padX + i * (nodeW + gap);
          const ex = padX + tgt * (nodeW + gap) + nodeW;
          const curveY = padY + nodeH + 18;
          return (
            <g key={`a-${i}`}>
              <path d={`M${sx},${y1} Q${sx - 10},${curveY} ${(sx + ex) / 2},${curveY} Q${ex + 10},${curveY} ${ex + 3},${y1}`}
                fill="none" stroke="#10b981" strokeWidth={1.5} strokeDasharray={phase === "done" ? "none" : "4 2"} />
              <polygon points={`${ex + 3},${y1 - 4} ${ex + 9},${y1} ${ex + 3},${y1 + 4}`} fill="#10b981" />
            </g>
          );
        }
        return null;
      })}
      {/* Null after last unreversed node */}
      {phase !== "done" && curr !== -1 && (
        <text x={padX + (n - 1) * (nodeW + gap) + nodeW + 12} y={padY + nodeH / 2 + 1}
          fill="#52525b" fontSize="10" fontFamily="monospace" dominantBaseline="central">None</text>
      )}
      {/* Null after first reversed node in done state */}
      {phase === "done" && (
        <text x={padX + 0 * (nodeW + gap) + nodeW + 12} y={padY + nodeH + 22}
          fill="#52525b" fontSize="9" fontFamily="monospace">None â†</text>
      )}
      {/* Nodes */}
      {vals.map((v, i) => {
        const x = padX + i * (nodeW + gap);
        const y = padY;
        const isPrev = prev === i && phase !== "done";
        const isCurr = curr === i && phase !== "done" && phase !== "init";
        const isNxt = nxt === i && phase === "reverse";
        const isRev = revSet.has(i);
        const isDone = phase === "done";

        let fill = "#18181b";
        if (isDone) fill = "#064e3b";
        else if (isCurr) fill = "#3b82f6";
        else if (isPrev) fill = "#7c3aed";
        else if (isNxt) fill = "#b45309";
        else if (isRev) fill = "#022c22";

        let stroke = "#3f3f46";
        if (isDone) stroke = "#10b981";
        else if (isCurr) stroke = "#60a5fa";
        else if (isPrev) stroke = "#a78bfa";
        else if (isNxt) stroke = "#f59e0b";
        else if (isRev) stroke = "#059669";

        return (
          <g key={i}>
            <rect x={x} y={y} width={nodeW} height={nodeH} rx={8}
              fill={fill} stroke={stroke} strokeWidth={isCurr || isPrev ? 2.5 : 1.5} />
            <text x={x + nodeW / 2} y={y + nodeH / 2 + 1}
              textAnchor="middle" dominantBaseline="central"
              fill={isDone ? "#34d399" : isCurr ? "#93c5fd" : isPrev ? "#c4b5fd" : isNxt ? "#fbbf24" : isRev ? "#6ee7b7" : "#71717a"}
              fontSize="15" fontWeight="700" fontFamily="monospace">{v}</text>
            {/* Pointer labels */}
            {isPrev && (
              <text x={x + nodeW / 2} y={y - 10} textAnchor="middle" fill="#a78bfa"
                fontSize="9" fontWeight="700" fontFamily="monospace">prev</text>
            )}
            {isCurr && (
              <text x={x + nodeW / 2} y={y - 10} textAnchor="middle" fill="#60a5fa"
                fontSize="9" fontWeight="700" fontFamily="monospace">curr</text>
            )}
            {isNxt && !isCurr && !isPrev && (
              <text x={x + nodeW / 2} y={y - 10} textAnchor="middle" fill="#fbbf24"
                fontSize="9" fontWeight="700" fontFamily="monospace">nxt</text>
            )}
            {/* Index below */}
            <text x={x + nodeW / 2} y={y + nodeH + 14} textAnchor="middle" fill="#3f3f46"
              fontSize="9" fontFamily="monospace">{i}</text>
          </g>
        );
      })}
      {/* prev=None label */}
      {phase !== "done" && prev === -1 && (
        <text x={padX - 30} y={padY + nodeH / 2 + 1} fill="#a78bfa" fontSize="9"
          fontFamily="monospace" dominantBaseline="central">prev=None</text>
      )}
    </svg>
  );
}

function ListVizCycle({ step }) {
  const { vals, links, slow, fast, phase: ph, cyclePos, meetIdx } = step;
  const n = vals.length;
  // Layout: nodes 0,1,2,3 in a shape showing cycle
  // 0 â†’ 1 â†’ 2 â†’ 3
  //     â†‘         â†“
  //     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
  const positions = [
    { x: 40, y: 60 },
    { x: 140, y: 60 },
    { x: 260, y: 60 },
    { x: 360, y: 60 },
  ];
  const w = 440, h = 140;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 160 }}>
      {/* Edges */}
      {vals.map((_, i) => {
        const tgt = links[i];
        const from = positions[i];
        const to = positions[tgt];
        if (i === n - 1 && tgt === cyclePos) {
          // Cycle-back arrow (curved below)
          const curveY = 115;
          return (
            <g key={`e-${i}`}>
              <path d={`M${from.x + 24},${from.y} Q${from.x + 30},${curveY} ${(from.x + to.x) / 2},${curveY} Q${to.x - 10},${curveY} ${to.x},${to.y + 18}`}
                fill="none" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 3" />
              <polygon points={`${to.x - 4},${to.y + 18} ${to.x},${to.y + 24} ${to.x + 4},${to.y + 18}`} fill="#ef4444" />
              <text x={(from.x + to.x) / 2} y={curveY + 12} textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="monospace">cycle</text>
            </g>
          );
        }
        const x1 = from.x + 24, y1 = from.y;
        const x2 = to.x - 24, y2 = to.y;
        return (
          <g key={`e-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3f3f46" strokeWidth={1.5} />
            <polygon points={`${x2},${y2 - 4} ${x2 + 6},${y2} ${x2},${y2 + 4}`} fill="#3f3f46" />
          </g>
        );
      })}
      {/* Nodes */}
      {vals.map((v, i) => {
        const { x, y } = positions[i];
        const isSlow = slow === i;
        const isFast = fast === i;
        const isBoth = isSlow && isFast;
        const isCycleStart = (ph === "found" || ph === "done") && i === cyclePos;
        const isMeet = meetIdx === i && (ph === "met" || ph === "phase2");

        let fill = "#18181b";
        if (isCycleStart) fill = "#7c2d12";
        else if (isBoth) fill = "#7c3aed";
        else if (isSlow) fill = "#0e7490";
        else if (isFast) fill = "#b45309";
        else if (isMeet) fill = "#3f3f46";

        let stroke = "#3f3f46";
        if (isCycleStart) stroke = "#f97316";
        else if (isBoth) stroke = "#a78bfa";
        else if (isSlow) stroke = "#06b6d4";
        else if (isFast) stroke = "#f59e0b";

        return (
          <g key={i}>
            <circle cx={x} cy={y} r={20} fill={fill} stroke={stroke} strokeWidth={isSlow || isFast ? 2.5 : 1.5} />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central"
              fill={isCycleStart ? "#fb923c" : isBoth ? "#c4b5fd" : isSlow ? "#67e8f9" : isFast ? "#fbbf24" : "#71717a"}
              fontSize="14" fontWeight="700" fontFamily="monospace">{v}</text>
            {/* Labels above */}
            {isBoth && (
              <text x={x} y={y - 28} textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="700" fontFamily="monospace">S+F</text>
            )}
            {isSlow && !isFast && (
              <text x={x} y={y - 28} textAnchor="middle" fill="#67e8f9" fontSize="9" fontWeight="700" fontFamily="monospace">slow</text>
            )}
            {isFast && !isSlow && (
              <text x={x} y={y - 28} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="700" fontFamily="monospace">fast</text>
            )}
            {isCycleStart && (
              <text x={x} y={y - 28} textAnchor="middle" fill="#fb923c" fontSize="9" fontWeight="700" fontFamily="monospace">start!</text>
            )}
            {/* Index */}
            <text x={x} y={y + 32} textAnchor="middle" fill="#3f3f46" fontSize="9" fontFamily="monospace">idx {i}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ListVizMergeK({ step }) {
  const { lists, ptrs, result, popped, heap, phase: ph } = step;
  const padX = 16, padY = 16;
  const nodeW = 38, nodeH = 28, gap = 6;
  const listGap = 8;
  const maxLen = Math.max(...lists.map(l => l.length));
  const w = padX * 2 + maxLen * (nodeW + gap) + 60;
  const h = padY * 2 + lists.length * (nodeH + listGap) + 8;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 150 }}>
      {lists.map((lst, li) => {
        const y = padY + li * (nodeH + listGap);
        return (
          <g key={li}>
            <text x={padX - 2} y={y + nodeH / 2 + 1} textAnchor="end" fill="#52525b"
              fontSize="9" fontWeight="600" fontFamily="monospace" dominantBaseline="central">L{li}</text>
            {lst.map((v, vi) => {
              const x = padX + 10 + vi * (nodeW + gap);
              const consumed = vi < ptrs[li];
              const isHead = vi === ptrs[li];
              const isPopped = popped && popped.listIdx === li && vi === ptrs[li] - 1;
              const isDone = ph === "done";

              let fill = "#18181b";
              if (isDone && consumed) fill = "#022c22";
              else if (isPopped) fill = "#7c2d12";
              else if (consumed) fill = "#0a0a0a";
              else if (isHead) fill = "#1e1b4b";

              let stroke = "#27272a";
              if (isPopped) stroke = "#f97316";
              else if (isHead) stroke = "#6366f1";
              else if (consumed) stroke = "#1a1a1a";
              else if (isDone) stroke = "#059669";

              const textColor = consumed && !isPopped
                ? "#27272a"
                : isPopped ? "#fb923c" : isHead ? "#a5b4fc" : isDone ? "#6ee7b7" : "#52525b";

              return (
                <g key={vi}>
                  <rect x={x} y={y} width={nodeW} height={nodeH} rx={5}
                    fill={fill} stroke={stroke} strokeWidth={isPopped || isHead ? 2 : 1} />
                  <text x={x + nodeW / 2} y={y + nodeH / 2 + 1}
                    textAnchor="middle" dominantBaseline="central"
                    fill={textColor}
                    fontSize="12" fontWeight="700" fontFamily="monospace">{v}</text>
                  {vi < lst.length - 1 && !consumed && (
                    <line x1={x + nodeW} y1={y + nodeH / 2} x2={x + nodeW + gap} y2={y + nodeH / 2}
                      stroke="#3f3f46" strokeWidth={1} />
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* â•â•â• IO Panel â•â•â• */
function IOPanel({ step, probKey }) {
  const prob = PROBLEMS[probKey];
  if (probKey === "reverse") return <IOReverse step={step} prob={prob} />;
  if (probKey === "cycle") return <IOCycle step={step} prob={prob} />;
  return <IOMergeK step={step} prob={prob} />;
}

function IOReverse({ step, prob }) {
  const done = step.phase === "done";
  const { vals, links, reversed, headIdx } = step;
  // Build current list order by following links from headIdx
  const buildOrder = () => {
    const order = [];
    let cur = headIdx;
    const visited = new Set();
    while (cur !== -1 && !visited.has(cur)) {
      visited.add(cur);
      order.push(vals[cur]);
      cur = links[cur];
    }
    return order;
  };
  const currentOrder = done ? buildOrder() : null;
  const match = done && currentOrder && currentOrder.join(",") === prob.expected.value.join(",");

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">head</span> = <span className="text-zinc-300">[{prob.input.list.join(" â†’ ")}]</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-300">[{prob.expected.value.join(" â†’ ")}]</span>
          <span className="text-zinc-600 text-[10px] ml-2">{prob.expected.detail}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {match && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div>
            <span className="text-zinc-500">reversed</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>
              {(reversed || []).length} / {vals.length} links
            </span>
          </div>
          <div>
            <span className="text-zinc-500">prev   </span> = <span className="text-purple-400">
              {step.prev === -1 ? "None" : `node(${vals[step.prev]})`}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">curr   </span> = <span className="text-blue-400">
              {step.curr === -1 ? "None" : `node(${vals[step.curr]})`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IOCycle({ step, prob }) {
  const done = step.phase === "done" || step.phase === "found";
  const { vals, slow, fast, cyclePos, phase: ph } = step;
  const found = ph === "found" || ph === "done";
  const match = found && slow === prob.expected.value;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">head</span> = <span className="text-zinc-300">[{prob.input.list.join(", ")}]</span></div>
          <div><span className="text-zinc-500">pos </span> = <span className="text-red-400">{prob.input.cyclePos}</span> <span className="text-zinc-600">(cycle entry)</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">index</span> = <span className="text-zinc-300">{prob.expected.value}</span>
          <span className="text-zinc-600 text-[10px] ml-2">{prob.expected.detail}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {match && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div>
            <span className="text-zinc-500">phase</span> = <span className="text-zinc-300">
              {step.phase2 ? "2 (find start)" : step.met ? "1 â†’ met!" : "1 (detect)"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">slow </span> = <span className="text-cyan-400">
              idx {slow} (val={vals[slow]})
            </span>
          </div>
          <div>
            <span className="text-zinc-500">fast </span> = <span className="text-amber-400">
              idx {fast} (val={vals[fast]})
            </span>
          </div>
          {found && (
            <div>
              <span className="text-zinc-500">ans  </span> = <span className="text-emerald-300 font-bold">index {slow}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IOMergeK({ step, prob }) {
  const done = step.phase === "done";
  const exp = prob.expected.value;
  const match = done && step.result.length === exp.length && step.result.every((v, i) => v === exp[i]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          {prob.input.lists.map((lst, i) => (
            <div key={i}><span className="text-zinc-500">L{i}</span> = <span className="text-zinc-300">[{lst.join(" â†’ ")}]</span></div>
          ))}
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
          {match && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div>
            <span className="text-zinc-500">result</span> = <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>
              [{step.result.join(", ")}{step.result.length < exp.length ? <span className="text-zinc-700">{step.result.length > 0 ? ", " : ""}?</span> : ""}]
            </span>
          </div>
          <div>
            <span className="text-zinc-500">heap  </span> = <span className="text-zinc-400">
              [{step.heap.map(h => `(${h.val},L${h.listIdx})`).join(", ")}]
            </span>
          </div>
          <div>
            <span className="text-zinc-500">merged</span> = <span className="text-zinc-300">{step.result.length}/{exp.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* â•â•â• Code Panel â•â•â• */
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

/* â•â•â• Navigation Bar â•â•â• */
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
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">Next â†’</button>
    </div>
  );
}

/* â•â•â• State Panel â•â•â• */
function StatePanel({ step, probKey }) {
  if (probKey === "reverse") return <StateReverse step={step} />;
  if (probKey === "cycle") return <StateCycle step={step} />;
  return <StateMergeK step={step} />;
}

function StateReverse({ step }) {
  const { vals, prev, curr, nxt, reversed, phase } = step;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Pointer State</div>
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-purple-400">{prev === -1 ? "âˆ…" : vals[prev]}</div>
          <div className="text-[9px] text-zinc-600">prev</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{curr === -1 ? "âˆ…" : vals[curr]}</div>
          <div className="text-[9px] text-zinc-600">curr</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-amber-400">{nxt === -1 ? "âˆ…" : vals[nxt]}</div>
          <div className="text-[9px] text-zinc-600">nxt</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-emerald-400">{(reversed || []).length}</div>
          <div className="text-[9px] text-zinc-600">reversed</div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Reversal Progress</div>
        <div className="flex gap-1">
          {vals.map((v, i) => {
            const isRev = (reversed || []).includes(i);
            return (
              <div key={i} className={`flex-1 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                isRev ? "bg-emerald-950 border border-emerald-800 text-emerald-300" :
                "bg-zinc-800 border border-zinc-700 text-zinc-600"
              }`}>{v}{isRev ? " âœ“" : ""}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StateCycle({ step }) {
  const { vals, slow, fast, phase: ph, met, phase2, meetIdx } = step;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Floyd's State</div>
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-cyan-400">{vals[slow]}</div>
          <div className="text-[9px] text-zinc-600">slow (idx {slow})</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-amber-400">{vals[fast]}</div>
          <div className="text-[9px] text-zinc-600">fast (idx {fast})</div>
        </div>
        <div className="flex-1 text-center">
          <div className={`text-lg font-bold font-mono ${met ? "text-emerald-400" : "text-zinc-600"}`}>
            {met ? "Yes" : "No"}
          </div>
          <div className="text-[9px] text-zinc-600">met?</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-indigo-400">{phase2 ? "2" : "1"}</div>
          <div className="text-[9px] text-zinc-600">phase</div>
        </div>
      </div>
      {/* Phase explanation */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
          {phase2 ? "Phase 2 â€” Find Cycle Start" : "Phase 1 â€” Detect Cycle"}
        </div>
        <div className="text-[10px] text-zinc-400 leading-relaxed">
          {phase2
            ? "Both pointers move +1. They'll converge at the cycle entry because dist(headâ†’entry) = dist(meetâ†’entry)."
            : "slow +1, fast +2. If cycle exists they must meet inside it. Fast closes gap by 1 each step."
          }
        </div>
        {meetIdx >= 0 && !phase2 && (
          <div className="mt-1.5 text-[10px]">
            <span className="text-zinc-500">Meeting point:</span>{" "}
            <span className="text-amber-300 font-mono font-bold">idx {meetIdx} (val={vals[meetIdx]})</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StateMergeK({ step }) {
  const { lists, ptrs, result, heap, popped, pushed } = step;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Heap State</div>
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-indigo-400">{heap.length}</div>
          <div className="text-[9px] text-zinc-600">heap size</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-orange-400">{popped ? popped.val : "â€”"}</div>
          <div className="text-[9px] text-zinc-600">popped</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{pushed ? pushed.val : "â€”"}</div>
          <div className="text-[9px] text-zinc-600">pushed</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-emerald-400">{result.length}</div>
          <div className="text-[9px] text-zinc-600">merged</div>
        </div>
      </div>
      {/* Heap contents */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Min-Heap (top = min)</div>
        <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
          {heap.length > 0
            ? heap.map((h, i) => (
                <span key={i} className={`inline-flex items-center px-2 h-7 rounded-md font-mono font-bold text-[10px] ${
                  i === 0 ? "bg-orange-950 border border-orange-700 text-orange-300" : "bg-indigo-950 border border-indigo-800 text-indigo-300"
                }`}>
                  ({h.val},L{h.listIdx})
                </span>
              ))
            : <span className="text-[10px] text-zinc-600 italic">empty</span>}
        </div>
      </div>
      {/* List pointers */}
      <div className="mt-2.5 pt-2.5 border-t border-zinc-800">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">List Pointers</div>
        <div className="flex gap-3">
          {lists.map((lst, i) => (
            <div key={i} className="flex items-center gap-1 text-[10px] font-mono">
              <span className="text-zinc-600">L{i}:</span>
              <span className={ptrs[i] >= lst.length ? "text-zinc-700" : "text-zinc-300"}>
                {ptrs[i] >= lst.length ? "done" : `â†’${lst[ptrs[i]]}`}
              </span>
              <span className="text-zinc-700">({ptrs[i]}/{lst.length})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* â•â•â• Main Component â•â•â• */
export default function LinkedListViz() {
  const [probKey, setProbKey] = useState("reverse");
  const [si, setSi] = useState(0);
  const prob = PROBLEMS[probKey];
  const steps = useMemo(() => BUILDERS[probKey](), [probKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const switchProb = (k) => { setProbKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        {/* â•â•â• 1. Header â•â•â• */}
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Linked Lists</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Pointer Reversal Â· Floyd's Cycle Â· Heap Merge â€¢ O(n) Patterns</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PROBLEMS).map(([k, v]) => (
              <button key={k} onClick={() => switchProb(k)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  probKey === k ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                <span className="opacity-60 mr-1">{v.lc}</span>{v.title.length > 20 ? v.title.slice(0, 18) + "â€¦" : v.title}
                <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded ${
                  v.difficulty === "Hard" ? "bg-red-900/50 text-red-400" : "bg-amber-900/50 text-amber-400"
                }`}>{v.difficulty}</span>
              </button>
            ))}
          </div>
        </div>

        {/* â•â•â• 2. Core Idea â•â•â• */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
            <span className="text-[10px] bg-violet-950 text-violet-300 px-2 py-0.5 rounded-md font-bold">{prob.patternTag}</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">{prob.coreIdea}</p>
        </div>

        {/* â•â•â• 3. Navigation â•â•â• */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 4. 3-Column Grid â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* â€”â€” COL 1: IO + List Viz â€”â€” */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} probKey={probKey} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">
                {probKey === "reverse" ? `${prob.input.list.length} nodes â€¢ iterative` :
                 probKey === "cycle" ? `${prob.input.list.length} nodes â€¢ cycle at idx ${prob.input.cyclePos}` :
                 `${prob.input.lists.length} sorted lists â€¢ ${prob.input.lists.flat().length} total nodes`}
              </div>
              <ListViz step={step} probKey={probKey} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                {probKey === "reverse" && (
                  <>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-600 inline-block" />prev</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500 inline-block" />curr</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-600 inline-block" />nxt</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-800 inline-block" />reversed</span>
                  </>
                )}
                {probKey === "cycle" && (
                  <>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-600 inline-block" />slow</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-600 inline-block" />fast</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-600 inline-block" />both</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-700 inline-block" />start</span>
                  </>
                )}
                {probKey === "mergeK" && (
                  <>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-700 inline-block" />popped</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-800 inline-block" />head</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-zinc-800 inline-block" />consumed</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* â€”â€” COL 2: Steps + State â€”â€” */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "found" ? "bg-orange-950/20 border-orange-900" :
              step.phase === "met" ? "bg-amber-950/20 border-amber-900" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "reverse" ? "bg-purple-900 text-purple-300" :
                  step.phase === "chase" ? "bg-cyan-900 text-cyan-300" :
                  step.phase === "met" ? "bg-amber-900 text-amber-300" :
                  step.phase === "phase2" ? "bg-indigo-900 text-indigo-300" :
                  step.phase === "found" ? "bg-orange-900 text-orange-300" :
                  step.phase === "merge" ? "bg-blue-900 text-blue-300" :
                  step.phase === "done" ? "bg-emerald-900 text-emerald-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* State panel */}
            <StatePanel step={step} probKey={probKey} />

            {/* Result array for mergeK */}
            {probKey === "mergeK" && step.result.length > 0 && (
              <div className={`${step.phase === "done" ? "bg-emerald-950/20 border-emerald-900/50" : "bg-zinc-900 border-zinc-800"} border rounded-2xl p-3`}>
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Merged Result</div>
                <div className="flex gap-1 flex-wrap">
                  {step.result.map((v, i) => (
                    <span key={i} className={`inline-flex items-center justify-center w-8 h-7 rounded-md font-mono font-bold text-xs ${
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
                  {probKey === "reverse" && (
                    <>
                      <div><span className="text-zinc-400 font-semibold">Time:</span> O(n) â€” single pass through all nodes</div>
                      <div><span className="text-zinc-400 font-semibold">Space:</span> O(1) â€” only 3 pointers</div>
                    </>
                  )}
                  {probKey === "cycle" && (
                    <>
                      <div><span className="text-zinc-400 font-semibold">Time:</span> O(n) â€” Phase 1 + Phase 2 both â‰¤ n steps</div>
                      <div><span className="text-zinc-400 font-semibold">Space:</span> O(1) â€” only two pointers</div>
                    </>
                  )}
                  {probKey === "mergeK" && (
                    <>
                      <div><span className="text-zinc-400 font-semibold">Time:</span> O(n log k) â€” n pops/pushes, each O(log k)</div>
                      <div><span className="text-zinc-400 font-semibold">Space:</span> O(k) â€” heap holds at most k nodes</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* â€”â€” COL 3: Code â€”â€” */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} probKey={probKey} />
          </div>
        </div>

        {/* â•â•â• 5. Bottom Row: When to Use + Classic Problems â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use Linked Lists</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>"Reverse a sublist" or "reverse in k-groups" â†’ iterative 3-pointer pattern</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>"Detect cycle" or "find cycle start" â†’ Floyd's tortoise & hare</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>"Merge sorted lists" â†’ two-pointer merge or min-heap for k lists</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>"Find middle" or "find kth from end" â†’ slow/fast pointer technique</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Use dummy head node to simplify edge cases (empty list, head changes)</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Key insight:</span> Draw the pointers on paper â€” track prev, curr, next carefully</div>
                <div><span className="text-zinc-500 font-semibold">Common bug:</span> Losing reference to next before overwriting .next</div>
                <div><span className="text-zinc-500 font-semibold">Trick:</span> Sentinel/dummy nodes eliminate null-check edge cases</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 206 â€” Reverse Linked List</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 21 â€” Merge Two Sorted Lists</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 142 â€” Linked List Cycle II</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 143 â€” Reorder List</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 146 â€” LRU Cache</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 138 â€” Copy List with Random Pointer</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 23 â€” Merge K Sorted Lists</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 25 â€” Reverse Nodes in k-Group</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 460 â€” LFU Cache</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
