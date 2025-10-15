<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

// Store
const store = useStore();

// Reactive data
const loading = ref(false);
const search = ref("");
const showViewModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedRecord = ref(null);
const filterStatus = ref("all");
const filterType = ref("all");

const medicalRecords = ref([
  {
    id: 1,
    appointmentId: 1,
    patientId: 1,
    patientName: "John Doe",
    enteredBy: 1,
    staffName: "Dr. Sarah Johnson",
    diagnosisId: 1,
    diagnosis: "Hypertension",
    treatmentId: 1,
    treatment: "Lisinopril 10mg daily",
    notes:
      "Patient advised to monitor blood pressure regularly and maintain low-sodium diet.",
    vitalSigns: {
      bloodPressure: "140/90",
      heartRate: "72 bpm",
      temperature: "36.8°C",
      weight: "70 kg",
      height: "175 cm",
    },
    createdAt: "2024-10-10T10:30:00",
    updatedAt: "2024-10-10T10:30:00",
    status: "Final",
  },
  {
    id: 2,
    appointmentId: 2,
    patientId: 2,
    patientName: "Maria Santos",
    enteredBy: 2,
    staffName: "Dr. Sarah Johnson",
    diagnosisId: 2,
    diagnosis: "Diabetes Type 2",
    treatmentId: 2,
    treatment: "Metformin 500mg twice daily",
    notes:
      "Blood sugar levels are well controlled. Continue current medication and diet plan.",
    vitalSigns: {
      bloodPressure: "120/80",
      heartRate: "68 bpm",
      temperature: "36.5°C",
      weight: "65 kg",
      height: "160 cm",
    },
    createdAt: "2024-10-14T14:00:00",
    updatedAt: "2024-10-14T14:00:00",
    status: "Final",
  },
  {
    id: 3,
    appointmentId: 3,
    patientId: 3,
    patientName: "Pedro Cruz",
    enteredBy: 3,
    staffName: "Maria Santos, RN",
    diagnosisId: 3,
    diagnosis: "Vaccination",
    treatmentId: 3,
    treatment: "COVID-19 Booster Vaccination",
    notes:
      "Patient received Pfizer COVID-19 booster shot. No immediate adverse reactions observed.",
    vitalSigns: {
      bloodPressure: "130/85",
      heartRate: "75 bpm",
      temperature: "36.6°C",
      weight: "75 kg",
      height: "168 cm",
    },
    createdAt: "2024-09-28T09:00:00",
    updatedAt: "2024-09-28T09:00:00",
    status: "Final",
  },
]);

// Form data
const recordForm = ref({
  diagnosis: "",
  treatment: "",
  notes: "",
  vitalSigns: {
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
  },
  status: "Draft",
});

// Computed properties
const user = computed(() => store.state.user);
const filteredRecords = computed(() => {
  return medicalRecords.value.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(search.value.toLowerCase()) ||
      record.staffName.toLowerCase().includes(search.value.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(search.value.toLowerCase()) ||
      record.treatment.toLowerCase().includes(search.value.toLowerCase());

    const matchesStatus =
      filterStatus.value === "all" ||
      record.status.toLowerCase() === filterStatus.value;
    const matchesType =
      filterType.value === "all" ||
      record.diagnosis.toLowerCase().includes(filterType.value);

    return matchesSearch && matchesStatus && matchesType;
  });
});

const recentRecords = computed(() => {
  return medicalRecords.value
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
});

// Methods
const fetchMedicalRecords = async () => {
  loading.value = true;
  try {
    // Simulate API call - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Mock data is already loaded
  } catch (error) {
    console.error("Error fetching medical records:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  recordForm.value = {
    diagnosis: "",
    treatment: "",
    notes: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
    },
    status: "Draft",
  };
};

const openViewModal = (record) => {
  selectedRecord.value = record;
  showViewModal.value = true;
};

const openEditModal = (record) => {
  selectedRecord.value = record;
  recordForm.value = {
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    notes: record.notes,
    vitalSigns: { ...record.vitalSigns },
    status: record.status,
  };
  showEditModal.value = true;
};

const openDeleteModal = (record) => {
  selectedRecord.value = record;
  showDeleteModal.value = true;
};

const closeModals = () => {
  showViewModal.value = false;
  showEditModal.value = false;
  showDeleteModal.value = false;
  selectedRecord.value = null;
  resetForm();
};

