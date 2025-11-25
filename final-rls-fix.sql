-- FINAL RLS FIX: Complete disable RLS on Users table for authentication
-- Execute this in Supabase SQL Editor

-- 1. Disable RLS on Users table completely (for authentication)
ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;

-- 2. Ensure Role table has permissive policies
ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing Role policies
DROP POLICY IF EXISTS "Role select policy" ON "Role";
DROP POLICY IF EXISTS "Role insert policy" ON "Role";
DROP POLICY IF EXISTS "Role update policy" ON "Role";
DROP POLICY IF EXISTS "Role delete policy" ON "Role";
DROP POLICY IF EXISTS "Role read access" ON "Role";
DROP POLICY IF EXISTS "Role service role access" ON "Role";
DROP POLICY IF EXISTS "Allow authenticated to read roles" ON "Role";
DROP POLICY IF EXISTS "Allow anon to read roles" ON "Role";

-- 4. Create permissive policies for Role table
CREATE POLICY "Role read access" ON "Role"
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Role service role access" ON "Role"
    FOR ALL
    TO service_role
    USING (true);

-- 5. Verify the admin user exists
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

-- 6. Test queries (should work now)
-- Test basic user lookup
SELECT "UserID", "Username", "Email" FROM "Users" WHERE "Username" = 'admin';

-- Test email lookup with role join (the failing query)
SELECT u."UserID", u."Username", u."Email", r."RoleName"
FROM "Users" u
LEFT JOIN "Role" r ON u."RoleName" = r."RoleName"
WHERE u."Email" = 'admin@baankm3clinic.ph';

-- Test role access
SELECT "RoleName" FROM "Role";