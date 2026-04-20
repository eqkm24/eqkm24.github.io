// ── 거래장 ────────────────────────────────────────────────────
// DB: stella_market
//   type   : 'farmer' | 'fisher' | 'cook_request'
//   status : 'open' | 'bought' | 'done'
//   items  : [{ name, grade, qty, unit }]  unit: 'shulker'|'set'|'개'

var _marketData = {};
var _marketTab  = 'board';

// ── 작물 목록 (루나위키 농사 페이지 기반) ─────────────────────
var CROP_ITEMS = [
  { name:'상추',   icon:'https://minecraft.wiki/images/Wheat_JE2_BE2.png',        seasons:'봄·여름' },
  { name:'옥수수', icon:'https://minecraft.wiki/images/Wheat_Seeds_JE2_BE2.png',   seasons:'봄·여름' },
  { name:'양배추', icon:'https://minecraft.wiki/images/Oak_Leaves_JE6_BE3.png',    seasons:'가을·겨울' },
  { name:'무',     icon:'https://minecraft.wiki/images/Beetroot_JE2_BE2.png',       seasons:'가을·겨울' },
  { name:'토마토', icon:'https://minecraft.wiki/images/Red_Mushroom_JE4_BE2.png',   seasons:'여름·가을' },
  { name:'딸기',   icon:'https://minecraft.wiki/images/Sweet_Berries_JE2_BE2.png',  seasons:'봄·여름' },
  { name:'포도',   icon:'https://minecraft.wiki/images/Purple_Dye_JE2_BE2.png',     seasons:'겨울·가을' },
  { name:'레몬',   icon:'https://minecraft.wiki/images/Yellow_Dye_JE2_BE2.png',     seasons:'봄·가을' },
  { name:'오렌지', icon:'https://minecraft.wiki/images/Orange_Dye_JE2_BE2.png',     seasons:'여름·겨울' },
  { name:'파인애플',icon:'https://minecraft.wiki/images/Lime_Dye_JE2_BE2.png',      seasons:'여름·가을' },
  { name:'바나나', icon:'https://minecraft.wiki/images/Yellow_Concrete_JE1_BE1.png',seasons:'여름·가을' },
  { name:'석류',   icon:'https://minecraft.wiki/images/Red_Dye_JE2_BE2.png',        seasons:'가을·겨울' },
];

