/* ═══════════════════════════════════════════════════════════
   생활 통합 페이지  — 채광 / 낚시 / 농사 / 요리
   각 직업별 : [제작 & 조합법] [스킬 정보] 서브탭
═══════════════════════════════════════════════════════════ */

/* ── 직업 메타 ── */
const LIFE_JOBS = [
  { key:'mining',  label:'⛏ 채광',  color:'#ffaa78' },
  { key:'fishing', label:'🎣 낚시',  color:'#88b8ff' },
  { key:'farming', label:'🌾 농사',  color:'#78d898' },
  { key:'cooking', label:'🍳 요리',  color:'#ffd070' },
];

let _lifeJob    = 'mining';  // 현재 직업
let _lifeSubtab = 'recipe';  // 'recipe' | 'skill'

/* ════════════════════════════
   진입점 — 직업 / 서브탭 전환
════════════════════════════ */
function switchLifeJob(key, el) {
  _lifeJob = key;
  _lifeSubtab = 'recipe';
  document.querySelectorAll('.lj-btn').forEach(b => b.classList.remove('lj-on'));
  if (el) el.classList.add('lj-on');
  else {
    const btn = document.querySelector(`.lj-btn[data-job="${key}"]`);
    if (btn) btn.classList.add('lj-on');
  }
  // 페이지 헤더 accent 색상 & 텍스트 갱신
  const meta = LIFE_JOBS.find(j => j.key === key);
  const accent = document.getElementById('life-ph-accent');
  if (accent && meta) { accent.style.color = meta.color; accent.textContent = meta.label; }
  _renderLifeSubtabs();
  _renderLifeContent();
}

function switchLifeSubtab(tab, el) {
  _lifeSubtab = tab;
  document.querySelectorAll('.ls-tab').forEach(b => b.classList.remove('ls-on'));
  if (el) el.classList.add('ls-on');
  _renderLifeContent();
}

/* ── 서브탭 버튼 갱신 ── */
function _renderLifeSubtabs() {
  const wrap = document.getElementById('life-subtab-row');
  if (!wrap) return;
  const job = LIFE_JOBS.find(j => j.key === _lifeJob);
  const c = job ? job.color : 'var(--accent)';

  // 요리는 제작 없음(레시피 별도) — 일단 동일하게
  wrap.innerHTML = `
    <button class="ls-tab ls-on" onclick="switchLifeSubtab('recipe',this)">🛠 제작 & 조합법</button>
    <button class="ls-tab"        onclick="switchLifeSubtab('skill',this)">⚡ 스킬 정보</button>
  `;
  // 언더라인 색상 주입
  wrap.style.setProperty('--ls-color', c);
}

/* ── 콘텐츠 전환 ── */
function _renderLifeContent() {
  const root = document.getElementById('life-content');
  if (!root) return;
  if (_lifeSubtab === 'recipe') {
    root.innerHTML = _buildRecipePanel(_lifeJob);
    // DOM 삽입 후 즉시 그리드 렌더
    _renderRecipeGrid(_lifeJob);
  } else {
    root.innerHTML = _buildSkillPanel(_lifeJob);
  }
  // 검색 이벤트 재등록
  const si = document.getElementById('life-recipe-search');
  if (si) si.addEventListener('input', () => _renderRecipeGrid(_lifeJob));
}

/* ══════════════════════════════════
   제작 & 조합법 패널
══════════════════════════════════ */
const FAC_LABEL2 = {
  bench:   { label:'허름한 작업대', icon:'🔧', cls:'lc-fac-bench'   },
  brazier: { label:'허름한 화로',   icon:'🔥', cls:'lc-fac-brazier' },
  counter: { label:'허름한 조리대', icon:'🥣', cls:'lc-fac-counter' },
  mine_proc:  { label:'채광품 가공 시설', icon:'⛏', cls:'lc-fac-bench' },
  mine_craft: { label:'채광 제작 시설',   icon:'🪨', cls:'lc-fac-brazier' },
};

