/* ==========================================================================
   view-alarm.js — 다용도 알람
   방식 3가지
     at     : 정한 시각 (한 번 / 매일)
     after  : 지금부터 N분 뒤 (한 번)
     market : 변동 시세 갱신(0·3·…·21시) N분 전, 3시간마다 반복
   알람마다 다음에 울릴 시각(nextAt, ms)을 저장하고, 1초마다 확인합니다.
   페이지를 닫아 둔 사이 지나간 알람은 소리 없이 '놓침'으로 표시합니다.
   ========================================================================== */
import * as store from './store.js';
import { KEYS } from './store.js';
import { cycleInfo, fmtDuration } from './calc.js';
import { $, esc, toast } from './ui.js';
import { isOpen, onOpen } from './dock.js';

const MIN = 60e3, DAY = 86400e3, CYCLE = 3 * 3600e3;
const RING_GRACE = 60e3;          // 이 시간 안에 확인하면 울림, 넘으면 '놓침'
const RING_MAX = 90e3;            // 계속 울리는 최대 시간

const form = { mode: 'at', repeat: 'once', offset: 0 };
const ringing = new Map();        // id → 울리기 시작한 시각
let audioCtx = null, lastBeep = 0;

const alarms = () => store.get(KEYS.alarms, []);
const saveAlarms = list => store.set(KEYS.alarms, list);

/* ── 다음 울릴 시각 ── */
function nextAt(a, from = Date.now()) {
  if (a.mode === 'after') return a.at;
  if (a.mode === 'market') {
    let t = cycleInfo(from).end - a.offset * MIN;
    while (t <= from) t += CYCLE;
    return t;
  }
  // at: 오늘 HH:MM, 지났으면 내일
  const [h, m] = a.time.split(':').map(Number);
  const d = new Date(from);
  d.setHours(h, m, 0, 0);
  let t = d.getTime();
  if (t <= from) t += DAY;
  return t;
}

function describe(a) {
  if (a.mode === 'after') return `${a.minutes}분 타이머`;
  if (a.mode === 'market') return a.offset ? `시세 갱신 ${a.offset}분 전 · 3시간마다` : '시세 갱신 정각 · 3시간마다';
  return `${a.time} · ${a.repeat === 'daily' ? '매일' : '한 번'}`;
}
function clockText(ms) {
  const d = new Date(ms);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diffDay = Math.floor((new Date(ms).setHours(0, 0, 0, 0) - today) / DAY);
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return diffDay === 0 ? `오늘 ${hm}` : diffDay === 1 ? `내일 ${hm}` : `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}

/* ── 초기화 ── */
function showTab(tab) {
  $('#alTabSeg').querySelectorAll('button').forEach(b => b.classList.toggle('is-on', b.dataset.tab === tab));
  document.querySelectorAll('#popAlarm [data-tabpane]').forEach(p => { p.hidden = p.dataset.tabpane !== tab; });
  if (tab === 'add') setTimeout(() => $('#alName').focus(), 30);
}

export function initAlarm() {
  const f = $('#alarmForm');
  $('#alTabSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]');
    if (b) showTab(b.dataset.tab);
  });
  onOpen('alarm', () => { showTab(alarms().length ? 'list' : 'add'); renderAlarm(); });

  $('#alModeSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    form.mode = b.dataset.mode;
    syncForm();
  });
  $('#alRepeatSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-repeat]');
    if (b) { form.repeat = b.dataset.repeat; syncForm(); }
  });
  $('#alOffsetSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-offset]');
    if (b) { form.offset = +b.dataset.offset; syncForm(); }
  });
  $('#alQuick').addEventListener('click', e => {
    const b = e.target.closest('[data-min]');
    if (b) { $('#alAfter').value = b.dataset.min; syncForm(); }
  });
  f.addEventListener('input', syncForm);

  f.addEventListener('submit', e => {
    e.preventDefault();
    unlockAudio();
    const now = Date.now();
    const label = $('#alName').value.trim();
    let a = { id: 'a' + now.toString(36), label, mode: form.mode, on: true, created: now };

    if (form.mode === 'at') {
      const time = $('#alTime').value;
      if (!time) { toast('울릴 시각을 정해 주세요'); $('#alTime').focus(); return; }
      a = { ...a, time, repeat: form.repeat };
    } else if (form.mode === 'after') {
      const minutes = Math.round(+$('#alAfter').value || 0);
      if (minutes < 1) { toast('1분 이상으로 정해 주세요'); return; }
      a = { ...a, minutes, at: now + minutes * MIN };
    } else {
      a = { ...a, offset: form.offset };
    }
    a.nextAt = nextAt(a, now);
    saveAlarms([...alarms(), a]);
    toast(`${clockText(a.nextAt)}에 울려요`);
    $('#alName').value = '';
    showTab('list');
  });

  $('#alarmList').addEventListener('click', e => {
    const id = e.target.closest('[data-id]')?.dataset.id;
    if (!id) return;
    if (e.target.closest('[data-act="del"]')) {
      ringing.delete(id);
      saveAlarms(alarms().filter(a => a.id !== id));
    } else if (e.target.closest('[data-act="toggle"]')) {
      unlockAudio();
      saveAlarms(alarms().map(a => {
        if (a.id !== id) return a;
        if (a.on) return { ...a, on: false };
        const now = Date.now();
        const re = a.mode === 'after' ? { ...a, at: now + a.minutes * MIN } : a;   // 몇 분 뒤는 다시 켜면 처음부터
        return { ...re, on: true, missed: false, nextAt: nextAt(re, now) };
      }));
    }
  });

  $('#ringStop').addEventListener('click', stopRinging);
  $('#soundTest').addEventListener('click', () => { unlockAudio(); chime(true); });
  $('#soundToggle').checked = store.get('sound', true);
  $('#soundToggle').addEventListener('change', e => store.set('sound', e.target.checked));

  // 시각 입력 기본값: 지금부터 30분 뒤, 5분 단위
  const d = new Date(Date.now() + 30 * MIN);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  $('#alTime').value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes() % 60).padStart(2, '0')}`;

  // 오디오는 사용자 동작이 있어야 켜짐 → 첫 클릭 때 미리 준비
  document.addEventListener('pointerdown', unlockAudio, { once: true });
}

