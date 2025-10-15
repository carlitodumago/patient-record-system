import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // State
  const isAuthenticated = ref(false);
  const user = ref(null);
  const userRole = ref("guest");
  const loading = ref(false);

  // Getters
  const isAdmin = computed(() => userRole.value === "admin");
  const isNurse = computed(() => userRole.value === "nurse");
  const isPatient = computed(() => userRole.value === "patient");

  const fullName = computed(() => {
    if (!user.value) return "";
    return `${user.value.firstName || ""} ${user.value.surname || ""}`.trim();
  });

  // Actions
  const login = async (credentials) => {
    loading.value = true;
    try {
      // Simulate API call - replace with actual authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock authentication logic
      const mockUsers = {
        admin: {
          id: 1,
          username: "admin",
          firstName: "System",
          surname: "Administrator",
          email: "admin@baankm3clinic.ph",
          role: "admin",
        },
        "nurse.demo": {
          id: 2,
          username: "nurse.demo",
          firstName: "Maria",
          surname: "Santos",
          email: "maria.santos@baankm3clinic.ph",
          role: "nurse",
        },
        "john.doe": {
          id: 3,
          username: "john.doe",
          firstName: "John",
          surname: "Doe",
          email: "john.doe@email.com",
          role: "patient",
        },
      };

      const mockUser = mockUsers[credentials.username];
      if (mockUser && credentials.password === "password") {
        user.value = mockUser;
        userRole.value = mockUser.role;
        isAuthenticated.value = true;

        // Store in localStorage for persistence
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", mockUser.role);
        localStorage.setItem("user", JSON.stringify(mockUser));

        return { success: true, user: mockUser };
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    isAuthenticated.value = false;
    user.value = null;
    userRole.value = "guest";

    // Clear localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
  };

  const initializeAuth = () => {
    // Check if user is already authenticated on app start
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedRole = localStorage.getItem("userRole");
    const storedUser = localStorage.getItem("user");

    if (storedAuth === "true" && storedRole && storedUser) {
      isAuthenticated.value = true;
      userRole.value = storedRole;
      user.value = JSON.parse(storedUser);
    }
  };

  const updateProfile = async (profileData) => {
    loading.value = true;
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update user data
      user.value = { ...user.value, ...profileData };
      localStorage.setItem("user", JSON.stringify(user.value));

      return { success: true };
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    isAuthenticated,
    user,
    userRole,
    loading,

    // Getters
    isAdmin,
    isNurse,
    isPatient,
    fullName,

    // Actions
    login,
    logout,
    initializeAuth,
    updateProfile,
  };
});
