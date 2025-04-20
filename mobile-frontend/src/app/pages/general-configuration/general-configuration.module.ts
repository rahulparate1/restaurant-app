import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CreateDepartmentComponent } from "./department/create-department/create-department.component";
import { DepartmentListComponent } from "./department/department-list/department-list.component";
import { CreateDesignationComponent } from "./designation/create-designation/create-designation.component";
import { DesignationListComponent } from "./designation/designation-list/designation-list.component";
import { CreateWorkLocationComponent } from "./work-location/create-work-location/create-work-location.component";
import { WorkLocationListComponent } from "./work-location/work-location-list/work-location-list.component";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "src/app/shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbPaginationModule,
} from "@ng-bootstrap/ng-bootstrap";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { CarouselModule } from "ngx-owl-carousel-o";
import { UIModule } from "src/app/shared/ui/ui.module";
import { IndustryListComponent } from "./industries/industry-list/industry-list.component";
import { CreateIndustryComponent } from "./industries/create-industry/create-industry.component";
import { LeaveTypeListComponent } from "./leave-type/leave-type-list/leave-type-list.component";
import { CreateLeaveTypeComponent } from "./leave-type/create-leave-type/create-leave-type.component";

const routes: Routes = [
  // for department routing
  {
    path: "department-list",
    component: DepartmentListComponent,
  },
  {
    path: "department-form",
    component: CreateDepartmentComponent,
  },
  {
    path: "department-form/:id",
    component: CreateDepartmentComponent,
  },

  //for designation routing
  {
    path: "designation-list",
    component: DesignationListComponent,
  },
  {
    path: "designation-form",
    component: CreateDesignationComponent,
  },
  {
    path: "designation-form/:id",
    component: CreateDesignationComponent,
  },

  //for work location routing
  {
    path: "work-location-list",
    component: WorkLocationListComponent,
  },
  {
    path: "work-location-form",
    component: CreateWorkLocationComponent,
  },
  {
    path: "work-location-form/:id",
    component: CreateWorkLocationComponent,
  },

  //for industry routing
  {
    path: "industry-list",
    component: IndustryListComponent,
  },
  {
    path: "industry-form",
    component: CreateIndustryComponent,
  },
  {
    path: "industry-form/:id",
    component: CreateIndustryComponent,
  },
  //for leave type routing
  {
    path: "leaveType-list",
    component: LeaveTypeListComponent,
  },
  {
    path: "leaveType-form",
    component: CreateLeaveTypeComponent,
  },
  {
    path: "leaveType-form/:id",
    component: CreateLeaveTypeComponent,
  },
];

export const generalConfigurationRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    CreateDepartmentComponent,
    DepartmentListComponent,
    CreateDesignationComponent,
    DesignationListComponent,
    CreateWorkLocationComponent,
    WorkLocationListComponent,
    IndustryListComponent,
    CreateIndustryComponent,
    LeaveTypeListComponent,
    CreateLeaveTypeComponent,
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
    generalConfigurationRouting,
  ],
})
export class GeneralConfigurationModule {}
