/**
 * Script to run the RLS permissions fix
 * This script executes the SQL commands from fix-role-permissions.sql
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runPermissionsFix() {
  try {
    console.log("🔧 Running RLS permissions fix...");

    // Read the SQL file
    const sqlContent = fs.readFileSync("fix-role-permissions.sql", "utf8");

    // Split into statements and execute each one
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 60)}...`);

        try {
          const { error } = await supabase.rpc("exec_sql", {
            sql: statement + ";",
          });

          if (error) {
            console.error(`❌ Error: ${error.message}`);
            // Continue with other statements
          } else {
            console.log("✅ Success");
          }
        } catch (err) {
          console.error(`❌ Exception: ${err.message}`);
          // Continue with other statements
        }
      }
    }

    console.log("🎉 Permissions fix completed!");
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

runPermissionsFix();
