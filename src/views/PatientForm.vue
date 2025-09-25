<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { formatDate, parseDate, standardizePatientDates } from '../utils/dateUtils';
import { addPatientNotification } from '../utils/notificationUtils';
import { patientService } from '../services/api';

const store = useStore();
const router = useRouter();
const route = useRoute();

// Determine if we're editing or adding a new patient
const isEditing = computed(() => route.params.id !== undefined);
const patientId = computed(() => isEditing.value ? parseInt(route.params.id) : null);

// Form data
const patientForm = ref({
  firstName: '',
  lastName: '',
  suffix: '',
  dob: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  medicalConditions: [],
  allergies: [],
  bloodType: 'N/A',
  height: '',
  weight: ''
});

// For medical conditions input
const newCondition = ref('');
const newAllergy = ref('');

// Form state
const isLoading = ref(true);
const isSaving = ref(false);
const formErrors = ref({});
const saveSuccess = ref(false);

onMounted(() => {
  if (isEditing.value) {
    // Get patient data if editing
    const patient = store.state.patients.find(p => p.id === patientId.value);
    
    if (patient) {
      // Clone the patient data (to avoid direct state mutation)
      patientForm.value = {
        ...patient,
        // Default values for fields that might not exist in the store
        allergies: patient.allergies || [],
        bloodType: patient.bloodType || '',
        height: patient.height || '',
        weight: patient.weight || ''
      };
      
      // For HTML date input, we need to ensure ISO format YYYY-MM-DD
      if (patient.dobIso) {
        patientForm.value.dob = patient.dobIso;
      } else if (patient.dob && patient.dob.includes('-')) {
        patientForm.value.dob = parseDate(patient.dob);
      }
    } else {
      router.push('/patients');
    }
  }
  
  isLoading.value = false;
});

const addCondition = () => {
  if (newCondition.value.trim() !== '') {
    patientForm.value.medicalConditions.push(newCondition.value.trim());
    newCondition.value = '';
  }
};

const removeCondition = (index) => {
  patientForm.value.medicalConditions.splice(index, 1);
};

const addAllergy = () => {
  if (newAllergy.value.trim() !== '') {
    patientForm.value.allergies.push(newAllergy.value.trim());
    newAllergy.value = '';
  }
};

const removeAllergy = (index) => {
  patientForm.value.allergies.splice(index, 1);
};

