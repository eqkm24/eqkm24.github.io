/* ═══ 공지사항 / 패치노트 ═══ */

/* ── 실시간 구독 ── */
function _initNoticeSync() {
  if (!window._fbOn) { setTimeout(_initNoticeSync, 100); return; }
  window._fbOn('stella_notices', val => {
    window._noticeData = val ? (Array.isArray(val) ? val : Object.values(val)) : [];
    window._noticeData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderNotices();
    renderNoticeWidget(); // 메인화면 위젯도 갱신
  });
}
_initNoticeSync();

/* ── 공지 타입 정의 ── */
const NOTICE_TYPES = {
  notice:  { label: '공지',   color: '#88b8ff', bg: '#0e2030' },
  update:  { label: '업데이트', color: '#78d898', bg: '#0a2018' },
  event:   { label: '이벤트',  color: '#ffd070', bg: '#261800' },
  fix:     { label: '수정',   color: '#ffaa78', bg: '#281000' },
};

/* ── 전체 공지 페이지 렌더 ── */
function renderNotices() {
  const root = document.getElementById('notice-list');
  if (!root) return;

  const data = window._noticeData || [];
  const filterType = (document.getElementById('notice-filter') || {}).value || 'all';
  const filtered = filterType === 'all' ? data : data.filter(n => n.type === filterType);

  if (!filtered.length) {
    root.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--muted);font-size:13px;">
      ${filterType === 'all' ? '등록된 공지가 없습니다.' : '해당 유형의 공지가 없습니다.'}
    </div>`;
    return;
  }

  root.innerHTML = filtered.map((n, i) => {
    const t = NOTICE_TYPES[n.type] || NOTICE_TYPES.notice;
    const date = n.createdAt ? new Date(n.createdAt).toLocaleDateString('ko-KR', { year:'numeric', month:'short', day:'numeric' }) : '';
    const isNew = n.createdAt && (Date.now() - new Date(n.createdAt)) < 86400000 * 3;
    const realIdx = (window._noticeData || []).indexOf(n);
    return `
    <div class="notice-card" onclick="toggleNoticeExpand(this)">
      <div class="notice-card-hd">
        <span class="notice-type-badge" style="color:${t.color};background:${t.bg};border-color:${t.color}33;">${t.label}</span>
        ${isNew ? '<span class="notice-new-badge">NEW</span>' : ''}
        <span class="notice-title">${escHtml(n.title)}</span>
        <span class="notice-date">${date}</span>
        ${isAdmin() ? `
          <span class="notice-act" onclick="event.stopPropagation();openNoticeModal(${realIdx})" title="수정">✎</span>
          <span class="notice-act notice-act-del" onclick="event.stopPropagation();deleteNotice(${realIdx})" title="삭제">✕</span>
        ` : ''}
        <span class="notice-arrow">▼</span>
      </div>
      <div class="notice-body">${markdownLite(n.body || '')}</div>
    </div>`;
  }).join('');
}

/* ── 펼침/접힘 ── */
function toggleNoticeExpand(card) {
  const body = card.querySelector('.notice-body');
  const arrow = card.querySelector('.notice-arrow');
  const isOpen = card.classList.contains('nc-open');
  // 전체 닫기
  document.querySelectorAll('.notice-card.nc-open').forEach(c => {
    c.classList.remove('nc-open');
    c.querySelector('.notice-body').style.maxHeight = '0';
    c.querySelector('.notice-arrow').style.transform = '';
  });
  if (!isOpen) {
    card.classList.add('nc-open');
    body.style.maxHeight = body.scrollHeight + 'px';
    arrow.style.transform = 'rotate(180deg)';
  }
}

/* ── 메인화면 위젯 렌더 ── */
function renderNoticeWidget() {
  const root = document.getElementById('main-notice-widget');
  if (!root) return;
  const data = (window._noticeData || []).slice(0, 4); // 최신 4개
  if (!data.length) {
    root.innerHTML = `<div style="padding:20px;text-align:center;color:var(--muted);font-size:12px;">등록된 공지가 없습니다.</div>`;
    return;
  }
  root.innerHTML = data.map(n => {
    const t = NOTICE_TYPES[n.type] || NOTICE_TYPES.notice;
    const date = n.createdAt ? new Date(n.createdAt).toLocaleDateString('ko-KR', { month:'short', day:'numeric' }) : '';
    const isNew = n.createdAt && (Date.now() - new Date(n.createdAt)) < 86400000 * 3;
    return `
    <div class="nw-item" onclick="go('notice')">
      <span class="nw-badge" style="color:${t.color};background:${t.bg};border-color:${t.color}33;">${t.label}</span>
      ${isNew ? '<span class="notice-new-badge">N</span>' : ''}
      <span class="nw-title">${escHtml(n.title)}</span>
      <span class="nw-date">${date}</span>
    </div>`;
  }).join('');
}

/* ── 마크다운 라이트 파서 (굵게, 이탤릭, 코드, 링크, 줄바꿈) ── */
function markdownLite(str) {
  return str
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:var(--s3);padding:1px 5px;border-radius:4px;font-family:\'JetBrains Mono\',monospace;font-size:.9em;">$1</code>')
    .replace(/\n/g, '<br>');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── 공지 등록/수정 모달 ── */
function openNoticeModal(editIdx) {
  if (!isAdmin()) { alert('관리자 권한이 필요합니다.'); return; }
  const isEdit = editIdx !== undefined;
  const n = isEdit ? (window._noticeData || [])[editIdx] : null;

  const typeOptions = Object.entries(NOTICE_TYPES).map(([k, v]) =>
    `<option value="${k}" ${n && n.type === k ? 'selected' : ''}>${v.label}</option>`
  ).join('');

  document.getElementById('adm-modal-root').insertAdjacentHTML('beforeend', `
    <div class="mb-modal-bg" id="notice-modal-bg" onclick="if(event.target.id==='notice-modal-bg')this.remove()">
      <div class="mb-modal" style="max-width:520px;">
        <h3>${isEdit ? '📝 공지 수정' : '📣 공지 등록'}</h3>
        <label>유형</label>
        <select id="nm-type">${typeOptions}</select>
        <label>제목</label>
        <input id="nm-title" placeholder="공지 제목" value="${n ? escHtml(n.title) : ''}">
        <label>내용 <span style="font-size:10px;color:var(--muted);font-weight:400;">**굵게** *이탤릭* \`코드\` 지원</span></label>
        <textarea id="nm-body" placeholder="공지 내용을 입력하세요..."
          style="width:100%;min-height:140px;resize:vertical;padding:10px 12px;
          border:1px solid var(--b2);border-radius:8px;background:var(--s2);
          color:var(--text);font-size:13px;font-family:'Noto Sans KR',sans-serif;
          outline:none;box-sizing:border-box;line-height:1.6;">${n ? escHtml(n.body || '') : ''}</textarea>
        <div class="mb-modal-btns">
          <button class="mb-btn" onclick="document.getElementById('notice-modal-bg').remove()">취소</button>
          <button class="mb-btn mb-btn-add" onclick="saveNotice(${isEdit ? editIdx : 'undefined'})">${isEdit ? '저장' : '등록'}</button>
        </div>
      </div>
    </div>`);
}

async function saveNotice(editIdx) {
  const title = (document.getElementById('nm-title').value || '').trim();
  const body  = (document.getElementById('nm-body').value || '').trim();
  const type  = document.getElementById('nm-type').value;
  if (!title) { alert('제목을 입력해주세요.'); return; }

  const data = window._noticeData ? [...window._noticeData] : [];
  if (editIdx !== undefined) {
    data[editIdx] = { ...data[editIdx], title, body, type };
  } else {
    data.unshift({ title, body, type, createdAt: new Date().toISOString() });
  }
  await window._fbSet('stella_notices', data);
  document.getElementById('notice-modal-bg').remove();
}

async function deleteNotice(idx) {
  if (!confirm('공지를 삭제하시겠습니까?')) return;
  const data = [...(window._noticeData || [])];
  data.splice(idx, 1);
  await window._fbSet('stella_notices', data.length ? data : []);
}
