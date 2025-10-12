<template>
  <div class="container-fluid mt-3">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="mb-1">User Management</h1>
            <p class="text-muted">Create and manage system users</p>
          </div>
          <button class="btn btn-primary" @click="showCreateUserModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            Create New User
          </button>
        </div>

        <!-- User Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">{{ systemStats.users.total }}</h5>
                  <small>Total Users</small>
                </div>
                <i class="bi bi-people-fill fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ systemStats.patients.total }}
                  </h5>
                  <small>Total Patients</small>
                </div>
                <i class="bi bi-person-heart fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">{{ systemStats.staff.total }}</h5>
                  <small>Staff Members</small>
                </div>
                <i class="bi bi-person-badge fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ systemStats.users.recent }}
                  </h5>
                  <small>New This Month</small>
                </div>
                <i class="bi bi-graph-up fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">All Users</h5>
            <div class="d-flex gap-2">
              <select
                v-model="userFilters.role"
                @change="loadUsers"
                class="form-select form-select-sm"
                style="width: auto"
              >
                <option value="">All Roles</option>
                <option value="1">Admin</option>
                <option value="2">Nurse</option>
                <option value="3">Staff</option>
                <option value="4">Patient</option>
              </select>
              <div class="input-group input-group-sm" style="width: 250px">
                <input
                  type="text"
                  v-model="userFilters.search"
                  @input="debounceSearch"
                  class="form-control"
                  placeholder="Search users..."
                />
                <button class="btn btn-outline-secondary" type="button">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div v-if="isLoading" class="text-center p-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="users.length === 0" class="text-center p-4">
              <i class="bi bi-people fs-1 text-muted mb-3"></i>
              <h5 class="text-muted">No users found</h5>
              <p class="text-muted">Create your first user to get started</p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.user_id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar-sm me-3">
                          <div
                            class="avatar-title bg-primary-subtle text-primary rounded-circle"
                          >
                            {{ getInitials(user) }}
                          </div>
                        </div>
                        <div>
                          <h6 class="mb-0">{{ getFullName(user) }}</h6>
                          <small class="text-muted">{{
                            getUserType(user)
                          }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code class="bg-light px-2 py-1 rounded">{{
                        user.username
                      }}</code>
                    </td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span :class="getRoleBadgeClass(user.roles?.role_name)">
                        {{ user.roles?.role_name || "Unknown" }}
                      </span>
                    </td>
                    <td>
                      <span
                        :class="
                          user.is_active
                            ? 'badge bg-success'
                            : 'badge bg-secondary'
                        "
                      >
                        {{ user.is_active ? "Active" : "Inactive" }}
                      </span>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{ formatDate(user.created_at) }}
                      </small>
                    </td>
                    <td>
                      <div class="dropdown">
                        <button
                          class="btn btn-sm btn-outline-secondary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          Actions
                        </button>
                        <ul class="dropdown-menu">
                          <li>
                            <button
                              class="dropdown-item"
                              @click="editUser(user)"
                            >
                              <i class="bi bi-pencil me-2"></i>Edit
                            </button>
                          </li>
                          <li>
                            <button
                              class="dropdown-item"
                              @click="resetPassword(user)"
                            >
                              <i class="bi bi-key me-2"></i>Reset Password
                            </button>
                          </li>
                          <li><hr class="dropdown-divider" /></li>
                          <li>
                            <button
                              class="dropdown-item text-danger"
                              @click="toggleUserStatus(user)"
                            >
                              <i
                                :class="
                                  user.is_active
                                    ? 'bi bi-pause-circle'
                                    : 'bi bi-play-circle'
                                "
                                class="me-2"
                              ></i>
                              {{ user.is_active ? "Deactivate" : "Activate" }}
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div
      class="modal fade"
      :class="{ show: showCreateUserModal }"
      :style="{ display: showCreateUserModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New User</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeCreateUserModal"
            ></button>
          </div>
          <form @submit.prevent="createUser">
            <div class="modal-body">
              <!-- User Role Selection -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label">User Role</label>
                  <select v-model="newUser.roleId" class="form-select" required>
                    <option value="">Select Role</option>
                    <option value="4">Patient</option>
                    <option value="3">Staff</option>
                    <option value="2">Nurse</option>
                    <option value="1">Administrator</option>
                  </select>
                </div>
              </div>

              <!-- Basic Information -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">First Name</label>
                  <input
                    type="text"
                    v-model="newUser.firstName"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Surname</label>
                  <input
                    type="text"
                    v-model="newUser.surname"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Suffix (Optional)</label>
                  <select v-model="newUser.suffix" class="form-select">
                    <option value="">None</option>
                    <option value="Jr">Jr</option>
                    <option value="Sr">Sr</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email Address</label>
                  <input
                    type="email"
                    v-model="newUser.email"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <!-- Contact Information -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Contact Number</label>
                  <input
                    type="tel"
                    v-model="newUser.contactNumber"
                    class="form-control"
                    placeholder="+639123456789"
                  />
                </div>
                <div class="col-md-6" v-if="newUser.roleId === '4'">
                  <label class="form-label">Birth Date</label>
                  <input
                    type="date"
                    v-model="newUser.birthDate"
                    class="form-control"
                  />
                </div>
              </div>

              <!-- Staff-specific fields -->
              <div
                v-if="['1', '2', '3'].includes(newUser.roleId)"
                class="row mb-3"
              >
                <div class="col-md-6">
                  <label class="form-label">License Number</label>
                  <input
                    type="text"
                    v-model="newUser.licenseNumber"
                    class="form-control"
                    :required="newUser.roleId !== '3'"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Specialization</label>
                  <select v-model="newUser.specialization" class="form-select">
                    <option value="">Select Specialization</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Obstetrics">Obstetrics</option>
                    <option value="Emergency Medicine">
                      Emergency Medicine
                    </option>
                    <option value="Dental">Dental</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <!-- Patient-specific fields -->
              <div v-if="newUser.roleId === '4'" class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Gender</label>
                  <select v-model="newUser.gender" class="form-select" required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Address</label>
                  <textarea
                    v-model="newUser.address"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
              </div>

              <!-- Preview Generated Credentials -->
              <div
                v-if="newUser.firstName && newUser.surname"
                class="alert alert-info"
              >
                <h6>
                  <i class="bi bi-info-circle me-2"></i>Generated Credentials
                  Preview
                </h6>
                <div class="row">
                  <div class="col-md-6">
                    <strong>Username:</strong>
                    <code class="ms-2">{{
                      generatedCredentials.username
                    }}</code>
                  </div>
                  <div class="col-md-6">
                    <strong>Password:</strong>
                    <code class="ms-2">{{
                      generatedCredentials.password
                    }}</code>
                  </div>
                </div>
                <small class="text-muted">
                  These credentials will be automatically sent to the user via
                  email and SMS.
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeCreateUserModal"
                :disabled="isCreating"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isCreating || !isFormValid"
              >
                <span
                  v-if="isCreating"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Backdrop for modal -->
    <div
      v-if="showCreateUserModal"
      class="modal-backdrop fade show"
      @click="closeCreateUserModal"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAdminStore } from "@/stores/admin";
