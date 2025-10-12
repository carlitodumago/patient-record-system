import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import PatientMedicalRecords from "../../src/views/PatientMedicalRecords.vue";
import { medicalRecordService } from "../../src/services/medicalRecordService";

// Mock the medical record service
vi.mock("../../src/services/medicalRecordService", () => ({
  medicalRecordService: {
    getRecordsByPatientDirect: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    deleteRecord: vi.fn(),
  },
}));

// Mock useAuthStore
vi.mock("../../src/stores/auth", () => ({
  useAuthStore: () => ({
    user: { id: "test-user-id" },
  }),
}));

describe("PatientMedicalRecords Component", () => {
  let wrapper;
  let router;
  let pinia;

  const mockRecords = [
    {
      id: "1",
      title: "Initial Consultation",
      type: "diagnosis",
      description: "Patient presented with symptoms",
      createdBy: "Dr. Smith",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      title: "Follow-up Visit",
      type: "treatment",
      description: "Treatment plan discussed",
      createdBy: "Dr. Smith",
      createdAt: "2024-01-20T10:00:00Z",
      updatedAt: "2024-01-20T10:00:00Z",
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
          path: "/patients/:id",
          name: "PatientDetails",
          component: { template: "<div>Patient Details</div>" },
        },
        {
          path: "/patients/:id/records",
          name: "PatientMedicalRecords",
          component: PatientMedicalRecords,
        },
      ],
    });

    // Mock route params
    router.push("/patients/123/records");
    await router.isReady();

    // Reset mocks
    vi.clearAllMocks();
    medicalRecordService.getRecordsByPatientDirect.mockResolvedValue(
      mockRecords
    );
  });

  const mountComponent = async () => {
    wrapper = mount(PatientMedicalRecords, {
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
      expect(wrapper.find("h1").text()).toBe("Medical Records for Patient 123");
    });

    it("should display loading state initially", async () => {
      medicalRecordService.getRecordsByPatientDirect.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockRecords), 100))
      );
      await mountComponent();
      expect(wrapper.text()).toContain("Loading records...");
    });

    it("should display records list when data is loaded", async () => {
      await mountComponent();
      expect(wrapper.text()).toContain("Initial Consultation");
      expect(wrapper.text()).toContain("Follow-up Visit");
    });

    it("should display no records message when empty", async () => {
      medicalRecordService.getRecordsByPatientDirect.mockResolvedValue([]);
      await mountComponent();
      expect(wrapper.text()).toContain(
        "No medical records found for this patient."
      );
    });
  });

  describe("Record Display", () => {
    beforeEach(async () => {
      await mountComponent();
    });

    it("should display record titles correctly", () => {
      const recordCards = wrapper.findAll(".record-card");
      expect(recordCards).toHaveLength(2);
      expect(recordCards[0].text()).toContain("Initial Consultation");
      expect(recordCards[1].text()).toContain("Follow-up Visit");
    });

    it("should display record metadata", () => {
      const recordCards = wrapper.findAll(".record-card");
      expect(recordCards[0].text()).toContain("Dr. Smith");
      expect(recordCards[0].text()).toContain("diagnosis");
    });

    it("should format dates correctly", () => {
      const recordCards = wrapper.findAll(".record-card");
      expect(recordCards[0].text()).toContain("1/15/2024");
    });
  });

  describe("Modal Functionality", () => {
    beforeEach(async () => {
      await mountComponent();
    });

    it("should open add record modal when button is clicked", async () => {
      const addButton = wrapper.find(".btn-primary");
      await addButton.trigger("click");
      expect(wrapper.vm.showAddRecordModal).toBe(true);
      expect(wrapper.find(".modal").exists()).toBe(true);
    });

    it("should open edit record modal when edit button is clicked", async () => {
      const editButtons = wrapper.findAll(".btn-warning");
      await editButtons[0].trigger("click");
      expect(wrapper.vm.showEditRecordModal).toBe(true);
      expect(wrapper.vm.recordForm.title).toBe("Initial Consultation");
    });

    it("should open view record modal when view button is clicked", async () => {
      const viewButtons = wrapper.findAll(".btn-info");
      await viewButtons[0].trigger("click");
      expect(wrapper.vm.showViewRecordModal).toBe(true);
      expect(wrapper.vm.selectedRecord.title).toBe("Initial Consultation");
    });

    it("should close modal when close button is clicked", async () => {
      await wrapper.find(".btn-primary").trigger("click"); // Open modal
      const closeButton = wrapper.find(".close-btn");
      await closeButton.trigger("click");
      expect(wrapper.vm.showAddRecordModal).toBe(false);
    });
  });

  describe("CRUD Operations", () => {
    beforeEach(async () => {
      await mountComponent();
    });

    it("should create a new record", async () => {
      medicalRecordService.createRecord.mockResolvedValue({ id: "3" });

      // Open add modal
      await wrapper.find(".btn-primary").trigger("click");

      // Fill form
      const titleInput = wrapper.find("#title");
      const typeSelect = wrapper.find("#type");
      const descTextarea = wrapper.find("#description");

      await titleInput.setValue("New Record");
      await typeSelect.setValue("note");
      await descTextarea.setValue("Test description");

      // Submit form
      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      expect(medicalRecordService.createRecord).toHaveBeenCalledWith({
        appointmentId: null,
        enteredBy: "test-user-id",
        notes: "Test description",
      });
    });

    it("should update an existing record", async () => {
      medicalRecordService.updateRecord.mockResolvedValue({ id: "1" });

      // Open edit modal
      const editButtons = wrapper.findAll(".btn-warning");
      await editButtons[0].trigger("click");

      // Modify form
      const titleInput = wrapper.find("#title");
      await titleInput.setValue("Updated Title");

      // Submit form
      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      expect(medicalRecordService.updateRecord).toHaveBeenCalledWith("1", {
        appointmentId: undefined,
        enteredBy: "test-user-id",
        noteId: undefined,
        notes: "Patient presented with symptoms",
      });
    });

    it("should delete a record after confirmation", async () => {
      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
      medicalRecordService.deleteRecord.mockResolvedValue();

      const deleteButtons = wrapper.findAll(".btn-danger");
      await deleteButtons[0].trigger("click");

      expect(confirmSpy).toHaveBeenCalledWith(
        "Are you sure you want to delete this record?"
      );
      expect(medicalRecordService.deleteRecord).toHaveBeenCalledWith("1");

      confirmSpy.mockRestore();
    });

    it("should not delete record if confirmation is cancelled", async () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

      const deleteButtons = wrapper.findAll(".btn-danger");
      await deleteButtons[0].trigger("click");

      expect(confirmSpy).toHaveBeenCalled();
      expect(medicalRecordService.deleteRecord).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe("Navigation", () => {
    it("should navigate back to patient details", async () => {
      await mountComponent();
      const backButton = wrapper.find(".btn-secondary");

      // Spy on router.push
      const pushSpy = vi.spyOn(router, "push");

      await backButton.trigger("click");

      expect(pushSpy).toHaveBeenCalledWith("/patients/123");
      pushSpy.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch records error gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      medicalRecordService.getRecordsByPatientDirect.mockRejectedValue(
        new Error("API Error")
      );

      await mountComponent();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching records:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it("should handle save record error gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      medicalRecordService.createRecord.mockRejectedValue(
        new Error("Save Error")
      );

      await mountComponent();
      await wrapper.find(".btn-primary").trigger("click");

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error saving record:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
});
