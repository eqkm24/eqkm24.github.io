/* ==========================================================================
   dock.js — 우측 하단 플로팅 버튼과 팝업 열고 닫기 · 끌어서 옮기기
   [data-open="이름"] 버튼 → [data-pop="이름"] 팝업. 한 번에 하나만 열림.
   닫기: ✕ 버튼 · Esc · 팝업 바깥 클릭
   옮기기: 제목줄을 잡고 끌기 (위치는 팝업마다 기억) · 제목줄 두 번 누르면 제자리
   폰 화면(560px 이하)에서는 아래 시트로 고정됩니다.
   ========================================================================== */
import * as store from './store.js';
import { $, $$, toast } from './ui.js';

const POS_KEY = 'popPos';          // { 이름: { x, y } }  (왼쪽 위 기준 px)
const MARGIN = 8;                   // 화면 가장자리 여백
const openHandlers = {};
let openName = null;
let drag = null;                    // 끄는 중인 상태

const isSheet = () => matchMedia('(max-width: 560px)').matches;

export function onOpen(name, fn) { openHandlers[name] = fn; }
export const isOpen = name => openName === name;

export function openPop(name) {
  if (openName === name) return;
  closePop(false);
  const pop = $(`[data-pop="${name}"]`);
  if (!pop) return;
  openName = name;
  pop.hidden = false;
  pop.classList.remove('is-leaving');
  applySavedPos(pop);
  $$(`.dock-btn[data-open="${name}"]`).forEach(b => { b.classList.add('is-on'); b.setAttribute('aria-expanded', 'true'); });
  openHandlers[name]?.();
}

export function closePop(animate = true) {
  if (!openName) return;
  const pop = $(`[data-pop="${openName}"]`);
  $$('.dock-btn').forEach(b => { b.classList.remove('is-on'); b.setAttribute('aria-expanded', 'false'); });
  openName = null;
  if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { pop.hidden = true; return; }
  pop.classList.add('is-leaving');
  setTimeout(() => { if (pop.classList.contains('is-leaving')) { pop.hidden = true; pop.classList.remove('is-leaving'); } }, 160);
}

/* ── 위치 ── */
function clampPos(pop, x, y) {
  const w = pop.offsetWidth, h = pop.offsetHeight;
  const maxX = innerWidth - w - MARGIN;
  const maxY = innerHeight - Math.min(h, 60) - MARGIN;   // 제목줄은 항상 화면 안에
  return { x: Math.round(Math.min(Math.max(MARGIN, x), Math.max(MARGIN, maxX))),
           y: Math.round(Math.min(Math.max(MARGIN, y), Math.max(MARGIN, maxY))) };
}
function setPos(pop, x, y) {
  pop.classList.add('is-free');
  pop.style.left = x + 'px';
  pop.style.top = y + 'px';
}
function clearPos(pop) {
  pop.classList.remove('is-free');
  pop.style.left = pop.style.top = '';
}
function applySavedPos(pop) {
  const saved = store.get(POS_KEY, {})[pop.dataset.pop];
  if (!saved || isSheet()) { clearPos(pop); return; }
  const { x, y } = clampPos(pop, saved.x, saved.y);
  setPos(pop, x, y);
}
function savePos(name, pos) {
  const all = store.get(POS_KEY, {});
  if (pos) all[name] = pos; else delete all[name];
  store.set(POS_KEY, all);
}

function initDrag() {
  document.addEventListener('pointerdown', e => {
    const head = e.target.closest('.pop-head');
    if (!head || isSheet() || e.button !== 0) return;
    if (e.target.closest('button, input, select, a, .seg')) return;   // 버튼은 그대로 누르기
    const pop = head.closest('.pop');
    const r = pop.getBoundingClientRect();
    drag = { pop, head, id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false };
    head.setPointerCapture(e.pointerId);
  });
  document.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved) { drag.moved = true; drag.pop.classList.add('is-dragging'); }
    const { x, y } = clampPos(drag.pop, e.clientX - drag.dx, e.clientY - drag.dy);
    setPos(drag.pop, x, y);
  });
  const end = e => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.pop.classList.remove('is-dragging');
    if (drag.moved) savePos(drag.pop.dataset.pop, { x: parseInt(drag.pop.style.left, 10), y: parseInt(drag.pop.style.top, 10) });
    drag = null;
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);

  // 제목줄 두 번 누르기 → 원래 자리(오른쪽 아래)
  document.addEventListener('dblclick', e => {
    const head = e.target.closest('.pop-head');
    if (!head || e.target.closest('button, input, .seg')) return;
    const pop = head.closest('.pop');
    clearPos(pop);
    savePos(pop.dataset.pop, null);
    toast('팝업을 제자리로 옮겼어요');
  });

  // 창 크기가 바뀌면 화면 밖으로 나가지 않게
  addEventListener('resize', () => {
    const pop = openName && $(`[data-pop="${openName}"]`);
    if (pop) applySavedPos(pop);
  });
}

export function initDock() {
  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      const name = opener.dataset.open;
      if (openName === name && opener.classList.contains('dock-btn')) closePop();
      else openPop(name);
      return;
    }
    if (e.target.closest('[data-close]')) { closePop(); return; }
    // composedPath: 클릭 직후 다시 그려져 떨어져 나간 버튼도 '팝업 안'으로 판단
    const inside = e.composedPath().some(el => el.classList && (el.classList.contains('pop') || el.classList.contains('ring-banner') || el.classList.contains('toast')));
    if (openName && !inside) closePop();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });
  initDrag();
}
