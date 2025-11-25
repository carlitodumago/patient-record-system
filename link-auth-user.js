import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function linkAuthUser() {
  try {
    console.log("🔗 Linking Supabase Auth user to Users table...");

    // First, get the Supabase Auth user
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: "admin@baankm3clinic.ph",
        password: "adminbaan",
      });

    if (authError) {
      console.error("❌ Error signing in:", authError);
      return false;
    }

    const authUserId = authData.user.id;
    console.log("🆔 Supabase Auth User ID:", authUserId);

    // Check current Users table record
    const { data: existingUsers, error: checkError } = await supabase
      .from("Users")
      .select("*")
      .eq("Username", "admin");

    if (checkError) {
      console.error("❌ Error checking users:", checkError);
      return false;
    }

    console.log("📊 Current admin users:", existingUsers);

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log("🔄 Current UserID in database:", existingUser.UserID);
      console.log("🎯 Target Auth UserID:", authUserId);

      // Try to update the Users table record to use the Auth UUID
      console.log("🔄 Attempting to update UserID to match Auth user...");
      const { data: updateData, error: updateError } = await supabase
        .from("Users")
        .update({
          UserID: authUserId, // Try using the UUID
          Email: "admin@baankm3clinic.ph",
          Username: "admin",
          RoleID: 1,
        })
        .eq("Username", "admin")
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error updating user:", updateError);

        // If UUID doesn't work, try a different approach
        console.log("🔄 Trying alternative approach...");

        // Check if we can insert a new record with the UUID
        const { data: insertData, error: insertError } = await supabase
          .from("Users")
          .insert({
            UserID: authUserId,
            Email: "admin@baankm3clinic.ph",
            Username: "admin",
            RoleID: 1,
            CreatedAt: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error("❌ Error inserting with UUID:", insertError);
          console.log(
            "💡 The database schema likely doesn't accept UUIDs for UserID"
          );
          console.log(
            "🔧 Need to modify the database schema or application logic"
          );
          return false;
        } else {
          console.log(
            "✅ Successfully created Users record with UUID:",
            insertData
          );
        }
      } else {
        console.log(
          "✅ Successfully updated Users record with UUID:",
          updateData
        );
      }
    } else {
      console.log("❌ No existing admin user found in Users table");
      return false;
    }

    return true;
  } catch (error) {
    console.error("💥 Error:", error);
    return false;
  }
}

linkAuthUser()
  .then((success) => {
    if (success) {
      console.log("\n✅ Auth user linking completed!");
    } else {
      console.log("\n❌ Auth user linking failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n💥 Error:", error);
    process.exit(1);
  });
