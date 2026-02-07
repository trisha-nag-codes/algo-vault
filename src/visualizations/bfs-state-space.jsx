import { useState, useMemo } from "react";

/* â”€â”€â”€ Problem Input â”€â”€â”€ */
const BEGIN = "hit";
const END = "cog";
const WORD_LIST = ["hot", "dot", "dog", "lot", "log", "cog"];

/* â”€â”€â”€ Expected Output (precomputed) â”€â”€â”€ */
const EXPECTED_LENGTH = 5;
const EXPECTED_PATH = ["hit", "hot", "dot", "dog", "cog"];

/* â”€â”€â”€ Helpers â”€â”€â”€ */
function diffByOne(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) diff++; if (diff > 1) return false; }
  return diff === 1;
}

function getNeighbors(word, wordSet) {
  const result = [];
  for (const w of wordSet) { if (diffByOne(word, w)) result.push(w); }
  return result;
}

function diffChar(a, b) {
  for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) return { pos: i, from: a[i], to: b[i] }; }
  return null;
}

/* â”€â”€â”€ Build simulation steps â”€â”€â”€ */
function buildSteps() {
  const steps = [];
  const wordSet = new Set(WORD_LIST);
  const visited = new Set();
  let queue = [[BEGIN, 1]];
  visited.add(BEGIN);
  const parent = {};
  const levelNodes = { 0: [BEGIN] };
  const allEdges = [];
  const discoveredInOrder = [BEGIN];

  steps.push({
    title: "Initialize â€“ Begin Word",
    detail: `Start with "${BEGIN}". Target: "${END}". Word list has ${WORD_LIST.length} words. BFS explores words that differ by exactly 1 letter.`,
    visited: new Set(visited), queue: queue.map(x => [...x]), current: null, neighbor: null,
    level: 0, found: false, phase: "init", codeHL: [0, 2, 3, 4, 5],
    allEdges: [], levelNodes: JSON.parse(JSON.stringify(levelNodes)), path: [],
    discoveredInOrder: [...discoveredInOrder], foundPath: null,
  });

  let found = false;
  while (queue.length && !found) {
    const nextQueue = [];
    const lvl = queue[0][1];
    const nextLvl = lvl + 1;
    if (!levelNodes[lvl]) levelNodes[lvl] = [];

    for (const [word, level] of queue) {
      const neighbors = getNeighbors(word, wordSet);

      steps.push({
        title: `Process "${word}" (Level ${level - 1})`,
        detail: `Dequeue "${word}". Neighbors differing by 1 letter: ${neighbors.length > 0 ? neighbors.map(n => `"${n}"`).join(", ") : "none"}.`,
        visited: new Set(visited), queue: queue.filter(([w]) => w !== word).map(x => [...x]),
        current: word, neighbor: null, level: level - 1, found: false, phase: "process", codeHL: [7, 8],
        allEdges: [...allEdges], levelNodes: JSON.parse(JSON.stringify(levelNodes)), path: [],
        discoveredInOrder: [...discoveredInOrder], foundPath: null,
      });

      for (const nb of neighbors) {
        if (visited.has(nb)) {
          const d = diffChar(word, nb);
          steps.push({
            title: `"${word}" â†’ "${nb}" â€“ Already Visited`,
            detail: `Change '${d.from}' â†’ '${d.to}' at position ${d.pos}. But "${nb}" was already discovered. Skip.`,
            visited: new Set(visited), queue: [...nextQueue, ...queue.filter(([w]) => w !== word)].map(x => [...x]),
            current: word, neighbor: nb, level: level - 1, found: false, phase: "skip", codeHL: [10, 11, 12, 15],
            allEdges: [...allEdges], levelNodes: JSON.parse(JSON.stringify(levelNodes)), path: [],
            discoveredInOrder: [...discoveredInOrder], foundPath: null,
          });
          continue;
        }

        visited.add(nb);
        parent[nb] = word;
        allEdges.push([word, nb]);
        if (!levelNodes[level]) levelNodes[level] = [];
        levelNodes[level].push(nb);
        discoveredInOrder.push(nb);

        if (nb === END) {
          found = true;
          const path = []; let c = END;
          while (c !== undefined) { path.unshift(c); c = parent[c]; }

          steps.push({
            title: `âœ“ "${word}" â†’ "${nb}" â€“ Target Found!`,
            detail: `Reached "${END}" at level ${level}! Ladder length = ${path.length}. Path: ${path.map(w => `"${w}"`).join(" â†’ ")}.`,
            visited: new Set(visited), queue: [], current: word, neighbor: nb, level,
            found: true, phase: "found", codeHL: [13, 14],
            allEdges: [...allEdges], levelNodes: JSON.parse(JSON.stringify(levelNodes)), path,
            discoveredInOrder: [...discoveredInOrder], foundPath: path,
          });
          break;
        }

        const d = diffChar(word, nb);
        nextQueue.push([nb, nextLvl]);
        steps.push({
          title: `"${word}" â†’ "${nb}" â€“ New Word Discovered`,
          detail: `Change '${d.from}' â†’ '${d.to}' at position ${d.pos}. "${nb}" not visited. Mark visited, enqueue at level ${level}.`,
          visited: new Set(visited), queue: [...nextQueue, ...queue.filter(([w]) => w !== word)].map(x => [...x]),
          current: word, neighbor: nb, level: level - 1, found: false, phase: "discover", codeHL: [15, 16, 17],
          allEdges: [...allEdges], levelNodes: JSON.parse(JSON.stringify(levelNodes)), path: [],
          discoveredInOrder: [...discoveredInOrder], foundPath: null,
        });
      }
      if (found) break;
    }
    if (!found) queue = nextQueue;
  }
  return steps;
}

