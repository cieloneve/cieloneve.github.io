import { coerceCentAmount } from "../validation.js";

export function calculateBalances(peopleCount, debts) {
  const balances = Array(peopleCount).fill(0);
  for (const debt of debts) {
    const amount = coerceCentAmount(debt.amount);
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("金額不是安全整數。");
    balances[debt.from] -= amount;
    balances[debt.to] += amount;
    if (!balances.every(Number.isSafeInteger)) throw new Error("餘額超過安全整數範圍。");
  }
  if (balances.reduce((sum, value) => sum + value, 0) !== 0) throw new Error("資料錯誤，無法進行結算。");
  return balances;
}

export function elapsed(start) {
  return Number((performance.now() - start).toFixed(2));
}

export function result(status, transactions, optimal, start, nodesVisited, error) {
  const output = { status, transactions: transactions || [], transactionCount: (transactions || []).length,
    optimal: Boolean(optimal), stats: { elapsedMs: elapsed(start), nodesVisited } };
  if (error) output.error = error;
  return output;
}

export function verifyTransactions(balances, transactions) {
  const remaining = balances.slice();
  for (const transaction of transactions) {
    const from = Number(transaction.from), to = Number(transaction.to), amount = coerceCentAmount(transaction.amount);
    if (!Number.isInteger(from) || !Number.isInteger(to) || from === to || !Number.isSafeInteger(amount) || amount <= 0) return false;
    remaining[from] += amount;
    remaining[to] -= amount;
  }
  return remaining.every(value => value === 0);
}
