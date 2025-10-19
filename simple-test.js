import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Supabase client
const supabaseUrl =
  process.env.SUPABASE_URL || "https://your-project.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "your-anon-key";

const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleTest() {
  try {
    console.log("Testing direct Supabase connection...");

    // Test 1: Check if Role table exists and get data
    console.log("\n1. Testing Role table...");
    const { data: roles, error: rolesError } = await supabase
      .from("Role")
      .select("*")
      .order("RoleID");

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
      return;
    }

    console.log("Roles:", roles);

    // Test 2: Try to insert a test user
    console.log("\n2. Testing user insertion...");
    const testUser = {
      UserID: `test-${Date.now()}`,
      Username: `testuser${Date.now()}`,
      Password: "testpass123",
      Email: `test${Date.now()}@example.com`,
      RoleID: 1, // Use integer directly
    };

    console.log("Inserting user:", testUser);

    const { data: newUser, error: insertError } = await supabase
      .from("Users")
      .insert(testUser)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting user:", insertError);
      return;
    }

    console.log("User inserted successfully:", newUser);
  } catch (error) {
    console.error("Test error:", error);
  }
}

simpleTest();
