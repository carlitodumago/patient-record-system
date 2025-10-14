import express from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get all medical records
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('MedicalRecord')
      .select(`
        RecordID,
        CreatedAt,
        AppointmentID,
        EnteredBy,
        DiagnosisID,
        TreatmentID,
        NoteID,
        Appointments!inner(DateTime, Patients!inner(FirstName, Surname)),
        Diagnosis!inner(Description),
        Treatment!inner(Description),
        Notes!inner(Content)
      `);

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch medical records' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ message: 'Failed to fetch medical records' });
  }
});

// Get medical record by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('MedicalRecord')
      .select(`
        RecordID,
        CreatedAt,
        AppointmentID,
        EnteredBy,
        DiagnosisID,
        TreatmentID,
        NoteID,
        Appointments!inner(DateTime, Patients!inner(FirstName, Surname)),
        Diagnosis!inner(Description),
        Treatment!inner(Description),
        Notes!inner(Content)
      `)
      .eq('RecordID', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({ message: 'Failed to fetch medical record' });
  }
});

// Create new medical record
router.post('/', async (req, res) => {
  const { appointmentId, enteredBy, diagnosis, treatment, note } = req.body;

  try {
    // Insert diagnosis if provided
    let diagnosisId = null;
    if (diagnosis) {
      const { data: diagData } = await supabase
        .from('Diagnosis')
        .insert({ Description: diagnosis })
        .select('DiagnosisID')
        .single();
      diagnosisId = diagData.DiagnosisID;
    }

    // Insert treatment if provided
    let treatmentId = null;
    if (treatment) {
      const { data: treatData } = await supabase
        .from('Treatment')
        .insert({ Description: treatment })
        .select('TreatmentID')
        .single();
      treatmentId = treatData.TreatmentID;
    }

    // Insert note if provided
    let noteId = null;
    if (note) {
      const { data: noteData } = await supabase
        .from('Notes')
        .insert({ Content: note })
        .select('NoteID')
        .single();
      noteId = noteData.NoteID;
    }

    // Insert medical record
    const { data, error } = await supabase
      .from('MedicalRecord')
      .insert({
        AppointmentID: appointmentId,
        EnteredBy: enteredBy,
        DiagnosisID: diagnosisId,
        TreatmentID: treatmentId,
        NoteID: noteId
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to create medical record' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ message: 'Failed to create medical record' });
  }
});

// Update medical record
router.put('/:id', async (req, res) => {
  const { diagnosis, treatment, note } = req.body;

  try {
    // Update diagnosis if provided
    if (diagnosis) {
      await supabase
        .from('Diagnosis')
        .update({ Description: diagnosis })
        .eq('DiagnosisID', req.body.diagnosisId);
    }

    // Update treatment if provided
    if (treatment) {
      await supabase
        .from('Treatment')
        .update({ Description: treatment })
        .eq('TreatmentID', req.body.treatmentId);
    }

    // Update note if provided
    if (note) {
      await supabase
        .from('Notes')
        .update({ Content: note })
        .eq('NoteID', req.body.noteId);
    }

    res.status(200).json({ message: 'Medical record updated successfully' });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ message: 'Failed to update medical record' });
  }
});

// Delete medical record
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('MedicalRecord')
      .delete()
      .eq('RecordID', req.params.id);

    if (error) {
      return res.status(500).json({ message: 'Failed to delete medical record' });
    }

    res.status(200).json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({ message: 'Failed to delete medical record' });
  }
});

export default router;
