// ===================================================================
// CookMate - LocalStorage Management
// ===================================================================

var CookMateStorage = {
  KEYS: {
    USER: 'cookmate_current_user',
    ADMIN_SESSION: 'cookmate_admin_session',
    FAVORITES: 'cookmate_favorites',
    USER_RECIPES: 'cookmate_user_recipes',
    USER_COMMENTS: 'cookmate_user_comments',
    REGISTERED_USERS: 'cookmate_registered_users',
    ADMIN_CATEGORIES: 'cookmate_admin_categories',
    ADMIN_INGREDIENTS: 'cookmate_admin_ingredients',
    THEME: 'cookmate_theme'
  },

  get: function (key) {
    try {
      var data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('CookMateStorage: Error reading', key, e);
      return null;
    }
  },

  set: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('CookMateStorage: Error writing', key, e);
      return false;
    }
  },

  remove: function (key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('CookMateStorage: Error removing', key, e);
    }
  },

  // ---------------------------------------------------------------
  // Current user session & Admin session isolation
  // ---------------------------------------------------------------
  getCurrentUser: function () {
    return this.get(this.KEYS.USER);
  },

  setCurrentUser: function (user) {
    // Never store password
    var safeUser = {};
    Object.keys(user).forEach(function (k) {
      if (k !== 'password' && k !== 'passwordHint') {
        safeUser[k] = user[k];
      }
    });

    var result = this.set(this.KEYS.USER, safeUser);

    // Synchronize or isolate Admin Session:
    if (safeUser.role === 'admin') {
      this.setAdminSession(safeUser);
    } else {
      // If a non-admin logs in at top level, invalidate any stale admin session
      if (window.self === window.top) {
        this.clearAdminSession();
      }
    }

    return result;
  },

  clearCurrentUser: function () {
    this.remove(this.KEYS.USER);
  },

  getAdminSession: function () {
    var session = this.get(this.KEYS.ADMIN_SESSION);
    if (session && session.role === 'admin') {
      return session;
    }
    // Fallback: Check if current active user is admin
    var user = this.getCurrentUser();
    if (user && user.role === 'admin') {
      var adminSess = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin',
        loginTime: Date.now()
      };
      this.set(this.KEYS.ADMIN_SESSION, adminSess);
      return adminSess;
    }
    return null;
  },

  setAdminSession: function (user) {
    if (user && user.role === 'admin') {
      return this.set(this.KEYS.ADMIN_SESSION, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin',
        loginTime: Date.now()
      });
    }
    return false;
  },

  clearAdminSession: function () {
    this.remove(this.KEYS.ADMIN_SESSION);
  },

  isAdminSessionValid: function () {
    return this.getAdminSession() !== null;
  },

  isLoggedIn: function () {
    return this.getCurrentUser() !== null;
  },

  isAdmin: function () {
    var user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  // ---------------------------------------------------------------
  // Favorites
  // ---------------------------------------------------------------
  getFavorites: function () {
    return this.get(this.KEYS.FAVORITES) || [];
  },

  toggleFavorite: function (recipeId) {
    var favs = this.getFavorites();
    var index = favs.indexOf(recipeId);
    if (index > -1) {
      favs.splice(index, 1);
    } else {
      favs.push(recipeId);
    }
    this.set(this.KEYS.FAVORITES, favs);
    return index === -1; // true if added, false if removed
  },

  isFavorite: function (recipeId) {
    return this.getFavorites().includes(recipeId);
  },

  // ---------------------------------------------------------------
  // User-created recipes & Approval Workflow
  // ---------------------------------------------------------------
  getUserRecipes: function () {
    return this.get(this.KEYS.USER_RECIPES) || [];
  },

  addUserRecipe: function (recipe, user) {
    var recipes = this.getUserRecipes();
    var currentUser = user || this.getCurrentUser();

    if (!recipe.id) {
      recipe.id = Date.now();
    }
    recipe.createdAt = recipe.createdAt || new Date().toISOString();
    recipe.isNew = true;

    if (currentUser) {
      recipe.authorId = recipe.authorId || currentUser.id;
      recipe.authorName = recipe.authorName || currentUser.name;
    }

    // Role-based status: Admin directly approves, Member is pending
    if (currentUser && currentUser.role === 'admin') {
      recipe.status = 'approved';
      recipe.approvedAt = new Date().toISOString();
      recipe.approvedBy = currentUser.name;
      recipe.rejectionReason = null;
    } else {
      recipe.status = recipe.status || 'pending';
      recipe.rejectionReason = null;
    }

    recipes.push(recipe);
    this.set(this.KEYS.USER_RECIPES, recipes);
    return recipe;
  },

  updateUserRecipe: function (id, updates, user) {
    var recipes = this.getUserRecipes();
    var index = recipes.findIndex(function (r) {
      return r.id === id || r.id == id || String(r.id) === String(id);
    });
    if (index > -1) {
      var current = recipes[index];
      var currentUser = user || this.getCurrentUser();

      // If resubmitting a previously rejected recipe
      if (updates.resubmit || (current.status === 'rejected' && (!currentUser || currentUser.role !== 'admin'))) {
        updates.status = 'pending';
        updates.rejectionReason = null;
        updates.resubmittedAt = new Date().toISOString();
      }

      Object.keys(updates).forEach(function (k) {
        if (k !== 'resubmit') {
          recipes[index][k] = updates[k];
        }
      });
      recipes[index].updatedAt = new Date().toISOString();
      this.set(this.KEYS.USER_RECIPES, recipes);
      return recipes[index];
    }
    return null;
  },

  deleteUserRecipe: function (id) {
    var recipes = this.getUserRecipes();
    var filtered = recipes.filter(function (r) {
      return r.id !== id && r.id != id && String(r.id) !== String(id);
    });
    this.set(this.KEYS.USER_RECIPES, filtered);
    return filtered.length < recipes.length;
  },

  // Aliases for recipe operations
  addRecipe: function (recipe, user) {
    return this.addUserRecipe(recipe, user);
  },

  updateRecipe: function (id, updates, user) {
    return this.updateUserRecipe(id, updates, user);
  },

  deleteRecipe: function (id) {
    return this.deleteUserRecipe(id);
  },

  // Recipe Approval Lifecycle Methods
  getPendingRecipes: function () {
    return this.getUserRecipes().filter(function (r) {
      return r.status === 'pending';
    });
  },

  getRejectedRecipes: function () {
    return this.getUserRecipes().filter(function (r) {
      return r.status === 'rejected';
    });
  },

  getApprovedRecipes: function () {
    return this.getAllRecipes(false);
  },

  approveRecipe: function (id, adminUser) {
    var recipes = this.getUserRecipes();
    var index = recipes.findIndex(function (r) {
      return r.id === id || r.id == id || String(r.id) === String(id);
    });
    if (index > -1) {
      var admin = adminUser || this.getCurrentUser();
      recipes[index].status = 'approved';
      recipes[index].approvedAt = new Date().toISOString();
      recipes[index].approvedBy = admin ? admin.name : 'Quản trị viên';
      recipes[index].rejectionReason = null;
      this.set(this.KEYS.USER_RECIPES, recipes);
      return recipes[index];
    }
    return null;
  },

  rejectRecipe: function (id, reason, adminUser) {
    var recipes = this.getUserRecipes();
    var index = recipes.findIndex(function (r) {
      return r.id === id || r.id == id || String(r.id) === String(id);
    });
    if (index > -1) {
      var admin = adminUser || this.getCurrentUser();
      recipes[index].status = 'rejected';
      recipes[index].rejectedAt = new Date().toISOString();
      recipes[index].rejectedBy = admin ? admin.name : 'Quản trị viên';
      recipes[index].rejectionReason = reason || 'Công thức chưa đáp ứng đầy đủ tiêu chuẩn định lượng của CookMate.';
      this.set(this.KEYS.USER_RECIPES, recipes);
      return recipes[index];
    }
    return null;
  },

  getRecipeById: function (id, includeUnapproved) {
    var all = this.getAllRecipesRaw();
    var found = all.find(function (r) {
      return r.id === id || r.id == id || String(r.id) === String(id);
    });
    if (!found) return null;

    if (includeUnapproved || found.status === 'approved' || !found.status) {
      return found;
    }

    var currentUser = this.getCurrentUser();
    if (currentUser && (currentUser.role === 'admin' || currentUser.id === found.authorId)) {
      return found;
    }

    return null;
  },

  getCategoryById: function (id) {
    var numId = parseInt(id, 10);
    return this.getAllCategories().find(function (c) {
      return c.id === numId || c.id == id || c.slug === id;
    });
  },

  updateUser: function (updatedUser) {
    var users = this.getRegisteredUsers();
    var idx = users.findIndex(function (u) { return u.id === updatedUser.id; });
    if (idx !== -1) {
      users[idx] = Object.assign(users[idx], updatedUser);
      this.set(this.KEYS.REGISTERED_USERS, users);
    }
    var current = this.getCurrentUser();
    if (current && current.id === updatedUser.id) {
      this.setCurrentUser(Object.assign(current, updatedUser));
    }
    return true;
  },

  // ---------------------------------------------------------------
  // Comments
  // ---------------------------------------------------------------
  getUserComments: function () {
    return this.get(this.KEYS.USER_COMMENTS) || [];
  },

  addComment: function (recipeId, content) {
    var user = this.getCurrentUser();
    if (!user) return null;
    var comments = this.getUserComments();
    var comment = {
      id: Date.now(),
      recipeId: recipeId,
      userId: user.id,
      userName: user.name,
      content: content,
      createdAt: new Date().toISOString()
    };
    comments.push(comment);
    this.set(this.KEYS.USER_COMMENTS, comments);
    return comment;
  },

  deleteComment: function (commentId) {
    var comments = this.getUserComments();
    var filtered = comments.filter(function (c) { return c.id !== commentId; });
    this.set(this.KEYS.USER_COMMENTS, filtered);
    return filtered.length < comments.length;
  },

  getCommentsForRecipe: function (recipeId) {
    return this.getUserComments().filter(function (c) { return c.recipeId === recipeId; });
  },

  // ---------------------------------------------------------------
  // Registered users
  // ---------------------------------------------------------------
  getRegisteredUsers: function () {
    return this.get(this.KEYS.REGISTERED_USERS) || [];
  },

  registerUser: function (userData, emailArg, passArg) {
    if (typeof userData === 'string') {
      userData = { name: userData, email: emailArg, password: passArg };
    }
    userData = userData || {};
    var users = this.getRegisteredUsers();
    var emailExists = users.some(function (u) { return u.email === userData.email; });

    // Also check static USERS array if available
    if (!emailExists && typeof USERS !== 'undefined') {
      emailExists = USERS.some(function (u) { return u.email === userData.email; });
    }

    if (emailExists) return { error: 'Email đã được sử dụng' };

    var newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      role: 'member',
      avatar: '',
      joinDate: new Date().toISOString().split('T')[0],
      bio: '',
      recipeCount: 0,
      status: 'active'
    };
    users.push(newUser);
    this.set(this.KEYS.REGISTERED_USERS, users);

    // Store password hint separately (demo only, NOT secure)
    var creds = this.get('cookmate_demo_creds') || [];
    creds.push({
      email: userData.email,
      passwordHint: userData.password,
      userId: newUser.id
    });
    this.set('cookmate_demo_creds', creds);

    return { user: newUser };
  },

  // ---------------------------------------------------------------
  // Admin categories / ingredients overrides
  // ---------------------------------------------------------------
  getCategories: function () {
    return this.get(this.KEYS.ADMIN_CATEGORIES);
  },

  setCategories: function (cats) {
    this.set(this.KEYS.ADMIN_CATEGORIES, cats);
  },

  getIngredients: function () {
    return this.get(this.KEYS.ADMIN_INGREDIENTS);
  },

  setIngredients: function (ings) {
    this.set(this.KEYS.ADMIN_INGREDIENTS, ings);
  },

  // ---------------------------------------------------------------
  // Get all data combined (static + user-created)
  // ---------------------------------------------------------------
  getAllRecipesRaw: function () {
    var staticRecipes = (typeof RECIPES !== 'undefined') ? RECIPES.slice() : [];
    var userRecipes = this.getUserRecipes();
    return staticRecipes.concat(userRecipes);
  },

  getAllRecipes: function (includeAll) {
    var raw = this.getAllRecipesRaw();
    if (includeAll === true) {
      return raw;
    }
    // Public recipes only: status is 'approved' or untagged static recipe
    return raw.filter(function (r) {
      return r.status === 'approved' || !r.status;
    });
  },

  getAllUsers: function () {
    var staticUsers = (typeof USERS !== 'undefined') ? USERS.slice() : [];
    var registered = this.getRegisteredUsers();
    return staticUsers.concat(registered);
  },

  getAllCategories: function () {
    var saved = this.getCategories();
    if (saved) return saved;
    return (typeof CATEGORIES !== 'undefined') ? CATEGORIES.slice() : [];
  },

  getAllIngredients: function () {
    var saved = this.getIngredients();
    if (saved) return saved;
    return (typeof INGREDIENTS !== 'undefined') ? INGREDIENTS.slice() : [];
  },

  getAllComments: function () {
    var staticComments = [];
    if (typeof RECIPES !== 'undefined') {
      RECIPES.forEach(function (r) {
        if (r.comments) {
          r.comments.forEach(function (c) {
            var copy = {};
            Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
            copy.recipeId = r.id;
            staticComments.push(copy);
          });
        }
      });
    }
    var userComments = this.getUserComments();
    return staticComments.concat(userComments);
  },

  // ---------------------------------------------------------------
  // Reset all demo data
  // ---------------------------------------------------------------
  resetAll: function () {
    var self = this;
    Object.values(this.KEYS).forEach(function (key) {
      self.remove(key);
    });
    this.remove('cookmate_demo_creds');
  }
};
