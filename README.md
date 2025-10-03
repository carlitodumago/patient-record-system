# Web-based Patient Record System

A modern, responsive web application for managing patient records, built with Vue.js, Vuex, and Bootstrap 5.

## Features

- **User Authentication:** Secure login and registration with role-based access control (Admin, Nurse, Patient) using Supabase Auth
- **Patient Management:** Add, view, edit, and delete patient records with comprehensive details
- **Medical Visits:** Schedule upcoming visits and record completed visits with full CRUD operations
- **Medical Records:** Document patient conditions, diagnoses, and treatment plans
- **Medical History:** View a timeline of a patient's complete medical history
- **Calendar Integration:** Schedule and manage appointments with Google Calendar sync
- **Notifications:** Real-time system alerts for patient and visit activities
- **User Preferences:** Personalized settings including auto-logout for security
- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile devices

## Demo Credentials

- **Admin:** `admin` / `admin123`
    - **Nurse/Clinic Staff:** `nurse` / `nurse123`
    - **Patient:** `patient` / `patient123`

## Technology Stack

- Vue.js 3 with Composition API
- Vuex for state management
- Vue Router for navigation
- Bootstrap 5 for UI components
- Bootstrap Icons for iconography
- Supabase for backend services (Auth, Database)
- Google Calendar API for calendar integration
- LocalStorage for client-side caching

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm (v6 or newer)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to the URL shown in the terminal (usually http://localhost:5173)

### Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:
   - **Supabase:** Add your Supabase project URL and API keys
   - **Google Calendar (Optional):** Add Google API credentials for calendar integration

## Google Calendar Integration (Optional)

The system supports Google Calendar integration for appointment synchronization:

### Setup Steps

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google Calendar API:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API" and enable it

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Create "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs (e.g., `http://localhost:5173` for development)

4. **Configure Environment Variables:**
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
   VITE_GOOGLE_REDIRECT_URI=http://localhost:5173
   ```

5. **Features Available:**
   - Connect your Google Calendar account
   - View Google Calendar events alongside system appointments
   - Auto-sync new appointments to Google Calendar (when enabled)
   - Distinguish between system and Google Calendar events

## Building for Production

```bash
npm run build
```

## Features Implemented

1. **Patient Management**
   - Complete CRUD operations for patient records
   - Detailed patient information including medical conditions, allergies
   - Patient search and filtering

2. **Medical Visits**
   - Schedule upcoming visits
   - Record completed visits
   - Edit and delete functionality
   - Mark visits as completed
   - Search and filter by status

3. **Medical Records**
   - Document patient conditions, diagnoses, and treatment plans
   - Full CRUD operations
   - Associate records with specific patients

4. **Medical History**
   - Combined timeline view of all patient medical events
   - Chronological display with filtering options

5. **User Authentication**
   - Login/Logout functionality
   - Role-based access
   - Auto-logout for security

6. **Notifications**
   - Real-time notifications for system actions
   - Notification center for viewing all alerts
   - Mark notifications as read

7. **User Settings**
   - Configurable auto-logout timer
   - Notification preferences
   - Persistent user settings

## Notes

This application now uses Supabase for backend services and authentication, providing a more robust and scalable solution compared to the original localStorage-based demo. The system includes:

- **Supabase Authentication:** Secure user registration and login with role-based access control
- **Database Storage:** Patient records, appointments, and user data stored in Supabase
- **Real-time Features:** Live notifications and user management updates
- **Google Calendar Integration:** Optional calendar synchronization for appointment management

### Production Considerations

For production deployment, ensure:

- Proper Supabase project configuration with appropriate security policies
- Google Calendar API credentials configured for calendar features
- HTTPS enabled for secure authentication flows
- Regular backup procedures for patient data
- HIPAA compliance measures for healthcare data handling
- Comprehensive audit logging for all patient data access
- Regular security updates and monitoring

## License

MIT
