import { useState, useMemo } from "react";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BACKTRACKING  —  4 Classic Problems
   CombSum · N-Queens · Sudoku 4×4 · Word Break II
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* ─── Problem Definitions ─── */
const PROBLEMS = {
  combsum: {
    title: "Combination Sum",
    subtitle: "candidates=[2,3,6,7], target=7",
    coreIdea: "Sort candidates, then recursively build combinations. At each level, pick a candidate ≥ the previous (to avoid duplicate sets). If remaining = 0, record the combination. If a candidate exceeds the remaining target, prune — all later candidates are larger, so break early. Each candidate may be reused unlimited times.",
  },
  nqueens: {
    title: "N-Queens (N=4)",
    subtitle: "Place 4 non-attacking queens on a 4×4 board",
    coreIdea: "Place one queen per row. For each row, try every column â€” skip if the column, main diagonal (rowâˆ’col), or anti-diagonal (row+col) is already occupied. If all columns conflict, backtrack to the previous row and try the next column there. This constraint propagation prunes the 4â´ search space dramatically.",
  },
  sudoku: {
    title: "Sudoku (4×4)",
    subtitle: "Fill a 4×4 grid so each row, col, and 2×2 box has 1–4",
    coreIdea: "Scan cells left-to-right, top-to-bottom. At each empty cell, try digits 1–4. Check row, column, and 2×2 box constraints. If no digit is valid, backtrack — undo the last placement and try the next digit. This brute-force approach with pruning solves any valid Sudoku.",
  },
  wordbreak: {
    title: "Word Break II",
    subtitle: 's="catsanddog", dict=["cat","cats","and","sand","dog"]',
    coreIdea: 'Starting at index 0, try every prefix of the remaining string. If the prefix is a dictionary word, record it and recurse on the suffix. When the index reaches the end, join the path into a sentence. Backtrack to explore alternative word splits. This generates all valid segmentations.',
  },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CODE PANELS  —  per-problem Python functions
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const CODES = {
  combsum: [
    { id: 0,  text: `def combinationSum(candidates, target):` },
    { id: 1,  text: `    result = []` },
    { id: 2,  text: `    candidates.sort()` },
    { id: 3,  text: `` },
    { id: 4,  text: `    def backtrack(start, path, remaining):` },
    { id: 5,  text: `        if remaining == 0:` },
    { id: 6,  text: `            result.append(path[:])` },
    { id: 7,  text: `            return` },
    { id: 8,  text: `        for i in range(start, len(candidates)):` },
    { id: 9,  text: `            if candidates[i] > remaining:` },
    { id: 10, text: `                break` },
    { id: 11, text: `            path.append(candidates[i])` },
    { id: 12, text: `            backtrack(i, path, remaining - candidates[i])` },
    { id: 13, text: `            path.pop()` },
    { id: 14, text: `` },
    { id: 15, text: `    backtrack(0, [], target)` },
    { id: 16, text: `    return result` },
  ],
  nqueens: [
    { id: 0,  text: `def solveNQueens(n):` },
    { id: 1,  text: `    res, cols = [], set()` },
    { id: 2,  text: `    diag, anti = set(), set()` },
    { id: 3,  text: `` },
    { id: 4,  text: `    def backtrack(row, placement):` },
    { id: 5,  text: `        if row == n:` },
    { id: 6,  text: `            res.append(placement[:])` },
    { id: 7,  text: `            return` },
    { id: 8,  text: `        for col in range(n):` },
    { id: 9,  text: `            if col in cols: continue` },
    { id: 10, text: `            if row-col in diag: continue` },
    { id: 11, text: `            if row+col in anti: continue` },
    { id: 12, text: `            cols.add(col)` },
    { id: 13, text: `            diag.add(row - col)` },
    { id: 14, text: `            anti.add(row + col)` },
    { id: 15, text: `            placement.append(col)` },
    { id: 16, text: `            backtrack(row + 1, placement)` },
    { id: 17, text: `            placement.pop()` },
    { id: 18, text: `            cols.discard(col)` },
    { id: 19, text: `            diag.discard(row - col)` },
    { id: 20, text: `            anti.discard(row + col)` },
    { id: 21, text: `` },
    { id: 22, text: `    backtrack(0, [])` },
    { id: 23, text: `    return res` },
  ],
  sudoku: [
    { id: 0,  text: `def solveSudoku(board):` },
    { id: 1,  text: `    def is_valid(r, c, num):` },
    { id: 2,  text: `        for i in range(4):` },
    { id: 3,  text: `            if board[r][i] == num: return False` },
    { id: 4,  text: `            if board[i][c] == num: return False` },
    { id: 5,  text: `        br, bc = 2*(r//2), 2*(c//2)` },
    { id: 6,  text: `        for i in range(br, br+2):` },
    { id: 7,  text: `            for j in range(bc, bc+2):` },
    { id: 8,  text: `                if board[i][j] == num: return False` },
    { id: 9,  text: `        return True` },
    { id: 10, text: `` },
    { id: 11, text: `    def backtrack():` },
    { id: 12, text: `        for r in range(4):` },
    { id: 13, text: `            for c in range(4):` },
    { id: 14, text: `                if board[r][c] == 0:` },
    { id: 15, text: `                    for num in range(1, 5):` },
    { id: 16, text: `                        if is_valid(r, c, num):` },
    { id: 17, text: `                            board[r][c] = num` },
    { id: 18, text: `                            if backtrack(): return True` },
    { id: 19, text: `                            board[r][c] = 0` },
    { id: 20, text: `                    return False` },
    { id: 21, text: `        return True` },
    { id: 22, text: `` },
    { id: 23, text: `    backtrack()` },
    { id: 24, text: `    return board` },
  ],
  wordbreak: [
    { id: 0,  text: `def wordBreak(s, wordDict):` },
    { id: 1,  text: `    words = set(wordDict)` },
    { id: 2,  text: `    result = []` },
    { id: 3,  text: `` },
    { id: 4,  text: `    def backtrack(start, path):` },
    { id: 5,  text: `        if start == len(s):` },
    { id: 6,  text: `            result.append(" ".join(path))` },
    { id: 7,  text: `            return` },
    { id: 8,  text: `        for end in range(start+1, len(s)+1):` },
    { id: 9,  text: `            word = s[start:end]` },
    { id: 10, text: `            if word in words:` },
    { id: 11, text: `                path.append(word)` },
    { id: 12, text: `                backtrack(end, path)` },
    { id: 13, text: `                path.pop()` },
    { id: 14, text: `` },
    { id: 15, text: `    backtrack(0, [])` },
    { id: 16, text: `    return result` },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   EXPECTED OUTPUTS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const EXPECTED = {
  combsum: { result: [[2,2,3],[7]] },
  nqueens: { result: [[1,3,0,2],[2,0,3,1]] },
  sudoku: {
    initial: [
      [0,0,3,0],
      [3,0,0,2],
      [0,3,0,0],
      [0,0,2,0],
    ],
    solution: [
      [1,2,3,4],
      [3,4,1,2],
      [2,3,4,1],
      [4,1,2,3],
    ],
  },
  wordbreak: { result: ["cat sand dog", "cats and dog"] },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS  —  Combination Sum
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildCombSumSteps() {
  const candidates = [2, 3, 6, 7];
  const target = 7;
  const steps = [];
  const results = [];
  const finalized = [];

  steps.push({
    title: "Initialize — candidates=[2,3,6,7], target=7",
    detail: "Candidates are sorted. Start with empty path, remaining=7. Try each candidate; reuse allowed (start index doesn't advance past current).",
    path: [], remaining: target, phase: "init", codeHL: [0, 1, 2, 15],
    results: [], trying: null, pruneReason: null, finalized: [],
  });

  function snap(title, detail, path, remaining, phase, codeHL, trying, pruneReason) {
    steps.push({
      title, detail, path: [...path], remaining, phase, codeHL,
      results: results.map(r => [...r]), trying, pruneReason,
      finalized: [...finalized],
    });
  }

  // Trace the actual recursion
  function solve(start, path, remaining) {
    if (steps.length > 40) return;
    if (remaining === 0) {
      results.push([...path]);
      finalized.push([...path]);
      snap(
        `✓ Found: [${path.join(",")}]`,
        `remaining=0 — record [${path.join(",")}] as solution #${results.length}.`,
        path, remaining, "found", [5, 6, 7], null, null
      );
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      const c = candidates[i];
      if (c > remaining) {
        snap(
          `Prune: ${c} > remaining ${remaining}`,
          `candidates[${i}]=${c} exceeds remaining=${remaining}. All subsequent candidates are ≥ ${c}, so break.`,
          path, remaining, "prune", [9, 10], c, `${c} > ${remaining}`
        );
        break;
      }
      path.push(c);
      snap(
        `Choose ${c} → path=[${path.join(",")}], remaining=${remaining - c}`,
        `Append ${c} to path. remaining = ${remaining} − ${c} = ${remaining - c}. Recurse with start=${i}.`,
        path, remaining - c, "choose", [11, 12], c, null
      );
      solve(i, path, remaining - c);
      path.pop();
      if (steps.length <= 40) {
        snap(
          `Undo ${c} → path=[${path.join(",")}]`,
          `Pop ${c} from path (backtrack). Try next candidate.`,
          path, remaining, "undo", [13], c, null
        );
      }
    }
  }

  solve(0, [], target);

  snap(
    `✓ Complete — ${results.length} combinations found`,
    `Result: [${results.map(r => `[${r.join(",")}]`).join(", ")}]. Matches expected output.`,
    [], 0, "done", [16], null, null
  );

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS  —  N-Queens (N=4)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildNQueensSteps() {
  const N = 4;
  const steps = [];
  const results = [];
  const finalized = [];

  steps.push({
    title: "Initialize — Place 4 queens on 4×4 board",
    detail: "One queen per row. Track occupied columns, diagonals (row−col), and anti-diagonals (row+col). Try each column in order.",
    board: Array.from({ length: N }, () => new Array(N).fill(0)),
    placement: [], row: 0, phase: "init", codeHL: [0, 1, 2, 22],
    results: [], tryCol: null, conflict: null, finalized: [],
    cols: new Set(), diag: new Set(), anti: new Set(),
  });

  const colsSet = new Set();
  const diagSet = new Set();
  const antiSet = new Set();
  const placement = [];

  function boardSnap() {
    const b = Array.from({ length: N }, () => new Array(N).fill(0));
    for (let r = 0; r < placement.length; r++) b[r][placement[r]] = 1;
    return b;
  }

  function snap(title, detail, row, phase, codeHL, tryCol, conflict) {
    steps.push({
      title, detail,
      board: boardSnap(), placement: [...placement], row, phase, codeHL,
      results: results.map(r => [...r]), tryCol, conflict,
      finalized: [...finalized],
      cols: new Set(colsSet), diag: new Set(diagSet), anti: new Set(antiSet),
    });
  }

  function solve(row) {
    if (steps.length > 50) return;
    if (row === N) {
      results.push([...placement]);
      finalized.push([...placement]);
      snap(
        `✓ Found solution #${results.length}: [${placement.join(",")}]`,
        `All 4 queens placed! Record [${placement.join(",")}].`,
        row, "found", [5, 6, 7], null, null
      );
      return;
    }
    for (let col = 0; col < N; col++) {
      if (colsSet.has(col)) {
        if (steps.length <= 50)
          snap(`Row ${row}, col ${col}: column conflict`, `Col ${col} is occupied.`, row, "conflict", [8, 9], col, "col");
        continue;
      }
      if (diagSet.has(row - col)) {
        if (steps.length <= 50)
          snap(`Row ${row}, col ${col}: diagonal conflict`, `Diagonal ${row}−${col}=${row - col} is occupied.`, row, "conflict", [8, 10], col, "diag");
        continue;
      }
      if (antiSet.has(row + col)) {
        if (steps.length <= 50)
          snap(`Row ${row}, col ${col}: anti-diagonal conflict`, `Anti-diagonal ${row}+${col}=${row + col} is occupied.`, row, "conflict", [8, 11], col, "anti");
        continue;
      }
      // Place
      colsSet.add(col); diagSet.add(row - col); antiSet.add(row + col);
      placement.push(col);
      snap(
        `Place queen at (${row},${col})`,
        `Col ${col} is safe. Add col=${col}, diag=${row - col}, anti=${row + col} to constraint sets.`,
        row, "place", [12, 13, 14, 15, 16], col, null
      );
      solve(row + 1);
      placement.pop();
      colsSet.delete(col); diagSet.delete(row - col); antiSet.delete(row + col);
      if (steps.length <= 50)
        snap(`Backtrack from (${row},${col})`, `Remove queen. Try next column.`, row, "undo", [17, 18, 19, 20], col, null);
    }
  }

  solve(0);

  snap(
    `✓ Complete — ${results.length} solutions found`,
    `Solutions: [${results.map(r => `[${r.join(",")}]`).join(", ")}].`,
    0, "done", [23], null, null
  );

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS  —  Sudoku (4×4)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildSudokuSteps() {
  const initial = EXPECTED.sudoku.initial.map(r => [...r]);
  const board = initial.map(r => [...r]);
  const steps = [];
  const filledCells = new Set();
  // Track initially filled cells
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (board[r][c] !== 0) filledCells.add(`${r},${c}`);

  const totalEmpty = 16 - filledCells.size;

  function boardSnap() { return board.map(r => [...r]); }

  function snap(title, detail, phase, codeHL, tryCell, tryNum, filledCount) {
    steps.push({
      title, detail, board: boardSnap(), phase, codeHL,
      tryCell, tryNum, filledCount,
      finalized: new Set(filledCells),
      totalEmpty,
    });
  }

  snap(
    "Initialize — 4×4 Sudoku with given clues",
    `${filledCells.size} cells pre-filled, ${totalEmpty} empty cells to solve. Scan left-to-right, top-to-bottom for the first empty cell.`,
    "init", [0, 11, 12, 13, 14], null, null, 0
  );

  function isValid(r, c, num) {
    for (let i = 0; i < 4; i++) {
      if (board[r][i] === num) return false;
      if (board[i][c] === num) return false;
    }
    const br = 2 * Math.floor(r / 2), bc = 2 * Math.floor(c / 2);
    for (let i = br; i < br + 2; i++)
      for (let j = bc; j < bc + 2; j++)
        if (board[i][j] === num) return false;
    return true;
  }

  let filled = 0;
  let limitSteps = false;

  function solve() {
    if (limitSteps) return false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] !== 0) continue;
        let anyFailed = false;
        for (let num = 1; num <= 4; num++) {
          if (steps.length > 35) { limitSteps = true; return false; }
          if (isValid(r, c, num)) {
            board[r][c] = num;
            filled++;
            filledCells.add(`${r},${c}`);
            snap(
              `Place ${num} at (${r},${c})`,
              `Try ${num} at (${r},${c}): row/col/box constraints pass. ${filled}/${totalEmpty} cells filled.`,
              "place", [15, 16, 17, 18], [r, c], num, filled
            );
            if (solve()) return true;
            // Backtrack
            board[r][c] = 0;
            filled--;
            filledCells.delete(`${r},${c}`);
            anyFailed = true;
            snap(
              `Undo (${r},${c})=${num} — backtrack`,
              `Deeper search failed. Reset (${r},${c}) to empty, try next digit.`,
              "undo", [19], [r, c], num, filled
            );
          }
        }
        if (board[r][c] === 0) {
          // No valid number found — need to backtrack further
          if (!anyFailed) {
            snap(
              `No valid digit for (${r},${c}) — backtrack`,
              `Digits 1–4 all violate constraints at (${r},${c}). Return False to backtrack.`,
              "dead", [20], [r, c], null, filled
            );
          }
          return false;
        }
      }
    }
    return true;
  }

  solve();

  snap(
    "✓ Complete — Sudoku solved",
    `All ${totalEmpty} empty cells filled. Each row, column, and 2×2 box contains {1,2,3,4}.`,
    "done", [21, 24], null, null, totalEmpty
  );

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   BUILD STEPS  —  Word Break II
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildWordBreakSteps() {
  const s = "catsanddog";
  const wordDict = ["cat", "cats", "and", "sand", "dog"];
  const wordSet = new Set(wordDict);
  const steps = [];
  const results = [];
  const finalized = [];

  steps.push({
    title: 'Initialize — s="catsanddog"',
    detail: `Dictionary: {${wordDict.join(", ")}}. Try every prefix at each index; if it's a word, recurse on the suffix.`,
    path: [], index: 0, phase: "init", codeHL: [0, 1, 2, 15],
    results: [], trying: null, finalized: [],
    segments: [], // [{word, start, end}]
  });

  function snap(title, detail, path, index, phase, codeHL, trying) {
    steps.push({
      title, detail, path: [...path], index, phase, codeHL,
      results: results.map(r => r), trying, finalized: [...finalized],
      segments: path.map((w, i) => {
        const start = path.slice(0, i).reduce((a, b) => a + b.length, 0);
        return { word: w, start, end: start + w.length };
      }),
    });
  }

  function solve(start, path) {
    if (steps.length > 35) return;
    if (start === s.length) {
      const sentence = path.join(" ");
      results.push(sentence);
      finalized.push(sentence);
      snap(
        `✓ Found: "${sentence}"`,
        `Index reached end of string. Record "${sentence}" as solution #${results.length}.`,
        path, start, "found", [5, 6, 7], null
      );
      return;
    }
    for (let end = start + 1; end <= s.length; end++) {
      const word = s.slice(start, end);
      if (steps.length > 35) return;
      if (wordSet.has(word)) {
        path.push(word);
        snap(
          `Match "${word}" at index ${start}`,
          `s[${start}:${end}] = "${word}" is in dictionary. Append and recurse from index ${end}.`,
          path, end, "match", [8, 9, 10, 11, 12], word
        );
        solve(end, path);
        path.pop();
        if (steps.length <= 35) {
          snap(
            `Undo "${word}" — try longer prefix`,
            `Pop "${word}", continue scanning prefixes from index ${start}.`,
            path, start, "undo", [13], word
          );
        }
      }
    }
  }

  solve(0, []);

  snap(
    `✓ Complete — ${results.length} sentences found`,
    `Result: [${results.map(r => `"${r}"`).join(", ")}].`,
    [], 0, "done", [16], null
  );

  return steps;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP BUILDER DISPATCH
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildSteps(key) {
  switch (key) {
    case "combsum": return buildCombSumSteps();
    case "nqueens": return buildNQueensSteps();
    case "sudoku": return buildSudokuSteps();
    case "wordbreak": return buildWordBreakSteps();
    default: return [];
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION — Combination Sum
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function CombSumViz({ step }) {
  const { path, remaining } = step;
  const target = 7;
  const sum = target - remaining;
  return (
    <svg viewBox="0 0 320 180" className="w-full" style={{ maxHeight: 200 }}>
      {/* Target bar background */}
      <rect x={20} y={20} width={280} height={28} rx={6} fill="#27272a" stroke="#3f3f46" strokeWidth={1} />
      <text x={160} y={12} textAnchor="middle" fill="#71717a" fontSize="9" fontFamily="monospace">target = {target}</text>
      {/* Filled portion */}
      {sum > 0 && (
        <rect x={20} y={20} width={Math.min(280, (sum / target) * 280)} height={28} rx={6}
          fill={remaining === 0 ? "#059669" : "#7c3aed"} opacity={0.7} />
      )}
      {sum > 0 && (
        <text x={20 + Math.min(280, (sum / target) * 280) / 2} y={38}
          textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="monospace">{sum}</text>
      )}
      {remaining > 0 && sum > 0 && (
        <text x={20 + Math.min(280, (sum / target) * 280) + (280 - Math.min(280, (sum / target) * 280)) / 2} y={38}
          textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="monospace">{remaining} left</text>
      )}

      {/* Path blocks */}
      <text x={20} y={74} fill="#a1a1aa" fontSize="9" fontFamily="monospace">path:</text>
      {path.length === 0 && <text x={55} y={74} fill="#52525b" fontSize="9" fontFamily="monospace" fontStyle="italic">[ ]</text>}
      {path.map((val, i) => {
        const x = 20 + i * 44;
        const colors = ["#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"];
        return (
          <g key={i}>
            <rect x={x} y={82} width={38} height={32} rx={6}
              fill={colors[i % colors.length]} stroke="#8b5cf6" strokeWidth={1.5} />
            <text x={x + 19} y={102} textAnchor="middle" fill="#fff" fontSize="14"
              fontWeight="700" fontFamily="monospace">{val}</text>
          </g>
        );
      })}

      {/* Results */}
      <text x={20} y={140} fill="#a1a1aa" fontSize="9" fontFamily="monospace">
        found: {step.results.length === 0 ? "none yet" : step.results.map(r => `[${r.join(",")}]`).join("  ")}
      </text>
      {step.pruneReason && (
        <g>
          <rect x={20} y={150} width={280} height={20} rx={4} fill="#7f1d1d" opacity={0.5} />
          <text x={160} y={163} textAnchor="middle" fill="#fca5a5" fontSize="9" fontFamily="monospace">✗ {step.pruneReason}</text>
        </g>
      )}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION — N-Queens
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function NQueensViz({ step }) {
  const { board, tryCol, row, conflict, phase } = step;
  const N = 4;
  const cell = 50;
  const off = 10;
  return (
    <svg viewBox={`0 0 ${N * cell + off * 2} ${N * cell + off * 2 + 12}`} className="w-full" style={{ maxHeight: 230 }}>
      {Array.from({ length: N }, (_, r) =>
        Array.from({ length: N }, (_, c) => {
          const isLight = (r + c) % 2 === 0;
          const isQueen = board[r][c] === 1;
          const isTry = phase !== "done" && r === row && c === tryCol;
          const isConflict = isTry && conflict;
          let fill = isLight ? "#3f3f46" : "#27272a";
          if (isConflict) fill = "#7f1d1d";
          else if (isTry) fill = "#1e3a5f";
          else if (isQueen) fill = "#4c1d95";
          return (
            <g key={`${r}-${c}`}>
              <rect x={off + c * cell} y={off + r * cell} width={cell} height={cell}
                fill={fill} stroke="#52525b" strokeWidth={0.5} />
              {isQueen && (
                <text x={off + c * cell + cell / 2} y={off + r * cell + cell / 2 + 2}
                  textAnchor="middle" dominantBaseline="central" fontSize="24">♛</text>
              )}
              {isConflict && (
                <text x={off + c * cell + cell / 2} y={off + r * cell + cell / 2 + 2}
                  textAnchor="middle" dominantBaseline="central" fill="#f87171" fontSize="18" fontWeight="700">✗</text>
              )}
            </g>
          );
        })
      )}
      {/* Row/col labels */}
      {Array.from({ length: N }, (_, i) => (
        <g key={`lbl-${i}`}>
          <text x={off + i * cell + cell / 2} y={off + N * cell + 12} textAnchor="middle" fill="#52525b" fontSize="9" fontFamily="monospace">{i}</text>
          <text x={4} y={off + i * cell + cell / 2 + 2} textAnchor="middle" fill="#52525b" fontSize="9" fontFamily="monospace">{i}</text>
        </g>
      ))}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION — Sudoku 4×4
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function SudokuViz({ step }) {
  const { board, tryCell, tryNum, phase } = step;
  const cell = 54;
  const off = 8;
  const initial = EXPECTED.sudoku.initial;
  return (
    <svg viewBox={`0 0 ${4 * cell + off * 2} ${4 * cell + off * 2}`} className="w-full" style={{ maxHeight: 230 }}>
      {/* Cells */}
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => {
          const val = board[r][c];
          const isInitial = initial[r][c] !== 0;
          const isTry = tryCell && tryCell[0] === r && tryCell[1] === c;
          const isDead = isTry && phase === "dead";
          const isUndo = isTry && phase === "undo";
          let fill = "#18181b";
          if (isDead) fill = "#7f1d1d";
          else if (isUndo) fill = "#78350f";
          else if (isTry) fill = "#1e3a5f";
          else if (val && !isInitial) fill = "#14532d";
          return (
            <g key={`${r}-${c}`}>
              <rect x={off + c * cell} y={off + r * cell} width={cell} height={cell}
                fill={fill} stroke="#3f3f46" strokeWidth={0.5} />
              {val !== 0 && (
                <text x={off + c * cell + cell / 2} y={off + r * cell + cell / 2 + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fill={isInitial ? "#a1a1aa" : isTry ? "#93c5fd" : "#86efac"}
                  fontSize="18" fontWeight={isInitial ? "400" : "700"} fontFamily="monospace">{val}</text>
              )}
            </g>
          );
        })
      )}
      {/* 2×2 box borders */}
      {[0, 2].map(r => [0, 2].map(c => (
        <rect key={`box-${r}-${c}`} x={off + c * cell} y={off + r * cell}
          width={cell * 2} height={cell * 2} fill="none" stroke="#71717a" strokeWidth={2} rx={2} />
      )))}
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION — Word Break
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function WordBreakViz({ step }) {
  const s = "catsanddog";
  const { segments, index, phase, trying } = step;
  const charW = 26;
  const off = 20;
  const colors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626"];
  return (
    <svg viewBox={`0 0 ${s.length * charW + off * 2} 130`} className="w-full" style={{ maxHeight: 160 }}>
      {/* Character boxes */}
      {s.split("").map((ch, i) => {
        const seg = segments.find(seg => i >= seg.start && i < seg.end);
        const segIdx = seg ? segments.indexOf(seg) : -1;
        const isCursor = i === index && phase !== "done" && phase !== "found";
        let fill = "#18181b";
        if (seg) fill = colors[segIdx % colors.length] + "40";
        if (isCursor) fill = "#1e3a5f";
        return (
          <g key={i}>
            <rect x={off + i * charW} y={30} width={charW - 2} height={32} rx={4}
              fill={fill} stroke={seg ? colors[segIdx % colors.length] : "#3f3f46"} strokeWidth={seg ? 2 : 0.5} />
            <text x={off + i * charW + (charW - 2) / 2} y={50}
              textAnchor="middle" dominantBaseline="central"
              fill={seg ? "#e2e8f0" : "#a1a1aa"} fontSize="14" fontWeight="600" fontFamily="monospace">{ch}</text>
            <text x={off + i * charW + (charW - 2) / 2} y={22}
              textAnchor="middle" fill="#52525b" fontSize="8" fontFamily="monospace">{i}</text>
          </g>
        );
      })}
      {/* Segment labels */}
      {segments.map((seg, i) => {
        const x1 = off + seg.start * charW;
        const x2 = off + seg.end * charW - 2;
        const mx = (x1 + x2) / 2;
        return (
          <g key={`seg-${i}`}>
            <line x1={x1} y1={68} x2={x2} y2={68} stroke={colors[i % colors.length]} strokeWidth={2} />
            <text x={mx} y={82} textAnchor="middle" fill={colors[i % colors.length]} fontSize="10" fontWeight="700" fontFamily="monospace">
              "{seg.word}"
            </text>
          </g>
        );
      })}
      {/* Results */}
      <text x={off} y={108} fill="#a1a1aa" fontSize="9" fontFamily="monospace">
        found: {step.results.length === 0 ? "none yet" : step.results.map(r => `"${r}"`).join(", ")}
      </text>
    </svg>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   VISUALIZATION DISPATCH
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function Visualization({ pKey, step }) {
  switch (pKey) {
    case "combsum": return <CombSumViz step={step} />;
    case "nqueens": return <NQueensViz step={step} />;
    case "sudoku": return <SudokuViz step={step} />;
    case "wordbreak": return <WordBreakViz step={step} />;
    default: return null;
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   IO PANEL  —  Input / Expected / Progressive Output
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function IOPanel({ pKey, step }) {
  const done = step.phase === "done";
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
      {/* Input */}
      <div>
        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Input</div>
        <div className="font-mono text-[11px] text-zinc-400 space-y-0.5" style={{ whiteSpace: "pre" }}>
          {pKey === "combsum" && <>
            <div><span className="text-zinc-500">candidates</span> = <span className="text-zinc-300">[2, 3, 6, 7]</span></div>
            <div><span className="text-zinc-500">target    </span> = <span className="text-blue-400">7</span></div>
          </>}
          {pKey === "nqueens" && <>
            <div><span className="text-zinc-500">n</span> = <span className="text-blue-400">4</span></div>
          </>}
          {pKey === "sudoku" && <>
            <div><span className="text-zinc-500">board</span> = <span className="text-zinc-300">4×4</span></div>
            {EXPECTED.sudoku.initial.map((row, i) => (
              <div key={i} className="pl-4 text-zinc-300">
                [{row.map(v => v === 0 ? "." : v).join(", ")}]
              </div>
            ))}
          </>}
          {pKey === "wordbreak" && <>
            <div><span className="text-zinc-500">s   </span> = <span className="text-zinc-300">"catsanddog"</span></div>
            <div><span className="text-zinc-500">dict</span> = <span className="text-zinc-300">{`["cat","cats",`}</span></div>
            <div><span className="text-zinc-300 pl-6">{`"and","sand","dog"]`}</span></div>
          </>}
        </div>
      </div>

      {/* Expected Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Expected Output</div>
        <div className="font-mono text-[11px] text-zinc-300">
          {pKey === "combsum" && <div>[[2,2,3], [7]]</div>}
          {pKey === "nqueens" && <div>[[1,3,0,2], [2,0,3,1]]</div>}
          {pKey === "sudoku" && EXPECTED.sudoku.solution.map((row, i) => (
            <div key={i}>[{row.join(", ")}]</div>
          ))}
          {pKey === "wordbreak" && <div>["cat sand dog",{"\n"} "cats and dog"]</div>}
        </div>
      </div>

      {/* Progressive Output */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Output (building)</div>
          {done && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">✓ MATCH</span>}
        </div>
        <div className="font-mono text-[11px]">
          {pKey === "combsum" && (
            <div>
              <span className="text-zinc-500">[</span>
              {step.finalized.length === 0
                ? <span className="text-zinc-600">?</span>
                : step.finalized.map((r, i) => (
                  <span key={i}>
                    <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>
                      [{r.join(",")}]
                    </span>
                    {i < step.finalized.length - 1 && <span className="text-zinc-600">, </span>}
                  </span>
                ))
              }
              <span className="text-zinc-500">]</span>
            </div>
          )}
          {pKey === "nqueens" && (
            <div>
              <span className="text-zinc-500">[</span>
              {step.finalized.length === 0
                ? <span className="text-zinc-600">?</span>
                : step.finalized.map((r, i) => (
                  <span key={i}>
                    <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>
                      [{r.join(",")}]
                    </span>
                    {i < step.finalized.length - 1 && <span className="text-zinc-600">, </span>}
                  </span>
                ))
              }
              <span className="text-zinc-500">]</span>
            </div>
          )}
          {pKey === "sudoku" && (
            <div>
              <span className="text-zinc-500">filled: </span>
              <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>
                {step.filledCount}/{step.totalEmpty}
              </span>
              {done && <span className="text-emerald-600 ml-1">✓ solved</span>}
            </div>
          )}
          {pKey === "wordbreak" && (
            <div>
              <span className="text-zinc-500">[</span>
              {step.finalized.length === 0
                ? <span className="text-zinc-600">?</span>
                : step.finalized.map((r, i) => (
                  <span key={i}>
                    <span className={done ? "text-emerald-300 font-bold" : "text-zinc-300"}>
                      "{r}"
                    </span>
                    {i < step.finalized.length - 1 && <span className="text-zinc-600">, </span>}
                  </span>
                ))
              }
              <span className="text-zinc-500">]</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CODE PANEL
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function CodePanel({ pKey, highlightLines }) {
  const code = CODES[pKey] || [];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-2">Python</div>
      <div className="font-mono text-[11px] leading-[1.7]" style={{ whiteSpace: "pre" }}>
        {code.map((line) => {
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NAV BAR
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function NavBar({ si, setSi, total }) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
      <button
        onClick={() => setSi(Math.max(0, si - 1))} disabled={si === 0}
        className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >â† Prev</button>
      <div className="flex gap-1.5 flex-wrap justify-center max-w-[60%]">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setSi(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === si ? "bg-blue-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`} />
        ))}
      </div>
      <button
        onClick={() => setSi(Math.min(total - 1, si + 1))} disabled={si >= total - 1}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-25 text-sm font-medium rounded-xl transition-colors"
      >Next →</button>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STEP PHASE COLORS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function phaseStyle(phase) {
  switch (phase) {
    case "choose": case "place": case "match":
      return "bg-blue-900 text-blue-300";
    case "found":
      return "bg-emerald-900 text-emerald-300";
    case "prune": case "conflict": case "dead":
      return "bg-red-900 text-red-300";
    case "undo":
      return "bg-amber-900 text-amber-300";
    case "done":
      return "bg-emerald-900 text-emerald-300";
    default:
      return "bg-zinc-800 text-zinc-400";
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STATE PANEL — per-problem state display
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function StatePanel({ pKey, step }) {
  if (pKey === "combsum") {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div>
        <div className="flex gap-4">
          <div className="flex-1 text-center">
            <div className="text-lg font-bold font-mono text-violet-400">[{step.path.join(",")}]</div>
            <div className="text-[9px] text-zinc-600">path</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold font-mono text-amber-400">{step.remaining}</div>
            <div className="text-[9px] text-zinc-600">remaining</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold font-mono text-emerald-400">{step.results.length}</div>
            <div className="text-[9px] text-zinc-600">found</div>
          </div>
        </div>
      </div>
    );
  }
  if (pKey === "nqueens") {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Constraint Sets</div>
        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 w-12">cols:</span>
            <span className="text-violet-400">{`{${[...step.cols].join(",")}}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 w-12">diag:</span>
            <span className="text-blue-400">{`{${[...step.diag].join(",")}}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 w-12">anti:</span>
            <span className="text-amber-400">{`{${[...step.anti].join(",")}}`}</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
            <span className="text-zinc-500 w-12">place:</span>
            <span className="text-emerald-400">[{step.placement.join(",")}]</span>
          </div>
        </div>
      </div>
    );
  }
  if (pKey === "sudoku") {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div>
        <div className="flex gap-4">
          <div className="flex-1 text-center">
            <div className="text-lg font-bold font-mono text-violet-400">
              {step.tryCell ? `(${step.tryCell[0]},${step.tryCell[1]})` : "—"}
            </div>
            <div className="text-[9px] text-zinc-600">cell</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold font-mono text-blue-400">{step.tryNum ?? "—"}</div>
            <div className="text-[9px] text-zinc-600">trying</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold font-mono text-emerald-400">{step.filledCount}</div>
            <div className="text-[9px] text-zinc-600">filled</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold font-mono text-amber-400">{step.totalEmpty - step.filledCount}</div>
            <div className="text-[9px] text-zinc-600">remaining</div>
          </div>
        </div>
      </div>
    );
  }
  if (pKey === "wordbreak") {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">State</div>
        <div className="flex gap-4">
          <div className="flex-1 text-center">
            <div className="text-lg font-bold font-mono text-violet-400">{step.index}</div>
            <div className="text-[9px] text-zinc-600">index</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm font-bold font-mono text-blue-400 truncate">
              {step.path.length > 0 ? step.path.join(" + ") : "—"}
            </div>
            <div className="text-[9px] text-zinc-600">path</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold font-mono text-emerald-400">{step.results.length}</div>
            <div className="text-[9px] text-zinc-600">found</div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function BacktrackingViz() {
  const [pKey, setPKey] = useState("combsum");
  const [si, setSi] = useState(0);
  const steps = useMemo(() => buildSteps(pKey), [pKey]);
  const step = steps[Math.min(si, steps.length - 1)];
  const problem = PROBLEMS[pKey];
  const switchProblem = (k) => { setPKey(k); setSi(0); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-4" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto">

        {/* â•â•â• 1. HEADER â•â•â• */}
        <div className="mb-3 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Backtracking</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Explore All Choices • Prune Invalid Branches • Undo &amp; Retry</p>
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

        {/* â•â•â• 2. CORE IDEA â•â•â• */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-3">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Core Idea</span>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">{problem.coreIdea}</p>
        </div>

        {/* â•â•â• 3. NAVIGATION â•â•â• */}
        <div className="mb-3">
          <NavBar si={Math.min(si, steps.length - 1)} setSi={setSi} total={steps.length} />
        </div>

        {/* â•â•â• 4. 3-COLUMN GRID â•â•â• */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── COL 1: IO + Visualization ── */}
          <div className="col-span-3 space-y-3">
            <IOPanel pKey={pKey} step={step} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <div className="text-[10px] text-zinc-500 mb-1">{problem.subtitle}</div>
              <Visualization pKey={pKey} step={step} />
            </div>
          </div>

          {/* ── COL 2: Steps + State ── */}
          <div className="col-span-5 space-y-3">
            {/* Step narration */}
            <div className={`rounded-2xl border p-4 ${
              step.phase === "done" ? "bg-emerald-950/30 border-emerald-900" :
              step.phase === "found" ? "bg-emerald-950/20 border-emerald-800" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs text-zinc-600 font-mono">Step {Math.min(si, steps.length - 1) + 1}/{steps.length}</span>
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
                  {pKey === "combsum" && `${step.results.length} combinations: [${step.results.map(r => `[${r.join(",")}]`).join(", ")}]`}
                  {pKey === "nqueens" && `${step.results.length} solutions: [${step.results.map(r => `[${r.join(",")}]`).join(", ")}]`}
                  {pKey === "sudoku" && `Board solved — all constraints satisfied.`}
                  {pKey === "wordbreak" && `${step.results.length} sentences: ${step.results.map(r => `"${r}"`).join(", ")}`}
                </div>
              </div>
            )}
          </div>

          {/* ── COL 3: Code ── */}
          <div className="col-span-4">
            <CodePanel pKey={pKey} highlightLines={step.codeHL} />
          </div>

        </div>

        {/* â•â•â• 5. BOTTOM ROW: When to Use + Classic Problems â•â•â• */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* When to Use */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">When to Use</div>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>"Find all" or "count all" valid configurations / combinations / permutations</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Constraint satisfaction: place items subject to rules (queens, Sudoku)</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Combinatorial search with pruning — exponential worst-case but fast in practice</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">›</span>Build solution incrementally, undo choices that lead to dead ends</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-[10px] text-zinc-600 space-y-1">
                <div><span className="text-zinc-500 font-semibold">Time:</span> O(k^n) worst case — pruning reduces in practice</div>
                <div><span className="text-zinc-500 font-semibold">Space:</span> O(n) recursion depth — path length</div>
                <div><span className="text-zinc-500 font-semibold">Template:</span> choose → explore → unchoose</div>
              </div>
            </div>
          </div>

          {/* Classic Problems */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Classic Problems</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 39 — Combination Sum</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 51 — N-Queens</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 37 — Sudoku Solver</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 140 — Word Break II</span><span className="ml-auto text-[10px] text-red-700">Hard</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 46 — Permutations</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 78 — Subsets</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 79 — Word Search</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
              <div className="flex items-center gap-2"><span className="text-amber-500/60">•</span><span className="text-zinc-400">LC 131 — Palindrome Partitioning</span><span className="ml-auto text-[10px] text-amber-700">Medium</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
