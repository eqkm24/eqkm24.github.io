/* ═══ Firebase 초기화 — DB 전용 (Auth 제거) ═══ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, update, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsLWXpA7s65PHHuk5tK5kJwG3QMCoirKc",
  authDomain: "stella-0207.firebaseapp.com",
  databaseURL: "https://stella-0207-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stella-0207",
  storageBucket: "stella-0207.firebasestorage.app",
  messagingSenderId: "1067697775475",
  appId: "1:1067697775475:web:c878e2175470f35cc01b06"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

/* ── DB 헬퍼 ── */
window._fbSet    = (path, val) => set(ref(db, path), val);
window._fbRemove = (path)      => remove(ref(db, path));
window._fbUpdate = (path, val) => update(ref(db, path), val);
window._fbOn     = (path, cb)  => onValue(ref(db, path), snap => cb(snap.exists() ? snap.val() : null));
window._fbGet    = (path)      => get(ref(db, path)).then(s => s.exists() ? s.val() : null);
