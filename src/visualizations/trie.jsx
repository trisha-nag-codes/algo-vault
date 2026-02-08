import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════
   TRIE (PREFIX TREE)  —  3 Classic Problems
   LC 208 Implement Trie · LC 211 Add & Search Words · LC 212 Word Search II
   ═══════════════════════════════════════════════════════════ */

/* ─── Problem Definitions ─── */
const PROBLEMS = {
  implement: {
    title: "Implement Trie",
    subtitle: "LC 208 · insert / search / startsWith",
    coreIdea: "A trie stores strings character-by-character in a tree. Each node has up to 26 children. Shared prefixes share nodes — \"apple\" and \"app\" share the first 3 nodes. Insert walks/creates nodes and marks the last node as a word-end. Search follows the path and checks the end flag. startsWith just checks the path exists. All operations are O(word length).",
  },
  wildcard: {
    title: "Add & Search Words",
    subtitle: "LC 211 · search with '.' wildcard",
    coreIdea: "Same trie structure, but search(\"b.d\") must handle '.' which matches any character. When we hit a '.', we can't follow a single path — instead we DFS through ALL children at that level. If any branch reaches the end with is_end=True, return True. This is backtracking on the trie itself.",
  },
  wordsearch: {
    title: "Word Search II",
    subtitle: "LC 212 · Trie + Grid DFS",
    coreIdea: "Build a trie from the word list, then DFS from every cell in the grid. At each cell, check if the current character exists as a trie child. If yes, move to that trie node and explore all 4 neighbors. When a trie node is marked as a word-end, record the word. This replaces searching each word independently — the trie prunes impossible prefixes immediately.",
  },
};

/* ═══════════════════════════════════════════════
   CODE PANELS
   ═══════════════════════════════════════════════ */
const CODES = {
  implement: [
    { id: 0,  text: `class TrieNode:` },
    { id: 1,  text: `    def __init__(self):` },
    { id: 2,  text: `        self.children = {}` },
    { id: 3,  text: `        self.is_end = False` },
    { id: 4,  text: `` },
    { id: 5,  text: `def insert(root, word):` },
    { id: 6,  text: `    node = root` },
    { id: 7,  text: `    for ch in word:` },
    { id: 8,  text: `        if ch not in node.children:` },
    { id: 9,  text: `            node.children[ch] = TrieNode()` },
    { id: 10, text: `        node = node.children[ch]` },
    { id: 11, text: `    node.is_end = True` },
    { id: 12, text: `` },
    { id: 13, text: `def search(root, word):` },
    { id: 14, text: `    node = root` },
    { id: 15, text: `    for ch in word:` },
    { id: 16, text: `        if ch not in node.children:` },
    { id: 17, text: `            return False` },
    { id: 18, text: `        node = node.children[ch]` },
    { id: 19, text: `    return node.is_end` },
    { id: 20, text: `` },
    { id: 21, text: `def startsWith(root, prefix):` },
    { id: 22, text: `    node = root` },
    { id: 23, text: `    for ch in prefix:` },
    { id: 24, text: `        if ch not in node.children:` },
    { id: 25, text: `            return False` },
    { id: 26, text: `        node = node.children[ch]` },
    { id: 27, text: `    return True` },
  ],
  wildcard: [
    { id: 0,  text: `class WordDictionary:` },
    { id: 1,  text: `    def __init__(self):` },
    { id: 2,  text: `        self.children = {}` },
    { id: 3,  text: `        self.is_end = False` },
    { id: 4,  text: `` },
    { id: 5,  text: `    def addWord(self, word):` },
    { id: 6,  text: `        node = self` },
    { id: 7,  text: `        for ch in word:` },
    { id: 8,  text: `            if ch not in node.children:` },
    { id: 9,  text: `                node.children[ch] = WordDictionary()` },
    { id: 10, text: `            node = node.children[ch]` },
    { id: 11, text: `        node.is_end = True` },
    { id: 12, text: `` },
    { id: 13, text: `    def search(self, word):` },
    { id: 14, text: `        def dfs(node, i):` },
    { id: 15, text: `            if i == len(word):` },
    { id: 16, text: `                return node.is_end` },
    { id: 17, text: `            if word[i] == '.':` },
    { id: 18, text: `                for child in node.children.values():` },
    { id: 19, text: `                    if dfs(child, i + 1):` },
    { id: 20, text: `                        return True` },
    { id: 21, text: `                return False` },
    { id: 22, text: `            if word[i] not in node.children:` },
    { id: 23, text: `                return False` },
    { id: 24, text: `            return dfs(node.children[word[i]], i+1)` },
    { id: 25, text: `        return dfs(self, 0)` },
  ],
  wordsearch: [
    { id: 0,  text: `def findWords(board, words):` },
    { id: 1,  text: `    root = buildTrie(words)` },
    { id: 2,  text: `    result, R, C = [], len(board), len(board[0])` },
    { id: 3,  text: `` },
    { id: 4,  text: `    def dfs(r, c, node):` },
    { id: 5,  text: `        ch = board[r][c]` },
    { id: 6,  text: `        if ch not in node.children: return` },
    { id: 7,  text: `        node = node.children[ch]` },
    { id: 8,  text: `        if node.word:` },
    { id: 9,  text: `            result.append(node.word)` },
    { id: 10, text: `            node.word = None  # de-dup` },
    { id: 11, text: `        board[r][c] = '#'  # visited` },
    { id: 12, text: `        for dr, dc in dirs:` },
    { id: 13, text: `            nr, nc = r+dr, c+dc` },
    { id: 14, text: `            if 0<=nr<R and 0<=nc<C and board[nr][nc]!='#':` },
    { id: 15, text: `                dfs(nr, nc, node)` },
    { id: 16, text: `        board[r][c] = ch  # restore` },
    { id: 17, text: `` },
    { id: 18, text: `    for r in range(R):` },
    { id: 19, text: `        for c in range(C):` },
    { id: 20, text: `            dfs(r, c, root)` },
    { id: 21, text: `    return result` },
  ],
};

