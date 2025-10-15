<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

// Store
const store = useStore();

// Reactive data
const loading = ref(false);
const search = ref("");
const activeTab = ref("treatments");
const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedItem = ref(null);

const treatments = ref([
  {
    id: 1,
    name: "Hypertension Management",
    description: "Standard treatment protocol for hypertension patients",
    category: "Cardiovascular",
    medications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "Ongoing",
      },
      {
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily",
        duration: "Ongoing",
      },
    ],
    instructions:
      "Monitor blood pressure regularly, maintain low-sodium diet, exercise 30 minutes daily",
    contraindications: "Pregnancy, history of angioedema",
    sideEffects: "Dry cough, dizziness, hyperkalemia",
    status: "Active",
    createdAt: "2024-01-15",
    updatedAt: "2024-10-10",
  },
  {
    id: 2,
    name: "Diabetes Type 2 Management",
    description: "Comprehensive diabetes management protocol",
    category: "Endocrine",
    medications: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "Ongoing",
      },
      {
        name: "Insulin Glargine",
        dosage: "20 units",
        frequency: "Once daily",
        duration: "As needed",
      },
    ],
    instructions:
      "Monitor blood glucose levels, follow diabetic diet, regular exercise",
    contraindications: "Renal impairment, liver disease",
    sideEffects: "Gastrointestinal upset, lactic acidosis (rare)",
    status: "Active",
    createdAt: "2024-02-20",
    updatedAt: "2024-10-14",
  },
]);

const diagnoses = ref([
  {
    id: 1,
    name: "Hypertension",
    code: "I10",
    description: "Essential hypertension - high blood pressure",
    category: "Cardiovascular",
    symptoms: "Headache, dizziness, chest pain, shortness of breath",
    riskFactors: "Family history, obesity, high salt intake, stress",
    diagnosticCriteria: "Blood pressure ≥ 140/90 mmHg on multiple readings",
    complications: "Heart disease, stroke, kidney damage",
    status: "Active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Diabetes Mellitus Type 2",
    code: "E11.9",
    description: "Type 2 diabetes mellitus without complications",
    category: "Endocrine",
    symptoms: "Increased thirst, frequent urination, fatigue, blurred vision",
    riskFactors: "Obesity, sedentary lifestyle, family history, age >45",
    diagnosticCriteria: "Fasting glucose ≥ 126 mg/dL, HbA1c ≥ 6.5%",
    complications:
      "Cardiovascular disease, neuropathy, retinopathy, nephropathy",
    status: "Active",
    createdAt: "2024-02-20",
  },
]);

// Form data
const treatmentForm = ref({
  name: "",
  description: "",
  category: "General",
  medications: [],
  instructions: "",
  contraindications: "",
  sideEffects: "",
  status: "Active",
});

const diagnosisForm = ref({
  name: "",
  code: "",
  description: "",
  category: "General",
  symptoms: "",
  riskFactors: "",
  diagnosticCriteria: "",
  complications: "",
  status: "Active",
});

// Computed properties
const user = computed(() => store.state.user);
const filteredTreatments = computed(() => {
  return treatments.value.filter(
    (treatment) =>
      treatment.name.toLowerCase().includes(search.value.toLowerCase()) ||
      treatment.category.toLowerCase().includes(search.value.toLowerCase()) ||
      treatment.description.toLowerCase().includes(search.value.toLowerCase())
  );
});

const filteredDiagnoses = computed(() => {
  return diagnoses.value.filter(
    (diagnosis) =>
      diagnosis.name.toLowerCase().includes(search.value.toLowerCase()) ||
      diagnosis.category.toLowerCase().includes(search.value.toLowerCase()) ||
      diagnosis.code.toLowerCase().includes(search.value.toLowerCase())
  );
});

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    // Simulate API call - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Mock data is already loaded
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
};

const resetTreatmentForm = () => {
  treatmentForm.value = {
    name: "",
    description: "",
    category: "General",
    medications: [],
    instructions: "",
    contraindications: "",
    sideEffects: "",
    status: "Active",
  };
};

const resetDiagnosisForm = () => {
  diagnosisForm.value = {
    name: "",
    code: "",
    description: "",
    category: "General",
    symptoms: "",
    riskFactors: "",
    diagnosticCriteria: "",
    complications: "",
    status: "Active",
  };
};

const openAddModal = (type) => {
  selectedItem.value = null;
  if (type === "treatment") {
    resetTreatmentForm();
    showAddModal.value = "treatment";
  } else {
    resetDiagnosisForm();
    showAddModal.value = "diagnosis";
  }
};

