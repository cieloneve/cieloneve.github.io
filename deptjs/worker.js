import { solve } from "./algorithms/dfs.js";

self.onmessage = event => {
  if (event.data?.type !== "solve") return;
  try {
    const result = solve(event.data.balances, {
      ...event.data.options,
      onProgress: nodesVisited => self.postMessage({ type: "progress", nodesVisited })
    });
    self.postMessage({ type: "result", result });
  } catch (error) {
    self.postMessage({ type: "result", result: { status: "error", transactions: [], transactionCount: 0,
      optimal: false, stats: { elapsedMs: 0, nodesVisited: 0 }, error: error.message } });
  }
};
