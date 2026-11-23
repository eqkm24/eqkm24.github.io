/* ==========================================================================
   view-home.js — 홈: 시세 시계 · 지금 만들면 좋은 비약 · 지금 팔면 좋은 비약
   ========================================================================== */
import { ELIXIRS, GRADE_KEYS, GRADE_NAME } from './data.js';
import * as store from './store.js';
import { KEYS } from './store.js';
import { fmtNum, fmtDuration, cycleInfo } from './calc.js';
import { $, esc, icon, profile, renderCycleStrip } from './ui.js';
import { rangeOf, rangeBar } from './view-alchemy.js';

export function initHome() {
  // '지금 만들면 좋은' 등급 탭 (이 브라우저에만 기억)
  document.querySelectorAll('[data-hkind]').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('[data-g]');
    if (!b) return;
    store.set('homeGrade', { ...store.get('homeGrade', {}), [seg.dataset.hkind]: b.dataset.g });
    renderTop();
  }));
}

export function renderHome() {
  renderTop();
  tickHome();
}

export function tickHome() {
  const c = cycleInfo();
  $('#homeClock').textContent = fmtDuration(c.remain);
  const next = String((c.startHour + 3) % 24).padStart(2, '0');
  $('#homeClockCap').textContent = `${next}시 정각에 다음 시세로 바뀌어요`;
  renderCycleStrip($('#homeCycle'));
}

/* 공식 시세 → 해금된 비약 × 등급 줄 */
function liveRows(sel = 'all') {
  const live = (store.get(KEYS.live, {}) || {}).elixir || {};
  const lv = profile().alchLv;
  const rows = [];
  for (const e of ELIXIRS) {
    const m = live[e.name];
    if (!m || e.lv > lv) continue;
    for (const g of GRADE_KEYS) {
      if (!m[g] || (sel !== 'all' && sel !== g)) continue;
      const cur = m[g].price, r = rangeOf(e.name, g, cur);
      if (!r) continue;
      rows.push({ key: e.name, label: `${e.name}의 비약`, g, cur, r, diff: r.base - cur, pct: (cur - r.base) / r.base * 100 });
    }
  }
  return rows;
}
const WAITING = `<div class="empty"><b>공식 시세를 기다리는 중이에요.</b><br>기린월드 변동 시세가 연결되면 바로 채워져요.</div>`;

/* 사이드: 지금 팔면 좋은 비약 = -20% ~ +10% 범위에서 최고가에 가까운 순 */
function renderSell() {
  const rows = liveRows().sort((a, b) => b.r.pos - a.r.pos || b.cur - a.cur).slice(0, 6);
  $('#homeSellAlch').innerHTML = !rows.length ? WAITING : `<div class="sell-list">${rows.map(x => {
    const lvl = x.r.pos >= 0.9 ? ['지금 팔기', 'sig-sell'] : x.r.pos >= 0.67 ? ['괜찮음', 'sig-ok'] : ['기다리기', 'sig-wait'];
    return `
    <div class="sell-it">
      ${icon(x.key, 'm')}
      <div class="sell-main">
        <div class="sell-top"><span class="nm">${esc(x.label)} <span class="gchip g-${x.g}">${GRADE_NAME[x.g]}</span></span><span class="sig ${lvl[1]}">${lvl[0]}</span></div>
        <div class="sell-bot"><span class="num"><b>${fmtNum(x.cur)}</b> <span class="${x.pct >= 0 ? 'gain' : 'loss'}">${x.pct >= 0 ? '▲' : '▼'}${Math.abs(x.pct).toFixed(1)}%</span></span>
          <span class="faint num">${x.r.toMax ? `최고가까지 +${fmtNum(x.r.toMax)}` : '최고가'}</span></div>
        ${rangeBar(x.r, true)}
      </div>
    </div>`;
  }).join('')}</div>
  <p class="note" style="margin-top:6px">막대: 기준가 -20% ~ +10% 안에서 지금 값 위치 · 세로줄 = 기준가</p>`;
}

function renderTop() {
  renderSell();
  renderMakeList();
}

/* ── 지금 만들면 좋은 비약: 기준가 − 현재가 오름차순 (= 기준가보다 많이 오른 것부터) ── */
function renderMakeList() {
  const sel = (store.get('homeGrade', {}) || {}).elixir || 'all';
  const seg = document.querySelector('[data-hkind="elixir"]');
  seg.innerHTML = [['all', '전체'], ...GRADE_KEYS.map(g => [g, GRADE_NAME[g]])]
    .map(([g, l]) => `<button type="button" data-g="${g}" class="${sel === g ? 'is-on' : ''}">${l}</button>`).join('');

  const rows = liveRows(sel).sort((a, b) => a.diff - b.diff || b.pct - a.pct);
  const top = rows.slice(0, 6);
  const box = $('#homeAlchTop');
  if (!top.length) {
    box.innerHTML = Object.keys((store.get(KEYS.live, {}) || {}).elixir || {}).length
      ? `<div class="empty">이 등급은 해금된 비약 중에 공식 시세가 없어요.</div>` : WAITING;
    return;
  }
  box.innerHTML = `<div class="mini-rank make-rank">${top.map((r, i) => `
    <div class="it">
      <span class="n num">${i + 1}</span>
      <div style="min-width:0">
        <div class="nm">${icon(r.key, 's')}${esc(r.label)} <span class="gchip g-${r.g}">${GRADE_NAME[r.g]}</span></div>
        <div class="mk-sub num">기준 ${fmtNum(r.base ?? r.r.base)} → <b>${fmtNum(r.cur)}</b> · 최고 ${fmtNum(r.r.max)}</div>
        ${rangeBar(r.r, true)}
      </div>
      <span class="mk-diff num ${r.diff < 0 ? 'gain' : r.diff > 0 ? 'loss' : 'muted'}">${r.diff < 0 ? '+' : r.diff > 0 ? '−' : ''}${fmtNum(Math.abs(r.diff))}<small>${r.pct >= 0 ? '+' : ''}${r.pct.toFixed(1)}%</small></span>
    </div>`).join('')}</div>
    <p class="note" style="margin-top:6px">기준가 − 현재가 오름차순 · 숫자는 기준가보다 오른 금액 · 변동 범위 -20% ~ +10%</p>`;
}
