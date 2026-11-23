/* ==========================================================================
   view-alchemy.js — 비약 효율 계산기
   비약마다 무별 · 은별 · 금별 3등급을 따로 계산합니다.
     1병당 원가  = 작업당 재료비 ÷ 작업당 나온 병 수 (등급과 무관)
     1병당 이윤  = 등급 판매가 − 1병당 원가
     마진율      = 1병당 이윤 ÷ 판매가 · 원가율 = 1병당 원가 ÷ 판매가
     시세 위치   = 기준가 -20% ~ +10% 범위 안에서 지금 값이 어디쯤인지
   판매가 입력은 '시세 입력' 탭에서만 합니다.
   ========================================================================== */
import { ELIXIRS, ELIXIR_GRADES, ALCH_RULES, GRADE_KEYS, GRADE_NAME, GRADE_SUB, PRICE_RANGE } from './data.js';
import * as store from './store.js';
import { KEYS } from './store.js';
import { elixirEfficiency, elixirIngredients, unitStats, fmtNum, fmtSigned } from './calc.js';
import {
  $, esc, profile, alchOpts, patch, clampLv, stepper, wireSteppers, alchContext,
  ingPrices, freshChip, icon, toolOptions, gradedPrices, ingPricesRaw, selfSupply,
} from './ui.js';

let selected = null;

const TIERS = [['all', '전체'], ['0', '바닐라'], ['1', 'Lv 1'], ['10', 'Lv 10'], ['20', 'Lv 20']];
const SORTS = [['profit', '1병당 이윤'], ['margin', '마진율'], ['pos', '시세 위치']];
const pct = v => (v == null ? '—' : `${v.toFixed(1)}%`);
const tone = v => (v == null ? 'faint' : v >= 0 ? 'gain' : 'loss');

/* 기준가 · 범위 (공식 시세가 있을 때만) */
export function rangeOf(name, g, cur) {
  const m = (store.get(KEYS.live, {}) || {}).elixir?.[name]?.[g];
  const base = m?.base ?? (m?.pct != null && cur ? Math.round(cur / (1 + m.pct / 100)) : null);
  if (!base) return null;
  const min = base * (1 + PRICE_RANGE.min / 100), max = base * (1 + PRICE_RANGE.max / 100);
  const pos = cur ? Math.min(1, Math.max(0, (cur - min) / (max - min))) : null;
  return { base, min, max, pos, toMax: cur ? Math.max(0, Math.floor(max) - cur) : null };
}
export function rangeBar(r, compact = false) {
  if (!r) return '';
  const basePos = (-PRICE_RANGE.min) / (PRICE_RANGE.max - PRICE_RANGE.min) * 100;   // 기준가 위치 (약 67%)
  return `<div class="rg${compact ? ' rg-sm' : ''}" title="최저 ${fmtNum(r.min)} · 기준 ${fmtNum(r.base)} · 최고 ${fmtNum(r.max)}">
    <i class="rg-base" style="left:${basePos}%"></i>${r.pos != null ? `<i class="rg-dot" style="left:${(r.pos * 100).toFixed(1)}%"></i>` : ''}
  </div>${compact ? '' : `<div class="rg-lbl num"><span>${fmtNum(r.min)}</span><span>기준 ${fmtNum(r.base)}</span><span>${fmtNum(r.max)}</span></div>`}`;
}

export function initAlchemy() {
  const opts = $('#alchOptions');
  wireSteppers(opts);
  opts.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'alLv') patch(KEYS.profile, { alchLv: clampLv(t.value) });
    if (t.id === 'alPestle') patch(KEYS.profile, { tools: { ...profile().tools, pestle: +t.value } });
    if (t.id === 'alScale') patch(KEYS.alchOpts, { scaleIngredients: t.checked });
    if (t.id === 'alUnlocked') patch(KEYS.alchOpts, { unlockedOnly: t.checked });
  });
  $('#alchTierSeg').addEventListener('click', e => {
    const b = e.target.closest('button[data-tier]');
    if (b) patch(KEYS.alchOpts, { tier: b.dataset.tier });
  });
  $('#alchSortBar').addEventListener('click', e => {
    const g = e.target.closest('[data-sg]'), s = e.target.closest('[data-sk]');
    if (g) patch(KEYS.alchOpts, { sortGrade: g.dataset.sg });
    if (s) patch(KEYS.alchOpts, { sort: s.dataset.sk });
  });
  $('#alchTable').addEventListener('click', e => {
    const th = e.target.closest('th[data-sg]');
    if (th) { patch(KEYS.alchOpts, { sortGrade: th.dataset.sg }); return; }
    const tr = e.target.closest('tr[data-name]');
    if (tr) { selected = tr.dataset.name; renderAlchemy(); }
  });
}

function rowOf(e, prices, ip, ctx) {
  const x = elixirEfficiency(e, 0, ip, ctx);           // 원가 · 나온 병 수 (판매가와 무관)
  const grades = {};
  for (const g of GRADE_KEYS) {
    const entry = prices[g][e.name];
    const price = entry?.price || 0;
    grades[g] = { price, entry, ...unitStats(x, price), range: rangeOf(e.name, g, price) };
  }
  return { e, key: e.name, ...x, unitCost: x.made > 0 ? x.cost / x.made : 0, grades };
}

