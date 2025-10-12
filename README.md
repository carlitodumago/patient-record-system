# 🏥 Barangay Baan KM-3 Health Information System

A comprehensive web-based Health Information System designed for community health centers in the Philippines, specifically developed for Barangay Baan KM-3 Health Center in Butuan City.

## 🌟 Features

### 🔐 Security & Authentication
- **Role-based Access Control (RBAC)** with 4 user roles:
  - Administrator (Full system access)
  - Nurse (Patient management & medical records)
  - Staff (Limited access)
  - Patient (Personal records only)
- **Advanced Password Policies** with strength validation
- **Account Security** with lockout mechanisms and audit logging
- **Secure Authentication** with JWT tokens and bcrypt hashing

### 👥 User Management
- **Admin-controlled Account Creation** with automatic credential generation
- **Automatic Email/SMS Notifications** for new account credentials
- **User Profile Management** with role-based permissions
- **Bulk User Operations** for efficient data management

### 🏥 Patient Management
- **Comprehensive Patient Records** with demographics and medical history
- **CRUD Operations** for patient data management
- **Advanced Search & Filtering** capabilities
- **Patient Statistics** and demographic analysis

### 👨‍⚕️ Staff Management
- **Healthcare Professional Profiles** with specializations and licenses
- **Staff Performance Tracking** and workload management
- **Professional Information Management** (license numbers, specializations)
- **Role-based Staff Access** control

### 📅 Appointment Scheduling
- **Interactive Appointment Management** with calendar integration
- **Patient-Staff Assignment** for appointments
- **Appointment Reminders** via email and SMS
- **Conflict Detection** and availability checking
- **Appointment Analytics** and reporting

### 📋 Medical Records
- **Complete Medical Record Management** with ICD-10 diagnosis codes
- **Treatment Tracking** with medication and therapy records
- **Vital Signs Recording** and health metrics
- **Medical History** documentation
- **Follow-up Instructions** and care plans

### 📊 Reports & Analytics
- **Comprehensive Dashboard** with real-time statistics
- **Patient Demographics** analysis
- **Staff Performance** metrics
- **Appointment Trends** and utilization reports
- **Export Functionality** for external reporting

### 🔔 Notifications System
- **Real-time Notifications** for system events
- **Email Integration** with Gmail API
- **SMS Notifications** via Android SMS Gateway
- **Appointment Reminders** and follow-up alerts
- **System Announcements** and updates

## 🛠️ Technology Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Bootstrap** - UI component library
- **Bootstrap Icons** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework

### Security & Communication
- **bcryptjs** - Password hashing
- **JWT** - JSON Web Tokens for authentication
- **Nodemailer** - Email sending
- **SMS Gateway** - Android-based SMS delivery

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Gmail account (for notifications)
- Android phone (for SMS gateway - optional)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd patient-record-system-4
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gmail Configuration (for notifications)
GMAIL_USER=your-health-center@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# SMS Gateway Configuration (optional)
SMS_GATEWAY_URL=http://your-android-phone:8080/send

# Frontend Configuration
FRONTEND_URL=http://localhost:5173

# Security Configuration
JWT_SECRET=your_jwt_secret_key_here
```

### 4. Database Setup
1. Create a new project in Supabase
2. Go to the SQL Editor in your Supabase dashboard
3. Run the database schema from `database/schema.sql`

### 5. Gmail Setup (for notifications)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password for the health information system
3. Use this App Password in the `GMAIL_APP_PASSWORD` environment variable

### 6. SMS Gateway Setup (Optional)
For cost-free SMS notifications:
1. Install an Android SMS Gateway app on your phone
2. Configure the app to listen on a port (e.g., 8080)
3. Set the `SMS_GATEWAY_URL` to `http://your-phone-ip:8080/send`

### 7. Start the Development Server
```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately
npm run dev      # Frontend (Vite)
npm run server   # Backend (Express)
```

### 8. Create Admin User
1. Open the application in your browser
2. Navigate to `/admin/users`
3. Create your first administrator account
4. The system will automatically generate secure credentials and send them via email/SMS

## 📁 Project Structure

