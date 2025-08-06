<template>
  <div class="calendar-container mt-4">
    <div class="calendar-header">
      <h2>Schedule Patients</h2>
      <div class="month-navigator">
        <button class="nav-arrow" @click="previousYear">&lt;&lt;</button>
        <button class="nav-arrow" @click="previousMonth">&lt;</button>
        <span class="current-month">{{ formatMonthYear(currentDate) }}</span>
        <button class="nav-arrow" @click="nextMonth">&gt;</button>
        <button class="nav-arrow" @click="nextYear">&gt;&gt;</button>
      </div>
      <button @click="scheduleNewAppointment" class="btn btn-success btn-sm">
        <i class="bi bi-plus-circle me-2"></i>New Appointment
      </button>
    </div>
    
    <div class="days-header">
      <div class="day-name">Sunday</div>
      <div class="day-name">Monday</div>
      <div class="day-name">Tuesday</div>
      <div class="day-name">Wednesday</div>
      <div class="day-name">Thursday</div>
      <div class="day-name">Friday</div>
      <div class="day-name">Saturday</div>
    </div>
    
    <div class="calendar-grid">
      <div 
        v-for="day in calendarDays" 
        :key="day.key"
        :class="['day-cell', { 
          'empty': !day.isCurrentMonth, 
          'highlight': day.isToday,
          'has-appointments': day.appointments.length > 0
        }]"
        @click="onDayClick(day)"
      >
        <span class="day-number">{{ day.date }}</span>
        
        <!-- Show appointment count indicator if there are appointments -->
        <i v-if="day.appointments.length > 0 && day.appointments.length <= 2" 
           class="bi bi-calendar-event event-icon"></i>
        
        <!-- Show individual appointments (max 2 visible) -->
        <div 
          v-for="(appointment, index) in day.appointments.slice(0, 2)" 
          :key="appointment.id"
          class="event"
          @click.stop="viewAppointment(appointment)"
        >
          <div class="event-time">{{ formatTime(appointment) }}</div>
          <div class="event-patient">{{ getPatientName(appointment.patientId) }}</div>
        </div>
        
        <!-- Show more indicator if there are more than 2 appointments -->
        <div v-if="day.appointments.length > 2" class="more-events" @click.stop="viewDayAppointments(day)">
          +{{ day.appointments.length - 2 }} more
        </div>
      </div>
    </div>

    <!-- Schedule Appointment Modal -->
    <div v-if="showScheduleModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment' }}</h5>
            <button type="button" class="btn-close" @click="closeScheduleModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAppointment">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="patientSelect" class="form-label">Patient *</label>
                  <select 
                    id="patientSelect" 
                    v-model="newAppointment.patientId" 
                    class="form-select"
                    :class="{ 'is-invalid': formErrors.patientId }"
                  >
                    <option value="">Select a patient</option>
                    <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                      {{ patient.firstName }} {{ patient.lastName }}
                    </option>
                  </select>
                  <div v-if="formErrors.patientId" class="invalid-feedback">{{ formErrors.patientId }}</div>
                </div>
                
                <div class="col-md-3 mb-3">
                  <label for="visitDate" class="form-label">Date *</label>
                  <input 
                    type="date" 
                    id="visitDate" 
                    v-model="newAppointment.visitDate" 
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.visitDate }"
                  >
                  <div v-if="formErrors.visitDate" class="invalid-feedback">{{ formErrors.visitDate }}</div>
                </div>
                
                <div class="col-md-3 mb-3">
                  <label for="visitTime" class="form-label">Time *</label>
                  <input 
                    type="time" 
                    id="visitTime" 
                    v-model="newAppointment.visitTime" 
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.visitTime }"
                  >
                  <div v-if="formErrors.visitTime" class="invalid-feedback">{{ formErrors.visitTime }}</div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="purpose" class="form-label">Purpose/Reason *</label>
                <input 
                  type="text" 
                  id="purpose" 
                  v-model="newAppointment.purpose" 
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.purpose }"
                  placeholder="e.g. Regular check-up, Follow-up consultation"
                >
                <div v-if="formErrors.purpose" class="invalid-feedback">{{ formErrors.purpose }}</div>
              </div>
              
              <div class="mb-3">
                <label for="physicianName" class="form-label">Physician *</label>
                <input 
                  type="text" 
                  id="physicianName" 
                  v-model="newAppointment.physicianName" 
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.physicianName }"
                  placeholder="e.g. Dr. Smith"
                >
                <div v-if="formErrors.physicianName" class="invalid-feedback">{{ formErrors.physicianName }}</div>
              </div>
              
              <div class="mb-3">
                <label for="notes" class="form-label">Notes</label>
                <textarea 
                  id="notes" 
                  v-model="newAppointment.notes" 
                  class="form-control" 
                  rows="3"
                  placeholder="Additional notes or instructions"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="status" class="form-label">Status</label>
                <select v-model="newAppointment.status" class="form-select">
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeScheduleModal">Cancel</button>
            <button type="button" class="btn btn-danger" v-if="editingAppointment" @click="deleteAppointment">Delete</button>
            <button type="button" class="btn btn-primary" @click="saveAppointment">
              {{ editingAppointment ? 'Update' : 'Schedule' }} Appointment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Day Appointments Modal -->
    <div v-if="showDayModal" class="modal fade show" style="display: block;" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Appointments for {{ formatSelectedDate() }}</h5>
            <button type="button" class="btn-close" @click="closeDayModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedDayAppointments.length === 0" class="text-center py-4">
              <p class="text-muted">No appointments scheduled for this day.</p>
              <button class="btn btn-primary" @click="scheduleForSelectedDay">Schedule Appointment</button>
            </div>
            <div v-else>
              <div 
                v-for="appointment in selectedDayAppointments" 
                :key="appointment.id"
                class="appointment-item mb-3 p-3 border rounded"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ getPatientName(appointment.patientId) }}</h6>
                    <p class="mb-1"><strong>Time:</strong> {{ formatTime(appointment) }}</p>
                    <p class="mb-1"><strong>Purpose:</strong> {{ appointment.purpose }}</p>
                    <p class="mb-1"><strong>Physician:</strong> {{ appointment.physicianName }}</p>
                    <span :class="['badge', appointment.status === 'completed' ? 'bg-success' : 'bg-warning']">
                      {{ appointment.status }}
                    </span>
                  </div>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="editAppointment(appointment)">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDayModal">Close</button>
            <button type="button" class="btn btn-success" @click="scheduleForSelectedDay">Add Appointment</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div v-if="showScheduleModal || showDayModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

