/* =========================================================
   Cabides Premium — Configurador v3 (Vanilla JS)
   ---------------------------------------------------------
   REFATORAÇÃO:
   - Sem tint procedural / sem overlay de cor / sem filtros.
   - Cada combinação (categoria + modelo + cor) carrega
     uma FOTO REAL específica do cabide.
   - Mapeamento centralizado em hangerImages.
   - Mantém wizard, gancho, acessórios, logo, carrinho e checkout.
   ========================================================= */

/* ---------- CATEGORIAS / MODELOS / CORES ---------- */
const CATEGORIES = [
  { id: "adulto",   name: "Adulto",   basePrice: 89 },
  { id: "infantil", name: "Infantil", basePrice: 69 },
];

const MODEL_INFO = {
  adulto: {
    1: { name: "Modelo 1 — Tradicional",   sub: "Linhas clássicas" },
    2: { name: "Modelo 2 — Com presilhas", sub: "Calças e saias"   },
    3: { name: "Modelo 3 — Luxo",          sub: "Premium"          },
    4: { name: "Modelo 4 — Wide",          sub: "Ombros largos"    },
  },
  infantil: {
    1: { name: "Modelo 1 — Clássico",      sub: "Tamanho infantil" },
    2: { name: "Modelo 2 — Baby",          sub: "0–2 anos"         },
    3: { name: "Modelo 3 — Com presilhas", sub: "Saias e calças"   },
    4: { name: "Modelo 4 — Luxo",          sub: "Kids premium"     },
  },
};

const COLORS = [
  { id: "tradicional", name: "Tradicional", swatch: "#c9a37a", priceDelta: 0,  isDark: false },
  { id: "claro",       name: "Clara",       swatch: "#e7d2b0", priceDelta: 10, isDark: false },
  { id: "nogueira",    name: "Nogueira",    swatch: "#6e4324", priceDelta: 15, isDark: false },
  { id: "ebano",       name: "Ébano",       swatch: "#241712", priceDelta: 20, isDark: true  },
];

/* ----------- MAPEAMENTO CENTRALIZADO DE IMAGENS ----------- */
/* Estrutura: hangerImages[category][modelNumber][colorId] = "./assets/..." */
const hangerImages = (() => {
   const map = { adulto: {}, infantil: {} };
   for (const cat of ["adulto", "infantil"]) {
     for (const n of [1, 2, 3, 4]) {
       map[cat][n] = {
         tradicional: `./assets/hangers/${cat}-modelo-${n}.png`,
         claro:       `./assets/hangers/${cat}-modelo-${n}-claro.png`,
         nogueira:    `./assets/hangers/${cat}-modelo-${n}-nogueira.png`,
         ebano:       `./assets/hangers/${cat}-modelo-${n}-ebano.png`,
       };
     }
   }
   return map;
 })();

function getHangerImage(category, modelNumber, colorId) {
  return hangerImages?.[category]?.[modelNumber]?.[colorId]
      || hangerImages?.[category]?.[modelNumber]?.tradicional;
}
function getBaseImage(category, modelNumber) {
  return hangerImages[category][modelNumber].tradicional;
}

/* ---------- GANCHOS / ACESSÓRIOS / METAIS (mantidos) ---------- */
const HOOKS = [
  { id: "classico", name: "Clássico", sub: "Linhas curvas",      image: "./assets/hooks/hook-classico.png", priceDelta: 0  },
  { id: "imperial", name: "Imperial", sub: "Base esculpida",     image: "./assets/hooks/hook-imperial.png", priceDelta: 12 },
  { id: "slim",     name: "Slim",     sub: "Perfil minimalista", image: "./assets/hooks/hook-classico.png", priceDelta: 8, slim: true },
];

const ACCESSORY_SVG = {
  simple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 40"><rect x="10" y="14" width="580" height="12" rx="6" fill="#cfcfcf"/><rect x="10" y="14" width="580" height="3" rx="1.5" fill="#ffffff" opacity=".55"/><circle cx="20" cy="20" r="6" fill="#a8a8a8"/><circle cx="580" cy="20" r="6" fill="#a8a8a8"/></svg>`,
  clips: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 60"><rect x="10" y="22" width="580" height="10" rx="5" fill="#cfcfcf"/><rect x="10" y="22" width="580" height="2.5" rx="1.25" fill="#fff" opacity=".5"/>${[120,300,480].map(x=>`<g><rect x="${x-18}" y="14" width="36" height="32" rx="6" fill="#bdbdbd"/><rect x="${x-14}" y="18" width="28" height="6" rx="3" fill="#ededed"/></g>`).join("")}<circle cx="20" cy="27" r="6" fill="#a8a8a8"/><circle cx="580" cy="27" r="6" fill="#a8a8a8"/></svg>`,
  retractable: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 44"><rect x="40" y="16" width="520" height="12" rx="6" fill="#cfcfcf"/><rect x="100" y="18" width="400" height="8" rx="4" fill="#e3e3e3"/><rect x="40" y="16" width="520" height="3" rx="1.5" fill="#fff" opacity=".55"/><rect x="30" y="10" width="20" height="24" rx="4" fill="#a8a8a8"/><rect x="550" y="10" width="20" height="24" rx="4" fill="#a8a8a8"/><path d="M70 22h12M518 22h12" stroke="#7a7a7a" stroke-width="2" stroke-linecap="round"/></svg>`,
};
const accessoryDataUrl = (svg) => "data:image/svg+xml;utf8," + encodeURIComponent(svg);
const ACCESSORIES = [
  { id: "none",        name: "Sem barra",            sub: "Apenas o cabide",   priceDelta: 0,  image: null },
  { id: "simple",      name: "Barra metálica",       sub: "Linha minimalista", priceDelta: 18, image: accessoryDataUrl(ACCESSORY_SVG.simple),      widthFactor: 0.96, heightFactor: 0.075 },
  { id: "clips",       name: "Barra com presilhas", sub: "3 presilhas móveis", priceDelta: 28, image: accessoryDataUrl(ACCESSORY_SVG.clips),       widthFactor: 0.96, heightFactor: 0.11  },
  { id: "retractable", name: "Barra retrátil",      sub: "Expansiva premium",  priceDelta: 36, image: accessoryDataUrl(ACCESSORY_SVG.retractable), widthFactor: 0.96, heightFactor: 0.085 },
];

const METAL_COLORS = [
  { id: "silver", name: "Prata",       sub: "Acabamento neutro",  color: "#cfcfcf", tint: null,       priceDelta: 0  },
  { id: "gold",   name: "Dourado",     sub: "Brilho quente",      color: "#d9a441", tint: "#c9a86a",  priceDelta: 14 },
  { id: "black",  name: "Preto fosco", sub: "Industrial premium", color: "#1c1c1c", tint: "#2a2a2a",  priceDelta: 10 },
];

