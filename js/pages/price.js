/* ═══ price ═══ */
const PRICE_CATS = {
  crop: { label:'🌾 농작물', fbKey:'stella_price_crop' },
  fish: { label:'🐟 물고기', fbKey:'stella_price_fish' },
  food: { label:'🍳 요리',   fbKey:'stella_price_food' }
};
let curPriceTab = 'crop';
const _priceSecOpen = { crop:true, fish:false, food:false };
const FOOD_IMG={
  '가스파초':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FErXuYWvp7DaUw5ixp4gb%252F2026-01-28_142514-Photoroom.png%3Falt%3Dmedia%26token%3D244a0fd7-ca47-45b0-b9f6-32d2daec5648&width=300&dpr=1&quality=100&sign=25df63fd&sv=2',
  '데리야끼':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FWazrHJQ3aETvW4E7JWWV%252F2026-01-28_142601-Photoroom.png%3Falt%3Dmedia%26token%3D861802af-6d5c-45a9-903f-2fa3215f364b&width=300&dpr=1&quality=100&sign=e8caa11a&sv=2',
  '무 착즙 주스':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FL66D6NymOq9Vs6TNVMuT%252F2026-01-28_142522-Photoroom.png%3Falt%3Dmedia%26token%3Ddbf07792-38a8-4227-9df0-976a1d2eb779&width=300&dpr=1&quality=100&sign=fcf6c216&sv=2',
  '무조림':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FVxPpEFqIjv5rMp8LpDgz%252F2026-01-28_142507-Photoroom.png%3Falt%3Dmedia%26token%3D5ecbfc5a-8111-4453-9866-72f21e7baba2&width=300&dpr=1&quality=100&sign=99e469de&sv=2',
  '부야베스':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FeayMl2fdRbxrvCCqjKgE%252F2026-01-28_142527-Photoroom.png%3Falt%3Dmedia%26token%3D2f2848e4-694f-4da3-abc8-c02e0edafb04&width=300&dpr=1&quality=100&sign=db88edf2&sv=2',
  '세비체':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F0ATU1S6Khf55SaotyXke%252F2026-01-28_142546-Photoroom.png%3Falt%3Dmedia%26token%3Da0c5779e-648c-4cd6-8089-dabfce9d3571&width=300&dpr=1&quality=100&sign=3a920968&sv=2',
  '쌈밥':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FjDEsKOdsvxKZZ9OAKjfc%252F2026-01-28_142454-Photoroom.png%3Falt%3Dmedia%26token%3Db42c97a6-c2cc-4ac8-98eb-b578682d8620&width=300&dpr=1&quality=100&sign=a57fb6cd&sv=2',
  '양장피':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FHndUKQUDEpkMo5sK1f1W%252F2026-01-28_142612-Photoroom.png%3Falt%3Dmedia%26token%3D33baa53d-2f81-46f2-9a0a-58ce1cf061f7&width=300&dpr=1&quality=100&sign=e1ee472c&sv=2',
  '에스카베체':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FwtZ7JYb7e795QNsLvh4n%252F2026-01-28_142605-Photoroom.png%3Falt%3Dmedia%26token%3Daaaa26b2-94a9-41ff-91cf-12d5e002dd57&width=300&dpr=1&quality=100&sign=630ca7b1&sv=2',
  '옥수수 전':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FH2HaOgHFH4vSHX8h4HlI%252F2026-01-28_142459-Photoroom.png%3Falt%3Dmedia%26token%3D4a1a8918-03a7-4672-b094-d5ca16e3f966&width=300&dpr=1&quality=100&sign=b6598bc2&sv=2',
  '옥수수 착즙 주스':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FfZUYZpzVRPqZmpcVUg1w%252F2026-01-28_142518-Photoroom.png%3Falt%3Dmedia%26token%3Dfa835b06-be86-42f2-aa59-765171085c9f&width=300&dpr=1&quality=100&sign=96370c65&sv=2',
  '전골':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F3yLchigMHfSxkSKlDzd1%252F2026-01-28_142503-Photoroom.png%3Falt%3Dmedia%26token%3D76715517-51c6-42e8-b0fc-373994254e1b&width=300&dpr=1&quality=100&sign=de847d51&sv=2',
  '치오피노':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FsqxOskduiRPRSVs5jlp1%252F2026-01-28_142533-Photoroom.png%3Falt%3Dmedia%26token%3Df4f3aa12-9d54-458f-85a5-bc027498043e&width=300&dpr=1&quality=100&sign=8b7dbe3f&sv=2',
  '파에야':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F2yLZ0dQt90pc2ANN7jde%252F2026-01-28_142542-Photoroom.png%3Falt%3Dmedia%26token%3D6df82eb2-8684-4177-812c-4353d4b10c41&width=300&dpr=1&quality=100&sign=2d1224f8&sv=2',
  '페페스':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FG5P4Cbz4uurZatCCCFXp%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-01-29%2520143355-Photoroom.png%3Falt%3Dmedia%26token%3D40ae4cad-96dc-499e-adab-8657b39d94d6&width=300&dpr=1&quality=100&sign=671c10dd&sv=2',
  '해산물 그릴 플래터':'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FcTWfoYqUbLjjadGhDyr8%252F2026-01-28_142556-Photoroom.png%3Falt%3Dmedia%26token%3D2e68abea-32fb-4cf3-ad94-daa9b1dd5b20&width=300&dpr=1&quality=100&sign=8321cb4f&sv=2',
};

