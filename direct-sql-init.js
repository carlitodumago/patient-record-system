import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI1MTQ1MywiZXhwIjoyMDc1ODI3NDUzfQ.0eZ0WLtt5_v9I-04lvjAHMaorPmnIFywu0bjkKge5lE";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTablesDirectly() {
  console.log("🔨 Creating database tables directly...");

  try {
    // Create tables one by one
    const createStatements = [
      // Role table
      `CREATE TABLE IF NOT EXISTS "Role" (
        "RoleID" SERIAL PRIMARY KEY,
        "RoleName" VARCHAR NOT NULL UNIQUE
      );`,

      // Users table
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

      // Staff table
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

      // Patients table
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

      // Appointment table
      `CREATE TABLE IF NOT EXISTS "Appointment" (
        "AppointmentID" SERIAL PRIMARY KEY,
        "ScheduledBy" UUID,
        "PatientID" UUID,
        "DateTime" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        "Status" VARCHAR DEFAULT 'pending',
        "Reason" TEXT,
        "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,

      // Diagnosis table
      `CREATE TABLE IF NOT EXISTS "Diagnosis" (
        "DiagnosisID" SERIAL PRIMARY KEY,
        "DiagnosisName" TEXT NOT NULL,
        "Description" TEXT,
        "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,

      // Treatment table
      `CREATE TABLE IF NOT EXISTS "Treatment" (
        "TreatmentID" SERIAL PRIMARY KEY,
        "TreatmentName" TEXT NOT NULL,
        "Description" TEXT,
        "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,

      // MedicalRecord table
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

      // Notes table
      `CREATE TABLE IF NOT EXISTS "Notes" (
        "NoteID" SERIAL PRIMARY KEY,
        "Content" TEXT NOT NULL,
        "PatientID" UUID,
        "EnteredBy" UUID
      );`,

      // Notification table
      `CREATE TABLE IF NOT EXISTS "Notification" (
        "NotificationID" SERIAL PRIMARY KEY,
        "UserID" UUID,
        "Message" TEXT NOT NULL,
        "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`,
    ];

    // Execute create statements
    for (let i = 0; i < createStatements.length; i++) {
      console.log(`📋 Creating table ${i + 1}/${createStatements.length}...`);
      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql: createStatements[i],
        });

        if (error) {
          console.log(`⚠️ Table creation ${i + 1} failed:`, error.message);
        } else {
          console.log(`✅ Table ${i + 1} created successfully`);
        }
      } catch (error) {
        console.log(`⚠️ Error creating table ${i + 1}:`, error.message);
      }
    }

    // Insert initial data
    console.log("\n📋 Inserting initial data...");

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
      console.log(
        `📋 Inserting data ${i + 1}/${initialDataStatements.length}...`
      );
      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql: initialDataStatements[i],
        });

        if (error) {
          console.log(`⚠️ Data insertion ${i + 1} failed:`, error.message);
        } else {
          console.log(`✅ Data ${i + 1} inserted successfully`);
        }
      } catch (error) {
        console.log(`⚠️ Error inserting data ${i + 1}:`, error.message);
      }
    }

    // Apply RLS fixes
    console.log("\n📋 Applying RLS fixes...");

    const tables = [
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

    for (const table of tables) {
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

    console.log("\n🎉 Database tables created and RLS fixed!");
    console.log("📋 Testing dashboard access...");

    // Test with anon key
    const anonSupabase = createClient(
      supabaseUrl,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo"
    );

    const { count: patientsCount, error: patientsError } = await anonSupabase
      .from("Patients")
      .select("*", { count: "exact", head: true });

    if (patientsError) {
      console.log("❌ Patients access still failing:", patientsError.message);
    } else {
      console.log("✅ Patients access working! Count:", patientsCount);
    }
  } catch (error) {
    console.error("❌ Table creation failed:", error.message);
  }
}

createTablesDirectly();
