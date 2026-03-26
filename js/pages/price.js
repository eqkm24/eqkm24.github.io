var PRICE_CATS = {
  food: { label:'🍳 요리',   key:'stella_price_food' },
  crop: { label:'🌾 농작물', key:'stella_price_crop'  },
  fish: { label:'🐟 물고기', key:'stella_price_fish'  },
};

let _curPriceCat  = 'food';
let _priceRef     = null;

function initPrice() {
  switchPriceCat('food', document.querySelector('[data-cat="food"]'));
}

function switchPriceCat(cat, el) {
  
  if (_priceRef) { _priceRef.off(); _priceRef = null; }

  _curPriceCat = cat;
  document.querySelectorAll('.price-cat').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  else document.querySelector(`[data-cat="${cat}"]`)?.classList.add('active');

  const root = document.getElementById('price-table-area');
  if (root) root.innerHTML = `<div class="empty"><div class="spinner"></div></div>`;

  if (!window._fbReady || typeof firebase === 'undefined') {
    document.addEventListener('firebase-ready', () => switchPriceCat(cat, el), { once: true });
    return;
  }

  _priceRef = firebase.database().ref(PRICE_CATS[cat].key);
  _priceRef.on('value', snap => {
    _renderPriceCards(snap.exists() ? snap.val() : null);
  });
}

function _renderPriceCards(val) {
  const root = document.getElementById('price-table-area');
  if (!root) return;

  const savedAt = document.getElementById('price-saved-at');
  if (savedAt && val?.savedAt) {
    const d = new Date(val.savedAt);
    savedAt.textContent = `${d.toLocaleDateString('ko-KR')} ${d.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})} 기준`;
  }

  if (!val?.items?.length) {
    root.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📊</div>
        시세 데이터가 없습니다.<br>
        <span style="font-size:12px;color:var(--hint);margin-top:4px;display:block;">
          위 붙여넣기 창에 디스코드 변동 가격 메시지를 붙여넣어 저장해주세요.
        </span>
      </div>`;
    return;
  }

  const items   = val.items;
  const rising  = items.filter(i => (i.diff||0) > 0).sort((a,b) => b.diff - a.diff);
  const falling = items.filter(i => (i.diff||0) < 0).sort((a,b) => a.diff - b.diff);
  const steady  = items.filter(i => (i.diff||0) === 0);

  const card = (item) => {
    const diff     = item.diff || 0;
    const sign     = diff > 0 ? '+' : '';
    const color    = diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--muted)';
    const bgColor  = diff > 0 ? 'var(--green-dim)' : diff < 0 ? 'var(--red-dim)' : 'var(--bg-card)';
    const arrow    = diff > 0 ? '▲' : diff < 0 ? '▼' : '─';
    const gradeCls = GRADE_TAG[item.grade] || 'tag-blue';
    const pct      = item.base ? ((diff / item.base) * 100).toFixed(1) : null;
    return `
    <div class="price-card" style="border-left:3px solid ${color};">
      <div class="price-card-top">
        <span class="tag ${gradeCls}">${item.grade||''}</span>
        <span class="price-card-name">${item.name}</span>
      </div>
      <div class="price-card-body">
        <div class="price-card-stat">
          <span class="price-card-stat-lbl">원가</span>
          <span class="price-card-stat-val">${(item.base||0).toLocaleString()}</span>
        </div>
        <div class="price-card-stat">
          <span class="price-card-stat-lbl">현재가</span>
          <span class="price-card-stat-val" style="font-weight:900;color:var(--text);">${(item.price||0).toLocaleString()}</span>
        </div>
        <div class="price-card-diff" style="background:${bgColor};color:${color};">
          <span>${arrow}</span>
          <span style="font-weight:900;">${sign}${Math.abs(diff).toLocaleString()}</span>
          ${pct !== null ? `<span style="font-size:10px;opacity:.8;">(${sign}${pct}%)</span>` : ''}
        </div>
      </div>
    </div>`;
  };

  const section = (title, icon, list) => {
    if (!list.length) return '';
    return `
      <div style="margin-bottom:28px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-size:18px;">${icon}</span>
          <span style="font-size:13px;font-weight:700;color:var(--sub);">${title}</span>
          <span class="tag" style="background:var(--bg-card);color:var(--muted);">${list.length}개</span>
        </div>
        <div class="price-card-grid">${list.map(card).join('')}</div>
      </div>`;
  };

  root.innerHTML =
    section('상승 아이템', '📈', rising)  +
    section('하락 아이템', '📉', falling) +
    (steady.length ? section('변동 없음', '➡️', steady) : '');
}

async function parsePriceInput() {
  const text = document.getElementById('price-paste')?.value?.trim();
  if (!text) { alert('시세 내용을 붙여넣어 주세요.'); return; }

  const items = _parsePriceText(text);
  if (!items.length) {
    alert('파싱할 수 있는 데이터가 없어요.\n\n디스코드 변동 가격 메시지를 그대로 붙여넣어 주세요.');
    return;
  }

  try {
    await firebase.database().ref(PRICE_CATS[_curPriceCat].key).set({
      items,
      savedAt: new Date().toISOString(),
    });
    document.getElementById('price-paste').value = '';
    alert(`✅ ${items.length}개 항목이 저장됐어요.`);
  } catch(e) {
    alert('저장 실패: ' + e.message);
  }
}

function _parsePriceText(text) {
  const items = [];
  let cur = null;
  const flush = () => { if (cur?.name) items.push({ ...cur }); cur = null; };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    const hm = line.match(/^-\s*\[([^\]]+)\]\s*(.+)$/);
    if (hm) { flush(); cur = { grade: hm[1].trim(), name: hm[2].trim(), base:0, price:0, diff:0 }; continue; }

    if (!cur) continue;

    const baseM  = line.match(/`?원가`?\s*[：:]\s*([\d,]+)/);
    if (baseM && !/이전|현재|대비/.test(line)) { cur.base = parseInt(baseM[1].replace(/,/g,'')); continue; }

    const priceM = line.match(/`?현재\s*변동가`?\s*[：:]\s*([\d,]+)/);
    if (priceM) { cur.price = parseInt(priceM[1].replace(/,/g,'')); continue; }

    const diffM  = line.match(/`?원가\s*대비\s*변동폭`?\s*[：:]\s*([+-]?\d+)/);
    if (diffM)  { cur.diff  = parseInt(diffM[1]); continue; }
  }
  flush();
  return items;
}
