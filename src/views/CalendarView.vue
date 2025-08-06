<template>
  <div class="calendar-container mt-4">
    <div class="calendar-header">
      <h2>Schedule Patients</h2>
      <div class="month-navigator">
        <span class="nav-arrow" @click="previousYear">&lt;&lt;</span>
        <span class="nav-arrow" @click="previousMonth">&lt;</span>
        <span class="current-month">{{ currentMonthYear }}</span>
        <span class="nav-arrow" @click="nextMonth">&gt;</span>
        <span class="nav-arrow" @click="nextYear">&gt;&gt;</span>
      </div>
      <button class="btn btn-success btn-sm" @click="openAddEventModal">
        <i class="bi bi-plus-circle me-1"></i>Add Event
      </button>
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
          <div class="event-actions">
            <i class="bi bi-pencil-square edit-icon" @click.stop="editEvent(event)" title="Edit"></i>
            <i class="bi bi-trash delete-icon" @click.stop="deleteEvent(event)" title="Delete"></i>
          </div>
        </div>
        
        <i 
          v-if="day.events.length > 0" 
          class="bi bi-calendar-event event-icon"
        ></i>
        
        <!-- Quick add button on hover -->
        <button 
          v-if="day.isCurrentMonth"
          class="quick-add-btn"
          @click.stop="quickAddEvent(day.dateString)"
          title="Add event"
        >
          <i class="bi bi-plus"></i>
        </button>
      </div>
    </div>

    <!-- Event Modal -->
    <div v-if="showEventModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditMode ? 'Edit Event' : 'Add New Event' }}
            </h5>
            <button type="button" class="btn-close" @click="closeEventModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEvent">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="eventDate" class="form-label">Date *</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      id="eventDate"
                      v-model="eventForm.date"
                      :class="{ 'is-invalid': errors.date }"
                      required
                    >
                    <div v-if="errors.date" class="invalid-feedback">{{ errors.date }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="eventTime" class="form-label">Time *</label>
                    <input 
                      type="time" 
                      class="form-control" 
                      id="eventTime"
                      v-model="eventForm.time"
                      :class="{ 'is-invalid': errors.time }"
                      required
                    >
                    <div v-if="errors.time" class="invalid-feedback">{{ errors.time }}</div>
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="eventPatient" class="form-label">Patient Name *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="eventPatient"
                  v-model="eventForm.patient"
                  :class="{ 'is-invalid': errors.patient }"
                  placeholder="Enter patient name"
                  required
                >
                <div v-if="errors.patient" class="invalid-feedback">{{ errors.patient }}</div>
              </div>

              <div class="mb-3">
                <label for="eventType" class="form-label">Appointment Type</label>
                <select class="form-select" id="eventType" v-model="eventForm.type">
                  <option value="">Select type</option>
                  <option value="consultation">Consultation</option>
                  <option value="checkup">Check-up</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="procedure">Procedure</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="eventNotes" class="form-label">Notes</label>
                <textarea 
                  class="form-control" 
                  id="eventNotes"
                  v-model="eventForm.notes"
                  rows="3"
                  placeholder="Additional notes..."
                ></textarea>
              </div>

              <div class="mb-3">
                <label for="eventDuration" class="form-label">Duration (minutes)</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="eventDuration"
                  v-model="eventForm.duration"
                  min="15"
                  max="480"
                  step="15"
                  placeholder="30"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeEventModal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveEvent" :disabled="!isFormValid">
              {{ isEditMode ? 'Update Event' : 'Create Event' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="showEventDetailsModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Event Details</h5>
            <button type="button" class="btn-close" @click="closeEventDetailsModal"></button>
          </div>
          <div class="modal-body" v-if="selectedEventDetails">
            <div class="row mb-3">
              <div class="col-sm-4"><strong>Date:</strong></div>
              <div class="col-sm-8">{{ formatDate(selectedEventDetails.date) }}</div>
            </div>
            <div class="row mb-3">
              <div class="col-sm-4"><strong>Time:</strong></div>
              <div class="col-sm-8">{{ selectedEventDetails.time }}</div>
            </div>
            <div class="row mb-3">
              <div class="col-sm-4"><strong>Patient:</strong></div>
              <div class="col-sm-8">{{ selectedEventDetails.patient }}</div>
            </div>
            <div class="row mb-3" v-if="selectedEventDetails.type">
              <div class="col-sm-4"><strong>Type:</strong></div>
              <div class="col-sm-8">
                <span class="badge bg-info">{{ selectedEventDetails.type }}</span>
              </div>
            </div>
            <div class="row mb-3" v-if="selectedEventDetails.duration">
              <div class="col-sm-4"><strong>Duration:</strong></div>
              <div class="col-sm-8">{{ selectedEventDetails.duration }} minutes</div>
            </div>
            <div class="row mb-3" v-if="selectedEventDetails.notes">
              <div class="col-sm-4"><strong>Notes:</strong></div>
              <div class="col-sm-8">{{ selectedEventDetails.notes }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="editEvent(selectedEventDetails)">
              <i class="bi bi-pencil-square me-1"></i>Edit
            </button>
            <button type="button" class="btn btn-danger" @click="deleteEvent(selectedEventDetails)">
              <i class="bi bi-trash me-1"></i>Delete
            </button>
            <button type="button" class="btn btn-secondary" @click="closeEventDetailsModal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close" @click="closeDeleteConfirmModal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this event?</p>
            <div v-if="eventToDelete" class="alert alert-warning">
              <strong>{{ eventToDelete.patient }}</strong><br>
              {{ formatDate(eventToDelete.date) }} at {{ eventToDelete.time }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteConfirmModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">
              <i class="bi bi-trash me-1"></i>Delete Event
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'

export default {
  name: 'CalendarView',
  setup() {
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    
    // Sample events data - in a real app, this would come from an API
    const events = ref([
      { id: 1, date: '2025-01-15', time: '09:00', patient: 'John Doe', type: 'consultation', duration: 30, notes: 'Regular checkup' },
      { id: 2, date: '2025-01-15', time: '10:00', patient: 'Jane Smith', type: 'follow-up', duration: 45, notes: 'Follow-up visit' },
      { id: 3, date: '2025-01-15', time: '11:00', patient: 'Michael Johnson', type: 'procedure', duration: 60, notes: 'Minor procedure' },
      { id: 4, date: '2025-01-16', time: '13:00', patient: 'Sarah Williams', type: 'checkup', duration: 30, notes: '' },
      { id: 5, date: '2025-01-16', time: '14:00', patient: 'Mark Zacor', type: 'consultation', duration: 30, notes: '' },
      { id: 6, date: '2025-01-18', time: '08:00', patient: 'John Doe', type: 'follow-up', duration: 30, notes: '' },
      { id: 7, date: '2025-01-18', time: '10:00', patient: 'Jane Smith', type: 'checkup', duration: 30, notes: '' },
      { id: 8, date: '2025-01-18', time: '14:30', patient: 'Michael Johnson', type: 'consultation', duration: 45, notes: '' },
      { id: 9, date: '2025-01-22', time: '08:00', patient: 'Sarah Williams', type: 'procedure', duration: 90, notes: 'Complex procedure' },
      { id: 10, date: '2025-01-22', time: '13:00', patient: 'Mark Zacor', type: 'checkup', duration: 30, notes: '' },
      { id: 11, date: '2025-01-23', time: '09:00', patient: 'John Doe', type: 'follow-up', duration: 30, notes: '' },
      { id: 12, date: '2025-01-23', time: '10:00', patient: 'Jane Smith', type: 'consultation', duration: 30, notes: '' },
      { id: 13, date: '2025-01-24', time: '09:00', patient: 'Michael Johnson', type: 'checkup', duration: 30, notes: '' },
      { id: 14, date: '2025-01-24', time: '11:00', patient: 'Sarah Williams', type: 'follow-up', duration: 30, notes: '' },
      { id: 15, date: '2025-01-25', time: '09:00', patient: 'Mark Zacor', type: 'consultation', duration: 30, notes: '' },
      { id: 16, date: '2025-01-25', time: '13:00', patient: 'John Doe', type: 'checkup', duration: 30, notes: '' },
      { id: 17, date: '2025-01-26', time: '10:00', patient: 'Jane Smith', type: 'procedure', duration: 120, notes: 'Surgery preparation' },
      { id: 18, date: '2025-01-26', time: '14:00', patient: 'Michael Johnson', type: 'follow-up', duration: 30, notes: '' }
    ])

    // Modal states
    const showEventModal = ref(false)
    const showEventDetailsModal = ref(false)
    const showDeleteConfirmModal = ref(false)
    const isEditMode = ref(false)
    const selectedEventDetails = ref(null)
    const eventToDelete = ref(null)

    // Form data and validation
    const eventForm = reactive({
      id: null,
      date: '',
      time: '',
      patient: '',
      type: '',
      duration: 30,
      notes: ''
    })

    const errors = reactive({
      date: '',
      time: '',
      patient: ''
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

    const isFormValid = computed(() => {
      return eventForm.date && eventForm.time && eventForm.patient.trim() && 
             !errors.date && !errors.time && !errors.patient
    })

    const getEventsForDate = (dateString) => {
      return events.value.filter(event => event.date === dateString)
        .map(event => ({
          ...event,
          time: formatTimeDisplay(event.time)
        }))
    }

    const formatTimeDisplay = (time) => {
      const [hours, minutes] = time.split(':')
      const hour24 = parseInt(hours)
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      const ampm = hour24 >= 12 ? 'PM' : 'AM'
      return `${hour12}:${minutes} ${ampm}`
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString + 'T00:00:00')
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
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
        console.log('Selected date:', day.dateString)
      }
    }

    const viewEvent = (event) => {
      // Find the full event details (since displayed events have formatted time)
      const fullEvent = events.value.find(e => e.id === event.id)
      selectedEventDetails.value = fullEvent
      showEventDetailsModal.value = true
    }

    // Clear validation errors
    const clearErrors = () => {
      errors.date = ''
      errors.time = ''
      errors.patient = ''
    }

    // Validate form
    const validateForm = () => {
      clearErrors()
      let isValid = true

      if (!eventForm.date) {
        errors.date = 'Date is required'
        isValid = false
      }

      if (!eventForm.time) {
        errors.time = 'Time is required'
        isValid = false
      }

      if (!eventForm.patient.trim()) {
        errors.patient = 'Patient name is required'
        isValid = false
      }

      // Check for time conflicts
      if (eventForm.date && eventForm.time) {
        const conflictingEvent = events.value.find(event => 
          event.date === eventForm.date && 
          event.time === eventForm.time && 
          event.id !== eventForm.id
        )
        
        if (conflictingEvent) {
          errors.time = 'This time slot is already booked'
          isValid = false
        }
      }

      return isValid
    }

    // Reset form
    const resetForm = () => {
      eventForm.id = null
      eventForm.date = ''
      eventForm.time = ''
      eventForm.patient = ''
      eventForm.type = ''
      eventForm.duration = 30
      eventForm.notes = ''
      clearErrors()
    }

    // Open add event modal
    const openAddEventModal = () => {
      resetForm()
      isEditMode.value = false
      if (selectedDate.value) {
        eventForm.date = selectedDate.value
      }
      showEventModal.value = true
    }

    // Quick add event for a specific date
    const quickAddEvent = (dateString) => {
      resetForm()
      isEditMode.value = false
      eventForm.date = dateString
      showEventModal.value = true
    }

    // Edit event
    const editEvent = (event) => {
      resetForm()
      isEditMode.value = true
      eventForm.id = event.id
      eventForm.date = event.date
      eventForm.time = event.time
      eventForm.patient = event.patient
      eventForm.type = event.type || ''
      eventForm.duration = event.duration || 30
      eventForm.notes = event.notes || ''
      
      showEventDetailsModal.value = false
      showEventModal.value = true
    }

    // Save event (create or update)
    const saveEvent = () => {
      if (!validateForm()) {
        return
      }

      if (isEditMode.value) {
        // Update existing event
        const index = events.value.findIndex(e => e.id === eventForm.id)
        if (index !== -1) {
          events.value[index] = { ...eventForm }
        }
      } else {
        // Create new event
        const newEvent = {
          ...eventForm,
          id: Date.now() // Simple ID generation - use proper UUID in real app
        }
        events.value.push(newEvent)
      }

      closeEventModal()
    }

    // Delete event
    const deleteEvent = (event) => {
      eventToDelete.value = event
      showEventDetailsModal.value = false
      showDeleteConfirmModal.value = true
    }

    // Confirm delete
    const confirmDelete = () => {
      if (eventToDelete.value) {
        const index = events.value.findIndex(e => e.id === eventToDelete.value.id)
        if (index !== -1) {
          events.value.splice(index, 1)
        }
      }
      closeDeleteConfirmModal()
    }

    // Modal controls
    const closeEventModal = () => {
      showEventModal.value = false
      resetForm()
    }

    const closeEventDetailsModal = () => {
      showEventDetailsModal.value = false
      selectedEventDetails.value = null
    }

    const closeDeleteConfirmModal = () => {
      showDeleteConfirmModal.value = false
      eventToDelete.value = null
    }

    onMounted(() => {
      // Set today as initial selected date
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      selectedDate.value = todayStr
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
      // Modal states
      showEventModal,
      showEventDetailsModal,
      showDeleteConfirmModal,
      isEditMode,
      selectedEventDetails,
      eventToDelete,
      // Form
      eventForm,
      errors,
      isFormValid,
      // Methods
      openAddEventModal,
      quickAddEvent,
      editEvent,
      saveEvent,
      deleteEvent,
      confirmDelete,
      closeEventModal,
      closeEventDetailsModal,
      closeDeleteConfirmModal,
      formatDate,
      formatTimeDisplay
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

/* Quick add button */
.quick-add-btn {
  position: absolute;
  top: 5px;
  left: 5px;
  background: rgba(0, 123, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  color: white;
  font-size: 0.7rem;
  display: none;
  cursor: pointer;
  transition: all 0.2s;
}

.day-cell:hover .quick-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-add-btn:hover {
  background: rgba(0, 123, 255, 1);
  transform: scale(1.1);
}

/* Event action buttons */
.event-actions {
  display: none;
  position: absolute;
  top: 2px;
  right: 2px;
  gap: 2px;
}

.event:hover .event-actions {
  display: flex;
}

.edit-icon, .delete-icon {
  font-size: 0.6rem;
  padding: 1px 2px;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-icon {
  color: #007bff;
}

.edit-icon:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.delete-icon {
  color: #dc3545;
}

.delete-icon:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

/* Modal enhancements */
.modal {
  backdrop-filter: blur(3px);
}

.modal-content {
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
}

/* Form validation styles */
.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.875em;
  margin-top: 0.25rem;
}

/* Event type badges */
.badge {
  font-size: 0.75em;
  padding: 0.25em 0.5em;
}

/* Calendar header button */
.calendar-header .btn {
  white-space: nowrap;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .month-navigator {
    order: 1;
  }
  
  .calendar-header .btn {
    order: 2;
    align-self: center;
  }
  
  .modal-dialog {
    margin: 1rem;
  }
  
  .day-cell {
    min-height: 60px;
    font-size: 0.8rem;
  }
  
  .event {
    font-size: 0.6rem;
  }
  
  .day-number {
    font-size: 0.7rem;
  }
}
</style> 