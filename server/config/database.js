import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl =
  process.env.SUPABASE_URL || "https://your-project.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "your-anon-key";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Test the connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("Role")
      .select("count")
      .limit(1);

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "table doesn't exist" error
      console.error("Supabase connection error:", error);
      return false;
    }

    console.log("Supabase connection has been established successfully.");
    return true;
  } catch (error) {
    console.error("Unable to connect to Supabase:", error);
    return false;
  }
};

// Helper function to handle Supabase responses
export const handleSupabaseResponse = (response) => {
  if (response.error) {
    // Enhanced error handling with more context
    const error = new Error(response.error.message);
    error.code = response.error.code;
    error.details = response.error.details;
    error.hint = response.error.hint;
    error.status = response.status;
    throw error;
  }
  return response.data;
};

// Initialize database tables if they don't exist
export const initializeTables = async () => {
  try {
    // Check if tables exist by trying to query them
    const { data, error } = await supabase
      .from("Role")
      .select("count")
      .limit(1);

    if (error && error.code === "PGRST116") {
      console.log(
        "Tables do not exist. Please create the tables in Supabase first."
      );
      console.log("See DATABASE_SETUP.md for the SQL script.");
      return false;
    }

    console.log("Database tables are ready.");
    return true;
  } catch (error) {
    console.error("Error checking tables:", error);
    return false;
  }
};

export default supabase;
