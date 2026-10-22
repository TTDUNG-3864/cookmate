const http = require('http');
const { spawn } = require('child_process');

async function testPage(url) {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=9228', '--disable-gpu', '--no-sandbox', '--user-data-dir=C:\\temp\\chrome_test_p'
  ], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));

  const target = await new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1', port: 9228, path: '/json/new?' + encodeURIComponent(url), method: 'PUT'
    }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.end();
  });

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
  ws.send(JSON.stringify({
    id: 2,
    method: 'Emulation.setDeviceMetricsOverride',
    params: { width: 375, height: 812, deviceScaleFactor: 1, mobile: true }
  }));
  await new Promise(r => setTimeout(r, 800));

  ws.send(JSON.stringify({
    id: 3,
    method: 'Runtime.evaluate',
    params: { expression: 'document.getElementById("menuToggle").click();', returnByValue: true }
  }));
  await new Promise(r => setTimeout(r, 400));

  ws.send(JSON.stringify({
    id: 4,
    method: 'Runtime.evaluate',
    params: {
      expression: '(() => { const nav = document.getElementById("mobileNav"); const r = nav ? nav.getBoundingClientRect() : {}; return { isOpen: nav && nav.classList.contains("is-open"), width: Math.round(r.width), height: Math.round(r.height), links: document.querySelectorAll(".mobile-nav__link").length }; })()',
      returnByValue: true
    }
  }));

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id === 4) {
      const val = data.result && data.result.result ? data.result.result.value : data.result;
      console.log('Result for ' + url + ':', JSON.stringify(val));
      chrome.kill();
      process.exit(0);
    }
  };
}

const targetUrl = process.argv[2] || 'http://localhost:8089/pages/recipes.html';
testPage(targetUrl).catch(e => { console.error(e); process.exit(1); });
