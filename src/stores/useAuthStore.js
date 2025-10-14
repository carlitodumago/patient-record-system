import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isDoctor = computed(() => user.value?.role === 'doctor')
  const isNurse = computed(() => user.value?.role === 'nurse')
  const isReceptionist = computed(() => user.value?.role === 'receptionist')

  const login = async (email, password) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Get user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      user.value = profile
      isAuthenticated.value = true

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(profile))

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      user.value = null
      isAuthenticated.value = false
      localStorage.removeItem('user')
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && profile) {
          user.value = profile
          isAuthenticated.value = true
          localStorage.setItem('user', JSON.stringify(profile))
        }
      }
    } catch (error) {
      console.error('Check auth error:', error)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) throw error

      user.value = { ...user.value, ...data }
      localStorage.setItem('user', JSON.stringify(user.value))

      return { success: true, data }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin,
    isDoctor,
    isNurse,
    isReceptionist,
    login,
    logout,
    checkAuth,
    updateProfile
  }
})
