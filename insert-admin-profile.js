/**
 * Insert Admin Profile Script
 *
 * This script manually inserts the admin user profile into the Users table
 * using the service role key to bypass RLS policies.
 *
 * Usage: node insert-admin-profile.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Admin profile data
const ADMIN_PROFILE = {
  UserID: "64d5478e-0ccf-4d51-a267-2600d80d0ca9", // From auth.users
  Username: "admin",
  Email: "admin@baankm3clinic.ph",
  RoleName: "Staff",
  fullName: "System Administrator",
};

// Validate environment configuration
function validateEnvironment() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL environment variable is not set");
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error(
      "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    );
    process.exit(1);
  }

  console.log("✅ Environment configuration validated");
  return { supabaseUrl, supabaseServiceKey };
}

// Create Supabase client with service role
function createSupabaseClient(url, serviceKey) {
  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase;
}

// Insert admin profile
async function insertAdminProfile(supabase) {
  try {
    console.log("🔍 Checking if admin profile already exists...");

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("Users")
      .select("*")
      .eq("UserID", ADMIN_PROFILE.UserID)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ Error checking existing profile:", checkError.message);
      return false;
    }

    if (existingProfile) {
      console.log("✅ Admin profile already exists:");
      console.log(`   Username: ${existingProfile.Username}`);
      console.log(`   Email: ${existingProfile.Email}`);
      console.log(`   Role: ${existingProfile.RoleName}`);
      console.log(`   Full Name: ${existingProfile.fullName}`);
      return true;
    }

    console.log("📝 Inserting admin profile...");

    // Insert the admin profile
    const { data: newProfile, error: insertError } = await supabase
      .from("Users")
      .insert({
        ...ADMIN_PROFILE,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Error inserting admin profile:", insertError.message);
      console.error(
        "   This might be due to RLS policies or table constraints"
      );
      return false;
    }

    console.log("✅ Admin profile inserted successfully:");
    console.log(`   UserID: ${newProfile.UserID}`);
    console.log(`   Username: ${newProfile.Username}`);
    console.log(`   Email: ${newProfile.Email}`);
    console.log(`   Role: ${newProfile.RoleName}`);
    console.log(`   Full Name: ${newProfile.fullName}`);

    return true;
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return false;
  }
}

// Verify the insertion
async function verifyInsertion(supabase) {
  try {
    console.log("🔍 Verifying admin profile insertion...");

    const { data: profile, error } = await supabase
      .from("Users")
      .select("*")
      .eq("UserID", ADMIN_PROFILE.UserID)
      .single();

    if (error) {
      console.error("❌ Error verifying profile:", error.message);
      return false;
    }

    if (profile) {
      console.log("✅ Profile verification successful:");
      console.log(`   Found user: ${profile.Username} (${profile.Email})`);
      console.log(`   Role: ${profile.RoleName}`);
      return true;
    } else {
      console.log("❌ Profile not found after insertion");
      return false;
    }
  } catch (error) {
    console.error("❌ Unexpected error during verification:", error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log("🚀 Starting admin profile insertion...");
    console.log("=====================================");

    // Validate environment
    const { supabaseUrl, supabaseServiceKey } = validateEnvironment();

    // Create Supabase client
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    // Test connection
    console.log("🔗 Testing Supabase connection...");
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error("❌ Supabase connection test failed:", error.message);
      process.exit(1);
    }
    console.log("✅ Supabase connection successful");

    // Insert admin profile
    const insertSuccess = await insertAdminProfile(supabase);
    if (!insertSuccess) {
      console.log("❌ Admin profile insertion failed");
      process.exit(1);
    }

    // Verify insertion
    const verifySuccess = await verifyInsertion(supabase);
    if (!verifySuccess) {
      console.log("❌ Profile verification failed");
      process.exit(1);
    }

    console.log("");
    console.log("🎉 Admin profile setup complete!");
    console.log("================================");
    console.log("✅ Admin user exists in auth.users");
    console.log("✅ Admin profile exists in Users table");
    console.log("✅ Username verification should now work");
    console.log("");
    console.log("📋 Admin credentials:");
    console.log(`   Email: ${ADMIN_PROFILE.Email}`);
    console.log(`   Username: ${ADMIN_PROFILE.Username}`);
    console.log(`   Password: adminbaan`);
    console.log(`   Role: ${ADMIN_PROFILE.RoleName}`);
    console.log("");
    console.log("🚀 You can now log in to the application!");
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
