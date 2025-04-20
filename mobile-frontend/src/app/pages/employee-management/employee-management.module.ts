import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EmployeeListComponent } from "./employee-list/employee-list.component";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { EmployeeDetailsComponent } from "./employee-details/employee-details.component";
import {
  NgbAccordionModule,
  NgbCarouselModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbModal,
  NgbModalModule,
  NgbModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbRatingModule,
  NgbTooltipModule,
} from "@ng-bootstrap/ng-bootstrap";
import { OnboardingStepsComponent } from "./employee-onboarding/onboarding-steps/onboarding-steps.component";
import { BasicDetailsComponent } from "./employee-onboarding/basic-details/basic-details.component";
import { LeaveDetailsComponent } from "./employee-onboarding/leave-details/leave-details.component";
import { BankDetailsComponent } from "./employee-onboarding/bank-details/bank-details.component";
import { UIModule } from "src/app/shared/ui/ui.module";
import { WidgetModule } from "src/app/shared/widget/widget.module";
import { NgApexchartsModule } from "ng-apexcharts";
import { SimplebarAngularModule } from "simplebar-angular";
import { FullCalendarModule } from "@fullcalendar/angular";
import { NgStepperModule } from "angular-ng-stepper";
import { CdkStepper, CdkStepperModule } from "@angular/cdk/stepper";
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { EmployeeListViewComponent } from './employee-view-only/employee-list-view/employee-list-view.component';
import { EmployeeDetailsViewComponent } from './employee-view-only/employee-details-view/employee-details-view.component';
import { SlickCarouselModule } from "ngx-slick-carousel";
import { MyProfileComponent } from "./employee-view-only/my-profile/my-profile.component";
import { ApprovalListComponent } from './employee-view-only/approval-list/approval-list.component';
import { SharedModule } from "src/app/shared/shared.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgxPaginationModule } from "ngx-pagination";
import { ApiService } from "src/app/services/api.service";
import { ChangePasswordComponent } from "./employee-onboarding/change-password/change-password.component";


const routes: Routes = [
  {
    path: "list",
    component: EmployeeListComponent,
    canActivate: [ApiService],
  },
  {
    path: "employee-dashboard",
    component: EmployeeDashboardComponent,
    canActivate: [ApiService],
  },
  {
    path: "details/:id",
    component: EmployeeDetailsComponent,
  },
  {
    path: "", // Expecting the dynamic `id` parameter
    component: OnboardingStepsComponent,
    canActivate: [ApiService],
    children: [
      {
        path: "employee/basic-details-form",
        component: BasicDetailsComponent,
        canActivate: [ApiService],
      },
      {
        path: "employee/:id/basic-details",
        component: BasicDetailsComponent,
        canActivate: [ApiService],
      },
      {
        path: "employee/:id/leave-details",
        component: LeaveDetailsComponent,
        canActivate: [ApiService],
      },
      {
        path: "employee/:id/bank-details",
        component: BankDetailsComponent,
        canActivate: [ApiService],
      },
    ],
  },
  {
    path: "employee-view",
    component: EmployeeListViewComponent,
  },
  {
    path: "employee-details/:id",
    component: EmployeeDetailsViewComponent,
  },
  {
    path: "my-profile/:id",
    component: MyProfileComponent,
  },
  {
    path: "password",
    component: ChangePasswordComponent,
  },
  {
    path: "approval-list",
    component: ApprovalListComponent,
    canActivate: [ApiService],
  }
];

export const employeeRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    EmployeeDetailsComponent,
    EmployeeListComponent,
    OnboardingStepsComponent,
    BasicDetailsComponent,
    LeaveDetailsComponent,
    BankDetailsComponent,
    EmployeeDashboardComponent,
    EmployeeListViewComponent,
    EmployeeDetailsViewComponent,
    MyProfileComponent,
    ApprovalListComponent,
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbNavModule,
    UIModule,
    NgbAccordionModule,
    NgStepperModule,
    NgbModule,
    NgbDropdownModule,
    NgbTooltipModule,
    NgbCarouselModule,
    WidgetModule,
    NgApexchartsModule,
    SimplebarAngularModule,
    NgbDatepickerModule,
    NgbRatingModule,
    FullCalendarModule,
    CdkStepperModule,
    CdkStepper,
    SlickCarouselModule,
    SharedModule,
    NgbModule,
    NgSelectModule,
    NgbCollapseModule,
    NgxPaginationModule,
    NgbPaginationModule,
    employeeRouting,
      CommonModule,
      FormsModule,
      ReactiveFormsModule
  ]
})
export class EmployeeManagementModule {}
