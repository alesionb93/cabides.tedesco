/* =========================================================
   Cabides Premium — Checkout v3
   Atualizado para o novo formato de cart (category/modelNumber/color)
   ========================================================= */
const CART_KEY = "cabidesCart_v3";
const ORDER_KEY = "cabidesOrder_v1";

/* ---------- DATA (espelha o configurador) ---------- */
const CATEGORIES = [
  { id: "adulto",   name: "Adulto",   basePrice: 89 },
  { id: "infantil", name: "Infantil", basePrice: 69 },
];
const MODEL_INFO = {
  adulto: {
    1: { name: "Modelo 1 — Tradicional" },
    2: { name: "Modelo 2 — Com presilhas" },
    3: { name: "Modelo 3 — Luxo" },
    4: { name: "Modelo 4 — Wide" },
  },
  infantil: {
    1: { name: "Modelo 1 — Clássico" },
    2: { name: "Modelo 2 — Baby" },
    3: { name: "Modelo 3 — Com presilhas" },
    4: { name: "Modelo 4 — Luxo" },
  },
};
const COLORS = [
  { id: "tradicional", name: "Tradicional", priceDelta: 0 },
  { id: "claro",       name: "Clara",       priceDelta: 10 },
  { id: "nogueira",    name: "Nogueira",    priceDelta: 15 },
  { id: "ebano",       name: "Ébano",       priceDelta: 20 },
];
const HOOKS = [
  { id: "classico", name: "Clássico", image: "./assets/hooks/hook-classico.png", priceDelta: 0  },
  { id: "imperial", name: "Imperial", image: "./assets/hooks/hook-imperial.png", priceDelta: 12 },
  { id: "slim",     name: "Slim",     image: "./assets/hooks/hook-classico.png", priceDelta: 8, slim: true },
];

const hangerImages = (() => {
  const map = { adulto: {}, infantil: {} };
  for (const cat of ["adulto", "infantil"]) {
    for (const n of [1, 2, 3, 4]) {
      map[cat][n] = {
        tradicional: `./assets/modelo ${n}/${cat}-modelo-${n}.png`,
        claro:       `./assets/modelo ${n}/${cat}-modelo-${n}-claro.png`,
        nogueira:    `./assets/modelo ${n}/${cat}-modelo-${n}-nogueira.png`,
        ebano:       `./assets/modelo ${n}/${cat}-modelo-${n}-ebano.png`,
      };
    }
  }
  return map;
})();
function getHangerImage(cat, n, color) {
  return hangerImages?.[cat]?.[n]?.[color] || hangerImages?.[cat]?.[n]?.tradicional;
}

const PIX_DISCOUNT = 0.05;
const APPROVED_CARD = "4111111111111111";

const fmtBRL = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const $ = (s, r = document) => r.querySelector(s);
const findById = (arr, id) => arr.find((x) => x.id === id);

/* ---------------- preview canvas (foto real, sem tint) ---------------- */
const IMG_CACHE = new Map();
function loadImage(src) {
  if (IMG_CACHE.has(src)) return IMG_CACHE.get(src);
  const p = new Promise((res, rej) => {
    const img = new Image(); img.decoding = "async";
    img.onload = () => res(img); img.onerror = () => rej(new Error("Falha: " + src));
    img.src = src;
  });
  IMG_CACHE.set(src, p); return p;
}
const BBOX_CACHE = new Map();
function getOpaqueBBox(img) {
  if (BBOX_CACHE.has(img.src)) return BBOX_CACHE.get(img.src);
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const cx = c.getContext("2d", { willReadFrequently: true });
  cx.drawImage(img, 0, 0);
  let bbox;
  try {
    const { data, width, height } = cx.getImageData(0, 0, c.width, c.height);
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 16) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    bbox = maxX < 0 ? { x: 0, y: 0, w: width, h: height } : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  } catch { bbox = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight }; }
  BBOX_CACHE.set(img.src, bbox); return bbox;
}

