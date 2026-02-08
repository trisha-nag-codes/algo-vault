import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   Union-Find (Disjoint Set) — Algorithm + 4 Problem Showcase
   1. Algorithm                    — 6-node union/find with rank+compression
   2. LC 684 — Redundant Connection — cycle detection via UF
   3. LC 990 — Equality Equations   — constraint satisfaction via UF
   4. LC 305 — Number of Islands II — dynamic grid connectivity
   5. LC 839 — Similar String Groups — grouping by swap similarity
   ═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   ALGORITHM TAB: 6-node union/find ops
   ───────────────────────────────────────────── */
const ALG_N = 6;
const ALG_OPS = [
  {type:"union",a:1,b:2},{type:"union",a:3,b:4},{type:"union",a:0,b:1},
  {type:"union",a:3,b:5},{type:"union",a:0,b:3},{type:"find",node:5},
];
const ALG_POS = [
  {x:60,y:60},{x:180,y:60},{x:300,y:60},
  {x:60,y:200},{x:180,y:200},{x:300,y:200},
];

function buildAlgSteps() {
  const N=ALG_N, OPS=ALG_OPS;
  const parent=Array.from({length:N},(_,i)=>i);
  const rank=new Array(N).fill(0);
  const steps=[], completedOps=[];

  const find=(x)=>{const path=[x];while(parent[x]!==x){x=parent[x];path.push(x);}return{root:x,path};};
  const countComp=()=>{const s=new Set();for(let i=0;i<N;i++)s.add(find(i).root);return s.size;};

  steps.push({
    title:"Initialize \u2014 Each Node Is Its Own Root",
    detail:`parent[i]=i, rank[i]=0. ${N} isolated components.`,
    parent:[...parent],rank:[...rank],highlight:[],findPath:[],compressed:[],
    phase:"init",codeHL:[0,1,2,3],changedParent:null,changedRank:null,
    prevParent:null,prevRank:null,components:N,completedOps:[],
  });

  for(const op of OPS){
    if(op.type==="union"){
      const{a,b}=op;
      const fa=find(a),fb=find(b);

      steps.push({
        title:`Union(${a}, ${b}) \u2014 Find Roots`,
        detail:`find(${a}): [${fa.path.join("\u2192")}] root=${fa.root}. find(${b}): [${fb.path.join("\u2192")}] root=${fb.root}.`,
        parent:[...parent],rank:[...rank],highlight:[a,b],
        findPath:[...fa.path,...fb.path],compressed:[],
        phase:"find",codeHL:[5,6,7,8,11],changedParent:null,changedRank:null,
        prevParent:null,prevRank:null,components:countComp(),completedOps:[...completedOps],
      });

      if(fa.root===fb.root){
        completedOps.push({op:`union(${a},${b})`,result:"skip"});
        steps.push({
          title:`Union(${a}, ${b}) \u2014 Already Connected`,
          detail:`Both have root ${fa.root}. Skip.`,
          parent:[...parent],rank:[...rank],highlight:[a,b],
          findPath:[],compressed:[],phase:"skip",codeHL:[11,12],
          changedParent:null,changedRank:null,prevParent:null,prevRank:null,
          components:countComp(),completedOps:[...completedOps],
        });
      }else{
        const pp=[...parent],pr=[...rank];
        let from,to;
        if(rank[fa.root]<rank[fb.root]){
          parent[fa.root]=fb.root;from=fa.root;to=fb.root;
        }else if(rank[fa.root]>rank[fb.root]){
          parent[fb.root]=fa.root;from=fb.root;to=fa.root;
        }else{
          parent[fb.root]=fa.root;rank[fa.root]++;from=fb.root;to=fa.root;
        }
        completedOps.push({op:`union(${a},${b})`,result:`${from}\u2192${to}`});
        steps.push({
          title:`Union(${a}, ${b}) \u2014 Merge by Rank`,
          detail:`rank[${fa.root}]=${pr[fa.root]}, rank[${fb.root}]=${pr[fb.root]}. Attach ${from} under ${to}.${rank[to]!==pr[to]?` rank[${to}]++.`:""}`,
          parent:[...parent],rank:[...rank],highlight:[from,to],
          findPath:[],compressed:[],phase:"merge",codeHL:[13,14,15,16,17,18],
          changedParent:from,changedRank:rank[to]!==pr[to]?to:null,
          prevParent:pp,prevRank:pr,components:countComp(),completedOps:[...completedOps],
        });
      }
    }

    if(op.type==="find"){
      const{node}=op;
      const{root,path}=find(node);

      steps.push({
        title:`Find(${node}) \u2014 Traverse to Root`,
        detail:`Follow parents: ${path.join(" \u2192 ")}. Root = ${root}.`,
        parent:[...parent],rank:[...rank],highlight:[node],
        findPath:[...path],compressed:[],phase:"find",codeHL:[5,6,8],
        changedParent:null,changedRank:null,prevParent:null,prevRank:null,
        components:countComp(),completedOps:[...completedOps],
      });

      const pp=[...parent];
      const compressed=path.filter(n=>n!==root&&parent[n]!==root);
      for(const n of path)if(n!==root)parent[n]=root;

      if(compressed.length>0){
        completedOps.push({op:`find(${node})`,result:`root=${root}, compressed [${compressed}]`});
        steps.push({
          title:`Find(${node}) \u2014 Path Compression`,
          detail:`Point all nodes on path directly to root ${root}. Compressed: [${compressed.join(", ")}].`,
          parent:[...parent],rank:[...rank],highlight:[node,root],
          findPath:[],compressed,phase:"compress",codeHL:[6,7],
          changedParent:compressed[0],changedRank:null,prevParent:pp,prevRank:null,
          components:countComp(),completedOps:[...completedOps],
        });
      }else{
        completedOps.push({op:`find(${node})`,result:`root=${root}`});
      }
    }
  }

  steps.push({
    title:"\u2713 Complete \u2014 Final Union-Find State",
    detail:`${countComp()} component(s). Path compression flattened trees for O(\u03b1(n)) operations.`,
    parent:[...parent],rank:[...rank],highlight:[],findPath:[],compressed:[],
    phase:"done",codeHL:[21,22,23],changedParent:null,changedRank:null,
    prevParent:null,prevRank:null,components:countComp(),completedOps:[...completedOps],
  });

  return steps;
}

/* ─────────────────────────────────────────────
   LC 684: Redundant Connection
   Edges: [1,2],[1,3],[2,3],[3,4],[4,5]
   Tree + 1 extra edge -> find the cycle edge
   ───────────────────────────────────────────── */
const RC_EDGES = [[1,2],[1,3],[2,3],[3,4],[4,5]];
const RC_N = 5;
const RC_POS = [
  null, // 1-indexed
  {x:60,y:60},{x:180,y:60},{x:120,y:160},{x:240,y:160},{x:300,y:60},
];

