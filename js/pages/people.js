// ── 주민 페이지 ───────────────────────────────────────────────

var _peopleCurTab = 'recruit';

function initPeople() {
  _peopleCurTab = 'recruit';
  _renderPeopleTab('recruit');
}

function switchPeopleTab(tab, el) {
  _peopleCurTab = tab;
  document.querySelectorAll('.people-tab').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  _renderPeopleTab(tab);
}

function _renderPeopleTab(tab) {
  var root = document.getElementById('people-content');
  if (!root) return;
  if (tab === 'recruit') root.innerHTML = _buildRecruitPanel();
  else if (tab === 'hire') root.innerHTML = _buildHirePanel();
  else if (tab === 'dispatch') root.innerHTML = _buildDispatchPanel();
}

// ── 포섭 패널 ────────────────────────────────────────────────
function _buildRecruitPanel() {
  var FOOD_GRADES = [
    { grade: '일반 요리',  min: 3,  max: 6,  color: 'var(--green)',  colorDim: 'var(--green-dim)',  icon: '🍚' },
    { grade: '일반 일품',  min: 6,  max: 10, color: 'var(--teal)',   colorDim: 'var(--teal-dim)',   icon: '🍜' },
    { grade: '고급 요리',  min: 8,  max: 14, color: 'var(--amber)',  colorDim: 'var(--amber-dim)',  icon: '🍱' },
    { grade: '고급 일품',  min: 15, max: 22, color: 'var(--purple)', colorDim: 'var(--purple-dim)', icon: '🍣' },
  ];

  var GAUGE_TOTAL = 1500;

  var gradeCards = FOOD_GRADES.map(function(f) {
    var minCount = Math.ceil(GAUGE_TOTAL / f.max);
    var maxCount = Math.ceil(GAUGE_TOTAL / f.min);
    return (
      '<div class="people-food-card" style="--fc:' + f.color + ';--fcd:' + f.colorDim + ';">' +
        '<div class="people-food-top">' +
          '<span class="people-food-icon">' + f.icon + '</span>' +
          '<div>' +
            '<div class="people-food-name">' + f.grade + '</div>' +
            '<div class="people-food-range">충전량 <strong style="color:' + f.color + ';">' + f.min + ' ~ ' + f.max + '</strong></div>' +
          '</div>' +
        '</div>' +
        '<div class="people-food-count">' +
          '<div class="people-food-count-row">' +
            '<span class="people-food-count-label">최소 필요</span>' +
            '<span class="people-food-count-val" style="color:' + f.color + ';">' + minCount + '개</span>' +
            '<span class="people-food-count-sub">(개당 최대 충전 기준)</span>' +
          '</div>' +
          '<div class="people-food-count-row">' +
            '<span class="people-food-count-label">최대 필요</span>' +
            '<span class="people-food-count-val" style="color:' + f.color + ';">' + maxCount + '개</span>' +
            '<span class="people-food-count-sub">(개당 최소 충전 기준)</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  var statBias = [
    ['노련함 버프 음식으로 포섭', '노련함이 높은 주민'],
    ['감각 버프 음식으로 포섭', '감각이 높은 주민'],
    ['두 종류를 섞어 급식', '먹인 비율에 비례하여 두 스탯 모두 상승 확률 ↑'],
    ['바닐라 / 스탯 버프 없는 음식', '완전 랜덤'],
  ];

  var biasRows = statBias.map(function(r) {
    return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>';
  }).join('');

  return (
    // 경고 배너
    '<div class="people-warn">' +
      '<span style="font-size:16px;">⏱</span>' +
      '<div><strong>10분 제한</strong> — 포섭 게이지를 10분 내에 채우지 못하면 초기화됩니다.</div>' +
    '</div>' +

    // 포섭 게이지
    '<div class="people-gauge-card">' +
      '<div class="people-gauge-label">포섭 게이지</div>' +
      '<div class="people-gauge-bar-wrap">' +
        '<div class="people-gauge-bar"></div>' +
      '</div>' +
      '<div class="people-gauge-val">1,500</div>' +
    '</div>' +

    // 음식 등급 카드
    '<div class="people-section-title">음식 등급별 충전량</div>' +
    '<div class="people-food-grid">' + gradeCards + '</div>' +

    // 계산기 바로가기
    '<div class="people-calc-cta" onclick="go(\'calc\')">' +
      '<span>🧮</span>' +
      '<div>' +
        '<div style="font-weight:700;color:var(--text);">주민 음식 계산기</div>' +
        '<div style="font-size:12px;color:var(--muted);">필요 음식 수량과 예상 비용을 자동으로 계산해드려요</div>' +
      '</div>' +
      '<span style="color:var(--muted);font-size:18px;">→</span>' +
    '</div>' +

    // 스탯 편향
    '<div class="people-section-title" style="margin-top:24px;">스탯 편향 시스템</div>' +
    '<div class="people-note">💡 요리의 스탯 <strong>버프 수치</strong> 자체는 편향에 영향을 주지 않습니다. 어떤 종류의 스탯 버프인지가 중요합니다.</div>' +
    '<div class="card" style="padding:0;overflow:hidden;margin-top:12px;">' +
      '<table class="skill-table">' +
        '<thead><tr><th>포섭 방식</th><th>결과</th></tr></thead>' +
        '<tbody>' + biasRows + '</tbody>' +
      '</table>' +
    '</div>'
  );
}

// ── 고용 패널 ────────────────────────────────────────────────
function _buildHirePanel() {
  var contracts = [
    { name: '주민 계약서 (기본)', prob: '일반 100%',                    color: 'var(--teal)'  },
    { name: '고급 계약서',        prob: '숙련 70% / 전문 20% / 장인 10%', color: 'var(--purple)' },
  ];

  var contractCards = contracts.map(function(c) {
    return (
      '<div class="people-contract-card" style="--fc:' + c.color + ';">' +
        '<div class="people-contract-name" style="color:' + c.color + ';">📜 ' + c.name + '</div>' +
        '<div class="people-contract-prob">' + c.prob + '</div>' +
      '</div>'
    );
  }).join('');

  var slots = [
    { label: '기본 보유',        val: '3명',    cost: '',        color: 'var(--teal)' },
    { label: '4번째 슬롯',       val: '20만 셀', cost: '',       color: 'var(--amber)' },
    { label: '5번째 슬롯',       val: '35만 셀', cost: '',       color: 'var(--amber)' },
    { label: '6번째 슬롯',       val: '50만 셀', cost: '',       color: 'var(--amber)' },
    { label: '7번째 슬롯 (최대)', val: '95만 셀', cost: '',      color: 'var(--red)'   },
  ];

  var slotRows = slots.map(function(s) {
    return (
      '<div class="people-slot-row">' +
        '<span class="people-slot-label">' + s.label + '</span>' +
        '<span class="people-slot-val" style="color:' + s.color + ';">' + s.val + '</span>' +
      '</div>'
    );
  }).join('');

  return (
    '<div class="people-section-title">고용 방법</div>' +
    '<div class="people-steps">' +
      '<div class="people-step"><span class="people-step-num">1</span><span>포섭이 완료된 주민에게 <strong>계약서를 손에 들고 우클릭</strong></span></div>' +
      '<div class="people-step"><span class="people-step-num">2</span><span>주민 계약서는 <strong>잡화 상점</strong>에서 구매 가능</span></div>' +
    '</div>' +

    '<div class="people-section-title" style="margin-top:24px;">계약서 종류</div>' +
    '<div class="people-contract-grid">' + contractCards + '</div>' +

    '<div class="people-section-title" style="margin-top:24px;">보유 슬롯 확장</div>' +
    '<div class="card" style="padding:16px 20px;">' + slotRows + '</div>'
  );
}

// ── 파견 패널 ────────────────────────────────────────────────
function _buildDispatchPanel() {
  var rows = [
    { lv: 'Lv 1',       dispatch: '1명', storage: '2개' },
    { lv: 'Lv 2 ~ 3',   dispatch: '2명', storage: '2개' },
    { lv: 'Lv 4 ~ 5',   dispatch: '3명', storage: '2개' },
    { lv: 'Lv 6',       dispatch: '4명', storage: '2개' },
    { lv: 'Lv 7 ~ 8',   dispatch: '4명', storage: '3개' },
    { lv: 'Lv 9 ~ 10',  dispatch: '5명', storage: '3 ~ 4개' },
    { lv: 'Lv 15 ~ 16', dispatch: '6명', storage: '4개' },
    { lv: 'Lv 19 ~ 20', dispatch: '7명', storage: '5개' },
  ];

  var tableRows = rows.map(function(r) {
    return '<tr><td>' + r.lv + '</td><td>' + r.dispatch + '</td><td>' + r.storage + '</td></tr>';
  }).join('');

  return (
    '<div class="people-section-title">파견 슬롯 (마을 레벨 기준)</div>' +
    '<div class="people-note">🏘 파견 슬롯은 마을 레벨에 따라 증가합니다. 공용 식량창고도 함께 확장돼요.</div>' +
    '<div class="card" style="padding:0;overflow:hidden;margin-top:12px;">' +
      '<table class="skill-table">' +
        '<thead><tr><th>마을 레벨</th><th>1인당 파견 슬롯</th><th>공용 식량창고</th></tr></thead>' +
        '<tbody>' + tableRows + '</tbody>' +
      '</table>' +
    '</div>'
  );
}
