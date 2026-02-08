import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   BFS on State Space — Algorithm + 2 Problem Showcase
   1. Algorithm             — Word Ladder hit->cog (implicit graph)
   2. LC 773 — Sliding Puzzle — 2x3 board config as state
   3. LC 752 — Open the Lock  — 4-digit combo as state
   ═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   ALGORITHM: Word Ladder hit -> cog
   ───────────────────────────────────────────── */
const WL_BEGIN = "hit", WL_END = "cog";
const WL_LIST = ["hot","dot","dog","lot","log","cog"];

function wlDiff1(a,b){let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;return d===1;}
function wlDiffChar(a,b){for(let i=0;i<a.length;i++)if(a[i]!==b[i])return{pos:i,from:a[i],to:b[i]};return null;}

function wlNeighbors(word, wordSet){
  const res=[];for(const w of wordSet)if(wlDiff1(word,w))res.push(w);return res;
}

function buildAlgSteps(){
  const steps=[], wordSet=new Set(WL_LIST);
  const visited=new Set([WL_BEGIN]);
  let queue=[[WL_BEGIN,1]];
  const parent={}, levelNodes={0:[WL_BEGIN]}, allEdges=[];

  steps.push({
    title:"Initialize \u2014 Begin Word",
    detail:`Start with "${WL_BEGIN}". Target: "${WL_END}". BFS explores words differing by 1 letter.`,
    visited:new Set(visited), queue:queue.map(x=>[...x]),
    current:null, neighbor:null, level:0, phase:"init",
    codeHL:[0,2,3,4,5], allEdges:[], levelNodes:{...levelNodes},
    path:[], foundPath:null,
  });

  let found=false;
  while(queue.length&&!found){
    const nextQ=[];
    const lvl=queue[0][1], nextLvl=lvl+1;
    for(const[word,level]of queue){
      const neighbors=wlNeighbors(word,wordSet);

      steps.push({
        title:`Process "${word}" (Level ${level-1})`,
        detail:`Dequeue "${word}". Neighbors: ${neighbors.length>0?neighbors.map(n=>`"${n}"`).join(", "):"none"}.`,
        visited:new Set(visited), queue:queue.filter(([w])=>w!==word).map(x=>[...x]),
        current:word, neighbor:null, level:level-1, phase:"process",
        codeHL:[7,8], allEdges:[...allEdges], levelNodes:{...levelNodes}, path:[], foundPath:null,
      });

      for(const nb of neighbors){
        if(visited.has(nb)){continue;}
        visited.add(nb); parent[nb]=word; allEdges.push([word,nb]);
        if(!levelNodes[level])levelNodes[level]=[];
        levelNodes[level].push(nb);

        if(nb===WL_END){
          found=true;
          const path=[];let c=WL_END;while(c!==undefined){path.unshift(c);c=parent[c];}
          const d=wlDiffChar(word,nb);
          steps.push({
            title:`\u2713 "${word}" \u2192 "${nb}" \u2014 Target Found!`,
            detail:`Change '${d.from}'\u2192'${d.to}' at pos ${d.pos}. Ladder length = ${path.length}. Path: ${path.join(" \u2192 ")}.`,
            visited:new Set(visited), queue:[],
            current:word, neighbor:nb, level, phase:"found",
            codeHL:[13,14], allEdges:[...allEdges], levelNodes:{...levelNodes},
            path, foundPath:path,
          });
          break;
        }
        const d=wlDiffChar(word,nb);
        nextQ.push([nb,nextLvl]);
        steps.push({
          title:`"${word}" \u2192 "${nb}" \u2014 New Word`,
          detail:`Change '${d.from}'\u2192'${d.to}' at pos ${d.pos}. Mark visited, enqueue at level ${level}.`,
          visited:new Set(visited), queue:[...nextQ,...queue.filter(([w])=>w!==word)].map(x=>[...x]),
          current:word, neighbor:nb, level:level-1, phase:"discover",
          codeHL:[15,16,17], allEdges:[...allEdges], levelNodes:{...levelNodes},
          path:[], foundPath:null,
        });
      }
      if(found)break;
    }
    if(!found)queue=nextQ;
  }
  return steps;
}

/* ─────────────────────────────────────────────
   LC 773: Sliding Puzzle — [[4,1,2],[5,0,3]]
   ───────────────────────────────────────────── */
