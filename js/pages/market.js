// ── 거래장 (market.js) ───────────────────────────────────────
var _marketData = {};
var _marketTab  = 'board';

var _LW = 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F';
var _Q  = '%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7_2025-12-04_';

var CROP_ITEMS = [
  {name:'레몬',    seasons:'봄·가을',   icon:_LW+'t2wL3KwQID34bDB6z2PL'+_Q+'152653-removebg-preview.png%3Falt%3Dmedia%26token%3D5207838e-ac2b-4c11-a14e-5820b161028e&width=64&dpr=1&quality=100&sign=eec127b9&sv=2'},
  {name:'무',      seasons:'가을·겨울', icon:_LW+'Eu47WPnGBddR15IHax3m'+_Q+'152703-removebg-preview.png%3Falt%3Dmedia%26token%3D865fa1a6-cf9f-42d2-961f-f90f765ed8ec&width=64&dpr=1&quality=100&sign=769ab075&sv=2'},
  {name:'바나나',  seasons:'여름·가을', icon:_LW+'dOdmQ6V3rZUaLNmCOtOq'+_Q+'153327-removebg-preview.png%3Falt%3Dmedia%26token%3D71c6369f-4832-497b-9a6e-c31aaed395f4&width=64&dpr=1&quality=100&sign=a3a1d1e6&sv=2'},
  {name:'딸기',    seasons:'봄·여름',   icon:_LW+'JcTwOeLasuJ4PgQ3f5XC'+_Q+'152734-removebg-preview.png%3Falt%3Dmedia%26token%3D4b0e6295-23fa-4487-9bc2-8f80ccb293e5&width=64&dpr=1&quality=100&sign=3f034202&sv=2'},
  {name:'상추',    seasons:'봄·여름',   icon:_LW+'LqmvbDJGEzhrfPbJjoBV'+_Q+'152659-removebg-preview.png%3Falt%3Dmedia%26token%3D7140e570-e260-40c7-b28a-3054aaa2519a&width=64&dpr=1&quality=100&sign=190c0891&sv=2'},
  {name:'석류',    seasons:'가을·겨울', icon:_LW+'X9OrITIDl9404YpJpCxZ'+_Q+'152730-removebg-preview.png%3Falt%3Dmedia%26token%3Dc6b71855-75e7-48b2-8627-b3bc5e604573&width=64&dpr=1&quality=100&sign=90be7902&sv=2'},
  {name:'오렌지',  seasons:'여름·겨울', icon:_LW+'X8AMRAo6Jqtwzqyh6N1e'+_Q+'152716-removebg-preview.png%3Falt%3Dmedia%26token%3D6605e8e3-224b-460f-98a3-89fc1b348140&width=64&dpr=1&quality=100&sign=579a073c&sv=2'},
  {name:'옥수수',  seasons:'봄·여름',   icon:_LW+'BDSLWSHKFYDNkWyYcMRd'+_Q+'152707-removebg-preview.png%3Falt%3Dmedia%26token%3D6dbba4de-9ca2-4563-baf7-55803116c945&width=64&dpr=1&quality=100&sign=f711dde2&sv=2'},
  {name:'양배추',  seasons:'가을·겨울', icon:_LW+'kFLUMnq5wsVrVzMl6dyx'+_Q+'152712-removebg-preview.png%3Falt%3Dmedia%26token%3D79a5128e-bfeb-4d06-8803-28f84e5d60d2&width=64&dpr=1&quality=100&sign=6c3f14ef&sv=2'},
  {name:'토마토',  seasons:'여름·가을', icon:_LW+'nUKl1WApsRMpeeZr3TpF'+_Q+'152738-removebg-preview.png%3Falt%3Dmedia%26token%3D1453e6d8-e144-421c-8447-53893c04607a&width=64&dpr=1&quality=100&sign=733cff62&sv=2'},
  {name:'파인애플',seasons:'여름·가을', icon:_LW+'Em4HCIBNGzy1VQorqAFo'+_Q+'152721-removebg-preview.png%3Falt%3Dmedia%26token%3D7a174e53-7d79-41cd-aaa5-0ce1cb2ef615&width=64&dpr=1&quality=100&sign=6ddb715b&sv=2'},
  {name:'포도',    seasons:'겨울·가을', icon:_LW+'E4moEisz9jpxy8wIz08v'+_Q+'152725-removebg-preview.png%3Falt%3Dmedia%26token%3D577d847d-2752-4803-8250-a1e2390421ec&width=64&dpr=1&quality=100&sign=38eddffe&sv=2'},
];

