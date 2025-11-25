/**
 * Database State Check Script
 *
 * This script checks the current state of the Supabase database
 * and reports what tables exist and their structure.
 *
 * Usage: node check-database-state.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate environment configuration
function validateEnvironment() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL environment variable is not set");
    process.exit(1);
  }

  if (!supabaseAnonKey) {
    console.error("❌ VITE_SUPABASE_ANON_KEY environment variable is not set");
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error(
      "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    );
    process.exit(1);
  }

  console.log("✅ Environment configuration validated");
  return { supabaseUrl, supabaseAnonKey, supabaseServiceKey };
}

// Create Supabase client
function createSupabaseClient(url, serviceKey) {
  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase;
}

// Check if tables exist
async function checkTablesExist(supabase) {
  const expectedTables = [
    "Role",
    "Users",
    "Staff",
    "Patients",
    "Appointment",
    "Diagnosis",
    "Treatment",
    "MedicalRecord",
    "Notes",
    "Notification",
  ];

  console.log("🔍 Checking existing tables...");

  const existingTables = [];
  const missingTables = [];

  for (const tableName of expectedTables) {
    try {
      // Try to select from the table
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(1);

      if (error && error.code === "PGRST116") {
        // Table doesn't exist
        missingTables.push(tableName);
      } else if (error && error.message.includes("permission denied")) {
        // Table exists but no permissions
        existingTables.push(`${tableName} (permission denied)`);
      } else {
        // Table exists
        existingTables.push(tableName);
      }
    } catch (err) {
      missingTables.push(tableName);
    }
  }

  console.log("\n📊 Database State Report:");
  console.log("==========================");

  if (existingTables.length > 0) {
    console.log("✅ Existing tables:");
    existingTables.forEach((table) => console.log(`   - ${table}`));
  }

  if (missingTables.length > 0) {
    console.log("❌ Missing tables:");
    missingTables.forEach((table) => console.log(`   - ${table}`));
  }

  return { existingTables, missingTables };
}

// Check table structure
async function checkTableStructure(supabase, tableName) {
  try {
    console.log(`\n🔍 Checking structure of table: ${tableName}`);

    // Get column information using a query
    const { data, error } = await supabase.from(tableName).select("*").limit(0); // Just get structure, no data

    if (error) {
      console.log(`❌ Cannot access table ${tableName}: ${error.message}`);
      return null;
    }

    // Try to get a sample row to see columns
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select("*")
      .limit(1);

    if (sampleError && sampleError.code !== "PGRST116") {
      console.log(
        `⚠️ Cannot get sample data from ${tableName}: ${sampleError.message}`
      );
    } else if (sampleData && sampleData.length > 0) {
      console.log(`📋 Sample row from ${tableName}:`);
      console.log(`   ${JSON.stringify(sampleData[0], null, 2)}`);
    } else {
      console.log(`📋 Table ${tableName} is empty`);
    }

    return true;
  } catch (err) {
    console.log(`❌ Error checking table ${tableName}: ${err.message}`);
    return null;
  }
}

// Check RLS policies
async function checkRLSPolicies(supabase) {
  console.log("\n🔒 Checking RLS policies...");

  try {
    // This is a simplified check - in a real scenario you'd query pg_policies
    const { data, error } = await supabase.from("Role").select("*").limit(1);

    if (error) {
      console.log("❌ Cannot access Role table - RLS may be blocking access");
      return false;
    } else {
      console.log("✅ Can access Role table - basic permissions working");
      return true;
    }
  } catch (err) {
    console.log(`❌ Error checking RLS: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log("🚀 Starting database state check...");

    // Validate environment
    const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } =
      validateEnvironment();

    // Create Supabase client
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    // Test connection
    console.log("🔗 Testing Supabase connection...");
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error("❌ Supabase connection test failed:", error.message);
      process.exit(1);
    }
    console.log("✅ Supabase connection successful");

    // Check tables
    const { existingTables, missingTables } = await checkTablesExist(supabase);

    // Check structure of existing tables
    for (const table of existingTables) {
      const tableName = table.split(" ")[0]; // Remove any suffix like (permission denied)
      await checkTableStructure(supabase, tableName);
    }

    // Check RLS
    await checkRLSPolicies(supabase);

    console.log("\n🎯 Recommendations:");
    console.log("==================");

    if (missingTables.length > 0) {
      console.log(
        "1. Missing tables need to be created. Run the schema SQL again, but exclude CREATE TABLE statements for existing tables."
      );
    }

    if (existingTables.some((t) => t.includes("permission denied"))) {
      console.log(
        "2. Some tables exist but have permission issues. Check RLS policies."
      );
    }

    if (existingTables.length > 0 && missingTables.length === 0) {
      console.log(
        "3. All tables exist. Try running the admin user creation script now."
      );
    }

    console.log("\n✅ Database state check complete!");
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
