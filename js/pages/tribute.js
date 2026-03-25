/* ═══ 조공 포인트 ═══ */

const TB_GOAL=6000;
let tribute = {};
let tributeLog = [];

function saveTributeLog(){
  window._fbSet('stella_tribute_log', tributeLog.length ? tributeLog : []);
}

function saveTribute(){
  window._fbSet('stella_tribute', Object.keys(tribute).length ? tribute : {});
}

function _initTributeSync(){
  if(!window._fbOn){setTimeout(_initTributeSync,100);return;}
  window._fbOn('stella_tribute', val => {
    tribute = val && typeof val === 'object' && !Array.isArray(val) ? val : {};
    renderTribute();
    updateDashboard();
  });
  window._fbOn('stella_tribute_log', val => {
    tributeLog = val && Array.isArray(val) ? val : (val ? Object.values(val) : []);
    renderTribute();
  });
}

function addLog(msg){const now=new Date();tributeLog.push({time:now.toLocaleString('ko-KR'),msg});saveTributeLog();}
function renderTribute(){
  const tbq=(document.getElementById('tb-search')||{}).value||''.trim().toLowerCase();
  const names=Object.keys(tribute).sort().filter(n=>!tbq||n.toLowerCase().includes(tbq));
  const total=names.reduce((s,n)=>s+tribute[n],0);
  const done=names.filter(n=>tribute[n]>=TB_GOAL).length;
  document.getElementById('tb-summary').innerHTML=`
    <div class="tb-scard"><div class="tb-sval">${names.length}</div><div class="tb-slbl">참여 인원</div></div>
    <div class="tb-scard"><div class="tb-sval" style="color:#fbbf24;">${total.toLocaleString()}</div><div class="tb-slbl">총 포인트</div></div>
    <div class="tb-scard"><div class="tb-sval" style="color:#4ade80;">${done}/${names.length}</div><div class="tb-slbl">목표 달성</div></div>`;
  const list=document.getElementById('tb-list');

  // 조공 목록
  let listHtml = names.length
    ? names.map(n=>{
        const pts=tribute[n];
        const pct=Math.min(100,pts/TB_GOAL*100);
        return `<div class="tb-row">
          <div class="tb-row-name">${n}</div>
          <div class="tb-row-bar"><div class="tb-row-fill" style="width:${pct}%;${pct>=100?'background:linear-gradient(90deg,#4ade80,#16a34a);color:#052e16;':''}">${pct>=10?Math.round(pct)+'%':''}</div></div>
          <div class="tb-row-pts">${pts.toLocaleString()}P</div>
          <span class="tb-row-del" onclick="editTribute('${n}')" title="수정">✏️</span>
          <span class="tb-row-del" onclick="delTribute('${n}')" title="삭제">✕</span>
        </div>`;
      }).join('')
    : '<div class="mm-empty">조공 기록을 추가해주세요.</div>';

  // 조공 로그 (항상 렌더, 없으면 빈 상태 표시)
  const logEntries = tributeLog.length
    ? tributeLog.slice(-50).reverse().map(l=>`
        <div style="font-size:10px;color:var(--muted);padding:4px 0;border-bottom:1px solid var(--b1);display:flex;gap:8px;align-items:baseline;">
          <span style="color:var(--sub);flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:9.5px;">${l.time}</span>
          <span>${l.msg}</span>
        </div>`).join('')
    : '<div style="text-align:center;padding:12px;color:var(--muted);font-size:11px;">아직 로그가 없어요.</div>';

  listHtml += `
    <div style="margin-top:20px;">
      <div style="font-size:11px;color:var(--sub);font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
        📜 조공 로그
        <span style="font-size:9.5px;color:var(--muted);font-weight:400;">최근 50개</span>
      </div>
      <div style="max-height:220px;overflow-y:auto;border:1px solid var(--b1);border-radius:6px;padding:6px 10px;">
        ${logEntries}
      </div>
    </div>`;

  list.innerHTML = listHtml;
}

function openTributeModal(){
  document.getElementById('tb-modal-root').innerHTML=`<div class="mb-modal-bg" onclick="if(event.target===this)closeTributeModal()">
    <div class="mb-modal"><h3>조공 추가</h3>
      <label>이름</label><input id="tb-name" placeholder="마을원 이름" onkeydown="if(event.key==='Enter')document.getElementById('tb-pts').focus()">
      <label>포인트</label><input id="tb-pts" type="number" placeholder="추가할 포인트" min="1" onkeydown="if(event.key==='Enter')addTribute()">
      <div class="mb-modal-btns"><button class="mb-btn" onclick="closeTributeModal()">취소</button><button class="mb-btn mb-btn-add" style="background:linear-gradient(135deg,#fbbf24,#d97706);" onclick="addTribute()">추가</button></div>
    </div></div>`;
  setTimeout(()=>document.getElementById('tb-name').focus(), 50);
}

function closeTributeModal(){document.getElementById('tb-modal-root').innerHTML='';}
function addTribute(){
  const n=document.getElementById('tb-name').value.trim();
  const pts=parseInt(document.getElementById('tb-pts').value)||0;
  if(!n||!pts){alert('이름과 포인트를 입력하세요.');return;}
  tribute[n]=(tribute[n]||0)+pts;
  addLog(n+' +'+pts+'P 추가');
  saveTribute();renderTribute();closeTributeModal();
}

function delTribute(n){if(!requireAdmin())return;if(confirm(n+' 기록 삭제?')){addLog(n+' 삭제됨 (관리자, 기존 '+tribute[n]+'P)');delete tribute[n];saveTribute();renderTribute();}}
function resetTribute(){if(!requireAdmin())return;const pw=prompt('초기화 확인용 비밀번호:');if(!pw)return;hashPW(pw).then(h=>{if(h!==ADMIN_HASH){alert('비밀번호 오류');return;}if(confirm('조공 데이터 초기화?')){addLog('전체 조공 초기화 (관리자)');tribute={};saveTribute();renderTribute();}});}

function editTribute(n){
  const cur=tribute[n]||0;
  const val=prompt(n+' 포인트 수정 (현재: '+cur+'P):',cur);
  if(val===null)return;
  const nv=parseInt(val);if(isNaN(nv))return;
  addLog(n+' 포인트 수정: '+cur+'P → '+nv+'P');
  tribute[n]=nv;saveTribute();renderTribute();
}

function _updateTributeAdminUI(){const b=document.getElementById('tb-reset-btn');if(b)b.style.display=isAdmin?'':'none';}

