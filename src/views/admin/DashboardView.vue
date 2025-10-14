<template>
  <div class="admin-container">
    <v-container fluid class="pa-4">
      <!-- Header Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div
            class="d-flex align-center justify-space-between flex-wrap gap-4"
          >
            <div class="admin-animate-fade-in">
              <h1 class="admin-heading-1 primary--text">🏠 Admin Dashboard</h1>
              <p class="admin-body-lg text--secondary">
                Welcome back! Here's your comprehensive system overview.
              </p>
            </div>
            <div class="d-flex gap-3 admin-animate-fade-in admin-stagger-1">
              <v-btn
                color="primary"
                class="admin-btn admin-btn-primary d-none d-md-flex"
                @click="refreshData"
                :loading="refreshing"
              >
                <v-icon left>mdi-refresh</v-icon>
                Refresh Data
              </v-btn>
              <v-btn
                color="secondary"
                class="admin-btn admin-btn-secondary"
                @click="exportDashboard"
              >
                <v-icon left>mdi-download</v-icon>
                Export
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Enhanced Statistics Cards -->
      <v-row class="mb-8 admin-grid admin-grid-cols-4">
        <v-col cols="12" sm="6" md="3">
          <v-card
            class="admin-card stat-card admin-animate-scale-in admin-stagger-1"
            @click="$router.push('/admin/manage-patients')"
          >
            <v-card-text class="admin-card-body text-center">
              <div class="stat-icon mb-4">
                <v-icon size="56" color="primary" class="admin-animate-pulse">
                  mdi-account-group
                </v-icon>
              </div>
              <div class="stat-number admin-heading-2 primary--text mb-3">
                {{ stats.totalPatients }}
              </div>
              <div
                class="stat-label admin-body text-body-1 font-weight-medium mb-2"
              >
                Total Patients
              </div>
              <div class="stat-subtitle admin-caption text--secondary">
                Registered in system
              </div>
              <div class="stat-trend mt-2">
                <v-chip
                  size="small"
                  color="success"
                  variant="outlined"
                  class="admin-status"
                >
                  <v-icon left size="14">mdi-trending-up</v-icon>
                  +{{ stats.patientGrowth }}%
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card
            class="admin-card stat-card admin-animate-scale-in admin-stagger-2"
            @click="$router.push('/admin/manage-staff')"
          >
            <v-card-text class="admin-card-body text-center">
              <div class="stat-icon mb-4">
                <v-icon size="56" color="success">mdi-account-tie</v-icon>
              </div>
              <div class="stat-number admin-heading-2 success--text mb-3">
                {{ stats.totalStaff }}
              </div>
              <div
                class="stat-label admin-body text-body-1 font-weight-medium mb-2"
              >
                Healthcare Staff
              </div>
              <div class="stat-subtitle admin-caption text--secondary">
                Active professionals
              </div>
              <div class="stat-trend mt-2">
                <v-chip
                  size="small"
                  color="info"
                  variant="outlined"
                  class="admin-status"
                >
                  <v-icon left size="14">mdi-account-plus</v-icon>
                  +{{ stats.staffGrowth }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card
            class="admin-card stat-card admin-animate-scale-in admin-stagger-3"
            @click="$router.push('/admin/appointments')"
          >
            <v-card-text class="admin-card-body text-center">
              <div class="stat-icon mb-4">
                <v-icon size="56" color="info">mdi-calendar-check</v-icon>
              </div>
              <div class="stat-number admin-heading-2 info--text mb-3">
                {{ stats.totalAppointments }}
              </div>
              <div
                class="stat-label admin-body text-body-1 font-weight-medium mb-2"
              >
                Total Appointments
              </div>
              <div class="stat-subtitle admin-caption text--secondary">
                This month
              </div>
              <div class="stat-trend mt-2">
                <v-chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  class="admin-status"
                >
                  <v-icon left size="14">mdi-calendar-clock</v-icon>
                  {{ stats.todayAppointments }} today
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card
            class="admin-card stat-card admin-animate-scale-in admin-stagger-4"
            @click="$router.push('/admin/appointments')"
          >
            <v-card-text class="admin-card-body text-center">
              <div class="stat-icon mb-4">
                <v-icon size="56" color="warning">mdi-clock-alert</v-icon>
              </div>
              <div class="stat-number admin-heading-2 warning--text mb-3">
                {{ stats.pendingAppointments }}
              </div>
              <div
                class="stat-label admin-body text-body-1 font-weight-medium mb-2"
              >
                Pending Actions
              </div>
              <div class="stat-subtitle admin-caption text--secondary">
                Require attention
              </div>
              <div class="stat-trend mt-2">
                <v-chip
                  size="small"
                  color="error"
                  variant="outlined"
                  class="admin-status"
                >
                  <v-icon left size="14">mdi-alert-circle</v-icon>
                  Urgent
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Main Content Grid -->
      <v-row class="mb-8 admin-grid admin-grid-cols-2">
        <!-- Recent Activity & Charts -->
        <v-col cols="12" lg="8">
          <div class="admin-animate-slide-in-right">
            <!-- Activity Timeline -->
            <v-card class="admin-card mb-6">
              <v-card-title class="admin-card-header d-flex align-center">
                <v-icon left color="primary">mdi-timeline</v-icon>
                <span class="admin-heading-4">Recent Activity</span>
                <v-spacer></v-spacer>
                <v-chip size="small" color="primary" variant="outlined">
                  Live Updates
                </v-chip>
              </v-card-title>
              <v-card-text class="admin-card-body">
                <v-timeline dense class="ml-n4">
                  <v-timeline-item
                    v-for="(activity, index) in recentActivities"
                    :key="index"
                    small
                    color="primary"
                  >
                    <template v-slot:opposite>
                      <span
                        class="admin-caption font-weight-medium primary--text"
                      >
                        {{ formatDate(activity.date) }}
                      </span>
                    </template>
                    <v-card class="admin-card elevation-1">
                      <v-card-text class="pa-3">
                        <div class="admin-body font-weight-medium">
                          {{ activity.description }}
                        </div>
                        <div class="d-flex align-center mt-2">
                          <v-chip
                            :color="
                              activity.type === 'patient'
                                ? 'primary'
                                : 'success'
                            "
                            size="small"
                            variant="outlined"
                          >
                            {{ activity.type }}
                          </v-chip>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>

            <!-- Charts Section -->
            <v-row>
              <v-col cols="12" md="6">
                <v-card class="admin-card">
                  <v-card-title class="admin-card-header">
                    <v-icon left color="info">mdi-chart-pie</v-icon>
                    <span class="admin-heading-4">Patient Distribution</span>
                  </v-card-title>
                  <v-card-text class="admin-card-body">
                    <div class="chart-container">
                      <div class="donut-chart">
                        <svg viewBox="0 0 42 42" class="donut">
                          <circle
                            class="donut-hole"
                            cx="21"
                            cy="21"
                            r="15.915494309"
                          ></circle>
                          <circle
                            class="donut-ring"
                            cx="21"
                            cy="21"
                            r="15.915494309"
                            fill="transparent"
                            stroke="#2563eb"
                            stroke-width="3"
                            stroke-dasharray="75 25"
                            stroke-dashoffset="25"
                          ></circle>
                        </svg>
                        <div class="chart-center">
                          <div class="admin-heading-3">75%</div>
                          <div class="admin-caption">Active</div>
                        </div>
                      </div>
                      <div class="chart-legend mt-4">
                        <div class="legend-item mb-2">
                          <div class="legend-color primary"></div>
                          <span class="admin-body-sm">Active Patients</span>
                        </div>
                        <div class="legend-item">
                          <div class="legend-color secondary"></div>
                          <span class="admin-body-sm">Inactive</span>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card class="admin-card">
                  <v-card-title class="admin-card-header">
                    <v-icon left color="success">mdi-chart-bar</v-icon>
                    <span class="admin-heading-4">Weekly Appointments</span>
                  </v-card-title>
                  <v-card-text class="admin-card-body">
                    <div class="bar-chart">
                      <div class="chart-bars">
                        <div
                          v-for="(bar, index) in weeklyData"
                          :key="index"
                          class="bar-item"
                        >
                          <div
                            class="bar"
                            :style="{
                              height: bar.height + '%',
                              backgroundColor: bar.color,
                            }"
                          ></div>
                          <div class="bar-label admin-caption">
                            {{ bar.day }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-col>

        <!-- Enhanced Quick Actions & System Status -->
        <v-col cols="12" lg="4">
          <div class="admin-animate-slide-in-right admin-stagger-1">
            <!-- Quick Actions -->
            <v-card class="admin-card mb-6">
              <v-card-title class="admin-card-header d-flex align-center">
                <v-icon left color="success">mdi-flash</v-icon>
                <span class="admin-heading-4">Quick Actions</span>
              </v-card-title>
              <v-card-text class="admin-card-body">
                <div class="admin-grid gap-3">
                  <v-btn
                    color="primary"
                    class="admin-btn admin-btn-primary justify-start text-left"
                    @click="$router.push('/admin/account-creation')"
                  >
                    <v-icon left>mdi-account-plus</v-icon>
                    <div class="text-left">
                      <div class="admin-body font-weight-medium">
                        Create Account
                      </div>
                      <div class="admin-caption">New user onboarding</div>
                    </div>
                  </v-btn>
                  <v-btn
                    color="secondary"
                    class="admin-btn admin-btn-secondary justify-start text-left"
                    @click="$router.push('/admin/manage-staff')"
                  >
                    <v-icon left>mdi-account-group</v-icon>
                    <div class="text-left">
                      <div class="admin-body font-weight-medium">
                        Manage Staff
                      </div>
                      <div class="admin-caption">Healthcare professionals</div>
                    </div>
                  </v-btn>
                  <v-btn
                    color="info"
                    class="admin-btn admin-btn-ghost justify-start text-left"
                    @click="$router.push('/admin/manage-patients')"
                  >
                    <v-icon left>mdi-account-multiple</v-icon>
                    <div class="text-left">
                      <div class="admin-body font-weight-medium">
                        Manage Patients
                      </div>
                      <div class="admin-caption">Patient records</div>
                    </div>
                  </v-btn>
                  <v-btn
                    color="success"
                    class="admin-btn admin-btn-ghost justify-start text-left"
                    @click="$router.push('/admin/reports')"
                  >
                    <v-icon left>mdi-chart-bar</v-icon>
                    <div class="text-left">
                      <div class="admin-body font-weight-medium">
                        View Reports
                      </div>
                      <div class="admin-caption">Analytics & insights</div>
                    </div>
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- System Health -->
            <v-card class="admin-card">
              <v-card-title class="admin-card-header d-flex align-center">
                <v-icon left color="success">mdi-shield-check</v-icon>
                <span class="admin-heading-4">System Health</span>
              </v-card-title>
              <v-card-text class="admin-card-body">
                <div class="admin-grid gap-4">
                  <div
                    class="health-item d-flex align-center justify-space-between"
                  >
                    <div class="d-flex align-center gap-3">
                      <v-icon color="success" size="20">mdi-database</v-icon>
                      <div>
                        <div class="admin-body font-weight-medium">
                          Database
                        </div>
                        <div class="admin-caption">Connected</div>
                      </div>
                    </div>
                    <v-chip color="success" size="small">Healthy</v-chip>
                  </div>

                  <div
                    class="health-item d-flex align-center justify-space-between"
                  >
                    <div class="d-flex align-center gap-3">
                      <v-icon color="success" size="20">mdi-email</v-icon>
                      <div>
                        <div class="admin-body font-weight-medium">
                          Email Service
                        </div>
                        <div class="admin-caption">Operational</div>
                      </div>
                    </div>
                    <v-chip color="success" size="small">Online</v-chip>
                  </div>

                  <div
                    class="health-item d-flex align-center justify-space-between"
                  >
                    <div class="d-flex align-center gap-3">
                      <v-icon color="success" size="20"
                        >mdi-message-text</v-icon
                      >
                      <div>
                        <div class="admin-body font-weight-medium">
                          SMS Service
                        </div>
                        <div class="admin-caption">Operational</div>
                      </div>
                    </div>
                    <v-chip color="success" size="small">Online</v-chip>
                  </div>

                  <div
                    class="health-item d-flex align-center justify-space-between"
                  >
                    <div class="d-flex align-center gap-3">
                      <v-icon color="warning" size="20">mdi-server</v-icon>
                      <div>
                        <div class="admin-body font-weight-medium">
                          Server Load
                        </div>
                        <div class="admin-caption">Moderate</div>
                      </div>
                    </div>
                    <v-chip color="warning" size="small">65%</v-chip>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/services/supabase";

const refreshing = ref(false);

const stats = ref({
  totalPatients: 0,
  totalStaff: 0,
  totalAppointments: 0,
  pendingAppointments: 0,
  patientGrowth: 12,
  staffGrowth: 8,
  todayAppointments: 24,
});

const recentActivities = ref([
  {
    date: new Date(),
    description: "New patient registered",
    type: "patient",
  },
  {
    date: new Date(Date.now() - 3600000),
    description: "Appointment scheduled",
    type: "appointment",
  },
  {
    date: new Date(Date.now() - 7200000),
    description: "Medical record updated",
    type: "record",
  },
  {
    date: new Date(Date.now() - 10800000),
    description: "Staff account created",
    type: "staff",
  },
]);

const weeklyData = ref([
  { day: "Mon", height: 65, color: "#2563eb" },
  { day: "Tue", height: 85, color: "#059669" },
  { day: "Wed", height: 45, color: "#2563eb" },
  { day: "Thu", height: 75, color: "#059669" },
  { day: "Fri", height: 90, color: "#2563eb" },
  { day: "Sat", height: 30, color: "#059669" },
  { day: "Sun", height: 20, color: "#2563eb" },
]);

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

const refreshData = async () => {
  refreshing.value = true;
  try {
    await loadStats();
    // Simulate real-time updates
    setTimeout(() => {
      refreshing.value = false;
    }, 1000);
  } catch (error) {
    refreshing.value = false;
  }
};

const exportDashboard = () => {
  // Export dashboard data functionality
  console.log("Exporting dashboard data...");
};

const loadStats = async () => {
  try {
    const [patientsResult, staffResult, appointmentsResult] = await Promise.all(
      [
        supabase
          .from("Patients")
          .select("PatientID", { count: "exact", head: true }),
        supabase
          .from("Staff")
          .select("StaffID", { count: "exact", head: true }),
        supabase
          .from("Appointment")
          .select("AppointmentID, Status", { count: "exact" }),
      ]
    );

    stats.value.totalPatients = patientsResult.count || 0;
    stats.value.totalStaff = staffResult.count || 0;
    stats.value.totalAppointments = appointmentsResult.count || 0;

    const pendingAppointments =
      appointmentsResult.data?.filter((app) => app.Status === "pending") || [];
    stats.value.pendingAppointments = pendingAppointments.length;

    // Generate additional mock data for enhanced dashboard
    stats.value.patientGrowth = Math.floor(Math.random() * 20) + 5;
    stats.value.staffGrowth = Math.floor(Math.random() * 15) + 3;
    stats.value.todayAppointments = Math.floor(Math.random() * 30) + 15;
  } catch (error) {
    console.error("Load stats error:", error);
  }
};

onMounted(() => {
  loadStats();

  // Set up real-time updates every 30 seconds
  setInterval(() => {
    if (!refreshing.value) {
      loadStats();
    }
  }, 30000);
});
</script>

<style scoped>
/* ===== CHART STYLES ===== */
.chart-container {
  position: relative;
  padding: var(--admin-space-4);
}

.donut-chart {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto var(--admin-space-4);
}

.donut {
  transform: rotate(-90deg);
}

.donut-hole {
  fill: none;
}

.donut-ring {
  stroke-dasharray: 75 25;
  stroke-dashoffset: 25;
  transition: stroke-dasharray 0.3s ease;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: var(--admin-space-6);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--admin-space-2);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: var(--admin-radius-full);
}

