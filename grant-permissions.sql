-- Grant necessary permissions to anon role for authentication
-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select permission on Users table for authentication
GRANT SELECT ON public."Users" TO anon;

-- Grant select permission on Role table for role checking
GRANT SELECT ON public."Role" TO anon;