/* ═══════════════════════════════════════════════
   TRIE UTILITIES
   ═══════════════════════════════════════════════ */
let _nodeId = 0;
function makeNode(ch) { return { char: ch, children: {}, isEnd: false, id: _nodeId++, word: null }; }

function cloneTree(node) {
  const copy = { char: node.char, children: {}, isEnd: node.isEnd, id: node.id, word: node.word };
  for (const [ch, child] of Object.entries(node.children)) copy.children[ch] = cloneTree(child);
  return copy;
}

function flattenTree(node, parentId = -1, depth = 0) {
  const result = [{ id: node.id, char: node.char, isEnd: node.isEnd, parentId, depth }];
  for (const child of Object.values(node.children)) result.push(...flattenTree(child, node.id, depth + 1));
  return result;
}

function collectWords(node, prefix) {
  const words = [];
  if (node.isEnd) words.push(prefix);
  for (const [ch, child] of Object.entries(node.children)) words.push(...collectWords(child, prefix + ch));
  return words;
}

/* ═══════════════════════════════════════════════
   BUILD STEPS — LC 208 Implement Trie
   ═══════════════════════════════════════════════ */
function buildImplementSteps() {
  _nodeId = 0;
  const root = makeNode("∅");
  const WORDS = ["apple", "app", "apt", "bat", "bar"];
  const steps = [];
  const inserted = [];

  function snap(title, detail, phase, codeHL, word, pathIds, hlNode, newNodes, searchResult) {
    steps.push({
      title, detail, phase, codeHL,
      tree: cloneTree(root), flat: flattenTree(root),
      currentWord: word, currentPath: pathIds ? [...pathIds] : [],
      highlightNode: hlNode, newNodes: newNodes ? [...newNodes] : [],
      searchResult: searchResult || null,
      inserted: [...inserted],
      finalized: { wordsInserted: inserted.length },
    });
  }

  snap("Initialize — Empty trie with root node",
    `Insert words: [${WORDS.map(w => `"${w}"`).join(", ")}], then test search and startsWith queries.`,
    "init", [0, 1, 2, 3], null, [], -1, [], null);

  // Insert each word
  for (const word of WORDS) {
    let node = root;
    const pathIds = [root.id];
    const newNodes = [];
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch);
        newNodes.push(node.children[ch].id);
      }
      node = node.children[ch];
      pathIds.push(node.id);
    }
    node.isEnd = true;
    inserted.push(word);

    snap(
      `Insert "${word}" — ${newNodes.length > 0 ? `${newNodes.length} new node(s)` : "all nodes shared"}`,
      newNodes.length > 0
        ? `Traverse/create path: ${word.split("").join("→")}. Created ${newNodes.length} new node(s). Marked '${word[word.length - 1]}' as word-end. ${inserted.length}/${WORDS.length} inserted.`
        : `Path "${word}" already exists (shared prefix). Just mark '${word[word.length - 1]}' as word-end.`,
      "insert", [5, 6, 7, 8, 9, 10, 11], word, pathIds, node.id, newNodes, null
    );
  }

  // Search queries
  const queries = [
    { q: "apple", op: "search" }, { q: "app", op: "search" },
    { q: "ap", op: "search" }, { q: "bat", op: "search" },
    { q: "ap", op: "startsWith" }, { q: "ba", op: "startsWith" },
    { q: "cap", op: "startsWith" },
  ];

  for (const { q, op } of queries) {
    let node = root;
    const pathIds = [root.id];
    let found = true;
    for (const ch of q) {
      if (!node.children[ch]) { found = false; break; }
      node = node.children[ch];
      pathIds.push(node.id);
    }
    const isWord = found && node.isEnd;
    const result = op === "search" ? isWord : found;
    const words = found ? collectWords(node, q) : [];

    snap(
      `${op}("${q}") → ${result}`,
      op === "search"
        ? (isWord ? `"${q}" found — path exists and node is marked as word-end.` :
           found ? `Path "${q}" exists but is_end=False — it's a prefix, not a stored word.` :
           `"${q}" not found — path breaks at '${q[pathIds.length - 1]}'.`)
        : (found ? `Prefix "${q}" exists. Matching words: [${words.map(w => `"${w}"`).join(", ")}].` :
           `Prefix "${q}" not found — no words start with "${q}".`),
      result ? "searchHit" : "searchMiss",
      op === "search" ? [13, 14, 15, 16, 17, 18, 19] : [21, 22, 23, 24, 25, 26, 27],
      q, pathIds, found ? node.id : -1, [],
      { query: q, op, result, words: result && op === "startsWith" ? words : [] }
    );
  }

  snap(
    `✓ Complete — ${WORDS.length} words, ${_nodeId} nodes`,
    `Shared prefixes: "ap" (apple, app, apt), "ba" (bat, bar). Insert O(k), search O(k), startsWith O(k) where k = word length.`,
    "done", [0, 1, 2, 3], null, [], -1, [], null
  );

  return steps;
}

