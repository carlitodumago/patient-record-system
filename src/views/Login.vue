<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";

const store = useStore();
const router = useRouter();
const route = useRoute();
const {
  login: supabaseLogin,
  register: supabaseRegister,
  loading,
  isAuthenticated,
} = useAuth();

// Login form data
const loginForm = reactive({
  username: "",
  password: "",
});

// Register form data
const registerForm = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  role: "patient", // Default role set to patient
  fullName: "",
});

// UI state
const currentMode = ref("login");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showLoginFormPassword = ref(false);
const showRegisterFormPassword = ref(false);

// Animation states
const isAnimating = ref(false);
const formDirection = ref("right");

// Animated class based on current mode
const containerClass = computed(() => {
  return {
    "login-container": true,
    "animate-fade-in": !isAnimating.value,
    "animate-slide-right": isAnimating.value && formDirection.value === "right",
    "animate-slide-left": isAnimating.value && formDirection.value === "left",
  };
});

// Check if user is already logged in
onMounted(() => {
  const user = localStorage.getItem("user");
  if (user) {
    router.push("/dashboard");
  }

  // Check for redirect message
  if (route.query.message) {
    errorMessage.value = route.query.message;
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
    // Map username to email for Supabase authentication
    let emailToUse = loginForm.username;
    
    // Special case for admin username
    if (loginForm.username.toLowerCase() === 'admin') {
      emailToUse = 'admin@patientrecord.system';
    } else {
      // For other usernames, try to use them as emails or append a domain
      if (!loginForm.username.includes('@')) {
        emailToUse = `${loginForm.username}@patientrecord.system`;
      }
    }

    // Use Supabase auth to login
    const result = await supabaseLogin(emailToUse, loginForm.password);

    if (result.success) {
      // Supabase auth will automatically update the store via useAuth composable
      // No need to manually store in localStorage
      
      // Redirect to dashboard on successful login
      router.push("/dashboard");
    } else {
      errorMessage.value = result.error || "Invalid username or password";
    }
  } catch (error) {
    errorMessage.value = error.message || "Invalid username or password";
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
    // Use Supabase auth to register
    const result = await supabaseRegister(
      registerForm.email,
      registerForm.password,
      {
        full_name: registerForm.fullName,
        role: registerForm.role,
      }
    );

    if (result.success) {
      // Show success message
      successMessage.value = "Registration successful! You can now log in.";

      // Switch to login mode after successful registration
      setTimeout(() => {
        switchMode("login");
      }, 1500);
    } else {
      errorMessage.value = result.error || "Registration failed";
    }
  } catch (error) {
    errorMessage.value = error.message || "Registration failed";
  } finally {
    isLoading.value = false;
  }
};

// Switch between login and register modes
const switchMode = (mode) => {
  if (currentMode.value === mode) return;

  isAnimating.value = true;
  formDirection.value = mode === "register" ? "left" : "right";

  setTimeout(() => {
    currentMode.value = mode;
    errorMessage.value = "";
    successMessage.value = "";

    setTimeout(() => {
      isAnimating.value = false;
    }, 300);
  }, 150);
};

// Toggle password visibility
const toggleLoginFormPassword = () => {
  showLoginFormPassword.value = !showLoginFormPassword.value;
};

const toggleRegisterFormPassword = () => {
  showRegisterFormPassword.value = !showRegisterFormPassword.value;
};

// Demo account helper
const fillDemoAccount = (username, password) => {
  loginForm.username = username.toLowerCase();
  loginForm.password = password;
};
</script>

<template>
  <div class="login-page">
    <div class="login-wrapper">
      <div :class="containerClass">
        <!-- Login Form -->
        <div v-if="currentMode === 'login'" class="form-container">
          <div class="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          <div v-if="errorMessage" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ errorMessage }}
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
                <button
                  type="button"
                  class="password-toggle"
                  @click="toggleLoginFormPassword"
                >
                  <i
                    class="bi"
                    :class="
                      showLoginFormPassword ? 'bi-eye-slash' : 'bi-eye'
                    "
                  ></i>
                </button>
              </div>
            </div>

            <div class="form-button">
              <button
                type="submit"
                class="btn btn-primary btn-block"
                :disabled="isLoading"
              >
                <span
                  v-if="isLoading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ isLoading ? "Signing In..." : "Sign In" }}
              </button>
            </div>
          </form>

          <div class="form-footer">
            <p>
              Don't have an account?
              <a href="#" @click.prevent="switchMode('register')">Register</a>
            </p>
          </div>

          <!-- Demo Admin Account -->
          <div class="demo-accounts">
            <h4>Demo Account</h4>
            <div class="demo-account-grid">
              <div class="demo-account" @click="fillDemoAccount('admin', 'admin123')">
                <div class="demo-account-header">
                  <i class="bi bi-shield-check"></i>
                  <span>Admin Account</span>
                </div>
                <div class="demo-account-details">
                  Username: admin<br>
                  Password: admin123<br>
                  Full system access
                </div>
              </div>
            </div>
            <p class="demo-note">Click to auto-fill login credentials</p>
          </div>
        </div>

        <!-- Register Form -->
        <div v-if="currentMode === 'register'" class="form-container">
          <div class="form-header">
            <h2>Create Account</h2>
            <p>Join our patient management system</p>
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
              <label for="register-email">Email</label>
              <div class="input-container">
                <i class="bi bi-envelope input-icon"></i>
                <input
                  type="email"
                  id="register-email"
                  v-model="registerForm.email"
                  placeholder="Enter your email address"
                  autocomplete="email"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="fullName">Full Name</label>
              <div class="input-container">
                <i class="bi bi-person-badge input-icon"></i>
                <input
                  type="text"
                  id="fullName"
                  v-model="registerForm.fullName"
                  placeholder="Enter your full name"
                  autocomplete="name"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="role">Account Type</label>
              <div class="input-container">
                <i class="bi bi-person-gear input-icon"></i>
                <select
                  id="role"
                  v-model="registerForm.role"
                  class="form-select"
                  required
                >
                  <option value="patient">Patient</option>
                  <option value="nurse">Nurse/Clinic Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="register-password">Password</label>
              <div class="input-container">
                <i class="bi bi-lock input-icon"></i>
                <input
                  :type="showRegisterFormPassword ? 'text' : 'password'"
                  id="register-password"
                  v-model="registerForm.password"
                  placeholder="Minimum 6 characters"
                  autocomplete="new-password"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="toggleRegisterFormPassword"
                >
                  <i
                    class="bi"
                    :class="
                      showRegisterFormPassword ? 'bi-eye-slash' : 'bi-eye'
                    "
                  ></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <div class="input-container">
                <i class="bi bi-shield-lock input-icon"></i>
                <input
                  :type="showRegisterFormPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="registerForm.confirmPassword"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                  required
                />
              </div>
            </div>

            <div class="form-button">
              <button
                type="submit"
                class="btn btn-primary btn-block"
                :disabled="isLoading"
              >
                <span
                  v-if="isLoading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ isLoading ? "Creating Account..." : "Create Account" }}
              </button>
            </div>
          </form>

          <div class="form-footer">
            <p>
              Already have an account?
              <a href="#" @click.prevent="switchMode('login')">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-wrapper {
  width: 100%;
  max-width: 450px;
}

.login-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
}

