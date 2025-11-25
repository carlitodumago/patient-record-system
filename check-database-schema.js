import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Test with service role (should work)
const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

// Test with anon key (this is what's failing)
const anonSupabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseSchema() {
  console.log("🔍 Checking database schema and table existence...");

  try {
    // Step 1: Check if we can connect with service role
    console.log("\n📋 Step 1: Testing service role connection...");
    const { data: serviceTest, error: serviceError } = await serviceSupabase
      .from("Users")
      .select("count", { count: "exact", head: true });

    if (serviceError) {
      console.error("❌ Service role connection failed:", serviceError.message);
      return;
    } else {
      console.log("✅ Service role connection successful");
    }

    // Step 2: Check if tables exist with service role
    console.log("\n📋 Step 2: Checking table existence with service role...");

    const tables = [
      "Users",
      "Role",
      "Patients",
      "Staff",
      "Appointment",
      "MedicalRecord",
      "Notification",
    ];

    for (const table of tables) {
      try {
        const { count, error } = await serviceSupabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (error) {
          console.log(
            `❌ Table ${table} does not exist or is not accessible:`,
            error.message
          );
        } else {
          console.log(`✅ Table ${table} exists (${count} records)`);
        }
      } catch (error) {
        console.log(`❌ Error checking table ${table}:`, error.message);
      }
    }

    // Step 3: Test anon key connection
    console.log("\n📋 Step 3: Testing anon key connection...");
    const { data: anonTest, error: anonError } = await anonSupabase
      .from("Users")
      .select("count", { count: "exact", head: true });

    if (anonError) {
      console.error("❌ Anon key connection failed:", anonError.message);
      console.error("   Code:", anonError.code);
      console.error("   Details:", anonError.details);
    } else {
      console.log("✅ Anon key connection successful");
    }

    // Step 4: Check anon key access to each table
    console.log("\n📋 Step 4: Checking anon key access to tables...");

    for (const table of tables) {
      try {
        const { count, error } = await anonSupabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (error) {
          console.log(`❌ Anon key cannot access ${table}:`, error.message);
          console.log(`   Code: ${error.code}, Details: ${error.details}`);
        } else {
          console.log(`✅ Anon key can access ${table} (${count} records)`);
        }
      } catch (error) {
        console.log(`❌ Error with anon key on ${table}:`, error.message);
      }
    }

    // Step 5: Check environment variables
    console.log("\n📋 Step 5: Checking environment configuration...");
    console.log("VITE_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
    console.log(
      "VITE_SUPABASE_ANON_KEY:",
      supabaseAnonKey ? "✅ Set" : "❌ Missing"
    );
    console.log(
      "SUPABASE_SERVICE_ROLE_KEY:",
      supabaseServiceKey ? "✅ Set" : "❌ Missing"
    );

    // Check if keys look valid
    if (supabaseAnonKey && supabaseAnonKey.length < 100) {
      console.log(
        "⚠️ VITE_SUPABASE_ANON_KEY appears to be too short (might be invalid)"
      );
    }
    if (supabaseServiceKey && supabaseServiceKey.length < 100) {
      console.log(
        "⚠️ SUPABASE_SERVICE_ROLE_KEY appears to be too short (might be invalid)"
      );
    }

    // Step 6: Try a simple query that should always work
    console.log("\n📋 Step 6: Testing basic connectivity...");
    try {
      const { data, error } = await anonSupabase.auth.getSession();
      if (error) {
        console.log("❌ Auth session check failed:", error.message);
      } else {
        console.log("✅ Auth session check successful");
      }
    } catch (error) {
      console.log("❌ Auth session check error:", error.message);
    }
  } catch (error) {
    console.error("❌ Database schema check failed:", error.message);
  }
}

checkDatabaseSchema();
