/* ═══ 로그인 / 회원가입 / 인증 게이트 ═══ */

/* ── 로그인 페이지 렌더 ── */
function renderAuthPage(mode = 'login') {
  document.body.innerHTML = `
  <div id="auth-root" style="
    min-height:100vh;
    display:flex;align-items:center;justify-content:center;
    background:var(--bg);font-family:'Noto Sans KR',sans-serif;
  ">
    <div style="width:340px;max-width:90vw;">

      <!-- 로고 -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="width:48px;height:48px;border-radius:12px;
          background:linear-gradient(135deg,#818cf8,#c084fc);
          display:flex;align-items:center;justify-content:center;
          font-size:22px;margin:0 auto 12px;">✨</div>
        <div style="font-size:20px;font-weight:900;color:var(--text);">스텔라 마을 <span style="color:#818cf8;">위키</span></div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;">루나월드 스텔라 마을 종합 정보</div>
      </div>

      <!-- 탭 -->
      <div style="display:flex;gap:4px;margin-bottom:20px;background:var(--s2);border-radius:8px;padding:4px;">
        <button id="tab-login" onclick="switchAuthTab('login')"
          style="flex:1;padding:8px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:700;font-family:'Noto Sans KR',sans-serif;transition:all .15s;
          ${mode==='login'?'background:var(--s1);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.2);':'background:transparent;color:var(--muted);'}">
          로그인
        </button>
        <button id="tab-register" onclick="switchAuthTab('register')"
          style="flex:1;padding:8px;border-radius:6px;border:none;cursor:pointer;font-size:13px;font-weight:700;font-family:'Noto Sans KR',sans-serif;transition:all .15s;
          ${mode==='register'?'background:var(--s1);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.2);':'background:transparent;color:var(--muted);'}">
          회원가입
        </button>
      </div>

      <!-- 카드 -->
      <div style="background:var(--s1);border:1px solid var(--b1);border-radius:12px;padding:24px;">
        <div id="auth-form-area"></div>
        <div id="auth-msg" style="font-size:12px;margin-top:10px;min-height:18px;text-align:center;"></div>
      </div>

    </div>
  </div>`;

  switchAuthTab(mode);
}

/* ── 탭 전환 ── */
function switchAuthTab(mode) {
  const area = document.getElementById('auth-form-area');
  const tLogin = document.getElementById('tab-login');
  const tReg   = document.getElementById('tab-register');
  if (!area) return;

  const activeStyle = 'background:var(--s1);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.2);';
  const inactiveStyle = 'background:transparent;color:var(--muted);';

  if (mode === 'login') {
    if (tLogin)  tLogin.style.cssText  += activeStyle;
    if (tReg)    tReg.style.cssText    += inactiveStyle;
    area.innerHTML = `
      <div style="margin-bottom:14px;">
        <label style="font-size:11px;color:var(--sub);display:block;margin-bottom:5px;">마인크래프트 닉네임</label>
        <input id="auth-mc" placeholder="닉네임 입력" autocomplete="username"
          style="width:100%;padding:10px 12px;border:1px solid var(--b2);border-radius:8px;
          background:var(--s2);color:var(--text);font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box;"
          onkeydown="if(event.key==='Enter')document.getElementById('auth-pw').focus()">
      </div>
      <div style="margin-bottom:20px;">
        <label style="font-size:11px;color:var(--sub);display:block;margin-bottom:5px;">비밀번호</label>
        <input id="auth-pw" type="password" placeholder="비밀번호 입력" autocomplete="current-password"
          style="width:100%;padding:10px 12px;border:1px solid var(--b2);border-radius:8px;
          background:var(--s2);color:var(--text);font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box;"
          onkeydown="if(event.key==='Enter')doLogin()">
      </div>
      <button onclick="doLogin()"
        style="width:100%;padding:12px;border-radius:8px;border:none;cursor:pointer;
        background:linear-gradient(135deg,#818cf8,#6366f1);color:#fff;
        font-size:14px;font-weight:700;font-family:'Noto Sans KR',sans-serif;transition:opacity .15s;"
        onmouseover="this.style.opacity='.88'" onmouseout="this.style.opacity='1'">
        로그인
      </button>`;
    setTimeout(() => document.getElementById('auth-mc')?.focus(), 50);

  } else {
    if (tReg)   tReg.style.cssText   += activeStyle;
    if (tLogin) tLogin.style.cssText += inactiveStyle;
    area.innerHTML = `
      <!-- 스킨 미리보기 -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
        <div id="reg-skin" style="width:48px;height:48px;border-radius:8px;
          background:var(--s3);border:1px solid var(--b2);
          display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden;">
          👤
        </div>
        <div style="flex:1;">
          <label style="font-size:11px;color:var(--sub);display:block;margin-bottom:5px;">마인크래프트 닉네임</label>
          <input id="reg-mc" placeholder="닉네임 입력" autocomplete="username"
            style="width:100%;padding:10px 12px;border:1px solid var(--b2);border-radius:8px;
            background:var(--s2);color:var(--text);font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box;"
            oninput="updateRegSkin(this.value)"
            onkeydown="if(event.key==='Enter')document.getElementById('reg-pw').focus()">
        </div>
      </div>
      <div style="margin-bottom:14px;">
        <label style="font-size:11px;color:var(--sub);display:block;margin-bottom:5px;">비밀번호</label>
        <input id="reg-pw" type="password" placeholder="6자 이상"
          style="width:100%;padding:10px 12px;border:1px solid var(--b2);border-radius:8px;
          background:var(--s2);color:var(--text);font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box;"
          onkeydown="if(event.key==='Enter')document.getElementById('reg-pw2').focus()">
      </div>
      <div style="margin-bottom:20px;">
        <label style="font-size:11px;color:var(--sub);display:block;margin-bottom:5px;">비밀번호 확인</label>
        <input id="reg-pw2" type="password" placeholder="비밀번호 재입력"
          style="width:100%;padding:10px 12px;border:1px solid var(--b2);border-radius:8px;
          background:var(--s2);color:var(--text);font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box;"
          onkeydown="if(event.key==='Enter')doRegister()">
      </div>
      <button onclick="doRegister()"
        style="width:100%;padding:12px;border-radius:8px;border:none;cursor:pointer;
        background:linear-gradient(135deg,#c084fc,#a855f7);color:#fff;
        font-size:14px;font-weight:700;font-family:'Noto Sans KR',sans-serif;transition:opacity .15s;"
        onmouseover="this.style.opacity='.88'" onmouseout="this.style.opacity='1'">
        가입하기
      </button>`;
    setTimeout(() => document.getElementById('reg-mc')?.focus(), 50);
  }
}

