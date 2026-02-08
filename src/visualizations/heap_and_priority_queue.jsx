import { useState, useMemo } from "react";

/* â•â•â• Heap helpers â•â•â• */
function minPush(h, v) { h.push(v); let i = h.length - 1; while (i > 0) { const p = (i-1)>>1; if (h[p] > h[i]) { [h[p],h[i]] = [h[i],h[p]]; i = p; } else break; } }
function minPop(h) { if (!h.length) return undefined; const top = h[0]; h[0] = h[h.length-1]; h.pop(); let i = 0; while (true) { let s=i; const l=2*i+1,r=2*i+2; if (l<h.length&&h[l]<h[s]) s=l; if (r<h.length&&h[r]<h[s]) s=r; if (s!==i) { [h[s],h[i]]=[h[i],h[s]]; i=s; } else break; } return top; }
function maxPush(h, v) { h.push(v); let i = h.length - 1; while (i > 0) { const p = (i-1)>>1; if (h[p] < h[i]) { [h[p],h[i]] = [h[i],h[p]]; i = p; } else break; } }
function maxPop(h) { if (!h.length) return undefined; const top = h[0]; h[0] = h[h.length-1]; h.pop(); let i = 0; while (true) { let s=i; const l=2*i+1,r=2*i+2; if (l<h.length&&h[l]>h[s]) s=l; if (r<h.length&&h[r]>h[s]) s=r; if (s!==i) { [h[s],h[i]]=[h[i],h[s]]; i=s; } else break; } return top; }

/* Tuple heaps — compare by [0] */
function tMinPush(h, v) { h.push(v); let i=h.length-1; while(i>0){const p=(i-1)>>1;if(h[p][0]>h[i][0]){[h[p],h[i]]=[h[i],h[p]];i=p;}else break;} }
function tMinPop(h) { if(!h.length)return; const t=h[0];h[0]=h[h.length-1];h.pop();let i=0;while(true){let s=i;const l=2*i+1,r=2*i+2;if(l<h.length&&h[l][0]<h[s][0])s=l;if(r<h.length&&h[r][0]<h[s][0])s=r;if(s!==i){[h[s],h[i]]=[h[i],h[s]];i=s;}else break;}return t; }
function tMaxPush(h, v) { h.push(v); let i=h.length-1; while(i>0){const p=(i-1)>>1;if(h[p][0]<h[i][0]){[h[p],h[i]]=[h[i],h[p]];i=p;}else break;} }
function tMaxPop(h) { if(!h.length)return; const t=h[0];h[0]=h[h.length-1];h.pop();let i=0;while(true){let s=i;const l=2*i+1,r=2*i+2;if(l<h.length&&h[l][0]>h[s][0])s=l;if(r<h.length&&h[r][0]>h[s][0])s=r;if(s!==i){[h[s],h[i]]=[h[i],h[s]];i=s;}else break;}return t; }

/* â•â•â• Problem Definitions â•â•â• */
const PROBLEMS = {
  kthLargest: {
    title: "Kth Largest",
    subtitle: "LC 215 · Min-Heap of Size K",
    coreIdea: "Maintain a min-heap of size k. For each element: if heap has room, push. If the element beats the current min (heap[0]), replace it. After processing all elements, heap[0] is the kth largest — everything else in the heap is larger. O(n log k) beats O(n log n) sorting when k ≪ n.",
    heapType: "min",
  },
  mergeKLists: {
    title: "Merge K Lists",
    subtitle: "LC 23 · Min-Heap of K Pointers",
    coreIdea: "Seed a min-heap with the head of each sorted list — the heap always holds exactly one element per active list. Pop the global minimum, append to result, advance that list's pointer and push its next element. The heap keeps extraction O(log k), giving O(N log k) total where N is the count across all lists.",
    heapType: "min",
  },
  kClosest: {
    title: "K Closest Pts",
    subtitle: "LC 973 · Max-Heap of Size K",
    coreIdea: "Keep a max-heap of size k by distance. For each point: if heap has room, push. If the point is closer than the farthest in the heap (heap[0]), replace it. Max-heap lets us efficiently evict the farthest of our k candidates. O(n log k).",
    heapType: "max",
  },
  median: {
    title: "Stream Median",
    subtitle: "LC 295 · Two Heaps",
    coreIdea: "Split the stream into two halves: a max-heap for the lower half and a min-heap for the upper half. Keep them balanced (sizes differ by at most 1). The median is either the max-heap top (odd count) or the average of both tops (even count). Each insertion is O(log n). This two-heap trick appears whenever you need a running order statistic.",
    heapType: "dual",
  },
  taskScheduler: {
    title: "Task Scheduler",
    subtitle: "LC 621 · Max-Heap + Cooldown",
    coreIdea: "Count task frequencies and push into a max-heap. Each tick: pop the most frequent task, decrement its count, and place it in a cooldown queue with its ready time. When a task's cooldown expires, push it back. If the heap is empty but cooldown has pending tasks, the CPU idles. Greedy: always pick the most frequent available task to minimize total time.",
    heapType: "max",
  },
};

/* â•â•â• Problem Data â•â•â• */
const DATA_KTH = { arr: [3, 2, 1, 5, 6, 4], k: 2, expected: 5 };
const DATA_MERGE = { lists: [[1, 4, 7], [2, 5, 8], [3, 6, 9]], expected: [1,2,3,4,5,6,7,8,9] };
const DATA_CLOSEST = { points: [[3,3],[5,-1],[-2,4],[1,1],[0,2],[-1,-1],[4,0]], k: 3 };
const DATA_MEDIAN = { stream: [5, 2, 8, 1, 9, 3, 7], expected: [5, 3.5, 5, 3.5, 5, 4, 5] };
const DATA_SCHED = { tasks: ["A","A","A","B","B","B"], n: 2, expected: 8 };

const DISTS = DATA_CLOSEST.points.map(([x,y])=>x*x+y*y);
const EXPECTED_CLOSEST = DATA_CLOSEST.points.map((p,i)=>({p,d:DISTS[i]})).sort((a,b)=>a.d-b.d).slice(0,DATA_CLOSEST.k).map(e=>e.p);

