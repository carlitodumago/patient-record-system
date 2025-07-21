<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

const store = useStore();
const router = useRouter();
const route = useRoute();

// Form data
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'admin',
  fullName: '',
  email: '',
  agreeTerms: false
});

// UI state
const errorMessage = ref('');
const isLoading = ref(false);
const registrationSuccess = ref(false);
const showPassword = ref(false);

// Animation states - matching Login.vue
const isAnimating = ref(false);
const formDirection = ref('right');
const isLoginMode = ref(false);

// Animated class based on current mode - matching Login.vue
const containerClass = computed(() => {
  return {
    'auth-container': true,
    'register-mode': !isLoginMode.value,
    'slide-from-left': formDirection.value === 'left' && isAnimating.value,
    'slide-from-right': formDirection.value === 'right' && isAnimating.value
  };
});

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const register = () => {
  // Clear any previous error
  errorMessage.value = '';
  
  // Basic validation
  if (!formData.username || !formData.password || !formData.confirmPassword) {
    errorMessage.value = 'Please fill in all required fields';
    return;
  }
  
  if (formData.password !== formData.confirmPassword) {
    errorMessage.value = 'Passwords do not match';
    return;
  }
  
  if (formData.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long';
    return;
  }
  
  isLoading.value = true;
  
  // Simulate API call delay
  setTimeout(() => {
    // Check if username already exists
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = existingUsers.some(user => user.username === formData.username);
    
    if (userExists) {
      errorMessage.value = 'Username already exists';
      isLoading.value = false;
      return;
    }
    
    // Add the new user
    const newUser = {
      username: formData.username,
      password: formData.password, // In a real app, this would be hashed
      role: formData.role,
      fullName: formData.fullName,
      email: formData.email
    };
    
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    // Add to mock users in store
    store.commit('addUser', newUser);
    
    // Show success message
    registrationSuccess.value = true;
    isLoading.value = false;
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login?register=success');
    }, 2000);
  }, 1000);
};

// Switch to login mode - matching Login.vue animation
const switchMode = (mode) => {
  if ((mode === 'login' && isLoginMode.value) || (mode === 'register' && !isLoginMode.value)) {
    return; // Already in this mode
  }
  
  // Set animation direction
  formDirection.value = mode === 'login' ? 'left' : 'right';
  
  // Start animation
  isAnimating.value = true;
  setTimeout(() => {
    isLoginMode.value = mode === 'login';
    
    // If switching to login, navigate to login page
    if (isLoginMode.value) {
      router.push('/login');
    }
    
    // Reset errors
    errorMessage.value = '';
    
    // End animation
    setTimeout(() => {
      isAnimating.value = false;
    }, 300);
  }, 300); // Match this with the CSS transition time
};

const goToLogin = () => {
  switchMode('login');
};

onMounted(() => {
  // Check if coming from login page
  if (route.query.login === 'true') {
    formDirection.value = 'left';
  }
});
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
        <div class="auth-form register-form">
          <div class="auth-header">
            <div class="logo-container">
              <i class="bi bi-hospital"></i>
            </div>
            <h1>Patient Record System</h1>
            <p class="subtitle">Create a new account</p>
          </div>
          
          <div v-if="errorMessage" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ errorMessage }}
          </div>
          
          <div v-if="registrationSuccess" class="alert alert-success">
            <i class="bi bi-check-circle-fill me-2"></i>
            Registration successful! You will be redirected to the login page.
          </div>
          
          <form @submit.prevent="register" v-if="!registrationSuccess">
            <div class="form-row">
              <div class="form-group">
                <label for="username">Username <span class="required-field">*</span></label>
                <div class="input-container">
                  <i class="bi bi-person input-icon"></i>
                  <input 
                    type="text" 
                    id="username" 
                    v-model="formData.username" 
                    placeholder="Choose a username"
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
                    v-model="formData.fullName" 
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="password">Password <span class="required-field">*</span></label>
                <div class="input-container">
                  <i class="bi bi-lock input-icon"></i>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    id="password" 
                    v-model="formData.password" 
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <i 
                    class="bi toggle-password" 
                    :class="showPassword ? 'bi-eye-slash' : 'bi-eye'" 
                    @click="togglePasswordVisibility"
                  ></i>
                </div>
                <div class="password-hint">Minimum 6 characters</div>
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">Confirm Password <span class="required-field">*</span></label>
                <div class="input-container">
                  <i class="bi bi-shield-lock input-icon"></i>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    id="confirmPassword" 
                    v-model="formData.confirmPassword" 
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="email">Email Address</label>
                <div class="input-container">
                  <i class="bi bi-envelope input-icon"></i>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="formData.email" 
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <!-- New Role Select -->
              <div class="form-group">
                <label for="role">Role <span class="required-field">*</span></label>
                <div class="input-container">
                  <i class="bi bi-person-badge input-icon"></i>
                  <select id="role" v-model="formData.role" required>
                    <option value="employee">Employee</option>
                    <option value="patient">Patient</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="agreeTerms">
                <input type="checkbox" id="agreeTerms" v-model="formData.agreeTerms" required>
                I agree to the terms and conditions <span class="required-field">*</span>
              </label>
            </div>
            
            <div class="form-button">
              <button 
                type="submit" 
                class="primary-button"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner"></span>
                <span>{{ isLoading ? 'Creating Account...' : 'Register' }}</span>
              </button>
            </div>
          </form>
          
          <div class="form-footer">
            <p>Already have an account? <a href="#" @click.prevent="goToLogin">Sign in</a></p>
          </div>
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
  bottom: -100px;
  left: -50px;
  animation-delay: 2s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: 50px;
  right: 50px;
  animation-delay: 4s;
}

.circle-4 {
  width: 100px;
  height: 100px;
  top: 50px;
  left: 150px;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
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

/* Authentication form */
.auth-form {
  max-width: 600px;
  margin: 0 auto;
}

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
  color: #333;
  margin-bottom: 5px;
}

.subtitle {
  color: #6c757d;
  font-size: 16px;
  margin-bottom: 20px;
}

/* Form styles */
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 10px;
}

.form-group {
  flex: 1;
  min-width: 250px;
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.required-field {
  color: #dc3545;
}

.input-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #ced4da;
}

.input-container:focus-within {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 18px;
}

.input-container input,
.input-container select {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  font-size: 18px;
}

.password-hint {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

.alert {
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.alert-danger {
  background-color: #f8d7da;
  color: #842029;
  border: 1px solid #f5c2c7;
}

.alert-success {
  background-color: #d1e7dd;
  color: #0f5132;
  border: 1px solid #badbcc;
}

.form-button {
  margin-top: 30px;
}

.primary-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #0d6efd, #0dcaf0);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-button:hover {
  background: linear-gradient(to right, #0b5ed7, #0bacce);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-footer {
  margin-top: 25px;
  text-align: center;
  color: #6c757d;
}

.form-footer a {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 500;
}

.form-footer a:hover {
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .auth-container {
    margin: 20px;
    max-width: calc(100% - 40px);
  }
  
  .auth-content {
    padding: 30px 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-group {
    min-width: 100%;
  }
}
</style> 