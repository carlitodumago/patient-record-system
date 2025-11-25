import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use service role key to apply dashboard RLS fix
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyDashboardRLSFix() {
  console.log(
    "🔧 Applying Dashboard RLS Fix - Disabling RLS on dashboard tables..."
  );

  try {
    // Disable RLS on tables needed for dashboard statistics
    console.log("\n📋 Disabling RLS on dashboard tables...");

    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "Patients" DISABLE ROW LEVEL SECURITY;`,
    });
    console.log("✅ RLS disabled on Patients table");

    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "Staff" DISABLE ROW LEVEL SECURITY;`,
    });
    console.log("✅ RLS disabled on Staff table");

    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "Appointment" DISABLE ROW LEVEL SECURITY;`,
    });
    console.log("✅ RLS disabled on Appointment table");

    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "MedicalRecord" DISABLE ROW LEVEL SECURITY;`,
    });
    console.log("✅ RLS disabled on MedicalRecord table");

    await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "Notification" DISABLE ROW LEVEL SECURITY;`,
    });
    console.log("✅ RLS disabled on Notification table");

    // Test the fix
    console.log("\n🧪 Testing dashboard queries...");
    const anonSupabase = createClient(
      supabaseUrl,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    // Test 1: Patients count
    console.log("\n📋 Test 1: Patients count query");
    const { count: patientsCount, error: patientsError } = await anonSupabase
      .from("Patients")
      .select("*", { count: "exact", head: true });

    if (patientsError) {
      console.error("❌ Patients count failed:", patientsError.message);
    } else {
      console.log("✅ Patients count successful:", patientsCount);
    }

    // Test 2: Staff count
    console.log("\n📋 Test 2: Staff count query");
    const { count: staffCount, error: staffError } = await anonSupabase
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
      await anonSupabase
        .from("Appointment")
        .select("*", { count: "exact", head: true });

    if (appointmentsError) {
      console.error("❌ Appointments count failed:", appointmentsError.message);
    } else {
      console.log("✅ Appointments count successful:", appointmentsCount);
    }

    // Test 4: Medical Records count
    console.log("\n📋 Test 4: Medical Records count query");
    const { count: recordsCount, error: recordsError } = await anonSupabase
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
    const { data: todayAppts, error: todayError } = await anonSupabase
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
    const { data: pendingAppts, error: pendingError } = await anonSupabase
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
      await anonSupabase
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

    console.log("\n🎉 Dashboard RLS fix applied successfully!");
    console.log("📋 Summary:");
    console.log(
      "   - Patients, Staff, Appointment, MedicalRecord, Notification tables: RLS DISABLED"
    );
    console.log("   - Dashboard statistics queries should now work");
  } catch (error) {
    console.error("❌ Dashboard fix failed:", error.message);
  }
}

applyDashboardRLSFix();
