/* ==========================================================================
   view-cook.js — 요리 순차익 계산기
   ========================================================================== */
import { RECIPES, ELIXIRS, ELIXIR_GRADES, COOK_RULES } from './data.js';
import { KEYS } from './store.js';
import { cookEfficiency, recipeIngredients, fmtNum, fmtSigned, fmtSec } from './calc.js';
import {
  $, esc, profile, cookOpts, patch, clampLv, stepper, wireSteppers, cookContext,
  cookPrices, ingPrices, priceOf, setProductPrice, setIngPrice, freshChip, icon, toolOptions, gradedPrices, gradeSelect, ingPricesRaw, selfSupply, toggleSelf,
} from './ui.js';

let selected = null;   // 선택한 요리 이름

const STAGES = [
  ['all', '전체'], ['vanilla', '바닐라'], ['1', '1단계'], ['2', '2단계'], ['3', '3단계'],
];
const SORTS = { hourly: '시간당 순익', perDish: '개당 순익', exp: '시간당 경험치', price: '판매가' };

function gradeOptions(name, current) {
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
    if (t.id === 'ckStations') patch(KEYS.profile, { cookStations: Math.max(0, Math.round(+t.value || 0)) || null });
    if (t.id === 'ckHearth') patch(KEYS.cookOpts, { hearth: +t.value });
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
  table.addEventListener('change', e => {
    const inp = e.target.closest('input[data-price]');
    if (inp) setProductPrice(KEYS.cookPrices, inp.dataset.price, inp.value);
  });

  const onIng = e => {
    const inp = e.target.closest('input[data-ing]');
    if (inp) setIngPrice(inp.dataset.ing, inp.value);
  };
  $('#cookDetail').addEventListener('change', onIng);
  $('#cookDetail').addEventListener('change', e => {
    const inp = e.target.closest('input[data-price]');
    if (inp) setProductPrice(KEYS.cookPrices, inp.dataset.price, inp.value);
  });
}

export function renderCook() {
  const ctx = cookContext();
  const o = cookOpts();
  renderOptions(ctx, o);

  const cp = gradedPrices('cook', o.grade), ip = ingPrices();
  let rows = RECIPES.map(r => ({ r, price: priceOf(cp, r.name), entry: cp[r.name], ...cookEfficiency(r, priceOf(cp, r.name), ip, ctx) }));

  if (o.stage === 'vanilla') rows = rows.filter(x => x.r.vanilla);
  else if (o.stage !== 'all') rows = rows.filter(x => String(x.r.stage) === o.stage && !x.r.vanilla);
  if (o.unlockedOnly) rows = rows.filter(x => !x.locked);

  const key = { hourly: 'hourly', perDish: 'perDish', exp: 'expHourly', price: 'price' }[o.sort] || 'hourly';
  rows.sort((a, b) => (b.hasPrice - a.hasPrice) || (a.locked - b.locked) || (b[key] - a[key]));

  if (!selected || !RECIPES.some(r => r.name === selected)) selected = rows[0]?.r.name ?? RECIPES[0].name;

  $('#cookStageSeg').innerHTML = STAGES.map(([k, l]) => `<button type="button" data-stage="${k}" class="${o.stage === k ? 'is-on' : ''}">${l}</button>`).join('');
  renderTable(rows, o.sort, o.grade);
  renderDetail(RECIPES.find(r => r.name === selected), ctx, cp, ip, o.grade);
}

