-- Fix RLS policies for Users table
-- Enable RLS on Users table if not already enabled
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on Users table
DROP POLICY IF EXISTS "Users read access" ON public."Users";
DROP POLICY IF EXISTS "Users insert access" ON public."Users";
DROP POLICY IF EXISTS "Users update access" ON public."Users";
DROP POLICY IF EXISTS "Users delete access" ON public."Users";
DROP POLICY IF EXISTS "Anyone can read users" ON public."Users";
DROP POLICY IF EXISTS "Users service role access" ON public."Users";
DROP POLICY IF EXISTS "Service role access to users" ON public."Users";

-- Create proper policies for Users table
-- Allow anyone to read users (needed for authentication)
CREATE POLICY "Users read access" ON public."Users"
    FOR SELECT USING (true);

-- Allow service role to do everything
CREATE POLICY "Users service role access" ON public."Users"
    FOR ALL USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- Allow authenticated users to update their own profile
CREATE POLICY "Users update own profile" ON public."Users"
    FOR UPDATE USING ((auth.uid() = "UserID"::uuid));

-- Allow authenticated users to insert their own profile (for registration)
CREATE POLICY "Users insert own profile" ON public."Users"
    FOR INSERT WITH CHECK ((auth.uid() = "UserID"::uuid));
