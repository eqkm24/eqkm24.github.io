// ── 구역 페이지 ──────────────────────────────────────────────
// 셀 디자인: 소유자별 고유 색상 + 이니셜 원형 아바타
// DB: stella_zone
//   _bounds   : { r1, c1, r2, c2 }  마을 전체 영역 경계
//   _acquired : { "r_c": true }      확보(구매)된 청크
//   "r_c"     : { owner: "이름" }    소유자 배정된 청크

var _zoneData = {};
var _bounds   = null;   // { r1, c1, r2, c2 }
var _acquired = {};     // { "r_c": true }

var ZONE_PALETTE = [
  '#c8b4f8','#7dd3c0','#f6b76b','#f87171','#60a5fa',
  '#4ade80','#fb7185','#a78bfa','#34d399','#fbbf24',
  '#e879f9','#38bdf8','#a3e635','#f472b6','#94a3b8',
  '#818cf8','#f97316','#06b6d4','#84cc16','#ec4899',
];

// ── 이니셜 추출 ─────────────────────────────────────────────
function _getInitials(name) {
  var clean = name.replace(/[^가-힣a-zA-Z0-9]/g, '');
  return clean.slice(0, 2).toUpperCase() || '?';
}

function initZone() {
  if (isAdmin()) {
    var btn = document.getElementById('zn-reset-btn');
    if (btn) btn.style.display = '';
    var bBtn = document.getElementById('zn-bounds-btn');
    if (bBtn) bBtn.style.display = '';
  }
  window.$db.on('stella_zone', function(val) {
    _zoneData  = val || {};
    _bounds    = _zoneData._bounds   || null;
    _acquired  = _zoneData._acquired || {};
    rebuildZone();
  });
}

// name → mc 닉네임
function _getMc(ownerName) {
  var found = (window.members || []).find(function(m) {
    return m.name === ownerName || m.mc === ownerName;
  });
  return (found && found.mc) ? found.mc : ownerName;
}

// name → 색상 맵
function _buildColorMap() {
  var owners = Object.values(_zoneData)
    .filter(function(z) { return z && z.owner; })
    .map(function(z) { return z.owner; });
  var unique = owners.filter(function(v, i, a) { return a.indexOf(v) === i; });
  var map = {};
  unique.forEach(function(o, i) { map[o] = ZONE_PALETTE[i % ZONE_PALETTE.length]; });
  return map;
}

// ── 그리드 렌더 ──────────────────────────────────────────────
function rebuildZone() {
  var map = document.getElementById('zn-map');
  if (!map) return;

  var colors = _buildColorMap();

  // 경계 결정: _bounds 없으면 소유 데이터 범위 + 여백으로 자동 계산
  var r1, r2, c1, c2;
  if (_bounds && typeof _bounds.r1 === 'number') {
    r1 = _bounds.r1; r2 = _bounds.r2;
    c1 = _bounds.c1; c2 = _bounds.c2;
  } else {
    // 자동: 소유/확보 데이터 범위 + 여백 1칸
    var keys = Object.keys(_zoneData).filter(function(k) {
      return !k.startsWith('_');
    });
    var acqKeys = Object.keys(_acquired);
    var allKeys = keys.concat(acqKeys);
    if (!allKeys.length) { map.innerHTML = '<div style="padding:40px;color:var(--muted);text-align:center;">경계를 설정해주세요.</div>'; return; }
    var rows = allKeys.map(function(k) { return parseInt(k.split('_')[0]); });
    var cols = allKeys.map(function(k) { return parseInt(k.split('_')[1]); });
    r1 = Math.max(0, Math.min.apply(null, rows) - 1);
    r2 = Math.min(99, Math.max.apply(null, rows) + 1);
    c1 = Math.max(0, Math.min.apply(null, cols) - 1);
    c2 = Math.min(99, Math.max.apply(null, cols) + 1);
  }

  var numRows = r2 - r1 + 1;
  var numCols = c2 - c1 + 1;
  map.style.gridTemplateColumns = 'repeat(' + numCols + ', var(--zn-cell-size, 60px))';

  var html = '';
  for (var r = r1; r <= r2; r++) {
    for (var c = c1; c <= c2; c++) {
      var key      = r + '_' + c;
      var cellData = _zoneData[key];
      var owner    = cellData ? cellData.owner : '';
      var isAcq    = !!(_acquired[key]);
      var color    = owner ? (colors[owner] || '#888') : '';

      if (owner) {
        // ① 배정됨: 이니셜 아바타 + 이름
        var shortName = owner.length > 6 ? owner.slice(0, 5) + '…' : owner;
        html += '<div class="zn-cell zn-cell--owned" style="--cc:' + color + ';" title="' + owner + '" onclick="onZoneClick(\'' + key + '\',\'' + owner + '\')">' +
          '<div class="zn-cell-initial">' + _getInitials(owner) + '</div>' +
          '<span class="zn-cell-name">' + shortName + '</span>' +
        '</div>';
      } else if (isAcq) {
        // ② 확보됨·미배정: 빈 활성 셀 (밝게)
        html += '<div class="zn-cell zn-cell--vacant" title="미배정 청크" onclick="onZoneClick(\'' + key + '\',\')"></div>';
      } else {
        // ③ 미확보: 잠금 비활성 셀 (어둡게)
        html += '<div class="zn-cell zn-cell--locked" title="미확보 청크"' +
          (isAdmin() ? ' onclick="onAcquireToggle(\'' + key + '\')"' : '') +
          '></div>';
      }
    }
  }
  map.innerHTML = html;

  // 통계 업데이트
  var totalCells = numRows * numCols;
  var acqCount   = Object.keys(_acquired).filter(function(k) {
    var r = parseInt(k.split('_')[0]), co = parseInt(k.split('_')[1]);
    return r >= r1 && r <= r2 && co >= c1 && co <= c2;
  }).length;
  var ownedCount = Object.keys(_zoneData).filter(function(k) {
    if (k.startsWith('_')) return false;
    var row = parseInt(k.split('_')[0]), col = parseInt(k.split('_')[1]);
    return row >= r1 && row <= r2 && col >= c1 && col <= c2 && _zoneData[k].owner;
  }).length;

  var pct = acqCount > 0 ? Math.round(ownedCount / acqCount * 100) : 0;
  var ownerSet = new Set(Object.values(_zoneData)
    .filter(function(z) { return z && z.owner; })
    .map(function(z) { return z.owner; }));

  var el = function(id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; };
  el('zn-owned-count',  ownedCount);
  el('zn-acq-count',   acqCount);
  el('zn-total-count', totalCells);
  el('zn-pct-count',   pct + '%');
  el('zn-owner-count', ownerSet.size + '명');

  _buildLegend(colors);
}

