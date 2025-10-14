import { supabase } from "./supabase";

// Audit event types
export const AUDIT_EVENTS = {
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  LOGOUT: "logout",
  PASSWORD_CHANGE: "password_change",
  USER_CREATED: "user_created",
  USER_UPDATED: "user_updated",
  USER_DELETED: "user_deleted",
  PATIENT_CREATED: "patient_created",
  PATIENT_UPDATED: "patient_updated",
  MEDICAL_RECORD_CREATED: "medical_record_created",
  MEDICAL_RECORD_UPDATED: "medical_record_updated",
  APPOINTMENT_CREATED: "appointment_created",
  APPOINTMENT_UPDATED: "appointment_updated",
  DATA_EXPORT: "data_export",
  ADMIN_ACTION: "admin_action",
  UNAUTHORIZED_ACCESS: "unauthorized_access",
  PASSWORD_RESET: "password_reset",
};

class AuditService {
  constructor() {
    this.isEnabled = true;
  }

  /**
   * Log an audit event
   * @param {string} eventType - Type of event from AUDIT_EVENTS
   * @param {Object} details - Additional details about the event
   * @param {string} userId - ID of the user performing the action
   * @param {string} ipAddress - IP address of the request (optional)
   */
  async logEvent(eventType, details = {}, userId = null, ipAddress = null) {
    if (!this.isEnabled) return;

    try {
      // Get current user if not provided
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id;
      }

      // Get client IP if not provided (this would need backend support in production)
      if (!ipAddress) {
        ipAddress = await this.getClientIP();
      }

      const auditRecord = {
        event_type: eventType,
        user_id: userId,
        details: JSON.stringify(details),
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      };

      // Insert into audit_logs table
      const { error } = await supabase.from("audit_logs").insert(auditRecord);

      if (error) {
        console.error("Failed to log audit event:", error);
      }
    } catch (error) {
      console.error("Audit logging error:", error);
    }
  }

  /**
   * Get client IP address (placeholder - would need backend support)
   */
  async getClientIP() {
    try {
      // In a real application, this would be handled by the backend
      // For now, return a placeholder
      return "client-ip-placeholder";
    } catch (error) {
      return "unknown";
    }
  }

  /**
   * Log successful login
   */
  async logLoginSuccess(userId, loginMethod = "password") {
    await this.logEvent(
      AUDIT_EVENTS.LOGIN_SUCCESS,
      {
        login_method: loginMethod,
        timestamp: new Date().toISOString(),
      },
      userId
    );
  }

  /**
   * Log failed login attempt
   */
  async logLoginFailed(identifier, reason = "invalid_credentials") {
    await this.logEvent(AUDIT_EVENTS.LOGIN_FAILED, {
      identifier: identifier,
      reason: reason,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log user logout
   */
  async logLogout(userId) {
    await this.logEvent(
      AUDIT_EVENTS.LOGOUT,
      {
        timestamp: new Date().toISOString(),
      },
      userId
    );
  }

  /**
   * Log password change
   */
  async logPasswordChange(userId) {
    await this.logEvent(
      AUDIT_EVENTS.PASSWORD_CHANGE,
      {
        timestamp: new Date().toISOString(),
      },
      userId
    );
  }

  /**
   * Log user creation
   */
  async logUserCreated(createdUserId, createdBy = null) {
    await this.logEvent(
      AUDIT_EVENTS.USER_CREATED,
      {
        created_user_id: createdUserId,
        timestamp: new Date().toISOString(),
      },
      createdBy
    );
  }

  /**
   * Log user update
   */
  async logUserUpdated(updatedUserId, fieldsChanged = [], updatedBy = null) {
    await this.logEvent(
      AUDIT_EVENTS.USER_UPDATED,
      {
        updated_user_id: updatedUserId,
        fields_changed: fieldsChanged,
        timestamp: new Date().toISOString(),
      },
      updatedBy
    );
  }

  /**
   * Log patient record creation
   */
  async logPatientCreated(patientId, createdBy = null) {
    await this.logEvent(
      AUDIT_EVENTS.PATIENT_CREATED,
      {
        patient_id: patientId,
        timestamp: new Date().toISOString(),
      },
      createdBy
    );
  }

  /**
   * Log patient record update
   */
  async logPatientUpdated(patientId, fieldsChanged = [], updatedBy = null) {
    await this.logEvent(
      AUDIT_EVENTS.PATIENT_UPDATED,
      {
        patient_id: patientId,
        fields_changed: fieldsChanged,
        timestamp: new Date().toISOString(),
      },
      updatedBy
    );
  }

  /**
   * Log medical record creation
   */
  async logMedicalRecordCreated(recordId, patientId, createdBy = null) {
    await this.logEvent(
      AUDIT_EVENTS.MEDICAL_RECORD_CREATED,
      {
        record_id: recordId,
        patient_id: patientId,
        timestamp: new Date().toISOString(),
      },
      createdBy
    );
  }

  /**
   * Log medical record update
   */
  async logMedicalRecordUpdated(
    recordId,
    patientId,
    fieldsChanged = [],
    updatedBy = null
  ) {
    await this.logEvent(
      AUDIT_EVENTS.MEDICAL_RECORD_UPDATED,
      {
        record_id: recordId,
        patient_id: patientId,
        fields_changed: fieldsChanged,
        timestamp: new Date().toISOString(),
      },
      updatedBy
    );
  }

  /**
   * Log appointment creation
   */
  async logAppointmentCreated(appointmentId, patientId, createdBy = null) {
    await this.logEvent(
      AUDIT_EVENTS.APPOINTMENT_CREATED,
      {
        appointment_id: appointmentId,
        patient_id: patientId,
        timestamp: new Date().toISOString(),
      },
      createdBy
    );
  }

  /**
   * Log appointment update
   */
  async logAppointmentUpdated(
    appointmentId,
    patientId,
    fieldsChanged = [],
    updatedBy = null
  ) {
    await this.logEvent(
      AUDIT_EVENTS.APPOINTMENT_UPDATED,
      {
        appointment_id: appointmentId,
        patient_id: patientId,
        fields_changed: fieldsChanged,
        timestamp: new Date().toISOString(),
      },
      updatedBy
    );
  }

  /**
   * Log data export
   */
  async logDataExport(exportType, recordCount, exportedBy = null) {
    await this.logEvent(
      AUDIT_EVENTS.DATA_EXPORT,
      {
        export_type: exportType,
        record_count: recordCount,
        timestamp: new Date().toISOString(),
      },
      exportedBy
    );
  }

  /**
   * Log administrative action
   */
  async logAdminAction(
    action,
    targetUserId = null,
    details = {},
    performedBy = null
  ) {
    await this.logEvent(
      AUDIT_EVENTS.ADMIN_ACTION,
      {
        action: action,
        target_user_id: targetUserId,
        details: details,
        timestamp: new Date().toISOString(),
      },
      performedBy
    );
  }

  /**
   * Log unauthorized access attempt
   */
  async logUnauthorizedAccess(resource, attemptedBy = null) {
    await this.logEvent(
      AUDIT_EVENTS.UNAUTHORIZED_ACCESS,
      {
        resource: resource,
        timestamp: new Date().toISOString(),
      },
      attemptedBy
    );
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters = {}) {
    try {
      let query = supabase
        .from("audit_logs")
        .select(
          `
          *,
          Users:user_id(Username, Email)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }

      if (filters.eventType) {
        query = query.eq("event_type", filters.eventType);
      }

      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error("Get audit logs error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enable or disable audit logging
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Check if audit logging is enabled
   */
  isAuditEnabled() {
    return this.isEnabled;
  }
}

// Create singleton instance
export const auditService = new AuditService();

// Auto-log certain events
export default auditService;