/* ── 스킨 미리보기 ── */
let _skinTimer;
function updateRegSkin(mc) {
  clearTimeout(_skinTimer);
  if (!mc.trim()) {
    document.getElementById('reg-skin').innerHTML = '👤';
    return;
  }
  _skinTimer = setTimeout(() => {
    const box = document.getElementById('reg-skin');
    if (!box) return;
    box.innerHTML = `<img src="https://mc-heads.net/avatar/${encodeURIComponent(mc.trim())}/48"
      style="width:100%;height:100%;image-rendering:pixelated;display:block;"
      onerror="this.parentElement.innerHTML='👤'">`;
  }, 500);
}

/* ── 메시지 표시 ── */
function setAuthMsg(msg, isError = true) {
  const el = document.getElementById('auth-msg');
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? '#f87171' : '#4ade80';
}

/* ── 로그인 실행 ── */
async function doLogin() {
  const mc = (document.getElementById('auth-mc')?.value || '').trim();
  const pw = document.getElementById('auth-pw')?.value || '';
  if (!mc || !pw) { setAuthMsg('닉네임과 비밀번호를 입력해주세요.'); return; }
  setAuthMsg('로그인 중...', false);
  try {
    await window._authLogin(mc, pw);
    // onAuthStateChanged → _onAuthReady → 앱 실행
  } catch(e) {
    const msg = e.code === 'auth/invalid-credential'
      ? '닉네임 또는 비밀번호가 올바르지 않아요.'
      : e.code === 'auth/too-many-requests'
      ? '시도 횟수가 너무 많아요. 잠시 후 다시 시도해주세요.'
      : '로그인 실패: ' + e.message;
    setAuthMsg(msg);
  }
}

/* ── 회원가입 실행 ── */
async function doRegister() {
  const mc  = (document.getElementById('reg-mc')?.value || '').trim();
  const pw  = document.getElementById('reg-pw')?.value  || '';
  const pw2 = document.getElementById('reg-pw2')?.value || '';
  if (!mc)          { setAuthMsg('닉네임을 입력해주세요.'); return; }
  if (pw.length < 6){ setAuthMsg('비밀번호는 6자 이상이어야 해요.'); return; }
  if (pw !== pw2)   { setAuthMsg('비밀번호가 일치하지 않아요.'); return; }
  setAuthMsg('가입 중...', false);
  try {
    await window._authRegister(mc, pw);
    setAuthMsg('가입 완료! 로그인 중...', false);
  } catch(e) {
    const msg = e.code === 'auth/email-already-in-use'
      ? '이미 가입된 닉네임이에요.'
      : e.code === 'auth/invalid-email'
      ? '사용할 수 없는 닉네임이에요. (영문/숫자/_ 만 가능)'
      : '가입 실패: ' + e.message;
    setAuthMsg(msg);
  }
}

/* ── 인증 게이트 — 앱 진입 전 체크 ── */
window._onAuthReady = (user) => {
  if (user) {
    // 로그인 됨 → 앱 초기화
    if (typeof initApp === 'function') initApp();
  } else {
    // 비로그인 → 로그인 페이지
    renderAuthPage('login');
  }
};