/* ----------- STATE GLOBAL ----------- */
const configuratorState = {
  currentStep: 1,
  category: "adulto",        // adulto | infantil
  modelNumber: 1,            // 1..4
  color: "tradicional",      // tradicional | claro | nogueira | ebano
  hookModel: "classico",
  metalColor: "silver",
  bottomAccessory: "none",
  logo: {
    image: null, dataUrl: null, name: null,
    scale: 0.22, opacity: 0.85, xOff: 0, yOff: 0.05, rotation: 0,
    effect: "laser", isEditing: false, isSaved: false, savedSnapshot: null,
  },
};

const logoState = new Proxy(configuratorState.logo, {
  get(t, k) { return k === "mode" ? t.effect : t[k]; },
  set(t, k, v) { if (k === "mode") t.effect = v; else t[k] = v; return true; },
});

/* ----------- HELPERS ----------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const fmtBRL = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const findById = (arr, id, fallback) => arr.find((x) => x.id === id) || fallback || arr[0];

const getCategory   = () => findById(CATEGORIES, configuratorState.category);
const getColor      = () => findById(COLORS, configuratorState.color);
const getHook       = () => findById(HOOKS, configuratorState.hookModel);
const getAccessory  = () => findById(ACCESSORIES, configuratorState.bottomAccessory);
const getMetal      = () => findById(METAL_COLORS, configuratorState.metalColor);
const getModelInfo  = () => MODEL_INFO[configuratorState.category][configuratorState.modelNumber];

function computeTotal() {
  return getCategory().basePrice
       + getColor().priceDelta
       + getHook().priceDelta
       + getAccessory().priceDelta
       + getMetal().priceDelta;
}

/* ----------- IMAGE / BBOX CACHE ----------- */
const IMG_CACHE = new Map();
function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (IMG_CACHE.has(src)) return IMG_CACHE.get(src);
  const p = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error("Falha ao carregar " + src));
    img.src = src;
  });
  IMG_CACHE.set(src, p);
  return p;
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
    const threshold = 16;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > threshold) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    bbox = maxX < 0
      ? { x: 0, y: 0, w: width, h: height }
      : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  } catch { bbox = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight }; }
  BBOX_CACHE.set(img.src, bbox);
  return bbox;
}

/* =========================================================
   RENDER ENGINE — apenas DESENHA a imagem real (sem tint)
   ========================================================= */
const canvas = $("#hangerCanvas");
const ctx = canvas.getContext("2d");
let lastFrame = null;

function resizeCanvasToDisplay() {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width  * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  return { w, h, dpr, cssW: rect.width, cssH: rect.height };
}

function fitHangerLayer(baseImg, targetW, targetH) {
  const scale = Math.min(targetW / baseImg.naturalWidth, targetH / baseImg.naturalHeight);
  const dw = baseImg.naturalWidth  * scale;
  const dh = baseImg.naturalHeight * scale;
  const dx = (targetW - dw) / 2;
  const dy = (targetH - dh) / 2;
  return { dx, dy, dw, dh };
}

/* Tinge metal usando multiply — só afeta gancho/acessório, não o cabide. */
function applyMetalTint(srcImg, w, h, metal) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const cx = c.getContext("2d");
  cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high";
  cx.drawImage(srcImg, 0, 0, c.width, c.height);
  if (metal.tint) {
    cx.save();
    cx.globalCompositeOperation = "source-atop";
    cx.globalAlpha = metal.id === "black" ? 0.78 : 0.62;
    cx.fillStyle = metal.tint;
    cx.fillRect(0, 0, c.width, c.height);
    cx.restore();
  }
  return c;
}

function drawHookOnTop(targetCtx, hookImg, baseImg, hangerBox, hook, metal) {
  const bbox = getOpaqueBBox(baseImg);
  const scale = hangerBox.dw / baseImg.naturalWidth;
  const hangerTopY = hangerBox.dy + bbox.y * scale;
  const hangerCenterX = hangerBox.dx + (bbox.x + bbox.w / 2) * scale;
  const hangerVisibleH = bbox.h * scale;
  const hookH = hangerVisibleH * (hook.slim ? 0.588 : 0.672); // +40% (1.4x) — somente preview principal; proporção preservada
  const hookScale = hookH / hookImg.naturalHeight;
  const hookW = hookImg.naturalWidth * hookScale * (hook.slim ? 0.7 : 1);
  const overlap = hookH * 0.06;
  const hx = hangerCenterX - hookW / 2;
  const hy = hangerTopY - hookH + overlap;
  const tinted = applyMetalTint(hookImg, hookW, hookH, metal);
  targetCtx.save();
  targetCtx.imageSmoothingEnabled = true; targetCtx.imageSmoothingQuality = "high";
  targetCtx.drawImage(tinted, Math.round(hx), Math.round(hy));
  targetCtx.restore();
}

function drawAccessoryOnBottom(targetCtx, accImg, baseImg, hangerBox, accessory, metal) {
  if (!accImg) return;
  const bbox = getOpaqueBBox(baseImg);
  const scale = hangerBox.dw / baseImg.naturalWidth;
  const hangerLeft = hangerBox.dx + bbox.x * scale;
  const hangerTop  = hangerBox.dy + bbox.y * scale;
  const hangerW    = bbox.w * scale;
  const hangerH    = bbox.h * scale;
  const accW = hangerW * (accessory.widthFactor || 0.96);
  const aspect = accImg.naturalHeight / accImg.naturalWidth;
  const accH = Math.max(hangerH * (accessory.heightFactor || 0.08), accW * aspect);
  const ax = hangerLeft + (hangerW - accW) / 2;
  const ay = hangerTop + hangerH - accH * 0.55;
  const tinted = applyMetalTint(accImg, accW, accH, metal);
  targetCtx.save();
  targetCtx.shadowColor = "rgba(20,14,8,0.18)";
  targetCtx.shadowBlur = Math.max(2, accH * 0.25);
  targetCtx.shadowOffsetY = Math.max(1, accH * 0.08);
  targetCtx.drawImage(tinted, Math.round(ax), Math.round(ay));
  targetCtx.restore();
}

/* ---------- LOGO RENDER (preservado) ---------- */
function makeSilhouette(img, w, h, color) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const cx = c.getContext("2d");
  cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high";
  cx.drawImage(img, 0, 0, c.width, c.height);
  cx.globalCompositeOperation = "source-in";
  cx.fillStyle = color;
  cx.fillRect(0, 0, c.width, c.height);
  return c;
}

