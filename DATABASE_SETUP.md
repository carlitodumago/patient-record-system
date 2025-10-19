# Hospital Information System (HIS) - Supabase Setup Guide

## Overview

This project now uses Supabase (PostgreSQL cloud service) for data persistence, replacing the previous in-memory storage system. The database schema matches the provided HIS requirements with proper relationships and constraints.

## Database Schema

The system includes the following tables:

- **Role**: User roles (admin, nurse, patient)
- **Users**: User authentication and profile information
- **Staff**: Staff member details (linked to Users)
- **Patients**: Patient information (linked to Users)
- **Appointment**: Appointment scheduling and management
- **Diagnosis**: Medical diagnoses
- **Treatment**: Treatment plans
- **Notes**: Consultation and progress notes
- **MedicalRecord**: Links appointments with diagnoses, treatments, and notes
- **Notification**: System notifications for users

## Prerequisites

1. **Supabase Account**: Create a free account at https://supabase.com
2. **Node.js**: Ensure Node.js 16+ is installed

## Setup Instructions

### 1. Supabase Project Setup

1. **Create a new project** in your Supabase dashboard
2. **Go to Settings > API** to get your project credentials:
   - Project URL (SUPABASE_URL)
   - anon/public key (SUPABASE_ANON_KEY)

### 2. Database Tables Creation

Create the following tables in your Supabase SQL editor:

```sql
-- Create Role table
CREATE TABLE IF NOT EXISTS "Role" (
  "RoleID" SERIAL PRIMARY KEY,
  "RoleName" VARCHAR(50) UNIQUE NOT NULL
);

-- Create Users table
CREATE TABLE IF NOT EXISTS "Users" (
  "UserID" VARCHAR(255) PRIMARY KEY,
  "Username" VARCHAR(100) UNIQUE NOT NULL,
  "Password" VARCHAR(255) NOT NULL,
  "Email" VARCHAR(255) UNIQUE NOT NULL,
  "RoleID" INTEGER REFERENCES "Role"("RoleID"),
  "CreatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Staff table
CREATE TABLE IF NOT EXISTS "Staff" (
  "StaffID" SERIAL PRIMARY KEY,
  "UserID" VARCHAR(255) REFERENCES "Users"("UserID"),
  "FirstName" VARCHAR(100) NOT NULL,
  "Surname" VARCHAR(100) NOT NULL,
  "Suffix" VARCHAR(10),
  "ContactNumber" VARCHAR(20)
);

-- Create Patients table
CREATE TABLE IF NOT EXISTS "Patients" (
  "PatientID" SERIAL PRIMARY KEY,
  "UserID" VARCHAR(255) REFERENCES "Users"("UserID"),
  "FirstName" VARCHAR(100) NOT NULL,
  "Surname" VARCHAR(100) NOT NULL,
  "Suffix" VARCHAR(10),
  "Address" TEXT,
  "Gender" VARCHAR(10),
  "BirthDate" DATE,
  "ContactNumber" VARCHAR(20)
);

-- Create Appointment table
CREATE TABLE IF NOT EXISTS "Appointment" (
  "AppointmentID" SERIAL PRIMARY KEY,
  "ScheduledBy" INTEGER REFERENCES "Staff"("StaffID"),
  "PatientID" INTEGER REFERENCES "Patients"("PatientID"),
  "DateTime" TIMESTAMP NOT NULL,
  "Status" VARCHAR(50) DEFAULT 'pending',
  "Reason" TEXT,
  "CreatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Diagnosis table
CREATE TABLE IF NOT EXISTS "Diagnosis" (
  "DiagnosisID" SERIAL PRIMARY KEY,
  "Description" TEXT NOT NULL
);

-- Create Treatment table
CREATE TABLE IF NOT EXISTS "Treatment" (
  "TreatmentID" SERIAL PRIMARY KEY,
  "Description" TEXT NOT NULL
);

-- Create Notes table
CREATE TABLE IF NOT EXISTS "Notes" (
  "NoteID" SERIAL PRIMARY KEY,
  "Content" TEXT NOT NULL
);

-- Create MedicalRecord table
CREATE TABLE IF NOT EXISTS "MedicalRecord" (
  "RecordID" SERIAL PRIMARY KEY,
  "AppointmentID" INTEGER REFERENCES "Appointment"("AppointmentID"),
  "EnteredBy" INTEGER REFERENCES "Staff"("StaffID"),
  "DiagnosisID" INTEGER REFERENCES "Diagnosis"("DiagnosisID"),
  "TreatmentID" INTEGER REFERENCES "Treatment"("TreatmentID"),
  "NoteID" INTEGER REFERENCES "Notes"("NoteID"),
  "CreatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
  "NotificationID" SERIAL PRIMARY KEY,
  "UserID" VARCHAR(255) REFERENCES "Users"("UserID"),
  "Message" TEXT NOT NULL,
  "CreatedAt" TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO "Role" ("RoleName") VALUES ('admin'), ('nurse'), ('patient') ON CONFLICT ("RoleName") DO NOTHING;
```

