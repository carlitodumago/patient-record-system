import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSPolicies() {
  console.log("🧪 Testing RLS Policies...");

  try {
    // Test 1: Check if we can select from Users table (should work with our policies)
    console.log("\n📋 Test 1: Basic SELECT from Users table");
    const { data: users, error: usersError } = await supabase
      .from("Users")
      .select("Username, Email")
      .limit(1);

    if (usersError) {
      console.error("❌ SELECT failed:", usersError.message);
      console.error("❌ Error details:", usersError);
    } else {
      console.log("✅ SELECT successful:", users ? users.length : 0, "records");
    }

    // Test 1.1: Test without Role join to isolate the issue
    console.log("\n📋 Test 1.1: SELECT from Users table without Role join");
    const { data: usersNoJoin, error: usersNoJoinError } = await supabase
      .from("Users")
      .select("Username, Email, UserID")
      .limit(1);

    if (usersNoJoinError) {
      console.error("❌ SELECT without join failed:", usersNoJoinError.message);
      console.error("❌ Error details:", usersNoJoinError);
    } else {
      console.log(
        "✅ SELECT without join successful:",
        usersNoJoin ? usersNoJoin.length : 0,
        "records"
      );
    }

    // Test 2: Check if we can select by username (the failing query)
    console.log("\n📋 Test 2: Username lookup query");
    const { data: adminUser, error: adminError } = await supabase
      .from("Users")
      .select("Email, UserID")
      .eq("Username", "admin")
      .single();

    if (adminError) {
      console.error("❌ Username lookup failed:", adminError.message);
    } else {
      console.log("✅ Username lookup successful:", adminUser);
    }

    // Test 3: Check Role table access
    console.log("\n📋 Test 3: Role table access");
    const { data: roles, error: rolesError } = await supabase
      .from("Role")
      .select("RoleName");

    if (rolesError) {
      console.error("❌ Role access failed:", rolesError.message);
    } else {
      console.log("✅ Role access successful:", roles);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testRLSPolicies();
