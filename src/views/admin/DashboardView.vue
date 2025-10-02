<template>
  <div class="container-fluid px-2 px-md-3 mt-3">
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4"
    >
      <div>
        <h1 class="mb-2 h3 h1-md">Admin Dashboard</h1>
        <p class="text-muted mb-0">System overview and management</p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-3 g-md-4 mt-2">
      <div class="col-6 col-lg-3">
        <div class="card bg-primary text-white h-100">
          <div
            class="card-body d-flex justify-content-between align-items-center p-3"
          >
            <div class="flex-grow-1">
              <h5 class="card-title mb-1 fs-4 fs-md-3">{{ totalRecords }}</h5>
              <p class="card-text mb-0 small">Total Records</p>
            </div>
            <i
              class="bi bi-file-earmark-text fs-2 d-none d-sm-block opacity-75"
            ></i>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card bg-success text-white h-100">
          <div
            class="card-body d-flex justify-content-between align-items-center p-3"
          >
            <div class="flex-grow-1">
              <h5 class="card-title mb-1 fs-4 fs-md-3">{{ totalPatients }}</h5>
              <p class="card-text mb-0 small">Total Patients</p>
            </div>
            <i class="bi bi-people fs-2 d-none d-sm-block opacity-75"></i>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card bg-info text-white h-100">
          <div
            class="card-body d-flex justify-content-between align-items-center p-3"
          >
            <div class="flex-grow-1">
              <h5 class="card-title mb-1 fs-4 fs-md-3">{{ staffMembers }}</h5>
              <p class="card-text mb-0 small">Staff Members</p>
            </div>
            <i class="bi bi-person-badge fs-2 d-none d-sm-block opacity-75"></i>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card bg-warning text-dark h-100">
          <div
            class="card-body d-flex justify-content-between align-items-center p-3"
          >
            <div class="flex-grow-1">
              <h5 class="card-title mb-1 fs-4 fs-md-3">{{ pendingReviews }}</h5>
              <p class="card-text mb-0 small">Pending Reviews</p>
            </div>
            <i
              class="bi bi-clock-history fs-2 d-none d-sm-block opacity-75"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row g-3 g-md-4 mt-3">
      <div class="col-12 col-xl-6 mb-4">
        <div class="card h-100">
          <div
            class="card-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2"
          >
            <h5 class="mb-0">System Users</h5>
          </div>
          <div class="card-body">
            <!-- Users List -->
            <div v-if="systemUsers.length > 0" class="users-list">
              <div
                v-for="user in systemUsers"
                :key="user.id"
                class="user-item d-flex justify-content-between align-items-center p-3 mb-2 border rounded animate-fade-in"
                :class="{ 'user-new': user.isNew }"
              >
                <div
                  class="user-info d-flex align-items-center gap-3 flex-grow-1"
                >
                  <div class="user-avatar">
                    <i
                      class="bi bi-person-circle fs-4"
                      :class="getUserAvatarClass(user.role)"
                    ></i>
                  </div>
                  <div class="user-details">
                    <div class="fw-bold">{{ user.name }}</div>
                    <div class="text-muted small">{{ user.role }}</div>
                  </div>
                </div>
                <div class="user-meta d-flex align-items-center gap-3">
                  <div class="text-center d-none d-md-block">
                    <div class="small text-muted">Role</div>
                    <span class="badge" :class="getRoleBadgeClass(user.role)">{{
                      user.role
                    }}</span>
                  </div>
                  <div class="text-center d-none d-md-block">
                    <div class="small text-muted">Status</div>
                    <span
                      class="badge"
                      :class="
                        user.status === 'active' ? 'bg-success' : 'bg-secondary'
                      "
                    >
                      {{ user.status }}
                    </span>
                  </div>
                </div>
                <!-- Mobile view for role and status -->
                <div class="d-md-none w-100 mt-2 pt-2 border-top">
                  <div class="d-flex justify-content-between">
                    <span class="badge" :class="getRoleBadgeClass(user.role)">{{
                      user.role
                    }}</span>
                    <span
                      class="badge"
                      :class="
                        user.status === 'active' ? 'bg-success' : 'bg-secondary'
                      "
                    >
                      {{ user.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-users-state text-center py-5">
              <i class="bi bi-people fs-1 text-muted mb-3"></i>
              <h6 class="text-muted">No Users Found</h6>
              <p class="text-muted small mb-3">
                No users available for display
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-6 mb-4">
        <div class="card h-100">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">System Activity</h5>
            <div class="d-flex align-items-center gap-2">
              <button
                @click="clearActivities"
                class="btn btn-sm btn-outline-secondary"
                title="Clear all activities"
                v-if="systemActivities.length > 0"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="activity-list" v-if="systemActivities.length > 0">
              <div
                v-for="activity in systemActivities"
                :key="activity.id"
                class="activity-item d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom animate-fade-in"
                :class="{ 'activity-new': activity.isNew }"
              >
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2">
                    <i
                      :class="getActivityIcon(activity.type)"
                      class="activity-icon"
                    ></i>
                    <div class="fw-bold">{{ activity.title }}</div>
                  </div>
                  <div class="text-muted small mt-1">
                    {{ activity.description }}
                  </div>
                </div>
                <span class="text-muted small text-nowrap ms-2">{{
                  formatTimeAgo(activity.timestamp)
                }}</span>
              </div>
            </div>
            <div v-else class="empty-activity-state text-center py-5">
              <i class="bi bi-activity fs-1 text-muted mb-3"></i>
              <h6 class="text-muted">No Recent Activity</h6>
              <p class="text-muted small mb-0">
                System activities will appear here in real-time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useStore } from "vuex";
import { supabase } from "../../services/supabase";

const store = useStore();

// System activity state (disabled - no random activities)
const systemActivities = ref([]);

// System users state
const systemUsers = ref([]);
const showAddUserModal = ref(false);
const editingUser = ref(null);

// Activity types disabled - no random activities

// Get current user from store
const currentUser = computed(() => store.state.user);

// Statistics computed properties
const totalPatients = ref(0);

const totalRecords = ref(0);

const staffMembers = ref(0);

const pendingReviews = ref(0);

// Fetch pending reviews from Supabase
const fetchPendingReviews = async () => {
  try {
    // For now, we'll count appointments that are scheduled for future dates
    // In a real system, you might have a status field for pending/upcoming
    const today = new Date().toISOString().split("T")[0];

    const { count, error } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("date", today);

    if (error) {
      console.error("Error fetching pending reviews:", error);
      pendingReviews.value = 0;
    } else {
      pendingReviews.value = count || 0;
    }
  } catch (err) {
    console.error("Error fetching pending reviews:", err);
    pendingReviews.value = 0;
  }
};

// Fetch total records from Supabase
const fetchTotalRecords = async () => {
  try {
    const { count, error } = await supabase
      .from("medical_records")
      .select("*", { count: "exact", head: true });

    if (error) {
      // If table doesn't exist, set to 0 instead of logging error
      if (error.code === "PGRST116") {
        // Table doesn't exist
        totalRecords.value = 0;
      } else {
        console.error("Error fetching medical records count:", error);
        totalRecords.value = 0;
      }
    } else {
      totalRecords.value = count || 0;
    }
  } catch (err) {
    console.error("Error fetching total records:", err);
    totalRecords.value = 0;
  }
};

// Fetch total patients from Supabase
const fetchTotalPatients = async () => {
  try {
    const { count, error } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching patients count:", error);
      totalPatients.value = 0;
    } else {
      totalPatients.value = count || 0;
    }
  } catch (err) {
    console.error("Error fetching total patients:", err);
    totalPatients.value = 0;
  }
};

