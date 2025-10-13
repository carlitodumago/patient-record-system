<template>
  <v-container class="mt-3">
    <v-row>
      <v-col cols="12">
        <v-row class="mb-4" align="center" justify="space-between">
          <v-col>
            <h1 class="mb-1">Notifications</h1>
            <p class="text--secondary">
              Stay updated with system alerts and reminders
            </p>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="primary"
              outlined
              @click="markAllAsRead"
              :disabled="unreadCount === 0"
              class="me-2"
            >
              <v-icon left>mdi-check-all</v-icon>
              Mark All Read
            </v-btn>
            <v-btn
              color="secondary"
              outlined
              @click="refreshNotifications"
              :disabled="isRefreshing"
            >
              <v-icon left>mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </v-col>
        </v-row>

        <!-- Notification Statistics -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card color="primary" dark>
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h5 mb-1">{{ totalNotifications }}</div>
                  <div class="text-caption">Total Notifications</div>
                </div>
                <v-icon size="48">mdi-bell</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="warning" dark>
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h5 mb-1">{{ unreadCount }}</div>
                  <div class="text-caption">Unread</div>
                </div>
                <v-icon size="48">mdi-email-alert</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="info" dark>
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h5 mb-1">
                    {{ notificationsByType("appointment").length }}
                  </div>
                  <div class="text-caption">Appointments</div>
                </div>
                <v-icon size="48">mdi-calendar</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="success" dark>
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h5 mb-1">
                    {{ notificationsByType("system").length }}
                  </div>
                  <div class="text-caption">System</div>
                </div>
                <v-icon size="48">mdi-cog</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Filters -->
        <v-card class="mb-4">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-select
                  v-model="notificationFilters.type"
                  @change="applyFilters"
                  :items="notificationTypes"
                  label="All Types"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="notificationFilters.status"
                  @change="applyFilters"
                  :items="statusOptions"
                  label="All Status"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="notificationFilters.search"
                  @input="debounceSearch"
                  label="Search notifications..."
                  prepend-inner-icon="mdi-magnify"
                  clearable
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Notifications List -->
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Recent Notifications</span>
            <v-menu>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-filter</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="showUnreadOnly">
                  <v-list-item-icon>
                    <v-icon>mdi-email-alert</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Unread Only</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item @click="showByType('appointment')">
                  <v-list-item-icon>
                    <v-icon>mdi-calendar</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Appointments</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item @click="showByType('system')">
                  <v-list-item-icon>
                    <v-icon>mdi-cog</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>System</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="clearAll" class="error--text">
                  <v-list-item-icon>
                    <v-icon color="error">mdi-delete</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Clear All</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-title>

          <v-card-text class="pa-0">
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              color="primary"
              class="d-block mx-auto my-4"
            ></v-progress-circular>

            <div
              v-else-if="filteredNotifications.length === 0"
              class="text-center pa-4"
            >
              <v-icon size="64" color="grey lighten-1" class="mb-3"
                >mdi-bell-off</v-icon
              >
              <h3 class="text--secondary">No notifications found</h3>
              <p class="text--secondary">You're all caught up!</p>
            </div>

            <v-list v-else>
              <v-list-item
                v-for="notification in paginatedNotifications"
                :key="notification.id"
                @click="viewNotification(notification)"
                :class="{ 'unread-notification': !notification.read }"
              >
                <v-list-item-avatar>
                  <v-icon :color="getNotificationIconColor(notification.type)">
                    {{ getNotificationIcon(notification.type) }}
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{
                    notification.title
                  }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    notification.message
                  }}</v-list-item-subtitle>
                  <div class="d-flex align-center mt-2">
                    <v-chip
                      :color="getNotificationChipColor(notification.type)"
                      small
                      class="me-2"
                    >
                      {{ formatNotificationType(notification.type) }}
                    </v-chip>
                    <span class="text-caption text--secondary">
                      {{ formatNotificationDate(notification.date) }}
                    </span>
                  </div>
                </v-list-item-content>
                <v-list-item-action>
                  <v-menu>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on" @click.stop>
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click.stop="markAsRead(notification.id)">
                        <v-list-item-icon>
                          <v-icon>mdi-check</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>Mark as Read</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item
                        @click.stop="deleteNotification(notification.id)"
                        class="error--text"
                      >
                        <v-list-item-icon>
                          <v-icon color="error">mdi-delete</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>Delete</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <!-- Pagination -->
            <v-card-actions v-if="totalPages > 1" class="justify-space-between">
              <div class="text-caption text--secondary">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
                {{
                  Math.min(
                    currentPage * itemsPerPage,
                    filteredNotifications.length
                  )
                }}
                of {{ filteredNotifications.length }} notifications
              </div>
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="5"
              ></v-pagination>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Notification Detail Dialog -->
    <v-dialog v-model="showNotificationModal" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon
            :color="getNotificationIconColor(selectedNotification?.type)"
            class="me-3"
          >
            {{ getNotificationIcon(selectedNotification?.type) }}
          </v-icon>
          {{ selectedNotification?.title }}
          <v-spacer></v-spacer>
          <v-btn icon @click="closeNotificationModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="selectedNotification">
            <v-chip
              :color="getNotificationChipColor(selectedNotification.type)"
              class="mb-3"
            >
              {{ formatNotificationType(selectedNotification.type) }}
            </v-chip>
            <p class="mb-3">{{ selectedNotification.message }}</p>
            <div class="text-caption text--secondary mb-3">
              {{ formatNotificationDate(selectedNotification.date) }}
            </div>
            <v-card v-if="selectedNotification.data" outlined class="pa-3">
              <div class="text-subtitle-2 mb-2">Additional Information:</div>
              <pre class="text-body-2">{{
                JSON.stringify(selectedNotification.data, null, 2)
              }}</pre>
            </v-card>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-if="!selectedNotification?.read"
            color="primary"
            @click="markAsRead(selectedNotification?.id)"
          >
            <v-icon left>mdi-check</v-icon>
            Mark as Read
          </v-btn>
          <v-btn color="secondary" @click="closeNotificationModal">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useNotificationsStore } from "@/stores/notifications";
