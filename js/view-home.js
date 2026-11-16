/* ==========================================================================
   view-home.js — 홈: 시세 시계 · 캐릭터 스펙 카드 · 추천 순위
   ========================================================================== */
import { RECIPES, ELIXIRS } from './data.js';
import { renderSpecCard } from './spec.js';
import { cookEfficiency, elixirEfficiency, fmtSigned, fmtDuration, cycleInfo } from './calc.js';
import {
  $, esc, icon, cookContext, alchContext,
  cookPrices, elixirPrices, ingPrices, priceOf, renderCycleStrip,
} from './ui.js';

export function initHome() { /* 스펙 입력은 spec.js 팝업에서 */ }

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

function renderTop() {
  const cctx = cookContext(), actx = alchContext();
  const ip = ingPrices(), cp = cookPrices(), ep = elixirPrices();

  const cook = RECIPES
    .map(r => ({ name: r.name, key: r.name, ...cookEfficiency(r, priceOf(cp, r.name), ip, cctx) }))
    .filter(r => r.hasPrice && !r.locked)
    .sort((a, b) => b.hourly - a.hourly).slice(0, 5);
  $('#homeCookTop').innerHTML = cook.length ? topList(cook)
    : `<div class="empty"><b>아직 요리 판매가가 없어요.</b><br>시세 입력에서 붙여넣거나 요리 순차익 표에서 바로 적어 주세요.</div>`;

  const alch = ELIXIRS
    .map(e => ({ name: `${e.name}의 비약`, key: e.name, ...elixirEfficiency(e, priceOf(ep, e.name), ip, actx) }))
    .filter(r => r.hasPrice && !r.locked)
    .sort((a, b) => b.hourly - a.hourly).slice(0, 5);
  $('#homeAlchTop').innerHTML = alch.length ? topList(alch)
    : `<div class="empty"><b>아직 비약 판매가가 없어요.</b><br>비약 효율 표에서 판매가를 적으면 여기 순위가 떠요.</div>`;
}