function drawLogoVariant(targetCtx, baseImg, hangerBox, logoImg, logoCfg, isDark) {
  if (!logoImg) return null;
  const bbox = getOpaqueBBox(baseImg);
  const scale = hangerBox.dw / baseImg.naturalWidth;
  const hangerLeft = hangerBox.dx + bbox.x * scale;
  const hangerTop  = hangerBox.dy + bbox.y * scale;
  const hangerW    = bbox.w * scale;
  const hangerH    = bbox.h * scale;
  const cx = hangerLeft + hangerW * (0.5 + logoCfg.xOff);
  const cy = hangerTop  + hangerH * (0.5 + logoCfg.yOff);
  const logoW = hangerW * logoCfg.scale;
  const aspect = logoImg.naturalHeight / logoImg.naturalWidth;
  const logoH = logoW * aspect;
  const rot = (logoCfg.rotation * Math.PI) / 180;
  targetCtx.save();
  targetCtx.translate(cx, cy);
  targetCtx.rotate(rot);
  targetCtx.imageSmoothingEnabled = true; targetCtx.imageSmoothingQuality = "high";
  const x = -logoW / 2, y = -logoH / 2;
  const mode = logoCfg.effect || logoCfg.mode;
  switch (mode) {
    case "silk": {
      targetCtx.globalAlpha = logoCfg.opacity;
      targetCtx.globalCompositeOperation = "multiply";
      targetCtx.drawImage(logoImg, x, y, logoW, logoH);
      targetCtx.globalCompositeOperation = "source-over";
      targetCtx.globalAlpha = logoCfg.opacity * 0.25;
      targetCtx.drawImage(logoImg, x, y, logoW, logoH);
      break;
    }
    case "deboss": {
      const highlight = makeSilhouette(logoImg, logoW, logoH, "#ffffff");
      const shadow    = makeSilhouette(logoImg, logoW, logoH, "#1a0e07");
      const op = logoCfg.opacity, d = Math.max(1, logoW * 0.006);
      targetCtx.globalCompositeOperation = "overlay";
      targetCtx.globalAlpha = op * 0.55;
      targetCtx.drawImage(highlight, x + d, y + d);
      targetCtx.globalCompositeOperation = "multiply";
      targetCtx.globalAlpha = op * 0.85;
      targetCtx.drawImage(shadow, x - d, y - d);
      targetCtx.globalCompositeOperation = "multiply";
      targetCtx.globalAlpha = op * 0.35;
      targetCtx.drawImage(shadow, x, y);
      break;
    }
    case "gold": {
      const gold = makeSilhouette(logoImg, logoW, logoH, "#d9a441");
      targetCtx.globalCompositeOperation = "source-over";
      targetCtx.shadowColor = "rgba(120, 70, 10, 0.45)";
      targetCtx.shadowBlur = Math.max(2, logoW * 0.015);
      targetCtx.shadowOffsetY = Math.max(1, logoW * 0.004);
      targetCtx.globalAlpha = logoCfg.opacity;
      targetCtx.drawImage(gold, x, y);
      targetCtx.shadowColor = "transparent";
      targetCtx.globalCompositeOperation = "overlay";
      targetCtx.globalAlpha = logoCfg.opacity * 0.55;
      targetCtx.drawImage(makeSilhouette(logoImg, logoW, logoH, "#fff1c2"), x, y);
      break;
    }
    case "laser":
    default: {
      const burnColor = isDark ? "#e0c79a" : "#2c170a";
      const burn = makeSilhouette(logoImg, logoW, logoH, burnColor);
      targetCtx.globalCompositeOperation = isDark ? "screen" : "multiply";
      targetCtx.globalAlpha = logoCfg.opacity;
      targetCtx.drawImage(burn, x, y);
      targetCtx.globalCompositeOperation = "multiply";
      targetCtx.globalAlpha = logoCfg.opacity * 0.25;
      targetCtx.drawImage(burn, x, y + Math.max(1, logoW * 0.003));
      break;
    }
  }
  targetCtx.restore();
  return { cx, cy, w: logoW, h: logoH, hangerLeft, hangerTop, hangerW, hangerH };
}

function drawLogoOnCanvas(targetCtx, baseImg, hangerBox) {
  if (!logoState.image) return null;
  return drawLogoVariant(targetCtx, baseImg, hangerBox, logoState.image, configuratorState.logo, getColor().isDark);
}

/* ---------- RENDER LOOP ---------- */
let renderToken = 0;
async function render() {
  const myToken = ++renderToken;
  const hook = getHook();
  const accessory = getAccessory();
  const metal = getMetal();
  const color = getColor();

  const wrap = $("#hangerWrap");
  wrap.classList.add("swapping");

  const hangerSrc = getHangerImage(configuratorState.category, configuratorState.modelNumber, configuratorState.color);

  try {
    const [baseImg, hookImg, accImg] = await Promise.all([
      loadImage(hangerSrc),
      loadImage(hook.image),
      accessory.image ? loadImage(accessory.image) : Promise.resolve(null),
    ]);
    if (myToken !== renderToken) return;

    const { w, h, dpr } = resizeCanvasToDisplay();
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";

    const fit = fitHangerLayer(baseImg, w, h);
    const hangerBox = { ...fit };

    // 1) Imagem REAL do cabide (cor já é a foto)
    ctx.drawImage(baseImg, fit.dx, fit.dy, fit.dw, fit.dh);
    // 2) Logo
    const logoFrame = drawLogoOnCanvas(ctx, baseImg, hangerBox);
    // 3) Acessório
    if (accImg) drawAccessoryOnBottom(ctx, accImg, baseImg, hangerBox, accessory, metal);
    // 4) Gancho
    drawHookOnTop(ctx, hookImg, baseImg, hangerBox, hook, metal);

    const bbox = getOpaqueBBox(baseImg);
    const s = fit.dw / baseImg.naturalWidth;
    lastFrame = {
      dpr,
      hangerLeft: fit.dx + bbox.x * s,
      hangerTop:  fit.dy + bbox.y * s,
      hangerW: bbox.w * s,
      hangerH: bbox.h * s,
      logoFrame,
    };
    updateOverlay();
  } catch (err) {
    console.warn("Render falhou:", err);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // fallback discreto
    ctx.fillStyle = "#efeae2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } finally {
    requestAnimationFrame(() => wrap.classList.remove("swapping"));
  }
}

/* =========================================================
   OVERLAY EDITOR DA LOGO (preservado)
   ========================================================= */
const overlay = $("#logoOverlay");
const logoBox = $("#logoBox");

function updateOverlay() {
  if (!logoState.image || !lastFrame || !lastFrame.logoFrame) { overlay.hidden = true; return; }
  overlay.hidden = false;
  overlay.classList.toggle("locked", !logoState.isEditing);
  const dpr = lastFrame.dpr;
  const f = lastFrame.logoFrame;
  const wCss = f.w / dpr, hCss = f.h / dpr;
  const cxCss = f.cx / dpr, cyCss = f.cy / dpr;
  logoBox.style.width  = `${wCss}px`;
  logoBox.style.height = `${hCss}px`;
  logoBox.style.left   = `${cxCss - wCss / 2}px`;
  logoBox.style.top    = `${cyCss - hCss / 2}px`;
  logoBox.style.transform = `rotate(${logoState.rotation}deg)`;
}

