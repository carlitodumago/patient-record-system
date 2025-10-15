/**
 * Utility functions for managing notifications in the application
 */

/**
 * Check if notifications are enabled for the current user
 * @param {Object} user - The current user object
 * @returns {boolean} - Whether notifications are enabled
 */
export const areNotificationsEnabled = (user) => {
  if (!user) return false;

  // Get saved settings if they exist
  const savedSettings = localStorage.getItem("userSettings");
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      // Only use settings if they belong to current user
      if (parsedSettings.username === user.username) {
        return parsedSettings.settings.notifications !== false; // Default to true if not explicitly false
      }
    } catch (error) {
      console.error("Failed to parse notification settings:", error);
    }
  }

  // Default to true if no settings found
  return true;
};

/**
 * Add a notification to the store
 * @param {Object} store - Vuex store
 * @param {Object} notification - Notification object
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {string} notification.type - Notification type (info, success, warning, error)
 * @param {boolean} notification.noButtons - Whether to hide action buttons for this notification
 */
export const addNotification = (store, notification) => {
  // Check if notifications are enabled for current user
  if (!areNotificationsEnabled(store.state.user)) {
    return; // Don't add notification if disabled
  }

  store.commit("addNotification", {
    id: Date.now(), // Simple ID generation
    date: new Date(),
    read: false,
    type: notification.type || "info",
    title: notification.title,
    message: notification.message,
    noButtons: notification.noButtons || false, // Add noButtons flag
  });
};

/**
 * Add a patient-related notification
 * @param {Object} store - Vuex store
 * @param {Object} patient - Patient object
 * @param {string} action - Action performed (added, updated, deleted)
 */
export const addPatientNotification = (store, patient, action) => {
  const fullName = `${patient.firstName} ${patient.lastName}`;
  let title, message, type;

  switch (action) {
    case "added":
      title = "New Patient Added";
      message = `Patient ${fullName} has been added to the system.`;
      type = "success";
      break;
    case "updated":
      title = "Patient Updated";
      message = `Patient ${fullName}'s information has been updated.`;
      type = "info";
      break;
    case "deleted":
      title = "Patient Deleted";
      message = `Patient ${fullName} has been removed from the system.`;
      type = "warning";
      break;
    default:
      title = "Patient Record Change";
      message = `Patient ${fullName}'s record has been modified.`;
      type = "info";
  }

  addNotification(store, { title, message, type });
};

/**
 * Format a date for display with time in notifications
 * @param {string|Date} dateString - Date string or object
 * @returns {string} - Formatted date with time
 */
const formatDateTimeForNotification = (dateString) => {
  if (!dateString) return "Upcoming";

  let date;
  // Handle different date formats
  if (typeof dateString === "string") {
    // Handle MM/DD/YYYY format
    if (dateString.includes("/")) {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const [month, day, year] = parts;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        date = new Date(dateString);
      }
    }
    // Handle ISO format or other string formats
    else {
      date = new Date(dateString);
    }
  } else if (dateString instanceof Date) {
    date = dateString;
  } else {
    return "Scheduled";
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Scheduled";
  }

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return date.toLocaleDateString(undefined, options);
};

/**
 * Add a visit-related notification
 * @param {Object} store - Vuex store
 * @param {Object} visit - Visit object
 * @param {Function} getPatientName - Function to get patient name from ID
 * @param {string} action - Action performed (scheduled, completed, updated, deleted)
 */
export const addVisitNotification = (store, visit, getPatientName, action) => {
  const patientName =
    typeof getPatientName === "function"
      ? getPatientName(visit.patientId)
      : visit.patientId
      ? `Patient #${visit.patientId}`
      : "Unknown Patient";

  let title, message, type;

  // Determine the best date to use
  let visitDateToUse;
  if (visit.timestamp) {
    visitDateToUse = visit.timestamp;
  } else if (visit.visitDate && visit.visitTime) {
    // If we have separate date and time, try to combine them
    try {
      visitDateToUse = `${visit.visitDate} ${visit.visitTime}`;
    } catch (e) {
      visitDateToUse = visit.visitDate;
    }
  } else {
    visitDateToUse = visit.visitDate || null;
  }

  const dateTimeString = formatDateTimeForNotification(visitDateToUse);

  switch (action) {
    case "scheduled":
      title = "New Visit Scheduled";
      message = `A visit for ${patientName} has been scheduled for ${dateTimeString}.`;
      type = "info";
      break;
    case "completed":
      title = "Visit Completed";
      message = `Visit for ${patientName} on ${dateTimeString} has been marked as completed.`;
      type = "success";
      break;
    case "updated":
      title = "Visit Updated";
      message = `Visit details for ${patientName} scheduled for ${dateTimeString} have been updated.`;
      type = "info";
      break;
    case "deleted":
      title = "Visit Canceled";
      message = `Visit for ${patientName} on ${dateTimeString} has been canceled.`;
      type = "warning";
      break;
    default:
      title = "Visit Status Changed";
      message = `Visit for ${patientName} has been modified.`;
      type = "info";
  }

  addNotification(store, {
    title,
    message,
    type,
    noButtons: true, // Add noButtons flag to prevent UI overlaps
  });
};

/**
 * Save notifications to localStorage
 * @param {Array} notifications - Array of notification objects
 */
export const saveNotifications = (notifications) => {
  localStorage.setItem("notifications", JSON.stringify(notifications));
};

/**
 * Load notifications from localStorage
 * @returns {Array} Array of notification objects
 */
export const loadNotifications = () => {
  const savedNotifications = localStorage.getItem("notifications");
  if (savedNotifications) {
    try {
      // Convert string dates back to Date objects
      return JSON.parse(savedNotifications).map((notification) => ({
        ...notification,
        date: new Date(notification.date),
      }));
    } catch (e) {
      console.error("Error loading notifications:", e);
      return [];
    }
  }
  return [];
};

/**
 * Display a toast notification
 * @param {String} message - The message to display
 * @param {Object} options - Options for the toast
 * @param {String} options.type - Type of notification (success, error, info, warning)
 * @param {Number} options.duration - Duration to show in ms (0 for no auto-close)
 * @param {Boolean} options.showOkButton - Whether to show the OK button
 */
export const showToast = (message, options = {}) => {
  // Try to get the Vue app instance
  if (window && window.__VUE_APP_INSTANCE) {
    const notify = window.__VUE_APP_INSTANCE.config.globalProperties.$notify;
    if (notify) {
      return notify(message, options);
    }
  }

  // Try to import and use the composable if available
  try {
    // This is a dynamic import and will only work during runtime, not during SSR
    // We use this as a fallback method
    import("../composables/useNotify")
      .then((module) => {
        const notify = module.useNotify();
        if (notify) {
          return notify(message, options);
        }
      })
      .catch(() => {
        console.warn("Could not import useNotify composable");
      });
  } catch (e) {
    // Ignore - this is just a fallback attempt
  }

  // Fallback if notify function is not available
  console.warn("Toast notification system not available");
  console.info(message, options);
  return { close: () => {} };
};
