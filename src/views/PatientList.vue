<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePatientStore } from '../stores/patients';
import { useNotificationStore } from '../stores/notifications';
import { useUserStore } from '../stores/user';
import ActionButtons from '@/components/ActionButtons.vue';
import { formatDate } from '../utils/dateUtils';
import { addPatientNotification } from '../utils/notificationUtils';

const patientStore = usePatientStore();
const notificationStore = useNotificationStore();
const userStore = useUserStore();
const router = useRouter();

const patients = computed(() => patientStore.patients);
const isLoading = ref(true);
const searchQuery = ref('');
const viewMode = ref('table'); // 'card' or 'table'

// Mock patient data for demonstration
const mockPatients = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    dob: '1980-05-15',
    gender: 'Male',
    phone: '555-123-4567',
    email: 'john.doe@example.com',
    address: '123 Main St, Anytown, CA',
    medicalConditions: ['Hypertension', 'Diabetes Type 2'],
    bloodType: 'A+',
    lastVisit: '2023-10-05'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    dob: '1975-08-23',
    gender: 'Female',
    phone: '555-987-6543',
    email: 'jane.smith@example.com',
    address: '456 Oak Ave, Somewhere, CA',
    medicalConditions: ['Asthma', 'Allergies'],
    bloodType: 'O-',
    lastVisit: '2023-11-12'
  },
  {
    id: 3,
    firstName: 'Michael',
    lastName: 'Johnson',
    dob: '1990-02-10',
    gender: 'Male',
    phone: '555-456-7890',
    email: 'michael.j@example.com',
    address: '789 Pine St, Nowhere, CA',
    medicalConditions: ['Anxiety', 'Insomnia'],
    bloodType: 'B+',
    lastVisit: '2023-09-28'
  },
  {
    id: 4,
    firstName: 'Sarah',
    lastName: 'Williams',
    dob: '1988-11-30',
    gender: 'Female',
    phone: '555-321-6547',
    email: 'sarah.w@example.com',
    address: '321 Elm St, Elsewhere, CA',
    medicalConditions: ['Migraines', 'Depression'],
    bloodType: 'AB+',
    lastVisit: '2023-12-03'
  }
];

// Toggle view mode
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'card' ? 'table' : 'card';
  // Save user preference
  localStorage.setItem('patientListViewMode', viewMode.value);
};

onMounted(() => {
  // Try to load patients from localStorage first
  const savedPatients = localStorage.getItem('patientRecords');
  
  // Load user preference for view mode
  const savedViewMode = localStorage.getItem('patientListViewMode');
  if (savedViewMode) {
    viewMode.value = savedViewMode;
  }
  
  if (savedPatients) {
    patientStore.setPatients(JSON.parse(savedPatients));
    isLoading.value = false;
  } else {
    // If no saved data, use mock data
    setTimeout(() => {
      patientStore.setPatients(mockPatients);
      isLoading.value = false;
      
      // Save mock data to localStorage
      localStorage.setItem('patientRecords', JSON.stringify(mockPatients));
    }, 800);
  }
});

// Watch for changes in patients and save to localStorage
watch(patients, (newPatients) => {
  localStorage.setItem('patientRecords', JSON.stringify(newPatients));
}, { deep: true });

const filteredPatients = computed(() => {
  if (!searchQuery.value) return patients.value;
  
  const query = searchQuery.value.toLowerCase();
  return patients.value.filter(patient => 
    patient.firstName.toLowerCase().includes(query) || 
    patient.lastName.toLowerCase().includes(query) ||
    patient.medicalConditions.some(condition => condition.toLowerCase().includes(query)) ||
    (patient.bloodType && patient.bloodType.toLowerCase().includes(query))
  );
});

const viewPatient = (id) => {
  router.push(`/patients/${id}`);
};

const editPatient = (id) => {
  router.push(`/patients/${id}/edit`);
};

const deletePatient = (id) => {
  if (confirm('Are you sure you want to delete this patient record?')) {
    // Get patient before deletion to use in notification
    const patientToDelete = patients.value.find(p => p.id === id);
    
    // Delete the patient
    patientStore.deletePatient(id);
    
    // Add notification for deleted patient
    if (patientToDelete) {
      addPatientNotification(store, patientToDelete, 'deleted');
    }
  }
};

const addNewPatient = () => {
  router.push('/patients/new');
};
</script>

