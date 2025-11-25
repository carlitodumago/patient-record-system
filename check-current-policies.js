import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use service role key to bypass RLS and check policies
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentPolicies() {
  console.log("🔍 Checking current RLS policies...");

  try {
    // Check policies on Users table
    console.log("\n📋 Users table policies:");
    const { data: usersPolicies, error: usersError } = await supabase.rpc(
      "sql",
      {
        query: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
          FROM pg_policies
          WHERE tablename = 'Users'
          ORDER BY policyname;
        `,
      }
    );

    if (usersError) {
      console.error("❌ Error checking Users policies:", usersError);
    } else {
      console.log("Users policies:", usersPolicies);
    }

    // Check policies on Role table
    console.log("\n📋 Role table policies:");
    const { data: rolePolicies, error: roleError } = await supabase.rpc("sql", {
      query: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
          FROM pg_policies
          WHERE tablename = 'Role'
          ORDER BY policyname;
        `,
    });

    if (roleError) {
      console.error("❌ Error checking Role policies:", roleError);
    } else {
      console.log("Role policies:", rolePolicies);
    }

    // Check if RLS is enabled
    console.log("\n📋 RLS status:");
    const { data: rlsStatus, error: rlsError } = await supabase.rpc("sql", {
      query: `
          SELECT schemaname, tablename, rowsecurity
          FROM pg_tables
          WHERE tablename IN ('Users', 'Role') AND schemaname = 'public';
        `,
    });

    if (rlsError) {
      console.error("❌ Error checking RLS status:", rlsError);
    } else {
      console.log("RLS status:", rlsStatus);
    }
  } catch (error) {
    console.error("❌ Check failed:", error.message);
  }
}

checkCurrentPolicies();
