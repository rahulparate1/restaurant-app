import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeavesListComponent } from './leaves-list/leaves-list.component';
import { LeaveDetailsComponent } from './leave-details/leave-details.component';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component';
import { LeavesListAdminComponent } from './leaves-list-admin/leaves-list-admin.component';
import { LeaveRejectComponent } from './leave-reject/leave-reject.component';
import { LeaveApproveComponent } from './leave-approve/leave-approve.component';
import { ManagerDashboardLeaveComponent } from './manager-dashboard-leave/manager-dashboard-leave.component';
import { HRDashboardLeaveComponent } from './hr-dashboard-leave/hr-dashboard-leave.component';

const routes: Routes = [
  { path: 'apply-leave', component: ApplyLeaveComponent },
  { path: 'apply-leave/:id', component: ApplyLeaveComponent },
  { path: 'leaves-list', component: LeavesListComponent },
  { path: 'leaves-list-admin', component: LeavesListAdminComponent },
  { path: 'leave-details/:id', component: LeaveDetailsComponent },
  { path: 'leave-reject/:id', component: LeaveRejectComponent },
  { path: 'leave-approve/:id', component: LeaveApproveComponent },
  { path: 'manager-dashboard-leave', component: ManagerDashboardLeaveComponent },
  { path: 'hr-dashboard-leave', component: HRDashboardLeaveComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveManagementRoutingModule { }
