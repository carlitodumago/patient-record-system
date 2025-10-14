import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const loading = ref(false)

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  const loadNotifications = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      notifications.value = data
      return { success: true }
    } catch (error) {
      console.error('Load notifications error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.read = true
      }
      return { success: true }
    } catch (error) {
      console.error('Mark as read error:', error)
      return { success: false, error: error.message }
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false)

      if (error) throw error

      notifications.value.forEach(n => n.read = true)
      return { success: true }
    } catch (error) {
      console.error('Mark all as read error:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteNotification = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error

      notifications.value = notifications.value.filter(n => n.id !== id)
      return { success: true }
    } catch (error) {
      console.error('Delete notification error:', error)
      return { success: false, error: error.message }
    }
  }

  const addNotification = (notification) => {
    notifications.value.unshift({
      id: notification.id || Date.now(),
      created_at: notification.created_at || new Date(),
      read: notification.read || false,
      ...notification
    })
  }

  return {
    notifications,
    loading,
    unreadCount,
    unreadNotifications,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  }
})
