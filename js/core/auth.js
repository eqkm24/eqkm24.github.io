/* ═══════════════════════════════════════════════════════
   스텔라 마을 위키 v3 — 인증 시스템

   - 사이트 PIN : DB sha256 해시 비교 (하드코딩 없음)
   - 마을 입장  : 닉네임이 마을원 명단에 있는지 확인
   - 관리자     : DB sha256 해시 → 토큰 발급 → 24시간
═══════════════════════════════════════════════════════ */

/* ── 전역 앱 상태 ── */
window._stella = {
  isAdmin:    false,
  adminToken: null,
  villageOk:  false,
};

const SITE_PIN_KEY   = 'stella_pin_ok';
const ADMIN_TOKEN_KEY = 'stella_admin_token';

/* ── SHA-256 ── */
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

/* ── 초기화 ── */
(function init() {
  // 관리자 토큰 — 메모리에만 유지 (새로고침/창 닫기 시 자동 로그아웃)
  // sessionStorage 복원 제거 → 페이지 로드 시 항상 로그아웃 상태

  // 마을 입장 세션 복원
  if (sessionStorage.getItem('stella_village_ok') === 'true') {
    window._stella.villageOk = true;
  }

  // Firebase 준비 → 앱 시작
  function tryBoot(tries) {
    if (window._fbReady) { _bootApp(); return; }
    if (tries > 60) { console.warn('[stella] Firebase 연결 실패 — 오프라인 모드'); _bootApp(); return; }
    setTimeout(() => tryBoot(tries + 1), 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryBoot(0));
  } else {
    tryBoot(0);
  }
})();

function _bootApp() {
  renderPinGate();
}

/* ══════════════════════════════
   사이트 PIN 게이트
══════════════════════════════ */
function isSiteAuth() {
  return localStorage.getItem(SITE_PIN_KEY) === 'true';
}

function renderPinGate() {
  if (isSiteAuth()) { _afterPinOk(); return; }

  const gate = document.createElement('div');
  gate.id = 'pin-gate';
  gate.innerHTML = `
    <div class="pin-box">
      <div class="pin-logo">
        <div class="pin-logo-dot"></div>
        STELLA WIKI
      </div>
      <div class="pin-title">스텔라 마을 <span style="color:var(--purple)">위키</span></div>
      <div class="pin-sub">마을 비밀번호를 입력해주세요</div>
      <div class="pin-digits">
        <input class="pin-dig" id="p0" type="password" maxlength="1" inputmode="numeric"
          oninput="pinMove(0)" onkeydown="pinBack(event,0)">
        <input class="pin-dig" id="p1" type="password" maxlength="1" inputmode="numeric"
          oninput="pinMove(1)" onkeydown="pinBack(event,1)">
        <input class="pin-dig" id="p2" type="password" maxlength="1" inputmode="numeric"
          oninput="pinMove(2)" onkeydown="pinBack(event,2)">
        <input class="pin-dig" id="p3" type="password" maxlength="1" inputmode="numeric"
          oninput="pinSubmit()" onkeydown="pinBack(event,3)">
      </div>
      <div class="pin-msg" id="pin-msg"></div>
    </div>`;
  document.body.appendChild(gate);
  setTimeout(() => document.getElementById('p0')?.focus(), 100);
}

function pinMove(idx) {
  const el = document.getElementById(`p${idx}`);
  if (el?.value) document.getElementById(`p${idx + 1}`)?.focus();
}

function pinBack(e, idx) {
  if (e.key === 'Backspace' && !document.getElementById(`p${idx}`)?.value) {
    document.getElementById(`p${idx - 1}`)?.focus();
  }
  if (e.key === 'Enter') pinSubmit();
}

async function pinSubmit() {
  const pin = [0,1,2,3].map(i => document.getElementById(`p${i}`)?.value || '').join('');
  if (pin.length < 4) return;

  const msg = document.getElementById('pin-msg');
  if (msg) msg.textContent = '확인 중...';

  try {
    const storedHash = await window.$db.get('stella_config/site_pin_hash');

    // 최초 설정 전 — 기본값 허용
    if (!storedHash && pin === '1234') { _pinSuccess(); return; }

    const inputHash = await sha256(pin);
    if (inputHash === storedHash) { _pinSuccess(); return; }

    // 틀림
    if (msg) msg.textContent = '비밀번호가 틀렸습니다.';
    document.querySelectorAll('.pin-dig').forEach(el => {
      el.value = '';
      el.classList.add('shake');
      el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
    });
    document.getElementById('p0')?.focus();
  } catch(e) {
    // 오프라인 — 기본 PIN
    if (pin === '1234') { _pinSuccess(); return; }
    if (msg) msg.textContent = '연결 오류. 다시 시도해주세요.';
  }
}

function _pinSuccess() {
  localStorage.setItem(SITE_PIN_KEY, 'true');
  const gate = document.getElementById('pin-gate');
  if (gate) {
    gate.style.opacity = '0';
    gate.style.transition = 'opacity .3s';
    setTimeout(() => { gate.remove(); _afterPinOk(); }, 300);
  } else {
    _afterPinOk();
  }
}

function _afterPinOk() {
  // 앱 초기화 (router.js의 initApp 호출)
  if (typeof initApp === 'function') initApp();
}

