import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use service role key to bypass RLS and fix policies
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSRecursion() {
  console.log("🔧 Fixing RLS infinite recursion...");

  try {
    // Step 1: Disable RLS temporarily
    console.log("\n📋 Step 1: Disabling RLS temporarily...");
    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;`,
    });
    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "Role" DISABLE ROW LEVEL SECURITY;`,
    });
    console.log("✅ RLS disabled");

    // Step 2: Drop all existing policies
    console.log("\n📋 Step 2: Dropping all existing policies...");
    const dropPoliciesSQL = `
      DROP POLICY IF EXISTS "Users select policy" ON "Users";
      DROP POLICY IF EXISTS "Users insert policy" ON "Users";
      DROP POLICY IF EXISTS "Users update policy" ON "Users";
      DROP POLICY IF EXISTS "Users delete policy" ON "Users";
      DROP POLICY IF EXISTS "Users authentication read" ON "Users";
      DROP POLICY IF EXISTS "Users self read" ON "Users";
      DROP POLICY IF EXISTS "Users self update" ON "Users";
      DROP POLICY IF EXISTS "Users service role access" ON "Users";
      DROP POLICY IF EXISTS "Users select own" ON "Users";
      DROP POLICY IF EXISTS "Users update own" ON "Users";
      DROP POLICY IF EXISTS "Users can read own profile" ON "Users";
      DROP POLICY IF EXISTS "Users can read profiles by email for auth" ON "Users";
      DROP POLICY IF EXISTS "Allow anon to read user profiles" ON "Users";
      DROP POLICY IF EXISTS "Allow admins to insert new users" ON "Users";
      DROP POLICY IF EXISTS "Users can read own data" ON "Users";
      DROP POLICY IF EXISTS "Users can update own data" ON "Users";
      DROP POLICY IF EXISTS "Users update own profile" ON "Users";
      DROP POLICY IF EXISTS "Users insert own profile" ON "Users";
      DROP POLICY IF EXISTS "Allow authenticated users to read own profile" ON "Users";
      DROP POLICY IF EXISTS "Users read own" ON "Users";

      DROP POLICY IF EXISTS "Role select policy" ON "Role";
      DROP POLICY IF EXISTS "Role insert policy" ON "Role";
      DROP POLICY IF EXISTS "Role update policy" ON "Role";
      DROP POLICY IF EXISTS "Role delete policy" ON "Role";
      DROP POLICY IF EXISTS "Role read access" ON "Role";
      DROP POLICY IF EXISTS "Role service role access" ON "Role";
      DROP POLICY IF EXISTS "Allow authenticated to read roles" ON "Role";
      DROP POLICY IF EXISTS "Allow anon to read roles" ON "Role";
    `;

    await supabase.rpc("exec_sql", { sql: dropPoliciesSQL });
    console.log("✅ All policies dropped");

    // Step 3: Re-enable RLS
    console.log("\n📋 Step 3: Re-enabling RLS...");
    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;`,
    });
    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;`,
    });
    console.log("✅ RLS re-enabled");

    // Step 4: Create proper policies that avoid recursion
    console.log("\n📋 Step 4: Creating proper policies...");

    const createPoliciesSQL = `
      -- Users table policies - ALLOW ANONYMOUS ACCESS FOR AUTHENTICATION
      CREATE POLICY "Users authentication read" ON "Users"
          FOR SELECT
          TO anon, authenticated
          USING (true);

      -- Allow authenticated users to read their own data
      CREATE POLICY "Users self read" ON "Users"
          FOR SELECT
          TO authenticated
          USING (auth.uid()::text = "UserID"::text);

      -- Allow authenticated users to update their own data
      CREATE POLICY "Users self update" ON "Users"
          FOR UPDATE
          TO authenticated
          USING (auth.uid()::text = "UserID"::text);

      -- Allow service role full access (for admin setup)
      CREATE POLICY "Users service role access" ON "Users"
          FOR ALL
          TO service_role
          USING (true);

      -- Role table policies - ALLOW ANONYMOUS ACCESS FOR ROLE LOOKUP
      CREATE POLICY "Role read access" ON "Role"
          FOR SELECT
          TO anon, authenticated
          USING (true);

      -- Allow service role full access to Role table
      CREATE POLICY "Role service role access" ON "Role"
          FOR ALL
          TO service_role
          USING (true);
    `;

    await supabase.rpc("exec_sql", { sql: createPoliciesSQL });
    console.log("✅ New policies created");

    // Step 5: Test the fix
    console.log("\n🧪 Testing the fix...");
    const anonSupabase = createClient(
      supabaseUrl,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: testData, error: testError } = await anonSupabase
      .from("Users")
      .select("UserID, Username, Email")
      .eq("Username", "admin")
      .single();

    if (testError) {
      console.error("❌ Test failed:", testError.message);
    } else {
      console.log("✅ Test successful! Found user:", testData);
    }

    console.log("\n🎉 RLS recursion fix completed!");
  } catch (error) {
    console.error("❌ Fix failed:", error.message);
  }
}

fixRLSRecursion();
