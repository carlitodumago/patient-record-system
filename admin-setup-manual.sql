-- MANUAL ADMIN SETUP - Execute this in Supabase SQL Editor
-- This will fix the RLS policies and insert the admin profile

-- Step 1: Drop overly restrictive policies
DROP POLICY IF EXISTS "Users select policy" ON "Users";
DROP POLICY IF EXISTS "Users insert policy" ON "Users";
DROP POLICY IF EXISTS "Users update policy" ON "Users";
DROP POLICY IF EXISTS "Users delete policy" ON "Users";

DROP POLICY IF EXISTS "Role select policy" ON "Role";
DROP POLICY IF EXISTS "Role insert policy" ON "Role";
DROP POLICY IF EXISTS "Role update policy" ON "Role";
DROP POLICY IF EXISTS "Role delete policy" ON "Role";

-- Step 2: Create proper policies for authentication
-- Allow anyone to read users for authentication (username lookup)
DROP POLICY IF EXISTS "Users authentication read" ON "Users";
CREATE POLICY "Users authentication read" ON "Users"
    FOR SELECT
    USING (true);

-- Allow authenticated users to read their own data
DROP POLICY IF EXISTS "Users self read" ON "Users";
CREATE POLICY "Users self read" ON "Users"
    FOR SELECT
    USING (auth.uid() = "UserID");

-- Allow authenticated users to update their own data
DROP POLICY IF EXISTS "Users self update" ON "Users";
CREATE POLICY "Users self update" ON "Users"
    FOR UPDATE
    USING (auth.uid() = "UserID");

-- Allow service role full access
DROP POLICY IF EXISTS "Users service role access" ON "Users";
CREATE POLICY "Users service role access" ON "Users"
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Role table policies
DROP POLICY IF EXISTS "Role read access" ON "Role";
CREATE POLICY "Role read access" ON "Role"
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Role service role access" ON "Role";
CREATE POLICY "Role service role access" ON "Role"
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Additional policy for username lookup during login
DROP POLICY IF EXISTS "Users username lookup" ON "Users";
CREATE POLICY "Users username lookup" ON "Users"
    FOR SELECT
    USING (true);

-- Step 3: Insert admin profile (using correct column names from schema)
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
ON CONFLICT ("UserID") DO NOTHING;

-- Step 4: Insert basic roles
INSERT INTO "Role" ("RoleName")
VALUES
    ('admin'),
    ('nurse'),
    ('patient')
ON CONFLICT ("RoleName") DO NOTHING;

-- Step 5: Verify setup
SELECT 'Admin user in Users table:' as check_type, COUNT(*) as count FROM "Users" WHERE "Username" = 'admin'
UNION ALL
SELECT 'Roles in Role table:' as check_type, COUNT(*) as count FROM "Role"
UNION ALL
SELECT 'Admin role exists:' as check_type, COUNT(*) as count FROM "Role" WHERE "RoleName" = 'admin';

-- Step 6: Test the policies work
SELECT "Username", "Email", "RoleName" FROM "Users" WHERE "Username" = 'admin';
