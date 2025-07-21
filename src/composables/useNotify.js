import { inject } from 'vue';

/**
 * Composable to use the notification system
 * @returns {Function} The notify function
 */
export function useNotify() {
  const notify = inject('notify');
  
  if (!notify) {
    console.warn('No notification provider found. Make sure NotifyManager is mounted.');
    
    // Return a no-op function to prevent errors
    return (message, options = {}) => {
      console.warn('Notification system not available:', message, options);
      return { close: () => {} };
    };
  }
  
  return notify;
} 