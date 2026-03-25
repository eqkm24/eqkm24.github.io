/* ═══ 마을 구역 ═══ */

const ZN_COLORS=['#3b82f6','#ef4444','#22c55e','#f59e0b','#a855f7','#ec4899','#06b6d4','#f97316','#6366f1','#14b8a6','#e11d48','#84cc16','#8b5cf6','#f43f5e','#0ea5e9','#d946ef','#10b981','#f472b6','#60a5fa','#fbbf24','#c084fc','#34d399','#fb7185','#38bdf8','#a3e635','#e879f9','#2dd4bf','#fca5a5','#93c5fd','#fcd34d'];
let zoneData = {};
const ZONE_SPECIAL = {
  '공용': '🌐',
  '낚시터': '🎣',
};

function saveZone(){
  window._fbSet('stella_zone', Object.keys(zoneData).length ? zoneData : {});
}

function _initZoneSync(){
  if(!window._fbOn){setTimeout(_initZoneSync,100);return;}
  window._fbOn('stella_zone', val => {
    zoneData = val && typeof val === 'object' ? val : {};
    if(window._zoneInit) rebuildZone();
    updateDashboard();
  });
}

function _getZoneIcon(owner) {
  if (ZONE_SPECIAL[owner]) return `<span style="font-size:clamp(10px,1.6vw,18px);pointer-events:none;line-height:1;">${ZONE_SPECIAL[owner]}</span>`;
  const mc = getMcNick(owner);
  return mc
    ? `<img class="zn-cell-skin" src="https://mc-heads.net/avatar/${encodeURIComponent(mc)}/32" alt="" onerror="this.style.display='none'">`
    : `<div class="zn-cell-skin-ph">👤</div>`;
}

function rebuildZone(){
  const cols=parseInt(document.getElementById('zn-cols').value)||16;
  const rows=parseInt(document.getElementById('zn-rows').value)||16;
  const map=document.getElementById('zn-map');
  map.style.gridTemplateColumns=`repeat(${cols},1fr)`;
  let html='';
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const k=r+','+c;
    const owner=zoneData[k]||'';
    if(owner){
      const color=getOwnerColor(owner);
      const iconHtml=_getZoneIcon(owner);
      html+=`<div class="zn-cell owned" data-k="${k}" onclick="setZoneOwner('${k}')" style="background:${color}cc;--zn-glow:${color};" title="${owner}">
        ${iconHtml}
        <span class="zn-cell-name">${owner}</span>
      </div>`;
    } else {
      html+=`<div class="zn-cell" data-k="${k}" onclick="setZoneOwner('${k}')" title="빈 청크"></div>`;
    }
  }
  map.innerHTML=html;
  renderZoneLegend();
  renderZoneStat();
}

function getOwnerColor(name){
  const member=members.find(m=>m.name===name||m.mc===name);
  if(member&&member.color)return member.color;
  let h=0;for(let i=0;i<name.length;i++)h=name.charCodeAt(i)+((h<<5)-h);
  return ZN_COLORS[Math.abs(h)%ZN_COLORS.length];
}

function setZoneOwner(k){
  if(!requireAdmin())return;
  const cur=zoneData[k]||'';
  const name=prompt('소유자 이름 (빈칸=해제):',cur);
  if(name===null)return;
  if(name.trim())zoneData[k]=name.trim();else delete zoneData[k];
  saveZone();rebuildZone();
}

function renderZoneLegend(){
  const owners=[...new Set(Object.values(zoneData))];
  document.getElementById('zn-legend').innerHTML=owners.map(o=>`<div class="zn-leg"><div class="zn-leg-color" style="background:${getOwnerColor(o)}"></div>${o}</div>`).join('');
}

function renderZoneStat(){
  const total=parseInt(document.getElementById('zn-cols').value)*parseInt(document.getElementById('zn-rows').value);
  const used=Object.keys(zoneData).length;
  const owners=[...new Set(Object.values(zoneData))].length;
  document.getElementById('zn-stat').innerHTML=`
    <div class="zn-stat-card"><div class="zn-stat-val">${total}</div><div class="zn-stat-lbl">전체 청크</div></div>
    <div class="zn-stat-card"><div class="zn-stat-val" style="color:#4ade80;">${used}</div><div class="zn-stat-lbl">점유 청크</div></div>
    <div class="zn-stat-card"><div class="zn-stat-val" style="color:#38bdf8;">${owners}</div><div class="zn-stat-lbl">소유자 수</div></div>
    <div class="zn-stat-card"><div class="zn-stat-val">${total-used}</div><div class="zn-stat-lbl">빈 청크</div></div>`;
}

function resetZone(){if(!requireAdmin())return;const pw=prompt('초기화 확인용 비밀번호:');if(!pw)return;hashPW(pw).then(h=>{if(h!==ADMIN_HASH){alert('비밀번호 오류');return;}if(confirm('구역 데이터 초기화?')){zoneData={};saveZone();rebuildZone();}});}
function _updateZoneAdminUI(){const b=document.getElementById('zn-reset-btn');if(b)b.style.display=isAdmin?'':'none';}

function highlightZone(){
  const q=(document.getElementById('zn-search').value||'').trim().toLowerCase();
  document.querySelectorAll('.zn-cell').forEach(cell=>{
    const owner=(cell.title||'').toLowerCase();
    if(q&&owner.includes(q)){cell.style.outline='3px solid #fbbf24';cell.style.zIndex='2';cell.style.transform='scale(1.1)';}
    else{cell.style.outline='';cell.style.zIndex='';cell.style.transform='';}
  });
}
