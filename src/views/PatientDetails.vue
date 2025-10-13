<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { formatDate } from "../utils/dateUtils";
import { addPatientNotification } from "../utils/notificationUtils";
import { addVisitNotification } from "../utils/notificationUtils";

const store = useStore();
const router = useRouter();
const route = useRoute();

const patientId = parseInt(route.params.id);
const patient = ref(null);
const isLoading = ref(true);
const activeTab = ref("overview");
const showAddVisitModal = ref(false);

// Create a data structure for the new visit
const newVisit = ref({
  patientId: patientId,
  visitDate: "",
  purpose: "",
  physician: "",
  diagnosis: "",
  prescription: "",
  notes: "",
  status: "upcoming",
});

const formErrors = ref({});

// Function to validate the visit form
const validateVisitForm = () => {
  const errors = {};

  if (!newVisit.value.visitDate) {
    errors.visitDate = "Visit date is required";
  }

  if (!newVisit.value.purpose) {
    errors.purpose = "Purpose is required";
  }

  if (!newVisit.value.physician) {
    errors.physician = "Physician name is required";
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Function to show the add visit modal
const showAddVisit = () => {
  // Get today's date in MM/DD/YYYY format
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const year = today.getFullYear();

  // Reset form
  newVisit.value = {
    patientId: patientId,
    visitDate: `${month}/${day}/${year}`,
    purpose: "",
    physician: "",
    diagnosis: "",
    prescription: "",
    notes: "",
    status: "upcoming",
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
  const savedVisits = localStorage.getItem("medicalVisits");
  if (savedVisits) {
    visits = JSON.parse(savedVisits);
  }

  // Add the new visit
  visits.push(visitData);

  // Save back to localStorage
  localStorage.setItem("medicalVisits", JSON.stringify(visits));

  // Add notification
  addVisitNotification(
    store,
    {
      ...visitData,
      physicianName: visitData.physician,
      visitDate: visitData.visitDate,
    },
    (id) =>
      patient.value
        ? `${patient.value.firstName} ${patient.value.lastName}`
        : "Unknown Patient",
    "scheduled"
  );

  // Add visit to patient's visits array if it exists
  if (patient.value.visits) {
    patient.value.visits.push({
      id: visitData.id,
      date: visitData.visitDate,
      physician: visitData.physician,
      reason: visitData.purpose,
      diagnosis: visitData.diagnosis || "Not provided",
      prescription: visitData.prescription || "None",
      notes: visitData.notes || "No notes",
    });
  }

  // Close the modal
  showAddVisitModal.value = false;

  // Show a success message
  alert("Visit scheduled successfully!");
};

onMounted(() => {
  // In a real application, you would fetch the patient's data from an API
  const foundPatient = store.state.patients.find((p) => p.id === patientId);

  if (foundPatient) {
    patient.value = {
      ...foundPatient,
      // Additional mock data for the patient detail view if properties don't exist
      allergies: foundPatient.allergies || ["Penicillin", "Peanuts"],
      // Use the patient's actual blood type or provide a default
      bloodType: foundPatient.bloodType || "Not specified",
      height: foundPatient.height || "175 cm",
      weight: foundPatient.weight || "70 kg",
      visits: [
        {
          id: 1,
          date: "2023-11-15",
          physician: "Dr. Smith",
          reason: "Regular checkup",
          diagnosis: "Healthy",
          prescription: "None",
          notes: "Patient is in good health. Blood pressure normal.",
        },
        {
          id: 2,
          date: "2023-10-05",
          physician: "Dr. Johnson",
          reason: "Flu symptoms",
          diagnosis: "Seasonal flu",
          prescription: "Tamiflu 75mg",
          notes:
            "Patient presented with fever, cough, and fatigue. Rest recommended.",
        },
      ],
    };
    store.commit("setCurrentPatient", patient.value);
  } else {
    router.push("/patients");
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
  if (
    confirm(
      `Are you sure you want to delete ${patient.value.firstName} ${patient.value.lastName}'s record?`
    )
  ) {
    addPatientNotification(store, patient.value, "deleted");

    store.commit("deletePatient", patientId);
    router.push("/patients");
  }
};

const tabClass = (tab) => {
  return activeTab.value === tab ? "active" : "";
};

const viewMedicalHistory = () => {
  router.push("/history");
};
</script>

<template>
  <v-container class="mt-3">
    <div v-if="isLoading" class="text-center my-5">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <p class="mt-2">Loading patient details...</p>
    </div>

    <div v-else-if="patient">
      <v-row class="mb-4" align="center" justify="space-between">
        <v-col>
          <h2>Patient Details</h2>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="goBack" outlined color="secondary" class="me-2">
            <v-icon left>mdi-arrow-left</v-icon>
            Back
          </v-btn>
          <v-btn @click="viewMedicalHistory" color="info" class="me-2">
            <v-icon left>mdi-clock-history</v-icon>
            Medical History
          </v-btn>
          <!-- Download Button (Placeholder) -->
          <v-btn outlined color="secondary" class="me-2">
            <v-icon left>mdi-download</v-icon>
            Download
          </v-btn>
          <v-btn @click="goToEdit" color="primary" class="me-2">
            <v-icon left>mdi-pencil</v-icon>
            Edit
          </v-btn>
          <v-btn @click="confirmDelete" color="error">
            <v-icon left>mdi-delete</v-icon>
            Delete
          </v-btn>
        </v-col>
      </v-row>

      <v-card class="mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3" class="text-center">
              <!-- Placeholder for patient photo -->
              <v-avatar size="150" color="grey lighten-3">
                <v-icon size="64" color="grey">mdi-account</v-icon>
              </v-avatar>
              <h4 class="mt-3">
                {{ patient.firstName }} {{ patient.lastName }}
              </h4>
              <p class="text--secondary">Patient ID: {{ patient.id }}</p>
            </v-col>
            <v-col cols="12" md="9">
              <v-row>
                <v-col cols="12" sm="6" md="4" class="mb-3">
                  <h6 class="text--secondary">Date of Birth</h6>
                  <p>{{ formatDate(patient.dob) }}</p>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="mb-3">
                  <h6 class="text--secondary">Gender</h6>
                  <p>{{ patient.gender }}</p>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="mb-3">
                  <h6 class="text--secondary">Blood Type</h6>
                  <v-chip
                    v-if="patient.bloodType"
                    :color="
                      patient.bloodType === 'AB' || patient.bloodType === 'AB+'
                        ? 'error'
                        : 'error'
                    "
                    dark
                  >
                    {{ patient.bloodType }}
                  </v-chip>
                  <p v-else>Not specified</p>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="mb-3">
                  <h6 class="text--secondary">Phone</h6>
                  <p>{{ patient.phone }}</p>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="mb-3">
                  <h6 class="text--secondary">Email</h6>
                  <p>{{ patient.email }}</p>
                </v-col>
                <v-col cols="12" sm="6" md="4" class="mb-3">
                  <h6 class="text--secondary">Last Visit</h6>
                  <p>{{ formatDate(patient.lastVisit) }}</p>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-tabs v-model="activeTab" class="mb-4">
        <v-tab value="overview">Overview</v-tab>
        <v-tab value="visits">Medical Visits</v-tab>
        <v-tab value="details">Additional Details</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Overview Tab -->
        <v-window-item value="overview">
          <v-row>
            <v-col cols="12" md="6" class="mb-4">
              <v-card height="100%">
                <v-card-title>Medical Conditions</v-card-title>
                <v-card-text>
                  <div
                    v-if="
                      patient.medicalConditions &&
                      patient.medicalConditions.length
                    "
                  >
                    <v-chip
                      v-for="(condition, index) in patient.medicalConditions"
                      :key="index"
                      color="info"
                      class="me-2 mb-2"
                    >
                      {{ condition }}
                    </v-chip>
                  </div>
                  <p v-else class="text--secondary">
                    No known medical conditions.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6" class="mb-4">
              <v-card height="100%">
                <v-card-title>Allergies</v-card-title>
                <v-card-text>
                  <div v-if="patient.allergies && patient.allergies.length">
                    <v-chip
                      v-for="(allergy, index) in patient.allergies"
                      :key="index"
                      color="warning"
                      class="me-2 mb-2"
                    >
                      {{ allergy }}
                    </v-chip>
                  </div>
                  <p v-else class="text--secondary">No known allergies.</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Medical Visits Tab -->
        <v-window-item value="visits">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              Medical Visit History
              <v-btn @click="showAddVisit" color="primary" small>
                <v-icon left>mdi-plus-circle</v-icon>
                Add Visit
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="visit in patient.visits"
                  :key="visit.id"
                >
                  <v-expansion-panel-title>
                    <div class="d-flex justify-space-between align-center">
                      <span
                        >{{ formatDate(visit.date) }} - {{ visit.reason }} ({{
                          visit.physician
                        }})</span
                      >
                      <div class="d-flex">
                        <v-btn
                          icon
                          small
                          color="secondary"
                          title="Download Record"
                        >
                          <v-icon>mdi-download</v-icon>
                        </v-btn>
                        <v-btn icon small color="primary" title="Edit Record">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon small color="error" title="Delete Record">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12" md="6" class="mb-3">
                        <h6 class="text--secondary">Physician</h6>
                        <p>{{ visit.physician }}</p>
                      </v-col>
                      <v-col cols="12" md="6" class="mb-3">
                        <h6 class="text--secondary">Date</h6>
                        <p>{{ formatDate(visit.date) }}</p>
                      </v-col>
                      <v-col cols="12" md="6" class="mb-3">
                        <h6 class="text--secondary">Reason for Visit</h6>
                        <p>{{ visit.reason }}</p>
                      </v-col>
                      <v-col cols="12" md="6" class="mb-3">
                        <h6 class="text--secondary">Diagnosis</h6>
                        <p>{{ visit.diagnosis }}</p>
                      </v-col>
                      <v-col cols="12" md="6" class="mb-3">
                        <h6 class="text--secondary">Prescription</h6>
                        <p>{{ visit.prescription }}</p>
                      </v-col>
                      <v-col cols="12" class="mb-3">
                        <h6 class="text--secondary">Notes</h6>
                        <p>{{ visit.notes }}</p>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Additional Details Tab -->
        <v-window-item value="details">
          <v-row>
            <v-col cols="12" md="6" class="mb-4">
              <v-card height="100%">
                <v-card-title>Physical Information</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="6" class="mb-3">
                      <h6 class="text--secondary">Height</h6>
                      <p>{{ patient.height }}</p>
                    </v-col>
                    <v-col cols="6" class="mb-3">
                      <h6 class="text--secondary">Weight</h6>
                      <p>{{ patient.weight }}</p>
                    </v-col>
                    <v-col cols="6" class="mb-3">
                      <h6 class="text--secondary">Blood Type</h6>
                      <v-chip v-if="patient.bloodType" color="error" dark>
                        {{ patient.bloodType }}
                      </v-chip>
                      <p v-else>Not specified</p>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6" class="mb-4">
              <v-card height="100%">
                <v-card-title>Insurance Information</v-card-title>
                <v-card-text>
                  <p class="text--secondary">
                    No insurance information available.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </div>

    <v-alert v-else type="error">
      Patient not found. The record may have been deleted or you don't have
      access.
    </v-alert>

    <!-- Add Visit Modal -->
    <v-dialog v-model="showAddVisitModal" max-width="600">
      <v-card>
        <v-card-title>
          Schedule Visit for {{ patient?.firstName }} {{ patient?.lastName }}
          <v-spacer></v-spacer>
          <v-btn icon @click="cancelAddVisit">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveVisit">
            <v-text-field
              v-model="newVisit.visitDate"
              label="Visit Date"
              :error-messages="formErrors.visitDate"
              placeholder="MM/DD/YYYY"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="newVisit.purpose"
              label="Purpose"
              :error-messages="formErrors.purpose"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="newVisit.physician"
              label="Physician"
              :error-messages="formErrors.physician"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="newVisit.diagnosis"
              label="Diagnosis (optional)"
              rows="2"
              class="mb-3"
            ></v-textarea>

            <v-text-field
              v-model="newVisit.prescription"
              label="Prescription (optional)"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="newVisit.notes"
              label="Notes (optional)"
              rows="3"
              class="mb-3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancelAddVisit" color="secondary">Cancel</v-btn>
          <v-btn @click="saveVisit" color="primary">Schedule Visit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
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
