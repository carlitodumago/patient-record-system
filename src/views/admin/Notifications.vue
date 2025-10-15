<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

// Store
const store = useStore();

// Reactive data
const loading = ref(false);
const search = ref("");
const showComposeModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedNotification = ref(null);
const filterType = ref("all");
const filterStatus = ref("all");

const notifications = ref([
  {
    id: 1,
    userId: 1,
    recipientName: "Dr. Sarah Johnson",
    type: "appointment_reminder",
    title: "Upcoming Appointment Reminder",
    message:
      "You have an appointment with John Doe scheduled for tomorrow at 10:30 AM.",
    status: "sent",
    priority: "normal",
    scheduledFor: "2024-10-14T10:00:00",
    sentAt: "2024-10-14T10:00:00",
    createdAt: "2024-10-14T09:00:00",
    read: true,
  },
  {
    id: 2,
    userId: 2,
    recipientName: "Maria Santos",
    type: "appointment_reminder",
    title: "Appointment Confirmation",
    message:
      "Your appointment with Dr. Sarah Johnson has been confirmed for October 15, 2024 at 2:00 PM.",
    status: "sent",
    priority: "normal",
    scheduledFor: "2024-10-15T08:00:00",
    sentAt: "2024-10-15T08:00:00",
    createdAt: "2024-10-15T07:00:00",
    read: false,
  },
  {
    id: 3,
    userId: 3,
    recipientName: "Pedro Cruz",
    type: "system_alert",
    title: "New Patient Registration",
    message: "A new patient (Ana Reyes) has been registered in the system.",
    status: "sent",
    priority: "high",
    scheduledFor: null,
    sentAt: "2024-10-13T16:00:00",
    createdAt: "2024-10-13T16:00:00",
    read: true,
  },
  {
    id: 4,
    userId: 1,
    recipientName: "Dr. Sarah Johnson",
    type: "medical_record",
    title: "Medical Record Updated",
    message: "Medical record for patient Maria Santos has been updated.",
    status: "pending",
    priority: "normal",
    scheduledFor: "2024-10-15T15:00:00",
    sentAt: null,
    createdAt: "2024-10-15T14:00:00",
    read: false,
  },
]);

// Form data
const notificationForm = ref({
  recipientId: "",
  recipientName: "",
  type: "appointment_reminder",
  title: "",
  message: "",
  priority: "normal",
  scheduledFor: null,
});

// Computed properties
const user = computed(() => store.state.user);
const filteredNotifications = computed(() => {
  return notifications.value.filter((notification) => {
    const matchesSearch =
      notification.recipientName
        .toLowerCase()
        .includes(search.value.toLowerCase()) ||
      notification.title.toLowerCase().includes(search.value.toLowerCase()) ||
      notification.message.toLowerCase().includes(search.value.toLowerCase());

    const matchesType =
      filterType.value === "all" || notification.type === filterType.value;
    const matchesStatus =
      filterStatus.value === "all" ||
      notification.status === filterStatus.value;

    return matchesSearch && matchesType && matchesStatus;
  });
});

const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.read).length;
});

const pendingCount = computed(() => {
  return notifications.value.filter((n) => n.status === "pending").length;
});

// Methods
const fetchNotifications = async () => {
  loading.value = true;
  try {
    // Simulate API call - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Mock data is already loaded
  } catch (error) {
    console.error("Error fetching notifications:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  notificationForm.value = {
    recipientId: "",
    recipientName: "",
    type: "appointment_reminder",
    title: "",
    message: "",
    priority: "normal",
    scheduledFor: null,
  };
};

const openComposeModal = () => {
  resetForm();
  selectedNotification.value = null;
  showComposeModal.value = true;
};

const openEditModal = (notification) => {
  selectedNotification.value = notification;
  notificationForm.value = {
    recipientId: notification.userId,
    recipientName: notification.recipientName,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    priority: notification.priority,
    scheduledFor: notification.scheduledFor,
  };
  showEditModal.value = true;
};

const openDeleteModal = (notification) => {
  selectedNotification.value = notification;
  showDeleteModal.value = true;
};

const closeModals = () => {
  showComposeModal.value = false;
  showEditModal.value = false;
  showDeleteModal.value = false;
  selectedNotification.value = null;
  resetForm();
};

const composeNotification = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newNotification = {
      id: Math.max(...notifications.value.map((n) => n.id)) + 1,
      ...notificationForm.value,
      status: notificationForm.value.scheduledFor ? "pending" : "sent",
      sentAt: notificationForm.value.scheduledFor
        ? null
        : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    notifications.value.unshift(newNotification);
    closeModals();

    console.log("Notification composed successfully");
  } catch (error) {
    console.error("Error composing notification:", error);
  }
};

