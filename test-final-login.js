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

async function testFinalLogin() {
  try {
    console.log("🧪 Testing final login flow...");

    // Simulate the auth store login process
    const credentials = { email: "admin", password: "adminbaan" }; // username, not email

    let email = credentials.email;
    let foundUserId = null;

    // Check if input is email or username (simulate isEmail check)
    const isEmail = (input) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input);
    };

    if (!isEmail(email)) {
      // Input is username, look up the email and get UserID
      console.log("🔍 Looking up username:", email);
      const { data: userRecord, error: lookupError } = await supabase
        .from("Users")
        .select("Email, UserID")
        .eq("Username", email)
        .single();

      if (lookupError) {
        console.error("❌ Username lookup failed:", lookupError);
        return;
      }

      email = userRecord.Email;
      foundUserId = userRecord.UserID;
      console.log("✅ Found email:", email, "UserID:", foundUserId);
    }

    // Use Supabase authentication with the email
    console.log("🔐 Authenticating with Supabase...");
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: credentials.password,
    });

    if (authError) {
      console.error("❌ Supabase Auth failed:", authError);
      return;
    }

    console.log("✅ Supabase Auth successful!");
    console.log("🆔 Auth User ID:", data.user.id);

    // Get user role using the found UserID (integer)
    console.log("👤 Getting user role...");
    const { data: roleData, error: roleError } = await supabase
      .from("Users")
      .select("Role(RoleName)")
      .eq("UserID", foundUserId)
      .single();

    if (roleError) {
      console.error("❌ Role lookup failed:", roleError);
    } else {
      console.log("✅ Role lookup successful!");
      console.log("🏷️ User role:", roleData.Role.RoleName);
      console.log("🎉 Full login flow completed successfully!");
    }
  } catch (error) {
    console.error("💥 Error:", error);
  }
}

testFinalLogin();
