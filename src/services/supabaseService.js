// Supabase service for direct database operations and real-time updates
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export const authService = {
  // Sign up new user
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  // Sign in user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },
};

// Patient services
export const patientService = {
  // Get all patients (staff only)
  getAllPatients: async () => {
    const { data, error } = await supabase
      .from("Patients")
      .select(
        `
        *,
        Users!inner(fullName, email)
      `
      )
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Get patient by ID
  getPatientById: async (id) => {
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

    return { data, error };
  },

  // Get patients for current user (patients only)
  getMyPatients: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("Patients")
      .select("*")
      .eq("UserID", user.id)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Create new patient
  createPatient: async (patientData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("Patients")
      .insert([
        {
          ...patientData,
          UserID: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    const { data, error } = await supabase
      .from("Patients")
      .update({
        ...patientData,
        updated_at: new Date().toISOString(),
      })
      .eq("PatientID", id)
      .select()
      .single();

    return { data, error };
  },

  // Delete patient
  deletePatient: async (id) => {
    const { error } = await supabase
      .from("Patients")
      .delete()
      .eq("PatientID", id);

    return { error };
  },
};

// Medical Record services
export const medicalRecordService = {
  // Get all medical records (staff only)
  getAllMedicalRecords: async () => {
    const { data, error } = await supabase
      .from("MedicalRecord")
      .select(
        `
        *,
        Appointment!inner(
          *,
          Patients!inner(
            *,
            Users!inner(fullName)
          )
        ),
        Diagnosis(diagnosisName),
        Treatment(treatmentName),
        Notes(notes)
      `
      )
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Get medical record by ID
  getMedicalRecordById: async (id) => {
    const { data, error } = await supabase
      .from("MedicalRecord")
      .select(
        `
        *,
        Appointment!inner(
          *,
          Patients!inner(
            *,
            Users!inner(fullName)
          )
        ),
        Diagnosis(diagnosisName),
        Treatment(treatmentName),
        Notes(notes)
      `
      )
      .eq("MedicalRecordID", id)
      .single();

    return { data, error };
  },

  // Get medical records for current patient
  getMyMedicalRecords: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("MedicalRecord")
      .select(
        `
        *,
        Appointment!inner(
          *,
          Patients!inner(*)
        ),
        Diagnosis(diagnosisName),
        Treatment(treatmentName),
        Notes(notes)
      `
      )
      .eq("Appointment.Patients.UserID", user.id)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Get medical records by appointment ID
  getMedicalRecordsByAppointment: async (appointmentId) => {
    const { data, error } = await supabase
      .from("MedicalRecord")
      .select(
        `
        *,
        Diagnosis(diagnosisName),
        Treatment(treatmentName),
        Notes(notes)
      `
      )
      .eq("AppointmentID", appointmentId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Create new medical record
  createMedicalRecord: async (medicalRecordData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("MedicalRecord")
      .insert([
        {
          ...medicalRecordData,
          EnteredBy: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update medical record
  updateMedicalRecord: async (id, medicalRecordData) => {
    const { data, error } = await supabase
      .from("MedicalRecord")
      .update({
        ...medicalRecordData,
        updated_at: new Date().toISOString(),
      })
      .eq("MedicalRecordID", id)
      .select()
      .single();

    return { data, error };
  },

  // Delete medical record
  deleteMedicalRecord: async (id) => {
    const { error } = await supabase
      .from("MedicalRecord")
      .delete()
      .eq("MedicalRecordID", id);

    return { error };
  },
};

// Appointment services
export const appointmentService = {
  // Get all appointments (staff only)
  getAllAppointments: async () => {
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

    return { data, error };
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
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
      .eq("AppointmentID", id)
      .single();

    return { data, error };
  },

  // Get appointments for current patient
  getMyAppointments: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

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
      .eq("Patients.UserID", user.id)
      .order("AppointmentDateTime", { ascending: true });

    return { data, error };
  },

  // Get appointments for current staff
  getMyStaffAppointments: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

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
      .eq("Staff.UserID", user.id)
      .order("AppointmentDateTime", { ascending: true });

    return { data, error };
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("Appointment")
      .insert([
        {
          ...appointmentData,
          ScheduledBy: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    const { data, error } = await supabase
      .from("Appointment")
      .update({
        ...appointmentData,
        updated_at: new Date().toISOString(),
      })
      .eq("AppointmentID", id)
      .select()
      .single();

    return { data, error };
  },

  // Delete appointment
  deleteAppointment: async (id) => {
    const { error } = await supabase
      .from("Appointment")
      .delete()
      .eq("AppointmentID", id);

    return { error };
  },
};

// Staff services
export const staffService = {
  // Get all staff (admin only)
  getAllStaff: async () => {
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

    return { data, error };
  },

  // Get staff by ID
  getStaffById: async (id) => {
    const { data, error } = await supabase
      .from("Staff")
      .select(
        `
        *,
        Users!inner(fullName, email),
        Role(RoleName)
      `
      )
      .eq("StaffID", id)
      .single();

    return { data, error };
  },

  // Create new staff member
  createStaff: async (staffData) => {
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

    return { data, error };
  },

  // Update staff member
  updateStaff: async (id, staffData) => {
    const { data, error } = await supabase
      .from("Staff")
      .update({
        ...staffData,
        updated_at: new Date().toISOString(),
      })
      .eq("StaffID", id)
      .select()
      .single();

    return { data, error };
  },

  // Delete staff member
  deleteStaff: async (id) => {
    const { error } = await supabase.from("Staff").delete().eq("StaffID", id);

    return { error };
  },
};

// Notification services
export const notificationService = {
  // Get all notifications (staff only)
  getAllNotifications: async () => {
    const { data, error } = await supabase
      .from("Notification")
      .select(
        `
        *,
        Users!inner(fullName)
      `
      )
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Get notifications for current user
  getMyNotifications: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("Notification")
      .select("*")
      .eq("UserID", user.id)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Get notification by ID
  getNotificationById: async (id) => {
    const { data, error } = await supabase
      .from("Notification")
      .select("*")
      .eq("NotificationID", id)
      .single();

    return { data, error };
  },

  // Create new notification
  createNotification: async (notificationData) => {
    const { data, error } = await supabase
      .from("Notification")
      .insert([
        {
          ...notificationData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data, error };
  },

  // Update notification
  updateNotification: async (id, notificationData) => {
    const { data, error } = await supabase
      .from("Notification")
      .update({
        ...notificationData,
        updated_at: new Date().toISOString(),
      })
      .eq("NotificationID", id)
      .select()
      .single();

    return { data, error };
  },

  // Delete notification
  deleteNotification: async (id) => {
    const { error } = await supabase
      .from("Notification")
      .delete()
      .eq("NotificationID", id);

    return { error };
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const { data, error } = await supabase
      .from("Notification")
      .update({
        IsRead: true,
        updated_at: new Date().toISOString(),
      })
      .eq("NotificationID", id)
      .select()
      .single();

    return { data, error };
  },
};

// Real-time subscriptions
export const realtimeService = {
  // Subscribe to patient changes
  subscribeToPatients: (callback) => {
    return supabase
      .channel("patients_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Patients" },
        callback
      )
      .subscribe();
  },

  // Subscribe to medical record changes
  subscribeToMedicalRecords: (callback) => {
    return supabase
      .channel("medical_records_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "MedicalRecord" },
        callback
      )
      .subscribe();
  },

  // Subscribe to appointment changes
  subscribeToAppointments: (callback) => {
    return supabase
      .channel("appointments_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Appointment" },
        callback
      )
      .subscribe();
  },

  // Subscribe to notifications for current user
  subscribeToMyNotifications: (callback) => {
    const channel = supabase
      .channel("my_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Notification" },
        async (payload) => {
          // Only show notifications for current user
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && payload.new.UserID === user.id) {
            callback(payload);
          }
        }
      )
      .subscribe();

    return channel;
  },

  // Unsubscribe from a channel
  unsubscribe: (channel) => {
    supabase.removeChannel(channel);
  },
};

export default supabase;
