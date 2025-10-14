<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <v-card class="elevation-2">
          <v-card-title class="d-flex align-center">
            <v-icon left color="primary" size="32">mdi-chart-bar</v-icon>
            <div>
              <div class="text-h5 font-weight-bold primary--text">
                Reports & Analytics
              </div>
              <div class="text-body-2 text--secondary mt-1">
                Comprehensive system reports and data exports
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card elevation-2 text-center">
                  <v-card-text class="pa-4">
                    <div class="stat-icon mb-3">
                      <v-icon size="40" color="primary"
                        >mdi-account-group</v-icon
                      >
                    </div>
                    <div
                      class="stat-number text-h4 font-weight-bold primary--text mb-2"
                    >
                      {{ stats.totalPatients }}
                    </div>
                    <div class="stat-label text-body-2 font-weight-medium">
                      Total Patients
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card elevation-2 text-center">
                  <v-card-text class="pa-4">
                    <div class="stat-icon mb-3">
                      <v-icon size="40" color="info">mdi-calendar-check</v-icon>
                    </div>
                    <div
                      class="stat-number text-h4 font-weight-bold info--text mb-2"
                    >
                      {{ stats.totalAppointments }}
                    </div>
                    <div class="stat-label text-body-2 font-weight-medium">
                      Total Appointments
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card elevation-2 text-center">
                  <v-card-text class="pa-4">
                    <div class="stat-icon mb-3">
                      <v-icon size="40" color="success">mdi-account-tie</v-icon>
                    </div>
                    <div
                      class="stat-number text-h4 font-weight-bold success--text mb-2"
                    >
                      {{ stats.totalStaff }}
                    </div>
                    <div class="stat-label text-body-2 font-weight-medium">
                      Total Staff
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card class="stat-card elevation-2 text-center">
                  <v-card-text class="pa-4">
                    <div class="stat-icon mb-3">
                      <v-icon size="40" color="warning">mdi-clock-alert</v-icon>
                    </div>
                    <div
                      class="stat-number text-h4 font-weight-bold warning--text mb-2"
                    >
                      {{ stats.pendingAppointments }}
                    </div>
                    <div class="stat-label text-body-2 font-weight-medium">
                      Pending Appointments
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row class="mt-6">
              <v-col cols="12">
                <v-card class="elevation-2">
                  <v-card-title class="d-flex align-center">
                    <v-icon left color="success">mdi-download</v-icon>
                    Export Data
                  </v-card-title>
                  <v-card-text>
                    <!-- Export Buttons Grid -->
                    <div class="export-buttons-grid">
                      <div class="export-section mb-4">
                        <h4 class="text-h6 font-weight-bold mb-3 primary--text">
                          <v-icon left small>mdi-account-group</v-icon>
                          Patient Data
                        </h4>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-btn
                              color="primary"
                              block
                              @click="exportPatientsCSV"
                              :loading="exporting.patients"
                              class="export-btn"
                            >
                              <v-icon left>mdi-download</v-icon>
                              Export Patients (CSV)
                            </v-btn>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-btn
                              color="error"
                              block
                              @click="exportPatientsPDF"
                              :loading="exporting.patients"
                              class="export-btn"
                            >
                              <v-icon left>mdi-file-pdf-box</v-icon>
                              Export Patients (PDF)
                            </v-btn>
                          </v-col>
                        </v-row>
                      </div>

                      <div class="export-section mb-4">
                        <h4 class="text-h6 font-weight-bold mb-3 info--text">
                          <v-icon left small>mdi-calendar-check</v-icon>
                          Appointment Data
                        </h4>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-btn
                              color="primary"
                              block
                              @click="exportAppointmentsCSV"
                              :loading="exporting.appointments"
                              class="export-btn"
                            >
                              <v-icon left>mdi-download</v-icon>
                              Export Appointments (CSV)
                            </v-btn>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-btn
                              color="error"
                              block
                              @click="exportAppointmentsPDF"
                              :loading="exporting.appointments"
                              class="export-btn"
                            >
                              <v-icon left>mdi-file-pdf-box</v-icon>
                              Export Appointments (PDF)
                            </v-btn>
                          </v-col>
                        </v-row>
                      </div>

                      <div class="export-section mb-4">
                        <h4 class="text-h6 font-weight-bold mb-3 success--text">
                          <v-icon left small>mdi-file-chart</v-icon>
                          Medical Records
                        </h4>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-btn
                              color="primary"
                              block
                              @click="exportMedicalRecordsCSV"
                              :loading="exporting.medicalRecords"
                              class="export-btn"
                            >
                              <v-icon left>mdi-download</v-icon>
                              Export Records (CSV)
                            </v-btn>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-btn
                              color="error"
                              block
                              @click="exportMedicalRecordsPDF"
                              :loading="exporting.medicalRecords"
                              class="export-btn"
                            >
                              <v-icon left>mdi-file-pdf-box</v-icon>
                              Export Records (PDF)
                            </v-btn>
                          </v-col>
                        </v-row>
                      </div>

                      <div class="export-section">
                        <h4 class="text-h6 font-weight-bold mb-3 warning--text">
                          <v-icon left small>mdi-account-tie</v-icon>
                          Staff Data
                        </h4>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-btn
                              color="primary"
                              block
                              @click="exportStaffCSV"
                              :loading="exporting.staff"
                              class="export-btn"
                            >
                              <v-icon left>mdi-download</v-icon>
                              Export Staff (CSV)
                            </v-btn>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-btn
                              color="error"
                              block
                              @click="exportStaffPDF"
                              :loading="exporting.staff"
                              class="export-btn"
                            >
                              <v-icon left>mdi-file-pdf-box</v-icon>
                              Export Staff (PDF)
                            </v-btn>
                          </v-col>
                        </v-row>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row class="mt-6">
              <v-col cols="12" lg="8">
                <v-card class="elevation-2">
                  <v-card-title class="d-flex align-center">
                    <v-icon left color="info">mdi-chart-pie</v-icon>
                    Appointments by Status
                  </v-card-title>
                  <v-card-text>
                    <v-simple-table>
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left">Status</th>
                            <th class="text-center">Count</th>
                            <th class="text-center">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(status, index) in appointmentStatusStats"
                            :key="index"
                            class="hover-row"
                          >
                            <td>
                              <v-chip
                                :color="getStatusColor(status.status)"
                                small
                                class="font-weight-medium"
                              >
                                {{ status.status }}
                              </v-chip>
                            </td>
                            <td class="text-center font-weight-bold">
                              {{ status.count }}
                            </td>
                            <td class="text-center">
                              <span
                                class="font-weight-bold"
                                :style="{
                                  color: getStatusColor(status.status),
                                }"
                              >
                                {{ status.percentage }}%
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" lg="4">
                <v-card class="elevation-2">
                  <v-card-title class="d-flex align-center">
                    <v-icon left color="primary">mdi-timeline</v-icon>
                    Recent Activity
                  </v-card-title>
                  <v-card-text>
                    <v-timeline dense class="ml-n4">
                      <v-timeline-item
                        v-for="(activity, index) in recentActivities"
                        :key="index"
                        small
                        color="primary"
                      >
                        <template v-slot:opposite>
                          <span
                            class="text-caption font-weight-medium primary--text"
                            >{{ formatDate(activity.date) }}</span
                          >
                        </template>
                        <v-card class="elevation-1">
                          <v-card-text class="pa-3">
                            <div class="text-body-2 font-weight-medium">
                              {{ activity.description }}
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-timeline-item>
                    </v-timeline>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/services/supabase";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { auditService } from "@/services/auditService";
