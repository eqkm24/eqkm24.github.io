// ── 주민 페이지 ───────────────────────────────────────────────
var _peopleCurTab = 'recruit';

function initPeople() {
  _peopleCurTab = 'recruit';
  _renderPeopleTab('recruit');
}
function switchPeopleTab(tab, el) {
  _peopleCurTab = tab;
  document.querySelectorAll('#people-tabs .people-tab').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  _renderPeopleTab(tab);
}
function _renderPeopleTab(tab) {
  var root = document.getElementById('people-content');
  if (!root) return;
  var map = {
    recruit: _buildRecruitPanel,
    hire:    _buildHirePanel,
    growth:  _buildGrowthPanel,   // 성장 + 승급 합침
    work:    _buildWorkPanel,     // 작업 + 관리 합침
    enhance: _buildEnhancePanel,
  };
  root.innerHTML = (map[tab] || function(){return '';})();
}

// ── 공통 헬퍼 ────────────────────────────────────────────────
function _sec(title, body) {
  return '<div class="ppl-section"><div class="ppl-section-title">' + title + '</div>' + body + '</div>';
}
function _warn(html) {
  return '<div class="ppl-warn">⚠️ <span>' + html + '</span></div>';
}
function _tip(html) {
  return '<div class="ppl-tip">💡 <span>' + html + '</span></div>';
}
function _table(heads, rows) {
  return '<div class="card ppl-table-wrap">' +
    '<table class="ppl-table"><thead><tr>' +
      heads.map(function(h){ return '<th>' + h + '</th>'; }).join('') +
    '</tr></thead><tbody>' +
      rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
      }).join('') +
    '</tbody></table></div>';
}
function _infoBox(html, color) {
  return '<div class="card ppl-info-box" style="border-left:3px solid ' + (color||'var(--purple)') + ';">' + html + '</div>';
}

// ══════════════════════════════════════════════════════════════
// 포섭
// ══════════════════════════════════════════════════════════════
function _buildRecruitPanel() {
  var foods = [
    {label:'일반 요리', min:3,  max:6,  icon:'🍚', c:'var(--green)',  d:'var(--green-dim)'},
    {label:'일반 일품', min:6,  max:10, icon:'🍜', c:'var(--teal)',   d:'var(--teal-dim)'},
    {label:'고급 요리', min:8,  max:14, icon:'🍱', c:'var(--amber)',  d:'var(--amber-dim)'},
    {label:'고급 일품', min:15, max:22, icon:'🍣', c:'var(--purple)', d:'var(--purple-dim)'},
  ];
  var foodGrid = '<div class="ppl-food-grid">' +
    foods.map(function(f){
      return '<div class="ppl-food-card" style="border-color:' + f.c + ';background:' + f.d + ';">' +
        '<div class="ppl-food-icon">' + f.icon + '</div>' +
        '<div class="ppl-food-name" style="color:' + f.c + ';">' + f.label + '</div>' +
        '<div class="ppl-food-range">충전 <strong style="color:' + f.c + ';font-size:18px;">' + f.min + ' ~ ' + f.max + '</strong></div>' +
      '</div>';
    }).join('') +
  '</div>';

  var biasTbl = _table(
    ['포섭 방식', '결과'],
    [
      ['노련함 버프 음식으로 포섭',       '노련함이 높은 주민'],
      ['감각 버프 음식으로 포섭',         '감각이 높은 주민'],
      ['두 종류를 섞어 급식',             '먹인 비율에 비례하여 두 스탯 모두 상승 확률 ↑'],
      ['바닐라 / 스탯 버프 없는 음식',    '완전 랜덤'],
    ]
  );

  return (
    _warn('포섭 게이지를 <strong>10분 내에 1,500</strong> 채우지 못하면 초기화됩니다.') +
    _sec('음식 등급별 충전량',
      foodGrid +
      _tip('필요 수량·비용 계산은 <a onclick="go(\'calc\')" style="color:var(--purple);cursor:pointer;text-decoration:underline;">계산기</a>를 활용하세요.')
    ) +
    _sec('스탯 편향 시스템',
      '<p class="ppl-body-text">사용한 음식의 스탯 버프 <strong>종류</strong>에 따라 고용된 주민의 초기 스탯 방향이 편향됩니다.</p>' +
      biasTbl +
      _tip('버프 수치(+1 vs +10)는 관계없어요. 어떤 <strong>종류</strong>의 스탯 버프인지가 중요합니다.')
    )
  );
}