const updateRecord = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = medicalRecords.value.findIndex(
      (r) => r.id === selectedRecord.value.id
    );
    if (index !== -1) {
      medicalRecords.value[index] = {
        ...medicalRecords.value[index],
        ...recordForm.value,
        updatedAt: new Date().toISOString(),
      };
    }

    closeModals();
    console.log("Record updated successfully");
  } catch (error) {
    console.error("Error updating record:", error);
  }
};

const deleteRecord = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    medicalRecords.value = medicalRecords.value.filter(
      (r) => r.id !== selectedRecord.value.id
    );
    closeModals();
    console.log("Record deleted successfully");
  } catch (error) {
    console.error("Error deleting record:", error);
  }
};

const getStatusBadgeVariant = (status) => {
  const variants = {
    Draft: "warning",
    Final: "success",
    Amended: "info",
  };
  return variants[status] || "secondary";
};

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString();
};

const exportRecord = (record) => {
  // Simulate export functionality
  const exportData = {
    patientName: record.patientName,
    date: formatDateTime(record.createdAt),
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    notes: record.notes,
    vitalSigns: record.vitalSigns,
    staffName: record.staffName,
  };

  console.log("Exporting record:", exportData);
  // In a real application, this would generate a PDF or export file
  alert("Record export functionality would be implemented here");
};

const printRecord = (record) => {
  console.log("Printing record:", record);
  // In a real application, this would open a print dialog
  alert("Print functionality would be implemented here");
};

onMounted(() => {
  fetchMedicalRecords();
});
</script>

