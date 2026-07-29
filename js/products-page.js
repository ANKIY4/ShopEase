const productsGrid = document.getElementById("productsGrid");
const categoryFilters = document.getElementById("categoryFilters");
const priceRange = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");
const ratingFilter = document.getElementById("ratingFilter");
const sortSelect = document.getElementById("sortSelect");

const urlParams = new URLSearchParams(window.location.search);
const initialSearch = (urlParams.get("search") || "").toLowerCase();
const initialCategory = urlParams.get("category");

const state = {
  categories: new Set(initialCategory ? [initialCategory] : []),
  maxPrice: Number(priceRange?.value || 200),
  minRating: Number(ratingFilter?.value || 0),
  sortBy: sortSelect?.value || "newest",
  searchQuery: initialSearch
};

// Creates category checkbox filters from available product categories.
function renderCategoryFilters() {
  if (!categoryFilters) return;

  const categories = [...new Set(PRODUCT_DATA.map((product) => product.category))];
  categoryFilters.innerHTML = categories
    .map(
      (category) => `
      <div class="form-check">
        <input class="form-check-input category-check" type="checkbox" value="${category}" id="cat-${category}" ${state.categories.has(category) ? "checked" : ""}>
        <label class="form-check-label" for="cat-${category}">${category}</label>
      </div>
    `
    )
    .join("");
}

// Filters and sorts the product catalog using current selected controls.
function getFilteredProducts() {
  const filtered = PRODUCT_DATA.filter((product) => {
    const matchesCategory = state.categories.size
      ? state.categories.has(product.category)
      : true;
    const matchesPrice = product.price <= state.maxPrice;
    const matchesRating = product.rating >= state.minRating;
    const matchesSearch = state.searchQuery
      ? product.name.toLowerCase().includes(state.searchQuery)
      : true;

    return matchesCategory && matchesPrice && matchesRating && matchesSearch;
  });

  const sorted = [...filtered];
  switch (state.sortBy) {
    case "price-low-high":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-high-low":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating-high-low":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    default:
      sorted.sort((a, b) => b.id - a.id);
  }

  return sorted;
}

// Renders product cards based on active filter and sort state.
function renderProductsGrid() {
  if (!productsGrid) return;
  const products = getFilteredProducts();
  const wishlistIds = window.ShopEase.getWishlist();

  if (!products.length) {
    productsGrid.innerHTML =
      '<div class="col-12"><div class="alert alert-secondary mb-0">No products match your filters.</div></div>';
    return;
  }

  productsGrid.innerHTML = products
    .map(
      (product) => `
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card product-card rounded-4 h-100 shadow-sm border-0">
          <img src="${product.image}" class="card-img-top rounded-top-4" alt="${product.name}">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <p class="small text-primary fw-semibold mb-0">${product.category}</p>
              <small class="text-secondary">Stock: ${product.stock}</small>
            </div>
            <h5 class="card-title fs-6 fw-semibold">${product.name}</h5>
            <p class="small text-secondary mb-2">⭐ ${product.rating} / 5</p>
            <p class="small text-secondary">${product.description}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto mb-2">
              <p class="fw-bold mb-0">${window.ShopEase.formatCurrency(product.price)}</p>
              <a href="./product-details.html?id=${product.id}" class="btn btn-outline-primary btn-sm rounded-pill">Details</a>
            </div>
            <div class="d-grid gap-2">
              <button class="btn btn-primary btn-sm add-cart-btn" data-product-id="${product.id}">Add to Cart</button>
              <button class="btn btn-outline-secondary btn-sm add-wishlist-btn" data-product-id="${product.id}">
                ${wishlistIds.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// Registers all page controls for filtering, sorting and product actions.
function setupProductsPageEvents() {
  categoryFilters?.addEventListener("change", (event) => {
    if (!event.target.classList.contains("category-check")) return;
    const category = event.target.value;
    if (event.target.checked) {
      state.categories.add(category);
    } else {
      state.categories.delete(category);
    }
    renderProductsGrid();
  });

  priceRange?.addEventListener("input", () => {
    state.maxPrice = Number(priceRange.value);
    if (priceValue) priceValue.textContent = window.ShopEase.formatCurrency(state.maxPrice);
    renderProductsGrid();
  });

  ratingFilter?.addEventListener("change", () => {
    state.minRating = Number(ratingFilter.value);
    renderProductsGrid();
  });

  sortSelect?.addEventListener("change", () => {
    state.sortBy = sortSelect.value;
    renderProductsGrid();
  });

  productsGrid?.addEventListener("click", (event) => {
    const cartBtn = event.target.closest(".add-cart-btn");
    const wishlistBtn = event.target.closest(".add-wishlist-btn");

    if (cartBtn) {
      window.ShopEase.addToCart(Number(cartBtn.dataset.productId), 1);
      cartBtn.textContent = "Added";
      setTimeout(() => {
        cartBtn.textContent = "Add to Cart";
      }, 900);
      return;
    }

    if (wishlistBtn) {
      const added = window.ShopEase.toggleWishlist(Number(wishlistBtn.dataset.productId));
      wishlistBtn.textContent = added ? "Remove from Wishlist" : "Add to Wishlist";
    }
  });
}

// Initializes product listing page setup.
function initProductsPage() {
  if (!productsGrid) return;
  if (priceValue) priceValue.textContent = window.ShopEase.formatCurrency(state.maxPrice);
  renderCategoryFilters();
  setupProductsPageEvents();
  renderProductsGrid();
}

document.addEventListener("DOMContentLoaded", initProductsPage);