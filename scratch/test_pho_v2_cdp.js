const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const DEBUG_PORT = 9235;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTests() {
  console.log('=====================================================');
  console.log('   COOKMATE AUTH V2 - AUTOMATED VERIFICATION SUITE   ');
  console.log('=====================================================');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\temp\\chrome_v2_suite'
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
      if (res.exceptionDetails) {
        console.error('Eval Exception:', res.exceptionDetails);
      }
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
    // TEST PART 1: LOGIN.HTML
    // =========================================================================
    console.log('\n--- [TEST 1] LOGIN PAGE: pages/auth/login.html ---');
    const login = await createPage('http://localhost:8089/pages/auth/login.html');
    await sleep(800);

    // 1.1 Laptop Viewport 1366x768
    await login.setViewport(1366, 768);
    const loginLaptopMetrics = await login.evaluate(`return {
      headerHeight: document.querySelector('.cookmate-auth__nav')?.offsetHeight,
      headerWrapWidth: document.querySelector('.cookmate-auth__nav')?.offsetWidth,
      hasTabs: !!document.querySelector('.cookmate-auth__tabs'),
      titleText: document.querySelector('.auth-title')?.textContent.trim(),
      hasPhoText: !!document.querySelector('.pho-brand-text text'),
      phoBrandText: document.querySelector('.pho-brand-text text')?.textContent.trim(),
      hasDeepBowl: !!document.querySelector('path[d^="M 75 145"]'),
      hasBaseRing: !!document.querySelector('path[d^="M 166 288"]'),
      hasChopsticks: !!document.getElementById('phoChopsticks'),
      hasGoogleBtn: !!document.getElementById('btnGoogleAuth'),
      hasFacebookBtn: !!document.getElementById('btnFacebookAuth'),
      hasDemoCards: document.querySelectorAll('.auth-demo-card').length,
      hasRegisterLink: !!document.querySelector('a[href*="register.html"]'),
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    };`);

    console.log('Login Page Metrics on 1366x768:', loginLaptopMetrics);
    results.push({
      test: 'Login Page: Không còn Tabs (Lỗi 4)',
      pass: loginLaptopMetrics.hasTabs === false
    });
    results.push({
      test: 'Login Page: Bát phở sâu lòng có chân đế sứ (Lỗi 1)',
      pass: loginLaptopMetrics.hasDeepBowl && loginLaptopMetrics.hasBaseRing
    });
    results.push({
      test: 'Login Page: In chữ "PHỞ HÀ NỘI" trên mặt bát (Lỗi 2)',
      pass: loginLaptopMetrics.phoBrandText === 'PHỞ HÀ NỘI'
    });
    results.push({
      test: 'Login Page: Header cao 60px căn lề chuẩn (Lỗi 7)',
      pass: loginLaptopMetrics.headerHeight === 60
    });
    results.push({
      test: 'Login Page: Nút tiếp tục Google & Facebook (Lỗi 5)',
      pass: loginLaptopMetrics.hasGoogleBtn && loginLaptopMetrics.hasFacebookBtn
    });

    await login.screenshot('auth_v2_login_laptop_1366.png');

    // 1.2 Test Noodle Lifting Interaction (Lỗi 3)
    console.log('\n--- [TEST 1.2] PHO INTERACTION & NOODLE ATTACHMENT ---');
    const initialNoodleOpacity = await login.evaluate(`
      return window.getComputedStyle(document.getElementById('liftedNoodles')).opacity;
    `);
    console.log('Resting noodle opacity (expected ~0):', initialNoodleOpacity);

    // Click Bát phở to lift noodles
    await login.evaluate(`document.getElementById('phoStage').click();`);
    await sleep(800);

    const liftedMetrics = await login.evaluate(`return {
      isLiftedClass: document.getElementById('phoStage').classList.contains('is-lifted'),
      liftedNoodleOpacity: window.getComputedStyle(document.getElementById('liftedNoodles')).opacity,
      ctaText: document.getElementById('phoCta')?.textContent.trim()
    };`);
    console.log('Lifted metrics:', liftedMetrics);
    results.push({
      test: 'Pho Interaction: Nhấc đũa kéo sợi phở (Lỗi 3)',
      pass: liftedMetrics.isLiftedClass && parseFloat(liftedMetrics.liftedNoodleOpacity) > 0.8
    });
    await login.screenshot('auth_v2_login_laptop_lifted.png');

    // 1.3 Test Google & Facebook Toast Notification (Lỗi 5)
    console.log('\n--- [TEST 1.3] GOOGLE & FACEBOOK BUTTON FEEDBACK ---');
    await login.evaluate(`document.getElementById('btnGoogleAuth').click();`);
    await sleep(200);
    const googleToastText = await login.evaluate(`
      const msgs = document.querySelectorAll('.toast-message');
      return msgs.length > 0 ? msgs[msgs.length - 1].textContent.trim() : '';
    `);
    console.log('Google click toast message:', googleToastText);
    results.push({
      test: 'Social Auth: Thông báo trung thực khi nhấn Google (Lỗi 5)',
      pass: googleToastText && googleToastText.includes('Google') && googleToastText.includes('đang được phát triển')
    });

    // Clear toasts
    await login.evaluate(`document.querySelectorAll('.toast').forEach(t => t.remove());`);
    await sleep(100);

    await login.evaluate(`document.getElementById('btnFacebookAuth').click();`);
    await sleep(200);
    const fbToastText = await login.evaluate(`
      const msgs = document.querySelectorAll('.toast-message');
      return msgs.length > 0 ? msgs[msgs.length - 1].textContent.trim() : '';
    `);
    console.log('Facebook click toast message:', fbToastText);
    results.push({
      test: 'Social Auth: Thông báo trung thực khi nhấn Facebook (Lỗi 5)',
      pass: fbToastText && fbToastText.includes('Facebook') && fbToastText.includes('đang được phát triển')
    });

    // 1.4 Test Password Eye Toggle
    console.log('\n--- [TEST 1.4] PASSWORD EYE TOGGLE ---');
    const pwTypeInitial = await login.evaluate(`return document.getElementById('loginPassword').type;`);
    await login.evaluate(`document.querySelector('.password-toggle-btn[data-target="loginPassword"]').click();`);
    const pwTypeToggled = await login.evaluate(`return document.getElementById('loginPassword').type;`);
    await login.evaluate(`document.querySelector('.password-toggle-btn[data-target="loginPassword"]').click();`);
    const pwTypeRestored = await login.evaluate(`return document.getElementById('loginPassword').type;`);
    results.push({
      test: 'Password Toggle: Ẩn/hiện mật khẩu',
      pass: pwTypeInitial === 'password' && pwTypeToggled === 'text' && pwTypeRestored === 'password'
    });

    // 1.5 Test 1-Click Demo Account Quick Fill
    console.log('\n--- [TEST 1.5] 1-CLICK DEMO ACCOUNT ---');
    await login.evaluate(`document.querySelector('.auth-demo-card[data-email="admin@cookmate.vn"]').click();`);
    await sleep(200);
    const filledValues = await login.evaluate(`return {
      email: document.getElementById('loginEmail').value,
      pass: document.getElementById('loginPassword').value
    };`);
    console.log('Filled demo credentials:', filledValues);
    results.push({
      test: 'Demo Accounts: 1-Click điền tài khoản mẫu',
      pass: filledValues.email === 'admin@cookmate.vn' && filledValues.pass === 'admin123'
    });

    // 1.6 Test Form Validation on Wrong Password
    console.log('\n--- [TEST 1.6] LOGIN ERROR HANDLING ---');
    await login.evaluate(`
      document.getElementById('loginPassword').value = 'wrongpass';
      document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(600);
    const loginErrorText = await login.evaluate(`
      return document.getElementById('loginPasswordError')?.textContent.trim();
    `);
    console.log('Login error message on wrong password:', loginErrorText);
    results.push({
      test: 'Login Validation: Báo lỗi khi sai mật khẩu',
      pass: loginErrorText.includes('không chính xác') || loginErrorText.includes('không đúng')
    });

    // 1.7 Mobile Viewports Test on Login (Lỗi 8)
    console.log('\n--- [TEST 1.7] MOBILE VIEWPORTS (0% HORIZONTAL OVERFLOW) ---');
    const mobileSizes = [
      { name: 'iPhone SE (375x667)', w: 375, h: 667 },
      { name: 'Android Small (360x800)', w: 360, h: 800 },
      { name: 'iPhone 14 (390x844)', w: 390, h: 844 },
      { name: 'iPhone 15 Pro Max (430x932)', w: 430, h: 932 },
      { name: 'iPad Portrait (768x1024)', w: 768, h: 1024 }
    ];

    for (const size of mobileSizes) {
      await login.setViewport(size.w, size.h, true);
      const overflow = await login.evaluate(`return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };`);
      console.log(`  ${size.name}: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`);
      results.push({
        test: `Mobile Responsive (${size.name}): 0% tràn ngang (Lỗi 8)`,
        pass: overflow.hasHorizontalScroll === false
      });
      if (size.w === 375) await login.screenshot('auth_v2_login_mobile_375.png');
      if (size.w === 430) await login.screenshot('auth_v2_login_mobile_430.png');
    }

    login.ws.close();

    // =========================================================================
    // TEST PART 2: REGISTER.HTML
    // =========================================================================
    console.log('\n--- [TEST 2] REGISTER PAGE: pages/auth/register.html ---');
    const reg = await createPage('http://localhost:8089/pages/auth/register.html');
    await sleep(800);

    await reg.setViewport(1366, 768);
    const regMetrics = await reg.evaluate(`return {
      hasTabs: !!document.querySelector('.cookmate-auth__tabs'),
      titleText: document.querySelector('.auth-title')?.textContent.trim(),
      hasName: !!document.getElementById('regName'),
      hasEmail: !!document.getElementById('regEmail'),
      hasPassword: !!document.getElementById('regPassword'),
      hasConfirm: !!document.getElementById('regConfirm'),
      hasTerms: !!document.getElementById('regTerms'),
      hasStrengthBars: document.querySelectorAll('.auth-strength-seg').length,
      hasGoogleBtn: !!document.getElementById('btnGoogleAuth'),
      hasFacebookBtn: !!document.getElementById('btnFacebookAuth'),
      hasLoginLink: !!document.querySelector('a[href*="login.html"]'),
      headerHeight: document.querySelector('.cookmate-auth__nav')?.offsetHeight,
      phoBrandText: document.querySelector('.pho-brand-text text')?.textContent.trim()
    };`);

    console.log('Register Page Metrics on 1366x768:', regMetrics);
    results.push({
      test: 'Register Page: Không còn Tabs (Lỗi 4)',
      pass: regMetrics.hasTabs === false
    });
    results.push({
      test: 'Register Page: Đầy đủ các trường form đăng ký',
      pass: regMetrics.hasName && regMetrics.hasEmail && regMetrics.hasPassword && regMetrics.hasConfirm && regMetrics.hasTerms
    });
    results.push({
      test: 'Register Page: In chữ "PHỞ HÀ NỘI" trên mặt bát (Lỗi 2)',
      pass: regMetrics.phoBrandText === 'PHỞ HÀ NỘI'
    });
    results.push({
      test: 'Register Page: Header cao 60px căn lề chuẩn (Lỗi 7)',
      pass: regMetrics.headerHeight === 60
    });
    results.push({
      test: 'Register Page: Nút tiếp tục Google & Facebook (Lỗi 5)',
      pass: regMetrics.hasGoogleBtn && regMetrics.hasFacebookBtn
    });

    await reg.screenshot('auth_v2_register_laptop_1366.png');

    // 2.2 Password Strength Meter Test
    console.log('\n--- [TEST 2.2] PASSWORD STRENGTH METER ---');
    await reg.evaluate(`
      const inp = document.getElementById('regPassword');
      inp.value = '123';
      inp.dispatchEvent(new Event('input'));
    `);
    const weakState = await reg.evaluate(`return {
      activeSegs: document.querySelectorAll('.auth-strength-seg.active-weak').length,
      text: document.getElementById('strengthText')?.textContent.trim()
    };`);
    console.log('Weak password test (123):', weakState);

    await reg.evaluate(`
      const inp = document.getElementById('regPassword');
      inp.value = 'PhoHanoi2026!@#';
      inp.dispatchEvent(new Event('input'));
    `);
    const strongState = await reg.evaluate(`return {
      activeSegs: document.querySelectorAll('.auth-strength-seg[class*="active-"]').length,
      text: document.getElementById('strengthText')?.textContent.trim()
    };`);
    console.log('Strong password test (PhoHanoi2026!@#):', strongState);

    results.push({
      test: 'Password Strength: Thanh đo độ mạnh phản hồi chính xác',
      pass: weakState.activeSegs >= 1 && strongState.activeSegs === 4
    });

    // 2.3 Mobile Viewports Test on Register (Lỗi 8)
    console.log('\n--- [TEST 2.3] REGISTER MOBILE VIEWPORTS (0% HORIZONTAL OVERFLOW) ---');
    for (const size of mobileSizes) {
      await reg.setViewport(size.w, size.h, true);
      const overflow = await reg.evaluate(`return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };`);
      console.log(`  Register ${size.name}: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`);
      results.push({
        test: `Register Mobile Responsive (${size.name}): 0% tràn ngang (Lỗi 8)`,
        pass: overflow.hasHorizontalScroll === false
      });
      if (size.w === 375) await reg.screenshot('auth_v2_register_mobile_375.png');
    }

    reg.ws.close();

  } finally {
    chrome.kill();
  }

  console.log('\n=====================================================');
  console.log('             AUTOMATED TEST SUMMARY REPORT           ');
  console.log('=====================================================');
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

runTests().catch(err => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
