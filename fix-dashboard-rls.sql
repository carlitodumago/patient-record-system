-- Fix Dashboard RLS: Disable RLS on tables needed for dashboard statistics
-- Execute this in Supabase SQL Editor

-- Disable RLS on tables that dashboard queries for statistics
ALTER TABLE "Patients" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalRecord" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" DISABLE ROW LEVEL SECURITY;

-- Optional: Re-enable RLS with permissive policies for authenticated users (more secure)
-- Uncomment below if you want to keep RLS enabled but allow access

/*
-- Re-enable RLS with permissive policies
ALTER TABLE "Patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for authenticated users (adjust as needed for security)
CREATE POLICY "Allow authenticated read access" ON "Patients" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON "Staff" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON "Appointment" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON "MedicalRecord" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON "Notification" FOR SELECT TO authenticated USING (true);

-- Service role can do everything
CREATE POLICY "Service role access" ON "Patients" FOR ALL TO service_role USING (true);
CREATE POLICY "Service role access" ON "Staff" FOR ALL TO service_role USING (true);
CREATE POLICY "Service role access" ON "Appointment" FOR ALL TO service_role USING (true);
CREATE POLICY "Service role access" ON "MedicalRecord" FOR ALL TO service_role USING (true);
CREATE POLICY "Service role access" ON "Notification" FOR ALL TO service_role USING (true);
*/
