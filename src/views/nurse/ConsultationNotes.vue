<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

// Store
const store = useStore();

// Reactive data
const loading = ref(false);
const search = ref("");
const showAddModal = ref(false);
const showEditModal = ref(false);
const showViewModal = ref(false);
const selectedNote = ref(null);
const filterType = ref("all");

const consultationNotes = ref([
  {
    id: 1,
    patientId: 1,
    patientName: "John Doe",
    appointmentId: 1,
    enteredBy: 1,
    staffName: "Dr. Sarah Johnson",
    type: "Consultation",
    subject: "Regular Check-up - October 2024",
    content:
      "Patient presented for routine check-up. Blood pressure readings: 135/85, 140/88. Patient reports occasional headaches but no chest pain or shortness of breath. Advised to continue current medication and monitor blood pressure at home. Diet counseling provided regarding low-sodium options.",
    vitalSigns: {
      bloodPressure: "140/90",
      heartRate: "72 bpm",
      temperature: "36.8°C",
      weight: "70 kg",
      height: "175 cm",
    },
    assessment:
      "Blood pressure slightly elevated but stable. No acute concerns.",
    plan: "Continue current antihypertensive medication. Follow-up in 2 weeks for repeat BP check.",
    followUp: "2 weeks",
    createdAt: "2024-10-10T10:30:00",
    updatedAt: "2024-10-10T10:30:00",
    status: "Final",
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Maria Santos",
    appointmentId: 2,
    enteredBy: 2,
    staffName: "Dr. Sarah Johnson",
    type: "Follow-up",
    subject: "Diabetes Management Review",
    content:
      "Patient reports good compliance with medication and diet. Blood glucose readings have been within target range (80-140 mg/dL fasting). HbA1c results reviewed - showing improvement from 7.2% to 6.8%. No hypoglycemic episodes reported.",
    vitalSigns: {
      bloodPressure: "120/80",
      heartRate: "68 bpm",
      temperature: "36.5°C",
      weight: "65 kg",
      height: "160 cm",
    },
    assessment: "Diabetes well-controlled with current management plan.",
    plan: "Continue current metformin dosage. Increase physical activity as tolerated.",
    followUp: "3 months",
    createdAt: "2024-10-14T14:00:00",
    updatedAt: "2024-10-14T14:00:00",
    status: "Final",
  },
  {
    id: 3,
    patientId: 3,
    patientName: "Pedro Cruz",
    appointmentId: 3,
    enteredBy: 3,
    staffName: "Maria Santos, RN",
    type: "Vaccination",
    subject: "COVID-19 Booster Vaccination",
    content:
      "Patient received Pfizer COVID-19 booster vaccination in left deltoid. No immediate adverse reactions observed. Patient instructed to monitor for common side effects including injection site pain, fatigue, headache, and muscle pain for the next 24-48 hours.",
    vitalSigns: {
      bloodPressure: "130/85",
      heartRate: "75 bpm",
      temperature: "36.6°C",
      weight: "75 kg",
      height: "168 cm",
    },
    assessment: "Vaccination administered successfully without complications.",
    plan: "Monitor for post-vaccination symptoms. Next booster as per guidelines.",
    followUp: "As needed for symptoms",
    createdAt: "2024-09-28T09:00:00",
    updatedAt: "2024-09-28T09:00:00",
    status: "Final",
  },
]);

// Form data
const noteForm = ref({
  patientId: "",
  patientName: "",
  appointmentId: "",
  type: "Consultation",
  subject: "",
  content: "",
  vitalSigns: {
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
  },
  assessment: "",
  plan: "",
  followUp: "",
  status: "Draft",
});

// Computed properties
const user = computed(() => store.state.user);
const filteredNotes = computed(() => {
  return consultationNotes.value.filter((note) => {
    const matchesSearch =
      note.patientName.toLowerCase().includes(search.value.toLowerCase()) ||
      note.staffName.toLowerCase().includes(search.value.toLowerCase()) ||
      note.subject.toLowerCase().includes(search.value.toLowerCase()) ||
      note.content.toLowerCase().includes(search.value.toLowerCase());

    const matchesType =
      filterType.value === "all" ||
      note.type.toLowerCase() === filterType.value;

    return matchesSearch && matchesType;
  });
});