// Reactive data
const currentDate = ref(new Date());
const visits = computed(() => store.state.visits);
const patients = computed(() => store.state.patients);
const showScheduleModal = ref(false);
const showDayModal = ref(false);
const selectedDay = ref(null);
const editingAppointment = ref(null);
const formErrors = ref({});

const newAppointment = ref({
  patientId: '',
  visitDate: '',
  visitTime: '',
  purpose: '',
  notes: '',
  status: 'upcoming',
  physicianName: ''
});

// Load data on mount
onMounted(() => {
  // Data is automatically loaded by the store actions in main.js
  // Just ensure we have the latest data
  store.dispatch('loadPatients');
  store.dispatch('loadVisits');
});

// Calendar calculations
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // Get first day of month and last day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Get the day of week for first day (0 = Sunday)
  const startDayOfWeek = firstDay.getDay();
  
  // Get last day of previous month
  const prevMonth = new Date(year, month, 0);
  
  const days = [];
  
  // Add days from previous month to fill the first week
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonth.getDate() - i;
    const dayDate = new Date(year, month - 1, date);
    days.push({
      date,
      fullDate: dayDate,
      isCurrentMonth: false,
      isToday: isToday(dayDate),
      appointments: getAppointmentsForDate(dayDate),
      key: `prev-${date}`
    });
  }
  
  // Add days of current month
  for (let date = 1; date <= lastDay.getDate(); date++) {
    const dayDate = new Date(year, month, date);
    days.push({
      date,
      fullDate: dayDate,
      isCurrentMonth: true,
      isToday: isToday(dayDate),
      appointments: getAppointmentsForDate(dayDate),
      key: `current-${date}`
    });
  }
  
  // Add days from next month to fill the last week
  const totalCells = Math.ceil(days.length / 7) * 7;
  let nextDate = 1;
  while (days.length < totalCells) {
    const dayDate = new Date(year, month + 1, nextDate);
    days.push({
      date: nextDate,
      fullDate: dayDate,
      isCurrentMonth: false,
      isToday: isToday(dayDate),
      appointments: getAppointmentsForDate(dayDate),
      key: `next-${nextDate}`
    });
    nextDate++;
  }
  
  return days;
});

const selectedDayAppointments = computed(() => {
  if (!selectedDay.value) return [];
  return getAppointmentsForDate(selectedDay.value.fullDate);
});

// Helper functions
const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const getAppointmentsForDate = (date) => {
  const dateString = date.toISOString().split('T')[0];
  return visits.value.filter(visit => visit.visitDate === dateString);
};

