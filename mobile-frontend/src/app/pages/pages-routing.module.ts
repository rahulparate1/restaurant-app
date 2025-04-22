import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// import { DefaultComponent } from "./dashboards/default/default.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { VegNonvegCardsComponent } from "./veg-nonveg-cards/veg-nonveg-cards.component";

const routes: Routes = [
  ,
  // { path: '', redirectTo: 'dashboard' },
  // { path: "dashboard", component: DefaultComponent },


  {
    path: "ai",
    loadChildren: () => import("./ai/ai.module").then((m) => m.AiModule),
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
