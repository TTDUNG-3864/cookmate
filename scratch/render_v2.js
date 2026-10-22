const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=9232', '--disable-gpu', '--no-sandbox', '--user-data-dir=C:\\temp\\chrome_v2_prev'
  ], { stdio: 'ignore' });
  await sleep(1200);

  const target = await new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1', port: 9232, path: '/json/new?http://localhost:8089/scratch/test_pho_svg_v2.html', method: 'PUT'
    }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.end();
  });

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let msgId = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = msgId++;
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 600, height: 600, deviceScaleFactor: 1, mobile: false });
  await sleep(400);

  // Capture resting state
  const ss1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/screenshots/pho_v2_resting.png', Buffer.from(ss1.data, 'base64'));
  console.log('✓ pho_v2_resting.png saved');

  // Click stage to lift
  await send('Runtime.evaluate', { expression: 'document.getElementById("phoStage").click();' });
  await sleep(850);

  // Capture lifted state
  const ss2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/screenshots/pho_v2_lifted.png', Buffer.from(ss2.data, 'base64'));
  console.log('✓ pho_v2_lifted.png saved');

  ws.close();
  chrome.kill();
}
test().catch(e => { console.error(e); process.exit(1); });
