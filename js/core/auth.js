window._stella = {
  isAdmin:    false,
  adminToken: null,
  villageOk:  false,
};

var SITE_PIN_KEY   = 'stella_pin_ok';
var ADMIN_TOKEN_KEY = 'stella_admin_token';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

(function init() {
  
  

  
  { // 마을 입장 항상 허용
    window._stella.villageOk = true;
  }

  
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
  // 마을 입장 팝업 제거 — 바로 앱 시작
  window._stella.villageOk = true;
  sessionStorage.setItem('stella_village_ok', 'true');
  if (typeof initApp === 'function') initApp();
}

function isSiteAuth() {
  return localStorage.getItem(SITE_PIN_KEY) === 'true';
}

function renderPinGate() {
  // 마을 입장 게이트 비활성화
  if (typeof initApp === 'function') initApp();
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

    
    if (!storedHash && pin === '1234') { _pinSuccess(); return; }

    const inputHash = await sha256(pin);
    if (inputHash === storedHash) { _pinSuccess(); return; }

    
    if (msg) msg.textContent = '비밀번호가 틀렸습니다.';
    document.querySelectorAll('.pin-dig').forEach(el => {
      el.value = '';
      el.classList.add('shake');
      el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
    });
    document.getElementById('p0')?.focus();
  } catch(e) {
    
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
  
  if (typeof initApp === 'function') initApp();
}

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

    
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2,'0')).join('');
    const expiry = Date.now() + 24 * 60 * 60 * 1000;

    await firebase.database().ref(`_admin_sessions/${token}`).set({ valid: true, expiry });

    window._stella.adminToken = token;
    window._stella.isAdmin    = true;
    

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
  sessionStorage.removeItem(ADMIN_TOKEN_KEY); 
  if (typeof onAdminLogout === 'function') onAdminLogout();
}

function isAdmin() { return !!window._stella.isAdmin; }

window.addEventListener('beforeunload', () => {
  const token = window._stella?.adminToken;
  if (!token || typeof firebase === 'undefined') return;
  
  try {
    const db  = firebase.database();
    const url = db.ref(`_admin_sessions/${token}`).toString() + '.json';
    
    navigator.sendBeacon
      ? navigator.sendBeacon(url + '?method=DELETE', '')
      : fetch(url, { method: 'DELETE', keepalive: true }).catch(() => {});
  } catch(e) {}
  window._stella.adminToken = null;
  window._stella.isAdmin    = false;
});function requireVillage(cb) {
  // 비밀번호 없이 바로 입장
  window._stella.villageOk = true;
  sessionStorage.setItem('stella_village_ok', 'true');
  if (typeof cb === 'function') cb();
}


function _bootApp() {
  // 마을 입장 팝업 제거 — 바로 앱 시작
  window._stella.villageOk = true;
  sessionStorage.setItem('stella_village_ok', 'true');
  if (typeof initApp === 'function') initApp();
}

function isSiteAuth() {
  return localStorage.getItem(SITE_PIN_KEY) === 'true';
}

function renderPinGate() {
  // 마을 입장 게이트 비활성화
  if (typeof initApp === 'function') initApp();
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

    
    if (!storedHash && pin === '1234') { _pinSuccess(); return; }

    const inputHash = await sha256(pin);
    if (inputHash === storedHash) { _pinSuccess(); return; }

    
    if (msg) msg.textContent = '비밀번호가 틀렸습니다.';
    document.querySelectorAll('.pin-dig').forEach(el => {
      el.value = '';
      el.classList.add('shake');
      el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
    });
    document.getElementById('p0')?.focus();
  } catch(e) {
    
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
  
  if (typeof initApp === 'function') initApp();
}

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

    
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2,'0')).join('');
    const expiry = Date.now() + 24 * 60 * 60 * 1000;

    await firebase.database().ref(`_admin_sessions/${token}`).set({ valid: true, expiry });

    window._stella.adminToken = token;
    window._stella.isAdmin    = true;
    

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
  sessionStorage.removeItem(ADMIN_TOKEN_KEY); 
  if (typeof onAdminLogout === 'function') onAdminLogout();
}

function isAdmin() { return !!window._stella.isAdmin; }

window.addEventListener('beforeunload', () => {
  const token = window._stella?.adminToken;
  if (!token || typeof firebase === 'undefined') return;
  
  try {
    const db  = firebase.database();
    const url = db.ref(`_admin_sessions/${token}`).toString() + '.json';
    
    navigator.sendBeacon
      ? navigator.sendBeacon(url + '?method=DELETE', '')
      : fetch(url, { method: 'DELETE', keepalive: true }).catch(() => {});
  } catch(e) {}
  window._stella.adminToken = null;
  window._stella.isAdmin    = false;
});


// 관리자 의견함 확인
function openFeedbackAdmin() {
  var ref = firebase.database().ref('stella_feedback');
  ref.once('value').then(function(snap) {
    var list = snap.val() || [];
    if (!list.length) { alert('받은 의견이 없습니다.'); return; }
    var m = document.createElement('div');
    m.className = 'modal-bg';
    m.style.cssText = 'position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;';
    m.onclick = function(e) { if (e.target === m) m.remove(); };
    m.innerHTML = '<div style="background:var(--bg-2);border:1px solid var(--b2);border-radius:16px;width:100%;max-width:600px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--b1);display:flex;justify-content:space-between;align-items:center;">' +
        '<span style="font-weight:700;color:var(--text);">💬 의견함 (' + list.length + '건)</span>' +
        '<div style="display:flex;gap:8px;">' +
          '<button onclick="clearFeedback()" style="padding:4px 10px;font-size:11px;border-radius:8px;background:var(--red-dim);color:var(--red);border:1px solid var(--red);cursor:pointer;">전체 삭제</button>' +
          '<button onclick="this.closest(\'.modal-bg\').remove()" style="background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer;">×</button>' +
        '</div>' +
      '</div>' +
      '<div style="overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;">' +
        list.slice().reverse().map(function(item, i) {
          var d = item.date ? new Date(item.date).toLocaleString('ko-KR') : '';
          return '<div style="background:var(--bg-card);border:1px solid var(--b1);border-radius:10px;padding:12px 14px;">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">' +
              '<span style="font-size:12px;font-weight:700;color:var(--sub);">' + (item.name || '익명') + '</span>' +
              '<span style="font-size:11px;color:var(--muted);">' + d + '</span>' +
            '</div>' +
            '<div style="font-size:13px;color:var(--text);white-space:pre-wrap;line-height:1.6;">' + (item.content || '') + '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
    document.body.appendChild(m);
  });
}

async function clearFeedback() {
  if (!confirm('모든 의견을 삭제할까요?')) return;
  await firebase.database().ref('stella_feedback').set([]);
  document.querySelector('.modal-bg')?.remove();
}
