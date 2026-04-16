// ── 계산기 페이지 ────────────────────────────────────────────

var _calcCurTab = 'villager';

function initCalc() {
  _calcCurTab = 'villager';
  _renderCalcTab('villager');
}

function switchCalcTab(tab, el) {
  _calcCurTab = tab;
  document.querySelectorAll('#calc-tabs .people-tab').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  _renderCalcTab(tab);
}

function _renderCalcTab(tab) {
  var root = document.getElementById('calc-content');
  if (!root) return;
  if (tab === 'villager')    root.innerHTML = _buildVillagerCalc();
  else if (tab === 'efficiency') root.innerHTML = _buildVillagerEfficiencyCalc();
}

// ── 주민 음식 계산기 ─────────────────────────────────────────
var FOOD_DATA = [
  { id: 'normal_cook',   label: '일반 요리',  min: 3,  max: 6,  color: 'var(--green)',  icon: '🍚' },
  { id: 'normal_dish',   label: '일반 일품',  min: 6,  max: 10, color: 'var(--teal)',   icon: '🍜' },
  { id: 'advanced_cook', label: '고급 요리',  min: 8,  max: 14, color: 'var(--amber)',  icon: '🍱' },
  { id: 'advanced_dish', label: '고급 일품',  min: 15, max: 22, color: 'var(--purple)', icon: '🍣' },
];

var GAUGE_MAX = 1500;