const formatMonthYear = (date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatTime = (appointment) => {
  if (appointment.timestamp) {
    const date = new Date(appointment.timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  return appointment.visitTime || '9:00 AM';
};

const getPatientName = (patientId) => {
  const patient = patients.value.find(p => p.id === patientId);
  return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
};

const formatSelectedDate = () => {
  if (!selectedDay.value) return '';
  return selectedDay.value.fullDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Navigation functions
const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const previousYear = () => {
  currentDate.value = new Date(currentDate.value.getFullYear() - 1, currentDate.value.getMonth(), 1);
};

const nextYear = () => {
  currentDate.value = new Date(currentDate.value.getFullYear() + 1, currentDate.value.getMonth(), 1);
};

// Event handlers
const onDayClick = (day) => {
  if (day.appointments.length === 0) {
    // No appointments, open schedule modal for this day
    scheduleForDate(day.fullDate);
  } else if (day.appointments.length === 1) {
    // One appointment, open it for viewing
    viewAppointment(day.appointments[0]);
  } else {
    // Multiple appointments, show day view
    viewDayAppointments(day);
  }
};

const scheduleNewAppointment = () => {
  resetAppointmentForm();
  editingAppointment.value = null;
  showScheduleModal.value = true;
};

const scheduleForDate = (date) => {
  resetAppointmentForm();
  newAppointment.value.visitDate = date.toISOString().split('T')[0];
  editingAppointment.value = null;
  showScheduleModal.value = true;
};

const scheduleForSelectedDay = () => {
  if (selectedDay.value) {
    scheduleForDate(selectedDay.value.fullDate);
    closeDayModal();
  }
};

const viewAppointment = (appointment) => {
  editingAppointment.value = appointment;
  newAppointment.value = {
    patientId: appointment.patientId,
    visitDate: appointment.visitDate,
    visitTime: appointment.visitTime || '09:00',
    purpose: appointment.purpose,
    notes: appointment.notes || '',
    status: appointment.status,
    physicianName: appointment.physicianName
  };
  formErrors.value = {};
  showScheduleModal.value = true;
};

const editAppointment = (appointment) => {
  closeDayModal();
  viewAppointment(appointment);
};

const viewDayAppointments = (day) => {
  selectedDay.value = day;
  showDayModal.value = true;
};

const resetAppointmentForm = () => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  newAppointment.value = {
    patientId: '',
    visitDate: now.toISOString().split('T')[0],
    visitTime: currentTime,
    purpose: '',
    notes: '',
    status: 'upcoming',
    physicianName: ''
  };
  formErrors.value = {};
};

// Form validation
const validateForm = () => {
  const errors = {};
  
  if (!newAppointment.value.patientId) {
    errors.patientId = 'Please select a patient';
  }
  
  if (!newAppointment.value.visitDate) {
    errors.visitDate = 'Visit date is required';
  }
  
  if (!newAppointment.value.visitTime) {
    errors.visitTime = 'Visit time is required';
  }
  
  if (!newAppointment.value.purpose) {
    errors.purpose = 'Purpose is required';
  }
  
  if (!newAppointment.value.physicianName) {
    errors.physicianName = 'Physician name is required';
  }
  
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// CRUD operations
const saveAppointment = () => {
  if (!validateForm()) {
    return;
  }
  
  const appointmentData = { ...newAppointment.value };
  
  // Create timestamp
  const [hours, minutes] = appointmentData.visitTime.split(':');
  const dateObj = new Date(appointmentData.visitDate);
  dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  appointmentData.timestamp = dateObj.toISOString();
  
  if (editingAppointment.value) {
    // Update existing appointment
    appointmentData.id = editingAppointment.value.id;
    store.commit('updateVisit', appointmentData);
  } else {
    // Create new appointment
    appointmentData.id = Date.now(); // Simple ID generation
    store.commit('addVisit', appointmentData);
  }
  
  closeScheduleModal();
};

const deleteAppointment = () => {
  if (editingAppointment.value && confirm('Are you sure you want to delete this appointment?')) {
    store.commit('deleteVisit', editingAppointment.value.id);
    closeScheduleModal();
  }
};

// Modal management
const closeScheduleModal = () => {
  showScheduleModal.value = false;
  editingAppointment.value = null;
  formErrors.value = {};
};

const closeDayModal = () => {
  showDayModal.value = false;
  selectedDay.value = null;
};
</script>

<style scoped>
.calendar-container {
  max-width: 900px;
  margin: 20px auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  font-family: sans-serif;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #007bff; /* Blue header */
  color: white;
  border-bottom: 1px solid #0056b3;
}

.calendar-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: white;
}

.month-navigator {
  display: flex;
  align-items: center;
}

.nav-arrow {
  font-size: 1rem;
  cursor: pointer;
  margin: 0 5px;
  color: white;
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.nav-arrow:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.current-month {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  margin: 0 10px;
  min-width: 140px;
  text-align: center;
}

.days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #e9ecef; /* Light grey header background */
  border-bottom: 1px solid #ccc;
}

.day-name {
  text-align: center;
  padding: 8px 0;
  font-weight: bold;
  color: #555;
  font-size: 0.8rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 1px;
  background-color: #ccc;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  overflow: hidden;
}

.day-cell {
  background-color: #fff;
  padding: 5px;
  min-height: 80px;
  position: relative;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 0.2s;
}

.day-cell:hover {
  background-color: #f8f9fa;
}

.day-cell.empty {
  background-color: #f8f9fa;
  cursor: default;
}

.day-cell.empty:hover {
  background-color: #f8f9fa;
}

.day-cell.has-appointments {
  background-color: #fff3cd;
}

.day-cell.has-appointments:hover {
  background-color: #ffeaa7;
}

.day-number {
  font-size: 0.8em;
  font-weight: bold;
  color: #555;
  position: absolute;
  top: 5px;
  right: 5px;
}

.day-cell .event {
  background-color: #e9ecef; /* Light grey background for events */
  font-size: 0.7rem;
  padding: 3px 5px;
  border-radius: 3px;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - 6px); /* Adjusted width to account for padding and border */
  box-sizing: border-box;
  color: #333;
  border: 1px solid #ccc; /* Added subtle border to events */
  cursor: pointer;
}

.day-cell .event:first-of-type {
    margin-top: 18px; /* Add space above the first event to clear day number */
}

.day-cell .event-time {
    font-weight: bold;
}

.day-cell .event-patient {
    color: #555;
    margin-top: 1px; /* Adjusted space between time and patient name */
    font-size: 0.9em; /* Slightly larger font for patient name */
}

.day-cell.highlight {
    background-color: #cfe2ff;
}

.event-icon {
    position: absolute;
    bottom: 5px;
    right: 5px;
    font-size: 1rem;
    color: #007bff;
}

/* Apply border radius to bottom-left of the first cell in the last row */
.calendar-grid .day-cell:nth-last-child(-n + 7):first-child {
    border-bottom-left-radius: 5px;
}

/* Apply border radius to bottom-right of the last cell */
.calendar-grid .day-cell:last-child {
    border-bottom-right-radius: 5px;
}

/* Ensure non-corner cells in the last row don't have border radius */
.calendar-grid .day-cell:nth-last-child(-n + 7):not(:first-child):not(:last-child) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

/* Handle edge case where the last row has only one cell which is the first */
.calendar-grid .day-cell:last-child:nth-last-child(1):first-child {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

/* More events indicator */
.more-events {
  font-size: 0.65rem;
  color: #007bff;
  cursor: pointer;
  margin-top: 2px;
  padding: 1px 3px;
  border-radius: 2px;
  background-color: rgba(0, 123, 255, 0.1);
  border: 1px solid rgba(0, 123, 255, 0.2);
  width: fit-content;
}

.more-events:hover {
  background-color: rgba(0, 123, 255, 0.2);
}

/* Appointment item styling in day modal */
.appointment-item {
  transition: background-color 0.2s;
}

.appointment-item:hover {
  background-color: #f8f9fa;
}

/* Modal backdrop fixes */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .calendar-container {
    margin: 10px;
    max-width: none;
  }
  
  .calendar-header {
    padding: 8px 10px;
    flex-direction: column;
    gap: 10px;
  }
  
  .calendar-header h2 {
    font-size: 1rem;
  }
  
  .day-cell {
    min-height: 60px;
    padding: 3px;
  }
  
  .day-cell .event {
    font-size: 0.6rem;
    padding: 2px 3px;
  }
  
  .day-number {
    font-size: 0.7rem;
  }
  
  .current-month {
    min-width: 120px;
    font-size: 0.9rem;
  }
  
  .nav-arrow {
    font-size: 0.9rem;
    padding: 3px 6px;
  }
}

@media (max-width: 480px) {
  .day-name {
    font-size: 0.7rem;
    padding: 6px 0;
  }
  
  .calendar-header {
    padding: 6px 8px;
  }
  
  .day-cell {
    min-height: 50px;
    padding: 2px;
  }
  
  .day-cell .event {
    font-size: 0.55rem;
    padding: 1px 2px;
    margin-top: 2px;
  }
  
  .current-month {
    min-width: 100px;
    font-size: 0.8rem;
  }
}

</style> 