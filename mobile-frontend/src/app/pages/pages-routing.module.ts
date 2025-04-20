import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// import { DefaultComponent } from "./dashboards/default/default.component";
import { GeneralFeedComponent } from "./general-feed/general-feed.component";
import { SupportKanbanComponent } from "./support-kanban/support-kanban.component";
import { SupportTicketDetailsComponent } from "./support-ticket-details/support-ticket-details.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { VegNonvegCardsComponent } from "./veg-nonveg-cards/veg-nonveg-cards.component";

const routes: Routes = [
  ,
  // { path: '', redirectTo: 'dashboard' },
  // { path: "dashboard", component: DefaultComponent },
  {
    path: "employee",
    loadChildren: () =>
      import("./employee-management/employee-management.module").then(
        (m) => m.EmployeeManagementModule
      ),
  },

  {
    path: "ai",
    loadChildren: () => import("./ai/ai.module").then((m) => m.AiModule),
  },

  {
    path: "holiday",
    loadChildren: () =>
      import("./holiday-calendar/holiday-calendar.module").then(
        (m) => m.HolidayCalendarModule
      ),
  },
  {
    path: "calendar",
    loadChildren: () =>
      import("./leave-calendar/leave-calendar.module").then(
        (m) => m.LeaveCalendarModule
      ),
  },
  // {
  //   path: "",
  //   component: DefaultComponent,
  // },
  // { path: "dashboard", component: DefaultComponent },

  {
    path: "attendance",
    loadChildren: () =>
      import("./attendance/attendance.module").then((m) => m.AttendanceModule),
  },

  // { path: "dashboard", component: DefaultComponent },

  {
    path: "leave-management",
    loadChildren: () =>
      import("./leave-management/leave-management.module").then(
        (m) => m.LeaveManagementModule
      ),
  },

  {
    path: "shift",
    loadChildren: () =>
      import("./shift/shift.module").then((m) => m.ShiftModule),
  },

  {
    path: "newsfeed",
    loadChildren: () =>
      import("./newsfeed/newsfeed.module").then((m) => m.NewsfeedModule),
  },

  {
    path: "polls",
    loadChildren: () =>
      import("./polls/polls.module").then((m) => m.PollsModule),
  },
  {
    path: "exit-process",
    loadChildren: () =>
      import("./exit-process/exit-process.module").then(
        (m) => m.ExitProcessModule
      ),
  },
  {
    path: "general-configuration",
    loadChildren: () =>
      import("./general-configuration/general-configuration.module").then(
        (m) => m.GeneralConfigurationModule
      ),
  },
  {
    path: "event",
    loadChildren: () =>
      import("./events/events.module").then((m) => m.EventsModule),
  },

  {
    path: "company-configuration",
    loadChildren: () =>
      import("./company-configuration/company-configuration.module").then(
        (m) => m.CompanyConfigurationModule
      ),
  },
  {
    path: "reimbursement",
    loadChildren: () =>
      import("./reimbursement/reimbursement.module").then(
        (m) => m.ReimbursementModule
      ),
  },

  { path: "general-feed", component: GeneralFeedComponent },
  {
    path: "notice",
    loadChildren: () =>
      import("./notice/notice.module").then((m) => m.NoticeModule),
  },

  {
    path: "support-kanban", component: SupportKanbanComponent
  },

  {
    path: "support-ticket-details/:id", component: SupportTicketDetailsComponent
  },

  {
    path: "support-type",
    loadChildren: () =>
      import("./suppot/suppot.module").then(
        (m) => m.SuppotModule
      ),
  },

  { path: 'notifications', loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsModule) },

  {
    path: '', component: DashboardComponent
  },
  {
    path: "veg-master", loadChildren: () => import("./veg-master/veg-master.module").then((m) => m.VegMasterModule),
  },
  {
    path: "non-veg-master", loadChildren: () => import("./non-veg-master/non-veg-master.module").then((m) => m.NonVegMasterModule),
  },
  {
    path: "veg-category", loadChildren: () => import("./veg-category/veg-category.module").then((m) => m.VegCategoryModule),
  },
  {
    path: "non-veg-category", loadChildren: () => import("./non-veg-category/non-veg-category.module").then((m) => m.NonVegCategoryModule),
  },
  {
    path: 'veg-nonveg-card', component: VegNonvegCardsComponent
  },
  {
    path: "profile", loadChildren: () => import("./profile/profile.module").then((m) => m.ProfileModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
