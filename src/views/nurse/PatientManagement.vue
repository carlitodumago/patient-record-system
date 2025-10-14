<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-account-multiple</v-icon>
            Patient Management
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="$router.push('/patients/new')">
              <v-icon left>mdi-plus</v-icon>
              Add Patient
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="search"
              label="Search patients..."
              prepend-inner-icon="mdi-magnify"
              single-line
              hide-details
              class="mb-4"
            ></v-text-field>

            <v-data-table
              :headers="headers"
              :items="patients"
              :search="search"
              :loading="loading"
              class="elevation-1"
            >
              <template v-slot:item.actions="{ item }">
                <v-btn icon small @click="$router.push(`/patients/${item.id}`)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="$router.push(`/patients/${item.id}/edit`)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small @click="viewMedicalRecords(item)">
                  <v-icon>mdi-clipboard-text</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Medical Records Dialog -->
    <v-dialog v-model="showMedicalRecordsDialog" max-width="1000px">
      <v-card v-if="selectedPatient">
        <v-card-title
          >Medical Records - {{ selectedPatient.firstName }}
          {{ selectedPatient.lastName }}</v-card-title
        >
        <v-card-text>
          <v-btn color="primary" class="mb-4" @click="addMedicalRecord">
            <v-icon left>mdi-plus</v-icon>
            Add Medical Record
          </v-btn>

          <v-data-table
            :headers="medicalRecordHeaders"
            :items="patientMedicalRecords"
            :loading="loadingRecords"
            class="elevation-1"
          >
            <template v-slot:item.diagnosis="{ item }">
              {{ item.Diagnosis?.Description || "N/A" }}
            </template>
            <template v-slot:item.treatment="{ item }">
              {{ item.Treatment?.Description || "N/A" }}
            </template>
            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn icon small @click="editMedicalRecord(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                color="error"
                @click="deleteMedicalRecord(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeMedicalRecordsDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Medical Record Dialog -->
    <v-dialog v-model="showMedicalRecordDialog" max-width="800px">
      <v-card>
        <v-card-title>
          {{ editingRecord ? "Edit Medical Record" : "Add Medical Record" }}
        </v-card-title>
        <v-card-text>
          <v-form ref="medicalForm" v-model="medicalValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="medicalRecordForm.diagnosisId"
                  :items="diagnoses"
                  item-text="Description"
                  item-value="DiagnosisID"
                  label="Diagnosis"
                  required
                  :rules="[(v) => !!v || 'Diagnosis is required']"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="medicalRecordForm.treatmentId"
                  :items="treatments"
                  item-text="Description"
                  item-value="TreatmentID"
                  label="Treatment"
                  required
                  :rules="[(v) => !!v || 'Treatment is required']"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="medicalRecordForm.note"
                  label="Notes"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeMedicalRecordDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="saveMedicalRecord"
            :loading="savingRecord"
            :disabled="!medicalValid"
          >
            {{ editingRecord ? "Update" : "Save" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Medical Record Confirmation -->
    <v-dialog v-model="showDeleteMedicalDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this medical record? This action
          cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteMedicalDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            @click="confirmDeleteMedicalRecord"
            :loading="deletingRecord"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/services/supabase";

const patients = ref([]);
const diagnoses = ref([]);
const treatments = ref([]);
const loading = ref(false);
const search = ref("");
const showMedicalRecordsDialog = ref(false);
const showMedicalRecordDialog = ref(false);
const showDeleteMedicalDialog = ref(false);
const selectedPatient = ref(null);
const selectedMedicalRecord = ref(null);
const editingRecord = ref(null);
const loadingRecords = ref(false);
const savingRecord = ref(false);
const deletingRecord = ref(false);
const medicalValid = ref(false);

const headers = [
  { text: "Name", value: "fullName" },
  { text: "Email", value: "email" },
  { text: "Contact", value: "contactNumber" },
  { text: "Address", value: "address" },
  { text: "Gender", value: "gender" },
  { text: "Birth Date", value: "birthDate" },
  { text: "Actions", value: "actions", sortable: false },
];

const medicalRecordHeaders = [
  { text: "Diagnosis", value: "diagnosis" },
  { text: "Treatment", value: "treatment" },
  { text: "Notes", value: "note" },
  { text: "Created", value: "createdAt" },
  { text: "Actions", value: "actions", sortable: false },
];

const patientMedicalRecords = ref([]);

const medicalRecordForm = ref({
  diagnosisId: "",
  treatmentId: "",
  note: "",
});

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const loadPatients = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("Patients")
      .select("*")
      .order("CreatedAt", { ascending: false });

    if (error) throw error;

    patients.value = data.map((item) => ({
      ...item,
      fullName: `${item.firstName} ${
        item.middleName ? item.middleName + " " : ""
      }${item.lastName}`,
      birthDate: new Date(item.birthDate).toLocaleDateString(),
    }));
  } catch (error) {
    console.error("Load patients error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to load patients",
      color: "error",
    };
  } finally {
    loading.value = false;
  }
};

