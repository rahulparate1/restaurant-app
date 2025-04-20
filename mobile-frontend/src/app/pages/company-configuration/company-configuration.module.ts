import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganisationDetailsFormComponent } from './organisation-details-form/organisation-details-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbCollapseModule, NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { RouterModule, Routes } from '@angular/router';
import { BrandingDetailsComponent } from './branding-details/branding-details.component';
import { PayScheduleFormComponent } from './pay-schedule-form/pay-schedule-form.component';

const routes: Routes = [
  {
    path: "company-form",
    component: OrganisationDetailsFormComponent,
  },
  {
    path: "company-form/:id",
    component: OrganisationDetailsFormComponent,
  },
  {
    path: "branding-form",
    component: BrandingDetailsComponent,
  },
  {
    path: "branding-form/:id",
    component: BrandingDetailsComponent,
  },
  {
    path: "pay-schedule-form",
    component: PayScheduleFormComponent,
  },
  {
    path: "pay-schedule-form/:id",
    component: PayScheduleFormComponent,
  },
];

export const companyConfigurationRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    OrganisationDetailsFormComponent,
    BrandingDetailsComponent,
    PayScheduleFormComponent
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
    SlickCarouselModule,
    CarouselModule,
    UIModule,
    companyConfigurationRouting
  ]
})
export class CompanyConfigurationModule { }