const updateNotification = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = notifications.value.findIndex(
      (n) => n.id === selectedNotification.value.id
    );
    if (index !== -1) {
      notifications.value[index] = {
        ...notifications.value[index],
        ...notificationForm.value,
      };
    }

    closeModals();
    console.log("Notification updated successfully");
  } catch (error) {
    console.error("Error updating notification:", error);
  }
};

const deleteNotification = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    notifications.value = notifications.value.filter(
      (n) => n.id !== selectedNotification.value.id
    );
    closeModals();
    console.log("Notification deleted successfully");
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

const markAsRead = (notification) => {
  notification.read = true;
};

const markAllAsRead = () => {
  notifications.value.forEach((n) => (n.read = true));
};

const sendNow = (notification) => {
  notification.status = "sent";
  notification.sentAt = new Date().toISOString();
  notification.scheduledFor = null;
};

const getStatusBadgeVariant = (status) => {
  const variants = {
    sent: "success",
    pending: "warning",
    failed: "danger",
  };
  return variants[status] || "secondary";
};

const getPriorityBadgeVariant = (priority) => {
  const variants = {
    low: "secondary",
    normal: "primary",
    high: "danger",
  };
  return variants[priority] || "secondary";
};

const getTypeBadgeVariant = (type) => {
  const variants = {
    appointment_reminder: "info",
    system_alert: "warning",
    medical_record: "success",
    account_update: "primary",
  };
  return variants[type] || "secondary";
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return "Not scheduled";
  return new Date(dateTime).toLocaleString();
};

const getNotificationIcon = (type) => {
  const icons = {
    appointment_reminder: "bi-calendar-event",
    system_alert: "bi-exclamation-triangle",
    medical_record: "bi-file-medical",
    account_update: "bi-person-gear",
  };
  return icons[type] || "bi-bell";
};

onMounted(() => {
  fetchNotifications();
});
</script>

