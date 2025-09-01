// Patient model
// This is a placeholder for a proper database model
// In a real application, this would be a Mongoose schema or similar

class Patient {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.dateOfBirth = data.dateOfBirth || '';
    this.gender = data.gender || '';
    this.contactNumber = data.contactNumber || '';
    this.email = data.email || '';
    this.address = data.address || '';
    this.medicalHistory = data.medicalHistory || [];
    this.medications = data.medications || [];
    this.allergies = data.allergies || [];
    this.appointments = data.appointments || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Static methods for patient management
  static findById(id, patients) {
    return patients.find(patient => patient.id === id);
  }

  // In a real app with a database, these would be methods to interact with the database
  static getAll(patients) {
    return patients;
  }

  static create(patientData, patients) {
    const newPatient = new Patient(patientData);
    patients.push(newPatient);
    return newPatient;
  }

  static update(id, patientData, patients) {
    const index = patients.findIndex(patient => patient.id === id);
    if (index === -1) return null;
    
    const updatedPatient = {
      ...patients[index],
      ...patientData,
      updatedAt: new Date().toISOString()
    };
    
    patients[index] = updatedPatient;
    return updatedPatient;
  }

  static delete(id, patients) {
    const index = patients.findIndex(patient => patient.id === id);
    if (index === -1) return false;
    
    patients.splice(index, 1);
    return true;
  }

  // Add a medical record to a patient's history
  static addMedicalRecord(id, record, patients) {
    const patient = this.findById(id, patients);
    if (!patient) return null;
    
    const newRecord = {
      id: Date.now().toString(),
      ...record,
      date: record.date || new Date().toISOString()
    };
    
    patient.medicalHistory.push(newRecord);
    patient.updatedAt = new Date().toISOString();
    
    return newRecord;
  }

  // Add a medication to a patient's list
  static addMedication(id, medication, patients) {
    const patient = this.findById(id, patients);
    if (!patient) return null;
    
    const newMedication = {
      id: Date.now().toString(),
      ...medication,
      prescribedDate: medication.prescribedDate || new Date().toISOString()
    };
    
    patient.medications.push(newMedication);
    patient.updatedAt = new Date().toISOString();
    
    return newMedication;
  }

  // Schedule an appointment for a patient
  static scheduleAppointment(id, appointment, patients) {
    const patient = this.findById(id, patients);
    if (!patient) return null;
    
    const newAppointment = {
      id: Date.now().toString(),
      ...appointment,
      status: appointment.status || 'scheduled'
    };
    
    patient.appointments.push(newAppointment);
    patient.updatedAt = new Date().toISOString();
    
    return newAppointment;
  }
}

export default Patient;