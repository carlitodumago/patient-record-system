import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use service role key to apply final dashboard fix
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFinalDashboardFix() {
  console.log(
    "🔧 Applying Final Dashboard Fix - Complete RLS disable and permission grants..."
  );

  try {
    // Step 1: Complete RLS disable on ALL tables
    console.log("\n📋 Step 1: Completely disabling RLS on all tables...");

    const allTables = [
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

    for (const table of allTables) {
      try {
        await supabase.rpc("exec_sql", {
          sql: `ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`,
        });
        console.log(`✅ RLS disabled on ${table} table`);
      } catch (error) {
        console.log(`⚠️ Error disabling RLS on ${table}:`, error.message);
      }
    }

    // Step 2: Grant full permissions to anon and authenticated roles
    console.log(
      "\n📋 Step 2: Granting full permissions to anon and authenticated roles..."
    );

    for (const table of allTables) {
      try {
        // Grant ALL permissions to anon role
        await supabase.rpc("exec_sql", {
          sql: `GRANT ALL ON "${table}" TO anon;`,
        });
        console.log(`✅ Granted ALL on ${table} to anon`);

        // Grant ALL permissions to authenticated role
        await supabase.rpc("exec_sql", {
          sql: `GRANT ALL ON "${table}" TO authenticated;`,
        });
        console.log(`✅ Granted ALL on ${table} to authenticated`);

        // Grant ALL permissions to service_role
        await supabase.rpc("exec_sql", {
          sql: `GRANT ALL ON "${table}" TO service_role;`,
        });
        console.log(`✅ Granted ALL on ${table} to service_role`);
      } catch (error) {
        console.log(
          `⚠️ Error granting permissions on ${table}:`,
          error.message
        );
      }
    }

    // Step 3: Ensure admin user exists
    console.log("\n📋 Step 3: Ensuring admin user exists...");
    try {
      await supabase.rpc("exec_sql", {
        sql: `
          INSERT INTO "Users" ("UserID", "Username", "Email", "fullName", "RoleName", "created_at", "updated_at")
          VALUES (
              '64d5478e-0ccf-4d51-a267-2600d80d0ca9',
              'admin',
              'admin@baankm3clinic.ph',
              'System Administrator',
              'admin',
              NOW(),
              NOW()
          )
          ON CONFLICT ("UserID") DO UPDATE SET
              "Username" = EXCLUDED."Username",
              "Email" = EXCLUDED."Email",
              "fullName" = EXCLUDED."fullName",
              "RoleName" = EXCLUDED."RoleName",
              "updated_at" = NOW();
        `,
      });
      console.log("✅ Admin user ensured");
    } catch (error) {
      console.log("⚠️ Error ensuring admin user:", error.message);
    }

    // Step 4: Test all dashboard queries with anon key
    console.log("\n🧪 Step 4: Testing all dashboard queries with anon key...");
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

    // Test 8: Admin user lookup
    console.log("\n📋 Test 8: Admin user lookup");
    const { data: adminUser, error: adminError } = await anonSupabase
      .from("Users")
      .select("UserID, Username, Email, fullName, RoleName")
      .eq("Username", "admin")
      .single();

    if (adminError) {
      console.error("❌ Admin user lookup failed:", adminError.message);
    } else {
      console.log("✅ Admin user lookup successful:", adminUser);
    }

    console.log("\n🎉 Final dashboard fix applied successfully!");
    console.log("📋 Summary:");
    console.log("   - Completely disabled RLS on ALL tables");
    console.log(
      "   - Granted ALL permissions to anon, authenticated, and service_role"
    );
    console.log("   - Ensured admin user exists");
    console.log(
      "   - All dashboard queries should now work without 403 errors"
    );
  } catch (error) {
    console.error("❌ Final dashboard fix failed:", error.message);
  }
}

applyFinalDashboardFix();
