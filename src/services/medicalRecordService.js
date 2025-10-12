import { supabase } from "./supabase.js";

export const medicalRecordService = {
  async getAllRecords() {
    const { data, error } = await supabase
      .from("MedicalRecord")
      .select(
        "*, Appointment(Patients(FirstName, Surname)), Staff(FirstName, Surname), Diagnosis(Description), Treatment(Description), Notes(Content)"
      );
    if (error) throw error;
    return data;
  },

  async getRecordsByPatient(patientId) {
    const { data, error } = await supabase
      .from("MedicalRecord")
      .select(
        "*, Appointment(Patients(FirstName, Surname)), Staff(FirstName, Surname), Diagnosis(Description), Treatment(Description), Notes(Content)"
      )
      .eq("Appointment.PatientID", patientId);
    if (error) throw error;
    return data;
  },

  async getRecordsByPatientDirect(patientId) {
    const { data, error } = await supabase
      .from("MedicalRecord")
      .select(
        `
        *,
        Appointment!inner(PatientID, Patients(FirstName, Surname)),
        Staff:EnteredBy(FirstName, Surname),
        Diagnosis(Description),
        Treatment(Description),
        Notes(Content)
      `
      )
      .eq("Appointment.PatientID", patientId)
      .order("CreatedAt", { ascending: false });
    if (error) throw error;
    return data.map((record) => ({
      id: record.RecordID,
      appointmentId: record.AppointmentID,
      title: `Record ${record.RecordID}`,
      type: "medical_record",
      description:
        record.Notes?.Content ||
        record.Diagnosis?.Description ||
        record.Treatment?.Description ||
        "No description",
      createdBy: record.Staff
        ? `${record.Staff.FirstName} ${record.Staff.Surname}`
        : "Unknown",
      createdAt: record.CreatedAt,
      updatedAt: record.CreatedAt,
      diagnosis: record.Diagnosis,
      treatment: record.Treatment,
      notes: record.Notes,
    }));
  },

  async createRecord(recordData) {
    // Create notes if provided
    let noteId = null;
    if (recordData.notes) {
      const { data: noteData, error: noteError } = await supabase
        .from("Notes")
        .insert({ Content: recordData.notes })
        .select()
        .single();
      if (noteError) throw noteError;
      noteId = noteData.NoteID;
    }

    const medicalRecordData = {
      AppointmentID: recordData.appointmentId,
      EnteredBy: recordData.enteredBy,
      DiagnosisID: recordData.diagnosisId || null,
      TreatmentID: recordData.treatmentId || null,
      NoteID: noteId,
    };

    const { data, error } = await supabase
      .from("MedicalRecord")
      .insert(medicalRecordData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateRecord(recordId, recordData) {
    // Update notes if provided
    let noteId = recordData.noteId;
    if (recordData.notes) {
      if (noteId) {
        // Update existing note
        const { error: noteError } = await supabase
          .from("Notes")
          .update({ Content: recordData.notes })
          .eq("NoteID", noteId);
        if (noteError) throw noteError;
      } else {
        // Create new note
        const { data: noteData, error: noteError } = await supabase
          .from("Notes")
          .insert({ Content: recordData.notes })
          .select()
          .single();
        if (noteError) throw noteError;
        noteId = noteData.NoteID;
      }
    }

    const medicalRecordData = {
      AppointmentID: recordData.appointmentId,
      EnteredBy: recordData.enteredBy,
      DiagnosisID: recordData.diagnosisId || null,
      TreatmentID: recordData.treatmentId || null,
      NoteID: noteId,
    };

    const { data, error } = await supabase
      .from("MedicalRecord")
      .update(medicalRecordData)
      .eq("RecordID", recordId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteRecord(recordId) {
    const { error } = await supabase
      .from("MedicalRecord")
      .delete()
      .eq("RecordID", recordId);
    if (error) throw error;
  },

  async getMedicalRecordsStatistics() {
    const { data, error } = await supabase
      .from("MedicalRecord")
      .select("*, Diagnosis(Description), Treatment(Description)");
    if (error) throw error;

    const totalRecords = data.length;
    const monthlyRecords = data.filter((record) => {
      const recordDate = new Date(record.CreatedAt);
      const now = new Date();
      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const diagnosisDistribution = {};
    const treatmentDistribution = {};

    data.forEach((record) => {
      if (record.Diagnosis?.Description) {
        diagnosisDistribution[record.Diagnosis.Description] =
          (diagnosisDistribution[record.Diagnosis.Description] || 0) + 1;
      }
      if (record.Treatment?.Description) {
        treatmentDistribution[record.Treatment.Description] =
          (treatmentDistribution[record.Treatment.Description] || 0) + 1;
      }
    });

    return {
      totalRecords,
      monthlyRecords,
      diagnosisDistribution,
      treatmentDistribution,
    };
  },

  async getAllMedicalRecords(filters = {}) {
    let query = supabase
      .from("MedicalRecord")
      .select(
        `
        *,
        Appointment!inner(
          PatientID,
          Patients(FirstName, Surname, ContactNumber),
          DateTime
        ),
        Staff:EnteredBy(FirstName, Surname, Specialization),
        Diagnosis(Description, ICDCode),
        Treatment(Name, TreatmentCode)
      `
      )
      .order("CreatedAt", { ascending: false });

    if (filters.search) {
      // Note: Supabase doesn't support full-text search across joined tables easily
      // This is a simplified implementation
    }

    if (filters.patientId) {
      query = query.eq("Appointment.PatientID", filters.patientId);
    }

    if (filters.dateFrom) {
      query = query.gte("CreatedAt", filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte("CreatedAt", filters.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createMedicalRecord(recordData) {
    // First, create or get diagnosis
    let diagnosisId = null;
    if (recordData.diagnosisId) {
      diagnosisId = recordData.diagnosisId;
    }

    // First, create or get treatment
    let treatmentId = null;
    if (recordData.treatmentId) {
      treatmentId = recordData.treatmentId;
    }

    // Create notes if provided
    let noteId = null;
    if (recordData.notes) {
      const { data: noteData, error: noteError } = await supabase
        .from("Notes")
        .insert({ Content: recordData.notes })
        .select()
        .single();
      if (noteError) throw noteError;
      noteId = noteData.NoteID;
    }

    const medicalRecordData = {
      AppointmentID: recordData.appointmentId,
      EnteredBy: recordData.enteredBy,
      DiagnosisID: diagnosisId,
      TreatmentID: treatmentId,
      NoteID: noteId,
    };

    const { data, error } = await supabase
      .from("MedicalRecord")
      .insert(medicalRecordData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const DiagnosisService = {
  async getAllDiagnosis() {
    const { data, error } = await supabase
      .from("Diagnosis")
      .select("*")
      .order("Description");
    if (error) throw error;
    return data;
  },

  async createDiagnosis(description) {
    const { data, error } = await supabase
      .from("Diagnosis")
      .insert({ Description: description })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const TreatmentService = {
  async getAllTreatments() {
    const { data, error } = await supabase
      .from("Treatment")
      .select("*")
      .order("Name");
    if (error) throw error;
    return data;
  },

  async createTreatment(name, description) {
    const { data, error } = await supabase
      .from("Treatment")
      .insert({ Name: name, Description: description })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