```
patient-record-system-4/
├── database/
│   └── schema.sql              # Complete database schema
├── server/
│   ├── index.js               # Express server setup
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── models/               # Data models
│   │   ├── Patient.js
│   │   └── User.js
│   └── routes/               # API routes
│       ├── patients.js
│       └── users.js
├── src/
│   ├── components/           # Reusable Vue components
│   ├── composables/          # Vue composables
│   ├── layouts/             # Layout components
│   ├── router/              # Vue Router configuration
│   ├── services/            # API services
│   │   ├── adminService.js
│   │   ├── appointmentService.js
│   │   ├── authService.js
│   │   ├── medicalRecordService.js
│   │   ├── notificationService.js
│   │   ├── patientService.js
│   │   ├── securityService.js
│   │   ├── staffService.js
│   │   └── supabase.js
│   ├── stores/              # Pinia stores
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── notifications.js
│   │   └── patients.js
│   ├── utils/               # Utility functions
│   ├── views/               # Vue views/pages
│   │   ├── admin/           # Admin-only pages
│   │   │   ├── AppointmentManagement.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── MedicalRecordsManagement.vue
│   │   │   ├── ReportsDashboard.vue
│   │   │   ├── StaffManagement.vue
│   │   │   └── UserManagement.vue
│   │   ├── nurse/           # Nurse pages
│   │   ├── patient/         # Patient pages
│   │   ├── CalendarView.vue
│   │   ├── Login.vue
│   │   ├── NotificationsView.vue
│   │   ├── PatientList.vue
│   │   └── Register.vue
│   ├── App.vue              # Root component
│   └── main.js              # Application entry point
├── .env.example             # Environment configuration template
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🔒 Security Features

### Password Policies
- Minimum 8 characters, maximum 128 characters
- Must contain uppercase and lowercase letters
- Must contain numbers and special characters
- Rejects common passwords
- Prevents sequential characters
- 90-day password expiration

### Account Security
- Account lockout after multiple failed attempts
- Rate limiting for authentication attempts
- Comprehensive audit logging
- Input sanitization and validation
- Secure session management

### Data Protection
- Row Level Security (RLS) in PostgreSQL
- Role-based data access control
- Encrypted password storage with bcrypt
- Secure API endpoints with authentication

## 📱 User Roles & Permissions

### Administrator
- ✅ Create and manage all user accounts
- ✅ Access all patient records
- ✅ Manage staff and roles
- ✅ View all reports and analytics
- ✅ Configure system settings
- ✅ Full audit log access

### Nurse
- ✅ Register and update patient information
- ✅ Create and edit medical records
- ✅ Schedule and manage appointments
- ✅ Send patient notifications
- ✅ View patient history

### Staff
- ✅ View assigned patient records
- ✅ Assist with appointment scheduling
- ✅ Limited medical record access
- ✅ Basic patient information management

### Patient
- ✅ View personal medical records
- ✅ Update personal information
- ✅ Book and manage appointments
- ✅ Receive notifications and reminders

## 🔄 API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `POST /api/users/logout` - User logout

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Medical Records
- `GET /api/medical-records` - Get all records
- `GET /api/medical-records/:id` - Get record by ID
- `POST /api/medical-records` - Create medical record
- `PUT /api/medical-records/:id` - Update record

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
1. Configure production environment variables
2. Set up Supabase production database
3. Configure Gmail API credentials
4. Set up SMS gateway (if using)
5. Deploy to hosting platform

### Recommended Hosting
- **Frontend**: Netlify, Vercel, or Firebase Hosting
- **Backend**: Railway, Render, or Heroku
- **Database**: Supabase (already configured)

## 📊 System Requirements

### Minimum Requirements
- Node.js 16+
- Modern web browser with JavaScript enabled
- Internet connection for Supabase access
- Gmail account for notifications

### Recommended Specifications
- 2GB RAM
- Dual-core processor
- Stable internet connection
- Android phone (for SMS gateway)

## 🔧 Configuration

### Supabase Setup
1. Create new project at supabase.com
2. Copy connection URL and anon key to `.env`
3. Run the provided SQL schema
4. Enable Row Level Security policies

### Gmail Configuration
1. Enable 2FA on Gmail account
2. Generate App Password
3. Add to `GMAIL_APP_PASSWORD` in `.env`

## 📞 Support & Contact

For technical support or questions regarding the Barangay Baan KM-3 Health Information System, please contact the development team.

## 📄 License

This project is developed specifically for Barangay Baan KM-3 Health Center in Butuan City, Philippines.

---

**Built with ❤️ for community healthcare**
