import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

// Create Supabase client (same as in the app)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  try {
    console.log("Testing admin login...");

    // Try to login with admin credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@patientrecord.system",
      password: "admin123",
    });

    if (error) {
      console.error("❌ Login failed:", error.message);
      return;
    }

    if (data.user) {
      console.log("✅ Login successful!");
      console.log("User details:");
      console.log(`- ID: ${data.user.id}`);
      console.log(`- Email: ${data.user.email}`);
      console.log(
        `- Email Confirmed: ${data.user.email_confirmed_at ? "Yes" : "No"}`
      );
      console.log(`- User Metadata:`, data.user.user_metadata);
      console.log(`- Role: ${data.user.user_metadata?.role}`);
    } else {
      console.log("❌ No user data returned");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the test
testAdminLogin();
