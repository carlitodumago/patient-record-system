import { ref, computed } from "vue";
import { useAuthStore } from "../stores/auth.js";
import { supabase } from "../main.js";

export const useAuth = () => {
  const authStore = useAuthStore();
  const loading = ref(false);
  const error = ref(null);

  // State from auth store
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const userRole = computed(() => authStore.userRole);
  const supabaseUser = computed(() => authStore.supabaseUser);

  // Role helpers
  const isAdmin = computed(() => authStore.isAdmin);
  const isNurse = computed(() => authStore.isNurse);
  const isPatient = computed(() => authStore.isPatient);

  // Error handler
  const handleError = (err) => {
    console.error("Auth operation error:", err);
    error.value = err.message || "Authentication error occurred";
    return null;
  };

  // Loading wrapper
  const withLoading = async (operation) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await operation();
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Authentication operations
  const login = async (credentials) => {
    return withLoading(async () => {
      const result = await authStore.login(credentials);
      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }
      return result;
    });
  };

  const logout = async () => {
    return withLoading(async () => {
      await authStore.logout();
      return true;
    });
  };

  const updateProfile = async (profileData) => {
    return withLoading(async () => {
      const result = await authStore.updateProfile(profileData);
      if (!result.success) {
        throw new Error(result.error || "Profile update failed");
      }
      return result;
    });
  };

  // Session management
  const refreshSession = async () => {
    return withLoading(async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data;
    });
  };

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  };

  // Password management
  const resetPassword = async (email) => {
    return withLoading(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return true;
    });
  };

  const updatePassword = async (newPassword) => {
    return withLoading(async () => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return true;
    });
  };

  // Email verification
  const resendVerification = async (email) => {
    return withLoading(async () => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });
      if (error) throw error;
      return true;
    });
  };

  // Role-based route guards
  const requireAuth = () => {
    if (!isAuthenticated.value) {
      throw new Error("Authentication required");
    }
  };

  const requireRole = (roles) => {
    requireAuth();
    if (!roles.includes(userRole.value)) {
      throw new Error(`Access denied. Required roles: ${roles.join(", ")}`);
    }
  };

  const canAccess = (allowedRoles) => {
    if (!isAuthenticated.value) return false;
    return allowedRoles.includes(userRole.value);
  };

  // Initialize auth on app start
  const initializeAuth = async () => {
    return withLoading(async () => {
      await authStore.initializeAuth();
      return true;
    });
  };

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isAuthenticated,
    user,
    userRole,
    supabaseUser,

    // Role checks
    isAdmin,
    isNurse,
    isPatient,

    // Authentication operations
    login,
    logout,
    updateProfile,

    // Session management
    refreshSession,
    getSession,
    initializeAuth,

    // Password management
    resetPassword,
    updatePassword,

    // Email verification
    resendVerification,

    // Access control
    requireAuth,
    requireRole,
    canAccess,
  };
};

export default useAuth;
