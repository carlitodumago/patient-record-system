import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const SERVER_URL = process.env.VITE_SERVER_URL || "http://localhost:3000";

async function testServerAPI() {
  console.log("🔧 Testing server API for dashboard overview stats...");

  try {
    // First, we need to authenticate to get a token
    console.log("\n🔐 Authenticating to get access token...");

    const loginResponse = await fetch(`${SERVER_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@baankm3clinic.ph",
        password: "adminbaan",
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error(
        `Login failed: ${loginResponse.status} ${loginResponse.statusText}`
      );
      console.error("Response:", errorText);
      throw new Error(
        `Login failed: ${loginResponse.status} ${loginResponse.statusText}`
      );
    }

    const loginData = await loginResponse.json();
    console.log("Login response:", loginData);
    const token = loginData.data?.token;

    if (!token) {
      console.error("Login data:", loginData);
      throw new Error("No token received from login");
    }

    console.log("✅ Authentication successful");

    // Now test the overview stats endpoint
    console.log("\n📊 Testing /api/reports/overview endpoint...");

    const statsResponse = await fetch(`${SERVER_URL}/api/reports/overview`, {
      method: "GET",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",
      },
    });

    if (!statsResponse.ok) {
      const errorText = await statsResponse.text();
      console.error(
        `❌ API call failed: ${statsResponse.status} ${statsResponse.statusText}`
      );
      console.error("Response:", errorText);
      return;
    }

    const statsData = await statsResponse.json();

    if (statsData.success) {
      console.log("✅ Overview stats API call successful!");
      console.log("📋 Stats received:");
      console.log(`   - Total Patients: ${statsData.data.totalPatients}`);
      console.log(`   - Total Staff: ${statsData.data.totalStaff}`);
      console.log(
        `   - Total Appointments: ${statsData.data.totalAppointments}`
      );
      console.log(`   - Total Records: ${statsData.data.totalRecords}`);
      console.log(
        `   - Today's Appointments: ${statsData.data.todaysAppointments}`
      );
      console.log(
        `   - Pending Appointments: ${statsData.data.pendingAppointments}`
      );
      console.log(
        `   - Completed Appointments: ${statsData.data.completedAppointments}`
      );
      console.log(
        `   - Cancelled Appointments: ${statsData.data.cancelledAppointments}`
      );
      console.log(
        `   - Recent Notifications: ${statsData.data.recentNotifications}`
      );
    } else {
      console.error("❌ API returned success=false:", statsData);
    }
  } catch (error) {
    console.error("❌ Server API test failed:", error.message);
  }
}

testServerAPI();
