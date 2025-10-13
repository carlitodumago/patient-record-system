t<template>
  <v-container class="patient-medical-records">
    <v-row>
      <v-col cols="12">
        <v-row align="center" justify="space-between" class="mb-4">
          <v-col cols="auto">
            <h1>Medical Records for Patient {{ patientId }}</h1>
          </v-col>
          <v-col cols="auto">
            <v-btn variant="outlined" @click="goBack">Back to Patient</v-btn>
          </v-col>
        </v-row>

        <v-card class="mb-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Medical Records</span>
            <v-btn
              color="primary"
              @click="showAddRecordModal = true"
            >
              Add New Record
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row v-if="loading" justify="center" class="my-5">
              <v-col cols="auto" class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
                <p class="mt-2">Loading records...</p>
              </v-col>
            </v-row>

            <v-alert
              v-else-if="records.length === 0"
              type="info"
              class="text-center"
            >
              No medical records found for this patient.
            </v-alert>

            <div v-else>
              <v-row>
                <v-col
                  v-for="record in records"
                  :key="record.id"
                  cols="12"
                  md="6"
                  lg="4"
                  class="mb-4"
                >
                  <v-card>
                    <v-card-title
                      class="d-flex justify-space-between align-center"
                    >
                      <span>{{ record.title }}</span>
                      <span class="text-caption text-medium-emphasis">{{
                        formatDate(record.createdAt)
                      }}</span>
                    </v-card-title>
                    <v-card-text>
                      <p>{{ record.description }}</p>
                      <div
                        class="d-flex justify-space-between text-caption text-medium-emphasis"
                      >
                        <span>By: {{ record.createdBy }}</span>
                        <span>Type: {{ record.type }}</span>
                      </div>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn
                        size="small"
                        color="info"
                        variant="outlined"
                        @click="viewRecord(record)"
                      >
                        View Details
                      </v-btn>
                      <v-btn
                        size="small"
                        color="warning"
                        variant="outlined"
                        @click="editRecord(record)"
                      >
                        Edit
                      </v-btn>
                      <v-btn
                        size="small"
                        color="error"
                        variant="outlined"
                        @click="deleteRecord(record)"
                      >
                        Delete
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>

        <!-- Add/Edit Record Dialog -->
        <v-dialog v-model="dialogModel" max-width="600px">
          <v-card>
            <v-card-title>
              {{ showEditRecordModal ? "Edit Record" : "Add New Record" }}
              <v-spacer></v-spacer>
              <v-btn
                icon="mdi-close"
                variant="text"
                @click="closeModal"
              ></v-btn>
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="saveRecord">
                <v-select
                  v-model="recordForm.appointmentId"
                  :items="appointments"
                  item-title="(item) => `${formatDate(item.dateTime)} - ${item.status}`"
                  item-value="id"
                  label="Appointment"
                  required
                  class="mb-3"
                ></v-select>

                <v-text-field
                  v-model="recordForm.title"
                  label="Title"
                  required
                  class="mb-3"
                ></v-text-field>

                <v-select
                  v-model="recordForm.type"
                  :items="[
                    { text: 'Diagnosis', value: 'diagnosis' },
                    { text: 'Treatment', value: 'treatment' },
                    { text: 'Prescription', value: 'prescription' },
                    { text: 'Lab Result', value: 'lab_result' },
                    { text: 'Note', value: 'note' },
                  ]"
                  label="Type"
                  required
                  class="mb-3"
                ></v-select>

                <v-textarea
                  v-model="recordForm.description"
                  label="Description"
                  required
                  rows="4"
                  class="mb-3"
                ></v-textarea>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn variant="text" @click="closeModal">Cancel</v-btn>
                  <v-btn color="primary" type="submit" :loading="saving">
                    {{ showEditRecordModal ? "Update" : "Save" }}
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- View Record Dialog -->
        <v-dialog v-model="showViewRecordModal" max-width="600px">
          <v-card>
            <v-card-title>
              {{ selectedRecord?.title }}
              <v-spacer></v-spacer>
              <v-btn
                icon="mdi-close"
                variant="text"
                @click="closeModal"
              ></v-btn>
            </v-card-title>
            <v-card-text>
              <div class="record-details">
                <p><strong>Type:</strong> {{ selectedRecord?.type }}</p>
                <p>
                  <strong>Description:</strong>
                  {{ selectedRecord?.description }}
                </p>
                <p>
                  <strong>Created By:</strong> {{ selectedRecord?.createdBy }}
                </p>
                <p>
                  <strong>Created At:</strong>
                  {{ formatDate(selectedRecord?.createdAt) }}
                </p>
                <p>
                  <strong>Last Updated:</strong>
                  {{ formatDate(selectedRecord?.updatedAt) }}
                </p>
              </div>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="closeModal">Close</v-btn>
              </v-card-actions>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { medicalRecordService } from "@/services/medicalRecordService";
