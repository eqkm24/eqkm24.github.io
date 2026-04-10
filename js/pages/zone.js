// ── 구역 페이지 ──────────────────────────────────────────────
// DB 구조: stella_zone / { zoneId: { name, desc, color, chunks, members: [...] } }

var _zoneData = {};

var ZONE_COLORS = [
  '#c8b4f8','#7dd3c0','#f6b76b','#f87171','#60a5fa',
  '#4ade80','#fb7185','#a78bfa','#34d399','#fbbf24',
  '#e879f9','#38bdf8','#a3e635','#f472b6','#94a3b8',
];

function initZone() {
  if (isAdmin()) {
    var addBtn = document.getElementById('zone-add-btn');
    if (addBtn) addBtn.style.display = '';
  }
  window.$db.on('stella_zone', function(val) {
    _zoneData = val || {};
    _renderZone();
  });
}

// ── 렌더 ─────────────────────────────────────────────────────
function _renderZone() {
  var grid  = document.getElementById('zone-card-grid');
  var empty = document.getElementById('zone-empty');
  var bar   = document.getElementById('zone-summary-bar');
  if (!grid) return;

  var q       = (document.getElementById('zone-search')?.value || '').toLowerCase().trim();
  var entries = Object.entries(_zoneData);

  var filtered = entries.filter(function(e) {
    var z = e[1];
    if (!q) return true;
    if ((z.name || '').toLowerCase().includes(q)) return true;
    if ((z.desc || '').toLowerCase().includes(q)) return true;
    if ((z.members || []).some(function(m) { return m.toLowerCase().includes(q); })) return true;
    return false;
  });

  // 요약 바
  var totalChunks = entries.reduce(function(s, e) { return s + (parseInt(e[1].chunks) || 0); }, 0);
  var allMembers  = new Set();
  entries.forEach(function(e) { (e[1].members || []).forEach(function(m) { allMembers.add(m); }); });

  var zsTotal   = document.getElementById('zs-total');
  var zsChunks  = document.getElementById('zs-chunks');
  var zsMembers = document.getElementById('zs-members');
  if (zsTotal)   zsTotal.textContent   = entries.length;
  if (zsChunks)  zsChunks.textContent  = totalChunks + '청크';
  if (zsMembers) zsMembers.textContent = allMembers.size + '명';
  if (bar) bar.style.display = entries.length ? 'flex' : 'none';

  if (!entries.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1;"><div class="empty-icon">🔍</div>검색 결과가 없어요.</div>';
    return;
  }

  grid.innerHTML = filtered.map(function(e) {
    return _zoneCardHtml(e[0], e[1]);
  }).join('');
}

function _zoneCardHtml(id, z) {
  var color   = z.color   || ZONE_COLORS[0];
  var name    = z.name    || '이름 없는 구역';
  var desc    = z.desc    || '';
  var chunks  = parseInt(z.chunks) || 0;
  var members = z.members || [];

  var memberHtml = members.length
    ? members.map(function(m) {
        return '<span class="zone-member-tag">' + m + '</span>';
      }).join('')
    : '<span style="font-size:12px;color:var(--muted);">소유자 없음</span>';

  var adminBtns = isAdmin()
    ? '<div class="zone-card-admin">' +
        '<button class="zone-admin-btn" onclick="openZoneEditModal(\'' + id + '\',event)" title="수정">✏️</button>' +
        '<button class="zone-admin-btn zone-admin-btn-danger" onclick="deleteZone(\'' + id + '\',event)" title="삭제">🗑</button>' +
      '</div>'
    : '';

  return '<div class="zone-card" style="--zc:' + color + ';" onclick="openZoneDetailModal(\'' + id + '\')">' +
    '<div class="zone-card-accent"></div>' +
    '<div class="zone-card-body">' +
      '<div class="zone-card-top">' +
        '<div style="min-width:0;">' +
          '<div class="zone-card-name">' + name + '</div>' +
          (desc ? '<div class="zone-card-desc">' + desc + '</div>' : '') +
        '</div>' +
        '<div class="zone-card-chunk-badge">' + chunks + '<span>청크</span></div>' +
      '</div>' +
      '<div class="zone-member-list">' + memberHtml + '</div>' +
    '</div>' +
    adminBtns +
  '</div>';
}

function filterZoneCards() { _renderZone(); }

// ── 상세 모달 ─────────────────────────────────────────────────
function openZoneDetailModal(id) {
  var z = _zoneData[id];
  if (!z) return;
  var color   = z.color   || ZONE_COLORS[0];
  var name    = z.name    || '이름 없는 구역';
  var desc    = z.desc    || '';
  var chunks  = parseInt(z.chunks) || 0;
  var members = z.members || [];

  var memberRows = members.length
    ? members.map(function(m) {
        return '<span class="zone-member-tag" style="font-size:13px;padding:6px 14px;">' + m + '</span>';
      }).join('')
    : '<span style="font-size:13px;color:var(--muted);">등록된 소유자가 없어요</span>';

  var modal = document.createElement('div');
  modal.className = 'modal-bg';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML =
    '<div class="modal" style="max-width:420px;padding-top:0;overflow:hidden;">' +
      '<div style="height:5px;background:' + color + ';margin:-1px -20px 20px;"></div>' +
      '<div class="modal-title">' + name + '</div>' +
      (desc ? '<div class="modal-sub" style="margin-bottom:16px;">' + desc + '</div>' : '<div style="margin-bottom:16px;"></div>') +
      '<div style="display:flex;gap:20px;margin-bottom:20px;">' +
        '<div class="zone-detail-stat"><span class="zone-detail-stat-val" style="color:' + color + ';">' + chunks + '</span><span class="zone-detail-stat-label">청크</span></div>' +
        '<div class="zone-detail-stat"><span class="zone-detail-stat-val" style="color:' + color + ';">' + members.length + '</span><span class="zone-detail-stat-label">소유자</span></div>' +
      '</div>' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--muted);text-transform:uppercase;margin-bottom:10px;">소유자 목록</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;min-height:32px;">' + memberRows + '</div>' +
      '<div class="modal-btns" style="margin-top:20px;">' +
        '<button class="btn" onclick="this.closest(\'.modal-bg\').remove()">닫기</button>' +
        (isAdmin() ? '<button class="btn btn-primary" onclick="this.closest(\'.modal-bg\').remove();openZoneEditModal(\'' + id + '\')">수정</button>' : '') +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

