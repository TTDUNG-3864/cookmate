// ===================================================================
// CookMate - LocalStorage Management
// ===================================================================

var CookMateStorage = {
  KEYS: {
    USER: 'cookmate_current_user',
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
  // Current user session
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
    return this.set(this.KEYS.USER, safeUser);
  },

  clearCurrentUser: function () {
    this.remove(this.KEYS.USER);
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
  // User-created recipes
  // ---------------------------------------------------------------
  getUserRecipes: function () {
    return this.get(this.KEYS.USER_RECIPES) || [];
  },

  addUserRecipe: function (recipe) {
    var recipes = this.getUserRecipes();
    recipe.id = Date.now();
    recipe.createdAt = new Date().toISOString();
    recipe.isNew = true;
    recipes.push(recipe);
    this.set(this.KEYS.USER_RECIPES, recipes);
    return recipe;
  },

  updateUserRecipe: function (id, updates) {
    var recipes = this.getUserRecipes();
    var index = recipes.findIndex(function (r) { return r.id === id; });
    if (index > -1) {
      Object.keys(updates).forEach(function (k) {
        recipes[index][k] = updates[k];
      });
      this.set(this.KEYS.USER_RECIPES, recipes);
      return recipes[index];
    }
    return null;
  },

  deleteUserRecipe: function (id) {
    var recipes = this.getUserRecipes();
    var numId = parseInt(id, 10);
    var filtered = recipes.filter(function (r) { return r.id !== id && r.id !== numId; });
    this.set(this.KEYS.USER_RECIPES, filtered);
    return filtered.length < recipes.length;
  },

  // Aliases for recipe operations
  addRecipe: function (recipe) {
    return this.addUserRecipe(recipe);
  },

  updateRecipe: function (id, updates) {
    return this.updateUserRecipe(id, updates);
  },

  deleteRecipe: function (id) {
    return this.deleteUserRecipe(id);
  },

  getRecipeById: function (id) {
    var numId = parseInt(id, 10);
    return this.getAllRecipes().find(function (r) {
      return r.id === numId || r.id == id;
    });
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
  getAllRecipes: function () {
    var staticRecipes = (typeof RECIPES !== 'undefined') ? RECIPES.slice() : [];
    var userRecipes = this.getUserRecipes();
    return staticRecipes.concat(userRecipes);
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
