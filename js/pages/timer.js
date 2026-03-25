/* ═══ 타이머 & 메모장 ═══ */

let pomoInterval,pomoRunning=false,pomoOnBreak=false,pomoTime=25*60;
let swInterval,swRunning=false,swTime=0;
let cdInterval,cdRunning=false,cdTime=0;
let memos=JSON.parse(localStorage.getItem('stella_memos')||'[]');

function fmtTime(s){const m=Math.floor(s/60);return String(m).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function fmtSW(ms){const s=Math.floor(ms/1000);const m=Math.floor(s/60);return String(m).padStart(2,'0')+':'+String(s%60).padStart(2,'0')+'.'+Math.floor((ms%1000)/100);}

function toggleSW(){
  if(swRunning){clearInterval(swInterval);swRunning=false;document.getElementById('sw-btn').textContent='계속';document.getElementById('sw-btn').className='tm-btn tm-btn-start';document.getElementById('sw-display').className='tm-display paused';return;}
  swRunning=true;const start=Date.now()-swTime;
  document.getElementById('sw-btn').textContent='정지';document.getElementById('sw-btn').className='tm-btn tm-btn-stop';document.getElementById('sw-display').className='tm-display running';
  swInterval=setInterval(()=>{swTime=Date.now()-start;document.getElementById('sw-display').textContent=fmtSW(swTime);},100);
}

function resetSW(){clearInterval(swInterval);swRunning=false;swTime=0;document.getElementById('sw-display').textContent='00:00.0';document.getElementById('sw-display').className='tm-display';document.getElementById('sw-btn').textContent='시작';document.getElementById('sw-btn').className='tm-btn tm-btn-start';}


function toggleCD(){
  if(cdRunning){clearInterval(cdInterval);cdRunning=false;document.getElementById('side-cd-btn').textContent='계속';document.getElementById('side-cd-btn').className='tm-btn tm-btn-start';document.getElementById('side-cd-display').className='tm-display paused';return;}
  if(cdTime<=0)cdTime=parseInt(document.getElementById('cd-min').value)*60+parseInt(document.getElementById('cd-sec').value);
  if(cdTime<=0)return;
  cdRunning=true;
  document.getElementById('side-cd-btn').textContent='정지';document.getElementById('side-cd-btn').className='tm-btn tm-btn-stop';document.getElementById('side-cd-display').className='tm-display running';
  cdInterval=setInterval(()=>{
    cdTime--;document.getElementById('side-cd-display').textContent=fmtTime(cdTime);
    if(cdTime<=0){clearInterval(cdInterval);cdRunning=false;document.getElementById('side-cd-display').className='tm-display';document.getElementById('side-cd-btn').textContent='시작';document.getElementById('side-cd-btn').className='tm-btn tm-btn-start';document.getElementById('side-cd-label').textContent='⏰ 완료!';try{new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=').play();}catch(e){}}
  },1000);
}

function resetCD(){clearInterval(cdInterval);cdRunning=false;cdTime=0;document.getElementById('side-cd-display').textContent='00:00';document.getElementById('side-cd-display').className='tm-display';document.getElementById('side-cd-btn').textContent='시작';document.getElementById('side-cd-btn').className='tm-btn tm-btn-start';document.getElementById('side-cd-label').textContent='요리 시간, 강화 대기 등에 활용';}


function saveMemos(){localStorage.setItem('stella_memos',JSON.stringify(memos));}
function renderMemos(){
  const list=document.getElementById('mm-list');
  if(!list)return;
  if(!memos.length){list.innerHTML='<div class="mm-empty">📋 메모를 추가해주세요.</div>';return;}
  list.innerHTML=memos.map((m,i)=>`<div class="mm-card">
    <input class="mm-card-title" value="${m.title.replace(/"/g,'&quot;')}" onchange="updateMemo(${i},'title',this.value)" style="background:transparent;border:none;outline:none;font-size:13px;font-weight:700;color:var(--text);width:100%;font-family:'Noto Sans KR',sans-serif;">
    <textarea class="mm-card-body" onchange="updateMemo(${i},'body',this.value)" style="background:transparent;border:1px solid var(--b1);border-radius:4px;padding:6px;outline:none;resize:vertical;min-height:60px;font-family:'Noto Sans KR',sans-serif;color:var(--sub);font-size:11.5px;">${m.body}</textarea>
    <div class="mm-card-footer"><span>${m.date}</span><span class="mm-card-del" onclick="delMemo(${i})">삭제</span></div>
  </div>`).join('');
}

function addMemo(){
  const now=new Date();
  memos.unshift({title:'새 메모',body:'',date:now.toLocaleDateString('ko-KR')});
  saveMemos();
  renderMemos();
  renderSideMemos();
}

function updateMemo(i,field,val){memos[i][field]=val;saveMemos();}
function delMemo(i){if(confirm('메모 삭제?')){memos.splice(i,1);saveMemos();renderMemos();}}

function exportMemos(){navigator.clipboard.writeText(JSON.stringify(memos,null,2)).then(()=>alert('복사됨!'));}
function importMemos(){const d=prompt('JSON 붙여넣기:');if(!d)return;try{memos=JSON.parse(d);saveMemos();renderMemos();}catch(e){alert('형식 오류');}}

function toggleSideMemo(){
  document.getElementById('side-timer').classList.remove('open');
  document.getElementById('side-memo').classList.toggle('open');
  renderSideMemos();
}

function toggleSideTimer(){
  document.getElementById('side-memo').classList.remove('open');
  document.getElementById('side-timer').classList.toggle('open');
}

function renderSideMemos(){
  const list=document.getElementById('side-mm-list');
  if(!list)return;
  if(!memos.length){list.innerHTML='<div style="text-align:center;padding:20px;color:var(--muted);font-size:11px;">메모를 추가해주세요.</div>';return;}
  list.innerHTML=memos.map((m,i)=>`<div style="background:var(--s2);border:1px solid var(--b1);border-radius:6px;padding:8px 10px;margin-bottom:6px;">
    <input value="${m.title.replace(/"/g,'&quot;')}" onchange="updateMemo(${i},'title',this.value);renderSideMemos();" style="background:transparent;border:none;outline:none;font-size:12px;font-weight:700;color:var(--text);width:100%;font-family:'Noto Sans KR',sans-serif;margin-bottom:4px;">
    <textarea onchange="updateMemo(${i},'body',this.value)" style="background:transparent;border:1px solid var(--b1);border-radius:4px;padding:4px 6px;outline:none;resize:vertical;min-height:40px;width:100%;font-family:'Noto Sans KR',sans-serif;color:var(--sub);font-size:10.5px;box-sizing:border-box;">${m.body}</textarea>
    <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin-top:3px;"><span>${m.date}</span><span style="cursor:pointer;" onclick="delMemo(${i});renderSideMemos();">삭제</span></div>
  </div>`).join('');
}
