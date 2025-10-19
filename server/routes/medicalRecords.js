import express from "express";
import DatabaseService from "../services/databaseService.js";

const router = express.Router();

// Get all medical records
router.get("/", async (req, res) => {
  try {
    const medicalRecords = await DatabaseService.getMedicalRecords();
    res.status(200).json(medicalRecords);
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get medical record by ID
router.get("/:id", async (req, res) => {
  try {
    const medicalRecord = await DatabaseService.getMedicalRecordById(
      req.params.id
    );

    if (!medicalRecord) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    res.status(200).json(medicalRecord);
  } catch (error) {
    console.error("Error fetching medical record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new medical record
router.post("/", async (req, res) => {
  try {
    const { appointmentId, enteredBy, diagnosis, treatment, notes } = req.body;

    // Create diagnosis if provided
    let diagnosisId = null;
    if (diagnosis) {
      const diagnosisRecord = await DatabaseService.createDiagnosis({
        Description: diagnosis,
      });
      diagnosisId = diagnosisRecord.DiagnosisID;
    }

    // Create treatment if provided
    let treatmentId = null;
    if (treatment) {
      const treatmentRecord = await DatabaseService.createTreatment({
        Description: treatment,
      });
      treatmentId = treatmentRecord.TreatmentID;
    }

    // Create notes if provided
    let noteId = null;
    if (notes) {
      const notesRecord = await DatabaseService.createNote({
        Content: notes,
      });
      noteId = notesRecord.NoteID;
    }

    // Create medical record
    const newMedicalRecord = await DatabaseService.createMedicalRecord({
      AppointmentID: appointmentId,
      EnteredBy: enteredBy,
      DiagnosisID: diagnosisId,
      TreatmentID: treatmentId,
      NoteID: noteId,
    });

    res.status(201).json(newMedicalRecord);
  } catch (error) {
    console.error("Error creating medical record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update medical record
router.put("/:id", async (req, res) => {
  try {
    const { appointmentId, enteredBy, diagnosis, treatment, notes } = req.body;

    const medicalRecord = await DatabaseService.getMedicalRecordById(
      req.params.id
    );
    if (!medicalRecord) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Update diagnosis if provided
    if (diagnosis !== undefined) {
      if (medicalRecord.DiagnosisID) {
        // Update existing diagnosis - Note: DatabaseService doesn't have updateDiagnosis method
        // We'll need to add this or handle it differently
      } else if (diagnosis) {
        const diagnosisRecord = await DatabaseService.createDiagnosis({
          Description: diagnosis,
        });
        await DatabaseService.updateMedicalRecord(req.params.id, {
          DiagnosisID: diagnosisRecord.DiagnosisID,
        });
      }
    }

    // Update treatment if provided
    if (treatment !== undefined) {
      if (medicalRecord.TreatmentID) {
        // Update existing treatment - Note: DatabaseService doesn't have updateTreatment method
      } else if (treatment) {
        const treatmentRecord = await DatabaseService.createTreatment({
          Description: treatment,
        });
        await DatabaseService.updateMedicalRecord(req.params.id, {
          TreatmentID: treatmentRecord.TreatmentID,
        });
      }
    }

    // Update notes if provided
    if (notes !== undefined) {
      if (medicalRecord.NoteID) {
        // Update existing notes - Note: DatabaseService doesn't have updateNote method
      } else if (notes) {
        const notesRecord = await DatabaseService.createNote({
          Content: notes,
        });
        await DatabaseService.updateMedicalRecord(req.params.id, {
          NoteID: notesRecord.NoteID,
        });
      }
    }

    // Update other fields
    const updatedMedicalRecord = await DatabaseService.updateMedicalRecord(
      req.params.id,
      {
        AppointmentID: appointmentId,
        EnteredBy: enteredBy,
      }
    );

    res.status(200).json(updatedMedicalRecord);
  } catch (error) {
    console.error("Error updating medical record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete medical record
router.delete("/:id", async (req, res) => {
  try {
    await DatabaseService.deleteMedicalRecord(req.params.id);
    res.status(200).json({ message: "Medical record deleted successfully" });
  } catch (error) {
    console.error("Error deleting medical record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get medical records by appointment ID
router.get("/appointment/:appointmentId", async (req, res) => {
  try {
    const medicalRecords = await DatabaseService.getMedicalRecordsByAppointment(
      req.params.appointmentId
    );
    res.status(200).json(medicalRecords);
  } catch (error) {
    console.error("Error fetching medical records by appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
