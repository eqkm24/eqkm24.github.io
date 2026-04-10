// ── 구역 페이지 ──────────────────────────────────────────────
// 스킨 이미지: minotar.net (mc 닉네임 기반)
// DB 구조: stella_zone / { "r_c": { owner: "표시이름" } }

let _zoneData = {};
const ZONE_COLS = 20;
const ZONE_ROWS = 20;

const ZONE_PALETTE = [
  '#c8b4f8','#7dd3c0','#f6b76b','#f87171','#60a5fa',
  '#4ade80','#fb7185','#a78bfa','#34d399','#fbbf24',
  '#e879f9','#38bdf8','#a3e635','#f472b6','#94a3b8',
];

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

// name → mc 닉네임 변환 헬퍼
function _getMc(ownerName) {
  const found = (window.members || []).find(m => (m.name === ownerName) || (m.mc === ownerName));
  return found?.mc || ownerName;
}

// name → 색상 맵
function _buildColorMap() {
  const owners = [...new Set(Object.values(_zoneData).map(z => z?.owner).filter(Boolean))];
  const map = {};
  owners.forEach((o, i) => { map[o] = ZONE_PALETTE[i % ZONE_PALETTE.length]; });
  return map;
}

function rebuildZone() {
  const map = document.getElementById('zn-map');
  if (!map) return;

  const colors = _buildColorMap();

  let html = '';
  for (let r = 0; r < ZONE_ROWS; r++) {
    for (let c = 0; c < ZONE_COLS; c++) {
      const key   = `${r}_${c}`;
      const owner = _zoneData[key]?.owner || '';
      const color = owner ? (colors[owner] || '#888') : '';
      const mc    = owner ? _getMc(owner) : '';

      if (owner) {
        // 스킨 얼굴 이미지 + fallback 텍스트
        html += `<div class="zn-cell owned" style="--cc:${color};" title="${owner}" onclick="onZoneClick('${key}','${owner}')">
          <img class="zn-cell-avatar"
            src="https://minotar.net/avatar/${encodeURIComponent(mc)}/32"
            alt="${owner}"
            loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <span class="zn-cell-fb">${owner.slice(0,3)}</span>
        </div>`;
      } else {
        html += `<div class="zn-cell" onclick="onZoneClick('${key}','')"></div>`;
      }
    }
  }
  map.innerHTML = html;

  // 통계
  const owned    = Object.values(_zoneData).filter(z => z?.owner).length;
  const total    = ZONE_COLS * ZONE_ROWS;
  const pct      = Math.round(owned / total * 100);
  const ownerSet = new Set(Object.values(_zoneData).map(z => z?.owner).filter(Boolean));

  const el = (id, txt) => { const e = document.getElementById(id); if (e) e.textContent = txt; };
  el('zn-owned-count', owned);
  el('zn-total-count', total);
  el('zn-pct-count',   pct + '%');
  el('zn-owner-count', ownerSet.size + '명');

  _buildLegend(colors);
}

function _buildLegend(colors) {
  const wrap   = document.getElementById('zn-legend-wrap');
  const legend = document.getElementById('zn-legend');
  if (!legend || !wrap) return;
  const entries = Object.entries(colors);
  if (!entries.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  legend.innerHTML = entries.map(([name, color]) => {
    const mc = _getMc(name);
    return `<div class="zn-legend-item" onclick="highlightOwner('${name}')" title="${name} 하이라이트">
      <img class="zn-legend-avatar"
        src="https://minotar.net/avatar/${encodeURIComponent(mc)}/32"
        alt="${name}"
        onerror="this.style.display='none'">
      <div class="zn-legend-dot" style="background:${color};box-shadow:0 0 5px ${color}88;"></div>
      <span>${name}</span>
    </div>`;
  }).join('');
}

function highlightZone() {
  const q = (document.getElementById('zn-search')?.value || '').toLowerCase().trim();
  document.querySelectorAll('.zn-cell').forEach(cell => {
    const owner = (cell.title || '').toLowerCase();
    if (!q) { cell.classList.remove('dimmed'); return; }
    cell.classList.toggle('dimmed', !(owner && owner.includes(q)));
  });
}

function highlightOwner(name) {
  const q = (document.getElementById('zn-search')?.value || '').trim();
  if (q === name) {
    // 토글 해제
    document.getElementById('zn-search').value = '';
    highlightZone();
  } else {
    document.getElementById('zn-search').value = name;
    highlightZone();
  }
}

function onZoneClick(key, currentOwner) {
  if (!isAdmin()) return;
  const members = (window.members || []).map(m => m.name || m.mc).filter(Boolean);
  const modal   = document.createElement('div');
  modal.className = 'modal-bg';
  modal.onclick   = e => { if (e.target === modal) modal.remove(); };

  let nickCards = `<div class="zn-nick-card zn-nick-empty" data-nick="" onclick="selectZoneNick(this,'')">🚫 비우기</div>`;
  members.forEach(name => {
    const mc  = _getMc(name);
    const sel = name === currentOwner;
    nickCards += `<div class="zn-nick-card${sel ? ' selected' : ''}" data-nick="${name}" onclick="selectZoneNick(this,'${name}')">
      <img class="zn-nick-avatar"
        src="https://minotar.net/avatar/${encodeURIComponent(mc)}/32"
        alt="${name}"
        onerror="this.style.display='none'">
      <span>${name}</span>
    </div>`;
  });

  modal.innerHTML =
    `<div class="modal" style="max-width:440px;">
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
