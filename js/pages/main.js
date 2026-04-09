function initMain() {
  _showPopupIfNeeded();
  _loadMainStats();
  _loadTop3();
  _loadNotes();
  _initVisitor();
  _restoreCharCard();
  // 저장된 스펙 있으면 카드 펼치기
  if (localStorage.getItem('stella_char_info')) {
    setTimeout(function() {
      var body = document.getElementById('char-card-body');
      var icon = document.getElementById('char-toggle-icon');
      if (body) { body.style.maxHeight = body.scrollHeight + 500 + 'px'; }
      if (icon) { icon.style.transform = 'rotate(180deg)'; }
    }, 100);
  }
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
  window.$db.on('stella_price_food', function(val) {
    var root = document.getElementById('main-top3');
    if (!root) return;

    if (!val || !val.items || !val.items.length) {
      root.innerHTML = '<div class="empty" style="padding:16px;">' +
        '<span style="font-size:20px;opacity:.4;">📊</span>' +
        '<span>시세 데이터가 없습니다</span></div>';
      return;
    }

    var items = val.items.slice(0, 3);
    var RANK_SVG = [
      '<svg viewBox="0 0 20 20" fill="none" style="width:18px;height:18px;"><circle cx="10" cy="10" r="8" fill="rgba(246,183,107,0.2)"/><path d="M10 6L11.2 9.2H14.6L11.9 11.2L12.9 14.4L10 12.4L7.1 14.4L8.1 11.2L5.4 9.2H8.8L10 6Z" fill="#f6b76b"/></svg>',
      '<svg viewBox="0 0 20 20" fill="none" style="width:18px;height:18px;"><circle cx="10" cy="10" r="8" fill="rgba(176,180,200,0.2)"/><path d="M10 6L11.2 9.2H14.6L11.9 11.2L12.9 14.4L10 12.4L7.1 14.4L8.1 11.2L5.4 9.2H8.8L10 6Z" fill="#b0b4c8"/></svg>',
      '<svg viewBox="0 0 20 20" fill="none" style="width:18px;height:18px;"><circle cx="10" cy="10" r="8" fill="rgba(205,127,50,0.2)"/><path d="M10 6L11.2 9.2H14.6L11.9 11.2L12.9 14.4L10 12.4L7.1 14.4L8.1 11.2L5.4 9.2H8.8L10 6Z" fill="#cd7f32"/></svg>',
    ];

    var html = '<div class="top3-list">';
    items.forEach(function(item, i) {
      var name  = item.name || '';
      var price = item.price || 0;
      var base  = item.base  || 0;
      var diff  = item.diff  || 0;
      var ratio = base ? ((diff / base) * 100) : null;
      var badge = '';
      if (ratio !== null) {
        var cls  = ratio >= 0 ? 'tag-green' : 'tag-red';
        var sign = ratio >= 0 ? '+' : '';
        badge = '<span class="tag ' + cls + '">' + sign + ratio.toFixed(1) + '%</span>';
      } else if (diff) {
        var cls2 = diff >= 0 ? 'tag-green' : 'tag-red';
        badge = '<span class="tag ' + cls2 + '">' + (diff >= 0 ? '+' : '') + diff + '</span>';
      }
      html +=
        '<div class="top3-row">' +
          '<div class="top3-rank">' + RANK_SVG[i] + '</div>' +
          '<div class="top3-info">' +
            '<div class="top3-name">' + name + '</div>' +
            '<div class="top3-price">' + price.toLocaleString() + ' 셀</div>' +
          '</div>' +
          badge +
        '</div>';
    });
    html += '</div>';
    root.innerHTML = html;
  });
}
function _loadNotes() {
  window.$db.on('stella_update_notes', function(val) {
    var root = document.getElementById('main-notes');
    if (!root) return;

    if (!val || !val.length) {
      root.innerHTML = '<div class="empty" style="padding:12px;font-size:12px;">등록된 노트가 없습니다</div>';
      return;
    }

    var sorted = val.slice().sort(function(a,b) { return new Date(b.date||0) - new Date(a.date||0); });
    root.innerHTML = sorted.map(function(n, i) {
      var d   = n.date ? new Date(n.date) : null;
      var dStr = d ? (d.getMonth()+1) + '. ' + d.getDate() + '.' : '';
      return '<div class="note-row" onclick="openNoteDetail(' + i + ')" style="cursor:pointer;">' +
        '<div class="note-title">' + (n.title || '(제목 없음)') + '</div>' +
        '<div class="note-date">' + dStr + '</div>' +
      '</div>';
    }).join('');

    window._notesData = sorted;
  });
}

