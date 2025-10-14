import express from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get clinic statistics
router.get('/stats', async (req, res) => {
  try {
    // Total patients
    const { count: totalPatients } = await supabase
      .from('Patients')
      .select('*', { count: 'exact', head: true });

    // Active appointments (pending or approved)
    const { count: activeAppointments } = await supabase
      .from('Appointment')
      .select('*', { count: 'exact', head: true })
      .in('Status', ['pending', 'approved']);

    // Recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentRecords } = await supabase
      .from('MedicalRecord')
      .select('*', { count: 'exact', head: true })
      .gte('CreatedAt', thirtyDaysAgo.toISOString());

    const { count: recentAppointments } = await supabase
      .from('Appointment')
      .select('*', { count: 'exact', head: true })
      .gte('CreatedAt', thirtyDaysAgo.toISOString());

    const stats = {
      totalPatients,
      activeAppointments,
      recentActivities: recentRecords + recentAppointments
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Export patients data (CSV)
router.get('/export/patients', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Patients')
      .select('FirstName, Surname, Gender, BirthDate, ContactNumber, Address');

    if (error) {
      return res.status(500).json({ message: 'Failed to export patients' });
    }

    // Convert to CSV
    const csv = [
      'First Name,Surname,Gender,Birth Date,Contact Number,Address',
      ...data.map(p => `${p.FirstName},${p.Surname},${p.Gender},${p.BirthDate},${p.ContactNumber},"${p.Address}"`)
    ].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('patients.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export patients error:', error);
    res.status(500).json({ message: 'Failed to export patients' });
  }
});

// Export appointments data (CSV)
router.get('/export/appointments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Appointment')
      .select(`
        DateTime,
        Status,
        Reason,
        Patients!inner(FirstName, Surname)
      `);

    if (error) {
      return res.status(500).json({ message: 'Failed to export appointments' });
    }

    // Convert to CSV
    const csv = [
      'Date Time,Status,Reason,Patient Name',
      ...data.map(a => `${a.DateTime},${a.Status},"${a.Reason}","${a.Patients.FirstName} ${a.Patients.Surname}"`)
    ].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('appointments.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export appointments error:', error);
    res.status(500).json({ message: 'Failed to export appointments' });
  }
});

// Export medical records data (CSV)
router.get('/export/records', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('MedicalRecord')
      .select(`
        CreatedAt,
        Diagnosis!inner(Description),
        Treatment!inner(Description),
        Notes!inner(Content),
        Appointments!inner(Patients!inner(FirstName, Surname))
      `);

    if (error) {
      return res.status(500).json({ message: 'Failed to export records' });
    }

    // Convert to CSV
    const csv = [
      'Created At,Diagnosis,Treatment,Notes,Patient Name',
      ...data.map(r => `${r.CreatedAt},"${r.Diagnosis?.Description || ''}","${r.Treatment?.Description || ''}","${r.Notes?.Content || ''}","${r.Appointments?.Patients?.FirstName || ''} ${r.Appointments?.Patients?.Surname || ''}"`)
    ].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('medical-records.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export records error:', error);
    res.status(500).json({ message: 'Failed to export records' });
  }
});

export default router;
