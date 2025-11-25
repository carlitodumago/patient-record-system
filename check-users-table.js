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

async function checkUsersTable() {
  try {
    console.log("🔍 Checking Users table...");

    // Check if Users table exists and get its structure
    const { data: users, error: usersError } = await supabase
      .from("Users")
      .select("*")
      .limit(5);

    if (usersError) {
      console.error("❌ Error fetching users:", usersError);
      return;
    }

    console.log("✅ Users table exists");
    console.log("📊 Current users:", users);
    console.log("🔢 Number of users:", users.length);

    // Check for admin user specifically
    const { data: adminUsers, error: adminError } = await supabase
      .from("Users")
      .select("*")
      .eq("Username", "admin");

    if (adminError) {
      console.error("❌ Error checking for admin user:", adminError);
    } else {
      console.log("👤 Admin users found:", adminUsers);
    }
  } catch (error) {
    console.error("💥 Error:", error);
  }
}

checkUsersTable();
