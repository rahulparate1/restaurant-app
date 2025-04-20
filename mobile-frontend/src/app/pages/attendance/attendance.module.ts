import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceRoutingModule } from './attendance-routing.module';
import { AttendanceDashboardComponent } from './attendance-dashboard/attendance-dashboard.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EmployeeAttendanceComponent } from './employee-attendance/employee-attendance.component';
import { EmpAttendanceDetailsComponent } from './emp-attendance-details/emp-attendance-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbDatepickerModule, NgbDropdownModule, NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgSelectModule } from '@ng-select/ng-select';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { AttendanceRequestComponent } from './attendance-request/attendance-request.component';
import { AttendanceRequestListComponent } from './attendance-request-list/attendance-request-list.component';
import { AdminAttendanceDashboardComponent } from './admin-attendance-dashboard/admin-attendance-dashboard.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { TimesheetListComponent } from './timesheet-list/timesheet-list.component';
import { TimesheetDetailsComponent } from './timesheet-details/timesheet-details.component';
import { CreateTaskTypeComponent } from './create-task-type/create-task-type.component';
import { TaskTypeListComponent } from './task-type-list/task-type-list.component';
import { ApproveTimesheetComponent } from './approve-timesheet/approve-timesheet.component';
import { RejectTimesheetComponent } from './reject-timesheet/reject-timesheet.component';
import { TimesheetListEmployeeComponent } from './timesheet-list-employee/timesheet-list-employee.component';


@NgModule({
  declarations: [
    AttendanceDashboardComponent,
    EmployeeAttendanceComponent,
    EmpAttendanceDetailsComponent,
    AttendanceRequestComponent,
    AttendanceRequestListComponent,
    AdminAttendanceDashboardComponent,
    TimesheetComponent,
    TimesheetListComponent,
    TimesheetDetailsComponent,
    CreateTaskTypeComponent,
    TaskTypeListComponent,
    ApproveTimesheetComponent,
    RejectTimesheetComponent,
    TimesheetListEmployeeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgbPaginationModule,
    NgbDropdownModule,
    NgbCollapseModule,
    AttendanceRoutingModule,
    FullCalendarModule,
    CarouselModule,
    SlickCarouselModule,
    NgSelectModule,
    UIModule,
    NgApexchartsModule,
    NgbModule
  ]
})
export class AttendanceModule { }
