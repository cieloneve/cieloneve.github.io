const fileInput = document.getElementById("fileInput");
const container = document.getElementById("cardContainer");
const status = document.getElementById("status");

fileInput.addEventListener("change", handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  status.textContent = "讀取 CSV 中...";

  const reader = new FileReader();

  reader.onload = (event) => {
    const text = event.target.result;

    const data = parseCSV(text);

    render(data);

    status.textContent = `完成載入 ${data.length} 筆資料`;
  };

  reader.readAsText(file);
}

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

const urlInput = document.getElementById("urlInput");
const loadUrlBtn = document.getElementById("loadUrlBtn");

loadUrlBtn.addEventListener("click", loadFromUrl);

async function loadFromUrl() {
  const url = urlInput.value.trim();
  if (!url) return;

  status.textContent = "載入網路 CSV 中...";

  try {
    const res = await fetch(url);

    if (!res.ok) throw new Error("HTTP error " + res.status);

    const text = await res.text();

    const data = parseCSV(text);

    render(data);

    status.textContent = `完成載入 ${data.length} 筆（網路來源）`;
  } catch (e) {
    console.error(e);
    status.textContent = "載入失敗（可能 CORS 或 URL 無效）";
  }
}

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

function escapeHtml(str) {
  return (str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}