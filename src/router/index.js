import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

const routes = [
  {
    path: "/",
    redirect: "/signin",
  },
  {
    path: "/signin",
    name: "Signin",
    component: () => import("../views/Signin.vue"),
  },
  {
    path: "/change-password",
    name: "ChangePassword",
    component: () => import("../views/ChangePassword.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/records",
    name: "MedicalRecords",
    component: () => import("../views/admin/MedicalRecords.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/admin/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/account-creation",
    name: "AccountCreation",
    component: () => import("../views/admin/AccountCreation.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },

  {
    path: "/admin/manage-patients",
    name: "ManagePatients",
    component: () => import("../views/admin/ManagePatients.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/manage-staff",
    name: "ManageStaff",
    component: () => import("../views/admin/ManageStaff.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/appointments",
    name: "AdminAppointments",
    component: () => import("../views/admin/Appointments.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/medical-records",
    name: "AdminMedicalRecords",
    component: () => import("../views/admin/MedicalRecords.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/notifications",
    name: "AdminNotifications",
    component: () => import("../views/admin/Notifications.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/reports",
    name: "AdminReports",
    component: () => import("../views/admin/Reports.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/nurse/patient-management",
    name: "NursePatientManagement",
    component: () => import("../views/nurse/PatientManagement.vue"),
    meta: { requiresAuth: true, role: "nurse" },
  },
  {
    path: "/nurse/medical-records",
    name: "NurseMedicalRecords",
    component: () => import("../views/nurse/MedicalRecords.vue"),
    meta: { requiresAuth: true, role: "nurse" },
  },
  {
    path: "/nurse/appointment-requests",
    name: "NurseAppointmentRequests",
    component: () => import("../views/nurse/AppointmentRequests.vue"),
    meta: { requiresAuth: true, role: "nurse" },
  },
  {
    path: "/nurse/treatment-diagnosis",
    name: "NurseTreatmentDiagnosis",
    component: () => import("../views/nurse/TreatmentDiagnosis.vue"),
    meta: { requiresAuth: true, role: "nurse" },
  },
  {
    path: "/nurse/consultation-notes",
    name: "NurseConsultationNotes",
    component: () => import("../views/nurse/ConsultationNotes.vue"),
    meta: { requiresAuth: true, role: "nurse" },
  },
  {
    path: "/nurse/notifications",
    name: "NurseNotifications",
    component: () => import("../views/nurse/Notifications.vue"),
    meta: { requiresAuth: true, role: "nurse" },
  },
  {
    path: "/patient/medical-records",
    name: "PatientMedicalRecords",
    component: () => import("../views/patient/MyMedicalRecords.vue"),
    meta: { requiresAuth: true, role: "patient" },
  },
  {
    path: "/patient/appointments",
    name: "PatientAppointments",
    component: () => import("../views/patient/MyAppointments.vue"),
    meta: { requiresAuth: true, role: "patient" },
  },

  {
    path: "/patient/notifications",
    name: "PatientNotifications",
    component: () => import("../views/patient/Notifications.vue"),
    meta: { requiresAuth: true, role: "patient" },
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

// Navigation guard for auth protected routes
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore();

    // Check auth state if not already checked
    if (!authStore.isAuthenticated) {
      await authStore.checkAuth();
    }

    const isAuthenticated = authStore.isAuthenticated;
    const role = authStore.user?.role;

    // Define patient-only routes
    const patientOnlyRoutes = [
      "/dashboard",
      "/records",
      "/visits",
      "/history",
      "/notifications",
      "/calendar",
      "/settings",
    ];

    // If trying to access protected route while not authenticated, redirect to signin
    if (
      to.matched.some((record) => record.meta.requiresAuth) &&
      !isAuthenticated
    ) {
      next("/signin");
      return;
    }

    // If user doesn't have required role for the route, redirect to signin
    if (to.meta.role && role && to.meta.role !== role) {
      next("/signin");
      return;
    }

    // Handle authenticated users
    if (isAuthenticated && role) {
      // Redirect from root to appropriate dashboard
      if (to.path === "/" || to.path === "/signin") {
        next("/dashboard");
        return;
      }

      // Role-based route restrictions for patients
      if (role === "patient") {
        if (to.path === "/patients") {
          next("/dashboard");
          return;
        }
        if (!patientOnlyRoutes.includes(to.path) && to.path !== "/dashboard") {
          next("/dashboard");
          return;
        }
      }

      // Role-based route restrictions for nurses
      if (role === "nurse") {
        const nurseRoutes = [
          "/nurse/patient-management",
          "/nurse/medical-records",
          "/nurse/appointment-requests",
          "/nurse/treatment-diagnosis",
          "/nurse/consultation-notes",
          "/nurse/notifications",
          "/dashboard",
        ];
        if (!nurseRoutes.includes(to.path)) {
          next("/dashboard");
          return;
        }
      }

      // Admin users can access admin routes and dashboard
      // No additional restrictions needed for admins
    }

    // Default: allow navigation
    next();
  } catch (error) {
    console.error("Navigation guard error:", error);
    next("/signin");
  }
});

export default router;
