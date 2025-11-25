#!/usr/bin/env node

/**
 * Test script to verify admin authentication flow
 * Run with: node test-admin-auth-flow.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testAdminAuthFlow = async () => {
  console.log("🧪 Testing Admin Authentication Flow...\n");

  try {
    // Test 1: Try to sign in as admin to verify user exists
    console.log("1️⃣ Testing admin user exists in Supabase Auth...");
    const { data: adminSignInData, error: adminSignInError } =
      await supabase.auth.signInWithPassword({
        email: "admin@baankm3clinic.ph",
        password: "adminbaan",
      });

    if (adminSignInError) {
      console.error(
        "❌ Admin user not found or password incorrect:",
        adminSignInError.message
      );
      console.log(
        "Run the admin creation script first: node server/scripts/createAdminAccount.js"
      );
      return false;
    }

    if (adminSignInData.user) {
      console.log("✅ Admin user exists in Supabase Auth");
      console.log("User ID:", adminSignInData.user.id);
      console.log("Email:", adminSignInData.user.email);
    } else {
      console.log("❌ No user data returned");
      return false;
    }

    // Test 2: Check user role in Users table
    console.log("\n2️⃣ Checking user role in database...");
    const { data: dbUserRecord, error: dbUserError } = await supabase
      .from("Users")
      .select(
        `
        *,
        Role!inner(RoleName)
      `
      )
      .eq("UserID", adminSignInData.user.id)
      .single();

    if (dbUserError) {
      console.error("❌ Error fetching user record:", dbUserError);
      return false;
    }

    if (dbUserRecord?.Role?.RoleName === "admin") {
      console.log("✅ User has admin role in database");
    } else {
      console.error("❌ User does not have admin role");
      return false;
    }

    // Test 3: Check if admin role exists
    console.log("\n3️⃣ Checking admin role definition...");
    const { data: adminRoleRecord, error: adminRoleError } = await supabase
      .from("Role")
      .select("*")
      .eq("RoleName", "admin")
      .single();

    if (adminRoleError) {
      console.error("❌ Error fetching admin role:", adminRoleError);
      return false;
    }

    if (adminRoleRecord) {
      console.log("✅ Admin role exists in database");
      console.log("Role description:", adminRoleRecord.Description);
    }

    // Test 4: Check UserRole linking table
    console.log("\n4️⃣ Checking user-role linking...");
    const { data: linkUserRoleRecord, error: linkUserRoleError } =
      await supabase
        .from("UserRole")
        .select("*")
        .eq("UserID", adminSignInData.user.id)
        .eq("RoleName", "admin")
        .single();

    if (linkUserRoleError) {
      console.error("❌ Error checking user-role linking:", linkUserRoleError);
      return false;
    }

    if (linkUserRoleRecord) {
      console.log("✅ User-role linking exists");
    }

    // Clean up - sign out
    console.log("\n🧹 Cleaning up...");
    await supabase.auth.signOut();
    console.log("✅ Signed out successfully");

    console.log("\n🎉 All admin authentication tests passed!");
    console.log("\n📋 Summary:");
    console.log("✅ Admin user exists in Supabase Auth");
    console.log("✅ User has admin role in database");
    console.log("✅ Admin role definition exists");
    console.log("✅ User-role linking is properly configured");
    console.log("\n🚀 Admin authentication system is ready!");

    return true;
  } catch (error) {
    console.error("\n💥 Test failed with error:", error);
    return false;
  }
};

// Run the test
testAdminAuthFlow()
  .then((success) => {
    if (success) {
      console.log(
        "\n✅ Admin authentication flow test completed successfully!"
      );
    } else {
      console.log("\n❌ Admin authentication flow test failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n💥 Test error:", error);
    process.exit(1);
  });
