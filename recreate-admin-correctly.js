import { createClient } from "@supabase/supabase-js";

// Use the same configuration as the app
const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function recreateAdminCorrectly() {
  console.log("🔄 Recreating admin user correctly...\n");

  try {
    // First, delete any existing admin user from the database
    console.log("🗑️ Deleting existing admin user from database...");
    const { error: deleteError } = await supabase
      .from("Users")
      .delete()
      .eq("Username", "admin");

    if (deleteError) {
      console.error("❌ Error deleting existing admin:", deleteError);
    } else {
      console.log("✅ Existing admin deleted from database");
    }

    // Sign in to get the auth user ID
    console.log("🔐 Signing in to get auth user ID...");
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: "admin@baankm3clinic.ph",
        password: "admin123",
      });

    if (loginError) {
      console.error("❌ Login failed:", loginError.message);
      return;
    }

    const correctUserId = loginData.user.id;
    console.log("✅ Got correct UserID from Auth:", correctUserId);

    // Create the admin user in the database with the correct UserID
    console.log("👤 Creating admin user in database with correct UserID...");
    const { data: insertData, error: insertError } = await supabase
      .from("Users")
      .insert({
        UserID: correctUserId,
        Username: "admin",
        Password: "admin123",
        Email: "admin@baankm3clinic.ph",
        RoleID: 1,
        CreatedAt: new Date().toISOString(),
        FirstLogin: true,
      })
      .select();

    if (insertError) {
      console.error("❌ Error creating admin in database:", insertError);
      console.log("ℹ️ This might be because the UserID column is INTEGER type");
      console.log("ℹ️ Trying with integer UserID...");

      // Try with integer UserID (this shouldn't work but let's see)
      const { error: intError } = await supabase.from("Users").insert({
        UserID: 1,
        Username: "admin",
        Password: "admin123",
        Email: "admin@baankm3clinic.ph",
        RoleID: 1,
        CreatedAt: new Date().toISOString(),
        FirstLogin: true,
      });

      if (intError) {
        console.error("❌ Also failed with integer UserID:", intError);
        console.log("❌ Need to fix the database schema manually");
      } else {
        console.log("✅ Worked with integer UserID (unexpected!)");
      }
    } else {
      console.log("✅ Admin user created successfully!");
      console.log("📋 Created record:", insertData[0]);
    }

    // Final verification
    console.log("\n🔍 Final verification...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("Users")
      .select(
        `
        UserID,
        Username,
        Email,
        RoleID,
        Role:RoleID(RoleName)
      `
      )
      .eq("Username", "admin")
      .single();

    if (verifyError) {
      console.error("❌ Error verifying:", verifyError);
    } else {
      console.log("✅ Verification successful:");
      console.log("   UserID:", verifyData.UserID);
      console.log("   Username:", verifyData.Username);
      console.log("   Email:", verifyData.Email);
      console.log("   Role:", verifyData.Role?.RoleName);

      if (verifyData.UserID === correctUserId) {
        console.log("✅ UserID matches Auth user!");
        console.log("🎉 Admin login should now work!");
      } else {
        console.error("❌ UserID still doesn't match");
        console.log("❌ Need manual database schema fix");
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

recreateAdminCorrectly();