function buildP1Steps() {
  const parent=Array.from({length:RC_N+1},(_,i)=>i);
  const rank=new Array(RC_N+1).fill(0);
  const steps=[], completedOps=[];

  const find=(x)=>{const path=[x];while(parent[x]!==x){x=parent[x];path.push(x);}return{root:x,path};};
  const countComp=()=>{const s=new Set();for(let i=1;i<=RC_N;i++)s.add(find(i).root);return s.size;};

  steps.push({
    title:"Initialize \u2014 N Isolated Nodes",
    detail:`${RC_N} nodes, will process ${RC_EDGES.length} edges. If union fails, that edge creates a cycle \u2014 it's redundant.`,
    parent:[...parent],rank:[...rank],highlight:[],findPath:[],compressed:[],
    phase:"init",codeHL:[0,1,2,3],changedParent:null,changedRank:null,
    prevParent:null,prevRank:null,components:RC_N,completedOps:[],
    redundantEdge:null,
  });

  let redundantEdge=null;
  for(const[a,b]of RC_EDGES){
    const fa=find(a),fb=find(b);

    steps.push({
      title:`Edge (${a},${b}) \u2014 Find Roots`,
      detail:`find(${a})=${fa.root}, find(${b})=${fb.root}. ${fa.root===fb.root?"Same root \u2192 CYCLE!":"Different roots \u2192 safe to merge."}`,
      parent:[...parent],rank:[...rank],highlight:[a,b],
      findPath:[...fa.path,...fb.path],compressed:[],
      phase:"find",codeHL:[5,6,7,8,11],changedParent:null,changedRank:null,
      prevParent:null,prevRank:null,components:countComp(),completedOps:[...completedOps],
      redundantEdge,
    });

    if(fa.root===fb.root){
      redundantEdge=[a,b];
      completedOps.push({op:`edge(${a},${b})`,result:"\u26a0 REDUNDANT"});
      steps.push({
        title:`\u2713 Edge (${a},${b}) \u2014 Redundant Found!`,
        detail:`Both ${a} and ${b} have root ${fa.root}. Adding this edge creates a cycle. Answer: [${a},${b}].`,
        parent:[...parent],rank:[...rank],highlight:[a,b],
        findPath:[],compressed:[],phase:"found",codeHL:[11,12],
        changedParent:null,changedRank:null,prevParent:null,prevRank:null,
        components:countComp(),completedOps:[...completedOps],
        redundantEdge,
      });
    }else{
      const pp=[...parent],pr=[...rank];
      let from,to;
      if(rank[fa.root]<rank[fb.root]){parent[fa.root]=fb.root;from=fa.root;to=fb.root;}
      else if(rank[fa.root]>rank[fb.root]){parent[fb.root]=fa.root;from=fb.root;to=fa.root;}
      else{parent[fb.root]=fa.root;rank[fa.root]++;from=fb.root;to=fa.root;}
      completedOps.push({op:`edge(${a},${b})`,result:`${from}\u2192${to}`});
      steps.push({
        title:`Edge (${a},${b}) \u2014 Merge`,
        detail:`Attach ${from} under ${to}. ${countComp()} component(s) remaining.`,
        parent:[...parent],rank:[...rank],highlight:[from,to],
        findPath:[],compressed:[],phase:"merge",codeHL:[13,14,15,16,17,18],
        changedParent:from,changedRank:rank[to]!==pr[to]?to:null,
        prevParent:pp,prevRank:pr,components:countComp(),completedOps:[...completedOps],
        redundantEdge,
      });
    }
  }

  return steps;
}

/* ─────────────────────────────────────────────
   LC 990: Satisfiability of Equality Equations
   equations: ["a==b","c==d","b==c","a!=d"]
   Process == first (union), then check != (find)
   ───────────────────────────────────────────── */
const EQ_EQNS = ["a==b","c==d","b==c","a!=d"];
const EQ_VARS = ["a","b","c","d"];
const EQ_POS = {a:{x:60,y:80},b:{x:200,y:80},c:{x:200,y:200},d:{x:60,y:200}};

function buildP2Steps() {
  const parent=Array.from({length:26},(_,i)=>i);
  const rank=new Array(26).fill(0);
  const steps=[], completedOps=[];
  const ci=c=>c.charCodeAt(0)-97;
  const cn=i=>String.fromCharCode(i+97);

  const find=(x)=>{const path=[x];while(parent[x]!==x){x=parent[x];path.push(x);}return{root:x,path};};
  const usedVars=new Set(EQ_VARS.map(ci));
  const countComp=()=>{const s=new Set();for(const v of usedVars)s.add(find(v).root);return s.size;};

  steps.push({
    title:"Initialize \u2014 Phase 1: Process Equalities",
    detail:`${EQ_EQNS.length} equations using variables {${EQ_VARS.join(",")}}. First union all == pairs, then verify != constraints.`,
    parent:[...parent],rank:[...rank],highlight:[],findPath:[],compressed:[],
    phase:"init",codeHL:[0,1,2,3],changedParent:null,changedRank:null,
    prevParent:null,prevRank:null,components:countComp(),completedOps:[],
    conflict:null,currentEq:null,eqPhase:"union",
  });

  // Phase 1: process ==
  for(const eq of EQ_EQNS){
    if(eq[1]!=="=")continue;
    const va=eq[0],vb=eq[3];
    const a=ci(va),b=ci(vb);
    const fa=find(a),fb=find(b);

    if(fa.root===fb.root){
      completedOps.push({op:`${va}==${vb}`,result:"already same"});
      steps.push({
        title:`"${va}==${vb}" \u2014 Already Connected`,
        detail:`find(${va})=${cn(fa.root)}, find(${vb})=${cn(fb.root)}. Same set, skip.`,
        parent:[...parent],rank:[...rank],highlight:[a,b],
        findPath:[...fa.path,...fb.path],compressed:[],
        phase:"skip",codeHL:[5,6,7],changedParent:null,changedRank:null,
        prevParent:null,prevRank:null,components:countComp(),completedOps:[...completedOps],
        conflict:null,currentEq:eq,eqPhase:"union",
      });
    }else{
      const pp=[...parent],pr=[...rank];
      let from,to;
      if(rank[fa.root]<rank[fb.root]){parent[fa.root]=fb.root;from=fa.root;to=fb.root;}
      else if(rank[fa.root]>rank[fb.root]){parent[fb.root]=fa.root;from=fb.root;to=fa.root;}
      else{parent[fb.root]=fa.root;rank[fa.root]++;from=fb.root;to=fa.root;}
      completedOps.push({op:`${va}==${vb}`,result:`${cn(from)}\u2192${cn(to)}`});
      steps.push({
        title:`"${va}==${vb}" \u2014 Union`,
        detail:`Merge: attach ${cn(from)} under ${cn(to)}. Now ${va} and ${vb} share root ${cn(to)}.`,
        parent:[...parent],rank:[...rank],highlight:[from,to],
        findPath:[],compressed:[],phase:"merge",codeHL:[5,6,7,8],
        changedParent:from,changedRank:rank[to]!==pr[to]?to:null,
        prevParent:pp,prevRank:pr,components:countComp(),completedOps:[...completedOps],
        conflict:null,currentEq:eq,eqPhase:"union",
      });
    }
  }

  // Phase 2: verify !=
  steps.push({
    title:"Phase 2 \u2014 Verify Inequalities",
    detail:"All equalities processed. Now check each != constraint: if find(a)==find(b), we have a contradiction.",
    parent:[...parent],rank:[...rank],highlight:[],findPath:[],compressed:[],
    phase:"init",codeHL:[10,11],changedParent:null,changedRank:null,
    prevParent:null,prevRank:null,components:countComp(),completedOps:[...completedOps],
    conflict:null,currentEq:null,eqPhase:"check",
  });

  let satisfiable=true;
  for(const eq of EQ_EQNS){
    if(eq[1]!=="!")continue;
    const va=eq[0],vb=eq[3];
    const a=ci(va),b=ci(vb);
    const fa=find(a),fb=find(b);
    const conflict=fa.root===fb.root;

    if(conflict){
      satisfiable=false;
      completedOps.push({op:`${va}!=${vb}`,result:"\u26a0 CONFLICT"});
      steps.push({
        title:`\u2717 "${va}!=${vb}" \u2014 Contradiction!`,
        detail:`find(${va})=${cn(fa.root)}, find(${vb})=${cn(fb.root)}. Same root! But equation says they must differ. Unsatisfiable.`,
        parent:[...parent],rank:[...rank],highlight:[a,b],
        findPath:[...fa.path,...fb.path],compressed:[],
        phase:"found",codeHL:[12,13],changedParent:null,changedRank:null,
        prevParent:null,prevRank:null,components:countComp(),completedOps:[...completedOps],
        conflict:[va,vb],currentEq:eq,eqPhase:"check",
      });
    }else{
      completedOps.push({op:`${va}!=${vb}`,result:"OK"});
      steps.push({
        title:`\u2713 "${va}!=${vb}" \u2014 Consistent`,
        detail:`find(${va})=${cn(fa.root)}, find(${vb})=${cn(fb.root)}. Different roots \u2014 no contradiction.`,
        parent:[...parent],rank:[...rank],highlight:[a,b],
        findPath:[...fa.path,...fb.path],compressed:[],
        phase:"find",codeHL:[12,13],changedParent:null,changedRank:null,
        prevParent:null,prevRank:null,components:countComp(),completedOps:[...completedOps],
        conflict:null,currentEq:eq,eqPhase:"check",
      });
    }
  }

  steps.push({
    title:satisfiable?"\u2713 All Constraints Satisfied":"\u2717 Unsatisfiable",
    detail:satisfiable?"All equality and inequality constraints are consistent. Return True.":"A != constraint contradicts the equality groups. Return False.",
    parent:[...parent],rank:[...rank],highlight:[],findPath:[],compressed:[],
    phase:"done",codeHL:[14,15],changedParent:null,changedRank:null,
    prevParent:null,prevRank:null,components:countComp(),completedOps:[...completedOps],
    conflict:null,currentEq:null,eqPhase:"result",satisfiable,
  });

  return steps;
}

