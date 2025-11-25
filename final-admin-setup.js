/**
 * Final Admin Setup Script
 *
 * This script provides manual instructions for completing the admin setup
 * since RLS policies are blocking automated access.
 *
 * Usage: node final-admin-setup.js
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
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL environment variable is not set");
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error(
      "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    );
    console.log("   This is needed to bypass RLS policies for admin setup");
    process.exit(1);
  }

  console.log("✅ Environment configuration validated");
  return { supabaseUrl, supabaseServiceKey };
}

// Create Supabase client with service role key
function createServiceClient(url, serviceKey) {
  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase;
}

// Check if admin profile exists
async function checkAdminProfile(supabase) {
  console.log("\n🔍 Checking admin profile in Users table...");

  try {
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("UserID", "64d5478e-0ccf-4d51-a267-2600d80d0ca9")
      .single();

    if (error && error.code === "PGRST116") {
      console.log("   Admin profile not found in Users table");
      return { exists: false };
    }

    if (error) {
      console.error("❌ Error checking admin profile:", error.message);
      return { exists: false, error: error.message };
    }

    if (data) {
      console.log("✅ Admin profile found:");
      console.log(`   - UserID: ${data.UserID}`);
      console.log(`   - Username: ${data.Username}`);
      console.log(`   - Email: ${data.Email}`);
      console.log(`   - Role: ${data.RoleName}`);
      return { exists: true, profile: data };
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return { exists: false, error: error.message };
  }
}

// Insert admin profile
async function insertAdminProfile(supabase) {
  console.log("\n📝 Inserting admin profile into Users table...");

  try {
    const adminProfile = {
      UserID: "64d5478e-0ccf-4d51-a267-2600d80d0ca9",
      Username: "admin",
      Email: "admin@baankm3clinic.ph",
      FirstName: "System",
      Surname: "Administrator",
      RoleName: "admin",
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("Users")
      .insert(adminProfile)
      .select();

    if (error) {
      console.error("❌ Error inserting admin profile:", error.message);
      return { success: false, error: error.message };
    }

    console.log("✅ Admin profile inserted successfully");
    console.log(`   - UserID: ${data[0].UserID}`);
    console.log(`   - Username: ${data[0].Username}`);
    console.log(`   - Email: ${data[0].Email}`);
    console.log(`   - Role: ${data[0].RoleName}`);

    return { success: true, profile: data[0] };
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return { success: false, error: error.message };
  }
}

// Check Role table
async function checkRoleTable(supabase) {
  console.log("\n🔍 Checking Role table...");

  try {
    const { data, error } = await supabase.from("Role").select("*");

    if (error) {
      console.error("❌ Error fetching roles:", error.message);
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
    console.error("❌ Unexpected error:", error.message);
    return { success: false, error: error.message };
  }
}

// Main setup function
async function setupAdmin() {
  try {
    console.log("🚀 Starting final admin setup...");
    console.log("==================================");
    console.log("Admin credentials:");
    console.log(`   Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`   Username: ${ADMIN_CREDENTIALS.username}`);
    console.log(`   Password: ${ADMIN_CREDENTIALS.password}`);
    console.log("");

    // Validate environment
    const { supabaseUrl, supabaseServiceKey } = validateEnvironment();

    // Create service client
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Test connection
    console.log("🔗 Testing Supabase service connection...");
    const { data: testData, error: testError } =
      await supabase.auth.getSession();
    if (testError && !testError.message.includes("Auth session missing")) {
      console.error("❌ Supabase connection test failed:", testError.message);
      process.exit(1);
    }
    console.log("✅ Supabase service connection successful");

    // Check if admin profile exists
    const profileCheck = await checkAdminProfile(supabase);

    if (profileCheck.exists) {
      console.log("\n✅ Admin profile already exists!");
      console.log("The admin setup should be complete.");
      console.log("\nIf login still fails, try these troubleshooting steps:");
      console.log("1. Clear browser cache and cookies");
      console.log("2. Try logging in with email instead of username");
      console.log("3. Check browser console for JavaScript errors");
      return;
    }

    // Check roles
    const roleCheck = await checkRoleTable(supabase);
    if (!roleCheck.success) {
      console.log("\n❌ Role table issue detected");
      console.log(
        "Please ensure the Role table has the required roles (admin, nurse, patient)"
      );
      process.exit(1);
    }

    // Insert admin profile
    const insertResult = await insertAdminProfile(supabase);
    if (!insertResult.success) {
      console.log("\n❌ Failed to insert admin profile");
      console.log(
        "Manual intervention required. Please insert the admin profile manually in Supabase."
      );
      process.exit(1);
    }

    console.log("\n🎉 ADMIN SETUP COMPLETE!");
    console.log("========================");
    console.log("The admin account is now fully set up.");
    console.log("");
    console.log("Login credentials:");
    console.log(`   Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`   Username: ${ADMIN_CREDENTIALS.username}`);
    console.log(`   Password: ${ADMIN_CREDENTIALS.password}`);
    console.log("");
    console.log(
      "You can now log in to the application at http://localhost:5174/"
    );
  } catch (error) {
    console.error("❌ Setup script failed:", error.message);
    process.exit(1);
  }
}

// Run the setup script
setupAdmin();
