<script setup>
import {
  ref,
  provide,
  inject,
  getCurrentInstance,
  onMounted,
  readonly,
} from "vue";
import ToastNotify from "./ToastNotify.vue";

const notifications = ref([]);
const notificationSymbol = Symbol();
const app = getCurrentInstance();

// Notification settings
const soundEnabled = ref(true);
const browserNotificationsEnabled = ref(false);

// Audio context for sound effects
let audioContext = null;

// Create a unique ID for each notification
let nextId = 0;

// Initialize audio context
const initAudioContext = () => {
  if (!audioContext && typeof window !== "undefined") {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Audio context not supported:", e);
    }
  }
};

// Play notification sound
const playNotificationSound = (type = "success") => {
  if (!soundEnabled.value || !audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different notification types
    const frequencies = {
      success: 800,
      error: 400,
      warning: 600,
      info: 700,
    };

    oscillator.frequency.setValueAtTime(
      frequencies[type] || 700,
      audioContext.currentTime
    );
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.warn("Could not play notification sound:", e);
  }
};

// Request browser notification permission
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("Browser notifications not supported");
    return false;
  }

  if (Notification.permission === "granted") {
    browserNotificationsEnabled.value = true;
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    browserNotificationsEnabled.value = permission === "granted";
    return browserNotificationsEnabled.value;
  }

  return false;
};

// Show browser notification
const showBrowserNotification = (title, options = {}) => {
  if (
    !browserNotificationsEnabled.value ||
    Notification.permission !== "granted"
  ) {
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      silent: false,
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } catch (e) {
    console.warn("Could not show browser notification:", e);
    return null;
  }
};

// Enhanced notify function with real-time features
const notify = (message, options = {}) => {
  const id = nextId++;
  const notification = {
    id,
    message,
    type: options.type || "success",
    duration: options.duration !== undefined ? options.duration : 3000,
    showOkButton:
      options.showOkButton !== undefined ? options.showOkButton : true,
    persistent: options.persistent || false,
    sound: options.sound !== undefined ? options.sound : true,
    browser: options.browser !== undefined ? options.browser : false,
  };

  // Extend duration for persistent notifications
  if (notification.persistent) {
    notification.duration = options.duration || 10000; // 10 seconds for persistent
  }

  notifications.value.push(notification);

  // Play sound effect
  if (notification.sound) {
    playNotificationSound(notification.type);
  }

  // Show browser notification for important events
  if (notification.browser || notification.persistent) {
    const title = getNotificationTitle(notification.type);
    showBrowserNotification(title, {
      body: message,
      tag: `notification-${id}`,
      requireInteraction: notification.persistent,
    });
  }

  // Return a method to close this notification
  return {
    close: () => {
      removeNotification(id);
    },
  };
};

// Get notification title based on type
const getNotificationTitle = (type) => {
  const titles = {
    success: "✅ Success",
    error: "❌ Error",
    warning: "⚠️ Warning",
    info: "ℹ️ Information",
  };
  return titles[type] || "🔔 Notification";
};

// Remove a notification by ID
const removeNotification = (id) => {
  const index = notifications.value.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};

// Initialize notification system
onMounted(async () => {
  // Initialize audio context
  initAudioContext();

  // Request browser notification permission
  await requestNotificationPermission();

  // Register the notify function globally
  if (app && app.appContext) {
    app.appContext.app.config.globalProperties.$notify = notify;
  }
});

// Provide the notify function for child components
provide("notify", notify);

// Expose settings for external control
const updateNotificationSettings = (settings) => {
  if (settings.sound !== undefined) {
    soundEnabled.value = settings.sound;
  }
  if (settings.browser !== undefined) {
    browserNotificationsEnabled.value = settings.browser;
  }
};

// Export settings for use in other components
provide("notificationSettings", {
  soundEnabled: readonly(soundEnabled),
  browserNotificationsEnabled: readonly(browserNotificationsEnabled),
  updateSettings: updateNotificationSettings,
  requestPermission: requestNotificationPermission,
});
</script>

<script>
// Create a composable to use the notification system
export function useNotify() {
  return inject("notify");
}
</script>

<template>
  <div class="notifications-container">
    <TransitionGroup name="notification">
      <ToastNotify
        v-for="notification in notifications"
        :key="notification.id"
        :message="notification.message"
        :type="notification.type"
        :duration="notification.duration"
        :show-ok-button="notification.showOkButton"
        :persistent="notification.persistent"
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
