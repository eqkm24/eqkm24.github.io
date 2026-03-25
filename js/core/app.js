const TRIAD_DB = {
  helmet: { name:'트라이어드 투구',   base:[1,3], silver:0.2, gold:0.4 },
  chest:  { name:'트라이어드 흉갑',   base:[1,5], silver:0.2, gold:0.5 },
  legs:   { name:'트라이어드 레깅스', base:[1,4], silver:0.2, gold:0.5 },
  boots:  { name:'트라이어드 부츠',   base:[1,3], silver:0.2, gold:0.5 },
};
const FARM_DB = {
  water_copper: { name:'구리 물뿌리개',          type:'물뿌리개', storage:5,  spray:1, range:'1×4' },
  water_iron:   { name:'철 물뿌리개',            type:'물뿌리개', storage:8,  spray:1, range:'2×4' },
  water_gold:   { name:'금 물뿌리개',            type:'물뿌리개', storage:8,  spray:2, range:'3×5' },
  water_triad:  { name:'트라이어드 물뿌리개',    type:'물뿌리개', storage:10, spray:4, range:'3×6' },
  spring_iron:  { name:'철제 스프링클러',        type:'스프링클러', storage:4,  spray:1, range:'기준 1칸', auto:'5틱마다 자동' },
  spring_gold:  { name:'금 스프링클러',          type:'스프링클러', storage:8,  spray:3, range:'기준 2칸', auto:'5틱마다 자동' },
  spring_triad: { name:'트라이어드 스프링클러',  type:'스프링클러', storage:15, spray:3, range:'기준 3칸', auto:'5틱마다 자동' },
};
const ttip = document.getElementById('triad-tip');
let ttHideTimer;
  const triad = e.target.closest('[data-triad]');
  const farm  = e.target.closest('[data-farm]');
  const row   = triad || farm;
  const triad = e.target.closest('[data-triad]');
  const farm  = e.target.closest('[data-farm]');
  const row   = triad || farm;
  const existing = row.querySelector('.mobile-info');
  const html = triad ? buildTriadTip(row.dataset.triad) : buildFarmTip(row.dataset.farm);
  const lastTd = row.querySelector('td:last-child');
  const infoRow = document.createElement('tr');
const SKILL_DB = {
  /* ── 농사 (별의 보주) ── */
  '개간의서약':   { type:'패시브', desc:'경작지 및 화분통 갯수가 증가합니다. 최대 레벨 달성 시 화분통 768개까지 확장 가능합니다.' },
  '풍년의 축복':  { type:'패시브', desc:'3등급·2등급 작물 확률을 낮추고 1등급 확률을 높입니다. 황금 작물 드롭률도 증가합니다.' },
  '비옥한 토양':  { type:'패시브', desc:'작물 수확 시 한 번에 여러 개가 드롭될 확률이 증가합니다.' },
  '수확의 손길':  { type:'액티브', desc:'스킬 사용 시 1×3 형태 범위로 작물을 한 번에 재배·수확할 수 있습니다.' },
  '되뿌리기':     { type:'액티브', desc:'스킬 사용 중 작물 수확 시, 10초 후 인벤토리에 동일 씨앗이 있으면 해당 위치에 자동 재파종됩니다. (왼손에 씨앗을 들고 있어야 발동)' },
  /* ── 낚시 (바다의 보주) ── */
  '보물 감지':    { type:'패시브', desc:'바다 보물을 건질 확률이 레벨당 기본 확률 대비 1.0%씩 증가합니다.' },
  '소문난 미끼':  { type:'패시브', desc:'낚시 성공 시 일정 확률로 발동해 동일한 물고기를 1마리 추가로 낚아 올립니다.' },
  '낚싯줄 장력':  { type:'패시브', desc:'낚시 성공 시 일반 등급 비율이 감소해 고급·희귀 등급 물고기를 더 자주 낚을 수 있습니다.' },
  '떼낚시':       { type:'액티브', desc:'스킬 사용 시 40초 동안 낚시를 완료하는 데 걸리는 시간이 감소합니다.' },
  '쌍걸이':       { type:'액티브', desc:'스킬 사용 시 40초 동안 낚시 성공 시 일정 확률로 낚시가 2회 진행됩니다.' },
  /* ── 채광 (태양의 보주) ── */
  '단련된 곡괭이':{ type:'패시브', desc:'채광 시 데미지가 레벨에 비례하여 일정 비율(%) 증가합니다.' },
  '광맥 감각':    { type:'패시브', desc:'채광 시 광물이 추가로 드롭될 확률이 생깁니다.' },
  '광맥 흐름':    { type:'패시브', desc:'채광 딜레이가 레벨에 비례하여 감소해 더 빠르게 채광할 수 있습니다.' },
  '폭발적인 채광':{ type:'액티브', desc:'스킬 사용 시 채광 진행 시간 동안 성급함(Haste)과 야간 투시 효과를 획득합니다.' },
  '광맥 탐지':    { type:'액티브', desc:'주변 범위를 타원형으로 벽 너머까지 투시해 광물을 탐지하고 채광할 수 있습니다.' },
  /* ── 요리 (대지의 보주) ── */
  '손질 달인':    { type:'패시브', desc:'요리를 만드는 시간이 레벨에 비례하여 감소합니다.' },
  '맛의 균형':    { type:'패시브', desc:'음식의 기본 효과 유지시간이 레벨에 비례하여 증가합니다.' },
  '미식가':       { type:'패시브', desc:'높은 등급의 요리가 완성될 확률이 증가합니다.' },
  '연회 준비':    { type:'액티브', desc:'스킬 사용 시 40초 동안 일정 확률로 요리가 1회 추가 완성됩니다. (최대 1회)' },
  '즉시 완성':    { type:'액티브', desc:'스킬 사용 시 10초 동안 일정 확률로 요리가 즉시 완료됩니다.' },
};
const tip   = document.getElementById('skill-tip');
const tName = document.getElementById('tip-name');
const tType = document.getElementById('tip-type');
let hideTimer;
  const el = e.target.closest('[data-tip]');
  const key  = el.dataset.tip;
  const data = SKILL_DB[key];

