import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceDashboardComponent } from './attendance-dashboard/attendance-dashboard.component';
import { EmployeeAttendanceComponent } from './employee-attendance/employee-attendance.component';
import { EmpAttendanceDetailsComponent } from './emp-attendance-details/emp-attendance-details.component';
import { AttendanceRequestComponent } from './attendance-request/attendance-request.component';
import { AttendanceRequestListComponent } from './attendance-request-list/attendance-request-list.component';
import { AdminAttendanceDashboardComponent } from './admin-attendance-dashboard/admin-attendance-dashboard.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { TimesheetListComponent } from './timesheet-list/timesheet-list.component';
import { TimesheetDetailsComponent } from './timesheet-details/timesheet-details.component';
import { CreateTaskTypeComponent } from './create-task-type/create-task-type.component';
import { TaskTypeListComponent } from './task-type-list/task-type-list.component';
import { ApproveTimesheetComponent } from './approve-timesheet/approve-timesheet.component';
import { RejectTimesheetComponent } from './reject-timesheet/reject-timesheet.component';
import { ApiService } from 'src/app/services/api.service';
import { TimesheetListEmployeeComponent } from './timesheet-list-employee/timesheet-list-employee.component';

const routes: Routes = [
  {
    path: "dashboard",
    component: AttendanceDashboardComponent
  },
  {
    path: "adminDashboard",
    component: AdminAttendanceDashboardComponent
  },
  {
    path: "list",
    component: EmployeeAttendanceComponent,
  },
  {
    path: "details/:id",
    component: EmpAttendanceDetailsComponent,
  },

  {
    path: "request",
    component: AttendanceRequestComponent,
  },

  {
    path: "requestList",
    component: AttendanceRequestListComponent,
  },

  {
    path: 'timesheet',
    component: TimesheetComponent,
  },
  {
    path: 'timesheet/:id',
    component: TimesheetComponent,
  },
  {
    path: 'timesheet-list',
    component: TimesheetListComponent,
    canActivate: [ApiService],
  },

  {
    path: 'timesheet-details/:id',
    component: TimesheetDetailsComponent,
    canActivate: [ApiService],
  },
  {
    path: 'create-task-type',
    component: CreateTaskTypeComponent,
    canActivate: [ApiService],
  },
  {
    path: 'create-task-type/:id',
    component: CreateTaskTypeComponent,
    canActivate: [ApiService],
  },
  {
    path: 'task-type-list',
    component: TaskTypeListComponent,
    canActivate: [ApiService],
  },
  { path: 'approve-timesheet/:id',
    component: ApproveTimesheetComponent,
    canActivate: [ApiService],
  },
  { path: 'reject-timesheet/:id',
    component: RejectTimesheetComponent,
    canActivate: [ApiService],
   },
  // {
  //   path: 'task-type-details/:id',
  //   component: TimesheetDetailsComponent,
  // },

  {
    path: 'timesheet-list-employee',
    component: TimesheetListEmployeeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
