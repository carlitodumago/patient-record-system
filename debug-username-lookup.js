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

async function debugUsernameLookup() {
  try {
    console.log("🔍 Debugging username lookup...");

    // Check what happens when we try to find the admin user
    console.log("1️⃣ Looking up username 'admin'...");
    const { data: usernameData, error: usernameError } = await supabase
      .from("Users")
      .select("Email")
      .eq("Username", "admin")
      .single();

    if (usernameError) {
      console.error("❌ Error looking up username:", usernameError);
    } else {
      console.log("✅ Found user:", usernameData);
    }

    // Check all users in the table
    console.log("\n2️⃣ Checking all users in Users table...");
    const { data: allUsers, error: allUsersError } = await supabase
      .from("Users")
      .select("*");

    if (allUsersError) {
      console.error("❌ Error fetching all users:", allUsersError);
    } else {
      console.log("📊 All users:", allUsers);
    }

    // Test the exact query pattern used in the auth store
    console.log("\n3️⃣ Testing auth store query pattern...");
    const { data: authPatternData, error: authPatternError } = await supabase
      .from("Users")
      .select("Email")
      .eq("Username", "admin")
      .single();

    if (authPatternError) {
      console.error("❌ Auth pattern error:", authPatternError);
      if (authPatternError.code === "PGRST116") {
        console.log("💡 PGRST116 error means no rows returned");
      }
    } else {
      console.log("✅ Auth pattern found:", authPatternData);
    }
  } catch (error) {
    console.error("💥 Error:", error);
  }
}

debugUsernameLookup();
