<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { formatDate, formatTimeTo12Hour, formatDateTime, parseDate } from '../utils/dateUtils';
import ActionButtons from '@/components/ActionButtons.vue';
import { addVisitNotification } from '../utils/notificationUtils';
import { addNotification } from '../utils/notificationUtils';

const store = useStore();
const router = useRouter();

const patients = computed(() => store.state.patients);
const isLoading = ref(true);
const searchQuery = ref('');
const visits = ref([]);
const selectedFilter = ref('all'); // 'all', 'upcoming', 'completed'
const showScheduleModal = ref(false);
const showViewModal = ref(false); // New ref for view details modal
const selectedVisit = ref(null); // New ref to store the selected visit
const newVisit = ref({
  patientId: null,
  visitDate: '',
  visitTime: '',
  purpose: '',
  notes: '',
  status: 'upcoming',
  physicianName: ''
});
const formErrors = ref({});

const headers = [
  { title: 'Patient', key: 'patient' },
  { title: 'Date & Time', key: 'dateTime' },
  { title: 'Purpose', key: 'purpose' },
  { title: 'Physician', key: 'physicianName' },
  { title: 'Status', key: 'status' },
  { title: 'Notes', key: 'notes' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Mock visit data for demonstration
const mockVisits = [
  {
    id: 1,
    patientId: 1,
    visitDate: '2023-12-15',
    purpose: 'Regular Check-up',
    notes: 'Patient reported improvement in symptoms. Continue current medication.',
    status: 'completed',
    physicianName: 'Dr. Smith'
  },
  {
    id: 2,
    patientId: 2,
    visitDate: '2023-11-28',
    purpose: 'Follow-up Consultation',
    notes: 'Blood pressure has stabilized. Adjusted medication dosage.',
    status: 'completed',
    physicianName: 'Dr. Johnson'
  },
  {
    id: 3,
    patientId: 3,
    visitDate: '2024-01-10',
    purpose: 'Vaccination',
    notes: 'Scheduled for flu vaccination.',
    status: 'upcoming',
    physicianName: 'Dr. Martinez'
  },
  {
    id: 4,
    patientId: 4,
    visitDate: '2024-01-05',
    purpose: 'Lab Results Discussion',
    notes: 'Review recent blood work results and adjust treatment plan if necessary.',
    status: 'upcoming',
    physicianName: 'Dr. Smith'
  }
];

// Function to get patient name by ID
const getPatientName = (patientId) => {
  const patient = patients.value.find(p => p.id === patientId);
  return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
};

// Function to format date to MM/DD/YYYY
const formatDateMMDDYYYY = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Function to format date with time
const formatDateWithTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes}`;
};

// Function to parse MM/DD/YYYY to YYYY-MM-DD for storing
const parseDateToISO = (dateString) => {
  return parseDate(dateString);
};

// Function to get formatted time from a visit object in 12-hour format
const getVisitTime = (visit) => {
  if (visit.timestamp) {
    const date = new Date(visit.timestamp);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    const displayHours = hours % 12 || 12; // Convert 0 to 12
    return `${displayHours}:${minutes} ${period}`;
  }
  return visit.visitTime ? formatTimeTo12Hour(visit.visitTime) : '9:00 AM'; // Default time if none set
};

// Format date and time for display in 12-hour format
const formatDateTimeDisplay = (visit) => {
  const dateStr = formatDateMMDDYYYY(visit.visitDate);
  return `${dateStr} ${getVisitTime(visit)}`;
};

onMounted(() => {
  // Load patient data if not already loaded
  if (patients.value.length === 0) {
    const savedPatients = localStorage.getItem('patientRecords');
    if (savedPatients) {
      store.commit('setPatients', JSON.parse(savedPatients));
    }
  }
  
  // Load visits from localStorage or use mock data
  const savedVisits = localStorage.getItem('medicalVisits');
  if (savedVisits) {
    visits.value = JSON.parse(savedVisits);
  } else {
    // Use mock data for demonstration
    visits.value = mockVisits;
    // Save to localStorage
    localStorage.setItem('medicalVisits', JSON.stringify(mockVisits));
  }
  
  isLoading.value = false;
});

// Filter visits based on search query and selected filter
const filteredVisits = computed(() => {
  let result = visits.value;
  
  // Apply status filter
  if (selectedFilter.value !== 'all') {
    result = result.filter(visit => visit.status === selectedFilter.value);
  }
  
  // Apply search filter if provided
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(visit => {
      const patientName = getPatientName(visit.patientId).toLowerCase();
      return patientName.includes(query) || 
             visit.purpose.toLowerCase().includes(query) || 
             visit.physicianName.toLowerCase().includes(query);
    });
  }
  
  // Sort by date (newest first for completed, soonest first for upcoming)
  return result.sort((a, b) => {
    if (a.status === 'upcoming' && b.status === 'upcoming') {
      return new Date(a.visitDate) - new Date(b.visitDate);
    } else if (a.status === 'completed' && b.status === 'completed') {
      return new Date(b.visitDate) - new Date(a.visitDate);
    } else {
      return a.status === 'upcoming' ? -1 : 1;
    }
  });
});

// Form validation
const validateForm = () => {
  const errors = {};
  
  if (!newVisit.value.patientId) {
    errors.patientId = 'Please select a patient';
  }
  
  if (!newVisit.value.visitDate) {
    errors.visitDate = 'Visit date is required';
  }
  
  // Time validation with 12-hour format support
  if (newVisit.value.visitTime) {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?[APap][Mm]$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newVisit.value.visitTime)) {
      errors.visitTime = 'Please enter a valid time in HH:MM or h:mm AM/PM format';
    }
  }
  
  if (!newVisit.value.purpose) {
    errors.purpose = 'Purpose is required';
  }
  
  if (!newVisit.value.physicianName) {
    errors.physicianName = 'Physician name is required';
  }
  
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Schedule new visit
const scheduleVisit = () => {
  showScheduleModal.value = true;
  // Reset form
  const today = new Date();
  newVisit.value = {
    patientId: null,
    visitDate: formatDateMMDDYYYY(today.toISOString().split('T')[0]), // Today's date as default
    visitTime: `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`, // Current time as default
    purpose: '',
    notes: '',
    status: 'upcoming',
    physicianName: ''
  };
  formErrors.value = {};
};

// Create new completed visit
const createCompletedVisit = () => {
  showScheduleModal.value = true;
  // Reset form and set status to completed
  const today = new Date();
  newVisit.value = {
    patientId: null,
    visitDate: formatDateMMDDYYYY(today.toISOString().split('T')[0]), // Today's date as default
    visitTime: `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`, // Current time as default
    purpose: '',
    notes: '',
    status: 'completed',
    physicianName: ''
  };
  formErrors.value = {};
};

// Save new visit or update existing visit
const saveVisit = () => {
  if (!validateForm()) {
    return;
  }
  
  // Create a copy of the visit data
  const visitData = { ...newVisit.value };
  
  // Ensure visitTime is set, use current time if not provided
  if (!visitData.visitTime) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    visitData.visitTime = `${displayHours}:${minutes} ${period}`;
  }
  
  // Convert 12-hour format to 24-hour format for storage if needed
  let timeFor24Hour = visitData.visitTime;
  if (visitData.visitTime.includes('AM') || visitData.visitTime.includes('PM')) {
    // Parse the 12-hour time
    const match = visitData.visitTime.match(/^(\d{1,2}):(\d{2})\s?([APap][Mm])$/);
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
  
  // Convert date format from MM/DD/YYYY to YYYY-MM-DD for storage
  visitData.visitDate = parseDateToISO(visitData.visitDate);
  
  // Add visit time to create a timestamp
  if (timeFor24Hour) {
    const [hours, minutes] = timeFor24Hour.split(':');
    const dateObj = new Date(visitData.visitDate);
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    visitData.timestamp = dateObj.toISOString();
  } else {
    const dateObj = new Date(visitData.visitDate);
    dateObj.setHours(9, 0); // Default to 9:00 AM if no time specified
    visitData.timestamp = dateObj.toISOString();
  }
  
  // Check if we're editing (visit has an ID) or creating new
  const isEditing = visitData.id !== undefined;
  
  if (isEditing) {
    // Update existing visit
    const index = visits.value.findIndex(v => v.id === visitData.id);
    if (index !== -1) {
      visits.value[index] = visitData;
      
      // Generate notification
      addVisitNotification(store, visitData, getPatientName, 'updated');
    }
  } else {
    // Create a new visit with generated ID
    const id = Math.max(0, ...visits.value.map(v => v.id)) + 1;
    const visit = {
      ...visitData,
      id
    };
    
    // Add to visits array
    visits.value.push(visit);
    
    // Generate notification
    addVisitNotification(store, visit, getPatientName, 'scheduled');
  }
  
  // Save to localStorage
  localStorage.setItem('medicalVisits', JSON.stringify(visits.value));
  
  // Close modal
  showScheduleModal.value = false;
  
  // Show success message
  alert(`Visit ${isEditing ? 'updated' : 'scheduled'} successfully!`);
};

// Cancel scheduling
const cancelSchedule = () => {
  showScheduleModal.value = false;
  
  // If this was opened directly from a URL, go back to previous page
  if (router.currentRoute.value.query.returnToPatient) {
    router.back();
  }
};

// View visit details
const viewVisit = (id) => {
  const visit = visits.value.find(v => v.id === id);
  if (visit) {
    // Store the visit in the selectedVisit ref
    selectedVisit.value = { ...visit };
    
    // Show the view modal
    showViewModal.value = true;
  }
};

// Close view modal
const closeViewModal = () => {
  showViewModal.value = false;
  selectedVisit.value = null;
};

// Navigate to patient page
const navigateToPatient = () => {
  if (selectedVisit.value) {
    router.push(`/patients/${selectedVisit.value.patientId}`);
    closeViewModal();
  }
};

// Edit visit
const editVisit = (id) => {
  const visit = visits.value.find(v => v.id === id);
  if (visit) {
    // Populate the form with the selected visit data
    const visitCopy = { ...visit };
    // Format the date to MM/DD/YYYY
    visitCopy.visitDate = formatDateMMDDYYYY(visitCopy.visitDate);
    
    // Extract time from timestamp if available, otherwise use default
    if (visitCopy.timestamp) {
      const dateObj = new Date(visitCopy.timestamp);
      const hours = dateObj.getHours();
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      visitCopy.visitTime = `${displayHours}:${minutes} ${period}`;
    } else if (!visitCopy.visitTime) {
      visitCopy.visitTime = '9:00 AM'; // Default time in 12-hour format
    } else if (visitCopy.visitTime && !visitCopy.visitTime.includes('AM') && !visitCopy.visitTime.includes('PM')) {
      // Convert 24-hour format to 12-hour format if needed
      visitCopy.visitTime = formatTimeTo12Hour(visitCopy.visitTime);
    }
    
    newVisit.value = visitCopy;
    showScheduleModal.value = true;
    formErrors.value = {};
  }
};

// Delete visit
const deleteVisit = (id) => {
  if (confirm('Are you sure you want to delete this visit?')) {
    const visitToDelete = visits.value.find(v => v.id === id);
    
    if (visitToDelete) {
      // Generate notification using addVisitNotification
      addVisitNotification(store, visitToDelete, getPatientName, 'deleted');
      
      // Remove the visit from the array
      visits.value = visits.value.filter(v => v.id !== id);
      
      // Save to localStorage
      localStorage.setItem('medicalVisits', JSON.stringify(visits.value));
      
      // Show success message
      alert('Visit deleted successfully!');
    }
  }
};

// Mark visit as completed
const markAsCompleted = (id) => {
  const visit = visits.value.find(v => v.id === id);
  if (visit && visit.status === 'upcoming') {
    // Update status
    visit.status = 'completed';
    
    // Save to localStorage
    localStorage.setItem('medicalVisits', JSON.stringify(visits.value));
    
    // Generate notification
    addVisitNotification(store, visit, getPatientName, 'completed');
    
    // Show success message
    alert('Visit marked as completed!');
  }
};
</script>

<template>
  <v-container fluid>
    <v-card class="mb-4">
      <v-card-title>Medical Appointments</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="createCompletedVisit" color="primary" class="me-2">
          <v-icon>mdi-plus-circle</v-icon>
          New Visit
        </v-btn>
        <v-btn @click="scheduleVisit" color="success">
          <v-icon>mdi-calendar-plus</v-icon>
          Schedule Visit
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-text>
            <v-text-field
              v-model="searchQuery"
              label="Search by patient name, purpose, or physician..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4" offset-md="2">
        <v-card>
          <v-card-text>
            <v-select
              v-model="selectedFilter"
              :items="[
                { title: 'All Visits', value: 'all' },
                { title: 'Upcoming Visits', value: 'upcoming' },
                { title: 'Completed Visits', value: 'completed' }
              ]"
              label="Filter"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-progress-circular v-if="isLoading" indeterminate color="primary" class="d-block mx-auto my-5"></v-progress-circular>

    <v-alert v-else-if="filteredVisits.length === 0" type="info">
      No medical visits match your search criteria.
    </v-alert>

    <v-data-table
      v-else
      :headers="headers"
      :items="filteredVisits"
      :items-per-page="10"
      class="elevation-1"
    >
      <template v-slot:item.patient="{ item }">
        {{ getPatientName(item.patientId) }}
      </template>
      <template v-slot:item.dateTime="{ item }">
        <div>
          <div>{{ formatDateMMDDYYYY(item.visitDate) }}</div>
          <small class="text-caption">{{ getVisitTime(item) }}</small>
        </div>
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip
          :color="item.status === 'upcoming' ? 'primary' : 'success'"
          size="small"
        >
          {{ item.status === 'upcoming' ? 'Upcoming' : 'Completed' }}
        </v-chip>
      </template>
      <template v-slot:item.notes="{ item }">
        <span class="text-truncate" style="max-width: 200px;" :title="item.notes">
          {{ item.notes }}
        </span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn-group>
          <v-btn @click="viewVisit(item.id)" variant="outlined" color="primary" size="small" title="View Details">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn @click="editVisit(item.id)" variant="outlined" color="secondary" size="small" title="Edit Visit">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn @click="deleteVisit(item.id)" variant="outlined" color="error" size="small" title="Delete Visit">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn
            v-if="item.status === 'upcoming'"
            @click="markAsCompleted(item.id)"
            variant="outlined"
            color="success"
            size="small"
            title="Mark as Completed"
          >
            <v-icon>mdi-check-circle</v-icon>
          </v-btn>
        </v-btn-group>
      </template>
    </v-data-table>

    <!-- Schedule Visit Modal -->
    <v-dialog v-model="showScheduleModal" max-width="600px">
      <v-card>
        <v-card-title>
          {{ newVisit.status === 'upcoming' ? 'Schedule New Visit' : 'Add Completed Visit' }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveVisit">
            <v-select
              v-model="newVisit.patientId"
              :items="patients.map(p => ({ title: `${p.firstName} ${p.lastName}`, value: p.id }))"
              label="Patient"
              :error-messages="formErrors.patientId"
              required
            ></v-select>

            <v-text-field
              v-model="newVisit.visitDate"
              label="Visit Date"
              placeholder="MM/DD/YYYY"
              :error-messages="formErrors.visitDate"
              required
            ></v-text-field>

            <v-text-field
              v-model="newVisit.visitTime"
              label="Visit Time (Optional - current time used if blank)"
              placeholder="Format: 1:30 PM or 13:30"
              :error-messages="formErrors.visitTime"
              hint="Enter time in 12-hour format (1:30 PM) or 24-hour format (13:30). If left blank, the current time will be automatically used."
            ></v-text-field>

            <v-text-field
              v-model="newVisit.purpose"
              label="Purpose"
              :error-messages="formErrors.purpose"
              required
            ></v-text-field>

            <v-text-field
              v-model="newVisit.physicianName"
              label="Physician"
              :error-messages="formErrors.physicianName"
              required
            ></v-text-field>

            <v-textarea
              v-model="newVisit.notes"
              label="Notes"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancelSchedule" variant="outlined">Cancel</v-btn>
          <v-btn @click="saveVisit" color="primary">
            {{ newVisit.status === 'upcoming' ? 'Schedule Visit' : 'Save Visit' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Visit Modal -->
    <v-dialog v-model="showViewModal" max-width="800px">
      <v-card>
        <v-card-title
          :class="selectedVisit && selectedVisit.status === 'upcoming' ? 'bg-primary text-white' : 'bg-success text-white'"
        >
          <v-icon class="me-2">mdi-calendar-check</v-icon>
          {{ selectedVisit ? (selectedVisit.status === 'upcoming' ? 'Upcoming Visit' : 'Completed Visit') : 'Visit Details' }}
        </v-card-title>
        <v-card-text>
          <div v-if="selectedVisit" class="visit-details">
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-card height="100%">
                  <v-card-title class="bg-light">Basic Information</v-card-title>
                  <v-card-text>
                    <div class="mb-2">
                      <strong class="text-caption">Patient:</strong>
                      <div class="text-h6">{{ getPatientName(selectedVisit.patientId) }}</div>
                    </div>
                    <div class="mb-2">
                      <strong class="text-caption">Date & Time:</strong>
                      <div>
                        {{ formatDateMMDDYYYY(selectedVisit.visitDate) }}
                        <v-chip class="ms-2" variant="outlined">{{ getVisitTime(selectedVisit) }}</v-chip>
                      </div>
                    </div>
                    <div class="mb-2">
                      <strong class="text-caption">Status:</strong>
                      <div>
                        <v-chip
                          :color="selectedVisit.status === 'upcoming' ? 'primary' : 'success'"
                          size="small"
                        >
                          {{ selectedVisit.status === 'upcoming' ? 'Upcoming' : 'Completed' }}
                        </v-chip>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card height="100%">
                  <v-card-title class="bg-light">Visit Details</v-card-title>
                  <v-card-text>
                    <div class="mb-2">
                      <strong class="text-caption">Purpose:</strong>
                      <div class="text-h6">{{ selectedVisit.purpose }}</div>
                    </div>
                    <div class="mb-2">
                      <strong class="text-caption">Physician:</strong>
                      <div>{{ selectedVisit.physicianName }}</div>
                    </div>
                    <div class="mb-2">
                      <strong class="text-caption">Created On:</strong>
                      <div>{{ selectedVisit.timestamp ? formatDateTime(selectedVisit.timestamp) : 'Not Available' }}</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-card>
              <v-card-title class="bg-light">Notes</v-card-title>
              <v-card-text>
                <p class="text-body-1 mb-0">{{ selectedVisit.notes || 'No notes available for this visit.' }}</p>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="d-flex justify-space-between w-100">
            <div>
              <v-btn
                v-if="selectedVisit && selectedVisit.status === 'upcoming'"
                @click="markAsCompleted(selectedVisit.id); closeViewModal();"
                color="success"
                class="me-2"
              >
                <v-icon>mdi-check-circle</v-icon>
                Mark as Completed
              </v-btn>
            </div>
            <div>
              <v-btn @click="closeViewModal" variant="outlined" class="me-2">Close</v-btn>
              <v-btn @click="editVisit(selectedVisit.id); closeViewModal();" variant="outlined" color="primary" class="me-2">
                <v-icon>mdi-pencil</v-icon>
                Edit
              </v-btn>
              <v-btn @click="navigateToPatient" color="primary">
                <v-icon>mdi-account</v-icon>
                View Patient
              </v-btn>
            </div>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.search-card, .filter-card {
  border: 1px solid #76a9eb;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.search-card {
  width: 100%;
  max-width: 520px;
}

.search-input {
  max-width: 100%;
}

.upcoming-visit {
  background-color: rgba(13, 110, 253, 0.05);
}

.table td {
  vertical-align: middle;
}

.badge {
  font-size: 0.8rem;
  padding: 0.35rem 0.5rem;
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

/* Visit details modal styling */
.visit-details .card {
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.visit-details .card-header {
  padding: 0.75rem 1rem;
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.visit-details .text-muted {
  color: #6c757d;
  font-size: 0.85rem;
  display: block;
  margin-bottom: 0.2rem;
}

.visit-details .fs-5 {
  font-size: 1.1rem !important;
  font-weight: 500;
}

.notes-text {
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-line;
  color: #333;
}

.modal-header.bg-primary button.btn-close,
.modal-header.bg-success button.btn-close {
  filter: invert(1) brightness(200%);
}

.medical-appointments {
  position: relative;
  z-index: 1;
}

/* Style for action buttons in this component to ensure they don't overlap notifications */
.medical-appointments .action-buttons {
  position: relative !important;
  display: inline-flex !important;
}

/* Force absolute positioning of buttons within their parent container */
.medical-appointments td .action-buttons,
.medical-appointments tr .action-buttons {
  position: static !important;
  float: right;
}
</style> 