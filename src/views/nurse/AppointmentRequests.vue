<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-calendar-check</v-icon>
            Appointment Requests
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="tab" class="mb-4">
              <v-tab>Calendar View</v-tab>
              <v-tab>Pending Requests</v-tab>
              <v-tab>All Requests</v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <v-tab-item>
                <div class="calendar-container">
                  <FullCalendar
                    ref="calendarRef"
                    :options="calendarOptions"
                    :events="calendarEvents"
                  />
                </div>
              </v-tab-item>

              <v-tab-item>
                <v-data-table
                  :headers="headers"
                  :items="pendingAppointments"
                  :loading="loading"
                  class="elevation-1"
                >
                  <template v-slot:item.dateTime="{ item }">
                    {{ formatDateTime(item.dateTime) }}
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon small color="success" @click="approveAppointment(item)">
                      <v-icon>mdi-check</v-icon>
                    </v-btn>
                    <v-btn icon small color="error" @click="rejectAppointment(item)">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-btn icon small @click="viewAppointment(item)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>

              <v-tab-item>
                <v-data-table
                  :headers="headers"
                  :items="allAppointments"
                  :loading="loading"
                  class="elevation-1"
                >
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      dark
                      small
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                  <template v-slot:item.dateTime="{ item }">
                    {{ formatDateTime(item.dateTime) }}
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon small @click="viewAppointment(item)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="item.status === 'pending'"
                      icon
                      small
                      color="success"
                      @click="approveAppointment(item)"
                    >
                      <v-icon>mdi-check</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="item.status === 'pending'"
                      icon
                      small
                      color="error"
                      @click="rejectAppointment(item)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Appointment Details Dialog -->
    <v-dialog v-model="showDetailsDialog" max-width="600px">
      <v-card v-if="selectedAppointment">
        <v-card-title>Appointment Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <strong>Patient:</strong> {{ selectedAppointment.patientName }}
            </v-col>
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
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDetailsDialog = false">Close</v-btn>
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
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const appointments = ref([])
const loading = ref(false)
const tab = ref(0)
const showDetailsDialog = ref(false)
const selectedAppointment = ref(null)

const headers = [
  { text: 'Patient', value: 'patientName' },
  { text: 'Date & Time', value: 'dateTime' },
  { text: 'Reason', value: 'reason' },
  { text: 'Status', value: 'status' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const pendingAppointments = computed(() => {
  return appointments.value.filter(app => app.status === 'pending')
})

const allAppointments = computed(() => {
  return appointments.value
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
      .select(`
        *,
        patients (
          firstName,
          lastName
        )
      `)
      .order('dateTime', { ascending: false })

    if (error) throw error

    appointments.value = data.map(item => ({
      ...item,
      patientName: `${item.patients?.firstName || ''} ${item.patients?.lastName || ''}`.trim()
    }))
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

const approveAppointment = async (appointment) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'approved' })
      .eq('id', appointment.id)

    if (error) throw error

    snackbar.value = {
      show: true,
      message: 'Appointment approved successfully',
      color: 'success'
    }

    loadAppointments()
  } catch (error) {
    console.error('Approve appointment error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to approve appointment',
      color: 'error'
    }
  }
}

const rejectAppointment = async (appointment) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id)

    if (error) throw error

    snackbar.value = {
      show: true,
      message: 'Appointment cancelled',
      color: 'warning'
    }

    loadAppointments()
  } catch (error) {
    console.error('Reject appointment error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to cancel appointment',
      color: 'error'
    }
  }
}

const viewAppointment = (appointment) => {
  selectedAppointment.value = appointment
  showDetailsDialog.value = true
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

// Calendar configuration
const calendarRef = ref(null)

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  initialView: 'dayGridMonth',
  editable: false,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  eventClick: handleEventClick,
  height: 'auto'
}))

const calendarEvents = computed(() => {
  return appointments.value.map(appointment => ({
    id: appointment.id,
    title: `${appointment.patientName} - ${appointment.reason}`,
    start: appointment.dateTime,
    backgroundColor: getEventColor(appointment.status),
    borderColor: getEventColor(appointment.status),
    extendedProps: {
      appointment: appointment
    }
  }))
})

const getEventColor = (status) => {
  switch (status) {
    case 'pending': return '#FF9800'
    case 'approved': return '#4CAF50'
    case 'completed': return '#2196F3'
    case 'cancelled': return '#F44336'
    default: return '#9E9E9E'
  }
}

const handleEventClick = (info) => {
  const appointment = info.event.extendedProps.appointment
  viewAppointment(appointment)
}

onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}

.calendar-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-header-toolbar) {
  margin-bottom: 1.5em !important;
}

:deep(.fc-button) {
  background: var(--primary-gradient-start) !important;
  border: none !important;
  color: white !important;
  text-transform: capitalize !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
  transition: all 0.3s ease !important;
}

:deep(.fc-button:hover) {
  background: var(--primary-gradient-end) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

:deep(.fc-button:not(:disabled).fc-button-active) {
  background: var(--primary-gradient-end) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.fc-daygrid-event) {
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.85em;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.fc-daygrid-event:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.fc-event-title) {
  font-weight: 500;
}

:deep(.fc-col-header-cell) {
  background: #f8f9fa;
  font-weight: 600;
  color: var(--text-color);
}

:deep(.fc-day-today) {
  background: rgba(33, 150, 243, 0.1) !important;
}

:deep(.fc-daygrid-day-number) {
  color: var(--text-color);
  font-weight: 500;
}

:deep(.fc-view-harness) {
  background: white;
  border-radius: 8px;
}
</style>
