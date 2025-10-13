<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { formatDate, formatTimeTo12Hour, formatDateTime } from '../utils/dateUtils';
import { addNotification } from '../utils/notificationUtils';

const store = useStore();
const router = useRouter();

const patients = computed(() => store.state.patients);
const isLoading = ref(true);
const searchQuery = ref('');
const selectedPatient = ref(null);
const medicalRecords = ref([]);
const showAddRecordModal = ref(false);
const newRecord = ref({
  patientId: null,
  recordDate: '',
  recordTime: '',
  condition: '',
  diagnosis: '',
  treatmentPlan: '',
  physicianName: ''
});
const formErrors = ref({});
const isEditing = ref(false);
const currentRecordId = ref(null);

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
  // Load patient data if not already loaded
  if (patients.value.length === 0) {
    const savedPatients = localStorage.getItem('patientRecords');
    if (savedPatients) {
      store.commit('setPatients', JSON.parse(savedPatients));
    }
  }
  
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

// Filtered list of patients based on search query
const filteredPatients = computed(() => {
  if (!searchQuery.value) return patients.value;
  
  const query = searchQuery.value.toLowerCase();
  return patients.value.filter(patient => 
    patient.firstName.toLowerCase().includes(query) || 
    patient.lastName.toLowerCase().includes(query) ||
    (patient.medicalConditions && patient.medicalConditions.some(condition => 
      condition.toLowerCase().includes(query)
    ))
  );
});

// Get patient name by ID
const getPatientName = (patientId) => {
  const patient = patients.value.find(p => p.id === patientId);
  return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
};

// Select a patient to view their records
const selectPatient = (patient) => {
  selectedPatient.value = patient;
};

// Get filtered records for the selected patient
const patientRecords = computed(() => {
  if (!selectedPatient.value) return [];
  
  return medicalRecords.value
    .filter(record => record.patientId === selectedPatient.value.id)
    .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate)); // Newest first
});

// View patient details
const viewPatient = (id) => {
  router.push(`/patients/${id}`);
};

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

// Get just the time portion from a record in 12-hour format
const getRecordTime = (record) => {
  if (record.timestamp) {
    const date = new Date(record.timestamp);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    const displayHours = hours % 12 || 12; // Convert 0 to 12
    return `${displayHours}:${minutes} ${period}`;
  }
  return record.recordTime ? formatTimeTo12Hour(record.recordTime) : '9:00 AM'; // Default time in 12-hour format
};

// Add a new medical record
const addMedicalRecord = () => {
  if (!selectedPatient.value) {
    alert('Please select a patient first');
    return;
  }
  
  const now = new Date();
  
  showAddRecordModal.value = true;
  // Reset form
  newRecord.value = {
    patientId: selectedPatient.value.id,
    recordDate: now.toISOString().split('T')[0], // Today's date as default
    recordTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, // Current time
    condition: '',
    diagnosis: '',
    treatmentPlan: '',
    physicianName: ''
  };
  formErrors.value = {};
};

