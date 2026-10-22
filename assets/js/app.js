// ===================================================================
// CookMate - Application Initialization
// ===================================================================

document.addEventListener('DOMContentLoaded', function () {
  // Initialize navigation (header + footer)
  Navigation.init();
  Navigation.setupHeaderSearch();

  // Update favorites badge
  updateFavoriteBadge();

  // Initialize toast container
  CookMateUI.initToast();

  console.log('🍳 CookMate initialized successfully');
});
