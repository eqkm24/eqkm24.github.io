/* ==========================================================================
   view-history.js — 시세 기록 화면
   위: 선택한 품목의 주간 꺾은선 그래프 (1일 · 3일 · 7일)
   아래: 품목별 이번 시세 · 지난 주기 대비 · 24시간 최고/최저 · 판매 신호
   ========================================================================== */
import { RECIPES, ELIXIRS } from './data.js';
import { stats, sparkline, LEVEL } from './history.js';
import { fmtNum } from './calc.js';
import { $, esc, icon } from './ui.js';

const CYCLE = 3 * 3600e3, KST = 9 * 3600e3;
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
let kind = 'cook';
let selected = null;
let days = 7;
let current = null;            // 그래프에 그린 품목 (마우스 툴팁용)

export function initHistoryView() {
  $('#histSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-kind]');
    if (b) { kind = b.dataset.kind; selected = null; renderHistoryView(); }
  });
  $('#histRange').addEventListener('click', e => {
    const b = e.target.closest('[data-days]');
    if (b) { days = +b.dataset.days; renderHistoryView(); }
  });
  $('#histTable').addEventListener('click', e => {
    const tr = e.target.closest('tr[data-name]');
    if (tr) { selected = tr.dataset.name; renderHistoryView(); $('#histDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });
  // 그래프 위 마우스/터치 → 가장 가까운 점 표시
  const onMove = e => {
    const svg = e.target.closest('.wk-chart');
    if (!svg || !current) return;
    const r = svg.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    let best = 0, bd = Infinity;
    current.pts.forEach((p, i) => { const d = Math.abs(p.x - x); if (d < bd) { bd = d; best = i; } });
    showTip(best);
  };
  $('#histDetail').addEventListener('mousemove', onMove);
  $('#histDetail').addEventListener('touchmove', onMove, { passive: true });
  $('#histDetail').addEventListener('mouseleave', () => showTip(current ? current.pts.length - 1 : -1));
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (document.querySelector('.view[data-view="history"].is-active')) renderHistoryView(); }, 150); });
}

const changeText = c => c == null ? '<span class="faint">—</span>'
  : `<span class="${c > 0 ? 'gain' : c < 0 ? 'loss' : 'muted'}">${c > 0 ? '▲' : c < 0 ? '▼' : '–'} ${Math.abs(c).toFixed(1)}%</span>`;

export function renderHistoryView() {
  $('#histSeg').querySelectorAll('button').forEach(b => b.classList.toggle('is-on', b.dataset.kind === kind));
  $('#histRange').querySelectorAll('button').forEach(b => b.classList.toggle('is-on', +b.dataset.days === days));
  const list = kind === 'cook'
    ? RECIPES.map(r => ({ key: r.name, label: r.name }))
    : ELIXIRS.map(e => ({ key: e.name, label: `${e.name}의 비약` }));
  const rows = list.map(x => ({ ...x, s: stats(kind, x.key) })).filter(x => x.s)
    .sort((a, b) => (b.s.level === 'sell') - (a.s.level === 'sell') || b.s.ratio - a.s.ratio);

  if (!rows.length) {
    $('#histTable').innerHTML = '';
    $('#histEmpty').hidden = false;
    $('#histDetail').innerHTML = '<div class="empty">기록이 쌓이면 여기 일주일 그래프가 나와요.</div>';
    current = null;
    return;
  }
  $('#histEmpty').hidden = true;
  if (!selected || !rows.some(r => r.key === selected)) selected = rows[0].key;

  $('#histTable').innerHTML = `
    <thead><tr><th>품목</th><th class="r">이번 시세</th><th class="r">지난 주기 대비</th><th class="r">24시간 최고 · 최저</th><th>최근 2일</th><th>신호</th></tr></thead>
    <tbody>${rows.map(x => `
      <tr data-name="${esc(x.key)}" class="${x.key === selected ? 'is-selected' : ''}">
        <td><div class="item-cell">${icon(x.key, 's')}<span class="name" style="font-size:var(--fs-s)">${esc(x.label)}</span></div></td>
        <td class="r num big">${fmtNum(x.s.cur)}</td>
        <td class="r num">${changeText(x.s.change)}</td>
        <td class="r num muted">${fmtNum(x.s.max)} · ${fmtNum(x.s.min)}</td>
        <td>${sparkline(x.s.series)}</td>
        <td><span class="sig ${LEVEL[x.s.level].cls}">${LEVEL[x.s.level].label}</span></td>
      </tr>`).join('')}</tbody>`;

  renderChart(rows.find(r => r.key === selected));
}

/* 보기 좋은 눈금 간격 */
function niceStep(range, count) {
  const raw = range / count, mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}
const kstDate = c => new Date(c + KST);
const hourOf = c => kstDate(c).getUTCHours();
const dayLabel = c => { const d = kstDate(c); return `${d.getUTCMonth() + 1}/${d.getUTCDate()}(${DOW[d.getUTCDay()]})`; };