function initExpiry(){
  const now=new Date();
  const local=new Date(now-now.getTimezoneOffset()*60000).toISOString().slice(0,16);
  const el1=document.getElementById('exp-date');
  const el2=document.getElementById('exp-sell');
  if(el1)el1.value=local;
  if(el2)el2.value=local;
  calcExpiry();
}

function applyExpiryToCards(){
  const expDate=document.getElementById('exp-date')?new Date(document.getElementById('exp-date').value):null;
  const sellDate=document.getElementById('exp-sell')?new Date(document.getElementById('exp-sell').value):null;
  if(!expDate||!sellDate||isNaN(expDate.getTime())||isNaN(sellDate.getTime()))return;
  const diffH=(sellDate-expDate)/3600000;
  let rate=1;
  if(diffH>0&&diffH<=6)rate=0.8;
  else if(diffH>6&&diffH<=12)rate=0.6;
  else if(diffH>12)rate=0.4;
  document.querySelectorAll('.food-price-tag').forEach(el=>{
    const orig=parseInt(el.dataset.orig);
    if(!orig)return;
    if(rate<1){el.textContent=Math.round(orig*rate)+'셀';el.style.color='#f87171';el.title='원가 '+orig+'셀 → 감가 '+Math.round((1-rate)*100)+'%';}
    else{el.textContent=orig+'셀';el.style.color='';el.title='';}
  });
}

function calcExpiry(){
  const price=parseInt(document.getElementById('exp-price').value)||0;
  const v0=document.getElementById('exp-v0');
  if(v0)v0.textContent=price+' 셀';
  document.getElementById('exp-v1').textContent=Math.round(price*0.8)+' 셀';
  document.getElementById('exp-v2').textContent=Math.round(price*0.6)+' 셀';
  document.getElementById('exp-v3').textContent=Math.round(price*0.4)+' 셀';
  const expDate=new Date(document.getElementById('exp-date').value);
  const sellDate=new Date(document.getElementById('exp-sell').value);
  const status=document.getElementById('exp-status');
  if(!expDate||!sellDate||isNaN(expDate)||isNaN(sellDate)){status.textContent='';return;}
  const diffH=(sellDate-expDate)/3600000;
  if(diffH<=0){status.innerHTML='<span style="color:#4ade80;">✓ 유통기한 이내 — 감가 없음 ('+price+' 셀)</span>';}
  else if(diffH<=6){status.innerHTML='<span style="color:#d97706;">⚠ 만료 후 '+diffH.toFixed(1)+'시간 — <strong>-20%</strong> → '+Math.round(price*0.8)+' 셀</span>';}
  else if(diffH<=12){status.innerHTML='<span style="color:#ea580c;">⚠ 만료 후 '+diffH.toFixed(1)+'시간 — <strong>-40%</strong> → '+Math.round(price*0.6)+' 셀</span>';}
  else{status.innerHTML='<span style="color:#dc2626;">⚠ 만료 후 '+(diffH/24).toFixed(1)+'일 — <strong>-60%</strong> → '+Math.round(price*0.4)+' 셀</span>';}
  applyExpiryToCards();
}

