/* ==========================================================================
   view-prices.js — 시세 · 단가 모아보기 + 디스코드 시세 붙여넣기
   카테고리: 비약 판매가 (무별 · 은별 · 금별) · 연금 재료
   비약 판매가는 '화덕' · '화덕|uncommon' · '화덕|rare' 키로 따로 저장합니다.
   ========================================================================== */
import { ELIXIRS, GRADE_KEYS, GRADE_NAME, GRADE_SUB, gkey } from './data.js';
import { liveState, liveGrades, refreshLive, LIVE_URL } from './live.js';
import * as store from './store.js';
import { KEYS } from './store.js';
import { parsePriceText, fmtNum, elixirIngredients } from './calc.js';
import {
  $, esc, icon, toast, elixirPrices, setProductPrice, setIngPrice, freshness, freshChip, armButton,
  ingPricesRaw, selfSupply, toggleSelf,
} from './ui.js';
import { rangeOf } from './view-alchemy.js';

/* ── 재료 목록: 레시피에서 자동으로 모음 + 어디에 쓰이는지 ── */
function collect(list, getIngs, groupOf) {
  const map = new Map();
  list.forEach(item => getIngs(item).forEach(i => {
    if (!map.has(i.name)) map.set(i.name, { name: i.name, group: groupOf(i), uses: [] });
    map.get(i.name).uses.push(item.name);
  }));
  return [...map.values()];
}
const ALCH_ING = collect(ELIXIRS, elixirIngredients,
  i => i.name.includes('심재') ? '심재' : /강화된|순수한/.test(i.name) ? '광물' : '기타 재료');

const NAMES = [
  ...ELIXIRS.map(e => ({ key: e.name, type: 'elixir', label: `${e.name}의 비약` })),
  ...ALCH_ING.map(i => ({ key: i.name, type: 'ing', label: i.name })),
];

const CATS = [
  { id: 'elixir',  name: '비약 판매가', sub: `${ELIXIRS.length}가지 × 무별 · 은별 · 금별` },
  { id: 'alchIng', name: '연금 재료',   sub: '심재 · 광물 · 기타' },
];

let cat = 'elixir';
export function setPriceCat(id) { if (CATS.some(c => c.id === id)) cat = id; }
let query = '';
let onlyEmpty = false;

export function initPrices() {
  /* 다른 화면의 '재료 단가 수정하기' → 해당 카테고리로 열기 */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-goto-cat]');
    if (a) { setPriceCat(a.dataset.gotoCat); if (location.hash === '#prices') renderPrices(); }
  }, true);

  /* 붙여넣기 */
  $('#pasteApply').addEventListener('click', () => {
    const { matched, unmatched } = parsePriceText($('#pasteArea').value, NAMES);
    const now = Date.now();
    if (matched.length) {
      store.update(KEYS.elixirPrices, {}, m => { matched.filter(x => x.type === 'elixir').forEach(x => { m[gkey(x.key, x.grade)] = { price: x.price, at: now }; }); return m; });
      store.update(KEYS.ingPrices, {}, m => { matched.filter(x => x.type === 'ing').forEach(x => { m[x.key] = x.price; }); return m; });
    }
    $('#pasteResult').innerHTML = `
      <div class="calc-lines">
        <div class="calc-line"><span class="k">반영됨</span><span class="gain num">${matched.length}개</span></div>
        ${unmatched.length ? `<div class="calc-line"><span class="k">못 찾은 이름</span><span class="loss">${unmatched.map(esc).join(', ')}</span></div>` : ''}
      </div>
      ${matched.length ? `<p class="note" style="margin-top:8px">${matched.map(x => `${x.type === 'elixir' ? `<span class="gchip g-${x.grade}">${GRADE_NAME[x.grade]}</span> ` : ''}${esc(x.label)} <b>${fmtNum(x.price)}</b>`).join(' · ')}</p>` : ''}`;
    toast(matched.length ? `시세 ${matched.length}개를 반영했어요` : '읽을 수 있는 줄이 없어요');
  });
  $('#liveBand').addEventListener('click', e => { if (e.target.closest('#liveRefresh')) refreshLive(); });
  $('#pasteClear').addEventListener('click', () => { $('#pasteArea').value = ''; $('#pasteResult').innerHTML = ''; });

  /* 카테고리 카드 */
  $('#catCards').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (b) { cat = b.dataset.cat; renderPrices(); }
  });
  /* 검색 · 빈 칸만 (목록만 다시 그림 → 입력 중인 검색칸 유지) */
  $('#priceSearch').addEventListener('input', e => { query = e.target.value.trim(); renderList(); });
  $('#onlyEmpty').addEventListener('change', e => { onlyEmpty = e.target.checked; renderList(); });

  /* 값 입력 · 직접 수급 · 전부 지우기 */
  $('#priceList').addEventListener('change', e => {
    const p = e.target.closest('input[data-gk]');
    if (p) setProductPrice(KEYS.elixirPrices, p.dataset.gk, p.value);
    const i = e.target.closest('input[data-ing]');
    if (i) setIngPrice(i.dataset.ing, i.value);
  });
  $('#priceList').addEventListener('click', e => {
    const t = e.target.closest('[data-self]');
    if (t) toggleSelf(t.dataset.self);
  });
  $('#catFoot').addEventListener('click', e => {
    const b = e.target.closest('#clearCat');
    if (!b) return;
    const label = b.dataset.label;
    armButton(b, label, () => {
      if (cat === 'elixir') store.set(KEYS.elixirPrices, {});
      else {
        const names = new Set(ALCH_ING.map(x => x.name));
        store.update(KEYS.ingPrices, {}, m => { names.forEach(n => delete m[n]); return m; });
      }
      toast(`${CATS.find(c => c.id === cat).name}을 비웠어요`);
    });
  });
}

