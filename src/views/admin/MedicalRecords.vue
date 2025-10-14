<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-clipboard-text</v-icon>
            Medical Records Management
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="showAddDialog = true">
              <v-icon left>mdi-plus</v-icon>
              Add Record
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="search"
              label="Search records..."
              prepend-inner-icon="mdi-magnify"
              single-line
              hide-details
              class="mb-4"
            ></v-text-field>

            <v-data-table
              :headers="headers"
              :items="medicalRecords"
              :search="search"
              :loading="loading"
              class="elevation-1"
            >
              <template v-slot:item.patientName="{ item }">
                {{ item.patientName }}
              </template>
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
                <v-btn icon small @click="viewRecord(item)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn icon small @click="editRecord(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small color="error" @click="deleteRecord(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Medical Record Dialog -->
    <v-dialog v-model="showAddDialog" max-width="800px">
      <v-card>
        <v-card-title>
          {{ editingRecord ? "Edit Medical Record" : "Add New Medical Record" }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="recordForm.patientId"
                  :items="patients"
                  item-text="fullName"
                  item-value="PatientID"
                  label="Patient"
                  required
                  :rules="[(v) => !!v || 'Patient is required']"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="recordForm.diagnosisId"
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
                  v-model="recordForm.treatmentId"
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
                  v-model="recordForm.note"
                  label="Notes"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="saveRecord"
            :loading="saving"
            :disabled="!valid"
          >
            {{ editingRecord ? "Update" : "Save" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Medical Record Dialog -->
    <v-dialog v-model="showViewDialog" max-width="800px">
      <v-card v-if="selectedRecord">
        <v-card-title>Medical Record Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <strong>Patient:</strong> {{ selectedRecord.patientName }}
            </v-col>
            <v-col cols="12">
              <strong>Diagnosis:</strong>
              {{ selectedRecord.Diagnosis?.Description || "N/A" }}
            </v-col>
            <v-col cols="12">
              <strong>Treatment:</strong>
              {{ selectedRecord.Treatment?.Description || "N/A" }}
            </v-col>
            <v-col cols="12">
              <strong>Notes:</strong> {{ selectedRecord.Notes || "No notes" }}
            </v-col>
            <v-col cols="12">
              <strong>Created:</strong>
              {{ formatDate(selectedRecord.createdAt) }}
            </v-col>
            <v-col cols="12">
              <strong>Entered By:</strong>
              {{ selectedRecord.enteredByName || "N/A" }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showViewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this medical record? This action
          cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="deleting">
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

const medicalRecords = ref([]);
const patients = ref([]);
const diagnoses = ref([]);
const treatments = ref([]);
const loading = ref(false);
const search = ref("");
const showAddDialog = ref(false);
const showViewDialog = ref(false);
const showDeleteDialog = ref(false);
const editingRecord = ref(null);
const selectedRecord = ref(null);
const saving = ref(false);
const deleting = ref(false);
const valid = ref(false);

const headers = [
  { text: "Patient", value: "patientName" },
  { text: "Diagnosis", value: "diagnosis" },
  { text: "Treatment", value: "treatment" },
  { text: "Created", value: "createdAt" },
  { text: "Actions", value: "actions", sortable: false },
];

const recordForm = ref({
  patientId: "",
  diagnosisId: "",
  treatmentId: "",
  note: "",
});

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const loadMedicalRecords = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("MedicalRecord")
      .select(
        `
        *,
        Patients (
          FirstName,
          Surname
        ),
        Diagnosis (
          Description
        ),
        Treatment (
          Description
        ),
        Staff (
          FirstName,
          Surname
        )
      `
      )
      .order("CreatedAt", { ascending: false });

    if (error) throw error;

    medicalRecords.value = data.map((item) => ({
      ...item,
      patientName: `${item.Patients?.FirstName || ""} ${
        item.Patients?.Surname || ""
      }`.trim(),
      enteredByName: `${item.Staff?.FirstName || ""} ${
        item.Staff?.Surname || ""
      }`.trim(),
    }));
  } catch (error) {
    console.error("Load medical records error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to load medical records",
      color: "error",
    };
  } finally {
    loading.value = false;
  }
};

const loadReferenceData = async () => {
  try {
    const [patientsResult, diagnosesResult, treatmentsResult] =
      await Promise.all([
        supabase.from("Patients").select("PatientID, FirstName, Surname"),
        supabase.from("Diagnosis").select("DiagnosisID, Description"),
        supabase.from("Treatment").select("TreatmentID, Description"),
      ]);

    patients.value =
      patientsResult.data?.map((p) => ({
        ...p,
        fullName: `${p.FirstName} ${p.Surname}`,
      })) || [];

    diagnoses.value = diagnosesResult.data || [];
    treatments.value = treatmentsResult.data || [];
  } catch (error) {
    console.error("Load reference data error:", error);
  }
};

const saveRecord = async () => {
  if (!valid.value) return;

  saving.value = true;
  try {
    const recordData = {
      ...recordForm.value,
      enteredBy: 1, // TODO: Get from current user
    };

    if (editingRecord.value) {
      const { error } = await supabase
        .from("MedicalRecord")
        .update({
          PatientID: recordData.patientId,
          DiagnosisID: recordData.diagnosisId,
          TreatmentID: recordData.treatmentId,
          Notes: recordData.note,
          EnteredBy: recordData.enteredBy,
        })
        .eq("RecordID", editingRecord.value.RecordID);

      if (error) throw error;

      snackbar.value = {
        show: true,
        message: "Medical record updated successfully",
        color: "success",
      };
    } else {
      const { error } = await supabase.from("MedicalRecord").insert([
        {
          PatientID: recordData.patientId,
          DiagnosisID: recordData.diagnosisId,
          TreatmentID: recordData.treatmentId,
          Notes: recordData.note,
          EnteredBy: recordData.enteredBy,
        },
      ]);

      if (error) throw error;

      snackbar.value = {
        show: true,
        message: "Medical record added successfully",
        color: "success",
      };
    }

    closeDialog();
    loadMedicalRecords();
  } catch (error) {
    console.error("Save record error:", error);
    snackbar.value = {
      show: true,
      message: error.message || "Failed to save medical record",
      color: "error",
    };
  } finally {
    saving.value = false;
  }
};

const viewRecord = (record) => {
  selectedRecord.value = record;
  showViewDialog.value = true;
};

const editRecord = (record) => {
  editingRecord.value = record;
  recordForm.value = {
    patientId: record.PatientID,
    diagnosisId: record.DiagnosisID,
    treatmentId: record.TreatmentID,
    note: record.Notes,
  };
  showAddDialog.value = true;
};

const deleteRecord = (record) => {
  selectedRecord.value = record;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    const { error } = await supabase
      .from("MedicalRecord")
      .delete()
      .eq("RecordID", selectedRecord.value.RecordID);

    if (error) throw error;

    snackbar.value = {
      show: true,
      message: "Medical record deleted successfully",
      color: "success",
    };

    showDeleteDialog.value = false;
    loadMedicalRecords();
  } catch (error) {
    console.error("Delete record error:", error);
    snackbar.value = {
      show: true,
      message: error.message || "Failed to delete medical record",
      color: "error",
    };
  } finally {
    deleting.value = false;
  }
};

const closeDialog = () => {
  showAddDialog.value = false;
  editingRecord.value = null;
  recordForm.value = {
    patientId: "",
    diagnosisId: "",
    treatmentId: "",
    note: "",
  };
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  loadMedicalRecords();
  loadReferenceData();
});
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}
</style>
