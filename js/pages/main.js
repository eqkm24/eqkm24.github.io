/* ═══ 메인 페이지 ═══ */

/* ────────────────────────────────────────
   /생활 정보 파싱
   루나월드 /생활 정보 메시지 형식 예시:
   ✨ [닉네임] 님의 생활 정보
   채광 레벨: 15 (숙련도 4200/5000)
   낚시 레벨: 8  (숙련도 900/1200)
   농사 레벨: 12 (숙련도 2800/3500)
   요리 레벨: 5  (숙련도 320/600)
   보유 마나: 320 / 500
──────────────────────────────────────── */
function parseLifeInfo(text) {
  if (!text || !text.trim()) return null;
  const result = { nickname: '', skills: {}, mana: null, raw: text };

  // 닉네임 파싱 (다양한 형식 대응)
  const nickMatch = text.match(/\[(.+?)\]|(\S+)\s*님의\s*생활|플레이어[:\s]+(\S+)/);
  if (nickMatch) result.nickname = nickMatch[1] || nickMatch[2] || nickMatch[3] || '';

  // 레벨 파싱
  const jobs = { '채광': 'mining', '낚시': 'fishing', '농사': 'farming', '요리': 'cooking' };
  for (const [kr, en] of Object.entries(jobs)) {
    // "채광 레벨: 15 (숙련도 4200/5000)" 또는 "채광: Lv.15"
    const m = text.match(new RegExp(kr + '[^\\d]*(\\d+)[^\\d]*(\\d+)?\\/(\\d+)?'));
    if (m) {
      result.skills[en] = {
        level: parseInt(m[1]),
        exp: m[2] ? parseInt(m[2]) : null,
        maxExp: m[3] ? parseInt(m[3]) : null,
      };
    }
  }

  // 마나 파싱
  const manaM = text.match(/마나[:\s]+([\d,]+)\s*\/\s*([\d,]+)/);
  if (manaM) result.mana = { cur: parseInt(manaM[1].replace(/,/g,'')), max: parseInt(manaM[2].replace(/,/g,'')) };

  return (result.nickname || Object.keys(result.skills).length) ? result : null;
}

function renderCharacterCard(info) {
  const root = document.getElementById('char-card-area');
  if (!root) return;
  if (!info) {
    root.innerHTML = `<div class="char-parse-error">파싱할 수 없는 형식입니다. /생활 정보 메시지를 그대로 붙여넣어 주세요.</div>`;
    return;
  }

  const JOB_META = {
    mining:  { icon:'⛏', label:'채광', color:'#ffaa78' },
    fishing: { icon:'🎣', label:'낚시', color:'#88b8ff' },
    farming: { icon:'🌾', label:'농사', color:'#78d898' },
    cooking: { icon:'🍳', label:'요리', color:'#ffd070' },
  };

  const skillsHtml = Object.entries(info.skills).map(([en, sk]) => {
    const m = JOB_META[en];
    const pct = (sk.exp && sk.maxExp) ? Math.round(sk.exp / sk.maxExp * 100) : null;
    return `
    <div class="char-skill-row">
      <span class="char-skill-icon">${m.icon}</span>
      <span class="char-skill-label">${m.label}</span>
      <span class="char-skill-lv" style="color:${m.color}">Lv.${sk.level}</span>
      ${pct !== null ? `
      <div class="char-skill-bar-wrap">
        <div class="char-skill-bar" style="width:${pct}%;background:${m.color}20;border-color:${m.color}40;">
          <div class="char-skill-fill" style="width:${pct}%;background:${m.color};"></div>
        </div>
        <span class="char-skill-pct">${sk.exp?.toLocaleString()}/${sk.maxExp?.toLocaleString()}</span>
      </div>` : ''}
    </div>`;
  }).join('');

  const manaHtml = info.mana ? `
    <div class="char-mana-row">
      <span style="font-size:11px;color:var(--muted);">💧 마나</span>
      <span style="font-size:12px;font-weight:700;color:#88b8ff;font-family:'JetBrains Mono',monospace;">${info.mana.cur.toLocaleString()} / ${info.mana.max.toLocaleString()}</span>
    </div>` : '';

  root.innerHTML = `
    <div class="char-result-card">
      <div class="char-result-hd">
        <img src="https://mc-heads.net/avatar/${encodeURIComponent(info.nickname||'Steve')}/40"
          style="width:40px;height:40px;border-radius:8px;image-rendering:pixelated;border:2px solid var(--b2);"
          onerror="this.style.display='none'">
        <div>
          <div style="font-size:15px;font-weight:900;color:var(--text);">${info.nickname || '마을원'}</div>
          <div style="font-size:11px;color:var(--muted);">생활 스탯</div>
        </div>
        <button class="char-clear-btn" onclick="clearCharCard()">✕</button>
      </div>
      <div class="char-skills-list">${skillsHtml}</div>
      ${manaHtml}
    </div>`;

  // 결과 저장
  try { localStorage.setItem('stella_char_info', JSON.stringify(info)); } catch(e){}
}