// ── 폼 모달 (추가/수정) ───────────────────────────────────────
function openZoneAddModal()       { _openZoneFormModal(null, null); }
function openZoneEditModal(id, e) { if (e) e.stopPropagation(); _openZoneFormModal(id, _zoneData[id]); }

function _openZoneFormModal(id, z) {
  var isEdit   = !!id;
  var mcNames  = (window.members || []).map(function(m) { return m.mc || m.name; }).filter(Boolean);
  var curColor   = (z && z.color)   || ZONE_COLORS[Math.floor(Math.random() * ZONE_COLORS.length)];
  var curName    = (z && z.name)    || '';
  var curDesc    = (z && z.desc)    || '';
  var curChunks  = (z && z.chunks != null) ? z.chunks : '';
  var curMembers = (z && z.members) || [];

  var colorDots = ZONE_COLORS.map(function(c) {
    return '<div class="zf-color-dot' + (c === curColor ? ' selected' : '') + '" style="background:' + c + ';" data-color="' + c + '" onclick="selectZoneColor(this)"></div>';
  }).join('');

  var memberChecks = mcNames.map(function(m) {
    var checked = curMembers.includes(m);
    return '<label class="zf-member-check' + (checked ? ' checked' : '') + '">' +
      '<input type="checkbox" value="' + m + '"' + (checked ? ' checked' : '') + ' onchange="this.closest(\'label\').classList.toggle(\'checked\',this.checked)"> ' + m +
    '</label>';
  }).join('');

  var modal = document.createElement('div');
  modal.className = 'modal-bg';
  modal.id = 'zone-form-modal';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML =
    '<div class="modal" style="max-width:460px;">' +
      '<div class="modal-title">' + (isEdit ? '구역 수정' : '구역 추가') + '</div>' +
      '<div class="zf-field">' +
        '<label class="zf-label">구역 이름</label>' +
        '<input class="input" id="zf-name" placeholder="예) 항구 구역" value="' + curName + '">' +
      '</div>' +
      '<div class="zf-field">' +
        '<label class="zf-label">설명 <span style="color:var(--muted);font-weight:400;">(선택)</span></label>' +
        '<input class="input" id="zf-desc" placeholder="예) 항구 주변 공용 구역" value="' + curDesc + '">' +
      '</div>' +
      '<div class="zf-field">' +
        '<label class="zf-label">청크 수</label>' +
        '<input class="input" id="zf-chunks" type="number" min="0" placeholder="0" value="' + curChunks + '" style="width:100px;">' +
      '</div>' +
      '<div class="zf-field">' +
        '<label class="zf-label">색상</label>' +
        '<div class="zf-color-palette">' + colorDots + '</div>' +
        '<input type="hidden" id="zf-color" value="' + curColor + '">' +
      '</div>' +
      (mcNames.length
        ? '<div class="zf-field"><label class="zf-label">소유자</label><div class="zf-member-grid">' + memberChecks + '</div></div>'
        : '') +
      '<div class="modal-btns" style="margin-top:20px;">' +
        '<button class="btn" onclick="document.getElementById(\'zone-form-modal\').remove()">취소</button>' +
        '<button class="btn btn-primary" onclick="saveZoneCard(\'' + (id || '') + '\',this)">' + (isEdit ? '저장' : '추가') + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function selectZoneColor(el) {
  document.querySelectorAll('.zf-color-dot').forEach(function(d) { d.classList.remove('selected'); });
  el.classList.add('selected');
  document.getElementById('zf-color').value = el.dataset.color;
}

async function saveZoneCard(id, btn) {
  var name    = (document.getElementById('zf-name')?.value || '').trim();
  var desc    = (document.getElementById('zf-desc')?.value || '').trim();
  var chunks  = parseInt(document.getElementById('zf-chunks')?.value) || 0;
  var color   = document.getElementById('zf-color')?.value || ZONE_COLORS[0];
  var members = Array.from(document.querySelectorAll('#zone-form-modal .zf-member-check input:checked'))
                  .map(function(cb) { return cb.value; });

  if (!name) { alert('구역 이름을 입력해주세요.'); return; }
  btn.textContent = '저장 중...'; btn.disabled = true;
  try {
    var zoneId = id || ('zone_' + Date.now());
    await firebase.database().ref('stella_zone/' + zoneId).set({ name, desc, chunks, color, members });
    document.getElementById('zone-form-modal')?.remove();
  } catch(e) {
    alert('저장 실패: ' + e.message);
    btn.textContent = id ? '저장' : '추가'; btn.disabled = false;
  }
}

async function deleteZone(id, e) {
  if (e) e.stopPropagation();
  var z = _zoneData[id];
  if (!confirm('"' + (z?.name || '구역') + '"을 삭제할까요?')) return;
  try { await firebase.database().ref('stella_zone/' + id).remove(); }
  catch(err) { alert('삭제 실패: ' + err.message); }
}
