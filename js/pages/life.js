var _curJob    = 'mining';
var _curSubtab = 'skill';

var LIFE_JOBS = {
  mining:  { label:'채광', icon:'⛏', color:'var(--amber)', bouju:'태양의 보주' },
  fishing: { label:'낚시', icon:'🎣', color:'var(--blue)',  bouju:'바다의 보주' },
  farming: { label:'농사', icon:'🌾', color:'var(--green)', bouju:'별의 보주'   },
  cooking: { label:'요리', icon:'🍳', color:'var(--red)',   bouju:'대지의 보주' },
};

var SKILL_DATA = {
  mining: {
    skills: [
      { name:'단련된 곡괭이', type:'P', tier:'Lv.1',
        desc:'채광 시 데미지가 레벨에 비례하여 증가합니다.',
        cols:['레벨','데미지 증가'],
        rows: Array.from({length:30},function(_,i){return [i+1, (i+1)*5+'%'];}) },
      { name:'광맥 감각', type:'P', tier:'Lv.1',
        desc:'채광 시 광물이 추가 드롭될 확률이 레벨당 1%씩 증가합니다.',
        cols:['레벨','추가 드롭 확률'],
        rows: Array.from({length:30},function(_,i){return [i+1, (i+1)+'%'];}) },
      { name:'광맥 흐름', type:'P', tier:'Lv.1',
        desc:'채광 딜레이가 레벨에 비례하여 감소합니다.',
        cols:['레벨','딜레이 감소'],
        rows: Array.from({length:30},function(_,i){return [i+1, (i+1)*5+'%'];}) },
      { name:'폭발적인 채광', type:'A', tier:'Lv.20',
        desc:'스킬 사용 시 성급함(Haste)과 야간 투시 효과를 획득합니다.',
        act:'좌클릭 (보주 착용)', req:'마나 소모', excl:'광맥 탐지',
        cols:['레벨','지속 시간','쿨타임'],
        rows:[['20','15초','60초'],['25','20초','55초'],['30','30초','45초']] },
      { name:'광맥 탐지', type:'A', tier:'Lv.20',
        desc:'주변 범위를 타원형으로 벽 너머까지 투시해 광물을 탐지합니다.',
        act:'우클릭 (보주 착용)', req:'마나 소모', excl:'폭발적인 채광',
        cols:['레벨','탐지 범위','쿨타임'],
        rows:[['20','반경 5블록','120초'],['25','반경 7블록','100초'],['30','반경 10블록','80초']] },
    ],
  },
  fishing: {
    skills: [
      { name:'보물 감지', type:'P', tier:'Lv.1',
        desc:'바다 보물을 건질 확률이 레벨당 1.0%씩 증가합니다.',
        cols:['레벨','보물 확률 증가'],
        rows: Array.from({length:30},function(_,i){return [i+1, '+'+( i+1)+'%'];}) },
      { name:'소문난 미끼', type:'P', tier:'Lv.1',
        desc:'낚시 성공 시 일정 확률로 동일한 물고기를 1마리 추가로 낚습니다.',
        cols:['레벨','추가 낚시 확률'],
        rows: Array.from({length:30},function(_,i){return [i+1, (i+1)*2+'%'];}) },
      { name:'낚싯줄 장력', type:'P', tier:'Lv.1',
        desc:'일반 등급 비율이 감소하여 고급·희귀 물고기를 더 자주 낚습니다.',
        cols:['레벨','일반 감소','고급↑ 증가'],
        rows: Array.from({length:30},function(_,i){return [i+1, '-'+(i+1)+'%', '+'+(i+1)+'%'];}) },
      { name:'떼낚시', type:'A', tier:'Lv.20',
        desc:'40초 동안 낚시 완료 시간이 감소합니다.',
        act:'좌클릭 (보주 착용)', req:'마나 소모', excl:'쌍걸이',
        cols:['레벨','시간 감소','쿨타임'],
        rows:[['20','20%','90초'],['25','30%','75초'],['30','40%','60초']] },
      { name:'쌍걸이', type:'A', tier:'Lv.20',
        desc:'40초 동안 낚시 성공 시 일정 확률로 낚시가 2회 진행됩니다. (더블 캐치)',
        act:'우클릭 (보주 착용)', req:'마나 소모', excl:'떼낚시',
        cols:['레벨','2회 낚시 확률','쿨타임'],
        rows:[['20','25%','90초'],['25','35%','75초'],['30','50%','60초']] },
    ],
  },
  farming: {
    skills: [
      { name:'개간의 서약', type:'P', tier:'Lv.1',
        desc:'스킬 레벨에 따라 경작지와 화분통 수가 증가합니다.',
        cols:['레벨','화분통 수','경작지 수','총 화분통'],
        rows:[
          [0,9,6,1],
          [1,10,0,100],[2,10,4,110],[3,10,8,114],[4,10,8,1],[5,11,2,116],
          [6,11,6,1],[7,12,4,1],[8,12,8,1],[9,13,2,1],[10,13,2,264],
          [11,13,6,272],[12,14,4,0],[13,14,8,288],[14,14,8,296],[15,15,2,304],
          [16,15,6,312],[17,15,6,468],[18,16,0,480],[19,16,4,492],[20,16,8,504],
          [21,17,2,516],[22,17,6,528],[23,18,0,540],[24,18,0,720],[25,18,2,728],
          [26,18,4,736],[27,18,6,744],[28,18,8,752],[29,19,0,760],[30,19,2,768],
        ].map(function(r){return r.map(String);}) },
      { name:'풍년의 축복', type:'P', tier:'Lv.1',
        desc:'1등급 확률을 높이고 황금 작물 드롭률도 증가합니다.',
        cols:['레벨','1등급 증가','황금 드롭'],
        rows: Array.from({length:30},function(_,i){return [i+1, '+'+(i+1)+'%', '+'+((i+1)*0.5).toFixed(1)+'%'];}) },
      { name:'비옥한 토양', type:'P', tier:'Lv.1',
        desc:'수확 시 여러 개가 드롭될 확률이 증가합니다.',
        cols:['레벨','다중 드롭 확률'],
        rows: Array.from({length:30},function(_,i){return [i+1, (i+1)*2+'%'];}) },
      { name:'수확의 손길', type:'A', tier:'Lv.1',
        desc:'스킬 사용 시 범위 내 작물을 한번에 재배·수확합니다.',
        act:'우클릭 (보주 착용)', req:'마나 소모',
        cols:['레벨','범위','쿨타임'],
        rows:[['1','1×3','30초'],['5','1×5','25초'],['10','2×5','20초'],['15','2×7','15초'],['20','3×7','10초'],['30','3×9','8초']] },
      { name:'되뿌리기', type:'A', tier:'Lv.1',
        desc:'수확 후 10초 내 인벤토리에 씨앗이 있으면 자동 재파종됩니다.',
        act:'좌클릭 (보주 착용)', req:'마나 소모',
        cols:['레벨','딜레이','지속 시간'],
        rows:[['1','10초','30초'],['5','8초','40초'],['10','6초','50초'],['15','4초','60초'],['20','2초','90초'],['30','1초','120초']] },
      { name:'비옥한 토양 (추가)', type:'P', tier:'Lv.1',
        desc:'작물 수확 시 씨앗 추가 드롭 확률이 증가합니다.',
        cols:['레벨','씨앗 추가 드롭'],
        rows: Array.from({length:30},function(_,i){return [i+1, (i+1)+'%'];}) },
    ],
  },
  cooking: {
    skills: [
      { name:'손질 달인', type:'P', tier:'Lv.1',
        desc:'요리 제작 시간이 레벨에 비례하여 감소합니다. (노련함 연동)',
        cols:['레벨','제작 시간 감소'],
        rows: Array.from({length:30},function(_,i){return [i+1, (i+1)*3+'%'];}) },
      { name:'맛의 균형', type:'P', tier:'Lv.1',
        desc:'음식 효과 유지시간이 레벨에 비례하여 증가합니다.',
        cols:['레벨','효과 시간 증가'],
        rows: Array.from({length:30},function(_,i){return [i+1, '+'+(i+1)*5+'초'];}) },
      { name:'미식가', type:'P', tier:'Lv.1',
        desc:'높은 등급의 요리가 완성될 확률이 증가합니다. (요리 등급업 확률)',
        cols:['레벨','등급 상향 확률'],
        rows: Array.from({length:30},function(_,i){return [i+1, (i+1)+'%'];}) },
      { name:'즉시 완성', type:'A', tier:'Lv.20',
        desc:'10초 동안 일정 확률로 요리가 즉시 완료됩니다.',
        act:'우클릭 (보주 착용)', req:'마나 소모', excl:'연회 준비',
        cols:['레벨','즉시 완성 확률','쿨타임'],
        rows:[['20','20%','90초'],['25','30%','75초'],['30','50%','60초']] },
      { name:'연회 준비', type:'A', tier:'Lv.20',
        desc:'40초 동안 일정 확률로 요리가 1회 추가 완성됩니다.',
        act:'좌클릭 (보주 착용)', req:'마나 소모', excl:'즉시 완성',
        cols:['레벨','추가 완성 확률','쿨타임'],
        rows:[['20','25%','90초'],['25','35%','75초'],['30','50%','60초']] },
    ],
  },
};

