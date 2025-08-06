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
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'CalendarView',
  setup() {
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    
    // Sample events data - in a real app, this would come from an API
    const events = ref([
      { id: 1, date: '2025-01-15', time: '09:00 AM', patient: 'John Doe' },
      { id: 2, date: '2025-01-15', time: '10:00 AM', patient: 'Jane Smith' },
      { id: 3, date: '2025-01-15', time: '11:00 AM', patient: 'Michael Johnson' },
      { id: 4, date: '2025-01-16', time: '01:00 PM', patient: 'Sarah Williams' },
      { id: 5, date: '2025-01-16', time: '02:00 PM', patient: 'Mark Zacor' },
      { id: 6, date: '2025-01-18', time: '08:00 AM', patient: 'John Doe' },
      { id: 7, date: '2025-01-18', time: '10:00 AM', patient: 'Jane Smith' },
      { id: 8, date: '2025-01-18', time: '02:30 PM', patient: 'Michael Johnson' },
      { id: 9, date: '2025-01-22', time: '08:00 AM', patient: 'Sarah Williams' },
      { id: 10, date: '2025-01-22', time: '01:00 PM', patient: 'Mark Zacor' },
      { id: 11, date: '2025-01-23', time: '09:00 AM', patient: 'John Doe' },
      { id: 12, date: '2025-01-23', time: '10:00 AM', patient: 'Jane Smith' },
      { id: 13, date: '2025-01-24', time: '09:00 AM', patient: 'Michael Johnson' },
      { id: 14, date: '2025-01-24', time: '11:00 AM', patient: 'Sarah Williams' },
      { id: 15, date: '2025-01-25', time: '09:00 AM', patient: 'Mark Zacor' },
      { id: 16, date: '2025-01-25', time: '01:00 PM', patient: 'John Doe' },
      { id: 17, date: '2025-01-26', time: '10:00 AM', patient: 'Jane Smith' },
      { id: 18, date: '2025-01-26', time: '02:00 PM', patient: 'Michael Johnson' }
    ])

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
      // Handle event click - you can show event details, edit, etc.
      console.log('Event clicked:', event)
      // You could emit an event or navigate to event details
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
      viewEvent
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
</style> 