import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   Bidirectional BFS -- Algorithm + 2 Problem Showcase
   1. Algorithm              -- 10-node graph, bidir vs standard toggle
   2. LC 127 -- Word Ladder  -- transform hit->cog via 1-char diffs
   3. LC 433 -- Gene Mutation -- 8-gene bank, mutate one char at a time
   ═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   ALGORITHM TAB: 10-node undirected graph
   ───────────────────────────────────────────── */
const ALG_N = 10;
const ALG_EDGES = [
  [0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,6],[4,6],[4,7],[5,7],[5,8],[6,9],[7,9],[8,9],
];
const ALG_POS = [
  {x:40,y:160},{x:130,y:80},{x:130,y:240},{x:240,y:40},{x:240,y:160},
  {x:240,y:280},{x:370,y:80},{x:370,y:200},{x:370,y:300},{x:480,y:160},
];
const ALG_SRC = 0, ALG_TGT = 9;
const ALG_ADJ = (() => {
  const adj = Array.from({length:ALG_N},()=>[]);
  for (const [u,v] of ALG_EDGES) { adj[u].push(v); adj[v].push(u); }
  for (let i=0;i<ALG_N;i++) adj[i].sort((a,b)=>a-b);
  return adj;
})();

/* ─────────────────────────────────────────────
   LC 127: Word Ladder -- hit -> cog
   ───────────────────────────────────────────── */
const WL_BEGIN = "hit", WL_END = "cog";
const WL_WORDS = [WL_BEGIN,"hot","dot","dog","lot","log",WL_END];
const WL_POS = [
  {x:40,y:160},  // hit
  {x:160,y:160}, // hot
  {x:280,y:80},  // dot
  {x:400,y:80},  // dog
  {x:280,y:240}, // lot
  {x:400,y:240}, // log
  {x:500,y:160}, // cog
];
function wlDiff1(a,b){let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;return d===1;}
const WL_ADJ = {};
for(const w of WL_WORDS) WL_ADJ[w]=[];
for(let i=0;i<WL_WORDS.length;i++)
  for(let j=i+1;j<WL_WORDS.length;j++)
    if(wlDiff1(WL_WORDS[i],WL_WORDS[j])){
      WL_ADJ[WL_WORDS[i]].push(WL_WORDS[j]);
      WL_ADJ[WL_WORDS[j]].push(WL_WORDS[i]);
    }

/* ─────────────────────────────────────────────
   LC 433: Minimum Genetic Mutation
   ───────────────────────────────────────────── */
const GM_START = "AAAAACCC", GM_END = "AATTACCC";
const GM_BANK = ["AAAACCCC","AAACCCCC","AACCCCCC","AATTCCCC","AATTACCC","AAAACCCA","AAATCCCC"];
const GM_WORDS = [GM_START,...GM_BANK];
const GM_POS = [
  {x:40,y:160},  // AAAAACCC (start)
  {x:170,y:100}, // AAAACCCC
  {x:300,y:50},  // AAACCCCC
  {x:430,y:50},  // AACCCCCC
  {x:430,y:270}, // AATTCCCC
  {x:540,y:160}, // AATTACCC (end)
  {x:170,y:260}, // AAAACCCA
  {x:300,y:200}, // AAATCCCC
];
function gmDiff1(a,b){let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])d++;return d===1;}
const GM_ADJ = {};
for(const w of GM_WORDS) GM_ADJ[w]=[];
for(let i=0;i<GM_WORDS.length;i++)
  for(let j=i+1;j<GM_WORDS.length;j++)
    if(gmDiff1(GM_WORDS[i],GM_WORDS[j])){
      GM_ADJ[GM_WORDS[i]].push(GM_WORDS[j]);
      GM_ADJ[GM_WORDS[j]].push(GM_WORDS[i]);
    }

/* ═══════════════════════════════════════════════════════
   Generic Bidirectional BFS step builder
   ═══════════════════════════════════════════════════════ */
