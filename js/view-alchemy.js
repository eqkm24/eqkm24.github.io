/* ==========================================================================
   view-alchemy.js — 비약 효율 계산기
   화면: 왼쪽 설정 · 보기 / 오른쪽 등급별 1위 요약 + 순위 카드 / 카드 누르면 상세 팝업
   비약마다 무별 · 은별 · 금별 3등급을 따로 계산합니다.
     1병당 원가  = 작업당 재료비 ÷ 작업당 나온 병 수 (등급과 무관)
     1병당 이윤  = 등급 판매가 − 1병당 원가
     마진율      = 1병당 이윤 ÷ 판매가 · 원가율 = 1병당 원가 ÷ 판매가
     시세 위치   = 기준가 -20% ~ +10% 범위 안에서 지금 값이 어디쯤인지
   판매가 입력은 '시세 입력' 탭에서만 합니다.
   ========================================================================== */
import { ELIXIRS, ALCH_RULES, GRADE_KEYS, GRADE_NAME, GRADE_SUB, PRICE_RANGE } from './data.js';
import * as store from './store.js';
import { KEYS } from './store.js';
import { elixirEfficiency, elixirIngredients, unitStats, fmtNum, fmtSigned } from './calc.js';
import {
  $, esc, profile, alchOpts, patch, clampLv, stepper, wireSteppers, alchContext,
  ingPrices, freshChip, icon, toolOptions, gradedPrices, ingPricesRaw, selfSupply,
} from './ui.js';

let selected = null;
let query = '';

