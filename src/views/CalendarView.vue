<template>
  <v-container fluid class="mt-3">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <h1 class="mb-1">Appointment Calendar</h1>
              <p class="text-caption text-medium-emphasis">
                Schedule and manage patient appointments
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                @click="showCreateAppointmentModal = true"
                prepend-icon="mdi-plus"
              >
                New Appointment
              </v-btn>
              <v-btn
                variant="outlined"
                @click="refreshCalendar"
                :loading="isRefreshing"
                prepend-icon="mdi-refresh"
              >
                Refresh
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text>
            <!-- Calendar Filters -->
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedStaff"
                  :items="staffOptions"
                  label="Filter by Staff"
                  variant="outlined"
                  clearable
                  @update:model-value="filterAppointments"
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="Search Appointments"
                  variant="outlined"
                  prepend-inner-icon="mdi-magnify"
                  @input="debounceSearch"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="statusFilter"
                  :items="statusOptions"
                  label="Status Filter"
                  variant="outlined"
                  @update:model-value="filterAppointments"
                ></v-select>
              </v-col>
            </v-row>

            <!-- V-Calendar Component -->
            <div class="calendar-container">
              <v-calendar
                ref="calendarRef"
                v-model="selectedDate"
                :attributes="calendarAttributes"
                :masks="calendarMasks"
                @dayclick="handleDateClick"
                class="v-calendar"
              >
                <template v-slot:day-content="{ day, attributes }">
                  <div class="day-content">
                    <p>{{ day.day }}</p>
                    <div class="day-events">
                      <div
                        v-for="attr in attributes"
                        :key="attr.key"
                        :class="['event-dot', `event-${attr.customData.status}`]"
                        @click.stop="handleEventClick(attr.customData)"
                      ></div>
                    </div>
                  </div>
                </template>
              </v-calendar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create Appointment Modal -->
    <v-dialog
      v-model="showCreateAppointmentModal"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Create New Appointment</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="appointmentForm" @submit.prevent="createAppointment">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newAppointment.patientId"
                  :items="patientOptions"
                  label="Patient *"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newAppointment.staffId"
                  :items="staffOptions"
                  label="Healthcare Provider *"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newAppointment.date"
                  label="Date *"
                  type="date"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newAppointment.startTime"
                  label="Start Time *"
                  type="time"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newAppointment.endTime"
                  label="End Time *"
                  type="time"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newAppointment.notes"
                  label="Notes"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeCreateAppointmentModal"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="createAppointment"
            :loading="isCreatingAppointment"
          >
            Create Appointment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Appointment Details Modal -->
    <v-dialog
      v-model="showAppointmentDetailsModal"
      max-width="600px"
    >
      <v-card v-if="selectedAppointment">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h5">Appointment Details</span>
          <v-btn
            icon
            variant="text"
            @click="showAppointmentDetailsModal = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-chip
                :color="getStatusColor(selectedAppointment.status)"
                variant="flat"
                class="mb-3"
              >
                {{ selectedAppointment.status }}
              </v-chip>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">Patient</div>
              <div class="text-h6">{{ selectedAppointment.patient?.first_name }} {{ selectedAppointment.patient?.surname }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">Healthcare Provider</div>
              <div class="text-h6">{{ selectedAppointment.staff?.first_name }} {{ selectedAppointment.staff?.surname }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">Date & Time</div>
              <div>{{ formatDateTime(selectedAppointment.appointment_date, selectedAppointment.start_time) }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">Duration</div>
              <div>{{ calculateDuration(selectedAppointment.start_time, selectedAppointment.end_time) }}</div>
            </v-col>
            <v-col cols="12" v-if="selectedAppointment.notes">
              <div class="text-subtitle-2 text-medium-emphasis">Notes</div>
              <div>{{ selectedAppointment.notes }}</div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="editAppointment(selectedAppointment)"
          >
            Edit
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            @click="cancelAppointment(selectedAppointment)"
          >
            Cancel Appointment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import AppointmentService from "@/services/appointmentService";
import { patientService as PatientService } from "@/services/patientService";
import { staffService as StaffService } from "@/services/staffService";
import { useNotificationsStore } from "@/stores/notifications";

const store = useStore();
const router = useRouter();
const notificationsStore = useNotificationsStore();

// Reactive data
const calendarRef = ref(null);
const isRefreshing = ref(false);
const isCreatingAppointment = ref(false);
const showCreateAppointmentModal = ref(false);
const showAppointmentDetailsModal = ref(false);
const selectedAppointment = ref(null);
const appointments = ref([]);
const patients = ref([]);
const staff = ref([]);

// Form data
const newAppointment = ref({
  patientId: null,
  staffId: null,
  date: new Date().toISOString().split('T')[0],
  startTime: "09:00",
  endTime: "10:00",
  notes: "",
});

// Filters
const selectedStaff = ref(null);
const searchQuery = ref("");
const statusFilter = ref("all");

const statusOptions = [
  { title: "All", value: "all" },
  { title: "Scheduled", value: "scheduled" },
  { title: "Completed", value: "completed" },
  { title: "Cancelled", value: "cancelled" },
];

// Computed properties
const patientOptions = computed(() => {
  return patients.value.map(patient => ({
    title: `${patient.first_name} ${patient.surname}`,
    value: patient.patient_id,
  }));
});

const staffOptions = computed(() => {
  return staff.value.map(member => ({
    title: `${member.first_name} ${member.surname} (${member.role})`,
    value: member.staff_id,
  }));
});

const filteredAppointments = computed(() => {
  let filtered = appointments.value;

  if (selectedStaff.value) {
    filtered = filtered.filter(apt => apt.staff_id === selectedStaff.value);
  }

  if (statusFilter.value !== "all") {
    filtered = filtered.filter(apt => apt.status === statusFilter.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(apt =>
      apt.patient?.first_name?.toLowerCase().includes(query) ||
      apt.patient?.surname?.toLowerCase().includes(query) ||
      apt.staff?.first_name?.toLowerCase().includes(query) ||
      apt.staff?.surname?.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Calendar attributes for v-calendar
const selectedDate = ref(new Date());

const calendarAttributes = computed(() => {
  return filteredAppointments.value.map(appointment => ({
    key: appointment.appointment_id,
    dates: new Date(appointment.appointment_date),
    customData: appointment,
    highlight: {
      color: getAppointmentColor(appointment.status),
      fillMode: 'solid',
    },
    popover: {
      label: `${appointment.patient?.first_name} ${appointment.patient?.surname}`,
      visibility: 'hover',
    },
  }));
});

const calendarMasks = {
  title: 'MMMM YYYY',
  weekdays: 'WWW',
  dayPopover: 'DD/MM/YYYY',
};

// Methods
const loadAppointments = async () => {
  try {
    const data = await AppointmentService.getAllAppointments();
    appointments.value = data;
  } catch (error) {
    console.error("Error loading appointments:", error);
    notificationsStore.addNotification({
      title: "Error",
      message: "Failed to load appointments",
      type: "error",
    });
  }
};

const loadPatients = async () => {
  try {
    const data = await PatientService.getAllPatients();
    patients.value = data;
  } catch (error) {
    console.error("Error loading patients:", error);
  }
};

const loadStaff = async () => {
  try {
    const data = await StaffService.getAllStaff();
    staff.value = data;
  } catch (error) {
    console.error("Error loading staff:", error);
  }
};

const refreshCalendar = async () => {
  isRefreshing.value = true;
  try {
    await Promise.all([loadAppointments(), loadPatients(), loadStaff()]);
  } finally {
    isRefreshing.value = false;
  }
};

const createAppointment = async () => {
  if (!newAppointment.value.patientId || !newAppointment.value.staffId) {
    notificationsStore.addNotification({
      title: "Validation Error",
      message: "Please select both patient and healthcare provider",
      type: "warning",
    });
    return;
  }

  isCreatingAppointment.value = true;
  try {
    const appointmentData = {
      patient_id: newAppointment.value.patientId,
      staff_id: newAppointment.value.staffId,
      appointment_date: newAppointment.value.date,
      start_time: newAppointment.value.startTime,
      end_time: newAppointment.value.endTime,
      notes: newAppointment.value.notes,
      status: "scheduled",
    };

    await AppointmentService.createAppointment(appointmentData);
    await loadAppointments();

    notificationsStore.addNotification({
      title: "Success",
      message: "Appointment created successfully",
      type: "success",
    });

    closeCreateAppointmentModal();
  } catch (error) {
    console.error("Error creating appointment:", error);
    notificationsStore.addNotification({
      title: "Error",
      message: "Failed to create appointment",
      type: "error",
    });
  } finally {
    isCreatingAppointment.value = false;
  }
};

const closeCreateAppointmentModal = () => {
  showCreateAppointmentModal.value = false;
  newAppointment.value = {
    patientId: null,
    staffId: null,
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00",
    notes: "",
  };
};

const handleEventClick = (appointment) => {
  selectedAppointment.value = appointment;
  showAppointmentDetailsModal.value = true;
};

const handleDateClick = (day) => {
  newAppointment.value.date = day.date.toISOString().split('T')[0];
  showCreateAppointmentModal.value = true;
};

const handleEventDrop = async (info) => {
  try {
    const appointment = info.event.extendedProps.appointment;
    const newDate = info.event.start.toISOString().split('T')[0];
    const newStartTime = info.event.start.toTimeString().slice(0, 5);
    const newEndTime = info.event.end.toTimeString().slice(0, 5);

    await AppointmentService.updateAppointment(appointment.appointment_id, {
      appointment_date: newDate,
      start_time: newStartTime,
      end_time: newEndTime,
    });

    await loadAppointments();
    notificationsStore.addNotification({
      title: "Success",
      message: "Appointment updated successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    info.revert();
    notificationsStore.addNotification({
      title: "Error",
      message: "Failed to update appointment",
      type: "error",
    });
  }
};

const handleEventResize = async (info) => {
  try {
    const appointment = info.event.extendedProps.appointment;
    const newEndTime = info.event.end.toTimeString().slice(0, 5);

    await AppointmentService.updateAppointment(appointment.appointment_id, {
      end_time: newEndTime,
    });

    await loadAppointments();
    notificationsStore.addNotification({
      title: "Success",
      message: "Appointment updated successfully",
      type: "success",
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    info.revert();
    notificationsStore.addNotification({
      title: "Error",
      message: "Failed to update appointment",
      type: "error",
    });
  }
};

const changeView = (view) => {
  if (calendarRef.value) {
    calendarRef.value.getApi().changeView(view);
  }
};

const filterAppointments = () => {
  // Calendar will automatically update due to computed property
};

const debounceSearch = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(filterAppointments, 300);
  };
})();

const editAppointment = (appointment) => {
  // TODO: Implement edit functionality
  console.log("Edit appointment:", appointment);
};

const cancelAppointment = async (appointment) => {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    try {
      await AppointmentService.updateAppointment(appointment.appointment_id, {
        status: "cancelled",
      });
      await loadAppointments();
      showAppointmentDetailsModal.value = false;
      notificationsStore.addNotification({
        title: "Success",
        message: "Appointment cancelled successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      notificationsStore.addNotification({
        title: "Error",
        message: "Failed to cancel appointment",
        type: "error",
      });
    }
  }
};

// Helper functions
const getAppointmentColor = (status) => {
  const colors = {
    scheduled: "#2196F3",
    completed: "#4CAF50",
    cancelled: "#F44336",
    "no-show": "#FF9800",
  };
  return colors[status] || "#9E9E9E";
};

const getStatusColor = (status) => {
  const colors = {
    scheduled: "primary",
    completed: "success",
    cancelled: "error",
    "no-show": "warning",
  };
  return colors[status] || "grey";
};

const formatDateTime = (date, time) => {
  return new Date(`${date}T${time}`).toLocaleString();
};

const calculateDuration = (startTime, endTime) => {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const diff = end - start;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// Lifecycle
onMounted(async () => {
  await refreshCalendar();
});
</script>

<style scoped>
.calendar-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.full-calendar {
  font-family: inherit;
}

:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-header-toolbar) {
  margin-bottom: 1rem !important;
  flex-wrap: wrap;
  gap: 0.5rem;
}

:deep(.fc-button) {
  background: rgb(var(--v-theme-primary)) !important;
  border: none !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

:deep(.fc-button:hover) {
  background: rgb(var(--v-theme-primary-darken-1)) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.fc-button:not(:disabled).fc-button-active) {
  background: rgb(var(--v-theme-primary-darken-2)) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.fc-daygrid-day) {
  transition: background-color 0.2s ease;
}

:deep(.fc-daygrid-day:hover) {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

:deep(.fc-day-today) {
  background-color: rgba(var(--v-theme-warning), 0.1) !important;
}

:deep(.fc-event) {
  border-radius: 4px !important;
  border: none !important;
  font-size: 0.85rem !important;
  font-weight: 500 !important;
  padding: 2px 6px !important;
  transition: all 0.2s ease;
}

:deep(.fc-event:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.fc-event-title) {
  font-weight: 600 !important;
}

:deep(.fc-col-header-cell) {
  background: rgb(var(--v-theme-surface-variant));
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
}

:deep(.fc-timegrid-slot) {
  height: 3rem !important;
}

:deep(.fc-timegrid-axis) {
  font-weight: 600;
}

:deep(.fc-popover) {
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border: none !important;
}

:deep(.fc-popover-header) {
  background: rgb(var(--v-theme-surface-variant)) !important;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant)) !important;
  font-weight: 600 !important;
}

@media (max-width: 768px) {
  :deep(.fc-header-toolbar) {
    flex-direction: column;
    align-items: stretch;
  }

  :deep(.fc-toolbar-chunk) {
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
}
</style>
