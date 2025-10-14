<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-bell</v-icon>
            Notifications
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="tab" class="mb-4">
              <v-tab>All Notifications</v-tab>
              <v-tab>Unread</v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <v-tab-item>
                <v-data-table
                  :headers="headers"
                  :items="allNotifications"
                  :loading="loading"
                  class="elevation-1"
                >
                  <template v-slot:item.type="{ item }">
                    <v-chip
                      :color="getTypeColor(item.type)"
                      dark
                      small
                    >
                      {{ item.type }}
                    </v-chip>
                  </template>
                  <template v-slot:item.read="{ item }">
                    <v-chip
                      :color="item.read ? 'success' : 'warning'"
                      dark
                      small
                    >
                      {{ item.read ? 'Read' : 'Unread' }}
                    </v-chip>
                  </template>
                  <template v-slot:item.createdAt="{ item }">
                    {{ formatDate(item.createdAt) }}
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      v-if="!item.read"
                      icon
                      small
                      color="primary"
                      @click="markAsRead(item)"
                    >
                      <v-icon>mdi-email-open</v-icon>
                    </v-btn>
                    <v-btn icon small @click="viewNotification(item)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>

              <v-tab-item>
                <v-data-table
                  :headers="headers"
                  :items="unreadNotifications"
                  :loading="loading"
                  class="elevation-1"
                >
                  <template v-slot:item.type="{ item }">
                    <v-chip
                      :color="getTypeColor(item.type)"
                      dark
                      small
                    >
                      {{ item.type }}
                    </v-chip>
                  </template>
                  <template v-slot:item.read="{ item }">
                    <v-chip color="warning" dark small>
                      Unread
                    </v-chip>
                  </template>
                  <template v-slot:item.createdAt="{ item }">
                    {{ formatDate(item.createdAt) }}
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn icon small color="primary" @click="markAsRead(item)">
                      <v-icon>mdi-email-open</v-icon>
                    </v-btn>
                    <v-btn icon small @click="viewNotification(item)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- View Notification Dialog -->
    <v-dialog v-model="showViewDialog" max-width="600px">
      <v-card v-if="selectedNotification">
        <v-card-title>Notification Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <strong>Title:</strong> {{ selectedNotification.title }}
            </v-col>
            <v-col cols="12">
              <strong>Message:</strong> {{ selectedNotification.message }}
            </v-col>
            <v-col cols="12">
              <strong>Type:</strong>
              <v-chip :color="getTypeColor(selectedNotification.type)" dark small class="ml-2">
                {{ selectedNotification.type }}
              </v-chip>
            </v-col>
            <v-col cols="12">
              <strong>Status:</strong>
              <v-chip :color="selectedNotification.read ? 'success' : 'warning'" dark small class="ml-2">
                {{ selectedNotification.read ? 'Read' : 'Unread' }}
              </v-chip>
            </v-col>
            <v-col cols="12">
              <strong>Created:</strong> {{ formatDate(selectedNotification.createdAt) }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showViewDialog = false">Close</v-btn>
          <v-btn
            v-if="!selectedNotification.read"
            color="primary"
            @click="markAsRead(selectedNotification); showViewDialog = false"
          >
            Mark as Read
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/services/supabase'

const notifications = ref([])
const loading = ref(false)
const tab = ref(0)
const showViewDialog = ref(false)
const selectedNotification = ref(null)

const headers = [
  { text: 'Title', value: 'title' },
  { text: 'Message', value: 'message' },
  { text: 'Type', value: 'type' },
  { text: 'Status', value: 'read' },
  { text: 'Created', value: 'createdAt' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const allNotifications = computed(() => {
  return notifications.value
})

const unreadNotifications = computed(() => {
  return notifications.value.filter(notification => !notification.read)
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const loadNotifications = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipientId', 1) // TODO: Get from current user
      .order('created_at', { ascending: false })

    if (error) throw error

    notifications.value = data
  } catch (error) {
    console.error('Load notifications error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to load notifications',
      color: 'error'
    }
  } finally {
    loading.value = false
  }
}

const markAsRead = async (notification) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification.id)

    if (error) throw error

    snackbar.value = {
      show: true,
      message: 'Notification marked as read',
      color: 'success'
    }

    loadNotifications()
  } catch (error) {
    console.error('Mark as read error:', error)
    snackbar.value = {
      show: true,
      message: 'Failed to mark notification as read',
      color: 'error'
    }
  }
}

const viewNotification = (notification) => {
  selectedNotification.value = notification
  showViewDialog.value = true
}

const getTypeColor = (type) => {
  switch (type) {
    case 'info': return 'blue'
    case 'success': return 'green'
    case 'warning': return 'orange'
    case 'error': return 'red'
    default: return 'grey'
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}
</style>
