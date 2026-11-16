/* ==========================================================================
   ui.js — 화면 공용 도우미 (DOM · 토스트 · 시세 신선도 · 계산 컨텍스트)
   ========================================================================== */
import * as store from './store.js';
import { KEYS, DEFAULTS } from './store.js';
import { cycleInfo, stationsFor, tierFor, elixirValue, queueFor, alchLvEffects } from './calc.js';
import { MAX_LV, ICONS, ICON_BASE } from './data.js';

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ── 아이콘 ──
   size: 's'(22) · 'm'(30) · 'l'(52). 이미지가 없거나 못 불러오면 첫 글자 배지. */
const ICON_HUE = ['#ffd84a', '#ffb88a', '#9ee0b8', '#9fd0ff', '#d2b8ff', '#ffc2d6'];
export function iconUrl(name) {
  const f = ICONS[name];
  return f ? (/^https?:/.test(f) ? f : ICON_BASE + f) : '';
}
export function icon(name, size = 'm') {
  const url = iconUrl(name);
  const ch = esc(String(name).replace(/^(강화된|순수한|짙은|창백한)\s*/, '').trim().charAt(0));
  const hue = ICON_HUE[[...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % ICON_HUE.length];
  return `<span class="ico ico-${size}${url ? '' : ' is-fallback'}" style="--ico-bg:${hue}" data-ch="${ch}" aria-hidden="true">${
    url ? `<img class="ico-img" src="${esc(url)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}</span>`;
}
/* 이미지 실패 → 배지로 (캡처 단계에서 한 번에 처리) */
document.addEventListener('error', e => {
  const img = e.target;
  if (img instanceof HTMLImageElement && img.classList.contains('ico-img')) {
    img.parentElement.classList.add('is-fallback');
    img.remove();
  }
}, true);

let toastTimer;
export function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
}

/* ── 프로필 · 옵션 ── */
export const profile  = () => ({ ...DEFAULTS.profile,  ...store.get(KEYS.profile,  {}) });
export const cookOpts = () => ({ ...DEFAULTS.cookOpts, ...store.get(KEYS.cookOpts, {}) });
export const alchOpts = () => ({ ...DEFAULTS.alchOpts, ...store.get(KEYS.alchOpts, {}) });

export function patch(key, partial) {
  const defaults = { [KEYS.profile]: DEFAULTS.profile, [KEYS.cookOpts]: DEFAULTS.cookOpts, [KEYS.alchOpts]: DEFAULTS.alchOpts }[key] || {};
  store.update(key, defaults, cur => ({ ...defaults, ...cur, ...partial }));
}

export const clampLv = v => Math.min(MAX_LV, Math.max(1, Math.round(+v || 1)));

/* 계산기에 넘길 옵션 묶음 */
export function cookContext() {
  const p = profile(), o = cookOpts();
  return {
    lv: p.cookLv,
    stations: p.cookStations || stationsFor(p.cookLv),
    autoStations: stationsFor(p.cookLv),
    prepAll: o.prepAll,
    hearthPct: elixirValue('화덕', o.hearth),
    gourmetPct: elixirValue('미식', o.gourmet),
    bonusPct: o.bonusPct,
    scaleIngredients: o.scaleIngredients,
    tier: tierFor(p.cookLv),
  };
}
export function alchContext() {
  const p = profile(), o = alchOpts();
  return {
    lv: p.alchLv,
    stations: p.alchStations || stationsFor(p.alchLv),
    autoStations: stationsFor(p.alchLv),
    queue: queueFor(p.alchLv),
    powders: o.powders,
    bonusPct: o.bonusPct,
    scaleIngredients: o.scaleIngredients,
    tier: tierFor(p.alchLv),
    lvFx: alchLvEffects(p.alchLv),
  };
}

/* ── 시세 ── */
export const ingPrices    = () => store.get(KEYS.ingPrices, {});
export const cookPrices   = () => store.get(KEYS.cookPrices, {});
export const elixirPrices = () => store.get(KEYS.elixirPrices, {});
export const priceOf = (map, name) => map[name]?.price ?? 0;

export function setProductPrice(key, name, price) {
  store.update(key, {}, m => {
    const v = Math.max(0, Math.round(+price || 0));
    if (!v) delete m[name]; else m[name] = { price: v, at: Date.now() };
    return m;
  });
}
export function setIngPrice(name, price) {
  store.update(KEYS.ingPrices, {}, m => {
    const v = Math.max(0, +price || 0);
    if (!v) delete m[name]; else m[name] = v;
    return m;
  });
}

/* 이번 3시간 주기에 입력한 값인지 */
export function freshness(entry) {
  if (!entry) return 'none';
  return entry.at >= cycleInfo().start ? 'fresh' : 'stale';
}
export function freshChip(entry) {
  const f = freshness(entry);
  if (f === 'fresh') return '<span class="chip fresh">이번 시세</span>';
  if (f === 'stale') return '<span class="chip stale">지난 시세</span>';
  return '';
}

/* ── 3시간 주기 띠 ── */
export function renderCycleStrip(el) {
  const c = cycleInfo();
  el.innerHTML = Array.from({ length: 8 }, (_, i) => {
    const h = String(i * 3).padStart(2, '0');
    if (i < c.index) return `<div class="cycle-cell past"><span>${h}시</span></div>`;
    if (i === c.index) return `<div class="cycle-cell now"><i style="width:${(c.progress * 100).toFixed(1)}%"></i><span>${h}시</span></div>`;
    return `<div class="cycle-cell"><span>${h}시</span></div>`;
  }).join('');
}

/* ── 숫자 입력 + 스테퍼 ── */
export function stepper(id, value, { min = 1, max = MAX_LV, label }) {
  return `
    <div class="field">
      <label for="${id}">${esc(label)}</label>
      <div class="stepper" data-stepper="${id}" data-min="${min}" data-max="${max}">
        <button class="btn btn-icon" type="button" data-step="-1" aria-label="${esc(label)} 1 낮추기">−</button>
        <input class="input num" id="${id}" type="number" inputmode="numeric" min="${min}" max="${max}" value="${value}">
        <button class="btn btn-icon" type="button" data-step="1" aria-label="${esc(label)} 1 올리기">+</button>
      </div>
    </div>`;
}
/* 스테퍼 버튼 → 입력값 변경 후 change 이벤트 발생 */
export function wireSteppers(root) {
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-step]');
    if (!b) return;
    const wrap = b.closest('[data-stepper]');
    const input = wrap.querySelector('input');
    const min = +wrap.dataset.min, max = +wrap.dataset.max;
    input.value = Math.min(max, Math.max(min, (+input.value || 0) + +b.dataset.step));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

/* 두 번 눌러야 실행되는 버튼 (confirm 대신) */
export function armButton(btn, label, onConfirm) {
  if (btn.dataset.armed) {
    clearTimeout(+btn.dataset.armed);
    delete btn.dataset.armed;
    btn.textContent = label;
    onConfirm();
    return;
  }
  btn.textContent = '한 번 더 누르면 실행';
  btn.dataset.armed = setTimeout(() => { delete btn.dataset.armed; btn.textContent = label; }, 3000);
}