import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore();

const stats = ref({
  totalPatients: 0,
  totalAppointments: 0,
  totalStaff: 0,
  pendingAppointments: 0,
});

const appointmentStatusStats = ref([]);
const recentActivities = ref([]);
const exporting = ref({
  patients: false,
  appointments: false,
  medicalRecords: false,
  staff: false,
});

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const loadStats = async () => {
  try {
    // Load basic stats
    const [patientsResult, appointmentsResult, staffResult] = await Promise.all(
      [
        supabase
          .from("Patients")
          .select("PatientID", { count: "exact", head: true }),
        supabase
          .from("Appointment")
          .select("AppointmentID, Status", { count: "exact" }),
        supabase
          .from("Staff")
          .select("StaffID", { count: "exact", head: true }),
      ]
    );

    stats.value.totalPatients = patientsResult.count || 0;
    stats.value.totalAppointments = appointmentsResult.count || 0;
    stats.value.totalStaff = staffResult.count || 0;

    // Calculate pending appointments
    const pendingAppointments =
      appointmentsResult.data?.filter((app) => app.Status === "pending") || [];
    stats.value.pendingAppointments = pendingAppointments.length;

    // Load appointment status stats
    const statusCounts = {};
    appointmentsResult.data?.forEach((app) => {
      statusCounts[app.Status] = (statusCounts[app.Status] || 0) + 1;
    });

    appointmentStatusStats.value = Object.entries(statusCounts).map(
      ([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        percentage: ((count / stats.value.totalAppointments) * 100).toFixed(1),
      })
    );

    // Load recent activities (mock data for now)
    recentActivities.value = [
      { date: new Date(), description: "New patient registered" },
      {
        date: new Date(Date.now() - 3600000),
        description: "Appointment scheduled",
      },
      {
        date: new Date(Date.now() - 7200000),
        description: "Medical record updated",
      },
    ];
  } catch (error) {
    console.error("Load stats error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to load statistics",
      color: "error",
    };
  }
};

