import { LIMITS } from "./state.js";

export function formatMoney(amount) {
  const raw = Number(amount ?? 0);
  if (!Number.isFinite(raw)) return "NT$ 0.00";
  const cents = Number.isInteger(raw) ? raw : Math.round(raw * LIMITS.scale);
  if (!Number.isSafeInteger(cents)) return "NT$ 0.00";
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / LIMITS.scale);
  const centPart = absolute % LIMITS.scale;
  const integerFormatter = new Intl.NumberFormat("zh-TW", { useGrouping: true });
  return `${sign}NT$ ${integerFormatter.format(dollars)}.${String(centPart).padStart(2, "0")}`;
}

export function parseAmount(value) {
  const text = String(value ?? "").trim();
  if (!text) return { valid: false, error: "金額不可空白。" };
  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    return { valid: false, error: "金額必須是正數，最多兩位小數，且不得含負號、空白或其他文字。" };
  }
  const numeric = Number(text);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return { valid: false, error: "金額必須大於 0。" };
  }
  const [wholePart, fractionPart = ""] = text.split(".");
  const cents = Number(wholePart) * LIMITS.scale + Number((fractionPart + "00").slice(0, 2));
  if (!Number.isSafeInteger(cents)) {
    return { valid: false, error: "金額超過 JavaScript 安全整數範圍。" };
  }
  if (cents < LIMITS.minAmount) {
    return { valid: false, error: `金額至少為 ${formatMoney(LIMITS.minAmount)}。` };
  }
  if (cents > LIMITS.maxAmount) {
    return { valid: false, error: `金額不可超過 ${formatMoney(LIMITS.maxAmount)}。` };
  }
  return { valid: true, amount: cents };
}

export function validateAmount(value) {
  return parseAmount(value);
}

export function coerceCentAmount(value) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  const parsed = parseAmount(value);
  if (!parsed.valid) throw new Error(parsed.error);
  return parsed.amount;
}

export function validatePeople(people) {
  const errors = [];
  if (!Array.isArray(people) || people.length < LIMITS.minPeople || people.length > LIMITS.maxPeople) {
    errors.push(`人數必須介於 ${LIMITS.minPeople} 至 ${LIMITS.maxPeople} 人。`);
  }
  const names = new Set(), ids = new Set();
  (people || []).forEach((person, index) => {
    const name = String(person?.name ?? "").trim();
    if (!Number.isInteger(person?.id) || ids.has(person.id)) errors.push(`第 ${index + 1} 位人員 ID 無效或重複。`);
    ids.add(person?.id);
    if (!name) errors.push(`第 ${index + 1} 位人員名稱不可空白。`);
    if (name.length > LIMITS.maxNameLength) errors.push(`第 ${index + 1} 位人員名稱過長。`);
    if (names.has(name)) errors.push(`人員名稱「${name}」重複。`);
    names.add(name);
  });
  return { valid: errors.length === 0, errors };
}

export function validateDebt(debt, people) {
  const errors = [];
  const ids = new Set((people || []).map(person => person.id));
  if (!Number.isInteger(debt?.from) || !ids.has(debt.from)) errors.push("付款人不存在。");
  if (!Number.isInteger(debt?.to) || !ids.has(debt.to)) errors.push("收款人不存在。");
  if (debt?.from === debt?.to) errors.push("不能建立自己對自己的債務。");
  const amount = typeof debt?.amount === "number" && Number.isInteger(debt.amount)
    ? { valid: true, amount: debt.amount }
    : parseAmount(debt?.amount);
  if (!amount.valid) errors.push(amount.error);
  return { valid: errors.length === 0, errors };
}

export function validateAll(people, debts) {
  const peopleResult = validatePeople(people);
  const errors = [...peopleResult.errors];
  if (!Array.isArray(debts) || debts.length === 0) errors.push("請至少新增一筆債務。");
  (debts || []).forEach((debt, index) => {
    const result = validateDebt(debt, people);
    result.errors.forEach(error => errors.push(`第 ${index + 1} 筆債務：${error}`));
  });
  return { valid: errors.length === 0, errors };
}

export function parseBatch(text, people) {
  const byName = new Map((people || []).map(person => [person.name, person.id]));
  const debts = [], errors = [];
  String(text ?? "").split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) return;
    const parts = line.trim().split(/\s+/);
    if (parts.length !== 3) { errors.push(`第 ${index + 1} 行格式錯誤，應為：付款人 收款人 金額。`); return; }
    const [fromName, toName, amountText] = parts;
    if (!byName.has(fromName) || !byName.has(toName)) { errors.push(`第 ${index + 1} 行：找不到指定人員。`); return; }
    const amount = parseAmount(amountText);
    if (!amount.valid) { errors.push(`第 ${index + 1} 行：${amount.error}`); return; }
    const debt = { from: byName.get(fromName), to: byName.get(toName), amount: amount.amount };
    const result = validateDebt(debt, people);
    if (!result.valid) errors.push(`第 ${index + 1} 行：${result.errors.join(" ")}`); else debts.push(debt);
  });
  return { debts, errors };
}

export function generateSplitDebts({ people, total, payerId, selectedIds }) {
  const validPeople = Array.isArray(people) ? people : [];
  const idSet = new Set(validPeople.map(person => person.id));
  const normalizedPayerId = Number(payerId);
  const normalizedSelectedIds = [...new Set((selectedIds || []).map(value => Number(value)).filter(id => Number.isInteger(id) && idSet.has(id)))];

  if (!Number.isInteger(normalizedPayerId) || !idSet.has(normalizedPayerId)) {
    return { valid: false, errors: ["付款人不存在。"], debts: [], notice: "", payerShare: 0, perPersonShare: 0, remainder: 0 };
  }
  if (normalizedSelectedIds.length < 2) {
    return { valid: false, errors: ["請至少選擇兩位參與分攤的成員。"], debts: [], notice: "", payerShare: 0, perPersonShare: 0, remainder: 0 };
  }
  if (!normalizedSelectedIds.includes(normalizedPayerId)) {
    return { valid: false, errors: ["付款人必須為選中的參與者之一。"], debts: [], notice: "", payerShare: 0, perPersonShare: 0, remainder: 0 };
  }

  const totalAmount = parseAmount(total);
  if (!totalAmount.valid) {
    return { valid: false, errors: [totalAmount.error], debts: [], notice: "", payerShare: 0, perPersonShare: 0, remainder: 0 };
  }

  const orderedParticipants = validPeople.filter(person => normalizedSelectedIds.includes(person.id)).map(person => person.id);
  const share = Math.floor(totalAmount.amount / orderedParticipants.length);
  const remainder = totalAmount.amount % orderedParticipants.length;
  const payerShare = share + remainder;
  const payerName = validPeople.find(person => person.id === normalizedPayerId)?.name ?? `#${normalizedPayerId}`;
  const debts = orderedParticipants
    .filter(personId => personId !== normalizedPayerId)
    .map(personId => ({ from: personId, to: normalizedPayerId, amount: share }));

  const notice = remainder === 0
    ? ""
    : `付款人 ${payerName} 吸收 ${formatMoney(remainder)} 的剩餘金額；每位參與者平均分攤 ${formatMoney(share)}，付款人額外負擔 ${formatMoney(remainder)}。`;

  return {
    valid: true,
    errors: [],
    debts,
    notice,
    payerShare,
    perPersonShare: share,
    remainder,
    totalAmount: totalAmount.amount
  };
}

export const splitExpense = generateSplitDebts;
export const createSplitExpense = generateSplitDebts;