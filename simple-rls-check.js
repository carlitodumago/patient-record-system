import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use anon key to test actual access
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simpleRLSCheck() {
  console.log("🔍 Simple RLS check - testing actual access...");

  try {
    // Test 1: Basic Users table access
    console.log("\n📋 Test 1: Basic Users table access");
    const { data: usersData, error: usersError } = await supabase
      .from("Users")
      .select("UserID, Username, Email")
      .limit(1);

    if (usersError) {
      console.error("❌ Users access failed:", usersError.message);
      console.error("   Code:", usersError.code);
    } else {
      console.log(
        "✅ Users access successful:",
        usersData?.length || 0,
        "records"
      );
    }

    // Test 2: Username lookup (the failing query)
    console.log("\n📋 Test 2: Username lookup (admin)");
    const { data: adminData, error: adminError } = await supabase
      .from("Users")
      .select("Email, UserID")
      .eq("Username", "admin")
      .single();

    if (adminError) {
      console.error("❌ Username lookup failed:", adminError.message);
      console.error("   Code:", adminError.code);
    } else {
      console.log("✅ Username lookup successful:", adminData);
    }

    // Test 3: Role table access
    console.log("\n📋 Test 3: Role table access");
    const { data: rolesData, error: rolesError } = await supabase
      .from("Role")
      .select("RoleName");

    if (rolesError) {
      console.error("❌ Role access failed:", rolesError.message);
      console.error("   Code:", rolesError.code);
    } else {
      console.log("✅ Role access successful:", rolesData);
    }
  } catch (error) {
    console.error("❌ Check failed:", error.message);
  }
}

simpleRLSCheck();