function toggleDD(id){
  const menu=document.getElementById(id);
  const wasOpen=menu.classList.contains('dd-open');
  closeDD();
  if(!wasOpen){menu.classList.add('dd-open');const btn=menu.parentElement.querySelector('.nav-pill,.nav-dd-btn');if(btn)btn.classList.add('dd-active','pill-on');}
}

function closeDD(){
  document.querySelectorAll('.nav-dd-menu').forEach(m=>m.classList.remove('dd-open'));
  document.querySelectorAll('.nav-dd-btn,.nav-pill').forEach(b=>b.classList.remove('dd-active','pill-on'));
}

function updateDashboard(){
  const me=document.getElementById('dash-members');
  const ze=document.getElementById('dash-chunks');
  const te=document.getElementById('dash-tribute');
  if(me)me.textContent=members.length;
  if(ze)ze.textContent=Object.keys(zoneData).length;
  if(te){const t=Object.values(tribute).reduce((s,v)=>s+v,0);te.textContent=t.toLocaleString();}
}

function go(tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('on'));
  const pgEl = document.getElementById('pg-' + tab);
  if (pgEl) pgEl.classList.add('on');
  const tabEl = document.querySelector('.nav-tab.t-' + tab);
  if (tabEl) tabEl.classList.add('on');

  // nav pill active 상태
  document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('pill-on'));
  const PILL_MAP = { member:'village',zone:'village',tribute:'village',notice:'village', life:'life', recipe:'recipe' };
  const pillKey = PILL_MAP[tab];
  if (pillKey === 'recipe') document.getElementById('pill-recipe')?.classList.add('pill-on');
  else if (pillKey === 'life') document.getElementById('pill-life')?.classList.add('pill-on');
  if (tab === 'recipe') { const s=document.getElementById('lc-search');if(s)s.value=''; const t=document.getElementById('lc-tabs-row');if(t)t.style.display=''; renderLifecat(); }
  if (tab === 'skill') {
    // pg-skill 없음 → life 페이지 스킬 탭으로
    tab = 'life';
    const pgEl2 = document.getElementById('pg-life');
    if (pgEl2) { document.querySelectorAll('.page').forEach(p=>p.classList.remove('on')); pgEl2.classList.add('on'); }
    initLifePage && initLifePage();
    setTimeout(() => { const skBtn = document.querySelector('.ls-tab[onclick*="skill"]'); if(skBtn) skBtn.click(); }, 50);
    return;
  }
  if (tab === 'life') { initLifePage(); }
  if (tab === 'member') renderMembers();
  if (tab === 'main') {
    updateDashboard();
    renderNoticeWidget && renderNoticeWidget();
    renderPriceTop3 && renderPriceTop3();
    renderUpdateNotes && renderUpdateNotes();
    // 관리자 업데이트 노트 버튼
    const unBtn = document.getElementById('un-admin-btn');
    if (unBtn) unBtn.innerHTML = isAdmin() ? '<button class="m-card-more" onclick="openUpdateNoteModal()">+ 작성</button>' : '';
    // 방문자 카운터
    initVisitorCounter && initVisitorCounter();
    // 저장된 캐릭터 복원
    restoreSavedChar && restoreSavedChar();
  }
  if (tab === 'zone' && !window._zoneInit) { window._zoneInit=true; rebuildZone(); }
  if (tab === 'tribute') renderTribute();
  if (tab === 'notice') { renderNotices(); _updateNoticeAdminBtn && _updateNoticeAdminBtn(); }
  if (tab === 'price') {
    _applyPriceSecState();
    Object.keys(_priceSecOpen).forEach(cat=>{ if(_priceSecOpen[cat]) _buildPricePanel(cat); });
    if(!window._expInit){window._expInit=true;setTimeout(initExpiry,100);}
  }
  if (tab === 'memo') renderMemos();
}

