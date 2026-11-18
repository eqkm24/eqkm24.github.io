/* ==========================================================================
   view-prices.js — 시세 · 단가 모아보기 + 디스코드 시세 붙여넣기
   카테고리: 요리 판매가 · 비약 판매가 · 요리 재료 · 연금 재료
   요리/비약 탭 아래쪽 재료 목록과 같은 값을 쓰므로 어디서 고쳐도 함께 바뀝니다.
   ========================================================================== */
import { RECIPES, ELIXIRS } from './data.js';
import * as store from './store.js';
import { KEYS } from './store.js';
import { parsePriceText, fmtNum, recipeIngredients, elixirIngredients } from './calc.js';
import {
  $, esc, icon, toast, cookPrices, elixirPrices, setProductPrice, setIngPrice, freshness, freshChip, armButton,
  ingPricesRaw, selfSupply, toggleSelf,
} from './ui.js';

const NAMES = [
  ...RECIPES.map(r => ({ key: r.name, type: 'cook', label: r.name })),
  ...ELIXIRS.map(e => ({ key: e.name, type: 'elixir', label: `${e.name}의 비약` })),
];

/* ── 재료 목록: 레시피에서 자동으로 모음 + 어디에 쓰이는지 ── */
function collect(list, getIngs, groupOf) {
  const map = new Map();
  list.forEach(item => getIngs(item).forEach(i => {
    if (!map.has(i.name)) map.set(i.name, { name: i.name, group: groupOf(i), uses: [] });
    map.get(i.name).uses.push(item.name);
  }));
  return [...map.values()];
}
const COOK_ING = collect(RECIPES, recipeIngredients,
  i => ({ fish: '물고기 (희귀)', veg: '바닐라 작물', farm: '농부 작물 (희귀)' }[i.kind]));
const ALCH_ING = collect(ELIXIRS, elixirIngredients,
  i => i.name.includes('심재') ? '심재' : /강화된|순수한/.test(i.name) ? '광물' : '기타 재료');

const CATS = [
  { id: 'cook',    name: '요리 판매가', sub: '26가지 요리' },
  { id: 'elixir',  name: '비약 판매가', sub: '17가지 비약' },
  { id: 'cookIng', name: '요리 재료',   sub: '물고기 · 작물' },
  { id: 'alchIng', name: '연금 재료',   sub: '심재 · 광물 · 기타' },
];

let cat = 'cook';
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
      store.update(KEYS.cookPrices, {}, m => { matched.filter(x => x.type === 'cook').forEach(x => { m[x.key] = { price: x.price, at: now }; }); return m; });
      store.update(KEYS.elixirPrices, {}, m => { matched.filter(x => x.type === 'elixir').forEach(x => { m[x.key] = { price: x.price, at: now }; }); return m; });
    }
    $('#pasteResult').innerHTML = `
      <div class="calc-lines">
        <div class="calc-line"><span class="k">반영됨</span><span class="gain num">${matched.length}개</span></div>
        ${unmatched.length ? `<div class="calc-line"><span class="k">못 찾은 이름</span><span class="loss">${unmatched.map(esc).join(', ')}</span></div>` : ''}
      </div>
      ${matched.length ? `<p class="note" style="margin-top:8px">${matched.map(x => `${esc(x.label)} <b>${fmtNum(x.price)}</b>`).join(' · ')}</p>` : ''}`;
    toast(matched.length ? `시세 ${matched.length}개를 반영했어요` : '읽을 수 있는 줄이 없어요');
  });
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
    const p = e.target.closest('input[data-kind]');
    if (p) setProductPrice(p.dataset.kind === 'cook' ? KEYS.cookPrices : KEYS.elixirPrices, p.dataset.name, p.value);
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
      if (cat === 'cook') store.set(KEYS.cookPrices, {});
      else if (cat === 'elixir') store.set(KEYS.elixirPrices, {});
      else {
        const names = new Set((cat === 'cookIng' ? COOK_ING : ALCH_ING).map(x => x.name));
        store.update(KEYS.ingPrices, {}, m => { names.forEach(n => delete m[n]); return m; });
      }
      toast(`${CATS.find(c => c.id === cat).name}을 비웠어요`);
    });
  });
}

