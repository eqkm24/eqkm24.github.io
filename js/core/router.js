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
  // 브라우저 뒤로가기/앞으로가기
  window.addEventListener('popstate', function(e) {
    var state = e.state;
    if (state && state.page) {
      go(state.page, state.param || null);
    } else {
      go('main');
    }
  });

  // 현재 URL에서 페이지 파싱 (직접 URL 접속 시)
  var path   = window.location.pathname.replace(/^\//, '').split('/');
  var initPg = path[0] || 'main';
  var initSb = path[1] || null;
  var VALID  = ['main','member','zone','tribute','life','recipe','price'];
  if (!VALID.includes(initPg)) { initPg = 'main'; initSb = null; }

  _curPage = initPg;
  _curSub  = initSb;
  history.replaceState({ page: initPg, param: initSb }, '', initPg === 'main' ? '/' : '/' + initPg + (initSb ? '/' + initSb : ''));

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

      <!-- 생활 단순 탭 (내부에서 직업 선택) -->
      <div class="nav-tab" id="nav-tab-life"
        onclick="go('life')">생활</div>

      <div class="nav-tab" id="nav-tab-recipe" onclick="go('recipe')">제작</div>
      <div class="nav-tab" id="nav-tab-price"  onclick="go('price')">시세</div>
    </div>

    <div class="nav-utils">
      <button class="nav-icon-btn" onclick="openSettings()" title="환경 설정" id="settings-btn">
        <svg viewBox="0 0 20 20" fill="none" style="width:16px;height:16px;"><path d="M10 13a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="1.5"/><path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.22 4.22l1.06 1.06M14.72 14.72l1.06 1.06M4.22 15.78l1.06-1.06M14.72 5.28l1.06-1.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 6.5a3.5 3.5 0 000 7" stroke="none"/></svg>
      </button>
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

  // URL 변경 (History API)
  var newPath = page === 'main' ? '/' : ('/' + page + (param ? '/' + param : ''));
  if (window.location.pathname !== newPath) {
    history.pushState({ page: page, param: param || null }, '', newPath);
  }

  
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

function openSettings() {
  var panel = document.getElementById('settings-panel-bg');
  if (panel) { panel.style.display = 'flex'; _updateThemeBtns(); }
}
function closeSettings() {
  var panel = document.getElementById('settings-panel-bg');
  if (panel) panel.style.display = 'none';
}
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('stella_theme', theme);
  _updateThemeBtns();
}
function _updateThemeBtns() {
  var cur   = document.documentElement.getAttribute('data-theme') || 'dark';
  var darkB  = document.getElementById('theme-dark-btn');
  var lightB = document.getElementById('theme-light-btn');
  if (darkB)  { darkB.style.borderColor  = cur==='dark'  ? 'var(--purple)' : 'var(--b1)'; darkB.style.background  = cur==='dark'  ? 'var(--purple-dim)' : 'transparent'; darkB.style.color  = cur==='dark'  ? 'var(--purple)' : 'var(--muted)'; }
  if (lightB) { lightB.style.borderColor = cur==='light' ? 'var(--purple)' : 'var(--b1)'; lightB.style.background = cur==='light' ? 'var(--purple-dim)' : 'transparent'; lightB.style.color = cur==='light' ? 'var(--purple)' : 'var(--muted)'; }
}
function resetPopup() {
  localStorage.removeItem('stella_popup_skip');
  closeSettings();
  var p = document.getElementById('main-popup');
  if (p) p.style.display = 'flex';
}
function _applyInitTheme() {
  var theme = localStorage.getItem('stella_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
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