var SMELT_DATA = [
  { name:'미스릴 주괴',      ore:'일반 미스릴 원석',      qty:3, fuel:4, time:'15초',
    prob:'커먼 80% / 언커먼 15% / 레어 5%' },
  { name:'아르젠타이트 주괴', ore:'일반 아르젠타이트 원석', qty:3, fuel:4, time:'15초',
    prob:'커먼 80% / 언커먼 15% / 레어 5%' },
  { name:'벨리움 주괴',      ore:'일반 벨리움 원석',      qty:3, fuel:4, time:'15초',
    prob:'커먼 80% / 언커먼 15% / 레어 5%' },
];

function initLife(job) {
  _curJob    = job || 'mining';
  _curSubtab = 'skill';
  _setPillActive(_curJob);
  _renderSubtabs();
  _renderContent();
}

function switchLifeJob(job, el) {
  _curJob = job;
  _curSubtab = 'skill';
  _setPillActive(job);
  _renderSubtabs();
  _renderContent();
}

function _setPillActive(job) {
  document.querySelectorAll('.life-job-pill').forEach(function(t) {
    t.classList.toggle('active', t.dataset.job === job);
  });
}

function _renderSubtabs() {
  var wrap = document.getElementById('life-sub-tabs');
  if (!wrap) return;
  var tabs = _curJob === 'mining'
    ? [['skill','⚡ 스킬'],['smelt','🔩 제련']]
    : [['skill','⚡ 스킬']];
  wrap.innerHTML = tabs.map(function(t) {
    return '<div class="life-sub-tab' + (_curSubtab === t[0] ? ' active' : '') + '" ' +
      'onclick="switchLifeSubtab(\'' + t[0] + '\',this)">' + t[1] + '</div>';
  }).join('');
}

