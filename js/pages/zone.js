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

  map.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  const members = window.members || [];
  const colors  = _buildColorMap(members);

  let html = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key   = `${r}_${c}`;
      const cell  = _zoneData[key];
      const owner = cell?.owner || '';
      const color = owner ? (colors[owner] || '#888') : '';
      const label = owner ? owner.slice(0, 3) : '';

      html += `<div class="zn-cell${owner ? ' owned' : ''}"
        style="${color ? `--cc:${color};` : ''}"
        title="${owner || ''}"
        onclick="onZoneClick('${key}','${owner}')">
        ${owner ? `<span class="zn-cell-label">${label}</span>` : ''}
      </div>`;
    }
  }
  map.innerHTML = html;

  // 통계
  const owned    = Object.values(_zoneData).filter(z => z?.owner).length;
  const total    = cols * rows;
  const pct      = total > 0 ? Math.round(owned / total * 100) : 0;
  const ownerSet = new Set(Object.values(_zoneData).map(z => z?.owner).filter(Boolean));

  const el = (id, txt) => { const e = document.getElementById(id); if (e) e.textContent = txt; };
  el('zn-owned-count', owned);
  el('zn-total-count', total);
  el('zn-pct-count',   pct + '%');
  el('zn-owner-count', ownerSet.size + '명');

  _buildLegend(colors);
}

function _buildColorMap(members) {
  const PALETTE = [
    '#c8b4f8','#7dd3c0','#f6b76b','#f87171','#60a5fa',
    '#4ade80','#fb7185','#a78bfa','#34d399','#fbbf24',
    '#e879f9','#38bdf8','#a3e635','#f472b6','#94a3b8',
  ];
  const map    = {};
  const owners = [...new Set(Object.values(_zoneData).map(z => z?.owner).filter(Boolean))];
  owners.forEach((o, i) => { map[o] = PALETTE[i % PALETTE.length]; });
  return map;
}

function _buildLegend(colors) {
  const wrap   = document.getElementById('zn-legend-wrap');
  const legend = document.getElementById('zn-legend');
  if (!legend || !wrap) return;
  const entries = Object.entries(colors);
  if (!entries.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  legend.innerHTML = entries.map(([name, color]) => `
    <div class="zn-legend-item">
      <div class="zn-legend-dot" style="background:${color};box-shadow:0 0 6px ${color}55;"></div>
      <span>${name}</span>
    </div>`).join('');
}

function highlightZone() {
  const q = (document.getElementById('zn-search')?.value || '').toLowerCase().trim();
  document.querySelectorAll('.zn-cell').forEach(cell => {
    const owner = (cell.title || '').toLowerCase();
    if (!q)                    { cell.classList.remove('dimmed'); return; }
    if (owner && owner.includes(q)) { cell.classList.remove('dimmed'); }
    else                            { cell.classList.add('dimmed'); }
  });
}

function onZoneClick(key, currentOwner) {
  if (!isAdmin()) return;
  const members = (window.members || []).map(m => m.mc || m.name).filter(Boolean);
  const modal   = document.createElement('div');
  modal.className = 'modal-bg';
  modal.onclick   = e => { if (e.target === modal) modal.remove(); };

  let nickCards = `<div class="zn-nick-card zn-nick-empty" data-nick="" onclick="selectZoneNick(this,'')">🚫 비우기</div>`;
  members.forEach(m => {
    const sel = m === currentOwner;
    nickCards += `<div class="zn-nick-card${sel ? ' selected' : ''}" data-nick="${m}" onclick="selectZoneNick(this,'${m}')">${m}</div>`;
  });

  modal.innerHTML =
    `<div class="modal" style="max-width:420px;">
      <div class="modal-title">구역 소유자 설정</div>
      <div class="modal-sub" style="margin-bottom:16px;">위치: ${key.replace('_', '행 ')}열</div>
      <div class="zn-nick-grid" id="zone-nick-grid">${nickCards}</div>
      <input type="hidden" id="zone-owner-sel" value="${currentOwner || ''}">
      <div class="modal-btns" style="margin-top:16px;">
        <button class="btn" onclick="this.closest('.modal-bg').remove()">취소</button>
        <button class="btn btn-primary" onclick="saveZoneCell('${key}',this)">저장</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function selectZoneNick(el, nick) {
  document.querySelectorAll('#zone-nick-grid .zn-nick-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const input = document.getElementById('zone-owner-sel');
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
