import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDI1MTQ1MywiZXhwIjoyMDc1ODI3NDUzfQ.0eZ0WLtt5_v9I-04lvjAHMaorPmnIFywu0bjkKge5lE";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTablesExist() {
  console.log("🔍 Checking if dashboard tables exist in database...");

  const tables = [
    "Patients",
    "Staff",
    "Appointment",
    "MedicalRecord",
    "Notification",
  ];

  for (const table of tables) {
    try {
      console.log(`\n📋 Checking table: ${table}`);

      // Try to get table info
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log(
          `❌ Table ${table} does not exist or is not accessible:`,
          error.message
        );
        console.log(`   Code: ${error.code}`);
      } else {
        console.log(`✅ Table ${table} exists and is accessible`);
        if (data && data.length > 0) {
          console.log(`   Sample record:`, JSON.stringify(data[0], null, 2));
        } else {
          console.log(`   Table is empty`);
        }
      }
    } catch (error) {
      console.log(`❌ Error checking table ${table}:`, error.message);
    }
  }

  console.log(
    "\n🎯 If tables don't exist, you need to run the database initialization scripts first."
  );
  console.log(
    "📋 Check if supabase-schema.sql or init-database.js has been run."
  );
}

checkTablesExist();
