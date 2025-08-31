import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/patients',
    name: 'PatientList',
    component: () => import('../views/PatientList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patients/new',
    name: 'AddPatient',
    component: () => import('../views/PatientForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patients/:id',
    name: 'PatientDetails',
    component: () => import('../views/PatientDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patients/:id/edit',
    name: 'EditPatient',
    component: () => import('../views/PatientForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/visits',
    name: 'MedicalVisits',
    component: () => import('../views/MedicalVisits.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/records',
    name: 'MedicalRecords',
    component: () => {
      // Dynamically import the correct component based on user role
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : { role: 'patient' };
      const role = user.role || 'patient';
      
      // Map role to component path
      if (role === 'admin') {
        return import('../views/admin/MedicalRecords.vue');
      } else if (role === 'nurse') {
        return import('../views/nurse/MedicalRecords.vue');
      } else {
        return import('../views/patient/MedicalRecords.vue');
      }
    },
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'MedicalHistory',
    component: () => import('../views/MedicalHistory.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/Notifications.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/CalendarView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => {
      // Dynamically import the correct component based on user role
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : { role: 'patient' };
      const role = user.role || 'patient';
      
      // Map role to component path
      if (role === 'admin') {
        return import('../views/admin/DashboardView.vue');
      } else if (role === 'nurse') {
        return import('../views/nurse/DashboardView.vue');
      } else {
        return import('../views/patient/DashboardView.vue');
      }
    },
    meta: { requiresAuth: true }
  },
  // 404 Not Found route - should be the last route
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for auth protected routes
router.beforeEach((to, from, next) => {
  try {
    // Allow access to login and register routes without authentication
    if (to.path === '/login' || to.path === '/register') {
      return next();
    }

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAuthenticated = user !== null;
    const role = user?.role;

    // If route requires auth and user is not authenticated, redirect to login
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      return next('/login');
    }

    // Define route access by role
    const routeAccess = {
      patient: ['/dashboard', '/records', '/visits', '/history', '/notifications', '/calendar', '/settings', '/profile'],
      admin: ['/dashboard', '/patients', '/records', '/visits', '/history', '/notifications', '/calendar', '/settings', '/profile'],
      nurse: ['/dashboard', '/patients', '/records', '/visits', '/history', '/notifications', '/calendar', '/settings', '/profile']
    };

    // Get allowed routes for user's role
    const allowedRoutes = routeAccess[role] || [];

    // Check if user has access to requested route
    if (!allowedRoutes.includes(to.path)) {
      return next('/dashboard');
    }

    next();
  } catch (error) {
    console.error('Navigation guard error:', error);
    next('/login');
  }
});

export default router