function clearCharCard() {
  const root = document.getElementById('char-card-area');
  const inp  = document.getElementById('char-paste-input');
  if (root) root.innerHTML = '';
  if (inp)  inp.value = '';
  try { localStorage.removeItem('stella_char_info'); } catch(e){}
}

function onCharPaste(el) {
  setTimeout(() => {
    const info = parseLifeInfo(el.value);
    renderCharacterCard(info);
  }, 50);
}

/* ────────────────────────────────────────
   시세 TOP 3 (요리 원가 대비 최고가)
──────────────────────────────────────── */

// 요리 원가 DB (기본값 — 관리자가 추후 수정 가능)
const FOOD_BASE_PRICE = {
  '가스파초': 40, '데리야끼': 55, '무 착즙 주스': 35,
  '무조림': 42, '부야베스': 68, '세비체': 58,
  '쌈밥': 38, '양장피': 72, '에스카베체': 65,
  '옥수수 전': 44, '옥수수 착즙 주스': 36, '전골': 78,
  '치오피노': 85, '파에야': 92, '페페스': 48, '해산물 그릴 플래터': 95,
};

function renderPriceTop3() {
  const root = document.getElementById('main-price-top3');
  if (!root) return;

  if (!window.PT || !window.PT.food || !window.PT.food.data?.length) {
    root.innerHTML = `<div class="top3-empty">시세 데이터가 없습니다.<br><span style="font-size:11px;color:var(--muted);">변동 시세 페이지에서 먼저 등록해주세요</span></div>`;
    return;
  }

  const items = window.PT.food.data;
  // 원가 대비 현재가 비율 계산
  const withRatio = items.map(item => {
    const name  = item.name || item.n || '';
    const price = item.price || item.p || 0;
    const base  = FOOD_BASE_PRICE[name] || price;
    const ratio = base ? ((price - base) / base * 100) : 0;
    return { name, price, base, ratio };
  }).filter(i => i.name && i.price);

  withRatio.sort((a, b) => b.ratio - a.ratio);
  const top3 = withRatio.slice(0, 3);

  if (!top3.length) {
    root.innerHTML = `<div class="top3-empty">데이터가 부족합니다.</div>`;
    return;
  }

  const RANK_ICON = ['🥇', '🥈', '🥉'];
  root.innerHTML = top3.map((item, i) => {
    const sign  = item.ratio >= 0 ? '+' : '';
    const color = item.ratio > 0 ? '#4ade80' : item.ratio < 0 ? '#f87171' : 'var(--muted)';
    return `
    <div class="top3-row" onclick="go('price')">
      <span class="top3-rank">${RANK_ICON[i]}</span>
      <span class="top3-name">${item.name}</span>
      <span class="top3-price">${item.price.toLocaleString()}셀</span>
      <span class="top3-ratio" style="color:${color};">${sign}${item.ratio.toFixed(1)}%</span>
    </div>`;
  }).join('');
}