function renderOptions(ctx, o) {
  const p = profile();
  $('#cookSummary').textContent = `${ctx.tier.tier}차 · 작업당 ${ctx.tier.perTask}개 · 조리대 ${ctx.stations}개`;
  $('#cookOptions').innerHTML = `
    <div class="opts">
      ${stepper('ckLv', p.cookLv, { label: '요리사 숙련도' })}
      <div class="field"><label for="ckStations">조리대 수 (비우면 자동 ${ctx.autoStations}개)</label>
        <input class="input num" id="ckStations" type="number" min="1" max="7" placeholder="${ctx.autoStations}" value="${p.cookStations ?? ''}"></div>
      <div class="field"><label for="ckGrade">판매 등급 (이 가격으로 계산)</label>${gradeSelect('ckGrade', o.grade)}</div>
      <div class="field"><label for="ckHearth">화덕의 비약 · 요리 시간</label><select class="select" id="ckHearth">${gradeOptions('화덕', o.hearth)}</select></div>
      <div class="field"><label for="ckGourmet">미식의 비약 · 재료 손실 방지</label><select class="select" id="ckGourmet">${gradeOptions('미식', o.gourmet)}</select></div>
      <div class="field"><label for="ckKnife">식칼 강화 · 데메테르의 축복</label>
        <select class="select" id="ckKnife">${toolOptions('knife', p.tools.knife)}</select></div>
    </div>
    <div class="row" style="gap:18px">
      <label class="check"><input type="checkbox" id="ckPrep" ${o.prepAll ? 'checked' : ''}> 물고기 · 농부 작물 전부 손질</label>
      <label class="check"><input type="checkbox" id="ckScale" ${o.scaleIngredients ? 'checked' : ''}> 작업당 개수만큼 재료 소모</label>
      <label class="check"><input type="checkbox" id="ckUnlocked" ${o.unlockedOnly ? 'checked' : ''}> 해금된 요리만</label>
    </div>`;
}

function renderTable(rows, sort, grade = 'common') {
  const max = Math.max(1, ...rows.filter(x => x.hasPrice).map(x => Math.abs(x.hourly)));
  const th = (k, label, cls = 'r') => `<th class="${cls}${sort === k ? ' is-sorted' : ''}" data-sort="${k}">${label}</th>`;
  let rank = 0;
  $('#cookTable').innerHTML = `
    <thead><tr>
      <th class="rank">#</th><th>요리</th>
      ${th('price', '판매가')}<th class="r">재료비/개</th>
      ${th('perDish', '개당 순익')}${th('hourly', '시간당 순익')}${th('exp', '경험치/시간')}
    </tr></thead>
    <tbody>${rows.map(x => {
      const ok = x.hasPrice && !x.locked;
      if (ok) rank++;
      return `
      <tr data-name="${esc(x.r.name)}" class="${x.locked ? 'is-locked' : ''}${x.r.name === selected ? ' is-selected' : ''}">
        <td class="rank">${ok ? `<span class="medal num${rank <= 3 ? ' m' + rank : ''}">${rank}</span>` : ''}</td>
        <td><div class="item-cell">${icon(x.r.name)}<div class="item-body">
          <div class="name">${esc(x.r.name)}</div>
          <div class="row" style="gap:4px;margin-top:3px">
            <span class="chip stage">${x.r.vanilla ? '바닐라' : x.r.stage + '단계'}</span>
            ${x.r.season ? `<span class="chip season">${esc(x.r.season)}</span>` : ''}
            ${x.locked ? `<span class="chip lock">Lv ${x.r.lv} 해금</span>` : ''}
            ${freshChip(x.entry)}
          </div>
        </div></div></td>
        <td class="r"><input class="input num price-in" data-price="${esc(x.r.name)}"${grade !== 'common' ? ' readonly title="고급 · 희귀 가격은 공식 시세에서 자동으로 들어와요"' : ''} type="number" min="0" inputmode="numeric" placeholder="판매가" value="${x.price || ''}" aria-label="${esc(x.r.name)} 판매가"></td>
        <td class="r num">${fmtNum(x.cost / x.perTask)}</td>
        <td class="r num ${x.hasPrice ? (x.perDish >= 0 ? 'gain' : 'loss') : 'faint'}">${x.hasPrice ? fmtSigned(x.perDish) : '—'}</td>
        <td class="r">
          ${x.hasPrice ? `<div class="num big ${x.hourly >= 0 ? 'gain' : 'loss'}">${fmtSigned(x.hourly)}</div>
          <div class="bar${x.hourly < 0 ? ' neg' : ''}"><i style="width:${Math.max(3, Math.abs(x.hourly) / max * 100)}%"></i></div>` : '<span class="faint">판매가 입력</span>'}
        </td>
        <td class="r num muted">${fmtNum(x.expHourly)}</td>
      </tr>`;
    }).join('')}</tbody>`;
}

