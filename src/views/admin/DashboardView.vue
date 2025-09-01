<template>
  <div class="container-fluid mt-3">
    <h1 class="mb-2">Admin Dashboard</h1>
    <p class="text-muted">System overview and management</p>
    
    <div class="row mt-4">
      <div class="col-md-3 mb-4">
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
      
      <div class="col-md-3 mb-4">
        <div class="card bg-success text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">25</h5>
              <p class="card-text">Total Patients</p>
            </div>
            <i class="bi bi-people display-4"></i>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-4">
        <div class="card bg-info text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">8</h5>
              <p class="card-text">Staff Members</p>
            </div>
            <i class="bi bi-person-badge display-4"></i>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-4">
        <div class="card bg-warning text-dark">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">10</h5>
              <p class="card-text">Pending Reviews</p>
            </div>
            <i class="bi bi-clock-history display-4"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">System Users</h5>
            <button class="btn btn-sm btn-primary">
              <i class="bi bi-plus-circle me-1"></i> Add User
            </button>
          </div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Smith</td>
                  <td>Admin</td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>Sarah Johnson</td>
                  <td>Nurse</td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
                <tr>
                  <td>Michael Brown</td>
                  <td>Patient</td>
                  <td><span class="badge bg-secondary">Inactive</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
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
            <h5 class="mb-0">System Activity</h5>
          </div>
          <div class="card-body">
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>New patient registered</strong>
                  <div class="text-muted small">Jane Doe</div>
                </div>
                <span class="text-muted small">10 minutes ago</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Medical record updated</strong>
                  <div class="text-muted small">Patient ID: 12345</div>
                </div>
                <span class="text-muted small">1 hour ago</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Staff login</strong>
                  <div class="text-muted small">Dr. Williams</div>
                </div>
                <span class="text-muted small">2 hours ago</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>System backup</strong>
                  <div class="text-muted small">Automatic backup completed</div>
                </div>
                <span class="text-muted small">6 hours ago</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Patient record accessed</strong>
                  <div class="text-muted small">Patient ID: 54321</div>
                </div>
                <span class="text-muted small">Yesterday</span>
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
            <h5 class="mb-0">System Settings</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">User Management</h6>
                    <p class="card-text small">Manage system users, roles, and permissions</p>
                    <button class="btn btn-sm btn-outline-primary">Configure</button>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Backup & Restore</h6>
                    <p class="card-text small">Configure system backup settings and restore points</p>
                    <button class="btn btn-sm btn-outline-primary">Configure</button>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">System Logs</h6>
                    <p class="card-text small">View and export system activity logs</p>
                    <button class="btn btn-sm btn-outline-primary">View Logs</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

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

.bg-primary, .bg-success, .bg-info, .bg-warning {
  border: none;
}

.bi {
  opacity: 0.7;
}
</style>