/* â•â•â• Step Builders â•â•â• */
function buildKthSteps() {
  const { arr, k, expected } = DATA_KTH;
  const n = arr.length, steps = [], heap = [], log = [];
  const snap = () => [...heap];
  steps.push({ title: "Initialize — Empty Min-Heap", detail: `nums = [${arr.join(", ")}], k = ${k}. Maintain min-heap of size ≤ ${k}. After all elements, heap[0] = kth largest.`, heap: snap(), phase: "init", codeHL: [2,3], highlighted: [], extra: { inputIdx: -1, log: [], expected } });
  for (let i = 0; i < n; i++) {
    const num = arr[i];
    if (heap.length < k) {
      minPush(heap, num); log.push(`push ${num}`);
      steps.push({ title: `Push ${num} — Size ${heap.length} ≤ k=${k}`, detail: `Heap has room. Push ${num}, sift up. heap = [${heap.join(", ")}].`, heap: snap(), phase: "push", codeHL: [4,5,6], highlighted: [heap.indexOf(num)], extra: { inputIdx: i, log: [...log], expected } });
    } else if (num > heap[0]) {
      const old = heap[0]; heap[0] = num; let ci=0; while(true){let s=ci;const l=2*ci+1,r=2*ci+2;if(l<heap.length&&heap[l]<heap[s])s=l;if(r<heap.length&&heap[r]<heap[s])s=r;if(s!==ci){[heap[s],heap[ci]]=[heap[ci],heap[s]];ci=s;}else break;}
      log.push(`${old}→${num}`);
      steps.push({ title: `Replace ${old} → ${num} — ${num} > heap[0]=${old}`, detail: `${num} belongs in top-${k}. Evict ${old}, sift down. heap = [${heap.join(", ")}].`, heap: snap(), phase: "replace", codeHL: [7,8], highlighted: [0], extra: { inputIdx: i, log: [...log], expected } });
    } else {
      log.push(`skip ${num}`);
      steps.push({ title: `Skip ${num} — ${num} ≤ heap[0]=${heap[0]}`, detail: `Can't be in top ${k}. heap = [${heap.join(", ")}].`, heap: snap(), phase: "skip", codeHL: [7], highlighted: [], extra: { inputIdx: i, log: [...log], expected } });
    }
  }
  steps.push({ title: `✓ Answer: heap[0] = ${heap[0]}`, detail: `Min-heap of size ${k}: [${heap.join(", ")}]. kth largest = ${heap[0]}.`, heap: snap(), phase: "done", codeHL: [9], highlighted: [0], extra: { inputIdx: n, log: [...log], expected, result: heap[0] } });
  return steps;
}

function buildMergeSteps() {
  const { lists, expected } = DATA_MERGE;
  const k = lists.length, steps = [], heap = [], merged = [], ptrs = lists.map(()=>0);
  const snapH = () => heap.map(h=>[...h]), snapM = () => [...merged];
  steps.push({ title: `Initialize — Seed Heap with ${k} List Heads`, detail: `${k} sorted lists. Push head of each into min-heap. Heap always holds one element per active list.`, heap: snapH(), phase: "init", codeHL: [2,3,4,5], highlighted: [], extra: { merged: snapM(), ptrs: [...ptrs], expected } });
  for (let li = 0; li < k; li++) tMinPush(heap, [lists[li][0], li, 0]);
  steps.push({ title: `Heap Seeded — [${heap.map(h=>h[0]).join(", ")}]`, detail: `Heads: ${lists.map((l,i)=>`L${i}[0]=${l[0]}`).join(", ")}. Min = ${heap[0][0]}.`, heap: snapH(), phase: "push", codeHL: [4,5], highlighted: Array.from({length:k},(_,i)=>i), extra: { merged: snapM(), ptrs: [...ptrs], expected } });
  while (heap.length > 0) {
    const [val, li, ei] = tMinPop(heap); merged.push(val); ptrs[li] = ei + 1;
    const nxt = ei + 1, hasN = nxt < lists[li].length;
    if (hasN) tMinPush(heap, [lists[li][nxt], li, nxt]);
    steps.push({ title: hasN ? `Pop ${val} (L${li}) → Push ${lists[li][nxt]}` : `Pop ${val} (L${li}) — List Exhausted`, detail: `Pop min=${val} from L${li}[${ei}], append to result.${hasN ? ` Push L${li}[${nxt}]=${lists[li][nxt]}.`:` L${li} done.`} merged=[${merged.join(",")}].`, heap: snapH(), phase: hasN ? "pop-push" : "pop-done", codeHL: hasN ? [8,9,10,11,12] : [8,9,10], highlighted: hasN ? [heap.findIndex(h=>h[1]===li)] : [], extra: { merged: snapM(), ptrs: [...ptrs], expected } });
  }
  steps.push({ title: `✓ All ${merged.length} Elements Merged`, detail: `Result: [${merged.join(", ")}]. O(N log k), N=${merged.length}, k=${k}.`, heap: snapH(), phase: "done", codeHL: [13], highlighted: [], extra: { merged: snapM(), ptrs: [...ptrs], expected, result: merged } });
  return steps;
}