function switchLifeSubtab(tab, el) {
  _curSubtab = tab;
  document.querySelectorAll('.life-sub-tab').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  _renderContent();
}

function _renderContent() {
  var root = document.getElementById('life-content');
  if (!root) return;
  var job = LIFE_JOBS[_curJob];
  if (!job) return;

  var title = document.getElementById('life-title');
  var sub   = document.getElementById('life-sub');
  if (title) title.textContent = job.label + ' 스킬';
  if (sub)   sub.textContent   = '사용 보주: ' + job.bouju + ' · 기본 Lv.20 / 강화 최대 Lv.30';

  if (_curSubtab === 'smelt') {
    root.innerHTML = _buildSmeltPanel();
  } else {
    root.innerHTML = _buildSkillPanel(_curJob);
  }
}

function _buildSkillPanel(jobKey) {
  var data = SKILL_DATA[jobKey];
  if (!data) return '<div class="empty">데이터가 없습니다.</div>';
  var job  = LIFE_JOBS[jobKey];

  var header = '<div class="card" style="margin-bottom:16px;padding:14px 18px;display:flex;align-items:center;gap:12px;">' +
    '<span style="font-size:24px;">🔮</span>' +
    '<div>' +
      '<div style="font-size:13px;font-weight:700;color:var(--sub);">' + job.label + ' 스킬</div>' +
      '<div style="font-size:12px;color:var(--muted);">사용 보주: <strong style="color:' + job.color + '">' + job.bouju + '</strong> · 기본 Lv.20 / 강화 최대 Lv.30</div>' +
    '</div></div>';

  var cards = data.skills.map(function(sk, idx) {
    var isActive  = sk.type === 'A';
    var exclBadge = sk.excl
      ? '<span class="tag tag-red" style="margin-left:4px;">⚔ 택1: ' + sk.excl + '</span>' : '';
    var actRow = sk.act
      ? '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:10px;font-size:12px;">' +
        '<span><strong style="color:var(--muted)">발동</strong> <span style="color:var(--sub)">' + sk.act + '</span></span>' +
        '<span><strong style="color:var(--muted)">요구</strong> <span style="color:var(--sub)">' + sk.req + '</span></span>' +
        '</div>' : '';

    var rows = sk.rows.map(function(r) {
      return '<tr>' + r.map(function(v) { return '<td>' + v + '</td>'; }).join('') + '</tr>';
    }).join('');

    return '<div class="skill-card" id="sk-' + jobKey + '-' + idx + '">' +
      '<div class="skill-card-hd" onclick="toggleSkill(\'' + jobKey + '\',' + idx + ')">' +
        '<div class="skill-type ' + (isActive ? 'skill-type-a' : 'skill-type-p') + '">' + sk.type + '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="skill-name">' + sk.name + '</div>' +
          '<div class="skill-desc">' + sk.desc + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">' +
          '<span class="tag tag-purple">' + sk.tier + '</span>' +
          exclBadge +
        '</div>' +
        '<span class="skill-arrow">▼</span>' +
      '</div>' +
      '<div class="skill-table-wrap">' +
        actRow +
        '<table class="skill-table">' +
          '<thead><tr>' + sk.cols.map(function(c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>';
  }).join('');

  return header + '<div class="skill-list">' + cards + '</div>';
}

function toggleSkill(job, idx) {
  var card = document.getElementById('sk-' + job + '-' + idx);
  if (card) card.classList.toggle('open');
}

function _buildSmeltPanel() {
  var dex  = parseInt(window._charStats && window._charStats['손재주'] ? window._charStats['손재주'] : 0) || 0;
  var prob = _calcSmeltProb(dex);

  var probCard = '<div class="smelt-prob">' +
    '<div class="smelt-prob-hd">' +
      '<span class="smelt-prob-title">✨ 별 등급 출현 확률</span>' +
      '<span class="smelt-dex-badge">손재주 ' + dex + '</span>' +
    '</div>' +
    '<div style="font-size:11px;color:var(--muted);margin-bottom:12px;">커먼 80% / 언커먼 15% / 레어 5% (기본) · 손재주로 은별·금별 확률 증가</div>' +
    '<div class="smelt-bars">' +
      '<div class="smelt-bar-row">' +
        '<span class="smelt-star" style="color:var(--muted)">커먼</span>' +
        '<div class="smelt-bar-bg smelt-bar-plain"><div class="smelt-bar-fill" style="width:' + prob.plain + '%"></div></div>' +
        '<span class="smelt-pct">' + prob.plain + '%</span>' +
      '</div>' +
      '<div class="smelt-bar-row">' +
        '<span class="smelt-star" style="color:#c0c0c0">언커먼</span>' +
        '<div class="smelt-bar-bg smelt-bar-silver"><div class="smelt-bar-fill" style="width:' + Math.min(prob.silver,100) + '%"></div></div>' +
        '<span class="smelt-pct">' + prob.silver + '%</span>' +
      '</div>' +
      '<div class="smelt-bar-row">' +
        '<span class="smelt-star" style="color:#ffd700">레어</span>' +
        '<div class="smelt-bar-bg smelt-bar-gold"><div class="smelt-bar-fill" style="width:' + Math.min(prob.gold,100) + '%"></div></div>' +
        '<span class="smelt-pct">' + prob.gold + '%</span>' +
      '</div>' +
    '</div>' +
    (dex === 0 ? '<div class="smelt-hint">💡 메인 페이지에서 /생활 정보를 붙여넣으면 손재주 수치가 자동 반영됩니다.</div>' : '') +
    '</div>';

  var cards = SMELT_DATA.map(function(d) {
    return '<div class="recipe-card">' +
      '<div class="recipe-card-hd">' +
        '<div class="recipe-img">🪨</div>' +
        '<div>' +
          '<div class="recipe-name">' + d.name + '</div>' +
          '<div class="recipe-meta">' +
            '<span class="tag tag-teal">⏱ ' + d.time + '</span>' +
            '<span class="tag" style="color:var(--muted);background:var(--bg-3);font-size:10px;">' + d.prob + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="recipe-mats">' +
        '<span class="mat-tag">' + d.ore + ' <span class="mat-qty">×' + d.qty + '</span></span>' +
        '<span class="mat-tag">마그마 블록 <span class="mat-qty">×' + d.fuel + '</span></span>' +
        '<span class="mat-tag" style="color:var(--red);font-size:10px;">🔥 허름한 화로</span>' +
      '</div>' +
    '</div>';
  }).join('');

  return probCard + '<div class="recipe-grid" style="margin-top:16px;">' + cards + '</div>';
}

function _calcSmeltProb(dex) {
  var plain  = 80;
  var silver = 15 + dex * 0.5;
  var gold   = 5  + dex * 0.3;
  var total  = plain + silver + gold;
  return {
    plain:  (plain  / total * 100).toFixed(1),
    silver: (silver / total * 100).toFixed(1),
    gold:   (gold   / total * 100).toFixed(1),
  };
}
