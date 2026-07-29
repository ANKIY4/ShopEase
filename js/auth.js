const USERS_KEY = "shopease_users";
const CURRENT_USER_KEY = "shopease_current_user";

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const authAlert = document.getElementById("authAlert");

// Reads all registered demo users from localStorage.
function getUsers() {
  return window.ShopEase.getStorageValue(USERS_KEY, []);
}

// Persists registered demo users to localStorage.
function saveUsers(users) {
  window.ShopEase.setStorageValue(USERS_KEY, users);
}

// Renders login/signup feedback message.
function showAuthAlert(message, type) {
  if (!authAlert) return;
  authAlert.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

// Handles signup form validation and localStorage registration.
function setupSignupForm() {
  if (!signupForm) return;

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    signupForm.classList.add("was-validated");
    if (!signupForm.checkValidity()) return;

    const name = document.getElementById("signupName")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim().toLowerCase();
    const password = document.getElementById("signupPassword")?.value;
    const confirmPassword = document.getElementById("signupConfirmPassword")?.value;

    if (password !== confirmPassword) {
      showAuthAlert("Password and confirm password must match.", "danger");
      return;
    }

    const users = getUsers();
    if (users.some((user) => user.email === email)) {
      showAuthAlert("Account with this email already exists.", "warning");
      return;
    }

    users.push({ name, email, password, createdAt: new Date().toISOString() });
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, email);
    showAuthAlert("Signup successful. You are now logged in.", "success");
    signupForm.reset();
    signupForm.classList.remove("was-validated");
  });
}

// Handles login form validation and matching stored demo credentials.
function setupLoginForm() {
  if (!loginForm) return;

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    loginForm.classList.add("was-validated");
    if (!loginForm.checkValidity()) return;

    const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
    const password = document.getElementById("loginPassword")?.value;
    const users = getUsers();

    const matchedUser = users.find((user) => user.email === email && user.password === password);
    if (!matchedUser) {
      showAuthAlert("Invalid email or password.", "danger");
      return;
    }

    localStorage.setItem(CURRENT_USER_KEY, matchedUser.email);
    showAuthAlert(`Welcome back, ${matchedUser.name}!`, "success");
    loginForm.reset();
    loginForm.classList.remove("was-validated");
  });
}

// Initializes auth page scripts depending on available form.
function initAuthPages() {
  setupSignupForm();
  setupLoginForm();
}

document.addEventListener("DOMContentLoaded", initAuthPages);