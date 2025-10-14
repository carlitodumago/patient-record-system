<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Patient Dashboard</h1>
      </v-col>
    </v-row>

    <!-- Welcome Message -->
    <v-row>
      <v-col cols="12">
        <v-card class="welcome-card">
          <v-card-text>
            <h2 class="text-h5 mb-2">Welcome back, {{ patientInfo.firstName }}!</h2>
            <p class="text-body-1">Here's an overview of your health information and upcoming appointments.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-number">{{ stats.totalAppointments }}</div>
            <div class="stat-label">Total Appointments</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-number">{{ stats.upcomingAppointments }}</div>
            <div class="stat-label">Upcoming Appointments</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-number">{{ stats.unreadNotifications }}</div>
            <div class="stat-label">Unread Notifications</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-btn color="primary" block @click="$router.push('/patient/appointments')">
                  <v-icon left>mdi-calendar-check</v-icon>
                  My Appointments
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn color="secondary" block @click="$router.push('/patient/medical-records')">
                  <v-icon left>mdi-clipboard-text</v-icon>
                  Medical Records
                </v-btn>
              </v-col>
              <v-col cols="12" md="6" class="mt-2">
                <v-btn color="success" block @click="$router.push('/patient/notifications')">
                  <v-icon left>mdi-bell</v-icon>
                  Notifications
                </v-btn>
              </v-col>
              <v-col cols="12" md="6" class="mt-2">
                <v-btn color="info" block @click="requestAppointment">
                  <v-icon left>mdi-plus</v-icon>
                  Request Appointment
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Upcoming Appointments</v-card-title>
          <v-card-text>
            <v-timeline dense v-if="upcomingAppointments.length > 0">
              <v-timeline-item
                v-for="(appointment, index) in upcomingAppointments"
                :key="index"
                small
              >
                <template v-slot:opposite>
                  <span class="text-caption">{{ formatDateTime(appointment.dateTime) }}</span>
                </template>
                <div class="text-caption">
                  <strong>{{ appointment.reason }}</strong><br>
                  <v-chip :color="getStatusColor(appointment.status)" dark x-small>
                    {{ appointment.status }}
                  </v-chip>
                </div>
              </v-timeline-item>
            </v-timeline>
            <div v-else class="text-center text-muted">
              No upcoming appointments
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title>Recent Activity</v-card-title>
          <v-card-text>
            <v-timeline dense>
              <v-timeline-item
                v-for="(activity, index) in recentActivities"
                :key="index"
                small
              >
                <template v-slot:opposite>
                  <span class="text-caption">{{ formatDate(activity.date) }}</span>
                </template>
                <div class="text-caption">
                  {{ activity.description }}
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Request Appointment Dialog -->
    <v-dialog v-model="showAppointmentDialog" max-width="600px">
      <v-card>
        <v-card-title>Request New Appointment</v-card-title>
        <v-card-text>
          <v-form ref="appointmentForm" v-model="appointmentValid">
            <v-text-field
              v-model="appointmentRequest.dateTime"
              type="datetime-local"
              label="Preferred Date & Time"
              required
              :rules="[v => !!v || 'Date and time are required']"
            ></v-text-field>
            <v-textarea
              v-model="appointmentRequest.reason"
              label="Reason for Visit"
              rows="3"
              required
              :rules="[v => !!v || 'Reason is required']"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showAppointmentDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitAppointmentRequest" :loading="submitting" :disabled="!appointmentValid">
            Submit Request
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

const patientInfo = ref({
  firstName: 'Patient',
  lastName: ''
})

const stats = ref({
  totalAppointments: 0,
  upcomingAppointments: 0,
  unreadNotifications: 0
})

const upcomingAppointments = ref([])
const recentActivities = ref([
  { date: new Date(), description: 'Medical record updated' },
  { date: new Date(Date.now() - 86400000), description: 'Appointment scheduled' },
  { date: new Date(Date.now() - 172800000), description: 'Consultation completed' }
])

const showAppointmentDialog = ref(false)
const submitting = ref(false)
const appointmentValid = ref(false)

const appointmentRequest = ref({
  dateTime: '',
  reason: ''
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const loadPatientInfo = async () => {
  try {
    // TODO: Get current patient info from auth store
    const { data, error } = await supabase
      .from('patients')
      .select('firstName, lastName')
      .eq('id', 1) // TODO: Get from current user

    if (error) throw error

    if (data && data.length > 0) {
      patientInfo.value = data[0]
    }
  } catch (error) {
    console.error('Load patient info error:', error)
  }
}

const loadStats = async () => {
  try {
    const patientId = 1 // TODO: Get from current user

    const [appointmentsResult, notificationsResult] = await Promise.all([
      supabase.from('appointments').select('id, dateTime, status').eq('patientId', patientId),
      supabase.from('notifications').select('id, read').eq('recipientId', patientId)
    ])

    stats.value.totalAppointments = appointmentsResult.data?.length || 0
    stats.value.upcomingAppointments = appointmentsResult.data?.filter(app =>
      new Date(app.dateTime) > new Date() && app.status !== 'cancelled'
    ).length || 0
    stats.value.unreadNotifications = notificationsResult.data?.filter(notif => !notif.read).length || 0

    upcomingAppointments.value = appointmentsResult.data?.filter(app =>
      new Date(app.dateTime) > new Date() && app.status !== 'cancelled'
    ).slice(0, 5) || []
  } catch (error) {
    console.error('Load stats error:', error)
  }
}

const requestAppointment = () => {
  showAppointmentDialog.value = true
}

const submitAppointmentRequest = async () => {
  if (!appointmentValid.value) return

  submitting.value = true
  try {
    const appointmentData = {
      patientId: 1, // TODO: Get from current user
      dateTime: appointmentRequest.value.dateTime,
      reason: appointmentRequest.value.reason,
      status: 'pending'
    }

    const { error } = await supabase
      .from('appointments')
      .insert([appointmentData])

    if (error) throw error

    snackbar.value = {
      show: true,
      message: 'Appointment request submitted successfully',
      color: 'success'
    }

    showAppointmentDialog.value = false
    appointmentRequest.value = {
      dateTime: '',
      reason: ''
    }
    loadStats()
  } catch (error) {
    console.error('Submit appointment request error:', error)
    snackbar.value = {
      show: true,
      message: error.message || 'Failed to submit appointment request',
      color: 'error'
    }
  } finally {
    submitting.value = false
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

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString()
}

onMounted(() => {
  loadPatientInfo()
  loadStats()
})
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1976d2;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-top: 8px;
}

.v-card {
  margin-top: 20px;
}

.text-muted {
  color: #666;
  font-style: italic;
}
</style>
