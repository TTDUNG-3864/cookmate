// scratch/test_cookmate_ui.js
// Automated verification for CookMate UI Card & Recipe Detail Page

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CDP_HOST = '127.0.0.1';
const CDP_PORT = 9222;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\temp\\chrome_dev_test';
const OUTPUT_DIR = path.join('C:\\Users\\TTD\\.gemini\\antigravity\\brain\\76e43c54-2a95-4105-8066-69e53cbabdc0\\scratch');

function launchChrome() {
  return new Promise((resolve, reject) => {
    const chrome = spawn(CHROME_PATH, [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      '--disable-gpu',
      '--no-sandbox',
      `--user-data-dir=${USER_DATA_DIR}`
    ], { stdio: 'ignore' });

    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(`http://${CDP_HOST}:${CDP_PORT}/json/version`, res => {
        if (res.statusCode === 200) {
          resolve(chrome);
        } else if (attempts < 30) {
          setTimeout(check, 200);
        } else {
          reject(new Error('Timeout waiting for Chrome CDP'));
        }
      });
      req.on('error', () => {
        if (attempts < 30) {
          setTimeout(check, 200);
        } else {
          reject(new Error('Timeout waiting for Chrome CDP'));
        }
      });
    };
    setTimeout(check, 500);
  });
}

function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 0;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.msgId;
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
      throw new Error(res.exceptionDetails.text || 'Eval exception: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768
    });
    await this.send('Emulation.setVisibleSize', { width, height });
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`  📸 Screenshot saved: ${filename} (${buffer.length} bytes)`);
    return outPath;
  }

  async close() {
    if (this.ws) this.ws.close();
  }
}

async function createTarget(url) {
  const target = await httpRequest({
    host: CDP_HOST,
    port: CDP_PORT,
    path: `/json/new?${encodeURIComponent(url)}`,
    method: 'PUT'
  });
  return target;
}

