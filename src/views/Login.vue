<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";

const {
  login: authLogin,
  register: authRegister,
  loading: authLoading,
} = useAuth();
const router = useRouter();
const route = useRoute();

// Login form data
const loginForm = reactive({
  username: "",
  password: "",
  // role removed as it's now automatically determined
});

// Register form data
const registerForm = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  role: "patient", // Default role set to patient
  fullName: "",
  email: "",
});

// UI state
const isLoginMode = ref(true);
const isLoading = ref(false);
const errorMessage = ref("");
const autoLogoutMessage = ref("");
const successMessage = ref("");
const showPassword = ref(false);

// Animation states
const isAnimating = ref(false);
const formDirection = ref("right");

// Check if auth is loading
const isStoreLoading = computed(() => authLoading.value);

// Animated class based on current mode
const containerClass = computed(() => {
  return {
    "auth-container": true,
    "register-mode": !isLoginMode.value,
    "slide-from-left": formDirection.value === "left" && isAnimating.value,
    "slide-from-right": formDirection.value === "right" && isAnimating.value,
  };
});

// Check if user was auto-logged out
onMounted(() => {
  if (route.query.autoLogout === "true") {
    autoLogoutMessage.value =
      "You have been automatically logged out due to inactivity.";
  }

  // Check if coming from register page
  if (route.query.register === "success") {
    successMessage.value =
      "Registration successful! Please log in with your new account.";
  }

  // Check if we should show register form
  if (route.path === "/register") {
    switchMode("register");
  }
});