// ══════════════════════════════════════════════════════════════
// 고용·파견
// ══════════════════════════════════════════════════════════════
function _buildHirePanel() {
  var contractCards = '<div class="ppl-contract-grid">' +
    [
      { icon:'📜', name:'주민 계약서 (기본)', c:'var(--teal)',
        grades:[{n:'일반', p:100, c:'var(--teal)'}],
        desc:'잡화 상점에서 구매. 일반 등급 주민 확정 고용.' },
      { icon:'📋', name:'고급 계약서', c:'var(--purple)',
        grades:[{n:'숙련',p:70,c:'var(--teal)'},{n:'전문',p:20,c:'var(--blue)'},{n:'장인',p:10,c:'var(--purple)'}],
        desc:'잡화 상점에서 구매. 더 높은 등급 주민을 기대할 수 있어요.' },
    ].map(function(c){
      var bars = c.grades.map(function(g){
        return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
          '<span style="font-size:12px;font-weight:700;color:' + g.c + ';width:28px;">' + g.n + '</span>' +
          '<div style="flex:1;height:5px;background:var(--bg-3);border-radius:999px;overflow:hidden;">' +
            '<div style="width:' + g.p + '%;height:100%;background:' + g.c + ';border-radius:999px;"></div>' +
          '</div>' +
          '<span style="font-size:12px;font-weight:800;color:' + g.c + ';width:30px;text-align:right;">' + g.p + '%</span>' +
        '</div>';
      }).join('');
      return '<div class="ppl-contract-card" style="border-color:' + c.c + ';">' +
        '<div class="ppl-contract-name" style="color:' + c.c + ';">' + c.icon + ' ' + c.name + '</div>' +
        bars +
        '<div class="ppl-contract-desc">' + c.desc + '</div>' +
      '</div>';
    }).join('') +
  '</div>';

  var slotTbl = _table(
    ['구분', '비용', '누적'],
    [
      ['기본 3명', '—', '—'],
      ['4번째', '20만 셀', '20만 셀'],
      ['5번째', '35만 셀', '55만 셀'],
      ['6번째', '50만 셀', '105만 셀'],
      ['7번째 (최대)', '95만 셀', '200만 셀'],
    ]
  );

  var dispatchTbl = _table(
    ['마을 레벨', '1인당 파견', '공용 식량창고'],
    [
      ['Lv 1','1명','2개'], ['Lv 2 ~ 3','2명','2개'], ['Lv 4 ~ 5','3명','2개'],
      ['Lv 6','4명','2개'], ['Lv 7 ~ 8','4명','3개'], ['Lv 9 ~ 10','5명','3 ~ 4개'],
      ['Lv 15 ~ 16','6명','4개'], ['Lv 19 ~ 20','7명','5개'],
    ]
  );

  return (
    _sec('고용 방법',
      _infoBox(
        '<div class="ppl-body-text" style="line-height:2;">' +
        '① 포섭 완료 주민에게 <strong>계약서를 손에 들고 우클릭</strong><br>' +
        '② 주민 계약서는 <strong>잡화 상점</strong>에서 구매</div>',
        'var(--teal)'
      )
    ) +
    _sec('계약서 종류', contractCards) +
    _sec('보유 슬롯 확장', slotTbl +
      _tip('7명까지 모두 해금 시 총 <strong>200만 셀</strong>이 필요해요.')
    ) +
    _sec('파견 슬롯 (마을 레벨 기준)', dispatchTbl)
  );
}

