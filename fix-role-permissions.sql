-- Fix RLS policies for authentication and role detection
-- This script addresses the "permission denied for schema public" error during login

-- Check current RLS status on key tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('Users', 'Role');

-- Enable RLS on Users table if not already enabled
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own profile
-- This allows the client-side auth store to query user roles during login
CREATE POLICY "Users can read own profile" ON public."Users"
FOR SELECT TO authenticated
USING (auth.uid()::text = "UserID"::text);

-- Create policy for authenticated users to read user profiles by email
-- This is needed for role detection during authentication
CREATE POLICY "Users can read profiles by email for auth" ON public."Users"
FOR SELECT TO authenticated
USING (true);

-- Alternative: Allow anon to read user profiles (less secure but may be needed)
-- CREATE POLICY "Allow anon to read user profiles" ON public."Users"
-- FOR SELECT TO anon
-- USING (true);

-- Ensure Role table has proper policies
ALTER TABLE public."Role" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read roles
CREATE POLICY "Allow authenticated to read roles" ON public."Role"
FOR SELECT TO authenticated
USING (true);

-- Allow anon to read roles (for role lookup during auth)
CREATE POLICY "Allow anon to read roles" ON public."Role"
FOR SELECT TO anon
USING (true);

-- Grant necessary permissions
GRANT SELECT ON public."Users" TO authenticated;
GRANT SELECT ON public."Role" TO authenticated;
GRANT SELECT ON public."Role" TO anon;

-- Check if there are any conflicting policies and drop them if needed
-- DROP POLICY IF EXISTS "Users can read own profile" ON public."Users";
-- DROP POLICY IF EXISTS "Users can read profiles by email for auth" ON public."Users";
-- DROP POLICY IF EXISTS "Allow authenticated to read roles" ON public."Role";
-- DROP POLICY IF EXISTS "Allow anon to read roles" ON public."Role";
