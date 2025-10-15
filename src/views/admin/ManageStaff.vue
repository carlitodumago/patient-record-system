<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

// Store
const store = useStore();

// Reactive data
const loading = ref(false);
const search = ref("");
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedStaff = ref(null);
const staffList = ref([]);

// Form data
const staffForm = ref({
  firstName: "",
  surname: "",
  suffix: "",
  contactNumber: "",
  email: "",
  role: "",
});

// Computed properties
const user = computed(() => store.state.user);
const filteredStaff = computed(() => {
  return staffList.value.filter(
    (staff) =>
      staff.firstName.toLowerCase().includes(search.value.toLowerCase()) ||
      staff.surname.toLowerCase().includes(search.value.toLowerCase()) ||
      staff.email.toLowerCase().includes(search.value.toLowerCase()) ||
      staff.role.toLowerCase().includes(search.value.toLowerCase())
  );
});

// Methods
const fetchStaff = async () => {
  loading.value = true;
  try {
    // Simulate API call - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Mock data is already loaded
  } catch (error) {
    console.error("Error fetching staff:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  staffForm.value = {
    firstName: "",
    surname: "",
    suffix: "",
    contactNumber: "",
    email: "",
    role: "",
  };
};

const openAddModal = () => {
  resetForm();
  selectedStaff.value = null;
  showAddModal.value = true;
};

const openEditModal = (staff) => {
  selectedStaff.value = staff;
  staffForm.value = { ...staff };
  showEditModal.value = true;
};

const openDeleteModal = (staff) => {
  selectedStaff.value = staff;
  showDeleteModal.value = true;
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  showDeleteModal.value = false;
  selectedStaff.value = null;
  resetForm();
};

const addStaff = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newStaff = {
      id: Math.max(...staffList.value.map((s) => s.id), 0) + 1,
      userId: Math.max(...staffList.value.map((s) => s.userId), 0) + 1,
      ...staffForm.value,
      status: "Active",
      dateJoined: new Date().toISOString().split("T")[0],
      lastLogin: null,
    };

    staffList.value.push(newStaff);
    closeModals();

    // Show success message
    // You can use the notification system here
    console.log("Staff added successfully");
  } catch (error) {
    console.error("Error adding staff:", error);
  }
};

const updateStaff = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = staffList.value.findIndex(
      (s) => s.id === selectedStaff.value.id
    );
    if (index !== -1) {
      staffList.value[index] = { ...staffForm.value };
    }

    closeModals();
    console.log("Staff updated successfully");
  } catch (error) {
    console.error("Error updating staff:", error);
  }
};

const deleteStaff = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    staffList.value = staffList.value.filter(
      (s) => s.id !== selectedStaff.value.id
    );
    closeModals();
    console.log("Staff deleted successfully");
  } catch (error) {
    console.error("Error deleting staff:", error);
  }
};

const getStatusBadgeVariant = (status) => {
  return status === "Active" ? "success" : "danger";
};

const getRoleBadgeVariant = (role) => {
  const variants = {
    Nurse: "info",
    "Barangay Health Worker": "warning",
    Admin: "dark",
  };
  return variants[role] || "secondary";
};

onMounted(() => {
  fetchStaff();
});
</script>

