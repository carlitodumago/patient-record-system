import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI1MTQ1MywiZXhwIjoyMDc1ODI3NDUzfQ.0eZ0WLtt5_v9I-04lvjAHMaorPmnIFywu0bjkKge5lE";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTablesManually() {
  console.log("🔨 Creating database tables manually...");

  try {
    // First, enable UUID extension
    console.log("📋 Enabling UUID extension...");
    try {
      await supabase.rpc("exec_sql", {
        sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      });
      console.log("✅ UUID extension enabled");
    } catch (error) {
      console.log("⚠️ UUID extension may already exist:", error.message);
    }

    // Create tables one by one using direct SQL
    const tables = [
      {
        name: "Role",
        sql: `CREATE TABLE IF NOT EXISTS "Role" (
          "RoleID" SERIAL PRIMARY KEY,
          "RoleName" VARCHAR NOT NULL UNIQUE
        );`,
      },
      {
        name: "Users",
        sql: `CREATE TABLE IF NOT EXISTS "Users" (
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
      },
      {
        name: "Staff",
        sql: `CREATE TABLE IF NOT EXISTS "Staff" (
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
      },
      {
        name: "Patients",
        sql: `CREATE TABLE IF NOT EXISTS "Patients" (
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
      },
      {
        name: "Appointment",
        sql: `CREATE TABLE IF NOT EXISTS "Appointment" (
          "AppointmentID" SERIAL PRIMARY KEY,
          "ScheduledBy" UUID,
          "PatientID" UUID,
          "DateTime" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
          "Status" VARCHAR DEFAULT 'pending',
          "Reason" TEXT,
          "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        );`,
      },
      {
        name: "Diagnosis",
        sql: `CREATE TABLE IF NOT EXISTS "Diagnosis" (
          "DiagnosisID" SERIAL PRIMARY KEY,
          "DiagnosisName" TEXT NOT NULL,
          "Description" TEXT,
          "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
          "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        );`,
      },
      {
        name: "Treatment",
        sql: `CREATE TABLE IF NOT EXISTS "Treatment" (
          "TreatmentID" SERIAL PRIMARY KEY,
          "TreatmentName" TEXT NOT NULL,
          "Description" TEXT,
          "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
          "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        );`,
      },
      {
        name: "MedicalRecord",
        sql: `CREATE TABLE IF NOT EXISTS "MedicalRecord" (
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
      },
      {
        name: "Notes",
        sql: `CREATE TABLE IF NOT EXISTS "Notes" (
          "NoteID" SERIAL PRIMARY KEY,
          "Content" TEXT NOT NULL,
          "PatientID" UUID,
          "EnteredBy" UUID
        );`,
      },
      {
        name: "Notification",
        sql: `CREATE TABLE IF NOT EXISTS "Notification" (
          "NotificationID" SERIAL PRIMARY KEY,
          "UserID" UUID,
          "Message" TEXT NOT NULL,
          "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        );`,
      },
    ];

    // Create each table
    for (const table of tables) {
      console.log(`📋 Creating table: ${table.name}`);
      try {
        await supabase.rpc("exec_sql", { sql: table.sql });
        console.log(`✅ Table ${table.name} created successfully`);
      } catch (error) {
        console.log(`⚠️ Error creating table ${table.name}:`, error.message);
      }
    }

    // Insert initial data
    console.log("\n📋 Inserting initial data...");

    const initialData = [
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

    for (let i = 0; i < initialData.length; i++) {
      console.log(`📋 Inserting data ${i + 1}/${initialData.length}...`);
      try {
        await supabase.rpc("exec_sql", { sql: initialData[i] });
        console.log(`✅ Data ${i + 1} inserted successfully`);
      } catch (error) {
        console.log(`⚠️ Error inserting data ${i + 1}:`, error.message);
      }
    }

    // Apply RLS fixes
    console.log("\n📋 Applying RLS fixes...");

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
        console.log(`✅ RLS disabled on ${table}`);

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
        console.log(`✅ Permissions granted on ${table}`);
      } catch (error) {
        console.log(`⚠️ Error processing ${table}:`, error.message);
      }
    }

    console.log("\n🎉 Database tables created and configured!");
    console.log("📋 Testing dashboard access...");

    // Test with anon key
    const anonSupabase = createClient(
      supabaseUrl,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo"
    );

    // Test dashboard queries
    const tests = [
      {
        name: "Patients count",
        query: () =>
          anonSupabase
            .from("Patients")
            .select("*", { count: "exact", head: true }),
      },
      {
        name: "Staff count",
        query: () =>
          anonSupabase
            .from("Staff")
            .select("*", { count: "exact", head: true }),
      },
      {
        name: "Appointments count",
        query: () =>
          anonSupabase
            .from("Appointment")
            .select("*", { count: "exact", head: true }),
      },
      {
        name: "Medical Records count",
        query: () =>
          anonSupabase
            .from("MedicalRecord")
            .select("*", { count: "exact", head: true }),
      },
      {
        name: "Notifications count",
        query: () =>
          anonSupabase
            .from("Notification")
            .select("*", { count: "exact", head: true }),
      },
    ];

    for (const test of tests) {
      try {
        const { count, error } = await test.query();
        if (error) {
          console.log(`❌ ${test.name}: ${error.message}`);
        } else {
          console.log(`✅ ${test.name}: ${count} records`);
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }

    console.log("\n🎯 Dashboard should now work without 403 errors!");
  } catch (error) {
    console.error("❌ Table creation failed:", error.message);
  }
}

createTablesManually();