const loadReferenceData = async () => {
  try {
    const [diagnosesResult, treatmentsResult] = await Promise.all([
      supabase.from("Diagnosis").select("DiagnosisID, Description"),
      supabase.from("Treatment").select("TreatmentID, Description"),
    ]);

    diagnoses.value = diagnosesResult.data || [];
    treatments.value = treatmentsResult.data || [];
  } catch (error) {
    console.error("Load reference data error:", error);
  }
};

const viewMedicalRecords = async (patient) => {
  selectedPatient.value = patient;
  showMedicalRecordsDialog.value = true;
  await loadPatientMedicalRecords(patient.id);
};

const loadPatientMedicalRecords = async (patientId) => {
  loadingRecords.value = true;
  try {
    const { data, error } = await supabase
      .from("MedicalRecord")
      .select(
        `
        *,
        diagnoses (
          description
        ),
        treatments (
          description
        ),
        staff (
          firstName,
          lastName
        )
      `
      )
      .eq("PatientID", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    patientMedicalRecords.value = data;
  } catch (error) {
    console.error("Load patient medical records error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to load medical records",
      color: "error",
    };
  } finally {
    loadingRecords.value = false;
  }
};

const addMedicalRecord = () => {
  editingRecord.value = null;
  medicalRecordForm.value = {
    diagnosisId: "",
    treatmentId: "",
    note: "",
  };
  showMedicalRecordDialog.value = true;
};

const editMedicalRecord = (record) => {
  editingRecord.value = record;
  medicalRecordForm.value = {
    diagnosisId: record.DiagnosisID,
    treatmentId: record.TreatmentID,
    note: record.Notes,
  };
  showMedicalRecordDialog.value = true;
};

const saveMedicalRecord = async () => {
  if (!medicalValid.value) return;

  savingRecord.value = true;
  try {
    const recordData = {
      PatientID: selectedPatient.value.PatientID,
      DiagnosisID: medicalRecordForm.value.diagnosisId,
      TreatmentID: medicalRecordForm.value.treatmentId,
      Notes: medicalRecordForm.value.note,
      EnteredBy: 1, // TODO: Get from current user
    };

    if (editingRecord.value) {
      const { error } = await supabase
        .from("MedicalRecord")
        .update(recordData)
        .eq("RecordID", editingRecord.value.id);

      if (error) throw error;

      snackbar.value = {
        show: true,
        message: "Medical record updated successfully",
        color: "success",
      };
    } else {
      const { error } = await supabase
        .from("MedicalRecord")
        .insert([recordData]);

      if (error) throw error;

      snackbar.value = {
        show: true,
        message: "Medical record added successfully",
        color: "success",
      };
    }

    closeMedicalRecordDialog();
    await loadPatientMedicalRecords(selectedPatient.value.id);
  } catch (error) {
    console.error("Save medical record error:", error);
    snackbar.value = {
      show: true,
      message: error.message || "Failed to save medical record",
      color: "error",
    };
  } finally {
    savingRecord.value = false;
  }
};

const deleteMedicalRecord = (record) => {
  selectedMedicalRecord.value = record;
  showDeleteMedicalDialog.value = true;
};

const confirmDeleteMedicalRecord = async () => {
  deletingRecord.value = true;
  try {
    const { error } = await supabase
      .from("MedicalRecord")
      .delete()
      .eq("RecordID", selectedMedicalRecord.value.id);

    if (error) throw error;

    snackbar.value = {
      show: true,
      message: "Medical record deleted successfully",
      color: "success",
    };

    showDeleteMedicalDialog.value = false;
    await loadPatientMedicalRecords(selectedPatient.value.id);
  } catch (error) {
    console.error("Delete medical record error:", error);
    snackbar.value = {
      show: true,
      message: error.message || "Failed to delete medical record",
      color: "error",
    };
  } finally {
    deletingRecord.value = false;
  }
};

const closeMedicalRecordsDialog = () => {
  showMedicalRecordsDialog.value = false;
  selectedPatient.value = null;
  patientMedicalRecords.value = [];
};

const closeMedicalRecordDialog = () => {
  showMedicalRecordDialog.value = false;
  editingRecord.value = null;
  medicalRecordForm.value = {
    diagnosisId: "",
    treatmentId: "",
    note: "",
  };
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  loadPatients();
  loadReferenceData();
});
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}
</style>