var FISH_ITEMS = [
  '개복치','강꼬치고기','금붕어','농어','다랑어','랍스터',
  '만타 가오리','메기','문어','뱀장어','블루탱','숭어',
  '습지 개구리','아귀','연어','잉어','잡어','적색퉁돔',
  '정어리','줄돔','철갑상어','푸른 해파리','흰동가리',
];

function _statusBadge(s) {
  return {open:'<span class="tag tag-teal">🟢 등록중</span>',bought:'<span class="tag tag-amber">🛒 구매됨</span>',done:'<span class="tag" style="background:var(--bg-3);color:var(--muted);">✅ 완료</span>'}[s]||'';
}
function _typeBadge(t) {
  if(t==='farmer')      return '<span class="tag" style="background:var(--green-dim);color:var(--green);">🌾 농부 재고</span>';
  if(t==='fisher')      return '<span class="tag" style="background:rgba(96,165,250,.15);color:#60a5fa;">🎣 어부 재고</span>';
  if(t==='cook_request')return '<span class="tag" style="background:var(--amber-dim);color:var(--amber);">🍳 요리사 요청</span>';
  return '';
}
function _fmtTime(ts) {
  if(!ts)return'';
  var d=new Date(ts),p=function(n){return String(n).padStart(2,'0');};
  return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
}
function _relTime(ts) {
  if(!ts)return'';
  var diff=(Date.now()-ts)/1000;
  if(diff<60)return '방금 전';
  if(diff<3600)return Math.floor(diff/60)+'분 전';
  if(diff<86400)return Math.floor(diff/3600)+'시간 전';
  return Math.floor(diff/86400)+'일 전';
}
function _ul(u){return u==='shulker'?'셜커':u==='set'?'셋':'개';}

function initMarket() {
  _marketTab='board';
  window.$db.on('stella_market',function(val){
    _marketData=val||{};
    _renderMarketTab(_marketTab);
  });
}
function switchMarketTab(tab,el) {
  _marketTab=tab;
  document.querySelectorAll('#market-tabs .people-tab').forEach(function(t){t.classList.remove('active');});
  if(el)el.classList.add('active');
  _renderMarketTab(tab);
}
function _renderMarketTab(tab) {
  var root=document.getElementById('market-content');
  if(!root)return;
  if(tab==='board')root.innerHTML=_buildBoard();
  else if(tab==='request')root.innerHTML=_buildRequestForm();
  else if(tab==='history')root.innerHTML=_buildHistory();
}
function marketRefresh(){_renderMarketTab('board');}

