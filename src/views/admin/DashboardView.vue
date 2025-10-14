<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Admin Dashboard</h1>
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
            <div class="stat-number">{{ stats.totalStaff }}</div>
            <div class="stat-label">Total Staff</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="stat-number">{{ stats.totalAppointments }}</div>
            <div class="stat-label">Total Appointments</div>
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
    </v-row>

    <!-- Recent Activity -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
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

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-btn color="primary" block @click="$router.push('/admin/account-creation')">
                  <v-icon left>mdi-account-plus</v-icon>
                  Create Account
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn color="secondary" block @click="$router.push('/admin/manage-staff')">
                  <v-icon left>mdi-account-group</v-icon>
                  Manage Staff
                </v-btn>
              </v-col>
              <v-col cols="12" md="6" class="mt-2">
                <v-btn color="info" block @click="$router.push('/admin/manage-patients')">
                  <v-icon left>mdi-account-multiple</v-icon>
                  Manage Patients
                </v-btn>
              </v-col>
              <v-col cols="12" md="6" class="mt-2">
                <v-btn color="success" block @click="$router.push('/admin/reports')">
                  <v-icon left>mdi-chart-bar</v-icon>
                  View Reports
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- System Health -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title>System Health</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-alert type="success" outlined>
                  <strong>Database:</strong> Connected
                </v-alert>
              </v-col>
              <v-col cols="12" md="4">
                <v-alert type="success" outlined>
                  <strong>Email Service:</strong> Operational
                </v-alert>
              </v-col>
              <v-col cols="12" md="4">
                <v-alert type="success" outlined>
                  <strong>SMS Service:</strong> Operational
                </v-alert>
              </v-col>
            </v-row>
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
  totalStaff: 0,
  totalAppointments: 0,
  pendingAppointments: 0
})

const recentActivities = ref([
  { date: new Date(), description: 'New patient registered' },
  { date: new Date(Date.now() - 3600000), description: 'Appointment scheduled' },
  { date: new Date(Date.now() - 7200000), description: 'Medical record updated' },
  { date: new Date(Date.now() - 10800000), description: 'Staff account created' }
])

const loadStats = async () => {
  try {
    const [patientsResult, staffResult, appointmentsResult] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('staff').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id, status', { count: 'exact' })
    ])

    stats.value.totalPatients = patientsResult.count || 0
    stats.value.totalStaff = staffResult.count || 0
    stats.value.totalAppointments = appointmentsResult.count || 0

    const pendingAppointments = appointmentsResult.data?.filter(app => app.status === 'pending') || []
    stats.value.pendingAppointments = pendingAppointments.length
  } catch (error) {
    console.error('Load stats error:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
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
</style>
