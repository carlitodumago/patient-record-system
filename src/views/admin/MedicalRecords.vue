<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  formatDate,
  formatTimeTo12Hour,
  formatDateTime,
} from "../../utils/dateUtils";
import { addNotification } from "../../utils/notificationUtils";

const store = useStore();
const router = useRouter();

const patients = computed(() => store.state.patients);
const isLoading = ref(true);
const searchQuery = ref("");
const selectedPatient = ref(null);
const medicalRecords = ref([]);
const showAddRecordModal = ref(false);
const newRecord = ref({
  patientId: null,
  recordDate: "",
  recordTime: "",
  condition: "",
  diagnosis: "",
  treatmentPlan: "",
  physicianName: "",
});
const formErrors = ref({});
const isEditing = ref(false);
const currentRecordId = ref(null);

// Mock medical records data for demonstration
const mockMedicalRecords = [
  {
    id: 1,
    patientId: 1,
    recordDate: "2023-10-05",
    condition: "Hypertension",
    diagnosis: "Stage 1 Hypertension",
    treatmentPlan:
      "Prescribed Lisinopril 10mg daily. Recommended lifestyle changes including low-sodium diet and regular exercise.",
    physicianName: "Dr. Smith",
  },
  {
    id: 2,
    patientId: 1,
    recordDate: "2023-09-15",
    condition: "Annual Physical",
    diagnosis: "Healthy with minor concerns about blood pressure",
    treatmentPlan:
      "Monitor blood pressure weekly. Follow up in 3 months if not improved.",
    physicianName: "Dr. Johnson",
  },
  {
    id: 3,
    patientId: 2,
    recordDate: "2023-11-12",
    condition: "Asthma",
    diagnosis: "Mild persistent asthma",
    treatmentPlan:
      "Prescribed albuterol inhaler as needed and low-dose inhaled corticosteroid daily.",
    physicianName: "Dr. Martinez",
  },
  {
    id: 4,
    patientId: 3,
    recordDate: "2023-09-28",
    condition: "Anxiety",
    diagnosis: "Generalized anxiety disorder",
    treatmentPlan:
      "Referred to cognitive behavioral therapy. Prescribed escitalopram 10mg daily.",
    physicianName: "Dr. Williams",
  },
  {
    id: 5,
    patientId: 4,
    recordDate: "2023-12-03",
    condition: "Migraine",
    diagnosis: "Chronic migraine without aura",
    treatmentPlan:
      "Prescribed sumatriptan for acute attacks and propranolol for prevention.",
    physicianName: "Dr. Brown",
  },
];

onMounted(() => {
  // Load patient data if not already loaded
  if (patients.value.length === 0) {
    const savedPatients = localStorage.getItem("patientRecords");
    if (savedPatients) {
      store.commit("setPatients", JSON.parse(savedPatients));
    }
  }

  // Load medical records from localStorage or use mock data
  const savedRecords = localStorage.getItem("medicalRecords");
  if (savedRecords) {
    medicalRecords.value = JSON.parse(savedRecords);
  } else {
    // Use mock data for demonstration
    medicalRecords.value = mockMedicalRecords;
    // Save to localStorage
    localStorage.setItem("medicalRecords", JSON.stringify(mockMedicalRecords));
  }

  isLoading.value = false;
});

// Filtered list of patients based on search query
const filteredPatients = computed(() => {
  if (!searchQuery.value) return patients.value;

  const query = searchQuery.value.toLowerCase();
  return patients.value.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(query) ||
      patient.lastName.toLowerCase().includes(query) ||
      (patient.medicalConditions &&
        patient.medicalConditions.some((condition) =>
          condition.toLowerCase().includes(query)
        ))
  );
});

// Get patient name by ID
const getPatientName = (patientId) => {
  const patient = patients.value.find((p) => p.id === patientId);
  return patient
    ? `${patient.firstName} ${patient.lastName}`
    : "Unknown Patient";
};

// Select a patient to view their records
const selectPatient = (patient) => {
  selectedPatient.value = patient;
};

// Get filtered records for the selected patient
const patientRecords = computed(() => {
  if (!selectedPatient.value) return [];

  return medicalRecords.value
    .filter((record) => record.patientId === selectedPatient.value.id)
    .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate)); // Newest first
});

