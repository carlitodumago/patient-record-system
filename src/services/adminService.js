import { supabase, TABLES } from "./supabase.js";
import { authService } from "./authService.js";
import { AuditService } from "./auditService.js";

export const adminService = {
  async getAllUsers(filters = {}) {
    let query = supabase.from(TABLES.USERS).select(`
        *,
        patients:Patients(*),
        staff:Staff(*),
        roles:Role(*)
      `);

    if (filters.role) {
      query = query.eq("RoleID", filters.role);
    }

    if (filters.search) {
      query = query.or(
        `username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return data;
  },

  async getSystemStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [users, patients, staff, recentUsers] = await Promise.all([
      supabase.from(TABLES.USERS).select("*", { count: "exact", head: true }),
      supabase
        .from(TABLES.PATIENTS)
        .select("*", { count: "exact", head: true }),
      supabase.from(TABLES.STAFF).select("*", { count: "exact", head: true }),
      supabase
        .from(TABLES.USERS)
        .select("*", { count: "exact", head: true })
        .gte("CreatedAt", startOfMonth.toISOString()),
    ]);

    return {
      users: {
        total: users.count || 0,
        recent: recentUsers.count || 0,
      },
      patients: {
        total: patients.count || 0,
      },
      staff: {
        total: staff.count || 0,
      },
    };
  },

  async createUserAccount(userData) {
    try {
      // Create user account with auto-generated credentials
      const result = await authService.createUser(userData);

      // Log the account creation
      await AuditService.logEvent(
        null, // System action
        "USER_ACCOUNT_CREATED",
        TABLES.USERS,
        result.user.id,
        null,
        {
          role: userData.roleId,
          email: userData.email,
          createdBy: "admin",
        }
      );

      return {
        user: result.user,
        credentials: {
          username: authService.generateUsername(
            userData.firstName,
            userData.surname
          ),
          password: authService.generatePassword(
            userData.birthDate || new Date().toISOString().split("T")[0]
          ),
        },
      };
    } catch (error) {
      console.error("Error creating user account:", error);
      throw error;
    }
  },

  async resetUserPassword(userId) {
    try {
      // Generate new password
      const newPassword =
        Math.random().toString(36).slice(-12) +
        Math.random().toString(36).slice(-12);

      // Update password in database
      const { error } = await supabase
        .from(TABLES.USERS)
        .update({
          Password: await require("bcryptjs").hash(newPassword, 12),
          password_changed_at: new Date().toISOString(),
        })
        .eq("UserID", userId);

      if (error) throw error;

      // Get user email for sending credentials
      const { data: user } = await supabase
        .from(TABLES.USERS)
        .select("email, username")
        .eq("UserID", userId)
        .single();

      // Send new credentials via email
      await authService.sendCredentials(
        user.email,
        "",
        user.username,
        newPassword,
        user.username
      );

      // Log password reset
      await AuditService.logEvent(
        null,
        "PASSWORD_RESET",
        TABLES.USERS,
        userId,
        null,
        { resetBy: "admin", method: "email" }
      );

      return { success: true };
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  },

  async deactivateUser(userId) {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("UserID", userId);

      if (error) throw error;

      // Log deactivation
      await AuditService.logEvent(
        null,
        "USER_DEACTIVATED",
        TABLES.USERS,
        userId,
        { is_active: true },
        { is_active: false, deactivatedBy: "admin" }
      );

      return { success: true };
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw error;
    }
  },

  async reactivateUser(userId) {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("UserID", userId);

      if (error) throw error;

      // Log reactivation
      await AuditService.logEvent(
        null,
        "USER_REACTIVATED",
        TABLES.USERS,
        userId,
        { is_active: false },
        { is_active: true, reactivatedBy: "admin" }
      );

      return { success: true };
    } catch (error) {
      console.error("Error reactivating user:", error);
      throw error;
    }
  },

  async getAuditLogs(limit = 100) {
    return await AuditService.getAuditTrail("system", null, limit);
  },

  async exportReports(format = "pdf") {
    try {
      // Get system data for export
      const stats = await this.getSystemStats();
      const users = await this.getAllUsers();
      const auditLogs = await this.getAuditLogs(1000);

      const reportData = {
        generatedAt: new Date().toISOString(),
        stats,
        users: users.length,
        auditLogs: auditLogs.length,
        data: {
          users,
          auditLogs,
        },
      };

      // Log data export
      await AuditService.logDataExport(
        null,
        format,
        users.length + auditLogs.length
      );

      return reportData;
    } catch (error) {
      console.error("Error exporting reports:", error);
      throw error;
    }
  },
};
