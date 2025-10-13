import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import ReportsDashboard from "../../src/views/admin/ReportsDashboard.vue";

// Mock the stores
vi.mock("../../src/stores/admin", () => ({
  useAdminStore: () => ({
    getSystemStatistics: vi.fn(),
    getAuditLogs: vi.fn(),
  }),
}));

vi.mock("../../src/stores/patients", () => ({
  usePatientsStore: () => ({
    // Add any needed methods
  }),
}));

vi.mock("../../src/stores/notifications", () => ({
  useNotificationsStore: () => ({
    addNotification: vi.fn(),
  }),
}));

// Mock the services
vi.mock("../../src/services/patientService", () => ({
  patientService: {
    getPatientStatistics: vi.fn(),
    getPatientsWithUpcomingAppointments: vi.fn(),
  },
}));

vi.mock("../../src/services/staffService", () => ({
  staffService: {
    getStaffStatistics: vi.fn(),
  },
}));

vi.mock("../../src/services/appointmentService", () => ({
  default: {
    getAppointmentStatistics: vi.fn(),
  },
}));

describe("ReportsDashboard Component", () => {
  let wrapper;
  let router;
  let pinia;

  const mockSystemStats = {
    users: { total: 150 },
    patients: { total: 120 },
    staff: { total: 25 },
    appointments: { total: 450 },
  };

  const mockPatientStats = {
    totalPatients: 120,
    recentPatients: 15,
    genderDistribution: { Male: 60, Female: 60 },
    bloodTypeDistribution: { "A+": 30, "B+": 25, "O+": 35, "AB+": 10 },
  };

  const mockStaffStats = {
    totalStaff: 25,
    roleDistribution: { Nurse: 15, Admin: 5, Doctor: 5 },
    specializationDistribution: { Cardiology: 3, Pediatrics: 4, General: 8 },
  };

  const mockAppointmentStats = {
    totalAppointments: 450,
    todayAppointments: 12,
    monthlyAppointments: 180,
    statusDistribution: { scheduled: 200, completed: 180, cancelled: 70 },
  };

  const mockAuditLogs = [
    {
      log_id: "1",
      action: "CREATE_PATIENT",
      table_name: "patients",
      created_at: "2024-01-15T10:00:00Z",
      user: { username: "admin" },
      ip_address: "192.168.1.1",
    },
    {
      log_id: "2",
      action: "UPDATE_APPOINTMENT",
      table_name: "appointments",
      created_at: "2024-01-15T11:00:00Z",
      user: { username: "nurse1" },
      ip_address: "192.168.1.2",
    },
  ];

  beforeEach(async () => {
    // Setup Pinia
    pinia = createPinia();
    setActivePinia(pinia);

    // Setup Router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: "/admin/reports",
          name: "ReportsDashboard",
          component: ReportsDashboard,
        },
      ],
    });

    router.push("/admin/reports");
    await router.isReady();

    // Reset mocks
    vi.clearAllMocks();
  });

  const mountComponent = async () => {
    wrapper = mount(ReportsDashboard, {
      global: {
        plugins: [router, pinia],
        stubs: ["router-link", "router-view"],
      },
    });
    await wrapper.vm.$nextTick();
  };

  describe("Component Rendering", () => {
    it("should render the component correctly", async () => {
      await mountComponent();
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find("h1").text()).toBe("Reports Dashboard");
    });

    it("should display key metrics cards", async () => {
      await mountComponent();
      const cards = wrapper.findAll(".v-card");
      expect(cards.length).toBeGreaterThan(4); // At least the metric cards
    });

    it("should display patient demographics section", async () => {
      await mountComponent();
      expect(wrapper.text()).toContain("Patient Demographics");
    });

    it("should display appointment trends section", async () => {
      await mountComponent();
      expect(wrapper.text()).toContain("Appointment Trends");
    });

    it("should display patient statistics table", async () => {
      await mountComponent();
      expect(wrapper.text()).toContain("Patient Statistics");
    });

    it("should display staff performance table", async () => {
      await mountComponent();
      expect(wrapper.text()).toContain("Staff Performance");
    });

    it("should display recent activity section", async () => {
      await mountComponent();
      expect(wrapper.text()).toContain("Recent System Activity");
    });

    it("should display export options", async () => {
      await mountComponent();
      expect(wrapper.text()).toContain("Report Generation");
    });
  });

  describe("Data Loading", () => {
    it("should load all data on mount", async () => {
      const { useAdminStore } = await import("../../src/stores/admin");
      const { patientService } = await import(
        "../../src/services/patientService"
      );
      const { staffService } = await import("../../src/services/staffService");
      const { default: AppointmentService } = await import(
        "../../src/services/appointmentService"
      );

      const adminStore = useAdminStore();
      adminStore.getSystemStatistics.mockResolvedValue(mockSystemStats);
      adminStore.getAuditLogs.mockResolvedValue(mockAuditLogs);
      patientService.getPatientStatistics.mockResolvedValue(mockPatientStats);
      patientService.getPatientsWithUpcomingAppointments.mockResolvedValue([]);
      staffService.getStaffStatistics.mockResolvedValue(mockStaffStats);
      AppointmentService.getAppointmentStatistics.mockResolvedValue(
        mockAppointmentStats
      );

      await mountComponent();

      expect(adminStore.getSystemStatistics).toHaveBeenCalled();
      expect(adminStore.getAuditLogs).toHaveBeenCalledWith({ limit: 10 });
      expect(patientService.getPatientStatistics).toHaveBeenCalled();
      expect(
        patientService.getPatientsWithUpcomingAppointments
      ).toHaveBeenCalled();
      expect(staffService.getStaffStatistics).toHaveBeenCalled();
      expect(AppointmentService.getAppointmentStatistics).toHaveBeenCalled();
    });

    it("should handle loading state", async () => {
      // Mock delayed responses
      const { useAdminStore } = await import("../../src/stores/admin");
      const adminStore = useAdminStore();
      adminStore.getSystemStatistics.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockSystemStats), 100)
          )
      );

      await mountComponent();

      // Initially should show loading state
      expect(wrapper.vm.isRefreshing).toBe(false); // Should be false after initial load
    });
  });

  describe("Data Tables", () => {
    beforeEach(async () => {
      // Setup mock data
      const { useAdminStore } = await import("../../src/stores/admin");
      const { patientService } = await import(
        "../../src/services/patientService"
      );
      const { staffService } = await import("../../src/services/staffService");
      const { default: AppointmentService } = await import(
        "../../src/services/appointmentService"
      );

      const adminStore = useAdminStore();
      adminStore.getSystemStatistics.mockResolvedValue(mockSystemStats);
      adminStore.getAuditLogs.mockResolvedValue(mockAuditLogs);
      patientService.getPatientStatistics.mockResolvedValue(mockPatientStats);
      patientService.getPatientsWithUpcomingAppointments.mockResolvedValue([]);
      staffService.getStaffStatistics.mockResolvedValue(mockStaffStats);
      AppointmentService.getAppointmentStatistics.mockResolvedValue(
        mockAppointmentStats
      );

      await mountComponent();
    });

    it("should render patient statistics table with correct data", () => {
      const patientTable = wrapper
        .findAll("table")
        .find((table) => table.text().includes("Patient Statistics"));
      expect(patientTable.exists()).toBe(true);
      expect(wrapper.vm.patientStatsItems).toHaveLength(4);
      expect(wrapper.vm.patientStatsItems[0].metric).toBe(
        "Total Active Patients"
      );
    });

    it("should render staff performance table with correct data", () => {
      const staffTable = wrapper
        .findAll("table")
        .find((table) => table.text().includes("Staff Performance"));
      expect(staffTable.exists()).toBe(true);
      expect(wrapper.vm.staffStatsItems).toHaveLength(4);
      expect(wrapper.vm.staffStatsItems[0].metric).toBe(
        "Total Healthcare Staff"
      );
    });
  });

  describe("Export Functionality", () => {
    beforeEach(async () => {
      const { useNotificationsStore } = await import(
        "../../src/stores/notifications"
      );
      const notificationsStore = useNotificationsStore();

      await mountComponent();
    });

    it("should trigger export report when button is clicked", async () => {
      const exportButtons = wrapper
        .findAll("button")
        .filter((button) => button.text().includes("Generate Report"));

      const { useNotificationsStore } = await import(
        "../../src/stores/notifications"
      );
      const notificationsStore = useNotificationsStore();

      await exportButtons[0].trigger("click");

      expect(notificationsStore.addNotification).toHaveBeenCalledWith({
        title: "Report Generation Started",
        message: "Generating patients report...",
        type: "info",
      });
    });

    it("should show success notification after export", async () => {
      const exportButtons = wrapper
        .findAll("button")
        .filter((button) => button.text().includes("Generate Report"));

      const { useNotificationsStore } = await import(
        "../../src/stores/notifications"
      );
      const notificationsStore = useNotificationsStore();

      // Wait for the simulated delay
      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(notificationsStore.addNotification).toHaveBeenCalledWith({
        title: "Report Generated",
        message: "patients report has been generated successfully",
        type: "success",
      });
    });
  });

  describe("Refresh Functionality", () => {
    it("should refresh all data when refresh button is clicked", async () => {
      const { useAdminStore } = await import("../../src/stores/admin");
      const adminStore = useAdminStore();
      adminStore.getSystemStatistics.mockResolvedValue(mockSystemStats);

      await mountComponent();

      const refreshButton = wrapper
        .find("button")
        .filter((button) => button.text().includes("Refresh Data"))[0];

      await refreshButton.trigger("click");

      expect(wrapper.vm.isRefreshing).toBe(false); // Should be false after refresh
      expect(adminStore.getSystemStatistics).toHaveBeenCalled();
    });
  });

  describe("Audit Logs", () => {
    it("should display recent audit logs", async () => {
      const { useAdminStore } = await import("../../src/stores/admin");
      const adminStore = useAdminStore();
      adminStore.getAuditLogs.mockResolvedValue(mockAuditLogs);

      await mountComponent();

      expect(wrapper.text()).toContain("CREATE_PATIENT");
      expect(wrapper.text()).toContain("UPDATE_APPOINTMENT");
    });

    it("should show no activity message when no logs", async () => {
      const { useAdminStore } = await import("../../src/stores/admin");
      const adminStore = useAdminStore();
      adminStore.getAuditLogs.mockResolvedValue([]);

      await mountComponent();

      expect(wrapper.text()).toContain("No recent activity");
    });
  });

  describe("Helper Functions", () => {
    beforeEach(async () => {
      await mountComponent();
    });

    it("should format log actions correctly", () => {
      expect(wrapper.vm.formatLogAction("CREATE_PATIENT")).toBe(
        "Create Patient"
      );
      expect(wrapper.vm.formatLogAction("UPDATE_APPOINTMENT")).toBe(
        "Update Appointment"
      );
    });

    it("should format dates correctly", () => {
      const dateString = "2024-01-15T10:00:00Z";
      const formatted = wrapper.vm.formatDateTime(dateString);
      expect(formatted).toContain("1/15/2024");
    });

    it("should get correct log level classes", () => {
      expect(wrapper.vm.getLogLevelClass("CREATE_PATIENT")).toBe("bg-success");
      expect(wrapper.vm.getLogLevelClass("UPDATE_APPOINTMENT")).toBe(
        "bg-success"
      );
      expect(wrapper.vm.getLogLevelClass("DELETE_PATIENT")).toBe("bg-danger");
      expect(wrapper.vm.getLogLevelClass("LOGIN")).toBe("bg-info");
    });
  });

  describe("Error Handling", () => {
    it("should handle system stats loading error", async () => {
      const { useAdminStore } = await import("../../src/stores/admin");
      const adminStore = useAdminStore();
      adminStore.getSystemStatistics.mockRejectedValue(new Error("API Error"));

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await mountComponent();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading system stats:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it("should handle patient stats loading error", async () => {
      const { patientService } = await import(
        "../../src/services/patientService"
      );
      patientService.getPatientStatistics.mockRejectedValue(
        new Error("API Error")
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await mountComponent();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading patient stats:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});
