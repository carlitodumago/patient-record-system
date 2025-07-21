import { ref, reactive } from 'vue';

/**
 * Composable for managing confirmation dialogs throughout the application
 */
export function useConfirmation() {
  const isOpen = ref(false);
  const config = reactive({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed with this action?',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    confirmButtonType: 'danger',
    icon: 'bi-exclamation-triangle'
  });
  
  // Stores a reference to the resolve/reject functions for the current promise
  let resolver = null;
  let rejecter = null;
  
  /**
   * Open a confirmation dialog
   * @param {Object} options - Configuration options for the dialog
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Dialog message
   * @param {string} options.confirmButtonText - Text for the confirm button
   * @param {string} options.cancelButtonText - Text for the cancel button
   * @param {string} options.confirmButtonType - Bootstrap button type (primary, secondary, danger, etc.)
   * @param {string} options.icon - Bootstrap icon class
   * @returns {Promise} A promise that resolves when confirmed, rejects when canceled
   */
  const confirm = (options = {}) => {
    // Update configuration with provided options
    Object.assign(config, options);
    
    // Open the dialog
    isOpen.value = true;
    
    // Return a promise that will be resolved when the user makes a choice
    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });
  };
  
  /**
   * Convenience method for confirming file deletion
   * @param {string} fileName - The name of the file to delete
   * @returns {Promise} A promise that resolves when confirmed, rejects when canceled
   */
  const confirmFileDeletion = (fileName) => {
    return confirm({
      title: 'Delete File',
      message: `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
      icon: 'bi-trash'
    });
  };
  
  /**
   * Handle confirmation (usually connected to the dialog component)
   */
  const handleConfirm = () => {
    if (resolver) {
      resolver(true);
      resolver = null;
      rejecter = null;
    }
  };
  
  /**
   * Handle cancellation (usually connected to the dialog component)
   */
  const handleCancel = () => {
    if (rejecter) {
      rejecter(new Error('User canceled the action'));
      resolver = null;
      rejecter = null;
    }
  };
  
  return {
    isOpen,
    config,
    confirm,
    confirmFileDeletion,
    handleConfirm,
    handleCancel
  };
} 