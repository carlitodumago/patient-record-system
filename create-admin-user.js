/**
 * Secure Admin User Creation Script
 *
 * This script creates an admin user in Supabase Auth and inserts the profile
 * into the public.Users table. It is idempotent and can be run multiple times.
 *
 * Usage: node create-admin-user.js
 *
 * Environment Variables Required:
 * - SUPABASE_URL or VITE_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Admin user configuration
const ADMIN_CONFIG = {
  email: "admin@baankm3clinic.ph",
  password: "adminbaan",
  username: "admin",
  fullName: "System Administrator",
  role: "admin",
};

// Validate environment configuration
function validateEnvironment() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL environment variable is not set");
    console.error(
      "   Please set VITE_SUPABASE_URL or SUPABASE_URL in your .env file"
    );
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
  return { supabaseUrl, supabaseServiceKey };
}

// Create Supabase client
function createSupabaseClient(url, serviceKey) {
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
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

async function createAdminUser(supabase) {
  try {
    console.log("🔍 Checking if admin user exists in auth.users...");

    // First, check if the admin user exists in auth.users
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("❌ Error fetching auth users:", authError);
      return;
    }

    const adminUser = authUsers.users.find(
      (user) => user.email === ADMIN_CONFIG.email
    );

    if (!adminUser) {
      console.log("📝 Admin user not found in auth.users. Creating...");

      // Create the admin user in Supabase Auth
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: ADMIN_CONFIG.email,
          password: ADMIN_CONFIG.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            fullName: ADMIN_CONFIG.fullName,
          },
        });

      if (createError) {
        console.error("❌ Error creating admin user in auth:", createError);
        return;
      }

      console.log(
        "✅ Admin user created in auth.users with ID:",
        newUser.user.id
      );
    } else {
      console.log(
        "✅ Admin user already exists in auth.users with ID:",
        adminUser.id
      );

      // Update password if needed (Supabase doesn't allow direct password updates via API)
      // The password should be set during creation or updated via client
    }

    // Now ensure the profile exists in public.Users
    console.log("🔍 Checking public.Users table...");

    const { data: existingProfile, error: profileError } = await supabase
      .from("Users")
      .select("*")
      .eq("Email", ADMIN_CONFIG.email)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error(
        "❌ Error checking existing profile:",
        profileError.message
      );
      console.error("💡 This might be due to:");
      console.error("   - Insufficient permissions for the service role key");
      console.error("   - Tables not created yet in the database");
      console.error("   - Row Level Security (RLS) policies blocking access");
      console.log(
        "⚠️ Skipping profile creation/update. Admin user exists in auth but profile may need manual setup."
      );
      console.log("🎉 Admin user setup partially complete!");
      console.log("📋 Admin credentials:");
      console.log("   Email:", ADMIN_CONFIG.email);
      console.log("   Username:", ADMIN_CONFIG.username);
      console.log("   Password:", ADMIN_CONFIG.password);
      console.log("   Role:", ADMIN_CONFIG.role);
      return;
    }

    if (existingProfile) {
      console.log("📝 Updating existing admin profile...");

      // Update the existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from("Users")
        .update({
          Username: ADMIN_CONFIG.username,
          RoleName: ADMIN_CONFIG.role,
          fullName: ADMIN_CONFIG.fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("Email", ADMIN_CONFIG.email)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error updating admin profile:", updateError);
        return;
      }

      console.log("✅ Admin profile updated successfully:", updatedProfile);
    } else {
      console.log("📝 Creating new admin profile...");

      // Get the UserID from auth.users
      const userId = adminUser ? adminUser.id : newUser.user.id;

      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from("Users")
        .insert({
          UserID: userId,
          Username: ADMIN_CONFIG.username,
          Email: ADMIN_CONFIG.email,
          RoleName: ADMIN_CONFIG.role,
          fullName: ADMIN_CONFIG.fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error creating admin profile:", insertError);
        return;
      }

      console.log("✅ Admin profile created successfully:", newProfile);
    }

    console.log("🎉 Admin user setup complete!");
    console.log("📋 Admin credentials:");
    console.log("   Email:", ADMIN_CONFIG.email);
    console.log("   Username:", ADMIN_CONFIG.username);
    console.log("   Password:", ADMIN_CONFIG.password);
    console.log("   Role:", ADMIN_CONFIG.role);
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Main execution function
async function main() {
  try {
    console.log("🚀 Starting admin user creation script...");

    // Validate environment
    const { supabaseUrl, supabaseServiceKey } = validateEnvironment();

    // Create Supabase client
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    // Test connection
    const isConnected = await testConnection(supabase);
    if (!isConnected) {
      console.error("❌ Cannot proceed without a valid Supabase connection");
      process.exit(1);
    }

    // Create admin user
    await createAdminUser(supabase);

    console.log("🎉 Script completed successfully!");
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
