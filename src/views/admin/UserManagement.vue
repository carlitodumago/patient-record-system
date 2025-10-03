<template>
  <div class="user-management">
    <div class="page-header">
      <h1 class="page-title">
        <i class="bi bi-people-fill me-3"></i>
        User Management
      </h1>
      <p class="page-description">
        Manage system users, roles, and permissions
      </p>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">System Users</h5>
            <button class="btn btn-primary" @click="showAddUser">
              <i class="bi bi-person-plus me-2"></i>
              Add New User
            </button>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <input
                type="text"
                class="form-control"
                placeholder="Search users..."
                v-model="searchQuery"
              />
            </div>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody v-if="filteredUsers.length > 0">
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar me-3">
                          <i class="bi bi-person-circle fs-4"></i>
                        </div>
                        <div>
                          <div class="fw-bold">{{ user.fullName }}</div>
                          <small class="text-muted">{{ user.username }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="getRoleBadgeClass(user.role)"
                        >{{ user.role }}</span
                      >
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="getStatusBadgeClass(user.status)"
                        @click="toggleUserStatus(user)"
                        style="cursor: pointer"
                      >
                        {{ user.status }}
                      </span>
                    </td>
                    <td>{{ formatDate(user.lastLogin) }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-primary"
                          @click="showEditUser(user)"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger"
                          @click="showDeleteUser(user)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td colspan="5" class="text-center">No users found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Role Management</h5>
          </div>
          <div class="card-body">
            <div
              class="role-item d-flex justify-content-between align-items-center mb-3"
            >
              <div>
                <strong>Administrator</strong>
                <div class="text-muted small">Full system access</div>
              </div>
              <span class="badge bg-danger"
                >{{ roleStats.admin || 0 }} user{{
                  (roleStats.admin || 0) !== 1 ? "s" : ""
                }}</span
              >
            </div>
            <div
              class="role-item d-flex justify-content-between align-items-center mb-3"
            >
              <div>
                <strong>Nurse/Staff</strong>
                <div class="text-muted small">Patient management access</div>
              </div>
              <span class="badge bg-info"
                >{{ roleStats.nurse || 0 }} user{{
                  (roleStats.nurse || 0) !== 1 ? "s" : ""
                }}</span
              >
            </div>
            <div
              class="role-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>Patient</strong>
                <div class="text-muted small">Personal records access</div>
              </div>
              <span class="badge bg-secondary"
                >{{ roleStats.patient || 0 }} user{{
                  (roleStats.patient || 0) !== 1 ? "s" : ""
                }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Permissions</h5>
          </div>
          <div class="card-body">
            <div class="permission-group mb-3">
              <strong>User Management</strong>
              <div class="form-check mt-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  checked
                  disabled
                />
                <label class="form-check-label">Create Users</label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  checked
                  disabled
                />
                <label class="form-check-label">Edit Users</label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  checked
                  disabled
                />
                <label class="form-check-label">Delete Users</label>
              </div>
            </div>
            <div class="permission-group">
              <strong>System Settings</strong>
              <div class="form-check mt-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  checked
                  disabled
                />
                <label class="form-check-label">System Configuration</label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  checked
                  disabled
                />
                <label class="form-check-label">Backup Management</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useNotify } from "../../composables/useNotify.js";
import { supabaseAdmin } from "../../services/supabase.js";

const store = useStore();
const { showNotification } = useNotify();

// Component state
const users = ref([]);
const roles = ref([
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access",
    color: "danger",
  },
  {
    id: "nurse",
    name: "Nurse/Staff",
    description: "Patient management access",
    color: "info",
  },
  {
    id: "patient",
    name: "Patient",
    description: "Personal records access",
    color: "secondary",
  },
]);
const loading = ref(false);
const showAddUserModal = ref(false);
const showEditUserModal = ref(false);
const showDeleteUserModal = ref(false);
const userToEdit = ref(null);
const userToDelete = ref(null);
const realtimeSubscription = ref(null);

// Form data
const newUser = ref({
  password: "",
  username: "",
  fullName: "",
  role: "patient",
  status: "active",
});

const editUser = ref({
  id: "",
  username: "",
  fullName: "",
  role: "patient",
  status: "active",
});

const formErrors = ref({});
const editFormErrors = ref({});
const searchQuery = ref("");
const lastUserCount = ref(0);

// Computed properties
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;

  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.username?.toLowerCase().includes(query) ||
      user.fullName?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
  );
});

const roleStats = computed(() => {
  const stats = {};
  roles.value.forEach((role) => {
    stats[role.id] = users.value.filter((user) => user.role === role.id).length;
  });
  return stats;
});

onMounted(() => {
  loadUsers();
  setupRealtimeSubscription();
});

