const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const DEBUG_PORT = 9265;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_access_guard');
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

async function runVerificationSuite() {
  console.log('========================================================================');
  console.log('  COOKMATE: ACCESS GUARD, SESSION ISOLATION & SIDEBAR OVERFLOW SUITE     ');
  console.log('========================================================================\n');

  const userDataDir = 'C:\\temp\\chrome_guard_' + Date.now();
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${userDataDir}`
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

    const evalJs = async (exp) => {
      const r = await send('Runtime.evaluate', { expression: exp, returnByValue: true });
      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception ? r.exceptionDetails.exception.description : ''));
      }
      return r.result ? r.result.value : undefined;
    };

    const screenshot = async (filename) => {
      const data = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(SCREENSHOT_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(data.data, 'base64'));
      return filePath;
    };

    const close = async () => {
      try {
        await send('Page.close');
        ws.close();
      } catch (e) {}
    };

    return { ws, send, evalJs, screenshot, close, target };
  }

  try {
    // =========================================================================
    // PHẦN A - NHÓM A: KHÁCH CHƯA ĐĂNG NHẬP (GUEST ACCESS GUARD)
    // =========================================================================
    console.log('\n--- TEST GROUP A: KHÁCH CHƯA ĐĂNG NHẬP TRUY CẬP TRỰC TIẾP URL ADMIN ---');
    const guestPage = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(600);
    // Xóa toàn bộ session
    await guestPage.evalJs(`localStorage.clear(); sessionStorage.clear();`);

    // A1: Khách truy cập trực tiếp pages/admin/index.html
    await guestPage.evalJs(`window.location.href = 'http://127.0.0.1:8089/pages/admin/index.html';`);
    let guestRedirectUrl = '';
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      guestRedirectUrl = await guestPage.evalJs(`window.location.href`);
      if (guestRedirectUrl.includes('login.html')) break;
    }
    assert(guestRedirectUrl.includes('login.html'), `Khách truy cập admin/index.html bị chặn và chuyển sang login (URL: ${guestRedirectUrl})`);
    assert(guestRedirectUrl.includes('redirect='), `URL login chứa tham số redirect bảo lưu đường dẫn đích`);

    // A2: Khách truy cập trực tiếp pages/admin/approve-recipes.html
    await guestPage.evalJs(`window.location.href = 'http://127.0.0.1:8089/pages/admin/approve-recipes.html';`);
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      guestRedirectUrl = await guestPage.evalJs(`window.location.href`);
      if (guestRedirectUrl.includes('login.html')) break;
    }
    assert(guestRedirectUrl.includes('login.html'), `Khách truy cập admin/approve-recipes.html bị chặn tức thì`);

    // A3: Khách truy cập trực tiếp pages/admin/recipes.html
    await guestPage.evalJs(`window.location.href = 'http://127.0.0.1:8089/pages/admin/recipes.html';`);
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      guestRedirectUrl = await guestPage.evalJs(`window.location.href`);
      if (guestRedirectUrl.includes('login.html')) break;
    }
    assert(guestRedirectUrl.includes('login.html'), `Khách truy cập admin/recipes.html bị chặn tức thì`);

    // A4: Khách truy cập trực tiếp pages/admin/ingredients.html
    await guestPage.evalJs(`window.location.href = 'http://127.0.0.1:8089/pages/admin/ingredients.html';`);
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      guestRedirectUrl = await guestPage.evalJs(`window.location.href`);
      if (guestRedirectUrl.includes('login.html')) break;
    }
    assert(guestRedirectUrl.includes('login.html'), `Khách truy cập admin/ingredients.html bị chặn tức thì`);

    await guestPage.screenshot('01_guest_blocked_redirect_login.png');
    await guestPage.close();

    // =========================================================================
    // PHẦN A - NHÓM B: THÀNH VIÊN (MEMBER) TRUY CẬP TRỰC TIẾP URL ADMIN
    // =========================================================================
    console.log('\n--- TEST GROUP B: THÀNH VIÊN (MEMBER) TRUY CẬP TRỰC TIẾP URL ADMIN ---');
    const memberPage = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(600);
    // Đăng nhập Member thường
    await memberPage.evalJs(`
      localStorage.setItem('cookmate_current_user', JSON.stringify({
        id: 'user_member_01',
        name: 'Giang Member',
        email: 'giang@cookmate.vn',
        role: 'member'
      }));
      localStorage.removeItem('cookmate_admin_session');
    `);

    // B1: Member truy cập pages/admin/index.html
    await memberPage.evalJs(`window.location.href = 'http://127.0.0.1:8089/pages/admin/index.html';`);
    let memberRedirectUrl = '';
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      memberRedirectUrl = await memberPage.evalJs(`window.location.href`);
      if (!memberRedirectUrl.includes('/admin/')) break;
    }
    assert(!memberRedirectUrl.includes('/admin/'), `Member bị từ chối truy cập admin/index.html (URL đích: ${memberRedirectUrl})`);
    assert(memberRedirectUrl.includes('index.html') && !memberRedirectUrl.includes('login.html'), `Member được chuyển về trang User hợp lệ (index.html), KHÔNG bị đẩy vào vòng lặp login`);

    // B2: Member truy cập pages/admin/approve-recipes.html
    await memberPage.evalJs(`window.location.href = 'http://127.0.0.1:8089/pages/admin/approve-recipes.html';`);
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      memberRedirectUrl = await memberPage.evalJs(`window.location.href`);
      if (!memberRedirectUrl.includes('/admin/')) break;
    }
    assert(!memberRedirectUrl.includes('/admin/'), `Member bị từ chối truy cập admin/approve-recipes.html`);

    // B3: Member truy cập pages/admin/accounts.html, categories.html, ingredients.html
    await memberPage.evalJs(`window.location.href = 'http://127.0.0.1:8089/pages/admin/accounts.html';`);
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      memberRedirectUrl = await memberPage.evalJs(`window.location.href`);
      if (!memberRedirectUrl.includes('/admin/')) break;
    }
    assert(!memberRedirectUrl.includes('/admin/'), `Member bị từ chối truy cập admin/accounts.html`);

    // B4: Xác nhận phiên Member vẫn hoạt động bình thường trên các trang User
    await memberPage.evalJs(`window.location.href = 'http://127.0.0.1:8089/pages/account/my-recipes.html';`);
    await sleep(600);
    const memberSessionStatus = await memberPage.evalJs(`
      (function() {
        var user = CookMateStorage.getCurrentUser();
        return {
          isLoggedIn: CookMateStorage.isLoggedIn(),
          role: user ? user.role : null,
          title: document.title
        };
      })()
    `);
    assert(memberSessionStatus.isLoggedIn && memberSessionStatus.role === 'member', 'Phiên Member được duy trì ổn định, truy cập bình thường các chức năng cá nhân');

    await memberPage.screenshot('02_member_retained_user_page.png');
    await memberPage.close();

    // =========================================================================
    // PHẦN A - NHÓM C: QUẢN TRỊ VIÊN (ADMIN) VÀ BẢO VỆ ĐĂNG XUẤT / BFCACHE
    // =========================================================================
    console.log('\n--- TEST GROUP C: QUẢN TRỊ VIÊN (ADMIN), ĐĂNG XUẤT VÀ CHỐNG BFCACHE ---');
    const adminPage = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(600);

    // C1: Đăng nhập Admin hợp lệ
    await adminPage.evalJs(`
      CookMateStorage.setCurrentUser({
        id: 'user_admin_01',
        name: 'Quản trị viên CookMate',
        email: 'admin@cookmate.vn',
        role: 'admin'
      });
      window.location.href = 'http://127.0.0.1:8089/pages/admin/index.html';
    `);
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      const u = await adminPage.evalJs(`window.location.href`);
      if (u.includes('admin/index.html')) break;
    }

    const adminAccessCheck = await adminPage.evalJs(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        var main = document.querySelector('.admin-main');
        var adminSess = CookMateStorage.getAdminSession();
        return {
          hasSidebar: !!sidebar,
          hasMain: !!main,
          adminValid: CookMateStorage.isAdminSessionValid(),
          role: adminSess ? adminSess.role : null
        };
      })()
    `);
    assert(adminAccessCheck.hasSidebar && adminAccessCheck.adminValid, 'Admin truy cập thành công Dashboard và Sidebar đầy đủ');

    // C2: Chuyển trang quản trị không yêu cầu đăng nhập lại
    await adminPage.evalJs(`
      var linkApprove = document.querySelector('.admin-sidebar__link[href*="approve-recipes.html"]');
      if (linkApprove) linkApprove.click();
    `);
    await sleep(600);
    const navApproveCheck = await adminPage.evalJs(`
      (function() {
        return {
          url: window.location.href,
          hasQueueTable: !!document.getElementById('pendingApprovalTable') || !!document.querySelector('.admin-content'),
          adminValid: CookMateStorage.isAdminSessionValid()
        };
      })()
    `);
    assert(navApproveCheck.url.includes('approve-recipes.html') && navApproveCheck.adminValid, 'Chuyển sang Duyệt công thức mượt mà, giữ nguyên phiên Admin');

    // C3: Đăng xuất từ Admin Shell
    await adminPage.evalJs(`handleAdminLogout();`);
    let afterLogoutUrl = '';
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      afterLogoutUrl = await adminPage.evalJs(`window.location.href`);
      if (afterLogoutUrl.includes('index.html') && !afterLogoutUrl.includes('/admin/')) break;
    }
    assert(afterLogoutUrl.includes('index.html') && !afterLogoutUrl.includes('/admin/'), `Đăng xuất đưa người dùng về trang chủ (URL: ${afterLogoutUrl})`);

    // C4: Sau đăng xuất, phiên Admin và User đều bị vô hiệu hóa
    const afterLogoutSession = await adminPage.evalJs(`
      (function() {
        return {
          user: CookMateStorage.getCurrentUser(),
          adminSession: CookMateStorage.getAdminSession(),
          isAdminValid: CookMateStorage.isAdminSessionValid()
        };
      })()
    `);
    assert(!afterLogoutSession.user && !afterLogoutSession.isAdminValid, 'Cả cookmate_current_user và cookmate_admin_session đều bị xóa sạch sau khi đăng xuất');

    // C5: Thử truy cập lại URL Admin sau khi đăng xuất -> Bị chặn
    await adminPage.evalJs(`window.location.href = 'http://127.0.0.1:8089/pages/admin/index.html';`);
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      const u = await adminPage.evalJs(`window.location.href`);
      if (u.includes('login.html')) break;
    }
    const blockedAfterLogout = await adminPage.evalJs(`window.location.href`);
    assert(blockedAfterLogout.includes('login.html'), 'Sau khi đăng xuất, mở lại URL Admin lập tức bị chặn');

    await adminPage.close();

    // =========================================================================
    // PHẦN A - NHÓM D: TÁCH BIỆT PHIÊN ADMIN VÀ WEBSITE PREVIEW BÊN PHẢI
    // =========================================================================
    console.log('\n--- TEST GROUP D: TÁCH BIỆT PHIÊN ADMIN SHELL VÀ WEBSITE PREVIEW BÊN PHẢI ---');
    const shellPage = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(600);

    // D1: Đăng nhập Admin và mở Website Preview
    await shellPage.evalJs(`
      CookMateStorage.setCurrentUser({
        id: 'user_admin_01',
        name: 'Quản trị viên CookMate',
        email: 'admin@cookmate.vn',
        role: 'admin'
      });
      window.location.href = 'http://127.0.0.1:8089/pages/admin/index.html';
    `);
    await sleep(1000);
    await shellPage.evalJs(`document.getElementById('btnViewWebsite').click();`);
    await sleep(800);

    const iframeExists = await shellPage.evalJs(`
      (function() {
        var iframe = document.getElementById('adminWebsitePreviewFrame');
        return {
          hasIframe: !!iframe,
          outerAdminValid: CookMateStorage.isAdminSessionValid()
        };
      })()
    `);
    assert(iframeExists.hasIframe, 'Iframe xem website nhúng trực tiếp trong shell');
    assert(iframeExists.outerAdminValid, 'Admin Shell bên ngoài giữ vững phiên Admin');

    // D2: Thao tác đăng xuất bên trong iframe không làm mất phiên Admin shell bên ngoài
    await shellPage.evalJs(`
      (function() {
        var iframe = document.getElementById('adminWebsitePreviewFrame');
        if (iframe && iframe.contentWindow && iframe.contentWindow.handleLogout) {
          iframe.contentWindow.handleLogout();
        }
      })()
    `);
    await sleep(600);

    const afterIframeLogout = await shellPage.evalJs(`
      (function() {
        var iframe = document.getElementById('adminWebsitePreviewFrame');
        var innerUser = iframe && iframe.contentWindow && iframe.contentWindow.CookMateStorage ? iframe.contentWindow.CookMateStorage.getCurrentUser() : null;
        return {
          outerAdminValid: CookMateStorage.isAdminSessionValid(),
          outerAdminSess: CookMateStorage.getAdminSession(),
          innerUser: innerUser
        };
      })()
    `);
    assert(afterIframeLogout.outerAdminValid === true, 'Đăng xuất trong website preview KHÔNG làm mất phiên Admin Shell bên ngoài');

    // D3: Đăng xuất từ Admin Shell bên ngoài -> Vô hiệu hóa toàn bộ phiên
    await shellPage.evalJs(`handleAdminLogout();`);
    await sleep(600);
    const finalShellLogout = await shellPage.evalJs(`
      (function() {
        return {
          outerAdminValid: CookMateStorage.isAdminSessionValid()
        };
      })()
    `);
    assert(finalShellLogout.outerAdminValid === false, 'Đăng xuất từ Admin Shell bên ngoài vô hiệu hóa 100% phiên quản trị');

    await shellPage.close();

    // =========================================================================
    // PHẦN B: KIỂM THỬ SIDEBAR SCROLLBAR, OVERFLOW & RESPONSIVE
    // =========================================================================
    console.log('\n--- TEST GROUP E: KIỂM THỬ THANH CUỘN SIDEBAR (SCROLLWIDTH = CLIENTWIDTH) ---');
    const sbPage = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(600);

    await sbPage.evalJs(`
      CookMateStorage.setCurrentUser({
        id: 'user_admin_01',
        name: 'Quản trị viên CookMate',
        email: 'admin@cookmate.vn',
        role: 'admin'
      });
      window.location.href = 'http://127.0.0.1:8089/pages/admin/index.html';
    `);
    await sleep(1000);

    // E1: Đo đạc chính xác scrollWidth và clientWidth của Sidebar trên Desktop (1366x768)
    const sbMetricsDesktop = await sbPage.evalJs(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        if (!sidebar) return { error: 'No sidebar' };
        var cs = getComputedStyle(sidebar);
        var sRect = sidebar.getBoundingClientRect();
        var all = sidebar.querySelectorAll('*');
        var overflowing = [];
        all.forEach(function(el) {
          var r = el.getBoundingClientRect();
          if (r.right - sRect.right > 0.5 || el.scrollWidth > sidebar.clientWidth) {
            overflowing.push({ tag: el.tagName, className: el.className, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });
          }
        });
        return {
          clientWidth: sidebar.clientWidth,
          scrollWidth: sidebar.scrollWidth,
          hasHScroll: sidebar.scrollWidth > sidebar.clientWidth,
          overflowX: cs.overflowX,
          overflowY: cs.overflowY,
          overflowingCount: overflowing.length,
          overflowing: overflowing
        };
      })()
    `);
    assert(!sbMetricsDesktop.hasHScroll, `Desktop 1366x768: Sidebar không có thanh cuộn ngang (clientWidth: ${sbMetricsDesktop.clientWidth}px, scrollWidth: ${sbMetricsDesktop.scrollWidth}px)`);
    assert(sbMetricsDesktop.overflowingCount === 0, `Desktop 1366x768: 0 phần tử con bị tràn ra khỏi sidebar (Thực tế: ${sbMetricsDesktop.overflowingCount})`);

    // E2: Kiểm tra khả năng cuộn dọc tới mục cuối cùng khi màn hình thấp (Chiều cao 500px)
    await sbPage.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 500, deviceScaleFactor: 1, mobile: false });
    await sleep(300);

    const scrollVerticalCheck = await sbPage.evalJs(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        sidebar.scrollTop = 500;
        var logoutBtn = sidebar.querySelector('button[onclick*="handleLogout"], button.text-danger');
        var footer = sidebar.querySelector('.admin-sidebar__footer');
        var logoutRect = logoutBtn ? logoutBtn.getBoundingClientRect() : null;
        var footerRect = footer ? footer.getBoundingClientRect() : null;
        return {
          scrollTop: sidebar.scrollTop,
          canScrollVertically: sidebar.scrollTop > 0,
          scrollHeight: sidebar.scrollHeight,
          clientHeight: sidebar.clientHeight,
          logoutReachable: logoutRect ? (logoutRect.top >= 0 && logoutRect.bottom <= window.innerHeight + 10) : false,
          footerReachable: footerRect ? (footerRect.top >= 0 && footerRect.bottom <= window.innerHeight + 10) : false
        };
      })()
    `);
    assert(scrollVerticalCheck.canScrollVertically, `Sidebar cuộn dọc mượt mà khi menu dài hơn màn hình (scrollTop: ${scrollVerticalCheck.scrollTop}px)`);
    assert(scrollVerticalCheck.logoutReachable && scrollVerticalCheck.footerReachable, 'Mục cuối cùng (Đăng xuất & User Footer) hoàn toàn có thể cuộn tới và bấm được');

    // E3: Kiểm tra chuyển đổi Hamburger / X
    await sbPage.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
    await sleep(300);

    // Bấm đóng sidebar
    await sbPage.evalJs(`document.getElementById('sidebarToggleBtn').click();`);
    await sleep(400);
    const sbClosedCheck = await sbPage.evalJs(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        var btn = document.getElementById('sidebarToggleBtn');
        var icon = btn ? btn.querySelector('i') : null;
        return {
          sidebarWidth: sidebar.getBoundingClientRect().width,
          isBars: icon ? icon.className.includes('fa-bars') : false
        };
      })()
    `);
    assert(sbClosedCheck.sidebarWidth === 0 && sbClosedCheck.isBars, 'Khi đóng Sidebar: ẩn gọn 0px, icon chuyển sang 3 gạch hamburger');

    // Bấm mở lại sidebar
    await sbPage.evalJs(`document.getElementById('sidebarToggleBtn').click();`);
    await sleep(400);
    const sbReopenedCheck = await sbPage.evalJs(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        var btn = document.getElementById('sidebarToggleBtn');
        var icon = btn ? btn.querySelector('i') : null;
        return {
          sidebarWidth: sidebar.getBoundingClientRect().width,
          isXmark: icon ? icon.className.includes('fa-xmark') : false,
          hasHScroll: sidebar.scrollWidth > sidebar.clientWidth
        };
      })()
    `);
    assert(sbReopenedCheck.sidebarWidth >= 240 && sbReopenedCheck.isXmark, 'Khi mở lại: chiều rộng đầy đủ 260px, icon trở về dấu X');
    assert(!sbReopenedCheck.hasHScroll, 'Sau khi mở lại: không xuất hiện thanh cuộn ngang');

    await sbPage.screenshot('03_sidebar_desktop_clean_scrollbar.png');
    await sbPage.close();

    // =========================================================================
    // PHẦN B: KIỂM THỬ TRÊN 8 KÍCH THƯỚC VIEWPORT (ZERO OVERFLOW)
    // =========================================================================
    console.log('\n--- TEST GROUP F: KIỂM THỬ SIDEBAR TRÊN 8 KÍCH THƯỚC (360px - 1920px) ---');
    const viewports = [
      { name: '360x800 (Galaxy S20)', width: 360, height: 800 },
      { name: '390x844 (iPhone 12/13/14)', width: 390, height: 844 },
      { name: '430x932 (iPhone 15 Pro Max)', width: 430, height: 932 },
      { name: '768x1024 (iPad Portrait)', width: 768, height: 1024 },
      { name: '1024x768 (iPad Landscape)', width: 1024, height: 768 },
      { name: '1366x768 (Laptop HD)', width: 1366, height: 768 },
      { name: '1440x900 (MacBook)', width: 1440, height: 900 },
      { name: '1920x1080 (Desktop FHD)', width: 1920, height: 1080 }
    ];

    for (let i = 0; i < viewports.length; i++) {
      const vp = viewports[i];
      const p = await createPage('http://127.0.0.1:8089/pages/auth/login.html', vp);
      await sleep(400);

      await p.evalJs(`
        CookMateStorage.setCurrentUser({
          id: 'user_admin_01',
          name: 'Quản trị viên CookMate',
          email: 'admin@cookmate.vn',
          role: 'admin'
        });
        window.location.href = 'http://127.0.0.1:8089/pages/admin/index.html';
      `);
      await sleep(800);

      // Nếu trên mobile: mở drawer để kiểm tra
      if (vp.width < 1024) {
        await p.evalJs(`
          var toggle = document.getElementById('sidebarToggleBtn');
          if (toggle) toggle.click();
        `);
        await sleep(300);
      }

      const overflowResult = await p.evalJs(`
        (function() {
          var sidebar = document.getElementById('adminSidebar');
          var docScrollW = document.documentElement.scrollWidth;
          var winW = window.innerWidth;
          var sbHasHScroll = sidebar ? sidebar.scrollWidth > sidebar.clientWidth : false;
          return {
            pageHasHScroll: docScrollW > winW + 1,
            sbHasHScroll: sbHasHScroll,
            sbClientWidth: sidebar ? sidebar.clientWidth : 0,
            sbScrollWidth: sidebar ? sidebar.scrollWidth : 0
          };
        })()
      `);

      assert(!overflowResult.pageHasHScroll, `Viewport ${vp.name}: Không có cuộn ngang toàn trang (0% Page Horizontal Overflow)`);
      assert(!overflowResult.sbHasHScroll, `Viewport ${vp.name}: Sidebar không có thanh cuộn ngang đáy (scrollWidth: ${overflowResult.sbScrollWidth}px, clientWidth: ${overflowResult.sbClientWidth}px)`);

      if (i === 0 || i === 3 || i === 5) {
        await p.screenshot(`vp_${vp.width}x${vp.height}_verified.png`);
      }
      await p.close();
    }

    // =========================================================================
    // TỔNG KẾT BÁO CÁO
    // =========================================================================
    console.log('\n========================================================================');
    console.log(`  KẾT QUẢ KIỂM THỬ: ${passCount} PASSED / ${failCount} FAILED (TỔNG: ${testIndex} TESTS)`);
    console.log('========================================================================\n');

    if (failCount === 0) {
      console.log('>>> HOÀN HẢO! TOÀN BỘ CÁC MỤC KIỂM THỬ ĐÃ ĐẠT 100% YÊU CẦU! <<<\n');
    }

  } catch (err) {
    console.error('Lỗi trong kịch bản kiểm thử:', err);
  } finally {
    try {
      chrome.kill('SIGTERM');
    } catch (e) {}
  }
}

runVerificationSuite();