import { useNotificationsStore } from "@/stores/notifications";

const adminStore = useAdminStore();
const notificationsStore = useNotificationsStore();

// Reactive data
const showCreateUserModal = ref(false);
const isCreating = ref(false);
const userFilters = ref({
  search: "",
  role: "",
});

// New user form data
const newUser = ref({
  roleId: "",
  firstName: "",
  surname: "",
  suffix: "",
  email: "",
  contactNumber: "",
  birthDate: "",
  gender: "",
  address: "",
  licenseNumber: "",
  specialization: "",
});

// Computed properties
const generatedCredentials = computed(() => {
  if (!newUser.value.firstName || !newUser.value.surname) {
    return { username: "", password: "" };
  }

  const baseName = `${newUser.value.firstName.toLowerCase()}.${newUser.value.surname.toLowerCase()}`;
  const username = newUser.value.suffix
    ? `${baseName}.${newUser.value.suffix.toLowerCase()}`
    : baseName;

  const password = newUser.value.birthDate
    ? formatPasswordFromDate(newUser.value.birthDate)
    : "••••••••";

  return { username, password };
});

const isFormValid = computed(() => {
  return (
    newUser.value.firstName &&
    newUser.value.surname &&
    newUser.value.email &&
    newUser.value.roleId
  );
});

