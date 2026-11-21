/* ==========================================================================
   view-alchemy.js — 효율 계산기 · 연금 (비약)
   1병당 실제 이윤 · 마진율 · 원가율
   ========================================================================== */
import { ELIXIRS, ELIXIR_GRADES, ALCH_RULES } from './data.js';
import { KEYS } from './store.js';
import { elixirEfficiency, elixirIngredients, unitStats, fmtNum, fmtSigned } from './calc.js';
import {
  $, esc, profile, alchOpts, patch, clampLv, stepper, wireSteppers, alchContext,
  ingPrices, priceOf, setProductPrice, freshChip, icon, toolOptions, gradedPrices, gradeSelect, ingPricesRaw, selfSupply,
} from './ui.js';
import { tableHtml, metricsHtml, sortRows } from './calc-view.js';

let selected = null;

const TIERS = [['all', '전체'], ['0', '바닐라'], ['1', 'Lv 1'], ['10', 'Lv 10'], ['20', 'Lv 20']];

export function initAlchemy() {
  const opts = $('#alchOptions');
  wireSteppers(opts);
  opts.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'alLv') patch(KEYS.profile, { alchLv: clampLv(t.value) });
    if (t.id === 'alGrade') patch(KEYS.alchOpts, { grade: t.value });
    if (t.id === 'alPestle') patch(KEYS.profile, { tools: { ...profile().tools, pestle: +t.value } });
    if (t.id === 'alScale') patch(KEYS.alchOpts, { scaleIngredients: t.checked });
    if (t.id === 'alUnlocked') patch(KEYS.alchOpts, { unlockedOnly: t.checked });
  });
  $('#alchTierSeg').addEventListener('click', e => {
    const b = e.target.closest('button[data-tier]');
    if (b) patch(KEYS.alchOpts, { tier: b.dataset.tier });
  });
  const table = $('#alchTable');
  table.addEventListener('click', e => {
    const th = e.target.closest('th[data-sort]');
    if (th) { patch(KEYS.alchOpts, { sort: th.dataset.sort }); return; }
    if (e.target.closest('input')) return;
    const tr = e.target.closest('tr[data-name]');
    if (tr) { selected = tr.dataset.name; renderAlchemy(); }
  });
  const onPrice = e => {
    const p = e.target.closest('input[data-price]');
    if (p && !p.readOnly) setProductPrice(KEYS.elixirPrices, p.dataset.price, p.value);
  };
  table.addEventListener('change', onPrice);
  $('#alchDetail').addEventListener('change', onPrice);
}

function rowOf(e, ep, ip, ctx) {
  const price = priceOf(ep, e.name);
  const x = elixirEfficiency(e, price, ip, ctx);
  return { e, key: e.name, price, entry: ep[e.name], ...x, ...unitStats(x, price) };
}

export function renderAlchemy() {
  const ctx = alchContext();
  const o = alchOpts();
  renderOptions(ctx, o);

  const ep = gradedPrices('elixir', o.grade), ip = ingPrices();
  let rows = ELIXIRS.map(e => rowOf(e, ep, ip, ctx));
  if (o.tier !== 'all') rows = rows.filter(x => String(x.e.lv) === o.tier);
  if (o.unlockedOnly) rows = rows.filter(x => !x.locked);
  sortRows(rows, o.sort);

  if (!selected || !ELIXIRS.some(e => e.name === selected)) selected = rows[0]?.e.name ?? ELIXIRS[0].name;

  $('#alchTierSeg').innerHTML = TIERS.map(([k, l]) => `<button type="button" data-tier="${k}" class="${o.tier === k ? 'is-on' : ''}">${l}</button>`).join('');
  $('#alchTable').innerHTML = tableHtml({
    rows, sort: o.sort, grade: o.grade, selected, kindWord: '비약',
    nameOf: x => `${x.e.name}의 비약`,
    chipsOf: x => `<span class="chip stage">${x.e.vanilla ? '바닐라' : 'Lv ' + x.e.lv}</span>
      <span class="chip">${esc(x.e.effect)}</span>
      ${x.locked ? `<span class="chip lock">Lv ${x.e.lv} 해금</span>` : ''}`,
  });
  renderDetail(rowOf(ELIXIRS.find(e => e.name === selected), ep, ip, ctx), ctx, ep, o.grade);
}

