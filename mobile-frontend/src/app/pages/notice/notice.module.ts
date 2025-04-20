import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NoticeRoutingModule } from './notice-routing.module';
import { CreateNoticeComponent } from './create-notice/create-notice.component';
import { NoticeDetailsComponent } from './notice-details/notice-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbCollapseModule, NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


@NgModule({
  declarations: [
    CreateNoticeComponent,
    NoticeDetailsComponent
  ],
  imports: [
    CommonModule,
    NoticeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbPaginationModule,
    SlickCarouselModule,
    CarouselModule,
    UIModule,
    CKEditorModule,
    InfiniteScrollModule,
  ]
})
export class NoticeModule { }
