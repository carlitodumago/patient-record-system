<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";

// Store
const authStore = useAuthStore();

// Reactive data
const loading = ref(false);
const stats = ref({
  totalAppointments: 0,
  upcomingAppointments: 0,
  completedAppointments: 0,
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

    // Mock data - replace with actual data fetching
    stats.value = {
      totalAppointments: 12,
      upcomingAppointments: 2,
      completedAppointments: 10,
      totalRecords: 8,
      recentActivities: [
        {
          id: 1,
          type: "appointment",
          message: "Appointment completed: Regular check-up",
          time: "2 days ago",
        },
        {
          id: 2,
          type: "record",
          message: "Medical record updated by Dr. Sarah Johnson",
          time: "1 week ago",
        },
        {
          id: 3,
          type: "appointment",
          message: "Upcoming appointment: Follow-up consultation",
          time: "Scheduled for tomorrow",
        },
        {
          id: 4,
          type: "vaccination",
          message: "Vaccination record added: COVID-19 booster",
          time: "2 weeks ago",
        },
        {
          id: 5,
          type: "appointment",
          message: "Appointment scheduled: General consultation",
          time: "3 weeks ago",
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
    vaccination: "bi-shield-check",
    consultation: "bi-stethoscope",
  };
  return icons[type] || "bi-info-circle";
};

const getActivityColor = (type) => {
  const colors = {
    appointment: "primary",
    record: "success",
    vaccination: "info",
    consultation: "warning",
  };
  return colors[type] || "secondary";
};

const bookAppointment = () => {
  console.log("Booking new appointment");
  // In a real application, this would open the appointment booking modal
  alert("Appointment booking would be implemented here");
};

const viewMedicalRecord = () => {
  console.log("Viewing medical records");
  // In a real application, this would navigate to medical records
  alert("Medical records view would be implemented here");
};

const updateProfile = () => {
  console.log("Updating profile");
  // In a real application, this would navigate to profile update
  alert("Profile update would be implemented here");
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="patient-dashboard">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">My Dashboard</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Welcome back, {{ user?.fullName || user?.username }}! Here's your
          health overview.
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
      <div
        class="spinner-border text-primary animate-pulse"
        role="status"
        aria-live="polite"
      >
        <span class="visually-hidden">Loading dashboard data...</span>
      </div>
      <p class="mt-3 text-muted" role="status" aria-live="polite">
        Loading dashboard data...
      </p>

      <!-- Welcome Message Skeleton -->
      <div class="mt-4">
        <div
          class="loading-skeleton mb-2"
          style="width: 300px; height: 24px; margin: 0 auto"
        ></div>
        <div
          class="loading-skeleton"
          style="width: 400px; height: 20px; margin: 0 auto"
        ></div>
      </div>

      <!-- Stats Cards Skeleton -->
      <div class="row g-4 mt-4">
        <div v-for="n in 4" :key="n" class="col-xl-3 col-lg-6 col-md-6">
          <div class="card">
            <div class="card-body text-center">
              <div
                class="loading-skeleton mb-3"
                style="
                  width: 50px;
                  height: 50px;
                  border-radius: 50%;
                  margin: 0 auto;
                "
              ></div>
              <div
                class="loading-skeleton mb-2"
                style="width: 30px; height: 28px; margin: 0 auto"
              ></div>
              <div
                class="loading-skeleton"
                style="width: 100px; height: 18px; margin: 0 auto"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Welcome Message -->
    <div v-else class="alert alert-primary animate-fade-in-up">
      <div class="d-flex align-items-center">
        <div class="alert-icon me-3">
          <i class="bi bi-info-circle text-primary fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h6 class="alert-heading mb-1">
            Welcome to Baan KM-3 Health Center Information System
          </h6>
          <p class="mb-0">
            You can view your appointments, medical records, and manage your
            health information here.
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-4 mb-5">
      <!-- Total Appointments -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i
                class="bi bi-calendar-check text-primary fs-1 animate-float"
              ></i>
            </div>
            <h3 class="card-title text-primary mb-2">
              {{ stats.totalAppointments }}
            </h3>
            <p class="card-text text-muted mb-0">Total Appointments</p>
            <small class="text-success">
              <i class="bi bi-graph-up"></i>
              +2 this month
            </small>
          </div>
        </div>
      </div>

      <!-- Upcoming Appointments -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up animation-delay-100">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i
                class="bi bi-calendar-event text-warning fs-1 animate-float"
              ></i>
            </div>
            <h3 class="card-title text-warning mb-2">
              {{ stats.upcomingAppointments }}
            </h3>
            <p class="card-text text-muted mb-0">Upcoming Appointments</p>
            <small class="text-info">
              <i class="bi bi-clock"></i>
              Next: Tomorrow 10:30 AM
            </small>
          </div>
        </div>
      </div>

      <!-- Completed Appointments -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up animation-delay-200">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i
                class="bi bi-check-circle-fill text-success fs-1 animate-float"
              ></i>
            </div>
            <h3 class="card-title text-success mb-2">
              {{ stats.completedAppointments }}
            </h3>
            <p class="card-text text-muted mb-0">Completed Visits</p>
            <small class="text-muted"> Last: 2 days ago </small>
          </div>
        </div>
      </div>

      <!-- Medical Records -->
      <div class="col-xl-3 col-lg-6 col-md-6">
        <div class="card stats-card animate-fade-in-up animation-delay-300">
          <div class="card-body text-center">
            <div class="stats-icon mb-3">
              <i class="bi bi-file-medical text-info fs-1 animate-float"></i>
            </div>
            <h3 class="card-title text-info mb-2">{{ stats.totalRecords }}</h3>
            <p class="card-text text-muted mb-0">Medical Records</p>
            <small class="text-muted"> Updated 1 week ago </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Row -->
    <div class="row">
      <!-- Upcoming Appointments -->
      <div class="col-lg-8">
        <div class="card animate-fade-in-left">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">
              <i class="bi bi-calendar-event me-2"></i>
              My Upcoming Appointments
            </h5>
            <router-link
              to="/patient/appointments"
              class="btn btn-sm btn-outline-primary"
            >
              View All
            </router-link>
          </div>
          <div class="card-body p-0">
            <div class="appointments-list">
              <!-- Next Appointment -->
              <div
                class="appointment-item p-4 border-bottom animate-fade-in-up"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="appointment-info">
                    <div class="d-flex align-items-center mb-2">
                      <div class="appointment-icon me-3">
                        <i class="bi bi-calendar-check text-primary fs-4"></i>
                      </div>
                      <div>
                        <h6 class="mb-1">Regular Check-up</h6>
                        <p class="text-muted mb-1">
                          Tomorrow, October 16, 2024 at 10:30 AM
                        </p>
                        <p class="mb-0">
                          Dr. Sarah Johnson - Consultation Room 1
                        </p>
                      </div>
                    </div>
                    <div class="appointment-details">
                      <small class="text-muted">
                        <i class="bi bi-clock me-1"></i>
                        Duration: 30 minutes
                      </small>
                      <small class="text-muted ms-3">
                        <i class="bi bi-geo-alt me-1"></i>
                        Baan KM-3 Health Center
                      </small>
                    </div>
                  </div>
                  <div class="appointment-actions text-end">
                    <button class="btn btn-sm btn-outline-primary me-2">
                      <i class="bi bi-pencil me-1"></i>
                      Reschedule
                    </button>
                    <button class="btn btn-sm btn-outline-danger">
                      <i class="bi bi-x-circle me-1"></i>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <!-- Second Appointment -->
              <div
                class="appointment-item p-4 border-bottom animate-fade-in-up animation-delay-100"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="appointment-info">
                    <div class="d-flex align-items-center mb-2">
                      <div class="appointment-icon me-3">
                        <i class="bi bi-stethoscope text-success fs-4"></i>
                      </div>
                      <div>
                        <h6 class="mb-1">Follow-up Consultation</h6>
                        <p class="text-muted mb-1">
                          October 18, 2024 at 2:00 PM
                        </p>
                        <p class="mb-0">
                          Dr. Sarah Johnson - Consultation Room 1
                        </p>
                      </div>
                    </div>
                    <div class="appointment-details">
                      <small class="text-muted">
                        <i class="bi bi-clock me-1"></i>
                        Duration: 20 minutes
                      </small>
                      <small class="text-muted ms-3">
                        <i class="bi bi-clipboard-pulse me-1"></i>
                        Diabetes management review
                      </small>
                    </div>
                  </div>
                  <div class="appointment-actions text-end">
                    <button class="btn btn-sm btn-outline-primary me-2">
                      <i class="bi bi-pencil me-1"></i>
                      Reschedule
                    </button>
                    <button class="btn btn-sm btn-outline-secondary">
                      <i class="bi bi-info-circle me-1"></i>
                      Details
                    </button>
                  </div>
                </div>
              </div>

              <!-- No more appointments message -->
              <div
                class="text-center py-4 animate-fade-in-up animation-delay-200"
              >
                <i class="bi bi-calendar-plus text-muted fs-4 mb-2"></i>
                <p class="text-muted mb-3">No more upcoming appointments</p>
                <button class="btn btn-primary" @click="bookAppointment">
                  <i class="bi bi-calendar-plus me-2"></i>
                  Book New Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Health Summary -->
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
              <button class="btn btn-primary" @click="bookAppointment">
                <i class="bi bi-calendar-plus me-2"></i>
                Book Appointment
              </button>
              <router-link
                to="/patient/appointments"
                class="btn btn-outline-primary"
              >
                <i class="bi bi-calendar-event me-2"></i>
                My Appointments
              </router-link>
              <router-link
                to="/patient/medical-records"
                class="btn btn-outline-info"
              >
                <i class="bi bi-file-medical me-2"></i>
                My Medical Records
              </router-link>
              <button class="btn btn-outline-success" @click="updateProfile">
                <i class="bi bi-person-gear me-2"></i>
                Update Profile
              </button>
            </div>
          </div>
        </div>

        <!-- Health Summary -->
        <div class="card mt-4 animate-fade-in-right animation-delay-200">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-clipboard-pulse me-2"></i>
              Health Summary
            </h5>
          </div>
          <div class="card-body">
            <div
              class="health-item d-flex justify-content-between align-items-center py-2"
            >
              <span>Blood Type</span>
              <span class="badge bg-primary">O+</span>
            </div>
            <div
              class="health-item d-flex justify-content-between align-items-center py-2 border-top"
            >
              <span>Allergies</span>
              <span class="badge bg-success">None</span>
            </div>
            <div
              class="health-item d-flex justify-content-between align-items-center py-2 border-top"
            >
              <span>Current Medications</span>
              <span class="badge bg-info">2 Active</span>
            </div>
            <div
              class="health-item d-flex justify-content-between align-items-center py-2 border-top"
            >
              <span>Last Check-up</span>
              <span class="text-muted">2 days ago</span>
            </div>
            <div class="text-center mt-3">
              <button
                class="btn btn-outline-primary btn-sm"
                @click="viewMedicalRecord"
              >
                <i class="bi bi-eye me-1"></i>
                View Full Records
              </button>
            </div>
          </div>
        </div>

        <!-- Reminders -->
        <div class="card mt-4 animate-fade-in-right animation-delay-300">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-bell me-2"></i>
              Health Reminders
            </h5>
          </div>
          <div class="card-body">
            <div class="reminder-item d-flex align-items-start p-2 mb-2">
              <div class="reminder-icon me-3">
                <i class="bi bi-capsule text-primary"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium">Medication Reminder</div>
                <small class="text-muted"
                  >Take Lisinopril at 8:00 AM daily</small
                >
              </div>
            </div>

            <div class="reminder-item d-flex align-items-start p-2 mb-2">
              <div class="reminder-icon me-3">
                <i class="bi bi-thermometer text-warning"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium">Blood Pressure Monitoring</div>
                <small class="text-muted"
                  >Check BP twice daily and record readings</small
                >
              </div>
            </div>

            <div class="reminder-item d-flex align-items-start p-2">
              <div class="reminder-icon me-3">
                <i class="bi bi-calendar-event text-info"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium">Follow-up Appointment</div>
                <small class="text-muted"
                  >Tomorrow at 10:30 AM - Don't forget!</small
                >
              </div>
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
          Recent Health Activities
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

.appointment-item {
  transition: background-color 0.2s ease;
}

.appointment-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.appointment-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.appointment-details {
  margin-top: 0.5rem;
}

.appointment-actions .btn {
  font-size: 0.8rem;
}

.health-item {
  padding: 0.5rem 0;
}

.health-item:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.reminder-item {
  transition: background-color 0.2s ease;
}

.reminder-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.reminder-icon {
  width: 32px;
  height: 32px;
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
  .stats-card .card-body {
    padding: 1.5rem 1rem;
  }

  .appointment-item {
    padding: 1rem;
  }

  .activity-item {
    padding: 1rem;
  }
}
</style>