/* ────────────────────────────────────────
   업데이트 노트 (관리자 작성)
──────────────────────────────────────── */
let _updateNotes = [];

function _initUpdateNotesSync() {
  if (!window._fbOn) { setTimeout(_initUpdateNotesSync, 100); return; }
  window._fbOn('stella_update_notes', val => {
    _updateNotes = val ? (Array.isArray(val) ? val : Object.values(val)) : [];
    _updateNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderUpdateNotes();
  });
}
_initUpdateNotesSync();

function renderUpdateNotes() {
  const root = document.getElementById('main-update-notes');
  if (!root) return;
  if (!_updateNotes.length) {
    root.innerHTML = `<div style="padding:20px;text-align:center;color:var(--muted);font-size:12px;">등록된 업데이트 노트가 없습니다.</div>`;
    return;
  }
  root.innerHTML = _updateNotes.slice(0, 5).map(n => {
    const date = n.createdAt ? new Date(n.createdAt).toLocaleDateString('ko-KR', { month:'short', day:'numeric' }) : '';
    const isNew = n.createdAt && (Date.now() - new Date(n.createdAt)) < 86400000 * 3;
    return `
    <div class="un-item" onclick="toggleUpdateNote(this)">
      <div class="un-hd">
        <span class="un-ver">${n.version || 'v-'}</span>
        ${isNew ? '<span class="un-new">NEW</span>' : ''}
        <span class="un-title">${escMain(n.title)}</span>
        <span class="un-date">${date}</span>
        <span class="un-arrow">▼</span>
      </div>
      <div class="un-body">${mdLite(n.body || '')}</div>
    </div>`;
  }).join('');
}

function toggleUpdateNote(el) {
  const body  = el.querySelector('.un-body');
  const arrow = el.querySelector('.un-arrow');
  const isOpen = el.classList.contains('un-open');
  document.querySelectorAll('.un-item.un-open').forEach(c => {
    c.classList.remove('un-open');
    c.querySelector('.un-body').style.maxHeight = '0';
    c.querySelector('.un-arrow').style.transform = '';
  });
  if (!isOpen) {
    el.classList.add('un-open');
    body.style.maxHeight = body.scrollHeight + 'px';
    arrow.style.transform = 'rotate(180deg)';
  }
}

function openUpdateNoteModal(editIdx) {
  if (!isAdmin()) { alert('관리자 권한이 필요합니다.'); return; }
  const isEdit = editIdx !== undefined;
  const n = isEdit ? _updateNotes[editIdx] : null;
  document.getElementById('adm-modal-root').insertAdjacentHTML('beforeend', `
    <div class="mb-modal-bg" id="un-modal-bg" onclick="if(event.target.id==='un-modal-bg')this.remove()">
      <div class="mb-modal" style="max-width:500px;">
        <h3>${isEdit ? '✏️ 업데이트 노트 수정' : '📝 업데이트 노트 작성'}</h3>
        <label>버전 (예: v2.5.0)</label>
        <input id="un-ver" placeholder="v2.5.0" value="${n ? escMain(n.version||'') : ''}">
        <label>제목</label>
        <input id="un-ttl" placeholder="업데이트 내용 요약" value="${n ? escMain(n.title||'') : ''}">
        <label>내용 <span style="font-size:10px;color:var(--muted);font-weight:400;">**굵게** *이탤릭* \`코드\` 지원</span></label>
        <textarea id="un-body" style="width:100%;min-height:120px;resize:vertical;padding:10px 12px;border:1px solid var(--b2);border-radius:8px;background:var(--s2);color:var(--text);font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box;line-height:1.6;">${n ? escMain(n.body||'') : ''}</textarea>
        <div class="mb-modal-btns">
          <button class="mb-btn" onclick="document.getElementById('un-modal-bg').remove()">취소</button>
          <button class="mb-btn mb-btn-add" onclick="saveUpdateNote(${isEdit ? editIdx : 'undefined'})">${isEdit ? '저장' : '등록'}</button>
        </div>
      </div>
    </div>`);
}

