/* ==========================================================================
   view-prices.js — 디스코드 시세 붙여넣기 · 입력된 시세 목록
   ========================================================================== */
import { RECIPES, ELIXIRS } from './data.js';
import * as store from './store.js';
import { KEYS } from './store.js';
import { parsePriceText, fmtNum } from './calc.js';
import { $, esc, icon, toast, cookPrices, elixirPrices, setProductPrice, freshness, freshChip, armButton } from './ui.js';

const NAMES = [
  ...RECIPES.map(r => ({ key: r.name, type: 'cook', label: r.name })),
  ...ELIXIRS.map(e => ({ key: e.name, type: 'elixir', label: `${e.name}의 비약` })),
];

export function initPrices() {
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

  $('#priceBoard').addEventListener('change', e => {
    const inp = e.target.closest('input[data-kind]');
    if (inp) setProductPrice(inp.dataset.kind === 'cook' ? KEYS.cookPrices : KEYS.elixirPrices, inp.dataset.name, inp.value);
  });
  $('#priceBoard').addEventListener('click', e => {
    const b = e.target.closest('#clearPrices');
    if (b) armButton(b, '판매가 전부 지우기', () => {
      store.set(KEYS.cookPrices, {}); store.set(KEYS.elixirPrices, {});
      toast('판매가를 모두 지웠어요');
    });
  });
}

export function renderPrices() {
  const cp = cookPrices(), ep = elixirPrices();
  const all = [...Object.values(cp), ...Object.values(ep)];
  const fresh = all.filter(x => freshness(x) === 'fresh').length;
  $('#priceCount').textContent = `${all.length}개 입력 · 이번 시세 ${fresh}개`;

  const row = (kind, name, label, entry) => `
    <div class="price-row" style="grid-template-columns:minmax(0,1fr) auto 96px">
      <span class="pr-name">${icon(name, 's')}${esc(label)}</span>${freshChip(entry) || '<span></span>'}
      <input class="input num" data-kind="${kind}" data-name="${esc(name)}" type="number" min="0" placeholder="—" value="${entry?.price ?? ''}" aria-label="${esc(label)} 판매가">
    </div>`;

  $('#priceBoard').innerHTML = `
    <p class="note">지난 주기에 넣은 값은 <span class="chip stale">지난 시세</span>로 표시돼요. 3시간마다 새로 붙여넣으면 순위가 정확해져요.</p>
    <div class="grid-2" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
      <div class="price-group"><h3>요리 <span class="chip">${Object.keys(cp).length}/${RECIPES.length}</span></h3>
        ${RECIPES.map(r => row('cook', r.name, r.name, cp[r.name])).join('')}</div>
      <div class="price-group"><h3>비약 <span class="chip">${Object.keys(ep).length}/${ELIXIRS.length}</span></h3>
        ${ELIXIRS.map(e => row('elixir', e.name, `${e.name}의 비약`, ep[e.name])).join('')}</div>
    </div>
    <div><button class="btn btn-ghost btn-sm" id="clearPrices" type="button">판매가 전부 지우기</button></div>`;
}
