var ROUTES = {
  main:    { file: 'pages/main.html',    init: 'initMain',    label: '메인',   nav: null },
  member:  { file: 'pages/member.html',  init: 'initMember',  label: '명단',   nav: 'village', village: true },
  zone:    { file: 'pages/zone.html',    init: 'initZone',    label: '구역',   nav: 'village', village: true },
  tribute: { file: 'pages/tribute.html', init: 'initTribute', label: '조공',   nav: 'village', village: true },
  life:    { file: 'pages/life.html',    init: 'initLife',    label: '생활',   nav: 'life'    },
  recipe:  { file: 'pages/recipe.html',  init: 'initRecipe',  label: '제작',   nav: 'recipe'  },
  price:   { file: 'pages/price.html',   init: 'initPrice',   label: '시세',   nav: 'price'   },
};

let _curPage  = null;
let _pageCache = {};  

function initApp() {
  _buildNav();
  _applyInitTheme();
  _loadGlobalData();
  go('main');
}

function _buildNav() {
  const nav = document.getElementById('topnav');
  if (!nav) return;

  nav.innerHTML = `
    <div class="nav-logo" onclick="go('main')">
      <div class="nav-logo-dot"></div>
      <span class="nav-logo-text">스텔라 마을</span>
    </div>

    <div class="nav-tabs" id="nav-tabs">
      <!-- 마을 드롭다운 -->
      <div class="nav-dd" id="nav-dd-village">
        <div class="nav-tab" id="nav-tab-village"
          onclick="toggleNavDd('village')">마을 ▾</div>
        <div class="nav-dd-menu" id="nav-dd-menu-village">
          <div class="nav-dd-item" onclick="goVillage('member')">
            <span class="nav-dd-item-icon">👥</span> 마을원 명단
          </div>
          <div class="nav-dd-item" onclick="goVillage('zone')">
            <span class="nav-dd-item-icon">🗺</span> 마을 구역
          </div>
          <div class="nav-dd-item" onclick="goVillage('tribute')">
            <span class="nav-dd-item-icon">⭐</span> 조공 포인트
          </div>
        </div>
      </div>

      <!-- 생활 드롭다운 -->
      <div class="nav-dd" id="nav-dd-life">
        <div class="nav-tab" id="nav-tab-life"
          onclick="toggleNavDd('life')">생활 ▾</div>
        <div class="nav-dd-menu" id="nav-dd-menu-life">
          <div class="nav-dd-item" onclick="go('life','mining')">
            <span class="nav-dd-item-icon">⛏</span> 채광
          </div>
          <div class="nav-dd-item" onclick="go('life','fishing')">
            <span class="nav-dd-item-icon">🎣</span> 낚시
          </div>
          <div class="nav-dd-item" onclick="go('life','farming')">
            <span class="nav-dd-item-icon">🌾</span> 농사
          </div>
          <div class="nav-dd-item" onclick="go('life','cooking')">
            <span class="nav-dd-item-icon">🍳</span> 요리
          </div>
        </div>
      </div>

      <div class="nav-tab" id="nav-tab-recipe" onclick="go('recipe')">제작</div>
      <div class="nav-tab" id="nav-tab-price"  onclick="go('price')">시세</div>
    </div>

    <div class="nav-utils">
      <button class="nav-icon-btn" onclick="toggleTheme()" title="테마 전환" id="theme-btn">☀️</button>
      <button class="nav-icon-btn" id="admin-nav-btn"
        onclick="openAdminLogin()" title="관리자 로그인">👑</button>
    </div>`;

  
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-dd')) _closeAllDd();
  });
}

function toggleNavDd(key) {
  const menu = document.getElementById(`nav-dd-menu-${key}`);
  const isOpen = menu?.classList.contains('open');
  _closeAllDd();
  if (!isOpen) menu?.classList.add('open');
}

function _closeAllDd() {
  document.querySelectorAll('.nav-dd-menu.open').forEach(m => m.classList.remove('open'));
}

function _setNavActive(navKey) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  if (navKey) {
    const tab = document.getElementById(`nav-tab-${navKey}`);
    if (tab) tab.classList.add('active');
  }
}

async function go(page, param) {
  _closeAllDd();

  const route = ROUTES[page];
  if (!route) return;

  
  if (route.village && !window._stella.villageOk) {
    requireVillage(() => go(page, param));
    return;
  }

  _curPage = page;
  _setNavActive(route.nav);

  const view = document.getElementById('view');
  if (!view) return;

  
  if (!_pageCache[page]) {
    view.innerHTML = `<div class="wrap"><div class="empty"><div class="spinner"></div></div></div>`;
    try {
      const res  = await fetch(route.file);
      const html = await res.text();
      _pageCache[page] = html;
    } catch(e) {
      view.innerHTML = `<div class="wrap"><div class="empty"><div class="empty-icon">⚠️</div>페이지를 불러올 수 없습니다.</div></div>`;
      return;
    }
  }

  view.innerHTML = _pageCache[page];

  
  if (typeof window[route.init] === 'function') {
    window[route.init](param);
  }

  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goVillage(page) {
  _closeAllDd();
  requireVillage(() => go(page));
}

function _loadGlobalData() {
  if (!window.$db) return;
  window.$db.on('stella_members', val => {
    window.members = val
      ? (Array.isArray(val) ? val : Object.values(val)).filter(Boolean)
      : [];
  });
}

function toggleTheme() {
  const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('stella_theme', next);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

function _applyInitTheme() {
  const theme = localStorage.getItem('stella_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function onAdminLogin() {
  const btn = document.getElementById('admin-nav-btn');
  if (btn) {
    btn.style.background = 'var(--purple-dim)';
    btn.style.color      = 'var(--purple)';
    btn.title            = '관리자 페이지';
  }
  if (_curPage) go(_curPage);
}
function onAdminLogout() {
  const btn = document.getElementById('admin-nav-btn');
  if (btn) {
    btn.style.background = '';
    btn.style.color      = '';
    btn.title            = '관리자 로그인';
  }
  if (_curPage) go(_curPage);
}

(function() {
  const theme = localStorage.getItem('stella_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
})();
