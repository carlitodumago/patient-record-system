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

  async deleteNotification(notificationId) {
    const { error } = await supabase
      .from("Notification")
      .delete()
      .eq("NotificationID", notificationId);
    if (error) throw error;
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
