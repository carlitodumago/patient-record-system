<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

const user = computed(() => store.state.user);
const isLoading = ref(false);
const isSaving = ref(false);
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const saveSuccess = ref(false);
const errorMessage = ref("");
const profileImage = ref(null);
const imagePreview = ref("");

// Form data for editing
const profileForm = ref({
  username: "",
  fullName: "",
  email: "",
  role: "",
  password: "",
  confirmPassword: "",
  changePassword: false,
  profilePicture: "",
});

// Handle image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.match("image.*")) {
    errorMessage.value = "Please select an image file (JPEG, PNG, GIF)";
    return;
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = "Image size should not exceed 2MB";
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
    router.push("/login");
    return;
  }

  // Get the full user details from stored users
  const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
  const defaultUsers = store.state.users;

  // Find the user in either registered or default users
  const currentUser = [...users, ...defaultUsers].find(
    (u) => u.username === user.value.username
  );

  if (currentUser) {
    profileForm.value = {
      username: currentUser.username,
      fullName: currentUser.fullName || "",
      email: currentUser.email || "",
      role: currentUser.role || "user",
      password: "",
      confirmPassword: "",
      changePassword: false,
      profilePicture: currentUser.profilePicture || "",
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
    profileForm.value.password = "";
    profileForm.value.confirmPassword = "";
    profileForm.value.changePassword = false;

    // Reset image preview if canceled and no image was saved
    if (!profileForm.value.profilePicture) {
      imagePreview.value = "";
    } else {
      imagePreview.value = profileForm.value.profilePicture;
    }
    profileImage.value = null;
  }
};

// Form validation
const validateForm = () => {
  errorMessage.value = "";

  if (!profileForm.value.fullName.trim()) {
    errorMessage.value = "Full name is required";
    return false;
  }

  if (
    profileForm.value.email &&
    !/\S+@\S+\.\S+/.test(profileForm.value.email)
  ) {
    errorMessage.value = "Email address is invalid";
    return false;
  }

  if (profileForm.value.changePassword) {
    if (profileForm.value.password.length < 6) {
      errorMessage.value = "Password must be at least 6 characters long";
      return false;
    }

    if (profileForm.value.password !== profileForm.value.confirmPassword) {
      errorMessage.value = "Passwords do not match";
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
      errorMessage.value = "Failed to update profile. Please try again.";
      isSaving.value = false;
    }
  }, 800);
};

const saveProfileData = () => {
  // Get existing users
  const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
  const defaultUsers = store.state.users;

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
  localStorage.setItem("registeredUsers", JSON.stringify(users));

  // Update the current user in Vuex store
  const updatedUserData = {
    ...user.value,
    fullName: profileForm.value.fullName,
    profilePicture: profileForm.value.profilePicture,
  };
  store.commit("setUser", updatedUserData);

  // Update localStorage user data
  localStorage.setItem("user", JSON.stringify(updatedUserData));

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
      const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");

      // Remove current user
      const updatedUsers = users.filter(
        (u) => u.username !== user.value.username
      );

      // Save changes back to storage
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

      // Log out user
      localStorage.removeItem("user");
      store.commit("setAuthenticated", false);
      store.commit("setUser", null);

      // Redirect to login
      router.push("/login");
    } catch (err) {
      errorMessage.value = "Failed to delete account. Please try again.";
      isLoading.value = false;
      showDeleteConfirm.value = false;
    }
  }, 1000);
};
</script>