.form-container {
  padding: 40px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-header p {
  color: #666;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  z-index: 2;
}

.input-container input,
.input-container select {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.input-container input:focus,
.input-container select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
  z-index: 2;
}

.password-toggle:hover {
  color: #333;
}

.form-button {
  margin: 30px 0 20px;
}

.btn-block {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: all 0.3s ease;
}

.btn-block:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-block:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.form-footer p {
  color: #666;
  margin: 0;
}

.form-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.form-footer a:hover {
  text-decoration: underline;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: none;
}

.alert-danger {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.alert-success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

/* Demo accounts section */
.demo-accounts {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.demo-accounts h4 {
  text-align: center;
  color: #333;
  margin-bottom: 15px;
  font-size: 16px;
}

.demo-account-grid {
  display: grid;
  gap: 10px;
}

.demo-account {
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-account:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
}

.demo-account-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.demo-account-header i {
  margin-right: 8px;
  color: #667eea;
}

.demo-account-header span {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.demo-account-details {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.demo-note {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
  margin-bottom: 0;
}

/* Animation classes */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-slide-left {
  animation: slideLeft 0.3s ease-in-out;
}

.animate-slide-right {
  animation: slideRight 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideLeft {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-20px);
  }
}

@keyframes slideRight {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(20px);
  }
}

/* Responsive design */
@media (max-width: 480px) {
  .login-page {
    padding: 10px;
  }

  .form-container {
    padding: 30px 25px;
  }

  .input-container input,
  .input-container select {
    padding: 12px 12px 12px 40px;
    font-size: 14px;
  }

  .btn-block {
    padding: 12px;
    font-size: 14px;
  }
}
</style>