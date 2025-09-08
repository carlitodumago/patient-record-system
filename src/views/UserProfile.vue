<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const router = useRouter();

const user = computed(() => userStore.user);
const isLoading = ref(false);
const isSaving = ref(false);
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const saveSuccess = ref(false);
const errorMessage = ref('');
const profileImage = ref(null);
const imagePreview = ref('');

// Form data for editing
const profileForm = ref({
  username: '',
  fullName: '',
  email: '',
  role: '',
  password: '',
  confirmPassword: '',
  changePassword: false,
  profilePicture: ''
});

// Handle image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.match('image.*')) {
    errorMessage.value = 'Please select an image file (JPEG, PNG, GIF)';
    return;
  }
  
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'Image size should not exceed 2MB';
    return;
  }
  
  profileImage.value = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Load user profile data into form
onMounted(() => {
  if (!user.value) {
    router.push('/login');
    return;
  }
  
  // Get the full user details from stored users
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const defaultUsers = userStore.users;
  
  // Find the user in either registered or default users
  const currentUser = [...users, ...defaultUsers].find(u => u.username === user.value.username);
  
  if (currentUser) {
    profileForm.value = {
      username: currentUser.username,
      fullName: currentUser.fullName || '',
      email: currentUser.email || '',
      role: currentUser.role || 'user',
      password: '',
      confirmPassword: '',
      changePassword: false,
      profilePicture: currentUser.profilePicture || ''
    };
    
    // Set image preview if profile picture exists
    if (currentUser.profilePicture) {
      imagePreview.value = currentUser.profilePicture;
    }
  }
});

// Toggle edit mode
const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
  
  if (!isEditing.value) {
    // Reset form values when canceling edit
    profileForm.value.password = '';
    profileForm.value.confirmPassword = '';
    profileForm.value.changePassword = false;
    
    // Reset image preview if canceled and no image was saved
    if (!profileForm.value.profilePicture) {
      imagePreview.value = '';
    } else {
      imagePreview.value = profileForm.value.profilePicture;
    }
    profileImage.value = null;
  }
};

// Form validation
const validateForm = () => {
  errorMessage.value = '';
  
  if (!profileForm.value.fullName.trim()) {
    errorMessage.value = 'Full name is required';
    return false;
  }
  
  if (profileForm.value.email && !/\S+@\S+\.\S+/.test(profileForm.value.email)) {
    errorMessage.value = 'Email address is invalid';
    return false;
  }
  
  if (profileForm.value.changePassword) {
    if (profileForm.value.password.length < 6) {
      errorMessage.value = 'Password must be at least 6 characters long';
      return false;
    }
    
    if (profileForm.value.password !== profileForm.value.confirmPassword) {
      errorMessage.value = 'Passwords do not match';
      return false;
    }
  }
  
  return true;
};

// Save profile changes
const saveProfile = () => {
  if (!validateForm()) {
    return;
  }
  
  isSaving.value = true;
  
  setTimeout(() => {
    try {
      // Process profile image if uploaded
      if (profileImage.value) {
        // Using FileReader to convert image to base64 string for storage
        const reader = new FileReader();
        reader.onload = (e) => {
          profileForm.value.profilePicture = e.target.result;
          saveProfileData();
        };
        reader.readAsDataURL(profileImage.value);
      } else {
        saveProfileData();
      }
    } catch (err) {
      errorMessage.value = 'Failed to update profile. Please try again.';
      isSaving.value = false;
    }
  }, 800);
};

