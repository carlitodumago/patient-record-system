import { supabase } from "./supabase.js";

export const staffService = {
  async getAllStaff() {
    const { data, error } = await supabase
      .from("Staff")
      .select("*, Users!inner(Username, Email, Role:RoleID(RoleName))");
    if (error) throw error;
    return data;
  },

  async getStaffById(staffId) {
    const { data, error } = await supabase
      .from("Staff")
      .select("*, Users!inner(Username, Email, Role:RoleID(RoleName))")
      .eq("StaffID", staffId)
      .single();
    if (error) throw error;
    return data;
  },

  async createStaff(staffData) {
    const { data, error } = await supabase
      .from("Staff")
      .insert(staffData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStaff(staffId, staffData) {
    const { data, error } = await supabase
      .from("Staff")
      .update(staffData)
      .eq("StaffID", staffId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteStaff(staffId) {
    const { error } = await supabase
      .from("Staff")
      .delete()
      .eq("StaffID", staffId);
    if (error) throw error;
  },

  async assignRole(staffId, roleId) {
    // Update role in Users table
    const { error } = await supabase
      .from("Users")
      .update({ RoleID: roleId })
      .eq("UserID", (await this.getStaffById(staffId)).UserID);
    if (error) throw error;
  },

  async searchStaff(query) {
    const { data, error } = await supabase
      .from("Staff")
      .select("*, Users!inner(Username, Email, Role:RoleID(RoleName))")
      .or(
        `FirstName.ilike.%${query}%,Surname.ilike.%${query}%,ContactNumber.ilike.%${query}%`
      );
    if (error) throw error;
    return data;
  },

  async getStaffStatistics() {
    const { data, error } = await supabase
      .from("Staff")
      .select("*, Users!inner(Role:RoleID(RoleName))");

    if (error) throw error;

    const stats = {
      totalStaff: data.length,
      roleDistribution: {},
      specializationDistribution: {},
    };

    // Count by role
    data.forEach((staff) => {
      const role = staff.Users?.Role?.RoleName || "Unknown";
      stats.roleDistribution[role] = (stats.roleDistribution[role] || 0) + 1;
    });

    // Count by specialization
    data.forEach((staff) => {
      if (staff.Specialization) {
        stats.specializationDistribution[staff.Specialization] =
          (stats.specializationDistribution[staff.Specialization] || 0) + 1;
      }
    });

    return stats;
  },

  async updateStaffStatus(staffId, isActive) {
    const { error } = await supabase
      .from("Staff")
      .update({ IsActive: isActive })
      .eq("StaffID", staffId);
    if (error) throw error;
  },
};
