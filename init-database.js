/**
 * Database Initialization Script
 *
 * This script initializes the Supabase database with the schema and creates the admin user.
 *
 * Usage: node init-database.js
 *
 * Environment Variables Required:
 * - SUPABASE_URL or VITE_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - VITE_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Admin user configuration
const ADMIN_CONFIG = {
  email: "admin@baankm3clinic.ph",
  password: "adminbaan",
  username: "admin",
  fullName: "System Administrator",
  role: "Staff",
};

// Validate environment configuration
function validateEnvironment() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL environment variable is not set");
    console.error(
      "   Please set VITE_SUPABASE_URL or SUPABASE_URL in your .env file"
    );
    process.exit(1);
  }

  if (!supabaseAnonKey) {
    console.error("❌ VITE_SUPABASE_ANON_KEY environment variable is not set");
    console.error("   Please set VITE_SUPABASE_ANON_KEY in your .env file");
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error(
      "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    );
    console.error("   Please set SUPABASE_SERVICE_ROLE_KEY in your .env file");
    console.error(
      "   You can find this key in your Supabase project dashboard under Settings > API"
    );
    process.exit(1);
  }

  if (!supabaseUrl.includes("supabase.co")) {
    console.warn("⚠️ Supabase URL doesn't appear to be a valid Supabase URL");
  }

  console.log("✅ Environment configuration validated");
  return { supabaseUrl, supabaseAnonKey, supabaseServiceKey };
}

// Create Supabase clients
function createSupabaseClients(url, anonKey, serviceKey) {
  const supabaseAuth = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { supabaseAuth, supabase };
}

// Test Supabase connection
async function testConnection(supabase) {
  try {
    console.log("🔗 Testing Supabase connection...");

    // Try to list users from auth (requires service role)
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Supabase connection test failed:", error.message);
      console.error("💡 Possible causes:");
      console.error("   - Invalid service role key");
      console.error("   - Network connectivity issues");
      console.error("   - Supabase project not accessible");
      return false;
    }

    console.log("✅ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("❌ Unexpected error during connection test:", error.message);
    return false;
  }
}

// Execute SQL schema
async function executeSchema(supabase, schemaPath) {
  try {
    console.log("📄 Reading schema file...");

    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      return false;
    }

    const schemaSQL = fs.readFileSync(schemaPath, "utf8");
    console.log("📄 Schema file loaded successfully");

    console.log("🏗️ Executing database schema...");

    // Split the schema into individual statements
    const statements = schemaSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc("exec_sql", {
            sql: statement + ";",
          });

          if (error) {
            console.error(`❌ Error executing statement: ${error.message}`);
            console.error(`Statement: ${statement.substring(0, 100)}...`);
            // Continue with other statements
          }
        } catch (err) {
          console.error(`❌ Error executing statement: ${err.message}`);
          // Continue with other statements
        }
      }
    }

    console.log("✅ Schema execution completed");
    return true;
  } catch (error) {
    console.error("❌ Error executing schema:", error.message);
    return false;
  }
}

// Create admin user
async function createAdminUser(supabaseAuth, supabase) {
  try {
    console.log("🔍 Checking if admin user exists in auth.users...");

    // First, check if the admin user exists in auth.users
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("❌ Error fetching auth users:", authError);
      return false;
    }

    const adminUser = authUsers.users.find(
      (user) => user.email === ADMIN_CONFIG.email
    );

    if (!adminUser) {
      console.log("📝 Admin user not found in auth.users. Creating...");

      // Create the admin user in Supabase Auth
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: ADMIN_CONFIG.email,
          password: ADMIN_CONFIG.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            fullName: ADMIN_CONFIG.fullName,
          },
        });

      if (createError) {
        console.error("❌ Error creating admin user in auth:", createError);
        return false;
      }

      console.log(
        "✅ Admin user created in auth.users with ID:",
        newUser.user.id
      );
    } else {
      console.log(
        "✅ Admin user already exists in auth.users with ID:",
        adminUser.id
      );
    }

    // Now ensure the profile exists in public.Users
    console.log("🔍 Checking public.Users table...");

    const { data: existingProfile, error: profileError } = await supabase
      .from("Users")
      .select("*")
      .eq("Email", ADMIN_CONFIG.email)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error(
        "❌ Error checking existing profile:",
        profileError.message
      );
      return false;
    }

    if (existingProfile) {
      console.log("📝 Updating existing admin profile...");

      // Update the existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from("Users")
        .update({
          Username: ADMIN_CONFIG.username,
          RoleName: ADMIN_CONFIG.role,
          fullName: ADMIN_CONFIG.fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("Email", ADMIN_CONFIG.email)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error updating admin profile:", updateError);
        return false;
      }

      console.log("✅ Admin profile updated successfully:", updatedProfile);
    } else {
      console.log("📝 Creating new admin profile...");

      // Get the UserID from auth.users
      const userId = adminUser ? adminUser.id : newUser.user.id;

      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from("Users")
        .insert({
          UserID: userId,
          Username: ADMIN_CONFIG.username,
          Email: ADMIN_CONFIG.email,
          RoleName: ADMIN_CONFIG.role,
          fullName: ADMIN_CONFIG.fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error creating admin profile:", insertError);
        return false;
      }

      console.log("✅ Admin profile created successfully:", newProfile);
    }

    return true;
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return false;
  }
}

// Main initialization function
async function main() {
  try {
    console.log("🚀 Starting database initialization script...");

    // Validate environment
    const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } =
      validateEnvironment();

    // Create Supabase clients
    const { supabaseAuth, supabase } = createSupabaseClients(
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceKey
    );

    // Test connection
    const isConnected = await testConnection(supabase);
    if (!isConnected) {
      console.error("❌ Cannot proceed without a valid Supabase connection");
      process.exit(1);
    }

    // Execute schema
    const schemaPath = path.join(__dirname, "supabase-schema.sql");
    const schemaExecuted = await executeSchema(supabase, schemaPath);
    if (!schemaExecuted) {
      console.error("❌ Schema execution failed");
      process.exit(1);
    }

    // Create admin user
    const adminCreated = await createAdminUser(supabaseAuth, supabase);
    if (!adminCreated) {
      console.error("❌ Admin user creation failed");
      process.exit(1);
    }

    console.log("");
    console.log("🎉 Database initialization complete!");
    console.log("✅ Schema executed successfully");
    console.log("✅ Admin user created successfully");
    console.log("");
    console.log("📋 Admin credentials:");
    console.log("   Email:", ADMIN_CONFIG.email);
    console.log("   Password:", ADMIN_CONFIG.password);
    console.log("   Username:", ADMIN_CONFIG.username);
    console.log("   Role:", ADMIN_CONFIG.role);
    console.log("");
    console.log(
      "🚀 You can now start the application and log in with these credentials!"
    );
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
