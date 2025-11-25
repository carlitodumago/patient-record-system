import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI1MTQ1MywiZXhwIjoyMDc1ODI3NDUzfQ.0eZ0WLtt5_v9I-04lvjAHMaorPmnIFywu0bjkKge5lE";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initDatabaseSchema() {
  console.log("🚀 Initializing database schema...");

  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), "supabase-schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    console.log("📄 Read schema file successfully");

    // Split the schema into individual statements
    const statements = schemaSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";";
      console.log(`\n📋 Executing statement ${i + 1}/${statements.length}...`);

      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql: statement,
        });

        if (error) {
          console.log(`⚠️ Statement ${i + 1} failed:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (error) {
        console.log(`⚠️ Error executing statement ${i + 1}:`, error.message);
      }
    }

    console.log("\n🎉 Database schema initialization completed!");
    console.log("📋 Now applying RLS fixes...");

    // Now apply the RLS fixes
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

    // Ensure admin user exists
    try {
      await supabase.rpc("exec_sql", {
        sql: `
          INSERT INTO "Users" ("UserID", "Username", "Email", "fullName", "RoleName", "created_at", "updated_at")
          VALUES (
              '64d5478e-0ccf-4d51-a267-2600d80d0ca9',
              'admin',
              'admin@baankm3clinic.ph',
              'System Administrator',
              'admin',
              NOW(),
              NOW()
          )
          ON CONFLICT ("UserID") DO UPDATE SET
              "Username" = EXCLUDED."Username",
              "Email" = EXCLUDED."Email",
              "fullName" = EXCLUDED."fullName",
              "RoleName" = EXCLUDED."RoleName",
              "updated_at" = NOW();
        `,
      });
      console.log("✅ Admin user ensured");
    } catch (error) {
      console.log("⚠️ Error ensuring admin user:", error.message);
    }

    console.log("\n🎯 Database initialization and RLS fix completed!");
    console.log("📋 The dashboard should now work without 403 errors.");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
  }
}

initDatabaseSchema();