<template>
  <div class="patient-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="animate-fade-in-left">Patient List</h2>
      <div class="d-flex gap-2 animate-fade-in-right">
        <div class="btn-group me-2" role="group" aria-label="View options">
          <button 
            @click="viewMode = 'table'" 
            class="btn" 
            :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'"
            title="Table View"
          >
            <i class="bi bi-table"></i>
          </button>
          <button 
            @click="viewMode = 'card'" 
            class="btn" 
            :class="viewMode === 'card' ? 'btn-primary' : 'btn-outline-secondary'"
            title="Card View"
          >
            <i class="bi bi-grid-3x3-gap"></i>
          </button>
        </div>
        <button @click="addNewPatient" class="btn btn-success">
          <i class="bi bi-plus-circle me-2"></i> Add New Patient
        </button>
      </div>
    </div>
    
    <div class="card mb-4 search-card animate-fade-in-down">
      <div class="card-body">
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            class="form-control search-input"
            placeholder="Search patients by name or medical condition..."
            v-model="searchQuery"
          >
        </div>
      </div>
    </div>
    
    <div v-if="isLoading" class="text-center my-5 animate-fade-in">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading patient records...</p>
    </div>
    
    <div v-else>
      <!-- Card View -->
      <div v-if="viewMode === 'card'" class="row g-3">
        <div v-if="filteredPatients.length === 0" class="col-12 text-center">
          <div class="alert alert-info animate-fade-in">
            No patients found matching your search criteria.
          </div>
        </div>
        
        <div 
          v-for="(patient, index) in filteredPatients" 
          :key="patient.id" 
          class="col-xl-3 col-lg-4 col-md-6 col-sm-12"
        >
          <div class="card patient-card h-100 animate-fade-in-up" :style="{ animationDelay: `${index * 0.05}s` }">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0 patient-name">
                {{ patient.firstName }} {{ patient.lastName }}
              </h5>
              <span class="badge bg-info">{{ patient.gender }}</span>
            </div>
            <div class="card-body">
              <div class="patient-details">
                <div class="detail-row">
                  <span class="detail-label"><i class="bi bi-calendar me-2"></i>Date of Birth: </span>
                  <span class="detail-value">{{ patient.dob }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label"><i class="bi bi-telephone me-2"></i>Phone: </span>
                  <span class="detail-value">{{ patient.phone }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label"><i class="bi bi-droplet me-2"></i>Blood Type: </span>
                  <span v-if="patient.bloodType === 'AB' || patient.bloodType === 'AB+'" class="blood-type-ab">{{ patient.bloodType }}</span>
                  <span v-else-if="patient.bloodType" class="blood-type-badge">{{ patient.bloodType }}</span>
                  <span v-else class="detail-value">Unknown</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label"><i class="bi bi-calendar-check me-2"></i>Last Visit: </span>
                  <span class="detail-value">{{ patient.lastVisit || 'None' }}</span>
                </div>
                <div class="detail-row mt-3">
                  <div class="small fw-bold mb-1"><i class="bi bi-heart-pulse me-2"></i>Medical Conditions:</div>
                  <div class="medical-conditions">
                    <span 
                      v-for="(condition, idx) in patient.medicalConditions" 
                      :key="idx" 
                      class="badge bg-light text-dark me-1 mb-1"
                    >
                      {{ condition }}
                    </span>
                    <span v-if="!patient.medicalConditions || patient.medicalConditions.length === 0" class="badge bg-light text-dark">None</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="d-flex justify-content-end gap-2">
                <button @click="viewPatient(patient.id)" class="btn btn-sm btn-primary" title="View">
                  <i class="bi bi-eye"></i>
                </button>
                <button @click="editPatient(patient.id)" class="btn btn-sm btn-secondary" title="Edit">
                  <i class="bi bi-pencil"></i>
                </button>
                <button @click="deletePatient(patient.id)" class="btn btn-sm btn-danger" title="Delete">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Table View with animation -->
      <div v-else-if="viewMode === 'table'" class="animate-fade-in">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Blood Type</th>
                <th>Contact</th>
                <th>Medical Conditions</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in filteredPatients" :key="patient.id">
                <td>{{ patient.id }}</td>
                <td>{{ patient.firstName }} {{ patient.lastName }}</td>
                <td>{{ formatDate(patient.dob) }}</td>
                <td>{{ patient.gender }}</td>
                <td>
                  <div v-if="patient.bloodType" class="d-flex align-items-center">
                    <span class="blood-type-text me-1">Blood Type:</span>
                    <span v-if="patient.bloodType === 'AB' || patient.bloodType === 'AB+'" class="blood-type-ab">
                      {{ patient.bloodType }}
                    </span>
                    <span v-else class="blood-type-badge">
                      {{ patient.bloodType }}
                    </span>
                  </div>
                  <span v-else class="text-muted small">Not specified</span>
                </td>
                <td>
                  <div>{{ patient.phone }}</div>
                  <div><small>{{ patient.email }}</small></div>
                </td>
                <td>
                  <span 
                    v-for="(condition, index) in patient.medicalConditions" 
                    :key="index"
                    class="badge bg-info me-1 mb-1"
                  >
                    {{ condition }}
                  </span>
                </td>
                <td>{{ formatDate(patient.lastVisit) }}</td>
                <td>
                  <ActionButtons 
                    :onView="() => viewPatient(patient.id)" 
                    :onEdit="() => editPatient(patient.id)" 
                    :onDelete="() => deletePatient(patient.id)" 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compact-card .card-body {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}

.compact-card .card-footer {
  padding: 0.4rem 0.75rem;
  background-color: transparent;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Compact card styling */
.compact-card {
  background-color: #edf1fa;
  border: 1px solid #d8e0f7;
}

.compact-card .card-header {
  background: linear-gradient(135deg, #5d9cec, #4a89dc);
  color: white;
}

.compact-card .card-footer {
  background-color: rgba(255, 255, 255, 0.5);
  border-top-color: #d8e0f7;
}

.blood-type-text {
  color: #000000;
  text-shadow: none;
  font-weight: 600;
  font-size: 0.85rem;
}

.info-label {
  color: #6b7a95;
  font-weight: 500;
}

.info-value {
  color: #404b61;
  font-weight: 600;
}

/* Badge styling */
.badge.bg-info {
  background-color: #6371f1 !important;
  padding: 0.35rem 0.7rem;
  font-weight: 500;
  margin-top: 0.3rem;
  display: inline-block;
  border-radius: 1.2rem;
  font-size: 0.85rem;
}

.blood-type-badge {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  background-color: #ff3b30 !important; /* Red color for all blood types */
  color: white;
  font-weight: 700;
  position: static;
  display: inline-block;
}

.blood-type-ab {
  background-color: #ff3b30;
  color: white;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  display: inline-block;
  font-size: 0.9rem;
}

.card-header h6 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
  font-size: 1.1rem;
  margin-bottom: 0;
  color: inherit;
}

.info-row {
  display: flex;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.info-label {
  min-width: 105px;
  font-weight: 500;
  opacity: 0.8;
}

.info-label i {
  width: 16px;
  opacity: 0.75;
  margin-right: 4px;
}

.info-value {
  flex: 1;
  font-weight: 500;
}

@media (min-width: 1200px) {
  .card-header h6 {
    max-width: 150px;
  }
}

@media (max-width: 991.98px) {
  .card-header h6 {
    max-width: 120px;
  }
  
  .blood-type-text {
    font-size: 0.8rem;
  }
}

.card-footer {
  background-color: transparent;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.4rem 0.75rem;
}

.badge {
  font-size: 0.85rem;
  font-weight: 500;
}

.blood-type-text {
  font-size: 0.85rem;
  margin-right: 0.2rem;
  font-weight: 500;
  white-space: nowrap;
  color: #000000;
}

.blood-type-badge {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  background-color: #ff3b30 !important; /* Red color for all blood types */
  color: white;
  font-weight: 700;
  position: static;
  display: inline-block;
}

.blood-type-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  z-index: 2;
}

.card-header {
  position: relative;
  padding-right: 3.5rem !important;
}

.id-badge {
  padding: 0.25rem 0.4rem;
  font-weight: 600;
  border-radius: 0.25rem;
  background-color: rgba(0, 0, 0, 0.3) !important;
}

@media (max-width: 1400px) {
  .info-label {
    min-width: 105px;
    font-size: 0.85rem;
  }
  
  .info-value {
    font-size: 0.85rem;
  }
}

@media (max-width: 1200px) {
  .info-label {
    font-size: 0.8rem;
  }
  
  .info-value {
    font-size: 0.8rem;
  }
  
  .compact-card .card-body {
    padding: 0.5rem 0.5rem;
  }
}

.search-input {
  max-width: 460px;
}
.input-group {
  width: 500px;
}
.card-body {
  width: 480px;
}

.search-card {
  max-width: 530px;
  border: 1px solid #76a9eb;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.scroll-container {
  max-height: 150px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4a89dc #edf1fa;
  padding-right: 5px;
}

.scroll-container::-webkit-scrollbar {
  width: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: #edf1fa;
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: #4a89dc;
  border-radius: 3px;
}

/* Animation enhancements */
.patient-card {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.patient-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.btn {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn:hover {
  transform: translateY(-2px);
}

.btn:active {
  transform: scale(0.95);
}

.btn-success.animate-pulse {
  animation: pulse 2s cubic-bezier(0.250, 0.460, 0.450, 0.940) infinite;
  animation-duration: 3s;
}

.search-card {
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1.000);
}

.search-card:focus-within {
  transform: scale(1.01);
  box-shadow: 0 4px 15px rgba(67, 97, 238, 0.2);
}
</style>