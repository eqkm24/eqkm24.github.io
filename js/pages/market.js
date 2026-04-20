// ── 거래장 ────────────────────────────────────────────────────
// DB: stella_market
//   type   : 'farmer' | 'fisher' | 'cook_request'
//   status : 'open' | 'bought' | 'done'
//   items  : [{ name, grade, qty, unit }]  unit: 'shulker'|'set'|'개'

var _marketData = {};
var _marketTab  = 'board';

// ── 작물 목록 (루나위키 이미지 포함) ─────────────────────────
var CROP_ITEMS = [
  { name:'오렌지',    seasons:'봄·가을',   icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FX8AMRAo6Jqtwzqyh6N1e%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152716-removebg-preview.png%3Falt%3Dmedia%26token%3D6605e8e3-224b-460f-98a3-89fc1b348140&width=64&dpr=1&quality=100&sign=579a073c&sv=2' },
  { name:'무',      seasons:'가을·겨울', icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FEu47WPnGBddR15IHax3m%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152703-removebg-preview.png%3Falt%3Dmedia%26token%3D865fa1a6-cf9f-42d2-961f-f90f765ed8ec&width=64&dpr=1&quality=100&sign=769ab075&sv=2' },
  { name:'바나나',  seasons:'여름·가을', icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FdOdmQ6V3rZUaLNmCOtOq%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_153327-removebg-preview.png%3Falt%3Dmedia%26token%3D71c6369f-4832-497b-9a6e-c31aaed395f4&width=64&dpr=1&quality=100&sign=a3a1d1e6&sv=2' },
  { name:'딸기',    seasons:'봄·여름',   icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FJcTwOeLasuJ4PgQ3f5XC%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152734-removebg-preview.png%3Falt%3Dmedia%26token%3D4b0e6295-23fa-4487-9bc2-8f80ccb293e5&width=64&dpr=1&quality=100&sign=3f034202&sv=2' },
  { name:'상추',    seasons:'봄·여름',   icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FLqmvbDJGEzhrfPbJjoBV%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152659-removebg-preview.png%3Falt%3Dmedia%26token%3D7140e570-e260-40c7-b28a-3054aaa2519a&width=64&dpr=1&quality=100&sign=190c0891&sv=2' },
  { name:'석류',    seasons:'가을·겨울', icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FX9OrITIDl9404YpJpCxZ%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152730-removebg-preview.png%3Falt%3Dmedia%26token%3Dc6b71855-75e7-48b2-8627-b3bc5e604573&width=64&dpr=1&quality=100&sign=90be7902&sv=2' },
  { name:'레몬',  seasons:'여름·겨울', icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252Ft2wL3KwQID34bDB6z2PL%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152653-removebg-preview.png%3Falt%3Dmedia%26token%3D5207838e-ac2b-4c11-a14e-5820b161028e&width=64&dpr=1&quality=100&sign=eec127b9&sv=2' },
  { name:'옥수수',  seasons:'봄·여름',   icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FBDSLWSHKFYDNkWyYcMRd%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152707-removebg-preview.png%3Falt%3Dmedia%26token%3D6dbba4de-9ca2-4563-baf7-55803116c945&width=64&dpr=1&quality=100&sign=f711dde2&sv=2' },
  { name:'양배추',  seasons:'가을·겨울', icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FkFLUMnq5wsVrVzMl6dyx%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152712-removebg-preview.png%3Falt%3Dmedia%26token%3D79a5128e-bfeb-4d06-8803-28f84e5d60d2&width=64&dpr=1&quality=100&sign=6c3f14ef&sv=2' },
  { name:'토마토',  seasons:'여름·가을', icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FnUKl1WApsRMpeeZr3TpF%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152738-removebg-preview.png%3Falt%3Dmedia%26token%3D1453e6d8-e144-421c-8447-53893c04607a&width=64&dpr=1&quality=100&sign=733cff62&sv=2' },
  { name:'파인애플',seasons:'여름·가을', icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FEm4HCIBNGzy1VQorqAFo%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152721-removebg-preview.png%3Falt%3Dmedia%26token%3D7a174e53-7d79-41cd-aaa5-0ce1cb2ef615&width=64&dpr=1&quality=100&sign=6ddb715b&sv=2' },
  { name:'포도',    seasons:'겨울·가을', icon:'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FE4moEisz9jpxy8wIz08v%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_152725-removebg-preview.png%3Falt%3Dmedia%26token%3D577d847d-2752-4803-8250-a1e2390421ec&width=64&dpr=1&quality=100&sign=38eddffe&sv=2' },
];

// ── 물고기 목록 (가나다순) ───────────────────────────────────
var FISH_ITEMS = [
  '개복치','강꼬치고기','금붕어','농어','다랑어','랍스터',
  '만타 가오리','메기','문어','뱀장어','블루탱','숭어',
  '습지 개구리','아귀','연어','잉어','잡어','적색퉁돔',
  '정어리','줄돔','철갑상어','푸른 해파리','흰동가리',
];

// ── 헬퍼 ─────────────────────────────────────────────────────
function _statusBadge(status) {
  var m = {
    open:   '<span class="tag tag-teal">🟢 등록중</span>',
    bought: '<span class="tag tag-amber">🛒 구매됨</span>',
    done:   '<span class="tag" style="background:var(--bg-3);color:var(--muted);">✅ 완료</span>',
  };
  return m[status] || '';
}
function _typeBadge(type) {
  if (type === 'farmer')       return '<span class="tag" style="background:var(--green-dim);color:var(--green);">🌾 농부 재고</span>';
  if (type === 'fisher')       return '<span class="tag" style="background:var(--blue-dim,var(--teal-dim));color:var(--blue,var(--teal));">🎣 어부 재고</span>';
  if (type === 'cook_request') return '<span class="tag" style="background:var(--amber-dim);color:var(--amber);">🍳 요리사 요청</span>';
  return '';
}
function _fmtTime(ts) {
  if (!ts) return '';
  var d = new Date(ts);
  var pad = function(n){ return String(n).padStart(2,'0'); };
  return d.getFullYear() + '.' + pad(d.getMonth()+1) + '.' + pad(d.getDate())
    + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function _relTime(ts) {
  if (!ts) return '';
  var diff = (Date.now() - ts) / 1000;
  if (diff < 60)    return '방금 전';
  if (diff < 3600)  return Math.floor(diff/60) + '분 전';
  if (diff < 86400) return Math.floor(diff/3600) + '시간 전';
  return Math.floor(diff/86400) + '일 전';
}
function _unitLabel(unit) {
  if (unit === 'shulker') return '셜커';
  if (unit === 'set')     return '셋';
  return '개';
}

// ── 초기화 ───────────────────────────────────────────────────
function initMarket() {
  _marketTab = 'board';
  window.$db.on('stella_market', function(val) {
    _marketData = val || {};
    _renderMarketTab(_marketTab);
  });
}
function switchMarketTab(tab, el) {
  _marketTab = tab;
  document.querySelectorAll('#market-tabs .people-tab').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  _renderMarketTab(tab);
}
function _renderMarketTab(tab) {
  var root = document.getElementById('market-content');
  if (!root) return;
  if      (tab === 'board')   root.innerHTML = _buildBoard();
  else if (tab === 'request') root.innerHTML = _buildRequestForm();
  else if (tab === 'history') root.innerHTML = _buildHistory();
}

// ══════════════════════════════════════════════════════════════
// 거래 현황 보드
// ══════════════════════════════════════════════════════════════
function _buildBoard() {
  var all = Object.entries(_marketData).filter(function(e){ return e[1] && e[1].status !== 'done'; });
  var cookReqs = all.filter(function(e){ return e[1].type === 'cook_request'; })
                    .sort(function(a,b){ return (b[1].createdAt||0)-(a[1].createdAt||0); });
  var others   = all.filter(function(e){ return e[1].type !== 'cook_request'; })
                    .sort(function(a,b){ return (b[1].createdAt||0)-(a[1].createdAt||0); });

  if (!all.length) {
    return '<div class="empty"><div style="font-size:36px;margin-bottom:10px;">🌾</div>' +
      '<div style="color:var(--muted);">현재 등록된 재고가 없어요.</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:6px;">재고 등록 탭에서 새 항목을 올려보세요!</div></div>';
  }

  var openCnt   = all.filter(function(e){ return e[1].status==='open'; }).length;
  var boughtCnt = all.filter(function(e){ return e[1].status==='bought'; }).length;
  var statsHtml =
    '<div class="market-stats">' +
      '<div class="market-stat"><div class="market-stat-val" style="color:var(--teal);">' + openCnt + '</div><div class="market-stat-label">등록중</div></div>' +
      '<div class="market-stat"><div class="market-stat-val" style="color:var(--amber);">' + boughtCnt + '</div><div class="market-stat-label">구매됨</div></div>' +
      '<div class="market-stat"><div class="market-stat-val">' + all.length + '</div><div class="market-stat-label">전체</div></div>' +
    '</div>';

  function _card(entry, highlight) {
    var id = entry[0], d = entry[1];
    var itemsHtml = (d.items || []).map(function(it) {
      var gradeStr = it.grade ? ' <span style="font-size:10px;color:var(--amber);">(' + it.grade + ')</span>' : '';
      var unitStr  = it.qty ? ' <span class="mat-qty">×' + it.qty + _unitLabel(it.unit) + '</span>' : '';
      return '<span class="mat-tag">' + it.name + gradeStr + unitStr + '</span>';
    }).join('');
    var actionBtns = '';
    if (d.status === 'open') {
      actionBtns = '<button class="btn btn-sm btn-primary" onclick="marketBuy(\'' + id + '\')">🛒 구매</button>';
    } else if (d.status === 'bought') {
      actionBtns = '<button class="btn btn-sm" style="background:var(--green-dim);color:var(--green);border-color:var(--green);" onclick="marketDone(\'' + id + '\')">✅ 완료</button>';
    }
    var cardStyle = highlight ? 'border:2px solid var(--amber);background:color-mix(in srgb,var(--amber-dim) 60%,transparent);' : '';
    return '<div class="market-card" style="' + cardStyle + '">' +
      '<div class="market-card-hd">' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' + _typeBadge(d.type) + _statusBadge(d.status) + '</div>' +
        '<span style="font-size:11px;color:var(--muted);">' + _relTime(d.createdAt) + '</span>' +
      '</div>' +
      '<div class="market-card-from"><span style="font-size:14px;font-weight:800;color:var(--text);">' + (d.from||'?') + '</span></div>' +
      '<div class="market-card-items">' + (itemsHtml || '<span style="color:var(--muted);font-size:12px;">품목 미지정</span>') + '</div>' +
      (d.note ? '<div class="market-card-note">' + d.note + '</div>' : '') +
      (actionBtns ? '<div class="market-card-actions">' + actionBtns + '</div>' : '') +
    '</div>';
  }

  var html = statsHtml;
  if (cookReqs.length) {
    html += '<div class="market-section-title">🍳 요리사 요청 — 우선 확인해주세요</div>' +
      '<div class="market-grid">' + cookReqs.map(function(e){ return _card(e, true); }).join('') + '</div>';
  }
  if (others.length) {
    html += '<div class="market-section-title" style="margin-top:16px;">🌾🎣 농부 · 어부 재고</div>' +
      '<div class="market-grid">' + others.map(function(e){ return _card(e, false); }).join('') + '</div>';
  }
  return html;
}

// ══════════════════════════════════════════════════════════════
// 재고 등록 폼
// ══════════════════════════════════════════════════════════════
function _buildRequestForm() {
  var memberNames = (window.members||[]).map(function(m){ return m.name||m.mc; }).filter(Boolean);
  var memberOpts  = memberNames.map(function(n){ return '<option value="' + n + '">' + n + '</option>'; }).join('');

  var cropChips = CROP_ITEMS.map(function(c) {
    return '<label class="market-item-chip" title="제철: ' + c.seasons + '">' +
      '<input type="checkbox" name="mkt-crop" value="' + c.name + '" onchange="marketUpdateItems()">' +
      '<img src="' + c.icon + '" alt="' + c.name + '" loading="lazy" onerror="this.style.display=\'none\'">' +
      '<span>' + c.name + '</span>' +
    '</label>';
  }).join('');

  var fishChips = FISH_ITEMS.map(function(name) {
    return '<label class="market-item-chip">' +
      '<input type="checkbox" name="mkt-fish" value="' + name + '" onchange="marketUpdateItems()">' +
      '<span>🐟 ' + name + '</span>' +
    '</label>';
  }).join('');

  return (
    '<div class="calc-card">' +
      '<div class="calc-card-hd">' +
        '<div class="calc-card-icon">📦</div>' +
        '<div><div class="calc-card-title">재고 등록</div>' +
          '<div class="calc-card-sub">내 재고 현황을 등록해 요리사와 공유해요</div></div>' +
      '</div>' +

      // 유형
      '<div class="calc-section-label">등록 유형</div>' +
      '<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">' +
        '<label class="market-type-chip active" id="chip-farmer" onclick="marketTypeChange(\'farmer\')">' +
          '<input type="radio" name="mkt-type" value="farmer" checked> 🌾 농부 재고' +
        '</label>' +
        '<label class="market-type-chip" id="chip-fisher" onclick="marketTypeChange(\'fisher\')">' +
          '<input type="radio" name="mkt-type" value="fisher"> 🎣 어부 재고' +
        '</label>' +
        '<label class="market-type-chip" id="chip-cook" onclick="marketTypeChange(\'cook_request\')">' +
          '<input type="radio" name="mkt-type" value="cook_request"> 🍳 요리사 요청' +
        '</label>' +
      '</div>' +

      // 이름
      '<div class="calc-section-label">내 이름</div>' +
      '<select class="input calc-select" id="mkt-from" style="margin-bottom:16px;">' +
        '<option value="">선택하세요</option>' + memberOpts +
      '</select>' +

      // 품목
      '<div id="mkt-item-section">' +
        '<div class="calc-section-label">품목 선택 <span style="font-size:11px;color:var(--muted);">(복수 선택 가능)</span></div>' +
        '<div id="mkt-crop-section"><div class="market-chip-grid">' + cropChips + '</div></div>' +
        '<div id="mkt-fish-section" style="display:none;"><div class="market-chip-grid">' + fishChips + '</div></div>' +
      '</div>' +

      // 수량 + 별 등급 (품목 선택 후 표시)
      '<div id="mkt-qty-section" style="display:none;">' +
        '<div class="calc-section-label" style="margin-top:16px;">수량 · 별 등급 <span style="font-size:11px;color:var(--red);">*필수</span></div>' +
        '<div id="mkt-qty-list"></div>' +
      '</div>' +

      // 메모
      '<div class="calc-section-label" style="margin-top:16px;">메모 <span style="font-size:11px;color:var(--muted);">(선택)</span></div>' +
      '<input class="input" id="mkt-note" type="text" placeholder="만나서 거래하는 걸 원해요!" style="margin-bottom:20px;">' +

      '<button class="btn btn-primary" onclick="marketSubmit(this)" style="width:100%;">재고 등록하기</button>' +
    '</div>'
  );
}

// 유형 변경
function marketTypeChange(type) {
  var radio = document.querySelector('input[name="mkt-type"][value="' + type + '"]');
  if (radio) radio.checked = true;
  ['farmer','fisher','cook'].forEach(function(t) {
    var el = document.getElementById('chip-' + t);
    if (el) el.classList.remove('active');
  });
  var chipId = type === 'cook_request' ? 'chip-cook' : 'chip-' + type;
  var ac = document.getElementById(chipId);
  if (ac) ac.classList.add('active');

  var cropSec = document.getElementById('mkt-crop-section');
  var fishSec = document.getElementById('mkt-fish-section');
  if (cropSec) cropSec.style.display = (type === 'farmer' || type === 'cook_request') ? '' : 'none';
  if (fishSec) fishSec.style.display = (type === 'fisher' || type === 'cook_request') ? '' : 'none';

  // 체크 초기화
  document.querySelectorAll('input[name="mkt-crop"], input[name="mkt-fish"]').forEach(function(cb){
    cb.checked = false;
    var l = cb.closest('label');
    if (l) l.classList.remove('active');
  });
  marketUpdateItems();
}

// 품목 선택 변경 → 수량+별 등급 행 업데이트
function marketUpdateItems() {
  var crops = Array.from(document.querySelectorAll('input[name="mkt-crop"]:checked')).map(function(cb){ return cb.value; });
  var fish  = Array.from(document.querySelectorAll('input[name="mkt-fish"]:checked')).map(function(cb){ return cb.value; });
  var all   = crops.concat(fish);

  // 칩 active
  document.querySelectorAll('.market-item-chip input').forEach(function(cb) {
    var l = cb.closest('label');
    if (l) l.classList.toggle('active', cb.checked);
  });

  var qtySection = document.getElementById('mkt-qty-section');
  var qtyList    = document.getElementById('mkt-qty-list');
  if (!qtySection || !qtyList) return;

  if (!all.length) { qtySection.style.display = 'none'; return; }
  qtySection.style.display = '';

  // 기존 행 유지하며 새 품목만 추가/제거
  var existingIds = Array.from(qtyList.querySelectorAll('[data-item]')).map(function(el){ return el.dataset.item; });
  // 제거된 품목 삭제
  existingIds.forEach(function(name) {
    if (all.indexOf(name) === -1) {
      var el = qtyList.querySelector('[data-item="' + name + '"]');
      if (el) el.remove();
    }
  });
  // 새 품목 추가
  all.forEach(function(name) {
    if (existingIds.indexOf(name) === -1) {
      var row = document.createElement('div');
      row.className = 'market-qty-row';
      row.dataset.item = name;
      row.innerHTML =
        '<span class="market-qty-label">' + name + '</span>' +
        '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
          // 수량 (spinner 제거: -moz-appearance:textfield)
          '<input class="input" type="number" min="0" placeholder="수량" id="qty-' + name + '"' +
            ' style="width:75px;text-align:right;-moz-appearance:textfield;" ' +
            ' oninput="this.style.cssText += \';-webkit-appearance:none;\'">' +
          '<select class="input calc-select" id="unit-' + name + '" style="width:82px;">' +
            '<option value="개">개</option>' +
            '<option value="set">셋</option>' +
            '<option value="shulker">셜커</option>' +
          '</select>' +
          // 별 등급 (필수)
          '<label class="market-star-sm" id="chip-silver-' + name + '">' +
            '<input type="checkbox" id="silver-' + name + '" onchange="marketStarChange(\'' + name + '\')">' +
            '⭐ 은별' +
          '</label>' +
          '<label class="market-star-sm" id="chip-gold-' + name + '">' +
            '<input type="checkbox" id="gold-' + name + '" onchange="marketStarChange(\'' + name + '\')">' +
            '🌟 금별' +
          '</label>' +
        '</div>';
      qtyList.appendChild(row);
    }
  });
}

// 별 등급 칩 스타일
function marketStarChange(name) {
  var sEl = document.getElementById('silver-' + name);
  var gEl = document.getElementById('gold-' + name);
  var cS  = document.getElementById('chip-silver-' + name);
  var cG  = document.getElementById('chip-gold-' + name);
  if (cS) cS.classList.toggle('active', sEl && sEl.checked);
  if (cG) cG.classList.toggle('active', gEl && gEl.checked);
}

// 제출
async function marketSubmit(btn) {
  var type = (document.querySelector('input[name="mkt-type"]:checked') || {}).value;
  var from = (document.getElementById('mkt-from') || {}).value;
  var note = (document.getElementById('mkt-note') || {}).value;
  if (!from) { alert('내 이름을 선택해주세요.'); return; }

  var crops = Array.from(document.querySelectorAll('input[name="mkt-crop"]:checked')).map(function(cb){ return cb.value; });
  var fish  = Array.from(document.querySelectorAll('input[name="mkt-fish"]:checked')).map(function(cb){ return cb.value; });
  var allNames = crops.concat(fish);
  if (!allNames.length) { alert('품목을 하나 이상 선택해주세요.'); return; }

  var items = allNames.map(function(name) {
    var qtyEl  = document.getElementById('qty-' + name);
    var unitEl = document.getElementById('unit-' + name);
    var sEl    = document.getElementById('silver-' + name);
    var gEl    = document.getElementById('gold-' + name);
    var grades = [(sEl && sEl.checked ? '은별' : ''), (gEl && gEl.checked ? '금별' : '')].filter(Boolean).join('·');
    return {
      name:  name,
      qty:   (qtyEl && qtyEl.value) ? qtyEl.value : '',
      unit:  (unitEl && unitEl.value) ? unitEl.value : '개',
      grade: grades,
    };
  });

  btn.textContent = '등록 중...'; btn.disabled = true;
  try {
    var id  = 'mkt_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
    var obj = { type: type, from: from, status: 'open', createdAt: Date.now(), items: items };
    if (note) obj.note = note;
    await firebase.database().ref('stella_market/' + id).set(obj);
    alert('재고가 등록됐어요!');
    switchMarketTab('board', document.querySelector('[data-tab="board"]'));
  } catch(e) {
    alert('등록 실패: ' + e.message);
    btn.textContent = '재고 등록하기'; btn.disabled = false;
  }
}

// ── 상태 변경 ────────────────────────────────────────────────
async function marketBuy(id) {
  var d = _marketData[id];
  if (!d) return;
  var itemNames = (d.items||[]).map(function(it){
    return it.name + (it.grade ? '(' + it.grade + ')' : '') + (it.qty ? ' ×' + it.qty + _unitLabel(it.unit) : '');
  }).join(', ');
  var msg = '다음 재고를 구매하시겠어요?\n\n등록자: ' + (d.from||'?') + '\n품목: ' + (itemNames||'미지정') + '\n\n구매 완료 처리됩니다.';
  if (!confirm(msg)) return;
  try {
    await firebase.database().ref('stella_market/' + id + '/status').set('bought');
    await firebase.database().ref('stella_market/' + id + '/boughtAt').set(Date.now());
  } catch(e) { alert('실패: ' + e.message); }
}

async function marketDone(id) {
  try {
    await firebase.database().ref('stella_market/' + id + '/status').set('done');
    await firebase.database().ref('stella_market/' + id + '/doneAt').set(Date.now());
  } catch(e) { alert('실패: ' + e.message); }
}

// ══════════════════════════════════════════════════════════════
// 완료 내역
// ══════════════════════════════════════════════════════════════
function _buildHistory() {
  var done = Object.entries(_marketData)
    .filter(function(e){ return e[1] && e[1].status === 'done'; })
    .sort(function(a,b){ return (b[1].doneAt||b[1].createdAt||0)-(a[1].doneAt||a[1].createdAt||0); });

  if (!done.length) {
    return '<div class="empty"><div style="font-size:36px;margin-bottom:10px;">📦</div>' +
      '<div style="color:var(--muted);">완료된 거래가 없어요.</div></div>';
  }

  var cards = done.map(function(entry) {
    var id = entry[0], d = entry[1];
    var itemsHtml = (d.items||[]).map(function(it){
      var gradeStr = it.grade ? ' <span style="font-size:10px;color:var(--amber);">(' + it.grade + ')</span>' : '';
      return '<span class="mat-tag">' + it.name + gradeStr + (it.qty ? ' ×' + it.qty + _unitLabel(it.unit) : '') + '</span>';
    }).join('');
    var delBtn = isAdmin()
      ? '<button class="btn btn-sm btn-danger" onclick="marketDelete(\'' + id + '\')">삭제</button>'
      : '';
    return '<div class="market-card market-card--done">' +
      '<div class="market-card-hd">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' + _typeBadge(d.type) + _statusBadge(d.status) + '</div>' +
        '<div style="text-align:right;line-height:1.8;">' +
          '<div style="font-size:11px;color:var(--muted);">📝 등록 ' + _fmtTime(d.createdAt) + '</div>' +
          (d.boughtAt ? '<div style="font-size:11px;color:var(--amber);">🛒 구매 ' + _fmtTime(d.boughtAt) + '</div>' : '') +
          (d.doneAt   ? '<div style="font-size:11px;color:var(--teal);">✅ 완료 ' + _fmtTime(d.doneAt)   + '</div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="market-card-from"><span style="font-size:14px;font-weight:800;color:var(--text);">' + (d.from||'?') + '</span></div>' +
      '<div class="market-card-items">' + (itemsHtml||'') + '</div>' +
      (d.note ? '<div class="market-card-note">' + d.note + '</div>' : '') +
      (delBtn ? '<div class="market-card-actions">' + delBtn + '</div>' : '') +
    '</div>';
  }).join('');
  return '<div class="market-grid">' + cards + '</div>';
}

async function marketDelete(id) {
  if (!confirm('이 내역을 삭제할까요?')) return;
  try { await firebase.database().ref('stella_market/' + id).remove(); }
  catch(e) { alert('실패: ' + e.message); }
}