const SP_BOARD=[[4,1,2],[5,0,3]];
const SP_TARGET="123450";
const SP_R=2, SP_C=3;
const SP_DIRS=[[0,1],[0,-1],[1,0],[-1,0]];
const SP_DNAMES=["\u2192","\u2190","\u2193","\u2191"];

function spSer(b){return b.flat().join("");}
function spDes(s){return[[+s[0],+s[1],+s[2]],[+s[3],+s[4],+s[5]]];}
function spFindZero(s){const i=s.indexOf("0");return[Math.floor(i/SP_C),i%SP_C];}

function spNeighbors(s){
  const b=spDes(s);const[zr,zc]=spFindZero(s);const res=[];
  for(let d=0;d<4;d++){
    const[dr,dc]=SP_DIRS[d];const nr=zr+dr,nc=zc+dc;
    if(nr<0||nr>=SP_R||nc<0||nc>=SP_C)continue;
    const nb=b.map(r=>[...r]);
    [nb[zr][zc],nb[nr][nc]]=[nb[nr][nc],nb[zr][zc]];
    res.push({state:spSer(nb),tile:b[nr][nc],dir:SP_DNAMES[d]});
  }
  return res;
}

function buildP1Steps(){
  const steps=[];
  const start=spSer(SP_BOARD);
  const visited=new Set([start]);
  let queue=[start];
  const parent={[start]:null};
  const byLevel={0:[start]};
  let depth=0;

  steps.push({
    title:"Initialize \u2014 Sliding Puzzle",
    detail:`Board: [${SP_BOARD[0]}|${SP_BOARD[1]}]. Target: [1,2,3|4,5,0]. Each move slides a tile into the blank. BFS finds minimum moves.`,
    visited:new Set(visited), queue:[...queue],
    current:null, phase:"init", codeHL:[0,1,2,3,4],
    path:[], boardState:start, level:0, expanded:0,
    byLevel:{...byLevel},
  });

  let found=false, expanded=0;
  while(queue.length&&!found){
    const nxt=[];depth++;
    for(const u of queue){
      if(found)break;
      expanded++;
      const nbrs=spNeighbors(u);
      const newNbs=[];

      for(const{state:v,tile,dir}of nbrs){
        if(visited.has(v))continue;
        visited.add(v);parent[v]=u;
        if(!byLevel[depth])byLevel[depth]=[];
        byLevel[depth].push(v);
        nxt.push(v);
        newNbs.push({state:v,tile,dir});

        if(v===SP_TARGET){
          found=true;
          const path=[];let c=v;while(c!==null){path.unshift(c);c=parent[c];}
          steps.push({
            title:`\u2713 Solved! Move tile ${tile} ${dir}`,
            detail:`Board matches target after ${path.length-1} moves. ${expanded} states expanded.`,
            visited:new Set(visited), queue:[],
            current:v, phase:"found", codeHL:[8,9],
            path, boardState:v, level:depth, expanded,
            byLevel:{...byLevel},
          });
          break;
        }
      }

      if(!found&&newNbs.length>0){
        steps.push({
          title:`Expand ${u.split("").map((c,i)=>i===3?"|"+c:c).join("")} (Level ${depth})`,
          detail:`Slide tiles: ${newNbs.map(n=>`${n.tile}${n.dir}`).join(", ")}. ${newNbs.length} new state(s).`,
          visited:new Set(visited), queue:[...nxt],
          current:u, phase:"expand", codeHL:[5,6,7,8],
          path:[], boardState:u, level:depth, expanded,
          byLevel:{...byLevel},
        });
      }
    }
    if(!found)queue=nxt;
  }
  return steps;
}

/* ─────────────────────────────────────────────
   LC 752: Open the Lock — "0000" -> "0202"
   ───────────────────────────────────────────── */
const OL_START="0000", OL_TARGET="0202";
const OL_DEAD=["0201","0101","0102","1212","2002"];

function olNeighbors(s){
  const res=[];
  for(let i=0;i<4;i++){
    const d=parseInt(s[i]);
    for(const delta of[1,-1]){
      const nd=(d+delta+10)%10;
      res.push({state:s.slice(0,i)+nd+s.slice(i+1),wheel:i,from:s[i],to:String(nd),dir:delta===1?"+":"-"});
    }
  }
  return res;
}

