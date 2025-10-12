<template>
  <div class="container-fluid mt-3">
    <h1 class="mb-2">Admin Dashboard</h1>
    <p class="text-muted">System overview and management</p>

    <div class="row mt-4">
      <div class="col-md-3 mb-4">
        <div class="card bg-primary text-white">
          <div
            class="card-body d-flex justify-content-between align-items-center"
          >
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
          <div
            class="card-body d-flex justify-content-between align-items-center"
          >
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
          <div
            class="card-body d-flex justify-content-between align-items-center"
          >
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
          <div
            class="card-body d-flex justify-content-between align-items-center"
          >
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
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
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
                    <button class="btn btn-sm btn-outline-primary me-1">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Sarah Johnson</td>
                  <td>Nurse</td>
                  <td><span class="badge bg-success">Active</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Michael Brown</td>
                  <td>Patient</td>
                  <td><span class="badge bg-secondary">Inactive</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger">
                      <i class="bi bi-trash"></i>
                    </button>
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
              <li
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>New patient registered</strong>
                  <div class="text-muted small">Jane Doe</div>
                </div>
                <span class="text-muted small">10 minutes ago</span>
              </li>
              <li
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>Medical record updated</strong>
                  <div class="text-muted small">Patient ID: 12345</div>
                </div>
                <span class="text-muted small">1 hour ago</span>
              </li>
              <li
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>Staff login</strong>
                  <div class="text-muted small">Dr. Williams</div>
                </div>
                <span class="text-muted small">2 hours ago</span>
              </li>
              <li
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>System backup</strong>
                  <div class="text-muted small">Automatic backup completed</div>
                </div>
                <span class="text-muted small">6 hours ago</span>
              </li>
              <li
                class="list-group-item d-flex justify-content-between align-items-center"
              >
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
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">System Settings</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">User Management</h6>
                    <p class="card-text small">
                      Manage system users, roles, and permissions
                    </p>
                    <button class="btn btn-sm btn-outline-primary">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">Backup & Restore</h6>
                    <p class="card-text small">
                      Configure system backup settings and restore points
                    </p>
                    <button class="btn btn-sm btn-outline-primary">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card">
                  <div class="card-body">
                    <h6 class="card-title">System Logs</h6>
                    <p class="card-text small">
                      View and export system activity logs
                    </p>
                    <button class="btn btn-sm btn-outline-primary">
                      View Logs
                    </button>
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
import { ref, onMounted } from "vue";
import { useAdminStore } from "@/stores/admin";
import { usePatientsStore } from "@/stores/patients";
import { useNotificationsStore } from "@/stores/notifications";

const adminStore = useAdminStore();
const patientsStore = usePatientsStore();
const notificationsStore = useNotificationsStore();

// Reactive data
const isLoading = ref(true);
const quickActions = ref([
  {
    title: "Add New User",
    description: "Create accounts for patients or staff",
    icon: "bi-person-plus",
    color: "primary",
    action: () => navigateTo("/admin/users"),
  },
  {
    title: "Schedule Appointment",
    description: "Book appointments for patients",
    icon: "bi-calendar-plus",
    color: "success",
    action: () => navigateTo("/admin/appointments"),
  },
  {
    title: "Add Medical Record",
    description: "Record patient health information",
    icon: "bi-file-earmark-plus",
    color: "info",
    action: () => navigateTo("/admin/medical-records"),
  },
  {
    title: "View Reports",
    description: "Generate system analytics",
    icon: "bi-graph-up",
    color: "warning",
    action: () => navigateTo("/admin/reports"),
  },
]);

const systemActivity = ref([]);

onMounted(async () => {
  await loadDashboardData();
});

const loadDashboardData = async () => {
  isLoading.value = true;
  try {
    // Load system statistics
    await adminStore.loadSystemStatistics();

    // Load patient statistics
    await patientsStore.loadStatistics();

    // Load recent notifications for activity feed
    notificationsStore.loadNotifications();

    // Generate system activity from audit logs
    await loadSystemActivity();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  } finally {
    isLoading.value = false;
  }
};

const loadSystemActivity = async () => {
  try {
    const logs = await adminStore.getAuditLogs({ limit: 5 });
    systemActivity.value = logs.map((log) => ({
      id: log.log_id,
      title: formatActivityTitle(log.action),
      description: `${log.table_name} record`,
      user: log.user?.username || "System",
      time: formatTimeAgo(log.created_at),
      type: getActivityType(log.action),
    }));
  } catch (error) {
    console.error("Error loading system activity:", error);
  }
};

const navigateTo = (path) => {
  // Use Vue Router to navigate
  window.location.hash = path;
};

const formatActivityTitle = (action) => {
  const titles = {
    CREATE: "Created",
    UPDATE: "Updated",
    DELETE: "Deleted",
    LOGIN: "User Login",
    LOGOUT: "User Logout",
  };
  return titles[action] || action;
};

const getActivityType = (action) => {
  if (action.includes("CREATE")) return "success";
  if (action.includes("DELETE")) return "danger";
  if (action.includes("UPDATE")) return "info";
  return "secondary";
};

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
};
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

.bg-primary,
.bg-success,
.bg-info,
.bg-warning {
  border: none;
}

.bi {
  opacity: 0.7;
}
</style>
