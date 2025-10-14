import { describe, it, expect, beforeEach, vi } from "vitest";
import { auditService, AUDIT_EVENTS } from "@/services/auditService";

// Mock the supabase module
vi.mock("@/services/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe("AuditService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset audit service state
    auditService.setEnabled(true);
  });

  describe("Event Logging", () => {
    it("should log events successfully", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: mockInsert,
        })),
      };

      // Mock the supabase import
      vi.doMock("@/services/supabase", () => ({
        supabase: mockSupabase,
      }));

      const { auditService: localAuditService } = await import(
        "@/services/auditService"
      );

      await localAuditService.logEvent(
        AUDIT_EVENTS.LOGIN_SUCCESS,
        { test: "data" },
        "user123"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("audit_logs");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: AUDIT_EVENTS.LOGIN_SUCCESS,
          user_id: "user123",
          details: JSON.stringify({ test: "data" }),
        })
      );
    });

    it("should not log events when disabled", async () => {
      auditService.setEnabled(false);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await auditService.logEvent(AUDIT_EVENTS.LOGIN_SUCCESS);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should handle logging errors gracefully", async () => {
      const mockInsert = vi.fn().mockRejectedValue(new Error("Database error"));
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: mockInsert,
        })),
      };

      vi.doMock("@/services/supabase", () => ({
        supabase: mockSupabase,
      }));

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { auditService: localAuditService } = await import(
        "@/services/auditService"
      );

      await localAuditService.logEvent(AUDIT_EVENTS.LOGIN_SUCCESS);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to log audit event:",
        expect.any(Error)
      );
    });
  });

  describe("Specific Event Types", () => {
    it("should log login success events", async () => {
      const logEventSpy = vi
        .spyOn(auditService, "logEvent")
        .mockResolvedValue();

      await auditService.logLoginSuccess("user123", "password");

      expect(logEventSpy).toHaveBeenCalledWith(
        AUDIT_EVENTS.LOGIN_SUCCESS,
        expect.objectContaining({
          login_method: "password",
          timestamp: expect.any(String),
        }),
        "user123"
      );
    });

    it("should log login failure events", async () => {
      const logEventSpy = vi
        .spyOn(auditService, "logEvent")
        .mockResolvedValue();

      await auditService.logLoginFailed("invaliduser", "invalid_credentials");

      expect(logEventSpy).toHaveBeenCalledWith(
        AUDIT_EVENTS.LOGIN_FAILED,
        expect.objectContaining({
          identifier: "invaliduser",
          reason: "invalid_credentials",
          timestamp: expect.any(String),
        })
      );
    });

    it("should log logout events", async () => {
      const logEventSpy = vi
        .spyOn(auditService, "logEvent")
        .mockResolvedValue();

      await auditService.logLogout("user123");

      expect(logEventSpy).toHaveBeenCalledWith(
        AUDIT_EVENTS.LOGOUT,
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
        "user123"
      );
    });

    it("should log password change events", async () => {
      const logEventSpy = vi
        .spyOn(auditService, "logEvent")
        .mockResolvedValue();

      await auditService.logPasswordChange("user123");

      expect(logEventSpy).toHaveBeenCalledWith(
        AUDIT_EVENTS.PASSWORD_CHANGE,
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
        "user123"
      );
    });

    it("should log data export events", async () => {
      const logEventSpy = vi
        .spyOn(auditService, "logEvent")
        .mockResolvedValue();

      await auditService.logDataExport("patients_csv", 100, "user123");

      expect(logEventSpy).toHaveBeenCalledWith(
        AUDIT_EVENTS.DATA_EXPORT,
        expect.objectContaining({
          export_type: "patients_csv",
          record_count: 100,
          timestamp: expect.any(String),
        }),
        "user123"
      );
    });
  });

  describe("Audit Log Retrieval", () => {
    it("should retrieve audit logs with filters", async () => {
      const mockData = [
        {
          id: 1,
          event_type: AUDIT_EVENTS.LOGIN_SUCCESS,
          user_id: "user123",
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      const mockSelect = vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
        })),
      };

      // Override the order method to return the mock data
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      vi.doMock("@/services/supabase", () => ({
        supabase: mockSupabase,
      }));

      const { auditService: localAuditService } = await import(
        "@/services/auditService"
      );

      const result = await localAuditService.getAuditLogs({
        userId: "user123",
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it("should handle audit log retrieval errors", async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      const mockSupabase = {
        from: vi.fn(() => ({
          select: mockSelect,
        })),
      };

      vi.doMock("@/services/supabase", () => ({
        supabase: mockSupabase,
      }));

      const { auditService: localAuditService } = await import(
        "@/services/auditService"
      );

      const result = await localAuditService.getAuditLogs();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });
  });

  describe("Service Configuration", () => {
    it("should enable and disable audit logging", () => {
      expect(auditService.isAuditEnabled()).toBe(true);

      auditService.setEnabled(false);
      expect(auditService.isAuditEnabled()).toBe(false);

      auditService.setEnabled(true);
      expect(auditService.isAuditEnabled()).toBe(true);
    });
  });
});
