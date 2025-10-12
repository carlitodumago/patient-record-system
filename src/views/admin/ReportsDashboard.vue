<template>
  <div class="container-fluid mt-3">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="mb-1">Reports Dashboard</h1>
            <p class="text-muted">
              Analytics and insights for clinic management
            </p>
          </div>
          <div class="d-flex gap-2">
            <div class="dropdown">
              <button
                class="btn btn-outline-primary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-download me-2"></i>
                Export Reports
              </button>
              <ul class="dropdown-menu">
                <li>
                  <button
                    class="dropdown-item"
                    @click="exportReport('summary')"
                  >
                    <i class="bi bi-file-earmark-text me-2"></i>
                    Summary Report (PDF)
                  </button>
                </li>
                <li>
                  <button
                    class="dropdown-item"
                    @click="exportReport('patients')"
                  >
                    <i class="bi bi-file-earmark-spreadsheet me-2"></i>
                    Patient Data (CSV)
                  </button>
                </li>
                <li>
                  <button
                    class="dropdown-item"
                    @click="exportReport('appointments')"
                  >
                    <i class="bi bi-calendar-check me-2"></i>
                    Appointment Report (Excel)
                  </button>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item" @click="exportReport('full')">
                    <i class="bi bi-file-earmark-zip me-2"></i>
                    Complete Report Package
                  </button>
                </li>
              </ul>
            </div>
            <button
              class="btn btn-primary"
              @click="refreshAllData"
              :disabled="isRefreshing"
            >
              <i class="bi bi-arrow-clockwise me-2"></i>
              Refresh Data
            </button>
          </div>
        </div>

        <!-- Key Metrics Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">{{ systemStats.users.total }}</h5>
                  <small>Total Users</small>
                </div>
                <i class="bi bi-people fs-3"></i>
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
                    {{ systemStats.patients.total }}
                  </h5>
                  <small>Total Patients</small>
                </div>
                <i class="bi bi-person-heart fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">{{ systemStats.staff.total }}</h5>
                  <small>Staff Members</small>
                </div>
                <i class="bi bi-person-badge fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ systemStats.appointments.total }}
                  </h5>
                  <small>Total Appointments</small>
                </div>
                <i class="bi bi-calendar-check fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row mb-4">
          <!-- Patient Demographics -->
          <div class="col-lg-6 mb-4">
            <div class="card h-100">
              <div
                class="card-header d-flex justify-content-between align-items-center"
              >
                <h5 class="mb-0">Patient Demographics</h5>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <button
                        class="dropdown-item"
                        @click="exportChart('demographics')"
                      >
                        <i class="bi bi-download me-2"></i>
                        Export Chart
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-6">
                    <div class="border-end">
                      <h4 class="text-primary mb-1">
                        {{ patientStats.genderDistribution.Male || 0 }}
                      </h4>
                      <small class="text-muted">Male Patients</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <h4 class="text-info mb-1">
                      {{ patientStats.genderDistribution.Female || 0 }}
                    </h4>
                    <small class="text-muted">Female Patients</small>
                  </div>
                </div>
                <div class="mt-3">
                  <h6>Blood Type Distribution</h6>
                  <div class="d-flex flex-wrap gap-2 mt-2">
                    <span
                      v-for="(
                        count, type
                      ) in patientStats.bloodTypeDistribution"
                      :key="type"
                      class="badge bg-light text-dark"
                    >
                      {{ type }}: {{ count }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Appointment Trends -->
          <div class="col-lg-6 mb-4">
            <div class="card h-100">
              <div
                class="card-header d-flex justify-content-between align-items-center"
              >
                <h5 class="mb-0">Appointment Trends</h5>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <button
                        class="dropdown-item"
                        @click="exportChart('appointments')"
                      >
                        <i class="bi bi-download me-2"></i>
                        Export Chart
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-4">
                    <h5 class="text-success mb-1">
                      {{ appointmentStats.statusDistribution.scheduled || 0 }}
                    </h5>
                    <small class="text-muted">Scheduled</small>
                  </div>
                  <div class="col-4">
                    <h5 class="text-primary mb-1">
                      {{ appointmentStats.statusDistribution.completed || 0 }}
                    </h5>
                    <small class="text-muted">Completed</small>
                  </div>
                  <div class="col-4">
                    <h5 class="text-danger mb-1">
                      {{ appointmentStats.statusDistribution.cancelled || 0 }}
                    </h5>
                    <small class="text-muted">Cancelled</small>
                  </div>
                </div>
                <div class="mt-3">
                  <div
                    class="d-flex justify-content-between align-items-center mb-2"
                  >
                    <span>Today's Appointments</span>
                    <span class="badge bg-primary">{{
                      appointmentStats.todayAppointments
                    }}</span>
                  </div>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span>This Month</span>
                    <span class="badge bg-info">{{
                      appointmentStats.monthlyAppointments
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Reports -->
        <div class="row mb-4">
          <!-- Patient Statistics -->
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Patient Statistics</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <tbody>
                      <tr>
                        <td>Total Active Patients</td>
                        <td class="text-end">
                          <span class="badge bg-success">{{
                            patientStats.totalPatients
                          }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>New Patients (This Month)</td>
                        <td class="text-end">
                          <span class="badge bg-info">{{
                            patientStats.recentPatients
                          }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Patients with Appointments</td>
                        <td class="text-end">
                          <span class="badge bg-primary">{{
                            patientsWithAppointments.length
                          }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Average Age</td>
                        <td class="text-end">
                          <span class="badge bg-secondary"
                            >{{ calculateAverageAge() }} years</span
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Staff Performance -->
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Staff Performance</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <tbody>
                      <tr>
                        <td>Total Healthcare Staff</td>
                        <td class="text-end">
                          <span class="badge bg-primary">{{
                            staffStats.totalStaff
                          }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Active Nurses</td>
                        <td class="text-end">
                          <span class="badge bg-info">{{
                            staffStats.roleDistribution.Nurse || 0
                          }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Administrators</td>
                        <td class="text-end">
                          <span class="badge bg-warning text-dark">{{
                            staffStats.roleDistribution.Admin || 0
                          }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Specializations</td>
                        <td class="text-end">
                          <span class="badge bg-secondary">{{
                            Object.keys(staffStats.specializationDistribution)
                              .length
                          }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div
                class="card-header d-flex justify-content-between align-items-center"
              >
                <h5 class="mb-0">Recent System Activity</h5>
                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="loadAuditLogs"
                >
                  <i class="bi bi-eye me-2"></i>
                  View All Logs
                </button>
              </div>
              <div class="card-body">
                <div
                  v-if="recentAuditLogs.length === 0"
                  class="text-center p-4"
                >
                  <i class="bi bi-activity fs-1 text-muted mb-3"></i>
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
                      <div
                        class="d-flex justify-content-between align-items-start"
                      >
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
              </div>
            </div>
          </div>
        </div>

        <!-- Export Options -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Report Generation</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <div class="card border-primary">
                      <div class="card-body text-center">
                        <i
                          class="bi bi-file-earmark-medical fs-1 text-primary mb-3"
                        ></i>
                        <h6 class="card-title">Patient Report</h6>
                        <p class="card-text small">
                          Comprehensive patient data and demographics
                        </p>
                        <button
                          class="btn btn-sm btn-primary"
                          @click="exportReport('patients')"
                        >
                          Generate Report
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <div class="card border-info">
                      <div class="card-body text-center">
                        <i class="bi bi-calendar-check fs-1 text-info mb-3"></i>
                        <h6 class="card-title">Appointment Report</h6>
                        <p class="card-text small">
                          Appointment statistics and scheduling data
                        </p>
                        <button
                          class="btn btn-sm btn-info"
                          @click="exportReport('appointments')"
                        >
                          Generate Report
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <div class="card border-success">
                      <div class="card-body text-center">
                        <i class="bi bi-graph-up fs-1 text-success mb-3"></i>
                        <h6 class="card-title">Analytics Report</h6>
                        <p class="card-text small">
                          System usage and performance metrics
                        </p>
                        <button
                          class="btn btn-sm btn-success"
                          @click="exportReport('analytics')"
                        >
                          Generate Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
