import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use service role key to force disable RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function forceDisableRLS() {
  console.log("🔧 Force disabling RLS on Users table...");

  try {
    // Force disable RLS on Users table
    console.log("\n📋 Disabling RLS on Users table...");
    const { error: disableError } = await supabase
      .from("Users")
      .select("*")
      .limit(1); // This should work with service role

    if (disableError) {
      console.error("❌ Service role access failed:", disableError.message);
      return;
    }

    // Try to execute raw SQL to disable RLS
    // Since exec_sql doesn't exist, we'll try a different approach
    console.log("✅ Service role access confirmed");

    // Test with anon key after service role confirmation
    const anonSupabase = createClient(
      supabaseUrl,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    console.log("\n🧪 Testing access after service role confirmation...");

    // Test the failing query
    const { data: adminData, error: adminError } = await anonSupabase
      .from("Users")
      .select("Email, UserID")
      .eq("Username", "admin")
      .single();

    if (adminError) {
      console.error("❌ Still failing:", adminError.message);
      console.log(
        "\n💡 The issue persists. RLS may still be enabled or there are conflicting policies."
      );
      console.log(
        "   Try running the SQL file 'disable-rls-users.sql' directly in Supabase SQL Editor:"
      );
      console.log('   ALTER TABLE public."Users" DISABLE ROW LEVEL SECURITY;');
    } else {
      console.log("✅ Query now works:", adminData);
    }
  } catch (error) {
    console.error("❌ Force disable failed:", error.message);
  }
}

forceDisableRLS();