<template>
  <v-container class="user-profile">
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col>
        <h2>My Profile</h2>
      </v-col>
      <v-col cols="auto" v-if="!isEditing">
        <v-btn color="primary" @click="toggleEditMode" class="me-2">
          <v-icon left>mdi-pencil</v-icon> Edit Profile
        </v-btn>
        <v-btn color="error" outlined @click="showDeleteConfirm = true">
          <v-icon left>mdi-delete</v-icon> Delete Account
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="errorMessage" type="error" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-alert v-if="saveSuccess" type="success" class="mb-4">
      Profile updated successfully!
    </v-alert>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Profile Information</span>
            <div v-if="isEditing">
              <v-btn
                color="success"
                @click="saveProfile"
                :disabled="isSaving"
                class="me-2"
              >
                <v-icon v-if="!isSaving" left>mdi-check</v-icon>
                <v-progress-circular
                  v-else
                  size="20"
                  indeterminate
                  class="me-2"
                ></v-progress-circular>
                Save
              </v-btn>
              <v-btn
                color="secondary"
                @click="toggleEditMode"
                :disabled="isSaving"
              >
                <v-icon left>mdi-close</v-icon> Cancel
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text>
            <!-- View mode -->
            <div v-if="!isEditing">
              <div class="profile-image mb-4 text-center">
                <v-avatar v-if="imagePreview" size="120" class="mb-2">
                  <v-img :src="imagePreview" alt="Profile picture"></v-img>
                </v-avatar>
                <v-avatar v-else size="120" color="grey lighten-4" class="mb-2">
                  <v-icon size="60" color="primary">mdi-account</v-icon>
                </v-avatar>
              </div>

              <v-row class="mb-3">
                <v-col cols="4">
                  <h6 class="text--secondary">Username</h6>
                </v-col>
                <v-col cols="8">
                  <p>{{ user?.username }}</p>
                </v-col>
              </v-row>

              <v-row class="mb-3">
                <v-col cols="4">
                  <h6 class="text--secondary">Full Name</h6>
                </v-col>
                <v-col cols="8">
                  <p>{{ profileForm.fullName || "Not set" }}</p>
                </v-col>
              </v-row>

              <v-row class="mb-3">
                <v-col cols="4">
                  <h6 class="text--secondary">Email</h6>
                </v-col>
                <v-col cols="8">
                  <p>{{ profileForm.email || "Not set" }}</p>
                </v-col>
              </v-row>

              <v-row class="mb-3">
                <v-col cols="4">
                  <h6 class="text--secondary">Role</h6>
                </v-col>
                <v-col cols="8">
                  <v-chip color="primary">Administrator</v-chip>
                </v-col>
              </v-row>
            </div>

            <!-- Edit mode -->
            <v-form v-else @submit.prevent="saveProfile">
              <div class="profile-image mb-4 text-center">
                <v-avatar v-if="imagePreview" size="120" class="mb-2">
                  <v-img :src="imagePreview" alt="Profile picture"></v-img>
                </v-avatar>
                <v-avatar v-else size="120" color="grey lighten-4" class="mb-2">
                  <v-icon size="60" color="primary">mdi-account</v-icon>
                </v-avatar>

                <div class="profile-upload">
                  <v-file-input
                    v-model="profileImage"
                    accept="image/*"
                    label="Upload Photo"
                    prepend-icon="mdi-camera"
                    :show-size="true"
                    @change="handleImageUpload"
                    class="mb-2"
                  ></v-file-input>
                  <v-btn
                    v-if="imagePreview"
                    color="error"
                    outlined
                    small
                    @click="
                      imagePreview = '';
                      profileForm.profilePicture = '';
                    "
                  >
                    <v-icon left>mdi-delete</v-icon> Remove
                  </v-btn>
                </div>
                <small class="text--secondary"
                  >Maximum size: 2 MB. Supported formats: JPEG, PNG, GIF</small
                >
              </div>

              <v-text-field
                label="Username"
                v-model="profileForm.username"
                disabled
                hint="Username cannot be changed"
                persistent-hint
                class="mb-3"
              ></v-text-field>

              <v-text-field
                label="Full Name"
                v-model="profileForm.fullName"
                required
                class="mb-3"
              ></v-text-field>

              <v-text-field
                label="Email"
                v-model="profileForm.email"
                type="email"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                label="Role"
                value="admin"
                disabled
                hint="Role cannot be changed"
                persistent-hint
                class="mb-3"
              ></v-text-field>

              <v-checkbox
                v-model="profileForm.changePassword"
                label="Change Password"
                class="mb-3"
              ></v-checkbox>

              <div v-if="profileForm.changePassword">
                <v-text-field
                  label="New Password"
                  v-model="profileForm.password"
                  type="password"
                  hint="Minimum 6 characters"
                  persistent-hint
                  class="mb-3"
                ></v-text-field>

                <v-text-field
                  label="Confirm New Password"
                  v-model="profileForm.confirmPassword"
                  type="password"
                  class="mb-3"
                ></v-text-field>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>Account Information</v-card-title>
          <v-card-text>
            <v-row class="mb-3">
              <v-col cols="6">
                <h6 class="text--secondary">Account Type</h6>
              </v-col>
              <v-col cols="6">
                <v-chip color="primary">Administrator</v-chip>
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6">
                <h6 class="text--secondary">Status</h6>
              </v-col>
              <v-col cols="6">
                <v-chip color="success">Active</v-chip>
              </v-col>
            </v-row>

            <v-divider class="my-3"></v-divider>

            <v-btn
              block
              color="primary"
              outlined
              @click="router.push('/patients')"
            >
              <v-icon left>mdi-account-group</v-icon> View Patients
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Account Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="500">
      <v-card>
        <v-card-title class="error white--text">
          <v-icon left color="white">mdi-alert</v-icon>
          Delete Account
        </v-card-title>
        <v-card-text class="pt-4">
          <p>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <p>
            <strong>Warning:</strong> All your personal data will be permanently
            removed.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="showDeleteConfirm = false"
            >Cancel</v-btn
          >
          <v-btn color="error" @click="deleteAccount" :disabled="isLoading">
            <v-progress-circular
              v-if="isLoading"
              size="20"
              indeterminate
              class="me-2"
            ></v-progress-circular>
            <v-icon v-else left>mdi-delete</v-icon>
            Delete Account
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border-radius: 0.5rem;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(
    135deg,
    var(--secondary-gradient-start),
    var(--secondary-gradient-end)
  );
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
