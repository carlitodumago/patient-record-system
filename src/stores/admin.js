import { defineStore } from "pinia";
import { adminService } from "../services/adminService.js";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    users: [],
    stats: {},
    isLoading: false,
  }),

  actions: {
    async loadUsers(filters = {}) {
      this.isLoading = true;
      try {
        this.users = await adminService.getAllUsers(filters);
      } finally {
        this.isLoading = false;
      }
    },

    async loadSystemStatistics() {
      this.isLoading = true;
      try {
        this.stats = await adminService.getSystemStats();
      } finally {
        this.isLoading = false;
      }
    },

    async createUserAccount(userData) {
      return await adminService.createUserAccount(userData);
    },

    async resetUserPassword(userId) {
      return await adminService.resetUserPassword(userId);
    },

    async deactivateUser(userId) {
      return await adminService.deactivateUser(userId);
    },

    async reactivateUser(userId) {
      return await adminService.reactivateUser(userId);
    },

    async getAuditLogs(limit = 100) {
      return await adminService.getAuditLogs(limit);
    },

    async exportReports(format = "pdf") {
      return await adminService.exportReports(format);
    },
  },
});
