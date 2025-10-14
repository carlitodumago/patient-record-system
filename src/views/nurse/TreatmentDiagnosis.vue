<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-medical-bag</v-icon>
            Treatment & Diagnosis Management
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="tab" class="mb-4">
              <v-tab>Diagnoses</v-tab>
              <v-tab>Treatments</v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <!-- Diagnoses Tab -->
              <v-tab-item>
                <v-row class="mb-4">
                  <v-col cols="12" md="6">
                    <v-btn color="primary" @click="showDiagnosisDialog = true">
                      <v-icon left>mdi-plus</v-icon>
                      Add Diagnosis
                    </v-btn>
                  </v-col>
                </v-row>

                <v-data-table
                  :headers="diagnosisHeaders"
                  :items="diagnoses"
                  :loading="loadingDiagnoses"
                  class="elevation-1"
                >
                  <template v-slot:item.createdAt="{ item }">
                    {{ formatDate(item.createdAt) }}
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon small @click="editDiagnosis(item)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon small color="error" @click="deleteDiagnosis(item)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>

              <!-- Treatments Tab -->
              <v-tab-item>
                <v-row class="mb-4">
                  <v-col cols="12" md="6">
                    <v-btn color="primary" @click="showTreatmentDialog = true">
                      <v-icon left>mdi-plus</v-icon>
                      Add Treatment
                    </v-btn>
                  </v-col>
                </v-row>

                <v-data-table
                  :headers="treatmentHeaders"
                  :items="treatments"
                  :loading="loadingTreatments"
                  class="elevation-1"
                >
                  <template v-slot:item.createdAt="{ item }">
                    {{ formatDate(item.createdAt) }}
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon small @click="editTreatment(item)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon small color="error" @click="deleteTreatment(item)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diagnosis Dialog -->
    <v-dialog v-model="showDiagnosisDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingDiagnosis ? 'Edit Diagnosis' : 'Add New Diagnosis' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="diagnosisForm" v-model="diagnosisValid">
            <v-text-field
              v-model="diagnosisForm.description"
              label="Diagnosis Description"
              required
              :rules="[v => !!v || 'Description is required']"
            ></v-text-field>
            <v-textarea
              v-model="diagnosisForm.notes"
              label="Additional Notes"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDiagnosisDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveDiagnosis" :loading="savingDiagnosis" :disabled="!diagnosisValid">
            {{ editingDiagnosis ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Treatment Dialog -->
    <v-dialog v-model="showTreatmentDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingTreatment ? 'Edit Treatment' : 'Add New Treatment' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="treatmentForm" v-model="treatmentValid">
            <v-text-field
              v-model="treatmentForm.description"
              label="Treatment Description"
              required
              :rules="[v => !!v || 'Description is required']"
            ></v-text-field>
            <v-textarea
              v-model="treatmentForm.notes"
              label="Additional Notes"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeTreatmentDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveTreatment" :loading="savingTreatment" :disabled="!treatmentValid">
            {{ editingTreatment ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this {{ deleteType }}? This action cannot be undone.
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
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const tab = ref(0)
const diagnoses = ref([])
const treatments = ref([])
const loadingDiagnoses = ref(false)
const loadingTreatments = ref(false)
const showDiagnosisDialog = ref(false)
const showTreatmentDialog = ref(false)
const showDeleteDialog = ref(false)
const editingDiagnosis = ref(null)
const editingTreatment = ref(null)
const selectedItem = ref(null)
const deleteType = ref('')
const savingDiagnosis = ref(false)
const savingTreatment = ref(false)
const deleting = ref(false)
const diagnosisValid = ref(false)
const treatmentValid = ref(false)

const diagnosisHeaders = [
  { text: 'Description', value: 'description' },
  { text: 'Notes', value: 'notes' },
  { text: 'Created', value: 'createdAt' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const treatmentHeaders = [
  { text: 'Description', value: 'description' },
  { text: 'Notes', value: 'notes' },
  { text: 'Created', value: 'createdAt' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const diagnosisForm = ref({
  description: '',
  notes: ''
})

const treatmentForm = ref({
  description: '',
  notes: ''
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const loadDiagnoses = async () => {
  loadingDiagnoses.value = true
  try {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    diagnoses.value = data
  } catch (error) {
    console.error('Load diagnoses error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to load diagnoses',
      color: 'error'
    }
  } finally {
    loadingDiagnoses.value = false
  }
}

const loadTreatments = async () => {
  loadingTreatments.value = true
  try {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    treatments.value = data
  } catch (error) {
    console.error('Load treatments error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to load treatments',
      color: 'error'
    }
  } finally {
    loadingTreatments.value = false
  }
}

const saveDiagnosis = async () => {
  if (!diagnosisValid.value) return

  savingDiagnosis.value = true
  try {
    if (editingDiagnosis.value) {
      const { error } = await supabase
        .from('diagnoses')
        .update(diagnosisForm.value)
        .eq('id', editingDiagnosis.value.id)

      if (error) throw error

      snackbar.value = {
        show: true,
        message: 'Diagnosis updated successfully',
        color: 'success'
      }
    } else {
      const { error } = await supabase
        .from('diagnoses')
        .insert([diagnosisForm.value])

      if (error) throw error

      snackbar.value = {
        show: true,
        message: 'Diagnosis added successfully',
        color: 'success'
      }
    }

    closeDiagnosisDialog()
    loadDiagnoses()
  } catch (error) {
    console.error('Save diagnosis error:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'Failed to save diagnosis',
      color: 'error'
    }
  } finally {
    savingDiagnosis.value = false
  }
}

const saveTreatment = async () => {
  if (!treatmentValid.value) return

  savingTreatment.value = true
  try {
    if (editingTreatment.value) {
      const { error } = await supabase
        .from('treatments')
        .update(treatmentForm.value)
        .eq('id', editingTreatment.value.id)

      if (error) throw error

      snackbar.value = {
        show: true,
        message: 'Treatment updated successfully',
        color: 'success'
      }
    } else {
      const { error } = await supabase
        .from('treatments')
        .insert([treatmentForm.value])

      if (error) throw error

      snackbar.value = {
        show: true,
        message: 'Treatment added successfully',
        color: 'success'
      }
    }

    closeTreatmentDialog()
    loadTreatments()
  } catch (error) {
    console.error('Save treatment error:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'Failed to save treatment',
      color: 'error'
    }
  } finally {
    savingTreatment.value = false
  }
}

const editDiagnosis = (diagnosis) => {
  editingDiagnosis.value = diagnosis
  diagnosisForm.value = { ...diagnosis }
  showDiagnosisDialog.value = true
}

const editTreatment = (treatment) => {
  editingTreatment.value = treatment
  treatmentForm.value = { ...treatment }
  showTreatmentDialog.value = true
}

const deleteDiagnosis = (diagnosis) => {
  selectedItem.value = diagnosis
  deleteType.value = 'diagnosis'
  showDeleteDialog.value = true
}

const deleteTreatment = (treatment) => {
  selectedItem.value = treatment
  deleteType.value = 'treatment'
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    const table = deleteType.value === 'diagnosis' ? 'diagnoses' : 'treatments'
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', selectedItem.value.id)

    if (error) throw error

    snackbar.value = {
      show: true,
      message: `${deleteType.value.charAt(0).toUpperCase() + deleteType.value.slice(1)} deleted successfully`,
      color: 'success'
    }

    showDeleteDialog.value = false
    if (deleteType.value === 'diagnosis') {
      loadDiagnoses()
    } else {
      loadTreatments()
    }
  } catch (error) {
    console.error('Delete error:', error)
    snackbar.value = {
      show: true,
      message: `Failed to delete ${deleteType.value}`,
      color: 'error'
    }
  } finally {
    deleting.value = false
  }
}

const closeDiagnosisDialog = () => {
  showDiagnosisDialog.value = false
  editingDiagnosis.value = null
  diagnosisForm.value = {
    description: '',
    notes: ''
  }
}

const closeTreatmentDialog = () => {
  showTreatmentDialog.value = false
  editingTreatment.value = null
  treatmentForm.value = {
    description: '',
    notes: ''
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadDiagnoses()
  loadTreatments()
})
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}
</style>
