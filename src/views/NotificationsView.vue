<template>
  <div class="container-fluid mt-3">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="mb-1">Notifications</h1>
            <p class="text-muted">
              Stay updated with system alerts and reminders
            </p>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-primary"
              @click="markAllAsRead"
              :disabled="unreadCount === 0"
            >
              <i class="bi bi-check-all me-2"></i>
              Mark All Read
            </button>
            <button
              class="btn btn-outline-secondary"
              @click="refreshNotifications"
              :disabled="isRefreshing"
            >
              <i class="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
          </div>
        </div>

        <!-- Notification Statistics -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">{{ totalNotifications }}</h5>
                  <small>Total Notifications</small>
                </div>
                <i class="bi bi-bell fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">{{ unreadCount }}</h5>
                  <small>Unread</small>
                </div>
                <i class="bi bi-envelope-exclamation fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ notificationsByType("appointment").length }}
                  </h5>
                  <small>Appointments</small>
                </div>
                <i class="bi bi-calendar-event fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ notificationsByType("system").length }}
                  </h5>
                  <small>System</small>
                </div>
                <i class="bi bi-gear fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-4">
                <select
                  v-model="notificationFilters.type"
                  @change="applyFilters"
                  class="form-select"
                >
                  <option value="">All Types</option>
                  <option value="appointment">Appointments</option>
                  <option value="system">System</option>
                  <option value="medical">Medical Records</option>
                  <option value="info">Information</option>
                  <option value="warning">Warnings</option>
                  <option value="success">Success</option>
                  <option value="danger">Alerts</option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  v-model="notificationFilters.status"
                  @change="applyFilters"
                  class="form-select"
                >
                  <option value="">All Status</option>
                  <option value="read">Read</option>
                  <option value="unread">Unread</option>
                </select>
              </div>
              <div class="col-md-4">
                <div class="input-group">
                  <input
                    type="text"
                    v-model="notificationFilters.search"
                    @input="debounceSearch"
                    class="form-control"
                    placeholder="Search notifications..."
                  />
                  <button class="btn btn-outline-secondary" type="button">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="card">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">Recent Notifications</h5>
            <div class="d-flex gap-2">
              <div class="dropdown">
                <button
                  class="btn btn-sm btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i class="bi bi-filter me-2"></i>
                  Filter
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <button class="dropdown-item" @click="showUnreadOnly">
                      <i class="bi bi-envelope-exclamation me-2"></i>
                      Unread Only
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item"
                      @click="showByType('appointment')"
                    >
                      <i class="bi bi-calendar-event me-2"></i>
                      Appointments
                    </button>
                  </li>
                  <li>
                    <button class="dropdown-item" @click="showByType('system')">
                      <i class="bi bi-gear me-2"></i>
                      System
                    </button>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <button class="dropdown-item text-danger" @click="clearAll">
                      <i class="bi bi-trash me-2"></i>
                      Clear All
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div v-if="isLoading" class="text-center p-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div
              v-else-if="filteredNotifications.length === 0"
              class="text-center p-4"
            >
              <i class="bi bi-bell-slash fs-1 text-muted mb-3"></i>
              <h5 class="text-muted">No notifications found</h5>
              <p class="text-muted">You're all caught up!</p>
            </div>

            <div v-else class="list-group list-group-flush">
              <div
                v-for="notification in paginatedNotifications"
                :key="notification.id"
                class="list-group-item list-group-item-action"
                :class="{ 'unread-notification': !notification.read }"
                @click="viewNotification(notification)"
              >
                <div
                  class="d-flex w-100 justify-content-between align-items-start"
                >
                  <div class="d-flex align-items-start">
                    <div class="notification-icon me-3">
                      <i
                        :class="getNotificationIcon(notification.type)"
                        class="fs-5"
                      ></i>
                    </div>
                    <div class="flex-grow-1">
                      <div
                        class="d-flex justify-content-between align-items-start"
                      >
                        <div>
                          <h6 class="mb-1">{{ notification.title }}</h6>
                          <p class="mb-1 text-muted">
                            {{ notification.message }}
                          </p>
                          <small class="text-muted">
                            {{ formatNotificationDate(notification.date) }}
                          </small>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                          <span
                            :class="
                              getNotificationBadgeClass(notification.type)
                            "
                          >
                            {{ formatNotificationType(notification.type) }}
                          </span>
                          <div class="dropdown">
                            <button
                              class="btn btn-sm btn-outline-secondary"
                              type="button"
                              data-bs-toggle="dropdown"
                              @click.stop
                            >
                              <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu">
                              <li>
                                <button
                                  class="dropdown-item"
                                  @click.stop="markAsRead(notification.id)"
                                >
                                  <i class="bi bi-check me-2"></i>
                                  Mark as Read
                                </button>
                              </li>
                              <li>
                                <button
                                  class="dropdown-item text-danger"
                                  @click.stop="
                                    deleteNotification(notification.id)
                                  "
                                >
                                  <i class="bi bi-trash me-2"></i>
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="card-footer">
              <div class="d-flex justify-content-between align-items-center">
                <div class="text-muted">
                  Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
                  {{
                    Math.min(
                      currentPage * itemsPerPage,
                      filteredNotifications.length
                    )
                  }}
                  of {{ filteredNotifications.length }} notifications
                </div>
                <nav>
                  <ul class="pagination pagination-sm mb-0">
                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === 1 }"
                    >
                      <button
                        class="page-link"
                        @click="currentPage = Math.max(1, currentPage - 1)"
                      >
                        Previous
                      </button>
                    </li>
                    <li
                      v-for="page in visiblePages"
                      :key="page"
                      class="page-item"
                      :class="{ active: page === currentPage }"
                    >
                      <button class="page-link" @click="currentPage = page">
                        {{ page }}
                      </button>
                    </li>
                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === totalPages }"
                    >
                      <button
                        class="page-link"
                        @click="
                          currentPage = Math.min(totalPages, currentPage + 1)
                        "
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Detail Modal -->
    <div
      class="modal fade"
      :class="{ show: showNotificationModal }"
      :style="{ display: showNotificationModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedNotification?.title }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeNotificationModal"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedNotification">
              <div class="d-flex align-items-center mb-3">
                <i
                  :class="getNotificationIcon(selectedNotification.type)"
                  class="fs-4 me-3"
                ></i>
                <div>
                  <span
                    :class="
                      getNotificationBadgeClass(selectedNotification.type)
                    "
                  >
                    {{ formatNotificationType(selectedNotification.type) }}
                  </span>
                  <small class="text-muted ms-2">
                    {{ formatNotificationDate(selectedNotification.date) }}
                  </small>
                </div>
              </div>
              <p class="mb-3">{{ selectedNotification.message }}</p>
              <div
                v-if="selectedNotification.data"
                class="bg-light p-3 rounded"
              >
                <h6>Additional Information:</h6>
                <pre class="mb-0">{{
                  JSON.stringify(selectedNotification.data, null, 2)
                }}</pre>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              v-if="!selectedNotification?.read"
              type="button"
              class="btn btn-primary"
              @click="markAsRead(selectedNotification?.id)"
            >
              <i class="bi bi-check me-2"></i>
              Mark as Read
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeNotificationModal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop for modal -->
    <div
      v-if="showNotificationModal"
      class="modal-backdrop fade show"
      @click="closeNotificationModal"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useNotificationsStore } from "@/stores/notifications";

const notificationsStore = useNotificationsStore();

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

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const notificationsByType = computed(() => {
  return (type) => notifications.value.filter((n) => n.type === type);
});

// Methods
const loadNotifications = () => {
  notificationsStore.loadNotifications();
};

const refreshNotifications = async () => {
  isRefreshing.value = true;
  try {
    // In a real app, this would fetch from the server
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
  notificationsStore.markAllAsRead();
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
    notificationsStore.clearAll();
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
    appointment: "bi bi-calendar-event text-primary",
    system: "bi bi-gear text-secondary",
    medical: "bi bi-file-earmark-medical text-success",
    info: "bi bi-info-circle text-info",
    warning: "bi bi-exclamation-triangle text-warning",
    success: "bi bi-check-circle text-success",
    danger: "bi bi-exclamation-circle text-danger",
  };
  return icons[type] || "bi bi-bell text-muted";
};

const getNotificationBadgeClass = (type) => {
  const classes = {
    appointment: "badge bg-primary",
    system: "badge bg-secondary",
    medical: "badge bg-success",
    info: "badge bg-info",
    warning: "badge bg-warning text-dark",
    success: "badge bg-success",
    danger: "badge bg-danger",
  };
  return classes[type] || "badge bg-secondary";
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
