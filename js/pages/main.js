/* ═══ 메인 페이지 ═══ */

function initMain() {
  _loadMainStats();
  _loadTop3();
  _loadNotes();
  _initVisitor();
  _restoreCharCard();
  if (isAdmin()) {
    const btn = document.getElementById('note-admin-btn');
    if (btn) btn.style.display = '';
  }
}

/* ── 스탯 ── */
function _loadMainStats() {
  window.$db.on('stella_members', val => {
    const members = val ? (Array.isArray(val) ? val : Object.values(val)).filter(Boolean) : [];
    const el = document.getElementById('stat-members');
    if (el) el.textContent = members.length;
  });

  window.$db.on('stella_zone', val => {
    const zones = val ? Object.values(val) : [];
    const owned = zones.filter(z => z && z.owner).length;
    const el = document.getElementById('stat-chunks');
    if (el) el.textContent = owned;
  });

  window.$db.on('stella_tribute', val => {
    if (!val) return;
    const total = Object.values(val).reduce((s, m) => s + (m?.points || 0), 0);
    const el = document.getElementById('stat-tribute');
    if (el) el.textContent = total.toLocaleString();
  });
}

/* ── TOP3 ── */
const FOOD_BASE = {};  // 원가 데이터 (비어있으면 등락률 생략)

function _loadTop3() {
  window.$db.on('stella_price_food', val => {
    const root = document.getElementById('main-top3');
    if (!root) return;

    if (!val?.items?.length) {
      root.innerHTML = `<div class="empty" style="padding:16px;">
        <span style="font-size:20px;opacity:.4;">📊</span>
        <span>시세 데이터가 없습니다</span>
      </div>`;
      return;
    }

    const items = val.items.slice(0, 3);
    const RANK  = ['🥇','🥈','🥉'];

    root.innerHTML = `<div class="top3-list">
      ${items.map((item, i) => {
        const name  = item.name || item.n || '';
        const price = item.price || item.p || 0;
        const base  = FOOD_BASE[name] || 0;
        const ratio = base ? ((price - base) / base * 100) : null;
        const badge = ratio !== null
          ? `<span class="tag ${ratio >= 0 ? 'tag-green' : 'tag-red'}">${ratio >= 0 ? '+' : ''}${ratio.toFixed(1)}%</span>`
          : '';
        return `
        <div class="top3-row">
          <span class="top3-rank">${RANK[i]}</span>
          <div class="top3-info">
            <div class="top3-name">${name}</div>
            <div class="top3-price">${price.toLocaleString()} 셀</div>
          </div>
          ${badge}
        </div>`;
      }).join('')}
    </div>`;
  });
}

/* ── 업데이트 노트 ── */
function _loadNotes() {
  window.$db.on('stella_update_notes', val => {
    const root = document.getElementById('main-notes');
    if (!root) return;

    const notes = val
      ? (Array.isArray(val) ? val : Object.values(val)).filter(Boolean)
      : [];
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recent = notes.slice(0, 5);

    if (!recent.length) {
      root.innerHTML = `<div class="empty" style="padding:16px;"><span>등록된 노트가 없습니다</span></div>`;
      return;
    }

    const DOT_COLOR = { notice:'var(--purple)', update:'var(--teal)', fix:'var(--amber)', event:'var(--green)' };
    root.innerHTML = `<div class="note-list">
      ${recent.map(n => {
        const color = DOT_COLOR[n.type] || 'var(--muted)';
        const date  = n.createdAt ? new Date(n.createdAt).toLocaleDateString('ko-KR', { month:'numeric', day:'numeric' }) : '';
        return `
        <div class="note-row">
          <div class="note-dot" style="background:${color}"></div>
          <div>
            <div class="note-text">${n.content || n.title || ''}</div>
            <div class="note-date">${date}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  });
}

/* ── 방문자 카운터 ── */
function _initVisitor() {
  // 방문자 카운터는 firebase 직접 접근 (Admin SDK 불필요, DB Rules에서 허용)
  if (typeof firebase === 'undefined' || !window._fbReady) return;
  const db    = firebase.database();
  const uid   = localStorage.getItem('stella_uid') || crypto.randomUUID();
  localStorage.setItem('stella_uid', uid);
  const today = new Date().toISOString().slice(0,10);
  const path  = `stella_visitors/daily/${today}/${uid.slice(0,8)}`;

  db.ref(path).once('value').then(snap => {
    if (!snap.exists()) db.ref(path).set(true).catch(() => {});
  }).catch(() => {});

  db.ref('stella_visitors').on('value', snap => {
    const el  = document.getElementById('visitor-count');
    if (!el) return;
    const val = snap.exists() ? snap.val() : null;
    if (!val) return;
    const cnt = val.daily?.[today] ? Object.keys(val.daily[today]).length : 0;
    el.textContent = `오늘 방문자 ${cnt}명`;
  });
}