### 3. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Initialize Database

Initialize the database with default data:

```bash
npm run db:init
```

### 6. Start the Application

The system will connect to your Supabase database:

```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

## User Management

Users should be created through the proper registration process in the application. The system no longer creates default users automatically.

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `GET /api/appointments/patient/:patientId` - Get appointments by patient
- `GET /api/appointments/staff/:staffId` - Get appointments by staff
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Medical Records
- `GET /api/medical-records` - Get all medical records
- `GET /api/medical-records/:id` - Get medical record by ID
- `GET /api/medical-records/appointment/:appointmentId` - Get records by appointment
- `POST /api/medical-records` - Create medical record
- `PUT /api/medical-records/:id` - Update medical record
- `DELETE /api/medical-records/:id` - Delete medical record

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/user/:userId` - Get notifications by user
- `GET /api/notifications/:id` - Get notification by ID
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id` - Update notification
- `DELETE /api/notifications/:id` - Delete notification
- `PATCH /api/notifications/:id/read` - Mark as read

### Staff
- `GET /api/staff` - Get all staff
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

## Testing the API

Run the test script to verify all endpoints are working:

```bash
node server/test-api.js
```

## Data Relationships

The database uses the following relationships:

- Users → Role (Many-to-One)
- Staff → Users (One-to-One)
- Patients → Users (One-to-One)
- Appointment → Staff (Many-to-One)
- Appointment → Patients (Many-to-One)
- MedicalRecord → Appointment (Many-to-One)
- MedicalRecord → Staff (Many-to-One)
- MedicalRecord → Diagnosis (Many-to-One)
- MedicalRecord → Treatment (Many-to-One)
- MedicalRecord → Notes (Many-to-One)
- Notification → Users (Many-to-One)

## Development Notes

- The system uses Supabase client for database operations
- Tables must be created manually in Supabase (SQL provided above)
- Default roles and admin user are seeded on first run
- Passwords are stored in plain text (as per original schema) - implement hashing for production
- The system includes proper error handling and validation
- Row Level Security (RLS) can be enabled in Supabase for additional security

## Supabase Features Used

- **Authentication**: Built-in auth system (can be integrated later)
- **Database**: PostgreSQL with real-time capabilities
- **API**: RESTful API with automatic API generation
- **Real-time subscriptions**: For live updates (can be added later)

## Troubleshooting

1. **Connection Issues**: Verify your Supabase URL and API key are correct
2. **Table Not Found**: Make sure you've run the SQL script in Supabase SQL editor
3. **Permission Issues**: Ensure your API key has the right permissions
4. **CORS Issues**: Configure CORS in Supabase dashboard if needed

## Production Deployment

For production deployment:

1. Use strong passwords and implement password hashing
2. Set up proper JWT token authentication
3. Configure environment variables securely
4. Enable Row Level Security (RLS) in Supabase
5. Set up database backups in Supabase dashboard
6. Use Supabase's built-in authentication for user management
7. Monitor usage in Supabase dashboard

## Supabase Dashboard

Access your project dashboard at: https://supabase.com/dashboard

Useful sections:
- **Table Editor**: Manage your database tables
- **SQL Editor**: Run queries and manage data
- **API Docs**: Auto-generated API documentation
- **Authentication**: Manage users and settings
- **Settings**: Configure project settings and security