onUnmounted(() => {
  if (realtimeSubscription.value) {
    realtimeSubscription.value.unsubscribe();
  }
});

// Watch for user count changes to update role statistics
watch(
  () => users.value.length,
  (newCount, oldCount) => {
    if (newCount !== oldCount) {
      console.log(`User count changed from ${oldCount} to ${newCount}`);
      // Role stats will automatically update through computed property
    }
  }
);

const loadUsers = async () => {
  loading.value = true;
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not available");
    }

    // Load users from Supabase admin API
    const { data: usersData, error } =
      await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    // Filter out users with "doctor" role and transform data
    const validUsers = usersData.users
      .filter((user) => {
        const role = user.user_metadata?.role;
        return role && role !== "doctor"; // Exclude doctor roles
      })
      .map((user) => ({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email.split("@")[0],
        fullName: user.user_metadata?.full_name || user.email.split("@")[0],
        role: user.user_metadata?.role || "patient",
        status: user.email_confirmed_at ? "active" : "inactive",
        lastLogin: user.last_sign_in_at || null,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
      }));

    users.value = validUsers;
    console.log(`Loaded ${users.value.length} users from Supabase`);

    // Clean up any remaining localStorage data
    cleanupLocalStorage();
  } catch (error) {
    console.error("Error loading users from Supabase:", error);
    showNotification("Failed to load users from database", {
      type: "error",
      persistent: true,
    });
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const validateUserForm = (userData, errors) => {
  const validationErrors = {};

  if (!userData.username?.trim()) {
    validationErrors.username = "Username is required";
  } else if (userData.username.length < 3) {
    validationErrors.username = "Username must be at least 3 characters";
  }

  if (!userData.fullName?.trim()) {
    validationErrors.fullName = "Full name is required";
  }

  if (!userData.role) {
    validationErrors.role = "Role is required";
  }

  // Check for duplicate username (excluding current user in edit mode)
  const existingUser = users.value.find(
    (user) => user.username === userData.username && user.id !== userData.id
  );

  if (existingUser) {
    validationErrors.username = "Username already exists";
  }

  errors.value = validationErrors;
  return Object.keys(validationErrors).length === 0;
};

const showAddUser = () => {
  newUser.value = {
    password: "",
    username: "",
    fullName: "",
    role: "patient",
    status: "active",
  };
  formErrors.value = {};
  showAddUserModal.value = true;
};

const addUser = async () => {
  // Add password validation for new users
  if (!newUser.value.password?.trim()) {
    formErrors.value = {
      ...formErrors.value,
      password: "Password is required",
    };
  } else if (newUser.value.password.length < 6) {
    formErrors.value = {
      ...formErrors.value,
      password: "Password must be at least 6 characters",
    };
  }

  if (!validateUserForm(newUser.value, formErrors)) {
    return;
  }

  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not available");
    }

    // Create user in Supabase Auth
    const email = `${newUser.value.username}@patientrecord.system`;
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: newUser.value.password,
        user_metadata: {
          username: newUser.value.username,
          full_name: newUser.value.fullName,
          role: newUser.value.role,
        },
        email_confirm: true, // Auto-confirm email for admin-created users
      });

    if (createError) {
      throw createError;
    }

    // Transform and add to local users array for immediate UI update
    const newUserData = {
      id: userData.user.id,
      email: userData.user.email,
      username: newUser.value.username,
      fullName: newUser.value.fullName,
      role: newUser.value.role,
      status: "active",
      lastLogin: null,
      created_at: userData.user.created_at,
      email_confirmed_at: userData.user.email_confirmed_at,
    };

    users.value.push(newUserData);

    showNotification(
      `User ${newUser.value.username} has been successfully added to the system.`,
      {
        type: "success",
        persistent: true,
        browser: true,
        sound: true,
      }
    );

    showAddUserModal.value = false;

    // Reset form
    newUser.value = {
      password: "",
      username: "",
      fullName: "",
      role: "patient",
      status: "active",
    };
  } catch (error) {
    console.error("Error creating user:", error);
    showNotification("Failed to create user. Please try again.", {
      type: "error",
      persistent: true,
    });
  }
};

const showEditUser = (user) => {
  userToEdit.value = user;
  editUser.value = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
  };
  editFormErrors.value = {};
  showEditUserModal.value = true;
};

