/**
 * Composable to use the notification system
 * @returns {Function} The notify function
 */
export function useNotify() {
  // Return a no-op function since NotifyManager is removed
  return (message, options = {}) => {
    console.log("Notification:", message, options);
    return { close: () => {} };
  };
}
