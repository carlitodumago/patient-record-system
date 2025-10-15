<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

// Store
const store = useStore();

// Reactive data
const loading = ref(false);
const search = ref("");
const filterType = ref("all");
const filterStatus = ref("all");

const notifications = ref([
  {
    id: 1,
    type: "appointment_reminder",
    title: "Upcoming Appointment",
    message:
      "You have an appointment with John Doe scheduled for tomorrow at 10:30 AM.",
    priority: "normal",
    status: "unread",
    createdAt: "2024-10-14T10:00:00",
    relatedPatient: "John Doe",
    relatedAppointment: 1,
  },
  {
    id: 2,
    type: "appointment_reminder",
    title: "Appointment Confirmation",
    message:
      "Your appointment with Maria Santos has been confirmed for October 15, 2024 at 2:00 PM.",
    priority: "normal",
    status: "read",
    createdAt: "2024-10-15T08:00:00",
    relatedPatient: "Maria Santos",
    relatedAppointment: 2,
  },
  {
    id: 3,
    type: "system_alert",
    title: "New Patient Registration",
    message:
      "A new patient (Ana Reyes) has been registered and assigned to your care.",
    priority: "high",
    status: "unread",
    createdAt: "2024-10-13T16:00:00",
    relatedPatient: "Ana Reyes",
    relatedAppointment: null,
  },
  {
    id: 4,
    type: "medical_record",
    title: "Medical Record Updated",
    message:
      "Medical record for patient Pedro Cruz has been updated by Dr. Sarah Johnson.",
    priority: "normal",
    status: "read",
    createdAt: "2024-10-15T14:00:00",
    relatedPatient: "Pedro Cruz",
    relatedAppointment: null,
  },
  {
    id: 5,
    type: "appointment_reminder",
    title: "Appointment Completed",
    message:
      "Vaccination appointment for Luis Mendoza has been completed successfully.",
    priority: "low",
    status: "read",
    createdAt: "2024-10-15T15:30:00",
    relatedPatient: "Luis Mendoza",
    relatedAppointment: 3,
  },
]);

// Computed properties
const user = computed(() => store.state.user);
const filteredNotifications = computed(() => {
  return notifications.value.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(search.value.toLowerCase()) ||
      notification.message.toLowerCase().includes(search.value.toLowerCase()) ||
      (notification.relatedPatient &&
        notification.relatedPatient
          .toLowerCase()
          .includes(search.value.toLowerCase()));

    const matchesType =
      filterType.value === "all" || notification.type === filterType.value;
    const matchesStatus =
      filterStatus.value === "all" ||
      notification.status === filterStatus.value;

    return matchesSearch && matchesType && matchesStatus;
  });
});

const unreadCount = computed(() => {
  return notifications.value.filter((n) => n.status === "unread").length;
});

