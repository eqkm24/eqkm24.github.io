/* ═══ 관리자 시스템 ═══ */

function isAdmin() {
  return !!(window._isAdmin);
}

function requireAdmin() {
  if (!isAdmin()) { alert('관리자 권한이 필요합니다.'); return false; }
  return true;
}

/* ── 네비 관리자 버튼 UI 업데이트 ── */
function updateAdminUI() {
  const btn = document.querySelector('.nav-admin-btn');
  if (!btn) return;
  if (isAdmin()) {
    btn.classList.add('logged-in');
    btn.textContent = '관리자 ✓';
    btn.title = '관리자 페이지';
  } else {
    btn.classList.remove('logged-in');
    btn.textContent = '관리자';
    btn.title = '관리자 로그인';
  }
  const rb = document.getElementById('mb-reset-btn'); if (rb) rb.style.display = isAdmin() ? '' : 'none';
  const zb = document.getElementById('zn-reset-btn'); if (zb) zb.style.display = isAdmin() ? '' : 'none';
  const tb = document.getElementById('tb-reset-btn'); if (tb) tb.style.display = isAdmin() ? '' : 'none';
}

/* ── 관리자 페이지 ── */
async function renderAdminPage() {
  if (!requireAdmin()) return;
  const root = document.getElementById('adm-modal-root');
  if (!root) return;

  root.innerHTML = `
    <div class="mb-modal-bg" onclick="if(event.target===this)this.remove()">
      <div class="mb-modal" style="max-width:460px;">
        <h3 style="margin-bottom:4px;">👑 관리자 페이지</h3>
        <p style="font-size:11px;color:var(--muted);margin-bottom:20px;">데이터 초기화 및 관리 기능</p>

        <div style="display:flex;flex-direction:column;gap:10px;">

          <div style="background:var(--s2);border:1px solid var(--b1);border-radius:10px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px;">👥 마을원 명단</div>
              <div style="font-size:11px;color:var(--muted);">전체 마을원 데이터 초기화</div>
            </div>
            <button class="mb-btn" style="background:#2a0a0a;border-color:#f87171;color:#f87171;"
              onclick="if(confirm('마을원 명단을 전체 초기화하시겠습니까?')){window._fbSet('stella_members',[]);alert('초기화 완료');}">초기화</button>
          </div>

          <div style="background:var(--s2);border:1px solid var(--b1);border-radius:10px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px;">🗺 마을 구역</div>
              <div style="font-size:11px;color:var(--muted);">구역 점유 데이터 초기화</div>
            </div>
            <button class="mb-btn" style="background:#2a0a0a;border-color:#f87171;color:#f87171;"
              onclick="if(confirm('구역 데이터를 초기화하시겠습니까?')){window._fbSet('stella_zone',{});alert('초기화 완료');}">초기화</button>
          </div>

          <div style="background:var(--s2);border:1px solid var(--b1);border-radius:10px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px;">⭐ 조공 포인트</div>
              <div style="font-size:11px;color:var(--muted);">전체 조공 포인트 초기화</div>
            </div>
            <button class="mb-btn" style="background:#2a0a0a;border-color:#f87171;color:#f87171;"
              onclick="if(confirm('조공 포인트를 초기화하시겠습니까?')){window._fbSet('stella_tribute',{});alert('초기화 완료');}">초기화</button>
          </div>

          <div style="background:var(--s2);border:1px solid var(--b1);border-radius:10px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px;">📣 공지사항</div>
              <div style="font-size:11px;color:var(--muted);">전체 공지 데이터 초기화</div>
            </div>
            <button class="mb-btn" style="background:#2a0a0a;border-color:#f87171;color:#f87171;"
              onclick="if(confirm('공지 데이터를 초기화하시겠습니까?')){window._fbSet('stella_notices',[]);alert('초기화 완료');}">초기화</button>
          </div>

          <div style="background:var(--s2);border:1px solid var(--b1);border-radius:10px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px;">📊 시세 데이터</div>
              <div style="font-size:11px;color:var(--muted);">농작물·물고기·요리 시세 초기화</div>
            </div>
            <button class="mb-btn" style="background:#2a0a0a;border-color:#f87171;color:#f87171;"
              onclick="if(confirm('시세 데이터를 전체 초기화하시겠습니까?')){['stella_price_crop','stella_price_fish','stella_price_food'].forEach(k=>window._fbSet(k,{}));alert('초기화 완료');}">초기화</button>
          </div>

        </div>

        <div style="margin-top:16px;padding:12px 14px;background:var(--s3);border-radius:8px;font-size:11px;color:var(--muted);line-height:1.6;">
          💡 PIN 변경: <code style="background:var(--s2);padding:1px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;">js/core/auth.js</code> 파일 상단의 <code style="background:var(--s2);padding:1px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;">SITE_PIN</code> · <code style="background:var(--s2);padding:1px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;">ADMIN_PIN</code> 수정
        </div>

        <div class="mb-modal-btns" style="margin-top:16px;">
          <button class="mb-btn" onclick="this.closest('.mb-modal-bg').remove()">닫기</button>
          <button class="mb-btn" style="color:var(--warn);border-color:var(--warn);"
            onclick="if(confirm('관리자 세션을 종료하시겠습니까?')){sessionStorage.removeItem('stella_admin_ok');window._isAdmin=false;updateAdminUI();this.closest('.mb-modal-bg').remove();}">
            관리자 해제
          </button>
        </div>
      </div>
    </div>`;
}

setTimeout(updateAdminUI, 200);
