<template>
  <div class="calendar-container mt-4">
    <div class="calendar-header">
      <h2>Schedule Patients</h2>
      <div class="d-flex align-items-center">
        <button 
          v-if="userRole === 'admin' || userRole === 'nurse'"
          class="btn btn-sm btn-primary me-3" 
          @click="showAddEventModal = true"
        >
          <i class="bi bi-plus-circle"></i> Add Appointment
        </button>
        <div class="month-navigator">
          <span class="nav-arrow" @click="previousYear">&lt;&lt;</span>
          <span class="nav-arrow" @click="previousMonth">&lt;</span>
          <span class="current-month">{{ currentMonthYear }}</span>
          <span class="nav-arrow" @click="nextMonth">&gt;</span>
          <span class="nav-arrow" @click="nextYear">&gt;&gt;</span>
        </div>
      </div>
    </div>
    
    <div class="days-header">
      <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>
    </div>
    
    <div class="calendar-grid">
      <div 
        v-for="(day, index) in calendarDays" 
        :key="index"
        :class="getDayCellClasses(day)"
        @click="selectDate(day)"
      >
        <span class="day-number">{{ day.date }}</span>
        
        <div 
          v-for="event in day.events" 
          :key="event.id"
          class="event"
          @click.stop="viewEvent(event)"
        >
          <div class="event-time">{{ event.time }}</div>
          <div class="event-patient">{{ event.patient }}</div>
        </div>
        
        <i 
          v-if="day.events.length > 0" 
          class="bi bi-calendar-event event-icon"
        ></i>
      </div>
    </div>
  </div>
  
  <!-- Add Event Modal -->
  <div class="modal fade" :class="{ 'd-block show': showAddEventModal }" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add New Appointment</h5>
          <button type="button" class="btn-close" @click="showAddEventModal = false"></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label class="form-label">Date</label>
              <input type="date" class="form-control" v-model="newEvent.date" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Time</label>
              <input type="time" class="form-control" v-model="newEvent.time" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Patient</label>
              <select class="form-select" v-model="newEvent.patientId" required>
                <option value="">Select a patient</option>
                <option v-for="patient in patients" :key="patient.id" :value="patient.id">
                  {{ patient.firstName }} {{ patient.lastName }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Duration (minutes)</label>
              <input type="number" class="form-control" v-model="newEvent.duration" min="15" step="15" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" v-model="newEvent.description" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showAddEventModal = false">Cancel</button>
          <button type="button" class="btn btn-primary" @click="saveNewEvent">Save Appointment</button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddEventModal"></div>
  </div>
  
  <!-- Event Details Modal -->
  <div class="modal fade" :class="{ 'd-block show': showEventDetailsModal }" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content" v-if="currentEvent">
        <div class="modal-header">
          <h5 class="modal-title">Appointment Details</h5>
          <button type="button" class="btn-close" @click="showEventDetailsModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <h6>Patient</h6>
            <p>{{ currentEvent.patient }}</p>
          </div>
          <div class="mb-3">
            <h6>Date & Time</h6>
            <p>{{ currentEvent.date }} at {{ currentEvent.time }}</p>
          </div>
          <div class="mb-3" v-if="currentEvent.duration">
            <h6>Duration</h6>
            <p>{{ currentEvent.duration }} minutes</p>
          </div>
          <div class="mb-3" v-if="currentEvent.description">
            <h6>Description</h6>
            <p>{{ currentEvent.description }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showEventDetailsModal = false">Close</button>
          <button 
            v-if="userRole === 'admin' || (userRole === 'nurse' && currentEvent.nurseId === userId)"
            type="button" 
            class="btn btn-danger" 
            @click="deleteEvent"
          >
            Delete
          </button>
          <button 
            v-if="userRole === 'admin' || (userRole === 'nurse' && currentEvent.nurseId === userId)"
            type="button" 
            class="btn btn-primary" 
            @click="editEvent"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showEventDetailsModal"></div>
  </div>
  
  <!-- Edit Event Modal -->
  <div class="modal fade" :class="{ 'd-block show': showEditEventModal }" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content" v-if="currentEvent">
        <div class="modal-header">
          <h5 class="modal-title">Edit Appointment</h5>
          <button type="button" class="btn-close" @click="showEditEventModal = false"></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label class="form-label">Date</label>
              <input type="date" class="form-control" v-model="currentEvent.date" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Time</label>
              <input type="time" class="form-control" v-model="currentEvent.time" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Duration (minutes)</label>
              <input type="number" class="form-control" v-model="currentEvent.duration" min="15" step="15" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" v-model="currentEvent.description" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showEditEventModal = false">Cancel</button>
          <button type="button" class="btn btn-primary" @click="updateEvent">Update Appointment</button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showEditEventModal"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { addNotification } from '../utils/notificationUtils'

export default {
  name: 'CalendarView',
  setup() {
    const store = useStore()
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    
    // Get current user
    const currentUser = computed(() => store.state.user)
    const userRole = computed(() => currentUser.value?.role || 'patient')
    const userId = computed(() => currentUser.value?.id)
    
    // Events data
    const allEvents = ref([])
    const showAddEventModal = ref(false)
    const showEventDetailsModal = ref(false)
    const showEditEventModal = ref(false)
    const currentEvent = ref(null)
    
    // New event form data
    const newEvent = ref({
      id: '',
      date: '',
      time: '',
      patient: '',
      patientId: '',
      description: '',
      type: 'appointment',
      nurseId: '',
      duration: 30 // minutes
    })
    
    // Get patients list
    const patients = computed(() => store.state.patients || [])
    
    // Filter events based on user role
    const events = computed(() => {
      if (userRole.value === 'patient') {
        // Patients can only see their own appointments
        return allEvents.value.filter(event => event.patientId === userId.value)
      } else if (userRole.value === 'nurse') {
        // Nurses can see all patient appointments they're responsible for
        return allEvents.value.filter(event => 
          event.nurseId === userId.value || 
          event.type === 'clinic'
        )
      } else if (userRole.value === 'admin') {
        // Admins can see all appointments
        return allEvents.value
      }
      return []
    })

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const currentMonthYear = computed(() => {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      return `${months[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
    })

    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      
      // First day of the month
      const firstDay = new Date(year, month, 1)
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0)
      // First day of the week for the first day of the month (0 = Sunday)
      const firstDayOfWeek = firstDay.getDay()
      // Number of days in the month
      const daysInMonth = lastDay.getDate()
      
      const days = []
      
      // Add previous month's trailing days
      const prevMonth = month === 0 ? 11 : month - 1
      const prevYear = month === 0 ? year - 1 : year
      const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate()
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = prevMonthLastDay - i
        const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
        days.push({
          date,
          isCurrentMonth: false,
          isToday: false,
          dateString: dateStr,
          events: getEventsForDate(dateStr)
        })
      }
      
      // Add current month's days
      for (let date = 1; date <= daysInMonth; date++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
        const today = new Date()
        const isToday = year === today.getFullYear() && 
                       month === today.getMonth() && 
                       date === today.getDate()
        
        days.push({
          date,
          isCurrentMonth: true,
          isToday,
          dateString: dateStr,
          events: getEventsForDate(dateStr)
        })
      }
      
      // Add next month's leading days to complete the grid (42 cells = 6 weeks)
      const remainingCells = 42 - days.length
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      
      for (let date = 1; date <= remainingCells; date++) {
        const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
        days.push({
          date,
          isCurrentMonth: false,
          isToday: false,
          dateString: dateStr,
          events: getEventsForDate(dateStr)
        })
      }
      
      return days
    })

    const getEventsForDate = (dateString) => {
      return events.value.filter(event => event.date === dateString)
    }

    const getDayCellClasses = (day) => {
      const classes = ['day-cell']
      
      if (!day.isCurrentMonth) {
        classes.push('empty')
      }
      
      if (day.isToday) {
        classes.push('today')
      }
      
      if (selectedDate.value && selectedDate.value === day.dateString) {
        classes.push('selected')
      }
      
      if (day.events.length > 2) {
        classes.push('busy')
      }
      
      return classes
    }

    const previousMonth = () => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() - 1)
      currentDate.value = newDate
    }

    const nextMonth = () => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() + 1)
      currentDate.value = newDate
    }

    const previousYear = () => {
      const newDate = new Date(currentDate.value)
      newDate.setFullYear(newDate.getFullYear() - 1)
      currentDate.value = newDate
    }

    const nextYear = () => {
      const newDate = new Date(currentDate.value)
      newDate.setFullYear(newDate.getFullYear() + 1)
      currentDate.value = newDate
    }

    const selectDate = (day) => {
      if (day.isCurrentMonth) {
        selectedDate.value = day.dateString
        // You can emit an event here or call a method to handle date selection
        console.log('Selected date:', day.dateString)
      }
    }

    const viewEvent = (event) => {
      currentEvent.value = { ...event }
      showEventDetailsModal.value = true
    }
    
    const editEvent = () => {
      showEventDetailsModal.value = false
      showEditEventModal.value = true
    }
    
    const deleteEvent = () => {
      if (!confirm('Are you sure you want to delete this appointment?')) {
        return
      }
      
      // Remove event from the list
      allEvents.value = allEvents.value.filter(e => e.id !== currentEvent.value.id)
      
      // Save to localStorage
      localStorage.setItem('calendarEvents', JSON.stringify(allEvents.value))
      
      // Create notification
      addNotification(store, {
        title: 'Appointment Deleted',
        message: `Appointment for ${currentEvent.value.patient} on ${currentEvent.value.date} at ${currentEvent.value.time} has been deleted.`,
        type: 'warning',
        noButtons: true
      })
      
      // Close modal
      showEventDetailsModal.value = false
      
      // Show success message
      alert('Appointment deleted successfully!')
    }
    
    const prepareNewEvent = (date) => {
      newEvent.value = {
        id: Date.now().toString(),
        date: date || selectedDate.value,
        time: '09:00',
        patient: '',
        patientId: '',
        description: '',
        type: 'appointment',
        nurseId: userRole.value === 'nurse' ? userId.value : '',
        duration: 30
      }
      showAddEventModal.value = true
    }
    
    const saveNewEvent = () => {
      // Validate form
      if (!newEvent.value.date || !newEvent.value.time || !newEvent.value.patientId) {
        alert('Please fill in all required fields')
        return
      }
      
      // Find patient name from ID
      const patient = patients.value.find(p => p.id === newEvent.value.patientId)
      if (patient) {
        newEvent.value.patient = `${patient.firstName} ${patient.lastName}`
      }
      
      // Add event to the list
      allEvents.value.push({ ...newEvent.value })
      
      // Save to localStorage
      localStorage.setItem('calendarEvents', JSON.stringify(allEvents.value))
      
      // Create notification for patient
      addNotification(store, {
        title: 'New Appointment',
        message: `You have a new appointment scheduled on ${newEvent.value.date} at ${newEvent.value.time}.`,
        type: 'info',
        recipientId: newEvent.value.patientId,
        noButtons: true
      })
      
      // Close modal
      showAddEventModal.value = false
      
      // Show success message
      alert('Appointment added successfully!')
    }
    
    const updateEvent = () => {
      // Validate form
      if (!currentEvent.value.date || !currentEvent.value.time) {
        alert('Please fill in all required fields')
        return
      }
      
      // Update event in the list
      const index = allEvents.value.findIndex(e => e.id === currentEvent.value.id)
      if (index !== -1) {
        allEvents.value[index] = { ...currentEvent.value }
      }
      
      // Save to localStorage
      localStorage.setItem('calendarEvents', JSON.stringify(allEvents.value))
      
      // Create notification for patient
      addNotification(store, {
        title: 'Appointment Updated',
        message: `Your appointment has been updated to ${currentEvent.value.date} at ${currentEvent.value.time}.`,
        type: 'info',
        recipientId: currentEvent.value.patientId,
        noButtons: true
      })
      
      // Close modal
      showEditEventModal.value = false
      
      // Show success message
      alert('Appointment updated successfully!')
    }

    onMounted(() => {
      // Set today as initial selected date
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      selectedDate.value = todayStr
      
      // Load events from localStorage
      const savedEvents = localStorage.getItem('calendarEvents')
      if (savedEvents) {
        allEvents.value = JSON.parse(savedEvents)
      }
    })

    return {
      currentDate,
      selectedDate,
      events,
      dayNames,
      currentMonthYear,
      calendarDays,
      getDayCellClasses,
      previousMonth,
      nextMonth,
      previousYear,
      nextYear,
      selectDate,
      viewEvent,
      showAddEventModal,
      showEventDetailsModal,
      showEditEventModal,
      currentEvent,
      newEvent,
      patients,
      prepareNewEvent,
      saveNewEvent,
      editEvent,
      updateEvent,
      deleteEvent,
      userRole
    }
  }
}
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
  background-color: #007bff;
  color: white;
  border-bottom: 1px solid #0056b3;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: block;
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
  padding: 5px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.nav-arrow:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.current-month {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  margin: 0 10px;
  min-width: 120px;
  text-align: center;
}

.days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #e9ecef;
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
  color: #999;
}

.day-cell.empty:hover {
  background-color: #e9ecef;
}

.day-cell.today {
  background-color: #fff3cd;
  border: 2px solid #ffc107;
}

.day-cell.selected {
  background-color: #cfe2ff;
  border: 2px solid #007bff;
}

.day-cell.busy {
  background-color: #ffe6e6;
}

.day-number {
  font-size: 0.8em;
  font-weight: bold;
  color: #555;
  position: absolute;
  top: 5px;
  right: 5px;
}

.day-cell.empty .day-number {
  color: #ccc;
}

.day-cell.today .day-number {
  color: #856404;
  font-weight: 900;
}

.day-cell .event {
  background-color: #e9ecef;
  font-size: 0.7rem;
  padding: 2px 4px;
  border-radius: 3px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - 6px);
  box-sizing: border-box;
  color: #333;
  border: 1px solid #ccc;
  cursor: pointer;
  transition: background-color 0.2s;
}

.day-cell .event:hover {
  background-color: #dee2e6;
}

.day-cell .event:first-of-type {
  margin-top: 18px;
}

.day-cell .event-time {
  font-weight: bold;
  font-size: 0.65rem;
}

.day-cell .event-patient {
  color: #555;
  margin-top: 1px;
  font-size: 0.6rem;
}

.event-icon {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 1rem;
  color: #007bff;
  pointer-events: none;
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
</style>