import { supabase } from "./supabase.js";

export const notificationService = {
  async getAllNotifications(userId) {
    const { data, error } = await supabase
      .from("Notification")
      .select("*")
      .eq("UserID", userId)
      .order("CreatedAt", { ascending: false });
    if (error) throw error;
    return data;
  },

  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from("Notification")
      .insert(notificationData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId) {
    const { data, error } = await supabase
      .from("Notification")
      .update({ Read: true })
      .eq("NotificationID", notificationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAllAsRead(userId) {
    const { error } = await supabase
      .from("Notification")
      .update({ Read: true })
      .eq("UserID", userId)
      .eq("Read", false);
    if (error) throw error;
  },

  async deleteNotification(notificationId) {
    const { error } = await supabase
      .from("Notification")
      .delete()
      .eq("NotificationID", notificationId);
    if (error) throw error;
  },

  async clearAllNotifications(userId) {
    const { error } = await supabase
      .from("Notification")
      .delete()
      .eq("UserID", userId);
    if (error) throw error;
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: `UserID=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },

  // Create auto reminder for upcoming appointments
  async createAppointmentReminder(appointment, hoursBefore = 24) {
    const reminderTime = new Date(appointment.DateTime);
    reminderTime.setHours(reminderTime.getHours() - hoursBefore);

    const now = new Date();
    if (reminderTime <= now) return; // Don't create past reminders

    const reminderData = {
      UserID: appointment.PatientID, // Assuming PatientID is UserID
      Title: `Upcoming Appointment Reminder`,
      Message: `You have an appointment scheduled for ${new Date(
        appointment.DateTime
      ).toLocaleString()}. Reason: ${appointment.Reason || "N/A"}`,
      Type: "appointment",
      Read: false,
      CreatedAt: new Date().toISOString(),
    };

    return await this.createNotification(reminderData);
  },

  // Send email notification (placeholder for Gmail integration)
  async sendEmail(to, subject, body) {
    // TODO: Integrate Gmail API
    console.log(`Sending email to ${to}: ${subject}`);
  },

  // Send SMS notification (placeholder for SMS gateway)
  async sendSMS(to, message) {
    // TODO: Integrate SMS gateway
    console.log(`Sending SMS to ${to}: ${message}`);
  },
};
