/**
 * Utility functions for managing application data
 * Updated for Supabase integration - localStorage account management replaced
 */

/**
 * Checks if localStorage is available and accessible
 * @returns {boolean} True if localStorage is available, false otherwise
 */
export function isLocalStorageAvailable() {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn("localStorage is not available:", e.message);
    return false;
  }
}

/**
 * Gets all localStorage keys (deprecated - account management now handled by Supabase)
 * @deprecated Use Supabase for user account management
 * @returns {string[]} Array of all localStorage keys
 */
export function getAccountRelatedKeys() {
  console.warn(
    "getAccountRelatedKeys is deprecated. Account management is now handled by Supabase."
  );
  return getAllLocalStorageKeys();
}

/**
 * Gets all localStorage keys
 * @returns {string[]} Array of all localStorage keys
 */
export function getAllLocalStorageKeys() {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
  } catch (e) {
    console.error("Error accessing localStorage keys:", e.message);
  }

  return keys;
}

/**
 * Securely removes all account-related localStorage data
 * @deprecated Account management is now handled by Supabase
 * @param {boolean} skipConfirmation - If true, skips the confirmation dialog
 * @returns {Promise<{success: boolean, removedKeys: string[], error?: string}>}
 */
export async function clearAllAccountData(skipConfirmation = false) {
  console.warn(
    "clearAllAccountData is deprecated. Account management is now handled by Supabase."
  );

  return {
    success: true,
    removedKeys: [],
    message:
      "Account management migrated to Supabase - no localStorage cleanup needed",
  };
}

/**
 * Shows a confirmation dialog before clearing account data
 * @param {number} itemCount - Number of items to be cleared
 * @returns {Promise<boolean>} True if user confirms, false otherwise
 */
function showClearConfirmation(itemCount) {
  return new Promise((resolve) => {
    const message = `This will permanently delete ${itemCount} account-related item(s) from localStorage.\n\nAdmin account data will be preserved.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?`;

    if (typeof window !== "undefined" && window.confirm) {
      resolve(window.confirm(message));
    } else {
      // Fallback for environments without window.confirm
      console.warn(
        "Confirmation dialog not available, proceeding with clearance"
      );
      resolve(true);
    }
  });
}

/**
 * Gets a summary of current localStorage state
 * @returns {object} Summary of localStorage contents
 */
export function getStorageSummary() {
  if (!isLocalStorageAvailable()) {
    return {
      available: false,
      totalItems: 0,
      accountItems: 0,
      accountKeys: [],
      message: "Account management migrated to Supabase",
    };
  }

  try {
    const allKeys = getAllLocalStorageKeys();
    return {
      available: true,
      totalItems: localStorage.length,
      accountItems: 0, // No longer tracking account items since they're in Supabase
      accountKeys: [],
      otherItems: localStorage.length,
      message: "Account management migrated to Supabase",
    };
  } catch (e) {
    console.error("Error getting storage summary:", e.message);
    return {
      available: false,
      error: e.message,
    };
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Account management is now handled by Supabase
 */
export const clearLocalStorageAccounts = () => {
  console.warn(
    "clearLocalStorageAccounts is deprecated. Account management is now handled by Supabase."
  );
  return clearAllAccountData(false);
};

/**
 * Automated cleanup function (no confirmation)
 * @deprecated Account management is now handled by Supabase
 */
export const cleanupLegacyStorage = () => {
  console.warn(
    "cleanupLegacyStorage is deprecated. Account management is now handled by Supabase."
  );
  return clearAllAccountData(true);
};
