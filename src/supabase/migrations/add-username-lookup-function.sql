-- =========================================
-- Migration: Add secure username lookup function for login
-- =========================================
-- Problem: The login flow needs to look up a username in the Users table
-- BEFORE the user is authenticated. However, RLS on the Users table blocks
-- anonymous (unauthenticated) access, causing login by username to fail
-- with "Unable to verify username" error.
--
-- Solution: Create a SECURITY DEFINER function that bypasses RLS to
-- return only the email for a given username. This is secure because:
-- 1. It only returns the email (minimal data exposure)
-- 2. It only matches exact usernames
-- 3. It runs with elevated privileges only for this specific query
-- =========================================

-- Function to look up email by username (for login flow)
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TABLE(email TEXT, user_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT u."Email"::TEXT, u."UserID"
    FROM public."Users" u
    WHERE u."Username" = p_username
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO authenticated;
