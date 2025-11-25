/**
 * Verify Admin User Script
 *
 * This script verifies that the admin user exists in both Supabase Auth and the Users table,
 * and checks if the admin can successfully log in.
 *
 * Usage: node verify-admin-user.js
 *
 * Environment Variables Required:
 * - SUPABASE_URL or VITE_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - VITE_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Admin user configuration (same as in create-admin-user.js)
const ADMIN_CONFIG = {
  email: "admin@baankm3clinic.ph",
  password: "adminbaan",
  username: "admin",
  fullName: "System Administrator",
  role: "Staff",
};

// Validate environment configuration
function validateEnvironment() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL environment variable is not set");
    console.error(
      "   Please set VITE_SUPABASE_URL or SUPABASE_URL in your .env file"
    );
    process.exit(1);
  }

  if (!supabaseAnonKey) {
    console.error("❌ VITE_SUPABASE_ANON_KEY environment variable is not set");
    console.error("   Please set VITE_SUPABASE_ANON_KEY in your .env file");
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error(
      "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    );
    console.error("   Please set SUPABASE_SERVICE_ROLE_KEY in your .env file");
    console.error(
      "   You can find this key in your Supabase project dashboard under Settings > API"
    );
    process.exit(1);
  }

  if (!supabaseUrl.includes("supabase.co")) {
    console.warn("⚠️ Supabase URL doesn't appear to be a valid Supabase URL");
  }

  console.log("✅ Environment configuration validated");
  return { supabaseUrl, supabaseAnonKey, supabaseServiceKey };
}

// Create Supabase clients
function createSupabaseClients(url, anonKey, serviceKey) {
  const supabaseAuth = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { supabaseAuth, supabase };
}

// Test Supabase connection
async function testConnection(supabase) {
  try {
    console.log("🔗 Testing Supabase connection...");

    // Try to list users from auth (requires service role)
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Supabase connection test failed:", error.message);
      console.error("💡 Possible causes:");
      console.error("   - Invalid service role key");
      console.error("   - Network connectivity issues");
      console.error("   - Supabase project not accessible");
      return false;
    }

    console.log("✅ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error during connection test:", error.message);
    return false;
  }
}

// Verify admin user in auth.users
async function verifyAdminInAuth(supabase) {
  try {
    console.log("🔍 Checking admin user in auth.users...");

    const { data: authUsers, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error fetching auth users:", error.message);
      return null;
    }

    const adminUser = authUsers.users.find(
      (user) => user.email === ADMIN_CONFIG.email
    );

    if (!adminUser) {
      console.error("❌ Admin user not found in auth.users");
      console.log(
        "💡 Run 'node create-admin-user.js' to create the admin user"
      );
      return null;
    }

    console.log("✅ Admin user found in auth.users:");
    console.log("   - User ID:", adminUser.id);
    console.log("   - Email:", adminUser.email);
    console.log(
      "   - Email Confirmed:",
      adminUser.email_confirmed_at ? "Yes" : "No"
    );
    console.log("   - Created At:", adminUser.created_at);
    console.log("   - Last Sign In:", adminUser.last_sign_in_at || "Never");

    return adminUser;
  } catch (error) {
    console.error("❌ Error verifying admin in auth:", error.message);
    return null;
  }
}

// Verify admin profile in Users table
async function verifyAdminProfile(supabase) {
  try {
    console.log("🔍 Checking admin profile in Users table...");

    const { data: profile, error } = await supabase
      .from("Users")
      .select("*, Role(RoleName)")
      .eq("Email", ADMIN_CONFIG.email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.error("❌ Admin profile not found in Users table");
        console.log(
          "💡 The admin user exists in auth but needs a profile in the Users table"
        );
        console.log("💡 Run 'node create-admin-user.js' to create the profile");
        return null;
      } else {
        console.error("❌ Error fetching admin profile:", error.message);
        console.error("💡 This might be due to:");
        console.error("   - Insufficient permissions for the service role key");
        console.error("   - Tables not created yet in the database");
        console.error("   - Row Level Security (RLS) policies blocking access");
        return null;
      }
    }

    console.log("✅ Admin profile found in Users table:");
    console.log("   - User ID:", profile.UserID);
    console.log("   - Username:", profile.Username);
    console.log("   - Full Name:", profile.fullName);
    console.log("   - Role:", profile.Role?.RoleName || "No role assigned");
    console.log("   - Created At:", profile.created_at);
    console.log("   - Updated At:", profile.updated_at);

    return profile;
  } catch (error) {
    console.error(
      "❌ Unexpected error verifying admin profile:",
      error.message
    );
    return null;
  }
}

// Test admin login
async function testAdminLogin(supabaseAuth) {
  try {
    console.log("🔐 Testing admin login...");

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: ADMIN_CONFIG.email,
      password: ADMIN_CONFIG.password,
    });

    if (error) {
      console.error("❌ Admin login failed:", error.message);
      console.log("💡 Possible causes:");
      console.log("   - Incorrect password");
      console.log("   - Email not confirmed");
      console.log("   - Account disabled");
      return null;
    }

    if (!data.user) {
      console.error("❌ Login succeeded but no user data returned");
      return null;
    }

    console.log("✅ Admin login successful:");
    console.log("   - User ID:", data.user.id);
    console.log("   - Email:", data.user.email);
    console.log("   - Session ID:", data.session?.id || "No session");

    return data;
  } catch (error) {
    console.error("❌ Unexpected error during login test:", error.message);
    return null;
  }
}

// Main verification function
async function main() {
  try {
    console.log("🚀 Starting admin user verification script...");
    console.log("📋 Admin credentials to verify:");
    console.log("   Email:", ADMIN_CONFIG.email);
    console.log("   Password:", ADMIN_CONFIG.password);
    console.log("");

    // Validate environment
    const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } =
      validateEnvironment();

    // Create Supabase clients
    const { supabaseAuth, supabase } = createSupabaseClients(
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceKey
    );

    // Test connection
    const isConnected = await testConnection(supabase);
    if (!isConnected) {
      console.error("❌ Cannot proceed without a valid Supabase connection");
      process.exit(1);
    }

    // Verify admin in auth.users
    const adminUser = await verifyAdminInAuth(supabase);
    if (!adminUser) {
      console.log("");
      console.log("❌ Admin verification failed - user not found in auth");
      process.exit(1);
    }

    // Verify admin profile in Users table
    const adminProfile = await verifyAdminProfile(supabase);
    if (!adminProfile) {
      console.log("");
      console.log(
        "❌ Admin verification failed - profile not found in Users table"
      );
      process.exit(1);
    }

    // Test admin login
    const loginResult = await testAdminLogin(supabaseAuth);
    if (!loginResult) {
      console.log("");
      console.log("❌ Admin verification failed - login test failed");
      process.exit(1);
    }

    console.log("");
    console.log("🎉 Admin user verification complete!");
    console.log("✅ Admin user exists in auth.users");
    console.log("✅ Admin profile exists in Users table");
    console.log("✅ Admin login works correctly");
    console.log("");
    console.log("📋 Admin credentials:");
    console.log("   Email:", ADMIN_CONFIG.email);
    console.log("   Password:", ADMIN_CONFIG.password);
    console.log("   Username:", ADMIN_CONFIG.username);
    console.log("   Role:", ADMIN_CONFIG.role);
    console.log("");
    console.log(
      "🚀 You can now log in to the application with these credentials!"
    );
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