function buildClosestSteps() {
  const { points, k } = DATA_CLOSEST;
  const n = points.length, steps = [], heap = [], log = [];
  const snapH = () => heap.map(h=>[...h]), fmtPt = (i)=>`(${points[i][0]},${points[i][1]})`;
  steps.push({ title: "Initialize — Empty Max-Heap by Distance", detail: `${n} points, k=${k}. Max-heap of size ≤ ${k} by d². Farthest at top — easy to evict.`, heap: snapH(), phase: "init", codeHL: [2,3], highlighted: [], extra: { inputIdx: -1, log: [] } });
  for (let i = 0; i < n; i++) {
    const d = points[i][0]**2 + points[i][1]**2;
    if (heap.length < k) {
      tMaxPush(heap, [d, i]); log.push(`push ${fmtPt(i)}`);
      steps.push({ title: `Push ${fmtPt(i)} d²=${d} — Size ${heap.length}≤k`, detail: `Room in heap. Push. Top d²=${heap[0][0]}, size=${heap.length}.`, heap: snapH(), phase: "push", codeHL: [5,6,7], highlighted: [heap.findIndex(h=>h[1]===i)], extra: { inputIdx: i, log: [...log] } });
    } else if (d < heap[0][0]) {
      const evi = heap[0][1]; tMaxPop(heap); tMaxPush(heap, [d, i]); log.push(`${fmtPt(evi)}→${fmtPt(i)}`);
      steps.push({ title: `Replace ${fmtPt(evi)} → ${fmtPt(i)}  d²=${d}<${DISTS[evi]}`, detail: `${fmtPt(i)} closer. Evict ${fmtPt(evi)}. Top d²=${heap[0][0]}.`, heap: snapH(), phase: "replace", codeHL: [8,9], highlighted: [0], extra: { inputIdx: i, log: [...log] } });
    } else {
      log.push(`skip ${fmtPt(i)}`);
      steps.push({ title: `Skip ${fmtPt(i)} d²=${d} ≥ ${heap[0][0]}`, detail: `Not closer than farthest candidate. Skip.`, heap: snapH(), phase: "skip", codeHL: [8], highlighted: [], extra: { inputIdx: i, log: [...log] } });
    }
  }
  steps.push({ title: `✓ ${k} Closest Points Found`, detail: `Heap: ${heap.map(h=>`${fmtPt(h[1])}(d²=${h[0]})`).join(", ")}. O(n log k).`, heap: snapH(), phase: "done", codeHL: [10], highlighted: Array.from({length:heap.length},(_,i)=>i), extra: { inputIdx: n, log: [...log], result: heap.map(h=>points[h[1]]) } });
  return steps;
}

function buildMedianSteps() {
  const { stream, expected } = DATA_MEDIAN;
  const steps = [], lo = [], hi = [], medians = [];
  const snapLo = ()=>[...lo], snapHi = ()=>[...hi];
  const getMed = ()=> lo.length > hi.length ? lo[0] : (lo[0]+hi[0])/2;
  steps.push({ title: "Initialize — Two Empty Heaps", detail: `Stream: [${stream.join(", ")}]. maxHeap (lower half), minHeap (upper half). Keep |maxHeap| ≥ |minHeap|, differ by ≤ 1.`, heap: [], phase: "init", codeHL: [2,3,4,5], highlighted: [], extra: { lo: snapLo(), hi: snapHi(), medians: [], stream, expected } });
  for (let i = 0; i < stream.length; i++) {
    const num = stream[i];
    maxPush(lo, num); const moved1 = maxPop(lo); minPush(hi, moved1);
    let rebal = false;
    if (hi.length > lo.length) { const moved2 = minPop(hi); maxPush(lo, moved2); rebal = true; }
    const med = getMed(); medians.push(med);
    const total = lo.length + hi.length;
    const fmt = (v) => v % 1 === 0 ? v : v.toFixed(1);
    steps.push({ title: `Add ${num} → Median = ${fmt(med)}`, detail: `Insert ${num}.${rebal ? " Rebalanced." : ""} maxHeap=[${lo.join(",")}] top=${lo[0]}, minHeap=[${hi.length?hi.join(","):"∅"}]${hi.length?" top="+hi[0]:""}. ${total%2===1?`Odd → median = ${med}`:`Even → (${lo[0]}+${hi[0]})/2 = ${fmt(med)}`}.`, heap: [], phase: "insert", codeHL: [7,8,9,10,11], highlighted: [], extra: { lo: snapLo(), hi: snapHi(), medians: [...medians], stream, expected, currentIdx: i } });
  }
  steps.push({ title: `✓ All ${stream.length} Medians Computed`, detail: `Medians: [${medians.map(m=>m%1===0?m:m.toFixed(1)).join(", ")}]. Two-heap O(log n) per insert.`, heap: [], phase: "done", codeHL: [13,14,15,16], highlighted: [], extra: { lo: snapLo(), hi: snapHi(), medians: [...medians], stream, expected, result: medians } });
  return steps;
}

function buildSchedulerSteps() {
  const { tasks, n: cd, expected } = DATA_SCHED;
  const steps = [], freq = {};
  for (const t of tasks) freq[t] = (freq[t]||0)+1;
  const heap = []; for (const [task, count] of Object.entries(freq)) tMaxPush(heap, [count, task]);
  const coolQ = [], timeline = [];
  const snapH = ()=>heap.map(h=>[...h]), snapQ = ()=>coolQ.map(q=>[...q]);
  steps.push({ title: "Initialize — Frequencies into Max-Heap", detail: `Tasks: [${tasks.join(",")}], cooldown n=${cd}. Freq: ${Object.entries(freq).map(([t,c])=>`${t}:${c}`).join(", ")}. Heap: [${heap.map(h=>`${h[1]}:${h[0]}`).join(", ")}].`, heap: snapH(), phase: "init", codeHL: [3,4,5,6,7,8], highlighted: [], extra: { timeline: [], cooldownQ: snapQ(), expected } });
  let time = 0;
  while (heap.length > 0 || coolQ.length > 0) {
    time++;
    const returned = [];
    while (coolQ.length > 0 && coolQ[0][2] <= time) { const [cnt, task] = coolQ.shift(); tMaxPush(heap, [cnt, task]); returned.push(task); }
    if (heap.length > 0) {
      const [cnt, task] = tMaxPop(heap); timeline.push(task);
      if (cnt-1 > 0) { coolQ.push([cnt-1, task, time+cd+1]); coolQ.sort((a,b)=>a[2]-b[2]); }
      steps.push({ title: `t=${time}: Execute ${task} (${cnt}→${cnt-1})`, detail: `${returned.length?`Returned: [${returned.join(",")}]. `:""}Pop ${task} (freq=${cnt}). ${cnt-1>0?`Cooldown until t=${time+cd+1}.`:`${task} done.`} Timeline: [${timeline.join(",")}].`, heap: snapH(), phase: "execute", codeHL: [9,10,13,14,15], highlighted: [], extra: { timeline: [...timeline], cooldownQ: snapQ(), expected, returned: [...returned] } });
    } else {
      timeline.push("_");
      steps.push({ title: `t=${time}: IDLE`, detail: `Heap empty. ${coolQ.length} task(s) cooling: ${coolQ.map(q=>`${q[1]}@t=${q[2]}`).join(", ")}. Timeline: [${timeline.join(",")}].`, heap: snapH(), phase: "idle", codeHL: [9,10], highlighted: [], extra: { timeline: [...timeline], cooldownQ: snapQ(), expected } });
    }
  }
  steps.push({ title: `✓ All Tasks Done in ${time} Units`, detail: `Timeline: [${timeline.join(", ")}]. Idle: ${timeline.filter(t=>t==="_").length}. Greedy max-freq minimized total.`, heap: snapH(), phase: "done", codeHL: [16], highlighted: [], extra: { timeline: [...timeline], cooldownQ: snapQ(), expected, result: time } });
  return steps;
}

