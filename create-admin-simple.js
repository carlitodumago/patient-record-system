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

async function createAdminSimple() {
  try {
    console.log("🚀 Creating admin user with simple approach...");

    // First, let's check what the next UserID should be
    const { data: existingUsers, error: checkError } = await supabase
      .from("Users")
      .select("UserID")
      .order("UserID", { ascending: false })
      .limit(1);

    if (checkError) {
      console.error("❌ Error checking existing users:", checkError);
      return false;
    }

    // Use next integer ID
    const nextUserId =
      existingUsers.length > 0 ? parseInt(existingUsers[0].UserID) + 1 : 1;

    console.log("🔢 Next UserID will be:", nextUserId);

    // Create user record in Users table
    const { data: newUser, error: insertError } = await supabase
      .from("Users")
      .insert({
        UserID: nextUserId,
        Username: "admin",
        Password: "adminbaan", // This should be hashed in real implementation
        Email: "admin@baankm3clinic.ph",
        RoleID: 1, // admin role
        CreatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Error creating user:", insertError);
      return false;
    }

    console.log("✅ Admin user created successfully:", newUser);
    console.log("📧 Email: admin@baankm3clinic.ph");
    console.log("🔑 Password: adminbaan");
    console.log("👤 Username: admin");
    console.log("🆔 UserID:", newUser.UserID);

    return true;
  } catch (error) {
    console.error("💥 Error:", error);
    return false;
  }
}

createAdminSimple()
  .then((success) => {
    if (success) {
      console.log("\n✅ Admin user creation completed!");
    } else {
      console.log("\n❌ Admin user creation failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n💥 Error:", error);
    process.exit(1);
  });
