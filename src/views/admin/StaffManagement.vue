<template>
  <div class="container-fluid mt-3">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="mb-1">Staff Management</h1>
            <p class="text-muted">
              Manage clinic staff and healthcare professionals
            </p>
          </div>
          <button class="btn btn-primary" @click="showCreateStaffModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            Add Staff Member
          </button>
        </div>

        <!-- Staff Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">{{ staffStats.totalStaff }}</h5>
                  <small>Total Staff</small>
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
                    {{ staffStats.roleDistribution.Nurse || 0 }}
                  </h5>
                  <small>Nurses</small>
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
                  <h5 class="card-title mb-0">
                    {{ staffStats.roleDistribution.Admin || 0 }}
                  </h5>
                  <small>Administrators</small>
                </div>
                <i class="bi bi-shield-check fs-3"></i>
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
                    {{
                      Object.keys(staffStats.specializationDistribution).length
                    }}
                  </h5>
                  <small>Specializations</small>
                </div>
                <i class="bi bi-award fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Staff Table -->
        <div class="card">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">All Staff Members</h5>
            <div class="d-flex gap-2">
              <select
                v-model="staffFilters.specialization"
                @change="loadStaff"
                class="form-select form-select-sm"
                style="width: auto"
              >
                <option value="">All Specializations</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Obstetrics">Obstetrics</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Dental">Dental</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Administration">Administration</option>
              </select>
              <div class="input-group input-group-sm" style="width: 250px">
                <input
                  type="text"
                  v-model="staffFilters.search"
                  @input="debounceSearch"
                  class="form-control"
                  placeholder="Search staff..."
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

            <div v-else-if="staff.length === 0" class="text-center p-4">
              <i class="bi bi-people fs-1 text-muted mb-3"></i>
              <h5 class="text-muted">No staff members found</h5>
              <p class="text-muted">
                Add your first staff member to get started
              </p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Staff Member</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Specialization</th>
                    <th>License</th>
                    <th>Status</th>
                    <th>Hire Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in staff" :key="member.staff_id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar-sm me-3">
                          <div
                            class="avatar-title bg-primary-subtle text-primary rounded-circle"
                          >
                            {{ getInitials(member) }}
                          </div>
                        </div>
                        <div>
                          <h6 class="mb-0">{{ getFullName(member) }}</h6>
                          <small class="text-muted">{{
                            member.user?.username
                          }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{{ member.contact_number }}</div>
                      <div>
                        <small class="text-muted">{{
                          member.user?.email
                        }}</small>
                      </div>
                    </td>
                    <td>
                      <span
                        :class="
                          getRoleBadgeClass(member.user?.roles?.role_name)
                        "
                      >
                        {{ member.user?.roles?.role_name || "Unknown" }}
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-info">{{
                        member.specialization || "Not specified"
                      }}</span>
                    </td>
                    <td>
                      <code class="bg-light px-2 py-1 rounded">{{
                        member.license_number || "N/A"
                      }}</code>
                    </td>
                    <td>
                      <span
                        :class="
                          member.is_active
                            ? 'badge bg-success'
                            : 'badge bg-secondary'
                        "
                      >
                        {{ member.is_active ? "Active" : "Inactive" }}
                      </span>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{
                          member.hire_date
                            ? formatDate(member.hire_date)
                            : "Not set"
                        }}
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
                              @click="viewStaff(member)"
                            >
                              <i class="bi bi-eye me-2"></i>View Details
                            </button>
                          </li>
                          <li>
                            <button
                              class="dropdown-item"
                              @click="editStaff(member)"
                            >
                              <i class="bi bi-pencil me-2"></i>Edit
                            </button>
                          </li>
                          <li>
                            <button
                              class="dropdown-item"
                              @click="resetStaffPassword(member)"
                            >
                              <i class="bi bi-key me-2"></i>Reset Password
                            </button>
                          </li>
                          <li><hr class="dropdown-divider" /></li>
                          <li>
                            <button
                              class="dropdown-item text-danger"
                              @click="toggleStaffStatus(member)"
                            >
                              <i
                                :class="
                                  member.is_active
                                    ? 'bi bi-pause-circle'
                                    : 'bi bi-play-circle'
                                "
                                class="me-2"
                              ></i>
                              {{ member.is_active ? "Deactivate" : "Activate" }}
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

    <!-- Create Staff Modal -->
    <div
      class="modal fade"
      :class="{ show: showCreateStaffModal }"
      :style="{ display: showCreateStaffModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Staff Member</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeCreateStaffModal"
            ></button>
          </div>
          <form @submit.prevent="createStaff">
            <div class="modal-body">
              <!-- Staff Role Selection -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label">Staff Role</label>
                  <select
                    v-model="newStaff.roleId"
                    class="form-select"
                    required
                  >
                    <option value="">Select Role</option>
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
                    v-model="newStaff.firstName"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Surname</label>
                  <input
                    type="text"
                    v-model="newStaff.surname"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Suffix (Optional)</label>
                  <select v-model="newStaff.suffix" class="form-select">
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
                    v-model="newStaff.email"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <!-- Contact & Professional Information -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Contact Number</label>
                  <input
                    type="tel"
                    v-model="newStaff.contactNumber"
                    class="form-control"
                    placeholder="+639123456789"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">License Number</label>
                  <input
                    type="text"
                    v-model="newStaff.licenseNumber"
                    class="form-control"
                    :required="newStaff.roleId !== '3'"
                  />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Specialization</label>
                  <select v-model="newStaff.specialization" class="form-select">
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
                <div class="col-md-6">
                  <label class="form-label">Hire Date</label>
                  <input
                    type="date"
                    v-model="newStaff.hireDate"
                    class="form-control"
                  />
                </div>
              </div>

              <!-- Preview Generated Credentials -->
              <div
                v-if="newStaff.firstName && newStaff.surname"
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
                  These credentials will be automatically sent to the staff
                  member via email and SMS.
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeCreateStaffModal"
                :disabled="isCreating"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isCreating || !isStaffFormValid"
              >
                <span
                  v-if="isCreating"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                Create Staff Member
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Backdrop for modal -->
    <div
      v-if="showCreateStaffModal"
      class="modal-backdrop fade show"
      @click="closeCreateStaffModal"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAdminStore } from "@/stores/admin";
