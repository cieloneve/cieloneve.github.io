const container = document.getElementById("cardContainer");
const status = document.getElementById("status");
const urlInput = document.getElementById("urlInput");
const loadUrlBtn = document.getElementById("loadUrlBtn");

// 修正 P0-1: 排序按鈕改為靜態或動態單一建立
let sortBtn = document.getElementById("sortBtn"); 

const params = new URLSearchParams(location.search);
const sheetUrl = params.get("sheet");

if (sheetUrl) {
  urlInput.value = sheetUrl;
  loadFromUrl();
}

// ===== STATE =====
let rawData = [];
let activeMain = "all";   
let activeSub = "all";    
let activeType = "all";
let locationTree;
let GAS_URL = null;
let userId = getUserId();
let sortMode = "default"; 

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
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ link, user_id: userId })
  });
  return await res.json();
}

// ===== EVENTS =====
loadUrlBtn.addEventListener("click", loadFromUrl);

// ===== LOAD DATA =====
function normalizeGoogleSheetUrl(inputUrl) {
  const match = inputUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return null;
  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
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

    rawData = parseCSV(text); // 此處已優化：已包含 parsedArea

    const filters = extractFilters(rawData);
    locationTree = filters.regions;

    renderFilters(filters);
    renderSubFilters([]);
    applyFilter();

    status.textContent = `完成載入 ${rawData.length} 筆`;
    
    // 修正 P0-1: 確保排序按鈕唯一性
    if (!sortBtn) {
      sortBtn = document.createElement("button");
      sortBtn.id = "sortBtn";
      sortBtn.className = "chip";
      sortBtn.textContent = "🔀 預設排序";
      sortBtn.onclick = () => {
        sortMode = sortMode === "default" ? "likes" : "default";
        sortBtn.textContent = sortMode === "default" ? "🔀 預設排序" : "👍 讚數排序";
        applyFilter();
      };
      document.querySelector(".header").appendChild(sortBtn);
    }
  } catch (e) {
    console.error(e);
    status.textContent = "載入失敗";
  }
}

// ===== CSV PARSER =====
function parseCSV(text) {
  const result = Papa.parse(text.trim(), { skipEmptyLines: true });
  const data = [];

  result.data.forEach(p => {
    if (p[0] === "GAS_URL" && p[1] === "GAS_URL" && p[2] === "GAS_URL") {
      GAS_URL = p[3];
      return;
    }

    // 優化 P1-1: 在解析時就把 Area 算好，避免後續重複計算
    const parsedArea = parseArea(p[1] || "");

    data.push({
      id: crypto.randomUUID(), // 新增唯一 ID 方便認卡片
      name: p[0] || "",
      area: p[1] || "",
      parsedArea, // 存入結構
      type: p[2] ? p[2].trim() : "未分類",
      link: p[3] || "",
      note: p[4] || "",
      likes: Number(p[5] || 0),
      likedBy: safeParse(p[6])
    });
  });

  return data;
}

function safeParse(v) {
  try { if (!v) return []; return JSON.parse(v); } catch { return []; }
}

function parseArea(areaStr) {
  if (!areaStr) return { main: "待確認", sub: [] };
  if (!areaStr.includes("：")) {
    return { main: areaStr.trim(), sub: [] };
  }
  const [main, sub] = areaStr.split("：");
  return {
    main: main.trim(),
    sub: sub ? sub.split("・").map(s => s.trim()).filter(Boolean) : []
  };
}

// ===== FILTER EXTRACT =====
function extractFilters(data) {
  const regions = {};
  const types = new Set();

  data.forEach(item => {
    const parsed = item.parsedArea;
    if (!regions[parsed.main]) {
      regions[parsed.main] = new Set();
    }
    parsed.sub.forEach(s => regions[parsed.main].add(s));
    if (item.type) types.add(item.type);
  });

  return { regions, types: [...types] };
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

  // 全部
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

  // 區域
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

  // 類型 (優化 P1-2: 再次點擊相同 Type 可切換回 all)
  filters.types.forEach(t => {
    const el = document.createElement("div");
    el.className = "chip";
    el.textContent = t;
    el.onclick = () => {
      activeType = (activeType === t) ? "all" : t; 
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

  // 優化 P1-1: 直接讀取預處理好的 parsedArea
  if (activeMain !== "all") {
    data = data.filter(i => i.parsedArea.main === activeMain);
  }
  if (activeSub !== "all") {
    data = data.filter(i => i.parsedArea.sub.includes(activeSub));
  }
  if (activeType !== "all") {
    data = data.filter(i => i.type === activeType);
  }
  if (sortMode === "likes") {
    data = [...data].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  render(data);
}

// ===== RENDER =====
function render(data) {
  container.innerHTML = "";

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = item.id; // 綁定 ID

    // 優化 P2-1: 阻擋 javascript: 協議的惡意連結
    const safeLink = (item.link && !item.link.trim().toLowerCase().startsWith('javascript:')) 
      ? item.link.trim() 
      : null;

    card.innerHTML = `
      <div class="title">${escapeHtml(item.name)}</div>
      <div class="meta">
        <span>${escapeHtml(item.area)}</span>
        <span class="tag">${escapeHtml(item.type)}</span>
      </div>
      <div class="desc">${escapeHtml(item.note)}</div>
      ${safeLink ? `<a href="${encodeURI(safeLink)}" target="_blank">開啟連結 →</a>` : ""}
      <button class="like-pill ${item.likedBy.includes(userId) ? 'liked' : ''}">
        ❤️ <span class="like-count">${item.likes || 0}</span>
      </button>
    `;

    const btn = card.querySelector(".like-pill");
    const countEl = card.querySelector(".like-count");

    if (btn) {
      btn.addEventListener("click", async () => {
        if (item.likedBy.includes(userId)) return;

        // ===== 修正 P0-2: 局部樂觀更新，不呼叫 applyFilter() 重構全網頁 DOM =====
        item.likes++;
        item.likedBy.push(userId);
        
        countEl.textContent = item.likes;
        btn.classList.add('liked'); 

        try {
          await sendLike(item.link);
          // 如果當前是「讚數排序」模式，按讚完後，若要即時重新洗牌排序，才需要呼叫 applyFilter()
          if (sortMode === "likes") {
            applyFilter();
          }
        } catch (err) {
          console.error(err);
          // ===== ROLLBACK 局部回滾 =====
          item.likes--;
          item.likedBy = item.likedBy.filter(id => id !== userId);
          
          countEl.textContent = item.likes;
          btn.classList.remove('liked');
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