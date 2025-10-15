<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";

// Store
const authStore = useAuthStore();

// Reactive data
const loading = ref(false);
const stats = ref({
  totalPatients: 0,
  totalStaff: 0,
  todayAppointments: 0,
  pendingAppointments: 0,
  totalRecords: 0,
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

    // Initialize with default values - replace with actual data fetching
    stats.value = {
      totalPatients: 0,
      totalStaff: 0,
      todayAppointments: 0,
      pendingAppointments: 0,
      totalRecords: 0,
      recentActivities: [],
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
    staff: "bi-person-badge-plus",
  };
  return icons[type] || "bi-info-circle";
};

const getActivityColor = (type) => {
  const colors = {
    appointment: "primary",
    record: "success",
    patient: "info",
    staff: "warning",
  };
  return colors[type] || "secondary";
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Dashboard</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Welcome back, {{ user?.fullName || user?.username }}! Here's your
          clinic overview.
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
      <!-- Total Patients -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i class="bi bi-people-fill text-primary fs-1 animate-float"></i>
            </div>
            <h3 class="card-title text-primary mb-2">
              {{ stats.totalPatients }}
            </h3>
            <p class="card-text text-muted mb-0">Total Patients</p>
            <small class="text-muted"> Updated in real-time </small>
          </div>
        </div>
      </div>

      <!-- Total Staff -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up animation-delay-100">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i
                class="bi bi-person-badge-fill text-info fs-1 animate-float"
              ></i>
            </div>
            <h3 class="card-title text-info mb-2">{{ stats.totalStaff }}</h3>
            <p class="card-text text-muted mb-0">Healthcare Staff</p>
            <small class="text-muted"> Status updated dynamically </small>
          </div>
        </div>
      </div>

      <!-- Today's Appointments -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up animation-delay-200">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i
                class="bi bi-calendar-day-fill text-warning fs-1 animate-float"
              ></i>
            </div>
            <h3 class="card-title text-warning mb-2">
              {{ stats.todayAppointments }}
            </h3>
            <p class="card-text text-muted mb-0">Today's Appointments</p>
            <small class="text-muted">
              Check schedule for next appointment
            </small>
          </div>
        </div>
      </div>

      <!-- Pending Appointments -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up animation-delay-300">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i
                class="bi bi-clock-history text-secondary fs-1 animate-float"
              ></i>
            </div>
            <h3 class="card-title text-secondary mb-2">
              {{ stats.pendingAppointments }}
            </h3>
            <p class="card-text text-muted mb-0">Pending Approvals</p>
            <small class="text-muted"> Pending review required </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Row -->
    <div class="row">
      <!-- Recent Activities -->
      <div class="col-lg-8">
        <div class="card animate-fade-in-left">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">
              <i class="bi bi-activity me-2"></i>
              Recent Activities
            </h5>
            <router-link
              to="/admin/activities"
              class="btn btn-sm btn-outline-primary"
            >
              View All
            </router-link>
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
                  <p class="mb-1">{{ activity.message }}</p>
                  <small class="text-muted">
                    <i class="bi bi-clock me-1"></i>
                    {{ activity.time }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Medical Records Overview -->
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
              <router-link to="/admin/account-creation" class="btn btn-primary">
                <i class="bi bi-person-plus me-2"></i>
                Create New Account
              </router-link>
              <router-link
                to="/admin/appointments"
                class="btn btn-outline-primary"
              >
                <i class="bi bi-calendar-plus me-2"></i>
                Schedule Appointment
              </router-link>
              <router-link to="/admin/patients" class="btn btn-outline-info">
                <i class="bi bi-person-lines-fill me-2"></i>
                Register Patient
              </router-link>
              <router-link to="/admin/reports" class="btn btn-outline-success">
                <i class="bi bi-bar-chart-line me-2"></i>
                Generate Report
              </router-link>
            </div>
          </div>
        </div>

        <!-- Medical Records Overview -->
        <div class="card mt-4 animate-fade-in-right animation-delay-200">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-file-medical me-2"></i>
              Medical Records
            </h5>
          </div>
          <div class="card-body text-center">
            <div class="records-icon mb-3">
              <i class="bi bi-folder-fill text-success fs-1 animate-pulse"></i>
            </div>
            <h4 class="text-success mb-2">{{ stats.totalRecords }}</h4>
            <p class="text-muted mb-3">Total Records</p>
            <router-link
              to="/admin/medical-records"
              class="btn btn-success btn-sm"
            >
              <i class="bi bi-eye me-1"></i>
              View All Records
            </router-link>
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

.records-icon {
  opacity: 0.8;
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

  .activity-item {
    padding: 1rem;
  }
}
</style>
