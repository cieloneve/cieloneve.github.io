import { LIMITS, state, setPeople } from "./state.js";
import { calculateBalances, verifyTransactions } from "./algorithms/utils.js";
import { getAlgorithm } from "./algorithms/index.js";
import { parseAmount, validateAll, validateDebt, validatePeople, parseBatch, generateSplitDebts, formatMoney } from "./validation.js";
import { showStep, showMessage, renderPeopleFields, renderPersonOptions, renderSplitControls, renderDebts, renderResults, setCalculating, updateProgress } from "./ui.js";

let currentWorker = null, workerResolve = null, cancelled = false;
const $ = selector => document.querySelector(selector);

function createNames(count) {
  return Array.from({ length: count }, (_, index) => index < 26 ? String.fromCharCode(65 + index) : `P${index + 1}`);
}

function setStep(step) {
  state.currentStep = step;
  showStep(step);
  showMessage("");
}

function readPeopleFields() {
  return [...document.querySelectorAll("#people-fields input")].map(input => ({ id: Number(input.dataset.personId), name: input.value.trim() }));
}

function randomDebts(count) {
  const debts = [], used = new Set();
  for (let i = 0; i < count; i++) {
    let from, to, key, attempts = 0;
    do {
      from = Math.floor(Math.random() * state.people.length);
      to = Math.floor(Math.random() * state.people.length);
      key = `${from}-${to}`;
      attempts++;
    } while ((from === to || used.has(key)) && attempts < 100);
    if (from === to || used.has(key)) continue;
    used.add(key);
    debts.push({ from, to, amount: Math.floor(Math.random() * 500000) + 1 });
  }
  return debts;
}

function deleteDebt(index) {
  state.debts.splice(index, 1);
  renderDebts(state.debts, state.people, deleteDebt);
}

function settingsFromInputs() {
  const timeoutMs = Math.min(LIMITS.maxTimeoutMs, Math.max(1, Number($("#timeout-ms").value) || LIMITS.defaultTimeoutMs));
  const maxNodes = Math.min(LIMITS.maxNodes, Math.max(1, Number($("#max-nodes").value) || LIMITS.maxNodes));
  state.settings = { timeoutMs, maxNodes };
  return state.settings;
}

function renderSplitPanel() {
  const summary = document.querySelector("#split-summary");
  const text = summary && !summary.hidden ? summary.textContent : "";
  renderPersonOptions(state.people);
  renderSplitControls(state.people, state.splitExpense, (personId, checked) => {
    const selected = new Set(state.splitExpense.selectedIds.map(value => Number(value)));
    if (checked) selected.add(Number(personId)); else selected.delete(Number(personId));
    state.splitExpense.selectedIds = [...selected];
    if (state.splitExpense.payerId === Number(personId) && !checked) {
      state.splitExpense.selectedIds = [...new Set([...state.splitExpense.selectedIds, Number(personId)])];
      showMessage("付款人必須為選中的參與者之一。", "error");
    }
    if (state.splitExpense.selectedIds.length < 2) {
      showMessage("請至少選擇兩位參與分攤的成員。", "error");
    }
    renderSplitPanel();
  }, checked => {
    const selected = checked ? state.people.map(person => person.id) : [];
    state.splitExpense.selectedIds = selected;
    if (state.splitExpense.payerId != null && !selected.includes(state.splitExpense.payerId)) {
      state.splitExpense.selectedIds = [...new Set([...selected, state.splitExpense.payerId])];
    }
    renderSplitPanel();
  });
  if (summary && text) {
    summary.textContent = text;
    summary.hidden = false;
  }
}

