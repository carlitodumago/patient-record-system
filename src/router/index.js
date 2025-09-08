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
    path: '/register-patient',
    name: 'RegisterPatient',
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
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAuthenticated = user !== null;
    const role = user?.role;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/register-patient'];
    
    // Define role-specific routes
    const patientRoutes = [
      '/dashboard', '/records', '/visits', '/history', '/notifications', '/calendar', '/settings', '/profile'
    ];
    
    const adminRoutes = [
      '/dashboard', '/admin', '/records', '/settings', '/profile'
    ];
    
    const nurseRoutes = [
      '/dashboard', '/patients', '/patients/new', '/patients/:id', '/patients/:id/edit',
      '/visits', '/records', '/history', '/notifications', '/calendar', '/settings', '/profile'
    ];

    // Check if route requires authentication
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      next('/login');
      return;
    }
    
    // If route has specific role requirement
    if (to.meta.role && to.meta.role !== role) {
      next('/login');
      return;
    }
    
    // If public route, allow access
    if (publicRoutes.includes(to.path)) {
      next();
      return;
    }
    
    // Role-based access control
    if (isAuthenticated) {
      // For patient role
      if (role === 'patient') {
        // Check if the route path matches any pattern in patientRoutes
        const isPatientRoute = patientRoutes.some(route => {
          // Handle dynamic routes with parameters
          if (route.includes(':')) {
            const pattern = new RegExp('^' + route.replace(/:\w+/g, '[^/]+') + '$');
            return pattern.test(to.path);
          }
          return to.path === route;
        });
        
        if (isPatientRoute) {
          next();
        } else {
          console.log('Patient trying to access unauthorized route:', to.path);
          next('/dashboard');
        }
      }
      // For admin role
      else if (role === 'admin') {
        // Check if the route path matches any pattern in adminRoutes
        const isAdminRoute = adminRoutes.some(route => {
          // Handle dynamic routes with parameters
          if (route.includes(':')) {
            const pattern = new RegExp('^' + route.replace(/:\w+/g, '[^/]+') + '$');
            return pattern.test(to.path);
          }
          return to.path === route;
        });
        
        if (isAdminRoute) {
          next();
        } else {
          console.log('Admin trying to access unauthorized route:', to.path);
          next('/dashboard');
        }
      }
      // For nurse/clinic staff role
      else if (role === 'nurse') {
        // Check if the route path matches any pattern in nurseRoutes
        const isNurseRoute = nurseRoutes.some(route => {
          // Handle dynamic routes with parameters
          if (route.includes(':')) {
            const pattern = new RegExp('^' + route.replace(/:\w+/g, '[^/]+') + '$');
            return pattern.test(to.path);
          }
          return to.path === route;
        });
        
        if (isNurseRoute) {
          next();
        } else {
          console.log('Nurse trying to access unauthorized route:', to.path);
          next('/dashboard');
        }
      }
      // Default fallback
      else {
        next('/login');
      }
    } else {
      // Not authenticated and not a public route
      next('/login');
    }
  } catch (error) {
    console.error('Navigation guard error:', error);
    next('/login');
  }
});

export default router