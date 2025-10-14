import axios from 'axios';

// SMS service using Android SMS Gateway (HTTP request to local phone)
// Fallback to email-to-SMS if carrier supports

const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || 'http://192.168.1.100:8080/send'; // Replace with your Android gateway IP/port
const SMS_API_KEY = process.env.SMS_API_KEY || 'your-api-key'; // If required by gateway

export const sendCredentialsSMS = async (phoneNumber, name, username, password) => {
  const message = `Hello ${name}, your Baan KM-3 Clinic account is active. Username: ${username} Password: ${password} Check your email for full details.`;

  try {
    // Try Android SMS Gateway first
    const response = await axios.post(SMS_GATEWAY_URL, {
      to: phoneNumber,
      message: message,
      apiKey: SMS_API_KEY
    });
    console.log('SMS sent via gateway:', response.data);
  } catch (gatewayError) {
    console.warn('Gateway SMS failed, trying email-to-SMS fallback:', gatewayError.message);

    // Fallback: Email-to-SMS (if carrier supports, e.g., number@tmomail.net for T-Mobile)
    // Note: This requires knowing the carrier's email domain
    const carrierEmail = getCarrierEmail(phoneNumber); // Implement based on carrier
    if (carrierEmail) {
      try {
        await axios.post('http://localhost:3000/api/email-to-sms', { // Assume endpoint exists
          to: carrierEmail,
          message: message
        });
        console.log('SMS sent via email fallback to:', carrierEmail);
      } catch (emailError) {
        console.error('Email-to-SMS fallback failed:', emailError.message);
        throw emailError;
      }
    } else {
      throw new Error('No SMS method available');
    }
  }
};

export const sendAppointmentReminderSMS = async (phoneNumber, name, appointmentDetails) => {
  const message = `Hello ${name}, reminder: Your appointment at Baan KM-3 Health Center is on ${appointmentDetails.dateTime}. Reason: ${appointmentDetails.reason}.`;

  try {
    const response = await axios.post(SMS_GATEWAY_URL, {
      to: phoneNumber,
      message: message,
      apiKey: SMS_API_KEY
    });
    console.log('Reminder SMS sent:', response.data);
  } catch (error) {
    console.error('SMS reminder failed:', error);
    throw error;
  }
};

// Helper to get carrier email domain (simplified; expand as needed)
const getCarrierEmail = (phoneNumber) => {
  // Example: Check prefix or use a lookup service
  // For demo, assume T-Mobile for Philippine numbers starting with certain prefixes
  if (phoneNumber.startsWith('+63')) {
    return `${phoneNumber}@tmomail.net`; // Placeholder; research actual Philippine carriers
  }
  return null;
};
