<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { updateAutoLogout, setupAutoLogout } from '../utils/autoLogout';

const userStore = useUserStore();
const router = useRouter();

const user = computed(() => userStore.user);
const isLoading = ref(false);
const isSaving = ref(false);
const saveSuccess = ref(false);
const errorMessage = ref('');

// Settings form data
const settingsForm = ref({
  notifications: true,
  autoLogout: 0
});

// Auto logout options (in minutes)
const autoLogoutOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 0, label: 'Never' }
];



// Load settings
onMounted(() => {
  if (!user.value) {
    router.push('/login');
    return;
  }
  
  // Get saved settings if they exist
  const savedSettings = localStorage.getItem('userSettings');
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      // Only update if settings belong to current user
      if (parsedSettings.username === user.value.username) {
        settingsForm.value = {
          ...settingsForm.value,
          ...parsedSettings.settings
        };
        

      }
    } catch (error) {
      console.error('Failed to parse settings:', error);
    }
  }
});

// Save settings
const saveSettings = () => {
  isSaving.value = true;
  
  setTimeout(() => {
    try {
      // Store settings with username for identification
      const settingsData = {
        username: user.value.username,
        settings: settingsForm.value
      };
      
      localStorage.setItem('userSettings', JSON.stringify(settingsData));
      
      // Apply auto logout settings
      updateAutoLogout(userStore, router);
      

      
      saveSuccess.value = true;
      setTimeout(() => {
        saveSuccess.value = false;
      }, 3000);
    } catch (err) {
      errorMessage.value = 'Failed to save settings. Please try again.';
    }
    
    isSaving.value = false;
  }, 600);
};

// Reset settings to default
const resetToDefault = () => {
  settingsForm.value = {
    notifications: true,
    autoLogout: 0
  };
};
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <h2>Settings</h2>
      <div class="header-actions">
        <button @click="resetToDefault" class="btn btn-outline-secondary me-2">
          <i class="bi bi-arrow-counterclockwise me-2"></i> <span class="action-text">Reset to Default</span>
        </button>
        <button @click="saveSettings" class="btn btn-primary" :disabled="isSaving">
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-check-lg me-2"></i> <span class="action-text">Save Settings</span>
        </button>
      </div>
    </div>
    
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    
    <div v-if="saveSuccess" class="alert alert-success">
      Settings saved successfully!
    </div>
    
    <div class="row">
      <div class="col-lg-8 col-md-12 mb-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Preferences & Security</h5>
          </div>
          <div class="card-body">
            <div class="preferences-section">
              <!-- Dark Mode toggle -->
              <div class="preference-item mb-4">
                <div class="preference-item-header">
                  <div class="toggle-label">
                    <label class="form-check-label mb-0 d-flex align-items-center" for="darkMode">
                      <span>Dark Mode</span>
                    </label>
                  </div>
                  <div class="form-check form-switch m-0">
                    <input 
                      type="checkbox" 
                      class="form-check-input" 
                      id="darkMode"
                      v-model="settingsForm.darkMode"
                    >
                  </div>
                </div>
                <div class="text-muted mt-2 preference-description">
                  Switch between light and dark theme for better visibility in low-light environments.
                </div>
              </div>
            
              <div class="preference-item mb-4">
                <div class="preference-item-header">
                  <div class="toggle-label">
                    <label class="form-check-label mb-0 d-flex align-items-center" for="notifications">
                      <span>Enable Notifications</span>
                    </label>
                  </div>
                  <div class="form-check form-switch m-0">
                    <input 
                      type="checkbox" 
                      class="form-check-input" 
                      id="notifications"
                      v-model="settingsForm.notifications"
                    >
                  </div>
                </div>
                <div class="text-muted mt-2 preference-description">
                  Receive notifications about new records, updates, and system messages.
                </div>
              </div>
              
              <div class="preference-item">
                <label for="autoLogout" class="form-label">Auto Logout Time</label>
                <select 
                  id="autoLogout" 
                  class="form-select"
                  v-model="settingsForm.autoLogout"
                >
                  <option v-for="option in autoLogoutOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <small class="form-text text-muted preference-description">
                  Automatically log out after period of inactivity. Default is "Never" (no automatic logout).
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: var(--card-bg);
  transition: background-color 0.3s ease;
}

.card-header {
  background: linear-gradient(135deg, var(--secondary-gradient-start), var(--secondary-gradient-end));
  color: white;
  border-bottom: none;
  padding: 1rem 1.5rem;
}

.settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  color: var(--text-color);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Enhanced preferences styling */
.preferences-section {
  margin-bottom: 1rem;
}

.preference-item {
  padding: 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.preference-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preference-item:hover {
  background-color: rgba(128, 128, 128, 0.05);
}

.preference-description {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: var(--muted-color);
}

.toggle-label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 1.05rem;
}

/* Switch toggle styling */
.form-switch .form-check-input {
  width: 3em;
  height: 1.5em;
  margin-left: 0;
  cursor: pointer;
  background-color: var(--input-bg);
  border-color: var(--border-color);
}

.form-check-input:checked {
  background-color: var(--primary-gradient-end);
  border-color: var(--primary-gradient-end);
}

.form-select, .form-control {
  background-color: var(--input-bg);
  color: var(--input-color);
  border-color: var(--border-color);
}

.form-select:focus, .form-control:focus {
  background-color: var(--input-bg);
  color: var(--input-color);
}

.form-text {
  color: var(--muted-color) !important;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
  border: none;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

/* Theme Preview Styling */
.theme-preview-card {
  background-color: var(--card-bg);
  transition: all 0.3s ease;
}

.theme-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.preview-item {
  display: flex;
  align-items: center;
}

.theme-label {
  margin-right: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color);
}

.color-box {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.background-color {
  background-color: var(--background-color);
}

.text-color {
  background-color: var(--text-color);
}

.primary-color {
  background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
}

.secondary-color {
  background: linear-gradient(135deg, var(--secondary-gradient-start), var(--secondary-gradient-end));
}

.current-theme-label {
  text-align: center;
  font-weight: 500;
  color: var(--text-color);
  padding: 8px;
  border-radius: 6px;
  background-color: rgba(128, 128, 128, 0.08);
}

/* Override Bootstrap text-muted class */
:deep(.text-muted) {
  color: var(--muted-color) !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .preference-item {
    padding: 0.8rem;
  }
  
  .toggle-label {
    font-size: 1rem;
  }
  
  .form-switch .form-check-input {
    width: 2.5em;
    height: 1.3em;
  }
}

@media (max-width: 576px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 0.5rem;
  }
  
  .header-actions .btn {
    flex: 1;
    padding: 8px;
  }
  
  .action-text {
    display: none;
  }
  
  .header-actions .bi {
    margin-right: 0 !important;
  }
  
  .preferences-section {
    margin-bottom: 0.5rem;
  }
  
  .preference-item {
    padding: 0.75rem;
  }
  
  .toggle-label {
    font-size: 0.95rem;
  }
  
  .preference-description {
    font-size: 0.8rem;
  }
  
  .form-switch .form-check-input {
    width: 2.2em;
    height: 1.2em;
  }
  
  .theme-preview {
    grid-template-columns: 1fr;
  }
}
</style>