function openNoteDetail(idx) {
  var notes = window._notesData;
  if (!notes || !notes[idx]) return;
  window._currentNoteIdx = idx;
  var n    = notes[idx];
  var d    = n.date ? new Date(n.date) : null;
  var dStr = d ? d.toLocaleDateString('ko-KR') : '';
  var popup   = document.getElementById('note-detail-popup');
  var body    = document.getElementById('note-detail-body');
  var titleEl = document.getElementById('note-detail-title');
  var adminEl = document.getElementById('note-admin-actions');
  if (!popup || !body) return;
  if (titleEl) titleEl.textContent = n.title || '업데이트 노트';
  if (adminEl) adminEl.style.display = isAdmin() ? 'flex' : 'none';
  body.innerHTML =
    '<div style="font-size:11px;color:var(--muted);margin-bottom:14px;">' + dStr + '</div>' +
    '<div style="white-space:pre-wrap;color:var(--sub);line-height:1.8;">' + (n.content||'') + '</div>';
  popup.style.display = 'flex';
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
  var root = document.getElementById('char-stats');
  if (!root) return;
  if (!text || !text.trim()) { root.innerHTML = ''; _showCharPaste(true); return; }

  // 타임스탬프 제거: "[10:28:37] " 형태
  text = text.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/gm, '');

  var lines   = text.split('\n');
  var section = '';
  var stats   = {};
  var profs   = {};
  var skills  = {};
  var tmpSkills = {};
  var fame = '', famePct = 0, statPts = '', skillPts = '';

  lines.forEach(function(raw) {
    var line = raw.trim();
    if (!line) return;

    // 섹션 헤더 — 이모지/특수문자 포함된 헤더도 처리
    if (line.includes('스탯 정보'))  { section = 'stat';     return; }
    if (line.includes('[숙련도]'))   { section = 'prof';     return; }
    if (line.includes('[스킬]'))     { section = 'skill';    return; }
    if (line.includes('[임시 스탯')) { section = 'skip';     return; }
    if (line.includes('[임시 스킬')) { section = 'tmpskill'; return; }
    if (section === 'skip') return;

    // 명성
    var fameM = line.match(/^명성\s*[:：]\s*(\d+)\s*\(.*?([\d.]+)%\)/);
    if (fameM) { fame = fameM[1]; famePct = parseFloat(fameM[2]); return; }

    var spM  = line.match(/^스탯\s*포인트\s*[:：]\s*(\d+)/);
    if (spM)  { statPts  = spM[1];  return; }
    var skpM = line.match(/^스킬\s*포인트\s*[:：]\s*(\d+)/);
    if (skpM) { skillPts = skpM[1]; return; }

    // 임시 스킬: "- 광맥 감각 (equip:HEAD) +1Lv"
    if (section === 'tmpskill') {
      var tm = line.match(/^[-ㆍ]\s*(.+?)\s*[\(\（].+[\)\）]\s*\+(\d+)Lv/);
      if (tm) {
        var sname = tm[1].trim().replace(/^[\uD800-\uDFFF\u4E00-\u9FFF\u3400-\u4DBF]+\s*/, '');
        var slv   = parseInt(tm[2]);
        tmpSkills[sname] = (tmpSkills[sname] || 0) + slv;
      }
      return;
    }

    if (!line.startsWith('ㆍ')) return;
    // ㆍ 뒤 특수문자/이모지 제거
    var body = line.slice(1).trim().replace(/^[\uD800-\uDFFF\u4E00-\u9FFF\u3400-\u4DBF]+\s*/, '');

    if (section === 'stat') {
      var m = body.match(/^(.+?)\s*\(.*?total\s*[:=]\s*([\d.]+)/);
      if (m) {
        var sname = m[1].trim();
        var val   = parseFloat(m[2]);
        // 중복 스탯 합산 (채광 데미지 증가 등)
        stats[sname] = (stats[sname] || 0) + val;
      }
    }

    if (section === 'prof') {
      var m2 = body.match(/^(.+?)\s*\(Lv\s*[:=]\s*(\d+)[^)]*,\s*([\d.]+)%/);
      if (m2) profs[m2[1].trim()] = { lv: parseInt(m2[2]), pct: parseFloat(m2[3]) };
      else {
        var m3 = body.match(/^(.+?)\s*\(Lv\s*[:=]\s*(\d+)/);
        if (m3) profs[m3[1].trim()] = { lv: parseInt(m3[2]), pct: 0 };
      }
    }

    if (section === 'skill') {
      var m4 = body.match(/^(.+?)\s*\(Lv\s*[:=]\s*(\d+)/);
      if (m4) skills[m4[1].trim()] = parseInt(m4[2]);
    }
  });

  window._charStats = Object.assign({}, stats);
  try { localStorage.setItem('stella_char_info', JSON.stringify({ text, stats, profs, skills, fame, famePct })); } catch(e) {}

  _showCharPaste(false);

  var fmt = function(v) {
    if (typeof v !== 'number') return v;
    return parseFloat(v.toFixed(2));
  };

  var BASE_STATS = ['행운','노련함','손재주','감각','인내력','카리스마'];
  var JOB_STATS  = ['요리 등급업 확률','음식 효과연장','조리 단축',
                    '일반 작물 감소비율','경작지당 화분통 설치 개수','경작지 점유 수',
                    '벌목 속도 증가','벌목 데미지 증가','채광 데미지 증가','채광 딜레이 감소',
                    '기본 광물 추가 개수','기본 광물 추가 드롭률','커스텀 광물 추가 드롭률',
                    '채광 갈증 감소','곡괭이 내구도 보호'];
  var usedKeys = BASE_STATS.concat(JOB_STATS);

  var baseEntries = BASE_STATS.map(function(k) { return stats[k] != null ? [k, stats[k]] : null; }).filter(Boolean);
  var jobEntries  = JOB_STATS.map(function(k)  { return stats[k] != null ? [k, stats[k]] : null; }).filter(Boolean);
  var etcEntries  = Object.entries(stats).filter(function(e) { return usedKeys.indexOf(e[0]) < 0 && e[1] > 0; });

  var profEntries = Object.entries(profs).filter(function(e) { return e[1].lv > 0; });
  var JOB_COLOR = {
    채광:'var(--amber)', 낚시:'var(--blue)', 농사:'var(--green)',
    요리:'var(--red)',   대장술:'var(--purple)', 생존:'var(--teal)',
    연금술:'var(--teal)', 벌목:'var(--green)'
  };

  // 임시 스킬 합산
  var mergedSkills = Object.assign({}, skills);
  Object.entries(tmpSkills).forEach(function(e) {
    var sname = e[0], lv = e[1];
    if (mergedSkills[sname] != null) {
      var base = typeof mergedSkills[sname] === 'number' ? mergedSkills[sname] : parseInt(mergedSkills[sname]);
      mergedSkills[sname] = String(base + lv) + ' <span style="font-size:10px;color:var(--teal);">(+' + lv + ' 임시)</span>';
    }
  });

  var sec = function(title, color, html) {
    if (!html) return '';
    return '<div style="margin-top:14px;">' +
      '<div style="font-size:10px;font-weight:700;letter-spacing:1.2px;color:' + color + ';text-transform:uppercase;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--b1);">' + title + '</div>' +
      html + '</div>';
  };

  var statGrid = function(entries) {
    if (!entries.length) return '';
    return '<div class="char-stats">' +
      entries.map(function(e) {
        return '<div class="char-stat-row">' +
          '<span class="char-stat-key">' + e[0] + '</span>' +
          '<span class="char-stat-val" style="color:var(--purple);font-size:13px;font-weight:900;">+' + fmt(e[1]) + '</span>' +
          '</div>';
      }).join('') + '</div>';
  };

  var profBars = profEntries.length ? profEntries.map(function(e) {
    var name = e[0], lv = e[1].lv, pct = e[1].pct;
    var color = JOB_COLOR[name] || 'var(--purple)';
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
      '<span style="font-size:12px;font-weight:700;color:var(--sub);width:52px;flex-shrink:0;">' + name + '</span>' +
      '<span style="font-size:11px;font-weight:700;color:' + color + ';width:36px;flex-shrink:0;">Lv.' + lv + '</span>' +
      '<div style="flex:1;height:5px;background:var(--b1);border-radius:3px;overflow:hidden;">' +
        '<div style="height:100%;border-radius:3px;background:' + color + ';width:' + pct + '%;transition:width .5s;"></div>' +
      '</div>' +
      '<span style="font-size:10px;color:var(--muted);width:38px;text-align:right;flex-shrink:0;">' + pct + '%</span>' +
      '</div>';
  }).join('') : '';

  var skillTags = Object.keys(mergedSkills).length ?
    '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
    Object.entries(mergedSkills).map(function(e) {
      return '<span class="tag tag-amber">' + e[0] + ' Lv.' + e[1] + '</span>';
    }).join('') + '</div>' : '';

  var fameHtml = fame ?
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">' +
    '<span style="font-size:12px;font-weight:700;color:var(--sub);">명성</span>' +
    '<span style="font-size:13px;font-weight:900;color:var(--purple);">Lv.' + fame + '</span>' +
    '<div style="flex:1;height:5px;background:var(--b1);border-radius:3px;overflow:hidden;">' +
      '<div style="height:100%;border-radius:3px;background:var(--purple);width:' + famePct + '%;"></div>' +
    '</div>' +
    '<span style="font-size:10px;color:var(--muted);">' + famePct + '%</span>' +
    '</div>' +
    (statPts !== '' ? '<div style="font-size:11px;color:var(--muted);">스탯 포인트 ' + statPts + ' · 스킬 포인트 ' + (skillPts||0) + '</div>' : '')
    : '';

  root.innerHTML =
    (fameHtml ? '<div style="margin-bottom:4px;">' + fameHtml + '</div>' : '') +
    sec('기본 스탯',  'var(--purple)', statGrid(baseEntries)) +
    sec('숙련도',     'var(--amber)',  profBars) +
    sec('직업 스탯',  'var(--teal)',   statGrid(jobEntries)) +
    (etcEntries.length ? sec('기타',  'var(--muted)', statGrid(etcEntries)) : '') +
    sec('보유 스킬',  'var(--green)',  skillTags);
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


function toggleCharCard() {
  var body = document.getElementById('char-card-body');
  var icon = document.getElementById('char-toggle-icon');
  if (!body) return;
  var isOpen = body.style.maxHeight !== '0px' && body.style.maxHeight !== '';
  if (isOpen) {
    body.style.maxHeight = '0';
    if (icon) { icon.style.transform = ''; }
  } else {
    body.style.maxHeight = body.scrollHeight + 'px';
    if (icon) { icon.style.transform = 'rotate(180deg)'; }
  }
}

function openNoteModal(existingNote, editIdx) {
  var m = document.createElement('div');
  m.className = 'modal-bg';
  m.onclick   = function(e) { if (e.target === m) m.remove(); };
  var titleVal   = existingNote ? (existingNote.title   || '') : '';
  var contentVal = existingNote ? (existingNote.content || '') : '';
  m.innerHTML =
    '<div class="modal" style="max-width:480px;">' +
      '<div class="modal-title">' + (existingNote ? '✏️ 노트 수정' : '📝 업데이트 노트 작성') + '</div>' +
      '<input class="input" id="note-title-inp" placeholder="제목 입력..." value="' + titleVal.replace(/"/g,'&quot;') + '" style="margin-bottom:10px;">' +
      '<textarea class="input" id="note-content-inp" rows="8" placeholder="내용 입력..." style="resize:vertical;">' + contentVal + '</textarea>' +
      '<div class="modal-btns">' +
        '<button class="btn" onclick="this.closest(\'.modal-bg\').remove()">취소</button>' +
        '<button class="btn btn-primary" onclick="saveNote(' + (editIdx != null ? editIdx : 'null') + ', this)">저장</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(m);
}

async function saveNote(editIdx, btn) {
  var titleEl   = document.getElementById('note-title-inp');
  var contentEl = document.getElementById('note-content-inp');
  var title   = titleEl?.value?.trim()   || '';
  var content = contentEl?.value?.trim() || '';
  if (!content) { alert('내용을 입력해주세요.'); return; }
  btn.disabled = true; btn.textContent = '저장 중...';
  var notes = (window._notesData || []).slice();
  var note  = { title: title, content: content, date: editIdx != null ? (notes[editIdx]?.date || new Date().toISOString()) : new Date().toISOString() };
  if (editIdx != null) { notes[editIdx] = note; }
  else { notes.unshift(note); }
  try {
    await firebase.database().ref('stella_update_notes').set(notes);
    btn.closest('.modal-bg').remove();
  } catch(e) {
    alert('저장 실패: ' + e.message);
    btn.disabled = false; btn.textContent = '저장';
  }
}


function editCurrentNote() {
  var notes = window._notesData;
  var idx   = window._currentNoteIdx;
  if (!notes || idx == null) return;
  var n = notes[idx];
  document.getElementById('note-detail-popup').style.display = 'none';
  openNoteModal(n, idx);
}

function deleteCurrentNote() {
  var notes = window._notesData;
  var idx   = window._currentNoteIdx;
  if (!notes || idx == null) return;
  if (!confirm('이 노트를 삭제할까요?')) return;
  var newNotes = notes.filter(function(_,i) { return i !== idx; });
  firebase.database().ref('stella_update_notes').set(newNotes).then(function() {
    document.getElementById('note-detail-popup').style.display = 'none';
    alert('삭제됐어요.');
  }).catch(function(e) { alert('삭제 실패: ' + e.message); });
}
