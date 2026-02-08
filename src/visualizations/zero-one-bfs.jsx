import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   0-1 BFS — Algorithm + 2 Problem Showcase
   1. Algorithm                         — arrow grid deque demo
   2. LC 2290 — Min Obstacle Removal    — obstacles cost 1, empty cost 0
   3. LC 1368 — Min Cost Valid Path     — arrow grid, change dir = cost 1
   ═══════════════════════════════════════════════════════════ */

const INF = Infinity;
const K = (r, c) => `${r},${c}`;
const DIRS4 = [[0,1],[1,0],[0,-1],[-1,0]];
const DIR_NAMES = ["\u2192","\u2193","\u2190","\u2191"];

/* ─────────────────────────────────────────────
   ALGORITHM TAB: 6x7 arrow grid
   ───────────────────────────────────────────── */
const ALG_R=6, ALG_C=7;
const ALG_ARROWS = [
  [0,0,1,0,0,1,0],
  [1,2,1,-1,1,1,1],
  [0,0,0,0,2,3,1],
  [1,-1,0,0,0,-1,1],
  [0,0,1,3,0,0,0],
  [0,0,0,0,0,0,0],
];
const ALG_START=[0,0], ALG_GOAL=[5,6];

function buildAlgSteps() {
  const R=ALG_R,C=ALG_C,ARROWS=ALG_ARROWS,START=ALG_START,GOAL=ALG_GOAL;
  const dist=Array.from({length:R},()=>Array(C).fill(INF));
  const parent=Array.from({length:R},()=>Array(C).fill(null));
  dist[START[0]][START[1]]=0;
  const deque=[[0,START[0],START[1]]];
  const visited=new Set(), finalized=new Set();
  const steps=[], snap=()=>dist.map(r=>[...r]);
  const dqSnap=()=>deque.map(x=>[...x]);

  steps.push({
    title:"Initialize \u2014 Start at (0,0), Cost = 0",
    detail:"dist[0][0]=0. Push (0,(0,0)) into deque. Arrow directions: follow arrow = cost 0, go against = cost 1.",
    dist:snap(), visited:new Set(), deque:dqSnap(),
    current:null, neighbors:[], phase:"init",
    codeHL:[2,3,4,5], path:[], expanded:0,
    frontPush:null, backPush:null, finalized:new Set(),
  });

  let stepCount=0;
  while(deque.length>0 && stepCount<50) {
    const[d,r,c]=deque.shift();
    const k=K(r,c);
    if(visited.has(k)) continue;
    visited.add(k); finalized.add(k); stepCount++;

    if(r===GOAL[0]&&c===GOAL[1]) {
      const path=[];let pr=r,pc=c;
      while(pr!==null){path.unshift([pr,pc]);const p=parent[pr][pc];if(!p)break;[pr,pc]=p;}
      steps.push({
        title:`\u2713 Goal (${r},${c}) \u2014 Cost = ${d}`,
        detail:`${stepCount} nodes expanded. ${d} direction changes needed.`,
        dist:snap(), visited:new Set(visited), deque:dqSnap(),
        current:[r,c], neighbors:[], phase:"done",
        codeHL:[9], path, expanded:stepCount,
        frontPush:null, backPush:null, finalized:new Set(finalized),
      });
      break;
    }

    const cellDir=ARROWS[r][c];
    const nbs=[], frontPushes=[], backPushes=[];
    for(let dir=0;dir<4;dir++) {
      const[dr,dc]=DIRS4[dir];
      const nr=r+dr,nc=c+dc;
      if(nr<0||nr>=R||nc<0||nc>=C) continue;
      if(ARROWS[nr][nc]===-1||visited.has(K(nr,nc))) continue;
      const cost=dir===cellDir?0:1;
      const nd=d+cost;
      if(nd<dist[nr][nc]) {
        dist[nr][nc]=nd; parent[nr][nc]=[r,c];
        if(cost===0){deque.unshift([nd,nr,nc]);frontPushes.push([nr,nc]);}
        else{deque.push([nd,nr,nc]);backPushes.push([nr,nc]);}
        nbs.push({r:nr,c:nc,cost,nd,dir});
      }
    }
    const freeNbs=nbs.filter(n=>n.cost===0);
    const paidNbs=nbs.filter(n=>n.cost===1);

    steps.push({
      title:`Pop (${r},${c}) \u2014 dist=${d}, arrow=${DIR_NAMES[cellDir]||"\u25aa"}`,
      detail:`Deque-pop (${d},(${r},${c})). Mark visited.`,
      dist:snap(), visited:new Set(visited), deque:dqSnap(),
      current:[r,c], neighbors:[], phase:"visit",
      codeHL:[7,8,9,10], path:[], expanded:stepCount,
      frontPush:null, backPush:null, finalized:new Set(finalized),
    });

    if(nbs.length>0) {
      steps.push({
        title: freeNbs.length>0&&paidNbs.length>0
          ? `Relax: ${freeNbs.length} free\u2192front, ${paidNbs.length} paid\u2192back`
          : freeNbs.length>0 ? `Relax: ${freeNbs.length} free \u2192 front`
          : `Relax: ${paidNbs.length} paid \u2192 back`,
        detail:
          (freeNbs.length>0?`Free (w=0): [${freeNbs.map(n=>`(${n.r},${n.c}) d=${n.nd}`).join(", ")}]. `:"")
          +(paidNbs.length>0?`Paid (w=1): [${paidNbs.map(n=>`(${n.r},${n.c}) d=${n.nd}`).join(", ")}]. `:"")
          +"Deque stays sorted: front \u2264 back.",
        dist:snap(), visited:new Set(visited), deque:dqSnap(),
        current:[r,c], neighbors:nbs.map(n=>[n.r,n.c,n.cost]),
        phase:"relax", codeHL:[12,13,14,15,16,17,18], path:[],
        expanded:stepCount,
        frontPush:frontPushes.length>0?frontPushes.map(([r,c])=>K(r,c)):null,
        backPush:backPushes.length>0?backPushes.map(([r,c])=>K(r,c)):null,
        finalized:new Set(finalized),
      });
    }
  }
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 1: LC 2290 — Min Obstacle Removal
   0 = empty (cost 0), 1 = obstacle (cost 1)
   ───────────────────────────────────────────── */
const P1_R=4, P1_C=4;
const P1_GRID = [
  [0,1,0,0],
  [0,1,0,1],
  [0,1,0,0],
  [0,0,1,0],
];
const P1_START=[0,0], P1_GOAL=[3,3];

function buildP1Steps() {
  const R=P1_R,C=P1_C,GRID=P1_GRID,START=P1_START,GOAL=P1_GOAL;
  const dist=Array.from({length:R},()=>Array(C).fill(INF));
  const parent=Array.from({length:R},()=>Array(C).fill(null));
  dist[START[0]][START[1]]=0;
  const deque=[[0,START[0],START[1]]];
  const visited=new Set(), finalized=new Set();
  const steps=[], snap=()=>dist.map(r=>[...r]);
  const dqSnap=()=>deque.map(x=>[...x]);

  steps.push({
    title:"Initialize \u2014 Obstacle Removal Grid",
    detail:"Empty cells cost 0 to enter, obstacle cells cost 1 to remove. Deque: push empty\u2192front, obstacle\u2192back. Find min removals to reach corner.",
    dist:snap(), visited:new Set(), deque:dqSnap(),
    current:null, neighbors:[], phase:"init",
    codeHL:[0,1,2,3,4,5], path:[], expanded:0,
    frontPush:null, backPush:null, finalized:new Set(),
  });

  let stepCount=0;
  while(deque.length>0 && stepCount<50) {
    const[d,r,c]=deque.shift();
    const k=K(r,c);
    if(visited.has(k)) continue;
    visited.add(k); finalized.add(k); stepCount++;

    if(r===GOAL[0]&&c===GOAL[1]) {
      const path=[];let pr=r,pc=c;
      while(pr!==null){path.unshift([pr,pc]);const p=parent[pr][pc];if(!p)break;[pr,pc]=p;}
      steps.push({
        title:`\u2713 Corner (${r},${c}) \u2014 ${d} obstacle(s) removed`,
        detail:`Path found removing ${d} obstacle(s). ${stepCount} nodes expanded.`,
        dist:snap(), visited:new Set(visited), deque:dqSnap(),
        current:[r,c], neighbors:[], phase:"done",
        codeHL:[9], path, expanded:stepCount,
        frontPush:null, backPush:null, finalized:new Set(finalized),
      });
      break;
    }

    const nbs=[], frontPushes=[], backPushes=[];
    for(const[dr,dc]of DIRS4) {
      const nr=r+dr,nc=c+dc;
      if(nr<0||nr>=R||nc<0||nc>=C||visited.has(K(nr,nc))) continue;
      const w=GRID[nr][nc]; // 0=empty, 1=obstacle
      const nd=d+w;
      if(nd<dist[nr][nc]) {
        dist[nr][nc]=nd; parent[nr][nc]=[r,c];
        if(w===0){deque.unshift([nd,nr,nc]);frontPushes.push([nr,nc]);}
        else{deque.push([nd,nr,nc]);backPushes.push([nr,nc]);}
        nbs.push({r:nr,c:nc,cost:w,nd});
      }
    }
    const freeNbs=nbs.filter(n=>n.cost===0);
    const obstNbs=nbs.filter(n=>n.cost===1);

    steps.push({
      title:`Pop (${r},${c}) \u2014 dist=${d}${GRID[r][c]===1?" [obstacle]":""}`,
      detail:`Expand (${r},${c}). ${GRID[r][c]===1?"This was an obstacle (removed).":"Empty cell."}`,
      dist:snap(), visited:new Set(visited), deque:dqSnap(),
      current:[r,c], neighbors:[], phase:"visit",
      codeHL:[7,8,9,10], path:[], expanded:stepCount,
      frontPush:null, backPush:null, finalized:new Set(finalized),
    });

    if(nbs.length>0) {
      steps.push({
        title:freeNbs.length>0&&obstNbs.length>0
          ?`${freeNbs.length} empty\u2192front, ${obstNbs.length} obstacle\u2192back`
          :freeNbs.length>0?`${freeNbs.length} empty cell(s) \u2192 front`
          :`${obstNbs.length} obstacle(s) \u2192 back`,
        detail:
          (freeNbs.length>0?`Empty (w=0, front): [${freeNbs.map(n=>`(${n.r},${n.c})`).join(", ")}]. `:"")
          +(obstNbs.length>0?`Obstacle (w=1, back): [${obstNbs.map(n=>`(${n.r},${n.c})`).join(", ")}]. `:""),
        dist:snap(), visited:new Set(visited), deque:dqSnap(),
        current:[r,c], neighbors:nbs.map(n=>[n.r,n.c,n.cost]),
        phase:"relax", codeHL:[12,13,14,15,16,17,18], path:[],
        expanded:stepCount,
        frontPush:frontPushes.length>0?frontPushes.map(([r2,c2])=>K(r2,c2)):null,
        backPush:backPushes.length>0?backPushes.map(([r2,c2])=>K(r2,c2)):null,
        finalized:new Set(finalized),
      });
    }
  }
  return steps;
}

/* ─────────────────────────────────────────────
   PROBLEM 2: LC 1368 — Min Cost to Make Valid Path
   Arrow grid, follow = 0, change = 1
   ───────────────────────────────────────────── */
const P2_R=3, P2_C=4;
const P2_ARROWS = [
  [0,0,2,0],
  [1,2,0,1],
  [0,0,0,0],
];
const P2_START=[0,0], P2_GOAL=[2,3];

function buildP2Steps() {
  const R=P2_R,C=P2_C,ARROWS=P2_ARROWS,START=P2_START,GOAL=P2_GOAL;
  const dist=Array.from({length:R},()=>Array(C).fill(INF));
  const parent=Array.from({length:R},()=>Array(C).fill(null));
  dist[START[0]][START[1]]=0;
  const deque=[[0,START[0],START[1]]];
  const visited=new Set(), finalized=new Set();
  const steps=[], snap=()=>dist.map(r=>[...r]);
  const dqSnap=()=>deque.map(x=>[...x]);

  steps.push({
    title:"Initialize \u2014 Arrow Cost Grid",
    detail:`3\u00d74 grid. Each cell has an arrow. Moving in arrow direction = free (cost 0). Any other direction = cost 1. Find min cost path (0,0)\u2192(2,3).`,
    dist:snap(), visited:new Set(), deque:dqSnap(),
    current:null, neighbors:[], phase:"init",
    codeHL:[0,1,2,3,4,5,6], path:[], expanded:0,
    frontPush:null, backPush:null, finalized:new Set(),
  });

  let stepCount=0;
  while(deque.length>0 && stepCount<50) {
    const[d,r,c]=deque.shift();
    const k=K(r,c);
    if(visited.has(k)) continue;
    visited.add(k); finalized.add(k); stepCount++;

    if(r===GOAL[0]&&c===GOAL[1]) {
      const path=[];let pr=r,pc=c;
      while(pr!==null){path.unshift([pr,pc]);const p=parent[pr][pc];if(!p)break;[pr,pc]=p;}
      steps.push({
        title:`\u2713 Goal (${r},${c}) \u2014 Cost = ${d}`,
        detail:`${d} arrow change(s) needed. ${stepCount} nodes expanded. 0-1 BFS found optimal path in O(R\u00d7C).`,
        dist:snap(), visited:new Set(visited), deque:dqSnap(),
        current:[r,c], neighbors:[], phase:"done",
        codeHL:[9], path, expanded:stepCount,
        frontPush:null, backPush:null, finalized:new Set(finalized),
      });
      break;
    }

    const cellDir=ARROWS[r][c];
    const nbs=[], frontPushes=[], backPushes=[];
    for(let dir=0;dir<4;dir++) {
      const[dr,dc]=DIRS4[dir];
      const nr=r+dr,nc=c+dc;
      if(nr<0||nr>=R||nc<0||nc>=C||visited.has(K(nr,nc))) continue;
      const cost=dir===cellDir?0:1;
      const nd=d+cost;
      if(nd<dist[nr][nc]) {
        dist[nr][nc]=nd; parent[nr][nc]=[r,c];
        if(cost===0){deque.unshift([nd,nr,nc]);frontPushes.push([nr,nc]);}
        else{deque.push([nd,nr,nc]);backPushes.push([nr,nc]);}
        nbs.push({r:nr,c:nc,cost,nd,dir});
      }
    }
    const freeNbs=nbs.filter(n=>n.cost===0);
    const paidNbs=nbs.filter(n=>n.cost===1);

    steps.push({
      title:`Pop (${r},${c}) \u2014 dist=${d}, arrow=${DIR_NAMES[cellDir]}`,
      detail:`Expand. Arrow points ${DIR_NAMES[cellDir]}. Following it costs 0, other dirs cost 1.`,
      dist:snap(), visited:new Set(visited), deque:dqSnap(),
      current:[r,c], neighbors:[], phase:"visit",
      codeHL:[7,8,9,10], path:[], expanded:stepCount,
      frontPush:null, backPush:null, finalized:new Set(finalized),
    });

    if(nbs.length>0) {
      steps.push({
        title:freeNbs.length>0&&paidNbs.length>0
          ?`${freeNbs.length} free\u2192front, ${paidNbs.length} paid\u2192back`
          :freeNbs.length>0?`${freeNbs.length} free \u2192 front`
          :`${paidNbs.length} paid \u2192 back`,
        detail:
          (freeNbs.length>0?`Follow arrow (w=0): [${freeNbs.map(n=>`(${n.r},${n.c})`).join(", ")}]. `:"")
          +(paidNbs.length>0?`Change dir (w=1): [${paidNbs.map(n=>`(${n.r},${n.c})`).join(", ")}]. `:""),
        dist:snap(), visited:new Set(visited), deque:dqSnap(),
        current:[r,c], neighbors:nbs.map(n=>[n.r,n.c,n.cost]),
        phase:"relax", codeHL:[12,13,14,15,16,17,18], path:[],
        expanded:stepCount,
        frontPush:frontPushes.length>0?frontPushes.map(([r2,c2])=>K(r2,c2)):null,
        backPush:backPushes.length>0?backPushes.map(([r2,c2])=>K(r2,c2)):null,
        finalized:new Set(finalized),
      });
    }
  }
  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title:"Algorithm", lc:null, difficulty:null, tag:"Core Pattern",
    coreIdea:"When edge weights are only 0 or 1, replace Dijkstra's heap with a deque: push cost-0 neighbors to the front, cost-1 to the back. The deque stays naturally sorted, giving Dijkstra-level optimality in O(V+E) \u2014 no log factor.",
    rows:ALG_R, cols:ALG_C, start:ALG_START, goal:ALG_GOAL,
    arrows:ALG_ARROWS, isObstacle:false,
    buildSteps:buildAlgSteps,
    code: [
      {id:0,text:"from collections import deque"},{id:1,text:""},
      {id:2,text:"def zero_one_bfs(grid, start, goal):"},
      {id:3,text:"    dist = [[inf]*C for _ in range(R)]"},
      {id:4,text:"    dist[sr][sc] = 0"},
      {id:5,text:"    dq = deque([(0, sr, sc)])"},
      {id:6,text:""},
      {id:7,text:"    while dq:"},
      {id:8,text:"        d, r, c = dq.popleft()"},
      {id:9,text:"        if d > dist[r][c]: continue"},
      {id:10,text:"        if (r,c) == goal: return d"},
      {id:11,text:""},
      {id:12,text:"        for nr, nc, w in neighbors(r, c):"},
      {id:13,text:"            nd = d + w"},
      {id:14,text:"            if nd < dist[nr][nc]:"},
      {id:15,text:"                dist[nr][nc] = nd"},
      {id:16,text:"                if w == 0:"},
      {id:17,text:"                    dq.appendleft((nd,nr,nc))"},
      {id:18,text:"                else:"},
      {id:19,text:"                    dq.append((nd,nr,nc))"},
      {id:20,text:""},{id:21,text:"    return -1"},
    ],
  },
  obstacle: {
    title:"Min Obstacle Removal", lc:"2290", difficulty:"Hard", tag:"Obstacle = Cost 1",
    coreIdea:"Grid of 0s (empty) and 1s (obstacles). Moving into empty costs 0, removing obstacle costs 1. This is a 0-1 weighted shortest path: use deque BFS. Push empty neighbors to front, obstacles to back. Much faster than Dijkstra for large grids.",
    rows:P1_R, cols:P1_C, start:P1_START, goal:P1_GOAL,
    arrows:null, isObstacle:true, grid:P1_GRID,
    buildSteps:buildP1Steps,
    code: [
      {id:0,text:"def minimumObstacles(grid):"},
      {id:1,text:"    R, C = len(grid), len(grid[0])"},
      {id:2,text:"    dist = [[inf]*C for _ in range(R)]"},
      {id:3,text:"    dist[0][0] = 0"},
      {id:4,text:"    dq = deque([(0, 0, 0)])"},
      {id:5,text:""},
      {id:6,text:"    while dq:"},
      {id:7,text:"        d, r, c = dq.popleft()"},
      {id:8,text:"        if d > dist[r][c]: continue"},
      {id:9,text:"        if r==R-1 and c==C-1: return d"},
      {id:10,text:""},
      {id:11,text:"        for dr, dc in DIRS:"},
      {id:12,text:"            nr, nc = r+dr, c+dc"},
      {id:13,text:"            w = grid[nr][nc]  # 0 or 1"},
      {id:14,text:"            if d+w < dist[nr][nc]:"},
      {id:15,text:"                dist[nr][nc] = d + w"},
      {id:16,text:"                if w == 0:"},
      {id:17,text:"                    dq.appendleft((d+w,nr,nc))"},
      {id:18,text:"                else:"},
      {id:19,text:"                    dq.append((d+w,nr,nc))"},
      {id:20,text:""},{id:21,text:"    return dist[R-1][C-1]"},
    ],
  },
  validpath: {
    title:"Min Cost Valid Path", lc:"1368", difficulty:"Hard", tag:"Arrow Grid",
    coreIdea:"Each cell has a sign pointing right, down, left, or up. Following the sign costs 0, changing it costs 1. Model as 0-1 BFS: arrows give free edges, other directions cost 1. The deque naturally processes all free-path extensions first before paid ones.",
    rows:P2_R, cols:P2_C, start:P2_START, goal:P2_GOAL,
    arrows:P2_ARROWS, isObstacle:false,
    buildSteps:buildP2Steps,
    code: [
      {id:0,text:"def minCost(grid):"},
      {id:1,text:"    R, C = len(grid), len(grid[0])"},
      {id:2,text:"    # 1=right,2=left,3=down,4=up"},
      {id:3,text:"    dist = [[inf]*C for _ in range(R)]"},
      {id:4,text:"    dist[0][0] = 0"},
      {id:5,text:"    dq = deque([(0, 0, 0)])"},
      {id:6,text:""},
      {id:7,text:"    while dq:"},
      {id:8,text:"        d, r, c = dq.popleft()"},
      {id:9,text:"        if r==R-1 and c==C-1: return d"},
      {id:10,text:"        if d > dist[r][c]: continue"},
      {id:11,text:""},
      {id:12,text:"        for dir, (dr,dc) in enumerate(DIRS):"},
      {id:13,text:"            nr, nc = r+dr, c+dc"},
      {id:14,text:"            w = 0 if dir==grid[r][c] else 1"},
      {id:15,text:"            if d+w < dist[nr][nc]:"},
      {id:16,text:"                dist[nr][nc] = d + w"},
      {id:17,text:"                if w == 0:"},
      {id:18,text:"                    dq.appendleft((d+w,nr,nc))"},
      {id:19,text:"                else:"},
      {id:20,text:"                    dq.append((d+w,nr,nc))"},
      {id:21,text:"    return -1"},
    ],
  },
};

