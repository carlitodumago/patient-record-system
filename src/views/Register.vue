<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { notificationService } from "../services/notificationService";

const { register: authRegister, loading: authLoading } = useAuth();
const router = useRouter();

// Register form data
const registerForm = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  role: "patient", // Default role set to patient
  firstName: "",
  lastName: "",
  suffix: "",
  email: "",
  address: "",
  gender: "",
  birthdate: "",
  contactNumber: "",
});

// UI state
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Check if auth is loading
const isStoreLoading = authLoading;

// Register function
const register = async () => {
  // Clear any previous error
  errorMessage.value = "";
  successMessage.value = "";

  // Basic validation
  if (
    !registerForm.firstName ||
    !registerForm.lastName ||
    !registerForm.email ||
    !registerForm.password ||
    !registerForm.confirmPassword ||
    !registerForm.address ||
    !registerForm.gender ||
    !registerForm.birthdate ||
    !registerForm.contactNumber
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
      first_name: registerForm.firstName,
      last_name: registerForm.lastName,
      suffix: registerForm.suffix,
      email: registerForm.email,
      address: registerForm.address,
      gender: registerForm.gender,
      birthdate: registerForm.birthdate,
      contact_number: registerForm.contactNumber,
      role: registerForm.role,
    };
    const result = await authRegister(
      registerForm.email,
      registerForm.password,
      metadata
    );

    if (result.success) {
      // Send welcome notifications (email and SMS)
      try {
        const notificationResult =
          await notificationService.sendWelcomeNotifications({
            firstName: registerForm.firstName,
            lastName: registerForm.lastName,
            username: registerForm.username,
            password: registerForm.password,
            email: registerForm.email,
            contactNumber: registerForm.contactNumber,
            role: registerForm.role,
          });

        if (notificationResult.success) {
          successMessage.value =
            "Registration successful! Welcome notifications sent. You can now log in.";
        } else {
          successMessage.value =
            "Registration successful! You can now log in. (Note: Some notifications may not have been sent)";
          console.warn(
            "Notification sending partially failed:",
            notificationResult
          );
        }
      } catch (notificationError) {
        console.error("Notification sending failed:", notificationError);
        successMessage.value =
          "Registration successful! You can now log in. (Note: Welcome notifications could not be sent)";
      }

      // Redirect to login after a delay
      setTimeout(() => {
        router.push("/login?register=success");
      }, 3000); // Increased delay to allow reading the message
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

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Toggle confirm password visibility
const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// Format date to mm/dd/yyyy
const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${month}/${day}/${year}`;
};

// Computed property to format birthdate for display if needed
const formattedBirthdate = computed(() => {
  return formatDate(registerForm.birthdate);
});
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Animated background elements -->
      <div class="animated-bg">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-4"></div>
      </div>

      <div class="register-content">
        <!-- Register Form -->
        <div class="register-form">
          <div class="register-header">
            <button class="back-button" @click="$router.push('/dashboard')">
              <i class="bi bi-arrow-left"></i>
              Back
            </button>
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
                <i class="bi bi-lock input-icon me-2"></i>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="register-password"
                  v-model="registerForm.password"
                  placeholder="Create a password"
                  autocomplete="new-password"
                  required
                />
                <i
                  class="bi show-password-toggle"
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
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirm-password"
                  v-model="registerForm.confirmPassword"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                  required
                />
                <i
                  class="bi show-password-toggle"
                  :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"
                  @click="toggleConfirmPasswordVisibility"
                ></i>
              </div>
            </div>

            <div class="form-group">
              <label for="register-role">Role</label>
              <div class="input-container">
                <i class="bi bi-person-badge input-icon"></i>
                <select id="register-role" v-model="registerForm.role" required>
                  <option value="nurse">Nurse/Clinic Staff</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
            </div>

            <div class="name-fields">
              <div class="form-group">
                <label for="first-name"
                  >First Name <span class="required">*</span></label
                >
                <div class="input-container">
                  <i class="bi bi-person input-icon"></i>
                  <input
                    type="text"
                    id="first-name"
                    v-model="registerForm.firstName"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="last-name"
                  >Last Name <span class="required">*</span></label
                >
                <div class="input-container">
                  <i class="bi bi-person input-icon"></i>
                  <input
                    type="text"
                    id="last-name"
                    v-model="registerForm.lastName"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div class="form-group suffix-field">
                <label for="suffix">Suffix (Optional)</label>
                <div class="input-container">
                  <i class="bi bi-person input-icon"></i>
                  <input
                    type="text"
                    id="suffix"
                    v-model="registerForm.suffix"
                    placeholder="e.g., Jr., Sr., III"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email <span class="required">*</span></label>
              <div class="input-container">
                <i class="bi bi-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  v-model="registerForm.email"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="address"
                >Address <span class="required">*</span></label
              >
              <div class="input-container">
                <i class="bi bi-geo-alt input-icon"></i>
                <input
                  type="text"
                  id="address"
                  v-model="registerForm.address"
                  placeholder="Enter your address"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="gender">Gender <span class="required">*</span></label>
              <div class="input-container">
                <i class="bi bi-person-fill input-icon"></i>
                <select id="gender" v-model="registerForm.gender" required>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="birthdate"
                >Birthdate <span class="required">*</span></label
              >
              <div class="input-container">
                <i class="bi bi-calendar input-icon"></i>
                <input
                  type="date"
                  id="birthdate"
                  v-model="registerForm.birthdate"
                  placeholder="Select your birthdate (mm/dd/yyyy)"
                  required
                />
                <div v-if="formattedBirthdate" class="date-display">
                  Selected: {{ formattedBirthdate }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="contact-number"
                >Contact Number <span class="required">*</span></label
              >
              <div class="input-container">
                <i class="bi bi-telephone input-icon"></i>
                <input
                  type="tel"
                  id="contact-number"
                  v-model="registerForm.contactNumber"
                  placeholder="Enter your contact number"
                  required
                />
              </div>
            </div>

            <button type="submit" class="register-button" :disabled="isLoading">
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              {{ isLoading ? "Registering..." : "Create Account" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base styling */
.register-page {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  display: flex;
  align-items: stretch;
}

.register-container {
  width: 100%;
  position: relative;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.register-content {
  padding: 40px;
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
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

/* Register header */
.register-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  top: 0;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 8px 12px;
  color: #6c757d;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #f8f9fa;
  border-color: #0d6efd;
  color: #0d6efd;
}

.back-button i {
  font-size: 16px;
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

.register-header h1 {
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
.register-form {
  transition: all 0.5s ease;
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
}

.name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.name-fields .form-group {
  margin-bottom: 0;
}

.suffix-field {
  grid-column: 1 / -1;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #495057;
}

.required {
  color: #dc3545;
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

.show-password-toggle {
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.show-password-toggle:hover {
  background-color: rgba(108, 117, 125, 0.1);
}

.date-display {
  margin-top: 5px;
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

input,
select {
  width: 100%;
  padding: 15px 45px 15px 45px;
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

.register-button {
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
  margin-top: 10px;
}

.register-button:hover {
  background: linear-gradient(45deg, #0b5ed7, #0bacbe);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
}

.register-button:disabled {
  opacity: 0.7;
  transform: none;
  cursor: not-allowed;
}

.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #6c757d;
}

.login-link a {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link a:hover {
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

.alert-success {
  background-color: #d1e7dd;
  color: #0f5132;
  border-left: 4px solid #198754;
}

@media (max-width: 768px) {
  .register-content {
    padding: 30px 20px;
  }

  .register-header h1 {
    font-size: 24px;
  }

  .name-fields {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .suffix-field {
    grid-column: auto;
  }
}
</style>