function buildBidirSteps(adj, src, tgt) {
  const steps = [];
  const visitedF = new Set([src]), visitedB = new Set([tgt]);
  const parentF = {[src]:null}, parentB = {[tgt]:null};
  let qF = [src], qB = [tgt];
  let levelF = 0, levelB = 0, expanded = 0;

  const snap = () => ({
    visitedF:new Set(visitedF), visitedB:new Set(visitedB),
    queueF:[...qF], queueB:[...qB],
  });

  steps.push({
    title:"Initialize \u2014 BFS from Both Ends",
    detail:`Forward: [${src}]. Backward: [${tgt}]. Alternate until frontiers overlap.`,
    ...snap(), current:null, neighbors:[], phase:"init",
    codeHL:[2,3,4,5], path:[], meetNode:null,
    direction:null, levelF, levelB, expanded,
  });

  let found = false, meetNode = null;

  while (qF.length && qB.length && !found) {
    const nextF = []; levelF++;
    for (const u of qF) {
      if (found) break;
      const nbs = [];
      for (const v of (adj[u]||[])) {
        if (visitedF.has(v)) continue;
        visitedF.add(v); parentF[v]=u; nextF.push(v); nbs.push(v); expanded++;
        if (visitedB.has(v)) {
          meetNode=v; found=true;
          const pF=[];let c=v;while(c!==null){pF.unshift(c);c=parentF[c];}
          const pB=[];c=parentB[v];while(c!==null){pB.push(c);c=parentB[c];}
          const fullPath=[...pF,...pB];
          steps.push({
            title:`\u2713 Frontiers Meet at ${v}`,
            detail:`Forward reached ${v}, already in backward set. Path length: ${fullPath.length-1}. ${expanded} expansions.`,
            visitedF:new Set(visitedF), visitedB:new Set(visitedB),
            queueF:[...nextF], queueB:[...qB],
            current:v, neighbors:[], phase:"done",
            codeHL:[11,12,13], path:fullPath, meetNode:v,
            direction:"forward", levelF, levelB, expanded,
          });
          break;
        }
      }
      if (!found && nbs.length>0) {
        steps.push({
          title:`Forward: Expand ${u} (Level ${levelF})`,
          detail:`New neighbors: [${nbs.join(", ")}]. Forward frontier grows.`,
          visitedF:new Set(visitedF), visitedB:new Set(visitedB),
          queueF:[...nextF], queueB:[...qB],
          current:u, neighbors:nbs, phase:"expandF",
          codeHL:[8,9,10,11,12,13], path:[], meetNode:null,
          direction:"forward", levelF, levelB, expanded,
        });
      }
    }
    qF = nextF;
    if (found) break;

    const nextB = []; levelB++;
    for (const u of qB) {
      if (found) break;
      const nbs = [];
      for (const v of (adj[u]||[])) {
        if (visitedB.has(v)) continue;
        visitedB.add(v); parentB[v]=u; nextB.push(v); nbs.push(v); expanded++;
        if (visitedF.has(v)) {
          meetNode=v; found=true;
          const pF=[];let c=v;while(c!==null){pF.unshift(c);c=parentF[c];}
          const pB=[];c=parentB[v];while(c!==null){pB.push(c);c=parentB[c];}
          const fullPath=[...pF,...pB];
          steps.push({
            title:`\u2713 Frontiers Meet at ${v}`,
            detail:`Backward reached ${v}, already in forward set. Path length: ${fullPath.length-1}. ${expanded} expansions.`,
            visitedF:new Set(visitedF), visitedB:new Set(visitedB),
            queueF:[...qF], queueB:[...nextB],
            current:v, neighbors:[], phase:"done",
            codeHL:[17,18,19], path:fullPath, meetNode:v,
            direction:"backward", levelF, levelB, expanded,
          });
          break;
        }
      }
      if (!found && nbs.length>0) {
        steps.push({
          title:`Backward: Expand ${u} (Level ${levelB})`,
          detail:`New neighbors: [${nbs.join(", ")}]. Backward frontier grows.`,
          visitedF:new Set(visitedF), visitedB:new Set(visitedB),
          queueF:[...qF], queueB:[...nextB],
          current:u, neighbors:nbs, phase:"expandB",
          codeHL:[15,16,17,18,19], path:[], meetNode:null,
          direction:"backward", levelF, levelB, expanded,
        });
      }
    }
    qB = nextB;
  }
  return steps;
}

