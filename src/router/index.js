import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const routes = [
  {
    path: '/',
    redirect: '/signin'
  },
  {
    path: '/signin',
    name: 'Signin',
    component: () => import('../views/Signin.vue')
  },

  {
    path: '/records',
    name: 'MedicalRecords',
    component: () => {
      // Dynamically import the correct component based on user role
      // User role is now determined by Supabase session
      // Default to patient if no session
      const role = 'patient';
      
      // Map role to component path
      if (role === 'admin') {
        return import('../views/admin/MedicalRecords.vue');
      } else if (role === 'nurse') {
        return import('../views/nurse/MedicalRecords.vue');
      } else {
        return import('../views/patient/MyMedicalRecords.vue');
      }
    },
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => {
      // Dynamically import the correct component based on user role
      // User role is now determined by Supabase session
      // Default to patient if no session
      const role = 'patient';

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
  {
    path: '/admin/account-creation',
    name: 'AccountCreation',
    component: () => import('../views/admin/AccountCreation.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },

  {
    path: '/admin/manage-patients',
    name: 'ManagePatients',
    component: () => import('../views/admin/ManagePatients.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/appointments',
    name: 'AdminAppointments',
    component: () => import('../views/admin/Appointments.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/medical-records',
    name: 'AdminMedicalRecords',
    component: () => import('../views/admin/MedicalRecords.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/notifications',
    name: 'AdminNotifications',
    component: () => import('../views/admin/Notifications.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: () => import('../views/admin/Reports.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/nurse/patient-management',
    name: 'NursePatientManagement',
    component: () => import('../views/nurse/PatientManagement.vue'),
    meta: { requiresAuth: true, role: 'nurse' }
  },
  {
    path: '/nurse/medical-records',
    name: 'NurseMedicalRecords',
    component: () => import('../views/nurse/MedicalRecords.vue'),
    meta: { requiresAuth: true, role: 'nurse' }
  },
  {
    path: '/nurse/appointment-requests',
    name: 'NurseAppointmentRequests',
    component: () => import('../views/nurse/AppointmentRequests.vue'),
    meta: { requiresAuth: true, role: 'nurse' }
  },
  {
    path: '/nurse/treatment-diagnosis',
    name: 'NurseTreatmentDiagnosis',
    component: () => import('../views/nurse/TreatmentDiagnosis.vue'),
    meta: { requiresAuth: true, role: 'nurse' }
  },
  {
    path: '/nurse/consultation-notes',
    name: 'NurseConsultationNotes',
    component: () => import('../views/nurse/ConsultationNotes.vue'),
    meta: { requiresAuth: true, role: 'nurse' }
  },
  {
    path: '/nurse/notifications',
    name: 'NurseNotifications',
    component: () => import('../views/nurse/Notifications.vue'),
    meta: { requiresAuth: true, role: 'nurse' }
  },
  {
    path: '/patient/medical-records',
    name: 'PatientMedicalRecords',
    component: () => import('../views/patient/MyMedicalRecords.vue'),
    meta: { requiresAuth: true, role: 'patient' }
  },
  {
    path: '/patient/appointments',
    name: 'PatientAppointments',
    component: () => import('../views/patient/MyAppointments.vue'),
    meta: { requiresAuth: true, role: 'patient' }
  },

  {
    path: '/patient/notifications',
    name: 'PatientNotifications',
    component: () => import('../views/patient/Notifications.vue'),
    meta: { requiresAuth: true, role: 'patient' }
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
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore()

    // Check auth state if not already checked
    if (!authStore.isAuthenticated) {
      await authStore.checkAuth()
    }

    const isAuthenticated = authStore.isAuthenticated
    const role = authStore.user?.role

  // Define patient-only routes
  const patientOnlyRoutes = [
    '/dashboard', '/records', '/visits', '/history', '/notifications', '/calendar', '/settings'
  ];
  // Define admin-only routes
  const adminOnlyRoutes = ['/admin'];
  // Define nurse/clinic staff routes
  const nurseRoutes = ['/patients', '/visits', '/records', '/history', '/notifications', '/calendar', '/settings', '/dashboard'];

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/signin');
  } else if (to.meta.role && to.meta.role !== role) {
    next('/signin');
  } else if (role === 'patient') {
    // Redirect patient from /patients to /dashboard
    if (to.path === '/patients') {
      next('/dashboard');
    } else if (!patientOnlyRoutes.includes(to.path) && to.path !== '/dashboard' && to.path !== '/signin') {
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
    next('/signin');
  }
});

export default router