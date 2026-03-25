/* ═══ Firebase 초기화 — compat 방식 (전역 스크립트, 동기 로드) ═══ */
(function waitFirebase() {
  if (typeof firebase === 'undefined') {
    setTimeout(waitFirebase, 50);
    return;
  }

  const firebaseConfig = {
    apiKey: "AIzaSyBsLWXpA7s65PHHuk5tK5kJwG3QMCoirKc",
    authDomain: "stella-0207.firebaseapp.com",
    databaseURL: "https://stella-0207-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "stella-0207",
    storageBucket: "stella-0207.firebasestorage.app",
    messagingSenderId: "1067697775475",
    appId: "1:1067697775475:web:c878e2175470f35cc01b06"
  };

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  /* ── DB 헬퍼 ── */
  window._fbSet    = (path, val) => db.ref(path).set(val);
  window._fbRemove = (path)      => db.ref(path).remove();
  window._fbUpdate = (path, val) => db.ref(path).update(val);
  window._fbOn     = (path, cb)  => db.ref(path).on('value', snap => cb(snap.exists() ? snap.val() : null));
  window._fbGet    = (path)      => db.ref(path).once('value').then(s => s.exists() ? s.val() : null);

  // Firebase 준비 완료 신호
  window._fbReady = true;
  document.dispatchEvent(new Event('firebase-ready'));
})();
