// ── 주민 페이지 ───────────────────────────────────────────────

var _peopleCurTab = 'recruit';

// 루나위키 이미지
var PEOPLE_IMGS = {
  statBias: 'https://1365047812-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FJn8Ixf7wXQ4SG9sL8RMK%2Fuploads%2FPrsUkIHGGRWfJJ4iyVdL%2F%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-04-13%20132614.png?alt=media&token=e6b8452b-999a-47d3-8719-ce967c93ebf6',
  dispatch:  'https://1365047812-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FJn8Ixf7wXQ4SG9sL8RMK%2Fuploads%2FOVDCF1Zdd8jlElJK2htj%2F%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7%202026-04-13%20135843-Photoroom.png?alt=media&token=36038a14-f5b8-437f-9aff-432831bc5491',
};

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
  if      (tab === 'recruit')  root.innerHTML = _buildRecruitPanel();
  else if (tab === 'hire')     root.innerHTML = _buildHirePanel();
  else if (tab === 'dispatch') root.innerHTML = _buildDispatchPanel();
}

// ── 공통 헬퍼 ────────────────────────────────────────────────
function _sec(title, content) {
  return '<div class="ppl-section">' +
    '<div class="ppl-section-title">' + title + '</div>' +
    content +
  '</div>';
}

function _infoCard(content) {
  return '<div class="card" style="padding:18px 20px;">' + content + '</div>';
}

function _warn(text) {
  return '<div class="ppl-warn">' +
    '<span style="font-size:16px;flex-shrink:0;">⚠️</span>' +
    '<span>' + text + '</span>' +
  '</div>';
}

function _tip(text) {
  return '<div class="ppl-tip">' +
    '<span style="font-size:14px;flex-shrink:0;">💡</span>' +
    '<span>' + text + '</span>' +
  '</div>';
}

// ── 포섭 패널 ────────────────────────────────────────────────
function _buildRecruitPanel() {
  // 음식 등급 카드
  var FOODS = [
    { label:'일반 요리', min:3,  max:6,  icon:'🍚', color:'var(--green)',  dim:'var(--green-dim)'  },
    { label:'일반 일품', min:6,  max:10, icon:'🍜', color:'var(--teal)',   dim:'var(--teal-dim)'   },
    { label:'고급 요리', min:8,  max:14, icon:'🍱', color:'var(--amber)',  dim:'var(--amber-dim)'  },
    { label:'고급 일품', min:15, max:22, icon:'🍣', color:'var(--purple)', dim:'var(--purple-dim)' },
  ];

  var foodCards = '<div class="ppl-food-grid">' +
    FOODS.map(function(f) {
      return '<div class="ppl-food-card" style="border-color:' + f.color + ';background:' + f.dim + ';">' +
        '<div class="ppl-food-icon">' + f.icon + '</div>' +
        '<div class="ppl-food-name" style="color:' + f.color + ';">' + f.label + '</div>' +
        '<div class="ppl-food-range">충전 <strong style="color:' + f.color + ';font-size:16px;">' + f.min + ' ~ ' + f.max + '</strong></div>' +
      '</div>';
    }).join('') +
  '</div>';

  // 스탯 편향 테이블
  var biasRows = [
    ['노련함 버프 음식으로 포섭',         '노련함이 높은 주민으로 스탯 편향'],
    ['감각 버프 음식으로 포섭',           '감각이 높은 주민으로 스탯 편향'],
    ['두 종류를 섞어 급식',               '먹인 비율에 비례하여 두 스탯 모두 상승 확률 ↑'],
    ['바닐라 / 스탯 버프 없는 음식',      '완전 랜덤'],
  ];

  var biasTable = '<div class="card" style="padding:0;overflow:hidden;">' +
    '<table class="skill-table">' +
      '<thead><tr><th>포섭 방식</th><th>결과</th></tr></thead>' +
      '<tbody>' + biasRows.map(function(r) {
        return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>';
      }).join('') + '</tbody>' +
    '</table>' +
  '</div>';

  return (
    _warn('포섭 게이지를 <strong>10분 내에 1,500</strong> 채우지 못하면 초기화됩니다.') +

    _sec('음식 등급별 충전량',
      foodCards +
      _tip('충전량은 같은 등급이어도 <strong>랜덤</strong>으로 결정됩니다. 더 자세한 계산은 <a onclick="go(\'calc\')" style="color:var(--purple);cursor:pointer;text-decoration:underline;">계산기</a>를 활용하세요.')
    ) +

    _sec('스탯 편향 시스템',
      '<p style="font-size:13px;color:var(--sub);line-height:1.7;margin-bottom:14px;">' +
        '포섭에 사용한 음식이 특정 스탯 버프를 가진 경우, 고용된 주민의 <strong>초기 스탯이 해당 방향으로 높게 나올 확률</strong>이 올라갑니다.' +
      '</p>' +
      biasTable +
      _tip('요리의 스탯 <strong>버프 수치</strong> 자체는 편향에 영향을 주지 않습니다. 행운 +1이든 +10이든 동일하게 취급돼요. 중요한 건 <strong>어떤 종류</strong>의 스탯 버프인지입니다.') +
      '<div style="margin-top:14px;border-radius:12px;overflow:hidden;border:1px solid var(--b1);">' +
        '<img src="' + PEOPLE_IMGS.statBias + '" alt="스탯 편향 시스템" style="width:100%;display:block;" loading="lazy">' +
      '</div>'
    )
  );
}