<template>
  <div class="manage-staff">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Manage Staff</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Manage staff accounts and permissions
        </p>
      </div>
      <div class="animate-fade-in-right">
        <button class="btn btn-primary" @click="openAddModal">
          <i class="bi bi-person-plus me-2"></i>
          Add New Staff
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card mb-4 animate-fade-in-up">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-8">
            <div class="search-box">
              <i class="bi bi-search search-icon"></i>
              <input
                v-model="search"
                type="text"
                class="form-control"
                placeholder="Search staff by name, email, or role..."
              />
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="staffForm.role">
              <option value="">All Roles</option>
              <option value="Nurse">Nurse</option>
              <option value="Barangay Health Worker">
                Barangay Health Worker
              </option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary animate-pulse" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading staff data...</p>
    </div>

    <!-- Staff Table -->
    <div v-else class="card animate-fade-in-up animation-delay-200">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-people-fill me-2"></i>
          Staff Members ({{ filteredStaff.length }})
        </h5>
        <button
          class="btn btn-sm btn-outline-primary"
          @click="fetchStaff"
          :disabled="loading"
        >
          <i
            class="bi bi-arrow-clockwise me-1"
            :class="{ 'animate-spin': loading }"
          ></i>
          Refresh
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date Joined</th>
                <th>Last Login</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="staff in filteredStaff"
                :key="staff.id"
                class="animate-fade-in-up"
              >
                <td>
                  <div class="d-flex align-items-center">
                    <div class="staff-avatar me-3">
                      <i class="bi bi-person-circle"></i>
                    </div>
                    <div>
                      <div class="fw-medium">
                        {{ staff.firstName }} {{ staff.surname }}
                      </div>
                      <small class="text-muted">{{ staff.suffix }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div>{{ staff.contactNumber }}</div>
                  <small class="text-muted">{{ staff.email }}</small>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="`bg-${getRoleBadgeVariant(staff.role)}`"
                  >
                    {{ staff.role }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="`bg-${getStatusBadgeVariant(staff.status)}`"
                  >
                    {{ staff.status }}
                  </span>
                </td>
                <td>{{ new Date(staff.dateJoined).toLocaleDateString() }}</td>
                <td>
                  <small>{{
                    staff.lastLogin
                      ? new Date(staff.lastLogin).toLocaleString()
                      : "No login yet"
                  }}</small>
                </td>
                <td class="text-center">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="openEditModal(staff)"
                      title="Edit Staff"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="openDeleteModal(staff)"
                      title="Delete Staff"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredStaff.length === 0" class="text-center py-5">
          <i class="bi bi-people-fill text-muted fs-1 mb-3"></i>
          <h5 class="text-muted">No staff members found</h5>
          <p class="text-muted mb-3">
            {{
              search
                ? "Try adjusting your search criteria."
                : "Get started by adding your first staff member."
            }}
          </p>
          <button v-if="!search" class="btn btn-primary" @click="openAddModal">
            <i class="bi bi-person-plus me-2"></i>
            Add New Staff
          </button>
        </div>
      </div>
    </div>

    <!-- Add Staff Modal -->
    <div
      class="modal fade"
      :class="{ show: showAddModal }"
      :style="{ display: showAddModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-plus me-2"></i>
              Add New Staff Member
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="addStaff">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">First Name *</label>
                  <input
                    v-model="staffForm.firstName"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Surname *</label>
                  <input
                    v-model="staffForm.surname"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Suffix</label>
                  <input
                    v-model="staffForm.suffix"
                    type="text"
                    class="form-control"
                    placeholder="MD, RN, BHW, etc."
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Contact Number *</label>
                  <input
                    v-model="staffForm.contactNumber"
                    type="tel"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email *</label>
                  <input
                    v-model="staffForm.email"
                    type="email"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Role *</label>
                  <select v-model="staffForm.role" class="form-select" required>
                    <option value="Nurse">Nurse</option>
                    <option value="Barangay Health Worker">
                      Barangay Health Worker
                    </option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModals"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-person-plus me-2"></i>
                Add Staff
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Staff Modal -->
    <div
      class="modal fade"
      :class="{ show: showEditModal }"
      :style="{ display: showEditModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Edit Staff Member
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="updateStaff">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">First Name *</label>
                  <input
                    v-model="staffForm.firstName"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Surname *</label>
                  <input
                    v-model="staffForm.surname"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Suffix</label>
                  <input
                    v-model="staffForm.suffix"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Contact Number *</label>
                  <input
                    v-model="staffForm.contactNumber"
                    type="tel"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email *</label>
                  <input
                    v-model="staffForm.email"
                    type="email"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Role *</label>
                  <select v-model="staffForm.role" class="form-select" required>
                    <option value="Nurse">Nurse</option>
                    <option value="Barangay Health Worker">
                      Barangay Health Worker
                    </option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModals"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-check-lg me-2"></i>
                Update Staff
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      :class="{ show: showDeleteModal }"
      :style="{ display: showDeleteModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Confirm Deletion
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this staff member?</p>
            <div v-if="selectedStaff" class="alert alert-warning">
              <strong
                >{{ selectedStaff.firstName }}
                {{ selectedStaff.surname }}</strong
              ><br />
              <small>{{ selectedStaff.email }}</small>
            </div>
            <p class="text-muted mb-0">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModals"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-danger" @click="deleteStaff">
              <i class="bi bi-trash me-2"></i>
              Delete Staff
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showAddModal || showEditModal || showDeleteModal"
      class="modal-backdrop fade show"
      @click="closeModals"
    ></div>
  </div>
</template>

<style scoped>
.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
}

.search-box input {
  padding-left: 40px;
}

.staff-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-gradient-start);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: var(--text-color);
  background-color: rgba(0, 0, 0, 0.02);
}

.table td {
  vertical-align: middle;
  border-color: rgba(0, 0, 0, 0.05);
}

/* Animation for spinner */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }

  .btn-group {
    width: 100%;
  }

  .btn-group .btn {
    flex: 1;
  }
}
</style>
