# Admin Account Setup

This document explains how to create the admin account for the Patient Record System.

## Prerequisites

1. Make sure you have Node.js installed
2. Ensure your Supabase project is set up with the correct environment variables in `.env`
3. Install dependencies: `npm install`

## Creating the Admin Account

### Method 1: Using the Script (Recommended)

1. Install the dotenv dependency if not already installed:
   ```bash
   npm install dotenv
   ```

2. Run the admin creation script:
   ```bash
   npm run create-admin
   ```

3. The script will create an admin account with:
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Role**: `admin`
   - **Full Name**: `System Administrator`

### Method 2: Manual Creation via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user"
4. Fill in the details:
   - Email: `admin@patientrecord.system` (required by Supabase)
   - Password: `admin123`
   - Email Confirm: Yes
   - User Metadata:
     ```json
     {
       "username": "admin",
       "role": "admin",
       "full_name": "System Administrator"
     }
     ```

## Login Instructions

After creating the admin account, you can log in using:

- **Username**: `admin`
- **Password**: `admin123`

## Security Notes

⚠️ **Important**: Change the default admin password after first login in a production environment.

## Troubleshooting

If you encounter issues:

1. Verify your Supabase environment variables are correct
2. Check that your Supabase service role key has admin permissions
3. Ensure the Supabase project allows user creation
4. Check the console for any error messages

## Role-Based Access

The admin account will have full access to:
- All patient records
- User management
- System settings
- All dashboard features

Other roles (nurse, patient) will have restricted access based on their permissions.