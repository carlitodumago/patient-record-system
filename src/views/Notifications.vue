<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useNotificationStore } from '../stores/notifications';
import { areNotificationsEnabled } from '../utils/notificationUtils';

const userStore = useUserStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const isAuthenticated = computed(() => userStore.isAuthenticated);
const user = computed(() => userStore.user);

// Check if notifications are enabled
const notificationsEnabled = computed(() => areNotificationsEnabled(user.value));

// Get notifications from Pinia store
const notifications = computed(() => notificationStore.allNotifications);

// Format time
const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000; // years
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000; // months
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400; // days
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600; // hours
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60; // minutes
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
};

// Format date and time
const formatDateTime = (date) => {
  return new Date(date).toLocaleString();
};

// Toggle notification read status
const markAsRead = (id) => {
  store.commit('markNotificationAsRead', id);
};

// Mark all as read
const markAllAsRead = () => {
  store.commit('markAllNotificationsAsRead');
};

// Delete notification
const deleteNotification = (id) => {
  store.commit('deleteNotification', id);
};

// Clear all notifications
const clearAllNotifications = () => {
  if (confirm('Are you sure you want to delete all notifications?')) {
    notifications.value.forEach(notification => {
      store.commit('deleteNotification', notification.id);
    });
  }
};

// Filter notifications
const notificationFilters = ref('all'); // 'all', 'unread', 'read'
const filteredNotifications = computed(() => {
  if (notificationFilters.value === 'all') return notifications.value;
  if (notificationFilters.value === 'unread') return notifications.value.filter(n => !n.read);
  if (notificationFilters.value === 'read') return notifications.value.filter(n => n.read);
  return notifications.value;
});

// Go to settings page
const goToSettings = () => {
  router.push('/settings');
};

// Check if user is authenticated
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login');
  }
});
</script>

<template>
  <div class="notifications-page">
    <div class="page-header">
      <h2>Notifications</h2>
      <div class="header-actions">
        <button @click="goToSettings" class="btn btn-outline-secondary me-2">
          <i class="bi bi-gear me-2"></i> <span class="action-text">Settings</span>
        </button>
        <button @click="markAllAsRead" class="btn btn-outline-primary me-2" :disabled="!notificationsEnabled">
          <i class="bi bi-check-all me-2"></i> <span class="action-text">Mark all as read</span>
        </button>
        <button @click="clearAllNotifications" class="btn btn-outline-danger" :disabled="!notificationsEnabled">
          <i class="bi bi-trash me-2"></i> <span class="action-text">Clear all</span>
        </button>
      </div>
    </div>
    
    <div class="card mb-4">
      <div class="card-body">
        <!-- Notifications disabled message -->
        <div v-if="!notificationsEnabled" class="text-center py-5">
          <i class="bi bi-bell-slash fs-1 text-muted"></i>
          <p class="mt-3 mb-2 text-muted">Notifications are currently disabled</p>
          <p class="text-muted small mb-4">You can enable notifications in the settings to receive updates.</p>
          <button @click="goToSettings" class="btn btn-primary">
            <i class="bi bi-bell me-2"></i> Enable Notifications
          </button>
        </div>
        
        <!-- Notifications enabled content -->
        <template v-else>
          <div class="filter-tabs mb-3">
            <div class="btn-group filter-buttons" role="group">
              <button 
                @click="notificationFilters = 'all'" 
                class="btn" 
                :class="notificationFilters === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
              >
                All ({{ notifications.length }})
              </button>
              <button 
                @click="notificationFilters = 'unread'" 
                class="btn" 
                :class="notificationFilters === 'unread' ? 'btn-primary' : 'btn-outline-secondary'"
              >
                Unread ({{ notifications.filter(n => !n.read).length }})
              </button>
              <button 
                @click="notificationFilters = 'read'" 
                class="btn" 
                :class="notificationFilters === 'read' ? 'btn-primary' : 'btn-outline-secondary'"
              >
                Read ({{ notifications.filter(n => n.read).length }})
              </button>
            </div>
          </div>
          
          <div v-if="filteredNotifications.length === 0" class="text-center py-5">
            <i class="bi bi-bell-slash fs-1 text-muted"></i>
            <p class="mt-3 text-muted">No notifications to display</p>
          </div>
          
          <div v-else class="notification-list">
            <div 
              v-for="notification in filteredNotifications" 
              :key="notification.id" 
              class="notification-item" 
              :class="{ 'unread': !notification.read }"
              @click="markAsRead(notification.id)"
            >
              <div class="notification-icon">
                <i class="bi" :class="{
                  'bi-info-circle text-info': notification.type === 'info',
                  'bi-check-circle text-success': notification.type === 'success',
                  'bi-exclamation-triangle text-warning': notification.type === 'warning',
                  'bi-x-circle text-danger': notification.type === 'error'
                }"></i>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time" :title="formatDateTime(notification.date)">{{ formatTimeAgo(notification.date) }}</div>
              </div>

            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 15px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.filter-tabs {
  overflow-x: auto;
  width: 100%;
}

