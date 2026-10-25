/**
 * CookMate Admin Access Guard (Chạy sớm trong <head> để bảo vệ toàn diện)
 * 1. Ngăn chặn triệt để FOUC (Flash of Unauthenticated Content): ẩn DOM ngay lập tức nếu chưa xác thực
 * 2. Phân loại chuẩn xác:
 *    - Khách chưa đăng nhập: Chuyển hướng sang login.html kèm redirect query
 *    - Thành viên (Member): Bị từ chối quyền Admin, chuyển hướng thẳng về index.html (KHÔNG lặp vô hạn)
 *    - Quản trị viên (Admin): Cho phép truy cập bình thường
 * 3. Chống khôi phục qua Back/Forward Cache (bfcache) của trình duyệt qua pageshow event
 * 4. Tách biệt phiên Admin Shell và Website xem trước bên phải
 */

(function () {
  'use strict';

  function getValidAdminSession() {
    try {
      // 1. Kiểm tra session Admin riêng biệt
      var adminSessRaw = localStorage.getItem('cookmate_admin_session');
      if (adminSessRaw) {
        var adminSess = JSON.parse(adminSessRaw);
        if (adminSess && adminSess.role === 'admin') {
          return adminSess;
        }
      }

      // 2. Fallback kiểm tra current_user
      var userRaw = localStorage.getItem('cookmate_current_user');
      if (userRaw) {
        var user = JSON.parse(userRaw);
        if (user && user.role === 'admin') {
          // Khởi tạo phiên admin
          var newSess = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'admin',
            loginTime: Date.now()
          };
          localStorage.setItem('cookmate_admin_session', JSON.stringify(newSess));
          return newSess;
        }
      }
    } catch (e) {
      console.warn('AdminGuard session parse error:', e);
    }
    return null;
  }

  function verifyAdminAccess() {
    var adminUser = getValidAdminSession();

    if (!adminUser) {
      // 1. Ẩn toàn bộ giao diện ngay lập tức để không lộ 1 pixel nào của Admin
      if (document.documentElement) {
        document.documentElement.style.display = 'none';
      }

      // 2. Kiểm tra xem người dùng hiện tại có phải là Member đang đăng nhập không
      var isMember = false;
      try {
        var rawUser = localStorage.getItem('cookmate_current_user');
        if (rawUser) {
          var u = JSON.parse(rawUser);
          if (u && u.role === 'member') {
            isMember = true;
          }
        }
      } catch (e) {}

      // 3. Điều hướng an toàn:
      if (isMember) {
        // Thành viên thường: Bị từ chối truy cập Admin -> Chuyển về trang chủ User
        window.location.replace('../../index.html');
      } else {
        // Khách chưa đăng nhập: Chuyển sang login kèm redirect URL
        var currentPath = window.location.pathname;
        var relIdx = currentPath.indexOf('pages/admin/');
        var target = relIdx !== -1 ? currentPath.substring(relIdx) : 'pages/admin/index.html';
        window.location.replace('../auth/login.html?redirect=' + encodeURIComponent(target));
      }
      return false;
    }

    // Nếu là Admin hợp lệ: đảm bảo hiển thị bình thường
    if (document.documentElement && document.documentElement.style.display === 'none') {
      document.documentElement.style.display = '';
    }
    return true;
  }

  // Chạy ngay lập tức khi file script này được tải trong <head>
  verifyAdminAccess();

  // Bảo vệ chống khôi phục từ Back/Forward Cache (bfcache)
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      verifyAdminAccess();
    }
  });

  // Export hàm kiểm tra cho DOMContentLoaded trong các trang admin
  window.checkAdminAuth = function () {
    var isValid = verifyAdminAccess();
    if (!isValid) return false;

    var admin = getValidAdminSession();
    if (admin) {
      var nameEl = document.getElementById('adminUserName');
      var avatarEl = document.getElementById('adminUserAvatar');
      if (nameEl) nameEl.textContent = admin.name;
      if (avatarEl) avatarEl.textContent = admin.name.charAt(0).toUpperCase();
    }
    return true;
  };

  // Export hàm đăng xuất chuẩn cho Admin Shell
  window.handleAdminLogout = function () {
    try {
      localStorage.removeItem('cookmate_current_user');
      localStorage.removeItem('cookmate_admin_session');
      sessionStorage.removeItem('cookmate_sidebar_closed');
      sessionStorage.removeItem('cookmate_sidebar_scroll');
    } catch (e) {}

    if (typeof CookMateUI !== 'undefined') {
      CookMateUI.showToast('Đã đăng xuất khỏi Quản trị thành công', 'success');
    }
    setTimeout(function () {
      window.location.replace('../../index.html');
    }, 300);
  };

  // Gán đè hàm handleLogout cục bộ trên các trang admin
  window.handleLogout = window.handleAdminLogout;

})();