// Login function
const login = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!loginForm.username || !loginForm.password) {
    errorMessage.value = "Please enter both username and password";
    return;
  }

  isLoading.value = true;

  try {
    // Convert username to email format for Supabase auth
    const email = loginForm.username.includes("@")
      ? loginForm.username
      : `${loginForm.username}@patientrecord.system`;

    // Call the login API through the auth composable
    const result = await authLogin(email, loginForm.password);

    if (result.success) {
      // Wait a moment for auth state to update, then redirect to dashboard
      // The router will dynamically load the correct dashboard component based on user role
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } else {
      errorMessage.value = result.error || "Login failed. Please try again.";
    }
  } catch (error) {
    errorMessage.value = "Login failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
// Register function
const register = async () => {
  // Clear any previous error
  errorMessage.value = "";
  successMessage.value = "";

  // Basic validation
  if (
    !registerForm.email ||
    !registerForm.password ||
    !registerForm.confirmPassword
  ) {
    errorMessage.value = "Please fill in all required fields";
    return;
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    errorMessage.value = "Passwords do not match";
    return;
  }

  if (registerForm.password.length < 6) {
    errorMessage.value = "Password must be at least 6 characters long";
    return;
  }

  isLoading.value = true;

  try {
    // Call the register API through the auth composable
    const metadata = {
      full_name: registerForm.fullName,
      role: registerForm.role,
    };
    const result = await authRegister(
      registerForm.email,
      registerForm.password,
      metadata
    );

    if (result.success) {
      // Show success message
      successMessage.value = "Registration successful! You can now log in.";

      // Switch to login mode
      switchMode("login");
    } else {
      errorMessage.value =
        result.error || "Registration failed. Please try again.";
    }
  } catch (error) {
    errorMessage.value = "Registration failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Switch between login and register modes
const switchMode = (mode) => {
  if (
    (mode === "login" && isLoginMode.value) ||
    (mode === "register" && !isLoginMode.value)
  ) {
    return; // Already in this mode
  }

  // Set animation direction
  formDirection.value = mode === "login" ? "left" : "right";

  // Start animation
  isAnimating.value = true;
  setTimeout(() => {
    isLoginMode.value = mode === "login";

    // Update URL without navigation
    router.replace(
      {
        path: isLoginMode.value ? "/login" : "/register",
        query: route.query,
      },
      () => {},
      () => {}
    );

    // Reset errors
    errorMessage.value = "";

    // End animation
    setTimeout(() => {
      isAnimating.value = false;
    }, 300);
  }, 300); // Match this with the CSS transition time
};

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Function to fill demo account credentials
const fillDemoAccount = (username, password) => {
  loginForm.username = username.toLowerCase();
  loginForm.password = password;
  // role parameter removed as it's now automatically determined
};
</script>

<template>
  <div class="auth-page">
    <div :class="containerClass">
      <!-- Animated background elements -->
      <div class="animated-bg">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
      </div>

      <div class="auth-content">
        <!-- Login Form -->
        <div v-if="isLoginMode" class="auth-form login-form" key="login">
          <div class="auth-header">
            <div class="logo-container">
              <i class="bi bi-hospital"></i>
            </div>
            <h1>Patient Record System</h1>
            <p class="subtitle">Sign in to your account</p>
          </div>

          <div v-if="errorMessage" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ errorMessage }}
          </div>

          <div v-if="autoLogoutMessage" class="alert alert-warning">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ autoLogoutMessage }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ successMessage }}
          </div>

          <form @submit.prevent="login">
            <div class="form-group">
              <label for="username">Username</label>
              <div class="input-container">
                <i class="bi bi-person input-icon"></i>
                <input
                  type="text"
                  id="username"
                  v-model="loginForm.username"
                  placeholder="Enter your username"
                  autocomplete="username"
                  required
                />
              </div>
            </div>

            <!-- New Role Select for Login -->

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-container">
                <i class="bi bi-lock input-icon"></i>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="loginForm.password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />
                <i
                  class="bi toggle-password"
                  :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                  @click="togglePasswordVisibility"
                ></i>
              </div>
            </div>

            <!-- Role selection removed - role is now automatically determined -->

            <div class="form-button">
              <button
                type="submit"
                class="primary-button"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner"></span>
                <span>{{ isLoading ? "Signing in..." : "Sign in" }}</span>
              </button>
            </div>
          </form>

          <div class="form-footer">
            <p>
              Don't have an account?
              <a href="#" @click.prevent="switchMode('register')">Register</a>
            </p>
          </div>

          <!-- Demo Accounts Section -->
          <div class="demo-accounts">
            <h4>Demo Accounts</h4>
            <div class="demo-account-grid">
              <div
                class="demo-account"
                @click="fillDemoAccount('admin', 'admin123')"
              >
                <div class="demo-account-header">
                  <i class="bi bi-shield-check"></i>
                  <span>Admin</span>
                </div>
                <div class="demo-account-details">
                  <strong>Username:</strong> admin<br />
                  <strong>Password:</strong> admin123<br />
                  <strong>Role:</strong> Administrator
                </div>
              </div>

              <div
                class="demo-account"
                @click="fillDemoAccount('nurse', 'nurse123')"
              >
                <div class="demo-account-header">
                  <i class="bi bi-heart-pulse"></i>
                  <span>Nurse</span>
                </div>
                <div class="demo-account-details">
                  <strong>Username:</strong> nurse<br />
                  <strong>Password:</strong> nurse123<br />
                  <strong>Role:</strong> Nurse/Clinic Staff
                </div>
              </div>

              <div
                class="demo-account"
                @click="fillDemoAccount('patient', 'patient123')"
              >
                <div class="demo-account-header">
                  <i class="bi bi-person"></i>
                  <span>Patient</span>
                </div>
                <div class="demo-account-details">
                  <strong>Username:</strong> patient<br />
                  <strong>Password:</strong> patient123<br />
                  <strong>Role:</strong> Patient
                </div>
              </div>
            </div>
            <p class="demo-note">
              Click any account to auto-fill the login form
            </p>
          </div>
        </div>

        <!-- Register Form -->
        <div v-else class="auth-form register-form" key="register">
          <div class="auth-header">
            <div class="logo-container">
              <i class="bi bi-hospital"></i>
            </div>
            <h1>Create Account</h1>
            <p class="subtitle">Get started with your account</p>
          </div>

          <div v-if="errorMessage" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ successMessage }}
          </div>

          <form @submit.prevent="register">
            <div class="form-group">
              <label for="register-username">Username</label>
              <div class="input-container">
                <i class="bi bi-person input-icon"></i>
                <input
                  type="text"
                  id="register-username"
                  v-model="registerForm.username"
                  placeholder="Choose a username"
                  autocomplete="new-username"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="register-password">Password</label>
              <div class="input-container">
                <i class="bi bi-lock input-icon"></i>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="register-password"
                  v-model="registerForm.password"
                  placeholder="Create a password"
                  autocomplete="new-password"
                  required
                />
                <i
                  class="bi input-icon show-password-toggle"
                  :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                  @click="togglePasswordVisibility"
                ></i>
              </div>
            </div>

            <div class="form-group">
              <label for="confirm-password">Confirm Password</label>
              <div class="input-container">
                <i class="bi bi-lock input-icon"></i>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="confirm-password"
                  v-model="registerForm.confirmPassword"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                  required
                />
                <i
                  class="bi input-icon show-password-toggle"
                  :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
                  @click="togglePasswordVisibility"
                ></i>
              </div>
            </div>

            <div class="form-group">
              <label for="register-role">Role</label>
              <div class="input-container">
                <i class="bi bi-person-badge input-icon"></i>
                <select id="register-role" v-model="registerForm.role" required>
                  <option value="admin">Admin</option>
                  <option value="nurse">Nurse/Clinic Staff</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="full-name">Full Name (Optional)</label>
              <div class="input-container">
                <i class="bi bi-person input-icon"></i>
                <input
                  type="text"
                  id="full-name"
                  v-model="registerForm.fullName"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email (Optional)</label>
              <div class="input-container">
                <i class="bi bi-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  v-model="registerForm.email"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button type="submit" class="auth-button" :disabled="isLoading">
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              {{ isLoading ? "Registering..." : "Register" }}
            </button>
          </form>

          <p class="switch-mode">
            Already have an account?
            <a href="#" @click.prevent="switchMode('login')">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base styling */
.auth-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
  position: relative;
}

.auth-container {
  width: 100%;
  max-width: 800px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  background-color: #fff;
  transition: all 0.6s ease;
  transform-style: preserve-3d;
}