// ══════════════════════════════════════════════════════════════
// 성장 + 승급 (합침)
// ══════════════════════════════════════════════════════════════
function _buildGrowthPanel() {
  var gradeTbl = _table(
    ['등급', '최대 레벨', '스킬 슬롯', '최대 식량', '행복도 감소 완화'],
    [
      ['일반', 'Lv 10', '2칸 (최대 Lv2)', '100', '—'],
      ['숙련', 'Lv 20', '3칸 (최대 Lv2)', '120', '15%'],
      ['전문', 'Lv 30', '3칸 (최대 Lv3)', '150', '30%'],
      ['장인', 'Lv 50', '4칸 (최대 Lv3)', '200', '50%'],
    ]
  );

  var statTbl = _table(
    ['스탯', '효과', '성장 방식'],
    [
      ['감각',  '작업 속도 증가',      '레벨업마다 현재 값의 0.2 ~ 0.8% 상승'],
      ['손재주','이동 속도 증가',      '감각과 동일한 비율'],
      ['행운',  '고급 아이템 확률 증가','레벨업마다 고정 +0.5 ~ 1.5'],
      ['노련함','산출량 보너스 증가',   '감각과 동일한 비율'],
    ]
  );

  var initTbl = _table(
    ['등급', '감각', '손재주', '행운', '노련함'],
    [
      ['일반', '1.0 ~ 1.2', '1.0 ~ 1.2', '0 ~ 5',   '2 ~ 4'],
      ['숙련', '1.1 ~ 1.4', '1.1 ~ 1.3', '2 ~ 6',   '3 ~ 7'],
      ['전문', '1.3 ~ 1.7', '1.2 ~ 1.5', '4 ~ 10',  '5 ~ 12'],
      ['장인', '1.5 ~ 2.0', '1.3 ~ 1.8', '8 ~ 16',  '10 ~ 20'],
    ]
  );

  var xpTbl = _table(
    ['작업 종류', '사이클당 기본 XP'],
    [['농사','20'], ['낚시','30'], ['채광','40']]
  );

  var promTbl = _table(
    ['승급 경로', '필요 레벨', '성공률'],
    [
      ['일반 → 숙련', 'Lv 10', '80%'],
      ['숙련 → 전문', 'Lv 20', '60%'],
      ['전문 → 장인', 'Lv 30', '40%'],
    ]
  );

  var promConds = '<div class="card ppl-info-box" style="border-left:3px solid var(--amber);">' +
    '<div class="ppl-body-text" style="line-height:2.2;">' +
    '① 재료 주민은 <strong>파견 중이 아닌 상태</strong>여야 합니다<br>' +
    '② 재료 주민도 <strong>동일한 레벨 조건</strong>을 충족해야 합니다<br>' +
    '③ 재료는 <strong>동일 등급 이상</strong>의 주민만 가능합니다<br>' +
    '④ 승급 버튼 후 GUI에서 재료 주민을 직접 선택합니다' +
    '</div></div>';

  return (
    '<div class="ppl-tab-divider">🤹 성장</div>' +
    _sec('등급별 정보', gradeTbl) +
    _sec('스탯 4종', statTbl) +
    _sec('등급별 초기 스탯 범위', initTbl) +
    _sec('경험치 (사이클당 기본 XP)', xpTbl) +

    '<div class="ppl-tab-divider">🔺 승급</div>' +
    _sec('승급 방식',
      '<p class="ppl-body-text" style="margin-bottom:12px;"><strong>동일 등급 주민 2명</strong>을 합성해 상위 등급으로 승급합니다. 실패 시 <span style="color:var(--red);">재료 주민만 소멸</span>되고 대상 주민은 유지돼요.</p>' +
      promTbl
    ) +
    _sec('승급 조건', promConds)
  );
}