// Fetch staff members count from Supabase
const fetchStaffMembers = async () => {
  try {
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "nurse");

    if (error) {
      console.error("Error fetching staff members count:", error);
      staffMembers.value = 0;
    } else {
      staffMembers.value = count || 0;
    }
  } catch (err) {
    console.error("Error fetching staff members:", err);
    staffMembers.value = 0;
  }
};

// Generate unique ID for activities
const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

// Format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - activityTime) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
};

// Activity functions disabled

// Activity functions disabled - no random activities

// Activity generation is disabled - no random activities

// User management functions
const getUserAvatarClass = (role) => {
  const classes = {
    admin: "text-danger",
    nurse: "text-primary",
    patient: "text-success",
    staff: "text-info",
  };
  return classes[role] || "text-secondary";
};

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: "bg-danger",
    nurse: "bg-primary",
    patient: "bg-success",
    staff: "bg-info",
  };
  return classes[role] || "bg-secondary";
};

const addUser = (name, email, role, status = "active") => {
  const newUser = {
    id: generateId(),
    name,
    email,
    role,
    status,
    createdAt: new Date(),
    isNew: true,
  };

  systemUsers.value.unshift(newUser);

  // Remove 'new' flag after animation
  setTimeout(() => {
    newUser.isNew = false;
  }, 2000);
};

const editUser = (user) => {
  editingUser.value = { ...user };
  showAddUserModal.value = true;
};

const deleteUser = (userId) => {
  const userIndex = systemUsers.value.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    systemUsers.value.splice(userIndex, 1);
  }
};

