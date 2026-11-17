/* ==========================================================================
   app.js — 시작점: 화면 전환(#해시) · 1초 시계 · 저장값 변경 시 다시 그리기
   새 화면을 추가하려면:
     1) index.html에 <section class="view" data-view="이름"> 와 메뉴 버튼 추가
     2) view-이름.js 에 init/render 작성
     3) 아래 VIEWS 에 등록
   ========================================================================== */
import * as store from './store.js';
import { KEYS } from './store.js';
import { cycleInfo, fmtDuration } from './calc.js';
import { $, $$ } from './ui.js';
import { initHome, renderHome, tickHome } from './view-home.js';
import { initCook, renderCook } from './view-cook.js';
import { initAlchemy, renderAlchemy } from './view-alchemy.js';
import { initAlarm, renderAlarm, tickAlarm } from './view-alarm.js';
import { initDock } from './dock.js';
import { initSettings, renderSettings } from './settings.js';
import { initSync } from './sync.js';
import { initSpec } from './spec.js';
import { initHistory } from './history.js';
import { initHistoryView, renderHistoryView } from './view-history.js';
import { initPrices, renderPrices } from './view-prices.js';

const VIEWS = {
  home:    { init: initHome,    render: renderHome,    tick: tickHome },
  cook:    { init: initCook,    render: renderCook },
  alchemy: { init: initAlchemy, render: renderAlchemy },
  history: { init: initHistoryView, render: renderHistoryView },
  prices:  { init: initPrices,  render: renderPrices },
};

let current = 'home';

function show(name) {
  if (!VIEWS[name]) name = 'home';
  current = name;
  $$('.view').forEach(v => v.classList.toggle('is-active', v.dataset.view === name));
  $$('.menu-btn').forEach(b => b.classList.toggle('is-active', b.dataset.view === name));
  VIEWS[name].render();
}

function tick() {
  const c = cycleInfo();
  $('#marketChipLeft').textContent = fmtDuration(c.remain);
  $('#marketChip').classList.toggle('is-soon', c.remain < 10 * 60e3);
  VIEWS[current].tick?.();
  tickAlarm();   // 알람은 어느 화면에서든 울리도록 항상 확인

  // 주기가 바뀌면 '이번 시세' 표시를 새로 그림
  if (tick.lastStart && tick.lastStart !== c.start) VIEWS[current].render();
  tick.lastStart = c.start;
}

/* 저장값이 바뀌면 지금 화면만 다시 그림 (알람은 팝업만) */
Object.values(KEYS).forEach(k => {
  if (k === KEYS.alarms) store.on(k, () => renderAlarm());
  else store.on(k, () => VIEWS[current].render());
});

Object.values(VIEWS).forEach(v => v.init());
initDock();
initAlarm();
initSettings();
initSpec();
initHistory();
renderSettings();
renderAlarm();
initSync();   // firebase-config.js 가 채워져 있으면 DB 연동 시작
window.addEventListener('hashchange', () => show(location.hash.slice(1)));
show(location.hash.slice(1) || 'home');
tick();
setInterval(tick, 1000);