// ── 거래 현황 ────────────────────────────────────────────────
function _buildBoard() {
  var all=Object.entries(_marketData).filter(function(e){return e[1]&&e[1].status!=='done';});
  var cooks=all.filter(function(e){return e[1].type==='cook_request';}).sort(function(a,b){return(b[1].createdAt||0)-(a[1].createdAt||0);});
  var others=all.filter(function(e){return e[1].type!=='cook_request';}).sort(function(a,b){return(b[1].createdAt||0)-(a[1].createdAt||0);});
  var openCnt=all.filter(function(e){return e[1].status==='open';}).length;
  var boughtCnt=all.filter(function(e){return e[1].status==='bought';}).length;

  var topBar=
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;flex-wrap:wrap;">'+
      '<div class="market-stats" style="margin-bottom:0;flex:1;">'+
        '<div class="market-stat"><div class="market-stat-val" style="color:var(--teal);">'+openCnt+'</div><div class="market-stat-label">등록중</div></div>'+
        '<div class="market-stat"><div class="market-stat-val" style="color:var(--amber);">'+boughtCnt+'</div><div class="market-stat-label">구매됨</div></div>'+
        '<div class="market-stat"><div class="market-stat-val">'+all.length+'</div><div class="market-stat-label">전체</div></div>'+
      '</div>'+
      '<button class="btn btn-sm" onclick="marketRefresh()" style="flex-shrink:0;">🔄 새로고침</button>'+
    '</div>';

  if(!all.length){
    return topBar+'<div class="empty"><div style="font-size:36px;margin-bottom:10px;">🌾</div>'+
      '<div style="color:var(--muted);">현재 등록된 재고가 없어요.</div>'+
      '<div style="font-size:12px;color:var(--muted);margin-top:6px;">재고 등록 탭에서 새 항목을 올려보세요!</div></div>';
  }

  // 사람별 요약
  var pmap={};
  others.forEach(function(e){
    var d=e[1]; if(!d.from)return;
    if(!pmap[d.from])pmap[d.from]={type:d.type,items:[],statuses:[]};
    (d.items||[]).forEach(function(it){pmap[d.from].items.push(it);});
    pmap[d.from].statuses.push(d.status);
  });
  var pkeys=Object.keys(pmap);
  var summary='';
  if(pkeys.length){
    summary='<div class="market-section-title">👤 사람별 재고 현황</div>'+
      '<div class="market-person-grid">'+
      pkeys.map(function(name){
        var info=pmap[name];
        var allDone=info.statuses.every(function(s){return s!=='open';});
        var tags=info.items.map(function(it){
          var g=it.grade?' <span style="font-size:9px;color:var(--amber);">('+it.grade+')</span>':'';
          var q=it.qty?' <span class="mat-qty">×'+it.qty+_ul(it.unit)+'</span>':'';
          return '<span class="mat-tag" style="font-size:11px;">'+it.name+g+q+'</span>';
        }).join('');
        return '<div class="market-person-card'+(allDone?' market-person-card--bought':'')+'">'+
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;">'+
            _typeBadge(info.type)+
            '<span style="font-weight:800;font-size:13px;color:var(--text);">'+name+'</span>'+
            (allDone?'<span class="tag tag-amber" style="font-size:10px;">완료</span>':'')+
          '</div>'+
          '<div style="display:flex;flex-wrap:wrap;gap:4px;">'+(tags||'<span style="font-size:11px;color:var(--muted);">품목 없음</span>')+'</div>'+
        '</div>';
      }).join('')+
      '</div>';
  }

  function _card(e,isCook){
    var id=e[0],d=e[1];
    var itHtml=(d.items||[]).map(function(it){
      var g=it.grade?' <span style="font-size:10px;color:var(--amber);">('+it.grade+')</span>':'';
      var q=it.qty?' <span class="mat-qty">×'+it.qty+_ul(it.unit)+'</span>':'';
      return '<span class="mat-tag">'+it.name+g+q+'</span>';
    }).join('');
    var btns='';
    if(isCook){
      if(d.status==='open')btns='<button class="btn btn-sm btn-primary" onclick="openSellModal(\''+id+'\')">💰 판매하기</button>';
      else if(d.status==='bought')btns='<button class="btn btn-sm" style="background:var(--green-dim);color:var(--green);border-color:var(--green);" onclick="marketDone(\''+id+'\')">✅ 완료</button>';
    }else{
      if(d.status==='open')btns='<button class="btn btn-sm btn-primary" onclick="marketBuy(\''+id+'\')">🛒 구매</button>';
      else if(d.status==='bought')btns='<button class="btn btn-sm" style="background:var(--green-dim);color:var(--green);border-color:var(--green);" onclick="marketDone(\''+id+'\')">✅ 완료</button>';
    }
    return '<div class="market-card" style="'+(isCook?'border:2px solid var(--amber);':'')+'">'+
      '<div class="market-card-hd">'+
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">'+_typeBadge(d.type)+_statusBadge(d.status)+'</div>'+
        '<span style="font-size:11px;color:var(--muted);">'+_relTime(d.createdAt)+'</span>'+
      '</div>'+
      '<div class="market-card-from"><span style="font-size:14px;font-weight:800;color:var(--text);">'+(d.from||'?')+'</span></div>'+
      '<div class="market-card-items">'+(itHtml||'<span style="color:var(--muted);font-size:12px;">품목 미지정</span>')+'</div>'+
      (d.note?'<div class="market-card-note">'+d.note+'</div>':'')+
      (btns?'<div class="market-card-actions">'+btns+'</div>':'')+
    '</div>';
  }

  var html=topBar+summary;
  if(cooks.length)html+='<div class="market-section-title" style="margin-top:16px;">🍳 요리사 요청 — 우선 확인해주세요</div><div class="market-grid">'+cooks.map(function(e){return _card(e,true);}).join('')+'</div>';
  if(others.length)html+='<div class="market-section-title" style="margin-top:16px;">🌾🎣 농부 · 어부 재고</div><div class="market-grid">'+others.map(function(e){return _card(e,false);}).join('')+'</div>';
  return html;
}