import { useNotificationsStore } from "@/stores/notifications";
import { staffService as StaffService } from "@/services/staffService";

const adminStore = useAdminStore();
const notificationsStore = useNotificationsStore();

// Reactive data
const showCreateStaffModal = ref(false);
const isCreating = ref(false);
const staff = ref([]);
const isLoading = ref(true);
const staffFilters = ref({
  search: "",
  specialization: "",
});
const staffStats = ref({
  totalStaff: 0,
  roleDistribution: {},
  specializationDistribution: {},
});

// New staff form data
const newStaff = ref({
  roleId: "",
  firstName: "",
  surname: "",
  suffix: "",
  email: "",
  contactNumber: "",
  licenseNumber: "",
  specialization: "",
  hireDate: "",
});

// Computed properties
const generatedCredentials = computed(() => {
  if (!newStaff.value.firstName || !newStaff.value.surname) {
    return { username: "", password: "" };
  }

  const baseName = `${newStaff.value.firstName.toLowerCase()}.${newStaff.value.surname.toLowerCase()}`;
  const username = newStaff.value.suffix
    ? `${baseName}.${newStaff.value.suffix.toLowerCase()}`
    : baseName;

  const password = "••••••••"; // Will be generated by the system

  return { username, password };
});

const isStaffFormValid = computed(() => {
  return (
    newStaff.value.firstName &&
    newStaff.value.surname &&
    newStaff.value.email &&
    newStaff.value.roleId
  );
});