async function saveUpdateNote(editIdx) {
  const ver   = (document.getElementById('un-ver').value || '').trim();
  const title = (document.getElementById('un-ttl').value || '').trim();
  const body  = (document.getElementById('un-body').value || '').trim();
  if (!title) { alert('제목을 입력해주세요.'); return; }
  const arr = [..._updateNotes];
  if (editIdx !== undefined) {
    arr[editIdx] = { ...arr[editIdx], version: ver, title, body };
  } else {
    arr.unshift({ version: ver, title, body, createdAt: new Date().toISOString() });
  }
  await window._fbSet('stella_update_notes', arr);
  document.getElementById('un-modal-bg').remove();
}

async function deleteUpdateNote(idx) {
  if (!confirm('삭제하시겠습니까?')) return;
  const arr = [..._updateNotes];
  arr.splice(idx, 1);
  await window._fbSet('stella_update_notes', arr.length ? arr : []);
}

/* ────────────────────────────────────────
   방문자 카운터 (Firebase 기반, IP 해시)
──────────────────────────────────────── */
async function initVisitorCounter() {
  if (!window._fbGet || !window._fbSet) { setTimeout(initVisitorCounter, 200); return; }

  // IP 기반 고유 식별자 (외부 API 없이 canvas fingerprint 사용)
  const uid = _getVisitorId();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    // 오늘 방문 여부 확인
    const todayVisit = await window._fbGet(`stella_visitors/daily/${today}/${uid}`);
    if (!todayVisit) {
      await window._fbSet(`stella_visitors/daily/${today}/${uid}`, true);
    }
    // 전체 방문 여부
    const totalVisit = await window._fbGet(`stella_visitors/total/${uid}`);
    if (!totalVisit) {
      await window._fbSet(`stella_visitors/total/${uid}`, true);
    }

    // 카운트 읽기
    const dailySnap = await window._fbGet(`stella_visitors/daily/${today}`);
    const totalSnap = await window._fbGet(`stella_visitors/total`);
    const dailyCnt  = dailySnap ? Object.keys(dailySnap).length : 1;
    const totalCnt  = totalSnap ? Object.keys(totalSnap).length : 1;

    const el = document.getElementById('visitor-counter');
    if (el) el.innerHTML = `오늘 <strong style="color:var(--accent);">${dailyCnt}</strong>명 방문 · 누적 <strong style="color:var(--sub);">${totalCnt}</strong>명`;
  } catch(e) {
    const el = document.getElementById('visitor-counter');
    if (el) el.textContent = '';
  }
}

function _getVisitorId() {
  try {
    let id = localStorage.getItem('stella_vid');
    if (!id) {
      // canvas fingerprint 간소화
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('stella' + navigator.language + screen.width, 2, 2);
      id = c.toDataURL().slice(-20).replace(/[^a-zA-Z0-9]/g, '') +
           Math.random().toString(36).slice(2, 8);
      localStorage.setItem('stella_vid', id);
    }
    return id;
  } catch(e) {
    return 'v' + Math.random().toString(36).slice(2, 10);
  }
}

/* ── 헬퍼 ── */
function escMain(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function mdLite(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code style="background:var(--s3);padding:1px 5px;border-radius:4px;font-size:.9em;">$1</code>')
    .replace(/\n/g,'<br>');
}

/* ── 저장된 캐릭터 복원 ── */
function restoreSavedChar() {
  try {
    const saved = localStorage.getItem('stella_char_info');
    if (saved) renderCharacterCard(JSON.parse(saved));
  } catch(e) {}
}
