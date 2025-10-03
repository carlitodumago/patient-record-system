// Notification service for sending emails and SMS
// In production, replace with actual email/SMS service providers

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

class NotificationService {
  // Send welcome email with credentials
  async sendWelcomeEmail(email, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "Welcome to Patient Record System - Your Account Details",
          template: "welcome",
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            password: userData.password,
            email: userData.email,
            role: userData.role,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Email sending failed:", error);
      // In development, log the email content instead of failing
      if (import.meta.env.DEV) {
        console.log("📧 [DEV MODE] Email would be sent:", {
          to: email,
          subject: "Welcome to Patient Record System - Your Account Details",
          content: `Welcome ${userData.firstName} ${userData.lastName}!\n\nYour account has been created successfully.\n\nUsername: ${userData.username}\nPassword: ${userData.password}\nEmail: ${userData.email}\nRole: ${userData.role}\n\nPlease change your password after first login.`,
        });
        return { success: true, mode: "development" };
      }
      throw error;
    }
  }

  // Send welcome SMS with credentials
  async sendWelcomeSMS(phoneNumber, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: `Welcome ${userData.firstName} ${userData.lastName}!\n\nYour Patient Record System account:\nUsername: ${userData.username}\nPassword: ${userData.password}\n\nPlease login and change your password.`,
        }),
      });

      if (!response.ok) {
        throw new Error(`SMS service error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("SMS sending failed:", error);
      // In development, log the SMS content instead of failing
      if (import.meta.env.DEV) {
        console.log("📱 [DEV MODE] SMS would be sent:", {
          to: phoneNumber,
          message: `Welcome ${userData.firstName} ${userData.lastName}!\n\nYour Patient Record System account:\nUsername: ${userData.username}\nPassword: ${userData.password}\n\nPlease login and change your password.`,
        });
        return { success: true, mode: "development" };
      }
      throw error;
    }
  }

  // Send admin notification about new user registration
  async sendAdminNotification(userData) {
    try {
      // In production, this would send to admin email(s)
      // For now, we'll use the same email endpoint but with admin subject
      const adminEmail = "admin@patientrecord.system"; // Default admin email

      const response = await fetch(`${API_BASE_URL}/api/notifications/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: adminEmail,
          subject: "New User Registration - Patient Record System",
          template: "admin_notification",
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            contactNumber: userData.contactNumber,
            role: userData.role,
            username: userData.username,
            registrationDate: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Admin notification error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Admin notification failed:", error);
      // In development, log the notification content instead of failing
      if (import.meta.env.DEV) {
        console.log("📧 [DEV MODE] Admin notification would be sent:", {
          to: "admin@patientrecord.system",
          subject: "New User Registration - Patient Record System",
          content: `New user registration:\n\nName: ${userData.firstName} ${userData.lastName}\nEmail: ${userData.email}\nPhone: ${userData.contactNumber}\nRole: ${userData.role}\nUsername: ${userData.username}\n\nPlease review and approve the account.`,
        });
        return { success: true, mode: "development" };
      }
      throw error;
    }
  }

  // Send both email and SMS notifications
  async sendWelcomeNotifications(userData) {
    const notifications = [];

    try {
      // Send email if provided
      if (userData.email) {
        const emailResult = await this.sendWelcomeEmail(
          userData.email,
          userData
        );
        notifications.push({
          type: "email",
          success: true,
          result: emailResult,
        });
      }

      // Send SMS if phone number provided
      if (userData.contactNumber) {
        const smsResult = await this.sendWelcomeSMS(
          userData.contactNumber,
          userData
        );
        notifications.push({
          type: "sms",
          success: true,
          result: smsResult,
        });
      }

      return {
        success: true,
        notifications,
        message: `Welcome notifications sent successfully to ${notifications.length} channel(s)`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        notifications,
        message: "Some notifications failed to send",
      };
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
