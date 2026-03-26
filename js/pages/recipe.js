/* ═══ 제작 레시피 ═══ */

const FAC_INFO = {
  bench:   { label:'🔧 편백나무 작업대', cap:'최대 3개 설치', cls:'tag-blue'   },
  brazier: { label:'🔥 허름한 화로',     cap:'최대 3개 설치', cls:'tag-red'    },
  counter: { label:'🥣 허름한 조리대',   cap:'최대 6개 설치', cls:'tag-purple' },
};

const RECIPE_DATA = {
  bench: [
    { name:'일반 별빛 스크롤', grade:'n', time:'300초', prob:'100%',
      mats:[['별빛 스크롤 조각(일반)',8],['일반 달빛 촉매제',1]] },
    { name:'고급 별빛 스크롤', grade:'a', time:'300초', prob:'100%',
      mats:[['별빛 스크롤 조각(고급)',8],['고급 달빛 촉매제',1]] },
    { name:'희귀 별빛 스크롤', grade:'r', time:'300초', prob:'100%',
      mats:[['별빛 스크롤 조각(희귀)',8],['희귀 달빛 촉매제',1]] },
    { name:'영웅 별의 보주', grade:'h', time:'300초', prob:'60%',
      mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
    { name:'영웅 바다의 보주', grade:'h', time:'300초', prob:'60%',
      mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
    { name:'영웅 태양의 보주', grade:'h', time:'300초', prob:'60%',
      mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
    { name:'영웅 대지의 보주', grade:'h', time:'300초', prob:'60%',
      mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
    { name:'허름한 화로', grade:'n', time:'60초', prob:'100%',
      mats:[['심층암',15],['용광로',1]] },
    { name:'허름한 조리대', grade:'n', time:'60초', prob:'100%',
      mats:[['편백나무 원목',10],['철 창살',5]] },
    { name:'허수아비', grade:'n', time:'60초', prob:'100%',
      mats:[['대나무 블록',10],['가죽 풀세트',1]] },
    { name:'비닐하우스', grade:'n', time:'60초', prob:'100%',
      mats:[['유리',16],['차광 유리',1]] },
    { name:'평범한 화분통', grade:'n', time:'60초', prob:'100%',
      mats:[['편백나무 원목',2],['퇴비통',1]] },
    { name:'깔끔한 화분통', grade:'a', time:'60초', prob:'100%',
      mats:[['평범한 화분통',1],['편백나무 원목',5]] },
    { name:'구리 물뿌리개', grade:'n', time:'60초', prob:'100%',
      mats:[['구리 주괴',4],['편백나무 원목',2]] },
    { name:'철 물뿌리개', grade:'a', time:'60초', prob:'100%',
      mats:[['철 주괴',6],['편백나무 원목',2]] },
    { name:'금 물뿌리개', grade:'r', time:'60초', prob:'100%',
      mats:[['금 주괴',8],['편백나무 원목',2]] },
    { name:'트라이어드 물뿌리개', grade:'h', time:'120초', prob:'100%',
      mats:[['금 물뿌리개',1],['트라이어드 주괴',4]] },
    { name:'철제 스프링클러', grade:'a', time:'60초', prob:'100%',
      mats:[['철 주괴',4],['유리',4]] },
    { name:'금 스프링클러', grade:'r', time:'60초', prob:'100%',
      mats:[['금 주괴',6],['유리',4]] },
    { name:'트라이어드 스프링클러', grade:'h', time:'120초', prob:'100%',
      mats:[['금 스프링클러',1],['트라이어드 주괴',4]] },
    { name:'지렁이 미끼', grade:'n', time:'60초', prob:'100%',
      mats:[['일반↑ 말린 농작물',10],['일반↑ 말린 물고기',10]] },
    { name:'어분 미끼', grade:'a', time:'60초', prob:'100%',
      mats:[['고급↑ 말린 농작물',10],['고급↑ 말린 물고기',10]] },
    { name:'루어 미끼', grade:'r', time:'60초', prob:'100%',
      mats:[['희귀↑ 말린 농작물',20],['희귀↑ 말린 물고기',10]] },
    { name:'평범한 떡밥', grade:'n', time:'60초', prob:'100%',
      mats:[['지렁이 미끼',1],['일반↑ 말린 농작물',1]] },
    { name:'잘만든 떡밥', grade:'a', time:'60초', prob:'100%',
      mats:[['어분 미끼',1],['고급↑ 말린 농작물',1]] },
    { name:'무지개 떡밥', grade:'r', time:'60초', prob:'100%',
      mats:[['루어 미끼',1],['희귀↑ 말린 농작물',2]] },
  ],
  brazier: [
    { name:'말린 농작물',     grade:'n', time:'30초', prob:'100%',
      mats:[['농작물',10],['마그마 블록',5]] },
    { name:'말린 물고기',     grade:'n', time:'30초', prob:'100%',
      mats:[['물고기',10],['마그마 블록',5]] },
    { name:'미스릴 주괴',     grade:'n', time:'30초', prob:'100%',
      mats:[['일반 미스릴 원석',3],['마그마 블록',4]] },
    { name:'아르젠타이트 주괴',grade:'a', time:'30초', prob:'100%',
      mats:[['일반 아르젠타이트 원석',3],['마그마 블록',4]] },
    { name:'벨리움 주괴',     grade:'r', time:'30초', prob:'100%',
      mats:[['일반 벨리움 원석',3],['마그마 블록',4]] },
  ],
  counter: [
    { name:'요리 (커먼)', grade:'n', time:'가변', prob:'가변',
      mats:[['레시피 재료','적량']] },
    { name:'요리 (언커먼)', grade:'a', time:'가변', prob:'가변',
      mats:[['레시피 재료','적량']] },
    { name:'요리 (레어)', grade:'r', time:'가변', prob:'가변',
      mats:[['레시피 재료','적량']] },
  ],
};

const GRADE_LABEL = { n:'일반', a:'고급', r:'희귀', h:'영웅' };
const GRADE_TAG   = { n:'tag-blue', a:'tag-teal', r:'tag-purple', h:'tag-amber' };

let _curCat = 'bench';

function initRecipe() {
  switchRecipeCat('bench', document.querySelector('.recipe-tab'));
}

function switchRecipeCat(cat, el) {
  _curCat = cat;
  document.querySelectorAll('.recipe-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  else {
    const btn = document.querySelector(`[data-cat="${cat}"]`);
    if (btn) btn.classList.add('active');
  }

  // 설치 제한 안내
  const fac  = FAC_INFO[cat] || {};
  const cap  = document.getElementById('recipe-cap');
  if (cap) cap.textContent = `${fac.label} — ${fac.cap}`;

  // 검색 초기화
  const search = document.getElementById('recipe-search');
  if (search) search.value = '';

  renderRecipe();
}

function renderRecipe() {
  const grid  = document.getElementById('recipe-grid');
  if (!grid) return;

  const q     = (document.getElementById('recipe-search')?.value || '').toLowerCase().trim();
  const items = RECIPE_DATA[_curCat] || [];
  const fac   = FAC_INFO[_curCat] || {};

  const filtered = q
    ? items.filter(it =>
        it.name.toLowerCase().includes(q) ||
        it.mats.some(([m]) => String(m).toLowerCase().includes(q)))
    : items;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;">
      <div class="empty-icon">🔍</div>검색 결과가 없어요.
    </div>`;
    return;
  }

  const facTag = `<span class="tag ${fac.cls}" style="margin-left:auto;">${fac.label}</span>`;
  const probBadge = prob => prob !== '100%'
    ? `<span class="tag tag-amber">${prob}</span>` : '';

  grid.innerHTML = filtered.map(it => {
    const matsHtml = it.mats.map(([name, qty]) =>
      `<span class="mat-tag">${name} <span class="mat-qty">×${qty}</span></span>`
    ).join('');

    return `
    <div class="recipe-card">
      <div class="recipe-card-hd">
        <div class="recipe-img">📦</div>
        <div style="flex:1;min-width:0;">
          <div class="recipe-name">${it.name}</div>
          <div class="recipe-meta">
            <span class="tag ${GRADE_TAG[it.grade]}">${GRADE_LABEL[it.grade]}</span>
            <span class="tag" style="color:var(--muted);background:var(--bg-3);">⏱ ${it.time}</span>
            ${probBadge(it.prob)}
            ${facTag}
          </div>
        </div>
      </div>
      <div class="recipe-mats">${matsHtml}</div>
    </div>`;
  }).join('');
}
