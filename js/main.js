// Reads a JSON value from localStorage and safely falls back to a default.
function getStorageValue(key, defaultValue) {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return defaultValue;
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return defaultValue;
  }
}

// Updates the cart badge in navbar based on current cart quantities.
function updateCartCount() {
  const cartItems = getStorageValue("shopease_cart", []);
  const totalCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const cartBadge = document.getElementById("cartCount");
  if (cartBadge) cartBadge.textContent = totalCount;
}

// Applies the saved theme from localStorage to the document.
function applySavedTheme() {
  const savedTheme = localStorage.getItem("shopease_theme") || "light";
  document.documentElement.setAttribute("data-bs-theme", savedTheme);
  const themeToggleBtn = document.getElementById("themeToggle");
  if (themeToggleBtn) themeToggleBtn.textContent = savedTheme === "dark" ? "Light" : "Dark";
}

// Toggles between light and dark theme and stores the result.
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

// Renders product cards into the featured products section on home page.
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
              <p class="fw-bold mb-0">$${product.price.toFixed(2)}</p>
              <a href="./product-details.html?id=${product.id}" class="btn btn-primary btn-sm rounded-pill">View</a>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// Binds navbar search and filters products by name on the home page.
function setupNavbarSearch() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("navbarSearch");
  if (!searchForm || !searchInput) return;

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    const filteredProducts = PRODUCT_DATA.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
    renderFeaturedProducts(filteredProducts.slice(0, 8));
  });
}

// Initializes common behavior and home page product rendering.
function init() {
  applySavedTheme();
  setupThemeToggle();
  updateCartCount();
  setupNavbarSearch();
  renderFeaturedProducts(PRODUCT_DATA.slice(0, 8));
}

document.addEventListener("DOMContentLoaded", init);
