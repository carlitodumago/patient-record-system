-- =========================================
-- Auth Users Seeder for Patient Record System
-- Run this in Supabase SQL Editor AFTER running complete-schema.sql
-- =========================================

-- Note: Supabase Auth users must be created through the Auth API or Dashboard
-- This script creates the corresponding records in the public.Users table
-- and links them to Staff/Patients tables

-- =========================================
-- IMPORTANT: First create users in Supabase Dashboard
-- Go to: Authentication > Users > Add User
-- Create users with these emails, then run this script
-- =========================================

-- Default password for seeded users (change in production!)
-- Password: Test@123456

-- =========================================
-- Step 1: Insert Users into public.Users table
-- Replace the UUIDs below with actual auth.users IDs after creating them
-- =========================================

-- Function to safely insert or update user
CREATE OR REPLACE FUNCTION seed_user(
    p_auth_id UUID,
    p_email TEXT,
    p_username TEXT,
    p_full_name TEXT,
    p_role_name TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO "Users" ("UserID", "Email", "Username", "fullName", "RoleName", "created_at")
    VALUES (p_auth_id, p_email, p_username, p_full_name, p_role_name, NOW())
    ON CONFLICT ("UserID") DO UPDATE SET
        "Email" = EXCLUDED."Email",
        "Username" = EXCLUDED."Username",
        "fullName" = EXCLUDED."fullName",
        "RoleName" = EXCLUDED."RoleName",
        "updated_at" = NOW();
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- Step 2: Create Admin User
-- =========================================

-- To create an admin user via SQL (using Supabase auth.users directly):
-- This requires service_role access

DO $$
DECLARE
    admin_id UUID;
    nurse_id UUID;
    patient_id UUID;
BEGIN
    -- Check if we can access auth schema (only works with service_role)
    -- If not, users must be created via Dashboard first
    
    RAISE NOTICE '⚠️ To seed auth users, please use one of these methods:';
    RAISE NOTICE '';
    RAISE NOTICE '📋 METHOD 1: Supabase Dashboard (Recommended)';
    RAISE NOTICE '   1. Go to Authentication > Users > Add User';
    RAISE NOTICE '   2. Create users with emails: admin@clinic.com, nurse@clinic.com, patient@clinic.com';
    RAISE NOTICE '   3. Use password: Test@123456';
    RAISE NOTICE '   4. Copy the User UID for each user';
    RAISE NOTICE '   5. Run the INSERT statements below with the correct UUIDs';
    RAISE NOTICE '';
    RAISE NOTICE '📋 METHOD 2: Use the Node.js seeder script (seed-auth-users.js)';
    RAISE NOTICE '';
END $$;

-- =========================================
-- Step 3: After creating auth users, run these with actual UUIDs
-- Replace 'YOUR-ADMIN-UUID' etc. with real UUIDs from auth.users
-- =========================================

/*
-- Uncomment and update these after creating auth users:

-- Admin User
SELECT seed_user(
    'YOUR-ADMIN-UUID-HERE'::UUID,
    'admin@clinic.com',
    'admin',
    'System Administrator',
    'admin'
);

-- Insert into Staff table
INSERT INTO "Staff" ("UserID", "FirstName", "Surname", "ContactNumber", "RoleID", "Specialization", "IsActive")
SELECT 
    'YOUR-ADMIN-UUID-HERE'::UUID,
    'System',
    'Administrator',
    '+1234567890',
    (SELECT "RoleID" FROM "Role" WHERE "RoleName" = 'admin'),
    'Administration',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "Staff" WHERE "UserID" = 'YOUR-ADMIN-UUID-HERE'::UUID
);

-- Nurse User
SELECT seed_user(
    'YOUR-NURSE-UUID-HERE'::UUID,
    'nurse@clinic.com',
    'nurse',
    'Jane Smith',
    'nurse'
);

-- Insert into Staff table
INSERT INTO "Staff" ("UserID", "FirstName", "Surname", "ContactNumber", "RoleID", "Specialization", "IsActive")
SELECT 
    'YOUR-NURSE-UUID-HERE'::UUID,
    'Jane',
    'Smith',
    '+1234567891',
    (SELECT "RoleID" FROM "Role" WHERE "RoleName" = 'nurse'),
    'General Nursing',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "Staff" WHERE "UserID" = 'YOUR-NURSE-UUID-HERE'::UUID
);

-- Patient User
SELECT seed_user(
    'YOUR-PATIENT-UUID-HERE'::UUID,
    'patient@example.com',
    'patient',
    'John Doe',
    'patient'
);

-- Insert into Patients table
INSERT INTO "Patients" ("UserID", "FirstName", "Surname", "Gender", "BirthDate", "ContactNumber", "Address", "IsActive")
SELECT 
    'YOUR-PATIENT-UUID-HERE'::UUID,
    'John',
    'Doe',
    'Male',
    '1990-01-15',
    '+1234567892',
    '123 Main Street, City',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "Patients" WHERE "UserID" = 'YOUR-PATIENT-UUID-HERE'::UUID
);

-- Link patient to user
UPDATE "Users" 
SET "PatientID" = (SELECT "PatientID" FROM "Patients" WHERE "UserID" = 'YOUR-PATIENT-UUID-HERE'::UUID)
WHERE "UserID" = 'YOUR-PATIENT-UUID-HERE'::UUID;

*/

-- =========================================
-- Cleanup helper function (optional)
-- =========================================
-- DROP FUNCTION IF EXISTS seed_user(UUID, TEXT, TEXT, TEXT, TEXT);

-- =========================================
-- Verification Query
-- Run this to see all users after seeding
-- =========================================

SELECT 
    u."UserID",
    u."Email",
    u."Username",
    u."fullName",
    u."RoleName",
    CASE 
        WHEN s."StaffID" IS NOT NULL THEN 'Staff: ' || s."FirstName" || ' ' || s."Surname"
        WHEN p."PatientID" IS NOT NULL THEN 'Patient: ' || p."FirstName" || ' ' || p."Surname"
        ELSE 'No profile'
    END as "Profile",
    u."created_at"
FROM "Users" u
LEFT JOIN "Staff" s ON u."UserID" = s."UserID"
LEFT JOIN "Patients" p ON u."UserID" = p."UserID"
ORDER BY u."created_at" DESC;
