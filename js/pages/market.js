// ── 거래장 페이지 ────────────────────────────────────────────
// DB: stella_market / { id: { type, from, to, items, note, status, createdAt } }
//   type    : 'farmer_offer' | 'cook_request'
//   status  : 'open' | 'matched' | 'done'
//   items   : [{ name, qty }]

var _marketData  = {};
var _marketTab   = 'board';
var _marketUnsub = null;

// 재료 목록 (농부가 제공 가능한 작물 기반)
var FARM_ITEMS = [
  '밀','당근','감자','비트','수박 조각','멜론 조각',
  '호박','사탕수수','코코아 열매','버섯(갈색)','버섯(빨간)',
  '해바라기','장미','튤립','민들레','양귀비',
  '계란','우유','꿀병','벌집',
  '소고기','돼지고기','닭고기','양고기','토끼고기','생선',
];

// 거래 상태 뱃지
function _statusBadge(status) {
  var map = {
    open:    '<span class="tag tag-teal">🟢 대기중</span>',
    matched: '<span class="tag tag-amber">🤝 진행중</span>',
    done:    '<span class="tag" style="background:var(--bg-3);color:var(--muted);">✅ 완료</span>',
  };
  return map[status] || '';
}

// 거래 유형 뱃지
function _typeBadge(type) {
  return type === 'farmer_offer'
    ? '<span class="tag" style="background:var(--green-dim);color:var(--green);">🌾 농부 제공</span>'
    : '<span class="tag" style="background:var(--amber-dim);color:var(--amber);">🍳 요리사 요청</span>';
}

// 타임스탬프 → 상대시간
function _relTime(ts) {
  if (!ts) return '';
  var diff = (Date.now() - ts) / 1000;
  if (diff < 60)   return '방금 전';
  if (diff < 3600) return Math.floor(diff / 60) + '분 전';
  if (diff < 86400)return Math.floor(diff / 3600) + '시간 전';
  return Math.floor(diff / 86400) + '일 전';
}