const validateForm = () => {
  const errors = {};
  
  if (!patientForm.value.firstName.trim()) {
    errors.firstName = 'First name is required';
  }
  
  if (!patientForm.value.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  if (!patientForm.value.dob) {
    errors.dob = 'Date of birth is required';
  } else if (!/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/.test(patientForm.value.dob)) {
    errors.dob = 'Date must be in MM-DD-YYYY format';
  }
  
  if (!patientForm.value.gender) {
    errors.gender = 'Gender is required';
  }
  
  if (!patientForm.value.phone.trim()) {
    errors.phone = 'Phone number is required';
  }
  
  if (patientForm.value.email.trim() && !/\S+@\S+\.\S+/.test(patientForm.value.email)) {
    errors.email = 'Email address is invalid';
  }
  
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const savePatient = async () => {
  if (!validateForm()) {
    return;
  }
  
  isSaving.value = true;
  
  try {
    // Get a copy of patient data with ISO date for the form
    const patientData = {
      ...patientForm.value,
      // Store the ISO format for future edits
      dobIso: patientForm.value.dob
    };
    
    // Use the standardizePatientDates utility to ensure consistent date formatting
    const formattedPatient = standardizePatientDates(patientData);
    let savedPatient;
    
    if (isEditing.value) {
      // Update existing patient via API
      savedPatient = await patientService.updatePatient(patientId.value, formattedPatient);
      // Update store only with actual database response
      store.commit('updatePatient', savedPatient);
      // Add notification only for actual update
      addPatientNotification(store, savedPatient, 'updated');
    } else {
      // Create new patient via API
      const today = new Date();
      const newPatientData = {
        ...formattedPatient,
        lastVisit: formatDate(today)
      };
      savedPatient = await patientService.createPatient(newPatientData);
      // Add to store only with actual database response (includes real ID from database)
      store.commit('addPatient', savedPatient);
      // Add notification only for actual creation
      addPatientNotification(store, savedPatient, 'added');
    }
    
    saveSuccess.value = true;
    
    // Navigate back to patient list after success
    setTimeout(() => {
      router.push('/patients');
    }, 1500);
  } catch (error) {
    console.error('Error saving patient:', error);
    // Fallback to local storage if API fails
    const patientData = {
      ...patientForm.value,
      dobIso: patientForm.value.dob
    };
    
    const formattedPatient = standardizePatientDates(patientData);
    
    if (isEditing.value) {
      store.commit('updatePatient', {
        ...formattedPatient,
        id: patientId.value
      });
      addPatientNotification(store, formattedPatient, 'updated');
    } else {
      const newId = Math.max(0, ...store.state.patients.map(p => p.id)) + 1;
      const today = new Date();
      const newPatient = {
        ...formattedPatient,
        id: newId,
        lastVisit: formatDate(today)
      };
      
      store.commit('addPatient', newPatient);
      addPatientNotification(store, newPatient, 'added');
    }
    
    saveSuccess.value = true;
    setTimeout(() => {
      router.push('/patients');
    }, 1500);
  } finally {
    isSaving.value = false;
  }
};

const cancel = () => {
  router.back();
};
</script>

<template>
  <div class="patient-form compact-form">
    <div v-if="isLoading" class="text-center my-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading patient form...</p>
    </div>
    
    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h4>{{ isEditing ? 'Edit Patient' : 'Add New Patient' }}</h4>
        <button @click="cancel" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-x-circle"></i> Cancel
        </button>
      </div>
      
      <div v-if="saveSuccess" class="alert alert-success py-2 alert-dismissible fade show" role="alert">
        Patient record {{ isEditing ? 'updated' : 'created' }} successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
      
      <form @submit.prevent="savePatient" class="card">
        <div class="card-header py-2">
          <h5 class="mb-0">Patient Information</h5>
        </div>
        
        <div class="card-body p-3">
          <div class="row g-2">
            <!-- Row 1: Name -->
            <div class="col-md-6 mb-2">
              <label for="firstName" class="form-label small mb-1">First Name *</label>
              <input
                type="text"
                id="firstName"
                v-model="patientForm.firstName"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': formErrors.firstName }"
                required
              >
              <div v-if="formErrors.firstName" class="invalid-feedback small">
                {{ formErrors.firstName }}
              </div>
            </div>
            
            <div class="col-md-4 mb-2">
              <label for="lastName" class="form-label small mb-1">Last Name *</label>
              <input
                type="text"
                id="lastName"
                v-model="patientForm.lastName"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': formErrors.lastName }"
                required
              >
              <div v-if="formErrors.lastName" class="invalid-feedback small">
                {{ formErrors.lastName }}
              </div>
            </div>
            
            <div class="col-md-2 mb-2">
              <label for="suffix" class="form-label small mb-1">Suffix</label>
              <input
                type="text"
                id="suffix"
                v-model="patientForm.suffix"
                class="form-control form-control-sm"
                placeholder="Jr., Sr."
              >
            </div>
            
            <!-- Row 2: DOB, Gender, Blood Type -->
            <div class="col-md-4 mb-2">
              <label for="dob" class="form-label small mb-1">Date of Birth *</label>
              <input
                type="text"
                id="dob"
                v-model="patientForm.dob"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': formErrors.dob }"
                placeholder="MM-DD-YYYY"
                required
              >
              <div v-if="formErrors.dob" class="invalid-feedback small">
                {{ formErrors.dob }}
              </div>
            </div>
            
            <div class="col-md-4 mb-2">
              <label for="gender" class="form-label small mb-1">Gender *</label>
              <select
                id="gender"
                v-model="patientForm.gender"
                class="form-select form-select-sm"
                :class="{ 'is-invalid': formErrors.gender }"
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              <div v-if="formErrors.gender" class="invalid-feedback small">
                {{ formErrors.gender }}
              </div>
            </div>
            
            <div class="col-md-4 mb-2">
              <label for="bloodType" class="form-label small mb-1">Blood Type</label>
              <select
                id="bloodType"
                v-model="patientForm.bloodType"
                class="form-select form-select-sm"
              >
                <option value="N/A">N/A</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <!-- Row 3: Contact info -->
            <div class="col-md-4 mb-2">
              <label for="phone" class="form-label small mb-1">Phone *</label>
              <input
                type="tel"
                id="phone"
                v-model="patientForm.phone"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': formErrors.phone }"
                required
              >
              <div v-if="formErrors.phone" class="invalid-feedback small">
                {{ formErrors.phone }}
              </div>
            </div>
            
            <div class="col-md-4 mb-2">
              <label for="email" class="form-label small mb-1">Email</label>
              <input
                type="email"
                id="email"
                v-model="patientForm.email"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': formErrors.email }"
              >
              <div v-if="formErrors.email" class="invalid-feedback small">
                {{ formErrors.email }}
              </div>
            </div>
            
            <div class="col-md-4 mb-2">
              <div class="row">
                <div class="col-6">
                  <label for="height" class="form-label small mb-1">Height</label>
                  <input
                    type="text"
                    id="height"
                    v-model="patientForm.height"
                    class="form-control form-control-sm"
                    placeholder="cm"
                  >
                </div>
                <div class="col-6">
                  <label for="weight" class="form-label small mb-1">Weight</label>
                  <input
                    type="text"
                    id="weight"
                    v-model="patientForm.weight"
                    class="form-control form-control-sm"
                    placeholder="kg"
                  >
                </div>
              </div>
            </div>
            
            <!-- Row 4: Address -->
            <div class="col-md-12 mb-2">
              <label for="address" class="form-label small mb-1">Address</label>
              <input
                type="text"
                id="address"
                v-model="patientForm.address"
                class="form-control form-control-sm"
              >
            </div>
            
            <!-- Row 5: Medical Conditions and Allergies -->
            <div class="col-md-6 mb-2">
              <label class="form-label small mb-1">Medical Conditions</label>
              <div class="input-group input-group-sm mb-1">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="newCondition"
                  placeholder="Add"
                  @keyup.enter="addCondition"
                >
                <button class="btn btn-outline-primary btn-sm" type="button" @click="addCondition">
                  +
                </button>
              </div>
              
              <div class="mt-1">
                <span 
                  v-for="(condition, index) in patientForm.medicalConditions" 
                  :key="index"
                  class="badge bg-info me-1 mb-1 p-1"
                >
                  {{ condition }}
                  <button 
                    type="button" 
                    class="btn-close btn-close-white ms-1" 
                    @click="removeCondition(index)"
                    style="font-size: 0.6em;"
                  ></button>
                </span>
              </div>
            </div>
            
            <div class="col-md-6 mb-2">
              <label class="form-label small mb-1">Allergies</label>
              <div class="input-group input-group-sm mb-1">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model="newAllergy"
                  placeholder="Add"
                  @keyup.enter="addAllergy"
                >
                <button class="btn btn-outline-warning btn-sm" type="button" @click="addAllergy">
                  +
                </button>
              </div>
              
              <div class="mt-1">
                <span 
                  v-for="(allergy, index) in patientForm.allergies" 
                  :key="index"
                  class="badge bg-warning me-1 mb-1 p-1"
                >
                  {{ allergy }}
                  <button 
                    type="button" 
                    class="btn-close ms-1" 
                    @click="removeAllergy(index)"
                    style="font-size: 0.6em;"
                  ></button>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card-footer py-2 d-flex justify-content-end gap-2">
          <button type="button" @click="cancel" class="btn btn-sm btn-outline-secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-sm btn-primary"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ isSaving ? 'Saving...' : (isEditing ? 'Update Patient' : 'Add Patient') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.compact-form .form-control-sm,
.compact-form .form-select-sm {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.compact-form .form-label.small {
  font-size: 0.8rem;
  font-weight: 500;
  color: #495057;
}

.compact-form .card-header {
  background: linear-gradient(135deg, #4cc9f0, #4895ef);
}

.compact-form .badge {
  font-size: 0.75em;
  display: inline-flex;
  align-items: center;
}

.compact-form .btn-close {
  padding: 0;
  margin: 0;
  width: auto;
  height: auto;
  background: none;
  border: none;
  opacity: 0.8;
}

.compact-form .btn-close:hover {
  opacity: 1;
}

.compact-form .input-group-sm .btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.compact-form .card-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.compact-form .invalid-feedback.small {
  font-size: 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .compact-form .col-md-6,
  .compact-form .col-md-4,
  .compact-form .col-md-2 {
    margin-bottom: 1rem;
  }
}
</style>