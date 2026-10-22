// ===================================================================
// CookMate - Shared UI Components
// ===================================================================

var CookMateUI = {
  // Toast notifications
  toastContainer: null,

  initToast: function () {
    if (this.toastContainer) return;
    this.toastContainer = createElement('div', {
      className: 'toast-container',
      id: 'toastContainer'
    });
    document.body.appendChild(this.toastContainer);
  },

  showToast: function (message, type, duration) {
    if (!type) type = 'success';
    if (!duration) duration = 3000;

    this.initToast();

    var icons = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      warning: 'fa-triangle-exclamation',
      info: 'fa-circle-info'
    };

    var toast = createElement('div', { className: 'toast toast-' + type });
    toast.innerHTML =
      '<i class="fa-solid ' + (icons[type] || icons.info) + ' toast-icon"></i>' +
      '<span class="toast-message">' + escapeHtml(message) + '</span>' +
      '<button class="toast-close" onclick="this.parentElement.remove()">' +
      '<i class="fa-solid fa-xmark"></i>' +
      '</button>';

    this.toastContainer.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(function () {
      toast.classList.add('toast-show');
    });

    setTimeout(function () {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, duration);
  },

  // ---------------------------------------------------------------
  // Modal
  // ---------------------------------------------------------------
  showModal: function (options) {
    if (!options) options = {};
    var title = options.title || '';
    var content = options.content || '';
    var footer = options.footer || '';
    var size = options.size || 'medium';
    var onClose = options.onClose || null;

    // Remove existing modal
    var existing = document.getElementById('cookmate-modal');
    if (existing) existing.remove();

    var modal = createElement('div', { className: 'modal', id: 'cookmate-modal' });
    modal.innerHTML =
      '<div class="modal-backdrop"></div>' +
      '<div class="modal-dialog modal-' + size + '">' +
      '<div class="modal-header">' +
      '<h3 class="modal-title">' + title + '</h3>' +
      '<button class="modal-close" id="modalCloseBtn">' +
      '<i class="fa-solid fa-xmark"></i>' +
      '</button>' +
      '</div>' +
      '<div class="modal-body">' + content + '</div>' +
      (footer ? '<div class="modal-footer">' + footer + '</div>' : '') +
      '</div>';

    document.body.appendChild(modal);
    requestAnimationFrame(function () {
      modal.classList.add('modal-show');
    });

    var closeModal = function () {
      modal.classList.remove('modal-show');
      setTimeout(function () {
        modal.remove();
        if (onClose) onClose();
      }, 300);
    };

    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('#modalCloseBtn').addEventListener('click', closeModal);

    var escHandler = function (e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    return { modal: modal, close: closeModal };
  },

  // ---------------------------------------------------------------
  // Confirm dialog
  // ---------------------------------------------------------------
  showConfirm: function (message, onConfirm, onCancel) {
    var result = this.showModal({
      title: 'Xác nhận',
      content: '<p style="margin: 0; font-size: 15px;">' + escapeHtml(message) + '</p>',
      footer:
        '<button class="btn btn-secondary" id="confirmCancel">Hủy</button>' +
        '<button class="btn btn-danger" id="confirmOk">Xác nhận</button>',
      size: 'small',
      onClose: onCancel
    });

    var modalEl = result.modal;

    var okBtn = modalEl.querySelector('#confirmOk');
    if (okBtn) {
      okBtn.addEventListener('click', function () {
        var m = document.getElementById('cookmate-modal');
        if (m) m.remove();
        if (onConfirm) onConfirm();
      });
    }

    var cancelBtn = modalEl.querySelector('#confirmCancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        var m = document.getElementById('cookmate-modal');
        if (m) m.remove();
        if (onCancel) onCancel();
      });
    }

    return result;
  },

  // ---------------------------------------------------------------
  // Recipe card HTML generator
  // ---------------------------------------------------------------
  createRecipeCard: function (recipe, options) {
    if (!options) options = {};
    var showAuthor = options.showAuthor || false;
    var showActions = options.showActions !== undefined ? options.showActions : true;
    var linkBase = options.linkBase || '';
    var isFeatured = recipe.isFeatured || options.showFeaturedBadge;
    var isNew = recipe.isNew || options.showNewBadge;

    var isFav = CookMateStorage.isFavorite(recipe.id);
    var category = null;
    if (typeof CATEGORIES !== 'undefined') {
      category = CATEGORIES.find(function (c) { return c.id === recipe.categoryId; });
    }

    var detailUrl = (linkBase || getBasePath()) + 'pages/recipe-detail.html?id=' + recipe.id;
    var totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    var ratingVal = Number(recipe.rating || 4.8).toFixed(1);
    var viewsText = formatNumber(recipe.views || 0) + ' lượt xem';

    var html = '';
    html += '<article class="recipe-card" data-recipe-id="' + recipe.id + '">';

    // 1. Ảnh món ăn
    html += '<a href="' + detailUrl + '" class="recipe-card__image-link">';
    html += '<div class="recipe-card__image">';
    html += '<img src="' + (recipe.image || '') + '" alt="' + escapeHtml(recipe.title) + '" onerror="handleImageError(this)" loading="lazy">';
    if (isFeatured) {
      html += '<span class="recipe-card__badge badge-featured"><i class="fa-solid fa-fire"></i> Nổi bật</span>';
    }
    if (isNew) {
      html += '<span class="recipe-card__badge badge-new">Mới</span>';
    }
    html += '</div></a>';

    // 2. Nội dung món ăn
    html += '<div class="recipe-card__content">';
    if (category) {
      html += '<span class="recipe-card__category">' + escapeHtml(category.name) + '</span>';
    }
    html += '<h3 class="recipe-card__title"><a href="' + detailUrl + '">' + escapeHtml(recipe.title) + '</a></h3>';
    html += '<p class="recipe-card__desc">' + escapeHtml(truncateText(recipe.description, 80)) + '</p>';

    // 3. Dòng sao đánh giá nằm ngay dưới mô tả ngắn
    html += '<div class="recipe-card__rating-line">';
    html += '  <span class="rating-stars-wrap">' + renderStars(recipe.rating || 4.8) + '</span>';
    html += '  <span class="rating-score-group"><strong class="rating-score">' + ratingVal + '</strong><span class="rating-max">/5</span></span>';
    html += '  <span class="rating-dot">•</span>';
    html += '  <span class="rating-count">' + viewsText + '</span>';
    html += '</div>';

    // Tác giả nếu có yêu cầu hiển thị
    if (showAuthor && recipe.authorName) {
      html += '<div class="recipe-card__author">';
      html += '<i class="fa-solid fa-user-circle"></i> ';
      html += '<span>' + escapeHtml(recipe.authorName) + '</span>';
      html += '</div>';
    }

    // 4. Footer chân thẻ: Meta info bên trái + Nút Favorite bên phải
    html += '<div class="recipe-card__footer">';
    html += '<div class="recipe-card__meta">';
    if (totalTime > 0) {
      html += '<span class="recipe-card__meta-item" title="Tổng thời gian"><i class="fa-regular fa-clock"></i> ' + totalTime + 'p</span>';
    }
    if (recipe.difficulty) {
      html += '<span class="recipe-card__meta-item" title="Độ khó"><i class="fa-solid fa-signal"></i> ' + escapeHtml(recipe.difficulty) + '</span>';
    }
    if (recipe.servings) {
      html += '<span class="recipe-card__meta-item" title="Khẩu phần"><i class="fa-solid fa-users"></i> ' + recipe.servings + ' người</span>';
    }
    html += '</div>';

    if (showActions) {
      html += '<button class="btn-favorite ' + (isFav ? 'is-favorite' : '') + '" ';
      html += 'onclick="event.preventDefault(); event.stopPropagation(); toggleFavoriteFromCard(' + recipe.id + ', this)" ';
      html += 'title="' + (isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích') + '" ';
      html += 'aria-label="' + (isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích') + '">';
      html += '<i class="fa-' + (isFav ? 'solid' : 'regular') + ' fa-heart"></i>';
      html += '</button>';
    }
    html += '</div>'; // .recipe-card__footer

    html += '</div>'; // .recipe-card__content
    html += '</article>';

    return html;
  },

  // ---------------------------------------------------------------
  // Category card
  // ---------------------------------------------------------------
  createCategoryCard: function (category, linkBase) {
    var url = (linkBase || getBasePath()) + 'pages/categories.html?id=' + category.id;
    var html = '';
    html += '<a href="' + url + '" class="category-card">';
    html += '<div class="category-card__image">';
    html += '<img src="' + (category.image || '') + '" alt="' + escapeHtml(category.name) + '" onerror="handleImageError(this)" loading="lazy">';
    html += '<span class="category-card__badge"><i class="fa-solid ' + (category.icon || 'fa-utensils') + '"></i></span>';
    html += '</div>';
    html += '<div class="category-card__content">';
    html += '<h3 class="category-card__name">' + escapeHtml(category.name) + '</h3>';
    html += '<span class="category-card__count"><i class="fa-solid fa-book-open"></i> ' + (category.recipeCount || 0) + ' công thức</span>';
    html += '</div>';
    html += '</a>';
    return html;
  },

  // Star rating (proxy to global)
  renderStars: function (rating) {
    return renderStars(rating);
  },

  // ---------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------
  createEmptyState: function (icon, title, description, actionHtml) {
    if (!actionHtml) actionHtml = '';
    var html = '';
    html += '<div class="empty-state">';
    html += '<div class="empty-state__icon"><i class="fa-solid ' + icon + '"></i></div>';
    html += '<h3 class="empty-state__title">' + escapeHtml(title) + '</h3>';
    html += '<p class="empty-state__desc">' + escapeHtml(description) + '</p>';
    html += actionHtml;
    html += '</div>';
    return html;
  },

  // ---------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------
  createPagination: function (currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) return '';

    var html = '<div class="pagination">';

    // Previous button
    html += '<button class="pagination__btn ' + (currentPage === 1 ? 'disabled' : '') + '" ';
    if (currentPage > 1) {
      html += 'onclick="' + onPageChange + '(' + (currentPage - 1) + ')"';
    } else {
      html += 'disabled';
    }
    html += '><i class="fa-solid fa-chevron-left"></i></button>';

    // Page numbers
    for (var i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
        if (i === 3 || i === totalPages - 2) {
          html += '<span class="pagination__dots">...</span>';
        }
        continue;
      }
      html += '<button class="pagination__btn ' + (i === currentPage ? 'active' : '') + '" ';
      html += 'onclick="' + onPageChange + '(' + i + ')">' + i + '</button>';
    }

    // Next button
    html += '<button class="pagination__btn ' + (currentPage === totalPages ? 'disabled' : '') + '" ';
    if (currentPage < totalPages) {
      html += 'onclick="' + onPageChange + '(' + (currentPage + 1) + ')"';
    } else {
      html += 'disabled';
    }
    html += '><i class="fa-solid fa-chevron-right"></i></button>';

    html += '</div>';
    return html;
  }
};