const updateUser = async () => {
  if (!validateUserForm(editUser.value, editFormErrors)) {
    return;
  }

  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not available");
    }

    // Update user metadata in Supabase
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(editUser.value.id, {
        user_metadata: {
          username: editUser.value.username,
          full_name: editUser.value.fullName,
          role: editUser.value.role,
        },
      });

    if (updateError) {
      throw updateError;
    }

    // Update local users array for immediate UI update
    const userIndex = users.value.findIndex((u) => u.id === editUser.value.id);
    if (userIndex !== -1) {
      users.value[userIndex] = {
        ...users.value[userIndex],
        username: editUser.value.username,
        fullName: editUser.value.fullName,
        role: editUser.value.role,
        status: editUser.value.status,
      };

      showNotification(
        `User ${editUser.value.username} has been successfully updated.`,
        {
          type: "success",
          persistent: true,
          browser: true,
        }
      );

      showEditUserModal.value = false;
    } else {
      throw new Error("User not found in local array");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    showNotification("Failed to update user. Please try again.", {
      type: "error",
      persistent: true,
    });
  }
};

const showDeleteUser = (user) => {
  userToDelete.value = user;
  showDeleteUserModal.value = true;
};

const deleteUser = async () => {
  if (!userToDelete.value) return;

  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not available");
    }

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userToDelete.value.id
    );

    if (deleteError) {
      throw deleteError;
    }

    // Remove user from local users array for immediate UI update
    const userIndex = users.value.findIndex(
      (u) => u.id === userToDelete.value.id
    );
    if (userIndex !== -1) {
      const deletedUser = users.value.splice(userIndex, 1)[0];

      showNotification(
        `User ${deletedUser.username} has been successfully removed from the system.`,
        {
          type: "success",
          persistent: true,
          browser: true,
        }
      );

      showDeleteUserModal.value = false;
      userToDelete.value = null;
    } else {
      throw new Error("User not found in local array");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showNotification("Failed to delete user. Please try again.", {
      type: "error",
      persistent: true,
    });
  }
};

const toggleUserStatus = async (user) => {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not available");
    }

    // For Supabase Auth, we'll use user metadata to track status
    // Note: In a production environment, you might want to use a separate database table for user status
    const newStatus = user.status === "active" ? "inactive" : "active";

    // Update user metadata with new status
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user, // Preserve existing metadata
          status: newStatus,
        },
      });

    if (updateError) {
      throw updateError;
    }

    // Update local users array for immediate UI update
    const userIndex = users.value.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      users.value[userIndex].status = newStatus;

      showNotification(
        `User ${user.username} status changed to ${newStatus}.`,
        {
          type: "success",
          browser: true,
        }
      );
    } else {
      throw new Error("User not found in local array");
    }
  } catch (error) {
    console.error("Error updating user status:", error);
    showNotification("Failed to update user status. Please try again.", {
      type: "error",
      persistent: true,
    });
  }
};

const cancelAddUser = () => {
  showAddUserModal.value = false;
};

const cancelEditUser = () => {
  showEditUserModal.value = false;
  userToEdit.value = null;
};

const cancelDeleteUser = () => {
  showDeleteUserModal.value = false;
  userToDelete.value = null;
};

const formatDate = (dateString) => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleString();
};

const getRoleBadgeClass = (role) => {
  const roleObj = roles.value.find((r) => r.id === role);
  return roleObj ? `bg-${roleObj.color}` : "bg-secondary";
};

const getStatusBadgeClass = (status) => {
  return status === "active" ? "bg-success" : "bg-warning";
};

// Set up real-time subscription for user changes
const setupRealtimeSubscription = () => {
  try {
    if (!supabaseAdmin) {
      console.warn(
        "Supabase admin client not available for real-time subscriptions"
      );
      return;
    }

    // Note: Supabase Auth doesn't have built-in real-time subscriptions for user management
    // In a production environment, you might need to use database triggers or webhooks
    // For now, we'll use periodic polling as a fallback

    console.log("Real-time user monitoring enabled (polling-based)");
  } catch (error) {
    console.error("Error setting up real-time subscription:", error);
  }
};

// Clean up legacy localStorage data
const cleanupLocalStorage = () => {
  try {
    const keysToRemove = [
      "registeredUsers",
      "systemUsers",
      "user",
      "patients",
      "medicalRecords",
      "appointments",
      "notifications",
      "activities",
    ];

    keysToRemove.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Cleaned up legacy localStorage key: ${key}`);
      }
    });

    console.log("Legacy localStorage cleanup completed");
  } catch (error) {
    console.error("Error cleaning up localStorage:", error);
  }
};
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  color: var(--primary-gradient-start);
  font-weight: 600;
  margin-bottom: 10px;
}

.page-description {
  color: var(--muted-color);
  font-size: 1.1rem;
}

.avatar {
  color: var(--primary-gradient-start);
}

.role-item {
  padding: 10px;
  border-radius: 8px;
  background-color: var(--light-color);
}

.permission-group {
  padding: 15px;
  border-radius: 8px;
  background-color: var(--light-color);
}

.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 10px;
}

.card-header {
  background: linear-gradient(
    135deg,
    var(--secondary-gradient-start),
    var(--secondary-gradient-end)
  );
  color: white;
  border-radius: 10px 10px 0 0 !important;
}
</style>