import { useAuthStore } from "@/stores/auth";

const notificationsStore = useNotificationsStore();
const authStore = useAuthStore();

// Reactive data
const isLoading = ref(false);
const isRefreshing = ref(false);
const showNotificationModal = ref(false);
const selectedNotification = ref(null);

const notificationFilters = ref({
  search: "",
  type: "",
  status: "",
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

// Data for selects
const notificationTypes = [
  { text: "Appointments", value: "appointment" },
  { text: "System", value: "system" },
  { text: "Medical Records", value: "medical" },
  { text: "Information", value: "info" },
  { text: "Warnings", value: "warning" },
  { text: "Success", value: "success" },
  { text: "Alerts", value: "danger" },
];

const statusOptions = [
  { text: "Read", value: "read" },
  { text: "Unread", value: "unread" },
];

// Computed properties
const notifications = computed(() => notificationsStore.notifications);
const unreadCount = computed(() => notificationsStore.unreadCount);
const totalNotifications = computed(() => notifications.length);

const filteredNotifications = computed(() => {
  let filtered = [...notifications.value];

  // Apply search filter
  if (notificationFilters.value.search) {
    const search = notificationFilters.value.search.toLowerCase();
    filtered = filtered.filter(
      (notification) =>
        notification.title.toLowerCase().includes(search) ||
        notification.message.toLowerCase().includes(search)
    );
  }

  // Apply type filter
  if (notificationFilters.value.type) {
    filtered = filtered.filter(
      (notification) => notification.type === notificationFilters.value.type
    );
  }

  // Apply status filter
  if (notificationFilters.value.status) {
    if (notificationFilters.value.status === "read") {
      filtered = filtered.filter((notification) => notification.read);
    } else if (notificationFilters.value.status === "unread") {
      filtered = filtered.filter((notification) => !notification.read);
    }
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  return filtered;
});

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredNotifications.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage.value);
});

