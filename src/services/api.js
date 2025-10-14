import axios from 'axios';
import { supabase } from './supabase';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach auth token to requests
api.interceptors.request.use(
  async config => {
    // Get current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers['x-auth-token'] = session.access_token;
    }

    // Get user role from Supabase
    if (session?.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userData?.role) {
        config.headers['x-user-role'] = userData.role;
      }
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Auth services - now using Supabase
export const authService = {
  login: async (credentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw error;

      // Get user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      const userData = {
        ...userProfile,
        token: data.session.access_token
      };

      // Token and user data are now managed by Pinia store
      // No need for localStorage storage here

      return userData;
    } catch (error) {
      throw error.message || { message: 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (error) throw error;

      // Create user profile in users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email: userData.email,
          username: userData.username,
          full_name: userData.fullName,
          role: userData.role || 'patient',
          phone: userData.phone,
          is_active: true
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      return profile;
    } catch (error) {
      throw error.message || { message: 'Registration failed' };
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && userData) {
          return userData;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};

// Patient services - now using Supabase
export const patientService = {
  getAllPatients: async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error.message || { message: 'Failed to fetch patients' };
    }
  },

  getPatientById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error.message || { message: 'Failed to fetch patient' };
    }
  },

  createPatient: async (patientData) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error.message || { message: 'Failed to create patient' };
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error.message || { message: 'Failed to update patient' };
    }
  },

  deletePatient: async (id) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { message: 'Patient deleted successfully' };
    } catch (error) {
      throw error.message || { message: 'Failed to delete patient' };
    }
  }
};

// User services - now using Supabase
export const userService = {
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error.message || { message: 'Failed to fetch users' };
    }
  }
};

export default api;
