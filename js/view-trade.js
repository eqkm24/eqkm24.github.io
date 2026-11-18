/* ==========================================================================
   view-trade.js — 거래 계산기
   1) 수량 · 단가: 상자 / 세트 / 개 환산, 단가 ↔ 총액, 시세 대비, 수수료
   2) 물물교환 저울: 내가 주는 것 vs 받는 것 → 누가 얼마 더 줘야 공정한지
   3) 나눠 갖기: 총액을 N명에게
   입력값은 이 브라우저에만 저장합니다 (공유하지 않음).
   ========================================================================== */
import { RECIPES, ELIXIRS } from './data.js';
import * as store from './store.js';
import { recipeIngredients, elixirIngredients, fmtNum } from './calc.js';
import { $, esc, cookPrices, elixirPrices, ingPricesRaw, toast } from './ui.js';

const SAVE = 'trade';    // KEYS 에 넣지 않음 → 입력할 때마다 화면 전체를 다시 그리지 않음
const DEF = {
  name: '', box: 0, set: 0, each: 0, stack: 64, unit: '', total: '', fee: 0,
  give: [{ name: '', qty: 1, price: '' }], get: [{ name: '', qty: 1, price: '' }],
  splitTotal: '', splitN: 2,
};
let st = { ...DEF, ...store.get(SAVE, {}) };
const save = () => store.set(SAVE, st);
const num = v => (Number.isFinite(+v) ? +v : 0);

/* ── 기준 가격 목록 (시세 · 재료 단가) ── */
function catalog() {
  const cp = cookPrices(), ep = elixirPrices(), ip = ingPricesRaw();
  const list = [];
  RECIPES.forEach(r => list.push({ label: r.name, price: cp[r.name]?.price || 0, kind: '요리' }));
  ELIXIRS.forEach(e => list.push({ label: `${e.name}의 비약`, price: ep[e.name]?.price || 0, kind: '비약' }));
  const seen = new Set();
  [...RECIPES.flatMap(recipeIngredients), ...ELIXIRS.flatMap(elixirIngredients)].forEach(i => {
    if (seen.has(i.name)) return; seen.add(i.name);
    list.push({ label: i.name, price: num(ip[i.name]), kind: '재료' });
  });
  return list;
}
const refPrice = name => catalog().find(x => x.label === name.trim())?.price || 0;

export function initTrade() {
  const v = $('.view[data-view="trade"]');

  v.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.f) {                       // 수량 · 단가 / 나눠 갖기 칸
      st[t.dataset.f] = t.type === 'number' ? (t.value === '' ? '' : +t.value) : t.value;
      if (t.dataset.f === 'unit') { st.total = ''; $('[data-f="total"]').value = ''; }   // 단가를 고치면 총액은 계산값으로
      if (t.dataset.f === 'total') { st.unit = ''; $('[data-f="unit"]').value = ''; }    // 총액을 고치면 단가는 계산값으로
      save(); calcQty(); calcSplit();
    }
    if (t.dataset.row) {                     // 물물교환 줄
      const [side, i, field] = t.dataset.row.split(':');
      const row = st[side][+i];
      row[field] = t.value;
      if (field === 'name') {                // 이름을 고르면 기준 가격 자동 입력
        const p = refPrice(t.value);
        if (p && !row.priceTouched) { row.price = p; t.closest('.bt-row').querySelector('[data-row$=":price"]').value = p; }
      }
      if (field === 'price') row.priceTouched = t.value !== '';
      save(); calcBarter();
    }
  });

  v.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'stack') { st.stack = +b.dataset.v; save(); renderTrade(); }
    if (act === 'useRef') { const p = refPrice(st.name); if (p) { st.unit = p; st.total = ''; save(); renderTrade(); } }
    if (act === 'add') { st[b.dataset.side].push({ name: '', qty: 1, price: '' }); save(); renderTrade(); }
    if (act === 'del') { st[b.dataset.side].splice(+b.dataset.i, 1); if (!st[b.dataset.side].length) st[b.dataset.side].push({ name: '', qty: 1, price: '' }); save(); renderTrade(); }
    if (act === 'swap') { [st.give, st.get] = [st.get, st.give]; save(); renderTrade(); }
    if (act === 'resetQty') { Object.assign(st, { name: '', box: 0, set: 0, each: 0, unit: '', total: '', fee: st.fee }); save(); renderTrade(); }
    if (act === 'resetBarter') { st.give = [{ name: '', qty: 1, price: '' }]; st.get = [{ name: '', qty: 1, price: '' }]; save(); renderTrade(); }
    if (act === 'copy') {
      const text = b.dataset.text;
      navigator.clipboard?.writeText(text).then(() => toast('복사했어요'), () => toast(text));
    }
  });
}