// View patient details
const viewPatient = (id) => {
  router.push(`/patients/${id}`);
};

// Format date with time for display in 12-hour format
const formatDateWithTime = (record) => {
  if (!record.recordDate) return "";

  const date = new Date(record.recordDate);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  // Get time from timestamp or recordTime in 12-hour format
  let formattedTime = "";
  if (record.timestamp) {
    const timestamp = new Date(record.timestamp);
    const hours = timestamp.getHours();
    const minutes = String(timestamp.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    const displayHours = hours % 12 || 12; // Convert 0 to 12
    formattedTime = `${displayHours}:${minutes} ${period}`;
  } else if (record.recordTime) {
    formattedTime = formatTimeTo12Hour(record.recordTime);
  } else {
    formattedTime = "9:00 AM"; // Default time in 12-hour format
  }

  return `${month}/${day}/${year} ${formattedTime}`;
};

// Get just the time portion from a record in 12-hour format
const getRecordTime = (record) => {
  if (record.timestamp) {
    const date = new Date(record.timestamp);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    const displayHours = hours % 12 || 12; // Convert 0 to 12
    return `${displayHours}:${minutes} ${period}`;
  }
  return record.recordTime ? formatTimeTo12Hour(record.recordTime) : "9:00 AM"; // Default time in 12-hour format
};

// Add a new medical record
const addMedicalRecord = () => {
  if (!selectedPatient.value) {
    alert("Please select a patient first");
    return;
  }

  const now = new Date();

  showAddRecordModal.value = true;
  // Reset form
  newRecord.value = {
    patientId: selectedPatient.value.id,
    recordDate: now.toISOString().split("T")[0], // Today's date as default
    recordTime: `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`, // Current time
    condition: "",
    diagnosis: "",
    treatmentPlan: "",
    physicianName: "",
  };
  formErrors.value = {};
};

// Form validation
const validateForm = () => {
  const errors = {};

  if (!newRecord.value.recordDate) {
    errors.recordDate = "Date is required";
  }

  // Time validation with 12-hour format support
  if (newRecord.value.recordTime) {
    const timeRegex =
      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?[APap][Mm]$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newRecord.value.recordTime)) {
      errors.recordTime =
        "Please enter a valid time in HH:MM or h:mm AM/PM format";
    }
  }

  if (!newRecord.value.condition) {
    errors.condition = "Condition is required";
  }

  if (!newRecord.value.diagnosis) {
    errors.diagnosis = "Diagnosis is required";
  }

  if (!newRecord.value.physicianName) {
    errors.physicianName = "Physician name is required";
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
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    recordData.recordTime = `${displayHours}:${minutes} ${period}`;
  }

  // Convert 12-hour format to 24-hour format for storage if needed
  let timeFor24Hour = recordData.recordTime;
  if (
    recordData.recordTime.includes("AM") ||
    recordData.recordTime.includes("PM")
  ) {
    // Parse the 12-hour time
    const match = recordData.recordTime.match(
      /^(\d{1,2}):(\d{2})\s?([APap][Mm])$/
    );
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3].toUpperCase();

      // Convert to 24-hour
      if (period === "PM" && hours < 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      timeFor24Hour = `${String(hours).padStart(2, "0")}:${minutes}`;
    }
  }

  // Create a timestamp from date and time
  if (recordData.recordDate && timeFor24Hour) {
    const [hours, minutes] = timeFor24Hour.split(":");
    const dateObj = new Date(recordData.recordDate);
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    recordData.timestamp = dateObj.toISOString();
  }

  if (isEditing.value) {
    // Update existing record
    const index = medicalRecords.value.findIndex(
      (r) => r.id === currentRecordId.value
    );
    if (index !== -1) {
      medicalRecords.value[index] = {
        ...recordData,
        id: currentRecordId.value,
      };

      // Create notification for editing record
      addNotification(store, store, {
        title: "Medical Record Updated",
        message: `Medical record for ${getPatientName(
          newRecord.value.patientId
        )} has been updated.`,
        type: "info",
        noButtons: true,
      });

      // Show success message
      alert("Medical record updated successfully!");
    }
  } else {
    // Create a new record with generated ID
    const id = Math.max(0, ...medicalRecords.value.map((r) => r.id)) + 1;
    const record = {
      ...recordData,
      id,
    };

    // Add to records array
    medicalRecords.value.push(record);

    // Create notification for new record
    addNotification(store, store, {
      title: "New Medical Record",
      message: `A new medical record for ${getPatientName(
        record.patientId
      )} has been added.`,
      type: "success",
      noButtons: true,
    });

    // Show success message
    alert("Medical record added successfully!");
  }

  // Save to localStorage
  localStorage.setItem("medicalRecords", JSON.stringify(medicalRecords.value));

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
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    recordCopy.recordTime = `${displayHours}:${minutes} ${period}`;
  } else if (!recordCopy.recordTime) {
    recordCopy.recordTime = "9:00 AM"; // Default time in 12-hour format
  } else if (
    recordCopy.recordTime &&
    !recordCopy.recordTime.includes("AM") &&
    !recordCopy.recordTime.includes("PM")
  ) {
    // Convert 24-hour format to 12-hour format if needed
    recordCopy.recordTime = formatTimeTo12Hour(recordCopy.recordTime);
  }

  newRecord.value = recordCopy;
  showAddRecordModal.value = true;
  formErrors.value = {};
};