function syncForm() {
  $('#alModeSeg').querySelectorAll('button').forEach(b => b.classList.toggle('is-on', b.dataset.mode === form.mode));
  $('#alRepeatSeg').querySelectorAll('button').forEach(b => b.classList.toggle('is-on', b.dataset.repeat === form.repeat));
  $('#alOffsetSeg').querySelectorAll('button').forEach(b => b.classList.toggle('is-on', +b.dataset.offset === form.offset));
  $('#alQuick').querySelectorAll('button').forEach(b => b.classList.toggle('btn-gold', b.dataset.min === $('#alAfter').value));
  document.querySelectorAll('#alarmForm .mode-pane').forEach(p => { p.hidden = p.dataset.pane !== form.mode; });
  updatePreview();
}

function updatePreview() {
  const now = Date.now();
  let when = null;
  if (form.mode === 'at' && $('#alTime').value) when = nextAt({ mode: 'at', time: $('#alTime').value }, now);
  if (form.mode === 'after' && +$('#alAfter').value >= 1) when = now + Math.round(+$('#alAfter').value) * MIN;
  if (form.mode === 'market') when = nextAt({ mode: 'market', offset: form.offset }, now);
  $('#alPreview').innerHTML = when ? `처음 울리는 때 <b>${clockText(when)}</b> · ${fmtDuration(when - now)} 남음` : '';
}

/* ── 그리기 ── */
export function renderAlarm() {
  syncForm();
  const list = sorted();
  $('#alarmCount').textContent = list.length ? list.length : '';
  $('#alarmList').innerHTML = list.length ? list.map(a => `
    <div class="alarm${a.on ? '' : ' is-off'}${ringing.has(a.id) ? ' is-ringing' : ''}" data-id="${a.id}">
      <div class="alarm-main">
        <div class="alarm-time num">${a.on ? clockText(a.nextAt).replace(/^(오늘|내일) /, '') : (a.mode === 'at' ? a.time : a.mode === 'after' ? a.minutes + '분' : '시세')}</div>
        <div class="alarm-info">
          <div class="alarm-label">${esc(a.label || '알람')}</div>
          <div class="row" style="gap:4px">
            <span class="chip ${a.mode === 'market' ? 'stage' : ''}">${esc(describe(a))}</span>
            ${a.on ? `<span class="chip season alarm-left">${dayWord(a.nextAt)}</span>` : ''}
            ${a.missed ? '<span class="chip stale">놓침</span>' : ''}
          </div>
        </div>
      </div>
      <div class="alarm-side">
        <button class="switch${a.on ? ' is-on' : ''}" type="button" data-act="toggle" role="switch" aria-checked="${a.on}" aria-label="${esc(a.label || '알람')} 켜기/끄기"><i></i></button>
        <button class="btn btn-sm btn-icon" type="button" data-act="del" aria-label="지우기">✕</button>
      </div>
      ${a.on ? `<div class="alarm-count num" data-count></div>` : ''}
    </div>`).join('')
    : `<div class="empty"><b>아직 알람이 없어요.</b><br>추가하기에서 시각을 정해 주세요.<br>예: 조리대 꺼낼 때, 시세 바뀌기 5분 전</div>`;
  tickAlarm();
}