function setupEditorInteractions() {
  let drag = null;
  const start = (e) => {
    if (!logoState.image || !lastFrame) return;
    const handle = e.target.dataset.handle || "move";
    const rect = $("#hangerWrap").getBoundingClientRect();
    const cxCss = lastFrame.logoFrame.cx / lastFrame.dpr;
    const cyCss = lastFrame.logoFrame.cy / lastFrame.dpr;
    drag = {
      type: handle,
      startX: e.clientX, startY: e.clientY,
      centerClientX: rect.left + cxCss, centerClientY: rect.top + cyCss,
      startXOff: logoState.xOff, startYOff: logoState.yOff,
      startScale: logoState.scale, startRot: logoState.rotation,
      startDist: Math.hypot(e.clientX - (rect.left + cxCss), e.clientY - (rect.top + cyCss)),
      startAng: Math.atan2(e.clientY - (rect.top + cyCss), e.clientX - (rect.left + cxCss)),
    };
    logoBox.classList.add("dragging");
    e.target.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };
  const move = (e) => {
    if (!drag) return;
    const f = lastFrame;
    const hangerWCss = f.hangerW / f.dpr;
    const hangerHCss = f.hangerH / f.dpr;
    if (drag.type === "move") {
      const dx = (e.clientX - drag.startX) / hangerWCss;
      const dy = (e.clientY - drag.startY) / hangerHCss;
      logoState.xOff = clamp(drag.startXOff + dx, -0.5, 0.5);
      logoState.yOff = clamp(drag.startYOff + dy, -0.5, 0.5);
    } else if (drag.type === "resize") {
      const d = Math.hypot(e.clientX - drag.centerClientX, e.clientY - drag.centerClientY);
      const ratio = d / Math.max(1, drag.startDist);
      logoState.scale = clamp(drag.startScale * ratio, 0.06, 0.6);
    } else if (drag.type === "rotate") {
      const a = Math.atan2(e.clientY - drag.centerClientY, e.clientX - drag.centerClientX);
      const deltaDeg = ((a - drag.startAng) * 180) / Math.PI;
      logoState.rotation = clamp(drag.startRot + deltaDeg, -45, 45);
    }
    syncControlsFromState();
    render();
  };
  const end = () => { if (!drag) return; drag = null; logoBox.classList.remove("dragging"); };
  logoBox.addEventListener("pointerdown", start);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}

function syncControlsFromState() {
  $("#ctrlScale").value   = Math.round(logoState.scale * 100);
  $("#valScale").textContent   = `${Math.round(logoState.scale * 100)}%`;
  $("#ctrlOpacity").value = Math.round(logoState.opacity * 100);
  $("#valOpacity").textContent = `${Math.round(logoState.opacity * 100)}%`;
  $("#ctrlX").value       = Math.round(logoState.xOff * 100);
  $("#valX").textContent       = `${Math.round(logoState.xOff * 100)}`;
  $("#ctrlY").value       = Math.round(logoState.yOff * 100);
  $("#valY").textContent       = `${Math.round(logoState.yOff * 100)}`;
  $("#ctrlRot").value     = Math.round(logoState.rotation);
  $("#valRot").textContent     = `${Math.round(logoState.rotation)}°`;
  $$("#logoModes .mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === logoState.effect));
}

function setupControls() {
  const bind = (id, valId, key, divisor, suffix) => {
    const el = $(id);
    el.addEventListener("input", () => {
      const v = parseFloat(el.value);
      logoState[key] = divisor ? v / divisor : v;
      $(valId).textContent = suffix === "%" ? `${Math.round(v)}%` : suffix === "°" ? `${Math.round(v)}°` : `${Math.round(v)}`;
      render();
    });
  };
  bind("#ctrlScale",   "#valScale",   "scale",    100, "%");
  bind("#ctrlOpacity", "#valOpacity", "opacity",  100, "%");
  bind("#ctrlX",       "#valX",       "xOff",     100, "");
  bind("#ctrlY",       "#valY",       "yOff",     100, "");
  bind("#ctrlRot",     "#valRot",     "rotation", 0,   "°");

  $("#logoModes").addEventListener("click", (e) => {
    const btn = e.target.closest(".mode-btn"); if (!btn) return;
    logoState.effect = btn.dataset.mode;
    syncControlsFromState();
    render();
  });
}

/* =========================================================
   UI BUILDERS
   ========================================================= */

/* Step 1 — duas seções (Adulto / Infantil), 4 modelos cada */
function buildModelOptions() {
  const root = $("#modelOptions");
  const renderGroup = (catId) => {
    const cat = findById(CATEGORIES, catId);
    const cards = [1,2,3,4].map((n) => {
      const info = MODEL_INFO[catId][n];
      const img = getBaseImage(catId, n);
      const isActive = configuratorState.category === catId && configuratorState.modelNumber === n;
      return `
        <button class="option model-option ${isActive ? "active" : ""}" data-cat="${catId}" data-model="${n}">
          <div class="option-thumb"><img src="${img}" alt="${info.name}" loading="lazy" /></div>
          <div>
            <div class="option-label">${info.name}</div>
            <div class="option-sub">${info.sub} · ${fmtBRL(cat.basePrice)}</div>
          </div>
        </button>`;
    }).join("");
    return `
      <div class="model-group" data-group="${catId}">
        <div class="model-group-head">
          <span class="model-group-title">${cat.name}</span>
          <span class="model-group-line"></span>
        </div>
        <div class="model-group-grid">${cards}</div>
      </div>`;
  };
  root.innerHTML = renderGroup("adulto") + renderGroup("infantil");
}

/* Step 2 — apenas 4 cores reais (swap de imagem) */
function buildColorOptions() {
  const root = $("#colorOptions");
  root.innerHTML = COLORS.map((c) => {
    const previewSrc = getHangerImage(configuratorState.category, configuratorState.modelNumber, c.id);
    return `
      <button class="option color-option ${c.id === configuratorState.color ? "active" : ""}" data-id="${c.id}">
        <div class="color-thumb"><img src="${previewSrc}" alt="${c.name}" loading="lazy" /></div>
        <div class="color-info">
          <div class="swatch" style="background:${c.swatch}"></div>
          <div>
            <div class="option-label">${c.name}</div>
            ${c.priceDelta ? `<div class="option-sub">+${fmtBRL(c.priceDelta)}</div>` : `<div class="option-sub">Incluso</div>`}
          </div>
        </div>
      </button>`;
  }).join("");
}

function buildHookOptions() {
  const root = $("#hookOptions");
  root.innerHTML = HOOKS.map((h) => `
    <button class="option ${h.id === configuratorState.hookModel ? "active" : ""}" data-id="${h.id}">
      <div class="option-thumb"><img src="${h.image}" alt="${h.name}" style="${h.slim ? "transform:scaleX(0.7)" : ""}" /></div>
      <div>
        <div class="option-label">${h.name}</div>
        <div class="option-sub">${h.sub}${h.priceDelta ? ` · +${fmtBRL(h.priceDelta)}` : ""}</div>
      </div>
    </button>`).join("");
}

function buildAccessoryOptions() {
  const root = $("#accessoryOptions");
  root.innerHTML = ACCESSORIES.map((a) => `
    <button class="option accessory-option ${a.id === configuratorState.bottomAccessory ? "active" : ""}" data-id="${a.id}">
      <div class="option-thumb accessory-thumb">
        ${a.image
          ? `<img src="${a.image}" alt="${a.name}" />`
          : `<div class="acc-none">⊘<span>Sem acessório</span></div>`}
      </div>
      <div>
        <div class="option-label">${a.name}</div>
        <div class="option-sub">${a.sub}${a.priceDelta ? ` · +${fmtBRL(a.priceDelta)}` : ""}</div>
      </div>
    </button>`).join("");
}

function buildMetalOptions() {
  const root = $("#metalOptions");
  root.innerHTML = METAL_COLORS.map((m) => `
    <button class="option metal-option ${m.id === configuratorState.metalColor ? "active" : ""}" data-id="${m.id}">
      <div class="metal-swatch" style="background:linear-gradient(135deg, ${m.color} 0%, ${shade(m.color, -20)} 100%)"></div>
      <div>
        <div class="option-label">${m.name}</div>
        <div class="option-sub">${m.sub}${m.priceDelta ? ` · +${fmtBRL(m.priceDelta)}` : ""}</div>
      </div>
    </button>`).join("");
}

function shade(hex, percent) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = clamp((n >> 16) + percent, 0, 255);
  const g = clamp(((n >> 8) & 0xff) + percent, 0, 255);
  const b = clamp((n & 0xff) + percent, 0, 255);
  return `rgb(${r},${g},${b})`;
}

