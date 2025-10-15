import { createRouter, createWebHistory } from "vue-router";
import { adminRoutes } from "./admin";
import { nurseRoutes } from "./nurse";
import { patientRoutes } from "./patient";
import Login from "../views/Login.vue";

// Combine all routes
const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  // Spread all role-based routes
  ...adminRoutes,
  ...nurseRoutes,
  ...patientRoutes,
  // Catch-all route for 404
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
    meta: { requiresAuth: false },
  },
];

// Role-based route guards
const getDefaultRouteForRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin";
    case "nurse":
      return "/nurse";
    case "patient":
      return "/patient";
    default:
      return "/login";
  }
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation guards
router.beforeEach((to, from, next) => {
  // Simulate authentication check (replace with actual auth logic)
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole") || "guest";

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
    return;
  }

  // Check role-based access
  if (to.meta.requiresAuth && to.meta.role && to.meta.role !== userRole) {
    // Redirect to appropriate dashboard based on user role
    next(getDefaultRouteForRole(userRole));
    return;
  }

  // Redirect authenticated users away from login page
  if (to.path === "/login" && isAuthenticated) {
    next(getDefaultRouteForRole(userRole));
    return;
  }

  next();
});

export default router;
