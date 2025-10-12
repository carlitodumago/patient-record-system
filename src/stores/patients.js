import { defineStore } from "pinia";
import { patientService } from "../services/patientService.js";

export const usePatientsStore = defineStore("patients", {
  state: () => ({
    patients: [],
    currentPatient: null,
    isLoading: false,
    filters: {
      search: "",
      gender: "",
      bloodType: "",
      medicalCondition: "",
    },
    statistics: {
      total: 0,
      male: 0,
      female: 0,
      byBloodType: {},
    },
  }),

  getters: {
    filteredPatients: (state) => {
      let filtered = state.patients;

      if (state.filters.search) {
        const query = state.filters.search.toLowerCase();
        filtered = filtered.filter(
          (patient) =>
            patient.FirstName?.toLowerCase().includes(query) ||
            patient.Surname?.toLowerCase().includes(query) ||
            patient.ContactNumber?.includes(query)
        );
      }

      if (state.filters.gender) {
        filtered = filtered.filter(
          (patient) => patient.Gender === state.filters.gender
        );
      }

      if (state.filters.bloodType) {
        filtered = filtered.filter(
          (patient) => patient.BloodType === state.filters.bloodType
        );
      }

      if (state.filters.medicalCondition) {
        filtered = filtered.filter((patient) =>
          patient.MedicalConditions?.some((condition) =>
            condition
              .toLowerCase()
              .includes(state.filters.medicalCondition.toLowerCase())
          )
        );
      }

      return filtered;
    },
  },

  actions: {
    async loadPatients(force = false) {
      if (this.patients.length === 0 || force) {
        this.isLoading = true;
        try {
          this.patients = await patientService.getAllPatients();
        } finally {
          this.isLoading = false;
        }
      }
    },

    async loadStatistics() {
      try {
        const stats = await patientService.getPatientStatistics();
        this.statistics = stats;
      } catch (error) {
        console.error("Failed to load patient statistics:", error);
      }
    },

    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },

    clearFilters() {
      this.filters = {
        search: "",
        gender: "",
        bloodType: "",
        medicalCondition: "",
      };
    },

    async fetchPatient(id) {
      this.isLoading = true;
      try {
        this.currentPatient = await patientService.getPatientById(id);
        return this.currentPatient;
      } finally {
        this.isLoading = false;
      }
    },

    async createPatient(patientData) {
      const newPatient = await patientService.createPatient(patientData);
      this.patients.push(newPatient);
      await this.loadStatistics(); // Refresh statistics
      return newPatient;
    },

    async updatePatient(id, patientData) {
      const updatedPatient = await patientService.updatePatient(
        id,
        patientData
      );
      const index = this.patients.findIndex((p) => p.PatientID === id);
      if (index !== -1) {
        this.patients[index] = updatedPatient;
      }
      return updatedPatient;
    },

    async deletePatient(id) {
      await patientService.deletePatient(id);
      this.patients = this.patients.filter((p) => p.PatientID !== id);
      await this.loadStatistics(); // Refresh statistics
    },

    async searchPatients(query) {
      return await patientService.searchPatients(query);
    },
  },
});
