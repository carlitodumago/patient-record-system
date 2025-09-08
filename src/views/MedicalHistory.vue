<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePatientStore } from '../stores/patients';
import { formatDate, formatDateTime, formatTimeTo12Hour } from '../utils/dateUtils';

const patientStore = usePatientStore();
const router = useRouter();

const patients = computed(() => patientStore.patients);
const visits = ref([]);
const records = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');

// Get patient name by ID
const getPatientName = (patientId) => {
  const patient = patients.value.find(p => p.id === patientId);
  return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
};

// Filtered list of patients based on search query
const filteredPatients = computed(() => {
  if (!searchQuery.value) return patients.value;
  
  const query = searchQuery.value.toLowerCase();
  return patients.value.filter(patient => 
    patient.firstName.toLowerCase().includes(query) || 
    patient.lastName.toLowerCase().includes(query) ||
    (patient.medicalConditions && patient.medicalConditions.some(condition => 
      condition.toLowerCase().includes(query)
    ))
  );
});

// Combined medical history items (visits and records) for ALL patients
const historyItems = computed(() => {
  
  // Get all visits
  const allVisits = visits.value
    .map(visit => ({
      ...visit,
      type: 'Visit',
      patientName: getPatientName(visit.patientId), // Get patient name
      date: visit.visitDate,
      time: visit.visitTime || (visit.timestamp ? new Date(visit.timestamp).toTimeString().slice(0, 5) : '09:00'),
      description: visit.purpose,
      formattedDateTime: formatDateTime({ 
        date: visit.visitDate, 
        time: visit.visitTime, 
        timestamp: visit.timestamp 
      })
    }));
    
  // Get all medical records
  const allRecords = records.value
    .map(record => ({
      ...record,
      type: 'Record',
      patientName: getPatientName(record.patientId), // Get patient name
      date: record.recordDate,
      time: record.recordTime || (record.timestamp ? new Date(record.timestamp).toTimeString().slice(0, 5) : '09:00'),
      description: record.condition,
      formattedDateTime: formatDateTime({ 
        date: record.recordDate, 
        time: record.recordTime, 
        timestamp: record.timestamp 
      })
    }));
    
  // Combine and sort by date and time (newest first)
  return [...allVisits, ...allRecords]
    .sort((a, b) => {
      // If timestamps are available, use them for most accurate sorting
      if (a.timestamp && b.timestamp) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      
      // Otherwise use date and time fields
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // If dates are the same, sort by time
      if (dateA.toDateString() === dateB.toDateString()) {
        // Convert time string to minutes since midnight for comparison
        const getMinutes = (timeStr) => {
          if (!timeStr) return 9 * 60; // Default to 9:00 AM
          
          // Handle AM/PM format
          if (timeStr.includes('AM') || timeStr.includes('PM')) {
            const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?([APap][Mm])$/);
            if (match) {
              let hours = parseInt(match[1], 10);
              const minutes = parseInt(match[2], 10);
              const period = match[3].toUpperCase();
              
              if (period === 'PM' && hours < 12) {
                hours += 12;
              } else if (period === 'AM' && hours === 12) {
                hours = 0;
              }
              
              return hours * 60 + minutes;
            }
          }
          
          // Handle 24-hour format
          const parts = timeStr.split(':');
          if (parts.length === 2) {
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
          }
          
          return 9 * 60; // Default
        };
        
        return getMinutes(b.time) - getMinutes(a.time); // Later time first
      }
      
      return dateB - dateA; // Later date first
    });
});

onMounted(() => {
  // Load patient data if not already loaded
  if (patients.value.length === 0) {
    const savedPatients = localStorage.getItem('patientRecords');
    if (savedPatients) {
      patientStore.setPatients(JSON.parse(savedPatients));
    }
  }
  
  // Load visits from localStorage
  const savedVisits = localStorage.getItem('medicalVisits');
  if (savedVisits) {
    visits.value = JSON.parse(savedVisits);
  }
  
  // Load medical records from localStorage
  const savedRecords = localStorage.getItem('medicalRecords');
  if (savedRecords) {
    records.value = JSON.parse(savedRecords);
  }
  
  isLoading.value = false;
});
</script>

<template>
  <div class="medical-history container-fluid mt-3">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Medical History Records</h2>
    </div>
    
    <div class="card">
      <div class="card-body">
        <div v-if="isLoading" class="text-center">
          Loading...
        </div>
        <div v-else-if="historyItems.length === 0" class="alert alert-info mb-0">
          No medical history records found.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th scope="col">Date & Time</th>
                <th scope="col">Type</th>
                <th scope="col">Patient Name</th>
                <th scope="col">Description / Condition</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in historyItems" :key="`${item.type}-${item.id}`">
                <td>{{ item.formattedDateTime }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.patientName }}</td>
                <td>{{ item.description }}</td>
                <td>
                  <!-- Link to view details - adjust route as needed -->
                  <router-link
                    :to="item.type === 'Visit' ? `/patients/${item.patientId}?tab=visits` : `/records?record=${item.id}`"
                    class="btn btn-sm btn-outline-primary me-1"
                  >
                    View
                  </router-link>
                   <!-- Download Button (Placeholder) -->
                   <button class="btn btn-sm btn-outline-secondary me-1">
                       <i class="bi bi-download"></i>
                   </button>
                   <!-- Edit Button (Placeholder) -->
                  <button class="btn btn-sm btn-outline-primary me-1">
                      <i class="bi bi-pencil"></i>
                  </button>
                  <!-- Delete Button (Placeholder) -->
                   <button class="btn btn-sm btn-outline-danger">
                       <i class="bi bi-trash"></i>
                   </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Removed unused styles */
</style>