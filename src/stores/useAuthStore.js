import { defineStore } from "pinia";
import { supabase } from "@/services/supabase";
import { ref, computed } from "vue";
import { auditService } from "@/services/auditService";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);

  const isAdmin = computed(() => user.value?.role === "admin");
  const isNurse = computed(() => user.value?.role === "nurse");

  const login = async (identifier, password) => {
    loading.value = true;
    try {
      let email = identifier;

      // Check if input is username or email
      const isEmail = identifier.includes("@");

      if (!isEmail) {
        // Input is username, look up the email
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select("Email, UserID")
          .eq("Username", identifier)
          .single();

        if (userError || !userData) {
          throw new Error("Invalid username or password");
        }

        email = userData.Email;
      }

      // Now login with email
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile from Users table with role information
      const { data: profile, error: profileError } = await supabase
        .from("Users")
        .select(
          `
          *,
          Role:RoleID(RoleName)
        `
        )
        .eq("Email", email)
        .single();

      if (profileError) throw profileError;

      // Add role name for easier access
      const userWithRole = {
        ...profile,
        role: profile.Role?.RoleName || "patient",
      };

      user.value = userWithRole;
      isAuthenticated.value = true;

      // Log successful login
      await auditService.logLoginSuccess(data.user.id);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);

      // Log failed login attempt
      await auditService.logLoginFailed(identifier, error.message);

      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      const currentUserId = user.value?.UserID;

      await supabase.auth.signOut();
      user.value = null;
      isAuthenticated.value = false;

      // Log logout event
      if (currentUserId) {
        await auditService.logLogout(currentUserId);
      }

      // User data is now managed by Supabase session
      // No need for localStorage removal
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("Users")
          .select(
            `
            *,
            Role:RoleID(RoleName)
          `
          )
          .eq("Email", session.user.email)
          .single();

        if (!error && profile) {
          // Add role name for easier access
          const userWithRole = {
            ...profile,
            role: profile.Role?.RoleName || "patient",
          };
          user.value = userWithRole;
          isAuthenticated.value = true;
        }
      }
    } catch (error) {
      console.error("Check auth error:", error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from("Users")
        .update(updates)
        .eq("Email", user.value.Email)
        .select(
          `
          *,
          Role:RoleID(RoleName)
        `
        )
        .single();

      if (error) throw error;

      // Add role name for easier access
      const updatedUser = {
        ...data,
        role: data.Role?.RoleName || user.value.role,
      };

      user.value = { ...user.value, ...updatedUser };

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      // Update password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) throw authError;

      // Log password change
      await auditService.logPasswordChange(user.value.UserID);

      return { success: true };
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin,
    isNurse,
    login,
    logout,
    checkAuth,
    updateProfile,
    changePassword,
  };
});
