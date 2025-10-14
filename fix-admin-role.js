import { createClient } from "@supabase/supabase-js";

// Use the same configuration as the app
const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdminRole() {
  console.log("🔧 Fixing admin user role...");

  try {
    // First, ensure the Role table has the admin role
    const { data: roleData, error: roleError } = await supabase
      .from("Role")
      .upsert({ RoleName: "admin" }, { onConflict: "RoleName" })
      .select("RoleID")
      .single();

    if (roleError) {
      console.error("❌ Error with Role table:", roleError);
      return;
    }

    console.log("✅ Admin role ID:", roleData.RoleID);

    // Update the admin user's RoleID
    const { data, error } = await supabase
      .from("Users")
      .update({ RoleID: roleData.RoleID })
      .eq("Username", "admin")
      .select();

    if (error) {
      console.error("❌ Error updating admin RoleID:", error);
      return;
    }

    console.log("✅ Admin RoleID updated successfully!");
    console.log("📋 Updated users:", data);

    // Verify the fix
    const { data: verifyData, error: verifyError } = await supabase
      .from("Users")
      .select("Username, Email, RoleID")
      .eq("Username", "admin")
      .single();

    if (verifyError) {
      console.error("❌ Error verifying admin user:", verifyError);
    } else {
      console.log("✅ Verification successful:");
      console.log("   Username:", verifyData.Username);
      console.log("   Email:", verifyData.Email);
      console.log("   RoleID:", verifyData.RoleID);
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

fixAdminRole();
