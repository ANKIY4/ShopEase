const CART_KEY = "shopease_cart";
const WISHLIST_KEY = "shopease_wishlist";

// Reads JSON data from localStorage with a safe fallback value.
function getStorageValue(key, defaultValue) {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return defaultValue;

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return defaultValue;
  }
}

// Stores JSON data in localStorage.
function setStorageValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Converts a number into Nepalese Rupee currency format.
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0
  }).format(Number(amount));
}

// Finds a product from PRODUCT_DATA by numeric id.
function findProductById(productId) {
  return PRODUCT_DATA.find((product) => product.id === Number(productId));
}

// Reads current cart array from localStorage.
function getCart() {
  return getStorageValue(CART_KEY, []);
}

// Saves updated cart array and refreshes cart badge.
function saveCart(cartItems) {
  setStorageValue(CART_KEY, cartItems);
  updateCartCount();
}

// Adds one product with quantity into cart or increments existing entry.
function addToCart(productId, quantity = 1) {
  const cartItems = getCart();
  const existingIndex = cartItems.findIndex((item) => item.id === Number(productId));

  if (existingIndex >= 0) {
    cartItems[existingIndex].quantity += Number(quantity);
  } else {
    cartItems.push({ id: Number(productId), quantity: Number(quantity) });
  }

  saveCart(cartItems);
}

// Reads current wishlist product id array from localStorage.
function getWishlist() {
  return getStorageValue(WISHLIST_KEY, []);
}

// Saves updated wishlist ids array.
function saveWishlist(wishlistIds) {
  setStorageValue(WISHLIST_KEY, wishlistIds);
}

// Adds a product id into wishlist if it does not already exist.
function addToWishlist(productId) {
  const wishlistIds = getWishlist();
  const normalizedId = Number(productId);
  if (!wishlistIds.includes(normalizedId)) {
    wishlistIds.push(normalizedId);
    saveWishlist(wishlistIds);
  }
}

// Removes a product id from wishlist.
function removeFromWishlist(productId) {
  const normalizedId = Number(productId);
  const wishlistIds = getWishlist().filter((id) => id !== normalizedId);
  saveWishlist(wishlistIds);
}

// Toggles product in wishlist and returns true when added, false when removed.
function toggleWishlist(productId) {
  const normalizedId = Number(productId);
  const wishlistIds = getWishlist();
  const hasProduct = wishlistIds.includes(normalizedId);

  if (hasProduct) {
    saveWishlist(wishlistIds.filter((id) => id !== normalizedId));
    return false;
  }

  wishlistIds.push(normalizedId);
  saveWishlist(wishlistIds);
  return true;
}

// Updates navbar cart badge with sum of cart quantities.
function updateCartCount() {
  const totalCount = getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const cartBadge = document.getElementById("cartCount");
  if (cartBadge) cartBadge.textContent = totalCount;
}

// Applies saved color theme and updates toggle label.
function applySavedTheme() {
  const savedTheme = localStorage.getItem("shopease_theme") || "light";
  document.documentElement.setAttribute("data-bs-theme", savedTheme);
  const themeToggleBtn = document.getElementById("themeToggle");
  if (themeToggleBtn) themeToggleBtn.textContent = savedTheme === "dark" ? "Light" : "Dark";
}

// Enables light/dark mode switching and persists selection.
function setupThemeToggle() {
  const themeToggleBtn = document.getElementById("themeToggle");
  if (!themeToggleBtn) return;

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme") || "light";
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    localStorage.setItem("shopease_theme", nextTheme);
    applySavedTheme();
  });
}

// Renders featured product cards on home page.
function renderFeaturedProducts(products) {
  const featuredContainer = document.getElementById("featuredProducts");
  if (!featuredContainer) return;

  if (!products.length) {
    featuredContainer.innerHTML =
      '<div class="col-12"><div class="alert alert-secondary mb-0">No products found.</div></div>';
    return;
  }

  featuredContainer.innerHTML = products
    .map(
      (product) => `
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card product-card rounded-4 h-100 shadow-sm border-0">
          <img src="${product.image}" class="card-img-top rounded-top-4" alt="${product.name}">
          <div class="card-body d-flex flex-column">
            <p class="small text-primary fw-semibold mb-1">${product.category}</p>
            <h5 class="card-title fs-6 fw-semibold">${product.name}</h5>
            <p class="small text-secondary mb-2">⭐ ${product.rating} / 5</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <p class="fw-bold mb-0">${formatCurrency(product.price)}</p>
              <a href="./product-details.html?id=${product.id}" class="btn btn-primary btn-sm rounded-pill">View</a>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// Handles navbar search and routes search query to products page.
function setupNavbarSearch() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("navbarSearch");
  if (!searchForm || !searchInput) return;

  const currentParams = new URLSearchParams(window.location.search);
  const initialQuery = currentParams.get("search");
  if (initialQuery) searchInput.value = initialQuery;

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    const isHomePage = Boolean(document.getElementById("featuredProducts"));

    if (isHomePage) {
      const filteredProducts = PRODUCT_DATA.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      renderFeaturedProducts(filteredProducts.slice(0, 8));
      return;
    }

    const searchPath = query ? `./products.html?search=${encodeURIComponent(query)}` : "./products.html";
    window.location.href = searchPath;
  });
}

// Exposes shared utilities for page-specific scripts.
window.ShopEase = {
  getStorageValue,
  setStorageValue,
  formatCurrency,
  findProductById,
  getCart,
  saveCart,
  addToCart,
  getWishlist,
  saveWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  updateCartCount
};

// Initializes common app behavior and optional home page content.
function init() {
  applySavedTheme();
  setupThemeToggle();
  updateCartCount();
  setupNavbarSearch();

  if (document.getElementById("featuredProducts")) {
    renderFeaturedProducts(PRODUCT_DATA.slice(0, 8));
  }
}

document.addEventListener("DOMContentLoaded", init);