// ── 판매하기 팝업 ────────────────────────────────────────────
function openSellModal(id) {
  var d=_marketData[id]; if(!d)return;
  var modal=document.createElement('div');
  modal.className='modal-bg';
  modal.onclick=function(e){if(e.target===modal)modal.remove();};
  var rows=(d.items||[]).map(function(it){
    var g=it.grade?' <span style="font-size:11px;color:var(--amber);">('+it.grade+')</span>':'';
    var ml=it.qty?'(요청: '+it.qty+_ul(it.unit)+')':'';
    return '<div class="market-qty-row">'+
      '<div><span style="font-weight:700;font-size:13px;">'+it.name+'</span>'+g+' <span style="font-size:11px;color:var(--muted);">'+ml+'</span></div>'+
      '<div style="display:flex;gap:6px;align-items:center;">'+
        '<input class="input" type="number" min="0" placeholder="수량" id="sell-qty-'+it.name+'" style="width:75px;text-align:right;" value="'+(it.qty||'')+'">'+
        '<select class="input calc-select" id="sell-unit-'+it.name+'" style="width:82px;">'+
          '<option value="개"'+(it.unit==='개'?' selected':'')+'>개</option>'+
          '<option value="set"'+(it.unit==='set'?' selected':'')+'>셋</option>'+
          '<option value="shulker"'+(it.unit==='shulker'?' selected':'')+'>셜커</option>'+
        '</select>'+
      '</div>'+
    '</div>';
  }).join('');
  modal.innerHTML=
    '<div class="modal" style="max-width:440px;">'+
      '<div class="modal-title">💰 판매하기</div>'+
      '<div class="modal-sub" style="margin-bottom:4px;">요청자: <strong>'+(d.from||'?')+'</strong></div>'+
      '<div style="font-size:12px;color:var(--muted);margin-bottom:16px;">판매할 수량을 조정할 수 있어요 (부분 판매 가능)</div>'+
      '<div style="margin-bottom:16px;">'+(rows||'<div style="color:var(--muted);">품목 없음</div>')+'</div>'+
      '<div class="modal-btns">'+
        '<button class="btn" onclick="this.closest(\'.modal-bg\').remove()">취소</button>'+
        '<button class="btn btn-primary" onclick="confirmSell(\''+id+'\',this)">판매 확정</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(modal);
}

async function confirmSell(id,btn) {
  var d=_marketData[id]; if(!d)return;
  var sold=(d.items||[]).map(function(it){
    var q=document.getElementById('sell-qty-'+it.name);
    var u=document.getElementById('sell-unit-'+it.name);
    return {name:it.name,grade:it.grade||'',qty:q&&q.value?q.value:(it.qty||''),unit:u&&u.value?u.value:(it.unit||'개')};
  });
  btn.textContent='처리 중...';btn.disabled=true;
  try{
    await firebase.database().ref('stella_market/'+id+'/status').set('bought');
    await firebase.database().ref('stella_market/'+id+'/boughtAt').set(Date.now());
    await firebase.database().ref('stella_market/'+id+'/soldItems').set(sold);
    btn.closest('.modal-bg').remove();
  }catch(e){alert('실패: '+e.message);btn.textContent='판매 확정';btn.disabled=false;}
}

