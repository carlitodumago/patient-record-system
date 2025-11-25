import { google } from "googleapis";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Gmail API configuration
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const TOKEN_PATH = join(__dirname, "../../token.json");
const CREDENTIALS_PATH = join(__dirname, "../../credentials.json");

/**
 * Load client secrets from a local file.
 */
async function loadCredentials() {
  try {
    const credentials = require(CREDENTIALS_PATH);
    return credentials;
  } catch (err) {
    throw new Error(`Error loading client secret file: ${err.message}`);
  }
}

/**
 * Create an OAuth2 client with the given credentials.
 */
async function authorize() {
  const credentials = await loadCredentials();
  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  try {
    const token = require(TOKEN_PATH);
    oAuth2Client.setCredentials(token);
  } catch (err) {
    throw new Error("Token not found. Please run the OAuth flow first.");
  }

  return oAuth2Client;
}

/**
 * Send an email using Gmail API
 */
async function sendEmail(auth, to, subject, htmlContent, textContent) {
  const gmail = google.gmail({ version: "v1", auth });

  const messageParts = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    htmlContent,
  ];

  const message = messageParts.join("\n");

  // The body needs to be base64url encoded.
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return res.data;
}

/**
 * Generate professional HTML email template for account credentials
 */
function generateAccountCreationEmailTemplate(userData) {
  const { firstName, surname, username, email, accountType, role, password } =
    userData;

  const accountTypeDisplay = accountType === "patient" ? "Patient" : "Staff";
  const roleDisplay = role || accountTypeDisplay;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Baan KM-3 Health Center</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            margin: 20px;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .welcome-message {
            font-size: 18px;
            color: #495057;
            margin-bottom: 20px;
        }
        .credentials-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .credential-item {
            margin-bottom: 15px;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }
        .credential-label {
            font-weight: bold;
            color: #495057;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            background-color: #e9ecef;
            padding: 8px 12px;
            border-radius: 4px;
            margin-top: 5px;
            word-break: break-all;
        }
        .important-note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .important-note h4 {
            color: #856404;
            margin-top: 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        .login-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .login-button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏥 Baan KM-3 Health Center</div>
            <h1>Welcome to Our System!</h1>
        </div>

        <div class="welcome-message">
            <p>Hello <strong>${firstName} ${surname}</strong>,</p>
            <p>Your account has been successfully created! You can now access our healthcare management system.</p>
        </div>

        <div class="credentials-box">
            <h3 style="margin-top: 0; color: #007bff;">Your Account Credentials</h3>

            <div class="credential-item">
                <div class="credential-label">Username</div>
                <div class="credential-value">${username}</div>
            </div>

            <div class="credential-item">
                <div class="credential-label">Email Address</div>
                <div class="credential-value">${email}</div>
            </div>

            <div class="credential-item">
                <div class="credential-label">Account Type</div>
                <div class="credential-value">${accountTypeDisplay}</div>
            </div>

            <div class="credential-item">
                <div class="credential-label">Role</div>
                <div class="credential-value">${roleDisplay}</div>
            </div>

            <div class="credential-item">
                <div class="credential-label">Temporary Password</div>
                <div class="credential-value">${password}</div>
            </div>
        </div>

        <div class="important-note">
            <h4>🔐 Security Notice</h4>
            <p><strong>Please change your password immediately after your first login.</strong> This temporary password is for initial access only.</p>
            <p>For security reasons, we recommend using a strong password with a combination of uppercase letters, lowercase letters, numbers, and special characters.</p>
        </div>

        <div style="text-align: center;">
            <a href="#" class="login-button">Access Your Account</a>
        </div>

        <div class="footer">
            <p><strong>Baan KM-3 Health Center Information System</strong></p>
            <p>If you have any questions or need assistance, please contact our support team.</p>
            <p style="font-size: 12px; margin-top: 10px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Send account creation email
 */
export async function sendAccountCreationEmail(userData) {
  try {
    const auth = await authorize();

    const { firstName, surname, username, email, accountType, role, password } =
      userData;

    const subject =
      "Welcome to Baan KM-3 Health Center - Your Account Credentials";
    const htmlContent = generateAccountCreationEmailTemplate(userData);
    const textContent = `
Hello ${firstName} ${surname},

Your account has been created successfully!

Username: ${username}
Email: ${email}
Account Type: ${accountType === "patient" ? "Patient" : "Staff"}
Role: ${role || (accountType === "patient" ? "Patient" : "Staff")}
Temporary Password: ${password}

Please change your password after first login.

Best regards,
Baan KM-3 Health Center Information System
    `.trim();

    const result = await sendEmail(
      auth,
      email,
      subject,
      htmlContent,
      textContent
    );

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error(`Failed to send account creation email: ${error.message}`);
  }
}

export default {
  sendAccountCreationEmail,
};