function buildModelsGrid() {
  const grid = $("#modelsGrid");
  if (!grid) return;
  // Mostra 4 destaques: adulto 1..4
  grid.innerHTML = [1,2,3,4].map((n) => {
    const info = MODEL_INFO.adulto[n];
    const img = getBaseImage("adulto", n);
    return `
      <article class="model-card" data-cat="adulto" data-model="${n}">
        <div class="thumb"><img src="${img}" alt="${info.name}" loading="lazy" /></div>
        <h3>${info.name}</h3>
        <p>${info.sub}</p>
        <div class="price">${fmtBRL(CATEGORIES[0].basePrice)}</div>
      </article>`;
  }).join("");
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".model-card"); if (!card) return;
    configuratorState.category = card.dataset.cat;
    configuratorState.modelNumber = parseInt(card.dataset.model, 10);
    buildModelOptions();
    buildColorOptions();
    refresh();
    Wizard.open(1);
  });
}

/* ---------- delegação de cliques ---------- */
function setupOptionGridHandlers() {
  $("#modelOptions").addEventListener("click", (e) => {
    const btn = e.target.closest(".option"); if (!btn) return;
    configuratorState.category = btn.dataset.cat;
    configuratorState.modelNumber = parseInt(btn.dataset.model, 10);
    buildColorOptions();
    refresh();
  });
  $("#colorOptions").addEventListener("click", (e) => {
    const btn = e.target.closest(".option"); if (!btn) return;
    configuratorState.color = btn.dataset.id;
    refresh();
  });
  $("#hookOptions").addEventListener("click", (e) => {
    const btn = e.target.closest(".option"); if (!btn) return;
    configuratorState.hookModel = btn.dataset.id; refresh();
  });
  $("#accessoryOptions").addEventListener("click", (e) => {
    const btn = e.target.closest(".option"); if (!btn) return;
    configuratorState.bottomAccessory = btn.dataset.id; refresh();
  });
  $("#metalOptions").addEventListener("click", (e) => {
    const btn = e.target.closest(".option"); if (!btn) return;
    configuratorState.metalColor = btn.dataset.id; refresh();
  });
}

/* ---------- refresh ---------- */
function refreshActive() {
  $$("#modelOptions .option").forEach((el) => {
    const active = el.dataset.cat === configuratorState.category
                && parseInt(el.dataset.model,10) === configuratorState.modelNumber;
    el.classList.toggle("active", active);
  });
  $$("#colorOptions .option").forEach((el) => el.classList.toggle("active", el.dataset.id === configuratorState.color));
  $$("#hookOptions .option").forEach((el) => el.classList.toggle("active", el.dataset.id === configuratorState.hookModel));
  $$("#accessoryOptions .option").forEach((el) => el.classList.toggle("active", el.dataset.id === configuratorState.bottomAccessory));
  $$("#metalOptions .option").forEach((el) => el.classList.toggle("active", el.dataset.id === configuratorState.metalColor));
}
function refreshSummary() {
  const info = getModelInfo(), color = getColor(), h = getHook(), a = getAccessory(), me = getMetal(), cat = getCategory();
  const total = computeTotal();
  $("#metaModel").textContent = `${info.name} · ${color.name}`;
  $("#metaPrice").textContent = fmtBRL(total);
  $("#summaryTotal").textContent = fmtBRL(total);
  $("#summaryList").innerHTML = `
    <li><span>Categoria</span><strong>${cat.name}</strong></li>
    <li><span>Modelo</span><strong>${info.name}</strong></li>
    <li><span>Cor</span><strong>${color.name}</strong></li>
    <li><span>Gancho</span><strong>${h.name}</strong></li>
    <li><span>Acessório inferior</span><strong>${a.name}</strong></li>
    <li><span>Cor metálica</span><strong>${me.name}</strong></li>
    <li><span>Logo</span><strong>${logoState.image ? `Personalizada · ${labelForMode(logoState.effect)}` : "Sem logo"}</strong></li>`;
}
function labelForMode(m) {
  return { laser: "Laser", silk: "Silk", deboss: "Debossed", gold: "Gold Stamp" }[m] || m;
}
function refresh() { refreshActive(); refreshSummary(); render(); }

/* =========================================================
   LOGO UPLOADER (preservado)
   ========================================================= */