/* ── 그리기 ── */
export function renderTrade() {
  st = { ...DEF, ...store.get(SAVE, {}) };
  $('#tradeList').innerHTML = catalog().map(x => `<option value="${esc(x.label)}">${x.kind}${x.price ? ' · ' + fmtNum(x.price) : ''}</option>`).join('');

  /* 1. 수량 · 단가 */
  $('#tqStack').innerHTML = [64, 16, 1].map(n =>
    `<button type="button" data-act="stack" data-v="${n}" class="${st.stack === n ? 'is-on' : ''}">${n === 1 ? '안 쌓임' : n + '개씩'}</button>`).join('');
  ['name', 'box', 'set', 'each', 'unit', 'total', 'fee'].forEach(f => { const el = $(`[data-f="${f}"]`); if (el) el.value = st[f] ?? ''; });
  calcQty();

  /* 2. 물물교환 */
  ['give', 'get'].forEach(side => {
    $(`#bt-${side}`).innerHTML = st[side].map((r, i) => `
      <div class="bt-row">
        <input class="input" list="tradeList" data-row="${side}:${i}:name" value="${esc(r.name)}" placeholder="품목 (선택 또는 입력)" aria-label="품목">
        <input class="input num" type="number" min="0" data-row="${side}:${i}:qty" value="${r.qty}" aria-label="개수">
        <input class="input num" type="number" min="0" data-row="${side}:${i}:price" value="${r.price}" placeholder="단가" aria-label="개당 가격">
        <span class="bt-sub num" data-sub="${side}:${i}"></span>
        <button class="btn btn-sm btn-icon" type="button" data-act="del" data-side="${side}" data-i="${i}" aria-label="줄 지우기">✕</button>
      </div>`).join('');
  });
  calcBarter();

  /* 3. 나눠 갖기 */
  $('[data-f="splitTotal"]').value = st.splitTotal; $('[data-f="splitN"]').value = st.splitN;
  calcSplit();
}

