import { createClient } from "@supabase/supabase-js";

// Use the same configuration as the app
const supabaseUrl = "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseSchema() {
  console.log("🔧 Fixing database schema...\n");

  try {
    // First, let's check the current schema
    console.log("📋 Checking current Users table schema...");

    // Try to describe the table (this might not work with Supabase, but let's try)
    const { data: schemaData, error: schemaError } = await supabase
      .rpc("describe_table", { table_name: "Users" })
      .single();

    if (schemaError) {
      console.log(
        "ℹ️ Cannot describe table directly, checking with a test query..."
      );
    }

    // Check if we can insert a UUID into UserID
    const { data: loginData } = await supabase.auth.signInWithPassword({
      email: "admin@baankm3clinic.ph",
      password: "admin123",
    });

    const testUuid = loginData.user.id;
    console.log("✅ Test UUID:", testUuid);

    // Try to update with the UUID (this will fail if column is INTEGER)
    const { error: updateError } = await supabase
      .from("Users")
      .update({ UserID: testUuid })
      .eq("Email", "admin@baankm3clinic.ph");

    if (updateError) {
      console.log("❌ UserID column is INTEGER, need to recreate table");

      // Create a backup of the current user data
      const { data: backupData, error: backupError } = await supabase
        .from("Users")
        .select("*")
        .eq("Email", "admin@baankm3clinic.ph");

      if (backupError) {
        console.error("❌ Cannot backup user data:", backupError);
        return;
      }

      console.log("✅ Backed up user data:", backupData[0]);

      // Delete the current record
      const { error: deleteError } = await supabase
        .from("Users")
        .delete()
        .eq("Email", "admin@baankm3clinic.ph");

      if (deleteError) {
        console.error("❌ Cannot delete old record:", deleteError);
        return;
      }

      // Insert with correct UUID
      const { error: insertError } = await supabase.from("Users").insert({
        UserID: testUuid,
        Username: "admin",
        Password: "admin123",
        Email: "admin@baankm3clinic.ph",
        RoleID: 1,
        CreatedAt: new Date().toISOString(),
      });

      if (insertError) {
        console.error("❌ Error inserting with UUID:", insertError);
      } else {
        console.log("✅ Successfully inserted admin with UUID UserID!");

        // Verify the fix
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
          console.log("   Role:", verifyData.Role?.RoleName);

          if (verifyData.UserID === testUuid) {
            console.log("✅ UserID now matches Auth user!");
          }
        }
      }
    } else {
      console.log("✅ UserID column accepts UUID, update successful!");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

fixDatabaseSchema();
