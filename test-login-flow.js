import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLoginFlow() {
  try {
    console.log("🔍 Testing login flow...");

    // First, check if we can authenticate with Supabase Auth
    console.log("1️⃣ Testing Supabase Auth login...");
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: "admin@baankm3clinic.ph",
        password: "adminbaan",
      });

    if (authError) {
      console.log("❌ Supabase Auth login failed:", authError.message);

      // If user doesn't exist in auth, create it
      if (authError.message.includes("Invalid login credentials")) {
        console.log("📧 Creating Supabase Auth user...");
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: "admin@baankm3clinic.ph",
            password: "adminbaan",
            options: {
              data: {
                firstName: "System",
                surname: "Administrator",
              },
            },
          });

        if (signUpError) {
          console.error("❌ Error creating auth user:", signUpError);
          return;
        }

        console.log("✅ Auth user created:", signUpData.user?.id);

        // Now try to sign in again
        console.log("🔐 Signing in with newly created user...");
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: "admin@baankm3clinic.ph",
            password: "adminbaan",
          });

        if (signInError) {
          console.error("❌ Error signing in:", signInError);
          return;
        }

        console.log("✅ Login successful!");
        console.log("🆔 Auth User ID:", signInData.user.id);
        console.log("📧 Email:", signInData.user.email);

        // Now I need to link this Auth user to our Users table record
        // The challenge is that the Auth user has a UUID but our Users table has UserID as integer
        // I need to either update the Users table record or create a new approach
      }
    } else {
      console.log("✅ Supabase Auth login successful!");
      console.log("🆔 Auth User ID:", authData.user.id);
      console.log("📧 Email:", authData.user.email);
    }
  } catch (error) {
    console.error("💥 Error:", error);
  }
}

testLoginFlow();
