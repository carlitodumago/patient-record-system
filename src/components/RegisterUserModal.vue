<script setup>
import { ref, reactive } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
  show: Boolean,
  userType: {
    type: String,
    default: 'nurse' // 'nurse' or 'patient'
  }
});

const emit = defineEmits(['close', 'user-registered']);

const store = useStore();

// Form data
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: props.userType,
  fullName: '',
  email: '',
});

// UI state
const errorMessage = ref('');
const isLoading = ref(false);
const showPassword = ref(false);

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const resetForm = () => {
  formData.username = '';
  formData.password = '';
  formData.confirmPassword = '';
  formData.role = props.userType;
  formData.fullName = '';
  formData.email = '';
  errorMessage.value = '';
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
    
    // Show success message and close modal
    isLoading.value = false;
    emit('user-registered', newUser);
    resetForm();
    emit('close');
  }, 1000);
};

const closeModal = () => {
  resetForm();
  emit('close');
};
</script>

<template>
  <div class="modal fade" :class="{ 'd-block show': show }" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Register {{ userType === 'nurse' ? 'Nurse/Clinic Staff' : 'Patient' }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <div v-if="errorMessage" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ errorMessage }}
          </div>
          
          <form @submit.prevent="register">
            <div class="mb-3">
              <label for="username" class="form-label">Username <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person"></i></span>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username" 
                  v-model="formData.username" 
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>
            
            <div class="mb-3">
              <label for="fullName" class="form-label">Full Name <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-person-badge"></i></span>
                <input 
                  type="text" 
                  class="form-control" 
                  id="fullName" 
                  v-model="formData.fullName" 
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>
            
            <div class="mb-3">
              <label for="email" class="form-label">Email Address</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="formData.email" 
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div class="mb-3">
              <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-lock"></i></span>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control" 
                  id="password" 
                  v-model="formData.password" 
                  placeholder="Minimum 6 characters"
                  required
                />
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="togglePasswordVisibility"
                >
                  <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
              <div class="form-text">Minimum 6 characters</div>
            </div>
            
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-shield-lock"></i></span>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control" 
                  id="confirmPassword" 
                  v-model="formData.confirmPassword" 
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button 
            type="button" 
            class="btn btn-primary"
            @click="register"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="show"></div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
}
</style>