const openEditModal = (item, type) => {
  selectedItem.value = item;
  if (type === "treatment") {
    treatmentForm.value = { ...item };
    showEditModal.value = "treatment";
  } else {
    diagnosisForm.value = { ...item };
    showEditModal.value = "diagnosis";
  }
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  selectedItem.value = null;
  resetTreatmentForm();
  resetDiagnosisForm();
};

const addTreatment = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newTreatment = {
      id: Math.max(...treatments.value.map((t) => t.id)) + 1,
      ...treatmentForm.value,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    treatments.value.push(newTreatment);
    closeModals();

    console.log("Treatment added successfully");
  } catch (error) {
    console.error("Error adding treatment:", error);
  }
};

const addDiagnosis = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newDiagnosis = {
      id: Math.max(...diagnoses.value.map((d) => d.id)) + 1,
      ...diagnosisForm.value,
      createdAt: new Date().toISOString().split("T")[0],
    };

    diagnoses.value.push(newDiagnosis);
    closeModals();

    console.log("Diagnosis added successfully");
  } catch (error) {
    console.error("Error adding diagnosis:", error);
  }
};

const updateTreatment = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = treatments.value.findIndex(
      (t) => t.id === selectedItem.value.id
    );
    if (index !== -1) {
      treatments.value[index] = {
        ...treatments.value[index],
        ...treatmentForm.value,
        updatedAt: new Date().toISOString().split("T")[0],
      };
    }

    closeModals();
    console.log("Treatment updated successfully");
  } catch (error) {
    console.error("Error updating treatment:", error);
  }
};

const updateDiagnosis = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = diagnoses.value.findIndex(
      (d) => d.id === selectedItem.value.id
    );
    if (index !== -1) {
      diagnoses.value[index] = { ...diagnosisForm.value };
    }

    closeModals();
    console.log("Diagnosis updated successfully");
  } catch (error) {
    console.error("Error updating diagnosis:", error);
  }
};

const getStatusBadgeVariant = (status) => {
  return status === "Active" ? "success" : "danger";
};

