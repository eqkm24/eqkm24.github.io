/* ==========================================================================
   history.js — 시세 기록 · 판매 신호
   판매가가 들어올 때마다 3시간 주기별로 한 점씩 기록합니다.
   같은 주기에 다시 넣으면 그 주기 값만 고칩니다. 최근 7일(56주기)만 보관.

   판매 신호 (최근 24시간 = 8주기 기준)
     sell : 이번 시세가 최근 최고가의 97% 이상 → 지금 팔기 좋음
     ok   : 90% 이상                          → 팔아도 괜찮음
     wait : 그 아래                           → 기다려 보기
     stale: 이번 주기 시세가 아직 안 들어옴
   ========================================================================== */
import * as store from './store.js';
import { KEYS } from './store.js';
import { cycleInfo } from './calc.js';

const CYCLE = 3 * 3600e3;
const KEEP = 56;
const EMPTY = { cook: {}, elixir: {} };

export const history = () => ({ ...EMPTY, ...store.get(KEYS.history, {}) });

export function record(kind, map) {
  store.update(KEYS.history, EMPTY, h => {
    h[kind] = h[kind] || {};
    for (const [name, e] of Object.entries(map || {})) {
      if (!e?.price) continue;
      const c = cycleInfo(e.at).start;
      const arr = (h[kind][name] = h[kind][name] || []);
      const last = arr[arr.length - 1];
      if (last && last.c === c) last.p = e.price;
      else if (!last || last.c < c) arr.push({ c, p: e.price });
      if (arr.length > KEEP) arr.splice(0, arr.length - KEEP);
    }
    return h;
  });
}

export function initHistory() {
  store.on(KEYS.elixirPrices, m => record('elixir', m));
}

export function stats(kind, name) {
  const arr = history()[kind]?.[name] || [];
  if (!arr.length) return null;
  const cur = arr[arr.length - 1];
  const recent = arr.filter(x => x.c >= cur.c - 7 * CYCLE);
  const ps = recent.map(x => x.p);
  const max = Math.max(...ps), min = Math.min(...ps);
  const prev = arr.length > 1 ? arr[arr.length - 2] : null;
  const ratio = cur.p / max;
  const fresh = cur.c === cycleInfo().start;
  const level = !fresh ? 'stale' : recent.length < 3 ? 'new' : ratio >= 0.97 ? 'sell' : ratio >= 0.9 ? 'ok' : 'wait';
  return {
    cur: cur.p, prev: prev?.p ?? null,
    change: prev ? (cur.p - prev.p) / prev.p * 100 : null,
    max, min, ratio, toMax: max - cur.p, level, series: arr.slice(-16),
    week: arr.filter(x => x.c > cur.c - 56 * CYCLE),
  };
}

export const LEVEL = {
  sell:  { label: '지금 팔기', cls: 'sig-sell' },
  ok:    { label: '괜찮음',    cls: 'sig-ok' },
  wait:  { label: '기다리기',  cls: 'sig-wait' },
  new:   { label: '기록 쌓는 중', cls: 'sig-new' },
  stale: { label: '지난 시세', cls: 'sig-stale' },
};

/* ── 작은 추이 그래프 (SVG) ── */
export function sparkline(series, w = 96, h = 28) {
  if (!series || series.length < 2) return `<svg class="spark" width="${w}" height="${h}" aria-hidden="true"></svg>`;
  const ps = series.map(x => x.p);
  const lo = Math.min(...ps), hi = Math.max(...ps), span = hi - lo || 1;
  const pad = 3;
  const pts = ps.map((p, i) => [pad + i * (w - pad * 2) / (ps.length - 1), h - pad - (p - lo) / span * (h - pad * 2)]);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <polygon points="${pad},${h - pad} ${line} ${lx.toFixed(1)},${h - pad}" class="spark-area"/>
    <polyline points="${line}" class="spark-line"/>
    <circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.8" class="spark-dot"/>
  </svg>`;
}
