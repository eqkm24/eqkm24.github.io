let _zoneData = {};

function initZone() {
  if (isAdmin()) {
    const btn = document.getElementById('zn-reset-btn');
    if (btn) btn.style.display = '';
  }
  window.$db.on('stella_zone', val => {
    _zoneData = val || {};
    rebuildZone();
  });
}

function rebuildZone() {
  const cols = parseInt(document.getElementById('zn-cols')?.value) || 16;
  const rows = parseInt(document.getElementById('zn-rows')?.value) || 16;
  const map  = document.getElementById('zn-map');
  if (!map) return;

  map.style.gridTemplateColumns = `repeat(${cols}, 36px)`;

  const members = window.members || [];
  const colors  = _buildColorMap(members);

  let html = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key   = `${r}_${c}`;
      const cell  = _zoneData[key];
      const owner = cell?.owner || '';
      const color = owner ? (colors[owner] || '#888') : '';
      const initials = owner ? owner.slice(0,2).toUpperCase() : '';
      html += `<div class="zone-cell${owner ? ' owned' : ''}"
        style="${color ? `background:${color};` : ''}"
        title="${owner || '빈 구역'}"
        onclick="onZoneClick('${key}','${owner}')">
        <span style="font-size:9px;${owner?'color:rgba(0,0,0,0.6);':''}">${initials}</span>
      </div>`;
    }
  }
  map.innerHTML = html;

  const stat  = document.getElementById('zn-stat');
  const owned = Object.values(_zoneData).filter(z => z?.owner).length;
  if (stat) stat.textContent = `${owned} / ${cols * rows} 청크 점유`;

  _buildLegend(colors);
}

function _buildColorMap(members) {
  const PALLETE = [
    '#c8b4f8','#7dd3c0','#f6b76b','#f87171','#60a5fa',
    '#4ade80','#fb7185','#a78bfa','#34d399','#fbbf24',
  ];
  const map = {};
  const owners = [...new Set(Object.values(_zoneData).map(z => z?.owner).filter(Boolean))];
  owners.forEach((o, i) => { map[o] = PALLETE[i % PALLETE.length]; });
  return map;
}

function _buildLegend(colors) {
  const legend = document.getElementById('zn-legend');
  if (!legend) return;
  const entries = Object.entries(colors);
  if (!entries.length) { legend.innerHTML = ''; return; }
  legend.innerHTML = entries.map(([name, color]) => `
    <div class="zone-legend-item">
      <div class="zone-legend-dot" style="background:${color};"></div>
      <span>${name}</span>
    </div>`).join('');
}

function highlightZone() {
  const q = document.getElementById('zn-search')?.value?.toLowerCase().trim();
  document.querySelectorAll('.zone-cell').forEach(cell => {
    const owner = cell.title?.toLowerCase();
    cell.style.opacity = (!q || owner?.includes(q)) ? '1' : '0.2';
  });
}

function onZoneClick(key, currentOwner) {
  if (!isAdmin()) return;
  var members = (window.members || []).map(function(m) { return m.mc || m.name; }).filter(Boolean);
  var modal   = document.createElement('div');
  modal.className = 'modal-bg';
  modal.onclick   = function(e) { if (e.target === modal) modal.remove(); };

  // 닉네임 카드 그리드
  var nickCards = '<div style="cursor:pointer;padding:7px 12px;border-radius:8px;border:2px solid var(--purple);' +
    'background:var(--purple-dim);color:var(--purple);font-size:12px;font-weight:700;text-align:center;" ' +
    'data-nick="" onclick="selectZoneNick(this,\'\')">🚫 빈 구역</div>';

  members.forEach(function(m) {
    var isSelected = m === currentOwner;
    nickCards += '<div style="cursor:pointer;padding:7px 12px;border-radius:8px;border:2px solid ' +
      (isSelected ? 'var(--purple)' : 'var(--b1)') + ';background:' +
      (isSelected ? 'var(--purple-dim)' : 'var(--bg-card)') + ';color:' +
      (isSelected ? 'var(--purple)' : 'var(--text)') + ';font-size:12px;font-weight:700;text-align:center;transition:all .15s;" ' +
      'data-nick="' + m + '" onclick="selectZoneNick(this,\'' + m + '\')">' + m + '</div>';
  });

  modal.innerHTML =
    '<div class="modal" style="max-width:400px;">' +
      '<div class="modal-title">구역 설정</div>' +
      '<div class="modal-sub" style="margin-bottom:14px;">셀 위치: ' + key.replace('_', '행 ') + '열</div>' +
      '<div style="max-height:280px;overflow-y:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:2px;" id="zone-nick-grid">' +
        nickCards +
      '</div>' +
      '<input type="hidden" id="zone-owner-sel" value="' + (currentOwner || '') + '">' +
      '<div class="modal-btns" style="margin-top:14px;">' +
        '<button class="btn" onclick="this.closest(\'.modal-bg\').remove()">취소</button>' +
        '<button class="btn btn-primary" onclick="saveZoneCell(\'' + key + '\',this)">저장</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
}

function selectZoneNick(el, nick) {
  // 선택 해제
  document.querySelectorAll('#zone-nick-grid [data-nick]').forEach(function(c) {
    c.style.border      = '2px solid var(--b1)';
    c.style.background  = 'var(--bg-card)';
    c.style.color       = 'var(--text)';
  });
  // 선택 표시
  el.style.border     = '2px solid var(--purple)';
  el.style.background = 'var(--purple-dim)';
  el.style.color      = 'var(--purple)';
  // hidden input에 값 저장
  var input = document.getElementById('zone-owner-sel');
  if (input) input.value = nick;
}

async function saveZoneCell(key, btn) {
  const owner = document.getElementById('zone-owner-sel')?.value || '';
  btn.textContent = '저장 중...'; btn.disabled = true;
  try {
    const updated = { ..._zoneData };
    if (owner) updated[key] = { owner };
    else delete updated[key];
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
