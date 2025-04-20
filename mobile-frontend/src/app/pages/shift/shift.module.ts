import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShiftRoutingModule } from './shift-routing.module';
import { AddShiftComponent } from './add-shift/add-shift.component';
import { ListComponent } from './list/list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbPaginationModule, NgbDropdownModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeShiftComponent } from './employee-shift/employee-shift.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { CarouselModule } from 'ngx-owl-carousel-o';
@NgModule({
  declarations: [
    AddShiftComponent,
    ListComponent,
    EmployeeShiftComponent,
  ],
  imports: [
    CommonModule,
    ShiftRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NgbDropdownModule,
    NgbCollapseModule,
    // NgxPaginationModule,
    NgbPaginationModule,
    SlickCarouselModule,
    CarouselModule,
    UIModule,
  ]
})
export class ShiftModule { }
