<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-chart-bar</v-icon>
            Reports & Analytics
          </v-card-title>
          <v-card-text>
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
                    <div class="stat-number">{{ stats.totalAppointments }}</div>
                    <div class="stat-label">Total Appointments</div>
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
                    <div class="stat-number">{{ stats.pendingAppointments }}</div>
                    <div class="stat-label">Pending Appointments</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row class="mt-6">
              <v-col cols="12">
                <v-card>
                  <v-card-title>Export Data</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="3">
                        <v-btn color="primary" block @click="exportPatients" :loading="exporting.patients">
                          <v-icon left>mdi-download</v-icon>
                          Export Patients (CSV)
                        </v-btn>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-btn color="primary" block @click="exportAppointments" :loading="exporting.appointments">
                          <v-icon left>mdi-download</v-icon>
                          Export Appointments (CSV)
                        </v-btn>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-btn color="primary" block @click="exportMedicalRecords" :loading="exporting.medicalRecords">
                          <v-icon left>mdi-download</v-icon>
                          Export Medical Records (CSV)
                        </v-btn>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-btn color="primary" block @click="exportStaff" :loading="exporting.staff">
                          <v-icon left>mdi-download</v-icon>
                          Export Staff (CSV)
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row class="mt-6">
              <v-col cols="12" md="6">
                <v-card>
                  <v-card-title>Appointments by Status</v-card-title>
                  <v-card-text>
                    <v-simple-table>
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th>Count</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(status, index) in appointmentStatusStats" :key="index">
                            <td>{{ status.status }}</td>
                            <td>{{ status.count }}</td>
                            <td>{{ status.percentage }}%</td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-card-text>
                </v-card>
              </v-col>
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
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
import Papa from 'papaparse'

const stats = ref({
  totalPatients: 0,
  totalAppointments: 0,
  totalStaff: 0,
  pendingAppointments: 0
})

const appointmentStatusStats = ref([])
const recentActivities = ref([])
const exporting = ref({
  patients: false,
  appointments: false,
  medicalRecords: false,
  staff: false
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const loadStats = async () => {
  try {
    // Load basic stats
    const [patientsResult, appointmentsResult, staffResult] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id, status', { count: 'exact' }),
      supabase.from('staff').select('id', { count: 'exact', head: true })
    ])

    stats.value.totalPatients = patientsResult.count || 0
    stats.value.totalAppointments = appointmentsResult.count || 0
    stats.value.totalStaff = staffResult.count || 0

    // Calculate pending appointments
    const pendingAppointments = appointmentsResult.data?.filter(app => app.status === 'pending') || []
    stats.value.pendingAppointments = pendingAppointments.length

    // Load appointment status stats
    const statusCounts = {}
    appointmentsResult.data?.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1
    })

    appointmentStatusStats.value = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: ((count / stats.value.totalAppointments) * 100).toFixed(1)
    }))

    // Load recent activities (mock data for now)
    recentActivities.value = [
      { date: new Date(), description: 'New patient registered' },
      { date: new Date(Date.now() - 3600000), description: 'Appointment scheduled' },
      { date: new Date(Date.now() - 7200000), description: 'Medical record updated' }
    ]
  } catch (error) {
    console.error('Load stats error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to load statistics',
      color: 'error'
    }
  }
}

const exportPatients = async () => {
  exporting.value.patients = true
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')

    if (error) throw error

    const csv = Papa.unparse(data)
    downloadCSV(csv, 'patients.csv')
  } catch (error) {
    console.error('Export patients error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to export patients',
      color: 'error'
    }
  } finally {
    exporting.value.patients = false
  }
}

const exportAppointments = async () => {
  exporting.value.appointments = true
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')

    if (error) throw error

    const csv = Papa.unparse(data)
    downloadCSV(csv, 'appointments.csv')
  } catch (error) {
    console.error('Export appointments error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to export appointments',
      color: 'error'
    }
  } finally {
    exporting.value.appointments = false
  }
}

const exportMedicalRecords = async () => {
  exporting.value.medicalRecords = true
  try {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')

    if (error) throw error

    const csv = Papa.unparse(data)
    downloadCSV(csv, 'medical_records.csv')
  } catch (error) {
    console.error('Export medical records error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to export medical records',
      color: 'error'
    }
  } finally {
    exporting.value.medicalRecords = false
  }
}

const exportStaff = async () => {
  exporting.value.staff = true
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')

    if (error) throw error

    const csv = Papa.unparse(data)
    downloadCSV(csv, 'staff.csv')
  } catch (error) {
    console.error('Export staff error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to export staff',
      color: 'error'
    }
  } finally {
    exporting.value.staff = false
  }
}

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #1976d2;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-top: 4px;
}

.v-card {
  margin-top: 20px;
}
</style>
