// ===================================================================
// CookMate - Navigation, Header & Footer Rendering
// ===================================================================

var Navigation = {
  currentPage: '',

  init: function () {
    this.renderHeader();
    this.renderFooter();
    this.setupMobileMenu();
    this.setupHeaderSearch();
    this.updateAuthArea();
    this.highlightCurrentNav();
    updateFavoriteBadge();
  },

  // ---------------------------------------------------------------
  // Guard access to create recipe for guests
  // ---------------------------------------------------------------
  guardCreateRecipe: function (e) {
    if (typeof CookMateStorage !== 'undefined' && !CookMateStorage.isLoggedIn()) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (typeof CookMateUI !== 'undefined') {
        CookMateUI.showToast('Vui lòng đăng nhập để bắt đầu đăng công thức món ăn của bạn!', 'info');
      }
      var base = getBasePath();
      setTimeout(function () {
        window.location.href = base + 'pages/auth/login.html?redirect=' + encodeURIComponent('pages/account/recipe-form.html');
      }, 400);
      return false;
    }
    return true;
  },

  // ---------------------------------------------------------------
  // Header HTML
  // ---------------------------------------------------------------
  getHeaderHTML: function () {
    var base = getBasePath();
    return '' +
      '<div class="header-inner container">' +
        '<a href="' + base + 'index.html" class="logo">' +
          '<div class="logo-icon">' +
            '<i class="fa-solid fa-utensils"></i>' +
          '</div>' +
          '<div class="logo-text">' +
            '<span class="logo-name">Cook<span class="logo-accent">Mate</span></span>' +
            '<span class="logo-tagline">Chuẩn định lượng • Trọn dinh dưỡng</span>' +
          '</div>' +
        '</a>' +

        '<nav class="main-nav" id="mainNav">' +
          '<a href="' + base + 'index.html" class="nav-link" data-page="home">' +
            '<i class="fa-solid fa-house"></i> Trang chủ</a>' +
          '<a href="' + base + 'pages/recipes.html" class="nav-link" data-page="recipes">' +
            '<i class="fa-solid fa-compass"></i> Khám phá</a>' +
          '<a href="' + base + 'pages/account/recipe-form.html" class="nav-link" data-page="recipe-form" onclick="return Navigation.guardCreateRecipe(event);">' +
            '<i class="fa-solid fa-circle-plus"></i> Đăng công thức</a>' +
          '<a href="' + base + 'pages/account/favorites.html" class="nav-link" data-page="favorites">' +
            '<i class="fa-solid fa-heart"></i> Yêu thích</a>' +
        '</nav>' +

        '<div class="header-actions">' +
          '<div class="header-search">' +
            '<i class="fa-solid fa-magnifying-glass"></i>' +
            '<input type="text" placeholder="Tìm món, nguyên liệu..." id="headerSearchInput" aria-label="Tìm kiếm nhanh">' +
          '</div>' +

          '<a href="' + base + 'pages/account/favorites.html" class="btn-icon header-fav-btn" title="Yêu thích" aria-label="Món yêu thích">' +
            '<i class="fa-solid fa-heart"></i>' +
            '<span class="fav-badge" id="favCountBadge" style="display:none">0</span>' +
          '</a>' +

          '<div class="auth-area" id="authArea"></div>' +

          '<button class="menu-toggle" id="menuToggle" aria-label="Mở menu" aria-expanded="false">' +
            '<span class="hamburger-line"></span>' +
            '<span class="hamburger-line"></span>' +
            '<span class="hamburger-line"></span>' +
          '</button>' +
        '</div>' +
      '</div>';
  },

  // ---------------------------------------------------------------
  // Mobile Nav HTML (Rendered directly into body to avoid backdrop-filter trapping)
  // ---------------------------------------------------------------
  getMobileNavHTML: function () {
    var base = getBasePath();
    var favCount = 0;
    if (typeof CookMateStorage !== 'undefined') {
      favCount = CookMateStorage.getFavorites().length;
    }

    return '' +
      '<div class="mobile-nav" id="mobileNav" role="dialog" aria-modal="true" aria-label="Menu điều hướng di động">' +
        '<div class="mobile-nav__header">' +
          '<a href="' + base + 'index.html" class="mobile-nav__brand">' +
            '<div class="mobile-nav__brand-icon">' +
              '<i class="fa-solid fa-utensils"></i>' +
            '</div>' +
            '<span class="mobile-nav__brand-name">Cook<span class="mobile-nav__brand-accent">Mate</span></span>' +
          '</a>' +
          '<button type="button" class="mobile-nav__close" id="mobileNavClose" aria-label="Đóng menu">' +
            '<i class="fa-solid fa-xmark"></i>' +
          '</button>' +
        '</div>' +

        '<div class="mobile-nav__body">' +
          // Nhóm 1: Khám phá ẩm thực
          '<div class="mobile-nav__section">' +
            '<div class="mobile-nav__section-title">Khám phá</div>' +
            '<nav class="mobile-nav__menu" aria-label="Khám phá">' +
              '<a href="' + base + 'index.html" class="mobile-nav__link" data-page="home">' +
                '<i class="fa-solid fa-house"></i> <span>Trang chủ</span></a>' +
              '<a href="' + base + 'pages/recipes.html" class="mobile-nav__link" data-page="recipes">' +
                '<i class="fa-solid fa-book-open"></i> <span>Tất cả công thức</span></a>' +
              '<a href="' + base + 'pages/categories.html" class="mobile-nav__link" data-page="categories">' +
                '<i class="fa-solid fa-layer-group"></i> <span>Danh mục món ăn</span></a>' +
              '<a href="' + base + 'pages/new-recipes.html" class="mobile-nav__link" data-page="new-recipes">' +
                '<i class="fa-solid fa-sparkles"></i> <span>Công thức mới nhất</span></a>' +
              '<a href="' + base + 'pages/featured-recipes.html" class="mobile-nav__link" data-page="featured">' +
                '<i class="fa-solid fa-fire"></i> <span>Công thức nổi bật</span></a>' +
              '<a href="' + base + 'pages/holiday-recipes.html" class="mobile-nav__link" data-page="holiday">' +
                '<i class="fa-solid fa-calendar-days"></i> <span>Món theo dịp lễ</span></a>' +
              '<a href="' + base + 'pages/search.html" class="mobile-nav__link" data-page="search">' +
                '<i class="fa-solid fa-magnifying-glass"></i> <span>Tìm kiếm công thức</span></a>' +
            '</nav>' +
          '</div>' +

          // Nhóm 2: Cá nhân & Đăng bài
          '<div class="mobile-nav__section">' +
            '<div class="mobile-nav__section-title">Cá nhân & Đăng bài</div>' +
            '<nav class="mobile-nav__menu" aria-label="Cá nhân">' +
              '<a href="' + base + 'pages/account/recipe-form.html" class="mobile-nav__link" data-page="recipe-form" onclick="return Navigation.guardCreateRecipe(event);">' +
                '<i class="fa-solid fa-circle-plus"></i> <span>Đăng công thức mới</span></a>' +
              '<a href="' + base + 'pages/account/favorites.html" class="mobile-nav__link" data-page="favorites">' +
                '<i class="fa-solid fa-heart"></i> <span>Món ăn yêu thích</span>' +
                '<span class="mobile-nav__badge" id="mobileFavBadge"' + (favCount > 0 ? '' : ' style="display:none"') + '>' + favCount + '</span>' +
              '</a>' +
              '<a href="' + base + 'pages/account/my-recipes.html" class="mobile-nav__link" data-page="my-recipes">' +
                '<i class="fa-solid fa-book-bookmark"></i> <span>Công thức của tôi</span></a>' +
            '</nav>' +
          '</div>' +

          // Nhóm 3: Tài khoản (Nạp động qua updateAuthArea)
          '<div class="mobile-nav__section mobile-nav__section--auth">' +
            '<div class="mobile-nav__section-title">Tài khoản</div>' +
            '<div class="mobile-nav__auth" id="mobileAuthArea"></div>' +
          '</div>' +
        '</div>' +

        '<div class="mobile-nav__footer">' +
          '<p class="mobile-nav__footer-text">CookMate • Chuẩn định lượng, trọn dinh dưỡng</p>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-nav-overlay" id="mobileNavOverlay" aria-hidden="true"></div>';
  },

  // ---------------------------------------------------------------
  // Footer HTML (Cấu trúc mới: 4 khu vực chuẩn + Minh họa Bát phở Hà Nội, loại bỏ 100% link tài khoản trùng Header)
  // ---------------------------------------------------------------
  getFooterHTML: function () {
    var base = getBasePath();
    return '' +
      '<div class="container">' +
        '<div class="footer-grid">' +

          '<!-- Khu vực A: Thương hiệu CookMate -->' +
          '<div class="footer-brand">' +
            '<div class="logo">' +
              '<div class="logo-icon"><i class="fa-solid fa-utensils"></i></div>' +
              '<div class="logo-text">' +
                '<span class="logo-name">Cook<span class="logo-accent">Mate</span></span>' +
              '</div>' +
            '</div>' +
            '<p class="footer-desc">' +
              'CookMate là nền tảng chia sẻ và khám phá công thức nấu ăn với tính năng tự động co giãn khẩu phần ' +
              'và ước tính dinh dưỡng, giúp bạn nấu ăn chuẩn định lượng, trọn vị mỗi ngày.' +
            '</p>' +
            '<div class="footer-contact-info">' +
              '<span class="footer-contact-item"><i class="fa-regular fa-envelope"></i> hotro@cookmate.vn</span>' +
              '<span class="footer-contact-item"><i class="fa-solid fa-location-dot"></i> Hà Nội, Việt Nam</span>' +
            '</div>' +
          '</div>' +

          '<!-- Khu vực B: Khám phá công thức -->' +
          '<div class="footer-links">' +
            '<h4 class="footer-heading">Khám phá</h4>' +
            '<a href="' + base + 'pages/recipes.html">Khám phá công thức</a>' +
            '<a href="' + base + 'pages/categories.html">Danh mục món ăn</a>' +
            '<a href="' + base + 'pages/recipes.html?filter=featured">Công thức nổi bật</a>' +
            '<a href="' + base + 'pages/holiday-recipes.html">Món theo dịp lễ</a>' +
          '</div>' +

          '<!-- Khu vực C: Về CookMate -->' +
          '<div class="footer-links">' +
            '<h4 class="footer-heading">Về CookMate</h4>' +
            '<a href="' + base + 'pages/recipes.html?view=about">Giới thiệu nền tảng</a>' +
            '<a href="' + base + 'pages/recipes.html?view=faq">Câu hỏi thường gặp</a>' +
            '<a href="' + base + 'pages/recipes.html?view=feedback">Góp ý & Báo lỗi</a>' +
          '</div>' +

          '<!-- Khu vực D: Thông tin -->' +
          '<div class="footer-links">' +
            '<h4 class="footer-heading">Thông tin</h4>' +
            '<a href="' + base + 'pages/recipes.html?view=terms">Điều khoản sử dụng</a>' +
            '<a href="' + base + 'pages/recipes.html?view=privacy">Chính sách bảo mật</a>' +
            '<a href="' + base + 'pages/recipes.html?view=nutrition">Thông tin dinh dưỡng</a>' +
          '</div>' +

          '<!-- Khu vực E: Điểm nhấn Minh họa Bát phở Hà Nội (Brand Illustration) -->' +
          '<div class="footer-brand-art">' +
            '<div class="footer-pho-wrapper">' +
              '<img src="' + base + 'assets/images/hanoi-pho-art.svg" alt="Minh họa Bát phở Hà Nội CookMate" class="footer-pho-img" loading="lazy">' +
              '<div class="footer-pho-caption">' +
                '<span class="footer-pho-title"><i class="fa-solid fa-bowl-rice"></i> Phở Hà Nội</span>' +
                '<span class="footer-pho-subtitle">Tinh hoa ẩm thực Việt</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

        '</div>' +

        '<div class="footer-bottom">' +
          '<p>&copy; 2024 CookMate. Dự án website hỗ trợ nấu ăn — Chuẩn định lượng, trọn dinh dưỡng.</p>' +
          '<div class="footer-bottom-badges">' +
            '<span class="footer-badge-tag"><i class="fa-solid fa-heart text-primary"></i> Lan tỏa đam mê bếp Việt</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  },

  // ---------------------------------------------------------------
  // Render header and footer into DOM
  // ---------------------------------------------------------------
  renderHeader: function () {
    var header = document.getElementById('siteHeader');
    if (header) header.innerHTML = this.getHeaderHTML();
    this.renderMobileNav();
  },

  renderMobileNav: function () {
    var existingNav = document.getElementById('mobileNav');
    if (existingNav) existingNav.remove();
    var existingOverlay = document.getElementById('mobileNavOverlay');
    if (existingOverlay) existingOverlay.remove();

    var temp = document.createElement('div');
    temp.innerHTML = this.getMobileNavHTML();
    while (temp.firstChild) {
      document.body.appendChild(temp.firstChild);
    }
  },

  renderFooter: function () {
    var footer = document.getElementById('siteFooter');
    if (footer) footer.innerHTML = this.getFooterHTML();
  },

  // ---------------------------------------------------------------
  // Mobile menu interactions
  // ---------------------------------------------------------------
  setupMobileMenu: function () {
    var toggle = document.getElementById('menuToggle');
    var nav = document.getElementById('mobileNav');
    var overlay = document.getElementById('mobileNavOverlay');
    var close = document.getElementById('mobileNavClose');

    if (!toggle || !nav) return;

    var openMenu = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      nav.classList.add('is-open', 'active');
      if (overlay) overlay.classList.add('is-visible', 'active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };

    var closeMenu = function (e) {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      nav.classList.remove('is-open', 'active');
      if (overlay) overlay.classList.remove('is-visible', 'active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    toggle.onclick = openMenu;
    if (close) close.onclick = closeMenu;
    if (overlay) overlay.onclick = closeMenu;

    // Phím Escape để đóng menu
    document.onkeydown = function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu(e);
      }
    };

    // Bắt sự kiện click vào bất kỳ liên kết/nút bấm nào bên trong drawer (trừ nút close)
    nav.onclick = function (e) {
      var target = e.target.closest('a, button');
      if (target && target.id !== 'mobileNavClose') {
        closeMenu(e);
      }
    };
  },

  // ---------------------------------------------------------------
  // Auth area (logged-in / guest state)
  // ---------------------------------------------------------------
  updateAuthArea: function () {
    var authArea = document.getElementById('authArea');
    var mobileAuthArea = document.getElementById('mobileAuthArea');
    var base = getBasePath();
    var user = CookMateStorage.getCurrentUser();

    var desktopHtml, mobileHtml;

    if (user) {
      // --- Desktop Logged-in state ---
      desktopHtml = '' +
        '<div class="user-menu">' +
          '<button class="user-menu__trigger" id="userMenuTrigger">' +
            '<div class="user-avatar">' + (user.name ? user.name.charAt(0).toUpperCase() : 'U') + '</div>' +
            '<span class="user-name">' + escapeHtml(user.name) + '</span>' +
            '<i class="fa-solid fa-chevron-down"></i>' +
          '</button>' +
          '<div class="user-menu__dropdown" id="userDropdown">' +
            '<a href="' + base + 'pages/account/profile.html" class="user-menu__item">' +
              '<i class="fa-solid fa-user"></i> Hồ sơ cá nhân</a>' +
            '<a href="' + base + 'pages/account/my-recipes.html" class="user-menu__item">' +
              '<i class="fa-solid fa-book"></i> Công thức của tôi</a>' +
            '<a href="' + base + 'pages/account/favorites.html" class="user-menu__item">' +
              '<i class="fa-solid fa-heart"></i> Yêu thích</a>' +
            '<a href="' + base + 'pages/account/recipe-form.html" class="user-menu__item">' +
              '<i class="fa-solid fa-plus"></i> Đăng công thức</a>' +
            (user.role === 'admin'
              ? '<hr class="user-menu__divider">' +
                '<a href="' + base + 'pages/admin/index.html" class="user-menu__item user-menu__item--admin">' +
                  '<i class="fa-solid fa-gear"></i> Quản trị</a>'
              : '') +
            '<hr class="user-menu__divider">' +
            '<button class="user-menu__item user-menu__item--logout" onclick="handleLogout()">' +
              '<i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</button>' +
          '</div>' +
        '</div>';

      // --- Mobile Logged-in state ---
      mobileHtml = '' +
        '<div class="mobile-user-card">' +
          '<div class="mobile-user-avatar">' + (user.name ? user.name.charAt(0).toUpperCase() : 'U') + '</div>' +
          '<div class="mobile-user-info">' +
            '<strong class="mobile-user-name">' + escapeHtml(user.name) + '</strong>' +
            '<span class="mobile-user-role">' + (user.role === 'admin' ? '<i class="fa-solid fa-shield-halved"></i> Quản trị viên' : '<i class="fa-solid fa-user"></i> Thành viên') + '</span>' +
          '</div>' +
        '</div>' +
        '<nav class="mobile-nav__menu" aria-label="Tài khoản cá nhân">' +
          '<a href="' + base + 'pages/account/profile.html" class="mobile-nav__link" data-page="profile">' +
            '<i class="fa-solid fa-id-card"></i> <span>Hồ sơ cá nhân</span></a>' +
          '<a href="' + base + 'pages/account/my-recipes.html" class="mobile-nav__link" data-page="my-recipes">' +
            '<i class="fa-solid fa-book-bookmark"></i> <span>Công thức của tôi</span></a>' +
          '<a href="' + base + 'pages/account/recipe-form.html" class="mobile-nav__link" data-page="recipe-form">' +
            '<i class="fa-solid fa-circle-plus"></i> <span>Đăng công thức mới</span></a>' +
          (user.role === 'admin'
            ? '<a href="' + base + 'pages/admin/index.html" class="mobile-nav__link mobile-nav__link--admin" data-page="admin">' +
                '<i class="fa-solid fa-gear"></i> <span>Trang Quản trị</span></a>'
            : '') +
          '<button type="button" class="mobile-nav__link mobile-nav__link--logout" onclick="handleLogout()">' +
            '<i class="fa-solid fa-right-from-bracket"></i> <span>Đăng xuất</span></button>' +
        '</nav>';

    } else {
      // --- Desktop Guest state ---
      desktopHtml = '' +
        '<a href="' + base + 'pages/auth/login.html" class="btn btn-ghost btn-sm">Đăng nhập</a>' +
        '<a href="' + base + 'pages/auth/register.html" class="btn btn-primary btn-sm">Đăng ký</a>';

      // --- Mobile Guest state ---
      mobileHtml = '' +
        '<div class="mobile-guest-card">' +
          '<div class="mobile-guest-header">' +
            '<i class="fa-regular fa-circle-user"></i>' +
            '<div>' +
              '<strong>Chào mừng bạn!</strong>' +
              '<p class="mobile-guest-desc">Đăng nhập để lưu công thức yêu thích và chia sẻ món ngon.</p>' +
            '</div>' +
          '</div>' +
          '<div class="mobile-guest-actions">' +
            '<a href="' + base + 'pages/auth/login.html" class="btn btn-secondary btn-sm mobile-auth-btn">' +
              '<i class="fa-solid fa-right-to-bracket"></i> Đăng nhập</a>' +
            '<a href="' + base + 'pages/auth/register.html" class="btn btn-primary btn-sm mobile-auth-btn">' +
              '<i class="fa-solid fa-user-plus"></i> Đăng ký</a>' +
          '</div>' +
        '</div>';
    }

    if (authArea) authArea.innerHTML = desktopHtml;
    if (mobileAuthArea) mobileAuthArea.innerHTML = mobileHtml;

    // Setup user dropdown toggle for desktop
    var trigger = document.getElementById('userMenuTrigger');
    var dropdown = document.getElementById('userDropdown');
    if (trigger && dropdown) {
      trigger.onclick = function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('is-open');
      };
      document.onclick = function () {
        dropdown.classList.remove('is-open');
      };
    }
  },

  // ---------------------------------------------------------------
  // Highlight current navigation link (exact page match to prevent multiple active items)
  // ---------------------------------------------------------------
  highlightCurrentNav: function () {
    var pathname = window.location.pathname.replace(/\\/g, '/');
    var filename = pathname.substring(pathname.lastIndexOf('/') + 1).toLowerCase() || 'index.html';
    if (!filename || filename === '') filename = 'index.html';

    var currentPage = '';
    if (filename === 'index.html' || pathname.endsWith('/')) {
      currentPage = 'home';
    } else if (filename === 'recipes.html') {
      currentPage = 'recipes';
    } else if (filename === 'categories.html') {
      currentPage = 'categories';
    } else if (filename === 'new-recipes.html') {
      currentPage = 'new-recipes';
    } else if (filename === 'featured-recipes.html') {
      currentPage = 'featured';
    } else if (filename === 'holiday-recipes.html') {
      currentPage = 'holiday';
    } else if (filename === 'search.html') {
      currentPage = 'search';
    } else if (filename === 'favorites.html') {
      currentPage = 'favorites';
    } else if (filename === 'profile.html') {
      currentPage = 'profile';
    } else if (filename === 'my-recipes.html') {
      currentPage = 'my-recipes';
    } else if (filename === 'recipe-form.html') {
      currentPage = 'recipe-form';
    } else if (filename === 'admin' || pathname.includes('/admin/')) {
      currentPage = 'admin';
    }

    var links = document.querySelectorAll('[data-page]');
    links.forEach(function (link) {
      var page = link.getAttribute('data-page');
      if (currentPage && page === currentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  },

  // ---------------------------------------------------------------
  // Header search
  // ---------------------------------------------------------------
  setupHeaderSearch: function () {
    var input = document.getElementById('headerSearchInput');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && input.value.trim()) {
          var base = getBasePath();
          window.location.href = base + 'pages/recipes.html?q=' + encodeURIComponent(input.value.trim());
        }
      });
    }
  }
};

