import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { TabsModule } from "ngx-bootstrap/tabs";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ModalModule } from "ngx-bootstrap/modal";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { AlertModule } from "ngx-bootstrap/alert";
import { NgApexchartsModule } from "ng-apexcharts";
import { SimplebarAngularModule } from "simplebar-angular";
import { LightboxModule } from "ngx-lightbox";

import { WidgetModule } from "../shared/widget/widget.module";
import { UIModule } from "../shared/ui/ui.module";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin
import interactionPlugin from "@fullcalendar/interaction"; // a plugin
import { FullCalendarModule } from "@fullcalendar/angular";
// Emoji Picker
import { PickerModule } from "@ctrl/ngx-emoji-mart";

import { PagesRoutingModule } from "./pages-routing.module";

// import { DashboardsModule } from "./dashboards/dashboards.module";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { CdkStepper, CdkStepperModule } from "@angular/cdk/stepper";
import {
  NgbDatepickerModule,
  NgbPaginationModule,
  NgbDropdownModule,
  NgbCollapseModule,
  NgbNavModule,
} from "@ng-bootstrap/ng-bootstrap";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { DndModule } from "ngx-drag-drop";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgSelectModule } from "@ng-select/ng-select";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { VegNonvegCardsComponent } from "./veg-nonveg-cards/veg-nonveg-cards.component";
import { TabsComponent } from './tabs/tabs.component';

@NgModule({
  declarations: [
    DashboardComponent,
    VegNonvegCardsComponent,
    TabsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PagesRoutingModule,
    NgApexchartsModule,
    ReactiveFormsModule,
    // DashboardsModule,
    UIModule,
    WidgetModule,
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    AlertModule.forRoot(),
    SimplebarAngularModule,
    LightboxModule,
    CdkStepperModule,
    CdkStepper,
    PickerModule,
    InfiniteScrollModule,
    DndModule,
    DragDropModule,
    NgbNavModule,
    NgSelectModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class PagesModule {}