function calcQty() {
  const count = num(st.box) * 27 * st.stack + num(st.set) * st.stack + num(st.each);
  let unit = num(st.unit), total = num(st.total);
  if (st.total !== '' && st.unit === '') unit = count ? total / count : 0;
  else total = unit * count;
  const fee = Math.max(0, num(st.fee));
  const feeAmt = total * fee / 100;
  const ref = refPrice(st.name);

  $('#tqCount').innerHTML = `<b class="num">${fmtNum(count)}</b>개` +
    (count >= st.stack && st.stack > 1 ? ` <span class="faint">= ${Math.floor(count / st.stack)}세트${count % st.stack ? ` ${count % st.stack}개` : ''}</span>` : '');
  const uIn = $('[data-f="unit"]'), tIn = $('[data-f="total"]');
  if (document.activeElement !== uIn) uIn.placeholder = unit ? fmtNum(unit, 2) : '개당 가격';
  if (document.activeElement !== tIn) tIn.placeholder = total ? fmtNum(total) : '총액';

  let refHtml = '';
  if (ref) {
    const diff = unit ? (unit - ref) / ref * 100 : null;
    refHtml = `<div class="tq-ref">
      <span>현재 기준 가격 <b class="num">${fmtNum(ref)}</b> 쿠키</span>
      ${diff == null ? '' : `<span class="tq-diff">${Math.abs(diff) < 0.05 ? '기준과 같아요' : `기준보다 <b>${Math.abs(diff).toFixed(1)}%</b> ${diff > 0 ? '비싸요' : '싸요'}`}</span>`}
      <button class="btn btn-sm" type="button" data-act="useRef">이 가격 쓰기</button></div>`;
  } else if (st.name) refHtml = `<div class="tq-ref faint">이 품목은 아직 시세 · 단가가 없어요</div>`;
  $('#tqRef').innerHTML = refHtml;

  const line = `${st.name || '거래'} ${fmtNum(count)}개 × ${fmtNum(unit, 2)} = ${fmtNum(total)} 쿠키`;
  $('#tqResult').innerHTML = `
    <div class="calc-line"><span class="k">총액</span><span class="num big">${fmtNum(total)} 쿠키</span></div>
    <div class="calc-line"><span class="k">개당</span><span class="num">${fmtNum(unit, 2)} 쿠키</span></div>
    ${st.stack > 1 ? `<div class="calc-line"><span class="k">세트당 (${st.stack}개)</span><span class="num">${fmtNum(unit * st.stack)} 쿠키</span></div>` : ''}
    ${fee ? `<div class="calc-line"><span class="k">수수료 ${fee}%</span><span class="num loss">−${fmtNum(feeAmt)}</span></div>
      <div class="calc-line total"><span class="k">받는 사람 실수령</span><span class="num gain">${fmtNum(total - feeAmt)} 쿠키</span></div>
      <div class="calc-line"><span class="k">실수령을 ${fmtNum(total)}로 맞추려면 보낼 돈</span><span class="num">${fmtNum(total / (1 - Math.min(fee, 99.9) / 100))} 쿠키</span></div>` : ''}
    <div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn btn-sm" type="button" data-act="copy" data-text="${esc(line)}">계산 결과 복사</button></div>`;
}

function calcBarter() {
  const sum = side => st[side].reduce((s, r, i) => {
    const sub = num(r.qty) * num(r.price);
    const el = document.querySelector(`[data-sub="${side}:${i}"]`);
    if (el) el.textContent = sub ? fmtNum(sub) : '—';
    return s + sub;
  }, 0);
  const give = sum('give'), get = sum('get');
  const diff = get - give;          // + 면 내가 더 받음
  $('#btGiveSum').textContent = fmtNum(give);
  $('#btGetSum').textContent = fmtNum(get);
  const max = Math.max(give, get, 1);
  $('#btScale').innerHTML = `
    <div class="bt-bars">
      <div class="bt-bar give"><span>내가 주는 것</span><i style="width:${give / max * 100}%"></i><b class="num">${fmtNum(give)}</b></div>
      <div class="bt-bar get"><span>내가 받는 것</span><i style="width:${get / max * 100}%"></i><b class="num">${fmtNum(get)}</b></div>
    </div>
    <div class="bt-verdict ${!give && !get ? '' : Math.abs(diff) < 1 ? 'even' : diff > 0 ? 'me' : 'them'}">${
      !give && !get ? '양쪽에 품목과 가격을 넣으면 차액을 알려줘요'
      : Math.abs(diff) < 1 ? '공정한 거래예요. 차액이 없어요'
      : diff > 0 ? `내가 <b>${fmtNum(diff)}</b> 쿠키만큼 더 받아요 → 공정하게 하려면 내가 <b>${fmtNum(diff)}</b> 쿠키를 더 줘야 해요`
      : `상대가 <b>${fmtNum(-diff)}</b> 쿠키만큼 더 받아요 → 공정하게 하려면 상대에게 <b>${fmtNum(-diff)}</b> 쿠키를 더 받아야 해요`
    }</div>`;
}

function calcSplit() {
  const total = num(st.splitTotal), n = Math.max(1, Math.round(num(st.splitN) || 1));
  const each = Math.floor(total / n), rest = total - each * n;
  $('#splitResult').innerHTML = total ? `
    <div class="calc-line total"><span class="k">한 사람당</span><span class="num">${fmtNum(each)} 쿠키</span></div>
    ${rest ? `<div class="calc-line"><span class="k">남는 쿠키</span><span class="num">${fmtNum(rest)} (${rest}명에게 1씩 더)</span></div>` : ''}` : '<p class="note">총액과 인원을 넣어 주세요.</p>';
}
