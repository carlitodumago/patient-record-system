<template>
  <v-container class="mt-3">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="mb-1">User Management</h1>
            <p class="text-muted">Create and manage system users</p>
          </div>
          <v-btn color="primary" @click="showCreateUserModal = true">
            <v-icon left>mdi-plus-circle</v-icon>
            Create New User
          </v-btn>
        </div>

        <!-- User Statistics Cards -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card color="primary" dark>
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <h5 class="mb-0">{{ systemStats.users.total }}</h5>
                  <small>Total Users</small>
                </div>
                <v-icon size="large">mdi-account-group</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="success" dark>
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <h5 class="mb-0">{{ systemStats.patients.total }}</h5>
                  <small>Total Patients</small>
                </div>
                <v-icon size="large">mdi-account-heart</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="info" dark>
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <h5 class="mb-0">{{ systemStats.staff.total }}</h5>
                  <small>Staff Members</small>
                </div>
                <v-icon size="large">mdi-account-badge</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="warning" dark>
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <h5 class="mb-0">{{ systemStats.users.recent }}</h5>
                  <small>New This Month</small>
                </div>
                <v-icon size="large">mdi-chart-line</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Users Table -->
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <h5 class="mb-0">All Users</h5>
            <div class="d-flex gap-2">
              <v-select
                v-model="userFilters.role"
                @change="loadUsers"
                :items="roleOptions"
                item-text="text"
                item-value="value"
                dense
                outlined
                style="width: 150px"
                label="All Roles"
              ></v-select>
              <v-text-field
                v-model="userFilters.search"
                @input="debounceSearch"
                dense
                outlined
                placeholder="Search users..."
                style="width: 250px"
                prepend-inner-icon="mdi-magnify"
              ></v-text-field>
            </div>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="users"
            :loading="isLoading"
            item-key="user_id"
            class="elevation-1"
          >
            <template v-slot:no-data>
              <v-alert type="info" class="ma-4">
                <v-icon left>mdi-account-group</v-icon>
                No users found. Create your first user to get started.
              </v-alert>
            </template>

            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" class="mr-2">
                  <span class="white--text">{{ getInitials(item) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ getFullName(item) }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ getUserType(item) }}
                  </div>
                </div>
              </div>
            </template>

            <template v-slot:item.username="{ item }">
              <v-chip variant="outlined" size="small">{{
                item.username
              }}</v-chip>
            </template>

            <template v-slot:item.role="{ item }">
              <v-chip
                :color="getRoleChipColor(item.roles?.role_name)"
                size="small"
                variant="flat"
              >
                {{ item.roles?.role_name || "Unknown" }}
              </v-chip>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                :color="item.is_active ? 'success' : 'grey'"
                size="small"
                variant="flat"
              >
                {{ item.is_active ? "Active" : "Inactive" }}
              </v-chip>
            </template>

            <template v-slot:item.created_at="{ item }">
              <span class="text-caption">{{
                formatDate(item.created_at)
              }}</span>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon variant="text" v-bind="props">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="editUser(item)">
                    <template v-slot:prepend>
                      <v-icon>mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Edit</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="resetPassword(item)">
                    <template v-slot:prepend>
                      <v-icon>mdi-key</v-icon>
                    </template>
                    <v-list-item-title>Reset Password</v-list-item-title>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item
                    @click="toggleUserStatus(item)"
                    :class="item.is_active ? 'text-error' : 'text-success'"
                  >
                    <template v-slot:prepend>
                      <v-icon>{{
                        item.is_active ? "mdi-pause-circle" : "mdi-play-circle"
                      }}</v-icon>
                    </template>
                    <v-list-item-title>{{
                      item.is_active ? "Deactivate" : "Activate"
                    }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create User Modal -->
    <v-dialog v-model="showCreateUserModal" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Create New User</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeCreateUserModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createUser">
            <!-- User Role Selection -->
            <v-row class="mb-3">
              <v-col cols="12">
                <v-select
                  v-model="newUser.roleId"
                  :items="roleItems"
                  item-text="text"
                  item-value="value"
                  label="User Role"
                  required
                ></v-select>
              </v-col>
            </v-row>

            <!-- Basic Information -->
            <v-row class="mb-3">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.firstName"
                  label="First Name"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.surname"
                  label="Surname"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="12" md="6">
                <v-select
                  v-model="newUser.suffix"
                  :items="suffixItems"
                  item-text="text"
                  item-value="value"
                  label="Suffix (Optional)"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.email"
                  label="Email Address"
                  type="email"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Contact Information -->
            <v-row class="mb-3">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.contactNumber"
                  label="Contact Number"
                  placeholder="+639123456789"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6" v-if="newUser.roleId === '4'">
                <v-text-field
                  v-model="newUser.birthDate"
                  label="Birth Date"
                  type="date"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Staff-specific fields -->
            <v-row v-if="['1', '2', '3'].includes(newUser.roleId)" class="mb-3">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.licenseNumber"
                  label="License Number"
                  :required="newUser.roleId !== '3'"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newUser.specialization"
                  :items="specializationItems"
                  item-text="text"
                  item-value="value"
                  label="Specialization"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Patient-specific fields -->
            <v-row v-if="newUser.roleId === '4'" class="mb-3">
              <v-col cols="12" md="6">
                <v-select
                  v-model="newUser.gender"
                  :items="genderItems"
                  item-text="text"
                  item-value="value"
                  label="Gender"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="newUser.address"
                  label="Address"
                  rows="2"
                ></v-textarea>
              </v-col>
            </v-row>

            <!-- Preview Generated Credentials -->
            <v-alert
              v-if="newUser.firstName && newUser.surname"
              type="info"
              class="mb-3"
            >
              <h6>Generated Credentials Preview</h6>
              <v-row>
                <v-col cols="12" md="6">
                  <strong>Username:</strong>
                  <code>{{ generatedCredentials.username }}</code>
                </v-col>
                <v-col cols="12" md="6">
                  <strong>Password:</strong>
                  <code>{{ generatedCredentials.password }}</code>
                </v-col>
              </v-row>
              <small>
                These credentials will be automatically sent to the user via
                email and SMS.
              </small>
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeCreateUserModal"
            :disabled="isCreating"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="createUser"
            :disabled="isCreating || !isFormValid"
            :loading="isCreating"
          >
            Create User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
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

// Role options for v-select
const roleOptions = ref([
  { text: "All Roles", value: "" },
  { text: "Administrator", value: "1" },
  { text: "Nurse/Staff", value: "2" },
  { text: "Patient", value: "3" },
]);

// Data table headers
const headers = ref([
  { title: "Name", key: "name", sortable: false },
  { title: "Username", key: "username" },
  { title: "Email", key: "email" },
  { title: "Role", key: "role", sortable: false },
  { title: "Status", key: "status" },
  { title: "Created", key: "created_at" },
  { title: "Actions", key: "actions", sortable: false },
]);

// Role items for create user form
const roleItems = ref([
  { text: "Administrator", value: "1" },
  { text: "Nurse", value: "2" },
  { text: "Staff", value: "3" },
  { text: "Patient", value: "4" },
]);

// Suffix items
const suffixItems = ref([
  { text: "None", value: "" },
  { text: "Jr", value: "Jr" },
  { text: "Sr", value: "Sr" },
  { text: "II", value: "II" },
  { text: "III", value: "III" },
]);

// Specialization items
const specializationItems = ref([
  { text: "Select Specialization", value: "" },
  { text: "General Medicine", value: "General Medicine" },
  { text: "Pediatrics", value: "Pediatrics" },
  { text: "Obstetrics", value: "Obstetrics" },
  { text: "Emergency Medicine", value: "Emergency Medicine" },
  { text: "Dental", value: "Dental" },
  { text: "Laboratory", value: "Laboratory" },
  { text: "Pharmacy", value: "Pharmacy" },
  { text: "Administration", value: "Administration" },
]);

// Gender items
const genderItems = ref([
  { text: "Select Gender", value: "" },
  { text: "Male", value: "Male" },
  { text: "Female", value: "Female" },
  { text: "Other", value: "Other" },
]);

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

const getRoleChipColor = (roleName) => {
  const colors = {
    administrator: "error",
    nurse: "primary",
    staff: "info",
    patient: "success",
  };
  return colors[roleName?.toLowerCase()] || "grey";
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
