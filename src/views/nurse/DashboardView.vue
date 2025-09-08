<template>
  <div class="container-fluid mt-3">
    <h1 class="mb-2">Nurse Dashboard</h1>
    <p class="text-muted">Patient management and clinical overview</p>
    
    <div class="row mt-4">
      <div class="col-md-4 mb-4">
        <div class="card bg-primary text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">150</h5>
              <p class="card-text">Total Records</p>
            </div>
            <i class="bi bi-file-earmark-text display-4"></i>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card bg-success text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">25</h5>
              <p class="card-text">Active Patients</p>
            </div>
            <i class="bi bi-people display-4"></i>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card bg-warning text-dark">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">10</h5>
              <p class="card-text">Today's Appointments</p>
            </div>
            <i class="bi bi-calendar-check display-4"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Recent Patients</h5>
            <button class="btn btn-sm btn-primary">
              <i class="bi bi-plus-circle me-1"></i> Add Patient
            </button>
          </div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Last Visit</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>03/06/2025</td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td>03/05/2025</td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>Michael Johnson</td>
                  <td>02/28/2025</td>
                  <td><span class="badge bg-warning text-dark">Follow-up</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Today's Schedule</h5>
          </div>
          <div class="card-body">
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>9:00 AM</strong>
                  <div>John Doe - Annual Physical</div>
                </div>
                <span class="badge bg-primary rounded-pill">Confirmed</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>10:30 AM</strong>
                  <div>Jane Smith - Follow-up</div>
                </div>
                <span class="badge bg-primary rounded-pill">Confirmed</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>11:00 AM</strong>
                  <div>Michael Johnson - Blood Test</div>
                </div>
                <span class="badge bg-warning text-dark rounded-pill">Pending</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>2:00 PM</strong>
                  <div>Sarah Williams - Consultation</div>
                </div>
                <span class="badge bg-primary rounded-pill">Confirmed</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>3:30 PM</strong>
                  <div>Robert Brown - Vaccination</div>
                </div>
                <span class="badge bg-primary rounded-pill">Confirmed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Recent Medical Records</h5>
            <a href="/records" class="btn btn-sm btn-outline-primary">View All Records</a>
          </div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Record ID</th>
                  <th scope="col">Patient</th>
                  <th scope="col">Type</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PR-001</td>
                  <td>John Doe</td>
                  <td>Visit</td>
                  <td>03/06/2025 10:30</td>
                  <td><span class="badge bg-success">Verified</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>PR-002</td>
                  <td>Jane Smith</td>
                  <td>History</td>
                  <td>03/05/2025 14:00</td>
                  <td><span class="badge bg-warning text-dark">Pending</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>PR-003</td>
                  <td>Michael Johnson</td>
                  <td>Lab Results</td>
                  <td>03/04/2025 09:15</td>
                  <td><span class="badge bg-info text-dark">New</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { usePatientStore } from '../../stores/patients';

const userStore = useUserStore();
const patientStore = usePatientStore();
const router = useRouter();

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

.bg-primary, .bg-success, .bg-warning, .bg-info {
  border: none;
}

.bi {
  opacity: 0.7;
}
</style>