const exportPatientsCSV = async () => {
  exporting.value.patients = true;
  try {
    const { data, error } = await supabase.from("Patients").select("*");

    if (error) throw error;

    const csv = Papa.unparse(data);
    downloadCSV(csv, "patients.csv");

    // Log data export
    await auditService.logDataExport(
      "patients_csv",
      data.length,
      authStore.user?.UserID
    );
  } catch (error) {
    console.error("Export patients error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to export patients",
      color: "error",
    };
  } finally {
    exporting.value.patients = false;
  }
};

const exportPatientsPDF = async () => {
  exporting.value.patients = true;
  try {
    const { data, error } = await supabase.from("Patients").select("*");

    if (error) throw error;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Patients Report", 20, 20);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // Prepare table data
    const headers = [
      [
        "Patient ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Date of Birth",
        "Gender",
        "Address",
      ],
    ];
    const tableData = data.map((patient) => [
      patient.PatientID,
      patient.FirstName,
      patient.LastName,
      patient.Email,
      patient.PhoneNumber,
      patient.DateOfBirth
        ? new Date(patient.DateOfBirth).toLocaleDateString()
        : "",
      patient.Gender,
      patient.Address || "",
    ]);

    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save("patients.pdf");

    // Log data export
    await auditService.logDataExport(
      "patients_pdf",
      data.length,
      authStore.user?.UserID
    );
  } catch (error) {
    console.error("Export patients PDF error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to export patients PDF",
      color: "error",
    };
  } finally {
    exporting.value.patients = false;
  }
};

const exportAppointmentsCSV = async () => {
  exporting.value.appointments = true;
  try {
    const { data, error } = await supabase.from("Appointment").select("*");

    if (error) throw error;

    const csv = Papa.unparse(data);
    downloadCSV(csv, "appointments.csv");

    // Log data export
    await auditService.logDataExport(
      "appointments_csv",
      data.length,
      authStore.user?.UserID
    );
  } catch (error) {
    console.error("Export appointments error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to export appointments",
      color: "error",
    };
  } finally {
    exporting.value.appointments = false;
  }
};

const exportAppointmentsPDF = async () => {
  exporting.value.appointments = true;
  try {
    const { data, error } = await supabase.from("Appointment").select("*");

    if (error) throw error;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Appointments Report", 20, 20);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // Prepare table data
    const headers = [
      [
        "Appointment ID",
        "Patient ID",
        "Staff ID",
        "Date",
        "Time",
        "Status",
        "Notes",
      ],
    ];
    const tableData = data.map((appointment) => [
      appointment.AppointmentID,
      appointment.PatientID,
      appointment.StaffID,
      appointment.Date,
      appointment.Time,
      appointment.Status,
      appointment.Notes || "",
    ]);

    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save("appointments.pdf");

    // Log data export
    await auditService.logDataExport(
      "appointments_pdf",
      data.length,
      authStore.user?.UserID
    );
  } catch (error) {
    console.error("Export appointments PDF error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to export appointments PDF",
      color: "error",
    };
  } finally {
    exporting.value.appointments = false;
  }
};

const exportMedicalRecordsCSV = async () => {
  exporting.value.medicalRecords = true;
  try {
    const { data, error } = await supabase.from("MedicalRecord").select("*");

    if (error) throw error;

    const csv = Papa.unparse(data);
    downloadCSV(csv, "medical_records.csv");

    // Log data export
    await auditService.logDataExport(
      "medical_records_csv",
      data.length,
      authStore.user?.UserID
    );
  } catch (error) {
    console.error("Export medical records error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to export medical records",
      color: "error",
    };
  } finally {
    exporting.value.medicalRecords = false;
  }
};