function setupLogoUploader() {
  const input   = $("#logoInput");
  const drop    = $("#logoDrop");
  const browse  = $("#logoBrowseBtn");
  const preview = $("#logoPreview");
  const editor  = $("#logoEditor");
  const thumb   = $("#logoThumb");
  const nameEl  = $("#logoName");
  const statusEl = $("#logoStatus");
  const savedActions = $("#logoSavedActions");
  const remove  = $("#logoRemoveBtn");
  const editBtn = $("#logoEditBtn");
  const saveBtn = $("#logoSaveBtn");
  const cancelBtn = $("#logoCancelBtn");

  const snapshot = () => ({
    scale: logoState.scale, opacity: logoState.opacity,
    xOff: logoState.xOff, yOff: logoState.yOff,
    rotation: logoState.rotation, effect: logoState.effect,
  });
  const restore = (s) => { if (s) Object.assign(configuratorState.logo, s); };

  function syncLogoUI() {
    if (!logoState.image) {
      drop.classList.remove("hidden"); preview.classList.add("hidden");
      editor.classList.add("hidden"); savedActions.classList.add("hidden");
      overlay.hidden = true; return;
    }
    drop.classList.add("hidden"); preview.classList.remove("hidden");
    if (logoState.isEditing) {
      editor.classList.remove("hidden"); savedActions.classList.add("hidden");
      statusEl.textContent = "Editando"; statusEl.classList.remove("saved");
    } else if (logoState.isSaved) {
      editor.classList.add("hidden"); savedActions.classList.remove("hidden");
      statusEl.textContent = "Aplicada"; statusEl.classList.add("saved");
    }
    updateOverlay();
  }

  function enterEditing() {
    logoState.isEditing = true; logoState.isSaved = false;
    configuratorState.logo.savedSnapshot = snapshot();
    syncControlsFromState(); syncLogoUI(); render();
  }
  function saveEditing() {
    logoState.isEditing = false; logoState.isSaved = true;
    configuratorState.logo.savedSnapshot = null;
    syncLogoUI(); render(); toast("Logo salva");
  }
  function cancelEditing() {
    if (!configuratorState.logo.savedSnapshot) { removeLogo(); return; }
    restore(configuratorState.logo.savedSnapshot);
    logoState.isEditing = false; logoState.isSaved = true;
    configuratorState.logo.savedSnapshot = null;
    syncControlsFromState(); syncLogoUI(); render();
  }
  function removeLogo() {
    configuratorState.logo.image = null;
    configuratorState.logo.dataUrl = null;
    configuratorState.logo.name = null;
    logoState.isEditing = false; logoState.isSaved = false;
    configuratorState.logo.savedSnapshot = null;
    input.value = "";
    syncLogoUI(); refresh();
  }
  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast("Arquivo maior que 2MB");
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        configuratorState.logo.image = img;
        configuratorState.logo.dataUrl = reader.result;
        configuratorState.logo.name = file.name;
        Object.assign(configuratorState.logo, {
          scale: 0.22, opacity: 0.85, xOff: 0, yOff: 0.05, rotation: 0, effect: "laser",
          isEditing: true, isSaved: false, savedSnapshot: null,
        });
        thumb.src = reader.result; nameEl.textContent = file.name;
        syncControlsFromState(); syncLogoUI(); refresh();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  browse.addEventListener("click", () => input.click());
  input.addEventListener("change", (e) => handleFile(e.target.files[0]));
  ["dragenter", "dragover"].forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("dragover"); })
  );
  ["dragleave", "drop"].forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("dragover"); })
  );
  drop.addEventListener("drop", (e) => handleFile(e.dataTransfer.files[0]));
  remove.addEventListener("click", removeLogo);
  editBtn.addEventListener("click", enterEditing);
  saveBtn.addEventListener("click", saveEditing);
  cancelBtn.addEventListener("click", cancelEditing);

  syncLogoUIPublic = syncLogoUI;
  syncLogoUI();
}

/* ---------- TOAST ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* =========================================================
   CART SYSTEM
   ========================================================= */
const CART_KEY = "cabidesCart_v3";
const cartState = { items: [], editingId: null };
let syncLogoUIPublic = () => {};

function uid() { return "i_" + Math.random().toString(36).slice(2, 10); }
function cartLoad() {
  try { cartState.items = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cartState.items = []; }
}
function cartSave() { try { localStorage.setItem(CART_KEY, JSON.stringify(cartState.items)); } catch {} }

function serializeConfig() {
  const cfg = {
    category: configuratorState.category,
    modelNumber: configuratorState.modelNumber,
    color: configuratorState.color,
    hookModel: configuratorState.hookModel,
    metalColor: configuratorState.metalColor,
    bottomAccessory: configuratorState.bottomAccessory,
    logo: null,
  };
  if (logoState.image && configuratorState.logo.dataUrl) {
    cfg.logo = {
      dataUrl: configuratorState.logo.dataUrl,
      name: configuratorState.logo.name,
      scale: logoState.scale, opacity: logoState.opacity,
      xOff: logoState.xOff, yOff: logoState.yOff,
      rotation: logoState.rotation, effect: logoState.effect,
    };
  }
  return cfg;
}
function priceForConfig(cfg) {
  const cat = findById(CATEGORIES, cfg.category);
  const color = findById(COLORS, cfg.color);
  const h = findById(HOOKS, cfg.hookModel);
  const a = findById(ACCESSORIES, cfg.bottomAccessory || "none");
  const me = findById(METAL_COLORS, cfg.metalColor || "silver");
  return cat.basePrice + color.priceDelta + h.priceDelta + a.priceDelta + me.priceDelta;
}

function restoreConfig(cfg) {
  configuratorState.category = cfg.category || "adulto";
  configuratorState.modelNumber = cfg.modelNumber || 1;
  configuratorState.color = cfg.color || "tradicional";
  configuratorState.hookModel = cfg.hookModel || "classico";
  configuratorState.metalColor = cfg.metalColor || "silver";
  configuratorState.bottomAccessory = cfg.bottomAccessory || "none";

  if (cfg.logo) {
    const img = new Image();
    img.onload = () => {
      Object.assign(configuratorState.logo, {
        image: img, dataUrl: cfg.logo.dataUrl, name: cfg.logo.name || "logo.png",
        scale: cfg.logo.scale, opacity: cfg.logo.opacity,
        xOff: cfg.logo.xOff, yOff: cfg.logo.yOff, rotation: cfg.logo.rotation,
        effect: cfg.logo.effect || "laser",
        isEditing: false, isSaved: true, savedSnapshot: null,
      });
      $("#logoThumb").src = cfg.logo.dataUrl;
      $("#logoName").textContent = configuratorState.logo.name;
      syncControlsFromState(); syncLogoUIPublic();
      buildModelOptions(); buildColorOptions(); refresh();
    };
    img.src = cfg.logo.dataUrl;
  } else {
    Object.assign(configuratorState.logo, {
      image: null, dataUrl: null, name: null,
      isEditing: false, isSaved: false, savedSnapshot: null,
    });
    $("#logoInput").value = "";
    syncLogoUIPublic();
    buildModelOptions(); buildColorOptions(); refresh();
  }
}

