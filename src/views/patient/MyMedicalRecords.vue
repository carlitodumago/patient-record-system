<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

// Store
const store = useStore();

// Reactive data
const loading = ref(false);
const search = ref("");
const showViewModal = ref(false);
const selectedRecord = ref(null);
const filterType = ref("all");
const filterDateRange = ref("all");

const medicalRecords = ref([
  {
    id: 1,
    patientId: 1,
    patientName: "John Doe",
    appointmentId: 1,
    date: "2024-10-10",
    type: "Consultation",
    diagnosis: "Hypertension",
    treatment: "Lisinopril 10mg daily, lifestyle modifications",
    vitalSigns: {
      bloodPressure: "140/90",
      heartRate: "72 bpm",
      temperature: "36.8°C",
      weight: "70 kg",
      height: "175 cm",
    },
    notes:
      "Patient advised to monitor blood pressure regularly and maintain low-sodium diet. Follow-up in 2 weeks.",
    assessment:
      "Blood pressure slightly elevated but stable. No acute concerns.",
    plan: "Continue current antihypertensive medication. Follow-up in 2 weeks for repeat BP check.",
    status: "Final",
    createdAt: "2024-10-10T10:30:00",
    updatedAt: "2024-10-10T10:30:00",
  },
  {
    id: 2,
    patientId: 1,
    patientName: "John Doe",
    appointmentId: 2,
    date: "2024-10-14",
    type: "Follow-up",
    diagnosis: "Diabetes Type 2",
    treatment: "Metformin 500mg twice daily, blood sugar monitoring",
    vitalSigns: {
      bloodPressure: "120/80",
      heartRate: "68 bpm",
      temperature: "36.5°C",
      weight: "69 kg",
      height: "175 cm",
    },
    notes:
      "Blood sugar levels are well controlled. Continue current medication and diet plan. Next follow-up in 3 months.",
    assessment: "Diabetes well-controlled with current management plan.",
    plan: "Continue current metformin dosage. Increase physical activity as tolerated.",
    status: "Final",
    createdAt: "2024-10-14T14:00:00",
    updatedAt: "2024-10-14T14:00:00",
  },
  {
    id: 3,
    patientId: 1,
    patientName: "John Doe",
    appointmentId: 3,
    date: "2024-09-28",
    type: "Vaccination",
    diagnosis: "COVID-19 Vaccination",
    treatment: "Pfizer COVID-19 booster vaccination administered",
    vitalSigns: {
      bloodPressure: "130/85",
      heartRate: "75 bpm",
      temperature: "36.6°C",
      weight: "71 kg",
      height: "175 cm",
    },
    notes:
      "Patient received Pfizer COVID-19 booster shot. No immediate adverse reactions observed. Advised to monitor for side effects.",
    assessment: "Vaccination administered successfully without complications.",
    plan: "Monitor for post-vaccination symptoms. Next booster as per guidelines.",
    status: "Final",
    createdAt: "2024-09-28T09:00:00",
    updatedAt: "2024-09-28T09:00:00",
  },
]);