/* ═══════════════════════════════════════════
   VISUALIZATION COMPONENTS
   ═══════════════════════════════════════════ */

function GridView({ step, problem }) {
  const R=problem.rows, C=problem.cols;
  const {dist,visited,current,neighbors,path}=step;
  const isObs=problem.isObstacle;
  const arrows=problem.arrows;
  const obsGrid=problem.grid;
  const cellSize=isObs?50:50;
  const pathSet=new Set((path||[]).map(([r,c])=>K(r,c)));
  const nbMap={};
  (neighbors||[]).forEach(([r,c,cost])=>{nbMap[K(r,c)]=cost;});
  const frontSet=new Set(step.frontPush||[]);
  const backSet=new Set(step.backPush||[]);
  const START=problem.start, GOAL=problem.goal;

  return (
    <svg viewBox={`0 0 ${C*cellSize+2} ${R*cellSize+2}`} className="w-full" style={{maxHeight:230}}>
      {Array.from({length:R},(_,r)=>
        Array.from({length:C},(_,c)=>{
          const k=K(r,c);
          const isWall=arrows?arrows[r][c]===-1:false;
          const isObstacle=isObs&&obsGrid[r][c]===1;
          const isCurrent=current&&current[0]===r&&current[1]===c;
          const isStart=r===START[0]&&c===START[1];
          const isGoal=r===GOAL[0]&&c===GOAL[1];
          const isPath=pathSet.has(k);
          const isVis=visited.has(k);
          const nbCost=nbMap[k];
          const isFront=frontSet.has(k);
          const isBack=backSet.has(k);
          const d=dist[r][c];

          let fill="#18181b";
          if(isWall)fill="#27272a";
          else if(isPath)fill="#059669";
          else if(isCurrent)fill="#2563eb";
          else if(isFront)fill="#166534";
          else if(isBack)fill="#7c2d12";
          else if(nbCost===0)fill="#14532d";
          else if(nbCost===1)fill="#7c2d12";
          else if(isVis)fill="#1e293b";
          else if(isObstacle)fill="#44403c";

          const stroke=isCurrent?"#3b82f6":isPath?"#10b981":isFront?"#22c55e":isBack?"#f97316":"#27272a";
          return (
            <g key={k}>
              <rect x={c*cellSize+1} y={r*cellSize+1} width={cellSize-1} height={cellSize-1}
                fill={fill} stroke={stroke} strokeWidth={isCurrent||isFront||isBack?2.5:0.5} rx={4} />
              {arrows&&!isWall&&arrows[r][c]>=0 && (
                <text x={c*cellSize+cellSize-6} y={r*cellSize+12} textAnchor="end"
                  fill={isCurrent?"#93c5fd":"#52525b80"} fontSize="10">
                  {DIR_NAMES[arrows[r][c]]}
                </text>
              )}
              {isObs&&isObstacle&&!isCurrent&&!isPath&&!isFront&&!isBack&&!isVis && (
                <text x={c*cellSize+cellSize/2+1} y={r*cellSize+cellSize/2+1} textAnchor="middle"
                  dominantBaseline="central" fill="#78716c" fontSize="14">{"\u25aa"}</text>
              )}
              {!isWall&&d!==INF && (
                <text x={c*cellSize+cellSize/2+1} y={r*cellSize+cellSize/2+3} textAnchor="middle"
                  dominantBaseline="central"
                  fill={isPath?"#a7f3d0":isCurrent?"#93c5fd":isFront?"#86efac":isBack?"#fdba74":"#71717a"}
                  fontSize="13" fontWeight="700" fontFamily="monospace">{d}</text>
              )}
              {isWall && (
                <text x={c*cellSize+cellSize/2+1} y={r*cellSize+cellSize/2+1} textAnchor="middle"
                  dominantBaseline="central" fill="#3f3f46" fontSize="14">{"\u25aa"}</text>
              )}
              {isStart&&!isCurrent && (
                <text x={c*cellSize+6} y={r*cellSize+cellSize-6} fill="#818cf8" fontSize="7" fontWeight="700">S</text>
              )}
              {isGoal && (
                <text x={c*cellSize+6} y={r*cellSize+cellSize-6} fill="#fca5a5" fontSize="7" fontWeight="700">G</text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

function IOPanel({ step, problem, problemKey }) {
  const {phase,expanded,path,finalized}=step;
  const done=phase==="done";
  const isObs=problem.isObstacle;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{whiteSpace:"pre"}}>
          <div><span className="text-zinc-500">grid </span>= <span className="text-zinc-300">{problem.rows}{"\u00d7"}{problem.cols}</span></div>
          <div><span className="text-zinc-500">start</span>= <span className="text-violet-400">({problem.start.join(",")})</span></div>
          <div><span className="text-zinc-500">goal </span>= <span className="text-red-400">({problem.goal.join(",")})</span></div>
          {isObs ? (
            <div><span className="text-zinc-500">w(e) </span>= <span className="text-emerald-400">0</span> <span className="text-zinc-600">(empty)</span> / <span className="text-orange-400">1</span> <span className="text-zinc-600">(obstacle)</span></div>
          ) : (
            <div><span className="text-zinc-500">w(e) </span>= <span className="text-emerald-400">0</span> <span className="text-zinc-600">(with arrow)</span> / <span className="text-orange-400">1</span> <span className="text-zinc-600">(against)</span></div>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">State</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{"\u2713"} DONE</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          {done&&path.length>0&&(
            <div><span className="text-zinc-500">cost    </span>= <span className="text-emerald-300 font-bold">{path.length>0?step.dist[problem.goal[0]][problem.goal[1]]:"?"}</span></div>
          )}
          <div><span className="text-zinc-500">expanded</span>= <span className={done?"text-emerald-300 font-bold":"text-zinc-300"}>{expanded}</span></div>
          <div><span className="text-zinc-500">visited </span>= <span className="text-zinc-300">{finalized.size}</span></div>
          <div><span className="text-zinc-500">deque   </span>= <span className="text-zinc-300">{step.deque.length}</span></div>
        </div>
      </div>

      {done&&path.length>0&&(
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Path</div>
          <div className="font-mono text-[10px] text-emerald-300">
            {path.map(([r,c])=>`(${r},${c})`).join(" \u2192 ")}
          </div>
        </div>
      )}
    </div>
  );
}

function DequeView({ step }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        Deque ({step.deque.length}) \u2014 <span className="text-emerald-400">front</span> {"..."} <span className="text-orange-400">back</span>
      </div>
      <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
        {step.deque.length>0
          ? step.deque.slice(0,12).map(([d,r,c],i)=>{
              const isFirst=i===0;
              const isLast=i===step.deque.length-1;
              return (
                <span key={i} className={`inline-flex items-center gap-0.5 px-1.5 h-7 rounded-md font-mono font-bold text-[10px] border ${
                  isFirst?"bg-emerald-950 border-emerald-800 text-emerald-300":
                  isLast?"bg-orange-950 border-orange-800 text-orange-300":
                  "bg-zinc-900 border-zinc-700 text-zinc-400"
                }`}>
                  ({r},{c})<span className="text-[9px] opacity-60">:{d}</span>
                </span>
              );
            })
          : <span className="text-[10px] text-zinc-600 italic">empty</span>}
        {step.deque.length>12 && <span className="text-[10px] text-zinc-700">+{step.deque.length-12} more</span>}
      </div>
    </div>
  );
}

function CodePanel({ code, highlightLines }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 h-full">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{whiteSpace:"pre"}}>
        {code.map(line=>{
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
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">{"\u2190"} Prev</button>
      <div className="flex gap-1.5 items-center">
        {total<=25
          ? Array.from({length:total}).map((_,i)=>(
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
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">Next {"\u2192"}</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function ZeroOneBFSViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];
  const steps = useMemo(() => problem.buildSteps(), [pKey]);
  const step = steps[Math.min(si, steps.length-1)];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{fontFamily:"'IBM Plex Sans', system-ui, sans-serif"}}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">0-1 BFS</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Deque-Based Shortest Path for Binary Weights {"\u2022"} O(V+E)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PROBLEMS).map(([k,p])=>(
              <button key={k} onClick={()=>switchProblem(k)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  pKey===k?"bg-blue-600 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {p.lc?<><span className="opacity-60">LC {p.lc}</span> </>:null}{p.title}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
            {problem.difficulty && <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-red-900/50 text-red-400">{problem.difficulty}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">{problem.tag}</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        <div className="mb-3">
          <NavBar si={Math.min(si,steps.length-1)} setSi={setSi} total={steps.length} />
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} problem={problem} problemKey={pKey} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{problem.rows}{"\u00d7"}{problem.cols} {"\u2022"} {problem.isObstacle?"\u25aa=obstacle":"arrows=free dir"}</div>
              <GridView step={step} problem={problem} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-600 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-800 inline-block" />{"\u2192"}front</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-900 inline-block" />{"\u2192"}back</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-800 inline-block" />Visited</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-600 inline-block" />Path</span>
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
                  step.phase==="done"?"bg-emerald-900 text-emerald-300":
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            <DequeView step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-blue-400">{step.expanded}</div>
                  <div className="text-[9px] text-zinc-600">expanded</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-amber-400">{step.deque.length}</div>
                  <div className="text-[9px] text-zinc-600">in deque</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-zinc-400">{step.finalized.size}</div>
                  <div className="text-[9px] text-zinc-600">visited</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {step.path&&step.path.length>0?step.dist[problem.goal[0]][problem.goal[1]]:"\u2014"}
                  </div>
                  <div className="text-[9px] text-zinc-600">path cost</div>
                </div>
              </div>
            </div>

            {step.phase==="done"&&step.path&&step.path.length>0&&(
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Shortest Path</div>
                <div className="font-mono text-[10px] text-emerald-300">
                  {step.path.map(([r,c])=>`(${r},${c})`).join(" \u2192 ")}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-4">
            <CodePanel code={problem.code} highlightLines={step.codeHL} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use 0-1 BFS</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Edge weights are exactly 0 and 1 {"\u2014"} some moves free, others cost 1</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Grid problems with conditional movement costs</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Dijkstra optimality but O(V+E) without the log factor</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Generalizes to 0-K BFS with a K+1 bucket queue</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(V + E) {"\u2014"} no heap needed</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(V)</div>
                <div><span className="text-zinc-500 font-semibold">Key:</span> deque front {"\u2264"} back {"\u2192"} naturally sorted</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1368 {"\u2014"} Min Cost to Make Valid Path</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 2290 {"\u2014"} Min Obstacle Removal to Reach Corner</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1293 {"\u2014"} Shortest Path with Obstacle Elimination</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1129 {"\u2014"} Shortest Path Alternating Colors</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">CF {"\u2014"} Labyrinth (classic 0-1 BFS)</span><span className="ml-auto text-[10px] text-amber-700">CF</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}