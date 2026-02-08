import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   A* Search — Algorithm + 2 Problem Showcase
   1. Algorithm            — A* vs Dijkstra on 8×10 grid (toggle)
   2. LC 1091 — Binary Matrix   — 8-directional, Chebyshev heuristic
   3. LC 675  — Cut Off Trees   — Sequential multi-target A*
   ═══════════════════════════════════════════════════════════ */

const INF = Infinity;
const K = (r, c) => `${r},${c}`;
const DIRS4 = [[0,1],[1,0],[0,-1],[-1,0]];
const DIRS8 = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

/* ─────────────────────────────────────────────
   ALGORITHM TAB: 8×10 grid, A* (Manhattan) vs Dijkstra
   ───────────────────────────────────────────── */
const ALG_R = 8, ALG_C = 10;
const ALG_START = [0,0], ALG_GOAL = [7,9];
const ALG_WALLS = new Set([
  "1,3","1,4","1,5","2,5","3,5","3,1","3,2","3,3",
  "5,4","5,5","5,6","5,7","6,2","6,7","4,7","7,7",
]);
const algManhattan = (r,c) => Math.abs(r-ALG_GOAL[0]) + Math.abs(c-ALG_GOAL[1]);

function buildAlgSteps(useH) {
  const R=ALG_R, C=ALG_C, START=ALG_START, GOAL=ALG_GOAL, WALLS=ALG_WALLS;
  const hFn = useH ? algManhattan : ()=>0;
  const g = Array.from({length:R},()=>Array(C).fill(INF));
  const f = Array.from({length:R},()=>Array(C).fill(INF));
  const parent = Array.from({length:R},()=>Array(C).fill(null));
  const closed = new Set(), openSet = new Set();
  const [sr,sc] = START;
  g[sr][sc]=0; f[sr][sc]=hFn(sr,sc);
  const pq = [[f[sr][sc],sr,sc]];
  openSet.add(K(sr,sc));
  const steps = [];
  const snap = () => ({g:g.map(r=>[...r]), f:f.map(r=>[...r]), parent:parent.map(r=>[...r])});

  steps.push({
    title: "Initialize — Set Start to g=0",
    detail: useH
      ? `g(0,0)=0, h(0,0)=${hFn(sr,sc)}, f=${f[sr][sc]}. Push into min-heap.`
      : `dist(0,0)=0. Push (0, (0,0)). No heuristic — expands uniformly.`,
    ...snap(), closed:new Set(closed), openSet:new Set(openSet),
    current:null, neighbors:[], pq:pq.map(x=>[...x]),
    phase:"init", codeHL:[2,3,4,5,6], path:[], expanded:0,
  });

  let found=false, expanded=0;
  while (pq.length && !found) {
    pq.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
    const [fv,cr,cc] = pq.shift();
    const ck = K(cr,cc);
    openSet.delete(ck);
    if (closed.has(ck)) continue;
    closed.add(ck); expanded++;

    if (cr===GOAL[0] && cc===GOAL[1]) {
      const path=[]; let pr=cr,pc=cc;
      while(pr!==null){path.unshift([pr,pc]);const p=parent[pr][pc];if(!p)break;[pr,pc]=p;}
      steps.push({
        title: `✓ Goal at (${cr},${cc}) — Cost ${g[cr][cc]}`,
        detail: `${expanded} nodes expanded. ${useH?"A*'s heuristic guided search toward goal.":"Dijkstra explored uniformly."}`,
        ...snap(), closed:new Set(closed), openSet:new Set(openSet),
        current:[cr,cc], neighbors:[], pq:pq.map(x=>[...x]),
        phase:"done", codeHL:[11,12], path, expanded,
      });
      found=true; break;
    }

    steps.push({
      title: `Pop (${cr},${cc}) — ${useH?`f=${fv}, g=${g[cr][cc]}, h=${hFn(cr,cc)}`:`dist=${g[cr][cc]}`}`,
      detail: `Expand (${cr},${cc}). Add to closed, explore 4-directional neighbors.`,
      ...snap(), closed:new Set(closed), openSet:new Set(openSet),
      current:[cr,cc], neighbors:[], pq:pq.map(x=>[...x]),
      phase:"visit", codeHL:[8,9,10,11,13], path:[], expanded,
    });

    const nbs=[];
    for (const[dr,dc]of DIRS4) {
      const nr=cr+dr,nc=cc+dc;
      if(nr<0||nr>=R||nc<0||nc>=C||WALLS.has(K(nr,nc))||closed.has(K(nr,nc)))continue;
      const ng=g[cr][cc]+1;
      if(ng<g[nr][nc]){
        g[nr][nc]=ng; f[nr][nc]=ng+hFn(nr,nc);
        parent[nr][nc]=[cr,cc]; pq.push([f[nr][nc],nr,nc]);
        openSet.add(K(nr,nc)); nbs.push([nr,nc,ng,f[nr][nc]]);
      }
    }
    if (nbs.length>0) {
      steps.push({
        title: `Relax ${nbs.length} neighbor(s) of (${cr},${cc})`,
        detail: nbs.map(([r,c,gv,fval])=>useH?`(${r},${c}):f=${fval}`:`(${r},${c}):d=${gv}`).join(" · "),
        ...snap(), closed:new Set(closed), openSet:new Set(openSet),
        current:[cr,cc], neighbors:nbs.map(([r,c])=>[r,c]), pq:pq.map(x=>[...x]),
        phase:"relax", codeHL:[15,16,17,18,19,20], path:[], expanded,
      });
    }
  }
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 1: LC 1091 — Shortest Path in Binary Matrix
   8-directional, Chebyshev heuristic
   ───────────────────────────────────────────── */
const P1_R=5, P1_C=5;
const P1_START=[0,0], P1_GOAL=[4,4];
const P1_GRID = [
  [0,0,0,0,0],
  [1,1,0,1,0],
  [0,0,0,0,0],
  [0,1,1,1,0],
  [0,0,0,0,0],
];
const P1_WALLS = new Set();
for(let r=0;r<P1_R;r++) for(let c=0;c<P1_C;c++) if(P1_GRID[r][c]===1) P1_WALLS.add(K(r,c));
const chebyshev = (r,c) => Math.max(Math.abs(r-P1_GOAL[0]),Math.abs(c-P1_GOAL[1]));

function buildP1Steps() {
  const R=P1_R,C=P1_C,START=P1_START,GOAL=P1_GOAL,WALLS=P1_WALLS;
  const g=Array.from({length:R},()=>Array(C).fill(INF));
  const f=Array.from({length:R},()=>Array(C).fill(INF));
  const parent=Array.from({length:R},()=>Array(C).fill(null));
  const closed=new Set(),openSet=new Set();
  const[sr,sc]=START;
  g[sr][sc]=0;f[sr][sc]=chebyshev(sr,sc);
  const pq=[[f[sr][sc],sr,sc]];
  openSet.add(K(sr,sc));
  const steps=[];
  const snap=()=>({g:g.map(r=>[...r]),f:f.map(r=>[...r]),parent:parent.map(r=>[...r])});

  steps.push({
    title:"Initialize — Chebyshev Heuristic",
    detail:`8-directional movement. h = Chebyshev distance = max(|Δr|,|Δc|) = ${chebyshev(sr,sc)}. This is admissible for 8-dir because diagonal moves cost 1.`,
    ...snap(),closed:new Set(),openSet:new Set(openSet),
    current:null,neighbors:[],pq:pq.map(x=>[...x]),
    phase:"init",codeHL:[2,3,4,5,6],path:[],expanded:0,
  });

  let found=false,expanded=0;
  while(pq.length&&!found){
    pq.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
    const[fv,cr,cc]=pq.shift();
    const ck=K(cr,cc);
    openSet.delete(ck);
    if(closed.has(ck))continue;
    closed.add(ck);expanded++;

    if(cr===GOAL[0]&&cc===GOAL[1]){
      const path=[];let pr=cr,pc=cc;
      while(pr!==null){path.unshift([pr,pc]);const p=parent[pr][pc];if(!p)break;[pr,pc]=p;}
      steps.push({
        title:`✓ Goal (${cr},${cc}) — Cost ${g[cr][cc]}`,
        detail:`Only ${expanded} nodes expanded (vs ~18 with BFS). Chebyshev heuristic guides diagonal movement toward goal. Path length = ${path.length}.`,
        ...snap(),closed:new Set(closed),openSet:new Set(openSet),
        current:[cr,cc],neighbors:[],pq:pq.map(x=>[...x]),
        phase:"done",codeHL:[11,12],path,expanded,
      });
      found=true;break;
    }

    steps.push({
      title:`Pop (${cr},${cc}) — f=${fv}, g=${g[cr][cc]}, h=${chebyshev(cr,cc)}`,
      detail:`Expand. Check 8 neighbors (including diagonals).`,
      ...snap(),closed:new Set(closed),openSet:new Set(openSet),
      current:[cr,cc],neighbors:[],pq:pq.map(x=>[...x]),
      phase:"visit",codeHL:[8,9,10,11,13],path:[],expanded,
    });

    const nbs=[];
    for(const[dr,dc]of DIRS8){
      const nr=cr+dr,nc=cc+dc;
      if(nr<0||nr>=R||nc<0||nc>=C||WALLS.has(K(nr,nc))||closed.has(K(nr,nc)))continue;
      const ng=g[cr][cc]+1;
      if(ng<g[nr][nc]){
        g[nr][nc]=ng;f[nr][nc]=ng+chebyshev(nr,nc);
        parent[nr][nc]=[cr,cc];pq.push([f[nr][nc],nr,nc]);
        openSet.add(K(nr,nc));nbs.push([nr,nc,ng,f[nr][nc]]);
      }
    }
    if(nbs.length>0){
      steps.push({
        title:`Relax ${nbs.length} neighbor(s) — 8-directional`,
        detail:nbs.map(([r,c,,fval])=>`(${r},${c}):f=${fval}`).join(" · "),
        ...snap(),closed:new Set(closed),openSet:new Set(openSet),
        current:[cr,cc],neighbors:nbs.map(([r,c])=>[r,c]),pq:pq.map(x=>[...x]),
        phase:"relax",codeHL:[15,16,17,18,19,20],path:[],expanded,
      });
    }
  }
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 2: LC 675 — Cut Off Trees for Golf Event
   Sequential A* calls to trees sorted by height
   ───────────────────────────────────────────── */
const P2_R=4, P2_C=5;
const P2_GRID = [
  [1,2,3,1,1],
  [1,0,1,0,7],
  [4,0,5,1,1],
  [1,1,6,0,1],
];
const P2_WALLS = new Set();
for(let r=0;r<P2_R;r++) for(let c=0;c<P2_C;c++) if(P2_GRID[r][c]===0) P2_WALLS.add(K(r,c));
const P2_TREES = [];
for(let r=0;r<P2_R;r++) for(let c=0;c<P2_C;c++) if(P2_GRID[r][c]>1) P2_TREES.push({h:P2_GRID[r][c],r,c});
P2_TREES.sort((a,b)=>a.h-b.h);
const p2Man = (r,c,gr,gc) => Math.abs(r-gr)+Math.abs(c-gc);

function buildP2Steps() {
  const R=P2_R,C=P2_C,WALLS=P2_WALLS;
  const steps=[];
  const trees=[...P2_TREES];
  let pos=[0,0],totalCost=0,treeIdx=0;

  const emptyG=()=>Array.from({length:R},()=>Array(C).fill(INF));
  const emptyF=()=>Array.from({length:R},()=>Array(C).fill(INF));
  const emptyP=()=>Array.from({length:R},()=>Array(C).fill(null));

  steps.push({
    title:"Initialize — Sort Trees by Height",
    detail:`${trees.length} trees to cut in height order: ${trees.map(t=>`(${t.r},${t.c})h=${t.h}`).join(" → ")}. Run A* between consecutive targets. Total cost = sum of all path lengths.`,
    g:emptyG(),f:emptyF(),parent:emptyP(),
    closed:new Set(),openSet:new Set(),
    current:null,neighbors:[],pq:[],
    phase:"init",codeHL:[0,1,2,3,4],path:[],expanded:0,
    treeIdx:-1,totalCost:0,targetTree:null,
    cutTrees:new Set(),
  });

  const cutTrees = new Set();
  let totalExpanded = 0;

  for (const tree of trees) {
    const [sr,sc]=pos;
    const gr=tree.r,gc=tree.c;
    const hFn=(r,c)=>p2Man(r,c,gr,gc);

    // Run A* from pos to tree
    const g=emptyG(),f=emptyF(),parent=emptyP();
    const closed=new Set(),openSet=new Set();
    g[sr][sc]=0;f[sr][sc]=hFn(sr,sc);
    const pq=[[f[sr][sc],sr,sc]];
    openSet.add(K(sr,sc));

    const snap=()=>({g:g.map(r=>[...r]),f:f.map(r=>[...r]),parent:parent.map(r=>[...r])});

    steps.push({
      title:`Target Tree #${treeIdx+1}: (${gr},${gc}) h=${tree.h}`,
      detail:`A* from (${sr},${sc}) → (${gr},${gc}). Manhattan h = ${hFn(sr,sc)}.`,
      ...snap(),closed:new Set(),openSet:new Set(openSet),
      current:[sr,sc],neighbors:[],pq:pq.map(x=>[...x]),
      phase:"round",codeHL:[5,6,7,8],path:[],expanded:totalExpanded,
      treeIdx,totalCost,targetTree:tree,
      cutTrees:new Set(cutTrees),
    });

    let segFound=false;
    while(pq.length&&!segFound){
      pq.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
      const[fv,cr,cc]=pq.shift();
      const ck=K(cr,cc);
      openSet.delete(ck);
      if(closed.has(ck))continue;
      closed.add(ck);totalExpanded++;

      if(cr===gr&&cc===gc){
        const path=[];let pr=cr,pc=cc;
        while(pr!==null){path.unshift([pr,pc]);const p=parent[pr][pc];if(!p)break;[pr,pc]=p;}
        totalCost+=g[cr][cc];
        cutTrees.add(K(gr,gc));
        steps.push({
          title:`✓ Tree (${gr},${gc}) cut — cost ${g[cr][cc]}, running total ${totalCost}`,
          detail:`Path: ${path.map(([r,c])=>`(${r},${c})`).join("→")}. ${trees.length-treeIdx-1} trees remaining.`,
          ...snap(),closed:new Set(closed),openSet:new Set(openSet),
          current:[cr,cc],neighbors:[],pq:pq.map(x=>[...x]),
          phase:"relax",codeHL:[13,14,15],path,expanded:totalExpanded,
          treeIdx,totalCost,targetTree:tree,
          cutTrees:new Set(cutTrees),
        });
        pos=[gr,gc];segFound=true;break;
      }

      const nbs=[];
      for(const[dr,dc]of DIRS4){
        const nr=cr+dr,nc=cc+dc;
        if(nr<0||nr>=R||nc<0||nc>=C||WALLS.has(K(nr,nc))||closed.has(K(nr,nc)))continue;
        const ng=g[cr][cc]+1;
        if(ng<g[nr][nc]){
          g[nr][nc]=ng;f[nr][nc]=ng+hFn(nr,nc);
          parent[nr][nc]=[cr,cc];pq.push([f[nr][nc],nr,nc]);
          openSet.add(K(nr,nc));nbs.push([nr,nc]);
        }
      }
      if(nbs.length>0){
        steps.push({
          title:`Expand (${cr},${cc}) → ${nbs.length} neighbors`,
          detail:`f=${fv}, g=${g[cr][cc]}, h=${hFn(cr,cc)}. Heading toward tree (${gr},${gc}).`,
          ...snap(),closed:new Set(closed),openSet:new Set(openSet),
          current:[cr,cc],neighbors:nbs,pq:pq.map(x=>[...x]),
          phase:"visit",codeHL:[9,10,11,12],path:[],expanded:totalExpanded,
          treeIdx,totalCost,targetTree:tree,
          cutTrees:new Set(cutTrees),
        });
      }
    }
    treeIdx++;
  }

  steps.push({
    title:`✓ All Trees Cut — Total Cost ${totalCost}`,
    detail:`${trees.length} trees cut in height order. Total steps = ${totalCost}. A* found optimal path between each consecutive pair.`,
    g:emptyG(),f:emptyF(),parent:emptyP(),
    closed:new Set(),openSet:new Set(),
    current:null,neighbors:[],pq:[],
    phase:"done",codeHL:[16,17],path:[],expanded:totalExpanded,
    treeIdx:trees.length,totalCost,targetTree:null,
    cutTrees:new Set(cutTrees),
  });
  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title: "Algorithm", lc: null, difficulty: null, tag: "Core Pattern",
    coreIdea: {
      astar: "A* combines Dijkstra's guaranteed shortest path with a heuristic h(n) that estimates remaining cost. By expanding the node with lowest f(n) = g(n) + h(n), A* steers toward the goal — visiting far fewer nodes than Dijkstra while still finding the optimal path (given admissible h).",
      dijkstra: "Dijkstra on a grid expands uniformly — every cell at distance d is explored before d+1. Without a heuristic, it has no direction and explores many irrelevant nodes. Compare expanded counts with A* to see the difference.",
    },
    rows: ALG_R, cols: ALG_C, walls: ALG_WALLS, start: ALG_START, goal: ALG_GOAL,
    hasToggle: true, dirs: "4-dir",
    buildSteps: buildAlgSteps,
    grid: null,
    hLabel: "|Δr|+|Δc| (Manhattan)",
    code_astar: [
      {id:0,text:`import heapq`},{id:1,text:``},
      {id:2,text:`def astar(grid, start, goal):`},
      {id:3,text:`    g = {start: 0}`},
      {id:4,text:`    pq = [(h(start), start)]`},
      {id:5,text:`    parent = {}`},
      {id:6,text:`    closed = set()`},
      {id:7,text:``},
      {id:8,text:`    while pq:`},
      {id:9,text:`        _, cur = heapq.heappop(pq)`},
      {id:10,text:`        if cur in closed: continue`},
      {id:11,text:`        closed.add(cur)`},
      {id:12,text:`        if cur == goal: return path`},
      {id:13,text:``},
      {id:14,text:`        # f(n) = g(n) + h(n)`},
      {id:15,text:`        for nb in neighbors(cur):`},
      {id:16,text:`            ng = g[cur] + 1`},
      {id:17,text:`            if ng < g.get(nb, inf):`},
      {id:18,text:`                g[nb] = ng`},
      {id:19,text:`                parent[nb] = cur`},
      {id:20,text:`                heappush(pq, (ng+h(nb), nb))`},
      {id:21,text:``},{id:22,text:`    return None`},
    ],
    code_dijkstra: [
      {id:0,text:`import heapq`},{id:1,text:``},
      {id:2,text:`def dijkstra(grid, start, goal):`},
      {id:3,text:`    dist = {start: 0}`},
      {id:4,text:`    pq = [(0, start)]`},
      {id:5,text:`    parent = {}`},
      {id:6,text:`    closed = set()`},
      {id:7,text:``},
      {id:8,text:`    while pq:`},
      {id:9,text:`        d, cur = heapq.heappop(pq)`},
      {id:10,text:`        if cur in closed: continue`},
      {id:11,text:`        closed.add(cur)`},
      {id:12,text:`        if cur == goal: return path`},
      {id:13,text:``},
      {id:14,text:`        # no heuristic: f(n) = g(n)`},
      {id:15,text:`        for nb in neighbors(cur):`},
      {id:16,text:`            nd = dist[cur] + 1`},
      {id:17,text:`            if nd < dist.get(nb, inf):`},
      {id:18,text:`                dist[nb] = nd`},
      {id:19,text:`                parent[nb] = cur`},
      {id:20,text:`                heappush(pq, (nd, nb))`},
      {id:21,text:``},{id:22,text:`    return None  # no heuristic`},
    ],
  },
  binary_matrix: {
    title: "Binary Matrix", lc: "1091", difficulty: "Medium", tag: "8-Dir Chebyshev",
    coreIdea: "8-directional movement allows diagonals. Manhattan distance is NOT admissible here (it overestimates diagonal shortcuts). Use Chebyshev distance h=max(|Δr|,|Δc|) which is admissible: A* expands only 7 nodes vs BFS's 18, both finding cost=5.",
    rows: P1_R, cols: P1_C, walls: P1_WALLS, start: P1_START, goal: P1_GOAL,
    hasToggle: false, dirs: "8-dir",
    grid: P1_GRID,
    hLabel: "max(|Δr|,|Δc|) (Chebyshev)",
    buildSteps: buildP1Steps,
    code: [
      {id:0,text:`import heapq`},{id:1,text:``},
      {id:2,text:`def shortestPathBinaryMatrix(grid):`},
      {id:3,text:`    n = len(grid)`},
      {id:4,text:`    g = {(0,0): 1}  # path length`},
      {id:5,text:`    h = lambda r,c: max(n-1-r, n-1-c)`},
      {id:6,text:`    pq = [(1 + h(0,0), 0, 0)]`},
      {id:7,text:``},
      {id:8,text:`    while pq:`},
      {id:9,text:`        _, r, c = heapq.heappop(pq)`},
      {id:10,text:`        if (r,c) in closed: continue`},
      {id:11,text:`        closed.add((r,c))`},
      {id:12,text:`        if r==n-1 and c==n-1: return g[r,c]`},
      {id:13,text:``},
      {id:14,text:`        # 8 directions (incl diagonals)`},
      {id:15,text:`        for dr,dc in 8_DIRS:`},
      {id:16,text:`            nr, nc = r+dr, c+dc`},
      {id:17,text:`            if valid(nr,nc) and grid[nr][nc]==0:`},
      {id:18,text:`                ng = g[(r,c)] + 1`},
      {id:19,text:`                if ng < g.get((nr,nc), inf):`},
      {id:20,text:`                    g[(nr,nc)] = ng`},
      {id:21,text:`                    heappush(pq, (ng+h(nr,nc),nr,nc))`},
      {id:22,text:`    return -1`},
    ],
  },
  cut_trees: {
    title: "Cut Off Trees", lc: "675", difficulty: "Hard", tag: "Sequential A*",
    coreIdea: "Sort trees by height, then run A* between each consecutive pair. Total cost = sum of individual path lengths. Each A* call uses Manhattan heuristic to the current target tree. Grid cells with 0 are obstacles, cells > 1 are trees with that height.",
    rows: P2_R, cols: P2_C, walls: P2_WALLS, start: [0,0], goal: null,
    hasToggle: false, dirs: "4-dir",
    grid: P2_GRID,
    hLabel: "Manhattan to current target",
    buildSteps: buildP2Steps,
    trees: P2_TREES,
    code: [
      {id:0,text:`def cutOffTree(forest):`},
      {id:1,text:`    trees = sorted((h,r,c) for r,row`},
      {id:2,text:`      in enumerate(forest) for c,h`},
      {id:3,text:`      in enumerate(row) if h > 1)`},
      {id:4,text:`    total, sr, sc = 0, 0, 0`},
      {id:5,text:`    for h, tr, tc in trees:`},
      {id:6,text:`        # A* from (sr,sc) to (tr,tc)`},
      {id:7,text:`        cost = astar(forest,sr,sc,tr,tc)`},
      {id:8,text:`        if cost == -1: return -1`},
      {id:9,text:`        total += cost`},
      {id:10,text:`        sr, sc = tr, tc`},
      {id:11,text:`    return total`},
      {id:12,text:``},
      {id:13,text:`def astar(grid, sr, sc, gr, gc):`},
      {id:14,text:`    # standard A* with Manhattan h`},
      {id:15,text:`    h = lambda r,c: abs(r-gr)+abs(c-gc)`},
      {id:16,text:`    # ... (same as Algorithm tab)`},
      {id:17,text:`    return cost  # or -1 if unreachable`},
    ],
  },
};

/* ═══════════════════════════════════════════
   VISUALIZATION COMPONENTS
   ═══════════════════════════════════════════ */

function GridView({ step, problem, showH, subMode }) {
  const R=problem.rows, C=problem.cols;
  const {g,closed,openSet,current,neighbors,path}=step;
  const WALLS=problem.walls;
  const START=problem.start;
  const GOAL=step.targetTree?[step.targetTree.r,step.targetTree.c]:problem.goal;
  const cellSize=Math.min(38, Math.floor(380/C));
  const pathSet=new Set((path||[]).map(([r,c])=>K(r,c)));
  const nbSet=new Set((neighbors||[]).map(([r,c])=>K(r,c)));
  const cutTrees=step.cutTrees;
  const treeMap=problem.trees;
  const gridData=problem.grid;

  const hFn = (r,c) => {
    if (!GOAL) return 0;
    if (problem.dirs==="8-dir") return Math.max(Math.abs(r-GOAL[0]),Math.abs(c-GOAL[1]));
    return Math.abs(r-GOAL[0])+Math.abs(c-GOAL[1]);
  };

  return (
    <svg viewBox={`0 0 ${C*cellSize+2} ${R*cellSize+2}`} className="w-full" style={{maxHeight:230}}>
      {Array.from({length:R},(_,r) =>
        Array.from({length:C},(_,c) => {
          const k=K(r,c);
          const isWall=WALLS.has(k);
          const isStart=r===START[0]&&c===START[1];
          const isGoal=GOAL&&r===GOAL[0]&&c===GOAL[1];
          const isCurrent=current&&current[0]===r&&current[1]===c;
          const isPath=pathSet.has(k);
          const isClosed=closed.has(k);
          const isOpen=openSet.has(k);
          const isNb=nbSet.has(k);
          const isCutTree=cutTrees&&cutTrees.has(k);
          const isTree=treeMap&&gridData&&gridData[r][c]>1;
          const gv=g[r][c];

          let fill="#18181b";
          if(isWall)fill="#3f3f46";
          else if(isPath)fill="#059669";
          else if(isCurrent)fill="#2563eb";
          else if(isNb)fill="#d97706";
          else if(isGoal)fill="#dc2626";
          else if(isStart)fill="#7c3aed";
          else if(isClosed)fill="#1e3a5f";
          else if(isOpen)fill="#422006";
          else if(isCutTree)fill="#065f46";

          const stroke=isPath?"#10b981":isCurrent?"#3b82f6":"#27272a";
          return (
            <g key={k}>
              <rect x={c*cellSize+1} y={r*cellSize+1} width={cellSize-1} height={cellSize-1}
                fill={fill} stroke={stroke} strokeWidth={isPath||isCurrent?2:0.5} rx={3} />
              {isStart && <text x={c*cellSize+cellSize/2+1} y={r*cellSize+cellSize/2+1} textAnchor="middle" dominantBaseline="central" fill="#c4b5fd" fontSize="10" fontWeight="700">S</text>}
              {isGoal && !isPath && <text x={c*cellSize+cellSize/2+1} y={r*cellSize+cellSize/2+1} textAnchor="middle" dominantBaseline="central" fill="#fca5a5" fontSize="10" fontWeight="700">G</text>}
              {isTree && !isStart && !isGoal && !isCutTree && !isPath && !isCurrent && (
                <text x={c*cellSize+cellSize/2+1} y={r*cellSize+cellSize/2+1} textAnchor="middle" dominantBaseline="central" fill="#d97706" fontSize="9" fontWeight="700" fontFamily="monospace">{gridData[r][c]}</text>
              )}
              {isCutTree && <text x={c*cellSize+cellSize/2+1} y={r*cellSize+cellSize/2+1} textAnchor="middle" dominantBaseline="central" fill="#10b981" fontSize="8" fontWeight="700">✓</text>}
              {!isWall && !isStart && !isGoal && !isTree && gv!==INF && gv>0 && (
                <text x={c*cellSize+cellSize/2+1} y={r*cellSize+cellSize/2+1} textAnchor="middle" dominantBaseline="central"
                  fill={isPath?"#a7f3d0":isCurrent?"#93c5fd":"#52525b"} fontSize="9" fontFamily="monospace">{gv}</text>
              )}
              {showH && !isWall && GOAL && (
                <text x={c*cellSize+cellSize-3} y={r*cellSize+9} textAnchor="end" fill="#7c3aed40" fontSize="7" fontFamily="monospace">{hFn(r,c)}</text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

function IOPanel({ step, problem, problemKey, subMode }) {
  const {phase,expanded,path}=step;
  const done=phase==="done";
  const R=problem.rows,C=problem.cols;
  const isAstar=subMode!=="dijkstra";
  const isCutTrees=problemKey==="cut_trees";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{whiteSpace:"pre"}}>
          <div><span className="text-zinc-500">grid</span> = <span className="text-zinc-300">{R}×{C}</span> <span className="text-zinc-600">({problem.walls.size} walls)</span></div>
          <div><span className="text-zinc-500">start</span> = <span className="text-violet-400">({problem.start.join(",")})</span></div>
          {problem.goal && <div><span className="text-zinc-500">goal</span> = <span className="text-red-400">({problem.goal.join(",")})</span></div>}
          {isCutTrees && <div><span className="text-zinc-500">trees</span> = <span className="text-amber-400">{P2_TREES.length} sorted by height</span></div>}
          <div><span className="text-zinc-500">dirs</span> = <span className="text-zinc-300">{problem.dirs}</span></div>
          {isAstar && <div><span className="text-zinc-500">h(n)</span> = <span className="text-purple-400">{problem.hLabel}</span></div>}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">State</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ DONE</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">expanded </span>= <span className={done?"text-emerald-300 font-bold":"text-zinc-300"}>{expanded}</span></div>
          {isCutTrees && step.totalCost !== undefined && (
            <div><span className="text-zinc-500">total    </span>= <span className={done?"text-emerald-300 font-bold":"text-zinc-300"}>{step.totalCost}</span></div>
          )}
          {!isCutTrees && done && path.length>0 && (
            <div><span className="text-zinc-500">cost     </span>= <span className="text-emerald-300 font-bold">{path.length-1}</span></div>
          )}
        </div>
      </div>

      {/* Tree progress for LC 675 */}
      {isCutTrees && (
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Trees</div>
          <div className="space-y-0.5 text-[10px] font-mono">
            {P2_TREES.map((t,i) => {
              const cut=step.cutTrees&&step.cutTrees.has(K(t.r,t.c));
              const isTarget=step.targetTree&&step.targetTree.h===t.h;
              return (
                <div key={i} className={`flex items-center gap-1.5 px-1 py-0.5 rounded ${isTarget?"bg-amber-950/30":""}`}>
                  <span className={cut?"text-emerald-400":"text-zinc-500"}>({t.r},{t.c})</span>
                  <span className="text-zinc-600">h={t.h}</span>
                  {cut && <span className="text-emerald-500">✓</span>}
                  {isTarget && !cut && <span className="text-amber-400 ml-auto">◀ target</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CodePanel({ code, highlightLines }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 h-full">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{whiteSpace:"pre"}}>
        {code.map(line => {
          const hl=highlightLines.includes(line.id);
          return (
            <div key={line.id} className={`px-2 rounded-sm ${hl?"bg-blue-500/15 text-blue-300":line.text===""?"":"text-zinc-500"}`}>
              <span className="inline-block w-5 text-right mr-3 text-zinc-700 select-none" style={{userSelect:"none"}}>
                {line.text!==""?line.id+1:""}
              </span>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button onClick={()=>setSi(Math.max(0,si-1))} disabled={si===0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">← Prev</button>
      <div className="flex gap-1.5 items-center">
        {total<=30
          ? Array.from({length:total}).map((_,i) => (
              <button key={i} onClick={()=>setSi(i)}
                className={`w-2 h-2 rounded-full transition-all ${i===si?"bg-blue-500 scale-125":"bg-zinc-700 hover:bg-zinc-500"}`} />
            ))
          : <>
              <button onClick={()=>setSi(0)} className={`px-2 py-0.5 text-xs rounded ${si===0?"bg-blue-600 text-white":"bg-zinc-800 text-zinc-400"}`}>Start</button>
              <input type="range" min={0} max={total-1} value={si} onChange={e=>setSi(Number(e.target.value))} className="w-32 accent-blue-500" />
              <span className="text-[10px] text-zinc-600 font-mono w-12 text-center">{si+1}/{total}</span>
              <button onClick={()=>setSi(total-1)} className={`px-2 py-0.5 text-xs rounded ${si===total-1?"bg-blue-600 text-white":"bg-zinc-800 text-zinc-400"}`}>End</button>
            </>
        }
      </div>
      <button onClick={()=>setSi(Math.min(total-1,si+1))} disabled={si>=total-1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">Next →</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function AStarViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [subMode, setSubMode] = useState("astar");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];

  const stepsA = useMemo(() => pKey==="algorithm" ? buildAlgSteps(true) : null, [pKey]);
  const stepsD = useMemo(() => pKey==="algorithm" ? buildAlgSteps(false) : null, [pKey]);
  const stepsP = useMemo(() => pKey!=="algorithm" ? problem.buildSteps() : null, [pKey]);

  const steps = pKey==="algorithm" ? (subMode==="astar"?stepsA:stepsD) : stepsP;
  const step = steps[Math.min(si, steps.length-1)];
  const code = pKey==="algorithm"
    ? (subMode==="astar"?problem.code_astar:problem.code_dijkstra)
    : problem.code;
  const isAstar = subMode !== "dijkstra";

  const switchProblem = (k) => { setPKey(k); setSubMode("astar"); setSi(0); };
  const switchSub = (m) => { setSubMode(m); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{fontFamily:"'IBM Plex Sans', system-ui, sans-serif"}}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">A* Search</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Heuristic-Guided Pathfinding • f(n) = g(n) + h(n)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PROBLEMS).map(([k,p]) => (
              <button key={k} onClick={()=>switchProblem(k)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  pKey===k?"bg-blue-600 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {p.lc ? <><span className="opacity-60">LC {p.lc}</span> </> : null}{p.title}
              </button>
            ))}
          </div>
        </div>

        {/* A-star / Dijkstra toggle for Algorithm tab */}
        {problem.hasToggle && (
          <div className="flex gap-2 mb-3">
            <button onClick={()=>switchSub("astar")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${subMode==="astar"?"bg-purple-600 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              A* (with h)
            </button>
            <button onClick={()=>switchSub("dijkstra")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${subMode==="dijkstra"?"bg-blue-600 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              Dijkstra (no h)
            </button>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
            {problem.difficulty && <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              problem.difficulty==="Hard"?"bg-red-900/50 text-red-400":"bg-amber-900/50 text-amber-400"
            }`}>{problem.difficulty}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">{problem.tag}</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            {typeof problem.coreIdea === "object" ? problem.coreIdea[subMode] : problem.coreIdea}
          </p>
        </div>

        <div className="mb-3">
          <NavBar si={Math.min(si,steps.length-1)} setSi={setSi} total={steps.length} />
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} problem={problem} problemKey={pKey} subMode={subMode} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{problem.rows}×{problem.cols} • {problem.walls.size} walls • {problem.dirs}</div>
              <GridView step={step} problem={problem} showH={isAstar && pKey!=="cut_trees"} subMode={subMode} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#7c3aed] inline-block" />Start</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#dc2626] inline-block" />Goal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#2563eb] inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#1e3a5f] inline-block" />Closed</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#059669] inline-block" />Path</span>
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${step.phase==="done"?"bg-emerald-950/30 border-emerald-900":"bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si,steps.length-1)+1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase==="relax"?"bg-emerald-900 text-emerald-300":
                  step.phase==="visit"?"bg-blue-900 text-blue-300":
                  step.phase==="round"?"bg-amber-900 text-amber-300":
                  step.phase==="done"?"bg-emerald-900 text-emerald-300":
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Priority Queue (top 8)</div>
              <div className="flex gap-1.5 flex-wrap min-h-[28px] items-center">
                {step.pq.length>0
                  ? [...step.pq].sort((a,b)=>a[0]-b[0]).slice(0,8).map(([fv,r,c],i) => (
                      <span key={i} className={`inline-flex items-center px-1.5 h-7 rounded-md border font-mono font-bold text-[10px] ${
                        isAstar?"bg-purple-950 border-purple-800 text-purple-300":"bg-blue-950 border-blue-800 text-blue-300"
                      }`}>
                        ({r},{c})f={fv}
                      </span>
                    ))
                  : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                {step.pq.length>8 && <span className="text-[10px] text-zinc-700">+{step.pq.length-8} more</span>}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1 text-center">
                  <div className={`text-xl font-bold font-mono ${isAstar?"text-purple-400":"text-blue-400"}`}>{step.expanded}</div>
                  <div className="text-[9px] text-zinc-600">expanded</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-amber-400">{step.pq.length}</div>
                  <div className="text-[9px] text-zinc-600">in queue</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-zinc-400">{step.closed.size}</div>
                  <div className="text-[9px] text-zinc-600">closed</div>
                </div>
                {pKey==="cut_trees" && (
                  <div className="flex-1 text-center">
                    <div className="text-xl font-bold font-mono text-emerald-400">{step.totalCost||0}</div>
                    <div className="text-[9px] text-zinc-600">total cost</div>
                  </div>
                )}
                {pKey!=="cut_trees" && (
                  <div className="flex-1 text-center">
                    <div className="text-xl font-bold font-mono text-emerald-400">{step.path&&step.path.length>0?step.path.length-1:"—"}</div>
                    <div className="text-[9px] text-zinc-600">path cost</div>
                  </div>
                )}
              </div>
            </div>

            {step.phase==="done" && step.path&&step.path.length>0 && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Shortest Path</div>
                <div className="font-mono text-[10px] text-emerald-300">
                  {step.path.map(([r,c])=>`(${r},${c})`).join(" → ")}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-4">
            <CodePanel code={code} highlightLines={step.codeHL} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use A*</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Single-source single-target with a good heuristic</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Grid/map pathfinding — games, robotics, navigation</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>When you need Dijkstra's optimality but want fewer expansions</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Admissible h(n) → optimal; consistent h(n) → no re-expansion</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O((V+E) log V) worst case</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V)</div>
                <div><span className="text-zinc-500 font-semibold">Key:</span> h=0 → Dijkstra; h=exact → straight-line</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1091 — Shortest Path in Binary Matrix</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 773 — Sliding Puzzle</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 675 — Cut Off Trees for Golf Event</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 752 — Open the Lock</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1263 — Min Moves to Move Box to Target</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 864 — Shortest Path to Get All Keys</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}