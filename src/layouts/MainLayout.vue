<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";
import TheSidebar from "./TheSidebar.vue";
import SidebarBackdrop from "../components/SidebarBackdrop.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isSidebarCollapsed = ref(false);
const isSidebarVisible = ref(false); // Default to hidden for a menu-style approach

// User authentication and profile data
const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

// Check if current route is login or register page
const hideSidebar = computed(() => {
  return (
    route.path === "/login" ||
    route.path === "/register" ||
    route.path === "/signin"
  );
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
  router.push("/profile");
};
</script>

<template>
  <div class="app-container">
    <!-- Skip link for keyboard navigation -->
    <a href="#main-content" class="admin-skip-link">Skip to main content</a>

    <!-- Sidebar backdrop - Only shown when sidebar is visible on mobile -->
    <SidebarBackdrop
      :show="isSidebarVisible && !hideSidebar"
      @close="closeSidebar"
      aria-label="Close sidebar"
      role="button"
      tabindex="0"
      @keydown.escape="closeSidebar"
      @keydown.enter="closeSidebar"
    />

    <!-- Sidebar Component - Hidden for login and register pages -->
    <TheSidebar
      v-if="!hideSidebar"
      :isSidebarCollapsed="isSidebarCollapsed"
      :isVisible="isSidebarVisible"
      @toggle-sidebar="toggleSidebar"
      @close-sidebar="closeSidebar"
      aria-label="Main navigation"
      role="navigation"
      aria-expanded="isSidebarVisible"
    />

    <!-- Main content -->
    <div
      :class="[
        'main-content',
        {
          'sidebar-visible': isSidebarVisible && !isSidebarCollapsed,
          'sidebar-collapsed': isSidebarVisible && isSidebarCollapsed,
        },
      ]"
      id="main-content"
      role="main"
      aria-label="Main content area"
    >
      <!-- Top navbar with animation -->
      <nav
        class="navbar navbar-expand-lg navbar-light animate-fade-in-down"
        role="banner"
        aria-label="Application header"
      >
        <div class="container-fluid navbar-content">
          <!-- Left side: Menu button with hover animation -->
          <div class="navbar-left">
            <!-- Only show menu button if not on login/register pages -->
            <button
              v-if="!hideSidebar"
              @click="toggleSidebarVisibility"
              class="btn btn-link border-0 menu-toggle-btn admin-focus-visible"
              :aria-label="
                isSidebarVisible
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
              "
              :aria-expanded="isSidebarVisible"
              :aria-controls="isSidebarVisible ? 'main-navigation' : undefined"
              title="Toggle navigation menu"
              @keydown.escape="isSidebarVisible && closeSidebar()"
            >
              <i class="bi bi-list fs-4" aria-hidden="true"></i>
              <span class="admin-sr-only">{{
                isSidebarVisible ? "Close menu" : "Open menu"
              }}</span>
            </button>
          </div>

          <!-- Center: App name with hover animation -->
          <div class="navbar-center">
            <div class="system-title animate-fade-in">
              <i
                class="bi bi-hospital me-2 animate-pulse"
                aria-hidden="true"
              ></i>
              <span class="title-text d-none d-sm-inline"
                >Patient Record System</span
              >
              <span class="title-text d-sm-none">PRS</span>
            </div>
          </div>

          <!-- Right side: Profile picture (only for authenticated users) -->
          <div class="navbar-right">
            <div
              v-if="isAuthenticated && !hideSidebar"
              class="d-flex align-items-center animate-fade-in-left"
            >
              <div
                @click="navigateToProfile"
                class="profile-picture-nav animate-fade-in admin-focus-visible"
                role="button"
                tabindex="0"
                @keydown.enter="navigateToProfile"
                @keydown.space.prevent="navigateToProfile"
                :aria-label="`Go to profile page for ${
                  user?.fullName || user?.username
                }`"
                @keydown.escape="closeSidebar"
              >
                <div class="d-flex align-items-center">
                  <!-- Show profile picture if exists, otherwise show default icon -->
                  <div
                    v-if="user?.profilePicture"
                    class="profile-img-container"
                  >
                    <img
                      :src="user.profilePicture"
                      alt="Profile picture"
                      class="profile-img"
                      loading="lazy"
                    />
                  </div>
                  <div v-else class="profile-avatar">
                    <span>{{ user?.username?.[0]?.toUpperCase() || "U" }}</span>
                  </div>
                  <span class="ms-2 fw-medium d-none d-md-inline">{{
                    user?.fullName || user?.username
                  }}</span>
                </div>
              </div>
            </div>
          </div>
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

      <!-- Footer -->
      <footer class="footer mt-auto" v-if="!hideSidebar">
        <div class="container-fluid px-4 py-3">
          <div class="row align-items-center">
            <div class="col-12 text-center">
              <small class="text-white-50">
                © 2024 Patient Record Management System. All rights reserved.
              </small>
            </div>
          </div>
        </div>
      </footer>
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
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Desktop styles */
@media (min-width: 1024px) {
  .main-content.sidebar-visible {
    margin-left: 240px;
  }

  .main-content.sidebar-collapsed {
    margin-left: 70px;
  }
}

/* Tablet styles */
@media (min-width: 768px) and (max-width: 1023px) {
  .main-content.sidebar-visible {
    margin-left: 200px;
  }

  .main-content.sidebar-collapsed {
    margin-left: 60px;
  }
}

/* Mobile styles */
@media (max-width: 767px) {
  .main-content {
    margin-left: 0 !important;
    padding-top: 0; /* Navbar is now inside main-content */
  }

  .navbar {
    position: sticky;
    top: 0;
    z-index: 100;
  }
}

main {
  min-height: calc(100vh - 220px); /* Subtract navbar and footer height */
  padding: 2rem 1rem;
  padding-bottom: 2rem;
  flex: 1;
}

/* Responsive main content */
@media (max-width: 767px) {
  main {
    min-height: calc(100vh - 160px);
    padding: 1rem 0.75rem;
    padding-top: 1.5rem; /* Space for navbar */
    padding-bottom: 3rem;
  }

  .container-fluid {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  main {
    padding: 1.5rem 1rem;
  }
}

.footer {
  background: linear-gradient(
    135deg,
    var(--secondary-gradient-start) 0%,
    var(--secondary-gradient-end) 50%,
    var(--admin-primary) 100%
  );
  color: white;
  width: 100%;
  z-index: 10;
  margin-top: auto;
  position: relative;
  overflow: hidden;
}

.footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
}

.footer .container-fluid {
  position: relative;
  z-index: 2;
}

.footer small {
  opacity: 0.9;
  font-weight: 400;
  letter-spacing: 0.25px;
  transition: opacity 0.3s ease;
}

.footer:hover small {
  opacity: 1;
}

/* Responsive footer */
@media (max-width: 767px) {
  .footer {
    font-size: 0.875rem;
  }

  .footer .container-fluid {
    padding: 1rem 0.75rem;
  }
}

/* Menu button styling */
.btn-link {
  color: var(--primary-gradient-start);
}

.btn-link:hover {
  color: var(--primary-gradient-end);
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  color: var(--text-color);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

/* Dark mode navbar */
@media (prefers-color-scheme: dark) {
  .navbar {
    background: rgba(15, 23, 42, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.navbar.scrolled {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.12);
}

@media (prefers-color-scheme: dark) {
  .navbar.scrolled {
    background: rgba(15, 23, 42, 0.98);
  }
}

.navbar-brand {
  color: var(--text-color);
}

/* Mobile navbar improvements */
@media (max-width: 767px) {
  .navbar {
    padding: 0.5rem 1rem;
    min-height: 60px;
  }

  .navbar-content {
    min-height: 60px;
    align-items: center;
  }

  .system-title {
    padding: 0.25rem 0.5rem;
  }

  .title-text {
    font-size: 1rem !important;
  }

  .profile-picture-nav {
    padding: 0.25rem 0.5rem;
  }
}

/* Tablet navbar improvements */
@media (min-width: 768px) and (max-width: 1023px) {
  .navbar {
    padding: 0.75rem 1.5rem;
  }

  .title-text {
    font-size: 1.1rem !important;
  }
}

/* Enhanced System title styling */
.system-title {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: var(--admin-radius-xl);
  background: linear-gradient(
    135deg,
    var(--primary-gradient-start) 0%,
    var(--primary-gradient-end) 50%,
    var(--admin-secondary) 100%
  );
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(37, 99, 235, 0.15);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.system-title::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s;
}

.system-title:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(37, 99, 235, 0.25);
}

.system-title:hover::before {
  left: 100%;
}

.system-title i {
  font-size: 1.25rem;
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  animation: admin-float 4s ease-in-out infinite;
}

.title-text {
  font-weight: 600;
  font-size: 1.2rem;
  background: linear-gradient(to right, #ffffff, #f8f9fa, #ffffff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  letter-spacing: 0.5px;
  position: relative;
}

/* Enhanced title text effects */
@media (min-width: 768px) {
  .title-text {
    font-size: 1.3rem;
    background: linear-gradient(
      to right,
      #ffffff 0%,
      #f8f9fa 30%,
      #ffffff 60%,
      #f8f9fa 100%
    );
    background-size: 200% auto;
    animation: admin-shimmer 3s linear infinite;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
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

/* Navbar content layout */
.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.navbar-left {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.navbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
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

/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Enhanced Animation classes */
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.animate-fade-in-left {
  animation: fadeInLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.animate-pulse {
  animation: admin-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce-in {
  animation: admin-bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.animate-slide-up {
  animation: admin-slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
