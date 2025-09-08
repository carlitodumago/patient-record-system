const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all patients
// Accessible by admin and nurse roles
router.get('/', authenticateToken, authorizeRoles('admin', 'nurse'), async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
});

// Get single patient
// Accessible by admin, nurse, and the patient themselves
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('visits');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Check if user is authorized to view this patient
    // Admin and nurse can view all patients
    // Patients can only view their own records
    if (req.user.role === 'patient' && patient.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this patient'
      });
    }
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
});

// Create new patient
// Accessible by admin and nurse roles
router.post('/', authenticateToken, authorizeRoles('admin', 'nurse'), async (req, res) => {
  try {
    // Add the current user as the creator
    req.body.createdBy = req.user.id;
    
    const patient = await Patient.create(req.body);
    
    // Emit socket event for real-time notification
    const io = req.app.get('io');
    io.emit('patientAdded', {
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName
      },
      action: 'added'
    });
    
    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating patient',
      error: error.message
    });
  }
});

// Update patient
// Accessible by admin and nurse roles
router.put('/:id', authenticateToken, authorizeRoles('admin', 'nurse'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Emit socket event for real-time notification
    const io = req.app.get('io');
    io.emit('patientUpdated', {
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName
      },
      action: 'updated'
    });
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
});

// Delete patient
// Accessible by admin role only
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Delete all visits associated with this patient
    await Visit.deleteMany({ patient: req.params.id });
    
    // Delete the patient
    await patient.remove();
    
    // Emit socket event for real-time notification
    const io = req.app.get('io');
    io.emit('patientDeleted', {
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName
      },
      action: 'deleted'
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
});

// Get patient visits
router.get('/:id/visits', authenticateToken, async (req, res) => {
  try {
    const visits = await Visit.find({ patient: req.params.id }).sort({ visitDate: -1 });
    
    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching visits',
      error: error.message
    });
  }
});

// Add visit to patient
router.post('/:id/visits', authenticateToken, authorizeRoles('admin', 'nurse'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Create visit
    const visit = new Visit({
      ...req.body,
      patient: req.params.id,
      createdBy: req.user.id
    });
    
    await visit.save();
    
    // Add visit to patient's visits array
    patient.visits.push(visit._id);
    await patient.save();
    
    // Emit socket event for real-time notification
    const io = req.app.get('io');
    io.emit('visitAdded', {
      visit: {
        id: visit._id,
        patient: {
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName
        },
        visitDate: visit.visitDate,
        physician: visit.physician
      }
    });
    
    res.status(201).json({
      success: true,
      data: visit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding visit',
      error: error.message
    });
  }
});

module.exports = router;