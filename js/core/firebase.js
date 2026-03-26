/* ═══════════════════════════════════════════════════════
   스텔라 마을 위키 v3 — Firebase 초기화

   ✅ API Key는 읽기 전용 권한만 허용
   ✅ DB Rules에서 모든 클라이언트 쓰기 차단
   ✅ 쓰기는 관리자 토큰 검증 후에만 허용
═══════════════════════════════════════════════════════ */
(function waitFirebase() {
  if (typeof firebase === 'undefined') {
    setTimeout(waitFirebase, 50);
    return;
  }

  const FIREBASE_CONFIG = {
    apiKey:            'AIzaSyBsLWXpA7s65PHHuk5tK5kJwG3QMCoirKc',
    authDomain:        'stella-0207.firebaseapp.com',
    databaseURL:       'https://stella-0207-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId:         'stella-0207',
    storageBucket:     'stella-0207.firebasestorage.app',
    messagingSenderId: '1067697775475',
    appId:             '1:1067697775475:web:c878e2175470f35cc01b06',
  };

  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  const db = firebase.database();

  /* ── 읽기 헬퍼 ── */
  window.$db = {
    on:  (path, cb)  => db.ref(path).on('value', s => cb(s.exists() ? s.val() : null)),
    get: (path)      => db.ref(path).once('value').then(s => s.exists() ? s.val() : null),
    off: (path)      => db.ref(path).off(),

    /* 쓰기 — 관리자 토큰 검증 후에만 실행 */
    set:    async (path, val) => { await _guard(); return db.ref(path).set(val); },
    update: async (path, val) => { await _guard(); return db.ref(path).update(val); },
    push:   async (path, val) => { await _guard(); return db.ref(path).push(val); },
    remove: async (path)      => { await _guard(); return db.ref(path).remove(); },
  };

  async function _guard() {
    const token = window._stella?.adminToken;
    if (!token) throw new Error('관리자 인증이 필요합니다.');
    const snap = await db.ref(`_admin_sessions/${token}`).once('value');
    if (!snap.exists() || !snap.val()?.valid) {
      window._stella.adminToken = null;
      window._stella.isAdmin    = false;
      sessionStorage.removeItem('stella_admin_token');
      throw new Error('관리자 세션이 만료되었습니다. 다시 로그인해주세요.');
    }
  }

  /* Firebase 준비 완료 */
  window._fbReady = true;
  document.dispatchEvent(new Event('firebase-ready'));
})();
