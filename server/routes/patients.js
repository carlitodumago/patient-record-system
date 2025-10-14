import express from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Patients')
      .select(`
        PatientID,
        FirstName,
        Surname,
        Suffix,
        Address,
        Gender,
        BirthDate,
        ContactNumber,
        UserID,
        Users!inner(Email, RoleID)
      `);

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch patients' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Patients')
      .select(`
        PatientID,
        FirstName,
        Surname,
        Suffix,
        Address,
        Gender,
        BirthDate,
        ContactNumber,
        UserID,
        Users!inner(Email, RoleID)
      `)
      .eq('PatientID', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Failed to fetch patient' });
  }
});

// Create new patient (for manual creation, separate from account creation)
router.post('/', async (req, res) => {
  const { firstName, surname, suffix, address, gender, birthDate, contactNumber, userId } = req.body;

  try {
    const { data, error } = await supabase
      .from('Patients')
      .insert({
        FirstName: firstName,
        Surname: surname,
        Suffix: suffix,
        Address: address,
        Gender: gender,
        BirthDate: birthDate,
        ContactNumber: contactNumber,
        UserID: userId
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to create patient' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Failed to create patient' });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  const { firstName, surname, suffix, address, gender, birthDate, contactNumber } = req.body;

  try {
    const { data, error } = await supabase
      .from('Patients')
      .update({
        FirstName: firstName,
        Surname: surname,
        Suffix: suffix,
        Address: address,
        Gender: gender,
        BirthDate: birthDate,
        ContactNumber: contactNumber
      })
      .eq('PatientID', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to update patient' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Failed to update patient' });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('Patients')
      .delete()
      .eq('PatientID', req.params.id);

    if (error) {
      return res.status(500).json({ message: 'Failed to delete patient' });
    }

    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Failed to delete patient' });
  }
});

export default router;