const draftNotes = computed(() => {
  return consultationNotes.value.filter((note) => note.status === "Draft");
});

const recentNotes = computed(() => {
  return consultationNotes.value
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
});

// Methods
const fetchNotes = async () => {
  loading.value = true;
  try {
    // Simulate API call - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Mock data is already loaded
  } catch (error) {
    console.error("Error fetching notes:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  noteForm.value = {
    patientId: "",
    patientName: "",
    appointmentId: "",
    type: "Consultation",
    subject: "",
    content: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
    },
    assessment: "",
    plan: "",
    followUp: "",
    status: "Draft",
  };
};

const openAddModal = () => {
  resetForm();
  selectedNote.value = null;
  showAddModal.value = true;
};

const openEditModal = (note) => {
  selectedNote.value = note;
  noteForm.value = {
    patientId: note.patientId,
    patientName: note.patientName,
    appointmentId: note.appointmentId,
    type: note.type,
    subject: note.subject,
    content: note.content,
    vitalSigns: { ...note.vitalSigns },
    assessment: note.assessment,
    plan: note.plan,
    followUp: note.followUp,
    status: note.status,
  };
  showEditModal.value = true;
};

const openViewModal = (note) => {
  selectedNote.value = note;
  showViewModal.value = true;
};

const closeModals = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  showViewModal.value = false;
  selectedNote.value = null;
  resetForm();
};

const addNote = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newNote = {
      id: Math.max(...consultationNotes.value.map((n) => n.id)) + 1,
      appointmentId: noteForm.value.appointmentId || null,
      patientId: noteForm.value.patientId,
      patientName: noteForm.value.patientName,
      enteredBy: 1, // Current user ID
      staffName:
        user.value?.fullName || user.value?.username || "Current Nurse",
      ...noteForm.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    consultationNotes.value.push(newNote);
    closeModals();

    console.log("Note added successfully");
  } catch (error) {
    console.error("Error adding note:", error);
  }
};