const GRADE_MAP2  = { n:'일반', a:'고급', r:'희귀', h:'영웅' };
const GRADE_CLS2  = { n:'lc-grade-n', a:'lc-grade-a', r:'lc-grade-r', h:'lc-grade-h' };

function _buildRecipePanel(job) {
  return `
  <div style="margin-bottom:20px;">
    <div style="position:relative;">
      <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--muted);">🔍</span>
      <input id="life-recipe-search" class="lc-search-input"
        placeholder="제작품 또는 재료 이름으로 검색..."
        oninput="_renderRecipeGrid('${job}')">
    </div>
  </div>
  <div class="lc-grid" id="life-recipe-grid"></div>`;
}

function _renderRecipeGrid(job) {
  const grid = document.getElementById('life-recipe-grid');
  if (!grid) return;

  const q = (document.getElementById('life-recipe-search')?.value || '').trim().toLowerCase();
  const raw = LC_DATA[job] || [];
  const items = q ? raw.filter(it =>
    it.name.toLowerCase().includes(q) ||
    it.mats.some(([m]) => m.toLowerCase().includes(q))
  ) : raw;

  if (!items.length) {
    grid.innerHTML = `<div class="lc-empty">${q ? '검색 결과가 없어요.' : '레시피 데이터가 없습니다.'}</div>`;
    return;
  }

  grid.innerHTML = items.map(it => {
    const gl = GRADE_MAP2[it.grade] || '';
    const gc = GRADE_CLS2[it.grade] || 'lc-grade-n';
    const fac = FAC_LABEL2[it.fac] || { label: it.fac, icon:'🏭', cls:'' };
    const matsHtml = it.mats.map(([name, qty]) =>
      `<span class="lc-mat-tag">${name} <span class="lc-mat-qty">×${qty}</span></span>`
    ).join('');

    return `
    <div class="lc-card lc-card-new">
      <div class="lc-card-hd">
        <div class="lc-card-img">${it.emoji || '📦'}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap;">
            <span class="lc-fac-badge ${fac.cls}">${fac.icon} ${fac.label}</span>
            <span class="lc-card-time">⏱ ${it.time}</span>
          </div>
          <div class="lc-card-name">${it.name}</div>
          <span class="lc-grade ${gc}">${gl}</span>
          ${it.prob && it.prob !== '100%' ? `<span class="lc-prob-badge">${it.prob}</span>` : ''}
        </div>
      </div>
      <div class="lc-mats-hd2">필요 재료</div>
      <div class="lc-mats-list">${matsHtml}</div>
    </div>`;
  }).join('');
}

