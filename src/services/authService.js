import { supabase } from "./supabase.js";

export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  async getUserRole(userId) {
    const { data, error } = await supabase
      .from("Users")
      .select("Role:RoleID(RoleName)")
      .eq("UserID", userId)
      .single();
    if (error) throw error;
    return data.Role.RoleName;
  },

  async getUserPermissions(userId) {
    const role = await this.getUserRole(userId);
    // Define permissions based on role
    const rolePermissions = {
      admin: [
        "users.create",
        "users.read",
        "users.update",
        "users.delete",
        "staff.read",
        "staff.update",
        "patients.read",
        "patients.update",
        "appointments.read",
        "appointments.create",
        "appointments.update",
        "medical_records.read",
        "medical_records.create",
        "medical_records.update",
        "reports.read",
        "notifications.send",
      ],
      nurse: [
        "patients.read",
        "patients.update",
        "appointments.read",
        "appointments.create",
        "appointments.update",
        "medical_records.read",
        "medical_records.create",
        "medical_records.update",
        "notifications.send",
      ],
      staff: ["patients.read", "appointments.read", "medical_records.read"],
      patient: [
        "profile.read",
        "profile.update",
        "appointments.read",
        "appointments.create",
        "medical_records.read",
      ],
    };
    return rolePermissions[role] || [];
  },

  async createUser(userData) {
    // Generate username and password
    const username = this.generateUsername(
      userData.firstName,
      userData.surname
    );
    const password = this.generatePassword(userData.birthDate);

    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password,
      user_metadata: {
        username,
        role: userData.role,
        firstName: userData.firstName,
        surname: userData.surname,
        birthDate: userData.birthDate,
      },
    });
    if (error) throw error;

    // Insert into Users table
    const { error: insertError } = await supabase.from("Users").insert({
      UserID: data.user.id,
      Username: username,
      Password: password, // Note: Supabase handles hashing
      Email: userData.email,
      RoleID: userData.roleId,
    });
    if (insertError) throw insertError;

    // Insert into Staff or Patients table based on role
    if (userData.role === "Staff" || userData.role === "Nurse") {
      await supabase.from("Staff").insert({
        UserID: data.user.id,
        FirstName: userData.firstName,
        Surname: userData.surname,
        Suffix: userData.suffix,
        ContactNumber: userData.contactNumber,
      });
    } else if (userData.role === "Patient") {
      await supabase.from("Patients").insert({
        UserID: data.user.id,
        FirstName: userData.firstName,
        Surname: userData.surname,
        Suffix: userData.suffix,
        Address: userData.address,
        Gender: userData.gender,
        BirthDate: userData.birthDate,
        ContactNumber: userData.contactNumber,
      });
    }

    // Send credentials via email and SMS
    await this.sendCredentials(
      userData.email,
      userData.contactNumber,
      username,
      password,
      userData.firstName
    );

    return data;
  },

  generateUsername(firstName, surname) {
    const baseUsername = `${firstName.toLowerCase()}.${surname.toLowerCase()}`;
    // Check for duplicates and append counter if needed
    // For simplicity, assuming no duplicates for now
    return baseUsername;
  },

  generatePassword(birthDate) {
    const date = new Date(birthDate);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${month}-${day}-${year}`;
  },

  async sendCredentials(email, phone, username, password, name) {
    // Implement Gmail sending
    // For now, placeholder
    console.log(`Sending credentials to ${email} and ${phone}`);
    // TODO: Integrate Gmail API and SMS
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
};
