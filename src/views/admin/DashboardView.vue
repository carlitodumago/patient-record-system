<template>
  <v-container fluid class="mt-3">
    <v-row>
      <v-col cols="12">
        <h1 class="mb-2">Admin Dashboard</h1>
        <p class="text-muted">System overview and management</p>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="3" class="mb-4">
        <v-card color="primary" dark>
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">150</div>
              <div class="text-body-2">Total Records</div>
            </div>
            <v-icon size="48" class="opacity-70">mdi-file-document</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="mb-4">
        <v-card color="success" dark>
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">25</div>
              <div class="text-body-2">Total Patients</div>
            </div>
            <v-icon size="48" class="opacity-70">mdi-account-group</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="mb-4">
        <v-card color="info" dark>
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">8</div>
              <div class="text-body-2">Staff Members</div>
            </div>
            <v-icon size="48" class="opacity-70">mdi-account-badge</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="mb-4">
        <v-card color="warning" dark>
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">10</div>
              <div class="text-body-2">Pending Reviews</div>
            </div>
            <v-icon size="48" class="opacity-70">mdi-clock-outline</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6" class="mb-4">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>System Users</span>
            <v-btn size="small" color="primary">
              <v-icon left>mdi-plus-circle</v-icon>
              Add User
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="userHeaders"
              :items="users"
              :items-per-page="5"
              density="compact"
            >
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="item.status === 'Active' ? 'success' : 'secondary'"
                  size="small"
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn icon size="small" color="primary" class="mr-1">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" color="error">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="mb-4">
        <v-card>
          <v-card-title>System Activity</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="activity in activities" :key="activity.id">
                <v-list-item-content>
                  <v-list-item-title>{{ activity.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    activity.description
                  }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-list-item-action-text>{{
                    activity.time
                  }}</v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>System Settings</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4" class="mb-3">
                <v-card variant="outlined">
                  <v-card-text>
                    <v-card-title class="text-h6">User Management</v-card-title>
                    <p class="text-body-2">
                      Manage system users, roles, and permissions
                    </p>
                    <v-btn size="small" variant="outlined" color="primary">
                      Configure
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4" class="mb-3">
                <v-card variant="outlined">
                  <v-card-text>
                    <v-card-title class="text-h6"
                      >Backup & Restore</v-card-title
                    >
                    <p class="text-body-2">
                      Configure system backup settings and restore points
                    </p>
                    <v-btn size="small" variant="outlined" color="primary">
                      Configure
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4" class="mb-3">
                <v-card variant="outlined">
                  <v-card-text>
                    <v-card-title class="text-h6">System Logs</v-card-title>
                    <p class="text-body-2">
                      View and export system activity logs
                    </p>
                    <v-btn size="small" variant="outlined" color="primary">
                      View Logs
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
const userHeaders = ref([
  { title: "Name", key: "name" },
  { title: "Role", key: "role" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
]);

const users = ref([
  { name: "John Smith", role: "Admin", status: "Active" },
  { name: "Sarah Johnson", role: "Nurse", status: "Active" },
  { name: "Michael Brown", role: "Patient", status: "Inactive" },
]);

const activities = ref([
  {
    id: 1,
    title: "New patient registered",
    description: "Jane Doe",
    time: "10 minutes ago",
  },
  {
    id: 2,
    title: "Medical record updated",
    description: "Patient ID: 12345",
    time: "1 hour ago",
  },
  {
    id: 3,
    title: "Staff login",
    description: "Dr. Williams",
    time: "2 hours ago",
  },
  {
    id: 4,
    title: "System backup",
    description: "Automatic backup completed",
    time: "6 hours ago",
  },
  {
    id: 5,
    title: "Patient record accessed",
    description: "Patient ID: 54321",
    time: "Yesterday",
  },
]);

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