export function renderAlchemy() {
  const ctx = alchContext();
  const o = { sortGrade: 'common', ...alchOpts() };
  const sort = SORTS.some(([k]) => k === o.sort) ? o.sort : 'profit';
  renderOptions(ctx, o);

  const prices = Object.fromEntries(GRADE_KEYS.map(g => [g, gradedPrices('elixir', g)]));
  const ip = ingPrices();
  let rows = ELIXIRS.map(e => rowOf(e, prices, ip, ctx));
  if (o.tier !== 'all') rows = rows.filter(x => String(x.e.lv) === o.tier);
  if (o.unlockedOnly) rows = rows.filter(x => !x.locked);

  const val = x => {
    const g = x.grades[o.sortGrade];
    if (!g.price) return -Infinity;
    return sort === 'profit' ? g.unitProfit : sort === 'margin' ? g.margin : (g.range?.pos ?? -1);
  };
  rows.sort((a, b) => (a.locked - b.locked) || (val(b) - val(a)));
  if (!selected || !ELIXIRS.some(e => e.name === selected)) selected = rows[0]?.e.name ?? ELIXIRS[0].name;

  $('#alchTierSeg').innerHTML = TIERS.map(([k, l]) => `<button type="button" data-tier="${k}" class="${o.tier === k ? 'is-on' : ''}">${l}</button>`).join('');
  $('#alchSortBar').innerHTML = `
    <span class="faint">정렬</span>
    <div class="seg seg-sm">${GRADE_KEYS.map(g => `<button type="button" data-sg="${g}" class="${o.sortGrade === g ? 'is-on' : ''}">${GRADE_NAME[g]}</button>`).join('')}</div>
    <div class="seg seg-sm">${SORTS.map(([k, l]) => `<button type="button" data-sk="${k}" class="${sort === k ? 'is-on' : ''}">${l}</button>`).join('')}</div>`;

  let rank = 0;
  $('#alchTable').innerHTML = `
    <thead><tr>
      <th class="rank">#</th><th>비약</th><th class="r">원가/병</th>
      ${GRADE_KEYS.map(g => `<th class="r gcol${o.sortGrade === g ? ' is-sorted' : ''}" data-sg="${g}"><span class="gchip g-${g}">${GRADE_NAME[g]}</span></th>`).join('')}
    </tr></thead>
    <tbody>${rows.map(x => {
      const ok = !x.locked && x.grades[o.sortGrade].price > 0;
      if (ok) rank++;
      return `
      <tr data-name="${esc(x.key)}" class="${x.locked ? 'is-locked' : ''}${x.key === selected ? ' is-selected' : ''}">
        <td class="rank">${ok ? `<span class="medal num${rank <= 3 ? ' m' + rank : ''}">${rank}</span>` : ''}</td>
        <td><div class="item-cell">${icon(x.e.name)}<div class="item-body">
          <div class="name">${esc(x.e.name)}의 비약</div>
          <div class="row" style="gap:4px;margin-top:3px"><span class="chip stage">${x.e.vanilla ? '바닐라' : 'Lv ' + x.e.lv}</span>
            ${x.locked ? `<span class="chip lock">Lv ${x.e.lv} 해금</span>` : ''}</div>
        </div></div></td>
        <td class="r num">${x.unitCost ? fmtNum(x.unitCost, x.unitCost < 10 ? 1 : 0) : '<span class="faint">0</span>'}</td>
        ${GRADE_KEYS.map(g => {
          const v = x.grades[g];
          if (!v.price) return `<td class="r gcell${o.sortGrade === g ? ' is-sorted' : ''}"><span class="faint">—</span></td>`;
          return `<td class="r gcell${o.sortGrade === g ? ' is-sorted' : ''}">
            <div class="gc-price num">${fmtNum(v.price)}</div>
            <div class="gc-profit num ${tone(v.unitProfit)}">${fmtSigned(v.unitProfit)} <small>${pct(v.margin)}</small></div>
            ${rangeBar(v.range, true)}
          </td>`;
        }).join('')}
      </tr>`;
    }).join('')}</tbody>`;

  renderDetail(rows.find(r => r.key === selected) || rowOf(ELIXIRS.find(e => e.name === selected), prices, ip, ctx), ctx);
}

function renderOptions(ctx, o) {
  const p = profile();
  $('#alchSummary').textContent = `${ctx.tier.tier}차 · 작업당 ${ctx.tier.perTask}병 · 재료 손실 방지 ${fmtNum(ctx.lvFx.lossGuard, 1)}%`;
  $('#alchOptions').innerHTML = `
    <div class="opts">
      ${stepper('alLv', p.alchLv, { label: '연금술사 숙련도' })}
      <div class="field"><label for="alPestle">막자 강화 · 토트의 축복</label>
        <select class="select" id="alPestle">${toolOptions('pestle', p.tools.pestle)}</select></div>
    </div>
    <div class="row" style="gap:18px">
      <label class="check"><input type="checkbox" id="alScale" ${o.scaleIngredients ? 'checked' : ''}> 작업당 개수만큼 재료 소모</label>
      <label class="check"><input type="checkbox" id="alUnlocked" ${o.unlockedOnly ? 'checked' : ''}> 해금된 비약만</label>
    </div>`;
}

