function initMain() {
  _showPopupIfNeeded();
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

function _showPopupIfNeeded() {
  const key     = 'stella_popup_skip';
  const skipped = localStorage.getItem(key);
  if (skipped === new Date().toDateString()) return;
  const popup = document.getElementById('main-popup');
  if (popup) popup.style.display = 'flex';
}

function closeMainPopup() {
  const popup = document.getElementById('main-popup');
  if (!popup) return;
  const noShow = document.getElementById('popup-no-show')?.checked;
  if (noShow) localStorage.setItem('stella_popup_skip', new Date().toDateString());
  popup.style.opacity = '0';
  popup.style.transition = 'opacity .2s';
  setTimeout(() => popup.style.display = 'none', 200);
}

function searchRecipeMain(q) {
  const root = document.getElementById('main-recipe-results');
  if (!root) return;
  q = q.trim().toLowerCase();

  if (!q) { root.innerHTML = ''; return; }

  
  if (typeof RECIPE_DATA === 'undefined') {
    root.innerHTML = `<div style="font-size:12px;color:var(--muted);padding:8px;">제작 데이터를 불러오는 중...</div>`;
    return;
  }

  const results = [];
  const allCats = Object.entries(RECIPE_DATA);
  for (const [cat, items] of allCats) {
    for (const item of items) {
      const nameMatch = item.name.toLowerCase().includes(q);
      const matMatch  = item.mats?.some(([m]) => String(m).toLowerCase().includes(q));
      if (nameMatch || matMatch) results.push({ ...item, cat });
    }
  }

  if (!results.length) {
    root.innerHTML = `<div class="empty" style="padding:16px;font-size:12px;">검색 결과가 없어요.</div>`;
    return;
  }

  const FAC_LABEL = { bench:'편백', brazier:'화로', counter:'조리대' };
  const GRADE_TAG = { n:'tag-blue', a:'tag-teal', r:'tag-purple', h:'tag-amber' };
  const GRADE_LBL = { n:'일반', a:'고급', r:'희귀', h:'영웅' };

  root.innerHTML = `
    <div style="font-size:11px;color:var(--muted);margin-bottom:6px;">${results.length}개 결과</div>
    <div class="recipe-search-results">
      ${results.map(it => `
        <div class="recipe-card" onclick="go('recipe')" style="padding:10px 12px;cursor:pointer;">
          <div class="recipe-card-hd" style="gap:10px;">
            <div class="recipe-img" style="width:32px;height:32px;font-size:16px;">
              ${LC_IMGS?.[it.name] ? `<img src="${LC_IMGS[it.name]}" style="width:100%;height:100%;object-fit:contain;" loading="lazy">` : '📦'}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px;">${it.name}</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;">
                <span class="tag ${GRADE_TAG[it.grade]||'tag-blue'}">${GRADE_LBL[it.grade]||''}</span>
                <span class="tag" style="background:var(--bg-3);color:var(--muted);">${FAC_LABEL[it.cat]||it.cat}</span>
                <span class="tag" style="background:var(--bg-3);color:var(--muted);">⏱ ${it.time}</span>
              </div>
            </div>
          </div>
          <div class="recipe-mats" style="margin-top:6px;">
            ${(it.mats||[]).map(([n,q]) => `<span class="mat-tag">${n} <span class="mat-qty">×${q}</span></span>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;
}

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

var FOOD_BASE = {};  

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
    const RANK_SVG = [
      '<svg viewBox="0 0 20 20" fill="none" style="width:18px;height:18px;"><circle cx="10" cy="10" r="8" fill="rgba(246,183,107,0.2)"/><path d="M10 6L11.2 9.2H14.6L11.9 11.2L12.9 14.4L10 12.4L7.1 14.4L8.1 11.2L5.4 9.2H8.8L10 6Z" fill="#f6b76b"/></svg>',
      '<svg viewBox="0 0 20 20" fill="none" style="width:18px;height:18px;"><circle cx="10" cy="10" r="8" fill="rgba(176,180,200,0.2)"/><path d="M10 6L11.2 9.2H14.6L11.9 11.2L12.9 14.4L10 12.4L7.1 14.4L8.1 11.2L5.4 9.2H8.8L10 6Z" fill="#b0b4c8"/></svg>',
      '<svg viewBox="0 0 20 20" fill="none" style="width:18px;height:18px;"><circle cx="10" cy="10" r="8" fill="rgba(205,127,50,0.2)"/><path d="M10 6L11.2 9.2H14.6L11.9 11.2L12.9 14.4L10 12.4L7.1 14.4L8.1 11.2L5.4 9.2H8.8L10 6Z" fill="#cd7f32"/></svg>',
    ];
    const RANK = RANK_SVG;

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

function _initVisitor() {
  
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

function parseCharInfo(text) {
  const root = document.getElementById('char-stats');
  if (!root) return;
  if (!text?.trim()) {
    root.innerHTML = '';
    _showCharPaste(true);
    return;
  }

  const lines  = text.split('\n');
  let section  = '';
  const stats  = {};
  const profs  = {};  
  const skills = {};
  let fame = '', fameNum = 0, famePct = 0;
  let statPts = '', skillPts = '';

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.includes('[스탯 정보]'))  { section = 'stat';  continue; }
    if (line.includes('[숙련도]'))     { section = 'prof';  continue; }
    if (line.includes('[스킬]'))       { section = 'skill'; continue; }
    if (line.includes('[임시'))        { section = 'skip';  continue; }
    if (section === 'skip') continue;

    
    const fameM = line.match(/^명성\s*[:：]\s*(\d+)\s*\(.*?([\d.]+)%\)/);
    if (fameM) { fame = fameM[1]; famePct = parseFloat(fameM[2]); continue; }

    const spM  = line.match(/^스탯\s*포인트\s*[:：]\s*(\d+)/);
    if (spM)  { statPts  = spM[1];  continue; }
    const skpM = line.match(/^스킬\s*포인트\s*[:：]\s*(\d+)/);
    if (skpM) { skillPts = skpM[1]; continue; }

    if (!line.startsWith('ㆍ')) continue;
    const body = line.slice(1).trim();

    if (section === 'stat') {
      
      const m = body.match(/^(.+?)\s*\(.*?total\s*[:=]\s*([\d.]+)/);
      if (m) stats[m[1].trim()] = parseFloat(m[2]);
    }

    if (section === 'prof') {
      
      const m = body.match(/^(.+?)\s*\(Lv\s*[:=]\s*(\d+)[^)]*,\s*([\d.]+)%/);
      if (m) profs[m[1].trim()] = { lv: parseInt(m[2]), pct: parseFloat(m[3]) };
      else {
        const m2 = body.match(/^(.+?)\s*\(Lv\s*[:=]\s*(\d+)/);
        if (m2) profs[m2[1].trim()] = { lv: parseInt(m2[2]), pct: 0 };
      }
    }

    if (section === 'skill') {
      const m = body.match(/^(.+?)\s*\(Lv\s*[:=]\s*(\d+)/);
      if (m) skills[m[1].trim()] = parseInt(m[2]);
    }
  }

  window._charStats = { ...stats };
  try { localStorage.setItem('stella_char_info', JSON.stringify({ text, stats, profs, skills, fame, famePct })); } catch(e) {}

  
  _showCharPaste(false);

  const fmt = v => typeof v === 'number'
    ? (Number.isInteger(v) ? v : (v % 1 === 0 ? v : parseFloat(v.toFixed(2))))
    : v;

  
  
  const BASE_STATS  = ['행운','노련함','손재주','감각','인내력','카리스마'];
  
  const JOB_STATS   = ['요리 등급업 확률','음식 효과연장','조리 단축',
                        '일반 작물 감소비율','경작지당 화분통 설치 개수','경작지 점유 수'];
  const baseEntries = BASE_STATS.map(k => stats[k] != null ? [k, stats[k]] : null).filter(Boolean);
  const jobEntries  = JOB_STATS.map(k => stats[k] != null ? [k, stats[k]] : null).filter(Boolean);
  const usedKeys    = new Set([...BASE_STATS, ...JOB_STATS]);
  const etcEntries  = Object.entries(stats).filter(([k]) => !usedKeys.has(k));

  
  const profEntries = Object.entries(profs).filter(([,v]) => v.lv > 0);
  const JOB_COLOR   = { 채광:'var(--amber)', 낚시:'var(--blue)', 농사:'var(--green)',
                         요리:'var(--red)',   대장술:'var(--purple)', 생존:'var(--teal)',
                         연금술:'var(--teal)', 벌목:'var(--green)' };

  const sec = (title, color, html) => html ? `
    <div style="margin-top:14px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;
        color:${color};text-transform:uppercase;
        margin-bottom:8px;padding-bottom:4px;
        border-bottom:1px solid var(--b1);">${title}</div>
      ${html}
    </div>` : '';

  const statGrid = entries => entries.length ? `
    <div class="char-stats">
      ${entries.map(([k,v]) => `
        <div class="char-stat-row">
          <span class="char-stat-key">${k}</span>
          <span class="char-stat-val" style="color:var(--purple);font-size:13px;font-weight:900;">+${fmt(v)}</span>
        </div>`).join('')}
    </div>` : '';

  const profBars = profEntries.length ? profEntries.map(([name, {lv, pct}]) => {
    const color = JOB_COLOR[name] || 'var(--purple)';
    return `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <span style="font-size:12px;font-weight:700;color:var(--sub);width:52px;flex-shrink:0;">${name}</span>
      <span style="font-size:11px;font-weight:700;color:${color};width:36px;flex-shrink:0;">Lv.${lv}</span>
      <div style="flex:1;height:5px;background:var(--b1);border-radius:3px;overflow:hidden;">
        <div style="height:100%;border-radius:3px;background:${color};width:${pct}%;transition:width .5s;"></div>
      </div>
      <span style="font-size:10px;color:var(--muted);width:38px;text-align:right;flex-shrink:0;">${pct}%</span>
    </div>`; }).join('') : '';

  const skillTags = Object.entries(skills).length ? `
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      ${Object.entries(skills).map(([k,v]) => `
        <span class="tag tag-amber">${k} Lv.${v}</span>`).join('')}
    </div>` : '';

  
  const fameHtml = fame ? `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
      <span style="font-size:12px;font-weight:700;color:var(--sub);">명성</span>
      <span style="font-size:13px;font-weight:900;color:var(--purple);">Lv.${fame}</span>
      <div style="flex:1;height:5px;background:var(--b1);border-radius:3px;overflow:hidden;">
        <div style="height:100%;border-radius:3px;background:var(--purple);width:${famePct}%;"></div>
      </div>
      <span style="font-size:10px;color:var(--muted);">${famePct}%</span>
    </div>
    ${statPts !== '' ? `<div style="font-size:11px;color:var(--muted);">스탯 포인트 ${statPts} · 스킬 포인트 ${skillPts||0}</div>` : ''}` : '';

  root.innerHTML =
    (fameHtml ? `<div style="margin-bottom:4px;">${fameHtml}</div>` : '') +
    sec('기본 스탯',   'var(--purple)', statGrid(baseEntries)) +
    sec('직업 스탯',   'var(--teal)',   statGrid(jobEntries)) +
    (etcEntries.length ? sec('기타',    'var(--muted)',  statGrid(etcEntries)) : '') +
    sec('숙련도',      'var(--amber)',  profBars) +
    sec('보유 스킬',   'var(--green)',  skillTags);
}

function _showCharPaste(show) {
  const ta  = document.getElementById('char-paste');
  const btn = document.getElementById('char-paste-toggle');
  if (ta)  ta.style.display  = show ? '' : 'none';
  if (btn) btn.style.display = show ? 'none' : '';
}

function _restoreCharCard() {
  try {
    const saved = localStorage.getItem('stella_char_info');
    if (!saved) return;
    const { text, stats } = JSON.parse(saved);
    const el = document.getElementById('char-paste');
    if (el) el.value = text;
    window._charStats = stats || {};
    parseCharInfo(text);
  } catch(e) {}
}

function clearCharCard() {
  const el = document.getElementById('char-paste');
  if (el) el.value = '';
  const root = document.getElementById('char-stats');
  if (root) root.innerHTML = '';
  window._charStats = {};
  _showCharPaste(true);
  localStorage.removeItem('stella_char_info');
}

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
