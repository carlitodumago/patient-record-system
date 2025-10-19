import express from "express";
import DatabaseService from "../services/databaseService.js";

const router = express.Router();

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await DatabaseService.getAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const appointment = await DatabaseService.getAppointmentById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new appointment
router.post("/", async (req, res) => {
  try {
    const { scheduledBy, patientId, dateTime, reason, status } = req.body;

    const newAppointment = await DatabaseService.createAppointment({
      ScheduledBy: scheduledBy,
      PatientID: patientId,
      DateTime: dateTime,
      Reason: reason,
      Status: status || "pending",
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update appointment
router.put("/:id", async (req, res) => {
  try {
    const { scheduledBy, patientId, dateTime, reason, status } = req.body;

    const updatedAppointment = await DatabaseService.updateAppointment(
      req.params.id,
      {
        ScheduledBy: scheduledBy,
        PatientID: patientId,
        DateTime: dateTime,
        Reason: reason,
        Status: status,
      }
    );

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete appointment
router.delete("/:id", async (req, res) => {
  try {
    await DatabaseService.deleteAppointment(req.params.id);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get appointments by patient ID
router.get("/patient/:patientId", async (req, res) => {
  try {
    const appointments = await DatabaseService.getAppointmentsByPatient(
      req.params.patientId
    );
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get appointments by staff ID
router.get("/staff/:staffId", async (req, res) => {
  try {
    const appointments = await DatabaseService.getAppointmentsByStaff(
      req.params.staffId
    );
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching staff appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