async function marketBuy(id) {
  var d=_marketData[id]; if(!d)return;
  var names=(d.items||[]).map(function(it){return it.name+(it.grade?'('+it.grade+')':(it.qty?'': ''))+(it.qty?' ×'+it.qty+_ul(it.unit):'');}).join(', ');
  if(!confirm('다음 재고를 구매하시겠어요?\n\n등록자: '+(d.from||'?')+'\n품목: '+(names||'미지정')+'\n\n구매 완료 처리됩니다.'))return;
  try{
    await firebase.database().ref('stella_market/'+id+'/status').set('bought');
    await firebase.database().ref('stella_market/'+id+'/boughtAt').set(Date.now());
  }catch(e){alert('실패: '+e.message);}
}
async function marketDone(id) {
  try{
    await firebase.database().ref('stella_market/'+id+'/status').set('done');
    await firebase.database().ref('stella_market/'+id+'/doneAt').set(Date.now());
  }catch(e){alert('실패: '+e.message);}
}

// ── 재고 등록 ────────────────────────────────────────────────
function _buildRequestForm() {
  var members=(window.members||[]).map(function(m){return m.name||m.mc;}).filter(Boolean);
  var nameChips=members.map(function(n){
    return '<label class="market-name-chip" id="nc-'+n+'">'+
      '<input type="radio" name="mkt-from-radio" value="'+n+'" onchange="marketNameSelect(\''+n+'\')">'+n+
    '</label>';
  }).join('');
  var cropChips=CROP_ITEMS.map(function(c){
    return '<label class="market-item-chip" title="제철: '+c.seasons+'">'+
      '<input type="checkbox" name="mkt-crop" value="'+c.name+'" onchange="marketUpdateItems()">'+
      '<img src="'+c.icon+'" alt="'+c.name+'" loading="lazy" onerror="this.style.display=\'none\'">'+
      '<span>'+c.name+'</span>'+
    '</label>';
  }).join('');
  var fishChips=FISH_ITEMS.map(function(name){
    return '<label class="market-item-chip">'+
      '<input type="checkbox" name="mkt-fish" value="'+name+'" onchange="marketUpdateItems()">'+
      '<span>🐟 '+name+'</span>'+
    '</label>';
  }).join('');
  return '<div class="calc-card">'+
    '<div class="calc-card-hd"><div class="calc-card-icon">📦</div>'+
      '<div><div class="calc-card-title">재고 등록</div><div class="calc-card-sub">내 재고 현황을 등록해 요리사와 공유해요</div></div></div>'+
    '<div class="calc-section-label">등록 유형</div>'+
    '<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">'+
      '<label class="market-type-chip active" id="chip-farmer" onclick="marketTypeChange(\'farmer\')"><input type="radio" name="mkt-type" value="farmer" checked> 🌾 농부 재고</label>'+
      '<label class="market-type-chip" id="chip-fisher" onclick="marketTypeChange(\'fisher\')"><input type="radio" name="mkt-type" value="fisher"> 🎣 어부 재고</label>'+
      '<label class="market-type-chip" id="chip-cook" onclick="marketTypeChange(\'cook_request\')"><input type="radio" name="mkt-type" value="cook_request"> 🍳 요리사 요청</label>'+
    '</div>'+
    '<div class="calc-section-label">내 이름</div>'+
    '<div class="market-name-chips" id="mkt-name-chips" style="margin-bottom:16px;">'+nameChips+'</div>'+
    '<div id="mkt-item-section">'+
      '<div class="calc-section-label">품목 선택 <span style="font-size:11px;color:var(--muted);">(복수 선택 가능)</span></div>'+
      '<div id="mkt-crop-section"><div class="market-chip-grid">'+cropChips+'</div></div>'+
      '<div id="mkt-fish-section" style="display:none;"><div class="market-chip-grid">'+fishChips+'</div></div>'+
    '</div>'+
    '<div id="mkt-qty-section" style="display:none;">'+
      '<div class="calc-section-label" style="margin-top:16px;">수량 · 별 등급 <span style="font-size:11px;color:var(--red);">*필수</span></div>'+
      '<div id="mkt-qty-list"></div>'+
    '</div>'+
    '<div class="calc-section-label" style="margin-top:16px;">메모 <span style="font-size:11px;color:var(--muted);">(선택)</span></div>'+
    '<input class="input" id="mkt-note" type="text" placeholder="만나서 거래하는 걸 원해요!" style="margin-bottom:20px;">'+
    '<button class="btn btn-primary" onclick="marketSubmit(this)" style="width:100%;">재고 등록하기</button>'+
  '</div>';
}