function buildP2Steps(){
  const steps=[];
  const deadSet=new Set(OL_DEAD);
  const visited=new Set([OL_START,...OL_DEAD]);
  let queue=[OL_START];
  const parent={[OL_START]:null};
  let depth=0, expanded=0;

  steps.push({
    title:"Initialize \u2014 Open the Lock",
    detail:`Start: "${OL_START}". Target: "${OL_TARGET}". ${OL_DEAD.length} deadends: [${OL_DEAD.join(", ")}]. Each turn rotates 1 wheel \u00b11. BFS finds min turns.`,
    visited:new Set([OL_START]), queue:[...queue],
    current:null, phase:"init", codeHL:[0,1,2,3,4,5],
    path:[], lockState:OL_START, level:0, expanded:0,
    deadHit:[], queueSize:1, exploredCount:1,
  });

  let found=false;
  while(queue.length&&!found){
    const nxt=[];depth++;
    for(const u of queue){
      if(found)break;
      expanded++;
      const nbrs=olNeighbors(u);
      const newNbs=[], deadHits=[];

      for(const{state:v,wheel,from,to,dir}of nbrs){
        if(deadSet.has(v)&&!visited.has(v)){
          deadHits.push(v);visited.add(v);
          continue;
        }
        if(visited.has(v))continue;
        visited.add(v);parent[v]=u;nxt.push(v);
        newNbs.push({state:v,wheel,from,to,dir});

        if(v===OL_TARGET){
          found=true;
          const path=[];let c=v;while(c!==null){path.unshift(c);c=parent[c];}
          steps.push({
            title:`\u2713 Lock Opened! Wheel ${wheel}: ${from}\u2192${to}`,
            detail:`Reached "${OL_TARGET}" in ${path.length-1} turns. ${expanded} states expanded. Path: ${path.join(" \u2192 ")}.`,
            visited:new Set([...visited].filter(v=>!deadSet.has(v))),
            queue:[], current:v, phase:"found", codeHL:[11,12],
            path, lockState:v, level:depth, expanded,
            deadHit:[], queueSize:0, exploredCount:visited.size-deadSet.size,
          });
          break;
        }
      }

      if(!found){
        const deadMsg=deadHits.length>0?` ${deadHits.length} deadend(s) blocked.`:"";
        steps.push({
          title:`Turn from "${u}" (Level ${depth})`,
          detail:`8 neighbors, ${newNbs.length} new, ${deadHits.length} deadends.${deadMsg} Queue: ${nxt.length}.`,
          visited:new Set([...visited].filter(v=>!deadSet.has(v))),
          queue:nxt.slice(0,8), current:u, phase:"expand", codeHL:[7,8,9,10,11],
          path:[], lockState:u, level:depth, expanded,
          deadHit:deadHits, queueSize:nxt.length,
          exploredCount:visited.size-deadSet.size,
        });
      }
    }
    if(!found)queue=nxt;
  }
  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title:"Algorithm", lc:null, difficulty:null, tag:"Implicit Graph",
    coreIdea:"The graph is not given explicitly \u2014 each word is a state, and two words are connected if they differ by exactly one letter. BFS explores states level by level, so the first time we reach the target it is via the shortest transformation. This pattern applies to any \"minimum moves to reach X\" problem.",
    buildSteps:buildAlgSteps,
    stateType:"wordladder",
    code:[
      {id:0,text:"from collections import deque"},{id:1,text:""},
      {id:2,text:"def ladderLength(begin, end, wordList):"},
      {id:3,text:"    word_set = set(wordList)"},
      {id:4,text:"    queue = deque([(begin, 1)])"},
      {id:5,text:"    visited = {begin}"},
      {id:6,text:""},
      {id:7,text:"    while queue:"},
      {id:8,text:"        word, length = queue.popleft()"},
      {id:9,text:""},
      {id:10,text:"        for i in range(len(word)):"},
      {id:11,text:"          for c in 'abcdefghijklmnopqrstuvwxyz':"},
      {id:12,text:"            nxt = word[:i] + c + word[i+1:]"},
      {id:13,text:"            if nxt == end:"},
      {id:14,text:"                return length + 1"},
      {id:15,text:"            if nxt in word_set and nxt not in visited:"},
      {id:16,text:"                visited.add(nxt)"},
      {id:17,text:"                queue.append((nxt, length + 1))"},
      {id:18,text:""},{id:19,text:"    return 0"},
    ],
  },
  sliding: {
    title:"Sliding Puzzle", lc:"773", difficulty:"Hard", tag:"Board Config",
    coreIdea:"A 2\u00d73 board with tiles 1-5 and a blank. Each state is a board configuration (720 possible). Slide a tile into the blank to transition. BFS on the state space finds the minimum number of moves to reach the goal configuration [1,2,3,4,5,0].",
    buildSteps:buildP1Steps,
    stateType:"sliding",
    code:[
      {id:0,text:"def slidingPuzzle(board):"},
      {id:1,text:"    target = '123450'"},
      {id:2,text:"    start = ''.join(str(c) for r in board for c in r)"},
      {id:3,text:"    q = deque([start])"},
      {id:4,text:"    vis = {start}; depth = 0"},
      {id:5,text:"    while q:"},
      {id:6,text:"        for _ in range(len(q)):"},
      {id:7,text:"            s = q.popleft()"},
      {id:8,text:"            if s == target: return depth"},
      {id:9,text:"            i = s.index('0')"},
      {id:10,text:"            for j in neighbors[i]:"},
      {id:11,text:"                ns = list(s)"},
      {id:12,text:"                ns[i],ns[j] = ns[j],ns[i]"},
      {id:13,text:"                ns = ''.join(ns)"},
      {id:14,text:"                if ns not in vis:"},
      {id:15,text:"                    vis.add(ns)"},
      {id:16,text:"                    q.append(ns)"},
      {id:17,text:"        depth += 1"},
      {id:18,text:""},{id:19,text:"    return -1"},
    ],
  },
  openlock: {
    title:"Open the Lock", lc:"752", difficulty:"Medium", tag:"Combo State",
    coreIdea:`Start at "0000", reach the target by turning one wheel \u00b11 per move. Some combinations are deadends (instant lock). Each state is a 4-digit string with 8 neighbors. BFS finds the minimum turns, treating deadends as walls in the implicit state graph of 10,000 nodes.`,
    buildSteps:buildP2Steps,
    stateType:"lock",
    code:[
      {id:0,text:"def openLock(deadends, target):"},
      {id:1,text:"    dead = set(deadends)"},
      {id:2,text:"    if '0000' in dead: return -1"},
      {id:3,text:"    q = deque(['0000'])"},
      {id:4,text:"    vis = {'0000'} | dead"},
      {id:5,text:"    depth = 0"},
      {id:6,text:""},
      {id:7,text:"    while q:"},
      {id:8,text:"        for _ in range(len(q)):"},
      {id:9,text:"            s = q.popleft()"},
      {id:10,text:"            if s == target: return depth"},
      {id:11,text:"            for i in range(4):"},
      {id:12,text:"              for d in (1, -1):"},
      {id:13,text:"                ns = s[:i]+str((int(s[i])+d)%10)+s[i+1:]"},
      {id:14,text:"                if ns not in vis:"},
      {id:15,text:"                    vis.add(ns)"},
      {id:16,text:"                    q.append(ns)"},
      {id:17,text:"        depth += 1"},
      {id:18,text:""},{id:19,text:"    return -1"},
    ],
  },
};