async function renderItemPreview(canvasEl, cfg) {
  const hook = findById(HOOKS, cfg.hookModel) || HOOKS[0];
  const hangerSrc = getHangerImage(cfg.category, cfg.modelNumber, cfg.color);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvasEl.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  canvasEl.width = w; canvasEl.height = h;
  const c = canvasEl.getContext("2d");
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
  try {
    const [baseImg, hookImg] = await Promise.all([loadImage(hangerSrc), loadImage(hook.image)]);
    const scale = Math.min(w / baseImg.naturalWidth, h / baseImg.naturalHeight);
    const dw = baseImg.naturalWidth * scale, dh = baseImg.naturalHeight * scale;
    const dx = (w - dw) / 2, dy = (h - dh) / 2;
    c.drawImage(baseImg, dx, dy, dw, dh);
    const bbox = getOpaqueBBox(baseImg);
    const hScale = dw / baseImg.naturalWidth;
    const hangerTopY = dy + bbox.y * hScale;
    const hangerCenterX = dx + (bbox.x + bbox.w / 2) * hScale;
    const hookH = bbox.h * hScale * 0.48;
    const hookScale = hookH / hookImg.naturalHeight;
    const hookW = hookImg.naturalWidth * hookScale * (hook.slim ? 0.7 : 1);
    c.drawImage(hookImg, hangerCenterX - hookW / 2, hangerTopY - hookH + hookH * 0.06, hookW, hookH);
  } catch {
    c.fillStyle = "#e7e1d8"; c.fillRect(w * 0.1, h * 0.4, w * 0.8, h * 0.2);
  }
}

