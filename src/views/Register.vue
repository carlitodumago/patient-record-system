<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { notificationService } from "../services/notificationService";

const { register: authRegister, loading: authLoading } = useAuth();
const router = useRouter();

// Register form data
const registerForm = reactive({
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
    !registerForm.address ||
    !registerForm.gender ||
    !registerForm.birthdate ||
    !registerForm.contactNumber
  ) {
    errorMessage.value = "Please fill in all required fields";
    return;
  }

  // Validate birthdate format (required for password generation)
  if (!isValidDateFormat(registerForm.birthdate)) {
    errorMessage.value = "Please enter a valid birthdate in mm/dd/yyyy format";
    return;
  }

  isLoading.value = true;

  try {
    // Generate credentials
    const username = generatedUsername.value;
    const password = generatedPassword.value;

    // Call the register API through the auth composable
    const metadata = {
      username: username,
      first_name: registerForm.firstName,
      last_name: registerForm.lastName,
      suffix: registerForm.suffix,
      email: registerForm.email,
      address: registerForm.address,
      gender: registerForm.gender,
      birthdate: convertToISODate(registerForm.birthdate), // Convert to ISO format
      contact_number: registerForm.contactNumber,
      role: registerForm.role,
    };
    const result = await authRegister(registerForm.email, password, metadata);

    if (result.success) {
      // Send welcome notifications (email and SMS)
      try {
        const notificationResult =
          await notificationService.sendWelcomeNotifications({
            firstName: registerForm.firstName,
            lastName: registerForm.lastName,
            username: username,
            password: password,
            email: registerForm.email,
            contactNumber: registerForm.contactNumber,
            role: registerForm.role,
          });

        // Send admin notification about new registration
        try {
          const adminNotificationResult =
            await notificationService.sendAdminNotification({
              firstName: registerForm.firstName,
              lastName: registerForm.lastName,
              email: registerForm.email,
              contactNumber: registerForm.contactNumber,
              role: registerForm.role,
              username: username,
            });

          if (!adminNotificationResult.success) {
            console.warn(
              "Admin notification failed to send:",
              adminNotificationResult
            );
          }
        } catch (adminError) {
          console.warn("Admin notification error:", adminError);
          // Don't block registration success for admin notification failures
        }

        if (notificationResult.success) {
          successMessage.value =
            "Registration successful! Your account details have been sent to your email and phone. You can now log in.";
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

// Format date from yyyy-mm-dd to mm/dd/yyyy
const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${month}/${day}/${year}`;
};

// Convert mm/dd/yyyy to yyyy-mm-dd for storage
const convertToISODate = (dateString) => {
  if (!dateString) return "";
  const [month, day, year] = dateString.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// Validate mm/dd/yyyy date format
const isValidDateFormat = (dateString) => {
  if (!dateString) return false;
  const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!dateRegex.test(dateString)) return false;

  const [month, day, year] = dateString.split("/");
  const date = new Date(`${year}-${month}-${day}`);
  return (
    date.getFullYear() == year &&
    date.getMonth() + 1 == month &&
    date.getDate() == day
  );
};

// Handle birthdate input with mask
const handleBirthdateInput = (event) => {
  let value = event.target.value.replace(/[^\d/]/g, ""); // Only allow numbers and /

  // Auto-format as user types
  if (value.length === 2 && !value.includes("/")) {
    value += "/";
  } else if (value.length === 5 && value.split("/").length === 2) {
    value += "/";
  }

  // Limit to 10 characters (mm/dd/yyyy)
  if (value.length > 10) {
    value = value.substring(0, 10);
  }

  registerForm.birthdate = value;
};

// Computed property to validate birthdate
const isBirthdateValid = computed(() => {
  return !registerForm.birthdate || isValidDateFormat(registerForm.birthdate);
});

// Auto-generate username from first and last name
const generatedUsername = computed(() => {
  if (registerForm.firstName && registerForm.lastName) {
    return `${registerForm.firstName.toLowerCase()}.${registerForm.lastName.toLowerCase()}`;
  }
  return "";
});

// Auto-generate password from birthdate (mm-dd-yyyy format)
const generatedPassword = computed(() => {
  if (registerForm.birthdate && isValidDateFormat(registerForm.birthdate)) {
    const [month, day, year] = registerForm.birthdate.split("/");
    return `${month.padStart(2, "0")}-${day.padStart(2, "0")}-${year}`;
  }
  return "";
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
            <!-- Username and Password are auto-generated -->
            <div v-if="generatedUsername" class="form-group">
              <label>Generated Username</label>
              <div class="input-container">
                <i class="bi bi-person input-icon"></i>
                <input
                  type="text"
                  :value="generatedUsername"
                  readonly
                  class="form-control-plaintext"
                  style="background-color: #f8f9fa; cursor: not-allowed"
                />
                <small class="text-muted">Auto-generated from your name</small>
              </div>
            </div>

            <div v-if="generatedPassword" class="form-group">
              <label>Generated Password</label>
              <div class="input-container">
                <i class="bi bi-lock input-icon"></i>
                <input
                  type="text"
                  :value="generatedPassword"
                  readonly
                  class="form-control-plaintext"
                  style="background-color: #f8f9fa; cursor: not-allowed"
                />
                <small class="text-muted"
                  >Auto-generated from your birthdate</small
                >
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
                  type="text"
                  id="birthdate"
                  v-model="registerForm.birthdate"
                  @input="handleBirthdateInput"
                  placeholder="mm/dd/yyyy"
                  maxlength="10"
                  :class="{
                    'is-invalid': registerForm.birthdate && !isBirthdateValid,
                  }"
                  required
                />
                <div
                  v-if="registerForm.birthdate && !isBirthdateValid"
                  class="invalid-feedback"
                >
                  Please enter a valid date in mm/dd/yyyy format
                </div>
                <div
                  v-if="registerForm.birthdate && isBirthdateValid"
                  class="date-display"
                >
                  Valid date format
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

.date-display {
  margin-top: 5px;
  font-size: 12px;
  color: #198754;
  font-weight: 500;
}

.invalid-feedback {
  margin-top: 5px;
  font-size: 12px;
  color: #dc3545;
  font-weight: 500;
}

input.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
}

input.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
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
