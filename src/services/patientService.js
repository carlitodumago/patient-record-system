import { supabase } from "./supabase.js";

export const patientService = {
  async getAllPatients() {
    const { data, error } = await supabase.from("Patients").select("*");
    if (error) throw error;
    return data;
  },

  async getPatientById(patientId) {
    const { data, error } = await supabase
      .from("Patients")
      .select("*")
      .eq("PatientID", patientId)
      .single();
    if (error) throw error;
    return data;
  },

  async createPatient(patientData) {
    const { data, error } = await supabase
      .from("Patients")
      .insert(patientData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePatient(patientId, patientData) {
    const { data, error } = await supabase
      .from("Patients")
      .update(patientData)
      .eq("PatientID", patientId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePatient(patientId) {
    const { error } = await supabase
      .from("Patients")
      .delete()
      .eq("PatientID", patientId);
    if (error) throw error;
  },

  async searchPatients(query) {
    const { data, error } = await supabase
      .from("Patients")
      .select("*")
      .or(
        `FirstName.ilike.%${query}%,Surname.ilike.%${query}%,ContactNumber.ilike.%${query}%`
      );
    if (error) throw error;
    return data;
  },

  async getPatientStatistics() {
    const { data, error } = await supabase
      .from("Patients")
      .select("Gender, BloodType");

    if (error) throw error;

    const stats = {
      total: data.length,
      male: data.filter((p) => p.Gender === "Male").length,
      female: data.filter((p) => p.Gender === "Female").length,
      byBloodType: {},
    };

    // Count by blood type
    data.forEach((patient) => {
      if (patient.BloodType) {
        stats.byBloodType[patient.BloodType] =
          (stats.byBloodType[patient.BloodType] || 0) + 1;
      }
    });

    return stats;
  },
};
