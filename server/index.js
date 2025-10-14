import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import supabase from './config/supabase.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the Vue app build directory in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  app.use(express.static(distPath));
}

// Import routes
import patientRoutes from './routes/patients.js';
import userRoutes from './routes/users.js';
import appointmentRoutes from './routes/appointments.js';
import medicalRecordRoutes from './routes/medicalRecords.js';
import staffRoutes from './routes/staff.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';

// Import services to initialize them (avoid OAuth errors)
import './services/emailService.js';
import './services/smsService.js';

// Use routes
app.use('/api/patients', patientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Catch-all route to return the Vue app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
