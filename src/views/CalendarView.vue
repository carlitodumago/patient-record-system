<template>
  <div class="calendar-container mt-4">
    <div class="calendar-header">
      <h2>Schedule Patients</h2>
      <div class="month-navigator">
        <span class="nav-arrow">&lt;&lt;</span>
        <span class="nav-arrow">&lt;</span>
        <span class="current-month">March 2025</span>
        <span class="nav-arrow">&gt;</span>
        <span class="nav-arrow">&gt;&gt;</span>
      </div>
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
      <!-- Day Cells for a 31-day month starting on Tuesday (like March 2022) -->
      <!-- Leading empty cells for previous month -->
      <div class="day-cell empty">
      </div>
      <div class="day-cell empty">
      </div>
      <!-- Days 1 to 31 -->
      <div class="day-cell">
        <span class="day-number">1</span>
      </div>
      <div class="day-cell">
        <span class="day-number">2</span>
      </div>
      <div class="day-cell">
        <span class="day-number">3</span>
      </div>
      <div class="day-cell">
        <span class="day-number">4</span>
      </div>
      <div class="day-cell">
        <span class="day-number">5</span>
      </div>
      <div class="day-cell">
        <span class="day-number">6</span>
      </div>
      <div class="day-cell">
        <span class="day-number">7</span>
      </div>
      <div class="day-cell">
        <span class="day-number">8</span>
      </div>
      <div class="day-cell">
        <span class="day-number">9</span>
      </div>
      <div class="day-cell">
        <span class="day-number">10</span>
      </div>
      <div class="day-cell">
        <span class="day-number">11</span>
      </div>
      <div class="day-cell">
        <span class="day-number">12</span>
      </div>
      <div class="day-cell">
        <span class="day-number">13</span>
      </div>
      <div class="day-cell">
        <span class="day-number">14</span>
      </div>
      <div class="day-cell">
        <span class="day-number">15</span>
        <div class="event">
            <div class="event-time">09:00 AM</div>
            <div class="event-patient">John Doe</div>
        </div>
        <div class="event">
            <div class="event-time">10:00 AM</div>
            <div class="event-patient">Jane Smith</div>
        </div>
         <div class="event">
            <div class="event-time">11:00 AM</div>
            <div class="event-patient">Michael Johnson</div>
        </div>
      </div>
       <div class="day-cell">
        <span class="day-number">16</span>
         <div class="event">
            <div class="event-time">01:00 PM</div>
            <div class="event-patient">Sarah Williams</div>
        </div>
        <div class="event">
            <div class="event-time">02:00 PM</div>
            <div class="event-patient">Mark Zacor</div>
        </div>
      </div>
      <div class="day-cell">
        <span class="day-number">17</span>
         <i class="bi bi-calendar-event event-icon"></i>
      </div>
      <div class="day-cell highlight">
        <span class="day-number">18</span>
        <i class="bi bi-calendar-event event-icon"></i>
         <div class="event">
            <div class="event-time">08:00 AM</div>
            <div class="event-patient">John Doe</div>
        </div>
         <div class="event">
            <div class="event-time">10:00 AM</div>
            <div class="event-patient">Jane Smith</div>
        </div>
         <div class="event">
            <div class="event-time">02:30 PM</div>
            <div class="event-patient">Michael Johnson</div>
        </div>
      </div>
      <div class="day-cell">
        <span class="day-number">19</span>
        <i class="bi bi-calendar-event event-icon"></i>
      </div>
      <div class="day-cell">
        <span class="day-number">20</span>
        <i class="bi bi-calendar-event event-icon"></i>
      </div>
      <div class="day-cell">
        <span class="day-number">21</span>
        <i class="bi bi-calendar-event event-icon"></i>
      </div>
      <div class="day-cell">
        <span class="day-number">22</span>
        <i class="bi bi-calendar-event event-icon"></i>
         <div class="event">
            <div class="event-time">08:00 AM</div>
            <div class="event-patient">Sarah Williams</div>
        </div>
         <div class="event">
            <div class="event-time">01:00 PM</div>
            <div class="event-patient">Mark Zacor</div>
        </div>
      </div>
      <div class="day-cell">
        <span class="day-number">23</span>
         <i class="bi bi-calendar-event event-icon"></i>
         <div class="event">
            <div class="event-time">09:00 AM</div>
            <div class="event-patient">John Doe</div>
        </div>
        <div class="event">
            <div class="event-time">10:00 AM</div>
            <div class="event-patient">Jane Smith</div>
        </div>
      </div>
      <div class="day-cell">
        <span class="day-number">24</span>
         <i class="bi bi-calendar-event event-icon"></i>
          <div class="event">
            <div class="event-time">09:00 AM</div>
            <div class="event-patient">Michael Johnson</div>
        </div>
         <div class="event">
            <div class="event-time">11:00 AM</div>
            <div class="event-patient">Sarah Williams</div>
        </div>
      </div>
      <div class="day-cell">
        <span class="day-number">25</span>
         <i class="bi bi-calendar-event event-icon"></i>
          <div class="event">
            <div class="event-time">09:00 AM</div>
            <div class="event-patient">Mark Zacor</div>
        </div>
         <div class="event">
            <div class="event-time">01:00 PM</div>
            <div class="event-patient">John Doe</div>
        </div>
      </div>
      <div class="day-cell">
        <span class="day-number">26</span>
         <i class="bi bi-calendar-event event-icon"></i>
          <div class="event">
            <div class="event-time">10:00 AM</div>
            <div class="event-patient">Jane Smith</div>
        </div>
         <div class="event">
            <div class="event-time">02:00 PM</div>
            <div class="event-patient">Michael Johnson</div>
        </div>
      </div>
       <div class="day-cell">
        <span class="day-number">27</span>
      </div>
       <div class="day-cell">
        <span class="day-number">28</span>
      </div>
       <div class="day-cell">
        <span class="day-number">29</span>
      </div>
       <div class="day-cell">
        <span class="day-number">30</span>
      </div>
       <div class="day-cell">
        <span class="day-number">31</span>
      </div>
      <!-- Trailing empty cells for next month -->
       <div class="day-cell empty"></div>
       <div class="day-cell empty"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarView',
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
}

.nav-arrow:hover {
    color: #ccc;
}

.current-month {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  margin: 0 10px;
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
}

.day-cell.empty {
    background-color: #f8f9fa;
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

</style> 