// ── 고용 패널 ────────────────────────────────────────────────
function _buildHirePanel() {
  // 계약서 카드
  var CONTRACTS = [
    {
      name: '주민 계약서 (기본)',
      shop: '잡화 상점 구매',
      color: 'var(--teal)',
      dim:   'var(--teal-dim)',
      icon:  '📜',
      grades: [
        { name: '일반', pct: 100, color: 'var(--teal)' },
      ],
      desc: '가장 기본적인 계약서로, 일반 등급 주민이 확정 고용됩니다.',
    },
    {
      name: '고급 계약서',
      shop: '잡화 상점 구매',
      color: 'var(--purple)',
      dim:   'var(--purple-dim)',
      icon:  '📋',
      grades: [
        { name: '숙련', pct: 70,  color: 'var(--teal)'   },
        { name: '전문', pct: 20,  color: 'var(--blue)'   },
        { name: '장인', pct: 10,  color: 'var(--purple)' },
      ],
      desc: '더 높은 등급의 주민을 고용할 수 있는 계약서입니다.',
    },
  ];

  var contractCards = '<div class="ppl-contract-grid">' +
    CONTRACTS.map(function(c) {
      var gradeBar = c.grades.map(function(g) {
        return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
          '<span style="font-size:12px;font-weight:700;color:' + g.color + ';">' + g.name + '</span>' +
          '<div style="display:flex;align-items:center;gap:8px;flex:1;margin-left:12px;">' +
            '<div style="flex:1;height:6px;background:var(--bg-3);border-radius:999px;overflow:hidden;">' +
              '<div style="width:' + g.pct + '%;height:100%;background:' + g.color + ';border-radius:999px;"></div>' +
            '</div>' +
            '<span style="font-size:12px;font-weight:800;color:' + g.color + ';width:34px;text-align:right;">' + g.pct + '%</span>' +
          '</div>' +
        '</div>';
      }).join('');

      return '<div class="ppl-contract-card" style="border-color:' + c.color + ';">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">' +
          '<span style="font-size:22px;">' + c.icon + '</span>' +
          '<div>' +
            '<div style="font-size:14px;font-weight:800;color:' + c.color + ';">' + c.name + '</div>' +
            '<div style="font-size:11px;color:var(--muted);margin-top:2px;">' + c.shop + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' + gradeBar + '</div>' +
        '<div style="font-size:12px;color:var(--muted);line-height:1.5;">' + c.desc + '</div>' +
      '</div>';
    }).join('') +
  '</div>';

  // 보유 슬롯 테이블
  var SLOTS = [
    { label:'기본 보유',         count:'3명',   cost:'-',        cumul:'-',       color:'var(--teal)'  },
    { label:'4번째 슬롯',        count:'1명 추가', cost:'20만 셀',  cumul:'20만 셀', color:'var(--amber)' },
    { label:'5번째 슬롯',        count:'1명 추가', cost:'35만 셀',  cumul:'55만 셀', color:'var(--amber)' },
    { label:'6번째 슬롯',        count:'1명 추가', cost:'50만 셀',  cumul:'105만 셀',color:'var(--amber)' },
    { label:'7번째 슬롯 (최대)', count:'1명 추가', cost:'95만 셀',  cumul:'200만 셀',color:'var(--red)'   },
  ];

  var slotRows = SLOTS.map(function(s, i) {
    return '<div class="ppl-slot-row' + (i === 0 ? ' ppl-slot-base' : '') + '">' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div class="ppl-slot-dot" style="background:' + s.color + ';"></div>' +
        '<span style="font-size:13px;color:var(--sub);">' + s.label + '</span>' +
      '</div>' +
      '<div style="text-align:right;">' +
        '<div style="font-size:13px;font-weight:800;color:' + s.color + ';">' + s.cost + '</div>' +
        (s.cumul !== '-' ? '<div style="font-size:10px;color:var(--muted);">누적 ' + s.cumul + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');

  return (
    _sec('고용 방법',
      _infoCard(
        '<div class="ppl-steps">' +
          '<div class="ppl-step"><span class="ppl-step-num">1</span><span style="font-size:13px;color:var(--sub);">포섭 완료 상태의 주민에게 <strong style="color:var(--text);">계약서를 손에 들고 우클릭</strong></span></div>' +
          '<div class="ppl-step"><span class="ppl-step-num">2</span><span style="font-size:13px;color:var(--sub);">주민 계약서는 <strong style="color:var(--text);">잡화 상점</strong>에서 구매 가능</span></div>' +
        '</div>'
      )
    ) +

    _sec('계약서 종류별 등급 확률', contractCards) +

    _sec('보유 슬롯 확장',
      '<div class="card" style="padding:16px 20px;">' + slotRows + '</div>' +
      _tip('슬롯 확장 비용은 누적됩니다. 7명까지 모두 해금하려면 총 <strong>200만 셀</strong>이 필요해요.')
    )
  );
}

// ── 파견 패널 ────────────────────────────────────────────────
function _buildDispatchPanel() {
  var DISPATCH = [
    { lv:'Lv 1',       per:'1명', storage:'2개' },
    { lv:'Lv 2 ~ 3',   per:'2명', storage:'2개' },
    { lv:'Lv 4 ~ 5',   per:'3명', storage:'2개' },
    { lv:'Lv 6',       per:'4명', storage:'2개' },
    { lv:'Lv 7 ~ 8',   per:'4명', storage:'3개' },
    { lv:'Lv 9 ~ 10',  per:'5명', storage:'3 ~ 4개' },
    { lv:'Lv 15 ~ 16', per:'6명', storage:'4개' },
    { lv:'Lv 19 ~ 20', per:'7명', storage:'5개' },
  ];

  var tableRows = DISPATCH.map(function(r) {
    return '<tr><td>' + r.lv + '</td><td>' + r.per + '</td><td>' + r.storage + '</td></tr>';
  }).join('');

  return (
    _sec('파견 슬롯',
      '<p style="font-size:13px;color:var(--sub);line-height:1.7;margin-bottom:14px;">' +
        '파견 슬롯은 <strong>마을 레벨</strong>에 따라 자동으로 증가합니다. 공용 식량창고 슬롯도 함께 확장돼요.' +
      '</p>' +
      '<div style="margin-bottom:16px;border-radius:12px;overflow:hidden;border:1px solid var(--b1);">' +
        '<img src="' + PEOPLE_IMGS.dispatch + '" alt="파견 슬롯" style="width:100%;display:block;" loading="lazy">' +
      '</div>' +
      '<div class="card" style="padding:0;overflow:hidden;">' +
        '<table class="skill-table">' +
          '<thead><tr><th>마을 레벨</th><th>1인당 파견 슬롯</th><th>공용 식량창고</th></tr></thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</div>'
    )
  );
}
