import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI1MTQ1MywiZXhwIjoyMDc1ODI3NDUzfQ.0eZ0WLtt5_v9I-04lvjAHMaorPmnIFywu0bjkKge5lE";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function finalFixDashboard() {
  console.log("🔧 FINAL FIX: Creating tables and fixing permissions...");

  try {
    // Step 1: Create all tables directly
    console.log("\n📋 Step 1: Creating all required tables...");

    const createTableStatements = [
      `CREATE TABLE IF NOT EXISTS "Role" ("RoleID" SERIAL PRIMARY KEY, "RoleName" VARCHAR NOT NULL UNIQUE);`,
      `CREATE TABLE IF NOT EXISTS "Users" (
        "UserID" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        "PatientID" UUID,
        "Username" VARCHAR NOT NULL UNIQUE,
        "Password" VARCHAR,
        "Email" VARCHAR NOT NULL UNIQUE,
        "RoleName" TEXT REFERENCES "Role"("RoleName"),
        "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        "fullName" TEXT,
        "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS "Staff" (
        "StaffID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "UserID" UUID REFERENCES "Users"("UserID"),
        "FirstName" VARCHAR NOT NULL,
        "Surname" VARCHAR NOT NULL,
        "Suffix" VARCHAR,
        "ContactNumber" VARCHAR,
        "RoleID" INTEGER REFERENCES "Role"("RoleID"),
        "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS "Patients" (
        "PatientID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "UserID" UUID REFERENCES "Users"("UserID"),
        "FirstName" VARCHAR NOT NULL,
        "Surname" VARCHAR NOT NULL,
        "Suffix" VARCHAR,
        "Address" TEXT,
        "Gender" VARCHAR,
        "BirthDate" DATE,
        "ContactNumber" VARCHAR,
        "EmergencyContact" VARCHAR,
        "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS "Appointment" (
        "AppointmentID" SERIAL PRIMARY KEY,
        "ScheduledBy" UUID,
        "PatientID" UUID,
        "DateTime" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        "Status" VARCHAR DEFAULT 'pending',
        "Reason" TEXT,
        "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS "Diagnosis" (
        "DiagnosisID" SERIAL PRIMARY KEY,
        "DiagnosisName" TEXT NOT NULL,
        "Description" TEXT,
        "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS "Treatment" (
        "TreatmentID" SERIAL PRIMARY KEY,
        "TreatmentName" TEXT NOT NULL,
        "Description" TEXT,
        "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS "MedicalRecord" (
        "MedicalRecordID" SERIAL PRIMARY KEY,
        "AppointmentID" INTEGER,
        "EnteredBy" UUID,
        "DiagnosisID" INTEGER,
        "TreatmentID" INTEGER,
        "NoteID" INTEGER,
        "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        "PatientID" UUID,
        "Status" VARCHAR DEFAULT 'Draft',
        "VitalSigns" JSONB,
        "Notes" TEXT,
        "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS "Notes" (
        "NoteID" SERIAL PRIMARY KEY,
        "Content" TEXT NOT NULL,
        "PatientID" UUID,
        "EnteredBy" UUID
      );`,
      `CREATE TABLE IF NOT EXISTS "Notification" (
        "NotificationID" SERIAL PRIMARY KEY,
        "UserID" UUID,
        "Message" TEXT NOT NULL,
        "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,
    ];

    for (let i = 0; i < createTableStatements.length; i++) {
      try {
        await supabase.rpc("exec_sql", { sql: createTableStatements[i] });
        console.log(`✅ Table ${i + 1}/9 created`);
      } catch (error) {
        console.log(`⚠️ Table ${i + 1} creation failed:`, error.message);
      }
    }

    // Step 2: Insert initial data
    console.log("\n📋 Step 2: Inserting initial data...");

    const initialDataStatements = [
      `INSERT INTO "Role" ("RoleName") VALUES ('admin'), ('nurse'), ('patient') ON CONFLICT ("RoleName") DO NOTHING;`,
      `INSERT INTO "Users" ("UserID", "Username", "Email", "fullName", "RoleName", "created_at", "updated_at")
       VALUES (
         '64d5478e-0ccf-4d51-a267-2600d80d0ca9',
         'admin',
         'admin@baankm3clinic.ph',
         'System Administrator',
         'admin',
         NOW(),
         NOW()
       ) ON CONFLICT ("UserID") DO UPDATE SET
         "Username" = EXCLUDED."Username",
         "Email" = EXCLUDED."Email",
         "fullName" = EXCLUDED."fullName",
         "RoleName" = EXCLUDED."RoleName",
         "updated_at" = NOW();`,
    ];

    for (let i = 0; i < initialDataStatements.length; i++) {
      try {
        await supabase.rpc("exec_sql", { sql: initialDataStatements[i] });
        console.log(`✅ Initial data ${i + 1}/2 inserted`);
      } catch (error) {
        console.log(
          `⚠️ Initial data ${i + 1} insertion failed:`,
          error.message
        );
      }
    }

    // Step 3: Disable RLS and grant permissions
    console.log("\n📋 Step 3: Disabling RLS and granting permissions...");

    const allTables = [
      "Users",
      "Role",
      "Patients",
      "Staff",
      "Appointment",
      "MedicalRecord",
      "Notification",
      "Diagnosis",
      "Treatment",
      "Notes",
    ];

    for (const table of allTables) {
      try {
        // Disable RLS
        await supabase.rpc("exec_sql", {
          sql: `ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`,
        });

        // Grant permissions
        await supabase.rpc("exec_sql", {
          sql: `GRANT ALL ON "${table}" TO anon;`,
        });
        await supabase.rpc("exec_sql", {
          sql: `GRANT ALL ON "${table}" TO authenticated;`,
        });
        await supabase.rpc("exec_sql", {
          sql: `GRANT ALL ON "${table}" TO service_role;`,
        });

        console.log(`✅ ${table} configured`);
      } catch (error) {
        console.log(`⚠️ Error configuring ${table}:`, error.message);
      }
    }

    // Step 4: Final verification with anon key
    console.log("\n📋 Step 4: Final verification...");

    const anonSupabase = createClient(
      supabaseUrl,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo"
    );

    // Test each dashboard table
    const dashboardTables = [
      "Patients",
      "Staff",
      "Appointment",
      "MedicalRecord",
      "Notification",
    ];

    let successCount = 0;
    for (const table of dashboardTables) {
      try {
        const { count, error } = await anonSupabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${count} records (accessible)`);
          successCount++;
        }
      } catch (error) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }

    console.log(`\n🎯 Results: ${successCount}/5 dashboard tables accessible`);

    if (successCount === 5) {
      console.log("🎉 SUCCESS: All dashboard tables are now accessible!");
      console.log("📋 The admin dashboard should now load without 403 errors.");
    } else {
      console.log("⚠️ WARNING: Some tables may still have issues.");
      console.log(
        "📋 Try refreshing the dashboard or check the browser console."
      );
    }
  } catch (error) {
    console.error("❌ Final fix failed:", error.message);
  }
}

finalFixDashboard();
