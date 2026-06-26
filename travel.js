const container = document.getElementById("cardContainer");
const status = document.getElementById("status");

const urlInput = document.getElementById("urlInput");
const loadUrlBtn = document.getElementById("loadUrlBtn");

const params = new URLSearchParams(location.search);
const sheetUrl = params.get("sheet");

if (sheetUrl) {
  urlInput.value = sheetUrl;
  loadFromUrl();
}
// ===== STATE（重點：不要放 function 裡）=====
let rawData = [];
let activeRegion = "all";
let activeMain = "all";   // ⭐ 新增
let activeSub = "all";    // ⭐ 新增
let activeType = "all";
let locationTree;
let GAS_URL = null;
let userId = getUserId();

// ===== USERS =====

function getUserId() {
  let id = localStorage.getItem("travel_user_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("travel_user_id", id);
  }

  return id;
}

async function sendLike(link) {

  if (!GAS_URL) {
    alert("找不到 GAS_URL");
    return null;
  }

  const res = await fetch(GAS_URL, {
    redirect: "follow",
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      link,
      user_id: userId
    })
  });

  return await res.json();
}

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
    
    
    locationTree = filters.regions;

    renderFilters(filters);
    renderSubFilters([]);

    applyFilter();

    status.textContent = `完成載入 ${rawData.length} 筆`;
  } catch (e) {
    console.error(e);
    status.textContent = "載入失敗";
  }
}

// ===== CSV PARSER =====
// ===== CSV PARSER =====
function parseCSV(text) {

  const result = Papa.parse(text.trim(), {
    skipEmptyLines: true
  });

  const data = [];

  result.data.forEach(p => {

    // ======================
    // GAS CONFIG ROW
    // ======================
    if (
      p[0] === "GAS_URL" &&
      p[1] === "GAS_URL" &&
      p[2] === "GAS_URL"
    ) {
      GAS_URL = p[3];
      return;
    }

    data.push({
      name: p[0] || "",
      area: p[1] || "",
      type: p[2] || "",
      link: p[3] || "",
      note: p[4] || "",
      likes: Number(p[5] || 0),
      likedBy: safeParse(p[6])
    });

  });

  return data;
}

function safeParse(v) {
  try {
    if (!v) return [];
    return JSON.parse(v);
  } catch {
    return [];
  }
}

function parseArea(areaStr) {
  if (!areaStr) return { main: "待確認", sub: [] };

  if (!areaStr.includes("：")) {
    return { main: areaStr.trim(), sub: [] };
  }

  const [main, sub] = areaStr.split("：");

  return {
    main: main.trim(),
    sub: sub
      ? sub.split("・").map(s => s.trim()).filter(Boolean)
      : []
  };
}

function buildLocationTree(data) {
  const tree = {};

  data.forEach(item => {
    const parsed = parseArea(item.area);

    if (!tree[parsed.main]) {
      tree[parsed.main] = new Set();
    }

    parsed.sub.forEach(s => tree[parsed.main].add(s));
  });

  return tree;
}

// ===== FILTER EXTRACT =====
function extractFilters(data) {
  const regions = {};
  const types = new Set();

  data.forEach(item => {
    const parsed = parseArea(item.area);

    if (!regions[parsed.main]) {
      regions[parsed.main] = new Set();
    }

    parsed.sub.forEach(s => regions[parsed.main].add(s));

    if (item.type) types.add(item.type.trim());
  });

  return {
    regions,
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

  // ===== ALL =====
  const all = document.createElement("div");
  all.className = "chip";
  all.textContent = "全部";

  all.onclick = () => {
    activeMain = "all";
    activeSub = "all";
    activeType = "all";

    renderSubFilters([]);
    applyFilter();
  };

  bar.appendChild(all);

  // ===== MAIN (大阪/京都) =====
  Object.keys(filters.regions).forEach(main => {
    const el = document.createElement("div");
    el.className = "chip";
    el.textContent = main;

    el.onclick = () => {
      activeMain = main;
      activeSub = "all";

      renderSubFilters([...filters.regions[main]]);
      applyFilter();
    };

    bar.appendChild(el);
  });

  // ===== TYPE (保留你的動態) =====
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

function renderSubFilters(subList) {
  let bar = document.getElementById("subFilterBar");

  if (!bar) {
    bar = document.createElement("div");
    bar.id = "subFilterBar";
    bar.className = "filter-bar sub";
    document.querySelector(".header").appendChild(bar);
  }

  bar.innerHTML = "";

  if (!subList.length) return;

  const all = document.createElement("div");
  all.className = "chip";
  all.textContent = "全部";

  all.onclick = () => {
    activeSub = "all";
    applyFilter();
  };

  bar.appendChild(all);

  subList.forEach(sub => {
    const el = document.createElement("div");
    el.className = "chip";
    el.textContent = sub;

    el.onclick = () => {
      activeSub = sub;
      applyFilter();
    };

    bar.appendChild(el);
  });
}
// ===== FILTER PIPELINE =====
function applyFilter() {
  let data = rawData;

  if (activeMain !== "all") {
    data = data.filter(i => parseArea(i.area).main === activeMain);
  }

  if (activeSub !== "all") {
    data = data.filter(i =>
      parseArea(i.area).sub.includes(activeSub)
    );
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

      <button class="like-pill">
        ❤️ <span class="like-count">${item.likes || 0}</span>
      </button>
    `;
    const btn = card.querySelector(".like-pill");
    const countEl = card.querySelector(".like-count");

    if (btn) {

      btn.addEventListener("click", async () => {

        // ===== CLIENT CHECK =====
        if (item.likedBy.includes(userId)) {
          return;
        }

        // ===== OPTIMISTIC UPDATE =====

        item.likes++;
        item.likedBy.push(userId);

        applyFilter();

        try {

          await sendLike(item.link);

        } catch (err) {

          console.error(err);

          // ===== ROLLBACK =====

          item.likes--;

          item.likedBy = item.likedBy.filter(
            id => id !== userId
          );

          applyFilter();

          alert("按讚失敗");
        }

      });

    }
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