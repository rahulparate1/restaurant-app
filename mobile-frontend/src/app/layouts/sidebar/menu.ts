import { MenuItem } from "./menu.model";
import { rolesType } from "full/shared/constant";

let companyId = JSON.parse(localStorage.getItem("payoutUser"))?.company?.id;
let employeeId = JSON.parse(localStorage.getItem("payoutUser"))?.employee?.id;
let user = JSON.parse(localStorage.getItem("payoutUser"));
const designation = user?.user?.roles[0]; // User's role (e.g., "admin", "employee")
const exitStatus = user?.employee?.exitStatus;

// Assuming rolesType is an array with roles
const designationRole = rolesType; // List of roles
const isAdmin = designation === designationRole[1].value; // Check if the user is an admin
const isEmployee = designation === designationRole[3].value; // Check if the user is an admin

export const MENU: MenuItem[] = [

  // Dashboard & Analytics


];
