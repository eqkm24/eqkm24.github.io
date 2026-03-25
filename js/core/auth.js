/* ═══ PIN 인증 시스템 ═══
   - 일반 PIN : 사이트 전체 잠금 해제 (localStorage 유지)
   - 관리자 PIN : 관리자 기능 활성화 (세션 유지)
   핀 변경은 이 파일 상단 상수만 수정하면 됩니다.
══════════════════════════════════════════════════ */

const SITE_PIN  = '1234';   // ← 마을 공용 비밀번호 (원하는 숫자로 변경)
const ADMIN_PIN = '9999';   // ← 관리자 전용 비밀번호 (원하는 숫자로 변경)

const PIN_STORAGE_KEY   = 'stella_pin_ok';
const ADMIN_SESSION_KEY = 'stella_admin_ok';

/* ── 초기 인증 상태 확인 ── */
(function checkAuth() {
  const pinOk   = localStorage.getItem(PIN_STORAGE_KEY)    === 'true';
  const adminOk = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';

  window._isAdmin     = adminOk;
  window._currentUser = { mc: adminOk ? '관리자' : '마을원', isAdmin: adminOk };

  if (pinOk) {
    _bootApp();
  } else {
    document.addEventListener('DOMContentLoaded', renderPinGate);
  }
})();

/* ── PIN 입력 화면 ── */
function renderPinGate() {
  const gate = document.createElement('div');
  gate.id = 'pin-gate';
  gate.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;align-items:center;justify-content:center;font-family:\'Noto Sans KR\',sans-serif;transition:opacity .2s;';
  gate.innerHTML = `
    <div style="width:320px;max-width:88vw;text-align:center;">
      <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#a090f0,#c084fc);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px;">✨</div>
      <div style="font-size:20px;font-weight:900;color:var(--text);margin-bottom:4px;">스텔라 마을 <span style="color:#a090f0;">위키</span></div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:28px;">마을 비밀번호를 입력해주세요</div>
      <div id="pin-card" style="background:var(--s1);border:1px solid var(--b1);border-radius:14px;padding:28px 24px;">
        <div style="display:flex;gap:12px;justify-content:center;margin-bottom:20px;">
          <input id="pin-d1" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="pinMove(this,'pin-d2')" onkeydown="pinBack(event,this,null)">
          <input id="pin-d2" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="pinMove(this,'pin-d3')" onkeydown="pinBack(event,this,'pin-d1')">
          <input id="pin-d3" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="pinMove(this,'pin-d4')" onkeydown="pinBack(event,this,'pin-d2')">
          <input id="pin-d4" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="pinAutoSubmit(this)" onkeydown="pinBack(event,this,'pin-d3')">
        </div>
        <button onclick="submitPin()" style="width:100%;padding:12px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,#a090f0,#7868d0);color:#fff;font-size:14px;font-weight:800;font-family:'Noto Sans KR',sans-serif;">입장하기</button>
        <div id="pin-msg" style="font-size:12px;color:var(--warn);margin-top:12px;min-height:16px;"></div>
      </div>
      <div style="font-size:10px;color:var(--muted);margin-top:16px;">비밀번호를 모르는 경우 마을 운영진에게 문의하세요</div>
    </div>
    <style>
    .pin-dig{width:54px;height:64px;border-radius:12px;border:2px solid var(--b2);background:var(--s2);color:var(--text);font-size:28px;font-weight:900;text-align:center;outline:none;font-family:'JetBrains Mono',monospace;transition:border-color .15s;}
    .pin-dig:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(160,144,240,.18);}
    @keyframes pinShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
    </style>`;
  document.body.appendChild(gate);
  setTimeout(() => document.getElementById('pin-d1')?.focus(), 100);
}

function pinMove(el, nextId) {
  if (el.value && nextId) document.getElementById(nextId)?.focus();
}
function pinAutoSubmit(el) {
  if (el.value && _getPinVal().length === 4) submitPin();
}
function pinBack(e, el, prevId) {
  if (e.key === 'Backspace' && !el.value && prevId) document.getElementById(prevId)?.focus();
  if (e.key === 'Enter') submitPin();
}
function _getPinVal() {
  return ['pin-d1','pin-d2','pin-d3','pin-d4'].map(id => document.getElementById(id)?.value || '').join('');
}
function _clearPinInputs() {
  ['pin-d1','pin-d2','pin-d3','pin-d4'].forEach(id => { const e = document.getElementById(id); if(e) e.value=''; });
  document.getElementById('pin-d1')?.focus();
}

