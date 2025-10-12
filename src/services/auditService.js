import { supabase, TABLES } from "./supabase.js";

export class AuditService {
  // Log audit event
  static async logEvent(
    userId,
    action,
    tableName,
    recordId,
    oldValues = null,
    newValues = null,
    ipAddress = null
  ) {
    try {
      const { error } = await supabase.from(TABLES.AUDIT_LOGS).insert({
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging audit event:", error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  // Get audit trail for a record
  static async getAuditTrail(tableName, recordId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AUDIT_LOGS)
        .select(
          `
          *,
          Users(username)
        `
        )
        .eq("table_name", tableName)
        .eq("record_id", recordId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching audit trail:", error);
      return [];
    }
  }

  // Get user activity log
  static async getUserActivity(userId, limit = 100) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AUDIT_LOGS)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user activity:", error);
      return [];
    }
  }

  // Get system activity summary
  static async getActivitySummary(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AUDIT_LOGS)
        .select("action, created_at")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;

      // Group by action type
      const summary = data.reduce((acc, log) => {
        const action = log.action;
        acc[action] = (acc[action] || 0) + 1;
        return acc;
      }, {});

      return summary;
    } catch (error) {
      console.error("Error fetching activity summary:", error);
      return {};
    }
  }

  // Log sensitive data access
  static async logSensitiveDataAccess(
    userId,
    tableName,
    recordId,
    accessType = "VIEW"
  ) {
    await this.logEvent(
      userId,
      `SENSITIVE_DATA_${accessType}`,
      tableName,
      recordId,
      null,
      { accessType, timestamp: new Date().toISOString() }
    );
  }

  // Log authentication events
  static async logAuthEvent(userId, eventType, details = {}) {
    await this.logEvent(userId, `AUTH_${eventType}`, "Users", userId, null, {
      ...details,
      timestamp: new Date().toISOString(),
    });
  }

  // Log data export
  static async logDataExport(userId, exportType, recordCount) {
    await this.logEvent(userId, "DATA_EXPORT", "system", null, null, {
      exportType,
      recordCount,
      timestamp: new Date().toISOString(),
    });
  }
}

export default AuditService;
