const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const DEBUG_PORT = 9250;
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

async function runTest() {
  console.log('========================================================================');
  console.log('  COOKMATE: VERIFICATION - ADMIN SHELL, PREVIEW, HAMBURGER & SPA NAV   ');
  console.log('========================================================================\n');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\temp\\chrome_seamless_' + Date.now()
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
      mobile: viewport.width < 1024
    });

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(JSON.stringify(res.exceptionDetails));
      }
      return res.result ? res.result.value : undefined;
    }

    async function screenshot(name) {
      const data = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(SCREENSHOT_DIR, name);
      fs.writeFileSync(filePath, Buffer.from(data.data, 'base64'));
      console.log(`     [Screenshot] ${name}`);
      return filePath;
    }

    return { ws, send, evaluate, screenshot };
  }

  try {
    // -------------------------------------------------------------------------
    // BƯỚC 1: ĐĂNG NHẬP VỚI TÀI KHOẢN ADMIN VÀ TRUY CẬP ADMIN DASHBOARD
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: SETUP ADMIN AUTHENTICATION & LOGIN ---');
    const page = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(800);

    // Set Admin in localStorage
    await page.evaluate(`
      CookMateStorage.setCurrentUser({
        id: 'user_admin_01',
        name: 'Quản trị viên CookMate',
        email: 'admin@cookmate.vn',
        role: 'admin',
        avatar: '../../assets/images/placeholders/user-avatar.svg'
      });
      sessionStorage.removeItem('cookmate_sidebar_closed');
      sessionStorage.removeItem('cookmate_sidebar_collapsed');
      window.location.href = '../admin/index.html';
    `);
    await sleep(1200);

    const currentUrl = await page.evaluate(`window.location.href`);
    assert(currentUrl.includes('pages/admin/index.html'), 'Truy cập thành công vào Admin Dashboard');

    // -------------------------------------------------------------------------
    // BƯỚC 2: KIỂM TRA LỖI B - NÚT HAMBURGER VÀ ĐÓNG/MỞ SIDEBAR
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: KIỂM TRA LỖI B - SINGLE TOGGLE BUTTON & ZERO-WIDTH SIDEBAR ---');
    
    // Kiểm tra số lượng nút toggle trên trang
    const toggleBtnCount = await page.evaluate(`document.querySelectorAll('#sidebarToggleBtn').length`);
    assert(toggleBtnCount === 1, `Duy nhất 1 nút điều khiển #sidebarToggleBtn trên trang (thực tế: ${toggleBtnCount})`);

    // Trạng thái ban đầu: Sidebar đang mở
    const initialStatus = await page.evaluate(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        var btn = document.getElementById('sidebarToggleBtn');
        var icon = btn ? btn.querySelector('i') : null;
        var rect = sidebar ? sidebar.getBoundingClientRect() : {};
        var main = document.querySelector('.admin-main');
        var mainRect = main ? main.getBoundingClientRect() : {};
        return {
          isOpen: btn.getAttribute('aria-expanded') === 'true',
          iconClass: icon ? icon.className : '',
          parentIsHeader: btn.parentElement.classList.contains('admin-sidebar__header'),
          sidebarWidth: Math.round(rect.width),
          mainWidth: Math.round(mainRect.width),
          hasOldCloseBtn: !!document.getElementById('sidebarCloseBtn')
        };
      })()
    `);

    assert(initialStatus.isOpen === true, 'Sidebar ban đầu ở trạng thái MỞ (aria-expanded="true")');
    assert(initialStatus.iconClass.includes('fa-xmark'), `Khi mở, nút toggle hiển thị icon dấu X fa-xmark (thực tế: ${initialStatus.iconClass})`);
    assert(initialStatus.parentIsHeader === true, 'Nút toggle nằm bên trong .admin-sidebar__header');
    assert(initialStatus.sidebarWidth >= 250, `Sidebar hiển thị đủ chiều rộng (thực tế: ${initialStatus.sidebarWidth}px)`);
    assert(initialStatus.hasOldCloseBtn === false, 'Đã loại bỏ hoàn toàn nút #sidebarCloseBtn trùng lặp');

    // Bấm nút đóng Sidebar
    console.log('   -> Bấm nút X để đóng Sidebar...');
    await page.evaluate(`document.getElementById('sidebarToggleBtn').click()`);
    await sleep(600);

    const closedStatus = await page.evaluate(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        var btn = document.getElementById('sidebarToggleBtn');
        var icon = btn ? btn.querySelector('i') : null;
        var rect = sidebar ? sidebar.getBoundingClientRect() : {};
        var main = document.querySelector('.admin-main');
        var mainRect = main ? main.getBoundingClientRect() : {};
        var saved = sessionStorage.getItem('cookmate_sidebar_closed');
        return {
          isClosedAria: btn.getAttribute('aria-expanded') === 'false',
          iconClass: icon ? icon.className : '',
          parentIsAdminHeader: btn.parentElement.classList.contains('admin-header'),
          sidebarWidth: Math.round(rect.width),
          mainWidth: Math.round(mainRect.width),
          savedState: saved
        };
      })()
    `);

    assert(closedStatus.isClosedAria === true, 'Nút toggle cập nhật aria-expanded="false" khi sidebar đóng');
    assert(closedStatus.iconClass.includes('fa-bars'), `Khi đóng, nút toggle đổi sang icon 3 gạch fa-bars (thực tế: ${closedStatus.iconClass})`);
    assert(closedStatus.sidebarWidth === 0, `Sidebar ẩn gọn hoàn toàn 0px, không để lại dải icon 72px (thực tế: ${closedStatus.sidebarWidth}px)`);
    assert(closedStatus.mainWidth >= 1350, `Vùng nội dung bên phải tự động mở rộng 100% full màn hình (thực tế: ${closedStatus.mainWidth}px)`);
    assert(closedStatus.parentIsAdminHeader === true, 'Nút 3 gạch di chuyển ra .admin-header để luôn nhìn thấy và bấm được');
    assert(closedStatus.savedState === 'true', 'Trạng thái đóng được ghi nhớ trong sessionStorage (cookmate_sidebar_closed = "true")');

    await page.screenshot('02_sidebar_closed_full_content.png');

    // Bấm nút mở lại Sidebar
    console.log('   -> Bấm nút 3 gạch để mở lại Sidebar...');
    await page.evaluate(`document.getElementById('sidebarToggleBtn').click()`);
    await sleep(600);

    const reopenedStatus = await page.evaluate(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        var btn = document.getElementById('sidebarToggleBtn');
        var icon = btn ? btn.querySelector('i') : null;
        var rect = sidebar ? sidebar.getBoundingClientRect() : {};
        var saved = sessionStorage.getItem('cookmate_sidebar_closed');
        return {
          isOpen: btn.getAttribute('aria-expanded') === 'true',
          iconClass: icon ? icon.className : '',
          parentIsHeader: btn.parentElement.classList.contains('admin-sidebar__header'),
          sidebarWidth: Math.round(rect.width),
          savedState: saved
        };
      })()
    `);

    assert(reopenedStatus.isOpen === true, 'Sidebar mở lại thành công');
    assert(reopenedStatus.iconClass.includes('fa-xmark'), `Nút toggle chuyển lại dấu X fa-xmark (thực tế: ${reopenedStatus.iconClass})`);
    assert(reopenedStatus.sidebarWidth >= 250, `Sidebar khôi phục chiều rộng bình thường (thực tế: ${reopenedStatus.sidebarWidth}px)`);
    assert(reopenedStatus.savedState === 'false', 'sessionStorage cập nhật cookmate_sidebar_closed = "false"');
    await page.screenshot('03_sidebar_reopened.png');

    // -------------------------------------------------------------------------
    // BƯỚC 3: KIỂM TRA LỖI A - XEM WEBSITE COOKMATE (XÓA 2 THANH DƯ THỪA)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: KIỂM TRA LỖI A - XEM WEBSITE COOKMATE KHÔNG CÓ 2 THANH DƯ THỪA ---');
    
    // Bấm vào nút "Xem website CookMate" ở đầu Sidebar
    console.log('   -> Bấm nút "Xem website CookMate" ở đầu Sidebar...');
    await page.evaluate(`document.getElementById('btnViewWebsite').click()`);
    await sleep(800);

    const previewStatus = await page.evaluate(`
      (function() {
        var preview = document.getElementById('adminWebsitePreview');
        var frame = document.getElementById('adminWebsitePreviewFrame');
        var header = document.querySelector('.admin-header');
        var content = document.querySelector('.admin-content');
        var oldToolbar = document.querySelector('.admin-preview-toolbar');
        var viewBtn = document.getElementById('btnViewWebsite');
        var sidebar = document.getElementById('adminSidebar');
        var sidebarRect = sidebar ? sidebar.getBoundingClientRect() : {};
        var frameRect = frame ? frame.getBoundingClientRect() : {};

        return {
          previewExists: !!preview,
          previewVisible: preview && window.getComputedStyle(preview).display !== 'none',
          frameExists: !!frame,
          frameHeight: Math.round(frameRect.height),
          headerHidden: header && window.getComputedStyle(header).display === 'none',
          contentHidden: content && window.getComputedStyle(content).display === 'none',
          noRedundantToolbar: !oldToolbar,
          viewBtnActive: viewBtn && viewBtn.classList.contains('active'),
          sidebarFixed: sidebar && Math.round(sidebarRect.width) >= 250,
          urlParam: window.location.search
        };
      })()
    `);

    assert(previewStatus.previewVisible === true, 'Khung xem website CookMate được hiển thị');
    assert(previewStatus.headerHidden === true, 'LỖI A ĐÃ SỬA: Thanh tiêu đề Admin Header phía trên đã bị ẨN hoàn toàn (display: none)');
    assert(previewStatus.noRedundantToolbar === true, 'LỖI A ĐÃ SỬA: KHÔNG CÒN thanh toolbar xem trước dư thừa ("Chế độ xem trước website CookMate")');
    assert(previewStatus.frameExists === true && previewStatus.frameHeight >= 700, `Iframe chiếm trọn 100vh chiều cao (thực tế: ${previewStatus.frameHeight}px)`);
    assert(previewStatus.sidebarFixed === true, 'Sidebar Admin bên trái vẫn cố định nguyên vẹn');
    assert(previewStatus.viewBtnActive === true, 'Nút "Xem website CookMate" ở đầu Sidebar được đánh dấu active');
    assert(previewStatus.urlParam.includes('view=website'), `URL cập nhật tham số ?view=website (thực tế: ${previewStatus.urlParam})`);

    await page.screenshot('01_preview_no_bars.png');

    // Test đóng sidebar ngay khi đang xem website
    console.log('   -> Thử đóng sidebar khi đang xem website...');
    await page.evaluate(`document.getElementById('sidebarToggleBtn').click()`);
    await sleep(500);

    const previewSidebarClosed = await page.evaluate(`
      (function() {
        var btn = document.getElementById('sidebarToggleBtn');
        var frame = document.getElementById('adminWebsitePreviewFrame');
        var frameRect = frame ? frame.getBoundingClientRect() : {};
        return {
          btnFloating: btn.classList.contains('admin-sidebar-toggle-btn--floating'),
          btnVisible: window.getComputedStyle(btn).display !== 'none',
          frameWidth: Math.round(frameRect.width)
        };
      })()
    `);
    assert(previewSidebarClosed.btnFloating === true, 'Khi xem website mà đóng sidebar, nút chuyển thành floating cố định ở góc');
    assert(previewSidebarClosed.frameWidth >= 1350, `Iframe website mở rộng full màn hình khi sidebar đóng (thực tế: ${previewSidebarClosed.frameWidth}px)`);

    // Mở lại sidebar
    await page.evaluate(`document.getElementById('sidebarToggleBtn').click()`);
    await sleep(500);

    // -------------------------------------------------------------------------
    // BƯỚC 4: KIỂM TRA LỖI C - ĐIỀU HƯỚNG SPA MƯỢT KHÔNG RELOAD
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: KIỂM TRA LỖI C - SPA IN-PLACE SEAMLESS VIEW SWAPPING ---');
    
    // Gắn biến kiểm tra trên window để xác nhận trang KHÔNG bị full reload
    await page.evaluate(`window.__cookmate_spa_sentinel = 2026;`);

    // 1. Chuyển sang "Duyệt công thức"
    console.log('   -> Chuyển sang "Duyệt công thức"...');
    await page.evaluate(`
      var approveLink = document.querySelector('a[href="approve-recipes.html"]');
      approveLink.click();
    `);
    await sleep(800);

    const approvePageCheck = await page.evaluate(`
      (function() {
        var title = document.querySelector('.admin-header__title');
        var table = document.getElementById('pendingRecipesTable');
        var activeLink = document.querySelector('.admin-sidebar__link.active');
        return {
          sentinelIntact: window.__cookmate_spa_sentinel === 2026,
          pathname: window.location.pathname,
          headerTitle: title ? title.textContent.trim() : '',
          hasTable: !!table,
          activeText: activeLink ? activeLink.textContent.trim() : ''
        };
      })()
    `);

    assert(approvePageCheck.sentinelIntact === true, 'LỖI C ĐÃ SỬA: Trang KHÔNG bị full-reload (window.__cookmate_spa_sentinel được bảo toàn)');
    assert(approvePageCheck.pathname.includes('approve-recipes.html'), `URL cập nhật chính xác: ${approvePageCheck.pathname}`);
    assert(approvePageCheck.headerTitle.includes('Hàng đợi Duyệt công thức'), `Tiêu đề Admin Header cập nhật: "${approvePageCheck.headerTitle}"`);
    assert(approvePageCheck.hasTable === true, 'Bảng hàng đợi duyệt công thức được render nội dung đầy đủ');
    assert(approvePageCheck.activeText.includes('Duyệt công thức'), `Active menu link chuyển đúng: "${approvePageCheck.activeText}"`);

    // 2. Chuyển tiếp sang "Quản lý Danh mục"
    console.log('   -> Chuyển sang "Quản lý Danh mục"...');
    await page.evaluate(`
      var catLink = document.querySelector('a[href="categories.html"]');
      catLink.click();
    `);
    await sleep(800);

    const catPageCheck = await page.evaluate(`
      (function() {
        var title = document.querySelector('.admin-header__title');
        var grid = document.getElementById('categoriesGrid') || document.getElementById('categoriesTable');
        var activeLink = document.querySelector('.admin-sidebar__link.active');
        return {
          sentinelIntact: window.__cookmate_spa_sentinel === 2026,
          pathname: window.location.pathname,
          headerTitle: title ? title.textContent.trim() : '',
          hasGrid: !!grid,
          activeText: activeLink ? activeLink.textContent.trim() : ''
        };
      })()
    `);

    assert(catPageCheck.sentinelIntact === true, 'Chuyển sang Danh mục vẫn giữ nguyên SPA Shell (không reload)');
    assert(catPageCheck.pathname.includes('categories.html'), `URL cập nhật categories.html: ${catPageCheck.pathname}`);
    assert(catPageCheck.headerTitle.includes('Danh mục'), `Tiêu đề Admin Header cập nhật danh mục: "${catPageCheck.headerTitle}"`);

    // 3. Chuyển sang "Quản lý Nguyên liệu"
    console.log('   -> Chuyển sang "Quản lý Nguyên liệu"...');
    await page.evaluate(`
      var ingLink = document.querySelector('a[href="ingredients.html"]');
      ingLink.click();
    `);
    await sleep(800);

    const ingPageCheck = await page.evaluate(`
      (function() {
        var title = document.querySelector('.admin-header__title');
        var table = document.getElementById('ingredientsTable');
        return {
          sentinelIntact: window.__cookmate_spa_sentinel === 2026,
          pathname: window.location.pathname,
          headerTitle: title ? title.textContent.trim() : '',
          hasTable: !!table
        };
      })()
    `);

    assert(ingPageCheck.sentinelIntact === true, 'Chuyển sang Nguyên liệu vẫn giữ nguyên SPA Shell');
    assert(ingPageCheck.pathname.includes('ingredients.html'), `URL cập nhật ingredients.html`);
    assert(ingPageCheck.headerTitle.includes('Nguyên liệu'), `Tiêu đề header cập nhật: "${ingPageCheck.headerTitle}"`);

    // 4. Test Browser Back Button (popstate)
    console.log('   -> Test nút Back của trình duyệt...');
    await page.evaluate(`window.history.back();`);
    await sleep(800);

    const backCheck = await page.evaluate(`
      (function() {
        return {
          sentinelIntact: window.__cookmate_spa_sentinel === 2026,
          pathname: window.location.pathname
        };
      })()
    `);
    assert(backCheck.sentinelIntact === true, 'Lịch sử Back/Forward hoạt động không làm reload trang');
    assert(backCheck.pathname.includes('categories.html'), `Quay lại đúng trang categories.html: ${backCheck.pathname}`);

    await page.screenshot('05_spa_navigation_smooth.png');

    // -------------------------------------------------------------------------
    // BƯỚC 5: KIỂM TRA MOBILE RESPONSIVE DRAWER
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: KIỂM TRA MOBILE RESPONSIVE DRAWER (375x667) ---');
    const mobilePage = await createPage('http://127.0.0.1:8089/pages/admin/index.html', { width: 375, height: 667 });
    await sleep(800);

    const mobileInit = await mobilePage.evaluate(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        var btn = document.getElementById('sidebarToggleBtn');
        var icon = btn ? btn.querySelector('i') : null;
        return {
          sidebarActive: sidebar.classList.contains('active'),
          iconClass: icon ? icon.className : '',
          ariaExpanded: btn.getAttribute('aria-expanded')
        };
      })()
    `);

    assert(mobileInit.sidebarActive === false, 'Mobile: Sidebar mặc định đóng drawer');
    assert(mobileInit.iconClass.includes('fa-bars'), 'Mobile: Nút toggle hiển thị icon 3 gạch fa-bars');

    // Mở drawer trên mobile
    console.log('   -> Mở Drawer trên mobile...');
    await mobilePage.evaluate(`document.getElementById('sidebarToggleBtn').click()`);
    await sleep(500);

    const mobileOpened = await mobilePage.evaluate(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        var btn = document.getElementById('sidebarToggleBtn');
        var icon = btn ? btn.querySelector('i') : null;
        var backdrop = document.getElementById('sidebarBackdrop');
        return {
          sidebarActive: sidebar.classList.contains('active'),
          iconClass: icon ? icon.className : '',
          backdropActive: backdrop && backdrop.classList.contains('active')
        };
      })()
    `);

    assert(mobileOpened.sidebarActive === true, 'Mobile: Sidebar mở thành công dưới dạng drawer');
    assert(mobileOpened.backdropActive === true, 'Mobile: Backdrop tối mờ kích hoạt');
    assert(mobileOpened.iconClass.includes('fa-xmark'), 'Mobile: Nút chuyển sang dấu X để đóng');

    await mobilePage.screenshot('04_mobile_drawer_toggle.png');

    // Đóng drawer bằng click backdrop
    console.log('   -> Đóng Drawer bằng click backdrop...');
    await mobilePage.evaluate(`document.getElementById('sidebarBackdrop').click()`);
    await sleep(500);

    const mobileClosed = await mobilePage.evaluate(`
      (function() {
        var sidebar = document.getElementById('adminSidebar');
        var btn = document.getElementById('sidebarToggleBtn');
        var icon = btn ? btn.querySelector('i') : null;
        return {
          sidebarActive: sidebar.classList.contains('active'),
          iconClass: icon ? icon.className : ''
        };
      })()
    `);

    assert(mobileClosed.sidebarActive === false, 'Mobile: Sidebar đóng gọn sau khi click backdrop');
    assert(mobileClosed.iconClass.includes('fa-bars'), 'Mobile: Nút quay lại icon 3 gạch fa-bars');

    // -------------------------------------------------------------------------
    // BƯỚC 6: BẢO VỆ PHÂN QUYỀN VÀ TRANG USER
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: BẢO VỆ PHÂN QUYỀN VÀ TRANG USER ---');
    const userPage = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(800);

    // Đăng nhập Member thường
    await userPage.evaluate(`
      CookMateStorage.setCurrentUser({
        id: 'user_member_01',
        name: 'Giang Member',
        email: 'giang@cookmate.vn',
        role: 'member'
      });
      window.location.href = '../admin/index.html';
    `);
    
    // Đợi trang index.html kiểm tra quyền và redirect về login.html
    let userRedirectUrl = '';
    for (let i = 0; i < 15; i++) {
      await sleep(300);
      try {
        userRedirectUrl = await userPage.evaluate(`window.location.href`);
        if (userRedirectUrl && userRedirectUrl.includes('login.html')) break;
      } catch (e) {}
    }
    console.log(`   -> URL sau kiểm tra phân quyền: ${userRedirectUrl}`);
    var isBlocked = !userRedirectUrl.includes('/admin/') && (userRedirectUrl.includes('login.html') || userRedirectUrl.includes('index.html'));
    assert(isBlocked, 'Bảo vệ phân quyền: Thành viên thường bị chặn truy cập Admin Dashboard (bị redirect ra khỏi khu vực admin)');

    // Truy cập User index.html
    const homePage = await createPage('http://127.0.0.1:8089/index.html');
    await sleep(800);
    const homeHeaderExists = await homePage.evaluate(`!!document.querySelector('.site-header')`);
    const homeFooterExists = await homePage.evaluate(`!!document.querySelector('.site-footer')`);
    assert(homeHeaderExists === true, 'Trang chủ User Header hiển thị chuẩn xác');
    assert(homeFooterExists === true, 'Trang chủ User Footer hiển thị chuẩn xác');

  } catch (err) {
    console.error('Lỗi kiểm thử:', err);
    failCount++;
  } finally {
    console.log('\n========================================================================');
    console.log(`  KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED (TỔNG ${testIndex} CHECKS)`);
    console.log('========================================================================');
    chrome.kill();
    process.exit(failCount === 0 ? 0 : 1);
  }
}

runTest();
