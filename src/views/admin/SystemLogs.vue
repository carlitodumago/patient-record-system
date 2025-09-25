<template>
  <div class="system-logs">
    <div class="page-header">
      <h1 class="page-title">
        <i class="bi bi-file-text me-3"></i>
        System Logs
      </h1>
      <p class="page-description">View and export system activity logs</p>
    </div>

    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-funnel me-2"></i>
              Log Filters
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <label class="form-label">Log Level</label>
                <select class="form-select" v-model="filters.level">
                  <option value="">All Levels</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Category</label>
                <select class="form-select" v-model="filters.category">
                  <option value="">All Categories</option>
                  <option value="auth">Authentication</option>
                  <option value="user">User Management</option>
                  <option value="system">System</option>
                  <option value="backup">Backup</option>
                  <option value="database">Database</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Date From</label>
                <input type="date" class="form-control" v-model="filters.dateFrom">
              </div>
              <div class="col-md-3">
                <label class="form-label">Date To</label>
                <input type="date" class="form-control" v-model="filters.dateTo">
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-6">
                <label class="form-label">Search</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="filters.search"
                  placeholder="Search in log messages..."
                >
              </div>
              <div class="col-md-6 d-flex align-items-end">
                <button class="btn btn-primary me-2" @click="applyFilters">
                  <i class="bi bi-search me-1"></i>
                  Apply Filters
                </button>
                <button class="btn btn-outline-secondary me-2" @click="clearFilters">
                  <i class="bi bi-x-circle me-1"></i>
                  Clear
                </button>
                <button class="btn btn-success" @click="exportLogs">
                  <i class="bi bi-download me-1"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-list-ul me-2"></i>
              System Activity Logs
            </h5>
            <div class="d-flex align-items-center">
              <span class="text-muted me-3">{{ filteredLogs.length }} entries</span>
              <button class="btn btn-outline-primary btn-sm" @click="refreshLogs">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Timestamp</th>
                    <th>Level</th>
                    <th>Category</th>
                    <th>User</th>
                    <th>Message</th>
                    <th>IP Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in paginatedLogs" :key="log.id">
                    <td class="text-nowrap">
                      <small>{{ formatTimestamp(log.timestamp) }}</small>
                    </td>
                    <td>
                      <span class="badge" :class="getLevelClass(log.level)">
                        {{ log.level.toUpperCase() }}
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-secondary">{{ log.category }}</span>
                    </td>
                    <td>{{ log.user || 'System' }}</td>
                    <td>
                      <div class="log-message" :title="log.message">
                        {{ truncateMessage(log.message) }}
                      </div>
                    </td>
                    <td class="text-muted">{{ log.ipAddress || '-' }}</td>
                    <td>
                      <button 
                        class="btn btn-outline-primary btn-sm" 
                        @click="viewLogDetails(log)"
                        title="View Details"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer" v-if="totalPages > 1">
            <nav>
              <ul class="pagination pagination-sm justify-content-center mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                    First
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                    Previous
                  </button>
                </li>
                <li class="page-item active">
                  <span class="page-link">{{ currentPage }} of {{ totalPages }}</span>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                    Next
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                    Last
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Details Modal -->
    <div class="modal fade" id="logDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Log Entry Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedLog">
            <div class="row">
              <div class="col-md-6">
                <strong>Timestamp:</strong>
                <p>{{ formatTimestamp(selectedLog.timestamp) }}</p>
              </div>
              <div class="col-md-6">
                <strong>Level:</strong>
                <p><span class="badge" :class="getLevelClass(selectedLog.level)">{{ selectedLog.level.toUpperCase() }}</span></p>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <strong>Category:</strong>
                <p>{{ selectedLog.category }}</p>
              </div>
              <div class="col-md-6">
                <strong>User:</strong>
                <p>{{ selectedLog.user || 'System' }}</p>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <strong>IP Address:</strong>
                <p>{{ selectedLog.ipAddress || '-' }}</p>
              </div>
              <div class="col-md-6">
                <strong>User Agent:</strong>
                <p class="text-break">{{ selectedLog.userAgent || '-' }}</p>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <strong>Message:</strong>
                <p class="bg-light p-3 rounded">{{ selectedLog.message }}</p>
              </div>
            </div>
            <div class="row" v-if="selectedLog.details">
              <div class="col-12">
                <strong>Additional Details:</strong>
                <pre class="bg-light p-3 rounded"><code>{{ JSON.stringify(selectedLog.details, null, 2) }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Filters
const filters = ref({
  level: '',
  category: '',
  dateFrom: '',
  dateTo: '',
  search: ''
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Selected log for details modal
const selectedLog = ref(null)

// Sample log data
const logs = ref([
  {
    id: 1,
    timestamp: new Date('2024-01-15T10:30:00'),
    level: 'info',
    category: 'auth',
    user: 'admin',
    message: 'User logged in successfully',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: { sessionId: 'sess_123456', loginMethod: 'password' }
  },
  {
    id: 2,
    timestamp: new Date('2024-01-15T10:25:00'),
    level: 'warning',
    category: 'auth',
    user: null,
    message: 'Failed login attempt for user: testuser',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: { attemptedUsername: 'testuser', reason: 'invalid_password' }
  },
  {
    id: 3,
    timestamp: new Date('2024-01-15T10:20:00'),
    level: 'info',
    category: 'user',
    user: 'admin',
    message: 'New user account created: john.doe@example.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: { newUserId: 'user_789', role: 'patient' }
  },
  {
    id: 4,
    timestamp: new Date('2024-01-15T10:15:00'),
    level: 'error',
    category: 'database',
    user: null,
    message: 'Database connection timeout occurred',
    ipAddress: null,
    userAgent: null,
    details: { error: 'Connection timeout after 30 seconds', query: 'SELECT * FROM users' }
  },
  {
    id: 5,
    timestamp: new Date('2024-01-15T10:10:00'),
    level: 'info',
    category: 'backup',
    user: 'system',
    message: 'Automated backup completed successfully',
    ipAddress: null,
    userAgent: null,
    details: { backupSize: '2.3GB', duration: '45 minutes', type: 'full' }
  }
])

// Computed properties
const filteredLogs = computed(() => {
  let filtered = logs.value

  if (filters.value.level) {
    filtered = filtered.filter(log => log.level === filters.value.level)
  }

  if (filters.value.category) {
    filtered = filtered.filter(log => log.category === filters.value.category)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(log => 
      log.message.toLowerCase().includes(search) ||
      (log.user && log.user.toLowerCase().includes(search))
    )
  }

  if (filters.value.dateFrom) {
    const fromDate = new Date(filters.value.dateFrom)
    filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate)
  }

  if (filters.value.dateTo) {
    const toDate = new Date(filters.value.dateTo)
    toDate.setHours(23, 59, 59, 999) // End of day
    filtered = filtered.filter(log => new Date(log.timestamp) <= toDate)
  }

  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / itemsPerPage.value)
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLogs.value.slice(start, end)
})

onMounted(() => {
  loadLogs()
})

const loadLogs = () => {
  // TODO: Load logs from server
  console.log('Loading system logs...')
}

const applyFilters = () => {
  currentPage.value = 1
  // Filters are applied automatically via computed property
}

const clearFilters = () => {
  filters.value = {
    level: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  }
  currentPage.value = 1
}

const refreshLogs = () => {
  loadLogs()
}

const exportLogs = () => {
  // TODO: Implement log export functionality
  console.log('Exporting logs...', filteredLogs.value.length, 'entries')
  
  // Simple CSV export example
  const csvContent = [
    'Timestamp,Level,Category,User,Message,IP Address',
    ...filteredLogs.value.map(log => 
      `"${formatTimestamp(log.timestamp)}","${log.level}","${log.category}","${log.user || ''}","${log.message}","${log.ipAddress || ''}"`
    )
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

const viewLogDetails = (log) => {
  selectedLog.value = log
  // Show modal (assuming Bootstrap is available)
  const modal = new bootstrap.Modal(document.getElementById('logDetailsModal'))
  modal.show()
}

const getLevelClass = (level) => {
  const classes = {
    'error': 'bg-danger',
    'warning': 'bg-warning text-dark',
    'info': 'bg-info',
    'debug': 'bg-secondary'
  }
  return classes[level] || 'bg-secondary'
}

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const truncateMessage = (message, maxLength = 80) => {
  return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
}
</script>

<style scoped>
.system-logs {
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

.log-message {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table th {
  border-top: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.table td {
  vertical-align: middle;
  font-size: 0.9rem;
}

.pagination .page-link {
  border-color: var(--border-color);
  color: var(--primary-gradient-start);
}

.pagination .page-item.active .page-link {
  background-color: var(--primary-gradient-start);
  border-color: var(--primary-gradient-start);
}

pre code {
  font-size: 0.85rem;
}
</style>