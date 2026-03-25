/* ═══ 통합 검색 ═══ */

let _searchOpen = false;

/* ── 검색창 열기/닫기 ── */
function openGlobalSearch() {
  _searchOpen = true;
  const overlay = document.getElementById('gs-overlay');
  const input   = document.getElementById('gs-input');
  if (!overlay) return;
  overlay.classList.add('gs-visible');
  setTimeout(() => input && input.focus(), 60);
}

function closeGlobalSearch() {
  _searchOpen = false;
  const overlay = document.getElementById('gs-overlay');
  if (overlay) overlay.classList.remove('gs-visible');
  const input = document.getElementById('gs-input');
  if (input) input.value = '';
  const results = document.getElementById('gs-results');
  if (results) results.innerHTML = '';
}

/* ── 단축키 Ctrl+K / Cmd+K ── */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    _searchOpen ? closeGlobalSearch() : openGlobalSearch();
  }
  if (e.key === 'Escape' && _searchOpen) closeGlobalSearch();
});

/* ── 검색 인덱스 빌드 ── */
function buildSearchIndex() {
  const idx = [];

  /* 마을원 */
  (window.members || []).forEach(m => {
    idx.push({
      cat: '마을원', icon: '👥',
      title: m.name,
      sub: (m.mc || '') + (m.jobs ? ' · ' + m.jobs.join(' · ') : ''),
      action: () => { go('member'); }
    });
  });

  /* 제작 레시피 — RECIPE_DB가 있으면 */
  if (window.RECIPE_DB) {
    Object.values(window.RECIPE_DB).forEach(cat => {
      (cat.items || []).forEach(item => {
        idx.push({
          cat: '제작', icon: '🛠',
          title: item.name,
          sub: item.ingredients ? item.ingredients.map(r => r.name).join(', ') : '',
          action: () => { go('recipe'); }
        });
      });
    });
  }

  /* 스킬 — SKILL_DB */
  if (window.SKILL_DB) {
    Object.entries(window.SKILL_DB).forEach(([name, s]) => {
      idx.push({
        cat: '스킬', icon: '⚡',
        title: name,
        sub: (s.type || '') + ' · ' + (s.desc || '').slice(0, 60),
        action: () => { go('skill'); }
      });
    });
  }

  /* 시세 아이템 */
  if (window.PT) {
    Object.values(window.PT).forEach(pt => {
      (pt.data || []).forEach(item => {
        idx.push({
          cat: '시세', icon: '📊',
          title: item.name || item.n || '',
          sub: item.price ? item.price + ' 셀' : '',
          action: () => { go('price'); }
        });
      });
    });
  }

  /* 공지사항 */
  (window._noticeData || []).forEach(n => {
    const NOTICE_TYPES_L = { notice:'공지', update:'업데이트', event:'이벤트', fix:'수정' };
    idx.push({
      cat: '공지', icon: '📣',
      title: n.title,
      sub: (NOTICE_TYPES_L[n.type] || '') + (n.createdAt ? ' · ' + new Date(n.createdAt).toLocaleDateString('ko-KR', { month:'short', day:'numeric' }) : ''),
      action: () => { go('notice'); }
    });
  });

  /* 조공 멤버 */
  if (window.tribute) {
    Object.keys(window.tribute).forEach(name => {
      idx.push({
        cat: '조공', icon: '⭐',
        title: name,
        sub: (window.tribute[name] || 0).toLocaleString() + 'P',
        action: () => { go('tribute'); }
      });
    });
  }

  return idx;
}

/* ── 검색 실행 ── */
function runSearch() {
  const q = (document.getElementById('gs-input').value || '').trim().toLowerCase();
  const results = document.getElementById('gs-results');
  if (!results) return;

  if (!q) { results.innerHTML = _renderSearchEmpty(); return; }

  const idx = buildSearchIndex();
  const hits = idx.filter(item =>
    (item.title || '').toLowerCase().includes(q) ||
    (item.sub  || '').toLowerCase().includes(q)
  ).slice(0, 24);

  if (!hits.length) {
    results.innerHTML = `<div class="gs-no-result">
      <div style="font-size:28px;margin-bottom:8px;">🔍</div>
      <div style="font-size:13px;color:var(--muted);">"${escSearch(q)}"에 대한 결과가 없습니다.</div>
    </div>`;
    return;
  }

  // 카테고리 그룹핑
  const groups = {};
  hits.forEach(h => { (groups[h.cat] = groups[h.cat] || []).push(h); });

  results.innerHTML = Object.entries(groups).map(([cat, items]) => `
    <div class="gs-group">
      <div class="gs-group-label">${items[0].icon} ${cat}</div>
      ${items.map((item, i) => `
        <div class="gs-item" onclick="handleSearchHit(${JSON.stringify(item.title).replace(/"/g,'&quot;')}, '${cat}')">
          <div class="gs-item-title">${highlight(item.title, q)}</div>
          ${item.sub ? `<div class="gs-item-sub">${highlight(item.sub, q)}</div>` : ''}
        </div>`).join('')}
    </div>`).join('');

  // 클릭 핸들러 등록
  results.querySelectorAll('.gs-item').forEach((el, i) => {
    el.__searchHit = hits[i];
    el.addEventListener('click', () => { hits[i].action(); closeGlobalSearch(); });
  });
}

function _renderSearchEmpty() {
  return `<div class="gs-hint">
    <div class="gs-hint-row"><span class="gs-hint-key">마을원 이름</span><span class="gs-hint-desc">마을원 명단에서 검색</span></div>
    <div class="gs-hint-row"><span class="gs-hint-key">아이템 이름</span><span class="gs-hint-desc">제작 레시피 · 시세 검색</span></div>
    <div class="gs-hint-row"><span class="gs-hint-key">스킬 이름</span><span class="gs-hint-desc">생활 스킬 검색</span></div>
    <div class="gs-hint-row"><span class="gs-hint-key">공지 제목</span><span class="gs-hint-desc">공지사항 · 패치노트 검색</span></div>
    <div style="margin-top:14px;font-size:10px;color:var(--muted);text-align:center;">Ctrl+K 또는 Cmd+K로 언제든지 열 수 있어요</div>
  </div>`;
}

function highlight(text, q) {
  if (!q || !text) return escSearch(text);
  const escaped = escSearch(text);
  const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi');
  return escaped.replace(re, '<mark class="gs-hl">$1</mark>');
}

function escSearch(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function handleSearchHit(title, cat) {
  // action은 이미 addEventListener로 등록됨 — 이 함수는 fallback
}
