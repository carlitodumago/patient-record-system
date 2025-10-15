<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

// Store
const store = useStore();

// Reactive data
const loading = ref(false);
const activeTab = ref("list");
const search = ref("");
const showScheduleModal = ref(false);
const showEditModal = ref(false);
const showCancelModal = ref(false);
const selectedAppointment = ref(null);
const viewMode = ref("list"); // 'list' or 'calendar'

const appointmentsList = ref([
  {
    id: 1,
    patientId: 1,
    patientName: "John Doe",
    scheduledBy: 1,
    staffName: "Dr. Sarah Johnson",
    dateTime: "2024-10-15T10:30:00",
    status: "Confirmed",
    reason: "Regular Check-up",
    notes: "Patient complains of mild headache",
    type: "Consultation",
    duration: 30,
    createdAt: "2024-10-10T09:00:00",
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Maria Santos",
    scheduledBy: 2,
    staffName: "Dr. Sarah Johnson",
    dateTime: "2024-10-15T14:00:00",
    status: "Pending",
    reason: "Follow-up",
    notes: "Blood pressure monitoring",
    type: "Follow-up",
    duration: 20,
    createdAt: "2024-10-12T11:30:00",
  },
  {
    id: 3,
    patientId: 3,
    patientName: "Pedro Cruz",
    scheduledBy: 3,
    staffName: "Maria Santos, RN",
    dateTime: "2024-10-16T09:00:00",
    status: "Confirmed",
    reason: "Vaccination",
    notes: "COVID-19 booster shot",
    type: "Vaccination",
    duration: 15,
    createdAt: "2024-10-13T16:00:00",
  },
]);

// Form data
const appointmentForm = ref({
  patientId: "",
  patientName: "",
  staffId: "",
  staffName: "",
  dateTime: "",
  reason: "",
  notes: "",
  type: "Consultation",
  duration: 30,
});

// Computed properties
const user = computed(() => store.state.user);
const filteredAppointments = computed(() => {
  return appointmentsList.value.filter(
    (appointment) =>
      appointment.patientName
        .toLowerCase()
        .includes(search.value.toLowerCase()) ||
      appointment.staffName
        .toLowerCase()
        .includes(search.value.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(search.value.toLowerCase()) ||
      appointment.status.toLowerCase().includes(search.value.toLowerCase())
  );
});

const todayAppointments = computed(() => {
  const today = new Date().toDateString();
  return appointmentsList.value.filter(
    (appointment) => new Date(appointment.dateTime).toDateString() === today
  );
});

const upcomingAppointments = computed(() => {
  const now = new Date();
  return appointmentsList.value
    .filter(
      (appointment) =>
        new Date(appointment.dateTime) > now &&
        appointment.status !== "Cancelled"
    )
    .slice(0, 5);
});

// Methods
const fetchAppointments = async () => {
  loading.value = true;
  try {
    // Simulate API call - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Mock data is already loaded
  } catch (error) {
    console.error("Error fetching appointments:", error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  appointmentForm.value = {
    patientId: "",
    patientName: "",
    staffId: "",
    staffName: "",
    dateTime: "",
    reason: "",
    notes: "",
    type: "Consultation",
    duration: 30,
  };
};

const openScheduleModal = () => {
  resetForm();
  selectedAppointment.value = null;
  showScheduleModal.value = true;
};

const openEditModal = (appointment) => {
  selectedAppointment.value = appointment;
  appointmentForm.value = { ...appointment };
  showEditModal.value = true;
};

const openCancelModal = (appointment) => {
  selectedAppointment.value = appointment;
  showCancelModal.value = true;
};

const closeModals = () => {
  showScheduleModal.value = false;
  showEditModal.value = false;
  showCancelModal.value = false;
  selectedAppointment.value = null;
  resetForm();
};

const scheduleAppointment = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newAppointment = {
      id: Math.max(...appointmentsList.value.map((a) => a.id)) + 1,
      ...appointmentForm.value,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    appointmentsList.value.push(newAppointment);
    closeModals();

    console.log("Appointment scheduled successfully");
  } catch (error) {
    console.error("Error scheduling appointment:", error);
  }
};

const updateAppointment = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = appointmentsList.value.findIndex(
      (a) => a.id === selectedAppointment.value.id
    );
    if (index !== -1) {
      appointmentsList.value[index] = { ...appointmentForm.value };
    }

    closeModals();
    console.log("Appointment updated successfully");
  } catch (error) {
    console.error("Error updating appointment:", error);
  }
};

