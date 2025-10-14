<template>
  <div class="admin-container">
    <v-container fluid class="pa-4">
      <!-- Header Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div
            class="d-flex align-center justify-space-between flex-wrap gap-4"
          >
            <div class="admin-animate-fade-in">
              <h1 class="admin-heading-1">
                <v-icon left color="primary" size="40">mdi-account-tie</v-icon>
                👥 Manage Staff
              </h1>
              <p class="admin-body-lg text--secondary">
                Manage healthcare professionals, assign roles, and oversee staff
                operations.
              </p>
            </div>
            <div class="d-flex gap-3 admin-animate-fade-in admin-stagger-1">
              <v-btn
                color="primary"
                class="admin-btn admin-btn-primary"
                @click="openCreateDialog"
              >
                <v-icon left>mdi-account-plus</v-icon>
                Add Staff
              </v-btn>
              <v-btn
                color="secondary"
                class="admin-btn admin-btn-secondary"
                @click="exportStaff"
                :loading="exporting"
              >
                <v-icon left>mdi-download</v-icon>
                Export
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Filters and Search Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="admin-card">
            <v-card-text class="admin-card-body">
              <div class="admin-grid admin-grid-cols-4 gap-4">
                <!-- Search -->
                <div class="admin-form-group">
                  <v-text-field
                    v-model="searchQuery"
                    label="Search staff..."
                    prepend-inner-icon="mdi-magnify"
                    single-line
                    hide-details
                    clearable
                    class="admin-input"
                    @input="debounceSearch"
                  />
                </div>

                <!-- Role Filter -->
                <div class="admin-form-group">
                  <v-select
                    v-model="roleFilter"
                    :items="roleOptions"
                    label="Filter by Role"
                    prepend-inner-icon="mdi-account-cog"
                    clearable
                    class="admin-input"
                    @change="applyFilters"
                  />
                </div>

                <!-- Status Filter -->
                <div class="admin-form-group">
                  <v-select
                    v-model="statusFilter"
                    :items="statusOptions"
                    label="Filter by Status"
                    prepend-inner-icon="mdi-account-check"
                    clearable
                    class="admin-input"
                    @change="applyFilters"
                  />
                </div>

                <!-- Clear Filters -->
                <div class="admin-form-group d-flex align-center">
                  <v-btn
                    color="warning"
                    variant="outlined"
                    class="admin-btn"
                    @click="clearFilters"
                    :disabled="!hasActiveFilters"
                  >
                    <v-icon left>mdi-filter-off</v-icon>
                    Clear Filters
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Bulk Actions Bar -->
      <v-row v-if="selectedStaff.length > 0" class="mb-4">
        <v-col cols="12">
          <v-card class="admin-card" color="primary" variant="tonal">
            <v-card-text class="admin-card-body">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center gap-3">
                  <v-icon color="primary">mdi-account-group</v-icon>
                  <span class="admin-body font-weight-medium">
                    {{ selectedStaff.length }} staff member{{
                      selectedStaff.length > 1 ? "s" : ""
                    }}
                    selected
                  </span>
                </div>
                <div class="d-flex gap-2">
                  <v-btn
                    color="secondary"
                    size="small"
                    class="admin-btn"
                    @click="bulkAssignRole"
                  >
                    <v-icon left>mdi-account-cog</v-icon>
                    Assign Role
                  </v-btn>
                  <v-btn
                    color="success"
                    size="small"
                    class="admin-btn"
                    @click="bulkActivate"
                  >
                    <v-icon left>mdi-account-check</v-icon>
                    Activate
                  </v-btn>
                  <v-btn
                    color="error"
                    size="small"
                    class="admin-btn"
                    @click="bulkDeactivate"
                  >
                    <v-icon left>mdi-account-off</v-icon>
                    Deactivate
                  </v-btn>
                  <v-btn
                    color="warning"
                    size="small"
                    variant="outlined"
                    class="admin-btn"
                    @click="clearSelection"
                  >
                    Clear Selection
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Staff Table -->
      <v-row>
        <v-col cols="12">
          <v-card class="admin-card">
            <v-card-title class="admin-card-header d-flex align-center">
              <v-icon left color="primary">mdi-account-group</v-icon>
              <span class="admin-heading-4">Staff Directory</span>
              <v-spacer></v-spacer>
              <div class="d-flex align-center gap-2">
                <v-chip color="info" size="small">
                  {{ filteredStaff.length }} staff
                </v-chip>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  @click="refreshStaff"
                  :loading="loading"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </div>
            </v-card-title>

            <v-card-text class="admin-card-body">
              <v-data-table
                v-model="selectedStaff"
                :headers="headers"
                :items="filteredStaff"
                :loading="loading"
                :search="searchQuery"
                show-select
                class="admin-table"
                :items-per-page="itemsPerPage"
                :page="currentPage"
                @update:page="handlePageChange"
                @update:items-per-page="handleItemsPerPageChange"
              >
                <!-- Avatar Template -->
                <template v-slot:item.avatar="{ item }">
                  <v-avatar size="40" class="ma-2">
                    <v-img
                      :src="getStaffAvatar(item)"
                      :alt="`${item.FirstName} ${item.Surname}`"
                    >
                      <template v-slot:placeholder>
                        <v-icon>mdi-account</v-icon>
                      </template>
                    </v-img>
                  </v-avatar>
                </template>

                <!-- Name Template -->
                <template v-slot:item.fullName="{ item }">
                  <div class="d-flex flex-column">
                    <span class="admin-body font-weight-medium">
                      {{ getFullName(item) }}
                    </span>
                    <span class="admin-caption text--secondary">
                      ID: {{ item.StaffID }}
                    </span>
                  </div>
                </template>

                <!-- Role Template -->
                <template v-slot:item.role="{ item }">
                  <v-chip
                    :color="getRoleColor(item.Users?.RoleID)"
                    size="small"
                    variant="flat"
                    class="admin-status"
                  >
                    <v-icon left size="14">{{
                      getRoleIcon(item.Users?.RoleID)
                    }}</v-icon>
                    {{ getRoleName(item.Users?.RoleID) }}
                  </v-chip>
                </template>

                <!-- Status Template -->
                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="item.isActive ? 'success' : 'error'"
                    size="small"
                    class="admin-status"
                  >
                    <v-icon left size="14">
                      {{
                        item.isActive ? "mdi-account-check" : "mdi-account-off"
                      }}
                    </v-icon>
                    {{ item.isActive ? "Active" : "Inactive" }}
                  </v-chip>
                </template>

                <!-- Contact Template -->
                <template v-slot:item.contact="{ item }">
                  <div class="d-flex flex-column">
                    <span class="admin-body">{{ item.ContactNumber }}</span>
                    <span class="admin-caption text--secondary">{{
                      item.Users?.Email
                    }}</span>
                  </div>
                </template>

                <!-- Actions Template -->
                <template v-slot:item.actions="{ item }">
                  <div class="d-flex gap-1">
                    <v-btn
                      icon
                      size="small"
                      color="primary"
                      @click="viewStaff(item)"
                      v-tooltip="'View Details'"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      color="secondary"
                      @click="editStaff(item)"
                      v-tooltip="'Edit Staff'"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      color="success"
                      @click="toggleStaffStatus(item)"
                      v-tooltip="item.isActive ? 'Deactivate' : 'Activate'"
                    >
                      <v-icon>{{
                        item.isActive ? "mdi-account-off" : "mdi-account-check"
                      }}</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      @click="deleteStaff(item)"
                      v-tooltip="'Delete Staff'"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create/Edit Staff Dialog -->
    <v-dialog v-model="showStaffDialog" max-width="600px" persistent>
      <v-card class="admin-card">
        <v-card-title class="admin-card-header d-flex align-center">
          <v-icon left :color="editingStaff ? 'secondary' : 'primary'">
            {{ editingStaff ? "mdi-pencil" : "mdi-account-plus" }}
          </v-icon>
          <span class="admin-heading-4">
            {{ editingStaff ? "Edit Staff" : "Add New Staff" }}
          </span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="closeStaffDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="admin-card-body">
          <v-form ref="staffForm" v-model="formValid">
            <div class="admin-grid admin-grid-cols-2 gap-4">
              <div class="admin-form-group">
                <v-text-field
                  v-model="staffForm.firstName"
                  label="First Name"
                  :rules="nameRules"
                  class="admin-input"
                  required
                />
              </div>

              <div class="admin-form-group">
                <v-text-field
                  v-model="staffForm.surname"
                  label="Surname"
                  :rules="nameRules"
                  class="admin-input"
                  required
                />
              </div>

              <div class="admin-form-group">
                <v-text-field
                  v-model="staffForm.suffix"
                  label="Suffix (Optional)"
                  class="admin-input"
                />
              </div>

              <div class="admin-form-group">
                <v-text-field
                  v-model="staffForm.contactNumber"
                  label="Contact Number"
                  :rules="contactRules"
                  class="admin-input"
                  required
                />
              </div>

              <div class="admin-form-group">
                <v-text-field
                  v-model="staffForm.email"
                  label="Email Address"
                  :rules="emailRules"
                  class="admin-input"
                  type="email"
                  required
                />
              </div>

              <div class="admin-form-group">
                <v-select
                  v-model="staffForm.role"
                  :items="roleOptions"
                  label="Role"
                  :rules="roleRules"
                  class="admin-input"
                  required
                />
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="admin-card-footer">
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            variant="outlined"
            class="admin-btn"
            @click="closeStaffDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            class="admin-btn admin-btn-primary"
            @click="saveStaff"
            :loading="saving"
            :disabled="!formValid"
          >
            <v-icon left>{{
              editingStaff ? "mdi-content-save" : "mdi-account-plus"
            }}</v-icon>
            {{ editingStaff ? "Update" : "Create" }} Staff
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card class="admin-card">
        <v-card-title class="admin-card-header">
          <v-icon left color="error">mdi-alert-circle</v-icon>
          <span class="admin-heading-4">Confirm Deletion</span>
        </v-card-title>
        <v-card-text class="admin-card-body">
          <p class="admin-body">
            Are you sure you want to delete
            <strong
              >{{ selectedStaffMember?.FirstName }}
              {{ selectedStaffMember?.Surname }}</strong
            >?
          </p>
          <p class="admin-body-sm text--secondary">
            This action cannot be undone and will remove all associated data.
          </p>
        </v-card-text>
        <v-card-actions class="admin-card-footer">
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            variant="outlined"
            class="admin-btn"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            class="admin-btn admin-btn-danger"
            @click="confirmDelete"
            :loading="deleting"
          >
            <v-icon left>mdi-delete</v-icon>
            Delete Staff
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bulk Role Assignment Dialog -->
    <v-dialog v-model="showBulkRoleDialog" max-width="400px">
      <v-card class="admin-card">
        <v-card-title class="admin-card-header">
          <v-icon left color="secondary">mdi-account-cog</v-icon>
          <span class="admin-heading-4">Bulk Role Assignment</span>
        </v-card-title>
        <v-card-text class="admin-card-body">
          <p class="admin-body">
            Assign role to {{ selectedStaff.length }} selected staff members.
          </p>
          <v-select
            v-model="bulkRole"
            :items="roleOptions"
            label="Select Role"
            class="admin-input"
            required
          />
        </v-card-text>
        <v-card-actions class="admin-card-footer">
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            variant="outlined"
            class="admin-btn"
            @click="showBulkRoleDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            class="admin-btn admin-btn-primary"
            @click="confirmBulkRoleAssignment"
            :loading="bulkUpdating"
          >
            <v-icon left>mdi-account-cog</v-icon>
            Assign Role
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      <div class="d-flex align-center gap-2">
        <v-icon>{{ getSnackbarIcon(snackbar.color) }}</v-icon>
        <span>{{ snackbar.message }}</span>
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const loading = ref(false);
const exporting = ref(false);
const saving = ref(false);
const deleting = ref(false);
const bulkUpdating = ref(false);
const showStaffDialog = ref(false);
const showDeleteDialog = ref(false);
const showBulkRoleDialog = ref(false);
const editingStaff = ref(null);
const selectedStaffMember = ref(null);
const formValid = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Form data
const staffForm = ref({
  firstName: "",
  surname: "",
  suffix: "",
  contactNumber: "",
  email: "",
  role: "",
});

