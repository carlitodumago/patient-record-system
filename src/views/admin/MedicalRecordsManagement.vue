<template>
  <div class="container-fluid mt-3">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="mb-1">Medical Records</h1>
            <p class="text-muted">
              Manage patient medical records and health information
            </p>
          </div>
          <button class="btn btn-primary" @click="showCreateRecordModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            Add Medical Record
          </button>
        </div>

        <!-- Medical Records Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ recordStats.totalRecords }}
                  </h5>
                  <small>Total Records</small>
                </div>
                <i class="bi bi-file-earmark-medical fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ recordStats.monthlyRecords }}
                  </h5>
                  <small>This Month</small>
                </div>
                <i class="bi bi-graph-up fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ Object.keys(recordStats.diagnosisDistribution).length }}
                  </h5>
                  <small>Diagnosis Types</small>
                </div>
                <i class="bi bi-clipboard-pulse fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ Object.keys(recordStats.treatmentDistribution).length }}
                  </h5>
                  <small>Treatments</small>
                </div>
                <i class="bi bi-capsule fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-3">
                <input
                  type="text"
                  v-model="recordFilters.search"
                  @input="debounceSearch"
                  class="form-control"
                  placeholder="Search records..."
                />
              </div>
              <div class="col-md-3">
                <select
                  v-model="recordFilters.patientId"
                  @change="loadRecords"
                  class="form-select"
                >
                  <option value="">All Patients</option>
                  <option
                    v-for="patient in availablePatients"
                    :key="patient.patient_id"
                    :value="patient.patient_id"
                  >
                    {{ patient.first_name }} {{ patient.surname }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <input
                  type="date"
                  v-model="recordFilters.dateFrom"
                  @change="loadRecords"
                  class="form-control"
                  placeholder="From Date"
                />
              </div>
              <div class="col-md-3">
                <input
                  type="date"
                  v-model="recordFilters.dateTo"
                  @change="loadRecords"
                  class="form-control"
                  placeholder="To Date"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Medical Records Table -->
        <div class="card">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">Medical Records</h5>
            <div class="d-flex gap-2">
              <button
                class="btn btn-sm btn-outline-primary"
                @click="exportRecords"
                :disabled="isExporting"
              >
                <i class="bi bi-download me-2"></i>
                Export
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div v-if="isLoading" class="text-center p-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div
              v-else-if="medicalRecords.length === 0"
              class="text-center p-4"
            >
              <i class="bi bi-file-earmark-x fs-1 text-muted mb-3"></i>
              <h5 class="text-muted">No medical records found</h5>
              <p class="text-muted">
                Create your first medical record to get started
              </p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Healthcare Provider</th>
                    <th>Diagnosis</th>
                    <th>Treatment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in medicalRecords" :key="record.record_id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar-sm me-3">
                          <div
                            class="avatar-title bg-success-subtle text-success rounded-circle"
                          >
                            {{ getPatientInitials(record.patient) }}
                          </div>
                        </div>
                        <div>
                          <h6 class="mb-0">
                            {{ getPatientName(record.patient) }}
                          </h6>
                          <small class="text-muted">{{
                            record.patient?.contact_number
                          }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{{ formatDate(record.created_at) }}</div>
                      <small class="text-muted">{{
                        formatTime(record.created_at)
                      }}</small>
                    </td>
                    <td>
                      <div v-if="record.entered_by_staff">
                        <div>
                          {{ record.entered_by_staff.first_name }}
                          {{ record.entered_by_staff.surname }}
                        </div>
                        <small class="text-muted">{{
                          record.entered_by_staff.specialization
                        }}</small>
                      </div>
                      <span v-else class="text-muted">Not specified</span>
                    </td>
                    <td>
                      <div v-if="record.diagnosis">
                        <div class="fw-bold">
                          {{ record.diagnosis.description }}
                        </div>
                        <small class="text-muted">{{
                          record.diagnosis.icd_code
                        }}</small>
                      </div>
                      <span v-else class="text-muted">No diagnosis</span>
                    </td>
                    <td>
                      <div v-if="record.treatment">
                        <div class="fw-bold">{{ record.treatment.name }}</div>
                        <small class="text-muted">{{
                          record.treatment.treatment_code
                        }}</small>
                      </div>
                      <span v-else class="text-muted">No treatment</span>
                    </td>
                    <td>
                      <span class="badge bg-success">Active</span>
                    </td>
                    <td>
                      <div class="dropdown">
                        <button
                          class="btn btn-sm btn-outline-secondary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          Actions
                        </button>
                        <ul class="dropdown-menu">
                          <li>
                            <button
                              class="dropdown-item"
                              @click="viewRecord(record)"
                            >
                              <i class="bi bi-eye me-2"></i>View Details
                            </button>
                          </li>
                          <li>
                            <button
                              class="dropdown-item"
                              @click="editRecord(record)"
                            >
                              <i class="bi bi-pencil me-2"></i>Edit
                            </button>
                          </li>
                          <li>
                            <button
                              class="dropdown-item"
                              @click="printRecord(record)"
                            >
                              <i class="bi bi-printer me-2"></i>Print
                            </button>
                          </li>
                          <li><hr class="dropdown-divider" /></li>
                          <li>
                            <button
                              class="dropdown-item text-danger"
                              @click="deleteRecord(record)"
                            >
                              <i class="bi bi-trash me-2"></i>Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Medical Record Modal -->
    <div
      class="modal fade"
      :class="{ show: showCreateRecordModal }"
      :style="{ display: showCreateRecordModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Medical Record</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeCreateRecordModal"
            ></button>
          </div>
          <form @submit.prevent="createNewRecord">
            <div class="modal-body">
              <!-- Patient and Appointment Selection -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Patient *</label>
                  <select
                    v-model="newRecord.patientId"
                    class="form-select"
                    required
                  >
                    <option value="">Select Patient</option>
                    <option
                      v-for="patient in availablePatients"
                      :key="patient.patient_id"
                      :value="patient.patient_id"
                    >
                      {{ patient.first_name }} {{ patient.surname }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Healthcare Provider *</label>
                  <select
                    v-model="newRecord.staffId"
                    class="form-select"
                    required
                  >
                    <option value="">Select Provider</option>
                    <option
                      v-for="staff in availableStaff"
                      :key="staff.staff_id"
                      :value="staff.staff_id"
                    >
                      {{ staff.first_name }} {{ staff.surname }} -
                      {{ staff.specialization }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Chief Complaint -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label">Chief Complaint *</label>
                  <textarea
                    v-model="newRecord.chiefComplaint"
                    class="form-control"
                    rows="2"
                    placeholder="Patient's main reason for visit..."
                    required
                  ></textarea>
                </div>
              </div>

              <!-- Vital Signs -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label">Vital Signs</label>
                  <div class="row">
                    <div class="col-md-3">
                      <input
                        type="text"
                        v-model="newRecord.vitalSigns.bp"
                        class="form-control"
                        placeholder="Blood Pressure (e.g., 120/80)"
                      />
                    </div>
                    <div class="col-md-3">
                      <input
                        type="text"
                        v-model="newRecord.vitalSigns.hr"
                        class="form-control"
                        placeholder="Heart Rate"
                      />
                    </div>
                    <div class="col-md-3">
                      <input
                        type="text"
                        v-model="newRecord.vitalSigns.temp"
                        class="form-control"
                        placeholder="Temperature (°C)"
                      />
                    </div>
                    <div class="col-md-3">
                      <input
                        type="text"
                        v-model="newRecord.vitalSigns.rr"
                        class="form-control"
                        placeholder="Respiratory Rate"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- History and Examination -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">History of Present Illness</label>
                  <textarea
                    v-model="newRecord.historyPresentIllness"
                    class="form-control"
                    rows="3"
                    placeholder="Detailed history of current condition..."
                  ></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Physical Examination</label>
                  <textarea
                    v-model="newRecord.physicalExamination"
                    class="form-control"
                    rows="3"
                    placeholder="Physical examination findings..."
                  ></textarea>
                </div>
              </div>

              <!-- Diagnosis and Treatment -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Diagnosis</label>
                  <select v-model="newRecord.diagnosisId" class="form-select">
                    <option value="">Select Diagnosis</option>
                    <option
                      v-for="diagnosis in availableDiagnosis"
                      :key="diagnosis.diagnosis_id"
                      :value="diagnosis.diagnosis_id"
                    >
                      {{ diagnosis.description }} ({{ diagnosis.icd_code }})
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Treatment</label>
                  <select v-model="newRecord.treatmentId" class="form-select">
                    <option value="">Select Treatment</option>
                    <option
                      v-for="treatment in availableTreatments"
                      :key="treatment.treatment_id"
                      :value="treatment.treatment_id"
                    >
                      {{ treatment.name }} ({{ treatment.treatment_code }})
                    </option>
                  </select>
                </div>
              </div>

              <!-- Assessment and Plan -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Assessment</label>
                  <textarea
                    v-model="newRecord.assessment"
                    class="form-control"
                    rows="2"
                    placeholder="Clinical assessment and impression..."
                  ></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Treatment Plan</label>
                  <textarea
                    v-model="newRecord.plan"
                    class="form-control"
                    rows="2"
                    placeholder="Treatment plan and recommendations..."
                  ></textarea>
                </div>
              </div>

              <!-- Follow-up -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Follow-up Date</label>
                  <input
                    type="date"
                    v-model="newRecord.followUpDate"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Follow-up Instructions</label>
                  <textarea
                    v-model="newRecord.followUpInstructions"
                    class="form-control"
                    rows="2"
                    placeholder="Instructions for follow-up care..."
                  ></textarea>
                </div>
              </div>

              <!-- Notes -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label">Additional Notes</label>
                  <textarea
                    v-model="newRecord.notes"
                    class="form-control"
                    rows="2"
                    placeholder="Additional notes or observations..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeCreateRecordModal"
                :disabled="isCreating"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isCreating || !isRecordFormValid"
              >
                <span
                  v-if="isCreating"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                Create Medical Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Backdrop for modal -->
    <div
      v-if="showCreateRecordModal"
      class="modal-backdrop fade show"
      @click="closeCreateRecordModal"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useNotificationsStore } from "@/stores/notifications";
import {
  medicalRecordService,
  DiagnosisService,
  TreatmentService,
} from "@/services/medicalRecordService";
import PatientService from "@/services/patientService";
import StaffService from "@/services/staffService";
import jsPDF from "jspdf";
import Papa from "papaparse";

const notificationsStore = useNotificationsStore();

// Reactive data
const showCreateRecordModal = ref(false);
const isCreating = ref(false);
const isExporting = ref(false);
const medicalRecords = ref([]);
const availablePatients = ref([]);
const availableStaff = ref([]);
const availableDiagnosis = ref([]);
const availableTreatments = ref([]);
const isLoading = ref(true);

const recordFilters = ref({
  search: "",
  patientId: "",
  dateFrom: "",
  dateTo: "",
});

const recordStats = ref({
  totalRecords: 0,
  monthlyRecords: 0,
  diagnosisDistribution: {},
  treatmentDistribution: {},
});

// New record form data
const newRecord = ref({
  patientId: "",
  staffId: "",
  appointmentId: null,
  chiefComplaint: "",
  historyPresentIllness: "",
  physicalExamination: "",
  vitalSigns: {
    bp: "",
    hr: "",
    temp: "",
    rr: "",
  },
  assessment: "",
  plan: "",
  diagnosisId: "",
  treatmentId: "",
  followUpDate: "",
  followUpInstructions: "",
  notes: "",
});

// Computed properties
const isRecordFormValid = computed(() => {
  return (
    newRecord.value.patientId &&
    newRecord.value.staffId &&
    newRecord.value.chiefComplaint
  );
});

// Methods
const loadRecords = async () => {
  isLoading.value = true;
  try {
    const records = await medicalRecordService.getAllMedicalRecords(
      recordFilters.value
    );
    medicalRecords.value = records;
  } catch (error) {
    notificationsStore.addNotification({
      title: "Error Loading Records",
      message: error.message,
      type: "danger",
    });
  } finally {
    isLoading.value = false;
  }
};

const loadRecordStats = async () => {
  try {
    const stats = await medicalRecordService.getMedicalRecordsStatistics();
    recordStats.value = stats;
  } catch (error) {
    console.error("Error loading record statistics:", error);
  }
};

const loadAvailablePatients = async () => {
  try {
    const patients = await PatientService.getAllPatients();
    availablePatients.value = patients.patients || [];
  } catch (error) {
    console.error("Error loading patients:", error);
  }
};

const loadAvailableStaff = async () => {
  try {
    const staff = await StaffService.getAllStaff();
    availableStaff.value = staff.filter((s) =>
      [1, 2, 3].includes(s.user?.role_id)
    ); // Admin, Nurse, Staff
  } catch (error) {
    console.error("Error loading staff:", error);
  }
};

const loadAvailableDiagnosis = async () => {
  try {
    const diagnosis = await DiagnosisService.getAllDiagnosis();
    availableDiagnosis.value = diagnosis;
  } catch (error) {
    console.error("Error loading diagnosis:", error);
  }
};

const loadAvailableTreatments = async () => {
  try {
    const treatments = await TreatmentService.getAllTreatments();
    availableTreatments.value = treatments;
  } catch (error) {
    console.error("Error loading treatments:", error);
  }
};

const debounceSearch = debounce(() => {
  loadRecords();
}, 500);

const createNewRecord = async () => {
  if (!isRecordFormValid.value) return;

  isCreating.value = true;
  try {
    const recordData = {
      patientId: newRecord.value.patientId,
      enteredBy: newRecord.value.staffId,
      appointmentId: newRecord.value.appointmentId,
      chiefComplaint: newRecord.value.chiefComplaint,
      historyPresentIllness: newRecord.value.historyPresentIllness,
      physicalExamination: newRecord.value.physicalExamination,
      vitalSigns: newRecord.value.vitalSigns,
      assessment: newRecord.value.assessment,
      plan: newRecord.value.plan,
      diagnosisId: newRecord.value.diagnosisId || null,
      treatmentId: newRecord.value.treatmentId || null,
      followUpDate: newRecord.value.followUpDate || null,
      followUpInstructions: newRecord.value.followUpInstructions,
      notes: newRecord.value.notes,
    };

    const newRecordResult = await medicalRecordService.createMedicalRecord(
      recordData
    );

    notificationsStore.addNotification({
      title: "Medical Record Created",
      message: `New medical record created successfully`,
      type: "success",
    });

    closeCreateRecordModal();
    resetRecordForm();

    // Refresh records list and statistics
    await loadRecords();
    await loadRecordStats();
  } catch (error) {
    notificationsStore.addNotification({
      title: "Error Creating Record",
      message: error.message,
      type: "danger",
    });
  } finally {
    isCreating.value = false;
  }
};

const viewRecord = (record) => {
  // TODO: Navigate to record details page
  console.log("View record:", record);
};

const editRecord = (record) => {
  // TODO: Open edit record modal
  console.log("Edit record:", record);
};

const printRecord = (record) => {
  // TODO: Generate and print record
  console.log("Print record:", record);
};

const deleteRecord = async (record) => {
  if (
    confirm(
      "Are you sure you want to delete this medical record? This action cannot be undone."
    )
  ) {
    try {
      // TODO: Implement record deletion
      console.log("Delete record:", record);

      notificationsStore.addNotification({
        title: "Record Deleted",
        message: "Medical record has been deleted successfully",
        type: "warning",
      });

      await loadRecords();
    } catch (error) {
      notificationsStore.addNotification({
        title: "Error",
        message: "Failed to delete medical record",
        type: "danger",
      });
    }
  }
};

const exportRecords = async () => {
  isExporting.value = true;
  try {
    // TODO: Implement record export
    console.log("Export records");

    notificationsStore.addNotification({
      title: "Export Started",
      message: "Medical records export has been initiated",
      type: "info",
    });
  } catch (error) {
    notificationsStore.addNotification({
      title: "Export Error",
      message: error.message,
      type: "danger",
    });
  } finally {
    isExporting.value = false;
  }
};

const closeCreateRecordModal = () => {
  showCreateRecordModal.value = false;
  resetRecordForm();
};

const resetRecordForm = () => {
  newRecord.value = {
    patientId: "",
    staffId: "",
    appointmentId: null,
    chiefComplaint: "",
    historyPresentIllness: "",
    physicalExamination: "",
    vitalSigns: {
      bp: "",
      hr: "",
      temp: "",
      rr: "",
    },
    assessment: "",
    plan: "",
    diagnosisId: "",
    treatmentId: "",
    followUpDate: "",
    followUpInstructions: "",
    notes: "",
  };
};

// Helper functions
const getPatientInitials = (patient) => {
  return `${patient.first_name[0]}${patient.surname[0]}`.toUpperCase();
};

const getPatientName = (patient) => {
  return `${patient.first_name} ${patient.surname}`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Lifecycle
onMounted(async () => {
  await loadRecords();
  await loadRecordStats();
  await loadAvailablePatients();
  await loadAvailableStaff();
  await loadAvailableDiagnosis();
  await loadAvailableTreatments();
});
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.avatar-sm {
  width: 2.5rem;
  height: 2.5rem;
}

.avatar-title {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.dropdown-toggle::after {
  display: none;
}

.modal-content {
  border-radius: 10px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
</style>
