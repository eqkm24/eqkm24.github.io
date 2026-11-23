/* ==========================================================================
   view-trade.js — 거래 계산기
   1) 수량 · 단가: 상자 / 세트 / 개 환산, 단가 ↔ 총액, 시세 대비, 수수료
   2) 계산기: 사칙연산 · 괄호 · % · ×64(세트) · 최근 기록, 결과를 수량·단가 칸으로 보내기
   입력값은 이 브라우저에만 저장합니다 (공유하지 않음).
   ========================================================================== */
import { ELIXIRS, GRADE_KEYS, GRADE_NAME, gkey } from './data.js';
import * as store from './store.js';
import { elixirIngredients, fmtNum } from './calc.js';
import { $, esc, elixirPrices, ingPricesRaw, toast } from './ui.js';

const SAVE = 'trade';    // KEYS 에 넣지 않음 → 입력할 때마다 화면 전체를 다시 그리지 않음
const DEF = { name: '', box: 0, set: 0, each: 0, stack: 64, unit: '', total: '', fee: 3, calcHist: [] };   // 거래소 수수료 3% 기본
let st = { ...DEF, ...store.get(SAVE, {}) };
const save = () => store.set(SAVE, st);
const num = v => (Number.isFinite(+v) ? +v : 0);

/* ── 기준 가격 목록 (시세 · 재료 단가) ── */
function catalog() {
  const ep = elixirPrices(), ip = ingPricesRaw();
  const list = [];
  ELIXIRS.forEach(e => GRADE_KEYS.forEach(g => list.push({
    label: g === 'common' ? `${e.name}의 비약` : `${e.name}의 비약 (${GRADE_NAME[g]})`, price: ep[gkey(e.name, g)]?.price || 0, kind: `비약 ${GRADE_NAME[g]}` })));
  const seen = new Set();
  ELIXIRS.flatMap(elixirIngredients).forEach(i => {
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
    if (!t.dataset.f) return;                 // 수량 · 단가 칸
    st[t.dataset.f] = t.type === 'number' ? (t.value === '' ? '' : +t.value) : t.value;
    if (t.dataset.f === 'unit') { st.total = ''; $('[data-f="total"]').value = ''; }   // 단가를 고치면 총액은 계산값으로
    if (t.dataset.f === 'total') { st.unit = ''; $('[data-f="unit"]').value = ''; }    // 총액을 고치면 단가는 계산값으로
    save(); calcQty();
  });

  v.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'stack') { st.stack = +b.dataset.v; save(); renderTrade(); }
    if (act === 'useRef') { const p = refPrice(st.name); if (p) { st.unit = p; st.total = ''; save(); renderTrade(); } }
    if (act === 'resetQty') { Object.assign(st, { name: '', box: 0, set: 0, each: 0, unit: '', total: '' }); save(); renderTrade(); }
    if (act === 'copy') copy(b.dataset.text);
  });
  $('#tqFeeSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-fee]');
    if (b) { st.fee = +b.dataset.fee; save(); renderTrade(); }
  });

  initCalculator();
}

function copy(text) {
  navigator.clipboard?.writeText(text).then(() => toast('복사했어요'), () => toast(text));
}

/* ── 그리기 ── */
export function renderTrade() {
  st = { ...DEF, ...store.get(SAVE, {}) };
  $('#tradeList').innerHTML = catalog().map(x => `<option value="${esc(x.label)}">${x.kind}${x.price ? ' · ' + fmtNum(x.price) : ''}</option>`).join('');
  $('#tqStack').innerHTML = [64, 16, 1].map(n =>
    `<button type="button" data-act="stack" data-v="${n}" class="${st.stack === n ? 'is-on' : ''}">${n === 1 ? '안 쌓임' : n + '개씩'}</button>`).join('');
  ['name', 'box', 'set', 'each', 'unit', 'total', 'fee'].forEach(f => { const el = $(`[data-f="${f}"]`); if (el) el.value = st[f] ?? ''; });
  $('#tqFeeSeg').querySelectorAll('[data-fee]').forEach(b => b.classList.toggle('is-on', num(st.fee) === +b.dataset.fee));
  calcQty();
  drawCalc();
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
      <div class="calc-line total"><span class="k">판매자 실수령</span><span class="num gain">${fmtNum(total - feeAmt)} 쿠키</span></div>
      <div class="calc-line"><span class="k">실수령을 ${fmtNum(total)}로 맞추려면 보낼 돈</span><span class="num">${fmtNum(total / (1 - Math.min(fee, 99.9) / 100))} 쿠키</span></div>` : ''}
    <div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn btn-sm" type="button" data-act="copy" data-text="${esc(line)}">계산 결과 복사</button></div>`;
}

/* ══ 계산기 ══
   식은 문자열로 들고 있다가 '=' 때 직접 만든 파서로 계산합니다 (eval 사용 안 함). */
let expr = '';          // 입력 중인 식 (표시용 기호 × ÷ −)
let last = null;        // 마지막 결과
let justEval = false;   // '=' 직후인지

