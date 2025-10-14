import { createClient } from "@supabase/supabase-js";

// Use the same configuration as the app
const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminStatus() {
  console.log("🔍 Checking admin user status...\n");

  try {
    // Check Users table with role information
    console.log("📋 Checking Users table with role details...");
    const { data: users, error: usersError } = await supabase.from("Users")
      .select(`
        UserID,
        Username,
        Email,
        RoleID,
        Role:RoleID(RoleName)
      `);

    if (usersError) {
      console.error("❌ Error accessing Users table:", usersError);
    } else {
      console.log("✅ Users found:", users.length);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.Username} (${user.Email})`);
        console.log(`      UserID: ${user.UserID}`);
        console.log(`      RoleID: ${user.RoleID}`);
        console.log(`      Role: ${user.Role?.RoleName || "undefined"}`);
      });
    }

    // Try to sign in with admin credentials to test
    console.log("\n🔐 Testing admin login...");
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: "admin@baankm3clinic.ph",
        password: "admin123",
      });

    if (loginError) {
      console.error("❌ Login failed:", loginError.message);
    } else {
      console.log("✅ Login successful!");
      console.log("   User ID:", loginData.user.id);
      console.log("   Email:", loginData.user.email);

      // Check if this matches our database user
      const dbUser = users?.find((u) => u.Email === loginData.user.email);
      if (dbUser) {
        console.log("✅ Auth user matches database user");
        if (dbUser.UserID === loginData.user.id) {
          console.log("✅ UserID matches!");
        } else {
          console.log("❌ UserID mismatch!");
          console.log(`   Auth UserID: ${loginData.user.id}`);
          console.log(`   DB UserID: ${dbUser.UserID}`);
        }
      } else {
        console.error("❌ No matching user found in database");
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

checkAdminStatus();
