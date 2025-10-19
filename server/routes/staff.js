import express from "express";
import DatabaseService from "../services/databaseService.js";

const router = express.Router();

// Get all staff
router.get("/", async (req, res) => {
  try {
    const staff = await DatabaseService.getStaff();
    res.status(200).json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get staff by ID
router.get("/:id", async (req, res) => {
  try {
    const staff = await DatabaseService.getStaffById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new staff
router.post("/", async (req, res) => {
  try {
    const { user, firstName, surname, suffix, contactNumber } = req.body;

    // Create user first if provided
    let userRecord = null;
    if (user) {
      // Get roles to find the appropriate role ID
      const roles = await DatabaseService.getRoles();
      const role = roles.find((r) => r.RoleName === (user.role || "nurse"));

      if (!role) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      userRecord = await DatabaseService.createUser({
        UserID: user.UserID || `user-${Date.now()}`,
        Username: user.Username,
        Password: user.Password,
        Email: user.Email,
        RoleID: role.RoleID,
      });
    }

    // Create staff record
    const newStaff = await DatabaseService.createStaff({
      UserID: userRecord ? userRecord.UserID : req.body.UserID,
      FirstName: firstName,
      Surname: surname,
      Suffix: suffix,
      ContactNumber: contactNumber,
    });

    res.status(201).json(newStaff);
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update staff
router.put("/:id", async (req, res) => {
  try {
    const { user, firstName, surname, suffix, contactNumber } = req.body;

    // Update user if provided
    if (user) {
      const staff = await DatabaseService.getStaffById(req.params.id);
      if (staff && staff.UserID) {
        await DatabaseService.updateUser(staff.UserID, user);
      }
    }

    // Update staff
    const updatedStaff = await DatabaseService.updateStaff(req.params.id, {
      FirstName: firstName,
      Surname: surname,
      Suffix: suffix,
      ContactNumber: contactNumber,
    });

    res.status(200).json(updatedStaff);
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete staff
router.delete("/:id", async (req, res) => {
  try {
    const staff = await DatabaseService.getStaffById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Delete associated user if exists
    if (staff.UserID) {
      await DatabaseService.deleteUser(staff.UserID);
    }

    // Delete staff
    await DatabaseService.deleteStaff(req.params.id);

    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