function resetConfigurator() {
  configuratorState.category = "adulto";
  configuratorState.modelNumber = 1;
  configuratorState.color = "tradicional";
  configuratorState.hookModel = "classico";
  configuratorState.metalColor = "silver";
  configuratorState.bottomAccessory = "none";
  Object.assign(configuratorState.logo, {
    image: null, dataUrl: null, name: null,
    scale: 0.22, opacity: 0.85, xOff: 0, yOff: 0.05,
    rotation: 0, effect: "laser",
    isEditing: false, isSaved: false, savedSnapshot: null,
  });
  const input = $("#logoInput"); if (input) input.value = "";
  syncControlsFromState();
  syncLogoUIPublic();
  buildModelOptions();
  buildColorOptions();
  refresh();
}

/* ---------- mini-render p/ carrinho ---------- */
async function renderItemPreview(canvasEl, cfg) {
  const hook = findById(HOOKS, cfg.hookModel);
  const accessory = findById(ACCESSORIES, cfg.bottomAccessory || "none");
  const metal = findById(METAL_COLORS, cfg.metalColor || "silver");
  const hangerSrc = getHangerImage(cfg.category, cfg.modelNumber, cfg.color);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvasEl.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvasEl.width !== w || canvasEl.height !== h) { canvasEl.width = w; canvasEl.height = h; }
  const c = canvasEl.getContext("2d");
  c.clearRect(0, 0, w, h);
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";

  try {
    const [baseImg, hookImg, accImg, logoImg] = await Promise.all([
      loadImage(hangerSrc), loadImage(hook.image),
      accessory.image ? loadImage(accessory.image) : Promise.resolve(null),
      cfg.logo ? loadImage(cfg.logo.dataUrl) : Promise.resolve(null),
    ]);
    const fit = fitHangerLayer(baseImg, w, h);
    c.drawImage(baseImg, fit.dx, fit.dy, fit.dw, fit.dh);
    const hangerBox = { ...fit };
    const colorObj = findById(COLORS, cfg.color);
    if (logoImg) drawLogoVariant(c, baseImg, hangerBox, logoImg, cfg.logo, colorObj.isDark);
    if (accImg) drawAccessoryOnBottom(c, accImg, baseImg, hangerBox, accessory, metal);
    drawHookOnTop(c, hookImg, baseImg, hangerBox, hook, metal);
  } catch {
    c.fillStyle = "#efeae2"; c.fillRect(0, 0, w, h);
  }
}

/* ---------- cart UI ---------- */
const cartCount = () => cartState.items.reduce((s, it) => s + it.quantity, 0);
const cartSubtotal = () => cartState.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

function updateCartBadge() {
  const el = $("#cartCount"); const n = cartCount();
  if (n <= 0) { el.hidden = true; el.textContent = "0"; }
  else { el.hidden = false; el.textContent = String(n); }
}
function logoBadge(cfg) { return cfg.logo ? `Logo · ${labelForMode(cfg.logo.effect)}` : "Sem logo"; }

function renderCart() {
  const empty = $("#cartEmpty"); const list = $("#cartItems"); const foot = $("#cartDrawerFoot");
  if (cartState.items.length === 0) {
    empty.classList.remove("hidden"); list.innerHTML = ""; foot.hidden = true;
    $("#cartDrawerTitle").textContent = "Carrinho"; updateCartBadge(); return;
  }
  empty.classList.add("hidden"); foot.hidden = false;
  $("#cartDrawerTitle").textContent = `Carrinho · ${cartCount()} ${cartCount() === 1 ? "item" : "itens"}`;
  list.innerHTML = cartState.items.map((it) => {
    const info = MODEL_INFO[it.category][it.modelNumber];
    const color = findById(COLORS, it.color);
    const a = findById(ACCESSORIES, it.bottomAccessory || "none");
    const me = findById(METAL_COLORS, it.metalColor || "silver");
    const subtotal = it.unitPrice * it.quantity;
    return `
      <li class="cart-item ${cartState.editingId === it.id ? "editing" : ""}" data-id="${it.id}">
        <div class="cart-item-thumb"><canvas data-preview="${it.id}"></canvas></div>
        <div class="cart-item-body">
          <div class="cart-item-title"><strong>${info.name}</strong><span class="price">${fmtBRL(subtotal)}</span></div>
          <div class="cart-item-meta">
            <span>${color.name}</span><span>${me.name}</span>
            ${a.id !== "none" ? `<span>${a.name}</span>` : ""}
            <span>${logoBadge(it)}</span>
          </div>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button data-act="dec" aria-label="Diminuir">−</button>
              <span>${it.quantity}</span>
              <button data-act="inc" aria-label="Aumentar">+</button>
            </div>
            <div class="cart-item-links">
              <button data-act="edit">Editar</button>
              <button class="danger" data-act="remove">Remover</button>
            </div>
          </div>
        </div>
      </li>`;
  }).join("");

  const sub = cartSubtotal();
  const shipping = sub >= 200 ? 0 : 19.9;
  $("#cartSubtotal").textContent = fmtBRL(sub);
  $("#cartShipping").textContent = shipping === 0 ? "Grátis" : fmtBRL(shipping);
  $("#cartTotal").textContent = fmtBRL(sub + shipping);
  cartState.items.forEach((it) => {
    const cv = list.querySelector(`canvas[data-preview="${it.id}"]`);
    if (cv) renderItemPreview(cv, it);
  });
  updateCartBadge();
}

function openCart() {
  $("#cartDrawer").hidden = false; $("#drawerBackdrop").hidden = false;
  requestAnimationFrame(() => {
    $("#cartDrawer").classList.add("open"); $("#drawerBackdrop").classList.add("open");
  });
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  $("#cartDrawer").classList.remove("open"); $("#drawerBackdrop").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => { $("#cartDrawer").hidden = true; $("#drawerBackdrop").hidden = true; }, 360);
}

function setEditingBanner() {
  const banner = $("#editBanner"); const btn = $("#addCartBtn");
  if (cartState.editingId) {
    const it = cartState.items.find((x) => x.id === cartState.editingId);
    const info = it && MODEL_INFO[it.category]?.[it.modelNumber];
    banner.classList.remove("hidden");
    $("#editBannerSub").textContent = info ? `Item: ${info.name}` : "Ajuste e salve para atualizar.";
    btn.textContent = "Salvar alterações";
  } else {
    banner.classList.add("hidden");
    btn.textContent = "Adicionar ao carrinho";
  }
}

function addOrUpdateCart() {
  const cfg = serializeConfig();
  const unitPrice = priceForConfig(cfg);
  if (cartState.editingId) {
    const idx = cartState.items.findIndex((x) => x.id === cartState.editingId);
    if (idx >= 0) cartState.items[idx] = { ...cartState.items[idx], ...cfg, unitPrice };
    cartState.editingId = null;
    cartSave(); renderCart(); setEditingBanner(); resetConfigurator();
    toast("Item atualizado"); openCart();
  } else {
    cartState.items.push({ id: uid(), ...cfg, quantity: 1, unitPrice });
    cartSave(); renderCart(); resetConfigurator();
    toast("Adicionado ao carrinho");
    const btn = $("#cartBtn");
    btn.classList.remove("pulse"); void btn.offsetWidth; btn.classList.add("pulse");
    openCart();
  }
}