// Form validation
const validateForm = () => {
  const errors = {};
  
  if (!newRecord.value.recordDate) {
    errors.recordDate = 'Date is required';
  }
  
  // Time validation with 12-hour format support
  if (newRecord.value.recordTime) {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?[APap][Mm]$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newRecord.value.recordTime)) {
      errors.recordTime = 'Please enter a valid time in HH:MM or h:mm AM/PM format';
    }
  }
  
  if (!newRecord.value.condition) {
    errors.condition = 'Condition is required';
  }
  
  if (!newRecord.value.diagnosis) {
    errors.diagnosis = 'Diagnosis is required';
  }
  
  if (!newRecord.value.physicianName) {
    errors.physicianName = 'Physician name is required';
  }
  
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Save new medical record
const saveRecord = () => {
  if (!validateForm()) {
    return;
  }
  
  // Create a copy with timestamp based on date and time
  const recordData = { ...newRecord.value };
  
  // Ensure recordTime is set, use current time if not provided
  if (!recordData.recordTime) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    recordData.recordTime = `${displayHours}:${minutes} ${period}`;
  }
  
  // Convert 12-hour format to 24-hour format for storage if needed
  let timeFor24Hour = recordData.recordTime;
  if (recordData.recordTime.includes('AM') || recordData.recordTime.includes('PM')) {
    // Parse the 12-hour time
    const match = recordData.recordTime.match(/^(\d{1,2}):(\d{2})\s?([APap][Mm])$/);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3].toUpperCase();
      
      // Convert to 24-hour
      if (period === 'PM' && hours < 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      timeFor24Hour = `${String(hours).padStart(2, '0')}:${minutes}`;
    }
  }
  
  // Create a timestamp from date and time
  if (recordData.recordDate && timeFor24Hour) {
    const [hours, minutes] = timeFor24Hour.split(':');
    const dateObj = new Date(recordData.recordDate);
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    recordData.timestamp = dateObj.toISOString();
  }
  
  if (isEditing.value) {
    // Update existing record
    const index = medicalRecords.value.findIndex(r => r.id === currentRecordId.value);
    if (index !== -1) {
      medicalRecords.value[index] = { 
        ...recordData,
        id: currentRecordId.value
      };
      
      // Create notification for editing record
      addNotification(store, {
        title: 'Medical Record Updated',
        message: `Medical record for ${getPatientName(newRecord.value.patientId)} has been updated.`,
        type: 'info',
        noButtons: true
      });
      
      // Show success message
      alert('Medical record updated successfully!');
    }
  } else {
    // Create a new record with generated ID
    const id = Math.max(0, ...medicalRecords.value.map(r => r.id)) + 1;
    const record = {
      ...recordData,
      id
    };
    
    // Add to records array
    medicalRecords.value.push(record);
    
    // Create notification for new record
    addNotification(store, {
      title: 'New Medical Record',
      message: `A new medical record for ${getPatientName(record.patientId)} has been added.`,
      type: 'success',
      noButtons: true
    });
    
    // Show success message
    alert('Medical record added successfully!');
  }
  
  // Save to localStorage
  localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords.value));
  
  // Close modal
  showAddRecordModal.value = false;
  isEditing.value = false;
  currentRecordId.value = null;
};

// Edit a medical record
const editMedicalRecord = (record) => {
  isEditing.value = true;
  currentRecordId.value = record.id;
  
  // Create a copy to edit
  const recordCopy = { ...record };
  
  // Extract time from timestamp if available
  if (recordCopy.timestamp) {
    const dateObj = new Date(recordCopy.timestamp);
    const hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    recordCopy.recordTime = `${displayHours}:${minutes} ${period}`;
  } else if (!recordCopy.recordTime) {
    recordCopy.recordTime = '9:00 AM'; // Default time in 12-hour format
  } else if (recordCopy.recordTime && !recordCopy.recordTime.includes('AM') && !recordCopy.recordTime.includes('PM')) {
    // Convert 24-hour format to 12-hour format if needed
    recordCopy.recordTime = formatTimeTo12Hour(recordCopy.recordTime);
  }
  
  newRecord.value = recordCopy;
  showAddRecordModal.value = true;
  formErrors.value = {};
};

// Delete a medical record
const deleteMedicalRecord = (id) => {
  if (!confirm('Are you sure you want to delete this medical record?')) {
    return;
  }
  
  // Find the record to get patient details for notification
  const recordToDelete = medicalRecords.value.find(r => r.id === id);
  
  if (recordToDelete) {
    // Create notification for deletion
    addNotification(store, {
      title: 'Medical Record Deleted',
      message: `Medical record for ${getPatientName(recordToDelete.patientId)} related to "${recordToDelete.condition}" has been deleted.`,
      type: 'warning',
      noButtons: true
    });
    
    // Remove from the array
    medicalRecords.value = medicalRecords.value.filter(r => r.id !== id);
    
    // Save to localStorage
    localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords.value));
    
    // Show success message
    alert('Medical record deleted successfully!');
  }
};

// Cancel adding/editing a record
const cancelAdd = () => {
  showAddRecordModal.value = false;
  isEditing.value = false;
  currentRecordId.value = null;
};
</script>

