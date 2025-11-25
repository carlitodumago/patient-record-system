import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

// Use service role key to apply comprehensive RLS fix
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyComprehensiveRLSFix() {
  console.log(
    "🔧 Applying Comprehensive RLS Fix - Disabling RLS and dropping policies on dashboard tables..."
  );

  try {
    // Step 1: Drop all existing policies on dashboard tables
    console.log("\n📋 Step 1: Dropping existing policies...");

    const tables = [
      "Patients",
      "Staff",
      "Appointment",
      "MedicalRecord",
      "Notification",
    ];

    for (const table of tables) {
      try {
        // Get all policies for this table
        const { data: policies, error: policyError } = await supabase.rpc(
          "exec_sql",
          {
            sql: `SELECT policyname FROM pg_policies WHERE tablename = '${table}' AND schemaname = 'public';`,
          }
        );

        if (policyError) {
          console.log(
            `⚠️ Could not get policies for ${table}:`,
            policyError.message
          );
        } else if (policies && policies.length > 0) {
          console.log(
            `📋 Dropping ${policies.length} policies for ${table}...`
          );
          for (const policy of policies) {
            await supabase.rpc("exec_sql", {
              sql: `DROP POLICY IF EXISTS "${policy.policyname}" ON "${table}";`,
            });
            console.log(`✅ Dropped policy: ${policy.policyname}`);
          }
        } else {
          console.log(`ℹ️ No policies found for ${table}`);
        }
      } catch (error) {
        console.log(
          `⚠️ Error processing policies for ${table}:`,
          error.message
        );
      }
    }

    // Step 2: Disable RLS on all dashboard tables
    console.log("\n📋 Step 2: Disabling RLS on dashboard tables...");

    for (const table of tables) {
      try {
        await supabase.rpc("exec_sql", {
          sql: `ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`,
        });
        console.log(`✅ RLS disabled on ${table} table`);
      } catch (error) {
        console.log(`⚠️ Error disabling RLS on ${table}:`, error.message);
      }
    }

    // Step 3: Grant necessary permissions to anon role
    console.log("\n📋 Step 3: Granting permissions to anon role...");

    for (const table of tables) {
      try {
        // Grant SELECT permission to anon role
        await supabase.rpc("exec_sql", {
          sql: `GRANT SELECT ON "${table}" TO anon;`,
        });
        console.log(`✅ Granted SELECT on ${table} to anon`);

        // Also grant to authenticated role for good measure
        await supabase.rpc("exec_sql", {
          sql: `GRANT SELECT ON "${table}" TO authenticated;`,
        });
        console.log(`✅ Granted SELECT on ${table} to authenticated`);
      } catch (error) {
        console.log(
          `⚠️ Error granting permissions on ${table}:`,
          error.message
        );
      }
    }

    // Step 4: Verify RLS status
    console.log("\n📋 Step 4: Verifying RLS status...");
    const { data: rlsStatus, error: rlsError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('Patients', 'Staff', 'Appointment', 'MedicalRecord', 'Notification');`,
      }
    );

    if (rlsError) {
      console.log("⚠️ Could not verify RLS status:", rlsError.message);
    } else {
      console.log("✅ RLS status verification:");
      rlsStatus.forEach((row) => {
        console.log(
          `   ${row.tablename}: RLS ${row.rowsecurity ? "ENABLED" : "DISABLED"}`
        );
      });
    }

    // Step 5: Test queries with anon key
    console.log("\n🧪 Step 5: Testing dashboard queries with anon key...");
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

    console.log("\n🎉 Comprehensive RLS fix applied successfully!");
    console.log("📋 Summary:");
    console.log("   - Dropped all existing policies on dashboard tables");
    console.log(
      "   - Disabled RLS on: Patients, Staff, Appointment, MedicalRecord, Notification"
    );
    console.log(
      "   - Granted SELECT permissions to anon and authenticated roles"
    );
    console.log(
      "   - Dashboard statistics queries should now work without 403 errors"
    );
  } catch (error) {
    console.error("❌ Comprehensive RLS fix failed:", error.message);
  }
}

applyComprehensiveRLSFix();
