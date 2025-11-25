/**
 * Debug Admin Login Script
 *
 * This script attempts to log in as admin and debug the issue step by step.
 * It will help identify where the login process is failing.
 *
 * Usage: node debug-admin-login.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: "admin@baankm3clinic.ph",
  password: "adminbaan",
  username: "admin",
};

// Validate environment configuration
function validateEnvironment() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL environment variable is not set");
    process.exit(1);
  }

  if (!supabaseAnonKey) {
    console.error("❌ SUPABASE_ANON_KEY environment variable is not set");
    process.exit(1);
  }

  console.log("✅ Environment configuration validated");
  return { supabaseUrl, supabaseAnonKey };
}

// Create Supabase client
function createSupabaseClient(url, anonKey) {
  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase;
}

// Step 1: Check if admin user exists in auth.users
async function checkAdminUserInAuth(supabase) {
  console.log("\n🔍 Step 1: Checking admin user in auth.users...");

  try {
    // We can't directly query auth.users from client, but we can try to sign in
    console.log("   Attempting to sign in with admin credentials...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
    });

    if (error) {
      console.error("❌ Sign in failed:", error.message);

      if (error.message.includes("Invalid login credentials")) {
        console.log(
          "   This suggests the admin user doesn't exist in auth.users"
        );
        return { success: false, error: "Admin user not found in auth.users" };
      }

      if (error.message.includes("Email not confirmed")) {
        console.log("   Admin email is not confirmed");
        return { success: false, error: "Admin email not confirmed" };
      }

      return { success: false, error: error.message };
    }

    if (data?.user) {
      console.log("✅ Admin user found in auth.users:");
      console.log(`   - User ID: ${data.user.id}`);
      console.log(`   - Email: ${data.user.email}`);
      console.log(
        `   - Email Confirmed: ${data.user.email_confirmed_at ? "Yes" : "No"}`
      );
      console.log(`   - Created At: ${data.user.created_at}`);

      // Sign out immediately
      await supabase.auth.signOut();

      return { success: true, userId: data.user.id, email: data.user.email };
    }

    return { success: false, error: "Unexpected response from sign in" };
  } catch (error) {
    console.error("❌ Unexpected error during auth check:", error.message);
    return { success: false, error: error.message };
  }
}

// Step 2: Check if admin profile exists in Users table
async function checkAdminProfileInUsers(supabase, userId) {
  console.log("\n🔍 Step 2: Checking admin profile in Users table...");

  try {
    console.log(`   Looking for UserID: ${userId}`);

    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("UserID", userId)
      .single();

    if (error) {
      console.error("❌ Error fetching admin profile:", error.message);

      if (error.code === "PGRST116") {
        console.log("   Admin profile not found in Users table");
        return {
          success: false,
          error: "Admin profile not found in Users table",
        };
      }

      if (error.message.includes("permission denied")) {
        console.log("   RLS policies are blocking access to Users table");
        return { success: false, error: "RLS policies blocking access" };
      }

      return { success: false, error: error.message };
    }

    if (data) {
      console.log("✅ Admin profile found in Users table:");
      console.log(`   - UserID: ${data.UserID}`);
      console.log(`   - Username: ${data.Username}`);
      console.log(`   - Email: ${data.Email}`);
      console.log(`   - Role: ${data.RoleName}`);
      console.log(`   - Full Name: ${data.fullName}`);

      return { success: true, profile: data };
    }

    return { success: false, error: "No data returned" };
  } catch (error) {
    console.error("❌ Unexpected error during profile check:", error.message);
    return { success: false, error: error.message };
  }
}

// Step 3: Try username lookup
async function checkUsernameLookup(supabase) {
  console.log("\n🔍 Step 3: Testing username lookup...");

  try {
    console.log(`   Looking for username: ${ADMIN_CREDENTIALS.username}`);

    const { data, error } = await supabase
      .from("Users")
      .select("Email, UserID")
      .eq("Username", ADMIN_CREDENTIALS.username)
      .single();

    if (error) {
      console.error("❌ Username lookup failed:", error.message);

      if (error.code === "PGRST116") {
        console.log("   Username not found");
        return { success: false, error: "Username not found" };
      }

      if (error.message.includes("permission denied")) {
        console.log("   RLS policies blocking username lookup");
        return { success: false, error: "RLS policies blocking access" };
      }

      return { success: false, error: error.message };
    }

    if (data) {
      console.log("✅ Username lookup successful:");
      console.log(`   - Username: ${ADMIN_CREDENTIALS.username}`);
      console.log(`   - Email: ${data.Email}`);
      console.log(`   - UserID: ${data.UserID}`);

      return { success: true, email: data.Email, userId: data.UserID };
    }

    return { success: false, error: "No data returned" };
  } catch (error) {
    console.error("❌ Unexpected error during username lookup:", error.message);
    return { success: false, error: error.message };
  }
}

// Step 4: Check Role table
async function checkRoleTable(supabase) {
  console.log("\n🔍 Step 4: Checking Role table...");

  try {
    const { data, error } = await supabase.from("Role").select("*");

    if (error) {
      console.error("❌ Error fetching roles:", error.message);

      if (error.message.includes("permission denied")) {
        console.log("   RLS policies blocking access to Role table");
        return { success: false, error: "RLS policies blocking access" };
      }

      return { success: false, error: error.message };
    }

    if (data && data.length > 0) {
      console.log("✅ Roles found:");
      data.forEach((role) => {
        console.log(`   - ${role.RoleName} (ID: ${role.RoleID})`);
      });

      return { success: true, roles: data };
    } else {
      console.log("   No roles found in Role table");
      return { success: false, error: "No roles found" };
    }
  } catch (error) {
    console.error("❌ Unexpected error during role check:", error.message);
    return { success: false, error: error.message };
  }
}

// Main debug function
async function debugAdminLogin() {
  try {
    console.log("🚀 Starting admin login debug...");
    console.log("==================================");
    console.log("Admin credentials:");
    console.log(`   Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`   Username: ${ADMIN_CREDENTIALS.username}`);
    console.log(`   Password: ${ADMIN_CREDENTIALS.password}`);
    console.log("");

    // Validate environment
    const { supabaseUrl, supabaseAnonKey } = validateEnvironment();

    // Create Supabase client
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

    // Test connection
    console.log("🔗 Testing Supabase connection...");
    const { data: testData, error: testError } =
      await supabase.auth.getSession();
    if (testError && !testError.message.includes("Auth session missing")) {
      console.error("❌ Supabase connection test failed:", testError.message);
      process.exit(1);
    }
    console.log("✅ Supabase connection successful");

    // Step 1: Check auth.users
    const authResult = await checkAdminUserInAuth(supabase);
    if (!authResult.success) {
      console.log("\n❌ ADMIN LOGIN DEBUG FAILED");
      console.log("Issue: Admin user not found in auth.users");
      console.log("Solution: Need to create admin user in Supabase Auth");
      return;
    }

    const userId = authResult.userId;
    const email = authResult.email;

    // Step 2: Check Users table
    const profileResult = await checkAdminProfileInUsers(supabase, userId);
    if (!profileResult.success) {
      console.log("\n❌ ADMIN LOGIN DEBUG FAILED");
      console.log("Issue: Admin profile not found in Users table");
      console.log("Solution: Need to insert admin profile manually");
      return;
    }

    // Step 3: Check username lookup
    const usernameResult = await checkUsernameLookup(supabase);
    if (!usernameResult.success) {
      console.log("\n⚠️  WARNING: Username lookup failed");
      console.log("This will cause 'Unable to verify username' error in login");
    }

    // Step 4: Check roles
    const roleResult = await checkRoleTable(supabase);
    if (!roleResult.success) {
      console.log("\n⚠️  WARNING: Role table access failed");
      console.log("This may cause role detection issues");
    }

    // Summary
    console.log("\n📋 DEBUG SUMMARY");
    console.log("================");
    console.log("✅ Admin user exists in auth.users");
    console.log("✅ Admin profile exists in Users table");
    console.log(
      `${usernameResult.success ? "✅" : "❌"} Username lookup works`
    );
    console.log(`${roleResult.success ? "✅" : "❌"} Role table accessible`);

    if (
      authResult.success &&
      profileResult.success &&
      usernameResult.success &&
      roleResult.success
    ) {
      console.log("\n🎉 ALL CHECKS PASSED - Admin login should work!");
      console.log(
        "If login still fails, the issue is in the frontend auth logic."
      );
    } else {
      console.log("\n❌ SOME CHECKS FAILED - Admin login will fail.");
      console.log("Fix the failed checks before attempting login.");
    }
  } catch (error) {
    console.error("❌ Debug script failed:", error.message);
    process.exit(1);
  }
}

// Run the debug script
debugAdminLogin();
