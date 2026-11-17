/* ==========================================================================
   firebase-config.js — Firebase 연결 정보 (여기만 채우면 연동 시작)

   1) Firebase 콘솔 → 프로젝트 설정 → 일반 → 내 앱(웹) → SDK 설정 및 구성
      에 있는 firebaseConfig 값을 아래 FIREBASE_CONFIG 에 붙여넣으세요.
   2) databaseURL 이 꼭 있어야 합니다. (Realtime Database 를 만들면 생겨요)
   3) null 로 두면 연동 없이 이 브라우저에만 저장합니다.

   ※ apiKey 는 비밀번호가 아니라 '어느 프로젝트인지' 알려주는 값이라
     소스에 들어가도 괜찮습니다. 보안은 Realtime Database 규칙으로 지킵니다.
   ========================================================================== */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBZ-J537fGnyKOHXAnnuEK6Je0-GuMu-Lg",
  authDomain: "miru-0802.firebaseapp.com",
  databaseURL: "https://miru-0802-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "miru-0802",
  storageBucket: "miru-0802.firebasestorage.app",
  messagingSenderId: "931790847553",
  appId: "1:931790847553:web:d16c46138ed7189b8b90c0",
};
/* 예시
export const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "my-project.firebaseapp.com",
  databaseURL: "https://my-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-project",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
};
*/

/* DB 안에서 이 페이지 데이터가 들어갈 폴더 이름 */
export const DB_ROOT = 'miru';
