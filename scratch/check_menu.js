const http = require('http');
const { spawn } = require('child_process');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=9224', '--disable-gpu', '--no-sandbox', '--user-data-dir=C:\\temp\\chrome_test_menu'
  ], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));

  const target = await new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1', port: 9224, path: '/json/new?http://localhost:8089/index.html', method: 'PUT'
    }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.end();
  });

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  
  // Set viewport to mobile 375x812
  ws.send(JSON.stringify({
    id: 2,
    method: 'Emulation.setDeviceMetricsOverride',
    params: { width: 375, height: 812, deviceScaleFactor: 1, mobile: true }
  }));
  await new Promise(r => setTimeout(r, 800));

  // Click hamburger menu
  const evalMsg = {
    id: 3,
    method: 'Runtime.evaluate',
    params: {
      expression: `(() => {
        const toggle = document.getElementById('menuToggle');
        if (toggle) toggle.click();
        const nav = document.getElementById('mobileNav');
        const overlay = document.getElementById('mobileNavOverlay');
        const header = document.getElementById('siteHeader');
        const navRect = nav ? nav.getBoundingClientRect() : {};
        const overlayRect = overlay ? overlay.getBoundingClientRect() : {};
        const headerRect = header ? header.getBoundingClientRect() : {};
        const headerStyle = header ? window.getComputedStyle(header) : {};
        const navStyle = nav ? window.getComputedStyle(nav) : {};

        return {
          navClasses: nav ? nav.className : '',
          headerRect: { top: headerRect.top, left: headerRect.left, width: headerRect.width, height: headerRect.height },
          navRect: { top: navRect.top, left: navRect.left, width: navRect.width, height: navRect.height, bottom: navRect.bottom },
          overlayRect: { top: overlayRect.top, left: overlayRect.left, width: overlayRect.width, height: overlayRect.height },
          headerBackdropFilter: headerStyle.backdropFilter || headerStyle.webkitBackdropFilter,
          headerPosition: headerStyle.position,
          navPosition: navStyle.position,
          navHeight: navStyle.height,
          navDisplay: navStyle.display,
          linkCount: document.querySelectorAll('.mobile-nav__link').length,
          navBodyHeight: document.querySelector('.mobile-nav__body') ? document.querySelector('.mobile-nav__body').getBoundingClientRect().height : 0
        };
      })()`,
      returnByValue: true
    }
  };
  ws.send(JSON.stringify(evalMsg));

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id === 3) {
      if (data.result && data.result.exceptionDetails) {
        console.error('Exception:', data.result.exceptionDetails);
      } else {
        console.log('Result:', JSON.stringify(data.result, null, 2));
      }
      chrome.kill();
      process.exit(0);
    }
  };
}
test().catch(e => { console.error(e); process.exit(1); });
