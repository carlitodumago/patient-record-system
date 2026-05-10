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

-- Row-Level Security
ALTER TABLE "ClinicSettings" ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read
CREATE POLICY "clinic_settings_read"
  ON "ClinicSettings"
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins and nurses can update
-- (Relies on the Users.RoleName field via a helper function or metadata)
CREATE POLICY "clinic_settings_write"
  ON "ClinicSettings"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Users"
      WHERE "Users"."UserID" = auth.uid()
        AND "Users"."RoleName" IN ('admin', 'nurse')
    )
  );