/* ---------------- toast ---------------- */
let toastT;
function toast(msg) {
  const t = $("#toast"); if (!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------------- cart helpers ---------------- */
function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function computeTotals(items, method) {
  const sub = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const shipping = sub >= 200 ? 0 : 19.9;
  const discount = method === "pix" ? sub * PIX_DISCOUNT : 0;
  const total = sub + shipping - discount;
  return { sub, shipping, discount, total };
}

/* ---------------- payment state ---------------- */
const paymentState = {
  method: "pix",
  card: { number: "", name: "", expiry: "", cvv: "", installments: 1, brand: "" },
};

/* ---------------- masks / validation ---------------- */
function maskCardNumber(v) { return v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim(); }
function maskExpiry(v) { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; }
function maskCVV(v) { return v.replace(/\D/g, "").slice(0, 4); }
function detectBrand(num) {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "master";
  if (/^3[47]/.test(n)) return "amex";
  return "";
}
function isExpiryValid(v) {
  const m = v.match(/^(\d{2})\/(\d{2})$/); if (!m) return false;
  const month = +m[1], year = 2000 + +m[2];
  if (month < 1 || month > 12) return false;
  const now = new Date(), exp = new Date(year, month, 0);
  return exp >= new Date(now.getFullYear(), now.getMonth(), 1);
}

/* ---------------- render ---------------- */
function render() {
  const root = $("#checkoutRoot");
  const items = loadCart();
  if (items.length === 0) {
    root.innerHTML = `
      <div class="empty-checkout">
        <h2>Sua sacola está vazia</h2>
        <p>Volte ao configurador e adicione um cabide para finalizar.</p>
        <a class="btn btn-primary" href="./index.html" style="margin-top:18px;display:inline-flex">Ir para o configurador</a>
      </div>`;
    return;
  }

  root.innerHTML = `
    <div class="checkout-grid">
      <div>
        <section class="checkout-section">
          <h3><span class="step">1</span>Contato</h3>
          <div class="field-grid two">
            <div class="field"><label>E-mail</label><input type="email" placeholder="voce@email.com" value="cliente@exemplo.com.br" /></div>
            <div class="field"><label>Telefone</label><input type="tel" placeholder="(11) 99999-9999" value="(11) 98765-4321" /></div>
          </div>
        </section>

        <section class="checkout-section">
          <h3><span class="step">2</span>Entrega</h3>
          <div class="field-grid two">
            <div class="field"><label>Nome</label><input type="text" value="Maria Souza" /></div>
            <div class="field"><label>CPF</label><input type="text" value="000.000.000-00" /></div>
          </div>
          <div class="field-grid three" style="margin-top:14px">
            <div class="field"><label>Endereço</label><input type="text" value="Rua das Acácias, 123" /></div>
            <div class="field"><label>Número</label><input type="text" value="123" /></div>
            <div class="field"><label>Complemento</label><input type="text" value="Ap 41" /></div>
          </div>
          <div class="field-grid three" style="margin-top:14px">
            <div class="field"><label>CEP</label><input type="text" value="01234-567" /></div>
            <div class="field"><label>Cidade</label><input type="text" value="São Paulo" /></div>
            <div class="field"><label>Estado</label>
              <select><option>SP</option><option>RJ</option><option>MG</option><option>RS</option></select>
            </div>
          </div>
        </section>

        <section class="checkout-section">
          <h3><span class="step">3</span>Pagamento</h3>
          <div class="pay-options" id="payOptions">
            <div class="pay-option ${paymentState.method === "pix" ? "selected" : ""}" data-method="pix">
              <button class="pay-option-head" type="button">
                <span class="pay-radio"></span>
                <span class="pay-option-icon">⚡</span>
                <span class="pay-option-text">
                  <strong>Pague via PIX</strong>
                  <span>Aprovação imediata · QR Code</span>
                </span>
                <span class="pay-badge">5% off</span>
              </button>
              <div class="pay-body">
                <div class="pix-info">
                  <div class="pix-info-icon">PIX</div>
                  <p>Você ganha <strong>5% de desconto</strong> pagando via PIX. Ao finalizar, geramos um QR Code para você concluir em segundos no app do seu banco.</p>
                </div>
              </div>
            </div>

            <div class="pay-option ${paymentState.method === "card" ? "selected" : ""}" data-method="card">
              <button class="pay-option-head" type="button">
                <span class="pay-radio"></span>
                <span class="pay-option-icon">💳</span>
                <span class="pay-option-text">
                  <strong>Cartão de Crédito</strong>
                  <span>Até 12x sem juros</span>
                </span>
              </button>
              <div class="pay-body">
                <form class="card-form" id="cardForm" autocomplete="off" novalidate>
                  <div class="field">
                    <label>Número do cartão</label>
                    <div class="card-input-wrap">
                      <input type="text" id="cardNumber" inputmode="numeric" placeholder="0000 0000 0000 0000" />
                      <span class="card-brand" id="cardBrand" style="opacity:0">—</span>
                    </div>
                  </div>
                  <div class="field">
                    <label>Nome impresso no cartão</label>
                    <input type="text" id="cardName" placeholder="Como está no cartão" />
                  </div>
                  <div class="field-grid three">
                    <div class="field"><label>Validade</label>
                      <input type="text" id="cardExpiry" inputmode="numeric" placeholder="MM/AA" />
                    </div>
                    <div class="field"><label>CVV</label>
                      <input type="text" id="cardCvv" inputmode="numeric" placeholder="000" />
                    </div>
                    <div class="field"><label>Parcelas</label>
                      <select id="cardInstallments"></select>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside class="checkout-summary">
        <h3>Resumo do pedido</h3>
        <div class="checkout-items" id="checkoutItems"></div>
        <div class="checkout-totals" id="checkoutTotals"></div>
        <button class="btn btn-primary btn-block place-order" id="placeOrderBtn">Finalizar pedido</button>
      </aside>
    </div>`;

  const itemsEl = $("#checkoutItems");
  itemsEl.innerHTML = items.map((it) => {
    const info = MODEL_INFO[it.category]?.[it.modelNumber];
    const color = findById(COLORS, it.color);
    const hook = findById(HOOKS, it.hookModel);
    return `
      <div class="checkout-item">
        <div class="checkout-item-thumb">
          <canvas data-preview="${it.id}"></canvas>
          <span class="qty-badge">${it.quantity}</span>
        </div>
        <div class="checkout-item-info">
          <strong>${info?.name || "Cabide"}</strong>
          <span>${color?.name || ""} · ${hook?.name || ""}${it.logo ? " · com logo" : ""}</span>
        </div>
        <div class="checkout-item-price">${fmtBRL(it.unitPrice * it.quantity)}</div>
      </div>`;
  }).join("");
  items.forEach((it) => {
    const cv = root.querySelector(`canvas[data-preview="${it.id}"]`);
    if (cv) renderItemPreview(cv, it);
  });

  function refreshTotals() {
    const t = computeTotals(items, paymentState.method);
    $("#checkoutTotals").innerHTML = `
      <div class="checkout-totals-row"><span>Subtotal</span><strong>${fmtBRL(t.sub)}</strong></div>
      <div class="checkout-totals-row"><span>Frete</span><strong>${t.shipping === 0 ? "Grátis" : fmtBRL(t.shipping)}</strong></div>
      ${t.discount > 0 ? `<div class="checkout-totals-row"><span>Desconto PIX</span><strong style="color:#7be0a8">- ${fmtBRL(t.discount)}</strong></div>` : ""}
      <div class="checkout-totals-row total"><span>Total</span><strong>${fmtBRL(t.total)}</strong></div>`;
    const sel = $("#cardInstallments");
    if (sel) {
      sel.innerHTML = "";
      const total = computeTotals(items, "card").total;
      for (let i = 1; i <= 12; i++) {
        const v = total / i;
        const o = document.createElement("option");
        o.value = i;
        o.textContent = `${i}x de ${fmtBRL(v)} sem juros`;
        sel.appendChild(o);
      }
    }
  }
  refreshTotals();

  $("#payOptions").addEventListener("click", (e) => {
    const opt = e.target.closest(".pay-option");
    if (!opt) return;
    paymentState.method = opt.dataset.method;
    root.querySelectorAll(".pay-option").forEach((o) => o.classList.toggle("selected", o === opt));
    refreshTotals();
  });

  const cardNumber = $("#cardNumber");
  const cardBrand = $("#cardBrand");
  cardNumber.addEventListener("input", (e) => {
    e.target.value = maskCardNumber(e.target.value);
    e.target.classList.remove("invalid");
    const brand = detectBrand(e.target.value);
    paymentState.card.brand = brand;
    cardBrand.className = "card-brand " + brand;
    cardBrand.textContent = brand ? brand.toUpperCase() : "—";
    cardBrand.style.opacity = brand ? "1" : "0";
  });
  $("#cardExpiry").addEventListener("input", (e) => { e.target.value = maskExpiry(e.target.value); e.target.classList.remove("invalid"); });
  $("#cardCvv").addEventListener("input", (e) => { e.target.value = maskCVV(e.target.value); e.target.classList.remove("invalid"); });
  $("#cardName").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, ""); e.target.classList.remove("invalid"); });

  $("#placeOrderBtn").addEventListener("click", () => placeOrder(items));
}

