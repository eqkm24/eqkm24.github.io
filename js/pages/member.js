/* ═══ 마을원 명단 ═══ */

let members = [];
function saveMembers(){
  window._fbSet('stella_members', members.length ? members : []);
}
/* 실시간 구독 — Firebase 준비되면 연결 */
function _initMembersSync(){
  if(!window._fbOn){setTimeout(_initMembersSync,100);return;}
  window._fbOn('stella_members', val => {
    members = val && Array.isArray(val) ? val : (val ? Object.values(val) : []);
    renderMembers();
    updateDashboard();
  });
}
_initMembersSync();
function renderMembers(){
  const g=document.getElementById('mb-grid');
  if(!g)return;
  document.getElementById('mb-count').textContent=members.length+'명';
  // 초기화 버튼 관리자 시 표시
  const rb=document.getElementById('mb-reset-btn');
  if(rb)rb.style.display=isAdmin?'':'none';
  const mq=(document.getElementById('mb-search')||{}).value||"".trim().toLowerCase();
  const filtered=mq?members.filter(m=>m.name.toLowerCase().includes(mq)||m.mc.toLowerCase().includes(mq)):members;
  if(!filtered.length){g.innerHTML='<div class="mm-empty">'+(mq?'검색 결과가 없어요.':'마을원을 추가해주세요.')+'</div>';return;}
  g.innerHTML=filtered.map((m)=>{
    const idx=members.indexOf(m);
    const jobLabel=(m.jobs&&m.jobs.length)?m.jobs.join(' · '):(m.job||'');
    const avatarColor=m.color||'#38bdf8';
    const mcNick=encodeURIComponent(m.mc||m.name);
    const fallbackChar=m.name[0];
    return `<div class="mb-card" onclick="openMemberModal(${idx})" style="cursor:pointer;">
    <div class="mb-avatar" style="background:${avatarColor}22;border:2px solid ${avatarColor};overflow:hidden;padding:0;">
      <img src="https://mc-heads.net/avatar/${mcNick}/40" alt=""
        style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;display:block;"
        onerror="this.style.display='none';this.parentElement.insertAdjacentHTML('beforeend','<span style=&quot;color:${avatarColor};font-size:18px;font-weight:700;&quot;>${fallbackChar}</span>')">
    </div>
    <div class="mb-info">
      <div class="mb-name">${m.name}</div>
      <div class="mb-mc">${m.mc||''}</div>
      <div class="mb-tags">
        <span class="mb-tag ${m.type==='본계'?'mb-tag-main':'mb-tag-sub'}">${m.type}</span>
        <span class="mb-tag mb-tag-job">${jobLabel}</span>
      </div>
    </div>
    ${isAdmin?`<span class="mb-del" onclick="event.stopPropagation();delMember(${idx})">✕</span>`:''}
  </div>`;}).join('');
}
function openMemberModal(editIdx){
  const isEdit = editIdx !== undefined;
  const m = isEdit ? members[editIdx] : null;
  const selectedJobs = (m && m.jobs) ? m.jobs : (m && m.job ? [m.job] : []);
  const selectedColor = (m && m.color) ? m.color : '#38bdf8';
  const jobList = ['농사','낚시','채광','요리','기타'];
  const jobBtns = jobList.map(j=>`<button type="button" class="job-sel-btn${selectedJobs.includes(j)?' job-sel-on':''}" onclick="toggleJobSel(this,'${j}')" data-job="${j}">${j}</button>`).join('');
  document.getElementById('mb-modal-root').innerHTML=`<div class="mb-modal-bg" onclick="if(event.target===this)closeMemberModal()">
    <div class="mb-modal"><h3>${isEdit?'마을원 수정':'마을원 등록'}</h3>
      <label>이름</label><input id="mm-name" placeholder="닉네임" value="${isEdit?m.name:''}">
      <label>마크닉</label>
      <div style="display:flex;align-items:center;gap:8px;">
        <input id="mm-mc" placeholder="마인크래프트 닉네임" value="${isEdit?(m.mc||''):''}" style="flex:1;" oninput="updateSkinPreview(this.value)">
        <div id="mm-skin-preview" style="width:36px;height:36px;border-radius:4px;overflow:hidden;background:var(--s3);border:1px solid var(--b2);flex-shrink:0;">
          ${isEdit&&m.mc?`<img src="https://mc-heads.net/avatar/${encodeURIComponent(m.mc)}/36" style="width:100%;height:100%;image-rendering:pixelated;display:block;" onerror="this.style.display='none'">`:'<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:18px;">👤</span>'}
        </div>
      </div>
      <label>구분</label><select id="mm-type"><option${(!isEdit||m.type==='본계')?' selected':''}>본계</option><option${(isEdit&&m.type==='부계')?' selected':''}>부계</option></select>
      <label>직업 <span style="font-size:10px;color:var(--muted);">(최대 2개 선택)</span></label>
      <div class="job-sel-wrap" id="job-sel-wrap">${jobBtns}</div>
      <label>내 색상 <span style="font-size:10px;color:var(--muted);">(마을 구역에 표시될 색)</span></label>
      <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
        <input type="text" id="mm-color-hex" value="${selectedColor.toUpperCase()}" maxlength="7"
          placeholder="#38bdf8"
          style="width:110px;padding:6px 10px;border:1px solid var(--b2);border-radius:var(--rad-s);background:var(--s2);color:var(--text);font-size:13px;font-family:'JetBrains Mono',monospace;outline:none;"
          oninput="previewHexColor(this)">
        <div id="mm-color-swatch" style="width:28px;height:28px;border-radius:4px;border:1px solid var(--b2);background:${selectedColor};flex-shrink:0;transition:background .1s;"></div>
        <span style="font-size:11px;color:var(--muted);">구역에서 이 색으로 표시됩니다</span>
      </div>
      <div class="mb-modal-btns"><button class="mb-btn" onclick="closeMemberModal()">취소</button><button class="mb-btn mb-btn-add" onclick="${isEdit?`saveMemberEdit(${editIdx})`:'addMember()'}">${isEdit?'저장':'추가'}</button></div>
    </div></div>`;
}
function updateSkinPreview(nick){
  const box=document.getElementById('mm-skin-preview');
  if(!box)return;
  if(!nick.trim()){box.innerHTML='<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:18px;">👤</span>';return;}
  box.innerHTML=`<img src="https://mc-heads.net/avatar/${encodeURIComponent(nick.trim())}/36" style="width:100%;height:100%;image-rendering:pixelated;display:block;" onerror="this.style.display='none'">`;
}
function previewHexColor(input){
  const hex=input.value.trim();
  const swatch=document.getElementById('mm-color-swatch');
  if(swatch&&/^#[0-9a-fA-F]{6}$/.test(hex))swatch.style.background=hex;
}
function _getColorFromModal(){
  const hexInput=document.getElementById('mm-color-hex');
  const hex=(hexInput&&hexInput.value.trim())||'';
  return /^#[0-9a-fA-F]{6}$/.test(hex)?hex:'#38bdf8';
}
function toggleJobSel(btn, job){
  const wrap = document.getElementById('job-sel-wrap');
  const selected = [...wrap.querySelectorAll('.job-sel-on')];
  if(btn.classList.contains('job-sel-on')){
    btn.classList.remove('job-sel-on');
  } else {
    if(selected.length>=2){alert('직업은 최대 2개까지 선택할 수 있어요.');return;}
    btn.classList.add('job-sel-on');
  }
}
function getSelectedJobs(){
  const wrap = document.getElementById('job-sel-wrap');
  if(!wrap) return [];
  return [...wrap.querySelectorAll('.job-sel-on')].map(b=>b.dataset.job);
}
function closeMemberModal(){document.getElementById('mb-modal-root').innerHTML='';}
function addMember(){
  const n=document.getElementById('mm-name').value.trim();
  const mc=document.getElementById('mm-mc').value.trim();
  if(!n){alert('이름을 입력하세요.');return;}
  const jobs=getSelectedJobs();
  if(!jobs.length){alert('직업을 1개 이상 선택하세요.');return;}
  const color=_getColorFromModal();
  members.push({name:n,mc:mc||n,type:document.getElementById('mm-type').value,job:jobs[0],jobs,color});
  saveMembers();renderMembers();closeMemberModal();
}
function saveMemberEdit(idx){
  const n=document.getElementById('mm-name').value.trim();
  const mc=document.getElementById('mm-mc').value.trim();
  if(!n){alert('이름을 입력하세요.');return;}
  const jobs=getSelectedJobs();
  if(!jobs.length){alert('직업을 1개 이상 선택하세요.');return;}
  const color=_getColorFromModal();
  members[idx]={...members[idx],name:n,mc:mc||n,type:document.getElementById('mm-type').value,job:jobs[0],jobs,color};
  saveMembers();renderMembers();closeMemberModal();
}
function delMember(i){if(!requireAdmin())return;if(confirm(members[i].name+' 삭제?')){members.splice(i,1);saveMembers();renderMembers();}}
function resetMembers(){if(!requireAdmin())return;if(confirm('마을원 명단 전체 초기화?')){members=[];saveMembers();renderMembers();}}
