<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Nurse Dashboard</h1>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-number">{{ stats.totalPatients }}</div>
            <div class="stat-label">Total Patients</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-number">{{ stats.pendingAppointments }}</div>
            <div class="stat-label">Pending Appointments</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-number">{{ stats.todayAppointments }}</div>
            <div class="stat-label">Today's Appointments</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
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
                <v-btn color="primary" block @click="$router.push('/nurse/patient-management')">
                  <v-icon left>mdi-account-multiple</v-icon>
                  Manage Patients
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn color="secondary" block @click="$router.push('/nurse/appointment-requests')">
                  <v-icon left>mdi-calendar-check</v-icon>
                  Appointment Requests
                </v-btn>
              </v-col>
              <v-col cols="12" md="6" class="mt-2">
                <v-btn color="success" block @click="$router.push('/nurse/medical-records')">
                  <v-icon left>mdi-clipboard-text</v-icon>
                  Medical Records
                </v-btn>
              </v-col>
              <v-col cols="12" md="6" class="mt-2">
                <v-btn color="info" block @click="$router.push('/nurse/notifications')">
                  <v-icon left>mdi-bell</v-icon>
                  Notifications
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Today's Appointments</v-card-title>
          <v-card-text>
            <v-timeline dense v-if="todayAppointments.length > 0">
              <v-timeline-item
                v-for="(appointment, index) in todayAppointments"
                :key="index"
                small
              >
                <template v-slot:opposite>
                  <span class="text-caption">{{ formatTime(appointment.dateTime) }}</span>
                </template>
                <div class="text-caption">
                  <strong>{{ appointment.patientName }}</strong><br>
                  {{ appointment.reason }}
                </div>
              </v-timeline-item>
            </v-timeline>
            <div v-else class="text-center text-muted">
              No appointments scheduled for today
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
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const stats = ref({
  totalPatients: 0,
  pendingAppointments: 0,
  todayAppointments: 0,
  unreadNotifications: 0
})

const todayAppointments = ref([])
const recentActivities = ref([
  { date: new Date(), description: 'Medical record updated' },
  { date: new Date(Date.now() - 3600000), description: 'Appointment approved' },
  { date: new Date(Date.now() - 7200000), description: 'Patient consultation completed' },
  { date: new Date(Date.now() - 10800000), description: 'New appointment request received' }
])

const loadStats = async () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [patientsResult, appointmentsResult, todayAppointmentsResult, notificationsResult] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id, status', { count: 'exact' }),
      supabase.from('appointments').select('*, patients(firstName, lastName)').gte('dateTime', today.toISOString()).lt('dateTime', tomorrow.toISOString()),
      supabase.from('notifications').select('id, read', { count: 'exact' })
    ])

    stats.value.totalPatients = patientsResult.count || 0
    stats.value.pendingAppointments = appointmentsResult.data?.filter(app => app.status === 'pending').length || 0
    stats.value.todayAppointments = todayAppointmentsResult.data?.length || 0
    stats.value.unreadNotifications = notificationsResult.data?.filter(notif => !notif.read).length || 0

    todayAppointments.value = todayAppointmentsResult.data?.map(app => ({
      ...app,
      patientName: `${app.patients?.firstName || ''} ${app.patients?.lastName || ''}`.trim()
    })) || []
  } catch (error) {
    console.error('Load stats error:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

const formatTime = (dateTime) => {
  return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
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
