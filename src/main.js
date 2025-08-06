import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/css/styles.css'
import axios from 'axios'
import router from './router'

import { createApp } from 'vue'
import App from './App.vue'
import { createStore } from 'vuex'

// Import utilities
import { updateAutoLogout } from './utils/autoLogout'
import { standardizePatientsList, standardizePatientDates } from './utils/dateUtils'
import { loadNotifications, saveNotifications } from './utils/notificationUtils'

// Load mock users from localStorage if available
const getMockUsers = () => {
  const defaultUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' }
  ];
  
  // Get registered users from localStorage
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  // Combine default and registered users, avoiding duplicates
  return [...defaultUsers, ...registeredUsers.filter(
    regUser => !defaultUsers.some(defaultUser => defaultUser.username === regUser.username)
  )];
};

// Create Vuex store
const store = createStore({
  state() {
    return {
      patients: [],
      currentPatient: null,
      visits: [],
      isAuthenticated: false,
      user: null,
      users: getMockUsers(),
      notifications: loadNotifications() || [
        {
          id: 1,
          title: 'New Patient Record',
          message: 'A new patient record has been created',
          type: 'info',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false
        },
        {
          id: 2,
          title: 'Record Updated',
          message: 'Patient #128 record was updated',
          type: 'success',
          date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          read: true
        },
        {
          id: 3,
          title: 'System Maintenance',
          message: 'System will be down for maintenance on Sunday, 2:00 AM - 4:00 AM',
          type: 'warning',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          read: false
        }
      ]
    }
  },
  mutations: {
    setPatients(state, patients) {
      state.patients = patients;
    },
    setCurrentPatient(state, patient) {
      state.currentPatient = standardizePatientDates(patient);
    },
    addPatient(state, patient) {
      // Ensure consistent date format before adding
      const standardizedPatient = standardizePatientDates(patient);
      state.patients.push(standardizedPatient);
      // Save to localStorage
      localStorage.setItem('patientRecords', JSON.stringify(state.patients));
    },
    updatePatient(state, updatedPatient) {
      const index = state.patients.findIndex(p => p.id === updatedPatient.id);
      if (index !== -1) {
        // Ensure consistent date format before updating
        const standardizedPatient = standardizePatientDates(updatedPatient);
        state.patients[index] = standardizedPatient;
        // Save to localStorage
        localStorage.setItem('patientRecords', JSON.stringify(state.patients));
      }
    },
    deletePatient(state, id) {
      state.patients = state.patients.filter(p => p.id !== id);
      // Save to localStorage
      localStorage.setItem('patientRecords', JSON.stringify(state.patients));
    },
    setAuthenticated(state, isAuth) {
      state.isAuthenticated = isAuth;
      
      // Update auto logout when auth state changes
      if (isAuth) {
        updateAutoLogout(store, router);
      }
    },
    setUser(state, user) {
      state.user = user;
    },
    addUser(state, user) {
      // Check if user already exists
      if (!state.users.some(u => u.username === user.username)) {
        state.users.push(user);
      }
    },
    // Notification mutations
    addNotification(state, notification) {
      state.notifications.unshift({
        id: notification.id || Date.now(), // Simple ID generation
        date: notification.date || new Date(),
        read: notification.read || false,
        ...notification
      });
      
      // Save to localStorage
      saveNotifications(state.notifications);
    },
    markNotificationAsRead(state, id) {
      const notification = state.notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        
        // Save to localStorage
        saveNotifications(state.notifications);
      }
    },
    markAllNotificationsAsRead(state) {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      
      // Save to localStorage
      saveNotifications(state.notifications);
    },
    deleteNotification(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id);
      
      // Save to localStorage
      saveNotifications(state.notifications);
    },
    // Visit mutations
    setVisits(state, visits) {
      state.visits = visits;
    },
    addVisit(state, visit) {
      state.visits.push(visit);
      localStorage.setItem('medicalVisits', JSON.stringify(state.visits));
    },
    updateVisit(state, updatedVisit) {
      const index = state.visits.findIndex(v => v.id === updatedVisit.id);
      if (index !== -1) {
        state.visits[index] = updatedVisit;
        localStorage.setItem('medicalVisits', JSON.stringify(state.visits));
      }
    },
    deleteVisit(state, id) {
      state.visits = state.visits.filter(v => v.id !== id);
      localStorage.setItem('medicalVisits', JSON.stringify(state.visits));
    }
  },
  actions: {
    // Add an action to load patients from localStorage on app start
    loadPatients({ commit }) {
      const savedPatients = localStorage.getItem('patientRecords');
      if (savedPatients) {
        // Standardize all patient dates to MM-DD-YYYY format
        const patients = standardizePatientsList(JSON.parse(savedPatients));
        commit('setPatients', patients);
      }
    },
    // Load visits from localStorage
    loadVisits({ commit }) {
      const savedVisits = localStorage.getItem('medicalVisits');
      if (savedVisits) {
        commit('setVisits', JSON.parse(savedVisits));
      }
    }
  }
})

// Check local storage for user login state
const storedUser = localStorage.getItem('user');
if (storedUser) {
  try {
    const userData = JSON.parse(storedUser);
    store.commit('setAuthenticated', true);
    store.commit('setUser', userData);
  } catch (e) {
    localStorage.removeItem('user');
  }
}

// Load patients from localStorage on app start
store.dispatch('loadPatients');
// Load visits from localStorage on app start
store.dispatch('loadVisits');

// Create the app instance
const app = createApp(App)

// Register the notification system globally
app.config.globalProperties.$notify = (message, options = {}) => {
  // This function will be properly defined when the NotifyManager component is mounted
  console.log('Notification system not yet initialized');
  return { close: () => {} };
};

// Store app instance globally for notifications to work
window.__VUE_APP_INSTANCE = app;

app.use(store)
app.use(router)

// Execute after app is mounted
app.mount('#app')
