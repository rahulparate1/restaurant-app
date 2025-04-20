import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddReimbursementComponent } from './add-reimbursement/add-reimbursement.component';
import { ReimbursementListComponent } from './reimbursement-list/reimbursement-list.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbCollapseModule, NgbDropdownModule, NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { ReimbursementDetailsComponent } from './reimbursement-details/reimbursement-details.component';
// import * as Tesseract from 'tesseract.js';

const routes: Routes = [
  {
    path: "list",
    component: ReimbursementListComponent,
  },
  {
    path: "form",
    component: AddReimbursementComponent,
  },
  {
    path: "form/:id",
    component: AddReimbursementComponent,
  },
  {
    path: "details/:id",
    component: ReimbursementDetailsComponent,
  }

];

export const reimbursementRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    AddReimbursementComponent,
    ReimbursementListComponent,
    ReimbursementDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbPaginationModule,
    NgbModule,
    SlickCarouselModule,
    CarouselModule,
    UIModule,
    reimbursementRouting
  ]
})
export class ReimbursementModule { }
