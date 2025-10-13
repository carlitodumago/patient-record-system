<template>
  <v-container class="reports-dashboard">
    <v-row>
      <v-col cols="12">
        <v-row align="center" justify="space-between" class="mb-4">
          <v-col cols="auto">
            <h1 class="animate-fade-in-left">Reports Dashboard</h1>
            <p class="text-muted">
              Analytics and insights for clinic management
            </p>
          </v-col>
          <v-col cols="auto">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-download"
                  v-bind="props"
                >
                  Export Reports
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="exportReport('summary')">
                  <template v-slot:prepend>
                    <v-icon>mdi-file-document</v-icon>
                  </template>
                  <v-list-item-title>Summary Report (PDF)</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportReport('patients')">
                  <template v-slot:prepend>
                    <v-icon>mdi-file-excel</v-icon>
                  </template>
                  <v-list-item-title>Patient Data (CSV)</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportReport('appointments')">
                  <template v-slot:prepend>
                    <v-icon>mdi-calendar-check</v-icon>
                  </template>
                  <v-list-item-title
                    >Appointment Report (Excel)</v-list-item-title
                  >
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="exportReport('full')">
                  <template v-slot:prepend>
                    <v-icon>mdi-package-variant</v-icon>
                  </template>
                  <v-list-item-title>Complete Report Package</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-btn
              color="primary"
              @click="refreshAllData"
              :loading="isRefreshing"
              prepend-icon="mdi-refresh"
              class="ml-2"
            >
              Refresh Data
            </v-btn>
          </v-col>
        </v-row>

        <!-- Key Metrics Cards -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card color="primary" class="text-white">
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <h5 class="mb-0">{{ systemStats.users.total }}</h5>
                  <small>Total Users</small>
                </div>
                <v-icon size="x-large">mdi-account-group</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="success" class="text-white">
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <h5 class="mb-0">{{ systemStats.patients.total }}</h5>
                  <small>Total Patients</small>
                </div>
                <v-icon size="x-large">mdi-account-heart</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="info" class="text-white">
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <h5 class="mb-0">{{ systemStats.staff.total }}</h5>
                  <small>Staff Members</small>
                </div>
                <v-icon size="x-large">mdi-account-badge</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="warning" class="text-dark">
              <v-card-text class="d-flex justify-space-between align-center">
                <div>
                  <h5 class="mb-0">{{ systemStats.appointments.total }}</h5>
                  <small>Total Appointments</small>
                </div>
                <v-icon size="x-large">mdi-calendar-check</v-icon>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charts Row -->
        <v-row class="mb-4">
          <!-- Patient Demographics -->
          <v-col cols="12" lg="6" class="mb-4">
            <v-card height="100%">
              <v-card-title class="d-flex justify-space-between align-center">
                <span>Patient Demographics</span>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      v-bind="props"
                    ></v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="exportChart('demographics')">
                      <template v-slot:prepend>
                        <v-icon>mdi-download</v-icon>
                      </template>
                      <v-list-item-title>Export Chart</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-card-title>
              <v-card-text>
                <v-row class="text-center">
                  <v-col cols="6">
                    <v-divider vertical class="me-4"></v-divider>
                    <h4 class="text-primary mb-1">
                      {{ patientStats.genderDistribution.Male || 0 }}
                    </h4>
                    <small class="text-muted">Male Patients</small>
                  </v-col>
                  <v-col cols="6">
                    <h4 class="text-info mb-1">
                      {{ patientStats.genderDistribution.Female || 0 }}
                    </h4>
                    <small class="text-muted">Female Patients</small>
                  </v-col>
                </v-row>
                <div class="mt-3">
                  <h6>Blood Type Distribution</h6>
                  <div class="d-flex flex-wrap gap-2 mt-2">
                    <v-chip
                      v-for="(
                        count, type
                      ) in patientStats.bloodTypeDistribution"
                      :key="type"
                      variant="outlined"
                    >
                      {{ type }}: {{ count }}
                    </v-chip>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Appointment Trends -->
          <v-col cols="12" lg="6" class="mb-4">
            <v-card height="100%">
              <v-card-title class="d-flex justify-space-between align-center">
                <span>Appointment Trends</span>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      v-bind="props"
                    ></v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="exportChart('appointments')">
                      <template v-slot:prepend>
                        <v-icon>mdi-download</v-icon>
                      </template>
                      <v-list-item-title>Export Chart</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-card-title>
              <v-card-text>
                <v-row class="text-center">
                  <v-col cols="4">
                    <h5 class="text-success mb-1">
                      {{ appointmentStats.statusDistribution.scheduled || 0 }}
                    </h5>
                    <small class="text-muted">Scheduled</small>
                  </v-col>
                  <v-col cols="4">
                    <h5 class="text-primary mb-1">
                      {{ appointmentStats.statusDistribution.completed || 0 }}
                    </h5>
                    <small class="text-muted">Completed</small>
                  </v-col>
                  <v-col cols="4">
                    <h5 class="text-danger mb-1">
                      {{ appointmentStats.statusDistribution.cancelled || 0 }}
                    </h5>
                    <small class="text-muted">Cancelled</small>
                  </v-col>
                </v-row>
                <div class="mt-3">
                  <v-row class="mb-2">
                    <v-col cols="6">
                      <span>Today's Appointments</span>
                    </v-col>
                    <v-col cols="6" class="text-end">
                      <v-chip color="primary">
                        {{ appointmentStats.todayAppointments }}
                      </v-chip>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6">
                      <span>This Month</span>
                    </v-col>
                    <v-col cols="6" class="text-end">
                      <v-chip color="info">
                        {{ appointmentStats.monthlyAppointments }}
                      </v-chip>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Detailed Reports -->
        <v-row class="mb-4">
          <!-- Patient Statistics -->
          <v-col cols="12" lg="6" class="mb-4">
            <v-card>
              <v-card-title>Patient Statistics</v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="patientStatsHeaders"
                  :items="patientStatsItems"
                  hide-default-footer
                  density="compact"
                >
                  <template v-slot:item.value="{ item }">
                    <v-chip :color="item.color" variant="flat">
                      {{ item.value }}
                    </v-chip>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Staff Performance -->
          <v-col cols="12" lg="6" class="mb-4">
            <v-card>
              <v-card-title>Staff Performance</v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="staffStatsHeaders"
                  :items="staffStatsItems"
                  hide-default-footer
                  density="compact"
                >
                  <template v-slot:item.value="{ item }">
                    <v-chip :color="item.color" variant="flat">
                      {{ item.value }}
                    </v-chip>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent Activity -->
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center">
                <span>Recent System Activity</span>
                <v-btn variant="outlined" @click="loadAuditLogs">
                  <v-icon>mdi-eye</v-icon>
                  View All Logs
                </v-btn>
              </v-card-title>
              <v-card-text>
                <div
                  v-if="recentAuditLogs.length === 0"
                  class="text-center p-4"
                >
                  <v-icon size="x-large" class="text-muted mb-3"
                    >mdi-activity</v-icon
                  >
                  <h5 class="text-muted">No recent activity</h5>
                  <p class="text-muted">
                    System activity logs will appear here
                  </p>
                </div>
                <div v-else class="timeline">
                  <div
                    v-for="log in recentAuditLogs"
                    :key="log.log_id"
                    class="timeline-item"
                  >
                    <div
                      class="timeline-marker"
                      :class="getLogLevelClass(log.action)"
                    ></div>
                    <div class="timeline-content">
                      <div class="d-flex justify-space-between align-start">
                        <div>
                          <h6 class="mb-1">
                            {{ formatLogAction(log.action) }}
                          </h6>
                          <p class="mb-1 text-muted">{{ log.table_name }}</p>
                          <small class="text-muted">
                            {{ formatDateTime(log.created_at) }}
                          </small>
                        </div>
                        <div class="text-end">
                          <small class="text-muted">{{
                            log.user?.username || "System"
                          }}</small>
                          <div v-if="log.ip_address" class="small text-muted">
                            {{ log.ip_address }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Export Options -->
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>Report Generation</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="4" class="mb-3">
                    <v-card variant="outlined" class="text-center">
                      <v-card-text>
                        <v-icon size="x-large" color="primary" class="mb-3"
                          >mdi-file-medical</v-icon
                        >
                        <h6 class="mb-2">Patient Report</h6>
                        <p class="text-caption mb-3">
                          Comprehensive patient data and demographics
                        </p>
                        <v-btn
                          color="primary"
                          @click="exportReport('patients')"
                        >
                          Generate Report
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="4" class="mb-3">
                    <v-card variant="outlined" class="text-center">
                      <v-card-text>
                        <v-icon size="x-large" color="info" class="mb-3"
                          >mdi-calendar-check</v-icon
                        >
                        <h6 class="mb-2">Appointment Report</h6>
                        <p class="text-caption mb-3">
                          Appointment statistics and scheduling data
                        </p>
                        <v-btn
                          color="info"
                          @click="exportReport('appointments')"
                        >
                          Generate Report
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="4" class="mb-3">
                    <v-card variant="outlined" class="text-center">
                      <v-card-text>
                        <v-icon size="x-large" color="success" class="mb-3"
                          >mdi-chart-line</v-icon
                        >
                        <h6 class="mb-2">Analytics Report</h6>
                        <p class="text-caption mb-3">
                          System usage and performance metrics
                        </p>
                        <v-btn
                          color="success"
                          @click="exportReport('analytics')"
                        >
                          Generate Report
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdminStore } from "@/stores/admin";
import { usePatientsStore } from "@/stores/patients";
import { useNotificationsStore } from "@/stores/notifications";
import { patientService as PatientService } from "@/services/patientService";
import { staffService as StaffService } from "@/services/staffService";
import AppointmentService from "@/services/appointmentService";