function buildStdBfsSteps(adj, src, tgt) {
  const steps = [];
  const visited = new Set([src]);
  const parent = {[src]:null};
  let queue = [src], level = 0, expanded = 0;

  steps.push({
    title:"Initialize \u2014 Standard BFS",
    detail:`Queue = [${src}]. Single-direction BFS expands level by level.`,
    visitedF:new Set(visited), visitedB:new Set(),
    queueF:[...queue], queueB:[], current:null, neighbors:[],
    phase:"init", codeHL:[2,3,4,5], path:[], meetNode:null,
    direction:"forward", levelF:0, levelB:0, expanded:0,
  });

  let found = false;
  while (queue.length && !found) {
    const nextQ = []; level++;
    for (const u of queue) {
      if (found) break;
      const nbs = [];
      for (const v of (adj[u]||[])) {
        if (visited.has(v)) continue;
        visited.add(v); parent[v]=u; nextQ.push(v); nbs.push(v); expanded++;
        if (String(v)===String(tgt)) {
          found=true;
          const path=[];let c=v;while(c!==null){path.unshift(c);c=parent[c];}
          steps.push({
            title:`\u2713 Target Found at ${v} (Level ${level})`,
            detail:`Standard BFS reached target. Path: ${path.join("\u2192")}. ${expanded} expansions.`,
            visitedF:new Set(visited), visitedB:new Set(),
            queueF:[...nextQ], queueB:[], current:v, neighbors:[],
            phase:"done", codeHL:[11,12,13], path, meetNode:null,
            direction:"forward", levelF:level, levelB:0, expanded,
          });
          break;
        }
      }
      if (!found && nbs.length>0) {
        steps.push({
          title:`Expand ${u} (Level ${level})`,
          detail:`New: [${nbs.join(", ")}]. ${expanded} expansions so far.`,
          visitedF:new Set(visited), visitedB:new Set(),
          queueF:[...nextQ], queueB:[], current:u, neighbors:nbs,
          phase:"expandF", codeHL:[8,9,10,11], path:[], meetNode:null,
          direction:"forward", levelF:level, levelB:0, expanded,
        });
      }
    }
    queue = nextQ;
  }
  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title:"Algorithm", lc:null, difficulty:null, tag:"Core Pattern",
    coreIdea: {
      bidirectional: "Run BFS simultaneously from source and target. When the two frontiers touch, the shortest path is found. With branching factor b and depth d, standard BFS explores O(b^d) nodes \u2014 bidirectional explores only O(b^(d/2)) from each side.",
      standard: "Standard BFS expands one level at a time from the source. It guarantees shortest path in unweighted graphs but explores all directions equally \u2014 often visiting many irrelevant nodes."
    },
    hasToggle: true,
    adj: ALG_ADJ, src: ALG_SRC, tgt: ALG_TGT,
    nodes: Array.from({length:ALG_N},(_,i)=>i),
    labels: Array.from({length:ALG_N},(_,i)=>String(i)),
    pos: ALG_POS, edges: ALG_EDGES,
    viewBox: "0 0 520 340",
    buildBidir: () => buildBidirSteps(ALG_ADJ, ALG_SRC, ALG_TGT),
    buildStd: () => buildStdBfsSteps(ALG_ADJ, ALG_SRC, ALG_TGT),
    code: [
      {id:0,text:"from collections import deque"},{id:1,text:""},
      {id:2,text:"def bidir_bfs(adj, src, tgt):"},
      {id:3,text:"    visF, visB = {src}, {tgt}"},
      {id:4,text:"    qF, qB = [src], [tgt]"},
      {id:5,text:"    parF, parB = {src:None}, {tgt:None}"},
      {id:6,text:""},
      {id:7,text:"    while qF and qB:"},
      {id:8,text:"        nxF = []"},
      {id:9,text:"        for u in qF:"},
      {id:10,text:"            for v in adj[u]:"},
      {id:11,text:"                if v not in visF:"},
      {id:12,text:"                    visF.add(v); parF[v] = u"},
      {id:13,text:"                    if v in visB:"},
      {id:14,text:"                        return build_path(parF,parB,v)"},
      {id:15,text:"                    nxF.append(v)"},
      {id:16,text:"        qF = nxF"},
      {id:17,text:""},
      {id:18,text:"        nxB = []"},
      {id:19,text:"        for u in qB:"},
      {id:20,text:"            for v in adj[u]:"},
      {id:21,text:"                if v not in visB:"},
      {id:22,text:"                    visB.add(v); parB[v] = u"},
      {id:23,text:"                    if v in visF:"},
      {id:24,text:"                        return build_path(parF,parB,v)"},
      {id:25,text:"                    nxB.append(v)"},
      {id:26,text:"        qB = nxB"},
      {id:27,text:""},{id:28,text:"    return None"},
    ],
    codeStd: [
      {id:0,text:"from collections import deque"},{id:1,text:""},
      {id:2,text:"def bfs(adj, src, tgt):"},
      {id:3,text:"    vis = {src}"},
      {id:4,text:"    queue = [src]"},
      {id:5,text:"    parent = {src: None}"},
      {id:6,text:""},
      {id:7,text:"    while queue:"},
      {id:8,text:"        nxt = []"},
      {id:9,text:"        for u in queue:"},
      {id:10,text:"            for v in adj[u]:"},
      {id:11,text:"                if v not in vis:"},
      {id:12,text:"                    vis.add(v)"},
      {id:13,text:"                    parent[v] = u"},
      {id:14,text:"                    if v == tgt:"},
      {id:15,text:"                        return build_path(parent, v)"},
      {id:16,text:"                    nxt.append(v)"},
      {id:17,text:"        queue = nxt"},
      {id:18,text:""},{id:19,text:"    return None"},
    ],
  },
  wordladder: {
    title:"Word Ladder", lc:"127", difficulty:"Hard", tag:"1-Char Transform",
    coreIdea: "Transform begin word to end word, changing one letter at a time. Each intermediate must be in the dictionary. Model as graph: words are nodes, edges connect 1-char-diff pairs. Bidirectional BFS meets in the middle, pruning the exponential search space.",
    hasToggle: false,
    adj: WL_ADJ, src: WL_BEGIN, tgt: WL_END,
    nodes: WL_WORDS, labels: WL_WORDS,
    pos: WL_POS,
    edges: (() => {
      const e=[];
      for(let i=0;i<WL_WORDS.length;i++)
        for(let j=i+1;j<WL_WORDS.length;j++)
          if(wlDiff1(WL_WORDS[i],WL_WORDS[j])) e.push([i,j]);
      return e;
    })(),
    viewBox: "0 0 540 320",
    buildBidir: () => buildBidirSteps(WL_ADJ, WL_BEGIN, WL_END),
    buildStd: () => buildStdBfsSteps(WL_ADJ, WL_BEGIN, WL_END),
    code: [
      {id:0,text:"def ladderLength(begin, end, wordList):"},{id:1,text:""},
      {id:2,text:"    words = set(wordList)"},
      {id:3,text:"    visF, visB = {begin}, {end}"},
      {id:4,text:"    qF, qB = [begin], [end]"},
      {id:5,text:"    depth = 1"},
      {id:6,text:""},
      {id:7,text:"    while qF and qB:"},
      {id:8,text:"        # always expand smaller set"},
      {id:9,text:"        if len(qF) > len(qB):"},
      {id:10,text:"            qF,qB = qB,qF"},
      {id:11,text:"            visF,visB = visB,visF"},
      {id:12,text:"        nxt = []"},
      {id:13,text:"        for w in qF:"},
      {id:14,text:"          for i in range(len(w)):"},
      {id:15,text:"            for c in 'abc...z':"},
      {id:16,text:"              nw = w[:i]+c+w[i+1:]"},
      {id:17,text:"              if nw in visB: return depth+1"},
      {id:18,text:"              if nw in words and nw not in visF:"},
      {id:19,text:"                visF.add(nw); nxt.append(nw)"},
      {id:20,text:"        qF = nxt; depth += 1"},
      {id:21,text:""},{id:22,text:"    return 0"},
    ],
  },
  genemutation: {
    title:"Gene Mutation", lc:"433", difficulty:"Medium", tag:"Gene Bank",
    coreIdea: "Mutate an 8-char gene string (A,C,G,T) one character at a time; each intermediate must exist in the gene bank. Bidirectional BFS from start and target genes prunes the bank-limited search graph. Meets in the middle after only a few layers.",
    hasToggle: false,
    adj: GM_ADJ, src: GM_START, tgt: GM_END,
    nodes: GM_WORDS, labels: GM_WORDS.map(w => w.slice(0,4)+".."+w.slice(6)),
    pos: GM_POS,
    edges: (() => {
      const e=[];
      for(let i=0;i<GM_WORDS.length;i++)
        for(let j=i+1;j<GM_WORDS.length;j++)
          if(gmDiff1(GM_WORDS[i],GM_WORDS[j])) e.push([i,j]);
      return e;
    })(),
    viewBox: "0 0 580 320",
    buildBidir: () => buildBidirSteps(GM_ADJ, GM_START, GM_END),
    buildStd: () => buildStdBfsSteps(GM_ADJ, GM_START, GM_END),
    code: [
      {id:0,text:"def minMutation(startGene, endGene, bank):"},{id:1,text:""},
      {id:2,text:"    bank = set(bank)"},
      {id:3,text:"    visF, visB = {startGene}, {endGene}"},
      {id:4,text:"    qF, qB = [startGene], [endGene]"},
      {id:5,text:"    depth = 0"},
      {id:6,text:""},
      {id:7,text:"    while qF and qB:"},
      {id:8,text:"        if len(qF) > len(qB):"},
      {id:9,text:"            qF,qB = qB,qF"},
      {id:10,text:"            visF,visB = visB,visF"},
      {id:11,text:"        nxt = []"},
      {id:12,text:"        for g in qF:"},
      {id:13,text:"          for i in range(8):"},
      {id:14,text:"            for c in 'ACGT':"},
      {id:15,text:"              ng = g[:i]+c+g[i+1:]"},
      {id:16,text:"              if ng in visB: return depth+1"},
      {id:17,text:"              if ng in bank and ng not in visF:"},
      {id:18,text:"                visF.add(ng); nxt.append(ng)"},
      {id:19,text:"        qF = nxt; depth += 1"},
      {id:20,text:""},{id:21,text:"    return -1"},
    ],
  },
};