// Methods
const loadUsers = async () => {
  await adminStore.loadUsers(userFilters.value);
};

const debounceSearch = debounce(() => {
  loadUsers();
}, 500);

const createUser = async () => {
  if (!isFormValid.value) return;

  isCreating.value = true;
  try {
    const result = await adminStore.createUserAccount(newUser.value);

    notificationsStore.addNotification({
      title: "User Created Successfully",
      message: `${newUser.value.firstName} ${newUser.value.surname} has been created with username: ${result.credentials.username}`,
      type: "success",
    });

    closeCreateUserModal();
    resetForm();

    // Refresh users list
    await loadUsers();
  } catch (error) {
    notificationsStore.addNotification({
      title: "Error Creating User",
      message: error.message,
      type: "danger",
    });
  } finally {
    isCreating.value = false;
  }
};

const editUser = (user) => {
  // TODO: Implement user editing
  console.log("Edit user:", user);
};

const resetPassword = async (user) => {
  if (confirm(`Reset password for ${getFullName(user)}?`)) {
    try {
      await adminStore.resetUserPassword(user.user_id);
      notificationsStore.addNotification({
        title: "Password Reset",
        message: `New credentials sent to ${user.email}`,
        type: "success",
      });
    } catch (error) {
      notificationsStore.addNotification({
        title: "Error",
        message: error.message,
        type: "danger",
      });
    }
  }
};

const toggleUserStatus = async (user) => {
  const action = user.is_active ? "deactivate" : "activate";
  if (confirm(`${action} user ${getFullName(user)}?`)) {
    try {
      if (user.is_active) {
        await adminStore.deactivateUser(user.user_id);
      } else {
        await adminStore.reactivateUser(user.user_id);
      }

      notificationsStore.addNotification({
        title: "User Status Updated",
        message: `User ${
          user.is_active ? "deactivated" : "activated"
        } successfully`,
        type: "success",
      });

      await loadUsers();
    } catch (error) {
      notificationsStore.addNotification({
        title: "Error",
        message: error.message,
        type: "danger",
      });
    }
  }
};

const closeCreateUserModal = () => {
  showCreateUserModal.value = false;
  resetForm();
};

const resetForm = () => {
  newUser.value = {
    roleId: "",
    firstName: "",
    surname: "",
    suffix: "",
    email: "",
    contactNumber: "",
    birthDate: "",
    gender: "",
    address: "",
    licenseNumber: "",
    specialization: "",
  };
};

// Helper functions
const getInitials = (user) => {
  return getFullName(user)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getFullName = (user) => {
  if (user.patients && user.patients.length > 0) {
    const patient = user.patients[0];
    return `${patient.first_name} ${patient.surname}${
      patient.suffix ? " " + patient.suffix : ""
    }`;
  }
  if (user.staff && user.staff.length > 0) {
    const staff = user.staff[0];
    return `${staff.first_name} ${staff.surname}${
      staff.suffix ? " " + staff.suffix : ""
    }`;
  }
  return user.username || "Unknown";
};

const getUserType = (user) => {
  if (user.patients && user.patients.length > 0) return "Patient";
  if (user.staff && user.staff.length > 0) return "Staff";
  return "User";
};

const getRoleBadgeClass = (roleName) => {
  const classes = {
    admin: "badge bg-danger",
    nurse: "badge bg-primary",
    staff: "badge bg-info",
    patient: "badge bg-success",
  };
  return classes[roleName] || "badge bg-secondary";
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatPasswordFromDate = (dateString) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${month}-${day}-${year}`;
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Lifecycle
onMounted(async () => {
  await adminStore.loadSystemStatistics();
  await loadUsers();
});
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.avatar-sm {
  width: 2.5rem;
  height: 2.5rem;
}

.avatar-title {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

code {
  font-size: 0.875em;
}

.dropdown-toggle::after {
  display: none;
}

.modal-content {
  border-radius: 10px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
</style>
