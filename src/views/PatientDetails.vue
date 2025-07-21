<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { formatDate } from '../utils/dateUtils';
import { addPatientNotification } from '../utils/notificationUtils';
import { addVisitNotification } from '../utils/notificationUtils';

const store = useStore();
const router = useRouter();
const route = useRoute();

const patientId = parseInt(route.params.id);
const patient = ref(null);
const isLoading = ref(true);
const activeTab = ref('overview');
const showAddVisitModal = ref(false);

// Create a data structure for the new visit
const newVisit = ref({
  patientId: patientId,
  visitDate: '',
  purpose: '',
  physician: '',
  diagnosis: '',
  prescription: '',
  notes: '',
  status: 'upcoming'
});

const formErrors = ref({});

// Function to validate the visit form
const validateVisitForm = () => {
  const errors = {};
  
  if (!newVisit.value.visitDate) {
    errors.visitDate = 'Visit date is required';
  }
  
  if (!newVisit.value.purpose) {
    errors.purpose = 'Purpose is required';
  }
  
  if (!newVisit.value.physician) {
    errors.physician = 'Physician name is required';
  }
  
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Function to show the add visit modal
const showAddVisit = () => {
  // Get today's date in MM/DD/YYYY format
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  
  // Reset form
  newVisit.value = {
    patientId: patientId,
    visitDate: `${month}/${day}/${year}`,
    purpose: '',
    physician: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    status: 'upcoming'
  };
  formErrors.value = {};
  showAddVisitModal.value = true;
};

// Function to cancel adding a visit
const cancelAddVisit = () => {
  showAddVisitModal.value = false;
  
  // If this modal was opened from a different view or URL parameter exists
  if (route.query.fromModal) {
    router.back();
  }
};

// Function to save a new visit
const saveVisit = () => {
  if (!validateVisitForm()) {
    return;
  }
  
  // Convert the date to expected format for storage
  const visitData = {
    ...newVisit.value,
    id: Date.now(), // Generate a simple ID
  };
  
  // Get current visits from localStorage
  let visits = [];
  const savedVisits = localStorage.getItem('medicalVisits');
  if (savedVisits) {
    visits = JSON.parse(savedVisits);
  }
  
  // Add the new visit
  visits.push(visitData);
  
  // Save back to localStorage
  localStorage.setItem('medicalVisits', JSON.stringify(visits));
  
  // Add notification
  addVisitNotification(store, {
    ...visitData,
    physicianName: visitData.physician,
    visitDate: visitData.visitDate
  }, (id) => patient.value ? `${patient.value.firstName} ${patient.value.lastName}` : 'Unknown Patient', 'scheduled');
  
  // Add visit to patient's visits array if it exists
  if (patient.value.visits) {
    patient.value.visits.push({
      id: visitData.id,
      date: visitData.visitDate,
      physician: visitData.physician,
      reason: visitData.purpose,
      diagnosis: visitData.diagnosis || 'Not provided',
      prescription: visitData.prescription || 'None',
      notes: visitData.notes || 'No notes'
    });
  }
  
  // Close the modal
  showAddVisitModal.value = false;
  
  // Show a success message
  alert('Visit scheduled successfully!');
};

onMounted(() => {
  // In a real application, you would fetch the patient's data from an API
  const foundPatient = store.state.patients.find(p => p.id === patientId);
  
  if (foundPatient) {
    patient.value = {
      ...foundPatient,
      // Additional mock data for the patient detail view if properties don't exist
      allergies: foundPatient.allergies || ['Penicillin', 'Peanuts'],
      // Use the patient's actual blood type or provide a default
      bloodType: foundPatient.bloodType || 'Not specified',
      height: foundPatient.height || '175 cm',
      weight: foundPatient.weight || '70 kg',
      visits: [
        {
          id: 1,
          date: '2023-11-15',
          physician: 'Dr. Smith',
          reason: 'Regular checkup',
          diagnosis: 'Healthy',
          prescription: 'None',
          notes: 'Patient is in good health. Blood pressure normal.'
        },
        {
          id: 2,
          date: '2023-10-05',
          physician: 'Dr. Johnson',
          reason: 'Flu symptoms',
          diagnosis: 'Seasonal flu',
          prescription: 'Tamiflu 75mg',
          notes: 'Patient presented with fever, cough, and fatigue. Rest recommended.'
        }
      ]
    };
    store.commit('setCurrentPatient', patient.value);
  } else {
    router.push('/patients');
  }
  
  isLoading.value = false;
});

const goToEdit = () => {
  router.push(`/patients/${patientId}/edit`);
};

const goBack = () => {
  router.back();
};

const confirmDelete = () => {
  if (confirm(`Are you sure you want to delete ${patient.value.firstName} ${patient.value.lastName}'s record?`)) {
    addPatientNotification(store, patient.value, 'deleted');
    
    store.commit('deletePatient', patientId);
    router.push('/patients');
  }
};

const tabClass = (tab) => {
  return activeTab.value === tab ? 'active' : '';
};

const viewMedicalHistory = () => {
  router.push('/history');
};
</script>

<template>
  <div class="patient-details">
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading patient details...</p>
    </div>
    
    <div v-else-if="patient">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Patient Details</h2>
        <div>
          <button @click="goBack" class="btn btn-outline-secondary me-2">
            <i class="bi bi-arrow-left"></i> Back
          </button>
          <button @click="viewMedicalHistory" class="btn btn-info me-2 text-white">
            <i class="bi bi-clock-history me-1"></i> Medical History
          </button>
          <!-- Download Button (Placeholder) -->
          <button class="btn btn-outline-secondary me-2">
              <i class="bi bi-download me-1"></i> Download
          </button>
          <button @click="goToEdit" class="btn btn-primary me-2">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button @click="confirmDelete" class="btn btn-danger">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3 text-center">
              <!-- Placeholder for patient photo -->
              <div class="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style="width: 150px; height: 150px;">
                <span class="text-secondary" style="font-size: 4rem;">
                  <i class="bi bi-person"></i>
                </span>
              </div>
              <h4 class="mt-3">{{ patient.firstName }} {{ patient.lastName }}</h4>
              <p class="text-muted">Patient ID: {{ patient.id }}</p>
            </div>
            <div class="col-md-9">
              <div class="row">
                <div class="col-sm-6 col-md-4 mb-3">
                  <h6 class="text-muted">Date of Birth</h6>
                  <p>{{ formatDate(patient.dob) }}</p>
                </div>
                <div class="col-sm-6 col-md-4 mb-3">
                  <h6 class="text-muted">Gender</h6>
                  <p>{{ patient.gender }}</p>
                </div>
                <div class="col-sm-6 col-md-4 mb-3">
                  <h6 class="text-muted">Blood Type</h6>
                  <p v-if="patient.bloodType === 'AB' || patient.bloodType === 'AB+'">
                    <span class="blood-type-ab">{{ patient.bloodType }}</span>
                  </p>
                  <p v-else-if="patient.bloodType">
                    <span class="blood-type-badge">{{ patient.bloodType }}</span>
                  </p>
                  <p v-else>Not specified</p>
                </div>
                <div class="col-sm-6 col-md-4 mb-3">
                  <h6 class="text-muted">Phone</h6>
                  <p>{{ patient.phone }}</p>
                </div>
                <div class="col-sm-6 col-md-4 mb-3">
                  <h6 class="text-muted">Email</h6>
                  <p>{{ patient.email }}</p>
                </div>
                <div class="col-sm-6 col-md-4 mb-3">
                  <h6 class="text-muted">Last Visit</h6>
                  <p>{{ formatDate(patient.lastVisit) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a class="nav-link" :class="tabClass('overview')" @click.prevent="activeTab = 'overview'" href="#">
            Overview
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="tabClass('visits')" @click.prevent="activeTab = 'visits'" href="#">
            Medical Visits
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="tabClass('details')" @click.prevent="activeTab = 'details'" href="#">
            Additional Details
          </a>
        </li>
      </ul>
      
      <div class="tab-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-pane fade show active">
          <div class="row">
            <div class="col-md-6 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="mb-0">Medical Conditions</h5>
                </div>
                <div class="card-body">
                  <div v-if="patient.medicalConditions && patient.medicalConditions.length">
                    <span 
                      v-for="(condition, index) in patient.medicalConditions" 
                      :key="index"
                      class="badge bg-info me-2 mb-2 p-2"
                    >
                      {{ condition }}
                    </span>
                  </div>
                  <p v-else class="text-muted">No known medical conditions.</p>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="mb-0">Allergies</h5>
                </div>
                <div class="card-body">
                  <div v-if="patient.allergies && patient.allergies.length">
                    <span 
                      v-for="(allergy, index) in patient.allergies" 
                      :key="index"
                      class="badge bg-warning text-dark me-2 mb-2 p-2"
                    >
                      {{ allergy }}
                    </span>
                  </div>
                  <p v-else class="text-muted">No known allergies.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Medical Visits Tab -->
        <div v-if="activeTab === 'visits'" class="tab-pane fade show active">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Medical Visit History</h5>
              <button @click="showAddVisit" class="btn btn-sm btn-primary">
                <i class="bi bi-plus-circle"></i> Add Visit
              </button>
            </div>
            <div class="card-body p-0">
              <div class="accordion" id="visitsAccordion">
                <div v-for="visit in patient.visits" :key="visit.id" class="accordion-item">
                  <h2 class="accordion-header d-flex align-items-center">
                    <button 
                      class="accordion-button collapsed" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      :data-bs-target="`#visit${visit.id}`"
                    >
                      {{ formatDate(visit.date) }} - {{ visit.reason }} ({{ visit.physician }})
                    </button>
                    <!-- Action buttons container -->
                    <div class="ms-auto d-flex align-items-center">
                         <span class="text-muted me-2" style="font-size: 0.9em;">{{ visit.timestamp ? formatDateTime({ timestamp: visit.timestamp }) : '' }}</span>
                         <!-- Download Button -->
                        <button class="btn btn-sm btn-outline-secondary me-1" title="Download Record">
                            <i class="bi bi-download"></i>
                        </button>
                        <!-- Edit Button (Assuming it exists or will be added here) -->
                        <button class="btn btn-sm btn-outline-primary me-1" title="Edit Record">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <!-- Delete Button (Assuming it exists or will be added here) -->
                        <button class="btn btn-sm btn-outline-danger" title="Delete Record">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                  </h2>
                  <div :id="`visit${visit.id}`" class="accordion-collapse collapse">
                    <div class="accordion-body">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <h6 class="text-muted">Physician</h6>
                          <p>{{ visit.physician }}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                          <h6 class="text-muted">Date</h6>
                          <p>{{ formatDate(visit.date) }}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                          <h6 class="text-muted">Reason for Visit</h6>
                          <p>{{ visit.reason }}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                          <h6 class="text-muted">Diagnosis</h6>
                          <p>{{ visit.diagnosis }}</p>
                        </div>
                        <div class="col-md-6 mb-3">
                          <h6 class="text-muted">Prescription</h6>
                          <p>{{ visit.prescription }}</p>
                        </div>
                        <div class="col-12 mb-3">
                          <h6 class="text-muted">Notes</h6>
                          <p>{{ visit.notes }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Additional Details Tab -->
        <div v-if="activeTab === 'details'" class="tab-pane fade show active">
          <div class="row">
            <div class="col-md-6 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="mb-0">Physical Information</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-6 mb-3">
                      <h6 class="text-muted">Height</h6>
                      <p>{{ patient.height }}</p>
                    </div>
                    <div class="col-6 mb-3">
                      <h6 class="text-muted">Weight</h6>
                      <p>{{ patient.weight }}</p>
                    </div>
                    <div class="col-6 mb-3">
                      <h6 class="text-muted">Blood Type</h6>
                      <p v-if="patient.bloodType === 'AB' || patient.bloodType === 'AB+'">
                        <span class="blood-type-ab">{{ patient.bloodType }}</span>
                      </p>
                      <p v-else-if="patient.bloodType">
                        <span class="blood-type-badge">{{ patient.bloodType }}</span>
                      </p>
                      <p v-else>Not specified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mb-4">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="mb-0">Insurance Information</h5>
                </div>
                <div class="card-body">
                  <p class="text-muted">No insurance information available.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="alert alert-danger">
      Patient not found. The record may have been deleted or you don't have access.
    </div>
  </div>

  <!-- Add Visit Modal -->
  <div class="modal fade" :class="{ 'd-block show': showAddVisitModal }" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Schedule Visit for {{ patient?.firstName }} {{ patient?.lastName }}</h5>
          <button type="button" class="btn-close" @click="cancelAddVisit"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveVisit">
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
                v-model="newVisit.physician"
                :class="{ 'is-invalid': formErrors.physician }"
              >
              <div v-if="formErrors.physician" class="invalid-feedback">
                {{ formErrors.physician }}
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Diagnosis (optional)</label>
              <textarea 
                class="form-control"
                v-model="newVisit.diagnosis"
                rows="2"
              ></textarea>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Prescription (optional)</label>
              <input 
                type="text" 
                class="form-control"
                v-model="newVisit.prescription"
              >
            </div>
            
            <div class="mb-3">
              <label class="form-label">Notes (optional)</label>
              <textarea 
                class="form-control"
                v-model="newVisit.notes"
                rows="3"
              ></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancelAddVisit">Cancel</button>
          <button type="button" class="btn btn-primary" @click="saveVisit">Schedule Visit</button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Modal backdrop -->
  <div v-if="showAddVisitModal" class="modal-backdrop fade show"></div>
</template>

<style scoped>
.nav-tabs .nav-link {
  cursor: pointer;
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

.blood-type-badge {
  background-color: #ff3b30;
  color: white;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  display: inline-block;
  font-size: 0.9rem;
}

.patient-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style> 