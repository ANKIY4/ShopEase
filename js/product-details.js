const productDetailsContent = document.getElementById("productDetailsContent");
const relatedProductsContainer = document.getElementById("relatedProducts");

// Reads the requested product id from URL query params.
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

// Builds a small gallery list even if the product has only one image.
function getProductGallery(product) {
  if (Array.isArray(product.gallery) && product.gallery.length) return product.gallery;
  return [product.image, product.image, product.image];
}

// Renders the selected product detail area with quantity and action buttons.
function renderProductDetails() {
  if (!productDetailsContent) return null;
  const productId = getProductIdFromURL();
  const product = window.ShopEase.findProductById(productId);

  if (!product) {
    productDetailsContent.innerHTML =
      '<div class="alert alert-danger">Product not found. <a href="./products.html">Browse products</a>.</div>';
    return null;
  }

  const gallery = getProductGallery(product);
  productDetailsContent.innerHTML = `
    <div class="row g-4">
      <div class="col-12 col-lg-6">
        <div class="detail-box p-3 bg-body">
          <img src="${gallery[0]}" alt="${product.name}" id="mainProductImage" class="product-main-image rounded-4 mb-3">
          <div class="row g-2">
            ${gallery
              .map(
                (image, index) => `
                <div class="col-4">
                  <img src="${image}" alt="Thumbnail ${index + 1}" class="gallery-thumb ${index === 0 ? "active" : ""}" data-image="${image}">
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-6">
        <div class="detail-box p-4 bg-body h-100">
          <p class="text-primary fw-semibold mb-2">${product.category}</p>
          <h1 class="h2 fw-bold">${product.name}</h1>
          <p class="text-secondary mb-3">⭐ ${product.rating} / 5</p>
          <h2 class="h3 fw-semibold mb-3">${window.ShopEase.formatCurrency(product.price)}</h2>
          <p class="text-secondary">${product.description}</p>
          <p class="mb-4"><strong>Stock:</strong> ${product.stock}</p>

          <div class="mb-3">
            <label for="quantityInput" class="form-label">Quantity</label>
            <input type="number" min="1" max="${product.stock}" value="1" id="quantityInput" class="form-control w-25">
          </div>

          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-primary" id="addToCartButton">Add to Cart</button>
            <button class="btn btn-outline-secondary" id="addToWishlistButton">Add to Wishlist</button>
          </div>
        </div>
      </div>
    </div>
  `;

  return product;
}

// Renders related products from the same category excluding current product.
function renderRelatedProducts(currentProduct) {
  if (!relatedProductsContainer || !currentProduct) return;

  const related = PRODUCT_DATA.filter(
    (product) => product.category === currentProduct.category && product.id !== currentProduct.id
  ).slice(0, 4);

  if (!related.length) {
    relatedProductsContainer.innerHTML =
      '<div class="col-12"><div class="alert alert-secondary mb-0">No related products found.</div></div>';
    return;
  }

  relatedProductsContainer.innerHTML = related
    .map(
      (product) => `
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card product-card rounded-4 h-100 shadow-sm border-0">
          <img src="${product.image}" class="card-img-top rounded-top-4" alt="${product.name}">
          <div class="card-body d-flex flex-column">
            <h3 class="h6 fw-semibold">${product.name}</h3>
            <p class="small text-secondary">⭐ ${product.rating}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <p class="fw-bold mb-0">${window.ShopEase.formatCurrency(product.price)}</p>
              <a href="./product-details.html?id=${product.id}" class="btn btn-outline-primary btn-sm rounded-pill">View</a>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// Registers gallery switching and CTA buttons on detail page.
function setupDetailPageEvents(currentProduct) {
  if (!currentProduct) return;

  productDetailsContent?.addEventListener("click", (event) => {
    const thumb = event.target.closest(".gallery-thumb");
    if (thumb) {
      const mainImage = document.getElementById("mainProductImage");
      if (mainImage) mainImage.src = thumb.dataset.image;

      document.querySelectorAll(".gallery-thumb").forEach((image) => image.classList.remove("active"));
      thumb.classList.add("active");
      return;
    }

    if (event.target.id === "addToCartButton") {
      const qtyInput = document.getElementById("quantityInput");
      const quantity = Math.max(1, Number(qtyInput?.value || 1));
      window.ShopEase.addToCart(currentProduct.id, quantity);
      event.target.textContent = "Added to Cart";
      setTimeout(() => {
        event.target.textContent = "Add to Cart";
      }, 1200);
      return;
    }

    if (event.target.id === "addToWishlistButton") {
      const added = window.ShopEase.toggleWishlist(currentProduct.id);
      event.target.textContent = added ? "Added to Wishlist" : "Add to Wishlist";
    }
  });
}

// Initializes product details page rendering.
function initProductDetailsPage() {
  const product = renderProductDetails();
  renderRelatedProducts(product);
  setupDetailPageEvents(product);
}

document.addEventListener("DOMContentLoaded", initProductDetailsPage);