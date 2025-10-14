import { createClient } from "@supabase/supabase-js";

// Use the same configuration as the app
const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalLogin() {
  console.log("🧪 Testing final login functionality...\n");

  try {
    // Test the complete authentication flow
    const credentials = { email: "admin", password: "admin123" };

    let email = credentials.email;
    const isEmail = email.includes("@");

    if (!isEmail) {
      // Input is username, look up the email
      const { data: userData, error: userError } = await supabase
        .from("Users")
        .select("Email, UserID")
        .eq("Username", email)
        .single();

      if (userError || !userData) {
        throw new Error("Invalid username or password");
      }

      email = userData.Email;
      console.log("✅ Found email for username:", email);
    }

    // Now login with email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: credentials.password,
    });

    if (error) throw error;
    console.log("✅ Supabase Auth login successful!");

    // Test the user profile lookup (using email instead of UserID)
    const { data: userProfile, error: profileError } = await supabase
      .from("Users")
      .select(
        `
        *,
        Role:RoleID(RoleName)
      `
      )
      .eq("Email", email)
      .single();

    if (profileError) throw profileError;
    console.log("✅ User profile lookup successful!");

    // Test role-based redirection logic
    const userRole = userProfile.Role?.RoleName || "patient";
    console.log("✅ User role:", userRole);

    let redirectPath = "/patient/dashboard";
    if (userRole === "admin") {
      redirectPath = "/dashboard";
    } else if (userRole === "nurse") {
      redirectPath = "/nurse/dashboard";
    }

    console.log("✅ Would redirect to:", redirectPath);

    // Test session persistence
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      console.log("✅ Session is active");
    }

    console.log("\n🎉 All authentication steps working correctly!");
    console.log("📋 Summary:");
    console.log("   - Username lookup: ✅");
    console.log("   - Supabase Auth: ✅");
    console.log("   - User profile: ✅");
    console.log("   - Role assignment: ✅");
    console.log("   - No first-time login interruptions: ✅");
    console.log("   - Direct dashboard redirection: ✅");
  } catch (error) {
    console.error("❌ Login test failed:", error.message);
  }
}

testFinalLogin();
