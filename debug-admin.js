import { createClient } from "@supabase/supabase-js";

// Use the same configuration as the app
const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDatabase() {
  console.log("🔍 Debugging Supabase Database...\n");

  try {
    // Check if users table exists and list all users
    console.log("📋 Checking users table...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*");

    if (usersError) {
      console.error("❌ Error accessing users table:", usersError.message);
      console.log("❌ Users table might not exist or have different structure");

      // Try the capitalized version
      console.log("📋 Trying Users table (capitalized)...");
      const { data: usersCaps, error: usersCapsError } = await supabase
        .from("Users")
        .select("*");

      if (usersCapsError) {
        console.error(
          "❌ Error accessing Users table:",
          usersCapsError.message
        );
      } else {
        console.log("✅ Users table found!");
        console.log("📊 Users in database:", usersCaps.length);
        usersCaps.forEach((user, index) => {
          console.log(
            `   ${index + 1}. ${user.Username || user.username} (${
              user.Email || user.email
            }) - Role: ${user.Role || user.role}`
          );
        });
      }
    } else {
      console.log("✅ Users table found!");
      console.log("📊 Users in database:", users.length);
      users.forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.username} (${user.email}) - Role: ${
            user.role
          }`
        );
      });
    }

    // Check Supabase Auth users
    console.log("\n🔐 Checking Supabase Auth users...");
    const {
      data: { users: authUsers },
      error: authError,
    } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("❌ Error accessing auth users:", authError.message);
    } else {
      console.log("✅ Auth users found:", authUsers.length);
      authUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - ID: ${user.id}`);
      });
    }

    // Try to find admin user specifically
    console.log("\n🔍 Looking for admin user...");
    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("*")
      .eq("username", "admin")
      .single();

    if (adminError) {
      console.error(
        "❌ Admin user not found in users table:",
        adminError.message
      );
    } else {
      console.log("✅ Admin user found in users table:");
      console.log("   ID:", adminUser.id);
      console.log("   Username:", adminUser.username);
      console.log("   Email:", adminUser.email);
      console.log("   Role:", adminUser.role);
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

debugDatabase();
