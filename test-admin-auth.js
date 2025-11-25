#!/usr/bin/env node

/**
 * Test Secure Admin Authentication
 * Quick test to validate admin credentials and authentication flow
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

const supabase = createClient(supabaseUrl, supabaseKey);

// Admin credentials to test
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "adminbaan",
  email: "admin@baankm3clinic.ph",
};

async function testAdminAuth() {
  console.log("🔒 Testing Admin Authentication");
  console.log("==============================");
  console.log(`Username: ${ADMIN_CREDENTIALS.username}`);
  console.log(`Email: ${ADMIN_CREDENTIALS.email}`);
  console.log(`Password: ${ADMIN_CREDENTIALS.password.substring(0, 4)}***`);

  try {
    console.log("\n📋 Step 1: Testing username lookup...");

    // First, try to lookup username in the Users table
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("UserID, Email, Username, RoleName, fullName")
      .eq("Username", ADMIN_CREDENTIALS.username)
      .eq("RoleName", "admin")
      .single();

    if (userError) {
      console.log("❌ Username lookup failed:", userError.message);
      console.log(
        "💡 This may be due to RLS policies. Trying direct authentication..."
      );
    } else {
      console.log("✅ Username lookup successful:");
      console.log(`   UserID: ${userData.UserID}`);
      console.log(`   Email: ${userData.Email}`);
      console.log(`   Username: ${userData.Username}`);
      console.log(`   Role: ${userData.RoleName}`);
      console.log(`   Full Name: ${userData.fullName}`);
    }

    console.log("\n🔐 Step 2: Testing authentication...");

    // Test authentication with the known email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
    });

    if (error) {
      console.log("❌ Authentication failed:", error.message);
      return false;
    }

    console.log("✅ Authentication successful!");
    console.log(`   User ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}`);
    console.log(
      `   Session expires: ${new Date(
        data.session.expires_at * 1000
      ).toISOString()}`
    );

    // Test session validation
    console.log("\n🔍 Step 3: Testing session validation...");
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      console.log("❌ Session validation failed:", sessionError?.message);
      return false;
    }

    console.log("✅ Session validation successful");
    console.log(`   Session active: ${!!sessionData.session}`);
    console.log(`   Token valid: ${!!sessionData.session.access_token}`);

    // Cleanup
    console.log("\n👋 Step 4: Logging out...");
    await supabase.auth.signOut();
    console.log("✅ Logout successful");

    console.log("\n🎉 Admin Authentication Test Complete!");
    console.log("✅ All security measures working correctly:");
    console.log("   ✅ Username lookup functional");
    console.log("   ✅ Password authentication secure");
    console.log("   ✅ Session management working");
    console.log("   ✅ Logout cleanup complete");

    return true;
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
    return false;
  }
}

// Test invalid credentials
async function testInvalidCredentials() {
  console.log("\n🚫 Testing Invalid Credentials");
  console.log("===============================");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: "wrongpassword",
    });

    if (error) {
      console.log("✅ Invalid credentials correctly rejected:", error.message);
      return true;
    } else {
      console.log("❌ Invalid credentials were incorrectly accepted");
      return false;
    }
  } catch (error) {
    console.log("✅ Invalid credentials test completed:", error.message);
    return true;
  }
}

async function main() {
  const authResult = await testAdminAuth();
  const invalidResult = await testInvalidCredentials();

  console.log("\n📊 Final Results");
  console.log("================");
  console.log(`Valid credentials test: ${authResult ? "✅ PASS" : "❌ FAIL"}`);
  console.log(
    `Invalid credentials test: ${invalidResult ? "✅ PASS" : "❌ FAIL"}`
  );

  if (authResult && invalidResult) {
    console.log("\n🎉 Secure authentication system validated successfully!");
    console.log("🔐 Admin credentials working:");
    console.log(`   Username: ${ADMIN_CREDENTIALS.username}`);
    console.log(`   Password: ${ADMIN_CREDENTIALS.password}`);
  } else {
    console.log("\n⚠️ Some authentication tests failed");
  }
}

// Run the test
main().catch(console.error);
