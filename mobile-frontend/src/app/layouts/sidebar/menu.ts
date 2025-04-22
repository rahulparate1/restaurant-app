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

  {
    id: 1,
    label: "Dashboard & Analytics",
    isTitle: true,
  },
  {
    id: 2,
    label: "Dashboard",
    icon: "fa-regular fa-chart-mixed",
    link: ""
  },
  {
    id: 2,
    label: "General Analytics",
    icon: "fa-regular fa-objects-column",
    link: ""

  },

  // Employee Managment
  {
    id: 1,
    label: "Employees Management & Configurations",
    isTitle: true,
  },
  {
    id: 2,
    label: "Dashboard",
    icon: "fa-regular fa-chart-user",
    link: "employee/employee-dashboard"
  },
  {
    id: 2,
    label: "Manage Employees",
    icon: "fa-regular fa-circle-user",
    link: "employee/list"
  },
  {
    id: 2,
    label: "Approvals",
    icon: "fa-regular fa-circle-exclamation-check",
    link: "employee/approval-list"
  },


  // Include "Employee Management" only if user is admin
  ...(isAdmin
    ? [
        {
          id: 1,
          label: "Employee",
          link: "employee/list",
          icon: "bx bx-user",
        },

        {
          label: "Attendance",
          icon: "bx bx-user-pin",
          subItems: [
            {
              label: "My Attendance",
              icon: "point",
              link: "attendance/dashboard",
            },
            {
              label: "Request Missouts",
              icon: "point",
              link: "attendance/requestList",
            },
            {
              label: "Attendance",
              icon: "point",
              link: "attendance/adminDashboard",
            },
          ],
        },
        {
          id: 3,
          label: "Leave Management",
          link: "leave-management/leaves-list",
          icon: "bx bx-user-pin",
        },
        {
          id: 4,
          label: "Holidays",
          link: "holiday/list",
          icon: "bx bx-health",
        },
        {
          id: 5,
          label: "Events",
          link: "event/events-list",
          icon: "bx bx-calendar-event",
        },
        {
          id: 6,
          label: "Calender",
          link: "calendar/leave/",
          icon: "bx bx-calendar-event",
        },
        {
          id: 7,
          label: "News Feed",
          link: "newsfeed/list",
          icon: "bx bx-news",
        },
        {
          id: 8,
          label: "Reimbursement",
          link: "reimbursement/list",
          icon: "bx bx-money",
        },
        {
          id: 8,
          label: "Support Type",
          link: "support-type/list-type",
          icon: "bx bx-money",
        },
        {
          id: 9,
          label: "Approvals",
          link: "employee/list",
          icon: "bx bx-checkbox-checked",
        },
        {
          id: 10,
          label: "Apply Resignation",
          link: "exit-process/form",
          icon: "bx bx-exit",
        },
        {
          id: 11,
          label: "Request Resignation",
          link: "exit-process/list",
          icon: "bx bx-exit",
        },
        {
          id: 8,
          isLayout: true,
        },
        {
          id: 9,
          label: "Settings",
          isTitle: true,
        },
        {
          label: "Company Setup",
          icon: "bx bx-cog",
          subItems: [
            {
              label: "Organisation Details",
              icon: "point",
              link: "/company-configuration/company-form/" + companyId,
            },
            {
              label: "Pay Schedule Details",
              icon: "point",
              link: "/company-configuration/pay-schedule-form/" + companyId,
            }
          ],
        },
        {
          id: 2,
          label: "General Configuration",
          icon: "bx bx-cog",
          subItems: [
            {
              label: "Department",
              icon: "point",
              link: "general-configuration/department-list",
            },
            {
              label: "Designation",
              icon: "point",
              link: "general-configuration/designation-list",
            },
            {
              label: "Work Location",
              icon: "point",
              link: "general-configuration/work-location-list",
            },
            {
              label: "Industry",
              icon: "point",
              link: "general-configuration/industry-list",
            },
            {
              label: "Leave Type",
              icon: "point",
              link: "general-configuration/leaveType-list",
            },
          ],
        },
      ]
    : []),

  // Include "Employee Management" only if user is admin
  ...(isEmployee
    ? [
      {
        id: 1,
        label: "Employee",
        link: "employee/employee-view",
        icon: "bx bx-user",
      },
      
      {
        label: "Attendance",
        icon: "bx bx-user-pin",
        subItems: [
          {
            label: "My Attendance",
            icon: "point",
            link: "attendance/dashboard",
          },
          {
            label: "Request Missouts",
            icon: "point",
            link: "attendance/requestList",
          },
        ],
      },
      {
        id: 3,
        label: "Leave Management",
        link: "leave-management/leaves-list",
        icon: "bx bx-user-pin",
      },
      {
        id: 4,
        label: "Holidays",
        link: "holiday/list",
        icon: "bx bx-health",
      },
      {
        id: 5,
        label: "Events",
        link: "event/events-list",
        icon: "bx bx-calendar-event",
      },
      {
        id: 6,
        label: "Calender",
        link: "calendat/leave",
        icon: "bx bx-calendar-event",
      },
      {
        id: 7,
        label: "News Feed",
        link: "newsfeed/list",
        icon: "bx bx-news",
      },
      {
        id: 8,
        label: "Reimbursement",
        link: "reimbursement/list",
        icon: "bx bx-money",
      },
      {
        id: 9,
        label: "Request Resignation",
        link: "exit-process/list",
        icon: "bx bx-exit",
      },
    ]
    : []),
];
