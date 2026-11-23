/* ==========================================================================
   live.js — 기린월드 공식 변동 시세 자동 반영
   https://giraffemc.com/prices.json  (로그인 없음 · CORS 허용 · 약 30초마다 갱신)

   · 2분마다 (그리고 상점 가격이 바뀌는 시각 직후) 불러옵니다. 창이 숨겨져 있으면 쉽니다.
   · 요리사 상점 → 요리 판매가, 연금술사 상점 → 비약 판매가,
     그 밖의 상점(농부 · 목수 · 어부 등) → 재료 단가 에 '일반' 등급 가격을 넣습니다.
   · 값이 바뀐 품목만 저장하므로 Firebase 에도 바뀐 것만 올라갑니다.
   · 등급별 가격(일반 · 고급 · 희귀)은 이 브라우저에만 보관해 화면에 보여줍니다.
   · 필드 이름이 조금 바뀌어도 읽히도록 여러 이름을 함께 봅니다.
   ========================================================================== */
import * as store from './store.js';
import { KEYS } from './store.js';
import { RECIPES, ELIXIRS, GRADE_KEYS, gkey } from './data.js';
import { cycleInfo, recipeIngredients, elixirIngredients } from './calc.js';

export const LIVE_URL = 'https://giraffemc.com/prices.json';
/* 연금술사 상점만 받아 트래픽을 줄임 (비면 전체로 다시 시도) */
const LIVE_URL_ALCH = `${LIVE_URL}?shop=${encodeURIComponent('연금술사 상점')}`;
const POLL_MS = 120e3;
const GRADE = { common: 'common', uncommon: 'uncommon', rare: 'rare', 일반: 'common', 고급: 'uncommon', 희귀: 'rare' };
export const GRADE_LABEL = { common: '무별', uncommon: '은별', rare: '금별' };
/* 공식 시세 이름 → 위키(이 페이지) 이름 */
const ALIAS = { '아카시아 심재': '아카시아나무 심재', '가문비 심재': '가문비나무 심재', '정글 심재': '정글나무 심재', '맹그로브 심재': '맹그로브나무 심재' };

const norm = s => String(s || '').replace(/\s+/g, '');
const COOK = new Map(RECIPES.map(r => [norm(r.name), r.name]));
const ELIX = new Map(ELIXIRS.map(e => [norm(e.name), e.name]));
const ING = new Map([...RECIPES.flatMap(recipeIngredients), ...ELIXIRS.flatMap(elixirIngredients)].map(i => [norm(i.name), i.name]));

/* 상태 */
let state = { status: 'idle', at: 0, nextChangeAt: 0, counts: { cook: 0, elixir: 0, ing: 0 }, unmatched: [], error: '' };
const subs = new Set();
export const liveState = () => state;
export function onLive(fn) { subs.add(fn); return () => subs.delete(fn); }
function setState(p) { state = { ...state, ...p }; subs.forEach(fn => fn(state)); }

/* 등급별 가격 (이 브라우저만) */
export const liveGrades = () => store.get(KEYS.live, { cook: {}, elixir: {}, ing: {} });

function kindOf(it) {
  const s = `${it.shop || ''} ${it.shopName || ''} ${it.shopId || ''}`;
  if (/요리|COOK/i.test(s)) return 'cook';
  if (/연금|ALCHEM/i.test(s)) return 'elixir';
  return 'ing';
}
function baseNameOf(it) {
  return String(it.baseName || it.name || '').trim().replace(/^(신선한|최상급)\s+/, '');
}
const numOr = (...v) => { for (const x of v) if (x != null && x !== '' && Number.isFinite(+x)) return +x; return null; };

