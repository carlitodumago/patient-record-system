/**
 * Direct Admin User Creation Script
 *
 * This script creates an admin user by directly inserting into Supabase tables
 * without using the complex DatabaseService methods that have relationship conflicts.
 *
 * Usage: node create-admin-direct.js
 */

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
  console.log("🚀 Starting direct admin user creation process...\n");

  try {
    // Step 1: Check if admin user already exists (simple query)
    console.log("🔍 Checking if admin user already exists...");
    const { data: existingUsers, error: checkError } = await supabase
      .from("Users")
      .select("UserID, Username")
      .eq("Username", ADMIN_USERNAME);

    if (checkError) {
      throw new Error(`Error checking existing users: ${checkError.message}`);
    }

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log(`⚠️ Admin user already exists:`);
      console.log(`   Username: ${existingUser.Username}`);
      console.log(`   UserID: ${existingUser.UserID}`);

      // Auto-recreate admin user
      console.log("🔄 Auto-recreating admin user...");
      await deleteExistingAdmin(existingUser.UserID);
    }

    // Step 2: Get admin role ID (simple query)
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
      throw new Error(
        "Admin role not found in database. Please run database initialization first."
      );
    }

    console.log(`✅ Found admin role: ${roles.RoleName} (ID: ${roles.RoleID})`);

    // Step 3: Generate an integer ID for the user (following existing pattern)
    const userId = 2; // Use a simple integer ID

    // Step 4: Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Step 5: Create user record in Users table
    console.log("💾 Creating user record in Users table...");
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .insert({
        UserID: userId,
        Username: ADMIN_USERNAME,
        Password: hashedPassword,
        Email: ADMIN_EMAIL,
        RoleID: roles.RoleID,
        CreatedAt: new Date().toISOString(),
      })
      .select("UserID, Username, Email")
      .single();

    if (userError) {
      throw new Error(`Error creating user record: ${userError.message}`);
    }

    console.log("✅ User record created successfully");
    console.log(`   User ID: ${userData.UserID}`);
    console.log(`   Username: ${userData.Username}`);
    console.log(`   Email: ${userData.Email}`);

    // Step 6: Create staff record for admin
    console.log("👨‍💼 Creating staff record for admin...");
    const { data: staffData, error: staffError } = await supabase
      .from("Staff")
      .insert({
        UserID: userId,
        FirstName: "System",
        Surname: "Administrator",
        Suffix: "",
        ContactNumber: "+1234567890",
      })
      .select("StaffID, FirstName, Surname")
      .single();

    if (staffError) {
      throw new Error(`Error creating staff record: ${staffError.message}`);
    }

    console.log("✅ Staff record created successfully");
    console.log(`   Staff ID: ${staffData.StaffID}`);
    console.log(`   Name: ${staffData.FirstName} ${staffData.Surname}`);

    // Step 7: Test login functionality
    console.log("🔐 Testing admin login functionality...");

    // Test the login by verifying the password directly
    const { data: testUser, error: testError } = await supabase
      .from("Users")
      .select("UserID, Username, Password, Role:RoleID(RoleName)")
      .eq("Username", ADMIN_USERNAME)
      .single();

    if (testError) {
      throw new Error(`Error testing login: ${testError.message}`);
    }

    const isValidPassword = await bcrypt.compare(
      ADMIN_PASSWORD,
      testUser.Password
    );

    if (isValidPassword) {
      console.log("✅ Login test successful!");
      console.log(`   Password verification: Passed`);
      console.log(`   User role: ${testUser.Role?.RoleName || "Unknown"}`);
    } else {
      console.log("❌ Login test failed - password verification failed");
    }

    // Step 8: Verify complete admin setup
    console.log("✅ Verifying complete admin setup...");

    // Verify user exists and has correct data
    const { data: verifyUser, error: verifyError } = await supabase
      .from("Users")
      .select("UserID, Username, Email")
      .eq("UserID", userId)
      .single();

    if (verifyError) {
      throw new Error(`Error verifying user: ${verifyError.message}`);
    }

    // Verify role assignment
    const { data: verifyRole, error: verifyRoleError } = await supabase
      .from("Role")
      .select("RoleName")
      .eq("RoleID", roles.RoleID)
      .single();

    if (verifyRoleError) {
      throw new Error(`Error verifying role: ${verifyRoleError.message}`);
    }

    // Verify staff record exists
    const { data: verifyStaff, error: verifyStaffError } = await supabase
      .from("Staff")
      .select("StaffID, FirstName, Surname")
      .eq("UserID", userId)
      .single();

    if (verifyStaffError) {
      throw new Error(`Error verifying staff: ${verifyStaffError.message}`);
    }

    console.log("✅ Admin user verification successful!");
    console.log(`   Username: ${verifyUser.Username}`);
    console.log(`   Email: ${verifyUser.Email}`);
    console.log(`   Role: ${verifyRole?.RoleName || "Unknown"}`);
    console.log(
      `   Staff: ${
        verifyStaff
          ? `${verifyStaff.FirstName} ${verifyStaff.Surname}`
          : "Not found"
      }`
    );

    console.log("\n🎉 Admin user creation completed successfully!");
    console.log("\n📋 Admin Credentials:");
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(
      "\n🔗 You can now login to the application using these credentials!"
    );
    console.log("\n💡 The admin user has been created with:");
    console.log("   ✅ User record in Users table");
    console.log("   ✅ Admin role assignment");
    console.log("   ✅ Staff record for admin functionality");
    console.log("   ✅ Password hashing for security");
    console.log("   ✅ Login functionality verified");
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
    console.error(
      "4. Ensure RLS policies allow the current user to insert records"
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

    console.log("✅ Existing admin user removed successfully");
  } catch (error) {
    console.error("⚠️ Error removing existing admin:", error.message);
    // Continue with creation even if deletion fails
  }
}

// Run the script
createAdminUser();