function buildSteps(pKey) {
  if (pKey === "kthLargest") return buildKthSteps();
  if (pKey === "mergeKLists") return buildMergeSteps();
  if (pKey === "kClosest") return buildClosestSteps();
  if (pKey === "median") return buildMedianSteps();
  return buildSchedulerSteps();
}

/* â•â•â• Python Codes â•â•â• */
const CODES = {
  kthLargest: [
    {id:0,text:`import heapq`},{id:1,text:``},{id:2,text:`def kth_largest(nums, k):`},{id:3,text:`    heap = []`},{id:4,text:`    for num in nums:`},{id:5,text:`        if len(heap) < k:`},{id:6,text:`            heapq.heappush(heap, num)`},{id:7,text:`        elif num > heap[0]:`},{id:8,text:`            heapq.heapreplace(heap, num)`},{id:9,text:`    return heap[0]`},
  ],
  mergeKLists: [
    {id:0,text:`import heapq`},{id:1,text:``},{id:2,text:`def merge_k_lists(lists):`},{id:3,text:`    heap = []`},{id:4,text:`    for i, lst in enumerate(lists):`},{id:5,text:`        if lst: heapq.heappush(heap, (lst[0],i,0))`},{id:6,text:``},{id:7,text:`    result = []`},{id:8,text:`    while heap:`},{id:9,text:`        val, li, ei = heapq.heappop(heap)`},{id:10,text:`        result.append(val)`},{id:11,text:`        if ei+1 < len(lists[li]):`},{id:12,text:`            heapq.heappush(heap, (lists[li][ei+1],li,ei+1))`},{id:13,text:`    return result`},
  ],
  kClosest: [
    {id:0,text:`import heapq`},{id:1,text:``},{id:2,text:`def k_closest(points, k):`},{id:3,text:`    heap = []  # max-heap by -dist`},{id:4,text:`    for x, y in points:`},{id:5,text:`        d = x*x + y*y`},{id:6,text:`        if len(heap) < k:`},{id:7,text:`            heapq.heappush(heap, (-d, x, y))`},{id:8,text:`        elif d < -heap[0][0]:`},{id:9,text:`            heapq.heapreplace(heap, (-d, x, y))`},{id:10,text:`    return [[x,y] for _,x,y in heap]`},
  ],
  median: [
    {id:0,text:`import heapq`},{id:1,text:``},{id:2,text:`class MedianFinder:`},{id:3,text:`    def __init__(self):`},{id:4,text:`        self.lo = []  # max-heap (neg)`},{id:5,text:`        self.hi = []  # min-heap`},{id:6,text:``},{id:7,text:`    def addNum(self, num):`},{id:8,text:`        heapq.heappush(self.lo, -num)`},{id:9,text:`        heapq.heappush(self.hi, -heapq.heappop(self.lo))`},{id:10,text:`        if len(self.hi) > len(self.lo):`},{id:11,text:`            heapq.heappush(self.lo, -heapq.heappop(self.hi))`},{id:12,text:``},{id:13,text:`    def findMedian(self):`},{id:14,text:`        if len(self.lo) > len(self.hi):`},{id:15,text:`            return -self.lo[0]`},{id:16,text:`        return (-self.lo[0] + self.hi[0]) / 2`},
  ],
  taskScheduler: [
    {id:0,text:`import heapq`},{id:1,text:`from collections import Counter, deque`},{id:2,text:``},{id:3,text:`def least_interval(tasks, n):`},{id:4,text:`    freq = Counter(tasks)`},{id:5,text:`    heap = [-c for c in freq.values()]`},{id:6,text:`    heapq.heapify(heap)`},{id:7,text:`    cooldown = deque()`},{id:8,text:`    time = 0`},{id:9,text:`    while heap or cooldown:`},{id:10,text:`        time += 1`},{id:11,text:`        if cooldown and cooldown[0][1] <= time:`},{id:12,text:`            heapq.heappush(heap, cooldown.popleft()[0])`},{id:13,text:`        if heap:`},{id:14,text:`            cnt = heapq.heappop(heap) + 1`},{id:15,text:`            if cnt: cooldown.append((cnt, time+n+1))`},{id:16,text:`    return time`},
  ],
};

