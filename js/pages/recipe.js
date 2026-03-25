/* ═══ 생활 제작 페이지 ═══ */

// ── 아이템 이미지 매핑 (루나위키 이미지 URL) ──
const LC_IMGS = {
  '일반 별빛 스크롤':   'https://mc-heads.net/avatar/MHF_Blaze/48',
  '고급 별빛 스크롤':   'https://mc-heads.net/avatar/MHF_Blaze/48',
  '희귀 별빛 스크롤':   'https://mc-heads.net/avatar/MHF_Blaze/48',
  '영웅 별의 보주':     'https://mc-heads.net/avatar/MHF_Blaze/48',
};

// ── 시설 라벨 ──
const FAC_LABEL = {
  bench:   '🔧 허름한 작업대',
  brazier: '🔥 허름한 화로',
  counter: '🥣 허름한 조리대',
};
const FAC_CLASS = { bench:'lc-fac-bench', brazier:'lc-fac-brazier', counter:'lc-fac-counter' };

// ── 레시피 데이터 ──
const LC_DATA = {
  mining: [
    {
      name: '미스릴 주괴', emoji: '🪨', grade: 'n',
      fac: 'brazier', time: '30초',
      mats: [['일반 미스릴 원석', 3], ['마그마 블록', 4]],
      prob: '100%',
    },
    {
      name: '아르젠타이트 주괴', emoji: '🪨', grade: 'a',
      fac: 'brazier', time: '30초',
      mats: [['일반 아르젠타이트 원석', 3], ['마그마 블록', 4]],
      prob: '100%',
    },
    {
      name: '벨리움 주괴', emoji: '🪨', grade: 'r',
      fac: 'brazier', time: '30초',
      mats: [['일반 벨리움 원석', 3], ['마그마 블록', 4]],
      prob: '100%',
    },
  ],

  fishing: [
    {
      name: '말린 농작물', emoji: '🌿', grade: 'n',
      fac: 'brazier', time: '30초',
      mats: [['농작물', 10], ['마그마 블록', 5]],
      prob: '100%',
    },
    {
      name: '말린 물고기', emoji: '🐟', grade: 'n',
      fac: 'brazier', time: '30초',
      mats: [['물고기', 10], ['마그마 블록', 5]],
      prob: '100%',
    },
    {
      name: '지렁이 미끼', emoji: '🪱', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['일반↑ 말린 농작물', 10], ['일반↑ 말린 물고기', 10]],
      prob: '100%',
    },
    {
      name: '어분 미끼', emoji: '🪱', grade: 'a',
      fac: 'bench', time: '60초',
      mats: [['고급↑ 말린 농작물', 10], ['고급↑ 말린 물고기', 10]],
      prob: '100%',
    },
    {
      name: '루어 미끼', emoji: '🪝', grade: 'r',
      fac: 'bench', time: '60초',
      mats: [['희귀↑ 말린 농작물', 20], ['희귀↑ 말린 물고기', 10]],
      prob: '100%',
    },
    {
      name: '평범한 떡밥', emoji: '🎣', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['지렁이 미끼', 1], ['일반↑ 말린 농작물', 1]],
      prob: '100%',
    },
    {
      name: '잘만든 떡밥', emoji: '🎣', grade: 'a',
      fac: 'bench', time: '60초',
      mats: [['어분 미끼', 1], ['고급↑ 말린 농작물', 1]],
      prob: '100%',
    },
    {
      name: '무지개 떡밥', emoji: '🎣', grade: 'r',
      fac: 'bench', time: '60초',
      mats: [['루어 미끼', 1], ['희귀↑ 말린 농작물', 2]],
      prob: '100%',
    },
  ],

  farming: [
    {
      name: '허수아비', emoji: '🪆', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['대나무 블록', 10], ['가죽 풀세트', 1]],
      prob: '100%',
    },
    {
      name: '비닐하우스', emoji: '🏠', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['유리', 16], ['차광 유리', 1]],
      prob: '100%',
    },
    {
      name: '평범한 화분통', emoji: '🪴', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['편백나무 원목', 2], ['퇴비통', 1]],
      prob: '100%',
    },
    {
      name: '깔끔한 화분통', emoji: '🪴', grade: 'a',
      fac: 'bench', time: '60초',
      mats: [['평범한 화분통', 1], ['편백나무 원목', 5]],
      prob: '100%',
    },
    {
      name: '구리 물뿌리개', emoji: '🚿', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['구리 주괴', 4], ['편백나무 원목', 2]],
      prob: '100%',
    },
    {
      name: '철 물뿌리개', emoji: '🚿', grade: 'a',
      fac: 'bench', time: '60초',
      mats: [['철 주괴', 6], ['편백나무 원목', 2]],
      prob: '100%',
    },
    {
      name: '금 물뿌리개', emoji: '🚿', grade: 'r',
      fac: 'bench', time: '60초',
      mats: [['금 주괴', 8], ['편백나무 원목', 2]],
      prob: '100%',
    },
    {
      name: '트라이어드 물뿌리개', emoji: '🚿', grade: 'h',
      fac: 'bench', time: '120초',
      mats: [['금 물뿌리개', 1], ['트라이어드 주괴', 4]],
      prob: '100%',
    },
    {
      name: '철제 스프링클러', emoji: '💦', grade: 'a',
      fac: 'bench', time: '60초',
      mats: [['철 주괴', 4], ['유리', 4]],
      prob: '100%',
    },
    {
      name: '금 스프링클러', emoji: '💦', grade: 'r',
      fac: 'bench', time: '60초',
      mats: [['금 주괴', 6], ['유리', 4]],
      prob: '100%',
    },
    {
      name: '트라이어드 스프링클러', emoji: '💦', grade: 'h',
      fac: 'bench', time: '120초',
      mats: [['금 스프링클러', 1], ['트라이어드 주괴', 4]],
      prob: '100%',
    },
  ],

  cooking: [
    {
      name: '구운 감자', emoji: '🥔', grade: 'n',
      fac: 'counter', time: '15초',
      mats: [['감자', 1]],
      prob: '100%',
    },
    {
      name: '호박 수프', emoji: '🎃', grade: 'n',
      fac: 'counter', time: '30초',
      mats: [['호박', 2], ['물병', 1]],
      prob: '100%',
    },
    {
      name: '버섯 스튜', emoji: '🍲', grade: 'a',
      fac: 'counter', time: '45초',
      mats: [['갈색 버섯', 2], ['빨간 버섯', 2], ['그릇', 1]],
      prob: '100%',
    },
    {
      name: '토끼 스튜', emoji: '🍲', grade: 'a',
      fac: 'counter', time: '60초',
      mats: [['구운 토끼고기', 1], ['당근', 1], ['감자', 1], ['버섯', 1], ['그릇', 1]],
      prob: '100%',
    },
    {
      name: '케이크', emoji: '🎂', grade: 'r',
      fac: 'counter', time: '90초',
      mats: [['우유통', 3], ['설탕', 2], ['달걀', 1], ['밀', 3]],
      prob: '100%',
    },
    {
      name: '황금 당근 수프', emoji: '🥕', grade: 'h',
      fac: 'counter', time: '120초',
      mats: [['황금 당근', 2], ['물병', 1], ['설탕', 1]],
      prob: '60%',
    },
  ],

  enhance: [
    {
      name: '허름한 화로', emoji: '🔥', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['심층암', 15], ['용광로', 1]],
      prob: '100%',
    },
    {
      name: '허름한 조리대', emoji: '🥣', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['편백나무 원목', 10], ['철 창살', 5]],
      prob: '100%',
    },
    {
      name: '일반 별빛 스크롤', emoji: '📜', grade: 'n',
      fac: 'bench', time: '300초',
      mats: [['별빛 스크롤 조각(일반)', 8], ['일반 달빛 촉매제', 1]],
      prob: '100%',
    },
    {
      name: '고급 별빛 스크롤', emoji: '📜', grade: 'a',
      fac: 'bench', time: '300초',
      mats: [['별빛 스크롤 조각(고급)', 8], ['고급 달빛 촉매제', 1]],
      prob: '100%',
    },
    {
      name: '희귀 별빛 스크롤', emoji: '📜', grade: 'r',
      fac: 'bench', time: '300초',
      mats: [['별빛 스크롤 조각(희귀)', 8], ['희귀 달빛 촉매제', 1]],
      prob: '100%',
    },
    {
      name: '영웅 별의 보주', emoji: '🔮', grade: 'h',
      fac: 'bench', time: '300초',
      mats: [['희귀 별의 조각', 8], ['희귀 별가루', 1]],
      prob: '60%',
    },
    {
      name: '영웅 바다의 보주', emoji: '🔮', grade: 'h',
      fac: 'bench', time: '300초',
      mats: [['희귀 별의 조각', 8], ['희귀 별가루', 1]],
      prob: '60%',
    },
    {
      name: '영웅 태양의 보주', emoji: '🔮', grade: 'h',
      fac: 'bench', time: '300초',
      mats: [['희귀 별의 조각', 8], ['희귀 별가루', 1]],
      prob: '60%',
    },
    {
      name: '영웅 대지의 보주', emoji: '🔮', grade: 'h',
      fac: 'bench', time: '300초',
      mats: [['희귀 별의 조각', 8], ['희귀 별가루', 1]],
      prob: '60%',
    },
  ],
};

