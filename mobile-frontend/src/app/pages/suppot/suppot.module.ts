import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportFormComponent } from './support-form/support-form.component';
import { SupportListComponent } from './support-list/support-list.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbCollapseModule, NgbDropdownModule, NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { UIModule } from 'src/app/shared/ui/ui.module';

const routes: Routes = [
  {
    path: "list-type",
    component: SupportListComponent,
  },
  {
    path: "form-type",
    component: SupportFormComponent,
  },
  {
  path: "form-type/:id",
     component: SupportFormComponent 
  },


];
export const supportRouting = RouterModule.forChild(routes);


@NgModule({
  declarations: [
    SupportFormComponent,
    SupportListComponent
  ],
  imports: [
      CommonModule,
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        NgSelectModule,
        NgbDropdownModule,
        NgbCollapseModule,
        NgbPaginationModule,
        NgbModule,
        SlickCarouselModule,
        CarouselModule,
        UIModule,
       supportRouting
  ]
})
export class SuppotModule { }