/* â•â•â• Heap Tree SVG â•â•â• */
function HeapTreeView({ values, highlighted, phase, labels }) {
  const hlSet = new Set(highlighted || []);
  const n = values.length;
  if (n === 0) return <svg viewBox="0 0 440 50" className="w-full" style={{maxHeight:50}}><text x="220" y="25" textAnchor="middle" fill="#52525b" fontSize="11" fontFamily="monospace">empty</text></svg>;
  const maxD = Math.floor(Math.log2(n));
  const nodeR = 16, rowH = 48, totalW = 440, totalH = (maxD+1)*rowH+24;
  const pos = [];
  for (let i = 0; i < n; i++) { const d = Math.floor(Math.log2(i+1)); const p = i-((1<<d)-1); const sp = totalW/((1<<d)+1); pos.push({x:sp*(p+1), y:d*rowH+20}); }
  const colorOf = (idx) => {
    if (!hlSet.has(idx)) return {fill:"#27272a",stroke:"#3f3f46"};
    if (phase==="replace") return {fill:"#b45309",stroke:"#f59e0b"};
    if (phase==="push"||phase==="insert") return {fill:"#1e3a5f",stroke:"#3b82f6"};
    if (phase==="execute"||phase==="pop-push"||phase==="pop-done") return {fill:"#7c3aed",stroke:"#8b5cf6"};
    if (phase==="done") return {fill:"#065f46",stroke:"#10b981"};
    return {fill:"#1e3a5f",stroke:"#3b82f6"};
  };
  return (
    <svg viewBox={`0 0 ${totalW} ${Math.min(totalH,230)}`} className="w-full" style={{maxHeight:200}}>
      {Array.from({length:n},(_,i)=>{if(i===0)return null;const p=(i-1)>>1;const isHL=hlSet.has(i)&&hlSet.has(p);return <line key={`e-${i}`} x1={pos[p].x} y1={pos[p].y+nodeR} x2={pos[i].x} y2={pos[i].y-nodeR} stroke={isHL?"#3b82f6":"#3f3f46"} strokeWidth={isHL?2.5:1.2}/>;})}
      {values.map((val,i)=>{const p=pos[i];const{fill,stroke}=colorOf(i);const isHL=hlSet.has(i);return(
        <g key={`n-${i}`}><circle cx={p.x} cy={p.y} r={nodeR} fill={fill} stroke={stroke} strokeWidth={isHL?2.5:1.5}/><text x={p.x} y={p.y+1} textAnchor="middle" dominantBaseline="central" fill={isHL?"#fff":"#a1a1aa"} fontSize="10" fontWeight="700" fontFamily="monospace">{val}</text>{labels&&labels[i]&&<text x={p.x} y={p.y+nodeR+9} textAnchor="middle" fill="#52525b" fontSize="7" fontFamily="monospace">{labels[i]}</text>}</g>
      );})}
    </svg>
  );
}

/* â•â•â• IO Panel â•â•â• */
function IOPanel({ step, pKey }) {
  const { phase, extra } = step;
  const done = phase === "done";
  const fmt = (v) => v % 1 === 0 ? v : v.toFixed(1);

  
  

  if (pKey === "kthLargest") return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"><div><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-teal-400">Input</div><div className="font-mono text-xs text-zinc-400" style={{whiteSpace:"pre"}}><div><span className="text-zinc-500">nums</span> = <span className="text-zinc-300">[{DATA_KTH.arr.join(", ")}]</span></div><div><span className="text-zinc-500">k</span>    = <span className="text-blue-400">{DATA_KTH.k}</span></div></div></div>
    <div className="border-t border-zinc-800 pt-3"><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-amber-400">Expected Output</div><div className="font-mono text-xs"><span className="text-zinc-500">answer = </span><span className="text-zinc-300">{DATA_KTH.expected}</span></div></div>
    <div className="border-t border-zinc-800 pt-3"><div className="flex items-center gap-2 mb-1.5"><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-emerald-400">Output (building)</div>{done && extra.result===extra.expected && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}</div><div className="font-mono text-xs"><span className="text-zinc-500">heap = </span><span className="text-zinc-300">[{step.heap.join(", ")}]</span></div>{done && <div className="font-mono text-xs mt-1"><span className="text-zinc-500">answer = </span><span className="text-emerald-300 font-bold">{extra.result}</span></div>}</div></div>
  );

  if (pKey === "mergeKLists") return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"><div><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-teal-400">Input</div><div className="font-mono text-xs text-zinc-400" style={{whiteSpace:"pre"}}>{DATA_MERGE.lists.map((l,i)=><div key={i}><span className="text-zinc-500">L{i}</span> = <span className="text-zinc-300">[{l.join(", ")}]</span></div>)}</div></div>
    <div className="border-t border-zinc-800 pt-3"><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-amber-400">Expected Output</div><div className="font-mono text-xs"><span className="text-zinc-500">merged = </span><span className="text-zinc-300">[{DATA_MERGE.expected.join(",")}]</span></div></div>
    <div className="border-t border-zinc-800 pt-3"><div className="flex items-center gap-2 mb-1.5"><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-emerald-400">Output (building)</div>{done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}</div><div className="font-mono text-[10px] flex flex-wrap gap-0.5"><span className="text-zinc-500">[</span>{DATA_MERGE.expected.map((v,i)=>{const built=(i < extra.merged.length);return <span key={i}><span className={built?"text-emerald-300 font-bold":"text-zinc-700"}>{built?extra.merged[i]:"?"}</span>{(i < DATA_MERGE.expected.length-1)&&<span className="text-zinc-700">,</span>}</span>;})}<span className="text-zinc-500">]</span></div></div></div>
  );

  if (pKey === "kClosest") return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"><div><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-teal-400">Input</div><div className="font-mono text-[10px] text-zinc-400" style={{whiteSpace:"pre"}}>{DATA_CLOSEST.points.map((p,i)=><div key={i}><span className="text-zinc-300">[{p[0]},{p[1]}]</span><span className="text-zinc-600"> d²={DISTS[i]}</span></div>)}<div><span className="text-zinc-500">k</span> = <span className="text-blue-400">{DATA_CLOSEST.k}</span></div></div></div>
    <div className="border-t border-zinc-800 pt-3"><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-amber-400">Expected Output</div><div className="font-mono text-xs"><span className="text-zinc-500">closest = </span><span className="text-zinc-300">[{EXPECTED_CLOSEST.map(p=>`[${p}]`).join(", ")}]</span></div></div>
    <div className="border-t border-zinc-800 pt-3"><div className="flex items-center gap-2 mb-1.5"><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-emerald-400">Output (building)</div>{done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}</div><div className="font-mono text-xs">{done?<span className="text-emerald-300 font-bold">[{extra.result.map(p=>`[${p}]`).join(", ")}]</span>:<span className="text-zinc-500">heap: {step.heap.length}/{DATA_CLOSEST.k}</span>}</div></div></div>
  );

  if (pKey === "median") return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"><div><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-teal-400">Input</div><div className="font-mono text-xs"><span className="text-zinc-500">stream = </span><span className="text-zinc-300">[{DATA_MEDIAN.stream.join(", ")}]</span></div></div>
    <div className="border-t border-zinc-800 pt-3"><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-amber-400">Expected Output</div><div className="font-mono text-xs"><span className="text-zinc-500">medians = </span><span className="text-zinc-300">[{DATA_MEDIAN.expected.map(fmt).join(", ")}]</span></div></div>
    <div className="border-t border-zinc-800 pt-3"><div className="flex items-center gap-2 mb-1.5"><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-emerald-400">Output (building)</div>{done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}</div><div className="font-mono text-[10px] flex flex-wrap gap-0.5"><span className="text-zinc-500">[</span>{DATA_MEDIAN.expected.map((v,i)=>{const built=(i < extra.medians.length);const match=built&&extra.medians[i]===v;return <span key={i}><span className={match?"text-emerald-300 font-bold":built?"text-zinc-300":"text-zinc-700"}>{built?fmt(extra.medians[i]):"?"}</span>{(i < DATA_MEDIAN.expected.length-1)&&<span className="text-zinc-700">,</span>}</span>;})}<span className="text-zinc-500">]</span></div></div></div>
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"><div><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-teal-400">Input</div><div className="font-mono text-xs text-zinc-400" style={{whiteSpace:"pre"}}><div><span className="text-zinc-500">tasks</span> = <span className="text-zinc-300">[{DATA_SCHED.tasks.map(t=>`"${t}"`).join(",")}]</span></div><div><span className="text-zinc-500">n</span>     = <span className="text-blue-400">{DATA_SCHED.n}</span></div></div></div>
    <div className="border-t border-zinc-800 pt-3"><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-amber-400">Expected Output</div><div className="font-mono text-xs"><span className="text-zinc-500">intervals = </span><span className="text-zinc-300">{DATA_SCHED.expected}</span></div></div>
    <div className="border-t border-zinc-800 pt-3"><div className="flex items-center gap-2 mb-1.5"><div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-emerald-400">Output (building)</div>{done&&extra.result===DATA_SCHED.expected&&<span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}</div><div className="font-mono text-xs"><span className="text-zinc-500">time = </span><span className={done?"text-emerald-300 font-bold":"text-zinc-300"}>{extra.timeline.length||"?"}</span></div>{extra.timeline.length>0&&<div className="flex gap-1 flex-wrap mt-1">{extra.timeline.map((t,i)=><span key={i} className={`px-1 py-0.5 rounded text-[9px] font-mono font-bold ${t==="_"?"bg-zinc-800 text-zinc-600":"bg-purple-950 border border-purple-800 text-purple-300"}`}>{t}</span>)}</div>}</div></div>
  );
}

