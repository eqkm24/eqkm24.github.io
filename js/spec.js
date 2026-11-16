/* ==========================================================================
   spec.js — 내 캐릭터 상세 스펙
   홈 카드(보기) + 스펙 입력 팝업(data-pop="spec")
   값은 profile 하나에 모두 들어가고, 요리 · 비약 계산기도 같은 값을 씁니다.
   마인크래프트 닉네임 조회: playerdb.co (정확한 이름 · UUID)
   플레이어 머리 이미지:     mc-heads.net
   외부 연결이 막힌 곳에서는 닉네임 첫 글자 아바타로 대신 보여줍니다.
   ========================================================================== */
import { JOBS, TOOLS, MAX_LV } from './data.js';
import * as store from './store.js';
import { KEYS } from './store.js';
import { tierFor, stationsFor, queueFor, toolBless } from './calc.js';
import { $, esc, profile, patch, clampLv, stepper, wireSteppers, toolOptions } from './ui.js';
import { onOpen, isOpen } from './dock.js';

const LOOKUP = name => `https://playerdb.co/api/player/minecraft/${encodeURIComponent(name)}`;
const HEAD = (id, size = 128) => `https://mc-heads.net/avatar/${encodeURIComponent(id)}/${size}`;
const NAME_RE = /^[A-Za-z0-9_]{3,16}$/;     // 마인크래프트 닉네임 규칙

/* 머리 아바타: 이미지를 못 불러오면 첫 글자 */
function avatar(p, cls = 'char-avatar') {
  const name = p.nickname.trim();
  const ch = esc(name ? [...name][0].toUpperCase() : '★');
  const id = p.mcUuid || (NAME_RE.test(name) ? name : '');
  return `<div class="${cls}${name ? '' : ' is-empty'}${id ? ' has-head' : ''}" data-ch="${ch}" aria-hidden="true">${
    id ? `<img class="ava-img" src="${HEAD(id)}" alt="" referrerpolicy="no-referrer">` : ''}</div>`;
}
document.addEventListener('error', e => {
  const img = e.target;
  if (img instanceof HTMLImageElement && img.classList.contains('ava-img')) {
    img.parentElement.classList.remove('has-head');
    img.remove();
  }
}, true);

let lookupState = { status: 'idle', msg: '' };   // idle · loading · ok · notfound · blocked · invalid

