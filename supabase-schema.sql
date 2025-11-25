-- =========================================
-- Baan KM-3 Patient Record System Schema
-- Supabase PostgreSQL Database Schema
-- Based on existing project schema with UUIDs and RLS
-- =========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- TABLES
-- =========================================

-- Role table (lookup table for user roles)
CREATE TABLE "Role" (
    "RoleID" SERIAL PRIMARY KEY,
    "RoleName" VARCHAR NOT NULL UNIQUE
);

-- Users table (extends Supabase auth.users)
CREATE TABLE "Users" (
    "UserID" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "PatientID" UUID,
    "Username" VARCHAR NOT NULL UNIQUE,
    "Password" VARCHAR,
    "Email" VARCHAR NOT NULL UNIQUE,
    "RoleName" TEXT REFERENCES "Role"("RoleName"),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "fullName" TEXT,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Staff table (for medical staff)
CREATE TABLE "Staff" (
    "StaffID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserID" UUID REFERENCES "Users"("UserID"),
    "FirstName" VARCHAR NOT NULL,
    "Surname" VARCHAR NOT NULL,
    "Suffix" VARCHAR,
    "ContactNumber" VARCHAR,
    "RoleID" INTEGER REFERENCES "Role"("RoleID"),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE "Patients" (
    "PatientID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserID" UUID REFERENCES "Users"("UserID"),
    "FirstName" VARCHAR NOT NULL,
    "Surname" VARCHAR NOT NULL,
    "Suffix" VARCHAR,
    "Address" TEXT,
    "Gender" VARCHAR,
    "BirthDate" DATE,
    "ContactNumber" VARCHAR,
    "EmergencyContact" VARCHAR,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Appointment table
CREATE TABLE "Appointment" (
    "AppointmentID" SERIAL PRIMARY KEY,
    "ScheduledBy" UUID,
    "PatientID" UUID,
    "DateTime" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "Status" VARCHAR DEFAULT 'pending',
    "Reason" TEXT,
    "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_appointment_patientid FOREIGN KEY ("PatientID") REFERENCES "Patients"("PatientID"),
    CONSTRAINT fk_appointment_scheduledby FOREIGN KEY ("ScheduledBy") REFERENCES "Staff"("StaffID")
);

-- Diagnosis table
CREATE TABLE "Diagnosis" (
    "DiagnosisID" SERIAL PRIMARY KEY,
    "DiagnosisName" TEXT NOT NULL,
    "Description" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Treatment table
CREATE TABLE "Treatment" (
    "TreatmentID" SERIAL PRIMARY KEY,
    "TreatmentName" TEXT NOT NULL,
    "Description" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- MedicalRecord table
CREATE TABLE "MedicalRecord" (
    "MedicalRecordID" SERIAL PRIMARY KEY,
    "AppointmentID" INTEGER,
    "EnteredBy" UUID,
    "DiagnosisID" INTEGER,
    "TreatmentID" INTEGER,
    "NoteID" INTEGER,
    "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "PatientID" UUID,
    "Status" VARCHAR DEFAULT 'Draft',
    "VitalSigns" JSONB,
    "Notes" TEXT,
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_medicalrecord_appointmentid FOREIGN KEY ("AppointmentID") REFERENCES "Appointment"("AppointmentID"),
    CONSTRAINT fk_medicalrecord_enteredby FOREIGN KEY ("EnteredBy") REFERENCES "Staff"("StaffID"),
    CONSTRAINT MedicalRecord_DiagnosisID_fkey FOREIGN KEY ("DiagnosisID") REFERENCES "Diagnosis"("DiagnosisID"),
    CONSTRAINT MedicalRecord_TreatmentID_fkey FOREIGN KEY ("TreatmentID") REFERENCES "Treatment"("TreatmentID")
);

-- Notes table (consultation notes)
CREATE TABLE "Notes" (
    "NoteID" SERIAL PRIMARY KEY,
    "Content" TEXT NOT NULL,
    "PatientID" UUID,
    "EnteredBy" UUID,
    CONSTRAINT fk_notes_patientid FOREIGN KEY ("PatientID") REFERENCES "Patients"("PatientID"),
    CONSTRAINT fk_notes_enteredby FOREIGN KEY ("EnteredBy") REFERENCES "Staff"("StaffID")
);

-- Notification table
CREATE TABLE "Notification" (
    "NotificationID" SERIAL PRIMARY KEY,
    "UserID" UUID,
    "Message" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_notification_userid FOREIGN KEY ("UserID") REFERENCES "Users"("UserID")
);

-- UserSessions table for tracking active sessions
CREATE TABLE "UserSessions" (
    "SessionID" VARCHAR PRIMARY KEY,
    "UserID" UUID NOT NULL,
    "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "ExpiresAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "LastActivity" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_usersessions_userid FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE
);

-- =========================================
-- INDEXES
-- =========================================

-- Add indexes for performance
CREATE INDEX idx_appointment_patientid ON "Appointment"("PatientID");
CREATE INDEX idx_appointment_scheduledby ON "Appointment"("ScheduledBy");
CREATE INDEX idx_medicalrecord_patientid ON "MedicalRecord"("PatientID");
CREATE INDEX idx_medicalrecord_enteredby ON "MedicalRecord"("EnteredBy");
CREATE INDEX idx_notes_patientid ON "Notes"("PatientID");
CREATE INDEX idx_notes_enteredby ON "Notes"("EnteredBy");
CREATE INDEX idx_notification_userid ON "Notification"("UserID");

-- =========================================
-- FOREIGN KEYS
-- =========================================

-- Add foreign key from Users to Patients
ALTER TABLE "Users" ADD CONSTRAINT fk_users_patientid FOREIGN KEY ("PatientID") REFERENCES "Patients"("PatientID") ON DELETE SET NULL;

-- Add foreign key from MedicalRecord to Notes
ALTER TABLE "MedicalRecord" ADD CONSTRAINT fk_medicalrecord_noteid FOREIGN KEY ("NoteID") REFERENCES "Notes"("NoteID") ON DELETE SET NULL;

-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Diagnosis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Treatment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (simplified for this context)
-- Users can read their own data
CREATE POLICY "Users select own" ON "Users" FOR SELECT USING (auth.uid() = "UserID");
CREATE POLICY "Users update own" ON "Users" FOR UPDATE USING (auth.uid() = "UserID");

-- Staff can read patients they are assigned to
CREATE POLICY "Staff read patients" ON "Patients" FOR SELECT USING (
    EXISTS (SELECT 1 FROM "Staff" WHERE "UserID" = auth.uid())
);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON "Users" FOR SELECT USING (
  (SELECT "RoleName" FROM "public"."Users" WHERE "UserID" = auth.uid()) = 'Admin'
);

-- Admins can read all patients
CREATE POLICY "Admins can read all patients" ON "Patients" FOR SELECT USING (
  (SELECT "RoleName" FROM "public"."Users" WHERE "UserID" = auth.uid()) = 'Admin'
);

-- Admins can read all staff
CREATE POLICY "Admins can read all staff" ON "Staff" FOR SELECT USING (
  (SELECT "RoleName" FROM "public"."Users" WHERE "UserID" = auth.uid()) = 'Admin'
);

-- Allow admins to insert into the Users table
CREATE POLICY "Allow admins to insert new users"
ON "Users"
FOR INSERT
WITH CHECK (
  (SELECT "RoleName" FROM "public"."Users" WHERE "UserID" = auth.uid()) = 'Admin'
);

-- Allow admins to insert into the Patients table
CREATE POLICY "Allow admins to insert new patients"
ON "Patients"
FOR INSERT
WITH CHECK (
  (SELECT "RoleName" FROM "public"."Users" WHERE "UserID" = auth.uid()) = 'Admin'
);

-- Allow admins to insert into the Staff table
CREATE POLICY "Allow admins to insert new staff"
ON "Staff"
FOR INSERT
WITH CHECK (
  (SELECT "RoleName" FROM "public"."Users" WHERE "UserID" = auth.uid()) = 'Admin'
);


-- Similar policies for other tables based on role and assignment

-- =========================================
-- INITIAL DATA
-- =========================================

-- Insert default roles
INSERT INTO "Role" ("RoleName") VALUES ('Staff'), ('Patient');

-- =========================================
-- FUNCTIONS AND TRIGGERS
-- =========================================

-- Function to automatically create a user profile in public.Users on new auth.users entry
CREATE OR REPLACE FUNCTION public.handle_new_user_in_public_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."Users" ("UserID", "Email", "Username", "fullName", "RoleName")
  VALUES (
    NEW.id,
    NEW.email,
    -- Generate a username from email, or use a placeholder
    split_part(NEW.email, '@', 1),
    NEW.raw_user_meta_data->>'fullName', -- Assuming fullName is passed in user_metadata
    'Patient' -- Default role is 'Patient', can be updated later by admin
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user signup in auth.users
CREATE TRIGGER on_auth_user_created_in_public_users
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_in_public_users();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to Users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to MedicalRecord table
CREATE TRIGGER update_medicalrecord_updated_at BEFORE UPDATE ON "MedicalRecord"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to Diagnosis table
CREATE TRIGGER update_diagnosis_updated_at BEFORE UPDATE ON "Diagnosis"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to Treatment table
CREATE TRIGGER update_treatment_updated_at BEFORE UPDATE ON "Treatment"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to Staff table
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON "Staff"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to Patients table
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON "Patients"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- VIEWS (Optional)
-- =========================================

-- View for appointment details
CREATE OR REPLACE VIEW appointment_details AS
SELECT
    a."AppointmentID",
    a."DateTime",
    a."Status",
    a."Reason",
    p."FirstName" || ' ' || p."Surname" as "PatientName",
    s."FirstName" || ' ' || s."Surname" as "StaffName"
FROM "Appointment" a
JOIN "Patients" p ON a."PatientID" = p."PatientID"
LEFT JOIN "Staff" s ON a."ScheduledBy" = s."StaffID";

-- =========================================
-- END OF SCHEMA
-- =========================================
