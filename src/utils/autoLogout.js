/**
 * Auto Logout Utility - DISABLED
 * Auto logout functionality has been removed as per user request
 * This file is kept for potential future use but all functions are no-ops
 */

let logoutTimer = null;
const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

/**
 * Set up the inactivity timer that will log out the user - DISABLED
 * @param {object} store - Vuex store for authentication state
 * @param {object} router - Vue Router for navigation
 * @param {number} timeout - Timeout in minutes (0 = disabled)
 */
export const setupAutoLogout = (store, router, timeout = 0) => {
  // Auto logout is disabled - do nothing
  console.log('Auto logout is disabled');
  return;
};

/**
 * Update auto logout settings based on user preferences - DISABLED
 * @param {object} store - Vuex store for authentication state
 * @param {object} router - Vue Router for navigation
 */
export const updateAutoLogout = (store, router) => {
  // Auto logout is disabled - do nothing
  console.log('Auto logout is disabled');
  return;
};

export default {
  setupAutoLogout,
  updateAutoLogout
};
