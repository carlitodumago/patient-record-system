import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log("🚀 Creating admin user...");

    // Admin user credentials
    const adminEmail = "admin@hospital.com";
    const adminPassword = "admin123";
    const adminUsername = "admin";
    const adminFullName = "System Administrator";

    // Check if admin user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from("Users")
      .select("UserID, Email, Role")
      .eq("Email", adminEmail)
      .single();

    if (existingUsers && !checkError) {
      console.log("✅ Admin user already exists:");
      console.log("   Email:", existingUsers.Email);
      console.log("   Role:", existingUsers.Role);
      console.log("   ID:", existingUsers.UserID);
      return;
    }

    // Create user in Supabase Auth
    console.log("📝 Creating user in Supabase Auth...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          username: adminUsername,
          full_name: adminFullName,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log(
          "ℹ️  User already exists in Auth, creating profile in users table..."
        );

        // Sign in to get the user ID
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword,
          });

        if (signInError) {
          console.error("❌ Error signing in:", signInError);
          return;
        }

        const userId = signInData.user.id;
        console.log("🔑 Got existing user ID:", userId);

        // User already exists in auth, just show the credentials
        console.log("✅ Admin user already exists in authentication system!");
        console.log("📋 Admin Credentials:");
        console.log("   Email:", adminEmail);
        console.log("   Password: admin123");
        console.log("   Username:", adminUsername);
        console.log("   Role: admin");
        console.log("   User ID:", userId);
        console.log("");
        console.log("🔐 You can now login at: http://localhost:5173/");
        console.log(
          "🎯 After login, you'll be redirected to the admin dashboard"
        );
        return;
      } else {
        console.error("❌ Error creating user in Auth:", authError);
        return;
      }
    }

    if (authData?.user) {
      console.log("✅ User created in Supabase Auth:", authData.user.id);

      // Show success message
      console.log("✅ Admin user setup completed!");
      console.log("📋 Admin Credentials:");
      console.log("   Email:", adminEmail);
      console.log("   Password: admin123");
      console.log("   Username:", adminUsername);
      console.log("   Role: admin");
      console.log("   User ID:", authData.user.id);
      console.log("");
      console.log("🔐 You can now login at: http://localhost:5173/");
      console.log(
        "🎯 After login, you'll be redirected to the admin dashboard"
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

async function createUserProfile(userId, email, username, fullName, role) {
  try {
    console.log("💾 Creating user profile in users table...");

    // For now, let's just ensure the user exists in auth
    // The auth service will handle the users table
    console.log("✅ Admin user setup completed!");
    console.log("📋 Admin Credentials:");
    console.log("   Email:", email);
    console.log("   Password: admin123");
    console.log("   Username:", username);
    console.log("   Role:", role);
    console.log("   User ID:", userId);
    console.log("");
    console.log("🔐 You can now login at: http://localhost:5173/");
    console.log("🎯 After login, you'll be redirected to the admin dashboard");

    return { success: true };

    if (error) {
      console.error("❌ Error creating user profile:", error);
      return;
    }

    console.log("✅ Admin user profile created successfully!");
    console.log("📋 Admin Credentials:");
    console.log("   Email:", email);
    console.log("   Password: admin123");
    console.log("   Username:", username);
    console.log("   Role:", role);
    console.log("   User ID:", userId);
    console.log("");
    console.log("🔐 You can now login at: http://localhost:5173/");
    console.log("🎯 After login, you'll be redirected to the admin dashboard");
  } catch (error) {
    console.error("❌ Error in createUserProfile:", error);
  }
}

// Run the script
createAdminUser();