import appointmentService from "@/services/appointmentService";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "PatientMedicalRecords",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const patientId = ref(route.params.id);
    const records = ref([]);
    const loading = ref(false);
    const appointments = ref([]);

    const showAddRecordModal = ref(false);
    const showEditRecordModal = ref(false);
    const showViewRecordModal = ref(false);
    const selectedRecord = ref(null);

    const dialogModel = computed({
      get: () => showAddRecordModal.value || showEditRecordModal.value,
      set: (value) => {
        if (!value) {
          closeModal();
        }
      },
    });

    const recordForm = ref({
      appointmentId: null,
      title: "",
      type: "",
      description: "",
      notes: "",
      diagnosisId: null,
      treatmentId: null,
    });

    const fetchRecords = async () => {
      loading.value = true;
      try {
        const data = await medicalRecordService.getRecordsByPatientDirect(
          patientId.value
        );
        records.value = data;
      } catch (error) {
        console.error("Error fetching records:", error);
        // Handle error (show notification, etc.)
      } finally {
        loading.value = false;
      }
    };

    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getAppointmentsByPatient(
          patientId.value
        );
        appointments.value = data;
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    const saving = ref(false);

    const saveRecord = async () => {
      saving.value = true;
      try {
        const recordData = {
          appointmentId: recordForm.value.appointmentId,
          enteredBy: authStore.user?.id,
          notes: recordForm.value.description,
          diagnosisId: recordForm.value.diagnosisId,
          treatmentId: recordForm.value.treatmentId,
        };

        if (showEditRecordModal.value) {
          recordData.noteId = selectedRecord.value.notes?.NoteID;
          await medicalRecordService.updateRecord(
            selectedRecord.value.id,
            recordData
          );
        } else {
          await medicalRecordService.createRecord(recordData);
        }

        closeModal();
        fetchRecords();
      } catch (error) {
        console.error("Error saving record:", error);
        // Handle error
      } finally {
        saving.value = false;
      }
    };

    const editRecord = (record) => {
      selectedRecord.value = record;
      recordForm.value = {
        appointmentId: record.appointmentId,
        title: record.title,
        type: record.type,
        description: record.notes?.Content || record.description,
        notes: record.notes?.Content || "",
        diagnosisId: record.diagnosis?.DiagnosisID,
        treatmentId: record.treatment?.TreatmentID,
      };
      showEditRecordModal.value = true;
    };

    const viewRecord = (record) => {
      selectedRecord.value = record;
      showViewRecordModal.value = true;
    };

    const deleteRecord = async (record) => {
      if (confirm("Are you sure you want to delete this record?")) {
        try {
          await medicalRecordService.deleteRecord(record.id);
          fetchRecords();
        } catch (error) {
          console.error("Error deleting record:", error);
          // Handle error
        }
      }
    };

    const closeModal = () => {
      showAddRecordModal.value = false;
      showEditRecordModal.value = false;
      showViewRecordModal.value = false;
      selectedRecord.value = null;
      recordForm.value = {
        appointmentId: null,
        title: "",
        type: "",
        description: "",
        notes: "",
        diagnosisId: null,
        treatmentId: null,
      };
    };

    const goBack = () => {
      router.push(`/patients/${patientId.value}`);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString();
    };

    onMounted(() => {
      fetchRecords();
      fetchAppointments();
    });

    return {
      patientId,
      records,
      loading,
      showAddRecordModal,
      showEditRecordModal,
      showViewRecordModal,
      selectedRecord,
      recordForm,
      dialogModel,
      saving,
      fetchRecords,
      saveRecord,
      editRecord,
      viewRecord,
      deleteRecord,
      closeModal,
      goBack,
      formatDate,
    };
  },
};
</script>

<style scoped>
.patient-medical-records {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
}

.records-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
}

.records-list {
  display: grid;
  gap: 15px;
}

.record-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background: #f9f9f9;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.record-header h3 {
  margin: 0;
  color: #333;
}

.record-date {
  color: #666;
  font-size: 0.9em;
}

.record-content {
  margin-bottom: 15px;
}

.record-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9em;
  color: #666;
}

.record-actions {
  display: flex;
  gap: 10px;
}



.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.record-details p {
  margin-bottom: 10px;
}

.loading,
.no-records {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
