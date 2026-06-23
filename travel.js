const container = document.getElementById("cardContainer");
const status = document.getElementById("status");

const urlInput = document.getElementById("urlInput");
const loadUrlBtn = document.getElementById("loadUrlBtn");

// ===== STATE（重點：不要放 function 裡）=====
let rawData = [];
let activeRegion = "all";
let activeType = "all";

// ===== EVENTS =====
loadUrlBtn.addEventListener("click", loadFromUrl);

// MARK: ===== LOAD DATA =====
function normalizeGoogleSheetUrl(inputUrl) {
  const match = inputUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);

  if (!match) return null;

  const sheetId = match[1];

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
}

async function loadFromUrl() {
  const rawUrl = urlInput.value.trim();
  const url = normalizeGoogleSheetUrl(rawUrl) || rawUrl;

  if (!url) {
    status.textContent = "URL 無效";
    return;
  }

  status.textContent = "載入中...";

  try {
    const res = await fetch(url);
    const text = await res.text();

    rawData = parseCSV(text);

    const filters = extractFilters(rawData);
    renderFilters(filters);
    applyFilter();

    status.textContent = `完成載入 ${rawData.length} 筆`;
  } catch (e) {
    console.error(e);
    status.textContent = "載入失敗";
  }
}

// ===== CSV PARSER =====
function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map(line => {
      const p = line.split(",");
      return {
        name: p[0] || "",
        area: p[1] || "",
        type: p[2] || "",
        link: p[3] || "",
        note: p[4] || ""
      };
    });
}

// ===== FILTER EXTRACT =====
function extractFilters(data) {
  const regions = new Set();
  const types = new Set();

  data.forEach(item => {
    if (item.area) regions.add(item.area.trim());
    if (item.type) types.add(item.type.trim());
  });

  return {
    regions: [...regions],
    types: [...types]
  };
}

// ===== RENDER FILTER UI =====
function renderFilters(filters) {
  let bar = document.getElementById("filterBar");

  if (!bar) {
    bar = document.createElement("div");
    bar.id = "filterBar";
    bar.className = "filter-bar";
    document.querySelector(".header").appendChild(bar);
  }

  bar.innerHTML = "";

  // ALL button
  const all = document.createElement("div");
  all.className = "chip";
  all.textContent = "全部";

  all.onclick = () => {
    activeRegion = "all";
    activeType = "all";
    applyFilter();
  };

  bar.appendChild(all);

  // REGION chips
  filters.regions.forEach(r => {
    const el = document.createElement("div");
    el.className = "chip";
    el.textContent = r;

    el.onclick = () => {
      activeRegion = r;
      applyFilter();
    };

    bar.appendChild(el);
  });

  // TYPE chips (dynamic)
  filters.types.forEach(t => {
    const el = document.createElement("div");
    el.className = "chip";
    el.textContent = t;

    el.onclick = () => {
      activeType = t;
      applyFilter();
    };

    bar.appendChild(el);
  });
}

// ===== FILTER PIPELINE =====
function applyFilter() {
  let data = rawData;

  if (activeRegion !== "all") {
    data = data.filter(i => i.area === activeRegion);
  }

  if (activeType !== "all") {
    data = data.filter(i => i.type === activeType);
  }

  render(data);
}

// ===== RENDER =====
function render(data) {
  container.innerHTML = "";

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="title">${escapeHtml(item.name)}</div>

      <div class="meta">
        <span>${escapeHtml(item.area)}</span>
        <span class="tag">${escapeHtml(item.type || "未分類")}</span>
      </div>

      <div class="desc">${escapeHtml(item.note)}</div>

      ${item.link ? `<a href="${item.link}" target="_blank">開啟連結 →</a>` : ""}
    `;

    container.appendChild(card);
  });
}

// ===== SECURITY =====
function escapeHtml(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}