// Search and filters
const searchQuery = ref("");
const roleFilter = ref("");
const statusFilter = ref("");

// Data
const staff = ref([]);
const selectedStaff = ref([]);

// Form validation rules
const nameRules = [
  (v) => !!v || "This field is required",
  (v) => (v && v.length >= 2) || "Must be at least 2 characters",
];

const contactRules = [
  (v) => !!v || "Contact number is required",
  (v) => (v && v.length >= 10) || "Must be at least 10 digits",
];

const emailRules = [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const roleRules = [(v) => !!v || "Role is required"];

// Options
const roleOptions = [
  { title: "Nurse", value: "nurse" },
  { title: "Doctor", value: "doctor" },
  { title: "Admin", value: "admin" },
  { title: "Receptionist", value: "receptionist" },
];

const statusOptions = [
  { title: "Active", value: "active" },
  { title: "Inactive", value: "inactive" },
];

// Table headers
const headers = [
  { title: "Avatar", key: "avatar", width: "80px", sortable: false },
  { title: "Name", key: "fullName", width: "200px" },
  { title: "Role", key: "role", width: "120px" },
  { title: "Status", key: "status", width: "100px" },
  { title: "Contact", key: "contact", width: "200px" },
  { title: "Actions", key: "actions", width: "150px", sortable: false },
];

// Computed properties
const filteredStaff = computed(() => {
  let filtered = staff.value;

  if (roleFilter.value) {
    filtered = filtered.filter(
      (staff) => staff.Users?.RoleID === roleFilter.value
    );
  }

  if (statusFilter.value) {
    const isActive = statusFilter.value === "active";
    filtered = filtered.filter((staff) => staff.isActive === isActive);
  }

  return filtered;
});

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || roleFilter.value || statusFilter.value);
});

