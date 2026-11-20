/* ==========================================================================
   view-home.js — 홈: 시세 시계 · 캐릭터 스펙 카드 · 추천 순위
   ========================================================================== */
import { RECIPES, ELIXIRS } from './data.js';
import { renderSpecCard } from './spec.js';
import * as store from './store.js';
import { KEYS } from './store.js';
import { profile } from './ui.js';
import { stats, sparkline, LEVEL } from './history.js';
import { fmtNum, cookEfficiency, elixirEfficiency, fmtSigned, fmtDuration, cycleInfo } from './calc.js';
import {
  $, esc, icon, cookContext, alchContext,
  cookPrices, elixirPrices, ingPrices, priceOf, renderCycleStrip,
} from './ui.js';

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
  renderSpecCard();
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

function topList(rows) {
  if (!rows.length) return '';
  const max = Math.max(...rows.map(r => r.hourly), 1);
  return `<div class="mini-rank">${rows.map((r, i) => `
    <div class="it">
      <span class="n num">${i + 1}</span>
      <div style="min-width:0">
        <div class="nm">${icon(r.key, 's')}${esc(r.name)}</div>
        <div class="bar${r.hourly < 0 ? ' neg' : ''}"><i style="width:${Math.max(4, Math.abs(r.hourly) / max * 100)}%"></i></div>
      </div>
      <span class="num ${r.hourly >= 0 ? 'gain' : 'loss'}">${fmtSigned(r.hourly)}<span class="faint"> /시간</span></span>
    </div>`).join('')}</div>`;
}

/* 사이드: 지금 팔면 좋은 것 (시세 기록 기준) */
function sellList(kind, items) {
  const rows = items.map(x => ({ ...x, s: stats(kind, x.key) }))
    .filter(x => x.s && x.s.level !== 'stale')
    .sort((a, b) => b.s.ratio - a.s.ratio || b.s.cur - a.s.cur).slice(0, 5);
  if (!rows.length) return `<div class="empty">이번 주기 시세가 들어오면<br>최고가에 가까운 순서로 보여줘요.</div>`;
  return `<div class="sell-list">${rows.map(x => `
    <div class="sell-it">
      ${icon(x.key, 'm')}
      <div class="sell-main">
        <div class="sell-top"><span class="nm">${esc(x.label)}</span><span class="sig ${LEVEL[x.s.level].cls}">${LEVEL[x.s.level].label}</span></div>
        <div class="sell-bot">
          <span class="num"><b>${fmtNum(x.s.cur)}</b>${x.s.change == null ? '' : ` <span class="${x.s.change >= 0 ? 'gain' : 'loss'}">${x.s.change >= 0 ? '▲' : '▼'}${Math.abs(x.s.change).toFixed(0)}%</span>`}</span>
          ${sparkline(x.s.series, 64, 20)}
        </div>
        <div class="sell-meter"><i style="width:${(x.s.ratio * 100).toFixed(0)}%"></i><span>최고가의 ${(x.s.ratio * 100).toFixed(0)}%</span></div>
      </div>
    </div>`).join('')}</div>`;
}

function renderTop() {
  $('#homeSellCook').innerHTML = sellList('cook', RECIPES.map(r => ({ key: r.name, label: r.name })));
  $('#homeSellAlch').innerHTML = sellList('elixir', ELIXIRS.map(e => ({ key: e.name, label: `${e.name}의 비약` })));

  renderMakeList('cook');
  renderMakeList('elixir');
}

/* ── 지금 만들면 좋은 것: 원금액(기준가) − 변동금액(현재가) 오름차순 ──
   = 현재가가 기준가보다 많이 오른 것부터. 공식 시세의 등급별 가격 사용. */
const G_LABEL = { common: '일반', uncommon: '고급', rare: '희귀' };
function renderMakeList(kind) {
  const sel = (store.get('homeGrade', {}) || {})[kind] || 'all';
  const seg = document.querySelector(`[data-hkind="${kind}"]`);
  seg.innerHTML = [['all', '전체'], ['common', '일반'], ['uncommon', '고급'], ['rare', '희귀']]
    .map(([g, l]) => `<button type="button" data-g="${g}" class="${sel === g ? 'is-on' : ''}">${l}</button>`).join('');

  const live = (store.get(KEYS.live, {}) || {})[kind] || {};
  const p = profile();
  const lv = kind === 'cook' ? p.cookLv : p.alchLv;
  const list = kind === 'cook' ? RECIPES : ELIXIRS;
  const rows = [];
  for (const it of list) {
    const m = live[it.name];
    if (!m || it.lv > lv) continue;                       // 공식 시세 없음 · 아직 못 만드는 것 제외
    for (const g of ['common', 'uncommon', 'rare']) {
      if (!m[g] || (sel !== 'all' && sel !== g)) continue;
      const cur = m[g].price;
      const base = m[g].base ?? (m[g].pct != null ? Math.round(cur / (1 + m[g].pct / 100)) : null);
      if (base == null) continue;
      rows.push({ key: it.name, label: kind === 'cook' ? it.name : `${it.name}의 비약`, g, cur, base, diff: base - cur, pct: (cur - base) / base * 100 });
    }
  }
  rows.sort((a, b) => a.diff - b.diff || b.pct - a.pct);
  const top = rows.slice(0, 6);
  const box = document.getElementById(kind === 'cook' ? 'homeCookTop' : 'homeAlchTop');
  if (!top.length) {
    box.innerHTML = Object.keys(live).length
      ? `<div class="empty">이 등급은 해금된 ${kind === 'cook' ? '요리' : '비약'} 중에 공식 시세가 없어요.</div>`
      : `<div class="empty"><b>공식 시세를 기다리는 중이에요.</b><br>기린월드 변동 시세가 연결되면 기준가보다 많이 오른 순서로 보여줘요.</div>`;
    return;
  }
  const maxUp = Math.max(1, ...top.map(r => Math.abs(r.pct)));
  box.innerHTML = `<div class="mini-rank make-rank">${top.map((r, i) => `
    <div class="it">
      <span class="n num">${i + 1}</span>
      <div style="min-width:0">
        <div class="nm">${icon(r.key, 's')}${esc(r.label)} <span class="gchip g-${r.g}">${G_LABEL[r.g]}</span></div>
        <div class="mk-sub num">기준 ${fmtNum(r.base)} → <b>${fmtNum(r.cur)}</b></div>
        <div class="bar${r.pct < 0 ? ' neg' : ''}"><i style="width:${Math.max(4, Math.abs(r.pct) / maxUp * 100)}%"></i></div>
      </div>
      <span class="mk-diff num ${r.diff < 0 ? 'gain' : r.diff > 0 ? 'loss' : 'muted'}">${r.diff < 0 ? '+' : r.diff > 0 ? '−' : ''}${fmtNum(Math.abs(r.diff))}<small>${r.pct >= 0 ? '+' : ''}${r.pct.toFixed(1)}%</small></span>
    </div>`).join('')}</div>
    <p class="note" style="margin-top:6px">기준가 − 현재가 오름차순 · 숫자는 기준가보다 오른 금액</p>`;
}
