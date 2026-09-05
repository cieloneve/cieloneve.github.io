import { result } from "./utils.js";

export function solve(balances, options = {}) {
  const startTime = performance.now(), timeoutMs = Math.max(1, Number(options.timeoutMs) || 1000);
  const maxNodes = Math.max(1, Number(options.maxNodes) || 1000000);
  let nodesVisited = 0, best = null, stopReason = null, lastProgress = startTime;
  try {
    if (!Array.isArray(balances) || !balances.every(Number.isSafeInteger)) throw new Error("Balance 必須是安全整數。");
    const stack = [{ start: 0, debt: balances.slice(), current: [] }];

    while (stack.length > 0) {
      if (stopReason) break;
      if (options.signal?.aborted) { stopReason = "cancelled"; break; }
      if (performance.now() - startTime >= timeoutMs) { stopReason = "timeout"; break; }
      if (nodesVisited >= maxNodes) { stopReason = "node_limit"; break; }

      const frame = stack.pop();
      let { start, debt, current } = frame;
      while (start < debt.length && debt[start] === 0) start++;
      if (start === debt.length) {
        if (!best || current.length < best.length) best = current.map(transaction => ({ ...transaction }));
        continue;
      }
      if (best && current.length >= best.length) continue;

      const children = [];
      const tried = new Set();
      for (let i = start + 1; i < debt.length; i++) {
        if (debt[i] === 0 || (debt[start] < 0) === (debt[i] < 0) || tried.has(debt[i])) continue;
        tried.add(debt[i]);
        const startNegative = debt[start] < 0;
        const iNegative = debt[i] < 0;
        const amount = Math.min(Math.abs(debt[start]), Math.abs(debt[i]));
        const transaction = startNegative
          ? { from: start, to: i, amount }
          : { from: i, to: start, amount };
        const nextDebt = debt.slice();
        nextDebt[start] += startNegative ? amount : -amount;
        nextDebt[i] += iNegative ? amount : -amount;
        children.push({ start, debt: nextDebt, current: [...current, transaction] });
      }

      if (!children.length) continue;
      for (let index = children.length - 1; index >= 0; index--) {
        stack.push(children[index]);
      }

      nodesVisited++;
      if (options.onProgress && (nodesVisited % 1000 === 0 || performance.now() - lastProgress >= 100)) {
        lastProgress = performance.now();
        options.onProgress(nodesVisited);
      }
    }

    if (options.onProgress) options.onProgress(nodesVisited);
    if (stopReason === "cancelled") return result("cancelled", best || [], false, startTime, nodesVisited);
    if (stopReason) return result("timeout", best || [], false, startTime, nodesVisited,
      stopReason === "node_limit" ? "已達搜尋節點上限。" : "計算時間超過限制。");
    return result("success", best || [], true, startTime, nodesVisited);
  } catch (error) { return result("error", [], false, startTime, nodesVisited, error.message); }
}
