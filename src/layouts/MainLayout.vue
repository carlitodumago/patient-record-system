<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import TheSidebar from './TheSidebar.vue';
import SidebarBackdrop from '../components/SidebarBackdrop.vue';

const route = useRoute();
const router = useRouter();
const store = useStore();
const isSidebarCollapsed = ref(false);
const isSidebarVisible = ref(false); // Default to hidden for a menu-style approach

// User authentication and profile data
const isAuthenticated = computed(() => store.state.isAuthenticated);
const user = computed(() => store.state.user);

// Check if current route is login or register page
const hideSidebar = computed(() => {
  return route.path === '/login' || route.path === '/register';
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const toggleSidebarVisibility = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

const closeSidebar = () => {
  isSidebarVisible.value = false;
};

const navigateToProfile = () => {
  router.push('/profile');
};
</script>

<template>
  <div class="app-container">
    <!-- Sidebar backdrop - Only shown when sidebar is visible on mobile -->
    <SidebarBackdrop 
      :show="isSidebarVisible && !hideSidebar" 
      @close="closeSidebar"
    />
    
    <!-- Sidebar Component - Hidden for login and register pages -->
    <TheSidebar 
      v-if="!hideSidebar"
      :isSidebarCollapsed="isSidebarCollapsed"
      :isVisible="isSidebarVisible"
      @toggle-sidebar="toggleSidebar" 
      @close-sidebar="closeSidebar"
    />
    
    <!-- Main content -->
    <div :class="['main-content', {
      'sidebar-visible': isSidebarVisible && !isSidebarCollapsed,
      'sidebar-collapsed': isSidebarVisible && isSidebarCollapsed
    }]">
      <!-- Top navbar with animation -->
      <nav class="navbar navbar-expand-lg navbar-light animate-fade-in-down">
        <div class="container-fluid d-flex justify-content-between align-items-center">
          <!-- Left side: Menu button with hover animation -->
          <div>
            <!-- Only show menu button if not on login/register pages -->
            <button v-if="!hideSidebar" 
                    @click="toggleSidebarVisibility" 
                    class="btn btn-link border-0 menu-toggle-btn"
                    title="Toggle menu">
              <i class="bi bi-list fs-4"></i>
            </button>
          </div>
          
          <!-- Center: App name with hover animation -->
          <div>
            <div class="system-title animate-fade-in">
              <i class="bi bi-hospital me-2 animate-pulse"></i>
              <span class="title-text">Patient Record System</span>
            </div>
          </div>
          
          <!-- Right side: Profile picture (only for authenticated users) -->
          <div v-if="isAuthenticated && !hideSidebar" class="d-flex align-items-center animate-fade-in-left">
            <div @click="navigateToProfile" class="profile-picture-nav animate-fade-in">
              <div class="d-flex align-items-center">
                <!-- Show profile picture if exists, otherwise show default icon -->
                <div v-if="user?.profilePicture" class="profile-img-container">
                  <img :src="user.profilePicture" alt="Profile" class="profile-img">
                </div>
                <div v-else class="profile-avatar">
                  <span>{{ user?.username?.[0]?.toUpperCase() || 'U' }}</span>
                </div>
                <span class="ms-2 fw-medium">{{ user?.fullName || user?.username }}</span>
              </div>
            </div>
          </div>
          <!-- Empty div for balance when no profile is shown -->
          <div v-else></div>
        </div>
      </nav>
      
      <main class="container-fluid px-4 py-3">
        <!-- Router view with animation -->
        <router-view v-slot="{ Component }">
          <transition name="page" appear>
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
}

.main-content {
  min-height: 100vh;
  background: var(--background-color);
  transition: margin-left 0.3s ease;
  flex: 1;
  margin-left: 0;
  width: 100%;
}

/* Adjust main content when sidebar is visible */
.main-content.sidebar-visible {
  margin-left: 240px;
}

.main-content.sidebar-collapsed {
  margin-left: 70px;
}

main {
  min-height: calc(100vh - 170px); /* Subtract header and footer height */
}

.footer {
  background: linear-gradient(135deg, var(--secondary-gradient-start), var(--secondary-gradient-end));
  color: white;
  width: 100%;
  z-index: 10;
}

/* Menu button styling */
.btn-link {
  color: var(--primary-gradient-start);
}

.btn-link:hover {
  color: var(--primary-gradient-end);
}

.navbar {
  background-color: var(--light-color);
  color: var(--text-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: background-color 0.3s, color 0.3s;
}

.navbar-brand {
  color: var(--text-color);
}

/* System title styling */
.system-title {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  background: linear-gradient(120deg, var(--primary-gradient-start) 0%, var(--primary-gradient-end) 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.system-title:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.system-title i {
  font-size: 1.25rem;
  color: white;
}

.title-text {
  font-weight: 600;
  font-size: 1.2rem;
  background: linear-gradient(to right, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}

/* Profile picture in navbar styling */
.profile-nav-item {
  margin-left: auto;
}

.profile-picture-nav {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 20px;
  transition: background-color 0.2s;
}

.profile-picture-nav:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.profile-img-container {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-gradient-start);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  font-weight: 500;
}

/* Menu button animation */
.menu-toggle-btn {
  position: relative;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.menu-toggle-btn:hover {
  transform: scale(1.1);
}

.menu-toggle-btn:active {
  transform: scale(0.95);
}

/* System title animation enhancement */
.system-title {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  background: linear-gradient(120deg, var(--primary-gradient-start) 0%, var(--primary-gradient-end) 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.system-title:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
</style> 