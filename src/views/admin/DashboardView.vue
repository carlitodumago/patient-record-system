<template>
  <div class="container-fluid px-2 px-md-3 mt-3">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
      <div>
        <h1 class="mb-2 h3 h1-md">Admin Dashboard</h1>
        <p class="text-muted mb-0">System overview and management</p>
      </div>
    </div>
    
    <!-- Statistics Cards -->
    <div class="row g-3 g-md-4 mt-2">
      <div class="col-6 col-lg-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body d-flex justify-content-between align-items-center p-3">
            <div class="flex-grow-1">
              <h5 class="card-title mb-1 fs-4 fs-md-3">0</h5>
              <p class="card-text mb-0 small">Total Records</p>
            </div>
            <i class="bi bi-file-earmark-text fs-2 d-none d-sm-block opacity-75"></i>
          </div>
        </div>
      </div>
      
      <div class="col-6 col-lg-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body d-flex justify-content-between align-items-center p-3">
            <div class="flex-grow-1">
              <h5 class="card-title mb-1 fs-4 fs-md-3">0</h5>
              <p class="card-text mb-0 small">Total Patients</p>
            </div>
            <i class="bi bi-people fs-2 d-none d-sm-block opacity-75"></i>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card bg-info text-white h-100">
          <div class="card-body d-flex justify-content-between align-items-center p-3">
            <div class="flex-grow-1">
              <h5 class="card-title mb-1 fs-4 fs-md-3">0</h5>
              <p class="card-text mb-0 small">Staff Members</p>
            </div>
            <i class="bi bi-person-badge fs-2 d-none d-sm-block opacity-75"></i>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="card bg-warning text-dark h-100">
          <div class="card-body d-flex justify-content-between align-items-center p-3">
            <div class="flex-grow-1">
              <h5 class="card-title mb-1 fs-4 fs-md-3">0</h5>
              <p class="card-text mb-0 small">Pending Reviews</p>
            </div>
            <i class="bi bi-clock-history fs-2 d-none d-sm-block opacity-75"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row g-3 g-md-4 mt-3">
      <div class="col-12 col-xl-6 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
            <h5 class="mb-0">System Users</h5>
            <div class="d-flex align-items-center gap-2">
              <div class="users-status" :class="{ 'active': isUsersRealTimeActive }">
                <i class="bi bi-circle-fill"></i>
                <span class="small">{{ isUsersRealTimeActive ? 'Live' : 'Offline' }}</span>
              </div>
              <button 
                @click="showAddUserModal = true" 
                class="btn btn-sm btn-primary"
                title="Add new user"
              >
                <i class="bi bi-plus-circle me-1"></i> 
                <span class="d-none d-sm-inline">Add User</span>
                <span class="d-sm-none">Add</span>
              </button>
            </div>
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
                <div class="user-info d-flex align-items-center gap-3 flex-grow-1">
                  <div class="user-avatar">
                    <i class="bi bi-person-circle fs-4" :class="getUserAvatarClass(user.role)"></i>
                  </div>
                  <div class="user-details">
                    <div class="fw-bold">{{ user.name }}</div>
                    <div class="text-muted small">{{ user.email }}</div>
                  </div>
                </div>
                <div class="user-meta d-flex align-items-center gap-3">
                  <div class="text-center d-none d-md-block">
                    <div class="small text-muted">Role</div>
                    <span class="badge" :class="getRoleBadgeClass(user.role)">{{ user.role }}</span>
                  </div>
                  <div class="text-center d-none d-md-block">
                    <div class="small text-muted">Status</div>
                    <span class="badge" :class="user.status === 'active' ? 'bg-success' : 'bg-secondary'">
                      {{ user.status }}
                    </span>
                  </div>
                  <div class="user-actions">
                    <div class="btn-group btn-group-sm">
                      <button 
                        @click="editUser(user)" 
                        class="btn btn-outline-primary"
                        title="Edit user"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        @click="deleteUser(user.id)" 
                        class="btn btn-outline-danger"
                        title="Delete user"
                        :disabled="user.role === 'admin'"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <!-- Mobile view for role and status -->
                <div class="d-md-none w-100 mt-2 pt-2 border-top">
                  <div class="d-flex justify-content-between">
                    <span class="badge" :class="getRoleBadgeClass(user.role)">{{ user.role }}</span>
                    <span class="badge" :class="user.status === 'active' ? 'bg-success' : 'bg-secondary'">
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
              <p class="text-muted small mb-3">Add users to manage system access and permissions</p>
              <button 
                @click="showAddUserModal = true" 
                class="btn btn-primary btn-sm"
              >
                <i class="bi bi-plus-circle me-1"></i>
                Add First User
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-6 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">System Activity</h5>
            <div class="d-flex align-items-center gap-2">
              <div class="activity-status" :class="{ 'active': isRealTimeActive }">
                <i class="bi bi-circle-fill"></i>
                <span class="small">{{ isRealTimeActive ? 'Live' : 'Offline' }}</span>
              </div>
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
                    <i :class="getActivityIcon(activity.type)" class="activity-icon"></i>
                    <div class="fw-bold">{{ activity.title }}</div>
                  </div>
                  <div class="text-muted small mt-1">{{ activity.description }}</div>
                </div>
                <span class="text-muted small text-nowrap ms-2">{{ formatTimeAgo(activity.timestamp) }}</span>
              </div>
            </div>
            <div v-else class="empty-activity-state text-center py-5">
              <i class="bi bi-activity fs-1 text-muted mb-3"></i>
              <h6 class="text-muted">No Recent Activity</h6>
              <p class="text-muted small mb-0">System activities will appear here in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Settings -->
    <div class="row g-3 g-md-4 mt-3">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">System Settings</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <i class="bi bi-people-fill fs-1 text-primary mb-3"></i>
                    <h6 class="card-title">User Management</h6>
                    <p class="card-text small text-muted">Manage system users, roles, and permissions</p>
                    <button class="btn btn-sm btn-outline-primary w-100">Configure</button>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <i class="bi bi-cloud-arrow-up-fill fs-1 text-success mb-3"></i>
                    <h6 class="card-title">Backup & Restore</h6>
                    <p class="card-text small text-muted">Configure system backup settings and restore points</p>
                    <button class="btn btn-sm btn-outline-primary w-100">Configure</button>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6 col-lg-4">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <i class="bi bi-journal-text fs-1 text-info mb-3"></i>
                    <h6 class="card-title">System Logs</h6>
                    <p class="card-text small text-muted">View and export system activity logs</p>
                    <button class="btn btn-sm btn-outline-primary w-100">View Logs</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

