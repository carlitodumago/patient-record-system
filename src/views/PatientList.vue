<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { usePatientsStore } from "@/stores/patients";
import { useNotificationsStore } from "@/stores/notifications";
import ActionButtons from "@/components/ActionButtons.vue";
import { formatDate } from "../utils/dateUtils";

const patientsStore = usePatientsStore();
const notificationsStore = useNotificationsStore();
const router = useRouter();

const patients = computed(() => patientsStore.filteredPatients);
const isLoading = computed(() => patientsStore.isLoading);
const searchQuery = ref("");
const viewMode = ref("table"); // 'card' or 'table'
const selectedGender = ref("");
const selectedBloodType = ref("");
const medicalConditionFilter = ref("");

// Toggle view mode
const toggleViewMode = () => {
  viewMode.value = viewMode.value === "card" ? "table" : "card";
  // Save user preference
  localStorage.setItem("patientListViewMode", viewMode.value);
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedGender.value = "";
  selectedBloodType.value = "";
  medicalConditionFilter.value = "";
  patientsStore.clearFilters();
};

onMounted(async () => {
  // Load user preference for view mode
  const savedViewMode = localStorage.getItem("patientListViewMode");
  if (savedViewMode) {
    viewMode.value = savedViewMode;
  }

  // Load patients from Supabase
  await patientsStore.loadPatients(true);
  await patientsStore.loadStatistics();
});

// Watch for filter changes
watch(
  [searchQuery, selectedGender, selectedBloodType, medicalConditionFilter],
  () => {
    patientsStore.updateFilters({
      search: searchQuery.value,
      gender: selectedGender.value,
      bloodType: selectedBloodType.value,
      medicalCondition: medicalConditionFilter.value,
    });
  }
);

const viewPatient = (patientId) => {
  router.push(`/patients/${patientId}`);
};

const editPatient = (patientId) => {
  router.push(`/patients/${patientId}/edit`);
};

const deletePatient = async (patientId) => {
  if (confirm("Are you sure you want to delete this patient record?")) {
    try {
      // Get patient before deletion for notification
      const patientToDelete = patients.value.find(
        (p) => p.patient_id === patientId
      );

      // Delete the patient
      await patientsStore.deletePatient(patientId);

      // Add notification for deleted patient
      if (patientToDelete) {
        notificationsStore.addNotification({
          title: "Patient Record Deleted",
          message: `Patient ${patientToDelete.first_name} ${patientToDelete.surname} has been removed from the system`,
          type: "warning",
        });
      }
    } catch (error) {
      notificationsStore.addNotification({
        title: "Error",
        message: "Failed to delete patient record",
        type: "danger",
      });
    }
  }
};

const addNewPatient = () => {
  router.push("/patients/new");
};

const tableHeaders = [
  { title: "ID", key: "patient_id" },
  { title: "Name", key: "name" },
  { title: "Date of Birth", key: "birth_date" },
  { title: "Gender", key: "gender" },
  { title: "Blood Type", key: "blood_type" },
  { title: "Contact", key: "contact" },
  { title: "Medical Conditions", key: "medical_conditions" },
  { title: "Last Visit", key: "created_at" },
  { title: "Actions", key: "actions", sortable: false },
];

const getBloodTypeColor = (bloodType) => {
  if (bloodType === "AB" || bloodType === "AB+") {
    return "purple";
  }
  return "red";
};
</script>

