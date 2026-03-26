/* ═══ 변동 시세 ═══ */

const PRICE_CATS = {
  food: { label:'🍳 요리',   key:'stella_price_food' },
  crop: { label:'🌾 농작물', key:'stella_price_crop'  },
  fish: { label:'🐟 물고기', key:'stella_price_fish'  },
};

const GRADE_ORDER = { '커먼':0, '언커먼':1, '레어':2, '에픽':3, '전설':4 };
const GRADE_TAG   = { '커먼':'tag-blue', '언커먼':'tag-teal', '레어':'tag-purple', '에픽':'tag-amber', '전설':'tag-red' };

let _curPriceCat = 'food';

function initPrice() {
  switchPriceCat('food', document.querySelector('.price-cat'));
}

function switchPriceCat(cat, el) {
  _curPriceCat = cat;
  document.querySelectorAll('.price-cat').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  else document.querySelector(`[data-cat="${cat}"]`)?.classList.add('active');
  _loadPriceData(cat);
}

function _loadPriceData(cat) {
  const root = document.getElementById('price-table-area');
  if (!root) return;
  root.innerHTML = `<div class="empty"><div class="spinner"></div></div>`;

  window.$db.on(PRICE_CATS[cat].key, val => {
    if (_curPriceCat !== cat) return;
    _renderPriceTable(val);
  });
}

function _renderPriceTable(val) {
  const root = document.getElementById('price-table-area');
  if (!root) return;

  // 저장 시각 표시
  const savedAt = document.getElementById('price-saved-at');
  if (savedAt && val?.savedAt) {
    const d = new Date(val.savedAt);
    savedAt.textContent = `마지막 저장: ${d.toLocaleDateString('ko-KR')} ${d.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}`;
  }

  if (!val?.items?.length) {
    root.innerHTML = `<div class="empty">
      <div class="empty-icon">📊</div>
      시세 데이터가 없습니다.<br>
      <span style="font-size:12px;color:var(--hint);">위 붙여넣기 창에 디스코드 시세 메시지를 붙여넣어 저장해주세요.</span>
    </div>`;
    return;
  }

  const items    = [...val.items].sort((a,b) => (b.diff||0) - (a.diff||0));
  const rising   = items.filter(i => (i.diff||0) > 0);
  const falling  = items.filter(i => (i.diff||0) < 0);
  const steady   = items.filter(i => (i.diff||0) === 0);

  const renderSection = (title, icon, list) => {
    if (!list.length) return '';
    return `
      <div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;
          color:var(--muted);text-transform:uppercase;margin-bottom:10px;">
          ${icon} ${title} (${list.length}개)
        </div>
        <div class="card">
          <table class="price-table">
            <thead>
              <tr>
                <th>등급</th>
                <th>아이템</th>
                <th style="text-align:right;">원가</th>
                <th style="text-align:right;">현재 변동가</th>
                <th style="text-align:right;">변동폭</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(item => {
                const up   = (item.diff||0) > 0;
                const eq   = (item.diff||0) === 0;
                const sign = up ? '+' : '';
                const cls  = up ? 'price-change-up' : eq ? '' : 'price-change-down';
                const gradeCls = GRADE_TAG[item.grade] || 'tag-blue';
                return `
                <tr>
                  <td><span class="tag ${gradeCls}">${item.grade||''}</span></td>
                  <td style="font-weight:700;color:var(--text);">${item.name}</td>
                  <td style="text-align:right;font-family:var(--font-mono);color:var(--muted);">${(item.base||0).toLocaleString()}</td>
                  <td style="text-align:right;font-family:var(--font-mono);font-weight:700;">${(item.price||0).toLocaleString()}</td>
                  <td style="text-align:right;" class="${cls}">${sign}${(item.diff||0).toLocaleString()}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  };

  root.innerHTML =
    renderSection('상승 아이템', '📈', rising) +
    renderSection('하락 아이템', '📉', falling) +
    renderSection('변동 없음',   '➡️', steady);
}

/* ══════════════════════════════
   파싱 — 디스코드 메시지 형식
   예:
   # 요리사 상점의 변동 가격이 갱신되었습니다.
   📈 상승 아이템
   - [커먼] 가스파초
     - `원가`: 57
     - `현재 변동가`: 63
     - `원가 대비 변동폭`: +6
══════════════════════════════ */
async function parsePriceInput() {
  const text = document.getElementById('price-paste')?.value?.trim();
  if (!text) { alert('시세 내용을 붙여넣어 주세요.'); return; }

  const items = _parsePriceText(text);
  if (!items.length) {
    alert('파싱할 수 있는 시세 데이터가 없어요.\n\n디스코드 변동 가격 메시지를 그대로 붙여넣어 주세요.');
    return;
  }

  try {
    if (typeof firebase === 'undefined') throw new Error('Firebase 연결 안 됨');
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
  const items  = [];
  const lines  = text.split('\n');
  let cur      = null;   // 현재 파싱 중인 아이템

  const flush = () => {
    if (cur?.name) items.push(cur);
    cur = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw  = lines[i];
    const line = raw.trim();
    if (!line) continue;

    // ── 아이템 헤더: "- [커먼] 가스파초" ──
    const itemM = line.match(/^-\s*\[([^\]]+)\]\s*(.+)$/);
    if (itemM) {
      flush();
      cur = {
        grade: itemM[1].trim(),
        name:  itemM[2].trim(),
        base:  0,
        price: 0,
        diff:  0,
      };
      continue;
    }

    if (!cur) continue;

    // ── 원가 ──
    const baseM = line.match(/`?원가`?\s*[：:]\s*([\d,]+)/);
    if (baseM) { cur.base = parseInt(baseM[1].replace(/,/g,'')); continue; }

    // ── 현재 변동가 ──
    const priceM = line.match(/`?현재\s*변동가`?\s*[：:]\s*([\d,]+)/);
    if (priceM) { cur.price = parseInt(priceM[1].replace(/,/g,'')); continue; }

    // ── 원가 대비 변동폭 ──
    const diffM = line.match(/`?원가\s*대비\s*변동폭`?\s*[：:]\s*([+-]?\d+)/);
    if (diffM) { cur.diff = parseInt(diffM[1]); continue; }
  }
  flush();

  return items;
}
