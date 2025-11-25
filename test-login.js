import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log("🔐 Testing admin login...");

  try {
    // Test the exact login flow
    console.log("\n📋 Step 1: Testing username lookup");
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("Email, UserID")
      .eq("Username", "admin")
      .single();

    if (userError) {
      console.error("❌ Username lookup failed:", userError.message);
      return;
    }

    console.log("✅ Username lookup successful:", userData);

    // Test Supabase auth sign in
    console.log("\n📋 Step 2: Testing Supabase auth sign in");
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: userData.Email,
        password: "adminbaan",
      });

    if (authError) {
      console.error("❌ Auth sign in failed:", authError.message);
      console.error("   Code:", authError.status);
      return;
    }

    console.log("✅ Auth sign in successful:", {
      userId: authData.user?.id,
      email: authData.user?.email,
    });

    // Test role lookup
    console.log("\n📋 Step 3: Testing role lookup");
    const { data: roleData, error: roleError } = await supabase
      .from("Users")
      .select("*, Role(RoleName)")
      .eq("Email", userData.Email)
      .single();

    if (roleError) {
      console.error("❌ Role lookup failed:", roleError.message);
      return;
    }

    console.log("✅ Role lookup successful:", {
      role: roleData.Role?.RoleName,
      fullName: roleData.fullName,
    });

    console.log("\n🎉 LOGIN TEST PASSED - All steps successful!");
  } catch (error) {
    console.error("❌ Login test failed:", error.message);
  }
}

testLogin();
