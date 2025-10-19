import DatabaseService from "./server/services/databaseService.js";
import dotenv from "dotenv";

dotenv.config();

async function testRoles() {
  try {
    console.log("Testing roles query...");
    const roles = await DatabaseService.getRoles();
    console.log("Roles found:", roles);

    if (roles && roles.length > 0) {
      const adminRole = roles.find((r) => r.RoleName === "admin");
      console.log("Admin role:", adminRole);
      if (adminRole) {
        console.log("Admin RoleID:", adminRole.RoleID, typeof adminRole.RoleID);
      }
    }
  } catch (error) {
    console.error("Error testing roles:", error);
  }
}

testRoles();
