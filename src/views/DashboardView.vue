<template>
  <v-container fluid class="mt-3">
    <h1 class="mb-2">Admin Dashboard</h1>
    <p class="text-body-2">System overview and management</p>

    <!-- Overview Stats -->
    <v-row class="mt-4">
      <v-col cols="12" md="3" class="mb-4">
        <v-card color="primary" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">{{ stats.totalRecords }}</div>
              <div class="text-body-2">Total Records</div>
            </div>
            <v-icon size="48" class="opacity-75">mdi-file-document-outline</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="mb-4">
        <v-card color="success" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">{{ stats.activePatients }}</div>
              <div class="text-body-2">Active Patients</div>
            </div>
            <v-icon size="48" class="opacity-75">mdi-account-group</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="mb-4">
        <v-card color="warning" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">{{ stats.pendingReviews }}</div>
              <div class="text-body-2">Pending Reviews</div>
            </div>
            <v-icon size="48" class="opacity-75">mdi-clock-outline</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="mb-4">
        <v-card color="info" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">{{ stats.todayAppointments }}</div>
              <div class="text-body-2">Today's Appointments</div>
            </div>
            <v-icon size="48" class="opacity-75">mdi-calendar-check</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Records and Recent Activities -->
    <v-row class="mt-4">
      <v-col cols="12" md="8" class="mb-4">
        <v-card>
          <v-card-title>Recent Records</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="records"
              hide-default-footer
              class="elevation-1"
            >
              <template v-slot:item.status="{ item }">
                <v-chip :color="item.status === 'Verified' ? 'success' : 'warning'" dark>
                  {{ item.status }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="mb-4">
        <v-card>
          <v-card-title>Recent Activities</v-card-title>
          <v-card-text>
            <v-timeline density="compact">
              <v-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :dot-color="activity.color"
                size="small"
              >
                <div class="text-caption">{{ activity.time }}</div>
                <div class="text-body-2">{{ activity.description }}</div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3" class="mb-2">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-account-plus"
                  block
                  :to="'/admin/users/new'"
                >
                  Add User
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3" class="mb-2">
                <v-btn
                  color="success"
                  prepend-icon="mdi-account-group"
                  block
                  :to="'/patients/new'"
                >
                  Add Patient
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3" class="mb-2">
                <v-btn
                  color="info"
                  prepend-icon="mdi-calendar-plus"
                  block
                  :to="'/appointments/new'"
                >
                  Schedule Appointment
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3" class="mb-2">
                <v-btn
                  color="warning"
                  prepend-icon="mdi-file-chart"
                  block
                  :to="'/reports'"
                >
                  View Reports
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'DashboardView',
  data() {
    return {
      stats: {
        totalRecords: 150,
        activePatients: 25,
        pendingReviews: 10,
        todayAppointments: 8
      },
      headers: [
        { title: 'Record ID', key: 'id' },
        { title: 'Type', key: 'type' },
        { title: 'Patient Name', key: 'patientName' },
        { title: 'Date', key: 'date' },
        { title: 'Status', key: 'status' },
      ],
      records: [
        {
          id: 'PR-001',
          type: 'Visit',
          patientName: 'John Doe',
          date: '03/06/2025 10:30',
          status: 'Verified',
        },
        {
          id: 'PR-002',
          type: 'History',
          patientName: 'Jane Smith',
          date: '03/05/2025 14:00',
          status: 'Pending',
        },
      ],
      recentActivities: [
        {
          id: 1,
          time: '2 hours ago',
          description: 'New patient John Doe registered',
          color: 'success'
        },
        {
          id: 2,
          time: '4 hours ago',
          description: 'Medical record updated for Jane Smith',
          color: 'info'
        },
        {
          id: 3,
          time: '6 hours ago',
          description: 'Appointment scheduled for Michael Johnson',
          color: 'primary'
        },
        {
          id: 4,
          time: '1 day ago',
          description: 'User account created for Dr. Martinez',
          color: 'warning'
        }
      ]
    }
  },
}
</script>

<style scoped>
/* Add your styles here */

</style> 