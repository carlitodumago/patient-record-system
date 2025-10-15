<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";

// Store
const authStore = useAuthStore();

// Reactive data
const loading = ref(false);
const stats = ref({
  todayAppointments: 0,
  pendingAppointments: 0,
  completedToday: 0,
  totalPatients: 0,
  recentActivities: [],
});

// Computed properties
const user = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Methods
const fetchDashboardData = async () => {
  loading.value = true;
  try {
    // Simulate API calls - replace with actual API calls
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock data - replace with actual data fetching
    stats.value = {
      todayAppointments: 8,
      pendingAppointments: 3,
      completedToday: 5,
      totalPatients: 156,
      recentActivities: [
        {
          id: 1,
          type: "appointment",
          message: "Completed consultation with John Doe",
          time: "15 minutes ago",
          priority: "normal",
        },
        {
          id: 2,
          type: "record",
          message: "Updated medical record for Maria Santos",
          time: "1 hour ago",
          priority: "normal",
        },
        {
          id: 3,
          type: "appointment",
          message: "New appointment request from Pedro Cruz",
          time: "2 hours ago",
          priority: "high",
        },
        {
          id: 4,
          type: "patient",
          message: "Registered new patient: Ana Reyes",
          time: "3 hours ago",
          priority: "normal",
        },
        {
          id: 5,
          type: "appointment",
          message: "Appointment completed: Vaccination for Luis Mendoza",
          time: "4 hours ago",
          priority: "normal",
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    loading.value = false;
  }
};

const getActivityIcon = (type) => {
  const icons = {
    appointment: "bi-calendar-check",
    record: "bi-file-medical",
    patient: "bi-person-plus",
    consultation: "bi-stethoscope",
  };
  return icons[type] || "bi-info-circle";
};

const getActivityColor = (type) => {
  const colors = {
    appointment: "primary",
    record: "success",
    patient: "info",
    consultation: "warning",
  };
  return colors[type] || "secondary";
};

const getPriorityBadgeVariant = (priority) => {
  const variants = {
    low: "secondary",
    normal: "primary",
    high: "danger",
  };
  return variants[priority] || "secondary";
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="nurse-dashboard">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Nurse Dashboard</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Welcome back, {{ user?.fullName || user?.username }}! Here's your
          daily overview.
        </p>
      </div>
      <div class="animate-fade-in-right">
        <button
          class="btn btn-primary"
          @click="fetchDashboardData"
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

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary animate-pulse" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading dashboard data...</p>
    </div>

    <!-- Stats Cards -->
    <div v-else class="row g-4 mb-5">
      <!-- Today's Appointments -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i
                class="bi bi-calendar-day-fill text-primary fs-1 animate-float"
              ></i>
            </div>
            <h3 class="card-title text-primary mb-2">
              {{ stats.todayAppointments }}
            </h3>
            <p class="card-text text-muted mb-0">Today's Appointments</p>
            <small class="text-info">
              <i class="bi bi-clock"></i>
              Next: 10:30 AM
            </small>
          </div>
        </div>
      </div>

      <!-- Pending Appointments -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up animation-delay-100">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i
                class="bi bi-clock-history text-warning fs-1 animate-float"
              ></i>
            </div>
            <h3 class="card-title text-warning mb-2">
              {{ stats.pendingAppointments }}
            </h3>
            <p class="card-text text-muted mb-0">Pending Approvals</p>
            <small class="text-danger">
              <i class="bi bi-exclamation-triangle"></i>
              Requires attention
            </small>
          </div>
        </div>
      </div>

      <!-- Completed Today -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up animation-delay-200">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i
                class="bi bi-check-circle-fill text-success fs-1 animate-float"
              ></i>
            </div>
            <h3 class="card-title text-success mb-2">
              {{ stats.completedToday }}
            </h3>
            <p class="card-text text-muted mb-0">Completed Today</p>
            <small class="text-success">
              <i class="bi bi-graph-up"></i>
              Great job!
            </small>
          </div>
        </div>
      </div>

      <!-- Total Patients -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up animation-delay-300">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i class="bi bi-people-fill text-info fs-1 animate-float"></i>
            </div>
            <h3 class="card-title text-info mb-2">{{ stats.totalPatients }}</h3>
            <p class="card-text text-muted mb-0">Total Patients</p>
            <small class="text-muted"> Under your care </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Row -->
    <div class="row">
      <!-- Today's Schedule -->
      <div class="col-lg-8">
        <div class="card animate-fade-in-left">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">
              <i class="bi bi-calendar-event me-2"></i>
              Today's Schedule
            </h5>
            <router-link
              to="/nurse/appointment-requests"
              class="btn btn-sm btn-outline-primary"
            >
              View All
            </router-link>
          </div>
          <div class="card-body p-0">
            <div class="schedule-list">
              <!-- Morning Schedule -->
              <div class="schedule-section mb-4">
                <h6 class="schedule-time text-primary mb-3">
                  <i class="bi bi-sunrise me-2"></i>
                  Morning (8:00 AM - 12:00 PM)
                </h6>
                <div
                  class="schedule-item p-3 border rounded mb-2 animate-fade-in-up"
                >
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>10:30 AM</strong> - John Doe
                      <span class="badge bg-primary ms-2">Consultation</span>
                    </div>
                    <div class="text-end">
                      <small class="text-muted">30 min</small><br />
                      <button class="btn btn-sm btn-success">
                        Mark Complete
                      </button>
                    </div>
                  </div>
                  <p class="mb-0 mt-2 text-muted">
                    Regular check-up and blood pressure monitoring
                  </p>
                </div>

                <div
                  class="schedule-item p-3 border rounded mb-2 animate-fade-in-up animation-delay-100"
                >
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>11:15 AM</strong> - Maria Santos
                      <span class="badge bg-info ms-2">Follow-up</span>
                    </div>
                    <div class="text-end">
                      <small class="text-muted">20 min</small><br />
                      <button class="btn btn-sm btn-outline-primary">
                        View Details
                      </button>
                    </div>
                  </div>
                  <p class="mb-0 mt-2 text-muted">
                    Diabetes management follow-up
                  </p>
                </div>
              </div>

              <!-- Afternoon Schedule -->
              <div class="schedule-section">
                <h6 class="schedule-time text-primary mb-3">
                  <i class="bi bi-sunset me-2"></i>
                  Afternoon (1:00 PM - 5:00 PM)
                </h6>
                <div
                  class="schedule-item p-3 border rounded mb-2 animate-fade-in-up animation-delay-200"
                >
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>2:00 PM</strong> - Pedro Cruz
                      <span class="badge bg-success ms-2">Vaccination</span>
                    </div>
                    <div class="text-end">
                      <small class="text-muted">15 min</small><br />
                      <button class="btn btn-sm btn-warning">Reschedule</button>
                    </div>
                  </div>
                  <p class="mb-0 mt-2 text-muted">
                    COVID-19 booster vaccination
                  </p>
                </div>

                <div
                  class="schedule-item p-3 border rounded mb-2 animate-fade-in-up animation-delay-300"
                >
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>3:30 PM</strong> - Luis Mendoza
                      <span class="badge bg-warning ms-2">Consultation</span>
                    </div>
                    <div class="text-end">
                      <small class="text-muted">Pending</small><br />
                      <button class="btn btn-sm btn-outline-success">
                        Confirm
                      </button>
                    </div>
                  </div>
                  <p class="mb-0 mt-2 text-muted">
                    General health consultation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Recent Activities -->
      <div class="col-lg-4">
        <!-- Quick Actions -->
        <div class="card animate-fade-in-right">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-lightning-charge me-2"></i>
              Quick Actions
            </h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <router-link
                to="/nurse/patient-management"
                class="btn btn-primary"
              >
                <i class="bi bi-person-plus me-2"></i>
                Register Patient
              </router-link>
              <router-link
                to="/nurse/appointment-requests"
                class="btn btn-outline-primary"
              >
                <i class="bi bi-calendar-plus me-2"></i>
                Manage Appointments
              </router-link>
              <router-link
                to="/nurse/medical-records"
                class="btn btn-outline-info"
              >
                <i class="bi bi-file-medical me-2"></i>
                Update Records
              </router-link>
              <router-link
                to="/nurse/consultation-notes"
                class="btn btn-outline-success"
              >
                <i class="bi bi-journal-text me-2"></i>
                Add Consultation Notes
              </router-link>
            </div>
          </div>
        </div>

        <!-- Pending Tasks -->
        <div class="card mt-4 animate-fade-in-right animation-delay-200">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Pending Tasks
            </h5>
          </div>
          <div class="card-body">
            <div
              class="task-item d-flex align-items-center p-2 mb-2 border rounded"
            >
              <div class="task-icon me-3">
                <i class="bi bi-calendar-x text-warning"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium">Appointment Requests</div>
                <small class="text-muted"
                  >{{ stats.pendingAppointments }} pending approvals</small
                >
              </div>
              <router-link
                to="/nurse/appointment-requests"
                class="btn btn-sm btn-outline-warning"
              >
                Review
              </router-link>
            </div>

            <div
              class="task-item d-flex align-items-center p-2 mb-2 border rounded"
            >
              <div class="task-icon me-3">
                <i class="bi bi-file-earmark-x text-danger"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium">Incomplete Records</div>
                <small class="text-muted">2 records need updates</small>
              </div>
              <router-link
                to="/nurse/medical-records"
                class="btn btn-sm btn-outline-danger"
              >
                Update
              </router-link>
            </div>

            <div class="task-item d-flex align-items-center p-2 border rounded">
              <div class="task-icon me-3">
                <i class="bi bi-bell text-info"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium">Follow-up Reminders</div>
                <small class="text-muted">3 patients due for follow-up</small>
              </div>
              <router-link
                to="/nurse/patient-management"
                class="btn btn-sm btn-outline-info"
              >
                View
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="card mt-4 animate-fade-in-up animation-delay-400">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-activity me-2"></i>
          Recent Activities
        </h5>
      </div>
      <div class="card-body p-0">
        <div class="activity-list">
          <div
            v-for="activity in stats.recentActivities"
            :key="activity.id"
            class="activity-item d-flex align-items-start p-3 border-bottom animate-fade-in-up"
            :class="`animation-delay-${activity.id * 100}`"
          >
            <div class="activity-icon me-3">
              <i
                :class="`${getActivityIcon(
                  activity.type
                )} text-${getActivityColor(activity.type)}`"
              ></i>
            </div>
            <div class="activity-content flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="mb-1">{{ activity.message }}</p>
                  <small class="text-muted">
                    <i class="bi bi-clock me-1"></i>
                    {{ activity.time }}
                  </small>
                </div>
                <span
                  v-if="activity.priority === 'high'"
                  class="badge bg-danger"
                  >High Priority</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stats-icon {
  position: relative;
}

.schedule-time {
  border-bottom: 2px solid var(--primary-gradient-start);
  padding-bottom: 0.5rem;
}

.schedule-item {
  background-color: var(--light-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.schedule-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-item {
  transition: background-color 0.2s ease;
}

.task-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.task-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-item {
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
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
  .stats-card .card-body {
    padding: 1.5rem 1rem;
  }

  .schedule-item {
    padding: 1rem;
  }

  .activity-item {
    padding: 1rem;
  }
}
</style>
