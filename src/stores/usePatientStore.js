import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export const usePatientStore = defineStore('patient', () => {
  const patients = ref([])
  const currentPatient = ref(null)
  const loading = ref(false)

  const getPatientById = computed(() => {
    return (id) => patients.value.find(p => p.id === id)
  })

  const loadPatients = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      patients.value = data
      return { success: true }
    } catch (error) {
      console.error('Load patients error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const createPatient = async (patientData) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single()

      if (error) throw error

      patients.value.push(data)
      return { success: true, data }
    } catch (error) {
      console.error('Create patient error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const updatePatient = async (id, patientData) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const index = patients.value.findIndex(p => p.id === id)
      if (index !== -1) {
        patients.value[index] = data
      }
      if (currentPatient.value?.id === id) {
        currentPatient.value = data
      }
      return { success: true, data }
    } catch (error) {
      console.error('Update patient error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const deletePatient = async (id) => {
    loading.value = true
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)

      if (error) throw error

      patients.value = patients.value.filter(p => p.id !== id)
      if (currentPatient.value?.id === id) {
        currentPatient.value = null
      }
      return { success: true }
    } catch (error) {
      console.error('Delete patient error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const setCurrentPatient = (patient) => {
    currentPatient.value = patient
  }

  return {
    patients,
    currentPatient,
    loading,
    getPatientById,
    loadPatients,
    createPatient,
    updatePatient,
    deletePatient,
    setCurrentPatient
  }
})
