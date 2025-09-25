import express from "express";

const router = express.Router();

// Mock data - in a real app, this would come from a database
let patients = [];

// Get all patients
router.get("/", (req, res) => {
  res.status(200).json(patients);
});

// Get patient by ID
router.get("/:id", (req, res) => {
  const patient = patients.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }
  res.status(200).json(patient);
});

// Create new patient
router.post("/", (req, res) => {
  const newPatient = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  patients.push(newPatient);

  res.status(201).json(newPatient);
});

// Update patient
router.put("/:id", (req, res) => {
  const index = patients.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Patient not found" });
  }

  const updatedPatient = {
    ...patients[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  patients[index] = updatedPatient;

  res.status(200).json(updatedPatient);
});

// Delete patient
router.delete("/:id", (req, res) => {
  const index = patients.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Patient not found" });
  }

  patients.splice(index, 1);

  res.status(200).json({ message: "Patient deleted successfully" });
});

export default router;