function marketNameSelect(name) {
  document.querySelectorAll('.market-name-chip').forEach(function(c){c.classList.remove('active');});
  var chip=document.getElementById('nc-'+name);
  if(chip)chip.classList.add('active');
}
function marketTypeChange(type) {
  var r=document.querySelector('input[name="mkt-type"][value="'+type+'"]');
  if(r)r.checked=true;
  ['farmer','fisher','cook'].forEach(function(t){var e=document.getElementById('chip-'+t);if(e)e.classList.remove('active');});
  var ac=document.getElementById(type==='cook_request'?'chip-cook':'chip-'+type);
  if(ac)ac.classList.add('active');
  var cs=document.getElementById('mkt-crop-section');
  var fs=document.getElementById('mkt-fish-section');
  if(cs)cs.style.display=(type==='farmer'||type==='cook_request')?'':'none';
  if(fs)fs.style.display=(type==='fisher'||type==='cook_request')?'':'none';
  document.querySelectorAll('input[name="mkt-crop"],input[name="mkt-fish"]').forEach(function(cb){
    cb.checked=false;var l=cb.closest('label');if(l)l.classList.remove('active');
  });
  marketUpdateItems();
}
function marketUpdateItems() {
  var crops=Array.from(document.querySelectorAll('input[name="mkt-crop"]:checked')).map(function(cb){return cb.value;});
  var fish=Array.from(document.querySelectorAll('input[name="mkt-fish"]:checked')).map(function(cb){return cb.value;});
  var all=crops.concat(fish);
  document.querySelectorAll('.market-item-chip input').forEach(function(cb){var l=cb.closest('label');if(l)l.classList.toggle('active',cb.checked);});
  var qs=document.getElementById('mkt-qty-section');
  var ql=document.getElementById('mkt-qty-list');
  if(!qs||!ql)return;
  if(!all.length){qs.style.display='none';return;}
  qs.style.display='';
  var ex=Array.from(ql.querySelectorAll('[data-item]')).map(function(el){return el.dataset.item;});
  ex.forEach(function(name){if(all.indexOf(name)===-1){var el=ql.querySelector('[data-item="'+name+'"]');if(el)el.remove();}});
  all.forEach(function(name){
    if(ex.indexOf(name)===-1){
      var row=document.createElement('div');
      row.className='market-qty-row';row.dataset.item=name;
      row.innerHTML=
        '<span class="market-qty-label">'+name+'</span>'+
        '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">'+
          '<input class="input" type="number" min="0" placeholder="수량" id="qty-'+name+'" style="width:75px;text-align:right;">'+
          '<select class="input calc-select" id="unit-'+name+'" style="width:82px;">'+
            '<option value="개">개</option><option value="set">셋</option><option value="shulker">셜커</option>'+
          '</select>'+
          '<label class="market-star-sm" id="chip-silver-'+name+'"><input type="checkbox" id="silver-'+name+'" onchange="marketStarChange(\''+name+'\')"> ⭐ 은별</label>'+
          '<label class="market-star-sm" id="chip-gold-'+name+'"><input type="checkbox" id="gold-'+name+'" onchange="marketStarChange(\''+name+'\')"> 🌟 금별</label>'+
        '</div>';
      ql.appendChild(row);
    }
  });
}
function marketStarChange(name) {
  var s=document.getElementById('silver-'+name),g=document.getElementById('gold-'+name);
  var cs=document.getElementById('chip-silver-'+name),cg=document.getElementById('chip-gold-'+name);
  if(cs)cs.classList.toggle('active',s&&s.checked);
  if(cg)cg.classList.toggle('active',g&&g.checked);
}
async function marketSubmit(btn) {
  var type=(document.querySelector('input[name="mkt-type"]:checked')||{}).value;
  var fromEl=document.querySelector('input[name="mkt-from-radio"]:checked');
  var from=fromEl?fromEl.value:'';
  var note=(document.getElementById('mkt-note')||{}).value;
  if(!from){alert('내 이름을 선택해주세요.');return;}
  var crops=Array.from(document.querySelectorAll('input[name="mkt-crop"]:checked')).map(function(cb){return cb.value;});
  var fish=Array.from(document.querySelectorAll('input[name="mkt-fish"]:checked')).map(function(cb){return cb.value;});
  var all=crops.concat(fish);
  if(!all.length){alert('품목을 하나 이상 선택해주세요.');return;}
  var items=all.map(function(name){
    var q=document.getElementById('qty-'+name),u=document.getElementById('unit-'+name);
    var s=document.getElementById('silver-'+name),g=document.getElementById('gold-'+name);
    var grades=[(s&&s.checked?'은별':''),(g&&g.checked?'금별':'')].filter(Boolean).join('·');
    return {name:name,qty:q&&q.value?q.value:'',unit:u&&u.value?u.value:'개',grade:grades};
  });
  btn.textContent='등록 중...';btn.disabled=true;
  try{
    var id='mkt_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
    var obj={type:type,from:from,status:'open',createdAt:Date.now(),items:items};
    if(note)obj.note=note;
    await firebase.database().ref('stella_market/'+id).set(obj);
    alert('재고가 등록됐어요!');
    switchMarketTab('board',document.querySelector('[data-tab="board"]'));
  }catch(e){alert('등록 실패: '+e.message);btn.textContent='재고 등록하기';btn.disabled=false;}
}

