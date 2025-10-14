import { createClient } from "@supabase/supabase-js";

// Use the same configuration as the app
const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserIdMismatch() {
  console.log("🔧 Fixing UserID mismatch...\n");

  try {
    // First, sign in to get the correct auth user ID
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

    // Update the database record with the correct UserID
    const { data: updateData, error: updateError } = await supabase
      .from("Users")
      .update({ UserID: correctUserId })
      .eq("Email", "admin@baankm3clinic.ph")
      .select();

    if (updateError) {
      console.error("❌ Error updating UserID:", updateError);
    } else {
      console.log("✅ UserID updated successfully!");
      console.log("📋 Updated record:", updateData[0]);
    }

    // Verify the fix
    console.log("\n🔍 Verifying the fix...");
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
      .eq("Email", "admin@baankm3clinic.ph")
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
        console.log("✅ UserID now matches Auth user!");
      } else {
        console.error("❌ UserID still doesn't match");
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

fixUserIdMismatch();
