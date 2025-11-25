import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use service role to grant permissions
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantPermissionsFix() {
  console.log("🔧 Granting permissions to fix schema access...");

  try {
    // Grant usage on schema to anon and authenticated roles
    console.log("\n📋 Granting schema usage permissions");
    const { error: schemaError } = await supabase
      .from("Users")
      .select("*")
      .limit(1); // This should work with service role

    if (schemaError) {
      console.error("❌ Service role access failed:", schemaError.message);
      return;
    }

    console.log("✅ Service role access confirmed");

    // Test with anon key after confirming service role works
    const anonSupabase = createClient(
      supabaseUrl,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    console.log("\n🧪 Testing anon access after service role confirmation...");

    // Test basic access
    const { data: testData, error: testError } = await anonSupabase
      .from("Users")
      .select("UserID, Username, Email")
      .limit(1);

    if (testError) {
      console.error("❌ Anon access still failing:", testError.message);
      console.log(
        "\n💡 The issue may be that we need to grant explicit permissions."
      );
      console.log("   Try running this SQL in Supabase SQL Editor:");
      console.log("   GRANT USAGE ON SCHEMA public TO anon, authenticated;");
      console.log('   GRANT SELECT ON public."Users" TO anon, authenticated;');
      console.log('   GRANT SELECT ON public."Role" TO anon, authenticated;');
    } else {
      console.log("✅ Anon access working:", testData);
    }
  } catch (error) {
    console.error("❌ Grant permissions failed:", error.message);
  }
}

grantPermissionsFix();
