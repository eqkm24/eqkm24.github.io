/* ==========================================================================
   store.js — 브라우저 저장 (localStorage) 래퍼
   저장이 막힌 환경(시크릿 창 등)에서도 페이지가 동작하도록 모두 try/catch.
   키 구조를 바꿀 땐 PREFIX 버전을 올리세요.
   ========================================================================== */

const PREFIX = 'miru.v1.';
const memory = {};               // 저장이 막혔을 때 쓰는 임시 보관소
const listeners = new Map();     // key → Set<fn>

export function get(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) { /* 무시 */ }
  return key in memory ? memory[key] : fallback;
}

/* 저장할 때마다 불리는 바깥 훅 (Firebase 연동이 씀 → sync.js) */
let writeHook = null;
export function setWriteHook(fn) { writeHook = fn; }

/** opts.fromRemote: 서버에서 받은 값이면 true → 다시 서버로 보내지 않음 */
export function set(key, value, opts = {}) {
  const prev = get(key, undefined);
  memory[key] = value;
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* 무시 */ }
  if (!opts.fromRemote && writeHook) writeHook(key, value, prev);
  (listeners.get(key) || []).forEach(fn => fn(value));
}

export function update(key, fallback, fn) {
  const next = fn(structuredClone(get(key, fallback)));
  set(key, next);
  return next;
}

export function on(key, fn) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(fn);
  return () => listeners.get(key).delete(fn);
}

/* ── 앱에서 쓰는 키와 기본값 한 곳에 모음 ── */
export const KEYS = {
  profile:      'profile',       // { cookLv, alchLv, cookStations, alchStations }
  cookOpts:     'cookOpts',      // 요리 계산 옵션
  alchOpts:     'alchOpts',      // 연금 계산 옵션
  ingPrices:    'ingPrices',     // { 재료명: 단가 }
  cookPrices:   'cookPrices',    // { 요리명: { price, at } }
  elixirPrices: 'elixirPrices',  // { 비약명: { price, at } }
  settings:     'settings',      // 화면 설정 → settings.js
  alarms:       'alarms',        // [{ id, label, mode, nextAt, on, ... }] → view-alarm.js
};

export const DEFAULTS = {
  profile:  { cookLv: 1, alchLv: 1, cookStations: null, alchStations: null },
  cookOpts: { prepAll: true, hearth: -1, gourmet: -1, bonusPct: 0, scaleIngredients: true, stage: 'all', unlockedOnly: false, sort: 'hourly' },
  alchOpts: { powders: 2, bonusPct: 0, scaleIngredients: true, tier: 'all', unlockedOnly: false, sort: 'hourly' },
};
