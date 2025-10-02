import express from "express";
import nodemailer from "nodemailer";
import twilio from "twilio";

const router = express.Router();

// Email configuration (replace with your actual email service)
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "your-email@gmail.com",
    pass: process.env.SMTP_PASS || "your-app-password",
  },
});

// SMS configuration (replace with your actual SMS service)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || "your-twilio-sid",
  process.env.TWILIO_AUTH_TOKEN || "your-twilio-token"
);

// Email sending endpoint
router.post("/email", async (req, res) => {
  try {
    const { to, subject, template, data } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, subject",
      });
    }

    let htmlContent = "";
    let textContent = "";

    // Generate email content based on template
    if (template === "welcome") {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d6efd;">Welcome to Patient Record System!</h2>
          <p>Dear ${data.firstName} ${data.lastName},</p>
          <p>Your account has been successfully created. Here are your login credentials:</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Username:</strong> ${data.username}</p>
            <p><strong>Password:</strong> ${data.password}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Role:</strong> ${data.role}</p>
          </div>

          <p style="color: #dc3545; font-weight: bold;">
            ⚠️ Please change your password after your first login for security.
          </p>

          <p>You can now log in to your account at: <a href="${
            process.env.FRONTEND_URL || "http://localhost:5174"
          }">${process.env.FRONTEND_URL || "http://localhost:5174"}</a></p>

          <p>Best regards,<br>Patient Record System Team</p>
        </div>
      `;

      textContent = `
Welcome to Patient Record System!

Dear ${data.firstName} ${data.lastName},

Your account has been successfully created. Here are your login credentials:

Username: ${data.username}
Password: ${data.password}
Email: ${data.email}
Role: ${data.role}

⚠️ Please change your password after your first login for security.

You can now log in to your account at: ${
        process.env.FRONTEND_URL || "http://localhost:5174"
      }

Best regards,
Patient Record System Team
      `;
    }

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@patientrecord.com",
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);

    res.json({
      success: true,
      messageId: info.messageId,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send email",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// SMS sending endpoint
router.post("/sms", async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, message",
      });
    }

    // Format phone number (ensure it starts with +)
    const formattedNumber = to.startsWith("+") ? to : `+${to}`;

    const smsResult = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
      to: formattedNumber,
    });

    console.log("SMS sent successfully:", smsResult.sid);

    res.json({
      success: true,
      messageId: smsResult.sid,
      message: "SMS sent successfully",
    });
  } catch (error) {
    console.error("SMS sending error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send SMS",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Test endpoint for development
router.post("/test", (req, res) => {
  console.log("📧 [TEST] Email would be sent to:", req.body.to);
  console.log("📱 [TEST] SMS would be sent to:", req.body.to);
  console.log("Message:", req.body.message || req.body.subject);

  res.json({
    success: true,
    mode: "test",
    message: "Test notification logged (not actually sent)",
  });
});

export default router;
