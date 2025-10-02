import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkAdminAccount() {
  try {
    console.log("Checking admin account...");

    // List all users
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error listing users:", error);
      return;
    }

    console.log(`Found ${users.users.length} users:`);

    users.users.forEach((user) => {
      console.log(`- Email: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Created: ${user.created_at}`);
      console.log(
        `  Email Confirmed: ${user.email_confirmed_at ? "Yes" : "No"}`
      );
      console.log(`  User Metadata:`, user.user_metadata);
      console.log("---");
    });

    // Check specifically for admin account
    const adminUser = users.users.find(
      (user) => user.email === "admin@patientrecord.system"
    );

    if (adminUser) {
      console.log("✅ Admin account found!");
      console.log("Admin details:");
      console.log(`- Email: ${adminUser.email}`);
      console.log(`- ID: ${adminUser.id}`);
      console.log(
        `- Email Confirmed: ${adminUser.email_confirmed_at ? "Yes" : "No"}`
      );
      console.log(`- User Metadata:`, adminUser.user_metadata);
    } else {
      console.log("❌ Admin account not found");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the script
checkAdminAccount();