function setupCart() {
  cartLoad(); renderCart(); updateCartBadge(); setEditingBanner();
  $("#cartBtn").addEventListener("click", openCart);
  $("#cartCloseBtn").addEventListener("click", closeCart);
  $("#drawerBackdrop").addEventListener("click", closeCart);
  $("#continueShoppingBtn").addEventListener("click", closeCart);
  $("#cartEmptyCta").addEventListener("click", () => { closeCart(); Wizard.open(1); });

  $("#cartItems").addEventListener("click", (e) => {
    const li = e.target.closest(".cart-item"); if (!li) return;
    const id = li.dataset.id;
    const act = e.target.closest("[data-act]")?.dataset.act; if (!act) return;
    const it = cartState.items.find((x) => x.id === id); if (!it) return;
    if (act === "inc") it.quantity = Math.min(99, it.quantity + 1);
    else if (act === "dec") it.quantity = Math.max(1, it.quantity - 1);
    else if (act === "remove") {
      cartState.items = cartState.items.filter((x) => x.id !== id);
      if (cartState.editingId === id) { cartState.editingId = null; setEditingBanner(); }
    } else if (act === "edit") {
      cartState.editingId = id; restoreConfig(it); setEditingBanner();
      closeCart(); Wizard.open(1); return cartSave();
    }
    cartSave(); renderCart();
  });

  $("#editCancelBtn").addEventListener("click", () => {
    cartState.editingId = null; setEditingBanner(); resetConfigurator();
    toast("Edição cancelada");
  });
}

/* ---------- INIT ---------- */
function init() {
  buildModelOptions();
  buildColorOptions();
  buildHookOptions();
  buildAccessoryOptions();
  buildMetalOptions();
  buildModelsGrid();
  setupOptionGridHandlers();
  setupLogoUploader();
  setupControls();
  setupEditorInteractions();
  setupCart();
  Wizard.init();

  $("#addCartBtn").addEventListener("click", addOrUpdateCart);
  window.addEventListener("resize", () => render());

  syncControlsFromState();
  refresh();
}
document.addEventListener("DOMContentLoaded", init);

/* =========================================================
   WIZARD CONTROLLER — 7 steps (preservado)
   ========================================================= */
const Wizard = (() => {
  const wState = { currentStep: 1, totalSteps: 7, isOpen: false, visited: new Set([1]) };
  let modal, stepsRoot, progressEl, backBtn, nextBtn, nextLabel, stepNumEl;
  let transitionLock = false;

  function init() {
    modal      = $("#wizard");
    stepsRoot  = $("#wizardSteps");
    progressEl = $("#wizardProgress");
    backBtn    = $("#wizardBackBtn");
    nextBtn    = $("#wizardNextBtn");
    nextLabel  = $("#wizardNextLabel");
    stepNumEl  = $("#wizardStepNum");
    if (!modal) return;

    $("#openConfigBtn")?.addEventListener("click", () => open(1));
    modal.querySelectorAll("[data-wizard-close]").forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (!wState.isOpen) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" && !nextBtn.disabled) next();
      else if (e.key === "ArrowLeft" && wState.currentStep > 1) back();
    });
    backBtn.addEventListener("click", back);
    nextBtn.addEventListener("click", () => {
      if (wState.currentStep === wState.totalSteps) $("#addCartBtn").click();
      else next();
    });
    progressEl.addEventListener("click", (e) => {
      const li = e.target.closest("li[data-step]"); if (!li) return;
      const target = parseInt(li.dataset.step, 10);
      if (wState.visited.has(target)) goTo(target);
    });

    showStep(1, { animate: false });
    updateProgress(); updateNav();
  }

  function open(stepNum = 1) {
    if (wState.isOpen) { goTo(stepNum); return; }
    wState.isOpen = true;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => modal.classList.add("open"));
    goTo(stepNum, { animate: false });
    requestAnimationFrame(() => requestAnimationFrame(() => render()));
  }
  function close() {
    if (!wState.isOpen) return;
    wState.isOpen = false;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(() => { modal.hidden = true; }, 320);
  }
  function next() { if (wState.currentStep < wState.totalSteps) goTo(wState.currentStep + 1); }
  function back() { if (wState.currentStep > 1) goTo(wState.currentStep - 1, { direction: "back" }); }

  function goTo(stepNum, opts = {}) {
    if (transitionLock) return;
    if (stepNum === wState.currentStep && opts.animate !== false) return;
    if (stepNum < 1 || stepNum > wState.totalSteps) return;
    const direction = opts.direction || (stepNum > wState.currentStep ? "fwd" : "back");
    showStep(stepNum, { animate: opts.animate !== false, direction });
    wState.currentStep = stepNum;
    configuratorState.currentStep = stepNum;
    wState.visited.add(stepNum);
    if (stepNum === 2) buildColorOptions();
    updateProgress(); updateNav();
    stepsRoot.scrollTop = 0;
    render();
  }
  function showStep(stepNum, { animate = true, direction = "fwd" } = {}) {
    const current = stepsRoot.querySelector(".wizard-step.active");
    const target  = stepsRoot.querySelector(`.wizard-step[data-step="${stepNum}"]`);
    if (!target) return;
    if (!animate || !current || current === target) {
      stepsRoot.querySelectorAll(".wizard-step").forEach((s) => s.classList.remove("active", "leaving", "back-in", "back-out"));
      target.classList.add("active"); return;
    }
    transitionLock = true;
    const backClass = direction === "back";
    current.classList.remove("active"); current.classList.add("leaving");
    if (backClass) current.classList.add("back-out");
    target.classList.add("active");
    if (backClass) target.classList.add("back-in");
    setTimeout(() => {
      current.classList.remove("leaving", "back-out");
      target.classList.remove("back-in");
      transitionLock = false;
    }, 460);
  }
  function updateProgress() {
    [...progressEl.children].forEach((li) => {
      const n = parseInt(li.dataset.step, 10);
      li.classList.toggle("active", n === wState.currentStep);
      li.classList.toggle("done", n < wState.currentStep);
    });
    stepNumEl.textContent = String(wState.currentStep);
  }
  function updateNav() {
    backBtn.style.visibility = wState.currentStep === 1 ? "hidden" : "visible";
    if (wState.currentStep === wState.totalSteps) {
      nextLabel.textContent = cartState.editingId ? "Salvar alterações" : "Adicionar ao carrinho";
    } else {
      nextLabel.textContent = "Continuar";
    }
  }
  function refreshNav() { updateNav(); }
  return { init, open, close, next, back, goTo, refreshNav, state: wState };
})();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoSkipBtn")?.addEventListener("click", () => Wizard.next());
});
