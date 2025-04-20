import { id } from 'date-fns/locale';
import { rolesType } from '../../shared/constant';
import { NavItem } from './nav-item/nav-item';

let companyId = JSON.parse(localStorage.getItem('payoutUser'))?.company?.id;
let designationRole = rolesType;
let user = JSON.parse(localStorage.getItem('payoutUser'));
const designation = user?.user?.roles[0];
const exitStatus = user?.employee?.exitStatus;
export const navItems: NavItem[] = [];
if (!exitStatus) {
  // Always add common menu items
  navItems.push(
    {
      navCap: 'Home',
    },
    {
      displayName: 'Dashboard',
      iconName: 'home',
      route: '/',
    },
    {
      displayName: 'Employee Management',
      iconName: 'brand-ctemplar',
      route: '/employee/employee-list',
    },

    {
      displayName: 'Reimbursement',
      iconName: 'ticket',
      route: 'reimbursement/list',
    },
    // {
    //   displayName: 'Leave Management ',
    //   iconName: 'calendar-event',
    //   route: 'leaves/list',
    // },
    {
      displayName: 'Approval',
      iconName: 'checklist',
      route: 'leaves/list-approval',
    },
    {
      displayName: 'Apply Resignation',
      iconName: 'ticket',
      route: '/exit-process/form',
    },
    {
      displayName: 'News Feed',
      iconName: 'certificate',
      route: 'news-list',
    },
    {
      displayName: 'Exit Module',
      iconName: 'login',
      route: '/exit-process/list',
    },
    {
      displayName: 'Support',
      iconName: 'ticket',
      route: 'support/list',
    }
  );

  if (designation === designationRole[1].value) {
    navItems.push({
      displayName: 'Leave Management',
      iconName: 'calendar-event',
      route: '/menu-level',
      children: [
        {
          displayName: 'My Leaves',
          iconName: 'calendar-event',
          route: '/leaves/employee-leave-list',
        },
        {
          displayName: 'Employee Leaves',
          iconName: 'calendar-event',
          route: '/leaves/list',
        },
      ],
    });
  }

  // Show only 'Employee Leaves' for employee role
  if (designation === designationRole[3].value) {
    // Employee role
    navItems.push({
      displayName: 'My Leaves',
      iconName: 'point',
      route: '/leaves/employee-leave-list',
    });
  }
  // Add additional items based on role and exit status

  if (designation === designationRole[1].value) {
    navItems.push(
      {
        displayName: 'Company Setup',
        iconName: 'settings',
        route: '/menu-level',
        children: [
          {
            displayName: 'Organisation Details',
            iconName: 'point',
            route: '/organisation/' + companyId,
          },
          {
            displayName: 'Tax Details',
            iconName: 'point',
            route: '/tax/' + companyId,
          },
          {
            displayName: 'Pay Schedule Details',
            iconName: 'point',
            route: '/pay/' + companyId,
          },
          {
            displayName: 'Statutory Details',
            iconName: 'point',
            route: '/statutory/' + companyId,
          },
          {
            displayName: 'Work Location',
            iconName: 'point',
            route: '/work-location/list',
          },
        ],
      },
      {
        displayName: 'Attendance',
        iconName: 'calendar-event',
        route: '/menu-level',
        children: [
          {
            displayName: 'My Attendance',
            iconName: 'point',
            route: '/attendance/calendar',
          },
          {
            displayName: 'Employee Attendance 2',
            iconName: 'point',
            route: '/attendance/list',
          },
        ],
      },
      {
        displayName: 'General Configuration',
        iconName: 'ticket',
        route: '/menu-level',
        children: [
          {
            displayName: 'Department',
            iconName: 'point',
            route: '/department/list',
          },
          {
            displayName: 'Designation',
            iconName: 'point',
            route: '/designation/list',
          },
          {
            displayName: 'Industries',
            iconName: 'point',
            route: '/industry/list',
          },
          {
            displayName: 'Balance Leave',
            iconName: 'point',
            route: '/balance/list',
          },
          {
            displayName: 'Leave Type',
            iconName: 'point',
            route: '/leavetype/list',
          },
          {
            displayName: 'Event Calendar',
            iconName: 'point',
            route: '/eventCalendar/list',
          },
          {
            displayName: 'Work Location',
            iconName: 'point',
            route: '/work-location/list',
          },
        ],
      },
      {
        displayName: 'Payouts / Payroll',
        iconName: 'checklist',
        route: '/payouts/payout-list',
      }
    );
  }
  if (designation === designationRole[0].value) {
    navItems.push({
      displayName: 'Company Setup',
      iconName: 'brand-ctemplar',
      route: '/companies/list',
    });
  }
  if (designation === designationRole[3].value) {
    navItems.push({
      displayName: 'Attendance',
      iconName: 'calendar-event',
      route: '/attendance/calendar',
    });
  }

  navItems.push({
    displayName: 'Logout',
    iconName: 'logout',
    route: '/logout',
  });
}