.legend-color.primary {
  background: var(--admin-primary);
}

.legend-color.secondary {
  background: var(--admin-secondary);
}

.bar-chart {
  padding: var(--admin-space-4);
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 120px;
  gap: var(--admin-space-2);
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar {
  width: 100%;
  min-height: 20px;
  border-radius: var(--admin-radius-sm) var(--admin-radius-sm) 0 0;
  transition: height 0.3s ease;
  cursor: pointer;
}

.bar:hover {
  opacity: 0.8;
}

.bar-label {
  margin-top: var(--admin-space-2);
  text-align: center;
}

/* ===== ENHANCED STAT CARD STYLES ===== */
.stat-card {
  cursor: pointer;
  transition: all var(--admin-transition-base);
  border-radius: var(--admin-radius-xl);
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--admin-primary),
    var(--admin-primary-light)
  );
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--admin-shadow-lg);
}

.stat-icon {
  opacity: 0.9;
  transition: all var(--admin-transition-base);
}

.stat-card:hover .stat-icon {
  opacity: 1;
  transform: scale(1.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: var(--admin-font-weight-bold);
  line-height: 1;
  background: linear-gradient(
    135deg,
    var(--admin-primary),
    var(--admin-primary-light)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: var(--admin-font-size-sm);
  color: var(--admin-text-secondary);
  margin-top: var(--admin-space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: var(--admin-font-weight-medium);
}

.stat-subtitle {
  opacity: 0.8;
  color: var(--admin-text-muted);
}

.stat-trend {
  animation: admin-fade-in 0.5s ease-out 0.3s both;
}

/* ===== HEALTH STATUS STYLES ===== */
.health-item {
  padding: var(--admin-space-3);
  border-radius: var(--admin-radius-md);
  background: var(--admin-bg-tertiary);
  transition: all var(--admin-transition-base);
}

.health-item:hover {
  background: var(--admin-bg-secondary);
  transform: translateX(4px);
}

/* ===== RESPONSIVE ENHANCEMENTS ===== */
@media (max-width: 599px) {
  .stat-number {
    font-size: 2rem;
  }

  .stat-icon .v-icon {
    font-size: 40px !important;
  }

  .admin-card-body {
    padding: var(--admin-space-4) !important;
  }

  .chart-bars {
    height: 100px;
  }

  .donut-chart {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 959px) {
  .admin-grid {
    display: grid !important;
    gap: var(--admin-space-4) !important;
  }

  .gap-3 > * {
    margin-bottom: var(--admin-space-3);
  }

  .gap-3 > *:last-child {
    margin-bottom: 0;
  }
}

/* ===== CARD ENHANCEMENTS ===== */
.admin-card {
  border-radius: var(--admin-radius-xl);
  box-shadow: var(--admin-shadow-sm);
  transition: all var(--admin-transition-base);
}

.admin-card:hover {
  box-shadow: var(--admin-shadow-md);
}

/* ===== TIMELINE ENHANCEMENTS ===== */
.v-timeline-item {
  margin-bottom: var(--admin-space-4);
}

.v-timeline-item:last-child {
  margin-bottom: 0;
}

/* ===== HEADER GRADIENT ===== */
.admin-heading-1 {
  background: linear-gradient(
    135deg,
    var(--admin-primary),
    var(--admin-primary-light)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ===== MOBILE REFRESH BUTTON ===== */
@media (max-width: 959px) {
  .d-none.d-md-flex {
    display: none !important;
  }
}

/* ===== ENHANCED MOBILE LAYOUT ===== */
@media (max-width: 599px) {
  .pa-4 {
    padding: var(--admin-space-4) !important;
  }

  .mb-6 {
    margin-bottom: var(--admin-space-6) !important;
  }

  .mb-8 {
    margin-bottom: var(--admin-space-8) !important;
  }

  .mt-6 {
    margin-top: var(--admin-space-6) !important;
  }
}

/* ===== FOCUS STATES FOR ACCESSIBILITY ===== */
.stat-card:focus-visible {
  outline: 2px solid var(--admin-primary);
  outline-offset: 2px;
}

.admin-btn:focus-visible {
  outline: 2px solid var(--admin-primary);
  outline-offset: 2px;
}

/* ===== LOADING STATE STYLES ===== */
.refreshing .stat-card {
  opacity: 0.7;
  pointer-events: none;
}

.refreshing .stat-icon {
  animation: admin-pulse 1.5s ease-in-out infinite;
}

/* ===== HOVER EFFECTS ===== */
.hover-card {
  transition: all var(--admin-transition-base);
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--admin-shadow-md);
}

/* ===== ACTIVITY TYPE INDICATORS ===== */
.activity-type-indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--admin-radius-full);
  margin-right: var(--admin-space-2);
}

.activity-type-indicator.patient {
  background: var(--admin-primary);
}

.activity-type-indicator.appointment {
  background: var(--admin-secondary);
}

.activity-type-indicator.record {
  background: var(--admin-info);
}

.activity-type-indicator.staff {
  background: var(--admin-warning);
}
</style>
