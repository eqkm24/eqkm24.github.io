/* ═══ 조공 포인트 ═══ */
let _tributeData = {};
let _tributeLog  = [];
const TRIBUTE_GOAL = 6000;

function initTribute() {
  if (isAdmin()) {
    const btn = document.getElementById('tb-reset-btn');
    if (btn) btn.style.display = '';
  }
  window.$db.on('stella_tribute', val => {
    _tributeData = val || {};
    renderTribute();
  });
  window.$db.on('stella_tribute_log', val => {
    _tributeLog = val ? (Array.isArray(val) ? val : Object.values(val)).filter(Boolean) : [];
  });
}

function renderTribute() {
  _renderSummary();
  _renderList();
}

function _renderSummary() {
  const root = document.getElementById('tb-summary');
  if (!root) return;
  const entries  = Object.values(_tributeData).filter(Boolean);
  const total    = entries.reduce((s, m) => s + (m.points || 0), 0);
  const reached  = entries.filter(m => (m.points || 0) >= TRIBUTE_GOAL).length;
  const maxPts   = Math.max(...entries.map(m => m.points || 0), 1);

  root.innerHTML = `
    <div class="stat-card">
      <div class="stat-val" style="color:var(--amber)">${total.toLocaleString()}</div>
      <div class="stat-lbl">총 조공P</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color:var(--green)">${reached}</div>
      <div class="stat-lbl">목표 달성</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color:var(--purple)">${entries.length}</div>
      <div class="stat-lbl">참여 인원</div>
    </div>`;
}

function _renderList() {
  const root = document.getElementById('tb-list');
  if (!root) return;
  const q = (document.getElementById('tb-search')?.value || '').toLowerCase().trim();

  let entries = Object.entries(_tributeData)
    .map(([id, m]) => ({ id, ...m }))
    .filter(m => !q || (m.mc||'').toLowerCase().includes(q) || (m.name||'').toLowerCase().includes(q));
  entries.sort((a, b) => (b.points || 0) - (a.points || 0));

  if (!entries.length) {
    root.innerHTML = `<div class="empty"><div class="empty-icon">⭐</div>${q ? '검색 결과 없음' : '조공 데이터가 없어요.'}</div>`;
    return;
  }

  const maxPts = entries[0].points || 1;

  root.innerHTML = entries.map((m, i) => {
    const pts   = m.points || 0;
    const pct   = Math.min((pts / TRIBUTE_GOAL) * 100, 100);
    const rankCls = i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : '';
    const rankNum = i < 3 ? ['🥇','🥈','🥉'][i] : i + 1;
    const reached = pts >= TRIBUTE_GOAL;

    return `
    <div class="tribute-row">
      <div class="tribute-rank ${rankCls}">${rankNum}</div>
      <div class="tribute-name">${m.name || m.mc || m.id}</div>
      <div class="tribute-bar-wrap">
        <div class="tribute-bar" style="width:${pct}%;${reached ? 'background:var(--green);' : ''}"></div>
      </div>
      <div class="tribute-pts">${pts.toLocaleString()} P</div>
      ${isAdmin() ? `<button class="btn btn-sm" onclick="openTributeModal('${m.id}')">+</button>` : ''}
    </div>`;
  }).join('');
}

function openTributeModal(memberId) {
  const members = window.members || [];
  const modal = document.createElement('div');
  modal.className = 'modal-bg';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div class="modal" style="max-width:340px;">
      <div class="modal-title">⭐ 조공 추가</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
        <select class="input" id="tb-member-sel" style="cursor:pointer;">
          ${members.map(m => `<option value="${m.mc||m.name}" ${m.mc===memberId||m.name===memberId?'selected':''}>${m.name||m.mc} (${m.mc||''})</option>`).join('')}
        </select>
        <input class="input" id="tb-points" type="number" placeholder="포인트" min="0">
        <input class="input" id="tb-note"   type="text"   placeholder="메모 (선택)">
      </div>
      <div class="modal-btns">
        <button class="btn" onclick="this.closest('.modal-bg').remove()">취소</button>
        <button class="btn btn-primary" onclick="saveTribute(this)">저장</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

async function saveTribute(btn) {
  const mc   = document.getElementById('tb-member-sel')?.value;
  const pts  = parseFloat(document.getElementById('tb-points')?.value);
  const note = document.getElementById('tb-note')?.value?.trim();
  if (!mc || isNaN(pts)) { alert('마을원과 포인트를 입력해주세요.'); return; }

  btn.textContent = '저장 중...'; btn.disabled = true;
  try {
    const key = mc.replace(/[.#$\[\]]/g, '_');
    const cur = _tributeData[key]?.points || 0;
    await firebase.database().ref(`stella_tribute/${key}`).set({ mc, name: mc, points: cur + pts });

    const log = [..._tributeLog];
    log.unshift({ mc, delta: pts, total: cur + pts, note: note || '', createdAt: new Date().toISOString() });
    await firebase.database().ref('stella_tribute_log').set(log.slice(0, 200));

    btn.closest('.modal-bg').remove();
  } catch(e) {
    alert('저장 실패: ' + e.message);
    btn.textContent = '저장'; btn.disabled = false;
  }
}

async function resetTribute() {
  if (!confirm('조공 데이터를 전체 초기화하시겠습니까?')) return;
  try {
    await firebase.database().ref('stella_tribute').set({});
    await firebase.database().ref('stella_tribute_log').set([]);
  } catch(e) { alert('실패: ' + e.message); }
}
