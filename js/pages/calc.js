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
  if (tab === 'villager') root.innerHTML = _buildVillagerCalc();
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
