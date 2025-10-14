<script setup>
import { ref, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { authService } from "../services/api";

const store = useStore();
const router = useRouter();
const route = useRoute();

// Login form data
const loginForm = reactive({
  identifier: "", // Can be username or email
  password: "",
});

// UI state
const isLoading = ref(false);
const errorMessage = ref("");
const autoLogoutMessage = ref("");
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

  if (!loginForm.identifier || !loginForm.password) {
    errorMessage.value = "Please enter both username/email and password";
    return;
  }

  isLoading.value = true;

  try {
    // Use the auth service to login
    const userData = await authService.login({
      email: loginForm.identifier,
      password: loginForm.password,
    });

    // User authentication is now handled by Pinia store
    // No need to manually update Vuex store or localStorage
    // Redirect to dashboard after successful login
    // Check user role and redirect accordingly
    const userRole = userData.role;
    if (userRole === 'admin') {
      router.push("/dashboard");
    } else {
      router.push("/dashboard");
    }
  } catch (error) {
    errorMessage.value = error.message || "Invalid username or password";
  } finally {
    isLoading.value = false;
  }
};

// Toggle password visibility
const toggleLoginFormPassword = () => {
  showLoginFormPassword.value = !showLoginFormPassword.value;
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
              <img src="/src/assets/logo.svg" alt="Hospital Logo" class="hospital-logo" />
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

          <form @submit.prevent="login">
            <div class="form-group">
              <label for="identifier">Username or Email</label>
              <div class="input-container">
                <i class="bi bi-person input-icon"></i>
                <input
                  type="text"
                  id="identifier"
                  v-model="loginForm.identifier"
                  placeholder="Enter your username or email"
                  autocomplete="username"
                  required
                  @keyup.enter="login"
                />
              </div>
            </div>

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
                  @keyup.enter="login"
                />
                <i
                  class="bi toggle-password"
                  :class="showLoginFormPassword ? 'bi-eye-slash' : 'bi-eye'"
                  @click="toggleLoginFormPassword"
                ></i>
              </div>
            </div>

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
  text-align: center;
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

/* Hospital logo styling */
.hospital-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

/* If there's a line-clamp property anywhere, add it here with standard property */
.text-with-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}


</style>