function _initPriceSync(){
  if(!window._fbOn){setTimeout(_initPriceSync,100);return;}
  Object.entries(PRICE_CATS).forEach(([cat,cfg])=>{
    window._fbOn(cfg.fbKey, val=>{
      if(val && Array.isArray(val.items)){
        PT[cat].data      = val.items;
        PT[cat].savedAt   = val.savedAt||'';
        PT[cat].savedCount= val.items.length;
        // 메인 TOP3 갱신
        if (cat === 'food' && typeof renderPriceTop3 === 'function') renderPriceTop3();
      } else {
        PT[cat].data=[];PT[cat].savedAt='';PT[cat].savedCount=0;
      }
      if(_priceSecOpen[cat]) _renderPriceResult(cat);
    });
  });
}

function togglePriceSec(cat){
  _priceSecOpen[cat] = !_priceSecOpen[cat];
  _applyPriceSecState();
  if(_priceSecOpen[cat]) _buildPricePanel(cat);
}

function _applyPriceSecState(){
  Object.keys(_priceSecOpen).forEach(cat=>{
    const body=document.getElementById('psec-'+cat);
    const arrow=document.getElementById('psa-'+cat);
    if(body)body.style.display=_priceSecOpen[cat]?'':'none';
    if(arrow){
      if(_priceSecOpen[cat])arrow.classList.add('open');
      else arrow.classList.remove('open');
    }
  });
}

function switchPriceTab(cat){ /* 하위호환 — 아코디언으로 대체됨 */ }


function _buildPricePanel(cat){
  const el=document.getElementById('psec-'+cat);
  if(!el)return;
  const savedInfo = PT[cat].savedAt
    ? `<span style="font-size:10px;color:var(--muted);">마지막 업데이트: <strong style="color:var(--sub);">${PT[cat].savedAt}</strong> · ${PT[cat].savedCount}개</span>`
    : `<span style="font-size:10px;color:var(--muted);">아직 저장된 시세가 없어요</span>`;
  el.innerHTML=`
    <div class="price-input-area">
      <div class="pi-label">📋 디스코드 메시지
        <span class="pi-hint">— 변동 가격 메시지를 그대로 붙여넣고 분석하기를 누르면 전체 공유됩니다.</span>
      </div>
      <textarea class="pi-textarea" id="msg-${cat}"
        placeholder="# 상점의 변동 가격이 갱신되었습니다.
📈 상승 아이템
- [레어] 아이템 이름
  - \`원가\`: 90
  - \`이전 변동가\`: 92
  - \`현재 변동가\`: 95
  - \`원가 대비 변동폭\`: +5
📉 하락 아이템
- [커먼] 아이템 이름
  ..."></textarea>
    </div>
    <div class="price-btn-row">
      <button class="parse-btn" onclick="parseAndSave('${cat}')">📊 분석 &amp; 공유</button>
      <button class="clear-btn" onclick="clearPrice('${cat}')">초기화</button>
      <span class="parse-info" id="parse-info-${cat}"></span>
      <span style="margin-left:auto;">${savedInfo}</span>
    </div>
    <div id="price-result-area-${cat}">
      ${PT[cat].data.length ? '' : `<div class="price-empty"><div class="price-empty-icon">📋</div><div class="price-empty-text">디스코드 메시지를 붙여넣고 분석하기를 눌러주세요.<br>분석 결과는 마을원 전체에게 실시간 공유됩니다.</div></div>`}
    </div>`;
  if(PT[cat].data.length) _renderPriceResult(cat);
}

