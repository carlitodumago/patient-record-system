-- ============================================================
-- Migration: add-clinic-settings.sql
-- Creates a singleton ClinicSettings table that stores:
--   max_patients_per_day  – maximum appointments the Brgy. Health Center accepts per day
--   unavailable_dates     – array of ISO date strings (YYYY-MM-DD) that are closed/blocked
-- ============================================================

CREATE TABLE IF NOT EXISTS "ClinicSettings" (
  "id"                   SERIAL PRIMARY KEY,
  "max_patients_per_day" INTEGER NOT NULL DEFAULT 50,
  "unavailable_dates"    TEXT[]  NOT NULL DEFAULT '{}',
  "updated_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_by"           UUID REFERENCES auth.users(id)
);

-- Seed exactly one row so upsert always works
INSERT INTO "ClinicSettings" ("max_patients_per_day", "unavailable_dates")
VALUES (50, '{}')
ON CONFLICT DO NOTHING;

-- Grant table-level access to authenticated role (required alongside RLS)
GRANT SELECT, UPDATE ON "ClinicSettings" TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE "ClinicSettings_id_seq" TO authenticated;

-- Row-Level Security
ALTER TABLE "ClinicSettings" ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe re-run)
DROP POLICY IF EXISTS "clinic_settings_read"  ON "ClinicSettings";
DROP POLICY IF EXISTS "clinic_settings_write" ON "ClinicSettings";

-- Anyone authenticated can read
CREATE POLICY "clinic_settings_read"
  ON "ClinicSettings"
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Anyone authenticated can update
-- (UI restricts the Settings button to Admin/Nurse only)
CREATE POLICY "clinic_settings_write"
  ON "ClinicSettings"
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);
