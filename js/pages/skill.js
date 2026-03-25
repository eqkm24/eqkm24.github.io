/* ═══ 생활 스킬 도감 ═══ */

function switchSkill(job) {
  curSkillJob = job;
  document.querySelectorAll('.sk-tab').forEach(b => b.classList.remove('sk-on'));
  event.target.classList.add('sk-on');
  renderSkillPage(job);
}

function renderSkillPage(job) {
  const data = SKILL_DATA[job];
  const wrap = document.getElementById('skill-content');
  let html = '<div class="sk-grid">';
  const skills = data.skills;

  skills.forEach((sk, idx) => {
    const isActive = sk.type === 'A';
    const badgeClass = isActive ? 'sk-badge-a' : 'sk-badge-p';
    const badgeText = isActive ? 'ACTIVE' : 'PASSIVE';
    const imgUrl = SK_IMG[sk.name];
    const imgHtml = imgUrl
      ? `<img class="sk-card-img" src="${imgUrl}" alt="${sk.name}">`
      : `<div class="sk-card-img-ph">${isActive ? '⚡' : '🛡️'}</div>`;

    // Connector before card
    if (idx > 0) {
      const prev = skills[idx-1];
      // Fork for exclusive pair (both T40 active skills)
      if (sk.excl !== '-' && prev.excl !== '-' && sk.tier === prev.tier) {
        html += `<div class="sk-connector-fork"><span>택 1</span></div>`;
      } else {
        html += `<div class="sk-connector"><div class="sk-connector-line"></div></div>`;
      }
    }

    html += `
    <div class="sk-card" id="skc-${idx}">
      <div class="sk-card-hd" onclick="toggleSkill(${idx})">
        ${imgHtml}
        <div class="sk-card-info">
          <div class="sk-card-top">
            <span class="sk-card-name">${sk.name}</span>
            <span class="sk-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="sk-card-desc">${sk.desc}</div>
        </div>
        <div class="sk-card-meta">
          <span class="sk-card-tier">${sk.tier}</span>
          ${sk.prereq!=='-'?`<span class="sk-card-prereq">← ${sk.prereq}</span>`:''}
          ${sk.excl!=='-'?`<span class="sk-card-excl">⚔ ${sk.excl}</span>`:''}
        </div>
        <span class="sk-card-arrow">▼</span>
      </div>
      <div class="sk-body">
        ${sk.act?`<div class="sk-act"><span class="sk-act-item"><strong>발동</strong> ${sk.act}</span><span class="sk-act-item"><strong>요구</strong> ${sk.req}</span></div>`:''}
        <table class="sk-tbl">
          <thead><tr>${sk.cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${sk.rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
  });

  html += '</div>';
  wrap.innerHTML = html;
}

function toggleSkill(idx) {
  const card = document.getElementById('skc-'+idx);
  card.classList.toggle('sk-open');
}
