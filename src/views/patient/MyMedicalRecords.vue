<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-clipboard-text</v-icon>
            My Medical Records
          </v-card-title>
          <v-card-text>
            <v-alert type="info" outlined class="mb-4">
              <strong>Privacy Notice:</strong> Your medical records are confidential and only accessible to authorized healthcare personnel.
            </v-alert>

            <v-data-table
              :headers="headers"
              :items="medicalRecords"
              :loading="loading"
              class="elevation-1"
            >
              <template v-slot:item.diagnosis="{ item }">
                {{ item.diagnosis?.description || 'N/A' }}
              </template>
              <template v-slot:item.treatment="{ item }">
                {{ item.treatment?.description || 'N/A' }}
              </template>
              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn icon small @click="viewRecord(item)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn icon small @click="downloadRecord(item)">
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- View Medical Record Dialog -->
    <v-dialog v-model="showViewDialog" max-width="800px">
      <v-card v-if="selectedRecord">
        <v-card-title>Medical Record Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <strong>Date:</strong> {{ formatDate(selectedRecord.createdAt) }}
            </v-col>
            <v-col cols="12">
              <strong>Diagnosis:</strong> {{ selectedRecord.diagnosis?.description || 'N/A' }}
            </v-col>
            <v-col cols="12">
              <strong>Treatment:</strong> {{ selectedRecord.treatment?.description || 'N/A' }}
            </v-col>
            <v-col cols="12">
              <strong>Notes:</strong>
              <div class="mt-2 p-3 bg-grey-lighten-4 rounded">{{ selectedRecord.note || 'No additional notes' }}</div>
            </v-col>
            <v-col cols="12">
              <strong>Entered By:</strong> {{ selectedRecord.enteredByName || 'Healthcare Provider' }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showViewDialog = false">Close</v-btn>
          <v-btn color="primary" @click="downloadRecord(selectedRecord)">
            <v-icon left>mdi-download</v-icon>
            Download PDF
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

const medicalRecords = ref([])
const loading = ref(false)
const showViewDialog = ref(false)
const selectedRecord = ref(null)

const headers = [
  { text: 'Date', value: 'createdAt' },
  { text: 'Diagnosis', value: 'diagnosis' },
  { text: 'Treatment', value: 'treatment' },
  { text: 'Entered By', value: 'enteredByName' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const loadMedicalRecords = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
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
      `)
      .eq('patientId', 1) // TODO: Get from current user
      .order('created_at', { ascending: false })

    if (error) throw error

    medicalRecords.value = data.map(item => ({
      ...item,
      enteredByName: `${item.staff?.firstName || ''} ${item.staff?.lastName || ''}`.trim() || 'Healthcare Provider'
    }))
  } catch (error) {
    console.error('Load medical records error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to load medical records',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

const viewRecord = (record) => {
  selectedRecord.value = record
  showViewDialog.value = true
}

const downloadRecord = (record) => {
  // TODO: Implement PDF generation and download
  snackbar.value = {
    show: true,
    message: 'PDF download feature coming soon',
    color: 'info'
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadMedicalRecords()
})
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}

.bg-grey-lighten-4 {
  background-color: #f5f5f5 !important;
}
</style>
