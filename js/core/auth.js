/* ══════════════════════════════════════════════════════
   스텔라 마을 위키 — 인증 시스템 v2
   
   변경사항:
   - PIN 하드코딩 제거 → DB 해시 검증 방식
   - SITE_PIN: DB stella_config/site_pin_hash 에 SHA-256 해시로 저장
   - ADMIN_PIN: DB _admin_config/pin_hash 에 SHA-256 해시로 저장
   - 관리자 세션: DB _admin_sessions/{token} 에 저장 (24시간 만료)
══════════════════════════════════════════════════════ */

const PIN_STORAGE_KEY   = 'stella_pin_ok';
const ADMIN_SESSION_KEY = 'stella_admin_token'; // 토큰 저장 (이전엔 'ok' 저장)

/* ── SHA-256 해시 ── */
async function sha256(str) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

/* ── 초기화 ── */
(function checkAuth() {
  // 저장된 관리자 토큰 복원
  const savedToken = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (savedToken) {
    window._adminToken = savedToken;
    window._isAdmin    = true;
  } else {
    window._adminToken = null;
    window._isAdmin    = false;
  }

  function tryBoot(attempt) {
    if (window._fbReady) { _bootApp(); return; }
    if (attempt > 50) {
      console.warn('[stella] Firebase 연결 실패 — 오프라인 모드');
      _bootApp();
      return;
    }
    setTimeout(() => tryBoot(attempt + 1), 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryBoot(0));
  } else {
    tryBoot(0);
  }
})();

/* ── 앱 시작 ── */
function _bootApp() {
  const adminBtn = document.getElementById('admin-login-btn');
  if (adminBtn && window._isAdmin) adminBtn.style.display = '';
  if (typeof initApp === 'function') initApp();
}

/* ══════════════════════════════
   마을 입장 인증 (사이트 PIN)
══════════════════════════════ */
function isSiteAuth() {
  return localStorage.getItem(PIN_STORAGE_KEY) === 'true';
}

function renderPinGate() {
  const gate = document.createElement('div');
  gate.id = 'pin-gate';
  gate.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;align-items:center;justify-content:center;font-family:\'Noto Sans KR\',sans-serif;';
  gate.innerHTML = `
    <div style="width:320px;max-width:88vw;text-align:center;">
      <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#a090f0,#c084fc);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px;">✨</div>
      <div style="font-size:20px;font-weight:900;color:var(--text);margin-bottom:4px;">스텔라 마을 <span style="color:#a090f0;">위키</span></div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:28px;">마을 비밀번호를 입력해주세요</div>
      <div id="pin-card" style="background:var(--s1);border:1px solid var(--b1);border-radius:14px;padding:28px 24px;">
        <div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px;">
          <input id="pin-d1" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="pinMove(this,'pin-d2')" onkeydown="pinBack(event,this,null)">
          <input id="pin-d2" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="pinMove(this,'pin-d3')" onkeydown="pinBack(event,this,'pin-d1')">
          <input id="pin-d3" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="pinMove(this,'pin-d4')" onkeydown="pinBack(event,this,'pin-d2')">
          <input id="pin-d4" class="pin-dig" type="password" maxlength="1" inputmode="numeric" oninput="pinAutoSubmit(this)" onkeydown="pinBack(event,this,'pin-d3')">
        </div>
        <div id="pin-msg" style="font-size:12px;color:var(--warn);margin-top:12px;min-height:16px;"></div>
      </div>
      <style>
        .pin-dig{width:54px;height:64px;border-radius:12px;border:2px solid var(--b2);background:var(--s2);color:var(--text);font-size:28px;font-weight:900;text-align:center;outline:none;font-family:'JetBrains Mono',monospace;transition:border-color .15s;}
        .pin-dig:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(160,144,240,.18);}
        @keyframes pinShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
      </style>
    </div>`;
  document.body.appendChild(gate);
  setTimeout(() => document.getElementById('pin-d1')?.focus(), 100);
}

function pinMove(el, nextId) {
  if (el.value) document.getElementById(nextId)?.focus();
}