/* â•â•â• Heap Viz Panel (COL1 bottom) â•â•â• */
function HeapVizPanel({ step, pKey }) {
  const { phase } = step;
  if (pKey === "median") {
    const { lo, hi } = step.extra;
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2">
        <div className="text-[10px] text-zinc-500 mb-0.5">dual-heap • |lo|={lo.length}, |hi|={hi.length}</div>
        <div><div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-0.5 text-center">maxHeap (lower) {lo.length?`· top=${lo[0]}`:""}</div><HeapTreeView values={lo} highlighted={phase==="done"?[0]:[]} phase={phase}/></div>
        <div className="border-t border-zinc-800 pt-1"><div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-0.5 text-center">minHeap (upper) {hi.length?`· top=${hi[0]}`:""}</div><HeapTreeView values={hi} highlighted={phase==="done"?[0]:[]} phase={phase}/></div>
      </div>
    );
  }
  const isTuple = pKey==="mergeKLists"||pKey==="kClosest"||pKey==="taskScheduler";
  const values = isTuple ? step.heap.map(h=>h[0]) : (step.heap||[]);
  const labels = pKey==="mergeKLists" ? step.heap.map(h=>`L${h[1]}`) : pKey==="kClosest" ? step.heap.map(h=>{const[x,y]=DATA_CLOSEST.points[h[1]];return`(${x},${y})`;}) : pKey==="taskScheduler" ? step.heap.map(h=>h[1]) : null;
  const type = PROBLEMS[pKey].heapType;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] text-zinc-500 mb-1">{type}-heap • {values.length} node(s)</div>
      <HeapTreeView values={values} highlighted={step.highlighted} phase={phase} labels={labels}/>
      <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/>Push</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600 inline-block"/>Replace</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block"/>Pop</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Done</span>
      </div>
    </div>
  );
}

/* â•â•â• Code Panel â•â•â• */
function CodePanel({ highlightLines, pKey }) {
  const CODE = CODES[pKey];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {CODE.map((line, idx) => {
          const hl = highlightLines.includes(line.id);
          return (<div key={idx} className={`px-2 rounded-sm ${hl?"bg-blue-500/15 text-blue-300":line.text===""?"":"text-zinc-500"}`}><span className="inline-block w-5 text-right mr-3 text-zinc-700 select-none" style={{userSelect:"none"}}>{line.text!==""?line.id+1:""}</span>{line.text}</div>);
        })}
      </div>
    </div>
  );
}

