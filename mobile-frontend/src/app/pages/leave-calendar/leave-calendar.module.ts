import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveCalendarComponent } from './leave-calendar/leave-calendar.component';
import { RouterModule, Routes } from '@angular/router';
// import { SimplebarAngularModule } from 'simplebar-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FullCalendarModule } from "@fullcalendar/angular";
const routes: Routes = [
  {
    path: 'leave',
    component: LeaveCalendarComponent,
  },
  
]
export const LeaveCalendarRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    LeaveCalendarComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    LeaveCalendarRouting,
    FullCalendarModule,


  ]
})
export class LeaveCalendarModule { }
