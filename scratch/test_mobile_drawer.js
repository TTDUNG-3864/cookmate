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
      `--user-data-dir=C:\\temp\\chrome_drawer_${this.port}`
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
    await sleep(250);
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filename, buffer);
  }

  async close() {
    try {
      this.ws.close();
    } catch (e) {}
    try {
      this.chrome.kill();
    } catch (e) {}
  }
}

async function runTests() {
  const cdp = new CDPClient(9226, 'http://localhost:8089/index.html');
  await cdp.init();
  console.log('✓ Chrome Headless CDP connected');

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Kiểm tra trên nhiều viewport
  const viewports = [
    { name: 'Android 360', w: 360, h: 740 },
    { name: 'iPhone 375', w: 375, h: 812 },
    { name: 'iPhone 390', w: 390, h: 844 },
    { name: 'Large Mobile 430', w: 430, h: 932 },
    { name: 'Tablet 768', w: 768, h: 1024 }
  ];

  for (const vp of viewports) {
    console.log(`\n--- Kiểm tra Viewport: ${vp.name} (${vp.w}x${vp.h}) ---`);
    await cdp.setViewport(vp.w, vp.h);

    // Kiểm tra tràn ngang ban đầu
    const initialOverflow = await cdp.eval(`(() => {
      return {
        windowWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
    console.log(`  Ban đầu (Menu đóng): scrollWidth=${initialOverflow.scrollWidth}, innerWidth=${initialOverflow.windowWidth}, hasHorizontalScroll=${initialOverflow.hasHorizontalScroll}`);

    // Mở menu
    await cdp.eval(`document.getElementById('menuToggle').click();`);
    await sleep(400); // Đợi kết thúc CSS transition 320ms

    // Kiểm tra trạng thái và kích thước sau khi mở
    const state = await cdp.eval(`(() => {
      const nav = document.getElementById('mobileNav');
      const overlay = document.getElementById('mobileNavOverlay');
      const navRect = nav ? nav.getBoundingClientRect() : null;
      const overlayRect = overlay ? overlay.getBoundingClientRect() : null;
      const header = document.getElementById('siteHeader');
      const headerRect = header ? header.getBoundingClientRect() : null;

      const bodyOverflow = window.getComputedStyle(document.body).overflow;
      const htmlOverflow = window.getComputedStyle(document.documentElement).overflow;

      return {
        isOpen: nav ? nav.classList.contains('is-open') : false,
        overlayVisible: overlay ? overlay.classList.contains('is-visible') : false,
        bodyOverflow,
        htmlOverflow,
        navRect: navRect ? {
          top: Math.round(navRect.top),
          right: Math.round(navRect.right),
          bottom: Math.round(navRect.bottom),
          left: Math.round(navRect.left),
          width: Math.round(navRect.width),
          height: Math.round(navRect.height)
        } : null,
        overlayRect: overlayRect ? {
          top: Math.round(overlayRect.top),
          left: Math.round(overlayRect.left),
          width: Math.round(overlayRect.width),
          height: Math.round(overlayRect.height)
        } : null,
        headerHeight: headerRect ? Math.round(headerRect.height) : 0,
        links: [...document.querySelectorAll('.mobile-nav__link')].map(l => l.innerText.replace(/\\s+/g, ' ').trim())
      };
    })()`);

    console.log(`  Menu mở: isOpen=${state.isOpen}, overlayVisible=${state.overlayVisible}`);
    console.log(`  Khóa cuộn trang: body.overflow=${state.bodyOverflow}, html.overflow=${state.htmlOverflow}`);
    console.log(`  Nav Rect: top=${state.navRect.top}, right=${state.navRect.right}, width=${state.navRect.width}, height=${state.navRect.height} (Kỳ vọng: full height ${vp.h}px, bám sát cạnh phải right=${vp.w}px)`);
    console.log(`  Overlay Rect: width=${state.overlayRect.width}, height=${state.overlayRect.height} (Kỳ vọng: full screen ${vp.w}x${vp.h})`);
    console.log(`  Header height=${state.headerHeight}px (Drawer không bị giới hạn bởi header)`);
    console.log(`  Số liên kết trong Menu: ${state.links.length}`);

    // Chụp ảnh bằng chứng
    const ssPath = path.join(screenshotsDir, `menu_open_${vp.w}.png`);
    await cdp.screenshot(ssPath);
    console.log(`  Screenshot saved: ${ssPath}`);

    // Đóng menu bằng nút X
    await cdp.eval(`document.getElementById('mobileNavClose').click();`);
    await sleep(400);

    const closedState = await cdp.eval(`(() => {
      const nav = document.getElementById('mobileNav');
      const overlay = document.getElementById('mobileNavOverlay');
      return {
        isOpen: nav ? nav.classList.contains('is-open') : false,
        overlayVisible: overlay ? overlay.classList.contains('is-visible') : false,
        bodyOverflow: window.getComputedStyle(document.body).overflow
      };
    })()`);
    console.log(`  Sau khi nhấn nút X: isOpen=${closedState.isOpen}, overlayVisible=${closedState.overlayVisible}, body.overflow=${closedState.bodyOverflow}`);
  }

  // 2. Kiểm tra đóng bằng Overlay và bằng Escape
  console.log('\n--- Kiểm tra đóng menu bằng Overlay & Phím Escape ---');
  await cdp.setViewport(375, 812);

  // Mở -> Click overlay
  await cdp.eval(`document.getElementById('menuToggle').click();`);
  await sleep(400);
  await cdp.eval(`document.getElementById('mobileNavOverlay').click();`);
  await sleep(400);
  const overlayCloseState = await cdp.eval(`document.getElementById('mobileNav').classList.contains('is-open')`);
  console.log(`  Đóng bằng chạm Overlay: ${!overlayCloseState ? 'THÀNH CÔNG (Menu đã đóng)' : 'THẤT BÀI'}`);

  // Mở -> Bấm Escape
  await cdp.eval(`document.getElementById('menuToggle').click();`);
  await sleep(400);
  await cdp.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));`);
  await sleep(400);
  const escCloseState = await cdp.eval(`document.getElementById('mobileNav').classList.contains('is-open')`);
  console.log(`  Đóng bằng phím Escape: ${!escCloseState ? 'THÀNH CÔNG (Menu đã đóng)' : 'THẤT BÀI'}`);

  // 3. Kiểm tra các trạng thái Tài khoản: Guest -> Member -> Admin
  console.log('\n--- Kiểm tra trạng thái Tài khoản trong Menu Di động ---');
  
  // Trạng thái Guest
  await cdp.eval(`
    CookMateStorage.clearCurrentUser();
    Navigation.updateAuthArea();
    document.getElementById('menuToggle').click();
  `);
  await sleep(400);
  const guestState = await cdp.eval(`(() => {
    const guestCard = document.querySelector('.mobile-guest-card');
    const authLinks = [...document.querySelectorAll('#mobileAuthArea a')].map(a => a.innerText.replace(/\\s+/g, ' ').trim());
    return {
      hasGuestCard: !!guestCard,
      authLinks
    };
  })()`);
  console.log(`  Guest: hasGuestCard=${guestState.hasGuestCard}, authButtons=${guestState.authLinks.join(' | ')}`);

  // Trạng thái Member
  await cdp.eval(`
    CookMateStorage.setCurrentUser({ id: 2, name: 'Trần Hương Giang', email: 'giang@cookmate.vn', role: 'member' });
    Navigation.updateAuthArea();
  `);
  await sleep(200);
  const memberState = await cdp.eval(`(() => {
    const userCard = document.querySelector('.mobile-user-card');
    const userName = document.querySelector('.mobile-user-name');
    const links = [...document.querySelectorAll('#mobileAuthArea .mobile-nav__link')].map(a => a.innerText.replace(/\\s+/g, ' ').trim());
    return {
      hasUserCard: !!userCard,
      userName: userName ? userName.innerText : '',
      links
    };
  })()`);
  console.log(`  Member: hasUserCard=${memberState.hasUserCard}, user=${memberState.userName}, items=${memberState.links.join(' | ')}`);
  await cdp.screenshot(path.join(screenshotsDir, 'menu_member_375.png'));

  // Trạng thái Admin
  await cdp.eval(`
    CookMateStorage.setCurrentUser({ id: 1, name: 'Nguyễn Văn Admin', email: 'admin@cookmate.vn', role: 'admin' });
    Navigation.updateAuthArea();
  `);
  await sleep(200);
  const adminState = await cdp.eval(`(() => {
    const userCard = document.querySelector('.mobile-user-card');
    const userName = document.querySelector('.mobile-user-name');
    const userRole = document.querySelector('.mobile-user-role');
    const links = [...document.querySelectorAll('#mobileAuthArea .mobile-nav__link')].map(a => a.innerText.replace(/\\s+/g, ' ').trim());
    return {
      hasUserCard: !!userCard,
      userName: userName ? userName.innerText : '',
      userRole: userRole ? userRole.innerText : '',
      links
    };
  })()`);
  console.log(`  Admin: user=${adminState.userName}, role=${adminState.userRole}, items=${adminState.links.join(' | ')}`);
  await cdp.screenshot(path.join(screenshotsDir, 'menu_admin_375.png'));

  // Đặt lại về Guest
  await cdp.eval(`
    CookMateStorage.clearCurrentUser();
    Navigation.updateAuthArea();
  `);

  // 4. Kiểm tra Desktop Isolation (>= 1150px)
  console.log('\n--- Kiểm tra Desktop (1200x800): Đảm bảo Mobile Nav ẩn hoàn toàn ---');
  await cdp.setViewport(1200, 800);
  await sleep(300);
  const desktopState = await cdp.eval(`(() => {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileNavOverlay');
    const mainNav = document.getElementById('mainNav');

    const toggleStyle = toggle ? window.getComputedStyle(toggle) : {};
    const navStyle = nav ? window.getComputedStyle(nav) : {};
    const overlayStyle = overlay ? window.getComputedStyle(overlay) : {};
    const mainNavStyle = mainNav ? window.getComputedStyle(mainNav) : {};

    return {
      toggleDisplay: toggleStyle.display,
      navDisplay: navStyle.display,
      overlayDisplay: overlayStyle.display,
      mainNavDisplay: mainNavStyle.display
    };
  })()`);
  console.log(`  Desktop: menuToggle display=${desktopState.toggleDisplay} (Kỳ vọng: none)`);
  console.log(`  Desktop: mobileNav display=${desktopState.navDisplay} (Kỳ vọng: none)`);
  console.log(`  Desktop: mobileNavOverlay display=${desktopState.overlayDisplay} (Kỳ vọng: none)`);
  console.log(`  Desktop: mainNav desktop display=${desktopState.mainNavDisplay} (Kỳ vọng: flex)`);

  await cdp.close();
  console.log('\n=== TẤT CẢ CÁC BƯỚC KIỂM THỬ HOÀN TẤT THÀNH CÔNG ===\n');
}

runTests().catch(err => {
  console.error('Lỗi khi chạy kiểm thử:', err);
  process.exit(1);
});
