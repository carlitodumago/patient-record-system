import express from 'express';
import supabase from '../config/supabase.js';
import { sendAppointmentReminderSMS } from '../services/smsService.js';
import { sendAppointmentReminder } from '../services/emailService.js';

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Appointment')
      .select(`
        AppointmentID,
        DateTime,
        Status,
        Reason,
        CreatedAt,
        ScheduledBy,
        PatientID,
        Patients!inner(FirstName, Surname, ContactNumber, Users!inner(Email))
      `);

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch appointments' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Appointment')
      .select(`
        AppointmentID,
        DateTime,
        Status,
        Reason,
        CreatedAt,
        ScheduledBy,
        PatientID,
        Patients!inner(FirstName, Surname, ContactNumber, Users!inner(Email))
      `)
      .eq('AppointmentID', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Failed to fetch appointment' });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  const { scheduledBy, patientId, dateTime, reason } = req.body;

  try {
    const { data, error } = await supabase
      .from('Appointment')
      .insert({
        ScheduledBy: scheduledBy,
        PatientID: patientId,
        DateTime: dateTime,
        Status: 'pending',
        Reason: reason
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to create appointment' });
    }

    // Send reminder (schedule for later, but for demo send immediately)
    const { data: patientData } = await supabase
      .from('Patients')
      .select('FirstName, Surname, ContactNumber, Users!inner(Email)')
      .eq('PatientID', patientId)
      .single();

    const fullName = `${patientData.FirstName} ${patientData.Surname}`;
    await sendAppointmentReminder(patientData.Users.Email, fullName, { dateTime, reason });
    if (patientData.ContactNumber) {
      await sendAppointmentReminderSMS(patientData.ContactNumber, fullName, { dateTime, reason });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  const { dateTime, status, reason } = req.body;

  try {
    const { data, error } = await supabase
      .from('Appointment')
      .update({
        DateTime: dateTime,
        Status: status,
        Reason: reason
      })
      .eq('AppointmentID', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to update appointment' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('Appointment')
      .delete()
      .eq('AppointmentID', req.params.id);

    if (error) {
      return res.status(500).json({ message: 'Failed to delete appointment' });
    }

    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Failed to delete appointment' });
  }
});

export default router;