function runWorker(balances) {
  cancelled = false;
  return new Promise(resolve => {
    workerResolve = resolve;
    currentWorker = new Worker("./js/worker.js", { type: "module" });
    state.worker = currentWorker;
    currentWorker.onmessage = event => {
      if (event.data.type === "progress") updateProgress(event.data.nodesVisited);
      if (event.data.type === "result") {
        currentWorker.terminate();
        currentWorker = null;
        state.worker = null;
        workerResolve = null;
        resolve(event.data.result);
      }
    };
    currentWorker.onerror = event => {
      currentWorker?.terminate();
      currentWorker = null;
      state.worker = null;
      workerResolve = null;
      resolve({ status: "error", transactions: [], transactionCount: 0, optimal: false, stats: { elapsedMs: 0, nodesVisited: 0 }, error: event.message || "Worker 執行失敗。" });
    };
    currentWorker.postMessage({ type: "solve", balances, options: state.settings });
  });
}

async function calculate() {
  const validation = validateAll(state.people, state.debts);
  if (!validation.valid) {
    showMessage(validation.errors.join(" "));
    return;
  }
  let balances;
  try {
    balances = calculateBalances(state.people.length, state.debts);
  } catch (error) {
    showMessage(error.message);
    return;
  }
  settingsFromInputs();
  cancelled = false;
  setCalculating(true);
  showMessage("");
  $("#results").replaceChildren();
  const compare = $("#compare-algorithms").checked, selected = state.selectedAlgorithm;
  try {
    const outputs = [];
    if (compare || selected === "greedy") outputs.push({ result: getAlgorithm("greedy").solve(balances), name: "Greedy" });
    if (compare || selected === "dfs") outputs.push({ result: await runWorker(balances), name: "DFS" });
    outputs.forEach(output => {
      if (["success", "timeout"].includes(output.result.status) && !verifyTransactions(balances, output.result.transactions)) {
        output.result = {
          status: "error",
          transactions: [],
          transactionCount: 0,
          optimal: false,
          stats: output.result.stats,
          error: "演算法產生了無法結清餘額的交易。"
        };
      }
    });
    if (cancelled) outputs.splice(0, outputs.length, { result: { status: "cancelled", transactions: [], transactionCount: 0, optimal: false, stats: { elapsedMs: 0, nodesVisited: 0 } }, name: selected.toUpperCase() });
    state.result = outputs;
    renderResults(outputs, state.people);
    const hasError = outputs.some(output => output.result.status === "error");
    showMessage(cancelled ? "已取消計算。" : hasError ? "計算發生錯誤。" : "計算完成。", hasError ? "error" : "success");
  } catch (error) {
    showMessage(`計算失敗：${error.message}`);
  } finally {
    setCalculating(false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showStep(1);
  $("#people-count-form").addEventListener("submit", event => {
    event.preventDefault();
    const count = Number($("#people-count").value);
    if (!Number.isInteger(count) || count < LIMITS.minPeople || count > LIMITS.maxPeople) {
      showMessage(`人數必須介於 ${LIMITS.minPeople} 至 ${LIMITS.maxPeople} 人。`);
      return;
    }
    const people = createNames(count);
    const check = validatePeople(people.map((name, id) => ({ id, name })));
    if (!check.valid) {
      showMessage(check.errors.join(" "));
      return;
    }
    setPeople(people);
    renderPeopleFields(state.people);
    renderSplitPanel();
    setStep(2);
  });

  $("#people-form").addEventListener("submit", event => {
    event.preventDefault();
    const people = readPeopleFields();
    const check = validatePeople(people);
    if (!check.valid) {
      showMessage(check.errors.join(" "));
      return;
    }
    state.people = people;
    state.splitExpense = {
      payerId: state.people[0]?.id ?? null,
      selectedIds: state.people.map(person => person.id),
      total: ""
    };
    renderPersonOptions(state.people);
    renderDebts(state.debts, state.people, deleteDebt);
    renderSplitPanel();
    setStep(3);
  });

  $("#debt-form").addEventListener("submit", event => {
    event.preventDefault();
    const debt = { from: Number($("#debt-from").value), to: Number($("#debt-to").value), amount: $("#debt-amount").value };
    const parsed = parseAmount(debt.amount);
    if (parsed.valid) debt.amount = parsed.amount;
    const check = validateDebt(debt, state.people);
    if (!check.valid) {
      showMessage(check.errors.join(" "));
      return;
    }
    state.debts.push(debt);
    $("#debt-amount").value = "";
    renderDebts(state.debts, state.people, deleteDebt);
    showMessage("已新增債務。", "success");
  });

  $("#batch-add").addEventListener("click", () => {
    const parsed = parseBatch($("#batch-input").value, state.people);
    if (parsed.errors.length) {
      showMessage(parsed.errors.join(" "));
      return;
    }
    state.debts.push(...parsed.debts);
    $("#batch-input").value = "";
    renderDebts(state.debts, state.people, deleteDebt);
    showMessage(`已匯入 ${parsed.debts.length} 筆債務。`, "success");
  });

  $("#random-data").addEventListener("click", () => {
    const count = Math.min(LIMITS.maxRandomDebts, Math.max(1, Number($("#random-debt-count").value) || 1));
    state.debts = randomDebts(count);
    renderDebts(state.debts, state.people, deleteDebt);
    showMessage(`已產生 ${state.debts.length} 筆測試資料。`, "success");
  });

  $("#split-total").addEventListener("input", event => {
    state.splitExpense.total = event.target.value;
  });

  $("#split-payer").addEventListener("change", event => {
    state.splitExpense.payerId = Number(event.target.value);
    if (!state.splitExpense.selectedIds.includes(state.splitExpense.payerId)) {
      state.splitExpense.selectedIds = [...new Set([...state.splitExpense.selectedIds, state.splitExpense.payerId])];
    }
    renderSplitPanel();
  });

  $("#split-select-all").addEventListener("change", event => {
    const checked = event.target.checked;
    const selected = checked ? state.people.map(person => person.id) : [];
    state.splitExpense.selectedIds = selected;
    if (state.splitExpense.payerId != null && !selected.includes(state.splitExpense.payerId)) {
      state.splitExpense.selectedIds = [...new Set([...selected, state.splitExpense.payerId])];
    }
    renderSplitPanel();
  });

  $("#split-generate").addEventListener("click", () => {
    const generated = generateSplitDebts({
      people: state.people,
      total: state.splitExpense.total,
      payerId: state.splitExpense.payerId,
      selectedIds: state.splitExpense.selectedIds
    });
    if (!generated.valid) {
      showMessage(generated.errors.join(" "));
      return;
    }
    state.debts.push(...generated.debts);
    renderDebts(state.debts, state.people, deleteDebt);
    const summary = $("#split-summary");
    summary.replaceChildren();
    const text = document.createElement("p");
    const detail = generated.notice || `每位參與者分攤 ${formatMoney(generated.perPersonShare)}，付款人吸收 ${formatMoney(generated.remainder)}。`;
    text.textContent = detail;
    summary.append(text);
    summary.hidden = false;
    state.splitExpense.total = "";
    $("#split-total").value = "";
    showMessage(`已附加 ${generated.debts.length} 筆債務。${generated.notice ? ` ${generated.notice}` : ""}`, "success");
    renderSplitPanel();
  });

  $("#to-calculate").addEventListener("click", () => {
    if (!state.debts.length) {
      showMessage("請至少新增一筆債務。");
      return;
    }
    setStep(4);
  });

  document.querySelectorAll("[data-back]").forEach(button =>
    button.addEventListener("click", () => setStep(Number(button.dataset.back))));

  document.querySelectorAll("input[name=algorithm]").forEach(input => input.addEventListener("change", event => {
    state.selectedAlgorithm = event.target.value;
  }));

  $("#calculate").addEventListener("click", calculate);
  $("#cancel").addEventListener("click", () => {
    cancelled = true;
    currentWorker?.terminate();
    currentWorker = null;
    state.worker = null;
    const cancelledResult = { status: "cancelled", transactions: [], transactionCount: 0, optimal: false, stats: { elapsedMs: 0, nodesVisited: 0 } };
    workerResolve?.(cancelledResult);
    workerResolve = null;
    setCalculating(false);
    renderResults([{ result: cancelledResult, name: "DFS" }], state.people);
    showMessage("已取消計算。", "success");
  });
});