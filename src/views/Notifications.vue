<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { areNotificationsEnabled } from '../utils/notificationUtils';

const store = useStore();
const router = useRouter();
const isAuthenticated = computed(() => store.state.isAuthenticated);
const user = computed(() => store.state.user);

// Check if notifications are enabled
const notificationsEnabled = computed(() => areNotificationsEnabled(user.value));

// Get notifications from Vuex store
const notifications = computed(() => store.state.notifications);

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
const filterType = ref(null);
const filterStatus = ref('all');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showDetailModal = ref(false);
const selectedNotification = ref(null);
const showSnackbar = ref(false);
const snackbarTitle = ref('');
const snackbarMessage = ref('');
const snackbarColor = ref('info');
const snackbarIcon = ref('mdi-information');
const snackbarAction = ref(null);

// Options
const filterOptions = [
  { title: 'Appointment', value: 'appointment' },
  { title: 'Medical Record', value: 'medical_record' },
  { title: 'Prescription', value: 'prescription' },
  { title: 'System', value: 'system' },
  { title: 'Alert', value: 'alert' },
];

const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Read', value: 'read' },
  { title: 'Unread', value: 'unread' },
];

const filteredNotifications = computed(() => {
  let filtered = notifications.value;

  if (filterType.value) {
    filtered = filtered.filter(n => n.type === filterType.value);
  }

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(n => n.read === (filterStatus.value === 'read'));
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.message.toLowerCase().includes(query)
    );
  }

  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredNotifications.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage.value);
});

const totalNotifications = computed(() => notifications.value.length);
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);
const readCount = computed(() => notifications.value.filter(n => n.read).length);
const todayCount = computed(() => {
  const today = new Date().toDateString();
  return notifications.value.filter(n => new Date(n.timestamp).toDateString() === today).length;
});

const hasUnreadNotifications = computed(() => unreadCount.value > 0);

// Methods
const applyFilters = () => {
  currentPage.value = 1;
};

const debounceSearch = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(applyFilters, 300);
  };
})();

const toggleNotification = (notification) => {
  selectedNotification.value = notification;
  showDetailModal.value = true;

  if (!notification.read) {
    markAsRead(notification.id);
  }
};

const handleNotificationAction = (notification) => {
  // Handle specific notification actions
  switch (notification.type) {
    case 'appointment':
      router.push('/calendar');
      break;
    case 'medical_record':
      router.push('/medical-records');
      break;
    case 'prescription':
      router.push('/prescriptions');
      break;
    default:
      console.log('Action for notification:', notification);
  }

  showDetailModal.value = false;
};

const showRealTimeNotification = (notification) => {
  snackbarTitle.value = notification.title;
  snackbarMessage.value = notification.message;
  snackbarColor.value = getPriorityColor(notification.priority);
  snackbarIcon.value = getNotificationIcon(notification.type).icon;

  if (notification.actionRequired) {
    snackbarAction.value = {
      text: notification.actionText || 'View',
      callback: () => handleNotificationAction(notification),
    };
  } else {
    snackbarAction.value = null;
  }

  showSnackbar.value = true;
};

// Helper functions for icons and colors
const getNotificationIcon = (type) => {
  const icons = {
    appointment: { icon: 'mdi-calendar-clock', color: 'primary' },
    medical_record: { icon: 'mdi-file-document', color: 'success' },
    prescription: { icon: 'mdi-pill', color: 'warning' },
    system: { icon: 'mdi-cog', color: 'info' },
    alert: { icon: 'mdi-alert', color: 'error' },
  };
  return icons[type] || { icon: 'mdi-bell', color: 'grey' };
};