/* ─────────────────────────────────────────────
   LC 305: Number of Islands II — 3×3 grid
   Add land cells one by one, count islands after each
   ───────────────────────────────────────────── */
const NI_M=3, NI_N=3;
const NI_POSITIONS=[[0,0],[0,1],[1,2],[2,1],[1,1],[0,2]];
const NI_EXPECTED=[1,1,2,3,1,1];
const NI_DIRS=[[0,1],[0,-1],[1,0],[-1,0]];

function buildP3Steps(){
  const steps=[];
  const parent=new Array(NI_M*NI_N).fill(-1);
  const rank=new Array(NI_M*NI_N).fill(0);
  let islandCount=0;
  const grid=Array.from({length:NI_M},()=>new Array(NI_N).fill(0));
  const completedOps=[];

  const id=(r,c)=>r*NI_N+c;
  const find=(x)=>{const path=[x];while(parent[x]!==x){x=parent[x];path.push(x);}return{root:x,path};};
  const union=(a,b)=>{
    let pa=find(a).root,pb=find(b).root;
    if(pa===pb)return false;
    if(rank[pa]<rank[pb])[pa,pb]=[pb,pa];
    parent[pb]=pa;
    if(rank[pa]===rank[pb])rank[pa]++;
    islandCount--;
    return true;
  };

  steps.push({
    title:"Initialize \u2014 Empty 3\u00d73 Grid",
    detail:`Grid starts as water. Add land cells one by one. After each, count connected islands using Union-Find.`,
    parent:[...parent],rank:[...rank],highlight:[],findPath:[],compressed:[],
    phase:"init",codeHL:[0,1,2,3,4],changedParent:null,changedRank:null,
    prevParent:null,prevRank:null,components:0,completedOps:[],
    grid:grid.map(r=>[...r]),addedCell:null,mergedWith:[],islandCount:0,results:[],
  });

  const results=[];
  for(let op=0;op<NI_POSITIONS.length;op++){
    const[r,c]=NI_POSITIONS[op];
    const idx=id(r,c);

    if(parent[idx]!==-1){
      results.push(islandCount);
      completedOps.push({op:`add(${r},${c})`,result:`dup \u2192 ${islandCount}`});
      continue;
    }

    parent[idx]=idx;
    grid[r][c]=1;
    islandCount++;
    const mergedWith=[];

    // Show the land addition
    steps.push({
      title:`Add Land (${r},${c})`,
      detail:`Mark cell as land. New island created \u2192 count=${islandCount}. Now check 4 neighbors for merges.`,
      parent:[...parent],rank:[...rank],highlight:[idx],findPath:[],compressed:[],
      phase:"find",codeHL:[6,7,8],changedParent:null,changedRank:null,
      prevParent:null,prevRank:null,components:islandCount,completedOps:[...completedOps],
      grid:grid.map(rr=>[...rr]),addedCell:[r,c],mergedWith:[],islandCount,results:[...results],
    });

    for(const[dr,dc]of NI_DIRS){
      const nr=r+dr,nc=c+dc;
      if(nr>=0&&nr<NI_M&&nc>=0&&nc<NI_N&&parent[id(nr,nc)]!==-1){
        const pp=[...parent];
        if(union(idx,id(nr,nc))){
          mergedWith.push([nr,nc]);
          steps.push({
            title:`Merge (${r},${c}) + (${nr},${nc})`,
            detail:`Neighbor (${nr},${nc}) is land. Union reduces islands to ${islandCount}.`,
            parent:[...parent],rank:[...rank],highlight:[idx,id(nr,nc)],findPath:[],compressed:[],
            phase:"merge",codeHL:[9,10,11,12],changedParent:id(nr,nc),changedRank:null,
            prevParent:pp,prevRank:null,components:islandCount,completedOps:[...completedOps],
            grid:grid.map(rr=>[...rr]),addedCell:[r,c],mergedWith:[...mergedWith],islandCount,results:[...results],
          });
        }
      }
    }

    results.push(islandCount);
    completedOps.push({op:`add(${r},${c})`,result:`\u2192 ${islandCount} island(s)`});

    steps.push({
      title:`Result: ${islandCount} Island(s)`,
      detail:`After adding (${r},${c}): ${islandCount} island(s). ${mergedWith.length>0?`Merged with ${mergedWith.map(([a,b])=>`(${a},${b})`).join(", ")}.`:"No adjacent land."}`,
      parent:[...parent],rank:[...rank],highlight:[],findPath:[],compressed:[],
      phase:op===NI_POSITIONS.length-1?"done":"find",codeHL:[13,14],changedParent:null,changedRank:null,
      prevParent:null,prevRank:null,components:islandCount,completedOps:[...completedOps],
      grid:grid.map(rr=>[...rr]),addedCell:null,mergedWith:[],islandCount,results:[...results],
    });
  }

  return steps;
}