function submitPin() {
  const val = _getPinVal();
  const msg = document.getElementById('pin-msg');
  if (val.length < 4) { if(msg) msg.textContent='4자리를 모두 입력해주세요.'; return; }

  if (val === SITE_PIN || val === ADMIN_PIN) {
    localStorage.setItem(PIN_STORAGE_KEY, 'true');
    if (val === ADMIN_PIN) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      window._isAdmin = true;
      window._currentUser = { mc:'관리자', isAdmin:true };
    }
    const gate = document.getElementById('pin-gate');
    if (gate) { gate.style.opacity = '0'; setTimeout(() => { gate.remove(); _bootApp(); }, 180); }
  } else {
    if (msg) msg.textContent = '비밀번호가 올바르지 않습니다.';
    _clearPinInputs();
    const card = document.getElementById('pin-card');
    if (card) { card.style.animation = 'pinShake .35s ease'; setTimeout(() => card.style.animation='', 400); }
  }
}

/* ── 앱 부팅 ── */
function _bootApp() {
  if (typeof initApp === 'function') initApp();
  else document.addEventListener('DOMContentLoaded', () => { if(typeof initApp==='function') initApp(); });
  setTimeout(() => { if(typeof updateAdminUI==='function') updateAdminUI(); }, 150);
}

/* ── 관리자 PIN 모달 ── */
function openAdminLogin() {
  if (window._isAdmin) { renderAdminPage(); return; }

  document.getElementById('adm-modal-root').innerHTML = `
    <div class="mb-modal-bg" id="adm-pin-bg" onclick="if(event.target.id==='adm-pin-bg')this.remove()">
      <div class="mb-modal" style="max-width:300px;text-align:center;">
        <h3 style="margin-bottom:6px;">🔐 관리자 인증</h3>
        <p style="font-size:12px;color:var(--muted);margin-bottom:20px;">관리자 PIN 4자리를 입력해주세요</p>
        <div style="display:flex;gap:12px;justify-content:center;margin-bottom:14px;">
          <input id="adm-d1" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="admMove(this,'adm-d2')" onkeydown="admBack(event,this,null)">
          <input id="adm-d2" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="admMove(this,'adm-d3')" onkeydown="admBack(event,this,'adm-d1')">
          <input id="adm-d3" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="admMove(this,'adm-d4')" onkeydown="admBack(event,this,'adm-d2')">
          <input id="adm-d4" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="admAutoSub(this)" onkeydown="admBack(event,this,'adm-d3')">
        </div>
        <div id="adm-pin-msg" style="font-size:12px;color:var(--warn);min-height:16px;margin-bottom:14px;"></div>
        <div class="mb-modal-btns">
          <button class="mb-btn" onclick="document.getElementById('adm-pin-bg').remove()">취소</button>
          <button class="mb-btn mb-btn-add" onclick="submitAdminPin()">확인</button>
        </div>
      </div>
    </div>
    <style>.pin-dig{width:52px;height:60px;border-radius:10px;border:2px solid var(--b2);background:var(--s2);color:var(--text);font-size:26px;font-weight:900;text-align:center;outline:none;font-family:'JetBrains Mono',monospace;transition:border-color .15s;}.pin-dig:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(160,144,240,.18);}</style>`;
  setTimeout(() => document.getElementById('adm-d1')?.focus(), 80);
}

function admMove(el, nextId) { if(el.value && nextId) document.getElementById(nextId)?.focus(); }
function admAutoSub(el) { if(el.value) submitAdminPin(); }
function admBack(e, el, prevId) {
  if(e.key==='Backspace' && !el.value && prevId) document.getElementById(prevId)?.focus();
  if(e.key==='Enter') submitAdminPin();
}

function submitAdminPin() {
  const val = ['adm-d1','adm-d2','adm-d3','adm-d4'].map(id => document.getElementById(id)?.value||'').join('');
  const msg = document.getElementById('adm-pin-msg');
  if (val === ADMIN_PIN) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    window._isAdmin = true;
    window._currentUser = { mc:'관리자', isAdmin:true };
    document.getElementById('adm-pin-bg')?.remove();
    if(typeof updateAdminUI==='function') updateAdminUI();
    setTimeout(renderAdminPage, 100);
  } else {
    if(msg) msg.textContent='관리자 PIN이 올바르지 않습니다.';
    ['adm-d1','adm-d2','adm-d3','adm-d4'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
    document.getElementById('adm-d1')?.focus();
  }
}

/* ── 로그아웃 ── */
window._authLogout = function() {
  localStorage.removeItem(PIN_STORAGE_KEY);
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  location.reload();
};
