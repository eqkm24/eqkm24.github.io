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
  _lifeSubtab = key === 'cooking' ? 'skill' : 'recipe';
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

  // 직업별 서브탭 정의
  const TAB_MAP = {
    mining:  [
      { key:'recipe', label:'🛠 제작 & 조합법' },
      { key:'skill',  label:'⚡ 스킬 정보' },
      { key:'smelt',  label:'🔩 제련' },
    ],
    fishing: [
      { key:'recipe', label:'🛠 제작 & 조합법' },
      { key:'skill',  label:'⚡ 스킬 정보' },
      { key:'calc',   label:'📊 효율 계산기' },
      { key:'sim',    label:'🎮 낚시 시뮬레이터' },
      { key:'price',  label:'💰 물고기 시세' },
    ],
    farming: [
      { key:'recipe', label:'🛠 제작 & 조합법' },
      { key:'skill',  label:'⚡ 스킬 정보' },
      { key:'price',  label:'💰 작물 시세' },
    ],
    cooking: [
      { key:'skill',  label:'⚡ 스킬 정보' },
      { key:'calc',   label:'📊 효율 계산기' },
      { key:'price',  label:'💰 요리 시세' },
    ],
  };

  const tabs = TAB_MAP[_lifeJob] || TAB_MAP.mining;
  // 현재 서브탭이 없으면 첫 번째로
  if (!tabs.find(t => t.key === _lifeSubtab)) _lifeSubtab = tabs[0].key;

  wrap.innerHTML = tabs.map(t =>
    `<button class="ls-tab ${t.key === _lifeSubtab ? 'ls-on' : ''}"
      onclick="switchLifeSubtab('${t.key}',this)">${t.label}</button>`
  ).join('');

  wrap.style.setProperty('--ls-color', c);
}