/* ═══════════════════════════════════════════
   VISUALIZATION COMPONENTS
   ═══════════════════════════════════════════ */

function GraphView({ step, problem }) {
  const {visitedF,visitedB,current,path,meetNode,neighbors,direction}=step;
  const nodes=problem.nodes;
  const labels=problem.labels;
  const pos=problem.pos;
  const edges=problem.edges;
  const pathSet=new Set((path||[]).map(String));
  const pathEdges=new Set();
  for(let i=0;i<(path||[]).length-1;i++){
    const a=nodes.indexOf(path[i]),b=nodes.indexOf(path[i+1]);
    if(a>=0&&b>=0){pathEdges.add(`${a}-${b}`);pathEdges.add(`${b}-${a}`);}
  }
  const nbSet=new Set((neighbors||[]).map(String));
  const isStr=typeof nodes[0]==="string";
  const fontSize=isStr?9:14;
  const nodeR=isStr?22:18;

  return (
    <svg viewBox={problem.viewBox} className="w-full" style={{maxHeight:230}}>
      {edges.map(([ui,vi],i)=>{
        const f=pos[ui],t=pos[vi];
        const dx=t.x-f.x,dy=t.y-f.y,len=Math.sqrt(dx*dx+dy*dy);
        const r=nodeR;
        const sx=f.x+(dx/len)*r,sy=f.y+(dy/len)*r;
        const ex=t.x-(dx/len)*r,ey=t.y-(dy/len)*r;
        const isPath=pathEdges.has(`${ui}-${vi}`);
        return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke={isPath?"#10b981":"#27272a"} strokeWidth={isPath?3.5:1.5} />;
      })}
      {nodes.map((node,id)=>{
        const isMeet=String(node)===String(meetNode);
        const isCurr=String(node)===String(current);
        const isNb=nbSet.has(String(node));
        const isPath=pathSet.has(String(node));
        const inF=visitedF.has(node);
        const inB=visitedB.has(node);
        const both=inF&&inB;
        const isSrc=String(node)===String(problem.src);
        const isTgt=String(node)===String(problem.tgt);

        let fill,stroke;
        if(isMeet){fill="#10b981";stroke="#059669";}
        else if(isPath&&step.phase==="done"){fill="#10b981";stroke="#059669";}
        else if(isCurr){fill=direction==="forward"?"#3b82f6":"#f59e0b";stroke=direction==="forward"?"#2563eb":"#d97706";}
        else if(isNb){fill=direction==="forward"?"#1d4ed8":"#b45309";stroke=direction==="forward"?"#3b82f6":"#f59e0b";}
        else if(both){fill="#7c3aed";stroke="#6d28d9";}
        else if(inF){fill="#1e3a5f";stroke="#3b82f6";}
        else if(inB){fill="#422006";stroke="#f59e0b";}
        else{fill="#18181b";stroke="#3f3f46";}

        return (
          <g key={id}>
            <circle cx={pos[id].x} cy={pos[id].y} r={nodeR} fill={fill} stroke={stroke} strokeWidth={isMeet?4:2.5} />
            <text x={pos[id].x} y={pos[id].y+1} textAnchor="middle" dominantBaseline="central"
              fill="#fff" fontSize={fontSize} fontWeight="700" fontFamily="monospace">{labels[id]}</text>
            {isSrc&&!isMeet&&<text x={pos[id].x} y={pos[id].y-nodeR-8} textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="600">SRC</text>}
            {isTgt&&!isMeet&&<text x={pos[id].x} y={pos[id].y-nodeR-8} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">TGT</text>}
          </g>
        );
      })}
    </svg>
  );
}

function IOPanel({ step, problem }) {
  const {phase,expanded,path}=step;
  const done=phase==="done";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{whiteSpace:"pre"}}>
          <div><span className="text-zinc-500">nodes</span>= <span className="text-zinc-300">{problem.nodes.length}</span></div>
          <div><span className="text-zinc-500">edges</span>= <span className="text-zinc-300">{problem.edges.length}</span></div>
          <div><span className="text-zinc-500">src  </span>= <span className="text-blue-400">{String(problem.src)}</span></div>
          <div><span className="text-zinc-500">tgt  </span>= <span className="text-amber-400">{String(problem.tgt)}</span></div>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">State</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{"\u2713"} DONE</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          {done&&path.length>0&&(
            <div><span className="text-zinc-500">length  </span>= <span className="text-emerald-300 font-bold">{path.length-1}</span></div>
          )}
          <div><span className="text-zinc-500">expanded</span>= <span className={done?"text-emerald-300 font-bold":"text-zinc-300"}>{expanded}</span></div>
          <div><span className="text-zinc-500">fwd vis </span>= <span className="text-blue-300">{step.visitedF.size}</span></div>
          <div><span className="text-zinc-500">bwd vis </span>= <span className="text-amber-300">{step.visitedB.size}</span></div>
        </div>
      </div>

      {done&&path.length>0&&(
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Path</div>
          <div className="font-mono text-[10px] text-emerald-300 leading-relaxed">
            {path.join(" \u2192 ")}
          </div>
          {step.meetNode!==null&&(
            <div className="text-[10px] text-zinc-500 mt-1">Meet: <span className="text-purple-400 font-bold">{String(step.meetNode)}</span></div>
          )}
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
        {total<=20
          ? Array.from({length:total}).map((_,i)=>(
              <button key={i} onClick={()=>setSi(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i===si?"bg-blue-500 scale-125":"bg-zinc-700 hover:bg-zinc-500"}`} />
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
export default function BidirectionalBFSViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [subMode, setSubMode] = useState("bidirectional");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];

  const stepsBi = useMemo(() => problem.buildBidir(), [pKey]);
  const stepsStd = useMemo(() => problem.buildStd(), [pKey]);
  const steps = (pKey==="algorithm"&&subMode==="standard") ? stepsStd : stepsBi;
  const step = steps[Math.min(si,steps.length-1)];
  const code = (pKey==="algorithm"&&subMode==="standard") ? problem.codeStd : problem.code;

  const switchProblem = (k) => { setPKey(k); setSubMode("bidirectional"); setSi(0); };
  const switchSub = (m) => { setSubMode(m); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{fontFamily:"'IBM Plex Sans', system-ui, sans-serif"}}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bidirectional BFS</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Search from Both Ends {"\u2014"} Meet in the Middle</p>
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

        {problem.hasToggle && (
          <div className="flex gap-2 mb-3">
            <button onClick={()=>switchSub("bidirectional")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${subMode==="bidirectional"?"bg-purple-600 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              Bidirectional
            </button>
            <button onClick={()=>switchSub("standard")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${subMode==="standard"?"bg-blue-600 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              Standard BFS
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
            {typeof problem.coreIdea==="object"?problem.coreIdea[subMode]:problem.coreIdea}
          </p>
        </div>

        <div className="mb-3">
          <NavBar si={Math.min(si,steps.length-1)} setSi={setSi} total={steps.length} />
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} problem={problem} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{problem.nodes.length}N {problem.edges.length}E</div>
              <GraphView step={step} problem={problem} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1e3a5f] border border-blue-500 inline-block" />Forward</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#422006] border border-amber-500 inline-block" />Backward</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />Both</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Path</span>
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${step.phase==="done"?"bg-emerald-950/30 border-emerald-900":"bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si,steps.length-1)+1}/{steps.length}</span>
                {step.direction && (
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                    step.direction==="forward"?"bg-blue-900 text-blue-300":"bg-amber-900 text-amber-300"
                  }`}>{step.direction}</span>
                )}
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase==="expandF"?"bg-blue-900 text-blue-300":
                  step.phase==="expandB"?"bg-amber-900 text-amber-300":
                  step.phase==="done"?"bg-emerald-900 text-emerald-300":
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase.replace("expandF","expand").replace("expandB","expand")}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1.5">Forward Queue</div>
                  <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                    {step.queueF.length>0 ? step.queueF.slice(0,8).map((n,i)=>(
                      <span key={i} className="inline-flex items-center justify-center px-1.5 h-7 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-[10px]">{String(n).length>5?String(n).slice(0,4)+"..":String(n)}</span>
                    )) : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                    {step.queueF.length>8&&<span className="text-[10px] text-zinc-700">+{step.queueF.length-8}</span>}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Backward Queue</div>
                  <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                    {step.queueB.length>0 ? step.queueB.slice(0,8).map((n,i)=>(
                      <span key={i} className="inline-flex items-center justify-center px-1.5 h-7 rounded-md bg-amber-950 border border-amber-800 text-amber-300 font-mono font-bold text-[10px]">{String(n).length>5?String(n).slice(0,4)+"..":String(n)}</span>
                    )) : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                    {step.queueB.length>8&&<span className="text-[10px] text-zinc-700">+{step.queueB.length-8}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-blue-400">{step.visitedF.size}</div>
                  <div className="text-[9px] text-zinc-600">fwd visited</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-amber-400">{step.visitedB.size}</div>
                  <div className="text-[9px] text-zinc-600">bwd visited</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-purple-400">{step.expanded}</div>
                  <div className="text-[9px] text-zinc-600">expanded</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold font-mono text-emerald-400">{step.path&&step.path.length>0?step.path.length-1:"\u2014"}</div>
                  <div className="text-[9px] text-zinc-600">path len</div>
                </div>
              </div>
            </div>

            {step.phase==="done"&&step.path&&step.path.length>0&&(
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
                  Shortest Path
                  {step.meetNode!==null&&<span className="text-zinc-500 ml-2">(meet at {String(step.meetNode)})</span>}
                </div>
                <div className="font-mono text-[10px] text-emerald-300">
                  {step.path.join(" \u2192 ")}
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
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Shortest path between two specific nodes in unweighted graph</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Large graphs where standard BFS is too slow (social networks, word ladders)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>State-space search with known start and goal states</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>When the graph is implicitly defined (generated on the fly)</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(b^(d/2)) vs O(b^d) for standard BFS</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(b^(d/2)) for each frontier</div>
                <div><span className="text-zinc-500 font-semibold">Requires:</span> Known target + reversible edges</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 127 {"\u2014"} Word Ladder</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 126 {"\u2014"} Word Ladder II</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 752 {"\u2014"} Open the Lock</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 433 {"\u2014"} Minimum Genetic Mutation</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 1345 {"\u2014"} Jump Game IV</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 815 {"\u2014"} Bus Routes</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}