const GRADE_MAP = { n:'일반', a:'고급', r:'희귀', h:'영웅' };
const GRADE_CLASS = { n:'lc-grade-n', a:'lc-grade-a', r:'lc-grade-r', h:'lc-grade-h' };
const PROB_CLASS = { '100%':'lc-prob-100', '60%':'lc-prob-60' };

let _curLifecat = 'mining';

function switchLifecat(cat) {
  _curLifecat = cat;
  document.querySelectorAll('.lc-tab').forEach(b => b.classList.toggle('lc-on', b.dataset.lc === cat));
  const search = document.getElementById('lc-search');
  if (search) search.value = '';
  renderLifecat();
}

function renderLifecat() {
  const grid = document.getElementById('lc-grid');
  if (!grid) return;

  const q = (document.getElementById('lc-search')?.value || '').trim().toLowerCase();
  const items = LC_DATA[_curLifecat] || [];
  const filtered = q
    ? items.filter(it =>
        it.name.toLowerCase().includes(q) ||
        it.mats.some(([m]) => m.toLowerCase().includes(q))
      )
    : items;

  if (!filtered.length) {
    grid.innerHTML = '<div class="lc-empty">검색 결과가 없어요.</div>';
    return;
  }

  grid.innerHTML = filtered.map(it => {
    const gradeLabel = GRADE_MAP[it.grade] || '';
    const gradeCls   = GRADE_CLASS[it.grade] || 'lc-grade-n';
    const fac        = FAC_LABEL[it.fac] || { label: it.fac, icon: '🏭' };
    const facLabel   = typeof fac === 'string' ? fac : `${fac.icon || ''} ${fac.label || fac}`.trim();
    const facCls     = FAC_CLASS[it.fac] || '';
    const hasProb    = it.prob && it.prob !== '100%';

    const matsHtml = it.mats.map(([name, qty]) =>
      `<span class="lc-mat-tag">${name} <span class="lc-mat-qty">×${qty}</span></span>`
    ).join('');

    return `
    <div class="lc-card">
      <div class="lc-card-hd">
        <div class="lc-card-img">${it.emoji || '📦'}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;flex-wrap:wrap;">
            <span class="lc-type-pill">${it.type || (FAC_LABEL[it.fac] ? (it.fac === 'counter' ? '요리' : '제작') : '제작')}</span>
            <span class="lc-card-time">⏱ ${it.time}</span>
          </div>
          <div class="lc-card-name">${it.name}</div>
        </div>
      </div>
      <div class="lc-mats-hd">
        <span class="lc-mats-label">필요 재료</span>
        <span class="lc-facility ${facCls}">${facLabel}</span>
      </div>
      <div class="lc-mats-list">${matsHtml}</div>
      ${hasProb ? `<div class="lc-prob-row"><span class="lc-grade ${gradeCls}">${gradeLabel}</span><span class="lc-prob-tag">${it.prob}</span></div>` : `<div style="margin-top:8px;"><span class="lc-grade ${gradeCls}">${gradeLabel}</span></div>`}
    </div>`;
  }).join('');
}