// ── 물고기 목록 (루나위키 물고기 교환 페이지 기반) ────────────
var FISH_ITEMS = [
  '아귀','줄돔','푸른 해파리','블루탱','잉어','메기',
  '흰동가리','뱀장어','금붕어','랍스터','만타 가오리',
  '습지 개구리','숭어','문어','농어','강꼬치고기',
  '적색퉁돔','연어','정어리','철갑상어','개복치','다랑어','잡어',
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

  // 요리사 요청 먼저 → 나머지 최신순
  var cookReqs = all.filter(function(e){ return e[1].type === 'cook_request'; })
                    .sort(function(a,b){ return (b[1].createdAt||0)-(a[1].createdAt||0); });
  var others   = all.filter(function(e){ return e[1].type !== 'cook_request'; })
                    .sort(function(a,b){ return (b[1].createdAt||0)-(a[1].createdAt||0); });

  if (!all.length) {
    return '<div class="empty"><div style="font-size:36px;margin-bottom:10px;">🌾</div>' +
      '<div style="color:var(--muted);">현재 등록된 재고가 없어요.</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:6px;">재고 등록 탭에서 새 항목을 올려보세요!</div></div>';
  }

  // 통계
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

    var cardStyle = highlight
      ? 'border:2px solid var(--amber);background:var(--amber-dim);'
      : '';

    return '<div class="market-card" style="' + cardStyle + '">' +
      '<div class="market-card-hd">' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          _typeBadge(d.type) + _statusBadge(d.status) +
        '</div>' +
        '<span style="font-size:11px;color:var(--muted);">' + _relTime(d.createdAt) + '</span>' +
      '</div>' +
      '<div class="market-card-from"><span style="font-size:14px;font-weight:800;color:var(--text);">' + (d.from||'?') + '</span></div>' +
      '<div class="market-card-items">' + (itemsHtml || '<span style="color:var(--muted);font-size:12px;">품목 미지정</span>') + '</div>' +
      (d.note ? '<div class="market-card-note">' + d.note + '</div>' : '') +
      (actionBtns ? '<div class="market-card-actions">' + actionBtns + '</div>' : '') +
    '</div>';
  }

  var html = statsHtml;

  // 요리사 요청 강조 섹션
  if (cookReqs.length) {
    html += '<div class="market-section-title">🍳 요리사 요청 — 우선 확인해주세요</div>' +
      '<div class="market-grid">' + cookReqs.map(function(e){ return _card(e, true); }).join('') + '</div>';
  }

  // 나머지 재고
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

  // 작물 칩 (이미지 + 이름)
  var cropChips = CROP_ITEMS.map(function(c) {
    return '<label class="market-item-chip" title="' + c.seasons + '">' +
      '<input type="checkbox" name="mkt-crop" value="' + c.name + '" onchange="marketUpdateItems()">' +
      '<img src="' + c.icon + '" alt="' + c.name + '" onerror="this.style.display=\'none\'">' +
      '<span>' + c.name + '</span>' +
    '</label>';
  }).join('');

  // 물고기 칩
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

      // 등록 유형
      '<div class="calc-section-label">등록 유형</div>' +
      '<div style="display:flex;gap:10px;margin-bottom:16px;">' +
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

      // 품목 선택 (유형에 따라 동적으로)
      '<div id="mkt-item-section">' +
        '<div class="calc-section-label">품목 선택 <span style="font-size:11px;color:var(--muted);">(복수 선택 가능)</span></div>' +
        '<div id="mkt-crop-section">' +
          '<div class="market-chip-grid">' + cropChips + '</div>' +
        '</div>' +
        '<div id="mkt-fish-section" style="display:none;">' +
          '<div class="market-chip-grid">' + fishChips + '</div>' +
        '</div>' +
      '</div>' +

      // 은별/금별
      '<div class="calc-section-label" style="margin-top:16px;">별 등급 <span style="font-size:11px;color:var(--muted);">(선택)</span></div>' +
      '<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">' +
        '<label class="market-star-chip" id="chip-silver">' +
          '<input type="checkbox" id="mkt-silver" onchange="marketStarChange()"> ⭐ 은별 포함' +
        '</label>' +
        '<label class="market-star-chip" id="chip-gold">' +
          '<input type="checkbox" id="mkt-gold" onchange="marketStarChange()"> 🌟 금별 포함' +
        '</label>' +
      '</div>' +

      // 선택된 품목 + 수량 입력
      '<div id="mkt-qty-section" style="display:none;">' +
        '<div class="calc-section-label">수량 입력</div>' +
        '<div id="mkt-qty-list"></div>' +
      '</div>' +

      // 메모
      '<div class="calc-section-label" style="margin-top:16px;">메모 <span style="font-size:11px;color:var(--muted);">(선택)</span></div>' +
      '<input class="input" id="mkt-note" type="text" placeholder="예: 오늘 저녁까지 드릴 수 있어요" style="margin-bottom:20px;">' +

      '<button class="btn btn-primary" onclick="marketSubmit(this)" style="width:100%;">재고 등록하기</button>' +
    '</div>'
  );
}

// 유형 변경 → 품목 섹션 전환
function marketTypeChange(type) {
  // 라디오 체크
  var radio = document.querySelector('input[name="mkt-type"][value="' + type + '"]');
  if (radio) radio.checked = true;

  // 칩 active 토글
  ['farmer','fisher','cook'].forEach(function(t) {
    var chip = document.getElementById('chip-' + t);
    if (chip) chip.classList.remove('active');
  });
  // cook_request → chip-cook
  var chipId = type === 'cook_request' ? 'chip-cook' : 'chip-' + type;
  var activeChip = document.getElementById(chipId);
  if (activeChip) activeChip.classList.add('active');

  // 섹션 전환 (요리사는 작물+물고기 모두 보이게)
  var cropSec = document.getElementById('mkt-crop-section');
  var fishSec = document.getElementById('mkt-fish-section');
  if (type === 'farmer' || type === 'cook_request') {
    if (cropSec) cropSec.style.display = '';
  } else {
    if (cropSec) cropSec.style.display = 'none';
  }
  if (type === 'fisher' || type === 'cook_request') {
    if (fishSec) fishSec.style.display = '';
  } else {
    if (fishSec) fishSec.style.display = 'none';
  }

  // 체크 초기화
  document.querySelectorAll('input[name="mkt-crop"], input[name="mkt-fish"]').forEach(function(cb){
    cb.checked = false;
    cb.closest('label')?.classList.remove('active');
  });
  marketUpdateItems();
}