// System activity state
const systemActivities = ref([]);
const isRealTimeActive = ref(true);
const activityUpdateInterval = ref(null);

// System users state
const systemUsers = ref([]);
const isUsersRealTimeActive = ref(true);
const showAddUserModal = ref(false);
const editingUser = ref(null);

// Activity types and their icons
const activityTypes = {
  login: 'bi bi-box-arrow-in-right text-success',
  logout: 'bi bi-box-arrow-right text-warning',
  patient_registered: 'bi bi-person-plus text-primary',
  record_updated: 'bi bi-file-earmark-text text-info',
  record_accessed: 'bi bi-eye text-secondary',
  system_backup: 'bi bi-cloud-arrow-up text-success',
  user_created: 'bi bi-person-add text-primary',
  settings_changed: 'bi bi-gear text-warning',
  error: 'bi bi-exclamation-triangle text-danger'
};

// Get current user from store
const currentUser = computed(() => store.state.user);

// Generate unique ID for activities
const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

// Format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - activityTime) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Get activity icon
const getActivityIcon = (type) => {
  return activityTypes[type] || 'bi bi-info-circle text-info';
};

// Add new activity
const addActivity = (type, title, description) => {
  const newActivity = {
    id: generateId(),
    type,
    title,
    description,
    timestamp: new Date(),
    isNew: true
  };
  
  // Add to beginning of array
  systemActivities.value.unshift(newActivity);
  
  // Remove 'new' flag after animation
  setTimeout(() => {
    newActivity.isNew = false;
  }, 2000);
  
  // Keep only last 50 activities
  if (systemActivities.value.length > 50) {
    systemActivities.value = systemActivities.value.slice(0, 50);
  }
};

// Clear all activities
const clearActivities = () => {
  systemActivities.value = [];
};

// Simulate real-time activities for demo purposes
const simulateActivity = () => {
  if (!isRealTimeActive.value) return;
  
  const activities = [
    {
      type: 'login',
      title: 'User login',
      description: `${currentUser.value?.fullName || 'User'} logged in`
    },
    {
      type: 'patient_registered',
      title: 'New patient registered',
      description: `Patient #${Math.floor(Math.random() * 10000)} registered`
    },
    {
      type: 'record_updated',
      title: 'Medical record updated',
      description: `Patient ID: ${Math.floor(Math.random() * 10000)}`
    },
    {
      type: 'record_accessed',
      title: 'Patient record accessed',
      description: `Patient ID: ${Math.floor(Math.random() * 10000)}`
    },
    {
      type: 'system_backup',
      title: 'System backup',
      description: 'Automatic backup completed'
    },
    {
      type: 'user_created',
      title: 'New user account created',
      description: 'Staff member account created'
    },
    {
      type: 'settings_changed',
      title: 'System settings updated',
      description: 'Configuration changes applied'
    }
  ];
  
  // Randomly select an activity
  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  addActivity(randomActivity.type, randomActivity.title, randomActivity.description);
};

// Start real-time updates
const startRealTimeUpdates = () => {
  isRealTimeActive.value = true;
  
  // Add initial login activity
  if (currentUser.value) {
    addActivity('login', 'Admin login', `${currentUser.value.fullName || 'Administrator'} logged in`);
  }
  
  // Set up interval for demo activities (every 10-30 seconds)
  activityUpdateInterval.value = setInterval(() => {
    // Random chance to add activity (30% chance every 5 seconds)
    if (Math.random() < 0.3) {
      simulateActivity();
    }
  }, 5000);
};

