-- Initialize database schema for HIS

-- Create Role table
CREATE TABLE IF NOT EXISTS "Role" (
  "RoleID" SERIAL PRIMARY KEY,
  "RoleName" VARCHAR(50) UNIQUE NOT NULL
);

-- Create Users table
CREATE TABLE IF NOT EXISTS "Users" (
  "UserID" VARCHAR(255) PRIMARY KEY, -- Changed to VARCHAR for Supabase Auth UUID
  "Username" VARCHAR(100) UNIQUE NOT NULL,
  "Password" VARCHAR(255) NOT NULL, -- Plain text for prototype
  "Email" VARCHAR(255) UNIQUE NOT NULL,
  "RoleID" INTEGER REFERENCES "Role"("RoleID"),
  "CreatedAt" TIMESTAMP DEFAULT NOW(),
  "FirstLogin" BOOLEAN DEFAULT TRUE -- For password change prompt
);

-- Create Staff table
CREATE TABLE IF NOT EXISTS "Staff" (
  "StaffID" SERIAL PRIMARY KEY,
  "UserID" VARCHAR(255) REFERENCES "Users"("UserID"),
  "FirstName" VARCHAR(100) NOT NULL,
  "Surname" VARCHAR(100) NOT NULL,
  "Suffix" VARCHAR(10),
  "ContactNumber" VARCHAR(20)
);

-- Create Patients table
CREATE TABLE IF NOT EXISTS "Patients" (
  "PatientID" SERIAL PRIMARY KEY,
  "UserID" VARCHAR(255) REFERENCES "Users"("UserID"),
  "FirstName" VARCHAR(100) NOT NULL,
  "Surname" VARCHAR(100) NOT NULL,
  "Suffix" VARCHAR(10),
  "Address" TEXT,
  "Gender" VARCHAR(10),
  "BirthDate" DATE,
  "ContactNumber" VARCHAR(20)
);

-- Create Appointment table
CREATE TABLE IF NOT EXISTS "Appointment" (
  "AppointmentID" SERIAL PRIMARY KEY,
  "ScheduledBy" INTEGER REFERENCES "Staff"("StaffID"),
  "PatientID" INTEGER REFERENCES "Patients"("PatientID"),
  "DateTime" TIMESTAMP NOT NULL,
  "Status" VARCHAR(50) DEFAULT 'pending',
  "Reason" TEXT,
  "CreatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Diagnosis table
CREATE TABLE IF NOT EXISTS "Diagnosis" (
  "DiagnosisID" SERIAL PRIMARY KEY,
  "Description" TEXT NOT NULL
);

-- Create Treatment table
CREATE TABLE IF NOT EXISTS "Treatment" (
  "TreatmentID" SERIAL PRIMARY KEY,
  "Description" TEXT NOT NULL
);

-- Create Notes table
CREATE TABLE IF NOT EXISTS "Notes" (
  "NoteID" SERIAL PRIMARY KEY,
  "Content" TEXT NOT NULL
);

-- Create MedicalRecord table
CREATE TABLE IF NOT EXISTS "MedicalRecord" (
  "RecordID" SERIAL PRIMARY KEY,
  "AppointmentID" INTEGER REFERENCES "Appointment"("AppointmentID"),
  "EnteredBy" INTEGER REFERENCES "Staff"("StaffID"),
  "DiagnosisID" INTEGER REFERENCES "Diagnosis"("DiagnosisID"),
  "TreatmentID" INTEGER REFERENCES "Treatment"("TreatmentID"),
  "NoteID" INTEGER REFERENCES "Notes"("NoteID"),
  "CreatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
  "NotificationID" SERIAL PRIMARY KEY,
  "UserID" VARCHAR(255) REFERENCES "Users"("UserID"),
  "Message" TEXT NOT NULL,
  "CreatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Audit Logs table for security compliance
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" SERIAL PRIMARY KEY,
  "event_type" VARCHAR(100) NOT NULL,
  "user_id" VARCHAR(255) REFERENCES "Users"("UserID"),
  "details" TEXT,
  "ip_address" VARCHAR(45),
  "user_agent" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_event_type" ON "audit_logs"("event_type");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs"("created_at");

-- Insert default roles
INSERT INTO "Role" ("RoleName") VALUES ('admin'), ('nurse'), ('patient') ON CONFLICT ("RoleName") DO NOTHING;

-- Insert default admin account (UserID will be set by script)
-- Note: This is a placeholder. The actual admin creation is handled by create-admin.js