// ===================================================================
// Global helper functions
// ===================================================================

function renderStars(rating) {
  var stars = '';
  var num = Number(rating) || 0;
  for (var i = 1; i <= 5; i++) {
    if (i <= Math.floor(num)) {
      stars += '<i class="fa-solid fa-star star-filled"></i>';
    } else if (i - 0.5 <= num) {
      stars += '<i class="fa-solid fa-star-half-stroke star-filled"></i>';
    } else {
      stars += '<i class="fa-regular fa-star star-empty"></i>';
    }
  }
  return '<span class="stars" title="' + num.toFixed(1) + '/5 sao">' + stars + '</span>';
}

function toggleFavoriteFromCard(recipeId, btn) {
  if (!CookMateStorage.isLoggedIn()) {
    CookMateUI.showToast('Vui lòng đăng nhập để thêm yêu thích', 'warning');
    return;
  }
  var added = CookMateStorage.toggleFavorite(recipeId);
  var icon = btn.querySelector('i');
  if (added) {
    btn.classList.add('is-favorite');
    icon.className = 'fa-solid fa-heart';
    CookMateUI.showToast('Đã thêm vào yêu thích', 'success');
  } else {
    btn.classList.remove('is-favorite');
    icon.className = 'fa-regular fa-heart';
    CookMateUI.showToast('Đã xóa khỏi yêu thích', 'info');
  }
  // Update badge count
  updateFavoriteBadge();
}

function updateFavoriteBadge() {
  var count = CookMateStorage.getFavorites().length;
  var badge = document.getElementById('favCountBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  var mobileBadge = document.getElementById('mobileFavBadge');
  if (mobileBadge) {
    mobileBadge.textContent = count;
    mobileBadge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

// ===================================================================
// Form validation helpers
// ===================================================================

function showFieldError(input, message) {
  input.classList.add('input-error');
  var errorEl = input.parentElement.querySelector('.form-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function clearFieldError(input) {
  input.classList.remove('input-error');
  var errorEl = input.parentElement.querySelector('.form-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}

function clearAllErrors(form) {
  form.querySelectorAll('.input-error').forEach(function (el) {
    el.classList.remove('input-error');
  });
  form.querySelectorAll('.form-error').forEach(function (el) {
    el.textContent = '';
    el.style.display = 'none';
  });
}
