(function waitFirebase() {
    if (typeof firebase === 'undefined') {
          setTimeout(waitFirebase, 50);
          return;
    }

   const firebaseConfig = {
         apiKey:            "AIzaSyBsLWXpA7s65PHHuk5tK5kJwG3QMCoirKc",
         authDomain:        "stella-0207.firebaseapp.com",
         databaseURL:       "https://stella-0207-default-rtdb.asia-southeast1.firebasedatabase.app",
         projectId:         "stella-0207",
         storageBucket:     "stella-0207.firebasestorage.app",
         messagingSenderId: "1067697775475",
         appId:             "1:1067697775475:web:c878e2175470f35cc01b06"
   };

   if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

   /* 읽기 전용 헬퍼 */
   window._fbOn  = (path, cb) => db.ref(path).on('value', snap => cb(snap.exists() ? snap.val() : null));
    window._fbGet = (path)     => db.ref(path).once('value').then(s => s.exists() ? s.val() : null);
    window._fbOff = (path)     => db.ref(path).off();

   /* 쓰기 헬퍼 — 관리자 토큰 검증 후에만 허용 */
   window._fbSet    = _requireAdminWrite('set');
    window._fbUpdate = _requireAdminWrite('update');
    window._fbRemove = _requireAdminWrite('remove');
    window._fbPush   = _requireAdminWrite('push');

   function _requireAdminWrite(op) {
         return async (path, val) => {
                 if (!window._adminToken) {
                           console.warn('[stella] 쓰기 차단: 관리자 인증 필요');
                           return Promise.reject(new Error('관리자 인증이 필요합니다.'));
                 }
                 const stored = await db.ref('_admin_sessions/' + window._adminToken).once('value');
                 if (!stored.exists() || !stored.val()?.valid) {
                           window._adminToken = null;
                           window._isAdmin    = false;
                           console.warn('[stella] 쓰기 차단: 유효하지 않은 토큰');
                           return Promise.reject(new Error('관리자 세션이 만료되었습니다.'));
                 }
                 const ref = db.ref(path);
                 if (op === 'set')    return ref.set(val);
                 if (op === 'update') return ref.update(val);
                 if (op === 'remove') return ref.remove();
                 if (op === 'push')   return ref.push(val);
         };
   }

   window._fbReady = true;
    document.dispatchEvent(new Event('firebase-ready'));
})();