function renderChart(x) {
  const s = x.s;
  const data = s.week.filter(v => v.c > s.week[s.week.length - 1].c - days * 8 * CYCLE);
  const box = $('#histDetail');
  const W = Math.max(300, Math.floor(box.clientWidth - 36 || 900));
  const H = W < 560 ? 220 : 280;
  const P = { l: 52, r: 18, t: 18, b: 34 };

  const ps = data.map(v => v.p);
  let lo = Math.min(...ps), hi = Math.max(...ps);
  const step = niceStep((hi - lo) || hi * 0.1 || 1, 4);
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  if (hi === lo) hi = lo + step;
  const t0 = data[0].c, t1 = data[data.length - 1].c;
  const X = c => P.l + (t1 === t0 ? 0.5 : (c - t0) / (t1 - t0)) * (W - P.l - P.r);
  const Y = p => P.t + (1 - (p - lo) / (hi - lo)) * (H - P.t - P.b);

  const pts = data.map(v => ({ x: X(v.c), y: Y(v.p), c: v.c, p: v.p }));
  current = { pts, label: x.label };
  const line = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // 가로 눈금
  const yTicks = [];
  for (let v = lo; v <= hi + 1e-9; v += step) yTicks.push(v);
  // 세로 눈금: 1일 = 3시간마다, 그 외 = 날짜가 바뀌는 0시
  const xTicks = days === 1
    ? data.map(v => ({ c: v.c, label: `${String(hourOf(v.c)).padStart(2, '0')}시`, day: hourOf(v.c) === 0 }))
    : data.filter(v => hourOf(v.c) === 0).map(v => ({ c: v.c, label: dayLabel(v.c), day: true }));
  const max24 = s.max;
  const showPts = days <= 3;

  box.innerHTML = `
    <div class="wk-head">
      <div class="detail-hero">${icon(x.key, 'l')}<div><div class="dh-name">${esc(x.label)}</div>
        <div class="row" style="gap:6px;margin-top:4px"><span class="sig ${LEVEL[s.level].cls}">${LEVEL[s.level].label}</span><span class="faint" style="font-size:var(--fs-xs)">최근 24시간 최고가의 ${(s.ratio * 100).toFixed(0)}%</span></div></div></div>
      <div class="wk-legend"><span><i class="lg-line"></i>시세</span><span><i class="lg-max"></i>24시간 최고</span></div>
    </div>
    <div class="wk-wrap">
      <svg class="wk-chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(x.label)} 최근 ${days}일 시세 꺾은선 그래프">
        ${yTicks.map(v => `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="wk-grid"/>
          <text x="${P.l - 8}" y="${(Y(v) + 3.5).toFixed(1)}" class="wk-y">${fmtNum(v)}</text>`).join('')}
        ${xTicks.map(t => `${t.day ? `<line x1="${X(t.c).toFixed(1)}" x2="${X(t.c).toFixed(1)}" y1="${P.t}" y2="${H - P.b}" class="wk-day"/>` : ''}
          <text x="${X(t.c).toFixed(1)}" y="${H - P.b + 18}" class="wk-x">${t.label}</text>`).join('')}
        <line x1="${P.l}" x2="${W - P.r}" y1="${Y(max24).toFixed(1)}" y2="${Y(max24).toFixed(1)}" class="wk-max"/>
        <polygon points="${pts[0].x.toFixed(1)},${H - P.b} ${line} ${pts[pts.length - 1].x.toFixed(1)},${H - P.b}" class="wk-area"/>
        <polyline points="${line}" class="wk-line"/>
        ${showPts ? pts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.6" class="wk-pt"/>`).join('') : ''}
        <g class="wk-hover">
          <line class="wk-guide" y1="${P.t}" y2="${H - P.b}"/>
          <circle class="wk-hdot" r="5.5"/>
        </g>
      </svg>
      <div class="wk-tip" role="status"></div>
    </div>
    <div class="stats">
      <div class="stat"><div class="k">이번 시세</div><div class="v num">${fmtNum(s.cur)}</div></div>
      <div class="stat"><div class="k">지난 주기 대비</div><div class="v num" style="font-size:var(--fs-m)">${changeText(s.change)}</div></div>
      <div class="stat"><div class="k">${days}일 최고</div><div class="v num">${fmtNum(Math.max(...ps))}</div></div>
      <div class="stat"><div class="k">${days}일 최저</div><div class="v num">${fmtNum(Math.min(...ps))}</div></div>
      <div class="stat"><div class="k">${days}일 평균</div><div class="v num">${fmtNum(ps.reduce((a, b) => a + b, 0) / ps.length)}</div></div>
    </div>`;
  showTip(pts.length - 1);
}

function showTip(i) {
  const svg = document.querySelector('#histDetail .wk-chart');
  const tip = document.querySelector('#histDetail .wk-tip');
  if (!svg || !current || i < 0) return;
  const p = current.pts[i];
  const g = svg.querySelector('.wk-hover');
  g.querySelector('.wk-guide').setAttribute('x1', p.x); g.querySelector('.wk-guide').setAttribute('x2', p.x);
  g.querySelector('.wk-hdot').setAttribute('cx', p.x); g.querySelector('.wk-hdot').setAttribute('cy', p.y);
  tip.innerHTML = `<b>${fmtNum(p.p)}</b> 쿠키<br><span>${dayLabel(p.c)} ${String(hourOf(p.c)).padStart(2, '0')}시${i === current.pts.length - 1 ? ' · 지금' : ''}</span>`;
  const w = svg.clientWidth;
  const left = Math.min(Math.max(p.x, 60), w - 60);
  tip.style.left = left + 'px';
  tip.style.top = Math.max(0, p.y - 58) + 'px';
}
