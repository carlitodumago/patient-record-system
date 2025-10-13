<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { formatDate, formatTimeTo12Hour, formatDateTime } from '../../utils/dateUtils';

const store = useStore();

const isLoading = ref(true);
const medicalRecords = ref([]);
const searchQuery = ref('');

// Get current user from store
const currentUser = computed(() => store.state.user);

// Mock medical records data for demonstration
const mockMedicalRecords = [
  {
    id: 1,
    patientId: 1,
    recordDate: '2023-10-05',
    condition: 'Hypertension',
    diagnosis: 'Stage 1 Hypertension',
    treatmentPlan: 'Prescribed Lisinopril 10mg daily. Recommended lifestyle changes including low-sodium diet and regular exercise.',
    physicianName: 'Dr. Smith'
  },
  {
    id: 2,
    patientId: 1,
    recordDate: '2023-09-15',
    condition: 'Annual Physical',
    diagnosis: 'Healthy with minor concerns about blood pressure',
    treatmentPlan: 'Monitor blood pressure weekly. Follow up in 3 months if not improved.',
    physicianName: 'Dr. Johnson'
  },
  {
    id: 3,
    patientId: 2,
    recordDate: '2023-11-12',
    condition: 'Asthma',
    diagnosis: 'Mild persistent asthma',
    treatmentPlan: 'Prescribed albuterol inhaler as needed and low-dose inhaled corticosteroid daily.',
    physicianName: 'Dr. Martinez'
  },
  {
    id: 4,
    patientId: 3,
    recordDate: '2023-09-28',
    condition: 'Anxiety',
    diagnosis: 'Generalized anxiety disorder',
    treatmentPlan: 'Referred to cognitive behavioral therapy. Prescribed escitalopram 10mg daily.',
    physicianName: 'Dr. Williams'
  },
  {
    id: 5,
    patientId: 4,
    recordDate: '2023-12-03',
    condition: 'Migraine',
    diagnosis: 'Chronic migraine without aura',
    treatmentPlan: 'Prescribed sumatriptan for acute attacks and propranolol for prevention.',
    physicianName: 'Dr. Brown'
  }
];

onMounted(() => {
  // Load medical records from localStorage or use mock data
  const savedRecords = localStorage.getItem('medicalRecords');
  if (savedRecords) {
    medicalRecords.value = JSON.parse(savedRecords);
  } else {
    // Use mock data for demonstration
    medicalRecords.value = mockMedicalRecords;
    // Save to localStorage
    localStorage.setItem('medicalRecords', JSON.stringify(mockMedicalRecords));
  }

  isLoading.value = false;
});

// Get filtered records for the current patient
const patientRecords = computed(() => {
  if (!currentUser.value || !currentUser.value.id) return [];

  let records = medicalRecords.value
    .filter(record => record.patientId === currentUser.value.id)
    .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate)); // Newest first

  // Apply search filter if provided
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    records = records.filter(record =>
      record.condition.toLowerCase().includes(query) ||
      record.diagnosis.toLowerCase().includes(query) ||
      record.treatmentPlan.toLowerCase().includes(query) ||
      record.physicianName.toLowerCase().includes(query)
    );
  }

  return records;
});

// Format date with time for display in 12-hour format
const formatDateWithTime = (record) => {
  if (!record.recordDate) return '';

  const date = new Date(record.recordDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  // Get time from timestamp or recordTime in 12-hour format
  let formattedTime = '';
  if (record.timestamp) {
    const timestamp = new Date(record.timestamp);
    const hours = timestamp.getHours();
    const minutes = String(timestamp.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    const displayHours = hours % 12 || 12; // Convert 0 to 12
    formattedTime = `${displayHours}:${minutes} ${period}`;
  } else if (record.recordTime) {
    formattedTime = formatTimeTo12Hour(record.recordTime);
  } else {
    formattedTime = '9:00 AM'; // Default time in 12-hour format
  }

  return `${month}/${day}/${year} ${formattedTime}`;
};
</script>

<template>
  <v-container fluid class="medical-records">
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="8">
        <h2>My Medical Records</h2>
      </v-col>
      <v-col cols="12" md="4" class="text-right">
        <v-btn color="primary" prepend-icon="mdi-printer">
          Print Records
        </v-btn>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Medical History</span>
        <v-text-field
          v-model="searchQuery"
          label="Search records..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          style="max-width: 300px;"
        ></v-text-field>
      </v-card-title>
      <v-card-text>
        <div v-if="isLoading" class="text-center my-3">
          <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
        </div>
        <v-alert v-else-if="patientRecords.length === 0" type="info">
          No medical records found.
        </v-alert>
        <div v-else>
          <v-card
            v-for="record in patientRecords"
            :key="record.id"
            class="medical-record mb-4"
            variant="outlined"
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-start mb-2">
                <h5>{{ record.condition }}</h5>
                <span class="text-caption">{{ formatDateWithTime(record) }}</span>
              </div>
              <div class="mb-2">
                <strong>Diagnosis:</strong> {{ record.diagnosis }}
              </div>
              <div class="mb-2">
                <strong>Treatment Plan:</strong> {{ record.treatmentPlan }}
              </div>
              <div class="text-caption pa-1 rounded highlight-note">
                <strong>Physician:</strong> {{ record.physicianName }}
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>Upcoming Appointments</v-card-title>
      <v-card-text>
        <p class="text-body-2">View your upcoming appointments in the <router-link to="/calendar">Calendar</router-link> section.</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.medical-records {
  padding: 20px;
}

.medical-record {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #0d6efd;
}

.highlight-note {
  color: #6c757d;
}
</style>