import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use service role key to check RLS status
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSStatus() {
  console.log("🔍 Checking RLS status on tables...");

  try {
    // Check RLS status on Users table
    console.log("\n📋 Users table RLS status:");
    const { data: usersRLS, error: usersError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `SELECT schemaname, tablename, rowsecurity
            FROM pg_tables
            WHERE schemaname = 'public' AND tablename = 'Users';`,
      }
    );

    if (usersError) {
      console.error("❌ Error checking Users RLS:", usersError.message);
    } else {
      console.log("✅ Users table RLS status:", usersRLS);
    }

    // Check RLS status on Role table
    console.log("\n📋 Role table RLS status:");
    const { data: roleRLS, error: roleError } = await supabase.rpc("exec_sql", {
      sql: `SELECT schemaname, tablename, rowsecurity
            FROM pg_tables
            WHERE schemaname = 'public' AND tablename = 'Role';`,
    });

    if (roleError) {
      console.error("❌ Error checking Role RLS:", roleError.message);
    } else {
      console.log("✅ Role table RLS status:", roleRLS);
    }

    // Check current policies
    console.log("\n📋 Current policies:");
    const { data: policies, error: policiesError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
            FROM pg_policies
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname;`,
      }
    );

    if (policiesError) {
      console.error("❌ Error checking policies:", policiesError.message);
    } else {
      console.log("✅ Current policies:", policies);
    }
  } catch (error) {
    console.error("❌ Check failed:", error.message);
  }
}

checkRLSStatus();