// ── 범례 ─────────────────────────────────────────────────────
function _buildLegend(colors) {
  var wrap   = document.getElementById('zn-legend-wrap');
  var legend = document.getElementById('zn-legend');
  if (!legend || !wrap) return;
  var entries = Object.entries(colors);
  if (!entries.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  legend.innerHTML = entries.map(function(entry) {
    var name = entry[0], color = entry[1];
    var mc   = _getMc(name);
    return '<div class="zn-legend-item" onclick="highlightOwner(\'' + name + '\')" title="' + name + ' 하이라이트">' +
      '<div class="zn-legend-initial" style="background:' + color + ';">' + _getInitials(name) + '</div>' +
      '<div class="zn-legend-dot" style="background:' + color + ';box-shadow:0 0 5px ' + color + '88;"></div>' +
      '<span>' + name + '</span>' +
    '</div>';
  }).join('');
}

// ── 검색 / 하이라이트 ────────────────────────────────────────
function highlightZone() {
  var q = (document.getElementById('zn-search') ? document.getElementById('zn-search').value : '').toLowerCase().trim();
  document.querySelectorAll('.zn-cell').forEach(function(cell) {
    var owner = (cell.title || '').toLowerCase();
    if (!q) { cell.classList.remove('dimmed'); return; }
    cell.classList.toggle('dimmed', !(owner && owner.includes(q)));
  });
}
function highlightOwner(name) {
  var inp = document.getElementById('zn-search');
  if (!inp) return;
  if (inp.value === name) { inp.value = ''; } else { inp.value = name; }
  highlightZone();
}

// ── 확보 토글 (관리자) ───────────────────────────────────────
async function onAcquireToggle(key) {
  if (!isAdmin()) return;
  try {
    var updated = Object.assign({}, _acquired);
    if (updated[key]) {
      delete updated[key];
    } else {
      updated[key] = true;
    }
    await firebase.database().ref('stella_zone/_acquired').set(
      Object.keys(updated).length ? updated : {}
    );
  } catch(e) { alert('확보 설정 실패: ' + e.message); }
}

// ── 경계 설정 (관리자) ───────────────────────────────────────
function openBoundsModal() {
  if (!isAdmin()) return;
  var cur = _bounds || {};
  var modal = document.createElement('div');
  modal.className = 'modal-bg';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML =
    '<div class="modal" style="max-width:360px;">' +
      '<div class="modal-title">마을 구역 경계 설정</div>' +
      '<div class="modal-sub" style="margin-bottom:16px;">청크 좌표로 마을 전체 영역을 지정합니다.</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
        '<div><label style="font-size:11px;color:var(--muted);">시작 행 (r1)</label>' +
          '<input class="input" id="bnd-r1" type="number" value="' + (cur.r1 !== undefined ? cur.r1 : '') + '" placeholder="예: 3"></div>' +
        '<div><label style="font-size:11px;color:var(--muted);">끝 행 (r2)</label>' +
          '<input class="input" id="bnd-r2" type="number" value="' + (cur.r2 !== undefined ? cur.r2 : '') + '" placeholder="예: 14"></div>' +
        '<div><label style="font-size:11px;color:var(--muted);">시작 열 (c1)</label>' +
          '<input class="input" id="bnd-c1" type="number" value="' + (cur.c1 !== undefined ? cur.c1 : '') + '" placeholder="예: 6"></div>' +
        '<div><label style="font-size:11px;color:var(--muted);">끝 열 (c2)</label>' +
          '<input class="input" id="bnd-c2" type="number" value="' + (cur.c2 !== undefined ? cur.c2 : '') + '" placeholder="예: 17"></div>' +
      '</div>' +
      '<div class="modal-btns">' +
        '<button class="btn" onclick="this.closest(\'.modal-bg\').remove()">취소</button>' +
        '<button class="btn btn-primary" onclick="saveBounds(this)">저장</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

async function saveBounds(btn) {
  var r1 = parseInt(document.getElementById('bnd-r1').value);
  var r2 = parseInt(document.getElementById('bnd-r2').value);
  var c1 = parseInt(document.getElementById('bnd-c1').value);
  var c2 = parseInt(document.getElementById('bnd-c2').value);
  if ([r1,r2,c1,c2].some(isNaN) || r1 > r2 || c1 > c2) {
    alert('올바른 범위를 입력해주세요.'); return;
  }
  btn.textContent = '저장 중...'; btn.disabled = true;
  try {
    await firebase.database().ref('stella_zone/_bounds').set({ r1, r2, c1, c2 });
    btn.closest('.modal-bg').remove();
  } catch(e) {
    alert('저장 실패: ' + e.message);
    btn.textContent = '저장'; btn.disabled = false;
  }
}

// ── 소유자 배정 (관리자 클릭) ────────────────────────────────
function onZoneClick(key, currentOwner) {
  if (!isAdmin()) return;
  // 미확보 셀은 클릭 무시 (onAcquireToggle로 처리)
  if (!_acquired[key] && !_zoneData[key]) return;

  var members = (window.members || []).map(function(m) { return m.name || m.mc; }).filter(Boolean);
  var colors  = _buildColorMap();
  var modal   = document.createElement('div');
  modal.className = 'modal-bg';
  modal.onclick   = function(e) { if (e.target === modal) modal.remove(); };

  var nickCards = '<div class="zn-nick-card zn-nick-empty" data-nick="" onclick="selectZoneNick(this,\'\')">🚫 비우기</div>';
  members.forEach(function(name) {
    var mc     = _getMc(name);
    var sel    = name === currentOwner;
    var color  = colors[name] || '#888';
    nickCards += '<div class="zn-nick-card' + (sel ? ' selected' : '') + '" data-nick="' + name + '" onclick="selectZoneNick(this,\'' + name + '\')">' +
      '<div class="zn-nick-initial" style="background:' + color + ';">' + _getInitials(name) + '</div>' +
      '<span>' + name + '</span>' +
    '</div>';
  });

  modal.innerHTML =
    '<div class="modal" style="max-width:440px;">' +
      '<div class="modal-title">구역 소유자 설정</div>' +
      '<div class="modal-sub" style="margin-bottom:16px;">위치: ' + key.replace('_', '행 ') + '열</div>' +
      '<div class="zn-nick-grid" id="zone-nick-grid">' + nickCards + '</div>' +
      '<input type="hidden" id="zone-owner-sel" value="' + (currentOwner || '') + '">' +
      '<div class="modal-btns" style="margin-top:16px;">' +
        '<button class="btn" onclick="this.closest(\'.modal-bg\').remove()">취소</button>' +
        '<button class="btn btn-primary" onclick="saveZoneCell(\'' + key + '\',this)">저장</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function selectZoneNick(el, nick) {
  document.querySelectorAll('#zone-nick-grid .zn-nick-card').forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
  var input = document.getElementById('zone-owner-sel');
  if (input) input.value = nick;
}

async function saveZoneCell(key, btn) {
  var owner = document.getElementById('zone-owner-sel') ? document.getElementById('zone-owner-sel').value : '';
  btn.textContent = '저장 중...'; btn.disabled = true;
  try {
    if (owner) {
      await firebase.database().ref('stella_zone/' + key).set({ owner: owner });
    } else {
      await firebase.database().ref('stella_zone/' + key).remove();
    }
    btn.closest('.modal-bg').remove();
  } catch(e) {
    alert('저장 실패: ' + e.message);
    btn.textContent = '저장'; btn.disabled = false;
  }
}

async function resetZone() {
  if (!confirm('구역 데이터를 초기화하시겠습니까? (_bounds, _acquired는 유지됩니다)')) return;
  try {
    // 소유자 배정만 초기화, 경계/확보 유지
    var keep = {};
    if (_bounds)   keep._bounds   = _bounds;
    if (Object.keys(_acquired).length) keep._acquired = _acquired;
    await firebase.database().ref('stella_zone').set(Object.keys(keep).length ? keep : {});
  } catch(e) { alert('실패: ' + e.message); }
}
