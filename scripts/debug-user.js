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

async function debugUserSession() {
  try {
    console.log("Checking current user session...");

    // Get current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return;
    }

    if (session?.user) {
      console.log("✅ User is authenticated");
      console.log("User ID:", session.user.id);
      console.log("User Email:", session.user.email);
      console.log(
        "User Metadata:",
        JSON.stringify(session.user.user_metadata, null, 2)
      );
      console.log("User Role:", session.user.user_metadata?.role);
      console.log("User Full Name:", session.user.user_metadata?.full_name);
      console.log("User Username:", session.user.user_metadata?.username);
    } else {
      console.log("❌ No authenticated user found");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the debug script
debugUserSession();