/* ── 콘텐츠 전환 ── */
function _renderLifeContent() {
  const root = document.getElementById('life-content');
  if (!root) return;

  switch (_lifeSubtab) {
    case 'recipe':
      root.innerHTML = _buildRecipePanel(_lifeJob);
      _renderRecipeGrid(_lifeJob);
      const si = document.getElementById('life-recipe-search');
      if (si) si.addEventListener('input', () => _renderRecipeGrid(_lifeJob));
      break;
    case 'skill':
      root.innerHTML = _buildSkillPanel(_lifeJob);
      break;
    case 'smelt':
      root.innerHTML = _buildSmeltPanel();
      break;
    case 'calc':
      if (_lifeJob === 'fishing') root.innerHTML = _buildFishCalcPanel();
      else if (_lifeJob === 'cooking') root.innerHTML = _buildCookCalcPanel();
      else root.innerHTML = '<div class="lc-empty">준비 중입니다.</div>';
      break;
    case 'sim':
      root.innerHTML = _buildFishSimPanel();
      _initFishSim();
      break;
    case 'price':
      root.innerHTML = _buildPricePanel(_lifeJob);
      _renderLifePriceData(_lifeJob);
      break;
    default:
      root.innerHTML = '<div class="lc-empty">준비 중입니다.</div>';
  }
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

/* ══════════════════════════════════════════════════
   채광 - 제련 패널
══════════════════════════════════════════════════ */
function _buildSmeltPanel() {
  const SMELT_DATA = [
    { ore:'일반 미스릴 원석',     result:'미스릴 주괴',     qty:3, fuel:4, time:'30초', grade:'n' },
    { ore:'일반 아르젠타이트 원석', result:'아르젠타이트 주괴', qty:3, fuel:4, time:'30초', grade:'a' },
    { ore:'일반 벨리움 원석',     result:'벨리움 주괴',     qty:3, fuel:4, time:'30초', grade:'r' },
  ];
  const GRADE_COLOR = { n:'var(--r-n)', a:'var(--r-a)', r:'var(--r-r)', h:'var(--r-h)' };

  return `
  <div class="smelt-wrap">
    <div class="smelt-info">
      <span class="smelt-fac">🔥 허름한 화로</span>
      <span style="font-size:11px;color:var(--muted);">연료: 마그마 블록 ×N</span>
    </div>
    <div class="lc-grid">
      ${SMELT_DATA.map(d => `
      <div class="lc-card">
        <div class="lc-card-hd">
          <div class="lc-card-img">🪨</div>
          <div class="lc-card-meta">
            <div class="lc-card-type">
              <span class="lc-grade ${d.grade === 'n' ? 'lc-grade-n' : d.grade === 'a' ? 'lc-grade-a' : 'lc-grade-r'}">${{n:'일반',a:'고급',r:'희귀'}[d.grade]}</span>
              <span class="lc-card-time">⏱ ${d.time}</span>
            </div>
            <div class="lc-card-name">${d.result}</div>
          </div>
        </div>
        <div class="lc-mats-hd">
          <span class="lc-mats-label">필요 재료</span>
          <span class="lc-facility lc-fac-brazier">🔥 허름한 화로</span>
        </div>
        <div class="lc-mats-list">
          <span class="lc-mat-tag">${d.ore} <span class="lc-mat-qty">×${d.qty}</span></span>
          <span class="lc-mat-tag">마그마 블록 <span class="lc-mat-qty">×${d.fuel}</span></span>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════
   낚시 - 효율 계산기
══════════════════════════════════════════════════ */
function _buildFishCalcPanel() {
  return `
  <div class="life-calc-wrap">
    <div class="life-calc-card">
      <div class="life-calc-hd">📊 낚시 효율 계산기</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:20px;line-height:1.7;">
        낚시 레벨 및 스킬 보유 여부를 입력하면 시간당 예상 수익과 효율을 계산해드려요.
      </p>
      <div class="life-calc-fields">
        <div class="life-calc-field">
          <label>🎣 낚시 레벨</label>
          <input type="number" id="fc-level" value="20" min="1" max="30" oninput="calcFishEfficiency()">
        </div>
        <div class="life-calc-field">
          <label>💧 마나 최대치</label>
          <input type="number" id="fc-mana" value="500" min="100" max="2000" oninput="calcFishEfficiency()">
        </div>
        <div class="life-calc-field">
          <label>⏱ 낚시 딜레이 감소 (%)</label>
          <input type="number" id="fc-delay" value="0" min="0" max="50" oninput="calcFishEfficiency()">
        </div>
        <div class="life-calc-field">
          <label>🪝 미끼 등급</label>
          <select id="fc-bait" onchange="calcFishEfficiency()">
            <option value="0">없음</option>
            <option value="1">지렁이 미끼 (일반)</option>
            <option value="2">어분 미끼 (고급)</option>
            <option value="3">루어 미끼 (희귀)</option>
          </select>
        </div>
      </div>
      <div id="fish-calc-result" class="life-calc-result" style="display:none;"></div>
    </div>
  </div>`;
}

function calcFishEfficiency() {
  const level = parseInt(document.getElementById('fc-level')?.value) || 20;
  const mana  = parseInt(document.getElementById('fc-mana')?.value)  || 500;
  const delay = parseInt(document.getElementById('fc-delay')?.value) || 0;
  const bait  = parseInt(document.getElementById('fc-bait')?.value)  || 0;

  // 기본 낚시 사이클: 약 30초 (딜레이 감소 적용)
  const baseCycle = 30;
  const reducedCycle = baseCycle * (1 - delay / 100);
  const fishPerHour = Math.floor(3600 / reducedCycle);

  // 등급 확률 (레벨 + 미끼 기반 간략 계산)
  const rarityBonus = bait * 5 + Math.floor(level / 5);
  const normalPct  = Math.max(20, 70 - rarityBonus);
  const goodPct    = Math.min(40, 20 + rarityBonus * 0.5);
  const rarePct    = Math.min(30, 5  + rarityBonus * 0.3);
  const heroPct    = Math.min(10, 1  + rarityBonus * 0.1);

  // 마나 소모 (스킬 사용 기준)
  const manaPerSkill = 30;
  const skillUsable  = Math.floor(mana / manaPerSkill);

  const result = document.getElementById('fish-calc-result');
  if (!result) return;
  result.style.display = '';
  result.innerHTML = `
    <div class="calc-result-grid">
      <div class="calc-result-item">
        <div class="calc-result-val">${fishPerHour.toLocaleString()}</div>
        <div class="calc-result-lbl">시간당 낚시 횟수</div>
      </div>
      <div class="calc-result-item">
        <div class="calc-result-val">${reducedCycle.toFixed(1)}초</div>
        <div class="calc-result-lbl">사이클 시간</div>
      </div>
      <div class="calc-result-item">
        <div class="calc-result-val">${skillUsable}회</div>
        <div class="calc-result-lbl">스킬 사용 가능</div>
      </div>
    </div>
    <div class="calc-grade-bar">
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px;font-weight:700;">예상 등급 분포</div>
      <div class="grade-bar-row"><span class="grade-bar-label" style="color:var(--r-n)">일반</span><div class="grade-bar-track"><div class="grade-bar-fill" style="width:${normalPct}%;background:var(--r-n);"></div></div><span class="grade-bar-pct">${normalPct}%</span></div>
      <div class="grade-bar-row"><span class="grade-bar-label" style="color:var(--r-a)">고급</span><div class="grade-bar-track"><div class="grade-bar-fill" style="width:${goodPct}%;background:var(--r-a);"></div></div><span class="grade-bar-pct">${goodPct.toFixed(0)}%</span></div>
      <div class="grade-bar-row"><span class="grade-bar-label" style="color:var(--r-r)">희귀</span><div class="grade-bar-track"><div class="grade-bar-fill" style="width:${rarePct}%;background:var(--r-r);"></div></div><span class="grade-bar-pct">${rarePct.toFixed(0)}%</span></div>
      <div class="grade-bar-row"><span class="grade-bar-label" style="color:var(--r-h)">영웅</span><div class="grade-bar-track"><div class="grade-bar-fill" style="width:${heroPct}%;background:var(--r-h);"></div></div><span class="grade-bar-pct">${heroPct.toFixed(1)}%</span></div>
    </div>`;
}

/* ══════════════════════════════════════════════════
   낚시 - 시뮬레이터
══════════════════════════════════════════════════ */
function _buildFishSimPanel() {
  return `
  <div class="life-calc-wrap">
    <div class="life-calc-card">
      <div class="life-calc-hd">🎮 낚시 시뮬레이터</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:20px;line-height:1.7;">
        루나월드 낚시 시스템을 시뮬레이션합니다. 미끼와 스킬을 설정하고 낚시를 시작하세요.
      </p>
      <div class="life-calc-fields" style="margin-bottom:16px;">
        <div class="life-calc-field">
          <label>🪝 미끼</label>
          <select id="sim-bait">
            <option value="normal">지렁이 미끼</option>
            <option value="good">어분 미끼</option>
            <option value="rare">루어 미끼</option>
          </select>
        </div>
        <div class="life-calc-field">
          <label>🎣 낚시 레벨</label>
          <input type="number" id="sim-level" value="20" min="1" max="30">
        </div>
      </div>

      <!-- 낚시 화면 -->
      <div class="fish-sim-screen" id="fish-sim-screen">
        <div class="fish-sim-water">
          <div class="fish-sim-float" id="sim-float">🪝</div>
          <div class="fish-sim-nibble-bar" id="sim-nibble-bar" style="display:none;">
            <div class="fish-sim-nibble-fill" id="sim-nibble-fill"></div>
          </div>
        </div>
        <div id="sim-status" class="fish-sim-status">준비됨</div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;">
          <button class="mb-btn mb-btn-add" id="sim-cast-btn" onclick="simCast()">🎣 던지기</button>
          <button class="mb-btn" onclick="simReset()">리셋</button>
        </div>
      </div>

      <!-- 결과 기록 -->
      <div style="margin-top:16px;">
        <div style="font-size:11px;font-weight:800;color:var(--muted);margin-bottom:8px;">🏆 낚시 기록</div>
        <div id="sim-log" class="sim-log-list"></div>
        <div id="sim-stats" class="sim-stats"></div>
      </div>
    </div>
  </div>`;
}

let _simState = 'idle'; // idle | casting | biting | reeling
let _simTimer = null;
let _simLog   = [];
let _simCounts = { n:0, a:0, r:0, h:0, total:0 };

function _initFishSim() {
  _simState = 'idle';
  _simLog   = [];
  _simCounts = { n:0, a:0, r:0, h:0, total:0 };
  _simRenderLog();
}

function simCast() {
  if (_simState !== 'idle') return;
  _simState = 'casting';
  const status = document.getElementById('sim-status');
  const floatEl = document.getElementById('sim-float');
  if (status) status.textContent = '찌를 던졌습니다...';
  if (floatEl) { floatEl.style.animation = 'simSplash .4s ease'; setTimeout(() => { if(floatEl) floatEl.style.animation = ''; }, 400); }

  const level  = parseInt(document.getElementById('sim-level')?.value) || 20;
  const bait   = document.getElementById('sim-bait')?.value || 'normal';
  const waitMs = Math.max(3000, 15000 - level * 300 - (bait === 'rare' ? 3000 : bait === 'good' ? 1500 : 0));
  const actualWait = waitMs * (0.7 + Math.random() * 0.6);

  clearTimeout(_simTimer);
  _simTimer = setTimeout(() => _simNibble(level, bait), actualWait);
}

function _simNibble(level, bait) {
  if (_simState !== 'casting') return;
  _simState = 'biting';
  const status  = document.getElementById('sim-status');
  const nibBar  = document.getElementById('sim-nibble-bar');
  const nibFill = document.getElementById('sim-nibble-fill');
  const floatEl = document.getElementById('sim-float');
  if (status)  status.textContent = '⚡ 입질! 빠르게 클릭!';
  if (floatEl) floatEl.textContent = '💦';
  if (nibBar)  nibBar.style.display = '';

  // 반응 시간 바 애니메이션
  const reelTime = Math.max(1500, 3000 - level * 60);
  if (nibFill) {
    nibFill.style.transition = `width ${reelTime}ms linear`;
    nibFill.style.width = '100%';
  }

  clearTimeout(_simTimer);
  _simTimer = setTimeout(() => {
    // 시간 초과 — 놓침
    _simMiss();
  }, reelTime);

  const btn = document.getElementById('sim-cast-btn');
  if (btn) { btn.textContent = '🎣 당기기!'; btn.onclick = () => simReel(level, bait); }
}

function simReel(level, bait) {
  if (_simState !== 'biting') return;
  clearTimeout(_simTimer);
  _simState = 'idle';
  const nibBar = document.getElementById('sim-nibble-bar');
  if (nibBar) nibBar.style.display = 'none';

  // 등급 결정
  const bonus   = (bait === 'rare' ? 15 : bait === 'good' ? 8 : 0) + Math.floor(level / 3);
  const roll    = Math.random() * 100;
  let grade = 'n';
  if      (roll < 2  + bonus * 0.1) grade = 'h';
  else if (roll < 10 + bonus * 0.3) grade = 'r';
  else if (roll < 35 + bonus * 0.5) grade = 'a';

  const FISH_NAMES = {
    n: ['붕어', '잉어', '피라냐', '틸라피아', '메기'],
    a: ['은연어', '참돔', '농어', '넙치', '옥돔'],
    r: ['황금잉어', '블루마린', '금눈돔', '자주복'],
    h: ['전설의 대왕오징어', '심해 아귀', '황제연어'],
  };
  const names = FISH_NAMES[grade];
  const name = names[Math.floor(Math.random() * names.length)];
  const GRADE_LABEL = { n:'일반', a:'고급', r:'희귀', h:'영웅' };
  const GRADE_COLOR = { n:'var(--r-n)', a:'var(--r-a)', r:'var(--r-r)', h:'var(--r-h)' };

  _simCounts[grade]++;
  _simCounts.total++;
  _simLog.unshift({ grade, name, time: new Date().toLocaleTimeString('ko-KR', {hour:'2-digit',minute:'2-digit',second:'2-digit'}) });
  if (_simLog.length > 20) _simLog.pop();

  const status  = document.getElementById('sim-status');
  const floatEl = document.getElementById('sim-float');
  if (status)  { status.innerHTML = `<span style="color:${GRADE_COLOR[grade]};font-weight:900;">[${GRADE_LABEL[grade]}] ${name}</span> 획득!`; }
  if (floatEl) floatEl.textContent = '🐟';

  const btn = document.getElementById('sim-cast-btn');
  if (btn) { btn.textContent = '🎣 던지기'; btn.onclick = simCast; }

  setTimeout(() => { if(floatEl) floatEl.textContent = '🪝'; }, 1000);
  _simRenderLog();
}

function _simMiss() {
  _simState = 'idle';
  const status  = document.getElementById('sim-status');
  const nibBar  = document.getElementById('sim-nibble-bar');
  const nibFill = document.getElementById('sim-nibble-fill');
  const floatEl = document.getElementById('sim-float');
  if (status)  status.textContent = '😔 놓쳤어요... 다시 던지세요.';
  if (nibBar)  nibBar.style.display = 'none';
  if (nibFill) { nibFill.style.transition = 'none'; nibFill.style.width = '0'; }
  if (floatEl) floatEl.textContent = '🪝';
  const btn = document.getElementById('sim-cast-btn');
  if (btn) { btn.textContent = '🎣 던지기'; btn.onclick = simCast; }
}

function simReset() {
  clearTimeout(_simTimer);
  _simState = 'idle';
  _simLog = [];
  _simCounts = { n:0, a:0, r:0, h:0, total:0 };
  const els = ['sim-status','sim-float','sim-nibble-bar','sim-log','sim-stats'];
  const defaults = ['준비됨','🪝','','',''];
  els.forEach((id, i) => { const el = document.getElementById(id); if(el) { if(id==='sim-nibble-bar') el.style.display='none'; else el.innerHTML = defaults[i] || ''; if(id==='sim-status') el.textContent = '준비됨'; if(id==='sim-float') el.textContent = '🪝'; }});
  const btn = document.getElementById('sim-cast-btn');
  if (btn) { btn.textContent = '🎣 던지기'; btn.onclick = simCast; }
}

function _simRenderLog() {
  const logEl   = document.getElementById('sim-log');
  const statsEl = document.getElementById('sim-stats');
  if (!logEl) return;

  const GRADE_COLOR = { n:'var(--r-n)', a:'var(--r-a)', r:'var(--r-r)', h:'var(--r-h)' };
  const GRADE_LABEL = { n:'일반', a:'고급', r:'희귀', h:'영웅' };

  logEl.innerHTML = _simLog.slice(0, 10).map(l => `
    <div class="sim-log-row">
      <span class="sim-log-time">${l.time}</span>
      <span class="sim-log-grade" style="color:${GRADE_COLOR[l.grade]};">[${GRADE_LABEL[l.grade]}]</span>
      <span class="sim-log-name">${l.name}</span>
    </div>`).join('') || '<div style="text-align:center;padding:16px;color:var(--muted);font-size:12px;">아직 낚은 물고기가 없어요</div>';

  if (statsEl && _simCounts.total > 0) {
    statsEl.innerHTML = `
      <div class="sim-stats-row">
        <span>총 ${_simCounts.total}마리</span>
        <span style="color:var(--r-n)">일반 ${_simCounts.n}</span>
        <span style="color:var(--r-a)">고급 ${_simCounts.a}</span>
        <span style="color:var(--r-r)">희귀 ${_simCounts.r}</span>
        <span style="color:var(--r-h)">영웅 ${_simCounts.h}</span>
      </div>`;
  }
}

/* ══════════════════════════════════════════════════
   요리 - 효율 계산기
══════════════════════════════════════════════════ */
function _buildCookCalcPanel() {
  // 요리 원가 DB (기본)
  const COOK_DB = [
    { name:'쌈밥',         grade:'n', base:51,  sell:51  },
    { name:'가스파초',      grade:'n', base:40,  sell:40  },
    { name:'무조림',        grade:'n', base:42,  sell:42  },
    { name:'옥수수 전',     grade:'a', base:44,  sell:44  },
    { name:'데리야끼',      grade:'a', base:55,  sell:55  },
    { name:'세비체',        grade:'r', base:58,  sell:58  },
    { name:'부야베스',      grade:'r', base:68,  sell:68  },
    { name:'에스카베체',    grade:'r', base:65,  sell:65  },
    { name:'양장피',        grade:'h', base:72,  sell:72  },
    { name:'파에야',        grade:'h', base:92,  sell:92  },
    { name:'해산물 그릴 플래터', grade:'h', base:95, sell:95 },
  ];

  const rows = COOK_DB.map(c => {
    const min = Math.floor(c.base * 0.80);
    const max = Math.ceil(c.base * 1.10);
    const GRADE_CLS = { n:'lc-grade-n', a:'lc-grade-a', r:'lc-grade-r', h:'lc-grade-h' };
    const GRADE_LBL = { n:'일반', a:'고급', r:'희귀', h:'영웅' };
    return `<tr>
      <td><span class="lc-grade ${GRADE_CLS[c.grade]}">${GRADE_LBL[c.grade]}</span> ${c.name}</td>
      <td style="font-family:'JetBrains Mono',monospace;text-align:right;">${c.base}셀</td>
      <td style="font-family:'JetBrains Mono',monospace;text-align:right;color:var(--r-r);">${min}셀</td>
      <td style="font-family:'JetBrains Mono',monospace;text-align:right;color:var(--r-a);">${max}셀</td>
      <td style="text-align:right;font-size:10px;color:var(--muted);">${Math.round((max-c.base)/c.base*100)}%↑</td>
    </tr>`;
  }).join('');

  return `
  <div class="life-calc-wrap">
    <div class="life-calc-card">
      <div class="life-calc-hd">📊 요리 수익 계산표</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:16px;line-height:1.7;">
        요리사 상점 기준 · 변동폭: 최대 <span style="color:var(--warn);">-20%</span> ~ <span style="color:var(--counter);">+10%</span>
      </p>
      <div style="overflow-x:auto;">
        <table class="cook-calc-table">
          <thead>
            <tr><th>요리</th><th>원가</th><th>최저가</th><th>최고가</th><th>상승폭</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════
   변동 가격 패널 (낚시/농사/요리 공통)
══════════════════════════════════════════════════ */
function _buildPricePanel(job) {
  const LABELS = { fishing:'물고기', farming:'농작물', cooking:'요리' };
  const label = LABELS[job] || job;
  const FIREBASE_KEY = { fishing:'stella_price_fish', farming:'stella_price_crop', cooking:'stella_price_food' };
  const fbKey = FIREBASE_KEY[job];

  return `
  <div class="life-price-wrap">
    <div class="life-price-hd">
      <span class="life-price-title">💰 ${label} 변동 시세</span>
      <div style="display:flex;align-items:center;gap:10px;">
        <span id="life-price-saved-at" style="font-size:11px;color:var(--muted);"></span>
        <button class="mb-btn" onclick="openLifePriceInput('${job}')">+ 시세 등록</button>
      </div>
    </div>

    <!-- 시세 파싱 입력창 (토글) -->
    <div id="life-price-input-area" style="display:none;margin-bottom:16px;">
      <div class="m-card" style="padding:16px;">
        <p style="font-size:12px;color:var(--muted);margin-bottom:10px;line-height:1.6;">
          디스코드에서 변동 가격 메시지를 복사해 붙여넣으세요.<br>
          <code class="inline-code">📊 ${label} 상점</code> 형태의 메시지를 지원합니다.
        </p>
        <textarea id="life-price-paste" class="char-paste-area" placeholder="디스코드 변동 가격 메시지를 붙여넣으세요..."></textarea>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="mb-btn mb-btn-add" onclick="parseAndSaveLifePrice('${job}')">분석 & 저장</button>
          <button class="mb-btn" onclick="document.getElementById('life-price-input-area').style.display='none'">취소</button>
        </div>
        <div id="life-price-parse-msg" style="font-size:12px;margin-top:8px;min-height:16px;"></div>
      </div>
    </div>

    <!-- 시세 카드 그리드 -->
    <div class="lc-grid" id="life-price-grid">
      <div class="lc-empty">시세 데이터가 없어요.<br>+ 시세 등록 버튼으로 등록해주세요.</div>
    </div>
  </div>`;
}

function openLifePriceInput(job) {
  const area = document.getElementById('life-price-input-area');
  if (area) area.style.display = area.style.display === 'none' ? '' : 'none';
}

function parseAndSaveLifePrice(job) {
  const text = document.getElementById('life-price-paste')?.value || '';
  const msg  = document.getElementById('life-price-parse-msg');
  if (!text.trim()) { if(msg) msg.style.color='var(--warn)', msg.textContent='메시지를 붙여넣어 주세요.'; return; }

  // 파싱
  const items = [];
  const lines = text.split('\n');
  let cur = null;
  for (const raw of lines) {
    const line = raw.replace(/`/g,'').trim();
    if (!line) continue;
    const hm = line.match(/^-\s*\[(.+?)\]\s*(.+)$/);
    if (hm) {
      if (cur) items.push(cur);
      cur = { grade: hm[1].trim(), name: hm[2].trim(), base: null, current: null, diff: null };
      continue;
    }
    if (!cur) continue;
    const baseM    = line.match(/원가\s*[:\uff1a]\s*([\d,]+)/);
    const currM    = line.match(/현재\s*변동가\s*[:\uff1a]\s*([\d,]+)/);
    const diffM    = line.match(/원가\s*대비\s*변동폭\s*[:\uff1a]\s*([+-]?[\d,]+)/);
    if (baseM) cur.base    = parseInt(baseM[1].replace(/,/g,''));
    if (currM) cur.current = parseInt(currM[1].replace(/,/g,''));
    if (diffM) cur.diff    = parseInt(diffM[1].replace(/,/g,''));
  }
  if (cur) items.push(cur);

  if (!items.length) { if(msg) msg.style.color='var(--warn)', msg.textContent='파싱할 수 없는 형식입니다.'; return; }

  const FIREBASE_KEY = { fishing:'stella_price_fish', farming:'stella_price_crop', cooking:'stella_price_food' };
  const fbKey = FIREBASE_KEY[job];
  const payload = { items, savedAt: new Date().toLocaleString('ko-KR', { timeZone:'Asia/Seoul' }) };

  if (window._fbSet) {
    window._fbSet(fbKey, payload).then(() => {
      if (msg) { msg.style.color='var(--counter)'; msg.textContent=`✅ ${items.length}개 항목 저장 완료!`; }
      document.getElementById('life-price-input-area').style.display = 'none';
    });
  } else {
    if (msg) { msg.style.color='var(--warn)'; msg.textContent='Firebase 연결 실패. 잠시 후 다시 시도해주세요.'; }
  }
}

