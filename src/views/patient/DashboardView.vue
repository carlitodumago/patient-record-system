<template>
  <v-container fluid class="mt-3">
    <h1 class="mb-2">Patient Dashboard</h1>
    <p class="text-body-2">Welcome to your health portal</p>

    <v-row class="mt-4">
      <v-col cols="12" md="4" class="mb-4">
        <v-card color="primary" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">5</div>
              <div class="text-body-2">Medical Records</div>
            </div>
            <v-icon size="48" class="opacity-75">mdi-file-document</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="mb-4">
        <v-card color="info" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">2</div>
              <div class="text-body-2">Upcoming Appointments</div>
            </div>
            <v-icon size="48" class="opacity-75">mdi-calendar-check</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="mb-4">
        <v-card color="success" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">3</div>
              <div class="text-body-2">New Notifications</div>
            </div>
            <v-icon size="48" class="opacity-75">mdi-bell</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6" class="mb-4">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Upcoming Appointments</span>
            <v-btn size="small" color="primary" prepend-icon="mdi-calendar-plus" :to="'/calendar'">
              Schedule New
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Annual Physical</v-list-item-title>
                  <v-list-item-subtitle>March 15, 2025 - 10:00 AM</v-list-item-subtitle>
                  <div class="text-caption">Dr. Smith</div>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn-group>
                    <v-btn size="small" variant="outlined" color="primary">Details</v-btn>
                    <v-btn size="small" variant="outlined" color="error">Cancel</v-btn>
                  </v-btn-group>
                </v-list-item-action>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Follow-up Consultation</v-list-item-title>
                  <v-list-item-subtitle>April 2, 2025 - 2:30 PM</v-list-item-subtitle>
                  <div class="text-caption">Dr. Johnson</div>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn-group>
                    <v-btn size="small" variant="outlined" color="primary">Details</v-btn>
                    <v-btn size="small" variant="outlined" color="error">Cancel</v-btn>
                  </v-btn-group>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div class="text-center mt-3">
              <v-btn variant="text" :to="'/calendar'">View All Appointments</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="mb-4">
        <v-card>
          <v-card-title>Recent Notifications</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Appointment Reminder</v-list-item-title>
                  <v-list-item-subtitle>Your appointment with Dr. Smith is scheduled for tomorrow at 10:00 AM.</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <span class="text-caption">1 day ago</span>
                </v-list-item-action>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Medical Record Updated</v-list-item-title>
                  <v-list-item-subtitle>Your medical record has been updated with recent lab results.</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <span class="text-caption">3 days ago</span>
                </v-list-item-action>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Prescription Refill</v-list-item-title>
                  <v-list-item-subtitle>Your prescription refill request has been approved.</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <span class="text-caption">1 week ago</span>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div class="text-center mt-3">
              <v-btn variant="text" :to="'/notifications'">View All Notifications</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Health Tips Banner -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-banner
          color="info"
          lines="two"
          class="mb-4"
        >
          <template v-slot:prepend>
            <v-avatar color="info" size="40">
              <v-icon color="white">mdi-heart-pulse</v-icon>
            </v-avatar>
          </template>
          <v-banner-text>
            <strong>Health Tip of the Day:</strong> Regular exercise can help maintain healthy blood pressure levels. Aim for at least 150 minutes of moderate aerobic activity per week.
          </v-banner-text>
          <template v-slot:actions>
            <v-btn color="info" variant="text" size="small">
              Learn More
            </v-btn>
          </template>
        </v-banner>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="8" class="mb-4">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Recent Medical Records</span>
            <v-btn size="small" variant="outlined" color="primary" :to="'/records'">View All Records</v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="recordHeaders"
              :items="recentRecords"
              hide-default-footer
              class="elevation-1"
            >
              <template v-slot:item.condition="{ item }">
                <div class="font-weight-medium">{{ item.condition }}</div>
              </template>
              <template v-slot:item.diagnosis="{ item }">
                <div class="text-body-2">{{ item.diagnosis }}</div>
              </template>
              <template v-slot:item.treatment="{ item }">
                <div class="text-body-2">{{ item.treatment }}</div>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn size="small" variant="outlined" color="primary" :to="`/records/${item.id}`">
                  <v-icon>mdi-eye</v-icon>
                  View Details
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="mb-4">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-btn-group vertical class="d-block">
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-calendar-plus" :to="'/calendar'" block>
                Schedule Appointment
              </v-btn>
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-file-document" :to="'/records'" block>
                View Medical Records
              </v-btn>
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-account" :to="'/profile'" block>
                Update Profile
              </v-btn>
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-cog" :to="'/settings'" block>
                Account Settings
              </v-btn>
            </v-btn-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

// Current user
const currentUser = computed(() => store.state.user);

// Record table headers and data
const recordHeaders = ref([
  { title: 'Condition', key: 'condition' },
  { title: 'Diagnosis', key: 'diagnosis' },
  { title: 'Treatment', key: 'treatment' },
  { title: 'Date', key: 'date' },
  { title: 'Physician', key: 'physician' },
  { title: 'Actions', key: 'actions', sortable: false }
]);

const recentRecords = ref([
  {
    id: 1,
    condition: 'Hypertension',
    diagnosis: 'Stage 1 Hypertension',
    treatment: 'Prescribed Lisinopril 10mg daily',
    date: '10/05/2023',
    physician: 'Dr. Smith'
  },
  {
    id: 2,
    condition: 'Annual Physical',
    diagnosis: 'Healthy with minor concerns about blood pressure',
    treatment: 'Monitor blood pressure weekly',
    date: '09/15/2023',
    physician: 'Dr. Johnson'
  },
  {
    id: 3,
    condition: 'Diabetes Check',
    diagnosis: 'Pre-diabetic condition',
    treatment: 'Dietary changes and exercise recommended',
    date: '08/20/2023',
    physician: 'Dr. Martinez'
  }
]);

onMounted(() => {
  // Initialize dashboard data
  // Could fetch real data from API here
});
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.bg-primary, .bg-success, .bg-info {
  border: none;
}

.bi {
  opacity: 0.7;
}

.medical-record {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #0d6efd;
}
</style>