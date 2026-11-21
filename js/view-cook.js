/* ==========================================================================
   view-cook.js — 효율 계산기 · 요리
   1개당 실제 이윤 · 마진율 · 원가율
   ========================================================================== */
import { RECIPES, ELIXIRS, ELIXIR_GRADES } from './data.js';
import { KEYS } from './store.js';
import { cookEfficiency, recipeIngredients, unitStats, fmtNum, fmtSigned } from './calc.js';
import {
  $, esc, profile, cookOpts, patch, clampLv, stepper, wireSteppers, cookContext,
  ingPrices, priceOf, setProductPrice, freshChip, icon, toolOptions, gradedPrices, gradeSelect, ingPricesRaw, selfSupply,
} from './ui.js';
import { tableHtml, metricsHtml, sortRows } from './calc-view.js';

let selected = null;   // 선택한 요리 이름

const STAGES = [['all', '전체'], ['vanilla', '바닐라'], ['1', '1단계'], ['2', '2단계'], ['3', '3단계']];

function elixirOptions(name, current) {
  const e = ELIXIRS.find(x => x.name === name);
  return [`<option value="-1"${current < 0 ? ' selected' : ''}>안 마심</option>`,
    ...ELIXIR_GRADES.map((g, i) => `<option value="${i}"${current === i ? ' selected' : ''}>${g} (${e.vals[i]}${e.unit})</option>`)].join('');
}

export function initCook() {
  const opts = $('#cookOptions');
  wireSteppers(opts);
  opts.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'ckLv') patch(KEYS.profile, { cookLv: clampLv(t.value) });
    if (t.id === 'ckGrade') patch(KEYS.cookOpts, { grade: t.value });
    if (t.id === 'ckGourmet') patch(KEYS.cookOpts, { gourmet: +t.value });
    if (t.id === 'ckKnife') patch(KEYS.profile, { tools: { ...profile().tools, knife: +t.value } });
    if (t.id === 'ckPrep') patch(KEYS.cookOpts, { prepAll: t.checked });
    if (t.id === 'ckScale') patch(KEYS.cookOpts, { scaleIngredients: t.checked });
    if (t.id === 'ckUnlocked') patch(KEYS.cookOpts, { unlockedOnly: t.checked });
  });
  $('#cookStageSeg').addEventListener('click', e => {
    const b = e.target.closest('button[data-stage]');
    if (b) patch(KEYS.cookOpts, { stage: b.dataset.stage });
  });
  const table = $('#cookTable');
  table.addEventListener('click', e => {
    const th = e.target.closest('th[data-sort]');
    if (th) { patch(KEYS.cookOpts, { sort: th.dataset.sort }); return; }
    if (e.target.closest('input')) return;
    const tr = e.target.closest('tr[data-name]');
    if (tr) { selected = tr.dataset.name; renderCook(); }
  });
  const onPrice = e => {
    const inp = e.target.closest('input[data-price]');
    if (inp && !inp.readOnly) setProductPrice(KEYS.cookPrices, inp.dataset.price, inp.value);
  };
  table.addEventListener('change', onPrice);
  $('#cookDetail').addEventListener('change', onPrice);
}

function rowOf(r, cp, ip, ctx) {
  const price = priceOf(cp, r.name);
  const x = cookEfficiency(r, price, ip, ctx);
  return { r, key: r.name, price, entry: cp[r.name], ...x, ...unitStats(x, price) };
}

export function renderCook() {
  const ctx = cookContext();
  const o = cookOpts();
  renderOptions(ctx, o);

  const cp = gradedPrices('cook', o.grade), ip = ingPrices();
  let rows = RECIPES.map(r => rowOf(r, cp, ip, ctx));
  if (o.stage === 'vanilla') rows = rows.filter(x => x.r.vanilla);
  else if (o.stage !== 'all') rows = rows.filter(x => String(x.r.stage) === o.stage && !x.r.vanilla);
  if (o.unlockedOnly) rows = rows.filter(x => !x.locked);
  sortRows(rows, o.sort);

  if (!selected || !RECIPES.some(r => r.name === selected)) selected = rows[0]?.r.name ?? RECIPES[0].name;

  $('#cookStageSeg').innerHTML = STAGES.map(([k, l]) => `<button type="button" data-stage="${k}" class="${o.stage === k ? 'is-on' : ''}">${l}</button>`).join('');
  $('#cookTable').innerHTML = tableHtml({
    rows, sort: o.sort, grade: o.grade, selected, kindWord: '요리',
    nameOf: x => x.r.name,
    chipsOf: x => `<span class="chip stage">${x.r.vanilla ? '바닐라' : x.r.stage + '단계'}</span>
      ${x.r.season ? `<span class="chip season">${esc(x.r.season)}</span>` : ''}
      ${x.locked ? `<span class="chip lock">Lv ${x.r.lv} 해금</span>` : ''}`,
  });
  renderDetail(rowOf(RECIPES.find(r => r.name === selected), cp, ip, ctx), ctx, cp, o.grade);
}