const updateNote = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = consultationNotes.value.findIndex(
      (n) => n.id === selectedNote.value.id
    );
    if (index !== -1) {
      consultationNotes.value[index] = {
        ...consultationNotes.value[index],
        ...noteForm.value,
        updatedAt: new Date().toISOString(),
      };
    }

    closeModals();
    console.log("Note updated successfully");
  } catch (error) {
    console.error("Error updating note:", error);
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

const exportNote = (note) => {
  // Simulate export functionality
  const exportData = {
    patientName: note.patientName,
    date: formatDateTime(note.createdAt),
    type: note.type,
    subject: note.subject,
    content: note.content,
    assessment: note.assessment,
    plan: note.plan,
    staffName: note.staffName,
  };

  console.log("Exporting note:", exportData);
  // In a real application, this would generate a PDF or export file
  alert("Note export functionality would be implemented here");
};

const printNote = (note) => {
  console.log("Printing note:", note);
  // In a real application, this would open a print dialog
  alert("Print functionality would be implemented here");
};

onMounted(() => {
  fetchNotes();
});
</script>

<template>
  <div class="consultation-notes">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Consultation Notes</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Create and manage patient consultation notes
        </p>
      </div>
      <div class="animate-fade-in-right">
        <button class="btn btn-primary" @click="openAddModal">
          <i class="bi bi-plus-circle me-2"></i>
          New Consultation Note
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-journal-text text-primary fs-2"></i>
            </div>
            <h4 class="mb-1">{{ consultationNotes.length }}</h4>
            <small class="text-muted">Total Notes</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-100">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-pencil text-warning fs-2"></i>
            </div>
            <h4 class="mb-1">{{ draftNotes.length }}</h4>
            <small class="text-muted">Draft Notes</small>
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
              {{ filteredNotes.filter((n) => n.status === "Final").length }}
            </h4>
            <small class="text-muted">Final Notes</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-300">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-clock text-info fs-2"></i>
            </div>
            <h4 class="mb-1">{{ recentNotes.length }}</h4>
            <small class="text-muted">Recent (7 days)</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Draft Notes Alert -->
    <div
      v-if="draftNotes.length > 0"
      class="alert alert-warning animate-fade-in-up animation-delay-200"
    >
      <div class="d-flex align-items-center">
        <div class="alert-icon me-3">
          <i class="bi bi-exclamation-triangle text-warning fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h6 class="alert-heading mb-1">Draft Notes Require Completion</h6>
          <p class="mb-0">
            You have {{ draftNotes.length }} draft note(s) that need to be
            finalized.
          </p>
        </div>
        <button class="btn btn-warning btn-sm">
          <i class="bi bi-eye me-1"></i>
          Review Drafts
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card mb-4 animate-fade-in-up animation-delay-300">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="search-box">
              <i class="bi bi-search search-icon"></i>
              <input
                v-model="search"
                type="text"
                class="form-control"
                placeholder="Search notes by patient, staff, or content..."
              />
            </div>
          </div>
          <div class="col-md-6">
            <select v-model="filterType" class="form-select">
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="vaccination">Vaccination</option>
              <option value="emergency">Emergency</option>
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
      <p class="mt-3 text-muted">Loading consultation notes...</p>
    </div>

    <!-- Notes Table -->
    <div v-else class="card animate-fade-in-up animation-delay-400">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-journal-text me-2"></i>
          Consultation Notes ({{ filteredNotes.length }})
        </h5>
        <button
          class="btn btn-sm btn-outline-primary"
          @click="fetchNotes"
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
                <th>Healthcare Provider</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date Created</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="note in filteredNotes"
                :key="note.id"
                class="animate-fade-in-up"
              >
                <td>
                  <div class="d-flex align-items-center">
                    <div class="patient-avatar me-3">
                      <i class="bi bi-person-circle"></i>
                    </div>
                    <div>
                      <div class="fw-medium">{{ note.patientName }}</div>
                      <small class="text-muted">ID: {{ note.patientId }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="fw-medium">{{ note.staffName }}</div>
                  <small class="text-muted">{{
                    formatDateTime(note.createdAt)
                  }}</small>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="`bg-${getTypeBadgeVariant(note.type)}`"
                  >
                    {{ note.type }}
                  </span>
                </td>
                <td>
                  <div class="fw-medium">{{ note.subject }}</div>
                  <small class="text-muted"
                    >{{ note.content.substring(0, 60) }}...</small
                  >
                </td>
                <td>
                  <span
                    class="badge"
                    :class="`bg-${getStatusBadgeVariant(note.status)}`"
                  >
                    {{ note.status }}
                  </span>
                </td>
                <td>{{ new Date(note.createdAt).toLocaleDateString() }}</td>
                <td class="text-center">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-info"
                      @click="openViewModal(note)"
                      title="View Note"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="openEditModal(note)"
                      title="Edit Note"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-success"
                      @click="exportNote(note)"
                      title="Export Note"
                    >
                      <i class="bi bi-download"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredNotes.length === 0" class="text-center py-5">
          <i class="bi bi-journal-x text-muted fs-1 mb-3"></i>
          <h5 class="text-muted">No consultation notes found</h5>
          <p class="text-muted mb-3">
            {{
              search
                ? "Try adjusting your search criteria."
                : "No consultation notes have been created yet."
            }}
          </p>
          <button v-if="!search" class="btn btn-primary" @click="openAddModal">
            <i class="bi bi-plus-circle me-2"></i>
            Create First Note
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Notes Summary -->
    <div
      v-if="recentNotes.length > 0"
      class="card mt-4 animate-fade-in-up animation-delay-500"
    >
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-clock-history me-2"></i>
          Recent Notes
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div v-for="note in recentNotes" :key="note.id" class="col-md-12">
            <div class="recent-note-card p-3 border rounded animate-fade-in-up">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center mb-2">
                    <div class="patient-avatar-small me-3">
                      <i class="bi bi-person-circle"></i>
                    </div>
                    <div>
                      <strong>{{ note.patientName }}</strong>
                      <span
                        class="badge ms-2"
                        :class="`bg-${getStatusBadgeVariant(note.status)}`"
                      >
                        {{ note.status }}
                      </span>
                      <span
                        class="badge ms-2"
                        :class="`bg-${getTypeBadgeVariant(note.type)}`"
                      >
                        {{ note.type }}
                      </span>
                    </div>
                  </div>
                  <h6 class="mb-2">{{ note.subject }}</h6>
                  <p class="mb-2">{{ note.content.substring(0, 150) }}...</p>
                  <small class="text-muted">
                    Created by {{ note.staffName }} on
                    {{ formatDateTime(note.createdAt) }}
                  </small>
                </div>
                <div class="text-end">
                  <button
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="openViewModal(note)"
                  >
                    <i class="bi bi-eye me-1"></i>
                    View
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="printNote(note)"
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

    <!-- Add Note Modal -->
    <div
      class="modal fade"
      :class="{ show: showAddModal }"
      :style="{ display: showAddModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Create New Consultation Note
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="addNote">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Patient Name *</label>
                  <input
                    v-model="noteForm.patientName"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Note Type *</label>
                  <select v-model="noteForm.type" class="form-select" required>
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Subject *</label>
                  <input
                    v-model="noteForm.subject"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Consultation Content *</label>
                  <textarea
                    v-model="noteForm.content"
                    class="form-control"
                    rows="4"
                    required
                    placeholder="Detailed description of the consultation, patient presentation, and findings"
                  ></textarea>
                </div>

                <div class="col-md-12">
                  <label class="form-label">Vital Signs</label>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Blood Pressure</label>
                  <input
                    v-model="noteForm.vitalSigns.bloodPressure"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 120/80"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Heart Rate (bpm)</label>
                  <input
                    v-model="noteForm.vitalSigns.heartRate"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 72"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Temperature (°C)</label>
                  <input
                    v-model="noteForm.vitalSigns.temperature"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 36.8"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Weight (kg)</label>
                  <input
                    v-model="noteForm.vitalSigns.weight"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 70"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Height (cm)</label>
                  <input
                    v-model="noteForm.vitalSigns.height"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 175"
                  />
                </div>

                <div class="col-md-12">
                  <label class="form-label">Assessment</label>
                  <textarea
                    v-model="noteForm.assessment"
                    class="form-control"
                    rows="2"
                    placeholder="Clinical assessment and impression"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Plan</label>
                  <textarea
                    v-model="noteForm.plan"
                    class="form-control"
                    rows="2"
                    placeholder="Treatment plan and recommendations"
                  ></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Follow-up</label>
                  <input
                    v-model="noteForm.followUp"
                    type="text"
                    class="form-control"
                    placeholder="e.g., 2 weeks, 3 months"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Status</label>
                  <select v-model="noteForm.status" class="form-select">
                    <option value="Draft">Draft</option>
                    <option value="Final">Final</option>
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
                Create Note
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Note Modal -->
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
              Edit Consultation Note
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="updateNote">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Patient Name *</label>
                  <input
                    v-model="noteForm.patientName"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Note Type *</label>
                  <select v-model="noteForm.type" class="form-select" required>
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Subject *</label>
                  <input
                    v-model="noteForm.subject"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Consultation Content *</label>
                  <textarea
                    v-model="noteForm.content"
                    class="form-control"
                    rows="4"
                    required
                  ></textarea>
                </div>

                <div class="col-md-12">
                  <label class="form-label">Vital Signs</label>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Blood Pressure</label>
                  <input
                    v-model="noteForm.vitalSigns.bloodPressure"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Heart Rate (bpm)</label>
                  <input
                    v-model="noteForm.vitalSigns.heartRate"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Temperature (°C)</label>
                  <input
                    v-model="noteForm.vitalSigns.temperature"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Weight (kg)</label>
                  <input
                    v-model="noteForm.vitalSigns.weight"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Height (cm)</label>
                  <input
                    v-model="noteForm.vitalSigns.height"
                    type="text"
                    class="form-control"
                  />
                </div>

                <div class="col-md-12">
                  <label class="form-label">Assessment</label>
                  <textarea
                    v-model="noteForm.assessment"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Plan</label>
                  <textarea
                    v-model="noteForm.plan"
                    class="form-control"
                    rows="2"
                  ></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Follow-up</label>
                  <input
                    v-model="noteForm.followUp"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Status</label>
                  <select v-model="noteForm.status" class="form-select">
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
                Update Note
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Note Modal -->
    <div
      class="modal fade"
      :class="{ show: showViewModal }"
      :style="{ display: showViewModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-journal-text me-2"></i>
              Consultation Note Details
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body" v-if="selectedNote">
            <div class="row g-3">
              <div class="col-md-12">
                <div
                  class="note-header d-flex align-items-center mb-4 p-3 bg-light rounded"
                >
                  <div class="patient-avatar-large me-3">
                    <i class="bi bi-person-circle"></i>
                  </div>
                  <div>
                    <h4 class="mb-1">{{ selectedNote.patientName }}</h4>
                    <p class="text-muted mb-1">
                      Patient ID: {{ selectedNote.patientId }}
                    </p>
                    <p class="text-muted mb-0">
                      Note ID: {{ selectedNote.id }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-medium">Note Information</label>
                <div class="info-group">
                  <div class="info-item">
                    <strong>Healthcare Provider:</strong>
                    {{ selectedNote.staffName }}
                  </div>
                  <div class="info-item">
                    <strong>Note Type:</strong>
                    <span
                      class="badge ms-2"
                      :class="`bg-${getTypeBadgeVariant(selectedNote.type)}`"
                    >
                      {{ selectedNote.type }}
                    </span>
                  </div>
                  <div class="info-item">
                    <strong>Created:</strong>
                    {{ formatDateTime(selectedNote.createdAt) }}
                  </div>
                  <div class="info-item">
                    <strong>Last Updated:</strong>
                    {{ formatDateTime(selectedNote.updatedAt) }}
                  </div>
                  <div class="info-item">
                    <strong>Status:</strong>
                    <span
                      class="badge ms-2"
                      :class="`bg-${getStatusBadgeVariant(
                        selectedNote.status
                      )}`"
                    >
                      {{ selectedNote.status }}
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
                      selectedNote.vitalSigns.bloodPressure || "Not recorded"
                    }}
                  </div>
                  <div class="info-item">
                    <strong>Heart Rate:</strong>
                    {{ selectedNote.vitalSigns.heartRate || "Not recorded" }}
                  </div>
                  <div class="info-item">
                    <strong>Temperature:</strong>
                    {{ selectedNote.vitalSigns.temperature || "Not recorded" }}
                  </div>
                  <div class="info-item">
                    <strong>Weight:</strong>
                    {{ selectedNote.vitalSigns.weight || "Not recorded" }}
                  </div>
                  <div class="info-item">
                    <strong>Height:</strong>
                    {{ selectedNote.vitalSigns.height || "Not recorded" }}
                  </div>
                </div>
              </div>

              <div class="col-md-12">
                <label class="form-label fw-medium">Consultation Details</label>
                <div class="info-group">
                  <div class="info-item">
                    <strong>Subject:</strong> {{ selectedNote.subject }}
                  </div>
                  <div class="info-item">
                    <strong>Content:</strong> {{ selectedNote.content }}
                  </div>
                  <div class="info-item">
                    <strong>Assessment:</strong>
                    {{ selectedNote.assessment || "No assessment recorded" }}
                  </div>
                  <div class="info-item">
                    <strong>Plan:</strong>
                    {{ selectedNote.plan || "No plan recorded" }}
                  </div>
                  <div class="info-item">
                    <strong>Follow-up:</strong>
                    {{ selectedNote.followUp || "No follow-up scheduled" }}
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
              @click="openEditModal(selectedNote)"
            >
              <i class="bi bi-pencil me-2"></i>
              Edit Note
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="exportNote(selectedNote)"
            >
              <i class="bi bi-download me-2"></i>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showAddModal || showEditModal || showViewModal"
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

.note-header {
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

.recent-note-card {
  background-color: var(--light-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recent-note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.alert-icon {
  flex-shrink: 0;
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
