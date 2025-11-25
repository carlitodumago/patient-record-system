/**
 * Test Admin Login Script
 *
 * This script tests the admin login functionality by attempting to log in
 * with the admin credentials and verifying the session.
 *
 * Usage: node test-admin-login.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: "admin@baankm3clinic.ph",
  password: "adminbaan",
};

// Validate environment configuration
function validateEnvironment() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL environment variable is not set");
    process.exit(1);
  }

  if (!supabaseAnonKey) {
    console.error("❌ VITE_SUPABASE_ANON_KEY environment variable is not set");
    process.exit(1);
  }

  console.log("✅ Environment configuration validated");
  return { supabaseUrl, supabaseAnonKey };
}

// Create Supabase client
function createSupabaseClient(url, anonKey) {
  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: false, // Don't persist session for testing
    },
  });

  return supabase;
}

// Test admin login
async function testAdminLogin(supabase) {
  try {
    console.log("🔐 Attempting admin login...");
    console.log(`   Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(
      `   Password: ${ADMIN_CREDENTIALS.password.replace(/./g, "*")}`
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
    });

    if (error) {
      console.error("❌ Login failed:", error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      console.error("❌ Login succeeded but no user data returned");
      return { success: false, error: "No user data" };
    }

    console.log("✅ Login successful!");
    console.log("   User ID:", data.user.id);
    console.log("   Email:", data.user.email);
    console.log(
      "   Email Confirmed:",
      data.user.email_confirmed_at ? "Yes" : "No"
    );

    // Check if session was created
    if (data.session) {
      console.log("✅ Session created successfully");
      console.log(
        "   Access Token:",
        data.session.access_token ? "Present" : "Missing"
      );
      console.log(
        "   Refresh Token:",
        data.session.refresh_token ? "Present" : "Missing"
      );
      console.log(
        "   Expires At:",
        new Date(data.session.expires_at * 1000).toISOString()
      );
    } else {
      console.log("⚠️ No session data returned");
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error("❌ Unexpected error during login:", error.message);
    return { success: false, error: error.message };
  }
}

// Test user profile access (if login successful)
async function testProfileAccess(supabase, userId) {
  try {
    console.log("🔍 Testing user profile access...");

    // Try to get user profile from Users table
    const { data: profile, error } = await supabase
      .from("Users")
      .select("*")
      .eq("UserID", userId)
      .single();

    if (error) {
      if (error.message.includes("permission denied")) {
        console.log("⚠️ Profile access blocked by RLS policies");
        console.log(
          "   This is expected if RLS is enabled and user doesn't have access"
        );
        return { success: false, error: "RLS permission denied" };
      } else {
        console.error("❌ Error accessing profile:", error.message);
        return { success: false, error: error.message };
      }
    }

    if (profile) {
      console.log("✅ Profile found:");
      console.log(`   Username: ${profile.Username}`);
      console.log(`   Role: ${profile.RoleName}`);
      console.log(`   Full Name: ${profile.fullName}`);
      return { success: true, profile };
    } else {
      console.log("⚠️ No profile found in Users table");
      return { success: false, error: "Profile not found" };
    }
  } catch (error) {
    console.error("❌ Unexpected error accessing profile:", error.message);
    return { success: false, error: error.message };
  }
}

// Test logout
async function testLogout(supabase) {
  try {
    console.log("🚪 Testing logout...");

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("❌ Logout failed:", error.message);
      return false;
    }

    console.log("✅ Logout successful");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error during logout:", error.message);
    return false;
  }
}

// Main test function
async function main() {
  try {
    console.log("🚀 Starting admin login test...");
    console.log("=================================");

    // Validate environment
    const { supabaseUrl, supabaseAnonKey } = validateEnvironment();

    // Create Supabase client
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

    // Test login
    const loginResult = await testAdminLogin(supabase);

    if (!loginResult.success) {
      console.log("\n❌ Admin login test failed");
      console.log("   Error:", loginResult.error);
      process.exit(1);
    }

    // Test profile access
    const profileResult = await testProfileAccess(
      supabase,
      loginResult.user.id
    );

    // Test logout
    const logoutSuccess = await testLogout(supabase);

    // Summary
    console.log("\n📊 Test Summary:");
    console.log("================");
    console.log(`Login: ${loginResult.success ? "✅ PASS" : "❌ FAIL"}`);
    console.log(
      `Profile Access: ${
        profileResult.success ? "✅ PASS" : "⚠️ BLOCKED (RLS)"
      }`
    );
    console.log(`Logout: ${logoutSuccess ? "✅ PASS" : "❌ FAIL"}`);

    if (loginResult.success) {
      console.log("\n🎉 Admin login functionality is working!");
      console.log(
        "   The admin can successfully authenticate with the application."
      );
      console.log(
        "   Note: Profile access may be blocked by RLS policies, which is normal."
      );
    } else {
      console.log("\n❌ Admin login is not working properly.");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
main();
