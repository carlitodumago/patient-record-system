import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export const useAppointmentStore = defineStore('appointment', () => {
  const appointments = ref([])
  const loading = ref(false)

  const upcomingAppointments = computed(() => {
    const now = new Date()
    return appointments.value
      .filter(apt => new Date(apt.date + ' ' + apt.time) > now)
      .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
  })

  const todayAppointments = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.value.filter(apt => apt.date === today)
  })

  const loadAppointments = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) throw error

      appointments.value = data
      return { success: true }
    } catch (error) {
      console.error('Load appointments error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const createAppointment = async (appointmentData) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single()

      if (error) throw error

      appointments.value.push(data)
      return { success: true, data }
    } catch (error) {
      console.error('Create appointment error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const updateAppointment = async (id, appointmentData) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index] = data
      }
      return { success: true, data }
    } catch (error) {
      console.error('Update appointment error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const deleteAppointment = async (id) => {
    loading.value = true
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error

      appointments.value = appointments.value.filter(a => a.id !== id)
      return { success: true }
    } catch (error) {
      console.error('Delete appointment error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const updateAppointmentStatus = async (id, status) => {
    return updateAppointment(id, { status })
  }

  return {
    appointments,
    loading,
    upcomingAppointments,
    todayAppointments,
    loadAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    updateAppointmentStatus
  }
})