/* ══════════════════════════════════
   스킬 정보 패널
══════════════════════════════════ */
const SKILL_DATA = {
  mining: {
    bouju: '태양의 보주',
    skills: [
      {
        name:'단련된 곡괭이', type:'P', tier:'Lv.1',
        desc:'채광 시 데미지가 레벨에 비례하여 일정 비율(%) 증가합니다.',
        prereq:'-', excl:'-',
        cols:['레벨','데미지 증가'],
        rows:[['1','5%'],['5','25%'],['10','50%'],['15','75%'],['20','100%']],
      },
      {
        name:'광맥 감각', type:'P', tier:'Lv.1',
        desc:'채광 시 광물이 추가로 드롭될 확률이 생깁니다.',
        prereq:'-', excl:'-',
        cols:['레벨','추가 드롭 확률'],
        rows:[['1','1%'],['5','5%'],['10','10%'],['15','15%'],['20','20%']],
      },
      {
        name:'광맥 흐름', type:'P', tier:'Lv.1',
        desc:'채광 딜레이가 레벨에 비례하여 감소해 더 빠르게 채광할 수 있습니다.',
        prereq:'-', excl:'-',
        cols:['레벨','딜레이 감소'],
        rows:[['1','5%'],['5','25%'],['10','50%'],['15','75%'],['20','100%']],
      },
      {
        name:'폭발적인 채광', type:'A', tier:'Lv.20',
        desc:'스킬 사용 시 채광 진행 시간 동안 성급함(Haste)과 야간 투시 효과를 획득합니다.',
        act:'좌클릭 (손에 보주 착용)', req:'마나 소모',
        prereq:'-', excl:'광맥 탐지',
        cols:['레벨','지속 시간','쿨타임'],
        rows:[['20','15초','60초'],['25','20초','55초'],['30','30초','45초']],
      },
      {
        name:'광맥 탐지', type:'A', tier:'Lv.20',
        desc:'주변 범위를 타원형으로 벽 너머까지 투시해 광물을 탐지하고 채광할 수 있습니다.',
        act:'우클릭 (손에 보주 착용)', req:'마나 소모',
        prereq:'-', excl:'폭발적인 채광',
        cols:['레벨','탐지 범위','쿨타임'],
        rows:[['20','반경 5블록','120초'],['25','반경 7블록','100초'],['30','반경 10블록','80초']],
      },
    ],
  },

  fishing: {
    bouju: '바다의 보주',
    skills: [
      {
        name:'보물 감지', type:'P', tier:'Lv.1',
        desc:'바다 보물을 건질 확률이 레벨당 기본 확률 대비 1.0%씩 증가합니다.',
        prereq:'-', excl:'-',
        cols:['레벨','보물 확률 증가'],
        rows:[['1','+1%'],['5','+5%'],['10','+10%'],['20','+20%']],
      },
      {
        name:'소문난 미끼', type:'P', tier:'Lv.1',
        desc:'낚시 성공 시 일정 확률로 발동해 동일한 물고기를 1마리 추가로 낚아 올립니다.',
        prereq:'-', excl:'-',
        cols:['레벨','추가 낚시 확률'],
        rows:[['1','2%'],['5','10%'],['10','20%'],['20','40%']],
      },
      {
        name:'낚싯줄 장력', type:'P', tier:'Lv.1',
        desc:'낚시 성공 시 일반 등급 비율이 감소해 고급·희귀 등급 물고기를 더 자주 낚을 수 있습니다.',
        prereq:'-', excl:'-',
        cols:['레벨','일반 등급 감소','고급↑ 증가'],
        rows:[['1','-1%','+1%'],['10','-10%','+10%'],['20','-20%','+20%']],
      },
      {
        name:'떼낚시', type:'A', tier:'Lv.20',
        desc:'스킬 사용 시 40초 동안 낚시를 완료하는 데 걸리는 시간이 감소합니다.',
        act:'좌클릭 (손에 보주 착용)', req:'마나 소모',
        prereq:'-', excl:'쌍걸이',
        cols:['레벨','시간 감소','쿨타임'],
        rows:[['20','20%','90초'],['25','30%','75초'],['30','40%','60초']],
      },
      {
        name:'쌍걸이', type:'A', tier:'Lv.20',
        desc:'스킬 사용 시 40초 동안 낚시 성공 시 일정 확률로 낚시가 2회 진행됩니다.',
        act:'우클릭 (손에 보주 착용)', req:'마나 소모',
        prereq:'-', excl:'떼낚시',
        cols:['레벨','2회 낚시 확률','쿨타임'],
        rows:[['20','25%','90초'],['25','35%','75초'],['30','50%','60초']],
      },
    ],
  },

  farming: {
    bouju: '별의 보주',
    skills: [
      {
        name:'개간의 서약', type:'P', tier:'Lv.1',
        desc:'경작지 및 화분통 갯수가 증가합니다. 최대 레벨 달성 시 화분통 768개까지 확장 가능합니다.',
        prereq:'-', excl:'-',
        cols:['레벨','화분통 최대'],
        rows:[['1','48개'],['5','96개'],['10','192개'],['15','384개'],['20','768개']],
      },
      {
        name:'풍년의 축복', type:'P', tier:'Lv.1',
        desc:'3등급·2등급 작물 확률을 낮추고 1등급 확률을 높입니다. 황금 작물 드롭률도 증가합니다.',
        prereq:'-', excl:'-',
        cols:['레벨','1등급 확률 증가','황금 작물'],
        rows:[['1','+1%','+0.1%'],['10','+10%','+1%'],['20','+20%','+2%']],
      },
      {
        name:'비옥한 토양', type:'P', tier:'Lv.1',
        desc:'작물 수확 시 한 번에 여러 개가 드롭될 확률이 증가합니다.',
        prereq:'-', excl:'-',
        cols:['레벨','다중 드롭 확률'],
        rows:[['1','2%'],['5','10%'],['10','20%'],['20','40%']],
      },
      {
        name:'수확의 손길', type:'A', tier:'Lv.20',
        desc:'스킬 사용 시 1×3 형태 범위로 작물을 한 번에 재배·수확할 수 있습니다.',
        act:'좌클릭 (손에 보주 착용)', req:'마나 소모',
        prereq:'-', excl:'되뿌리기',
        cols:['레벨','범위','쿨타임'],
        rows:[['20','1×3','30초'],['25','1×5','25초'],['30','3×3','20초']],
      },
      {
        name:'되뿌리기', type:'A', tier:'Lv.20',
        desc:'스킬 사용 중 작물 수확 시, 10초 후 인벤토리에 동일 씨앗이 있으면 해당 위치에 자동 재파종됩니다.',
        act:'우클릭 (손에 보주 착용 + 왼손에 씨앗)', req:'마나 소모',
        prereq:'-', excl:'수확의 손길',
        cols:['레벨','자동 파종 시간','쿨타임'],
        rows:[['20','10초 후','45초'],['25','7초 후','35초'],['30','5초 후','25초']],
      },
    ],
  },

  cooking: {
    bouju: '대지의 보주',
    skills: [
      {
        name:'손질 달인', type:'P', tier:'Lv.1',
        desc:'요리를 만드는 시간이 레벨에 비례하여 감소합니다.',
        prereq:'-', excl:'-',
        cols:['레벨','제작 시간 감소'],
        rows:[['1','5%'],['5','25%'],['10','50%'],['20','100%']],
      },
      {
        name:'맛의 균형', type:'P', tier:'Lv.1',
        desc:'음식의 기본 효과 유지시간이 레벨에 비례하여 증가합니다.',
        prereq:'-', excl:'-',
        cols:['레벨','효과 지속 증가'],
        rows:[['1','+5%'],['5','+25%'],['10','+50%'],['20','+100%']],
      },
      {
        name:'미식가', type:'P', tier:'Lv.1',
        desc:'높은 등급의 요리가 완성될 확률이 증가합니다.',
        prereq:'-', excl:'-',
        cols:['레벨','고급↑ 확률 증가'],
        rows:[['1','+2%'],['5','+10%'],['10','+20%'],['20','+40%']],
      },
      {
        name:'연회 준비', type:'A', tier:'Lv.20',
        desc:'스킬 사용 시 40초 동안 일정 확률로 요리가 1회 추가 완성됩니다.',
        act:'좌클릭 (손에 보주 착용)', req:'마나 소모',
        prereq:'-', excl:'즉시 완성',
        cols:['레벨','추가 완성 확률','쿨타임'],
        rows:[['20','20%','90초'],['25','30%','75초'],['30','40%','60초']],
      },
      {
        name:'즉시 완성', type:'A', tier:'Lv.20',
        desc:'스킬 사용 시 10초 동안 일정 확률로 요리가 즉시 완료됩니다.',
        act:'우클릭 (손에 보주 착용)', req:'마나 소모',
        prereq:'-', excl:'연회 준비',
        cols:['레벨','즉시 완성 확률','쿨타임'],
        rows:[['20','15%','120초'],['25','25%','100초'],['30','40%','80초']],
      },
    ],
  },
};