const cancelAppointment = async () => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = appointmentsList.value.findIndex(
      (a) => a.id === selectedAppointment.value.id
    );
    if (index !== -1) {
      appointmentsList.value[index].status = "Cancelled";
    }

    closeModals();
    console.log("Appointment cancelled successfully");
  } catch (error) {
    console.error("Error cancelling appointment:", error);
  }
};

const getStatusBadgeVariant = (status) => {
  const variants = {
    Confirmed: "success",
    Pending: "warning",
    Cancelled: "danger",
    Completed: "info",
  };
  return variants[status] || "secondary";
};

const getTypeBadgeVariant = (type) => {
  const variants = {
    Consultation: "primary",
    "Follow-up": "info",
    Vaccination: "success",
    Emergency: "danger",
  };
  return variants[type] || "secondary";
};

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString();
};

const isToday = (dateTime) => {
  const today = new Date().toDateString();
  return new Date(dateTime).toDateString() === today;
};

const isUpcoming = (dateTime) => {
  const now = new Date();
  return new Date(dateTime) > now;
};

onMounted(() => {
  fetchAppointments();
});
</script>

<template>
  <div class="appointments-management">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-2 animate-fade-in-left">Appointments</h1>
        <p class="text-muted mb-0 animate-fade-in-left animation-delay-100">
          Manage patient appointments and scheduling
        </p>
      </div>
      <div class="animate-fade-in-right">
        <button class="btn btn-primary" @click="openScheduleModal">
          <i class="bi bi-calendar-plus me-2"></i>
          Schedule Appointment
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-calendar-day text-primary fs-2"></i>
            </div>
            <h4 class="mb-1">{{ todayAppointments.length }}</h4>
            <small class="text-muted">Today's Appointments</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-100">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-clock text-warning fs-2"></i>
            </div>
            <h4 class="mb-1">
              {{
                filteredAppointments.filter((a) => a.status === "Pending")
                  .length
              }}
            </h4>
            <small class="text-muted">Pending Approvals</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-200">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-check-circle text-success fs-2"></i>
            </div>
            <h4 class="mb-1">
              {{
                filteredAppointments.filter((a) => a.status === "Confirmed")
                  .length
              }}
            </h4>
            <small class="text-muted">Confirmed</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card stats-card animate-fade-in-up animation-delay-300">
          <div class="card-body text-center">
            <div class="stats-icon mb-2">
              <i class="bi bi-calendar-week text-info fs-2"></i>
            </div>
            <h4 class="mb-1">{{ upcomingAppointments.length }}</h4>
            <small class="text-muted">Upcoming This Week</small>
          </div>
        </div>
      </div>
    </div>

    <!-- View Toggle -->
    <div class="card mb-4 animate-fade-in-up animation-delay-200">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="search-box">
              <i class="bi bi-search search-icon"></i>
              <input
                v-model="search"
                type="text"
                class="form-control"
                placeholder="Search appointments by patient, staff, or reason..."
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex justify-content-end gap-2">
              <div class="btn-group" role="group">
                <input
                  type="radio"
                  class="btn-check"
                  id="view-list"
                  v-model="viewMode"
                  value="list"
                  autocomplete="off"
                />
                <label class="btn btn-outline-primary btn-sm" for="view-list">
                  <i class="bi bi-list-ul me-1"></i>List
                </label>

                <input
                  type="radio"
                  class="btn-check"
                  id="view-calendar"
                  v-model="viewMode"
                  value="calendar"
                  autocomplete="off"
                />
                <label
                  class="btn btn-outline-primary btn-sm"
                  for="view-calendar"
                >
                  <i class="bi bi-calendar me-1"></i>Calendar
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary animate-pulse" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading appointments...</p>
    </div>

    <!-- Appointments List View -->
    <div
      v-else-if="viewMode === 'list'"
      class="card animate-fade-in-up animation-delay-300"
    >
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-calendar-event me-2"></i>
          All Appointments ({{ filteredAppointments.length }})
        </h5>
        <button
          class="btn btn-sm btn-outline-primary"
          @click="fetchAppointments"
          :disabled="loading"
        >
          <i
            class="bi bi-arrow-clockwise me-1"
            :class="{ 'animate-spin': loading }"
          ></i>
          Refresh
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Patient</th>
                <th>Healthcare Provider</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Reason</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="appointment in filteredAppointments"
                :key="appointment.id"
                class="animate-fade-in-up"
              >
                <td>
                  <div class="d-flex align-items-center">
                    <div class="patient-avatar me-3">
                      <i class="bi bi-person-circle"></i>
                    </div>
                    <div>
                      <div class="fw-medium">{{ appointment.patientName }}</div>
                      <small class="text-muted"
                        >ID: {{ appointment.patientId }}</small
                      >
                    </div>
                  </div>
                </td>
                <td>
                  <div class="fw-medium">{{ appointment.staffName }}</div>
                  <small class="text-muted"
                    >{{ appointment.duration }} min</small
                  >
                </td>
                <td>
                  <div>{{ formatDateTime(appointment.dateTime) }}</div>
                  <small
                    v-if="isToday(appointment.dateTime)"
                    class="badge bg-primary"
                    >Today</small
                  >
                  <small
                    v-else-if="isUpcoming(appointment.dateTime)"
                    class="badge bg-info"
                    >Upcoming</small
                  >
                </td>
                <td>
                  <span
                    class="badge"
                    :class="`bg-${getTypeBadgeVariant(appointment.type)}`"
                  >
                    {{ appointment.type }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="`bg-${getStatusBadgeVariant(appointment.status)}`"
                  >
                    {{ appointment.status }}
                  </span>
                </td>
                <td>
                  <div>{{ appointment.reason }}</div>
                  <small v-if="appointment.notes" class="text-muted">{{
                    appointment.notes
                  }}</small>
                </td>
                <td class="text-center">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="openEditModal(appointment)"
                      title="Edit Appointment"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      v-if="appointment.status !== 'Cancelled'"
                      class="btn btn-sm btn-outline-danger"
                      @click="openCancelModal(appointment)"
                      title="Cancel Appointment"
                    >
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredAppointments.length === 0" class="text-center py-5">
          <i class="bi bi-calendar-x text-muted fs-1 mb-3"></i>
          <h5 class="text-muted">No appointments found</h5>
          <p class="text-muted mb-3">
            {{
              search
                ? "Try adjusting your search criteria."
                : "No appointments scheduled yet."
            }}
          </p>
          <button
            v-if="!search"
            class="btn btn-primary"
            @click="openScheduleModal"
          >
            <i class="bi bi-calendar-plus me-2"></i>
            Schedule First Appointment
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar View (Simplified) -->
    <div v-else class="card animate-fade-in-up animation-delay-300">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-calendar-week me-2"></i>
          Calendar View
        </h5>
      </div>
      <div class="card-body">
        <div class="calendar-placeholder text-center py-5">
          <i class="bi bi-calendar3 text-muted fs-1 mb-3"></i>
          <h5 class="text-muted">Calendar View</h5>
          <p class="text-muted">
            Full calendar integration would be implemented here with a library
            like FullCalendar.
          </p>
          <div class="upcoming-appointments">
            <h6 class="mb-3">Upcoming Appointments</h6>
            <div
              v-for="appointment in upcomingAppointments"
              :key="appointment.id"
              class="appointment-card mb-2 p-3 border rounded"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{{ appointment.patientName }}</strong
                  ><br />
                  <small class="text-muted">{{ appointment.staffName }}</small>
                </div>
                <div class="text-end">
                  <small class="fw-medium">{{
                    formatDateTime(appointment.dateTime)
                  }}</small
                  ><br />
                  <span
                    class="badge"
                    :class="`bg-${getStatusBadgeVariant(appointment.status)}`"
                  >
                    {{ appointment.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Appointment Modal -->
    <div
      class="modal fade"
      :class="{ show: showScheduleModal }"
      :style="{ display: showScheduleModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-calendar-plus me-2"></i>
              Schedule New Appointment
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="scheduleAppointment">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Patient Name *</label>
                  <input
                    v-model="appointmentForm.patientName"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Healthcare Provider *</label>
                  <select
                    v-model="appointmentForm.staffName"
                    class="form-select"
                    required
                  >
                    <option value="">Select Provider</option>
                    <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                    <option value="Maria Santos, RN">Maria Santos, RN</option>
                    <option value="Pedro Cruz, BHW">Pedro Cruz, BHW</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Date & Time *</label>
                  <input
                    v-model="appointmentForm.dateTime"
                    type="datetime-local"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Duration (minutes)</label>
                  <select
                    v-model="appointmentForm.duration"
                    class="form-select"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Appointment Type *</label>
                  <select
                    v-model="appointmentForm.type"
                    class="form-select"
                    required
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Reason for Visit *</label>
                  <input
                    v-model="appointmentForm.reason"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Notes</label>
                  <textarea
                    v-model="appointmentForm.notes"
                    class="form-control"
                    rows="3"
                    placeholder="Additional notes or special instructions"
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModals"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-calendar-plus me-2"></i>
                Schedule Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Appointment Modal -->
    <div
      class="modal fade"
      :class="{ show: showEditModal }"
      :style="{ display: showEditModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Edit Appointment
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <form @submit.prevent="updateAppointment">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Patient Name *</label>
                  <input
                    v-model="appointmentForm.patientName"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Healthcare Provider *</label>
                  <select
                    v-model="appointmentForm.staffName"
                    class="form-select"
                    required
                  >
                    <option value="">Select Provider</option>
                    <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                    <option value="Maria Santos, RN">Maria Santos, RN</option>
                    <option value="Pedro Cruz, BHW">Pedro Cruz, BHW</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Date & Time *</label>
                  <input
                    v-model="appointmentForm.dateTime"
                    type="datetime-local"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Duration (minutes)</label>
                  <select
                    v-model="appointmentForm.duration"
                    class="form-select"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Appointment Type *</label>
                  <select
                    v-model="appointmentForm.type"
                    class="form-select"
                    required
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Reason for Visit *</label>
                  <input
                    v-model="appointmentForm.reason"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label">Notes</label>
                  <textarea
                    v-model="appointmentForm.notes"
                    class="form-control"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModals"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-check-lg me-2"></i>
                Update Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div
      class="modal fade"
      :class="{ show: showCancelModal }"
      :style="{ display: showCancelModal ? 'block' : 'none' }"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Cancel Appointment
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModals"
            ></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to cancel this appointment?</p>
            <div v-if="selectedAppointment" class="alert alert-warning">
              <strong>{{ selectedAppointment.patientName }}</strong
              ><br />
              <small>{{ formatDateTime(selectedAppointment.dateTime) }}</small
              ><br />
              <small>{{ selectedAppointment.reason }}</small>
            </div>
            <p class="text-muted mb-0">
              This action will notify the patient and mark the appointment as
              cancelled.
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModals"
            >
              Keep Appointment
            </button>
            <button
              type="submit"
              class="btn btn-danger"
              @click="cancelAppointment"
            >
              <i class="bi bi-x-circle me-2"></i>
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div
      v-if="showScheduleModal || showEditModal || showCancelModal"
      class="modal-backdrop fade show"
      @click="closeModals"
    ></div>
  </div>
</template>

<style scoped>
.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
}

.search-box input {
  padding-left: 40px;
}

.patient-avatar {
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

.stats-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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

.calendar-placeholder {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.05));
  border-radius: 10px;
}

.appointment-card {
  background-color: var(--light-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }

  .btn-group {
    width: 100%;
  }

  .btn-group .btn {
    flex: 1;
  }
}
</style>
