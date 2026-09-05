import { solve as greedy } from "./greedy.js";
import { solve as dfs } from "./dfs.js";

const registry = new Map();
export function registerAlgorithm(algorithm) { registry.set(algorithm.id, Object.freeze(algorithm)); }
export function getAlgorithm(id) { return registry.get(id); }
export function listAlgorithms() { return [...registry.values()]; }
registerAlgorithm({ id: "greedy", name: "Greedy", description: "快速，不保證最少交易", solve: greedy });
registerAlgorithm({ id: "dfs", name: "DFS", description: "尋找最少交易", solve: dfs });
