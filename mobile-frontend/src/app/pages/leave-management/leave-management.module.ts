import { CarouselModule } from "ngx-owl-carousel-o";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { LeaveManagementRoutingModule } from "./leave-management-routing.module";
import { LeavesListComponent } from "./leaves-list/leaves-list.component";
import { LeaveDetailsComponent } from "./leave-details/leave-details.component";
import { ApplyLeaveComponent } from "./apply-leave/apply-leave.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UIModule } from "src/app/shared/ui/ui.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { LeavesListAdminComponent } from "./leaves-list-admin/leaves-list-admin.component";
import { LeaveRejectComponent } from "./leave-reject/leave-reject.component";
import { LeaveApproveComponent } from "./leave-approve/leave-approve.component";
import { ManagerDashboardLeaveComponent } from "./manager-dashboard-leave/manager-dashboard-leave.component";
import { HRDashboardLeaveComponent } from "./hr-dashboard-leave/hr-dashboard-leave.component";
import { NgApexchartsModule } from "ng-apexcharts";
import { ChartsModule } from "ng2-charts";
// import { NgxChartistModule } from 'ngx-chartist';
import { NgxEchartsModule } from "ngx-echarts";

@NgModule({
  declarations: [
    LeavesListComponent,
    LeaveDetailsComponent,
    ApplyLeaveComponent,
    LeavesListAdminComponent,
    LeaveRejectComponent,
    LeaveApproveComponent,
    ManagerDashboardLeaveComponent,
    HRDashboardLeaveComponent,
  ],
  imports: [
    CommonModule,
    LeaveManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    UIModule,
    CarouselModule,
    SlickCarouselModule,
    NgxEchartsModule,
    NgApexchartsModule,
  ],
})
export class LeaveManagementModule {}
