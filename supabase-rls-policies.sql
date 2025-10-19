-- Row Level Security (RLS) Policies for Patient Record System
-- Run this script in your Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Diagnosis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Treatment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Role table policies (readable by all authenticated users)
CREATE POLICY "Role is viewable by everyone" ON "Role"
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users table policies
CREATE POLICY "Users can view their own profile" ON "Users"
    FOR SELECT USING (auth.uid()::text = "UserID");

CREATE POLICY "Admins can view all users" ON "Users"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            JOIN "Role" r ON u."RoleID" = r."RoleID"
            WHERE u."UserID" = auth.uid()::text AND r."RoleName" = 'admin'
        )
    );

CREATE POLICY "Users can update their own profile" ON "Users"
    FOR UPDATE USING (auth.uid()::text = "UserID");

CREATE POLICY "Admins can manage all users" ON "Users"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            JOIN "Role" r ON u."RoleID" = r."RoleID"
            WHERE u."UserID" = auth.uid()::text AND r."RoleName" = 'admin'
        )
    );

-- Staff table policies
CREATE POLICY "Staff can view staff profiles" ON "Staff"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = "Staff"."UserID"
            AND (u."UserID" = auth.uid()::text OR u."RoleID" IN (1, 2)) -- admin or nurse
        )
    );

CREATE POLICY "Admins can manage staff" ON "Staff"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            JOIN "Role" r ON u."RoleID" = r."RoleID"
            WHERE u."UserID" = auth.uid()::text AND r."RoleName" = 'admin'
        )
    );

-- Patients table policies
CREATE POLICY "Patients can view their own records" ON "Patients"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = "Patients"."UserID" AND u."UserID" = auth.uid()::text
        )
    );

CREATE POLICY "Staff can view all patient records" ON "Patients"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

CREATE POLICY "Staff can manage patient records" ON "Patients"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

-- Appointment table policies
CREATE POLICY "Users can view their own appointments" ON "Appointment"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Patients" p
            WHERE p."PatientID" = "Appointment"."PatientID"
            AND p."UserID" = auth.uid()::text
        ) OR EXISTS (
            SELECT 1 FROM "Staff" s
            WHERE s."StaffID" = "Appointment"."ScheduledBy"
            AND s."UserID" = auth.uid()::text
        ) OR EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" = 1 -- admin
        )
    );

CREATE POLICY "Staff can manage appointments" ON "Appointment"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

-- MedicalRecord table policies
CREATE POLICY "Patients can view their own medical records" ON "MedicalRecord"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Appointment" a
            JOIN "Patients" p ON a."PatientID" = p."PatientID"
            WHERE a."AppointmentID" = "MedicalRecord"."AppointmentID"
            AND p."UserID" = auth.uid()::text
        )
    );

CREATE POLICY "Staff can view all medical records" ON "MedicalRecord"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

CREATE POLICY "Staff can manage medical records" ON "MedicalRecord"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

-- Notification table policies
CREATE POLICY "Users can view their own notifications" ON "Notification"
    FOR SELECT USING ("UserID" = auth.uid()::text);

CREATE POLICY "Staff can view all notifications" ON "Notification"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

CREATE POLICY "Staff can manage notifications" ON "Notification"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

-- Diagnosis, Treatment, and Notes tables (readable by authenticated staff)
CREATE POLICY "Diagnosis is viewable by staff" ON "Diagnosis"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

CREATE POLICY "Staff can manage diagnosis" ON "Diagnosis"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

CREATE POLICY "Treatment is viewable by staff" ON "Treatment"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

CREATE POLICY "Staff can manage treatment" ON "Treatment"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

CREATE POLICY "Notes is viewable by staff" ON "Notes"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

CREATE POLICY "Staff can manage notes" ON "Notes"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Users" u
            WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
        )
    );

-- Create a function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT r."RoleName"
        FROM "Users" u
        JOIN "Role" r ON u."RoleID" = r."RoleID"
        WHERE u."UserID" = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "Users" u
        JOIN "Role" r ON u."RoleID" = r."RoleID"
        WHERE u."UserID" = auth.uid()::text AND r."RoleName" = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is staff (admin or nurse)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "Users" u
        WHERE u."UserID" = auth.uid()::text AND u."RoleID" IN (1, 2) -- admin or nurse
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is patient
CREATE OR REPLACE FUNCTION is_patient()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "Users" u
        WHERE u."UserID" = auth.uid()::text AND u."RoleID" = 3 -- patient
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;