const OPS = '+−×÷';
function evaluate(src) {
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '');
  let i = 0;
  const peek = () => s[i], eat = c => (s[i] === c ? (i++, true) : false);
  function factor() {
    if (eat('-')) return -factor();
    if (eat('+')) return factor();
    let v;
    if (eat('(')) { v = sum(); eat(')'); }
    else {
      const m = /^\d*\.?\d+|^\d+\./.exec(s.slice(i));
      if (!m) throw new Error('식이 올바르지 않아요');
      i += m[0].length; v = parseFloat(m[0]);
    }
    while (eat('%')) v /= 100;
    return v;
  }
  function term() {
    let v = factor();
    for (;;) {
      if (eat('*')) v *= factor();
      else if (eat('/')) { const d = factor(); if (d === 0) throw new Error('0으로 나눌 수 없어요'); v /= d; }
      else return v;
    }
  }
  function sum() {
    let v = term();
    for (;;) { if (eat('+')) v += term(); else if (eat('-')) v -= term(); else return v; }
  }
  const v = sum();
  if (i < s.length) throw new Error('식이 올바르지 않아요');
  return Math.round(v * 1e6) / 1e6;
}

function press(k) {
  const lastCh = expr.slice(-1);
  if (k === 'C') { expr = ''; last = null; justEval = false; }
  else if (k === '⌫') { expr = expr.slice(0, -1); justEval = false; }
  else if (k === '=') {
    if (!expr) return;
    const open = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
    const full = expr + ')'.repeat(Math.max(0, open));
    try {
      last = evaluate(full);
      st.calcHist = [{ e: full, v: last }, ...(st.calcHist || [])].slice(0, 6); save();
      expr = String(last); justEval = true;
    } catch (err) { toast(err.message); return; }
  }
  else if (k === '64') {                          // 지금 값 × 64 (세트 → 개)
    if (!expr) return;
    expr = (OPS.includes(lastCh) ? expr.slice(0, -1) : expr) + '×64'; justEval = false;
  }
  else if (OPS.includes(k)) {
    if (!expr && k !== '−') return;
    expr = OPS.includes(lastCh) ? expr.slice(0, -1) + k : expr + k; justEval = false;
  }
  else {                                           // 숫자 · . · ( ) · %
    if (justEval && /[\d.(]/.test(k)) expr = '';
    if (k === '.') { const seg = expr.split(/[+−×÷()]/).pop(); if (seg.includes('.')) return; if (!seg) k = '0.'; }
    expr += k; justEval = false;
  }
  drawCalc();
}

function preview() {
  if (!expr) return null;
  try { return evaluate(expr.replace(/[+−×÷(]+$/, '') + ')'.repeat(Math.max(0, (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length))); }
  catch { return null; }
}

function drawCalc() {
  const pv = preview();
  $('#clExpr').textContent = justEval ? (st.calcHist?.[0]?.e ?? '') + ' =' : (expr ? expr.replace(/(\d+(?:\.\d+)?)/g, m => fmtPlain(m)) : '\u00a0');
  $('#clVal').textContent = justEval ? fmtCalc(last) : pv == null ? (expr ? '…' : '0') : fmtCalc(pv);
  $('#clVal').classList.toggle('is-preview', !justEval && pv != null);
  const h = st.calcHist || [];
  $('#clHist').innerHTML = h.length ? `<div class="cl-hist-t">최근 계산</div>${h.map((x, i) => `
    <button type="button" class="cl-h" data-h="${i}"><span>${esc(x.e)}</span><b class="num">${fmtCalc(x.v)}</b></button>`).join('')}` : '';
}
const fmtCalc = v => (Number.isFinite(v) ? v.toLocaleString('ko-KR', { maximumFractionDigits: 4 }) : '—');
const fmtPlain = m => (m.includes('.') ? m : Number(m).toLocaleString('ko-KR'));
const current = () => (justEval ? last : preview());

function initCalculator() {
  $('#clKeys').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
  $('#clHist').addEventListener('click', e => {
    const b = e.target.closest('[data-h]');
    if (!b) return;
    const h = st.calcHist[+b.dataset.h];
    expr = String(h.v); last = h.v; justEval = true; drawCalc();
  });
  document.querySelector('.calc-win').addEventListener('click', e => {
    const b = e.target.closest('[data-cl]');
    if (!b) return;
    const v = current();
    if (v == null) { toast('먼저 계산해 주세요'); return; }
    if (b.dataset.cl === 'copy') copy(String(v));
    if (b.dataset.cl === 'toUnit') { st.unit = v; st.total = ''; save(); renderTrade(); toast(`개당 가격 ${fmtNum(v, 2)}`); }
    if (b.dataset.cl === 'toTotal') { st.total = Math.round(v); st.unit = ''; save(); renderTrade(); toast(`총액 ${fmtNum(v)}`); }
  });
  // 키보드: 거래 계산기 화면에서 입력칸에 있지 않을 때
  document.addEventListener('keydown', e => {
    if (!document.querySelector('.view[data-view="trade"].is-active')) return;
    if (e.target.closest('input, textarea, select') || e.ctrlKey || e.metaKey || e.altKey) return;
    const map = { '*': '×', '/': '÷', '-': '−', Enter: '=', '=': '=', Backspace: '⌫', Escape: 'C', Delete: 'C' };
    const k = map[e.key] || (/^[\d.+()%]$/.test(e.key) ? e.key : null);
    if (!k) return;
    e.preventDefault(); press(k);
    const btn = document.querySelector(`#clKeys [data-k="${CSS.escape(k)}"]`);
    if (btn) { btn.classList.add('is-press'); setTimeout(() => btn.classList.remove('is-press'), 120); }
  });
}