function renderDetail(recipe, ctx, cp, ip, grade = 'common') {
  const price = priceOf(cp, recipe.name);
  const x = cookEfficiency(recipe, price, ip, ctx);
  const ings = recipeIngredients(recipe);
  const raw = ingPricesRaw(), self = selfSupply();
  const kindLabel = { fish: '물고기 · 희귀', veg: '바닐라 작물', farm: '농부 작물 · 희귀' };
  const tasksPerHour = 3600 / x.cycle * ctx.stations;

  $('#cookDetailTitle').textContent = recipe.name;
  $('#cookDetail').innerHTML = `
    <div class="detail-hero">${icon(recipe.name, 'l')}<div><div class="dh-name">${esc(recipe.name)}</div><div class="dh-sub">${recipe.fish ? esc(recipe.fish[0]) + ' 요리' : '바닐라 재료 요리'}</div></div></div>
    <div class="row" style="gap:4px">
      <span class="chip stage">${recipe.vanilla ? '바닐라' : recipe.stage + '단계'}</span>
      <span class="chip">숙련도 ${recipe.lv}</span>
      ${recipe.season ? `<span class="chip season">재료 계절 ${esc(recipe.season)}</span>` : ''}
      ${freshChip(cp[recipe.name])}
    </div>
    <div class="field"><label for="ckDetailPrice">판매가 (쿠키 / 1개)</label>
      <input class="input num" id="ckDetailPrice"${grade !== 'common' ? ' readonly' : ''} data-price="${esc(recipe.name)}" type="number" min="0" placeholder="판매가" value="${price || ''}"></div>
    <div class="slots">${ings.map(i => `
      <div class="slot ${i.kind}">
        <span class="nm">${icon(i.name, 's')}${esc(i.name)}</span><span class="qty num">×${i.qty}</span>
        <span class="kind">${kindLabel[i.kind]}</span>
        <span class="slot-price${self[i.name] ? ' is-self' : raw[i.name] ? '' : ' is-empty'}">${self[i.name] ? '직접 수급 · 0원' : raw[i.name] ? fmtNum(raw[i.name]) + ' 쿠키' : '단가 없음'}</span>
      </div>`).join('')}
    </div>
    <div class="row" style="justify-content:flex-end"><a class="btn btn-sm" href="#prices" data-goto-cat="cookIng">재료 단가 수정하기 →</a></div>
    <div class="calc-lines">
      <div class="calc-line"><span class="k">1회 작업 시간${x.preps ? ` (손질 ${x.preps}종)` : ''}</span><span class="num">${fmtSec(x.cycle)}</span></div>
      <div class="calc-line"><span class="k">작업당 결과 (탄 요리 ${fmtNum(x.burn * 100, 0)}% 제외)</span><span class="num">${fmtNum(x.made, 2)}개</span></div>
      <div class="calc-line"><span class="k">재료 1세트</span><span class="num">${fmtNum(x.perSet)} 쿠키</span></div>
      <div class="calc-line"><span class="k">작업당 재료비${ctx.gourmetPct ? ` (손실 방지 ${ctx.gourmetPct}%)` : ''}</span><span class="num ${x.cost ? 'loss' : 'faint'}">${x.cost ? '−' : ''}${fmtNum(x.cost)}</span></div>
      <div class="calc-line"><span class="k">작업당 매출</span><span class="num gain">+${fmtNum(x.revenue)}</span></div>
      <div class="calc-line"><span class="k">작업당 순익</span><span class="num ${x.profit >= 0 ? 'gain' : 'loss'}">${fmtSigned(x.profit)}</span></div>
      <div class="calc-line"><span class="k">시간당 작업 (조리대 ${ctx.stations}개)</span><span class="num">${fmtNum(tasksPerHour, 1)}회</span></div>
      <div class="calc-line total"><span class="k">시간당 순익</span><span class="num ${x.hourly >= 0 ? 'gain' : 'loss'}">${x.hasPrice ? fmtSigned(x.hourly) + ' 쿠키' : '판매가를 넣어 주세요'}</span></div>
    </div>
    <p class="note">손질하면 재료 종류마다 시간 −${COOK_RULES.timePerPrep}% (최대 ${COOK_RULES.timePrepMax}%), 탄 요리 확률 10% → 7%. 희귀 요리 확률과 차수에 따른 탄 요리 감소는 위키에 수치가 없어 계산에서 뺐어요.</p>`;
}


/* 타이머 프리셋에서 쓰는 선택 요리의 작업 시간 */
export function selectedCookCycle() {
  const r = RECIPES.find(x => x.name === selected) || RECIPES[2];
  return { name: r.name, sec: cookEfficiency(r, 0, {}, cookContext()).cycle };
}