/* ═══════════════════════════════════════════
   STATE VISUALIZATION COMPONENTS
   ═══════════════════════════════════════════ */

/* Word Ladder BFS Tree */
function WordLadderView({ step }) {
  const {visited,current,neighbor,allEdges,path,foundPath}=step;
  const levels=step.levelNodes||{};
  const positions={};

  Object.entries(levels).forEach(([lvl,ws])=>{
    const l=parseInt(lvl);
    const w=440, spacing=w/(ws.length+1);
    ws.forEach((word,i)=>{positions[word]={x:spacing*(i+1),y:45+l*65};});
  });

  const pathSet=new Set(path||[]);
  const pathEdges=new Set();
  for(let i=0;i<(path||[]).length-1;i++) pathEdges.add(`${path[i]}-${path[i+1]}`);

  return (
    <svg viewBox="0 0 440 360" className="w-full" style={{maxHeight:280}}>
      {(allEdges||[]).map(([from,to],i)=>{
        if(!positions[from]||!positions[to])return null;
        const f=positions[from],t=positions[to];
        const dx=t.x-f.x,dy=t.y-f.y,len=Math.sqrt(dx*dx+dy*dy);
        const r=26;
        const sx=f.x+(dx/len)*r,sy=f.y+(dy/len)*r;
        const ex=t.x-(dx/len)*r,ey=t.y-(dy/len)*r;
        const isPath=pathEdges.has(`${from}-${to}`);
        const isActive=current===from&&neighbor===to;
        return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey}
          stroke={isPath?"#10b981":isActive?"#f59e0b":"#3f3f46"}
          strokeWidth={isPath?3:isActive?2.5:1.5} />;
      })}
      {[...visited].map(w=>{
        if(!positions[w])return null;
        const pos=positions[w];
        const isCurr=current===w;
        const isNb=neighbor===w;
        const isOnPath=pathSet.has(w);
        const fill=isOnPath?"#10b981":isCurr?"#3b82f6":isNb?"#f59e0b":"#27272a";
        const stroke=isOnPath?"#059669":isCurr?"#2563eb":isNb?"#d97706":"#52525b";
        return (
          <g key={w}>
            <rect x={pos.x-24} y={pos.y-14} width={48} height={28} rx={8} fill={fill} stroke={stroke} strokeWidth={2} />
            <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="11" fontWeight="700" fontFamily="monospace">{w}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* Sliding Puzzle Board */
function SlidingBoardView({ step }) {
  const state=step.boardState||spSer(SP_BOARD);
  const board=spDes(state);
  const isGoal=state===SP_TARGET;
  const pathSet=new Set(step.path||[]);
  const onPath=pathSet.has(state);

  return (
    <svg viewBox="0 0 240 180" className="w-full" style={{maxHeight:200}}>
      {board.map((row,r)=>row.map((tile,c)=>{
        const x=30+c*65, y=20+r*70;
        const isBlank=tile===0;
        const fill=isBlank?"#18181b":onPath||isGoal?"#059669":"#27272a";
        const stroke=isBlank?"#3f3f46":onPath||isGoal?"#10b981":"#52525b";
        return (
          <g key={`${r}-${c}`}>
            <rect x={x} y={y} width={55} height={55} rx={8} fill={fill} stroke={stroke} strokeWidth={2} />
            {!isBlank && (
              <text x={x+27.5} y={y+29} textAnchor="middle" dominantBaseline="central"
                fill={onPath||isGoal?"#a7f3d0":"#d4d4d8"} fontSize="22" fontWeight="700" fontFamily="monospace">{tile}</text>
            )}
          </g>
        );
      }))}
      {step.phase==="found"&&(
        <text x={120} y={165} textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700">{"\u2713"} SOLVED</text>
      )}
    </svg>
  );
}

/* Lock Wheels */
function LockWheelView({ step }) {
  const state=step.lockState||OL_START;
  const digits=state.split("").map(Number);
  const isTarget=state===OL_TARGET;

  return (
    <svg viewBox="0 0 280 140" className="w-full" style={{maxHeight:160}}>
      {digits.map((d,i)=>{
        const x=40+i*60, y=20;
        const prevD=(d+9)%10, nextD=(d+1)%10;
        const fill=isTarget?"#059669":"#27272a";
        return (
          <g key={i}>
            <text x={x+20} y={y+10} textAnchor="middle" fill="#52525b" fontSize="14" fontFamily="monospace">{prevD}</text>
            <rect x={x} y={y+16} width={40} height={44} rx={6} fill={fill} stroke={isTarget?"#10b981":"#52525b"} strokeWidth={2} />
            <text x={x+20} y={y+42} textAnchor="middle" dominantBaseline="central"
              fill={isTarget?"#a7f3d0":"#f4f4f5"} fontSize="24" fontWeight="700" fontFamily="monospace">{d}</text>
            <text x={x+20} y={y+76} textAnchor="middle" fill="#52525b" fontSize="14" fontFamily="monospace">{nextD}</text>
            <text x={x+20} y={y+100} textAnchor="middle" fill="#3f3f46" fontSize="9">W{i}</text>
          </g>
        );
      })}
      {step.deadHit&&step.deadHit.length>0&&(
        <g>
          <text x={140} y={130} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="600">
            {"\u26a0"} Deadend: {step.deadHit.join(", ")}
          </text>
        </g>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════ */

function IOPanel({ step, problem }) {
  const {phase}=step;
  const done=phase==="found";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Problem</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{whiteSpace:"pre"}}>
          {problem.stateType==="wordladder"&&<>
            <div><span className="text-zinc-500">begin   </span>= <span className="text-blue-400">"{WL_BEGIN}"</span></div>
            <div><span className="text-zinc-500">end     </span>= <span className="text-red-400">"{WL_END}"</span></div>
            <div><span className="text-zinc-500">words   </span>= <span className="text-zinc-300">{WL_LIST.length}</span></div>
          </>}
          {problem.stateType==="sliding"&&<>
            <div><span className="text-zinc-500">board</span>= <span className="text-zinc-300">[{SP_BOARD[0].join(",")}|{SP_BOARD[1].join(",")}]</span></div>
            <div><span className="text-zinc-500">goal </span>= <span className="text-zinc-300">[1,2,3|4,5,0]</span></div>
            <div><span className="text-zinc-500">states</span>= <span className="text-zinc-300">6!=720 max</span></div>
          </>}
          {problem.stateType==="lock"&&<>
            <div><span className="text-zinc-500">start</span>= <span className="text-blue-400">"{OL_START}"</span></div>
            <div><span className="text-zinc-500">target</span>= <span className="text-red-400">"{OL_TARGET}"</span></div>
            <div><span className="text-zinc-500">dead </span>= <span className="text-zinc-300">[{OL_DEAD.join(",")}]</span></div>
          </>}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">State</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{"\u2713"} DONE</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          {step.level!==undefined&&(
            <div><span className="text-zinc-500">level   </span>= <span className="text-zinc-300">{step.level}</span></div>
          )}
          {step.expanded!==undefined&&(
            <div><span className="text-zinc-500">expanded</span>= <span className={done?"text-emerald-300 font-bold":"text-zinc-300"}>{step.expanded}</span></div>
          )}
          {step.exploredCount!==undefined&&(
            <div><span className="text-zinc-500">explored</span>= <span className="text-zinc-300">{step.exploredCount}</span></div>
          )}
          {step.queueSize!==undefined&&(
            <div><span className="text-zinc-500">queue   </span>= <span className="text-zinc-300">{step.queueSize}</span></div>
          )}
          {done&&step.path&&step.path.length>0&&(
            <div><span className="text-zinc-500">moves   </span>= <span className="text-emerald-300 font-bold">{step.path.length-1}</span></div>
          )}
        </div>
      </div>

      {done&&step.path&&step.path.length>0&&(
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Path</div>
          <div className="font-mono text-[10px] text-emerald-300 leading-relaxed break-all">
            {step.path.join(" \u2192 ")}
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
export default function BFSStateSpaceViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];
  const steps = useMemo(() => problem.buildSteps(), [pKey]);
  const step = steps[Math.min(si, steps.length-1)];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  const StateView = problem.stateType==="wordladder" ? WordLadderView
    : problem.stateType==="sliding" ? SlidingBoardView
    : LockWheelView;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{fontFamily:"'IBM Plex Sans', system-ui, sans-serif"}}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BFS on State Space</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Implicit Graphs {"\u2014"} Minimum Moves to Transform State</p>
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
            {problem.difficulty && <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              problem.difficulty==="Hard"?"bg-red-900/50 text-red-400":"bg-amber-900/50 text-amber-400"
            }`}>{problem.difficulty}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">{problem.tag}</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        <div className="mb-3">
          <NavBar si={Math.min(si,steps.length-1)} setSi={setSi} total={steps.length} />
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} problem={problem} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">
                {problem.stateType==="wordladder"?"BFS tree \u2014 levels = transformation steps":
                 problem.stateType==="sliding"?"Current board state":
                 "Lock wheels \u2014 each turn \u00b11"}
              </div>
              <StateView step={step} />
              {problem.stateType==="wordladder"&&(
                <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Current</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Neighbor</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Path</span>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${step.phase==="found"?"bg-emerald-950/30 border-emerald-900":"bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si,steps.length-1)+1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase==="found"?"bg-emerald-900 text-emerald-300":
                  step.phase==="discover"||step.phase==="expand"?"bg-blue-900 text-blue-300":
                  step.phase==="process"?"bg-blue-900 text-blue-300":
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Queue preview */}
            {step.queue&&(
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Queue ({Array.isArray(step.queue)?step.queue.length:0})</div>
                <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                  {(Array.isArray(step.queue)&&step.queue.length>0)
                    ? step.queue.slice(0,10).map((item,i)=>{
                        const label=Array.isArray(item)?item[0]:item;
                        const sub=Array.isArray(item)?`L${item[1]-1}`:null;
                        return (
                          <span key={i} className="inline-flex items-center gap-0.5 px-1.5 h-7 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-[10px]">
                            {String(label).length>6?String(label).slice(0,5)+"..":label}
                            {sub&&<span className="text-blue-600 text-[9px]">{sub}</span>}
                          </span>
                        );
                      })
                    : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                  {Array.isArray(step.queue)&&step.queue.length>10&&<span className="text-[10px] text-zinc-700">+{step.queue.length-10}</span>}
                </div>
              </div>
            )}

            {/* Level summary for sliding/lock */}
            {(problem.stateType==="sliding"||problem.stateType==="lock")&&step.phase==="found"&&step.path&&(
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Move Sequence</div>
                <div className="flex gap-1.5 items-center flex-wrap">
                  {step.path.map((s,i)=>(
                    <span key={i} className="flex items-center gap-1">
                      <span className={`inline-flex items-center px-2 h-7 rounded-lg font-mono font-bold text-[10px] ${
                        i===0?"bg-blue-950 border border-blue-800 text-blue-300":
                        i===step.path.length-1?"bg-emerald-950 border border-emerald-800 text-emerald-300":
                        "bg-zinc-800 border border-zinc-700 text-zinc-300"
                      }`}>
                        {problem.stateType==="sliding"?s.split("").map((c2,j)=>j===3?"|"+c2:c2).join(""):s}
                      </span>
                      {i<step.path.length-1&&<span className="text-zinc-700">{"\u2192"}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Word ladder: words by level */}
            {problem.stateType==="wordladder"&&step.levelNodes&&(
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Words by Level</div>
                <div className="space-y-1">
                  {Object.entries(step.levelNodes).map(([lvl,ws])=>(
                    ws&&ws.length>0&&(
                      <div key={lvl} className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-600 font-mono w-6">L{lvl}:</span>
                        <div className="flex gap-1 flex-wrap">
                          {ws.map(w=>{
                            const isOnPath=step.foundPath&&step.foundPath.includes(w);
                            return (
                              <span key={w} className={`inline-flex items-center px-1.5 h-5 rounded text-[10px] font-mono font-bold ${
                                isOnPath?"bg-emerald-950 border border-emerald-800 text-emerald-300":"bg-zinc-800 border border-zinc-700 text-zinc-400"
                              }`}>{w}</span>
                            );
                          })}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {step.phase==="found"&&step.path&&step.path.length>0&&problem.stateType==="wordladder"&&(
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Shortest Ladder (length {step.path.length})</div>
                <div className="flex gap-1 items-center font-mono text-xs flex-wrap">
                  {step.path.map((w,i)=>(
                    <span key={i} className="flex items-center gap-1">
                      <span className="inline-flex items-center px-2 h-7 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">{w}</span>
                      {i<step.path.length-1&&<span className="text-emerald-700">{"\u2192"}</span>}
                    </span>
                  ))}
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
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use State-Space BFS</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Minimum moves/operations to transform one state to another</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Puzzle solving {"\u2014"} sliding puzzles, lock combos, word ladders</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Implicit graphs {"\u2014"} states generated on the fly, not pre-built</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Unweighted shortest path where each transition costs 1</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(States {"\u00d7"} Branching)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(States) for visited + queue</div>
                <div><span className="text-zinc-500 font-semibold">Key:</span> Bound the state space to avoid TLE</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 127 {"\u2014"} Word Ladder</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 752 {"\u2014"} Open the Lock</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 773 {"\u2014"} Sliding Puzzle</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 433 {"\u2014"} Minimum Genetic Mutation</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 815 {"\u2014"} Bus Routes</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 847 {"\u2014"} Shortest Path Visiting All Nodes</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}