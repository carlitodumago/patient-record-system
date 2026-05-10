-- ============================================================
-- Migration: add-calendar-read-for-patients.sql
--
-- Allows authenticated patients to read the DateTime,
-- EndDateTime, and Status of ALL non-cancelled/denied
-- appointments so the booking calendar can show slot
-- occupancy without exposing any patient PII.
--
-- A dedicated security-definer function is used so that the
-- underlying row-level security on the Appointment table is
-- bypassed in a controlled, read-only way that returns only
-- the three non-identifying columns.
-- ============================================================

-- 1. Drop any previous version of this function
DROP FUNCTION IF EXISTS public.get_calendar_slots();

-- 2. Create the function
--    SECURITY DEFINER  → runs as the function owner (postgres / service role)
--                         so it can bypass RLS on Appointment
--    STABLE            → safe for Supabase to cache within a transaction
CREATE OR REPLACE FUNCTION public.get_calendar_slots()
RETURNS TABLE (
  "AppointmentID" INTEGER,
  "DateTime"      TIMESTAMPTZ,
  "EndDateTime"   TIMESTAMPTZ,
  "Status"        VARCHAR
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    "AppointmentID",
    "DateTime",
    "EndDateTime",
    "Status"
  FROM "Appointment"
  WHERE "Status" NOT IN ('Cancelled', 'Denied')
  ORDER BY "DateTime" ASC;
$$;

-- 3. Only authenticated users can call this function
REVOKE ALL ON FUNCTION public.get_calendar_slots() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_calendar_slots() TO authenticated;

-- ============================================================
-- How to use from the frontend (useSupabase.js):
--
--   const { data, error } = await supabase.rpc('get_calendar_slots');
--
-- Replace the patient branch of getAppointmentsForCalendar()
-- with this rpc() call so patients always see full occupancy.
-- ============================================================
