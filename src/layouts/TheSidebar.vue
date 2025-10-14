<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useRouter } from 'vue-router';

const props = defineProps({
  isSidebarCollapsed: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-sidebar', 'close-sidebar']);

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

// Get unread notification count
const unreadNotificationCount = computed(() => notificationStore.unreadCount);

const userRole = computed(() => authStore.user?.role);

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

const toggleSidebar = () => {
  emit('toggle-sidebar');
};

const closeSidebar = () => {
  emit('close-sidebar');
};
</script>

<template>
  <div :class="['sidebar', {'collapsed': isSidebarCollapsed, 'visible': isVisible}]">
    <div class="sidebar-header">
      <h3 class="text-white mb-0">
        <router-link to="/dashboard" class="text-white text-decoration-none" @click="closeSidebar">
          <i class="bi bi-hospital me-2"></i>
          <span v-if="!isSidebarCollapsed">Patient Record System</span>
        </router-link>
      </h3>
      <button @click="closeSidebar" class="btn btn-link text-white">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    
    <div class="sidebar-content">
      <!-- Main navigation links -->
      <ul class="nav flex-column main-nav">
        <template v-if="isAuthenticated">
          <!-- Admin menu -->
          <template v-if="userRole === 'admin'">
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/admin/dashboard" @click="closeSidebar">
                <i class="bi bi-house-door me-2"></i>
                <span v-if="!isSidebarCollapsed">Dashboard</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/admin/manage-patients" @click="closeSidebar">
                <i class="bi bi-person-lines-fill me-2"></i>
                <span v-if="!isSidebarCollapsed">Manage Patients</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/admin/appointments" @click="closeSidebar">
                <i class="bi bi-calendar-event me-2"></i>
                <span v-if="!isSidebarCollapsed">Appointments</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/admin/medical-records" @click="closeSidebar">
                <i class="bi bi-clipboard2-pulse me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical Records</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white notification-link" to="/admin/notifications" @click="closeSidebar">
                <i class="bi bi-bell me-2"></i>
                <span v-if="!isSidebarCollapsed">Notifications</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/admin/reports" @click="closeSidebar">
                <i class="bi bi-bar-chart me-2"></i>
                <span v-if="!isSidebarCollapsed">Reports & Analytics</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/admin/account-creation" @click="closeSidebar">
                <i class="bi bi-person-plus me-2"></i>
                <span v-if="!isSidebarCollapsed">Account Creation</span>
              </router-link>
            </li>
          </template>
          <!-- Nurse/Clinic Staff menu -->
          <template v-else-if="userRole === 'nurse'">
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/nurse/dashboard" @click="closeSidebar">
                <i class="bi bi-house-door me-2"></i>
                <span v-if="!isSidebarCollapsed">Dashboard</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/nurse/patient-management" @click="closeSidebar">
                <i class="bi bi-people me-2"></i>
                <span v-if="!isSidebarCollapsed">Patient Management</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/nurse/medical-records" @click="closeSidebar">
                <i class="bi bi-clipboard2-pulse me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical Records</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/nurse/appointment-requests" @click="closeSidebar">
                <i class="bi bi-calendar-event me-2"></i>
                <span v-if="!isSidebarCollapsed">Appointment Requests</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/nurse/treatment-diagnosis" @click="closeSidebar">
                <i class="bi bi-activity me-2"></i>
                <span v-if="!isSidebarCollapsed">Treatment & Diagnosis</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/nurse/consultation-notes" @click="closeSidebar">
                <i class="bi bi-journal-text me-2"></i>
                <span v-if="!isSidebarCollapsed">Consultation Notes</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white notification-link" to="/nurse/notifications" @click="closeSidebar">
                <i class="bi bi-bell me-2"></i>
                <span v-if="!isSidebarCollapsed">Notifications</span>
              </router-link>
            </li>
          </template>
          <!-- Removed legacy employee menu as it's no longer needed -->
          <!-- Patient menu -->
          <template v-else-if="userRole === 'patient'">
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/patient/dashboard" @click="closeSidebar">
                <i class="bi bi-house-door me-2"></i>
                <span v-if="!isSidebarCollapsed">Dashboard</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/patient/medical-records" @click="closeSidebar">
                <i class="bi bi-clipboard2-pulse me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical Records</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/patient/appointments" @click="closeSidebar">
                <i class="bi bi-calendar-check me-2"></i>
                <span v-if="!isSidebarCollapsed">Appointments</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white notification-link" to="/patient/notifications" @click="closeSidebar">
                <i class="bi bi-bell me-2"></i>
                <span v-if="!isSidebarCollapsed">
                  Notifications
                  <span v-if="unreadNotificationCount > 0" class="badge bg-danger notification-badge">
                    {{ unreadNotificationCount > 99 ? '99+' : unreadNotificationCount }}
                  </span>
                </span>

                <span v-else-if="unreadNotificationCount > 0" class="badge bg-danger notification-badge-collapsed">
                  {{ unreadNotificationCount > 99 ? '99+' : unreadNotificationCount }}
                </span>
              </router-link>
            </li>
          </template>
        </template>
        
        <!-- Spacer to push profile to bottom (if needed) -->
        <li class="flex-grow-1"></li>
      </ul>
      
      <!-- Bottom user profile and logout section -->
      <div class="user-nav-container" v-if="isAuthenticated">
        <ul class="nav flex-column user-nav">
          <li class="nav-item">
            <div class="nav-link text-white user-info">
              <!-- Show profile picture if exists, otherwise show default icon -->
              <div v-if="user?.profilePicture" class="sidebar-profile-img">
                <img :src="user.profilePicture" alt="Profile" class="img-fluid rounded-circle">
              </div>
              <i v-else class="bi bi-person-circle me-2"></i>
              <span v-if="!isSidebarCollapsed">{{ user?.fullName || user?.username }}</span>
            </div>
          </li>
          <li class="nav-item">
            <button @click="logout" class="nav-link text-white w-100 text-start border-0 bg-transparent">
              <i class="bi bi-box-arrow-right me-2"></i>
              <span v-if="!isSidebarCollapsed">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  height: 100vh; /* Ensure full height */
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden; /* Prevent scrolling of the sidebar itself */
  transform: translateX(-100%); /* Hide by default */
}

.sidebar.visible {
  transform: translateX(0); /* Show when visible */
  animation: slideIn 0.3s ease forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0.5;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0; /* Prevent header from shrinking */
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px); /* subtract header height */
  overflow: hidden;
  position: relative;
}

