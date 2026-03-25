/* ═══ 메인화면 시세 TOP 위젯 ═══ */

function renderPriceWidget() {
  const root = document.getElementById('main-price-widget');
  if (!root) return;

  // PT(시세 테이블) 데이터 수집
  const allItems = [];
  if (window.PT) {
    Object.entries(window.PT).forEach(([cat, pt]) => {
      const catLabel = { crop:'농작물', fish:'물고기', food:'요리' }[cat] || cat;
      const catIcon  = { crop:'🌾', fish:'🐟', food:'🍳' }[cat] || '📦';
      (pt.data || []).forEach(item => {
        const name  = item.name || item.n || '';
        const price = item.price || item.p || 0;
        const base  = item.base  || item.b || price;
        if (!name || !price) return;
        const pct = base ? Math.round(((price - base) / base) * 100) : 0;
        allItems.push({ name, price, base, pct, cat: catLabel, icon: catIcon });
      });
    });
  }

  if (!allItems.length) {
    root.innerHTML = `<div style="padding:20px;text-align:center;color:var(--muted);font-size:12px;">시세 데이터가 없습니다.<br><span style="font-size:11px;">변동 시세 페이지에서 먼저 등록해주세요.</span></div>`;
    return;
  }

  // 변동률 기준 TOP 상승 3, TOP 하락 3
  const sorted = [...allItems].sort((a, b) => b.pct - a.pct);
  const tops   = sorted.slice(0, 3);
  const bots   = sorted.slice(-3).reverse();

  root.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:1px solid var(--b1);">
      <div style="padding:14px 16px;border-right:1px solid var(--b1);">
        <div style="font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.8px;margin-bottom:10px;">▲ 상승 TOP 3</div>
        ${tops.map(item => _priceWidgetRow(item, true)).join('')}
      </div>
      <div style="padding:14px 16px;">
        <div style="font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.8px;margin-bottom:10px;">▼ 하락 TOP 3</div>
        ${bots.map(item => _priceWidgetRow(item, false)).join('')}
      </div>
    </div>`;
}

function _priceWidgetRow(item, isRise) {
  const color = item.pct > 0 ? '#4ade80' : item.pct < 0 ? '#f87171' : 'var(--muted)';
  const sign  = item.pct > 0 ? '+' : '';
  return `
    <div class="pw-row" onclick="go('price')" title="${item.cat}">
      <span class="pw-icon">${item.icon}</span>
      <span class="pw-name">${item.name}</span>
      <span class="pw-price">${item.price.toLocaleString()}셀</span>
      <span class="pw-pct" style="color:${color};">${sign}${item.pct}%</span>
    </div>`;
}

/* 시세 데이터 로드 완료 시 위젯 갱신 — price.js의 _initPriceSync 이후 호출 */
(function watchPriceForWidget() {
  let tries = 0;
  const check = setInterval(() => {
    tries++;
    if (window.PT) {
      // PT가 처음 채워질 때 한 번 렌더, 이후는 price.js 쪽 구독에서 갱신됨
      renderPriceWidget();
      clearInterval(check);
    }
    if (tries > 60) clearInterval(check); // 6초 후 포기
  }, 100);
})();
