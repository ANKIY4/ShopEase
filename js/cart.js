const cartItemsContainer = document.getElementById("cartItemsContainer");
const subtotalAmount = document.getElementById("subtotalAmount");
const taxAmount = document.getElementById("taxAmount");
const totalAmount = document.getElementById("totalAmount");
const checkoutButton = document.getElementById("checkoutButton");

// Converts stored cart ids into product objects with quantity and totals.
function getCartLineItems() {
  return window.ShopEase.getCart()
    .map((item) => {
      const product = window.ShopEase.findProductById(item.id);
      if (!product) return null;
      return {
        ...product,
        quantity: Number(item.quantity),
        lineTotal: Number(item.quantity) * product.price
      };
    })
    .filter(Boolean);
}

// Renders all cart lines or an empty state when no products are in cart.
function renderCart() {
  if (!cartItemsContainer) return;
  const lineItems = getCartLineItems();

  if (!lineItems.length) {
    cartItemsContainer.innerHTML = `
      <div class="alert alert-secondary">
        Your cart is empty. <a href="./products.html" class="alert-link">Continue shopping</a>.
      </div>
    `;
    if (checkoutButton) {
      checkoutButton.classList.add("disabled");
      checkoutButton.setAttribute("aria-disabled", "true");
    }
    updateSummary([]);
    return;
  }

  cartItemsContainer.innerHTML = `
    <div class="summary-card p-3 p-md-4 bg-body">
      ${lineItems
        .map(
          (item) => `
          <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 py-3 border-bottom">
            <div class="d-flex align-items-center gap-3">
              <img src="${item.image}" alt="${item.name}" class="cart-product-image">
              <div>
                <h2 class="h6 mb-1">${item.name}</h2>
                <p class="small text-secondary mb-0">${window.ShopEase.formatCurrency(item.price)} each</p>
              </div>
            </div>
            <div class="d-flex align-items-center gap-3">
              <input type="number" min="1" max="${item.stock}" class="form-control quantity-input" style="width: 90px;" value="${item.quantity}" data-product-id="${item.id}">
              <p class="mb-0 fw-semibold">${window.ShopEase.formatCurrency(item.lineTotal)}</p>
              <button class="btn btn-sm btn-outline-danger remove-item-btn" data-product-id="${item.id}">Remove</button>
            </div>
          </div>
        `
        )
        .join("")}
    </div>
  `;

  if (checkoutButton) {
    checkoutButton.classList.remove("disabled");
    checkoutButton.removeAttribute("aria-disabled");
  }

  updateSummary(lineItems);
}

// Updates subtotal, tax and grand total values in the summary box.
function updateSummary(lineItems) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (subtotalAmount) subtotalAmount.textContent = window.ShopEase.formatCurrency(subtotal);
  if (taxAmount) taxAmount.textContent = window.ShopEase.formatCurrency(tax);
  if (totalAmount) totalAmount.textContent = window.ShopEase.formatCurrency(total);
}

// Persists quantity changes for one cart line.
function updateCartItemQuantity(productId, quantity) {
  const normalizedQty = Math.max(1, Number(quantity));
  const updatedCart = window.ShopEase.getCart().map((item) =>
    item.id === Number(productId) ? { ...item, quantity: normalizedQty } : item
  );
  window.ShopEase.saveCart(updatedCart);
  renderCart();
}

// Removes one product entry from cart.
function removeCartItem(productId) {
  const updatedCart = window.ShopEase.getCart().filter((item) => item.id !== Number(productId));
  window.ShopEase.saveCart(updatedCart);
  renderCart();
}

// Registers quantity and remove actions in cart.
function setupCartEvents() {
  cartItemsContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(".quantity-input");
    if (!input) return;
    updateCartItemQuantity(input.dataset.productId, input.value);
  });

  cartItemsContainer?.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".remove-item-btn");
    if (!removeButton) return;
    removeCartItem(removeButton.dataset.productId);
  });
}

// Initializes shopping cart page.
function initCartPage() {
  if (!cartItemsContainer) return;
  setupCartEvents();
  renderCart();
}

document.addEventListener("DOMContentLoaded", initCartPage);