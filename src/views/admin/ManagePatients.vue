<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-account-multiple</v-icon>
            Manage Patients
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
                <v-btn icon small @click="$router.push(`/patients/${item.id}/edit`)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon small color="error" @click="deletePatient(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete {{ selectedPatient?.firstName }} {{ selectedPatient?.lastName }}?
          This action cannot be undone.
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

const patients = ref([])
const loading = ref(false)
const search = ref('')
const showDeleteDialog = ref(false)
const selectedPatient = ref(null)
const deleting = ref(false)

const headers = [
  { text: 'Name', value: 'fullName' },
  { text: 'Email', value: 'email' },
  { text: 'Contact', value: 'contactNumber' },
  { text: 'Address', value: 'address' },
  { text: 'Gender', value: 'gender' },
  { text: 'Birth Date', value: 'birthDate' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const loadPatients = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    patients.value = data.map(item => ({
      ...item,
      fullName: `${item.firstName} ${item.middleName ? item.middleName + ' ' : ''}${item.lastName}`,
      birthDate: new Date(item.birthDate).toLocaleDateString()
    }))
  } catch (error) {
    console.error('Load patients error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to load patients',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

const deletePatient = (item) => {
  selectedPatient.value = item
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', selectedPatient.value.id)

    if (error) throw error

    snackbar.value = {
      show: true,
      message: 'Patient deleted successfully',
      color: 'success'
    }

    showDeleteDialog.value = false
    loadPatients()
  } catch (error) {
    console.error('Delete patient error:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'Failed to delete patient',
      color: 'error'
    }
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadPatients()
})
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}
</style>
