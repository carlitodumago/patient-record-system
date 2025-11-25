#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config();

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://xplnygndaqbtjnfltvtt.supabase.co";
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo";

console.log("🔍 Debug: Starting simple login test...");
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase Key: ${supabaseKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  try {
    console.log("🔐 Attempting login...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@baankm3clinic.ph",
      password: "adminbaan",
    });

    if (error) {
      console.error("❌ Login failed:", error.message);
      return;
    }

    console.log("✅ Login successful!");
    console.log("User:", data.user?.email);
    console.log("Session expires:", new Date(data.session?.expires_at * 1000));

    // Test session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) {
      console.error("❌ Session error:", sessionError.message);
    } else {
      console.log("✅ Session valid");
    }
  } catch (error) {
    console.error("💥 Error:", error.message);
  }
}

testLogin();