function parseAndSave(cat){
  const text=document.getElementById('msg-'+cat).value;
  const items=parseDiscordMsg(text);
  const info=document.getElementById('parse-info-'+cat);
  if(!items.length){
    info.textContent='⚠ 파싱된 아이템이 없어요. 형식을 확인해 주세요.';
    info.style.color='#f87171';return;
  }
  info.textContent=`✓ ${items.length}개 분석 완료 — 저장 중...`;
  info.style.color='#fbbf24';
  const savedAt=new Date().toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
  PT[cat].data=items; PT[cat].savedAt=savedAt; PT[cat].savedCount=items.length;
  window._fbSet(PRICE_CATS[cat].fbKey,{items,savedAt});
  info.textContent=`✓ ${items.length}개 파싱 완료 · 전체 공유됨`;
  info.style.color='#4ade80';
  PT[cat].filterGrade='all'; PT[cat].filterDir='all';
  _renderPriceResult(cat);
}

function clearPrice(cat){
  const ta=document.getElementById('msg-'+cat);
  if(ta)ta.value='';
  const info=document.getElementById('parse-info-'+cat);
  if(info)info.textContent='';
  PT[cat].filterGrade='all'; PT[cat].filterDir='all';
  _renderPriceResult(cat);
}

function setPriceFilter(cat,type,val){
  PT[cat]['filter'+type.charAt(0).toUpperCase()+type.slice(1)]=val;
  _renderPriceResult(cat);
}

function _renderPriceResult(cat){
  const area=document.getElementById('price-result-area-'+cat);
  if(!area)return;
  const state=PT[cat];
  const priceData=state.data;
  if(!priceData.length){
    area.innerHTML=`<div class="price-empty"><div class="price-empty-icon">📋</div><div class="price-empty-text">디스코드 메시지를 붙여넣고 분석하기를 눌러주세요.<br>분석 결과는 마을원 전체에게 실시간 공유됩니다.</div></div>`;
    return;
  }
  const {filterGrade,filterDir}=state;
  let filtered=priceData.filter(i=>{
    if(filterGrade!=='all'&&i.grade!==filterGrade)return false;
    if(filterDir==='up'&&i.diff<=0)return false;
    if(filterDir==='down'&&i.diff>=0)return false;
    if(filterDir==='flat'&&i.diff!==0)return false;
    return true;
  });
  filtered.sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  const upCnt=priceData.filter(i=>i.diff>0).length;
  const downCnt=priceData.filter(i=>i.diff<0).length;
  const maxUp=priceData.reduce((m,i)=>i.diff>m?i.diff:m,0);
  const maxDown=priceData.reduce((m,i)=>i.diff<m?i.diff:m,0);
  const grades=[...new Set(priceData.map(i=>i.grade))];
  const gradeOrder=['커먼','언커먼','레어','일반','고급','희귀'];
  grades.sort((a,b)=>gradeOrder.indexOf(a)-gradeOrder.indexOf(b));
  const gBtns=grades.map(g=>`<button class="pf-btn ${filterGrade===g?'on':''}" onclick="setPriceFilter('${cat}','grade','${g}')">${g}</button>`).join('');
  area.innerHTML=`
    <div class="price-summary">
      <div class="ps-card"><div class="ps-val" style="color:#4ade80;">${upCnt}</div><div class="ps-lbl">📈 상승</div></div>
      <div class="ps-card"><div class="ps-val" style="color:#f87171;">${downCnt}</div><div class="ps-lbl">📉 하락</div></div>
      <div class="ps-card"><div class="ps-val" style="color:#4ade80;">+${maxUp}</div><div class="ps-lbl">최고 상승폭</div></div>
      <div class="ps-card"><div class="ps-val" style="color:#f87171;">${maxDown}</div><div class="ps-lbl">최고 하락폭</div></div>
    </div>
    <div class="price-filter-bar">
      <span class="pf-label">방향</span>
      <button class="pf-btn ${filterDir==='all'?'on':''}" onclick="setPriceFilter('${cat}','dir','all')">전체</button>
      <button class="pf-btn ${filterDir==='up'?'on':''}" onclick="setPriceFilter('${cat}','dir','up')">📈 상승</button>
      <button class="pf-btn ${filterDir==='down'?'on':''}" onclick="setPriceFilter('${cat}','dir','down')">📉 하락</button>
      <button class="pf-btn ${filterDir==='flat'?'on':''}" onclick="setPriceFilter('${cat}','dir','flat')">➖ 보합</button>
      <div class="pf-sep"></div>
      <span class="pf-label">등급</span>
      <button class="pf-btn ${filterGrade==='all'?'on':''}" onclick="setPriceFilter('${cat}','grade','all')">전체</button>
      ${gBtns}
    </div>
    <div class="price-result-wrap">
      ${filtered.length===0
        ?`<div style="grid-column:span 3;text-align:center;padding:40px;color:var(--muted);">필터 조건에 맞는 아이템이 없어요.</div>`
        :filtered.map(item=>renderCard(item)).join('')}
    </div>`;
}