const adminStore = useAdminStore();
const patientsStore = usePatientsStore();
const notificationsStore = useNotificationsStore();

// Reactive data
const isRefreshing = ref(false);
const systemStats = ref({});
const patientStats = ref({
  totalPatients: 0,
  recentPatients: 0,
  genderDistribution: {},
  bloodTypeDistribution: {},
});
const staffStats = ref({
  totalStaff: 0,
  roleDistribution: {},
  specializationDistribution: {},
});
const appointmentStats = ref({
  totalAppointments: 0,
  todayAppointments: 0,
  monthlyAppointments: 0,
  statusDistribution: {},
});
const patientsWithAppointments = ref([]);
const recentAuditLogs = ref([]);

// Computed properties
const calculateAverageAge = () => {
  // Calculate average age from patient data
  // This is a simplified calculation
  return 32; // Placeholder
};

const patientStatsHeaders = [
  { title: "Metric", key: "metric", width: "60%" },
  { title: "Value", key: "value", width: "40%" },
];

const patientStatsItems = computed(() => [
  {
    metric: "Total Active Patients",
    value: patientStats.value.totalPatients,
    color: "success",
  },
  {
    metric: "New Patients (This Month)",
    value: patientStats.value.recentPatients,
    color: "info",
  },
  {
    metric: "Patients with Appointments",
    value: patientsWithAppointments.value.length,
    color: "primary",
  },
  {
    metric: "Average Age",
    value: `${calculateAverageAge()} years`,
    color: "secondary",
  },
]);

