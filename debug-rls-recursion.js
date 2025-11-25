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

async function debugRLSRecursion() {
  console.log("🔍 Debugging RLS infinite recursion...");

  try {
    // First, let's check what policies exist
    console.log("\n📋 Checking all policies...");

    // Use a direct query approach
    const { data: allPolicies, error: policiesError } = await supabase
      .from("pg_policies")
      .select("*")
      .or("tablename.eq.Users,tablename.eq.Role");

    if (policiesError) {
      console.error("❌ Error fetching policies:", policiesError);
    } else {
      console.log("Current policies:");
      allPolicies.forEach((policy) => {
        console.log(
          `- ${policy.tablename}: ${policy.policyname} (${policy.cmd})`
        );
        console.log(`  Roles: ${policy.roles}`);
        console.log(`  Qual: ${policy.qual}`);
        console.log(`  Permissive: ${policy.permissive}`);
        console.log("");
      });
    }

    // Check RLS status
    const { data: rlsStatus, error: rlsError } = await supabase
      .from("pg_tables")
      .select("tablename, rowsecurity")
      .in("tablename", ["Users", "Role"])
      .eq("schemaname", "public");

    if (rlsError) {
      console.error("❌ Error checking RLS status:", rlsError);
    } else {
      console.log("RLS status:");
      rlsStatus.forEach((table) => {
        console.log(
          `- ${table.tablename}: RLS ${
            table.rowsecurity ? "ENABLED" : "DISABLED"
          }`
        );
      });
    }

    // Now let's try to identify the recursion
    console.log("\n🔍 Analyzing potential recursion sources...");

    // Check for policies that reference the Users table in their USING clause
    const usersPolicies = allPolicies.filter((p) => p.tablename === "Users");

    for (const policy of usersPolicies) {
      if (policy.qual && policy.qual.includes("Users")) {
        console.log(
          `⚠️  Policy "${policy.policyname}" references Users table in qual: ${policy.qual}`
        );
      }
      if (policy.qual && policy.qual.includes("auth.uid()")) {
        console.log(
          `⚠️  Policy "${policy.policyname}" uses auth.uid() in qual: ${policy.qual}`
        );
      }
    }

    // Test with anon key to see the recursion
    console.log("\n🧪 Testing with anon key (should trigger recursion)...");
    const anonSupabase = createClient(
      supabaseUrl,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    try {
      const { data: testData, error: testError } = await anonSupabase
        .from("Users")
        .select("UserID")
        .limit(1);

      if (testError) {
        console.log("✅ Expected error with anon key:", testError.message);
      } else {
        console.log("❌ Unexpected success with anon key");
      }
    } catch (err) {
      console.log("✅ Expected error with anon key:", err.message);
    }
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

debugRLSRecursion();
