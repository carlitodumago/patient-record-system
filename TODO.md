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
- [ ] Medical Records: Create/edit records, export PDF/CSV
  - [ ] Fix medicalRecordService.js: Correct getRecordsByPatientDirect query to join through Appointment table, add DiagnosisService and TreatmentService exports, update create/update methods to use AppointmentID
  - [x] Update MedicalRecordsManagement.vue: Fix import name (MedicalRecordService -> medicalRecordService), add edit record modal and functionality, implement PDF/CSV export
  - [ ] Fix PatientMedicalRecords.vue: Update service calls to use corrected methods
  - [ ] Add missing dependencies: Install jsPDF and PapaParse for export functionality
  - [ ] Test create/edit/export functionality
  - [ ] Update main TODO.md to mark medical records as completed
- [ ] Notifications: Real-time alerts, auto reminders

## Phase 6: UI/UX Updates
- [ ] Update all components to use Vuetify instead of Bootstrap
- [ ] Implement dashboards for each role
- [ ] Add calendar, notifications, reports modules

## Phase 7: Testing and Security
- [x] Add unit tests for auth, account creation, notifications
- [x] Fix PatientMedicalRecords component unit tests
- [x] Implement audit logging
- [x] Ensure compliance with PDPA 2012 (encryption, privacy)

## Phase 8: Deployment and Evaluation
- [ ] Set up production deployment
- [ ] Conduct UAT with clinic staff
- [ ] Usability testing with SUS
