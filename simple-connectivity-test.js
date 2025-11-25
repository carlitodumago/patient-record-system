import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnectivity() {
  console.log("🔗 Testing basic Supabase connectivity...");

  try {
    // Test 1: Basic connection
    console.log("\n📋 Test 1: Basic connection test");
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Basic connection failed:", error.message);
      return;
    } else {
      console.log("✅ Basic connection successful");
    }

    // Test 2: Try to access a known table
    console.log("\n📋 Test 2: Table access test");
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("UserID, Username, Email")
      .limit(1);

    if (userError) {
      console.error("❌ Table access failed:", userError.message);
      console.error("   Code:", userError.code);
      console.error("   Details:", userError.details);
    } else {
      console.log("✅ Table access successful:", userData);
    }

    // Test 3: Check if tables exist by trying different tables
    console.log("\n📋 Test 3: Checking multiple tables");
    const tables = ["Users", "Patients", "Staff", "Appointment"];

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select("count", { count: "exact", head: true });

        if (error) {
          console.log(`❌ ${table} table: ${error.message}`);
        } else {
          console.log(`✅ ${table} table: accessible`);
        }
      } catch (error) {
        console.log(`❌ ${table} table: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Connectivity test failed:", error.message);
  }
}

testConnectivity();