function sorted() {
  return [...alarms()].sort((a, b) => (b.on - a.on) || ((a.nextAt || 0) - (b.nextAt || 0)));
}
function dayWord(ms) {
  const t = clockText(ms);
  return t.startsWith('오늘') ? '오늘' : t.startsWith('내일') ? '내일' : t.split(' ')[0];
}

/* ── 1초마다: 울릴 알람 확인 + 남은 시간 갱신 (모든 화면에서 호출) ── */
export function tickAlarm() {
  const now = Date.now();
  let changed = false;
  const list = alarms().map(a => {
    if (!a.on || now < a.nextAt) return a;
    changed = true;
    const late = now - a.nextAt > RING_GRACE;
    if (!late) { ringing.set(a.id, now); toast(`알람 · ${a.label || '알람'}`); }
    const repeats = a.mode === 'market' || (a.mode === 'at' && a.repeat === 'daily');
    if (repeats) return { ...a, nextAt: nextAt(a, now + 1000), missed: late };
    return { ...a, on: false, missed: late };
  });
  if (changed) { saveAlarms(list); return; }   // 저장 → 화면 다시 그림

  // 남은 시간
  const box = $('#alarmList');
  list.forEach(a => {
    const el = box.querySelector(`[data-id="${a.id}"] [data-count]`);
    if (el) el.textContent = `${fmtDuration(a.nextAt - now)} 남음`;
  });

  if (isOpen('alarm')) updatePreview();
  updateDock(list, now);

  // 울리는 중
  for (const [id, started] of ringing) if (now - started > RING_MAX) ringing.delete(id);
  const banner = $('#ringBanner');
  if (ringing.size) {
    const items = list.filter(a => ringing.has(a.id));
    $('#ringTitle').textContent = items.map(a => a.label || '알람').join(', ') || '알람';
    $('#ringSub').textContent = items.map(describe).join(' · ');
    banner.hidden = false;
    document.title = (Math.floor(now / 1000) % 2 ? '⏰ ' : '') + '김미루네 작업실';
    if (now - lastBeep > 1800) { chime(); lastBeep = now; }
  } else if (!banner.hidden) {
    banner.hidden = true;
    document.title = '김미루네 작업실';
  }
}

function stopRinging() {
  ringing.clear();
  $('#ringBanner').hidden = true;
  document.title = '김미루네 작업실';
  renderAlarm();
}

/* 플로팅 버튼: 켜진 알람 수 + 가장 가까운 알람 */
function updateDock(list, now) {
  const on = list.filter(a => a.on).sort((a, b) => a.nextAt - b.nextAt);
  const badge = $('#dockBadge');
  badge.hidden = !on.length;
  badge.textContent = on.length;
  const next = $('#dockNext');
  const show = on.length && !isOpen('alarm');
  next.hidden = !show;
  if (show) next.innerHTML = `<b>${esc(on[0].label || '알람')}</b> <span class="num">${fmtDuration(on[0].nextAt - now, on[0].nextAt - now >= 3600e3)}</span>`;
  document.querySelector('.dock-btn[data-open="alarm"]').classList.toggle('is-ringing', ringing.size > 0);
}

/* ── 소리 ── */
function unlockAudio() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { audioCtx = null; }
}
function chime(force = false) {
  if (!audioCtx || (!force && !store.get('sound', true))) return;
  [784, 988, 1175, 1568].forEach((f, i) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    const t = audioCtx.currentTime + i * 0.12;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(audioCtx.destination);
    o.start(t); o.stop(t + 0.32);
  });
}
