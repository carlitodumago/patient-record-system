<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

// Props
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
});

// Router
const router = useRouter();
const route = useRoute();

// Store
const authStore = useAuthStore();

// Reactive data
const isCollapsed = ref(false);

// Emits
const emit = defineEmits(["toggle", "close"]);

// Computed properties
const userRole = computed(() => authStore.userRole);
const user = computed(() => authStore.user);

// Sidebar navigation items based on role
const adminNavItems = [
  {
    title: "Dashboard",
    icon: "bi-speedometer2",
    route: "/admin",
    description: "Overview of system data",
  },
  {
    title: "Manage Staff",
    icon: "bi-people",
    route: "/admin/staff",
    description: "Healthcare staff management",
  },
  {
    title: "Manage Patients",
    icon: "bi-person-lines-fill",
    route: "/admin/patients",
    description: "Patient registration and records",
  },
  {
    title: "Appointments",
    icon: "bi-calendar-event",
    route: "/admin/appointments",
    description: "Appointment scheduling and management",
  },
  {
    title: "Medical Records",
    icon: "bi-file-medical",
    route: "/admin/medical-records",
    description: "Patient medical record oversight",
  },
  {
    title: "Notifications",
    icon: "bi-bell",
    route: "/admin/notifications",
    description: "System notifications and alerts",
  },
  {
    title: "Reports & Analytics",
    icon: "bi-bar-chart-line",
    route: "/admin/reports",
    description: "Clinic statistics and reporting",
  },
  {
    title: "Account Creation",
    icon: "bi-person-gear",
    route: "/admin/account-creation",
    description: "Create new user accounts",
  },
];

const nurseNavItems = [
  {
    title: "Dashboard",
    icon: "bi-speedometer2",
    route: "/nurse",
    description: "Daily overview and schedule",
  },
  {
    title: "Patient Management",
    icon: "bi-person",
    route: "/nurse/patient-management",
    description: "Patient information and care",
  },
  {
    title: "Medical Records",
    icon: "bi-file-medical",
    route: "/nurse/medical-records",
    description: "Create and manage patient records",
  },
  {
    title: "Appointment Requests",
    icon: "bi-calendar-check",
    route: "/nurse/appointment-requests",
    description: "Manage appointment requests",
  },
  {
    title: "Treatment & Diagnosis",
    icon: "bi-capsule",
    route: "/nurse/treatment-diagnosis",
    description: "Treatment protocols and guidelines",
  },
  {
    title: "Consultation Notes",
    icon: "bi-journal-text",
    route: "/nurse/consultation-notes",
    description: "Patient consultation documentation",
  },
  {
    title: "Notifications",
    icon: "bi-bell",
    route: "/nurse/notifications",
    description: "Personal notifications and alerts",
  },
];

const patientNavItems = [
  {
    title: "Dashboard",
    icon: "bi-speedometer2",
    route: "/patient",
    description: "Personal health overview",
  },
  {
    title: "My Appointments",
    icon: "bi-calendar-event",
    route: "/patient/appointments",
    description: "View and manage appointments",
  },
  {
    title: "My Medical Records",
    icon: "bi-file-medical",
    route: "/patient/medical-records",
    description: "Access personal medical records",
  },
  {
    title: "Notifications",
    icon: "bi-bell",
    route: "/patient/notifications",
    description: "Health reminders and alerts",
  },
];

// Get navigation items based on role
const navItems = computed(() => {
  switch (userRole.value) {
    case "admin":
      return adminNavItems;
    case "nurse":
      return nurseNavItems;
    case "patient":
      return patientNavItems;
    default:
      return [];
  }
});

// Methods
const navigateTo = (routePath) => {
  router.push(routePath);
};

const isActive = (routePath) => {
  return route.path === routePath;
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  emit("toggle", isCollapsed.value);
};
</script>

<template>
  <div
    class="role-based-sidebar"
    :class="{ collapsed: isCollapsed, visible: isVisible }"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div class="d-flex align-items-center">
        <div class="sidebar-logo me-3">
          <i class="bi bi-hospital text-white fs-4"></i>
        </div>
        <div v-if="!isCollapsed" class="sidebar-title">
          <h6 class="mb-0 text-white">Baan KM-3</h6>
          <small class="text-white-50">Health Center</small>
        </div>
      </div>
    </div>

    <!-- User Info -->
    <div class="sidebar-user mb-4">
      <div class="d-flex align-items-center">
        <div class="user-avatar me-3">
          <i class="bi bi-person-circle text-white fs-4"></i>
        </div>
        <div v-if="!isCollapsed" class="user-info">
          <div class="fw-medium text-white">
            {{ user?.fullName || user?.username || "User" }}
          </div>
          <small class="text-white-50 text-capitalize">{{ userRole }}</small>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <div v-for="item in navItems" :key="item.route" class="nav-item">
        <button
          class="nav-link w-100 text-start"
          :class="{ active: isActive(item.route) }"
          @click="navigateTo(item.route)"
        >
          <div class="nav-link-content">
            <div class="nav-icon me-3">
              <i
                :class="`${item.icon} ${
                  isActive(item.route) ? 'text-white' : 'text-white-50'
                }`"
              ></i>
            </div>
            <div v-if="!isCollapsed" class="nav-text">
              <div class="nav-title">{{ item.title }}</div>
              <small class="nav-description text-white-50">{{
                item.description
              }}</small>
            </div>
          </div>
        </button>
      </div>
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer mt-auto">
      <div class="d-flex flex-column gap-2">
        <button
          class="nav-link w-100 text-start text-danger-emphasis"
          @click="logout"
        >
          <div class="nav-link-content">
            <div class="nav-icon me-3">
              <i class="bi bi-box-arrow-right text-danger"></i>
            </div>
            <div v-if="!isCollapsed" class="nav-text">
              <div class="nav-title">Logout</div>
              <small class="nav-description text-white-50"
                >Sign out of your account</small
              >
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-based-sidebar {
  width: 280px;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--primary-gradient-start),
    var(--primary-gradient-end)
  );
  color: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(0); /* Visible by default */
}

.role-based-sidebar:not(.visible) {
  transform: translateX(-100%); /* Hide sidebar when not visible */
}

.role-based-sidebar.collapsed {
  width: 80px;
}

.role-based-sidebar.collapsed:not(.visible) {
  transform: translateX(-100%); /* Hide when collapsed and not visible */
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-title h6 {
  font-size: 1.1rem;
  font-weight: 600;
}

.sidebar-user {
  padding: 0 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  background: none;
  border: none;
  color: white;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-right: 3px solid white;
}

.nav-link-content {
  display: flex;
  align-items: center;
}

.nav-icon {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  flex: 1;
}

.nav-title {
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.1rem;
}

.nav-description {
  font-size: 0.75rem;
  opacity: 0.8;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .role-based-sidebar {
    width: 280px; /* Full width on mobile */
  }

  .role-based-sidebar.visible {
    transform: translateX(0); /* Show on mobile when visible */
  }

  .role-based-sidebar:not(.visible) {
    transform: translateX(-100%); /* Hide when not visible */
  }
}
</style>
