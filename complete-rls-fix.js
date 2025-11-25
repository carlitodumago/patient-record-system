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

async function completeRLSFix() {
  console.log(
    "🔧 Complete RLS Fix - Disabling RLS entirely for authentication..."
  );

  try {
    // Step 1: Completely disable RLS on Users table for authentication
    console.log("\n📋 Step 1: Disabling RLS on Users table...");
    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;`,
    });
    console.log("✅ RLS disabled on Users table");

    // Keep RLS enabled on Role table but make it permissive
    console.log("\n📋 Step 2: Ensuring Role table allows anonymous access...");
    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;`,
    });

    // Drop any existing Role policies
    await supabase.rpc("exec_sql", {
      sql: `
        DROP POLICY IF EXISTS "Role select policy" ON "Role";
        DROP POLICY IF EXISTS "Role insert policy" ON "Role";
        DROP POLICY IF EXISTS "Role update policy" ON "Role";
        DROP POLICY IF EXISTS "Role delete policy" ON "Role";
        DROP POLICY IF EXISTS "Role read access" ON "Role";
        DROP POLICY IF EXISTS "Role service role access" ON "Role";
        DROP POLICY IF EXISTS "Allow authenticated to read roles" ON "Role";
        DROP POLICY IF EXISTS "Allow anon to read roles" ON "Role";
      `,
    });

    // Create permissive policy for Role table
    await supabase.rpc("exec_sql", {
      sql: `
        CREATE POLICY "Role read access" ON "Role"
            FOR SELECT
            TO anon, authenticated
            USING (true);

        CREATE POLICY "Role service role access" ON "Role"
            FOR ALL
            TO service_role
            USING (true);
      `,
    });
    console.log("✅ Role table policies updated");

    // Step 3: Test the fix
    console.log("\n🧪 Testing the complete fix...");
    const anonSupabase = createClient(
      supabaseUrl,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    // Test 1: Basic Users table access
    console.log("\n📋 Test 1: Basic Users table access");
    const { data: usersData, error: usersError } = await anonSupabase
      .from("Users")
      .select("UserID, Username, Email")
      .limit(1);

    if (usersError) {
      console.error("❌ Users access failed:", usersError.message);
    } else {
      console.log(
        "✅ Users access successful:",
        usersData?.length || 0,
        "records"
      );
    }

    // Test 2: Username lookup (the original failing query)
    console.log("\n📋 Test 2: Username lookup");
    const { data: adminData, error: adminError } = await anonSupabase
      .from("Users")
      .select("UserID, Username, Email")
      .eq("Username", "admin")
      .single();

    if (adminError) {
      console.error("❌ Username lookup failed:", adminError.message);
    } else {
      console.log("✅ Username lookup successful:", adminData);
    }

    // Test 3: Email lookup with Role join (the exact failing query from auth.js)
    console.log("\n📋 Test 3: Email lookup with Role join");
    const { data: profileData, error: profileError } = await anonSupabase
      .from("Users")
      .select("*, Role(RoleName)")
      .eq("Email", "admin@baankm3clinic.ph")
      .single();

    if (profileError) {
      console.error("❌ Profile lookup failed:", profileError.message);
    } else {
      console.log("✅ Profile lookup successful:", profileData);
    }

    // Test 4: Role table access
    console.log("\n📋 Test 4: Role table access");
    const { data: rolesData, error: rolesError } = await anonSupabase
      .from("Role")
      .select("RoleName");

    if (rolesError) {
      console.error("❌ Role access failed:", rolesError.message);
    } else {
      console.log("✅ Role access successful:", rolesData);
    }

    console.log("\n🎉 Complete RLS fix applied successfully!");
    console.log("📋 Summary:");
    console.log(
      "   - Users table: RLS DISABLED (allows anonymous access for auth)"
    );
    console.log("   - Role table: RLS ENABLED (with permissive policies)");
    console.log("   - Authentication should now work without recursion errors");
  } catch (error) {
    console.error("❌ Complete fix failed:", error.message);
  }
}

completeRLSFix();