const highPriorityCount = computed(() => {
  return notifications.value.filter(
    (n) => n.priority === "high" && n.status === "unread"
  ).length;
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

const markAsRead = (notification) => {
  notification.status = "read";
};

const markAllAsRead = () => {
  notifications.value.forEach((n) => (n.status = "read"));
};

const deleteNotification = (notification) => {
  const index = notifications.value.findIndex((n) => n.id === notification.id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};

const getStatusBadgeVariant = (status) => {
  return status === "read" ? "success" : "warning";
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

const getNotificationIcon = (type) => {
  const icons = {
    appointment_reminder: "bi-calendar-event",
    system_alert: "bi-exclamation-triangle",
    medical_record: "bi-file-medical",
    account_update: "bi-person-gear",
  };
  return icons[type] || "bi-bell";
};

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString();
};

const viewPatientRecord = (patientName) => {
  console.log("Viewing patient record for:", patientName);
  // In a real application, this would navigate to the patient's record
  alert(`View patient record for ${patientName} would be implemented here`);
};

const viewAppointment = (appointmentId) => {
  console.log("Viewing appointment:", appointmentId);
  // In a real application, this would navigate to the appointment details
  alert(`View appointment ${appointmentId} would be implemented here`);
};

onMounted(() => {
  fetchNotifications();
});
</script>

<template>
  <div class="nurse-notifications">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Notifications</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          View your personal notifications and alerts
        </p>
      </div>
      <div class="animate-fade-in-right">
        <div class="d-flex gap-2">
          <button
            v-if="unreadCount > 0"
            class="btn btn-outline-primary"
            @click="markAllAsRead"
          >
            <i class="bi bi-check-all me-2"></i>
            Mark All Read
          </button>
          <button
            class="btn btn-primary"
            @click="fetchNotifications"
            :disabled="loading"
          >
            <i
              class="bi bi-arrow-clockwise me-2"
              :class="{ 'animate-spin': loading }"
            ></i>
            Refresh
          </button>
        </div>
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
              <i class="bi bi-exclamation-triangle text-danger fs-2"></i>
            </div>
            <h4 class="mb-1">{{ highPriorityCount }}</h4>
            <small class="text-muted">High Priority</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-300">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-calendar-check text-success fs-2"></i>
            </div>
            <h4 class="mb-1">
              {{
                filteredNotifications.filter(
                  (n) => n.type === "appointment_reminder"
                ).length
              }}
            </h4>
            <small class="text-muted">Appointment Related</small>
          </div>
        </div>
      </div>
    </div>

    <!-- High Priority Alert -->
    <div
      v-if="highPriorityCount > 0"
      class="alert alert-danger animate-fade-in-up animation-delay-200"
    >
      <div class="d-flex align-items-center">
        <div class="alert-icon me-3">
          <i class="bi bi-exclamation-triangle text-danger fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h6 class="alert-heading mb-1">
            High Priority Notifications Require Attention
          </h6>
          <p class="mb-0">
            You have {{ highPriorityCount }} high priority notification(s) that
            need immediate attention.
          </p>
        </div>
        <button class="btn btn-danger btn-sm">
          <i class="bi bi-eye me-1"></i>
          View High Priority
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card mb-4 animate-fade-in-up animation-delay-300">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="search-box">
              <i class="bi bi-search search-icon"></i>
              <input
                v-model="search"
                type="text"
                class="form-control"
                placeholder="Search notifications by content or patient..."
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
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
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
    <div v-else class="card animate-fade-in-up animation-delay-400">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-bell-fill me-2"></i>
          Notifications ({{ filteredNotifications.length }})
        </h5>
        <div class="d-flex align-items-center gap-2">
          <span v-if="unreadCount > 0" class="badge bg-warning text-dark">
            {{ unreadCount }} unread
          </span>
          <span v-if="highPriorityCount > 0" class="badge bg-danger">
            {{ highPriorityCount }} high priority
          </span>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="notifications-list">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="notification-item p-4 border-bottom animate-fade-in-up"
            :class="{
              unread: notification.status === 'unread',
              'bg-light': notification.status === 'unread',
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
                    <div v-if="notification.relatedPatient" class="mb-1">
                      <span class="badge bg-info me-2"
                        >Patient: {{ notification.relatedPatient }}</span
                      >
                    </div>
                  </div>
                  <div class="text-end">
                    <span
                      class="badge me-2"
                      :class="`bg-${getPriorityBadgeVariant(
                        notification.priority
                      )}`"
                    >
                      {{ notification.priority }}
                    </span>
                    <span
                      class="badge"
                      :class="`bg-${getStatusBadgeVariant(
                        notification.status
                      )}`"
                    >
                      {{ notification.status }}
                    </span>
                  </div>
                </div>

                <p class="mb-3">{{ notification.message }}</p>

                <div
                  class="notification-meta d-flex justify-content-between align-items-center"
                >
                  <div class="text-muted">
                    <small>
                      <i class="bi bi-clock me-1"></i>
                      {{ formatDateTime(notification.createdAt) }}
                    </small>
                  </div>

                  <div class="notification-actions">
                    <button
                      v-if="notification.status === 'unread'"
                      class="btn btn-sm btn-outline-primary me-2"
                      @click="markAsRead(notification)"
                    >
                      <i class="bi bi-check me-1"></i>
                      Mark Read
                    </button>

                    <div
                      v-if="notification.relatedPatient"
                      class="btn-group me-2"
                    >
                      <button
                        class="btn btn-sm btn-outline-info"
                        @click="viewPatientRecord(notification.relatedPatient)"
                      >
                        <i class="bi bi-person me-1"></i>
                        View Patient
                      </button>
                    </div>

                    <div
                      v-if="notification.relatedAppointment"
                      class="btn-group me-2"
                    >
                      <button
                        class="btn btn-sm btn-outline-success"
                        @click="
                          viewAppointment(notification.relatedAppointment)
                        "
                      >
                        <i class="bi bi-calendar me-1"></i>
                        View Appointment
                      </button>
                    </div>

                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteNotification(notification)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
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
                : "You have no notifications at this time."
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Notification Categories -->
    <div class="row g-4 mt-4">
      <!-- Today's Reminders -->
      <div class="col-md-6">
        <div class="card animate-fade-in-up animation-delay-500">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="bi bi-calendar-check me-2"></i>
              Today's Appointment Reminders
            </h6>
          </div>
          <div class="card-body">
            <div
              class="reminder-item d-flex align-items-center p-2 mb-2 border rounded"
            >
              <div class="reminder-icon me-3">
                <i class="bi bi-clock text-primary"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium">John Doe - 10:30 AM</div>
                <small class="text-muted">Regular check-up</small>
              </div>
              <div class="text-end">
                <small class="text-muted">in 2 hours</small>
              </div>
            </div>

            <div
              class="reminder-item d-flex align-items-center p-2 mb-2 border rounded"
            >
              <div class="reminder-icon me-3">
                <i class="bi bi-clock text-success"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium">Maria Santos - 2:00 PM</div>
                <small class="text-muted">Follow-up consultation</small>
              </div>
              <div class="text-end">
                <small class="text-muted">in 6 hours</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Alerts -->
      <div class="col-md-6">
        <div class="card animate-fade-in-up animation-delay-600">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              System Alerts
            </h6>
          </div>
          <div class="card-body">
            <div
              class="alert-item d-flex align-items-center p-2 mb-2 border rounded"
            >
              <div class="alert-icon-small me-3">
                <i class="bi bi-person-plus text-info"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium">New Patient Assigned</div>
                <small class="text-muted"
                  >Ana Reyes has been assigned to your care</small
                >
              </div>
              <div class="text-end">
                <small class="text-muted">2 hours ago</small>
              </div>
            </div>

            <div
              class="alert-item d-flex align-items-center p-2 mb-2 border rounded"
            >
              <div class="alert-icon-small me-3">
                <i class="bi bi-file-medical text-success"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium">Record Updated</div>
                <small class="text-muted"
                  >Medical record updated for Pedro Cruz</small
                >
              </div>
              <div class="text-end">
                <small class="text-muted">30 min ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  background-color: rgba(67, 97, 238, 0.05);
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

.reminder-item,
.alert-item {
  transition: background-color 0.2s ease;
}

.reminder-item:hover,
.alert-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.reminder-icon,
.alert-icon-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-icon {
  flex-shrink: 0;
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