<template>
  <div class="medical-records-management">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Medical Records</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Manage and oversee patient medical records
        </p>
      </div>
      <div class="animate-fade-in-right">
        <div class="btn-group">
          <button
            class="btn btn-outline-primary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i class="bi bi-download me-2"></i>
            Export
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="#" @click="exportAllRecords"
                ><i class="bi bi-file-earmark-spreadsheet me-2"></i>Export All
                (CSV)</a
              >
            </li>
            <li>
              <a class="dropdown-item" href="#" @click="exportAllRecords"
                ><i class="bi bi-file-earmark-pdf me-2"></i>Export All (PDF)</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-file-medical text-primary fs-2"></i>
            </div>
            <h4 class="mb-1">{{ medicalRecords.length }}</h4>
            <small class="text-muted">Total Records</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-100">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-clock text-warning fs-2"></i>
            </div>
            <h4 class="mb-1">
              {{ filteredRecords.filter((r) => r.status === "Draft").length }}
            </h4>
            <small class="text-muted">Draft Records</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-200">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-check-circle text-success fs-2"></i>
            </div>
            <h4 class="mb-1">
              {{ filteredRecords.filter((r) => r.status === "Final").length }}
            </h4>
            <small class="text-muted">Final Records</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-300">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-calendar-week text-info fs-2"></i>
            </div>
            <h4 class="mb-1">{{ recentRecords.length }}</h4>
            <small class="text-muted">Recent (7 days)</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4 animate-fade-in-up animation-delay-200">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="search-box">
              <i class="bi bi-search search-icon"></i>
              <input
                v-model="search"
                type="text"
                class="form-control"
                placeholder="Search records by patient, staff, or diagnosis..."
              />
            </div>
          </div>
          <div class="col-md-4">
            <select v-model="filterStatus" class="form-select">
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="final">Final</option>
              <option value="amended">Amended</option>
            </select>
          </div>
          <div class="col-md-4">
            <select v-model="filterType" class="form-select">
              <option value="all">All Types</option>
              <option value="hypertension">Hypertension</option>
              <option value="diabetes">Diabetes</option>
              <option value="vaccination">Vaccination</option>
              <option value="consultation">Consultation</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary animate-pulse" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading medical records...</p>
    </div>

    <!-- Records Table -->
    <div v-else class="card animate-fade-in-up animation-delay-300">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-file-medical-fill me-2"></i>
          Medical Records ({{ filteredRecords.length }})
        </h5>
        <button
          class="btn btn-sm btn-outline-primary"
          @click="fetchMedicalRecords"
          :disabled="loading"
        >
          <i
            class="bi bi-arrow-clockwise me-1"
            :class="{ 'animate-spin': loading }"
          ></i>
          Refresh
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Patient</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Status</th>
                <th>Date Created</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in filteredRecords"
                :key="record.id"
                class="animate-fade-in-up"
              >
                <td>
                  <div class="d-flex align-items-center">
                    <div class="patient-avatar me-3">
                      <i class="bi bi-person-circle"></i>
                    </div>
                    <div>
                      <div class="fw-medium">{{ record.patientName }}</div>
                      <small class="text-muted"
                        >ID: {{ record.patientId }}</small
                      >
                    </div>
                  </div>
                </td>
                <td>
                  <div class="fw-medium">{{ record.diagnosis }}</div>
                  <small
                    v-if="record.vitalSigns.bloodPressure"
                    class="text-muted"
                  >
                    BP: {{ record.vitalSigns.bloodPressure }}
                  </small>
                </td>
                <td>
                  <div>{{ record.treatment }}</div>
                  <small v-if="record.notes" class="text-muted"
                    >{{ record.notes.substring(0, 50) }}...</small
                  >
                </td>
                <td>
                  <span
                    class="badge"
                    :class="`bg-${getStatusBadgeVariant(record.status)}`"
                  >
                    {{ record.status }}
                  </span>
                </td>
                <td>{{ new Date(record.createdAt).toLocaleDateString() }}</td>
                <td class="text-center">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-info"
                      @click="openViewModal(record)"
                      title="View Record"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="openEditModal(record)"
                      title="Edit Record"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-success"
                      @click="exportRecord(record)"
                      title="Export Record"
                    >
                      <i class="bi bi-download"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="openDeleteModal(record)"
                      title="Delete Record"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredRecords.length === 0" class="text-center py-5">
          <i class="bi bi-file-medical text-muted fs-1 mb-3"></i>
          <h5 class="text-muted">No medical records found</h5>
          <p class="text-muted mb-3">
            {{
              search || filterStatus !== "all" || filterType !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No medical records have been created yet."
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Recent Records Summary -->
    <div
      v-if="recentRecords.length > 0"
      class="card mt-4 animate-fade-in-up animation-delay-400"
    >
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-clock-history me-2"></i>
          Recent Records
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div
            v-for="record in recentRecords"
            :key="record.id"
            class="col-md-12"
          >
            <div
              class="recent-record-card p-3 border rounded animate-fade-in-up"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center mb-2">
                    <div class="patient-avatar-small me-3">
                      <i class="bi bi-person-circle"></i>
                    </div>
                    <div>
                      <strong>{{ record.patientName }}</strong>
                      <span
                        class="badge ms-2"
                        :class="`bg-${getStatusBadgeVariant(record.status)}`"
                      >
                        {{ record.status }}
                      </span>
                    </div>
                  </div>
                  <p class="mb-2">
                    <strong>Diagnosis:</strong> {{ record.diagnosis }}
                  </p>
                  <p class="mb-2">
                    <strong>Treatment:</strong> {{ record.treatment }}
                  </p>
                  <small class="text-muted">
                    Created by {{ record.staffName }} on
                    {{ formatDateTime(record.createdAt) }}
                  </small>
                </div>
                <div class="text-end">
                  <button
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="openViewModal(record)"
                  >
                    <i class="bi bi-eye me-1"></i>
                    View
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="printRecord(record)"
                  >
                    <i class="bi bi-printer me-1"></i>
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Record Modal -->
    <div
      class="modal fade"
      :class="{ show: showViewModal }"
      :style="{ display: showViewModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-file-medical me-2"></i>
              Medical Record Details
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body" v-if="selectedRecord">
            <div class="row g-3">
              <div class="col-md-12">
                <div
                  class="record-header d-flex align-items-center mb-4 p-3 bg-light rounded"
                >
                  <div class="patient-avatar-large me-3">
                    <i class="bi bi-person-circle"></i>
                  </div>
                  <div>
                    <h4 class="mb-1">{{ selectedRecord.patientName }}</h4>
                    <p class="text-muted mb-1">
                      Patient ID: {{ selectedRecord.patientId }}
                    </p>
                    <p class="text-muted mb-0">
                      Record ID: {{ selectedRecord.id }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-medium">Record Information</label>
                <div class="info-group">
                  <div class="info-item">
                    <strong>Healthcare Provider:</strong>
                    {{ selectedRecord.staffName }}
                  </div>
                  <div class="info-item">
                    <strong>Created:</strong>
                    {{ formatDateTime(selectedRecord.createdAt) }}
                  </div>
                  <div class="info-item">
                    <strong>Last Updated:</strong>
                    {{ formatDateTime(selectedRecord.updatedAt) }}
                  </div>
                  <div class="info-item">
                    <strong>Status:</strong>
                    <span
                      class="badge ms-2"
                      :class="`bg-${getStatusBadgeVariant(
                        selectedRecord.status
                      )}`"
                    >
                      {{ selectedRecord.status }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-medium">Vital Signs</label>
                <div class="info-group">
                  <div class="info-item">
                    <strong>Blood Pressure:</strong>
                    {{
                      selectedRecord.vitalSigns.bloodPressure || "Not recorded"
                    }}
                  </div>
                  <div class="info-item">
                    <strong>Heart Rate:</strong>
                    {{ selectedRecord.vitalSigns.heartRate || "Not recorded" }}
                  </div>
                  <div class="info-item">
                    <strong>Temperature:</strong>
                    {{
                      selectedRecord.vitalSigns.temperature || "Not recorded"
                    }}
                  </div>
                  <div class="info-item">
                    <strong>Weight:</strong>
                    {{ selectedRecord.vitalSigns.weight || "Not recorded" }}
                  </div>
                  <div class="info-item">
                    <strong>Height:</strong>
                    {{ selectedRecord.vitalSigns.height || "Not recorded" }}
                  </div>
                </div>
              </div>

              <div class="col-md-12">
                <label class="form-label fw-medium">Medical Information</label>
                <div class="info-group">
                  <div class="info-item">
                    <strong>Diagnosis:</strong> {{ selectedRecord.diagnosis }}
                  </div>
                  <div class="info-item">
                    <strong>Treatment:</strong> {{ selectedRecord.treatment }}
                  </div>
                  <div class="info-item">
                    <strong>Notes:</strong>
                    {{ selectedRecord.notes || "No additional notes" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModals"
            >
              Close
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="openEditModal(selectedRecord)"
            >
              <i class="bi bi-pencil me-2"></i>
              Edit Record
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="exportRecord(selectedRecord)"
            >
              <i class="bi bi-download me-2"></i>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Record Modal -->
    <div
      class="modal fade"
      :class="{ show: showEditModal }"
      :style="{ display: showEditModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Edit Medical Record
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="updateRecord">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-12">
                  <label class="form-label">Diagnosis *</label>
                  <input
                    v-model="recordForm.diagnosis"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Treatment *</label>
                  <textarea
                    v-model="recordForm.treatment"
                    class="form-control"
                    rows="3"
                    required
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Notes</label>
                  <textarea
                    v-model="recordForm.notes"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>

                <div class="col-md-12">
                  <label class="form-label">Vital Signs</label>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Blood Pressure</label>
                  <input
                    v-model="recordForm.vitalSigns.bloodPressure"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 120/80"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Heart Rate (bpm)</label>
                  <input
                    v-model="recordForm.vitalSigns.heartRate"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 72"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Temperature (°C)</label>
                  <input
                    v-model="recordForm.vitalSigns.temperature"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 36.8"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Weight (kg)</label>
                  <input
                    v-model="recordForm.vitalSigns.weight"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 70"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Height (cm)</label>
                  <input
                    v-model="recordForm.vitalSigns.height"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 175"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Status</label>
                  <select v-model="recordForm.status" class="form-select">
                    <option value="Draft">Draft</option>
                    <option value="Final">Final</option>
                    <option value="Amended">Amended</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModals"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-check-lg me-2"></i>
                Update Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      :class="{ show: showDeleteModal }"
      :style="{ display: showDeleteModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Confirm Deletion
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this medical record?</p>
            <div v-if="selectedRecord" class="alert alert-warning">
              <strong>{{ selectedRecord.patientName }}</strong
              ><br />
              <small>{{ selectedRecord.diagnosis }}</small
              ><br />
              <small>{{ formatDateTime(selectedRecord.createdAt) }}</small>
            </div>
            <p class="text-muted mb-0">
              This action cannot be undone and will permanently remove the
              record.
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModals"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-danger" @click="deleteRecord">
              <i class="bi bi-trash me-2"></i>
              Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showViewModal || showEditModal || showDeleteModal"
      class="modal-backdrop fade show"
      @click="closeModals"
    ></div>
  </div>
</template>

<style scoped>
.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
}

.search-box input {
  padding-left: 40px;
}

.patient-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-gradient-start);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.patient-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-gradient-start);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.patient-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-gradient-start);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.stats-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: var(--text-color);
  background-color: rgba(0, 0, 0, 0.02);
}

.table td {
  vertical-align: middle;
  border-color: rgba(0, 0, 0, 0.05);
}

.record-header {
  background: linear-gradient(
    135deg,
    rgba(67, 97, 238, 0.1),
    rgba(63, 55, 201, 0.1)
  );
}

.info-group {
  background-color: rgba(0, 0, 0, 0.02);
  padding: 1rem;
  border-radius: 8px;
}

.info-item {
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.recent-record-card {
  background-color: var(--light-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recent-record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Animation for spinner */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }

  .btn-group {
    width: 100%;
  }

  .btn-group .btn {
    flex: 1;
  }
}
</style>