// Methods
const loadStaff = async () => {
  isLoading.value = true;
  try {
    let staffData;
    if (staffFilters.value.search) {
      staffData = await StaffService.searchStaff(staffFilters.value.search);
    } else {
      staffData = await StaffService.getAllStaff();
    }

    // Apply specialization filter if set
    if (staffFilters.value.specialization) {
      staffData = staffData.filter(
        (member) => member.Specialization === staffFilters.value.specialization
      );
    }

    staff.value = staffData;
  } catch (error) {
    notificationsStore.addNotification({
      title: "Error Loading Staff",
      message: error.message,
      type: "danger",
    });
  } finally {
    isLoading.value = false;
  }
};

const loadStaffStats = async () => {
  try {
    const stats = await StaffService.getStaffStatistics();
    staffStats.value = stats;
  } catch (error) {
    console.error("Error loading staff statistics:", error);
  }
};

const debounceSearch = debounce(() => {
  loadStaff();
}, 500);

const createStaff = async () => {
  if (!isStaffFormValid.value) return;

  isCreating.value = true;
  try {
    const result = await adminStore.createUserAccount(newStaff.value);

    notificationsStore.addNotification({
      title: "Staff Member Created",
      message: `${newStaff.value.firstName} ${
        newStaff.value.surname
      } has been added as ${getRoleName(newStaff.value.roleId)}`,
      type: "success",
    });

    closeCreateStaffModal();
    resetStaffForm();

    // Refresh staff list and statistics
    await loadStaff();
    await loadStaffStats();
  } catch (error) {
    notificationsStore.addNotification({
      title: "Error Creating Staff",
      message: error.message,
      type: "danger",
    });
  } finally {
    isCreating.value = false;
  }
};

const viewStaff = (member) => {
  // TODO: Navigate to staff details page
  console.log("View staff:", member);
};

const editStaff = (member) => {
  // TODO: Open edit staff modal
  console.log("Edit staff:", member);
};

const resetStaffPassword = async (member) => {
  if (confirm(`Reset password for ${getFullName(member)}?`)) {
    try {
      await adminStore.resetUserPassword(member.user_id);
      notificationsStore.addNotification({
        title: "Password Reset",
        message: `New credentials sent to ${member.user.email}`,
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

const toggleStaffStatus = async (member) => {
  const action = member.is_active ? "deactivate" : "activate";
  if (confirm(`${action} staff member ${getFullName(member)}?`)) {
    try {
      if (member.is_active) {
        await adminStore.deactivateUser(member.user_id);
      } else {
        await adminStore.reactivateUser(member.user_id);
      }

      notificationsStore.addNotification({
        title: "Staff Status Updated",
        message: `Staff member ${
          member.is_active ? "deactivated" : "activated"
        } successfully`,
        type: "success",
      });

      await loadStaff();
    } catch (error) {
      notificationsStore.addNotification({
        title: "Error",
        message: error.message,
        type: "danger",
      });
    }
  }
};

const closeCreateStaffModal = () => {
  showCreateStaffModal.value = false;
  resetStaffForm();
};

const resetStaffForm = () => {
  newStaff.value = {
    roleId: "",
    firstName: "",
    surname: "",
    suffix: "",
    email: "",
    contactNumber: "",
    licenseNumber: "",
    specialization: "",
    hireDate: "",
  };
};

// Helper functions
const getInitials = (member) => {
  return getFullName(member)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getFullName = (member) => {
  return `${member.first_name} ${member.surname}${
    member.suffix ? " " + member.suffix : ""
  }`;
};

const getRoleBadgeClass = (roleName) => {
  const classes = {
    admin: "badge bg-danger",
    nurse: "badge bg-primary",
    staff: "badge bg-info",
  };
  return classes[roleName] || "badge bg-secondary";
};

const getRoleName = (roleId) => {
  const roles = {
    1: "Administrator",
    2: "Nurse",
    3: "Staff",
  };
  return roles[roleId] || "Unknown";
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  await loadStaff();
  await loadStaffStats();
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
