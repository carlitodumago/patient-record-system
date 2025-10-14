<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-note-text</v-icon>
            Consultation Notes
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="showAddDialog = true">
              <v-icon left>mdi-plus</v-icon>
              Add Consultation Note
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="search"
              label="Search notes..."
              prepend-inner-icon="mdi-magnify"
              single-line
              hide-details
              class="mb-4"
            ></v-text-field>

            <v-data-table
              :headers="headers"
              :items="consultationNotes"
              :search="search"
              :loading="loading"
              class="elevation-1"
            >
              <template v-slot:item.patientName="{ item }">
                {{ item.patientName }}
              </template>
              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn icon small @click="viewNote(item)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn icon small @click="editNote(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small color="error" @click="deleteNote(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Consultation Note Dialog -->
    <v-dialog v-model="showAddDialog" max-width="800px">
      <v-card>
        <v-card-title>
          {{ editingNote ? 'Edit Consultation Note' : 'Add New Consultation Note' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="noteForm.patientId"
                  :items="patients"
                  item-text="fullName"
                  item-value="id"
                  label="Patient"
                  required
                  :rules="[v => !!v || 'Patient is required']"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="noteForm.title"
                  label="Consultation Title"
                  required
                  :rules="[v => !!v || 'Title is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="noteForm.content"
                  label="Consultation Notes"
                  rows="6"
                  required
                  :rules="[v => !!v || 'Content is required']"
                ></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="noteForm.vitalSigns"
                  label="Vital Signs"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="noteForm.symptoms"
                  label="Symptoms"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveNote" :loading="saving" :disabled="!valid">
            {{ editingNote ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Consultation Note Dialog -->
    <v-dialog v-model="showViewDialog" max-width="800px">
      <v-card v-if="selectedNote">
        <v-card-title>Consultation Note Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <strong>Patient:</strong> {{ selectedNote.patientName }}
            </v-col>
            <v-col cols="12">
              <strong>Title:</strong> {{ selectedNote.title }}
            </v-col>
            <v-col cols="12">
              <strong>Content:</strong>
              <div class="mt-2 p-3 bg-grey-lighten-4 rounded">{{ selectedNote.content }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <strong>Vital Signs:</strong> {{ selectedNote.vitalSigns || 'N/A' }}
            </v-col>
            <v-col cols="12" md="6">
              <strong>Symptoms:</strong> {{ selectedNote.symptoms || 'N/A' }}
            </v-col>
            <v-col cols="12">
              <strong>Created:</strong> {{ formatDate(selectedNote.createdAt) }}
            </v-col>
            <v-col cols="12">
              <strong>Created By:</strong> {{ selectedNote.createdByName || 'N/A' }}
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
          Are you sure you want to delete this consultation note? This action cannot be undone.
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

const consultationNotes = ref([])
const patients = ref([])
const loading = ref(false)
const search = ref('')
const showAddDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const editingNote = ref(null)
const selectedNote = ref(null)
const saving = ref(false)
const deleting = ref(false)
const valid = ref(false)

const headers = [
  { text: 'Patient', value: 'patientName' },
  { text: 'Title', value: 'title' },
  { text: 'Content Preview', value: 'contentPreview' },
  { text: 'Created', value: 'createdAt' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const noteForm = ref({
  patientId: '',
  title: '',
  content: '',
  vitalSigns: '',
  symptoms: ''
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const loadConsultationNotes = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('consultation_notes')
      .select(`
        *,
        patients (
          firstName,
          lastName
        ),
        staff (
          firstName,
          lastName
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    consultationNotes.value = data.map(item => ({
      ...item,
      patientName: `${item.patients?.firstName || ''} ${item.patients?.lastName || ''}`.trim(),
      createdByName: `${item.staff?.firstName || ''} ${item.staff?.lastName || ''}`.trim(),
      contentPreview: item.content?.length > 50 ? item.content.substring(0, 50) + '...' : item.content
    }))
  } catch (error) {
    console.error('Load consultation notes error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to load consultation notes',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

const loadPatients = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, firstName, lastName')

    if (error) throw error

    patients.value = data.map(patient => ({
      ...patient,
      fullName: `${patient.firstName} ${patient.lastName}`
    }))
  } catch (error) {
    console.error('Load patients error:', error)
  }
}

const saveNote = async () => {
  if (!valid.value) return

  saving.value = true
  try {
    const noteData = {
      ...noteForm.value,
      createdBy: 1 // TODO: Get from current user
    }

    if (editingNote.value) {
      const { error } = await supabase
        .from('consultation_notes')
        .update(noteData)
        .eq('id', editingNote.value.id)

      if (error) throw error

      snackbar.value = {
        show: true,
        message: 'Consultation note updated successfully',
        color: 'success'
      }
    } else {
      const { error } = await supabase
        .from('consultation_notes')
        .insert([noteData])

      if (error) throw error

      snackbar.value = {
        show: true,
        message: 'Consultation note added successfully',
        color: 'success'
      }
    }

    closeDialog()
    loadConsultationNotes()
  } catch (error) {
    console.error('Save note error:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'Failed to save consultation note',
      color: 'error'
    }
  } finally {
    saving.value = false
  }
}

const viewNote = (note) => {
  selectedNote.value = note
  showViewDialog.value = true
}

const editNote = (note) => {
  editingNote.value = note
  noteForm.value = {
    patientId: note.patientId,
    title: note.title,
    content: note.content,
    vitalSigns: note.vitalSigns,
    symptoms: note.symptoms
  }
  showAddDialog.value = true
}

const deleteNote = (note) => {
  selectedNote.value = note
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    const { error } = await supabase
      .from('consultation_notes')
      .delete()
      .eq('id', selectedNote.value.id)

    if (error) throw error

    snackbar.value = {
      show: true,
      message: 'Consultation note deleted successfully',
      color: 'success'
    }

    showDeleteDialog.value = false
    loadConsultationNotes()
  } catch (error) {
    console.error('Delete note error:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'Failed to delete consultation note',
      color: 'error'
    }
  } finally {
    deleting.value = false
  }
}

const closeDialog = () => {
  showAddDialog.value = false
  editingNote.value = null
  noteForm.value = {
    patientId: '',
    title: '',
    content: '',
    vitalSigns: '',
    symptoms: ''
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadConsultationNotes()
  loadPatients()
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
