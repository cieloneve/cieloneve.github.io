import { result } from "./utils.js";

export function solve(balances, options = {}) {
  const start = performance.now(); let nodesVisited = 0;
  try {
    if (!Array.isArray(balances) || !balances.every(Number.isSafeInteger)) throw new Error("Balance 必須是安全整數。");
    const debt = balances.slice(), transactions = [];
    let debtor = 0, creditor = 0;
    while (true) {
      while (debtor < debt.length && debt[debtor] >= 0) debtor++;
      while (creditor < debt.length && debt[creditor] <= 0) creditor++;
      if (debtor >= debt.length || creditor >= debt.length) break;
      if (options.signal?.aborted) return result("cancelled", transactions, false, start, nodesVisited);
      const amount = Math.min(-debt[debtor], debt[creditor]);
      if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("無法產生合法交易。");
      transactions.push({ from: debtor, to: creditor, amount });
      debt[debtor] += amount; debt[creditor] -= amount; nodesVisited++;
      if (debt[debtor] === 0) debtor++;
      if (debt[creditor] === 0) creditor++;
    }
    return result("success", transactions, false, start, nodesVisited);
  } catch (error) { return result("error", [], false, start, nodesVisited, error.message); }
}
