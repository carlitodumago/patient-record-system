<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePatientStore } from '../stores/patients';
import { useNotificationStore } from '../stores/notifications';
import { useUserStore } from '../stores/user';
import { formatDate, formatTimeTo12Hour, formatDateTime, parseDate } from '../utils/dateUtils';
import ActionButtons from '@/components/ActionButtons.vue';
import { addVisitNotification } from '../utils/notificationUtils';
import { addNotification } from '../utils/notificationUtils';

const patientStore = usePatientStore();
const notificationStore = useNotificationStore();
const userStore = useUserStore();
const router = useRouter();

const patients = computed(() => patientStore.patients);
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
      patientStore.setPatients(JSON.parse(savedPatients));
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
      addVisitNotification(notificationStore, visitData, getPatientName, 'updated');
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
    addVisitNotification(notificationStore, visit, getPatientName, 'scheduled');
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
      addVisitNotification(notificationStore, visitToDelete, getPatientName, 'deleted');
      
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
    addVisitNotification(notificationStore, visit, getPatientName, 'completed');
    
    // Show success message
    alert('Visit marked as completed!');
  }
};
</script>

<template>
  <div class="medical-appointments container-fluid mt-3">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Medical Appointments</h2>
      <div>
        <button @click="createCompletedVisit" class="btn btn-primary me-2">
          <i class="bi bi-plus-circle me-2"></i> New Visit
        </button>
        <button @click="scheduleVisit" class="btn btn-success">
          <i class="bi bi-calendar-plus me-2"></i> Schedule Visit
        </button>
      </div>
    </div>
    
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card search-card">
          <div class="card-body p-2">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control search-input"
                placeholder="Search by patient name, purpose, or physician..."
                v-model="searchQuery"
              >
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 offset-md-2">
        <div class="card filter-card ms-auto">
          <div class="card-body">
            <select v-model="selectedFilter" class="form-select">
              <option value="all">All Visits</option>
              <option value="upcoming">Upcoming Visits</option>
              <option value="completed">Completed Visits</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading visit records...</p>
    </div>
    
    <div v-else-if="filteredVisits.length === 0" class="alert alert-info">
      No medical visits match your search criteria.
    </div>
    
    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>Patient</th>
            <th>Date & Time</th>
            <th>Purpose</th>
            <th>Physician</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="visit in filteredVisits" :key="visit.id" :class="{ 'upcoming-visit': visit.status === 'upcoming' }">
            <td>{{ getPatientName(visit.patientId) }}</td>
            <td>
              <div>{{ formatDateMMDDYYYY(visit.visitDate) }}</div>
              <small class="text-muted">{{ getVisitTime(visit) }}</small>
            </td>
            <td>{{ visit.purpose }}</td>
            <td>{{ visit.physicianName }}</td>
            <td>
              <span 
                :class="['badge', visit.status === 'upcoming' ? 'bg-primary' : 'bg-success']"
              >
                {{ visit.status === 'upcoming' ? 'Upcoming' : 'Completed' }}
              </span>
            </td>
            <td>
              <span class="text-truncate d-inline-block" style="max-width: 200px;" :title="visit.notes">
                {{ visit.notes }}
              </span>
            </td>
            <td>
              <div class="btn-group">
                <button @click="viewVisit(visit.id)" class="btn btn-sm btn-outline-primary" title="View Details">
                  <i class="bi bi-eye"></i>
                </button>
                <button @click="editVisit(visit.id)" class="btn btn-sm btn-outline-secondary" title="Edit Visit">
                  <i class="bi bi-pencil"></i>
                </button>
                <button @click="deleteVisit(visit.id)" class="btn btn-sm btn-outline-danger" title="Delete Visit">
                  <i class="bi bi-trash"></i>
                </button>
                <button 
                  v-if="visit.status === 'upcoming'" 
                  @click="markAsCompleted(visit.id)" 
                  class="btn btn-sm btn-outline-success"
                  title="Mark as Completed"
                >
                  <i class="bi bi-check-circle"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Schedule Visit Modal -->
    <div class="modal fade" :class="{ 'd-block show': showScheduleModal }" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ newVisit.status === 'upcoming' ? 'Schedule New Visit' : 'Add Completed Visit' }}</h5>
            <button type="button" class="btn-close" @click="cancelSchedule"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveVisit">
              <div class="mb-3">
                <label class="form-label">Patient</label>
                <select 
                  class="form-select" 
                  v-model="newVisit.patientId"
                  :class="{ 'is-invalid': formErrors.patientId }"
                >
                  <option value="">Select Patient</option>
                  <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                    {{ patient.firstName }} {{ patient.lastName }}
                  </option>
                </select>
                <div v-if="formErrors.patientId" class="invalid-feedback">
                  {{ formErrors.patientId }}
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Visit Date</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="newVisit.visitDate"
                  :class="{ 'is-invalid': formErrors.visitDate }"
                  placeholder="MM/DD/YYYY"
                >
                <div v-if="formErrors.visitDate" class="invalid-feedback">
                  {{ formErrors.visitDate }}
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Visit Time <small class="text-muted">(Optional - current time used if blank)</small></label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="newVisit.visitTime"
                  :class="{ 'is-invalid': formErrors.visitTime }"
                  placeholder="Format: 1:30 PM or 13:30"
                >
                <div v-if="formErrors.visitTime" class="invalid-feedback">
                  {{ formErrors.visitTime }}
                </div>
                <small class="form-text text-muted">
                  Enter time in 12-hour format (1:30 PM) or 24-hour format (13:30). If left blank, the current time will be automatically used.
                </small>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Purpose</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="newVisit.purpose"
                  :class="{ 'is-invalid': formErrors.purpose }"
                >
                <div v-if="formErrors.purpose" class="invalid-feedback">
                  {{ formErrors.purpose }}
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Physician</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="newVisit.physicianName"
                  :class="{ 'is-invalid': formErrors.physicianName }"
                >
                <div v-if="formErrors.physicianName" class="invalid-feedback">
                  {{ formErrors.physicianName }}
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Notes</label>
                <textarea 
                  class="form-control"
                  v-model="newVisit.notes"
                  rows="3"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancelSchedule">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveVisit">
              {{ newVisit.status === 'upcoming' ? 'Schedule Visit' : 'Save Visit' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showScheduleModal" class="modal-backdrop fade show"></div>

    <!-- View Visit Modal -->
    <div class="modal fade" :class="{ 'd-block show': showViewModal }" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header" :class="{'bg-primary text-white': selectedVisit && selectedVisit.status === 'upcoming', 'bg-success text-white': selectedVisit && selectedVisit.status === 'completed'}">
            <h5 class="modal-title">
              <i class="bi bi-calendar-check me-2"></i>
              {{ selectedVisit ? (selectedVisit.status === 'upcoming' ? 'Upcoming Visit' : 'Completed Visit') : 'Visit Details' }}
            </h5>
            <button type="button" class="btn-close" @click="closeViewModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedVisit" class="visit-details">
              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-header bg-light">
                      <h6 class="mb-0">Basic Information</h6>
                    </div>
                    <div class="card-body">
                      <div class="mb-2">
                        <strong class="text-muted">Patient:</strong>
                        <div class="fs-5">{{ getPatientName(selectedVisit.patientId) }}</div>
                      </div>
                      <div class="mb-2">
                        <strong class="text-muted">Date & Time:</strong>
                        <div>
                          {{ formatDateMMDDYYYY(selectedVisit.visitDate) }}
                          <span class="ms-2 badge bg-light text-dark">{{ getVisitTime(selectedVisit) }}</span>
                        </div>
                      </div>
                      <div class="mb-2">
                        <strong class="text-muted">Status:</strong>
                        <div>
                          <span 
                            :class="['badge', selectedVisit.status === 'upcoming' ? 'bg-primary' : 'bg-success']"
                          >
                            {{ selectedVisit.status === 'upcoming' ? 'Upcoming' : 'Completed' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-header bg-light">
                      <h6 class="mb-0">Visit Details</h6>
                    </div>
                    <div class="card-body">
                      <div class="mb-2">
                        <strong class="text-muted">Purpose:</strong>
                        <div class="fs-5">{{ selectedVisit.purpose }}</div>
                      </div>
                      <div class="mb-2">
                        <strong class="text-muted">Physician:</strong>
                        <div>{{ selectedVisit.physicianName }}</div>
                      </div>
                      <div class="mb-2">
                        <strong class="text-muted">Created On:</strong>
                        <div>{{ selectedVisit.timestamp ? formatDateTime(selectedVisit.timestamp) : 'Not Available' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card mb-0">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Notes</h6>
                </div>
                <div class="card-body">
                  <p class="notes-text mb-0">{{ selectedVisit.notes || 'No notes available for this visit.' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="d-flex justify-content-between w-100">
              <div>
                <button 
                  v-if="selectedVisit && selectedVisit.status === 'upcoming'" 
                  @click="markAsCompleted(selectedVisit.id); closeViewModal();" 
                  class="btn btn-success me-2"
                >
                  <i class="bi bi-check-circle me-1"></i> Mark as Completed
                </button>
              </div>
              <div>
                <button type="button" class="btn btn-outline-secondary me-2" @click="closeViewModal">Close</button>
                <button type="button" class="btn btn-outline-primary me-2" @click="editVisit(selectedVisit.id); closeViewModal();">
                  <i class="bi bi-pencil me-1"></i> Edit
                </button>
                <button type="button" class="btn btn-primary" @click="navigateToPatient">
                  <i class="bi bi-person me-1"></i> View Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showViewModal" class="modal-backdrop fade show"></div>
  </div>
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