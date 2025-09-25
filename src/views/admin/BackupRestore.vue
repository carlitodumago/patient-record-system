<template>
  <div class="backup-restore">
    <div class="page-header">
      <h1 class="page-title">
        <i class="bi bi-cloud-arrow-up me-3"></i>
        Backup & Restore
      </h1>
      <p class="page-description">Configure system backup settings and restore points</p>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-cloud-upload me-2"></i>
              Create Backup
            </h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Backup Type</label>
              <select class="form-select" v-model="backupType">
                <option value="full">Full System Backup</option>
                <option value="database">Database Only</option>
                <option value="files">Files Only</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Backup Name</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="backupName"
                :placeholder="`backup_${new Date().toISOString().split('T')[0]}`"
              >
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="includeUserData">
                <label class="form-check-label">Include User Data</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="compressBackup">
                <label class="form-check-label">Compress Backup</label>
              </div>
            </div>
            <button class="btn btn-primary w-100" @click="createBackup" :disabled="isCreatingBackup">
              <span v-if="isCreatingBackup" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-cloud-arrow-up me-2"></i>
              {{ isCreatingBackup ? 'Creating Backup...' : 'Create Backup' }}
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-clock-history me-2"></i>
              Backup Schedule
            </h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="autoBackupEnabled">
                <label class="form-check-label">Enable Automatic Backups</label>
              </div>
            </div>
            <div v-if="autoBackupEnabled">
              <div class="mb-3">
                <label class="form-label">Frequency</label>
                <select class="form-select" v-model="backupFrequency">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Time</label>
                <input type="time" class="form-control" v-model="backupTime">
              </div>
              <div class="mb-3">
                <label class="form-label">Retention (days)</label>
                <input type="number" class="form-control" v-model="retentionDays" min="1" max="365">
              </div>
            </div>
            <button class="btn btn-success w-100" @click="saveSchedule">
              <i class="bi bi-check-circle me-2"></i>
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-archive me-2"></i>
              Available Backups
            </h5>
            <button class="btn btn-outline-primary btn-sm" @click="refreshBackups">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Backup Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="backup in backups" :key="backup.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <i class="bi bi-file-zip me-2 text-primary"></i>
                        {{ backup.name }}
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="getTypeClass(backup.type)">
                        {{ backup.type }}
                      </span>
                    </td>
                    <td>{{ backup.size }}</td>
                    <td>{{ formatDate(backup.created) }}</td>
                    <td>
                      <span class="badge" :class="getStatusClass(backup.status)">
                        {{ backup.status }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-success" @click="restoreBackup(backup)" title="Restore">
                          <i class="bi bi-arrow-clockwise"></i>
                        </button>
                        <button class="btn btn-outline-primary" @click="downloadBackup(backup)" title="Download">
                          <i class="bi bi-download"></i>
                        </button>
                        <button class="btn btn-outline-danger" @click="deleteBackup(backup)" title="Delete">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Form data
const backupType = ref('full')
const backupName = ref('')
const includeUserData = ref(true)
const compressBackup = ref(true)
const isCreatingBackup = ref(false)

// Schedule data
const autoBackupEnabled = ref(false)
const backupFrequency = ref('daily')
const backupTime = ref('02:00')
const retentionDays = ref(30)

// Backups list
const backups = ref([
  {
    id: 1,
    name: 'backup_2024-01-15_full',
    type: 'Full',
    size: '2.3 GB',
    created: new Date('2024-01-15T02:00:00'),
    status: 'Complete'
  },
  {
    id: 2,
    name: 'backup_2024-01-14_database',
    type: 'Database',
    size: '156 MB',
    created: new Date('2024-01-14T02:00:00'),
    status: 'Complete'
  }
])

onMounted(() => {
  loadBackups()
})

const createBackup = async () => {
  isCreatingBackup.value = true
  try {
    // TODO: Implement backup creation
    console.log('Creating backup...', {
      type: backupType.value,
      name: backupName.value,
      includeUserData: includeUserData.value,
      compress: compressBackup.value
    })
    
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Add new backup to list
    backups.value.unshift({
      id: Date.now(),
      name: backupName.value || `backup_${new Date().toISOString().split('T')[0]}`,
      type: backupType.value,
      size: '1.2 GB',
      created: new Date(),
      status: 'Complete'
    })
    
    backupName.value = ''
  } catch (error) {
    console.error('Backup creation failed:', error)
  } finally {
    isCreatingBackup.value = false
  }
}

const saveSchedule = () => {
  // TODO: Implement schedule saving
  console.log('Saving backup schedule...', {
    enabled: autoBackupEnabled.value,
    frequency: backupFrequency.value,
    time: backupTime.value,
    retention: retentionDays.value
  })
}

const loadBackups = () => {
  // TODO: Load backups from server
  console.log('Loading backups...')
}

const refreshBackups = () => {
  loadBackups()
}

const restoreBackup = (backup) => {
  // TODO: Implement restore functionality
  console.log('Restoring backup:', backup.name)
}

const downloadBackup = (backup) => {
  // TODO: Implement download functionality
  console.log('Downloading backup:', backup.name)
}

const deleteBackup = (backup) => {
  // TODO: Implement delete functionality
  if (confirm(`Are you sure you want to delete backup "${backup.name}"?`)) {
    const index = backups.value.findIndex(b => b.id === backup.id)
    if (index > -1) {
      backups.value.splice(index, 1)
    }
  }
}

const getTypeClass = (type) => {
  const classes = {
    'Full': 'bg-primary',
    'Database': 'bg-info',
    'Files': 'bg-warning'
  }
  return classes[type] || 'bg-secondary'
}

const getStatusClass = (status) => {
  const classes = {
    'Complete': 'bg-success',
    'In Progress': 'bg-warning',
    'Failed': 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.backup-restore {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  color: var(--primary-gradient-start);
  font-weight: 600;
  margin-bottom: 10px;
}

.page-description {
  color: var(--muted-color);
  font-size: 1.1rem;
}

.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: none;
  border-radius: 10px;
}

.card-header {
  background: linear-gradient(135deg, var(--secondary-gradient-start), var(--secondary-gradient-end));
  color: white;
  border-radius: 10px 10px 0 0 !important;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>