import axios from "axios";
import { supabase } from "./supabase";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach auth token to requests
api.interceptors.request.use(
  async (config) => {
    // Get current session from Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers["x-auth-token"] = session.access_token;
    }

    // Get user role from Supabase
    if (session?.user) {
      const { data: userData } = await supabase
        .from("Users")
        .select("Role:RoleID(RoleName)")
        .eq("Email", session.user.email)
        .single();

      if (userData?.Role?.RoleName) {
        config.headers["x-user-role"] = userData.Role.RoleName;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services - now using Supabase
export const authService = {
  login: async (credentials) => {
    try {
      let email = credentials.email;

      // Check if input is username or email
      const isEmail = email.includes("@");

      if (!isEmail) {
        // Input is username, look up the email
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select("Email, UserID")
          .eq("Username", email)
          .single();

        if (userError || !userData) {
          throw new Error("Invalid username or password");
        }

        email = userData.Email;
      }

      // Now login with email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: credentials.password,
      });

      if (error) throw error;

      // Get user profile from Users table with role information
      // Since database uses integer UserID but auth uses UUID, find by email instead
      const { data: userProfile, error: profileError } = await supabase
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
      const userData = {
        ...userProfile,
        role: userProfile.Role?.RoleName || "patient",
        token: data.session.access_token,
      };

      // Token and user data are now managed by Pinia store
      // No need for localStorage storage here

      return userData;
    } catch (error) {
      throw error.message || { message: "Login failed" };
    }
  },

  register: async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) throw error;

      // Create user profile in Users table
      const { data: profile, error: profileError } = await supabase
        .from("Users")
        .insert([
          {
            UserID: data.user.id,
            Email: userData.email,
            Username: userData.username,
            Role: userData.role || "patient",
            IsActive: true,
            CreatedAt: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      return profile;
    } catch (error) {
      throw error.message || { message: "Registration failed" };
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from("Users")
          .select(
            `
            *,
            Role:RoleID(RoleName)
          `
          )
          .eq("Email", session.user.email)
          .single();

        if (!error && userData) {
          // Add role name for easier access
          return {
            ...userData,
            role: userData.Role?.RoleName || "patient",
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  },
};

// Patient services - now using Supabase
export const patientService = {
  getAllPatients: async () => {
    try {
      const { data, error } = await supabase
        .from("Patients")
        .select("*")
        .order("CreatedAt", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error.message || { message: "Failed to fetch patients" };
    }
  },

  getPatientById: async (id) => {
    try {
      const { data, error } = await supabase
        .from("Patients")
        .select("*")
        .eq("PatientID", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error.message || { message: "Failed to fetch patient" };
    }
  },

  createPatient: async (patientData) => {
    try {
      const { data, error } = await supabase
        .from("Patients")
        .insert([patientData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error.message || { message: "Failed to create patient" };
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      const { data, error } = await supabase
        .from("Patients")
        .update(patientData)
        .eq("PatientID", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error.message || { message: "Failed to update patient" };
    }
  },

  deletePatient: async (id) => {
    try {
      const { error } = await supabase
        .from("Patients")
        .delete()
        .eq("PatientID", id);

      if (error) throw error;
      return { message: "Patient deleted successfully" };
    } catch (error) {
      throw error.message || { message: "Failed to delete patient" };
    }
  },
};

// User services - now using Supabase
export const userService = {
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from("Users")
        .select(
          `
          *,
          Role:RoleID(RoleName)
        `
        )
        .order("CreatedAt", { ascending: false });

      if (error) throw error;

      // Add role name for easier access
      return data.map((user) => ({
        ...user,
        role: user.Role?.RoleName || "patient",
      }));
    } catch (error) {
      throw error.message || { message: "Failed to fetch users" };
    }
  },
};

export default api;
