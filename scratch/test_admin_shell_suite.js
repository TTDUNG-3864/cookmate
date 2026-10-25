const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const DEBUG_PORT = 9245;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_admin_shell');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

let testIndex = 0;
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  testIndex++;
  if (condition) {
    passCount++;
    console.log(`  [PASS #${testIndex}] ${message}`);
  } else {
    failCount++;
    console.error(`  [FAIL #${testIndex}] ${message}`);
  }
}

async function runAdminShellSuite() {
  console.log('========================================================================');
  console.log('  COOKMATE: VERIFICATION SUITE - ADMIN SHELL, IN-PLACE PREVIEW & FOOTER  ');
  console.log('========================================================================\n');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\temp\\chrome_admin_shell_' + Date.now()
  ], { stdio: 'ignore' });

  await sleep(1500);

  async function createPage(url, viewport = { width: 1366, height: 768 }) {
    const target = await new Promise((resolve, reject) => {
      const req = http.request({
        host: '127.0.0.1',
        port: DEBUG_PORT,
        path: `/json/new?${encodeURIComponent(url)}`,
        method: 'PUT'
      }, res => {
        let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
      });
      req.on('error', reject);
      req.end();
    });

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.width < 768
    });

    const page = {
      ws,
      send,
      target,
      evaluate: async (fnStr) => {
        const res = await send('Runtime.evaluate', {
          expression: fnStr,
          returnByValue: true,
          awaitPromise: true
        });
        if (res.exceptionDetails) {
          throw new Error('Evaluation error: ' + JSON.stringify(res.exceptionDetails));
        }
        return res.result ? res.result.value : undefined;
      },
      screenshot: async (filename) => {
        const data = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(SCREENSHOT_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(data.data, 'base64'));
        console.log(`    -> Screenshot saved: ${filename}`);
      },
      navigate: async (newUrl) => {
        await send('Page.navigate', { url: newUrl });
        await sleep(600);
      },
      setViewport: async (w, h, isMobile = false) => {
        await send('Emulation.setDeviceMetricsOverride', {
          width: w,
          height: h,
          deviceScaleFactor: 1,
          mobile: isMobile
        });
        await sleep(300);
      },
      close: async () => {
        try { ws.close(); } catch(e){}
        await new Promise((res) => {
          const req = http.request({
            host: '127.0.0.1',
            port: DEBUG_PORT,
            path: `/json/close/${target.id}`,
            method: 'GET'
          }, () => res());
          req.on('error', () => res());
          req.end();
        });
      }
    };

    await sleep(700);
    return page;
  }

  try {
    // =========================================================================
    // TEST GROUP 1: SIDEBAR STRUCTURE & "XEM WEBSITE COOKMATE" POSITION
    // =========================================================================
    console.log('--- TEST GROUP 1: SIDEBAR STRUCTURE & "XEM WEBSITE" POSITION ---');

    let page = await createPage('http://127.0.0.1:8089/pages/auth/login.html');

    // Đăng nhập Admin
    await page.evaluate(`(function() {
      document.getElementById('loginEmail').value = 'admin@cookmate.vn';
      document.getElementById('loginPassword').value = 'admin123';
      document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    })()`);
    await sleep(700);

    const currentUrl = await page.evaluate(`window.location.href`);
    assert(currentUrl.indexOf('pages/admin') !== -1, 'Tài khoản Admin đăng nhập thành công vào trang Quản trị: ' + currentUrl);
    await page.screenshot('01_admin_loaded.png');

    // Kiểm tra vị trí của nút "Xem website CookMate" ở đầu Sidebar
    const websiteBtnInfo = await page.evaluate(`(function() {
      var nav = document.querySelector('.admin-sidebar__nav');
      if (!nav) return { exists: false };
      var firstTopAction = nav.querySelector('.admin-sidebar__top-action');
      var btn = document.getElementById('btnViewWebsite');
      var isFirst = firstTopAction && firstTopAction === nav.firstElementChild;
      var hasIcon = btn ? !!btn.querySelector('i.fa-globe') : false;
      var text = btn ? btn.querySelector('span').textContent.trim() : '';
      var tooltip = btn ? btn.getAttribute('data-tooltip') : '';
      var divider = nav.querySelector('.admin-sidebar__divider');

      // Đếm số lượng link "Xem website" trong sidebar (phải chính xác là 1, không có bản sao cũ)
      var links = nav.querySelectorAll('.admin-sidebar__link');
      var count = 0;
      links.forEach(function(l) {
        if (l.textContent.indexOf('Xem website') !== -1) count++;
      });

      return {
        exists: !!btn,
        isAtTop: isFirst,
        hasIcon: hasIcon,
        text: text,
        tooltip: tooltip,
        hasDivider: !!divider,
        count: count
      };
    })()`);

    assert(websiteBtnInfo.exists, 'Nút "Xem website CookMate" (#btnViewWebsite) tồn tại trong Sidebar Admin');
    assert(websiteBtnInfo.isAtTop, 'Nút "Xem website CookMate" nằm ở vị trí đầu tiên của sidebar nav (dưới header, trước các nhóm)');
    assert(websiteBtnInfo.hasIcon && websiteBtnInfo.text === 'Xem website CookMate', 'Nút có icon quả cầu (fa-globe) và nhãn chuẩn "Xem website CookMate"');
    assert(websiteBtnInfo.tooltip === 'Xem website CookMate', 'Nút có thuộc tính data-tooltip="Xem website CookMate" cho chế độ thu gọn');
    assert(websiteBtnInfo.hasDivider, 'Có đường phân cách nhẹ (.admin-sidebar__divider) ngăn cách với nhóm Hệ thống');
    assert(websiteBtnInfo.count === 1, 'Không có bản sao thừa của nút Xem website ở cuối sidebar (chính xác 1 nút duy nhất)');

    // =========================================================================
    // TEST GROUP 2: DESKTOP HAMBURGER & COLLAPSED ICON RAIL
    // =========================================================================
    console.log('\n--- TEST GROUP 2: DESKTOP HAMBURGER & COLLAPSED ICON RAIL ---');

    // Ban đầu trên Desktop (1366px): Sidebar mở rộng (~260px)
    const initialSidebarWidth = await page.evaluate(`(function() {
      var sidebar = document.getElementById('adminSidebar');
      return sidebar ? sidebar.getBoundingClientRect().width : 0;
    })()`);
    assert(initialSidebarWidth >= 250 && initialSidebarWidth <= 280, `Sidebar mở rộng ban đầu trên Desktop có chiều rộng chuẩn: ${initialSidebarWidth}px`);

    // Bấm nút Hamburger trên Header
    await page.evaluate(`(function() {
      document.getElementById('sidebarToggleBtn').click();
    })()`);
    await sleep(400);

    const collapsedState = await page.evaluate(`(function() {
      var sidebar = document.getElementById('adminSidebar');
      var rect = sidebar ? sidebar.getBoundingClientRect() : { width: 0 };
      var isCollapsedClass = sidebar.classList.contains('collapsed');
      var isDocCollapsed = document.documentElement.classList.contains('sidebar-is-collapsed');
      var sessionState = sessionStorage.getItem('cookmate_sidebar_collapsed');

      // Kiểm tra các phần text bị ẩn
      var titleHidden = window.getComputedStyle(sidebar.querySelector('.admin-sidebar__section-title')).display === 'none';
      var spanHidden = window.getComputedStyle(sidebar.querySelector('.admin-sidebar__link span')).display === 'none';
      var logoTextHidden = window.getComputedStyle(sidebar.querySelector('.admin-sidebar__logo span')).display === 'none';

      return {
        width: rect.width,
        isCollapsedClass: isCollapsedClass,
        isDocCollapsed: isDocCollapsed,
        sessionState: sessionState,
        titleHidden: titleHidden,
        spanHidden: spanHidden,
        logoTextHidden: logoTextHidden
      };
    })()`);

    assert(collapsedState.isCollapsedClass && collapsedState.isDocCollapsed, 'Nhấn Hamburger Desktop: Sidebar và <html> nhận class thu gọn (.collapsed / .sidebar-is-collapsed)');
    assert(collapsedState.width >= 60 && collapsedState.width <= 85, `Chiều rộng Sidebar thu gọn thành Icon Rail hẹp: ${collapsedState.width}px`);
    assert(collapsedState.titleHidden && collapsedState.spanHidden && collapsedState.logoTextHidden, 'Các tiêu đề nhóm, chữ menu và logo text được ẩn gọn gàng trong chế độ Icon Rail');
    assert(collapsedState.sessionState === 'true', 'Trạng thái thu gọn được lưu vào sessionStorage: cookmate_sidebar_collapsed="true"');
    await page.screenshot('02_sidebar_collapsed_desktop.png');

    // Bấm Hamburger lần nữa để mở rộng trở lại
    await page.evaluate(`(function() {
      document.getElementById('sidebarToggleBtn').click();
    })()`);
    await sleep(400);

    const expandedState = await page.evaluate(`(function() {
      var sidebar = document.getElementById('adminSidebar');
      var rect = sidebar ? sidebar.getBoundingClientRect() : { width: 0 };
      var isCollapsedClass = sidebar.classList.contains('collapsed');
      var sessionState = sessionStorage.getItem('cookmate_sidebar_collapsed');
      return {
        width: rect.width,
        isCollapsedClass: isCollapsedClass,
        sessionState: sessionState
      };
    })()`);

    assert(!expandedState.isCollapsedClass && expandedState.width >= 250, `Nhấn Hamburger lần 2: Sidebar mở rộng về kích thước ban đầu: ${expandedState.width}px`);
    assert(expandedState.sessionState === 'false', 'sessionStorage cập nhật trạng thái mở rộng: cookmate_sidebar_collapsed="false"');
    await page.screenshot('03_sidebar_expanded_desktop.png');

    // =========================================================================
    // TEST GROUP 3: IN-PLACE WEBSITE PREVIEW (XEM WEBSITE COOKMATE TẠI CHỖ)
    // =========================================================================
    console.log('\n--- TEST GROUP 3: IN-PLACE WEBSITE PREVIEW (XEM WEBSITE COOKMATE TẠI CHỖ) ---');

    // Bấm "Xem website CookMate" ở đầu Sidebar
    await page.evaluate(`(function() {
      document.getElementById('btnViewWebsite').click();
    })()`);
    await sleep(600);

    const previewState = await page.evaluate(`(function() {
      var preview = document.getElementById('adminWebsitePreview');
      var mainContent = document.querySelector('.admin-content');
      var sidebar = document.getElementById('adminSidebar');
      var viewBtn = document.getElementById('btnViewWebsite');
      var frame = document.getElementById('adminWebsitePreviewFrame');
      var homeBtn = document.getElementById('adminPreviewHomeBtn');
      var reloadBtn = document.getElementById('adminPreviewReloadBtn');
      var closeBtn = document.getElementById('adminPreviewCloseBtn');
      var headerTitle = document.querySelector('.admin-header__title');

      return {
        url: window.location.href,
        previewExists: !!preview,
        previewVisible: preview ? window.getComputedStyle(preview).display === 'flex' : false,
        mainContentHidden: mainContent ? window.getComputedStyle(mainContent).display === 'none' : false,
        sidebarExists: !!sidebar,
        sidebarVisible: sidebar ? window.getComputedStyle(sidebar).display !== 'none' : false,
        btnActive: viewBtn ? viewBtn.classList.contains('active') : false,
        frameSrc: frame ? frame.getAttribute('src') : '',
        hasToolbarActions: !!(homeBtn && reloadBtn && closeBtn),
        headerTitleText: headerTitle ? headerTitle.textContent : ''
      };
    })()`);

    assert(previewState.url.indexOf('pages/admin') !== -1, 'Bấm "Xem website": Không chuyển hướng ra ngoài, URL vẫn ở trong Admin Shell: ' + previewState.url);
    assert(previewState.previewExists && previewState.previewVisible, 'Vùng xem website CookMate tại chỗ (#adminWebsitePreview) hiển thị dạng flex');
    assert(previewState.mainContentHidden, 'Nội dung dashboard/quản trị (.admin-content) được ẩn đi nhường chỗ cho website');
    assert(previewState.sidebarExists && previewState.sidebarVisible, 'Sidebar Admin bên trái vẫn giữ nguyên cố định trong toàn bộ trải nghiệm');
    assert(previewState.btnActive, 'Mục "Xem website CookMate" trên Sidebar được đánh dấu active');
    assert(previewState.frameSrc === '../../index.html', 'Iframe #adminWebsitePreviewFrame tải trang chủ website CookMate (../../index.html)');
    assert(previewState.hasToolbarActions, 'Thanh công cụ xem trước có đầy đủ nút: Trang chủ, Tải lại, Tab riêng và Quay lại Quản trị');
    assert(previewState.headerTitleText.indexOf('Xem website CookMate') !== -1, 'Tiêu đề Admin Header cập nhật trạng thái xem trực tiếp');
    await page.screenshot('04_inplace_website_preview.png');

    // Bấm nút "Quay lại Quản trị"
    await page.evaluate(`(function() {
      document.getElementById('adminPreviewCloseBtn').click();
    })()`);
    await sleep(400);

    const closedPreviewState = await page.evaluate(`(function() {
      var preview = document.getElementById('adminWebsitePreview');
      var mainContent = document.querySelector('.admin-content');
      var viewBtn = document.getElementById('btnViewWebsite');
      var activeLink = document.querySelector('.admin-sidebar__link.active');

      return {
        previewHidden: preview ? window.getComputedStyle(preview).display === 'none' : true,
        mainContentVisible: mainContent ? window.getComputedStyle(mainContent).display !== 'none' : false,
        btnNotActive: viewBtn ? !viewBtn.classList.contains('active') : true,
        activeLinkText: activeLink ? activeLink.textContent.trim() : ''
      };
    })()`);

    assert(closedPreviewState.previewHidden && closedPreviewState.mainContentVisible, 'Bấm "Quay lại Quản trị": Ẩn khung preview, khôi phục nội dung quản trị (.admin-content)');
    assert(closedPreviewState.btnNotActive && closedPreviewState.activeLinkText.indexOf('Tổng quan') !== -1, 'Khôi phục trạng thái active về mục quản trị ban đầu ("Tổng quan")');
    await page.screenshot('05_restored_admin_content.png');

    // =========================================================================
    // TEST GROUP 4: STATE PERSISTENCE ACROSS ADMIN NAVIGATION (CHỐNG KHỰNG/RESET)
    // =========================================================================
    console.log('\n--- TEST GROUP 4: STATE PERSISTENCE ACROSS ADMIN NAVIGATION ---');

    // 1. Thu gọn sidebar
    await page.evaluate(`(function() {
      document.getElementById('sidebarToggleBtn').click();
    })()`);
    await sleep(300);

    const isCollapsedBefore = await page.evaluate(`sessionStorage.getItem('cookmate_sidebar_collapsed')`);
    assert(isCollapsedBefore === 'true', 'Đã thu gọn sidebar trên trang index.html');

    // 2. Chuyển sang trang "Duyệt công thức" (approve-recipes.html)
    await page.navigate('http://127.0.0.1:8089/pages/admin/approve-recipes.html');

    const approvePageState = await page.evaluate(`(function() {
      var sidebar = document.getElementById('adminSidebar');
      var rect = sidebar ? sidebar.getBoundingClientRect() : { width: 0 };
      var isCollapsed = sidebar.classList.contains('collapsed') || document.documentElement.classList.contains('sidebar-is-collapsed');
      var btn = document.getElementById('btnViewWebsite');
      var activeLink = document.querySelector('.admin-sidebar__link.active');

      return {
        width: rect.width,
        isCollapsed: isCollapsed,
        btnAtTop: !!btn,
        activeText: activeLink ? activeLink.textContent.trim() : ''
      };
    })()`);

    assert(approvePageState.isCollapsed, 'Chuyển sang approve-recipes.html: Trạng thái thu gọn được khôi phục ngay lập tức, không bị reset!');
    assert(approvePageState.width <= 85, `Chiều rộng sidebar vẫn là icon rail: ${approvePageState.width}px`);
    assert(approvePageState.btnAtTop, 'Nút "Xem website CookMate" vẫn ở đầu sidebar trên trang Duyệt công thức');
    assert(approvePageState.activeText.indexOf('Duyệt công thức') !== -1, 'Mục active đánh dấu chính xác "Duyệt công thức"');
    await page.screenshot('06_approve_recipes_collapsed_persisted.png');

    // 3. Chuyển sang trang "Quản lý Nguyên liệu" (ingredients.html)
    await page.navigate('http://127.0.0.1:8089/pages/admin/ingredients.html');

    const ingPageState = await page.evaluate(`(function() {
      var sidebar = document.getElementById('adminSidebar');
      var isCollapsed = sidebar.classList.contains('collapsed') || document.documentElement.classList.contains('sidebar-is-collapsed');
      var activeLink = document.querySelector('.admin-sidebar__link.active');
      return {
        isCollapsed: isCollapsed,
        activeText: activeLink ? activeLink.textContent.trim() : ''
      };
    })()`);
    assert(ingPageState.isCollapsed, 'Chuyển tiếp sang ingredients.html: Trạng thái thu gọn vẫn tiếp tục duy trì xuyên suốt');
    assert(ingPageState.activeText.indexOf('Quản lý Nguyên liệu') !== -1, 'Mục active đánh dấu chính xác "Quản lý Nguyên liệu"');

    // 4. Mở rộng sidebar trở lại
    await page.evaluate(`(function() {
      document.getElementById('sidebarToggleBtn').click();
    })()`);
    await sleep(300);

    // 5. Chuyển sang trang "Quản lý Danh mục" (categories.html)
    await page.navigate('http://127.0.0.1:8089/pages/admin/categories.html');

    const catPageState = await page.evaluate(`(function() {
      var sidebar = document.getElementById('adminSidebar');
      var rect = sidebar ? sidebar.getBoundingClientRect() : { width: 0 };
      var isCollapsed = sidebar.classList.contains('collapsed');
      var activeLink = document.querySelector('.admin-sidebar__link.active');
      return {
        width: rect.width,
        isCollapsed: isCollapsed,
        activeText: activeLink ? activeLink.textContent.trim() : ''
      };
    })()`);
    assert(!catPageState.isCollapsed && catPageState.width >= 250, `Sau khi mở rộng, chuyển sang categories.html giữ nguyên kích thước mở rộng: ${catPageState.width}px`);

    // =========================================================================
    // TEST GROUP 5: MOBILE DRAWER & RESPONSIVE BEHAVIOR
    // =========================================================================
    console.log('\n--- TEST GROUP 5: MOBILE DRAWER & RESPONSIVE BEHAVIOR ---');

    // Chuyển viewport sang Mobile (390x844 - iPhone 14 / Android)
    await page.setViewport(390, 844, true);

    const mobileInitialState = await page.evaluate(`(function() {
      var sidebar = document.getElementById('adminSidebar');
      var rect = sidebar ? sidebar.getBoundingClientRect() : { left: 0 };
      var isActive = sidebar ? sidebar.classList.contains('active') : false;
      return {
        isOffscreen: rect.left < 0,
        isActive: isActive
      };
    })()`);

    assert(mobileInitialState.isOffscreen && !mobileInitialState.isActive, 'Trên Mobile (390px): Sidebar mặc định ẩn ngoài màn hình (chế độ Drawer), không tràn giao diện');

    // Nhấn nút Hamburger trên Mobile
    await page.evaluate(`(function() {
      document.getElementById('sidebarToggleBtn').click();
    })()`);
    await sleep(400);

    const mobileOpenState = await page.evaluate(`(function() {
      var sidebar = document.getElementById('adminSidebar');
      var backdrop = document.getElementById('sidebarBackdrop');
      var sidebarActive = sidebar ? sidebar.classList.contains('active') : false;
      var backdropActive = backdrop ? backdrop.classList.contains('active') : false;
      return {
        sidebarActive: sidebarActive,
        backdropActive: backdropActive
      };
    })()`);

    assert(mobileOpenState.sidebarActive && mobileOpenState.backdropActive, 'Nhấn Hamburger Mobile: Drawer trượt vào màn hình với class .active và có overlay .active');
    await page.screenshot('07_mobile_drawer_open.png');

    // Đóng drawer bằng nút đóng (#sidebarCloseBtn)
    await page.evaluate(`(function() {
      document.getElementById('sidebarCloseBtn').click();
    })()`);
    await sleep(400);

    const mobileClosedState = await page.evaluate(`(function() {
      var sidebar = document.getElementById('adminSidebar');
      var backdrop = document.getElementById('sidebarBackdrop');
      return {
        sidebarClosed: sidebar ? !sidebar.classList.contains('active') : true,
        backdropClosed: backdrop ? !backdrop.classList.contains('active') : true
      };
    })()`);

    assert(mobileClosedState.sidebarClosed && mobileClosedState.backdropClosed, 'Bấm nút X trên Mobile Drawer: Đóng menu và ẩn overlay trơn tru');

    // Kiểm tra tràn ngang trên 3 kích thước Mobile chuẩn
    const mobileSizes = [
      { w: 360, h: 800, name: '360x800' },
      { w: 390, h: 844, name: '390x844' },
      { w: 430, h: 932, name: '430x932' }
    ];

    for (const size of mobileSizes) {
      await page.setViewport(size.w, size.h, true);
      const overflow = await page.evaluate(`(function() {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        };
      })()`);
      assert(overflow.scrollWidth <= overflow.clientWidth, `Admin Shell trên màn hình Mobile ${size.name}: 0% tràn ngang (scrollWidth=${overflow.scrollWidth} <= clientWidth=${overflow.clientWidth})`);
    }

    // =========================================================================
    // TEST GROUP 6: FOOTER REDESIGN & HANOI PHO BRAND VISUAL
    // =========================================================================
    console.log('\n--- TEST GROUP 6: FOOTER REDESIGN & HANOI PHO BRAND VISUAL ---');

    // Chuyển lại Desktop (1366x768) và truy cập Trang chủ User (index.html)
    await page.setViewport(1366, 768, false);
    await page.navigate('http://127.0.0.1:8089/index.html');

    const footerAnalysis = await page.evaluate(`(function() {
      var footer = document.getElementById('siteFooter');
      if (!footer) return { exists: false };

      // 1. Kiểm tra loại bỏ 100% các link tài khoản trùng lặp
      var allLinks = Array.from(footer.querySelectorAll('a')).map(function(a) { return a.textContent.trim().toLowerCase(); });
      var forbiddenTerms = ['đăng nhập', 'đăng ký', 'hồ sơ cá nhân', 'công thức của tôi', 'món yêu thích', 'đăng công thức'];
      var foundForbidden = [];
      forbiddenTerms.forEach(function(term) {
        if (allLinks.some(function(l) { return l === term; })) {
          foundForbidden.push(term);
        }
      });

      // 2. Kiểm tra màu sắc Logo thương hiệu trong footer
      var logoName = footer.querySelector('.logo-name');
      var logoAccent = footer.querySelector('.logo-accent');
      var nameColor = logoName ? window.getComputedStyle(logoName).color : '';
      var accentColor = logoAccent ? window.getComputedStyle(logoAccent).color : '';

      // 3. Kiểm tra các nhóm nội dung
      var headings = Array.from(footer.querySelectorAll('.footer-heading')).map(function(h) { return h.textContent.trim(); });

      // 4. Kiểm tra điểm nhấn minh họa Bát phở Hà Nội (Brand Illustration)
      var phoArt = footer.querySelector('.footer-brand-art');
      var phoImg = footer.querySelector('.footer-pho-img');
      var phoTitle = footer.querySelector('.footer-pho-title');
      var phoImgSrc = phoImg ? phoImg.getAttribute('src') : '';

      return {
        exists: true,
        forbiddenLinks: foundForbidden,
        headings: headings,
        nameColor: nameColor,
        accentColor: accentColor,
        hasPhoArt: !!phoArt,
        hasPhoImg: !!phoImg,
        phoImgSrc: phoImgSrc,
        phoTitle: phoTitle ? phoTitle.textContent.trim() : ''
      };
    })()`);

    assert(footerAnalysis.exists, 'Footer chuẩn (#siteFooter) hiện diện trên trang chủ');
    assert(footerAnalysis.forbiddenLinks.length === 0, 'Loại bỏ 100% các link trùng lặp trong Footer (Không có Đăng nhập, Đăng ký, Hồ sơ, Món yêu thích, Công thức của tôi, Đăng công thức): ' + JSON.stringify(footerAnalysis.forbiddenLinks));
    assert(footerAnalysis.headings.includes('Khám phá') && footerAnalysis.headings.includes('Về CookMate') && footerAnalysis.headings.includes('Thông tin'), 'Footer tổ chức 3 nhóm danh mục rõ ràng: Khám phá, Về CookMate, Thông tin');
    assert(footerAnalysis.hasPhoArt && footerAnalysis.hasPhoImg && footerAnalysis.phoImgSrc.indexOf('hanoi-pho-art.svg') !== -1, 'Có điểm nhấn minh họa Bát phở Hà Nội (.footer-brand-art) với file SVG hanoi-pho-art.svg');
    assert(footerAnalysis.phoTitle.indexOf('Phở Hà Nội') !== -1, 'Minh họa có chú thích chuẩn: "' + footerAnalysis.phoTitle + '"');
    await page.screenshot('08_footer_desktop_pho_visual.png');

    // Kiểm tra trên trang Khám phá (pages/recipes.html)
    await page.navigate('http://127.0.0.1:8089/pages/recipes.html');
    const recipesFooterCheck = await page.evaluate(`(function() {
      var footer = document.getElementById('siteFooter');
      var phoImg = footer ? footer.querySelector('.footer-pho-img') : null;
      return {
        exists: !!footer,
        hasPho: !!phoImg
      };
    })()`);
    assert(recipesFooterCheck.exists && recipesFooterCheck.hasPho, 'Footer mới với Bát phở Hà Nội đồng bộ trên trung tâm Khám phá (pages/recipes.html)');

    // Kiểm tra Footer trên Mobile Viewport (390x844)
    await page.setViewport(390, 844, true);
    const mobileFooterCheck = await page.evaluate(`(function() {
      var footer = document.getElementById('siteFooter');
      var grid = footer.querySelector('.footer-grid');
      var style = window.getComputedStyle(grid);
      var links = footer.querySelectorAll('.footer-links a');
      var overflow = document.documentElement.scrollWidth <= document.documentElement.clientWidth;

      // Kiểm tra các liên kết xuống dòng theo chiều dọc (không bị dính liền ngang)
      var linkDisplays = Array.from(links).map(function(l) { return window.getComputedStyle(l).display; });
      var allBlockOrFlex = linkDisplays.every(function(d) { return d === 'block' || d === 'inline-flex' || d === 'flex'; });

      return {
        display: style.display,
        flexDirection: style.flexDirection,
        noHorizontalScroll: overflow,
        linksVertical: allBlockOrFlex
      };
    })()`);

    assert(mobileFooterCheck.display === 'flex' && mobileFooterCheck.flexDirection === 'column', 'Trên Mobile: Footer chuyển sang bố cục xếp dọc (flex-direction: column)');
    assert(mobileFooterCheck.linksVertical, 'Các liên kết trong footer xuống dòng độc lập theo chiều dọc, không dính liền nhau');
    assert(mobileFooterCheck.noHorizontalScroll, 'Footer Mobile: Hoàn toàn không có thanh cuộn ngang (0% overflow)');
    await page.screenshot('09_footer_mobile_vertical.png');

    // =========================================================================
    // TEST GROUP 7: SECURITY GUARDS & ROLE AUTHENTICATION PRESERVATION
    // =========================================================================
    console.log('\n--- TEST GROUP 7: SECURITY GUARDS & ROLE PRESERVATION ---');

    // Đăng xuất Admin
    await page.evaluate(`handleLogout()`);
    await sleep(500);

    // Khách vãng lai truy cập admin/approve-recipes.html -> Phải bị chặn và đưa về login
    await page.navigate('http://127.0.0.1:8089/pages/admin/approve-recipes.html');
    const guestBlockedUrl = await page.evaluate(`window.location.href`);
    assert(guestBlockedUrl.indexOf('pages/auth/login.html') !== -1, 'Khách chưa đăng nhập truy cập admin/approve-recipes.html bị guard chặn và chuyển về login: ' + guestBlockedUrl);

    // Đăng nhập tài khoản Member (giang@cookmate.vn) -> Vào Trang chủ User
    await page.evaluate(`(function() {
      document.getElementById('loginEmail').value = 'giang@cookmate.vn';
      document.getElementById('loginPassword').value = 'giang123';
      document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    })()`);
    await sleep(600);

    const memberUrl = await page.evaluate(`window.location.href`);
    assert(memberUrl.indexOf('index.html') !== -1 && memberUrl.indexOf('/admin/') === -1, 'Tài khoản Member đăng nhập điều hướng về Trang chủ User, không vào admin');

    // Member cố tình vào admin/index.html -> Phải bị chặn và đẩy ra khỏi admin
    await page.navigate('http://127.0.0.1:8089/pages/admin/index.html');
    const memberBlockedUrl = await page.evaluate(`window.location.href`);
    assert(memberBlockedUrl.indexOf('/admin/') === -1, 'Member vai trò thường truy cập admin bị guard đẩy ra ngoài (không còn trong /admin/): ' + memberBlockedUrl);

    await page.close();

  } catch (err) {
    console.error('Fatal error in suite:', err);
  } finally {
    try {
      chrome.kill();
    } catch(e){}

    console.log('\n========================================================================');
    console.log(`  SUITE EXECUTION FINISHED: ${passCount} PASSED / ${failCount} FAILED (${testIndex} TOTAL)`);
    console.log('========================================================================');

    process.exit(failCount === 0 ? 0 : 1);
  }
}

runAdminShellSuite();