function calc69(sc) { return sc.r*4+sc.uc*2+sc.c; }


function injectStyle(pid) {
  if (document.getElementById('sty-'+pid)) return;
  const s = document.createElement('style'); s.id='sty-'+pid;
  s.textContent=`#psl-${pid}-r::-webkit-slider-thumb{background:var(--sl-r);}#psl-${pid}-r::-webkit-slider-runnable-track{background:linear-gradient(to right,var(--sl-r) var(--pct,0%),var(--b2) var(--pct,0%));border-radius:2px;}#psl-${pid}-uc::-webkit-slider-thumb{background:var(--sl-uc);}#psl-${pid}-uc::-webkit-slider-runnable-track{background:linear-gradient(to right,var(--sl-uc) var(--pct,0%),var(--b2) var(--pct,0%));border-radius:2px;}#psl-${pid}-c::-webkit-slider-thumb{background:var(--sl-c);}#psl-${pid}-c::-webkit-slider-runnable-track{background:linear-gradient(to right,var(--sl-c) var(--pct,0%),var(--b2) var(--pct,0%));border-radius:2px;}`;
  document.head.appendChild(s);
}

function onSlide(pid, type, el) {
  SC[pid][type] = parseInt(el.value);
  trk(el, parseInt(el.value));
  updatePieceHd(pid);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
}

// 저장된 테마 복원
(function() {
  const saved = localStorage.getItem('theme');
  if (saved) document.body.setAttribute('data-theme', saved);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = (saved === 'dark') ? '☀️' : '🌙';
})();

function buildTriadTip(key) {
  const d = TRIAD_DB[key];
  if (!d) return '';
  const maxSilver = d.base[1] + d.silver * 3;
  const maxGold   = d.base[1] + d.gold * 3;
  return `
    <div class="tt-name">${d.name}</div>
    <div class="tt-row"><span class="tt-lbl">기본값</span><span class="tt-val">${d.base[0]} ~ ${d.base[1]}</span></div>
    <div class="tt-row"><span class="tt-lbl"><span class="tt-silver">은별</span> 주괴 1종류당</span><span class="tt-val tt-silver">+${d.silver}</span></div>
    <div class="tt-row"><span class="tt-lbl"><span class="tt-gold">금별</span> 주괴 1종류당</span><span class="tt-val tt-gold">+${d.gold}</span></div>
    <div class="tt-range"><span class="tt-lbl">최대 수치 (금별 3종)</span><span class="tt-val">+${maxGold.toFixed(1)}</span></div>`;
}

function buildFarmTip(key) {
  const d = FARM_DB[key];
  if (!d) return '';
  const typeIcon = d.type === '물뿌리개' ? '💧' : '🌀';
  return `
    <div class="tt-name">${typeIcon} ${d.name}</div>
    <div class="tt-row"><span class="tt-lbl">물 저장</span><span class="tt-val">${d.storage}칸</span></div>
    <div class="tt-row"><span class="tt-lbl">1회 분수량</span><span class="tt-val">${d.spray}</span></div>
    <div class="tt-row"><span class="tt-lbl">범위</span><span class="tt-val">${d.range}</span></div>
    ${d.auto ? `<div class="tt-row"><span class="tt-lbl">작동</span><span class="tt-val" style="color:var(--sl-uc);">${d.auto}</span></div>` : ''}`;
}

function posTriadTip(e) {
  const pad=14, tw=ttip.offsetWidth||280, th=ttip.offsetHeight||120;
  let x=e.clientX+pad, y=e.clientY+pad;
  if(x+tw>window.innerWidth-8) x=e.clientX-tw-pad;
  if(y+th>window.innerHeight-8) y=e.clientY-th-pad;
  ttip.style.left=x+'px'; ttip.style.top=y+'px';
}

function positionTip(e) {
  const pad = 14;
  const tw = tip.offsetWidth  || 260;
  const th = tip.offsetHeight || 80;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  if (x + tw > window.innerWidth  - 8) x = e.clientX - tw - pad;
  if (y + th > window.innerHeight - 8) y = e.clientY - th - pad;
  tip.style.left = x + 'px';
  tip.style.top  = y + 'px';
}

/* ═══ 앱 초기화 — 인증 완료 후 호출됨 ═══ */
function initApp() {
  setTimeout(() => {
    updateAdminUI();
    _initMembersSync();
    _initZoneSync();
    _initTributeSync();
    _initPriceSync();
    if (typeof _initNoticeSync  === 'function') _initNoticeSync();
    if (typeof _initUpdateNotesSync === 'function') _initUpdateNotesSync();
    go('main');
  }, 100);
}
