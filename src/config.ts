import { lazy, ComponentType } from "react";

export interface Algorithm {
  id: string;
  name: string;
  subtitle: string;
  component: React.LazyExoticComponent<ComponentType<any>>;
}

export interface AlgorithmGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string; // tailwind accent
  algorithms: Algorithm[];
}

export const groups: AlgorithmGroup[] = [
  {
    id: "shortest-path",
    name: "Shortest Path",
    icon: "⚡",
    description: "Classic algorithms for finding optimal paths between nodes in weighted graphs.",
    color: "#f59e0b",
    algorithms: [
      { id: "dijkstra", name: "Dijkstra's Algorithm", subtitle: "Greedy single-source shortest path", component: lazy(() => import("./visualizations/dijkstra.jsx")) },
      { id: "bellman-ford", name: "Bellman-Ford", subtitle: "Handles negative edge weights", component: lazy(() => import("./visualizations/bellman-ford.jsx")) },
      { id: "floyd-warshall", name: "Floyd-Warshall", subtitle: "All-pairs shortest paths via DP", component: lazy(() => import("./visualizations/floyd-warshall.jsx")) },
      { id: "astar", name: "A* Search", subtitle: "Heuristic-guided pathfinding", component: lazy(() => import("./visualizations/astar.jsx")) },
      { id: "zero-one-bfs", name: "0-1 BFS", subtitle: "Deque-based BFS for 0/1 weights", component: lazy(() => import("./visualizations/zero-one-bfs.jsx")) },
      { id: "bidirectional-bfs", name: "Bidirectional BFS", subtitle: "Search from both ends simultaneously", component: lazy(() => import("./visualizations/bidirectional-bfs.jsx")) },
    ],
  },
  {
    id: "graph-traversal",
    name: "Graph Traversal",
    icon: "🔍",
    description: "Techniques for systematically exploring graphs and state spaces.",
    color: "#3b82f6",
    algorithms: [
      { id: "bfs-state-space", name: "BFS State Space", subtitle: "Level-order exploration of states", component: lazy(() => import("./visualizations/bfs-state-space.jsx")) },
      { id: "multi-source-bfs", name: "Multi-Source BFS", subtitle: "BFS from multiple starting points", component: lazy(() => import("./visualizations/multi-source-bfs.jsx")) },
    ],
  },
  {
    id: "graph-structure",
    name: "Graph Structure",
    icon: "🕸️",
    description: "Algorithms for analyzing connectivity, components, and structural properties.",
    color: "#8b5cf6",
    algorithms: [
      { id: "union-find", name: "Union-Find (DSU)", subtitle: "Disjoint set union with path compression", component: lazy(() => import("./visualizations/union-find.jsx")) },
      { id: "bipartite", name: "Bipartite Check", subtitle: "Two-coloring graph validation", component: lazy(() => import("./visualizations/bipartite.jsx")) },
      { id: "tarjan-scc", name: "Tarjan's SCC", subtitle: "Strongly connected components", component: lazy(() => import("./visualizations/tarjan-scc.jsx")) },
      { id: "kruskal-mst", name: "Kruskal's MST", subtitle: "Minimum spanning tree via edge sorting", component: lazy(() => import("./visualizations/kruskal-mst.jsx")) },
      { id: "eulerian-path", name: "Eulerian Path", subtitle: "Traverse every edge exactly once", component: lazy(() => import("./visualizations/eulerian-path.jsx")) },
      { id: "kahns-topo", name: "Kahn's Topological Sort", subtitle: "BFS-based ordering of DAGs", component: lazy(() => import("./visualizations/kahns-v4.jsx")) },
    ],
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    icon: "📐",
    description: "Breaking complex problems into overlapping subproblems with optimal substructure.",
    color: "#10b981",
    algorithms: [
      { id: "dp-1d", name: "1D DP — House Robber", subtitle: "Linear recurrence with constraints", component: lazy(() => import("./visualizations/dp-1d-house-robber.jsx")) },
      { id: "dp-2d", name: "2D DP — Edit Distance", subtitle: "String transformation with grid DP", component: lazy(() => import("./visualizations/dp-2d-edit-distance.jsx")) },
      { id: "dp-knapsack", name: "0/1 Knapsack", subtitle: "Subset optimization under capacity", component: lazy(() => import("./visualizations/dp-knapsack.jsx")) },
      { id: "dp-interval", name: "Interval DP — Burst Balloons", subtitle: "Optimal substructure on ranges", component: lazy(() => import("./visualizations/dp-interval-balloons.jsx")) },
      { id: "dp-state-machine", name: "State Machine DP — Stock", subtitle: "Multi-state transitions for profit", component: lazy(() => import("./visualizations/dp-state-machine-stock.jsx")) },
    ],
  },
  {
    id: "data-structures",
    name: "Data Structures",
    icon: "🏗️",
    description: "Fundamental data structures that power efficient algorithms.",
    color: "#ef4444",
    algorithms: [
      { id: "heap", name: "Heap & Priority Queue", subtitle: "Binary heap with insert/extract operations", component: lazy(() => import("./visualizations/heap_and_priority_queue.jsx")) },
      { id: "trie", name: "Trie (Prefix Tree)", subtitle: "Character-by-character string storage", component: lazy(() => import("./visualizations/trie.jsx")) },
      { id: "seg-tree", name: "Segment Tree", subtitle: "Range queries with lazy propagation", component: lazy(() => import("./visualizations/seg-tree.jsx")) },
      { id: "mono-stack", name: "Monotonic Stack", subtitle: "Next greater/smaller element patterns", component: lazy(() => import("./visualizations/mono-stack.jsx")) },
      { id: "trees", name: "Binary Trees", subtitle: "Traversals, paths & tree operations", component: lazy(() => import("./visualizations/trees.jsx")) },
      { id: "linked-lists", name: "Linked Lists", subtitle: "Pointer reversal, cycle detection & merge", component: lazy(() => import("./visualizations/linked_lists.jsx")) },
    ],
  },
  {
    id: "techniques",
    name: "Algorithmic Techniques",
    icon: "🎯",
    description: "General-purpose problem-solving patterns and search strategies.",
    color: "#ec4899",
    algorithms: [
      { id: "binary-search", name: "Binary Search", subtitle: "Divide and conquer on sorted data", component: lazy(() => import("./visualizations/binary-search.jsx")) },
      { id: "two-pointer", name: "Two Pointer", subtitle: "Converging/sliding window patterns", component: lazy(() => import("./visualizations/two_pointer.jsx")) },
      { id: "sliding-window", name: "Sliding Window", subtitle: "Variable & fixed window O(n) patterns", component: lazy(() => import("./visualizations/sliding_window.jsx")) },
      { id: "backtracking", name: "Backtracking", subtitle: "Exhaustive search with pruning", component: lazy(() => import("./visualizations/backtracking.jsx")) },
    ],
  },
];

export const totalAlgorithms = groups.reduce((sum, g) => sum + g.algorithms.length, 0);