/* ── 카테고리별 현황 ── */
function summary() {
  const cp = cookPrices(), ep = elixirPrices(), ip = ingPricesRaw(), self = selfSupply();
  const prod = (map, list) => {
    const vals = list.map(n => map[n]).filter(Boolean);
    return { done: vals.length, total: list.length, fresh: vals.filter(v => freshness(v) === 'fresh').length };
  };
  const ing = list => ({
    done: list.filter(x => ip[x.name] > 0 || self[x.name]).length, total: list.length,
    self: list.filter(x => self[x.name]).length,
  });
  return {
    cook: prod(cp, RECIPES.map(r => r.name)),
    elixir: prod(ep, ELIXIRS.map(e => e.name)),
    cookIng: ing(COOK_ING),
    alchIng: ing(ALCH_ING),
  };
}

export function renderPrices() {
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

  if (cat === 'cook' || cat === 'elixir') {
    const map = cat === 'cook' ? cookPrices() : elixirPrices();
    const groups = cat === 'cook'
      ? [['바닐라', RECIPES.filter(r => r.vanilla)], ['1단계', RECIPES.filter(r => r.stage === 1 && !r.vanilla)],
         ['2단계', RECIPES.filter(r => r.stage === 2)], ['3단계', RECIPES.filter(r => r.stage === 3)]]
          .map(([g, l]) => [g, l.map(r => ({ key: r.name, label: r.name, note: r.season ? r.season : '' }))])
      : [['바닐라', ELIXIRS.filter(e => e.vanilla)], ['숙련도 1', ELIXIRS.filter(e => e.lv === 1)],
         ['숙련도 10', ELIXIRS.filter(e => e.lv === 10)], ['숙련도 20', ELIXIRS.filter(e => e.lv === 20)]]
          .map(([g, l]) => [g, l.map(e => ({ key: e.name, label: `${e.name}의 비약`, note: e.effect }))]);
    html = groups.map(([g, items]) => {
      const rows = items.filter(x => match(x.label) && (!onlyEmpty || !map[x.key]));
      if (!rows.length) return '';
      return `<div class="pl-group"><h3>${g} <span class="chip">${items.filter(x => map[x.key]).length}/${items.length}</span></h3>
        ${rows.map(x => `
          <div class="pl-row">
            <span class="pr-name">${icon(x.key, 's')}<span class="pl-label">${esc(x.label)}<small>${esc(x.note)}</small></span></span>
            ${freshChip(map[x.key]) || '<span></span>'}
            <input class="input num" data-kind="${cat}" data-name="${esc(x.key)}" type="number" min="0" inputmode="numeric" placeholder="—" value="${map[x.key]?.price ?? ''}" aria-label="${esc(x.label)} 판매가">
          </div>`).join('')}</div>`;
    }).join('');
  } else {
    const list = cat === 'cookIng' ? COOK_ING : ALCH_ING;
    const ip = ingPricesRaw(), self = selfSupply();
    const order = cat === 'cookIng' ? ['물고기 (희귀)', '바닐라 작물', '농부 작물 (희귀)'] : ['심재', '광물', '기타 재료'];
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
    ? `<div class="pl-cols">${html}</div>`
    : `<div class="empty">${onlyEmpty ? '빈 칸이 없어요. 다 채웠어요!' : '찾는 이름이 없어요.'}</div>`;

  const isProd = cat === 'cook' || cat === 'elixir';
  const label = isProd ? '판매가 전부 지우기' : '이 재료 단가 전부 지우기';
  $('#catFoot').innerHTML = `
    <div class="row" style="justify-content:space-between;align-items:center">
      <span>${isProd ? '지난 주기에 넣은 값은 <b>지난 시세</b>로 표시돼요. 판매가는 다 같이 공유돼요.' : '재료 단가는 다 같이 공유되고, <b>직접</b> 표시는 내 브라우저에만 저장돼요.'}</span>
      <button class="btn btn-ghost btn-sm" id="clearCat" type="button" data-label="${label}">${label}</button>
    </div>`;
}
