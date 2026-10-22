/**
 * CookMate Authentication UI & Bát Phở Hà Nội Interactive Controller
 * Version 2.0 - Phở Hà Nội Sâu Lòng, Gắp Phở Tự Nhiên, Tách Độc Lập Login & Register
 */

var CookMateAuthUI = (function () {
  'use strict';

  var state = {
    isPhoLifted: false
  };

  /**
   * Tạo hiệu ứng gợn sóng (Ripple effect) khi nhấn nút
   */
  function createRipple(event, button) {
    var rect = button.getBoundingClientRect();
    var ripple = document.createElement('span');
    ripple.className = 'auth-ripple';
    var size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    button.appendChild(ripple);
    setTimeout(function () {
      ripple.remove();
    }, 600);
  }

  /**
   * Kích hoạt chuyển động Bát phở nhấc đũa kéo sợi phở
   */
  function triggerPho(forceState) {
    var stage = document.getElementById('phoStage');
    var cta = document.getElementById('phoCta');

    if (!stage) return;

    if (typeof forceState === 'boolean') {
      state.isPhoLifted = forceState;
    } else {
      state.isPhoLifted = !state.isPhoLifted;
    }

    if (state.isPhoLifted) {
      stage.classList.add('is-lifted');
      if (cta) {
        cta.innerHTML = '<i class="fa-solid fa-utensils"></i> <span>Mời bạn thưởng thức hương vị CookMate!</span>';
      }
    } else {
      stage.classList.remove('is-lifted');
      if (cta) {
        cta.innerHTML = '<i class="fa-solid fa-hand-pointer"></i> <span>Chạm vào đôi đũa để gắp phở Hà Nội</span>';
      }
    }
  }

  /**
   * Thiết lập tính năng ẩn/hiện mật khẩu cho tất cả các nút eye icon
   */
  function setupPasswordToggles() {
    var toggleBtns = document.querySelectorAll('.password-toggle-btn');
    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = btn.getAttribute('data-target');
        var input = targetId ? document.getElementById(targetId) : btn.parentElement.querySelector('input');
        if (!input) return;

        var isPw = input.type === 'password';
        input.type = isPw ? 'text' : 'password';

        var icon = btn.querySelector('i');
        if (icon) {
          if (isPw) {
            icon.className = 'fa-regular fa-eye-slash';
            btn.setAttribute('aria-label', 'Ẩn mật khẩu');
          } else {
            icon.className = 'fa-regular fa-eye';
            btn.setAttribute('aria-label', 'Hiện mật khẩu');
          }
        }
      });
    });
  }

  /**
   * Đo lường độ mạnh mật khẩu và cập nhật 4 vạch chỉ báo
   */
  function setupPasswordStrength() {
    var regPassword = document.getElementById('regPassword');
    var segs = [
      document.getElementById('seg1'),
      document.getElementById('seg2'),
      document.getElementById('seg3'),
      document.getElementById('seg4')
    ];
    var strengthText = document.getElementById('strengthText');

    if (!regPassword || !segs[0]) return;

    var labels = ['', 'Yếu', 'Trung bình', 'Khá', 'Rất mạnh'];
    var colors = ['', '#EF4444', '#F59E0B', '#16A34A', '#2E7D4F'];

    function evaluate(pw) {
      if (!pw || pw.length === 0) return 0;
      var score = 0;
      if (pw.length >= 6) score++;
      if (pw.length >= 10) score++;
      if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
      if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
      return Math.min(score, 4);
    }

    regPassword.addEventListener('input', function () {
      var val = regPassword.value;
      var score = evaluate(val);

      segs.forEach(function (seg, index) {
        seg.className = 'auth-strength-seg';
        if (index < score) {
          var cls = score === 1 ? 'active-weak' : score === 2 ? 'active-fair' : score === 3 ? 'active-good' : 'active-strong';
          seg.classList.add(cls);
        }
      });

      if (strengthText) {
        if (!val) {
          strengthText.textContent = 'Tối thiểu 6 ký tự';
          strengthText.style.color = '#78716C';
        } else {
          strengthText.textContent = labels[score] || 'Quá ngắn';
          strengthText.style.color = colors[score] || '#78716C';
        }
      }
    });
  }

  /**
   * Điền nhanh tài khoản mẫu (1-Click Demo Account Quick Fill)
   */
  function setupDemoAccounts() {
    var demoCards = document.querySelectorAll('.auth-demo-card');
    demoCards.forEach(function (card) {
      card.addEventListener('click', function () {
        var email = card.getAttribute('data-email');
        var pass = card.getAttribute('data-password');

        var emailInput = document.getElementById('loginEmail');
        var passInput = document.getElementById('loginPassword');
        if (emailInput) {
          emailInput.value = email;
          emailInput.classList.remove('input-error');
        }
        if (passInput) {
          passInput.value = pass;
          passInput.classList.remove('input-error');
        }

        var errEmail = document.getElementById('loginEmailError');
        var errPass = document.getElementById('loginPasswordError');
        if (errEmail) errEmail.classList.remove('is-visible');
        if (errPass) errPass.classList.remove('is-visible');

        // Kích hoạt nhấc đũa phở chào mừng
        triggerPho(true);

        if (typeof CookMateUI !== 'undefined') {
          CookMateUI.showToast('Đã nạp tài khoản mẫu: ' + email, 'info');
        }
      });
    });
  }

  /**
   * Xử lý gửi Form Đăng nhập
   */
  function setupLoginForm() {
    var form = document.getElementById('loginForm');
    var submitBtn = document.getElementById('loginSubmitBtn');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = document.getElementById('loginEmail');
      var passInput = document.getElementById('loginPassword');
      var emailErr = document.getElementById('loginEmailError');
      var passErr = document.getElementById('loginPasswordError');

      // Reset errors
      if (emailInput) emailInput.classList.remove('input-error');
      if (passInput) passInput.classList.remove('input-error');
      if (emailErr) emailErr.classList.remove('is-visible');
      if (passErr) passErr.classList.remove('is-visible');

      var email = emailInput ? emailInput.value.trim() : '';
      var password = passInput ? passInput.value : '';
      var hasError = false;

      // Validation
      if (!email) {
        if (emailInput) emailInput.classList.add('input-error');
        if (emailErr) {
          emailErr.textContent = 'Email không được để trống';
          emailErr.classList.add('is-visible');
        }
        hasError = true;
      } else if (typeof isValidEmail === 'function' && !isValidEmail(email)) {
        if (emailInput) emailInput.classList.add('input-error');
        if (emailErr) {
          emailErr.textContent = 'Định dạng email không hợp lệ';
          emailErr.classList.add('is-visible');
        }
        hasError = true;
      }

      if (!password) {
        if (passInput) passInput.classList.add('input-error');
        if (passErr) {
          passErr.textContent = 'Mật khẩu không được để trống';
          passErr.classList.add('is-visible');
        }
        hasError = true;
      }

      if (hasError) return;

      // Loading state
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang xác thực...</span>';
      }

      setTimeout(function () {
        // Kiểm tra thông tin đăng nhập trong demo credentials + localStorage
        var demoCreds = typeof DEMO_CREDENTIALS !== 'undefined' ? DEMO_CREDENTIALS : [];
        var savedCreds = typeof CookMateStorage !== 'undefined' ? CookMateStorage.get('cookmate_demo_creds') || [] : [];
        var allCreds = demoCreds.concat(savedCreds);

        var match = allCreds.find(function (c) {
          return c.email.toLowerCase() === email.toLowerCase() && c.passwordHint === password;
        });

        if (match && typeof CookMateStorage !== 'undefined') {
          var allUsers = CookMateStorage.getAllUsers();
          var user = allUsers.find(function (u) {
            return u.id === match.userId || u.email.toLowerCase() === email.toLowerCase();
          });

          if (user) {
            CookMateStorage.setCurrentUser(user);
            if (typeof CookMateUI !== 'undefined') {
              CookMateUI.showToast('Đăng nhập thành công! Chào mừng ' + user.name, 'success');
            }
            if (typeof Navigation !== 'undefined') {
              Navigation.updateAuthArea();
              if (typeof updateFavoriteBadge === 'function') updateFavoriteBadge();
            }

            if (submitBtn) {
              submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Thành công!</span>';
            }

            // Hiệu ứng phở bay bổng khi đăng nhập thành công
            triggerPho(true);

            setTimeout(function () {
              window.location.href = '../../index.html';
            }, 800);
            return;
          }
        }

        // Thất bại
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> <span>Đăng nhập</span>';
        }

        if (passInput) passInput.classList.add('input-error');
        if (passErr) {
          passErr.textContent = 'Email hoặc mật khẩu không chính xác';
          passErr.classList.add('is-visible');
        }

        if (typeof CookMateUI !== 'undefined') {
          CookMateUI.showToast('Email hoặc mật khẩu không đúng', 'error');
        }
      }, 400);
    });
  }

  /**
   * Xử lý gửi Form Đăng ký
   */
  function setupRegisterForm() {
    var form = document.getElementById('registerForm');
    var submitBtn = document.getElementById('regSubmitBtn');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput = document.getElementById('regName');
      var emailInput = document.getElementById('regEmail');
      var passInput = document.getElementById('regPassword');
      var confirmInput = document.getElementById('regConfirm');
      var termsCheck = document.getElementById('regTerms');

      var nameErr = document.getElementById('regNameError');
      var emailErr = document.getElementById('regEmailError');
      var passErr = document.getElementById('regPasswordError');
      var confirmErr = document.getElementById('regConfirmError');

      // Clear errors
      [nameInput, emailInput, passInput, confirmInput].forEach(function (inp) {
        if (inp) inp.classList.remove('input-error');
      });
      [nameErr, emailErr, passErr, confirmErr].forEach(function (err) {
        if (err) err.classList.remove('is-visible');
      });

      var name = nameInput ? nameInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';
      var password = passInput ? passInput.value : '';
      var confirm = confirmInput ? confirmInput.value : '';
      var hasError = false;

      // 1. Validate Họ tên
      if (!name) {
        if (nameInput) nameInput.classList.add('input-error');
        if (nameErr) {
          nameErr.textContent = 'Họ và tên không được để trống';
          nameErr.classList.add('is-visible');
        }
        hasError = true;
      }

      // 2. Validate Email
      if (!email) {
        if (emailInput) emailInput.classList.add('input-error');
        if (emailErr) {
          emailErr.textContent = 'Email không được để trống';
          emailErr.classList.add('is-visible');
        }
        hasError = true;
      } else if (typeof isValidEmail === 'function' && !isValidEmail(email)) {
        if (emailInput) emailInput.classList.add('input-error');
        if (emailErr) {
          emailErr.textContent = 'Định dạng email không hợp lệ';
          emailErr.classList.add('is-visible');
        }
        hasError = true;
      }

      // 3. Validate Mật khẩu
      if (!password) {
        if (passInput) passInput.classList.add('input-error');
        if (passErr) {
          passErr.textContent = 'Mật khẩu không được để trống';
          passErr.classList.add('is-visible');
        }
        hasError = true;
      } else if (password.length < 6) {
        if (passInput) passInput.classList.add('input-error');
        if (passErr) {
          passErr.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
          passErr.classList.add('is-visible');
        }
        hasError = true;
      }

      // 4. Validate Xác nhận mật khẩu
      if (!confirm) {
        if (confirmInput) confirmInput.classList.add('input-error');
        if (confirmErr) {
          confirmErr.textContent = 'Vui lòng xác nhận mật khẩu';
          confirmErr.classList.add('is-visible');
        }
        hasError = true;
      } else if (password !== confirm) {
        if (confirmInput) confirmInput.classList.add('input-error');
        if (confirmErr) {
          confirmErr.textContent = 'Mật khẩu xác nhận không khớp';
          confirmErr.classList.add('is-visible');
        }
        hasError = true;
      }

      // 5. Check điều khoản
      if (termsCheck && !termsCheck.checked) {
        if (typeof CookMateUI !== 'undefined') {
          CookMateUI.showToast('Vui lòng đồng ý với Điều khoản dịch vụ & Chính sách của CookMate', 'warning');
        }
        hasError = true;
      }

      if (hasError) return;

      // Kiểm tra trùng email
      if (typeof CookMateStorage !== 'undefined') {
        var allUsers = CookMateStorage.getAllUsers();
        var exists = allUsers.some(function (u) {
          return u.email.toLowerCase() === email.toLowerCase();
        });
        if (exists) {
          if (emailInput) emailInput.classList.add('input-error');
          if (emailErr) {
            emailErr.textContent = 'Email này đã được sử dụng';
            emailErr.classList.add('is-visible');
          }
          return;
        }
      }

      // Loading
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang khởi tạo tài khoản...</span>';
      }

      setTimeout(function () {
        if (typeof CookMateStorage !== 'undefined') {
          var res = CookMateStorage.registerUser({
            name: name,
            email: email,
            password: password
          });

          if (res && !res.error) {
            if (typeof CookMateUI !== 'undefined') {
              CookMateUI.showToast('Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng nhập...', 'success');
            }

            // Hiệu ứng phở khi đăng ký thành công
            triggerPho(true);

            setTimeout(function () {
              window.location.href = 'login.html';
            }, 1000);
            return;
          } else {
            if (typeof CookMateUI !== 'undefined') {
              CookMateUI.showToast(res.error || 'Có lỗi khi đăng ký', 'error');
            }
          }
        }

        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> <span>Đăng ký tài khoản</span>';
        }
      }, 500);
    });
  }

  /**
   * Phương thức tiếp tục với Google & Facebook (Lỗi 5)
   */
  function setupSocialAuth() {
    var btnGoogle = document.getElementById('btnGoogleAuth');
    var btnFacebook = document.getElementById('btnFacebookAuth');

    if (btnGoogle) {
      btnGoogle.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof CookMateUI !== 'undefined') {
          CookMateUI.showToast('Phương thức tiếp tục với Google đang được phát triển và sẽ sớm ra mắt!', 'info');
        }
      });
    }

    if (btnFacebook) {
      btnFacebook.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof CookMateUI !== 'undefined') {
          CookMateUI.showToast('Phương thức tiếp tục với Facebook đang được phát triển và sẽ sớm ra mắt!', 'info');
        }
      });
    }
  }

  /**
   * Khởi tạo toàn bộ tương tác Auth
   */
  function init() {
    // 1. Kiểm tra session hiện tại - Nếu đã đăng nhập, chuyển về trang chủ
    if (typeof CookMateStorage !== 'undefined' && CookMateStorage.isLoggedIn()) {
      window.location.href = '../../index.html';
      return;
    }

    // 2. Tương tác Bát phở Hà Nội
    var stage = document.getElementById('phoStage');
    if (stage) {
      stage.addEventListener('click', function () {
        triggerPho();
      });
      stage.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerPho();
        }
      });
    }

    // 3. Hiệu ứng Ripple trên các nút hành động
    document.querySelectorAll('.auth-action-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        createRipple(e, btn);
      });
    });

    // 4. Cài đặt các tính năng con
    setupPasswordToggles();
    setupPasswordStrength();
    setupDemoAccounts();
    setupLoginForm();
    setupRegisterForm();
    setupSocialAuth();

    console.log('🍜 CookMate Pho Auth UI V2 initialized successfully');
  }

  return {
    init: init,
    triggerPho: triggerPho
  };
})();
