# TODO List for Health Information System Development

## Phase 1: Tech Stack Alignment
- [x] Install Vuetify and remove Bootstrap dependencies
- [x] Set up Supabase client and remove Mongoose
- [x] Update package.json with new dependencies (Vuetify, Supabase SDK)

## Phase 2: Backend Setup (Supabase)
- [x] Create Supabase project and configure authentication
- [x] Create database tables per schema (Role, Users, Staff, Patients, Appointment, MedicalRecord, etc.)
- [x] Migrate existing models to Supabase (update User.js, Patient.js)
- [x] Update routes to use Supabase queries instead of Mongoose

## Phase 3: Authentication and RBAC
- [x] Implement role-based authentication with Supabase
- [x] Update router for role-based access (admin, nurse, patient)
- [x] Add middleware for RBAC in frontend and backend

## Phase 4: Account Creation and Automation
- [x] Build admin account creation page
- [x] Implement automatic credential generation (username, password)
- [x] Integrate Gmail API for email sending
- [x] Integrate SMS sending (Android Gateway or fallback)
- [x] Add password reset functionality
- [x] Add audit logging for PDPA compliance
- [x] Add user deactivation/reactivation
- [x] Update admin store with new functions

## Phase 5: Core Features Implementation
- [x] Patient Management: CRUD operations, searchable table
- [x] Staff Management: CRUD, role assignment
- [x] Appointment Scheduling: Calendar view, approval system
- [x] Medical Records: Create/edit records, export PDF/CSV
  - [x] Fix medicalRecordService.js: Correct getRecordsByPatientDirect query to join through Appointment table, add DiagnosisService and TreatmentService exports, update create/update methods to use AppointmentID
  - [x] Update MedicalRecordsManagement.vue: Fix import name (MedicalRecordService -> medicalRecordService), add edit record modal and functionality, implement PDF/CSV export
  - [x] Fix PatientMedicalRecords.vue: Update service calls to use corrected methods, add appointment selection in modal, include diagnosisId and treatmentId in saveRecord
  - [x] Add missing dependencies: Install jsPDF and PapaParse for export functionality
  - [x] Test create/edit/export functionality
  - [x] Update main TODO.md to mark medical records as completed
- [x] Notifications: Real-time alerts, auto reminders

## Phase 6: UI/UX Updates
- [x] Update all components to use Vuetify instead of Bootstrap
  - [x] Update PatientList.vue to use Vuetify components
  - [x] Update AppointmentManagement.vue to use Vuetify components
  - [x] Update ReportsDashboard.vue to use Vuetify components
    - [x] Replace Bootstrap table with v-data-table
    - [x] Convert filters (v-select, v-text-field) to Vuetify
    - [x] Update export buttons to v-btn with icons
    - [x] Convert card layouts to v-card
  - [x] Update UserManagement.vue to use Vuetify components
    - [x] Replace Bootstrap table with v-data-table
    - [x] Convert modal to v-dialog
    - [x] Update form inputs: v-text-field, v-select, v-textarea
    - [x] Replace Bootstrap buttons with v-btn
    - [x] Update dropdown actions to v-menu
    - [x] Convert statistics cards to v-card
  - [x] Update PatientMedicalRecords.vue to use Vuetify components
    - [x] Convert modals to v-dialog
    - [x] Update buttons to v-btn
    - [x] Replace form inputs with v-text-field, v-select, v-textarea
    - [x] Convert table to v-data-table
- [x] Update PatientForm.vue to use Vuetify components
    - [x] Convert form inputs to v-text-field, v-select
    - [x] Update buttons to v-btn
    - [x] Replace Bootstrap alerts with v-alert
    - [x] Update form validation styling
  - [x] Update PatientDetails.vue to use Vuetify components
    - [x] Update layout to Vuetify grid (v-row, v-col)
    - [x] Convert buttons and cards to v-card, v-btn
    - [x] Update tabs if any to v-tabs
    - [x] Convert modal to v-dialog
    - [x] Update form inputs in modal to v-text-field, v-textarea
    - [x] Update accordion to v-expansion-panels for medical visits
    - [x] Update styling to remove Bootstrap classes
  - [x] Update UserProfile.vue to use Vuetify components
    - [x] Convert modal to v-dialog
    - [x] Update form inputs to v-text-field, v-select
    - [x] Replace buttons with v-btn
    - [x] Update profile picture upload to Vuetify components
  - [x] Update NotificationsView.vue to use Vuetify components
    - [x] Convert modal to v-dialog
    - [x] Update buttons to v-btn
    - [x] Replace table with v-data-table
    - [x] Convert search input to v-text-field
  - [x] Update Settings.vue to use Vuetify components
    - [x] Update buttons to v-btn
    - [x] Convert form elements to Vuetify
- [x] Update remaining components in views directory
    - [x] CalendarView.vue: Ensure calendar uses Vuetify if applicable
    - [x] Dashboard.vue: Update to Vuetify layout (v-container, v-row, v-col)
    - [x] DashboardView.vue: Update to Vuetify (v-card, v-btn)
    - [x] MedicalHistory.vue: Convert tables and buttons to Vuetify
    - [x] MedicalRecords.vue: Convert to Vuetify (v-data-table, v-dialog)
    - [x] MedicalVisits.vue: Convert to Vuetify
    - [x] NotFound.vue: Update styling with Vuetify
    - [x] Notifications.vue: Convert to Vuetify
    - [x] Register.vue: Update form to v-text-field, v-btn
    - [x] Login.vue: Update form to Vuetify
    - [x] Admin views: MedicalRecords.vue, StaffManagement.vue (v-data-table, v-dialog)
    - [x] Nurse views: DashboardView.vue, MedicalRecords.vue
    - [x] Patient views: DashboardView.vue, MedicalRecords.vue
- [x] Implement dashboards for each role
  - [x] Admin Dashboard: Overview stats with v-card, recent activities v-timeline, quick actions v-btn
  - [x] Nurse Dashboard: Today's appointments v-calendar, pending tasks v-list, patient alerts v-alert
  - [x] Patient Dashboard: Upcoming appointments v-card, recent records v-data-table, health tips v-banner
- [x] Add calendar, notifications, reports modules
  - [x] Calendar Module: Full calendar integration with v-calendar
  - [x] Notifications Module: Real-time notifications with v-snackbar, v-alert
  - [x] Reports Module: Advanced reporting with v-data-table, charts (apexcharts), filters v-select

## Phase 7: Testing and Security
- [x] Add unit tests for auth, account creation, notifications
- [x] Fix PatientMedicalRecords component unit tests
- [x] Implement audit logging
- [x] Ensure compliance with PDPA 2012 (encryption, privacy)

## Phase 8: Deployment and Evaluation
- [ ] Set up production deployment
- [ ] Conduct UAT with clinic staff
- [ ] Usability testing with SUS
