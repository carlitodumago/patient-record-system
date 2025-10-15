<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "vue-chartjs";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Store
const authStore = useAuthStore();

// Reactive data
const loading = ref(false);
const activeTab = ref("overview");
const dateRange = ref({
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0], // 30 days ago
  end: new Date().toISOString().split("T")[0], // today
});

const reportData = ref({
  overview: {
    totalPatients: 245,
    totalStaff: 12,
    totalAppointments: 156,
    totalRecords: 892,
    growth: {
      patients: 12,
      appointments: 8,
      records: 15,
    },
  },
  appointments: {
    byStatus: [
      { status: "Completed", count: 89, color: "#4CAF50" },
      { status: "Confirmed", count: 45, color: "#2196F3" },
      { status: "Pending", count: 15, color: "#FF9800" },
      { status: "Cancelled", count: 7, color: "#F44336" },
    ],
    byType: [
      { type: "Consultation", count: 78, color: "#9C27B0" },
      { type: "Follow-up", count: 45, color: "#607D8B" },
      { type: "Vaccination", count: 23, color: "#795548" },
      { type: "Emergency", count: 10, color: "#F44336" },
    ],
    trends: [
      { month: "Jan", appointments: 45 },
      { month: "Feb", appointments: 52 },
      { month: "Mar", appointments: 48 },
      { month: "Apr", appointments: 61 },
      { month: "May", appointments: 55 },
      { month: "Jun", appointments: 67 },
    ],
  },
  patients: {
    byGender: [
      { gender: "Male", count: 118, color: "#2196F3" },
      { gender: "Female", count: 127, color: "#E91E63" },
    ],
    byAgeGroup: [
      { group: "0-18", count: 45, color: "#4CAF50" },
      { group: "19-35", count: 78, color: "#2196F3" },
      { group: "36-55", count: 67, color: "#FF9800" },
      { group: "56+", count: 55, color: "#9C27B0" },
    ],
    registrationTrends: [
      { month: "Jan", registrations: 12 },
      { month: "Feb", registrations: 15 },
      { month: "Mar", registrations: 18 },
      { month: "Apr", registrations: 22 },
      { month: "May", registrations: 19 },
      { month: "Jun", registrations: 25 },
    ],
  },
  staff: {
    performance: [
      {
        name: "Dr. Sarah Johnson",
        patients: 45,
        appointments: 67,
        rating: 4.8,
      },
      { name: "Maria Santos, RN", patients: 38, appointments: 52, rating: 4.9 },
      { name: "Pedro Cruz, BHW", patients: 32, appointments: 41, rating: 4.7 },
    ],
    workload: [
      { day: "Mon", hours: 8 },
      { day: "Tue", hours: 7 },
      { day: "Wed", hours: 8 },
      { day: "Thu", hours: 6 },
      { day: "Fri", hours: 8 },
      { day: "Sat", hours: 4 },
    ],
  },
});

// Computed properties
const user = computed(() => authStore.user);

// Methods
const fetchReportData = async () => {
  loading.value = true;
  try {
    // Simulate API call - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Mock data is already loaded
  } catch (error) {
    console.error("Error fetching report data:", error);
  } finally {
    loading.value = false;
  }
};

const exportReport = (format) => {
  console.log(`Exporting report in ${format} format`);
  // In a real application, this would generate and download the report
  alert(
    `Report export in ${format.toUpperCase()} format would be implemented here`
  );
};

const generateCustomReport = () => {
  console.log("Generating custom report for date range:", dateRange.value);
  // In a real application, this would generate a custom report based on the selected date range
  alert("Custom report generation would be implemented here");
};

const getChartData = (data) => {
  return {
    labels: data.map(
      (item) =>
        item.status ||
        item.type ||
        item.group ||
        item.month ||
        item.name ||
        item.day
    ),
    datasets: [
      {
        data: data.map(
          (item) =>
            item.count ||
            item.appointments ||
            item.registrations ||
            item.patients ||
            item.hours
        ),
        backgroundColor: data.map((item) => item.color),
        borderWidth: 2,
      },
    ],
  };
};

