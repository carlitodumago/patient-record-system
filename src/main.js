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
import { createPinia } from 'pinia'

// Import utilities
import { updateAutoLogout } from './utils/autoLogout'
import { standardizePatientsList, standardizePatientDates } from './utils/dateUtils'
import { loadNotificationsWithDates, saveNotifications } from './utils/notificationUtils'

// Apply animation CSS on app initialization
import { generateAnimationCSS } from './utils/animationUtils'

// Load mock users from localStorage if available
const getMockUsers = () => {
  const defaultUsers = [
    { username: 'admin', password: 'admin123', role: 'admin', fullName: 'Admin User' },
    { username: 'nurse', password: 'nurse123', role: 'nurse', fullName: 'Nurse Mike Chen' },
    { username: 'patient', password: 'patient123', role: 'patient', fullName: 'Patient John Doe' }
  ];
  
  // Get registered users from localStorage
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  // Combine default and registered users, avoiding duplicates
  return [...defaultUsers, ...registeredUsers.filter(
    regUser => !defaultUsers.some(defaultUser => defaultUser.username === regUser.username)
  )];
};

console.log('Loaded users:', getMockUsers());

// Create Pinia store
const pinia = createPinia()

// Import stores
import { useUserStore, usePatientStore, useNotificationStore } from './stores'

// Create the app instance
const app = createApp(App)

// Apply animation CSS
try {
  const animationCSS = generateAnimationCSS();
  const style = document.createElement('style');
  style.textContent = animationCSS;
  document.head.appendChild(style);
} catch (error) {
  console.error('Error applying animation CSS:', error);
}

// Register the notification system globally
app.config.globalProperties.$notify = (message, options = {}) => {
  try {
    // This function will be properly defined when the NotifyManager component is mounted
    console.log('Notification system not yet initialized');
    return { close: () => {} };
  } catch (error) {
    console.error('Error in notification system:', error);
    return { close: () => {} };
  }
};

// Store app instance globally for notifications to work
window.__VUE_APP_INSTANCE = app;

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

app.use(pinia)
app.use(router)

// Initialize stores after app is created but before mounting
const userStore = useUserStore();
const patientStore = usePatientStore();

// Initialize user state from localStorage
userStore.initUserState();

// Load patients from localStorage
patientStore.loadPatients();

// Execute after app is mounted
try {
  app.mount('#app')
} catch (error) {
  console.error('Error mounting app:', error);
  // Fallback: try to show error message
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #d9534f;">
        <h2>Application Error</h2>
        <p>There was an error loading the application. Please refresh the page.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #d9534f; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
}