function renderOptions(ctx, o) {
  const p = profile();
  $('#alchSummary').textContent = `${ctx.tier.tier}차 · 작업당 ${ctx.tier.perTask}개 · 재료 손실 방지 ${fmtNum(ctx.lvFx.lossGuard, 1)}%`;
  $('#alchOptions').innerHTML = `
    <div class="opts">
      ${stepper('alLv', p.alchLv, { label: '연금술사 숙련도' })}
      <div class="field"><label for="alGrade">판매 등급 (이 가격으로 계산)</label>${gradeSelect('alGrade', o.grade)}</div>
      <div class="field"><label for="alPestle">막자 강화 · 토트의 축복</label>
        <select class="select" id="alPestle">${toolOptions('pestle', p.tools.pestle)}</select></div>
    </div>
    <div class="row" style="gap:18px">
      <label class="check"><input type="checkbox" id="alScale" ${o.scaleIngredients ? 'checked' : ''}> 작업당 개수만큼 재료 소모</label>
      <label class="check"><input type="checkbox" id="alUnlocked" ${o.unlockedOnly ? 'checked' : ''}> 해금된 비약만</label>
    </div>`;
}

function renderDetail(x, ctx, ep, grade) {
  const e = x.e;
  const ings = elixirIngredients(e);
  const raw = ingPricesRaw(), self = selfSupply();
  const kindOf = n => n.includes('심재') ? '심재' : /강화된|순수한/.test(n) ? '광물' : n === '물병' ? '공통' : '재료';

  $('#alchDetailTitle').textContent = `${e.name}의 비약`;
  $('#alchDetail').innerHTML = `
    <div class="detail-hero">${icon(e.name, 'l')}<div><div class="dh-name">${esc(e.name)}의 비약</div>
      <div class="dh-sub">${esc(e.effect)} · ${e.vals.map((v, i) => `${ELIXIR_GRADES[i]} ${v}${e.unit}`).join(' / ')}</div>
      <div class="row" style="gap:4px;margin-top:4px"><span class="chip stage">${e.vanilla ? '바닐라' : '숙련도 ' + e.lv}</span>${freshChip(ep[e.name])}</div></div></div>
    ${metricsHtml(x, x.price)}
    <div class="field"><label for="alDetailPrice">판매가 (쿠키 / 1병${grade !== 'common' ? ' · 공식 시세 등급 가격' : ''})</label>
      <input class="input num" id="alDetailPrice"${grade !== 'common' ? ' readonly' : ''} data-price="${esc(e.name)}" type="number" min="0" placeholder="판매가" value="${x.price || ''}"></div>
    <div class="slots">${ings.map(i => `
      <div class="slot">
        <span class="nm">${icon(i.name, 's')}${esc(i.name)}</span><span class="qty num">×${i.qty}</span>
        <span class="kind">${kindOf(i.name)}</span>
        <span class="slot-price${self[i.name] ? ' is-self' : raw[i.name] ? '' : ' is-empty'}">${self[i.name] ? '직접 수급 · 0원' : raw[i.name] ? fmtNum(raw[i.name]) + ' 쿠키' : '단가 없음'}</span>
      </div>`).join('')}
    </div>
    <div class="row" style="justify-content:flex-end"><a class="btn btn-sm" href="#prices" data-goto-cat="alchIng">재료 단가 수정하기 →</a></div>
    <div class="calc-lines">
      <div class="calc-line"><span class="k">재료 1세트 (물병 포함)</span><span class="num">${fmtNum(x.perSet)} 쿠키</span></div>
      <div class="calc-line"><span class="k">작업당 재료비 (총) · 손실 방지 ${fmtNum(x.lossGuard, 1)}%</span><span class="num">${fmtNum(x.cost)} 쿠키</span></div>
      <div class="calc-line"><span class="k">작업당 결과${ctx.bonusPct ? ` (축복 +${ctx.bonusPct}%)` : ''}</span><span class="num">${fmtNum(x.made, 2)}병</span></div>
      <div class="calc-line"><span class="k">1병당 원가</span><span class="num">${fmtNum(x.unitCost, 1)} 쿠키</span></div>
      <div class="calc-line total"><span class="k">작업당 이윤</span><span class="num ${x.profit >= 0 ? 'gain' : 'loss'}">${x.hasPrice ? fmtSigned(x.profit) + ' 쿠키' : '—'}</span></div>
    </div>
    <p class="note">원가는 직접 수급 재료를 0원으로 넣어 계산해요. 재료 손실 방지는 위키 구간표를 레벨별로 나눠 근사했어요. 비약 판매기한은 ${ALCH_RULES.sellDeadlineH}시간이에요.</p>`;
}
