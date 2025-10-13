export default {
  state: {
    notifications: [],
  },
  mutations: {
    setNotifications(state, notifications) {
      state.notifications = notifications;
    },
    addNotification(state, notification) {
      state.notifications.unshift(notification);
    },
    markNotificationAsRead(state, id) {
      const notification = state.notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead(state) {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    deleteNotification(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id);
    },
  },
  actions: {
    // Actions can be added here if needed
  },
  getters: {
    unreadNotifications: state => state.notifications.filter(n => !n.read),
    unreadCount: state => state.notifications.filter(n => !n.read).length,
  },
};