function renderOptions(ctx, o) {
  const p = profile();
  $('#cookSummary').textContent = `${ctx.tier.tier}차 · 작업당 ${ctx.tier.perTask}개`;
  $('#cookOptions').innerHTML = `
    <div class="opts">
      ${stepper('ckLv', p.cookLv, { label: '요리사 숙련도' })}
      <div class="field"><label for="ckGrade">판매 등급 (이 가격으로 계산)</label>${gradeSelect('ckGrade', o.grade)}</div>
      <div class="field"><label for="ckGourmet">미식의 비약 · 재료 손실 방지</label><select class="select" id="ckGourmet">${elixirOptions('미식', o.gourmet)}</select></div>
      <div class="field"><label for="ckKnife">식칼 강화 · 데메테르의 축복</label>
        <select class="select" id="ckKnife">${toolOptions('knife', p.tools.knife)}</select></div>
    </div>
    <div class="row" style="gap:18px">
      <label class="check"><input type="checkbox" id="ckPrep" ${o.prepAll ? 'checked' : ''}> 물고기 · 농부 작물 전부 손질</label>
      <label class="check"><input type="checkbox" id="ckScale" ${o.scaleIngredients ? 'checked' : ''}> 작업당 개수만큼 재료 소모</label>
      <label class="check"><input type="checkbox" id="ckUnlocked" ${o.unlockedOnly ? 'checked' : ''}> 해금된 요리만</label>
    </div>`;
}

function renderDetail(x, ctx, cp, grade) {
  const recipe = x.r;
  const ings = recipeIngredients(recipe);
  const raw = ingPricesRaw(), self = selfSupply();
  const kindLabel = { fish: '물고기 · 희귀', veg: '바닐라 작물', farm: '농부 작물 · 희귀' };

  $('#cookDetailTitle').textContent = recipe.name;
  $('#cookDetail').innerHTML = `
    <div class="detail-hero">${icon(recipe.name, 'l')}<div><div class="dh-name">${esc(recipe.name)}</div>
      <div class="row" style="gap:4px;margin-top:4px">
        <span class="chip stage">${recipe.vanilla ? '바닐라' : recipe.stage + '단계'}</span>
        <span class="chip">숙련도 ${recipe.lv}</span>${freshChip(cp[recipe.name])}
      </div></div></div>
    ${metricsHtml(x, x.price)}
    <div class="field"><label for="ckDetailPrice">판매가 (쿠키 / 1개${grade !== 'common' ? ' · 공식 시세 등급 가격' : ''})</label>
      <input class="input num" id="ckDetailPrice"${grade !== 'common' ? ' readonly' : ''} data-price="${esc(recipe.name)}" type="number" min="0" placeholder="판매가" value="${x.price || ''}"></div>
    <div class="slots">${ings.map(i => `
      <div class="slot ${i.kind}">
        <span class="nm">${icon(i.name, 's')}${esc(i.name)}</span><span class="qty num">×${i.qty}</span>
        <span class="kind">${kindLabel[i.kind]}</span>
        <span class="slot-price${self[i.name] ? ' is-self' : raw[i.name] ? '' : ' is-empty'}">${self[i.name] ? '직접 수급 · 0원' : raw[i.name] ? fmtNum(raw[i.name]) + ' 쿠키' : '단가 없음'}</span>
      </div>`).join('')}
    </div>
    <div class="row" style="justify-content:flex-end"><a class="btn btn-sm" href="#prices" data-goto-cat="cookIng">재료 단가 수정하기 →</a></div>
    <div class="calc-lines">
      <div class="calc-line"><span class="k">재료 1세트</span><span class="num">${fmtNum(x.perSet)} 쿠키</span></div>
      <div class="calc-line"><span class="k">작업당 재료비 (총)${ctx.gourmetPct ? ` · 손실 방지 ${ctx.gourmetPct}%` : ''}</span><span class="num">${fmtNum(x.cost)} 쿠키</span></div>
      <div class="calc-line"><span class="k">작업당 결과 (탄 요리 ${fmtNum(x.burn * 100, 0)}% 제외${ctx.bonusPct ? ` · 축복 +${ctx.bonusPct}%` : ''})</span><span class="num">${fmtNum(x.made, 2)}개</span></div>
      <div class="calc-line"><span class="k">1개당 원가</span><span class="num">${fmtNum(x.unitCost, 1)} 쿠키</span></div>
      <div class="calc-line total"><span class="k">작업당 이윤</span><span class="num ${x.profit >= 0 ? 'gain' : 'loss'}">${x.hasPrice ? fmtSigned(x.profit) + ' 쿠키' : '—'}</span></div>
    </div>
    <p class="note">원가는 직접 수급 재료를 0원으로 넣어 계산해요. 손질하면 탄 요리 확률이 10% → 7%로 줄어요. 희귀 요리 확률과 차수에 따른 탄 요리 감소는 위키에 수치가 없어 계산에서 뺐어요.</p>`;
}
