import { defineStore } from "pinia";
import { notificationService } from "../services/notificationService.js";

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    notifications: [],
    subscription: null,
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter((n) => !n.Read).length,
  },

  actions: {
    async loadNotifications(userId) {
      try {
        this.notifications = await notificationService.getAllNotifications(
          userId
        );
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    },

    async createNotification(notificationData) {
      try {
        const newNotification = await notificationService.createNotification(
          notificationData
        );
        this.notifications.unshift(newNotification);
        return newNotification;
      } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
      }
    },

    async markAsRead(id) {
      try {
        await notificationService.markAsRead(id);
        const notification = this.notifications.find(
          (n) => n.NotificationID === id
        );
        if (notification) {
          notification.Read = true;
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },

    async markAllAsRead(userId) {
      try {
        await notificationService.markAllAsRead(userId);
        this.notifications.forEach((notification) => {
          notification.Read = true;
        });
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    },

    async deleteNotification(id) {
      try {
        await notificationService.deleteNotification(id);
        this.notifications = this.notifications.filter(
          (n) => n.NotificationID !== id
        );
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },

    async clearAll(userId) {
      try {
        await notificationService.clearAllNotifications(userId);
        this.notifications = [];
      } catch (error) {
        console.error("Error clearing all notifications:", error);
      }
    },

    // Subscribe to real-time notifications
    subscribeToNotifications(userId) {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }

      this.subscription = notificationService.subscribeToNotifications(
        userId,
        (newNotification) => {
          // Add new notification to the beginning of the array
          this.notifications.unshift(newNotification);
        }
      );
    },

    // Unsubscribe from real-time notifications
    unsubscribeFromNotifications() {
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    },

    // Create appointment reminder
    async createAppointmentReminder(appointment, hoursBefore = 24) {
      try {
        return await notificationService.createAppointmentReminder(
          appointment,
          hoursBefore
        );
      } catch (error) {
        console.error("Error creating appointment reminder:", error);
      }
    },
  },
});
