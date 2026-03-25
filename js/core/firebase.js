/* ═══ Firebase 초기화 ═══ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, update, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsLWXpA7s65PHHuk5tK5kJwG3QMCoirKc",
  authDomain: "stella-0207.firebaseapp.com",
  databaseURL: "https://stella-0207-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stella-0207",
  storageBucket: "stella-0207.firebasestorage.app",
  messagingSenderId: "1067697775475",
  appId: "1:1067697775475:web:c878e2175470f35cc01b06"
};

const app  = initializeApp(firebaseConfig);
const db   = getDatabase(app);
const auth = getAuth(app);

/* ── DB 헬퍼 (window 바인딩) ── */
window._fbSet    = (path, val) => set(ref(db, path), val);
window._fbRemove = (path)      => remove(ref(db, path));
window._fbUpdate = (path, val) => update(ref(db, path), val);
window._fbOn     = (path, cb)  => onValue(ref(db, path), snap => cb(snap.exists() ? snap.val() : null));
window._fbGet    = (path)      => get(ref(db, path)).then(s => s.exists() ? s.val() : null);

/* ── Auth 헬퍼 (window 바인딩) ── */
// 마크닉을 내부 이메일 형식으로 변환
window._mcToEmail = (mc) => `${mc.toLowerCase().replace(/[^a-z0-9_]/g,'')}@stella.local`;

// 회원가입: 마크닉 + 비밀번호
window._authRegister = async (mc, pw) => {
  const email = window._mcToEmail(mc);
  const cred  = await createUserWithEmailAndPassword(auth, email, pw);
  // DB에 유저 정보 저장
  await window._fbSet(`stella_users/${cred.user.uid}`, {
    mc,
    uid: cred.user.uid,
    isAdmin: false,
    createdAt: new Date().toISOString()
  });
  return cred.user;
};

// 로그인
window._authLogin = (mc, pw) => {
  const email = window._mcToEmail(mc);
  return signInWithEmailAndPassword(auth, email, pw);
};

// 로그아웃
window._authLogout = () => signOut(auth);

// 현재 유저 정보 (DB에서 가져오기)
window._getMyProfile = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await window._fbGet(`stella_users/${user.uid}`);
};

// 인증 상태 감시 → 앱 초기화 트리거
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const profile = await window._fbGet(`stella_users/${user.uid}`);
    window._currentUser   = profile || { mc: user.email.split('@')[0], isAdmin: false };
    window._currentUser.uid = user.uid;
    window._isAdmin = !!(profile && profile.isAdmin);
  } else {
    window._currentUser = null;
    window._isAdmin     = false;
  }
  // 인증 상태가 확인된 뒤 앱 초기화 실행
  if (typeof window._onAuthReady === 'function') {
    window._onAuthReady(user);
  }
});