function _renderLifePriceData(job) {
  const FIREBASE_KEY = { fishing:'stella_price_fish', farming:'stella_price_crop', cooking:'stella_price_food' };
  const fbKey = FIREBASE_KEY[job];
  if (!fbKey || !window._fbOn) return;

  window._fbOn(fbKey, data => {
    const grid    = document.getElementById('life-price-grid');
    const savedAt = document.getElementById('life-price-saved-at');
    if (!grid) return;
    if (savedAt && data?.savedAt) savedAt.textContent = data.savedAt + ' 기준';

    const items = data?.items || [];
    if (!items.length) { grid.innerHTML = '<div class="lc-empty">시세 데이터가 없어요.<br>+ 시세 등록 버튼으로 등록해주세요.</div>'; return; }

    const GRADE_CLS = { '커먼':'lc-grade-n','일반':'lc-grade-n','고급':'lc-grade-a','언커먼':'lc-grade-a','희귀':'lc-grade-r','레어':'lc-grade-r','영웅':'lc-grade-h','에픽':'lc-grade-h' };
    grid.innerHTML = items.map(it => {
      const diff  = it.diff ?? (it.current != null && it.base != null ? it.current - it.base : null);
      const pct   = (diff != null && it.base) ? (diff / it.base * 100) : null;
      const sign  = diff != null ? (diff >= 0 ? '+' : '') : '';
      const color = diff == null ? 'var(--muted)' : diff > 0 ? 'var(--counter)' : diff < 0 ? 'var(--warn)' : 'var(--sub)';
      const gcls  = GRADE_CLS[it.grade] || 'lc-grade-n';
      return `
      <div class="lc-card">
        <div class="lc-card-hd">
          <div class="lc-card-img">💰</div>
          <div class="lc-card-meta">
            <div class="lc-card-type"><span class="lc-grade ${gcls}">${it.grade}</span></div>
            <div class="lc-card-name">${it.name}</div>
          </div>
        </div>
        <div style="display:flex;align-items:baseline;justify-content:space-between;margin-top:10px;">
          <div>
            <div style="font-size:10px;color:var(--muted);margin-bottom:2px;">현재가</div>
            <div style="font-size:20px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--text);">${it.current ?? it.base ?? '?'}셀</div>
          </div>
          ${diff != null ? `
          <div style="text-align:right;">
            <div style="font-size:16px;font-weight:900;color:${color};">${sign}${diff}셀</div>
            ${pct != null ? `<div style="font-size:11px;color:${color};font-weight:700;">${sign}${pct.toFixed(1)}%</div>` : ''}
          </div>` : ''}
        </div>
        ${it.base != null ? `<div style="font-size:10px;color:var(--muted);margin-top:6px;">원가: ${it.base}셀</div>` : ''}
      </div>`;
    }).join('');
  });
}
