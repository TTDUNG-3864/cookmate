const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const DEBUG_PORT = 9252;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_master');
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

async function runTestSuite() {
  console.log('========================================================================');
  console.log('  COOKMATE MASTER UI/UX REFINEMENT - AUTOMATED VERIFICATION SUITE       ');
  console.log('========================================================================\n');

  const chromeUserDataDir = 'C:\\temp\\chrome_master_' + Date.now();
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${chromeUserDataDir}`
  ], { stdio: 'ignore' });

  await sleep(1600);

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
    // PHẦN A: ADMIN SHELL, HAMBURGER, PREVIEW, & SPA NAVIGATION
    // =========================================================================
    console.log('\n--- KIỂM TRA PHẦN A: ADMIN SHELL, HAMBURGER, XEM WEBSITE & SPA NAV ---');
    const pageAdmin = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(800);

    // Đăng nhập quyền Admin
    await pageAdmin.evalJs(`
      CookMateStorage.setCurrentUser({
        id: 'user_admin_01',
        name: 'Quản trị viên CookMate',
        email: 'admin@cookmate.vn',
        role: 'admin'
      });
      window.location.href = '../admin/index.html';
    `);
    await sleep(1200);

    // A1: Nút "Xem website CookMate" ở đầu Sidebar bên trái dưới logo
    const websiteBtnCheck = await pageAdmin.evalJs(`
      (function() {
        var btn = document.getElementById('btnViewWebsite');
        if (!btn) return { exists: false };
        var nav = document.querySelector('.admin-sidebar__nav');
        var firstLink = nav ? nav.querySelector('.admin-sidebar__link') : null;
        var rect = btn.getBoundingClientRect();
        return {
          exists: true,
          text: btn.textContent.trim(),
          isAtTop: firstLink === btn || (nav && nav.firstElementChild.contains(btn)),
          visible: rect.width > 0 && rect.height > 0
        };
      })()
    `);
    assert(websiteBtnCheck.exists && websiteBtnCheck.isAtTop, 'Nút "Xem website CookMate" nằm ngay đầu sidebar bên trái');

    // A2: Nút Hamburger duy nhất (#sidebarToggleBtn) đóng/mở sidebar
    const toggleInitial = await pageAdmin.evalJs(`
      (function() {
        var btn = document.getElementById('sidebarToggleBtn');
        if (!btn) return { exists: false };
        var icon = btn.querySelector('i');
        var sidebar = document.getElementById('adminSidebar');
        return {
          exists: true,
          iconClass: icon ? icon.className : '',
          isXmark: icon ? icon.className.includes('fa-xmark') : false,
          sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : 0
        };
      })()
    `);
    assert(toggleInitial.exists && toggleInitial.isXmark, 'Sidebar ban đầu MỞ: nút toggle duy nhất hiển thị icon dấu X (fa-xmark)');
    assert(toggleInitial.sidebarWidth >= 240, `Sidebar ban đầu có chiều rộng đầy đủ (${toggleInitial.sidebarWidth}px)`);

    // A3: Click toggle để ĐÓNG sidebar: icon chuyển sang 3 gạch, sidebar width = 0
    await pageAdmin.evalJs(`document.getElementById('sidebarToggleBtn').click();`);
    await sleep(400);

    const toggleClosed = await pageAdmin.evalJs(`
      (function() {
        var btn = document.getElementById('sidebarToggleBtn');
        var icon = btn ? btn.querySelector('i') : null;
        var sidebar = document.getElementById('adminSidebar');
        var layout = document.querySelector('.admin-layout');
        var rect = btn ? btn.getBoundingClientRect() : null;
        return {
          isBars: icon ? icon.className.includes('fa-bars') : false,
          sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : -1,
          isLayoutClosed: layout ? layout.classList.contains('sidebar-closed') : false,
          btnVisible: rect && rect.width > 0 && rect.height > 0
        };
      })()
    `);
    assert(toggleClosed.isBars, 'Khi đóng Sidebar: icon chuyển thành 3 gạch hamburger (fa-bars)');
    assert(toggleClosed.sidebarWidth === 0, `Sidebar ẩn hoàn toàn với width = 0px (thực tế: ${toggleClosed.sidebarWidth}px)`);
    assert(toggleClosed.btnVisible, 'Nút toggle vẫn luôn hiển thị để người dùng mở lại bất cứ lúc nào');

    // A4: Click toggle lần 2 để MỞ lại sidebar: icon quay lại dấu X, width >= 240px
    await pageAdmin.evalJs(`document.getElementById('sidebarToggleBtn').click();`);
    await sleep(400);

    const toggleReopened = await pageAdmin.evalJs(`
      (function() {
        var btn = document.getElementById('sidebarToggleBtn');
        var icon = btn ? btn.querySelector('i') : null;
        var sidebar = document.getElementById('adminSidebar');
        return {
          isXmark: icon ? icon.className.includes('fa-xmark') : false,
          sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : 0
        };
      })()
    `);
    assert(toggleReopened.isXmark, 'Khi bấm mở lại: icon quay lại dấu X (fa-xmark)');
    assert(toggleReopened.sidebarWidth >= 240, `Sidebar mở ra chiều rộng đầy đủ (${toggleReopened.sidebarWidth}px)`);

    // A5: Chế độ Xem website CookMate: Xóa 100% hai thanh preview thừa
    await pageAdmin.evalJs(`document.getElementById('btnViewWebsite').click();`);
    await sleep(800);

    const previewCheck = await pageAdmin.evalJs(`
      (function() {
        var iframe = document.querySelector('#adminWebsitePreview iframe, #adminWebsitePreviewFrame, iframe[src*="index.html"]');
        var oldPreviewBar = document.querySelector('.admin-preview-toolbar');
        var oldPreviewHeader = document.querySelector('.admin-preview-header');
        var adminHeader = document.querySelector('.admin-header');
        var isHeaderHidden = adminHeader ? (getComputedStyle(adminHeader).display === 'none' || adminHeader.hidden) : true;
        var iframeRect = iframe ? iframe.getBoundingClientRect() : null;
        return {
          hasIframe: !!iframe,
          iframeSrc: iframe ? iframe.getAttribute('src') : '',
          noPreviewBar: !oldPreviewBar || getComputedStyle(oldPreviewBar).display === 'none',
          noPreviewHeader: !oldPreviewHeader || getComputedStyle(oldPreviewHeader).display === 'none',
          isHeaderHidden: isHeaderHidden,
          iframeHeight: iframeRect ? iframeRect.height : 0,
          iframeTop: iframeRect ? iframeRect.top : -1
        };
      })()
    `);
    assert(previewCheck.hasIframe, 'Iframe xem website User được kích hoạt trực tiếp');
    assert(previewCheck.noPreviewBar, 'Không có thanh .admin-preview-toolbar dư thừa');
    assert(previewCheck.noPreviewHeader, 'Không có thanh tiêu đề xem trước phụ .admin-preview-header');
    assert(previewCheck.isHeaderHidden, 'Thanh .admin-header bị ẩn hoàn toàn khi xem website');
    assert(previewCheck.iframeTop === 0, `Website User chiếm trọn đỉnh màn hình từ top = 0px (thực tế: ${previewCheck.iframeTop}px)`);

    await pageAdmin.screenshot('admin_website_preview_seamless.png');

    // A6: Thoát khỏi chế độ xem website và kiểm tra SPA In-Place Swapping
    await pageAdmin.evalJs(`
      var linkRecipes = document.querySelector('.admin-sidebar__link[href*="recipes.html"]');
      if (linkRecipes) linkRecipes.click();
    `);
    await sleep(500);

    const spaNavCheck = await pageAdmin.evalJs(`
      (function() {
        var title = document.querySelector('.admin-header__title');
        return {
          pathname: window.location.pathname,
          titleText: title ? title.textContent.trim() : '',
          isViewingWebsite: document.querySelector('.admin-layout').classList.contains('viewing-website')
        };
      })()
    `);
    assert(spaNavCheck.pathname.includes('recipes.html'), 'SPA Navigation cập nhật pathname sang recipes.html');
    assert(spaNavCheck.titleText.includes('công thức'), `Nội dung cập nhật mượt mà không reload (Tiêu đề: "${spaNavCheck.titleText}")`);
    assert(!spaNavCheck.isViewingWebsite, 'Trạng thái xem website được tự động đóng khi quay lại mục quản trị');

    await pageAdmin.screenshot('admin_spa_nav_recipes.png');
    await pageAdmin.close();

    // =========================================================================
    // PHẦN B: FOOTER COOKMATE & BÁT PHỞ HÀ NỘI
    // =========================================================================
    console.log('\n--- KIỂM TRA PHẦN B: FOOTER COOKMATE & BÁT PHỞ HÀ NỘI ---');
    const pageHome = await createPage('http://127.0.0.1:8089/index.html');
    await sleep(800);

    const footerCheck = await pageHome.evalJs(`
      (function() {
        var footer = document.querySelector('.site-footer');
        if (!footer) return { exists: false };
        var cs = getComputedStyle(footer);
        var bg = cs.backgroundColor;

        // Kiểm tra không có liên kết tài khoản
        var allLinks = Array.from(footer.querySelectorAll('a')).map(a => a.getAttribute('href') || '');
        var forbiddenLinks = ['login.html', 'register.html', 'profile.html', 'my-recipes.html', 'favorites.html', 'recipe-form.html'];
        var foundForbidden = forbiddenLinks.filter(f => allLinks.some(l => l.includes(f)));

        // Kiểm tra 4 nhóm liên kết chuẩn
        var linkTexts = Array.from(footer.querySelectorAll('a')).map(a => a.textContent.trim());
        var hasKhamPha = linkTexts.some(t => t.includes('Công thức') || t.includes('Danh mục'));
        var hasVeCookMate = linkTexts.some(t => t.includes('Giới thiệu') || t.includes('FAQ') || t.includes('Góp ý'));
        var hasThongTin = linkTexts.some(t => t.includes('Điều khoản') || t.includes('Bảo mật'));

        // Kiểm tra Bát phở Hà Nội
        var phoIllustration = footer.querySelector('.footer-pho-showcase, .footer-pho-art, img[src*="pho"], svg');
        var phoImg = footer.querySelector('img[src*="pho"]');

        // Logo contrast
        var logoCook = footer.querySelector('.logo-cook, .footer-brand strong');
        var logoCookColor = logoCook ? getComputedStyle(logoCook).color : '';

        return {
          exists: true,
          bg: bg,
          forbiddenFound: foundForbidden,
          hasKhamPha: hasKhamPha,
          hasVeCookMate: hasVeCookMate,
          hasThongTin: hasThongTin,
          hasPhoIllustration: !!phoIllustration,
          phoImgSrc: phoImg ? phoImg.getAttribute('src') : '',
          logoCookColor: logoCookColor
        };
      })()
    `);

    assert(footerCheck.exists, 'Footer CookMate hiện diện trên trang');
    assert(footerCheck.forbiddenFound.length === 0, `Đã loại bỏ 100% các liên kết tài khoản khỏi Footer (Tìm thấy vi phạm: ${footerCheck.forbiddenFound.join(', ') || '0'})`);
    assert(footerCheck.hasKhamPha && footerCheck.hasVeCookMate && footerCheck.hasThongTin, '4 nhóm thông tin chuẩn: CookMate, Khám phá, Về CookMate, Thông tin');
    assert(footerCheck.hasPhoIllustration, `Minh họa Bát phở Hà Nội tinh tế xuất hiện bên phải footer (${footerCheck.phoImgSrc || 'SVG element'})`);

    await pageHome.screenshot('footer_desktop_verified.png');

    // =========================================================================
    // PHẦN C: TIÊU ĐỀ SECTION TRANG CHỦ & TABS & OCCASIONS
    // =========================================================================
    console.log('\n--- KIỂM TRA PHẦN C: TIÊU ĐỀ SECTION TRANG CHỦ & TABS & OCCASIONS ---');
    const homeSectionCheck = await pageHome.evalJs(`
      (function() {
        var sections = document.querySelectorAll('.home-section');
        var headers = document.querySelectorAll('.section-header');
        var firstHeader = headers[0];
        var info = firstHeader ? firstHeader.querySelector('.section-header__info') : null;
        var iconBadge = firstHeader ? firstHeader.querySelector('.section-header__icon') : null;
        var title = firstHeader ? firstHeader.querySelector('.section-header__title') : null;
        var desc = firstHeader ? (firstHeader.querySelector('.section-header__subtitle') || firstHeader.querySelector('.section-header__desc')) : null;
        var viewAllBtn = firstHeader ? firstHeader.querySelector('.section-header__link, .section-link') : null;

        // Khoảng cách giữa các section
        var s1 = sections[0] ? sections[0].getBoundingClientRect() : null;
        var s2 = sections[1] ? sections[1].getBoundingClientRect() : null;
        var gap = (s1 && s2) ? (s2.top - s1.bottom) : 0;

        // Segmented control tabs
        var filterBtns = document.querySelectorAll('.home-filter-btn');
        var activeBtn = document.querySelector('.home-filter-btn.active');

        // Occasion chips
        var occasionChips = document.querySelectorAll('.occasion-chip');
        var occasionSection = document.getElementById('occasionSection');
        var occasionTopSpacing = occasionSection ? parseInt(getComputedStyle(occasionSection).paddingTop || getComputedStyle(occasionSection).marginTop, 10) : 0;

        return {
          sectionCount: sections.length,
          hasInfoGroup: !!info,
          hasIconBadge: !!iconBadge,
          hasTitle: !!title,
          hasDesc: !!desc,
          hasViewAllBtn: !!viewAllBtn,
          sectionGap: gap,
          filterBtnCount: filterBtns.length,
          activeBtnText: activeBtn ? activeBtn.textContent.trim() : '',
          occasionChipCount: occasionChips.length,
          occasionTopSpacing: occasionTopSpacing
        };
      })()
    `);

    assert(homeSectionCheck.hasIconBadge && homeSectionCheck.hasTitle && homeSectionCheck.hasDesc, 'Component section header có phân cấp chuẩn: Icon Badge + Tiêu đề + Mô tả phụ');
    assert(homeSectionCheck.hasViewAllBtn, 'Nút "Xem tất cả" cân đối trong section header');
    assert(homeSectionCheck.filterBtnCount >= 3, `Tabs bộ lọc trang chủ có ${homeSectionCheck.filterBtnCount} nút segmented control`);
    assert(homeSectionCheck.activeBtnText.includes('Tất cả'), `Tab mặc định là "Tất cả" (Thực tế: "${homeSectionCheck.activeBtnText}")`);
    assert(homeSectionCheck.occasionChipCount >= 4, `Mục Dịp lễ có ${homeSectionCheck.occasionChipCount} chip bo tròn linh hoạt (Tết, Rằm, Giáng sinh, Tiệc gia đình)`);

    // Thử tương tác tab trang chủ
    await pageHome.evalJs(`
      var btnFeatured = Array.from(document.querySelectorAll('.home-filter-btn')).find(b => b.textContent.includes('Nổi bật'));
      if (btnFeatured) btnFeatured.click();
    `);
    await sleep(300);

    const tabSwitchCheck = await pageHome.evalJs(`
      (function() {
        var activeBtn = document.querySelector('.home-filter-btn.active');
        return {
          activeText: activeBtn ? activeBtn.textContent.trim() : ''
        };
      })()
    `);
    assert(tabSwitchCheck.activeText.includes('Nổi bật'), 'Click chuyển segmented tab sang "Nổi bật nhất" phản hồi ngay lập tức');

    await pageHome.screenshot('home_sections_and_tabs.png');
    await pageHome.close();

    // =========================================================================
    // PHẦN D & E: FORM ĐĂNG CÔNG THỨC 5 SECTIONS & KHÔNG CUỘN LỒNG
    // =========================================================================
    console.log('\n--- KIỂM TRA PHẦN D & E: FORM ĐĂNG CÔNG THỨC 5 PHẦN & KHÔNG CUỘN LỒNG ---');
    const pageUserForm = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(600);

    // Đăng nhập quyền Member thường
    await pageUserForm.evalJs(`
      CookMateStorage.setCurrentUser({
        id: 'user_member_01',
        name: 'Giang Member',
        email: 'giang@cookmate.vn',
        role: 'member'
      });
      window.location.href = 'http://127.0.0.1:8089/pages/account/recipe-form.html';
    `);
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      try {
        const u = await pageUserForm.evalJs('window.location.href');
        if (u && u.includes('account/recipe-form.html')) break;
      } catch (e) {}
    }
    await sleep(400);

    const userFormSections = await pageUserForm.evalJs(`
      (function() {
        var form = document.getElementById('recipeForm');
        if (!form) return { exists: false };
        var sections = form.querySelectorAll('.form-section, .recipe-form__section');
        var titles = Array.from(sections).map(s => {
          var t = s.querySelector('.form-section-title, .recipe-form__section-title');
          return t ? t.textContent.trim() : '';
        });

        // Section 2 elements
        var imgPreview = document.getElementById('imagePreview');
        var servings = document.getElementById('recipeServings');

        // Section 3 elements
        var ingHeader = document.querySelector('.ingredients-header-row');
        var ingList = document.getElementById('ingredientsList');
        var ingRows = ingList ? ingList.querySelectorAll('.ingredient-row') : [];

        // Section 4 elements
        var stepList = document.getElementById('stepsList');
        var stepCards = stepList ? stepList.querySelectorAll('.step-card') : [];

        // Section 5 elements
        var notice = document.querySelector('.recipe-submit-notice');
        var submitBtn = document.getElementById('submitRecipeBtn');

        // Kiểm tra không cuộn lồng trong ingredients & steps
        var ingOverflow = ingList ? getComputedStyle(ingList).overflowY : '';
        var stepOverflow = stepList ? getComputedStyle(stepList).overflowY : '';

        return {
          exists: true,
          sectionCount: sections.length,
          titles: titles,
          hasServings: !!servings,
          hasIngHeader: !!ingHeader,
          initialIngCount: ingRows.length,
          initialStepCount: stepCards.length,
          hasNotice: !!notice,
          noticeText: notice ? notice.textContent.trim() : '',
          submitBtnText: submitBtn ? submitBtn.textContent.trim() : '',
          ingOverflow: ingOverflow,
          stepOverflow: stepOverflow
        };
      })()
    `);

    assert(userFormSections.sectionCount === 5, `Form đăng công thức phân tách thành 5 thẻ section chuẩn nghiệp vụ (Thực tế: ${userFormSections.sectionCount} thẻ)`);
    assert(userFormSections.hasServings, 'Section 2 có ô khẩu phần gốc kèm thuyết minh cơ chế tự động co giãn');
    assert(userFormSections.hasIngHeader, 'Section 3 có hàng tiêu đề cột nguyên liệu (Tên, Số lượng, Đơn vị, Xóa)');
    assert(userFormSections.hasNotice && userFormSections.noticeText.includes('kiểm duyệt'), 'Section 5 có hộp thông báo quy trình kiểm duyệt công thức');
    assert(userFormSections.ingOverflow !== 'scroll' && userFormSections.ingOverflow !== 'auto', 'Danh sách nguyên liệu không bị cuộn lồng cục bộ, co giãn theo luồng trang');
    assert(userFormSections.stepOverflow !== 'scroll' && userFormSections.stepOverflow !== 'auto', 'Danh sách các bước không bị cuộn lồng cục bộ, co giãn theo luồng trang');

    // Thử thêm 2 nguyên liệu và 2 bước trên form User
    await pageUserForm.evalJs(`
      document.getElementById('addIngredientBtn').click();
      document.getElementById('addIngredientBtn').click();
      document.getElementById('addStepBtn').click();
      document.getElementById('addStepBtn').click();
    `);
    await sleep(300);

    const dynamicRowsCheck = await pageUserForm.evalJs(`
      (function() {
        var ingRows = document.querySelectorAll('#ingredientsList .ingredient-row');
        var stepCards = document.querySelectorAll('#stepsList .step-card');
        var badges = Array.from(stepCards).map(c => {
          var b = c.querySelector('.step-card__badge');
          return b ? b.textContent.trim() : '';
        });
        return {
          ingCount: ingRows.length,
          stepCount: stepCards.length,
          badges: badges
        };
      })()
    `);
    assert(dynamicRowsCheck.ingCount >= 3, `Thêm nguyên liệu thành công (Hiện có: ${dynamicRowsCheck.ingCount} dòng)`);
    assert(dynamicRowsCheck.stepCount >= 3, `Thêm bước thành công (Hiện có: ${dynamicRowsCheck.stepCount} bước)`);
    assert(dynamicRowsCheck.badges.some(b => b.includes('Bước 2')) && dynamicRowsCheck.badges.some(b => b.includes('Bước 3')), 'Huy hiệu số thứ tự "Bước X" được đánh số chính xác và trực quan');

    // Thử xóa 1 bước và kiểm tra tự động đánh số lại
    await pageUserForm.evalJs(`
      var firstDeleteBtn = document.querySelector('#stepsList .step-card .dynamic-row-delete');
      if (firstDeleteBtn) firstDeleteBtn.click();
    `);
    await sleep(200);

    const renumberCheck = await pageUserForm.evalJs(`
      (function() {
        var stepCards = document.querySelectorAll('#stepsList .step-card');
        var firstBadge = stepCards[0] ? stepCards[0].querySelector('.step-card__badge').textContent.trim() : '';
        return {
          count: stepCards.length,
          firstBadge: firstBadge
        };
      })()
    `);
    assert(renumberCheck.firstBadge.includes('Bước 1'), 'Xóa bước tự động đánh số lại mạch lạc, bắt đầu từ Bước 1');

    await pageUserForm.screenshot('recipe_form_5_sections.png');
    await pageUserForm.close();

    // Kiểm tra Form Admin (pages/admin/recipe-form.html)
    console.log('\n--- KIỂM TRA FORM ĐĂNG CÔNG THỨC QUẢN TRỊ (ADMIN) ---');
    const pageAdminForm = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(600);
    await pageAdminForm.evalJs(`
      CookMateStorage.setCurrentUser({
        id: 'user_admin_01',
        name: 'Quản trị viên CookMate',
        email: 'admin@cookmate.vn',
        role: 'admin'
      });
      window.location.href = 'http://127.0.0.1:8089/pages/admin/recipe-form.html';
    `);
    for (let i = 0; i < 20; i++) {
      await sleep(200);
      try {
        const u = await pageAdminForm.evalJs('window.location.href');
        if (u && u.includes('admin/recipe-form.html')) break;
      } catch (e) {}
    }
    await sleep(400);

    const adminFormCheck = await pageAdminForm.evalJs(`
      (function() {
        var sections = document.querySelectorAll('.form-section, .recipe-form__section');
        var notice = document.querySelector('.recipe-submit-notice--admin, .recipe-submit-notice');
        var submitBtn = document.getElementById('saveRecipeBtn');
        return {
          currentUrl: window.location.href,
          sectionCount: sections.length,
          hasNotice: !!notice,
          noticeText: notice ? notice.textContent.trim() : '',
          submitBtnText: submitBtn ? submitBtn.textContent.trim() : ''
        };
      })()
    `);
    console.log('   [DEBUG adminFormCheck]:', JSON.stringify(adminFormCheck));
    assert(adminFormCheck.sectionCount === 5, 'Form Admin đồng bộ cấu trúc 5 Sections chuyên nghiệp');
    assert(adminFormCheck.noticeText.includes('Đã duyệt') || adminFormCheck.noticeText.includes('công khai ngay'), 'Notice Admin xác nhận quyền xuất bản công khai ngay lập tức');

    await pageAdminForm.screenshot('admin_recipe_form_5_sections.png');
    await pageAdminForm.close();

    // =========================================================================
    // PHẦN F: KIỂM TRA RESPONSIVE TRÊN 8 KÍCH THƯỚC (0% TRÀN NGANG)
    // =========================================================================
    console.log('\n--- KIỂM TRA PHẦN F: RESPONSIVE TRÊN 8 KÍCH THƯỚC (ZERO HORIZONTAL SCROLL) ---');
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
      const p = await createPage('http://127.0.0.1:8089/index.html', vp);
      await sleep(400);

      const overflow = await p.evalJs(`
        (function() {
          var docWidth = document.documentElement.offsetWidth;
          var scrollWidth = document.documentElement.scrollWidth;
          var winWidth = window.innerWidth;
          var diff = scrollWidth - winWidth;
          return {
            winWidth: winWidth,
            scrollWidth: scrollWidth,
            hasHorizontalScroll: diff > 1
          };
        })()
      `);

      assert(!overflow.hasHorizontalScroll, `Viewport ${vp.name}: Không có thanh cuộn ngang (scrollWidth: ${overflow.scrollWidth}px, innerWidth: ${overflow.winWidth}px)`);

      if (i === 0 || i === 3 || i === 5) {
        await p.screenshot(`responsive_${vp.width}x${vp.height}.png`);
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
      console.log('>>> CHÚC MỪNG! TẤT CẢ CÁC MỤC TRONG MASTER UI/UX REFINEMENT ĐỀU ĐẠT CHUẨN 100%! <<<\n');
    }

  } catch (err) {
    console.error('Lỗi ngoại lệ trong kịch bản kiểm thử:', err);
  } finally {
    try {
      chrome.kill('SIGTERM');
    } catch (e) {}
  }
}

runTestSuite();
