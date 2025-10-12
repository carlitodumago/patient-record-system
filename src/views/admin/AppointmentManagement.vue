<template>
  <div class="container-fluid mt-3">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="mb-1">Appointment Management</h1>
            <p class="text-muted">Schedule and manage patient appointments</p>
          </div>
          <button
            class="btn btn-primary"
            @click="showCreateAppointmentModal = true"
          >
            <i class="bi bi-plus-circle me-2"></i>
            Schedule Appointment
          </button>
        </div>

        <!-- Appointment Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ appointmentStats.totalAppointments }}
                  </h5>
                  <small>Total Appointments</small>
                </div>
                <i class="bi bi-calendar-check fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ appointmentStats.todayAppointments }}
                  </h5>
                  <small>Today's Appointments</small>
                </div>
                <i class="bi bi-calendar-day fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">
                    {{ appointmentStats.monthlyAppointments }}
                  </h5>
                  <small>This Month</small>
                </div>
                <i class="bi bi-calendar-month fs-3"></i>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-dark">
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title mb-0">{{ getScheduledCount() }}</h5>
                  <small>Scheduled</small>
                </div>
                <i class="bi bi-clock-history fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and View Toggle -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-3">
                <select
                  v-model="appointmentFilters.status"
                  @change="loadAppointments"
                  class="form-select"
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
              <div class="col-md-3">
                <input
                  type="date"
                  v-model="appointmentFilters.dateFrom"
                  @change="loadAppointments"
                  class="form-control"
                  placeholder="From Date"
                />
              </div>
              <div class="col-md-3">
                <input
                  type="date"
                  v-model="appointmentFilters.dateTo"
                  @change="loadAppointments"
                  class="form-control"
                  placeholder="To Date"
                />
              </div>
              <div class="col-md-3">
                <div class="btn-group w-100">
                  <button
                    @click="viewMode = 'list'"
                    class="btn"
                    :class="
                      viewMode === 'list'
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    "
                  >
                    <i class="bi bi-list-ul me-2"></i>List
                  </button>
                  <button
                    @click="viewMode = 'calendar'"
                    class="btn"
                    :class="
                      viewMode === 'calendar'
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    "
                  >
                    <i class="bi bi-calendar me-2"></i>Calendar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Appointments List View -->
        <div v-if="viewMode === 'list'" class="card">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">Appointments</h5>
            <div class="d-flex gap-2">
              <div class="input-group input-group-sm" style="width: 250px">
                <input
                  type="text"
                  v-model="appointmentFilters.search"
                  @input="debounceSearch"
                  class="form-control"
                  placeholder="Search appointments..."
                />
                <button class="btn btn-outline-secondary" type="button">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div v-if="isLoading" class="text-center p-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="appointments.length === 0" class="text-center p-4">
              <i class="bi bi-calendar-x fs-1 text-muted mb-3"></i>
              <h5 class="text-muted">No appointments found</h5>
              <p class="text-muted">
                Schedule your first appointment to get started
              </p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Staff</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="appointment in appointments"
                    :key="appointment.appointment_id"
                  >
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar-sm me-3">
                          <div
                            class="avatar-title bg-info-subtle text-info rounded-circle"
                          >
                            {{ getPatientInitials(appointment.patient) }}
                          </div>
                        </div>
                        <div>
                          <h6 class="mb-0">
                            {{ getPatientName(appointment.patient) }}
                          </h6>
                          <small class="text-muted">{{
                            appointment.patient?.contact_number
                          }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {{ formatDateTime(appointment.appointment_date) }}
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark"
                        >{{ appointment.duration_minutes || 30 }} min</span
                      >
                    </td>
                    <td>
                      <span :class="getStatusBadgeClass(appointment.status)">
                        {{ formatStatus(appointment.status) }}
                      </span>
                    </td>
                    <td>
                      <span
                        class="text-truncate d-inline-block"
                        style="max-width: 150px"
                        :title="appointment.reason"
                      >
                        {{ appointment.reason || "General consultation" }}
                      </span>
                    </td>
                    <td>
                      <div v-if="appointment.scheduled_by_staff">
                        <div>
                          {{ appointment.scheduled_by_staff.first_name }}
                          {{ appointment.scheduled_by_staff.surname }}
                        </div>
                        <small class="text-muted">{{
                          appointment.scheduled_by_staff.specialization
                        }}</small>
                      </div>
                      <span v-else class="text-muted">Not assigned</span>
                    </td>
                    <td>
                      <div class="dropdown">
                        <button
                          class="btn btn-sm btn-outline-secondary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          Actions
                        </button>
                        <ul class="dropdown-menu">
                          <li>
                            <button
                              class="dropdown-item"
                              @click="viewAppointment(appointment)"
                            >
                              <i class="bi bi-eye me-2"></i>View Details
                            </button>
                          </li>
                          <li>
                            <button
                              class="dropdown-item"
                              @click="editAppointment(appointment)"
                            >
                              <i class="bi bi-pencil me-2"></i>Edit
                            </button>
                          </li>
                          <li>
                            <button
                              class="dropdown-item"
                              @click="rescheduleAppointment(appointment)"
                            >
                              <i class="bi bi-arrow-clockwise me-2"></i
                              >Reschedule
                            </button>
                          </li>
                          <li><hr class="dropdown-divider" /></li>
                          <li>
                            <button
                              class="dropdown-item text-danger"
                              @click="cancelAppointment(appointment)"
                            >
                              <i class="bi bi-x-circle me-2"></i>Cancel
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Calendar View (Placeholder) -->
        <div v-else-if="viewMode === 'calendar'" class="card">
          <div class="card-body text-center p-5">
            <i class="bi bi-calendar-week fs-1 text-muted mb-3"></i>
            <h5 class="text-muted">Calendar View</h5>
            <p class="text-muted">
              Interactive calendar view will be implemented here
            </p>
            <button class="btn btn-primary" @click="viewMode = 'list'">
              <i class="bi bi-list-ul me-2"></i>Switch to List View
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Appointment Modal -->
    <div
      class="modal fade"
      :class="{ show: showCreateAppointmentModal }"
      :style="{ display: showCreateAppointmentModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Schedule New Appointment</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeCreateAppointmentModal"
            ></button>
          </div>
          <form @submit.prevent="createNewAppointment">
            <div class="modal-body">
              <!-- Patient Selection -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label">Patient</label>
                  <select
                    v-model="newAppointment.patientId"
                    class="form-select"
                    required
                  >
                    <option value="">Select Patient</option>
                    <option
                      v-for="patient in availablePatients"
                      :key="patient.patient_id"
                      :value="patient.patient_id"
                    >
                      {{ patient.first_name }} {{ patient.surname }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Staff Selection -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label">Healthcare Provider</label>
                  <select
                    v-model="newAppointment.staffId"
                    class="form-select"
                    required
                  >
                    <option value="">Select Staff Member</option>
                    <option
                      v-for="staff in availableStaff"
                      :key="staff.staff_id"
                      :value="staff.staff_id"
                    >
                      {{ staff.first_name }} {{ staff.surname }} -
                      {{ staff.specialization }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Date and Time -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Date</label>
                  <input
                    type="date"
                    v-model="newAppointment.date"
                    class="form-control"
                    :min="today"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Time</label>
                  <select
                    v-model="newAppointment.time"
                    class="form-select"
                    required
                  >
                    <option value="">Select Time</option>
                    <option
                      v-for="slot in timeSlots"
                      :key="slot.value"
                      :value="slot.value"
                    >
                      {{ slot.label }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Duration and Reason -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Duration (minutes)</label>
                  <select
                    v-model="newAppointment.duration"
                    class="form-select"
                    required
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Reason for Visit</label>
                  <select
                    v-model="newAppointment.reason"
                    class="form-select"
                    required
                  >
                    <option value="">Select Reason</option>
                    <option value="General Consultation">
                      General Consultation
                    </option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Check-up">Check-up</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <!-- Notes -->
              <div class="row mb-3">
                <div class="col-12">
                  <label class="form-label">Notes (Optional)</label>
                  <textarea
                    v-model="newAppointment.notes"
                    class="form-control"
                    rows="3"
                    placeholder="Additional notes or special instructions..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeCreateAppointmentModal"
                :disabled="isCreating"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isCreating || !isAppointmentFormValid"
              >
                <span
                  v-if="isCreating"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                Schedule Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Backdrop for modal -->
    <div
      v-if="showCreateAppointmentModal"
      class="modal-backdrop fade show"
      @click="closeCreateAppointmentModal"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useNotificationsStore } from "@/stores/notifications";
import AppointmentService from "@/services/appointmentService";
import { patientService as PatientService } from "@/services/patientService";
import { staffService as StaffService } from "@/services/staffService";

const notificationsStore = useNotificationsStore();

// Reactive data
const showCreateAppointmentModal = ref(false);
const isCreating = ref(false);
const appointments = ref([]);
const availablePatients = ref([]);
const availableStaff = ref([]);
const isLoading = ref(true);
const viewMode = ref("list");

const appointmentFilters = ref({
  search: "",
  status: "",
  dateFrom: "",
  dateTo: "",
});

const appointmentStats = ref({
  totalAppointments: 0,
  todayAppointments: 0,
  monthlyAppointments: 0,
  statusDistribution: {},
});

// New appointment form data
const newAppointment = ref({
  patientId: "",
  staffId: "",
  date: "",
  time: "",
  duration: "30",
  reason: "",
  notes: "",
});

// Time slots for appointment scheduling
const timeSlots = [
  { value: "08:00", label: "8:00 AM" },
  { value: "08:30", label: "8:30 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "09:30", label: "9:30 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "10:30", label: "10:30 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "11:30", label: "11:30 AM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "13:30", label: "1:30 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "14:30", label: "2:30 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "15:30", label: "3:30 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "16:30", label: "4:30 PM" },
];

// Computed properties
const today = computed(() => {
  return new Date().toISOString().split("T")[0];
});

const isAppointmentFormValid = computed(() => {
  return (
    newAppointment.value.patientId &&
    newAppointment.value.staffId &&
    newAppointment.value.date &&
    newAppointment.value.time &&
    newAppointment.value.reason
  );
});

const getScheduledCount = () => {
  return appointments.value.filter((apt) => apt.status === "scheduled").length;
};

// Methods
const loadAppointments = async () => {
  isLoading.value = true;
  try {
    let appointmentsData;

    // Apply filters
    if (appointmentFilters.value.search) {
      appointmentsData = await AppointmentService.searchAppointments(
        appointmentFilters.value.search
      );
    } else if (
      appointmentFilters.value.dateFrom ||
      appointmentFilters.value.dateTo
    ) {
      const startDate =
        appointmentFilters.value.dateFrom ||
        new Date().toISOString().split("T")[0];
      const endDate =
        appointmentFilters.value.dateTo ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      appointmentsData = await AppointmentService.getAppointmentsByDateRange(
        startDate,
        endDate
      );
    } else {
      appointmentsData = await AppointmentService.getAllAppointments();
    }

    // Apply status filter
    if (appointmentFilters.value.status) {
      appointmentsData = appointmentsData.filter(
        (apt) => apt.Status === appointmentFilters.value.status
      );
    }

    appointments.value = appointmentsData;
  } catch (error) {
    notificationsStore.addNotification({
      title: "Error Loading Appointments",
      message: error.message,
      type: "danger",
    });
  } finally {
    isLoading.value = false;
  }
};

const loadAppointmentStats = async () => {
  try {
    const stats = await AppointmentService.getAppointmentStatistics();
    appointmentStats.value = stats;
  } catch (error) {
    console.error("Error loading appointment statistics:", error);
  }
};

const loadAvailablePatients = async () => {
  try {
    const patients = await PatientService.getAllPatients();
    availablePatients.value = patients.patients || [];
  } catch (error) {
    console.error("Error loading patients:", error);
  }
};

const loadAvailableStaff = async () => {
  try {
    const staff = await StaffService.getAllStaff();
    availableStaff.value = staff.filter((s) => s.user?.role_id === 2); // Only nurses
  } catch (error) {
    console.error("Error loading staff:", error);
  }
};

const debounceSearch = debounce(() => {
  loadAppointments();
}, 500);

const createNewAppointment = async () => {
  if (!isAppointmentFormValid.value) return;

  isCreating.value = true;
  try {
    // Combine date and time
    const appointmentDateTime = new Date(
      `${newAppointment.value.date}T${newAppointment.value.time}`
    ).toISOString();

    const appointmentData = {
      patientId: newAppointment.value.patientId,
      scheduledBy: newAppointment.value.staffId,
      appointmentDate: appointmentDateTime,
      durationMinutes: parseInt(newAppointment.value.duration),
      reason: newAppointment.value.reason,
      notes: newAppointment.value.notes,
      status: "scheduled",
    };

    const newAppointmentResult = await AppointmentService.createAppointment(
      appointmentData
    );

    notificationsStore.addNotification({
      title: "Appointment Scheduled",
      message: `New appointment scheduled for ${formatDateTime(
        appointmentDateTime
      )}`,
      type: "success",
    });

    closeCreateAppointmentModal();
    resetAppointmentForm();

    // Refresh appointments list and statistics
    await loadAppointments();
    await loadAppointmentStats();
  } catch (error) {
    notificationsStore.addNotification({
      title: "Error Scheduling Appointment",
      message: error.message,
      type: "danger",
    });
  } finally {
    isCreating.value = false;
  }
};

const viewAppointment = (appointment) => {
  // TODO: Navigate to appointment details page
  console.log("View appointment:", appointment);
};

const editAppointment = (appointment) => {
  // TODO: Open edit appointment modal
  console.log("Edit appointment:", appointment);
};

const rescheduleAppointment = (appointment) => {
  // TODO: Open reschedule modal
  console.log("Reschedule appointment:", appointment);
};

const cancelAppointment = async (appointment) => {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    try {
      await AppointmentService.cancelAppointment(
        appointment.appointment_id,
        "Cancelled by admin"
      );

      notificationsStore.addNotification({
        title: "Appointment Cancelled",
        message: `Appointment for ${getPatientName(
          appointment.patient
        )} has been cancelled`,
        type: "warning",
      });

      await loadAppointments();
      await loadAppointmentStats();
    } catch (error) {
      notificationsStore.addNotification({
        title: "Error",
        message: "Failed to cancel appointment",
        type: "danger",
      });
    }
  }
};

const closeCreateAppointmentModal = () => {
  showCreateAppointmentModal.value = false;
  resetAppointmentForm();
};

const resetAppointmentForm = () => {
  newAppointment.value = {
    patientId: "",
    staffId: "",
    date: "",
    time: "",
    duration: "30",
    reason: "",
    notes: "",
  };
};

// Helper functions
const getPatientInitials = (patient) => {
  return `${patient.first_name[0]}${patient.surname[0]}`.toUpperCase();
};

const getPatientName = (patient) => {
  return `${patient.first_name} ${patient.surname}`;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    scheduled: "badge bg-primary",
    confirmed: "badge bg-info",
    in_progress: "badge bg-warning",
    completed: "badge bg-success",
    cancelled: "badge bg-danger",
    no_show: "badge bg-secondary",
  };
  return classes[status] || "badge bg-secondary";
};

const formatStatus = (status) => {
  return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Lifecycle
onMounted(async () => {
  await loadAppointments();
  await loadAppointmentStats();
  await loadAvailablePatients();
  await loadAvailableStaff();
});
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.avatar-sm {
  width: 2.5rem;
  height: 2.5rem;
}

.avatar-title {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.dropdown-toggle::after {
  display: none;
}

.modal-content {
  border-radius: 10px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
</style>