.main-nav {
  flex: 1;
  overflow-y: auto; /* Allow scrolling of main navigation */
  padding-bottom: 20px; /* Add some space at the bottom */
  display: flex;
  flex-direction: column;
}

.user-nav-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-nav {
  width: 100%;
}

.sidebar .nav {
  display: flex;
  flex-direction: column;
}

.sidebar .nav-link {
  padding: 12px 15px;
  white-space: nowrap;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  color: #ffffff; /* Ensure text is white */
  display: flex; /* Use flexbox for alignment */
  align-items: center; /* Vertically align items */
}

.sidebar .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 3px solid var(--accent-color);
}

.sidebar .nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  border-left: 3px solid var(--accent-color);
}

.user-info {
  background-color: rgba(0, 0, 0, 0.1); /* Darker background for user info */
  display: flex;
  align-items: center;
  padding: 12px 15px;
}

.sidebar-profile-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sidebar-profile-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Notification styling */
.notification-link {
  position: relative;
}

.notification-badge {
  font-size: 0.65rem;
  margin-left: 5px;
  vertical-align: middle;
  background-color: #dc3545; /* Bootstrap danger color */
}

.notification-badge-collapsed {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 0.65rem;
  padding: 0.15rem 0.35rem;
  background-color: #dc3545; /* Bootstrap danger color */
}

@media (max-width: 992px) {
  .sidebar {
    width: 240px; /* Keep the menu width consistent on mobile */
  }
  
  .sidebar.collapsed {
    width: 70px;
  }
}

/* Add styles for the icons on the right */
.nav-link i:last-child:not(.me-2) {
    margin-left: auto; /* Push the last icon to the right */
}

</style>