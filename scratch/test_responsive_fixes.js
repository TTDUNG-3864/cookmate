const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const DEBUG_PORT = 9241;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('===============================================================');
  console.log('  COOKMATE: VERIFY RESPONSIVE BÁT PHỞ, FOOTER & SEARCH EMPTY  ');
  console.log('===============================================================');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\temp\\chrome_fixes_suite_2'
  ], { stdio: 'ignore' });

  await sleep(1500);

  async function createPage(url) {
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

    const evaluate = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: `(() => { ${expr} })()`, returnByValue: true });
      if (res.exceptionDetails) console.error('Eval error:', res.exceptionDetails);
      return res.result ? res.result.value : null;
    };

    const screenshot = async (filename) => {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(SCREENSHOT_DIR, filename), Buffer.from(res.data, 'base64'));
      console.log(`  📸 Screenshot saved: scratch/screenshots/${filename}`);
    };

    const setViewport = async (width, height, isMobile = false) => {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: isMobile
      });
      await sleep(250);
    };

    await send('Page.enable');
    await send('DOM.enable');

    return { ws, send, evaluate, screenshot, setViewport, targetId: target.id };
  }

  const results = [];

  try {
    // =========================================================================
    // 1. LỖI A: BÁT PHỞ ẨN TRÊN MOBILE/TABLET (< 1024px), HIỆN TRÊN DESKTOP (>= 1024px)
    // =========================================================================
    console.log('\n--- [TEST 1] PHO DISPLAY ON LOGIN & REGISTER ---');

    // 1.1 Login Page
    const login = await createPage('http://localhost:8089/pages/auth/login.html');
    await sleep(600);

    // Desktop 1366x768
    await login.setViewport(1366, 768);
    const loginDesktopPho = await login.evaluate(`
      const pho = document.getElementById('phoStage');
      const style = window.getComputedStyle(pho);
      return {
        display: style.display,
        width: pho.offsetWidth,
        height: pho.offsetHeight,
        isVisible: pho.offsetHeight > 0 && style.display !== 'none'
      };
    `);
    console.log('Login Pho on Desktop 1366px:', loginDesktopPho);
    results.push({
      test: 'Login Page Desktop (1366px): Bát phở hiển thị bình thường',
      pass: loginDesktopPho.isVisible === true
    });
    await login.screenshot('fix_login_desktop_1366.png');

    // Tablet 768x1024
    await login.setViewport(768, 1024);
    const loginTabletPho = await login.evaluate(`
      const pho = document.getElementById('phoStage');
      const style = window.getComputedStyle(pho);
      const card = document.querySelector('.cookmate-auth__card-wrapper');
      return {
        display: style.display,
        width: pho.offsetWidth,
        height: pho.offsetHeight,
        isZeroSize: pho.offsetHeight === 0 && pho.offsetWidth === 0,
        cardVisible: card.offsetHeight > 0
      };
    `);
    console.log('Login Pho on Tablet 768px:', loginTabletPho);
    results.push({
      test: 'Login Page Tablet (768px): Bát phở ẩn hoàn toàn (display: none)',
      pass: loginTabletPho.display === 'none' && loginTabletPho.isZeroSize === true
    });
    await login.screenshot('fix_login_tablet_768.png');

    // Mobile 375x812
    await login.setViewport(375, 812, true);
    const loginMobilePho = await login.evaluate(`
      const pho = document.getElementById('phoStage');
      const style = window.getComputedStyle(pho);
      const card = document.querySelector('.cookmate-auth__card-wrapper');
      const cardRect = card.getBoundingClientRect();
      return {
        display: style.display,
        phoHeight: pho.offsetHeight,
        cardTop: cardRect.top,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    `);
    console.log('Login Pho on Mobile 375px:', loginMobilePho);
    results.push({
      test: 'Login Page Mobile (375px): Bát phở ẩn hoàn toàn, form ở đầu trang',
      pass: loginMobilePho.display === 'none' && loginMobilePho.phoHeight === 0 && loginMobilePho.cardTop < 120 && !loginMobilePho.hasHorizontalOverflow
    });
    await login.screenshot('fix_login_mobile_375.png');

    login.ws.close();

    // 1.2 Register Page
    const reg = await createPage('http://localhost:8089/pages/auth/register.html');
    await sleep(600);

    await reg.setViewport(1366, 768);
    const regDesktopPho = await reg.evaluate(`
      const pho = document.getElementById('phoStage');
      return pho.offsetHeight > 0 && window.getComputedStyle(pho).display !== 'none';
    `);
    results.push({
      test: 'Register Page Desktop (1366px): Bát phở hiển thị bình thường',
      pass: regDesktopPho === true
    });

    await reg.setViewport(768, 1024);
    const regTabletPho = await reg.evaluate(`
      const pho = document.getElementById('phoStage');
      return window.getComputedStyle(pho).display === 'none' && pho.offsetHeight === 0;
    `);
    results.push({
      test: 'Register Page Tablet (768px): Bát phở ẩn hoàn toàn (display: none)',
      pass: regTabletPho === true
    });

    await reg.setViewport(390, 844, true);
    const regMobilePho = await reg.evaluate(`
      const pho = document.getElementById('phoStage');
      const style = window.getComputedStyle(pho);
      return {
        isDisplayNone: style.display === 'none',
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    `);
    results.push({
      test: 'Register Page Mobile (390px): Bát phở ẩn hoàn toàn, không tràn ngang',
      pass: regMobilePho.isDisplayNone && !regMobilePho.hasHorizontalOverflow
    });
    await reg.screenshot('fix_register_mobile_390.png');

    reg.ws.close();

    // =========================================================================
    // 2. LỖI B & C: FOOTER MOBILE XUỐNG DÒNG VÀ MÀU CHỮ COOK LOGO
    // =========================================================================
    console.log('\n--- [TEST 2] FOOTER RESPONSIVE & LOGO COLOR ---');
    const home = await createPage('http://localhost:8089/index.html');
    await sleep(800);

    // 2.1 Logo Text Color Test (Lỗi C)
    const logoColors = await home.evaluate(`
      const footerLogo = document.querySelector('.site-footer .logo-name');
      const footerAccent = document.querySelector('.site-footer .logo-accent');
      const headerLogo = document.querySelector('.site-header .logo-name');
      return {
        footerNameColor: footerLogo ? window.getComputedStyle(footerLogo).color : null,
        footerAccentColor: footerAccent ? window.getComputedStyle(footerAccent).color : null,
        headerNameColor: headerLogo ? window.getComputedStyle(headerLogo).color : null
      };
    `);
    console.log('Logo Colors:', logoColors);

    // Parse rgb strings
    const isFooterNameBright = logoColors.footerNameColor && logoColors.footerNameColor.includes('255, 249, 242');
    const isHeaderNameDark = logoColors.headerNameColor && (logoColors.headerNameColor.includes('41, 37, 36') || logoColors.headerNameColor.includes('41,37,36'));

    results.push({
      test: 'Logo Footer (Lỗi C): Chữ "Cook" màu kem sáng (#FFF9F2) tương phản rõ trên nền tối',
      pass: isFooterNameBright === true
    });
    results.push({
      test: 'Logo Header: Giữ nguyên màu chữ tối (#292524) chuẩn nhận diện trên nền sáng',
      pass: isHeaderNameDark === true
    });

    // 2.2 Footer Mobile Stacking & Link Spacing (Lỗi B)
    await home.setViewport(375, 812, true);
    await sleep(300);

    const footerMobileMetrics = await home.evaluate(`
      const footer = document.querySelector('.site-footer');
      const footerLinksContainers = document.querySelectorAll('.site-footer .footer-links');
      
      let allLinksStacked = true;
      const sampleLinkPositions = [];

      footerLinksContainers.forEach((container, groupIdx) => {
        const links = Array.from(container.querySelectorAll('a'));
        for (let i = 0; i < links.length - 1; i++) {
          const r1 = links[i].getBoundingClientRect();
          const r2 = links[i + 1].getBoundingClientRect();
          if (r2.top < r1.top + 15) {
            allLinksStacked = false;
          }
          if (groupIdx === 0 && i < 3) {
            sampleLinkPositions.push({ text: links[i].textContent.trim(), top: r1.top, bottom: r1.bottom });
          }
        }
      });

      return {
        allLinksStacked,
        sampleLinkPositions,
        footerScrollWidth: footer.scrollWidth,
        footerClientWidth: footer.clientWidth,
        hasOverflow: footer.scrollWidth > footer.clientWidth
      };
    `);
    console.log('Footer Mobile Metrics:', footerMobileMetrics);

    results.push({
      test: 'Footer Mobile (Lỗi B): Các liên kết xuống dòng độc lập, không dính liền',
      pass: footerMobileMetrics.allLinksStacked === true
    });
    results.push({
      test: 'Footer Mobile (Lỗi B): Không tràn ngang (scrollWidth <= clientWidth)',
      pass: footerMobileMetrics.hasOverflow === false
    });

    // Scroll to footer and capture screenshot
    await home.evaluate(`document.querySelector('.site-footer').scrollIntoView();`);
    await sleep(400);
    await home.screenshot('fix_footer_mobile_375.png');

    // Desktop footer screenshot
    await home.setViewport(1366, 768);
    await sleep(300);
    await home.evaluate(`document.querySelector('.site-footer').scrollIntoView();`);
    await sleep(400);
    await home.screenshot('fix_footer_desktop_1366.png');

    home.ws.close();

    // =========================================================================
    // 3. LỖI D: CĂN GIỮA EMPTY STATE TRANG TÌM KIẾM
    // =========================================================================
    console.log('\n--- [TEST 3] SEARCH EMPTY STATE CENTERING ---');
    const search = await createPage('http://localhost:8089/pages/search.html');
    await sleep(800);

    // Desktop 1366x768
    await search.setViewport(1366, 768);
    await sleep(300);

    // Trigger empty search by typing nonexistent keyword
    await search.evaluate(`
      const input = document.getElementById('searchInput');
      input.value = 'MonAnKhongTonTai999';
      document.getElementById('searchForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(500);

    const emptyCenteringDesktop = await search.evaluate(`
      const area = document.querySelector('.search-results-area');
      const empty = document.querySelector('.empty-state');
      const sidebar = document.querySelector('.search-sidebar');
      const resetBtn = empty ? empty.querySelector('button') : null;

      if (!area || !empty) return null;

      const areaRect = area.getBoundingClientRect();
      const emptyRect = empty.getBoundingClientRect();

      const leftGap = emptyRect.left - areaRect.left;
      const rightGap = areaRect.right - emptyRect.right;
      const diff = Math.abs(leftGap - rightGap);

      let btnCentered = false;
      if (resetBtn) {
        const btnRect = resetBtn.getBoundingClientRect();
        const btnLeft = btnRect.left - emptyRect.left;
        const btnRight = emptyRect.right - btnRect.right;
        btnCentered = Math.abs(btnLeft - btnRight) < 8;
      }

      return {
        areaWidth: areaRect.width,
        emptyWidth: emptyRect.width,
        leftGap,
        rightGap,
        diff,
        isCentered: diff < 15,
        btnCentered,
        sidebarWidth: sidebar ? sidebar.offsetWidth : 0
      };
    `);
    console.log('Search Empty Centering on Desktop 1366px:', emptyCenteringDesktop);

    results.push({
      test: 'Search Empty State (Lỗi D): Căn giữa cân đối trong vùng kết quả trên Desktop',
      pass: emptyCenteringDesktop && emptyCenteringDesktop.isCentered === true
    });
    results.push({
      test: 'Search Empty State (Lỗi D): Nút "Đặt lại bộ lọc" căn giữa trong cụm empty state',
      pass: emptyCenteringDesktop && emptyCenteringDesktop.btnCentered === true
    });
    await search.screenshot('fix_search_empty_desktop_1366.png');

    // Test on Mobile (375x812)
    await search.setViewport(375, 812, true);
    await sleep(300);

    const emptyCenteringMobile = await search.evaluate(`
      const area = document.querySelector('.search-results-area');
      const empty = document.querySelector('.empty-state');
      if (!area || !empty) return null;
      const areaRect = area.getBoundingClientRect();
      const emptyRect = empty.getBoundingClientRect();
      const diff = Math.abs((emptyRect.left - areaRect.left) - (areaRect.right - emptyRect.right));
      return {
        diff,
        isCentered: diff < 15,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    `);
    console.log('Search Empty Centering on Mobile 375px:', emptyCenteringMobile);

    results.push({
      test: 'Search Empty State (Lỗi D): Căn giữa trên Mobile, 0% tràn ngang',
      pass: emptyCenteringMobile && emptyCenteringMobile.isCentered === true && !emptyCenteringMobile.hasHorizontalOverflow
    });
    await search.screenshot('fix_search_empty_mobile_375.png');

    // Test filter reset restores recipes
    await search.evaluate(`
      resetAllFilters();
    `);
    await sleep(500);
    const restoredCount = await search.evaluate(`
      return document.querySelectorAll('#searchResultsGrid .recipe-card').length;
    `);
    console.log('Restored recipes count after reset:', restoredCount);
    results.push({
      test: 'Search Logic: Nút đặt lại bộ lọc phục hồi toàn bộ danh sách công thức',
      pass: restoredCount > 0
    });

    search.ws.close();

  } finally {
    chrome.kill();
  }

  console.log('\n===============================================================');
  console.log('                    TEST SUMMARY REPORT                        ');
  console.log('===============================================================');
  let passCount = 0;
  let failCount = 0;
  for (const r of results) {
    if (r.pass) {
      console.log(`  ✅ PASS: ${r.test}`);
      passCount++;
    } else {
      console.log(`  ❌ FAIL: ${r.test}`);
      failCount++;
    }
  }
  console.log(`\nTotal Tests: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
