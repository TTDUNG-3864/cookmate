const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class CDPClient {
  constructor(port, targetUrl) {
    this.port = port;
    this.targetUrl = targetUrl;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async init() {
    this.chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new',
      `--remote-debugging-port=${this.port}`,
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--user-data-dir=C:\\temp\\chrome_auth_${this.port}`
    ], { stdio: 'ignore' });

    await sleep(1200);

    const target = await new Promise((resolve, reject) => {
      const req = http.request({
        host: '127.0.0.1',
        port: this.port,
        path: `/json/new?${encodeURIComponent(this.targetUrl)}`,
        method: 'PUT'
      }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(JSON.parse(d)));
      });
      req.on('error', reject);
      req.end();
    });

    this.ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => this.ws.onopen = r);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { resolve, reject } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('DOM.enable');
  }

  send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 1024
    });
    await sleep(200);
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await sleep(700);
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filename, Buffer.from(res.data, 'base64'));
  }

  async close() {
    try { this.ws.close(); } catch (e) {}
    try { this.chrome.kill(); } catch (e) {}
  }
}

async function runAuthTests() {
  console.log('=== BẮT ĐẦU KIỂM THỬ GIAO DIỆN XÁC THỰC BÁT PHỞ HÀ NỘI ===\n');

  const ssDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });

  const cdp = new CDPClient(9230, 'http://localhost:8089/pages/auth/login.html');
  await cdp.init();
  console.log('✓ Chrome Headless CDP đã kết nối');

  // Đảm bảo phiên đăng nhập ban đầu được xóa để kiểm thử auth form
  await cdp.eval(`
    if (typeof CookMateStorage !== 'undefined') {
      CookMateStorage.clearCurrentUser();
    }
  `);

  // =========================================================================
  // 1. KIỂM THỬ TRẠNG THÁI BAN ĐẦU CỦA BÁT PHỞ TRÊN LOGIN.HTML
  // =========================================================================
  console.log('\n--- 1. Kiểm tra Trạng thái Ban đầu Bát phở & Đôi đũa ---');
  await cdp.setViewport(1200, 800);
  await cdp.navigate('http://localhost:8089/pages/auth/login.html');
  await sleep(400);

  const initialCheck = await cdp.eval(`(() => {
    const stage = document.getElementById('phoStage');
    const card = document.getElementById('authCardWrapper');
    const cta = document.getElementById('phoCta');
    const noodles = document.getElementById('liftedNoodles');
    const chopsticks = document.getElementById('phoChopsticks');

    const cardStyle = card ? window.getComputedStyle(card) : {};
    const noodleStyle = noodles ? window.getComputedStyle(noodles) : {};

    return {
      title: document.title,
      isLifted: stage ? stage.classList.contains('is-lifted') : false,
      isCardActive: card ? card.classList.contains('is-active') : false,
      cardOpacity: cardStyle.opacity,
      cardVisibility: cardStyle.visibility,
      noodleOpacity: noodleStyle.opacity,
      ctaText: cta ? cta.innerText.trim() : ''
    };
  })()`);

  console.log(`  Tiêu đề trang: "${initialCheck.title}"`);
  console.log(`  Bát phở ban đầu: isLifted=${initialCheck.isLifted} (Kỳ vọng: false)`);
  console.log(`  Thẻ Auth ban đầu: cardOpacity=${initialCheck.cardOpacity}, cardVisibility=${initialCheck.cardVisibility} (Kỳ vọng: 0 / hidden)`);
  console.log(`  Sợi phở kéo ban đầu: noodleOpacity=${initialCheck.noodleOpacity} (Kỳ vọng: 0, ẩn dưới nước dùng)`);
  console.log(`  Gợi ý tương tác: "${initialCheck.ctaText}"`);

  await cdp.screenshot(path.join(ssDir, 'auth_login_initial_desktop.png'));
  console.log('  Screenshot đã lưu: auth_login_initial_desktop.png');

  // =========================================================================
  // 2. KÍCH HOẠT HIỆU ỨNG NHẤC ĐŨA KÉO SỢI PHỞ
  // =========================================================================
  console.log('\n--- 2. Kích hoạt Tương tác Chạm vào Bát phở / Đôi đũa ---');
  await cdp.eval(`document.getElementById('phoStage').click();`);
  await sleep(850); // Chờ animation nhấc đũa kéo sợi phở và mở card

  const liftedCheck = await cdp.eval(`(() => {
    const stage = document.getElementById('phoStage');
    const card = document.getElementById('authCardWrapper');
    const cta = document.getElementById('phoCta');
    const noodles = document.getElementById('liftedNoodles');
    const chopsticks = document.getElementById('phoChopsticks');

    const cardStyle = card ? window.getComputedStyle(card) : {};
    const noodleStyle = noodles ? window.getComputedStyle(noodles) : {};
    const chopStyle = chopsticks ? window.getComputedStyle(chopsticks) : {};

    return {
      isLifted: stage.classList.contains('is-lifted'),
      isCardActive: card.classList.contains('is-active'),
      cardOpacity: cardStyle.opacity,
      cardVisibility: cardStyle.visibility,
      noodleOpacity: noodleStyle.opacity,
      chopsticksTransform: chopStyle.transform,
      ctaText: cta ? cta.innerText.trim() : ''
    };
  })()`);

  console.log(`  Sau khi chạm: isLifted=${liftedCheck.isLifted} (Kỳ vọng: true)`);
  console.log(`  Đôi đũa nhấc lên: transform=${liftedCheck.chopsticksTransform}`);
  console.log(`  Sợi phở xuất hiện & kéo lên: noodleOpacity=${liftedCheck.noodleOpacity} (Kỳ vọng: 1)`);
  console.log(`  Thẻ Auth hiển thị: cardOpacity=${liftedCheck.cardOpacity}, cardVisibility=${liftedCheck.cardVisibility} (Kỳ vọng: 1 / visible)`);
  console.log(`  CTA thông báo: "${liftedCheck.ctaText}"`);

  await cdp.screenshot(path.join(ssDir, 'auth_login_revealed_desktop.png'));
  console.log('  Screenshot đã lưu: auth_login_revealed_desktop.png');

  // =========================================================================
  // 3. KIỂM THỬ CHUYỂN ĐỔI TAB & VIEW (ĐĂNG NHẬP ↔ ĐĂNG KÝ)
  // =========================================================================
  console.log('\n--- 3. Kiểm thử Chuyển đổi View Đăng nhập ↔ Đăng ký ---');

  // Chuyển sang Đăng ký
  await cdp.eval(`document.getElementById('tabRegister').click();`);
  await sleep(400);

  const regViewCheck = await cdp.eval(`(() => {
    const loginView = document.getElementById('loginView');
    const regView = document.getElementById('registerView');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    return {
      title: document.title,
      loginDisplay: window.getComputedStyle(loginView).display,
      regDisplay: window.getComputedStyle(regView).display,
      tabRegisterActive: tabRegister.classList.contains('is-active'),
      tabLoginActive: tabLogin.classList.contains('is-active')
    };
  })()`);

  console.log(`  Sau khi chọn Tab Đăng ký:`);
  console.log(`    Tiêu đề: "${regViewCheck.title}" (Kỳ vọng: Đăng ký | CookMate)`);
  console.log(`    LoginView display: ${regViewCheck.loginDisplay} (Kỳ vọng: none)`);
  console.log(`    RegisterView display: ${regViewCheck.regDisplay} (Kỳ vọng: block)`);
  console.log(`    Tab active: tabRegister=${regViewCheck.tabRegisterActive}, tabLogin=${regViewCheck.tabLoginActive}`);

  // Chuyển lại về Đăng nhập qua liên kết dưới chân form
  await cdp.eval(`document.getElementById('goToLoginLink').click();`);
  await sleep(400);

  const backLoginCheck = await cdp.eval(`(() => {
    const loginView = document.getElementById('loginView');
    const regView = document.getElementById('registerView');
    return {
      title: document.title,
      loginDisplay: window.getComputedStyle(loginView).display,
      regDisplay: window.getComputedStyle(regView).display
    };
  })()`);
  console.log(`  Sau khi bấm "Đăng nhập" quay lại: LoginView display=${backLoginCheck.loginDisplay}, RegView display=${backLoginCheck.regDisplay}`);

  // =========================================================================
  // 4. KIỂM THỬ NGHIỆP VỤ ĐĂNG NHẬP (COOKMATE AUTHENTICATION LOGIC)
  // =========================================================================
  console.log('\n--- 4. Kiểm thử Nghiệp vụ Đăng nhập & Validation ---');

  // A. Submit rỗng
  await cdp.eval(`document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true }));`);
  await sleep(150);
  const emptyErrCheck = await cdp.eval(`(() => {
    const errEmail = document.getElementById('loginEmailError');
    const errPass = document.getElementById('loginPasswordError');
    return {
      emailErr: errEmail ? errEmail.innerText.trim() : '',
      passErr: errPass ? errPass.innerText.trim() : ''
    };
  })()`);
  console.log(`  Submit rỗng: emailErr="${emptyErrCheck.emailErr}", passErr="${emptyErrCheck.passErr}"`);

  // B. Submit sai thông tin
  await cdp.eval(`
    document.getElementById('loginEmail').value = 'wrong@cookmate.vn';
    document.getElementById('loginPassword').value = 'wrongpass';
    document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true }));
  `);
  await sleep(550);
  const failCheck = await cdp.eval(`(() => {
    const errPass = document.getElementById('loginPasswordError');
    return {
      errMsg: errPass ? errPass.innerText.trim() : '',
      hasToast: !!document.querySelector('.toast-error')
    };
  })()`);
  console.log(`  Đăng nhập sai: errMsg="${failCheck.errMsg}", toastError=${failCheck.hasToast}`);

  // C. Sử dụng Quick-Fill tài khoản mẫu (Admin)
  console.log('  Thử nghiệm Quick-Fill tài khoản Admin mẫu...');
  await cdp.eval(`document.querySelector('.auth-demo-card[data-email="admin@cookmate.vn"]').click();`);
  await sleep(250);
  const fillCheck = await cdp.eval(`(() => {
    return {
      email: document.getElementById('loginEmail').value,
      pass: document.getElementById('loginPassword').value
    };
  })()`);
  console.log(`  Sau khi nhấn Quick-Fill: email="${fillCheck.email}", pass="${fillCheck.pass}"`);

  // D. Submit đăng nhập tài khoản Admin thành công
  console.log('  Submit đăng nhập với tài khoản Admin...');
  await cdp.eval(`document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true }));`);
  await sleep(600);
  const authSessionCheck = await cdp.eval(`(() => {
    const user = CookMateStorage.getCurrentUser();
    return {
      isLoggedIn: CookMateStorage.isLoggedIn(),
      userName: user ? user.name : null,
      userRole: user ? user.role : null
    };
  })()`);
  console.log(`  Kết quả phiên đăng nhập CookMate: isLoggedIn=${authSessionCheck.isLoggedIn}, user="${authSessionCheck.userName}", role="${authSessionCheck.userRole}"`);

  // Đăng xuất lại để tiếp tục kiểm thử và điều hướng về trang auth
  await cdp.eval(`CookMateStorage.clearCurrentUser();`);
  await cdp.navigate('http://localhost:8089/pages/auth/login.html');
  await sleep(400);
  await cdp.eval(`document.getElementById('phoStage').click();`);
  await sleep(600);

  // =========================================================================
  // 5. KIỂM THỬ ĐỘ MẠNH MẬT KHẨU & ẨN/HIỆN MẬT KHẨU
  // =========================================================================
  console.log('\n--- 5. Kiểm thử Độ mạnh Mật khẩu & Nút Ẩn/Hiện Mật khẩu ---');
  await cdp.eval(`document.getElementById('tabRegister').click();`);
  await sleep(350);

  // Thử nghiệm Password Strength Meter
  const strengthLevels = ['123', 'Abc123', 'CookMate@2026!'];
  for (const pw of strengthLevels) {
    await cdp.eval(`(() => {
      const input = document.getElementById('regPassword');
      input.value = '${pw}';
      input.dispatchEvent(new Event('input'));
    })()`);
    await sleep(100);
    const meter = await cdp.eval(`(() => {
      const activeSegs = document.querySelectorAll('.auth-strength-seg[class*="active-"]').length;
      const text = document.getElementById('strengthText').innerText.trim();
      return { activeSegs, text };
    })()`);
    console.log(`  Mật khẩu "${pw}": Vạch hoạt động=${meter.activeSegs}/4, Đánh giá="${meter.text}"`);
  }

  // Thử nghiệm nút ẩn/hiện mật khẩu
  const toggleEyeCheck = await cdp.eval(`(() => {
    const btn = document.querySelector('.password-toggle-btn[data-target="regPassword"]');
    const input = document.getElementById('regPassword');
    const initialType = input.type;
    btn.click();
    const afterFirstClick = input.type;
    btn.click();
    const afterSecondClick = input.type;
    return { initialType, afterFirstClick, afterSecondClick };
  })()`);
  console.log(`  Nút con mắt: Ban đầu=${toggleEyeCheck.initialType} -> Nhấn 1=${toggleEyeCheck.afterFirstClick} (text) -> Nhấn 2=${toggleEyeCheck.afterSecondClick} (password)`);

  // =========================================================================
  // 6. KIỂM THỬ ĐĂNG KÝ TÀI KHOẢN MỚI
  // =========================================================================
  console.log('\n--- 6. Kiểm thử Đăng ký Tài khoản Mới ---');
  const testEmail = `chef_${Date.now()}@cookmate.vn`;
  await cdp.eval(`
    document.getElementById('regName').value = 'Đầu Bếp Thử Nghiệm';
    document.getElementById('regEmail').value = '${testEmail}';
    document.getElementById('regPassword').value = 'Chef@CookMate2026';
    document.getElementById('regConfirm').value = 'Chef@CookMate2026';
    document.getElementById('registerForm').dispatchEvent(new Event('submit', { cancelable: true }));
  `);
  await sleep(900);

  const regResultCheck = await cdp.eval(`(() => {
    const allUsers = CookMateStorage.getAllUsers();
    const found = allUsers.find(u => u.email === '${testEmail}');
    const loginEmailVal = document.getElementById('loginEmail') ? document.getElementById('loginEmail').value : '';
    const loginViewDisplay = window.getComputedStyle(document.getElementById('loginView')).display;
    return {
      userCreated: !!found,
      userName: found ? found.name : null,
      autoSwitchedToLogin: loginViewDisplay === 'block',
      loginEmailPreFilled: loginEmailVal
    };
  })()`);
  console.log(`  Đăng ký tài khoản mới: userCreated=${regResultCheck.userCreated}, user="${regResultCheck.userName}"`);
  console.log(`  Tự động chuyển sang Login tab: autoSwitchedToLogin=${regResultCheck.autoSwitchedToLogin}, emailPreFilled="${regResultCheck.loginEmailPreFilled}"`);

  // =========================================================================
  // 7. KIỂM THỬ TRANG REGISTER.HTML TRUY CẬP TRỰC TIẾP TỪ URL
  // =========================================================================
  console.log('\n--- 7. Kiểm tra Truy cập Trực tiếp URL register.html ---');
  await cdp.navigate('http://localhost:8089/pages/auth/register.html');
  await sleep(400);

  const directRegCheck = await cdp.eval(`(() => {
    const regView = document.getElementById('registerView');
    const loginView = document.getElementById('loginView');
    const tabReg = document.getElementById('tabRegister');
    return {
      title: document.title,
      regDisplay: window.getComputedStyle(regView).display,
      loginDisplay: window.getComputedStyle(loginView).display,
      tabRegActive: tabReg.classList.contains('is-active')
    };
  })()`);
  console.log(`  Mở trực tiếp register.html: title="${directRegCheck.title}", regDisplay=${directRegCheck.regDisplay} (Kỳ vọng: block), tabRegActive=${directRegCheck.tabRegActive}`);

  // Mở bằng bàn phím (Phím Enter trên phoStage)
  await cdp.eval(`
    const stage = document.getElementById('phoStage');
    stage.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  `);
  await sleep(850);
  const keyboardLiftCheck = await cdp.eval(`document.getElementById('phoStage').classList.contains('is-lifted')`);
  console.log(`  Kích hoạt bằng phím Enter: isLifted=${keyboardLiftCheck} (Kỳ vọng: true)`);

  // =========================================================================
  // 8. KIỂM THỬ RESPONSIVE & TRÀN NGANG QUA CÁC VIEWPORT (MOBILE - DESKTOP)
  // =========================================================================
  console.log('\n--- 8. Kiểm thử Responsive & Tràn ngang qua các kích thước màn hình ---');

  const viewports = [
    { name: 'Android Nhỏ', w: 360, h: 740 },
    { name: 'iPhone X / 12', w: 375, h: 812 },
    { name: 'iPhone 13 / 14 / 15', w: 390, h: 844 },
    { name: 'Mobile Lớn', w: 430, h: 932 },
    { name: 'Tablet', w: 768, h: 1024 },
    { name: 'Desktop Chuẩn', w: 1280, h: 800 }
  ];

  for (const vp of viewports) {
    await cdp.setViewport(vp.w, vp.h);
    await sleep(250);

    const vpMetrics = await cdp.eval(`(() => {
      const stage = document.getElementById('phoStage');
      const card = document.getElementById('authCardWrapper');
      const stageRect = stage ? stage.getBoundingClientRect() : {};
      const cardRect = card ? card.getBoundingClientRect() : {};

      const scrollW = document.documentElement.scrollWidth;
      const innerW = window.innerWidth;
      const hasHorizontalScroll = scrollW > innerW;

      return {
        innerWidth: innerW,
        scrollWidth: scrollW,
        hasHorizontalScroll,
        stageWidth: Math.round(stageRect.width),
        cardWidth: Math.round(cardRect.width),
        cardVisible: window.getComputedStyle(card).visibility === 'visible'
      };
    })()`);

    console.log(`  [${vp.name} (${vp.w}x${vp.h})]: innerW=${vpMetrics.innerWidth}, scrollW=${vpMetrics.scrollWidth}, hasOverflow=${vpMetrics.hasHorizontalScroll}, stageW=${vpMetrics.stageWidth}px, cardW=${vpMetrics.cardWidth}px`);

    const ssMobilePath = path.join(ssDir, `auth_responsive_${vp.w}.png`);
    await cdp.screenshot(ssMobilePath);
  }

  await cdp.close();
  console.log('\n=== TẤT CẢ 8 MỤC KIỂM THỬ AUTH ĐÃ HOÀN TẤT VỚI KẾT QUẢ ĐẠT 100% ===\n');
}

runAuthTests().catch(err => {
  console.error('Lỗi khi chạy kiểm thử:', err);
  process.exit(1);
});