/* ---------------- ORDER FLOW ---------------- */
function placeOrder(items) {
  if (paymentState.method === "pix") return startPixFlow(items);
  return startCardFlow(items);
}
function mockOrderId() { return `CB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`; }
function persistOrder(order) { try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch {} }

function startPixFlow(items) {
  const totals = computeTotals(items, "pix");
  const orderId = mockOrderId();
  const pixCode = generatePixCode(totals.total, orderId);
  openModal(renderPixModal(totals, pixCode, orderId));

  let secs = 10 * 60;
  const timerEl = $("#pixTimer");
  const tick = setInterval(() => {
    secs--;
    if (timerEl) {
      const m = Math.floor(secs / 60).toString().padStart(2, "0");
      const s = (secs % 60).toString().padStart(2, "0");
      timerEl.textContent = `${m}:${s}`;
    }
    if (secs <= 0) clearInterval(tick);
  }, 1000);

  const approveTimeout = setTimeout(() => {
    clearInterval(tick);
    const order = { id: orderId, method: "pix", items, totals, paidAt: new Date().toISOString(), status: "approved" };
    persistOrder(order);
    showPaymentSuccess(order);
  }, 6500);

  modalCleanup = () => { clearInterval(tick); clearTimeout(approveTimeout); };
}

function renderPixModal(totals, pixCode, orderId) {
  return `
    <button class="modal-close" data-modal-close aria-label="Fechar">✕</button>
    <p class="modal-eyebrow">Pagamento via PIX</p>
    <h2>Pague com PIX</h2>
    <p class="modal-sub">Escaneie o QR Code ou copie o código no app do seu banco.</p>
    <div class="qr-wrap">
      ${fakeQRSVG(pixCode)}
      <div class="qr-logo">⌂</div>
    </div>
    <div class="pix-amount">
      <p class="pix-amount-label">Valor a pagar</p>
      <p class="pix-amount-value">${fmtBRL(totals.total)}</p>
    </div>
    <div class="pix-copy">
      <code id="pixCode">${pixCode}</code>
      <button id="pixCopyBtn" type="button">Copiar</button>
    </div>
    <div class="pix-status">
      <span class="dot"></span>
      <span>Aguardando pagamento...</span>
    </div>
    <p class="pix-timer">Este código expira em <strong id="pixTimer">10:00</strong></p>`;
}