<template>
  <div class="notifications-management">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Notifications</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Manage system notifications and alerts
        </p>
      </div>
      <div class="animate-fade-in-right">
        <button class="btn btn-primary" @click="openComposeModal">
          <i class="bi bi-envelope-plus me-2"></i>
          Compose Notification
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-bell text-primary fs-2"></i>
            </div>
            <h4 class="mb-1">{{ notifications.length }}</h4>
            <small class="text-muted">Total Notifications</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-100">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-envelope-exclamation text-warning fs-2"></i>
            </div>
            <h4 class="mb-1">{{ unreadCount }}</h4>
            <small class="text-muted">Unread</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-200">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-clock text-info fs-2"></i>
            </div>
            <h4 class="mb-1">{{ pendingCount }}</h4>
            <small class="text-muted">Pending</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-300">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-check-circle text-success fs-2"></i>
            </div>
            <h4 class="mb-1">
              {{
                filteredNotifications.filter((n) => n.status === "sent").length
              }}
            </h4>
            <small class="text-muted">Sent Today</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Actions -->
    <div class="card mb-4 animate-fade-in-up animation-delay-200">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <div class="search-box">
              <i class="bi bi-search search-icon"></i>
              <input
                v-model="search"
                type="text"
                class="form-control"
                placeholder="Search notifications by recipient or content..."
              />
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="filterType" class="form-select">
              <option value="all">All Types</option>
              <option value="appointment_reminder">Appointment Reminder</option>
              <option value="system_alert">System Alert</option>
              <option value="medical_record">Medical Record</option>
              <option value="account_update">Account Update</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filterStatus" class="form-select">
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div class="col-md-2">
            <div class="d-grid">
              <button
                v-if="unreadCount > 0"
                class="btn btn-outline-primary btn-sm"
                @click="markAllAsRead"
              >
                <i class="bi bi-check-all me-1"></i>
                Mark All Read
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary animate-pulse" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading notifications...</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="card animate-fade-in-up animation-delay-300">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-bell-fill me-2"></i>
          Notifications ({{ filteredNotifications.length }})
        </h5>
        <button
          class="btn btn-sm btn-outline-primary"
          @click="fetchNotifications"
          :disabled="loading"
        >
          <i
            class="bi bi-arrow-clockwise me-1"
            :class="{ 'animate-spin': loading }"
          ></i>
          Refresh
        </button>
      </div>
      <div class="card-body p-0">
        <div class="notifications-list">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="notification-item p-4 border-bottom animate-fade-in-up"
            :class="{
              unread: !notification.read,
              'bg-light': !notification.read,
            }"
          >
            <div class="d-flex align-items-start">
              <div class="notification-icon me-3">
                <i
                  :class="`${getNotificationIcon(
                    notification.type
                  )} text-${getTypeBadgeVariant(notification.type)} fs-4`"
                ></i>
              </div>

              <div class="notification-content flex-grow-1">
                <div
                  class="d-flex justify-content-between align-items-start mb-2"
                >
                  <div>
                    <h6 class="mb-1">{{ notification.title }}</h6>
                    <p class="text-muted mb-1">
                      To: <strong>{{ notification.recipientName }}</strong>
                    </p>
                  </div>
                  <div class="text-end">
                    <span
                      class="badge me-2"
                      :class="`bg-${getStatusBadgeVariant(
                        notification.status
                      )}`"
                    >
                      {{ notification.status }}
                    </span>
                    <span
                      class="badge"
                      :class="`bg-${getPriorityBadgeVariant(
                        notification.priority
                      )}`"
                    >
                      {{ notification.priority }}
                    </span>
                  </div>
                </div>

                <p class="mb-2">{{ notification.message }}</p>

                <div
                  class="notification-meta d-flex justify-content-between align-items-center"
                >
                  <div class="text-muted">
                    <small>
                      <i class="bi bi-clock me-1"></i>
                      Created: {{ formatDateTime(notification.createdAt) }}
                    </small>
                    <small v-if="notification.sentAt" class="ms-3">
                      <i class="bi bi-send me-1"></i>
                      Sent: {{ formatDateTime(notification.sentAt) }}
                    </small>
                    <small v-if="notification.scheduledFor" class="ms-3">
                      <i class="bi bi-calendar-event me-1"></i>
                      Scheduled: {{ formatDateTime(notification.scheduledFor) }}
                    </small>
                  </div>

                  <div class="notification-actions">
                    <button
                      v-if="!notification.read"
                      class="btn btn-sm btn-outline-primary me-2"
                      @click="markAsRead(notification)"
                    >
                      <i class="bi bi-check me-1"></i>
                      Mark Read
                    </button>
                    <button
                      v-if="notification.status === 'pending'"
                      class="btn btn-sm btn-success me-2"
                      @click="sendNow(notification)"
                    >
                      <i class="bi bi-send me-1"></i>
                      Send Now
                    </button>
                    <div class="btn-group">
                      <button
                        class="btn btn-sm btn-outline-secondary"
                        @click="openEditModal(notification)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="openDeleteModal(notification)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredNotifications.length === 0" class="text-center py-5">
          <i class="bi bi-bell-slash text-muted fs-1 mb-3"></i>
          <h5 class="text-muted">No notifications found</h5>
          <p class="text-muted mb-3">
            {{
              search || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No notifications have been sent yet."
            }}
          </p>
          <button
            v-if="!search && filterType === 'all' && filterStatus === 'all'"
            class="btn btn-primary"
            @click="openComposeModal"
          >
            <i class="bi bi-envelope-plus me-2"></i>
            Send First Notification
          </button>
        </div>
      </div>
    </div>

    <!-- Compose Notification Modal -->
    <div
      class="modal fade"
      :class="{ show: showComposeModal }"
      :style="{ display: showComposeModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-envelope-plus me-2"></i>
              Compose Notification
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="composeNotification">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Recipient *</label>
                  <input
                    v-model="notificationForm.recipientName"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Type *</label>
                  <select
                    v-model="notificationForm.type"
                    class="form-select"
                    required
                  >
                    <option value="appointment_reminder">
                      Appointment Reminder
                    </option>
                    <option value="system_alert">System Alert</option>
                    <option value="medical_record">
                      Medical Record Update
                    </option>
                    <option value="account_update">Account Update</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Title *</label>
                  <input
                    v-model="notificationForm.title"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Message *</label>
                  <textarea
                    v-model="notificationForm.message"
                    class="form-control"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Priority</label>
                  <select
                    v-model="notificationForm.priority"
                    class="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Schedule For (Optional)</label>
                  <input
                    v-model="notificationForm.scheduledFor"
                    type="datetime-local"
                    class="form-control"
                  />
                  <small class="text-muted"
                    >Leave empty to send immediately</small
                  >
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModals"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-send me-2"></i>
                {{
                  notificationForm.scheduledFor
                    ? "Schedule Notification"
                    : "Send Notification"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Notification Modal -->
    <div
      class="modal fade"
      :class="{ show: showEditModal }"
      :style="{ display: showEditModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Edit Notification
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="updateNotification">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Recipient *</label>
                  <input
                    v-model="notificationForm.recipientName"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Type *</label>
                  <select
                    v-model="notificationForm.type"
                    class="form-select"
                    required
                  >
                    <option value="appointment_reminder">
                      Appointment Reminder
                    </option>
                    <option value="system_alert">System Alert</option>
                    <option value="medical_record">
                      Medical Record Update
                    </option>
                    <option value="account_update">Account Update</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Title *</label>
                  <input
                    v-model="notificationForm.title"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Message *</label>
                  <textarea
                    v-model="notificationForm.message"
                    class="form-control"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Priority</label>
                  <select
                    v-model="notificationForm.priority"
                    class="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Schedule For (Optional)</label>
                  <input
                    v-model="notificationForm.scheduledFor"
                    type="datetime-local"
                    class="form-control"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModals"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-check-lg me-2"></i>
                Update Notification
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      :class="{ show: showDeleteModal }"
      :style="{ display: showDeleteModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Confirm Deletion
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this notification?</p>
            <div v-if="selectedNotification" class="alert alert-warning">
              <strong>{{ selectedNotification.title }}</strong
              ><br />
              <small>{{ selectedNotification.recipientName }}</small>
            </div>
            <p class="text-muted mb-0">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModals"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-danger"
              @click="deleteNotification"
            >
              <i class="bi bi-trash me-2"></i>
              Delete Notification
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showComposeModal || showEditModal || showDeleteModal"
      class="modal-backdrop fade show"
      @click="closeModals"
    ></div>
  </div>
</template>

<style scoped>
.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
}

.search-box input {
  padding-left: 40px;
}

.notification-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.notifications-list {
  max-height: 600px;
  overflow-y: auto;
}

.notification-item {
  transition: all 0.2s ease;
}

.notification-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.notification-item.unread {
  border-left: 4px solid var(--primary-gradient-start);
}

.notification-content {
  min-width: 0;
}

.notification-meta {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.notification-actions .btn {
  font-size: 0.8rem;
}

/* Animation for spinner */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }

  .notification-meta {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }

  .notification-actions {
    justify-content: center;
  }
}
</style>