<template>
  <v-container class="patient-list">
    <v-row class="mb-4">
      <v-col cols="12">
        <v-row align="center" justify="space-between">
          <v-col cols="auto">
            <h2 class="animate-fade-in-left">Patient List</h2>
          </v-col>
          <v-col cols="auto">
            <v-row align="center" class="animate-fade-in-right">
              <v-col cols="auto" class="mr-2">
                <v-btn-group>
                  <v-btn
                    @click="viewMode = 'table'"
                    :color="viewMode === 'table' ? 'primary' : 'grey lighten-2'"
                    title="Table View"
                  >
                    <v-icon>mdi-table</v-icon>
                  </v-btn>
                  <v-btn
                    @click="viewMode = 'card'"
                    :color="viewMode === 'card' ? 'primary' : 'grey lighten-2'"
                    title="Card View"
                  >
                    <v-icon>mdi-view-grid</v-icon>
                  </v-btn>
                </v-btn-group>
              </v-col>
              <v-col cols="auto">
                <v-btn @click="addNewPatient" color="success">
                  <v-icon left>mdi-plus-circle</v-icon> Add New Patient
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-card class="mb-4 search-card animate-fade-in-down">
      <v-card-text>
        <v-text-field
          v-model="searchQuery"
          placeholder="Search patients by name or medical condition..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
        ></v-text-field>
      </v-card-text>
    </v-card>

    <v-progress-circular
      v-if="isLoading"
      indeterminate
      color="primary"
      class="d-flex mx-auto my-5"
    ></v-progress-circular>

    <v-row v-else>
      <!-- Card View -->
      <v-col v-if="viewMode === 'card'" cols="12">
        <v-row v-if="patients.length === 0" justify="center">
          <v-col cols="12" class="text-center">
            <v-alert type="info" class="animate-fade-in">
              No patients found matching your search criteria.
            </v-alert>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col
            v-for="(patient, index) in patients"
            :key="patient.patient_id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              class="patient-card h-100 animate-fade-in-up"
              :style="{ animationDelay: `${index * 0.05}s` }"
              elevation="2"
            >
              <v-card-title class="d-flex justify-space-between align-center">
                <span class="patient-name">
                  {{ patient.first_name }} {{ patient.surname }}
                </span>
                <v-chip
                  :color="patient.gender === 'Male' ? 'blue' : 'pink'"
                  small
                >
                  {{ patient.gender }}
                </v-chip>
              </v-card-title>
              <v-card-text>
                <div class="patient-details">
                  <div class="detail-row">
                    <v-icon small class="mr-2">mdi-calendar</v-icon>
                    <span class="detail-label">Date of Birth:</span>
                    <span class="detail-value">{{
                      formatDate(patient.birth_date)
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <v-icon small class="mr-2">mdi-phone</v-icon>
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">{{
                      patient.contact_number
                    }}</span>
                  </div>
                  <div class="detail-row">
                    <v-icon small class="mr-2">mdi-water</v-icon>
                    <span class="detail-label">Blood Type:</span>
                    <v-chip
                      v-if="patient.blood_type"
                      :color="getBloodTypeColor(patient.blood_type)"
                      small
                      dark
                    >
                      {{ patient.blood_type }}
                    </v-chip>
                    <span v-else class="detail-value">Unknown</span>
                  </div>
                  <div class="detail-row">
                    <v-icon small class="mr-2">mdi-calendar-check</v-icon>
                    <span class="detail-label">Created:</span>
                    <span class="detail-value">{{
                      formatDate(patient.created_at)
                    }}</span>
                  </div>
                  <div class="detail-row mt-3">
                    <v-icon small class="mr-2">mdi-heart-pulse</v-icon>
                    <span class="fw-bold">Medical Conditions:</span>
                    <div class="medical-conditions mt-2">
                      <v-chip
                        v-for="(condition, idx) in patient.medical_conditions"
                        :key="idx"
                        small
                        class="mr-1 mb-1"
                      >
                        {{ condition }}
                      </v-chip>
                      <v-chip
                        v-if="
                          !patient.medical_conditions ||
                          patient.medical_conditions.length === 0
                        "
                        small
                        outlined
                      >
                        None
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn
                  @click="viewPatient(patient.patient_id)"
                  color="primary"
                  small
                  icon
                  title="View"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  @click="editPatient(patient.patient_id)"
                  color="secondary"
                  small
                  icon
                  title="Edit"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  @click="deletePatient(patient.patient_id)"
                  color="error"
                  small
                  icon
                  title="Delete"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- Table View -->
      <v-col v-else-if="viewMode === 'table'" cols="12" class="animate-fade-in">
        <v-data-table
          :headers="tableHeaders"
          :items="patients"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.patient_id="{ item }">
            {{ item.patient_id.slice(0, 8) }}
          </template>
          <template v-slot:item.name="{ item }">
            {{ item.first_name }} {{ item.surname }}
          </template>
          <template v-slot:item.birth_date="{ item }">
            {{ formatDate(item.birth_date) }}
          </template>
          <template v-slot:item.blood_type="{ item }">
            <v-chip
              v-if="item.blood_type"
              :color="getBloodTypeColor(item.blood_type)"
              small
              dark
            >
              {{ item.blood_type }}
            </v-chip>
            <span v-else class="text-muted">Not specified</span>
          </template>
          <template v-slot:item.contact="{ item }">
            <div>{{ item.contact_number }}</div>
            <small>{{ item.user?.email }}</small>
          </template>
          <template v-slot:item.medical_conditions="{ item }">
            <v-chip
              v-for="(condition, index) in item.medical_conditions"
              :key="index"
              small
              color="info"
              class="mr-1 mb-1"
            >
              {{ condition }}
            </v-chip>
          </template>
          <template v-slot:item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <ActionButtons
              :onView="() => viewPatient(item.patient_id)"
              :onEdit="() => editPatient(item.patient_id)"
              :onDelete="() => deletePatient(item.patient_id)"
            />
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
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
  animation: pulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  animation-duration: 3s;
}

.search-card {
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.search-card:focus-within {
  transform: scale(1.01);
  box-shadow: 0 4px 15px rgba(67, 97, 238, 0.2);
}
</style>
