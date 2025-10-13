<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { updateAutoLogout, setupAutoLogout } from "../utils/autoLogout";

const store = useStore();
const router = useRouter();

const user = computed(() => store.state.user);
const isLoading = ref(false);
const isSaving = ref(false);
const saveSuccess = ref(false);
const errorMessage = ref("");

// Settings form data
const settingsForm = ref({
  notifications: true,
  autoLogout: 0,
});

// Auto logout options (in minutes)
const autoLogoutOptions = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: 0, label: "Never" },
];

// Load settings
onMounted(() => {
  if (!user.value) {
    router.push("/login");
    return;
  }

  // Get saved settings if they exist
  const savedSettings = localStorage.getItem("userSettings");
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      // Only update if settings belong to current user
      if (parsedSettings.username === user.value.username) {
        settingsForm.value = {
          ...settingsForm.value,
          ...parsedSettings.settings,
        };

        // Apply settings
      }
    } catch (error) {
      console.error("Failed to parse settings:", error);
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
        settings: settingsForm.value,
      };

      localStorage.setItem("userSettings", JSON.stringify(settingsData));

      // Apply auto logout settings
      updateAutoLogout(store, router);

      saveSuccess.value = true;
      setTimeout(() => {
        saveSuccess.value = false;
      }, 3000);
    } catch (err) {
      errorMessage.value = "Failed to save settings. Please try again.";
    }

    isSaving.value = false;
  }, 600);
};

// Reset settings to default
const resetToDefault = () => {
  settingsForm.value = {
    notifications: true,
    autoLogout: 0,
  };
};
</script>

<template>
  <v-container class="mt-3">
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col>
        <h2>Settings</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn @click="resetToDefault" outlined color="secondary" class="me-2">
          <v-icon left>mdi-refresh</v-icon>
          Reset to Default
        </v-btn>
        <v-btn @click="saveSettings" color="primary" :disabled="isSaving">
          <v-progress-circular
            v-if="isSaving"
            indeterminate
            size="20"
            class="me-2"
          ></v-progress-circular>
          <v-icon v-else left>mdi-check</v-icon>
          Save Settings
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="errorMessage" type="error" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-alert v-if="saveSuccess" type="success" class="mb-4">
      Settings saved successfully!
    </v-alert>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card class="mb-4">
          <v-card-title>Preferences & Security</v-card-title>
          <v-card-text>
            <div class="preferences-section">
              <!-- Notifications toggle -->
              <div class="preference-item mb-4">
                <div class="preference-item-header">
                  <div class="toggle-label">
                    <label class="mb-0 d-flex align-items-center">
                      Enable Notifications
                    </label>
                  </div>
                  <v-switch
                    v-model="settingsForm.notifications"
                    color="primary"
                  ></v-switch>
                </div>
                <div class="text--secondary mt-2 preference-description">
                  Receive notifications about new records, updates, and system
                  messages.
                </div>
              </div>

              <div class="preference-item">
                <v-select
                  v-model="settingsForm.autoLogout"
                  :items="autoLogoutOptions"
                  label="Auto Logout Time"
                  item-text="label"
                  item-value="value"
                  class="mb-2"
                ></v-select>
                <small class="text--secondary preference-description">
                  Automatically log out after period of inactivity. Default is
                  "Never" (no automatic logout).
                </small>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
  background: linear-gradient(
    135deg,
    var(--secondary-gradient-start),
    var(--secondary-gradient-end)
  );
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

.form-select,
.form-control {
  background-color: var(--input-bg);
  color: var(--input-color);
  border-color: var(--border-color);
}

.form-select:focus,
.form-control:focus {
  background-color: var(--input-bg);
  color: var(--input-color);
}

.form-text {
  color: var(--muted-color) !important;
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
  background: linear-gradient(
    135deg,
    var(--primary-gradient-start),
    var(--primary-gradient-end)
  );
}

.secondary-color {
  background: linear-gradient(
    135deg,
    var(--secondary-gradient-start),
    var(--secondary-gradient-end)
  );
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