function generatePixCode(amount, orderId) {
  const a = amount.toFixed(2);
  return `00020126360014BR.GOV.BCB.PIX0114cabidesPremium5204000053039865802BR5915CABIDES PREMIUM6009SAO PAULO62${orderId.length.toString().padStart(2,"0")}05${orderId}6304${a.replace(".","")}`;
}

function fakeQRSVG(seed) {
  const N = 29;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  function rng() { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967295; }
  const cells = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) cells.push(rng() > 0.5);
  function setFinder(cx, cy) {
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
      const px = cx + x, py = cy + y; if (px < 0 || px >= N || py < 0 || py >= N) continue;
      const a = Math.abs(x), b = Math.abs(y), m = Math.max(a, b);
      cells[py * N + px] = m === 3 || m === 1 || m === 0;
    }
  }
  setFinder(3, 3); setFinder(N - 4, 3); setFinder(3, N - 4);
  for (let y = (N/2|0) - 3; y <= (N/2|0) + 3; y++)
    for (let x = (N/2|0) - 3; x <= (N/2|0) + 3; x++) cells[y*N+x] = false;
  const size = 200, cell = size / N;
  let rects = "";
  for (let i = 0; i < cells.length; i++) {
    if (!cells[i]) continue;
    const x = (i % N) * cell, y = ((i / N) | 0) * cell;
    rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="0.6"/>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" fill="#1a1614">${rects}</svg>`;
}

function startCardFlow(items) {
  const number = $("#cardNumber").value.replace(/\s/g, "");
  const name = $("#cardName").value.trim();
  const expiry = $("#cardExpiry").value.trim();
  const cvv = $("#cardCvv").value.trim();
  const installments = +$("#cardInstallments").value || 1;

  let ok = true;
  const numEl = $("#cardNumber"), nmEl = $("#cardName"), exEl = $("#cardExpiry"), cvEl = $("#cardCvv");
  if (number.length < 13) { numEl.classList.add("invalid"); ok = false; }
  if (name.length < 3) { nmEl.classList.add("invalid"); ok = false; }
  if (!isExpiryValid(expiry)) { exEl.classList.add("invalid"); ok = false; }
  if (cvv.length < 3) { cvEl.classList.add("invalid"); ok = false; }
  if (!ok) { toast("Revise os dados do cartão"); return; }

  const btn = $("#placeOrderBtn");
  btn.classList.add("loading"); btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove("loading"); btn.disabled = false;
    const totals = computeTotals(items, "card");
    const orderId = mockOrderId();
    if (number === APPROVED_CARD) {
      const order = {
        id: orderId, method: "card", items, totals,
        installments, brand: paymentState.card.brand || "visa",
        last4: number.slice(-4), paidAt: new Date().toISOString(), status: "approved",
      };
      persistOrder(order);
      openModal(renderProcessingModal());
      setTimeout(() => showPaymentSuccess(order), 1400);
    } else {
      openModal(renderCardErrorModal());
    }
  }, 1800);
}

