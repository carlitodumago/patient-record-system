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
              <span class="badge bg-danger">1 user</span>
            </div>
            <div
              class="role-item d-flex justify-content-between align-items-center mb-3"
            >
              <div>
                <strong>Nurse/Staff</strong>
                <div class="text-muted small">Patient management access</div>
              </div>
              <span class="badge bg-info">0 users</span>
            </div>
            <div
              class="role-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>Patient</strong>
                <div class="text-muted small">Personal records access</div>
              </div>
              <span class="badge bg-secondary">0 users</span>
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
import { ref, onMounted, computed } from "vue";

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
});

const loadUsers = async () => {
  loading.value = true;
  try {
    // Load from localStorage first (for demo purposes)
    const savedUsers = localStorage.getItem("systemUsers");
    if (savedUsers) {
      users.value = JSON.parse(savedUsers);
    } else {
      // Initialize with admin user
      users.value = [
        {
          id: "admin-user",
          username: "admin",
          fullName: "System Administrator",
          role: "admin",
          status: "active",
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("systemUsers", JSON.stringify(users.value));
    }
  } catch (error) {
    console.error("Error loading users:", error);
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
    const userData = {
      id: `user-${Date.now()}`,
      ...newUser.value,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    // Remove password from stored data (in real app, this would be handled by backend)
    const { password, ...userToStore } = userData;

    users.value.push(userToStore);
    localStorage.setItem("systemUsers", JSON.stringify(users.value));

    showAddUserModal.value = false;
    alert("User created successfully!");
  } catch (error) {
    console.error("Error creating user:", error);
    alert("Error creating user");
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
    const userIndex = users.value.findIndex((u) => u.id === editUser.value.id);
    if (userIndex !== -1) {
      users.value[userIndex] = {
        ...users.value[userIndex],
        ...editUser.value,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("systemUsers", JSON.stringify(users.value));
    }

    showEditUserModal.value = false;
    alert("User updated successfully!");
  } catch (error) {
    console.error("Error updating user:", error);
    alert("Error updating user");
  }
};

const showDeleteUser = (user) => {
  userToDelete.value = user;
  showDeleteUserModal.value = true;
};

const deleteUser = async () => {
  if (!userToDelete.value) return;

  try {
    users.value = users.value.filter((u) => u.id !== userToDelete.value.id);
    localStorage.setItem("systemUsers", JSON.stringify(users.value));

    showDeleteUserModal.value = false;
    userToDelete.value = null;
    alert("User deleted successfully!");
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Error deleting user");
  }
};

const toggleUserStatus = async (user) => {
  try {
    const userIndex = users.value.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      users.value[userIndex].status =
        user.status === "active" ? "inactive" : "active";
      users.value[userIndex].updatedAt = new Date().toISOString();
      localStorage.setItem("systemUsers", JSON.stringify(users.value));
    }
  } catch (error) {
    console.error("Error updating user status:", error);
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