// Add current admin user if not already present
const initializeAdminUser = () => {
  if (currentUser.value && systemUsers.value.length === 0) {
    addUser(
      currentUser.value.fullName || "Administrator",
      currentUser.value.username || "admin",
      "admin",
      "active"
    );
  }
};

onMounted(async () => {
  // Initialize admin user
  initializeAdminUser();

  // Fetch statistics from Supabase
  await Promise.all([
    fetchTotalRecords(),
    fetchTotalPatients(),
    fetchStaffMembers(),
    fetchPendingReviews(),
  ]);

  // Update time stamps every minute
  setInterval(() => {
    // Force reactivity update for time stamps
    systemActivities.value = [...systemActivities.value];
  }, 60000);
});

// No cleanup needed - activity generation disabled
</script>

<style scoped>
/* Mobile-first responsive design */
.card {
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  border: none;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Statistics cards responsive design */
.card-body {
  padding: 1rem;
}

@media (min-width: 576px) {
  .card-body {
    padding: 1.25rem;
  }
}

/* Typography responsive adjustments */
.h1-md {
  font-size: 1.5rem;
}

@media (min-width: 768px) {
  .h1-md {
    font-size: 2rem;
  }
}

/* Icon adjustments for mobile */
.bi {
  opacity: 0.7;
}

@media (max-width: 575.98px) {
  .fs-2 {
    font-size: 1.5rem !important;
  }
}

/* Table responsive improvements */
@media (max-width: 767.98px) {
  .table tbody tr {
    display: block;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
  }

  .table tbody td {
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
    border: none;
  }

  .table tbody td:last-child {
    border-bottom: none;
  }
}

/* Activity list improvements */
.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

/* Button group responsive */
.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Card spacing adjustments */
@media (max-width: 575.98px) {
  .container-fluid {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}

/* Ensure equal height cards */
.h-100 {
  height: 100% !important;
}

/* Improve text wrapping on small screens */
.text-nowrap {
  white-space: nowrap;
}

@media (max-width: 575.98px) {
  .text-nowrap {
    white-space: normal;
    font-size: 0.75rem;
  }
}

/* Badge adjustments */
.badge {
  font-size: 0.75rem;
}

/* Scrollbar styling for activity list */
.activity-list::-webkit-scrollbar {
  width: 4px;
}

.activity-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Activity item styles */
.activity-item {
  transition: all 0.3s ease;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin: 0 -0.75rem 0.75rem -0.75rem;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.activity-item.activity-new {
  background-color: #e7f3ff;
  border-left: 3px solid #0d6efd;
  animation: slideInRight 0.5s ease-out;
}

.activity-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
}

/* Empty state styling */
.empty-activity-state {
  color: #6c757d;
}

.empty-activity-state .bi-activity {
  opacity: 0.5;
}

/* Animation for new activities */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Fade in animation */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments for activity items */
@media (max-width: 575.98px) {
  .activity-item {
    margin: 0 -0.5rem 0.75rem -0.5rem;
    padding: 0.5rem;
  }
}

/* User item styles */
.user-item {
  transition: all 0.3s ease;
  border-color: #e9ecef !important;
}

.user-item:hover {
  border-color: #0d6efd !important;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
}

.user-item.user-new {
  background-color: #e7f3ff;
  border-color: #0d6efd !important;
  border-left: 4px solid #0d6efd !important;
  animation: slideInLeft 0.5s ease-out;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  min-width: 0;
  flex-grow: 1;
}

.user-details .fw-bold {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  flex-shrink: 0;
}

/* Empty users state */
.empty-users-state {
  color: #6c757d;
}

.empty-users-state .bi-people {
  opacity: 0.5;
}

/* Animation for new users */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Users list scrolling */
.users-list {
  max-height: 400px;
  overflow-y: auto;
}

.users-list::-webkit-scrollbar {
  width: 4px;
}

.users-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.users-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.users-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Mobile responsive adjustments for users */
@media (max-width: 767.98px) {
  .user-item {
    flex-direction: column;
    align-items: stretch !important;
  }

  .user-info {
    margin-bottom: 0.75rem;
  }

  .user-meta {
    justify-content: space-between;
    width: 100%;
  }

  .user-actions {
    margin-top: 0.5rem;
  }
}

@media (max-width: 575.98px) {
  .user-item {
    padding: 0.75rem !important;
    margin-bottom: 0.75rem;
  }

  .user-details .fw-bold {
    font-size: 0.9rem;
  }

  .user-details .small {
    font-size: 0.75rem;
  }
}
</style>
