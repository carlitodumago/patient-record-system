-- Check current RLS policies on Users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'Users'
ORDER BY policyname;

-- Check if RLS is enabled on Users table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'Users' AND schemaname = 'public';

-- Check current policies on Role table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'Role'
ORDER BY policyname;
