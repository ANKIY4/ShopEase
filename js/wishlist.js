const wishlistContainer = document.getElementById("wishlistContainer");

// Resolves wishlist product ids to product objects.
function getWishlistProducts() {
  return window.ShopEase.getWishlist()
    .map((id) => window.ShopEase.findProductById(id))
    .filter(Boolean);
}

// Renders wishlist items with remove and move-to-cart actions.
function renderWishlist() {
  if (!wishlistContainer) return;
  const products = getWishlistProducts();

  if (!products.length) {
    wishlistContainer.innerHTML = `
      <div class="alert alert-secondary">
        Your wishlist is empty. <a href="./products.html" class="alert-link">Explore products</a>.
      </div>
    `;
    return;
  }

  wishlistContainer.innerHTML = `
    <div class="summary-card p-3 p-md-4 bg-body">
      ${products
        .map(
          (product) => `
          <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 py-3 border-bottom">
            <div class="d-flex align-items-center gap-3">
              <img src="${product.image}" alt="${product.name}" class="wishlist-product-image">
              <div>
                <h2 class="h6 mb-1">${product.name}</h2>
                <p class="small text-secondary mb-0">${window.ShopEase.formatCurrency(product.price)}</p>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-primary move-to-cart-btn" data-product-id="${product.id}">Move to Cart</button>
              <button class="btn btn-sm btn-outline-danger remove-wishlist-btn" data-product-id="${product.id}">Remove</button>
            </div>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

// Handles wishlist actions from delegated button clicks.
function setupWishlistEvents() {
  wishlistContainer?.addEventListener("click", (event) => {
    const removeBtn = event.target.closest(".remove-wishlist-btn");
    const moveBtn = event.target.closest(".move-to-cart-btn");

    if (removeBtn) {
      window.ShopEase.removeFromWishlist(Number(removeBtn.dataset.productId));
      renderWishlist();
      return;
    }

    if (moveBtn) {
      const productId = Number(moveBtn.dataset.productId);
      window.ShopEase.addToCart(productId, 1);
      window.ShopEase.removeFromWishlist(productId);
      renderWishlist();
    }
  });
}

// Initializes wishlist page content.
function initWishlistPage() {
  if (!wishlistContainer) return;
  setupWishlistEvents();
  renderWishlist();
}

document.addEventListener("DOMContentLoaded", initWishlistPage);