const getPriorityColor = (priority) => {
  const colors = {
    low: 'grey',
    normal: 'blue',
    high: 'orange',
    urgent: 'red',
  };
  return colors[priority] || 'blue';
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

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
  <v-container fluid class="mt-3">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <h1 class="mb-1">Notifications Center</h1>
              <p class="text-caption text-medium-emphasis">
                Stay updated with important alerts and messages
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                variant="outlined"
                @click="markAllAsRead"
                :disabled="!hasUnreadNotifications"
                prepend-icon="mdi-check-all"
              >
                Mark All Read
              </v-btn>
              <v-btn
                variant="outlined"
                color="error"
                @click="clearAllNotifications"
                :disabled="notifications.length === 0"
                prepend-icon="mdi-delete-sweep"
              >
                Clear All
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text>
            <!-- Notification Filters -->
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-select
                  v-model="filterType"
                  :items="filterOptions"
                  label="Filter by Type"
                  variant="outlined"
                  clearable
                  @update:model-value="applyFilters"
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="filterStatus"
                  :items="statusOptions"
                  label="Filter by Status"
                  variant="outlined"
                  @update:model-value="applyFilters"
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="Search Notifications"
                  variant="outlined"
                  prepend-inner-icon="mdi-magnify"
                  @input="debounceSearch"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Notification Stats -->
            <v-row class="mb-4">
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="text-center pa-3">
                  <div class="text-h4 text-primary">{{ totalNotifications }}</div>
                  <div class="text-caption">Total</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="text-center pa-3">
                  <div class="text-h4 text-warning">{{ unreadCount }}</div>
                  <div class="text-caption">Unread</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="text-center pa-3">
                  <div class="text-h4 text-success">{{ readCount }}</div>
                  <div class="text-caption">Read</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="text-center pa-3">
                  <div class="text-h4 text-info">{{ todayCount }}</div>
                  <div class="text-caption">Today</div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Notifications List -->
            <div v-if="filteredNotifications.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-bell-off</v-icon>
              <div class="text-h6 text-medium-emphasis mb-2">No notifications found</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ searchQuery || filterType || filterStatus !== 'all' ? 'Try adjusting your filters' : 'You\'re all caught up!' }}
              </div>
            </div>

            <v-list v-else class="notification-list">
              <v-list-item
                v-for="notification in paginatedNotifications"
                :key="notification.id"
                :class="{ 'notification-unread': !notification.read }"
                class="notification-item mb-2"
                @click="toggleNotification(notification)"
              >
                <template v-slot:prepend>
                  <v-avatar
                    :color="getNotificationIcon(notification.type).color"
                    size="40"
                    class="mr-3"
                  >
                    <v-icon :icon="getNotificationIcon(notification.type).icon" color="white"></v-icon>
                  </v-avatar>
                </template>

                <v-list-item-content>
                  <div class="d-flex justify-space-between align-start mb-1">
                    <v-list-item-title class="notification-title">
                      {{ notification.title }}
                    </v-list-item-title>
                    <div class="d-flex align-center gap-2">
                      <v-chip
                        :color="getPriorityColor(notification.priority)"
                        size="small"
                        variant="flat"
                      >
                        {{ notification.priority }}
                      </v-chip>
                      <v-chip
                        v-if="!notification.read"
                        color="primary"
                        size="small"
                        variant="flat"
                      >
                        New
                      </v-chip>
                    </div>
                  </div>

                  <v-list-item-subtitle class="notification-message mb-2">
                    {{ notification.message }}
                  </v-list-item-subtitle>

                  <div class="d-flex justify-space-between align-center">
                    <div class="notification-meta">
                      <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                      <span class="text-caption">{{ formatTimestamp(notification.timestamp) }}</span>
                      <v-chip
                        v-if="notification.category"
                        size="small"
                        variant="outlined"
                        class="ml-2"
                      >
                        {{ notification.category }}
                      </v-chip>
                    </div>

                    <div class="notification-actions">
                      <v-btn
                        v-if="!notification.read"
                        icon
                        size="small"
                        variant="text"
                        @click.stop="markAsRead(notification.id)"
                        title="Mark as read"
                      >
                        <v-icon>mdi-check</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="error"
                        @click.stop="deleteNotification(notification.id)"
                        title="Delete notification"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-list-item-content>

                <template v-slot:append>
                  <v-btn
                    v-if="notification.actionRequired"
                    color="primary"
                    size="small"
                    @click.stop="handleNotificationAction(notification)"
                  >
                    {{ notification.actionText || 'Take Action' }}
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>

            <!-- Pagination -->
            <v-pagination
              v-if="totalPages > 1"
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
              class="mt-4"
            ></v-pagination>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Notification Detail Modal -->
    <v-dialog
      v-model="showDetailModal"
      max-width="600px"
    >
      <v-card v-if="selectedNotification">
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-avatar
              :color="getNotificationIcon(selectedNotification.type).color"
              size="40"
              class="mr-3"
            >
              <v-icon :icon="getNotificationIcon(selectedNotification.type).icon" color="white"></v-icon>
            </v-avatar>
            <div>
              <div class="text-h6">{{ selectedNotification.title }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ formatTimestamp(selectedNotification.timestamp) }}
              </div>
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            @click="showDetailModal = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-chip
            :color="getPriorityColor(selectedNotification.priority)"
            variant="flat"
            class="mb-3"
          >
            {{ selectedNotification.priority }}
          </v-chip>

          <div class="notification-detail-message mb-4">
            {{ selectedNotification.message }}
          </div>

          <v-divider class="my-4"></v-divider>

          <div v-if="selectedNotification.details" class="notification-details">
            <h4 class="mb-2">Additional Details</h4>
            <div v-html="selectedNotification.details"></div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-if="selectedNotification.actionRequired"
            color="primary"
            @click="handleNotificationAction(selectedNotification)"
          >
            {{ selectedNotification.actionText || 'Take Action' }}
          </v-btn>
          <v-btn
            variant="text"
            @click="showDetailModal = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Real-time Notification Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="5000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbarIcon }}</v-icon>
        <div>
          <div class="font-weight-medium">{{ snackbarTitle }}</div>
          <div class="text-body-2">{{ snackbarMessage }}</div>
        </div>
      </div>

      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="showSnackbar = false"
        >
          Close
        </v-btn>
        <v-btn
          v-if="snackbarAction"
          variant="text"
          @click="snackbarAction.callback"
        >
          {{ snackbarAction.text }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.notification-list {
  max-height: 500px;
  overflow-y: auto;
}

.notification-item.unread {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-left: 4px solid rgb(var(--v-theme-primary));
}
</style>