const TIERS = [['all', '전체'], ['0', '바닐라'], ['1', 'Lv 1'], ['10', 'Lv 10'], ['20', 'Lv 20']];
const SORTS = [['profit', '1병당 이윤'], ['margin', '마진율'], ['pos', '시세 위치']];
const pct = v => (v == null ? '—' : `${v.toFixed(1)}%`);
const tone = v => (v == null ? 'faint' : v >= 0 ? 'gain' : 'loss');
const norm = s => String(s).replace(/\s+/g, '');

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
  const side = $('.eff-side');
  wireSteppers(side);
  side.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'alLv') patch(KEYS.profile, { alchLv: clampLv(t.value) });
    if (t.id === 'alPestle') patch(KEYS.profile, { tools: { ...profile().tools, pestle: +t.value } });
    if (t.id === 'alScale') patch(KEYS.alchOpts, { scaleIngredients: t.checked });
    if (t.id === 'alUnlocked') patch(KEYS.alchOpts, { unlockedOnly: t.checked });
  });
  side.addEventListener('click', e => {
    const g = e.target.closest('[data-sg]'), s = e.target.closest('[data-sk]'), t = e.target.closest('[data-tier]');
    if (g) patch(KEYS.alchOpts, { sortGrade: g.dataset.sg });
    if (s) patch(KEYS.alchOpts, { sort: s.dataset.sk });
    if (t) patch(KEYS.alchOpts, { tier: t.dataset.tier });
  });
  $('#effSearch').addEventListener('input', e => { query = e.target.value.trim(); renderAlchemy(); });

  /* 카드 · 요약 → 상세 팝업 */
  const open = name => { selected = name; renderAlchemy(); $('#effModal').hidden = false; document.body.classList.add('eff-lock'); $('#effModal [data-eff-close]').focus(); };
  const close = () => { $('#effModal').hidden = true; document.body.classList.remove('eff-lock'); };
  $('.eff-main').addEventListener('click', e => {
    const c = e.target.closest('[data-name]');
    if (c) open(c.dataset.name);
  });
  $('.eff-main').addEventListener('keydown', e => {
    const c = e.target.closest('[data-name]');
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(c.dataset.name); }
  });
  $('#effModal').addEventListener('click', e => { if (e.target.id === 'effModal' || e.target.closest('[data-eff-close], [data-goto-cat]')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#effModal').hidden) close(); });
  addEventListener('hashchange', close);
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
  const G = o.sortGrade;
  renderOptions(ctx, o, sort);

  const prices = Object.fromEntries(GRADE_KEYS.map(g => [g, gradedPrices('elixir', g)]));
  const ip = ingPrices();
  const all = ELIXIRS.map(e => rowOf(e, prices, ip, ctx));
  let rows = all;
  if (o.tier !== 'all') rows = rows.filter(x => String(x.e.lv) === o.tier);
  if (o.unlockedOnly) rows = rows.filter(x => !x.locked);
  if (query) rows = rows.filter(x => norm(`${x.e.name}의 비약`).includes(norm(query)));

  const val = (x, g = G) => {
    const v = x.grades[g];
    if (!v.price) return -Infinity;
    return sort === 'profit' ? v.unitProfit : sort === 'margin' ? v.margin : (v.range?.pos ?? -1);
  };
  rows.sort((a, b) => (a.locked - b.locked) || (val(b) - val(a)));
  if (!selected || !ELIXIRS.some(e => e.name === selected)) selected = rows[0]?.e.name ?? ELIXIRS[0].name;

  /* 등급별 1위 (해금된 것 중 1병당 이윤) */
  $('#effTop').innerHTML = GRADE_KEYS.map(g => {
    const best = all.filter(x => !x.locked && x.grades[g].price).sort((a, b) => b.grades[g].unitProfit - a.grades[g].unitProfit)[0];
    if (!best) return `<div class="eff-best g-${g} is-empty"><div class="eb-h"><span class="gchip g-${g}">${GRADE_NAME[g]}</span> 1위</div><div class="faint">판매가가 들어오면 보여요</div></div>`;
    const v = best.grades[g];
    return `<button type="button" class="eff-best g-${g}${G === g ? ' is-on' : ''}" data-name="${esc(best.key)}">
      <div class="eb-h"><span class="gchip g-${g}">${GRADE_NAME[g]}</span> 1위</div>
      <div class="eb-n">${icon(best.e.name, 's')}${esc(best.e.name)}의 비약</div>
      <div class="eb-v num ${tone(v.unitProfit)}">${fmtSigned(v.unitProfit)}<small>/병</small></div>
      <div class="eb-s num">판매가 ${fmtNum(v.price)} · 마진 ${pct(v.margin)}</div>
    </button>`;
  }).join('');

  $('#effCount').textContent = `${rows.length}가지 · ${GRADE_NAME[G]} 기준 ${SORTS.find(([k]) => k === sort)[1]} 순`;

  let rank = 0;
  $('#effGrid').innerHTML = rows.length ? rows.map(x => {
    const v = x.grades[G];
    const ok = !x.locked && v.price > 0;
    const none = GRADE_KEYS.every(g => !x.grades[g].price);
    if (ok) rank++;
    return `
    <article class="eff-card${x.locked ? ' is-locked' : ''}${ok && rank <= 3 ? ' is-top' : ''}${!v.price ? ' is-empty' : ''}${none ? ' is-none' : ''}" data-name="${esc(x.key)}" tabindex="0" role="button" aria-label="${esc(x.e.name)}의 비약 상세 보기">
      <div class="ec-head">
        ${ok ? `<span class="medal num${rank <= 3 ? ' m' + rank : ''}">${rank}</span>` : '<span class="medal is-none">–</span>'}
        ${icon(x.e.name, 'm')}
        <div class="ec-title"><div class="ec-name">${esc(x.e.name)}의 비약</div>
          <div class="ec-tags"><span class="chip stage">${x.e.vanilla ? '바닐라' : 'Lv ' + x.e.lv}</span>${x.locked ? `<span class="chip lock">Lv ${x.e.lv} 해금</span>` : ''}</div></div>
      </div>
      ${v.price ? `
      <div class="ec-main">
        <div><div class="kpi-k">1병당 이윤 <span class="gchip g-${G}">${GRADE_NAME[G]}</span></div>
          <div class="ec-profit num ${tone(v.unitProfit)}">${fmtSigned(v.unitProfit)}<small>쿠키</small></div></div>
        <div class="ec-kv"><span>마진율</span><b class="num ${tone(v.margin)}">${pct(v.margin)}</b><span>원가율</span><b class="num">${pct(v.costRatio)}</b></div>
      </div>
      ${v.range ? `<div class="ec-range">${rangeBar(v.range, true)}<div class="ec-rl num"><span>판매가 ${fmtNum(v.price)}</span><span>${v.range.toMax ? `최고가까지 +${fmtNum(v.range.toMax)}` : '최고가'}</span></div></div>`
        : `<div class="ec-rl num"><span>판매가 ${fmtNum(v.price)}</span><span>원가 ${fmtNum(x.unitCost, x.unitCost && x.unitCost < 10 ? 1 : 0)}</span></div>`}`
      : `<div class="ec-none">${none ? '판매가가 아직 없어요 · 시세 입력에서 넣을 수 있어요' : `${GRADE_NAME[G]} 판매가가 없어요`}</div>`}
      ${none ? '' : `<div class="ec-grades">${GRADE_KEYS.map(g => {
        const w = x.grades[g];
        return `<span class="ec-g${g === G ? ' is-on' : ''}"><span class="gchip g-${g}">${GRADE_NAME[g]}</span><b class="num">${w.price ? fmtNum(w.price) : '—'}</b>${w.price ? `<small class="num ${tone(w.unitProfit)}">${fmtSigned(w.unitProfit)}</small>` : ''}</span>`;
      }).join('')}</div>`}
    </article>`;
  }).join('') : `<div class="empty">조건에 맞는 비약이 없어요.</div>`;

  renderDetail(all.find(r => r.key === selected), ctx);
}

function renderOptions(ctx, o, sort) {
  const p = profile();
  $('#alchSummary').innerHTML = `<b>${ctx.tier.tier}차</b> · 작업당 <b>${ctx.tier.perTask}병</b> · 재료 손실 방지 <b>${fmtNum(ctx.lvFx.lossGuard, 1)}%</b>${ctx.bonusPct ? ` · 축복 <b>+${ctx.bonusPct}%</b>` : ''}`;
  if (!$('#alLv')) {   // 처음 한 번만 그림 (입력 중 포커스 유지)
    $('#alchOptions').innerHTML = `
      ${stepper('alLv', p.alchLv, { label: '연금술사 숙련도' })}
      <div class="field"><label for="alPestle">막자 강화 · 토트의 축복</label>
        <select class="select" id="alPestle">${toolOptions('pestle', p.tools.pestle)}</select></div>
      <label class="check"><input type="checkbox" id="alScale"> 작업당 개수만큼 재료 소모</label>`;
  }
  if (document.activeElement !== $('#alLv')) $('#alLv').value = p.alchLv;
  $('#alPestle').value = p.tools.pestle;
  $('#alScale').checked = !!o.scaleIngredients;
  $('#alUnlocked').checked = !!o.unlockedOnly;
  $('#effGrade').innerHTML = GRADE_KEYS.map(g => `<button type="button" role="tab" aria-selected="${o.sortGrade === g}" data-sg="${g}" class="g-${g}${o.sortGrade === g ? ' is-on' : ''}"><span class="gchip g-${g}">${GRADE_NAME[g]}</span><small>${GRADE_SUB[g]}</small></button>`).join('');
  $('#effSort').innerHTML = SORTS.map(([k, l]) => `<button type="button" data-sk="${k}" class="${sort === k ? 'is-on' : ''}">${l}</button>`).join('');
  $('#alchTierSeg').innerHTML = TIERS.map(([k, l]) => `<button type="button" data-tier="${k}" class="${o.tier === k ? 'is-on' : ''}">${l}</button>`).join('');
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