async function lookup(raw) {
  const name = raw.trim();
  if (!name) { patch(KEYS.profile, { nickname: '', mcUuid: '' }); lookupState = { status: 'idle', msg: '' }; renderSpecPop(); return; }
  if (!NAME_RE.test(name)) {
    patch(KEYS.profile, { nickname: name, mcUuid: '' });
    lookupState = { status: 'invalid', msg: '마인크래프트 닉네임은 영문 · 숫자 · _ 3~16자예요. 그대로 저장은 했어요.' };
    renderSpecPop(); return;
  }
  lookupState = { status: 'loading', msg: `${name} 조회 중…` };
  renderSpecPop();
  try {
    const res = await fetch(LOOKUP(name), { headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => ({}));
    const pl = data?.data?.player;
    if (res.ok && data.success && pl) {
      patch(KEYS.profile, { nickname: pl.username, mcUuid: pl.raw_id || pl.id || '' });
      lookupState = { status: 'ok', msg: `${pl.username} 계정을 찾았어요` };
    } else {
      patch(KEYS.profile, { nickname: name, mcUuid: '' });
      lookupState = { status: 'notfound', msg: `${name} 계정을 찾지 못했어요. 철자를 확인해 주세요.` };
    }
  } catch (e) {
    patch(KEYS.profile, { nickname: name, mcUuid: '' });
    lookupState = { status: 'blocked', msg: '이 주소에서는 외부 조회가 막혀 있어요. 닉네임은 저장했고, 직접 올린 페이지에서는 머리가 떠요.' };
  }
  renderSpecPop();
}

const blessText = (tool, lv) => {
  if (!lv) return '강화 안 함';
  const c = toolBless(tool, lv);
  return c == null ? `${TOOLS[tool].bless}` : `${TOOLS[tool].bless} ${c}%`;
};

/* ── 홈 카드 ── */
export function renderSpecCard() {
  const p = profile();
  const name = p.nickname.trim();
  const total = JOBS.reduce((s, j) => s + (p[j.key] || 1), 0);

  $('#profilePanel').innerHTML = `
    <div class="char-head">
      ${avatar(p)}
      <div class="char-id">
        <div class="char-name">${name ? esc(name) : '닉네임을 입력해 주세요'}</div>
        <div class="row" style="gap:4px">
          ${p.mcUuid ? '<span class="chip fresh">마인크래프트 계정</span>' : ''}
          <span class="chip stage">숙련도 합계 ${total}</span>
        </div>
      </div>
      <button class="btn btn-gold" type="button" data-open="spec">스펙 입력</button>
    </div>

    <div class="job-grid">${JOBS.map(j => {
      const lv = p[j.key] || 1, t = tierFor(lv);
      const tl = p.tools[j.tool] || 0;
      return `
      <div class="job${j.tiers ? ' is-main' : ''}">
        <div class="job-top">
          <span class="job-name">${j.name}</span>
          ${j.tiers ? `<span class="chip stage">${t.tier}차</span>` : ''}
        </div>
        <div class="job-lv num">Lv <b>${lv}</b><span class="faint">/${MAX_LV}</span></div>
        <div class="bar"><i style="width:${lv / MAX_LV * 100}%"></i></div>
        <div class="job-tool"><b>${TOOLS[j.tool].name} +${tl}</b> · ${blessText(j.tool, tl)}</div>
      </div>`;
    }).join('')}</div>

    <div class="stats">
      <div class="stat"><div class="k">조리대</div><div class="v">${p.cookStations || stationsFor(p.cookLv)}<small>개</small></div></div>
      <div class="stat"><div class="k">연금대</div><div class="v">${p.alchStations || stationsFor(p.alchLv)}<small>개</small></div></div>
      <div class="stat"><div class="k">연금 대기열</div><div class="v">${queueFor(p.alchLv)}<small>칸</small></div></div>
    </div>`;
}

/* ── 스펙 입력 팝업 ── */
export function renderSpecPop() {
  const p = profile();
  $('#specBody').innerHTML = `
    <section class="set-group">
      <h3>캐릭터</h3>
      <form class="nick-row" id="nickForm" autocomplete="off">
        ${avatar(p, 'nick-ava')}
        <div class="field grow"><label for="spNick">마인크래프트 닉네임</label>
          <div class="row" style="flex-wrap:nowrap">
            <input class="input" id="spNick" maxlength="16" placeholder="예: Notch" value="${esc(p.nickname)}" spellcheck="false" autocapitalize="off">
            <button class="btn btn-gold" type="submit"${lookupState.status === 'loading' ? ' disabled' : ''}>조회</button>
          </div></div>
      </form>
      ${lookupState.msg ? `<p class="nick-msg is-${lookupState.status}">${esc(lookupState.msg)}</p>`
        : '<p class="note">닉네임을 조회하면 그 플레이어 머리를 아바타로 가져와요.</p>'}
    </section>

    <section class="set-group">
      <h3>직업 숙련도 <span class="faint">1 ~ ${MAX_LV}</span></h3>
      <div class="spec-2">${JOBS.map(j => stepper('sp_' + j.key, p[j.key] || 1, { label: j.name })).join('')}</div>
    </section>

    <section class="set-group">
      <h3>도구 강화 <span class="faint">+0 ~ +20 · 축복 발동 확률</span></h3>
      <div class="spec-2">${JOBS.map(j => `
        <div class="field"><label for="spt_${j.tool}">${TOOLS[j.tool].name} <span class="faint">${j.name}</span></label>
          <select class="select" id="spt_${j.tool}" data-tool="${j.tool}">${toolOptions(j.tool, p.tools[j.tool])}</select></div>`).join('')}
      </div>
      <p class="note">식칼 · 막자 강화는 요리 순차익 · 비약 효율 계산에 바로 반영돼요.</p>
    </section>

    <section class="set-group">
      <h3>작업 설비 <span class="faint">비우면 숙련도 기준 자동</span></h3>
      <div class="spec-2">
        <div class="field"><label for="spCookSt">조리대 수</label>
          <input class="input num" id="spCookSt" type="number" min="1" max="7" placeholder="${stationsFor(p.cookLv)}" value="${p.cookStations ?? ''}"></div>
        <div class="field"><label for="spAlchSt">연금대 수</label>
          <input class="input num" id="spAlchSt" type="number" min="1" max="7" placeholder="${stationsFor(p.alchLv)}" value="${p.alchStations ?? ''}"></div>
      </div>
    </section>`;
}

export function initSpec() {
  const body = $('#specBody');
  wireSteppers(body);
  body.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'spNick') return;   // 닉네임은 조회 버튼 / Enter 로 저장
    else if (t.id.startsWith('sp_')) patch(KEYS.profile, { [t.id.slice(3)]: clampLv(t.value) });
    else if (t.dataset.tool) patch(KEYS.profile, { tools: { ...profile().tools, [t.dataset.tool]: +t.value } });
    else if (t.id === 'spCookSt') patch(KEYS.profile, { cookStations: Math.round(+t.value || 0) || null });
    else if (t.id === 'spAlchSt') patch(KEYS.profile, { alchStations: Math.round(+t.value || 0) || null });
  });
  body.addEventListener('submit', e => {
    if (e.target.id !== 'nickForm') return;
    e.preventDefault();
    lookup($('#spNick').value);
  });
  onOpen('spec', () => { lookupState = { status: 'idle', msg: '' }; renderSpecPop(); });
  // 계산기 쪽에서 바꿔도 팝업이 열려 있으면 맞춰 줌 (입력 중인 칸은 건드리지 않음)
  store.on(KEYS.profile, () => {
    if (isOpen('spec') && !body.contains(document.activeElement)) renderSpecPop();
  });
}
