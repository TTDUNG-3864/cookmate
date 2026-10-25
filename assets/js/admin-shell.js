/**
 * CookMate Admin Shell Controller (V2 - Seamless SPA Shell)
 * 1. Lỗi A: Xóa hoàn toàn 2 thanh preview dư thừa, website User hiển thị trực tiếp từ Header User
 * 2. Lỗi B: Nút điều khiển duy nhất (#sidebarToggleBtn) đóng/mở sidebar:
 *    - Khi mở: hiển thị dấu X (fa-solid fa-xmark)
 *    - Khi đóng: hiển thị 3 gạch (fa-solid fa-bars), sidebar ẩn gọn (width: 0), nội dung mở rộng full
 * 3. Lỗi C: Điều hướng Admin không reload toàn bộ trang, duy trì trạng thái Sidebar ổn định 100%
 */

(function () {
  'use strict';

  // Chống nhúng trang Admin bên trong chính iframe xem trước
  if (window.self !== window.top && window.location.pathname.indexOf('/admin/') !== -1) {
    try {
      window.top.location.href = window.location.href;
      return;
    } catch (e) {}
  }

  // Khôi phục trạng thái sớm từ sessionStorage ngay trên <html>
  var isSavedClosed = sessionStorage.getItem('cookmate_sidebar_closed') === 'true';
  if (isSavedClosed && window.innerWidth >= 1024) {
    document.documentElement.classList.add('sidebar-is-closed');
  }

  var AdminShell = {
    init: function () {
      // 1. Kiểm tra xác thực quyền Admin trước khi khởi tạo shell
      if (typeof window.checkAdminAuth === 'function') {
        if (!window.checkAdminAuth()) return;
      } else if (typeof CookMateStorage !== 'undefined') {
        if (!CookMateStorage.isAdminSessionValid()) {
          window.location.replace('../auth/login.html');
          return;
        }
      }

      this.cacheDom();
      this.setupSingleToggleButton();
      this.setupSidebarPosition();
      this.bindEvents();
      this.restoreSidebarState();
      this.checkUrlParams();
    },

    cacheDom: function () {
      this.layout = document.querySelector('.admin-layout');
      this.sidebar = document.getElementById('adminSidebar');
      this.backdrop = document.getElementById('sidebarBackdrop');
      this.toggleBtn = document.getElementById('sidebarToggleBtn');
      this.adminMain = document.querySelector('.admin-main');
      this.adminHeader = document.querySelector('.admin-header');
      this.mainContent = document.querySelector('.admin-content');
      this.headerTitle = document.querySelector('.admin-header__title');
    },

    /**
     * Thiết lập nút Toggle duy nhất điều khiển Sidebar:
     * - Khi mở: icon X (fa-xmark), aria-expanded="true"
     * - Khi đóng: icon 3 gạch (fa-bars), aria-expanded="false"
     * Loại bỏ các nút đóng/mở trùng lặp khác
     */
    setupSingleToggleButton: function () {
      if (!this.sidebar) return;

      var header = this.sidebar.querySelector('.admin-sidebar__header');
      if (!header) return;

      // Tìm hoặc tạo nút toggle trong sidebar header
      var toggleBtn = document.getElementById('sidebarToggleBtn');
      if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'sidebarToggleBtn';
        toggleBtn.className = 'admin-sidebar-toggle-btn';
        toggleBtn.setAttribute('aria-label', 'Đóng menu sidebar');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.setAttribute('title', 'Đóng menu sidebar');
        toggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        header.appendChild(toggleBtn);
      } else {
        // Đảm bảo nút nằm trong header của sidebar để di chuyển cùng sidebar
        toggleBtn.className = 'admin-sidebar-toggle-btn';
        if (toggleBtn.parentElement !== header) {
          header.appendChild(toggleBtn);
        }
      }

      // Xóa bỏ nút close cũ nếu còn sót lại để không có 2 nút
      var oldClose = document.getElementById('sidebarCloseBtn');
      if (oldClose && oldClose !== toggleBtn) {
        oldClose.remove();
      }

      // Xóa bỏ nút toggle thừa trên admin-header nếu có
      var headerToggles = document.querySelectorAll('.admin-header__toggle');
      headerToggles.forEach(function (btn) {
        if (btn !== toggleBtn) btn.remove();
      });

      this.toggleBtn = toggleBtn;
    },

    /**
     * Đảm bảo nút "Xem website CookMate" ở đầu Sidebar
     */
    setupSidebarPosition: function () {
      if (!this.sidebar) return;

      var nav = this.sidebar.querySelector('.admin-sidebar__nav');
      if (!nav) return;

      var existingTopBtn = document.getElementById('btnViewWebsite');
      if (!existingTopBtn) {
        var topWrap = document.createElement('div');
        topWrap.className = 'admin-sidebar__top-action';
        topWrap.innerHTML = '' +
          '<a href="../../index.html" class="admin-sidebar__link admin-sidebar__link--website" id="btnViewWebsite" data-tooltip="Xem website CookMate" title="Xem website CookMate">' +
            '<i class="fa-solid fa-globe"></i>' +
            '<span>Xem website CookMate</span>' +
          '</a>' +
          '<div class="admin-sidebar__divider"></div>';

        if (nav.firstChild) {
          nav.insertBefore(topWrap, nav.firstChild);
        } else {
          nav.appendChild(topWrap);
        }
      }

      // Xóa mọi bản sao cũ ở cuối sidebar
      var allLinks = nav.querySelectorAll('.admin-sidebar__link');
      allLinks.forEach(function (link) {
        if (link.id !== 'btnViewWebsite') {
          var text = link.textContent.trim().toLowerCase();
          if (text.indexOf('xem website') !== -1) {
            link.remove();
          }
        }
      });
    },

    bindEvents: function () {
      var self = this;

      // Bắt sự kiện click nút Toggle duy nhất
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          self.toggleSidebar();
        });
      }

      // Click vào backdrop trên mobile để đóng
      if (this.backdrop) {
        this.backdrop.addEventListener('click', function (e) {
          e.preventDefault();
          self.closeSidebar();
        });
      }

      // Click nút "Xem website CookMate"
      var viewWebsiteBtn = document.getElementById('btnViewWebsite');
      if (viewWebsiteBtn) {
        viewWebsiteBtn.addEventListener('click', function (e) {
          e.preventDefault();
          self.toggleWebsitePreview(true);
        });
      }

      // Lưu vị trí cuộn sidebar khi cuộn
      if (this.sidebar) {
        this.sidebar.addEventListener('scroll', function () {
          sessionStorage.setItem('cookmate_sidebar_scroll', self.sidebar.scrollTop);
        }, { passive: true });
      }

      // LẮNG NGHE ĐIỀU HƯỚNG SPA KHÔNG RELOAD TRÊN CÁC LIÊN KẾT ADMIN
      document.addEventListener('click', function (e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
        var link = e.target.closest('a');
        if (!link) return;

        var href = link.getAttribute('href');
        if (!href) return;

        // Bỏ qua external, javascript, hash, logout
        if (href.startsWith('http') || href.startsWith('//') || href.startsWith('javascript:') || href.startsWith('#')) {
          return;
        }

        // Nếu là nút Xem website
        if (link.id === 'btnViewWebsite' || href.indexOf('index.html') !== -1 && href.indexOf('../../') !== -1) {
          e.preventDefault();
          self.toggleWebsitePreview(true);
          return;
        }

        // Kiểm tra xem link có trỏ tới trang admin nội bộ không
        var isTargetAdmin = false;
        var adminPages = [
          'index.html', 'approve-recipes.html', 'recipe-form.html', 'recipes.html',
          'categories.html', 'ingredients.html', 'accounts.html', 'comments.html', 'statistics.html'
        ];

        for (var i = 0; i < adminPages.length; i++) {
          if (href === adminPages[i] || href.endsWith('/' + adminPages[i])) {
            isTargetAdmin = true;
            break;
          }
        }

        if (isTargetAdmin) {
          e.preventDefault();
          // Nếu đang xem website, đóng preview và quay về admin shell
          self.toggleWebsitePreview(false);
          // Đóng drawer trên mobile nếu đang mở
          if (window.innerWidth < 1024) {
            self.closeSidebar();
          }
          // Điều hướng in-place không reload
          self.loadPageContent(href, true);
        }
      });

      // Lắng nghe nút Back / Forward của trình duyệt
      window.addEventListener('popstate', function (e) {
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('view') === 'website') {
          self.toggleWebsitePreview(true);
        } else {
          self.toggleWebsitePreview(false);
          var path = window.location.pathname.split('/').pop() || 'index.html';
          self.loadPageContent(path, false);
        }
      });
    },

    /**
     * Bật / Tắt Sidebar và cập nhật icon (3 gạch <-> X)
     */
    toggleSidebar: function () {
      var isCurrentlyOpen = this.isSidebarOpen();
      if (isCurrentlyOpen) {
        this.closeSidebar();
      } else {
        this.openSidebar();
      }
    },

    isSidebarOpen: function () {
      if (window.innerWidth >= 1024) {
        if (this.layout && this.layout.classList.contains('sidebar-closed')) return false;
        if (document.documentElement.classList.contains('sidebar-is-closed')) return false;
        return true;
      } else {
        return this.sidebar ? this.sidebar.classList.contains('active') : false;
      }
    },

    openSidebar: function () {
      if (window.innerWidth >= 1024) {
        if (this.layout) this.layout.classList.remove('sidebar-closed');
        document.documentElement.classList.remove('sidebar-is-closed');
        sessionStorage.setItem('cookmate_sidebar_closed', 'false');
      } else {
        if (this.sidebar) this.sidebar.classList.add('active');
        if (this.backdrop) this.backdrop.classList.add('active');
      }

      // Khi Sidebar MỞ: nút nằm trong .admin-sidebar__header với icon dấu X
      var header = this.sidebar ? this.sidebar.querySelector('.admin-sidebar__header') : null;
      if (header && this.toggleBtn) {
        this.toggleBtn.className = 'admin-sidebar-toggle-btn';
        if (this.toggleBtn.parentElement !== header) {
          header.appendChild(this.toggleBtn);
        }
      }

      this.updateButtonUI(true);
    },

    closeSidebar: function () {
      if (window.innerWidth >= 1024) {
        if (this.layout) this.layout.classList.add('sidebar-closed');
        document.documentElement.classList.add('sidebar-is-closed');
        sessionStorage.setItem('cookmate_sidebar_closed', 'true');
      } else {
        if (this.sidebar) this.sidebar.classList.remove('active');
        if (this.backdrop) this.backdrop.classList.remove('active');
      }

      // Khi Sidebar ĐÓNG: di chuyển nút ra ngoài sidebar để luôn nhìn thấy và bấm được
      var isViewingWebsite = this.layout && this.layout.classList.contains('viewing-website');
      if (this.toggleBtn) {
        if (isViewingWebsite || !this.adminHeader) {
          this.toggleBtn.className = 'admin-sidebar-toggle-btn admin-sidebar-toggle-btn--bars admin-sidebar-toggle-btn--floating';
          document.body.appendChild(this.toggleBtn);
        } else {
          this.toggleBtn.className = 'admin-sidebar-toggle-btn admin-sidebar-toggle-btn--bars';
          if (this.adminHeader.firstChild) {
            this.adminHeader.insertBefore(this.toggleBtn, this.adminHeader.firstChild);
          } else {
            this.adminHeader.appendChild(this.toggleBtn);
          }
        }
      }

      this.updateButtonUI(false);
    },

    updateButtonUI: function (isOpen) {
      if (!this.toggleBtn) return;

      if (isOpen) {
        // Khi sidebar đang mở -> hiển thị icon dấu X
        this.toggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        this.toggleBtn.setAttribute('aria-label', 'Đóng menu sidebar');
        this.toggleBtn.setAttribute('aria-expanded', 'true');
        this.toggleBtn.setAttribute('title', 'Đóng menu sidebar');
      } else {
        // Khi sidebar đang đóng -> hiển thị icon 3 gạch hamburger
        this.toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        this.toggleBtn.setAttribute('aria-label', 'Mở menu sidebar');
        this.toggleBtn.setAttribute('aria-expanded', 'false');
        this.toggleBtn.setAttribute('title', 'Mở menu sidebar');
      }
    },

    restoreSidebarState: function () {
      var self = this;
      var isClosed = sessionStorage.getItem('cookmate_sidebar_closed') === 'true' ||
                     sessionStorage.getItem('cookmate_sidebar_collapsed') === 'true';

      if (window.innerWidth >= 1024) {
        if (isClosed) {
          self.closeSidebar();
        } else {
          self.openSidebar();
        }
      } else {
        // Mobile mặc định đóng drawer
        self.closeSidebar();
      }

      // Khôi phục vị trí cuộn
      var savedScroll = sessionStorage.getItem('cookmate_sidebar_scroll');
      if (savedScroll && this.sidebar) {
        requestAnimationFrame(function () {
          self.sidebar.scrollTop = parseInt(savedScroll, 10) || 0;
        });
      }
    },

    /**
     * LỖI A: XEM WEBSITE COOKMATE TẠI CHỖ (XÓA 100% 2 THANH DƯ THỪA)
     * Vùng bên phải hiển thị nguyên bản Website User: Bắt đầu ngay từ Header User đến Footer User!
     */
    toggleWebsitePreview: function (show) {
      var previewContainer = document.getElementById('adminWebsitePreview');
      var viewWebsiteBtn = document.getElementById('btnViewWebsite');

      if (show) {
        if (!previewContainer) {
          previewContainer = this.createPreviewContainer();
        }

        // 1. ẨN HOÀN TOÀN THANH TIÊU ĐỀ ADMIN HEADER TRÊN ĐẦU
        if (this.adminHeader) {
          this.adminHeader.style.display = 'none';
        }

        // 2. Ẩn nội dung quản trị
        if (this.mainContent) {
          this.mainContent.style.display = 'none';
        }

        // 3. Hiển thị khung xem website chiếm trọn vẹn 100% chiều cao và chiều rộng
        previewContainer.style.display = 'block';

        // Đánh dấu active trên sidebar
        document.querySelectorAll('.admin-sidebar__link').forEach(function (l) {
          l.classList.remove('active');
        });
        if (viewWebsiteBtn) viewWebsiteBtn.classList.add('active');

        // Thêm class viewing-website lên layout để điều chỉnh styling nếu cần
        if (this.layout) this.layout.classList.add('viewing-website');

        // Cập nhật tham số URL ?view=website (không reload)
        if (window.location.search.indexOf('view=website') === -1) {
          history.pushState({ view: 'website' }, '', window.location.pathname + '?view=website');
        }

        // Đóng drawer trên mobile nếu đang mở
        if (window.innerWidth < 1024) {
          this.closeSidebar();
        }

      } else {
        // Đóng preview, khôi phục giao diện quản trị
        if (previewContainer) {
          previewContainer.style.display = 'none';
        }
        if (this.adminHeader) {
          this.adminHeader.style.display = '';
        }
        if (this.mainContent) {
          this.mainContent.style.display = '';
        }
        if (this.layout) {
          this.layout.classList.remove('viewing-website');
        }
        if (viewWebsiteBtn) {
          viewWebsiteBtn.classList.remove('active');
        }

        // Khôi phục active link theo trang hiện tại
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.updateActiveSidebarLink(currentPage);

        // Xóa param ?view=website nếu có
        if (window.location.search.indexOf('view=website') !== -1) {
          history.pushState(null, '', window.location.pathname);
        }
      }
    },

    /**
     * Tạo container nhúng website: TUYỆT ĐỐI KHÔNG CÓ BẤT KỲ TOOLBAR HAY TIÊU ĐỀ NÀO!
     */
    createPreviewContainer: function () {
      var container = document.createElement('div');
      container.id = 'adminWebsitePreview';
      container.className = 'admin-website-preview';
      // Chỉ chứa duy nhất 1 iframe toàn màn hình, tải từ Header User của index.html
      container.innerHTML = '<iframe id="adminWebsitePreviewFrame" src="../../index.html" title="CookMate Website User Preview"></iframe>';

      if (this.adminMain) {
        this.adminMain.appendChild(container);
      }
      return container;
    },

    /**
     * Cập nhật active link trên sidebar
     */
    updateActiveSidebarLink: function (fileName) {
      if (!this.sidebar) return;
      var cleanName = fileName.split('/').pop().split('?')[0] || 'index.html';
      var links = this.sidebar.querySelectorAll('.admin-sidebar__link');
      links.forEach(function (l) {
        var href = l.getAttribute('href');
        if (href && (href === cleanName || href.endsWith('/' + cleanName))) {
          l.classList.add('active');
        } else {
          l.classList.remove('active');
        }
      });
    },

    /**
     * LỖI C: ĐIỀU HƯỚNG NỘI BỘ SPA KHÔNG RELOAD ADMIN SHELL
     */
    loadPageContent: async function (url, pushToHistory) {
      // Xác thực lại phiên Admin trước khi chuyển mục
      if (typeof window.checkAdminAuth === 'function' && !window.checkAdminAuth()) {
        return;
      }
      var self = this;
      try {
        var res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var html = await res.text();

        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        // 1. Cập nhật Title trang
        if (doc.title) {
          document.title = doc.title;
        }

        // 2. Cập nhật Tiêu đề Admin Header & Các nút Action
        var newTitle = doc.querySelector('.admin-header__title');
        if (newTitle && self.headerTitle) {
          self.headerTitle.innerHTML = newTitle.innerHTML;
        }

        var newActions = doc.querySelector('.admin-header__actions');
        var currentActions = document.querySelector('.admin-header__actions');
        if (newActions && currentActions) {
          currentActions.innerHTML = newActions.innerHTML;
        }

        // 3. Cập nhật Vùng nội dung chính (.admin-content)
        var newContent = doc.querySelector('.admin-content');
        if (newContent && self.mainContent) {
          self.mainContent.innerHTML = newContent.innerHTML;
        }

        // 4. Cập nhật data-admin-page trên body
        if (doc.body.dataset.adminPage) {
          document.body.dataset.adminPage = doc.body.dataset.adminPage;
        }

        // 5. Cập nhật Modal động (tránh xung đột / trùng lặp)
        var dynamicModals = document.getElementById('adminDynamicModals');
        if (!dynamicModals) {
          dynamicModals = document.createElement('div');
          dynamicModals.id = 'adminDynamicModals';
          document.body.appendChild(dynamicModals);
        }
        dynamicModals.innerHTML = '';
        var modals = doc.querySelectorAll('.modal-overlay, .modal');
        modals.forEach(function (m) {
          if (!m.closest('.admin-content')) {
            dynamicModals.appendChild(m.cloneNode(true));
          }
        });

        // 6. Cập nhật active link trên sidebar
        self.updateActiveSidebarLink(url);

        // 7. Cập nhật URL trình duyệt qua History API
        if (pushToHistory !== false) {
          history.pushState({ page: url }, '', url);
        }

        // 8. Thực thi script của trang con (tự động chạy các hàm init mà không cần reload)
        self.executePageScripts(doc);

        // 9. Cập nhật số lượng công thức chờ duyệt trên badge nếu có
        if (typeof CookMateStorage !== 'undefined' && CookMateStorage.getPendingRecipes) {
          var sideBadge = document.getElementById('sidebarPendingBadge');
          if (sideBadge) {
            var count = CookMateStorage.getPendingRecipes().length;
            sideBadge.textContent = count;
            sideBadge.style.display = count > 0 ? 'inline-flex' : 'none';
          }
        }

      } catch (err) {
        // Fallback an toàn cho môi trường file:// hoặc lỗi fetch
        console.warn('In-place navigation fallback to window.location:', err);
        window.location.href = url;
      }
    },

    /**
     * Chạy script của trang con được load động
     */
    executePageScripts: function (doc) {
      var scripts = doc.querySelectorAll('script:not([src])');
      scripts.forEach(function (s) {
        var code = s.textContent.trim();
        if (!code) return;
        try {
          var scriptEl = document.createElement('script');
          // Chèn shim bắt DOMContentLoaded để hàm init của trang chạy ngay lập tức,
          // đồng thời giữ hàm toàn cục trong window cho các inline event handlers (onclick...)
          scriptEl.textContent = 
            'window._cmTempAddEvent = document.addEventListener;\n' +
            'document.addEventListener = function(evt, fn, opts) {\n' +
            '  if (evt === "DOMContentLoaded") {\n' +
            '    try { fn(); } catch(e) { console.error("Page script init error:", e); }\n' +
            '  } else {\n' +
            '    window._cmTempAddEvent.call(document, evt, fn, opts);\n' +
            '  }\n' +
            '};\n' +
            'try {\n' +
            code + '\n' +
            '} finally {\n' +
            '  document.addEventListener = window._cmTempAddEvent;\n' +
            '  delete window._cmTempAddEvent;\n' +
            '}\n';
          document.body.appendChild(scriptEl);
          scriptEl.remove();
        } catch (e) {
          console.error('Error executing dynamic page script:', e);
        }
      });
    },

    checkUrlParams: function () {
      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'website') {
        this.toggleWebsitePreview(true);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      AdminShell.init();
    });
  } else {
    AdminShell.init();
  }

  window.AdminShell = AdminShell;
})();