.filter-buttons {
  display: flex;
  min-width: max-content;
}

.notification-list {
  display: flex;
  flex-direction: column;
  max-height: 500px; /* Set a fixed height for scrolling */
  overflow-y: auto; /* Enable vertical scrolling */
  scrollbar-width: thin; /* For Firefox */
  scrollbar-color: rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1); /* For Firefox */
  position: relative; /* For absolute positioning of children */
  z-index: 1; /* Establish stacking context */
}

/* Webkit scrollbar styling (Chrome, Safari, Edge) */
.notification-list::-webkit-scrollbar {
  width: 8px;
}

.notification-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.notification-item {
  padding: 16px;
  padding-right: 60px; /* Increased right padding */
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative; /* Important for positioning buttons */
  min-height: 80px; /* Minimum height for content */
  overflow: visible; /* Allow buttons to render outside */
}

.notification-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.notification-item.unread {
  background-color: rgba(13, 110, 253, 0.05);
  border-left: 4px solid var(--primary-gradient-start);
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  flex: 1;
  max-width: calc(100% - 50px); /* Ensure content doesn't hit buttons */
  overflow: hidden; /* Prevent text overflow */
}

.notification-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
  line-height: 1.3; /* Improve readability */
  word-break: break-word; /* Prevent long words from breaking layout */
}

.notification-message {
  font-size: 0.9rem;
  color: var(--text-color);
  margin-bottom: 8px;
  word-break: break-word;
  line-height: 1.4;
  overflow: visible;
  display: block;
  max-width: 100%; /* Prevent overlapping */
}

.notification-time {
  font-size: 0.8rem;
  color: #6c757d;
  display: block; /* Force new line */
}

.notification-actions {
  position: absolute; /* Position it absolutely */
  right: 10px; /* Position from right edge */
  top: 50%; /* Center vertically */
  transform: translateY(-50%); /* Center exactly */
  display: flex;
  flex-direction: column; /* Stack buttons */
  gap: 5px;
  z-index: 2; /* Place above content */
  background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent background */
  border-radius: 4px;
  padding: 5px;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

/* Add shadow to prevent legibility issues */
.notification-actions button {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: white;
}

/* Prevent action buttons from overlapping */
.notification-item .action-buttons,
.notification-item [class*="action"],
.notification-item [class*="btn-group"] {
  position: absolute !important;
  right: 10px !important;
  z-index: 100 !important;
  background-color: white !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
  border-radius: 4px !important;
  padding: 2px !important;
}

@media (max-width: 768px) {
  .notification-actions {
    opacity: 1;
    flex-direction: column;
    align-items: flex-end;
  }
  
  .notification-item {
    padding: 12px;
    padding-right: 50px; /* Maintain space for buttons */
  }
  
  .notification-list {
    max-height: 400px; /* Slightly smaller on mobile devices */
  }
}

@media (max-width: 576px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .header-actions .btn {
    flex: 1;
    padding: 6px 8px;
    font-size: 0.9rem;
  }
  
  .action-text {
    display: none;
  }
  
  .header-actions .bi {
    margin-right: 0 !important;
  }
  
  .notification-item {
    padding: 10px;
    padding-right: 45px; /* Maintain space for buttons */
    gap: 10px;
  }
  
  .notification-icon {
    font-size: 1.2rem;
    width: 20px;
    height: 20px;
  }
  
  .notification-title {
    font-size: 0.9rem;
  }
  
  .notification-message {
    font-size: 0.8rem;
  }
  
  .notification-time {
    font-size: 0.75rem;
  }
  
  .notification-list {
    max-height: 350px;
  }
}

/* Global style to force all notification action buttons to be visible without overlapping */
.notification-item * {
  z-index: auto !important;
}

/* Prevent any action buttons from appearing over notification content */
.card-body {
  isolation: isolate;
  position: relative;
  z-index: 10;
}

/* Force absolute positioning for notification items */
.notification-item {
  isolation: isolate;
  position: relative;
  z-index: 2;
}

/* Universal rule to hide any buttons that might overlap */
[class*="notification"] [class*="action-buttons"],
[class*="notification"] [class*="btn-group"]:not(.filter-buttons),
[class*="notification"] [class*="grid-btn"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Make sure the notification-actions are not affected by the universal rule */
.notification-actions,
.notification-actions button {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}
</style>