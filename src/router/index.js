import { createRouter, createWebHistory } from "vue-router";

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
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/register-patient",
    name: "RegisterPatient",
    component: () => import("../views/Register.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
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
    path: "/visits",
    name: "MedicalVisits",
    component: () => import("../views/MedicalVisits.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/records",
    name: "MedicalRecords",
    component: () => {
      // Dynamically import the correct component based on user role from Supabase
      return import("../services/supabase").then(({ supabase }) => {
        return supabase.auth.getSession().then(({ data: { session } }) => {
          const role = session?.user?.user_metadata?.role || "patient";

          // Map role to component path
          if (role === "admin") {
            return import("../views/admin/MedicalRecords.vue");
          } else if (role === "nurse") {
            return import("../views/nurse/MedicalRecords.vue");
          } else {
            return import("../views/patient/MedicalRecords.vue");
          }
        });
      });
    },
    meta: { requiresAuth: true },
  },
  {
    path: "/history",
    name: "MedicalHistory",
    component: () => import("../views/MedicalHistory.vue"),
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
    path: "/admin/user-management",
    name: "UserManagement",
    component: () => import("../views/admin/UserManagement.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/backup-restore",
    name: "BackupRestore",
    component: () => import("../views/admin/BackupRestore.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/system-logs",
    name: "SystemLogs",
    component: () => import("../views/admin/SystemLogs.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => {
      // Dynamically import the correct component based on user role from Supabase
      return import("../services/supabase").then(({ supabase }) => {
        return supabase.auth.getSession().then(({ data: { session } }) => {
          const role = session?.user?.user_metadata?.role || "patient";

          // Map role to component path
          if (role === "admin") {
            return import("../views/admin/DashboardView.vue");
          } else if (role === "nurse") {
            return import("../views/nurse/DashboardView.vue");
          } else {
            return import("../views/patient/DashboardView.vue");
          }
        });
      });
    },
    meta: { requiresAuth: true },
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
    // Check Supabase session first
    const { supabase } = await import("../services/supabase");
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const isAuthenticated = !!session?.user;
    const role = session?.user?.user_metadata?.role || "patient";

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
    // Define nurse/clinic staff routes
    const nurseRoutes = [
      "/patients",
      "/visits",
      "/records",
      "/history",
      "/notifications",
      "/calendar",
      "/settings",
      "/dashboard",
    ];
    // Define admin routes
    const adminRoutes = [
      "/patients",
      "/visits",
      "/records",
      "/history",
      "/notifications",
      "/calendar",
      "/settings",
      "/dashboard",
      "/profile",
      "/register",
      "/register-patient",
      "/admin/user-management",
      "/admin/backup-restore",
      "/admin/system-logs",
    ];

    // If route requires authentication and user is not authenticated, redirect to login
    if (
      to.matched.some((record) => record.meta.requiresAuth) &&
      !isAuthenticated
    ) {
      next("/login");
      return;
    }

    // Check for admin-only routes
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (role !== "admin") {
        next("/dashboard");
        return;
      }
    }

    // If user is authenticated, check role-based access
    if (isAuthenticated && role) {
      if (role === "patient") {
        // Redirect patient from /patients to /dashboard
        if (to.path === "/patients") {
          next("/dashboard");
          return;
        }
        // Prevent patient from accessing non-patient routes
        if (
          !patientOnlyRoutes.includes(to.path) &&
          to.path !== "/dashboard" &&
          to.path !== "/login"
        ) {
          next("/dashboard");
          return;
        }
      } else if (role === "nurse") {
        // Nurse/clinic staff can only access nurse routes
        if (!nurseRoutes.includes(to.path)) {
          next("/dashboard");
          return;
        }
      } else if (role === "admin") {
        // Admin can access patient list, medical visits, medical history, notifications, and calendar
        if (!adminRoutes.includes(to.path)) {
          next("/dashboard");
          return;
        }
      }
    }

    // Allow access to public routes (login, register) or if no specific role restrictions
    next();
  } catch (error) {
    console.error("Navigation guard error:", error);
    // On any error, redirect to login for safety
    next("/login");
  }
});

export default router;