// Methods
const loadStaff = async () => {
  loading.value = true;
  try {
    const response = await fetch("/api/staff");
    const data = await response.json();

    staff.value = data.map((staff) => ({
      ...staff,
      isActive: Math.random() > 0.2, // Mock active status for demo
      fullName: `${staff.FirstName} ${staff.Surname}${
        staff.Suffix ? " " + staff.Suffix : ""
      }`,
    }));
  } catch (error) {
    console.error("Load staff error:", error);
    showSnackbar("Failed to load staff", "error");
  } finally {
    loading.value = false;
  }
};

const debounceSearch = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      applyFilters();
    }, 300);
  };
})();

const applyFilters = () => {
  currentPage.value = 1;
};

const clearFilters = () => {
  searchQuery.value = "";
  roleFilter.value = "";
  statusFilter.value = "";
  currentPage.value = 1;
};

const openCreateDialog = () => {
  editingStaff.value = null;
  staffForm.value = {
    firstName: "",
    surname: "",
    suffix: "",
    contactNumber: "",
    email: "",
    role: "",
  };
  showStaffDialog.value = true;
};

const editStaff = (staffMember) => {
  editingStaff.value = staffMember;
  staffForm.value = {
    firstName: staffMember.FirstName,
    surname: staffMember.Surname,
    suffix: staffMember.Suffix || "",
    contactNumber: staffMember.ContactNumber,
    email: staffMember.Users?.Email || "",
    role: staffMember.Users?.RoleID || "",
  };
  showStaffDialog.value = true;
};

