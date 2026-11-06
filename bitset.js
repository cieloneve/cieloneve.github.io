
const BITSET_VERSION = "BIT1:";
const ROLE_COUNT = 26;
const CARDS_PER_ROLE = 100;
const BYTE_LENGTH = (ROLE_COUNT * CARDS_PER_ROLE) / 8;

// 將 res002、no056 轉換成全域 bit 索引
function getCardIndex(roleId, cardId) {
    const roleMatch = /^res(\d{3})$/.exec(roleId);
    const cardMatch = /^no(\d{3})$/.exec(cardId);

    if (!roleMatch || !cardMatch) {
        throw new Error(`無效的角色或卡片 ID：${roleId}, ${cardId}`);
    }

    const roleNumber = Number(roleMatch[1]);
    const cardNumber = Number(cardMatch[1]);

    if (roleNumber < 1 || roleNumber > ROLE_COUNT ||
        cardNumber < 1 || cardNumber > CARDS_PER_ROLE) {
        throw new RangeError(`ID 超出編碼範圍：${roleId}, ${cardId}`);
    }

    return (roleNumber - 1) * CARDS_PER_ROLE + (cardNumber - 1);
}

// 將 collected 轉成 BIT1: Base64
function encodeCollected(collected) {
    const bytes = new Uint8Array(BYTE_LENGTH);

    for (const [roleId, cards] of Object.entries(collected)) {
        if (!Array.isArray(cards)) {
            throw new Error(`${roleId} 的資料不是陣列`);
        }

        for (const cardId of cards) {
            const index = getCardIndex(roleId, cardId);
            const byteIndex = Math.floor(index / 8);
            const bitPosition = index % 8;

            bytes[byteIndex] |= 1 << bitPosition;
        }
    }

    // Uint8Array → Base64
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return BITSET_VERSION + btoa(binary);
}

// 將 BIT1: Base64 還原成 collected
function decodeCollected(saved) {
    if (typeof saved !== "string" ||
        !saved.startsWith(BITSET_VERSION)) {
        throw new Error("不是支援的 BIT1 存檔格式");
    }

    const binary = atob(saved.slice(BITSET_VERSION.length));

    if (binary.length !== BYTE_LENGTH) {
        throw new Error("Bitset 長度不正確");
    }

    const bytes = new Uint8Array(BYTE_LENGTH);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    const collected = {};

    for (let role = 1; role <= ROLE_COUNT; role++) {
        const roleId = `res${String(role).padStart(3, "0")}`;
        collected[roleId] = [];

        for (let card = 1; card <= CARDS_PER_ROLE; card++) {
            const cardId = `no${String(card).padStart(3, "0")}`;
            const index = getCardIndex(roleId, cardId);

            const byteIndex = Math.floor(index / 8);
            const bitPosition = index % 8;

            if ((bytes[byteIndex] & (1 << bitPosition)) !== 0) {
                collected[roleId].push(cardId);
            }
        }
    }

    return collected;
}