/* ── 스킬 패널 빌드 ── */
function _buildSkillPanel(job) {
  const data = SKILL_DATA[job];
  if (!data) return '<div class="lc-empty">스킬 데이터가 없습니다.</div>';
  const job_meta = LIFE_JOBS.find(j => j.key === job);
  const color = job_meta ? job_meta.color : 'var(--accent)';

  const skillCards = data.skills.map((sk, idx) => {
    const isActive = sk.type === 'A';
    const isExcl   = sk.excl !== '-';
    const nextSk   = data.skills[idx + 1];
    const isExclPair = isExcl && nextSk && nextSk.excl !== '-' && sk.tier === nextSk.tier;

    const tableHtml = `
      <div class="life-sk-table-wrap" id="lsk-tbl-${job}-${idx}">
        ${sk.act ? `
        <div class="life-sk-act-row">
          <span class="life-sk-act-item"><strong>발동</strong> ${sk.act}</span>
          <span class="life-sk-act-item"><strong>요구</strong> ${sk.req}</span>
          ${sk.excl !== '-' ? `<span class="life-sk-act-item" style="color:#f87171;"><strong>택1</strong> ${sk.excl}</span>` : ''}
        </div>` : ''}
        <table class="life-sk-table">
          <thead><tr>${sk.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${sk.rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>`;

    return `
    <div class="life-sk-card" id="lsk-${job}-${idx}" style="--sk-color:${color}">
      <div class="life-sk-card-hd" onclick="toggleLifeSk('${job}',${idx})">
        <div class="life-sk-type-dot ${isActive ? 'lsk-active' : 'lsk-passive'}">${isActive ? 'A' : 'P'}</div>
        <div style="flex:1;min-width:0;">
          <div class="life-sk-name">${sk.name}</div>
          <div class="life-sk-desc">${sk.desc}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
          <span class="life-sk-tier-badge">${sk.tier}</span>
          ${isExcl ? `<span class="life-sk-excl-badge">⚔ 택1</span>` : ''}
        </div>
        <span class="life-sk-arrow" id="lsk-arr-${job}-${idx}">▼</span>
      </div>
      ${tableHtml}
    </div>
    ${isExclPair ? '' : (idx < data.skills.length - 1 ? `<div class="life-sk-connector"><div class="life-sk-line"></div></div>` : '')}`;
  }).join('');

  // 보주 정보 헤더
  const boujuInfo = `
    <div class="life-sk-header" style="--sk-color:${color}">
      <div class="life-sk-header-icon">🔮</div>
      <div>
        <div class="life-sk-header-title">${job_meta?.label || job} 스킬</div>
        <div class="life-sk-header-sub">사용 보주: <strong>${data.bouju}</strong> · 기본 Lv.20 / 강화 포함 최대 Lv.30</div>
      </div>
    </div>`;

  return boujuInfo + `<div class="life-sk-list">${skillCards}</div>`;
}

