<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import RoleBasedSidebar from "../components/RoleBasedSidebar.vue";
import SidebarBackdrop from "../components/SidebarBackdrop.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isSidebarVisible = ref(true); // Default to visible for authenticated users
const isSidebarCollapsed = ref(false); // Default to not collapsed

// User authentication and profile data
const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

// Check if current route is login or register page
const hideSidebar = computed(() => {
  return route.path === "/login" || route.path === "/register";
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const handleSidebarToggle = (collapsed) => {
  isSidebarCollapsed.value = collapsed;
};

const toggleSidebarVisibility = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

const closeSidebar = () => {
  isSidebarVisible.value = false;
};

const navigateToProfile = () => {
  router.push("/profile");
};

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

// Enhanced keyboard navigation for navbar
const handleNavbarKeyDown = (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    navigateToProfile();
  }
};

// Focus management for better accessibility
const focusMainContent = () => {
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.focus();
  }
};
</script>

<template>
  <div class="app-container">
    <!-- Sidebar backdrop - Only shown when sidebar is visible on mobile -->
    <SidebarBackdrop
      :show="isSidebarVisible && !hideSidebar"
      @close="closeSidebar"
    />

    <!-- Role-Based Sidebar Component - Hidden for login and register pages -->
    <RoleBasedSidebar
      v-if="!hideSidebar"
      :isCollapsed="isSidebarCollapsed"
      :isVisible="isSidebarVisible"
      @toggle="handleSidebarToggle"
      @close="closeSidebar"
    />

    <!-- Main content -->
    <div
      class="main-content"
      :class="{
        'sidebar-visible': isSidebarVisible && !hideSidebar,
        'has-collapsed-sidebar':
          isSidebarCollapsed && isSidebarVisible && !hideSidebar,
      }"
    >
      <!-- Top navbar with animation -->
      <nav class="navbar navbar-expand-lg navbar-light animate-fade-in-down">
        <div
          class="container-fluid d-flex justify-content-between align-items-center"
        >
          <!-- Left side: Menu button with hover animation -->
          <div>
            <!-- Only show menu button if not on login/register pages -->
            <button
              v-if="!hideSidebar"
              @click="toggleSidebarVisibility"
              class="btn btn-link border-0 menu-toggle-btn"
              title="Toggle menu"
              style="min-height: 48px; min-width: 48px; padding: 12px"
            >
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
          <div
            v-if="isAuthenticated && !hideSidebar"
            class="d-flex align-center animate-fade-in-left"
          >
            <div class="profile-section">
              <div
                @click="navigateToProfile"
                @keydown="handleNavbarKeyDown"
                class="profile-picture-nav animate-fade-in"
                tabindex="0"
                role="button"
                :aria-label="`Go to profile for ${
                  user?.fullName || user?.username
                }`"
                style="min-height: 48px; padding: 8px 12px; cursor: pointer"
              >
                <div class="d-flex align-items-center">
                  <!-- Show profile picture if exists, otherwise show default icon -->
                  <div
                    v-if="user?.profilePicture"
                    class="profile-img-container"
                  >
                    <img
                      :src="user.profilePicture"
                      alt="Profile"
                      class="profile-img"
                    />
                  </div>
                  <div v-else class="profile-avatar">
                    <span>{{ user?.username?.[0]?.toUpperCase() || "U" }}</span>
                  </div>
                  <span class="ms-2 fw-medium">{{
                    user?.fullName || user?.username
                  }}</span>
                </div>
              </div>
              <button
                @click="handleLogout"
                class="btn btn-outline-danger btn-sm ms-3 logout-btn"
                title="Logout"
                style="min-height: 48px; padding: 8px 16px; font-size: 0.875rem"
              >
                <i class="bi bi-box-arrow-right me-1"></i>
                <span class="d-none d-sm-inline">Logout</span>
              </button>
            </div>
          </div>
          <!-- Empty div for balance when no profile is shown -->
          <div v-else></div>
        </div>
      </nav>

      <main
        id="main-content"
        class="container-fluid px-4 py-3"
        role="main"
        tabindex="-1"
        @focus="focusMainContent"
      >
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
  flex-direction: column;
}

.main-content {
  min-height: calc(100vh - 56px); /* Subtract footer height */
  background: var(--background-color);
  transition: all 0.3s ease;
  flex: 1;
  margin-left: 0; /* No margin by default when sidebar is hidden */
}

.main-content.sidebar-visible {
  margin-left: 280px; /* Space for visible sidebar */
  transition: margin-left 0.3s ease; /* Smooth transition */
}

.main-content.sidebar-visible.has-collapsed-sidebar {
  margin-left: 80px; /* Space for collapsed sidebar */
}

/* Enhanced responsive design */
@media (max-width: 479px) {
  .main-content.sidebar-visible {
    margin-left: 0; /* No margin on mobile - overlay behavior */
  }

  .main-content.sidebar-visible.has-collapsed-sidebar {
    margin-left: 0; /* No margin on mobile even when collapsed */
  }

  .navbar {
    padding: var(--space-xs) var(--space-sm);
  }

  .system-title {
    font-size: var(--font-size-sm);
    padding: var(--space-xs) var(--space-sm);
  }

  .profile-section {
    gap: var(--space-xs);
  }

  .profile-picture-nav {
    padding: var(--space-xs) var(--space-sm);
  }

  .logout-btn {
    min-height: var(--touch-target-min);
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-size-xs);
  }

  .logout-btn span {
    display: none; /* Hide text on very small screens */
  }

  .menu-toggle-btn {
    min-height: var(--touch-target-min);
    min-width: var(--touch-target-min);
    padding: var(--space-sm);
  }
}

/* Small devices (480px to 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .main-content.sidebar-visible {
    margin-left: 0; /* No margin on mobile - overlay behavior */
  }

  .main-content.sidebar-visible.has-collapsed-sidebar {
    margin-left: 0; /* No margin on mobile even when collapsed */
  }

  .navbar {
    padding: var(--space-sm) var(--space-md);
  }

  .system-title {
    font-size: var(--font-size-base);
    padding: var(--space-sm) var(--space-md);
  }

  .profile-section {
    gap: var(--space-sm);
  }

  .logout-btn {
    min-height: var(--touch-target-comfortable);
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-size-sm);
  }
}

main {
  min-height: calc(100vh - 170px); /* Subtract header and footer height */
}

/* Enhanced focus styles for main content */
main:focus {
  outline: none;
}

/* Tablet responsive behavior (768px to 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .main-content.sidebar-visible {
    margin-left: 80px; /* Collapsed sidebar width on tablet */
  }

  .main-content.sidebar-visible.has-collapsed-sidebar {
    margin-left: 60px; /* Partially collapsed on tablet */
  }

  .navbar {
    padding: var(--space-sm) var(--space-md);
  }

  .system-title {
    font-size: var(--font-size-lg);
    padding: var(--space-sm) var(--space-md);
  }

  .profile-section {
    gap: var(--space-sm);
  }

  .profile-picture-nav {
    padding: var(--space-sm) var(--space-md);
  }

  .logout-btn {
    font-size: var(--font-size-sm);
    padding: var(--space-sm) var(--space-md);
  }
}

/* Desktop responsive behavior (1024px and up) */
@media (min-width: 1024px) {
  .main-content.sidebar-visible {
    margin-left: 280px; /* Full sidebar width on desktop */
  }

  .main-content.sidebar-visible.has-collapsed-sidebar {
    margin-left: 80px; /* Collapsed sidebar width on desktop */
  }

  .navbar {
    padding: var(--space-md) var(--space-lg);
  }

  .system-title {
    font-size: var(--font-size-xl);
    padding: var(--space-md) var(--space-lg);
  }

  .profile-section {
    gap: var(--space-md);
  }

  .profile-picture-nav {
    padding: var(--space-md) var(--space-lg);
  }

  .logout-btn {
    font-size: var(--font-size-base);
    padding: var(--space-md) var(--space-lg);
  }
}

.footer {
  background: linear-gradient(
    135deg,
    var(--secondary-gradient-start),
    var(--secondary-gradient-end)
  );
  color: white;
  width: 100%;
  z-index: 10;
}

/* Menu button styling */
.btn-link {
  color: var(--primary-gradient-start);
  min-height: var(--touch-target-min, 44px);
  min-width: var(--touch-target-min, 44px);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-link:hover {
  color: var(--primary-gradient-end);
}

.menu-toggle-btn {
  min-height: var(--touch-target-comfortable, 48px);
  min-width: var(--touch-target-comfortable, 48px);
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-toggle-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.05);
}

.menu-toggle-btn:active {
  transform: scale(0.95);
}

.navbar {
  background-color: var(--light-color);
  color: var(--text-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(
    120deg,
    var(--primary-gradient-start) 0%,
    var(--primary-gradient-end) 100%
  );
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

.profile-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-picture-nav {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background-color 0.2s;
  min-height: var(--touch-target-comfortable, 48px);
}

.profile-picture-nav:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.logout-btn {
  font-size: 0.875rem;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: var(--touch-target-comfortable, 48px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs, 0.25rem);
}

.logout-btn:hover {
  background-color: var(--danger-color, #dc3545);
  border-color: var(--danger-color, #dc3545);
  color: white;
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
  background: linear-gradient(
    120deg,
    var(--primary-gradient-start) 0%,
    var(--primary-gradient-end) 100%
  );
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.system-title:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
</style>