// ===================================================================
// Global logout handler (With Preview Iframe Session Isolation)
// ===================================================================
function handleLogout() {
  var isInsideIframe = window.self !== window.top;

  if (isInsideIframe) {
    // Đăng xuất bên trong khung xem website preview: chỉ xóa session website con,
    // TUYỆT ĐỐI không làm mất phiên Admin Shell bên ngoài
    if (typeof CookMateStorage !== 'undefined') {
      CookMateStorage.remove(CookMateStorage.KEYS.USER);
    } else {
      localStorage.removeItem('cookmate_current_user');
    }
    if (typeof CookMateUI !== 'undefined') {
      CookMateUI.showToast('Đã đăng xuất khỏi phiên xem website', 'info');
    }
    setTimeout(function () {
      window.location.href = getBasePath() + 'index.html';
    }, 400);
    return;
  }

  // Đăng xuất từ cửa sổ chính: xóa toàn bộ session
  if (typeof CookMateStorage !== 'undefined') {
    CookMateStorage.clearCurrentUser();
    if (CookMateStorage.clearAdminSession) {
      CookMateStorage.clearAdminSession();
    }
  } else {
    localStorage.removeItem('cookmate_current_user');
    localStorage.removeItem('cookmate_admin_session');
  }

  try {
    sessionStorage.removeItem('cookmate_sidebar_closed');
    sessionStorage.removeItem('cookmate_sidebar_scroll');
  } catch (e) {}

  if (typeof CookMateUI !== 'undefined') {
    CookMateUI.showToast('Đã đăng xuất thành công', 'success');
  }
  setTimeout(function () {
    window.location.href = getBasePath() + 'index.html';
  }, 400);
}