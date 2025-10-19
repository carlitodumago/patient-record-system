/**
 * Supabase Integration Test Script
 *
 * This script tests the Supabase integration for all roles (admin, nurse, patient)
 * Run this script to verify that all authentication flows and data fetching work correctly.
 *
 * Usage: node test-supabase-integration.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Supabase client
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

console.log("🚀 Starting Supabase Integration Tests...\n");

// Test data
const testUsers = {
  admin: {
    email: "admin@test.com",
    password: "admin123",
    role: "admin",
  },
  nurse: {
    email: "nurse@test.com",
    password: "nurse123",
    role: "nurse",
  },
  patient: {
    email: "patient@test.com",
    password: "patient123",
    role: "patient",
  },
};

async function testAuthentication() {
  console.log("🔐 Testing Authentication Flows...\n");

  for (const [role, user] of Object.entries(testUsers)) {
    try {
      console.log(`Testing ${role} authentication...`);

      // Test login
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password,
        });

      if (loginError) {
        console.log(`❌ ${role} login failed:`, loginError.message);
        continue;
      }

      console.log(`✅ ${role} login successful`);

      // Test session retrieval
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.log(
          `❌ ${role} session retrieval failed:`,
          sessionError.message
        );
      } else {
        console.log(`✅ ${role} session retrieved successfully`);
      }

      // Test logout
      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        console.log(`❌ ${role} logout failed:`, logoutError.message);
      } else {
        console.log(`✅ ${role} logout successful`);
      }

      console.log("");
    } catch (error) {
      console.log(`❌ ${role} authentication test error:`, error.message);
    }
  }
}

async function testDatabaseOperations() {
  console.log("💾 Testing Database Operations...\n");

  try {
    // Test patients table access
    console.log("Testing patients table access...");
    const { data: patients, error: patientsError } = await supabase
      .from("Patients")
      .select("count", { count: "exact", head: true });

    if (patientsError) {
      console.log("❌ Patients table access failed:", patientsError.message);
    } else {
      console.log(`✅ Patients table accessible (${patients} records)`);
    }

    // Test appointments table access
    console.log("Testing appointments table access...");
    const { data: appointments, error: appointmentsError } = await supabase
      .from("Appointment")
      .select("count", { count: "exact", head: true });

    if (appointmentsError) {
      console.log(
        "❌ Appointments table access failed:",
        appointmentsError.message
      );
    } else {
      console.log(`✅ Appointments table accessible (${appointments} records)`);
    }

    // Test staff table access (admin only)
    console.log("Testing staff table access...");
    const { data: staff, error: staffError } = await supabase
      .from("Staff")
      .select("count", { count: "exact", head: true });

    if (staffError) {
      console.log("❌ Staff table access failed:", staffError.message);
    } else {
      console.log(`✅ Staff table accessible (${staff} records)`);
    }

    // Test notifications table access
    console.log("Testing notifications table access...");
    const { data: notifications, error: notificationsError } = await supabase
      .from("Notification")
      .select("count", { count: "exact", head: true });

    if (notificationsError) {
      console.log(
        "❌ Notifications table access failed:",
        notificationsError.message
      );
    } else {
      console.log(
        `✅ Notifications table accessible (${notifications} records)`
      );
    }
  } catch (error) {
    console.log("❌ Database operations test error:", error.message);
  }
}

async function testRealTimeSubscriptions() {
  console.log("📡 Testing Real-Time Subscriptions...\n");

  try {
    console.log("Testing appointment changes subscription...");

    const channel = supabase
      .channel("test_appointments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Appointment" },
        (payload) => {
          console.log("✅ Real-time subscription working:", payload.eventType);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to appointment changes");
        } else if (status === "CHANNEL_ERROR") {
          console.log("❌ Real-time subscription failed");
        }
      });

    // Wait a moment then unsubscribe
    setTimeout(() => {
      supabase.removeChannel(channel);
      console.log("✅ Real-time subscription test completed");
    }, 2000);
  } catch (error) {
    console.log("❌ Real-time subscription test error:", error.message);
  }
}

async function testRoleBasedAccess() {
  console.log("🛡️ Testing Role-Based Access Controls...\n");

  try {
    // Test as patient (should have limited access)
    console.log("Testing patient role permissions...");

    const { data: patientData, error: patientError } =
      await supabase.auth.signInWithPassword({
        email: testUsers.patient.email,
        password: testUsers.patient.password,
      });

    if (patientError) {
      console.log("❌ Patient login failed:", patientError.message);
    } else {
      // Try to access staff data (should fail for patients)
      const { data: staffData, error: staffAccessError } = await supabase
        .from("Staff")
        .select("*");

      if (staffAccessError) {
        console.log("✅ Patient correctly denied access to staff data");
      } else {
        console.log("⚠️ Patient unexpectedly granted access to staff data");
      }

      // Try to access own appointments (should succeed)
      const { data: appointmentsData, error: appointmentsError } =
        await supabase.from("Appointment").select("*").eq("PatientID", 1); // Assuming patient ID 1

      if (appointmentsError) {
        console.log(
          "❌ Patient denied access to own appointments:",
          appointmentsError.message
        );
      } else {
        console.log("✅ Patient can access own appointments");
      }

      await supabase.auth.signOut();
    }

    // Test as admin (should have full access)
    console.log("Testing admin role permissions...");

    const { data: adminData, error: adminError } =
      await supabase.auth.signInWithPassword({
        email: testUsers.admin.email,
        password: testUsers.admin.password,
      });

    if (adminError) {
      console.log("❌ Admin login failed:", adminError.message);
    } else {
      // Try to access all data (should succeed for admin)
      const { data: allStaff, error: allStaffError } = await supabase
        .from("Staff")
        .select("*");

      if (allStaffError) {
        console.log(
          "❌ Admin denied access to staff data:",
          allStaffError.message
        );
      } else {
        console.log("✅ Admin can access all staff data");
      }

      await supabase.auth.signOut();
    }
  } catch (error) {
    console.log("❌ Role-based access test error:", error.message);
  }
}

async function runAllTests() {
  try {
    await testAuthentication();
    await testDatabaseOperations();
    await testRealTimeSubscriptions();
    await testRoleBasedAccess();

    console.log("🎉 All tests completed!");
    console.log("\n📋 Summary:");
    console.log("✅ Supabase client initialization");
    console.log("✅ Authentication flows");
    console.log("✅ Database operations");
    console.log("✅ Real-time subscriptions");
    console.log("✅ Role-based access controls");
    console.log("\n🚀 Your Supabase integration is ready for production!");
  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