/* ─────────────────────────────────────────────
   LC 839: Similar String Groups
   Strings: ['blw','bwl','wbl','xyz','xzy','zzz']
   Two strings are similar if they differ by exactly one swap
   ───────────────────────────────────────────── */
const SS_STRS=["blw","bwl","wbl","xyz","xzy","zzz"];
const SS_POS=[
  {x:80,y:60},{x:200,y:60},{x:140,y:150},
  {x:320,y:60},{x:380,y:150},{x:260,y:200},
];

function ssIsSimilar(a,b){
  if(a.length!==b.length)return false;
  const diffs=[];
  for(let i=0;i<a.length;i++)if(a[i]!==b[i])diffs.push(i);
  if(diffs.length===0)return true;
  if(diffs.length!==2)return false;
  return a[diffs[0]]===b[diffs[1]]&&a[diffs[1]]===b[diffs[0]];
}

function buildP4Steps(){
  const n=SS_STRS.length;
  const parent=Array.from({length:n},(_,i)=>i);
  const rank=new Array(n).fill(0);
  const steps=[],completedOps=[];

  const find=(x)=>{const path=[x];while(parent[x]!==x){x=parent[x];path.push(x);}return{root:x,path};};
  const countComp=()=>{const s=new Set();for(let i=0;i<n;i++)s.add(find(i).root);return s.size;};

  steps.push({
    title:"Initialize \u2014 Each String Is Its Own Group",
    detail:`${n} strings. Two are \"similar\" if they differ by exactly one character swap. Compare all pairs; union similar strings. Count groups at the end.`,
    parent:[...parent],rank:[...rank],highlight:[],findPath:[],compressed:[],
    phase:"init",codeHL:[0,1,2,3],changedParent:null,changedRank:null,
    prevParent:null,prevRank:null,components:n,completedOps:[],
    pairI:null,pairJ:null,similar:null,
  });

  for(let i=0;i<n;i++){
    for(let j=i+1;j<n;j++){
      const sim=ssIsSimilar(SS_STRS[i],SS_STRS[j]);

      if(!sim){
        // Show non-similar comparison only for interesting pairs (same length but not similar)
        continue;
      }

      const fa=find(i),fb=find(j);

      steps.push({
        title:`Compare "${SS_STRS[i]}" vs "${SS_STRS[j]}"`,
        detail:`Differ by swap \u2192 similar! find(${SS_STRS[i]})=${SS_STRS[fa.root]}, find(${SS_STRS[j]})=${SS_STRS[fb.root]}.`,
        parent:[...parent],rank:[...rank],highlight:[i,j],
        findPath:[...fa.path,...fb.path],compressed:[],
        phase:"find",codeHL:[5,6,7,8],changedParent:null,changedRank:null,
        prevParent:null,prevRank:null,components:countComp(),completedOps:[...completedOps],
        pairI:i,pairJ:j,similar:true,
      });

      if(fa.root===fb.root){
        completedOps.push({op:`${SS_STRS[i]}~${SS_STRS[j]}`,result:"same group"});
        steps.push({
          title:`"${SS_STRS[i]}" ~ "${SS_STRS[j]}" \u2014 Already Grouped`,
          detail:`Both already in same component (root=${SS_STRS[fa.root]}). Skip.`,
          parent:[...parent],rank:[...rank],highlight:[i,j],
          findPath:[],compressed:[],phase:"skip",codeHL:[9,10],
          changedParent:null,changedRank:null,prevParent:null,prevRank:null,
          components:countComp(),completedOps:[...completedOps],
          pairI:i,pairJ:j,similar:true,
        });
      }else{
        const pp=[...parent],pr=[...rank];
        let from,to;
        if(rank[fa.root]<rank[fb.root]){parent[fa.root]=fb.root;from=fa.root;to=fb.root;}
        else if(rank[fa.root]>rank[fb.root]){parent[fb.root]=fa.root;from=fb.root;to=fa.root;}
        else{parent[fb.root]=fa.root;rank[fa.root]++;from=fb.root;to=fa.root;}
        completedOps.push({op:`${SS_STRS[i]}~${SS_STRS[j]}`,result:`merge`});
        steps.push({
          title:`"${SS_STRS[i]}" ~ "${SS_STRS[j]}" \u2014 Merge Groups`,
          detail:`Attach ${SS_STRS[from]} under ${SS_STRS[to]}. ${countComp()} groups remain.`,
          parent:[...parent],rank:[...rank],highlight:[from,to],
          findPath:[],compressed:[],phase:"merge",codeHL:[9,10,11],
          changedParent:from,changedRank:rank[to]!==pr[to]?to:null,
          prevParent:pp,prevRank:pr,components:countComp(),completedOps:[...completedOps],
          pairI:i,pairJ:j,similar:true,
        });
      }
    }
  }

  // Final
  const gc=countComp();
  const groups={};
  for(let i=0;i<n;i++){const r=find(i).root;if(!groups[r])groups[r]=[];groups[r].push(SS_STRS[i]);}
  const groupList=Object.values(groups);
  steps.push({
    title:`\u2713 ${gc} Similar String Group(s)`,
    detail:`Groups: ${groupList.map(g=>`{${g.join(",")}}`).join(", ")}`,
    parent:[...parent],rank:[...rank],highlight:[],findPath:[],compressed:[],
    phase:"done",codeHL:[12,13],changedParent:null,changedRank:null,
    prevParent:null,prevRank:null,components:gc,completedOps:[...completedOps],
    pairI:null,pairJ:null,similar:null,groupList,
  });

  return steps;
}

/* ═══════════════════════════════════════════
   PROBLEM DEFINITIONS
   ═══════════════════════════════════════════ */
