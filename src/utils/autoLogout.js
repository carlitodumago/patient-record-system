/**
 * Auto Logout Utility
 * Manages automatic user logout based on inactivity
 */

let logoutTimer = null;
const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

/**
 * Set up the inactivity timer that will log out the user
 * @param {object} userStore - Pinia user store for authentication state
 * @param {object} router - Vue Router for navigation
 * @param {number} timeout - Timeout in minutes (0 = disabled)
 */
export const setupAutoLogout = (userStore, router, timeout = 0) => {
  // Clear any existing timer
  if (logoutTimer) {
    clearTimeout(logoutTimer);
    logoutTimer = null;
  }
  
  // If timeout is 0 or not set, auto logout is disabled
  if (!timeout) {
    // Remove existing event listeners if any
    events.forEach(event => {
      document.removeEventListener(event, resetTimer);
    });
    return;
  }
  
  // Convert minutes to milliseconds
  const timeoutMilliseconds = timeout * 60 * 1000;
  
  // Function to reset timer on user activity
  function resetTimer() {
    if (logoutTimer) clearTimeout(logoutTimer);
    
    // Set the timer that will log the user out
    logoutTimer = setTimeout(() => {
      // Ensure the user is still logged in before auto-logout
      const isAuthenticated = userStore.isAuthenticated;
      if (isAuthenticated) {
        console.log('Auto-logout due to inactivity');
        // Log out the user
        userStore.logout();
        
        // Redirect to login page with message
        router.push({
          path: '/login',
          query: { autoLogout: 'true' }
        });
      }
    }, timeoutMilliseconds);
  }
  
  // Set the initial timer
  resetTimer();
  
  // Add event listeners to reset the timer on user activity
  events.forEach(event => {
    document.removeEventListener(event, resetTimer); // Remove existing to avoid duplicates
    document.addEventListener(event, resetTimer);
  });
};

/**
 * Update auto logout settings based on user preferences
 * @param {object} userStore - Pinia user store for authentication state
 * @param {object} router - Vue Router for navigation
 */
export const updateAutoLogout = (userStore, router) => {
  // Get the current user
  const user = userStore.user;
  if (!user) return;
  
  // Get saved user settings
  const savedSettings = localStorage.getItem('userSettings');
  let timeout = 0; // Default to no auto logout
  
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      // Only use settings if they belong to current user
      if (parsedSettings.username === user.username) {
        timeout = parsedSettings.settings.autoLogout || 0;
      }
    } catch (error) {
      console.error('Failed to parse auto logout settings:', error);
    }
  }
  
  // Set up auto logout with the specified timeout
  setupAutoLogout(userStore, router, timeout);
};

export default {
  setupAutoLogout,
  updateAutoLogout
};