// 체크박스 변경 → 수량 입력 섹션 업데이트
function marketUpdateItems() {
  var checkedCrops = Array.from(document.querySelectorAll('input[name="mkt-crop"]:checked')).map(function(cb){ return cb.value; });
  var checkedFish  = Array.from(document.querySelectorAll('input[name="mkt-fish"]:checked')).map(function(cb){ return cb.value; });
  var all = checkedCrops.concat(checkedFish);

  // 칩 active 스타일
  document.querySelectorAll('.market-item-chip input').forEach(function(cb) {
    cb.closest('label')?.classList.toggle('active', cb.checked);
  });

  var qtySection = document.getElementById('mkt-qty-section');
  var qtyList    = document.getElementById('mkt-qty-list');
  if (!qtySection || !qtyList) return;

  if (!all.length) { qtySection.style.display = 'none'; return; }
  qtySection.style.display = '';

  qtyList.innerHTML = all.map(function(name) {
    return '<div class="market-qty-row">' +
      '<span class="market-qty-label">' + name + '</span>' +
      '<div style="display:flex;gap:6px;align-items:center;">' +
        '<input class="input" type="number" min="0" placeholder="수량" id="qty-' + name + '" style="width:80px;text-align:right;">' +
        '<select class="input calc-select" id="unit-' + name + '" style="width:90px;">' +
          '<option value="개">개</option>' +
          '<option value="set">셋</option>' +
          '<option value="shulker">셜커</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  }).join('');
}

// 별 등급 칩 스타일
function marketStarChange() {
  var silverEl = document.getElementById('mkt-silver');
  var goldEl   = document.getElementById('mkt-gold');
  var chipS    = document.getElementById('chip-silver');
  var chipG    = document.getElementById('chip-gold');
  if (chipS) chipS.classList.toggle('active', silverEl && silverEl.checked);
  if (chipG) chipG.classList.toggle('active', goldEl && goldEl.checked);
}

// 제출
async function marketSubmit(btn) {
  var type    = (document.querySelector('input[name="mkt-type"]:checked') || {}).value;
  var from    = (document.getElementById('mkt-from') || {}).value;
  var note    = (document.getElementById('mkt-note') || {}).value;
  var silver  = document.getElementById('mkt-silver') && document.getElementById('mkt-silver').checked;
  var gold    = document.getElementById('mkt-gold') && document.getElementById('mkt-gold').checked;

  if (!from) { alert('내 이름을 선택해주세요.'); return; }

  var checkedCrops = Array.from(document.querySelectorAll('input[name="mkt-crop"]:checked')).map(function(cb){ return cb.value; });
  var checkedFish  = Array.from(document.querySelectorAll('input[name="mkt-fish"]:checked')).map(function(cb){ return cb.value; });
  var allNames     = checkedCrops.concat(checkedFish);

  if (!allNames.length) { alert('품목을 하나 이상 선택해주세요.'); return; }

  // 품목 + 수량 수집
  var gradeStr = [silver && '은별', gold && '금별'].filter(Boolean).join('·') || '';
  var items = allNames.map(function(name) {
    var qtyEl  = document.getElementById('qty-' + name);
    var unitEl = document.getElementById('unit-' + name);
    return {
      name:  name,
      qty:   (qtyEl  && qtyEl.value)  ? qtyEl.value  : '',
      unit:  (unitEl && unitEl.value)  ? unitEl.value : '개',
      grade: gradeStr,
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
  // 확인창 — 품목 표시
  var itemNames = (d.items||[]).map(function(it){ return it.name + (it.qty ? ' ×' + it.qty + _unitLabel(it.unit) : ''); }).join(', ');
  var msg = '다음 재고를 구매하시겠어요?\n\n' +
    '등록자: ' + (d.from||'?') + '\n' +
    '품목: ' + (itemNames||'미지정') + '\n\n' +
    '구매 완료 처리됩니다.';
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
        '<div style="text-align:right;">' +
          '<div style="font-size:11px;color:var(--muted);">등록: ' + _fmtTime(d.createdAt) + '</div>' +
          (d.boughtAt ? '<div style="font-size:11px;color:var(--amber);">구매: ' + _fmtTime(d.boughtAt) + '</div>' : '') +
          (d.doneAt   ? '<div style="font-size:11px;color:var(--teal);">완료: ' + _fmtTime(d.doneAt) + '</div>' : '') +
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
