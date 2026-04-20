// ── 구역 페이지 ──────────────────────────────────────────────
// 스킨 API: crafthead.net/helm/{닉} (minotar 호환, 더 안정적)
//   helm = 얼굴 앞면 + 오버레이(모자) 레이어 포함
// fallback: mc-heads.net → 이니셜 텍스트 순서
// DB: stella_zone / { "r_c": { owner: "표시이름" } }

var _zoneData = {};
var ZONE_COLS = 20;
var ZONE_ROWS = 20;

var ZONE_PALETTE = [
  '#c8b4f8','#7dd3c0','#f6b76b','#f87171','#60a5fa',
  '#4ade80','#fb7185','#a78bfa','#34d399','#fbbf24',
  '#e879f9','#38bdf8','#a3e635','#f472b6','#94a3b8',
  '#818cf8','#f97316','#06b6d4','#84cc16','#ec4899',
];

// ── 스킨 URL 빌더 ────────────────────────────────────────────
function _skinUrl(mc) {
  // crafthead.net: minotar 호환, helm = 얼굴+오버레이, 더 안정적
  return 'https://crafthead.net/helm/' + encodeURIComponent(mc) + '/32';
}

function _onSkinError(img, mc) {
  // 1차 fallback: mc-heads.net
  img.onerror = null;
  img.src = 'https://mc-heads.net/avatar/' + encodeURIComponent(mc) + '/32';
  img.onerror = function() {
    // 2차 fallback: 이니셜 텍스트 박스 노출
    this.style.display = 'none';
    var fb = this.parentElement && this.parentElement.querySelector('.zn-cell-fb');
    if (fb) { fb.style.display = 'flex'; }
  };
}

function initZone() {
  if (isAdmin()) {
    var btn = document.getElementById('zn-reset-btn');
    if (btn) btn.style.display = '';
  }
  window.$db.on('stella_zone', function(val) {
    _zoneData = val || {};
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

function rebuildZone() {
  var map = document.getElementById('zn-map');
  if (!map) return;

  var colors = _buildColorMap();
  var html = '';

  for (var r = 0; r < ZONE_ROWS; r++) {
    for (var c = 0; c < ZONE_COLS; c++) {
      var key   = r + '_' + c;
      var owner = (_zoneData[key] && _zoneData[key].owner) ? _zoneData[key].owner : '';
      var color = owner ? (colors[owner] || '#888') : '';
      var mc    = owner ? _getMc(owner) : '';

      if (owner) {
        var shortName = owner.length > 5 ? owner.slice(0, 4) + '…' : owner;
        html += '<div class="zn-cell owned" style="--cc:' + color + ';" title="' + owner + '" onclick="onZoneClick(\'' + key + '\',\'' + owner + '\')">' +
          '<img class="zn-cell-avatar"' +
            ' src="' + _skinUrl(mc) + '"' +
            ' alt="' + owner + '"' +
            ' loading="lazy"' +
            ' onerror="_onSkinError(this,\'' + mc.replace(/'/g, "\\'") + '\')">' +
          '<span class="zn-cell-fb">' + owner.slice(0, 2) + '</span>' +
          '<span class="zn-cell-name">' + shortName + '</span>' +
        '</div>';
      } else {
        html += '<div class="zn-cell" title="빈 청크" onclick="onZoneClick(\'' + key + '\',\'\')"></div>';
      }
    }
  }
  map.innerHTML = html;

  // 통계
  var owned    = Object.values(_zoneData).filter(function(z) { return z && z.owner; }).length;
  var total    = ZONE_COLS * ZONE_ROWS;
  var pct      = Math.round(owned / total * 100);
  var ownerSet = new Set(Object.values(_zoneData).map(function(z) { return z && z.owner; }).filter(Boolean));

  var el = function(id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; };
  el('zn-owned-count', owned);
  el('zn-total-count', total);
  el('zn-pct-count',   pct + '%');
  el('zn-owner-count', ownerSet.size + '명');

  _buildLegend(colors);
}

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
      '<img class="zn-legend-avatar"' +
        ' src="' + _skinUrl(mc) + '"' +
        ' alt="' + name + '"' +
        ' onerror="this.style.display=\'none\'">' +
      '<div class="zn-legend-dot" style="background:' + color + ';box-shadow:0 0 5px ' + color + '88;"></div>' +
      '<span>' + name + '</span>' +
    '</div>';
  }).join('');
}

function highlightZone() {
  var q = ((document.getElementById('zn-search') || {}).value || '').toLowerCase().trim();
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

function onZoneClick(key, currentOwner) {
  if (!isAdmin()) return;
  var members = (window.members || []).map(function(m) { return m.name || m.mc; }).filter(Boolean);
  var modal   = document.createElement('div');
  modal.className = 'modal-bg';
  modal.onclick   = function(e) { if (e.target === modal) modal.remove(); };

  var nickCards = '<div class="zn-nick-card zn-nick-empty" data-nick="" onclick="selectZoneNick(this,\'\')">🚫 비우기</div>';
  members.forEach(function(name) {
    var mc  = _getMc(name);
    var sel = name === currentOwner;
    nickCards += '<div class="zn-nick-card' + (sel ? ' selected' : '') + '" data-nick="' + name + '" onclick="selectZoneNick(this,\'' + name + '\')">' +
      '<img class="zn-nick-avatar"' +
        ' src="' + _skinUrl(mc) + '"' +
        ' alt="' + name + '"' +
        ' onerror="this.style.display=\'none\'">' +
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
  var owner = (document.getElementById('zone-owner-sel') || {}).value || '';
  btn.textContent = '저장 중...'; btn.disabled = true;
  try {
    var updated = Object.assign({}, _zoneData);
    if (owner) {
      updated[key] = { owner: owner };
    } else {
      delete updated[key];
    }
    await firebase.database().ref('stella_zone').set(Object.keys(updated).length ? updated : {});
    btn.closest('.modal-bg').remove();
  } catch(e) {
    alert('저장 실패: ' + e.message);
    btn.textContent = '저장'; btn.disabled = false;
  }
}

async function resetZone() {
  if (!confirm('구역 데이터를 초기화하시겠습니까?')) return;
  try { await firebase.database().ref('stella_zone').set({}); }
  catch(e) { alert('실패: ' + e.message); }
}
