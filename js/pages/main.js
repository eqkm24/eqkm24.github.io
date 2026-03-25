/* ═══ 메인 페이지 ═══ */

/* ────────────────────────────────────────
   /생활 정보 파싱 — 실제 루나월드 포맷
   [20:44:09] ===== 생활 정보 =====
   명성: 20 (62,510.8 / 129,000, 48.46%)
   [숙련도]
   ㆍ채광 (Lv:21 / 35,228.4 / 122,400, 28.78%)
   [스킬]
   ㆍ단련된 곡괭이 (Lv:11)
   [스탯 정보]
   ㆍ채광 데미지 증가 (base:0 / temp:0 / equip:22.5 / total:22.5)
──────────────────────────────────────── */
function parseLifeInfo(text) {
  if (!text || !text.trim()) return null;
  const result = {
    nickname: '',
    fame: null,
    skills: {},
    activeSkills: {},
    stats: {},
    raw: text
  };

  // 명성 파싱
  const fameM = text.match(/명성:\s*(\d+)\s*\(([\d,\.]+)\s*\/\s*([\d,\.]+),\s*([\d\.]+)%\)/);
  if (fameM) {
    result.fame = {
      level: parseInt(fameM[1]),
      exp:    parseFloat(fameM[2].replace(/,/g,'')),
      maxExp: parseFloat(fameM[3].replace(/,/g,'')),
      pct:    parseFloat(fameM[4])
    };
  }

  // 숙련도 섹션 파싱
  const profSection = text.match(/\[숙련도\](.*?)(?=\[|$)/s);
  if (profSection) {
    const JOB_MAP = { '채광':'mining','낚시':'fishing','농사':'farming','요리':'cooking' };
    for (const line of profSection[1].split('\n')) {
      const m = line.match(/ㆍ(.+?)\s*\(Lv:(\d+)\s*\/\s*([\d,\.]+)\s*\/\s*([\d,\.]+),\s*([\d\.]+)%\)/);
      if (!m) continue;
      const name = m[1].trim();
      const en   = JOB_MAP[name];
      const data = {
        label:  name,
        level:  parseInt(m[2]),
        exp:    parseFloat(m[3].replace(/,/g,'')),
        maxExp: parseFloat(m[4].replace(/,/g,'')),
        pct:    parseFloat(m[5])
      };
      if (en) result.skills[en] = data;
    }
  }

  // 스킬 섹션 파싱
  const skillSection = text.match(/\[스킬\](.*?)(?=\[임시|$)/s);
  if (skillSection) {
    for (const line of skillSection[1].split('\n')) {
      const m = line.match(/ㆍ(.+?)\s*\(Lv:(\d+)\)/);
      if (m) result.activeSkills[m[1].trim()] = parseInt(m[2]);
    }
  }

  // 스탯 섹션 파싱 (total만, 중복은 합산)
  const statSection = text.match(/\[스탯 정보\](.*?)(?=\[|$)/s);
  if (statSection) {
    for (const line of statSection[1].split('\n')) {
      const m = line.match(/ㆍ(.+?)\s*\(.*?total:([\d\.]+)\)/);
      if (!m) continue;
      const name = m[1].trim();
      const val  = parseFloat(m[2]);
      if (val > 0) {
        result.stats[name] = Math.round(((result.stats[name] || 0) + val) * 1000) / 1000;
      }
    }
  }

  return (result.fame || Object.keys(result.skills).length) ? result : null;
}

function renderCharacterCard(info) {
  const root = document.getElementById('char-card-area');
  if (!root) return;
  if (!info) {
    root.innerHTML = `<div class="char-parse-error">파싱할 수 없는 형식입니다.<br><span style="font-size:11px;">/생활 정보 메시지를 그대로 붙여넣어 주세요.</span></div>`;
    return;
  }

  const JOB_META = {
    mining:  { icon:'⛏', label:'채광',  color:'#ffaa78' },
    fishing: { icon:'🎣', label:'낚시',  color:'#88b8ff' },
    farming: { icon:'🌾', label:'농사',  color:'#78d898' },
    cooking: { icon:'🍳', label:'요리',  color:'#ffd070' },
  };

  // 명성 바
  const fameHtml = info.fame ? `
    <div class="char-fame-row">
      <span class="char-fame-label">✨ 명성</span>
      <span class="char-fame-lv">Lv.${info.fame.level}</span>
      <div class="char-skill-bar-wrap" style="flex:1;">
        <div class="char-skill-bar">
          <div class="char-skill-fill" style="width:${info.fame.pct}%;background:#d0a8ff;"></div>
        </div>
        <span class="char-skill-pct">${info.fame.pct}%</span>
      </div>
    </div>` : '';

  // 숙련도 (4대 직업)
  const jobKeys = ['mining','fishing','farming','cooking'];
  const skillsHtml = jobKeys.map(en => {
    const sk = info.skills[en];
    const m  = JOB_META[en];
    if (!sk) return `
    <div class="char-skill-row">
      <span class="char-skill-icon">${m.icon}</span>
      <span class="char-skill-label">${m.label}</span>
      <span class="char-skill-lv" style="color:var(--muted)">—</span>
    </div>`;
    return `
    <div class="char-skill-row">
      <span class="char-skill-icon">${m.icon}</span>
      <span class="char-skill-label">${m.label}</span>
      <span class="char-skill-lv" style="color:${m.color}">Lv.${sk.level}</span>
      <div class="char-skill-bar-wrap">
        <div class="char-skill-bar">
          <div class="char-skill-fill" style="width:${sk.pct}%;background:${m.color};"></div>
        </div>
        <span class="char-skill-pct">${sk.pct}%</span>
      </div>
    </div>`;
  }).join('');

  // 보유 스킬
  const skillEntries = Object.entries(info.activeSkills);
  const activeSkillHtml = skillEntries.length ? `
    <div class="char-section-title">⚡ 보유 스킬</div>
    <div class="char-active-skills">
      ${skillEntries.map(([name, lv]) =>
        `<span class="char-skill-tag">${name} <span style="color:var(--accent);font-weight:900;">Lv.${lv}</span></span>`
      ).join('')}
    </div>` : '';

  // 주요 스탯 (상위 6개)
  const topStats = Object.entries(info.stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const statsHtml = topStats.length ? `
    <div class="char-section-title">📊 주요 스탯</div>
    <div class="char-stats-grid">
      ${topStats.map(([name, val]) =>
        `<div class="char-stat-item">
          <span class="char-stat-name">${name}</span>
          <span class="char-stat-val">+${val}</span>
        </div>`
      ).join('')}
    </div>` : '';

  root.innerHTML = `
    <div class="char-result-card">
      <div class="char-result-hd">
        <div style="width:40px;height:40px;border-radius:8px;background:var(--s3);border:2px solid var(--b2);display:flex;align-items:center;justify-content:center;font-size:20px;">🧑‍🌾</div>
        <div>
          <div style="font-size:14px;font-weight:900;color:var(--text);">내 캐릭터 스펙</div>
          ${info.fame ? `<div style="font-size:11px;color:var(--muted);">명성 ${info.fame.level}  · 스탯 포인트 파싱됨</div>` : ''}
        </div>
        <button class="char-clear-btn" onclick="clearCharCard()">✕</button>
      </div>
      ${fameHtml}
      <div style="font-size:10px;font-weight:800;color:var(--muted);margin:10px 0 6px;letter-spacing:.5px;">숙련도</div>
      <div class="char-skills-list">${skillsHtml}</div>
      ${activeSkillHtml}
      ${statsHtml}
    </div>`;

  try { localStorage.setItem('stella_char_info', JSON.stringify(info)); } catch(e){}
  // 손재주 등 스탯을 전역 노출 (제련 계산기에서 참조)
  window._charInfo = info;
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
    root.innerHTML = `<div class="top3-empty" style="padding:20px;text-align:center;color:var(--muted);font-size:12px;">
      시세 데이터가 없습니다.<br>
      <span style="font-size:11px;">변동 시세 페이지에서 먼저 등록해주세요</span>
    </div>`;
    return;
  }

  const items = window.PT.food.data;
  const withRatio = items.map(item => {
    const name  = item.name || item.n || '';
    const price = item.price || item.p || 0;
    const base  = (typeof FOOD_BASE_PRICE !== 'undefined' && FOOD_BASE_PRICE[name]) || price;
    const diff  = price - base;
    const ratio = base ? (diff / base * 100) : 0;
    return { name, price, base, diff, ratio };
  }).filter(i => i.name && i.price);

  withRatio.sort((a, b) => b.ratio - a.ratio);
  const top3 = withRatio.slice(0, 3);

  if (!top3.length) {
    root.innerHTML = `<div class="top3-empty" style="padding:20px;text-align:center;color:var(--muted);">데이터가 부족합니다.</div>`;
    return;
  }

  const RANK = ['🥇','🥈','🥉'];
  const RANK_COLOR = ['#ffd700','#c0c0c0','#cd7f32'];

  root.innerHTML = `<div class="top3-cards">${top3.map((item, i) => {
    const up   = item.ratio > 0;
    const eq   = item.ratio === 0;
    const sign = up ? '+' : '';
    const rColor = up ? '#4ade80' : eq ? 'var(--muted)' : '#f87171';
    const dColor = up ? '#4ade80' : eq ? 'var(--muted)' : '#f87171';
    const arrow  = up ? '▲' : eq ? '─' : '▼';

    // 음식 이미지 (FOOD_IMG 맵이 있으면 사용, 없으면 이모지)
    const foodImgs = (typeof FOOD_IMGS !== 'undefined') ? FOOD_IMGS : {};
    const imgKey = Object.keys(foodImgs).find(k => item.name.includes(k) || k.includes(item.name));
    const imgHtml = imgKey
      ? `<img src="${foodImgs[imgKey]}" alt="${item.name}" style="width:40px;height:40px;object-fit:contain;image-rendering:pixelated;">`
      : `<span style="font-size:28px;">🍱</span>`;

    return `
    <div class="top3-card" onclick="go('price')" style="border-top:3px solid ${RANK_COLOR[i]};">
      <div class="top3-card-rank" style="color:${RANK_COLOR[i]};">${RANK[i]}</div>
      <div class="top3-card-img">${imgHtml}</div>
      <div class="top3-card-name">${item.name}</div>
      <div class="top3-card-price">${item.price.toLocaleString()}<span style="font-size:10px;color:var(--muted);margin-left:2px;">셀</span></div>
      <div class="top3-card-diff" style="color:${dColor};">
        <span>${arrow}</span>
        <span>${sign}${Math.abs(item.diff).toLocaleString()}셀</span>
      </div>
      <div class="top3-card-ratio" style="color:${rColor};">${sign}${item.ratio.toFixed(1)}%</div>
    </div>`;
  }).join('')}</div>`;
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
