-- Temporarily disable RLS on Users table to test if that's the issue
ALTER TABLE public."Users" DISABLE ROW LEVEL SECURITY;

-- Test the query without RLS
-- This should work if the issue is with RLS policies