const exportMedicalRecordsPDF = async () => {
  exporting.value.medicalRecords = true;
  try {
    const { data, error } = await supabase.from("MedicalRecord").select("*");

    if (error) throw error;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Medical Records Report", 20, 20);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // Prepare table data
    const headers = [
      [
        "Record ID",
        "Patient ID",
        "Staff ID",
        "Date",
        "Diagnosis",
        "Treatment",
        "Notes",
      ],
    ];
    const tableData = data.map((record) => [
      record.RecordID,
      record.PatientID,
      record.StaffID,
      record.Date,
      record.Diagnosis || "",
      record.Treatment || "",
      record.Notes || "",
    ]);

    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save("medical_records.pdf");

    // Log data export
    await auditService.logDataExport(
      "medical_records_pdf",
      data.length,
      authStore.user?.UserID
    );
  } catch (error) {
    console.error("Export medical records PDF error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to export medical records PDF",
      color: "error",
    };
  } finally {
    exporting.value.medicalRecords = false;
  }
};

const exportStaffCSV = async () => {
  exporting.value.staff = true;
  try {
    const { data, error } = await supabase.from("Staff").select("*");

    if (error) throw error;

    const csv = Papa.unparse(data);
    downloadCSV(csv, "staff.csv");

    // Log data export
    await auditService.logDataExport(
      "staff_csv",
      data.length,
      authStore.user?.UserID
    );
  } catch (error) {
    console.error("Export staff error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to export staff",
      color: "error",
    };
  } finally {
    exporting.value.staff = false;
  }
};

const exportStaffPDF = async () => {
  exporting.value.staff = true;
  try {
    const { data, error } = await supabase.from("Staff").select("*");

    if (error) throw error;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Staff Report", 20, 20);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // Prepare table data
    const headers = [
      [
        "Staff ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Department",
        "Position",
        "License Number",
      ],
    ];
    const tableData = data.map((staff) => [
      staff.StaffID,
      staff.FirstName,
      staff.LastName,
      staff.Email,
      staff.PhoneNumber,
      staff.Department,
      staff.Position,
      staff.LicenseNumber || "",
    ]);

    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save("staff.pdf");

    // Log data export
    await auditService.logDataExport(
      "staff_pdf",
      data.length,
      authStore.user?.UserID
    );
  } catch (error) {
    console.error("Export staff PDF error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to export staff PDF",
      color: "error",
    };
  } finally {
    exporting.value.staff = false;
  }
};

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

// Helper method to get status color
const getStatusColor = (status) => {
  const colors = {
    pending: "warning",
    confirmed: "primary",
    completed: "success",
    cancelled: "error",
  };
  return colors[status.toLowerCase()] || "grey";
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
/* Enhanced Reports Styles */
.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.stat-icon {
  opacity: 0.8;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Export sections styling */
.export-section {
  padding: 16px;
  border-radius: 12px;
  background-color: #f8f9fa;
  margin-bottom: 16px;
}

.export-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.export-buttons-grid {
  margin-top: 16px;
}

/* Export buttons styling */
.export-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  padding: 12px 16px;
  margin-bottom: 8px;
}

/* Table enhancements */
.hover-row:hover {
  background-color: #f5f5f5;
}

/* Mobile responsive adjustments */
@media (max-width: 599px) {
  .stat-number {
    font-size: 1.5rem;
  }

  .stat-icon .v-icon {
    font-size: 32px !important;
  }

  .v-card-text {
    padding: 12px !important;
  }

  .export-section {
    padding: 12px;
  }

  .export-section h4 {
    font-size: 1rem;
  }
}

/* Enhanced card styling */
.v-card {
  border-radius: 12px;
}

.v-card-title {
  font-weight: 600;
  font-size: 1.25rem;
}

/* Timeline enhancements */
.v-timeline-item {
  margin-bottom: 16px;
}

.v-timeline-item:last-child {
  margin-bottom: 0;
}

/* Button enhancements */
.v-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: 8px;
}

/* Animation for cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(1) {
  animation-delay: 0.1s;
}
.stat-card:nth-child(2) {
  animation-delay: 0.2s;
}
.stat-card:nth-child(3) {
  animation-delay: 0.3s;
}
.stat-card:nth-child(4) {
  animation-delay: 0.4s;
}

/* Enhanced mobile layout */
@media (max-width: 599px) {
  .pa-4 {
    padding: 16px !important;
  }

  .mb-6 {
    margin-bottom: 24px !important;
  }

  .mt-6 {
    margin-top: 24px !important;
  }
}

/* Chip styling for status */
.v-chip {
  font-weight: 500;
}

/* Table styling */
.v-data-table {
  border-radius: 8px;
}

.v-data-table thead th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}
</style>
