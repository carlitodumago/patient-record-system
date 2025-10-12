import { defineStore } from "pinia";
import { notificationService } from "../services/notificationService.js";

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    notifications: [],
  }),

  actions: {
    async fetchNotifications(userId) {
      this.notifications = await notificationService.getAllNotifications(
        userId
      );
    },

    async createNotification(notificationData) {
      const newNotification = await notificationService.createNotification(
        notificationData
      );
      this.notifications.unshift(newNotification);
      return newNotification;
    },

    async markAsRead(id) {
      await notificationService.markAsRead(id);
      const notification = this.notifications.find(
        (n) => n.NotificationID === id
      );
      if (notification) {
        notification.Read = true;
      }
    },

    async deleteNotification(id) {
      await notificationService.deleteNotification(id);
      this.notifications = this.notifications.filter(
        (n) => n.NotificationID !== id
      );
    },
  },
});
