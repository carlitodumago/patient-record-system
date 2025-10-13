<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { formatDate, formatDateTime, formatTimeTo12Hour } from '../utils/dateUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const store = useStore();
const router = useRouter();

const patients = computed(() => store.state.patients);
const visits = ref([]);
const records = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');

const headers = [
  { title: 'Date & Time', key: 'formattedDateTime' },
  { title: 'Type', key: 'type' },
  { title: 'Patient Name', key: 'patientName' },
  { title: 'Description / Condition', key: 'description' },
  { title: 'Actions', key: 'actions' },
];

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

// Download PDF function
const downloadPDF = async (item) => {
  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF();

    // Add header
    pdf.setFontSize(20);
    pdf.text('Medical Record Report', 20, 30);

    // Add patient information
    pdf.setFontSize(14);
    pdf.text(`Patient: ${item.patientName}`, 20, 50);
    pdf.text(`Date & Time: ${item.formattedDateTime}`, 20, 60);
    pdf.text(`Type: ${item.type}`, 20, 70);

    // Add description
    pdf.setFontSize(12);
    pdf.text('Description:', 20, 90);
    const descriptionLines = pdf.splitTextToSize(item.description || 'No description available', 170);
    pdf.text(descriptionLines, 20, 100);

    // Add additional details based on type
    let yPosition = 100 + (descriptionLines.length * 5) + 10;

    if (item.type === 'Visit') {
      pdf.text(`Purpose: ${item.purpose || 'N/A'}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Physician: ${item.physicianName || 'N/A'}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Status: ${item.status || 'N/A'}`, 20, yPosition);
      yPosition += 10;
      if (item.notes) {
        pdf.text('Notes:', 20, yPosition);
        yPosition += 10;
        const notesLines = pdf.splitTextToSize(item.notes, 170);
        pdf.text(notesLines, 20, yPosition);
      }
    } else if (item.type === 'Record') {
      pdf.text(`Condition: ${item.condition || 'N/A'}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Diagnosis: ${item.diagnosis || 'N/A'}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Treatment: ${item.treatment || 'N/A'}`, 20, yPosition);
      yPosition += 10;
      if (item.notes) {
        pdf.text('Notes:', 20, yPosition);
        yPosition += 10;
        const notesLines = pdf.splitTextToSize(item.notes, 170);
        pdf.text(notesLines, 20, yPosition);
      }
    }

    // Add footer
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 20);

    // Save the PDF
    const fileName = `${item.patientName.replace(/\s+/g, '_')}_${item.type}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    // Show success message
    alert('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

onMounted(() => {
  // Load patient data if not already loaded
  if (patients.value.length === 0) {
    const savedPatients = localStorage.getItem('patientRecords');
    if (savedPatients) {
      store.commit('setPatients', JSON.parse(savedPatients));
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
  <v-container fluid class="mt-3">
    <v-card>
      <v-card-title>Medical History Records</v-card-title>
      <v-card-text>
        <div v-if="isLoading" class="text-center">
          Loading...
        </div>
        <v-alert v-else-if="historyItems.length === 0" type="info">
          No medical history records found.
        </v-alert>
        <v-data-table
          v-else
          :headers="headers"
          :items="historyItems"
          class="elevation-1"
          hide-default-footer
        >
          <template v-slot:item.actions="{ item }">
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              class="me-1"
              :to="item.type === 'Visit' ? `/patients/${item.patientId}?tab=visits` : `/records?record=${item.id}`"
            >
              View
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              color="secondary"
              class="me-1"
              @click="downloadPDF(item)"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
            <v-btn size="small" variant="outlined" color="primary" class="me-1">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn size="small" variant="outlined" color="error">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
/* Removed unused styles */
</style> 