/* ── 카테고리별 현황 ── */
function summary() {
  const ep = elixirPrices(), ip = ingPricesRaw(), self = selfSupply();
  const vals = ELIXIRS.flatMap(e => GRADE_KEYS.map(g => ep[gkey(e.name, g)])).filter(Boolean);
  return {
    elixir: { done: vals.length, total: ELIXIRS.length * GRADE_KEYS.length, fresh: vals.filter(v => freshness(v) === 'fresh').length },
    alchIng: { done: ALCH_ING.filter(x => ip[x.name] > 0 || self[x.name]).length, total: ALCH_ING.length, self: ALCH_ING.filter(x => self[x.name]).length },
  };
}

function renderLiveBand() {
  const st = liveState();
  const t = ms => { const d = new Date(ms); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const cls = { online: 'is-on', loading: 'is-wait', idle: 'is-wait', error: 'is-err' }[st.status];
  const main = st.status === 'online'
    ? `<b>기린월드 공식 시세 자동 반영 중</b><span>${t(st.at)} 기준 · 비약 ${st.counts.elixir}가지 (무별 · 은별 · 금별)${st.counts.ing ? ` · 재료 ${st.counts.ing}` : ''}${st.nextChangeAt ? ` · 다음 변경 ${t(st.nextChangeAt)}` : ''}</span>`
    : st.status === 'error' ? `<b>공식 시세 연결 안 됨</b><span>${esc(st.error)}</span>`
    : `<b>공식 시세 불러오는 중…</b><span></span>`;
  const missing = ELIXIRS.filter(e => !liveGrades().elixir?.[e.name]).map(e => e.name + '의 비약');
  $('#liveBand').className = 'live-band ' + cls;
  $('#liveBand').innerHTML = `<span class="lb-dot" aria-hidden="true"></span><div class="lb-text">${main}
    ${st.status === 'online' && missing.length ? `<small>공식 시세에 없어서 직접 넣어야 하는 것: ${esc(missing.join(', '))}</small>` : ''}
    ${st.unmatched?.length ? `<small>이름을 못 맞춘 품목: ${esc(st.unmatched.join(', '))} (알려주면 짝지어 둘게요)</small>` : ''}</div>
    <button class="btn btn-sm" type="button" id="liveRefresh">새로 불러오기</button>`;
}

export function renderPrices() {
  renderLiveBand();
  const sm = summary();
  $('#catCards').innerHTML = CATS.map(c => {
    const s = sm[c.id];
    const pct = Math.round(s.done / s.total * 100);
    const extra = 'fresh' in s
      ? (s.done ? `<span class="chip ${s.fresh === s.done ? 'fresh' : 'stale'}">이번 시세 ${s.fresh}</span>` : '')
      : (s.self ? `<span class="chip">직접 ${s.self}</span>` : '');
    return `
      <button class="cat-card${cat === c.id ? ' is-on' : ''}" type="button" role="tab" aria-selected="${cat === c.id}" data-cat="${c.id}">
        <span class="cc-name">${c.name}</span>
        <span class="cc-sub">${c.sub}</span>
        <span class="cc-count num"><b>${s.done}</b>/${s.total}</span>
        <span class="cc-bar"><i style="width:${pct}%"></i></span>
        <span class="cc-extra">${extra}</span>
      </button>`;
  }).join('');
  renderList();
}

function renderList() {
  const c = CATS.find(x => x.id === cat);
  $('#catTitle').textContent = c.name;
  const q = query.toLowerCase();
  const match = name => !q || name.toLowerCase().includes(q);
  let html = '';

  const live = liveGrades();
  if (cat === 'elixir') {
    const map = elixirPrices();
    const has = e => GRADE_KEYS.some(g => map[gkey(e.name, g)]);
    const full = e => GRADE_KEYS.every(g => map[gkey(e.name, g)]);
    const groups = [['바닐라', ELIXIRS.filter(e => e.vanilla)], ['숙련도 1', ELIXIRS.filter(e => e.lv === 1)],
      ['숙련도 10', ELIXIRS.filter(e => e.lv === 10)], ['숙련도 20', ELIXIRS.filter(e => e.lv === 20)]];
    html = `<div class="pe-head"><span></span>${GRADE_KEYS.map(g => `<span><span class="gchip g-${g}">${GRADE_NAME[g]}</span> <small class="faint">${GRADE_SUB[g]}</small></span>`).join('')}</div>` +
    groups.map(([gname, items]) => {
      const rows = items.filter(e => match(`${e.name}의 비약`) && (!onlyEmpty || !full(e)));
      if (!rows.length) return '';
      return `<div class="pl-group"><h3>${gname} <span class="chip">${items.filter(has).length}/${items.length}</span></h3>
        ${rows.map(e => `
          <div class="pe-row">
            <span class="pr-name">${icon(e.name, 's')}<span class="pl-label">${esc(e.name)}의 비약<small>${esc(e.effect)}</small></span></span>
            ${GRADE_KEYS.map(g => {
              const k = gkey(e.name, g), v = map[k], r = rangeOf(e.name, g, v?.price);
              const auto = v?.auto && live.elixir?.[e.name]?.[g];
              const trend = live.elixir?.[e.name]?.[g]?.trend;
              const f = auto ? 'auto' : freshness(v);
              const tag = { auto: '<span class="pe-tag is-auto">자동</span>', fresh: '<span class="pe-tag is-fresh">이번</span>', stale: '<span class="pe-tag is-stale">지난</span>' }[f] || '';
              return `<label class="pe-cell g-${g}">
                <span class="gchip g-${g} pe-g">${GRADE_NAME[g]}</span>
                <input class="input num${f === 'stale' ? ' is-stale' : ''}" data-gk="${esc(k)}" type="number" min="0" inputmode="numeric" placeholder="—" value="${v?.price ?? ''}" aria-label="${esc(e.name)}의 비약 ${GRADE_NAME[g]} 판매가">
                ${tag || r ? `<small class="pe-meta num">${tag}${trend === 'up' ? '<span class="gain">▲</span>' : trend === 'down' ? '<span class="loss">▼</span>' : ''}<span class="spacer"></span>${r ? `${fmtNum(Math.ceil(r.min))}~${fmtNum(Math.floor(r.max))}` : ''}</small>` : ''}
              </label>`;
            }).join('')}
          </div>`).join('')}</div>`;
    }).join('');
  } else {
    const list = ALCH_ING;
    const ip = ingPricesRaw(), self = selfSupply();
    const order = ['심재', '광물', '기타 재료'];
    html = order.map(g => {
      const items = list.filter(x => x.group === g);
      const rows = items.filter(x => match(x.name) && (!onlyEmpty || !(ip[x.name] > 0 || self[x.name])));
      if (!rows.length) return '';
      return `<div class="pl-group"><h3>${g} <span class="chip">${items.filter(x => ip[x.name] > 0 || self[x.name]).length}/${items.length}</span></h3>
        ${rows.map(x => `
          <div class="pl-row${self[x.name] ? ' is-self' : ''}">
            <span class="pr-name">${icon(x.name, 's')}<span class="pl-label">${esc(x.name)}<small title="${esc(x.uses.join(', '))}">${esc(x.uses.slice(0, 2).join(', '))}${x.uses.length > 2 ? ` 외 ${x.uses.length - 2}` : ''}</small></span></span>
            <button class="self-tog${self[x.name] ? ' is-on' : ''}" type="button" data-self="${esc(x.name)}" aria-pressed="${!!self[x.name]}" title="직접 캐거나 기른 재료는 0원으로 계산">직접</button>
            <input class="input num" data-ing="${esc(x.name)}" type="number" min="0" step="any" placeholder="0" value="${ip[x.name] ?? ''}" aria-label="${esc(x.name)} 단가"${self[x.name] ? ' disabled' : ''}>
          </div>`).join('')}</div>`;
    }).join('');
  }

  $('#priceList').innerHTML = html
    ? `<div class="${cat === 'elixir' ? 'pe-list' : 'pl-cols'}">${html}</div>`
    : `<div class="empty">${onlyEmpty ? '빈 칸이 없어요. 다 채웠어요!' : '찾는 이름이 없어요.'}</div>`;

  const isProd = cat === 'elixir';
  const label = isProd ? '판매가 전부 지우기' : '이 재료 단가 전부 지우기';
  $('#catFoot').innerHTML = `
    <div class="row" style="justify-content:space-between;align-items:center">
      <span>${isProd ? '칸 아래 숫자는 이번 주기 변동 범위(기준가 -20% ~ +10%)예요. 지난 주기에 넣은 값은 <b>지난 시세</b>로 표시되고, 판매가는 다 같이 공유돼요.' : '재료 단가는 다 같이 공유되고, <b>직접</b> 표시는 내 브라우저에만 저장돼요.'}</span>
      <button class="btn btn-ghost btn-sm" id="clearCat" type="button" data-label="${label}">${label}</button>
    </div>`;
}
