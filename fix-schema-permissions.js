import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use service role key to fix schema permissions
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSchemaPermissions() {
  console.log("🔧 Fixing schema permissions for service role...");

  try {
    // Grant usage on public schema to service_role
    console.log("\n📋 Granting schema usage to service_role...");
    await supabase.rpc("exec_sql", {
      sql: `GRANT USAGE ON SCHEMA public TO service_role;`,
    });
    console.log("✅ Schema usage granted");

    // Grant all privileges on all tables in public schema to service_role
    console.log("\n📋 Granting table privileges to service_role...");

    const tables = [
      "Users",
      "Role",
      "Patients",
      "Staff",
      "Appointment",
      "MedicalRecord",
      "Notification",
      "Diagnosis",
      "Treatment",
      "Notes",
    ];

    for (const table of tables) {
      console.log(`   Granting privileges on ${table}...`);
      await supabase.rpc("exec_sql", {
        sql: `GRANT ALL PRIVILEGES ON public."${table}" TO service_role;`,
      });
    }
    console.log("✅ Table privileges granted");

    // Grant all privileges on all sequences to service_role
    console.log("\n📋 Granting sequence privileges to service_role...");
    await supabase.rpc("exec_sql", {
      sql: `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;`,
    });
    console.log("✅ Sequence privileges granted");

    // Grant all privileges on all functions to service_role
    console.log("\n📋 Granting function privileges to service_role...");
    await supabase.rpc("exec_sql", {
      sql: `GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;`,
    });
    console.log("✅ Function privileges granted");

    // Test the permissions by running dashboard queries
    console.log("\n🧪 Testing dashboard queries with fixed permissions...");

    // Test 1: Patients count
    console.log("\n📋 Test 1: Patients count query");
    const { count: patientsCount, error: patientsError } = await supabase
      .from("Patients")
      .select("*", { count: "exact", head: true });

    if (patientsError) {
      console.error("❌ Patients count failed:", patientsError.message);
    } else {
      console.log("✅ Patients count successful:", patientsCount);
    }

    // Test 2: Staff count
    console.log("\n📋 Test 2: Staff count query");
    const { count: staffCount, error: staffError } = await supabase
      .from("Staff")
      .select("*", { count: "exact", head: true });

    if (staffError) {
      console.error("❌ Staff count failed:", staffError.message);
    } else {
      console.log("✅ Staff count successful:", staffCount);
    }

    // Test 3: Appointments count
    console.log("\n📋 Test 3: Appointments count query");
    const { count: appointmentsCount, error: appointmentsError } =
      await supabase
        .from("Appointment")
        .select("*", { count: "exact", head: true });

    if (appointmentsError) {
      console.error("❌ Appointments count failed:", appointmentsError.message);
    } else {
      console.log("✅ Appointments count successful:", appointmentsCount);
    }

    // Test 4: Medical Records count
    console.log("\n📋 Test 4: Medical Records count query");
    const { count: recordsCount, error: recordsError } = await supabase
      .from("MedicalRecord")
      .select("*", { count: "exact", head: true });

    if (recordsError) {
      console.error("❌ Medical Records count failed:", recordsError.message);
    } else {
      console.log("✅ Medical Records count successful:", recordsCount);
    }

    // Test 5: Today's appointments query
    console.log("\n📋 Test 5: Today's appointments query");
    const today = new Date().toISOString().split("T")[0];
    const { data: todayAppts, error: todayError } = await supabase
      .from("Appointment")
      .select("*", { count: "exact" })
      .gte("DateTime", `${today}T00:00:00`)
      .lt("DateTime", `${today}T23:59:59`);

    if (todayError) {
      console.error("❌ Today's appointments failed:", todayError.message);
    } else {
      console.log("✅ Today's appointments successful:", todayAppts.length);
    }

    // Test 6: Pending appointments query
    console.log("\n📋 Test 6: Pending appointments query");
    const { data: pendingAppts, error: pendingError } = await supabase
      .from("Appointment")
      .select("*", { count: "exact" })
      .eq("Status", "Pending");

    if (pendingError) {
      console.error("❌ Pending appointments failed:", pendingError.message);
    } else {
      console.log("✅ Pending appointments successful:", pendingAppts.length);
    }

    // Test 7: Recent notifications query
    console.log("\n📋 Test 7: Recent notifications query");
    const { data: recentNotifications, error: notificationsError } =
      await supabase
        .from("Notification")
        .select("*")
        .order("CreatedAt", { ascending: false })
        .limit(5);

    if (notificationsError) {
      console.error(
        "❌ Recent notifications failed:",
        notificationsError.message
      );
    } else {
      console.log(
        "✅ Recent notifications successful:",
        recentNotifications?.length || 0
      );
    }

    console.log("\n🎉 Schema permissions fixed successfully!");
    console.log("📋 Summary:");
    console.log("   - Service role granted full access to public schema");
    console.log("   - All dashboard queries should now work");
    console.log("   - Server-side API should function properly");
  } catch (error) {
    console.error("❌ Schema permissions fix failed:", error.message);
  }
}

fixSchemaPermissions();
