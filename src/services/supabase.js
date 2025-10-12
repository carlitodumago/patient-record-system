import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table constants
export const TABLES = {
  ROLES: "Role",
  USERS: "Users",
  STAFF: "Staff",
  PATIENTS: "Patients",
  APPOINTMENTS: "Appointment",
  DIAGNOSIS: "Diagnosis",
  TREATMENT: "Treatment",
  NOTES: "Notes",
  MEDICAL_RECORDS: "MedicalRecord",
  NOTIFICATIONS: "Notification",
  AUDIT_LOGS: "audit_logs",
};