// Delete a medical record
const deleteMedicalRecord = (id) => {
  if (!confirm("Are you sure you want to delete this medical record?")) {
    return;
  }

  // Find the record to get patient details for notification
  const recordToDelete = medicalRecords.value.find((r) => r.id === id);

  if (recordToDelete) {
    // Create notification for deletion
    addNotification(store, {
      title: "Medical Record Deleted",
      message: `Medical record for ${getPatientName(
        recordToDelete.patientId
      )} related to "${recordToDelete.condition}" has been deleted.`,
      type: "warning",
      noButtons: true,
    });

    // Remove from the array
    medicalRecords.value = medicalRecords.value.filter((r) => r.id !== id);

    // Save to localStorage
    localStorage.setItem(
      "medicalRecords",
      JSON.stringify(medicalRecords.value)
    );

    // Show success message
    alert("Medical record deleted successfully!");
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
  <div class="medical-records">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Medical Records Management (Admin View)</h2>
      <div>
        <button class="btn btn-primary me-2">
          <i class="bi bi-file-earmark-excel me-1"></i> Export Records
        </button>
        <button class="btn btn-secondary">
          <i class="bi bi-gear me-1"></i> System Settings
        </button>
      </div>
    </div>

    <div class="row">
      <!-- Patient selection sidebar -->
      <div class="col-md-4 mb-4">
        <div class="card">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">Patients</h5>
            <button
              class="btn btn-sm btn-success"
              @click="router.push('/patients/new')"
            >
              <i class="bi bi-plus-circle me-1"></i> Add Patient
            </button>
          </div>
          <div class="card-body p-0">
            <div class="p-3">
              <div class="input-group mb-3">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search patients..."
                  v-model="searchQuery"
                />
              </div>
            </div>
            <div v-if="isLoading" class="text-center my-3">
              <div
                class="spinner-border text-primary spinner-border-sm"
                role="status"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="filteredPatients.length === 0" class="px-3 py-2">
              No patients found.
            </div>
            <ul v-else class="list-group list-group-flush patient-list">
              <li
                v-for="patient in filteredPatients"
                :key="patient.id"
                class="list-group-item list-group-item-action d-flex align-items-center"
                :class="{
                  active: selectedPatient && selectedPatient.id === patient.id,
                }"
                @click="selectPatient(patient)"
              >
                <div>
                  <div class="fw-bold">
                    {{ patient.firstName }} {{ patient.lastName }}
                  </div>
                  <small>
                    <span v-if="patient.dob"
                      >Date of Birth: {{ formatDate(patient.dob) }}</span
                    >
                    <span v-if="patient.gender">, {{ patient.gender }}</span>
                  </small>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Medical records display -->
      <div class="col-md-8">
        <div v-if="!selectedPatient" class="alert alert-info">
          Please select a patient to view their medical records.
        </div>

        <div v-else>
          <div class="card mb-4">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">
                {{ selectedPatient.firstName }} {{ selectedPatient.lastName }}'s
                Medical Records
              </h5>
              <div>
                <button
                  @click="addMedicalRecord"
                  class="btn btn-sm btn-success me-2"
                >
                  <i class="bi bi-plus-circle me-1"></i> Add Record
                </button>
                <button
                  @click="viewPatient(selectedPatient.id)"
                  class="btn btn-sm btn-outline-primary"
                >
                  <i class="bi bi-person me-1"></i> View Patient
                </button>
              </div>
            </div>
            <div class="card-body">
              <div v-if="patientRecords.length === 0" class="alert alert-info">
                No medical records found for this patient.
              </div>
              <div v-else>
                <div
                  v-for="record in patientRecords"
                  :key="record.id"
                  class="medical-record mb-4"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <h5 class="mb-2">{{ record.condition }}</h5>
                    <span class="text-muted small">{{
                      formatDateWithTime(record)
                    }}</span>
                  </div>
                  <div class="diagnosis mb-2">
                    <strong>Diagnosis:</strong> {{ record.diagnosis }}
                  </div>
                  <div class="treatment mb-2">
                    <strong>Treatment Plan:</strong> {{ record.treatmentPlan }}
                  </div>
                  <div
                    class="d-flex justify-content-between align-items-center mt-2"
                  >
                    <div class="physician small highlight-note">
                      <strong>Physician Notes:</strong>
                      {{ record.physicianName }}
                    </div>
                    <div class="record-actions">
                      <button
                        @click="editMedicalRecord(record)"
                        class="btn btn-sm btn-outline-primary me-2"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        @click="deleteMedicalRecord(record.id)"
                        class="btn btn-sm btn-outline-danger"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <hr class="my-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Medical Record Modal -->
    <div
      class="modal fade"
      :class="{ 'd-block show': showAddRecordModal }"
      tabindex="-1"
      role="dialog"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? "Edit" : "Add" }} Medical Record for
              {{ selectedPatient?.firstName }} {{ selectedPatient?.lastName }}
            </h5>
            <button type="button" class="btn-close" @click="cancelAdd"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveRecord">
              <div class="mb-3">
                <label class="form-label">Date</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="newRecord.recordDate"
                  :class="{ 'is-invalid': formErrors.recordDate }"
                />
                <div v-if="formErrors.recordDate" class="invalid-feedback">
                  {{ formErrors.recordDate }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label"
                  >Time
                  <small class="text-muted"
                    >(Optional - current time used if blank)</small
                  ></label
                >
                <input
                  type="text"
                  class="form-control"
                  v-model="newRecord.recordTime"
                  :class="{ 'is-invalid': formErrors.recordTime }"
                  placeholder="Format: 1:30 PM or 13:30"
                />
                <div v-if="formErrors.recordTime" class="invalid-feedback">
                  {{ formErrors.recordTime }}
                </div>
                <small class="form-text text-muted">
                  Enter time in 12-hour format (1:30 PM) or 24-hour format
                  (13:30). If left blank, the current time will be automatically
                  used.
                </small>
              </div>

              <div class="mb-3">
                <label class="form-label">Condition/Reason</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newRecord.condition"
                  :class="{ 'is-invalid': formErrors.condition }"
                  placeholder="e.g., Hypertension, Annual Check-up, etc."
                />
                <div v-if="formErrors.condition" class="invalid-feedback">
                  {{ formErrors.condition }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Diagnosis</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newRecord.diagnosis"
                  :class="{ 'is-invalid': formErrors.diagnosis }"
                />
                <div v-if="formErrors.diagnosis" class="invalid-feedback">
                  {{ formErrors.diagnosis }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Treatment Plan</label>
                <textarea
                  class="form-control"
                  v-model="newRecord.treatmentPlan"
                  rows="3"
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Physician Notes</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newRecord.physicianName"
                  :class="{ 'is-invalid': formErrors.physicianName }"
                />
                <div v-if="formErrors.physicianName" class="invalid-feedback">
                  {{ formErrors.physicianName }}
                </div>
              </div>

              <div class="d-flex justify-content-end">
                <button
                  type="button"
                  class="btn btn-secondary me-2"
                  @click="cancelAdd"
                >
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div v-if="showAddRecordModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
.medical-records {
  padding: 20px;
}

.patient-list {
  max-height: 500px;
  overflow-y: auto;
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

/* Modal styles */
.modal.show {
  display: block;
}

.notification-badge {
  margin-left: 5px;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
}

.notification-badge-collapsed {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
}
</style>
