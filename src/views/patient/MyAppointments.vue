<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-calendar-check</v-icon>
            My Appointments
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="$router.push('/patient/dashboard')">
              <v-icon left>mdi-plus</v-icon>
              Request New Appointment
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="tab" class="mb-4">
              <v-tab>All Appointments</v-tab>
              <v-tab>Upcoming</v-tab>
              <v-tab>Past</v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <v-tab-item>
                <v-data-table
                  :headers="headers"
                  :items="allAppointments"
                  :loading="loading"
                  class="elevation-1"
                >
                  <template v-slot:item.dateTime="{ item }">
                    {{ formatDateTime(item.dateTime) }}
                  </template>
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      dark
                      small
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon small @click="viewAppointment(item)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="item.status === 'pending'"
                      icon
                      small
                      color="error"
                      @click="cancelAppointment(item)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>

              <v-tab-item>
                <v-data-table
                  :headers="headers"
                  :items="upcomingAppointments"
                  :loading="loading"
                  class="elevation-1"
                >
                  <template v-slot:item.dateTime="{ item }">
                    {{ formatDateTime(item.dateTime) }}
                  </template>
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      dark
                      small
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon small @click="viewAppointment(item)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="item.status === 'pending'"
                      icon
                      small
                      color="error"
                      @click="cancelAppointment(item)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>

              <v-tab-item>
                <v-data-table
                  :headers="headers"
                  :items="pastAppointments"
                  :loading="loading"
                  class="elevation-1"
                >
                  <template v-slot:item.dateTime="{ item }">
                    {{ formatDateTime(item.dateTime) }}
                  </template>
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      dark
                      small
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon small @click="viewAppointment(item)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- View Appointment Dialog -->
    <v-dialog v-model="showViewDialog" max-width="600px">
      <v-card v-if="selectedAppointment">
        <v-card-title>Appointment Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <strong>Date & Time:</strong> {{ formatDateTime(selectedAppointment.dateTime) }}
            </v-col>
            <v-col cols="12">
              <strong>Reason:</strong> {{ selectedAppointment.reason }}
            </v-col>
            <v-col cols="12">
              <strong>Status:</strong>
              <v-chip :color="getStatusColor(selectedAppointment.status)" dark small class="ml-2">
                {{ selectedAppointment.status }}
              </v-chip>
            </v-col>
            <v-col cols="12">
              <strong>Requested:</strong> {{ formatDateTime(selectedAppointment.createdAt) }}
            </v-col>
            <v-col cols="12" v-if="selectedAppointment.status === 'approved'">
              <v-alert type="success" outlined>
                Your appointment has been approved. Please arrive 15 minutes early.
              </v-alert>
            </v-col>
            <v-col cols="12" v-if="selectedAppointment.status === 'cancelled'">
              <v-alert type="error" outlined>
                This appointment has been cancelled.
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showViewDialog = false">Close</v-btn>
          <v-btn
            v-if="selectedAppointment.status === 'pending'"
            color="error"
            @click="cancelAppointment(selectedAppointment); showViewDialog = false"
          >
            Cancel Appointment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel Confirmation Dialog -->
    <v-dialog v-model="showCancelDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirm Cancellation</v-card-title>
        <v-card-text>
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showCancelDialog = false">Keep Appointment</v-btn>
          <v-btn color="error" @click="confirmCancel" :loading="cancelling">
            Cancel Appointment
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/services/supabase'

const appointments = ref([])
const loading = ref(false)
const tab = ref(0)
const showViewDialog = ref(false)
const showCancelDialog = ref(false)
const selectedAppointment = ref(null)
const cancelling = ref(false)

const headers = [
  { text: 'Date & Time', value: 'dateTime' },
  { text: 'Reason', value: 'reason' },
  { text: 'Status', value: 'status' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const allAppointments = computed(() => {
  return appointments.value
})

const upcomingAppointments = computed(() => {
  return appointments.value.filter(app =>
    new Date(app.dateTime) > new Date() && app.status !== 'cancelled'
  )
})

const pastAppointments = computed(() => {
  return appointments.value.filter(app =>
    new Date(app.dateTime) <= new Date() || app.status === 'completed' || app.status === 'cancelled'
  )
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const loadAppointments = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patientId', 1) // TODO: Get from current user
      .order('dateTime', { ascending: false })

    if (error) throw error

    appointments.value = data
  } catch (error) {
    console.error('Load appointments error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to load appointments',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

const viewAppointment = (appointment) => {
  selectedAppointment.value = appointment
  showViewDialog.value = true
}

const cancelAppointment = (appointment) => {
  selectedAppointment.value = appointment
  showCancelDialog.value = true
}

const confirmCancel = async () => {
  cancelling.value = true
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', selectedAppointment.value.id)

    if (error) throw error

    snackbar.value = {
      show: true,
      message: 'Appointment cancelled successfully',
      color: 'warning'
    }

    showCancelDialog.value = false
    loadAppointments()
  } catch (error) {
    console.error('Cancel appointment error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to cancel appointment',
      color: 'error'
    }
  } finally {
    cancelling.value = false
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'completed': return 'primary'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString()
}

onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}
</style>