// Stop real-time updates
const stopRealTimeUpdates = () => {
  isRealTimeActive.value = false;
  if (activityUpdateInterval.value) {
    clearInterval(activityUpdateInterval.value);
    activityUpdateInterval.value = null;
  }
};

// Listen for store changes to add activities
const watchStoreChanges = () => {
  // Watch for patient additions
  store.subscribe((mutation, state) => {
    switch (mutation.type) {
      case 'addPatient':
        addActivity('patient_registered', 'New patient registered', 
          `${mutation.payload.firstName} ${mutation.payload.lastName}`);
        break;
      case 'updatePatient':
        addActivity('record_updated', 'Medical record updated', 
          `Patient ID: ${mutation.payload.id}`);
        break;
      case 'setAuthenticated':
        if (mutation.payload && state.user) {
          addActivity('login', 'User login', 
            `${state.user.fullName || state.user.username} logged in`);
        }
        break;
    }
  });
};

// User management functions
const getUserAvatarClass = (role) => {
  const classes = {
    admin: 'text-danger',
    nurse: 'text-primary',
    patient: 'text-success',
    staff: 'text-info'
  };
  return classes[role] || 'text-secondary';
};

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-danger',
    nurse: 'bg-primary',
    patient: 'bg-success',
    staff: 'bg-info'
  };
  return classes[role] || 'bg-secondary';
};

const addUser = (name, email, role, status = 'active') => {
  const newUser = {
    id: generateId(),
    name,
    email,
    role,
    status,
    createdAt: new Date(),
    isNew: true
  };
  
  systemUsers.value.unshift(newUser);
  
  // Remove 'new' flag after animation
  setTimeout(() => {
    newUser.isNew = false;
  }, 2000);
  
  // Add activity
  addActivity('user_created', 'New user created', `${name} (${role}) added to system`);
};

const editUser = (user) => {
  editingUser.value = { ...user };
  showAddUserModal.value = true;
};

const deleteUser = (userId) => {
  const userIndex = systemUsers.value.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    const user = systemUsers.value[userIndex];
    systemUsers.value.splice(userIndex, 1);
    addActivity('user_created', 'User removed', `${user.name} removed from system`);
  }
};

// Simulate adding users for demo
const simulateUserCreation = () => {
  const sampleUsers = [
    { name: 'Dr. Sarah Wilson', email: 'sarah.wilson@hospital.com', role: 'nurse' },
    { name: 'John Patient', email: 'john.patient@email.com', role: 'patient' },
    { name: 'Dr. Michael Chen', email: 'michael.chen@hospital.com', role: 'nurse' },
    { name: 'Admin User', email: 'admin@hospital.com', role: 'admin' },
    { name: 'Jane Smith', email: 'jane.smith@email.com', role: 'patient' }
  ];
  
  // Add current admin user first
  if (currentUser.value) {
    addUser(
      currentUser.value.fullName || 'Administrator',
      currentUser.value.email || 'admin@patientrecord.system',
      'admin',
      'active'
    );
  }
  
  // Randomly add users over time
  let userIndex = 0;
  const addRandomUser = () => {
    if (userIndex < sampleUsers.length && Math.random() < 0.4) {
      const user = sampleUsers[userIndex];
      addUser(user.name, user.email, user.role);
      userIndex++;
    }
  };
  
  // Add users periodically
  setInterval(addRandomUser, 8000);
};

onMounted(() => {
  // Initialize real-time activity monitoring
  startRealTimeUpdates();
  watchStoreChanges();
  
  // Initialize user simulation
  setTimeout(() => {
    simulateUserCreation();
  }, 2000);
  
  // Update time stamps every minute
  setInterval(() => {
    // Force reactivity update for time stamps
    systemActivities.value = [...systemActivities.value];
  }, 60000);
});

onUnmounted(() => {
  stopRealTimeUpdates();
});
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

/* System settings cards */
.card .card .card-body {
  padding: 1rem;
}

@media (min-width: 768px) {
  .card .card .card-body {
    padding: 1.5rem;
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

/* Activity status indicator */
.activity-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.activity-status.active {
  background-color: #d1e7dd;
  border-color: #badbcc;
  color: #0f5132;
}

.activity-status.active .bi-circle-fill {
  color: #198754;
  animation: pulse-dot 2s infinite;
}

.activity-status:not(.active) .bi-circle-fill {
  color: #6c757d;
}

@keyframes pulse-dot {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
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
  
  .activity-status {
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
  }
}

/* Users status indicator */
.users-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.users-status.active {
  background-color: #d1e7dd;
  border-color: #badbcc;
  color: #0f5132;
}

.users-status.active .bi-circle-fill {
  color: #198754;
  animation: pulse-dot 2s infinite;
}

.users-status:not(.active) .bi-circle-fill {
  color: #6c757d;
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
  .users-status {
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
  }
  
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