<template>
  <v-container fluid>
    <v-card class="mb-4">
      <v-card-title>Medical Records</v-card-title>
    </v-card>

    <v-row>
      <!-- Patient selection sidebar -->
      <v-col cols="12" md="4" class="mb-4">
        <v-card>
          <v-card-title>Patients</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="searchQuery"
              label="Search patients..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-card-text>
          <v-card-text v-if="isLoading" class="text-center">
            <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
          </v-card-text>
          <v-card-text v-else-if="filteredPatients.length === 0">
            No patients found.
          </v-card-text>
          <v-list v-else>
            <v-list-item
              v-for="patient in filteredPatients"
              :key="patient.id"
              :active="selectedPatient && selectedPatient.id === patient.id"
              @click="selectPatient(patient)"
            >
              <v-list-item-title class="font-weight-bold">
                {{ patient.firstName }} {{ patient.lastName }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <span v-if="patient.dob">Date of Birth: {{ formatDate(patient.dob) }}</span>
                <span v-if="patient.gender">, {{ patient.gender }}</span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Medical records display -->
      <v-col cols="12" md="8">
        <v-alert v-if="!selectedPatient" type="info">
          Please select a patient to view their medical records.
        </v-alert>

        <div v-else>
          <v-card class="mb-4">
            <v-card-title>
              {{ selectedPatient.firstName }} {{ selectedPatient.lastName }}'s Medical Records
              <v-spacer></v-spacer>
              <v-btn @click="addMedicalRecord" color="success" size="small" class="me-2">
                <v-icon>mdi-plus-circle</v-icon>
                Add Record
              </v-btn>
              <v-btn @click="viewPatient(selectedPatient.id)" variant="outlined" color="primary" size="small">
                <v-icon>mdi-account</v-icon>
                View Patient
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-alert v-if="patientRecords.length === 0" type="info">
                No medical records found for this patient.
              </v-alert>
              <div v-else>
                <v-card
                  v-for="record in patientRecords"
                  :key="record.id"
                  class="mb-4"
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
                    <div class="d-flex justify-space-between align-center">
                      <div class="text-caption pa-1 rounded" style="background-color: #fffacd;">
                        <strong>Physician Notes:</strong> {{ record.physicianName }}
                      </div>
                      <div>
                        <v-btn @click="editMedicalRecord(record)" variant="outlined" color="primary" size="small" class="me-2">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn @click="deleteMedicalRecord(record.id)" variant="outlined" color="error" size="small">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Add Medical Record Modal -->
    <v-dialog v-model="showAddRecordModal" max-width="800px">
      <v-card>
        <v-card-title>
          {{ isEditing ? 'Edit' : 'Add' }} Medical Record for {{ selectedPatient?.firstName }} {{ selectedPatient?.lastName }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveRecord">
            <v-text-field
              v-model="newRecord.recordDate"
              label="Date"
              type="date"
              :error-messages="formErrors.recordDate"
              required
            ></v-text-field>

            <v-text-field
              v-model="newRecord.recordTime"
              label="Time (Optional - current time used if blank)"
              :error-messages="formErrors.recordTime"
              placeholder="Format: 1:30 PM or 13:30"
              hint="Enter time in 12-hour format (1:30 PM) or 24-hour format (13:30). If left blank, the current time will be automatically used."
            ></v-text-field>

            <v-text-field
              v-model="newRecord.condition"
              label="Condition/Reason"
              :error-messages="formErrors.condition"
              placeholder="e.g., Hypertension, Annual Check-up, etc."
              required
            ></v-text-field>

            <v-text-field
              v-model="newRecord.diagnosis"
              label="Diagnosis"
              :error-messages="formErrors.diagnosis"
              required
            ></v-text-field>

            <v-textarea
              v-model="newRecord.treatmentPlan"
              label="Treatment Plan"
              rows="3"
            ></v-textarea>

            <v-text-field
              v-model="newRecord.physicianName"
              label="Physician Notes"
              :error-messages="formErrors.physicianName"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancelAdd" variant="outlined">Cancel</v-btn>
          <v-btn @click="saveRecord" color="primary">
            {{ isEditing ? 'Update' : 'Save' }} Record
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.patient-list {
  max-height: 500px;
  overflow-y: auto;
}

.patient-list .list-group-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.patient-list .list-group-item:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.patient-list .list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.medical-record {
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.15s ease;
  position: relative;
}

.medical-record:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.medical-record .record-actions {
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.medical-record:hover .record-actions {
  opacity: 1;
}

.medical-record:last-child hr {
  display: none;
}

/* Modal styling */
.modal {
  transition: opacity 0.2s ease;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  opacity: 1;
}

.modal-backdrop {
  z-index: 1040;
}

.medical-records {
  position: relative;
  z-index: 1;
}

/* Prevent buttons from overlapping notifications */
:root {
  --notification-z-index: 9000;
}

.card-header .btn {
  position: relative;
  z-index: 1;
}

/* Make sure notifications always appear above other elements */
body > div[class*="notification"],
[class*="notification-panel"] {
  position: relative !important;
  z-index: var(--notification-z-index) !important;
}

/* Add highlight style for physician notes */
.highlight-note {
  background-color: #fffacd; /* Light yellow background */
  padding: 2px 5px;
  border-radius: 4px;
  display: inline-block; /* Ensure padding and background apply */
}
</style> 