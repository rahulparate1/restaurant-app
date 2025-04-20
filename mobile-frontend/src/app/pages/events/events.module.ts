import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { EventsRoutingModule } from "./events-routing.module";
import { EventFormComponent } from "./event-form/event-form.component";
// import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { NgSelectModule } from "@ng-select/ng-select";
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbPaginationModule,
} from "@ng-bootstrap/ng-bootstrap";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { CarouselModule } from "ngx-owl-carousel-o";
import { UIModule } from "src/app/shared/ui/ui.module";
import { EventsDetailComponent } from "./events-detail/events-detail.component";
import { EventsListComponent } from "./events-list/events-list.component";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { InfiniteScrollModule } from "ngx-infinite-scroll";

@NgModule({
  declarations: [
    EventFormComponent,
    EventsDetailComponent,
    EventsListComponent,
  ],
  imports: [
    CommonModule,
    // DropzoneModule,
    FormsModule,
    ReactiveFormsModule,
    EventsRoutingModule,
    NgSelectModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbPaginationModule,
    SlickCarouselModule,
    CarouselModule,
    UIModule,
    CKEditorModule,
    InfiniteScrollModule,
  ],
})
export class EventsModule {}
