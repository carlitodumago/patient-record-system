import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { supabase } from "@/services/supabase";

// Global auth state to prevent multiple subscriptions
let globalAuthSubscription = null;
let authInitialized = false;

export function useAuth() {
  const store = useStore();
  const user = ref(null);
  const session = ref(null);
  const loading = ref(true);

  // Computed properties
  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed(() => user.value?.user_metadata?.role || "patient");

  // Update store with user data
  const updateStore = (userData, sessionData) => {
    try {
      if (userData) {
        store.commit("setAuthenticated", true);
        store.commit("setUser", {
          id: userData.id,
          email: userData.email,
          role: userData.user_metadata?.role || "patient",
          fullName: userData.user_metadata?.full_name || userData.email,
        });
      } else {
        store.commit("setAuthenticated", false);
        store.commit("setUser", null);
      }
    } catch (error) {
      console.error("Error updating store:", error);
    }
  };

  // Initialize auth state
  const initializeAuth = async () => {
    if (authInitialized) return;
    
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      
      session.value = currentSession;
      user.value = currentSession?.user ?? null;
      
      updateStore(user.value, session.value);
      authInitialized = true;
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      loading.value = false;
    }
  };

  // Listen for auth changes (only create one global subscription)
  onMounted(() => {
    initializeAuth();

    if (!globalAuthSubscription) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, sessionData) => {
        session.value = sessionData;
        user.value = sessionData?.user ?? null;
        
        updateStore(user.value, session.value);
        loading.value = false;
      });
      
      globalAuthSubscription = subscription;
      window.globalAuthSubscription = subscription;
    }
  });

  // Clean up subscription when component unmounts
  onUnmounted(() => {
    // Don't unsubscribe here as other components might be using auth
    // The subscription will be cleaned up when the app unmounts
  });

  // Login function
  const login = async (email, password) => {
    try {
      loading.value = true;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  };

  // Register function
  const register = async (email, password, metadata = {}) => {
    try {
      loading.value = true;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      loading.value = true;
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    } finally {
      loading.value = false;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    session,
    loading,
    isAuthenticated,
    userRole,
    login,
    register,
    logout,
    resetPassword,
  };
}
