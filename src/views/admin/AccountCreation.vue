<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

// Store
const store = useStore();

// Reactive data
const loading = ref(false);
const showCreateModal = ref(false);
const showPreviewModal = ref(false);
const activeTab = ref("create");
const sendingCredentials = ref(false);

const accountForm = ref({
  accountType: "patient",
  firstName: "",
  surname: "",
  suffix: "",
  birthDate: "",
  gender: "Male",
  contactNumber: "",
  email: "",
  address: "",
  role: "Nurse",
  emergencyContact: "",
});

const createdAccounts = ref([
  {
    id: 1,
    type: "patient",
    name: "Ana Reyes",
    username: "ana.reyes",
    email: "ana.reyes@email.com",
    role: "Patient",
    status: "active",
    createdAt: "2024-10-13T16:00:00",
    credentialsSent: true,
    lastLogin: null,
  },
]);

// Computed properties
const user = computed(() => store.state.user);
const generatedCredentials = computed(() => {
  if (!accountForm.value.firstName || !accountForm.value.surname) {
    return null;
  }

  const firstName = accountForm.value.firstName.toLowerCase();
  const surname = accountForm.value.surname.toLowerCase();
  const username = `${firstName}.${surname}`;

  // Generate password based on birthdate
  let password = "default123";
  if (accountForm.value.birthDate) {
    const birthDate = new Date(accountForm.value.birthDate);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear().toString().substr(-2);
    password = `${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}-${year}`;
  }

  return {
    username: username,
    password: password,
    email: accountForm.value.email,
  };
});

// Methods
const resetForm = () => {
  accountForm.value = {
    accountType: "patient",
    firstName: "",
    surname: "",
    suffix: "",
    birthDate: "",
    gender: "Male",
    contactNumber: "",
    email: "",
    address: "",
    role: "Nurse",
    emergencyContact: "",
  };
};

const openCreateModal = () => {
  resetForm();
  showCreateModal.value = true;
};

const closeModals = () => {
  showCreateModal.value = false;
  showPreviewModal.value = false;
};

const generateCredentials = () => {
  // Logic to generate unique username if duplicate exists
  let username = generatedCredentials.value.username;
  const existingUsernames = createdAccounts.value.map((acc) => acc.username);
  let counter = 2;

  while (existingUsernames.includes(username)) {
    username = `${generatedCredentials.value.username}${counter}`;
    counter++;
  }

  return {
    ...generatedCredentials.value,
    username: username,
  };
};

const sendCredentialsViaGmail = async (credentials) => {
  try {
    console.log("Sending credentials via Gmail:", credentials);
    // Simulate Gmail API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real application, this would use Gmail API or Nodemailer
    return {
      success: true,
      message: "Credentials sent successfully via Gmail",
    };
  } catch (error) {
    console.error("Error sending Gmail:", error);
    return { success: false, message: "Failed to send via Gmail" };
  }
};

const sendCredentialsViaSMS = async (credentials) => {
  try {
    console.log("Sending credentials via SMS:", credentials);
    // Simulate SMS sending
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real application, this would use SMS gateway or email-to-SMS
    return { success: true, message: "Credentials sent successfully via SMS" };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return { success: false, message: "Failed to send via SMS" };
  }
};

const sendCredentials = async () => {
  if (!generatedCredentials.value) return;

  sendingCredentials.value = true;

  try {
    const credentials = generateCredentials();

    // Send via both Gmail and SMS
    const [gmailResult, smsResult] = await Promise.all([
      sendCredentialsViaGmail(credentials),
      sendCredentialsViaSMS(credentials),
    ]);

    // Create account record
    const newAccount = {
      id: Math.max(...createdAccounts.value.map((acc) => acc.id)) + 1,
      type: accountForm.value.accountType,
      name: `${accountForm.value.firstName} ${accountForm.value.surname}`,
      username: credentials.username,
      email: credentials.email,
      role:
        accountForm.value.accountType === "patient"
          ? "Patient"
          : accountForm.value.role,
      status: "active",
      createdAt: new Date().toISOString(),
      credentialsSent: gmailResult.success || smsResult.success,
      lastLogin: null,
    };

    createdAccounts.value.unshift(newAccount);

    // Show success message
    const successMessage = `
      Account created successfully!

      Gmail: ${gmailResult.message}
      SMS: ${smsResult.message}

      Username: ${credentials.username}
      Temporary Password: ${credentials.password}
    `;

    alert(successMessage);
    closeModals();
  } catch (error) {
    console.error("Error creating account:", error);
    alert("Error creating account. Please try again.");
  } finally {
    sendingCredentials.value = false;
  }
};

