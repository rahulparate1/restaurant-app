import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExitProcessRoutingModule } from './exit-process-routing.module';
import { ExitProcessFormComponent } from './exit-process-form/exit-process-form.component';
import { ExitProcessListComponent } from './exit-process-list/exit-process-list.component';
import { ExitProcessDetailsComponent } from './exit-process-details/exit-process-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbCollapseModule, NgbDropdownModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { UIModule } from 'src/app/shared/ui/ui.module';


@NgModule({
  declarations: [
    ExitProcessFormComponent,
    ExitProcessListComponent,
    ExitProcessDetailsComponent,
  ],
  imports: [
    CommonModule,
    ExitProcessRoutingModule,
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
        NgbNavModule,
        
  ]
})
export class ExitProcessModule { }
