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
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAuthenticated = user !== null;
    const role = user?.role;

  // Define patient-only routes
  const patientOnlyRoutes = [
    '/dashboard', '/records', '/visits', '/history', '/notifications', '/calendar', '/settings'
  ];
  // Define admin-only routes
  const adminOnlyRoutes = ['/admin'];
  // Define nurse/clinic staff routes
  const nurseRoutes = ['/patients', '/visits', '/records', '/history', '/notifications', '/calendar', '/settings', '/dashboard'];

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else if (to.meta.role && to.meta.role !== role) {
    next('/login');
  } else if (role === 'patient') {
    // Redirect patient from /patients to /dashboard
    if (to.path === '/patients') {
      next('/dashboard');
    } else if (!patientOnlyRoutes.includes(to.path) && to.path !== '/dashboard' && to.path !== '/login' && to.path !== '/register') {
      // Prevent patient from accessing non-patient routes
      next('/dashboard');
    } else {
      next();
    }
  } else if (role === 'admin' && patientOnlyRoutes.includes(to.path)) {
    // Admin can access all routes except patient-only routes
    next('/dashboard');
  } else if (role === 'nurse' && !nurseRoutes.includes(to.path)) {
    // Nurse/clinic staff can only access nurse routes
    next('/dashboard');
  } else {
    next();
  }
  } catch (error) {
    console.error('Navigation guard error:', error);
    next('/login');
  }
});

export default router