const saveProfileData = () => {
  // Get existing users
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const defaultUsers = userStore.users;
  
  // Find and update the user
  let userUpdated = false;
  
  // Try to update in registered users first
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === user.value.username) {
      users[i].fullName = profileForm.value.fullName;
      users[i].email = profileForm.value.email;
      users[i].profilePicture = profileForm.value.profilePicture;
      
      if (profileForm.value.changePassword) {
        users[i].password = profileForm.value.password;
      }
      
      userUpdated = true;
      break;
    }
  }
  
  // Then try default users if not found
  if (!userUpdated) {
    for (let i = 0; i < defaultUsers.length; i++) {
      if (defaultUsers[i].username === user.value.username) {
        defaultUsers[i].fullName = profileForm.value.fullName;
        defaultUsers[i].email = profileForm.value.email;
        defaultUsers[i].profilePicture = profileForm.value.profilePicture;
        
        if (profileForm.value.changePassword) {
          defaultUsers[i].password = profileForm.value.password;
        }
        
        userUpdated = true;
        break;
      }
    }
  }
  
  // Save changes back to storage
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  
  // Update the current user in Pinia store
  const updatedUserData = {
    ...user.value,
    fullName: profileForm.value.fullName,
    profilePicture: profileForm.value.profilePicture
  };
  userStore.setUser(updatedUserData);
  
  // Update localStorage user data
  localStorage.setItem('user', JSON.stringify(updatedUserData));
  
  saveSuccess.value = true;
  isEditing.value = false;
  
  // Reset success message after a while
  setTimeout(() => {
    saveSuccess.value = false;
  }, 3000);
  
  isSaving.value = false;
};

// Delete account
const deleteAccount = () => {
  isLoading.value = true;
  
  setTimeout(() => {
    try {
      // Get registered users
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Remove current user
      const updatedUsers = users.filter(u => u.username !== user.value.username);
      
      // Save changes back to storage
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      // Log out user
      localStorage.removeItem('user');
      userStore.logout();
      
      // Redirect to login
      router.push('/login');
    } catch (err) {
      errorMessage.value = 'Failed to delete account. Please try again.';
      isLoading.value = false;
      showDeleteConfirm.value = false;
    }
  }, 1000);
};
</script>