function renderDetail(x, ctx) {
  const e = x.e;
  const ings = elixirIngredients(e);
  const raw = ingPricesRaw(), self = selfSupply();
  const kindOf = n => n.includes('심재') ? '심재' : /강화된|순수한/.test(n) ? '광물' : n === '물병' ? '공통' : '재료';

  $('#alchDetailTitle').textContent = `${e.name}의 비약`;
  $('#alchDetail').innerHTML = `
    <div class="detail-hero">${icon(e.name, 'l')}<div><div class="dh-name">${esc(e.name)}의 비약</div>
      <div class="dh-sub">${esc(e.effect)} · ${e.vals.map((v, i) => `${GRADE_NAME[GRADE_KEYS[i]]} ${v}${e.unit}`).join(' / ')}</div></div></div>

    <div class="gcards">${GRADE_KEYS.map(g => {
      const v = x.grades[g];
      if (!v.price) return `<div class="gcard g-${g} is-empty"><div class="gcard-h"><span class="gchip g-${g}">${GRADE_NAME[g]}</span><span class="faint">${GRADE_SUB[g]}</span></div><div class="empty" style="padding:14px 6px">판매가가 없어요</div></div>`;
      return `
      <div class="gcard g-${g} ${v.unitProfit >= 0 ? 'is-gain' : 'is-loss'}">
        <div class="gcard-h"><span class="gchip g-${g}">${GRADE_NAME[g]}</span><span class="faint">${GRADE_SUB[g]}</span><span class="spacer"></span>${freshChip(v.entry)}</div>
        <div class="kpi-k">1병당 실제 이윤</div>
        <div class="gcard-v num">${fmtSigned(v.unitProfit)}<small>쿠키</small></div>
        <div class="kpi-s num">판매가 ${fmtNum(v.price)} − 원가 ${fmtNum(x.unitCost, x.unitCost > 0 && x.unitCost < 10 ? 1 : 0)}</div>
        <div class="gcard-m">
          <div><span class="kpi-k">마진율</span><b class="num ${tone(v.margin)}">${pct(v.margin)}</b></div>
          <div><span class="kpi-k">원가율</span><b class="num">${pct(v.costRatio)}</b></div>
        </div>
        ${v.range ? `<div class="gcard-r"><div class="kpi-k">시세 위치 <span class="faint">기준가 -20% ~ +10%</span></div>${rangeBar(v.range)}
          <div class="kpi-s">${v.range.toMax ? `최고가까지 <b class="num">+${fmtNum(v.range.toMax)}</b>` : '<b>최고가예요</b>'}</div></div>` : ''}
      </div>`;
    }).join('')}</div>

    <div class="slots">${ings.map(i => `
      <div class="slot">
        <span class="nm">${icon(i.name, 's')}${esc(i.name)}</span><span class="qty num">×${i.qty}</span>
        <span class="kind">${kindOf(i.name)}</span>
        <span class="slot-price${self[i.name] ? ' is-self' : raw[i.name] ? '' : ' is-empty'}">${self[i.name] ? '직접 수급 · 0원' : raw[i.name] ? fmtNum(raw[i.name]) + ' 쿠키' : '단가 없음'}</span>
      </div>`).join('')}
    </div>
    <div class="row" style="justify-content:flex-end;gap:6px">
      <a class="btn btn-sm" href="#prices" data-goto-cat="elixir">판매가 수정</a>
      <a class="btn btn-sm" href="#prices" data-goto-cat="alchIng">재료 단가 수정 →</a>
    </div>
    <div class="calc-lines">
      <div class="calc-line"><span class="k">재료 1세트 (물병 포함)</span><span class="num">${fmtNum(x.perSet)} 쿠키</span></div>
      <div class="calc-line"><span class="k">작업당 재료비 (총) · 손실 방지 ${fmtNum(x.lossGuard, 1)}%</span><span class="num">${fmtNum(x.cost)} 쿠키</span></div>
      <div class="calc-line"><span class="k">작업당 결과${ctx.bonusPct ? ` (축복 +${ctx.bonusPct}%)` : ''}</span><span class="num">${fmtNum(x.made, 2)}병</span></div>
      <div class="calc-line total"><span class="k">1병당 원가</span><span class="num">${fmtNum(x.unitCost, 1)} 쿠키</span></div>
    </div>
    <p class="note">원가는 등급과 상관없이 같고, 판매가만 등급마다 달라요. 직접 수급 재료는 0원으로 계산해요. 비약 판매기한은 ${ALCH_RULES.sellDeadlineH}시간이에요.</p>`;
}