/* ═══════════════════════════════════════════════
   BUILD STEPS — LC 211 Add & Search Words (wildcard)
   ═══════════════════════════════════════════════ */
function buildWildcardSteps() {
  _nodeId = 0;
  const root = makeNode("∅");
  const WORDS = ["bad", "dad", "mad", "pad", "bat"];
  const steps = [];
  const inserted = [];

  function snap(title, detail, phase, codeHL, word, pathIds, hlNode, newNodes, searchResult, dfsPath) {
    steps.push({
      title, detail, phase, codeHL,
      tree: cloneTree(root), flat: flattenTree(root),
      currentWord: word, currentPath: pathIds ? [...pathIds] : [],
      highlightNode: hlNode, newNodes: newNodes ? [...newNodes] : [],
      searchResult: searchResult || null,
      inserted: [...inserted],
      finalized: { wordsInserted: inserted.length },
      dfsPath: dfsPath ? [...dfsPath] : [],
    });
  }

  snap("Initialize — Empty trie",
    `Insert words: [${WORDS.map(w => `"${w}"`).join(", ")}], then search with '.' wildcards.`,
    "init", [0, 1, 2, 3], null, [], -1, [], null, []);

  // Insert words
  for (const word of WORDS) {
    let node = root;
    const pathIds = [root.id];
    const newNodes = [];
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = makeNode(ch);
        newNodes.push(node.children[ch].id);
      }
      node = node.children[ch];
      pathIds.push(node.id);
    }
    node.isEnd = true;
    inserted.push(word);

    snap(
      `addWord("${word}") — ${newNodes.length} new node(s)`,
      `Path: ${word.split("").join("→")}. ${newNodes.length > 0 ? `Created ${newNodes.length} node(s).` : "Shared prefix."} Mark end. ${inserted.length}/${WORDS.length} inserted.`,
      "insert", [5, 6, 7, 8, 9, 10, 11], word, pathIds, node.id, newNodes, null, []
    );
  }

  // Wildcard search queries
  const wildcardQueries = [
    { q: "bad", expect: true, desc: "exact match, no wildcard" },
    { q: ".ad", expect: true, desc: "'.' matches b/d/m/p → bad, dad, mad, pad all match" },
    { q: "b..", expect: true, desc: "'b' then any two → bad, bat both match" },
    { q: "b.d", expect: true, desc: "b?d → bad matches" },
    { q: "..t", expect: true, desc: "??t → bat matches" },
    { q: "..x", expect: false, desc: "??x → no word ends with 'x'" },
  ];

  for (const { q, expect, desc } of wildcardQueries) {
    // Trace DFS for the search
    let result = false;
    const dfsVisited = [];

    function dfs(node, i, path) {
      if (result) return;
      if (i === q.length) {
        dfsVisited.push({ nodeId: node.id, char: node.char, match: node.isEnd });
        if (node.isEnd) result = true;
        return;
      }
      if (q[i] === ".") {
        for (const [ch, child] of Object.entries(node.children)) {
          dfsVisited.push({ nodeId: child.id, char: ch, wildcard: true });
          dfs(child, i + 1, [...path, child.id]);
          if (result) return;
        }
      } else {
        if (!node.children[q[i]]) return;
        const child = node.children[q[i]];
        dfsVisited.push({ nodeId: child.id, char: q[i], wildcard: false });
        dfs(child, i + 1, [...path, child.id]);
      }
    }

    dfs(root, 0, [root.id]);
    const visitedIds = dfsVisited.map(d => d.id);

    snap(
      `search("${q}") → ${result}`,
      `${desc}. DFS visited ${dfsVisited.length} node(s). ${q.includes(".") ? `'.' branches to ALL children at that level.` : "No wildcards — direct path follow."}`,
      result ? "searchHit" : "searchMiss",
      q.includes(".") ? [13, 14, 15, 16, 17, 18, 19, 20, 21] : [13, 14, 15, 16, 22, 23, 24],
      q, visitedIds, -1, [],
      { query: q, op: "search", result, words: [] },
      dfsVisited
    );
  }

  snap(
    `✓ Complete — Wildcard search demonstrated`,
    `'.' triggers DFS through all children. Worst case O(26^k) for all-dots, but in practice the trie prunes aggressively. Standard search remains O(k).`,
    "done", [0, 1, 2, 3], null, [], -1, [], null, []
  );

  return steps;
}