const saveStaff = async () => {
  if (!formValid.value) return;

  saving.value = true;
  try {
    const staffData = {
      firstName: staffForm.value.firstName,
      surname: staffForm.value.surname,
      suffix: staffForm.value.suffix,
      contactNumber: staffForm.value.contactNumber,
      userId: editingStaff.value?.UserID || Date.now(), // Mock user ID
    };

    if (editingStaff.value) {
      // Update existing staff
      await fetch(`/api/staff/${editingStaff.value.StaffID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffData),
      });
      showSnackbar("Staff updated successfully", "success");
    } else {
      // Create new staff
      await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffData),
      });
      showSnackbar("Staff created successfully", "success");
    }

    closeStaffDialog();
    loadStaff();
  } catch (error) {
    console.error("Save staff error:", error);
    showSnackbar("Failed to save staff", "error");
  } finally {
    saving.value = false;
  }
};

const deleteStaff = (staffMember) => {
  selectedStaffMember.value = staffMember;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await fetch(`/api/staff/${selectedStaffMember.value.StaffID}`, {
      method: "DELETE",
    });
    showSnackbar("Staff deleted successfully", "success");
    showDeleteDialog.value = false;
    loadStaff();
  } catch (error) {
    console.error("Delete staff error:", error);
    showSnackbar("Failed to delete staff", "error");
  } finally {
    deleting.value = false;
  }
};

const toggleStaffStatus = async (staffMember) => {
  try {
    // Mock status toggle - in real app, this would call an API
    staffMember.isActive = !staffMember.isActive;
    showSnackbar(
      `Staff ${
        staffMember.isActive ? "activated" : "deactivated"
      } successfully`,
      "success"
    );
  } catch (error) {
    showSnackbar("Failed to update staff status", "error");
  }
};

const viewStaff = (staffMember) => {
  // Navigate to staff detail view or open detail dialog
  console.log("View staff:", staffMember);
};

const bulkAssignRole = () => {
  showBulkRoleDialog.value = true;
};

const confirmBulkRoleAssignment = async () => {
  if (!bulkRole.value) return;

  bulkUpdating.value = true;
  try {
    // Mock bulk role assignment
    await new Promise((resolve) => setTimeout(resolve, 1000));
    showSnackbar(
      `Role assigned to ${selectedStaff.value.length} staff members`,
      "success"
    );
    showBulkRoleDialog.value = false;
    clearSelection();
  } catch (error) {
    showSnackbar("Failed to assign roles", "error");
  } finally {
    bulkUpdating.value = false;
  }
};

const bulkActivate = async () => {
  try {
    selectedStaff.value.forEach((staff) => {
      staff.isActive = true;
    });
    showSnackbar(
      `${selectedStaff.value.length} staff members activated`,
      "success"
    );
    clearSelection();
  } catch (error) {
    showSnackbar("Failed to activate staff", "error");
  }
};

const bulkDeactivate = async () => {
  try {
    selectedStaff.value.forEach((staff) => {
      staff.isActive = false;
    });
    showSnackbar(
      `${selectedStaff.value.length} staff members deactivated`,
      "success"
    );
    clearSelection();
  } catch (error) {
    showSnackbar("Failed to deactivate staff", "error");
  }
};

const clearSelection = () => {
  selectedStaff.value = [];
};

const exportStaff = async () => {
  exporting.value = true;
  try {
    // Mock export functionality
    await new Promise((resolve) => setTimeout(resolve, 1500));
    showSnackbar("Staff data exported successfully", "success");
  } catch (error) {
    showSnackbar("Failed to export staff data", "error");
  } finally {
    exporting.value = false;
  }
};

const refreshStaff = () => {
  loadStaff();
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
};

// Utility functions
const getFullName = (staff) => {
  return `${staff.FirstName} ${staff.Surname}${
    staff.Suffix ? " " + staff.Suffix : ""
  }`;
};

const getStaffAvatar = (staff) => {
  // Mock avatar URL - in real app, this would be from the staff record
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.FirstName}${staff.Surname}`;
};

const getRoleColor = (role) => {
  const colors = {
    admin: "primary",
    doctor: "success",
    nurse: "info",
    receptionist: "warning",
  };
  return colors[role] || "secondary";
};

const getRoleIcon = (role) => {
  const icons = {
    admin: "mdi-shield-account",
    doctor: "mdi-doctor",
    nurse: "mdi-account-heart",
    receptionist: "mdi-deskphone",
  };
  return icons[role] || "mdi-account";
};

const getRoleName = (role) => {
  const names = {
    admin: "Admin",
    doctor: "Doctor",
    nurse: "Nurse",
    receptionist: "Receptionist",
  };
  return names[role] || "Unknown";
};

const showSnackbar = (message, color) => {
  snackbar.value = { show: true, message, color };
};

const getSnackbarIcon = (color) => {
  const icons = {
    success: "mdi-check-circle",
    error: "mdi-alert-circle",
    warning: "mdi-alert",
    info: "mdi-information",
  };
  return icons[color] || "mdi-information";
};

const closeStaffDialog = () => {
  showStaffDialog.value = false;
  editingStaff.value = null;
  if (staffForm.value) {
    staffForm.value = {
      firstName: "",
      surname: "",
      suffix: "",
      contactNumber: "",
      email: "",
      role: "",
    };
  }
};

// Initialize
onMounted(() => {
  loadStaff();
});
</script>

<style scoped>
/* Custom table styling */
.admin-table :deep(.v-table) {
  border-radius: var(--admin-radius-lg);
}

.admin-table :deep(.v-table__wrapper) {
  border-radius: var(--admin-radius-lg);
}

.admin-table :deep(.v-table thead th) {
  background: var(--admin-bg-secondary);
  font-weight: var(--admin-font-weight-semibold);
  color: var(--admin-text-primary);
  border-bottom: 2px solid var(--admin-border-light);
}

.admin-table :deep(.v-table tbody tr) {
  transition: all var(--admin-transition-base);
}

.admin-table :deep(.v-table tbody tr:hover) {
  background: var(--admin-bg-tertiary);
}

.admin-table :deep(.v-selection-control) {
  margin: 0;
  padding: var(--admin-space-2);
}

/* Dialog enhancements */
:deep(.v-dialog) {
  border-radius: var(--admin-radius-xl);
}

/* Form enhancements */
:deep(.v-field) {
  border-radius: var(--admin-radius-md);
}

:deep(.v-field__outline) {
  color: var(--admin-border-medium);
}

:deep(.v-field--focused .v-field__outline) {
  color: var(--admin-primary);
}

/* Selection styling */
:deep(.v-selection-control--dirty .v-selection-control__input) {
  color: var(--admin-primary);
}

/* Loading animation */
@keyframes staff-loading {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.loading .admin-card {
  animation: staff-loading 1.5s ease-in-out infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .admin-grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .d-flex.gap-3 {
    flex-direction: column;
    align-items: stretch;
  }

  .d-flex.gap-2 {
    flex-wrap: wrap;
  }
}

/* Tooltip styling */
:deep(.v-tooltip) {
  background: var(--admin-gray-900);
  color: var(--admin-text-inverse);
  border-radius: var(--admin-radius-md);
  font-size: var(--admin-font-size-sm);
}
</style>