.auth-content {
  padding: 40px;
  position: relative;
  z-index: 2;
}

/* Animated background */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, #0d6efd, #0dcaf0);
  opacity: 0.1;
  animation: float 10s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  left: -50px;
  background: linear-gradient(45deg, #20c997, #0dcaf0);
  animation-delay: 2s;
}

.circle-3 {
  width: 120px;
  height: 120px;
  top: 40%;
  left: 60%;
  background: linear-gradient(45deg, #0d6efd, #6610f2);
  animation-delay: 4s;
}

.circle-4 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  right: 20%;
  background: linear-gradient(45deg, #20c997, #0d6efd);
  animation-delay: 6s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(5deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(15px) rotate(-5deg);
  }
}

/* Auth header */
.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-container {
  background: linear-gradient(45deg, #0d6efd, #0dcaf0);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
  animation: pulse 2s infinite;
}

.logo-container i {
  font-size: 36px;
  color: white;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(13, 110, 253, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
  }
}

.auth-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
  background: linear-gradient(45deg, #0d6efd, #0dcaf0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #6c757d;
  font-size: 16px;
  margin-bottom: 0;
}

/* Form styling */
.auth-form {
  transition: all 0.5s ease;
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #495057;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 18px;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 18px;
  cursor: pointer;
}

input,
select {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 1px solid #ced4da;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background-color: #f8f9fa;
}

input:focus,
select:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  background-color: #fff;
}

.primary-button {
  width: 100%;
  background: linear-gradient(45deg, #0d6efd, #0dcaf0);
  border: none;
  color: white;
  padding: 15px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-button:hover {
  background: linear-gradient(45deg, #0b5ed7, #0bacbe);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
}

.primary-button:disabled {
  opacity: 0.7;
  transform: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.form-footer a {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.form-footer a:hover {
  color: #0a58ca;
  text-decoration: underline;
}

/* Alerts */
.alert {
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.alert-danger {
  background-color: #f8d7da;
  color: #842029;
  border-left: 4px solid #dc3545;
}

.alert-warning {
  background-color: #fff3cd;
  color: #664d03;
  border-left: 4px solid #ffc107;
}

.alert-success {
  background-color: #d1e7dd;
  color: #0f5132;
  border-left: 4px solid #198754;
}

/* Animation classes */
.slide-from-left {
  animation: slideFromLeft 0.6s forwards;
}

.slide-from-right {
  animation: slideFromRight 0.6s forwards;
}

@keyframes slideFromLeft {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  50% {
    transform: translateX(100px);
    opacity: 0;
  }
  51% {
    transform: translateX(-100px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideFromRight {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-100px);
    opacity: 0;
  }
  51% {
    transform: translateX(100px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Simple Register Form */
.simple-register-container {
  max-width: 100%;
  text-align: center;
}

.hospital-icon {
  width: 75px;
  height: 75px;
  background: #0d6efd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.hospital-icon i {
  font-size: 40px;
  color: white;
}

.system-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 25px;
  color: #212529;
}

.register-card {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin: 0 auto;
  max-width: 600px;
}

.create-account-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 25px;
  color: #212529;
}

.register-form-simple {
  text-align: left;
}

.register-form-row {
  margin-bottom: 20px;
}

.register-form-row label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #212529;
}

.required-field {
  color: #dc3545;
}

.input-group {
  display: flex;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
}

.icon-container i {
  font-size: 16px;
  color: #6c757d;
}

.register-form-simple input,
.register-form-simple select {
  flex: 1;
  border: none;
  padding: 12px 15px;
  font-size: 14px;
  background-color: #f8f9fa;
  outline: none;
}

.register-form-simple input:focus,
.register-form-simple select:focus {
  background-color: white;
}

.password-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

.register-submit-button {
  width: 100%;
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.register-submit-button:hover {
  background-color: #3a56d4;
}

.register-submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.account-links {
  margin-top: 20px;
  font-size: 14px;
}

.account-links a {
  color: #4361ee;
  text-decoration: none;
  font-weight: 500;
}

.account-links a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-content {
    padding: 30px 20px;
  }

  .system-title {
    font-size: 28px;
  }

  .register-card {
    padding: 20px 15px;
  }

  .create-account-title {
    font-size: 24px;
  }
}

/* If there's a line-clamp property anywhere, add it here with standard property */
.text-with-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Demo Accounts Section */
.demo-accounts {
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.demo-accounts h4 {
  color: #495057;
  font-size: 18px;
  margin-bottom: 15px;
  text-align: center;
}

.demo-account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.demo-account {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.demo-account:hover {
  border-color: #4361ee;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(67, 97, 238, 0.15);
}

.demo-account-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #495057;
}

.demo-account-header i {
  font-size: 18px;
  color: #4361ee;
}

.demo-account-details {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

.demo-note {
  text-align: center;
  font-size: 12px;
  color: #6c757d;
  margin: 0;
  font-style: italic;
}

@media (max-width: 768px) {
  .demo-account-grid {
    grid-template-columns: 1fr;
  }

  .demo-accounts {
    margin-top: 20px;
    padding: 15px;
  }
}
</style>
