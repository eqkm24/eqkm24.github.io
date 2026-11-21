/* ==========================================================================
   calc-view.js — 효율 계산기 공용 화면 조각 (요리 · 연금 함께 사용)
   표 열: 판매가 · 원가/개 · 원가율 · 1개당 이윤 · 마진율
   상세: 1개당 실제 이윤(가장 크게) · 마진율 · 원가율
   ========================================================================== */
import { fmtNum, fmtSigned } from './calc.js';
import { esc, icon, freshChip } from './ui.js';

export const SORT_KEYS = {
  profit:    { label: '1개당 이윤', get: x => x.unitProfit, desc: true },
  margin:    { label: '마진율',     get: x => x.margin ?? -Infinity, desc: true },
  costRatio: { label: '원가율',     get: x => x.costRatio ?? Infinity, desc: false },
  price:     { label: '판매가',     get: x => x.price, desc: true },
};
export const sortKey = s => (SORT_KEYS[s] ? s : 'profit');

export function sortRows(rows, sort) {
  const k = SORT_KEYS[sortKey(sort)];
  return rows.sort((a, b) => (b.hasPrice - a.hasPrice) || (a.locked - b.locked)
    || (k.desc ? k.get(b) - k.get(a) : k.get(a) - k.get(b)));
}

const pct = v => (v == null ? '—' : `${v.toFixed(1)}%`);
const tone = v => (v == null ? 'faint' : v >= 0 ? 'gain' : 'loss');

/* 표 */
export function tableHtml({ rows, sort, grade, selected, nameOf, chipsOf, kindWord }) {
  const s = sortKey(sort);
  const th = (k, label) => `<th class="r${s === k ? ' is-sorted' : ''}" data-sort="${k}">${label}</th>`;
  let rank = 0;
  return `
    <thead><tr>
      <th class="rank">#</th><th>${kindWord}</th>
      ${th('price', '판매가')}<th class="r">원가/개</th>${th('costRatio', '원가율')}
      ${th('profit', '1개당 이윤')}${th('margin', '마진율')}
    </tr></thead>
    <tbody>${rows.map(x => {
      const name = nameOf(x);
      const ok = x.hasPrice && !x.locked;
      if (ok) rank++;
      const m = x.margin;
      return `
      <tr data-name="${esc(x.key)}" class="${x.locked ? 'is-locked' : ''}${x.key === selected ? ' is-selected' : ''}">
        <td class="rank">${ok ? `<span class="medal num${rank <= 3 ? ' m' + rank : ''}">${rank}</span>` : ''}</td>
        <td><div class="item-cell">${icon(x.key)}<div class="item-body">
          <div class="name">${esc(name)}</div>
          <div class="row" style="gap:4px;margin-top:3px">${chipsOf(x)}${freshChip(x.entry)}</div>
        </div></div></td>
        <td class="r"><input class="input num price-in" data-price="${esc(x.key)}"${grade !== 'common' ? ' readonly title="고급 · 희귀 가격은 공식 시세에서 자동으로 들어와요"' : ''} type="number" min="0" inputmode="numeric" placeholder="판매가" value="${x.price || ''}" aria-label="${esc(name)} 판매가"></td>
        <td class="r num">${fmtNum(x.unitCost, x.unitCost > 0 && x.unitCost < 10 ? 1 : 0)}</td>
        <td class="r num muted">${x.hasPrice ? pct(x.costRatio) : '—'}</td>
        <td class="r num big ${x.hasPrice ? tone(x.unitProfit) : 'faint'}">${x.hasPrice ? fmtSigned(x.unitProfit) : '<span class="faint" style="font-weight:300">판매가 입력</span>'}</td>
        <td class="r">${x.hasPrice ? `
          <div class="num ${tone(m)}" style="font-weight:700">${pct(m)}</div>
          <div class="bar${m < 0 ? ' neg' : ''}"><i style="width:${Math.min(100, Math.max(3, Math.abs(m)))}%"></i></div>` : '<span class="faint">—</span>'}</td>
      </tr>`;
    }).join('')}</tbody>`;
}

/* 상세: 핵심 지표 3개 */
export function metricsHtml(x, price) {
  if (!(price > 0)) return `<div class="empty">판매가가 있어야 이윤 · 마진율 · 원가율을 계산할 수 있어요.</div>`;
  const m = x.margin, c = x.costRatio;
  return `
    <div class="kpi-hero ${x.unitProfit >= 0 ? 'is-gain' : 'is-loss'}">
      <div class="kpi-k">1개당 실제 이윤</div>
      <div class="kpi-v num">${fmtSigned(x.unitProfit)}<small>쿠키</small></div>
      <div class="kpi-s num">판매가 ${fmtNum(price)} − 원가 ${fmtNum(x.unitCost, x.unitCost > 0 && x.unitCost < 10 ? 1 : 0)}</div>
    </div>
    <div class="kpi-pair">
      <div class="kpi">
        <div class="kpi-k">마진율 <span class="faint">수익성</span></div>
        <div class="kpi-v2 num ${tone(m)}">${pct(m)}</div>
        <div class="kpi-meter"><i class="${m < 0 ? 'neg' : ''}" style="width:${Math.min(100, Math.max(2, Math.abs(m)))}%"></i></div>
        <div class="kpi-s">판매가 중 남는 몫</div>
      </div>
      <div class="kpi">
        <div class="kpi-k">원가율 <span class="faint">총 재료비</span></div>
        <div class="kpi-v2 num">${pct(c)}</div>
        <div class="kpi-meter cost"><i style="width:${Math.min(100, Math.max(2, c))}%"></i></div>
        <div class="kpi-s num">작업당 재료비 ${fmtNum(x.cost)} 쿠키</div>
      </div>
    </div>`;
}