const PROBLEMS = {
  algorithm: {
    title:"Algorithm",lc:null,difficulty:null,tag:"Core Pattern",
    coreIdea:"Union-Find maintains a forest where each tree is a connected component. find(x) walks to the root (with path compression), union(x,y) merges by rank to keep trees shallow. Together: O(\u03b1(n)) \u2248 O(1) amortized per op.",
    buildSteps:buildAlgSteps,
    nodeCount:ALG_N, nodeStart:0,
    positions:ALG_POS,
    code:[
      {id:0,text:"class UnionFind:"},{id:1,text:"    def __init__(self, n):"},
      {id:2,text:"        self.parent = list(range(n))"},
      {id:3,text:"        self.rank = [0] * n"},{id:4,text:""},
      {id:5,text:"    def find(self, x):"},
      {id:6,text:"        if self.parent[x] != x:"},
      {id:7,text:"            self.parent[x] = self.find(self.parent[x])"},
      {id:8,text:"        return self.parent[x]"},{id:9,text:""},
      {id:10,text:"    def union(self, x, y):"},
      {id:11,text:"        px, py = self.find(x), self.find(y)"},
      {id:12,text:"        if px == py: return False"},
      {id:13,text:"        if self.rank[px] < self.rank[py]:"},
      {id:14,text:"            px, py = py, px"},
      {id:15,text:"        self.parent[py] = px"},
      {id:16,text:"        if self.rank[px] == self.rank[py]:"},
      {id:17,text:"            self.rank[px] += 1"},
      {id:18,text:"        return True"},{id:19,text:""},
      {id:20,text:"# Usage"},
      {id:21,text:"uf = UnionFind(n)"},
      {id:22,text:"uf.union(1, 2)"},
      {id:23,text:"uf.find(2)  # returns root of 2"},
    ],
  },
  redundant: {
    title:"Redundant Connection",lc:"684",difficulty:"Medium",tag:"Cycle Detection",
    coreIdea:"Given a graph that was a tree plus one extra edge, find the redundant edge. Process edges one by one: union the endpoints. If find(a)==find(b) before union, adding (a,b) would create a cycle \u2014 that's the answer.",
    buildSteps:buildP1Steps,
    nodeCount:RC_N, nodeStart:1,
    positions:RC_POS,
    code:[
      {id:0,text:"def findRedundantConnection(edges):"},{id:1,text:"    n = len(edges)"},
      {id:2,text:"    parent = list(range(n + 1))"},
      {id:3,text:"    rank = [0] * (n + 1)"},{id:4,text:""},
      {id:5,text:"    def find(x):"},
      {id:6,text:"        if parent[x] != x:"},
      {id:7,text:"            parent[x] = find(parent[x])"},
      {id:8,text:"        return parent[x]"},{id:9,text:""},
      {id:10,text:"    for a, b in edges:"},
      {id:11,text:"        pa, pb = find(a), find(b)"},
      {id:12,text:"        if pa == pb: return [a, b]"},
      {id:13,text:"        if rank[pa] < rank[pb]:"},
      {id:14,text:"            pa, pb = pb, pa"},
      {id:15,text:"        parent[pb] = pa"},
      {id:16,text:"        if rank[pa] == rank[pb]:"},
      {id:17,text:"            rank[pa] += 1"},
      {id:18,text:"    return []"},
    ],
  },
  equality: {
    title:"Equality Equations",lc:"990",difficulty:"Medium",tag:"Constraint SAT",
    coreIdea:"Two passes: first union all variables connected by ==, then check each != constraint. If a!=b but find(a)==find(b), the equalities force a==b via transitivity \u2014 contradiction. Union-Find elegantly captures transitive closure.",
    buildSteps:buildP2Steps,
    nodeCount:4, nodeStart:0,
    positions:null, // uses letter positions
    code:[
      {id:0,text:"def equationsPossible(equations):"},{id:1,text:"    parent = list(range(26))"},
      {id:2,text:"    def find(x):"},
      {id:3,text:"        if parent[x] != x:"},
      {id:4,text:"            parent[x] = find(parent[x])"},
      {id:5,text:"        return parent[x]"},{id:6,text:""},
      {id:7,text:"    for eq in equations:"},
      {id:8,text:"        if eq[1] == '=':"},
      {id:9,text:"            a,b = ord(eq[0])-97, ord(eq[3])-97"},
      {id:10,text:"            # union a, b"},{id:11,text:""},
      {id:12,text:"    for eq in equations:"},
      {id:13,text:"        if eq[1] == '!':"},
      {id:14,text:"            a,b = ord(eq[0])-97, ord(eq[3])-97"},
      {id:15,text:"            if find(a) == find(b): return False"},
      {id:16,text:"    return True"},
    ],
  },
  islands: {
    title:"Islands II",lc:"305",difficulty:"Hard",tag:"Dynamic Grid",
    coreIdea:"Start with an empty m\u00d7n grid. Add land cells one at a time. After each addition, report the number of islands. Each new land cell starts as its own island, then union with adjacent land neighbors. UF tracks components dynamically without re-scanning the grid.",
    buildSteps:buildP3Steps,
    nodeCount:NI_M*NI_N, nodeStart:0,
    positions:null, // uses grid view
    stateType:"grid",
    code:[
      {id:0,text:"def numIslands2(m, n, positions):"},{id:1,text:"    parent = [-1]*(m*n)"},
      {id:2,text:"    rank = [0]*(m*n)"},{id:3,text:"    count = 0"},
      {id:4,text:"    results = []"},{id:5,text:""},
      {id:6,text:"    for r, c in positions:"},
      {id:7,text:"        idx = r*n + c"},
      {id:8,text:"        parent[idx] = idx; count += 1"},
      {id:9,text:"        for dr, dc in DIRS:"},
      {id:10,text:"            nr, nc = r+dr, c+dc"},
      {id:11,text:"            ni = nr*n + nc"},
      {id:12,text:"            if in_bounds and parent[ni] != -1:"},
      {id:13,text:"                if union(idx, ni): count -= 1"},
      {id:14,text:"        results.append(count)"},
      {id:15,text:"    return results"},
    ],
  },
  similar: {
    title:"Similar Strings",lc:"839",difficulty:"Hard",tag:"Swap Groups",
    coreIdea:"Two strings are similar if one can become the other by swapping exactly two characters (or they're equal). Group all similar strings transitively: if A~B and B~C then {A,B,C} form one group. Compare all pairs, union similar ones. Answer = number of components.",
    buildSteps:buildP4Steps,
    nodeCount:SS_STRS.length, nodeStart:0,
    positions:SS_POS,
    stateType:"strings",
    code:[
      {id:0,text:"def numSimilarGroups(strs):"},{id:1,text:"    n = len(strs)"},
      {id:2,text:"    parent = list(range(n))"},{id:3,text:"    rank = [0]*n"},
      {id:4,text:""},
      {id:5,text:"    def similar(a, b):"},
      {id:6,text:"        diffs = [i for i in range(len(a))"},
      {id:7,text:"                 if a[i] != b[i]]"},
      {id:8,text:"        return len(diffs) in (0, 2) and ..."},
      {id:9,text:""},
      {id:10,text:"    for i in range(n):"},
      {id:11,text:"        for j in range(i+1, n):"},
      {id:12,text:"            if similar(strs[i], strs[j]):"},
      {id:13,text:"                union(i, j)"},
      {id:14,text:"    return len(set(find(i) for i in range(n)))"},
    ],
  },
};

