#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

console.log("🚀 Starting simple admin login test...");
console.log(`URL: ${supabaseUrl.substring(0, 50)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleLogin() {
  try {
    console.log("🔐 Attempting login...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@baankm3clinic.ph",
      password: "adminbaan",
    });

    if (error) {
      console.error("❌ Login failed:", error.message);
      return { success: false, error: error.message };
    }

    console.log("✅ Login successful!");
    console.log(`👤 User: ${data.user.email}`);
    console.log(
      `🔑 Session valid until: ${new Date(
        data.session.expires_at * 1000
      ).toISOString()}`
    );

    // Test network connectivity
    console.log("🌐 Testing network connectivity...");
    const response = await fetch(supabaseUrl, { method: "HEAD" });
    console.log(`✅ Network: HTTP ${response.status}`);

    // Test role verification (optional)
    console.log("👤 Checking user role...");
    try {
      const { data: roleData, error: roleError } = await supabase
        .from("Users")
        .select("Role(RoleName)")
        .eq("UserID", data.user.id)
        .single();

      if (roleError && roleError.code !== "PGRST116") {
        console.log(`⚠️ Role check warning: ${roleError.message}`);
      } else if (roleData?.Role?.RoleName) {
        console.log(`✅ Role: ${roleData.Role.RoleName}`);
      } else {
        console.log("ℹ️ No role found (user may not be in Users table)");
      }
    } catch (roleErr) {
      console.log(`⚠️ Role check failed: ${roleErr.message}`);
    }

    // Cleanup
    await supabase.auth.signOut();
    console.log("👋 Logged out");

    return {
      success: true,
      user: data.user,
      session: data.session,
      duration: Date.now(),
    };
  } catch (error) {
    console.error("💥 Error:", error.message);
    return { success: false, error: error.message };
  }
}

simpleLogin()
  .then((result) => {
    if (result.success) {
      console.log("\n🎉 Admin login test completed successfully!");
    } else {
      console.log(`\n❌ Admin login test failed: ${result.error}`);
    }
  })
  .catch((error) => {
    console.error("\n💥 Unexpected error:", error.message);
  });