<template>
  <div class="user-profile">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>My Profile</h2>
      <div v-if="!isEditing">
        <button @click="toggleEditMode" class="btn btn-primary me-2">
          <i class="bi bi-pencil-square me-2"></i> Edit Profile
        </button>
        <button @click="showDeleteConfirm = true" class="btn btn-outline-danger">
          <i class="bi bi-trash me-2"></i> Delete Account
        </button>
      </div>
    </div>
    
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    
    <div v-if="saveSuccess" class="alert alert-success">
      Profile updated successfully!
    </div>
    
    <div class="row">
      <div class="col-lg-8">
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Profile Information</h5>
            <div v-if="isEditing" class="btn-group">
              <button @click="saveProfile" class="btn btn-success" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-check-lg me-2"></i> Save
              </button>
              <button @click="toggleEditMode" class="btn btn-secondary" :disabled="isSaving">
                <i class="bi bi-x-lg me-2"></i> Cancel
              </button>
            </div>
          </div>
          
          <div class="card-body">
            <!-- View mode -->
            <div v-if="!isEditing">
              <div class="profile-image mb-4 text-center">
                <div v-if="imagePreview" class="profile-picture-container">
                  <img :src="imagePreview" alt="Profile picture" class="profile-picture">
                </div>
                <div v-else class="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style="width: 120px; height: 120px;">
                  <i class="bi bi-person text-primary" style="font-size: 4rem;"></i>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-sm-4">
                  <h6 class="text-muted">Username</h6>
                </div>
                <div class="col-sm-8">
                  <p>{{ user?.username }}</p>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-sm-4">
                  <h6 class="text-muted">Full Name</h6>
                </div>
                <div class="col-sm-8">
                  <p>{{ profileForm.fullName || 'Not set' }}</p>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-sm-4">
                  <h6 class="text-muted">Email</h6>
                </div>
                <div class="col-sm-8">
                  <p>{{ profileForm.email || 'Not set' }}</p>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-sm-4">
                  <h6 class="text-muted">Role</h6>
                </div>
                <div class="col-sm-8">
                  <p><span class="badge bg-primary">Administrator</span></p>
                </div>
              </div>
            </div>
            
            <!-- Edit mode -->
            <form v-else @submit.prevent="saveProfile">
              <div class="profile-image mb-4 text-center">
                <div v-if="imagePreview" class="profile-picture-container mb-2">
                  <img :src="imagePreview" alt="Profile picture" class="profile-picture">
                </div>
                <div v-else class="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-2" style="width: 120px; height: 120px;">
                  <i class="bi bi-person text-primary" style="font-size: 4rem;"></i>
                </div>
                
                <div class="profile-upload">
                  <label for="profilePicture" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-camera me-2"></i> 
                    {{ imagePreview ? 'Change Photo' : 'Upload Photo' }}
                  </label>
                  <input 
                    type="file" 
                    id="profilePicture" 
                    accept="image/*"
                    @change="handleImageUpload" 
                    class="d-none"
                  >
                  <button 
                    v-if="imagePreview" 
                    type="button" 
                    class="btn btn-outline-danger btn-sm ms-2"
                    @click="imagePreview = ''; profileForm.profilePicture = ''"
                  >
                    <i class="bi bi-trash me-2"></i> Remove
                  </button>
                </div>
                <small class="d-block text-muted mt-1">Maximum size: 2 MB. Supported formats: JPEG, PNG, GIF</small>
              </div>
              
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  class="form-control"
                  v-model="profileForm.username"
                  disabled
                >
                <small class="text-muted">Username cannot be changed</small>
              </div>
              
              <div class="mb-3">
                <label for="fullName" class="form-label">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  class="form-control"
                  v-model="profileForm.fullName"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  class="form-control"
                  v-model="profileForm.email"
                >
              </div>
              
              <div class="mb-3">
                <label for="role" class="form-label">Role</label>
                <input
                  type="text"
                  id="role"
                  class="form-control"
                  value="admin"
                  disabled
                >
                <small class="text-muted">Role cannot be changed</small>
              </div>
              
              <div class="mb-3 form-check">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  id="changePassword"
                  v-model="profileForm.changePassword"
                >
                <label class="form-check-label" for="changePassword">Change Password</label>
              </div>
              
              <div v-if="profileForm.changePassword">
                <div class="mb-3">
                  <label for="password" class="form-label">New Password</label>
                  <input
                    type="password"
                    id="password"
                    class="form-control"
                    v-model="profileForm.password"
                  >
                  <small class="text-muted">Minimum 6 characters</small>
                </div>
                
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    class="form-control"
                    v-model="profileForm.confirmPassword"
                  >
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Account Information</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-sm-6">
                <h6 class="text-muted">Account Type</h6>
              </div>
              <div class="col-sm-6">
                <p><span class="badge bg-primary">Administrator</span></p>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-sm-6">
                <h6 class="text-muted">Status</h6>
              </div>
              <div class="col-sm-6">
                <p><span class="badge bg-success">Active</span></p>
              </div>
            </div>
            
            <hr>
            
            <div class="d-grid">
              <button @click="router.push('/patients')" class="btn btn-outline-primary">
                <i class="bi bi-people me-2"></i> View Patients
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Account Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-backdrop fade show"></div>
    <div v-if="showDeleteConfirm" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Account</h5>
            <button @click="showDeleteConfirm = false" type="button" class="btn-close btn-close-white" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <p><strong>Warning:</strong> All your personal data will be permanently removed.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteConfirm = false" type="button" class="btn btn-secondary">
              Cancel
            </button>
            <button @click="deleteAccount" type="button" class="btn btn-danger" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border-radius: 0.5rem;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, var(--secondary-gradient-start), var(--secondary-gradient-end));
  color: white;
  border-bottom: none;
}

/* Modal styling when displayed with d-block */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border: none;
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Profile picture styles */
.profile-picture-container {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-upload {
  margin-top: 0.5rem;
}
</style>