/* ═══════════════════════════════════════════════
   BUILD STEPS — LC 212 Word Search II (Trie + Grid)
   ═══════════════════════════════════════════════ */
function buildWordSearchSteps() {
  _nodeId = 0;
  const root = makeNode("∅");
  const BOARD = [
    ["o", "a", "a", "n"],
    ["e", "t", "a", "e"],
    ["i", "h", "k", "r"],
    ["i", "f", "l", "v"],
  ];
  const WORDS = ["oath", "eat", "rain", "hike"];
  const R = 4, C = 4;
  const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const steps = [];
  const found = [];

  // Build trie
  for (const word of WORDS) {
    let node = root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = makeNode(ch);
      node = node.children[ch];
    }
    node.isEnd = true;
    node.word = word;
  }

  function snap(title, detail, phase, codeHL, gridHL, triePathIds, hlNode) {
    steps.push({
      title, detail, phase, codeHL,
      tree: cloneTree(root), flat: flattenTree(root),
      currentPath: triePathIds ? [...triePathIds] : [],
      highlightNode: hlNode,
      gridHighlight: gridHL ? gridHL.map(c => [...c]) : [],
      found: [...found],
      finalized: { found: found.length },
      board: BOARD, words: WORDS,
    });
  }

  snap(
    "Initialize — Build trie from word list",
    `Words: [${WORDS.map(w => `"${w}"`).join(", ")}]. Trie built with ${_nodeId} nodes. Now DFS from every cell, following trie branches. If trie node has word → record it.`,
    "init", [0, 1, 2], [], [], -1
  );

  // Simulate DFS — we'll show key discoveries, not every cell
  // Trace "oath": (0,0)o → (1,0)e... no, let's trace the actual path
  // oath: o(0,0) → a(0,1) → t(1,1) → h(2,1)
  const oathPath = [[0, 0], [0, 1], [1, 1], [2, 1]];
  const oathTrieIds = [root.id];
  let n = root;
  for (const ch of "oath") { n = n.children[ch]; oathTrieIds.push(n.id); }

  snap(
    'DFS from (0,0)="o" — following trie',
    `board[0][0]='o' is a child of trie root. Start DFS. Path: o→a→t→h traces through the trie.`,
    "explore", [4, 5, 6, 7, 18, 19, 20], oathPath.slice(0, 1), oathTrieIds.slice(0, 2), oathTrieIds[1]
  );

  snap(
    'Path o→a→t→h — found "oath"!',
    `(0,0)o → (0,1)a → (1,1)t → (2,1)h. Trie node for 'h' has word="oath". Record it and set word=None to de-duplicate.`,
    "found", [8, 9, 10], oathPath, oathTrieIds, oathTrieIds[4]
  );
  found.push("oath");
  // De-dup in trie
  n.word = null; n.isEnd = false;

  // Trace "eat": e(1,0) → a(0,1) → t(1,1)
  const eatPath = [[1, 0], [0, 0]]; // start from e, need to find e→a→t
  // Actually eat: e is at (1,0), a at (1,2) or (0,1), t at (1,1)
  // e(1,0) → ... we need a→t. From e(1,0), neighbors are o(0,0), t(1,1), i(2,0). t is in trie under e→a→t, but we need 'a' first.
  // Actually let's trace: e(1,3) → a(0,3)... no. e→a→t:
  // e at (1,0): neighbors are o(0,0), t(1,1), i(2,0) — none is 'a' child of 'e' in trie? 
  // Wait — trie has e→a→t. From e(1,0) we need neighbor 'a'. (0,1) is 'a' but not adjacent to (1,0). 
  // e at (1,3): neighbors are n(0,3), a(1,2)... hmm (1,2) is 'a'. Then from a(1,2) neighbors include t(1,1)? No, (1,2) neighbors are (0,2)a, (1,1)t, (1,3)e, (2,2)k. Yes! t at (1,1).
  const eatPathReal = [[1, 3], [1, 2], [1, 1]];
  const eatTrieIds = [root.id];
  n = root;
  for (const ch of "eat") { n = n.children[ch]; eatTrieIds.push(n.id); }

  snap(
    'DFS from (1,3)="e" — exploring',
    `board[1][3]='e' matches trie. Neighbor (1,2)='a' is a trie child of 'e'. Continue.`,
    "explore", [4, 5, 6, 7, 12, 13, 14, 15], eatPathReal.slice(0, 2), eatTrieIds.slice(0, 3), eatTrieIds[2]
  );

  snap(
    'Path e→a→t — found "eat"!',
    `(1,3)e → (1,2)a → (1,1)t. Trie node for 't' has word="eat". Record it.`,
    "found", [8, 9, 10], eatPathReal, eatTrieIds, eatTrieIds[3]
  );
  found.push("eat");

  // Try "rain" — r at (2,3): r→a→i→n? a at (1,2) or (0,2)
  // r(2,3) → a(1,3)? No, (1,3) is 'e'. Neighbors of (2,3): (1,3)e, (3,3)v, (2,2)k. No 'a'. 
  // Hmm. Actually board: row2 = [i, h, k, r]. r is at (2,3). neighbors: (1,3)=e, (3,3)=v, (2,2)=k. No 'a' neighbor.
  // So "rain" can't be found. Let me verify: r only at (2,3). Its neighbors don't have 'a'. Correct.
  snap(
    'DFS from (2,3)="r" — trie has r→a→i→n',
    `board[2][3]='r' matches trie root child. But neighbors of (2,3) are 'e','v','k' — none is 'a'. Trie prunes immediately. No "rain" path exists.`,
    "prune", [4, 5, 6, 12, 13, 14], [[2, 3]], [root.id, root.children["r"].id], root.children["r"].id
  );

  // Try "hike" — h at (2,1): h→i→k→e
  // h(2,1) neighbors: (1,1)t, (3,1)f, (2,0)i, (2,2)k
  // i at (2,0)! then from i(2,0): neighbors (1,0)e, (3,0)i, (2,1)h(visited). Need 'k' — not adjacent.
  // What about h(2,1) → i? Trie: h→i→k→e. From h(2,1), neighbor i is at (2,0) or (3,0).
  // i(2,0): neighbors (1,0)e, (3,0)i, (2,1)h. No 'k'. 
  // i(3,0): neighbors (2,0)i, (3,1)f. No 'k'.
  // Actually wait — from h(2,1), (2,2) is 'k'. But trie needs h→i first, not h→k.
  // So we can't spell hike starting from h. Let me check other 'h' — there's no other h.
  // "hike" is not findable. Good, that matches the classic LC 212 example.

  snap(
    'DFS from (2,1)="h" — trie has h→i→k→e',
    `board[2][1]='h' matches trie. Need 'i' next — neighbors are t(1,1), f(3,1), i(2,0), k(2,2). Follow i(2,0), but from i, need 'k' — neighbors are e(1,0), i(3,0), h(2,1). No 'k'. Dead end. "hike" not found on this board.`,
    "prune", [4, 5, 6, 7, 12, 13, 14],
    [[2, 1], [2, 0]],
    [root.id, root.children["h"].id, root.children["h"].children["i"].id],
    root.children["h"].children["i"].id
  );

  snap(
    `✓ Complete — Found ${found.length}/${WORDS.length} words`,
    `Found: [${found.map(w => `"${w}"`).join(", ")}]. Not found: [${WORDS.filter(w => !found.includes(w)).map(w => `"${w}"`).join(", ")}]. Trie prunes impossible prefixes at each DFS step — far faster than searching each word independently.`,
    "done", [21], [], [], -1
  );

  return steps;
}