// Computed properties
const user = computed(() => store.state.user);
const filteredRecords = computed(() => {
  return medicalRecords.value.filter((record) => {
    const matchesSearch =
      record.diagnosis.toLowerCase().includes(search.value.toLowerCase()) ||
      record.treatment.toLowerCase().includes(search.value.toLowerCase()) ||
      record.type.toLowerCase().includes(search.value.toLowerCase());

    const matchesType =
      filterType.value === "all" ||
      record.type.toLowerCase() === filterType.value;

    let matchesDate = true;
    if (filterDateRange.value !== "all") {
      const recordDate = new Date(record.date);
      const now = new Date();
      const daysDiff = Math.floor((now - recordDate) / (1000 * 60 * 60 * 24));

      switch (filterDateRange.value) {
        case "week":
          matchesDate = daysDiff <= 7;
          break;
        case "month":
          matchesDate = daysDiff <= 30;
          break;
        case "quarter":
          matchesDate = daysDiff <= 90;
          break;
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });
});

const recentRecords = computed(() => {
  return medicalRecords.value
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
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

const openViewModal = (record) => {
  selectedRecord.value = record;
  showViewModal.value = true;
};

const closeModals = () => {
  showViewModal.value = false;
  selectedRecord.value = null;
};

const downloadRecord = (record) => {
  // Simulate download functionality
  const recordData = {
    patientName: record.patientName,
    date: record.date,
    type: record.type,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    vitalSigns: record.vitalSigns,
    notes: record.notes,
    assessment: record.assessment,
    plan: record.plan,
  };

  console.log("Downloading record:", recordData);
  // In a real application, this would generate and download a PDF file
  alert("Medical record download would be implemented here");
};

const printRecord = (record) => {
  console.log("Printing record:", record);
  // In a real application, this would open a print dialog
  alert("Print functionality would be implemented here");
};

const requestRecordAccess = () => {
  console.log("Requesting record access");
  // In a real application, this would send a request for record access
  alert("Record access request would be processed");
};

const getStatusBadgeVariant = (status) => {
  const variants = {
    Draft: "warning",
    Final: "success",
    Amended: "info",
  };
  return variants[status] || "secondary";
};

const getTypeBadgeVariant = (type) => {
  const variants = {
    Consultation: "primary",
    "Follow-up": "info",
    Vaccination: "success",
    Emergency: "danger",
  };
  return variants[type] || "secondary";
};

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString();
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  fetchMedicalRecords();
});
</script>

<template>
  <div class="my-medical-records">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">My Medical Records</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          View and download your medical records and health information
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
            Export Records
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="#" @click="exportAllRecords"
                ><i class="bi bi-file-earmark-pdf me-2"></i>Export All (PDF)</a
              >
            </li>
            <li>
              <a class="dropdown-item" href="#" @click="exportAllRecords"
                ><i class="bi bi-file-earmark-excel me-2"></i>Export All
                (Excel)</a
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
            <h4 class="mb-1">{{ recentRecords.length }}</h4>
            <small class="text-muted">Recent (30 days)</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-200">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-clipboard-pulse text-info fs-2"></i>
            </div>
            <h4 class="mb-1">
              {{
                filteredRecords.filter((r) => r.type === "Consultation").length
              }}
            </h4>
            <small class="text-muted">Consultations</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-300">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-shield-check text-success fs-2"></i>
            </div>
            <h4 class="mb-1">
              {{
                filteredRecords.filter((r) => r.type === "Vaccination").length
              }}
            </h4>
            <small class="text-muted">Vaccinations</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
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
                placeholder="Search records by diagnosis, treatment, or type..."
              />
            </div>
          </div>
          <div class="col-md-4">
            <select v-model="filterType" class="form-select">
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="vaccination">Vaccination</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div class="col-md-4">
            <select v-model="filterDateRange" class="form-select">
              <option value="all">All Dates</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
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
          My Medical Records ({{ filteredRecords.length }})
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
                <th>Date</th>
                <th>Type</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
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
                  <div class="fw-medium">{{ formatDate(record.date) }}</div>
                  <small class="text-muted">{{ record.type }}</small>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="`bg-${getTypeBadgeVariant(record.type)}`"
                  >
                    {{ record.type }}
                  </span>
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
                <td class="text-center">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-info"
                      @click="openViewModal(record)"
                      title="View Details"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-success"
                      @click="downloadRecord(record)"
                      title="Download"
                    >
                      <i class="bi bi-download"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      @click="printRecord(record)"
                      title="Print"
                    >
                      <i class="bi bi-printer"></i>
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
              search || filterType !== "all" || filterDateRange !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No medical records are available yet."
            }}
          </p>
          <button class="btn btn-primary" @click="requestRecordAccess">
            <i class="bi bi-envelope me-2"></i>
            Request Record Access
          </button>
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
          Recent Medical Records
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
                    <div class="record-icon me-3">
                      <i class="bi bi-file-medical text-primary"></i>
                    </div>
                    <div>
                      <strong>{{ record.type }}</strong>
                      <span
                        class="badge ms-2"
                        :class="`bg-${getTypeBadgeVariant(record.type)}`"
                      >
                        {{ record.type }}
                      </span>
                      <span
                        class="badge ms-2"
                        :class="`bg-${getStatusBadgeVariant(record.status)}`"
                      >
                        {{ record.status }}
                      </span>
                    </div>
                  </div>
                  <h6 class="mb-2">{{ record.diagnosis }}</h6>
                  <p class="mb-2">{{ record.treatment }}</p>
                  <small class="text-muted">
                    {{ formatDate(record.date) }} • {{ record.notes }}
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
                    class="btn btn-sm btn-outline-success"
                    @click="downloadRecord(record)"
                  >
                    <i class="bi bi-download me-1"></i>
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Health Summary Card -->
    <div class="card mt-4 animate-fade-in-up animation-delay-500">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-clipboard-pulse me-2"></i>
          My Health Summary
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="health-summary-item p-3 border rounded">
              <h6 class="text-primary mb-3">
                <i class="bi bi-clipboard-pulse me-2"></i>
                Current Health Status
              </h6>
              <div
                class="health-item d-flex justify-content-between align-items-center py-2"
              >
                <span>Blood Type</span>
                <span class="badge bg-primary">O+</span>
              </div>
              <div
                class="health-item d-flex justify-content-between align-items-center py-2"
              >
                <span>Allergies</span>
                <span class="badge bg-success">None</span>
              </div>
              <div
                class="health-item d-flex justify-content-between align-items-center py-2"
              >
                <span>Current Medications</span>
                <span class="badge bg-info">2 Active</span>
              </div>
              <div
                class="health-item d-flex justify-content-between align-items-center py-2"
              >
                <span>Active Conditions</span>
                <span class="badge bg-warning">2</span>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="health-summary-item p-3 border rounded">
              <h6 class="text-primary mb-3">
                <i class="bi bi-graph-up me-2"></i>
                Health Trends
              </h6>
              <div
                class="trend-item d-flex justify-content-between align-items-center py-2"
              >
                <span>Blood Pressure</span>
                <span class="text-success">
                  <i class="bi bi-arrow-down me-1"></i>
                  Improving
                </span>
              </div>
              <div
                class="trend-item d-flex justify-content-between align-items-center py-2"
              >
                <span>Weight</span>
                <span class="text-success">
                  <i class="bi bi-arrow-down me-1"></i>
                  Stable
                </span>
              </div>
              <div
                class="trend-item d-flex justify-content-between align-items-center py-2"
              >
                <span>Blood Sugar</span>
                <span class="text-success">
                  <i class="bi bi-arrow-down me-1"></i>
                  Well Controlled
                </span>
              </div>
              <div
                class="trend-item d-flex justify-content-between align-items-center py-2"
              >
                <span>Overall Health</span>
                <span class="text-info">
                  <i class="bi bi-dash me-1"></i>
                  Good
                </span>
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
                  <div class="record-icon-large me-3">
                    <i class="bi bi-file-medical"></i>
                  </div>
                  <div>
                    <h4 class="mb-1">
                      {{ formatDate(selectedRecord.date) }} -
                      {{ selectedRecord.type }}
                    </h4>
                    <p class="text-muted mb-0">
                      Record ID: {{ selectedRecord.id }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-medium">Visit Information</label>
                <div class="info-group">
                  <div class="info-item">
                    <strong>Visit Type:</strong>
                    <span
                      class="badge ms-2"
                      :class="`bg-${getTypeBadgeVariant(selectedRecord.type)}`"
                    >
                      {{ selectedRecord.type }}
                    </span>
                  </div>
                  <div class="info-item">
                    <strong>Date:</strong> {{ formatDate(selectedRecord.date) }}
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
                    <strong>Assessment:</strong>
                    {{ selectedRecord.assessment || "No assessment recorded" }}
                  </div>
                  <div class="info-item">
                    <strong>Treatment Plan:</strong>
                    {{ selectedRecord.plan || "No plan recorded" }}
                  </div>
                </div>
              </div>

              <div class="col-md-12">
                <label class="form-label fw-medium">Consultation Notes</label>
                <div class="info-group">
                  <p class="mb-0">
                    {{ selectedRecord.notes || "No additional notes" }}
                  </p>
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
              class="btn btn-success"
              @click="downloadRecord(selectedRecord)"
            >
              <i class="bi bi-download me-2"></i>
              Download PDF
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="printRecord(selectedRecord)"
            >
              <i class="bi bi-printer me-2"></i>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showViewModal"
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

.record-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.record-icon-large {
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

.health-summary-item {
  background-color: var(--light-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.health-summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.health-item,
.trend-item {
  padding: 0.5rem 0;
}

.health-item:not(:last-child),
.trend-item:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
