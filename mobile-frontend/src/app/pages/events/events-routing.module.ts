import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EventFormComponent } from "./event-form/event-form.component";
import { EventsDetailComponent } from "./events-detail/events-detail.component";
import { EventsListComponent } from "./events-list/events-list.component";

const routes: Routes = [
  {
    path: "event-form",
    component: EventFormComponent,
  },
  {
    path: "event-form/:id",
    component: EventFormComponent,
  },
  {
    path: "events-list",
    component: EventsListComponent,
  },
  {
    path: "event-details/:id",
    component: EventsDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsRoutingModule {}
