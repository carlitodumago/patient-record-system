import { defineStore } from "pinia";
import { authService } from "../services/authService.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    role: null,
    permissions: [],
    isAuthenticated: false,
  }),

  getters: {
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission);
    },
  },

  actions: {
    async login(email, password) {
      try {
        const user = await authService.login(email, password);
        this.user = user;
        this.isAuthenticated = true;
        this.role = await authService.getUserRole(user.id);
        this.permissions = await authService.getUserPermissions(user.id);
        return user;
      } catch (error) {
        throw error;
      }
    },

    async logout() {
      await authService.logout();
      this.user = null;
      this.role = null;
      this.permissions = [];
      this.isAuthenticated = false;
    },

    async createUser(userData) {
      return await authService.createUser(userData);
    },

    async resetPassword(email) {
      return await authService.resetPassword(email);
    },
  },
});