function renderProcessingModal() {
  return `
    <p class="modal-eyebrow">Processando</p>
    <h2>Confirmando pagamento</h2>
    <p class="modal-sub">Aguarde um instante enquanto autorizamos sua compra.</p>
    <div class="processing">
      <div class="processing-spinner"></div>
      <p class="processing-text">Validando dados do cartão...</p>
    </div>`;
}

function renderCardErrorModal() {
  return `
    <button class="modal-close" data-modal-close aria-label="Fechar">✕</button>
    <div class="error-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
    </div>
    <p class="modal-eyebrow" style="color:#b54a3a">Pagamento recusado</p>
    <h2>Não foi possível processar</h2>
    <p class="modal-sub">Verifique os dados do cartão ou utilize outro meio de pagamento.</p>
    <div class="error-reason">O emissor do cartão recusou a transação. Confira o número, validade e CVV.</div>
    <div class="modal-actions">
      <button class="btn btn-primary" data-action="retry">Tentar novamente</button>
      <button class="btn btn-outline" data-action="pix">Pagar com PIX</button>
    </div>`;
}

function showPaymentSuccess(order) { openModal(renderSuccessModal(order)); }
function renderSuccessModal(order) {
  const methodLabel = order.method === "pix" ? "PIX" : `Cartão ${order.brand?.toUpperCase() || ""} •••• ${order.last4 || ""}`;
  return `
    <div class="success-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/></svg>
    </div>
    <p class="modal-eyebrow" style="color:#2d7a4f">Pagamento aprovado</p>
    <h2>Pedido confirmado!</h2>
    <p class="modal-sub">Enviamos os detalhes para o seu e-mail.</p>
    <div class="success-order">
      <p class="success-order-label">Número do pedido</p>
      <p class="success-order-num">${order.id}</p>
      <div class="success-summary">
        <div class="success-summary-row"><span>Pagamento</span><span>${methodLabel}</span></div>
        <div class="success-summary-row"><span>Itens</span><span>${order.items.reduce((s,i)=>s+i.quantity,0)} produto(s)</span></div>
        ${order.totals.discount > 0 ? `<div class="success-summary-row"><span>Desconto PIX</span><span>- ${fmtBRL(order.totals.discount)}</span></div>` : ""}
        <div class="success-summary-row total"><span>Total pago</span><strong>${fmtBRL(order.totals.total)}</strong></div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" data-action="store">Voltar para a loja</button>
    </div>`;
}

let modalCleanup = null;
function openModal(html) {
  closeModal();
  const back = document.createElement("div");
  back.className = "pay-modal-backdrop";
  back.id = "payModalBackdrop";
  back.innerHTML = `<div class="pay-modal" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(back);
  document.body.style.overflow = "hidden";

  back.addEventListener("click", (e) => {
    if (e.target === back) return;
    const closeBtn = e.target.closest("[data-modal-close]");
    if (closeBtn) closeModal();
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "store") {
      localStorage.removeItem(CART_KEY);
      window.location.href = "./index.html";
    } else if (action === "retry") {
      closeModal();
    } else if (action === "pix") {
      closeModal();
      paymentState.method = "pix";
      render();
    }
  });

  const copyBtn = back.querySelector("#pixCopyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const code = back.querySelector("#pixCode")?.textContent || "";
      navigator.clipboard?.writeText(code).catch(() => {});
      copyBtn.textContent = "Copiado ✓"; copyBtn.classList.add("copied");
      setTimeout(() => { copyBtn.textContent = "Copiar"; copyBtn.classList.remove("copied"); }, 2000);
    });
  }
}
function closeModal() {
  const back = $("#payModalBackdrop"); if (back) back.remove();
  document.body.style.overflow = "";
  if (modalCleanup) { modalCleanup(); modalCleanup = null; }
}

document.addEventListener("DOMContentLoaded", render);
