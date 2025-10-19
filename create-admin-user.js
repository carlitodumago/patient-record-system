/**
 * Admin User Creation Script
 *
 * This script creates a registered admin role account in Supabase with:
 * - Username: 'admin'
 * - Password: 'adminbaan'
 * - Role: Admin (RoleID = 1)
 * - Full staff record for admin functionality
 *
 * Usage: node create-admin-user.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

// Load environment variables
dotenv.config();

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Please ensure VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_SERVICE_KEY are set"
  );
  process.exit(1);
}

// Create Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "adminbaan";
const ADMIN_EMAIL = "admin@patientrecordsystem.com";

async function createAdminUser() {
  console.log("🚀 Starting admin user creation process...\n");

  try {
    // Step 1: Check if admin user already exists
    console.log("🔍 Checking if admin user already exists...");
    const { data: existingUsers, error: checkError } = await supabase
      .from("Users")
      .select("UserID, Username, Role:RoleID(RoleName)")
      .eq("Username", ADMIN_USERNAME);

    if (checkError) {
      throw new Error(`Error checking existing users: ${checkError.message}`);
    }

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log(`⚠️ Admin user already exists:`);
      console.log(`   Username: ${existingUser.Username}`);
      console.log(`   Role: ${existingUser.Role?.RoleName || "Unknown"}`);
      console.log(`   UserID: ${existingUser.UserID}`);

      // Ask if user wants to recreate
      console.log(`\n❓ Do you want to recreate the admin user? (y/N)`);
      const readline = (await import("readline")).default;
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        rl.question("Answer: ", resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
        console.log("✅ Admin user creation cancelled");
        return;
      }

      // Delete existing admin user and related records
      console.log("🗑️ Removing existing admin user...");
      await deleteExistingAdmin(existingUser.UserID);
    }

    // Step 2: Create admin user in Supabase Auth
    console.log("👤 Creating admin user in Supabase Auth...");
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          username: ADMIN_USERNAME,
          role: "admin",
        },
      });

    if (authError) {
      throw new Error(`Error creating auth user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error("No user data returned from auth creation");
    }

    console.log("✅ Supabase Auth user created successfully");
    console.log(`   Auth User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // Step 3: Get admin role ID
    console.log("🏷️ Getting admin role information...");
    const { data: roles, error: roleError } = await supabase
      .from("Role")
      .select("RoleID, RoleName")
      .eq("RoleName", "admin")
      .single();

    if (roleError) {
      throw new Error(`Error getting admin role: ${roleError.message}`);
    }

    if (!roles) {
      throw new Error("Admin role not found in database");
    }

    console.log(`✅ Found admin role: ${roles.RoleName} (ID: ${roles.RoleID})`);

    // Step 4: Create user record in Users table
    console.log("💾 Creating user record in Users table...");
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .insert({
        UserID: authData.user.id,
        Username: ADMIN_USERNAME,
        Password: await bcrypt.hash(ADMIN_PASSWORD, 10), // Hash the password for local auth fallback
        Email: ADMIN_EMAIL,
        RoleID: roles.RoleID,
        CreatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      throw new Error(`Error creating user record: ${userError.message}`);
    }

    console.log("✅ User record created successfully");
    console.log(`   User ID: ${userData.UserID}`);
    console.log(`   Username: ${userData.Username}`);
    console.log(`   Email: ${userData.Email}`);

    // Step 5: Create staff record for admin
    console.log("👨‍💼 Creating staff record for admin...");
    const { data: staffData, error: staffError } = await supabase
      .from("Staff")
      .insert({
        UserID: authData.user.id,
        FirstName: "System",
        Surname: "Administrator",
        Suffix: "",
        ContactNumber: "+1234567890",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (staffError) {
      throw new Error(`Error creating staff record: ${staffError.message}`);
    }

    console.log("✅ Staff record created successfully");
    console.log(`   Staff ID: ${staffData.StaffID}`);
    console.log(`   Name: ${staffData.FirstName} ${staffData.Surname}`);

    // Step 6: Test login functionality
    console.log("🔐 Testing admin login functionality...");
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });

    if (loginError) {
      throw new Error(`Error testing login: ${loginError.message}`);
    }

    console.log("✅ Login test successful!");
    console.log(
      `   Access Token: ${
        loginData.session?.access_token ? "Generated" : "Not generated"
      }`
    );
    console.log(
      `   Refresh Token: ${
        loginData.session?.refresh_token ? "Generated" : "Not generated"
      }`
    );

    // Step 7: Verify admin role assignment
    console.log("✅ Verifying admin role assignment...");
    const { data: verifyUser, error: verifyError } = await supabase
      .from("Users")
      .select(
        `
        UserID,
        Username,
        Email,
        Role:RoleID(RoleName)
      `
      )
      .eq("UserID", authData.user.id)
      .single();

    if (verifyError) {
      throw new Error(`Error verifying user: ${verifyError.message}`);
    }

    console.log("✅ Admin user verification successful!");
    console.log(`   Username: ${verifyUser.Username}`);
    console.log(`   Email: ${verifyUser.Email}`);
    console.log(`   Role: ${verifyUser.Role?.RoleName}`);

    console.log("\n🎉 Admin user creation completed successfully!");
    console.log("\n📋 Admin Credentials:");
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(
      "\n🔗 You can now login to the application using these credentials!"
    );
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    console.error("\n🔧 Troubleshooting steps:");
    console.error(
      "1. Ensure your .env file contains valid Supabase credentials"
    );
    console.error(
      "2. Verify that the database tables exist (run database initialization first)"
    );
    console.error("3. Check that RLS policies allow admin creation");
    console.error(
      "4. Ensure the SUPABASE_SERVICE_ROLE_KEY has the necessary permissions"
    );
    process.exit(1);
  }
}

async function deleteExistingAdmin(userId) {
  try {
    // Delete from Staff table first (foreign key constraint)
    await supabase.from("Staff").delete().eq("UserID", userId);

    // Delete from Users table
    await supabase.from("Users").delete().eq("UserID", userId);

    // Delete from Supabase Auth (this requires admin privileges)
    await supabase.auth.admin.deleteUser(userId);

    console.log("✅ Existing admin user removed successfully");
  } catch (error) {
    console.error("⚠️ Error removing existing admin:", error.message);
    // Continue with creation even if deletion fails
  }
}

// Run the script
createAdminUser();
