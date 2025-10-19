import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Supabase client
const supabaseUrl =
  process.env.SUPABASE_URL || "https://your-project.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "your-anon-key";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log("Checking database schema...");

    // Check if we can query the Role table structure
    console.log("\n1. Checking Role table...");
    const { data: roles, error: rolesError } = await supabase
      .from("Role")
      .select("*")
      .limit(1);

    if (rolesError) {
      console.error("Error querying Role table:", rolesError);
    } else {
      console.log("Role table exists and is accessible");
      console.log("Sample role data:", roles);
    }

    // Check if we can query the Users table structure
    console.log("\n2. Checking Users table...");
    const { data: users, error: usersError } = await supabase
      .from("Users")
      .select("*")
      .limit(1);

    if (usersError) {
      console.error("Error querying Users table:", usersError);
      console.log(
        "This might mean the Users table doesn't exist or has schema issues"
      );
    } else {
      console.log("Users table exists and is accessible");
      console.log("Sample user data:", users);
    }

    // Try to get table information using a raw query
    console.log("\n3. Checking table structure with raw SQL...");
    const { data: tableInfo, error: tableError } = await supabase.rpc(
      "get_table_info",
      {
        table_name: "Users",
      }
    );

    if (tableError) {
      console.log(
        "Could not get table info (this is expected if RPC doesn't exist)"
      );
    } else {
      console.log("Table info:", tableInfo);
    }
  } catch (error) {
    console.error("Schema check error:", error);
  }
}

checkSchema();
