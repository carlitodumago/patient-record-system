/**
 * Script to apply RLS policies fix for authentication
 * This directly executes the necessary SQL commands
 */

import { createClient } from "@supabase/supabase-js";
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

async function applyRLSFix() {
  try {
    console.log("🔧 Applying RLS policies fix...");

    // Drop existing policies that might be blocking access
    console.log("Dropping existing policies...");
    const dropPolicies = [
      `DROP POLICY IF EXISTS "Users select policy" ON "Users"`,
      `DROP POLICY IF EXISTS "Users insert policy" ON "Users"`,
      `DROP POLICY IF EXISTS "Users update policy" ON "Users"`,
      `DROP POLICY IF EXISTS "Users delete policy" ON "Users"`,
      `DROP POLICY IF EXISTS "Role select policy" ON "Role"`,
      `DROP POLICY IF EXISTS "Role insert policy" ON "Role"`,
      `DROP POLICY IF EXISTS "Role update policy" ON "Role"`,
      `DROP POLICY IF EXISTS "Role delete policy" ON "Role"`,
      `DROP POLICY IF EXISTS "Users authentication read" ON "Users"`,
      `DROP POLICY IF EXISTS "Users self read" ON "Users"`,
      `DROP POLICY IF EXISTS "Users self update" ON "Users"`,
      `DROP POLICY IF EXISTS "Users service role access" ON "Users"`,
      `DROP POLICY IF EXISTS "Role read access" ON "Role"`,
      `DROP POLICY IF EXISTS "Role service role access" ON "Role"`,
    ];

    for (const sql of dropPolicies) {
      try {
        await supabase.rpc("exec_sql", { sql });
        console.log(`✅ Dropped policy`);
      } catch (error) {
        console.log(
          `⚠️ Could not drop policy (may not exist): ${error.message}`
        );
      }
    }

    // Create new permissive policies
    console.log("Creating new policies...");

    const createPolicies = [
      // Users table policies - allow all reads for authentication
      `CREATE POLICY "Users authentication read" ON "Users" FOR SELECT USING (true)`,
      `CREATE POLICY "Users service role access" ON "Users" FOR ALL USING (auth.jwt() ->> 'role' = 'service_role')`,

      // Role table policies - allow all reads
      `CREATE POLICY "Role read access" ON "Role" FOR SELECT USING (true)`,
      `CREATE POLICY "Role service role access" ON "Role" FOR ALL USING (auth.jwt() ->> 'role' = 'service_role')`,
    ];

    for (const sql of createPolicies) {
      try {
        await supabase.rpc("exec_sql", { sql });
        console.log(`✅ Created policy`);
      } catch (error) {
        console.error(`❌ Failed to create policy: ${error.message}`);
      }
    }

    // Test the fix
    console.log("Testing the fix...");
    const { data, error } = await supabase
      .from("Users")
      .select("Role(RoleName)")
      .eq("Email", "admin@baankm3clinic.ph")
      .single();

    if (error) {
      console.error("❌ Test failed:", error.message);
    } else {
      console.log("✅ Test successful! Admin role:", data?.Role?.RoleName);
    }

    console.log("🎉 RLS fix completed!");
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

applyRLSFix();
