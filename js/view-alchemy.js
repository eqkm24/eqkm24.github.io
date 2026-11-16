/* ==========================================================================
   view-alchemy.js — 연금술 비약 효율 계산기
   ========================================================================== */
import { ELIXIRS, ELIXIR_GRADES, ALCH_RULES } from './data.js';
import { KEYS } from './store.js';
import { elixirEfficiency, elixirIngredients, fmtNum, fmtSigned, fmtSec } from './calc.js';
import {
  $, esc, profile, alchOpts, patch, clampLv, stepper, wireSteppers, alchContext,
  elixirPrices, ingPrices, priceOf, setProductPrice, setIngPrice, freshChip, icon,
} from './ui.js';

let selected = null;

const TIERS = [['all', '전체'], ['0', '바닐라'], ['1', 'Lv 1'], ['10', 'Lv 10'], ['20', 'Lv 20']];

export function initAlchemy() {
  const opts = $('#alchOptions');
  wireSteppers(opts);
  opts.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'alLv') patch(KEYS.profile, { alchLv: clampLv(t.value) });
    if (t.id === 'alStations') patch(KEYS.profile, { alchStations: Math.max(0, Math.round(+t.value || 0)) || null });
    if (t.id === 'alBonus') patch(KEYS.alchOpts, { bonusPct: Math.max(0, +t.value || 0) });
    if (t.id === 'alScale') patch(KEYS.alchOpts, { scaleIngredients: t.checked });
    if (t.id === 'alUnlocked') patch(KEYS.alchOpts, { unlockedOnly: t.checked });
  });
  opts.addEventListener('click', e => {
    const b = e.target.closest('button[data-powders]');
    if (b) patch(KEYS.alchOpts, { powders: +b.dataset.powders });
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

  const onChange = e => {
    const p = e.target.closest('input[data-price]');
    if (p) setProductPrice(KEYS.elixirPrices, p.dataset.price, p.value);
    const i = e.target.closest('input[data-ing]');
    if (i) setIngPrice(i.dataset.ing, i.value);
  };
  table.addEventListener('change', onChange);
  $('#alchDetail').addEventListener('change', onChange);
  $('#alchIngPrices').addEventListener('change', onChange);
}

export function renderAlchemy() {
  const ctx = alchContext();
  const o = alchOpts();
  renderOptions(ctx, o);

  const ep = elixirPrices(), ip = ingPrices();
  let rows = ELIXIRS.map(e => ({ e, price: priceOf(ep, e.name), entry: ep[e.name], ...elixirEfficiency(e, priceOf(ep, e.name), ip, ctx) }));
  if (o.tier !== 'all') rows = rows.filter(x => String(x.e.lv) === o.tier);
  if (o.unlockedOnly) rows = rows.filter(x => !x.locked);

  const key = { hourly: 'hourly', perUnit: 'perUnit', exp: 'expHourly', price: 'price' }[o.sort] || 'hourly';
  rows.sort((a, b) => (b.hasPrice - a.hasPrice) || (a.locked - b.locked) || (b[key] - a[key]));

  if (!selected || !ELIXIRS.some(e => e.name === selected)) selected = rows[0]?.e.name ?? ELIXIRS[0].name;

  $('#alchTierSeg').innerHTML = TIERS.map(([k, l]) => `<button type="button" data-tier="${k}" class="${o.tier === k ? 'is-on' : ''}">${l}</button>`).join('');
  renderTable(rows, o.sort);
  renderDetail(ELIXIRS.find(e => e.name === selected), ctx, ep, ip);
  renderIngPrices(ip);
}

function renderOptions(ctx, o) {
  const p = profile();
  $('#alchSummary').textContent = `${ctx.tier.tier}차 · 작업당 ${ctx.tier.perTask}개 · 연금대 ${ctx.stations}개 · 숙련 시간 −${fmtNum(ctx.lvFx.timeCut, 1)}%`;
  $('#alchOptions').innerHTML = `
    <div class="opts">
      ${stepper('alLv', p.alchLv, { label: '연금술사 숙련도' })}
      <div class="field"><label for="alStations">연금대 수 (비우면 자동 ${ctx.autoStations}개)</label>
        <input class="input num" id="alStations" type="number" min="1" max="7" placeholder="${ctx.autoStations}" value="${p.alchStations ?? ''}"></div>
      <div class="field"><span class="label">넣는 가루 (종류마다 시간 −5%)</span>
        <div class="seg" role="group" aria-label="가루 종류">
          ${[0, 1, 2].map(n => `<button type="button" data-powders="${n}" class="${o.powders === n ? 'is-on' : ''}">${['없음', '1종', '심재+광물'][n]}</button>`).join('')}
        </div></div>
      <div class="field"><label for="alBonus">추가 획득 확률 % (막자 강화)</label>
        <input class="input num" id="alBonus" type="number" min="0" step="0.5" value="${o.bonusPct}"></div>
    </div>
    <div class="row" style="gap:18px">
      <label class="check"><input type="checkbox" id="alScale" ${o.scaleIngredients ? 'checked' : ''}> 작업당 개수만큼 재료 소모</label>
      <label class="check"><input type="checkbox" id="alUnlocked" ${o.unlockedOnly ? 'checked' : ''}> 해금된 비약만</label>
    </div>`;
}

function valText(e) {
  return e.vals.map((v, i) => `${ELIXIR_GRADES[i]} ${v}${e.unit}`).join(' · ');
}

function renderTable(rows, sort) {
  const max = Math.max(1, ...rows.filter(x => x.hasPrice).map(x => Math.abs(x.hourly)));
  const th = (k, label) => `<th class="r${sort === k ? ' is-sorted' : ''}" data-sort="${k}">${label}</th>`;
  let rank = 0;
  $('#alchTable').innerHTML = `
    <thead><tr>
      <th class="rank">#</th><th>비약</th>
      ${th('price', '판매가')}<th class="r">재료비/병</th>
      ${th('perUnit', '병당 순익')}${th('hourly', '시간당 순익')}${th('exp', '경험치/시간')}
    </tr></thead>
    <tbody>${rows.map(x => {
      const ok = x.hasPrice && !x.locked;
      if (ok) rank++;
      return `
      <tr data-name="${esc(x.e.name)}" class="${x.locked ? 'is-locked' : ''}${x.e.name === selected ? ' is-selected' : ''}">
        <td class="rank">${ok ? `<span class="medal num${rank <= 3 ? ' m' + rank : ''}">${rank}</span>` : ''}</td>
        <td><div class="item-cell">${icon(x.e.name)}<div class="item-body">
          <div class="name">${esc(x.e.name)}의 비약</div>
          <div class="faint" style="font-size:11px">${esc(x.e.effect)}</div>
          <div class="row" style="gap:4px;margin-top:3px">
            <span class="chip stage">${x.e.vanilla ? '바닐라' : 'Lv ' + x.e.lv}</span>
            ${x.locked ? `<span class="chip lock">Lv ${x.e.lv} 해금</span>` : ''}
            ${freshChip(x.entry)}
          </div>
        </div></div></td>
        <td class="r"><input class="input num price-in" data-price="${esc(x.e.name)}" type="number" min="0" inputmode="numeric" placeholder="판매가" value="${x.price || ''}" aria-label="${esc(x.e.name)}의 비약 판매가"></td>
        <td class="r num">${fmtNum(x.cost / x.perTask)}</td>
        <td class="r num ${x.hasPrice ? (x.perUnit >= 0 ? 'gain' : 'loss') : 'faint'}">${x.hasPrice ? fmtSigned(x.perUnit) : '—'}</td>
        <td class="r">
          ${x.hasPrice ? `<div class="num big ${x.hourly >= 0 ? 'gain' : 'loss'}">${fmtSigned(x.hourly)}</div>
          <div class="bar${x.hourly < 0 ? ' neg' : ''}"><i style="width:${Math.max(3, Math.abs(x.hourly) / max * 100)}%"></i></div>` : '<span class="faint">판매가 입력</span>'}
        </td>
        <td class="r num muted">${fmtNum(x.expHourly)}</td>
      </tr>`;
    }).join('')}</tbody>`;
}

function renderDetail(e, ctx, ep, ip) {
  const price = priceOf(ep, e.name);
  const x = elixirEfficiency(e, price, ip, ctx);
  const ings = elixirIngredients(e);
  const tasksPerHour = 3600 / x.cycle * ctx.stations;
  const kindOf = n => n.includes('심재') ? '심재' : /강화된|순수한/.test(n) ? '광물' : n === '물병' ? '공통' : '재료';

  $('#alchDetailTitle').textContent = `${e.name}의 비약`;
  $('#alchDetail').innerHTML = `
    <div class="detail-hero">${icon(e.name, 'l')}<div><div class="dh-name">${esc(e.name)}의 비약</div><div class="dh-sub">${esc(e.effect)}</div></div></div>
    <div class="row" style="gap:4px">
      <span class="chip stage">${e.vanilla ? '바닐라' : '숙련도 ' + e.lv}</span>
      <span class="chip">${esc(e.effect)}</span>
      ${freshChip(ep[e.name])}
    </div>
    <p class="note">${valText(e)}</p>
    <div class="field"><label for="alDetailPrice">판매가 (쿠키 / 1병)</label>
      <input class="input num" id="alDetailPrice" data-price="${esc(e.name)}" type="number" min="0" placeholder="판매가" value="${price || ''}"></div>
    <div class="slots">${ings.map(i => `
      <div class="slot">
        <span class="nm">${icon(i.name, 's')}${esc(i.name)}</span><span class="qty num">×${i.qty}</span>
        <span class="kind">${kindOf(i.name)}</span>
        <input class="input num" data-ing="${esc(i.name)}" type="number" min="0" step="any" placeholder="단가" value="${ip[i.name] ?? ''}" aria-label="${esc(i.name)} 단가">
      </div>`).join('')}
    </div>
    <div class="calc-lines">
      <div class="calc-line"><span class="k">1회 제작 시간</span><span class="num">${fmtSec(x.cycle)}</span></div>
      <div class="calc-line"><span class="k">작업당 결과</span><span class="num">${fmtNum(x.made, 2)}병</span></div>
      <div class="calc-line"><span class="k">재료 1세트 (물병 포함)</span><span class="num">${fmtNum(x.perSet)} 쿠키</span></div>
      <div class="calc-line"><span class="k">작업당 재료비 (손실 방지 ${fmtNum(x.lossGuard, 1)}%)</span><span class="num ${x.cost ? 'loss' : 'faint'}">${x.cost ? '−' : ''}${fmtNum(x.cost)}</span></div>
      <div class="calc-line"><span class="k">작업당 매출</span><span class="num gain">+${fmtNum(x.revenue)}</span></div>
      <div class="calc-line"><span class="k">작업당 순익</span><span class="num ${x.profit >= 0 ? 'gain' : 'loss'}">${fmtSigned(x.profit)}</span></div>
      <div class="calc-line"><span class="k">시간당 작업 (연금대 ${ctx.stations}개)</span><span class="num">${fmtNum(tasksPerHour, 1)}회</span></div>
      <div class="calc-line total"><span class="k">시간당 순익</span><span class="num ${x.hourly >= 0 ? 'gain' : 'loss'}">${x.hasPrice ? fmtSigned(x.hourly) + ' 쿠키' : '판매가를 넣어 주세요'}</span></div>
    </div>
    <p class="note">기본 시간은 바닐라 30초, 그 외 56초예요. 숙련도 시간 감소와 재료 손실 방지는 위키 구간표를 레벨별로 나눠 근사했어요. 희귀 비약으로 나오는 확률은 판매가 차이를 알 수 없어 뺐어요. 판매기한은 ${ALCH_RULES.sellDeadlineH}시간이에요.</p>`;
}

function renderIngPrices(ip) {
  const all = new Set();
  ELIXIRS.forEach(e => elixirIngredients(e).forEach(i => all.add(i.name)));
  const groups = { 심재: [], 광물: [], '기타 재료': [] };
  [...all].forEach(n => {
    if (n.includes('심재')) groups['심재'].push(n);
    else if (/강화된|순수한/.test(n)) groups['광물'].push(n);
    else groups['기타 재료'].push(n);
  });
  $('#alchIngPrices').innerHTML = `<div class="grid-2" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">${
    Object.entries(groups).map(([title, list]) => `
      <div class="price-group">
        <h3>${title} <span class="chip">${list.length}</span></h3>
        ${list.map(n => `
          <div class="price-row"><span class="pr-name">${icon(n, 's')}${esc(n)}</span>
            <input class="input num" data-ing="${esc(n)}" type="number" min="0" step="any" placeholder="0" value="${ip[n] ?? ''}" aria-label="${esc(n)} 단가"></div>`).join('')}
      </div>`).join('')
  }</div>`;
}

export function selectedAlchCycle() {
  const e = ELIXIRS.find(x => x.name === selected) || ELIXIRS[6];
  return { name: `${e.name}의 비약`, sec: elixirEfficiency(e, 0, {}, alchContext()).cycle };
}
