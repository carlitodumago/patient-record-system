import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/Register.vue"),
  },

  {
    path: "/patients",
    name: "PatientList",
    component: () => import("../views/PatientList.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/patients/new",
    name: "AddPatient",
    component: () => import("../views/PatientForm.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/patients/:id",
    name: "PatientDetails",
    component: () => import("../views/PatientDetails.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/patients/:id/edit",
    name: "EditPatient",
    component: () => import("../views/PatientForm.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/patients/:id/records",
    name: "PatientMedicalRecords",
    component: () => import("../views/PatientMedicalRecords.vue"),
    meta: {
      requiresAuth: true,
      allowedRoles: ["admin", "nurse", "staff"],
    },
  },

  {
    path: "/records",
    name: "MedicalRecords",
    component: () => {
      // Dynamically import the correct component based on user role
      const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : { role: "patient" };
      const role = user.role || "patient";

      // Map role to component path
      if (role === "admin") {
        return import("../views/admin/MedicalRecords.vue");
      } else if (role === "nurse") {
        return import("../views/nurse/MedicalRecords.vue");
      } else {
        return import("../views/patient/MedicalRecords.vue");
      }
    },
    meta: { requiresAuth: true },
  },

  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("../views/Notifications.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("../views/CalendarView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "UserProfile",
    component: () => import("../views/UserProfile.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../views/Settings.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => {
      // Dynamically import the correct component based on user role
      const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : { role: "patient" };
      const role = user.role || "patient";

      // Map role to component path
      if (role === "admin") {
        return import("../views/admin/DashboardView.vue");
      } else if (role === "nurse") {
        return import("../views/nurse/DashboardView.vue");
      } else {
        return import("../views/patient/DashboardView.vue");
      }
    },
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/users",
    name: "UserManagement",
    component: () => import("../views/admin/UserManagement.vue"),
    meta: {
      requiresAuth: true,
      allowedRoles: ["admin"],
      requiredPermission: "users.create",
    },
  },
  {
    path: "/admin/staff",
    name: "StaffManagement",
    component: () => import("../views/admin/StaffManagement.vue"),
    meta: {
      requiresAuth: true,
      allowedRoles: ["admin"],
      requiredPermission: "staff.read",
    },
  },
  {
    path: "/admin/appointments",
    name: "AppointmentManagement",
    component: () => import("../views/admin/AppointmentManagement.vue"),
    meta: {
      requiresAuth: true,
      allowedRoles: ["admin", "nurse"],
      requiredPermission: "appointments.read",
    },
  },
  {
    path: "/admin/medical-records",
    name: "MedicalRecordsManagement",
    component: () => import("../views/admin/MedicalRecordsManagement.vue"),
    meta: {
      requiresAuth: true,
      allowedRoles: ["admin", "nurse"],
      requiredPermission: "medical_records.read",
    },
  },
  {
    path: "/admin/reports",
    name: "ReportsDashboard",
    component: () => import("../views/admin/ReportsDashboard.vue"),
    meta: {
      requiresAuth: true,
      allowedRoles: ["admin"],
      requiredPermission: "reports.read",
    },
  },
  // 404 Not Found route - should be the last route
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for auth and role-based access
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next("/login");
      return;
    }

    // Check allowed roles
    if (
      to.meta.allowedRoles &&
      !to.meta.allowedRoles.includes(authStore.role)
    ) {
      next("/dashboard");
      return;
    }

    // Check required permissions
    if (
      to.meta.requiredPermission &&
      !authStore.hasPermission(to.meta.requiredPermission)
    ) {
      next("/dashboard");
      return;
    }
  }

  next();
});

export default router;
