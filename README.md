# AlgoVault — Interactive DSA Visualizations

A portal hosting 27 interactive algorithm & data structure visualizations, organized into 6 categories.

## Categories

- **Shortest Path** (6): Dijkstra, Bellman-Ford, Floyd-Warshall, A*, 0-1 BFS, Bidirectional BFS
- **Graph Traversal** (2): BFS State Space, Multi-Source BFS
- **Graph Structure** (6): Union-Find, Bipartite, Tarjan's SCC, Kruskal's MST, Eulerian Path, Kahn's Topological Sort
- **Dynamic Programming** (5): House Robber, Edit Distance, Knapsack, Burst Balloons, Stock Trading
- **Data Structures** (5): Heap, Trie, Segment Tree, Monotonic Stack, Binary Trees
- **Algorithmic Techniques** (3): Binary Search, Two Pointer, Backtracking

## Getting Started

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

This repo is pre-configured for GitHub Pages deployment via GitHub Actions.

1. Push this code to a GitHub repo named `algo-vault`
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Push to `main` — the site auto-deploys to `https://yourname.github.io/algo-vault/`

> **Note:** If your repo has a different name, update the `base` field in `vite.config.ts` to match (e.g. `base: "/your-repo-name/"`). If using a custom domain, set `base: "/"`.

## Build for Production

```bash
npm install
npm run build
```

Output goes to `dist/`.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Hash-based routing (no server config needed)
- Lazy-loaded visualization chunks for fast initial load
