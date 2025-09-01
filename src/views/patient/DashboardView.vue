<template>
  <div class="container-fluid mt-3">
    <h1 class="mb-2">Patient Dashboard</h1>
    <p class="text-muted">Welcome to your health portal</p>
    
    <div class="row mt-4">
      <div class="col-md-4 mb-4">
        <div class="card bg-primary text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">5</h5>
              <p class="card-text">Medical Records</p>
            </div>
            <i class="bi bi-file-earmark-medical display-4"></i>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card bg-info text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">2</h5>
              <p class="card-text">Upcoming Appointments</p>
            </div>
            <i class="bi bi-calendar-check display-4"></i>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card bg-success text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">3</h5>
              <p class="card-text">New Notifications</p>
            </div>
            <i class="bi bi-bell display-4"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Upcoming Appointments</h5>
            <a href="/calendar" class="btn btn-sm btn-primary">
              <i class="bi bi-calendar-plus me-1"></i> Schedule New
            </a>
          </div>
          <div class="card-body">
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Annual Physical</strong>
                  <div class="text-muted">March 15, 2025 - 10:00 AM</div>
                  <div class="small">Dr. Smith</div>
                </div>
                <div>
                  <button class="btn btn-sm btn-outline-primary me-1">Details</button>
                  <button class="btn btn-sm btn-outline-danger">Cancel</button>
                </div>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Follow-up Consultation</strong>
                  <div class="text-muted">April 2, 2025 - 2:30 PM</div>
                  <div class="small">Dr. Johnson</div>
                </div>
                <div>
                  <button class="btn btn-sm btn-outline-primary me-1">Details</button>
                  <button class="btn btn-sm btn-outline-danger">Cancel</button>
                </div>
              </li>
            </ul>
            <div class="text-center mt-3">
              <a href="/calendar" class="btn btn-link">View All Appointments</a>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Recent Notifications</h5>
          </div>
          <div class="card-body">
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Appointment Reminder</strong>
                  <div class="small">Your appointment with Dr. Smith is scheduled for tomorrow at 10:00 AM.</div>
                </div>
                <span class="text-muted small">1 day ago</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Medical Record Updated</strong>
                  <div class="small">Your medical record has been updated with recent lab results.</div>
                </div>
                <span class="text-muted small">3 days ago</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Prescription Refill</strong>
                  <div class="small">Your prescription refill request has been approved.</div>
                </div>
                <span class="text-muted small">1 week ago</span>
              </li>
            </ul>
            <div class="text-center mt-3">
              <a href="/notifications" class="btn btn-link">View All Notifications</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-8 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Recent Medical Records</h5>
            <a href="/records" class="btn btn-sm btn-outline-primary">View All Records</a>
          </div>
          <div class="card-body">
            <div class="medical-record mb-3">
              <div class="d-flex justify-content-between align-items-start">
                <h6 class="mb-1">Hypertension</h6>
                <span class="text-muted small">10/05/2023</span>
              </div>
              <div class="small mb-1"><strong>Diagnosis:</strong> Stage 1 Hypertension</div>
              <div class="small mb-1"><strong>Treatment:</strong> Prescribed Lisinopril 10mg daily</div>
              <div class="small text-muted"><strong>Physician:</strong> Dr. Smith</div>
            </div>
            <hr>
            <div class="medical-record mb-3">
              <div class="d-flex justify-content-between align-items-start">
                <h6 class="mb-1">Annual Physical</h6>
                <span class="text-muted small">09/15/2023</span>
              </div>
              <div class="small mb-1"><strong>Diagnosis:</strong> Healthy with minor concerns about blood pressure</div>
              <div class="small mb-1"><strong>Treatment:</strong> Monitor blood pressure weekly</div>
              <div class="small text-muted"><strong>Physician:</strong> Dr. Johnson</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <a href="/calendar" class="btn btn-outline-primary">
                <i class="bi bi-calendar-plus me-2"></i> Schedule Appointment
              </a>
              <a href="/records" class="btn btn-outline-primary">
                <i class="bi bi-file-earmark-text me-2"></i> View Medical Records
              </a>
              <a href="/profile" class="btn btn-outline-primary">
                <i class="bi bi-person me-2"></i> Update Profile
              </a>
              <a href="/settings" class="btn btn-outline-primary">
                <i class="bi bi-gear me-2"></i> Account Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

// Current user
const currentUser = computed(() => store.state.user);

// You can add reactive data and methods here

onMounted(() => {
  // Initialize dashboard data
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