/* ═══════════════════════════════════════════════
   STEP BUILDER DISPATCH
   ═══════════════════════════════════════════════ */
function buildStepsFor(key) {
  switch (key) {
    case "implement": return buildImplementSteps();
    case "wildcard": return buildWildcardSteps();
    case "wordsearch": return buildWordSearchSteps();
    default: return [];
  }
}

/* ═══════════════════════════════════════════════
   TREE VISUALIZATION
   ═══════════════════════════════════════════════ */
function TreeView({ step }) {
  const { flat, currentPath, highlightNode, newNodes } = step;
  const pathSet = new Set(currentPath || []);
  const newSet = new Set(newNodes || []);

  const byDepth = {};
  flat.forEach(n => {
    if (!byDepth[n.depth]) byDepth[n.depth] = [];
    byDepth[n.depth].push(n);
  });
  const maxDepth = Math.max(...flat.map(n => n.depth), 0);
  const totalW = 460;
  const rowH = 46;
  const positions = {};

  Object.entries(byDepth).forEach(([d, nodes]) => {
    const spacing = totalW / (nodes.length + 1);
    nodes.forEach((n, i) => {
      positions[n.id] = { x: spacing * (i + 1), y: Number(d) * rowH + 22 };
    });
  });

  const h = (maxDepth + 1) * rowH + 10;

  return (
    <svg viewBox={`0 0 ${totalW} ${Math.min(h, 310)}`} className="w-full" style={{ maxHeight: 280 }}>
      {flat.filter(n => n.parentId >= 0 && positions[n.id] && positions[n.parentId]).map(n => {
        const from = positions[n.parentId], to = positions[n.id];
        const onPath = pathSet.has(n.id) && pathSet.has(n.parentId);
        return (
          <line key={`e-${n.id}`} x1={from.x} y1={from.y + 12} x2={to.x} y2={to.y - 12}
            stroke={onPath ? "#3b82f6" : "#3f3f46"} strokeWidth={onPath ? 2.5 : 1} />
        );
      })}
      {flat.map(n => {
        const pos = positions[n.id];
        if (!pos) return null;
        const isOnPath = pathSet.has(n.id);
        const isHL = n.id === highlightNode;
        const isNew = newSet.has(n.id);
        let fill = "#27272a", stroke = "#3f3f46";
        if (isHL) { fill = "#1e3a8a"; stroke = "#3b82f6"; }
        else if (isNew) { fill = "#312e81"; stroke = "#6366f1"; }
        else if (isOnPath) { fill = "#1e3a5f"; stroke = "#3b82f6"; }
        return (
          <g key={`n-${n.id}`}>
            <circle cx={pos.x} cy={pos.y} r={13} fill={fill} stroke={stroke} strokeWidth={isHL ? 2.5 : 1.5} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
              fill={isHL ? "#93c5fd" : isOnPath ? "#93c5fd" : "#a1a1aa"}
              fontSize="11" fontWeight="700" fontFamily="monospace">{n.char}</text>
            {n.isEnd && (
              <circle cx={pos.x + 10} cy={pos.y - 10} r={3.5} fill="#10b981" stroke="#059669" strokeWidth={1} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   GRID VIEW (for LC 212)
   ═══════════════════════════════════════════════ */
function GridView({ step }) {
  if (!step.board) return null;
  const { board, gridHighlight } = step;
  const R = board.length, C = board[0].length;
  const cell = 44;
  const hlSet = new Set((gridHighlight || []).map(([r, c]) => `${r},${c}`));
  const hlList = gridHighlight || [];

  return (
    <svg viewBox={`0 0 ${C * cell + 8} ${R * cell + 8}`} className="w-full" style={{ maxHeight: 200 }}>
      {Array.from({ length: R }, (_, r) =>
        Array.from({ length: C }, (_, c) => {
          const k = `${r},${c}`;
          const isHL = hlSet.has(k);
          const hlIdx = hlList.findIndex(([hr, hc]) => hr === r && hc === c);
          const isStart = hlIdx === 0;
          const isEnd = hlIdx === hlList.length - 1 && hlList.length > 1;
          let fill = "#18181b";
          if (isEnd && step.phase === "found") fill = "#065f46";
          else if (isStart) fill = "#1e3a8a";
          else if (isHL) fill = "#1e3a5f";
          return (
            <g key={k}>
              <rect x={4 + c * cell} y={4 + r * cell} width={cell - 1} height={cell - 1}
                fill={fill} stroke={isHL ? "#3b82f6" : "#3f3f46"} strokeWidth={isHL ? 2 : 0.5} rx={4} />
              <text x={4 + c * cell + cell / 2} y={4 + r * cell + cell / 2 + 1}
                textAnchor="middle" dominantBaseline="central"
                fill={isHL ? "#93c5fd" : "#a1a1aa"}
                fontSize="14" fontWeight="600" fontFamily="monospace">{board[r][c]}</text>
            </g>
          );
        })
      )}
      {/* Draw path lines between highlighted cells */}
      {hlList.length > 1 && hlList.slice(1).map(([r, c], i) => {
        const [pr, pc] = hlList[i];
        return (
          <line key={`p-${i}`}
            x1={4 + pc * cell + cell / 2} y1={4 + pr * cell + cell / 2}
            x2={4 + c * cell + cell / 2} y2={4 + r * cell + cell / 2}
            stroke="#3b82f680" strokeWidth={3} strokeLinecap="round" />
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   IO PANEL
   ═══════════════════════════════════════════════ */
function IOPanel({ pKey, step }) {
  const done = step.phase === "done";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          {pKey === "implement" && <>
            <div><span className="text-zinc-500">words</span> = <span className="text-zinc-300">["apple","app",</span></div>
            <div className="pl-8"><span className="text-zinc-300">"apt","bat","bar"]</span></div>
          </>}
          {pKey === "wildcard" && <>
            <div><span className="text-zinc-500">words</span> = <span className="text-zinc-300">["bad","dad","mad",</span></div>
            <div className="pl-8"><span className="text-zinc-300">"pad","bat"]</span></div>
          </>}
          {pKey === "wordsearch" && <>
            <div><span className="text-zinc-500">board</span> = <span className="text-zinc-300">4×4</span></div>
            <div><span className="text-zinc-500">words</span> = <span className="text-zinc-300">["oath","eat",</span></div>
            <div className="pl-8"><span className="text-zinc-300">"rain","hike"]</span></div>
          </>}
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px] text-zinc-300">
          {pKey === "implement" && <div>search/startsWith results</div>}
          {pKey === "wildcard" && <div>wildcard search results</div>}
          {pKey === "wordsearch" && <div>["oath", "eat"]</div>}
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          {(pKey === "implement" || pKey === "wildcard") && (
            <div>
              <span className="text-zinc-500">inserted: </span>
              <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>
                {step.inserted?.length || 0} words
              </span>
              {step.searchResult && (
                <div className="mt-1">
                  <span className="text-zinc-500">{step.searchResult.op}("{step.searchResult.query}") = </span>
                  <span className={step.searchResult.result ? "text-emerald-300 font-bold" : "text-red-400"}>
                    {step.searchResult.result ? "True" : "False"}
                  </span>
                </div>
              )}
            </div>
          )}
          {pKey === "wordsearch" && (
            <div>
              <span className="text-zinc-500">[</span>
              {step.found.length === 0
                ? <span className="text-zinc-600">?</span>
                : step.found.map((w, i) => (
                  <span key={i}>
                    <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>"{w}"</span>
                    {i < step.found.length - 1 && <span className="text-zinc-600">, </span>}
                  </span>
                ))
              }
              <span className="text-zinc-500">]</span>
              <div className="text-[10px] text-zinc-600 mt-0.5">
                {step.found.length}/{step.words?.length || 0} words found
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CODE PANEL
   ═══════════════════════════════════════════════ */
function CodePanel({ pKey, highlightLines }) {
  const code = CODES[pKey] || [];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {code.map((line) => {
          const hl = highlightLines.includes(line.id);
          return (
            <div key={line.id}
              className={`px-2 rounded-sm ${
                hl ? "bg-blue-500/15 text-blue-300" : line.text === "" ? "" : "text-zinc-500"
              }`}>
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

/* ═══════════════════════════════════════════════
   NAV BAR
   ═══════════════════════════════════════════════ */
function NavBar({ si, setSi, total }) {
  const useDots = total <= 25;
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >← Prev</button>
      <div className="flex gap-1.5 flex-wrap justify-center max-w-[60%]">
        {useDots
          ? Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => setSi(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === si ? "bg-blue-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`} />
          ))
          : <>
            <button onClick={() => setSi(0)} className={`px-2 py-0.5 text-xs rounded ${si === 0 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>Start</button>
            <input type="range" min={0} max={total - 1} value={si}
              onChange={(e) => setSi(Number(e.target.value))} className="w-32 accent-blue-500" />
            <span className="text-xs text-zinc-500 font-mono">{si + 1}/{total}</span>
            <button onClick={() => setSi(total - 1)} className={`px-2 py-0.5 text-xs rounded ${si >= total - 1 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>End</button>
          </>
        }
      </div>
      <button onClick={() => setSi(Math.min(total - 1, si + 1))} disabled={si >= total - 1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >Next →</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PHASE BADGE
   ═══════════════════════════════════════════════ */
function phaseStyle(phase) {
  switch (phase) {
    case "insert": return "bg-violet-900 text-violet-300";
    case "found": case "searchHit": return "bg-emerald-900 text-emerald-300";
    case "searchMiss": case "prune": return "bg-red-900 text-red-300";
    case "explore": return "bg-blue-900 text-blue-300";
    case "done": return "bg-emerald-900 text-emerald-300";
    default: return "bg-zinc-800 text-zinc-400";
  }
}

/* ═══════════════════════════════════════════════
   STATE PANEL
   ═══════════════════════════════════════════════ */
function StatePanel({ pKey, step }) {
  if (pKey === "implement") {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Words in Trie</div>
        <div className="flex gap-1.5 flex-wrap">
          {(step.inserted || []).map((w, i) => (
            <span key={i} className={`px-2 py-0.5 rounded text-xs font-mono border ${
              step.currentWord === w ? "bg-blue-950 border-blue-700 text-blue-300" : "bg-zinc-900 border-zinc-800 text-zinc-500"
            }`}>{w}</span>
          ))}
        </div>
        {step.searchResult && step.searchResult.words?.length > 0 && (
          <div className="mt-2 pt-2 border-t border-zinc-800">
            <div className="text-[9px] text-zinc-600 mb-1">autocomplete: "{step.searchResult.query}..."</div>
            <div className="flex gap-1.5 flex-wrap">
              {step.searchResult.words.map((w, i) => (
                <span key={i} className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 rounded text-emerald-300 font-mono text-xs font-bold">{w}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (pKey === "wildcard") {
    return (
      <>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Words in Trie</div>
          <div className="flex gap-1.5 flex-wrap">
            {(step.inserted || []).map((w, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-xs font-mono border bg-zinc-900 border-zinc-800 text-zinc-500">{w}</span>
            ))}
          </div>
        </div>
        {step.searchResult && (
          <div className={`rounded-2xl border p-3 ${step.searchResult.result ? "bg-emerald-950/20 border-emerald-900/50" : "bg-red-950/20 border-red-900/50"}`}>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: step.searchResult.result ? "#6ee7b7" : "#fca5a5" }}>
              {step.searchResult.result ? "Match Found" : "No Match"}
            </div>
            <div className="font-mono text-[11px]">
              <span className="text-zinc-400">search("</span>
              {step.searchResult.query.split("").map((ch, i) => (
                <span key={i} className={ch === "." ? "text-amber-400 font-bold" : "text-zinc-300"}>{ch}</span>
              ))}
              <span className="text-zinc-400">") → </span>
              <span className={step.searchResult.result ? "text-emerald-300 font-bold" : "text-red-400"}>
                {step.searchResult.result ? "True" : "False"}
              </span>
            </div>
          </div>
        )}
      </>
    );
  }

  if (pKey === "wordsearch") {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Word List Status</div>
        <div className="space-y-1">
          {(step.words || []).map((w, i) => {
            const isFound = step.found.includes(w);
            return (
              <div key={i} className="flex items-center gap-2 font-mono text-xs">
                <span className={`w-4 text-center ${isFound ? "text-emerald-400" : "text-zinc-600"}`}>
                  {isFound ? "✓" : "·"}
                </span>
                <span className={isFound ? "text-emerald-300" : "text-zinc-500"}>{w}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function TrieViz() {
  const [pKey, setPKey] = useState("implement");
  const [si, setSi] = useState(0);
  const steps = useMemo(() => buildStepsFor(pKey), [pKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const problem = PROBLEMS[pKey];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        {/* ═══ 1. HEADER ═══ */}
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trie (Prefix Tree)</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Insert / Search / Prefix Match • O(word length) Operations</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PROBLEMS).map(([k, v]) => (
              <button key={k} onClick={() => switchProblem(k)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  pKey === k ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {v.title}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ 2. CORE IDEA ═══ */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        {/* ═══ 3. NAVIGATION ═══ */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* ═══ 4. 3-COLUMN GRID ═══ */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Visualization ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel pKey={pKey} step={step} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">
                {pKey === "wordsearch" ? "Board (4×4)" : "Trie Structure"}
                {pKey !== "wordsearch" && " • ● = word-end"}
              </div>
              {pKey === "wordsearch" ? (
                <GridView step={step} />
              ) : (
                <TreeView step={step} />
              )}
              {pKey === "wordsearch" && (
                <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-900 inline-block" />Start</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-800/50 inline-block" />Path</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-800 inline-block" />Found</span>
                </div>
              )}
            </div>
            {/* Show trie below grid for word search */}
            {pKey === "wordsearch" && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                <div className="text-[10px] text-zinc-500 mb-1">Trie • ● = word-end</div>
                <TreeView step={step} />
              </div>
            )}
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "found" || step.phase === "searchHit" ? "bg-emerald-950/20 border-emerald-800" :
              step.phase === "searchMiss" || step.phase === "prune" ? "bg-red-950/20 border-red-900/50" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
                {step.currentWord && <span className="text-xs text-blue-400 font-mono font-bold">"{step.currentWord}"</span>}
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${phaseStyle(step.phase)}`}>
                  {step.phase}
                </span>
              </div>
              <h2 className="text-base font-semibold mb-1">{step.title}</h2>
              <p className="text-zinc-400 text-xs leading-relaxed">{step.detail}</p>
            </div>

            {/* State panel */}
            <StatePanel pKey={pKey} step={step} />

            {/* Completion card */}
            {step.phase === "done" && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">Result</div>
                <div className="font-mono text-[11px] text-emerald-300">
                  {pKey === "implement" && `Trie with ${step.flat.length} nodes. All insert/search/startsWith queries demonstrated.`}
                  {pKey === "wildcard" && `Wildcard search with '.' demonstrated. DFS branches at each wildcard position.`}
                  {pKey === "wordsearch" && `Found ${step.found.length} words: [${step.found.map(w => `"${w}"`).join(", ")}]. Trie pruned unreachable prefixes.`}
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel pKey={pKey} highlightLines={step.codeHL} />
          </div>

        </div>

        {/* ═══ 5. BOTTOM ROW: When to Use + Classic Problems ═══ */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Prefix matching — autocomplete, spell check, IP routing</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Word dictionaries with startsWith queries — hash sets can't do this</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Grid + word list problems — trie prunes invalid prefixes during DFS</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Wildcard / regex-like pattern matching on word sets</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Insert:</span> O(word length)</div>
                <div><span className="text-zinc-500 font-semibold">Search:</span> O(word length)</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(total chars × alphabet) — children can be dict or array[26]</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 208 — Implement Trie</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 211 — Add and Search Words</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 212 — Word Search II</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 648 — Replace Words</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 1268 — Search Suggestions System</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 421 — Maximum XOR of Two Numbers</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 472 — Concatenated Words</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 745 — Prefix and Suffix Search</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
