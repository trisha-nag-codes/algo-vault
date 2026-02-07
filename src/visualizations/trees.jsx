import { useState, useMemo } from "react";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TREE UTILITIES
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const N = (id, val, left, right) => ({ id, val, left: left || null, right: right || null });

function layoutTree(root, xGap = 52, yGap = 62) {
  const pos = {};
  let idx = 0;
  (function inorder(n, d) {
    if (!n) return;
    inorder(n.left, d + 1);
    pos[n.id] = { x: idx * xGap + 35, y: d * yGap + 28 };
    idx++;
    inorder(n.right, d + 1);
  })(root, 0);
  return pos;
}

function allNodes(root) {
  const out = [];
  (function go(n) { if (!n) return; out.push(n); go(n.left); go(n.right); })(root);
  return out;
}

function allEdges(root) {
  const out = [];
  (function go(n) {
    if (!n) return;
    if (n.left) { out.push([n.id, n.left.id]); go(n.left); }
    if (n.right) { out.push([n.id, n.right.id]); go(n.right); }
  })(root);
  return out;
}

function treeDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(treeDepth(root.left), treeDepth(root.right));
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TREE DEFINITIONS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const TREES = {
  validateBST: N(0, 8,
    N(1, 3, N(3, 1), N(4, 6, N(7, 4), N(8, 7))),
    N(2, 10, null, N(5, 14, N(9, 13), null))
  ),
  lca: N(0, 3,
    N(1, 5, N(3, 6), N(4, 2, N(7, 7), N(8, 4))),
    N(2, 1, N(5, 0), N(6, 8))
  ),
  rightSide: N(0, 1,
    N(1, 2, N(3, 4, N(6, 7), null), N(4, 5)),
    N(2, 3, null, N(5, 6))
  ),
  maxPath: N(0, -10,
    N(1, 9),
    N(2, 20, N(3, 15), N(4, 7))
  ),
};

