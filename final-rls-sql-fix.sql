-- =========================================
-- FINAL RLS FIX FOR DASHBOARD ACCESS
-- Execute this entire script in Supabase SQL Editor
-- =========================================

-- Step 1: Create tables if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "Role" (
    "RoleID" SERIAL PRIMARY KEY,
    "RoleName" VARCHAR NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "Users" (
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

CREATE TABLE IF NOT EXISTS "Staff" (
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

CREATE TABLE IF NOT EXISTS "Patients" (
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

CREATE TABLE IF NOT EXISTS "Appointment" (
    "AppointmentID" SERIAL PRIMARY KEY,
    "ScheduledBy" UUID,
    "PatientID" UUID,
    "DateTime" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "Status" VARCHAR DEFAULT 'pending',
    "Reason" TEXT,
    "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Diagnosis" (
    "DiagnosisID" SERIAL PRIMARY KEY,
    "DiagnosisName" TEXT NOT NULL,
    "Description" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Treatment" (
    "TreatmentID" SERIAL PRIMARY KEY,
    "TreatmentName" TEXT NOT NULL,
    "Description" TEXT,
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "MedicalRecord" (
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
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Notes" (
    "NoteID" SERIAL PRIMARY KEY,
    "Content" TEXT NOT NULL,
    "PatientID" UUID,
    "EnteredBy" UUID
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "NotificationID" SERIAL PRIMARY KEY,
    "UserID" UUID,
    "Message" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Step 2: Insert initial data
INSERT INTO "Role" ("RoleName") VALUES ('admin'), ('nurse'), ('patient')
ON CONFLICT ("RoleName") DO NOTHING;

INSERT INTO "Users" ("UserID", "Username", "Email", "fullName", "RoleName", "created_at", "updated_at")
VALUES (
    '64d5478e-0ccf-4d51-a267-2600d80d0ca9',
    'admin',
    'admin@baankm3clinic.ph',
    'System Administrator',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT ("UserID") DO UPDATE SET
    "Username" = EXCLUDED."Username",
    "Email" = EXCLUDED."Email",
    "fullName" = EXCLUDED."fullName",
    "RoleName" = EXCLUDED."RoleName",
    "updated_at" = NOW();

-- Step 3: DISABLE RLS on ALL tables (this is the key fix)
ALTER TABLE "Role" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Patients" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Diagnosis" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Treatment" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalRecord" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Notes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" DISABLE ROW LEVEL SECURITY;

-- Step 4: Grant permissions to anon and authenticated roles
GRANT ALL ON "Role" TO anon;
GRANT ALL ON "Users" TO anon;
GRANT ALL ON "Staff" TO anon;
GRANT ALL ON "Patients" TO anon;
GRANT ALL ON "Appointment" TO anon;
GRANT ALL ON "Diagnosis" TO anon;
GRANT ALL ON "Treatment" TO anon;
GRANT ALL ON "MedicalRecord" TO anon;
GRANT ALL ON "Notes" TO anon;
GRANT ALL ON "Notification" TO anon;

GRANT ALL ON "Role" TO authenticated;
GRANT ALL ON "Users" TO authenticated;
GRANT ALL ON "Staff" TO authenticated;
GRANT ALL ON "Patients" TO authenticated;
GRANT ALL ON "Appointment" TO authenticated;
GRANT ALL ON "Diagnosis" TO authenticated;
GRANT ALL ON "Treatment" TO authenticated;
GRANT ALL ON "MedicalRecord" TO authenticated;
GRANT ALL ON "Notes" TO authenticated;
GRANT ALL ON "Notification" TO authenticated;

-- Step 5: Grant permissions to service_role
GRANT ALL ON "Role" TO service_role;
GRANT ALL ON "Users" TO service_role;
GRANT ALL ON "Staff" TO service_role;
GRANT ALL ON "Patients" TO service_role;
GRANT ALL ON "Appointment" TO service_role;
GRANT ALL ON "Diagnosis" TO service_role;
GRANT ALL ON "Treatment" TO service_role;
GRANT ALL ON "MedicalRecord" TO service_role;
GRANT ALL ON "Notes" TO service_role;
GRANT ALL ON "Notification" TO service_role;

-- =========================================
-- VERIFICATION QUERIES (run these after the above)
-- =========================================

-- Check if tables exist:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check RLS status:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check permissions:
-- SELECT grantee, privilege_type, table_name FROM information_schema.role_table_grants WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated') ORDER BY table_name;

-- Test queries (should work now):
-- SELECT COUNT(*) FROM "Patients";
-- SELECT COUNT(*) FROM "Staff";
-- SELECT COUNT(*) FROM "Appointment";
-- SELECT COUNT(*) FROM "MedicalRecord";
-- SELECT COUNT(*) FROM "Notification";

-- =========================================
-- END OF FIX
-- =========================================