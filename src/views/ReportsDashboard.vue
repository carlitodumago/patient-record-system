<template>
  <v-container fluid class="mt-3">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <h1 class="mb-1">Reports Dashboard</h1>
              <p class="text-caption text-medium-emphasis">
                Comprehensive analytics and reporting for healthcare management
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                @click="exportReport"
                prepend-icon="mdi-download"
                :loading="isExporting"
              >
                Export Report
              </v-btn>
              <v-btn
                variant="outlined"
                @click="refreshData"
                :loading="isRefreshing"
                prepend-icon="mdi-refresh"
              >
                Refresh
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text>
            <!-- Report Filters -->
            <v-row class="mb-4">
              <v-col cols="12" md="3">
                <v-select
                  v-model="reportType"
                  :items="reportTypeOptions"
                  label="Report Type"
                  variant="outlined"
                  @update:model-value="loadReportData"
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="dateRange.start"
                  label="Start Date"
                  type="date"
                  variant="outlined"
                  @change="loadReportData"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="dateRange.end"
                  label="End Date"
                  type="date"
                  variant="outlined"
                  @change="loadReportData"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="selectedStaff"
                  :items="staffOptions"
                  label="Filter by Staff"
                  variant="outlined"
                  clearable
                  @update:model-value="loadReportData"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Report Summary Cards -->
            <v-row class="mb-6">
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="text-center pa-4">
                  <v-icon size="48" color="primary" class="mb-2">mdi-account-group</v-icon>
                  <div class="text-h4 text-primary">{{ summaryStats.totalPatients }}</div>
                  <div class="text-caption">Total Patients</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="text-center pa-4">
                  <v-icon size="48" color="success" class="mb-2">mdi-calendar-check</v-icon>
                  <div class="text-h4 text-success">{{ summaryStats.totalAppointments }}</div>
                  <div class="text-caption">Total Appointments</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="text-center pa-4">
                  <v-icon size="48" color="warning" class="mb-2">mdi-file-document</v-icon>
                  <div class="text-h4 text-warning">{{ summaryStats.totalRecords }}</div>
                  <div class="text-caption">Medical Records</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="text-center pa-4">
                  <v-icon size="48" color="info" class="mb-2">mdi-trending-up</v-icon>
                  <div class="text-h4 text-info">{{ summaryStats.avgAppointmentsPerDay }}</div>
                  <div class="text-caption">Avg Appointments/Day</div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Charts Section -->
            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Appointments by Status</v-card-title>
                  <v-card-text>
                    <apexchart
                      type="pie"
                      :options="appointmentStatusChartOptions"
                      :series="appointmentStatusChartSeries"
                      height="300"
                    ></apexchart>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Appointments Over Time</v-card-title>
                  <v-card-text>
                    <apexchart
                      type="line"
                      :options="appointmentsOverTimeChartOptions"
                      :series="appointmentsOverTimeChartSeries"
                      height="300"
                    ></apexchart>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Medical Records by Type</v-card-title>
                  <v-card-text>
                    <apexchart
                      type="bar"
                      :options="recordsByTypeChartOptions"
                      :series="recordsByTypeChartSeries"
                      height="300"
                    ></apexchart>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Patient Demographics</v-card-title>
                  <v-card-text>
                    <apexchart
                      type="donut"
                      :options="patientDemographicsChartOptions"
                      :series="patientDemographicsChartSeries"
                      height="300"
                    ></apexchart>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Detailed Reports Table -->
            <v-card class="mb-4">
              <v-card-title>{{ currentReportTitle }}</v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="reportHeaders"
                  :items="reportData"
                  class="elevation-1"
                  :loading="isLoadingReport"
                  hide-default-footer
                  :items-per-page="10"
                >
                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      size="small"
                      variant="outlined"
                      color="primary"
                      class="me-1"
                      @click="viewDetails(item)"
                    >
                      View Details
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Details Modal -->
    <v-dialog
      v-model="showDetailsModal"
      max-width="800px"
    >
      <v-card v-if="selectedItem">
        <v-card-title>
          <span class="text-h5">{{ selectedItem.title || 'Details' }}</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="(value, key) in selectedItem"
              :key="key"
              cols="12"
              md="6"
            >
              <div class="detail-item">
                <strong>{{ formatKey(key) }}:</strong> {{ value }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showDetailsModal = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import VueApexCharts from 'vue3-apexcharts';

const store = useStore();

// Reactive data
const isRefreshing = ref(false);
const isExporting = ref(false);
const isLoadingReport = ref(false);
const reportType = ref('appointments');
const selectedStaff = ref(null);
const showDetailsModal = ref(false);
const selectedItem = ref(null);

const dateRange = ref({
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
  end: new Date().toISOString().split('T')[0],
});

const summaryStats = ref({
  totalPatients: 0,
  totalAppointments: 0,
  totalRecords: 0,
  avgAppointmentsPerDay: 0,
});

const reportData = ref([]);
const staff = ref([]);

// Options
const reportTypeOptions = [
  { title: 'Appointments Report', value: 'appointments' },
  { title: 'Medical Records Report', value: 'records' },
  { title: 'Patient Report', value: 'patients' },
  { title: 'Staff Performance Report', value: 'staff' },
];

const staffOptions = computed(() => {
  return staff.value.map(member => ({
    title: `${member.first_name} ${member.surname}`,
    value: member.staff_id,
  }));
});

const currentReportTitle = computed(() => {
  const titles = {
    appointments: 'Appointments Report',
    records: 'Medical Records Report',
    patients: 'Patient Report',
    staff: 'Staff Performance Report',
  };
  return titles[reportType.value] || 'Report';
});

const reportHeaders = computed(() => {
  const headers = {
    appointments: [
      { title: 'Date', key: 'date' },
      { title: 'Patient', key: 'patientName' },
      { title: 'Staff', key: 'staffName' },
      { title: 'Status', key: 'status' },
      { title: 'Actions', key: 'actions' },
    ],
    records: [
      { title: 'Date', key: 'date' },
      { title: 'Patient', key: 'patientName' },
      { title: 'Type', key: 'type' },
      { title: 'Condition', key: 'condition' },
      { title: 'Actions', key: 'actions' },
    ],
    patients: [
      { title: 'Name', key: 'name' },
      { title: 'Age', key: 'age' },
      { title: 'Gender', key: 'gender' },
      { title: 'Last Visit', key: 'lastVisit' },
      { title: 'Actions', key: 'actions' },
    ],
    staff: [
      { title: 'Name', key: 'name' },
      { title: 'Role', key: 'role' },
      { title: 'Appointments', key: 'appointments' },
      { title: 'Performance', key: 'performance' },
      { title: 'Actions', key: 'actions' },
    ],
  };
  return headers[reportType.value] || [];
});

// Chart configurations
const appointmentStatusChartOptions = ref({
  chart: {
    type: 'pie',
  },
  labels: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
  colors: ['#2196F3', '#4CAF50', '#F44336', '#FF9800'],
  legend: {
    position: 'bottom',
  },
});

const appointmentStatusChartSeries = ref([0, 0, 0, 0]);

const appointmentsOverTimeChartOptions = ref({
  chart: {
    type: 'line',
    height: 300,
  },
  xaxis: {
    type: 'datetime',
  },
  yaxis: {
    title: {
      text: 'Number of Appointments',
    },
  },
  colors: ['#2196F3'],
});

const appointmentsOverTimeChartSeries = ref([{
  name: 'Appointments',
  data: [],
}]);

const recordsByTypeChartOptions = ref({
  chart: {
    type: 'bar',
  },
  xaxis: {
    categories: ['Consultation', 'Diagnosis', 'Treatment', 'Follow-up'],
  },
  colors: ['#4CAF50'],
});

const recordsByTypeChartSeries = ref([{
  name: 'Records',
  data: [0, 0, 0, 0],
}]);

const patientDemographicsChartOptions = ref({
  chart: {
    type: 'donut',
  },
  labels: ['Male', 'Female', 'Other'],
  colors: ['#2196F3', '#E91E63', '#9C27B0'],
  legend: {
    position: 'bottom',
  },
});

const patientDemographicsChartSeries = ref([0, 0, 0]);

// Methods
const loadReportData = async () => {
  isLoadingReport.value = true;
  try {
    // Load data based on report type
    switch (reportType.value) {
      case 'appointments':
        await loadAppointmentsReport();
        break;
      case 'records':
        await loadRecordsReport();
        break;
      case 'patients':
        await loadPatientsReport();
        break;
      case 'staff':
        await loadStaffReport();
        break;
    }
  } catch (error) {
    console.error('Error loading report data:', error);
  } finally {
    isLoadingReport.value = false;
  }
};

const loadAppointmentsReport = async () => {
  // Mock data - replace with actual API calls
  reportData.value = [
    {
      id: 1,
      date: '2024-01-15',
      patientName: 'John Doe',
      staffName: 'Dr. Smith',
      status: 'Completed',
    },
    {
      id: 2,
      date: '2024-01-16',
      patientName: 'Jane Smith',
      staffName: 'Dr. Johnson',
      status: 'Scheduled',
    },
  ];

  // Update chart data
  appointmentStatusChartSeries.value = [45, 30, 15, 10];
  appointmentsOverTimeChartSeries.value[0].data = [
    [new Date('2024-01-01').getTime(), 5],
    [new Date('2024-01-02').getTime(), 8],
    [new Date('2024-01-03').getTime(), 12],
  ];
};

const loadRecordsReport = async () => {
  reportData.value = [
    {
      id: 1,
      date: '2024-01-15',
      patientName: 'John Doe',
      type: 'Consultation',
      condition: 'Regular Checkup',
    },
    {
      id: 2,
      date: '2024-01-16',
      patientName: 'Jane Smith',
      type: 'Diagnosis',
      condition: 'Hypertension',
    },
  ];

  recordsByTypeChartSeries.value[0].data = [25, 15, 20, 10];
};

const loadPatientsReport = async () => {
  reportData.value = [
    {
      id: 1,
      name: 'John Doe',
      age: 35,
      gender: 'Male',
      lastVisit: '2024-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 28,
      gender: 'Female',
      lastVisit: '2024-01-16',
    },
  ];

  patientDemographicsChartSeries.value = [45, 50, 5];
};

const loadStaffReport = async () => {
  reportData.value = [
    {
      id: 1,
      name: 'Dr. Smith',
      role: 'Doctor',
      appointments: 45,
      performance: 'Excellent',
    },
    {
      id: 2,
      name: 'Nurse Johnson',
      role: 'Nurse',
      appointments: 38,
      performance: 'Good',
    },
  ];
};

const refreshData = async () => {
  isRefreshing.value = true;
  try {
    await loadReportData();
    // Update summary stats
    summaryStats.value = {
      totalPatients: 150,
      totalAppointments: 320,
      totalRecords: 280,
      avgAppointmentsPerDay: 8.5,
    };
  } finally {
    isRefreshing.value = false;
  }
};

const exportReport = async () => {
  isExporting.value = true;
  try {
    // Implement export functionality
    console.log('Exporting report...');
    // This would typically generate a PDF or CSV
    alert('Report exported successfully!');
  } finally {
    isExporting.value = false;
  }
};

const viewDetails = (item) => {
  selectedItem.value = item;
  showDetailsModal.value = true;
};

const formatKey = (key) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

// Load staff data
const loadStaff = async () => {
  // Mock staff data - replace with actual API call
  staff.value = [
    { staff_id: 1, first_name: 'Dr.', surname: 'Smith' },
    { staff_id: 2, first_name: 'Nurse', surname: 'Johnson' },
  ];
};

onMounted(async () => {
  await loadStaff();
  await refreshData();
});
</script>

<style scoped>
.detail-item {
  margin-bottom: 8px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}
</style>