const getLineChartData = (data, label) => {
  return {
    labels: data.map((item) => item.month || item.day),
    datasets: [
      {
        label: label,
        data: data.map(
          (item) => item.appointments || item.registrations || item.hours
        ),
        borderColor: "#4361ee",
        backgroundColor: "rgba(67, 97, 238, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
};

// Chart configuration options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// Chart data methods
const getAppointmentTrendsData = () => {
  return {
    labels: reportData.value.appointments.trends.map((item) => item.month),
    datasets: [
      {
        label: "Appointments",
        data: reportData.value.appointments.trends.map(
          (item) => item.appointments
        ),
        borderColor: "#4361ee",
        backgroundColor: "rgba(67, 97, 238, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
};

const getAppointmentStatusData = () => {
  return {
    labels: reportData.value.appointments.byStatus.map((item) => item.status),
    datasets: [
      {
        data: reportData.value.appointments.byStatus.map((item) => item.count),
        backgroundColor: reportData.value.appointments.byStatus.map(
          (item) => item.color
        ),
        borderWidth: 2,
      },
    ],
  };
};

const getAppointmentTypesData = () => {
  return {
    labels: reportData.value.appointments.byType.map((item) => item.type),
    datasets: [
      {
        label: "Appointments",
        data: reportData.value.appointments.byType.map((item) => item.count),
        backgroundColor: reportData.value.appointments.byType.map(
          (item) => item.color
        ),
        borderWidth: 2,
      },
    ],
  };
};

const getPatientGenderData = () => {
  return {
    labels: reportData.value.patients.byGender.map((item) => item.gender),
    datasets: [
      {
        data: reportData.value.patients.byGender.map((item) => item.count),
        backgroundColor: reportData.value.patients.byGender.map(
          (item) => item.color
        ),
        borderWidth: 2,
      },
    ],
  };
};

const getPatientAgeData = () => {
  return {
    labels: reportData.value.patients.byAgeGroup.map(
      (item) => item.group + " years"
    ),
    datasets: [
      {
        label: "Patients",
        data: reportData.value.patients.byAgeGroup.map((item) => item.count),
        backgroundColor: reportData.value.patients.byAgeGroup.map(
          (item) => item.color
        ),
        borderWidth: 2,
      },
    ],
  };
};

const getRegistrationTrendsData = () => {
  return {
    labels: reportData.value.patients.registrationTrends.map(
      (item) => item.month
    ),
    datasets: [
      {
        label: "Registrations",
        data: reportData.value.patients.registrationTrends.map(
          (item) => item.registrations
        ),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
};

const getWorkloadData = () => {
  return {
    labels: reportData.value.staff.workload.map((item) => item.day),
    datasets: [
      {
        label: "Hours",
        data: reportData.value.staff.workload.map((item) => item.hours),
        backgroundColor: "#FF9800",
        borderWidth: 1,
      },
    ],
  };
};

onMounted(() => {
  fetchReportData();
});
</script>

<template>
  <div class="reports-analytics">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Reports & Analytics</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Comprehensive clinic statistics and insights
        </p>
      </div>
      <div class="animate-fade-in-right">
        <div class="btn-group">
          <button
            class="btn btn-outline-primary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i class="bi bi-download me-2"></i>
            Export Report
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="#" @click="exportReport('pdf')"
                ><i class="bi bi-file-earmark-pdf me-2"></i>Export as PDF</a
              >
            </li>
            <li>
              <a class="dropdown-item" href="#" @click="exportReport('excel')"
                ><i class="bi bi-file-earmark-excel me-2"></i>Export as Excel</a
              >
            </li>
            <li>
              <a class="dropdown-item" href="#" @click="exportReport('csv')"
                ><i class="bi bi-file-earmark-spreadsheet me-2"></i>Export as
                CSV</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Date Range Selector -->
    <div class="card mb-4 animate-fade-in-up">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <label class="form-label">Start Date</label>
            <input v-model="dateRange.start" type="date" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">End Date</label>
            <input v-model="dateRange.end" type="date" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">&nbsp;</label>
            <div class="d-grid">
              <button class="btn btn-primary" @click="generateCustomReport">
                <i class="bi bi-bar-chart-line me-2"></i>
                Generate Custom Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <ul
      class="nav nav-tabs mb-4 animate-fade-in-up animation-delay-200"
      role="tablist"
    >
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          <i class="bi bi-speedometer2 me-2"></i>Overview
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'appointments' }"
          @click="activeTab = 'appointments'"
        >
          <i class="bi bi-calendar-check me-2"></i>Appointments
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'patients' }"
          @click="activeTab = 'patients'"
        >
          <i class="bi bi-people me-2"></i>Patients
        </button>
      </li>
    </ul>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary animate-pulse" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading report data...</p>
    </div>

    <!-- Overview Tab -->
    <div v-else-if="activeTab === 'overview'" class="animate-fade-in-up">
      <!-- Key Metrics -->
      <div class="row g-4 mb-4">
        <div class="col-xl-3 col-lg-6">
          <div class="card stats-card animate-fade-in-up">
            <div class="card-body text-center">
              <div class="stats-icon mb-3">
                <i
                  class="bi bi-people-fill text-primary fs-1 animate-float"
                ></i>
              </div>
              <h3 class="card-title text-primary mb-2">
                {{ reportData.overview.totalPatients }}
              </h3>
              <p class="card-text text-muted mb-2">Total Patients</p>
              <small class="text-success">
                <i class="bi bi-arrow-up"></i>
                +{{ reportData.overview.growth.patients }}% from last month
              </small>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-lg-6">
          <div class="card stats-card animate-fade-in-up animation-delay-100">
            <div class="card-body text-center">
              <div class="stats-icon mb-3">
                <i
                  class="bi bi-person-badge-fill text-info fs-1 animate-float"
                ></i>
              </div>
              <h3 class="card-title text-info mb-2">
                {{ reportData.overview.totalStaff }}
              </h3>
              <p class="card-text text-muted mb-2">Healthcare Staff</p>
              <small class="text-muted">All active and operational</small>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-lg-6">
          <div class="card stats-card animate-fade-in-up animation-delay-200">
            <div class="card-body text-center">
              <div class="stats-icon mb-3">
                <i
                  class="bi bi-calendar-day-fill text-warning fs-1 animate-float"
                ></i>
              </div>
              <h3 class="card-title text-warning mb-2">
                {{ reportData.overview.totalAppointments }}
              </h3>
              <p class="card-text text-muted mb-2">Total Appointments</p>
              <small class="text-success">
                <i class="bi bi-arrow-up"></i>
                +{{ reportData.overview.growth.appointments }}% from last month
              </small>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-lg-6">
          <div class="card stats-card animate-fade-in-up animation-delay-300">
            <div class="card-body text-center">
              <div class="stats-icon mb-3">
                <i
                  class="bi bi-file-medical text-success fs-1 animate-float"
                ></i>
              </div>
              <h3 class="card-title text-success mb-2">
                {{ reportData.overview.totalRecords }}
              </h3>
              <p class="card-text text-muted mb-2">Medical Records</p>
              <small class="text-success">
                <i class="bi bi-arrow-up"></i>
                +{{ reportData.overview.growth.records }}% from last month
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row g-4">
        <!-- Appointment Trends -->
        <div class="col-lg-8">
          <div class="card animate-fade-in-left">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-graph-up me-2"></i>
                Appointment Trends (6 Months)
              </h5>
            </div>
            <div class="card-body">
              <Line
                :data="getAppointmentTrendsData()"
                :options="chartOptions"
                class="chart-container"
              />
            </div>
          </div>
        </div>

        <!-- Appointment Status Distribution -->
        <div class="col-lg-4">
          <div class="card animate-fade-in-right">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-pie-chart me-2"></i>
                Appointment Status
              </h5>
            </div>
            <div class="card-body">
              <Doughnut
                :data="getAppointmentStatusData()"
                :options="doughnutOptions"
                class="chart-container"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointments Tab -->
    <div v-else-if="activeTab === 'appointments'" class="animate-fade-in-up">
      <div class="row g-4">
        <!-- Appointment Types -->
        <div class="col-lg-6">
          <div class="card animate-fade-in-left">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-bar-chart me-2"></i>
                Appointments by Type
              </h5>
            </div>
            <div class="card-body">
              <Bar
                :data="getAppointmentTypesData()"
                :options="barOptions"
                class="chart-container"
              />
            </div>
          </div>
        </div>

        <!-- Appointment Trends -->
        <div class="col-lg-6">
          <div class="card animate-fade-in-right">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-graph-up me-2"></i>
                Monthly Appointment Trends
              </h5>
            </div>
            <div class="card-body">
              <Line
                :data="getAppointmentTrendsData()"
                :options="chartOptions"
                class="chart-container"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Patients Tab -->
    <div v-else-if="activeTab === 'patients'" class="animate-fade-in-up">
      <div class="row g-4">
        <!-- Patient Demographics -->
        <div class="col-lg-6">
          <div class="card animate-fade-in-left">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-pie-chart me-2"></i>
                Patient Demographics (Gender)
              </h5>
            </div>
            <div class="card-body">
              <Doughnut
                :data="getPatientGenderData()"
                :options="doughnutOptions"
                class="chart-container"
              />
            </div>
          </div>
        </div>

        <!-- Age Groups -->
        <div class="col-lg-6">
          <div class="card animate-fade-in-right">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-bar-chart me-2"></i>
                Patient Age Groups
              </h5>
            </div>
            <div class="card-body">
              <Bar
                :data="getPatientAgeData()"
                :options="barOptions"
                class="chart-container"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Registration Trends -->
      <div class="card mt-4 animate-fade-in-up animation-delay-200">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-graph-up me-2"></i>
            Patient Registration Trends
          </h5>
        </div>
        <div class="card-body">
          <Line
            :data="getRegistrationTrendsData()"
            :options="chartOptions"
            class="chart-container"
          />
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

.nav-tabs .nav-link {
  border: none;
  color: var(--text-color);
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--primary-gradient-start);
}

.nav-tabs .nav-link.active {
  background: linear-gradient(
    135deg,
    var(--primary-gradient-start),
    var(--primary-gradient-end)
  );
  color: white;
}

.chart-placeholder {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.05));
  border-radius: 10px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.chart-container {
  width: 100% !important;
  height: 300px !important;
  position: relative;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.staff-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-gradient-start);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.rating {
  display: flex;
  align-items: center;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: var(--text-color);
  background-color: rgba(0, 0, 0, 0.02);
}

.table td {
  vertical-align: middle;
  border-color: rgba(0, 0, 0, 0.05);
}

.workload-bar {
  width: 100%;
  border-radius: 4px;
  transition: all 0.3s ease;
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
  .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .chart-placeholder {
    min-height: 200px;
  }

  .chart-container {
    height: 250px !important;
  }
}
</style>