const staffStatsHeaders = [
  { title: "Metric", key: "metric", width: "60%" },
  { title: "Value", key: "value", width: "40%" },
];

const staffStatsItems = computed(() => [
  {
    metric: "Total Healthcare Staff",
    value: staffStats.value.totalStaff,
    color: "primary",
  },
  {
    metric: "Active Nurses",
    value: staffStats.value.roleDistribution?.Nurse || 0,
    color: "info",
  },
  {
    metric: "Administrators",
    value: staffStats.value.roleDistribution?.Admin || 0,
    color: "warning",
  },
  {
    metric: "Specializations",
    value: Object.keys(staffStats.value.specializationDistribution || {})
      .length,
    color: "secondary",
  },
]);

// Methods
const refreshAllData = async () => {
  isRefreshing.value = true;
  try {
    await Promise.all([
      loadSystemStats(),
      loadPatientStats(),
      loadStaffStats(),
      loadAppointmentStats(),
      loadPatientsWithAppointments(),
      loadAuditLogs(),
    ]);
  } finally {
    isRefreshing.value = false;
  }
};

const loadSystemStats = async () => {
  try {
    const stats = await adminStore.getSystemStatistics();
    systemStats.value = stats;
  } catch (error) {
    console.error("Error loading system stats:", error);
  }
};

const loadPatientStats = async () => {
  try {
    const stats = await PatientService.getPatientStatistics();
    patientStats.value = stats;
  } catch (error) {
    console.error("Error loading patient stats:", error);
  }
};

const loadStaffStats = async () => {
  try {
    const stats = await StaffService.getStaffStatistics();
    staffStats.value = stats;
  } catch (error) {
    console.error("Error loading staff stats:", error);
  }
};

const loadAppointmentStats = async () => {
  try {
    const stats = await AppointmentService.getAppointmentStatistics();
    appointmentStats.value = stats;
  } catch (error) {
    console.error("Error loading appointment stats:", error);
  }
};

const loadPatientsWithAppointments = async () => {
  try {
    const patients = await PatientService.getPatientsWithUpcomingAppointments();
    patientsWithAppointments.value = patients;
  } catch (error) {
    console.error("Error loading patients with appointments:", error);
  }
};

const loadAuditLogs = async () => {
  try {
    const logs = await adminStore.getAuditLogs({ limit: 10 });
    recentAuditLogs.value = logs;
  } catch (error) {
    console.error("Error loading audit logs:", error);
  }
};

const exportReport = async (type) => {
  try {
    notificationsStore.addNotification({
      title: "Report Generation Started",
      message: `Generating ${type} report...`,
      type: "info",
    });

    // TODO: Implement actual report generation
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing

    notificationsStore.addNotification({
      title: "Report Generated",
      message: `${type} report has been generated successfully`,
      type: "success",
    });
  } catch (error) {
    notificationsStore.addNotification({
      title: "Export Error",
      message: error.message,
      type: "danger",
    });
  }
};

const exportChart = (chartType) => {
  // TODO: Implement chart export
  console.log("Export chart:", chartType);
};

// Helper functions
const getLogLevelClass = (action) => {
  if (action.includes("CREATE") || action.includes("UPDATE")) {
    return "bg-success";
  }
  if (action.includes("DELETE")) {
    return "bg-danger";
  }
  return "bg-info";
};

const formatLogAction = (action) => {
  return action
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Lifecycle
onMounted(async () => {
  await refreshAllData();
});
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #dee2e6;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #dee2e6;
}

.timeline-content {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-left: 0.5rem;
}

.dropdown-toggle::after {
  display: none;
}
</style>
