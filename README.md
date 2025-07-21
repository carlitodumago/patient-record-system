# Web-based Patient Record System

A modern, responsive web application for managing patient records, built with Vue.js, Vuex, and Bootstrap 5.

## Features

- **User Authentication:** Secure login and registration with role-based access control (Admin, Physician, Nurse)
- **Patient Management:** Add, view, edit, and delete patient records with comprehensive details
- **Medical Visits:** Schedule upcoming visits and record completed visits with full CRUD operations
- **Medical Records:** Document patient conditions, diagnoses, and treatment plans
- **Medical History:** View a timeline of a patient's complete medical history
- **Notifications:** Real-time system alerts for patient and visit activities
- **User Preferences:** Personalized settings including auto-logout for security
- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile devices

## Demo Credentials

- **Admin:** username: `admin`, password: `admin123`
- **Physician:** username: `physician`, password: `doctor123`
- **Nurse:** username: `nurse`, password: `nurse123`

## Technology Stack

- Vue.js 3 with Composition API
- Vuex for state management
- Vue Router for navigation
- Bootstrap 5 for UI components
- Bootstrap Icons for iconography
- LocalStorage for data persistence (demo purposes)

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

This is a demonstration project using localStorage for data persistence. In a production environment, you would implement:

- A secure backend API with proper authentication
- Database storage for patient records
- Data encryption for sensitive information
- Comprehensive security measures for HIPAA compliance
- Advanced validation and error handling
- Audit logging for all access to patient data

## License

MIT