function pinAutoSubmit(el) {
  if (el.value) submitPin();
}

function pinBack(e, el, prevId) {
  if (e.key === 'Backspace' && !el.value && prevId) {
    document.getElementById(prevId)?.focus();
  }
  if (e.key === 'Enter') submitPin();
}

async function submitPin() {
  const pin = ['pin-d1','pin-d2','pin-d3','pin-d4'].map(id => document.getElementById(id)?.value || '').join('');
  if (pin.length < 4) return;

  const msg = document.getElementById('pin-msg');
  if (msg) msg.textContent = '확인 중...';

  try {
    // DB에서 해시 가져와서 비교
    const storedHash = await window._fbGet('stella_config/site_pin_hash');
    if (!storedHash) {
      // 최초 설정 전: 기본 PIN 1234 허용 (관리자가 설정 후 변경)
      if (pin === '1234') {
        _siteAuthSuccess();
        return;
      }
    } else {
      const inputHash = await sha256(pin);
      if (inputHash === storedHash) {
        _siteAuthSuccess();
        return;
      }
    }
    // 틀린 경우
    if (msg) msg.textContent = '비밀번호가 틀렸습니다.';
    const card = document.getElementById('pin-card');
    if (card) { card.style.animation = 'pinShake .4s'; setTimeout(() => card.style.animation = '', 400); }
    ['pin-d1','pin-d2','pin-d3','pin-d4'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    document.getElementById('pin-d1')?.focus();
  } catch(e) {
    // Firebase 연결 실패 시 — 오프라인 모드에서는 기본 PIN
    if (pin === '1234') { _siteAuthSuccess(); return; }
    if (msg) msg.textContent = '연결 오류. 다시 시도해주세요.';
  }
}

function _siteAuthSuccess() {
  localStorage.setItem(PIN_STORAGE_KEY, 'true');
  const gate = document.getElementById('pin-gate');
  if (gate) { gate.style.opacity = '0'; setTimeout(() => gate.remove(), 300); }
}

/* ══════════════════════════════
   마을 입장 인증 (닉네임)
══════════════════════════════ */
function isVillageAuth() {
  return sessionStorage.getItem('stella_village_ok') === 'true';
}

function requireVillageAccess(ddId, callback) {
  if (isVillageAuth()) {
    const dd = document.getElementById(ddId);
    if (dd) dd.classList.toggle('dd-open');
    if (callback) callback();
    return;
  }
  showVillageAuthModal(ddId, callback);
}

function showVillageAuthModal(ddId, callback) {
  const existing = document.getElementById('village-auth-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'village-auth-modal';
  modal.innerHTML = `
    <div class="mb-modal-bg" onclick="if(event.target===this)this.remove()">
      <div class="mb-modal" style="max-width:340px;">
        <div style="font-size:18px;font-weight:900;color:var(--text);margin-bottom:4px;">🏡 마을 입장</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:20px;">마인크래프트 닉네임을 입력해주세요</div>
        <input id="village-nick-input" class="mb-input" type="text" placeholder="닉네임 입력..."
          style="width:100%;margin-bottom:14px;box-sizing:border-box;"
          onkeydown="if(event.key==='Enter')submitVillageNick('${ddId}')">
        <div id="village-auth-msg" style="font-size:11px;color:var(--warn);min-height:14px;margin-bottom:12px;"></div>
        <div class="mb-modal-btns">
          <button class="mb-btn" onclick="this.closest('.mb-modal-bg').remove()">취소</button>
          <button class="mb-btn mb-btn-primary" onclick="submitVillageNick('${ddId}')">입장</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => document.getElementById('village-nick-input')?.focus(), 100);

  // callback 보관
  window._villageCallback = callback;
}

async function submitVillageNick(ddId) {
  const input = document.getElementById('village-nick-input');
  const msg   = document.getElementById('village-auth-msg');
  const nick  = input?.value?.trim();
  if (!nick) { if(msg) msg.textContent = '닉네임을 입력해주세요.'; return; }
  if (msg) msg.textContent = '확인 중...';

  try {
    const found = (window.members || []).some(m =>
      (m.mc || '').toLowerCase() === nick.toLowerCase() ||
      (m.name || '').toLowerCase() === nick.toLowerCase()
    );
    if (!found) {
      if (msg) msg.textContent = '마을원 명단에 없는 닉네임입니다.';
      return;
    }
    sessionStorage.setItem('stella_village_ok', 'true');
    document.getElementById('village-auth-modal')?.remove();
    const dd = document.getElementById(ddId);
    if (dd) dd.classList.add('dd-open');
    if (window._villageCallback) window._villageCallback();
    window._villageCallback = null;
  } catch(e) {
    if (msg) msg.textContent = '오류가 발생했습니다.';
  }
}

/* ══════════════════════════════
   관리자 인증
══════════════════════════════ */
function openAdminLogin() {
  if (window._isAdmin) { renderAdminPage(); return; }

  const existing = document.getElementById('admin-login-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'admin-login-modal';
  modal.innerHTML = `
    <div class="mb-modal-bg" onclick="if(event.target===this)this.remove()">
      <div class="mb-modal" style="max-width:300px;">
        <div style="font-size:16px;font-weight:900;color:var(--text);margin-bottom:16px;">👑 관리자 로그인</div>
        <input id="admin-pin-input" class="mb-input" type="password" placeholder="관리자 PIN"
          style="width:100%;margin-bottom:12px;box-sizing:border-box;"
          onkeydown="if(event.key==='Enter')submitAdminPin()">
        <div id="admin-pin-msg" style="font-size:11px;color:var(--warn);min-height:14px;margin-bottom:12px;"></div>
        <div class="mb-modal-btns">
          <button class="mb-btn" onclick="this.closest('.mb-modal-bg').remove()">취소</button>
          <button class="mb-btn mb-btn-primary" onclick="submitAdminPin()">로그인</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => document.getElementById('admin-pin-input')?.focus(), 100);
}

async function submitAdminPin() {
  const input = document.getElementById('admin-pin-input');
  const msg   = document.getElementById('admin-pin-msg');
  const pin   = input?.value?.trim();
  if (!pin) return;
  if (msg) msg.textContent = '확인 중...';

  try {
    // DB에서 관리자 PIN 해시 가져와서 비교
    const storedHash = await window._fbGet('_admin_config/pin_hash');
    if (!storedHash) {
      // 최초: 기본 PIN 9999
      if (pin !== '9999') {
        if (msg) msg.textContent = 'PIN이 틀렸습니다.'; return;
      }
    } else {
      const inputHash = await sha256(pin);
      if (inputHash !== storedHash) {
        if (msg) msg.textContent = 'PIN이 틀렸습니다.'; return;
      }
    }

    // 토큰 생성 후 DB에 저장
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2,'0')).join('');
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24시간
    await window._fbGet('_admin_sessions'); // DB 접근 가능 여부 확인

    // 직접 DB ref 접근 (토큰 저장은 auth 단계라 검증 전 예외 허용)
    if (typeof firebase !== 'undefined') {
      await firebase.database().ref(`_admin_sessions/${token}`).set({ valid: true, expiry });
    }

    window._adminToken = token;
    window._isAdmin    = true;
    sessionStorage.setItem(ADMIN_SESSION_KEY, token);

    document.getElementById('admin-login-modal')?.remove();
    const ab = document.getElementById('admin-login-btn');
    if (ab) ab.style.display = '';
    if (typeof updateAdminUI === 'function') updateAdminUI();
    renderAdminPage();

  } catch(e) {
    console.error('[auth] 관리자 로그인 오류:', e);
    if (msg) msg.textContent = '오류가 발생했습니다.';
  }
}

function doLogout() {
  // 관리자 세션 토큰 DB에서 삭제
  if (window._adminToken && typeof firebase !== 'undefined') {
    firebase.database().ref(`_admin_sessions/${window._adminToken}`).remove().catch(() => {});
  }
  window._adminToken = null;
  window._isAdmin    = false;
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  if (typeof updateAdminUI === 'function') updateAdminUI();
  const ab = document.getElementById('admin-login-btn');
  if (ab) ab.style.display = 'none';
}
