// ===================================================================
// CookMate - Utility Functions
// ===================================================================

// ===== DOM Utilities =====
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (key === 'className') el.className = val;
    else if (key === 'innerHTML') el.innerHTML = val;
    else if (key === 'textContent') el.textContent = val;
    else if (key.startsWith('data')) el.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), val);
    else if (key === 'style' && typeof val === 'object') Object.assign(el.style, val);
    else el.setAttribute(key, val);
  });
  children.forEach(function (child) {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child) el.appendChild(child);
  });
  return el;
}

// ===== String Utilities =====
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  if (typeof document !== 'undefined' && document.createElement) {
    try {
      var div = document.createElement('div');
      div.textContent = str;
      if (div.innerHTML) return div.innerHTML;
    } catch (e) {
      // Fallback to regex
    }
  }
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateText(text, maxLength) {
  if (maxLength === undefined) maxLength = 100;
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + '...';
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatDate(dateStr) {
  var d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function timeAgo(dateStr) {
  var now = new Date();
  var date = new Date(dateStr);
  var diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
  if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
  if (diff < 2592000) return Math.floor(diff / 86400) + ' ngày trước';
  return formatDate(dateStr);
}

// ===== Number Utilities =====
function roundSmart(num) {
  if (num === 0) return 0;
  if (num < 0.1) return Math.round(num * 100) / 100;
  if (num < 10) return Math.round(num * 4) / 4; // Round to nearest 0.25
  return Math.round(num);
}

function formatFraction(num) {
  if (num === 0) return '0';
  var rounded = roundSmart(num);
  if (rounded === 0.25) return '¼';
  if (rounded === 0.5) return '½';
  if (rounded === 0.75) return '¾';
  if (rounded === 0.33) return '⅓';
  if (rounded === 0.67) return '⅔';
  var whole = Math.floor(rounded);
  var frac = Math.round((rounded - whole) * 100) / 100;
  if (frac === 0) return whole.toString();
  if (frac === 0.25) return whole > 0 ? whole + ' ¼' : '¼';
  if (frac === 0.5) return whole > 0 ? whole + ' ½' : '½';
  if (frac === 0.75) return whole > 0 ? whole + ' ¾' : '¾';
  return rounded.toString();
}

// ===== Validation Utilities =====
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isNotEmpty(value) {
  return value !== null && value !== undefined && value.toString().trim() !== '';
}

function validateRequired(value, fieldName) {
  if (!isNotEmpty(value)) return fieldName + ' không được để trống';
  return null;
}

function validateEmail(email) {
  if (!isNotEmpty(email)) return 'Email không được để trống';
  if (!isValidEmail(email)) return 'Email không đúng định dạng';
  return null;
}

function validatePassword(password) {
  if (!isNotEmpty(password)) return 'Mật khẩu không được để trống';
  if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
  return null;
}

function validatePasswordMatch(password, confirm) {
  if (password !== confirm) return 'Mật khẩu xác nhận không khớp';
  return null;
}

// ===== Image Utilities =====
function getImageUrl(url, fallback) {
  return url || fallback || 'assets/images/placeholders/recipe-placeholder.svg';
}

function handleImageError(img) {
  img.onerror = null;
  img.src = getPlaceholderUrl(img.alt || 'Ảnh món ăn');
}

function getPlaceholderUrl(text) {
  try {
    var canvas = document.createElement('canvas');
    if (!canvas || !canvas.getContext) {
      return getBasePath() + 'assets/images/placeholders/recipe-placeholder.svg';
    }
    canvas.width = 600;
    canvas.height = 400;
    var ctx = canvas.getContext('2d');
    if (!ctx) return getBasePath() + 'assets/images/placeholders/recipe-placeholder.svg';

    // Warm appetizing gradient background
    var grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, '#FFF7ED');
    grad.addColorStop(0.5, '#FFEDD5');
    grad.addColorStop(1, '#FED7AA');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 400);

    // Decorative circles
    ctx.fillStyle = 'rgba(232, 93, 42, 0.05)';
    ctx.beginPath();
    ctx.arc(60, 60, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(540, 340, 130, 0, Math.PI * 2);
    ctx.fill();

    // Central circular badge
    ctx.shadowColor = 'rgba(232, 93, 42, 0.2)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(300, 160, 52, 0, Math.PI * 2);
    ctx.fill();

    var iconGrad = ctx.createLinearGradient(250, 110, 350, 210);
    iconGrad.addColorStop(0, '#E85D2A');
    iconGrad.addColorStop(1, '#C74E22');
    ctx.fillStyle = iconGrad;
    ctx.beginPath();
    ctx.arc(300, 160, 44, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Utensil icon
    ctx.font = '36px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍳', 300, 160);

    // Title / dish name
    var dishName = (text || 'Món ăn ngon').trim();
    if (dishName.length > 28) dishName = dishName.substring(0, 28) + '...';
    ctx.fillStyle = '#292524';
    ctx.font = 'bold 20px "Be Vietnam Pro", -apple-system, sans-serif';
    ctx.fillText(dishName, 300, 250);

    // Brand tagline
    ctx.fillStyle = '#C74E22';
    ctx.font = '600 13px "Be Vietnam Pro", -apple-system, sans-serif';
    ctx.fillText('CookMate • Chuẩn định lượng', 300, 280);

    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (e) {
    return getBasePath() + 'assets/images/placeholders/recipe-placeholder.svg';
  }
}

// ===== URL/Navigation Utilities =====
function getQueryParam(name) {
  var params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getBasePath() {
  if (typeof window === 'undefined' || !window.location) return './';
  var path = (window.location.pathname || '').replace(/\\/g, '/');
  if (path.includes('/pages/admin/')) return '../../';
  if (path.includes('/pages/auth/') || path.includes('/pages/account/')) return '../../';
  if (path.includes('/pages/')) return '../';
  return './';
}

// ===== Debounce =====
function debounce(fn, delay) {
  if (delay === undefined) delay = 300;
  var timer;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}
