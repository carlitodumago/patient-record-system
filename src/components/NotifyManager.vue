<script setup>
import { ref, provide, inject, getCurrentInstance, onMounted } from "vue";
import ToastNotify from "./ToastNotify.vue";

const notifications = ref([]);
const notificationSymbol = Symbol();
const app = getCurrentInstance();

// Create a unique ID for each notification
let nextId = 0;

// Add a new notification
const notify = (message, options = {}) => {
  const id = nextId++;
  const notification = {
    id,
    message,
    type: options.type || "success",
    duration: options.duration !== undefined ? options.duration : 3000,
    showOkButton:
      options.showOkButton !== undefined ? options.showOkButton : true,
  };

  notifications.value.push(notification);

  // Return a method to close this notification
  return {
    close: () => {
      removeNotification(id);
    },
  };
};

// Remove a notification by ID
const removeNotification = (id) => {
  const index = notifications.value.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};

// Register the notify function globally
onMounted(() => {
  if (app && app.appContext) {
    app.appContext.app.config.globalProperties.$notify = notify;
  }
});

// Provide the notify function for child components
provide("notify", notify);
</script>

<script>
// Create a composable to use the notification system
export function useNotify() {
  return inject("notify");
}
</script>

<template>
  <div
    class="notifications-container"
    role="log"
    aria-live="polite"
    aria-label="Notifications"
    aria-atomic="false"
  >
    <TransitionGroup name="notification">
      <ToastNotify
        v-for="notification in notifications"
        :key="notification.id"
        :message="notification.message"
        :type="notification.type"
        :duration="notification.duration"
        :show-ok-button="notification.showOkButton"
        @closed="removeNotification(notification.id)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notifications-container {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 9999;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