export function applyLive(json) {
  const items = Array.isArray(json) ? json : (json.items || []);
  const grades = { cook: {}, elixir: {}, ing: {} };
  const unmatched = new Set();

  for (const it of items) {
    const kind = kindOf(it);
    let name = baseNameOf(it);
    let key = null;
    if (kind === 'cook') continue;                 // 요리는 쓰지 않음
    else if (kind === 'elixir') key = ELIX.get(norm(name.replace(/의\s*비약$/, '')));
    else key = ING.get(norm(ALIAS[name] || name));
    const price = numOr(it.price, it.currentPrice, it.price?.current);
    if (!key || price == null) { if (kind !== 'ing') unmatched.add(it.name || name); continue; }
    const g = GRADE[it.gradeId] || GRADE[it.grade] || 'common';
    (grades[kind][key] = grades[kind][key] || {})[g] = {
      price, base: numOr(it.basePrice, it.price?.base), pct: numOr(it.changePercent, it.change?.percent), trend: it.trend || 'same',
    };
  }
  if (JSON.stringify(grades) !== JSON.stringify(liveGrades())) store.set(KEYS.live, grades);   // 바뀔 때만

  /* 비약: 무별 · 은별 · 금별 가격을 각각 판매가에 반영 / 재료: 일반 등급 — 바뀐 것만 */
  const pick = m => (m.common || m.uncommon || m.rare).price;
  const at = Date.parse(json.updatedAt) || Date.now();
  const cycleStart = cycleInfo().start;
  const putProducts = (key, src) => {
    const cur = store.get(key, {});
    let changed = false;
    const next = { ...cur };
    for (const [name, m] of Object.entries(src)) for (const g of GRADE_KEYS) {
      if (!m[g]) continue;
      const k = gkey(name, g), p = m[g].price, e = cur[k];
      if (!e || e.price !== p || e.at < cycleStart) { next[k] = { price: p, at, auto: true }; changed = true; }
    }
    if (changed) store.set(key, next);
  };
  putProducts(KEYS.elixirPrices, grades.elixir);
  const ip = store.get(KEYS.ingPrices, {});
  const ipNext = { ...ip }; let ipChanged = false;
  for (const [name, m] of Object.entries(grades.ing)) { const p = pick(m); if (ip[name] !== p) { ipNext[name] = p; ipChanged = true; } }
  if (ipChanged) store.set(KEYS.ingPrices, ipNext);

  const shops = Array.isArray(json.shops) ? json.shops : Object.values(json.shops || {});
  const next = shops.map(s => Date.parse(s.nextChangeAt)).filter(Number.isFinite).sort((a, b) => a - b)[0] || 0;
  setState({
    status: 'online', at, nextChangeAt: next, error: '',
    counts: { cook: Object.keys(grades.cook).length, elixir: Object.keys(grades.elixir).length, ing: Object.keys(grades.ing).length },
    unmatched: [...unmatched],
  });
  return grades;
}

let timer = null;
async function poll() {
  clearTimeout(timer);
  if (document.hidden) { timer = setTimeout(poll, POLL_MS); return; }
  try {
    let res = await fetch(LIVE_URL_ALCH, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let json = await res.json();
    if (!(json.items || []).length) {              // 상점 이름이 바뀌었으면 전체로
      res = await fetch(LIVE_URL, { cache: 'no-store' });
      json = await res.json();
    }
    applyLive(json);
  } catch (e) {
    setState({ status: 'error', error: state.at ? '최근 불러오기에 실패했어요. 잠시 뒤 다시 시도해요' : '공식 시세를 불러오지 못했어요 (이 주소에서는 외부 연결이 막혀 있을 수 있어요)' });
  }
  // 다음: 2분 뒤, 또는 상점 가격이 바뀌는 시각 + 20초 중 빠른 쪽
  const toChange = state.nextChangeAt ? state.nextChangeAt - Date.now() + 20e3 : Infinity;
  timer = setTimeout(poll, Math.max(15e3, Math.min(POLL_MS, toChange)));
}

export function initLive() {
  setState({ status: 'loading' });
  poll();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
}
export const refreshLive = () => poll();
