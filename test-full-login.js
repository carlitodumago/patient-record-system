import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullLogin() {
  try {
    console.log("🔐 Testing full login flow...");

    // Step 1: Test username lookup (this should work now)
    console.log("1️⃣ Testing username lookup...");
    const { data: userData, error: lookupError } = await supabase
      .from("Users")
      .select("Email")
      .eq("Username", "admin")
      .single();

    if (lookupError) {
      console.error("❌ Username lookup failed:", lookupError);
      return;
    }

    console.log("✅ Username lookup successful, found email:", userData.Email);

    // Step 2: Test Supabase Auth with the email
    console.log("2️⃣ Testing Supabase Auth...");
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: userData.Email,
        password: "adminbaan",
      });

    if (authError) {
      console.error("❌ Supabase Auth failed:", authError);
      return;
    }

    console.log("✅ Supabase Auth successful!");
    console.log("🆔 Auth User ID:", authData.user.id);

    // Step 3: Test role lookup using the Auth user ID
    console.log("3️⃣ Testing role lookup...");
    const { data: roleData, error: roleError } = await supabase
      .from("Users")
      .select("Role(RoleName)")
      .eq("UserID", authData.user.id)
      .single();

    if (roleError) {
      console.error("❌ Role lookup failed:", roleError);
      console.log(
        "💡 This is expected because UserID is integer but Auth ID is UUID"
      );
      console.log("🔧 Need to fix the schema mismatch");
    } else {
      console.log("✅ Role lookup successful:", roleData);
    }

    // Step 4: Test role lookup using the integer UserID from our record
    console.log("4️⃣ Testing role lookup with integer UserID...");
    const { data: roleDataInt, error: roleErrorInt } = await supabase
      .from("Users")
      .select("Role(RoleName)")
      .eq("UserID", 1) // Use the integer UserID from our record
      .single();

    if (roleErrorInt) {
      console.error("❌ Integer UserID role lookup failed:", roleErrorInt);
    } else {
      console.log("✅ Integer UserID role lookup successful:", roleDataInt);
    }
  } catch (error) {
    console.error("💥 Error:", error);
  }
}

testFullLogin();