const POSITIONS = Object.fromEntries(Object.keys(TREES).map(k => [k, layoutTree(TREES[k])]));
const NODES_MAP = Object.fromEntries(Object.keys(TREES).map(k => [k, allNodes(TREES[k])]));
const EDGES_MAP = Object.fromEntries(Object.keys(TREES).map(k => [k, allEdges(TREES[k])]));

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PROBLEM DEFINITIONS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const PROBLEMS = {
  validateBST: {
    title: "Validate BST",
    lc: "LC 98 Â· Medium",
    coreIdea:
      "DFS with bounds: pass an allowed range [lo, hi] down the tree. At each node, check lo < val < hi. Go left with hi=val, go right with lo=val. If any node violates its bounds, the tree is invalid. This top-down constraint-passing pattern is the foundation for many BST problems. O(n).",
  },
  lca: {
    title: "Lowest Common Ancestor",
    lc: "LC 236 Â· Medium",
    coreIdea:
      "Post-order DFS: if the current node is p or q, return it. Recurse left and right. If both sides return non-null, the current node is the LCA â€” the split point where p and q diverge. Otherwise propagate whichever side found something. O(n) single pass, no parent pointers needed.",
    p: 7, q: 4,
  },
  rightSide: {
    title: "Right Side View",
    lc: "LC 199 Â· Medium",
    coreIdea:
      "BFS level by level â€” at each level, the last node dequeued is the rightmost (visible from the right). Process all nodes at the current level before moving to the next. This level-order pattern extends to zigzag traversal, level averages, and finding the largest value per level. O(n).",
  },
  maxPath: {
    title: "Max Path Sum",
    lc: "LC 124 Â· Hard",
    coreIdea:
      "Post-order DFS with global tracking. At each node, compute left_gain = max(0, dfs(left)) and right_gain = max(0, dfs(right)). The path through this node = val + left_gain + right_gain â€” update global max. Return val + max(left_gain, right_gain) upward (can only extend one direction). O(n).",
  },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CODE PER PROBLEM
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const CODES = {
  validateBST: [
    { id: 0,  text: `def is_valid_bst(root):` },
    { id: 1,  text: `    def dfs(node, lo, hi):` },
    { id: 2,  text: `        if not node:` },
    { id: 3,  text: `            return True` },
    { id: 4,  text: `        if node.val <= lo or node.val >= hi:` },
    { id: 5,  text: `            return False` },
    { id: 6,  text: `        return (dfs(node.left, lo, node.val)` },
    { id: 7,  text: `            and dfs(node.right, node.val, hi))` },
    { id: 8,  text: `` },
    { id: 9,  text: `    return dfs(root, float('-inf'), float('inf'))` },
  ],
  lca: [
    { id: 0,  text: `def lca(root, p, q):` },
    { id: 1,  text: `    if not root:` },
    { id: 2,  text: `        return None` },
    { id: 3,  text: `    if root.val == p or root.val == q:` },
    { id: 4,  text: `        return root` },
    { id: 5,  text: `` },
    { id: 6,  text: `    left  = lca(root.left,  p, q)` },
    { id: 7,  text: `    right = lca(root.right, p, q)` },
    { id: 8,  text: `` },
    { id: 9,  text: `    if left and right:` },
    { id: 10, text: `        return root          # LCA found` },
    { id: 11, text: `    return left or right` },
  ],
  rightSide: [
    { id: 0,  text: `from collections import deque` },
    { id: 1,  text: `` },
    { id: 2,  text: `def right_side_view(root):` },
    { id: 3,  text: `    if not root: return []` },
    { id: 4,  text: `    result = []` },
    { id: 5,  text: `    queue = deque([root])` },
    { id: 6,  text: `` },
    { id: 7,  text: `    while queue:` },
    { id: 8,  text: `        level_size = len(queue)` },
    { id: 9,  text: `        for i in range(level_size):` },
    { id: 10, text: `            node = queue.popleft()` },
    { id: 11, text: `            if i == level_size - 1:` },
    { id: 12, text: `                result.append(node.val)` },
    { id: 13, text: `            if node.left:  queue.append(node.left)` },
    { id: 14, text: `            if node.right: queue.append(node.right)` },
    { id: 15, text: `` },
    { id: 16, text: `    return result` },
  ],
  maxPath: [
    { id: 0,  text: `def max_path_sum(root):` },
    { id: 1,  text: `    max_sum = float('-inf')` },
    { id: 2,  text: `` },
    { id: 3,  text: `    def dfs(node):` },
    { id: 4,  text: `        nonlocal max_sum` },
    { id: 5,  text: `        if not node:` },
    { id: 6,  text: `            return 0` },
    { id: 7,  text: `        left  = max(0, dfs(node.left))` },
    { id: 8,  text: `        right = max(0, dfs(node.right))` },
    { id: 9,  text: `        max_sum = max(max_sum, node.val+left+right)` },
    { id: 10, text: `        return node.val + max(left, right)` },
    { id: 11, text: `` },
    { id: 12, text: `    dfs(root)` },
    { id: 13, text: `    return max_sum` },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   EXPECTED OUTPUTS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const EXPECTED = {
  validateBST: { valid: true },
  lca: { lcaVal: 2 },
  rightSide: { view: [1, 3, 6, 7] },
  maxPath: { maxSum: 42 },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS â€” VALIDATE BST
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildValidateBSTSteps() {
  const root = TREES.validateBST;
  const steps = [];
  const visited = new Set();
  const valid = new Set();

  steps.push({
    title: "Initialize â€” DFS with bounds (-âˆž, âˆž)",
    detail: "Start at root. Each node must satisfy lo < val < hi. Pass tighter bounds to children.",
    current: null, bounds: null,
    visited: new Set(), valid: new Set(), invalid: null,
    phase: "init", codeHL: [0, 9], result: null,
  });

  let isValid = true;

  function dfs(node, lo, hi) {
    if (!node || !isValid) return;

    const loStr = lo === -Infinity ? "-âˆž" : lo;
    const hiStr = hi === Infinity ? "âˆž" : hi;
    const ok = node.val > lo && node.val < hi;

    steps.push({
      title: ok
        ? `Check node ${node.val}: ${loStr} < ${node.val} < ${hiStr} âœ“`
        : `Check node ${node.val}: ${loStr} < ${node.val} < ${hiStr} âœ— INVALID!`,
      detail: ok
        ? `${node.val} is within (${loStr}, ${hiStr}). Valid â€” recurse into children with tighter bounds.`
        : `${node.val} violates the bound (${loStr}, ${hiStr}). Tree is NOT a valid BST.`,
      current: node.id, bounds: { lo, hi },
      visited: new Set(visited), valid: new Set(valid), invalid: ok ? null : node.id,
      phase: ok ? "check-ok" : "check-fail",
      codeHL: ok ? [1, 2, 3, 4] : [4, 5], result: null,
    });

    if (!ok) { isValid = false; return; }
    visited.add(node.id);
    valid.add(node.id);

    dfs(node.left, lo, node.val);
    dfs(node.right, node.val, hi);

    if (isValid) {
      steps.push({
        title: `âœ“ Subtree at ${node.val} fully validated`,
        detail: `Both children of ${node.val} are valid within their bounds. Returning True upward.`,
        current: node.id, bounds: { lo, hi },
        visited: new Set(visited), valid: new Set(valid), invalid: null,
        phase: "return-ok", codeHL: [6, 7], result: null,
      });
    }
  }

  dfs(root, -Infinity, Infinity);

  steps.push({
    title: isValid ? "âœ“ Complete â€” Valid BST" : "âœ— Complete â€” Not a Valid BST",
    detail: isValid
      ? `All ${valid.size} nodes satisfy their bounds. Tree is a valid BST.`
      : `Violation found. Tree is NOT a valid BST.`,
    current: null, bounds: null,
    visited: new Set(visited), valid: new Set(valid), invalid: null,
    phase: "done", codeHL: [9], result: isValid,
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS â€” LOWEST COMMON ANCESTOR
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildLCASteps() {
  const root = TREES.lca;
  const { p, q } = PROBLEMS.lca;
  const steps = [];
  const visited = new Set();
  const returns = {};

  steps.push({
    title: `Find LCA of p=${p} and q=${q}`,
    detail: "Post-order DFS: recurse left, right, then decide. If both sides return non-null, current node is the LCA.",
    current: null,
    visited: new Set(), returns: {}, foundP: false, foundQ: false, lcaNode: null,
    phase: "init", codeHL: [0],
  });

  function dfs(node) {
    if (!node) return null;

    visited.add(node.id);

    if (node.val === p || node.val === q) {
      const which = node.val === p ? "p" : "q";
      steps.push({
        title: `Found ${which}=${node.val} at node ${node.id}!`,
        detail: `node.val == ${node.val} matches target ${which}. Return this node upward.`,
        current: node.id,
        visited: new Set(visited), returns: { ...returns }, foundP: node.val === p || returns._foundP, foundQ: node.val === q || returns._foundQ, lcaNode: null,
        phase: "found-target", codeHL: [3, 4],
      });
      returns[node.id] = node.val;
      returns._foundP = returns._foundP || node.val === p;
      returns._foundQ = returns._foundQ || node.val === q;
      return node;
    }

    steps.push({
      title: `Enter node ${node.val} â€” recurse children`,
      detail: `Node ${node.val} is not p(${p}) or q(${q}). DFS into left and right subtrees.`,
      current: node.id,
      visited: new Set(visited), returns: { ...returns }, foundP: !!returns._foundP, foundQ: !!returns._foundQ, lcaNode: null,
      phase: "enter", codeHL: [1, 2, 6, 7],
    });

    const left = dfs(node.left);
    const right = dfs(node.right);

    if (left && right) {
      returns[node.id] = node.val;
      steps.push({
        title: `â˜… LCA Found! Node ${node.val} â€” both subtrees returned`,
        detail: `Left returned ${left.val}, right returned ${right.val}. Both non-null â†’ node ${node.val} is the Lowest Common Ancestor!`,
        current: node.id,
        visited: new Set(visited), returns: { ...returns }, foundP: true, foundQ: true, lcaNode: node.id,
        phase: "lca-found", codeHL: [9, 10],
      });
      return node;
    }

    const result = left || right;
    returns[node.id] = result ? result.val : null;

    steps.push({
      title: result
        ? `Return from ${node.val}: propagate ${result.val} upward`
        : `Return from ${node.val}: null (neither found here)`,
      detail: result
        ? `Left=${left ? left.val : "null"}, right=${right ? right.val : "null"}. Propagate the non-null result (${result.val}).`
        : `Left=null, right=null. Neither p nor q found in this subtree.`,
      current: node.id,
      visited: new Set(visited), returns: { ...returns }, foundP: !!returns._foundP, foundQ: !!returns._foundQ, lcaNode: null,
      phase: result ? "propagate" : "return-null", codeHL: [11],
    });

    return result;
  }

  const result = dfs(root);

  steps.push({
    title: `âœ“ Complete â€” LCA = ${result ? result.val : "null"}`,
    detail: `The lowest common ancestor of ${p} and ${q} is node ${result ? result.val : "null"}.`,
    current: result ? result.id : null,
    visited: new Set(visited), returns: { ...returns }, foundP: true, foundQ: true, lcaNode: result ? result.id : null,
    phase: "done", codeHL: [10],
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS â€” RIGHT SIDE VIEW (BFS)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildRightSideSteps() {
  const root = TREES.rightSide;
  const steps = [];
  const result = [];
  const visited = new Set();

  const queue = [root];
  steps.push({
    title: "Initialize â€” BFS with Level Tracking",
    detail: `Seed queue with root (${root.val}). Process level by level, capture the rightmost of each.`,
    current: null, queue: queue.map(n => n.val), level: -1,
    visited: new Set(), result: [], levelNodes: [],
    phase: "init", codeHL: [2, 3, 4, 5], rightmost: null,
  });

  let level = 0;
  let qi = 0;

  while (qi < queue.length) {
    const levelSize = queue.length - qi;
    const levelNodes = [];
    const startQi = qi;

    for (let i = 0; i < levelSize; i++) {
      const node = queue[qi + i];
      visited.add(node.id);
      levelNodes.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    const rightmost = levelNodes[levelNodes.length - 1];
    result.push(rightmost);
    qi += levelSize;

    steps.push({
      title: `Level ${level}: [${levelNodes.join(", ")}] â†’ rightmost = ${rightmost}`,
      detail: `Process ${levelSize} node${levelSize > 1 ? "s" : ""} at depth ${level}. Rightmost visible: ${rightmost}. Result so far: [${result.join(", ")}].`,
      current: queue[startQi + levelSize - 1].id,
      queue: queue.slice(qi).map(n => n.val), level,
      visited: new Set(visited), result: [...result],
      levelNodes: levelNodes.map((_, i) => queue[startQi + i].id),
      phase: "level", codeHL: [7, 8, 9, 10, 11, 12, 13, 14],
      rightmost: queue[startQi + levelSize - 1].id,
    });

    level++;
  }

  steps.push({
    title: `âœ“ Complete â€” Right Side View = [${result.join(", ")}]`,
    detail: `${level} levels processed. View from the right: [${result.join(", ")}].`,
    current: null, queue: [], level: level - 1,
    visited: new Set(visited), result: [...result], levelNodes: [],
    phase: "done", codeHL: [16], rightmost: null,
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS â€” MAX PATH SUM
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildMaxPathSteps() {
  const root = TREES.maxPath;
  const steps = [];
  let maxSum = -Infinity;
  const visited = new Set();
  const gains = {};
  const pathSums = {};

  steps.push({
    title: "Initialize â€” Post-order DFS",
    detail: "At each node: left_gain = max(0, dfs(left)), right_gain = max(0, dfs(right)). Update global max with val + left + right. Return val + max(left, right).",
    current: null,
    visited: new Set(), gains: {}, pathSums: {}, maxSum: -Infinity,
    phase: "init", codeHL: [0, 1, 3, 4],
    bestPath: null,
  });

  function dfs(node) {
    if (!node) return 0;

    const leftGain = Math.max(0, dfs(node.left));
    const rightGain = Math.max(0, dfs(node.right));
    const pathSum = node.val + leftGain + rightGain;
    const improved = pathSum > maxSum;
    if (improved) maxSum = pathSum;

    const returnVal = node.val + Math.max(leftGain, rightGain);
    visited.add(node.id);
    gains[node.id] = returnVal;
    pathSums[node.id] = pathSum;

    steps.push({
      title: improved
        ? `Node ${node.val}: path = ${node.val}+${leftGain}+${rightGain} = ${pathSum} â€” New Max!`
        : `Node ${node.val}: path = ${node.val}+${leftGain}+${rightGain} = ${pathSum}`,
      detail: `left_gain=max(0,${node.left ? gains[node.left.id] ?? 0 : 0})=${leftGain}, right_gain=max(0,${node.right ? gains[node.right.id] ?? 0 : 0})=${rightGain}. `
        + `Path through node = ${pathSum}${improved ? ` > ${maxSum === pathSum ? (maxSum === -Infinity ? "-âˆž" : "prev") : maxSum} â†’ new max!` : ` â‰¤ ${maxSum}`}. `
        + `Return ${returnVal} upward (extend ${leftGain >= rightGain ? "left" : "right"} branch).`,
      current: node.id,
      visited: new Set(visited),
      gains: { ...gains }, pathSums: { ...pathSums }, maxSum,
      phase: improved ? "new-max" : "compute",
      codeHL: improved ? [5, 6, 7, 8, 9, 10] : [5, 6, 7, 8, 10],
      leftGain, rightGain, returnVal,
      bestPath: null,
    });

    return returnVal;
  }

  dfs(root);

  // identify the best path nodes for highlight
  const bestIds = [];
  (function findBest(node) {
    if (!node) return;
    if (pathSums[node.id] === maxSum) {
      bestIds.push(node.id);
      if (node.left && gains[node.left.id] > 0) bestIds.push(node.left.id);
      if (node.right && gains[node.right.id] > 0) bestIds.push(node.right.id);
    }
    findBest(node.left);
    findBest(node.right);
  })(root);

  steps.push({
    title: `âœ“ Complete â€” Max Path Sum = ${maxSum}`,
    detail: `The maximum path sum is ${maxSum} (path: 15 â†’ 20 â†’ 7).`,
    current: null,
    visited: new Set(visited),
    gains: { ...gains }, pathSums: { ...pathSums }, maxSum,
    phase: "done", codeHL: [13],
    bestPath: new Set(bestIds),
  });

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP BUILDER DISPATCH
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function buildSteps(key) {
  switch (key) {
    case "validateBST": return buildValidateBSTSteps();
    case "lca": return buildLCASteps();
    case "rightSide": return buildRightSideSteps();
    case "maxPath": return buildMaxPathSteps();
    default: return [];
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TREE SVG VISUALIZATION
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function TreeView({ pKey, step }) {
  const tree = TREES[pKey];
  const pos = POSITIONS[pKey];
  const nodes = NODES_MAP[pKey];
  const edges = EDGES_MAP[pKey];
  const nodeR = 18;

  const xs = nodes.map(n => pos[n.id].x);
  const ys = nodes.map(n => pos[n.id].y);
  const vw = Math.max(...xs) + 45;
  const vh = Math.max(...ys) + 45;

  function nodeColors(nid) {
    if (pKey === "validateBST") {
      const { current, valid, invalid } = step;
      if (nid === invalid) return { fill: "#991b1b", stroke: "#ef4444" };
      if (nid === current) return { fill: "#7c3aed", stroke: "#8b5cf6" };
      if (valid.has(nid)) return { fill: "#065f46", stroke: "#10b981" };
      if (step.visited.has(nid)) return { fill: "#1e3a5f", stroke: "#3b82f6" };
      return { fill: "#27272a", stroke: "#52525b" };
    }
    if (pKey === "lca") {
      const { current, lcaNode, visited: vis } = step;
      const { p, q } = PROBLEMS.lca;
      const nVal = nodes.find(n => n.id === nid)?.val;
      if (nid === lcaNode) return { fill: "#7c3aed", stroke: "#a78bfa" };
      if (nVal === p || nVal === q) return { fill: "#b45309", stroke: "#f59e0b" };
      if (nid === current) return { fill: "#1e40af", stroke: "#3b82f6" };
      if (step.returns[nid] != null) return { fill: "#065f46", stroke: "#10b981" };
      if (vis.has(nid)) return { fill: "#1e3a5f", stroke: "#60a5fa" };
      return { fill: "#27272a", stroke: "#52525b" };
    }
    if (pKey === "rightSide") {
      const { rightmost, levelNodes, visited: vis } = step;
      if (nid === rightmost) return { fill: "#7c3aed", stroke: "#a78bfa" };
      if (levelNodes && levelNodes.includes(nid)) return { fill: "#b45309", stroke: "#f59e0b" };
      if (vis.has(nid)) return { fill: "#065f46", stroke: "#10b981" };
      return { fill: "#27272a", stroke: "#52525b" };
    }
    if (pKey === "maxPath") {
      const { current, visited: vis, bestPath } = step;
      if (bestPath && bestPath.has(nid)) return { fill: "#7c3aed", stroke: "#a78bfa" };
      if (nid === current) return { fill: "#b45309", stroke: "#f59e0b" };
      if (vis.has(nid)) return { fill: "#065f46", stroke: "#10b981" };
      return { fill: "#27272a", stroke: "#52525b" };
    }
    return { fill: "#27272a", stroke: "#52525b" };
  }

  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full" style={{ maxHeight: 230 }}>
      {/* Edges */}
      {edges.map(([pid, cid], i) => {
        const p1 = pos[pid], p2 = pos[cid];
        const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.sqrt(dx * dx + dy * dy);
        const sx = p1.x + (dx / len) * nodeR, sy = p1.y + (dy / len) * nodeR;
        const ex = p2.x - (dx / len) * nodeR, ey = p2.y - (dy / len) * nodeR;

        let color = "#3f3f46";
        if (pKey === "maxPath" && step.bestPath && step.bestPath.has(pid) && step.bestPath.has(cid)) color = "#a78bfa";
        else if (step.visited && step.visited.has(pid) && step.visited.has(cid)) color = "#059669";

        return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={color === "#a78bfa" ? 3 : 1.5} />;
      })}

      {/* Gain annotations for maxPath */}
      {pKey === "maxPath" && step.gains && nodes.map(n => {
        const g = step.gains[n.id];
        if (g === undefined) return null;
        const p = pos[n.id];
        return (
          <text key={`g-${n.id}`} x={p.x + nodeR + 4} y={p.y - nodeR + 2}
            fill="#6ee7b7" fontSize="9" fontWeight="600" fontFamily="monospace">â†‘{g}</text>
        );
      })}

      {/* Bounds for validateBST */}
      {pKey === "validateBST" && step.current != null && step.bounds && (() => {
        const p = pos[step.current];
        const lo = step.bounds.lo === -Infinity ? "-âˆž" : step.bounds.lo;
        const hi = step.bounds.hi === Infinity ? "âˆž" : step.bounds.hi;
        return (
          <text x={p.x} y={p.y + nodeR + 14} textAnchor="middle"
            fill="#a1a1aa" fontSize="8" fontFamily="monospace">(  {lo}, {hi})</text>
        );
      })()}

      {/* Return value labels for LCA */}
      {pKey === "lca" && step.returns && nodes.map(n => {
        const ret = step.returns[n.id];
        if (ret === undefined) return null;
        const p = pos[n.id];
        return (
          <text key={`r-${n.id}`} x={p.x + nodeR + 3} y={p.y + 4}
            fill={ret != null ? "#6ee7b7" : "#71717a"} fontSize="8" fontWeight="600" fontFamily="monospace">
            â†’{ret != null ? ret : "âˆ…"}
          </text>
        );
      })}

      {/* Nodes */}
      {nodes.map(n => {
        const p = pos[n.id];
        const c = nodeColors(n.id);
        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r={nodeR} fill={c.fill} stroke={c.stroke} strokeWidth={2.5} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="central"
              fill="#fff" fontSize="13" fontWeight="700" fontFamily="monospace">{n.val}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   IO PANELS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function ValidateBSTIOPanel({ step }) {
  const { phase, valid: validSet, result } = step;
  const done = phase === "done";
  const exp = EXPECTED.validateBST;
  const matches = done && result === exp.valid;
  const tree = TREES.validateBST;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[10px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">root </span> = [{allNodes(tree).map(n => n.val).join(", ")}]</div>
          <div><span className="text-zinc-500">nodes</span> = <span className="text-zinc-300">{allNodes(tree).length}</span>, depth = <span className="text-zinc-300">{treeDepth(tree) - 1}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-300">{exp.valid ? "True" : "False"}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {matches && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">checked</span> = <span className="text-zinc-300">{validSet ? validSet.size : 0}</span> / {allNodes(tree).length}</div>
          <div><span className="text-zinc-500">valid  </span> = <span className={done ? (result ? "text-emerald-300 font-bold" : "text-red-300 font-bold") : "text-zinc-600"}>
            {done ? (result ? "True âœ“" : "False âœ—") : "checking..."}
          </span></div>
        </div>
        {step.bounds && (
          <div className="mt-1.5 font-mono text-[10px] text-zinc-600">
            bounds: ({step.bounds.lo === -Infinity ? "-âˆž" : step.bounds.lo}, {step.bounds.hi === Infinity ? "âˆž" : step.bounds.hi})
          </div>
        )}
      </div>
    </div>
  );
}

function LCAIOPanel({ step }) {
  const { p, q } = PROBLEMS.lca;
  const { phase, lcaNode } = step;
  const done = phase === "done";
  const exp = EXPECTED.lca;
  const lcaVal = lcaNode != null ? NODES_MAP.lca.find(n => n.id === lcaNode)?.val : null;
  const matches = done && lcaVal === exp.lcaVal;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">root</span> = [{allNodes(TREES.lca).map(n => n.val).join(", ")}]</div>
          <div><span className="text-zinc-500">p   </span> = <span className="text-amber-300">{p}</span>, <span className="text-zinc-500">q</span> = <span className="text-amber-300">{q}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">LCA</span> = <span className="text-zinc-300">{exp.lcaVal}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {matches && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">found p</span> = {step.foundP ? <span className="text-emerald-300">âœ“ {p}</span> : <span className="text-zinc-600">searching</span>}</div>
          <div><span className="text-zinc-500">found q</span> = {step.foundQ ? <span className="text-emerald-300">âœ“ {q}</span> : <span className="text-zinc-600">searching</span>}</div>
          <div><span className="text-zinc-500">LCA   </span> = <span className={lcaVal != null ? "text-purple-300 font-bold" : "text-zinc-600"}>
            {lcaVal != null ? lcaVal : "?"}
          </span></div>
        </div>
      </div>
    </div>
  );
}

function RightSideIOPanel({ step }) {
  const { phase, result } = step;
  const done = phase === "done";
  const exp = EXPECTED.rightSide;
  const matches = done && result.length === exp.view.length && result.every((v, i) => v === exp.view[i]);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[10px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">root </span> = [{allNodes(TREES.rightSide).map(n => n.val).join(", ")}]</div>
          <div><span className="text-zinc-500">nodes</span> = <span className="text-zinc-300">{allNodes(TREES.rightSide).length}</span>, depth = <span className="text-zinc-300">{treeDepth(TREES.rightSide) - 1}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-300">[{exp.view.join(", ")}]</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {matches && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">result</span> = [
          {result.map((v, i) => (
            <span key={i}>
              <span className="text-emerald-300 font-bold">{v}</span>
              {i < result.length - 1 && <span className="text-zinc-700">, </span>}
            </span>
          ))}
          {!done && <span className="text-zinc-600">...</span>}
          ]
        </div>
        {step.level >= 0 && (
          <div className="mt-1.5 font-mono text-[10px] text-zinc-600">
            level {step.level} â€¢ queue: [{step.queue.join(", ")}]
          </div>
        )}
      </div>
    </div>
  );
}

function MaxPathIOPanel({ step }) {
  const { phase, maxSum } = step;
  const done = phase === "done";
  const exp = EXPECTED.maxPath;
  const matches = done && maxSum === exp.maxSum;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[10px] text-zinc-400" style={{ whiteSpace: "pre" }}>
          <div><span className="text-zinc-500">root</span> = [{allNodes(TREES.maxPath).map(n => n.val).join(", ")}]</div>
          <div><span className="text-zinc-500">nodes</span> = <span className="text-zinc-300">{allNodes(TREES.maxPath).length}</span></div>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500">max_sum</span> = <span className="text-zinc-300">{exp.maxSum}</span>
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {matches && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">âœ“ MATCH</span>}
        </div>
        <div className="font-mono text-[11px] space-y-0.5">
          <div><span className="text-zinc-500">max_sum</span> = <span className={done ? "text-emerald-300 font-bold" : maxSum > -Infinity ? "text-zinc-300" : "text-zinc-600"}>
            {maxSum === -Infinity ? "-âˆž" : maxSum}
          </span></div>
          {step.current != null && (
            <div>
              <span className="text-zinc-500">at node </span>
              <span className="text-amber-300">{NODES_MAP.maxPath.find(n => n.id === step.current)?.val}</span>
              <span className="text-zinc-600"> â†’ return â†‘{step.returnVal}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IOPanelDispatch({ pKey, step }) {
  switch (pKey) {
    case "validateBST": return <ValidateBSTIOPanel step={step} />;
    case "lca": return <LCAIOPanel step={step} />;
    case "rightSide": return <RightSideIOPanel step={step} />;
    case "maxPath": return <MaxPathIOPanel step={step} />;
    default: return null;
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STATE PANELS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function ValidateBSTState({ step }) {
  const current = step.current != null ? NODES_MAP.validateBST.find(n => n.id === step.current) : null;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">DFS State</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-purple-400">{current ? current.val : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">current</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{step.bounds ? (step.bounds.lo === -Infinity ? "-âˆž" : step.bounds.lo) : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">lo bound</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-amber-400">{step.bounds ? (step.bounds.hi === Infinity ? "âˆž" : step.bounds.hi) : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">hi bound</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-emerald-400">{step.valid ? step.valid.size : 0}</div>
          <div className="text-[9px] text-zinc-600">validated</div>
        </div>
      </div>
    </div>
  );
}

function LCAState({ step }) {
  const { p, q } = PROBLEMS.lca;
  const current = step.current != null ? NODES_MAP.lca.find(n => n.id === step.current) : null;
  const lcaVal = step.lcaNode != null ? NODES_MAP.lca.find(n => n.id === step.lcaNode)?.val : null;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">DFS State</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{current ? current.val : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">current</div>
        </div>
        <div className="flex-1 text-center">
          <div className={`text-lg font-bold font-mono ${step.foundP ? "text-emerald-400" : "text-zinc-600"}`}>{p}</div>
          <div className="text-[9px] text-zinc-600">p {step.foundP ? "âœ“" : ""}</div>
        </div>
        <div className="flex-1 text-center">
          <div className={`text-lg font-bold font-mono ${step.foundQ ? "text-emerald-400" : "text-zinc-600"}`}>{q}</div>
          <div className="text-[9px] text-zinc-600">q {step.foundQ ? "âœ“" : ""}</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-purple-400">{lcaVal != null ? lcaVal : "?"}</div>
          <div className="text-[9px] text-zinc-600">LCA</div>
        </div>
      </div>
    </div>
  );
}

function RightSideState({ step }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">BFS State</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-amber-400">{step.level >= 0 ? step.level : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">level</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{step.queue ? step.queue.length : 0}</div>
          <div className="text-[9px] text-zinc-600">in queue</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-emerald-400">{step.visited ? step.visited.size : 0}</div>
          <div className="text-[9px] text-zinc-600">visited</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-purple-400">{step.result ? step.result.length : 0}</div>
          <div className="text-[9px] text-zinc-600">result len</div>
        </div>
      </div>
      {step.result && step.result.length > 0 && (
        <div className="mt-2 flex gap-1.5 justify-center">
          {step.result.map((v, i) => (
            <span key={i} className="inline-flex items-center justify-center w-8 h-7 rounded-md bg-purple-950 border border-purple-800 text-purple-300 font-mono font-bold text-xs">{v}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function MaxPathState({ step }) {
  const current = step.current != null ? NODES_MAP.maxPath.find(n => n.id === step.current) : null;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">DFS State</div>
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-amber-400">{current ? current.val : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">current</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{step.leftGain != null ? step.leftGain : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">left gain</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-blue-400">{step.rightGain != null ? step.rightGain : "â€“"}</div>
          <div className="text-[9px] text-zinc-600">right gain</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold font-mono text-emerald-400">{step.maxSum === -Infinity ? "-âˆž" : step.maxSum}</div>
          <div className="text-[9px] text-zinc-600">max sum</div>
        </div>
      </div>
      {step.gains && Object.keys(step.gains).length > 0 && (
        <div className="mt-2 text-[10px] font-mono text-zinc-600 text-center">
          returns: {NODES_MAP.maxPath.filter(n => step.gains[n.id] !== undefined).map(n => `${n.val}â†’â†‘${step.gains[n.id]}`).join(", ")}
        </div>
      )}
    </div>
  );
}

function StateDispatch({ pKey, step }) {
  switch (pKey) {
    case "validateBST": return <ValidateBSTState step={step} />;
    case "lca": return <LCAState step={step} />;
    case "rightSide": return <RightSideState step={step} />;
    case "maxPath": return <MaxPathState step={step} />;
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NAVIGATION BAR
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors">â† Prev</button>
      <div className="flex gap-1.5 flex-wrap justify-center max-w-[60%]">
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PHASE BADGE
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function phaseBadge(phase) {
  const map = {
    init: "bg-zinc-800 text-zinc-400",
    "check-ok": "bg-emerald-900 text-emerald-300",
    "check-fail": "bg-red-900 text-red-300",
    "return-ok": "bg-blue-900 text-blue-300",
    "found-target": "bg-amber-900 text-amber-300",
    enter: "bg-zinc-800 text-zinc-400",
    "lca-found": "bg-purple-900 text-purple-300",
    propagate: "bg-blue-900 text-blue-300",
    "return-null": "bg-zinc-800 text-zinc-400",
    level: "bg-amber-900 text-amber-300",
    "new-max": "bg-emerald-900 text-emerald-300",
    compute: "bg-blue-900 text-blue-300",
    done: "bg-emerald-900 text-emerald-300",
  };
  return map[phase] || "bg-zinc-800 text-zinc-400";
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

export default function TreeViz() {
  const [pKey, setPKey] = useState("validateBST");
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
            <h1 className="text-2xl font-bold tracking-tight">Trees</h1>
            <p className="text-zinc-500 text-sm mt-0.5">DFS Bounds, Bottom-Up Return, BFS Level-Order & Global Tracking</p>
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

          {/* â”€â”€ COL 1: IO + Tree Viz â”€â”€ */}
          <div className="col-span-3 space-y-3">
            <IOPanelDispatch pKey={pKey} step={step} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <TreeView pKey={pKey} step={step} />
              <div className="flex flex-wrap gap-2 justify-center mt-1 text-[9px] text-zinc-600">
                {pKey === "validateBST" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Current</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Valid</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 inline-block" />Invalid</span>
                </>}
                {pKey === "lca" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Target</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />LCA</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Returned</span>
                </>}
                {pKey === "rightSide" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Rightmost</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Level</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Visited</span>
                </>}
                {pKey === "maxPath" && <>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Current</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Processed</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Best Path</span>
                </>}
              </div>
            </div>
          </div>

          {/* â”€â”€ COL 2: Steps + State â”€â”€ */}
          <div className="col-span-5 space-y-3">
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "lca-found" || step.phase === "new-max" ? "bg-emerald-950/20 border-emerald-900/50" :
              step.phase === "check-fail" ? "bg-red-950/20 border-red-900/50" :
              step.phase === "found-target" ? "bg-amber-950/20 border-amber-900/50" :
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
                  {pKey === "validateBST" && (step.result ? "Valid BST âœ“ â€” all nodes satisfy their bounds" : "Invalid BST âœ— â€” bound violation detected")}
                  {pKey === "lca" && `LCA(${PROBLEMS.lca.p}, ${PROBLEMS.lca.q}) = ${EXPECTED.lca.lcaVal}`}
                  {pKey === "rightSide" && `Right side view: [${step.result.join(", ")}]`}
                  {pKey === "maxPath" && `Max path sum = ${step.maxSum} (path: 15 â†’ 20 â†’ 7)`}
                </div>
              </div>
            )}
          </div>

          {/* â”€â”€ COL 3: Code â”€â”€ */}
          <div className="col-span-4">
            <CodePanel pKey={pKey} highlightLines={step.codeHL} />
          </div>

        </div>

        {/* â•â•â• 5. Bottom 2-Column Row â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use Tree Patterns</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Top-down DFS: pass constraints/bounds from parent to children</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Bottom-up DFS: return aggregated info from children to parent</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>BFS level-order: process all nodes at same depth before going deeper</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>Global variable DFS: track best-so-far while returning partial results upward</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">â€º</span>BST property: inorder gives sorted order, enables binary-search-like logic</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(n) for most tree traversals</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(h) stack for DFS Â· O(w) queue for BFS</div>
                <div><span className="text-zinc-500 font-semibold">Key insight:</span> Choose top-down vs bottom-up based on info flow direction</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 98 â€” Validate Binary Search Tree</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 236 â€” Lowest Common Ancestor</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 199 â€” Binary Tree Right Side View</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 124 â€” Binary Tree Max Path Sum</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 543 â€” Diameter of Binary Tree</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 297 â€” Serialize / Deserialize Tree</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 105 â€” Construct from Preorder + Inorder</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">â€¢</span><span className="text-zinc-400">LC 1028 â€” Recover Tree From Preorder</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
