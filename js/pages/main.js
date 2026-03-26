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

  /* ── 파싱 ──
     형식:
     ===== 생활 정보 =====
     명성: 24 (...)
     [스탯 정보]
     ㆍ손재주 (base:30 / temp:68.02 / equip:0 / total:98.02)
     [숙련도]
     ㆍ요리 (Lv:26 / 276,605.2 / 304,400, 90.87%)
     [스킬]
     ㆍ미식가 (Lv:20)
  */

  const lines   = text.split('\n');
  let section   = '';   // 현재 섹션 (stat / proficiency / skill)
  const stats   = {};   // 스탯 total 값
  const profs   = {};   // 숙련도 레벨
  const skills  = {};   // 스킬 레벨
  let fame      = '';
  let statPts   = '';
  let skillPts  = '';

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // 섹션 헤더
    if (line.includes('[스탯 정보]'))  { section = 'stat'; continue; }
    if (line.includes('[숙련도]'))     { section = 'prof'; continue; }
    if (line.includes('[스킬]'))       { section = 'skill'; continue; }
    if (line.includes('[임시 스탯]') || line.includes('[임시 스킬]')) { section = 'skip'; continue; }

    // 명성 / 스탯포인트 / 스킬포인트
    const fameM = line.match(/^명성\s*[:：]\s*(\d+)/);
    if (fameM) { fame = fameM[1]; continue; }

    const spM = line.match(/^스탯\s*포인트\s*[:：]\s*(\d+)/);
    if (spM) { statPts = spM[1]; continue; }

    const skpM = line.match(/^스킬\s*포인트\s*[:：]\s*(\d+)/);
    if (skpM) { skillPts = skpM[1]; continue; }

    if (section === 'skip') continue;

    // ㆍ로 시작하는 항목
    if (!line.startsWith('ㆍ')) continue;
    const body = line.slice(1).trim();

    if (section === 'stat') {
      // ㆍ손재주 (base:30 / temp:68.02 / equip:0 / total:98.02)
      const m = body.match(/^(.+?)\s*\(.*?total\s*[:=]\s*([\d.]+)/);
      if (m) stats[m[1].trim()] = parseFloat(m[2]);
    }

    if (section === 'prof') {
      // ㆍ요리 (Lv:26 / ...)
      const m = body.match(/^(.+?)\s*\(Lv\s*[:=]\s*(\d+)/);
      if (m) profs[m[1].trim()] = parseInt(m[2]);
    }

    if (section === 'skill') {
      // ㆍ미식가 (Lv:20)
      const m = body.match(/^(.+?)\s*\(Lv\s*[:=]\s*(\d+)/);
      if (m) skills[m[1].trim()] = parseInt(m[2]);
    }
  }

  // 전역 노출 (제련 계산기에서 손재주 참조)
  window._charStats = { ...stats };

  // 저장
  try { localStorage.setItem('stella_char_info', JSON.stringify({ text, stats, profs, skills, fame })); } catch(e) {}

  // ── 렌더링 ──
  const fmt = v => typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : v;

  const section_html = (title, color, entries) => {
    if (!entries.length) return '';
    return `
      <div style="margin-top:14px;">
        <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;
          color:${color};text-transform:uppercase;
          margin-bottom:6px;padding-bottom:4px;
          border-bottom:1px solid var(--b1);">${title}</div>
        <div class="char-stats">
          ${entries.map(([k,v]) => `
            <div class="char-stat-row">
              <span class="char-stat-key">${k}</span>
              <span class="char-stat-val">${fmt(v)}</span>
            </div>`).join('')}
        </div>
      </div>`;
  };

  const topHtml = (fame || statPts || skillPts) ? `
    <div class="char-stats" style="margin-bottom:4px;">
      ${fame     ? `<div class="char-stat-row"><span class="char-stat-key">명성</span><span class="char-stat-val">${fame}</span></div>` : ''}
      ${statPts  ? `<div class="char-stat-row"><span class="char-stat-key">스탯 포인트</span><span class="char-stat-val">${statPts}</span></div>` : ''}
      ${skillPts ? `<div class="char-stat-row"><span class="char-stat-key">스킬 포인트</span><span class="char-stat-val">${skillPts}</span></div>` : ''}
    </div>` : '';

  // 스탯 — 주요 vs 기타 분리
  const KEY_STATS = ['손재주','노련함','행운','요리 등급업 확률','음식 효과연장','조리 단축','일반 작물 감소비율','경작지당 화분통 설치 개수'];
  const mainStats  = Object.entries(stats).filter(([k]) => KEY_STATS.includes(k));
  const otherStats = Object.entries(stats).filter(([k]) => !KEY_STATS.includes(k));

  root.innerHTML =
    topHtml +
    section_html('주요 스탯',  'var(--purple)', mainStats) +
    (otherStats.length ? section_html('기타 스탯', 'var(--muted)', otherStats) : '') +
    section_html('숙련도', 'var(--teal)',   Object.entries(profs).filter(([,v]) => v > 0)) +
    section_html('스킬',   'var(--amber)',  Object.entries(skills));
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
