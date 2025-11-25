-- Fix RLS Policies for Admin Authentication - COMPREHENSIVE FIX
-- Execute this SQL in Supabase SQL Editor

-- 1. First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. DISABLE RLS temporarily to ensure we can set up properly
ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Role" DISABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing policies that might conflict
-- Drop all existing policies on Users table
DROP POLICY IF EXISTS "Users select policy" ON "Users";
DROP POLICY IF EXISTS "Users insert policy" ON "Users";
DROP POLICY IF EXISTS "Users update policy" ON "Users";
DROP POLICY IF EXISTS "Users delete policy" ON "Users";
DROP POLICY IF EXISTS "Users authentication read" ON "Users";
DROP POLICY IF EXISTS "Users self read" ON "Users";
DROP POLICY IF EXISTS "Users self update" ON "Users";
DROP POLICY IF EXISTS "Users service role access" ON "Users";
DROP POLICY IF EXISTS "Users select own" ON "Users";
DROP POLICY IF EXISTS "Users update own" ON "Users";
DROP POLICY IF EXISTS "Users can read own profile" ON "Users";
DROP POLICY IF EXISTS "Users can read profiles by email for auth" ON "Users";
DROP POLICY IF EXISTS "Allow anon to read user profiles" ON "Users";
DROP POLICY IF EXISTS "Allow admins to insert new users" ON "Users";

-- Drop all existing policies on Role table
DROP POLICY IF EXISTS "Role select policy" ON "Role";
DROP POLICY IF EXISTS "Role insert policy" ON "Role";
DROP POLICY IF EXISTS "Role update policy" ON "Role";
DROP POLICY IF EXISTS "Role delete policy" ON "Role";
DROP POLICY IF EXISTS "Role read access" ON "Role";
DROP POLICY IF EXISTS "Role service role access" ON "Role";
DROP POLICY IF EXISTS "Allow authenticated to read roles" ON "Role";
DROP POLICY IF EXISTS "Allow anon to read roles" ON "Role";

-- 4. RE-ENABLE RLS
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;

-- 5. Create proper RLS policies that allow authentication

-- Users table policies - ALLOW ANONYMOUS ACCESS FOR AUTHENTICATION
-- Allow anyone to read users for authentication (username/email lookup)
CREATE POLICY "Users authentication read" ON "Users"
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users self read" ON "Users"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = "UserID");

-- Allow authenticated users to update their own data
CREATE POLICY "Users self update" ON "Users"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = "UserID");

-- Allow service role full access (for admin setup)
CREATE POLICY "Users service role access" ON "Users"
    FOR ALL
    TO service_role
    USING (true);

-- Role table policies - ALLOW ANONYMOUS ACCESS FOR ROLE LOOKUP
-- Allow anyone to read roles (needed for authentication)
CREATE POLICY "Role read access" ON "Role"
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow service role full access to Role table
CREATE POLICY "Role service role access" ON "Role"
    FOR ALL
    TO service_role
    USING (true);

-- 6. Ensure admin user exists
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

-- 7. Ensure basic roles exist
INSERT INTO "Role" ("RoleName")
VALUES
    ('admin'),
    ('nurse'),
    ('patient')
ON CONFLICT ("RoleName") DO NOTHING;

-- 8. Verify the setup
SELECT 'Admin user in Users table:' as check_type, COUNT(*) as count FROM "Users" WHERE "Username" = 'admin'
UNION ALL
SELECT 'Roles in Role table:' as check_type, COUNT(*) as count FROM "Role"
UNION ALL
SELECT 'Admin role exists:' as check_type, COUNT(*) as count FROM "Role" WHERE "RoleName" = 'admin';

-- 9. Test the policies work - these should work now
-- Test user lookup by email
SELECT "UserID", "Username", "Email" FROM "Users" WHERE "Email" = 'admin@baankm3clinic.ph';

-- Test role lookup
SELECT "RoleName" FROM "Role" WHERE "RoleName" = 'admin';

-- Test user with role join
SELECT u."Username", u."Email", r."RoleName"
FROM "Users" u
LEFT JOIN "Role" r ON u."RoleName" = r."RoleName"
WHERE u."Username" = 'admin';