function renderCard(item){
  const dir=item.diff!==null?(item.diff>0?'up':item.diff<0?'down':'flat'):'flat';
  const diffSign=item.diff>0?'+':'';
  const diffIcon=item.diff>0?'▲':item.diff<0?'▼':'─';
  const pctRaw=(item.base&&item.diff!==null)?((item.diff/item.base)*100):null;
  const pct=pctRaw!==null?(pctRaw>=0?'+':'')+pctRaw.toFixed(1)+'%':'';
  const prevDiff=(item.prev!==null&&item.current!==null)?item.current-item.prev:null;
  const prevDiffStr=prevDiff!==null?`<span style="font-size:10px;color:${prevDiff>0?'#4ade80':prevDiff<0?'#f87171':'var(--muted)'};">&nbsp;${prevDiff>0?'▲':prevDiff<0?'▼':'─'}${prevDiff>0?'+':''}${prevDiff}</span>`:'';
  const partialBadge=item.partial?`<span style="font-size:9px;color:var(--muted);background:var(--s3);border:1px solid var(--b2);padding:1px 5px;border-radius:3px;margin-left:auto;">부분</span>`:'';
  const diffHtml=item.diff!==null?`<span class="pr-diff ${dir}">${diffIcon} ${diffSign}${item.diff} 셀</span><span style="font-size:11px;font-weight:700;color:${dir==='up'?'#4ade80':dir==='down'?'#f87171':'var(--muted)'};">${pct}</span>`:`<span style="font-size:11px;color:var(--muted);">데이터 부족</span>`;
  const imgUrl=getFoodImg(item.name);
  const imgHtml=imgUrl?`<img class="pr-img" src="${imgUrl}" alt="${item.name}">`:`<div class="pr-img-empty">🍽</div>`;
  return `<div class="pr-card ${dir}">
    <div class="pr-head">${imgHtml}
      <div class="pr-head-info">
        <div style="display:flex;align-items:center;gap:5px;">
          <span class="pr-grade g-${item.grade}">${item.grade}</span>
          <span class="pr-name" title="${item.name}">${item.name}</span>${partialBadge}
        </div>
      </div>
    </div>
    <div class="pr-body">
      <div class="pr-row"><span class="pr-lbl">원가</span><span class="pr-val">${item.base??'─'}</span></div>
      <div class="pr-row"><span class="pr-lbl">이전가</span><span class="pr-val">${item.prev??'─'}${prevDiffStr}</span></div>
      <div class="pr-row" style="grid-column:span 2;justify-content:space-between;"><span class="pr-lbl">현재 변동가</span><span class="pr-val current">${item.current!==null?item.current+' 셀':'─'}</span></div>
    </div>
    <div class="pr-footer"><span class="pr-base">원가 대비</span><div style="display:flex;align-items:center;gap:6px;">${diffHtml}</div></div>
  </div>`;
}

function getFoodImg(name){
  if(FOOD_IMG[name])return FOOD_IMG[name];
  for(const k of Object.keys(FOOD_IMG)){if(name.includes(k))return FOOD_IMG[k];}
  return null;
}

