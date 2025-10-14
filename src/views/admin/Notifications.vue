<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-bell</v-icon>
            Notifications Management
            <v-badge
              v-if="unreadCount > 0"
              :content="unreadCount"
              color="error"
              class="ml-3"
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="showAddDialog = true">
              <v-icon left>mdi-plus</v-icon>
              Send Notification
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="notifications"
              :loading="loading"
              class="elevation-1"
            >
              <template v-slot:item.type="{ item }">
                <v-chip :color="getTypeColor(item.type)" dark small>
                  {{ item.type }}
                </v-chip>
              </template>
              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn icon small @click="viewNotification(item)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  color="error"
                  @click="deleteNotification(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Notification Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>Send New Notification</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="notificationForm.title"
                  label="Title"
                  required
                  :rules="[(v) => !!v || 'Title is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="notificationForm.message"
                  label="Message"
                  rows="3"
                  required
                  :rules="[(v) => !!v || 'Message is required']"
                ></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="notificationForm.type"
                  :items="notificationTypes"
                  label="Type"
                  required
                  :rules="[(v) => !!v || 'Type is required']"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="notificationForm.recipientType"
                  :items="recipientTypes"
                  label="Send To"
                  required
                  :rules="[(v) => !!v || 'Recipient type is required']"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                v-if="notificationForm.recipientType === 'specific'"
              >
                <v-select
                  v-model="notificationForm.recipientId"
                  :items="recipients"
                  item-text="fullName"
                  item-value="id"
                  label="Specific Recipient"
                  required
                  :rules="[(v) => !!v || 'Recipient is required']"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="sendNotification"
            :loading="sending"
            :disabled="!valid"
          >
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
              <v-chip
                :color="getTypeColor(selectedNotification.type)"
                dark
                small
                class="ml-2"
              >
                {{ selectedNotification.type }}
              </v-chip>
            </v-col>
            <v-col cols="12">
              <strong>Recipient:</strong>
              {{ selectedNotification.recipientName || "All Users" }}
            </v-col>
            <v-col cols="12">
              <strong>Created:</strong>
              {{ formatDate(selectedNotification.createdAt) }}
            </v-col>
            <v-col cols="12">
              <strong>Read:</strong>
              {{ selectedNotification.read ? "Yes" : "No" }}
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showViewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this notification? This action cannot
          be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="deleting">
            Delete
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
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "@/services/supabase";

const notifications = ref([]);
const recipients = ref([]);
const loading = ref(false);
const unreadCount = ref(0);
const showAddDialog = ref(false);
const showViewDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedNotification = ref(null);
const sending = ref(false);
const deleting = ref(false);
const valid = ref(false);
const realtimeSubscription = ref(null);

const headers = [
  { text: "Title", value: "title" },
  { text: "Message", value: "message" },
  { text: "Type", value: "type" },
  { text: "Recipient", value: "recipientName" },
  { text: "Created", value: "createdAt" },
  { text: "Actions", value: "actions", sortable: false },
];

const notificationTypes = [
  { text: "Info", value: "info" },
  { text: "Success", value: "success" },
  { text: "Warning", value: "warning" },
  { text: "Error", value: "error" },
];

const recipientTypes = [
  { text: "All Users", value: "all" },
  { text: "Specific User", value: "specific" },
];

const notificationForm = ref({
  title: "",
  message: "",
  type: "",
  recipientType: "",
  recipientId: "",
});

const snackbar = ref({
  show: false,
  message: "",
  color: "success",
});

const loadNotifications = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("Notification")
      .select(
        `
        *,
        Users (
          FirstName,
          Surname
        )
      `
      )
      .order("CreatedAt", { ascending: false });

    if (error) throw error;

    notifications.value = data.map((item) => ({
      ...item,
      recipientName: item.Users
        ? `${item.Users.FirstName} ${item.Users.Surname}`
        : "All Users",
    }));

    // Calculate unread count
    unreadCount.value = data.filter(
      (notification) => !notification.IsRead
    ).length;
  } catch (error) {
    console.error("Load notifications error:", error);
    snackbar.value = {
      show: true,
      message: "Failed to load notifications",
      color: "error",
    };
  } finally {
    loading.value = false;
  }
};