// ── 초기화 ───────────────────────────────────────────────────
function initMarket() {
  _marketTab = 'board';
  _activateTab('board');
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

function _activateTab(tab) {
  document.querySelectorAll('#market-tabs .people-tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
}

function _renderMarketTab(tab) {
  var root = document.getElementById('market-content');
  if (!root) return;
  if      (tab === 'board')   root.innerHTML = _buildBoard();
  else if (tab === 'request') root.innerHTML = _buildRequestForm();
  else if (tab === 'history') root.innerHTML = _buildHistory();
}

// ── 거래 현황 보드 ───────────────────────────────────────────
function _buildBoard() {
  var entries = Object.entries(_marketData)
    .filter(function(e) { return e[1] && e[1].status !== 'done'; })
    .sort(function(a, b) { return (b[1].createdAt||0) - (a[1].createdAt||0); });

  if (!entries.length) {
    return '<div class="empty">' +
      '<div style="font-size:36px;margin-bottom:10px;">🌾</div>' +
      '<div style="color:var(--muted);">현재 진행 중인 거래가 없어요.</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:6px;">거래 등록 탭에서 새 거래를 올려보세요!</div>' +
    '</div>';
  }

  var cards = entries.map(function(entry) {
    var id = entry[0], d = entry[1];
    var itemsHtml = (d.items || []).map(function(it) {
      return '<span class="mat-tag">' + it.name + (it.qty ? ' <span class="mat-qty">×' + it.qty + '</span>' : '') + '</span>';
    }).join('');

    var actionBtns = '';
    if (isAdmin() || true) {  // 누구나 상태 변경 가능 (편의성)
      if (d.status === 'open') {
        actionBtns = '<button class="btn btn-sm btn-primary" onclick="marketMatch(\'' + id + '\')">🤝 매칭</button>';
      } else if (d.status === 'matched') {
        actionBtns = '<button class="btn btn-sm" style="background:var(--green-dim);color:var(--green);border-color:var(--green);" onclick="marketDone(\'' + id + '\')">✅ 완료</button>';
      }
    }

    return '<div class="market-card">' +
      '<div class="market-card-hd">' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          _typeBadge(d.type) + _statusBadge(d.status) +
        '</div>' +
        '<span style="font-size:11px;color:var(--muted);">' + _relTime(d.createdAt) + '</span>' +
      '</div>' +
      '<div class="market-card-from">' +
        '<span style="font-size:13px;font-weight:800;color:var(--text);">' + (d.from || '?') + '</span>' +
        (d.to ? '<span style="font-size:12px;color:var(--muted);margin:0 6px;">→</span><span style="font-size:13px;font-weight:700;color:var(--purple);">' + d.to + '</span>' : '') +
      '</div>' +
      '<div class="market-card-items">' + (itemsHtml || '<span style="color:var(--muted);font-size:12px;">품목 미지정</span>') + '</div>' +
      (d.note ? '<div class="market-card-note">' + d.note + '</div>' : '') +
      (actionBtns ? '<div class="market-card-actions">' + actionBtns + '</div>' : '') +
    '</div>';
  }).join('');

  // 통계
  var openCnt    = entries.filter(function(e){ return e[1].status==='open'; }).length;
  var matchedCnt = entries.filter(function(e){ return e[1].status==='matched'; }).length;
  var statsHtml  =
    '<div class="market-stats">' +
      '<div class="market-stat"><div class="market-stat-val" style="color:var(--teal);">' + openCnt + '</div><div class="market-stat-label">대기중</div></div>' +
      '<div class="market-stat"><div class="market-stat-val" style="color:var(--amber);">' + matchedCnt + '</div><div class="market-stat-label">진행중</div></div>' +
      '<div class="market-stat"><div class="market-stat-val">' + entries.length + '</div><div class="market-stat-label">전체</div></div>' +
    '</div>';

  return statsHtml + '<div class="market-grid">' + cards + '</div>';
}

// ── 거래 등록 폼 ─────────────────────────────────────────────
function _buildRequestForm() {
  var memberNames = (window.members || []).map(function(m) { return m.name || m.mc; }).filter(Boolean);
  var memberOpts  = memberNames.map(function(n) { return '<option value="' + n + '">' + n + '</option>'; }).join('');
  var itemOpts    = FARM_ITEMS.map(function(n) { return '<option value="' + n + '">' + n + '</option>'; }).join('');

  return (
    '<div class="calc-card">' +
      '<div class="calc-card-hd">' +
        '<div class="calc-card-icon">✏️</div>' +
        '<div><div class="calc-card-title">새 거래 등록</div>' +
          '<div class="calc-card-sub">농부의 재료 제공 또는 요리사의 재료 요청을 등록해요</div></div>' +
      '</div>' +

      // 거래 유형
      '<div class="calc-section-label">거래 유형</div>' +
      '<div style="display:flex;gap:10px;margin-bottom:16px;">' +
        '<label class="market-type-chip" id="chip-farmer">' +
          '<input type="radio" name="mkt-type" value="farmer_offer" onchange="marketTypeChange()" checked>' +
          '<span>🌾 농부 — 재료 제공</span>' +
        '</label>' +
        '<label class="market-type-chip" id="chip-cook">' +
          '<input type="radio" name="mkt-type" value="cook_request" onchange="marketTypeChange()">' +
          '<span>🍳 요리사 — 재료 요청</span>' +
        '</label>' +
      '</div>' +

      // 보내는 사람
      '<div class="calc-section-label">이름</div>' +
      '<select class="input calc-select" id="mkt-from" style="margin-bottom:16px;">' +
        '<option value="">선택하세요</option>' + memberOpts +
      '</select>' +

      // 대상 (선택)
      '<div class="calc-section-label">대상 (선택사항)</div>' +
      '<select class="input calc-select" id="mkt-to" style="margin-bottom:16px;">' +
        '<option value="">전체 공개</option>' + memberOpts +
      '</select>' +

      // 품목 추가
      '<div class="calc-section-label">품목</div>' +
      '<div id="mkt-items-list"></div>' +
      '<div style="display:flex;gap:8px;margin-bottom:16px;">' +
        '<select class="input calc-select" id="mkt-item-name" style="flex:1;">' +
          '<option value="">품목 선택</option>' + itemOpts +
          '<option value="__custom__">직접 입력...</option>' +
        '</select>' +
        '<input class="input" id="mkt-item-qty" type="number" min="1" placeholder="수량" style="width:80px;" onkeydown="if(event.key===\'Enter\')marketAddItem()">' +
        '<button class="btn btn-primary btn-sm" onclick="marketAddItem()">추가</button>' +
      '</div>' +

      // 메모
      '<div class="calc-section-label">메모 (선택)</div>' +
      '<input class="input" id="mkt-note" type="text" placeholder="예: 내일 저녁까지 가능해요" style="margin-bottom:20px;">' +

      // 제출
      '<button class="btn btn-primary" onclick="marketSubmit(this)" style="width:100%;">거래 등록하기</button>' +
    '</div>'
  );
}

// 품목 추가
function marketAddItem() {
  var sel  = document.getElementById('mkt-item-name');
  var qty  = document.getElementById('mkt-item-qty');
  var list = document.getElementById('mkt-items-list');
  if (!sel || !list) return;

  var name = sel.value;
  if (name === '__custom__') {
    name = prompt('품목 이름을 입력하세요:');
    if (!name) return;
  }
  if (!name) { alert('품목을 선택해주세요.'); return; }

  var qtyVal = parseInt(qty ? qty.value : '') || 0;
  var id     = 'mkt-item-' + Date.now();
  var tag    = document.createElement('div');
  tag.id    = id;
  tag.style = 'display:inline-flex;align-items:center;gap:6px;background:var(--bg-3);border:1px solid var(--b1);border-radius:8px;padding:5px 10px;margin:0 6px 6px 0;font-size:13px;';
  tag.innerHTML = '<span>' + name + (qtyVal ? ' ×' + qtyVal : '') + '</span>' +
    '<span onclick="document.getElementById(\'' + id + '\').remove()" style="color:var(--muted);cursor:pointer;font-size:14px;">×</span>';
  tag.dataset.name = name;
  tag.dataset.qty  = qtyVal || '';
  list.appendChild(tag);

  sel.value = '';
  if (qty) qty.value = '';
}

function marketTypeChange() {
  var type = document.querySelector('input[name="mkt-type"]:checked')?.value;
  document.querySelectorAll('.market-type-chip').forEach(function(c) { c.classList.remove('active'); });
  if (type === 'farmer_offer') document.getElementById('chip-farmer')?.classList.add('active');
  else document.getElementById('chip-cook')?.classList.add('active');
}

async function marketSubmit(btn) {
  var type = document.querySelector('input[name="mkt-type"]:checked')?.value;
  var from = document.getElementById('mkt-from')?.value;
  var to   = document.getElementById('mkt-to')?.value;
  var note = document.getElementById('mkt-note')?.value;

  if (!from) { alert('이름을 선택해주세요.'); return; }

  // 품목 수집
  var items = Array.from(document.querySelectorAll('#mkt-items-list > div')).map(function(el) {
    return { name: el.dataset.name, qty: el.dataset.qty || '' };
  });

  btn.textContent = '등록 중...'; btn.disabled = true;
  try {
    var id  = 'mkt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    var obj = { type: type, from: from, status: 'open', createdAt: Date.now() };
    if (to)   obj.to   = to;
    if (note) obj.note = note;
    if (items.length) obj.items = items;

    await firebase.database().ref('stella_market/' + id).set(obj);
    alert('거래가 등록됐어요!');
    // 보드로 이동
    switchMarketTab('board', document.querySelector('[data-tab="board"]'));
  } catch(e) {
    alert('등록 실패: ' + e.message);
    btn.textContent = '거래 등록하기'; btn.disabled = false;
  }
}

// ── 상태 변경 ────────────────────────────────────────────────
async function marketMatch(id) {
  try { await firebase.database().ref('stella_market/' + id + '/status').set('matched'); }
  catch(e) { alert('실패: ' + e.message); }
}

async function marketDone(id) {
  try { await firebase.database().ref('stella_market/' + id + '/status').set('done'); }
  catch(e) { alert('실패: ' + e.message); }
}

// ── 완료 내역 ────────────────────────────────────────────────
function _buildHistory() {
  var done = Object.entries(_marketData)
    .filter(function(e) { return e[1] && e[1].status === 'done'; })
    .sort(function(a, b) { return (b[1].createdAt||0) - (a[1].createdAt||0); });

  if (!done.length) {
    return '<div class="empty">' +
      '<div style="font-size:36px;margin-bottom:10px;">📦</div>' +
      '<div style="color:var(--muted);">완료된 거래가 없어요.</div>' +
    '</div>';
  }

  var cards = done.map(function(entry) {
    var id = entry[0], d = entry[1];
    var itemsHtml = (d.items || []).map(function(it) {
      return '<span class="mat-tag">' + it.name + (it.qty ? ' ×' + it.qty : '') + '</span>';
    }).join('');

    var adminDelete = isAdmin()
      ? '<button class="btn btn-sm btn-danger" onclick="marketDelete(\'' + id + '\')">삭제</button>'
      : '';

    return '<div class="market-card market-card--done">' +
      '<div class="market-card-hd">' +
        '<div style="display:flex;align-items:center;gap:8px;">' + _typeBadge(d.type) + _statusBadge(d.status) + '</div>' +
        '<span style="font-size:11px;color:var(--muted);">' + _relTime(d.createdAt) + '</span>' +
      '</div>' +
      '<div class="market-card-from">' +
        '<span style="font-size:13px;font-weight:800;color:var(--text);">' + (d.from || '?') + '</span>' +
        (d.to ? '<span style="font-size:12px;color:var(--muted);margin:0 6px;">→</span><span style="font-size:13px;font-weight:700;color:var(--purple);">' + d.to + '</span>' : '') +
      '</div>' +
      '<div class="market-card-items">' + (itemsHtml || '') + '</div>' +
      (d.note ? '<div class="market-card-note">' + d.note + '</div>' : '') +
      (adminDelete ? '<div class="market-card-actions">' + adminDelete + '</div>' : '') +
    '</div>';
  }).join('');

  return '<div class="market-grid">' + cards + '</div>';
}

async function marketDelete(id) {
  if (!confirm('이 거래 내역을 삭제할까요?')) return;
  try { await firebase.database().ref('stella_market/' + id).remove(); }
  catch(e) { alert('실패: ' + e.message); }
}