/* â”€â”€â”€ State Graph SVG â”€â”€â”€ */
function StateGraphView({ step }) {
  const { visited, current, neighbor, allEdges, path, found } = step;
  const words = [...visited];
  const positions = {};
  const levels = step.levelNodes;

  Object.entries(levels).forEach(([lvl, ws]) => {
    const l = parseInt(lvl);
    const w = 440;
    const spacing = w / (ws.length + 1);
    ws.forEach((word, i) => { positions[word] = { x: spacing * (i + 1), y: 45 + l * 65 }; });
  });

  const pathSet = new Set(path);
  const pathEdges = new Set();
  for (let i = 0; i < path.length - 1; i++) pathEdges.add(`${path[i]}-${path[i + 1]}`);

  return (
    <svg viewBox="0 0 440 360" className="w-full" style={{ maxHeight: 280 }}>
      {allEdges.map(([from, to], i) => {
        if (!positions[from] || !positions[to]) return null;
        const f = positions[from], t = positions[to];
        const dx = t.x - f.x, dy = t.y - f.y, len = Math.sqrt(dx * dx + dy * dy);
        const r = 26;
        const sx = f.x + (dx / len) * r, sy = f.y + (dy / len) * r;
        const ex = t.x - (dx / len) * r, ey = t.y - (dy / len) * r;
        const isPath = pathEdges.has(`${from}-${to}`);
        const isActive = (current === from && neighbor === to);
        const color = isPath ? "#10b981" : isActive ? "#f59e0b" : "#3f3f46";
        return (
          <g key={`e-${i}`}>
            <defs>
              <marker id={`sa-${i}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={color} />
              </marker>
            </defs>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={isPath ? 3 : isActive ? 2.5 : 1.5} markerEnd={`url(#sa-${i})`} />
          </g>
        );
      })}
      {words.map(w => {
        if (!positions[w]) return null;
        const pos = positions[w];
        const isCurr = current === w;
        const isNb = neighbor === w;
        const isOnPath = found && pathSet.has(w);
        const isTarget = w === END;
        const fill = isTarget && found ? "#10b981" : isCurr ? "#3b82f6" : isNb ? "#f59e0b" : isOnPath ? "#10b981" : "#27272a";
        const stroke = isTarget && found ? "#059669" : isCurr ? "#2563eb" : isNb ? "#d97706" : isOnPath ? "#059669" : "#52525b";
        return (
          <g key={`n-${w}`}>
            <rect x={pos.x - 24} y={pos.y - 14} width={48} height={28} rx={8} fill={fill} stroke={stroke} strokeWidth={2} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="11" fontWeight="700" fontFamily="monospace">{w}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* â”€â”€â”€ Python Code â”€â”€â”€ */
const CODE = [
  { id: 0,  text: `from collections import deque` },
  { id: 1,  text: `` },
  { id: 2,  text: `def ladderLength(begin, end, wordList):` },
  { id: 3,  text: `    word_set = set(wordList)` },
  { id: 4,  text: `    queue = deque([(begin, 1)])` },
  { id: 5,  text: `    visited = {begin}` },
  { id: 6,  text: `` },
  { id: 7,  text: `    while queue:` },
  { id: 8,  text: `        word, length = queue.popleft()` },
  { id: 9,  text: `` },
  { id: 10, text: `        for i in range(len(word)):` },
  { id: 11, text: `          for c in 'abcdefghijklmnopqrstuvwxyz':` },
  { id: 12, text: `            nxt = word[:i] + c + word[i+1:]` },
  { id: 13, text: `            if nxt == end:` },
  { id: 14, text: `                return length + 1` },
  { id: 15, text: `            if nxt in word_set and nxt not in visited:` },
  { id: 16, text: `                visited.add(nxt)` },
  { id: 17, text: `                queue.append((nxt, length + 1))` },
  { id: 18, text: `` },
  { id: 19, text: `    return 0` },
];

/* â”€â”€â”€ Input / Output Panel â”€â”€â”€ */
function IOPanel({ step }) {
  const { phase, foundPath, discoveredInOrder } = step;
  const done = phase === "found";
  const pathMatch = done && foundPath && foundPath.length === EXPECTED_LENGTH;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Input</div>
        <div className="font-mono text-xs text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">begin</span> = <span className="text-blue-400">"{BEGIN}"</span></div>
          <div><span className="text-zinc-500">end</span> = <span className="text-blue-400">"{END}"</span></div>
          <div><span className="text-zinc-500">wordList</span> = [</div>
          {WORD_LIST.map((w, i) => (
            <div key={i} className="pl-4">
              <span className="text-zinc-300">"{w}"{i < WORD_LIST.length - 1 ? "," : ""}</span>
            </div>
          ))}
          <div>]</div>
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Expected Output</div>
        <div className="font-mono text-xs space-y-0.5">
          <div><span className="text-zinc-500">length = </span><span className="text-zinc-300">{EXPECTED_LENGTH}</span></div>
          <div><span className="text-zinc-500">path = </span><span className="text-zinc-300">{EXPECTED_PATH.join(" â†’ ")}</span></div>
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {pathMatch && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-xs space-y-1">
          <div>
            <span className="text-zinc-500">discovered = </span>
            <span className="text-zinc-400">{discoveredInOrder.length} words</span>
          </div>
          <div>
            <span className="text-zinc-500">result = </span>
            {done
              ? <span className="text-emerald-300 font-bold">{foundPath.length}</span>
              : <span className="text-zinc-600">searching...</span>}
          </div>
        </div>
        {done && foundPath && (
          <div className="mt-2 space-y-0.5">
            {foundPath.map((w, i) => {
              const d = i > 0 ? diffChar(foundPath[i - 1], w) : null;
              return (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-zinc-600 font-mono w-4">{i + 1}.</span>
                  <span className="text-emerald-400/80 font-mono">{w}</span>
                  {d && (
                    <span className="text-zinc-700 ml-1">
                      [{d.pos}] '{d.from}'â†’'{d.to}'
                    </span>
                  )}
                  {w === END && <span className="text-emerald-600">âœ“</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* â”€â”€â”€ Code Panel â”€â”€â”€ */
function CodePanel({ highlightLines }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {CODE.map((line) => {
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

/* â”€â”€â”€ Navigation Bar â”€â”€â”€ */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button
        onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >â† Prev</button>
      <div className="flex gap-1.5">
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

/* â”€â”€â”€ Main Component â”€â”€â”€ */
export default function BFSStateSpaceViz() {
  const steps = useMemo(() => buildSteps(), []);
  const [si, setSi] = useState(0);
  const step = steps[si];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold tracking-tight">BFS on State Space</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Implicit Graph â€“ Word Ladder: "{BEGIN}" â†’ "{END}"</p>
        </div>

        {/* Core Idea */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            The graph isn't given explicitly â€” each <strong className="text-zinc-300">word is a state</strong>, and two words are connected by an edge if they differ by exactly <strong className="text-zinc-300">one letter</strong>. BFS explores states level by level, so the first time we reach the target word it's via the <strong className="text-zinc-300">shortest transformation sequence</strong>. This pattern applies to any problem asking "minimum moves to reach X" â€” puzzles, lock combos, game states.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-3">
          <NavBar si={si} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 3-COLUMN GRID â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* â”€â”€ COL 1: IO + Graph â”€â”€ */}
          <div className="col-span-3 space-y-3">
            <IOPanel step={step} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">BFS tree â€“ levels = transformation steps</div>
              <StateGraphView step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Neighbor</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Path</span>
              </div>
            </div>
          </div>

          {/* â”€â”€ COL 2: Steps + State â”€â”€ */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${step.phase === "found" ? "bg-emerald-950/30 border-emerald-900" : "bg-zinc-900 border-zinc-800"}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {si + 1}/{steps.length}</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                  step.phase === "found" ? "bg-emerald-900 text-emerald-300" :
                  step.phase === "discover" ? "bg-blue-900 text-blue-300" :
                  step.phase === "process" ? "bg-blue-900 text-blue-300" :
                  step.phase === "skip" ? "bg-red-900 text-red-300" :
                  "bg-zinc-800 text-zinc-400"
                }`}>{step.phase}</span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* Queue & Visited */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Queue</div>
                  <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                    {step.queue.length > 0
                      ? step.queue.map(([w, l], i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-1.5 h-7 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold text-[10px]">
                            {w}<span className="text-blue-600 text-[9px]">L{l - 1}</span>
                          </span>
                        ))
                      : <span className="text-[10px] text-zinc-600 italic">empty</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Visited</div>
                  <div className="flex gap-1 flex-wrap min-h-[28px] items-center">
                    {[...step.visited].map(w => (
                      <span key={w} className="inline-flex items-center justify-center px-1.5 h-7 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold text-[10px]">{w}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Words by level */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Words by Level</div>
              <div className="space-y-1">
                {Object.entries(step.levelNodes).map(([lvl, ws]) => (
                  ws.length > 0 && (
                    <div key={lvl} className="flex items-center gap-2">
                      <span className="text-[9px] text-zinc-600 font-mono w-6">L{lvl}:</span>
                      <div className="flex gap-1 flex-wrap">
                        {ws.map(w => {
                          const isOnPath = step.found && step.path.includes(w);
                          return (
                            <span key={w} className={`inline-flex items-center justify-center px-1.5 h-5 rounded text-[10px] font-mono font-bold ${
                              isOnPath ? "bg-emerald-950 border border-emerald-800 text-emerald-300" :
                              "bg-zinc-800 border border-zinc-700 text-zinc-400"
                            }`}>{w}</span>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Shortest path (shown when found) */}
            {step.found && step.path.length > 0 && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Shortest Ladder (length {step.path.length})</div>
                <div className="flex gap-1 items-center font-mono text-xs flex-wrap">
                  {step.path.map((w, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center px-2 h-7 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">{w}</span>
                      {i < step.path.length - 1 && <span className="text-emerald-700 text-xs">â†’</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* â”€â”€ COL 3: Code â”€â”€ */}
          <div className="col-span-4">
            <CodePanel highlightLines={step.codeHL} />
          </div>

        </div>

        {/* â•â•â• BOTTOM ROW: When to Use + Classic Problems â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Minimum moves/operations to transform one state to another</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Puzzle solving â€” sliding puzzles, lock combinations, word ladders</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Implicit graphs â€” states generated on the fly, not pre-built</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Unweighted shortest path where each transition costs 1</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(MÂ² Ã— N) for word ladder (M=word length, N=list size)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(N) for visited set + queue</div>
                <div><span className="text-zinc-500 font-semibold">Key insight:</span> Bound the state space to avoid TLE</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 127 â€” Word Ladder</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 752 â€” Open the Lock</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 773 â€” Sliding Puzzle</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 1091 â€” Shortest Path in Binary Matrix</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 433 â€” Minimum Genetic Mutation</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 815 â€” Bus Routes</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
