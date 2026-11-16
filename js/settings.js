/* ==========================================================================
   settings.js — 화면 설정 팝업
   설정값은 <html data-*> 속성으로 걸고, 색·크기는 base.css 가 처리합니다.
   ========================================================================== */
import * as store from './store.js';
import { KEYS } from './store.js';
import { setCompact } from './calc.js';
import { $, esc, toast, armButton } from './ui.js';

const DEFAULT = { accent: 'yellow', font: 'm', compact: false, dots: true, motion: true };

const ACCENTS = [
  { id: 'yellow', name: '버터', sw: ['#ffd84a', '#fff4cf'] },
  { id: 'mint',   name: '민트', sw: ['#5fd6a8', '#e6f8ef'] },
  { id: 'peach',  name: '복숭아', sw: ['#ff9f86', '#fff0ea'] },
  { id: 'sky',    name: '하늘', sw: ['#6cbcff', '#eaf5ff'] },
  { id: 'grape',  name: '포도', sw: ['#b79cff', '#f3eeff'] },
];
const FONTS = [['s', '작게'], ['m', '보통'], ['l', '크게']];

export const settings = () => ({ ...DEFAULT, ...store.get(KEYS.settings, {}) });

export function applySettings(s = settings()) {
  const root = document.documentElement.dataset;
  root.accent = s.accent;
  root.font = s.font;
  root.dots = s.dots ? 'on' : 'off';
  root.motion = s.motion ? 'on' : 'off';
  setCompact(s.compact);
}

function patch(p) {
  const next = { ...settings(), ...p };
  applySettings(next);              // 화면을 다시 그리기 전에 먼저 적용
  store.set(KEYS.settings, next);
}

export function initSettings() {
  applySettings();
  store.on(KEYS.settings, () => { applySettings(); renderSettings(); });

  const body = $('#settingsBody');
  body.addEventListener('click', e => {
    const a = e.target.closest('[data-accent]');
    if (a) patch({ accent: a.dataset.accent });
    const f = e.target.closest('[data-font]');
    if (f) patch({ font: f.dataset.font });
    const t = e.target.closest('[data-toggle]');
    if (t) patch({ [t.dataset.toggle]: !settings()[t.dataset.toggle] });
    if (e.target.closest('#setReset')) { applySettings({ ...DEFAULT }); store.set(KEYS.settings, { ...DEFAULT }); toast('설정을 처음으로 되돌렸어요'); }
    const wipe = e.target.closest('#setWipe');
    if (wipe) armButton(wipe, '입력한 시세·단가 지우기', () => {
      [KEYS.cookPrices, KEYS.elixirPrices, KEYS.ingPrices].forEach(k => store.set(k, {}));
      toast('시세와 재료 단가를 모두 지웠어요');
    });
  });
}

function toggleRow(key, title, desc, on) {
  return `
    <div class="set-row">
      <div class="set-text"><div class="set-title">${title}</div><div class="set-desc">${desc}</div></div>
      <button class="switch${on ? ' is-on' : ''}" type="button" data-toggle="${key}" role="switch" aria-checked="${on}" aria-label="${esc(title)}"><i></i></button>
    </div>`;
}

export function renderSettings() {
  const s = settings();
  $('#settingsBody').innerHTML = `
    <div class="set-group">
      <h3>포인트 색</h3>
      <div class="swatches">${ACCENTS.map(a => `
        <button type="button" class="swatch${s.accent === a.id ? ' is-on' : ''}" data-accent="${a.id}" aria-pressed="${s.accent === a.id}">
          <span class="sw" style="background:linear-gradient(135deg, ${a.sw[0]} 50%, ${a.sw[1]} 50%)"></span>
          <span>${a.name}</span>
        </button>`).join('')}</div>
    </div>

    <div class="set-group">
      <h3>글자 크기</h3>
      <div class="seg seg-fill">${FONTS.map(([id, n]) =>
        `<button type="button" data-font="${id}" class="${s.font === id ? 'is-on' : ''}">${n}</button>`).join('')}</div>
    </div>

    <div class="set-group">
      <h3>보기</h3>
      ${toggleRow('compact', '큰 숫자 줄여 보기', '551,747 → 55.2만', s.compact)}
      ${toggleRow('dots', '배경 도트 무늬', '바탕에 작은 점 무늬를 깔아요', s.dots)}
      ${toggleRow('motion', '움직임 효과', '버튼 · 화면 전환 애니메이션', s.motion)}
    </div>

    <div class="set-group">
      <h3>데이터</h3>
      <p class="note">모든 값은 이 브라우저에만 저장돼요. 다른 기기와는 공유되지 않아요.</p>
      <div class="row">
        <button class="btn btn-sm" type="button" id="setReset">설정 처음으로</button>
        <button class="btn btn-sm btn-danger" type="button" id="setWipe">입력한 시세·단가 지우기</button>
      </div>
    </div>`;
}