function _buildVillagerCalc() {
  var foodSelectors = FOOD_DATA.map(function(f) {
    return (
      '<label class="calc-food-chip" id="chip-' + f.id + '" style="--fc:' + f.color + ';">' +
        '<input type="checkbox" id="chk-' + f.id + '" value="' + f.id + '" onchange="calcVillager()">' +
        '<span class="calc-food-chip-icon">' + f.icon + '</span>' +
        '<span class="calc-food-chip-label">' + f.label + '</span>' +
        '<span class="calc-food-chip-range">' + f.min + '~' + f.max + '</span>' +
      '</label>'
    );
  }).join('');

  var priceInputs = FOOD_DATA.map(function(f) {
    return (
      '<div class="calc-price-row" id="price-row-' + f.id + '" style="display:none;">' +
        '<label class="calc-price-label">' +
          '<span style="color:' + f.color + ';">' + f.icon + ' ' + f.label + '</span>' +
          '<span style="color:var(--muted);font-size:11px;"> 개당 가격</span>' +
        '</label>' +
        '<div class="calc-price-input-wrap">' +
          '<input class="input calc-price-input" id="price-' + f.id + '"' +
            ' type="number" min="0" placeholder="0" oninput="calcVillager()">' +
          '<span class="calc-price-unit">셀</span>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  return (
    '<div class="calc-card">' +
      // 헤더
      '<div class="calc-card-hd">' +
        '<div class="calc-card-icon">🥕</div>' +
        '<div>' +
          '<div class="calc-card-title">주민 포섭 음식 계산기</div>' +
          '<div class="calc-card-sub">포섭 게이지 1,500 기준 · 필요 음식 수량과 예상 비용을 계산해요</div>' +
        '</div>' +
      '</div>' +

      // 음식 등급 선택
      '<div class="calc-section-label">사용할 음식 등급 선택</div>' +
      '<div class="calc-food-chips">' + foodSelectors + '</div>' +

      // 가격 입력
      '<div id="calc-price-inputs">' + priceInputs + '</div>' +

      // 결과
      '<div class="calc-result-wrap" id="calc-result-wrap" style="display:none;">' +
        '<div class="calc-result-title">📊 계산 결과</div>' +
        '<div id="calc-result-body"></div>' +
      '</div>' +

      // 빈 상태
      '<div class="calc-empty" id="calc-empty">' +
        '<div style="font-size:32px;margin-bottom:8px;">🥕</div>' +
        '<div style="color:var(--muted);font-size:14px;">사용할 음식 등급을 선택하세요</div>' +
      '</div>' +
    '</div>'
  );
}

function calcVillager() {
  var selected = FOOD_DATA.filter(function(f) {
    return document.getElementById('chk-' + f.id)?.checked;
  });

  // 가격 입력 표시/숨김
  FOOD_DATA.forEach(function(f) {
    var row = document.getElementById('price-row-' + f.id);
    var chip = document.getElementById('chip-' + f.id);
    var checked = document.getElementById('chk-' + f.id)?.checked;
    if (row) row.style.display = checked ? '' : 'none';
    if (chip) chip.classList.toggle('active', checked);
  });

  var empty   = document.getElementById('calc-empty');
  var resWrap = document.getElementById('calc-result-wrap');
  var resBody = document.getElementById('calc-result-body');

  if (!selected.length) {
    if (empty)   empty.style.display   = '';
    if (resWrap) resWrap.style.display = 'none';
    return;
  }
  if (empty)   empty.style.display   = 'none';
  if (resWrap) resWrap.style.display = '';

  // 단일 등급: 바로 계산
  // 복수 등급: 비율 균등 사용 가정 (음식 종류 수 동일)
  // 각 등급별 카드 출력
  var html = '';

  if (selected.length === 1) {
    html = _calcSingle(selected[0]);
  } else {
    html = '<div class="calc-multi-note">💡 여러 등급을 선택하면 각 등급별 단독 사용 시 결과를 보여드려요.</div>';
    html += '<div class="calc-result-grid">';
    selected.forEach(function(f) {
      html += _calcSingleCard(f);
    });
    html += '</div>';
    // 혼합 최적 시나리오
    html += _calcMixedSummary(selected);
  }

  if (resBody) resBody.innerHTML = html;
}

function _getPrice(food) {
  var val = parseFloat(document.getElementById('price-' + food.id)?.value) || 0;
  return val;
}

function _calcSingle(f) {
  var price    = _getPrice(f);
  var minCount = Math.ceil(GAUGE_MAX / f.max);  // 최소 개수 (최대 충전 기준)
  var maxCount = Math.ceil(GAUGE_MAX / f.min);  // 최대 개수 (최소 충전 기준)
  var minCost  = price > 0 ? (minCount * price).toLocaleString() : '-';
  var maxCost  = price > 0 ? (maxCount * price).toLocaleString() : '-';

  return (
    '<div class="calc-result-card" style="--fc:' + f.color + ';">' +
      '<div class="calc-result-card-title">' + f.icon + ' ' + f.label +
        '<span style="font-size:12px;color:var(--muted);font-weight:400;margin-left:8px;">충전 ' + f.min + '~' + f.max + '</span>' +
      '</div>' +
      '<div class="calc-result-rows">' +
        _calcRow('최소 개수', minCount + '개', '개당 최대 ' + f.max + ' 충전', f.color) +
        _calcRow('최대 개수', maxCount + '개', '개당 최소 ' + f.min + ' 충전', f.color) +
        (price > 0 ? (
          _calcRow('최소 비용', minCost + ' 셀', minCount + '개 × ' + price.toLocaleString() + ' 셀', f.color) +
          _calcRow('최대 비용', maxCost + ' 셀', maxCount + '개 × ' + price.toLocaleString() + ' 셀', f.color)
        ) : _calcRowNoPrice()) +
      '</div>' +
    '</div>'
  );
}

function _calcSingleCard(f) {
  var price    = _getPrice(f);
  var minCount = Math.ceil(GAUGE_MAX / f.max);
  var maxCount = Math.ceil(GAUGE_MAX / f.min);
  var minCost  = price > 0 ? (minCount * price).toLocaleString() + ' 셀' : '-';
  var maxCost  = price > 0 ? (maxCount * price).toLocaleString() + ' 셀' : '-';

  return (
    '<div class="calc-result-card" style="--fc:' + f.color + ';">' +
      '<div class="calc-result-card-title">' + f.icon + ' ' + f.label + '</div>' +
      '<div class="calc-result-rows">' +
        _calcRow('최소', minCount + '개', '', f.color) +
        _calcRow('최대', maxCount + '개', '', f.color) +
        _calcRow('최소 비용', minCost, '', f.color) +
        _calcRow('최대 비용', maxCost, '', f.color) +
      '</div>' +
    '</div>'
  );
}

function _calcMixedSummary(selected) {
  // 혼합 시: 각 등급을 균등하게 섞었을 때의 총 개수/비용 범위
  // 최소 개수: 각 등급의 최소 개수 합산 / 등급 수 * 등급 수 (균등 분배 가정)
  // 더 현실적으로: 각 등급의 평균 충전량으로 총 필요 개수 계산
  var avgMin = selected.reduce(function(s,f){return s+f.min;},0) / selected.length;
  var avgMax = selected.reduce(function(s,f){return s+f.max;},0) / selected.length;
  var mixMinCount = Math.ceil(GAUGE_MAX / avgMax);
  var mixMaxCount = Math.ceil(GAUGE_MAX / avgMin);

  var hasAllPrices = selected.every(function(f){ return _getPrice(f) > 0; });
  var mixMinCost = 0, mixMaxCost = 0;

  if (hasAllPrices) {
    var avgPrice = selected.reduce(function(s,f){return s+_getPrice(f);},0) / selected.length;
    mixMinCost = Math.round(mixMinCount * avgPrice);
    mixMaxCost = Math.round(mixMaxCount * avgPrice);
  }

  return (
    '<div class="calc-mixed-card">' +
      '<div class="calc-result-card-title">🔀 혼합 사용 예상</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-bottom:12px;">선택한 ' + selected.length + '종을 균등하게 사용했을 때 평균 예상치예요</div>' +
      '<div class="calc-result-rows">' +
        _calcRow('예상 최소 개수', mixMinCount + '개', '평균 최대 충전 기준', 'var(--purple)') +
        _calcRow('예상 최대 개수', mixMaxCount + '개', '평균 최소 충전 기준', 'var(--purple)') +
        (hasAllPrices ? (
          _calcRow('예상 최소 비용', mixMinCost.toLocaleString() + ' 셀', '', 'var(--purple)') +
          _calcRow('예상 최대 비용', mixMaxCost.toLocaleString() + ' 셀', '', 'var(--purple)')
        ) : '') +
      '</div>' +
    '</div>'
  );
}

function _calcRow(label, val, sub, color) {
  return (
    '<div class="calc-result-row">' +
      '<span class="calc-result-row-label">' + label + '</span>' +
      '<div style="text-align:right;">' +
        '<span class="calc-result-row-val" style="color:' + color + ';">' + val + '</span>' +
        (sub ? '<div style="font-size:10px;color:var(--muted);">' + sub + '</div>' : '') +
      '</div>' +
    '</div>'
  );
}

function _calcRowNoPrice() {
  return (
    '<div style="font-size:12px;color:var(--muted);padding:8px 0;text-align:center;">' +
      '가격을 입력하면 예상 비용을 계산해드려요' +
    '</div>'
  );
}

// ══════════════════════════════════════════════════════════════
// 주민 효율 계산기
// ══════════════════════════════════════════════════════════════

function _buildVillagerEfficiencyCalc() {
  // 주민 등급 선택
  var gradeOptions = [
    { id:'g_normal',  label:'일반', c:'var(--teal)'  },
    { id:'g_skilled', label:'숙련', c:'var(--blue)'  },
    { id:'g_expert',  label:'전문', c:'var(--amber)' },
    { id:'g_master',  label:'장인', c:'var(--purple)'},
  ].map(function(g){
    return '<label class="calc-grade-chip" id="chip-eff-' + g.id + '" style="--fc:' + g.c + ';">' +
      '<input type="radio" name="eff-grade" value="' + g.id + '" onchange="calcEfficiency()">' +
      '<span>' + g.label + '</span>' +
    '</label>';
  }).join('');

  // 작업 종류
  var workOptions = [
    { id:'w_farm',   label:'농사',  icon:'🌾' },
    { id:'w_fish',   label:'낚시',  icon:'🎣' },
    { id:'w_mine',   label:'채광',  icon:'⛏'  },
  ].map(function(w){
    return '<label class="calc-work-chip" id="chip-eff-' + w.id + '">' +
      '<input type="radio" name="eff-work" value="' + w.id + '" onchange="calcEfficiency()">' +
      '<span>' + w.icon + ' ' + w.label + '</span>' +
    '</label>';
  }).join('');

  // 스탯 입력
  var statInputs = [
    { id:'eff-stat-sense',  label:'감각',  icon:'⚡', tip:'작업 속도에 영향', c:'var(--blue)'  },
    { id:'eff-stat-luck',   label:'행운',  icon:'🍀', tip:'고급 아이템 확률에 영향', c:'var(--green)' },
    { id:'eff-stat-skill',  label:'노련함',icon:'🌟', tip:'산출량 보너스에 영향', c:'var(--amber)' },
  ].map(function(s){
    return '<div class="calc-stat-row">' +
      '<div>' +
        '<span style="font-size:12px;font-weight:700;color:' + s.c + ';">' + s.icon + ' ' + s.label + '</span>' +
        '<span style="font-size:11px;color:var(--muted);margin-left:6px;">' + s.tip + '</span>' +
      '</div>' +
      '<div class="calc-price-input-wrap">' +
        '<input class="input calc-price-input" id="' + s.id + '" type="number" min="0" step="0.1" placeholder="0" value="1.0" oninput="calcEfficiency()" style="width:90px;">' +
      '</div>' +
    '</div>';
  }).join('');

  // 주민 스킬 (Lv 0~3)
  var villagerSkills = [
    { id:'vs-yield',  label:'🌟 풍요의 손길',    desc:'산출량 +', vals:[0, 5, 12, 20] },
    { id:'vs-speed',  label:'⚡ 숙련된 손놀림',  desc:'작업 속도 +', vals:[0, 5, 12, 20] },
    { id:'vs-luck',   label:'🍀 행운의 손',       desc:'고급 아이템 +', vals:[0, 3, 7, 12] },
    { id:'vs-food',   label:'🥕 소식가',          desc:'식량 소모 -', vals:[0, 10, 22, 35] },
  ].map(function(sk){
    var opts = sk.vals.map(function(v, i){
      return '<option value="' + i + '">' + (i === 0 ? '미습득' : 'Lv ' + i + ' (' + (v > 0 ? (sk.id==='vs-food'?'-':'+')+v+'%' : '') + ')') + '</option>';
    }).join('');
    return '<div class="calc-skill-row">' +
      '<div>' +
        '<span style="font-size:13px;font-weight:700;color:var(--text);">' + sk.label + '</span>' +
        '<span style="font-size:11px;color:var(--muted);margin-left:6px;">' + sk.desc + '</span>' +
      '</div>' +
      '<select class="input calc-select" id="' + sk.id + '" onchange="calcEfficiency()" style="width:170px;">' + opts + '</select>' +
    '</div>';
  }).join('');

  // 장비 강화
  var equipInputs = [
    { id:'eq-helm',  label:'🪖 투구', stat:'노련함', max:5 },
    { id:'eq-chest', label:'🦺 흉갑', stat:'감각',  max:5 },
    { id:'eq-legs',  label:'👖 각반', stat:'손재주', max:5 },
    { id:'eq-boots', label:'👟 장화', stat:'행운',  max:5 },
  ].map(function(e){
    var opts = Array.from({length:6}, function(_,i){
      return '<option value="' + i + '">+' + i + '강</option>';
    }).join('');
    return '<div class="calc-skill-row">' +
      '<div>' +
        '<span style="font-size:13px;font-weight:700;color:var(--text);">' + e.label + '</span>' +
        '<span style="font-size:11px;color:var(--muted);margin-left:6px;">' + e.stat + '</span>' +
      '</div>' +
      '<select class="input calc-select" id="' + e.id + '" onchange="calcEfficiency()" style="width:100px;">' + opts + '</select>' +
    '</div>';
  }).join('');

  // 마을 스킬 (Lv 0~5)
  var townSkills = [
    { id:'ts-worker', label:'⚡ 숙련된 일꾼', desc:'작업 속도 +', vals:[0,5,11,17,23,35] },
    { id:'ts-harvest',label:'🌟 풍요로운 수확', desc:'산출량 +',   vals:[0,3,7,11,15,25] },
    { id:'ts-food',   label:'🥕 절약의 지혜',  desc:'식량 절약 -', vals:[0,5,11,17,23,30] },
    { id:'ts-move',   label:'🏃 빠른 발걸음',  desc:'이동 속도 +', vals:[0,5,11,17,23,35] },
  ].map(function(sk){
    var opts = sk.vals.map(function(v, i){
      return '<option value="' + i + '">' + (i === 0 ? '미학습' : 'Lv ' + i + ' (' + (v > 0 ? (sk.id==='ts-food'?'-':'+')+v+'%' : '') + ')') + '</option>';
    }).join('');
    return '<div class="calc-skill-row">' +
      '<div>' +
        '<span style="font-size:13px;font-weight:700;color:var(--text);">' + sk.label + '</span>' +
        '<span style="font-size:11px;color:var(--muted);margin-left:6px;">' + sk.desc + '</span>' +
      '</div>' +
      '<select class="input calc-select" id="' + sk.id + '" onchange="calcEfficiency()" style="width:170px;">' + opts + '</select>' +
    '</div>';
  }).join('');

  return (
    '<div class="calc-card">' +

    // 헤더
    '<div class="calc-card-hd">' +
      '<div class="calc-card-icon">📊</div>' +
      '<div>' +
        '<div class="calc-card-title">주민 효율 계산기</div>' +
        '<div class="calc-card-sub">등급 · 스킬 · 장비 · 마을 스킬을 설정하면 예상 효율을 계산해요</div>' +
      '</div>' +
    '</div>' +

    // ① 기본 설정
    '<div class="calc-eff-group">' +
      '<div class="calc-eff-group-title">① 주민 기본 설정</div>' +
      '<div class="calc-section-label">주민 등급</div>' +
      '<div class="calc-grade-chips">' + gradeOptions + '</div>' +
      '<div class="calc-section-label" style="margin-top:14px;">작업 종류</div>' +
      '<div class="calc-grade-chips">' + workOptions + '</div>' +
      '<div class="calc-section-label" style="margin-top:14px;">주민 스탯</div>' +
      statInputs +
    '</div>' +

    // ② 주민 스킬
    '<div class="calc-eff-group">' +
      '<div class="calc-eff-group-title">② 주민 스킬</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-bottom:10px;">레벨업마다 스킬 포인트 1점 획득 · 등급별 배울 수 있는 수 제한</div>' +
      villagerSkills +
    '</div>' +

    // ③ 장비 강화
    '<div class="calc-eff-group">' +
      '<div class="calc-eff-group-title">③ 장비 강화</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-bottom:10px;">강화 단계별 스탯 상승 / +5강 4부위 달성 시 세트 보너스 적용</div>' +
      equipInputs +
      '<label class="calc-set-bonus-check" id="calc-set-bonus-label">' +
        '<input type="checkbox" id="eff-set-bonus" onchange="calcEfficiency()">' +
        '<span>🏆 세트 보너스 적용 (4부위 +5강)</span>' +
        '<span style="font-size:11px;color:var(--muted);margin-left:6px;">속도+10% · 식량-15% · 행복도저항+10%</span>' +
      '</label>' +
    '</div>' +

    // ④ 마을 스킬
    '<div class="calc-eff-group">' +
      '<div class="calc-eff-group-title">④ 마을 스킬</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-bottom:10px;">마을 레벨업 시 포인트 획득 · 전체 주민에게 적용</div>' +
      townSkills +
    '</div>' +

    // 결과
    '<div class="calc-result-wrap" id="eff-result-wrap" style="display:none;">' +
      '<div class="calc-result-title">📊 효율 계산 결과</div>' +
      '<div id="eff-result-body"></div>' +
    '</div>' +

    '<div class="calc-empty" id="eff-empty">' +
      '<div style="font-size:32px;margin-bottom:8px;">📊</div>' +
      '<div style="color:var(--muted);font-size:14px;">등급과 작업 종류를 선택하면 효율을 계산해요</div>' +
    '</div>' +

    '</div>'
  );
}

// ── 효율 계산 로직 ────────────────────────────────────────────
var EFF_GRADE_DATA = {
  g_normal:  { label:'일반', maxLv:10, happyRes:0,   senseRange:[1.0,1.2], luckRange:[0,5],   skillRange:[2,4]  },
  g_skilled: { label:'숙련', maxLv:20, happyRes:0.15, senseRange:[1.1,1.4], luckRange:[2,6],   skillRange:[3,7]  },
  g_expert:  { label:'전문', maxLv:30, happyRes:0.30, senseRange:[1.3,1.7], luckRange:[4,10],  skillRange:[5,12] },
  g_master:  { label:'장인', maxLv:50, happyRes:0.50, senseRange:[1.5,2.0], luckRange:[8,16],  skillRange:[10,20]},
};
var EFF_WORK_DATA = {
  w_farm: { label:'농사', cycle:480, move:30, baseYield:4, foodCost:8,  xp:20, baseRareChance:0.02 },
  w_fish: { label:'낚시', cycle:480, move:30, baseYield:1, foodCost:10, xp:30, baseRareChance:0.03 },
  w_mine: { label:'채광', cycle:720, move:30, baseYield:1, foodCost:12, xp:40, baseRareChance:0.01 },
};
var VS_YIELD_VALS  = [0, 5, 12, 20];
var VS_SPEED_VALS  = [0, 5, 12, 20];
var VS_LUCK_VALS   = [0, 3, 7, 12];
var VS_FOOD_VALS   = [0, 10, 22, 35];
var TS_WORKER_VALS = [0, 5, 11, 17, 23, 35];
var TS_HARVEST_VALS= [0, 3, 7, 11, 15, 25];
var TS_FOOD_VALS   = [0, 5, 11, 17, 23, 30];
var EQ_STAT_PER_LV = { 'eq-helm':[[0],[1],[2],[3],[5],[8]], 'eq-chest':[[0],[1],[3],[5],[7],[10]], 'eq-legs':[[0],[1],[2],[4],[6],[9]], 'eq-boots':[[0],[1],[2],[3],[5],[8]] };

function _getVal(id) {
  var el = document.getElementById(id);
  return el ? parseFloat(el.value) || 0 : 0;
}
function _getIntVal(id) {
  var el = document.getElementById(id);
  return el ? parseInt(el.value) || 0 : 0;
}

function calcEfficiency() {
  var gradeEl = document.querySelector('input[name="eff-grade"]:checked');
  var workEl  = document.querySelector('input[name="eff-work"]:checked');

  // chip 활성화
  document.querySelectorAll('.calc-grade-chip,.calc-work-chip').forEach(function(c){ c.classList.remove('active'); });
  if (gradeEl) gradeEl.closest('label')?.classList.add('active');
  if (workEl)  workEl.closest('label')?.classList.add('active');

  var empty   = document.getElementById('eff-empty');
  var resWrap = document.getElementById('eff-result-wrap');

  if (!gradeEl || !workEl) {
    if (empty)   empty.style.display   = '';
    if (resWrap) resWrap.style.display = 'none';
    return;
  }
  if (empty)   empty.style.display   = 'none';
  if (resWrap) resWrap.style.display = '';

  var grade = EFF_GRADE_DATA[gradeEl.value];
  var work  = EFF_WORK_DATA[workEl.value];

  // 스탯
  var sense  = _getVal('eff-stat-sense')  || 1.0;
  var luck   = _getVal('eff-stat-luck')   || 1.0;
  var skillS = _getVal('eff-stat-skill')  || 1.0;

  // 주민 스킬
  var vsYield = VS_YIELD_VALS[_getIntVal('vs-yield')]  / 100;
  var vsSpeed = VS_SPEED_VALS[_getIntVal('vs-speed')]  / 100;
  var vsLuck  = VS_LUCK_VALS[_getIntVal('vs-luck')]    / 100;
  var vsFood  = VS_FOOD_VALS[_getIntVal('vs-food')]    / 100;

  // 장비 강화 (스탯 추가)
  var eqLuck  = _getIntVal('eq-boots') > 0 ? _getIntVal('eq-boots') : 0;  // +n강 = luck 상승
  var eqSense = _getIntVal('eq-chest') > 0 ? _getIntVal('eq-chest') : 0;
  var eqSkill = _getIntVal('eq-helm')  > 0 ? _getIntVal('eq-helm')  : 0;

  // 세트 보너스
  var setBonus = document.getElementById('eff-set-bonus')?.checked || false;

  // 마을 스킬
  var tsWorker  = TS_WORKER_VALS[_getIntVal('ts-worker')]  / 100;
  var tsHarvest = TS_HARVEST_VALS[_getIntVal('ts-harvest')] / 100;
  var tsFood    = TS_FOOD_VALS[_getIntVal('ts-food')]      / 100;

  // ── 계산 ────────────────────────────────────────────────────
  // 작업 속도 배율 (감각 기반 + 스킬 + 마을스킬 + 세트보너스)
  var speedMult = 1 + (sense - 1) * 0.5 + vsSpeed + tsWorker + (setBonus ? 0.10 : 0);

  // 실제 사이클 시간 (초)
  var actualCycle = Math.max(60, work.cycle / speedMult);
  var totalTime   = actualCycle + work.move;  // 이동 포함 총 시간

  // 산출량 배율 (노련함 기반 + 스킬 + 마을스킬)
  var yieldMult = 1 + (skillS - 1) * 0.3 + vsYield + tsHarvest;

  // 사이클당 산출
  var perCycleYield = work.baseYield * yieldMult;

  // 시간당 산출 (3600초)
  var cyclesPerHour = 3600 / totalTime;
  var yieldPerHour  = perCycleYield * cyclesPerHour;

  // 8시간 산출
  var yieldPer8h = yieldPerHour * 8;

  // 고급 아이템 확률 (행운 기반 + 스킬 보정)
  var effectiveLuck   = luck + eqLuck * 0.5;
  var rareChance      = Math.min(60, work.baseRareChance * 100 + effectiveLuck * 0.5 + vsLuck * 100);

  // 식량 소모 (사이클당)
  var foodPerCycle = work.foodCost * (1 - vsFood) * (1 - tsFood) * (setBonus ? 0.85 : 1);
  var foodPerHour  = foodPerCycle * cyclesPerHour;
  var foodPer8h    = foodPerHour * 8;

  // 하루 작업 가능 사이클 (식량 한계 기준)
  var maxFood  = grade.maxLv >= 50 ? 200 : grade.maxLv >= 30 ? 150 : grade.maxLv >= 20 ? 120 : 100;
  var maxCycles = maxFood / foodPerCycle;
  var maxWorkTime = maxCycles * totalTime / 3600;

  // 결과 렌더
  var body = document.getElementById('eff-result-body');
  if (!body) return;

  var col = function(label, val, sub, color) {
    return '<div class="calc-eff-stat">' +
      '<div class="calc-eff-stat-val" style="color:' + (color||'var(--text)') + ';">' + val + '</div>' +
      '<div class="calc-eff-stat-label">' + label + '</div>' +
      (sub ? '<div class="calc-eff-stat-sub">' + sub + '</div>' : '') +
    '</div>';
  };

  var speedPct = ((speedMult - 1) * 100).toFixed(1);
  var yieldPct = ((yieldMult - 1) * 100).toFixed(1);

  body.innerHTML =
    // 요약 스탯 그리드
    '<div class="calc-eff-stat-grid">' +
      col('작업 속도', '+' + speedPct + '%', grade.label + ' · ' + work.label, 'var(--teal)') +
      col('산출량 보너스', '+' + yieldPct + '%', '기본 대비', 'var(--green)') +
      col('고급 아이템', rareChance.toFixed(1) + '%', '확률', 'var(--amber)') +
      col('사이클 시간', Math.round(totalTime) + '초', '이동 포함', 'var(--blue)') +
    '</div>' +

    // 시간별 산출
    '<div class="calc-eff-time-grid">' +
      '<div class="calc-eff-time-card">' +
        '<div class="calc-eff-time-label">⏱ 1시간</div>' +
        '<div class="calc-eff-time-val" style="color:var(--purple);">' + yieldPerHour.toFixed(1) + '개</div>' +
        '<div class="calc-eff-time-sub">식량 ' + foodPerHour.toFixed(1) + ' 소모</div>' +
      '</div>' +
      '<div class="calc-eff-time-card">' +
        '<div class="calc-eff-time-label">⏱ 8시간</div>' +
        '<div class="calc-eff-time-val" style="color:var(--purple);">' + yieldPer8h.toFixed(1) + '개</div>' +
        '<div class="calc-eff-time-sub">식량 ' + foodPer8h.toFixed(1) + ' 소모</div>' +
      '</div>' +
      '<div class="calc-eff-time-card">' +
        '<div class="calc-eff-time-label">🥕 최대 식량 기준</div>' +
        '<div class="calc-eff-time-val" style="color:var(--amber);">' + maxWorkTime.toFixed(1) + '시간</div>' +
        '<div class="calc-eff-time-sub">급식 없이 연속 작업</div>' +
      '</div>' +
    '</div>' +

    // 세트보너스 표시
    (setBonus ?
      '<div class="calc-eff-bonus-badge">🏆 세트 보너스 적용 중 — 속도 +10% · 식량 -15% · 행복도 저항 +10%</div>'
    : '') +

    // 적용 버프 요약
    '<div class="calc-eff-buff-list">' +
      '<div class="calc-eff-buff-title">적용된 버프 요약</div>' +
      '<div class="calc-eff-buffs">' +
        (vsSpeed  > 0 ? '<span class="tag tag-teal">숙련된 손놀림 +' + (vsSpeed*100).toFixed(0) + '%</span>' : '') +
        (vsYield  > 0 ? '<span class="tag tag-green">풍요의 손길 +' + (vsYield*100).toFixed(0) + '%</span>' : '') +
        (vsLuck   > 0 ? '<span class="tag tag-amber">행운의 손 +' + (vsLuck*100).toFixed(0) + '%</span>' : '') +
        (vsFood   > 0 ? '<span class="tag tag-red">소식가 -' + (vsFood*100).toFixed(0) + '%</span>' : '') +
        (tsWorker > 0 ? '<span class="tag tag-teal">일꾼 +' + (tsWorker*100).toFixed(0) + '%</span>' : '') +
        (tsHarvest> 0 ? '<span class="tag tag-green">수확 +' + (tsHarvest*100).toFixed(0) + '%</span>' : '') +
        (tsFood   > 0 ? '<span class="tag tag-red">절약 -' + (tsFood*100).toFixed(0) + '%</span>' : '') +
        (setBonus     ? '<span class="tag tag-amber">세트 보너스</span>' : '') +
      '</div>' +
    '</div>';
}
