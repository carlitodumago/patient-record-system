# Gmail API Setup for Account Creation Emails

This guide will help you set up Gmail API integration to send account creation emails with user credentials.

## Prerequisites

1. A Google Cloud Console project
2. Gmail API enabled
3. OAuth 2.0 credentials configured

## Step 1: Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Desktop application" as the application type
4. Download the credentials JSON file
5. Rename it to `credentials.json` and place it in the project root directory

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Baan KM-3 Health Center System"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `https://www.googleapis.com/auth/gmail.send`
5. Add test users (your Gmail accounts for testing)

## Step 4: Run OAuth Authorization

1. Install dependencies if not already done:
   ```bash
   npm install googleapis
   ```

2. Run the OAuth setup script:
   ```bash
   node setup-gmail-oauth.js
   ```

3. Follow the prompts:
   - Visit the authorization URL in your browser
   - Sign in with your Gmail account
   - Grant permission for the app to send emails
   - Copy the authorization code and paste it back in the terminal

4. The script will create a `token.json` file with your access tokens

## Step 5: Security Notes

- Never commit `credentials.json` or `token.json` to version control
- Add these files to your `.gitignore`
- The tokens include refresh tokens for long-term access
- The app only has permission to send emails, not read them

## Step 6: Test the Integration

1. Start your server:
   ```bash
   npm run server
   ```

2. Test the email endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/emails/send-account-creation \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "John",
       "surname": "Doe",
       "username": "john.doe",
       "email": "test@example.com",
       "accountType": "patient",
       "role": "Patient",
       "password": "TempPass123!"
     }'
   ```

## Troubleshooting

### Common Issues:

1. **"invalid_grant" error**: Re-run the OAuth setup script to refresh tokens
2. **"Access blocked" error**: Check your OAuth consent screen configuration
3. **"Gmail API has not been used" error**: Ensure Gmail API is enabled in your project

### Token Expiration:

- Access tokens expire after 1 hour
- Refresh tokens are used automatically to get new access tokens
- If refresh tokens become invalid, re-run the OAuth setup

## Production Deployment

For production deployment:

1. Use a service account instead of OAuth 2.0 for server-to-server authentication
2. Configure domain-wide delegation if using G Suite
3. Store credentials securely using environment variables
4. Implement proper error handling and logging

## Security Best Practices

- The email service does not log sensitive information like passwords
- All email sending is done server-side to prevent client-side exposure
- OAuth tokens are stored securely and refreshed automatically
- Email templates are sanitized to prevent injection attacks