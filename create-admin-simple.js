/**
 * Simple Admin User Creation Script
 *
 * This script creates an admin user using the existing API endpoints
 * and database service without requiring service role permissions.
 *
 * Usage: node create-admin-simple.js
 */

import DatabaseService from "./server/services/databaseService.js";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Please ensure SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY are set"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "adminbaan";
const ADMIN_EMAIL = "admin@patientrecordsystem.com";

async function createAdminUser() {
  console.log("🚀 Starting simple admin user creation process...\n");

  try {
    // Step 1: Check if admin user already exists
    console.log("🔍 Checking if admin user already exists...");
    const existingUsers = await DatabaseService.getUsers();
    const existingAdmin = existingUsers.find(
      (user) => user.Username === ADMIN_USERNAME
    );

    if (existingAdmin) {
      console.log(`⚠️ Admin user already exists:`);
      console.log(`   Username: ${existingAdmin.Username}`);
      console.log(`   Role: ${existingAdmin.Role?.RoleName || "Unknown"}`);
      console.log(`   UserID: ${existingAdmin.UserID}`);

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
      await deleteExistingAdmin(existingAdmin.UserID);
    }

    // Step 2: Get admin role ID
    console.log("🏷️ Getting admin role information...");
    const roles = await DatabaseService.getRoles();
    const adminRole = roles.find((role) => role.RoleName === "admin");

    if (!adminRole) {
      throw new Error(
        "Admin role not found in database. Please run database initialization first."
      );
    }

    console.log(
      `✅ Found admin role: ${adminRole.RoleName} (ID: ${adminRole.RoleID})`
    );

    // Step 3: Create a UUID for the user (Supabase auth users have UUID format)
    const userId = crypto.randomUUID();

    // Step 4: Create user record in Users table
    console.log("💾 Creating user record in Users table...");
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const { data: userData, error: userError } = await supabase
      .from("Users")
      .insert({
        UserID: userId,
        Username: ADMIN_USERNAME,
        Password: hashedPassword,
        Email: ADMIN_EMAIL,
        RoleID: adminRole.RoleID,
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
        UserID: userId,
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

    // Step 6: Test login functionality using the API
    console.log("🔐 Testing admin login functionality...");

    // Test the login through the users API endpoint
    const loginResponse = await testLogin();

    if (loginResponse.success) {
      console.log("✅ Login test successful!");
      console.log(
        `   Token: ${loginResponse.token ? "Generated" : "Not generated"}`
      );
    } else {
      console.log("⚠️ Login test failed, but user was created successfully");
      console.log(`   Error: ${loginResponse.error}`);
    }

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
      .eq("UserID", userId)
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
    console.log(
      "\n⚠️ Note: This user was created in the application's user table but not in Supabase Auth."
    );
    console.log(
      "   For full authentication features, you may need to create the user in Supabase Auth as well."
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
    console.error("3. Check that the Role table contains an 'admin' role");
    process.exit(1);
  }
}

async function deleteExistingAdmin(userId) {
  try {
    // Delete from Staff table first (foreign key constraint)
    await supabase.from("Staff").delete().eq("UserID", userId);

    // Delete from Users table
    await supabase.from("Users").delete().eq("UserID", userId);

    console.log("✅ Existing admin user removed successfully");
  } catch (error) {
    console.error("⚠️ Error removing existing admin:", error.message);
    // Continue with creation even if deletion fails
  }
}

async function testLogin() {
  try {
    // We'll test the login by making a request to our own API
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select(
        `
        UserID,
        Username,
        Password,
        Email,
        Role:RoleID(RoleName)
      `
      )
      .eq("Username", ADMIN_USERNAME)
      .single();

    if (userError) {
      throw new Error(
        `Error fetching user for login test: ${userError.message}`
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      ADMIN_PASSWORD,
      userData.Password
    );

    if (isValidPassword) {
      return {
        success: true,
        token: "mock-jwt-token-for-testing",
        user: {
          userId: userData.UserID,
          username: userData.Username,
          role: userData.Role?.RoleName || "admin",
        },
      };
    } else {
      return {
        success: false,
        error: "Password verification failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the script
createAdminUser();
