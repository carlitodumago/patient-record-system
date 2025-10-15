# 🏥 Baan KM-3 Health Information System

A comprehensive web-based Health Information System designed for the Barangay Baan KM-3 Health Center in Butuan City, Philippines.

## 🚀 Features

### 👥 Multi-Role Support
- **Administrator**: Complete system management and oversight
- **Nurse/Healthcare Staff**: Patient care and medical record management
- **Patient**: Personal health management and appointment booking

### 📋 Core Modules

#### Admin Features
- ✅ User account creation with automatic credential generation
- ✅ Staff and patient management
- ✅ Appointment scheduling and oversight
- ✅ Medical records management
- ✅ System notifications and alerts
- ✅ Reports and analytics dashboard

#### Nurse Features
- ✅ Patient registration and management
- ✅ Vital signs recording
- ✅ Medical record creation and editing
- ✅ Appointment request handling
- ✅ Treatment protocol management
- ✅ Consultation notes documentation

#### Patient Features
- ✅ Personal health dashboard
- ✅ Appointment booking and management
- ✅ Medical record access
- ✅ Health reminders and notifications

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3 + Vuetify + Pinia
- **Backend**: Supabase (Authentication + PostgreSQL)
- **Server Logic**: Node.js (Gmail/SMS automation)
- **Styling**: Bootstrap 5 + Bootstrap Icons
- **State Management**: Pinia

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd patient-record-system-3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env

   # Configure your Supabase credentials
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   ```
   http://localhost:5173
   ```

## 🔐 Demo Accounts

### Test Users
Use these credentials to test different user roles:

#### Administrator
- **Username**: `admin`
- **Password**: `password`
- **Access**: Full system administration

#### Nurse/Healthcare Staff
- **Username**: `nurse`
- **Password**: `password`
- **Access**: Patient management and medical records

#### Patient
- **Username**: `patient`
- **Password**: `password`
- **Access**: Personal health management

## 📁 Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── RoleBasedSidebar.vue    # Role-specific navigation
│   └── ...
├── views/              # Page components by role
│   ├── admin/          # Administrator views
│   ├── nurse/          # Nurse/Staff views
│   └── patient/        # Patient views
├── stores/             # Pinia state management
│   └── auth.js         # Authentication store
├── router/             # Route definitions
│   ├── admin.js        # Admin routes
│   ├── nurse.js        # Nurse routes
│   └── patient.js      # Patient routes
├── layouts/            # Layout components
└── services/           # API services
```

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional healthcare design
- **Role-Based Navigation**: Dynamic sidebar based on user permissions
- **Interactive Dashboards**: Real-time statistics and charts
- **Smooth Animations**: Enhanced user experience
- **Dark/Light Theme Support**: Adaptive theming

## 🔒 Security Features

- **Role-Based Access Control (RBAC)**
- **Secure Authentication** via Supabase
- **Password Encryption** for production
- **Audit Logging** for sensitive actions
- **Session Management** with auto-logout

## 📱 Mobile Support

- **Responsive Layouts**: Optimized for all screen sizes
- **Touch-Friendly**: Large buttons and easy navigation
- **Mobile-First**: Designed for healthcare workers on-the-go

## 🚀 Deployment

### Supabase Setup

1. **Create a new project** in Supabase
2. **Set up authentication** with email/password
3. **Create database tables** based on the schema provided
4. **Configure RLS policies** for data security

### Build for Production

```bash
npm run build
```

## 📊 Database Schema

See the detailed schema in the project requirements for table structures including:
- Users and Roles
- Staff and Patient management
- Appointments and scheduling
- Medical records and history
- Notifications and alerts

## 🔧 Development

### Adding New Features

1. **Create views** in appropriate role directories
2. **Add routes** to respective router files
3. **Update navigation** in RoleBasedSidebar.vue
4. **Add state management** in Pinia stores

### Code Style

- **ESLint** for code quality
- **Prettier** for formatting
- **Vue 3 Composition API** patterns

## 🧪 Testing

```bash
# Run unit tests
npm run test:unit

# Run e2e tests
npm run test:e2e
```

## 📚 Documentation

- **Component Documentation**: Available in each component file
- **API Documentation**: Supabase auto-generated docs
- **User Guide**: In-app help and tooltips

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Advanced reporting with charts
- [ ] Mobile app (React Native)
- [ ] Telemedicine features
- [ ] AI-powered health insights
- [ ] Integration with medical devices

---

**Built with ❤️ for Barangay Baan KM-3 Health Center**
