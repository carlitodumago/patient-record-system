<template>
  <div class="change-password-page">
    <div class="change-password-container">
      <!-- Animated background elements -->
      <div class="animated-bg">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
      </div>

      <div class="change-password-content">
        <div class="change-password-form">
          <div class="auth-header">
            <div class="logo-container">
              <v-icon size="36" color="white">mdi-lock-reset</v-icon>
            </div>
            <h1>First Time Login</h1>
            <p class="subtitle">Please change your password to continue</p>
          </div>

          <div v-if="errorMessage" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ successMessage }}
          </div>

          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <div class="input-container">
                <i class="bi bi-lock input-icon"></i>
                <input
                  type="password"
                  id="currentPassword"
                  v-model="form.currentPassword"
                  placeholder="Enter your current password"
                  autocomplete="current-password"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="newPassword">New Password</label>
              <div class="input-container">
                <i class="bi bi-key input-icon"></i>
                <input
                  type="password"
                  id="newPassword"
                  v-model="form.newPassword"
                  placeholder="Enter your new password"
                  autocomplete="new-password"
                  required
                  @input="validatePassword"
                />
              </div>
              <div v-if="passwordErrors.length > 0" class="password-hint error">
                <div
                  v-for="error in passwordErrors"
                  :key="error"
                  class="error-item"
                >
                  <i class="bi bi-x-circle"></i> {{ error }}
                </div>
              </div>
              <div v-else class="password-hint">
                Password must be at least 8 characters long and contain
                uppercase, lowercase, number, and special character
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <div class="input-container">
                <i class="bi bi-key input-icon"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  placeholder="Confirm your new password"
                  autocomplete="new-password"
                  required
                  @input="validateConfirmPassword"
                />
              </div>
              <div v-if="confirmPasswordError" class="password-hint error">
                <i class="bi bi-x-circle"></i> {{ confirmPasswordError }}
              </div>
            </div>

            <div class="form-button">
              <button
                type="submit"
                class="primary-button"
                :disabled="isLoading || !isFormValid"
              >
                <span v-if="isLoading" class="spinner"></span>
                <span>{{
                  isLoading ? "Changing Password..." : "Change Password"
                }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore();
const router = useRouter();

// Form data
const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// UI state
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const passwordErrors = ref([]);
const confirmPasswordError = ref("");

// Password validation rules
const validatePassword = () => {
  passwordErrors.value = [];
  const password = form.newPassword;

  if (password.length < 8) {
    passwordErrors.value.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    passwordErrors.value.push(
      "Password must contain at least one uppercase letter"
    );
  }
  if (!/[a-z]/.test(password)) {
    passwordErrors.value.push(
      "Password must contain at least one lowercase letter"
    );
  }
  if (!/\d/.test(password)) {
    passwordErrors.value.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    passwordErrors.value.push(
      "Password must contain at least one special character"
    );
  }
};

// Confirm password validation
const validateConfirmPassword = () => {
  confirmPasswordError.value = "";
  if (form.newPassword !== form.confirmPassword) {
    confirmPasswordError.value = "Passwords do not match";
  }
};

// Form validation
const isFormValid = computed(() => {
  return (
    form.currentPassword &&
    form.newPassword &&
    form.confirmPassword &&
    passwordErrors.value.length === 0 &&
    !confirmPasswordError.value
  );
});

// Change password function
const changePassword = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!isFormValid.value) {
    errorMessage.value = "Please fix the errors above";
    return;
  }

  isLoading.value = true;

  try {
    const result = await authStore.changePassword(form.newPassword);

    if (result.success) {
      successMessage.value = "Password changed successfully! Redirecting...";

      // Redirect to appropriate dashboard after 2 seconds
      setTimeout(() => {
        const userRole = authStore.user?.role;

        if (userRole === "admin") {
          router.push("/dashboard");
        } else if (userRole === "nurse") {
          router.push("/nurse/dashboard");
        } else {
          router.push("/patient/dashboard");
        }
      }, 2000);
    } else {
      errorMessage.value = result.error || "Failed to change password";
    }
  } catch (error) {
    errorMessage.value = error.message || "Failed to change password";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Base styling */
.change-password-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
  position: relative;
  padding: 20px;
}

.change-password-container {
  width: 100%;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  background-color: #fff;
}

.change-password-content {
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
  background: linear-gradient(45deg, #dc3545, #fd7e14);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(220, 53, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}

.auth-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
  color: #dc3545;
}

.subtitle {
  color: #6c757d;
  font-size: 16px;
  margin-bottom: 0;
}

/* Form styling */
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

input {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 1px solid #ced4da;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background-color: #f8f9fa;
}

input:focus {
  outline: none;
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
  background-color: #fff;
}

.primary-button {
  width: 100%;
  background: linear-gradient(45deg, #dc3545, #fd7e14);
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

.primary-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #c82333, #e8680a);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
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

/* Password hints and errors */
.password-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
  padding-left: 5px;
}

.password-hint.error {
  color: #dc3545;
}

.error-item {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.error-item i {
  margin-right: 5px;
  font-size: 10px;
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

.alert-success {
  background-color: #d1e7dd;
  color: #0f5132;
  border-left: 4px solid #198754;
}

@media (max-width: 768px) {
  .change-password-content {
    padding: 30px 20px;
  }

  .change-password-container {
    margin: 0;
  }

  .change-password-page {
    padding: 10px;
  }
}
</style>
