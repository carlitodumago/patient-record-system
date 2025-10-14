import express from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get all staff
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Staff')
      .select(`
        StaffID,
        FirstName,
        Surname,
        Suffix,
        ContactNumber,
        UserID,
        Users!inner(Email, RoleID)
      `);

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch staff' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
});

// Get staff by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Staff')
      .select(`
        StaffID,
        FirstName,
        Surname,
        Suffix,
        ContactNumber,
        UserID,
        Users!inner(Email, RoleID)
      `)
      .eq('StaffID', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
});

// Create new staff (for manual creation)
router.post('/', async (req, res) => {
  const { firstName, surname, suffix, contactNumber, userId } = req.body;

  try {
    const { data, error } = await supabase
      .from('Staff')
      .insert({
        FirstName: firstName,
        Surname: surname,
        Suffix: suffix,
        ContactNumber: contactNumber,
        UserID: userId
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to create staff' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ message: 'Failed to create staff' });
  }
});

// Update staff
router.put('/:id', async (req, res) => {
  const { firstName, surname, suffix, contactNumber } = req.body;

  try {
    const { data, error } = await supabase
      .from('Staff')
      .update({
        FirstName: firstName,
        Surname: surname,
        Suffix: suffix,
        ContactNumber: contactNumber
      })
      .eq('StaffID', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to update staff' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ message: 'Failed to update staff' });
  }
});

// Delete staff
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('Staff')
      .delete()
      .eq('StaffID', req.params.id);

    if (error) {
      return res.status(500).json({ message: 'Failed to delete staff' });
    }

    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ message: 'Failed to delete staff' });
  }
});

export default router;
