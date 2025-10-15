<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Login form data
const loginForm = reactive({
  username: "",
  password: "",
  // role removed as it's now automatically determined
});

// UI state
const isLoading = ref(false);
const errorMessage = ref("");
const autoLogoutMessage = ref("");
const successMessage = ref("");
const showLoginFormPassword = ref(false);

// Check if user was auto-logged out
onMounted(() => {
  if (route.query.autoLogout === "true") {
    autoLogoutMessage.value =
      "You have been automatically logged out due to inactivity.";
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
    // Use the auth store to login
    const result = await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
    });

    if (result.success) {
      // Redirect based on user role
      const roleRoute = getDefaultRouteForRole(result.user.role);
      router.push(roleRoute);
    } else {
      errorMessage.value = result.error || "Invalid username or password";
    }
  } catch (error) {
    errorMessage.value = error.message || "Invalid username or password";
  } finally {
    isLoading.value = false;
  }
};

// Helper function to get default route for role
const getDefaultRouteForRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "nurse":
      return "/nurse";
    case "patient":
      return "/patient";
    default:
      return "/login";
  }
};

// Toggle password visibility
const toggleLoginFormPassword = () => {
  showLoginFormPassword.value = !showLoginFormPassword.value;
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
    <div class="auth-container">
      <!-- Animated background elements -->
      <div class="animated-bg">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
      </div>

      <div class="auth-content">
        <!-- Login Form -->
        <div class="auth-form login-form">
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

            <!-- Role selection removed - role is now automatically determined -->

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-container">
                <i class="bi bi-lock input-icon"></i>
                <input
                  :type="showLoginFormPassword ? 'text' : 'password'"
                  id="password"
                  v-model="loginForm.password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />
                <i
                  class="bi toggle-password"
                  :class="showLoginFormPassword ? 'bi-eye-slash' : 'bi-eye'"
                  @click="toggleLoginFormPassword"
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

            <!-- Demo Account Buttons -->
            <div class="demo-accounts">
              <p class="demo-title">Demo Accounts:</p>
              <div class="demo-buttons">
                <button
                  type="button"
                  class="demo-button admin-demo"
                  @click="fillDemoAccount('admin', 'password')"
                >
                  <i class="bi bi-shield-check"></i>
                  Admin
                </button>
                <button
                  type="button"
                  class="demo-button nurse-demo"
                  @click="fillDemoAccount('nurse.demo', 'password')"
                >
                  <i class="bi bi-heart-pulse"></i>
                  Nurse
                </button>
                <button
                  type="button"
                  class="demo-button patient-demo"
                  @click="fillDemoAccount('john.doe', 'password')"
                >
                  <i class="bi bi-person"></i>
                  Patient
                </button>
              </div>
            </div>
          </form>
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

/* Demo Account Buttons */
.demo-accounts {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.demo-title {
  text-align: center;
  margin-bottom: 15px;
  font-size: 14px;
  color: #6c757d;
  font-weight: 600;
}

.demo-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.demo-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.demo-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.demo-button i {
  font-size: 16px;
}

.admin-demo {
  border-color: #dc3545;
  color: #dc3545;
}

.admin-demo:hover {
  background-color: #dc3545;
  color: white;
}

.nurse-demo {
  border-color: #20c997;
  color: #20c997;
}

.nurse-demo:hover {
  background-color: #20c997;
  color: white;
}

.patient-demo {
  border-color: #0d6efd;
  color: #0d6efd;
}

.patient-demo:hover {
  background-color: #0d6efd;
  color: white;
}

.demo-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
}
</style>
