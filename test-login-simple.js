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

async function testLoginSimple() {
  console.log("🔐 Testing simple admin login...");

  try {
    // Test direct auth sign in with email
    console.log("\n📋 Testing direct auth sign in with email");
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: "admin@baankm3clinic.ph",
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

    // Test role lookup without join
    console.log("\n📋 Testing role lookup without join");
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("UserID, Username, Email, RoleName")
      .eq("Email", "admin@baankm3clinic.ph")
      .single();

    if (userError) {
      console.error("❌ User lookup failed:", userError.message);
      return;
    }

    console.log("✅ User lookup successful:", userData);

    // Test role table separately
    console.log("\n📋 Testing role table lookup");
    const { data: roleData, error: roleError } = await supabase
      .from("Role")
      .select("RoleName")
      .eq("RoleName", userData.RoleName)
      .single();

    if (roleError) {
      console.error("❌ Role lookup failed:", roleError.message);
      return;
    }

    console.log("✅ Role lookup successful:", roleData);

    console.log("\n🎉 SIMPLE LOGIN TEST PASSED!");
  } catch (error) {
    console.error("❌ Login test failed:", error.message);
  }
}

testLoginSimple();