function toggleLifeSk(job, idx) {
  const card = document.getElementById(`lsk-${job}-${idx}`);
  const tbl  = document.getElementById(`lsk-tbl-${job}-${idx}`);
  const arr  = document.getElementById(`lsk-arr-${job}-${idx}`);
  if (!card) return;
  const open = card.classList.toggle('lsk-open');
  if (tbl) tbl.style.maxHeight = open ? tbl.scrollHeight + 'px' : '0';
  if (arr) arr.style.transform = open ? 'rotate(180deg)' : '';
}

/* ── 라이프 페이지 초기 진입 ── */
function initLifePage() {
  // 직업 버튼 active 상태 초기화
  document.querySelectorAll('.lj-btn').forEach(b => b.classList.remove('lj-on'));
  const activeBtn = document.querySelector(`.lj-btn[data-job="${_lifeJob}"]`);
  if (activeBtn) activeBtn.classList.add('lj-on');
  // 헤더 accent 갱신
  const meta = LIFE_JOBS.find(j => j.key === _lifeJob);
  const accent = document.getElementById('life-ph-accent');
  if (accent && meta) { accent.style.color = meta.color; accent.textContent = meta.label; }
  _renderLifeSubtabs();
  _renderLifeContent();
}

/* ── recipe.js의 renderLifecat와 브릿지 (기존 nav 드롭다운 호환) ── */
function switchLifecat(cat) {
  // 생활 페이지로 이동하면서 해당 직업으로 전환
  const keyMap = { mining:'mining', fishing:'fishing', farming:'farming', enhance:'cooking' };
  const job = keyMap[cat] || cat;
  _lifeJob = job;
  _lifeSubtab = 'recipe';
  const btn = document.querySelector(`.lj-btn[data-job="${job}"]`);
  switchLifeJob(job, btn);
}
