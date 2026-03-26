/* ═══ 관리자 시스템 ═══ */

function isAdmin() { return !!(window._isAdmin); }

function requireAdmin() {
  if (!isAdmin()) { alert('관리자 권한이 필요합니다.'); return false; }
  return true;
}

function updateAdminUI() {
  const rb = document.getElementById('mb-reset-btn'); if (rb) rb.style.display = isAdmin() ? '' : 'none';
  const zb = document.getElementById('zn-reset-btn'); if (zb) zb.style.display = isAdmin() ? '' : 'none';
  const tb = document.getElementById('tb-reset-btn'); if (tb) tb.style.display = isAdmin() ? '' : 'none';
}

async function renderAdminPage() {
  if (!requireAdmin()) return;
  const root = document.getElementById('adm-modal-root');
  if (!root) return;

  root.innerHTML = `
    <div class="mb-modal-bg" onclick="if(event.target===this)this.remove()">
      <div class="mb-modal" style="max-width:460px;">
        <h3 style="margin-bottom:4px;">👑 관리자 페이지</h3>
        <p style="font-size:11px;color:var(--muted);margin-bottom:20px;">데이터 관리 및 PIN 변경</p>

        <!-- PIN 변경 섹션 -->
        <div class="adm-section">
          <div class="adm-section-title">🔐 PIN 변경</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:12px;color:var(--sub);width:70px;flex-shrink:0;">사이트 PIN</span>
              <input id="new-site-pin" class="mb-input" type="password" placeholder="새 사이트 PIN"
                style="flex:1;" maxlength="8">
              <button class="mb-btn" onclick="changePin('site')">변경</button>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:12px;color:var(--sub);width:70px;flex-shrink:0;">관리자 PIN</span>
              <input id="new-admin-pin" class="mb-input" type="password" placeholder="새 관리자 PIN"
                style="flex:1;" maxlength="8">
              <button class="mb-btn" onclick="changePin('admin')">변경</button>
            </div>
            <div id="pin-change-msg" style="font-size:11px;color:var(--accent);min-height:14px;"></div>
          </div>
        </div>

        <!-- 데이터 초기화 섹션 -->
        <div class="adm-section" style="margin-top:16px;">
          <div class="adm-section-title">🗑 데이터 초기화</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${[
              ['👥 마을원 명단', 'stella_members', []],
              ['🗺 마을 구역',   'stella_zone',    {}],
              ['⭐ 조공 포인트', 'stella_tribute', {}],
              ['📊 시세 데이터', null,             null],
            ].map(([label, key, empty]) => `
              <div style="background:var(--s2);border:1px solid var(--b1);border-radius:10px;
                padding:12px 14px;display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:12px;font-weight:700;color:var(--text);">${label}</span>
                <button class="mb-btn" style="background:#2a0a0a;border-color:#f87171;color:#f87171;font-size:11px;"
                  onclick="adminReset('${key}', ${JSON.stringify(empty)}, '${label}')">초기화</button>
              </div>`
            ).join('')}
          </div>
        </div>

        <div class="mb-modal-btns" style="margin-top:16px;">
          <button class="mb-btn" onclick="this.closest('.mb-modal-bg').remove()">닫기</button>
          <button class="mb-btn" style="color:var(--warn);border-color:var(--warn);"
            onclick="doLogout();this.closest('.mb-modal-bg').remove();">관리자 해제</button>
        </div>
      </div>
    </div>
    <style>
      .adm-section { background:var(--s2);border:1px solid var(--b1);border-radius:10px;padding:14px 16px; }
      .adm-section-title { font-size:11px;font-weight:800;color:var(--muted);letter-spacing:.5px;margin-bottom:10px; }
    </style>`;
}

async function changePin(type) {
  const inputId = type === 'site' ? 'new-site-pin' : 'new-admin-pin';
  const pin = document.getElementById(inputId)?.value?.trim();
  const msg = document.getElementById('pin-change-msg');
  if (!pin || pin.length < 4) { if(msg) msg.textContent = 'PIN은 4자리 이상이어야 합니다.'; return; }

  try {
    const hash = await sha256(pin);
    const path = type === 'site' ? 'stella_config/site_pin_hash' : '_admin_config/pin_hash';
    await window._fbSet(path, hash);
    if (msg) {
      msg.textContent = `${type === 'site' ? '사이트' : '관리자'} PIN이 변경되었습니다. ✓`;
      msg.style.color = 'var(--accent)';
    }
    document.getElementById(inputId).value = '';
    // 관리자 PIN 변경 시 기존 세션 전부 무효화
    if (type === 'admin') {
      await window._fbSet('_admin_sessions', null);
    }
  } catch(e) {
    if (msg) { msg.textContent = '변경 실패: ' + e.message; msg.style.color = 'var(--warn)'; }
  }
}

async function adminReset(key, empty, label) {
  if (!requireAdmin()) return;
  if (!confirm(`${label}을(를) 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
  try {
    if (key === null) {
      // 시세 데이터 전체
      await Promise.all(['stella_price_crop','stella_price_fish','stella_price_food']
        .map(k => window._fbSet(k, {})));
    } else {
      await window._fbSet(key, empty);
    }
    alert('초기화 완료');
  } catch(e) {
    alert('초기화 실패: ' + e.message);
  }
}

setTimeout(updateAdminUI, 200);