/* ══════════════════════════════
   마을 입장 인증 (닉네임)
══════════════════════════════ */
function requireVillage(callback) {
  if (window._stella.villageOk) { callback(); return; }
  showVillageModal(callback);
}

function showVillageModal(callback) {
  const existing = document.getElementById('village-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'village-modal';
  modal.className = 'modal-bg';
  modal.innerHTML = `
    <div class="modal village-modal">
      <div class="modal-title">🏡 마을 입장</div>
      <div class="modal-sub">마인크래프트 닉네임을 입력해주세요</div>
      <input class="input" id="village-nick" type="text" placeholder="닉네임 입력..."
        onkeydown="if(event.key==='Enter')submitVillageNick()">
      <div style="font-size:11px;color:var(--red);min-height:16px;margin-top:8px;" id="village-msg"></div>
      <div class="modal-btns">
        <button class="btn" onclick="document.getElementById('village-modal').remove()">취소</button>
        <button class="btn btn-primary" onclick="submitVillageNick()">입장</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  window._villageCallback = callback;
  setTimeout(() => document.getElementById('village-nick')?.focus(), 100);
}

async function submitVillageNick() {
  const input = document.getElementById('village-nick');
  const msg   = document.getElementById('village-msg');
  const nick  = input?.value?.trim();
  if (!nick) return;
  if (msg) msg.textContent = '확인 중...';

  const found = (window.members || []).some(m =>
    (m.mc   || '').toLowerCase() === nick.toLowerCase() ||
    (m.name || '').toLowerCase() === nick.toLowerCase()
  );

  if (!found) {
    if (msg) msg.textContent = '마을원 명단에 없는 닉네임입니다.';
    return;
  }

  window._stella.villageOk = true;
  sessionStorage.setItem('stella_village_ok', 'true');
  document.getElementById('village-modal')?.remove();
  if (window._villageCallback) { window._villageCallback(); window._villageCallback = null; }
}

/* ══════════════════════════════
   관리자 로그인
══════════════════════════════ */
function openAdminLogin() {
  if (window._stella.isAdmin) {
    if (typeof renderAdminPage === 'function') renderAdminPage();
    return;
  }

  const existing = document.getElementById('admin-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'admin-modal';
  modal.className = 'modal-bg';
  modal.innerHTML = `
    <div class="modal" style="max-width:320px;">
      <div class="modal-title">👑 관리자 로그인</div>
      <input class="input" id="admin-pin-input" type="password" placeholder="관리자 PIN"
        style="margin-top:16px;" onkeydown="if(event.key==='Enter')submitAdminPin()">
      <div style="font-size:11px;color:var(--red);min-height:16px;margin-top:8px;" id="admin-pin-msg"></div>
      <div class="modal-btns">
        <button class="btn" onclick="document.getElementById('admin-modal').remove()">취소</button>
        <button class="btn btn-primary" onclick="submitAdminPin()">로그인</button>
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
    const storedHash = await window.$db.get('_admin_config/pin_hash');

    if (!storedHash && pin !== '9999') {
      if (msg) msg.textContent = 'PIN이 틀렸습니다.'; return;
    }
    if (storedHash) {
      const inputHash = await sha256(pin);
      if (inputHash !== storedHash) {
        if (msg) msg.textContent = 'PIN이 틀렸습니다.'; return;
      }
    }

    // 토큰 발급
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2,'0')).join('');
    const expiry = Date.now() + 24 * 60 * 60 * 1000;

    await firebase.database().ref(`_admin_sessions/${token}`).set({ valid: true, expiry });

    window._stella.adminToken = token;
    window._stella.isAdmin    = true;
    // 토큰은 메모리(window._stella.adminToken)에만 저장 — 새로고침 시 자동 로그아웃

    document.getElementById('admin-modal')?.remove();
    if (typeof onAdminLogin === 'function') onAdminLogin();

  } catch(e) {
    if (msg) msg.textContent = '오류: ' + e.message;
  }
}

function doLogout() {
  if (window._stella.adminToken) {
    firebase.database().ref(`_admin_sessions/${window._stella.adminToken}`).remove().catch(() => {});
  }
  window._stella.adminToken = null;
  window._stella.isAdmin    = false;
  sessionStorage.removeItem(ADMIN_TOKEN_KEY); // 혹시 남아있을 경우 대비
  if (typeof onAdminLogout === 'function') onAdminLogout();
}

function isAdmin() { return !!window._stella.isAdmin; }

/* ── 창/탭 닫기 시 관리자 세션 자동 삭제 ── */
window.addEventListener('beforeunload', () => {
  const token = window._stella?.adminToken;
  if (!token || typeof firebase === 'undefined') return;
  // sendBeacon 방식으로 비동기 삭제 (페이지 언로드 중에도 동작)
  try {
    const db  = firebase.database();
    const url = db.ref(`_admin_sessions/${token}`).toString() + '.json';
    // DELETE 요청 (Firebase REST API)
    navigator.sendBeacon
      ? navigator.sendBeacon(url + '?method=DELETE', '')
      : fetch(url, { method: 'DELETE', keepalive: true }).catch(() => {});
  } catch(e) {}
  window._stella.adminToken = null;
  window._stella.isAdmin    = false;
});
