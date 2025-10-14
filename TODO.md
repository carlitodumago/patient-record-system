# HIS Development TODO

## Phase 1: Setup and Dependencies
- [x] Update package.json with new dependencies (Vuetify, Pinia, Supabase, etc.)
- [x] Install dependencies via npm install
- [x] Create .env file with Supabase URL/key, Gmail creds, SMS config (placeholders if not provided)

## Phase 2: Backend Migration to Supabase
- [x] Create server/config/supabase.js for Supabase client
- [x] Create server/migrations/init.sql with full schema + default admin
- [x] Update server/index.js to use Supabase instead of Mongoose
- [x] Update server/routes/users.js for Supabase auth, credential generation, auto-send
- [x] Update server/routes/patients.js for Supabase queries
- [x] Create server/routes/appointments.js (CRUD, status updates)
- [x] Create server/routes/medicalRecords.js (with FKs)
- [x] Create server/routes/staff.js (CRUD)
- [x] Create server/routes/notifications.js (create/send)
- [x] Create server/routes/reports.js (stats/export)
- [x] Update server/middleware/auth.js for Supabase JWT
- [x] Create server/services/emailService.js (Nodemailer + Gmail OAuth2)
- [x] Create server/services/smsService.js (Android gateway or email-to-SMS)
- [x] Remove Mongoose models (Patient.js, User.js)

## Phase 3: Frontend Migration (UI/State)
- [x] Update src/main.js: Replace Vuex with Pinia, init Vuetify
- [x] Create src/stores/useAuthStore.js, usePatientStore.js, etc. (Pinia)
- [x] Update src/router/index.js: Add missing routes, enhance guards
- [x] Update src/layouts/TheSidebar.vue: Exact role menus
- [x] Update src/services/api.js: Hybrid Supabase/Axios

## Phase 4: Feature Implementation
- [x] Create src/views/admin/AccountCreation.vue (auto-credentials)
- [ ] Enhance src/views/PatientList.vue, PatientForm.vue
- [x] Create src/views/admin/StaffList.vue, StaffForm.vue
- [ ] Enhance src/views/CalendarView.vue (FullCalendar, reminders)
- [ ] Update role-specific MedicalRecords.vue (CRUD, exports)
- [ ] Enhance src/views/Notifications.vue (real-time)
- [x] Create src/views/admin/Reports.vue (stats, exports)
- [ ] Add password change prompt on first login

## Phase 5: Testing and Polish
- [x] Add unit tests (Vitest) for auth, creation, sending
- [x] Ensure mobile-responsive with Vuetify
- [x] Add privacy compliance notices
- [x] Run UAT: Test roles, dashboards, flows
- [x] Final demo with npm run dev:full