const loadRecipients = async () => {
  try {
    const { data, error } = await supabase
      .from("Users")
      .select("UserID, FirstName, Surname");

    if (error) throw error;

    recipients.value = data.map((user) => ({
      ...user,
      fullName: `${user.FirstName} ${user.Surname}`,
    }));
  } catch (error) {
    console.error("Load recipients error:", error);
  }
};

const sendNotification = async () => {
  if (!valid.value) return;

  sending.value = true;
  try {
    const notificationsToInsert = [];

    if (notificationForm.value.recipientType === "all") {
      // Send to all users
      const { data: users, error: usersError } = await supabase
        .from("Users")
        .select("UserID");

      if (usersError) throw usersError;

      notificationsToInsert.push(
        ...users.map((user) => ({
          Title: notificationForm.value.title,
          Message: notificationForm.value.message,
          Type: notificationForm.value.type,
          UserID: user.UserID,
          IsRead: false,
        }))
      );
    } else {
      // Send to specific user
      notificationsToInsert.push({
        Title: notificationForm.value.title,
        Message: notificationForm.value.message,
        Type: notificationForm.value.type,
        UserID: notificationForm.value.recipientId,
        IsRead: false,
      });
    }

    const { error } = await supabase
      .from("Notification")
      .insert(notificationsToInsert);

    if (error) throw error;

    snackbar.value = {
      show: true,
      message: "Notification sent successfully",
      color: "success",
    };

    closeDialog();
    loadNotifications();
  } catch (error) {
    console.error("Send notification error:", error);
    snackbar.value = {
      show: true,
      message: error.message || "Failed to send notification",
      color: "error",
    };
  } finally {
    sending.value = false;
  }
};

const viewNotification = (notification) => {
  selectedNotification.value = notification;
  showViewDialog.value = true;
};

const deleteNotification = (notification) => {
  selectedNotification.value = notification;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    const { error } = await supabase
      .from("Notification")
      .delete()
      .eq("NotificationID", selectedNotification.value.NotificationID);

    if (error) throw error;

    snackbar.value = {
      show: true,
      message: "Notification deleted successfully",
      color: "success",
    };

    showDeleteDialog.value = false;
    loadNotifications();
  } catch (error) {
    console.error("Delete notification error:", error);
    snackbar.value = {
      show: true,
      message: error.message || "Failed to delete notification",
      color: "error",
    };
  } finally {
    deleting.value = false;
  }
};

const closeDialog = () => {
  showAddDialog.value = false;
  notificationForm.value = {
    title: "",
    message: "",
    type: "",
    recipientType: "",
    recipientId: "",
  };
};

const getTypeColor = (type) => {
  switch (type) {
    case "info":
      return "blue";
    case "success":
      return "green";
    case "warning":
      return "orange";
    case "error":
      return "red";
    default:
      return "grey";
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

const setupRealtimeSubscription = () => {
  // Subscribe to new notifications
  realtimeSubscription.value = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Notification",
      },
      (payload) => {
        console.log("New notification received:", payload);
        // Show a toast notification for new notifications
        showNewNotificationToast(payload.new);
        // Reload notifications to show the new one
        loadNotifications();
      }
    )
    .subscribe();
};

const showNewNotificationToast = (notification) => {
  // You can enhance this with a proper toast library later
  snackbar.value = {
    show: true,
    message: `New ${notification.Type} notification: ${notification.Title}`,
    color: "info",
  };
};

const cleanupRealtimeSubscription = () => {
  if (realtimeSubscription.value) {
    supabase.removeChannel(realtimeSubscription.value);
    realtimeSubscription.value = null;
  }
};

onMounted(() => {
  loadNotifications();
  loadRecipients();
  setupRealtimeSubscription();
});

onUnmounted(() => {
  cleanupRealtimeSubscription();
});
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}
</style>