/* â•â•â• NavBar â•â•â• */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button onClick={()=>setSi(Math.max(0,si-1))} disabled={si===0} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">â† Prev</button>
      <div className="flex gap-1.5">{Array.from({length:total}).map((_,i)=><button key={i} onClick={()=>setSi(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i===si?"bg-blue-500 scale-125":"bg-zinc-700 hover:bg-zinc-500"}`}/>)}</div>
      <button onClick={()=>setSi(Math.min(total-1,si+1))} disabled={si>=total-1} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">Next →</button>
    </div>
  );
}

/* â•â•â• COL 2: Middle Panel â•â•â• */
function MiddlePanel({ step, pKey, si, totalSteps }) {
  const { phase, extra } = step;
  const sidx = Math.min(si, totalSteps-1);
  const badge = phase==="push"||phase==="insert"?"bg-blue-900 text-blue-300":phase==="replace"?"bg-amber-900 text-amber-300":phase==="skip"?"bg-zinc-700 text-zinc-400":phase==="execute"?"bg-purple-900 text-purple-300":phase==="pop-push"?"bg-purple-900 text-purple-300":phase==="pop-done"?"bg-red-900 text-red-300":phase==="idle"?"bg-zinc-700 text-zinc-400":phase==="done"?"bg-emerald-900 text-emerald-300":"bg-zinc-800 text-zinc-400";
  const narBg = phase==="done"?"bg-emerald-950/30 border-emerald-900":phase==="replace"?"bg-amber-950/20 border-amber-900/50":phase==="execute"||phase==="pop-push"?"bg-purple-950/20 border-purple-900/50":phase==="idle"?"bg-zinc-900/50 border-zinc-700":"bg-zinc-900 border-zinc-800";

  return (
    <div className="col-span-5 space-y-3">
      <div className={`rounded-2xl border p-4 ${narBg}`}>
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-xs text-zinc-600 font-mono">Step {sidx+1}/{totalSteps}</span>
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${badge}`}>{phase}</span>
        </div>
        <h2 className="text-base font-semibold mb-1">{step.title}</h2>
        <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
      </div>

      {/* kthLargest: input array */}
      {pKey==="kthLargest" && <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Input Array</div><div className="flex gap-1.5 justify-center">{DATA_KTH.arr.map((v,i)=>{const cur=extra.inputIdx===i;const dn=extra.inputIdx>i;return <div key={i} className="flex flex-col items-center gap-1"><span className="text-[9px] text-zinc-600 font-mono">{i}</span><div className={`w-10 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${cur?"bg-blue-950 border-blue-600 text-blue-200 scale-110":dn?"bg-zinc-800 border-zinc-700 text-zinc-500":"bg-zinc-900 border-zinc-700 text-zinc-300"}`}>{v}</div>{cur&&<span className="text-[8px] text-blue-500">▲</span>}{dn&&<span className="text-[8px] text-zinc-700">✓</span>}</div>;})}</div></div>}

      {/* mergeKLists: list pointers + merged */}
      {pKey==="mergeKLists" && <>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">List Pointers</div><div className="space-y-1.5">{DATA_MERGE.lists.map((list,li)=><div key={li} className="flex items-center gap-1"><span className="text-[10px] text-zinc-600 font-mono w-6">L{li}:</span><div className="flex gap-1">{list.map((v,ei)=>{const consumed=extra.ptrs[li]>ei;const isN=extra.ptrs[li]===ei;return <span key={ei} className={`inline-flex items-center justify-center w-7 h-6 rounded text-[10px] font-mono font-bold border ${consumed?"bg-zinc-800 border-zinc-700 text-zinc-600 line-through":isN?"bg-blue-950 border-blue-700 text-blue-300":"bg-zinc-900 border-zinc-700 text-zinc-400"}`}>{v}</span>;})}</div></div>)}</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Merged — {extra.merged.length}/{DATA_MERGE.expected.length}</div><div className="flex gap-1 flex-wrap">{extra.merged.map((v,i)=><span key={i} className="inline-flex items-center justify-center w-7 h-6 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold">{v}</span>)}{extra.merged.length===0&&<span className="text-[10px] text-zinc-600 italic">empty</span>}</div></div>
      </>}

      {/* kClosest: points tracker */}
      {pKey==="kClosest" && <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Points</div><div className="flex gap-1.5 flex-wrap justify-center">{DATA_CLOSEST.points.map((p,i)=>{const cur=extra.inputIdx===i;const dn=extra.inputIdx>i;return <div key={i} className="flex flex-col items-center gap-1"><span className="text-[9px] text-zinc-600 font-mono">{i}</span><div className={`px-1.5 text-center py-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${cur?"bg-blue-950 border-blue-600 text-blue-200 scale-110":dn?"bg-zinc-800 border-zinc-700 text-zinc-500":"bg-zinc-900 border-zinc-700 text-zinc-300"}`}>({p[0]},{p[1]})</div>{cur&&<span className="text-[8px] text-blue-500">▲</span>}{dn&&<span className="text-[8px] text-zinc-700">✓</span>}</div>;})}</div></div>}

      {/* median: stream + stats */}
      {pKey==="median" && <>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Stream</div><div className="flex gap-1.5 justify-center">{DATA_MEDIAN.stream.map((v,i)=>{const cur=extra.currentIdx===i;const dn=extra.currentIdx!==undefined&&extra.currentIdx>i;const d3=phase==="done";return <div key={i} className="flex flex-col items-center gap-1"><span className="text-[9px] text-zinc-600 font-mono">{i}</span><div className={`w-10 text-center py-1 rounded-lg font-mono text-xs font-bold border transition-all ${cur?"bg-blue-950 border-blue-600 text-blue-200 scale-110":dn||d3?"bg-zinc-800 border-zinc-700 text-zinc-500":"bg-zinc-900 border-zinc-700 text-zinc-300"}`}>{v}</div></div>;})}</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Heap Sizes & Median</div><div className="flex gap-4"><div className="flex-1 text-center"><div className="text-xl font-bold font-mono text-amber-400">{extra.lo.length}</div><div className="text-[9px] text-zinc-600">maxHeap</div></div><div className="flex-1 text-center"><div className="text-xl font-bold font-mono text-blue-400">{extra.hi.length}</div><div className="text-[9px] text-zinc-600">minHeap</div></div><div className="flex-1 text-center"><div className="text-xl font-bold font-mono text-emerald-400">{extra.medians.length>0?(extra.medians[extra.medians.length-1]%1===0?extra.medians[extra.medians.length-1]:extra.medians[extra.medians.length-1].toFixed(1)):"—"}</div><div className="text-[9px] text-zinc-600">median</div></div></div></div>
      </>}

      {/* taskScheduler: timeline + cooldown + stats */}
      {pKey==="taskScheduler" && <>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Timeline — t={extra.timeline.length}</div><div className="flex gap-1 flex-wrap">{extra.timeline.map((t,i)=><div key={i} className="flex flex-col items-center"><span className="text-[8px] text-zinc-700 font-mono">{i+1}</span><span className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-mono font-bold ${t==="_"?"bg-zinc-800 text-zinc-600 border border-zinc-700":"bg-purple-950 border border-purple-700 text-purple-300"}`}>{t}</span></div>)}{extra.timeline.length===0&&<span className="text-[10px] text-zinc-600 italic">empty</span>}</div></div>
        {extra.cooldownQ.length>0 && <div className="bg-amber-950/20 border border-amber-900/50 rounded-2xl p-3"><div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Cooldown Queue</div><div className="flex gap-2 flex-wrap">{extra.cooldownQ.map((q,i)=><span key={i} className="px-2 py-1 bg-amber-950 border border-amber-800 rounded-lg text-amber-300 font-mono text-[10px]">{q[1]}(×{q[0]}) @t={q[2]}</span>)}</div></div>}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div><div className="flex gap-4"><div className="flex-1 text-center"><div className="text-xl font-bold font-mono text-purple-400">{step.heap.length}</div><div className="text-[9px] text-zinc-600">heap</div></div><div className="flex-1 text-center"><div className="text-xl font-bold font-mono text-amber-400">{extra.cooldownQ.length}</div><div className="text-[9px] text-zinc-600">cooling</div></div><div className="flex-1 text-center"><div className="text-xl font-bold font-mono text-zinc-500">{extra.timeline.filter(t=>t==="_").length}</div><div className="text-[9px] text-zinc-600">idle</div></div><div className="flex-1 text-center"><div className="text-xl font-bold font-mono text-emerald-400">{extra.timeline.length}</div><div className="text-[9px] text-zinc-600">total</div></div></div></div>
      </>}

      {phase==="done" && <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3"><div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Result</div><div className="font-mono text-[11px] text-emerald-300">
        {pKey==="kthLargest"&&`Kth largest (k=${DATA_KTH.k}) = ${extra.result}. Min-heap of size k.`}
        {pKey==="mergeKLists"&&`${extra.merged.length} elements merged from ${DATA_MERGE.lists.length} lists. O(N log k).`}
        {pKey==="kClosest"&&`${DATA_CLOSEST.k} closest points found from ${DATA_CLOSEST.points.length} candidates.`}
        {pKey==="median"&&`${extra.medians.length} medians: [${extra.medians.map(m=>m%1===0?m:m.toFixed(1)).join(", ")}]. Two-heap O(log n) per insert.`}
        {pKey==="taskScheduler"&&`All tasks in ${extra.result} units. ${extra.timeline.filter(t=>t==="_").length} idle. Greedy max-freq strategy.`}
      </div></div>}
    </div>
  );
}

/* â•â•â• Main Component â•â•â• */
export default function HeapViz() {
  const [pKey, setPKey] = useState("kthLargest");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];
  const steps = useMemo(() => buildSteps(pKey), [pKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const switchP = (k) => { setPKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div><h1 className="text-2xl font-bold tracking-tight">Heap & Priority Queue</h1><p className="text-zinc-500 text-sm mt-0.5">O(log n) Insert & Extract · The Engine Behind Greedy Selection</p></div>
          <div className="flex gap-1.5 flex-wrap">{Object.entries(PROBLEMS).map(([k,v])=><button key={k} onClick={()=>switchP(k)} className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all ${pKey===k?"bg-purple-600 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{v.title}</button>)}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3"><span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span><p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p></div>
        <div className="mb-3"><NavBar si={Math.min(si,steps.length-1)} setSi={setSi} total={steps.length}/></div>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 space-y-3"><IOPanel step={step} pKey={pKey}/><HeapVizPanel step={step} pKey={pKey}/></div>
          <MiddlePanel step={step} pKey={pKey} si={si} totalSteps={steps.length}/>
          <div className="col-span-4"><CodePanel highlightLines={step.codeHL} pKey={pKey}/></div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div><ul className="space-y-1.5 text-xs text-zinc-400"><li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>"Find kth largest/smallest" or "top-k" — min-heap of size k</li><li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Repeated "get max/min" from a changing collection</li><li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Merge k sorted streams — min-heap of k pointers</li><li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Running median / order statistics — two heaps</li><li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Greedy scheduling with cooldowns — max-heap + queue</li></ul><div className="mt-3 pt-3 border-t border-zinc-800"><div className="text-[10px] text-zinc-600 space-y-1"><div><span className="text-zinc-500 font-semibold">Push:</span> O(log n)</div><div><span className="text-zinc-500 font-semibold">Pop:</span> O(log n)</div><div><span className="text-zinc-500 font-semibold">Peek:</span> O(1)</div><div><span className="text-zinc-500 font-semibold">Heapify:</span> O(n) — not O(n log n)</div><div><span className="text-zinc-500 font-semibold">Python:</span> heapq is min-heap; negate for max</div></div></div></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div><div className="space-y-1.5 text-xs"><div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 215 — Kth Largest Element</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div><div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 23 — Merge K Sorted Lists</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div><div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 973 — K Closest Points to Origin</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div><div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 295 — Find Median from Data Stream</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div><div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 621 — Task Scheduler</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div><div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 347 — Top K Frequent Elements</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div><div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1046 — Last Stone Weight</span><span className="ml-auto text-[10px] text-amber-700">Easy</span></div></div></div>
        </div>
      </div>
    </div>
  );
}
