<script setup>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
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

const store = useStore();
const router = useRouter();

const isAuthenticated = computed(() => store.state.isAuthenticated);
const user = computed(() => store.state.user);

// Get user role from store instead of localStorage
const userRole = computed(() => store.state.user?.role || null);

// Get unread notification count
const unreadNotificationCount = computed(() => {
  return store.state.notifications.filter(n => !n.read).length;
});

const systemSettingsExpanded = ref(false);

const logout = async () => {
  try {
    // Import supabase for logout
    const { supabase } = await import('@/services/supabase');
    await supabase.auth.signOut();
    
    // Clear any remaining localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Update store
    store.commit('setAuthenticated', false);
    store.commit('setUser', null);
    
    // Redirect to login
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // Fallback: clear local state and redirect anyway
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    store.commit('setAuthenticated', false);
    store.commit('setUser', null);
    router.push('/login');
  }
};

const toggleSidebar = () => {
  emit('toggle-sidebar');
};

const closeSidebar = () => {
  emit('close-sidebar');
};

const toggleSystemSettings = () => {
  systemSettingsExpanded.value = !systemSettingsExpanded.value;
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
              <router-link class="nav-link text-white" to="/dashboard" @click="closeSidebar">
                <i class="bi bi-person-badge me-2"></i>
                <span v-if="!isSidebarCollapsed">Admin Dashboard</span>
                <i v-if="!isSidebarCollapsed" class="bi bi-grid-fill ms-auto"></i>
              </router-link>
            </li>
            <li class="nav-item">
              <div class="nav-link text-white system-settings-toggle" @click="toggleSystemSettings" v-if="!isSidebarCollapsed">
                <i class="bi bi-gear-fill me-2"></i>
                <span>System Settings</span>
                <i class="bi ms-auto" :class="systemSettingsExpanded ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
              </div>
              <router-link v-else class="nav-link text-white" to="/settings" @click="closeSidebar">
                <i class="bi bi-gear-fill me-2"></i>
              </router-link>
              
              <!-- System Settings Submenu -->
              <ul v-if="systemSettingsExpanded && !isSidebarCollapsed" class="nav flex-column submenu">
                <li class="nav-item">
                  <router-link class="nav-link text-white submenu-link" to="/admin/user-management" @click="closeSidebar">
                    <i class="bi bi-people-fill me-2"></i>
                    <span>User Management</span>
                  </router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link text-white submenu-link" to="/admin/backup-restore" @click="closeSidebar">
                    <i class="bi bi-cloud-arrow-up me-2"></i>
                    <span>Backup & Restore</span>
                  </router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link text-white submenu-link" to="/admin/system-logs" @click="closeSidebar">
                    <i class="bi bi-file-text me-2"></i>
                    <span>System Logs</span>
                  </router-link>
                </li>
              </ul>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/records" @click="closeSidebar">
                <i class="bi bi-clipboard2-pulse me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical Records</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/register" @click="closeSidebar">
                <i class="bi bi-person-plus me-2"></i>
                <span v-if="!isSidebarCollapsed">Register Account</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/patients" @click="closeSidebar">
                <i class="bi bi-people me-2"></i>
                <span v-if="!isSidebarCollapsed">Patient List</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/visits" @click="closeSidebar">
                <i class="bi bi-calendar-check me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical Visits</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/history" @click="closeSidebar">
                <i class="bi bi-clock-history me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical History</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white notification-link" to="/notifications" @click="closeSidebar">
                <i class="bi bi-bell me-2"></i>
                <span v-if="!isSidebarCollapsed">Notifications</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/calendar" @click="closeSidebar">
                <i class="bi bi-calendar me-2"></i>
                <span v-if="!isSidebarCollapsed">Calendar</span>
              </router-link>
            </li>
          </template>
          <!-- Nurse/Clinic Staff menu -->
          <template v-else-if="userRole === 'nurse'">
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/dashboard" @click="closeSidebar">
                <i class="bi bi-briefcase-medical me-2"></i>
                <span v-if="!isSidebarCollapsed">Dashboard</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/patients" @click="closeSidebar">
                <i class="bi bi-people me-2"></i>
                <span v-if="!isSidebarCollapsed">Patient List</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/records" @click="closeSidebar">
                <i class="bi bi-clipboard2-pulse me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical Records</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/visits" @click="closeSidebar">
                <i class="bi bi-calendar-check me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical Visits</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/history" @click="closeSidebar">
                <i class="bi bi-clock-history me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical History</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white notification-link" to="/notifications" @click="closeSidebar">
                <i class="bi bi-bell me-2"></i>
                <span v-if="!isSidebarCollapsed">Notifications</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/calendar" @click="closeSidebar">
                <i class="bi bi-calendar me-2"></i>
                <span v-if="!isSidebarCollapsed">Calendar</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/settings" @click="closeSidebar">
                <i class="bi bi-gear me-2"></i>
                <span v-if="!isSidebarCollapsed">Settings</span>
              </router-link>
            </li>
          </template>
          <!-- Removed legacy employee menu as it's no longer needed -->
          <!-- Patient menu -->
          <template v-else-if="userRole === 'patient'">
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/records" @click="closeSidebar">
                <i class="bi bi-clipboard2-pulse me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical Records</span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/visits" @click="closeSidebar">
                <i class="bi bi-calendar-check me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical Appointment</span>
                
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/history" @click="closeSidebar">
                <i class="bi bi-clock-history me-2"></i>
                <span v-if="!isSidebarCollapsed">Medical History</span>
                
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white notification-link" to="/notifications" @click="closeSidebar">
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
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/calendar" @click="closeSidebar">
                <i class="bi bi-calendar me-2"></i>
                <span v-if="!isSidebarCollapsed">Calendar</span>
                
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link text-white" to="/settings" @click="closeSidebar">
                <i class="bi bi-gear me-2"></i>
                <span v-if="!isSidebarCollapsed">Settings</span>
                
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

/* System Settings Toggle */
.system-settings-toggle {
  cursor: pointer;
  user-select: none;
}

.system-settings-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 3px solid var(--accent-color);
}

/* Submenu Styles */
.submenu {
  background-color: rgba(0, 0, 0, 0.2);
  margin: 0;
  padding: 0;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  margin-left: 15px;
  animation: slideDown 0.3s ease-out;
}

.submenu-link {
  padding: 8px 15px 8px 20px !important;
  font-size: 0.9rem;
  border-left: 2px solid transparent !important;
}

.submenu-link:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border-left: 2px solid var(--accent-color) !important;
}

.submenu-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-left: 2px solid var(--accent-color) !important;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 200px;
    transform: translateY(0);
  }
}

</style>