/* ═══════════════════════════════════════════
   VISUALIZATION COMPONENTS
   ═══════════════════════════════════════════ */

function GraphView({ step, problem }) {
  const {parent,highlight,findPath,compressed}=step;
  const pKey = Object.keys(PROBLEMS).find(k=>PROBLEMS[k]===problem);

  if(pKey==="equality"){
    // Letter-based graph for LC 990
    const vars=EQ_VARS;
    const ci=c=>c.charCodeAt(0)-97;
    const positions=EQ_POS;

    return (
      <svg viewBox="0 0 260 260" className="w-full" style={{maxHeight:220}}>
        {vars.map(v=>{
          const idx=ci(v);
          const p=parent[idx];
          if(p===idx)return null;
          const pv=String.fromCharCode(p+97);
          if(!positions[v]||!positions[pv])return null;
          const from=positions[v],to=positions[pv];
          const dx=to.x-from.x,dy=to.y-from.y,len=Math.sqrt(dx*dx+dy*dy);
          const r=22;
          const sx=from.x+(dx/len)*r,sy=from.y+(dy/len)*r;
          const ex=to.x-(dx/len)*r,ey=to.y-(dy/len)*r;
          const isComp=compressed.includes(idx);
          const isPath=findPath.includes(idx)&&findPath.includes(p);
          const color=isComp?"#10b981":isPath?"#f59e0b":"#3f3f46";
          return (
            <g key={`e-${v}`}>
              <defs><marker id={`ua-${v}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={color} /></marker></defs>
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color}
                strokeWidth={isComp||isPath?2.5:1.5} markerEnd={`url(#ua-${v})`}
                strokeDasharray={isComp?"5,3":"none"} />
            </g>
          );
        })}
        {vars.map(v=>{
          const idx=ci(v);
          const pos=positions[v];
          const isRoot=parent[idx]===idx;
          const isHL=highlight.includes(idx);
          const isPath=findPath.includes(idx);
          const isComp=compressed.includes(idx);
          const isConflict=step.conflict&&(step.conflict[0]===v||step.conflict[1]===v);
          const fill=isConflict?"#ef4444":isComp?"#10b981":isHL?"#3b82f6":isPath?"#f59e0b":isRoot?"#8b5cf6":"#27272a";
          const stroke=isConflict?"#dc2626":isComp?"#059669":isHL?"#2563eb":isPath?"#d97706":isRoot?"#7c3aed":"#52525b";
          return (
            <g key={v}>
              <circle cx={pos.x} cy={pos.y} r={20} fill={fill} stroke={stroke} strokeWidth={2.5} />
              <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="central"
                fill="#fff" fontSize="18" fontWeight="700" fontFamily="monospace">{v}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  if(pKey==="islands"){
    // Grid view for LC 305
    const grid=step.grid||Array.from({length:NI_M},()=>new Array(NI_N).fill(0));
    const added=step.addedCell;
    const cellSz=52,pad=10;
    return (
      <svg viewBox={`0 0 ${NI_N*cellSz+pad*2} ${NI_M*cellSz+pad*2+20}`} className="w-full" style={{maxHeight:220}}>
        {Array.from({length:NI_M}).map((_,r)=>
          Array.from({length:NI_N}).map((_2,c)=>{
            const x=pad+c*cellSz,y=pad+r*cellSz;
            const isLand=grid[r][c]===1;
            const isAdded=added&&added[0]===r&&added[1]===c;
            const idx=r*NI_N+c;
            const isHL=highlight.includes(idx);
            const fill=isAdded?"#3b82f6":isHL?"#f59e0b":isLand?"#059669":"#18181b";
            const stroke=isAdded?"#2563eb":isHL?"#d97706":isLand?"#10b981":"#3f3f46";
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width={cellSz-4} height={cellSz-4} rx={6} fill={fill} stroke={stroke} strokeWidth={2} />
                <text x={x+(cellSz-4)/2} y={y+(cellSz-4)/2+1} textAnchor="middle" dominantBaseline="central"
                  fill={isLand?"#a7f3d0":"#3f3f46"} fontSize="10" fontFamily="monospace" fontWeight="600">
                  {isLand?`(${r},${c})`:""}
                </text>
              </g>
            );
          })
        )}
        {step.results&&step.results.length>0&&(
          <text x={pad} y={NI_M*cellSz+pad+14} fill="#a1a1aa" fontSize="9" fontFamily="monospace">
            results: [{step.results.join(", ")}]
          </text>
        )}
      </svg>
    );
  }

  if(pKey==="similar"){
    // String-node graph for LC 839
    const positions=SS_POS;
    const n=SS_STRS.length;
    return (
      <svg viewBox="0 0 460 260" className="w-full" style={{maxHeight:220}}>
        {Array.from({length:n}).map((_,i)=>{
          const p=parent[i];
          if(p===i||!positions[i]||!positions[p])return null;
          const from=positions[i],to=positions[p];
          const dx=to.x-from.x,dy=to.y-from.y,len=Math.sqrt(dx*dx+dy*dy);
          const r=26;
          const sx=from.x+(dx/len)*r,sy=from.y+(dy/len)*r;
          const ex=to.x-(dx/len)*r,ey=to.y-(dy/len)*r;
          const isComp=compressed.includes(i);
          const isPath=findPath.includes(i)&&findPath.includes(p);
          const color=isComp?"#10b981":isPath?"#f59e0b":"#3f3f46";
          return (
            <g key={`e-${i}`}>
              <defs><marker id={`ua-s${i}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={color} /></marker></defs>
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color}
                strokeWidth={isComp||isPath?2.5:1.5} markerEnd={`url(#ua-s${i})`}
                strokeDasharray={isComp?"5,3":"none"} />
            </g>
          );
        })}
        {Array.from({length:n}).map((_,id)=>{
          const pos=positions[id];
          const isRoot=parent[id]===id;
          const isHL=highlight.includes(id);
          const isPath=findPath.includes(id);
          const isComp=compressed.includes(id);
          const fill=isComp?"#10b981":isHL?"#3b82f6":isPath?"#f59e0b":isRoot?"#8b5cf6":"#27272a";
          const stroke=isComp?"#059669":isHL?"#2563eb":isPath?"#d97706":isRoot?"#7c3aed":"#52525b";
          return (
            <g key={id}>
              <circle cx={pos.x} cy={pos.y} r={24} fill={fill} stroke={stroke} strokeWidth={2.5} />
              <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="central"
                fill="#fff" fontSize="11" fontWeight="700" fontFamily="monospace">{SS_STRS[id]}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  // Numeric-node graph (algorithm + LC 684)
  const start=problem.nodeStart;
  const count=problem.nodeCount;
  const positions=problem.positions;

  return (
    <svg viewBox="0 0 360 260" className="w-full" style={{maxHeight:220}}>
      {Array.from({length:count}).map((_,idx)=>{
        const i=idx+start;
        const p=parent[i];
        if(p===i||!positions[i]||!positions[p])return null;
        const from=positions[i],to=positions[p];
        const dx=to.x-from.x,dy=to.y-from.y,len=Math.sqrt(dx*dx+dy*dy);
        const r=22;
        const sx=from.x+(dx/len)*r,sy=from.y+(dy/len)*r;
        const ex=to.x-(dx/len)*r,ey=to.y-(dy/len)*r;
        const isComp=compressed.includes(i);
        const isPath=findPath.includes(i)&&findPath.includes(p);
        const color=isComp?"#10b981":isPath?"#f59e0b":"#3f3f46";
        return (
          <g key={`e-${i}`}>
            <defs><marker id={`ua-${i}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <polygon points="0 0,7 2.5,0 5" fill={color} /></marker></defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color}
              strokeWidth={isComp||isPath?2.5:1.5} markerEnd={`url(#ua-${i})`}
              strokeDasharray={isComp?"5,3":"none"} />
          </g>
        );
      })}
      {Array.from({length:count}).map((_,idx)=>{
        const id=idx+start;
        if(!positions[id])return null;
        const pos=positions[id];
        const isRoot=parent[id]===id;
        const isHL=highlight.includes(id);
        const isPath=findPath.includes(id);
        const isComp=compressed.includes(id);
        const fill=isComp?"#10b981":isHL?"#3b82f6":isPath?"#f59e0b":isRoot?"#8b5cf6":"#27272a";
        const stroke=isComp?"#059669":isHL?"#2563eb":isPath?"#d97706":isRoot?"#7c3aed":"#52525b";
        return (
          <g key={id}>
            <circle cx={pos.x} cy={pos.y} r={20} fill={fill} stroke={stroke} strokeWidth={2.5} />
            <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="central"
              fill="#fff" fontSize="15" fontWeight="700" fontFamily="monospace">{id}</text>
          </g>
        );
      })}
    </svg>
  );
}

function IOPanel({ step, problem, pKey }) {
  const {phase,parent,components,completedOps}=step;
  const done=phase==="done"||phase==="found";
  const start=problem.nodeStart;
  const count=problem.nodeCount;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{whiteSpace:"pre"}}>
          {pKey==="algorithm"&&<>
            <div><span className="text-zinc-500">n   </span>= <span className="text-blue-400">{ALG_N}</span></div>
            <div><span className="text-zinc-500">ops </span>= <span className="text-zinc-300">{ALG_OPS.length} ops</span></div>
          </>}
          {pKey==="redundant"&&<>
            <div><span className="text-zinc-500">n    </span>= <span className="text-blue-400">{RC_N}</span></div>
            <div><span className="text-zinc-500">edges</span>= <span className="text-zinc-300">{RC_EDGES.length}</span></div>
          </>}
          {pKey==="equality"&&<>
            <div><span className="text-zinc-500">eqns</span>= <span className="text-zinc-300">{EQ_EQNS.length}</span></div>
            <div><span className="text-zinc-500">vars</span>= <span className="text-zinc-300">{`{${EQ_VARS.join(",")}}`}</span></div>
          </>}
          {pKey==="islands"&&<>
            <div><span className="text-zinc-500">grid </span>= <span className="text-zinc-300">{NI_M}{"\u00d7"}{NI_N}</span></div>
            <div><span className="text-zinc-500">ops  </span>= <span className="text-zinc-300">{NI_POSITIONS.length} adds</span></div>
          </>}
          {pKey==="similar"&&<>
            <div><span className="text-zinc-500">strs</span>= <span className="text-zinc-300">{SS_STRS.length}</span></div>
            <div><span className="text-zinc-500">len </span>= <span className="text-zinc-300">{SS_STRS[0].length}</span></div>
          </>}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">State</div>
          {phase==="done"&&<span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{"\u2713"} DONE</span>}
          {phase==="found"&&pKey==="redundant"&&<span className="text-[9px] bg-amber-900 text-amber-300 px-1.5 py-0.5 rounded font-bold">{"\u26a0"} CYCLE</span>}
          {phase==="found"&&pKey==="equality"&&<span className="text-[9px] bg-red-900 text-red-300 px-1.5 py-0.5 rounded font-bold">{"\u2717"} CONFLICT</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">components</span>= <span className="text-zinc-300">{components}</span></div>
          {step.redundantEdge&&(
            <div><span className="text-zinc-500">redundant </span>= <span className="text-amber-300 font-bold">[{step.redundantEdge.join(",")}]</span></div>
          )}
          {step.satisfiable!==undefined&&(
            <div><span className="text-zinc-500">result    </span>= <span className={step.satisfiable?"text-emerald-300 font-bold":"text-red-300 font-bold"}>{step.satisfiable?"True":"False"}</span></div>
          )}
        </div>
      </div>

      {completedOps.length>0&&(
        <div className="border-t border-zinc-800 pt-2.5">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Log</div>
          <div className="space-y-0.5">
            {completedOps.map((op,i)=>(
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <span className="text-zinc-600 font-mono">{op.op}</span>
                <span className={op.result.includes("\u26a0")?"text-amber-400":op.result.includes("skip")||op.result.includes("same")?"text-zinc-600":"text-emerald-400/80"}>
                  {op.result}
                </span>
              </div>
            ))}
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
export default function UnionFindViz() {
  const [pKey, setPKey] = useState("algorithm");
  const [si, setSi] = useState(0);
  const problem = PROBLEMS[pKey];
  const steps = useMemo(() => problem.buildSteps(), [pKey]);
  const step = steps[Math.min(si, steps.length-1)];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  const start = problem.nodeStart;
  const count = problem.nodeCount;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{fontFamily:"'IBM Plex Sans', system-ui, sans-serif"}}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Union-Find (Disjoint Set)</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Path Compression & Union by Rank</p>
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
            <IOPanel step={step} problem={problem} pKey={pKey} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">
                {pKey==="algorithm"?`${ALG_N} nodes \u2022 ${ALG_OPS.length} ops`:
                 pKey==="redundant"?`${RC_N} nodes \u2022 ${RC_EDGES.length} edges`:
                 pKey==="islands"?`${NI_M}\u00d7${NI_N} grid \u2022 ${NI_POSITIONS.length} adds`:
                 pKey==="similar"?`${SS_STRS.length} strings \u2022 swap similarity`:
                 `${EQ_VARS.length} variables \u2022 ${EQ_EQNS.length} equations`}
              </div>
              <GraphView step={step} problem={problem} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Root</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Target</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Find Path</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Compressed</span>
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${
              step.phase==="done"?"bg-emerald-950/30 border-emerald-900":
              step.phase==="found"&&pKey==="redundant"?"bg-amber-950/30 border-amber-900":
              step.phase==="found"&&pKey==="equality"?"bg-red-950/30 border-red-900":
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si,steps.length-1)+1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase==="merge"?"bg-blue-900 text-blue-300":
                  step.phase==="compress"?"bg-emerald-900 text-emerald-300":
                  step.phase==="find"?"bg-amber-900 text-amber-300":
                  step.phase==="skip"?"bg-zinc-800 text-zinc-400":
                  step.phase==="found"?"bg-amber-900 text-amber-300":
                  step.phase==="done"?"bg-emerald-900 text-emerald-300":
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase==="found"?pKey==="redundant"?"cycle":"conflict":step.phase}</span>
                {step.eqPhase&&(
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                    step.eqPhase==="union"?"bg-blue-900/50 text-blue-400":
                    step.eqPhase==="check"?"bg-purple-900/50 text-purple-400":
                    "bg-zinc-800 text-zinc-400"
                  }`}>{step.eqPhase==="union"?"phase 1: ==":step.eqPhase==="check"?"phase 2: !=":step.eqPhase}</span>
                )}
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* parent[] array */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">parent[]</div>
              <div className="flex gap-1.5 flex-wrap">
                {(()=>{
                  const items=pKey==="equality"
                    ?EQ_VARS.map((v,idx)=>({i:v.charCodeAt(0)-97,label:v}))
                    :pKey==="islands"
                    ?Array.from({length:NI_M*NI_N},(_,i)=>({i,label:`${Math.floor(i/NI_N)},${i%NI_N}`}))
                    :pKey==="similar"
                    ?SS_STRS.map((_,i)=>({i,label:SS_STRS[i]}))
                    :Array.from({length:count},(_,idx)=>({i:idx+start,label:String(idx+start)}));
                  const fmt=(v)=>pKey==="equality"?String.fromCharCode(v+97):pKey==="similar"&&v>=0&&v<SS_STRS.length?SS_STRS[v]:String(v);
                  return items.map(({i,label})=>{
                    const p=step.parent[i];
                    if(pKey==="islands"&&p===-1)return(
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[8px] text-zinc-700 font-mono">{label}</span>
                        <div className="w-10 text-center py-1 rounded-lg font-mono text-[10px] border bg-zinc-900 border-zinc-800 text-zinc-700">{"\u2014"}</div>
                      </div>
                    );
                    const changed=step.changedParent===i;
                    const prevVal=step.prevParent?step.prevParent[i]:null;
                    const isRoot=p===i;
                    const isDone=step.phase==="done";
                    const pLabel=fmt(p);
                    const prevLabel=prevVal!==null&&prevVal!==-1?fmt(prevVal):null;
                    const w=pKey==="similar"?"w-14":"w-12";
                    return(
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[8px] text-zinc-600 font-mono">{label}</span>
                        <div className={`${w} text-center py-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${
                          changed?"bg-amber-950 border-amber-700 text-amber-200 scale-110":
                          isDone?"bg-emerald-950/30 border-emerald-800 text-emerald-300":
                          isRoot?"bg-purple-950/30 border-purple-800 text-purple-300":
                          "bg-zinc-900 border-zinc-700 text-zinc-300"
                        }`}>
                          {changed&&prevLabel!==null
                            ?<span><span className="text-zinc-600 line-through text-[9px]">{prevLabel}</span> {pLabel}</span>
                            :pLabel}
                        </div>
                        {isRoot&&<span className="text-[7px] font-mono text-purple-700">root</span>}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* rank[] array */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">rank[]</div>
              <div className="flex gap-1.5 flex-wrap">
                {(()=>{
                  const items=pKey==="equality"
                    ?EQ_VARS.map((v,idx)=>({i:v.charCodeAt(0)-97,label:v}))
                    :pKey==="islands"
                    ?Array.from({length:NI_M*NI_N},(_,i)=>({i,label:`${Math.floor(i/NI_N)},${i%NI_N}`}))
                    :pKey==="similar"
                    ?SS_STRS.map((_,i)=>({i,label:SS_STRS[i]}))
                    :Array.from({length:count},(_,idx)=>({i:idx+start,label:String(idx+start)}));
                  return items.map(({i,label})=>{
                    if(pKey==="islands"&&step.parent[i]===-1)return(
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[8px] text-zinc-700 font-mono">{label}</span>
                        <div className="w-10 text-center py-1 rounded-lg font-mono text-[10px] border bg-zinc-900 border-zinc-800 text-zinc-700">{"\u2014"}</div>
                      </div>
                    );
                    const r=step.rank[i];
                    const changed=step.changedRank===i;
                    const prevVal=step.prevRank?step.prevRank[i]:null;
                    const isDone=step.phase==="done";
                    const w=pKey==="similar"?"w-14":"w-12";
                    return(
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[8px] text-zinc-600 font-mono">{label}</span>
                        <div className={`${w} text-center py-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${
                          changed?"bg-amber-950 border-amber-700 text-amber-200 scale-110":
                          isDone?"bg-emerald-950/30 border-emerald-800 text-emerald-300":
                          "bg-zinc-900 border-zinc-700 text-zinc-300"
                        }`}>
                          {changed&&prevVal!==null
                            ?<span><span className="text-zinc-600 line-through text-[9px]">{prevVal}</span> {r}</span>
                            :r}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Components */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">{pKey==="islands"?"Islands":"Components"}</div>
                  <span className={`inline-flex items-center px-2.5 h-7 rounded-md font-mono font-bold text-sm ${
                    step.components===1?"bg-emerald-950 border border-emerald-800 text-emerald-300":"bg-blue-950 border border-blue-800 text-blue-300"
                  }`}>{step.components}</span>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Roots</div>
                  <div className="flex gap-1 items-center flex-wrap">
                    {(()=>{
                      const items=pKey==="equality"
                        ?EQ_VARS.map((v,idx)=>({i:v.charCodeAt(0)-97,label:v}))
                        :pKey==="islands"
                        ?Array.from({length:NI_M*NI_N},(_,i)=>({i,label:String(i)}))
                        :pKey==="similar"
                        ?SS_STRS.map((_,i)=>({i,label:SS_STRS[i]}))
                        :Array.from({length:count},(_,idx)=>({i:idx+start,label:String(idx+start)}));
                      return items.filter(({i})=>step.parent[i]===i).map(({i,label})=>(
                        <span key={i} className="inline-flex items-center justify-center px-1.5 h-7 rounded-md bg-purple-950 border border-purple-800 text-purple-300 font-mono font-bold text-[10px]">{label}</span>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <CodePanel code={problem.code} highlightLines={step.codeHL} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Dynamic connectivity {"\u2014"} "are X and Y in the same group?"</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Kruskal's MST {"\u2014"} sort edges, union if not same component</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Cycle detection in undirected graphs</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">{"\u203a"}</span>Online/streaming connectivity {"\u2014"} add edges incrementally</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O({"\u03b1"}(n)) {"\u2248"} O(1) amortized per op</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(n)</div>
                <div><span className="text-zinc-500 font-semibold">Limitation:</span> No un-union without rollback</div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 323 {"\u2014"} Number of Connected Components</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 684 {"\u2014"} Redundant Connection</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 721 {"\u2014"} Accounts Merge</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 990 {"\u2014"} Satisfiability of Equality Equations</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 305 {"\u2014"} Number of Islands II</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">{"\u2022"}</span><span className="text-zinc-400">LC 399 {"\u2014"} Evaluate Division (Weighted)</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}