const getCategoryBadgeVariant = (category) => {
  const variants = {
    Cardiovascular: "danger",
    Endocrine: "warning",
    Respiratory: "info",
    General: "secondary",
  };
  return variants[category] || "secondary";
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="treatment-diagnosis">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Treatment & Diagnosis</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Manage treatment protocols and diagnosis guidelines
        </p>
      </div>
      <div class="animate-fade-in-right">
        <div class="btn-group">
          <button
            class="btn btn-primary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i class="bi bi-plus-circle me-2"></i>
            Add New
          </button>
          <ul class="dropdown-menu">
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click="openAddModal('treatment')"
                ><i class="bi bi-capsule me-2"></i>Add Treatment</a
              >
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click="openAddModal('diagnosis')"
                ><i class="bi bi-clipboard-pulse me-2"></i>Add Diagnosis</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4 animate-fade-in-up" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'treatments' }"
          @click="activeTab = 'treatments'"
        >
          <i class="bi bi-capsule me-2"></i>Treatments
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'diagnoses' }"
          @click="activeTab = 'diagnoses'"
        >
          <i class="bi bi-clipboard-pulse me-2"></i>Diagnoses
        </button>
      </li>
    </ul>

    <!-- Search -->
    <div class="card mb-4 animate-fade-in-up animation-delay-200">
      <div class="card-body">
        <div class="search-box">
          <i class="bi bi-search search-icon"></i>
          <input
            v-model="search"
            type="text"
            class="form-control"
            placeholder="Search treatments and diagnoses..."
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary animate-pulse" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading data...</p>
    </div>

    <!-- Treatments Tab -->
    <div
      v-else-if="activeTab === 'treatments'"
      class="animate-fade-in-up animation-delay-300"
    >
      <div class="card">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">
            <i class="bi bi-capsule me-2"></i>
            Treatment Protocols ({{ filteredTreatments.length }})
          </h5>
          <button
            class="btn btn-sm btn-outline-primary"
            @click="fetchData"
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
                  <th>Treatment Name</th>
                  <th>Category</th>
                  <th>Medications</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="treatment in filteredTreatments"
                  :key="treatment.id"
                  class="animate-fade-in-up"
                >
                  <td>
                    <div class="fw-medium">{{ treatment.name }}</div>
                    <small class="text-muted">{{
                      treatment.description
                    }}</small>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="`bg-${getCategoryBadgeVariant(
                        treatment.category
                      )}`"
                    >
                      {{ treatment.category }}
                    </span>
                  </td>
                  <td>
                    <div v-if="treatment.medications.length > 0">
                      <div
                        v-for="med in treatment.medications.slice(0, 2)"
                        :key="med.name"
                        class="mb-1"
                      >
                        <small
                          ><strong>{{ med.name }}</strong> -
                          {{ med.dosage }}</small
                        >
                      </div>
                      <small
                        v-if="treatment.medications.length > 2"
                        class="text-muted"
                      >
                        +{{ treatment.medications.length - 2 }} more
                      </small>
                    </div>
                    <small v-else class="text-muted">No medications</small>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="`bg-${getStatusBadgeVariant(treatment.status)}`"
                    >
                      {{ treatment.status }}
                    </span>
                  </td>
                  <td>
                    {{ new Date(treatment.updatedAt).toLocaleDateString() }}
                  </td>
                  <td class="text-center">
                    <div class="btn-group" role="group">
                      <button
                        class="btn btn-sm btn-outline-info"
                        title="View Details"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="openEditModal(treatment, 'treatment')"
                        title="Edit"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredTreatments.length === 0" class="text-center py-5">
            <i class="bi bi-capsule text-muted fs-1 mb-3"></i>
            <h5 class="text-muted">No treatments found</h5>
            <p class="text-muted mb-3">
              Create treatment protocols to get started.
            </p>
            <button class="btn btn-primary" @click="openAddModal('treatment')">
              <i class="bi bi-plus-circle me-2"></i>
              Add First Treatment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Diagnoses Tab -->
    <div
      v-else-if="activeTab === 'diagnoses'"
      class="animate-fade-in-up animation-delay-300"
    >
      <div class="card">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">
            <i class="bi bi-clipboard-pulse me-2"></i>
            Diagnosis Guidelines ({{ filteredDiagnoses.length }})
          </h5>
          <button
            class="btn btn-sm btn-outline-primary"
            @click="fetchData"
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
                  <th>Diagnosis</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Symptoms</th>
                  <th>Status</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="diagnosis in filteredDiagnoses"
                  :key="diagnosis.id"
                  class="animate-fade-in-up"
                >
                  <td>
                    <div class="fw-medium">{{ diagnosis.name }}</div>
                    <small class="text-muted">{{
                      diagnosis.description
                    }}</small>
                  </td>
                  <td>
                    <code class="bg-light px-2 py-1 rounded">{{
                      diagnosis.code
                    }}</code>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="`bg-${getCategoryBadgeVariant(
                        diagnosis.category
                      )}`"
                    >
                      {{ diagnosis.category }}
                    </span>
                  </td>
                  <td>
                    <small>{{ diagnosis.symptoms.substring(0, 60) }}...</small>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="`bg-${getStatusBadgeVariant(diagnosis.status)}`"
                    >
                      {{ diagnosis.status }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group" role="group">
                      <button
                        class="btn btn-sm btn-outline-info"
                        title="View Details"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="openEditModal(diagnosis, 'diagnosis')"
                        title="Edit"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredDiagnoses.length === 0" class="text-center py-5">
            <i class="bi bi-clipboard-pulse text-muted fs-1 mb-3"></i>
            <h5 class="text-muted">No diagnoses found</h5>
            <p class="text-muted mb-3">
              Add diagnosis guidelines to get started.
            </p>
            <button class="btn btn-primary" @click="openAddModal('diagnosis')">
              <i class="bi bi-plus-circle me-2"></i>
              Add First Diagnosis
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Treatment Modal -->
    <div
      class="modal fade"
      :class="{ show: showAddModal === 'treatment' }"
      :style="{ display: showAddModal === 'treatment' ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Add New Treatment Protocol
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="addTreatment">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Treatment Name *</label>
                  <input
                    v-model="treatmentForm.name"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Category *</label>
                  <select
                    v-model="treatmentForm.category"
                    class="form-select"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Endocrine">Endocrine</option>
                    <option value="Respiratory">Respiratory</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Description *</label>
                  <textarea
                    v-model="treatmentForm.description"
                    class="form-control"
                    rows="2"
                    required
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Medications</label>
                  <div class="medications-section p-3 border rounded">
                    <div
                      v-for="(med, index) in treatmentForm.medications"
                      :key="index"
                      class="medication-item d-flex gap-2 mb-2"
                    >
                      <input
                        v-model="med.name"
                        type="text"
                        class="form-control"
                        placeholder="Medication name"
                      />
                      <input
                        v-model="med.dosage"
                        type="text"
                        class="form-control"
                        placeholder="Dosage"
                      />
                      <input
                        v-model="med.frequency"
                        type="text"
                        class="form-control"
                        placeholder="Frequency"
                      />
                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        @click="treatmentForm.medications.splice(index, 1)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm"
                      @click="
                        treatmentForm.medications.push({
                          name: '',
                          dosage: '',
                          frequency: '',
                          duration: '',
                        })
                      "
                    >
                      <i class="bi bi-plus me-1"></i>
                      Add Medication
                    </button>
                  </div>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Instructions</label>
                  <textarea
                    v-model="treatmentForm.instructions"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Contraindications</label>
                  <textarea
                    v-model="treatmentForm.contraindications"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Side Effects</label>
                  <textarea
                    v-model="treatmentForm.sideEffects"
                    class="form-control"
                    rows="2"
                  ></textarea>
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
                Add Treatment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Treatment Modal -->
    <div
      class="modal fade"
      :class="{ show: showEditModal === 'treatment' }"
      :style="{ display: showEditModal === 'treatment' ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Edit Treatment Protocol
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="updateTreatment">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Treatment Name *</label>
                  <input
                    v-model="treatmentForm.name"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Category *</label>
                  <select
                    v-model="treatmentForm.category"
                    class="form-select"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Endocrine">Endocrine</option>
                    <option value="Respiratory">Respiratory</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Description *</label>
                  <textarea
                    v-model="treatmentForm.description"
                    class="form-control"
                    rows="2"
                    required
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Instructions</label>
                  <textarea
                    v-model="treatmentForm.instructions"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Contraindications</label>
                  <textarea
                    v-model="treatmentForm.contraindications"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Side Effects</label>
                  <textarea
                    v-model="treatmentForm.sideEffects"
                    class="form-control"
                    rows="2"
                  ></textarea>
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
                Update Treatment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Diagnosis Modal -->
    <div
      class="modal fade"
      :class="{ show: showAddModal === 'diagnosis' }"
      :style="{ display: showAddModal === 'diagnosis' ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Add New Diagnosis
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="addDiagnosis">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Diagnosis Name *</label>
                  <input
                    v-model="diagnosisForm.name"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">ICD Code *</label>
                  <input
                    v-model="diagnosisForm.code"
                    type="text"
                    class="form-control"
                    placeholder="e.g., I10"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Category *</label>
                  <select
                    v-model="diagnosisForm.category"
                    class="form-select"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Endocrine">Endocrine</option>
                    <option value="Respiratory">Respiratory</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Description *</label>
                  <textarea
                    v-model="diagnosisForm.description"
                    class="form-control"
                    rows="2"
                    required
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Symptoms</label>
                  <textarea
                    v-model="diagnosisForm.symptoms"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Risk Factors</label>
                  <textarea
                    v-model="diagnosisForm.riskFactors"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Diagnostic Criteria</label>
                  <textarea
                    v-model="diagnosisForm.diagnosticCriteria"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Complications</label>
                  <textarea
                    v-model="diagnosisForm.complications"
                    class="form-control"
                    rows="2"
                  ></textarea>
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
                Add Diagnosis
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Diagnosis Modal -->
    <div
      class="modal fade"
      :class="{ show: showEditModal === 'diagnosis' }"
      :style="{ display: showEditModal === 'diagnosis' ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Edit Diagnosis
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="updateDiagnosis">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Diagnosis Name *</label>
                  <input
                    v-model="diagnosisForm.name"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">ICD Code *</label>
                  <input
                    v-model="diagnosisForm.code"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Category *</label>
                  <select
                    v-model="diagnosisForm.category"
                    class="form-select"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Endocrine">Endocrine</option>
                    <option value="Respiratory">Respiratory</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Description *</label>
                  <textarea
                    v-model="diagnosisForm.description"
                    class="form-control"
                    rows="2"
                    required
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Symptoms</label>
                  <textarea
                    v-model="diagnosisForm.symptoms"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Risk Factors</label>
                  <textarea
                    v-model="diagnosisForm.riskFactors"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Diagnostic Criteria</label>
                  <textarea
                    v-model="diagnosisForm.diagnosticCriteria"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Complications</label>
                  <textarea
                    v-model="diagnosisForm.complications"
                    class="form-control"
                    rows="2"
                  ></textarea>
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
                Update Diagnosis
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showAddModal || showEditModal"
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

.medications-section {
  background-color: rgba(0, 0, 0, 0.02);
}

.medication-item {
  align-items: center;
}

.nav-tabs .nav-link {
  border: none;
  color: var(--text-color);
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--primary-gradient-start);
}

.nav-tabs .nav-link.active {
  background: linear-gradient(
    135deg,
    var(--primary-gradient-start),
    var(--primary-gradient-end)
  );
  color: white;
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
  .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }
}
</style>
