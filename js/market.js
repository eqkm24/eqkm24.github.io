/* ==========================================================================
   market.js — 거래소 시세 검색
   기린월드 거래소 시세 (https://giraffemc.com/market-prices) 는 아직 공개된
   데이터 주소(JSON)가 없어서, 지금은
     · 검색어를 복사하고 거래소 시세 페이지를 새 탭으로 열고
     · 내 페이지에 있는 상점 판매가 · 재료 단가를 바로 옆에 보여 줍니다.
   공개 데이터 주소가 생기면 MARKET_URL 에 넣기만 하면 이 칸 안에서 바로 결과가 나옵니다.
   ========================================================================== */
import * as store from './store.js';
import { KEYS } from './store.js';
import { ELIXIRS, GRADE_KEYS, GRADE_NAME, gkey } from './data.js';
import { elixirIngredients, fmtNum } from './calc.js';
import { $$, esc, toast, icon } from './ui.js';

export const MARKET_PAGE = 'https://giraffemc.com/market-prices';
/* 공개 JSON 주소가 생기면 여기에 (예: 'https://giraffemc.com/market-prices.json') */
export const MARKET_URL = null;
const FEE = 3;   // 거래소 수수료 % (VIP 2 · MVP 1)

const norm = s => String(s || '').replace(/\s+/g, '').replace(/의비약$/, '');
const ING_NAMES = [...new Set(ELIXIRS.flatMap(elixirIngredients).map(i => i.name))];
const CATALOG = [...ELIXIRS.map(e => `${e.name}의 비약`), ...ING_NAMES];

let remote = null, remoteAt = 0;
async function loadRemote() {
  if (!MARKET_URL) return null;
  if (remote && Date.now() - remoteAt < 60e3) return remote;
  const res = await fetch(MARKET_URL, { cache: 'no-store' });
  const j = await res.json();
  remote = Array.isArray(j) ? j : (j.items || j.data || []);
  remoteAt = Date.now();
  return remote;
}
const num = (...v) => { for (const x of v) if (x != null && x !== '' && Number.isFinite(+x)) return +x; return null; };

/* 내 페이지에 있는 값 (상점 판매가 · 재료 단가) */
function localRefs(q) {
  const n = norm(q);
  if (!n) return [];
  const out = [];
  const ep = store.get(KEYS.elixirPrices, {});
  for (const e of ELIXIRS) {
    if (!norm(e.name).includes(n) && !n.includes(norm(e.name))) continue;
    const g = GRADE_KEYS.map(k => ({ k, p: ep[gkey(e.name, k)]?.price })).filter(x => x.p);
    out.push({ name: `${e.name}의 비약`, ico: e.name, html: g.length
      ? g.map(x => `<span class="gchip g-${x.k}">${GRADE_NAME[x.k]}</span> <b class="num">${fmtNum(x.p)}</b>`).join(' ')
      : '<span class="faint">상점 시세 없음</span>' });
  }
  const ip = store.get(KEYS.ingPrices, {});
  for (const name of ING_NAMES) {
    if (!norm(name).includes(n)) continue;
    out.push({ name, ico: name, html: ip[name] ? `단가 <b class="num">${fmtNum(ip[name])}</b>` : '<span class="faint">단가 없음</span>' });
  }
  return out.slice(0, 6);
}

function render(box) {
  const q = box.querySelector('.mk-q')?.value ?? box.dataset.q ?? '';
  const recent = store.get('marketRecent', []) || [];
  const refs = localRefs(q);
  box.querySelector('.mk-out').innerHTML = `
    ${q && refs.length ? `<div class="mk-refs"><div class="kpi-k">내 페이지 시세 <span class="faint">상점 판매가 · 재료 단가</span></div>
      ${refs.map(r => `<div class="mk-ref">${icon(r.ico, 's')}<span class="nm">${esc(r.name)}</span><span class="spacer"></span><span class="mk-v">${r.html}</span></div>`).join('')}</div>` : ''}
    ${recent.length ? `<div class="mk-recent"><span class="faint">최근</span>${recent.map(r => `<button type="button" class="chip" data-mk-recent="${esc(r)}">${esc(r)}</button>`).join('')}</div>` : ''}
    <p class="note">거래소 시세는 아직 공개 데이터가 없어서 <b>검색어를 복사한 뒤 거래소 시세 페이지를 새 탭으로 열어요</b>. 열린 페이지 검색칸에 붙여넣기(Ctrl+V)만 하면 돼요. 거래소 수수료는 ${FEE}% (VIP 2% · MVP 1%)예요.</p>`;
}

async function search(box, q) {
  q = q.trim();
  if (!q) { toast('찾을 이름을 넣어 주세요'); return; }
  store.set('marketRecent', [q, ...(store.get('marketRecent', []) || []).filter(x => x !== q)].slice(0, 6));
  if (MARKET_URL) {
    try {
      const rows = (await loadRemote()).filter(it => norm(it.name || it.itemName).includes(norm(q))).slice(0, 8);
      box.querySelector('.mk-live').innerHTML = rows.length ? rows.map(it => `
        <div class="mk-ref">${icon(it.name || it.itemName, 's')}<span class="nm">${esc(it.name || it.itemName)}</span><span class="spacer"></span>
          <b class="num">${fmtNum(num(it.price, it.avgPrice, it.lowestPrice, it.minPrice) || 0)}</b></div>`).join('')
        : '<div class="empty">거래소에 그 이름이 없어요</div>';
      return;
    } catch { /* 실패하면 페이지 열기로 */ }
  }
  try { await navigator.clipboard.writeText(q); toast(`“${q}” 복사했어요 · 거래소 검색칸에 붙여넣기`); } catch { toast('거래소 시세 페이지를 열어요'); }
  window.open(MARKET_PAGE, '_blank', 'noopener');
}

export function renderMarket() { $$('[data-market]').forEach(render); }

export function initMarket() {
  $$('[data-market]').forEach(box => {
    const id = box.dataset.market;
    box.innerHTML = `
      <form class="mk-form" autocomplete="off">
        <input class="input grow mk-q" type="search" list="mkList-${id}" placeholder="아이템 이름 (예: 다이아몬드, 화덕의 비약)" aria-label="거래소에서 찾을 아이템">
        <datalist id="mkList-${id}">${CATALOG.map(n => `<option value="${esc(n)}">`).join('')}</datalist>
        <button class="btn btn-gold" type="submit">검색</button>
      </form>
      <div class="mk-live"></div>
      <div class="mk-out"></div>
      <a class="mk-link" href="${MARKET_PAGE}" target="_blank" rel="noopener">거래소 시세 페이지 바로 열기 ↗</a>`;
    const inp = box.querySelector('.mk-q');
    box.querySelector('form').addEventListener('submit', e => { e.preventDefault(); search(box, inp.value); });
    inp.addEventListener('input', () => render(box));
    box.addEventListener('click', e => {
      const r = e.target.closest('[data-mk-recent]');
      if (r) { inp.value = r.dataset.mkRecent; render(box); search(box, inp.value); }
    });
    render(box);
  });
  store.on('marketRecent', renderMarket);
  store.on(KEYS.elixirPrices, renderMarket);
}
