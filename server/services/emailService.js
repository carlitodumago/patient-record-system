import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

// Gmail OAuth2 setup (replace with your credentials)
const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID || 'your-client-id',
  process.env.GMAIL_CLIENT_SECRET || 'your-client-secret',
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN || 'your-refresh-token'
});

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    accessToken: oauth2Client.getAccessToken()
  }
});

export const sendCredentialsEmail = async (email, name, username, password) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your Baan KM-3 Health Center Account Credentials',
    html: `
      <p>Hello ${name},</p>
      <p>Your account has been created for the Baan KM-3 Health Center Information System.</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
      <p>Please change your password upon first login.</p>
      <p>– Baan KM-3 Health Center Information System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Credentials email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendAppointmentReminder = async (email, name, appointmentDetails) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Appointment Reminder - Baan KM-3 Health Center',
    html: `
      <p>Hello ${name},</p>
      <p>This is a reminder for your upcoming appointment at Baan KM-3 Health Center.</p>
      <p><strong>Date & Time:</strong> ${appointmentDetails.dateTime}</p>
      <p><strong>Reason:</strong> ${appointmentDetails.reason}</p>
      <p>Please arrive 15 minutes early.</p>
      <p>– Baan KM-3 Health Center Information System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reminder email sent to:', email);
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};