const previewCredentials = () => {
  if (generatedCredentials.value) {
    showPreviewModal.value = true;
  }
};

const getStatusBadgeVariant = (status) => {
  return status === "active" ? "success" : "danger";
};

const getTypeBadgeVariant = (type) => {
  return type === "patient" ? "info" : "primary";
};

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString();
};

onMounted(() => {
  // Component mounted
});
</script>

<template>
  <div class="account-creation">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Account Creation</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Create new user accounts with automatic credential generation and
          delivery
        </p>
      </div>
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4 animate-fade-in-up" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'create' }"
          @click="activeTab = 'create'"
        >
          <i class="bi bi-person-plus me-2"></i>Create Account
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          <i class="bi bi-clock-history me-2"></i>Creation History
        </button>
      </li>
    </ul>

    <!-- Create Account Tab -->
    <div v-if="activeTab === 'create'" class="animate-fade-in-up">
      <div class="row">
        <!-- Account Creation Form -->
        <div class="col-lg-8">
          <div class="card animate-fade-in-left">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-person-gear me-2"></i>
                New Account Information
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="previewCredentials">
                <!-- Account Type Selection -->
                <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label">Account Type *</label>
                    <div class="row g-2">
                      <div class="col-md-6">
                        <div class="form-check">
                          <input
                            v-model="accountForm.accountType"
                            class="form-check-input"
                            type="radio"
                            value="patient"
                            id="accountTypePatient"
                          />
                          <label
                            class="form-check-label"
                            for="accountTypePatient"
                          >
                            <i class="bi bi-person me-2"></i>
                            Patient Account
                          </label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-check">
                          <input
                            v-model="accountForm.accountType"
                            class="form-check-input"
                            type="radio"
                            value="staff"
                            id="accountTypeStaff"
                          />
                          <label
                            class="form-check-label"
                            for="accountTypeStaff"
                          >
                            <i class="bi bi-person-badge me-2"></i>
                            Staff Account
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Basic Information -->
                  <div class="col-md-4">
                    <label class="form-label">First Name *</label>
                    <input
                      v-model="accountForm.firstName"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Surname *</label>
                    <input
                      v-model="accountForm.surname"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Suffix</label>
                    <input
                      v-model="accountForm.suffix"
                      type="text"
                      class="form-control"
                      placeholder="Jr., Sr., MD, RN, etc."
                    />
                  </div>

                  <!-- Patient-specific fields -->
                  <div
                    v-if="accountForm.accountType === 'patient'"
                    class="col-md-6"
                  >
                    <label class="form-label">Birth Date *</label>
                    <input
                      v-model="accountForm.birthDate"
                      type="date"
                      class="form-control"
                      required
                    />
                  </div>
                  <div
                    v-if="accountForm.accountType === 'patient'"
                    class="col-md-6"
                  >
                    <label class="form-label">Gender *</label>
                    <select
                      v-model="accountForm.gender"
                      class="form-select"
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <!-- Staff-specific fields -->
                  <div
                    v-if="accountForm.accountType === 'staff'"
                    class="col-md-12"
                  >
                    <label class="form-label">Role *</label>
                    <select
                      v-model="accountForm.role"
                      class="form-select"
                      required
                    >
                      <option value="Nurse">Nurse</option>
                      <option value="Barangay Health Worker">
                        Barangay Health Worker
                      </option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <!-- Contact Information -->
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Contact Number *</label>
                    <input
                      v-model="accountForm.contactNumber"
                      type="tel"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Email Address *</label>
                    <input
                      v-model="accountForm.email"
                      type="email"
                      class="form-control"
                      required
                    />
                  </div>

                  <div
                    v-if="accountForm.accountType === 'patient'"
                    class="col-md-12 mb-3"
                  >
                    <label class="form-label">Address *</label>
                    <textarea
                      v-model="accountForm.address"
                      class="form-control"
                      rows="2"
                      required
                    ></textarea>
                  </div>
                  <div
                    v-if="accountForm.accountType === 'patient'"
                    class="col-md-12 mb-4"
                  >
                    <label class="form-label">Emergency Contact</label>
                    <input
                      v-model="accountForm.emergencyContact"
                      type="text"
                      class="form-control"
                      placeholder="Name - Contact Number"
                    />
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    :disabled="!accountForm.firstName || !accountForm.surname"
                  >
                    <i class="bi bi-key me-2"></i>
                    Generate Credentials & Preview
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Credential Preview -->
        <div class="col-lg-4">
          <div class="card animate-fade-in-right">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-key me-2"></i>
                Generated Credentials
              </h5>
            </div>
            <div class="card-body">
              <div v-if="!generatedCredentials" class="text-center py-4">
                <i class="bi bi-key text-muted fs-1 mb-3"></i>
                <p class="text-muted">
                  Fill in the form to generate credentials
                </p>
              </div>

              <div v-else class="credentials-preview">
                <div class="alert alert-info">
                  <h6 class="alert-heading">
                    <i class="bi bi-info-circle me-2"></i>
                    Auto-Generated Credentials
                  </h6>
                  <p class="mb-2">
                    The following credentials will be sent to the user:
                  </p>
                </div>

                <div class="credential-item mb-3">
                  <label class="form-label small text-muted">USERNAME</label>
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      :value="generatedCredentials.username"
                      readonly
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="copyToClipboard(generatedCredentials.username)"
                    >
                      <i class="bi bi-clipboard"></i>
                    </button>
                  </div>
                </div>

                <div class="credential-item mb-3">
                  <label class="form-label small text-muted"
                    >TEMPORARY PASSWORD</label
                  >
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      :value="generatedCredentials.password"
                      readonly
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="copyToClipboard(generatedCredentials.password)"
                    >
                      <i class="bi bi-clipboard"></i>
                    </button>
                  </div>
                </div>

                <div class="credential-item mb-4">
                  <label class="form-label small text-muted"
                    >EMAIL ADDRESS</label
                  >
                  <div class="input-group">
                    <input
                      type="email"
                      class="form-control"
                      :value="generatedCredentials.email"
                      readonly
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="copyToClipboard(generatedCredentials.email)"
                    >
                      <i class="bi bi-clipboard"></i>
                    </button>
                  </div>
                </div>

                <div class="d-grid gap-2">
                  <button
                    class="btn btn-success"
                    @click="sendCredentials"
                    :disabled="sendingCredentials"
                  >
                    <i
                      class="bi bi-send me-2"
                      :class="{ 'animate-spin': sendingCredentials }"
                    ></i>
                    {{
                      sendingCredentials
                        ? "Sending Credentials..."
                        : "Create Account & Send Credentials"
                    }}
                  </button>
                  <button
                    class="btn btn-outline-primary"
                    @click="previewCredentials"
                  >
                    <i class="bi bi-eye me-2"></i>
                    Preview Email/SMS
                  </button>
                </div>

                <div class="mt-3">
                  <small class="text-muted">
                    <i class="bi bi-info-circle me-1"></i>
                    Credentials will be sent via Gmail and SMS automatically
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Creation History Tab -->
    <div v-else-if="activeTab === 'history'" class="animate-fade-in-up">
      <div class="card">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">
            <i class="bi bi-clock-history me-2"></i>
            Account Creation History
          </h5>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary">
              <i class="bi bi-download me-1"></i>
              Export History
            </button>
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="$refs.accountHistoryTable?.refresh()"
            >
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
                  <th>Account Holder</th>
                  <th>Type</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Credentials Sent</th>
                  <th>Last Login</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="account in createdAccounts" :key="account.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="account-avatar me-3">
                        <i class="bi bi-person-circle"></i>
                      </div>
                      <div>
                        <div class="fw-medium">{{ account.name }}</div>
                        <small class="text-muted">{{ account.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="`bg-${getTypeBadgeVariant(account.type)}`"
                    >
                      {{ account.role }}
                    </span>
                  </td>
                  <td>
                    <code class="bg-light px-2 py-1 rounded">{{
                      account.username
                    }}</code>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="`bg-${getStatusBadgeVariant(account.status)}`"
                    >
                      {{ account.status }}
                    </span>
                  </td>
                  <td>{{ formatDateTime(account.createdAt) }}</td>
                  <td>
                    <i
                      v-if="account.credentialsSent"
                      class="bi bi-check-circle text-success"
                    ></i>
                    <i v-else class="bi bi-x-circle text-danger"></i>
                    <small class="ms-1">
                      {{ account.credentialsSent ? "Sent" : "Failed" }}
                    </small>
                  </td>
                  <td>
                    <small v-if="account.lastLogin">{{
                      formatDateTime(account.lastLogin)
                    }}</small>
                    <small v-else class="text-muted">Never</small>
                  </td>
                  <td class="text-center">
                    <div class="btn-group" role="group">
                      <button
                        class="btn btn-sm btn-outline-info"
                        title="View Details"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-primary"
                        title="Resend Credentials"
                      >
                        <i class="bi bi-send"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        title="Delete Account"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="createdAccounts.length === 0" class="text-center py-5">
            <i class="bi bi-person-plus text-muted fs-1 mb-3"></i>
            <h5 class="text-muted">No accounts created yet</h5>
            <p class="text-muted mb-3">
              Create your first user account to get started.
            </p>
            <button class="btn btn-primary" @click="activeTab = 'create'">
              <i class="bi bi-person-plus me-2"></i>
              Create First Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      class="modal fade"
      :class="{ show: showPreviewModal }"
      :style="{ display: showPreviewModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-eye me-2"></i>
              Email & SMS Preview
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="generatedCredentials">
              <!-- Email Preview -->
              <div class="mb-4">
                <h6 class="fw-medium">
                  <i class="bi bi-envelope me-2"></i>
                  Gmail Preview
                </h6>
                <div class="email-preview border rounded p-3 bg-light">
                  <div class="email-header mb-3">
                    <strong>Subject:</strong> Your Baan KM-3 Health Center
                    Account Credentials
                  </div>
                  <div class="email-body">
                    <p>
                      Hello
                      <strong
                        >{{ accountForm.firstName }}
                        {{ accountForm.surname }}</strong
                      >,
                    </p>
                    <p>
                      Your account has been created successfully. Here are your
                      login credentials:
                    </p>
                    <div class="credentials-box p-3 bg-white rounded mb-3">
                      <p>
                        <strong>Username:</strong>
                        {{ generatedCredentials.username }}
                      </p>
                      <p>
                        <strong>Temporary Password:</strong>
                        {{ generatedCredentials.password }}
                      </p>
                    </div>
                    <p>Please change your password upon first login.</p>
                    <p>
                      Best regards,<br />Baan KM-3 Health Center Information
                      System
                    </p>
                  </div>
                </div>
              </div>

              <!-- SMS Preview -->
              <div>
                <h6 class="fw-medium">
                  <i class="bi bi-phone me-2"></i>
                  SMS Preview
                </h6>
                <div class="sms-preview border rounded p-3 bg-light">
                  <div class="sms-body">
                    <p>
                      Hello {{ accountForm.firstName }}, your Baan KM-3 Clinic
                      account is active.
                    </p>
                    <p>
                      <strong>Username:</strong>
                      {{ generatedCredentials.username }}
                    </p>
                    <p>
                      <strong>Password:</strong>
                      {{ generatedCredentials.password }}
                    </p>
                    <p>Check your email for full details.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModals"
            >
              Close
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="sendCredentials"
              :disabled="sendingCredentials"
            >
              <i class="bi bi-send me-2"></i>
              {{ sendingCredentials ? "Sending..." : "Send Credentials" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showPreviewModal"
      class="modal-backdrop fade show"
      @click="closeModals"
    ></div>
  </div>
</template>

<style scoped>
.account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-gradient-start);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.credentials-preview {
  background: linear-gradient(
    135deg,
    rgba(67, 97, 238, 0.05),
    rgba(63, 55, 201, 0.05)
  );
  padding: 1rem;
  border-radius: 10px;
}

.credential-item {
  background-color: white;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.form-check-input:checked {
  background-color: var(--primary-gradient-start);
  border-color: var(--primary-gradient-start);
}

.nav-tabs .nav-link {
  border: none;
  color: var(--text-color);
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--primary-gradient-start);
}

.nav-tabs .nav-link.active {
  background: linear-gradient(
    135deg,
    var(--primary-gradient-start),
    var(--primary-gradient-end)
  );
  color: white;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: var(--text-color);
  background-color: rgba(0, 0, 0, 0.02);
}

.table td {
  vertical-align: middle;
  border-color: rgba(0, 0, 0, 0.05);
}

.email-preview,
.sms-preview {
  font-size: 0.9rem;
  line-height: 1.4;
}

.credentials-box {
  border: 1px solid var(--primary-gradient-start);
}

/* Animation for spinner */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }
}
</style>
