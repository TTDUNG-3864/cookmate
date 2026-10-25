const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const DEBUG_PORT = 9243;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_role_approval');
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

async function runRoleApprovalSuite() {
  console.log('========================================================================');
  console.log('  COOKMATE: VERIFICATION SUITE - ROLE AUTH & RECIPE APPROVAL WORKFLOW   ');
  console.log('========================================================================');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\temp\\chrome_role_suite_' + Date.now()
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

    await send('Page.enable');
    await send('Runtime.enable');

    return {
      target,
      send,
      close: async () => {
        ws.close();
        await new Promise(r => {
          http.get(`http://127.0.0.1:${DEBUG_PORT}/json/close/${target.id}`, r);
        });
      },
      navigate: async (newUrl) => {
        await send('Page.navigate', { url: newUrl });
        await sleep(1000);
      },
      evaluate: async (expression) => {
        const res = await send('Runtime.evaluate', {
          expression,
          returnByValue: true,
          awaitPromise: true
        });
        if (res.exceptionDetails) {
          throw new Error('Eval error: ' + JSON.stringify(res.exceptionDetails));
        }
        return res.result ? res.result.value : undefined;
      },
      screenshot: async (name) => {
        const res = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(SCREENSHOT_DIR, name + '.png');
        fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
        console.log(`    -> Screenshot saved: ${name}.png`);
      }
    };
  }

  try {
    const page = await createPage('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(1000);

    // =========================================================================
    // TEST GROUP 1: ROLE AUTHENTICATION & REDIRECTION
    // =========================================================================
    console.log('\n--- TEST GROUP 1: ROLE AUTHENTICATION & REDIRECTION ---');

    // 1.1 Kiểm tra không có dropdown chọn vai trò trên form login
    const hasRoleDropdown = await page.evaluate(`
      document.querySelector('select[name="role"], select#role, #userRoleSelect') !== null
    `);
    assert(!hasRoleDropdown, 'Form login là form chung duy nhất, KHÔNG có dropdown chọn vai trò "Tôi là Admin/User"');

    // 1.2 Đăng nhập bằng tài khoản Quản trị viên (Admin)
    await page.evaluate(`
      localStorage.clear();
      document.getElementById('loginEmail').value = 'admin@cookmate.vn';
      document.getElementById('loginPassword').value = 'admin123';
      document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(1800);

    const adminRedirectUrl = await page.evaluate(`window.location.href`);
    assert(adminRedirectUrl.includes('/pages/admin/index.html'), 'Tài khoản Admin (admin@cookmate.vn) tự động chuyển hướng vào Dashboard Admin: ' + adminRedirectUrl);
    await page.screenshot('01_admin_dashboard');

    // 1.3 Đã đăng nhập Admin, truy cập lại login.html -> Tự động chuyển về admin dashboard
    await page.navigate('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(1200);
    const reAdminUrl = await page.evaluate(`window.location.href`);
    assert(reAdminUrl.includes('/pages/admin/index.html'), 'Admin đã đăng nhập truy cập login.html tự động chuyển hướng về admin dashboard');

    // 1.4 Đăng xuất và đăng nhập bằng tài khoản Thành viên (Member)
    await page.evaluate(`CookMateStorage.clearCurrentUser();`);
    await page.navigate('http://127.0.0.1:8089/pages/auth/login.html');
    await sleep(800);

    await page.evaluate(`
      document.getElementById('loginEmail').value = 'giang@cookmate.vn';
      document.getElementById('loginPassword').value = 'giang123';
      document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(1800);

    const memberRedirectUrl = await page.evaluate(`window.location.href`);
    assert(memberRedirectUrl.includes('/index.html') && !memberRedirectUrl.includes('/pages/admin'), 'Tài khoản Member (giang@cookmate.vn) tự động chuyển hướng về Trang chủ');
    await page.screenshot('02_member_homepage');

    // 1.5 Đăng nhập Member với redirect query param
    await page.evaluate(`CookMateStorage.clearCurrentUser();`);
    await page.navigate('http://127.0.0.1:8089/pages/auth/login.html?redirect=' + encodeURIComponent('pages/account/recipe-form.html'));
    await sleep(800);

    await page.evaluate(`
      document.getElementById('loginEmail').value = 'giang@cookmate.vn';
      document.getElementById('loginPassword').value = 'giang123';
      document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(1800);

    const customRedirectUrl = await page.evaluate(`window.location.href`);
    assert(customRedirectUrl.includes('pages/account/recipe-form.html'), 'Member đăng nhập với redirect param chuyển hướng đúng trang đích yêu cầu: ' + customRedirectUrl);

    // =========================================================================
    // TEST GROUP 2: ACCESS GUARDING
    // =========================================================================
    console.log('\n--- TEST GROUP 2: ACCESS GUARDING ---');

    // 2.1 Khách chưa đăng nhập truy cập admin/index.html -> Bị chặn
    await page.evaluate(`CookMateStorage.clearCurrentUser();`);
    await page.navigate('http://127.0.0.1:8089/pages/admin/index.html');
    await sleep(1200);
    const guestAdminBlockUrl = await page.evaluate(`window.location.href`);
    assert(guestAdminBlockUrl.includes('login.html'), 'Khách chưa đăng nhập truy cập trang admin bị chặn và chuyển về login');

    // 2.2 Thành viên (member) truy cập admin/approve-recipes.html -> Bị chặn
    await page.evaluate(`
      CookMateStorage.setCurrentUser({ id: 2, name: 'Hương Giang', role: 'member', email: 'giang@cookmate.vn' });
    `);
    await page.navigate('http://127.0.0.1:8089/pages/admin/approve-recipes.html');
    await sleep(1500);
    const memberAdminBlockUrl = await page.evaluate(`window.location.href`);
    assert(!memberAdminBlockUrl.includes('/pages/admin/'), 'Thành viên role "member" truy cập duyệt công thức admin bị chặn (đã điều hướng khỏi trang admin: ' + memberAdminBlockUrl + ')');

    // 2.3 Khách nhấn Đăng công thức trong Header -> Chuyển về login kèm redirect param
    await page.evaluate(`CookMateStorage.clearCurrentUser();`);
    await page.navigate('http://127.0.0.1:8089/index.html');
    await sleep(1000);

    await page.evaluate(`
      (function() {
        var link = document.querySelector('a[data-page="recipe-form"]');
        if (link) link.click();
      })()
    `);
    await sleep(1200);
    const clickGuardUrl = await page.evaluate(`window.location.href`);
    assert(clickGuardUrl.includes('login.html') && clickGuardUrl.includes('recipe-form.html'), 'Khách nhấn "Đăng công thức" trong Header được chuyển đến login kèm redirect param: ' + clickGuardUrl);

    // =========================================================================
    // TEST GROUP 3: RECIPE APPROVAL WORKFLOW
    // =========================================================================
    console.log('\n--- TEST GROUP 3: RECIPE APPROVAL WORKFLOW ---');

    // 3.1 Đăng nhập Member và gửi công thức mới
    await page.evaluate(`
      var user = { id: 2, name: 'Trần Hương Giang', role: 'member', email: 'giang@cookmate.vn' };
      CookMateStorage.setCurrentUser(user);
    `);
    await page.navigate('http://127.0.0.1:8089/pages/account/recipe-form.html');
    await sleep(800);

    // Điền form đăng công thức
    await page.evaluate(`
      document.getElementById('recipeName').value = 'Bún chả Hà Nội nướng than hoa (Test Pending)';
      document.getElementById('recipeDesc').value = 'Bún chả gia truyền thơm ngon đượm mùi khói than.';
      document.getElementById('recipeCategory').value = '1';
      document.getElementById('recipePrepTime').value = '25';
      document.getElementById('recipeCookTime').value = '35';
      document.getElementById('recipeDifficulty').value = 'Trung bình';
      document.getElementById('recipeServings').value = '4';

      // Điền 1 nguyên liệu
      var ingNames = document.querySelectorAll('.ingredient-name');
      var ingAmts = document.querySelectorAll('.ingredient-amount');
      var ingUnits = document.querySelectorAll('.ingredient-unit');
      if (ingNames[0]) ingNames[0].value = 'Thịt ba chỉ';
      if (ingAmts[0]) ingAmts[0].value = '500';
      if (ingUnits[0]) ingUnits[0].value = 'g';

      // Điền 1 bước nấu
      var steps = document.querySelectorAll('.step-desc');
      if (steps[0]) steps[0].value = 'Ướp thịt với hành tỏi băm, nước mắm, tiêu sọ rồi nướng trên than hoa.';

      document.getElementById('recipeForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(1500);

    // 3.2 Kiểm tra bài gửi mang status = 'pending'
    const pendingRecipes = await page.evaluate(`CookMateStorage.getPendingRecipes()`);
    const testPending = pendingRecipes.find(r => r.title && r.title.includes('Bún chả Hà Nội nướng than hoa (Test Pending)'));
    assert(testPending !== undefined && testPending.status === 'pending', 'Công thức do Member gửi được lưu với trạng thái status = "pending"');

    // 3.3 Đảm bảo bài 'pending' TUYỆT ĐỐI KHÔNG xuất hiện trên các trang công khai
    const publicRecipes = await page.evaluate(`CookMateStorage.getAllRecipes()`);
    const foundInPublic = publicRecipes.some(r => r.id === testPending.id);
    assert(!foundInPublic, 'CookMateStorage.getAllRecipes() mặc định KHÔNG chứa bài status = "pending"');

    await page.navigate('http://127.0.0.1:8089/pages/recipes.html');
    await sleep(1000);
    const visibleOnExplore = await page.evaluate(`
      document.body.innerText.includes('Bún chả Hà Nội nướng than hoa (Test Pending)')
    `);
    assert(!visibleOnExplore, 'Trang Khám phá (recipes.html) KHÔNG hiển thị bài chưa duyệt');

    // 3.4 Member xem danh sách bài của mình trong "Công thức của tôi" -> Thấy bài ở tab "Chờ duyệt"
    await page.navigate('http://127.0.0.1:8089/pages/account/my-recipes.html?tab=pending');
    await sleep(1000);
    const visibleInMyRecipes = await page.evaluate(`
      document.getElementById('myRecipesList').innerText.includes('Bún chả Hà Nội nướng than hoa (Test Pending)')
    `);
    const hasPendingBadge = await page.evaluate(`
      document.querySelector('.badge-pending') !== null
    `);
    assert(visibleInMyRecipes && hasPendingBadge, 'Member thấy bài của mình tại my-recipes.html với badge "Chờ duyệt"');
    await page.screenshot('03_member_my_recipes_pending');

    // 3.5 Người lạ/Khách truy cập recipe-detail.html của bài pending -> Bị chặn hiển thị
    await page.evaluate(`CookMateStorage.clearCurrentUser();`);
    await page.navigate('http://127.0.0.1:8089/pages/recipe-detail.html?id=' + testPending.id);
    await sleep(800);
    const guestDetailBlocked = await page.evaluate(`
      document.body.innerText.includes('Không tìm thấy công thức')
    `);
    assert(guestDetailBlocked, 'Khách truy cập trực tiếp bài pending thấy thông báo "Không tìm thấy công thức"');

    // 3.6 Admin vào trang Duyệt công thức (approve-recipes.html) -> Thấy bài trong hàng đợi
    await page.evaluate(`
      var adminUser = { id: 1, name: 'Nguyễn Như Đạt', role: 'admin', email: 'admin@cookmate.vn' };
      CookMateStorage.setCurrentUser(adminUser);
    `);
    await page.navigate('http://127.0.0.1:8089/pages/admin/approve-recipes.html');
    await sleep(1000);
    const adminSeesPending = await page.evaluate(`
      document.getElementById('pendingRecipesTable').innerText.includes('Bún chả Hà Nội nướng than hoa (Test Pending)')
    `);
    assert(adminSeesPending, 'Admin thấy bài trong hàng đợi duyệt tại approve-recipes.html');
    await page.screenshot('04_admin_approve_queue');

    // 3.7 Admin từ chối bài và nhập lý do
    await page.evaluate(`
      openRejectModal('${testPending.id}');
      document.getElementById('rejectionReasonText').value = 'Định lượng nước mắm và đường pha nước chấm chưa rõ ràng.';
      document.getElementById('confirmRejectBtn').click();
    `);
    await sleep(1000);

    const rejectedRecipes = await page.evaluate(`CookMateStorage.getRejectedRecipes()`);
    const testRejected = rejectedRecipes.find(r => r.id === testPending.id);
    assert(testRejected !== undefined && testRejected.status === 'rejected' && testRejected.rejectionReason.includes('nước mắm'), 'Admin từ chối bài: status chuyển thành "rejected" và lưu lý do từ chối');

    // 3.8 Member xem bài bị từ chối trong my-recipes.html -> Thấy hộp lý do và nút "Sửa & Gửi lại"
    await page.evaluate(`
      var user = { id: 2, name: 'Trần Hương Giang', role: 'member', email: 'giang@cookmate.vn' };
      CookMateStorage.setCurrentUser(user);
    `);
    await page.navigate('http://127.0.0.1:8089/pages/account/my-recipes.html?tab=rejected');
    await sleep(1000);
    const seesRejectionReason = await page.evaluate(`
      (function() {
        var text = document.getElementById('myRecipesList').innerText;
        return text.includes('Lý do từ chối') && text.includes('nước mắm');
      })()
    `);
    assert(seesRejectionReason, 'Member thấy hộp lý do từ chối từ Admin tại my-recipes.html');
    await page.screenshot('05_member_my_recipes_rejected');

    // 3.9 Member nhấn "Sửa & Gửi lại"
    await page.navigate('http://127.0.0.1:8089/pages/account/recipe-form.html?id=' + testPending.id);
    await sleep(1000);
    await page.evaluate(`
      document.getElementById('recipeDesc').value = 'Bún chả gia truyền - Đã bổ sung công thức nước chấm chuẩn tỷ lệ vàng 1:1:1:5.';
      document.getElementById('recipeForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(1500);

    const resubmitted = await page.evaluate(`CookMateStorage.getRecipeById('${testPending.id}', true)`);
    assert(resubmitted && resubmitted.status === 'pending' && resubmitted.rejectionReason === null, 'Sửa bài bị từ chối và gửi lại: status trở lại "pending", xóa bỏ lý do từ chối cũ');

    // 3.10 Admin duyệt bài -> Chuyển thành "approved" và lập tức hiển thị công khai
    await page.evaluate(`
      var adminUser = { id: 1, name: 'Nguyễn Như Đạt', role: 'admin', email: 'admin@cookmate.vn' };
      CookMateStorage.setCurrentUser(adminUser);
    `);
    await page.navigate('http://127.0.0.1:8089/pages/admin/approve-recipes.html');
    await sleep(1000);

    await page.evaluate(`approveRecipeDirect('${testPending.id}')`);
    await sleep(1000);

    const approvedAfter = await page.evaluate(`CookMateStorage.getRecipeById('${testPending.id}')`);
    assert(approvedAfter && approvedAfter.status === 'approved', 'Admin duyệt bài: status chuyển thành "approved"');

    // Kiểm tra xuất hiện công khai trên Khám phá và Trang chủ
    await page.navigate('http://127.0.0.1:8089/pages/recipes.html');
    await sleep(1000);
    const publiclyVisible = await page.evaluate(`
      document.body.innerText.includes('Bún chả Hà Nội nướng than hoa')
    `);
    assert(publiclyVisible, 'Công thức đã duyệt xuất hiện công khai ngay lập tức trên trang Khám phá (recipes.html)');
    await page.screenshot('06_explore_recipe_approved');

    // =========================================================================
    // TEST GROUP 4: ADMIN DIRECT PUBLISHING & RECIPE MANAGEMENT
    // =========================================================================
    console.log('\n--- TEST GROUP 4: ADMIN DIRECT PUBLISHING & MANAGEMENT ---');

    await page.navigate('http://127.0.0.1:8089/pages/admin/recipe-form.html');
    await sleep(1000);

    await page.evaluate(`
      document.getElementById('adminRecipeName').value = 'Cá kho làng Vũ Đại đặc sản (Admin Published)';
      document.getElementById('adminRecipeDesc').value = 'Cá trắm đen kho niêu đất 14 tiếng chuẩn truyền thống.';
      document.getElementById('adminRecipeCategory').value = '1';
      document.getElementById('adminRecipeForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(1500);

    const adminCreatedRecipe = await page.evaluate(`
      CookMateStorage.getAllRecipes().find(r => r.title && r.title.includes('Cá kho làng Vũ Đại đặc sản'))
    `);
    assert(adminCreatedRecipe !== undefined && adminCreatedRecipe.status === 'approved', 'Admin đăng bài qua admin/recipe-form.html: Tự động xuất bản ngay (status="approved"), không vào hàng chờ duyệt');

    // Kiểm tra cột trạng thái và bộ lọc trạng thái trong admin/recipes.html
    await page.navigate('http://127.0.0.1:8089/pages/admin/recipes.html');
    await sleep(1000);
    const hasStatusFilter = await page.evaluate(`
      document.getElementById('statusFilter') !== null
    `);
    const hasStatusBadgeInTable = await page.evaluate(`
      document.querySelector('#recipeTableBody .badge-success') !== null
    `);
    assert(hasStatusFilter && hasStatusBadgeInTable, 'Trang Quản lý Công thức (admin/recipes.html) có bộ lọc trạng thái và cột trạng thái chuẩn');
    await page.screenshot('07_admin_recipes_table_status');

    // =========================================================================
    // TEST GROUP 5: UNIFIED EXPLORE HUB & HEADER NAVIGATION
    // =========================================================================
    console.log('\n--- TEST GROUP 5: UNIFIED EXPLORE HUB & NAVIGATION ---');

    // 5.1 Menu chính User tinh gọn 5 mục
    await page.navigate('http://127.0.0.1:8089/index.html');
    await sleep(1000);
    const navItems = await page.evaluate(`
      Array.from(document.querySelectorAll('#mainNav .nav-link')).map(a => a.innerText.trim())
    `);
    console.log('    Main nav links:', navItems);
    assert(navItems.length === 4, 'Header Main Nav tinh gọn 4 liên kết chính (Trang chủ, Khám phá, Đăng công thức, Yêu thích) + 1 Tài khoản ở Auth Area');

    // 5.2 Bộ lọc Khám phá theo Danh mục qua query param
    await page.navigate('http://127.0.0.1:8089/pages/recipes.html?cat=2');
    await sleep(1000);
    const catVal = await page.evaluate(`document.getElementById('filterCategory').value`);
    assert(catVal === '2', 'Khám phá nhận tham số ?cat=2 và tự động chọn danh mục');

    // 5.3 Bộ lọc Khám phá theo Tab Mới nhất
    await page.navigate('http://127.0.0.1:8089/pages/recipes.html?tab=newest');
    await sleep(1000);
    const tabActive = await page.evaluate(`
      document.querySelector('.explore-tab-btn[data-tab="newest"]').classList.contains('active')
    `);
    assert(tabActive, 'Khám phá nhận tham số ?tab=newest và kích hoạt tab Mới nhất');

    // 5.4 Tìm kiếm từ khóa và reset bộ lọc
    await page.navigate('http://127.0.0.1:8089/pages/recipes.html?q=ph%E1%BB%9F');
    await sleep(1000);
    const countWithKeyword = await page.evaluate(`parseInt(document.getElementById('exploreCount').textContent, 10)`);
    assert(countWithKeyword > 0, 'Tìm kiếm từ khóa "phở" trả về các công thức phù hợp: ' + countWithKeyword);

    await page.evaluate(`resetAllFilters()`);
    await sleep(500);
    const countAfterReset = await page.evaluate(`parseInt(document.getElementById('exploreCount').textContent, 10)`);
    assert(countAfterReset >= countWithKeyword, 'Nút "Đặt lại bộ lọc" khôi phục toàn bộ danh sách công thức: ' + countAfterReset);

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log('\n===============================================================');
    console.log(`  KẾT QUẢ KIỂM THỬ: ${passCount} PASSED / ${failCount} FAILED (Tổng ${testIndex} tests)`);
    console.log('===============================================================');

    try {
      await page.close();
    } catch (e) {}
  } catch (err) {
    console.error('Lỗi khi thực hiện kiểm thử:', err);
  } finally {
    try {
      chrome.kill();
    } catch (e) {}
  }
}

runRoleApprovalSuite().catch(console.error);
