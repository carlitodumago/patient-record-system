import { supabase } from "./supabase.js";

const appointmentService = {
  async getAllAppointments() {
    const { data, error } = await supabase
      .from("appointment")
      .select("*, patients(FirstName, Surname), staff(FirstName, Surname)");
    if (error) throw error;
    return data;
  },

  async getAppointmentsByPatient(patientId) {
    const { data, error } = await supabase
      .from("appointment")
      .select("*")
      .eq("PatientID", patientId);
    if (error) throw error;
    return data;
  },

  async createAppointment(appointmentData) {
    const { data, error } = await supabase
      .from("appointment")
      .insert(appointmentData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointment(appointmentId, appointmentData) {
    const { data, error } = await supabase
      .from("appointment")
      .update(appointmentData)
      .eq("AppointmentID", appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async approveAppointment(appointmentId) {
    const { data, error } = await supabase
      .from("appointment")
      .update({ Status: "approved" })
      .eq("AppointmentID", appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async cancelAppointment(appointmentId) {
    const { data, error } = await supabase
      .from("appointment")
      .update({ Status: "cancelled" })
      .eq("AppointmentID", appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async searchAppointments(query) {
    const { data, error } = await supabase
      .from("appointment")
      .select(
        "*, patients(FirstName, Surname, ContactNumber), staff(FirstName, Surname, Specialization)"
      )
      .or(
        `patients.FirstName.ilike.%${query}%,patients.Surname.ilike.%${query}%,patients.ContactNumber.ilike.%${query}%`
      );
    if (error) throw error;
    return data;
  },

  async getAppointmentStatistics() {
    const { data, error } = await supabase.from("appointment").select("*");

    if (error) throw error;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalAppointments: data.length,
      todayAppointments: data.filter(
        (apt) => new Date(apt.AppointmentDate) >= today
      ).length,
      monthlyAppointments: data.filter(
        (apt) => new Date(apt.AppointmentDate) >= monthStart
      ).length,
      statusDistribution: {},
    };

    // Count by status
    data.forEach((apt) => {
      const status = apt.Status || "unknown";
      stats.statusDistribution[status] =
        (stats.statusDistribution[status] || 0) + 1;
    });

    return stats;
  },

  async getAppointmentsByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from("appointment")
      .select("*, patients(FirstName, Surname), staff(FirstName, Surname)")
      .gte("AppointmentDate", startDate)
      .lte("AppointmentDate", endDate);
    if (error) throw error;
    return data;
  },

  async updateAppointmentStatus(appointmentId, status) {
    const { data, error } = await supabase
      .from("appointment")
      .update({ Status: status })
      .eq("AppointmentID", appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export default appointmentService;
