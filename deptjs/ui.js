import { LIMITS } from "./state.js";
import { formatMoney } from "./validation.js";

export function showStep(step) {
  document.querySelectorAll("[data-section]").forEach(section => { section.hidden = Number(section.dataset.section) !== step; });
  document.querySelectorAll("[data-step-indicator]").forEach(indicator => indicator.classList.toggle("active", Number(indicator.dataset.stepIndicator) <= step));
}

export function showMessage(message, type = "error") {
  const element = document.querySelector("#global-message");
  element.textContent = message;
  element.className = `message ${type}`;
  element.hidden = !message;
}

export function renderPeopleFields(people) {
  document.querySelector("#people-fields").replaceChildren(...people.map((person, index) => {
    const label = document.createElement("label");
    label.textContent = `第 ${index + 1} 位名稱`;
    const input = document.createElement("input");
    input.value = person.name;
    input.dataset.personId = person.id;
    input.required = true;
    input.maxLength = LIMITS.maxNameLength;
    label.append(input);
    return label;
  }));
}

export function renderPersonOptions(people) {
  ["#debt-from", "#debt-to", "#split-payer"].forEach(selector => {
    const select = document.querySelector(selector);
    if (!select) return;
    select.replaceChildren();
    people.forEach(person => {
      const option = document.createElement("option");
      option.value = String(person.id);
      option.textContent = person.name;
      select.append(option);
    });
  });
}

export function renderSplitControls(people, splitExpense = { payerId: null, selectedIds: [], total: "" }, onToggle, onSelectAll) {
  const payers = document.querySelector("#split-payer");
  const selectAll = document.querySelector("#split-select-all");
  const participants = document.querySelector("#split-participants");
  const total = document.querySelector("#split-total");
  const summary = document.querySelector("#split-summary");

  if (payers) {
    payers.replaceChildren();
    if (people.length) {
      people.forEach(person => {
        const option = document.createElement("option");
        option.value = String(person.id);
        option.textContent = person.name;
        if (String(splitExpense.payerId) === String(person.id)) option.selected = true;
        payers.append(option);
      });
      payers.disabled = false;
    } else {
      payers.disabled = true;
    }
  }

  if (total) total.value = splitExpense.total ?? "";

  if (participants) {
    participants.replaceChildren();
    if (!people.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "請先設定人員。";
      participants.append(empty);
    } else {
      const selectedSet = new Set((splitExpense.selectedIds || []).map(value => Number(value)));
      people.forEach(person => {
        const label = document.createElement("label");
        label.className = "participant-option";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = String(person.id);
        input.checked = selectedSet.has(person.id);
        input.setAttribute("aria-label", `${person.name} 參與分攤`);
        input.addEventListener("change", event => onToggle(person.id, event.target.checked));
        const text = document.createElement("span");
        text.textContent = person.name;
        label.append(input, text);
        participants.append(label);
      });
    }
  }

  if (selectAll) {
    const selectedSet = new Set((splitExpense.selectedIds || []).map(value => Number(value)));
    const allSelected = people.length > 0 && selectedSet.size === people.length;
    selectAll.checked = allSelected;
    selectAll.indeterminate = selectedSet.size > 0 && !allSelected;
    selectAll.onchange = event => onSelectAll(event.target.checked);
  }

  if (summary) {
    summary.hidden = true;
    summary.replaceChildren();
  }
}

export function renderDebts(debts, people, onDelete) {
  const list = document.querySelector("#debt-list");
  list.replaceChildren();
  if (!debts.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "尚未新增債務。";
    list.append(empty);
    return;
  }
  debts.forEach((debt, index) => {
    const item = document.createElement("div");
    item.className = "debt-item";
    const text = document.createElement("span");
    text.textContent = `${people[debt.from]?.name ?? `#${debt.from}`} → ${people[debt.to]?.name ?? `#${debt.to}`}`;
    const amount = document.createElement("span");
    amount.className = "amount";
    amount.textContent = formatMoney(debt.amount);
    const button = document.createElement("button");
    button.className = "delete-debt";
    button.type = "button";
    button.textContent = "刪除";
    button.addEventListener("click", () => onDelete(index));
    item.append(text, amount, button);
    list.append(item);
  });
}

function renderOneResult(result, people, algorithmName) {
  const card = document.createElement("article");
  card.className = `result-card ${result.status}`;
  const heading = document.createElement("h3");
  heading.textContent = `${algorithmName}：${result.status === "success" ? "結算完成" : result.status === "timeout" ? "⚠️ 計算時間超過限制" : result.status === "cancelled" ? "已取消" : "計算錯誤"}`;
  card.append(heading);
  if (result.status === "timeout") {
    const notice = document.createElement("p");
    notice.className = "muted";
    notice.textContent = `目前找到 ${result.transactionCount} 筆交易；無法保證這是最優解。`;
    card.append(notice);
  }
  const stats = document.createElement("div");
  stats.className = "stats";
  [["交易筆數", result.transactionCount], ["計算時間", `${result.stats.elapsedMs} ms`], ["搜尋節點", result.stats.nodesVisited], ["結果", result.optimal ? "✓ 保證最少交易" : "快速解／無法保證最優"]].forEach(([label, value]) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    const small = document.createElement("small");
    small.textContent = label;
    const strong = document.createElement("strong");
    strong.textContent = value;
    stat.append(small, strong);
    stats.append(stat);
  });
  card.append(stats);
  if (result.error) {
    const error = document.createElement("p");
    error.className = "muted";
    error.textContent = result.error;
    card.append(error);
  }
  const list = document.createElement("div");
  list.className = "transaction-list";
  if (!result.transactions.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "不需要轉帳。";
    list.append(empty);
  }
  result.transactions.forEach(transaction => {
    const row = document.createElement("div");
    row.className = "transaction-card";
    const route = document.createElement("span");
    route.textContent = `${people[transaction.from]?.name ?? `#${transaction.from}`} → ${people[transaction.to]?.name ?? `#${transaction.to}`}`;
    const amount = document.createElement("span");
    amount.className = "amount";
    amount.textContent = formatMoney(transaction.amount);
    row.append(route, amount);
    list.append(row);
  });
  card.append(list);
  return card;
}

export function renderResults(results, people) {
  const container = document.querySelector("#results");
  container.replaceChildren();
  results.forEach(({ result, name }) => container.append(renderOneResult(result, people, name)));
  if (results.length > 1) {
    const summary = document.createElement("p");
    summary.className = "message";
    const greedy = results.find(item => item.name === "Greedy")?.result;
    const dfs = results.find(item => item.name === "DFS")?.result;
    if (greedy && dfs && dfs.status === "success" && dfs.optimal) {
      const difference = greedy.transactionCount - dfs.transactionCount;
      summary.textContent = difference > 0 ? `DFS 少 ${difference} 筆交易（DFS 保證最優；Greedy 不保證最優）。`
        : "兩種演算法交易筆數相同（DFS 保證最優；Greedy 不保證最優）。";
    } else summary.textContent = "比較結果僅供參考；DFS 未完成時無法保證最優。";
    container.prepend(summary);
  }
}

export function setCalculating(calculating) {
  document.querySelector("#calculate").disabled = calculating;
  document.querySelector("#cancel").hidden = !calculating;
  document.querySelector("#progress").hidden = !calculating;
}

export function updateProgress(nodes) {
  const progress = document.querySelector("#progress");
  progress.textContent = `正在搜尋最佳解⋯ 已檢查 ${nodes.toLocaleString()} 個搜尋節點`;
}