// ══════════════════════════════════════════════════════════════
// 작업 + 관리 (합침)
// ══════════════════════════════════════════════════════════════
function _buildWorkPanel() {
  var workTbl = _table(
    ['작업', '사이클 시간', '이동 시간', '기본 산출', '식량 비용', 'XP'],
    [
      ['농사', '8분', '30초', '4개', '8', '20'],
      ['낚시', '8분', '30초', '1개', '10', '30'],
      ['채광', '12분', '30초', '1개', '12', '40'],
    ]
  );

  var flow = '<div class="ppl-flow">' +
    ['이동 (준비)', '작업', '산출물 생성', '쿨다운', '반복'].map(function(s, i, arr){
      return '<div class="ppl-flow-step">' + s + '</div>' +
        (i < arr.length - 1 ? '<div class="ppl-flow-arrow">→</div>' : '');
    }).join('') +
  '</div>';

  var outputCards = '<div class="ppl-output-grid">' + [
    { icon:'🌾', name:'농사', sub:'12종 × 3등급',
      rows:[['일반','기본 확률','1 ~ 2개'],['고급','행운 비례','1개'],['희귀','매우 희귀','1개']],
      note:'기본 + 해금된 작물만 선택 가능' },
    { icon:'🎣', name:'낚시', sub:'20종+ × 3등급',
      rows:[['일반','기본 확률','최대 2마리'],['고급','행운 비례','1마리'],['희귀','매우 희귀','1마리']],
      note:'기본 + 해금된 어종만 선택 가능' },
    { icon:'⛏', name:'채광', sub:'9종',
      rows:[['바닐라','철·구리·금·다이아·에메랄드·고대 잔해'],['커스텀','아르젠타이트·미스릴·벨리움(최희귀)']],
      note:'최소 6종 이상 선택 필요 / 행운 높을수록 고급 확률 ↑' },
  ].map(function(o){
    var cols = o.rows[0].length === 3 ? ['등급','확률','수량'] : ['구분','광물'];
    return '<div class="card" style="padding:16px;">' +
      '<div style="font-size:15px;font-weight:800;margin-bottom:3px;">' + o.icon + ' ' + o.name + '</div>' +
      '<div style="font-size:11px;color:var(--muted);margin-bottom:12px;">' + o.sub + '</div>' +
      '<table class="ppl-table" style="margin-bottom:10px;"><thead><tr>' +
        cols.map(function(h){ return '<th>' + h + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
        o.rows.map(function(r){ return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table>' +
      '<div style="font-size:11px;color:var(--muted);">' + o.note + '</div>' +
    '</div>';
  }).join('') + '</div>';

  var feedTbl = _table(
    ['음식 종류', '식량 복원', '품질', '행복도'],
    [
      ['바닐라 음식 (빵·스테이크 등)', '1.6 ~ 4.0', '1 ~ 2', '—'],
      ['일반 요리 (쌈밥·전골 등)',     '15',        '2',     '—'],
      ['일반 일품',                    '22',        '3',     '+5'],
      ['고급 요리 (부야베스·파에야)',   '30',        '3',     '+5'],
      ['고급 일품',                    '40',        '4',     '+5'],
    ]
  );

  var happyCols1 = _table(
    ['감소 상황', '감소량'],
    [
      ['작업 사이클마다', '(기본 3 + 연속/30) × 등급저항'],
      ['식량 20% 미만',  '추가 -2'],
      ['식량 0',         '30초마다 -3'],
    ]
  );

  var happyCols2 = _table(
    ['회복 상황', '회복량'],
    [
      ['식량 50% 이상 유지', '사이클당 +1'],
      ['품질 3+ 음식 급식',  '즉시 +5'],
      ['레벨업',             '즉시 +10'],
      ['미파견 대기',        '약 30분에 0→100 완전 회복'],
    ]
  );

  var penaltyBox = _infoBox(
    '<div class="ppl-body-text" style="display:flex;flex-direction:column;gap:8px;">' +
    '<div><span class="tag tag-teal">31 이상</span>&nbsp; 페널티 없음</div>' +
    '<div><span class="tag tag-amber">30 이하</span>&nbsp; 속도 페널티 시작</div>' +
    '<div><span class="tag tag-red">0</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 최대 30% 속도 감소</div>' +
    '<div style="margin-top:4px;font-size:12px;color:var(--muted);">높은 등급일수록 감소가 느립니다. 장인은 일반의 절반 속도로 감소해요.</div>' +
    '</div>', 'var(--amber)'
  );

  return (
    '<div class="ppl-tab-divider">📦 작업</div>' +
    _sec('작업 종류 및 기본 수치', workTbl) +
    _sec('작업 흐름', flow +
      _tip('식량이 0이 되면 자동 중단, 보급 시 재개됩니다. 식량 창고 설정 시 파견 때 자동 급식돼요.')
    ) +
    _sec('산출물 목록', outputCards) +

    '<div class="ppl-tab-divider">🍖 관리</div>' +
    _sec('급식 방법',
      _infoBox(
        '<div class="ppl-body-text" style="line-height:2.2;">' +
        '① <code style="font-size:12px;background:var(--bg-3);padding:1px 6px;border-radius:4px;">/마을 주민</code> → 주민 선택 → 급식 버튼<br>' +
        '② <code style="font-size:12px;background:var(--bg-3);padding:1px 6px;border-radius:4px;">/마을 주민 식량창고</code> 명령어로 바라보는 상자를 창고로 지정<br>' +
        '③ 식량 창고 설정 시 파견 때 <strong>자동 급식</strong>' +
        '</div>', 'var(--green)'
      ) +
      _tip('초반에는 바닐라 음식으로 운영하다가, 중반 이후 커스텀 요리로 전환을 권장합니다.')
    ) +
    _sec('음식 등급별 효과', feedTbl) +
    _sec('행복도 시스템 (범위: 0 ~ 100)',
      '<div class="ppl-2col">' +
        '<div><div class="ppl-col-label">감소 요인</div>' + happyCols1 + '</div>' +
        '<div><div class="ppl-col-label">회복 요인</div>' + happyCols2 + '</div>' +
      '</div>'
    ) +
    _sec('속도 페널티', penaltyBox)
  );
}

// ══════════════════════════════════════════════════════════════
// 강화·스킬
// ══════════════════════════════════════════════════════════════
function _buildEnhancePanel() {
  var equipTbl = _table(
    ['부위', '장비 이름', '스탯 효과'],
    [
      ['투구', '장인의 투구', '노련함 +1 ~ 3'],
      ['흉갑', '장인의 흉갑', '감각 +1 ~ 5'],
      ['각반', '장인의 각반', '손재주 +1 ~ 4'],
      ['장화', '장인의 장화', '행운 +1 ~ 3'],
    ]
  );

  var enhTbl = _table(
    ['강화 단계', '성공 확률', '스탯 상승'],
    [['+1강','85%','+1'],['+2강','65%','+1'],['+3강','50%','+2'],['+4강','25%','+2'],['+5강','10%','+3']]
  );

  var failTbl = _table(
    ['실패 상황', '단계 하락 확률'],
    [['+3강 실패','15%'],['+4강 실패','25%'],['+5강 실패','40%']]
  );

  var setBonus = _infoBox(
    '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px;">4부위 모두 강화 +5 이상일 때 활성화</div>' +
    '<div class="ppl-body-text" style="display:flex;flex-direction:column;gap:7px;">' +
    '<div>⚡ 작업 속도 <strong style="color:var(--teal);">+10%</strong></div>' +
    '<div>🥕 식량 소모 <strong style="color:var(--green);">-15%</strong></div>' +
    '<div>😊 행복도 감소 저항 <strong style="color:var(--purple);">+10%</strong></div>' +
    '</div>', 'var(--amber)'
  );

  var skillTbl = _table(
    ['스킬', 'Lv 1', 'Lv 2', 'Lv 3'],
    [
      ['🌟 풍요의 손길 (산출량 +)',         '+5%', '+12%', '+20%'],
      ['⚡ 숙련된 손놀림 (작업 속도 +)',    '+5%', '+12%', '+20%'],
      ['🍀 행운의 손 (고급 아이템 확률 +)', '+3%', '+7%',  '+12%'],
      ['🥕 소식가 (식량 소모 -)',           '-10%','-22%', '-35%'],
    ]
  );

  var skillLimitTbl = _table(
    ['등급', '배울 수 있는 스킬 수', '최대 강화 레벨'],
    [['일반','2개','Lv 2'],['숙련','3개','Lv 2'],['전문','3개','Lv 3'],['장인','4개','Lv 3']]
  );

  var townSkillTbl = _table(
    ['마을 스킬', 'Lv 1', 'Lv 5'],
    [
      ['⚡ 숙련된 일꾼 (작업 속도 +)',   '+5%', '+35%'],
      ['🌟 풍요로운 수확 (산출량 +)',    '+3%', '+25%'],
      ['🥕 절약의 지혜 (식량 절약)',     '-5%', '-30%'],
      ['🏃 빠른 발걸음 (이동 속도 +)',   '+5%', '+35%'],
    ]
  );

  return (
    _sec('장비 슬롯 (4종)',
      equipTbl +
      _infoBox(
        '<div class="ppl-body-text" style="line-height:1.9;">' +
        '• <strong>제작:</strong> 편백나무 제작대 / 네더라이트 방어구 + 미스릴·아르젠타이트·벨리움 주괴 각 1개<br>' +
        '• 주괴 등급에 따라 추가 스탯 보너스 부여 / 기존 인챈트 전이됨' +
        '</div>', 'var(--teal)'
      )
    ) +
    _sec('장비 강화',
      '<div class="ppl-2col">' +
        '<div><div class="ppl-col-label">강화 확률</div>' + enhTbl + '</div>' +
        '<div><div class="ppl-col-label">실패 시 단계 하락</div>' + failTbl + '</div>' +
      '</div>' +
      _tip('달빛 부적을 보조 재료창에 넣으면 단계 하락을 방지합니다. 강화 성공 시 장비가 <strong>귀속</strong>되며 최대 5회 해제 가능해요.')
    ) +
    _sec('세트 보너스', setBonus) +
    _sec('주민 스킬',
      skillTbl +
      '<div style="margin-top:12px;">' + skillLimitTbl + '</div>' +
      _tip('잔여 스킬 포인트는 승급 후에도 그대로 유지됩니다.')
    ) +
    _sec('마을 스킬',
      townSkillTbl +
      _tip('마을 레벨업 시 포인트 획득, 마을 전체 주민에게 적용됩니다.')
    )
  );
}
