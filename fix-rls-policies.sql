-- =========================================
-- Fix RLS Policies for Admin Setup
-- =========================================

-- Temporarily disable RLS to allow admin profile insertion
ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;

-- Insert the admin profile manually
INSERT INTO "Users" ("UserID", "Username", "Email", "RoleName", "fullName", "created_at", "updated_at")
VALUES (
    '64d5478e-0ccf-4d51-a267-2600d80d0ca9',
    'admin',
    'admin@baankm3clinic.ph',
    'Staff',
    'System Administrator',
    NOW(),
    NOW()
) ON CONFLICT ("UserID") DO NOTHING;

-- Re-enable RLS
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;

-- Update the admin policies to allow service role access
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users select own" ON "Users";
DROP POLICY IF EXISTS "Users update own" ON "Users";
DROP POLICY IF EXISTS "Admins can read all users" ON "Users";
DROP POLICY IF EXISTS "Allow admins to insert new users" ON "Users";

-- Create new policies that allow service role and proper admin access
CREATE POLICY "Users can read own data" ON "Users"
FOR SELECT USING (auth.uid() = "UserID");

CREATE POLICY "Users can update own data" ON "Users"
FOR UPDATE USING (auth.uid() = "UserID");

CREATE POLICY "Admins can manage all users" ON "Users"
FOR ALL USING (
    (SELECT "RoleName" FROM "Users" WHERE "UserID" = auth.uid()) = 'Staff'
    OR auth.jwt()->>'role' = 'service_role'
);

-- Allow authenticated users to read their own profile
CREATE POLICY "Allow authenticated users to read own profile" ON "Users"
FOR SELECT USING (auth.uid() = "UserID");

-- Allow service role full access (bypasses RLS)
CREATE POLICY "Service role full access" ON "Users"
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Similar fixes for other tables
ALTER TABLE "Role" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;

-- Allow reading roles
CREATE POLICY "Anyone can read roles" ON "Role" FOR SELECT USING (true);

-- Service role access to Role table
CREATE POLICY "Service role access to roles" ON "Role"
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Fix Patients table policies
DROP POLICY IF EXISTS "Staff read patients" ON "Patients";
DROP POLICY IF EXISTS "Admins can read all patients" ON "Patients";
DROP POLICY IF EXISTS "Allow admins to insert new patients" ON "Patients";

CREATE POLICY "Patients can read own data" ON "Patients"
FOR SELECT USING (
    (SELECT "UserID" FROM "Users" WHERE "UserID" = auth.uid()) IS NOT NULL
    AND "UserID" = auth.uid()
);

CREATE POLICY "Staff can read assigned patients" ON "Patients"
FOR SELECT USING (
    EXISTS (SELECT 1 FROM "Staff" WHERE "UserID" = auth.uid())
);

CREATE POLICY "Admins can manage all patients" ON "Patients"
FOR ALL USING (
    (SELECT "RoleName" FROM "Users" WHERE "UserID" = auth.uid()) = 'Staff'
    OR auth.jwt()->>'role' = 'service_role'
);

-- Fix Staff table policies
DROP POLICY IF EXISTS "Admins can read all staff" ON "Staff";
DROP POLICY IF EXISTS "Allow admins to insert new staff" ON "Staff";

CREATE POLICY "Staff can read own data" ON "Staff"
FOR SELECT USING ("UserID" = auth.uid());

CREATE POLICY "Admins can manage all staff" ON "Staff"
FOR ALL USING (
    (SELECT "RoleName" FROM "Users" WHERE "UserID" = auth.uid()) = 'Staff'
    OR auth.jwt()->>'role' = 'service_role'
);

-- Service role policies for all tables
CREATE POLICY "Service role access to patients" ON "Patients"
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role access to staff" ON "Staff"
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role access to appointments" ON "Appointment"
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role access to diagnosis" ON "Diagnosis"
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role access to treatment" ON "Treatment"
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role access to medical records" ON "MedicalRecord"
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role access to notes" ON "Notes"
FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role access to notifications" ON "Notification"
FOR ALL USING (auth.jwt()->>'role' = 'service_role');
