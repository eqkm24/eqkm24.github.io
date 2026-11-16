/* ==========================================================================
   calc.js — 순수 계산 함수 (DOM 없음, 테스트하기 쉽게)
   ========================================================================== */
import {
  TIERS, STATIONS_BY_LV, QUEUE_BY_LV, COOK_TIME, COOK_EXP, COOK_RULES,
  ALCH_TIME, ALCH_EXP, ALCH_RULES, ALCH_LV_CURVE, ELIXIRS,
} from './data.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const num = v => (Number.isFinite(+v) ? +v : 0);

/* ── 숙련도 공통 ── */
export function tierFor(lv) {
  return [...TIERS].reverse().find(t => lv >= t.fromLv) || TIERS[0];
}
export function stationsFor(lv) {
  return [...STATIONS_BY_LV].reverse().find(s => lv >= s.lv)?.count ?? 1;
}
export function queueFor(lv) {
  return [...QUEUE_BY_LV].reverse().find(q => lv >= q.lv)?.slots ?? 2;
}

/* ── 3시간 시세 주기 (KST 0·3·6·…·21시 정각) ── */
const KST = 9 * 3600e3, CYCLE = 3 * 3600e3;
export function cycleInfo(now = Date.now()) {
  const k = now + KST;
  const start = Math.floor(k / CYCLE) * CYCLE - KST;
  const end = start + CYCLE;
  const startHour = new Date(start + KST).getUTCHours();
  return { start, end, remain: end - now, progress: (now - start) / CYCLE, startHour, index: startHour / 3 };
}

/* ── 요리 ── */
export function prepTypes(recipe) {
  // 손질 대상: 물고기 + 농부 작물 (희귀 재료). 최대 3종 → 15%
  return (recipe.fish ? 1 : 0) + recipe.farm.length;
}

export function recipeIngredients(recipe) {
  const list = [];
  if (recipe.fish) list.push({ name: recipe.fish[0], qty: recipe.fish[1], kind: 'fish' });
  recipe.veg.forEach(([name, qty]) => list.push({ name, qty, kind: 'veg' }));
  recipe.farm.forEach(([name, qty]) => list.push({ name, qty, kind: 'farm' }));
  return list;
}

export function setCost(ings, prices, extra = []) {
  return [...ings, ...extra].reduce((s, i) => s + num(prices[i.name]) * i.qty, 0);
}

/**
 * 요리 1종의 효율.
 * opts: { lv, stations, prepAll, hearthPct, gourmetPct, bonusPct, scaleIngredients }
 */
export function cookEfficiency(recipe, price, ingPrices, opts) {
  const tier = tierFor(opts.lv);
  const base = recipe.vanilla || recipe.lemonade ? COOK_TIME.vanilla : COOK_TIME.normal;
  const preps = opts.prepAll ? prepTypes(recipe) : 0;
  const prepCut = clamp(preps * COOK_RULES.timePerPrep, 0, COOK_RULES.timePrepMax) / 100;
  const cycle = base * (1 - prepCut) * (1 - num(opts.hearthPct) / 100);

  const burn = Math.max(0, COOK_RULES.burnBase - preps * COOK_RULES.burnPerPrep) / 100;
  const made = tier.perTask * (1 - burn) * (1 + num(opts.bonusPct) / 100);

  const ings = recipeIngredients(recipe);
  const perSet = setCost(ings, ingPrices);
  const sets = opts.scaleIngredients ? tier.perTask : 1;
  const cost = perSet * sets * (1 - num(opts.gourmetPct) / 100);

  const revenue = num(price) * made;
  const profit = revenue - cost;
  const perHourTasks = (3600 / cycle) * opts.stations;
  const exp = recipe.vanilla ? COOK_EXP.vanilla : recipe.lemonade ? COOK_EXP.lemonade : COOK_EXP[recipe.stage];

  return {
    tier: tier.tier, perTask: tier.perTask, cycle, burn, made, perSet, cost, revenue, profit,
    perDish: profit / tier.perTask,
    hourly: profit * perHourTasks,
    expHourly: exp * made * perHourTasks,
    preps, locked: recipe.lv > opts.lv, hasPrice: num(price) > 0,
  };
}

/* ── 연금술 ── */
export function alchLvEffects(lv) {
  // 위키의 구간 누적표를 구간 안에서 선형 보간 (근사)
  let prevTime = 0, prevLoss = 0;
  for (const [from, to, time, loss] of ALCH_LV_CURVE) {
    if (lv <= to) {
      const span = to - from + 1;
      const t = (lv - from + 1) / span;
      return { timeCut: prevTime + (time - prevTime) * t, lossGuard: prevLoss + (loss - prevLoss) * t };
    }
    prevTime = time; prevLoss = loss;
  }
  return { timeCut: prevTime, lossGuard: prevLoss };
}

