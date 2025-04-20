import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddShiftComponent } from './add-shift/add-shift.component';
import { ListComponent } from './list/list.component';
import { EmployeeShiftComponent } from './employee-shift/employee-shift.component';

const routes: Routes = [
  { path: 'list', component: ListComponent },
  { path: 'create-shift', component: AddShiftComponent },
  { path: 'create-shift/:id', component: AddShiftComponent },
  { path: 'employee-shift', component: EmployeeShiftComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShiftRoutingModule { }
