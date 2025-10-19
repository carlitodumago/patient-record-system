import { ref, computed } from "vue";
import { supabase } from "../main.js";
import { useAuthStore } from "../stores/auth.js";

export const useSupabase = () => {
  const loading = ref(false);
  const error = ref(null);
  const { user, userRole, isAuthenticated } = useAuthStore();

  // Generic error handler
  const handleError = (err) => {
    console.error("Supabase operation error:", err);
    error.value = err.message || "An error occurred";
    return null;
  };

  // Generic loading state wrapper
  const withLoading = async (operation) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await operation();
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Role-based access control helpers
  const canAccess = (allowedRoles) => {
    if (!isAuthenticated.value) return false;
    return allowedRoles.includes(userRole.value);
  };

  const requireAuth = () => {
    if (!isAuthenticated.value) {
      throw new Error("Authentication required");
    }
  };

  const requireRole = (roles) => {
    requireAuth();
    if (!canAccess(roles)) {
      throw new Error(`Access denied. Required roles: ${roles.join(", ")}`);
    }
  };

  // Patient operations
  const patientOps = {
    // Get all patients (admin/staff only)
    async getAllPatients() {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Patients")
          .select(
            `
            *,
            Users!inner(fullName, email)
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    // Get patient by ID
    async getPatientById(id) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Patients")
          .select(
            `
            *,
            Users!inner(fullName, email)
          `
          )
          .eq("PatientID", id)
          .single();

        if (error) throw error;
        return data;
      });
    },

    // Get current user's patients (patients only)
    async getMyPatients() {
      requireRole(["patient"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Patients")
          .select("*")
          .eq("UserID", user.value.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    // Create new patient
    async createPatient(patientData) {
      requireAuth();
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Patients")
          .insert([
            {
              ...patientData,
              UserID: user.value.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    // Update patient
    async updatePatient(id, patientData) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Patients")
          .update({
            ...patientData,
            updated_at: new Date().toISOString(),
          })
          .eq("PatientID", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    // Delete patient
    async deletePatient(id) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { error } = await supabase
          .from("Patients")
          .delete()
          .eq("PatientID", id);

        if (error) throw error;
        return true;
      });
    },
  };

  // Appointment operations
  const appointmentOps = {
    // Get all appointments (staff only)
    async getAllAppointments() {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Appointment")
          .select(
            `
            *,
            Patients!inner(
              *,
              Users!inner(fullName)
            ),
            Staff!inner(
              *,
              Users!inner(fullName)
            )
          `
          )
          .order("AppointmentDateTime", { ascending: true });

        if (error) throw error;
        return data;
      });
    },

    // Get current user's appointments (patients)
    async getMyAppointments() {
      requireRole(["patient"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Appointment")
          .select(
            `
            *,
            Patients!inner(*),
            Staff!inner(
              *,
              Users!inner(fullName)
            )
          `
          )
          .eq("Patients.UserID", user.value.id)
          .order("AppointmentDateTime", { ascending: true });

        if (error) throw error;
        return data;
      });
    },

    // Get staff appointments (nurses)
    async getMyStaffAppointments() {
      requireRole(["nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Appointment")
          .select(
            `
            *,
            Patients!inner(
              *,
              Users!inner(fullName)
            ),
            Staff!inner(*)
          `
          )
          .eq("Staff.UserID", user.value.id)
          .order("AppointmentDateTime", { ascending: true });

        if (error) throw error;
        return data;
      });
    },

    // Create appointment
    async createAppointment(appointmentData) {
      requireAuth();
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Appointment")
          .insert([
            {
              ...appointmentData,
              ScheduledBy: user.value.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    // Update appointment
    async updateAppointment(id, appointmentData) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Appointment")
          .update({
            ...appointmentData,
            updated_at: new Date().toISOString(),
          })
          .eq("AppointmentID", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    // Delete appointment
    async deleteAppointment(id) {
      return withLoading(async () => {
        const { error } = await supabase
          .from("Appointment")
          .delete()
          .eq("AppointmentID", id);

        if (error) throw error;
        return true;
      });
    },
  };

  // Staff operations (admin only)
  const staffOps = {
    async getAllStaff() {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Staff")
          .select(
            `
            *,
            Users!inner(fullName, email),
            Role(RoleName)
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async createStaff(staffData) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Staff")
          .insert([
            {
              ...staffData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async updateStaff(id, staffData) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Staff")
          .update({
            ...staffData,
            updated_at: new Date().toISOString(),
          })
          .eq("StaffID", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async deleteStaff(id) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { error } = await supabase
          .from("Staff")
          .delete()
          .eq("StaffID", id);

        if (error) throw error;
        return true;
      });
    },
  };

  // Notification operations
  const notificationOps = {
    async getAllNotifications() {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notification")
          .select(
            `
            *,
            Users!inner(fullName, email)
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async getMyNotifications() {
      requireAuth();
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notification")
          .select("*")
          .eq("UserID", user.value.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async createNotification(notificationData) {
      requireAuth();
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notification")
          .insert([
            {
              ...notificationData,
              UserID: notificationData.UserID || user.value.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async markAsRead(id) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notification")
          .update({
            IsRead: true,
            updated_at: new Date().toISOString(),
          })
          .eq("NotificationID", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async markAllAsRead() {
      requireAuth();
      return withLoading(async () => {
        const { error } = await supabase
          .from("Notification")
          .update({
            IsRead: true,
            updated_at: new Date().toISOString(),
          })
          .eq("UserID", user.value.id)
          .eq("IsRead", false);

        if (error) throw error;
        return true;
      });
    },

    async deleteNotification(id) {
      return withLoading(async () => {
        const { error } = await supabase
          .from("Notification")
          .delete()
          .eq("NotificationID", id);

        if (error) throw error;
        return true;
      });
    },

    async updateNotification(id, notificationData) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notification")
          .update({
            ...notificationData,
            updated_at: new Date().toISOString(),
          })
          .eq("NotificationID", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    // Send appointment reminder
    async sendAppointmentReminder(appointmentId, patientId, message) {
      requireAuth();
      return withLoading(async () => {
        const notificationData = {
          UserID: patientId,
          Title: "Appointment Reminder",
          Message: message,
          Type: "appointment_reminder",
          Priority: "normal",
          ActionRequired: false,
          RelatedAppointmentID: appointmentId,
        };

        const { data, error } = await supabase
          .from("Notification")
          .insert([notificationData])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    // Send system alert
    async sendSystemAlert(userId, title, message, priority = "normal") {
      requireAuth();
      return withLoading(async () => {
        const notificationData = {
          UserID: userId,
          Title: title,
          Message: message,
          Type: "system_alert",
          Priority: priority,
          ActionRequired: true,
        };

        const { data, error } = await supabase
          .from("Notification")
          .insert([notificationData])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },
  };

  // Medical Record operations (admin only)
  const medicalRecordOps = {
    async getAllMedicalRecords() {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("MedicalRecord")
          .select(
            `
            *,
            Patients!inner(
              *,
              Users!inner(fullName)
            ),
            Staff!inner(
              *,
              Users!inner(fullName)
            ),
            Diagnosis(*),
            Treatment(*)
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async getMedicalRecordById(id) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("MedicalRecord")
          .select(
            `
            *,
            Patients!inner(
              *,
              Users!inner(fullName)
            ),
            Staff!inner(
              *,
              Users!inner(fullName)
            ),
            Diagnosis(*),
            Treatment(*)
          `
          )
          .eq("MedicalRecordID", id)
          .single();

        if (error) throw error;
        return data;
      });
    },

    async createMedicalRecord(recordData) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("MedicalRecord")
          .insert([
            {
              ...recordData,
              EnteredBy: user.value.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async updateMedicalRecord(id, recordData) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("MedicalRecord")
          .update({
            ...recordData,
            updated_at: new Date().toISOString(),
          })
          .eq("MedicalRecordID", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async deleteMedicalRecord(id) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { error } = await supabase
          .from("MedicalRecord")
          .delete()
          .eq("MedicalRecordID", id);

        if (error) throw error;
        return true;
      });
    },

    async getMedicalRecordsByPatient(patientId) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("MedicalRecord")
          .select(
            `
            *,
            Staff!inner(
              *,
              Users!inner(fullName)
            ),
            Diagnosis(*),
            Treatment(*)
          `
          )
          .eq("PatientID", patientId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async getMedicalRecordsByStaff(staffId) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("MedicalRecord")
          .select(
            `
            *,
            Patients!inner(
              *,
              Users!inner(fullName)
            ),
            Diagnosis(*),
            Treatment(*)
          `
          )
          .eq("EnteredBy", staffId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },
  };

  // Reports operations (admin only)
  const reportOps = {
    async getAllReports() {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Reports")
          .select(
            `
            *,
            GeneratedByNavigation:GeneratedBy(
              *,
              Users!inner(fullName)
            )
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async getReportById(id) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Reports")
          .select(
            `
            *,
            GeneratedByNavigation:GeneratedBy(
              *,
              Users!inner(fullName)
            )
          `
          )
          .eq("ReportID", id)
          .single();

        if (error) throw error;
        return data;
      });
    },

    async createReport(reportData) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Reports")
          .insert([
            {
              ...reportData,
              GeneratedBy: user.value.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async updateReport(id, reportData) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Reports")
          .update({
            ...reportData,
            updated_at: new Date().toISOString(),
          })
          .eq("ReportID", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async deleteReport(id) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { error } = await supabase
          .from("Reports")
          .delete()
          .eq("ReportID", id);

        if (error) throw error;
        return true;
      });
    },

    async getReportsByType(reportType) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Reports")
          .select(
            `
            *,
            GeneratedByNavigation:GeneratedBy(
              *,
              Users!inner(fullName)
            )
          `
          )
          .eq("ReportType", reportType)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async getReportsByDateRange(startDate, endDate) {
      requireRole(["admin"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Reports")
          .select(
            `
            *,
            GeneratedByNavigation:GeneratedBy(
              *,
              Users!inner(fullName)
            )
          `
          )
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    // Analytics data operations
    async getOverviewStats(startDate, endDate) {
      requireRole(["admin"]);
      return withLoading(async () => {
        // Get patient count
        const { data: patients, error: patientsError } = await supabase
          .from("Patients")
          .select("count", { count: "exact", head: true });

        // Get staff count
        const { data: staff, error: staffError } = await supabase
          .from("Staff")
          .select("count", { count: "exact", head: true });

        // Get appointments count
        const { data: appointments, error: appointmentsError } = await supabase
          .from("Appointment")
          .select("count", { count: "exact", head: true });

        // Get medical records count
        const { data: records, error: recordsError } = await supabase
          .from("MedicalRecord")
          .select("count", { count: "exact", head: true });

        if (patientsError || staffError || appointmentsError || recordsError) {
          throw new Error("Failed to fetch overview statistics");
        }

        return {
          totalPatients: patients || 0,
          totalStaff: staff || 0,
          totalAppointments: appointments || 0,
          totalRecords: records || 0,
        };
      });
    },

    async getAppointmentAnalytics(startDate, endDate) {
      requireRole(["admin"]);
      return withLoading(async () => {
        // Get appointments by status
        const { data: statusData, error: statusError } = await supabase
          .from("Appointment")
          .select("Status")
          .gte("AppointmentDateTime", startDate)
          .lte("AppointmentDateTime", endDate);

        // Get appointments by type
        const { data: typeData, error: typeError } = await supabase
          .from("Appointment")
          .select("Type")
          .gte("AppointmentDateTime", startDate)
          .lte("AppointmentDateTime", endDate);

        if (statusError || typeError) {
          throw new Error("Failed to fetch appointment analytics");
        }

        // Process status data
        const statusCounts = {};
        statusData?.forEach((apt) => {
          statusCounts[apt.Status] = (statusCounts[apt.Status] || 0) + 1;
        });

        // Process type data
        const typeCounts = {};
        typeData?.forEach((apt) => {
          typeCounts[apt.Type] = (typeCounts[apt.Type] || 0) + 1;
        });

        return {
          byStatus: Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
            color: getStatusColor(status),
          })),
          byType: Object.entries(typeCounts).map(([type, count]) => ({
            type,
            count,
            color: getTypeColor(type),
          })),
        };
      });
    },

    async getPatientAnalytics(startDate, endDate) {
      requireRole(["admin"]);
      return withLoading(async () => {
        // Get patients by gender
        const { data: genderData, error: genderError } = await supabase
          .from("Patients")
          .select("Gender")
          .gte("created_at", startDate)
          .lte("created_at", endDate);

        if (genderError) {
          throw new Error("Failed to fetch patient analytics");
        }

        // Process gender data
        const genderCounts = {};
        genderData?.forEach((patient) => {
          const gender = patient.Gender || "Not specified";
          genderCounts[gender] = (genderCounts[gender] || 0) + 1;
        });

        return {
          byGender: Object.entries(genderCounts).map(([gender, count]) => ({
            gender,
            count,
            color: getGenderColor(gender),
          })),
        };
      });
    },
  };

  // Treatment operations (admin and nurse only)
  const treatmentOps = {
    async getAllTreatments() {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Treatment")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async getTreatmentById(id) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Treatment")
          .select("*")
          .eq("TreatmentID", id)
          .single();

        if (error) throw error;
        return data;
      });
    },

    async createTreatment(treatmentData) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Treatment")
          .insert([
            {
              ...treatmentData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async updateTreatment(id, treatmentData) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Treatment")
          .update({
            ...treatmentData,
            updated_at: new Date().toISOString(),
          })
          .eq("TreatmentID", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async deleteTreatment(id) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { error } = await supabase
          .from("Treatment")
          .delete()
          .eq("TreatmentID", id);

        if (error) throw error;
        return true;
      });
    },

    async getTreatmentsByCategory(category) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Treatment")
          .select("*")
          .eq("category", category)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },
  };

  // Diagnosis operations (admin and nurse only)
  const diagnosisOps = {
    async getAllDiagnoses() {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Diagnosis")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async getDiagnosisById(id) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Diagnosis")
          .select("*")
          .eq("DiagnosisID", id)
          .single();

        if (error) throw error;
        return data;
      });
    },

    async createDiagnosis(diagnosisData) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Diagnosis")
          .insert([
            {
              ...diagnosisData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async updateDiagnosis(id, diagnosisData) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Diagnosis")
          .update({
            ...diagnosisData,
            updated_at: new Date().toISOString(),
          })
          .eq("DiagnosisID", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async deleteDiagnosis(id) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { error } = await supabase
          .from("Diagnosis")
          .delete()
          .eq("DiagnosisID", id);

        if (error) throw error;
        return true;
      });
    },

    async getDiagnosesByCategory(category) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Diagnosis")
          .select("*")
          .eq("category", category)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      });
    },
  };

  // Consultation Notes operations (admin and nurse only)
  const consultationNotes = {
    async getAllConsultationNotes() {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notes")
          .select("*")
          .order("CreatedAt", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async getConsultationNoteById(id) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notes")
          .select("*")
          .eq("NoteID", id)
          .single();

        if (error) throw error;
        return data;
      });
    },

    async createConsultationNote(noteData) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notes")
          .insert([
            {
              ...noteData,
              CreatedAt: new Date().toISOString(),
              UpdatedAt: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async updateConsultationNote(id, noteData) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notes")
          .update({
            ...noteData,
            UpdatedAt: new Date().toISOString(),
          })
          .eq("NoteID", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },

    async deleteConsultationNote(id) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { error } = await supabase
          .from("Notes")
          .delete()
          .eq("NoteID", id);

        if (error) throw error;
        return true;
      });
    },

    async getConsultationNotesByPatient(patientId) {
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notes")
          .select("*")
          .eq("PatientID", patientId)
          .order("CreatedAt", { ascending: false });

        if (error) throw error;
        return data;
      });
    },

    async getConsultationNotesByStaff(staffId) {
      requireRole(["admin", "nurse"]);
      return withLoading(async () => {
        const { data, error } = await supabase
          .from("Notes")
          .select("*")
          .eq("EnteredBy", staffId)
          .order("CreatedAt", { ascending: false });

        if (error) throw error;
        return data;
      });
    },
  };

  // Helper functions for colors
  const getStatusColor = (status) => {
    const colors = {
      Completed: "#4CAF50",
      Confirmed: "#2196F3",
      Pending: "#FF9800",
      Cancelled: "#F44336",
      Scheduled: "#9C27B0",
    };
    return colors[status] || "#607D8B";
  };

  const getTypeColor = (type) => {
    const colors = {
      Consultation: "#9C27B0",
      "Follow-up": "#607D8B",
      Vaccination: "#795548",
      Emergency: "#F44336",
      "Check-up": "#2196F3",
    };
    return colors[type] || "#607D8B";
  };

  const getGenderColor = (gender) => {
    const colors = {
      Male: "#2196F3",
      Female: "#E91E63",
      Other: "#9C27B0",
      "Not specified": "#607D8B",
    };
    return colors[gender] || "#607D8B";
  };

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Access control
    canAccess,
    requireAuth,
    requireRole,

    // Operations
    patients: patientOps,
    appointments: appointmentOps,
    staff: staffOps,
    notifications: notificationOps,
    medicalRecords: medicalRecordOps,
    reports: reportOps,
    consultationNotes,
    treatments: treatmentOps,
    diagnoses: diagnosisOps,

    // Utilities
    supabase,
  };
};

export default useSupabase;