export function elixirIngredients(elixir) {
  return [
    ...elixir.ings.map(([name, qty]) => ({ name, qty })),
    { name: '물병', qty: ALCH_RULES.waterBottle },
  ];
}

/** opts: { lv, stations, powders, bonusPct, scaleIngredients } */
export function elixirEfficiency(elixir, price, ingPrices, opts) {
  const tier = tierFor(opts.lv);
  const { timeCut, lossGuard } = alchLvEffects(opts.lv);
  const base = elixir.vanilla ? ALCH_TIME.vanilla : ALCH_TIME.normal;
  const powderCut = clamp(num(opts.powders) * ALCH_RULES.powderTimeEach, 0, ALCH_RULES.powderTimeMax) / 100;
  const cycle = base * (1 - timeCut / 100) * (1 - powderCut);

  const made = tier.perTask * (1 + num(opts.bonusPct) / 100);
  const perSet = setCost(elixirIngredients(elixir), ingPrices);
  const sets = opts.scaleIngredients ? tier.perTask : 1;
  const cost = perSet * sets * (1 - lossGuard / 100);

  const revenue = num(price) * made;
  const profit = revenue - cost;
  const perHourTasks = (3600 / cycle) * opts.stations;
  const exp = elixir.vanilla ? ALCH_EXP.vanilla : ALCH_EXP.normal;

  return {
    tier: tier.tier, perTask: tier.perTask, cycle, timeCut, lossGuard, made, perSet, cost, revenue, profit,
    perUnit: profit / tier.perTask,
    hourly: profit * perHourTasks,
    expHourly: exp * made * perHourTasks,
    locked: elixir.lv > opts.lv, hasPrice: num(price) > 0,
  };
}

/* 화덕/미식 비약 등급(-1 = 없음) → 효과 % */
export function elixirValue(name, grade) {
  if (grade < 0) return 0;
  return ELIXIRS.find(e => e.name === name)?.vals[grade] ?? 0;
}

/* ── 디스코드 시세 붙여넣기 파서 ──
   지원 형식 (한 줄에 하나):
     🍳[감자 수프] | 120 → 135
     [화덕의 비약] 300 -> 320
     감자 수프 : 135     /   감자 수프 135
   → 뒤 숫자(바뀐 값)를 씀. */
export function parsePriceText(text, names) {
  const norm = s => s.replace(/\s+/g, '').replace(/의비약$/, '').replace(/비약$/, '');
  const index = new Map(names.map(n => [norm(n.key), n]));
  const matched = [], unmatched = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    let name = null, price = null;
    let m = line.match(/\[([^\]]+)\][^\d\[]*?([\d,]+)\s*(?:→|->|=>)\s*([\d,]+)/u);
    if (m) { name = m[1]; price = m[3]; }
    if (!m) {
      m = line.match(/\[([^\]]+)\][^\d]*([\d,]+)/u) || line.match(/^[^\p{L}\d]*([\p{L}][\p{L}\s()·]*?)\s*[:|=]?\s*([\d,]+)\s*(?:쿠키)?$/u);
      if (m) { name = m[1]; price = m[2]; }
    }
    if (!name) continue;
    const hit = index.get(norm(name.trim()));
    const value = parseInt(String(price).replace(/,/g, ''), 10);
    if (hit && Number.isFinite(value)) matched.push({ ...hit, price: value });
    else unmatched.push(name.trim());
  }
  return { matched, unmatched };
}

/* ── 포맷 ── */
let compact = false;
export function setCompact(on) { compact = !!on; }
function short(v) {
  const a = Math.abs(v);
  if (a >= 1e8) return (v / 1e8).toLocaleString('ko-KR', { maximumFractionDigits: 1 }) + '억';
  if (a >= 1e4) return (v / 1e4).toLocaleString('ko-KR', { maximumFractionDigits: 1 }) + '만';
  return null;
}
export function fmtNum(v, digits = 0) {
  if (!Number.isFinite(v)) return '—';
  if (compact && short(v)) return short(v);
  return v.toLocaleString('ko-KR', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
export function fmtSigned(v) {
  if (!Number.isFinite(v)) return '—';
  const s = (compact && short(v)) || Math.round(v).toLocaleString('ko-KR');
  return v > 0 ? '+' + s : s;
}
export function fmtDuration(ms, withHours = true) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const pad = n => String(n).padStart(2, '0');
  return withHours || h ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
export function fmtSec(sec) {
  const s = Math.round(sec * 10) / 10;
  if (s < 60) return `${s}초`;
  const m = Math.floor(s / 60), r = Math.round((s - m * 60) * 10) / 10;
  return r ? `${m}분 ${r}초` : `${m}분`;
}
