<template>
  <v-container fluid class="mt-3">
    <h1 class="mb-2">Nurse Dashboard</h1>
    <p class="text-body-2">Patient management and clinical overview</p>

    <!-- Overview Stats -->
    <v-row class="mt-4">
      <v-col cols="12" md="4" class="mb-4">
        <v-card color="primary" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">{{ stats.totalRecords }}</div>
              <div class="text-body-2">Total Records</div>
            </div>
            <v-icon size="48" class="opacity-75">mdi-file-document-outline</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="mb-4">
        <v-card color="success" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">{{ stats.activePatients }}</div>
              <div class="text-body-2">Active Patients</div>
            </div>
            <v-icon size="48" class="opacity-75">mdi-account-group</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="mb-4">
        <v-card color="warning" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">{{ stats.todayAppointments }}</div>
              <div class="text-body-2">Today's Appointments</div>
            </div>
            <v-icon size="48" class="opacity-75">mdi-calendar-check</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Patient Alerts -->
    <v-row class="mt-4" v-if="patientAlerts.length > 0">
      <v-col cols="12">
        <v-alert
          v-for="alert in patientAlerts"
          :key="alert.id"
          :type="alert.type"
          variant="tonal"
          class="mb-2"
          closable
        >
          <v-icon :icon="alert.icon" class="me-2"></v-icon>
          <strong>{{ alert.patientName }}</strong>: {{ alert.message }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Today's Appointments Calendar and Pending Tasks -->
    <v-row class="mt-4">
      <v-col cols="12" md="6" class="mb-4">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Today's Appointments</span>
            <v-btn color="primary" prepend-icon="mdi-calendar-plus" size="small" :to="'/appointments/new'">
              Schedule New
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-calendar
              v-model="calendarDate"
              :events="calendarEvents"
              view="day"
              :height="300"
              color="primary"
            >
              <template v-slot:event="{ event }">
                <div class="text-caption">
                  <strong>{{ event.time }}</strong><br>
                  {{ event.patientName }} - {{ event.purpose }}
                </div>
              </template>
            </v-calendar>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="mb-4">
        <v-card>
          <v-card-title>Pending Tasks</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="task in pendingTasks"
                :key="task.id"
                :prepend-icon="task.icon"
                :subtitle="task.subtitle"
                :title="task.title"
              >
                <template v-slot:append>
                  <v-btn
                    :color="task.actionColor"
                    size="small"
                    variant="outlined"
                    @click="handleTaskAction(task)"
                  >
                    {{ task.actionText }}
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Patients and Medical Records -->
    <v-row class="mt-4">
      <v-col cols="12" md="6" class="mb-4">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Recent Patients</span>
            <v-btn color="success" prepend-icon="mdi-account-plus" size="small" :to="'/patients/new'">
              Add Patient
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="patientHeaders"
              :items="recentPatients"
              hide-default-footer
              class="elevation-1"
            >
              <template v-slot:item.status="{ item }">
                <v-chip :color="item.status === 'Active' ? 'success' : 'warning'" size="small">
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn-group>
                  <v-btn size="small" variant="outlined" color="primary" :to="`/patients/${item.id}`">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn size="small" variant="outlined" color="secondary" :to="`/patients/${item.id}/edit`">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-btn-group>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="mb-4">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Recent Medical Records</span>
            <v-btn variant="outlined" color="primary" size="small" :to="'/records'">
              View All Records
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="recordHeaders"
              :items="recentRecords"
              hide-default-footer
              class="elevation-1"
            >
              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn-group>
                  <v-btn size="small" variant="outlined" color="primary" :to="`/records/${item.id}`">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn size="small" variant="outlined" color="secondary" :to="`/records/${item.id}/edit`">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-btn-group>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

// Stats data
const stats = ref({
  totalRecords: 150,
  activePatients: 25,
  todayAppointments: 10
});

// Calendar data
const calendarDate = ref(new Date().toISOString().split('T')[0]);
const calendarEvents = ref([
  {
    id: 1,
    title: 'John Doe - Annual Physical',
    start: new Date().toISOString().split('T')[0] + 'T09:00:00',
    end: new Date().toISOString().split('T')[0] + 'T09:30:00',
    time: '9:00 AM',
    patientName: 'John Doe',
    purpose: 'Annual Physical',
    color: 'primary'
  },
  {
    id: 2,
    title: 'Jane Smith - Follow-up',
    start: new Date().toISOString().split('T')[0] + 'T10:30:00',
    end: new Date().toISOString().split('T')[0] + 'T11:00:00',
    time: '10:30 AM',
    patientName: 'Jane Smith',
    purpose: 'Follow-up',
    color: 'primary'
  },
  {
    id: 3,
    title: 'Michael Johnson - Blood Test',
    start: new Date().toISOString().split('T')[0] + 'T11:00:00',
    end: new Date().toISOString().split('T')[0] + 'T11:30:00',
    time: '11:00 AM',
    patientName: 'Michael Johnson',
    purpose: 'Blood Test',
    color: 'warning'
  },
  {
    id: 4,
    title: 'Sarah Williams - Consultation',
    start: new Date().toISOString().split('T')[0] + 'T14:00:00',
    end: new Date().toISOString().split('T')[0] + 'T14:30:00',
    time: '2:00 PM',
    patientName: 'Sarah Williams',
    purpose: 'Consultation',
    color: 'primary'
  },
  {
    id: 5,
    title: 'Robert Brown - Vaccination',
    start: new Date().toISOString().split('T')[0] + 'T15:30:00',
    end: new Date().toISOString().split('T')[0] + 'T16:00:00',
    time: '3:30 PM',
    patientName: 'Robert Brown',
    purpose: 'Vaccination',
    color: 'primary'
  }
]);

// Patient alerts
const patientAlerts = ref([
  {
    id: 1,
    patientName: 'John Doe',
    message: 'Blood pressure reading is high - requires immediate attention',
    type: 'error',
    icon: 'mdi-alert-circle'
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    message: 'Follow-up appointment due in 2 days',
    type: 'warning',
    icon: 'mdi-clock-outline'
  }
]);

// Pending tasks
const pendingTasks = ref([
  {
    id: 1,
    title: 'Review Lab Results',
    subtitle: 'John Doe - Complete Blood Count',
    icon: 'mdi-flask',
    actionText: 'Review',
    actionColor: 'primary'
  },
  {
    id: 2,
    title: 'Medication Reminder',
    subtitle: 'Jane Smith - Lisinopril refill due',
    icon: 'mdi-pill',
    actionText: 'Send Reminder',
    actionColor: 'success'
  },
  {
    id: 3,
    title: 'Appointment Confirmation',
    subtitle: 'Michael Johnson - Confirm tomorrow\'s visit',
    icon: 'mdi-calendar-check',
    actionText: 'Confirm',
    actionColor: 'info'
  },
  {
    id: 4,
    title: 'Insurance Update',
    subtitle: 'Sarah Williams - Policy expires soon',
    icon: 'mdi-file-document',
    actionText: 'Update',
    actionColor: 'warning'
  }
]);

// Patient table headers and data
const patientHeaders = ref([
  { title: 'Name', key: 'name' },
  { title: 'Last Visit', key: 'lastVisit' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
]);

const recentPatients = ref([
  {
    id: 1,
    name: 'John Doe',
    lastVisit: '03/06/2025',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    lastVisit: '03/05/2025',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Michael Johnson',
    lastVisit: '02/28/2025',
    status: 'Follow-up'
  }
]);

// Record table headers and data
const recordHeaders = ref([
  { title: 'Record ID', key: 'id' },
  { title: 'Patient', key: 'patient' },
  { title: 'Type', key: 'type' },
  { title: 'Date', key: 'date' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
]);

const recentRecords = ref([
  {
    id: 'PR-001',
    patient: 'John Doe',
    type: 'Visit',
    date: '03/06/2025 10:30',
    status: 'Verified'
  },
  {
    id: 'PR-002',
    patient: 'Jane Smith',
    type: 'History',
    date: '03/05/2025 14:00',
    status: 'Pending'
  },
  {
    id: 'PR-003',
    patient: 'Michael Johnson',
    type: 'Lab Results',
    date: '03/04/2025 09:15',
    status: 'New'
  }
]);

// Helper methods
const getStatusColor = (status) => {
  const colors = {
    'Verified': 'success',
    'Pending': 'warning',
    'New': 'info'
  };
  return colors[status] || 'grey';
};

const handleTaskAction = (task) => {
  // Handle task actions (could navigate to specific pages or open modals)
  console.log('Handling task action:', task);
  // For now, just show an alert
  alert(`Action "${task.actionText}" for task "${task.title}"`);
};

onMounted(() => {
  // Initialize dashboard data
  // Could fetch real data from API here
});
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.bg-primary, .bg-success, .bg-warning, .bg-info {
  border: none;
}

.bi {
  opacity: 0.7;
}
</style>