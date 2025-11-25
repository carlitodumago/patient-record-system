import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOverviewStats() {
  console.log("🧪 Testing getOverviewStats queries directly...");

  try {
    // Test 1: Patients count
    console.log("\n📋 Test 1: Patients count query");
    const { count: patientsCount, error: patientsError } = await supabase
      .from("Patients")
      .select("*", { count: "exact", head: true });

    if (patientsError) {
      console.error("❌ Patients count failed:", patientsError.message);
      console.error("   Code:", patientsError.code);
      console.error("   Details:", patientsError.details);
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
      console.error("   Code:", staffError.code);
      console.error("   Details:", staffError.details);
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
      console.error("   Code:", appointmentsError.code);
      console.error("   Details:", appointmentsError.details);
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
      console.error("   Code:", recordsError.code);
      console.error("   Details:", recordsError.details);
    } else {
      console.log("✅ Medical Records count successful:", recordsCount);
    }

    // Test 5: Today's appointments query (from Dashboard.vue)
    console.log("\n📋 Test 5: Today's appointments query");
    const today = new Date().toISOString().split("T")[0];
    const { data: todayAppts, error: todayError } = await supabase
      .from("Appointment")
      .select("*", { count: "exact" })
      .gte("DateTime", `${today}T00:00:00`)
      .lt("DateTime", `${today}T23:59:59`);

    if (todayError) {
      console.error("❌ Today's appointments failed:", todayError.message);
      console.error("   Code:", todayError.code);
      console.error("   Details:", todayError.details);
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
      console.error("   Code:", pendingError.code);
      console.error("   Details:", pendingError.details);
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
      console.error("   Code:", notificationsError.code);
      console.error("   Details:", notificationsError.details);
    } else {
      console.log(
        "✅ Recent notifications successful:",
        recentNotifications?.length || 0
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testOverviewStats();
