import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HolidayComponent } from './holiday/holiday.component';
import { RouterModule, Routes } from '@angular/router';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { HolidayListComponent } from './holiday-list/holiday-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';  
const routes: Routes = [
  {
    path: 'form',
    component: HolidayComponent,
  },
  {
    path: 'list',
    component: HolidayListComponent,
  },
  
  { path: 'form/:id',
     component: HolidayComponent },
]
export const HolidayCalendarRouting = RouterModule.forChild(routes);
@NgModule({
  declarations: [
    HolidayComponent,
    HolidayListComponent
  ],
  imports: [
    CommonModule,
    HolidayCalendarRouting ,
    NgbDatepickerModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule 

  ]
})
export class HolidayCalendarModule { }