/* ── 캐릭터 스펙 ── */
function parseCharInfo(text) {
  const root = document.getElementById('char-stats');
  if (!root) return;
  if (!text?.trim()) { root.innerHTML = ''; return; }

  const stats = {};
  text.split('\n').forEach(line => {
    const m = line.match(/^(.+?)\s*[:：]\s*(.+)$/);
    if (m) stats[m[1].trim()] = m[2].trim();
  });

  if (!Object.keys(stats).length) {
    root.innerHTML = `<p style="font-size:12px;color:var(--muted);margin-top:8px;">파싱할 수 없는 형식이에요.</p>`;
    return;
  }

  window._charStats = stats;
  try { localStorage.setItem('stella_char_info', JSON.stringify({ text, stats })); } catch(e) {}

  // 카테고리 분류
  const CAT = {
    '기본 정보':  ['닉네임','직업','레벨','경험치','마나','체력'],
    '스킬 레벨':  ['채광 레벨','낚시 레벨','농사 레벨','요리 레벨','제련 레벨'],
    '능력치':     ['손재주','체력','민첩','지능','힘','마나 회복'],
  };

  // 분류되지 않은 항목은 기타로
  const used  = new Set();
  const groups = {};
  for (const [cat, keys] of Object.entries(CAT)) {
    const matched = Object.entries(stats).filter(([k]) => keys.some(kk => k.includes(kk)));
    if (matched.length) {
      groups[cat] = matched;
      matched.forEach(([k]) => used.add(k));
    }
  }
  const rest = Object.entries(stats).filter(([k]) => !used.has(k));
  if (rest.length) groups['기타'] = rest;

  // 렌더링
  const CAT_COLOR = {
    '기본 정보': 'var(--purple)',
    '스킬 레벨': 'var(--teal)',
    '능력치':    'var(--amber)',
    '기타':      'var(--muted)',
  };

  root.innerHTML = Object.entries(groups).map(([cat, entries]) => `
    <div style="margin-top:12px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;
        color:${CAT_COLOR[cat]||'var(--muted)'};text-transform:uppercase;
        margin-bottom:6px;padding-bottom:4px;
        border-bottom:1px solid var(--b1);">${cat}</div>
      <div class="char-stats">
        ${entries.map(([k,v]) => `
          <div class="char-stat-row">
            <span class="char-stat-key">${k}</span>
            <span class="char-stat-val">${v}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function _restoreCharCard() {
  try {
    const saved = localStorage.getItem('stella_char_info');
    if (!saved) return;
    const { text, stats } = JSON.parse(saved);
    const el = document.getElementById('char-paste');
    if (el) el.value = text;
    window._charStats = stats;
    parseCharInfo(text);
  } catch(e) {}
}

function clearCharCard() {
  const el = document.getElementById('char-paste');
  if (el) el.value = '';
  document.getElementById('char-stats').innerHTML = '';
  window._charStats = {};
  localStorage.removeItem('stella_char_info');
}

/* ── 업데이트 노트 작성 모달 ── */
function openNoteModal() {
  const m = document.createElement('div');
  m.className = 'modal-bg';
  m.innerHTML = `
    <div class="modal">
      <div class="modal-title">📝 업데이트 노트 작성</div>
      <div style="margin-top:16px;display:flex;flex-direction:column;gap:10px;">
        <select class="input" id="note-type" style="cursor:pointer;">
          <option value="update">🔄 업데이트</option>
          <option value="notice">📌 공지</option>
          <option value="fix">🔧 수정</option>
          <option value="event">🎉 이벤트</option>
        </select>
        <textarea class="input" id="note-content" rows="3" placeholder="내용을 입력하세요..."></textarea>
      </div>
      <div class="modal-btns">
        <button class="btn" onclick="this.closest('.modal-bg').remove()">취소</button>
        <button class="btn btn-primary" onclick="saveNote(this)">저장</button>
      </div>
    </div>`;
  document.body.appendChild(m);
}

async function saveNote(btn) {
  const type    = document.getElementById('note-type')?.value;
  const content = document.getElementById('note-content')?.value?.trim();
  if (!content) return;
  btn.textContent = '저장 중...';
  btn.disabled = true;
  try {
    const notes = (await window.$db.get('stella_update_notes')) || [];
    const arr   = Array.isArray(notes) ? notes : Object.values(notes);
    arr.unshift({ type, content, createdAt: new Date().toISOString() });
    await window.$db.set('stella_update_notes', arr.slice(0, 30));
    btn.closest('.modal-bg').remove();
  } catch(e) {
    alert('저장 실패: ' + e.message);
    btn.textContent = '저장'; btn.disabled = false;
  }
}
