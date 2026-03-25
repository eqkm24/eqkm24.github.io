/* ═══ 관리자 시스템 ═══ */

const ADMIN_HASH = 'fb98f230a69824c79b567b2eb4299c6ce45c4d3f4ca5d703a2f2a9366838035f';

/* ── 관리자 여부 확인 (Firebase 프로필 기반) ── */
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

  const profile = window._currentUser;
  const mc = profile?.mc || '알 수 없음';

  if (isAdmin()) {
    btn.classList.add('logged-in');
    btn.textContent = '관리자 ✓';
    btn.title = '관리자';
  } else {
    btn.classList.remove('logged-in');
    btn.textContent = mc;
    btn.title = mc;
  }

  // 초기화 버튼 관리자만 표시
  const rb = document.getElementById('mb-reset-btn'); if (rb) rb.style.display = isAdmin() ? '' : 'none';
  const zb = document.getElementById('zn-reset-btn'); if (zb) zb.style.display = isAdmin() ? '' : 'none';
  const tb = document.getElementById('tb-reset-btn'); if (tb) tb.style.display = isAdmin() ? '' : 'none';
}

/* ── 관리자 페이지 렌더 ── */
async function renderAdminPage() {
  if (!requireAdmin()) return;

  // 전체 유저 목록 가져오기
  const users = await window._fbGet('stella_users') || {};

  const root = document.getElementById('adm-modal-root');
  if (!root) return;

  const userRows = Object.entries(users).map(([uid, u]) => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;
      border-bottom:1px solid var(--b1);background:var(--s1);">
      <div style="width:36px;height:36px;border-radius:6px;overflow:hidden;
        background:var(--s3);border:1px solid var(--b2);flex-shrink:0;">
        <img src="https://mc-heads.net/avatar/${encodeURIComponent(u.mc||'')}/36"
          style="width:100%;height:100%;image-rendering:pixelated;display:block;"
          onerror="this.style.display='none'">
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:700;color:var(--text);">${u.mc || '알 수 없음'}</div>
        <div style="font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;">
          가입: ${u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '-'}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <!-- 비밀번호 (Firebase Auth는 직접 조회 불가 — 마스킹 표시) -->
        <span style="font-size:11px;color:var(--muted);font-family:'JetBrains Mono',monospace;"
          id="pw-${uid}" data-show="false" onclick="toggleAdminPw('${uid}')">
          ••••••
        </span>
        <!-- 관리자 토글 -->
        <button onclick="toggleAdminFlag('${uid}', ${!!u.isAdmin})"
          style="padding:3px 10px;border-radius:20px;border:1px solid ${u.isAdmin?'#4ade80':'var(--b2)'};
          background:${u.isAdmin?'#0a1e0a':'var(--s2)'};color:${u.isAdmin?'#4ade80':'var(--sub)'};
          font-size:11px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;">
          ${u.isAdmin ? '관리자' : '일반'}
        </button>
        <!-- 삭제 -->
        <span onclick="deleteUser('${uid}', '${u.mc}')"
          style="font-size:11px;color:var(--muted);cursor:pointer;padding:4px;"
          title="삭제">✕</span>
      </div>
    </div>`).join('');

  root.innerHTML = `
    <div class="mb-modal-bg" onclick="if(event.target===this)this.remove()">
      <div class="mb-modal" style="max-width:480px;max-height:80vh;overflow-y:auto;">
        <h3 style="margin-bottom:16px;">👑 관리자 페이지</h3>
        <div style="font-size:11px;color:var(--muted);margin-bottom:12px;">
          총 ${Object.keys(users).length}명 가입
        </div>
        <div style="border:1px solid var(--b1);border-radius:8px;overflow:hidden;">
          ${userRows || '<div style="padding:20px;text-align:center;color:var(--muted);">가입된 유저가 없어요.</div>'}
        </div>
        <div class="mb-modal-btns" style="margin-top:16px;">
          <button class="mb-btn" onclick="this.closest('.mb-modal-bg').remove()" style="width:100%;">닫기</button>
        </div>
      </div>
    </div>`;
}

/* ── 관리자 플래그 토글 ── */
async function toggleAdminFlag(uid, currentValue) {
  if (!requireAdmin()) return;
  if (!confirm(`관리자 권한을 ${currentValue ? '해제' : '부여'}할까요?`)) return;
  await window._fbUpdate(`stella_users/${uid}`, { isAdmin: !currentValue });
  renderAdminPage();
}

/* ── 비밀번호 마스킹/공개 토글 ── */
function toggleAdminPw(uid) {
  // Firebase Auth 보안 정책상 비밀번호 직접 조회 불가
  // 관리자가 직접 비밀번호 재설정 안내만 가능
  const el = document.getElementById(`pw-${uid}`);
  if (!el) return;
  const showing = el.dataset.show === 'true';
  if (!showing) {
    el.textContent = '재설정 필요';
    el.style.color = 'var(--gold)';
    el.dataset.show = 'true';
  } else {
    el.textContent = '••••••';
    el.style.color = 'var(--muted)';
    el.dataset.show = 'false';
  }
}

/* ── 유저 삭제 ── */
async function deleteUser(uid, mc) {
  if (!requireAdmin()) return;
  if (!confirm(`${mc} 유저를 삭제할까요?\n(Firebase Auth 계정은 별도로 삭제 필요)`)) return;
  await window._fbRemove(`stella_users/${uid}`);
  renderAdminPage();
}

/* ── 네비 관리자 버튼 클릭 ── */
function openAdminLogin() {
  if (isAdmin()) {
    renderAdminPage();
  } else {
    alert('관리자 권한이 없어요.');
  }
}

setTimeout(updateAdminUI, 200);
