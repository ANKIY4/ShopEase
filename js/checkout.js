const checkoutForm = document.getElementById("checkoutForm");
const checkoutSummary = document.getElementById("checkoutSummary");
const checkoutAlert = document.getElementById("checkoutAlert");
const codMethod = document.getElementById("codMethod");
const cardMethod = document.getElementById("cardMethod");
const cardFields = document.getElementById("cardFields");
const cardNumber = document.getElementById("cardNumber");
const expiryDate = document.getElementById("expiryDate");
const cvv = document.getElementById("cvv");

// Calculates checkout totals based on local cart items.
function getCheckoutTotals() {
  const subtotal = window.ShopEase.getCart().reduce((sum, item) => {
    const product = window.ShopEase.findProductById(item.id);
    return product ? sum + product.price * Number(item.quantity) : sum;
  }, 0);
  const tax = subtotal * 0.1;
  return { subtotal, tax, total: subtotal + tax };
}

// Renders order summary box in checkout page.
function renderCheckoutSummary() {
  if (!checkoutSummary) return;
  const totals = getCheckoutTotals();

  checkoutSummary.innerHTML = `
    <div class="d-flex justify-content-between mb-2"><span>Subtotal</span><span>${window.ShopEase.formatCurrency(totals.subtotal)}</span></div>
    <div class="d-flex justify-content-between mb-2"><span>Tax (10%)</span><span>${window.ShopEase.formatCurrency(totals.tax)}</span></div>
    <hr />
    <div class="d-flex justify-content-between fw-semibold fs-5"><span>Total</span><span>${window.ShopEase.formatCurrency(totals.total)}</span></div>
  `;
}

// Toggles card UI fields and validation based on selected payment method.
function togglePaymentFields() {
  const useCard = cardMethod?.checked;
  cardFields?.classList.toggle("d-none", !useCard);

  [cardNumber, expiryDate, cvv].forEach((input) => {
    if (!input) return;
    input.required = Boolean(useCard);
    if (!useCard) input.value = "";
  });
}

// Shows alert messages in checkout page.
function showCheckoutAlert(message, type) {
  if (!checkoutAlert) return;
  checkoutAlert.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

// Handles bootstrap checkout form validation and fake order placement.
function setupCheckoutForm() {
  if (!checkoutForm) return;

  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const hasItems = window.ShopEase.getCart().length > 0;
    checkoutForm.classList.add("was-validated");

    if (!hasItems) {
      showCheckoutAlert("Your cart is empty. Add products before checkout.", "warning");
      return;
    }

    if (!checkoutForm.checkValidity()) return;

    localStorage.setItem("shopease_last_order", JSON.stringify({
      orderedAt: new Date().toISOString(),
      paymentMethod: cardMethod?.checked ? "card" : "cod",
      total: getCheckoutTotals().total
    }));
    window.ShopEase.saveCart([]);
    showCheckoutAlert("Order placed successfully! This is a demo checkout flow.", "success");
    checkoutForm.reset();
    checkoutForm.classList.remove("was-validated");
    if (codMethod) codMethod.checked = true;
    togglePaymentFields();
    renderCheckoutSummary();
  });
}

// Initializes checkout page controls and summaries.
function initCheckoutPage() {
  if (!checkoutForm) return;
  renderCheckoutSummary();
  togglePaymentFields();
  setupCheckoutForm();
  codMethod?.addEventListener("change", togglePaymentFields);
  cardMethod?.addEventListener("change", togglePaymentFields);
}

document.addEventListener("DOMContentLoaded", initCheckoutPage);