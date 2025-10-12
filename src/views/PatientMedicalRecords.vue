<template>
  <div class="patient-medical-records">
    <div class="header">
      <h1>Medical Records for Patient {{ patientId }}</h1>
      <button @click="goBack" class="btn btn-secondary">Back to Patient</button>
    </div>

    <div class="records-section">
      <div class="section-header">
        <h2>Medical Records</h2>
        <button @click="showAddRecordModal = true" class="btn btn-primary">
          Add New Record
        </button>
      </div>

      <div v-if="loading" class="loading">Loading records...</div>

      <div v-else-if="records.length === 0" class="no-records">
        No medical records found for this patient.
      </div>

      <div v-else class="records-list">
        <div v-for="record in records" :key="record.id" class="record-card">
          <div class="record-header">
            <h3>{{ record.title }}</h3>
            <span class="record-date">{{ formatDate(record.createdAt) }}</span>
          </div>
          <div class="record-content">
            <p>{{ record.description }}</p>
            <div class="record-meta">
              <span>By: {{ record.createdBy }}</span>
              <span>Type: {{ record.type }}</span>
            </div>
          </div>
          <div class="record-actions">
            <button @click="viewRecord(record)" class="btn btn-sm btn-info">
              View Details
            </button>
            <button @click="editRecord(record)" class="btn btn-sm btn-warning">
              Edit
            </button>
            <button @click="deleteRecord(record)" class="btn btn-sm btn-danger">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Record Modal -->
    <div v-if="showAddRecordModal || showEditRecordModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ showEditRecordModal ? "Edit Record" : "Add New Record" }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveRecord">
            <div class="form-group">
              <label for="title">Title</label>
              <input
                id="title"
                v-model="recordForm.title"
                type="text"
                required
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label for="type">Type</label>
              <select
                id="type"
                v-model="recordForm.type"
                required
                class="form-control"
              >
                <option value="">Select Type</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="treatment">Treatment</option>
                <option value="prescription">Prescription</option>
                <option value="lab_result">Lab Result</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="recordForm.description"
                required
                class="form-control"
                rows="4"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                {{ showEditRecordModal ? "Update" : "Save" }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Record Modal -->
    <div v-if="showViewRecordModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ selectedRecord?.title }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="record-details">
            <p><strong>Type:</strong> {{ selectedRecord?.type }}</p>
            <p>
              <strong>Description:</strong> {{ selectedRecord?.description }}
            </p>
            <p><strong>Created By:</strong> {{ selectedRecord?.createdBy }}</p>
            <p>
              <strong>Created At:</strong>
              {{ formatDate(selectedRecord?.createdAt) }}
            </p>
            <p>
              <strong>Last Updated:</strong>
              {{ formatDate(selectedRecord?.updatedAt) }}
            </p>
          </div>
          <div class="form-actions">
            <button @click="closeModal" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
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

    const saveRecord = async () => {
      try {
        const recordData = {
          appointmentId: recordForm.value.appointmentId,
          enteredBy: authStore.user?.id,
          notes: recordForm.value.description,
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

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
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
