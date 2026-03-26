/* ═══ 마을원 명단 ═══ */

let _memberData = [];

function initMember() {
  if (isAdmin()) {
    document.getElementById('mb-add-btn')?.style && (document.getElementById('mb-add-btn').style.display = '');
    document.getElementById('mb-reset-btn')?.style && (document.getElementById('mb-reset-btn').style.display = '');
  }
  window.$db.on('stella_members', val => {
    _memberData = val
      ? (Array.isArray(val) ? val : Object.values(val)).filter(Boolean)
      : [];
    window.members = _memberData;
    renderMembers();
  });
}

function renderMembers() {
  const grid  = document.getElementById('mb-grid');
  const count = document.getElementById('mb-count');
  if (!grid) return;

  const q = (document.getElementById('mb-search')?.value || '').toLowerCase().trim();
  const list = q
    ? _memberData.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.mc   || '').toLowerCase().includes(q) ||
        (m.job  || '').toLowerCase().includes(q))
    : _memberData;

  if (count) count.textContent = `${list.length}명`;

  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;">
      <div class="empty-icon">👥</div>
      ${q ? '검색 결과가 없어요.' : '마을원이 없어요.'}
    </div>`;
    return;
  }

  // 직업별 색상
  const JOB_COLOR = {
    채광:'var(--amber)', 낚시:'var(--blue)', 농사:'var(--green)',
    요리:'var(--red)', 기타:'var(--muted)',
  };

  grid.innerHTML = list.map(m => {
    const color   = m.color || JOB_COLOR[m.job] || 'var(--purple)';
    const initials = (m.name || m.mc || '?').slice(0, 2).toUpperCase();
    const imgSrc  = m.mc ? `https://mc-heads.net/avatar/${m.mc}/40` : '';
    const jobTag  = m.job ? `<span class="tag" style="background:${color}20;color:${color};">${m.job}</span>` : '';
    const typeTag = m.type === '부계'
      ? `<span class="tag" style="background:var(--muted)20;color:var(--muted);">부계</span>` : '';

    return `
    <div class="member-card" onclick="openMemberDetail('${m.mc || m.name}')">
      <div class="member-avatar">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${m.name}" onerror="this.parentElement.innerHTML='<span style=\\'font-size:14px;font-weight:700;color:${color};\\'>'+initials+'</span>'">`
          : `<span style="font-size:14px;font-weight:700;color:${color};">${initials}</span>`}
      </div>
      <div class="member-info">
        <div class="member-name">${m.name || m.mc}</div>
        <div class="member-mc" style="margin-bottom:5px;">${m.mc || ''}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">${jobTag}${typeTag}</div>
      </div>
      ${isAdmin() ? `<button class="btn btn-sm" onclick="event.stopPropagation();openMemberModal('${m.mc || m.name}')" style="flex-shrink:0;">편집</button>` : ''}
    </div>`;
  }).join('');
}

function openMemberDetail(mc) {
  const m = _memberData.find(x => x.mc === mc || x.name === mc);
  if (!m) return;

  const modal = document.createElement('div');
  modal.className = 'modal-bg';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  const color = m.color || 'var(--purple)';
  const initials = (m.name || m.mc || '?').slice(0,2).toUpperCase();

  modal.innerHTML = `
    <div class="modal">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
        <div class="member-avatar" style="width:52px;height:52px;border-radius:10px;">
          <img src="https://mc-heads.net/avatar/${m.mc}/52" alt="${m.name}"
            onerror="this.parentElement.innerHTML='<span style=\\'font-size:18px;font-weight:700;color:${color};\\'>'+\`${initials}\`+'</span>'">
        </div>
        <div>
          <div style="font-size:18px;font-weight:700;color:var(--text);">${m.name || m.mc}</div>
          <div style="font-size:12px;color:var(--muted);font-family:var(--font-mono);">${m.mc || ''}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">
        ${m.job  ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--b1);"><span style="color:var(--muted)">직업</span><span style="font-weight:700;color:var(--text)">${m.job}</span></div>` : ''}
        ${m.jobs?.length > 1 ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--b1);"><span style="color:var(--muted)">부직업</span><span style="font-weight:700;color:var(--text)">${m.jobs.filter(j=>j!==m.job).join(', ')}</span></div>` : ''}
        ${m.type ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--b1);"><span style="color:var(--muted)">계정 유형</span><span style="font-weight:700;color:var(--text)">${m.type}</span></div>` : ''}
      </div>
      <div class="modal-btns">
        <button class="btn" onclick="this.closest('.modal-bg').remove()">닫기</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function openMemberModal(mc) {
  const m = mc ? _memberData.find(x => x.mc === mc || x.name === mc) : null;
  const modal = document.createElement('div');
  modal.className = 'modal-bg';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div class="modal">
      <div class="modal-title">${m ? '마을원 수정' : '마을원 등록'}</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
        <input class="input" id="fm-name" placeholder="이름 (디스코드)" value="${m?.name || ''}">
        <input class="input" id="fm-mc"   placeholder="마인크래프트 닉네임" value="${m?.mc || ''}">
        <select class="input" id="fm-job" style="cursor:pointer;">
          ${['채광','낚시','농사','요리','기타'].map(j =>
            `<option value="${j}" ${m?.job===j?'selected':''}>${j}</option>`
          ).join('')}
        </select>
        <select class="input" id="fm-type" style="cursor:pointer;">
          ${['본계','부계'].map(t =>
            `<option value="${t}" ${m?.type===t?'selected':''}>${t}</option>`
          ).join('')}
        </select>
      </div>
      <div class="modal-btns">
        ${m ? `<button class="btn btn-danger" onclick="deleteMember('${mc}',this)">삭제</button>` : ''}
        <button class="btn" onclick="this.closest('.modal-bg').remove()">취소</button>
        <button class="btn btn-primary" onclick="saveMember('${mc||''}',this)">저장</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

async function saveMember(mc, btn) {
  const name = document.getElementById('fm-name')?.value?.trim();
  const mc2  = document.getElementById('fm-mc')?.value?.trim();
  const job  = document.getElementById('fm-job')?.value;
  const type = document.getElementById('fm-type')?.value;

  if (!mc2) { alert('닉네임을 입력해주세요.'); return; }

  btn.textContent = '저장 중...'; btn.disabled = true;
  try {
    const arr = [..._memberData];
    const idx = mc ? arr.findIndex(m => m.mc === mc || m.name === mc) : -1;
    const entry = { name: name || mc2, mc: mc2, job, type };
    if (idx >= 0) arr[idx] = entry; else arr.push(entry);
    await window.$db.set('stella_members', arr);
    btn.closest('.modal-bg').remove();
  } catch(e) {
    alert('저장 실패: ' + e.message);
    btn.textContent = '저장'; btn.disabled = false;
  }
}

async function deleteMember(mc, btn) {
  if (!confirm(`${mc}을(를) 삭제하시겠습니까?`)) return;
  btn.textContent = '삭제 중...'; btn.disabled = true;
  try {
    const arr = _memberData.filter(m => m.mc !== mc && m.name !== mc);
    await window.$db.set('stella_members', arr);
    btn.closest('.modal-bg').remove();
  } catch(e) {
    alert('삭제 실패: ' + e.message);
    btn.textContent = '삭제'; btn.disabled = false;
  }
}

async function resetMembers() {
  if (!confirm('마을원 명단을 전체 초기화하시겠습니까?')) return;
  try { await window.$db.set('stella_members', []); }
  catch(e) { alert('실패: ' + e.message); }
}
