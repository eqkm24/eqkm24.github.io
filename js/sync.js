/* ==========================================================================
   sync.js — Firebase Realtime Database 연동
   공유하는 값: 요리 판매가 · 비약 판매가 · 재료 단가
   (숙련도 · 알람 · 화면 설정은 사람마다 다르니 각자 브라우저에 둡니다)

   DB 구조
     {DB_ROOT}/cookPrices/{요리명}   = { price, at }
     {DB_ROOT}/elixirPrices/{비약명} = { price, at }
     {DB_ROOT}/ingPrices/{재료명}    = 단가
   바뀐 항목만 골라 보내므로 두 사람이 다른 항목을 동시에 고쳐도 서로 덮어쓰지 않습니다.
   ========================================================================== */
import * as store from './store.js';
import { KEYS } from './store.js';
import { FIREBASE_CONFIG, DB_ROOT } from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
const SHARED = [KEYS.cookPrices, KEYS.elixirPrices, KEYS.ingPrices];

/* 상태: off(설정 없음) · connecting · online · offline · error */
let state = FIREBASE_CONFIG ? 'connecting' : 'off';
let detail = '';
const stateListeners = new Set();
export const syncState = () => ({ state, detail });
export function onSyncState(fn) { stateListeners.add(fn); return () => stateListeners.delete(fn); }
function setState(s, d = '') { state = s; detail = d; stateListeners.forEach(fn => fn({ state, detail })); }

/* Firebase 키에 못 쓰는 문자 . # $ [ ] / 를 안전하게 바꿈 */
const encodeKey = k => k.replace(/[.#$\[\]\/%]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
const decodeKey = k => k.replace(/%([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

function diff(prev = {}, next = {}) {
  const out = {};
  for (const k of new Set([...Object.keys(prev || {}), ...Object.keys(next || {})])) {
    const a = prev?.[k], b = next?.[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) out[encodeKey(k)] = b ?? null;   // null = 삭제
  }
  return out;
}

export async function initSync() {
  if (!FIREBASE_CONFIG) return;
  if (!FIREBASE_CONFIG.databaseURL) { setState('error', 'firebaseConfig 에 databaseURL 이 없어요'); return; }

  let fb;
  try {
    const [app, db] = await Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-database.js`),
    ]);
    fb = { ...app, ...db };
  } catch (e) {
    setState('error', 'Firebase 를 불러오지 못했어요 (이 주소에서는 외부 연결이 막혀 있을 수 있어요)');
    return;
  }

  let db;
  try {
    db = fb.getDatabase(fb.initializeApp(FIREBASE_CONFIG));
  } catch (e) {
    setState('error', 'firebaseConfig 값을 확인해 주세요');
    return;
  }

  // 연결 상태
  fb.onValue(fb.ref(db, '.info/connected'), snap => {
    setState(snap.val() ? 'online' : (state === 'connecting' ? 'connecting' : 'offline'));
  });

  // 내가 고친 값 → 서버 (바뀐 항목만)
  store.setWriteHook((key, value, prev) => {
    if (!SHARED.includes(key)) return;
    const patch = diff(prev, value);
    if (!Object.keys(patch).length) return;
    fb.update(fb.ref(db, `${DB_ROOT}/${key}`), patch)
      .catch(err => setState('error', err?.code === 'PERMISSION_DENIED' ? 'DB 규칙에서 쓰기가 막혀 있어요' : '저장하지 못했어요'));
  });

  // 서버 값 → 내 화면 (처음 한 번 + 바뀔 때마다)
  let first = true;
  SHARED.forEach(key => {
    fb.onValue(fb.ref(db, `${DB_ROOT}/${key}`), snap => {
      const remote = {};
      Object.entries(snap.val() || {}).forEach(([k, v]) => { remote[decodeKey(k)] = v; });
      // 처음 연결했는데 서버가 비어 있고 내 브라우저에 값이 있으면 → 올려줌
      const local = store.get(key, {});
      if (first && !snap.exists() && Object.keys(local).length) {
        fb.update(fb.ref(db, `${DB_ROOT}/${key}`), diff({}, local)).catch(() => {});
        return;
      }
      if (JSON.stringify(remote) !== JSON.stringify(local)) store.set(key, remote, { fromRemote: true });
    }, err => setState('error', err?.code === 'PERMISSION_DENIED' ? 'DB 규칙에서 읽기가 막혀 있어요' : '불러오지 못했어요'));
  });
  setTimeout(() => { first = false; }, 4000);
}