const notificationsByType = computed(() => {
  return (type) => notifications.value.filter((n) => n.type === type);
});

// Methods
const loadNotifications = async () => {
  if (authStore.user?.id) {
    await notificationsStore.loadNotifications(authStore.user.id);
  }
};

const refreshNotifications = async () => {
  isRefreshing.value = true;
  try {
    await loadNotifications();
  } finally {
    isRefreshing.value = false;
  }
};

const markAsRead = (notificationId) => {
  notificationsStore.markAsRead(notificationId);

  // If the selected notification was marked as read, update it
  if (selectedNotification.value?.id === notificationId) {
    selectedNotification.value.read = true;
  }
};

const markAllAsRead = () => {
  if (authStore.user?.id) {
    notificationsStore.markAllAsRead(authStore.user.id);
  }
};

const deleteNotification = (notificationId) => {
  if (confirm("Delete this notification?")) {
    notificationsStore.deleteNotification(notificationId);

    // Close modal if the deleted notification was selected
    if (selectedNotification.value?.id === notificationId) {
      closeNotificationModal();
    }
  }
};

const clearAll = () => {
  if (confirm("Delete all notifications? This action cannot be undone.")) {
    if (authStore.user?.id) {
      notificationsStore.clearAll(authStore.user.id);
    }
    closeNotificationModal();
  }
};

const viewNotification = (notification) => {
  selectedNotification.value = notification;
  showNotificationModal.value = true;

  // Mark as read if it wasn't already
  if (!notification.read) {
    markAsRead(notification.id);
  }
};

const closeNotificationModal = () => {
  showNotificationModal.value = false;
  selectedNotification.value = null;
};

const applyFilters = () => {
  currentPage.value = 1;
};

const showUnreadOnly = () => {
  notificationFilters.value.status = "unread";
  currentPage.value = 1;
};

const showByType = (type) => {
  notificationFilters.value.type = type;
  currentPage.value = 1;
};

const debounceSearch = debounce(() => {
  currentPage.value = 1;
}, 500);

// Helper functions
const getNotificationIcon = (type) => {
  const icons = {
    appointment: "mdi-calendar",
    system: "mdi-cog",
    medical: "mdi-file-document",
    info: "mdi-information",
    warning: "mdi-alert",
    success: "mdi-check-circle",
    danger: "mdi-alert-circle",
  };
  return icons[type] || "mdi-bell";
};

const getNotificationIconColor = (type) => {
  const colors = {
    appointment: "primary",
    system: "secondary",
    medical: "success",
    info: "info",
    warning: "warning",
    success: "success",
    danger: "error",
  };
  return colors[type] || "grey";
};

const getNotificationChipColor = (type) => {
  const colors = {
    appointment: "primary",
    system: "secondary",
    medical: "success",
    info: "info",
    warning: "warning",
    success: "success",
    danger: "error",
  };
  return colors[type] || "grey";
};

const formatNotificationType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatNotificationDate = (date) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInHours = Math.abs(now - notificationDate) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 168) {
    // 1 week
    const days = Math.floor(diffInHours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else {
    return notificationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Lifecycle
onMounted(() => {
  loadNotifications();
  if (authStore.user?.id) {
    notificationsStore.subscribeToNotifications(authStore.user.id);
  }
});

onUnmounted(() => {
  notificationsStore.unsubscribeFromNotifications();
});
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.list-group-item {
  border-left: none;
  border-right: none;
  border-radius: 0;
  padding: 1rem 1.25rem;
  transition: background-color 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

.unread-notification {
  background-color: #f0f8ff;
  border-left: 4px solid #0d6efd;
}

.notification-icon {
  min-width: 2.5rem;
  text-align: center;
}

.modal-content {
  border-radius: 10px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.dropdown-toggle::after {
  display: none;
}

pre {
  font-size: 0.875rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem;
}
</style>