async function closeTarget(targetId) {
  await httpRequest({
    host: CDP_HOST,
    port: CDP_PORT,
    path: `/json/close/${targetId}`,
    method: 'GET'
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Starting CookMate Automated UI Verification...');
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const chromeProc = await launchChrome();
  console.log('  🌐 Chrome headless spawned successfully with CDP port', CDP_PORT);

  try {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ PASS: ${message}`);
    } else {
      failedTests++;
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  // =========================================================================
  // TEST SUITE 1: Trang chi tiết món ăn (recipe-detail.html?id=1 - Phở Bò)
  // =========================================================================
  console.log('\n--- TEST SUITE 1: Trang Chi Tiết Món Ăn (pages/recipe-detail.html?id=1) ---');
  const targetDetail = await createTarget('http://localhost:8089/pages/recipe-detail.html?id=1');
  const clientDetail = new CDPClient(targetDetail.webSocketDebuggerUrl);
  await clientDetail.connect();
  await clientDetail.send('Page.enable');
  await clientDetail.send('Runtime.enable');
  await sleep(1500);

  // 1.1 Desktop Viewport (1280x900)
  console.log('\n[1.1] Kiểm tra giao diện Desktop (1280px):');
  await clientDetail.setViewport(1280, 900);
  await sleep(500);

  const heroCheck = await clientDetail.eval(`(() => {
    const card = document.querySelector('.detail-hero-card');
    const media = document.querySelector('.detail-hero-media');
    const info = document.querySelector('.detail-hero-info');
    const title = document.querySelector('.detail-title');
    const desc = document.querySelector('.detail-desc');
    const ratingLine = document.querySelector('.detail-rating-line');
    const stars = document.querySelectorAll('.detail-rating-line .fa-star, .detail-rating-line .fa-star-half-stroke');
    const metaCards = document.querySelectorAll('.detail-meta-grid .meta-card');
    const heroActions = document.querySelector('.detail-hero-actions');

    const cardRect = card ? card.getBoundingClientRect() : null;
    const mediaRect = media ? media.getBoundingClientRect() : null;
    const infoRect = info ? info.getBoundingClientRect() : null;
    const descRect = desc ? desc.getBoundingClientRect() : null;
    const ratingRect = ratingLine ? ratingLine.getBoundingClientRect() : null;

    let starColor = '';
    if (stars.length > 0) {
      starColor = window.getComputedStyle(stars[0]).color;
    }

    return {
      cardExists: !!card,
      mediaExists: !!media,
      infoExists: !!info,
      is2Columns: mediaRect && infoRect ? (mediaRect.left < infoRect.left) && (mediaRect.top < infoRect.bottom) : false,
      titleText: title ? title.textContent.trim() : '',
      ratingLineBelowDesc: descRect && ratingRect ? (ratingRect.top >= descRect.bottom - 4) : false,
      starsCount: stars.length,
      starColor: starColor,
      ratingScore: ratingLine ? ratingLine.querySelector('.rating-score')?.textContent : '',
      metaCardsCount: metaCards.length,
      hasHeroActions: !!heroActions,
      scrollWidth: document.body.scrollWidth,
      windowWidth: window.innerWidth
    };
  })()`);

  assert(heroCheck.cardExists, 'Thẻ Hero (.detail-hero-card) tồn tại');
  assert(heroCheck.mediaExists && heroCheck.infoExists, 'Cột ảnh (.detail-hero-media) và Cột info (.detail-hero-info) đều tồn tại');
  assert(heroCheck.is2Columns, 'Hero hiển thị 2 cột cân đối trên màn hình desktop (Cột ảnh bên trái, Cột info bên phải)');
  assert(heroCheck.titleText.includes('Phở bò'), 'Tiêu đề hiển thị đúng món: ' + heroCheck.titleText);
  assert(heroCheck.ratingLineBelowDesc, 'Dòng sao đánh giá (.detail-rating-line) nằm ngay bên dưới mô tả ngắn');
  assert(heroCheck.starsCount === 5, 'Dòng sao có đủ 5 ngôi sao đánh giá');
  assert(heroCheck.starColor.includes('245, 158, 11') || heroCheck.starColor.includes('244, 180, 0'), 'Màu sao đánh giá là màu vàng ấm chuẩn design system: ' + heroCheck.starColor);
  assert(heroCheck.metaCardsCount === 6, 'Lưới thẻ nhanh có đủ 6 thẻ thông tin (Chuẩn bị, Nấu, Tổng thời gian, Độ khó, Khẩu phần, Đánh giá)');
  assert(heroCheck.scrollWidth <= heroCheck.windowWidth, 'Không có thanh cuộn ngang (scrollWidth <= windowWidth)');

  await clientDetail.captureScreenshot('detail_page_desktop_1280.png');

  // 1.2 Middle Grid (Nguyên liệu & Dinh dưỡng)
  console.log('\n[1.2] Kiểm tra Middle Grid (Nguyên liệu + Khẩu phần & Dinh dưỡng):');
  const middleCheck = await clientDetail.eval(`(() => {
    const ingCard = document.querySelector('.recipe-ingredients-card');
    const nutriCard = document.querySelector('.recipe-nutrition-card');
    const ingRect = ingCard ? ingCard.getBoundingClientRect() : null;
    const nutriRect = nutriCard ? nutriCard.getBoundingClientRect() : null;
    const rows = document.querySelectorAll('.ingredients-list .ingredient-row');
    const servingsDisplay = document.getElementById('servingsDisplay');
    const caloNum = document.querySelector('.calories-num');
    const macros = document.querySelectorAll('.nutrition-macro-grid .macro-item');
    const disclaimer = document.querySelector('.nutrition-disclaimer');

    return {
      ingCardExists: !!ingCard,
      nutriCardExists: !!nutriCard,
      is2Columns: ingRect && nutriRect ? (ingRect.left < nutriRect.left) : false,
      ingredientsCount: rows.length,
      currentServings: servingsDisplay ? servingsDisplay.textContent.trim() : '',
      calories: caloNum ? caloNum.textContent.trim() : '',
      macrosCount: macros.length,
      hasDisclaimer: !!disclaimer
    };
  })()`);

  assert(middleCheck.ingCardExists && middleCheck.nutriCardExists, 'Card Nguyên liệu và Card Dinh dưỡng đều tồn tại');
  assert(middleCheck.is2Columns, 'Middle grid hiển thị 2 cột cân đối trên desktop (Nguyên liệu bên trái, Dinh dưỡng bên phải)');
  assert(middleCheck.ingredientsCount >= 5, `Danh sách nguyên liệu đầy đủ (${middleCheck.ingredientsCount} nguyên liệu)`);
  assert(middleCheck.currentServings === '4', 'Khẩu phần gốc hiển thị đúng: 4 người');
  assert(parseInt(middleCheck.calories) > 0, `Ô Calo nổi bật hiển thị năng lượng ước tính: ${middleCheck.calories} kcal`);
  assert(middleCheck.macrosCount === 4, 'Lưới dinh dưỡng có đủ 4 chỉ số (Đạm, Béo, Carbs, Xơ)');
  assert(middleCheck.hasDisclaimer, 'Dòng lưu ý / disclaimer dinh dưỡng tham khảo đầy đủ');

  // 1.3 Test Co giãn khẩu phần tự động (Interactive Stepper)
  console.log('\n[1.3] Kiểm tra tính năng tương tác Co giãn khẩu phần:');
  const scalingTest = await clientDetail.eval(`(() => {
    const beforeFirstQty = document.querySelector('.ingredients-list .ingredient-row .ingredient-qty strong')?.textContent;
    adjustServings(1); // 4 -> 5
    const afterFirstServings = document.getElementById('servingsDisplay')?.textContent;
    const afterFirstQty = document.querySelector('.ingredients-list .ingredient-row .ingredient-qty strong')?.textContent;
    
    adjustServings(-1); // 5 -> 4
    const restoredServings = document.getElementById('servingsDisplay')?.textContent;
    const restoredQty = document.querySelector('.ingredients-list .ingredient-row .ingredient-qty strong')?.textContent;

    return {
      beforeFirstQty,
      afterFirstServings,
      afterFirstQty,
      restoredServings,
      restoredQty
    };
  })()`);

  assert(scalingTest.afterFirstServings === '5', 'Tăng khẩu phần lên 5 người thành công');
  assert(scalingTest.afterFirstQty !== scalingTest.beforeFirstQty, `Nguyên liệu tự động tính lại tỷ lệ khi tăng khẩu phần: ${scalingTest.beforeFirstQty} -> ${scalingTest.afterFirstQty}`);
  assert(scalingTest.restoredServings === '4', 'Giảm khẩu phần về lại 4 người chính xác');
  assert(scalingTest.restoredQty === scalingTest.beforeFirstQty, 'Định lượng nguyên liệu phục hồi chuẩn xác về mức gốc');

  // 1.4 Test Timeline Các bước chế biến & Kitchen Mode
  console.log('\n[1.4] Kiểm tra Timeline Các bước & Chế độ Đứng bếp (Kitchen Mode):');
  const stepsCheck = await clientDetail.eval(`(() => {
    const stepsCard = document.querySelector('.detail-steps-card');
    const items = document.querySelectorAll('.steps-timeline .step-timeline-item');
    const firstBadge = document.querySelector('.step-timeline-item .step-badge');
    const firstText = document.querySelector('.step-timeline-item .step-text');
    const initialFontSize = firstText ? window.getComputedStyle(firstText).fontSize : '';

    // Bật Kitchen Mode
    toggleKitchenMode();
    const isKitchenActive = document.body.classList.contains('kitchen-mode-active');
    const activeFontSize = firstText ? window.getComputedStyle(firstText).fontSize : '';

    // Tắt Kitchen Mode
    toggleKitchenMode();
    const isKitchenDeactivated = !document.body.classList.contains('kitchen-mode-active');

    return {
      stepsCardExists: !!stepsCard,
      stepsCount: items.length,
      badgeText: firstBadge ? firstBadge.textContent.trim() : '',
      initialFontSize,
      isKitchenActive,
      activeFontSize,
      isKitchenDeactivated
    };
  })()`);

  assert(stepsCheck.stepsCardExists && stepsCheck.stepsCount >= 4, `Card Các bước chế biến có đủ ${stepsCheck.stepsCount} bước tuần tự`);
  assert(stepsCheck.badgeText === '1', 'Số thứ tự bước đầu tiên là 1');
  assert(stepsCheck.isKitchenActive, 'Bật Chế độ Đứng bếp thêm class .kitchen-mode-active vào body');
  assert(parseFloat(stepsCheck.activeFontSize) >= 19, `Chế độ Đứng bếp phóng to chữ rõ ràng (${stepsCheck.initialFontSize} -> ${stepsCheck.activeFontSize})`);
  assert(stepsCheck.isKitchenDeactivated, 'Tắt Chế độ Đứng bếp phục hồi trạng thái bình thường');

  // 1.5 Test Comments & Related Recipes
  console.log('\n[1.5] Kiểm tra Bình luận & Món ăn liên quan:');
  const commentsCheck = await clientDetail.eval(`(() => {
    const alertBox = document.querySelector('.comment-auth-alert');
    const alertBtn = alertBox ? alertBox.querySelector('a.btn-primary') : null;
    const commentItems = document.querySelectorAll('.comments-list .comment-item');
    const relatedSection = document.getElementById('relatedSection');
    const relatedCards = document.querySelectorAll('#relatedGrid .recipe-card');

    return {
      hasAlertBox: !!alertBox,
      hasAlertBtn: !!alertBtn && alertBtn.textContent.includes('Đăng nhập'),
      commentsCount: commentItems.length,
      relatedVisible: relatedSection ? window.getComputedStyle(relatedSection).display !== 'none' : false,
      relatedCardsCount: relatedCards.length
    };
  })()`);

  assert(commentsCheck.hasAlertBox && commentsCheck.hasAlertBtn, 'Hộp cảnh báo nhắc đăng nhập có nút "Đăng nhập ngay" đặt cạnh nhau tinh tế');
  assert(commentsCheck.commentsCount >= 1, `Danh sách bình luận hiển thị ${commentsCheck.commentsCount} bình luận`);
  assert(commentsCheck.relatedVisible && commentsCheck.relatedCardsCount === 3, `Phần món ăn liên quan hiển thị đủ 3 thẻ công thức`);

  // 1.6 Mobile Viewport (375x812)
  console.log('\n[1.6] Kiểm tra responsive trên Mobile (375px):');
  await clientDetail.setViewport(375, 812);
  await sleep(500);

  const mobileCheck = await clientDetail.eval(`(() => {
    const card = document.querySelector('.detail-hero-card');
    const media = document.querySelector('.detail-hero-media');
    const info = document.querySelector('.detail-hero-info');
    const mediaRect = media ? media.getBoundingClientRect() : null;
    const infoRect = info ? info.getBoundingClientRect() : null;

    return {
      isStacked: mediaRect && infoRect ? (mediaRect.bottom <= infoRect.top + 10) : false,
      scrollWidth: document.body.scrollWidth,
      windowWidth: window.innerWidth
    };
  })()`);

  assert(mobileCheck.isStacked, 'Trên mobile, ảnh và thông tin món ăn tự động xếp chồng 1 cột mượt mà');
  assert(mobileCheck.scrollWidth <= mobileCheck.windowWidth, `Không có thanh cuộn ngang trên mobile (scrollWidth: ${mobileCheck.scrollWidth}px, windowWidth: ${mobileCheck.windowWidth}px)`);

  await clientDetail.captureScreenshot('detail_page_mobile_375.png');

  await clientDetail.close();
  await closeTarget(targetDetail.id);

  // =========================================================================
  // TEST SUITE 2: Recipe Card trên Trang chủ & Danh sách (Vấn đề A)
  // =========================================================================
  console.log('\n--- TEST SUITE 2: Nâng cấp Recipe Card (index.html & recipes.html) ---');
  const targetHome = await createTarget('http://localhost:8089/index.html');
  const clientHome = new CDPClient(targetHome.webSocketDebuggerUrl);
  await clientHome.connect();
  await clientHome.send('Page.enable');
  await clientHome.send('Runtime.enable');
  await sleep(1500);
  await clientHome.setViewport(1280, 900);
  await sleep(500);

  const cardCheck = await clientHome.eval(`(() => {
    const firstCard = document.querySelector('.recipe-card');
    if (!firstCard) return { found: false };

    const img = firstCard.querySelector('.recipe-card__image');
    const category = firstCard.querySelector('.recipe-card__category');
    const title = firstCard.querySelector('.recipe-card__title');
    const desc = firstCard.querySelector('.recipe-card__desc');
    const ratingLine = firstCard.querySelector('.recipe-card__rating-line');
    const stars = ratingLine ? ratingLine.querySelectorAll('.fa-star, .fa-star-half-stroke') : [];
    const score = ratingLine ? ratingLine.querySelector('.rating-score') : null;
    const count = ratingLine ? ratingLine.querySelector('.rating-count') : null;
    const footer = firstCard.querySelector('.recipe-card__footer');
    const meta = footer ? footer.querySelector('.recipe-card__meta') : null;
    const favBtn = footer ? footer.querySelector('.btn-favorite') : null;

    const imgRect = img ? img.getBoundingClientRect() : null;
    const descRect = desc ? desc.getBoundingClientRect() : null;
    const ratingRect = ratingLine ? ratingLine.getBoundingClientRect() : null;
    const footerRect = footer ? footer.getBoundingClientRect() : null;

    let starColor = '';
    if (stars.length > 0) {
      starColor = window.getComputedStyle(stars[0]).color;
    }

    return {
      found: true,
      hasCategory: !!category,
      hasTitle: !!title,
      hasDesc: !!desc,
      hasRatingLine: !!ratingLine,
      ratingLineBelowDesc: descRect && ratingRect ? (ratingRect.top >= descRect.bottom - 4) : false,
      footerBelowRating: ratingRect && footerRect ? (footerRect.top >= ratingRect.bottom - 4) : false,
      starsCount: stars.length,
      starColor: starColor,
      scoreText: score ? score.textContent.trim() : '',
      countText: count ? count.textContent.trim() : '',
      hasFooterMeta: !!meta,
      hasFooterFavBtn: !!favBtn,
      scrollWidth: document.body.scrollWidth,
      windowWidth: window.innerWidth
    };
  })()`);

  assert(cardCheck.found, 'Tìm thấy card công thức (.recipe-card) trên trang chủ');
  assert(cardCheck.hasCategory && cardCheck.hasTitle && cardCheck.hasDesc, 'Card có đầy đủ danh mục, tên món và mô tả ngắn');
  assert(cardCheck.hasRatingLine, 'Card có dòng sao đánh giá (.recipe-card__rating-line)');
  assert(cardCheck.ratingLineBelowDesc, 'Dòng sao đánh giá nằm ngay dưới mô tả ngắn');
  assert(cardCheck.footerBelowRating, 'Footer thẻ nằm dưới dòng sao đánh giá');
  assert(cardCheck.starsCount === 5, 'Dòng sao hiển thị đủ 5 ngôi sao');
  assert(cardCheck.starColor.includes('245, 158, 11') || cardCheck.starColor.includes('244, 180, 0'), 'Màu sao card là màu vàng ấm chuẩn (#F59E0B): ' + cardCheck.starColor);
  assert(cardCheck.hasFooterMeta && cardCheck.hasFooterFavBtn, 'Chân thẻ (.recipe-card__footer) chứa meta thông tin bên trái và nút yêu thích bên phải');
  assert(cardCheck.scrollWidth <= cardCheck.windowWidth, 'Trang chủ không có thanh cuộn ngang');

  await clientHome.captureScreenshot('home_cards_desktop_1280.png');

  // Test toggle favorite from card
  console.log('\n[2.2] Kiểm tra tương tác nút yêu thích trên card:');
  const favInteraction = await clientHome.eval(`(() => {
    // Đăng nhập demo user trước để test favorite
    CookMateStorage.setCurrentUser({ id: 2, name: 'Trần Hương Giang', role: 'member' });
    const firstFavBtn = document.querySelector('.recipe-card .btn-favorite');
    const initialFav = firstFavBtn.classList.contains('is-favorite');
    firstFavBtn.click();
    const afterFav = firstFavBtn.classList.contains('is-favorite');
    
    // Toggle lại
    firstFavBtn.click();
    const restoredFav = firstFavBtn.classList.contains('is-favorite');

    return {
      initialFav,
      afterFav,
      restoredFav
    };
  })()`);

  assert(favInteraction.afterFav !== favInteraction.initialFav, 'Click nút tim trên card chuyển trạng thái yêu thích thành công');
  assert(favInteraction.restoredFav === favInteraction.initialFav, 'Click lại nút tim đưa trạng thái về ban đầu chuẩn xác');

  await clientHome.close();
  await closeTarget(targetHome.id);

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n======================================================');
  console.log(`🎯 KẾT QUẢ KIỂM THỬ TỰ ĐỘNG COOKMATE:`);
  console.log(`   Tổng số kiểm tra: ${totalTests}`);
  console.log(`   Số test ĐẠT (PASS): ${passedTests}`);
  console.log(`   Số test LỖI (FAIL): ${failedTests}`);
  console.log(`   Tỷ lệ thành công: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('======================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } finally {
    try {
      chromeProc.kill();
    } catch (e) {}
  }
}

run().catch(err => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
