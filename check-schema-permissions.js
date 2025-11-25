import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use service role to check schema permissions
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchemaPermissions() {
  console.log("🔍 Checking schema permissions...");

  try {
    // Check if public schema exists and is accessible
    console.log("\n📋 Checking public schema access");
    const { data: schemaData, error: schemaError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'public';`,
      }
    );

    if (schemaError) {
      console.error("❌ Schema check failed:", schemaError.message);
    } else {
      console.log("✅ Public schema exists:", schemaData);
    }

    // Check table permissions
    console.log("\n📋 Checking table permissions");
    const { data: tableData, error: tableError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('Users', 'Role');`,
      }
    );

    if (tableError) {
      console.error("❌ Table check failed:", tableError.message);
    } else {
      console.log("✅ Tables exist:", tableData);
    }

    // Check RLS status
    console.log("\n📋 Checking RLS status");
    const { data: rlsData, error: rlsError } = await supabase.rpc("exec_sql", {
      sql: `SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('Users', 'Role');`,
    });

    if (rlsError) {
      console.error("❌ RLS check failed:", rlsError.message);
    } else {
      console.log("✅ RLS status:", rlsData);
    }

    // Check grants
    console.log("\n📋 Checking grants");
    const { data: grantData, error: grantError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `SELECT grantee, privilege_type, table_name FROM information_schema.role_table_grants WHERE table_schema = 'public' AND table_name IN ('Users', 'Role') AND grantee IN ('anon', 'authenticated');`,
      }
    );

    if (grantError) {
      console.error("❌ Grant check failed:", grantError.message);
    } else {
      console.log("✅ Grants:", grantData);
    }
  } catch (error) {
    console.error("❌ Check failed:", error.message);
  }
}

checkSchemaPermissions();
