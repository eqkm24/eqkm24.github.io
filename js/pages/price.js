/* ═══ 변동 시세 ═══ */

const PRICE_CATS = {
  food: { label:'🍳 요리',   key:'stella_price_food', maxChange:'+10% / -20%' },
  crop: { label:'🌾 농작물', key:'stella_price_crop', maxChange:'+10% / -15%' },
  fish: { label:'🐟 물고기', key:'stella_price_fish', maxChange:'+10% / -15%' },
};

let _curPriceCat  = 'food';
let _priceListeners = {};

function initPrice() {
  switchPriceCat('food', document.querySelector('.price-cat'));
}

function switchPriceCat(cat, el) {
  // 기존 리스너 해제
  if (_priceListeners[_curPriceCat]) {
    window.$db.off(PRICE_CATS[_curPriceCat].key);
    _priceListeners[_curPriceCat] = false;
  }

  _curPriceCat = cat;
  document.querySelectorAll('.price-cat').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  else {
    const btn = document.querySelector(`[data-cat="${cat}"]`);
    if (btn) btn.classList.add('active');
  }

  _loadPriceData(cat);
}

function _loadPriceData(cat) {
  const cfg  = PRICE_CATS[cat];
  const root = document.getElementById('price-table-area');
  if (!root) return;
  root.innerHTML = `<div class="empty"><div class="spinner"></div></div>`;

  _priceListeners[cat] = true;
  window.$db.on(cfg.key, val => {
    if (_curPriceCat !== cat) return;
    _renderPriceTable(val, cat);
  });
}

function _renderPriceTable(val, cat) {
  const root = document.getElementById('price-table-area');
  if (!root) return;

  const savedAt = document.getElementById('price-saved-at');
  if (savedAt && val?.savedAt) {
    const d = new Date(val.savedAt);
    savedAt.textContent = `마지막 저장: ${d.toLocaleDateString('ko-KR')} ${d.toLocaleTimeString('ko-KR', {hour:'2-digit',minute:'2-digit'})}`;
  }

  if (!val?.items?.length) {
    root.innerHTML = `<div class="empty">
      <div class="empty-icon">📊</div>
      시세 데이터가 없습니다.<br>
      <span style="font-size:12px;color:var(--hint);">위 붙여넣기 창에 디스코드 시세를 붙여넣어 저장해주세요.</span>
    </div>`;
    return;
  }

  const items = val.items;

  root.innerHTML = `
    <div class="card">
      <table class="price-table">
        <thead>
          <tr>
            <th>아이템</th>
            <th>현재가 (셀)</th>
            <th>등급</th>
            <th>변동</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const name  = item.name || item.n || '';
            const price = item.price || item.p || 0;
            const grade = item.grade || item.g || '';
            const diff  = item.diff  || item.d || 0;
            const pct   = item.pct   || '';
            const up    = diff > 0;
            const eq    = diff === 0;

            return `
            <tr>
              <td style="font-weight:700;color:var(--text);">${name}</td>
              <td style="font-family:var(--font-mono);font-weight:700;">${price.toLocaleString()}</td>
              <td>${grade ? `<span class="tag tag-blue">${grade}</span>` : '—'}</td>
              <td class="${up ? 'price-change-up' : eq ? '' : 'price-change-down'}">
                ${diff !== 0 ? `${up?'+':''}${diff.toLocaleString()} ${pct ? `(${pct})` : ''}` : '—'}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── 붙여넣기 파싱 ── */
async function parsePriceInput() {
  const text = document.getElementById('price-paste')?.value?.trim();
  if (!text) { alert('시세 내용을 붙여넣어 주세요.'); return; }

  const items = _parsePriceText(text);
  if (!items.length) { alert('파싱할 수 있는 시세 데이터가 없습니다.\n\n디스코드 /시세 명령어 결과를 그대로 붙여넣어 주세요.'); return; }

  const cfg = PRICE_CATS[_curPriceCat];
  try {
    // 시세는 모든 사용자가 저장 가능 — firebase 직접 접근
    if (typeof firebase === 'undefined') throw new Error('Firebase 연결 안 됨');
    await firebase.database().ref(cfg.key).set({ items, savedAt: new Date().toISOString() });
    document.getElementById('price-paste').value = '';
    alert(`✅ ${items.length}개 항목이 저장되었습니다.`);
  } catch(e) {
    alert('저장 실패: ' + e.message);
  }
}

function _parsePriceText(text) {
  const items = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 패턴 1: "아이템명 : 1,234셀 (+123셀, +10.0%)"
    const m1 = trimmed.match(/^(.+?)\s*[:：]\s*([\d,]+)\s*셀?\s*(?:\(([+-][\d,]+)\s*셀?,?\s*([+-][\d.]+%?)?\))?/);
    if (m1) {
      const name  = m1[1].trim();
      const price = parseInt(m1[2].replace(/,/g,''));
      const diff  = m1[3] ? parseInt(m1[3].replace(/,/g,'')) : 0;
      const pct   = m1[4] || '';
      if (name && price) items.push({ name, price, diff, pct });
      continue;
    }

    // 패턴 2: "아이템명 1234" (단순 숫자)
    const m2 = trimmed.match(/^(.+?)\s+([\d,]+)$/);
    if (m2) {
      const name  = m2[1].trim();
      const price = parseInt(m2[2].replace(/,/g,''));
      if (name && price > 0) items.push({ name, price, diff: 0, pct: '' });
    }
  }

  return items;
}