// ── 완료 내역 ────────────────────────────────────────────────
function _buildHistory() {
  var done=Object.entries(_marketData).filter(function(e){return e[1]&&e[1].status==='done';})
    .sort(function(a,b){return(b[1].doneAt||b[1].createdAt||0)-(a[1].doneAt||a[1].createdAt||0);});
  if(!done.length)return '<div class="empty"><div style="font-size:36px;margin-bottom:10px;">📦</div><div style="color:var(--muted);">완료된 거래가 없어요.</div></div>';
  return '<div class="market-grid">'+done.map(function(entry){
    var id=entry[0],d=entry[1];
    var itHtml=(d.items||[]).map(function(it){
      var g=it.grade?' <span style="font-size:10px;color:var(--amber);">('+it.grade+')</span>':'';
      return '<span class="mat-tag">'+it.name+g+(it.qty?' ×'+it.qty+_ul(it.unit):'' )+'</span>';
    }).join('');
    var del=isAdmin()?'<button class="btn btn-sm btn-danger" onclick="marketDelete(\''+id+'\')">삭제</button>':'';
    return '<div class="market-card market-card--done">'+
      '<div class="market-card-hd">'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+_typeBadge(d.type)+_statusBadge(d.status)+'</div>'+
        '<div style="text-align:right;line-height:1.9;">'+
          '<div style="font-size:11px;color:var(--muted);">📝 등록 '+_fmtTime(d.createdAt)+'</div>'+
          (d.boughtAt?'<div style="font-size:11px;color:var(--amber);">🛒 구매 '+_fmtTime(d.boughtAt)+'</div>':'')+
          (d.doneAt?'<div style="font-size:11px;color:var(--teal);">✅ 완료 '+_fmtTime(d.doneAt)+'</div>':'')+
        '</div>'+
      '</div>'+
      '<div class="market-card-from"><span style="font-size:14px;font-weight:800;color:var(--text);">'+(d.from||'?')+'</span></div>'+
      '<div class="market-card-items">'+(itHtml||'')+'</div>'+
      (d.note?'<div class="market-card-note">'+d.note+'</div>':'')+
      (del?'<div class="market-card-actions">'+del+'</div>':'')+
    '</div>';
  }).join('')+'</div>';
}
async function marketDelete(id){
  if(!confirm('이 내역을 삭제할까요?'))return;
  try{await firebase.database().ref('stella_market/'+id).remove();}catch(e){alert('실패: '+e.message);}
}
